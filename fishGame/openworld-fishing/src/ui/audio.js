/**
 * audio.js — procedural audio engine for the 3D open-world fishing game.
 * =====================================================================
 *
 * EVERY sound in this file is synthesised at runtime with the Web Audio API.
 * There are no audio files, no loaders, no network requests and no imports:
 * this is a standalone browser ESM module with zero dependencies.
 *
 * ## Public API
 *
 *   const audio = new AudioEngine({ master: 0.7, sfx: 0.9, ambience: 0.6 });
 *
 *   audio.init()                       // idempotent; call from a user gesture
 *                                      // (click / keypress). Creates the
 *                                      // AudioContext once and resumes it.
 *   audio.ready                        // boolean: context created + running
 *   audio.setEnabled(on) / enabled     // mute/unmute without tearing down graph
 *   audio.setVolume('master'|'sfx'|'ambience', 0..1)
 *   audio.getVolume(kind)              // -> number
 *   audio.play(name, opts)             // one-shot SFX
 *                                      //   opts: { volume=1, rate=1, detune=0, pan=0 }
 *                                      //   pan is -1 (left) .. 1 (right)
 *   audio.setAmbience(name, opts)      // crossfade (~1.2 s) to a looping bed:
 *                                      //   'none' | 'shore' | 'lake' | 'forest'
 *                                      //   'rain' | 'storm' | 'underwater' | 'night'
 *                                      //   opts: { fade=1.2, intensity }
 *   audio.setAmbienceIntensity(0..1)   // scales the whole ambience bed
 *   audio.setWeather(name)             // 'clear'|'cloudy'|'rain'|'storm'|'fog'|'snow'
 *                                      // layered on top of the active ambience
 *   audio.update(dt)                   // per-frame; dt in seconds. Drives
 *                                      // wildlife calls, thunder scheduling,
 *                                      // LFO drift and voice cleanup.
 *   audio.dispose()                    // stop everything + close the context
 *
 *   import { SFX } from './audio.js';  // array of every valid one-shot name
 *
 * ## Guarantees
 *
 *  - Never throws. Every public method is safe to call before init(), after
 *    dispose(), with unknown names, or on a browser without Web Audio
 *    (feature detection -> silent no-op).
 *  - Does not leak nodes. One-shot voices are capped (MAX_VOICES = 24), every
 *    node is disconnected/scheduled-stopped when its voice ends, and the
 *    AudioContext is created at most once for the lifetime of the engine.
 *  - Mobile safe. init() is idempotent and resumes a suspended context; the
 *    gain graph is muted/unmuted rather than destroyed by setEnabled().
 *  - Tiny CPU. A handful of shared looping noise buffers, no per-frame
 *    oscillator churn, no ConvolverNode / impulse responses at all.
 *
 * @module ui/audio
 */

/** Maximum concurrently tracking one-shot voices (hard cap, oldest dropped). */
const MAX_VOICES = 24;

/** Shared DSP constants. */
const NOISE_SECONDS = 3; // length of each cached procedural noise buffer
const LAYER_FADE = 1.2; // default ambience crossfade, seconds
const WEATHER_FADE = 0.9; // weather layer crossfade, seconds
const TICK = 0.08; // scheduler resolution for wildlife/thunder, seconds
const THUNDER_MIN = 8; // storm thunder interval bounds, seconds
const THUNDER_MAX = 25;
const EPS = 1e-4; // smallest legal exponential-ramp target

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const rand = (a, b) => a + Math.random() * (b - a);
const num = (v, d) => (typeof v === 'number' && v === v ? v : d);

/** Creation methods wrapped so every node a voice builds can be auto-tracked. */
const NODE_FACTORIES = [
  'createGain',
  'createOscillator',
  'createBufferSource',
  'createBiquadFilter',
  'createStereoPanner',
  'createPanner',
  'createDelay',
  'createWaveShaper',
  'createDynamicsCompressor',
  'createConstantSource',
];

/** Upper bound on nodes a single one-shot may allocate before tracking is skipped. */
const MAX_NODES_PER_VOICE = 64;

/** Upper bound on transient nodes (droplet tics, splashes) a bed may hold. */
const MAX_LAYER_EVENTS = 24;

/**
 * Wrap a context so that every node it creates is also pushed onto `sink`.
 * Builders run through the proxy, which is why a voice can disconnect *all*
 * of its nodes even though it only knows the final destination by name.
 * @returns {any} a drop-in context (falling back to the raw one)
 */
function autotrack(ctx, sink) {
  if (typeof Proxy !== 'function') return ctx;
  try {
    return new Proxy(ctx, {
      get(target, prop, receiver) {
        const v = Reflect.get(target, prop, receiver);
        if (typeof v !== 'function') return v;
        if (NODE_FACTORIES.indexOf(prop) < 0) return v.bind(target);
        return function () {
          const node = v.apply(target, arguments);
          try {
            if (node && sink.length < MAX_VOICES * MAX_NODES_PER_VOICE) sink.push(node);
          } catch (_e) {
            /* ignore */
          }
          return node;
        };
      },
    });
  } catch (_e) {
    return ctx;
  }
}

function detectAudioContextClass() {
  try {
    if (typeof globalThis === 'undefined') return null;
    return globalThis.AudioContext || globalThis.webkitAudioContext || null;
  } catch (_e) {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Shared noise
 * ------------------------------------------------------------------ */

function makeNoiseBuffer(ctx, kind, seconds) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  if (kind === 'pink') {
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.22;
    }
  } else if (kind === 'brown') {
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.2;
    }
  } else {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return buf;
}

/* ------------------------------------------------------------------ *
 * Small node helpers (all take ctx + destination; return a tail node)
 * ------------------------------------------------------------------ */

function nodeGain(ctx, v) {
  const g = ctx.createGain();
  g.gain.value = num(v, 1);
  return g;
}

function nodeFilter(ctx, type, freq, q, gain) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = clamp(num(freq, 1000), 10, 20000);
  if (typeof f.Q === 'object' && f.Q) f.Q.value = clamp(num(q, 0.8), 0.0001, 40);
  if (gain !== undefined && typeof f.gain === 'object' && f.gain) f.gain.value = num(gain, 0);
  return f;
}

/** source -> optional filter chain -> amp(envelope) -> destination */
function envTail(ctx, source, filters, dest, t0, dur, peak, attack, curve) {
  let tail = source;
  if (filters) {
    for (let i = 0; i < filters.length; i++) {
      if (!filters[i]) continue;
      tail.connect(filters[i]);
      tail = filters[i];
    }
  }
  const amp = ctx.createGain();
  const p = Math.max(EPS, clamp(num(peak, 1), 0, 4));
  const a = clamp(num(attack, 0.004), 0.0002, Math.max(0.0005, dur));
  amp.gain.setValueAtTime(EPS, t0);
  amp.gain.exponentialRampToValueAtTime(p, t0 + a);
  if (curve === 'linear') amp.gain.linearRampToValueAtTime(EPS, t0 + dur);
  else amp.gain.exponentialRampToValueAtTime(EPS, t0 + dur);
  tail.connect(amp);
  amp.connect(dest);
  return amp;
}

/** One filtered noise burst: transient / splash / whoosh / hiss building block. */
function burst(ctx, dest, t0, dur, o) {
  const cfg = o || {};
  const rate = clamp(num(cfg.rate, 1), 0.1, 4);
  const hz = clamp(num(cfg.freq, 1200) * rate, 40, 19000);
  const peak = clamp(num(cfg.vol, 0.5), 0, 4);
  if (dur <= 0 || peak <= 0.00001) return null;
  const src = ctx.createBufferSource();
  src.buffer = Math.random() < 0.45 ? noisePink(ctx) : noiseWhite(ctx);
  src.playbackRate.value = clamp(rate * rand(0.94, 1.06), 0.1, 4);
  src.loop = true;
  const filters = [nodeFilter(ctx, cfg.type || 'bandpass', hz, cfg.q === undefined ? 0.9 : cfg.q)];
  if (cfg.type2) filters.push(nodeFilter(ctx, cfg.type2, num(cfg.freq2, 900) * rate, num(cfg.q2, 0.7)));
  const amp = envTail(ctx, src, filters, dest, t0, dur, peak, cfg.attack === undefined ? 0.004 : cfg.attack);
  src.start(t0, rand(0, NOISE_SECONDS * 0.8));
  src.stop(t0 + dur + 0.02);
  if (cfg.sweepTo) {
    const f = filters[0].frequency;
    f.setValueAtTime(hz, t0);
    f.exponentialRampToValueAtTime(clamp(num(cfg.sweepTo, hz) * rate, 40, 19000), t0 + dur * (cfg.sweepAt || 0.85));
  }
  return { src, amp, filters };
}

/** A pitched partial: sweep / blip / pluck / tone. */
function tone(ctx, dest, t0, dur, o) {
  const cfg = o || {};
  const f0 = clamp(num(cfg.freq, 440), 10, 18000);
  const f1 = clamp(num(cfg.to, cfg.freq, 440), 10, 18000);
  const peak = clamp(num(cfg.vol, 0.3), 0, 4);
  if (dur <= 0 || peak <= 0.00001) return null;
  const osc = ctx.createOscillator();
  osc.type = cfg.type || 'sine';
  const rampAt = clamp(num(cfg.rampAt, 1), 0.02, 1) * dur;
  osc.frequency.setValueAtTime(f0, t0);
  if (f1 !== f0) {
    if (cfg.linear) osc.frequency.linearRampToValueAtTime(f1, t0 + rampAt);
    else osc.frequency.exponentialRampToValueAtTime(f1, t0 + rampAt);
  }
  if (cfg.detune) osc.detune.value = num(cfg.detune, 0);
  const amp = envTail(ctx, osc, null, dest, t0, dur, peak, cfg.attack === undefined ? 0.006 : cfg.attack, cfg.curve);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
  return { src: osc, amp };
}

/** Micro click, used for ratchets, hooks and UI ticks. */
function click(ctx, dest, t0, o) {
  const cfg = o || {};
  return burst(ctx, dest, t0, num(cfg.dur, 0.012), {
    freq: num(cfg.freq, 1900),
    q: num(cfg.q, 1.2),
    vol: num(cfg.vol, 0.2),
    attack: 0.0005,
    rate: 1,
  });
}

/* ------------------------------------------------------------------ *
 * Shared cached buffers (created lazily, at most 3 per context)
 * ------------------------------------------------------------------ */

function noiseWhite(ctx) {
  const s = ctx.__fishGameAudio;
  if (!s) return makeNoiseBuffer(ctx, 'white', NOISE_SECONDS);
  if (!s.white) s.white = makeNoiseBuffer(ctx, 'white', NOISE_SECONDS);
  return s.white;
}

function noisePink(ctx) {
  const s = ctx.__fishGameAudio;
  if (!s) return makeNoiseBuffer(ctx, 'pink', NOISE_SECONDS);
  if (!s.pink) s.pink = makeNoiseBuffer(ctx, 'pink', NOISE_SECONDS);
  return s.pink;
}

function noiseBrown(ctx) {
  const s = ctx.__fishGameAudio;
  if (!s) return makeNoiseBuffer(ctx, 'brown', NOISE_SECONDS);
  if (!s.brown) s.brown = makeNoiseBuffer(ctx, 'brown', NOISE_SECONDS);
  return s.brown;
}

/* ------------------------------------------------------------------ *
 * One-shot synthesis
 *
 * Each builder receives (ctx, out, t0, p) where `p` is a resolved params
 * object: { volume, rate, detune, pan, rnd (0..1 random), dur (s) }.
 * Builders schedule their own nodes; scheduling must stay side-effect free.
 * ------------------------------------------------------------------ */

const waterSplash = (ctx, out, t0, p, o) => {
  const cfg = o || {};
  const dur = p.dur * num(cfg.len, 1);
  burst(ctx, out, t0, dur, {
    freq: num(cfg.freq, 900) * p.rate,
    q: num(cfg.q, 0.7),
    vol: 0.55 * p.volume,
    attack: 0.0015,
    sweepTo: num(cfg.sweep, 260) * p.rate,
    sweepAt: 0.95,
    type2: 'highpass',
    freq2: 1500 * p.rate,
  });
  burst(ctx, out, t0 + dur * 0.25, dur * 0.6, {
    freq: 2200 * p.rate,
    q: 1.1,
    vol: 0.16 * p.volume,
    attack: 0.03,
  });
  tone(ctx, out, t0, dur * 0.5, { freq: 320 * p.rate, to: 110 * p.rate, type: 'sine', vol: 0.1 * p.volume });
};

const BUILDERS = {
  /* ---------------- fishing ---------------- */

  cast: (ctx, out, t0, p) => {
    burst(ctx, out, t0, 0.34, {
      freq: 420 * p.rate,
      q: 1.3,
      vol: 0.34 * p.volume,
      attack: 0.02,
      sweepTo: 2900 * p.rate,
      sweepAt: 0.8,
    });
    tone(ctx, out, t0 + 0.01, 0.16, {
      freq: 430 * p.rate,
      to: 130 * p.rate,
      type: 'triangle',
      vol: 0.14 * p.volume,
      attack: 0.004,
    });
    click(ctx, out, t0 + 0.3, { freq: 4200 * p.rate, vol: 0.07 * p.volume, dur: 0.02 });
  },

  splash: (ctx, out, t0, p) => waterSplash(ctx, out, t0, p, { freq: 900, len: 1, sweep: 240 }),

  splash_small: (ctx, out, t0, p) =>
    waterSplash(ctx, out, t0, p, { freq: 1700, len: 0.5, sweep: 600, q: 1.1 }),

  bobber_land: (ctx, out, t0, p) => {
    waterSplash(ctx, out, t0, p, { freq: 1500, len: 0.4, sweep: 700, q: 1.4 });
    burst(ctx, out, t0, 0.03, { freq: 600 * p.rate, q: 2, vol: 0.2 * p.volume, attack: 0.0008, type2: 'highpass', freq2: 2500 * p.rate });
  },

  bite: (ctx, out, t0, p) => {
    tone(ctx, out, t0, 0.2, {
      freq: 170 * p.rate,
      to: 86 * p.rate,
      type: 'triangle',
      vol: 0.34 * p.volume,
      attack: 0.003,
    });
    tone(ctx, out, t0 + 0.015, 0.12, { freq: 340 * p.rate, to: 150 * p.rate, type: 'sine', vol: 0.1 * p.volume });
    burst(ctx, out, t0, 0.045, { freq: 480 * p.rate, q: 0.8, vol: 0.16 * p.volume, attack: 0.001 });
  },

  hook: (ctx, out, t0, p) => {
    click(ctx, out, t0, { freq: 3400 * p.rate, vol: 0.3 * p.volume, dur: 0.008, q: 1.6 });
    tone(ctx, out, t0, 0.13, { freq: 560 * p.rate, to: 1350 * p.rate, type: 'triangle', vol: 0.24 * p.volume, attack: 0.002 });
    burst(ctx, out, t0, 0.09, { freq: 1400 * p.rate, q: 0.9, vol: 0.12 * p.volume, attack: 0.002 });
  },

  reel_tick: (ctx, out, t0, p) => {
    click(ctx, out, t0, { freq: (1450 + p.rnd * 500) * p.rate, vol: 0.22 * p.volume, dur: 0.007, q: 2.4 });
    if (p.rnd > 0.6) click(ctx, out, t0 + 0.012, { freq: 700 * p.rate, vol: 0.07 * p.volume, dur: 0.01, q: 1 });
  },

  reel_fast: (ctx, out, t0, p) => {
    // Cheap ratchet: a single gain stage fed by short scheduled clicks.
    const n = clamp(Math.round(num(p.opts && p.opts.ticks, 13)), 6, 20);
    const step = clamp(num(p.opts && p.opts.step, 0.046) / p.rate, 0.014, 0.2);
    for (let i = 0; i < n; i++) {
      click(ctx, out, t0 + i * step, {
        freq: (1350 + Math.random() * 900) * p.rate,
        vol: (i < 2 ? 0.2 : 0.16) * p.volume,
        dur: 0.006,
        q: 2.6,
      });
    }
  },

  line_stress: (ctx, out, t0, p) => {
    tone(ctx, out, t0, 0.3, { freq: 780 * p.rate, to: 930 * p.rate, type: 'sawtooth', vol: 0.07 * p.volume, attack: 0.03 });
    const w = tone(ctx, out, t0, 0.28, { freq: 1560 * p.rate, to: 1720 * p.rate, type: 'sine', vol: 0.05 * p.volume, attack: 0.04 });
    void w;
    burst(ctx, out, t0, 0.26, { type: 'bandpass', freq: 2400 * p.rate, q: 4, vol: 0.1 * p.volume, attack: 0.04 });
  },

  snap: (ctx, out, t0, p) => {
    burst(ctx, out, t0, 0.05, {
      type: 'highpass',
      freq: 900 * p.rate,
      q: 0.8,
      vol: 0.5 * p.volume,
      attack: 0.0004,
      sweepTo: 5000 * p.rate,
      sweepAt: 0.4,
    });
    tone(ctx, out, t0 + 0.002, 0.14, { freq: 2450 * p.rate, to: 1100 * p.rate, type: 'square', vol: 0.12 * p.volume, attack: 0.0008 });
    tone(ctx, out, t0, 0.09, { freq: 5100 * p.rate, to: 3400 * p.rate, type: 'sine', vol: 0.09 * p.volume, attack: 0.0006 });
  },

  catch: (ctx, out, t0, p) => {
    const notes = [523.25, 659.25, 783.99];
    for (let i = 0; i < notes.length; i++) {
      const t = t0 + i * 0.085;
      tone(ctx, out, t, 0.34, { freq: notes[i] * p.rate, type: 'triangle', vol: 0.24 * p.volume, attack: 0.008 });
      tone(ctx, out, t, 0.2, { freq: notes[i] * 2 * p.rate, type: 'sine', vol: 0.07 * p.volume, attack: 0.006 });
    }
    tone(ctx, out, t0 + 0.26, 0.7, { freq: notes[2] * p.rate, to: notes[2] * 1.5 * p.rate, type: 'sine', vol: 0.1 * p.volume, attack: 0.02 });
  },

  catch_rare: (ctx, out, t0, p) => {
    const notes = [587.33, 739.99, 880, 1108.73, 1174.66];
    for (let i = 0; i < notes.length; i++) {
      const t = t0 + i * 0.1;
      const f = notes[i] * p.rate;
      tone(ctx, out, t, 0.55, { freq: f, type: 'triangle', vol: 0.22 * p.volume, attack: 0.008 });
      tone(ctx, out, t, 0.5, { freq: f, type: 'sawtooth', vol: 0.05 * p.volume, detune: 9, attack: 0.02 });
      tone(ctx, out, t, 0.45, { freq: f, type: 'square', vol: 0.04 * p.volume, detune: -11, attack: 0.02 });
      tone(ctx, out, t, 0.3, { freq: f * 2, type: 'sine', vol: 0.06 * p.volume, attack: 0.006 });
    }
    // shimmer tail: two slightly detuned high partials beating against each other
    tone(ctx, out, t0 + 0.45, 1.4, { freq: 3520 * p.rate, type: 'sine', vol: 0.035 * p.volume, attack: 0.12 });
    tone(ctx, out, t0 + 0.45, 1.4, { freq: 3527 * p.rate, type: 'sine', vol: 0.03 * p.volume, attack: 0.12 });
    burst(ctx, out, t0 + 0.48, 1.1, { type: 'highpass', freq: 5200 * p.rate, q: 0.7, vol: 0.03 * p.volume, attack: 0.2 });
  },

  escape: (ctx, out, t0, p) => {
    tone(ctx, out, t0, 0.4, { freq: 420 * p.rate, to: 150 * p.rate, type: 'triangle', vol: 0.2 * p.volume, attack: 0.01 });
    tone(ctx, out, t0 + 0.05, 0.35, { freq: 300 * p.rate, to: 110 * p.rate, type: 'sawtooth', vol: 0.06 * p.volume, attack: 0.02 });
    waterSplash(ctx, out, t0 + 0.02, p, { freq: 800, len: 0.7, sweep: 300 });
  },

  /* ---------------- UI ---------------- */

  ui_click: (ctx, out, t0, p) => {
    tone(ctx, out, t0, 0.05, { freq: 1180 * p.rate, to: 1500 * p.rate, type: 'sine', vol: 0.17 * p.volume, attack: 0.001 });
    click(ctx, out, t0, { freq: 3600 * p.rate, vol: 0.05 * p.volume, dur: 0.006 });
  },

  ui_open: (ctx, out, t0, p) => {
    burst(ctx, out, t0, 0.16, { type: 'bandpass', freq: 700 * p.rate, q: 1.2, vol: 0.14 * p.volume, attack: 0.01, sweepTo: 2600 * p.rate });
    tone(ctx, out, t0, 0.18, { freq: 620 * p.rate, to: 940 * p.rate, type: 'sine', vol: 0.1 * p.volume, attack: 0.008 });
  },

  ui_close: (ctx, out, t0, p) => {
    burst(ctx, out, t0, 0.14, { type: 'bandpass', freq: 2200 * p.rate, q: 1.2, vol: 0.12 * p.volume, attack: 0.01, sweepTo: 620 * p.rate });
    tone(ctx, out, t0, 0.16, { freq: 880 * p.rate, to: 520 * p.rate, type: 'sine', vol: 0.09 * p.volume, attack: 0.008 });
  },

  ui_tab: (ctx, out, t0, p) => {
    tone(ctx, out, t0, 0.04, { freq: 1620 * p.rate, to: 1900 * p.rate, type: 'sine', vol: 0.11 * p.volume, attack: 0.001 });
  },

  ui_error: (ctx, out, t0, p) => {
    tone(ctx, out, t0, 0.16, { freq: 190 * p.rate, to: 130 * p.rate, type: 'sawtooth', vol: 0.2 * p.volume, attack: 0.004 });
    tone(ctx, out, t0, 0.16, { freq: 197 * p.rate, to: 122 * p.rate, type: 'square', vol: 0.07 * p.volume, attack: 0.004 });
    tone(ctx, out, t0 + 0.17, 0.2, { freq: 150 * p.rate, to: 96 * p.rate, type: 'sawtooth', vol: 0.16 * p.volume, attack: 0.005 });
  },

  coin: (ctx, out, t0, p) => {
    tone(ctx, out, t0, 0.07, { freq: 1318 * p.rate, type: 'sine', vol: 0.2 * p.volume, attack: 0.001 });
    tone(ctx, out, t0 + 0.06, 0.14, { freq: 1976 * p.rate, type: 'sine', vol: 0.16 * p.volume, attack: 0.001 });
  },

  level_up: (ctx, out, t0, p) => {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    for (let i = 0; i < notes.length; i++) {
      const t = t0 + i * 0.09;
      tone(ctx, out, t, 0.36, { freq: notes[i] * p.rate, type: 'triangle', vol: 0.2 * p.volume, attack: 0.006 });
      tone(ctx, out, t, 0.3, { freq: notes[i] * 2 * p.rate, type: 'sine', vol: 0.06 * p.volume, attack: 0.006 });
    }
  },

  achieve: (ctx, out, t0, p) => {
    const notes = [659.25, 880, 1108.73, 1318.51];
    for (let i = 0; i < notes.length; i++) {
      const t = t0 + i * 0.07;
      tone(ctx, out, t, 0.3, { freq: notes[i] * p.rate, type: 'triangle', vol: 0.17 * p.volume, attack: 0.005 });
    }
    // final sustained shimmer chord
    const chord = [1318.51, 1661.22, 1975.53];
    for (let i = 0; i < chord.length; i++) {
      tone(ctx, out, t0 + 0.28, 1.2, { freq: chord[i] * p.rate, type: 'sine', vol: 0.06 * p.volume, attack: 0.05 });
    }
  },

  save: (ctx, out, t0, p) => {
    burst(ctx, out, t0, 0.2, { type: 'highpass', freq: 3200 * p.rate, q: 0.7, vol: 0.06 * p.volume, attack: 0.03 });
    tone(ctx, out, t0 + 0.02, 0.12, { freq: 1046.5 * p.rate, type: 'triangle', vol: 0.14 * p.volume, attack: 0.004 });
    tone(ctx, out, t0 + 0.12, 0.26, { freq: 784 * p.rate, type: 'triangle', vol: 0.14 * p.volume, attack: 0.004 });
  },

  /* ---------------- player ---------------- */

  footstep_grass: (ctx, out, t0, p) => {
    burst(ctx, out, t0, 0.12, { type: 'highpass', freq: 900 * p.rate, q: 0.7, vol: 0.24 * p.volume, attack: 0.003 });
    tone(ctx, out, t0, 0.08, { freq: 95 * p.rate, to: 62 * p.rate, type: 'sine', vol: 0.1 * p.volume, attack: 0.002 });
  },

  footstep_water: (ctx, out, t0, p) => {
    waterSplash(ctx, out, t0, p, { freq: 1100, len: 0.6, sweep: 380, q: 1 });
    tone(ctx, out, t0, 0.1, { freq: 90 * p.rate, to: 55 * p.rate, type: 'sine', vol: 0.12 * p.volume, attack: 0.002 });
  },

  footstep_wood: (ctx, out, t0, p) => {
    burst(ctx, out, t0, 0.09, { type: 'bandpass', freq: 340 * p.rate, q: 2.6, vol: 0.3 * p.volume, attack: 0.0015 });
    tone(ctx, out, t0, 0.07, { freq: 150 * p.rate, to: 92 * p.rate, type: 'triangle', vol: 0.14 * p.volume, attack: 0.001 });
  },

  footstep_rock: (ctx, out, t0, p) => {
    burst(ctx, out, t0, 0.045, { type: 'highpass', freq: 1500 * p.rate, q: 0.8, vol: 0.24 * p.volume, attack: 0.0008 });
    tone(ctx, out, t0, 0.05, { freq: 1900 * p.rate, to: 1200 * p.rate, type: 'square', vol: 0.05 * p.volume, attack: 0.001 });
    tone(ctx, out, t0, 0.06, { freq: 105 * p.rate, to: 70 * p.rate, type: 'sine', vol: 0.09 * p.volume, attack: 0.001 });
  },

  footstep_sand: (ctx, out, t0, p) => {
    burst(ctx, out, t0, 0.13, { type: 'highpass', freq: 2600 * p.rate, q: 0.6, vol: 0.2 * p.volume, attack: 0.008 });
    tone(ctx, out, t0, 0.07, { freq: 80 * p.rate, to: 55 * p.rate, type: 'sine', vol: 0.07 * p.volume, attack: 0.002 });
  },

  jump: (ctx, out, t0, p) => {
    tone(ctx, out, t0, 0.16, { freq: 210 * p.rate, to: 480 * p.rate, type: 'triangle', vol: 0.13 * p.volume, attack: 0.005 });
    burst(ctx, out, t0, 0.16, { type: 'bandpass', freq: 700 * p.rate, q: 1, vol: 0.14 * p.volume, attack: 0.02, sweepTo: 2400 * p.rate });
  },

  land: (ctx, out, t0, p) => {
    tone(ctx, out, t0, 0.18, { freq: 150 * p.rate, to: 55 * p.rate, type: 'sine', vol: 0.34 * p.volume, attack: 0.002 });
    burst(ctx, out, t0, 0.12, { type: 'lowpass', freq: 1200 * p.rate, q: 0.8, vol: 0.22 * p.volume, attack: 0.001 });
    burst(ctx, out, t0, 0.05, { type: 'highpass', freq: 2400 * p.rate, q: 0.7, vol: 0.08 * p.volume, attack: 0.001 });
  },

  swim: (ctx, out, t0, p) => {
    burst(ctx, out, t0, 0.28, { type: 'lowpass', freq: 900 * p.rate, q: 0.9, vol: 0.2 * p.volume, attack: 0.02, sweepTo: 600 * p.rate });
    burst(ctx, out, t0 + 0.02, 0.12, { type: 'bandpass', freq: 1800 * p.rate, q: 1, vol: 0.1 * p.volume, attack: 0.01 });
    tone(ctx, out, t0 + 0.05, 0.06, { freq: 420 * p.rate, to: 700 * p.rate, type: 'sine', vol: 0.03 * p.volume, attack: 0.002 });
  },

  dive: (ctx, out, t0, p) => {
    waterSplash(ctx, out, t0, p, { freq: 1200, len: 1.2, sweep: 320 });
    for (let i = 0; i < 7; i++) {
      const t = t0 + 0.12 + i * rand(0.03, 0.09);
      tone(ctx, out, t, 0.05, { freq: rand(520, 2400) * p.rate, to: rand(700, 3000) * p.rate, type: 'sine', vol: 0.05 * p.volume, attack: 0.001 });
    }
  },

  surface_gasp: (ctx, out, t0, p) => {
    burst(ctx, out, t0, 0.22, { type: 'bandpass', freq: 620 * p.rate, q: 0.9, vol: 0.26 * p.volume, attack: 0.02, sweepTo: 1800 * p.rate });
    burst(ctx, out, t0 + 0.18, 0.2, { type: 'highpass', freq: 1600 * p.rate, q: 0.7, vol: 0.12 * p.volume, attack: 0.05 });
    tone(ctx, out, t0, 0.24, { freq: 300 * p.rate, to: 180 * p.rate, type: 'triangle', vol: 0.07 * p.volume, attack: 0.03 });
  },

  /* ---------------- world ---------------- */

  seagull: (ctx, out, t0, p) => {
    const calls = 1 + (p.rnd > 0.55 ? 1 : 0);
    for (let c = 0; c < calls; c++) {
      const t = t0 + c * rand(0.2, 0.28);
      const base = rand(1500, 1900) * p.rate;
      tone(ctx, out, t, 0.16, { freq: base, to: base * 0.62, type: 'sawtooth', vol: 0.11 * p.volume, attack: 0.008 });
      tone(ctx, out, t, 0.16, { freq: base * 1.5, to: base * 0.95, type: 'triangle', vol: 0.05 * p.volume, attack: 0.01 });
      tone(ctx, out, t + 0.17, 0.12, { freq: base * 0.72, to: base * 1.05, type: 'sawtooth', vol: 0.08 * p.volume, attack: 0.008 });
    }
  },

  frog: (ctx, out, t0, p) => {
    const n = 3 + Math.floor(p.rnd * 3);
    const base = rand(150, 230) * p.rate;
    for (let i = 0; i < n; i++) {
      const t = t0 + i * 0.085;
      tone(ctx, out, t, 0.06, { freq: base, to: base * 1.35, type: 'square', vol: 0.11 * p.volume, attack: 0.003 });
    }
    tone(ctx, out, t0, 0.22, { freq: base * 0.5, type: 'triangle', vol: 0.05 * p.volume, attack: 0.01 });
  },

  insect: (ctx, out, t0, p) => {
    const n = 2 + Math.floor(p.rnd * 3);
    for (let i = 0; i < n; i++) {
      tone(ctx, out, t0 + i * 0.055, 0.02, { freq: rand(4200, 5600) * p.rate, to: rand(4800, 6200) * p.rate, type: 'sine', vol: 0.06 * p.volume, attack: 0.0008 });
    }
  },

  owl: (ctx, out, t0, p) => {
    const base = rand(310, 380) * p.rate;
    const hoots = p.rnd > 0.45 ? 2 : 1;
    for (let i = 0; i < hoots; i++) {
      const t = t0 + i * 0.42;
      tone(ctx, out, t, 0.34, { freq: base, to: base * 0.94, type: 'sine', vol: 0.13 * p.volume, attack: 0.05 });
      tone(ctx, out, t, 0.34, { freq: base * 2, to: base * 1.9, type: 'triangle', vol: 0.03 * p.volume, attack: 0.06 });
      tone(ctx, out, t + 0.05, 0.26, { freq: base * 1.01, type: 'sine', vol: 0.05 * p.volume, attack: 0.05 });
    }
  },

  thunder: (ctx, out, t0, p) => {
    const crack = p.spec && p.spec.close;
    const dur = 2.4 + p.rnd * 1.8;
    // body: brown noise through a lowpass sweeping down, with a slow swell
    const src = ctx.createBufferSource();
    src.buffer = noiseBrown(ctx);
    src.loop = true;
    src.playbackRate.value = clamp(0.8 * p.rate, 0.2, 2);
    const lp = nodeFilter(ctx, 'lowpass', 420 * p.rate, 0.9);
    lp.frequency.setValueAtTime(clamp(520 * p.rate, 40, 19000), t0);
    lp.frequency.exponentialRampToValueAtTime(clamp(70 * p.rate, 20, 19000), t0 + dur * 0.9);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(EPS, t0);
    amp.gain.exponentialRampToValueAtTime(0.5 * p.volume, t0 + (crack ? 0.02 : 0.55));
    amp.gain.exponentialRampToValueAtTime(EPS, t0 + dur);
    src.connect(lp);
    lp.connect(amp);
    amp.connect(out);
    src.start(t0, rand(0, NOISE_SECONDS * 0.6));
    src.stop(t0 + dur + 0.05);
    if (crack) {
      burst(ctx, out, t0, 0.14, { type: 'highpass', freq: 1600 * p.rate, q: 0.6, vol: 0.24 * p.volume, attack: 0.0008, sweepTo: 4000 * p.rate, sweepAt: 0.3 });
    }
    // rolling sub tail
    tone(ctx, out, t0 + (crack ? 0.15 : 0.3), dur * 0.7, { freq: 62 * p.rate, to: 34 * p.rate, type: 'sine', vol: 0.14 * p.volume, attack: 0.25 });
  },

  wind_gust: (ctx, out, t0, p) => {
    const dur = 1.1 + p.rnd * 1.1;
    burst(ctx, out, t0, dur, {
      type: 'lowpass',
      freq: 320 * p.rate,
      q: 1.3,
      vol: 0.24 * p.volume,
      attack: dur * 0.35,
      sweepTo: 900 * p.rate,
      sweepAt: 0.85,
    });
    burst(ctx, out, t0 + dur * 0.2, dur * 0.65, { type: 'bandpass', freq: 1500 * p.rate, q: 0.8, vol: 0.08 * p.volume, attack: dur * 0.3 });
  },

  wood_creak: (ctx, out, t0, p) => {
    tone(ctx, out, t0, 0.55, { freq: 132 * p.rate, to: 196 * p.rate, type: 'sawtooth', vol: 0.07 * p.volume, attack: 0.12, linear: true });
    tone(ctx, out, t0 + 0.05, 0.4, { freq: 263 * p.rate, to: 330 * p.rate, type: 'triangle', vol: 0.05 * p.volume, attack: 0.1, linear: true });
    burst(ctx, out, t0, 0.4, { type: 'bandpass', freq: 700 * p.rate, q: 3.2, vol: 0.07 * p.volume, attack: 0.15 });
  },

  bell: (ctx, out, t0, p) => {
    const partials = [1, 2.01, 2.98, 4.2, 5.4];
    const amps = [0.22, 0.1, 0.07, 0.04, 0.025];
    const base = 392 * p.rate;
    for (let i = 0; i < partials.length; i++) {
      tone(ctx, out, t0, 1.6 - i * 0.15, {
        freq: base * partials[i],
        type: 'sine',
        vol: amps[i] * p.volume,
        attack: 0.003,
      });
    }
    click(ctx, out, t0, { freq: 3000 * p.rate, vol: 0.06 * p.volume, dur: 0.008, q: 1.4 });
  },
};

/* ------------------------------------------------------------------ *
 * Ambience beds and weather layers
 *
 * A layer factory returns { out, tail, update?(dt, t), stop() } where
 * `out` is a GainNode the engine drives for crossfades and `tail` lists
 * every node the factory owns so the engine can disconnect them all.
 * ------------------------------------------------------------------ */

function layerGain(ctx) {
  const out = ctx.createGain();
  out.gain.value = EPS;
  return out;
}

/** Noise -> filter(s) -> amp(LFO modulated) -> out. Returns the amp node. */
function bedNoise(ctx, out, buffer, filterType, freq, q, amp, lfoRate, lfoDepth, tail) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.playbackRate.value = rand(0.9, 1.1);
  const f = nodeFilter(ctx, filterType, freq, q);
  const g = nodeGain(ctx, amp);
  src.connect(f);
  f.connect(g);
  g.connect(out);
  tail.push(src, f, g);
  src.start(0, rand(0, NOISE_SECONDS * 0.6));
  let lfo = null;
  if (lfoRate > 0 && lfoDepth > 0) {
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = lfoRate * rand(0.85, 1.15);
    const lg = nodeGain(ctx, amp * lfoDepth);
    lfo.connect(lg);
    lg.connect(g.gain);
    lfo.start();
    tail.push(lfo, lg);
  }
  return g;
}

const LAYERS = {
  shore: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    bedNoise(ctx, out, noiseWhite(ctx), 'lowpass', 620, 0.7, 0.3, 0.09, 0.55, tail);
    bedNoise(ctx, out, noiseWhite(ctx), 'bandpass', 1900, 0.8, 0.085, 0.13, 0.4, tail);
    bedNoise(ctx, out, noisePink(ctx), 'lowpass', 180, 0.8, 0.12, 0.05, 0.6, tail);
    return {
      out,
      tail,
      /**
       * @param {number} dt seconds since the previous tick
       * @param {number} t context time to schedule at
       * @param {AudioEngine} self engine, for transient-node ownership
       */
      update(dt, t, self) {
        if (Math.random() < dt * 0.35) {
          self.layerEvent(this, t, 0.5, { type: 'lowpass', freq: 1400, q: 0.8, vol: 0.1, attack: 0.01, sweepTo: 400 });
        }
      },
    };
  },

  lake: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    bedNoise(ctx, out, noiseWhite(ctx), 'lowpass', 520, 0.8, 0.2, 0.07, 0.5, tail);
    bedNoise(ctx, out, noisePink(ctx), 'lowpass', 200, 0.8, 0.1, 0.04, 0.5, tail);
    return {
      out,
      tail,
      update(dt, t, self) {
        if (Math.random() < dt * 0.7) {
          self.layerEvent(this, t, 0.22, { type: 'bandpass', freq: 1600, q: 1.2, vol: 0.05, attack: 0.006, sweepTo: 700 });
        }
      },
    };
  },

  forest: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    bedNoise(ctx, out, noiseWhite(ctx), 'bandpass', 1500, 0.7, 0.11, 0.11, 0.6, tail);
    bedNoise(ctx, out, noiseWhite(ctx), 'bandpass', 3400, 0.9, 0.05, 0.17, 0.5, tail);
    bedNoise(ctx, out, noisePink(ctx), 'lowpass', 260, 0.8, 0.1, 0.04, 0.55, tail);
    return { out, tail };
  },

  rain: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    bedNoise(ctx, out, noiseWhite(ctx), 'highpass', 1800, 0.5, 0.14, 0.5, 0.15, tail);
    bedNoise(ctx, out, noiseWhite(ctx), 'bandpass', 4200, 0.7, 0.09, 0.7, 0.2, tail);
    bedNoise(ctx, out, noisePink(ctx), 'lowpass', 400, 0.8, 0.08, 0.06, 0.4, tail);
    return {
      out,
      tail,
      update(dt, t, self) {
        if (Math.random() < dt * 8) {
          self.layerEvent(this, t + rand(0, 0.05), 0.05, {
            type: 'bandpass',
            freq: rand(1500, 5200),
            q: 2.4,
            vol: 0.05,
            attack: 0.0008,
          });
        }
      },
    };
  },

  storm: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    bedNoise(ctx, out, noiseWhite(ctx), 'highpass', 1500, 0.5, 0.17, 0.42, 0.2, tail);
    bedNoise(ctx, out, noiseWhite(ctx), 'bandpass', 3600, 0.7, 0.11, 0.6, 0.25, tail);
    bedNoise(ctx, out, noisePink(ctx), 'lowpass', 200, 0.9, 0.2, 0.05, 0.6, tail);
    bedNoise(ctx, out, noiseBrown(ctx), 'lowpass', 90, 1.1, 0.16, 0.03, 0.7, tail);
    return {
      out,
      tail,
      update(dt, t, self) {
        if (Math.random() < dt * 6) {
          self.layerEvent(this, t, 0.06, { type: 'bandpass', freq: rand(1200, 4600), q: 2.2, vol: 0.05, attack: 0.001 });
        }
      },
    };
  },

  underwater: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    bedNoise(ctx, out, noiseBrown(ctx), 'lowpass', 170, 1.4, 0.34, 0.04, 0.45, tail);
    bedNoise(ctx, out, noisePink(ctx), 'lowpass', 90, 1.8, 0.22, 0.02, 0.4, tail);
    const drone = tone(ctx, out, 0, 24, { freq: 54, type: 'sine', vol: 0.05, attack: 0.5, curve: 'linear' });
    if (drone) tail.push(drone.src, drone.amp);
    return { out, tail };
  },

  night: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    bedNoise(ctx, out, noisePink(ctx), 'lowpass', 300, 0.8, 0.15, 0.03, 0.5, tail);
    bedNoise(ctx, out, noiseWhite(ctx), 'bandpass', 2600, 0.6, 0.04, 0.09, 0.6, tail);
    const drone = tone(ctx, out, 0, 24, { freq: 58, type: 'triangle', vol: 0.035, attack: 0.8, curve: 'linear' });
    if (drone) tail.push(drone.src, drone.amp);
    return { out, tail };
  },
};

const WEATHER = {
  rain: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    bedNoise(ctx, out, noiseWhite(ctx), 'highpass', 2400, 0.5, 0.16, 0.35, 0.25, tail);
    bedNoise(ctx, out, noisePink(ctx), 'bandpass', 900, 0.6, 0.07, 0.12, 0.4, tail);
    return {
      out,
      tail,
      update(dt, t, self) {
        if (Math.random() < dt * 6) {
          self.layerEvent(this, t, 0.06, { type: 'bandpass', freq: rand(2000, 6000), q: 2.5, vol: 0.05, attack: 0.001 });
        }
      },
    };
  },

  storm: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    bedNoise(ctx, out, noiseWhite(ctx), 'highpass', 1700, 0.5, 0.2, 0.3, 0.3, tail);
    bedNoise(ctx, out, noiseBrown(ctx), 'lowpass', 110, 1, 0.14, 0.04, 0.6, tail);
    return { out, tail };
  },

  snow: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    const shelf = nodeFilter(ctx, 'highshelf', 2200, 0.7, -16);
    const lp = nodeFilter(ctx, 'lowpass', 1100, 0.8);
    shelf.connect(lp);
    lp.connect(out);
    const src = ctx.createBufferSource();
    src.buffer = noiseWhite(ctx);
    src.loop = true;
    src.playbackRate.value = rand(0.8, 1);
    const g = nodeGain(ctx, 0.09);
    src.connect(g);
    g.connect(shelf);
    src.start(0, rand(0, NOISE_SECONDS * 0.6));
    tail.push(src, g, shelf, lp);
    return { out, tail };
  },

  fog: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    bedNoise(ctx, out, noisePink(ctx), 'bandpass', 320, 1.6, 0.1, 0.045, 0.5, tail);
    bedNoise(ctx, out, noisePink(ctx), 'lowpass', 160, 0.9, 0.16, 0.03, 0.45, tail);
    return { out, tail };
  },

  cloudy: (ctx) => {
    const out = layerGain(ctx);
    const tail = [];
    bedNoise(ctx, out, noisePink(ctx), 'lowpass', 420, 0.9, 0.12, 0.06, 0.6, tail);
    bedNoise(ctx, out, noiseWhite(ctx), 'bandpass', 1200, 0.7, 0.045, 0.1, 0.6, tail);
    return { out, tail };
  },
};

/** Wildlife cues gated by ambience / weather, evaluated on the engine tick. */
const WILDLIFE = [
  { name: 'seagull', min: 7, max: 17, vol: 0.5, on: (s) => s.amb === 'shore' && s.weather !== 'storm' },
  { name: 'frog', min: 4, max: 12, vol: 0.5, on: (s) => (s.amb === 'lake' || s.amb === 'forest') && s.weather !== 'storm' },
  { name: 'insect', min: 3, max: 9, vol: 0.4, on: (s) => (s.amb === 'night' || s.amb === 'forest') && s.weather !== 'storm' },
  { name: 'owl', min: 13, max: 30, vol: 0.45, on: (s) => (s.amb === 'night' || s.amb === 'forest') && s.weather !== 'storm' },
];

/* ------------------------------------------------------------------ *
 * Engine
 * ------------------------------------------------------------------ */

export class AudioEngine {
  constructor(opts = {}) {
    const o = opts && typeof opts === 'object' ? opts : {};
    this._volumes = {
      master: clamp(num(o.master, 0.7), 0, 1),
      sfx: clamp(num(o.sfx, 0.9), 0, 1),
      ambience: clamp(num(o.ambience, 0.6), 0, 1),
    };
    this._enabled = true;
    this._ambIntensity = 1;
    this._ambName = 'none';
    this._weatherName = 'clear';
    this._layers = new Map();
    this._zombies = [];
    this._voices = [];
    this._acc = 0;
    this._t = 0;
    this._wild = WILDLIFE.map(() => rand(2, 9));
    this._thunderAt = rand(THUNDER_MIN, THUNDER_MAX);
    this._lastTick = 0;

    this._ctx = null;
    this._master = null;
    this._sfxBus = null;
    this._ambBus = null;
    this._sfxGain = null;
    this._ambGain = null;
    this._weatherBus = null;
    this._coreNodes = [];
    this._timer = null;
    this._disposed = false;
    this._inited = false;
  }

  /* ---------------- lifecycle ---------------- */

  /**
   * Create the audio graph. Idempotent: safe to call on every user gesture.
   * Resumes a suspended (mobile/autoplay-blocked) context.
   * @returns {boolean} true when a usable context exists.
   */
  init() {
    try {
      if (!this._ctx) {
        if (this._disposed) return false;
        const AC = detectAudioContextClass();
        if (!AC) return false;
        const ctx = new AC({ latencyHint: 'interactive' });
        if (!ctx) return false;

        // Shared noise buffers are cached on the context object itself.
        ctx.__fishGameAudio = {};

        const master = ctx.createGain();
        master.gain.value = this._enabled ? this._volumes.master : 0;

        const sfxBus = ctx.createGain();
        sfxBus.gain.value = this._volumes.sfx;
        const ambBus = ctx.createGain();
        ambBus.gain.value = this._volumes.ambience;

        const sfxGain = ctx.createGain();
        sfxGain.gain.value = 1;
        const ambGain = ctx.createGain();
        ambGain.gain.value = 1;

        sfxGain.connect(sfxBus);
        ambGain.connect(ambBus);
        sfxBus.connect(master);
        ambBus.connect(master);
        master.connect(ctx.destination);

        this._ctx = ctx;
        this._master = master;
        this._sfxBus = sfxBus;
        this._ambBus = ambBus;
        this._sfxGain = sfxGain;
        this._ambGain = ambGain;
        // Tracked so dispose() can disconnect the master graph itself.
        this._coreNodes = [master, sfxBus, ambBus, sfxGain, ambGain];
        // Weather sits between the ambience bed and the ambience bus.
        this._weatherBus = ambBus;
        this._startTimer();
      }
      if (this._ctx.state === 'suspended' && typeof this._ctx.resume === 'function') {
        const r = this._ctx.resume();
        if (r && typeof r.catch === 'function') r.catch(() => {});
      }
      this._inited = true;
      return true;
    } catch (_e) {
      return false;
    }
  }

  /** True when a context exists and is running (or resumable-runnable). */
  get ready() {
    try {
      const ctx = this._ctx;
      if (!ctx || this._disposed) return false;
      return ctx.state === 'running' || ctx.state === 'suspended';
    } catch (_e) {
      return false;
    }
  }

  /** Mute / unmute the whole graph without destroying it. */
  setEnabled(on) {
    try {
      this._enabled = !!on;
      const ctx = this._ctx;
      if (ctx && this._master) {
        const g = this._master.gain;
        const target = this._enabled ? this._volumes.master : 0;
        const t = ctx.currentTime;
        if (typeof g.cancelScheduledValues === 'function') g.cancelScheduledValues(t);
        if (typeof g.setValueAtTime === 'function') g.setValueAtTime(Math.max(EPS, g.value), t);
        if (typeof g.linearRampToValueAtTime === 'function') g.linearRampToValueAtTime(target, t + 0.05);
        else g.value = target;
      }
      if (this._enabled) this.init();
    } catch (_e) {
      /* never throw */
    }
    return this._enabled;
  }

  get enabled() {
    return this._enabled !== false;
  }

  /* ---------------- volumes ---------------- */

  /** kind: 'master' | 'sfx' | 'ambience'; value: 0..1 */
  setVolume(kind, value) {
    try {
      const k = typeof kind === 'string' ? kind : '';
      if (!Object.prototype.hasOwnProperty.call(this._volumes, k)) return this.getVolume(kind);
      const v = clamp(num(value, this._volumes[k]), 0, 1);
      this._volumes[k] = v;
      const ctx = this._ctx;
      const bus = k === 'master' ? this._master : k === 'sfx' ? this._sfxBus : this._ambBus;
      if (ctx && bus) {
        const target = k === 'master' && !this._enabled ? 0 : v;
        const g = bus.gain;
        const t = ctx.currentTime;
        if (typeof g.cancelScheduledValues === 'function') g.cancelScheduledValues(t);
        if (typeof g.setValueAtTime === 'function') g.setValueAtTime(Math.max(EPS, g.value), t);
        if (typeof g.linearRampToValueAtTime === 'function') g.linearRampToValueAtTime(target, t + 0.05);
        else g.value = target;
      }
    } catch (_e) {
      /* never throw */
    }
    return this.getVolume(kind);
  }

  getVolume(kind) {
    const k = typeof kind === 'string' ? kind : '';
    const v = Object.prototype.hasOwnProperty.call(this._volumes, k) ? this._volumes[k] : 0;
    return v;
  }

  /* ---------------- one-shots ---------------- */

  /**
   * Play a one-shot sound effect.
   * @param {string} name one of SFX
   * @param {{volume?:number, rate?:number, detune?:number, pan?:number}} [opts]
   */
  play(name, opts = {}) {
    try {
      const builder = typeof name === 'string' ? BUILDERS[name] : null;
      if (!builder) return false; // unknown name: silent no-op
      if (!this._enabled) return false;
      const ctx = this._ctx;
      if (!ctx || this._disposed) return false;
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        const r = ctx.resume();
        if (r && typeof r.catch === 'function') r.catch(() => {});
      }

      const o = opts && typeof opts === 'object' ? opts : {};
      const t0 = ctx.currentTime + 0.012;
      const hasDetune = num(o.detune, 0) !== 0;
      // Small random pitch scatter keeps repeated footsteps / ratchets organic.
      const scatter = hasDetune ? 0 : rand(-0.02, 0.02);
      const p = {
        volume: clamp(num(o.volume, 1), 0, 1),
        rate: clamp(num(o.rate, 1), 0.25, 4),
        detune: num(o.detune, 0),
        rnd: Math.random(),
        dur: 0.2,
        opts: o,
      };
      if (scatter) p.rate = clamp(p.rate * (1 + scatter), 0.25, 4);

      const routed = this._routed(clamp(num(o.pan, 0), -1, 1));
      const dest = routed ? routed.node : null;
      if (!dest) return false;
      const out = nodeGain(ctx, clamp(num(o.volume, 1), 0, 1));

      // Every node the builder creates is captured so the voice can release
      // them all: the builder only knows the destination it was handed.
      const tracked = [];
      builder(autotrack(ctx, tracked), out, t0, p);

      out.connect(dest);
      return this._track(ctx, out, tracked.concat(routed.tail), t0 + 2.2);
    } catch (_e) {
      return false;
    }
  }

  /* ---------------- ambience ---------------- */

  /**
   * Crossfade to a looping ambience bed.
   * @param {'none'|'shore'|'lake'|'forest'|'rain'|'storm'|'underwater'|'night'} name
   * @param {{fade?:number, intensity?:number}} [opts]
   */
  setAmbience(name, opts = {}) {
    try {
      const key = typeof name === 'string' ? name : 'none';
      const o = opts && typeof opts === 'object' ? opts : {};
      const wanted = key === 'none' || !LAYERS[key] ? (key === 'none' ? 'none' : this._ambName) : key;
      if (key !== 'none' && !LAYERS[key]) return this._ambName; // unknown bed: no-op
      const fade = clamp(num(o.fade, LAYER_FADE), 0.05, 10);
      if (typeof o.intensity === 'number') this._ambIntensity = clamp(num(o.intensity, 1), 0, 1);

      // A live context is required to build/run a bed; remember the request anyway.
      if (this._ctx && !this._disposed && !this._inited) this.init();

      for (const k of Array.from(this._layers.keys())) {
        if (k !== wanted) this._removeLayer(k, fade);
      }
      if (wanted !== 'none' && !this._layers.has(wanted) && this._ctx && !this._disposed) {
        const layer = this._buildLayer(wanted);
        if (layer) this._layers.set(wanted, layer);
      }
      this._ambName = wanted === 'none' ? 'none' : wanted;
      if (this._ctx) this._applyIntensity(0.08);
      return this._ambName;
    } catch (_e) {
      return this._ambName;
    }
  }

  /** 0..1 — scales the whole ambience bed (and weather layers with it). */
  setAmbienceIntensity(v) {
    try {
      this._ambIntensity = clamp(num(v, this._ambIntensity), 0, 1);
      this._applyIntensity(0.15);
    } catch (_e) {
      /* never throw */
    }
    return this._ambIntensity;
  }

  /**
   * Weather layer on top of the current ambience.
   * @param {'clear'|'cloudy'|'rain'|'storm'|'fog'|'snow'} name
   */
  setWeather(name) {
    try {
      const key = typeof name === 'string' ? name : 'clear';
      if (key !== 'clear' && !WEATHER[key]) return this._weatherName;
      const target = key === 'clear' || !WEATHER[key] ? null : key;
      const prev = this._weatherName;
      if (prev === key && !target) return this._weatherName;

      for (const k of Array.from(this._layers.keys())) {
        if (WEATHER[k] && k !== target) this._removeLayer(k, WEATHER_FADE);
      }
      if (target && !this._layers.has(target) && this._ctx && !this._disposed) {
        const layer = this._buildLayer(target);
        if (layer) this._layers.set(target, layer);
      }
      this._weatherName = key;
      if (key === 'storm' && prev !== 'storm') this._thunderAt = rand(THUNDER_MIN, THUNDER_MAX);
      this._applyIntensity(0.1);
      return this._weatherName;
    } catch (_e) {
      return this._weatherName;
    }
  }

  /* ---------------- per-frame ---------------- */

  /** @param {number} dt seconds since the previous frame */
  update(dt) {
    try {
      const d = clamp(num(dt, 0), 0, 0.5);
      if (!(d > 0)) return;
      this._t += d;

      const ctx = this._ctx;
      if (!ctx || this._disposed) return;

      if (ctx.state === 'suspended' && this._enabled && typeof ctx.resume === 'function') {
        const r = ctx.resume();
        if (r && typeof r.catch === 'function') r.catch(() => {});
      }

      // Voice bookkeeping happens every frame so nothing lingers between ticks.
      this._prune();
      this._pruneLayerEvents();
      this._pruneZombies();

      this._acc += d;
      if (this._acc < TICK) return;
      const step = this._acc;
      this._acc = 0;
      if (ctx.currentTime === this._lastTick) return;
      this._lastTick = ctx.currentTime;

      this._tickLayers(step, ctx.currentTime);
      this._tickWildlife(ctx, step);
      this._tickThunder(ctx, step);
    } catch (_e) {
      /* never throw */
    }
  }

  /* ---------------- teardown ---------------- */

  /** Stop every voice and bed, then close the AudioContext permanently. */
  dispose() {
    try {
      this._disposed = true;
      this._enabled = false;

      if (this._timer !== null) {
        try {
          clearInterval(this._timer);
        } catch (_e) {
          /* ignore */
        }
        this._timer = null;
      }

      const ctx = this._ctx;
      const t = ctx ? ctx.currentTime : 0;

      // Kill one-shot voices immediately.
      const voices = this._voices.slice();
      this._voices.length = 0;
      for (let i = 0; i < voices.length; i++) {
        this._release(voices[i]);
      }

      // Fade out beds, then tear them down (including any mid-crossfade bed).
      const leftovers = Array.from(this._layers.keys()).map((key) => this._layers.get(key));
      this._layers.clear();
      for (let i = 0; i < leftovers.length; i++) {
        const layer = leftovers[i];
        if (!layer) continue;
        try {
          this._fadeTo(layer.out, 0, 0.12, t);
        } catch (_e) {
          /* ignore */
        }
        this._destroyLayer(layer);
      }
      this._zombies.length = 0;

      // Master graph goes too: the context is about to close.
      this._disconnectAll(this._coreNodes);
      this._coreNodes = [];

      this._master = null;
      this._sfxBus = null;
      this._ambBus = null;
      this._sfxGain = null;
      this._ambGain = null;
      this._weatherBus = null;
      this._ctx = null;
      this._inited = false;

      if (ctx && typeof ctx.close === 'function') {
        try {
          const r = ctx.close();
          if (r && typeof r.catch === 'function') r.catch(() => {});
        } catch (_e) {
          /* ignore */
        }
      }
    } catch (_e) {
      /* never throw */
    }
  }

  /* ---------------- internals ---------------- */

  _startTimer() {
    if (this._timer !== null) return;
    try {
      if (typeof globalThis === 'undefined' || typeof globalThis.setInterval !== 'function') return;
      this._timer = globalThis.setInterval(() => {
        try {
          this.update(TICK);
        } catch (_e) {
          /* never throw */
        }
      }, TICK * 1000);
      if (this._timer && typeof this._timer === 'object' && typeof this._timer.unref === 'function') {
        this._timer.unref(); // Node safety only; browsers return a number
      }
    } catch (_e) {
      this._timer = null;
    }
  }

  /** Build a pan stage for one-shots; falls back to mono when unsupported. */
  _routed(pan) {
    const ctx = this._ctx;
    if (!ctx) return null;
    const tail = [];
    let node = ctx.createGain();
    tail.push(node);
    if (pan !== 0 && typeof ctx.createStereoPanner === 'function') {
      try {
        const p = ctx.createStereoPanner();
        p.pan.value = clamp(pan, -1, 1);
        node.connect(p);
        tail.push(p);
        node = p;
      } catch (_e) {
        /* mono fallback */
      }
    }
    return {
      node,
      disconnect() {
        for (let i = 0; i < tail.length; i++) {
          try {
            tail[i].disconnect();
          } catch (_e) {
            /* ignore */
          }
        }
      },
      tail,
    };
  }

  _track(ctx, out, tail, stopAt) {
    if (this._voices.length >= MAX_VOICES) {
      const order = this._voices
        .map((v) => v)
        .sort((a, b) => (a.stopAt || 0) - (b.stopAt || 0));
      for (let i = 0; i < order.length && this._voices.length >= MAX_VOICES; i++) {
        const idx = this._voices.indexOf(order[i]);
        if (idx < 0) continue;
        const old = this._voices.splice(idx, 1)[0];
        // Drop the oldest pending voice rather than grow without bound. A very
        // short ramp limits the click, then the nodes are released right here:
        // cleanup never depends on a timer that a stalled frame loop might skip.
        this._fadeOut(old, 0.025);
        this._release(old);
      }
    }
    const voice = { out, tail, stopAt: stopAt || ctx.currentTime + 2.2, released: false };
    try {
      out.addEventListener('ended', () => {
        const i = this._voices.indexOf(voice);
        if (i >= 0) this._voices.splice(i, 1);
        this._release(voice);
      });
    } catch (_e) {
      /* no-op: the scheduled stop in every builder still prevents leaks */
    }
    this._voices.push(voice);
    return true;
  }

  /** Very short gain ramp; used before a hard release to avoid a click. */
  _fadeOut(voice, dur) {
    try {
      const ctx = this._ctx;
      const out = voice && voice.out;
      if (!ctx || !out || !out.gain) return;
      const t = ctx.currentTime;
      if (typeof out.gain.cancelScheduledValues === 'function') out.gain.cancelScheduledValues(t);
      if (typeof out.gain.setValueAtTime === 'function') out.gain.setValueAtTime(Math.max(EPS, num(out.gain.value, EPS)), t);
      if (typeof out.gain.linearRampToValueAtTime === 'function') out.gain.linearRampToValueAtTime(EPS, t + dur);
    } catch (_e) {
      /* ignore */
    }
  }

  /** Hard release: stop sources, cancel the envelope, disconnect everything. */
  _release(voice) {
    if (!voice || voice.released) return;
    voice.released = true;
    try {
      const out = voice.out;
      if (out) {
        if (typeof out.gain.cancelScheduledValues === 'function') out.gain.cancelScheduledValues(0);
        out.gain.value = 0;
      }
    } catch (_e) {
      /* ignore */
    }
    const tail = voice.tail;
    if (tail) {
      for (let i = 0; i < tail.length; i++) {
        try {
          tail[i].disconnect();
        } catch (_e) {
          /* ignore */
        }
      }
    }
    try {
      if (voice.out) voice.out.disconnect();
    } catch (_e) {
      /* ignore */
    }
  }

  /** Drop voices whose scheduled end has certainly passed. */
  _prune() {
    const ctx = this._ctx;
    if (!ctx || !this._voices.length) return;
    const now = ctx.currentTime;
    for (let i = this._voices.length - 1; i >= 0; i--) {
      const v = this._voices[i];
      if (v.stopAt && now > v.stopAt + 0.05) {
        this._voices.splice(i, 1);
        this._release(v);
      }
    }
  }

  _buildLayer(name) {
    const ctx = this._ctx;
    if (!ctx) return null;
    const factory = LAYERS[name] || WEATHER[name];
    if (typeof factory !== 'function') return null;
    try {
      const tracked = [];
      const layer = factory(autotrack(ctx, tracked));
      if (!layer || !layer.out) {
        this._disconnectAll(tracked);
        return null;
      }
      layer.name = name;
      layer.weather = !!WEATHER[name];
      layer.zombie = false;
      // The factory's own tail plus everything the proxy observed, so a bed
      // is fully releasable even if it forgot to register a node.
      layer.tail = (layer.tail || []).concat(tracked);
      layer.out.gain.value = EPS;
      layer.out.connect(this._ambGain);
      layer.pending = [];
      if (typeof layer.update !== 'function') layer.update = null;
      this._fadeTo(layer.out, this._layerTarget(layer), LAYER_FADE, ctx.currentTime);
      return layer;
    } catch (_e) {
      return null;
    }
  }

  /** Best-effort disconnect of a node list (never throws). */
  _disconnectAll(nodes) {
    if (!nodes) return;
    for (let i = 0; i < nodes.length; i++) {
      try {
        if (nodes[i] && typeof nodes[i].disconnect === 'function') nodes[i].disconnect();
      } catch (_e) {
        /* ignore */
      }
    }
  }

  _layerTarget(layer) {
    if (!layer) return 0;
    const w = layer.weather ? 1 : this._ambIntensity;
    return clamp(w, 0, 1);
  }

  _applyIntensity(fade) {
    const ctx = this._ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const layer of this._layers.values()) {
      this._fadeTo(layer.out, this._layerTarget(layer), Math.max(0.02, fade), t);
    }
  }

  _removeLayer(key, fade) {
    const layer = this._layers.get(key);
    if (!layer) return;
    this._layers.delete(key);
    layer.zombie = true;
    const w = fade > 0 ? fade : 0.2;
    const ctx = this._ctx;
    this._fadeTo(layer.out, 0, w, ctx ? ctx.currentTime : 0);
    // Kept on a zombie list and torn down by update(): cleanup follows the
    // game's own frame loop instead of a timer that can be starved by a stall.
    layer.destroyAt = (ctx ? ctx.currentTime : 0) + w + 0.12;
    this._zombies.push(layer);
  }

  /** Tear down beds whose crossfade has finished. */
  _pruneZombies() {
    if (!this._zombies.length) return;
    const ctx = this._ctx;
    const now = ctx ? ctx.currentTime : 0;
    for (let i = this._zombies.length - 1; i >= 0; i--) {
      const layer = this._zombies[i];
      if (layer.destroyAt > now) continue;
      this._zombies.splice(i, 1);
      this._destroyLayer(layer);
    }
  }

  /** Stop and disconnect every node a layer owns. Safe to call twice. */
  _destroyLayer(layer, delay) {
    if (!layer || layer.destroyed) return;
    layer.destroyed = true;
    const run = () => {
      try {
        if (typeof layer.stop === 'function') layer.stop();
      } catch (_e) {
        /* ignore */
      }
      // Bed transients first, then the bed itself.
      const pending = layer.pending || [];
      for (let i = 0; i < pending.length; i++) this._releaseEvent(layer, pending[i]);
      layer.pending = [];
      const tail = layer.tail || [];
      for (let i = 0; i < tail.length; i++) {
        const n = tail[i];
        try {
          if (n && typeof n.stop === 'function' && n !== layer.out) n.stop();
        } catch (_e) {
          /* ignore */
        }
        try {
          if (n && typeof n.disconnect === 'function') n.disconnect();
        } catch (_e) {
          /* ignore */
        }
      }
      try {
        if (layer.out) layer.out.disconnect();
      } catch (_e) {
        /* ignore */
      }
    };
    void delay; // kept for signature compatibility; teardown is synchronous
    run();
  }

  /** Exponential-ish gain ramp that tolerates a cold or closed context. */
  _fadeTo(node, value, dur, now) {
    if (!node || !node.gain) return;
    const ctx = this._ctx;
    const t = num(now, ctx ? ctx.currentTime : 0);
    const v = clamp(num(value, 0), 0, 1);
    const d = clamp(num(dur, 0.2), 0.01, 12);
    const g = node.gain;
    try {
      if (typeof g.cancelScheduledValues === 'function') g.cancelScheduledValues(t);
      if (typeof g.setValueAtTime === 'function') g.setValueAtTime(clamp(num(g.value, EPS), EPS, 1), t);
      if (typeof g.linearRampToValueAtTime === 'function') g.linearRampToValueAtTime(v < EPS ? EPS : v, t + d);
      else g.value = v;
    } catch (_e) {
      try {
        g.value = v;
      } catch (_e2) {
        /* ignore */
      }
    }
  }

  _tickLayers(dt, now) {
    for (const layer of this._layers.values()) {
      if (layer.zombie || typeof layer.update !== 'function') continue;
      try {
        layer.update(dt, now + 0.02, this);
      } catch (_e) {
        /* ignore a misbehaving bed */
      }
    }
  }

  /**
   * Schedule a short transient inside an ambience/weather bed and remember it,
   * so the bed cannot accumulate orphaned nodes.
   * @param {object} layer owning layer
   * @param {number} t schedule time (context clock)
   * @param {number} dur seconds
   * @param {object} cfg burst() options
   */
  layerEvent(layer, t, dur, cfg) {
    try {
      const ctx = this._ctx;
      if (!layer || !ctx) return;
      const start = num(t, ctx.currentTime + 0.02);
      const length = clamp(num(dur, 0.1), 0.005, 4);
      const made = burst(ctx, layer.out, start, length, cfg);
      if (!made) return;
      if (!layer.pending) layer.pending = [];
      layer.pending.push({ nodes: [made.src, made.amp].concat(made.filters || []), until: start + length + 0.05 });
      while (layer.pending.length > MAX_LAYER_EVENTS) {
        this._releaseEvent(layer, layer.pending.shift());
      }
    } catch (_e) {
      /* never throw */
    }
  }

  /** Disconnect one finished bed transient. */
  _releaseEvent(layer, event) {
    if (!event || event.released) return;
    event.released = true;
    const nodes = event.nodes || [];
    for (let i = 0; i < nodes.length; i++) {
      try {
        const n = nodes[i];
        if (!n) continue;
        if (typeof n.stop === 'function' && !n.__stopped) {
          n.__stopped = true;
          n.stop();
        }
        if (typeof n.disconnect === 'function') n.disconnect();
      } catch (_e) {
        /* ignore */
      }
    }
  }

  /** Drop bed transients whose scheduled end has passed. */
  _pruneLayerEvents() {
    const ctx = this._ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const layer of this._layers.values()) {
      const pending = layer.pending;
      if (!pending || !pending.length) continue;
      for (let i = pending.length - 1; i >= 0; i--) {
        if (pending[i].until > now) continue;
        const event = pending.splice(i, 1)[0];
        this._releaseEvent(layer, event);
      }
    }
  }

  _tickWildlife(ctx, dt) {
    const state = { amb: this._ambName, weather: this._weatherName };
    if (state.amb === 'underwater' || state.amb === 'none') return;
    const storming = state.weather === 'storm' || state.amb === 'storm';
    for (let i = 0; i < WILDLIFE.length; i++) {
      const cue = WILDLIFE[i];
      this._wild[i] -= dt;
      if (this._wild[i] > 0) continue;
      this._wild[i] = rand(cue.min, cue.max);
      if (storming) continue; // thunder masks the wildlife
      try {
        if (cue.on(state)) this.play(cue.name, { volume: cue.vol * rand(0.85, 1.15), rate: rand(0.96, 1.05) });
      } catch (_e) {
        /* ignore */
      }
    }
  }

  _tickThunder(ctx, dt) {
    const storming = this._weatherName === 'storm' || this._ambName === 'storm';
    if (!storming) return;
    this._thunderAt -= dt;
    if (this._thunderAt > 0) return;
    this._thunderAt = rand(THUNDER_MIN, THUNDER_MAX);
    const close = Math.random() < 0.35;
    try {
      const builder = BUILDERS.thunder;
      const p = {
        volume: (close ? 0.85 : 0.6) * (0.8 + this._ambIntensity * 0.2),
        rate: rand(0.9, 1.04),
        detune: 0,
        rnd: Math.random(),
        dur: 0.2,
        spec: { close },
        opts: {},
      };
      const routed = this._routed(rand(-0.7, 0.7));
      if (!routed) return;
      const out = nodeGain(this._ctx, p.volume);
      const tracked = [];
      builder(autotrack(this._ctx, tracked), out, this._ctx.currentTime + 0.02, p);
      out.connect(routed.node);
      this._track(this._ctx, out, tracked.concat(routed.tail), this._ctx.currentTime + 5.2);
    } catch (_e) {
      /* ignore */
    }
  }
}

/* ------------------------------------------------------------------ *
 * Export metadata
 * ------------------------------------------------------------------ */

/** Every valid one-shot name accepted by AudioEngine#play(). */
export const SFX = Object.freeze([
  // fishing
  'cast',
  'splash',
  'splash_small',
  'bobber_land',
  'bite',
  'hook',
  'reel_tick',
  'reel_fast',
  'line_stress',
  'snap',
  'catch',
  'catch_rare',
  'escape',
  // UI
  'ui_click',
  'ui_open',
  'ui_close',
  'ui_tab',
  'ui_error',
  'coin',
  'level_up',
  'achieve',
  'save',
  // player
  'footstep_grass',
  'footstep_water',
  'footstep_wood',
  'footstep_rock',
  'footstep_sand',
  'jump',
  'land',
  'swim',
  'dive',
  'surface_gasp',
  // world
  'seagull',
  'frog',
  'insect',
  'owl',
  'thunder',
  'wind_gust',
  'wood_creak',
  'bell',
]);

/** Ambience bed names accepted by AudioEngine#setAmbience(). */
export const AMBIENCE = Object.freeze([
  'none',
  'shore',
  'lake',
  'forest',
  'rain',
  'storm',
  'underwater',
  'night',
]);

/** Weather layer names accepted by AudioEngine#setWeather(). */
export const WEATHER_NAMES = Object.freeze(['clear', 'cloudy', 'rain', 'storm', 'fog', 'snow']);

export default AudioEngine;
