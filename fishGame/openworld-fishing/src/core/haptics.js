/**
 * haptics.js — gamepad rumble, used for bite/hook/run/snap feedback.
 *
 * v2.0.0. Wraps the Gamepad API so the rest of the game can "pulse" without
 * caring whether a controller is connected, whether the browser supports
 * dual-rumble, or whether the player turned haptics off.
 *
 * Patterns are short, decaying envelopes driven by `update(dt)` so they never
 * depend on setTimeout (which stalls when the tab is throttled).
 */
import { clamp, clamp01 } from './util.js';

export const PATTERNS = {
  bite: { dur: 0.22, low: 0.55, high: 0.25, decay: 2.4 },
  nibble: { dur: 0.1, low: 0.22, high: 0.08, decay: 3.2 },
  hook: { dur: 0.3, low: 0.85, high: 0.5, decay: 3.0 },
  run: { dur: 0.55, low: 0.9, high: 0.35, decay: 1.6 },
  drag: { dur: 0.16, low: 0.45, high: 0.7, decay: 3.4 },
  snap: { dur: 0.5, low: 1.0, high: 1.0, decay: 2.2 },
  catch: { dur: 0.45, low: 0.6, high: 0.85, decay: 1.8 },
  cast: { dur: 0.18, low: 0.4, high: 0.15, decay: 3.0 },
  splash: { dur: 0.2, low: 0.3, high: 0.5, decay: 3.0 },
  step: { dur: 0.08, low: 0.14, high: 0.05, decay: 4.0 },
  levelup: { dur: 0.6, low: 0.5, high: 0.9, decay: 1.2 },
};

export class Haptics {
  constructor(opts = {}) {
    this.enabled = opts.enabled !== false;
    this.intensity = clamp(opts.intensity ?? 1, 0, 2);
    this._active = [];
    this._lastVibrate = 0;
    this.supported = typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function';
    this._hasPad = false;
    this._padPollTimer = 0;
  }

  setEnabled(on) {
    this.enabled = !!on;
    if (!this.enabled) {
      this._active.length = 0;
      this.stop();
    }
  }

  setIntensity(v) {
    this.intensity = clamp(v, 0, 2);
  }

  /** Fire a named pattern (see PATTERNS), or a custom one. */
  pulse(name, strength = 1, opts = {}) {
    if (!this.enabled) return false;
    const p = typeof name === 'string' ? PATTERNS[name] : name;
    if (!p) return false;
    const k = clamp01(strength) * this.intensity * (opts.scale ?? 1);
    if (k <= 0.01) return false;
    this._active.push({
      t: 0,
      dur: p.dur * (opts.durScale ?? 1),
      low: clamp01(p.low * k),
      high: clamp01(p.high * k),
      decay: p.decay,
    });
    if (this._active.length > 6) this._active.shift();
    return true;
  }

  /** Continuous rumble while `on` (e.g. the drag screaming out). */
  setContinuous(on, low = 0.5, high = 0.45) {
    this._continuous = on ? { low: clamp01(low * this.intensity), high: clamp01(high * this.intensity) } : null;
    if (!on) this._continuous = null;
  }

  /** Legacy whole-device vibration where available (mobile). */
  buzz(ms = 30) {
    if (!this.enabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(ms);
      } catch {
        /* ignore */
      }
    }
  }

  update(dt) {
    if (!this.enabled) return;
    // decay the pulse queue
    for (let i = this._active.length - 1; i >= 0; i--) {
      const a = this._active[i];
      a.t += dt;
      if (a.t >= a.dur) this._active.splice(i, 1);
    }

    let low = 0;
    let high = 0;
    for (const a of this._active) {
      const k = Math.exp(-a.t * a.decay) * (1 - clamp01(a.t / a.dur));
      low = Math.max(low, a.low * k);
      high = Math.max(high, a.high * k);
    }
    if (this._continuous) {
      low = Math.max(low, this._continuous.low);
      high = Math.max(high, this._continuous.high);
    }
    this._outLow = low;
    this._outHigh = high;

    // only touch the hardware a few times a second; the browser's rumble
    // actuators hold the value until changed
    this._padPollTimer += dt;
    if (this._padPollTimer < 0.05) return;
    this._padPollTimer = 0;
    this._apply(low, high);
  }

  _apply(low, high) {
    if (!this.supported) return;
    let pads;
    try {
      pads = navigator.getGamepads();
    } catch {
      return;
    }
    if (!pads) return;
    this._hasPad = false;
    for (const pad of pads) {
      if (!pad || !pad.connected) continue;
      this._hasPad = true;
      const act = pad.vibrationActuator;
      if (!act) continue;
      if (Math.abs(low - (this._prevLow || 0)) < 0.02 && Math.abs(high - (this._prevHigh || 0)) < 0.02) continue;
      try {
        if (typeof act.playEffect === 'function') {
          const type = act.type === 'vibration' ? 'vibration' : 'dual-rumble';
          act
            .playEffect(type, {
              startDelay: 0,
              duration: 200,
              weakMagnitude: clamp01(high),
              strongMagnitude: clamp01(low),
            })
            .catch?.(() => {});
        } else if (typeof act.pulse === 'function') {
          act.pulse(low, 120);
        }
      } catch {
        /* unsupported effect */
      }
    }
    this._prevLow = low;
    this._prevHigh = high;
  }

  stop() {
    this._active.length = 0;
    this._continuous = null;
    this._apply(0, 0);
  }

  get state() {
    return { enabled: this.enabled, hasPad: this._hasPad, low: this._outLow || 0, high: this._outHigh || 0 };
  }

  dispose() {
    this.stop();
    this.enabled = false;
  }
}
