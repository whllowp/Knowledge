// First-person mode: renderer, camera, the 3D kitchen, hand-held items,
// interactions and all the physical feedback that makes cooking feel tactile.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { STATIONS, STATION_BY_ID, SPAWN, INGREDIENTS } from '../core/data.js';
import { createItemMesh } from './items3d.js';
import { Kitchen3D } from './kitchen3d.js';
import { FPControls } from './player.js';
import { ParticleField, spawnBits, spawnSteam, spawnSmoke, spawnConfetti, spawnSparks } from './fx.js';
import { stationPrompt } from '../core/prompts.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class FirstPersonMode {
  constructor({ canvas, session, hands, settings, audio, onPauseRequest, onDeviceChange }) {
    this.canvas = canvas;
    this.session = session;
    this.hands = hands;
    this.settings = settings;
    this.audio = audio;
    this.onPauseRequest = onPauseRequest;
    this.onDeviceChange = onDeviceChange;
    this.inputDevice = 'keyboard';
    this.paused = false;
    this.active = true;
    this.time = 0;
    this.activeStation = null;
    this.nearestId = null;
    this.chopFxTimer = 0;
    this.chopSoundTimer = 0;
    this.steamTimer = 0;
    this.handPop = 0;
    this.handUid = null;
    this.sizzleLevel = 0;

    this._initRenderer();
    this._initScene();
    this._initKitchen();
    this._initParticles();
    this._initPlayer();
    this._initHands();
    this._bindSession();
    this.resize();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.pixelRatio = Math.min(2, dpr * (this.settings.quality || 1));
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.96;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x120b08);
    this.scene.fog = new THREE.Fog(0x140c09, 11, 27);

    this.camera = new THREE.PerspectiveCamera(this.settings.fov || 74, 16 / 9, 0.045, 40);
    this.scene.add(this.camera);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    try {
      const env = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;
      this.scene.environment = env;
      this.scene.environmentIntensity = 0.16;
      this.envTexture = env;
    } catch {
      /* environment is optional */
    }
    pmrem.dispose();

    this.scene.add(new THREE.HemisphereLight(0xffe0bc, 0x2a140d, 0.42));
    const key = new THREE.DirectionalLight(0xfff0d8, 1.9);
    key.position.set(3.6, 6.4, 4.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 22;
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    this.scene.add(key);
    this.scene.add(key.target);

    const rim = new THREE.DirectionalLight(0xff7a45, 0.65);
    rim.position.set(-4, 3, -3);
    this.scene.add(rim);
  }

  _initKitchen() {
    this.kitchen = new Kitchen3D(this.scene);
    this.kitchen.update(0, this.session, null);
  }

  _initParticles() {
    this.steam = new ParticleField(this.scene, { additive: true, max: 160, order: 8 });
    this.bits = new ParticleField(this.scene, { additive: false, max: 200, order: 7 });
  }

  _initPlayer() {
    this.player = new FPControls({
      camera: this.camera,
      canvas: this.canvas,
      settings: this.settings,
      onFootstep: () => this.audio?.play('step', { volume: 0.6 }),
      onPointerLockLost: () => {
        if (this.active && !this.paused) this.onPauseRequest?.();
      },
      canLock: () => this.active && !this.paused && this.session.state === 'playing',
      onPauseRequest: () => this.onPauseRequest?.(),
      onDeviceChange: (device) => {
        this.inputDevice = device;
        this.onDeviceChange?.(device);
      },
    });
  }

  _initHands() {
    this.handGroup = new THREE.Group();
    this.handGroup.position.set(0.34, -0.27, -0.58);
    this.camera.add(this.handGroup);

    this.handItemRoot = new THREE.Group();
    this.handItemRoot.position.y = -0.02;
    this.handGroup.add(this.handItemRoot);

    // a stylized arm + hand so carried food has a body attached to it
    const skin = new THREE.MeshStandardMaterial({ color: 0xd9a06f, roughness: 0.82 });
    const sleeve = new THREE.MeshStandardMaterial({ color: 0xf1eadc, roughness: 0.9 });
    this.armGroup = new THREE.Group();
    this.handGroup.add(this.armGroup);
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.075, 0.34, 10), sleeve);
    forearm.rotation.x = Math.PI / 2;
    forearm.position.set(0.02, -0.2, 0.18);
    this.armGroup.add(forearm);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.078, 0.05, 10), sleeve);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(0.0, -0.18, 0.03);
    this.armGroup.add(cuff);
    const wrist = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), skin);
    wrist.scale.set(1, 0.82, 1.18);
    wrist.position.set(0, -0.13, -0.02);
    wrist.rotation.x = 0.25;
    this.armGroup.add(wrist);
    const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), skin);
    thumb.position.set(-0.055, -0.09, -0.06);
    thumb.scale.set(1.4, 0.8, 0.9);
    this.armGroup.add(thumb);
    this.armGroup.visible = false;

    // knife in the right hand, shown while chopping
    this.knifeGroup = new THREE.Group();
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.012, 0.055),
      new THREE.MeshStandardMaterial({ color: 0xd8dde0, metalness: 0.9, roughness: 0.22 }),
    );
    blade.position.x = -0.05;
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.03, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.7 }),
    );
    handle.position.x = 0.13;
    this.knifeGroup.add(blade, handle);
    this.knifeGroup.position.set(0.02, -0.04, 0.02);
    this.knifeGroup.rotation.set(-0.9, 0.1, 0.15);
    this.knifeGroup.visible = false;
    this.handGroup.add(this.knifeGroup);

    this._refreshHandItem();
  }

  _refreshHandItem() {
    const carry = this.hands.carry;
    const uid = carry?.uid ?? null;
    if (uid === this.handUid) return;
    this.handUid = uid;
    this.handItemRoot.clear();
    if (!carry) return;
    const mesh = createItemMesh(carry);
    mesh.scale.setScalar(0.82);
    mesh.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false;
        o.receiveShadow = false;
      }
    });
    mesh.position.y = 0.02;
    mesh.rotation.set(0.15, -0.35, 0.1);
    this.handItemRoot.add(mesh);
    this.handPop = 1;
  }

  _bindSession() {
    this.unsubs = [];
    const on = (type, fn) => this.unsubs.push(this.session.events.on(type, fn));

    on('serve', (e) => {
      const anchor = this.kitchen.stoveAnchor('pass') || new THREE.Vector3(3.7, 1.2, -2.75);
      spawnConfetti(this.bits, new THREE.Vector3(3.7, 1.25, -2.7), 34);
      this.kitchen.ringBell();
      this.player.addTrauma(0.42);
    });

    on('chop:done', (e) => {
      const v = this.kitchen.stationVisuals.get('board');
      const pos = new THREE.Vector3(-3.2, 1.03, 0.3);
      const def = INGREDIENTS[e.item?.ingredient];
      spawnBits(this.bits, pos, def ? def.color : 0xaaaaaa, 9);
      this.player.addTrauma(0.12);
    });

    on('cook:done', (e) => {
      const pos = this.kitchen.stoveAnchor(e.stationId);
      if (pos) spawnSteam(this.steam, pos, 1.6);
      this.player.addTrauma(0.08);
    });

    on('cook:burn', (e) => {
      const pos = this.kitchen.stoveAnchor(e.stationId);
      if (pos) {
        for (let i = 0; i < 8; i++) spawnSmoke(this.bits, pos);
      }
      this.player.addTrauma(0.24);
    });

    on('order:expired', () => this.player.addTrauma(0.18));

    on('topping', (e) => {
      const pos = new THREE.Vector3(1.45, 1.02, 0.3);
      spawnSparks(this.steam, pos, 4);
    });

    on('trash', () => {
      spawnSmoke(this.bits, new THREE.Vector3(4.35, 0.9, 2.55));
    });

    on('dish:waste', () => this.player.addTrauma(0.12));
    on('dish:unwanted', () => this.player.addTrauma(0.12));
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  applySettings(settings) {
    this.settings = settings;
    this.player.applySettings(settings);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.pixelRatio = Math.min(2, dpr * (settings.quality || 1));
    this.renderer.setPixelRatio(this.pixelRatio);
    this.resize();
  }

  /* ------------------------------------------------------------- gameplay */

  findNearest() {
    const p = this.player.pos;
    const fwd = this.player.forwardVector(new THREE.Vector3());
    let best = null;
    let bestScore = Infinity;
    for (const def of STATIONS) {
      const dx = Math.max(def.x - def.w / 2 - p.x, 0, p.x - (def.x + def.w / 2));
      const dz = Math.max(def.z - def.d / 2 - p.z, 0, p.z - (def.z + def.d / 2));
      const dist = Math.hypot(dx, dz);
      if (dist > 1.55) continue;
      const toX = def.x - p.x;
      const toZ = def.z - p.z;
      const len = Math.hypot(toX, toZ) || 1;
      const dot = (toX / len) * fwd.x + (toZ / len) * fwd.z;
      if (dot < 0.05) continue;
      const score = dist - dot * 0.35;
      if (score < bestScore) {
        bestScore = score;
        best = def;
      }
    }
    return best;
  }

  update(dt) {
    this.time += dt;
    this.player.update(dt);
    this._refreshHandItem();

    const nearest = this.findNearest();
    this.nearestId = nearest?.id ?? null;
    this.activeStation = nearest;

    const st = nearest ? this.session.kitchen.getStation(nearest.id) : null;
    const hands = this.hands;

    // ---- chopping: hold E or LMB near a board with an unchopped ingredient
    let chopping = false;
    if (st?.kind === 'board' && st.item && !hands.carry) {
      const def = INGREDIENTS[st.item.ingredient];
      const choppable = def?.choppable && st.item.state !== 'chopped';
      if (choppable && this.player.chopHeld) {
        const result = this.session.chopTick('board', hands, dt);
        if (result?.active) {
          chopping = true;
          this.chopFxTimer -= dt;
          this.chopSoundTimer -= dt;
          if (this.chopFxTimer <= 0) {
            this.chopFxTimer = 0.17;
            spawnBits(this.bits, new THREE.Vector3(nearest.x, 1.03, nearest.z), def.color, 3);
          }
          if (this.chopSoundTimer <= 0) {
            this.chopSoundTimer = 0.32;
            this.audio?.play('chop');
            this.player.addTrauma(0.035);
          }
        }
      }
    }

    // ---- discrete interact
    if (this.player.consumeInteract()) {
      if (st) {
        const isUnchoppedBoard = st.kind === 'board' && st.item && !hands.carry && INGREDIENTS[st.item.ingredient]?.choppable && st.item.state !== 'chopped';
        if (!isUnchoppedBoard) {
          this.session.interact(st.id, hands);
        }
      } else {
        this.audio?.play('ui', { volume: 0.4 });
      }
    }

    // ---- presentation
    this.kitchen.update(dt, this.session, this.nearestId, this.player.pos);
    this._updateStoveFx(dt);
    this._updateHand(dt, chopping);
    this._updateBoard(chopping);

    this.steam.update(dt);
    this.bits.update(dt);
  }

  _updateStoveFx(dt) {
    this.steamTimer -= dt;
    let sizzling = 0;
    for (const id of ['stove1', 'stove2']) {
      const st = this.session.kitchen.getStation(id);
      if (!st?.item || st.item.type !== 'ingredient') continue;
      if (st.item.state === 'burnt') {
        if (this.steamTimer <= 0) {
          const pos = this.kitchen.stoveAnchor(id);
          if (pos) spawnSmoke(this.bits, pos);
        }
        continue;
      }
      sizzling++;
      if (this.steamTimer <= 0) {
        const pos = this.kitchen.stoveAnchor(id);
        if (pos) spawnSteam(this.steam, pos, 0.9 + Math.random() * 0.5);
      }
    }
    if (this.steamTimer <= 0) this.steamTimer = 0.16;
    this.sizzleLevel += ((sizzling > 0 ? 1 : 0) - this.sizzleLevel) * Math.min(1, dt * 6);
    this.audio?.setSizzle(this.sizzleLevel);
  }

  _updateHand(dt, chopping) {
    this.handGroup.position.set(
      0.34 + Math.sin(this.time * 1.3) * 0.006 + (this.player.isMoving ? Math.sin(this.player.bobPhase) * 0.014 : 0),
      -0.27 + Math.sin(this.time * 1.7) * 0.005 + (this.player.isMoving ? Math.cos(this.player.bobPhase * 2) * 0.01 : 0),
      -0.58,
    );

    if (this.handPop > 0) {
      this.handPop = Math.max(0, this.handPop - dt * 4.5);
      const s = 0.82 * (1 + this.handPop * 0.5);
      this.handItemRoot.scale.setScalar(s);
    } else {
      this.handItemRoot.scale.setScalar(0.82);
    }

    this.knifeGroup.visible = chopping;
    this.handItemRoot.visible = !chopping && !!this.hands.carry;
    this.armGroup.visible = chopping || !!this.hands.carry;
    if (chopping) {
      this.knifeGroup.rotation.x = -0.9 + Math.sin(this.time * 26) * 0.55;
      this.knifeGroup.position.y = -0.04 + Math.sin(this.time * 26) * 0.035;
    }
  }

  _updateBoard(chopping) {
    const v = this.kitchen.stationVisuals.get('board');
    if (!v?.itemRoot) return;
    if (chopping) {
      v.itemRoot.rotation.z = Math.sin(this.time * 34) * 0.025;
      v.itemRoot.position.y = 1.0 + Math.abs(Math.sin(this.time * 20)) * 0.004;
    } else {
      v.itemRoot.rotation.z *= 0.8;
      v.itemRoot.position.y = 1.0;
    }
    if (v.knife) v.knife.visible = !chopping;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  getPrompt() {
    if (!this.activeStation) return null;
    const st = this.session.kitchen.getStation(this.activeStation.id);
    const prompt = stationPrompt(st, this.hands, this.session.kitchen);
    if (!prompt) return null;
    const key = this.player.bindings.label('interact');
    const hint = (prompt.hint || '').replace(/E/g, key);
    if (st.kind === 'board' && st.item && !this.hands.carry) {
      const def = INGREDIENTS[st.item.ingredient];
      if (def?.choppable && st.item.state !== 'chopped') {
        return { ...prompt, key, hint };
      }
    }
    return { ...prompt, key, hint };
  }

  getCrosshairState() {
    const prompt = this.getPrompt();
    return {
      visible: true,
      interactable: !!this.activeStation,
      danger: !!prompt?.danger,
      chop: false,
    };
  }

  pause() {
    this.paused = true;
    this.player.setEnabled(false);
    this.player.exitLock();
    this.audio?.setSizzle(0);
  }

  resume() {
    this.paused = false;
    this.player.setEnabled(true);
    this.player.requestLock();
  }

  stop() {
    this.active = false;
    this.paused = true;
    this.player.setEnabled(false);
    this.player.exitLock();
    this.audio?.setSizzle(0);
    for (const un of this.unsubs || []) un();
    this.unsubs = [];
  }

  dispose() {
    this.stop();
    this.kitchen.dispose();
    this.steam.dispose();
    this.bits.dispose();
    this.player.dispose();
    this.envTexture?.dispose?.();
    this.renderer.dispose();
    this.scene.clear();
  }

  teleportToStation(id) {
    const def = STATION_BY_ID[id];
    if (!def) return;
    let px = def.x;
    let pz;
    if (def.z < -2) pz = def.z + 1.3;
    else if (def.z > 1.5) pz = def.z - 1.05;
    else pz = def.z + 1.3;
    // clamp to walkable area
    px = clamp(px, -4.5, 4.5);
    pz = clamp(pz, -3.1, 3.1);
    this.player.teleport(px, pz);
    this.player.lookAt(def.x, def.z);
    this.player.pitch = -0.26;
  }
}
