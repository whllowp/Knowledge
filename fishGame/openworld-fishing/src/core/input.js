/**
 * input.js — keyboard, mouse and pointer-lock handling.
 *
 * The Input instance collects raw device state and exposes edge-triggered
 * queries (`justPressed`) that are cleared once per frame by `endFrame()`.
 */
import { Emitter } from './util.js';

export const DEFAULT_BINDINGS = {
  forward: ['KeyW', 'ArrowUp'],
  back: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  jump: ['Space'],
  sprint: ['ShiftLeft', 'ShiftRight'],
  interact: ['KeyF'],
  viewToggle: ['KeyV'],
  inventory: ['Tab'],
  map: ['KeyM'],
  reel: ['KeyR'],
  pause: ['Escape'],
  slot1: ['Digit1'],
  slot2: ['Digit2'],
  slot3: ['Digit3'],
  reelAlt: ['KeyE'],
  boat: ['KeyB'],
  cook: ['KeyC'],
  contest: ['KeyK'],
  dragDown: ['KeyZ'],
  dragUp: ['KeyX'],
  seaTrip: ['KeyT'],
  summon: ['KeyG'],
  eat: ['KeyH'],
  sleep: ['KeyJ'],
  dive: ['ControlLeft'],
  mapZoom: ['KeyN'],
  photo: ['KeyP'],
};

export class Input extends Emitter {
  constructor(domElement = document.body, opts = {}) {
    super();
    this.dom = domElement;
    this.bindings = { ...DEFAULT_BINDINGS, ...(opts.bindings || {}) };
    this.sensitivity = opts.sensitivity ?? 1;
    this.invertY = !!opts.invertY;
    this.enabled = true;

    this.keys = new Set();
    this._pressed = new Set();
    this._released = new Set();
    this._repeatGuard = new Set();

    this.mouse = {
      dx: 0,
      dy: 0,
      wheel: 0,
      left: false,
      right: false,
      middle: false,
      leftPressed: false,
      leftReleased: false,
      rightPressed: false,
      rightReleased: false,
      x: 0,
      y: 0,
    };

    this.pointerLocked = false;
    this._bound = [];
    this._attach();
  }

  _on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    this._bound.push([target, type, fn, opts]);
  }

  _attach() {
    const dom = this.dom;

    this._on(window, 'keydown', (e) => {
      if (!this.enabled) return;
      // Let the browser handle devtools / reload shortcuts.
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.repeat) return;
      if (!this.keys.has(e.code)) this._pressed.add(e.code);
      this.keys.add(e.code);
      const block = ['Space', 'Tab', 'KeyF', 'KeyV', 'KeyM', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (block.includes(e.code)) e.preventDefault();
      this.emit('key', e.code);
    });

    this._on(window, 'keyup', (e) => {
      this.keys.delete(e.code);
      this._released.add(e.code);
    });

    this._on(window, 'blur', () => this.releaseAll());

    this._on(dom, 'mousemove', (e) => {
      if (!this.enabled) return;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      // pointer lock gives raw deltas; without it, a held right-button drags
      // the view (v4.4.0 fallback for browsers that deny the lock)
      if (this.pointerLocked || this.mouse.right) {
        this.mouse.dx += e.movementX || 0;
        this.mouse.dy += e.movementY || 0;
      }
    });

    this._on(dom, 'mousedown', (e) => {
      if (!this.enabled) return;
      if (e.button === 0) {
        if (!this.mouse.left) this.mouse.leftPressed = true;
        this.mouse.left = true;
      } else if (e.button === 2) {
        if (!this.mouse.right) this.mouse.rightPressed = true;
        this.mouse.right = true;
      } else if (e.button === 1) {
        this.mouse.middle = true;
      }
      this.emit('mousedown', e.button);
    });

    this._on(window, 'mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.left = false;
        this.mouse.leftReleased = true;
      } else if (e.button === 2) {
        this.mouse.right = false;
        this.mouse.rightReleased = true;
      } else if (e.button === 1) {
        this.mouse.middle = false;
      }
      this.emit('mouseup', e.button);
    });

    this._on(dom, 'wheel', (e) => {
      if (!this.enabled) return;
      this.mouse.wheel += Math.sign(e.deltaY);
      e.preventDefault();
    }, { passive: false });

    this._on(dom, 'contextmenu', (e) => e.preventDefault());

    this._on(document, 'pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === dom;
      this.emit(this.pointerLocked ? 'lock' : 'unlock');
    });

    this._on(document, 'pointerlockerror', () => {
      this.pointerLocked = false;
      this.emit('lockerror');
    });
  }

  /** Ask the browser to capture the pointer (must be called from a user gesture). */
  requestLock() {
    if (this.pointerLocked) return;
    const fn = this.dom.requestPointerLock;
    if (typeof fn !== 'function') return;
    try {
      const p = fn.call(this.dom, { unadjustedMovement: false });
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
      /* ignored — some browsers reject when not focused */
    }
  }

  exitLock() {
    if (this.pointerLocked && document.exitPointerLock) document.exitPointerLock();
  }

  releaseAll() {
    for (const k of this.keys) this._released.add(k);
    this.keys.clear();
    this.mouse.left = this.mouse.right = this.mouse.middle = false;
  }

  isDown(code) {
    return this.keys.has(code);
  }

  /** True for any of the keys bound to an action. */
  action(name) {
    const list = this.bindings[name];
    if (!list) return false;
    for (const k of list) if (this.keys.has(k)) return true;
    return false;
  }

  actionPressed(name) {
    const list = this.bindings[name];
    if (!list) return false;
    for (const k of list) if (this._pressed.has(k)) return true;
    return false;
  }

  justPressed(code) {
    return this._pressed.has(code);
  }

  justReleased(code) {
    return this._released.has(code);
  }

  /** Normalised WASD move vector: x = strafe right, z = forward. */
  moveVector() {
    let x = 0;
    let z = 0;
    if (this.action('forward')) z += 1;
    if (this.action('back')) z -= 1;
    if (this.action('right')) x += 1;
    if (this.action('left')) x -= 1;
    const len = Math.hypot(x, z);
    if (len > 1) {
      x /= len;
      z /= len;
    }
    return { x, z, len: Math.min(1, len) };
  }

  /** Consume accumulated pointer delta (already scaled by sensitivity). */
  takeLook() {
    const s = this.sensitivity;
    const out = { dx: this.mouse.dx * s, dy: this.mouse.dy * s * (this.invertY ? -1 : 1) };
    this.mouse.dx = 0;
    this.mouse.dy = 0;
    return out;
  }

  /** True when the player is dragging the view because the lock is unavailable. */
  get dragging() {
    return !this.pointerLocked && this.mouse.right;
  }

  takeWheel() {
    const w = this.mouse.wheel;
    this.mouse.wheel = 0;
    return w;
  }

  endFrame() {
    this._pressed.clear();
    this._released.clear();
    this.mouse.leftPressed = false;
    this.mouse.leftReleased = false;
    this.mouse.rightPressed = false;
    this.mouse.rightReleased = false;
    this.mouse.dx = 0;
    this.mouse.dy = 0;
  }

  dispose() {
    for (const [t, type, fn, opts] of this._bound) t.removeEventListener(type, fn, opts);
    this._bound.length = 0;
    this.clear();
  }
}
