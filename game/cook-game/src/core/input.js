// Shared input layer: named actions, rebindable keyboard bindings, and the
// standard gamepad mapping. No DOM access except the keyboard listeners and
// localStorage, both guarded.

const STORAGE_KEY = 'sizzle-rush:bindings:v1';
const memoryStore = { fp: {}, arcade: {} };

export const FP_ACTIONS = {
  forward: { label: '向前', group: '移动', defaults: ['KeyW'] },
  back: { label: '向后', group: '移动', defaults: ['KeyS'] },
  left: { label: '向左', group: '移动', defaults: ['KeyA'] },
  right: { label: '向右', group: '移动', defaults: ['KeyD'] },
  sprint: { label: '冲刺', group: '动作', defaults: ['ShiftLeft', 'ShiftRight'] },
  interact: { label: '互动 / 切菜', group: '动作', defaults: ['KeyE'] },
};

export const ARCADE_ACTIONS = {
  p1Up: { label: 'P1 向上', group: 'P1', defaults: ['KeyW'] },
  p1Down: { label: 'P1 向下', group: 'P1', defaults: ['KeyS'] },
  p1Left: { label: 'P1 向左', group: 'P1', defaults: ['KeyA'] },
  p1Right: { label: 'P1 向右', group: 'P1', defaults: ['KeyD'] },
  p1Interact: { label: 'P1 互动 / 切菜', group: 'P1', defaults: ['Space'] },
  p2Up: { label: 'P2 向上', group: 'P2', defaults: ['ArrowUp'] },
  p2Down: { label: 'P2 向下', group: 'P2', defaults: ['ArrowDown'] },
  p2Left: { label: 'P2 向左', group: 'P2', defaults: ['ArrowLeft'] },
  p2Right: { label: 'P2 向右', group: 'P2', defaults: ['ArrowRight'] },
  p2Interact: { label: 'P2 互动 / 切菜', group: 'P2', defaults: ['Enter', 'NumpadEnter'] },
};

export const ACTION_SETS = { fp: FP_ACTIONS, arcade: ARCADE_ACTIONS };

const LABELS = {
  Space: '空格',
  Enter: 'Enter',
  NumpadEnter: '小键盘Enter',
  ShiftLeft: '左Shift',
  ShiftRight: '右Shift',
  ControlLeft: '左Ctrl',
  ControlRight: '右Ctrl',
  AltLeft: '左Alt',
  AltRight: '右Alt',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  Tab: 'Tab',
  CapsLock: 'Caps',
  Backspace: '⌫',
  Delete: 'Del',
  Insert: 'Ins',
  Home: 'Home',
  End: 'End',
  PageUp: 'PgUp',
  PageDown: 'PgDn',
  NumpadAdd: '小键盘+',
  NumpadSubtract: '小键盘-',
  NumpadMultiply: '小键盘*',
  NumpadDivide: '小键盘/',
  NumpadDecimal: '小键盘.',
};

/** Human-readable label for a KeyboardEvent.code. */
export function keyLabel(code) {
  if (!code) return '—';
  if (LABELS[code]) return LABELS[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return `小键盘${code.slice(6)}`;
  if (code.startsWith('F') && /^F\d{1,2}$/.test(code)) return code;
  return code;
}

function readStored() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeStored(all) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return;
    }
  } catch {
    /* ignore */
  }
  memoryStore.fp = all.fp || {};
  memoryStore.arcade = all.arcade || {};
}

const instances = new Map();

export class Bindings {
  constructor(mode) {
    if (!ACTION_SETS[mode]) throw new Error(`unknown input mode ${mode}`);
    this.mode = mode;
    this.actions = ACTION_SETS[mode];
    const stored = readStored();
    const overrides = stored?.[mode] || memoryStore[mode] || {};
    this.map = {};
    for (const [action, def] of Object.entries(this.actions)) {
      const custom = Array.isArray(overrides[action]) && overrides[action].length ? overrides[action] : null;
      this.map[action] = custom ? [...custom] : [...def.defaults];
    }
  }

  codesFor(action) {
    return this.map[action] || [];
  }

  label(action) {
    return this.codesFor(action).map(keyLabel).join(' / ') || '—';
  }

  primaryLabel(action) {
    return keyLabel(this.codesFor(action)[0]);
  }

  conflict(action, code) {
    for (const [other, codes] of Object.entries(this.map)) {
      if (other !== action && codes.includes(code)) return other;
    }
    return null;
  }

  set(action, code) {
    if (!this.actions[action]) return { ok: false, reason: 'unknown-action' };
    if (!code || code === 'Escape') return { ok: false, reason: 'reserved' };
    const conflict = this.conflict(action, code);
    if (conflict) {
      return { ok: false, reason: 'conflict', conflict, conflictLabel: this.actions[conflict].label };
    }
    this.map[action] = [code];
    this.save();
    return { ok: true };
  }

  reset(action = null) {
    if (action && this.actions[action]) this.map[action] = [...this.actions[action].defaults];
    else for (const [name, def] of Object.entries(this.actions)) this.map[name] = [...def.defaults];
    this.save();
  }

  save() {
    const all = readStored() || {};
    all[this.mode] = { ...this.map };
    writeStored(all);
  }

  rows() {
    return Object.entries(this.actions).map(([action, def]) => ({
      action,
      label: def.label,
      group: def.group,
      codes: this.codesFor(action),
      keyLabel: this.label(action),
    }));
  }
}

export function getBindings(mode) {
  if (!instances.has(mode)) instances.set(mode, new Bindings(mode));
  return instances.get(mode);
}

/** Action names bound to a physical key (for UI capture/hints). */
export function actionsForCode(bindings, code) {
  return Object.keys(bindings.actions).filter((a) => bindings.codesFor(a).includes(code));
}

// ---------------------------------------------------------------------------
// Keyboard
// ---------------------------------------------------------------------------

export class KeyboardInput {
  constructor(bindings, { onDevice = null, preventCodes = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] } = {}) {
    this.bindings = bindings;
    this.onDevice = onDevice;
    this.preventCodes = new Set(preventCodes);
    this.enabled = true;
    this.down = new Set();
    this.just = new Set();
    this.framePressed = new Set();
    this._bind();
  }

  _bind() {
    this._onKeyDown = (e) => {
      if (!this.enabled) return;
      if (this.preventCodes.has(e.code)) e.preventDefault();
      this.onDevice?.('keyboard');
      this.down.add(e.code);
      if (!e.repeat) this.just.add(e.code);
    };
    this._onKeyUp = (e) => this.down.delete(e.code);
    this._onBlur = () => {
      this.down.clear();
      this.just.clear();
      this.framePressed.clear();
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
  }

  beginFrame() {
    this.framePressed.clear();
    for (const code of this.just) {
      for (const action of Object.keys(this.bindings.actions)) {
        if (this.bindings.codesFor(action).includes(code)) this.framePressed.add(action);
      }
    }
    this.just.clear();
  }

  isDown(action) {
    if (!this.enabled) return false;
    return this.bindings.codesFor(action).some((c) => this.down.has(c));
  }

  pressed(action) {
    return this.framePressed.has(action);
  }

  setEnabled(v) {
    this.enabled = v;
    if (!v) this.clear();
  }

  clear() {
    this.down.clear();
    this.just.clear();
    this.framePressed.clear();
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
  }
}

// ---------------------------------------------------------------------------
// Gamepad (standard mapping)
// ---------------------------------------------------------------------------

export function applyDeadzone(x, y, deadzone = 0.18) {
  const mag = Math.hypot(x, y);
  if (mag < deadzone) return { x: 0, y: 0, mag: 0 };
  const scaled = Math.min(1, (mag - deadzone) / (1 - deadzone));
  return { x: (x / mag) * scaled, y: (y / mag) * scaled, mag: scaled };
}

const button = (pad, i) => {
  const b = pad?.buttons?.[i];
  if (!b) return 0;
  return typeof b === 'number' ? b : b.value || (b.pressed ? 1 : 0);
};

/** Pure standard-gamepad -> abstract state. */
export function readPad(pad) {
  if (!pad || !pad.connected) return null;
  const axes = pad.axes || [];
  const move = applyDeadzone(axes[0] || 0, axes[1] || 0);
  const look = applyDeadzone(axes[2] || 0, axes[3] || 0);
  let mx = move.x;
  let my = move.y;
  if (Math.abs(mx) < 0.01 && Math.abs(my) < 0.01) {
    mx = (button(pad, 15) ? 1 : 0) - (button(pad, 14) ? 1 : 0);
    my = (button(pad, 13) ? 1 : 0) - (button(pad, 12) ? 1 : 0);
  }
  return {
    connected: true,
    id: pad.id || '',
    moveX: mx,
    moveY: my,
    lookX: look.x,
    lookY: look.y,
    interact: button(pad, 0) > 0.4,
    chop: button(pad, 2) > 0.4 || button(pad, 5) > 0.4,
    sprint: button(pad, 7) > 0.4 || button(pad, 10) > 0.4,
    pause: button(pad, 9) > 0.4,
    active: move.mag > 0.15 || look.mag > 0.15 || Array.from(pad.buttons || []).some((b) => (typeof b === 'number' ? b > 0.4 : b.pressed)),
  };
}

const emptyPadState = {
  connected: false,
  moveX: 0,
  moveY: 0,
  lookX: 0,
  lookY: 0,
  interact: false,
  chop: false,
  sprint: false,
  pause: false,
  active: false,
};

export class GamepadInput {
  constructor({ index = 0, onDevice = null } = {}) {
    this.index = index;
    this.onDevice = onDevice;
    this.state = { ...emptyPadState };
    this.prev = { ...emptyPadState };
    this._wasActive = false;
  }

  _pickPad(pads) {
    if (!pads) return null;
    const own = pads[this.index];
    if (own?.connected) return own;
    if (this.index === 0) return Array.from(pads).find((p) => p?.connected) || null;
    return null;
  }

  poll(padOverride = undefined) {
    let pad = padOverride;
    if (pad === undefined) {
      try {
        pad = this._pickPad(navigator.getGamepads ? navigator.getGamepads() : null);
      } catch {
        pad = null;
      }
    }
    this.prev = this.state;
    this.state = readPad(pad) || { ...emptyPadState };
    if (this.state.active && !this._wasActive) this.onDevice?.('gamepad');
    this._wasActive = this.state.active;
    return this.state;
  }

  get connected() {
    return this.state.connected;
  }

  get pressedInteract() {
    return this.state.interact && !this.prev.interact;
  }

  get pressedPause() {
    return this.state.pause && !this.prev.pause;
  }

  get chopHeld() {
    return this.state.chop || this.state.interact;
  }

  get sprintHeld() {
    return this.state.sprint;
  }

  get move() {
    return { x: this.state.moveX, y: this.state.moveY };
  }

  get look() {
    return { x: this.state.lookX, y: this.state.lookY };
  }
}
