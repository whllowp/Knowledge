/**
 * minimap.js — 2D canvas minimap renderer for the open-world fishing game.
 * ---------------------------------------------------------------------------
 * Browser-only, plain ESM, zero dependencies, no external images: every pixel
 * is produced procedurally from the terrain samplers you hand in.
 *
 * Public API (exact)
 *
 *   new Minimap(canvas, opts)
 *     canvas              HTMLCanvasElement (its backing store is resized for DPR)
 *     opts.worldSize      number   world is a square centred on the origin, so
 *                                  x and z both live in [-worldSize/2, +worldSize/2]
 *     opts.waterLevel     number   terrain height at/below this is water
 *     opts.heightAt       (x, z) => number   terrain height (negative = depth)
 *     opts.biomeAt        (x, z) => string   biome id
 *     opts.spots          Array<{ id, name, x, z, radius, water, biome,
 *                                 minLevel, color?, rarity? }>
 *     opts.colors         Record<biomeId, hex>   merged over a built-in palette
 *     opts.waterColors    Record<waterType, hex> optional overrides; the keys
 *                                 "shallow" and "deep" tune the depth ramp
 *
 *   bake()                sample heightAt/biomeAt ONCE into an offscreen canvas
 *   setSpots(spots)       replace the spot list
 *   setDiscovered(ids)    array/Set of discovered ids; null/undefined clears the
 *                         filter (with no filter every spot is treated as known)
 *   update(view)          redraw; view = { px, pz, yaw, activeSpotId }
 *   setMode(mode)         'local' (zoomed, rotated with the player) or 'world'
 *   getMode()             current mode string
 *   dispose()             release offscreen canvases, cancel a pending bake
 *
 * Conventions
 *   North is -Z (screen up in world mode). The player faces (sin yaw, cos yaw)
 *   in world XZ; pass opts.yawOffset (radians) when the engine uses a different
 *   convention. Depth is waterLevel - height, so negative heights are underwater.
 *   Default mode is 'local'. In 'local' the visible window is opts.localSpan
 *   (default 260) world units wide and the player arrow sits at the centre.
 *
 * Baking / performance
 *   bake() walks the sample grid in row chunks against a ~12 ms frame budget
 *   (adaptive, 6-26 ms) and continues on later animation frames, so it never
 *   stalls the game loop; the partially painted bitmap is usable immediately.
 *   Sampling plus colouring the whole grid stays well under ~1.5 s of total work
 *   for the default grid (288-768 samples per axis, picked from worldSize), and
 *   bake() is safe to call again at any time to re-bake from scratch. update()
 *   never samples the terrain: it only composites the baked bitmap and a handful
 *   of vector draw calls, and it re-creates the backing store when the CSS size
 *   or devicePixelRatio changed. A missing or failed bake degrades to a flat
 *   panel; nothing here throws on empty/undefined spot lists.
 */

const TAU = Math.PI * 2;

/** Marker half-size, CSS px. */
const SPOT_R = 3.4;

/** Adaptive frame budget for one bake chunk, milliseconds. */
const MIN_BUDGET = 6;
const MAX_BUDGET = 26;
/** Built-in biome palette (opts.colors is merged on top of this). */
const DEFAULT_COLORS = {
  ocean_deep: '#0a2d4a',
  ocean: '#0e3c5e',
  sea: '#0e3c5e',
  ocean_shallow: '#2f6b83',
  lake: '#12496b',
  river: '#155a7a',
  pond: '#155a7a',
  stream: '#155a7a',
  bay: '#14608e',
  lagoon: '#1f8fa8',
  reef: '#1596a8',
  coast: '#1d6f92',
  estuary: '#1a6a86',
  shore: '#2f6b83',
  bank: '#2f6b83',
  forest: '#1d4a2b',
  jungle: '#1b4a25',
  meadow: '#3c6b35',
  grass: '#3c6b35',
  plains: '#4a7340',
  beach: '#c2b280',
  sand: '#c2b280',
  desert: '#b99a5b',
  rock: '#6b6b6b',
  mountain: '#5e5e63',
  cliff: '#57575c',
  snow: '#dfe9f0',
  tundra: '#cfd8de',
  ice: '#cfe6f2',
  swamp: '#3a4a2a',
  marsh: '#3f5440',
  village: '#5a5a55',
  default: '#2f4a3a',
};

/** Depth-shading ramp endpoints; override with opts.waterColors.shallow/.deep. */
const DEFAULT_WATER = { shallow: '#3fb6ad', deep: '#0a2d4a' };

/** Water-type fallbacks for spot markers when no explicit colour is supplied. */
const WATER_TYPE_COLORS = {
  ocean: '#0f4a74',
  sea: '#0f4a74',
  ocean_deep: '#0a2d4a',
  deep: '#0a2d4a',
  lake: '#1b6d92',
  river: '#2b8fa8',
  stream: '#2b8fa8',
  pond: '#2b8fa8',
  bay: '#14608e',
  lagoon: '#1f8fa8',
  reef: '#1596a8',
  swamp: '#41604a',
  marsh: '#41604a',
};

/** Rarity 1..5 marker palette (mirrors the game's --r1 .. --r5 CSS vars). */
const RARITY_COLORS = ['#ffffff', '#8ad4ff', '#b98cff', '#ffd166', '#ff7a45'];

const WATER_BIOME = /(ocean|sea|lake|river|pond|stream|water|bay|lagoon|reef|swamp|marsh|fjord|estuary|cove|coast|shore|bank|shallow|ice)/;

const RGB_CACHE = new Map();

function clamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function toNum(v, fallback) {
  const n = typeof v === 'number' ? v : Number(v);
  return isFinite(n) ? n : fallback;
}

function nowMs() {
  if (typeof performance !== 'undefined' && performance && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

/** Parse '#rgb' / '#rrggbb' / '#rrggbbaa' / 'rgb(a)(...)' into [r, g, b]. */
function toRgb(color, fallback) {
  const rgb = parseRgb(color);
  return rgb || fallback;
}

function parseRgb(color) {
  if (typeof color !== 'string') return null;
  const cached = RGB_CACHE.get(color);
  if (cached !== undefined) return cached;

  let out = null;
  const s = color.trim();
  if (s.charCodeAt(0) === 35) {
    const hex = s.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      if (isFinite(r) && isFinite(g) && isFinite(b)) out = [r, g, b];
    } else if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (isFinite(r) && isFinite(g) && isFinite(b)) out = [r, g, b];
    }
  } else if (s.charCodeAt(0) === 114 /* r */) {
    const m = s.match(/(-?[\d.]+)/g);
    if (m && m.length >= 3) {
      const r = clamp(Math.round(parseFloat(m[0])), 0, 255);
      const g = clamp(Math.round(parseFloat(m[1])), 0, 255);
      const b = clamp(Math.round(parseFloat(m[2])), 0, 255);
      out = [r, g, b];
    }
  }

  RGB_CACHE.set(color, out);
  return out;
}

/** Highest multiplier that keeps a colour inside 0..255 on the lit side. */
function hiHeadroom(r, g, b) {
  const m = r > g ? (r > b ? r : b) : (g > b ? g : b);
  return m > 0 ? 255 / m : 1.42;
}

function normalizeSpots(spots) {
  if (!spots || typeof spots.length !== 'number') return [];
  const out = [];
  for (let i = 0; i < spots.length; i++) {
    const s = spots[i];
    if (!s || typeof s !== 'object') continue;
    if (!isFinite(toNum(s.x, NaN)) || !isFinite(toNum(s.z, NaN))) continue;
    out.push(s);
  }
  return out;
}

export class Minimap {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} opts see the file header for the full option list
   */
  constructor(canvas, opts) {
    const o = opts || {};

    this.canvas = canvas || null;
    this.ctx = null;
    try {
      this.ctx = canvas && typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
    } catch (err) {
      this.ctx = null;
    }

    // ---- world / sampling -------------------------------------------------
    const worldSize = toNum(o.worldSize, 4000);
    this.worldSize = worldSize > 0 ? worldSize : 4000;
    this.waterLevel = toNum(o.waterLevel, 0);
    this.heightAt = typeof o.heightAt === 'function' ? o.heightAt : () => 0;
    this.biomeAt = typeof o.biomeAt === 'function' ? o.biomeAt : () => '';
    this.colors = Object.assign({}, DEFAULT_COLORS, o.colors || {});
    this.waterColors = Object.assign({}, DEFAULT_WATER, o.waterColors || {});

    // ---- bake grid --------------------------------------------------------
    // ~3.5 world units per sample: 384 samples for a 1200-unit world, capped so
    // a huge world still bakes fast.
    const auto = clamp(Math.round(this.worldSize / 3.5), 384, 768);
    this.bakeSamples = clamp(Math.round(toNum(o.bakeSamples, auto)), 128, 1024);
    const texel = this.worldSize / this.bakeSamples;

    // ---- look / feel ------------------------------------------------------
    this.mode = o.mode === 'world' ? 'world' : 'local';
    this.localSpan = Math.max(20, toNum(o.localSpan, 260));
    this.yawOffset = toNum(o.yawOffset, 0);
    this.gridStep = clamp(toNum(o.gridStep, this.localSpan / 4), 8, 2048);
    this.shadeStrength = clamp(toNum(o.shadeStrength, 0.85), 0, 4);
    this.showLabels = o.showLabels !== false;
    this.labelDistance = Math.max(0, toNum(o.labelDistance, 120));
    this.accent = typeof o.accent === 'string' ? o.accent : '#4fd1c5';
    this.deepDepth = Math.max(8, toNum(o.deepDepth, this.worldSize * 0.012));
    // Wide enough to survive the bake resolution, so the shoreline reads.
    this.shoreDepth = Math.max(0.5, toNum(o.shoreDepth, Math.max(this.worldSize * 0.004, texel * 2.5)));

    // Sun from the north-west, used for the hillshade on land.
    this._lightX = -0.72;
    this._lightZ = -0.72;

    // ---- spots ------------------------------------------------------------
    this._spots = normalizeSpots(o.spots);
    this._discovered = null; // null = no filter, every spot counts as known
    if (o.discovered) this.setDiscovered(o.discovered);
    this._activeId = null;

    // ---- offscreen bake state --------------------------------------------
    this._bakeCanvas = null;
    this._bakeCtx = null;
    this._bakeImg = null;
    this._heights = null;
    this._biomes = new Uint16Array(this.bakeSamples * this.bakeSamples);
    this._palette = null;
    this._paletteMap = null;
    this._shallowRgb = toRgb(this.waterColors.shallow, [63, 182, 173]);
    this._deepRgb = toRgb(this.waterColors.deep, [10, 45, 74]);
    this._bakeRow = 0;
    this._bakePhase = 0;
    this._bakeToken = 0;
    this._bakeRaf = null;
    this._bakeTimer = null;
    this._budget = 12;
    this._baked = false;
    this._baking = false;
    this._autoBakeAt = 0;
    this._canBake = typeof document !== 'undefined';
    this._progress = 0;

    // ---- canvas state -----------------------------------------------------
    this._disposed = false;
    this._cssW = 0;
    this._cssH = 0;
    this._dpr = 0;
    this._frame = 0;
  }

  // =========================================================================
  // Public API
  // =========================================================================

  /**
   * Sample the terrain once into an offscreen canvas. Runs in row chunks with an
   * adaptive frame budget: cheap worlds finish inside the first chunk, expensive
   * ones resume on later frames. Safe to call repeatedly.
   */
  bake() {
    if (this._disposed) return;
    this._cancelBake();
    this._baked = false;
    this._progress = 0;

    if (!this._canBake || !this.ctx) {
      this._canBake = false;
      return;
    }

    const n = this.bakeSamples;
    try {
      if (!this._bakeCanvas || this._bakeCanvas.width !== n) {
        this._bakeCanvas = document.createElement('canvas');
        this._bakeCanvas.width = n;
        this._bakeCanvas.height = n;
      }
      this._bakeCtx = this._bakeCanvas.getContext('2d');
      if (!this._bakeCtx) {
        this._canBake = false;
        return;
      }
      this._bakeImg = this._bakeCtx.createImageData(n, n);
    } catch (err) {
      this._canBake = false;
      this._bakeCanvas = null;
      this._bakeCtx = null;
      this._bakeImg = null;
      return;
    }

    this._heights = new Float32Array(n * n);
    this._biomes = new Uint16Array(n * n);
    this._palette = [];
    this._paletteMap = new Map();
    // Re-resolve the water ramp so late edits to opts.waterColors take effect.
    this._shallowRgb = toRgb(this.waterColors.shallow, [63, 182, 173]);
    this._deepRgb = toRgb(this.waterColors.deep, [10, 45, 74]);
    this._bakeRow = 0;
    this._bakePhase = 0;
    this._budget = 12;
    this._bakeToken++;
    this._baking = true;
    this._bakeChunk(this._bakeToken);
  }

  /** Replace the spot list. Tolerant of null/undefined entries. */
  setSpots(spots) {
    this._spots = normalizeSpots(spots);
  }

  /**
   * Set the discovered spot ids.
   * @param {Array|Set|null} ids null/undefined clears the filter (draw every spot)
   */
  setDiscovered(ids) {
    if (ids == null) {
      this._discovered = null;
      return;
    }
    try {
      this._discovered = ids instanceof Set ? new Set(ids) : new Set(Array.from(ids));
    } catch (err) {
      this._discovered = null;
    }
  }

  /** Redraw. view = { px, pz, yaw, activeSpotId }. */
  update(view) {
    if (this._disposed) return;
    const ctx = this.ctx;
    const canvas = this.canvas;
    if (!ctx || !canvas) return;

    const v = view || {};
    if ('activeSpotId' in v) this._activeId = v.activeSpotId;

    // Lazily bake on the first draw (or after a failed bake). The _baking guard
    // matters: a multi-frame bake must not be restarted by every update(), and
    // _autoBakeAt backs off for a second after a structural failure so a broken
    // canvas cannot become a per-frame retry loop.
    if (!this._baked && !this._baking && this._canBake && nowMs() >= this._autoBakeAt) this.bake();

    // Throttle the minimap to ~10 Hz (v6.1.0): the map is a 200px canvas and
    // redrawing it every frame cost layout + draw time for no visible gain.
    const nowT = nowMs();
    if (nowT - (this._lastDraw || 0) < 95) return;
    this._lastDraw = nowT;

    const size = this._measureCached(canvas);
    if (!size) return;
    const W = size.w;
    const H = size.h;

    ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Void backdrop so areas outside the world are not transparent.
    ctx.fillStyle = '#04141b';
    ctx.fillRect(0, 0, W, H);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';

    const px = toNum(v.px, 0);
    const pz = toNum(v.pz, 0);
    const yaw = toNum(v.yaw, 0);

    if (this.mode === 'local') this._drawLocal(ctx, W, H, px, pz, yaw);
    else this._drawWorld(ctx, W, H, px, pz, yaw);

    this._drawFrame(ctx, W, H);
    this._frame++;
  }

  /** @param {'local'|'world'} mode */
  setMode(mode) {
    if (mode === 'local' || mode === 'world') this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  /** Cancel any pending bake work and drop the offscreen canvases. */
  dispose() {
    this._disposed = true;
    this._cancelBake();
    this._bakeCanvas = null;
    this._bakeCtx = null;
    this._bakeImg = null;
    this._heights = null;
    this._biomes = null;
    this._palette = null;
    this._paletteMap = null;
    this._spots = [];
    this._baked = false;
    this._baking = false;
  }

  // =========================================================================
  // Baking
  // =========================================================================

  _cancelBake() {
    this._bakeToken++;
    this._baking = false;
    if (this._bakeRaf != null) {
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this._bakeRaf);
      this._bakeRaf = null;
    }
    if (this._bakeTimer != null) {
      if (typeof clearTimeout === 'function') clearTimeout(this._bakeTimer);
      this._bakeTimer = null;
    }
  }

  _scheduleBake(token) {
    if (this._disposed || token !== this._bakeToken) return;
    const run = () => {
      this._bakeRaf = null;
      this._bakeTimer = null;
      this._bakeChunk(token);
    };
    if (typeof requestAnimationFrame === 'function') {
      this._bakeRaf = requestAnimationFrame(run);
    } else if (typeof setTimeout === 'function') {
      this._bakeTimer = setTimeout(run, 8);
    }
  }

  /**
   * One chunk of bake work: phase 0 samples height + biome per row, phase 1
   * turns those samples into shaded RGBA pixels.
   */
  _bakeChunk(token) {
    this._bakeRaf = null;
    this._bakeTimer = null;
    if (this._disposed || token !== this._bakeToken) return;

    const n = this.bakeSamples;
    const img = this._bakeImg;
    const heights = this._heights;
    if (!img || !heights || !this._biomes || !this._palette) {
      this._baking = false;
      return;
    }

    const t0 = nowMs();
    const budget = this._budget;
    let row = this._bakeRow;

    try {
      while (row < n) {
        if (this._bakePhase === 0) this._sampleRow(row, n);
        else this._colourRow(row, n);
        row++;
        if (nowMs() - t0 >= budget) break;
      }
    } catch (err) {
      // A throwing sampler must not break the renderer; keep the partial bake.
      this._baking = false;
      this._autoBakeAt = nowMs() + 1000;
      this._baked = row > 0 && this._bakePhase === 1;
      this._progress = row / n;
      return;
    }

    this._bakeRow = row;
    const spent = nowMs() - t0;
    // A chunk normally stops right at its budget, so only a real overshoot (one
    // row slower than the budget) justifies shrinking; under-spending grows it.
    if (spent < budget * 0.6 && row < n) this._budget = Math.min(MAX_BUDGET, this._budget * 1.5);
    else if (spent > budget * 2.2) this._budget = Math.max(MIN_BUDGET, this._budget * 0.6);

    if (row < n) {
      this._progress = ((this._bakePhase === 0 ? 0 : 0.5) + (row / n) * 0.5) * 0.999;
      this._scheduleBake(token);
      return;
    }

    if (this._bakePhase === 0) {
      this._bakePhase = 1;
      this._bakeRow = 0;
      this._scheduleBake(token);
      return;
    }

    try {
      this._bakeCtx.putImageData(img, 0, 0);
    } catch (err) {
      this._baking = false;
      return;
    }
    this._baking = false;
    this._baked = true;
    this._progress = 1;
  }

  /** Phase 0: height + biome palette index for every sample of one row. */
  _sampleRow(row, n) {
    const S = this.worldSize;
    const half = S * 0.5;
    const inv = S / n;
    const z = (row + 0.5) * inv - half;
    const heights = this._heights;
    const biomes = this._biomes;
    const hAt = this.heightAt;
    const bAt = this.biomeAt;
    const base = row * n;
    let col = 0;

    try {
      for (; col < n; col++) {
        const x = (col + 0.5) * inv - half;
        let h = hAt(x, z);
        if (typeof h !== 'number') h = Number(h);
        if (!isFinite(h)) h = 0;
        heights[base + col] = h;
        biomes[base + col] = this._paletteIndex(bAt(x, z));
      }
    } catch (err) {
      for (; col < n; col++) {
        heights[base + col] = 0;
        biomes[base + col] = this._paletteIndex('');
      }
    }
  }

  _paletteIndex(biome) {
    const key = typeof biome === 'string' ? biome : (biome == null ? '' : String(biome));
    const map = this._paletteMap;
    let idx = map.get(key);
    if (idx !== undefined) return idx;

    const inWater = Object.prototype.hasOwnProperty.call(this.waterColors, key);
    const override = inWater ? this.waterColors[key] : undefined;
    const own = this.colors[key];
    const hex = override !== undefined ? override
      : (own !== undefined ? own : (this.colors.default || DEFAULT_COLORS.default));
    const rgb = toRgb(hex, [47, 74, 58]);
    // A biome id named like water, or listed in opts.waterColors, is water; only
    // biomes with a real colour entry may tint the ramp (otherwise the default
    // fallback colour would turn deep water green).
    const isWater = WATER_BIOME.test(key) || inWater;
    const explicit = override !== undefined || own !== undefined;
    idx = this._palette.length;
    this._palette.push({ r: rgb[0], g: rgb[1], b: rgb[2], water: isWater, explicit });
    map.set(key, idx);
    return idx;
  }

  /**
   * Phase 1: shaded RGBA for one row.
   * Water: lerp(shallow turquoise, deep colour, depth) with the biome colour
   * blended back in near the waterline. Land: cheap NW hillshade.
   */
  _colourRow(row, n) {
    const S = this.worldSize;
    const wl = this.waterLevel;
    const px = S / n;
    const deepDepth = this.deepDepth;
    const shoreDepth = this.shoreDepth;
    const invDeep = 1 / deepDepth;
    const invShore = 1 / shoreDepth;
    const data = this._bakeImg.data;
    const heights = this._heights;
    const biomes = this._biomes;
    const palette = this._palette;
    const shallow = this._shallowRgb;
    const deep = this._deepRgb;
    const shade = this.shadeStrength;
    const lx = this._lightX;
    const lz = this._lightZ;
    const base = row * n;
    const rowUp = row > 0 ? base - n : base;
    const rowDn = row < n - 1 ? base + n : base;

    for (let col = 0; col < n; col++) {
      const i = base + col;
      const pal = palette[biomes[i]];
      const h = heights[i];
      let r;
      let g;
      let b;

      if (h <= wl) {
        const depth = wl - h;
        let t = depth * invDeep;
        if (t > 1) t = 1;
        else if (t < 0) t = 0;
        t = Math.sqrt(t); // brighter shallows, quick falloff into the deep
        const dcol = (pal.water && pal.explicit) ? pal : null;
        const dr = dcol ? dcol.r : deep[0];
        const dg = dcol ? dcol.g : deep[1];
        const db = dcol ? dcol.b : deep[2];

        r = lerp(shallow[0], dr, t);
        g = lerp(shallow[1], dg, t);
        b = lerp(shallow[2], db, t);

        if (depth < shoreDepth && pal.explicit) {
          let k = 1 - depth * invShore;
          if (k < 0) k = 0;
          k = k * k * 0.55; // natural, soft shoreline
          r = lerp(r, pal.r, k);
          g = lerp(g, pal.g, k);
          b = lerp(b, pal.b, k);
        }
      } else {
        const left = col > 0 ? heights[i - 1] : h;
        const right = col < n - 1 ? heights[i + 1] : h;
        const up = heights[rowUp + col];
        const dn = heights[rowDn + col];
        const gx = (right - left) / (2 * px);
        const gz = (dn - up) / (2 * px);
        const lit = -(gx * lx + gz * lz) * shade;
        // Keep highlight headroom per biome so bright surfaces (snow, beach)
        // keep their relief instead of clipping to flat white.
        const hi = clamp(hiHeadroom(pal.r, pal.g, pal.b), 1, 1.42);
        const f = clamp(1 + lit, 0.62, hi);
        r = pal.r * f;
        g = pal.g * f;
        b = pal.b * f;
      }

      const o = i << 2;
      data[o] = r < 0 ? 0 : (r > 255 ? 255 : r);
      data[o + 1] = g < 0 ? 0 : (g > 255 ? 255 : g);
      data[o + 2] = b < 0 ? 0 : (b > 255 ? 255 : b);
      data[o + 3] = 255;
    }
  }

  // =========================================================================
  // Canvas sizing
  // =========================================================================

  /**
   * Cached variant of _measure: the CSS box only changes on resize, so reading
   * it every frame meant a forced layout each frame (v6.1.0).
   */
  _measureCached(canvas) {
    if (this._sizeCache && nowMs() - this._sizeCache.at < 1000) return this._sizeCache.size;
    const size = this._measure(canvas);
    this._sizeCache = { at: nowMs(), size };
    return size;
  }

  /** Resolve the CSS box and refresh the DPR-scaled backing store if needed. */
  _measure(canvas) {
    let w = toNum(canvas.clientWidth, 0);
    let h = toNum(canvas.clientHeight, 0);
    if ((!w || !h) && typeof canvas.getBoundingClientRect === 'function') {
      try {
        const rect = canvas.getBoundingClientRect();
        if (rect) {
          if (!w) w = toNum(rect.width, 0);
          if (!h) h = toNum(rect.height, 0);
        }
      } catch (err) { /* keep falling through */ }
    }
    if (!w || !h) {
      w = this._cssW || toNum(canvas.width, 0) || 188;
      h = this._cssH || toNum(canvas.height, 0) || 188;
    }
    if (!(w > 0) || !(h > 0)) return null;

    const raw = typeof devicePixelRatio === 'number' ? devicePixelRatio : 1;
    const dpr = Math.max(1, Math.min(isFinite(raw) && raw > 0 ? raw : 1, 2));

    if (w !== this._cssW || h !== this._cssH || dpr !== this._dpr) {
      this._cssW = w;
      this._cssH = h;
      this._dpr = dpr;
      const bw = Math.max(1, Math.round(w * dpr));
      const bh = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== bw) canvas.width = bw;
      if (canvas.height !== bh) canvas.height = bh;
    }
    return { w, h };
  }

  // =========================================================================
  // Drawing
  // =========================================================================

  /** Whole world fitted into the canvas, north-up. */
  _drawWorld(ctx, W, H, px, pz, yaw) {
    const S = this.worldSize;
    const half = S * 0.5;
    const size = Math.min(W, H);
    const ox = (W - size) * 0.5;
    const oy = (H - size) * 0.5;

    if (this._baked && this._bakeCanvas) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(this._bakeCanvas, ox, oy, size, size);
    } else {
      ctx.fillStyle = '#0b2430';
      ctx.fillRect(ox, oy, size, size);
    }

    // Subtle grid.
    ctx.strokeStyle = 'rgba(255,255,255,0.09)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      const t = (i / 4) * size;
      ctx.moveTo(ox + t, oy);
      ctx.lineTo(ox + t, oy + size);
      ctx.moveTo(ox, oy + t);
      ctx.lineTo(ox + size, oy + t);
    }
    ctx.stroke();

    const project = (x, z) => [
      ox + ((x + half) / S) * size,
      oy + ((z + half) / S) * size,
    ];
    this._drawSpots(ctx, 'world', project, Infinity);

    // Small player arrow.
    const p = project(px, pz);
    const fx = Math.sin(yaw);
    const fz = Math.cos(yaw);
    this._arrow(ctx, p[0], p[1], Math.atan2(fx, -fz), 4.6, '#ffffff');

    // Thin white North indicator at the top of the map.
    const cx = ox + size * 0.5;
    const ny = oy + 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, ny);
    ctx.lineTo(cx, ny + 7);
    ctx.stroke();
    ctx.font = '600 8px "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeText('N', cx, ny + 8);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText('N', cx, ny + 8);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  }

  /** Zoomed window around the player, rotated so facing points up. */
  _drawLocal(ctx, W, H, px, pz, yaw) {
    const S = this.worldSize;
    const half = S * 0.5;
    const span = Math.max(20, this.localSpan);
    const s = Math.min(W, H) / span; // CSS px per world unit
    const rot = yaw + Math.PI + this.yawOffset;

    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const cxs = W * 0.5;
    const cys = H * 0.5;
    const halfDiag = 0.5 * Math.sqrt(W * W + H * H) / s + 8;

    ctx.save();
    ctx.translate(cxs, cys);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.translate(-px, -pz);

    if (this._baked && this._bakeCanvas) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(this._bakeCanvas, -half, -half, S, S);
    } else {
      ctx.fillStyle = '#0b2430';
      ctx.fillRect(-half, -half, S, S);
    }

    // World-aligned grid (1 CSS px lines, so divide by the scale).
    const step = this.gridStep;
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1 / s;
    ctx.beginPath();
    const gx0 = Math.floor((px - halfDiag) / step) * step;
    for (let x = gx0; x <= px + halfDiag; x += step) {
      ctx.moveTo(x, pz - halfDiag);
      ctx.lineTo(x, pz + halfDiag);
    }
    const gz0 = Math.floor((pz - halfDiag) / step) * step;
    for (let z = gz0; z <= pz + halfDiag; z += step) {
      ctx.moveTo(px - halfDiag, z);
      ctx.lineTo(px + halfDiag, z);
    }
    ctx.stroke();

    // Faint ring for the active spot's radius (drawn in world space).
    const active = this._findSpot(this._activeId);
    if (active && this._isVisible(active) && toNum(active.radius, 0) > 0) {
      ctx.beginPath();
      ctx.arc(toNum(active.x, 0), toNum(active.z, 0), toNum(active.radius, 0), 0, TAU);
      ctx.strokeStyle = 'rgba(207,240,255,0.22)';
      ctx.lineWidth = 1 / s;
      ctx.setLineDash([5 / s, 5 / s]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();

    // Spots and the player arrow stay upright on screen.
    const project = (x, z) => {
      const dx = (x - px) * s;
      const dz = (z - pz) * s;
      return [cxs + dx * cos - dz * sin, cys + dx * sin + dz * cos];
    };
    this._drawSpots(ctx, 'local', project, halfDiag, px, pz);

    this._arrow(ctx, cxs, cys, 0, 6, '#ffffff');
  }

  /**
   * Markers + labels for every known spot.
   * @param {(x:number,z:number)=>number[]} project world -> screen
   */
  _drawSpots(ctx, mode, project, halfDiag, px, pz) {
    const spots = this._spots;
    if (!spots || !spots.length) return;
    const W = this._cssW;
    const H = this._cssH;
    const activeId = this._activeId;
    const pulse = 0.5 + 0.5 * Math.sin(nowMs() / 1000 * 3.4);
    const labelAll = this.showLabels && mode === 'world';
    const labelNear = this.showLabels && mode === 'local' ? this.labelDistance : -1;
    const pxv = toNum(px, 0);
    const pzv = toNum(pz, 0);
    const drawn = [];

    ctx.save();
    ctx.lineJoin = 'round';

    // Pass 1 — markers, so labels never hide behind a neighbour's diamond.
    for (let i = 0; i < spots.length; i++) {
      const sp = spots[i];
      if (!sp || !this._isVisible(sp)) continue;
      const sx0 = toNum(sp.x, 0);
      const sz0 = toNum(sp.z, 0);
      if (mode === 'local' && halfDiag !== Infinity
        && Math.abs(sx0 - pxv) > halfDiag && Math.abs(sz0 - pzv) > halfDiag) continue;

      const p = project(sx0, sz0);
      const sx = p[0];
      const sy = p[1];
      if (sx < -24 || sy < -24 || sx > W + 24 || sy > H + 24) continue;

      const isActive = activeId != null && sp.id === activeId;
      const color = this._spotColor(sp);

      if (isActive) {
        const r0 = SPOT_R + 3.4 + pulse * 3.2;
        ctx.beginPath();
        ctx.arc(sx, sy, r0, 0, TAU);
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.70 - 0.40 * pulse).toFixed(3) + ')';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx, sy, r0 + 3.2, 0, TAU);
        ctx.strokeStyle = 'rgba(127,216,255,' + (0.34 - 0.22 * pulse).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      if (sp.water) {
        ctx.moveTo(sx, sy - SPOT_R);
        ctx.lineTo(sx + SPOT_R, sy);
        ctx.lineTo(sx, sy + SPOT_R);
        ctx.lineTo(sx - SPOT_R, sy);
        ctx.closePath();
      } else {
        ctx.arc(sx, sy, SPOT_R - 0.4, 0, TAU);
      }
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0,0,0,0.78)';
      ctx.stroke();

      const dist = Math.sqrt((sx0 - pxv) * (sx0 - pxv) + (sz0 - pzv) * (sz0 - pzv));
      if (labelAll || (dist <= labelNear && dist <= halfDiag + 40)) {
        drawn.push([sx, sy, String(sp.name == null ? '' : sp.name)]);
      }
    }

    // Pass 2 — tiny outlined names.
    if (drawn.length) {
      ctx.font = '600 9px "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.82)';
      ctx.fillStyle = '#eaf7fc';
      for (let i = 0; i < drawn.length; i++) {
        const d = drawn[i];
        if (!d[2]) continue;
        const ty = d[1] - SPOT_R - 3;
        ctx.strokeText(d[2], d[0], ty);
        ctx.fillText(d[2], d[0], ty);
      }
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    }

    ctx.restore();
  }

  /** 1 px border around the canvas. */
  _drawFrame(ctx, W, H) {
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  }

  /** Small filled triangle used for the player, tip pointing along `rot`. */
  _arrow(ctx, x, y, rot, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.72, size * 0.78);
    ctx.lineTo(0, size * 0.38);
    ctx.lineTo(-size * 0.72, size * 0.78);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.72)';
    ctx.stroke();
    ctx.restore();
  }

  /** Marker colour: explicit spot colour, then rarity, water type, biome. */
  _spotColor(sp) {
    if (typeof sp.color === 'string' && sp.color) return sp.color;

    const rarity = toNum(sp.rarity, 0);
    if (rarity >= 1) return RARITY_COLORS[clamp(Math.round(rarity), 1, 5) - 1];

    const water = typeof sp.water === 'string' ? sp.water.toLowerCase() : '';
    if (water && WATER_TYPE_COLORS[water]) return WATER_TYPE_COLORS[water];

    const biome = typeof sp.biome === 'string' ? sp.biome : '';
    if (biome && this.colors[biome]) return this.colors[biome];

    return this.accent;
  }

  _findSpot(id) {
    if (id == null || !this._spots.length) return null;
    for (let i = 0; i < this._spots.length; i++) {
      if (this._spots[i] && this._spots[i].id === id) return this._spots[i];
    }
    return null;
  }

  /** No filter at all means every spot counts as known. */
  _isVisible(sp) {
    const disc = this._discovered;
    if (!disc) return true;
    return disc.has(sp.id);
  }
}
