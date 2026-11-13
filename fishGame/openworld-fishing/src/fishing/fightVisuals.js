/**
 * fightVisuals.js — what you see of the fish, and the moment you land it.
 *
 * v2.1.0 / v2.2.0
 *  - FightVisual: a fish breaks the surface while you fight it. It sits deeper
 *    when the fish has taken line, thrashes and throws spray on a run, and
 *    rises as the distance closes.
 *  - Reveal: on a big catch the fish lifts out of the water in front of the
 *    camera, the FOV punches in, time dilates briefly and a size-class banner
 *    is published for the HUD. Small fish skip the ceremony.
 */
import * as THREE from 'three';
import { Emitter, clamp, clamp01, damp, lerp, rand, TAU } from '../core/util.js';
import { makeFishGeometry } from '../entities/wildlife.js';
import { WATER_LEVEL } from '../world/terrain.js';
import { SIZE_CLASSES, sizeClass, deservesReveal } from '../data/size.js';

export { SIZE_CLASSES, sizeClass, deservesReveal };

export class FightVisuals extends Emitter {
  constructor(world, engine, opts = {}) {
    super();
    this.world = world;
    this.engine = engine;
    this.group = new THREE.Group();
    this.group.name = 'fight-visuals';
    engine.dynamicGroup.add(this.group);
    this._disposables = [];
    this._time = 0;

    this.fishGeo = makeFishGeometry();
    this._disposables.push(this.fishGeo);
    this.fishMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });
    this._disposables.push(this.fishMat);
    this.fish = new THREE.Mesh(this.fishGeo, this.fishMat);
    this.fish.visible = false;
    this.fish.castShadow = false;
    this.group.add(this.fish);

    // wake: two thin blades trailing the fish
    const wakeGeo = new THREE.BufferGeometry();
    wakeGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -0.9, 0, -1.6, 0.9, 0, -1.6], 3));
    this._disposables.push(wakeGeo);
    this.wakeMat = new THREE.MeshBasicMaterial({ color: 0xdff2fa, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false });
    this._disposables.push(this.wakeMat);
    this.wake = new THREE.Mesh(wakeGeo, this.wakeMat);
    this.wake.rotation.x = -Math.PI / 2;
    this.wake.visible = false;
    this.group.add(this.wake);

    // splash ring pool for runs / thrash
    const ringGeo = new THREE.RingGeometry(0.3, 0.42, 18);
    ringGeo.rotateX(-Math.PI / 2);
    this._disposables.push(ringGeo);
    this.splashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
    this._disposables.push(this.splashMat);
    this.splashes = [];
    this._splashGeo = ringGeo;

    // ---- reveal state
    this.reveal = {
      active: false,
      t: 0,
      dur: 2.2,
      fish: null,
      weight: 1,
      rarity: 1,
      cls: SIZE_CLASSES[0],
      startFov: 72,
    };
    this.revealFish = new THREE.Mesh(this.fishGeo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide }));
    this._disposables.push(this.revealFish.material);
    this.revealFish.visible = false;
    this.group.add(this.revealFish);

    this._tmp = new THREE.Vector3();
    this.timeScale = 1;
  }

  /** Subscribe to a FishingSystem. */
  attach(fishing) {
    this.fishing = fishing;
    fishing.on('hooked', (e) => this._onHooked(e));
    fishing.on('run', (e) => this._onRun(e));
    fishing.on('landed', (e) => this._onLanded(e));
    fishing.on('dragSlip', (e) => {
      this.slipping = !!e.on;
    });
    const hide = () => this._hideFish();
    fishing.on('snap', hide);
    fishing.on('escape', hide);
    fishing.on('castEnd', hide);
    return this;
  }

  _colorFor(rarity) {
    const c = new THREE.Color(0xc4b48a);
    if (rarity >= 5) c.setHex(0xffb347);
    else if (rarity >= 4) c.setHex(0xe8d9a0);
    else if (rarity >= 3) c.setHex(0xa8c0d0);
    return c;
  }

  _onHooked(e) {
    const scale = clamp(0.35 + Math.cbrt(e.weight) * 0.5, 0.35, 2.6);
    this._fishScale = scale;
    this.fish.scale.setScalar(scale);
    this.fishMat.color.copy(this._colorFor(e.fish.rarity));
    this.fish.visible = true;
    this.wake.visible = true;
    this.fishRarity = e.fish.rarity;
    this.fishWeight = e.weight;
    this.emit('hooked', e);
  }

  _hideFish() {
    this.fish.visible = false;
    this.wake.visible = false;
    this.slipping = false;
  }

  _onRun(e) {
    if (!this.fish.visible) return;
    this._spawnSplash(this.fish.position.x, this.fish.position.z, 1 + (e.power || 1) * 1.4);
    this._thrash = 1;
  }

  _onLanded(info) {
    this._hideFish();
    const cls = sizeClass(info.weight, info.fish.rarity);
    this.emit('sizeClass', cls);
    if (!deservesReveal(info.weight, info.fish.rarity)) {
      this.emit('revealSkipped', { cls, info });
      return;
    }
    // ---- start the reveal
    const cam = this.engine.camera;
    const r = this.reveal;
    r.active = true;
    r.t = 0;
    r.dur = clamp(1.8 + Math.cbrt(info.weight) * 0.34, 1.8, 3.2);
    r.weight = info.weight;
    r.rarity = info.fish.rarity;
    r.cls = cls;
    r.fish = info.fish;
    r.startFov = cam.fov;
    const dist = clamp(3.4 + Math.cbrt(info.weight) * 0.9, 3.4, 7.5);
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    const base = cam.position.clone().addScaledVector(dir, dist);
    base.y = Math.max(WATER_LEVEL + 1.1, cam.position.y - 0.6);
    r.base = base;
    r.scale = clamp(0.6 + Math.cbrt(info.weight) * 0.8, 0.6, 3.4);
    this.revealFish.position.copy(base);
    this.revealFish.position.y = WATER_LEVEL - 0.4; // starts under the surface
    this.revealFish.scale.setScalar(r.scale * 0.4);
    this.revealFish.material.color.copy(this._colorFor(info.fish.rarity));
    this.revealFish.visible = true;
    r.lookTarget = base.clone();
    this.emit('revealStart', { info, cls });
  }

  _spawnSplash(x, z, scale = 1) {
    const mat = this.splashMat.clone();
    const mesh = new THREE.Mesh(this._splashGeo, mat);
    mesh.position.set(x, WATER_LEVEL + 0.05, z);
    mesh.scale.setScalar(0.4 * scale);
    this.group.add(mesh);
    this.splashes.push({ mesh, mat, life: 0, max: 0.8, scale });
    if (this.splashes.length > 14) {
      const old = this.splashes.shift();
      this.group.remove(old.mesh);
      old.mat.dispose();
    }
  }

  update(dt, camera, playerPos) {
    this._time += dt;
    const fishing = this.fishing;

    // ---- surface fish during the fight
    if (this.fish.visible && fishing?.fight) {
      const f = fishing.fight;
      const near = clamp01(1 - f.distance);
      const surf = this.world.surfaceHeight(fishing.bobberPos.x, fishing.bobberPos.z);
      // weather cues (v2.8.0): wind drifts the fish, rain throws spray
      const wx = this.world.weather || {};
      const wind = wx.wind ?? 0;
      const rain = wx.rainIntensity ?? 0;
      const windX = Math.sin(this._time * 0.8) * wind * 0.28;
      const windZ = Math.cos(this._time * 0.63) * wind * 0.2;
      const fx = fishing.bobberPos.x + windX;
      const fz = fishing.bobberPos.z + windZ;
      // sits deeper when far out, rises as it comes to the net
      const depth = lerp(1.5, 0.06, near);
      this.fish.position.set(fx, surf - depth, fz);
      this.fish.rotation.y += dt * (1.2 + f.stamina * 2.4);
      const thrash = this._thrash || 0;
      this.fish.rotation.z = Math.sin(this._time * 12) * 0.35 * (0.3 + f.tension) + thrash * Math.sin(this._time * 30) * 0.5;
      const pulse = 1 + Math.sin(this._time * 9) * 0.04 + thrash * 0.12;
      this.fish.scale.setScalar(this._fishScale * pulse);
      this._thrash = Math.max(0, thrash - dt * 1.6);

      // wake trails behind the heading
      this.wake.position.set(fx, surf + 0.04, fz);
      this.wake.rotation.z = -this.fish.rotation.y;
      this.wakeMat.opacity = clamp01(0.1 + (1 - near) * 0.4 + thrash * 0.5);
      // spray when the clutch slips hard
      if (this.slipping && Math.random() < dt * 5) this._spawnSplash(fx, fz, 0.5);
      // rain pocking the water around the fight
      if (rain > 0.12 && Math.random() < dt * rain * 9) {
        this._spawnSplash(fx + rand(-2.2, 2.2), fz + rand(-2.2, 2.2), 0.28);
      }
      if (rain > 0.3 && Math.sin(this._time * 3.1) > 0.97) this._spawnSplash(fx, fz, 0.7);
    } else if (this.fish.visible && !fishing?.fight) {
      this._hideFish();
    }

    // ---- splashes
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.life += dt;
      const k = clamp01(s.life / s.max);
      s.mesh.scale.setScalar((0.4 + k * 2.6) * s.scale);
      s.mat.opacity = (1 - k) * 0.55;
      if (k >= 1) {
        this.group.remove(s.mesh);
        s.mat.dispose();
        this.splashes.splice(i, 1);
      }
    }

    // ---- reveal choreography
    const r = this.reveal;
    if (r.active) {
      r.t += dt;
      const k = clamp01(r.t / r.dur);
      // rise out of the water (0 - 0.35), hold and spin (0.35 - 0.75), settle back (0.75 - 1)
      const rise = clamp01(k / 0.32);
      const settle = clamp01((k - 0.78) / 0.22);
      const y = lerp(WATER_LEVEL - 0.4, r.base.y, rise) - settle * 0.8;
      this.revealFish.position.set(r.base.x, y, r.base.z);
      this.revealFish.rotation.y += dt * lerp(2.6, 0.6, k);
      this.revealFish.rotation.z = Math.sin(this._time * 3) * 0.18 * (1 - settle);
      const pop = 0.4 + rise * 0.6;
      this.revealFish.scale.setScalar(r.scale * pop * (1 - settle * 0.15));
      // FOV punch-in
      const zoom = Math.sin(clamp01(k / 0.9) * Math.PI);
      if (camera) {
        camera.fov = lerp(r.startFov, r.startFov * 0.82, zoom);
        camera.updateProjectionMatrix();
        // keep the fish framed
        camera.lookAt(this.revealFish.position);
      }
      // brief slow motion
      this.timeScale = k < 0.55 ? lerp(1, 0.45, Math.sin((k / 0.55) * Math.PI)) : 1;
      if (k >= 1) {
        r.active = false;
        this.revealFish.visible = false;
        this.timeScale = 1;
        if (camera) {
          camera.fov = r.startFov;
          camera.updateProjectionMatrix();
        }
        this.emit('revealEnd', { info: r.fish, cls: r.cls });
      }
    } else {
      this.timeScale = 1;
    }
  }

  get revealing() {
    return this.reveal.active;
  }

  dispose() {
    this.engine.dynamicGroup.remove(this.group);
    for (const d of this._disposables) d.dispose?.();
    this._disposables.length = 0;
    for (const s of this.splashes) s.mat.dispose();
    this.group.clear();
    this.clear();
  }
}
