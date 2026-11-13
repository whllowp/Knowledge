/**
 * megafauna.js — whales (v3.4.0).
 *
 * Not catchable: these are the moment a trip to the deep pays off. Each whale
 * patrols a slow circuit offshore, dives for a while, then surfaces to blow —
 * and if you are close enough in a boat you get a "sighting" recorded in the
 * journal. Deliberately cheap: a handful of low-poly meshes per animal.
 */
import * as THREE from 'three';
import { Emitter, clamp01, damp, lerp, rand, TAU } from '../core/util.js';
import { WATER_LEVEL } from '../world/terrain.js';

const WHALE_DEFS = [
  {
    id: 'blue_whale',
    name: '蓝鲸',
    en: 'Blue Whale',
    icon: '🐋',
    center: [-520, -430],
    radius: 95,
    speed: 0.9,
    scale: 1.15,
    length: 24,
    body: 0x5d7d9a,
    belly: 0x9db4c8,
    blowHeight: 5.2,
    dive: [12, 20],
    surface: [5, 8],
  },
  {
    id: 'humpback',
    name: '座头鲸',
    en: 'Humpback Whale',
    icon: '🐋',
    center: [-330, -335],
    radius: 74,
    speed: 1.05,
    scale: 0.9,
    length: 15,
    body: 0x3f4a52,
    belly: 0xb9c6cf,
    blowHeight: 3.4,
    dive: [9, 15],
    surface: [4, 7],
  },
  {
    id: 'orca',
    name: '虎鲸',
    en: 'Orca',
    icon: '🐋',
    center: [430, -520],
    radius: 82,
    speed: 1.5,
    scale: 0.85,
    length: 9,
    body: 0x14181d,
    belly: 0xf2f6f8,
    blowHeight: 2.4,
    dive: [7, 12],
    surface: [3, 5],
  },
  {
    id: 'sperm_whale',
    name: '抹香鲸',
    en: 'Sperm Whale',
    icon: '🐋',
    center: [-430, -640],
    radius: 110,
    speed: 0.75,
    scale: 1.0,
    length: 18,
    body: 0x4a4a52,
    belly: 0x8e8e96,
    blowHeight: 4.2,
    dive: [16, 26],
    surface: [4, 7],
  },
  {
    id: 'dolphin',
    name: '海豚',
    en: 'Bottlenose Dolphin',
    icon: '🐬',
    center: [-330, 300],
    radius: 68,
    speed: 2.1,
    scale: 0.22,
    length: 3.2,
    body: 0x5a6672,
    belly: 0xd8e4ec,
    blowHeight: 0.9,
    dive: [4, 7],
    surface: [2, 4],
    count: 4,
    pod: true,
  },
];

/** One whale: body, tail, fins, blowhole puff. */
class Whale extends Emitter {
  constructor(world, def, quality, opts = {}) {
    super();
    this.world = world;
    this.def = def;
    this.id = def.id;
    this.name = def.name;
    this.primary = opts.primary !== false; // only the pod leader logs sightings
    this.scaleMul = opts.scaleMul ?? 1;
    this.angle = rand(0, TAU) + (opts.angleOffset || 0);
    this.dir = 1;
    this.depth = rand(6, 12);
    this.state = 'dive';
    this.timer = rand(2, 8);
    this.time = rand(0, 100);
    this.sighted = false;
    this.group = new THREE.Group();
    this.group.name = `whale-${def.id}`;
    this._disposables = [];
    this._build(quality);
    world.engine.worldGroup.add(this.group);
    this._place();
  }

  _build(quality) {
    const geo = (g) => {
      this._disposables.push(g);
      return g;
    };
    const bodyMat = new THREE.MeshLambertMaterial({ color: this.def.body, flatShading: true });
    const bellyMat = new THREE.MeshLambertMaterial({ color: this.def.belly, flatShading: true });
    this._disposables.push(bodyMat, bellyMat);

    const L = this.def.length * this.def.scale * this.scaleMul;
    const body = new THREE.Mesh(geo(new THREE.SphereGeometry(L * 0.5, 12, 8)), bodyMat);
    body.scale.set(0.44, 0.4, 1.0);
    this.group.add(body);
    this.body = body;

    // belly patch
    const belly = new THREE.Mesh(geo(new THREE.SphereGeometry(L * 0.34, 10, 6)), bellyMat);
    belly.scale.set(0.36, 0.2, 0.82);
    belly.position.set(0, -L * 0.13, L * 0.02);
    this.group.add(belly);

    // tail stock + fluke
    const tail = new THREE.Mesh(geo(new THREE.ConeGeometry(L * 0.13, L * 0.4, 6)), bodyMat);
    tail.rotation.x = -Math.PI / 2;
    tail.position.z = -L * 0.52;
    this.group.add(tail);
    const fluke = new THREE.Mesh(geo(new THREE.BoxGeometry(L * 0.5, L * 0.03, L * 0.16)), bodyMat);
    fluke.position.z = -L * 0.72;
    this.group.add(fluke);
    this.fluke = fluke;

    // dorsal fin (skip for the blue whale — it barely has one)
    if (this.def.id !== 'blue_whale') {
      const dorsal = new THREE.Mesh(geo(new THREE.ConeGeometry(L * 0.05, L * 0.14, 4)), bodyMat);
      dorsal.position.set(0, L * 0.16, -L * 0.08);
      dorsal.rotation.x = 0.25;
      this.group.add(dorsal);
    }
    // pectoral fins
    for (const side of [-1, 1]) {
      const fin = new THREE.Mesh(geo(new THREE.BoxGeometry(L * 0.3, L * 0.03, L * 0.1)), this.def.id === 'humpback' ? bellyMat : bodyMat);
      fin.position.set(side * L * 0.24, -L * 0.04, L * 0.16);
      fin.rotation.z = side * 0.35;
      fin.rotation.y = side * 0.25;
      this.group.add(fin);
    }
    // orca eye patch
    if (this.def.id === 'orca') {
      const patch = new THREE.Mesh(geo(new THREE.SphereGeometry(L * 0.06, 6, 4)), bellyMat);
      patch.position.set(L * 0.13, L * 0.08, L * 0.2);
      this.group.add(patch);
    }

    // blow puff
    const puffMat = new THREE.MeshBasicMaterial({ color: 0xeaf4ff, transparent: true, opacity: 0, depthWrite: false });
    this._disposables.push(puffMat);
    this.puffMat = puffMat;
    const puff = new THREE.Mesh(geo(new THREE.SphereGeometry(1, 8, 6)), puffMat);
    puff.position.z = L * 0.3;
    puff.visible = false;
    this.group.add(puff);
    this.puff = puff;

    // surface ripple ring
    const ringGeo = geo(new THREE.RingGeometry(0.6, 0.78, 20));
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xdfeef8, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    this._disposables.push(ringMat);
    this.ringMat = ringMat;
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.position.y = 0.1;
    this.group.add(this.ring);

    this.group.scale.setScalar(1);
  }

  _place() {
    const c = this.def.center;
    const r = this.def.radius;
    const x = c[0] + Math.cos(this.angle) * r;
    const z = c[1] + Math.sin(this.angle) * r;
    this.group.position.set(x, WATER_LEVEL - this.depth, z);
    const ahead = Math.atan2(-Math.sin(this.angle) * this.dir, Math.cos(this.angle) * this.dir);
    this.group.rotation.y = ahead;
  }

  /** Park the whale at a fixed spot (used to frame screenshots / tests). */
  freezeAt(x, z, depth = -0.9) {
    this.frozen = { x, z };
    this.depth = depth;
    this.state = 'surface';
    this.timer = 20;
    this.group.position.set(x, WATER_LEVEL - depth, z);
  }

  update(dt, playerPos) {
    this.time += dt;
    if (this.frozen) {
      // hold position but keep breathing
      this.group.position.set(this.frozen.x, WATER_LEVEL - this.depth, this.frozen.z);
      const beat = Math.sin(this.time * 1.6);
      this.fluke.rotation.x = beat * 0.25;
      this.body.rotation.z = Math.sin(this.time * 0.6) * 0.04;
      if (this.puff.visible) {
        const k = clamp01(1 - this._puffT / 1.5);
        this._puffT += dt;
        this.puff.scale.setScalar(0.5 + (1 - k) * 2.4);
        this.puff.position.y = this._puffY + (1 - k) * this.def.blowHeight;
        this.puffMat.opacity = k * 0.55;
        if (k <= 0.01) this.puff.visible = false;
      }
      this._checkSighting(playerPos);
      return;
    }
    this.angle += (dt * this.def.speed * this.dir) / this.def.radius;
    if (this.angle > TAU) this.angle -= TAU;
    if (this.angle < 0) this.angle += TAU;

    // ---- surface / dive cycle
    this.timer -= dt;
    if (this.state === 'dive' && this.timer <= 0) {
      this.state = 'rise';
      this.timer = 3.2;
    } else if (this.state === 'rise' && this.timer <= 0) {
      this.state = 'surface';
      this.timer = rand(this.def.surface[0], this.def.surface[1]);
      this._blow();
    } else if (this.state === 'surface' && this.timer <= 0) {
      this.state = 'descend';
      this.timer = 4.0;
    } else if (this.state === 'descend' && this.timer <= 0) {
      this.state = 'dive';
      this.timer = rand(this.def.dive[0], this.def.dive[1]);
    }

    const deep = 7 + this.def.scale * 6;
    // negative depth = the back breaks the surface, which is what you actually
    // see when a whale blows
    const crest = -1.5;
    let target = deep;
    if (this.state === 'rise') target = lerp(deep, crest, 1 - this.timer / 3.2);
    else if (this.state === 'surface') target = crest;
    else if (this.state === 'descend') target = lerp(crest, deep, 1 - this.timer / 4.0);
    this.depth = damp(this.depth, target, 1.6, dt);

    this._place();
    this.group.position.y = WATER_LEVEL - this.depth;

    // body motion: slow roll + tail beat
    const beat = Math.sin(this.time * (1.4 + (1 - clamp01(this.depth / deep)) * 0.8));
    this.fluke.rotation.x = beat * 0.35;
    this.body.rotation.z = Math.sin(this.time * 0.6) * 0.05;
    this.group.rotation.z = Math.sin(this.time * 0.5) * 0.04;

    // ---- puff + ripple
    if (this.puff.visible) {
      const k = clamp01(1 - this._puffT / 1.5);
      this._puffT += dt;
      this.puff.scale.setScalar(0.5 + (1 - k) * 2.4);
      this.puff.position.y = this._puffY + (1 - k) * this.def.blowHeight;
      this.puffMat.opacity = k * 0.55;
      if (k <= 0.01) this.puff.visible = false;
    }
    if (this.ringMat.opacity > 0.01) {
      this._ringT += dt;
      this.ring.scale.setScalar(1 + this._ringT * 2.6);
      this.ringMat.opacity = Math.max(0, 0.5 - this._ringT * 0.35);
    }

    // ---- sighting (only the pod leader logs it, so a dolphin pod counts once)
    this._checkSighting(playerPos);
  }

  /** Record a sighting when the player is close enough to a surfacing animal. */
  _checkSighting(playerPos) {
    if (playerPos && this.primary && !this.sighted && this.depth < 1.8) {
      const d = Math.hypot(playerPos.x - this.group.position.x, playerPos.z - this.group.position.z);
      if (d < 130) {
        this.sighted = true;
        this.emit('sighting', { id: this.id, name: this.name, icon: this.def.icon, dist: d });
      }
    }
  }

  _blow() {
    this.puff.visible = true;
    this._puffT = 0;
    this._puffY = this.puff.position.y;
    this.ringMat.opacity = 0.5;
    this._ringT = 0;
    this.ring.scale.setScalar(1);
    // re-roll the dive you come back from, for variety
    this.emit('blow', { id: this.id });
  }

  get surfaced() {
    return this.depth < 1.6;
  }

  dispose() {
    this.world.engine.worldGroup.remove(this.group);
    for (const d of this._disposables) d.dispose?.();
    this._disposables.length = 0;
    this.group.clear();
    this.clear();
  }
}

export class Whales extends Emitter {
  constructor(world, quality) {
    super();
    this.world = world;
    this.list = [];
    const enabled = quality.particles > 0.3;
    if (!enabled) return;
    for (const def of WHALE_DEFS) {
      // `count` > 1 spawns a pod (dolphins): the leader logs the sighting
      const n = Math.max(1, def.count || 1);
      for (let i = 0; i < n; i++) {
        const w = new Whale(world, def, quality, {
          primary: i === 0,
          scaleMul: 1 - i * 0.09,
          angleOffset: (i / n) * 0.5,
        });
        w.on('sighting', (info) => this.emit('sighting', info));
        w.on('blow', (info) => this.emit('blow', info));
        this.list.push(w);
      }
    }
    this.group = new THREE.Group();
  }

  update(dt, camera, playerPos, env) {
    if (!this.list.length) return;
    // whales only animate while you are out on the water — saves the CPU on land
    const away = playerPos ? Math.hypot(playerPos.x, playerPos.z) : 0;
    for (const w of this.list) {
      const d = playerPos
        ? Math.hypot(playerPos.x - w.group.position.x, playerPos.z - w.group.position.z)
        : 9999;
      if (d > 700) continue;
      w.update(dt, playerPos);
    }
  }

  /** Nearest whale, for the HUD hint. */
  nearest(playerPos) {
    let best = null;
    for (const w of this.list) {
      const d = Math.hypot(playerPos.x - w.group.position.x, playerPos.z - w.group.position.z);
      if (!best || d < best.dist) best = { name: w.name, dist: d, surfaced: w.surfaced, x: w.group.position.x, z: w.group.position.z };
    }
    return best;
  }

  dispose() {
    for (const w of this.list) w.dispose();
    this.list.length = 0;
    this.clear();
  }
}
