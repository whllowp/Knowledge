/**
 * boat.js — a boardable rowboat with a real buoyancy model (v6.4.0).
 *
 * The hull is no longer "damped toward the wave height": it is a light rigid
 * body with six sample points under the planking. Every point that is under
 * the surface pushes back (Archimedes), so the boat heaves, pitches and rolls
 * on its own springs, squats when you pull hard, heels into a turn, and bobs
 * for a second after a wake hits it.
 *
 * Horizontal motion is a keel model: thrust along the hull axis, quadratic
 * drag that drops once the hull is up on plane, and heavy lateral drag so the
 * boat carves instead of sliding. Steering authority grows with speed and
 * the stern walks out under power — but you can still pivot at a crawl.
 *
 * Collision is real too: three hull circles are resolved against the terrain
 * depth gradient, the prop colliders (docks, crates, tents...) and every
 * other hull. A hard hit costs hull integrity, shakes the camera, and the
 * boat starts taking water (top speed and drag suffer until you beach it).
 *
 * Everything is procedural, no textures, no extra draw calls beyond the
 * static detail meshes (which are merged per boat into a single group).
 */
import * as THREE from 'three';
import { clamp, clamp01, damp, lerp, rand, TAU, wrapAngle, Emitter } from '../core/util.js';
import { WATER_LEVEL } from '../world/terrain.js';

const HULL_LEN = 4.2;
const HULL_W = 1.5;
const HALF_LEN = HULL_LEN * 0.5;
const HALF_W = HULL_W * 0.5;

/** Contact circles along the keel: bow / midship / stern. */
const HULL_CIRCLES = [
  { z: -1.55, r: 0.62 },
  { z: -0.35, r: 0.78 },
  { z: 1.25, r: 0.66 },
];

/** Buoyancy sample points (local x/z, metres from the centre). */
const BUOY_POINTS = [
  { x: -0.55, z: -1.45 },
  { x: 0.55, z: -1.45 },
  { x: -0.6, z: 0.15 },
  { x: 0.6, z: 0.15 },
  { x: -0.5, z: 1.35 },
  { x: 0.5, z: 1.35 },
];

const KNOTS = 1.94384;

export class Boat extends Emitter {
  constructor(world, opts = {}) {
    super();
    this.world = world;
    this.id = opts.id || 'boat';
    this.position = new THREE.Vector3(opts.x ?? 0, WATER_LEVEL, opts.z ?? 0);
    this.velocity = new THREE.Vector3();
    this.angle = opts.angle ?? 0;
    this.angularVel = 0;
    this.aboard = false;
    this.strokePhase = 0;
    this.strokeDir = 1;
    this.rowing = 0;
    this.aground = false;
    this.hullIntegrity = 1;
    this.pitch = 0;
    this.roll = 0;
    this.pitchVel = 0;
    this.rollVel = 0;
    this.vy = 0;
    this.speed = 0;
    this.depth = 3;
    this.planing = 0;
    this._impactCd = 0;
    this._strokeCd = 0;
    this._groundCd = 0;
    this._time = 0;
    this._wake = 0;
    this.group = new THREE.Group();
    this.group.name = `boat-${this.id}`;
    this._disposables = [];
    this._tmpA = new THREE.Vector3();
    this._tmpB = new THREE.Vector3();
    this._tmpC = new THREE.Vector3();

    this._build();
    this.world.engine.worldGroup.add(this.group);
    this._snapToWater();
    this._floatPoseTo(0);
  }

  /* ------------------------------------------------------------------ *
   * Build
   * ------------------------------------------------------------------ */

  _build() {
    const geo = (g) => {
      this._disposables.push(g);
      return g;
    };
    const mat = (color, flat = true) => {
      const m = new THREE.MeshLambertMaterial({ color, flatShading: flat });
      this._disposables.push(m);
      return m;
    };
    this.mats = {
      hull: mat(0xa07c50),
      trim: mat(0x6d5334),
      seat: mat(0xb89463),
      oar: mat(0xb08a52),
      metal: mat(0x9aa4ad, false),
      rope: mat(0xb9a882),
      copper: mat(0x7d5f42),
      bucket: mat(0x4f5a63),
      net: mat(0x6f7f63),
    };

    const mesh = (geometry, material, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(geometry, material);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      this.group.add(m);
      return m;
    };

    // ---- hull: a lofted clinker shell ------------------------------------
    // 22 stations from stem to transom. The width, sheer and keel lines are
    // separate curves, so the hull has a real rocker, a flared bow and a
    // tucked stern instead of being one scaled blob.
    const STATIONS = 22;
    const planW = (t) => {
      if (t < 0.52) return HALF_W * Math.pow(Math.sin((t / 0.52) * Math.PI * 0.5), 0.66);
      const u = (t - 0.52) / 0.48;
      return HALF_W * (1 - 0.13 * u * u);
    };
    const sheerY = (t) => 0.34 + 0.16 * Math.pow(1 - t, 2.0) + 0.02 * Math.sin(t * Math.PI);
    const keelY = (t) => -0.26 - 0.10 * Math.sin(t * Math.PI * 0.92) + 0.15 * Math.pow(1 - t, 3.4);

    /** One skin of the hull (a thin, double sided shell). */
    const hullSkin = (inset, rise, material) => {
      const pos = [];
      const idx = [];
      const rows = STATIONS + 1;
      for (const side of [-1, 1]) {
        const base = pos.length / 3;
        for (let i = 0; i < rows; i++) {
          const t = i / STATIONS;
          const w = Math.max(0.004, planW(t) - inset);
          const k = keelY(t) + rise;
          const s = sheerY(t) + rise;
          const mid = k + (s - k) * 0.46;
          pos.push(side * 0, k, -HALF_LEN + t * HULL_LEN);
          pos.push(side * w * 0.5, k + 0.07, -HALF_LEN + t * HULL_LEN);
          pos.push(side * w * 0.83, mid, -HALF_LEN + t * HULL_LEN);
          pos.push(side * w, s, -HALF_LEN + t * HULL_LEN);
        }
        for (let i = 0; i < STATIONS; i++) {
          for (let j = 0; j < 3; j++) {
            const a = base + i * 4 + j;
            const b = a + 4;
            if (side > 0) idx.push(a, b, b + 1, a, b + 1, a + 1);
            else idx.push(a, b + 1, b, a, a + 1, b + 1);
          }
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, material);
      m.castShadow = true;
      m.receiveShadow = true;
      this.group.add(m);
      this._disposables.push(g);
      return m;
    };
    this.mats.interior = mat(0x6a4f34);
    this.mats.hull.side = THREE.DoubleSide;
    this.mats.interior.side = THREE.DoubleSide;
    this.hull = hullSkin(0, 0, this.mats.hull);
    hullSkin(0.055, 0.05, this.mats.interior);

    // ---- gunwale: a tube following the sheer line, both sides
    const sheerPts = (side) => {
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        pts.push(new THREE.Vector3(side * planW(t), sheerY(t) + 0.01, -HALF_LEN + t * HULL_LEN));
      }
      return pts;
    };
    for (const side of [-1, 1]) {
      const curve = new THREE.CatmullRomCurve3(sheerPts(side));
      const tube = new THREE.Mesh(geo(new THREE.TubeGeometry(curve, 24, 0.042, 5, false)), this.mats.trim);
      tube.castShadow = true;
      this.group.add(tube);
    }

    // ---- interior floor boards + frames
    mesh(geo(new THREE.BoxGeometry(HULL_W * 0.62, 0.035, 2.5)), this.mats.seat, 0, -0.1, 0.15);
    for (const z of [-1.2, -0.6, 0.0, 0.6, 1.2]) {
      const w = planW((z + HALF_LEN) / HULL_LEN) * 1.72;
      mesh(geo(new THREE.BoxGeometry(w, 0.05, 0.09)), this.mats.trim, 0, -0.06, z);
    }

    // ---- thwart seats
    mesh(geo(new THREE.BoxGeometry(HULL_W * 0.62, 0.06, 0.28)), this.mats.seat, 0, 0.24, -0.62);
    mesh(geo(new THREE.BoxGeometry(HULL_W * 0.66, 0.06, 0.28)), this.mats.seat, 0, 0.21, 0.86);
    // ---- bow deck
    mesh(geo(new THREE.BoxGeometry(HULL_W * 0.42, 0.05, 0.62)), this.mats.trim, 0, 0.3, -1.5);
    // ---- keel strip
    mesh(geo(new THREE.BoxGeometry(0.1, 0.09, HULL_LEN * 0.78)), this.mats.copper, 0, -0.3, -0.05);
    // ---- stern transom
    mesh(geo(new THREE.BoxGeometry(HALF_W * 1.72, 0.5, 0.06)), this.mats.trim, 0, 0.1, 1.95);

    // ---- rubbing strakes along the planking (reads as clinker from outside)
    for (const side of [-1, 1]) {
      for (const [y, len, z] of [[-0.02, 3.4, 0.1], [0.14, 3.0, -0.05]]) {
        mesh(geo(new THREE.BoxGeometry(0.03, 0.04, len)), this.mats.copper, side * (HALF_W * 0.97), y, z);
      }
    }

    // ---- oarlocks
    for (const side of [-1, 1]) {
      const pin = mesh(geo(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 6)), this.mats.metal, side * 0.62, 0.34, 0.15);
      pin.rotation.z = 0;
      mesh(geo(new THREE.TorusGeometry(0.055, 0.014, 4, 8)), this.mats.metal, side * 0.62, 0.4, 0.15).rotation.y = Math.PI / 2;
    }

    // ---- cleats (bow + stern, both sides)
    for (const [x, z] of [[-0.34, -1.62], [0.34, -1.62], [-0.36, 1.7], [0.36, 1.7]]) {
      mesh(geo(new THREE.BoxGeometry(0.16, 0.035, 0.045)), this.mats.metal, x, 0.32, z);
      mesh(geo(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 5)), this.mats.metal, x, 0.29, z);
    }

    // ---- bow eye + rope coil
    mesh(geo(new THREE.TorusGeometry(0.07, 0.018, 4, 8)), this.mats.metal, 0, 0.26, -1.9);
    const coil = mesh(geo(new THREE.TorusGeometry(0.16, 0.05, 4, 10)), this.mats.rope, 0, 0.02, -1.3);
    coil.rotation.x = Math.PI / 2;
    mesh(geo(new THREE.TorusGeometry(0.11, 0.05, 4, 10)), this.mats.rope, 0, 0.06, -1.3).rotation.x = Math.PI / 2;

    // ---- bucket + net bundle under the stern thwart
    const bucket = mesh(geo(new THREE.CylinderGeometry(0.15, 0.12, 0.26, 8, 1, true)), this.mats.bucket, 0.28, 0.06, 1.15);
    bucket.material.side = THREE.DoubleSide;
    mesh(geo(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 8)), this.mats.bucket, 0.28, -0.06, 1.15);
    const net = mesh(geo(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 7)), this.mats.net, -0.3, 0.04, 1.18);
    net.rotation.z = Math.PI / 2;
    net.rotation.y = 0.5;

    // ---- oars (animated)
    this.oars = [];
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * HULL_W * 0.42, 0.32, 0.15);
      this.group.add(pivot);
      const shaft = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.042, 0.048, 2.5, 6)), this.mats.oar);
      shaft.castShadow = true;
      shaft.position.set(side * 0.9, 0, -0.2);
      shaft.rotation.z = Math.PI / 2 - side * 0.18;
      pivot.add(shaft);
      const blade = new THREE.Mesh(geo(new THREE.BoxGeometry(0.34, 0.02, 0.7)), this.mats.oar);
      blade.position.set(side * 1.95, 0, -0.2);
      pivot.add(blade);
      this.oars.push({ pivot, side });
    }

    // ---- shipped oars: two poles lying along the gunwales, always there
    for (const side of [-1, 1]) {
      const shaft = mesh(geo(new THREE.CylinderGeometry(0.04, 0.045, 2.3, 6)), this.mats.oar, side * 0.3, 0.285, 0.05);
      shaft.rotation.x = Math.PI / 2;
      shaft.rotation.z = side * 0.02;
      const blade = mesh(geo(new THREE.BoxGeometry(0.3, 0.02, 0.62)), this.mats.oar, side * 0.3, 0.285, -1.35);
      blade.rotation.x = Math.PI / 2;
    }

    // ---- lantern on a short mast
    mesh(geo(new THREE.CylinderGeometry(0.045, 0.055, 1.5, 6)), this.mats.trim, 0, 0.42, 1.62);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffcf8a });
    this._disposables.push(lampMat);
    this.lampMat = lampMat;
    this.lamp = mesh(geo(new THREE.SphereGeometry(0.12, 8, 6)), lampMat, 0, 1.16, 1.62);
    this.lampLight = new THREE.PointLight(0xffc27a, 0, 14, 2);
    this.lampLight.position.set(0, 1.2, 1.62);
    this.group.add(this.lampLight);

    // ---- mooring rope loop
    mesh(geo(new THREE.TorusGeometry(0.1, 0.022, 4, 8)), this.mats.rope, 0, 0.5, -2.05);

    // ---- wake: a V of foam planes + a churn pad behind the transom
    const wakeMat = new THREE.MeshBasicMaterial({
      color: 0xeaf6ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this._disposables.push(wakeMat);
    this.wakeMat = wakeMat;
    this.wake = new THREE.Group();
    this.wake.position.set(0, 0.02, 2.02);
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(geo(new THREE.PlaneGeometry(0.5, 3.6)), wakeMat);
      arm.rotation.x = -Math.PI / 2;
      arm.rotation.z = side * 0.28;
      arm.position.set(side * 0.5, 0, 1.5);
      this.wake.add(arm);
    }
    const churn = new THREE.Mesh(geo(new THREE.PlaneGeometry(1.1, 1.2)), wakeMat);
    churn.rotation.x = -Math.PI / 2;
    churn.position.set(0, 0, 0.1);
    this.wake.add(churn);
    this.group.add(this.wake);
  }

  /* ------------------------------------------------------------------ *
   * Geometry helpers
   * ------------------------------------------------------------------ */

  /** Seat position in world space (where the angler sits). */
  seatPosition(out = new THREE.Vector3()) {
    return out.set(0, -0.06, 0.2).applyAxisAngle(Y_AXIS, this.angle).add(this.position);
  }

  /** local (x,z) -> world x */
  _wx(x, z) {
    return this.position.x + x * Math.cos(this.angle) + z * Math.sin(this.angle);
  }

  /** local (x,z) -> world z */
  _wz(x, z) {
    return this.position.z - x * Math.sin(this.angle) + z * Math.cos(this.angle);
  }

  distanceTo(p) {
    return Math.hypot(p.x - this.position.x, p.z - this.position.z);
  }

  canBoard(p) {
    return !this.aboard && this.distanceTo(p) < 4.6 && this.world.depthAt(p.x, p.z) < 2.6;
  }

  /** Move the boat to open water at (x,z) — used by the "call boat" key. */
  placeAt(x, z, angle = this.angle) {
    this.position.set(x, WATER_LEVEL, z);
    this.velocity.set(0, 0, 0);
    this.vy = 0;
    this.angularVel = 0;
    this.pitch = this.roll = this.pitchVel = this.rollVel = 0;
    this.angle = angle;
    this.hullIntegrity = 1;
    this.aground = false;
    this._snapToWater();
    this._floatPoseTo(0);
  }

  board(player) {
    if (this.aboard) return false;
    // never let two hulls claim the same angler
    if (player.mounted && player.mounted !== this) {
      player.mounted.aboard = false;
      player.mounted = null;
    }
    this.aboard = true;
    player.mounted = this;
    player.canMove = false;
    player.velocity.set(0, 0, 0);
    player.angler.setPose('sit');
    player.bodyYaw = this.angle + Math.PI;
    this.emit('board', { boat: this });
    return true;
  }

  disembark(player) {
    if (!this.aboard) return false;
    // step out onto the nearest dry land
    const land = this.world.terrain.findLand(this.position.x, this.position.z, 14);
    if (Math.hypot(land.x - this.position.x, land.z - this.position.z) > 12) return false;
    player.teleport(land.x, land.z);
    player.mounted = null;
    player.canMove = true;
    player.bodyYaw = player.yaw;
    player.angler.setPose('idle');
    this.aboard = false;
    this.velocity.multiplyScalar(0.2);
    // beaching is how you patch a holed hull: a little wood and luck
    this.repair(this.aground ? 0.4 : 0.15);
    this.emit('disembark', { boat: this });
    return true;
  }

  _snapToWater() {
    const s = this.world.surfaceHeight(this.position.x, this.position.z);
    this.position.y = s + 0.16;
    this.vy = 0;
  }

  /* ------------------------------------------------------------------ *
   * Water sampling
   * ------------------------------------------------------------------ */

  /**
   * Sample the water under the hull. Returns the target heave height and the
   * wave-driven pitch/roll angles (radians, small).
   */
  _waterPose() {
    const w = this.world;
    let sum = 0;
    let bow = 0;
    let stern = 0;
    let port = 0;
    let star = 0;
    let nB = 0;
    let nS = 0;
    let nP = 0;
    let nR = 0;
    for (const p of BUOY_POINTS) {
      const h = w.surfaceHeight(this._wx(p.x, p.z), this._wz(p.x, p.z));
      sum += h;
      if (p.z < -0.6) {
        bow += h;
        nB++;
      } else if (p.z > 0.6) {
        stern += h;
        nS++;
      }
      if (p.x < 0) {
        port += h;
        nP++;
      } else {
        star += h;
        nR++;
      }
    }
    bow /= nB || 1;
    stern /= nS || 1;
    port /= nP || 1;
    star /= nR || 1;
    return {
      y: sum / BUOY_POINTS.length + 0.16,
      pitch: Math.atan2(bow - stern, 2.9) * 0.9,
      roll: Math.atan2(star - port, 1.15) * 0.9,
    };
  }

  /** Snap the visual pose (used on spawn / teleport so it does not jump). */
  _floatPoseTo() {
    const pose = this._waterPose();
    this.position.y = pose.y;
    this.pitch = pose.pitch;
    this.roll = pose.roll;
    this.group.position.copy(this.position);
    this.group.rotation.set(this.pitch, this.angle, this.roll, 'YXZ');
  }

  /* ------------------------------------------------------------------ *
   * Damage
   * ------------------------------------------------------------------ */

  /** Take a hit. Returns true when the hull was breached for the first time. */
  damage(amount, kind = 'bump') {
    if (amount <= 0) return false;
    const was = this.hullIntegrity;
    this.hullIntegrity = clamp01(this.hullIntegrity - amount);
    if (was > 0.34 && this.hullIntegrity <= 0.34) {
      this.emit('breach', { boat: this, kind });
      return true;
    }
    return false;
  }

  /** Beach / dock repair. */
  repair(amount = 0.25) {
    this.hullIntegrity = clamp01(this.hullIntegrity + amount);
  }

  /* ------------------------------------------------------------------ *
   * Per-frame update
   * ------------------------------------------------------------------ */

  update(dt, input, player, env) {
    dt = Math.min(dt, 0.1);
    this._time += dt;
    this._impactCd = Math.max(0, this._impactCd - dt);
    this._strokeCd = Math.max(0, this._strokeCd - dt);
    this._groundCd = Math.max(0, this._groundCd - dt);
    const riding = this.aboard;

    /* ---- input -> throttle / steer */
    let throttle = 0;
    let steer = 0;
    let sprint = false;
    let brake = false;
    if (riding && player?.canRow !== false) {
      const mv = input.moveVector();
      throttle = mv.z;
      steer = mv.x;
      sprint = input.action('sprint');
      brake = input.action('jump');
    }

    /* ---- axes */
    const c = Math.cos(this.angle);
    const s = Math.sin(this.angle);
    const fx = -s;
    const fz = -c;
    const rx = c;
    const rz = -s;

    /* ---- water state under the hull */
    const depth = this.world.depthAt(this.position.x, this.position.z);
    this.depth = depth;
    const openWater = depth > 8;
    const shallow = clamp01(1 - depth / 1.2);
    const breached = this.hullIntegrity < 0.34 ? 0.55 : 0;

    /* ---- longitudinal / lateral velocity split (keel model) */
    let vF = this.velocity.x * fx + this.velocity.z * fz;
    let vR = this.velocity.x * rx + this.velocity.z * rz;

    /* ---- oar stroke drives a periodic surge, so the boat surges with the rowing */
    const rowActive = Math.abs(throttle) > 0.02 || vF > 0.25;
    this.strokePhase += dt * (1.9 + Math.abs(vF) * 1.3);
    const surge = rowActive ? 0.78 + 0.22 * Math.sin(this.strokePhase * 2) : 1;

    const power = (openWater ? 4.35 : 3.55) * (1 - breached * 0.5);
    if (throttle > 0.02) {
      vF += power * surge * (sprint ? 1.32 : 1) * throttle * dt;
    } else if (throttle < -0.02) {
      vF += 1.65 * throttle * dt; // back-water to slow / reverse
    }

    /* ---- drag: linear + quadratic, planing cuts longitudinal drag */
    const planing = clamp01((Math.abs(vF) - 2.5) / 2.0);
    this.planing = planing;
    const dragF = (0.46 + 0.052 * Math.abs(vF)) * (1 - planing * 0.42) * (1 + shallow * 1.1 + breached * 0.5);
    vF -= vF * dragF * dt;
    // lateral grip: the keel resists sideways slip far harder than forward
    const dragR = (3.1 + 1.1 * Math.abs(vR)) * (1 + shallow * 1.2);
    vR -= vR * dragR * dt;

    /* ---- brake / anchor (Space) */
    if (brake) {
      const k = Math.exp(-4.2 * dt);
      vF *= k;
      vR *= k;
    }

    /* ---- steering: authority from speed, the stern walks out under power */
    const speedAbs = Math.abs(vF);
    const auth = 0.55 + 1.05 * clamp01(speedAbs / 3.2);
    const dir = vF < -0.05 ? -1 : 1;
    this.angularVel += steer * auth * dir * 1.55 * dt;
    this.angularVel *= Math.exp(-2.15 * dt);
    this.angularVel = clamp(this.angularVel, -1.35, 1.35);
    this.angle = wrapAngle(this.angle + this.angularVel * dt);

    /* ---- recompose world velocity */
    this.velocity.x = fx * vF + rx * vR;
    this.velocity.z = fz * vF + rz * vR;
    this.speed = Math.hypot(this.velocity.x, this.velocity.z);

    /* ---- integrate + collide */
    const px = this.position.x + this.velocity.x * dt;
    const pz = this.position.z + this.velocity.z * dt;
    const lim = this.world.terrain.half - 6;
    let nx = px;
    let nz = pz;
    if (Math.abs(nx) > lim) nx = Math.sign(nx) * lim;
    if (Math.abs(nz) > lim) nz = Math.sign(nz) * lim;
    this.position.x = nx;
    this.position.z = nz;

    const impact = this._resolveCollisions(dt);
    if (impact > 0) {
      const sp = this.speed;
      if (impact > 0.55 && this._impactCd <= 0) {
        this._impactCd = 0.32;
        this.damage(impact * 0.012, 'collide');
        player?.addShake?.(clamp01(impact / 5) * 0.14);
        this.emit('impact', { boat: this, speed: sp, force: impact });
      }
    }

    /* ---- shallow water: wallowing drag + run aground */
    const centreDepth = this.world.depthAt(this.position.x, this.position.z);
    this.aground = centreDepth <= 0.5;
    if (this.aground) {
      this.velocity.multiplyScalar(0.55);
      if (this.speed > 0.9 && this._groundCd <= 0) {
        this._groundCd = 0.5;
        this.damage(this.speed * 0.004, 'ground');
        player?.addShake?.(clamp01(this.speed / 4) * 0.1);
        this.emit('grounding', { boat: this, speed: this.speed });
      }
    }

    /* ---- buoyancy: heave spring + pitch/roll springs */
    const pose = this._waterPose();
    this.vy += ((pose.y - this.position.y) * 22 - this.vy * 6.0) * dt;
    this.position.y += this.vy * dt;

    const squat = clamp(-vF * 0.014, -0.1, 0.06);
    const targetPitch = pose.pitch + squat;
    this.pitchVel += ((targetPitch - this.pitch) * 26 - this.pitchVel * 6.2) * dt;
    this.pitch += this.pitchVel * dt;

    const heel = clamp(-this.angularVel * Math.abs(vF) * 0.06, -0.17, 0.17);
    const targetRoll = pose.roll + heel;
    this.rollVel += ((targetRoll - this.roll) * 24 - this.rollVel * 5.6) * dt;
    this.roll += this.rollVel * dt;

    this.group.position.copy(this.position);
    this.group.rotation.set(this.pitch, this.angle, this.roll, 'YXZ');

    /* ---- oars */
    const targetRow = rowActive ? 1 : 0;
    this.rowing = damp(this.rowing, targetRow, 4, dt);
    for (const oar of this.oars) {
      const swing = Math.sin(this.strokePhase) * 0.5 * this.rowing;
      const dip = Math.cos(this.strokePhase) * 0.22 * this.rowing;
      // Oars only exist at the oarlocks while you are pulling. Shipped, they
      // are stowed as two static poles inside the hull (built above) — the
      // animated pair simply disappears so it can never float beside the boat.
      oar.pivot.visible = this.rowing > 0.04;
      oar.pivot.rotation.z = -oar.side * (0.24 + dip);
      oar.pivot.rotation.x = swing * oar.side;
      oar.pivot.rotation.y = 0;
    }
    if (riding && this.rowing > 0.5 && Math.abs(Math.sin(this.strokePhase)) < 0.06 && this._strokeCd <= 0) {
      this._strokeCd = 0.5;
      this.emit('stroke', { speed: this.speed });
    }

    /* ---- wake */
    const wakeTarget = clamp01((this.speed - 0.5) / 3.4) * (this.aground ? 0.25 : 1);
    this._wake = damp(this._wake, wakeTarget, 3.5, dt);
    this.wakeMat.opacity = this._wake * 0.42;
    const wscale = 0.6 + this._wake * 1.5;
    this.wake.scale.set(wscale, 1, 0.55 + this._wake * 1.4);
    this.wake.visible = this._wake > 0.03;

    /* ---- lantern at night */
    const night = env?.night ?? 0;
    const lit = night > 0.2;
    this.lampLight.intensity = damp(this.lampLight.intensity, lit ? 1.6 : 0, 3, dt) * (1 + Math.sin(this._time * 7) * 0.05);
    this.lampMat.color.setHex(lit ? 0xffd79a : 0x8a7a5a);

    /* ---- carry the angler (camera stays free, only the body turns) */
    if (riding && player) {
      const seat = this.seatPosition(this._tmpA);
      player.position.set(seat.x, seat.y - 0.72, seat.z);
      player.bodyYaw = this.angle + Math.PI;
      player.velocity.set(0, 0, 0);
      player.grounded = true;
      player.swimming = false;
      player.submerged = false;
      player.speed = this.speed;
      player.boatPitch = this.pitch;
      player.boatRoll = this.roll;
    }
    return this;
  }

  /**
   * Resolve the three hull circles against terrain, props and other boats.
   * Returns the largest normal impulse applied this frame (0 = no contact).
   */
  _resolveCollisions(dt) {
    const w = this.world;
    let maxImpulse = 0;
    const props = w.props;
    const others = w.boats?.boats || [];
    const cosA = Math.cos(this.angle);
    const sinA = Math.sin(this.angle);

    for (const c of HULL_CIRCLES) {
      // local -> world for this circle
      const cx = this.position.x + c.z * sinA;
      const cz = this.position.z + c.z * cosA;

      /* ---- terrain: the depth gradient points toward deeper water */
      const d = w.depthAt(cx, cz);
      const contact = c.r * 0.82;
      if (d < contact) {
        const e = 0.8;
        let gx = w.depthAt(cx + e, cz) - w.depthAt(cx - e, cz);
        let gz = w.depthAt(cx, cz + e) - w.depthAt(cx, cz - e);
        let gl = Math.hypot(gx, gz);
        if (gl < 1e-4) {
          gx = -this.velocity.x;
          gz = -this.velocity.z;
          gl = Math.hypot(gx, gz);
          if (gl < 1e-4) {
            gx = -Math.sin(this.angle);
            gz = -Math.cos(this.angle);
            gl = 1;
          }
        }
        gx /= gl;
        gz /= gl;
        const pen = contact - d;
        this.position.x += gx * pen * 0.55;
        this.position.z += gz * pen * 0.55;
        const vn = this.velocity.x * gx + this.velocity.z * gz;
        if (vn < 0) {
          const imp = -vn * 1.35;
          this.velocity.x += gx * imp;
          this.velocity.z += gz * imp;
          maxImpulse = Math.max(maxImpulse, -vn);
        }
      }

      /* ---- props (docks, crates, tents...) */
      if (props?.colliders) {
        for (const col of props.colliders) {
          let nx2 = 0;
          let nz2 = 0;
          let pen = 0;
          if (col.type === 'circle') {
            const dx = cx - col.x;
            const dz = cz - col.z;
            const dd = Math.hypot(dx, dz);
            const min = col.r + c.r;
            if (dd < min && dd > 1e-4) {
              nx2 = dx / dd;
              nz2 = dz / dd;
              pen = min - dd;
            }
          } else if (col.type === 'box') {
            const cc = Math.cos(-col.yaw);
            const ss = Math.sin(-col.yaw);
            const dx = cx - col.x;
            const dz = cz - col.z;
            const lx = dx * cc - dz * ss;
            const lz = dx * ss + dz * cc;
            const hw = col.hw + c.r;
            const hd = col.hd + c.r;
            if (Math.abs(lx) < hw && Math.abs(lz) < hd) {
              const ox = hw - Math.abs(lx);
              const oz = hd - Math.abs(lz);
              let nlx = 0;
              let nlz = 0;
              if (ox < oz) nlx = Math.sign(lx || 1) * ox;
              else nlz = Math.sign(lz || 1) * oz;
              const c2 = Math.cos(col.yaw);
              const s2 = Math.sin(col.yaw);
              nx2 = nlx * c2 - nlz * s2;
              nz2 = nlx * s2 + nlz * c2;
              pen = Math.hypot(nx2, nz2);
              const nl = pen || 1;
              nx2 /= nl;
              nz2 /= nl;
            }
          }
          if (pen > 0) {
            this.position.x += nx2 * pen * 0.7;
            this.position.z += nz2 * pen * 0.7;
            const vn = this.velocity.x * nx2 + this.velocity.z * nz2;
            if (vn < 0) {
              const imp = -vn * 1.25;
              this.velocity.x += nx2 * imp;
              this.velocity.z += nz2 * imp;
              this.angularVel -= (vx2(c.z, nx2, nz2, cosA, sinA) * -vn) * 0.08;
              maxImpulse = Math.max(maxImpulse, -vn);
            }
          }
        }
      }

      /* ---- other boats */
      for (const other of others) {
        if (other === this) continue;
        const oc = Math.cos(other.angle);
        const os = Math.sin(other.angle);
        for (const ocir of HULL_CIRCLES) {
          const ox = other.position.x + ocir.z * os;
          const oz = other.position.z + ocir.z * oc;
          const dx = cx - ox;
          const dz = cz - oz;
          const dd = Math.hypot(dx, dz);
          const min = c.r + ocir.r;
          if (dd < min && dd > 1e-4) {
            const nx2 = dx / dd;
            const nz2 = dz / dd;
            const pen = (min - dd) * 0.5;
            this.position.x += nx2 * pen;
            this.position.z += nz2 * pen;
            other.position.x -= nx2 * pen;
            other.position.z -= nz2 * pen;
            const rel = (this.velocity.x - other.velocity.x) * nx2 + (this.velocity.z - other.velocity.z) * nz2;
            if (rel < 0) {
              const imp = -rel * 0.55;
              this.velocity.x += nx2 * imp;
              this.velocity.z += nz2 * imp;
              other.velocity.x -= nx2 * imp;
              other.velocity.z -= nz2 * imp;
              maxImpulse = Math.max(maxImpulse, -rel);
            }
          }
        }
      }
    }
    return maxImpulse;
  }

  serialize() {
    return {
      id: this.id,
      x: this.position.x,
      z: this.position.z,
      angle: this.angle,
      hull: this.hullIntegrity,
    };
  }

  restore(data) {
    if (!data) return;
    if (Number.isFinite(data.x)) this.position.x = data.x;
    if (Number.isFinite(data.z)) this.position.z = data.z;
    if (Number.isFinite(data.angle)) this.angle = data.angle;
    if (Number.isFinite(data.hull)) this.hullIntegrity = clamp01(data.hull);
    this.angularVel = 0;
    this.velocity.set(0, 0, 0);
    this.vy = 0;
    this._snapToWater();
  }

  dispose() {
    this.world.engine.worldGroup.remove(this.group);
    for (const d of this._disposables) d.dispose?.();
    this._disposables.length = 0;
    this.group.clear();
    this.clear();
  }
}

const Y_AXIS = new THREE.Vector3(0, 1, 0);

/** signed lever arm of a contact normal around the hull axis */
function vx2(z, nx, nz, cosA, sinA) {
  // lever arm = local z of contact x lateral component of the normal
  const rightX = cosA;
  const rightZ = -sinA;
  return z * (nx * rightX + nz * rightZ);
}

/** Owns every boat in the world and handles boarding prompts. */
export class BoatManager {
  constructor(world, spots) {
    this.world = world;
    this.boats = [];
    const moorings = [
      { id: 'lake', spot: spots.find((s) => s.id === 'lake_dock') },
      { id: 'pond', spot: spots.find((s) => s.id === 'pond_frog') },
      { id: 'estuary', spot: spots.find((s) => s.id === 'estuary') },
    ].filter((m) => m.spot);

    for (const m of moorings || []) {
      const s = m.spot;
      // The dock extends along its local -Z, i.e. world (-sin, -cos) of its angle.
      const dirX = -Math.sin(s.dockAngle);
      const dirZ = -Math.cos(s.dockAngle);
      let bx = s.x + dirX * (s.dockLength + 2.2);
      let bz = s.z + dirZ * (s.dockLength + 2.2);
      if (!world.isWater(bx, bz) || world.depthAt(bx, bz) < 1.2) {
        // walk out from the shore until there is enough water under the hull
        let fixed = false;
        for (let d = 2; d <= 40 && !fixed; d += 2) {
          const px = s.x + dirX * (s.dockLength + 2.2 + d);
          const pz = s.z + dirZ * (s.dockLength + 2.2 + d);
          if (world.depthAt(px, pz) >= 1.2) {
            bx = px;
            bz = pz;
            fixed = true;
          }
        }
        if (!fixed) {
          const alt = world.terrain.findLand(bx, bz, 20);
          const vx = bx - alt.x;
          const vz = bz - alt.z;
          const l = Math.hypot(vx, vz) || 1;
          bx = alt.x + (vx / l) * 9;
          bz = alt.z + (vz / l) * 9;
        }
      }
      const boat = new Boat(world, { id: m.id, x: bx, z: bz, angle: Math.random() * TAU });
      this.boats.push(boat);
    }
  }

  get mounted() {
    return this.boats.find((b) => b.aboard) || null;
  }

  nearest(pos, maxDist = 4.6) {
    let best = null;
    let bestD = maxDist;
    for (const b of this.boats) {
      const d = b.distanceTo(pos);
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    }
    return best;
  }

  /** Reverse-lookup by id (charter / summoned hulls). */
  byId(id) {
    return this.boats.find((b) => b.id === id) || null;
  }

  update(dt, input, player, env) {
    for (const b of this.boats) b.update(dt, input, player, env);
  }

  /** Board the nearest boat, or step off the one we are in. */
  toggle(player) {
    const current = this.mounted;
    if (current) return current.disembark(player);
    const b = this.nearest(player.position, 4.6);
    if (b) return b.board(player);
    return false;
  }

  serialize() {
    return this.boats.map((b) => b.serialize());
  }

  restore(list) {
    if (!Array.isArray(list)) return;
    for (const data of list) {
      const b = this.boats.find((x) => x.id === data.id) || this.boats[0];
      b?.restore(data);
    }
  }

  dispose() {
    for (const b of this.boats) b.dispose();
    this.boats.length = 0;
  }
}
