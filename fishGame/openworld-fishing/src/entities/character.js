/**
 * character.js — the low-poly angler used in third-person view.
 *
 * The rig is a small hierarchy of primitives animated procedurally: a walk
 * cycle driven by speed, an idle breathing loop, and fishing poses (hold,
 * cast back, cast forward, strike, reel) blended by weight. No skeletal
 * animation data or external assets are involved.
 */
import * as THREE from 'three';
import { clamp, clamp01, damp, lerp, TAU } from '../core/util.js';

const SKIN = 0xd9a97c;
const JACKET = 0x3f6d5a;
const JACKET_DARK = 0x2d4f41;
const PANTS = 0x4a4f5c;
const BOOTS = 0x3a2f26;
const HAT = 0xb98a4b;
const PACK = 0x7a5a38;
const ROD = 0x2b2b2b;

export class Angler {
  constructor(opts = {}) {
    this.root = new THREE.Group();
    this.root.name = 'angler';
    this.parts = [];
    this._disposables = [];
    this._phase = 0;
    this._time = 0;
    this._speed = 0;
    this._pose = 'idle';
    this._poseBlend = 0;
    this._castT = -1;
    this._reelT = 0;
    this._strikeT = -1;
    this._lean = 0;

    const mat = (color, flat = true) => {
      const m = new THREE.MeshLambertMaterial({ color, flatShading: flat });
      this._disposables.push(m);
      return m;
    };
    const geo = (g) => {
      this._disposables.push(g);
      return g;
    };

    this.mats = {
      skin: mat(SKIN),
      jacket: mat(JACKET),
      jacketDark: mat(JACKET_DARK),
      pants: mat(PANTS),
      boots: mat(BOOTS),
      hat: mat(HAT),
      pack: mat(PACK),
      rod: mat(ROD, false),
      metal: mat(0x9aa4ad, false),
    };

    const mesh = (geometry, material, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(geometry, material);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = false;
      this.parts.push(m);
      return m;
    };

    // ---- hips (root of the body, above the feet)
    this.hips = new THREE.Group();
    this.hips.position.y = 0.92;
    this.root.add(this.hips);

    // ---- torso
    this.torso = new THREE.Group();
    this.hips.add(this.torso);
    this.torso.add(mesh(geo(new THREE.BoxGeometry(0.44, 0.6, 0.26)), this.mats.jacket, 0, 0.3, 0));
    this.torso.add(mesh(geo(new THREE.BoxGeometry(0.46, 0.16, 0.28)), this.mats.jacketDark, 0, -0.01, 0));
    // vest pocket detail
    this.torso.add(mesh(geo(new THREE.BoxGeometry(0.12, 0.1, 0.03)), this.mats.jacketDark, -0.1, 0.32, 0.14));
    this.torso.add(mesh(geo(new THREE.BoxGeometry(0.12, 0.1, 0.03)), this.mats.jacketDark, 0.1, 0.32, 0.14));

    // ---- backpack
    const pack = mesh(geo(new THREE.BoxGeometry(0.32, 0.4, 0.18)), this.mats.pack, 0, 0.3, -0.22);
    this.torso.add(pack);
    this.torso.add(mesh(geo(new THREE.BoxGeometry(0.3, 0.08, 0.2)), this.mats.jacketDark, 0, 0.52, -0.22));

    // ---- neck + head
    this.head = new THREE.Group();
    this.head.position.y = 0.62;
    this.torso.add(this.head);
    this.head.add(mesh(geo(new THREE.CylinderGeometry(0.055, 0.07, 0.08, 6)), this.mats.skin, 0, 0.02, 0));
    const skull = mesh(geo(new THREE.SphereGeometry(0.135, 10, 8)), this.mats.skin, 0, 0.15, 0);
    skull.scale.set(1, 1.08, 1.02);
    this.head.add(skull);
    // face hint
    this.head.add(mesh(geo(new THREE.BoxGeometry(0.16, 0.05, 0.06)), this.mats.jacketDark, 0, 0.14, 0.12));
    // hat
    this.head.add(mesh(geo(new THREE.CylinderGeometry(0.13, 0.14, 0.1, 10)), this.mats.hat, 0, 0.245, 0));
    const brim = mesh(geo(new THREE.CylinderGeometry(0.28, 0.29, 0.022, 12)), this.mats.hat, 0, 0.198, 0);
    this.head.add(brim);

    // ---- arms (pivot at the shoulder)
    const makeArm = (side) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.26, 0.5, 0);
      this.torso.add(shoulder);
      const upper = mesh(geo(new THREE.CapsuleGeometry(0.075, 0.22, 3, 7)), this.mats.jacket, 0, -0.14, 0);
      shoulder.add(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -0.27;
      shoulder.add(elbow);
      const fore = mesh(geo(new THREE.CapsuleGeometry(0.066, 0.2, 3, 7)), this.mats.skin, 0, -0.13, 0);
      elbow.add(fore);
      const hand = new THREE.Group();
      hand.position.y = -0.27;
      elbow.add(hand);
      hand.add(mesh(geo(new THREE.SphereGeometry(0.07, 8, 6)), this.mats.skin, 0, 0, 0));
      return { shoulder, elbow, hand };
    };
    this.armL = makeArm(-1);
    this.armR = makeArm(1);

    // ---- fishing rod, held in the right hand
    this.rod = new THREE.Group();
    this.armR.hand.add(this.rod);
    // ---- rod: three nested segments so it can bend under load (v2.0.0)
    // grip (root) -> mid -> tip, each pivot at the top of the previous section
    const grip = mesh(geo(new THREE.CylinderGeometry(0.017, 0.021, 1.0, 6)), this.mats.rod, 0, 0.45, 0);
    this.rod.add(grip);
    this.rodMid = new THREE.Group();
    this.rodMid.position.y = 0.95;
    this.rod.add(this.rodMid);
    const midSeg = mesh(geo(new THREE.CylinderGeometry(0.011, 0.016, 0.95, 6)), this.mats.rod, 0, 0.45, 0);
    this.rodMid.add(midSeg);
    this.rodTipGroup = new THREE.Group();
    this.rodTipGroup.position.y = 0.9;
    this.rodMid.add(this.rodTipGroup);
    const tipSeg = mesh(geo(new THREE.CylinderGeometry(0.005, 0.011, 0.85, 5)), this.mats.rod, 0, 0.42, 0);
    this.rodTipGroup.add(tipSeg);
    // tip guide ring
    this.rodTipGroup.add(mesh(geo(new THREE.TorusGeometry(0.022, 0.006, 4, 8)), this.mats.metal, 0, 0.85, 0));
    // reel
    const reel = mesh(geo(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10)), this.mats.metal, 0.06, 0.62, 0);
    reel.rotation.z = Math.PI / 2;
    this.rod.add(reel);
    this.reelMesh = reel;
    // grip wraps
    this.rod.add(mesh(geo(new THREE.CylinderGeometry(0.024, 0.024, 0.24, 8)), this.mats.pack, 0, 0.24, 0));
    this.rod.rotation.set(-0.5, 0, 0.12);
    this._rodBend = 0;
    this._rodBendVel = 0;

    // ---- legs (pivot at the hip)
    const makeLeg = (side) => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.12, -0.02, 0);
      this.hips.add(hip);
      hip.add(mesh(geo(new THREE.CapsuleGeometry(0.09, 0.3, 3, 7)), this.mats.pants, 0, -0.2, 0));
      const knee = new THREE.Group();
      knee.position.y = -0.44;
      hip.add(knee);
      knee.add(mesh(geo(new THREE.CapsuleGeometry(0.078, 0.28, 3, 7)), this.mats.pants, 0, -0.19, 0));
      const foot = mesh(geo(new THREE.BoxGeometry(0.13, 0.09, 0.24)), this.mats.boots, 0, -0.38, 0.04);
      knee.add(foot);
      return { hip, knee };
    };
    this.legL = makeLeg(-1);
    this.legR = makeLeg(1);

    // ---- pose bookkeeping
    this._targets = {
      shoulderL: new THREE.Vector3(),
      elbowL: new THREE.Vector3(),
      shoulderR: new THREE.Vector3(),
      elbowR: new THREE.Vector3(),
      headPitch: 0,
      headYaw: 0,
      torsoPitch: 0,
      torsoYaw: 0,
      hipsY: 0,
      legL: new THREE.Vector2(),
      legR: new THREE.Vector2(),
      rodPitch: -0.5,
      rodRoll: 0.12,
    };
    this._current = JSON.parse(JSON.stringify(this._targets));
    this.root.scale.setScalar(opts.scale ?? 1);
  }

  set visible(v) {
    this.root.visible = v;
  }

  get visible() {
    return this.root.visible;
  }

  /** "idle" | "walk" | "swim" | "hold" | "cast" | "reel" | "strike" */
  setPose(name) {
    this._pose = name;
  }

  /** Trigger the casting swing; t is the charge amount 0..1. */
  playCast(power = 1) {
    this._castT = 0;
    this._castPower = clamp01(power);
  }

  playStrike() {
    this._strikeT = 0;
  }

  setReeling(on, rate = 1) {
    this._reeling = on;
    this._reelRate = rate;
  }

  /** Water line for the swim pose (world Y of the surface). */
  setSwimLevel(y) {
    this._swimLevel = y;
  }

  /**
   * @param {number} dt
   * @param {object} state { speed, moving, sprinting, grounded, swimming, submerged, yaw }
   */
  update(dt, state = {}) {
    this._time += dt;
    this._speed = state.speed ?? 0;
    const swim = !!state.swimming;
    const moving = (state.moving ?? this._speed > 0.15) && !swim;
    const speedNorm = clamp01(this._speed / 7.4);

    // ---- walk cycle
    if (moving && state.grounded !== false) {
      this._phase += dt * (2.2 + speedNorm * 7.4);
    } else if (swim) {
      this._phase += dt * 3.4;
    } else {
      this._phase += dt * 0.9;
    }
    const p = this._phase;
    const swing = moving ? clamp01(0.25 + speedNorm * 0.9) : 0;
    const bob = moving ? Math.sin(p * 2) * 0.035 * swing : Math.sin(this._time * 1.6) * 0.012;

    // ---- base pose targets
    const t = this._targets;
    const idle = !moving && !swim;
    t.shoulderL.set(idle ? -0.12 : -0.15, 0, idle ? 0.14 : 0.1);
    t.shoulderR.set(idle ? -0.12 : -0.15, 0, idle ? -0.14 : -0.1);
    t.elbowL.set(-0.35, 0, 0);
    t.elbowR.set(-0.35, 0, 0);
    t.headPitch = 0;
    t.headYaw = 0;
    t.torsoPitch = 0;
    t.torsoYaw = 0;
    t.hipsY = bob;
    t.rodPitch = -0.5;
    t.rodRoll = 0.12;
    t.legL.set(0, 0);
    t.legR.set(0, 0);

    if (moving) {
      const amp = 0.55 + speedNorm * 0.55;
      t.legL.set(Math.sin(p) * amp, Math.max(0, Math.sin(p)) * 0.5);
      t.legR.set(-Math.sin(p) * amp, Math.max(0, -Math.sin(p)) * 0.5);
      t.shoulderL.set(-0.18 - Math.abs(Math.sin(p)) * 0.1, 0, 0.12);
      t.shoulderL.x += -Math.sin(p) * amp * 0.75;
      t.elbowL.set(-0.5 - Math.abs(Math.sin(p)) * 0.3, 0, 0);
      t.torsoYaw = Math.sin(p) * 0.08;
      t.torsoPitch = speedNorm * 0.1;
    }

    if (swim) {
      // front crawl: arms alternate, legs flutter
      t.shoulderL.set(-1.5 + Math.sin(p) * 1.1, 0, 0.24 + Math.sin(p) * 0.2);
      t.shoulderR.set(-1.5 + Math.sin(p + Math.PI) * 1.1, 0, -0.24 - Math.sin(p + Math.PI) * 0.2);
      t.elbowL.set(-0.6, 0, 0);
      t.elbowR.set(-0.6, 0, 0);
      t.legL.set(Math.sin(p * 2.2) * 0.35, 0);
      t.legR.set(-Math.sin(p * 2.2) * 0.35, 0);
      t.torsoPitch = 1.1;
      t.headPitch = -0.7;
      t.hipsY = 0;
    }

    // ---- fishing poses
    const fishing = this._pose === 'hold' || this._pose === 'cast' || this._pose === 'reel' || this._pose === 'strike';
    if (fishing) {      // both hands on the rod, right hand at the grip, left near the reel
      t.shoulderR.set(-1.02, 0, -0.34);
      t.elbowR.set(-0.72, 0, 0);
      t.shoulderL.set(-1.18, 0, 0.42);
      t.elbowL.set(-1.05, 0, 0);
      t.rodPitch = -0.62;
      t.rodRoll = 0.06;
      t.torsoYaw = -0.16;
      t.headYaw = -0.06;
    }

    // cast swing: back then forward
    if (this._castT >= 0) {
      this._castT += dt;
      const dur = 0.85;
      const k = clamp01(this._castT / dur);
      if (k < 0.45) {
        const a = k / 0.45;
        t.shoulderR.set(lerp(-0.6, -2.5, a), 0, -0.3);
        t.elbowR.set(lerp(-0.6, -1.5, a), 0, 0);
        t.shoulderL.set(lerp(-0.9, -1.9, a), 0, 0.4);
        t.rodPitch = lerp(-0.6, -1.5, a);
        t.torsoYaw = lerp(-0.16, -0.42, a);
      } else {
        const a = (k - 0.45) / 0.55;
        const e = 1 - Math.pow(1 - a, 3);
        t.shoulderR.set(lerp(-2.5, -0.15, e), 0, -0.3);
        t.elbowR.set(lerp(-1.5, -0.2, e), 0, 0);
        t.shoulderL.set(lerp(-1.9, -0.8, e), 0, 0.36);
        t.rodPitch = lerp(-1.5, -0.15, e);
        t.torsoYaw = lerp(-0.42, 0.1, e);
      }
      if (this._castT >= dur) this._castT = -1;
    }

    // sitting in the boat: knees up on the thwart, rod across the lap
    if (this._pose === 'sit') {
      t.legL.set(-1.25, 1.3);
      t.legR.set(-1.25, 1.3);
      t.hipsY = -0.26;
      t.torsoPitch = 0.06;
      t.shoulderR.set(-0.95, 0, -0.3);
      t.elbowR.set(-0.7, 0, 0);
      t.shoulderL.set(-0.6, 0, 0.34);
      t.elbowL.set(-0.85, 0, 0);
      t.rodPitch = -0.55;
    }

    // strike: sharp upward snap
    if (this._strikeT >= 0) {
      this._strikeT += dt;
      const k = clamp01(this._strikeT / 0.4);
      const e = Math.sin(k * Math.PI);
      t.shoulderR.x -= e * 0.85;
      t.shoulderL.x -= e * 0.85;
      t.torsoPitch -= e * 0.2;
      if (this._strikeT >= 0.4) this._strikeT = -1;
    }

    // reeling: left hand crank + slight body sway
    if (this._reeling && this._pose === 'reel') {
      this._reelT += dt * (1.6 + (this._reelRate || 1) * 2.4);
      t.elbowL.set(-1.05 + Math.sin(this._reelT) * 0.25, 0, 0);
      t.shoulderL.z += Math.cos(this._reelT) * 0.06;
      t.torsoYaw += Math.sin(this._reelT * 0.5) * 0.05;
      this.reelMesh.rotation.x += dt * (4 + (this._reelRate || 1) * 10);
    }

    // ---- blend toward targets
    const c = this._current;
    const lambda = 8.5;
    c.shoulderL.x = damp(c.shoulderL.x, t.shoulderL.x, lambda, dt);
    c.shoulderL.y = damp(c.shoulderL.y, t.shoulderL.y, lambda, dt);
    c.shoulderL.z = damp(c.shoulderL.z, t.shoulderL.z, lambda, dt);
    c.shoulderR.x = damp(c.shoulderR.x, t.shoulderR.x, lambda, dt);
    c.shoulderR.y = damp(c.shoulderR.y, t.shoulderR.y, lambda, dt);
    c.shoulderR.z = damp(c.shoulderR.z, t.shoulderR.z, lambda, dt);
    c.elbowL.x = damp(c.elbowL.x, t.elbowL.x, lambda, dt);
    c.elbowR.x = damp(c.elbowR.x, t.elbowR.x, lambda, dt);
    c.headPitch = damp(c.headPitch, t.headPitch, 5, dt);
    c.headYaw = damp(c.headYaw, t.headYaw, 5, dt);
    c.torsoPitch = damp(c.torsoPitch, t.torsoPitch, 6, dt);
    c.torsoYaw = damp(c.torsoYaw, t.torsoYaw, 6, dt);
    c.hipsY = damp(c.hipsY, t.hipsY, 12, dt);
    c.legL.x = damp(c.legL.x, t.legL.x, 14, dt);
    c.legL.y = damp(c.legL.y, t.legL.y, 14, dt);
    c.legR.x = damp(c.legR.x, t.legR.x, 14, dt);
    c.legR.y = damp(c.legR.y, t.legR.y, 14, dt);
    c.rodPitch = damp(c.rodPitch, t.rodPitch, 9, dt);
    c.rodRoll = damp(c.rodRoll, t.rodRoll, 9, dt);

    // ---- apply
    this.armL.shoulder.rotation.set(c.shoulderL.x, c.shoulderL.y, c.shoulderL.z);
    this.armR.shoulder.rotation.set(c.shoulderR.x, c.shoulderR.y, c.shoulderR.z);
    this.armL.elbow.rotation.x = c.elbowL.x;
    this.armR.elbow.rotation.x = c.elbowR.x;
    this.head.rotation.set(c.headPitch, c.headYaw, 0);
    this.torso.rotation.set(c.torsoPitch, c.torsoYaw, 0);
    this.hips.position.y = 0.92 + c.hipsY;
    this.legL.hip.rotation.set(c.legL.x, 0, 0);
    this.legR.hip.rotation.set(c.legR.x, 0, 0);
    this.legL.knee.rotation.x = c.legL.y;
    this.legR.knee.rotation.x = c.legR.y;
    this.rod.rotation.set(c.rodPitch, 0, c.rodRoll);

    // subtle submerged trim
    if (swim && state.submerged) {
      this.torso.rotation.x = 1.35;
    }
  }

  /** World-space tip of the rod (where the line leaves the rod). */
  rodTip(out = new THREE.Vector3()) {
    return out.set(0, 0.85, 0).applyMatrix4(this.rodTipGroup.matrixWorld);
  }

  /**
   * Bend the rod under line tension (0..1). The mid and tip sections rotate
   * progressively, and a small spring overshoot gives the "whip" feel when the
   * load suddenly changes.
   */
  setBend(load, dt = 1 / 60) {
    const target = clamp01(load);
    this._rodBend = damp(this._rodBend, target, 9, dt);
    const b = this._rodBend;
    // deeper bend toward the tip, with a little droop toward the line
    this.rodMid.rotation.x = -b * 0.26;
    this.rodMid.rotation.z = b * 0.05;
    this.rodTipGroup.rotation.x = -b * 0.42;
    this.rodTipGroup.rotation.z = b * 0.08;
  }

  get bend() {
    return this._rodBend;
  }

  /** World-space position of the right hand. */
  handPosition(out = new THREE.Vector3()) {
    return out.set(0, 0, 0).applyMatrix4(this.armR.hand.matrixWorld);
  }

  dispose() {
    for (const d of this._disposables) d.dispose?.();
    this._disposables.length = 0;
    this.root.clear();
  }
}
