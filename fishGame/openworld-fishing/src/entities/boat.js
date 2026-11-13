/**
 * boat.js — a boardable rowboat.
 *
 * v1.2.0. Rowing is momentum based: W/S apply thrust along the hull axis, A/D
 * steer with an angular velocity, and water drag bleeds both off. The hull
 * floats on the same CPU wave field as the visual water (sampled at four
 * points, so it pitches and rolls with the swell) and runs aground when the
 * water gets too shallow. While aboard, the angler's controls are routed to
 * the boat, and fishing works exactly as it does from shore.
 */
import * as THREE from 'three';
import { clamp, clamp01, damp, lerp, rand, TAU, wrapAngle, Emitter } from '../core/util.js';
import { WATER_LEVEL } from '../world/terrain.js';

const HULL_LEN = 4.2;
const HULL_W = 1.5;

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
    this.group = new THREE.Group();
    this.group.name = `boat-${this.id}`;
    this._disposables = [];
    this._time = 0;
    this._tmpA = new THREE.Vector3();
    this._tmpB = new THREE.Vector3();

    this._build();
    this.world.engine.worldGroup.add(this.group);
    this._snapToWater();
  }

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
      hull: mat(0x8a6a44),
      trim: mat(0x5f472c),
      seat: mat(0xa8865c),
      oar: mat(0xb08a52),
      metal: mat(0x9aa4ad, false),
      rope: mat(0xb9a882),
    };

    const mesh = (geometry, material, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(geometry, material);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      this.group.add(m);
      return m;
    };

    // ---- hull: a scaled capsule gives a rounded bow/stern with a keel line
    const hull = mesh(geo(new THREE.CapsuleGeometry(HULL_W * 0.52, HULL_LEN * 0.52, 5, 10)), this.mats.hull, 0, 0.18, 0);
    hull.rotation.z = Math.PI / 2;
    hull.scale.set(0.52, 0.66, 0.5);
    this.hull = hull;

    // ---- gunwale (rim)
    const rim = mesh(geo(new THREE.TorusGeometry(HULL_LEN * 0.42, 0.075, 5, 16)), this.mats.trim, 0, 0.46, 0);
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(1, 1, HULL_W / (HULL_LEN * 0.42) * 0.46);
    // ---- thwart seats
    mesh(geo(new THREE.BoxGeometry(HULL_W * 0.72, 0.08, 0.3)), this.mats.seat, 0, 0.42, -0.85);
    mesh(geo(new THREE.BoxGeometry(HULL_W * 0.72, 0.08, 0.3)), this.mats.seat, 0, 0.42, 0.85);
    // ---- bow deck
    mesh(geo(new THREE.BoxGeometry(HULL_W * 0.6, 0.06, 0.5)), this.mats.trim, 0, 0.44, -1.65);
    // ---- keel strip
    mesh(geo(new THREE.BoxGeometry(0.12, 0.08, HULL_LEN * 0.8)), this.mats.trim, 0, 0.02, 0);

    // ---- oars (animated)
    this.oars = [];
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * HULL_W * 0.45, 0.5, 0.15);
      this.group.add(pivot);
      const shaft = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.045, 0.05, 3.0, 6)), this.mats.oar);
      shaft.castShadow = true;
      shaft.position.set(side * 0.9, 0, -0.2);
      shaft.rotation.z = Math.PI / 2 - side * 0.18;
      pivot.add(shaft);
      const blade = new THREE.Mesh(geo(new THREE.BoxGeometry(0.34, 0.02, 0.7)), this.mats.oar);
      blade.position.set(side * 2.35, 0, -0.2);
      pivot.add(blade);
      this.oars.push({ pivot, side });
    }

    // ---- lantern on a short mast
    const mast = mesh(geo(new THREE.CylinderGeometry(0.045, 0.055, 1.5, 6)), this.mats.trim, 0, 0.75, 1.5);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffcf8a });
    this._disposables.push(lampMat);
    this.lampMat = lampMat;
    this.lamp = mesh(geo(new THREE.SphereGeometry(0.12, 8, 6)), lampMat, 0, 1.45, 1.5);
    this.lampLight = new THREE.PointLight(0xffc27a, 0, 14, 2);
    this.lampLight.position.set(0, 1.5, 1.5);
    this.group.add(this.lampLight);

    // ---- mooring rope loop
    mesh(geo(new THREE.TorusGeometry(0.1, 0.022, 4, 8)), this.mats.rope, 0, 0.5, -2.05);
  }

  /** Seat position in world space (where the angler sits). */
  seatPosition(out = new THREE.Vector3()) {
    return out.set(0, 0.5, 0.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.angle).add(this.position);
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
    this.angularVel = 0;
    this.angle = angle;
    this._snapToWater();
    this._floatPose();
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
    player.angler.setPose('idle');
    this.aboard = false;
    this.velocity.multiplyScalar(0.2);
    this.emit('disembark', { boat: this });
    return true;
  }

  _snapToWater() {
    const s = this.world.surfaceHeight(this.position.x, this.position.z);
    this.position.y = s + 0.16;
  }

  /** Sample the surface at four points to get pitch/roll. */
  _floatPose() {
    const w = this.world;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    const fwdX = -sin;
    const fwdZ = -cos;
    const rightX = cos;
    const rightZ = -sin;
    const halfL = HULL_LEN * 0.42;
    const halfW = HULL_W * 0.55;
    const hBow = w.surfaceHeight(this.position.x + fwdX * halfL, this.position.z + fwdZ * halfL);
    const hStern = w.surfaceHeight(this.position.x - fwdX * halfL, this.position.z - fwdZ * halfL);
    const hLeft = w.surfaceHeight(this.position.x - rightX * halfW, this.position.z - rightZ * halfW);
    const hRight = w.surfaceHeight(this.position.x + rightX * halfW, this.position.z + rightZ * halfW);
    const mid = (hBow + hStern + hLeft + hRight) / 4;
    return {
      y: mid + 0.16,
      pitch: Math.atan2(hBow - hStern, HULL_LEN * 0.84) * 0.85,
      roll: Math.atan2(hRight - hLeft, HULL_W * 1.1) * 0.85,
    };
  }

  update(dt, input, player, env) {
    this._time += dt;
    const riding = this.aboard;

    // ---- input -> thrust / steer
    let thrust = 0;
    let steer = 0;
    if (riding && player?.canRow !== false) {
      const mv = input.moveVector();
      thrust = mv.z;
      steer = mv.x;
      if (input.action('sprint')) thrust *= 1.35;
    }

    // ---- hull dynamics
    const drag = riding ? 1.35 : 2.2;
    // Open water gives you room to really pull: faster top speed offshore so a
    // trip to the deep marks does not take five minutes (v3.3.0).
    const openWater = this.world.depthAt(this.position.x, this.position.z) > 8;
    const maxSpeed = openWater ? 4.6 : 3.4;
    const accel = 2.6;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    const fwdX = -sin;
    const fwdZ = -cos;
    this.velocity.x += fwdX * thrust * accel * dt;
    this.velocity.z += fwdZ * thrust * accel * dt;

    // drag
    const damp2 = Math.exp(-drag * dt);
    this.velocity.x *= damp2;
    this.velocity.z *= damp2;
    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > maxSpeed) {
      this.velocity.x *= maxSpeed / speed;
      this.velocity.z *= maxSpeed / speed;
    }

    // steering scales with speed (you need way to turn)
    const steerAuthority = 1.5 * (0.35 + clamp01(speed / 2.2));
    this.angularVel += steer * steerAuthority * 0.9 * dt;
    this.angularVel *= Math.exp(-2.6 * dt);
    this.angularVel = clamp(this.angularVel, -1.1, 1.1);
    if (!riding) this.angularVel = damp(this.angularVel, 0, 1.4, dt);
    this.angle = wrapAngle(this.angle + this.angularVel * dt);

    // ---- integrate position with a shallow-water check
    const nx = this.position.x + this.velocity.x * dt;
    const nz = this.position.z + this.velocity.z * dt;
    const probeDepth = this.world.depthAt(nx, nz);
    const lim = this.world.terrain.half - 6;
    if (probeDepth > 0.55 && Math.abs(nx) < lim && Math.abs(nz) < lim) {
      this.position.x = nx;
      this.position.z = nz;
      this.aground = false;
    } else {
      // run aground: kill most of the momentum
      this.aground = probeDepth <= 0.55;
      this.velocity.multiplyScalar(0.35);
      if (this.aground && speed > 1.2) this.emit('grounding', { speed });
    }

    // ---- float
    const pose = this._floatPose();
    this.position.y = damp(this.position.y, pose.y, 8, dt);
    this.group.position.copy(this.position);
    this.group.rotation.set(pose.pitch, this.angle, pose.roll, 'YXZ');

    // ---- oars
    const targetRow = Math.abs(thrust) > 0.05 || speed > 0.3 ? 1 : 0;
    this.rowing = damp(this.rowing, targetRow, 4, dt);
    this.strokePhase += dt * (2.2 + speed * 1.6);
    for (const oar of this.oars) {
      const swing = Math.sin(this.strokePhase) * 0.5 * this.rowing;
      const dip = Math.cos(this.strokePhase) * 0.22 * this.rowing;
      oar.pivot.rotation.z = -oar.side * (0.24 + dip);
      oar.pivot.rotation.x = swing * oar.side;
    }
    if (riding && this.rowing > 0.5 && Math.abs(Math.sin(this.strokePhase)) < 0.06) {
      this.emit('stroke', { speed });
    }

    // ---- lantern at night
    const night = env?.night ?? 0;
    const lit = night > 0.2;
    this.lampLight.intensity = damp(this.lampLight.intensity, lit ? 1.6 : 0, 3, dt) * (1 + Math.sin(this._time * 7) * 0.05);
    this.lampMat.color.setHex(lit ? 0xffd79a : 0x8a7a5a);

    // ---- carry the angler
    if (riding && player) {
      const seat = this.seatPosition(this._tmpA);
      player.position.set(seat.x, seat.y - 0.72, seat.z);
      player.yaw = this.angle + Math.PI;
      player.velocity.set(0, 0, 0);
      player.grounded = true;
      player.swimming = false;
      player.submerged = false;
      player.speed = speed;
    }
    return this;
  }

  serialize() {
    return { id: this.id, x: this.position.x, z: this.position.z, angle: this.angle };
  }

  restore(data) {
    if (!data) return;
    if (Number.isFinite(data.x)) this.position.x = data.x;
    if (Number.isFinite(data.z)) this.position.z = data.z;
    if (Number.isFinite(data.angle)) this.angle = data.angle;
    this.angularVel = 0;
    this.velocity.set(0, 0, 0);
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

/** Owns every boat in the world and handles boarding prompts. */
export class BoatManager {
  constructor(world, spots) {
    this.world = world;
    this.boats = [];
    const dockSpots = spots.filter((s) => s.dock);
    const moorings = [
      { id: 'lake', spot: spots.find((s) => s.id === 'lake_dock') },
      { id: 'pond', spot: spots.find((s) => s.id === 'pond_frog') },
      { id: 'estuary', spot: spots.find((s) => s.id === 'estuary') },
    ].filter((m) => m.spot);

    for (const m of moorings || []) {
      const s = m.spot;
      // float the boat just off the dock, in water
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
