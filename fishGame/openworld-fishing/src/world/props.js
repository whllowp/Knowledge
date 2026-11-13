/**
 * props.js — hand-placed structures: wooden docks (walkable), the angler's
 * cabin with a campfire, moored rowboats, buoy lines, spot signposts, lily
 * pads and scattered crates.
 *
 * Docks are real surfaces: `dockHeightAt()` lets the player walk out over the
 * water, and `colliders` keeps them out of solid objects.
 */
import * as THREE from 'three';
import { mergeGeometriesSimple } from '../core/merge.js';
import { clamp, clamp01, lerp, mulberry32, rand, TAU } from '../core/util.js';
import { WATER_LEVEL, FEATURES } from './terrain.js';
import { makeFishGeometry } from '../entities/wildlife.js';

const WOOD = 0x8a6a44;
const WOOD_DARK = 0x6b512f;
const WOOD_LIGHT = 0xa8865c;
const STONE = 0x7a7671;
const ROOF = 0x8c4a3a;
const CANVAS_TENT = 0x6f8f5a;

/** Simple box mesh helper. */
function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cyl(rt, rb, h, mat, seg = 8) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export class Props {
  constructor(terrain, quality, opts = {}) {
    this.terrain = terrain;
    this.quality = quality;
    this.group = new THREE.Group();
    this.group.name = 'props';
    this.docks = [];
    this.colliders = [];
    this.buoys = [];
    this.lights = [];
    this._time = 0;
    this._disposables = [];
    this._firePoints = null;
    this._smokePoints = null;
    this.materials = {};
  }

  _geo(g) {
    this._disposables.push(g);
    return g;
  }

  _mat(name, color, opts = {}) {
    if (!this.materials[name]) {
      const m = new THREE.MeshLambertMaterial({ color, flatShading: opts.flat !== false, ...opts.extra });
      this.materials[name] = m;
      this._disposables.push(m);
    }
    return this.materials[name];
  }

  // ------------------------------------------------------------------ docks

  /**
   * @param {Array} spots fishing spots (those with `dock` get a pier)
   */
  build(spots = []) {
    const t0 = performance.now();
    const wood = this._mat('wood', WOOD);
    const woodDark = this._mat('woodDark', WOOD_DARK);
    const woodLight = this._mat('woodLight', WOOD_LIGHT);
    const stone = this._mat('stone', STONE);
    const roofMat = this._mat('roof', ROOF);

    // ---- cabin near the spawn
    this._buildCabin(-46, 152, wood, woodDark, woodLight, roofMat, stone);

    // ---- docks + signposts for every spot that wants one
    for (const spot of spots) {
      if (spot.dock) this._buildDock(spot, wood, woodDark, woodLight);
      if (spot.sign !== false) this._buildSignpost(spot, wood, woodDark);
    }

    // ---- moored boats
    this._buildBoat(this.docks[0] || { x: -140, z: 190, angle: 0 }, wood, woodDark);
    if (this.docks[1]) this._buildBoat(this.docks[1], woodDark, wood);

    // ---- buoys marking a channel near the first dock
    const base = this.docks[0];
    if (base) {
      for (let i = 0; i < 6; i++) {
        const t = i / 5;
        const x = base.x + Math.sin(base.angle) * (14 + t * 46) + Math.cos(base.angle) * (t * 8 - 4);
        const z = base.z + Math.cos(base.angle) * (14 + t * 46) + Math.sin(base.angle) * (t * 8 - 4);
        this._buildBuoy(x, z, i % 2 === 0 ? 0xd94f3d : 0xf0f0e8);
      }
    }

    // ---- lily pads in the pond and shallow lake edges
    this._buildLilyPads();

    // ---- a small camp with tents on the meadow
    this._buildCamp(105, 175, wood, roofMat);

    this._buildAquarium();

    this._mergeStatic();

    this.stats = { docks: this.docks.length, colliders: this.colliders.length, merged: this._mergedCount || 0, buildMs: Math.round(performance.now() - t0) };
    return this;
  }

  /**
   * Collapse the hundreds of individual prop meshes into one mesh per material.
   * Docks, cabins, signposts and crates are all static, so this takes the scene
   * from ~300 draw calls to a handful (the single biggest frame-time win).
   */
  _mergeStatic() {
    const buckets = new Map();
    const keep = [];
    const toRemove = [];
    // Count geometry references so a geometry shared by several meshes is only
    // disposed once all of its users have been merged away.
    const geoUse = new Map();
    this.group.traverse((o) => {
      if (o.isMesh && o.geometry) geoUse.set(o.geometry, (geoUse.get(o.geometry) || 0) + 1);
    });
    this.group.traverse((obj) => {
      if (!obj.isMesh) {
        keep.push(obj);
        return;
      }
      // anything animated/instanced keeps its own node
      if (obj.isInstancedMesh || obj.userData.dynamic || !obj.geometry || Array.isArray(obj.material)) {
        keep.push(obj);
        return;
      }
      // meshes inside a moving group (boats, buoys) must stay put as nodes
      let p = obj.parent;
      let dynamicParent = false;
      while (p && p !== this.group) {
        if (p.userData?.dynamic) {
          dynamicParent = true;
          break;
        }
        p = p.parent;
      }
      if (dynamicParent) {
        keep.push(obj);
        return;
      }
      const mat = obj.material;
      if (!mat || mat.isShaderMaterial || mat.transparent) {
        keep.push(obj);
        return;
      }
      if (!buckets.has(mat)) buckets.set(mat, []);
      obj.updateWorldMatrix(true, false);
      const g = obj.geometry.clone();
      g.applyMatrix4(obj.matrixWorld);
      // normalise attributes so mergeGeometries never sees a mismatch
      for (const name of Object.keys(g.attributes)) {
        if (!['position', 'normal', 'uv', 'color'].includes(name)) g.deleteAttribute(name);
      }
      if (!g.attributes.uv) {
        const count = g.attributes.position.count;
        g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
      }
      if (!g.attributes.normal) g.computeVertexNormals();
      if (!g.index) {
        const count = g.attributes.position.count;
        const idx = new Uint32Array(count);
        for (let i = 0; i < count; i++) idx[i] = i;
        g.setIndex(new THREE.BufferAttribute(idx, 1));
      }
      buckets.get(mat).push(g);
      toRemove.push(obj);
    });

    for (const obj of toRemove) {
      obj.parent?.remove(obj);
      // the source geometry is no longer referenced by anything: free it
      const g = obj.geometry;
      if (g && (geoUse.get(g) || 0) <= 1) {
        const i = this._disposables.indexOf(g);
        if (i >= 0) this._disposables.splice(i, 1);
        g.dispose();
      }
    }

    let merged = 0;
    for (const [mat, geos] of buckets) {
      if (!geos.length) continue;
      let finalGeo;
      try {
        finalGeo = geos.length === 1 ? geos[0] : mergeGeometriesSimple(geos);
      } catch (err) {
        console.warn('[props] merge failed, keeping separate meshes', err);
        finalGeo = null;
      }
      if (!finalGeo) {
        for (const g of geos) {
          const m = new THREE.Mesh(g, mat);
          m.castShadow = true;
          m.receiveShadow = true;
          this.group.add(m);
          merged++;
        }
        continue;
      }
      for (let i = 1; i < geos.length; i++) geos[i].dispose();
      finalGeo.computeBoundingSphere();
      const mesh = new THREE.Mesh(finalGeo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      this.group.add(mesh);
      this._disposables.push(finalGeo);
      merged++;
    }
    this._mergedCount = merged;
  }

  _buildDock(spot, wood, woodDark, woodLight) {
    const angle = spot.dockAngle ?? 0;
    const length = spot.dockLength ?? 26;
    const width = spot.dockWidth ?? 3.6;
    const deckY = WATER_LEVEL + 0.95;
    const g = new THREE.Group();
    g.position.set(spot.x, 0, spot.z);
    g.rotation.y = angle;

    // planks along the length
    const plankCount = Math.round(length / 1.0);
    for (let i = 0; i < plankCount; i++) {
      const p = box(width, 0.16, 0.86, i % 3 === 0 ? woodLight : wood, 0, deckY, -i * 1.0);
      g.add(p);
    }
    // rails and posts
    const postCount = Math.max(2, Math.round(length / 5));
    for (let i = 0; i <= postCount; i++) {
      const z = -(i / postCount) * length;
      for (const sx of [-width / 2 + 0.16, width / 2 - 0.16]) {
        const post = cyl(0.13, 0.16, 4.6, woodDark, 6);
        post.position.set(sx, deckY - 1.9, z);
        g.add(post);
        const railTop = box(0.12, 0.12, 2.2, woodDark, sx, deckY + 1.05, z - 1.1);
        g.add(railTop);
      }
      // cross brace
      g.add(box(width, 0.14, 0.2, woodDark, 0, deckY - 0.9, z));
    }
    // a lamp at the shore end
    const lampPost = cyl(0.11, 0.13, 3.4, woodDark, 6);
    lampPost.position.set(width / 2 + 0.5, deckY + 1.2, 0.6);
    g.add(lampPost);
    const lampHead = box(0.42, 0.42, 0.42, woodDark, width / 2 + 0.5, deckY + 2.9, 0.6);
    g.add(lampHead);
    const lampGlass = new THREE.Mesh(
      this._geo(new THREE.BoxGeometry(0.32, 0.34, 0.32)),
      new THREE.MeshBasicMaterial({ color: 0xffd79a })
    );
    lampGlass.position.set(width / 2 + 0.5, deckY + 2.9, 0.6);
    g.add(lampGlass);
    const lampLight = new THREE.PointLight(0xffc27a, 0, 22, 2);
    lampLight.position.set(width / 2 + 0.5, deckY + 2.8, 0.6);
    g.add(lampLight);
    this.lights.push({ light: lampLight, kind: 'lamp', base: 1.5, flicker: 0.06 });

    this.group.add(g);
    this.docks.push({
      x: spot.x,
      z: spot.z,
      angle,
      length,
      width,
      deckY,
      spotId: spot.id,
      name: spot.name,
    });
  }

  /** Deck height under a world point, or null when not on a dock. */
  dockHeightAt(x, z) {
    for (const d of this.docks) {
      const dx = x - d.x;
      const dz = z - d.z;
      const cos = Math.cos(-d.angle);
      const sin = Math.sin(-d.angle);
      const lx = dx * cos - dz * sin;
      const lz = dx * sin + dz * cos;
      if (Math.abs(lx) <= d.width / 2 && lz <= 1.4 && lz >= -d.length - 0.6) {
        return d.deckY;
      }
    }
    return null;
  }

  _buildSignpost(spot, wood, woodDark) {
    const g = new THREE.Group();
    g.position.set(spot.x, 0, spot.z);
    const h = this.terrain.heightAt(spot.x, spot.z);
    const shore = this.terrain.findShore(spot.x, spot.z, spot.x, spot.z, 40);
    g.position.set(shore.x, this.terrain.heightAt(shore.x, shore.z), shore.z);
    const post = cyl(0.1, 0.12, 2.1, woodDark, 6);
    post.position.y = 1.05;
    g.add(post);
    const board = box(1.85, 0.62, 0.09, wood, 0, 1.95, 0.07);
    g.add(board);
    const yaw = Math.atan2(spot.x - shore.x, spot.z - shore.z);
    g.rotation.y = yaw;

    // canvas label
    const cv = document.createElement('canvas');
    cv.width = 384;
    cv.height = 128;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#7a5c38';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, cv.width - 8, cv.height - 8);
    ctx.fillStyle = '#f6ecd8';
    ctx.font = 'bold 52px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(spot.name, cv.width / 2, cv.height / 2 - 8);
    ctx.font = '26px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#e6d3ac';
    ctx.fillText(spot.short || '', cv.width / 2, cv.height / 2 + 38);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._disposables.push(tex);
    const labelMat = this._mat(`sign-${spot.id}`, 0xffffff, { extra: { map: tex } });
    const label = new THREE.Mesh(this._geo(new THREE.PlaneGeometry(1.75, 0.58)), labelMat);
    label.position.set(0, 1.95, 0.121);
    g.add(label);
    this.group.add(g);
  }

  _buildCabin(x, z, wood, woodDark, woodLight, roofMat, stoneMat) {
    const g = new THREE.Group();
    const h = this.terrain.heightAt(x, z);
    g.position.set(x, h, z);
    const yaw = -0.35;
    g.rotation.y = yaw;

    const W = 8.4;
    const D = 6.4;
    const H = 3.2;
    // stone foundation
    g.add(box(W + 0.6, 0.6, D + 0.6, stoneMat, 0, 0.3, 0));
    // log walls
    const logRows = 9;
    for (let i = 0; i < logRows; i++) {
      const y = 0.6 + (i + 0.5) * (H / logRows);
      const m = i % 2 ? wood : woodLight;
      g.add(box(W, H / logRows - 0.02, 0.34, m, 0, y, -D / 2));
      g.add(box(W, H / logRows - 0.02, 0.34, m, 0, y, D / 2));
      g.add(box(0.34, H / logRows - 0.02, D, m, -W / 2, y, 0));
      g.add(box(0.34, H / logRows - 0.02, D, m, W / 2, y, 0));
    }
    // gable ends
    for (const sx of [-1, 1]) {
      const tri = new THREE.Mesh(this._geo(new THREE.ConeGeometry(W * 0.55, 2.1, 4)), wood);
      tri.scale.set(1, 1, D / (W * 0.78));
      tri.position.set(sx * 0, 0, 0);
    }
    // roof: two slanted slabs
    for (const s of [-1, 1]) {
      const slab = box(W + 1.4, 0.28, D * 0.62, roofMat, 0, H + 0.62 + 0.28, s * D * 0.26);
      slab.rotation.x = s * 0.42;
      g.add(slab);
    }
    // door + frame
    g.add(box(1.7, 2.4, 0.16, woodDark, 0, 1.75, D / 2 + 0.14));
    const door = new THREE.Mesh(this._geo(new THREE.BoxGeometry(1.4, 2.14, 0.12)), this._mat('door', 0x4a3623));
    door.position.set(0, 1.72, D / 2 + 0.24);
    door.castShadow = true;
    g.add(door);
    // windows (glow at night)
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x2a3b46 });
    const glassMatLit = new THREE.MeshBasicMaterial({ color: 0xffcf8a });
    for (const s of [-1, 1]) {
      const win = new THREE.Mesh(this._geo(new THREE.BoxGeometry(1.1, 1.1, 0.14)), glassMat);
      win.position.set(s * 2.5, 2.05, D / 2 + 0.16);
      win.userData.dynamic = true; // its material is swapped at night
      g.add(win);
      const frame = box(1.35, 1.35, 0.1, woodDark, s * 2.5, 2.05, D / 2 + 0.1);
      g.add(frame);
      win.userData.lit = true;
      win.userData.dayMat = glassMat;
      win.userData.nightMat = glassMatLit;
      this.lights.push({ mesh: win, kind: 'window' });
    }
    // chimney
    const chim = box(1.1, 3.4, 1.1, stoneMat, -W / 2 + 1.4, H + 1.4, -D / 2 + 1.2);
    g.add(chim);
    // porch
    g.add(box(4.2, 0.2, 2.2, woodLight, 0, 0.5, D / 2 + 1.2));
    for (const sx of [-1.7, 1.7]) {
      const p = cyl(0.12, 0.12, 2.6, woodDark, 6);
      p.position.set(sx, 1.7, D / 2 + 2.1);
      g.add(p);
    }
    g.add(box(4.6, 0.24, 2.6, roofMat, 0, 3.0, D / 2 + 1.5));

    // interior light
    const innerLight = new THREE.PointLight(0xffb765, 0, 16, 2);
    innerLight.position.set(0, 2.3, 0);
    g.add(innerLight);
    this.lights.push({ light: innerLight, kind: 'cabin', base: 1.2, flicker: 0.08 });

    // sign above the door
    const cv = document.createElement('canvas');
    cv.width = 512;
    cv.height = 128;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#6b4f2e';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#f4e6c9';
    ctx.font = 'bold 58px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('钓者小屋', 256, 68);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._disposables.push(tex);
    const sign = new THREE.Mesh(this._geo(new THREE.PlaneGeometry(2.6, 0.65)), this._mat('cabin-sign', 0xffffff, { extra: { map: tex } }));
    sign.position.set(0, 3.55, D / 2 + 0.3);
    g.add(sign);

    this.group.add(g);
    this.cabin = { x, z, yaw, w: W, d: D, h: H };
    this.colliders.push({ type: 'box', x, z, hw: W / 2 + 0.35, hd: D / 2 + 0.35, yaw, name: 'cabin' });

    // ---- campfire + crates beside the cabin
    this._buildCampfire(x + 5.4, z + 2.2);
    const crate = this._mat('crate', 0x9a7a4e);
    const barrel = this._mat('barrel', 0x7d5c34);
    for (let i = 0; i < 4; i++) {
      const cx = x + 4.4 + (i % 2) * 1.0;
      const cz = z - 3.2 - Math.floor(i / 2) * 1.0;
      const c = box(0.9, 0.9, 0.9, i % 2 ? crate : barrel, cx, this.terrain.heightAt(cx, cz) + 0.45, cz);
      c.rotation.y = i * 0.7;
      this.group.add(c);
      this.colliders.push({ type: 'circle', x: cx, z: cz, r: 0.7, name: 'crate' });
    }
  }

  _buildCampfire(x, z) {
    const g = new THREE.Group();
    const h = this.terrain.heightAt(x, z);
    g.position.set(x, h, z);
    const stoneMat = this._mat('firestone', 0x6f6a63);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      const s = new THREE.Mesh(this._geo(new THREE.DodecahedronGeometry(0.22, 0)), stoneMat);
      s.position.set(Math.cos(a) * 0.85, 0.1, Math.sin(a) * 0.85);
      s.rotation.set(a, a * 2, a * 0.5);
      s.castShadow = true;
      g.add(s);
    }
    const logMat = this._mat('log', 0x4e3a26);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI;
      const l = cyl(0.09, 0.11, 1.4, logMat, 5);
      l.position.set(Math.cos(a) * 0.2, 0.28, Math.sin(a) * 0.2);
      l.rotation.set(Math.PI / 2 - 0.5, a, 0);
      g.add(l);
    }
    const light = new THREE.PointLight(0xff8a3c, 1.8, 26, 2);
    light.position.set(0, 0.9, 0);
    g.add(light);
    this.lights.push({ light, kind: 'fire', base: 2.0, flicker: 0.45 });
    this.group.add(g);
    this.campfire = { x, z, y: h };

    // embers / flames
    const count = Math.round(70 * this.quality.particles);
    const pos = new Float32Array(count * 3);
    const seedArr = new Float32Array(count);
    const rnd = mulberry32(5150);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 0.6;
      pos[i * 3 + 1] = rnd() * 1.6;
      pos[i * 3 + 2] = (rnd() - 0.5) * 0.6;
      seedArr[i] = rnd();
    }
    const geo = new THREE.BufferGeometry();
    this._disposables.push(geo);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seedArr, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uPixelRatio: { value: 1 } },
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uPixelRatio;
        attribute float aSeed;
        varying float vLife;
        void main() {
          float life = fract(aSeed + uTime * (0.5 + aSeed * 0.35));
          vLife = life;
          vec3 p = position;
          p.y = life * (1.1 + aSeed * 0.9);
          p.x += sin(uTime * 2.0 + aSeed * 30.0) * 0.16 * life;
          p.z += cos(uTime * 1.7 + aSeed * 22.0) * 0.16 * life;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (14.0 + aSeed * 12.0) * uPixelRatio * (1.0 - life * 0.55) * (26.0 / max(1.0, -mv.z));
        }`,
      fragmentShader: /* glsl */ `
        precision mediump float;
        uniform float uOpacity;
        varying float vLife;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float a = smoothstep(0.5, 0.05, length(c)) * (1.0 - vLife) * uOpacity;
          if (a < 0.01) discard;
          vec3 col = mix(vec3(1.0, 0.85, 0.35), vec3(1.0, 0.28, 0.06), vLife);
          gl_FragColor = vec4(col, a * 0.85);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this._disposables.push(mat);
    const points = new THREE.Points(geo, mat);
    points.position.set(x, h + 0.25, z);
    points.frustumCulled = false;
    this.group.add(points);
    this._firePoints = { points, mat, count };

    // smoke
    const scount = Math.round(40 * this.quality.particles);
    const spos = new Float32Array(scount * 3);
    const sseed = new Float32Array(scount);
    for (let i = 0; i < scount; i++) {
      spos[i * 3] = (rnd() - 0.5) * 0.4;
      spos[i * 3 + 1] = rnd() * 2.6;
      spos[i * 3 + 2] = (rnd() - 0.5) * 0.4;
      sseed[i] = rnd();
    }
    const sgeo = new THREE.BufferGeometry();
    this._disposables.push(sgeo);
    sgeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
    sgeo.setAttribute('aSeed', new THREE.BufferAttribute(sseed, 1));
    const smat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uPixelRatio;
        attribute float aSeed;
        varying float vLife;
        void main() {
          float life = fract(aSeed + uTime * 0.11);
          vLife = life;
          vec3 p = position;
          p.y = life * (5.0 + aSeed * 3.0);
          p.x += sin(uTime * 0.6 + aSeed * 18.0) * 1.2 * life;
          p.z += cos(uTime * 0.5 + aSeed * 15.0) * 1.0 * life;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (40.0 + aSeed * 60.0) * uPixelRatio * (0.4 + life) * (30.0 / max(1.0, -mv.z));
        }`,
      fragmentShader: /* glsl */ `
        precision mediump float;
        varying float vLife;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float a = smoothstep(0.5, 0.0, length(c)) * (1.0 - vLife) * 0.28;
          if (a < 0.005) discard;
          gl_FragColor = vec4(vec3(0.55, 0.55, 0.58), a);
        }`,
      transparent: true,
      depthWrite: false,
    });
    this._disposables.push(smat);
    const smoke = new THREE.Points(sgeo, smat);
    smoke.position.set(x, h + 0.9, z);
    smoke.frustumCulled = false;
    this.group.add(smoke);
    this._smokePoints = { points: smoke, mat: smat, count: scount };
  }

  _buildBoat(dock, hullMat, trimMat) {
    const g = new THREE.Group();
    g.userData.dynamic = true;
    const x = dock.x + Math.cos(dock.angle) * (dock.length * 0.5 + 6) + 3.5;
    const z = dock.z - Math.sin(dock.angle) * (dock.length * 0.5 + 6) + 3.5;
    g.position.set(x, WATER_LEVEL + 0.25, z);
    g.rotation.y = rand(0, TAU);
    // hull
    const hull = new THREE.Mesh(this._geo(new THREE.CapsuleGeometry(1.15, 3.0, 4, 8)), hullMat);
    hull.rotation.z = Math.PI / 2;
    hull.scale.set(0.62, 1, 0.55);
    hull.position.y = 0.16;
    hull.castShadow = true;
    g.add(hull);
    const rim = new THREE.Mesh(this._geo(new THREE.TorusGeometry(1.9, 0.12, 5, 12)), trimMat);
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(1, 1, 0.72);
    rim.position.y = 0.5;
    g.add(rim);
    // thwart seats
    for (const sz of [-1.1, 1.1]) {
      g.add(box(1.7, 0.12, 0.34, trimMat, 0, 0.52, sz));
    }
    // oars
    for (const s of [-1, 1]) {
      const oar = cyl(0.06, 0.08, 3.2, trimMat, 6);
      oar.position.set(s * 0.9, 0.62, 0);
      oar.rotation.set(0, 0, Math.PI / 2 + s * 0.15);
      g.add(oar);
    }
    // lantern
    const lamp = new THREE.Mesh(this._geo(new THREE.SphereGeometry(0.16, 8, 6)), new THREE.MeshBasicMaterial({ color: 0xffcf8a }));
    lamp.position.set(0, 0.9, -1.7);
    g.add(lamp);
    this.group.add(g);
    this.boats = this.boats || [];
    this.boats.push({ group: g, x, z, dock });
    return g;
  }

  _buildBuoy(x, z, color) {
    const g = new THREE.Group();
    g.userData.dynamic = true;
    g.position.set(x, WATER_LEVEL, z);
    const mat = this._mat(`buoy-${color}`, color);
    const b = new THREE.Mesh(this._geo(new THREE.SphereGeometry(0.5, 10, 8)), mat);
    b.scale.set(1, 1.15, 1);
    g.add(b);
    const pole = cyl(0.06, 0.06, 1.6, this._mat('buoyPole', 0xdddddd), 5);
    pole.position.y = 1.0;
    g.add(pole);
    const top = new THREE.Mesh(this._geo(new THREE.SphereGeometry(0.13, 8, 6)), this._mat('buoyTop', 0xf5f0e0));
    top.position.y = 1.8;
    g.add(top);
    this.group.add(g);
    this.buoys.push({ group: g, x, z, phase: rand(0, TAU) });
  }

  _buildLilyPads() {
    const terrain = this.terrain;
    const rnd = mulberry32(3311);
    const spots = [
      { x: 95, z: -42, r: 26, n: 46 },
      { x: -140, z: 110, r: 60, n: 60 },
    ];
    const geo = this._geo(new THREE.CircleGeometry(0.6, 7));
    geo.rotateX(-Math.PI / 2);
    const mat = this._mat('lily', 0x3f7a3a, { extra: { side: THREE.DoubleSide } });
    let total = 0;
    const list = [];
    for (const s of spots) {
      for (let i = 0; i < s.n; i++) {
        const a = rnd() * TAU;
        const r = Math.sqrt(rnd()) * s.r;
        const x = s.x + Math.cos(a) * r;
        const z = s.z + Math.sin(a) * r;
        const h = terrain.heightAt(x, z);
        if (h > -0.35 || h < -4.5) continue;
        list.push({ x, z, s: 0.7 + rnd() * 0.9, ry: rnd() * TAU });
        total++;
      }
    }
    if (!list.length) return;
    const inst = new THREE.InstancedMesh(geo, mat, list.length);
    inst.frustumCulled = false;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const sc = new THREE.Vector3();
    list.forEach((it, i) => {
      p.set(it.x, WATER_LEVEL + 0.06, it.z);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), it.ry);
      sc.set(it.s, 1, it.s);
      m.compose(p, q, sc);
      inst.setMatrixAt(i, m);
    });
    inst.instanceMatrix.needsUpdate = true;
    this.group.add(inst);
    this.lilyPads = inst;
  }

  _buildCamp(x, z, wood, roofMat) {
    const terrain = this.terrain;
    const baseY = terrain.heightAt(x, z);
    const rnd = mulberry32(8821);
    const tentMat = this._mat('tent', CANVAS_TENT, { extra: { side: THREE.DoubleSide } });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.4;
      const tx = x + Math.cos(a) * 9;
      const tz = z + Math.sin(a) * 9;
      const ty = terrain.heightAt(tx, tz);
      const g = new THREE.Group();
      g.position.set(tx, ty, tz);
      g.rotation.y = rnd() * TAU;
      const tent = new THREE.Mesh(this._geo(new THREE.ConeGeometry(1.7, 2.0, 4)), tentMat);
      tent.position.y = 1.0;
      tent.rotation.y = Math.PI / 4;
      tent.castShadow = true;
      g.add(tent);
      g.add(box(2.6, 0.08, 2.6, roofMat, 0, 0.04, 0));
      this.group.add(g);
      this.colliders.push({ type: 'circle', x: tx, z: tz, r: 1.6, name: 'tent' });
    }
    // fire ring + logs
    const fireX = x;
    const fireZ = z;
    const fy = terrain.heightAt(fireX, fireZ);
    const ring = new THREE.Mesh(this._geo(new THREE.TorusGeometry(0.8, 0.12, 4, 10)), this._mat('firestone2', 0x6f6a63));
    ring.rotation.x = Math.PI / 2;
    ring.position.set(fireX, fy + 0.06, fireZ);
    this.group.add(ring);
    const logMat = this._mat('log2', 0x4e3a26);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU;
      const lg = cyl(0.28, 0.3, 2.4, logMat, 7);
      lg.position.set(fireX + Math.cos(a) * 2.2, fy + 0.28, fireZ + Math.sin(a) * 2.2);
      lg.rotation.set(0, a, Math.PI / 2);
      this.group.add(lg);
      this.colliders.push({ type: 'circle', x: fireX + Math.cos(a) * 2.2, z: fireZ + Math.sin(a) * 2.2, r: 0.5, name: 'log' });
    }
  }

  /**
   * A glass trophy tank on the cabin porch showing the three biggest catches.
   * The fish are animated with the same swim-wiggle shader the wildlife uses.
   */
  _buildAquarium() {
    const cx = FEATURES.cabin.x + 6.5;
    const cz = FEATURES.cabin.z + 4.5;
    const baseY = this.terrain.heightAt(cx, cz);
    const g = new THREE.Group();
    g.name = 'aquarium';
    g.position.set(cx, baseY, cz);
    g.rotation.y = -0.6;
    this.group.add(g);
    this.aquariumGroup = g;
    this.aquariumFish = [];

    const W = 2.6;
    const H = 1.5;
    const D = 1.1;
    const woodMat = this._mat('tankWood', 0x6b512f);
    const stoneMat = this._mat('tankStand', 0x77736c);
    // stand
    const stand = new THREE.Mesh(this._geo(new THREE.BoxGeometry(W + 0.3, 0.85, D + 0.3)), stoneMat);
    stand.position.y = 0.42;
    stand.castShadow = true;
    stand.receiveShadow = true;
    g.add(stand);
    const top = new THREE.Mesh(this._geo(new THREE.BoxGeometry(W + 0.4, 0.12, D + 0.4)), woodMat);
    top.position.y = 0.9;
    g.add(top);

    // water body
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x2f7f96, transparent: true, opacity: 0.55 });
    this._disposables.push(waterMat);
    const water = new THREE.Mesh(this._geo(new THREE.BoxGeometry(W - 0.1, H - 0.14, D - 0.1)), waterMat);
    water.position.y = 0.95 + (H - 0.14) / 2;
    g.add(water);

    // glass
    const glassMat = new THREE.MeshLambertMaterial({
      color: 0xcfe6f0,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this._disposables.push(glassMat);
    const glass = new THREE.Mesh(this._geo(new THREE.BoxGeometry(W, H, D)), glassMat);
    glass.position.y = 0.95 + H / 2;
    glass.renderOrder = 3;
    g.add(glass);
    // frame edges
    const frameMat = this._mat('tankFrame', 0x9aa4ad);
    for (const sy of [0, H]) {
      for (const sz of [-D / 2, D / 2]) {
        const bar = new THREE.Mesh(this._geo(new THREE.BoxGeometry(W + 0.06, 0.06, 0.06)), frameMat);
        bar.position.set(0, 0.95 + sy, sz);
        g.add(bar);
      }
    }
    // gravel + a little plant
    const gravelMat = this._mat('gravel', 0x8f8060);
    const gravel = new THREE.Mesh(this._geo(new THREE.BoxGeometry(W - 0.12, 0.1, D - 0.12)), gravelMat);
    gravel.position.y = 1.0;
    g.add(gravel);
    const plantMat = this._mat('tankPlant', 0x3f7a3a, { extra: { side: THREE.DoubleSide } });
    for (let i = 0; i < 3; i++) {
      const leaf = new THREE.Mesh(this._geo(new THREE.ConeGeometry(0.12, 0.55, 5)), plantMat);
      leaf.position.set(-W / 2 + 0.4 + i * 0.22, 1.32, -D / 2 + 0.3);
      leaf.rotation.z = (i - 1) * 0.3;
      g.add(leaf);
    }
    this._aquariumBounds = { W: W - 0.35, H: H - 0.3, D: D - 0.35, y0: 1.05 };
  }

  /** Replace the displayed fish with the given catch list (max 3). */
  setAquariumFish(list = []) {
    if (!this.aquariumGroup) return;
    for (const f of this.aquariumFish) {
      this.aquariumGroup.remove(f.mesh);
      f.mesh.geometry.dispose?.();
      f.mesh.material.dispose?.();
    }
    this.aquariumFish = [];
    if (!this._fishGeo) this._fishGeo = makeFishGeometry();
    const colors = [0xc4b48a, 0x8fa3ad, 0x7f9ba8];
    list.slice(0, 3).forEach((entry, i) => {
      const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });
      const phase = { value: Math.random() * 10 };
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uSwimTime = phase;
        shader.vertexShader = 'uniform float uSwimTime;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float swPh = uSwimTime * 7.5;
          transformed.x += sin(swPh + transformed.z * 7.0) * 0.075 * clamp(-transformed.z + 0.5, 0.0, 1.0);`
        );
      };
      const mesh = new THREE.Mesh(this._fishGeo, mat);
      const size = clamp(0.35 + Math.cbrt(entry.weight) * 0.22, 0.35, 0.9);
      mesh.scale.setScalar(size);
      this.aquariumGroup.add(mesh);
      this.aquariumFish.push({
        id: entry.id,
        mesh,
        mat,
        phase,
        size,
        angle: Math.random() * TAU,
        speed: rand(0.25, 0.6),
        y: rand(0.15, 0.75),
        t: Math.random() * 10,
      });
      this._disposables.push(mat);
    });
  }

  _updateAquarium(dt) {
    if (!this.aquariumFish?.length) return;
    const b = this._aquariumBounds;
    for (const f of this.aquariumFish) {
      f.t += dt;
      f.phase.value += dt;
      // lazy horizontal figure-eight inside the tank
      const x = Math.sin(f.t * f.speed) * (b.W / 2);
      const z = Math.sin(f.t * f.speed * 2) * (b.D / 2.6);
      const y = b.y0 + f.y * 0.5 + Math.sin(f.t * 1.3) * 0.06;
      f.mesh.position.set(x, y, z);
      const dx = Math.cos(f.t * f.speed) * f.speed * (b.W / 2);
      const dz = Math.cos(f.t * f.speed * 2) * f.speed * 2 * (b.D / 2.6);
      f.mesh.rotation.y = -Math.atan2(dz, dx) + Math.PI / 2;
    }
  }

  // ------------------------------------------------------------------ runtime

  update(dt, camera, water, env) {
    this._time += dt;
    const night = env?.night ?? 0;

    if (this._firePoints) {
      this._firePoints.mat.uniforms.uTime.value = this._time;
      this._smokePoints.mat.uniforms.uTime.value = this._time;
    }
    this._updateAquarium(dt);

    // buoys ride the waves
    if (water) {
      for (const b of this.buoys) {
        b.group.position.y = water.surfaceHeight(b.x, b.z);
        b.group.rotation.z = Math.sin(this._time * 1.2 + b.phase) * 0.14;
        b.group.rotation.x = Math.cos(this._time * 0.9 + b.phase) * 0.12;
      }
      for (const bt of this.boats || []) {
        bt.group.position.y = WATER_LEVEL + 0.22 + Math.sin(this._time * 0.8 + bt.x * 0.1) * 0.12;
        bt.group.rotation.z = Math.sin(this._time * 0.7 + bt.z * 0.05) * 0.05;
        bt.group.rotation.x = Math.cos(this._time * 0.6 + bt.x * 0.04) * 0.04;
      }
    }

    // lights: on at night, flickering for fire
    for (const entry of this.lights) {      if (entry.kind === 'window') {
        const lit = night > 0.25;
        entry.mesh.material = lit ? entry.mesh.userData.nightMat : entry.mesh.userData.dayMat;
        continue;
      }
      const l = entry.light;
      if (!l) continue;
      let target = 0;
      if (entry.kind === 'fire') target = entry.base * (0.75 + 0.25 * clamp01(night * 2.2));
      else target = entry.base * clamp01(night * 1.6);
      if (entry.kind === 'fire' || entry.kind === 'lamp') {
        target *= 1 + Math.sin(this._time * 9.3 + entry.base) * (entry.flicker || 0.06);
        target *= 1 + Math.sin(this._time * 21.7) * 0.03;
      }
      l.intensity = lerp(l.intensity, Math.max(0, target), 1 - Math.exp(-4 * dt));
    }
  }

  dispose() {
    for (const d of this._disposables) d.dispose?.();
    this._disposables.length = 0;
    this.materials = {};
    this.group.clear();
  }
}
