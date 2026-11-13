/**
 * wildlife.js — living water: schools of visible fish and circling birds.
 *
 * v1.1.0. The fish are drawn with a single InstancedMesh; each active fish
 * steers toward its school centre, wanders, avoids land, flees the angler,
 * rides the wave surface, ripples the water when it is shallow, and now and
 * then leaps clear of the surface. Only fish within `activeRadius` of the
 * camera are simulated, so the cost stays flat no matter how big the world is.
 */
import * as THREE from 'three';
import { clamp, clamp01, damp, lerp, mulberry32, rand, smoothstep, TAU, wrapAngle } from '../core/util.js';
import { WATER_LEVEL } from '../world/terrain.js';

const BODY_COLORS = [0x8fa3ad, 0xa8b0a0, 0xc4b48a, 0x7f9ba8, 0xd8cfae, 0x6f8f86, 0xb9a27a, 0x93a8b8];

/** A tiny low-poly fish: diamond body + tail fin, ~1 unit long. */
export function makeFishGeometry() {
  const g = new THREE.BufferGeometry();
  // x = across, y = up, z = forward (+z is the nose)
  const v = {
    nose: [0, 0, 0.5],
    top: [0, 0.075, 0.05],
    bot: [0, -0.075, 0.05],
    left: [-0.09, 0, 0.05],
    right: [0.09, 0, 0.05],
    tail: [0, 0, -0.42],
    tailTop: [0, 0.13, -0.5],
    tailBot: [0, -0.13, -0.5],
  };
  const faces = [
    ['nose', 'top', 'left'],
    ['nose', 'left', 'bot'],
    ['nose', 'bot', 'right'],
    ['nose', 'right', 'top'],
    ['top', 'tailTop', 'tail'],
    ['top', 'tail', 'left'],
    ['left', 'tail', 'tailBot'],
    ['left', 'tailBot', 'bot'],
    ['bot', 'tailBot', 'tail'],
    ['bot', 'tail', 'right'],
    ['right', 'tail', 'tailTop'],
    ['right', 'tailTop', 'top'],
  ];
  const pos = [];
  const col = [];
  const dark = new THREE.Color(0x4a5560);
  const light = new THREE.Color(0xffffff);
  for (const [a, b, c] of faces) {
    for (const k of [a, b, c]) {
      pos.push(v[k][0], v[k][1], v[k][2]);
      // darken the back, brighten the belly
      const k2 = clamp01((v[k][1] + 0.09) / 0.18);
      const col3 = dark.clone().lerp(light, k2 * 0.85 + 0.1);
      col.push(col3.r, col3.g, col3.b);
    }
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

export class FishLife {
  constructor(world, quality, opts = {}) {
    this.world = world;
    this.quality = quality;
    this.count = opts.count ?? Math.round(150 * clamp(quality.particles, 0.3, 1));
    this.activeRadius = opts.activeRadius ?? 78;
    this.group = new THREE.Group();
    this.group.name = 'fish-life';
    this._time = 0;
    this._disposables = [];
    this._dummy = new THREE.Object3D();
    this._tmp = new THREE.Vector3();
    this._surfRingTimer = 0;

    const geo = makeFishGeometry();
    this._disposables.push(geo);
    this.mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });
    const phaseUniform = { value: 0 };
    this._phaseUniform = phaseUniform;
    const mat = this.mat;
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uSwimTime = phaseUniform;
      shader.vertexShader = 'uniform float uSwimTime;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 swO = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
        #else
          vec3 swO = vec3(0.0);
        #endif
        float swPh = uSwimTime * 7.5 + swO.x * 0.6 + swO.z * 0.45;
        float swAmp = 0.075 * clamp(-transformed.z + 0.5, 0.0, 1.0);
        transformed.x += sin(swPh + transformed.z * 7.0) * swAmp;`
      );
    };
    mat.customProgramCacheKey = () => 'fishswim';
    this._disposables.push(mat);

    this.inst = new THREE.InstancedMesh(geo, mat, this.count);
    this.inst.name = 'fish-schools';
    this.inst.frustumCulled = false;
    this.inst.castShadow = false;
    this.inst.receiveShadow = false;
    this.inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.inst.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.count * 3), 3);
    this.inst.count = 0;
    this.group.add(this.inst);

    // ---- per-fish state
    this.fish = [];
    for (let i = 0; i < this.count; i++) {
      this.fish.push({
        alive: false,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        heading: 0,
        pitch: 0,
        size: 1,
        speed: 1,
        school: 0,
        depthPref: 1,
        surfaceT: 0,
        jumpT: -1,
        nextJump: rand(20, 90),
        nextRipple: rand(2, 8),
        color: new THREE.Color(),
      });
    }
    this.schools = [];
    for (let i = 0; i < 10; i++) {
      this.schools.push({ x: 0, z: 0, y: 0, vx: 0, vz: 0, active: false, timer: 0 });
    }

    this._buildRipples();
    this._spawnTimer = 0;
  }

  _buildRipples() {
    const n = Math.round(28 * clamp(this.quality.particles, 0.3, 1));
    const geo = new THREE.RingGeometry(0.16, 0.26, 12);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xdff2fa, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide });
    this._disposables.push(geo, mat);
    this.ripples = new THREE.InstancedMesh(geo, mat, n);
    this.ripples.frustumCulled = false;
    this.ripples.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.ripples.visible = false;
    this.group.add(this.ripples);
    this.ripplePool = { n, life: new Float32Array(n), x: new Float32Array(n), z: new Float32Array(n), sc: new Float32Array(n), next: 0, mat };
  }

  _spawnRipple(x, z, scale = 1) {
    const p = this.ripplePool;
    const i = p.next;
    p.next = (p.next + 1) % p.n;
    p.life[i] = 1;
    p.x[i] = x;
    p.z[i] = z;
    p.sc[i] = scale;
  }

  get stats() {
    return { max: this.count, active: this.inst.count, schools: this.schools.filter((s) => s.active).length, ripples: this.ripplePool.n };
  }

  /** Pick a water point near (cx,cz) suitable for a school. */
  _findWater(cx, cz, minD = 0.8, maxD = 60, tries = 24) {
    const w = this.world;
    for (let i = 0; i < tries; i++) {
      const a = Math.random() * TAU;
      const r = 6 + Math.random() * this.activeRadius;
      const x = cx + Math.cos(a) * r;
      const z = cz + Math.sin(a) * r;
      if (Math.abs(x) > w.terrain.half - 4 || Math.abs(z) > w.terrain.half - 4) continue;
      const d = w.depthAt(x, z);
      if (d >= minD && d <= maxD) return { x, z, depth: d };
    }
    return null;
  }

  /**
   * Activate fish near the camera; retire the ones that drift too far away.
   */
  _managePopulation(dt, camera, env, player) {
    const cx = camera.position.x;
    const cz = camera.position.z;
    this._spawnTimer -= dt;
    const night = env?.night ?? 0;
    // fish are most active around dawn and dusk
    const hour = this.world.timeOfDay;
    const dawnDusk = Math.max(Math.exp(-Math.pow((hour - 6.2) / 1.8, 2)), Math.exp(-Math.pow((hour - 18.4) / 1.9, 2)));
    const activity = 0.55 + dawnDusk * 0.6 - night * 0.25;
    this._activity = activity;
    const targetCount = Math.round(this.count * clamp01(activity));

    // retire
    let active = 0;
    for (const f of this.fish) {
      if (!f.alive) continue;
      const d = Math.hypot(f.x - cx, f.z - cz);
      if (d > this.activeRadius * 1.35) {
        f.alive = false;
      } else {
        active++;
      }
    }

    // refill
    if (this._spawnTimer <= 0 && active < targetCount) {
      this._spawnTimer = 0.35;
      const spot = this._findWater(cx, cz, 1.0, 40);
      if (spot) {
        // a school clusters around the chosen point
        const school = this.schools.find((s) => !s.active) || this.schools[(Math.random() * this.schools.length) | 0];
        school.active = true;
        school.x = spot.x;
        school.z = spot.z;
        school.y = -spot.depth * 0.5;
        school.vx = rand(-0.5, 0.5);
        school.vz = rand(-0.5, 0.5);
        school.timer = rand(6, 16);
        const schoolIndex = this.schools.indexOf(school);
        const members = 4 + Math.floor(Math.random() * 7);
        let spawned = 0;
        for (const f of this.fish) {
          if (spawned >= members) break;
          if (f.alive) continue;
          const a = Math.random() * TAU;
          const r = Math.sqrt(Math.random()) * 4.5;
          f.alive = true;
          f.school = schoolIndex;
          f.x = spot.x + Math.cos(a) * r;
          f.z = spot.z + Math.sin(a) * r;
          f.y = WATER_LEVEL - clamp(spot.depth * rand(0.25, 0.7), 0.5, 3.4);
          f.heading = Math.random() * TAU;
          f.pitch = 0;
          f.size = rand(0.35, 1.15) * (spot.depth > 12 ? 1.5 : 1);
          f.speed = rand(0.8, 1.8);
          f.depthPref = rand(0.6, 2.6);
          f.vx = Math.cos(f.heading) * f.speed;
          f.vz = Math.sin(f.heading) * f.speed;
          f.vy = 0;
          f.jumpT = -1;
          f.nextJump = rand(25, 120) / clamp(activity, 0.4, 1.4);
          f.nextRipple = rand(1.5, 7);
          f.surfaceT = 0;
          f.color.setHex(BODY_COLORS[(Math.random() * BODY_COLORS.length) | 0]).multiplyScalar(rand(0.8, 1.15));
          spawned++;
        }
      }
    }

    // schools wander
    for (const s of this.schools) {
      if (!s.active) continue;
      s.timer -= dt;
      s.x += s.vx * dt;
      s.z += s.vz * dt;
      const d = this.world.depthAt(s.x, s.z);
      if (d < 0.9 || s.timer <= 0 || Math.hypot(s.x - cx, s.z - cz) > this.activeRadius) {
        s.active = false;
      }
      s.vx = damp(s.vx, s.vx + rand(-0.6, 0.6), 0.4, dt);
      s.vz = damp(s.vz, s.vz + rand(-0.6, 0.6), 0.4, dt);
      const sp = Math.hypot(s.vx, s.vz);
      if (sp > 0.9) {
        s.vx *= 0.9 / sp;
        s.vz *= 0.9 / sp;
      }
    }
  }

  update(dt, camera, playerPos, env) {
    this._time += dt;
    this._phaseUniform.value = this._time;
    this._managePopulation(dt, camera, env, playerPos);

    const px = playerPos?.x ?? camera.position.x;
    const pz = playerPos?.z ?? camera.position.z;
    const py = playerPos?.y ?? camera.position.y;
    const activity = this._activity ?? 0.6;
    const dummy = this._dummy;
    let n = 0;

    for (let i = 0; i < this.fish.length; i++) {
      const f = this.fish[i];
      if (!f.alive) continue;
      const school = this.schools[f.school];

      // ---- steering: stay with the school, wander, avoid land, avoid the angler
      let ax = 0;
      let az = 0;
      if (school && school.active) {
        const dx = school.x - f.x;
        const dz = school.z - f.z;
        const d = Math.hypot(dx, dz);
        if (d > 3.5) {
          ax += (dx / d) * 1.1;
          az += (dz / d) * 1.1;
        }
      }
      ax += Math.cos(this._time * 0.7 + i * 1.7) * 0.35;
      az += Math.sin(this._time * 0.6 + i * 2.3) * 0.35;

      // avoid the player: fish scatter when you get close
      const pdx = f.x - px;
      const pdz = f.z - pz;
      const pd = Math.hypot(pdx, pdz);
      const fleeR = 7 + f.size * 2;
      if (pd < fleeR && Math.abs(py - f.y) < 6) {
        const k = (1 - pd / fleeR) * 3.2;
        ax += (pdx / (pd || 1)) * k;
        az += (pdz / (pd || 1)) * k;
      }

      // avoid running aground: probe ahead
      const probe = 2.2;
      const fx = Math.cos(f.heading);
      const fz = Math.sin(f.heading);
      const aheadDepth = this.world.depthAt(f.x + fx * probe, f.z + fz * probe);
      if (aheadDepth < 0.7) {
        // turn toward deeper water
        let bestA = f.heading;
        let bestD = -1;
        for (let k = 0; k < 8; k++) {
          const a = f.heading + (k + 1) * 0.7;
          const d = this.world.depthAt(f.x + Math.cos(a) * 6, f.z + Math.sin(a) * 6);
          if (d > bestD) {
            bestD = d;
            bestA = a;
          }
        }
        f.heading = bestA;
        ax += Math.cos(bestA) * 2.4;
        az += Math.sin(bestA) * 2.4;
      }

      // ---- integrate
      const targetSpeed = (f.jumpT >= 0 ? 2.6 : 1) * f.speed * 1.6;
      let nvx = f.vx + ax * dt * 2.2;
      let nvz = f.vz + az * dt * 2.2;
      const sp = Math.hypot(nvx, nvz) || 1e-4;
      const clamped = Math.min(sp, targetSpeed);
      f.vx = (nvx / sp) * clamped;
      f.vz = (nvz / sp) * clamped;

      f.x += f.vx * dt;
      f.z += f.vz * dt;
      f.heading = Math.atan2(f.vz, f.vx);

      // world bounds
      const lim = this.world.terrain.half - 5;
      f.x = clamp(f.x, -lim, lim);
      f.z = clamp(f.z, -lim, lim);

      // ---- vertical: ride the surface, hold depth, or jump
      const depthHere = this.world.depthAt(f.x, f.z);
      const surf = this.world.surfaceHeight(f.x, f.z);
      if (f.jumpT >= 0) {
        f.jumpT += dt;
        f.vy -= 9.81 * dt;
        f.y += f.vy * dt;
        if (f.jumpT > 0.15 && f.y < surf) {
          f.jumpT = -1;
          f.nextJump = rand(30, 130) / clamp(activity, 0.4, 1.4);
          this._spawnRipple(f.x, f.z, 1.5);
          f.y = surf - 0.4;
          f.vy = 0;
        }
      } else {
        // desired depth below the surface
        const wantDepth = clamp(f.depthPref, 0.35, Math.max(0.5, depthHere - 0.35));
        const wantY = surf - wantDepth;
        f.vy = damp(f.vy, (wantY - f.y) * 1.6, 3, dt);
        f.y += f.vy * dt;
        if (f.y > surf - 0.12) f.y = surf - 0.12;
        if (f.y < surf - depthHere + 0.2) f.y = surf - depthHere + 0.2;

        // jumping
        f.nextJump -= dt;
        if (f.nextJump <= 0 && depthHere > 1.2 && pd > 12 && Math.random() < 0.5) {
          f.nextJump = rand(30, 140);
          f.jumpT = 0;
          f.vy = rand(4.2, 6.4);
          f.vx *= 2.4;
          f.vz *= 2.4;
          this._spawnRipple(f.x, f.z, 1.2);
        }

        // surface ripples when swimming shallow
        if (surf - f.y < 0.45) {
          f.nextRipple -= dt;
          if (f.nextRipple <= 0) {
            f.nextRipple = rand(1.2, 5);
            this._spawnRipple(f.x, f.z, 0.55 + f.size * 0.35);
          }
        }
      }

      // ---- write the instance matrix
      dummy.position.set(f.x, f.y, f.z);
      dummy.rotation.set(0, 0, 0);
      // the geometry points +z, so align +z with the heading
      dummy.rotation.y = -f.heading + Math.PI / 2;
      if (f.jumpT >= 0) dummy.rotation.x = -clamp(f.vy * 0.12, -0.9, 0.9);
      dummy.scale.setScalar(f.size);
      dummy.updateMatrix();
      this.inst.setMatrixAt(n, dummy.matrix);
      this.inst.setColorAt(n, f.color);
      n++;
      if (n >= this.count) break;
    }

    this.inst.count = n;
    this.inst.instanceMatrix.needsUpdate = true;
    if (this.inst.instanceColor) this.inst.instanceColor.needsUpdate = true;
    this.inst.visible = n > 0;

    // ---- ripples
    const p = this.ripplePool;
    if (p.next >= 0) {
      let any = false;
      for (let i = 0; i < p.n; i++) {
        const l = p.life[i];
        if (l > 0) {
          any = true;
          p.life[i] = Math.max(0, l - dt * 1.4);
          const k = 1 - p.life[i];
          dummy.position.set(p.x[i], WATER_LEVEL + 0.05, p.z[i]);
          dummy.rotation.set(0, 0, 0);
          const s = (0.5 + k * 2.6) * (p.sc[i] || 1);
          dummy.scale.set(s, 1, s);
          dummy.updateMatrix();
          this.ripples.setMatrixAt(i, dummy.matrix);
        } else {
          dummy.position.set(0, -500, 0);
          dummy.scale.setScalar(0.001);
          dummy.updateMatrix();
          this.ripples.setMatrixAt(i, dummy.matrix);
        }
      }
      this.ripples.visible = any;
      this.ripples.instanceMatrix.needsUpdate = true;
    }
  }

  setQuality(quality) {
    this.quality = quality;
    // thin the drawn set rather than reallocating buffers mid-game
    const cap = Math.round(this.count * clamp(quality.particles, 0.3, 1));
    this._drawCap = cap;
  }

  dispose() {
    for (const d of this._disposables) d.dispose?.();
    this._disposables.length = 0;
    this.group.clear();
  }
}

/**
 * Fireflies — a drifting cloud of glowing points that only appears on warm,
 * calm nights near vegetation.
 */
export class Fireflies {
  constructor(world, quality, opts = {}) {
    this.world = world;
    this.count = opts.count ?? Math.round(90 * clamp(quality.particles, 0.3, 1));
    this.group = new THREE.Group();
    this.group.name = 'fireflies';
    this._time = 0;
    const pos = new Float32Array(this.count * 3);
    const seed = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      pos[i * 3] = rand(-40, 40);
      pos[i * 3 + 1] = rand(0.4, 4);
      pos[i * 3 + 2] = rand(-40, 40);
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this._disposables = [geo];
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: 1 } },
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uPixelRatio; uniform float uOpacity;
        attribute float aSeed;
        varying float vA;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.6 + aSeed * 40.0) * 3.0;
          p.y += sin(uTime * 0.9 + aSeed * 27.0) * 0.7;
          p.z += cos(uTime * 0.5 + aSeed * 33.0) * 3.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (10.0 + aSeed * 12.0) * uPixelRatio * (30.0 / max(1.0, -mv.z));
          // slow blink
          vA = uOpacity * (0.25 + 0.75 * pow(max(sin(uTime * 1.4 + aSeed * 60.0), 0.0), 2.0));
        }`,
      fragmentShader: /* glsl */ `
        precision mediump float;
        varying float vA;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float a = smoothstep(0.5, 0.02, length(c)) * vA;
          if (a < 0.01) discard;
          gl_FragColor = vec4(1.0, 0.95, 0.55, a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this._disposables.push(mat);
    this.mat = mat;
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.group.add(this.points);
  }

  update(dt, camera, env, playerPos) {
    this._time += dt;
    this.mat.uniforms.uTime.value = this._time;
    this.mat.uniforms.uPixelRatio.value = 1;
    const night = env?.night ?? 0;
    const calm = 1 - clamp01((env?.wind ?? 0) * 1.4);
    const wet = env?.rain > 0.2 ? 0.15 : 1;
    const target = clamp01((night - 0.35) / 0.5) * calm * wet;
    this.mat.uniforms.uOpacity.value = damp(this.mat.uniforms.uOpacity.value, target, 2, dt);
    this.points.visible = this.mat.uniforms.uOpacity.value > 0.02;
    if (this.points.visible) {
      const px = playerPos?.x ?? camera.position.x;
      const pz = playerPos?.z ?? camera.position.z;
      this.group.position.set(px, this.world.heightAt(px, pz), pz);
    }
  }

  dispose() {
    for (const d of this._disposables) d.dispose?.();
    this._disposables.length = 0;
    this.group.clear();
  }
}

/**
 * Birds — a handful of gulls circling over the water, landing and taking off.
 * Cheap atmospheric life: two triangles each, one InstancedMesh.
 */
export class Birds {
  constructor(world, quality, opts = {}) {
    this.world = world;
    this.count = opts.count ?? Math.round(26 * clamp(quality.particles, 0.3, 1));
    this.group = new THREE.Group();
    this.group.name = 'birds';
    this._time = 0;
    this._disposables = [];
    this._dummy = new THREE.Object3D();

    const geo = new THREE.BufferGeometry();
    // a simple gull: two swept wings and a body line
    const verts = [
      0, 0, 0.18, -1.05, 0.16, -0.16, -0.12, 0, -0.2,
      0, 0, 0.18, 0.12, 0, -0.2, 1.05, 0.16, -0.16,
      0, 0.03, 0.2, -0.06, 0.06, -0.22, 0.06, 0.06, -0.22,
    ];
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.computeVertexNormals();
    this._disposables.push(geo);
    const mat = new THREE.MeshLambertMaterial({ color: 0xf2f4f6, side: THREE.DoubleSide, flatShading: true });
    this._disposables.push(mat);
    this.mat = mat;

    this.inst = new THREE.InstancedMesh(geo, mat, this.count);
    this.inst.frustumCulled = false;
    this.inst.castShadow = false;
    this.inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.inst);

    this.birds = [];
    for (let i = 0; i < this.count; i++) {
      this.birds.push({
        active: false,
        x: 0,
        y: 0,
        z: 0,
        angle: 0,
        radius: rand(18, 55),
        cx: 0,
        cz: 0,
        speed: rand(0.16, 0.3),
        flap: Math.random() * TAU,
        size: rand(0.8, 1.5),
        mode: 'circle',
        timer: rand(4, 20),
        vx: 0,
        vy: 0,
        vz: 0,
      });
    }
  }

  get stats() {
    return { max: this.count, active: this.birds.filter((b) => b.active).length };
  }

  update(dt, camera, env) {
    this._time += dt;
    const night = env?.night ?? 0;
    const storm = (env?.wind ?? 0) > 0.7;
    const wanted = Math.round(this.count * clamp01(0.85 - night * 0.8 - (storm ? 0.5 : 0)));
    let active = 0;
    for (const b of this.birds) if (b.active) active++;

    // spawn / retire
    for (const b of this.birds) {
      if (!b.active && active < wanted) {
        const w = this._findWaterNear(camera.position.x, camera.position.z);
        if (w) {
          b.active = true;
          active++;
          b.cx = w.x;
          b.cz = w.z;
          b.angle = Math.random() * TAU;
          b.radius = rand(16, 52);
          b.x = b.cx + Math.cos(b.angle) * b.radius;
          b.z = b.cz + Math.sin(b.angle) * b.radius;
          b.y = rand(9, 26);
          b.mode = Math.random() < 0.25 ? 'glide' : 'circle';
          b.timer = rand(6, 22);
        }
      } else if (b.active && active > wanted) {
        b.active = false;
        active--;
      } else if (b.active) {
        b.timer -= dt;
        const d = Math.hypot(b.x - camera.position.x, b.z - camera.position.z);
        if (b.timer <= 0 || d > 130) {
          b.active = false;
          active--;
        }
      }
    }

    const dummy = this._dummy;
    let n = 0;
    for (let i = 0; i < this.birds.length; i++) {
      const b = this.birds[i];
      if (!b.active) continue;
      if (b.mode === 'circle') {
        b.angle += b.speed * dt;
        b.x = b.cx + Math.cos(b.angle) * b.radius;
        b.z = b.cz + Math.sin(b.angle) * b.radius;
        b.y = 12 + Math.sin(this._time * 0.4 + i) * 3.5;
        dummy.rotation.set(0, -b.angle - Math.PI / 2, Math.sin(this._time * 0.6 + i) * 0.18);
      } else {
        // glide: drift in a straight line, gently bobbing
        b.x += Math.cos(b.angle) * 7 * dt;
        b.z += Math.sin(b.angle) * 7 * dt;
        b.y += Math.sin(this._time * 0.5 + i * 2) * 0.6 * dt;
        b.angle += rand(-0.25, 0.25) * dt;
        dummy.rotation.set(0, -b.angle - Math.PI / 2, 0);
      }
      // flap
      const flap = Math.sin(this._time * (b.mode === 'circle' ? 7.5 : 2.2) + b.flap) * (b.mode === 'circle' ? 0.55 : 0.18);
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.z += flap;
      dummy.scale.setScalar(b.size);
      dummy.updateMatrix();
      this.inst.setMatrixAt(n, dummy.matrix);
      n++;
    }
    this.inst.count = n;
    this.inst.instanceMatrix.needsUpdate = true;
    this.inst.visible = n > 0;
  }

  _findWaterNear(cx, cz) {
    const w = this.world;
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * TAU;
      const r = 20 + Math.random() * 100;
      const x = cx + Math.cos(a) * r;
      const z = cz + Math.sin(a) * r;
      if (Math.abs(x) > w.terrain.half - 8 || Math.abs(z) > w.terrain.half - 8) continue;
      if (w.depthAt(x, z) > 1.5) return { x, z };
    }
    return null;
  }

  dispose() {
    for (const d of this._disposables) d.dispose?.();
    this._disposables.length = 0;
    this.group.clear();
  }
}
