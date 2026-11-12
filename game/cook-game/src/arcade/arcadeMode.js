// 2D arcade mode: top-down kitchen, local co-op for two chefs.
// Shares the exact same kitchen rules as the 3D mode; only the presentation
// and the movement input differ.

import { STATIONS, STATION_BY_ID, INGREDIENTS, RECIPES, COLLIDERS, ROOM, SPAWN, recipeForToppings } from '../core/data.js';
import { createHands } from '../core/kitchen.js';
import { stationPrompt } from '../core/prompts.js';
import { getBindings, KeyboardInput, GamepadInput } from '../core/input.js';
import { TouchControls, isTouchDevice } from '../core/touch.js';

const RADIUS = 0.28;
const WALK = 3.35;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const PLAYER_COLORS = ['#ffb03a', '#7ad0a3'];
const PLAYER_DARK = ['#c97c12', '#3e8f68'];

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function itemEmoji(item) {
  if (!item) return '';
  if (item.type === 'plate') {
    const recipe = recipeForToppings(item.contents);
    return recipe ? recipe.emoji : item.contents.length ? '🍽️' : '🍽️';
  }
  if (item.state === 'burnt') return '🥩';
  return INGREDIENTS[item.ingredient]?.emoji || '❓';
}

export class ArcadeMode {
  constructor({ canvas, session, settings, players = 1, audio, onPauseRequest, onDeviceChange, touchEnabled = false }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.session = session;
    this.settings = settings;
    this.audio = audio;
    this.onPauseRequest = onPauseRequest;
    this.onDeviceChange = onDeviceChange;
    this.inputDevice = 'keyboard';
    this.playerCount = clamp(players, 1, 2);
    this.time = 0;
    this.paused = false;
    this.active = true;
    this.bindings = getBindings('arcade');
    this.keyboard = new KeyboardInput(this.bindings, {
      onDevice: (device) => this._setDevice(device),
    });
    this.pads = [new GamepadInput({ index: 0, onDevice: (d) => this._setDevice(d) }), new GamepadInput({ index: 1, onDevice: (d) => this._setDevice(d) })];
    this.touch = new TouchControls({ onPause: () => this.onPauseRequest?.(), onDevice: (d) => this._setDevice(d) });
    this.touchEnabled = !!touchEnabled;
    this.touch.setEnabled(this.touchEnabled);
    this.particles = [];
    this.shake = 0;
    this.steamTimer = 0;
    this.chopSoundTimer = 0;
    this.sizzle = 0;
    this.width = 1;
    this.height = 1;
    this.dpr = 1;
    this.scale = 100;
    this.cx = 0;
    this.cy = 0;
    this.unsubs = [];
    this.players = this._makePlayers(this.playerCount);
    this.nearest = new Map();

    this._bind();
    this._bindSession();
    this.resize();
  }

  _setDevice(device) {
    if (this.inputDevice === device) return;
    this.inputDevice = device;
    this.onDeviceChange?.(device);
  }

  get hands() {
    return this.players[0]?.hands ?? null;
  }

  _makePlayers(n) {
    const base = [
      {
        id: 0,
        name: 'P1',
        color: PLAYER_COLORS[0],
        dark: PLAYER_DARK[0],
        x: n === 2 ? -0.7 : 0,
        z: 2.45,
        vx: 0,
        vz: 0,
        face: -Math.PI / 2,
        hands: createHands(),
        actions: { up: 'p1Up', down: 'p1Down', left: 'p1Left', right: 'p1Right', interact: 'p1Interact' },
        interactQueued: false,
        chopTimer: 0,
        stepAccum: 0,
        bob: 0,
      },
    ];
    if (n === 2) {
      base.push({
        id: 1,
        name: 'P2',
        color: PLAYER_COLORS[1],
        dark: PLAYER_DARK[1],
        x: 0.7,
        z: 2.45,
        vx: 0,
        vz: 0,
        face: -Math.PI / 2,
        hands: createHands(),
        actions: { up: 'p2Up', down: 'p2Down', left: 'p2Left', right: 'p2Right', interact: 'p2Interact' },
        interactQueued: false,
        chopTimer: 0,
        stepAccum: 0,
        bob: 0,
      });
    }
    return base;
  }

  _bind() {
    this._onBlur = () => {
      this.keyboard.clear();
    };
    window.addEventListener('blur', this._onBlur);
  }

  _bindSession() {
    const on = (type, fn) => this.unsubs.push(this.session.events.on(type, fn));
    on('serve', () => {
      this._confetti(3.7, -2.7, 30);
      this.shake = Math.min(1, this.shake + 0.55);
      this.bellFlash = 1;
    });
    on('chop:done', (e) => {
      const st = STATION_BY_ID.board;
      this._bits(st.x, st.z, INGREDIENTS[e.item?.ingredient]?.color || '#aaaaaa', 7);
    });
    on('cook:done', () => {
      this._steam(3.7, -2.7);
      this.shake = Math.min(1, this.shake + 0.15);
    });
    on('cook:burn', (e) => {
      const st = STATION_BY_ID[e.stationId];
      if (st) {
        for (let i = 0; i < 8; i++) this._smoke(st.x, st.z);
      }
      this.shake = Math.min(1, this.shake + 0.25);
    });
    on('order:expired', () => {
      this.shake = Math.min(1, this.shake + 0.2);
    });
    on('topping', () => this.shake = Math.min(1, this.shake + 0.08));
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.dpr = dpr;
    this.width = w;
    this.height = h;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.scale = Math.min(w / 10.9, (h - 132) / 7.55);
    this.cx = w / 2;
    this.cy = h / 2 + 22;
  }

  applySettings(settings) {
    this.settings = settings;
    if (settings.touchControls) {
      let force = false;
      try {
        force = new URLSearchParams(location.search).get('touch') === '1';
      } catch {
        force = false;
      }
      const auto = isTouchDevice() || force;
      this.touchEnabled =
        settings.touchControls === 'on' || (settings.touchControls !== 'off' && auto);
      if (!this.paused) this.touch.setEnabled(this.touchEnabled);
    }
  }

  /* ------------------------------------------------------------- helpers */

  sx(x) {
    return this.cx + x * this.scale;
  }

  sy(z) {
    return this.cy + z * this.scale;
  }

  stationDistance(player, def) {
    const cx = clamp(player.x, def.x - def.w / 2, def.x + def.w / 2);
    const cz = clamp(player.z, def.z - def.d / 2, def.z + def.d / 2);
    return Math.hypot(player.x - cx, player.z - cz);
  }

  nearestStation(player) {
    let best = null;
    let bestD = 1.32;
    for (const def of STATIONS) {
      const d = this.stationDistance(player, def);
      if (d < bestD) {
        bestD = d;
        best = def;
      }
    }
    return best;
  }

  /* -------------------------------------------------------------- update */

  update(dt) {
    this.time += dt;
    const kitchen = this.session.kitchen;
    this.nearest.clear();
    this.keyboard.beginFrame();
    for (const pad of this.pads) pad.poll();
    if (this.pads.some((pad) => pad.pressedPause)) this.onPauseRequest?.();
    this.touch?.beginFrame?.();

    for (const p of this.players) {
      const pad = this.pads[p.id];
      let ix = 0;
      let iz = 0;
      if (this.keyboard.isDown(p.actions.up)) iz -= 1;
      if (this.keyboard.isDown(p.actions.down)) iz += 1;
      if (this.keyboard.isDown(p.actions.left)) ix -= 1;
      if (this.keyboard.isDown(p.actions.right)) ix += 1;
      const padState = pad.state;
      const padMag = Math.hypot(padState.moveX, padState.moveY);
      if (padMag > 0.12) {
        ix = padState.moveX;
        iz = padState.moveY;
      }
      if (p.id === 0 && this.touch?.active && this.touch.mag > 0.12) {
        ix = this.touch.x;
        iz = this.touch.y;
      }
      const len = Math.hypot(ix, iz) || 1;
      ix /= len;
      iz /= len;
      const k = 1 - Math.exp(-14 * dt);
      p.vx += (ix * WALK - p.vx) * k;
      p.vz += (iz * WALK - p.vz) * k;
      if (Math.abs(p.vx) < 0.01) p.vx = 0;
      if (Math.abs(p.vz) < 0.01) p.vz = 0;
      p.x += p.vx * dt;
      p.z += p.vz * dt;
      const moving = Math.hypot(p.vx, p.vz);
      if (moving > 0.3) {
        p.face = Math.atan2(p.vz, p.vx);
        p.bob += dt * 9;
        p.stepAccum += moving * dt;
        if (p.stepAccum > 1.7) {
          p.stepAccum = 0;
          this.audio?.play('step', { volume: 0.45 });
        }
      }
      this._resolve(p);
    }
    this._separatePlayers();

    for (const p of this.players) {
      const def = this.nearestStation(p);
      this.nearest.set(p.id, def);
      const pad = this.pads[p.id];
      const padHeld = pad.state.interact || pad.state.chop;
      const touchHeld = p.id === 0 && this.touch?.interactHeld;
      const held = this.keyboard.isDown(p.actions.interact) || padHeld || touchHeld;
      const pressed =
        this.keyboard.pressed(p.actions.interact) ||
        pad.pressedInteract ||
        p.interactQueued ||
        (p.id === 0 && this.touch?.pressedInteract);
      p.interactQueued = false;
      if (!def) continue;
      const st = kitchen.getStation(def.id);
      const isBoardChop =
        st?.kind === 'board' &&
        st.item &&
        !p.hands.carry &&
        INGREDIENTS[st.item.ingredient]?.choppable &&
        st.item.state !== 'chopped';

      if (isBoardChop && held) {
        const r = this.session.chopTick(def.id, p.hands, dt);
        if (r?.active) {
          this.chopSoundTimer -= dt;
          if (this.chopSoundTimer <= 0) {
            this.chopSoundTimer = 0.3;
            this.audio?.play('chop', { volume: 0.7 });
            this._bits(def.x, def.z, INGREDIENTS[st.item.ingredient].color, 2);
          }
        }
      } else if (pressed) {
        if (!isBoardChop) {
          this.session.interact(def.id, p.hands);
          this.shake = Math.min(1, this.shake + 0.04);
        }
      }
    }
    this.touch?.endFrame?.();

    this._updateParticles(dt);
    this._updateSteam(dt);
    this.shake = Math.max(0, this.shake - dt * 2.2);
    if (this.bellFlash) this.bellFlash = Math.max(0, this.bellFlash - dt * 1.8);

    let cooking = 0;
    for (const id of ['stove1', 'stove2']) {
      const st = kitchen.getStation(id);
      if (st?.item?.type === 'ingredient' && st.item.state !== 'burnt') cooking++;
      if (st?.item?.state === 'burnt') {
        // smoke handled via particles timer
      }
    }
    this.sizzle += ((cooking ? 1 : 0) - this.sizzle) * Math.min(1, dt * 6);
    this.audio?.setSizzle(this.sizzle);
  }

  _resolve(p) {
    const minX = ROOM.minX + RADIUS;
    const maxX = ROOM.maxX - RADIUS;
    const minZ = ROOM.minZ + RADIUS;
    const maxZ = ROOM.maxZ - RADIUS;
    p.x = clamp(p.x, minX, maxX);
    p.z = clamp(p.z, minZ, maxZ);
    for (let pass = 0; pass < 2; pass++) {
      for (const c of COLLIDERS) {
        const cx = clamp(p.x, c.minX, c.maxX);
        const cz = clamp(p.z, c.minZ, c.maxZ);
        let dx = p.x - cx;
        let dz = p.z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 >= RADIUS * RADIUS) continue;
        if (d2 < 1e-8) {
          const toLeft = p.x - c.minX;
          const toRight = c.maxX - p.x;
          const toBack = p.z - c.minZ;
          const toFront = c.maxZ - p.z;
          const min = Math.min(toLeft, toRight, toBack, toFront);
          if (min === toLeft) p.x = c.minX - RADIUS;
          else if (min === toRight) p.x = c.maxX + RADIUS;
          else if (min === toBack) p.z = c.minZ - RADIUS;
          else p.z = c.maxZ + RADIUS;
          continue;
        }
        const d = Math.sqrt(d2);
        const push = (RADIUS - d) / d;
        p.x += dx * push;
        p.z += dz * push;
      }
    }
  }

  _separatePlayers() {
    if (this.players.length < 2) return;
    const [a, b] = this.players;
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const d = Math.hypot(dx, dz);
    const minD = RADIUS * 2.15;
    if (d > 0 && d < minD) {
      const push = (minD - d) / 2;
      const nx = dx / d;
      const nz = dz / d;
      a.x -= nx * push;
      a.z -= nz * push;
      b.x += nx * push;
      b.z += nz * push;
    }
  }

  _updateSteam(dt) {
    this.steamTimer -= dt;
    if (this.steamTimer > 0) return;
    this.steamTimer = 0.08;
    for (const id of ['stove1', 'stove2']) {
      const st = this.session.kitchen.getStation(id);
      if (!st?.item || st.item.type !== 'ingredient') continue;
      if (st.item.state === 'burnt') this._smoke(st.x, st.z);
      else this._steam(st.x, st.z);
    }
  }

  getPrompt() {
    const p = this.players[0];
    if (!p) return null;
    const def = this.nearest.get(p.id);
    if (!def) return null;
    const st = this.session.kitchen.getStation(def.id);
    const prompt = stationPrompt(st, p.hands, this.session.kitchen);
    if (!prompt) return null;
    const key = this.bindings.primaryLabel('p1Interact');
    return { ...prompt, key, hint: (prompt.hint || '').replace(/E/g, key) };
  }

  getCrosshairState() {
    return { visible: false };
  }

  /* ------------------------------------------------------------ particles */

  _spawnParticle(opts) {
    if (this.particles.length > 260) this.particles.shift();
    this.particles.push(opts);
  }

  _steam(x, z) {
    this._spawnParticle({
      kind: 'steam',
      x: x + (Math.random() - 0.5) * 0.2,
      z: z + (Math.random() - 0.5) * 0.2,
      h: 0.2,
      vh: 0.5 + Math.random() * 0.3,
      life: 1.1 + Math.random() * 0.5,
      max: 1.6,
      size: 6 + Math.random() * 5,
      color: 'rgba(255,235,205,0.5)',
    });
  }

  _smoke(x, z) {
    this._spawnParticle({
      kind: 'smoke',
      x: x + (Math.random() - 0.5) * 0.15,
      z: z + (Math.random() - 0.5) * 0.15,
      h: 0.2,
      vh: 0.4 + Math.random() * 0.3,
      life: 1.2 + Math.random() * 0.5,
      max: 1.7,
      size: 8 + Math.random() * 6,
      color: 'rgba(40,32,28,0.55)',
    });
  }

  _bits(x, z, color, n = 4) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.8 + Math.random() * 1.4;
      this._spawnParticle({
        kind: 'bit',
        x,
        z,
        vx: Math.cos(a) * sp,
        vz: Math.sin(a) * sp,
        h: 0.4,
        vh: 1.2 + Math.random() * 1.2,
        life: 0.6,
        max: 0.6,
        size: 3 + Math.random() * 3,
        color,
      });
    }
  }

  _confetti(x, z, n = 24) {
    const colors = ['#ffb03a', '#e8503a', '#7ad0a3', '#ffe8c8', '#ff6f91', '#6fc7ff'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.8 + Math.random() * 2.2;
      this._spawnParticle({
        kind: 'confetti',
        x,
        z,
        vx: Math.cos(a) * sp,
        vz: Math.sin(a) * sp,
        h: 0.5,
        vh: 1.5 + Math.random() * 2,
        life: 1 + Math.random() * 0.6,
        max: 1.6,
        size: 3 + Math.random() * 4,
        color: colors[i % colors.length],
        rot: Math.random() * 6,
      });
    }
  }

  _updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.h += p.vh * dt;
      if (p.kind === 'bit' || p.kind === 'confetti') {
        p.vh -= 6 * dt;
        p.x += (p.vx || 0) * dt;
        p.z += (p.vz || 0) * dt;
        if (p.h < 0.02) {
          p.h = 0.02;
          p.vh *= -0.25;
        }
      }
    }
  }

  /* --------------------------------------------------------------- render */

  render() {
    const ctx = this.ctx;
    const { width: w, height: h, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // backdrop
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, 80, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    bg.addColorStop(0, '#241510');
    bg.addColorStop(0.55, '#140d0a');
    bg.addColorStop(1, '#0a0605');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const shakeX = (Math.random() - 0.5) * 14 * this.shake * this.shake;
    const shakeY = (Math.random() - 0.5) * 14 * this.shake * this.shake;
    ctx.save();
    ctx.translate(this.cx + shakeX, this.cy + shakeY);
    ctx.scale(this.scale, this.scale);

    this._drawRoom(ctx);
    this._drawKitchen(ctx);
    this._drawStationHighlights(ctx);
    this._drawStations(ctx);
    this._drawPlayers(ctx);
    this._drawParticles(ctx);

    ctx.restore();

    this._drawWorldLabels(ctx);
    this._drawPlayerPrompts(ctx);
  }

  /* world space drawing (1 unit = 1 metre) */

  _drawRoom(ctx) {
    const x1 = ROOM.minX;
    const x2 = ROOM.maxX;
    const z1 = ROOM.minZ;
    const z2 = ROOM.maxZ;

    // floor
    const floorGrad = ctx.createLinearGradient(0, z1, 0, z2);
    floorGrad.addColorStop(0, '#5f3527');
    floorGrad.addColorStop(1, '#7a4932');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(x1, z1, x2 - x1, z2 - z1);

    // tiles
    const tile = 0.5;
    for (let z = z1; z < z2; z += tile) {
      for (let x = x1; x < x2; x += tile) {
        const i = Math.round((x - x1) / tile);
        const j = Math.round((z - z1) / tile);
        ctx.fillStyle = (i + j) % 2 === 0 ? 'rgba(255,230,200,0.035)' : 'rgba(0,0,0,0.05)';
        ctx.fillRect(x + 0.01, z + 0.01, tile - 0.02, tile - 0.02);
      }
    }
    ctx.strokeStyle = 'rgba(20,10,6,0.3)';
    ctx.lineWidth = 0.02;
    for (let x = x1; x <= x2; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x, z1);
      ctx.lineTo(x, z2);
      ctx.stroke();
    }
    for (let z = z1; z <= z2; z += 1) {
      ctx.beginPath();
      ctx.moveTo(x1, z);
      ctx.lineTo(x2, z);
      ctx.stroke();
    }

    // rug
    ctx.fillStyle = '#7d2f24';
    roundRect(ctx, -1.3, 1.75, 2.6, 1.4, 0.12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,180,0.18)';
    ctx.lineWidth = 0.04;
    roundRect(ctx, -1.2, 1.85, 2.4, 1.2, 0.08);
    ctx.stroke();

    // night window on the left wall strip
    const win = ctx.createLinearGradient(x1, 0.8, x1, 2.5);
    win.addColorStop(0, '#0d1730');
    win.addColorStop(1, '#3c2c38');
    ctx.fillStyle = win;
    ctx.fillRect(x1, 0.9, 0.16, 2.0);

    // back wall band (sits outside the walkable floor, above the counter row)
    const wz = -4.2;
    const wallGrad = ctx.createLinearGradient(0, wz, 0, z1);
    wallGrad.addColorStop(0, '#0e1d19');
    wallGrad.addColorStop(1, '#1b352e');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(x1 - 0.28, wz, x2 - x1 + 0.56, z1 - wz);
    // subway tile pattern on the wall band
    ctx.strokeStyle = 'rgba(180,220,205,0.07)';
    ctx.lineWidth = 0.012;
    for (let x = x1; x <= x2; x += 0.38) {
      ctx.beginPath();
      ctx.moveTo(x, wz);
      ctx.lineTo(x, z1);
      ctx.stroke();
    }
    for (let z = wz + 0.18; z < z1; z += 0.2) {
      ctx.beginPath();
      ctx.moveTo(x1 - 0.28, z);
      ctx.lineTo(x2 + 0.28, z);
      ctx.stroke();
    }

    // neon sign on the back wall
    ctx.save();
    ctx.font = 'italic 900 0.34px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255,90,50,0.95)';
    ctx.shadowBlur = 0.22;
    ctx.fillStyle = 'rgba(255,150,100,0.95)';
    ctx.fillText('SIZZLE!', -2.7, wz + 0.34);
    ctx.shadowBlur = 0.05;
    ctx.fillStyle = '#fff0d8';
    ctx.fillText('SIZZLE!', -2.7, wz + 0.34);
    ctx.restore();

    // serving hatch in the wall above the pass counter
    const passGrad = ctx.createLinearGradient(0, wz, 0, z1);
    passGrad.addColorStop(0, '#100a07');
    passGrad.addColorStop(1, 'rgba(255,150,80,0.55)');
    ctx.fillStyle = passGrad;
    ctx.fillRect(2.9, wz + 0.09, 1.9, 0.5);
    ctx.strokeStyle = '#c08a3e';
    ctx.lineWidth = 0.03;
    ctx.strokeRect(2.9, wz + 0.09, 1.9, 0.5);
    this._drawWorldText(ctx, '上菜口', 3.85, wz + 0.36, 0.16, 'rgba(255,220,180,0.9)');

    // wall clock
    ctx.fillStyle = '#efe2c8';
    ctx.beginPath();
    ctx.arc(0.9, wz + 0.38, 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c08a3e';
    ctx.lineWidth = 0.025;
    ctx.stroke();
    ctx.strokeStyle = '#241610';
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    ctx.moveTo(0.9, wz + 0.38);
    ctx.lineTo(0.9, wz + 0.26);
    ctx.moveTo(0.9, wz + 0.38);
    ctx.lineTo(0.99, wz + 0.41);
    ctx.stroke();

    // walls
    ctx.fillStyle = '#1a100c';
    ctx.fillRect(x1 - 0.28, z2, x2 - x1 + 0.56, 0.28);
    ctx.fillRect(x1 - 0.28, wz, 0.28, z2 - wz);
    ctx.fillRect(x2, wz, 0.28, z2 - wz);

    ctx.strokeStyle = 'rgba(255,200,150,0.08)';
    ctx.lineWidth = 0.02;
    ctx.strokeRect(x1, z1, x2 - x1, z2 - z1);
  }

  _drawKitchen(ctx) {
    // counters from collider rects
    for (const c of COLLIDERS) {
      if (c.id === 'trash') continue;
      const w = c.maxX - c.minX;
      const d = c.maxZ - c.minZ;
      // drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      roundRect(ctx, c.minX + 0.06, c.minZ + 0.1, w, d, 0.1);
      ctx.fill();
      // body
      const grad = ctx.createLinearGradient(0, c.minZ, 0, c.maxZ);
      grad.addColorStop(0, '#9c6a3e');
      grad.addColorStop(0.55, '#7a4c2b');
      grad.addColorStop(1, '#5a351d');
      ctx.fillStyle = grad;
      roundRect(ctx, c.minX, c.minZ, w, d, 0.08);
      ctx.fill();
      ctx.strokeStyle = 'rgba(30,15,8,0.7)';
      ctx.lineWidth = 0.025;
      ctx.stroke();
      // top sheen
      ctx.fillStyle = 'rgba(255,235,200,0.12)';
      roundRect(ctx, c.minX + 0.04, c.minZ + 0.04, w - 0.08, d * 0.32, 0.05);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,210,0.16)';
      ctx.lineWidth = 0.012;
      roundRect(ctx, c.minX + 0.05, c.minZ + 0.05, w - 0.1, d - 0.1, 0.05);
      ctx.stroke();
    }

    // pass opening (drawn over the back counter)
    const x1 = 2.55;
    const x2 = 4.7;
    const z = -3.42;
    ctx.fillStyle = 'rgba(10,6,4,0.85)';
    ctx.fillRect(x1, z, x2 - x1, 0.3);
    ctx.fillStyle = 'rgba(255,170,100,0.2)';
    ctx.fillRect(x1 + 0.08, z + 0.05, x2 - x1 - 0.16, 0.2);
    ctx.strokeStyle = '#c08a3e';
    ctx.lineWidth = 0.03;
    ctx.strokeRect(x1, z, x2 - x1, 0.3);

    // trash bin
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(4.35, 2.62, 0.42, 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3b444a';
    ctx.beginPath();
    ctx.arc(4.35, 2.55, 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a949a';
    ctx.lineWidth = 0.03;
    ctx.stroke();
    ctx.fillStyle = '#0d0b09';
    ctx.beginPath();
    ctx.arc(4.35, 2.55, 0.24, 0, Math.PI * 2);
    ctx.fill();

    // serving bell
    ctx.fillStyle = '#d9a94d';
    ctx.beginPath();
    ctx.arc(4.15, -2.88, 0.07, 0, Math.PI * 2);
    ctx.fill();
    if (this.bellFlash > 0) {
      ctx.strokeStyle = `rgba(255,220,140,${this.bellFlash})`;
      ctx.lineWidth = 0.03;
      ctx.beginPath();
      ctx.arc(4.15, -2.88, 0.14 + (1 - this.bellFlash) * 0.35, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  _stationTopColor(def) {
    switch (def.kind) {
      case 'board':
        return ['#d8b072', '#b1854b'];
      case 'stove':
        return ['#3a4247', '#242a2e'];
      case 'counter':
        return ['#c9d1d5', '#8b979e'];
      case 'plateStack':
        return ['#e8dcc4', '#b8a88c'];
      default:
        return ['#8a5a34', '#5f3c21'];
    }
  }

  _drawStationHighlights(ctx) {
    for (const p of this.players) {
      const def = this.nearest.get(p.id);
      if (!def) continue;
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 0.045;
      ctx.setLineDash([0.12, 0.07]);
      ctx.lineDashOffset = -this.time * 1.5;
      roundRect(ctx, def.x - def.w / 2 - 0.08, def.z - def.d / 2 - 0.08, def.w + 0.16, def.d + 0.16, 0.08);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
  }

  _drawStations(ctx) {
    const kitchen = this.session.kitchen;
    for (const def of STATIONS) {
      const st = kitchen.getStation(def.id);
      const w = def.w * 0.86;
      const d = def.d * 0.86;
      const x = def.x - w / 2;
      const z = def.z - d / 2;

      if (def.kind === 'trash') {
        this._drawWorldText(ctx, def.label, def.x, def.z + 0.42, 0.16, 'rgba(247,232,208,0.6)');
        continue;
      }

      if (def.kind === 'crate') {
        // crate box
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        roundRect(ctx, x + 0.03, z + 0.06, w, d, 0.05);
        ctx.fill();
        const g = ctx.createLinearGradient(0, z, 0, z + d);
        g.addColorStop(0, '#b57d45');
        g.addColorStop(1, '#6d4424');
        ctx.fillStyle = g;
        roundRect(ctx, x, z, w, d, 0.05);
        ctx.fill();
        ctx.strokeStyle = 'rgba(40,20,10,0.7)';
        ctx.lineWidth = 0.02;
        ctx.stroke();
        // slats
        ctx.strokeStyle = 'rgba(40,22,12,0.45)';
        ctx.lineWidth = 0.015;
        for (let i = 1; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(x + 0.04, z + (d * i) / 3);
          ctx.lineTo(x + w - 0.04, z + (d * i) / 3);
          ctx.stroke();
        }
        // ingredient icon
        this._drawEmoji(ctx, INGREDIENTS[def.ingredient].emoji, def.x, def.z + 0.03, 0.34);
        this._drawWorldText(ctx, def.label, def.x, z + d + 0.2, 0.16, 'rgba(247,232,208,0.72)');
        continue;
      }

      // generic station pad
      const [c1, c2] = this._stationTopColor(def);
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      roundRect(ctx, x + 0.03, z + 0.06, w, d, 0.06);
      ctx.fill();
      const grad = ctx.createLinearGradient(0, z, 0, z + d);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      roundRect(ctx, x, z, w, d, 0.06);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,12,8,0.6)';
      ctx.lineWidth = 0.02;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 0.012;
      roundRect(ctx, x + 0.03, z + 0.03, w - 0.06, d - 0.06, 0.04);
      ctx.stroke();

      // station-specific details + items
      this._drawStationDetail(ctx, def, st, x, z, w, d);

      // label
      this._drawWorldText(ctx, def.label, def.x, z + d + 0.19, 0.155, 'rgba(247,232,208,0.68)');
    }
  }

  _drawStationDetail(ctx, def, st, x, z, w, d) {
    const kitchen = this.session.kitchen;

    if (def.kind === 'board') {
      // knife
      ctx.save();
      ctx.translate(def.x + 0.3, def.z + 0.15);
      ctx.rotate(-0.45);
      ctx.fillStyle = '#cfd6da';
      roundRect(ctx, -0.16, -0.025, 0.24, 0.05, 0.01);
      ctx.fill();
      ctx.fillStyle = '#3a2416';
      roundRect(ctx, 0.08, -0.02, 0.12, 0.04, 0.01);
      ctx.fill();
      ctx.restore();
    }

    if (def.kind === 'stove') {
      // pan
      ctx.fillStyle = '#1a1d1f';
      ctx.beginPath();
      ctx.arc(def.x, def.z, 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5c6569';
      ctx.lineWidth = 0.025;
      ctx.stroke();
      ctx.fillStyle = '#2d3438';
      ctx.beginPath();
      ctx.arc(def.x, def.z, 0.21, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3a2416';
      ctx.lineWidth = 0.06;
      ctx.beginPath();
      ctx.moveTo(def.x + 0.27, def.z);
      ctx.lineTo(def.x + 0.5, def.z);
      ctx.stroke();
      // flame glow
      if (st.item && st.item.state !== 'burnt') {
        const pulse = 0.55 + Math.sin(this.time * 9 + def.x) * 0.15;
        ctx.strokeStyle = `rgba(255,120,40,${0.5 * pulse})`;
        ctx.lineWidth = 0.05;
        ctx.beginPath();
        ctx.arc(def.x, def.z, 0.23, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (def.kind === 'plateStack') {
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 ? '#f4eee3' : '#e2d8c5';
        ctx.beginPath();
        ctx.ellipse(def.x, def.z + 0.06 - i * 0.03, 0.19, 0.13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(120,100,80,0.4)';
        ctx.lineWidth = 0.012;
        ctx.stroke();
      }
    }

    if (def.kind === 'counter') {
      // cutting mat
      ctx.fillStyle = 'rgba(255,240,210,0.1)';
      roundRect(ctx, def.x - 0.32, def.z - 0.24, 0.64, 0.48, 0.04);
      ctx.fill();
    }

    if (def.kind === 'pass') {
      this._drawEmoji(ctx, '🛎️', def.x + 0.45, def.z + 0.08, 0.26);
    }

    // item on station
    if (st.item) this._drawStationItem(ctx, def, st.item, kitchen);
  }

  _drawStationItem(ctx, def, item, kitchen) {
    const yOff = def.kind === 'stove' ? 0 : 0;
    if (item.type === 'plate') {
      ctx.fillStyle = '#f4eee3';
      ctx.beginPath();
      ctx.ellipse(def.x, def.z + yOff, 0.22, 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,100,80,0.5)';
      ctx.lineWidth = 0.015;
      ctx.stroke();
      const n = item.contents.length;
      const recipe = recipeForToppings(item.contents);
      if (n) {
        item.contents.slice(0, 6).forEach((t, i) => {
          const a = (i / Math.max(1, Math.min(6, n))) * Math.PI * 2;
          this._drawEmoji(ctx, INGREDIENTS[t.ingredient].emoji, def.x + Math.cos(a) * 0.09, def.z + Math.sin(a) * 0.06, 0.14);
        });
      }
      if (recipe) {
        this._drawEmoji(ctx, recipe.emoji, def.x, def.z - 0.02, 0.2);
        this._drawCheck(ctx, def.x + 0.24, def.z - 0.18, 0.09);
      }
      return;
    }

    const def2 = INGREDIENTS[item.ingredient];
    this._drawEmoji(ctx, item.state === 'burnt' ? '🥩' : def2.emoji, def.x, def.z + yOff, 0.3);
    if (item.state === 'burnt') {
      ctx.strokeStyle = 'rgba(232,80,58,0.9)';
      ctx.lineWidth = 0.03;
      ctx.beginPath();
      ctx.arc(def.x, def.z, 0.17, 0, Math.PI * 2);
      ctx.stroke();
      this._drawWorldText(ctx, '焦', def.x + 0.18, def.z - 0.16, 0.11, '#ff7a5e');
    } else if (item.state === 'cooked') {
      this._drawCheck(ctx, def.x + 0.18, def.z - 0.16, 0.08);
    }

    // cook progress ring
    if (def.kind === 'stove' && item.state !== 'burnt') {
      const p = kitchen.cookProgress(kitchen.getStation(def.id));
      ctx.strokeStyle = item.state === 'cooked' ? '#7ad0a3' : '#f6a623';
      ctx.lineWidth = 0.035;
      ctx.beginPath();
      ctx.arc(def.x, def.z, 0.32, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
      ctx.stroke();
    }

    // chop progress bar
    if (def.kind === 'board' && def2?.choppable && item.state !== 'chopped') {
      const p = Math.min(1, (item.chopProgress || 0) / def2.chopTime);
      const bw = 0.7;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(ctx, def.x - bw / 2, def.z - 0.42, bw, 0.08, 0.04);
      ctx.fill();
      ctx.fillStyle = '#f6a623';
      roundRect(ctx, def.x - bw / 2, def.z - 0.42, bw * p, 0.08, 0.04);
      ctx.fill();
    }
  }

  _drawCheck(ctx, x, z, r) {
    ctx.fillStyle = '#7ad0a3';
    ctx.beginPath();
    ctx.arc(x, z, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10241a';
    ctx.lineWidth = r * 0.28;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.45, z);
    ctx.lineTo(x - r * 0.1, z + r * 0.38);
    ctx.lineTo(x + r * 0.5, z - r * 0.4);
    ctx.stroke();
  }

  _drawPlayers(ctx) {
    for (const p of this.players) {
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.z + 0.12, RADIUS * 1.15, RADIUS * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      // highlight ring when target station exists
      const def = this.nearest.get(p.id);
      if (def) {
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 0.03;
        ctx.beginPath();
        ctx.arc(p.x, p.z, RADIUS + 0.08 + Math.sin(this.time * 5) * 0.02, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // body
      ctx.fillStyle = p.dark;
      ctx.beginPath();
      ctx.arc(p.x, p.z + 0.02, RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.z, RADIUS * 0.94, 0, Math.PI * 2);
      ctx.fill();
      // apron
      ctx.fillStyle = 'rgba(255,250,240,0.85)';
      roundRect(ctx, p.x - RADIUS * 0.55, p.z - RADIUS * 0.1, RADIUS * 1.1, RADIUS * 0.9, RADIUS * 0.3);
      ctx.fill();
      // head
      ctx.fillStyle = '#f0c9a0';
      ctx.beginPath();
      ctx.arc(p.x, p.z - RADIUS * 0.55, RADIUS * 0.52, 0, Math.PI * 2);
      ctx.fill();
      // hat
      ctx.fillStyle = '#fff8ec';
      roundRect(ctx, p.x - RADIUS * 0.44, p.z - RADIUS * 1.28, RADIUS * 0.88, RADIUS * 0.42, RADIUS * 0.18);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x - RADIUS * 0.26, p.z - RADIUS * 1.22, RADIUS * 0.24, 0, Math.PI * 2);
      ctx.arc(p.x + RADIUS * 0.02, p.z - RADIUS * 1.3, RADIUS * 0.28, 0, Math.PI * 2);
      ctx.fill();
      // facing marker
      ctx.fillStyle = 'rgba(20,10,5,0.55)';
      ctx.beginPath();
      ctx.arc(p.x + Math.cos(p.face) * RADIUS * 0.55, p.z + Math.sin(p.face) * RADIUS * 0.55, RADIUS * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // carried item above head
      if (p.hands.carry) {
        const bob = Math.sin(this.time * 4 + p.id) * 0.03;
        const item = p.hands.carry;
        if (item.type === 'plate') {
          ctx.fillStyle = '#f4eee3';
          ctx.beginPath();
          ctx.ellipse(p.x, p.z - RADIUS * 1.9 + bob, 0.22, 0.1, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        this._drawEmoji(ctx, itemEmoji(item), p.x, p.z - RADIUS * 2.0 + bob, 0.26);
      }

      // name badge
      ctx.font = '700 0.17px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = p.color;
      ctx.fillText(p.name, p.x, p.z + RADIUS * 1.5);
      // key hint for the first 14 seconds
      if (this.time < 14) {
        const keyLabel = this.bindings.primaryLabel(p.actions.interact);
        const kw = 0.5;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        roundRect(ctx, p.x - kw / 2, p.z + RADIUS * 1.68, kw, 0.2, 0.05);
        ctx.fill();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 0.012;
        ctx.stroke();
        ctx.fillStyle = 'rgba(247,232,208,0.9)';
        ctx.font = '700 0.12px "Microsoft YaHei", sans-serif';
        ctx.fillText(keyLabel, p.x, p.z + RADIUS * 1.78);
      }
    }
  }

  _drawParticles(ctx) {
    for (const p of this.particles) {
      const a = Math.max(0, Math.min(1, p.life / Math.min(0.45, p.max)));
      ctx.globalAlpha = a;
      if (p.kind === 'steam' || p.kind === 'smoke') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.z - p.h, p.size / 100, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.save();
        ctx.translate(p.x, p.z - p.h);
        ctx.rotate(p.rot || 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 200, -p.size / 200, p.size / 100, p.size / 100);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
  }

  _drawEmoji(ctx, emoji, x, z, size) {
    ctx.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, z);
  }

  _drawWorldText(ctx, text, x, z, size, color) {
    ctx.font = `700 ${size}px "Microsoft YaHei", "PingFang SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(text, x + 0.008, z + 0.012);
    ctx.fillStyle = color;
    ctx.fillText(text, x, z);
  }

  _drawWorldLabels(ctx) {
    // convert world labels to screen space for crispness
    const draw = (text, x, z, size, color, align = 'center') => {
      ctx.font = `700 ${size}px "Microsoft YaHei", "PingFang SC", sans-serif`;
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillText(text, x + 1, z + 2);
      ctx.fillStyle = color;
      ctx.fillText(text, x, z);
    };
    // nothing extra: station labels are drawn in world space for simplicity
  }

  _drawPlayerPrompts(ctx) {
    // P2 needs a canvas prompt since the DOM prompt bar belongs to P1.
    const p = this.players[1];
    if (!p) return;
    const def = this.nearest.get(p.id);
    if (!def) return;
    const st = this.session.kitchen.getStation(def.id);
    const prompt = stationPrompt(st, p.hands, this.session.kitchen);
    if (!prompt || prompt.blocked) return;
    const x = this.sx(def.x);
    const y = this.sy(def.z - def.d / 2) - 46;
    ctx.font = '700 12px "Microsoft YaHei", sans-serif';
    const w = Math.max(96, ctx.measureText(prompt.title).width + 42);
    ctx.fillStyle = 'rgba(18,11,8,0.88)';
    roundRect(ctx, x - w / 2, y - 17, w, 30, 8);
    ctx.fill();
    ctx.strokeStyle = PLAYER_COLORS[1];
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = PLAYER_COLORS[1];
    ctx.fillRect(x - w / 2 + 5, y - 12, 4, 20);
    ctx.fillStyle = '#f7e8d0';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '700 11px "Microsoft YaHei", sans-serif';
    ctx.fillText(this.bindings.primaryLabel('p2Interact'), x - w / 2 + 14, y - 2);
    ctx.fillStyle = 'rgba(247,232,208,0.85)';
    ctx.font = '700 12px "Microsoft YaHei", sans-serif';
    ctx.fillText(prompt.title, x - w / 2 + 56, y - 2);
  }

  pause() {
    this.paused = true;
    this.keyboard.setEnabled(false);
    this.touch.setEnabled(false);
    this.audio?.setSizzle(0);
  }

  resume() {
    this.paused = false;
    this.keyboard.setEnabled(true);
    this.touch.setEnabled(this.touchEnabled);
  }

  stop() {
    this.active = false;
    this.paused = true;
    for (const un of this.unsubs) un();
    this.unsubs = [];
    this.audio?.setSizzle(0);
  }

  dispose() {
    this.stop();
    this.keyboard.dispose();
    this.touch?.dispose?.();
    window.removeEventListener('blur', this._onBlur);
  }

  teleportToStation(id, playerIndex = 0) {
    const def = STATION_BY_ID[id];
    const p = this.players[playerIndex];
    if (!def || !p) return;
    let pz;
    if (def.z < -2) pz = def.z + 1.1;
    else if (def.z > 1.5) pz = def.z - 1.05;
    else pz = def.z + 1.15;
    p.x = clamp(def.x, -4.5, 4.5);
    p.z = clamp(pz, -3.1, 3.1);
    p.vx = p.vz = 0;
    p.face = Math.atan2(def.z - p.z, def.x - p.x);
  }
}
