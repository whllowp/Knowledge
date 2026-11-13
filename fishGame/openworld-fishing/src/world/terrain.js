/**
 * terrain.js — the island: analytic height generation baked into a heightfield,
 * biome/region classification, plus the render mesh and the height texture that
 * the water shader uses for depth-based colouring and shoreline foam.
 *
 * Everything else in the world (player physics, props, vegetation, fishing
 * spots, the minimap) samples this one heightfield, so no two systems can
 * disagree about where the ground is.
 */
import * as THREE from 'three';
import { Noise2D, clamp, clamp01, lerp, smoothstep, smoothRange, mulberry32, round } from '../core/util.js';

export const WATER_LEVEL = 0;

export const WORLD = {
  size: 1200,
  half: 600,
  waterLevel: WATER_LEVEL,
  gridRes: 448,
  seaFloor: -34,
  maxHeight: 122,
  fogColorDay: 0xa8c8dc,
};

/** Named geographic features — fishing spots and props reference these. */
export const FEATURES = {
  mountain: { x: 170, z: -240, r: 250, h: 116, name: '苍岩山' },
  lake: { x: -140, z: 110, r: 88, bed: -12, name: '静水湖' },
  pond: { x: 95, z: -42, r: 30, bed: -3.8, name: '蛙鸣塘' },
  swamp: { x: 232, z: 214, r: 100, level: 1.2, poolBed: -1.7, name: '迷雾沼泽' },
  reef: { x: -320, z: -330, r: 105, plateau: -5.5, name: '碎珊瑚礁' },
  estuary: { x: -486, z: 78, r: 58, name: '入海口' },
  cabin: { x: -46, z: 152, name: '钓者小屋' },
  spawn: { x: -38, z: 128 },
};

const RIVER_PATH = [
  [163, -212],
  [118, -156],
  [62, -86],
  [4, -18],
  [-52, 42],
  [-96, 80],
];
const RIVER_HW = [[24, 0], [17, 0.22], [12, 0.45], [9, 0.7], [8, 1]];

const OUTLET_PATH = [
  [-214, 126],
  [-296, 118],
  [-382, 102],
  [-458, 86],
  [-540, 70],
];
const OUTLET_HW = 11.5;

/** Pool centres inside the swamp (small ponds carved below water level). */
const SWAMP_POOLS = [
  [200, 196, 24],
  [258, 232, 21],
  [228, 258, 18],
  [272, 186, 15],
  [186, 240, 13],
];

const PALETTE = {
  ocean_deep: 0x1d3d55,
  ocean_shallow: 0x2f6b83,
  coast: 0x9d8f6a,
  reef: 0x6f8f7a,
  lake: 0x2f6f86,
  river: 0x3a7f8e,
  pond: 0x336b5c,
  swamp: 0x4a5233,
  estuary: 0x4d7a72,
  beach: 0xd8c9a0,
  meadow: 0x6f9a4a,
  forest: 0x3f6b32,
  rock: 0x77736c,
  snow: 0xe4edf2,
};

/** CSS colours for the minimap (same ids as above). */
export const BIOME_COLORS_CSS = Object.fromEntries(
  Object.entries(PALETTE).map(([k, v]) => [k, `#${v.toString(16).padStart(6, '0')}`])
);

export const LAND_BIOMES = ['beach', 'meadow', 'forest', 'rock', 'snow', 'swamp'];
export const WATER_BIOMES = ['ocean_deep', 'ocean_shallow', 'coast', 'reef', 'lake', 'river', 'pond', 'swamp', 'estuary'];

/** Index order for the baked biome grid. */
export const BIOME_ORDER = [
  'ocean_deep',
  'ocean_shallow',
  'coast',
  'reef',
  'lake',
  'river',
  'pond',
  'swamp',
  'estuary',
  'beach',
  'meadow',
  'forest',
  'rock',
  'snow',
];

export const BIOME_LABELS = {
  ocean_deep: '深海',
  ocean_shallow: '近海',
  coast: '浅滩',
  reef: '珊瑚礁',
  lake: '湖泊',
  river: '河流',
  pond: '池塘',
  swamp: '沼泽',
  estuary: '河口',
  beach: '沙滩',
  meadow: '草甸',
  forest: '森林',
  rock: '岩地',
  snow: '雪线',
};

/** Distance from point (px,pz) to a polyline, with the parametric position. */
function distToPolyline(px, pz, path) {
  let best = Infinity;
  let bestT = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i];
    const [bx, bz] = path[i + 1];
    const vx = bx - ax;
    const vz = bz - az;
    const len2 = vx * vx + vz * vz || 1e-6;
    let t = ((px - ax) * vx + (pz - az) * vz) / len2;
    t = clamp01(t);
    const cx = ax + vx * t;
    const cz = az + vz * t;
    const d = Math.hypot(px - cx, pz - cz);
    if (d < best) {
      best = d;
      bestT = (i + t) / (path.length - 1);
    }
  }
  return { dist: best, t: bestT };
}

export class Terrain {
  constructor(seed = 20240607, opts = {}) {
    this.seed = seed;
    this.n = new Noise2D(seed);
    this.nDetail = new Noise2D(seed + 977);
    this.nRiver = new Noise2D(seed + 4231);
    this.res = opts.gridRes || WORLD.gridRes;
    this.size = WORLD.size;
    this.half = WORLD.half;
    this.cell = this.size / this.res;
    this.waterLevel = WATER_LEVEL;
    this.heights = new Float32Array((this.res + 1) * (this.res + 1));
    this._regions = null;
    this._biomeGrid = null;
    this.mesh = null;
    this.heightTexture = null;
    this._built = false;
    this.stats = {};
  }

  // ---------------------------------------------------------------- generation

  _coastRadius(ang) {
    return (
      418 +
      82 * this.n.noise(Math.cos(ang) * 1.7 + 11, Math.sin(ang) * 1.7 - 5) +
      36 * this.n.noise(Math.cos(ang) * 3.9 - 3, Math.sin(ang) * 3.9 + 7)
    );
  }

  /** Analytic height in metres; used to bake the heightfield. */
  _rawHeight(x, z) {
    const n = this.n;
    const nDetail = this.nDetail;
    const r = Math.hypot(x, z);
    const ang = Math.atan2(z, x);
    const cr = this._coastRadius(ang);
    const rr = r / cr;
    // 1 inland, 0 out at sea
    const mask = smoothstep(clamp01((1.06 - rr) / 0.78));

    const hills = n.fbm(x * 0.0031, z * 0.0031, 5, 2.05, 0.52) * 0.5 + 0.5;
    const dunes = n.billow(x * 0.0105, z * 0.0105, 3) * 0.5 + 0.5;
    const rough = nDetail.fbm(x * 0.021, z * 0.021, 3) * 0.5 + 0.5;

    let h = 5.5 + hills * 33 + dunes * 6.5 + rough * 2.2;
    h = h * mask - (1 - mask) * 30;

    // ---- mountain massif (forced, guarantees a peak above sea level)
    const m = FEATURES.mountain;
    const md = Math.hypot(x - m.x, z - m.z) / m.r;
    if (md < 1) {
      const t = Math.pow(1 - md, 1.75);
      const ridge = n.ridged(x * 0.0062, z * 0.0062, 5, 2.15, 0.52);
      const ridge2 = nDetail.ridged(x * 0.0145 + 31, z * 0.0145 - 17, 3);
      const peak = m.h * (0.34 + 0.66 * ridge) * t + ridge2 * 15 * t;
      h = Math.max(h, peak);
      h = Math.max(h, 3 + m.h * 0.42 * t);
    }

    // ---- underlying shelf so the reef is not a lone spike
    h = this._blend(h, -6.5 + n.noise(x * 0.004, z * 0.004) * 3, this._falloff(x, z, FEATURES.reef.x, FEATURES.reef.z, FEATURES.reef.r * 1.9), 1.15);
    h = this._blend(h, FEATURES.reef.plateau + nDetail.noise(x * 0.02, z * 0.02) * 1.6, this._falloff(x, z, FEATURES.reef.x, FEATURES.reef.z, FEATURES.reef.r), 1.5);

    // ---- lake: an explicit bowl profile, otherwise a deep crater in high
    //      ground would only fill where the terrain happened to be low.
    const lk = FEATURES.lake;
    const lkr = Math.hypot((x - lk.x) * 1.0, (z - lk.z) * 0.86) / lk.r;
    if (lkr < 1.6) {
      // gentle basin so the lake sits in a valley instead of on a slope
      const basin = 1 - smoothstep(clamp01((lkr - 0.82) / 0.78));
      if (basin > 0) h = lerp(h, 4.2 + n.fbm(x * 0.014, z * 0.014, 2) * 2.4, basin * 0.8);
      if (lkr < 1) {
        const profile = lk.bed + (lk.bed * -0.62 + 7.5) * Math.pow(lkr, 2.1) + n.noise(x * 0.02, z * 0.02) * 1.1;
        const t = 1 - smoothstep(clamp01((lkr - 0.74) / 0.26));
        h = lerp(h, profile, t);
      }
    }

    // ---- pond
    const pd = FEATURES.pond;
    const pdr = Math.hypot(x - pd.x, z - pd.z) / pd.r;
    if (pdr < 1) {
      const profile = pd.bed + 8.4 * Math.pow(pdr, 2.2) + nDetail.noise(x * 0.05, z * 0.05) * 0.4;
      const t = 1 - smoothstep(clamp01((pdr - 0.7) / 0.3));
      h = lerp(h, profile, t);
    }

    // ---- swamp: flatten to just above the water table, then punch pools
    const sw = FEATURES.swamp;
    const swr = Math.hypot((x - sw.x) * 1.05, (z - sw.z) * 0.92) / sw.r;
    if (swr < 1) {
      const t = Math.pow(1 - smoothstep(swr), 1.25);
      const table = sw.level + n.fbm(x * 0.02, z * 0.02, 3) * 1.35;
      h = lerp(h, table, t);
    }
    for (const [px, pz, pr] of SWAMP_POOLS) {
      const d = Math.hypot(x - px, z - pz) / pr;
      if (d < 1) {
        const profile = sw.poolBed + 3.1 * Math.pow(d, 2.2) + nDetail.noise(x * 0.06, z * 0.06) * 0.3;
        const t = 1 - smoothstep(clamp01((d - 0.62) / 0.38));
        h = lerp(h, profile, t);
      }
    }

    // ---- river channel (widening upstream into a shallow valley)
    h = this._carvePath(h, x, z, RIVER_PATH, RIVER_HW, -2.7, 1.0);

    // ---- outlet stream from the lake to the sea
    h = this._carvePath(h, x, z, OUTLET_PATH, OUTLET_HW, -3.4, 1.0);

    return h;
  }

  _falloff(x, z, cx, cz, r) {
    const d = Math.hypot(x - cx, z - cz) / r;
    return d >= 1 ? 0 : 1 - smoothstep(d);
  }

  _blend(h, target, t, power = 1) {
    if (t <= 0) return h;
    const k = Math.pow(t, power);
    return lerp(h, target, clamp01(k));
  }

  _carvePath(h, x, z, path, hwSpec, bed, strength) {
    // Meander: displace the sample point so the channel is not ruler-straight.
    const mx = x + this.nRiver.noise(z * 0.018, 4.2) * 7.5;
    const mz = z + this.nRiver.noise(x * 0.018, -7.9) * 7.5;
    const { dist, t } = distToPolyline(mx, mz, path);
    let hw = hwSpec;
    if (Array.isArray(hwSpec) && Array.isArray(hwSpec[0])) {
      hw = hwSpec[0][0];
      for (let i = 0; i < hwSpec.length - 1; i++) {
        const [w0, t0] = hwSpec[i];
        const [w1, t1] = hwSpec[i + 1];
        if (t >= t0 && t <= t1) {
          const k = (t - t0) / (t1 - t0 || 1);
          hw = lerp(w0, w1, k);
          break;
        }
      }
    }
    const outer = hw * 2.6;
    if (dist > outer) return h;
    const chan = 1 - smoothstep(clamp01((dist - hw * 0.45) / (outer - hw * 0.45)));
    const target = bed - 0.22 * (1 - clamp01(dist / (hw * 0.9)));
    const k = clamp01(chan * chan * strength);
    return lerp(h, target, k);
  }

  /** Bake the analytic generator into the sample grid. */
  build(onProgress) {
    const t0 = performance.now();
    const res = this.res;
    const step = this.cell;
    const half = this.half;
    for (let j = 0; j <= res; j++) {
      const z = -half + j * step;
      for (let i = 0; i <= res; i++) {
        const x = -half + i * step;
        this.heights[j * (res + 1) + i] = this._rawHeight(x, z);
      }
      if (onProgress && (j & 31) === 0) onProgress(j / res);
    }
    this._built = true;
    this._buildBiomeGrid();
    this.stats.buildMs = Math.round(performance.now() - t0);
    this._computeStats();
    return this;
  }

  _computeStats() {
    let min = Infinity;
    let max = -Infinity;
    let land = 0;
    let water = 0;
    for (let i = 0; i < this.heights.length; i++) {
      const h = this.heights[i];
      if (h < min) min = h;
      if (h > max) max = h;
      if (h > WATER_LEVEL) land++;
      else water++;
    }
    this.stats.minHeight = round(min, 1);
    this.stats.maxHeight = round(max, 1);
    this.stats.landRatio = round(land / (land + water), 3);
  }

  // ---------------------------------------------------------------- sampling

  /** Bilinear height lookup in metres. */
  heightAt(x, z) {
    const res = this.res;
    const inv = 1 / this.cell;
    let fx = (x + this.half) * inv;
    let fz = (z + this.half) * inv;
    if (fx < 0) fx = 0;
    else if (fx > res) fx = res;
    if (fz < 0) fz = 0;
    else if (fz > res) fz = res;
    const i0 = fx | 0;
    const j0 = fz | 0;
    const i1 = i0 < res ? i0 + 1 : i0;
    const j1 = j0 < res ? j0 + 1 : j0;
    const tx = fx - i0;
    const tz = fz - j0;
    const w = res + 1;
    const h00 = this.heights[j0 * w + i0];
    const h10 = this.heights[j0 * w + i1];
    const h01 = this.heights[j1 * w + i0];
    const h11 = this.heights[j1 * w + i1];
    const a = h00 + (h10 - h00) * tx;
    const b = h01 + (h11 - h01) * tx;
    return a + (b - a) * tz;
  }

  /** Water depth in metres (0 on dry land). */
  depthAt(x, z) {
    const h = this.heightAt(x, z);
    return h < WATER_LEVEL ? WATER_LEVEL - h : 0;
  }

  isWater(x, z) {
    return this.heightAt(x, z) < WATER_LEVEL;
  }

  /** Terrain gradient magnitude (rise over run). */
  slopeAt(x, z) {
    const d = this.cell;
    const hx = this.heightAt(x + d, z) - this.heightAt(x - d, z);
    const hz = this.heightAt(x, z + d) - this.heightAt(x, z - d);
    return Math.hypot(hx, hz) / (2 * d);
  }

  /** Surface normal into `out` (defaults to a new Vector3). */
  normalAt(x, z, out = new THREE.Vector3()) {
    const d = Math.max(this.cell, 1.5);
    const hx = this.heightAt(x + d, z) - this.heightAt(x - d, z);
    const hz = this.heightAt(x, z + d) - this.heightAt(x, z - d);
    return out.set(-hx, 2 * d, -hz).normalize();
  }

  /** Distance from the point to the nearest river/outlet centreline. */
  riverDistance(x, z) {
    const a = distToPolyline(x, z, RIVER_PATH);
    const b = distToPolyline(x, z, OUTLET_PATH);
    return a.dist <= b.dist ? { ...a, which: 'river' } : { ...b, which: 'outlet' };
  }

  /** Which water body (if any) a point belongs to. */
  regionAt(x, z) {
    const h = this.heightAt(x, z);
    const isWet = h < WATER_LEVEL;
    const lk = FEATURES.lake;
    if (Math.hypot((x - lk.x) * 1.0, (z - lk.z) * 0.86) < lk.r * 1.02) return isWet ? 'lake' : 'shore';
    const pd = FEATURES.pond;
    if (Math.hypot(x - pd.x, z - pd.z) < pd.r * 1.02) return isWet ? 'pond' : 'shore';
    const es = FEATURES.estuary;
    if (Math.hypot(x - es.x, z - es.z) < es.r) return 'estuary';
    const sw = FEATURES.swamp;
    if (Math.hypot((x - sw.x) * 1.05, (z - sw.z) * 0.92) < sw.r) return isWet ? 'swamp' : 'bogland';
    const rf = FEATURES.reef;
    if (Math.hypot(x - rf.x, z - rf.z) < rf.r && isWet) return 'reef';
    const rd = this.riverDistance(x, z);
    if (isWet && rd.dist < 26) {
      if (rd.which === 'outlet' && rd.dist < 30 && Math.hypot(x - es.x, z - es.z) < es.r * 1.5) return 'estuary';
      return rd.which === 'river' ? 'river' : 'estuary';
    }
    if (isWet) {
      const depth = -h;
      if (depth > 20) return 'ocean_deep';
      if (depth > 5) return 'ocean_shallow';
      return 'coast';
    }
    return 'land';
  }

/** Visual/gameplay biome id at a point (analytic; used to bake the biome grid). */
  _biomeExact(x, z) {
    const h = this.heightAt(x, z);
    const region = this.regionAt(x, z);
    if (h < WATER_LEVEL) {
      if (region === 'shore' || region === 'land' || region === 'bogland') {
        const depth = -h;
        if (depth > 20) return 'ocean_deep';
        if (depth > 5) return 'ocean_shallow';
        return 'coast';
      }
      if (region === 'bogland') return 'swamp';
      return region;
    }
    if (region === 'bogland' || region === 'swamp') return 'swamp';
    const slope = this.slopeAt(x, z);
    if (h > 76) return 'snow';
    if (slope > 0.62) return 'rock';
    if (h < 3.4) return 'beach';
    const moist = this.nDetail.fbm(x * 0.0044 + 50, z * 0.0044 - 20, 3) * 0.5 + 0.5;
    if (moist > 0.5 && h < 50 && slope < 0.52) return 'forest';
    return 'meadow';
  }

  biomeLabel(id) {
    return BIOME_LABELS[id] || id;
  }

  /**
   * Biome lookup. After `build()` this is a grid read (~2.7 m resolution),
   * which is what makes vegetation placement, the minimap bake and the map
   * image cheap enough to run without stalling the frame.
   */
  biomeAt(x, z) {
    if (!this._biomeGrid) return this._biomeExact(x, z);
    const res = this.res;
    const inv = 1 / this.cell;
    let i = Math.round((x + this.half) * inv);
    let j = Math.round((z + this.half) * inv);
    if (i < 0) i = 0;
    else if (i > res) i = res;
    if (j < 0) j = 0;
    else if (j > res) j = res;
    return BIOME_ORDER[this._biomeGrid[j * (res + 1) + i]] || 'meadow';
  }

  /** Always-analytic biome (used where exact boundaries matter). */
  biomeAtExact(x, z) {
    return this._biomeExact(x, z);
  }

  _buildBiomeGrid() {
    const res = this.res;
    const w = res + 1;
    const grid = new Uint8Array(w * w);
    for (let j = 0; j <= res; j++) {
      const z = -this.half + j * this.cell;
      for (let i = 0; i <= res; i++) {
        const x = -this.half + i * this.cell;
        const id = this._biomeExact(x, z);
        grid[j * w + i] = Math.max(0, BIOME_ORDER.indexOf(id));
      }
    }
    this._biomeGrid = grid;
  }

  /** True where the ground is walkable-ish (used for spawn search and props). */
  isWalkable(x, z) {
    return this.heightAt(x, z) > WATER_LEVEL + 0.15 && this.slopeAt(x, z) < 1.6;
  }

  /** Spiral search for a dry, gently sloped spot near (x,z). */
  findLand(x, z, maxRadius = 90) {
    if (this.isWalkable(x, z)) return { x, z };
    for (let r = 4; r <= maxRadius; r += 4) {
      const steps = Math.max(8, Math.round(r * 0.7));
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2 + r * 0.13;
        const px = x + Math.cos(a) * r;
        const pz = z + Math.sin(a) * r;
        if (Math.abs(px) > this.half - 4 || Math.abs(pz) > this.half - 4) continue;
        if (this.isWalkable(px, pz)) return { x: px, z: pz };
      }
    }
    return { x, z };
  }

  /** Walk inland from a water point to find the nearest fishable shore. */
  findShore(x, z, fromX, fromZ, maxRadius = 80) {
    const dirX = x - fromX;
    const dirZ = z - fromZ;
    const len = Math.hypot(dirX, dirZ) || 1;
    const ux = dirX / len;
    const uz = dirZ / len;
    const start = this.heightAt(x, z);
    if (start >= WATER_LEVEL) return { x, z };
    // Step away from the cast origin until we reach land.
    for (let d = 0; d <= maxRadius; d += 1.5) {
      const px = x + ux * d;
      const pz = z + uz * d;
      if (this.heightAt(px, pz) >= WATER_LEVEL + 0.3) return { x: px, z: pz };
    }
    // Fall back to a radial search.
    return this.findLand(x, z, maxRadius);
  }

  // ---------------------------------------------------------------- rendering

  buildMesh(quality) {
    const seg = quality?.terrainSegments || 224;
    const geo = new THREE.PlaneGeometry(this.size, this.size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const color = new THREE.Color();
    const n = pos.count;

    for (let i = 0; i < n; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = this.heightAt(x, z);
      pos.setY(i, h);
      const biome = this.biomeAt(x, z);
      color.setHex(PALETTE[biome] || PALETTE.meadow);
      if (h < WATER_LEVEL) {
        // Darken with depth so the seabed reads as receding.
        const k = clamp01(-h / 30);
        color.multiplyScalar(1 - k * 0.55);
      } else {
        // Gentle height tinting + slope darkening.
        const slope = this.slopeAt(x, z);
        const up = 1 - clamp01(slope * 0.32);
        color.multiplyScalar(0.86 + up * 0.2);
        const alt = clamp01((h - 40) / 70);
        color.lerp(new THREE.Color(PALETTE.snow), alt * 0.25);
      }
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    geo.computeBoundingSphere();

    const mat = new THREE.MeshLambertMaterial({
      vertexColors: true,
      side: THREE.FrontSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'terrain';
    mesh.receiveShadow = !!quality?.shadows;
    mesh.castShadow = false;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    this.mesh = mesh;
    return mesh;
  }

  /**
   * Half-float DataTexture: R = terrain height in metres (offset 64),
   * G = water depth, B = distance to coastline (positive on land).
   * The water shader samples it for depth colour and foam.
   */
  buildHeightTexture(res = 512) {
    const data = new Uint16Array(res * res * 4);
    const toHalf = THREE.DataUtils.toHalfFloat;
    const step = this.size / (res - 1);
    for (let j = 0; j < res; j++) {
      const z = -this.half + j * step;
      for (let i = 0; i < res; i++) {
        const x = -this.half + i * step;
        const h = this.heightAt(x, z);
        const idx = (j * res + i) * 4;
        data[idx] = toHalf(h);
        data[idx + 1] = toHalf(h < WATER_LEVEL ? WATER_LEVEL - h : 0);
        data[idx + 2] = toHalf(0);
        data[idx + 3] = toHalf(1);
      }
    }
    const tex = new THREE.DataTexture(data, res, res, THREE.RGBAFormat, THREE.HalfFloatType);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    tex.generateMipmaps = false;
    this.heightTexture = tex;
    return tex;
  }

  /**
   * Bake a top-down RGBA snapshot of the island (biome colours + water depth)
   * into an ImageData. Used by the map panel and as a fallback minimap base.
   */
  bakeMapImage(res = 512) {
    const img = new Uint8ClampedArray(res * res * 4);
    const step = this.size / (res - 1);
    for (let j = 0; j < res; j++) {
      const z = -this.half + j * step;
      for (let i = 0; i < res; i++) {
        const x = -this.half + i * step;
        const h = this.heightAt(x, z);
        const biome = this.biomeAt(x, z);
        const hex = PALETTE[biome] || PALETTE.meadow;
        let r = (hex >> 16) & 255;
        let g = (hex >> 8) & 255;
        let b = hex & 255;
        if (h < WATER_LEVEL) {
          const k = clamp01(-h / 26);
          r *= 1 - k * 0.45;
          g *= 1 - k * 0.4;
          b *= 1 - k * 0.22;
        } else {
          const alt = clamp01((h - 45) / 65);
          r = lerp(r, 240, alt * 0.5);
          g = lerp(g, 245, alt * 0.5);
          b = lerp(b, 250, alt * 0.5);
          const sh = 1 - clamp01(this.slopeAt(x, z) * 0.3) * 0.25;
          r *= sh;
          g *= sh;
          b *= sh;
        }
        const idx = (j * res + i) * 4;
        img[idx] = r;
        img[idx + 1] = g;
        img[idx + 2] = b;
        img[idx + 3] = 255;
      }
    }
    return { data: img, width: res, height: res };
  }

  dispose() {
    this.mesh?.geometry?.dispose();
    this.mesh?.material?.dispose();
    this.heightTexture?.dispose();
    this.mesh = null;
    this.heightTexture = null;
  }
}
