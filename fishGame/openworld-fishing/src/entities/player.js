/**
 * player.js — the walking/swimming angler: capsule physics against the shared
 * heightfield, dock surfaces, prop collision, stamina, and the first/third
 * person camera rig (with spring smoothing and terrain-aware collision).
 */
import * as THREE from 'three';
import { Emitter, clamp, clamp01, damp, lerp, smoothstep, TAU } from '../core/util.js';
import { Angler } from './character.js';
import { WATER_LEVEL } from '../world/terrain.js';

const RADIUS = 0.34;
const EYE_HEIGHT = 1.62;
const HEAD_HEIGHT = 1.78;

export const MOVE = {
  walk: 4.3,
  run: 7.7,
  swim: 3.0,
  dive: 2.2,
  accelGround: 16,
  accelAir: 5,
  frictionGround: 12,
  frictionWater: 2.6,
  jump: 7.4,
  gravity: 26,
  stepUp: 0.68,
  maxSlope: 1.35,
};

export class Player extends Emitter {
  constructor(world, opts = {}) {
    super();
    this.world = world;
    this.position = new THREE.Vector3(opts.x ?? 0, 0, opts.z ?? 0);
    this.velocity = new THREE.Vector3();
    this.yaw = opts.yaw ?? 0;
    this.pitch = 0;
    this.viewMode = opts.viewMode || 'first';
    this.viewBlend = this.viewMode === 'third' ? 1 : 0;
    this.sensitivity = opts.sensitivity ?? 1;
    this.invertY = !!opts.invertY;

    this.grounded = false;
    this.swimming = false;
    this.submerged = false;
    this.onDock = false;
    this.sprinting = false;
    this.speed = 0;
    this.stamina = 1;
    this.oxygen = 1;
    this.distanceWalked = 0;
    this.deepest = 0;
    this.swimTime = 0;
    this._stepAccum = 0;
    this._bobPhase = 0;
    this._lastSurface = 'grass';
    this._cameraDistance = 4.4;
    this._thirdTargetDist = 4.4;
    this._tmpA = new THREE.Vector3();
    this._tmpB = new THREE.Vector3();
    this._tmpC = new THREE.Vector3();
    this._forward = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this.canMove = true;
    /** Set to a Boat while riding; the boat then drives our transform. */
    this.mounted = null;
    /** Camera shake (v2.0.0): trauma-based, decays over time. */
    this.trauma = 0;
    this.traumaDecay = 1.6;
    this._shakeSeed = Math.random() * 1000;
    this.shakeEnabled = true;

    this.angler = new Angler();
    this.angler.visible = this.viewMode === 'third';
    this.angler.root.position.copy(this.position);
    world.engine.dynamicGroup.add(this.angler.root);

    this.spawnAt(opts.x ?? -38, opts.z ?? 128);
  }

  /** Drop the player onto the ground at (x,z), searching for dry land. */
  spawnAt(x, z, search = true) {
    let target = { x, z };
    if (search && !this.world.terrain.isWalkable(x, z)) target = this.world.terrain.findLand(x, z, 120);
    this.position.set(target.x, this.world.terrain.heightAt(target.x, target.z) + 0.05, target.z);
    this.velocity.set(0, 0, 0);
    this.grounded = true;
    // Look toward the nearest water so the lake is in frame on the first frame.
    const lake = { x: -140, z: 110 };
    this.yaw = Math.atan2(-(lake.x - target.x), -(lake.z - target.z));
    this.pitch = -0.08;
    this.emit('teleport', this.position);
    return this.position;
  }

  get feetY() {
    return this.position.y;
  }

  eyePosition(out = new THREE.Vector3()) {
    const bob = this.grounded && this.speed > 0.5 ? Math.sin(this._bobPhase * 2) * 0.028 * clamp01(this.speed / 7) : 0;
    return out.set(this.position.x, this.position.y + EYE_HEIGHT + bob, this.position.z);
  }

  forward(out = new THREE.Vector3()) {
    const cp = Math.cos(this.pitch);
    return out.set(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp).normalize();
  }

  forwardFlat(out = new THREE.Vector3()) {
    return out.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
  }

  right(out = new THREE.Vector3()) {
    return out.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
  }

  setViewMode(mode) {
    if (mode !== 'first' && mode !== 'third') return;
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.angler.visible = true;
    this.emit('viewmode', mode);
  }

  toggleView() {
    this.setViewMode(this.viewMode === 'first' ? 'third' : 'first');
  }

  /** Add camera trauma (0..1). Shake amplitude is trauma squared. */
  addShake(amount, decay = 1.6) {
    if (!this.shakeEnabled) return;
    this.trauma = clamp01(this.trauma + amount * (this.shakeScale ?? 1));
    this.traumaDecay = decay;
  }

  /** Apply decaying positional + rotational shake to the camera. */
  _applyShake(dt, camera) {
    if (this.trauma <= 0) return;
    this.trauma = Math.max(0, this.trauma - this.traumaDecay * dt);
    const k = this.trauma * this.trauma;
    if (k <= 0.0001) return;
    this._shakeSeed += dt * 34;
    const s = this._shakeSeed;
    const amp = k * 0.16;
    camera.position.x += (Math.sin(s * 1.7) + Math.sin(s * 3.1) * 0.5) * amp;
    camera.position.y += (Math.sin(s * 2.3 + 1.2) + Math.sin(s * 4.7) * 0.4) * amp;
    camera.position.z += Math.sin(s * 1.1 + 2.4) * amp * 0.6;
    camera.rotateZ(Math.sin(s * 2.9) * k * 0.035);
    camera.rotateX(Math.sin(s * 3.7 + 0.7) * k * 0.02);
  }

  /** Main per-frame update: input -> physics -> animation. */
  update(dt, input, camera) {
    dt = Math.min(dt, 0.05);
    this._handleLook(input, dt);

    // While aboard a boat the boat drives our position and orientation, so we
    // only run the camera and the (seated) animation here.
    if (this.mounted) {
      this.speed = 0;
      this.grounded = true;
      this.swimming = false;
      this.submerged = false;
      this.onDock = false;
      this.stamina = clamp01(this.stamina + 0.06 * dt);
      this.oxygen = clamp01(this.oxygen + 0.4 * dt);
      this._updateAngler(dt, camera);
      this._updateCamera(dt, camera, input);
      return this;
    }

    const move = this.canMove ? input.moveVector() : { x: 0, z: 0, len: 0 };
    const wantSprint = this.canMove && input.action('sprint');
    const wantJump = this.canMove && input.action('jump');

    // ---- environment probes
    const groundY = this.world.groundHeightAt(this.position.x, this.position.z, this.position.y + 0.4);
    this.onDock = this.world.onDock(this.position.x, this.position.z, this.position.y + 0.4);
    const waterSurface = this.world.surfaceHeight(this.position.x, this.position.z);
    const terrainH = this.world.heightAt(this.position.x, this.position.z);
    const overWater = terrainH < WATER_LEVEL;

    // body centre vs water
    const bodyY = this.position.y + 0.9;
    const inWater = overWater && bodyY < waterSurface + 0.15;
    const deepWater = overWater && terrainH < WATER_LEVEL - 0.9;
    this.swimming = inWater && deepWater && !this.onDock;

    // ---- stamina
    const moving = move.len > 0.05 && (this.grounded || this.swimming);
    this.sprinting = wantSprint && moving && this.stamina > 0.02 && !this.swimming;
    const drain = this.swimming ? 0.055 : this.sprinting ? 0.16 : 0;
    this.stamina = clamp01(this.stamina - drain * dt + (drain === 0 ? 0.11 * dt : 0.02 * dt));

    // ---- desired horizontal velocity
    const fwd = this.forwardFlat(this._forward);
    const right = this.right(this._right);
    const wishX = fwd.x * move.z + right.x * move.x;
    const wishZ = fwd.z * move.z + right.z * move.x;
    const wishLen = Math.hypot(wishX, wishZ);
    let targetSpeed = 0;
    if (wishLen > 0.001) {
      if (this.swimming) targetSpeed = wantSprint ? MOVE.swim * 1.28 : MOVE.swim;
      else targetSpeed = this.sprinting ? MOVE.run : MOVE.walk;
      // slow down going uphill
      if (!this.swimming && this.grounded) {
        const ahead = this.world.heightAt(this.position.x + (wishX / wishLen) * 1.2, this.position.z + (wishZ / wishLen) * 1.2);
        const climb = (ahead - terrainH) / 1.2;
        if (climb > 0.35) targetSpeed *= clamp(1 - (climb - 0.35) * 0.85, 0.18, 1);
      }
    }

    const accel = this.swimming ? 8 : this.grounded ? MOVE.accelGround : MOVE.accelAir;
    const desVX = (wishLen > 0.001 ? (wishX / wishLen) * targetSpeed : 0);
    const desVZ = (wishLen > 0.001 ? (wishZ / wishLen) * targetSpeed : 0);
    this.velocity.x = damp(this.velocity.x, desVX, accel, dt);
    this.velocity.z = damp(this.velocity.z, desVZ, accel, dt);
    if (wishLen <= 0.001) {
      const fr = this.grounded ? MOVE.frictionGround : this.swimming ? MOVE.frictionWater : 0.7;
      this.velocity.x = damp(this.velocity.x, 0, fr, dt);
      this.velocity.z = damp(this.velocity.z, 0, fr, dt);
    }

    // ---- vertical motion
    if (this.swimming) {
      const floatTarget = waterSurface - 0.62;
      const submergedWant = input.isDown('ControlLeft') || input.isDown('ControlRight');
      if (submergedWant) {
        this.velocity.y = damp(this.velocity.y, -MOVE.dive, 3.2, dt);
      } else if (wantJump) {
        this.velocity.y = damp(this.velocity.y, 2.1, 3.2, dt);
      } else {
        // buoyancy springs the body back to the surface
        const diff = floatTarget - this.position.y;
        this.velocity.y = damp(this.velocity.y, clamp(diff * 2.6, -1.6, 1.6), 4, dt);
      }
    } else {
      this.velocity.y -= MOVE.gravity * dt;
      if (this.grounded && wantJump) {
        this.velocity.y = MOVE.jump;
        this.grounded = false;
        this.emit('jump');
      }
    }

    // ---- integrate
    const prevY = this.position.y;
    this.position.x += this.velocity.x * dt;
    this.position.z += this.velocity.z * dt;
    this.position.y += this.velocity.y * dt;

    // ---- world bounds
    const limit = this.world.terrain.half - 8;
    this.position.x = clamp(this.position.x, -limit, limit);
    this.position.z = clamp(this.position.z, -limit, limit);

    // ---- prop collision
    this._resolveColliders();

    // ---- ground / dock contact
    const gy = this.world.groundHeightAt(this.position.x, this.position.z, this.position.y + 0.6);
    if (this.swimming) {
      this.grounded = false;
    } else if (this.position.y <= gy + 0.001) {
      const step = gy - this.position.y;
      if (step > 0 && step < MOVE.stepUp && this.velocity.y <= 0.1 && prevY <= gy + MOVE.stepUp) {
        this.position.y = gy;
        this.velocity.y = 0;
        this.grounded = true;
      } else if (this.position.y < gy) {
        this.position.y = gy;
        if (this.velocity.y < 0) {
          if (this.velocity.y < -12) this.emit('hardLanding', -this.velocity.y);
          this.velocity.y = 0;
        }
        this.grounded = true;
      } else {
        this.grounded = false;
      }
    } else {
      this.grounded = false;
    }

    // ---- slope sliding when too steep
    if (this.grounded && !this.swimming) {
      const slope = this.world.slopeAt(this.position.x, this.position.z);
      if (slope > MOVE.maxSlope) {
        const n = this.world.normalAt(this.position.x, this.position.z, this._tmpA);
        const dot = n.x * this.velocity.x + n.z * this.velocity.z;
        this.velocity.x -= n.x * dot * 1.2;
        this.velocity.z -= n.z * dot * 1.2;
        this.velocity.x += n.x * 6 * dt;
        this.velocity.z += n.z * 6 * dt;
      }
    }

    // ---- speed bookkeeping
    this.speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (this.grounded && !this.swimming) {
      this._stepAccum += this.speed * dt;
      this.distanceWalked += this.speed * dt;
      if (this._stepAccum > (this.sprinting ? 2.0 : 1.55)) {
        this._stepAccum = 0;
        this.emit('step', this.surfaceKind());
      }
      this._bobPhase += dt * (4 + this.speed * 1.35);
    } else if (this.swimming) {
      this.swimTime += dt;
    }

    // ---- water / oxygen
    const eyeY = this.position.y + EYE_HEIGHT;
    const surfNow = this.world.surfaceHeight(this.position.x, this.position.z);
    this.submerged = eyeY < surfNow - 0.05;
    this.oxygen = this.submerged
      ? clamp01(this.oxygen - dt * 0.085)
      : clamp01(this.oxygen + dt * (this.swimming ? 0.22 : 0.5));
    const depth = this.world.depthAt(this.position.x, this.position.z);
    if (depth > this.deepest) this.deepest = depth;

    // ---- animation + camera
    this._updateAngler(dt, camera);
    this._updateCamera(dt, camera, input);

    return this;
  }

  surfaceKind() {
    if (this.onDock) return 'wood';
    const biome = this.world.biomeAt(this.position.x, this.position.z);
    if (biome === 'beach' || biome === 'coast') return 'sand';
    if (biome === 'rock' || biome === 'snow') return 'rock';
    if (biome === 'swamp') return 'water';
    return 'grass';
  }

  _handleLook(input, dt = 1 / 60) {
    // ---- keyboard turn: always available, and the guaranteed fallback when a
    // browser refuses pointer lock (v4.4.0). [ ] yaw, , . pitch.
    const keyYaw = 1.9 * dt * this.sensitivity;
    const keyPitch = 1.4 * dt * this.sensitivity;
    if (input.isDown?.('BracketLeft')) this.yaw += keyYaw;
    if (input.isDown?.('BracketRight')) this.yaw -= keyYaw;
    if (input.isDown?.('Comma')) this.pitch += keyPitch;
    if (input.isDown?.('Period')) this.pitch -= keyPitch;

    if (input.pointerLocked || input.dragging) {
      const look = input.takeLook();
      const sens = 0.0021 * this.sensitivity;
      this.yaw -= look.dx * sens;
      this.pitch -= look.dy * sens;
    } else {
      input.takeLook?.(); // drop stale deltas so they do not jerk on re-lock
    }
    this.pitch = clamp(this.pitch, -1.45, 1.4);
    this.yaw = ((this.yaw + Math.PI) % TAU + TAU) % TAU - Math.PI;
  }

  _resolveColliders() {
    const props = this.world.props;
    if (!props) return;
    const px = this.position.x;
    const pz = this.position.z;
    for (const col of props.colliders) {
      if (col.type === 'circle') {
        const dx = px - col.x;
        const dz = pz - col.z;
        const d = Math.hypot(dx, dz);
        const min = col.r + RADIUS;
        if (d < min && d > 1e-5) {
          const push = (min - d) / d;
          this.position.x += dx * push;
          this.position.z += dz * push;
        }
      } else if (col.type === 'box') {
        const cos = Math.cos(-col.yaw);
        const sin = Math.sin(-col.yaw);
        const dx = px - col.x;
        const dz = pz - col.z;
        const lx = dx * cos - dz * sin;
        const lz = dx * sin + dz * cos;
        const hw = col.hw + RADIUS;
        const hd = col.hd + RADIUS;
        if (Math.abs(lx) < hw && Math.abs(lz) < hd) {
          const ox = hw - Math.abs(lx);
          const oz = hd - Math.abs(lz);
          let nlx = lx;
          let nlz = lz;
          if (ox < oz) nlx = Math.sign(lx || 1) * hw;
          else nlz = Math.sign(lz || 1) * hd;
          const c2 = Math.cos(col.yaw);
          const s2 = Math.sin(col.yaw);
          this.position.x = col.x + (nlx * c2 - nlz * s2);
          this.position.z = col.z + (nlx * s2 + nlz * c2);
        }
      }
    }
  }

  _updateAngler(dt, camera) {
    const a = this.angler;
    a.root.position.set(this.position.x, this.position.y, this.position.z);
    a.root.rotation.y = this.yaw + Math.PI;
    a.update(dt, {
      speed: this.speed,
      moving: this.speed > 0.4,
      sprinting: this.sprinting,
      grounded: this.grounded,
      swimming: this.swimming,
      submerged: this.submerged,
    });
    // In first person the model still exists (for shadows and for the rod),
    // but the camera sits inside the head, so hide the head+torso only when
    // the camera would clip it.
    if (this.viewMode === 'first') {
      a.visible = this.viewBlend > 0.02;
    } else {
      a.visible = true;
    }
  }

  _updateCamera(dt, camera, input) {
    // ---- smooth view blend
    const wantBlend = this.viewMode === 'third' ? 1 : 0;
    this.viewBlend = damp(this.viewBlend, wantBlend, 7, dt);
    if (Math.abs(this.viewBlend - wantBlend) < 0.001) this.viewBlend = wantBlend;

    const eye = this.eyePosition(this._tmpA);
    const fwd = this.forward(this._tmpB);

    // ---- third person desired position
    const target = this._tmpC.set(this.position.x, this.position.y + HEAD_HEIGHT * 0.78, this.position.z);
    const shoulder = 0.5;
    const rightV = this.right(new THREE.Vector3());
    const focusX = target.x + rightV.x * shoulder * this.viewBlend;
    const focusZ = target.z + rightV.z * shoulder * this.viewBlend;

    const dist = this._cameraDistance;
    const idealX = focusX - fwd.x * dist;
    const idealY = target.y + 0.55 - fwd.y * dist;
    const idealZ = focusZ - fwd.z * dist;

    // ---- collision: shorten the boom if terrain or water blocks it
    let allowed = dist;
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const k = i / steps;
      const sx = lerp(focusX, idealX, k);
      const sy = lerp(target.y, idealY, k);
      const sz = lerp(focusZ, idealZ, k);
      const g = this.world.groundHeightAt(sx, sz, sy + 0.3);
      if (sy < g + 0.28) {
        allowed = dist * (i - 1) / steps;
        break;
      }
    }
    allowed = Math.max(1.1, allowed);
    this._thirdTargetDist = allowed;
    this._cameraDistance = damp(this._cameraDistance, this._thirdTargetDist, 10, dt);

    const camX = focusX - fwd.x * this._cameraDistance;
    const camY = target.y + 0.35 - fwd.y * this._cameraDistance;
    const camZ = focusZ - fwd.z * this._cameraDistance;

    // ---- blend between first and third
    const b = smoothstep(this.viewBlend);
    camera.position.set(lerp(eye.x, camX, b), lerp(eye.y, camY, b), lerp(eye.z, camZ, b));

    // ---- orientation: look along forward, but roll-correct toward the focus
    const lookAtX = lerp(eye.x - fwd.x * 10, focusX + fwd.x * 6, b);
    const lookAtY = lerp(eye.y - fwd.y * 10, target.y + fwd.y * 6, b);
    const lookAtZ = lerp(eye.z - fwd.z * 10, focusZ + fwd.z * 6, b);
    camera.up.set(0, 1, 0);
    camera.lookAt(lookAtX, lookAtY, lookAtZ);

    // ---- subtle first-person head roll from strafing
    if (b < 0.5 && this.grounded) {
      const strafe = this.right(new THREE.Vector3());
      const sideDot = (this.velocity.x * strafe.x + this.velocity.z * strafe.z) / MOVE.run;
      const roll = -sideDot * 0.035 * (1 - b);
      camera.rotateZ(roll);
    }

    const anglerVisible = this.viewBlend > 0.05;
    this.angler.visible = anglerVisible;
    // hide the head when the camera is inside it (first person with model on)
    this.angler.head.visible = this.viewBlend > 0.35;
    this.angler.torso.visible = true;

    // ---- impact shake (runs, landings, snaps)
    this._applyShake(dt, camera);
  }

  /** Teleport helper with a fade handled by the caller. */
  teleport(x, z) {
    this.spawnAt(x, z, true);
    this.velocity.set(0, 0, 0);
    this._cameraDistance = 4.4;
  }

  dispose() {
    this.world.engine.dynamicGroup.remove(this.angler.root);
    this.angler.dispose();
    this.clear();
  }
}
