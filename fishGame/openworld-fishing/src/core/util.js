/**
 * util.js — math, random, noise and formatting helpers shared by every system.
 * No dependencies. All functions are pure unless stated.
 */

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
export const smoothstep = (t) => t * t * (3 - 2 * t);
export const smoothRange = (a, b, x) => smoothstep(clamp01((x - a) / (b - a || 1e-6)));
export const sign = (v) => (v < 0 ? -1 : v > 0 ? 1 : 0);
export const sq = (v) => v * v;
export const dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
export const dist2sq = (ax, az, bx, bz) => sq(ax - bx) + sq(az - bz);

/** Frame-rate independent exponential smoothing. */
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));

/** Round to a fixed number of decimals (returns a Number). */
export const round = (v, d = 2) => {
  const m = Math.pow(10, d);
  return Math.round(v * m) / m;
};

export const wrapAngle = (a) => {
  a = (a + Math.PI) % TAU;
  if (a < 0) a += TAU;
  return a - Math.PI;
};

export const angleLerp = (a, b, t) => a + wrapAngle(b - a) * t;

export const rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
export const pick = (arr) => (arr && arr.length ? arr[(Math.random() * arr.length) | 0] : undefined);
export const chance = (p) => Math.random() < p;

/** Weighted pick. `weight` may be a key name or a function. */
export function pickWeighted(items, weight) {
  if (!items || !items.length) return undefined;
  const wf = typeof weight === 'function' ? weight : (it) => it[weight];
  let total = 0;
  for (const it of items) total += Math.max(0, wf(it) || 0);
  if (total <= 0) return pick(items);
  let r = Math.random() * total;
  for (const it of items) {
    r -= Math.max(0, wf(it) || 0);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

/** Sum of weights (used to normalise tables). */
export function weightSum(items, weight) {
  const wf = typeof weight === 'function' ? weight : (it) => it[weight];
  let t = 0;
  for (const it of items) t += Math.max(0, wf(it) || 0);
  return t;
}

/** Deterministic 32-bit PRNG. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic string -> integer hash (for seeding from an id). */
export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Cheap integer hash for grid coordinates. */
export function hash2(x, y, seed = 0) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Approximate standard normal (sum of 3 uniforms) — cheap, bounded to ±1.5σ. */
export const gaussian = () => (Math.random() + Math.random() + Math.random() - 1.5) * 1.1547;

/**
 * Classic Perlin-style gradient noise in 2D with a seeded permutation table.
 */
export class Noise2D {
  constructor(seed = 1337) {
    const rnd = mulberry32(seed);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = (rnd() * (i + 1)) | 0;
      const t = p[i];
      p[i] = p[j];
      p[j] = t;
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
    // Gradient components are precomputed once: doing cos/sin inside the noise
    // inner loop dominated terrain generation (millions of trig calls).
    this.gx = new Float32Array(256);
    this.gz = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const a = (p[i] / 255) * Math.PI * 2;
      this.gx[i] = Math.cos(a);
      this.gz[i] = Math.sin(a);
    }
  }

  /** Perlin noise in roughly [-1, 1]. */
  noise(x, y) {
    const gx = this.gx;
    const gz = this.gz;
    const perm = this.perm;
    const fx = Math.floor(x);
    const fy = Math.floor(y);
    const X = fx & 255;
    const Y = fy & 255;
    const xf = x - fx;
    const yf = y - fy;
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);

    const xm = xf - 1;
    const ym = yf - 1;
    const h00 = perm[perm[X] + Y] & 255;
    const h10 = perm[perm[X + 1] + Y] & 255;
    const h01 = perm[perm[X] + Y + 1] & 255;
    const h11 = perm[perm[X + 1] + Y + 1] & 255;

    const n00 = gx[h00] * xf + gz[h00] * yf;
    const n10 = gx[h10] * xm + gz[h10] * yf;
    const n01 = gx[h01] * xf + gz[h01] * ym;
    const n11 = gx[h11] * xm + gz[h11] * ym;

    const x1 = n00 + (n10 - n00) * u;
    const x2 = n01 + (n11 - n01) * u;
    return (x1 + (x2 - x1) * v) * 0.9;
  }

  /** Fractal Brownian motion. */
  fbm(x, y, octaves = 4, lacunarity = 2.0, gain = 0.5) {
    let amp = 1;
    let freq = 1;
    let sum = 0;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * this.noise(x * freq, y * freq);
      norm += amp;
      amp *= gain;
      freq *= lacunarity;
    }
    return norm ? sum / norm : 0;
  }

  /** Ridged multifractal — good for mountain crests. */
  ridged(x, y, octaves = 4, lacunarity = 2.1, gain = 0.5) {
    let amp = 1;
    let freq = 1;
    let sum = 0;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
      const n = 1 - Math.abs(this.noise(x * freq, y * freq));
      sum += amp * n * n;
      norm += amp;
      amp *= gain;
      freq *= lacunarity;
    }
    return norm ? sum / norm : 0;
  }

  /** Billowy noise — rounded, cloud-like shapes (sand dunes, rolling hills). */
  billow(x, y, octaves = 3) {
    let amp = 1;
    let freq = 1;
    let sum = 0;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * Math.abs(this.noise(x * freq, y * freq));
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return norm ? (sum / norm) * 2 - 1 : 0;
  }
}

/** Format a 0..24 hour float as HH:MM. */
export function formatClock(hours) {
  const h = ((hours % 24) + 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function formatWeight(kg) {
  if (kg < 1) return `${Math.round(kg * 1000)} g`;
  if (kg < 10) return `${kg.toFixed(2)} kg`;
  if (kg < 100) return `${kg.toFixed(1)} kg`;
  return `${Math.round(kg)} kg`;
}

export function formatLength(cm) {
  return cm >= 100 ? `${(cm / 100).toFixed(2)} m` : `${Math.round(cm)} cm`;
}

export function formatCoins(v) {
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e4) return `${(v / 1e3).toFixed(1)}k`;
  return `${Math.round(v)}`;
}

/** Seconds -> "3分12秒" style short duration. */
export function formatDuration(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return `${h}小时${m}分`;
  if (m) return `${m}分${s}秒`;
  return `${s}秒`;
}

/** Simple event emitter used for cross-system messaging. */
export class Emitter {
  constructor() {
    this._map = new Map();
  }
  on(type, fn) {
    if (!this._map.has(type)) this._map.set(type, new Set());
    this._map.get(type).add(fn);
    return () => this.off(type, fn);
  }
  once(type, fn) {
    const off = this.on(type, (payload) => {
      off();
      fn(payload);
    });
    return off;
  }
  off(type, fn) {
    this._map.get(type)?.delete(fn);
  }
  emit(type, payload) {
    const set = this._map.get(type);
    if (set) for (const fn of Array.from(set)) {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[emitter] handler for "${type}" threw:`, err);
      }
    }
    const any = this._map.get('*');
    if (any) for (const fn of Array.from(any)) {
      try {
        fn(type, payload);
      } catch (err) {
        console.error('[emitter] * handler threw:', err);
      }
    }
  }
  clear() {
    this._map.clear();
  }
}

/** Small ring buffer of numbers for smoothing (fps, speed...). */
export class Ring {
  constructor(size = 60) {
    this.size = size;
    this.data = new Float32Array(size);
    this.idx = 0;
    this.count = 0;
  }
  push(v) {
    this.data[this.idx] = v;
    this.idx = (this.idx + 1) % this.size;
    if (this.count < this.size) this.count++;
  }
  get avg() {
    if (!this.count) return 0;
    let s = 0;
    for (let i = 0; i < this.count; i++) s += this.data[i];
    return s / this.count;
  }
  get max() {
    let m = -Infinity;
    for (let i = 0; i < this.count; i++) m = Math.max(m, this.data[i]);
    return m === -Infinity ? 0 : m;
  }
}
