/**
 * vegetation.js — instanced trees, bushes, rocks, grass, reeds and flowers.
 *
 * Placement is fully deterministic (seeded PRNG + jittered grid) and driven by
 * the terrain's biome/slope data, so the same world is rebuilt on every load.
 * Everything is drawn with InstancedMesh: a handful of draw calls for tens of
 * thousands of objects, which keeps both CPU time and memory small.
 */
import * as THREE from 'three';
import { clamp, clamp01, lerp, mulberry32, pick, rand, smoothstep, TAU } from '../core/util.js';
import { WATER_LEVEL } from './terrain.js';
import { optOn } from '../core/flags.js';

const BARK = 0x5b4632;
const PINE = 0x2f5b34;
const LEAF = 0x4c7a35;
const LEAF_LIGHT = 0x6f9a41;
const PALM = 0x5f8f3a;
const DEAD = 0x6b5b48;
const ROCK = 0x7d7a74;
const GRASS = 0x6faa48;
const REED = 0x8fae4e;
const FLOWER_COLORS = [0xffd166, 0xff8fa3, 0xc9a7ff, 0xffffff, 0xffb37a];

/** Swaying injected into a lambert material's vertex stage. */
function makeSway(material, amount, uniform) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSwayTime = uniform;
    shader.uniforms.uSwayAmount = { value: amount };
    shader.vertexShader = 'uniform float uSwayTime;\nuniform float uSwayAmount;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 swOrigin = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      #else
        vec3 swOrigin = vec3(0.0);
      #endif
      float swPhase = uSwayTime * 1.35 + swOrigin.x * 0.28 + swOrigin.z * 0.21;
      float swAmt = uSwayAmount * clamp(transformed.y, 0.0, 12.0);
      transformed.x += sin(swPhase) * swAmt;
      transformed.z += cos(swPhase * 0.83) * swAmt * 0.7;`
    );
  };
  material.customProgramCacheKey = () => `sway_${amount}`;
  return material;
}

export class Vegetation {
  constructor(terrain, quality, opts = {}) {
    this.terrain = terrain;
    this.quality = quality;
    this.clearings = opts.clearings || [];
    this.seed = opts.seed ?? 77123;
    this.density = opts.density ?? 1;
    this.group = new THREE.Group();
    this.group.name = 'vegetation';
    this.parts = [];
    this._swayUniform = { value: 0 };
    this._time = 0;
    this._colorScratch = new THREE.Color();
    this._mat4 = new THREE.Matrix4();
    this._quat = new THREE.Quaternion();
    this._pos = new THREE.Vector3();
    this._scale = new THREE.Vector3();
    this._euler = new THREE.Euler();
    this.stats = { instances: 0, parts: 0 };
    this._disposables = [];
  }

  _inClearing(x, z, pad = 0) {
    for (const c of this.clearings) {
      const dx = x - c.x;
      const dz = z - c.z;
      const r = (c.r || 0) + pad;
      if (dx * dx + dz * dz < r * r) return true;
    }
    return false;
  }

  _geo(fn) {
    const g = fn();
    this._disposables.push(g);
    return g;
  }

  /** Cache the materials once so every part can reuse them. */
  _materials() {
    if (this._mats) return this._mats;
    const flat = (color, sway = 0) => {
      const m = new THREE.MeshLambertMaterial({ color, flatShading: true });
      if (sway) makeSway(m, sway, this._swayUniform);
      return m;
    };
    this._mats = {
      bark: flat(BARK),
      pine: flat(PINE, 0.006),
      leaf: flat(LEAF, 0.008),
      leafLight: flat(LEAF_LIGHT, 0.008),
      palm: flat(PALM, 0.022),
      dead: flat(DEAD),
      rock: flat(ROCK),
      grass: flat(GRASS, 0.05),
      reed: flat(REED, 0.035),
      flower: new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true, vertexColors: false }),
    };
    for (const m of Object.values(this._mats)) this._disposables.push(m);
    return this._mats;
  }

  /** Species table: parts are placed in the instance's local space. */
  _species() {
    const mats = this._materials();
    const cone = (r, h, seg = 7) => this._geo(() => new THREE.ConeGeometry(r, h, seg));
    const cyl = (rt, rb, h, seg = 6) => this._geo(() => new THREE.CylinderGeometry(rt, rb, h, seg));
    const ico = (r, d = 0) => this._geo(() => new THREE.IcosahedronGeometry(r, d));
    const box = (w, h, d) => this._geo(() => new THREE.BoxGeometry(w, h, d));

    const pineCone = cone(1, 1, 7);
    const trunkGeo = cyl(0.16, 0.3, 1, 6);
    const blobGeo = ico(1, 0);
    const rockGeo = ico(1, 0);
    const grassGeo = this._geo(() => {
      // three crossed blades
      const g = new THREE.BufferGeometry();
      const verts = [];
      const uv = [];
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI;
        const w = 0.14;
        const h = 1;
        const cx = Math.cos(a) * 0.001;
        const cz = Math.sin(a) * 0.001;
        const dx = Math.cos(a) * w;
        const dz = Math.sin(a) * w;
        verts.push(cx - dx, 0, cz - dz, cx + dx, 0, cz + dz, cx + dx * 0.25, h, cz + dz * 0.25);
        verts.push(cx - dx, 0, cz - dz, cx + dx * 0.25, h, cz + dz * 0.25, cx - dx * 0.25, h, cz - dz * 0.25);
        uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      }
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.computeVertexNormals();
      return g;
    });
    const reedGeo = cyl(0.028, 0.05, 1, 5);
    const flowerGeo = box(0.09, 0.45, 0.09);

    return {
      pine: {
        biomes: ['forest', 'rock', 'meadow'],
        weight: { forest: 1, rock: 0.42, meadow: 0.16 },
        spacing: 7.5,
        maxSlope: 0.95,
        minH: 1.6,
        maxH: 88,
        scale: [0.85, 1.75],
        parts: [
          { geo: trunkGeo, mat: mats.bark, pos: [0, 1.7, 0], scale: [1, 3.4, 1] },
          { geo: pineCone, mat: mats.pine, pos: [0, 4.3, 0], scale: [1.55, 3.4, 1.55] },
          { geo: pineCone, mat: mats.pine, pos: [0, 6.6, 0], scale: [0.95, 2.6, 0.95] },
        ],
      },
      broadleaf: {
        biomes: ['forest', 'meadow', 'swamp'],
        weight: { forest: 0.72, meadow: 0.34, swamp: 0.5 },
        spacing: 8.5,
        maxSlope: 0.72,
        minH: 1.4,
        maxH: 66,
        scale: [0.85, 1.6],
        parts: [
          { geo: trunkGeo, mat: mats.bark, pos: [0, 1.6, 0], scale: [1.15, 3.2, 1.15] },
          { geo: blobGeo, mat: mats.leaf, pos: [0, 4.1, 0], scale: [2.35, 2.0, 2.35] },
          { geo: blobGeo, mat: mats.leafLight, pos: [0.9, 3.3, -0.6], scale: [1.35, 1.15, 1.35] },
        ],
      },
      palm: {
        biomes: ['beach', 'coast', 'meadow'],
        weight: { beach: 1, coast: 0.55, meadow: 0.08 },
        spacing: 12,
        maxSlope: 0.5,
        minH: 0.6,
        maxH: 8,
        scale: [0.9, 1.5],
        parts: [
          { geo: cyl(0.16, 0.26, 1, 6), mat: mats.bark, pos: [0, 2.8, 0], scale: [1, 5.6, 1], rot: [0, 0, 0.06] },
          { geo: cone(1, 1.5, 6), mat: mats.palm, pos: [0, 5.5, 0], scale: [1.75, 0.95, 1.75] },
          { geo: cone(1, 1.5, 5), mat: mats.palm, pos: [0, 5.15, 0], scale: [1.35, 0.8, 1.35], rot: [0, 0.6, 0] },
          { geo: cone(1, 1.4, 5), mat: mats.palm, pos: [0, 5.75, 0], scale: [1.1, 0.72, 1.1], rot: [0, 1.2, 0] },
        ],
      },
      deadtree: {
        biomes: ['swamp', 'rock', 'snow'],
        weight: { swamp: 0.55, rock: 0.18, snow: 0.12 },
        spacing: 11,
        maxSlope: 0.8,
        minH: 1.4,
        maxH: 92,
        scale: [0.8, 1.4],
        parts: [
          { geo: cyl(0.13, 0.34, 1, 5), mat: mats.dead, pos: [0, 2.1, 0], scale: [1, 4.2, 1] },
          { geo: cyl(0.07, 0.13, 1, 4), mat: mats.dead, pos: [0.8, 3.6, 0.2], scale: [1, 1.9, 1], rot: [0, 0, -0.7] },
          { geo: cyl(0.06, 0.1, 1, 4), mat: mats.dead, pos: [-0.7, 3.9, -0.3], scale: [1, 1.7, 1], rot: [0, 0, 0.85] },
        ],
      },
      bush: {
        biomes: ['forest', 'meadow', 'swamp', 'rock'],
        weight: { forest: 0.7, meadow: 0.42, swamp: 0.5, rock: 0.2 },
        spacing: 6.5,
        maxSlope: 0.9,
        minH: 1,
        maxH: 84,
        scale: [0.5, 1.05],
        parts: [{ geo: blobGeo, mat: mats.leaf, pos: [0, 0.45, 0], scale: [1.1, 0.85, 1.1] }],
      },
      rock: {
        biomes: ['rock', 'snow', 'beach', 'coast', 'meadow', 'reef'],
        weight: { rock: 1, snow: 0.8, beach: 0.3, coast: 0.4, meadow: 0.12, reef: 0.5 },
        spacing: 8,
        maxSlope: 2.2,
        minH: -12,
        maxH: 120,
        scale: [0.5, 2.4],
        parts: [{ geo: rockGeo, mat: mats.rock, pos: [0, 0.25, 0], scale: [1.2, 0.85, 1.15] }],
      },
      grass: {
        biomes: ['meadow', 'forest', 'beach', 'swamp'],
        weight: { meadow: 1, forest: 0.55, beach: 0.28, swamp: 0.6 },
        spacing: 2.6,
        maxSlope: 0.85,
        minH: 1.2,
        maxH: 72,
        scale: [0.5, 1.15],
        parts: [{ geo: grassGeo, mat: mats.grass, pos: [0, 0, 0], scale: [1, 1, 1], colorJitter: 0.28 }],
      },
      reed: {
        biomes: ['swamp', 'beach', 'coast', 'pond', 'lake', 'river', 'estuary'],
        weight: { swamp: 1, beach: 0.4, coast: 0.45, pond: 0.7, lake: 0.5, river: 0.6, estuary: 0.6 },
        spacing: 2.8,
        maxSlope: 0.9,
        minH: -1.6,
        maxH: 5.2,
        scale: [1.0, 2.3],
        parts: [{ geo: reedGeo, mat: mats.reed, pos: [0, 0.5, 0], scale: [1, 1, 1], colorJitter: 0.22 }],
      },
      flower: {
        biomes: ['meadow', 'forest', 'beach'],
        weight: { meadow: 1, forest: 0.3, beach: 0.2 },
        spacing: 5.5,
        maxSlope: 0.6,
        minH: 1.6,
        maxH: 60,
        scale: [0.7, 1.3],
        parts: [{ geo: flowerGeo, mat: mats.flower, pos: [0, 0.22, 0], scale: [1, 1, 1], instanceColor: true }],
      },
    };
  }

  /**
   * Build every instanced part. `onProgress(0..1)` is called between species.
   */
  build(onProgress) {
    const t0 = performance.now();
    const species = this._species();
    const terrain = this.terrain;
    const half = terrain.half - 6;
    const budget = {
      pine: Math.round(4200 * this.quality.vegetationScale * this.density),
      broadleaf: Math.round(3600 * this.quality.vegetationScale * this.density),
      palm: Math.round(420 * this.quality.vegetationScale * this.density),
      deadtree: Math.round(700 * this.quality.vegetationScale * this.density),
      bush: Math.round(2400 * this.quality.vegetationScale * this.density),
      rock: Math.round(2600 * this.quality.vegetationScale * this.density),
      grass: Math.round(11000 * this.quality.vegetationScale * this.density),
      reed: Math.round(3800 * this.quality.vegetationScale * this.density),
      flower: Math.round(2600 * this.quality.vegetationScale * this.density),
    };

    const names = Object.keys(species);
    const collected = {};
    for (const name of names) collected[name] = [];

    let total = 0;
    for (let si = 0; si < names.length; si++) {
      const name = names[si];
      const sp = species[name];
      const rnd = mulberry32(this.seed + si * 7919);
      const limit = budget[name] || 0;
      const jitter = sp.spacing * 0.6;
      const list = collected[name];
      outer: for (let z = -half; z <= half; z += sp.spacing) {
        for (let x = -half; x <= half; x += sp.spacing) {
          if (list.length >= limit) break outer;
          const px = x + (rnd() - 0.5) * jitter * 2;
          const pz = z + (rnd() - 0.5) * jitter * 2;
          const h = terrain.heightAt(px, pz);
          if (h < sp.minH || h > sp.maxH) continue;
          const slope = terrain.slopeAt(px, pz);
          if (slope > sp.maxSlope) continue;
          const biome = terrain.biomeAt(px, pz);
          const w = sp.weight[biome];
          if (!w) continue;
          if (rnd() > clamp01(w)) continue;
          if (name === 'reed') {
            if (this._inClearing(px, pz, 0)) continue;
          } else {
            // Keep the standing area of every fishing spot clear: a boulder in
            // the angler's face (or the camera) ruins the shot.
            if (this._inClearing(px, pz, name === 'rock' ? 5 : 3.2)) continue;
          }
          const scale = lerp(sp.scale[0], sp.scale[1], rnd() * rnd() + rnd() * 0.5);
          const rotY = rnd() * TAU;
          const tiltX = (rnd() - 0.5) * (name === 'rock' ? 0.5 : 0.07);
          const tiltZ = (rnd() - 0.5) * (name === 'rock' ? 0.5 : 0.07);
          list.push({ x: px, y: h, z: pz, s: scale, ry: rotY, rx: tiltX, rz: tiltZ, rnd: rnd() });
        }
      }
      total += list.length;
      if (onProgress) onProgress((si + 1) / (names.length + 1));
    }

    // ---- instantiate
    // Instances are bucketed into spatial chunks so three can frustum-cull
    // whole chunks. One island-wide InstancedMesh had frustumCulled = false and
    // drew every blade of grass every frame (v6.1.0).
    for (const name of names) {
      const sp = species[name];
      const list = collected[name];
      if (!list.length) continue;
      for (const part of sp.parts) {
        const geo = part.geo;
        const mat = part.mat;
        const chunkSize = list.length > 1500 ? 110 : 240;
        const cells = new Map();
        for (const it of list) {
          const k = `${Math.floor(it.x / chunkSize)},${Math.floor(it.z / chunkSize)}`;
          let arr = cells.get(k);
          if (!arr) cells.set(k, (arr = []));
          arr.push(it);
        }
        for (const items of cells.values()) {
          const inst = this._buildChunk(name, part, geo, mat, items);
          this.group.add(inst);
          this.parts.push(inst);
        }
      }
    }

    this.stats.instances = total;
    this.stats.parts = this.parts.length;
    this.stats.buildMs = Math.round(performance.now() - t0);
    return this;
  }

  /** Build one InstancedMesh for a chunk of a species part. */
  _buildChunk(name, part, geo, mat, list) {
    const inst = new THREE.InstancedMesh(geo, mat, list.length);
    inst.name = `${name}-${part.mat.uuid.slice(0, 4)}`;
    inst.frustumCulled = true;
    inst.castShadow = !!this.quality.shadows && (name === 'pine' || name === 'broadleaf' || name === 'palm' || name === 'deadtree');
    inst.receiveShadow = false;
    inst.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    const useColor = !!part.instanceColor || !!part.colorJitter;
    if (useColor) {
      inst.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(list.length * 3), 3);
      // three only multiplies vColor into the fragment when USE_COLOR is on,
      // which requires a (white) per-vertex colour attribute on the geometry.
      if (!geo.getAttribute('color')) {
        const vcount = geo.getAttribute('position').count;
        const white = new Float32Array(vcount * 3).fill(1);
        geo.setAttribute('color', new THREE.BufferAttribute(white, 3));
        mat.vertexColors = true;
        mat.needsUpdate = true;
      }
    }

    const base = new THREE.Matrix4();
    const local = new THREE.Matrix4();
    const localQ = new THREE.Quaternion();
    const localS = new THREE.Vector3(part.scale?.[0] ?? 1, part.scale?.[1] ?? 1, part.scale?.[2] ?? 1);
    const localP = new THREE.Vector3(part.pos?.[0] ?? 0, part.pos?.[1] ?? 0, part.pos?.[2] ?? 0);
    if (part.rot) localQ.setFromEuler(new THREE.Euler(part.rot[0] || 0, part.rot[1] || 0, part.rot[2] || 0));
    local.compose(localP, localQ, localS);

    const c = this._colorScratch;
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      this._euler.set(it.rx, it.ry, it.rz, 'YXZ');
      this._quat.setFromEuler(this._euler);
      this._pos.set(it.x, it.y, it.z);
      this._scale.setScalar(it.s);
      this._mat4.compose(this._pos, this._quat, this._scale);
      base.multiplyMatrices(this._mat4, local);
      inst.setMatrixAt(i, base);
      if (useColor) {
        if (part.instanceColor) {
          c.setHex(FLOWER_COLORS[(it.rnd * FLOWER_COLORS.length) | 0]);
        } else {
          const j = part.colorJitter || 0.2;
          const k = 1 - it.rnd * j;
          c.setRGB(k * 0.95 + 0.05, k * 1.02 + 0.02, k * 0.9 + 0.06);
        }
        inst.setColorAt(i, c);
      }
    }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.computeBoundingSphere();
    // chunk spatial centre + LOD range, used by update() for distance culling
    const bs = inst.boundingSphere;
    inst.userData.cx = bs ? bs.center.x : 0;
    inst.userData.cz = bs ? bs.center.z : 0;
    inst.userData.lod = part.lod ?? this._lodFor(name);
    return inst;
  }

  /**
   * How far a chunk stays visible. Fog swallows anything past ~550 m, so
   * culling well before that removes work with no visible popping.
   */
  _lodFor(name) {
    switch (name) {
      case 'grass':
      case 'flower':
      case 'clover':
      case 'fern':
        return 85;
      case 'reed':
      case 'bush':
        return 160;
      case 'rock':
        return 240;
      case 'pine':
      case 'broadleaf':
      case 'palm':
      case 'deadtree':
        return 340;
      default:
        return 0;
    }
  }

  /** Advance the sway clock and cull far chunks of small plants. */
  update(dt, camera) {
    this._time += dt;
    this._swayUniform.value = this._time;
    if (!camera || !optOn()) return;
    const cx = camera.position.x;
    const cz = camera.position.z;
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      const lod = p.userData.lod;
      if (!lod) continue;
      const dx = p.userData.cx - cx;
      const dz = p.userData.cz - cz;
      p.visible = dx * dx + dz * dz < lod * lod;
    }
  }

  /** Remove all instances (used when the density setting changes). */
  clear() {
    for (const inst of this.parts) {
      this.group.remove(inst);
      inst.dispose();
    }
    this.parts.length = 0;
    this.stats.instances = 0;
    this.stats.parts = 0;
  }

  dispose() {
    this.clear();
    for (const d of this._disposables) d.dispose?.();
    this._disposables.length = 0;
    this._mats = null;
  }
}
