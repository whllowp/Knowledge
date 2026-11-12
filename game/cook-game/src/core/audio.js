// Tiny WebAudio engine: synthesized SFX + a layered, adaptive kitchen groove.
// No external audio files — everything is generated at runtime.

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class AudioEngine {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.noise = null;
    this.muted = false;
    this.started = false;
    this.intensity = 0.15;
    this._musicTimer = null;
    this._step = 0;
    this._nextStepTime = 0;
    this._sizzle = null;
    this._bpm = 104;
    this._stepDur = 60 / this._bpm / 4;
  }

  get available() {
    return typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);
  }

  _ensure() {
    if (this.ctx) return true;
    if (!this.available) return false;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      this.ctx = ctx;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 20;
      comp.ratio.value = 5;
      comp.attack.value = 0.004;
      comp.release.value = 0.22;
      comp.connect(ctx.destination);

      this.master = ctx.createGain();
      this.master.connect(comp);
      this.musicBus = ctx.createGain();
      this.musicBus.connect(this.master);
      this.sfxBus = ctx.createGain();
      this.sfxBus.connect(this.master);

      const len = Math.floor(ctx.sampleRate * 1.2);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buf;

      this._applyVolumes();
      return true;
    } catch {
      this.ctx = null;
      return false;
    }
  }

  unlock() {
    if (!this._ensure()) return false;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    if (!this.started) {
      this.started = true;
      this._startSizzle();
    }
    return true;
  }

  setSettings(settings) {
    this.settings = settings;
    this._applyVolumes();
  }

  setMuted(muted) {
    this.muted = muted;
    this._applyVolumes();
  }

  _applyVolumes() {
    if (!this.ctx) return;
    const s = this.settings;
    const now = this.ctx.currentTime;
    const master = this.muted ? 0 : s.master * s.master;
    this.master.gain.setTargetAtTime(master, now, 0.02);
    this.musicBus.gain.setTargetAtTime(s.music * s.music * 0.5, now, 0.03);
    this.sfxBus.gain.setTargetAtTime(s.sfx * s.sfx, now, 0.03);
  }

  _startSizzle() {
    if (!this.ctx || this._sizzle) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2300;
    bp.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(bp).connect(gain).connect(this.sfxBus);
    src.start();
    this._sizzle = gain;
  }

  /** 0..1 continuous sizzle bed for stove noise. */
  setSizzle(level) {
    if (!this._sizzle || !this.ctx) return;
    const target = clamp(level, 0, 1) * 0.11;
    this._sizzle.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
  }

  /* --------------------------------------------------------------- helpers */

  _tone(o) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + (o.delay || 0);
    const osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.freqEnd), t0 + o.dur);
    const g = ctx.createGain();
    const peak = o.gain ?? 0.12;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + (o.attack ?? 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(g);
    g.connect(o.bus === 'music' ? this.musicBus : o.bus === 'ui' ? this.master : this.sfxBus);
    osc.start(t0);
    osc.stop(t0 + o.dur + 0.05);
  }

  _noiseHit(o) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + (o.delay || 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 1200, t0);
    if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.freqEnd), t0 + o.dur);
    f.Q.value = o.q ?? 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.gain ?? 0.12, t0 + (o.attack ?? 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    src.connect(f).connect(g).connect(o.bus === 'music' ? this.musicBus : this.sfxBus);
    src.start(t0);
    src.stop(t0 + o.dur + 0.03);
  }

  /* ------------------------------------------------------------------- SFX */

  play(name, opts = {}) {
    if (!this.ctx) return;
    const v = opts.volume ?? 1;
    switch (name) {
      case 'ui':
        this._tone({ type: 'triangle', freq: 740, freqEnd: 920, dur: 0.06, gain: 0.05 * v });
        break;
      case 'pickup':
        this._tone({ type: 'sine', freq: 480, freqEnd: 760, dur: 0.09, gain: 0.09 * v });
        this._tone({ type: 'triangle', freq: 960, dur: 0.05, gain: 0.03 * v, delay: 0.03 });
        break;
      case 'place':
        this._tone({ type: 'sine', freq: 190, freqEnd: 85, dur: 0.13, gain: 0.16 * v });
        this._noiseHit({ filter: 'lowpass', freq: 700, dur: 0.08, gain: 0.05 * v });
        break;
      case 'chop':
        this._noiseHit({ filter: 'bandpass', freq: 1600 + Math.random() * 700, q: 1.6, dur: 0.07, gain: 0.11 * v });
        this._tone({ type: 'square', freq: 220, freqEnd: 160, dur: 0.05, gain: 0.035 * v });
        break;
      case 'chopDone':
        this._tone({ type: 'triangle', freq: 660, dur: 0.1, gain: 0.09 * v });
        this._tone({ type: 'triangle', freq: 990, dur: 0.12, gain: 0.07 * v, delay: 0.09 });
        break;
      case 'cookDone':
        this._tone({ type: 'sine', freq: 880, dur: 0.2, gain: 0.1 * v });
        this._tone({ type: 'sine', freq: 1320, dur: 0.28, gain: 0.07 * v, delay: 0.06 });
        break;
      case 'burn':
        this._noiseHit({ filter: 'lowpass', freq: 900, freqEnd: 240, dur: 0.55, gain: 0.16 * v });
        this._tone({ type: 'sawtooth', freq: 120, freqEnd: 60, dur: 0.45, gain: 0.06 * v });
        break;
      case 'serve':
        [0, 0.11, 0.22].forEach((d, i) => {
          const notes = [660, 880, 1320];
          this._tone({ type: 'sine', freq: notes[i], dur: 0.42, gain: (0.12 - i * 0.015) * v, delay: d });
          this._tone({ type: 'triangle', freq: notes[i] * 2, dur: 0.2, gain: 0.025 * v, delay: d });
        });
        break;
      case 'orderNew':
        this._tone({ type: 'square', freq: 1100, dur: 0.035, gain: 0.035 * v });
        this._tone({ type: 'square', freq: 1500, dur: 0.04, gain: 0.03 * v, delay: 0.05 });
        break;
      case 'expire':
        this._tone({ type: 'sawtooth', freq: 260, freqEnd: 130, dur: 0.3, gain: 0.08 * v });
        this._tone({ type: 'square', freq: 130, dur: 0.25, gain: 0.04 * v, delay: 0.18 });
        break;
      case 'waste':
        this._noiseHit({ filter: 'lowpass', freq: 500, dur: 0.2, gain: 0.1 * v });
        this._tone({ type: 'sine', freq: 180, freqEnd: 120, dur: 0.2, gain: 0.05 * v });
        break;
      case 'trash':
        this._noiseHit({ filter: 'lowpass', freq: 900, freqEnd: 300, dur: 0.18, gain: 0.11 * v });
        break;
      case 'step':
        this._noiseHit({ filter: 'lowpass', freq: 260, dur: 0.055, gain: 0.035 * v });
        break;
      case 'combo':
        [523.25, 659.25, 783.99].forEach((f, i) =>
          this._tone({ type: 'triangle', freq: f, dur: 0.16, gain: 0.06 * v, delay: i * 0.06 }),
        );
        break;
      case 'countdown':
        this._tone({ type: 'square', freq: 440, dur: 0.08, gain: 0.05 * v });
        break;
      case 'result':
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
          this._tone({ type: 'triangle', freq: f, dur: 0.5, gain: 0.08 * v, delay: i * 0.13 }),
        );
        break;
      default:
        break;
    }
  }

  /* ----------------------------------------------------------------- music */

  startMusic() {
    if (!this.ctx || this._musicTimer) return;
    this._nextStepTime = this.ctx.currentTime + 0.08;
    this._musicTimer = setInterval(() => this._scheduler(), 25);
  }

  stopMusic() {
    if (this._musicTimer) clearInterval(this._musicTimer);
    this._musicTimer = null;
  }

  setIntensity(v) {
    this.intensity = clamp(v, 0, 1);
  }

  _scheduler() {
    if (!this.ctx) return;
    const horizon = this.ctx.currentTime + 0.18;
    while (this._nextStepTime < horizon) {
      this._scheduleStep(this._step, this._nextStepTime);
      this._nextStepTime += this._stepDur;
      this._step++;
    }
  }

  _scheduleStep(step, t) {
    const ctx = this.ctx;
    const bar = Math.floor(step / 16) % 4;
    const s = step % 16;
    const roots = [65.41, 55.0, 43.65, 49.0];
    const chords = [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
      [196.0, 246.94, 293.66, 349.23],
    ];
    const I = this.intensity;
    const at = (delay) => t + delay;

    // Kick
    if (s === 0 || s === 8 || (I > 0.65 && s === 11)) {
      this._musicTone('sine', 130, 45, 0.16, 0.22, at(0));
    }
    // Snare-ish brush on the backbeat
    if (s === 4 || s === 12) {
      this._musicNoise(1800, 0.09, 0.05 + I * 0.03, at(0));
    }
    // Hats
    if (s % 2 === 0 || I > 0.7) {
      this._musicNoise(7200, 0.028, (s % 4 === 0 ? 0.022 : 0.012) * (0.6 + I * 0.7), at(0));
    }
    // Walking bass
    if ([0, 3, 6, 8, 11, 14].includes(s)) {
      const root = roots[bar];
      const mult = s === 8 ? 1.5 : s === 11 ? 1.25 : 1;
      this._musicTone('triangle', root * mult, root * mult, 0.2, 0.12, at(0));
    }
    // Chord pluck
    if (s === 2 || s === 6 || s === 10 || s === 14) {
      const chord = chords[bar];
      chord.forEach((f, i) => {
        this._musicTone('sine', f * 2, f * 2, 0.18, 0.018 * (0.7 + I * 0.6), at(i * 0.008));
      });
    }
    // Sparse lead when the kitchen heats up
    if (I > 0.55 && [5, 7, 13, 15].includes(s)) {
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0];
      const n = scale[(step * 7 + bar * 3) % scale.length];
      this._musicTone('triangle', n, n, 0.22, 0.028 * I, at(0));
    }
    // Pad at the start of each bar
    if (s === 0) {
      this._musicTone('sawtooth', roots[bar] * 4, roots[bar] * 4, 0.7, 0.012 + I * 0.008, at(0));
    }
  }

  _musicTone(type, freq, freqEnd, dur, gain, when) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    if (freqEnd !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), when + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(g).connect(this.musicBus);
    osc.start(when);
    osc.stop(when + dur + 0.03);
  }

  _musicNoise(freq, dur, gain, when) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(f).connect(g).connect(this.musicBus);
    src.start(when);
    src.stop(when + dur + 0.02);
  }
}
