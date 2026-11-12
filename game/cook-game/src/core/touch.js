// Touch controls for the 2D arcade mode (one virtual stick + one action button).
// Kept separate from the canvas so it is testable with synthetic pointer events
// and does not change the desktop layout.

export function isTouchDevice() {
  if (typeof navigator === 'undefined') return false;
  if ((navigator.maxTouchPoints || 0) > 0) return true;
  try {
    return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class TouchControls {
  constructor({ onPause = null, onDevice = null } = {}) {
    this.root = document.getElementById('touch-controls');
    this.stick = document.getElementById('touch-stick');
    this.knob = document.getElementById('touch-knob');
    this.action = document.getElementById('touch-action');
    this.pause = document.getElementById('touch-pause');
    this.onPause = onPause;
    this.onDevice = onDevice;

    this.enabled = false;
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.mag = 0;
    this.interactHeld = false;
    this.pressedInteract = false;

    this._stickId = null;
    this._actionId = null;
    this._cx = 0;
    this._cy = 0;
    this._max = 46;
    this._bind();
  }

  _bind() {
    if (!this.stick || !this.action) return;
    this._onStickDown = (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      this.onDevice?.('touch');
      this._stickId = e.pointerId;
      try {
        this.stick.setPointerCapture(e.pointerId);
      } catch {
        /* synthetic pointers */
      }
      const r = this.stick.getBoundingClientRect();
      this._cx = r.left + r.width / 2;
      this._cy = r.top + r.height / 2;
      this._max = Math.max(24, r.width * 0.34);
      this.active = true;
      this._moveStick(e);
    };
    this._onStickMove = (e) => {
      if (e.pointerId !== this._stickId) return;
      e.preventDefault();
      this._moveStick(e);
    };
    this._onStickUp = (e) => {
      if (e.pointerId !== this._stickId) return;
      this._resetStick();
    };
    this._onActionDown = (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      this.onDevice?.('touch');
      this._actionId = e.pointerId;
      try {
        this.action.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      this.interactHeld = true;
      this.pressedInteract = true;
      this.action.classList.add('held');
    };
    this._onActionUp = (e) => {
      if (e.pointerId !== this._actionId) return;
      this._actionId = null;
      this.interactHeld = false;
      this.action.classList.remove('held');
    };
    this._onPause = (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      this.onPause?.();
    };

    this.stick.addEventListener('pointerdown', this._onStickDown);
    this.stick.addEventListener('pointermove', this._onStickMove);
    this.stick.addEventListener('pointerup', this._onStickUp);
    this.stick.addEventListener('pointercancel', this._onStickUp);
    this.action.addEventListener('pointerdown', this._onActionDown);
    this.action.addEventListener('pointerup', this._onActionUp);
    this.action.addEventListener('pointercancel', this._onActionUp);
    this.pause?.addEventListener('pointerdown', this._onPause);
    window.addEventListener('pointerup', this._onStickUp);
    window.addEventListener('pointerup', this._onActionUp);
    window.addEventListener('pointercancel', this._onStickUp);
    window.addEventListener('pointercancel', this._onActionUp);
  }

  _moveStick(e) {
    const dx = e.clientX - this._cx;
    const dy = e.clientY - this._cy;
    const dist = Math.hypot(dx, dy);
    const k = dist > this._max ? this._max / dist : 1;
    const kx = dx * k;
    const ky = dy * k;
    this.x = kx / this._max;
    this.y = ky / this._max;
    this.mag = clamp(dist / this._max, 0, 1);
    if (this.knob) this.knob.style.transform = `translate(${kx}px, ${ky}px)`;
  }

  _resetStick() {
    this._stickId = null;
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.mag = 0;
    if (this.knob) this.knob.style.transform = 'translate(0px, 0px)';
  }

  beginFrame() {
    // Edge state is produced by pointerdown and consumed during this frame.
  }

  endFrame() {
    this.pressedInteract = false;
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
    this.root?.classList.toggle('hidden', !this.enabled);
    document.body?.classList.toggle('touch-mode', this.enabled);
    if (!this.enabled) {
      this._resetStick();
      this._actionId = null;
      this.interactHeld = false;
      this.pressedInteract = false;
      this.action?.classList.remove('held');
    }
  }

  dispose() {
    this.setEnabled(false);
    if (!this.stick || !this.action) return;
    this.stick.removeEventListener('pointerdown', this._onStickDown);
    this.stick.removeEventListener('pointermove', this._onStickMove);
    this.stick.removeEventListener('pointerup', this._onStickUp);
    this.stick.removeEventListener('pointercancel', this._onStickUp);
    this.action.removeEventListener('pointerdown', this._onActionDown);
    this.action.removeEventListener('pointerup', this._onActionUp);
    this.action.removeEventListener('pointercancel', this._onActionUp);
    this.pause?.removeEventListener('pointerdown', this._onPause);
    window.removeEventListener('pointerup', this._onStickUp);
    window.removeEventListener('pointerup', this._onActionUp);
    window.removeEventListener('pointercancel', this._onStickUp);
    window.removeEventListener('pointercancel', this._onActionUp);
  }
}
