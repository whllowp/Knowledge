// First-person controller: pointer-lock look, acceleration, capsule-vs-box
// collision and head-bob. Simulation stays on the XZ plane (no jumping in a
// kitchen — the floor is sacred).

import * as THREE from 'three';
import { COLLIDERS, ROOM, SPAWN } from '../core/data.js';
import { getBindings, KeyboardInput, GamepadInput } from '../core/input.js';

const EYE = 1.62;
const WALK = 3.05;
const RUN = 4.75;
const RADIUS = 0.31;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class FPControls {
  constructor({ camera, canvas, settings, onFootstep, onPointerLockLost, canLock, onPauseRequest, onDeviceChange }) {
    this.camera = camera;
    this.canvas = canvas;
    this.settings = settings;
    this.onFootstep = onFootstep;
    this.onPointerLockLost = onPointerLockLost;
    this.canLock = canLock;
    this.onPauseRequest = onPauseRequest;
    this.onDeviceChange = onDeviceChange;
    this.bindings = getBindings('fp');
    this.inputDevice = 'keyboard';

    this.yaw = SPAWN.yaw;
    this.pitch = -0.06;
    this.pos = new THREE.Vector3(SPAWN.x, EYE, SPAWN.z);
    this.vel = new THREE.Vector3();
    this.interactQueued = false;
    this.mouseDown = false;
    this.locked = false;
    this.wasLocked = false;
    this.dragging = false;
    this.dragLast = { x: 0, y: 0 };
    this.enabled = true;
    this.bobPhase = 0;
    this.stepAccum = 0;
    this.fov = settings.fov || 74;
    this.fovTarget = this.fov;
    this.trauma = 0;

    this.keyboard = new KeyboardInput(this.bindings, {
      onDevice: (device) => this._setDevice(device),
    });
    this.gamepad = new GamepadInput({
      index: 0,
      onDevice: (device) => this._setDevice(device),
    });

    this._ignoreLockLoss = false;
    this._bind();
    this._applyCamera(0);
  }

  _setDevice(device) {
    if (this.inputDevice === device) return;
    this.inputDevice = device;
    this.onDeviceChange?.(device);
  }

  _bind() {
    this._onMouseMove = (e) => {
      if (!this.enabled) return;
      const s = 0.0021 * (this.settings.sensitivity || 1);
      if (this.locked) {
        this.yaw -= e.movementX * s;
        const invert = this.settings.invertY ? -1 : 1;
        this.pitch -= e.movementY * s * invert;
        this.pitch = clamp(this.pitch, -1.45, 1.45);
      } else if (this.dragging) {
        // Fallback for environments where pointer lock is unavailable.
        const dx = e.clientX - this.dragLast.x;
        const dy = e.clientY - this.dragLast.y;
        this.dragLast.x = e.clientX;
        this.dragLast.y = e.clientY;
        this.yaw -= dx * s * 0.8;
        const invert = this.settings.invertY ? -1 : 1;
        this.pitch -= dy * s * 0.8 * invert;
        this.pitch = clamp(this.pitch, -1.45, 1.45);
      }
    };
    this._onMouseDown = (e) => {
      if (e.button !== 0) return;
      if (this.locked) {
        this.mouseDown = true;
        return;
      }
      if (this.enabled && e.target === this.canvas) {
        this.dragging = true;
        this.dragLast.x = e.clientX;
        this.dragLast.y = e.clientY;
      }
    };
    this._onMouseUp = (e) => {
      if (e.button === 0) {
        this.mouseDown = false;
        this.dragging = false;
      }
    };
    this._onLockChange = () => {
      const locked = document.pointerLockElement === this.canvas;
      this.locked = locked;
      if (locked) {
        this.wasLocked = true;
      } else if (this.wasLocked && !this._ignoreLockLoss) {
        this.wasLocked = false;
        this.mouseDown = false;
        this.keyboard.clear();
        this.onPointerLockLost?.();
      }
      this._ignoreLockLoss = false;
    };
    this._onCanvasClick = () => {
      if (!this.enabled || this.locked) return;
      if (this.canLock && !this.canLock()) return;
      this.requestLock();
    };
    this._onBlur = () => {
      this.keyboard.clear();
      this.mouseDown = false;
      this.dragging = false;
    };
    this._onContextMenu = (e) => e.preventDefault();

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('pointerlockchange', this._onLockChange);
    this.canvas.addEventListener('click', this._onCanvasClick);
    this.canvas.addEventListener('contextmenu', this._onContextMenu);
    window.addEventListener('blur', this._onBlur);
  }

  requestLock() {
    try {
      const p = this.canvas.requestPointerLock?.({ unadjustedMovement: false });
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
      /* pointer lock may be unavailable (headless/screenshot) */
    }
  }

  exitLock() {
    this._ignoreLockLoss = true;
    this.mouseDown = false;
    this.keyboard.clear();
    try {
      document.exitPointerLock?.();
    } catch {
      /* ignore */
    }
    this.locked = false;
    this.wasLocked = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.keyboard.setEnabled(enabled);
    if (!enabled) {
      this.mouseDown = false;
      this.gamepad.state = { ...this.gamepad.state, interact: false, chop: false, pause: false };
      this.gamepad.prev = { ...this.gamepad.prev, interact: false, chop: false, pause: false };
    }
  }

  get isMoving() {
    return this.vel.lengthSq() > 0.2;
  }

  consumeInteract() {
    const v = this.interactQueued || this.keyboard.pressed('interact') || this.gamepad.pressedInteract;
    this.interactQueued = false;
    return v;
  }

  get chopHeld() {
    return (
      this.enabled &&
      (this.keyboard.isDown('interact') || this.mouseDown || this.gamepad.chopHeld)
    );
  }

  forwardVector(out = new THREE.Vector3()) {
    const cp = Math.cos(this.pitch);
    out.set(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp);
    return out;
  }

  addTrauma(amount) {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  update(dt, shake = null) {
    if (!this.enabled) {
      this._applyCamera(dt, shake);
      return;
    }
    this.keyboard.beginFrame();
    this.gamepad.poll();
    if (this.gamepad.pressedPause) this.onPauseRequest?.();

    const clampPitch = (v) => clamp(v, -1.45, 1.45);
    const look = this.gamepad.look;
    if (look.x || look.y) {
      const s = (this.settings.sensitivity || 1) * dt;
      this.yaw -= look.x * 2.4 * s;
      const invert = this.settings.invertY ? -1 : 1;
      this.pitch = clampPitch(this.pitch - look.y * 1.8 * s * invert);
    }

    const f = (this.keyboard.isDown('forward') ? 1 : 0) - (this.keyboard.isDown('back') ? 1 : 0);
    const r = (this.keyboard.isDown('right') ? 1 : 0) - (this.keyboard.isDown('left') ? 1 : 0);
    const gpMove = this.gamepad.move;
    const gpMag = Math.hypot(gpMove.x, gpMove.y);
    let ix = 0;
    let iz = 0;
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    if (gpMag > 0.12) {
      // Stick: x = right, y = down. Forward = -y.
      const f2 = -gpMove.y;
      const r2 = gpMove.x;
      ix = -sin * f2 + cos * r2;
      iz = -cos * f2 - sin * r2;
    } else if (f || r) {
      // forward = (-sin, -cos); right = (cos, -sin)
      ix = -sin * f + cos * r;
      iz = -cos * f - sin * r;
    }
    const len = Math.hypot(ix, iz);
    if (len > 0) {
      ix /= len;
      iz /= len;
    }
    const sprint = this.keyboard.isDown('sprint') || this.gamepad.sprintHeld;
    const speed = (sprint ? RUN : WALK) * (len > 0 ? 1 : 0);
    const k = 1 - Math.exp(-13 * dt);
    this.vel.x += (ix * speed - this.vel.x) * k;
    this.vel.z += (iz * speed - this.vel.z) * k;
    if (Math.abs(this.vel.x) < 0.01) this.vel.x = 0;
    if (Math.abs(this.vel.z) < 0.01) this.vel.z = 0;

    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    this._resolveCollisions();

    const moving = Math.hypot(this.vel.x, this.vel.z);
    if (moving > 0.4) {
      this.bobPhase += dt * (sprint ? 11.5 : 8.6);
      this.stepAccum += moving * dt;
      if (this.stepAccum > 1.9) {
        this.stepAccum = 0;
        this.onFootstep?.();
      }
    }
    this.fovTarget = (this.settings.fov || 74) + (sprint && moving > 2.5 ? 4.5 : 0);
    this._applyCamera(dt, shake, moving);
  }

  _resolveCollisions() {
    const bounds = {
      minX: ROOM.minX + RADIUS,
      maxX: ROOM.maxX - RADIUS,
      minZ: ROOM.minZ + RADIUS,
      maxZ: ROOM.maxZ - RADIUS,
    };
    this.pos.x = clamp(this.pos.x, bounds.minX, bounds.maxX);
    this.pos.z = clamp(this.pos.z, bounds.minZ, bounds.maxZ);

    for (let pass = 0; pass < 2; pass++) {
      for (const c of COLLIDERS) {
        const cx = clamp(this.pos.x, c.minX, c.maxX);
        const cz = clamp(this.pos.z, c.minZ, c.maxZ);
        let dx = this.pos.x - cx;
        let dz = this.pos.z - cz;
        let d2 = dx * dx + dz * dz;
        if (d2 >= RADIUS * RADIUS) continue;
        if (d2 < 1e-8) {
          // Centre is inside the box: push out along the shallowest axis.
          const toLeft = this.pos.x - c.minX;
          const toRight = c.maxX - this.pos.x;
          const toBack = this.pos.z - c.minZ;
          const toFront = c.maxZ - this.pos.z;
          const min = Math.min(toLeft, toRight, toBack, toFront);
          if (min === toLeft) this.pos.x = c.minX - RADIUS;
          else if (min === toRight) this.pos.x = c.maxX + RADIUS;
          else if (min === toBack) this.pos.z = c.minZ - RADIUS;
          else this.pos.z = c.maxZ + RADIUS;
          continue;
        }
        const d = Math.sqrt(d2);
        const push = (RADIUS - d) / d;
        this.pos.x += dx * push;
        this.pos.z += dz * push;
      }
    }
  }

  _applyCamera(dt, shake = null, moving = 0) {
    const speedF = clamp(moving / RUN, 0, 1);
    const bobY = Math.sin(this.bobPhase * 2) * 0.026 * speedF;
    const bobRoll = Math.sin(this.bobPhase) * 0.009 * speedF;

    if (this.trauma > 0) this.trauma = Math.max(0, this.trauma - dt * 1.8);
    const shakeAmt = this.trauma * this.trauma;
    const sx = (shake?.x || 0) + Math.sin(this.bobPhase * 2.3 + 1) * 0.012 * shakeAmt;
    const sy = (shake?.y || 0) + Math.sin(this.bobPhase * 1.7) * 0.012 * shakeAmt;
    const sr = (shake?.roll || 0) + bobRoll + Math.sin(this.bobPhase * 1.3) * 0.02 * shakeAmt;

    this.camera.position.set(this.pos.x, EYE + bobY, this.pos.z);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(this.pitch + sx, this.yaw + sy, sr);

    const targetFov = this.fovTarget;
    this.fov += (targetFov - this.fov) * (1 - Math.exp(-8 * (dt || 0.016)));
    if (Math.abs(this.camera.fov - this.fov) > 0.01) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
  }

  applySettings(settings) {
    this.settings = settings;
    this.fovTarget = settings.fov || 74;
  }

  teleport(x, z, yaw = this.yaw) {
    this.pos.x = x;
    this.pos.z = z;
    this.vel.set(0, 0, 0);
    this.yaw = yaw;
    this._applyCamera(0);
  }

  lookAt(x, z) {
    this.yaw = Math.atan2(-(x - this.pos.x), -(z - this.pos.z));
    this.pitch = -0.12;
    this._applyCamera(0);
  }

  dispose() {
    this.keyboard.dispose();
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('pointerlockchange', this._onLockChange);
    this.canvas.removeEventListener('click', this._onCanvasClick);
    this.canvas.removeEventListener('contextmenu', this._onContextMenu);
    window.removeEventListener('blur', this._onBlur);
    this.exitLock();
  }
}
