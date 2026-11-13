/**
 * fishing.js — the whole fishing loop.
 *
 *   idle → charging → casting → flying → waiting → bite → fight → result
 *
 * The bobber is a real projectile that floats on the (identical) CPU wave
 * field, drifts with wind and river current, and can be cast anywhere in open
 * water — fishing spots simply make the water better. The fight is a tension
 * minigame whose difficulty comes from the fish's own stats and your line's
 * breaking strain, so gear progression is what unlocks the big fish.
 */
import * as THREE from 'three';
import { Emitter, clamp, clamp01, damp, lerp, pick, rand, randInt, chance, smoothstep, TAU, dist2 } from '../core/util.js';
import { FISH, RARITY, fishById } from '../data/fish.js';
import { gearStats, baitById, lureById, rodById, lineById, weightToLength } from '../data/gear.js';
import { fishValue, fishXp, applyCatch, trackQuests, checkAchievements } from '../systems/progression.js';
import { rollFish, watersForRegion, inTimeWindow } from '../systems/fishSelect.js';
import { buffMods } from '../systems/kitchen.js';
import { WATER_LEVEL } from '../world/terrain.js';
import { sizeClass } from '../data/size.js';
import { STYLES, EVENTS, styleFor, pickEvent, gradeFight } from './fightStyles.js';

export const STATE = {
  IDLE: 'idle',
  CHARGING: 'charging',
  CASTING: 'casting',
  FLYING: 'flying',
  WAITING: 'waiting',
  BITE: 'bite',
  FIGHT: 'fight',
  RESULT: 'result',
};

const VALID_BIOMES = ['ocean_deep', 'ocean_shallow', 'coast', 'reef', 'lake', 'river', 'pond', 'swamp', 'estuary'];

export class FishingSystem extends Emitter {
  constructor(world, player, profile, opts = {}) {
    super();
    this.world = world;
    this.player = player;
    this.profile = profile;
    this.state = STATE.IDLE;
    this.time = 0;
    this.charge = 0;
    this.castPower = 0;
    this.castTimer = 0;
    this.biteTimer = 0;
    this.biteWindow = 0;
    this.nibbleTimer = rand(1.5, 4);
    this.retrieving = false;
    this.ctx = null;
    this.hooked = null;
    this.fight = null;
    this.result = null;
    this.message = '';
    this.lastCatch = null;
    this.pendingCatch = null;
    this._resultHold = 0;
    this._lineSag = 0;
    /** Set by tests/tutorial hints to drive the reel without mouse input. */
    this.forceReel = null;

    // ---- bobber
    this.bobberPos = new THREE.Vector3();
    this.bobberVel = new THREE.Vector3();
    const bobGroup = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf2f4f6 });
    const redMat = new THREE.MeshLambertMaterial({ color: 0xd23b32 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), bodyMat);
    body.scale.set(1, 1.1, 1);
    bobGroup.add(body);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.087, 12, 6, 0, TAU, 0, Math.PI / 2), redMat);
    cap.position.y = 0.0;
    bobGroup.add(cap);
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.26, 6), new THREE.MeshLambertMaterial({ color: 0xff8a3c }));
    antenna.position.y = 0.15;
    bobGroup.add(antenna);
    bobGroup.visible = false;
    this.bobber = bobGroup;
    this._bobberMats = [bodyMat, redMat];
    world.engine.dynamicGroup.add(bobGroup);

    // ---- fishing line
    this.lineCount = 12;
    this.linePositions = new Float32Array(this.lineCount * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    lineGeo.setDrawRange(0, this.lineCount);
    this.lineGeo = lineGeo;
    this.lineMat = new THREE.LineBasicMaterial({ color: 0xe8f4f8, transparent: true, opacity: 0.5, depthWrite: false });
    this.line = new THREE.Line(lineGeo, this.lineMat);
    this.line.frustumCulled = false;
    this.line.visible = false;
    world.engine.dynamicGroup.add(this.line);

    // ---- landing marker (shown while charging)
    const ringGeo = new THREE.RingGeometry(0.55, 0.72, 28);
    ringGeo.rotateX(-Math.PI / 2);
    this.markerMat = new THREE.MeshBasicMaterial({ color: 0x7fd8ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false });
    this.marker = new THREE.Mesh(ringGeo, this.markerMat);
    this.marker.visible = false;
    this.marker.renderOrder = 12;
    this._markerGeo = ringGeo;
    world.engine.dynamicGroup.add(this.marker);

    // ---- splash ring effect
    this.splashes = [];
    this._splashGeo = new THREE.RingGeometry(0.2, 0.32, 20);
    this._splashGeo.rotateX(-Math.PI / 2);
    this._splashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false });

    this._tmpA = new THREE.Vector3();
    this._tmpB = new THREE.Vector3();
    this._tmpC = new THREE.Vector3();
    this._stats = null;
  }

  // ------------------------------------------------------------------ helpers

  get gear() {
    if (!this._gear || this._gearKey !== `${this.profile.rod}|${this.profile.line}|${this.profile.lure}`) {
      const stats = gearStats(this.profile);
      // cooked meals modify the loadout's effective stats
      const mods = buffMods(this.profile);
      stats.luck += mods.luck;
      stats.biteBonus *= 1 + mods.bite;
      stats.lineStrength *= 1 + mods.line;
      stats.reelSpeed *= 1 + mods.reel;
      stats.buffMods = mods;
      this._gear = stats;
      this._gearKey = `${this.profile.rod}|${this.profile.line}|${this.profile.lure}`;
    }
    return this._gear;
  }

  get bait() {
    return this.profile.lure === 'none' ? baitById(this.profile.baitId || 'worm') : null;
  }

  get isActive() {
    return this.state !== STATE.IDLE && this.state !== STATE.RESULT;
  }

  /**
   * Point the system at a (possibly brand new) profile object. main.js swaps
   * the profile when starting a new game or loading a save, and a stale
   * reference here silently sent every catch to the wrong profile.
   */
  setProfile(profile) {
    this.profile = profile;
    this._gear = null;
    this._gearKey = null;
    return this;
  }

  /** Where the player is aiming: first water/ground hit along the view ray. */
  aimPoint(out = new THREE.Vector3()) {
    const eye = this.player.eyePosition(this._tmpA);
    const dir = this.player.forward(this._tmpB);
    const maxDist = this.gear.castDistance * (0.35 + this.charge * 0.65) + 6;
    let last = this._tmpC.copy(eye).addScaledVector(dir, 2);
    for (let d = 2; d <= maxDist; d += 1.1) {
      const x = eye.x + dir.x * d;
      const y = eye.y + dir.y * d - 0.5 * 9.81 * Math.pow(d / 26, 2) * 0;
      const z = eye.z + dir.z * d;
      const ground = this.world.groundHeightAt(x, z, y + 1);
      const water = this.world.isWater(x, z) ? WATER_LEVEL : -Infinity;
      const surface = Math.max(ground, water);
      if (y <= surface + 0.05) {
        return out.set(x, Math.max(surface, water), z);
      }
      last.set(x, y, z);
    }
    return out.copy(last);
  }

  /** Is the player allowed to start a cast? */
  canCast() {
    if (this.state !== STATE.IDLE) return false;
    if (this.player.swimming && this.player.submerged) return false;
    return true;
  }

  /** Human-readable reason the player cannot fish here. */
  blockReason() {
    const p = this.player;
    if (p.swimming && p.submerged) return '水下无法抛竿，先浮出水面';
    return null;
  }

  // ------------------------------------------------------------------ actions

  equip(loadout) {
    Object.assign(this.profile, loadout);
    this._gear = null;
    this.emit('equip', this.gear);
  }

  beginCharge() {
    if (!this.canCast()) return;
    this.state = STATE.CHARGING;
    this.charge = 0;
    this.marker.visible = true;
    this.emit('statechange', this.state);
  }

  releaseCharge() {
    if (this.state !== STATE.CHARGING) return;
    this.castPower = this.charge;
    this.state = STATE.CASTING;
    this.castTimer = 0;
    this.marker.visible = false;
    this.profile.stats.casts = (this.profile.stats.casts || 0) + 1;
    this.player.angler.playCast(0.35 + this.castPower * 0.65);
    this.player.angler.setPose('cast');
    this.emit('cast', { power: this.castPower });
    this.emit('statechange', this.state);
  }

  cancel(reason = 'cancel') {
    if (this.state === STATE.IDLE) return;
    this._endCast(reason);
  }

  _endCast(reason) {
    this.state = STATE.IDLE;
    this.revealLock = false;
    this.bobber.visible = false;
    this.line.visible = false;
    this.marker.visible = false;
    this.hooked = null;
    this.fight = null;
    this.player.angler.setPose('idle');
    this.player.angler.setReeling(false);
    this.emit('statechange', this.state);
    if (reason) this.emit('castEnd', reason);
  }

  _spawnSplash(x, y, z, scale = 1) {
    const mat = this._splashMat.clone();
    const mesh = new THREE.Mesh(this._splashGeo, mat);
    mesh.position.set(x, Math.max(y, WATER_LEVEL) + 0.04, z);
    mesh.scale.setScalar(0.6 * scale);
    mesh.renderOrder = 11;
    this.world.engine.dynamicGroup.add(mesh);
    this.splashes.push({ mesh, mat, life: 0, max: 0.85, scale });
    if (this.splashes.length > 24) {
      const old = this.splashes.shift();
      this.world.engine.dynamicGroup.remove(old.mesh);
      old.mat.dispose();
    }
  }

  _updateSplashes(dt) {
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.life += dt;
      const k = clamp01(s.life / s.max);
      s.mesh.scale.setScalar((0.6 + k * 3.4) * s.scale);
      s.mat.opacity = (1 - k) * 0.6;
      if (k >= 1) {
        this.world.engine.dynamicGroup.remove(s.mesh);
        s.mat.dispose();
        this.splashes.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------------ context

  /** Build the fishing context at a water point. */
  buildContext(x, z) {
    const region = this.world.regionAt(x, z);
    const biome = this.world.biomeAt(x, z);
    const depth = this.world.depthAt(x, z);
    const spot = this.world.spots.find((s) => dist2(s.anchorX, s.anchorZ, x, z) < s.radius + 12) || null;
    const waters = watersForRegion(region, depth);
    const biomes = [];
    for (const b of [biome, region, depth < 4 && ['coast', 'ocean_shallow', 'reef'].includes(biome) ? 'coast' : null]) {
      if (b && VALID_BIOMES.includes(b) && !biomes.includes(b)) biomes.push(b);
    }
    if (!biomes.length) biomes.push('coast');
    return { region, biome, depth, waters, biomes, spot, x, z };
  }

  /**
   * Weighted species roll for the current context and conditions.
   * Thin wrapper around the shared, node-auditable selector.
   */
  rollFish(ctx, diag = null) {
    const w = this.world;
    return rollFish(
      ctx,
      {
        level: this.profile.level,
        hour: w.timeOfDay,
        weather: w.weather.kind,
        lure: this.gear.lure,
        bait: this.bait,
        luck: this.gear.luck,
      },
      Math.random,
      diag
    );
  }

  /** Roll an individual fish's size. */
  rollSize(fish) {
    const luck = this.gear.luck;
    const lure = this.gear.lure;
    const bias = clamp01(luck * 1.1 + (this.bait?.rarity || 0) * 0.7 + (lure?.rarity || 0) * 0.5);
    const t = Math.pow(Math.random(), 0.62 - bias * 0.42);
    const kg = fish.minWeight + (fish.maxWeight - fish.minWeight) * t;
    return Math.max(0.005, Math.round(kg * 1000) / 1000);
  }

  /** How long until something bites, in seconds. */
  rollWaitTime(ctx) {
    const w = this.world;
    const hour = w.timeOfDay;
    const weather = w.weather;
    const gear = this.gear;
    const bait = this.bait;
    let base = rand(3.4, 13);

    let mult = 1;
    mult /= clamp(weather.biteModifier, 0.4, 2);
    mult /= clamp(gear.biteBonus, 0.5, 2.2);
    if (bait) mult /= clamp(1 + (bait.bite - 1) * 0.9, 0.5, 2.2);
    // dawn and dusk are the magic hours
    const dawnDusk = Math.max(
      Math.exp(-Math.pow((hour - 6.2) / 1.6, 2)),
      Math.exp(-Math.pow((hour - 18.4) / 1.7, 2))
    );
    mult /= 1 + dawnDusk * 0.75;
    if (ctx.spot) mult /= 1.22;
    if (ctx.depth < 0.6) mult *= 1.5;
    if (this.profile.level >= 20) mult *= 0.92;
    // night fishing: a full moon pulls the fish out to feed (v1.8.0)
    const night = weather?.kind ? (w.env?.night ?? 0) : 0;
    if (night > 0.5) {
      const phase = w.moonPhase.index;
      const lunar = phase === 4 ? 1.28 : phase === 0 ? 0.78 : 1 + Math.sin((phase / 8) * Math.PI * 2) * 0.12;
      mult /= lunar;
      // glowing lures (jigs / squid jigs) shine at night
      const lure = this.gear.lure;
      if (lure && (lure.id === 'jig' || lure.id === 'squidjig' || lure.id === 'spoon')) mult /= 1.18;
    }
    // low sanity makes the bite shy (v4.1.0) — the shadow world is distracting
    const sanity = this.profile.survival?.sanity ?? 1;
    if (sanity < 0.4) mult *= 1 + (0.4 - sanity) * 0.9;
    if (bait) this._consumeBait();
    return clamp(base * mult, 1.6, 34);
  }

  _consumeBait() {
    const id = this.profile.baitId;
    if (!id) return;
    if (this.profile.bait && typeof this.profile.bait[id] === 'number') {
      this.profile.bait[id] = Math.max(0, this.profile.bait[id] - 1);
      if (this.profile.bait[id] === 0) this.emit('baitEmpty', id);
    }
  }

  // ------------------------------------------------------------------ update

  update(dt, input) {
    this.time += dt;
    this._updateSplashes(dt);
    const hasPointer = input.pointerLocked || input.dragging;

    switch (this.state) {
      case STATE.IDLE:
        this._updateIdle(dt, input, hasPointer);
        break;
      case STATE.CHARGING:
        this._updateCharging(dt, input);
        break;
      case STATE.CASTING:
        this._updateCasting(dt);
        break;
      case STATE.FLYING:
        this._updateFlying(dt, input);
        break;
      case STATE.WAITING:
        this._updateWaiting(dt, input, hasPointer);
        break;
      case STATE.BITE:
        this._updateBite(dt, input, hasPointer);
        break;
      case STATE.FIGHT:
        this._updateFight(dt, input);
        break;
      case STATE.RESULT:
        this._updateResult(dt, input);
        break;
      default:
        break;
    }

    // ---- rod load: the rod loads on the cast and bends against a fish
    let load = 0;
    if (this.state === STATE.CHARGING) load = 0.12 + this.charge * 0.5;
    else if (this.state === STATE.CASTING) load = 0.55 * (1 - clamp01(this.castTimer / 0.42));
    else if (this.state === STATE.FIGHT) load = this.rodLoad || 0;
    else if (this.state === STATE.BITE) load = 0.12;
    else if (this.state === STATE.WAITING) load = 0.06;
    // a soft rod visibly bends further for the same load (v2.3.0)
    const stiffness = this.gear.rodStiffness ?? 0.4;
    this.player.angler.setBend(load * (1.3 - stiffness * 0.5), dt);

    if (this.bobber.visible) this._updateLine();
  }

  _updateIdle(dt, input, hasPointer) {
    this.player.angler.setPose('idle');
    this.player.angler.setReeling(false);
    if (!this.canCast()) return;
    const pressed = input.action('interact') || (hasPointer && input.mouse.left && !input.mouse.right);
    if (input.actionPressed('interact') || (hasPointer && input.mouse.leftPressed)) {
      this.beginCharge();
    }
  }

  _updateCharging(dt, input) {
    this.charge = clamp01(this.charge + dt / 1.15);
    this.player.angler.setPose('hold');
    // aim marker
    const aim = this.aimPoint(this._tmpA);
    this.marker.position.set(aim.x, Math.max(this.world.surfaceHeight(aim.x, aim.z), this.world.heightAt(aim.x, aim.z)) + 0.06, aim.z);
    this.marker.rotation.y = this.time * 0.6;
    this.markerMat.opacity = 0.45 + Math.sin(this.time * 6) * 0.12;
    const released = !input.action('interact') && !input.mouse.left;
    const cancelled = input.actionPressed('pause');
    if (released || cancelled) {
      if (cancelled || this.charge < 0.06) {
        this.state = STATE.IDLE;
        this.marker.visible = false;
        this.player.angler.setPose('idle');
        this.emit('statechange', this.state);
      } else {
        this.releaseCharge();
      }
    }
  }

  _updateCasting(dt) {
    this.castTimer += dt;
    if (this.castTimer < 0.42) return;
    // launch the bobber from the rod tip toward the aim point
    this.player.angler.root.updateMatrixWorld(true);
    const start = this.player.angler.rodTip(this._tmpA);
    const target = this.aimPoint(this._tmpB);
    const dist = start.distanceTo(target);
    const T = clamp(dist / 17, 0.42, 1.75);
    this.bobberPos.copy(start);
    this.bobberVel.set((target.x - start.x) / T, (target.y - start.y) / T + 0.5 * 9.81 * T, (target.z - start.z) / T);
    this._lastLaunch = { x: start.x, y: start.y, z: start.z };
    this._lastTarget = { x: target.x, y: target.y, z: target.z };
    this.bobber.position.copy(this.bobberPos);
    this.bobber.visible = true;
    this.line.visible = true;
    this.state = STATE.FLYING;
    this.emit('statechange', this.state);
  }

  _updateFlying(dt, input) {
    this.bobberVel.y -= 9.81 * dt;
    this.bobberPos.addScaledVector(this.bobberVel, dt);
    const surface = this.world.surfaceHeight(this.bobberPos.x, this.bobberPos.z);
    const ground = this.world.heightAt(this.bobberPos.x, this.bobberPos.z);
    const isWaterHere = ground < WATER_LEVEL;
    const hitY = isWaterHere ? surface : ground;
    if (this.bobberPos.y <= hitY + 0.04 || this.bobberVel.y < 0 && this.bobberPos.y <= hitY + 0.2) {
      this.bobberPos.y = Math.max(hitY, this.bobberPos.y);
      this.bobber.position.copy(this.bobberPos);
      const depthHere = this.world.depthAt(this.bobberPos.x, this.bobberPos.z);
      this.lastCast = {
        x: +this.bobberPos.x.toFixed(2),
        y: +this.bobberPos.y.toFixed(2),
        z: +this.bobberPos.z.toFixed(2),
        ground: +ground.toFixed(2),
        surface: +surface.toFixed(2),
        hitY: +hitY.toFixed(2),
        isWaterHere,
        depth: +depthHere.toFixed(2),
        launch: this._lastLaunch
          ? { x: +this._lastLaunch.x.toFixed(2), y: +this._lastLaunch.y.toFixed(2), z: +this._lastLaunch.z.toFixed(2) }
          : null,
        target: this._lastTarget ? { x: +this._lastTarget.x.toFixed(2), y: +this._lastTarget.y.toFixed(2), z: +this._lastTarget.z.toFixed(2) } : null,
      };
      if (!isWaterHere || depthHere < 0.25) {
        // landed on dry ground / puddle
        this._spawnSplash(this.bobberPos.x, ground, this.bobberPos.z, 0.5);
        this.emit('castFailed', 'land');
        this.message = '落点太浅，换个方向试试';
        this._endCast('land');
        return;
      }
      this._spawnSplash(this.bobberPos.x, surface, this.bobberPos.z, 1 + this.castPower * 0.8);
      this.emit('splash', { power: this.castPower, x: this.bobberPos.x, z: this.bobberPos.z });
      this.ctx = this.buildContext(this.bobberPos.x, this.bobberPos.z);
      this.biteTimer = this.rollWaitTime(this.ctx);
      this.nibbleTimer = rand(1.2, 3.2);
      this.state = STATE.WAITING;
      this.emit('statechange', this.state);
      this.emit('enteredWater', this.ctx);
      if (this.ctx.spot) this.world.discover(this.ctx.spot.id);
    }
    this.bobber.position.copy(this.bobberPos);
  }

  _updateWaiting(dt, input, hasPointer) {
    this.player.angler.setPose('hold');
    // float on the surface + current drift
    const surface = this.world.surfaceHeight(this.bobberPos.x, this.bobberPos.z);
    this.bobberPos.y = surface + 0.045 + Math.sin(this.time * 3.1) * 0.012;
    this._applyCurrent(dt);

    // retrieve / cancel
    this.retrieving = hasPointer && input.mouse.left;
    const cancel = input.actionPressed('reel') || input.mouse.rightPressed;
    if (cancel) {
      this.message = '收竿';
      this._endCast('reel');
      return;
    }
    if (this.retrieving) {
      const toPlayer = this._tmpA.set(this.player.position.x - this.bobberPos.x, 0, this.player.position.z - this.bobberPos.z);
      const d = toPlayer.length();
      if (d < 1.6) {
        this._endCast('reel');
        return;
      }
      toPlayer.divideScalar(d);
      const speed = 1.55 + this.gear.reelSpeed * 0.5;
      this.bobberPos.addScaledVector(toPlayer, speed * dt);
      this.biteTimer -= dt * 0.75;
      this.player.angler.setReeling(true, 0.6);
      if (Math.random() < dt * 7) this.emit('reelTick');
    } else {
      this.player.angler.setReeling(false);
    }

    // nibbles: the float twitches before the real bite
    this.nibbleTimer -= dt;
    if (this.nibbleTimer <= 0) {
      this.nibbleTimer = rand(1.4, 4.5);
      this.bobberPos.y -= 0.06;
      this.emit('nibble');
    }

    this.biteTimer -= dt;
    if (this.biteTimer <= 0) {
      this.state = STATE.BITE;
      this.biteWindow = clamp(1.45 - this.ctx.depth * 0.012 + (Math.random() - 0.5) * 0.2, 0.7, 1.8);
      this._spawnSplash(this.bobberPos.x, this.bobberPos.y, this.bobberPos.z, 0.7);
      this.emit('bite', { window: this.biteWindow });
      this.emit('statechange', this.state);
    }
    this.bobber.position.copy(this.bobberPos);
  }

  /** Wind and river current move the float (and later the boat). */
  _applyCurrent(dt) {
    const w = this.world;
    const wind = w.weather.wind;
    const angle = w.weather.windDir;
    let vx = Math.cos(angle) * wind * 0.5;
    let vz = Math.sin(angle) * wind * 0.5;
    const region = this.ctx?.region;
    if (region === 'river' || region === 'estuary') {
      // current runs downhill: strongest in the channel
      const depth = this.world.depthAt(this.bobberPos.x, this.bobberPos.z);
      const push = clamp01(depth / 2.2) * 0.85;
      const dirToLake = this._tmpB.set(-140 - this.bobberPos.x, 0, 110 - this.bobberPos.z);
      if (region === 'estuary') dirToLake.set(-600 - this.bobberPos.x, 0, 40 - this.bobberPos.z);
      dirToLake.normalize();
      vx += dirToLake.x * push;
      vz += dirToLake.z * push;
    }
    this.bobberPos.x += vx * dt;
    this.bobberPos.z += vz * dt;
    this._drift = { vx, vz };
  }

  _updateBite(dt, input, hasPointer) {
    this.player.angler.setPose('hold');
    const surface = this.world.surfaceHeight(this.bobberPos.x, this.bobberPos.z);
    this.biteWindow -= dt;
    // the float gets pulled under
    this.bobberPos.y = surface - 0.14 + Math.sin(this.time * 22) * 0.03;
    this.bobber.position.copy(this.bobberPos);

    const strike = input.actionPressed('interact') || (hasPointer && input.mouse.leftPressed);
    if (strike) {
      this.hook();
      return;
    }
    if (this.biteWindow <= 0) {
      this.emit('missed');
      this.message = '鱼跑了…';
      this._endCast('missed');
    }
  }

  /** The player struck at the right moment. */
  hook() {
    const fish = this.rollFish(this.ctx);
    const weight = this.rollSize(fish);
    const length = weightToLength(fish.id, weight);
    const gear = this.gear;
    const fishPower = Math.max(0.05, weight * (0.6 + fish.fight * 2.4));
    const strengthRatio = gear.lineStrength / fishPower;

    this.hooked = { fish, weight, length, strengthRatio };

    // The drag setting a sensible angler would use for this line/fish combo:
    // a thin line against a heavy fish forces a light drag, which means the
    // fish takes line instead of snapping you off (v2.0.0).
    // v2.6.0: the player can dial it down with Z/X; the line still caps it.
    // v5.1.0: the old curve (0.55 × ratio) hit the 0.2 floor for anything with
    // real weight, which turned every big fish into an instant spool. A small
    // baseline drag means a badly out-gunned fight is still a fight.
    const dragMax = clamp(0.26 + 0.55 * Math.min(1.2, strengthRatio), 0.22, 0.9);
    const dragUser = clamp(this.profile.settings?.dragSetting ?? 1, 0.2, 1);
    const dragSet = clamp(dragMax * dragUser, 0.08, dragMax);

    this.fight = {
      tension: 0.42,
      distance: 1,
      stamina: 1,
      wear: 0,
      drag: dragSet,
      dragMax,
      dragUser,
      lineOutM: 55,
      slipTime: 0,
      slipping: false,
      _wasSlipping: false,
      zoneCenter: 0.5,
      zoneWidth: clamp(0.36 - fish.fight * 0.17 + (gear.rod.reel - 1) * 0.02, 0.11, 0.4),
      zoneTarget: 0.5,
      nextZone: rand(1.6, 3.2),
      nextRun: rand(1.4, 3.4) / (0.7 + fish.fight),
      runTimer: 0,
      runPower: 0,
      maxDeviation: 0,
      time: 0,
      slackTime: 0,
      perfect: true,
      // ---- v5.0.0 fight content
      style: styleFor(fish),
      event: null,
      nextEvent: rand(2.2, 4.0),
      eventsTotal: 0,
      eventsCountered: 0,
    };
    this.rodLoad = 0.25;
    this.state = STATE.FIGHT;
    this.player.angler.playStrike();
    this.player.angler.setPose('reel');
    this.player.angler.setReeling(false);
    this.emit('hooked', {
      fish,
      weight,
      strengthRatio,
      drag: dragSet,
      dragMax,
      danger: strengthRatio < 0.9,
      big: weight >= 8 || fish.rarity >= 4,
    });
    this.emit('statechange', this.state);
  }

  /**
   * Telegraphed fish moves (v5.0.0). Each event warns for a moment, then runs
   * for a window; the correct input during the window cancels the penalty and
   * burns extra stamina, which is what turns a fight from a tug-of-war into a
   * read-and-react duel.
   */
  _updateFightEvent(dt, input, reeling, pumping, fish) {
    const f = this.fight;
    const style = f.style || STYLES.thrasher;
    if (!f.event) {
      f.nextEvent -= dt;
      if (f.nextEvent <= 0 && f.stamina > 0.08 && f.time > 1.2) {
        const ev = pickEvent(style);
        f.event = { ...ev, phase: 'telegraph', t: 0, countered: false };
        f.eventsTotal++;
        this.emit('fightEvent', {
          type: ev.id,
          phase: 'telegraph',
          label: ev.label,
          hint: ev.hint,
          icon: ev.icon,
          action: ev.action,
          style: style.id,
        });
        f.nextEvent = rand(3.4, 6.4) / (0.7 + fish.fight);
      }
      return;
    }
    const e = f.event;
    e.t += dt;

    if (e.phase === 'telegraph') {
      if (e.t >= e.telegraph) {
        e.phase = 'active';
        e.t = 0;
        this.emit('fightEvent', { type: e.id, phase: 'active', label: e.label, icon: e.icon });
        if (e.id === 'jump') this.emit('jump', { weight: this.hooked?.weight || 1 });
      }
    } else if (e.phase === 'active') {
      // The counter only counts inside the active window: the telegraph is the
      // warning, the active window is when you actually have to act.
      if (!e.countered) {
        const ok = e.action === 'pump' ? pumping : !reeling && !pumping;
        if (ok) {
          e.countered = true;
          f.eventsCountered++;
          f.stamina = clamp01(f.stamina - e.stamina);
          // turning its head also wins a little line back
          f.distance = Math.max(0, f.distance - 0.035);
          this.emit('fightEvent', { type: e.id, phase: 'countered', label: e.label, icon: e.icon, style: style.id });
        }
      }
      const k = e.countered ? 0.12 : 1;
      f.tension += dt * e.tension * k;
      f.distance += dt * (e.distance || 0) * k;
      if (!e.countered) f.wear += dt * e.wear * 0.55;
      if (e.t >= e.active) {
        e.phase = 'recover';
        e.t = 0;
        this.emit('fightEvent', { type: e.id, phase: 'recover', label: e.label, icon: e.icon });
      }
    } else if (e.phase === 'recover' && e.t >= 0.3) {
      f.event = null;
    } else if (e.phase === 'recover') {
      // a spent fish lets you win back a little line
      f.distance = Math.max(0, f.distance - dt * 0.03);
    }
  }

  _updateFight(dt, input) {
    const f = this.fight;
    const fish = this.hooked.fish;
    const gear = this.gear;
    f.time += dt;

    const reeling = this.forceReel ?? (input.mouse.left || input.action('reelAlt'));
    const pumping = input.mouse.right;
    this.player.angler.setReeling(reeling, clamp01(1 - f.stamina));
    this.player.angler.setPose('reel');

    // ---- fish behaviour: runs and direction changes
    f.nextZone -= dt;
    if (f.nextZone <= 0) {
      f.zoneTarget = rand(0.26, 0.82);
      f.nextZone = rand(1.8, 3.6);
    }
    f.zoneCenter = damp(f.zoneCenter, f.zoneTarget, 0.9, dt);

    f.nextRun -= dt;
    if (f.nextRun <= 0 && f.runTimer <= 0) {
      const style = f.style || STYLES.thrasher;
      f.runTimer = rand(0.5, 1.5) * (0.7 + fish.fight);
      f.runPower = rand(0.6, 1.4) * (0.5 + fish.fight) * style.runPower;
      f.nextRun = (rand(2.4, 5.0) / (0.6 + fish.fight)) / Math.max(0.5, style.runFreq);
      this.emit('run', { power: f.runPower, big: f.runPower > 0.9 });
    }
    let runTension = 0;
    let runDistance = 0;
    if (f.runTimer > 0) {
      f.runTimer -= dt;
      const surge = Math.sin(clamp01(1 - f.runTimer / 1.05) * Math.PI);
      runTension = f.runPower * surge * 1.45 * (1 - (gear.lineStretch ?? 0.3) * 0.4);
      // absolute cap on how much line one surge can take, so a runner cannot
      // simply delete the whole spool in three seconds
      runDistance = Math.min(1.5, f.runPower * surge) * 0.07;
    }

    // ---- fight events (v5.0.0): telegraphed moves with a counter input
    this._updateFightEvent(dt, input, reeling, pumping, fish);

    // ---- tension dynamics
    const reelRate = gear.reelSpeed * (0.75 + (1 - f.stamina) * 0.5);
    // a tired fish fights the reel less, so the endgame is snappy
    const resistance = clamp(0.35 + fish.fight * 0.9, 0.3, 1.6) * (0.45 + f.stamina * 0.55);
    // Gear feel (v2.3.0): a stretchy line softens every tension change, a stiff
    // rod transmits the fish's pull more directly.
    const stretch = gear.lineStretch ?? 0.3;
    const stiffness = gear.rodStiffness ?? 0.4;
    const tensionResponse = 1 - stretch * 0.55;
    if (reeling) f.tension += dt * (3.05 * reelRate * resistance * tensionResponse);
    // ---- drag dial (v2.6.0): Z relaxes the clutch, X tightens it
    if (input.justPressed?.('dragDown') || input.justPressed?.('KeyZ')) {
      this.profile.settings.dragSetting = clamp((this.profile.settings?.dragSetting ?? 1) - 0.08, 0.2, 1);
      f.dragUser = this.profile.settings.dragSetting;
      f.drag = clamp(f.dragMax * f.dragUser, 0.08, f.dragMax);
      this.emit('dragChanged', { drag: f.drag, dragMax: f.dragMax, user: f.dragUser });
    } else if (input.justPressed?.('dragUp') || input.justPressed?.('KeyX')) {
      this.profile.settings.dragSetting = clamp((this.profile.settings?.dragSetting ?? 1) + 0.08, 0.2, 1);
      f.dragUser = this.profile.settings.dragSetting;
      f.drag = clamp(f.dragMax * f.dragUser, 0.08, f.dragMax);
      this.emit('dragChanged', { drag: f.drag, dragMax: f.dragMax, user: f.dragUser });
    }
    if (pumping) {
      // pumping the rod: dump tension fast, gain a little line back
      f.tension -= dt * 2.9;
      f.distance -= dt * 0.035;
      if (f.tension > 0.05 && !f._pumpTick) {
        f._pumpTick = true;
        this.emit('pump', { tension: f.tension });
      }
    }
    if (!f._pumpTick || !pumping) f._pumpTick = pumping && f.tension > 0.05;
    if (!reeling && !pumping) f.tension -= dt * (1.05 - fish.fight * 0.2) * tensionResponse;
    f.tension += dt * runTension;
    f.tension = Math.max(0, f.tension);

    // ---- drag (slipping clutch): above the set tension the reel gives line
    const drag = f.drag;
    let slip = 0;
    if (f.tension > drag) {
      const excess = f.tension - drag;
      slip = clamp01(excess / 0.16);
      // paying out line: the harder the excess, the faster it screams out
      const payOut = (0.05 + excess * 0.7) * (0.45 + fish.fight * 0.6) * 0.45;
      f.distance += dt * payOut;
      f.lineOutM += dt * payOut * 52;
      f.slipTime += dt;
      // the clutch holds most of the excess, so tension plateaus near the drag
      f.tension = drag + excess * 0.32;
      f.slipping = slip > 0.05;
    } else {
      f.slipping = false;
    }
    if (f.slipping !== f._wasSlipping) {
      f._wasSlipping = f.slipping;
      this.emit('dragSlip', { on: f.slipping, drag, slip });
    }
    if (f.slipping) this.emit('dragTick', { slip });

    // ---- distance dynamics
    const tired = 1 - f.stamina;
    const reelGain = ((0.4 * reelRate) / (0.75 + fish.fight * 0.9)) * (1 + tired * 1.35);
    if (reeling) f.distance -= dt * reelGain;
    else f.distance += dt * (0.02 + fish.fight * 0.03) * (0.25 + f.stamina * 0.75);
    f.distance += dt * runDistance;
    f.distance = clamp(f.distance, 0, 1.45);
    f.lineOutM = clamp(3 + f.distance * 52, 1, 80);

    // ---- zone tracking: inside the band drains stamina.
    // The band is clamped below the drag ceiling so it is always reachable —
    // with a light line the working tension is simply lower.
    const effCenter = Math.min(f.zoneCenter, Math.max(0.1, f.drag - f.zoneWidth * 0.5 - 0.03));
    f.zoneEff = effCenter;
    const low = clamp(effCenter - f.zoneWidth / 2, 0.04, 0.98);
    const high = clamp(effCenter + f.zoneWidth / 2, low + 0.05, 1.05);
    const inside = f.tension >= low && f.tension <= high;
    if (inside) {
      const quality = 1 - Math.abs(f.tension - effCenter) / Math.max(0.001, f.zoneWidth / 2);
      const drain = (0.16 + quality * 0.2) * (reeling ? 1.5 : 0.7);
      f.stamina = clamp01(f.stamina - dt * drain);
      f.slackTime = 0;
    } else if (f.tension < low) {
      f.slackTime += dt;
      f.stamina = clamp01(f.stamina + dt * 0.035);
    }
    const deviation = f.tension > high ? f.tension - high : f.tension < low ? low - f.tension : 0;
    f.maxDeviation = Math.max(f.maxDeviation, deviation);
    if (deviation > 0.001) f.perfect = false;

    // ---- line wear: only when the clutch cannot keep up with the fish
    const overThreshold = drag + 0.09;
    if (f.tension > overThreshold) {
      const over = clamp01((f.tension - overThreshold) / Math.max(0.05, 1 - overThreshold));
      const strain = clamp(1.5 / Math.max(0.25, this.hooked.strengthRatio), 0.3, 3);
      f.wear += dt * over * 1.0 * strain;
      this.emit('lineStress', over);
    } else {
      f.wear = Math.max(0, f.wear - dt * 0.07);
    }
    if (f.tension >= 1.02) f.wear = 1.2;

    // ---- rod load for the visual (tension + reeling effort)
    this.rodLoad = clamp01(f.tension * 0.92 + (reeling ? 0.08 : 0));

    if (f.wear >= 1) {
      this.profile.stats.snapped = (this.profile.stats.snapped || 0) + 1;
      this.profile.stats.streak = 0;
      this.emit('snap', { fish, weight: this.hooked.weight, ratio: this.hooked.strengthRatio });
      this.message = '鱼线断了！换更粗的线吧';
      this.player.angler.setPose('idle');
      this._endCast('snap');
      return;
    }
    if (f.slackTime > 3.2 || f.distance >= 1.35) {
      this.profile.stats.escapes = (this.profile.stats.escapes || 0) + 1;
      this.profile.stats.streak = 0;
      this.emit('escape', { fish, weight: this.hooked.weight, outOfLine: f.distance >= 1.35 });
      this.message = f.distance >= 1.35 ? '鱼把线拉光了…' : '线太松，脱钩了';
      this.player.angler.setPose('idle');
      this._endCast('escape');
      return;
    }

    // ---- visual: the float comes back toward the player as distance drops
    const px = this.player.position.x;
    const pz = this.player.position.z;
    const startX = this.ctx?.x ?? this.bobberPos.x;
    const startZ = this.ctx?.z ?? this.bobberPos.z;
    const k = clamp01(1 - f.distance);
    this.bobberPos.x = lerp(startX, px, k * 0.92);
    this.bobberPos.z = lerp(startZ, pz, k * 0.92);
    const surf = this.world.surfaceHeight(this.bobberPos.x, this.bobberPos.z);
    this.bobberPos.y = surf + 0.02 - clamp(f.distance, 0, 1) * 0.35 + Math.sin(f.time * 9) * 0.035;
    this.bobber.position.copy(this.bobberPos);

    // ---- landed: at the net, or beaten and close enough to scoop up
    if (f.distance <= 0.02 && f.stamina <= 0.35) {
      this.land();
    } else if (f.distance <= 0.001) {
      this.land();
    } else if (f.distance <= 0.07 && f.stamina <= 0.5) {
      this.land();
    }
  }

  /** The fish is beaten: build the catch and wait for the player's choice. */
  land() {
    const { fish, weight, length } = this.hooked;
    const f = this.fight;
    const gear = this.gear;
    const w = this.world;
    const perfect = f.perfect;
    let value = fishValue(fish, weight, gear.luck);
    if (perfect) value = Math.round(value * 1.5);
    // ---- v5.0.0 fight grade: a clean read of the fish's moves pays
    const grade = gradeFight({
      maxDeviation: f.maxDeviation,
      countered: f.eventsCountered,
      total: f.eventsTotal,
      time: f.time,
    });
    if (grade.bonus > 0) value = Math.round(value * (1 + grade.bonus));
    // ---- v3.1.0 sea market: rough weather pays more, and offshore water pays
    // the most because that is where the risk is.
    const depth = this.ctx?.depth || 0;
    const offshore = depth >= 10 || this.ctx?.region === 'ocean' || this.ctx?.region === 'reef';
    const sea = w.seaState ?? 0;
    const seaFactor = offshore ? 1 + sea * 1.15 : 1 + sea * 0.3;
    const seaBonus = Math.round(value * (seaFactor - 1));
    value = Math.round(value * seaFactor);
    const xp = Math.round(fishXp(fish, weight) * (1 + grade.bonus * 0.6));
    const catchInfo = {
      fish,
      weight,
      length,
      value,
      xp,
      junk: !!fish.junk,
      perfect,
      grade,
      fightStyle: f.style ? { id: f.style.id, name: f.style.name, icon: f.style.icon } : null,
      eventsTotal: f.eventsTotal,
      eventsCountered: f.eventsCountered,
      fightTime: +f.time.toFixed(1),
      spotId: this.ctx?.spot?.id || null,
      spotName: this.ctx?.spot?.name || w.biomeLabel(this.ctx?.biome || 'coast'),
      region: this.ctx?.region || 'coast',
      biome: this.ctx?.biome || 'coast',
      weather: w.weather.kind,
      hour: w.timeOfDay,
      depth: this.ctx?.depth || 0,
      offshore,
      seaState: sea,
      seaFactor: +seaFactor.toFixed(2),
      seaBonus,
      phase: w.env?.phase?.id || null,
      golden: w.env?.golden ?? 0,
      tensionTime: f.time,
      at: Date.now(),
    };
    this.pendingCatch = catchInfo;
    this.lastCatch = catchInfo;
    this.result = catchInfo;
    this.message = '';
    this.state = STATE.RESULT;
    this.resultTimer = 0;
    this.player.angler.setPose('hold');
    this.player.angler.setReeling(false);
    this._spawnSplash(this.bobberPos.x, this.bobberPos.y, this.bobberPos.z, 1.6);
    this.emit('statechange', this.state);
    this.emit('landed', catchInfo);
  }

  /**
   * Resolve the pending catch. Releasing returns the fish to the water for
   * extra experience and no money (and keeps it out of the pantry).
   */
  commitPending(released = false) {
    const catchInfo = this.pendingCatch;
    if (!catchInfo) return null;
    this.pendingCatch = null;
    const profile = this.profile;

    if (released) {
      catchInfo.released = true;
      catchInfo.value = 0;
      catchInfo.xp = Math.round(catchInfo.xp * 1.7);
      profile.stats.released = (profile.stats.released || 0) + 1;
    }

    const applied = applyCatch(profile, catchInfo);
    catchInfo.newSpecies = applied.newSpecies;
    catchInfo.newRecord = applied.newRecord || applied.newSpecies;
    catchInfo.levelUps = applied.levelUps;
    // size class travels with the catch so the card and journal can show it
    catchInfo.sizeClass = sizeClass(catchInfo.weight, catchInfo.fish.rarity);
    if (catchInfo.newRecord && !catchInfo.newSpecies) {
      profile.stats.personalBests = (profile.stats.personalBests || 0) + 1;
    }

    const quests = trackQuests(profile, catchInfo);
    catchInfo.quests = quests;

    if (!released) {
      if (!profile.records) profile.records = {};
      const record = profile.records[catchInfo.fish.id];
      if (!record || catchInfo.weight > record) profile.records[catchInfo.fish.id] = catchInfo.weight;
      if (this.ctx?.spot) {
        const spot = this.ctx.spot;
        spot.catches = (spot.catches || 0) + 1;
        if (catchInfo.weight > (spot.bestWeight || 0)) {
          spot.bestWeight = catchInfo.weight;
          spot.bestId = catchInfo.fish.id;
        }
      }
    }

    const unlocked = checkAchievements(profile);
    catchInfo.achievements = unlocked;

    this.lastCatch = catchInfo;
    this.result = catchInfo;
    this.emit('catch', catchInfo);
    if (released) this.emit('released', catchInfo);
    for (const a of unlocked) this.emit('achievement', a);
    for (const q of quests) this.emit('questDone', q);
    if (applied.levelUps) this.emit('levelUp', { level: profile.level, count: applied.levelUps });
    return catchInfo;
  }

  _updateResult(dt, input) {
    // the reveal cinematic owns the screen for a moment
    if (this.revealLock) {
      this.resultTimer = 0;
      return;
    }
    this.resultTimer += dt;
    if (!this.pendingCatch) {
      if (this.resultTimer > 3) {
        this.result = null;
        this._endCast('done');
      }
      return;
    }
    const release = input.justPressed('KeyR') || input.action('reel');
    const keep =
      input.actionPressed('interact') || input.mouse.leftPressed || input.mouse.rightPressed || input.actionPressed('pause');
    if (release) {
      this.commitPending(true);
      this.emit('message', '放生 · 经验加成');
      this._resultHold = 1.6;
      return;
    }
    if (keep || this.resultTimer > 30) {
      this.commitPending(false);
      this._resultHold = 0;
    }
    if (this._resultHold > 0) {
      this._resultHold -= dt;
      if (this._resultHold <= 0) {
        this.result = null;
        this._endCast('done');
      }
      return;
    }
    if (!this.pendingCatch && this.resultTimer > 2.2) {
      this.result = null;
      this._endCast('done');
    }
  }

  // ------------------------------------------------------------------ visuals

  _updateLine() {
    // sagging catenary-ish line from the rod tip to the float
    const tip = this.player.angler.rodTip(this._tmpA);
    const end = this.bobberPos;
    const dist = tip.distanceTo(end);
    const taut = this.state === STATE.FIGHT ? clamp01(this.fight.tension) : this.state === STATE.FLYING ? 0.75 : 0.3;
    const sag = clamp(dist * 0.055, 0, 1.1) * (1 - taut * 0.75);
    for (let i = 0; i < this.lineCount; i++) {
      const t = i / (this.lineCount - 1);
      const x = lerp(tip.x, end.x, t);
      const y = lerp(tip.y, end.y, t) - Math.sin(t * Math.PI) * sag;
      const z = lerp(tip.z, end.z, t);
      this.linePositions[i * 3] = x;
      this.linePositions[i * 3 + 1] = y;
      this.linePositions[i * 3 + 2] = z;
    }
    this.lineGeo.attributes.position.needsUpdate = true;
    this.lineGeo.computeBoundingSphere();
    this.lineMat.opacity = 0.32 + (1 - clamp01(sag)) * 0.34;
  }

  /** Snapshot for the HUD. */
  getHudState() {
    const s = { state: this.state, charge: this.charge, message: this.message };
    if (this.state === STATE.FIGHT && this.fight && this.hooked) {
      const f = this.fight;
      s.tension = clamp01(f.tension);
      s.zoneLow = clamp01((f.zoneEff ?? f.zoneCenter) - f.zoneWidth / 2);
      s.zoneHigh = clamp01((f.zoneEff ?? f.zoneCenter) + f.zoneWidth / 2);
      s.distance = clamp01(1 - f.distance);
      s.wear = clamp01(f.wear);
      s.stamina = clamp01(f.stamina);
      s.fishName = this.hooked.fish.name;
      s.fishWeight = this.hooked.weight;
      s.danger = this.hooked.strengthRatio < 0.9;
      s.fishIcon = this.hooked.fish.icon;
      // v2.0.0 feel readouts
      s.drag = f.drag;
      s.dragMax = f.dragMax;
      s.dragUser = f.dragUser;
      s.lineOut = f.lineOutM;
      s.slipping = f.slipping;
      s.slipTime = f.slipTime;
      s.rodLoad = this.rodLoad || 0;
      // ---- v5.0.0: fight style + the event currently being telegraphed
      if (f.style) s.style = { id: f.style.id, name: f.style.name, icon: f.style.icon, blurb: f.style.blurb };
      s.eventsTotal = f.eventsTotal || 0;
      s.eventsCountered = f.eventsCountered || 0;
      if (f.event) {
        const e = f.event;
        s.event = {
          type: e.id,
          label: e.label,
          icon: e.icon,
          hint: e.hint,
          action: e.action,
          phase: e.phase,
          countered: !!e.countered,
          progress:
            e.phase === 'telegraph'
              ? clamp01(e.t / e.telegraph)
              : e.phase === 'active'
              ? clamp01(e.t / e.active)
              : clamp01(e.t / 0.3),
        };
      } else {
        s.event = null;
      }
    }
    if (this.state === STATE.WAITING || this.state === STATE.BITE) {
      s.spotName = this.ctx?.spot?.name || (this.ctx ? this.world.biomeLabel(this.ctx.biome) : '');
      s.depth = this.ctx?.depth || 0;
      s.retrieving = this.retrieving;
    }
    return s;
  }

  dispose() {
    for (const s of this.splashes) {
      this.world.engine.dynamicGroup.remove(s.mesh);
      s.mat.dispose();
    }
    this.splashes.length = 0;
    this.world.engine.dynamicGroup.remove(this.bobber, this.line, this.marker);
    this.bobber.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material && !this._bobberMats.includes(o.material)) o.material.dispose?.();
    });
    for (const m of this._bobberMats) m.dispose();
    this.lineGeo.dispose();
    this.lineMat.dispose();
    this._markerGeo.dispose();
    this.markerMat.dispose();
    this._splashGeo.dispose();
    this._splashMat.dispose();
  }
}
