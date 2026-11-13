/**
 * main.js — boot, menus, the fixed-step game loop and every system wire-up.
 *
 * URL flags (handy for testing and for sharing a specific world):
 *   ?autostart=1   skip the menu and start a fresh game
 *   ?quality=low|medium|high
 *   ?seed=12345    world seed
 *   ?time=18.5     starting hour
 *   ?weather=rain  force starting weather
 *   ?perf=1        show the performance readout
 *   ?view=third    start in third person
 */
import * as THREE from 'three';
import { Engine, QUALITY } from './core/engine.js';
import { Input } from './core/input.js';
import { Haptics } from './core/haptics.js';
import { SaveManager, defaultProfile } from './core/save.js';
import { clamp, clamp01, damp, formatClock, formatCoins, TAU } from './core/util.js';
import { World } from './world/world.js';
import { WORLD as WORLD_CONST, BIOME_COLORS_CSS, BIOME_LABELS, WATER_LEVEL, FEATURES } from './world/terrain.js';
import { Player } from './entities/player.js';
import { BoatManager } from './entities/boat.js';
import { Boat } from './entities/boat.js';
import { FishingSystem, STATE } from './fishing/fishing.js';
import { FightVisuals, sizeClass, deservesReveal } from './fishing/fightVisuals.js';
import { HUD } from './ui/hud.js';
import { Panels } from './ui/panels.js';
import { AudioEngine } from './ui/audio.js';
import { Minimap } from './ui/minimap.js';
import { FISH, fishById, RARITY } from './data/fish.js';
import { checkAchievements, applyCatch, trackQuests, MAX_LEVEL, xpForLevel, fishValue } from './systems/progression.js';
import { Tutorial, STEPS } from './systems/tutorial.js';
import { keepFish, cook, tickBuffs, activeBuffs, availableRecipes, buffMods, addBuff } from './systems/kitchen.js';
import { Contest } from './systems/contest.js';
import { Survival } from './systems/survival.js';
import { RivalRSI } from './systems/rsi.js';
import { BAITS, LURES, baitById, lureById } from './data/gear.js';

const VERSION = '6.3.0';

/** Photo-mode colour grades, applied to the canvas and baked into captures. */
const PHOTO_FILTERS = {
  none: { label: '原片', css: 'none' },
  vivid: { label: '鲜艳', css: 'saturate(1.45) contrast(1.08)' },
  warm: { label: '暖阳', css: 'sepia(0.28) saturate(1.25) brightness(1.05)' },
  noir: { label: '黑白', css: 'grayscale(1) contrast(1.2)' },
  film: { label: '胶片', css: 'sepia(0.18) contrast(1.12) saturate(0.9) brightness(0.98)' },
};
const DAY_LENGTH_DEFAULT = 24;

const params = new URLSearchParams(location.search);
const flag = (k, d = null) => (params.has(k) ? params.get(k) : d);
const numFlag = (k, d) => {
  const v = parseFloat(flag(k));
  return Number.isFinite(v) ? v : d;
};

const $ = (id) => document.getElementById(id);

/** Collects diagnostics for the headless verification run. */
const DIAG = {
  version: VERSION,
  ready: false,
  errors: [],
  warns: [],
  frames: 0,
  fps: 0,
  memMB: 0,
  jsHeapMB: 0,
  geometries: 0,
  textures: 0,
  calls: 0,
  triangles: 0,
  state: 'boot',
  catches: 0,
  casts: 0,
  level: 1,
  spots: 0,
  time: 0,
  weather: '',
  biome: '',
  playerPos: [0, 0, 0],
  worldSeed: 0,
  buildMs: 0,
  startedAt: performance.now(),
};
window.__DIAG = DIAG;

function pushError(msg, stack) {
  const entry = { msg: String(msg), stack: stack ? String(stack).slice(0, 900) : '', at: Math.round(performance.now()) };
  DIAG.errors.push(entry);
  if (DIAG.errors.length > 40) DIAG.errors.shift();
  const overlay = $('diag');
  if (overlay) overlay.textContent = JSON.stringify({ errors: DIAG.errors.slice(-6) }, null, 1);
  console.error('[game error]', msg, stack || '');
}

window.addEventListener('error', (e) => pushError(e.message, e.error?.stack));
window.addEventListener('unhandledrejection', (e) => pushError(`unhandled rejection: ${e.reason?.message || e.reason}`, e.reason?.stack));

class Game {
  constructor() {
    this.version = VERSION;
    this.mode = 'loading';
    this.paused = false;
    this.waypoint = null;
    this._noAdapt = flag('noadapt') === '1';
    this.saveManager = new SaveManager();
    this.profile = defaultProfile();
    this._accum = 0;
    this._last = performance.now();
    this._fpsRing = [];
    this._autosaveTimer = 0;
    this._diagTimer = 0;
    this._step = 1 / 60;
    this._menuAngle = 0;
    this.photo = { active: false, yaw: 0, pitch: -0.2, pos: new THREE.Vector3() };
    this._scratch = new THREE.Vector3();
  }

  // ------------------------------------------------------------------ boot

  async boot() {
    this.engine = new Engine($('app'), {
      quality: flag('quality', 'high'),
      fov: 72,
    });
    this.input = new Input(this.engine.canvas, { sensitivity: 1 });

    const loadFill = $('loadFill');
    const loadStatus = $('loadStatus');
    const setProgress = (p, label) => {
      if (loadFill) loadFill.style.width = `${Math.round(clamp01(p) * 100)}%`;
      if (loadStatus && label) loadStatus.textContent = label;
    };

    setProgress(0.01, '正在初始化引擎…');
    await new Promise((r) => requestAnimationFrame(r));

    const seed = numFlag('seed', 20240607);
    DIAG.worldSeed = seed;
    const t0 = performance.now();
    this.world = new World(this.engine, { seed });
    await this.world.build(setProgress);
    DIAG.buildMs = Math.round(performance.now() - t0);

    setProgress(0.97, '正在唤醒钓者…');
    await new Promise((r) => requestAnimationFrame(r));

    // ---- systems
    this.audio = new AudioEngine({
      master: this.profile.settings.volumeMaster,
      sfx: this.profile.settings.volumeSfx,
      ambience: this.profile.settings.volumeAmbience,
    });
    this.hud = new HUD(this);
    this.panels = new Panels(this);
    this.haptics = new Haptics({ enabled: this.profile.settings.haptics !== false, intensity: 1 });
    this.player = new Player(this.world, {
      x: FEATURES.spawn.x,
      z: FEATURES.spawn.z,
      viewMode: flag('view', 'first'),
    });
    this.fishing = new FishingSystem(this.world, this.player, this.profile);
    this.fightVisuals = new FightVisuals(this.world, this.engine);
    this.fightVisuals.attach(this.fishing);
    this.fightVisuals.on('sizeClass', (cls) => {
      this.hud.setSizeClass(cls);
      DIAG.lastSizeClass = cls.id;
    });
    this.fightVisuals.on('revealStart', ({ info, cls }) => {
      this.hud.showSizeBanner(cls, info);
      this.audio.play(info.fish.rarity >= 4 ? 'catch_rare' : 'achieve');
      this.haptics.pulse('levelup', 0.9);
      this.player.addShake(0.3, 1.2);
      this.fishing.revealLock = true;
      DIAG.reveals = (DIAG.reveals || 0) + 1;
    });
    this.fightVisuals.on('revealEnd', () => {
      this.fishing.revealLock = false;
    });
    // ---- whale sightings (v3.4.0)
    this.world.whales?.on('sighting', (info) => {
      const p = this.profile;
      if (!p.sightings) p.sightings = {};
      const first = !p.sightings[info.id];
      p.sightings[info.id] = { at: Date.now(), count: (p.sightings[info.id]?.count || 0) + 1 };
      p.stats.sightings = (p.stats.sightings || 0) + 1;
      this.audio.play('achieve');
      this.hud.showToast(`${info.icon} 目击 · ${info.name}`, first ? '第一次见到它浮出水面 · 已记录进图鉴' : `距离 ${Math.round(info.dist)} m`);
      this.hud.notify(`${info.name} 在 ${Math.round(info.dist)} 米外喷水`, 'gold');
      DIAG.sightings = (DIAG.sightings || 0) + 1;
    });
    this.boats = new BoatManager(this.world, this.world.spots);
    this.world.boats = this.boats;
    this.minimap = new Minimap($('minimap'), {      worldSize: WORLD_CONST.size,
      waterLevel: WATER_LEVEL,
      heightAt: (x, z) => this.world.terrain.heightAt(x, z),
      biomeAt: (x, z) => this.world.terrain.biomeAt(x, z),
      colors: BIOME_COLORS_CSS,
      spots: this.world.spots,
      yawOffset: Math.PI,
    });
    this.minimap.setMode('local');

    // ---- starting conditions
    const startTime = numFlag('time', 6.4);
    this.world.sky.setTime(startTime);
    this.world.sky.dayLengthMinutes = DAY_LENGTH_DEFAULT;
    const startWeather = flag('weather', null);
    if (startWeather) this.world.weather.set(startWeather, true);

    this._wireEvents();
    this.tutorial = new Tutorial(this);
    // ---- survival rules (v4.x): hunger / health / sanity / warmth
    this.survival = new Survival(this);
    this.survival.onDeath = (info) => this._onDeath(info);
    // ---- RSI: the rival angler that improves itself every day (v6.0.0)
    this.rsi = new RivalRSI(this);
    this.rsi.init(this.world);
    this._rsiDay = Math.floor(this.world?.sky?.dayCount ?? 0);
    this.contest = new Contest(this);
    this.contest.on('finish', (res) => {
      const me = res.table.find((e) => e.you);
      this.hud.showToast(
        res.rank === 1 ? '🏆 比赛冠军！' : `比赛第 ${res.rank} 名`,
        `得分 ${me?.score || 0} · 奖金 ${res.prize} 金币`,
        5
      );
      this.audio.play(res.rank === 1 ? 'achieve' : 'ui_close');
      this.checkAchievements();
    });
    this.contest.on('start', () => {
      this.hud.showToast('比赛开始！', '3 分钟内钓到的鱼按重量与稀有度计分');
      this.audio.play('bell');
    });
    this.applySettings(this.profile.settings, true);
    checkAchievements(this.profile);

    // ---- attract-mode camera
    this._setupMenuCamera();

    // ---- menus
    const peek = this.saveManager.peek();
    const btnContinue = $('btnContinue');
    if (btnContinue) {
      const has = !!peek;
      btnContinue.disabled = !has;
      if (has) {
        btnContinue.textContent = `继续游戏 · Lv.${peek.level} · ${peek.species} 种鱼`;
      } else {
        btnContinue.textContent = '继续游戏（暂无存档）';
      }
    }
    const menuVersion = $('menuVersion');
    if (menuVersion) menuVersion.textContent = `v${VERSION}`;
    $('loading')?.classList.add('hidden');
    $('menu')?.classList.remove('hidden');

    $('btnNew')?.addEventListener('click', () => this.startNewGame());
    $('btnContinue')?.addEventListener('click', () => this.continueGame());
    $('btnHelp')?.addEventListener('click', () => {
      $('helpPanel')?.classList.remove('hidden');
      $('menu')?.classList.add('hidden');
    });
    $('btnHelpClose')?.addEventListener('click', () => {
      $('helpPanel')?.classList.add('hidden');
      $('menu')?.classList.remove('hidden');
    });

    // any click resumes the audio context (browser autoplay policy)
    const resumeAudio = () => {
      this.audio.init();
      this.audio.setVolume('master', this.profile.settings.volumeMaster);
      window.removeEventListener('pointerdown', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
    };
    window.addEventListener('pointerdown', resumeAudio);
    window.addEventListener('keydown', resumeAudio);

    this._setupPointerLock();

    DIAG.ready = true;
    DIAG.state = 'menu';
    DIAG.spots = this.world.spots.length;
    DIAG.playerPos = [this.player.position.x, this.player.position.y, this.player.position.z];

    if (flag('perf') === '1') {
      this.hud.togglePerf(true);
      this.profile.settings.showPerf = true;
    }
    if (flag('autostart') === '1') {
      this.startNewGame();
    } else {
      this.mode = 'menu';
      this.updateMenuCamera(0);
    }

    this._last = performance.now();
    requestAnimationFrame((t) => this.loop(t));
    return this;
  }

  _setupMenuCamera() {
    const lake = FEATURES.lake;
    this._menuCenter = new THREE.Vector3(lake.x, 14, lake.z);
    this._menuRadius = 150;
    this._menuHeight = 42;
  }

  updateMenuCamera(dt) {
    this._menuAngle += dt * 0.055;
    const cam = this.engine.camera;
    const a = this._menuAngle;
    cam.position.set(
      this._menuCenter.x + Math.cos(a) * this._menuRadius,
      this._menuHeight + Math.sin(a * 0.7) * 4,
      this._menuCenter.z + Math.sin(a) * this._menuRadius
    );
    cam.lookAt(this._menuCenter.x - Math.cos(a) * 30, 4 + Math.sin(a * 0.9) * 2, this._menuCenter.z - Math.sin(a) * 30);
  }

  // ------------------------------------------------------------------ wiring

  _wireEvents() {
    const hud = this.hud;
    const fishing = this.fishing;

    fishing.on('fightEvent', (e) => {
      if (e.phase === 'telegraph') {
        this.audio.play('reel_tick', { volume: 0.35, rate: 1.9 });
        this.haptics.pulse('nibble', 0.8);
      } else if (e.phase === 'active') {
        this.audio.play('line_stress', { volume: 0.55, rate: 1.15 });
        this.haptics.pulse('run', 0.7);
        this.player.addShake(0.16, 2.2);
      } else if (e.phase === 'countered') {
        this.audio.play('reel_tick', { volume: 0.4, rate: 0.8 });
        this.haptics.pulse('nibble', 0.5);
      }
    });
    fishing.on('jump', (e) => {
      this.audio.play('splash');
      this.player.addShake(0.34, 1.8);
      this.haptics.pulse('splash', 0.9);
      if (this.fightVisuals) {
        const b = this.fishing.bobberPos;
        this.fightVisuals._spawnSplash(b.x, b.z, 2.2);
        this.fightVisuals._thrash = 1;
      }
    });
    fishing.on('cast', () => {
      this.audio.play('cast');
      DIAG.casts++;
    });
    fishing.on('splash', (e) => {
      this.audio.play(e.power > 0.66 ? 'splash' : 'splash_small');
      this.haptics.pulse('splash', 0.4 + e.power * 0.6);
    });
    fishing.on('bite', () => {
      this.audio.play('bite');
      hud.setCrosshairHot(true);
      this.audio.setAmbienceIntensity(0.9);
      this.haptics.pulse('bite', 1);
      this.player.addShake(0.12, 3);
    });
    fishing.on('hooked', (e) => {
      this.audio.play('hook');
      hud.setCrosshairHot(false);
      this.haptics.pulse('hook', e.danger ? 1 : 0.7);
      this.player.addShake(e.big ? 0.26 : 0.14, 2.6);
      hud.notify(`中鱼！${e.fish.name}（约 ${e.weight.toFixed(1)} kg）${e.danger ? ' · 线太细，小心！' : ''}`, e.danger ? 'bad' : '');
      hud.notify(`卸力已设定 ${Math.round(e.drag * 100)}%${e.drag < 0.45 ? ' · 会频繁出线' : ''}`, '');
    });
    fishing.on('missed', () => hud.notify('错过了提竿时机…', 'bad'));
    fishing.on('escape', (e) => {
      this.audio.play('escape');
      this.haptics.setContinuous(false);
      hud.notify(e.outOfLine ? `${e.fish.name} 把线拉光跑掉了` : `${e.fish.name} 脱钩了`, 'bad');
    });
    fishing.on('snap', (e) => {
      this.audio.play('snap');
      this.haptics.setContinuous(false);
      this.haptics.pulse('snap', 1);
      this.player.addShake(0.75, 1.2);
      hud.notify(`鱼线断裂！${e.fish.name} 逃走了`, 'bad');
    });
    fishing.on('nibble', () => {
      this.audio.play('reel_tick', { volume: 0.25, rate: 1.6 });
      this.haptics.pulse('nibble', 0.7);
    });
    fishing.on('reelTick', () => this.audio.play('reel_tick', { volume: 0.3, rate: 1.25 }));
    fishing.on('run', (e) => {
      this.audio.play('line_stress', { volume: 0.5 });
      this.haptics.pulse('run', e.power);
      this.player.addShake((e.big ? 0.34 : 0.18) * (e.power || 1), 2.3);
      this._fightRecoil = Math.min(1, (this._fightRecoil || 0) + 0.35 * (e.power || 1));
    });
    fishing.on('dragChanged', (e) => {
      this.audio.play('reel_tick', { volume: 0.4, rate: 0.8 });
      this.haptics.pulse('nibble', 0.4);
      const pct = Math.round(e.drag * 100);
      let hint = '';
      if (e.user <= 0.25) hint = ' · 卸力很松，鱼会一直出线';
      else if (e.user >= 0.95 && e.dragMax < 0.45) hint = ' · 线组上限低，注意别崩线';
      hud.notify(`卸力 ${pct}%${hint}`, '');
    });
    fishing.on('dragSlip', (e) => {
      this.haptics.setContinuous(e.on, 0.45, 0.6);
      if (e.on) this.audio.play('reel_fast', { volume: 0.5, rate: 1.5 });
    });
    fishing.on('dragTick', (e) => {
      this._dragTickTimer = (this._dragTickTimer || 0) + 1 / 60;
      this.haptics.setContinuous(true, 0.35 + e.slip * 0.5, 0.4 + e.slip * 0.5);
      // throttled ratchet so the clutch literally "screams" while it pays line
      if (this._dragTickTimer > 0.1) {
        this._dragTickTimer = 0;
        this.audio.play('reel_fast', { volume: 0.22 + e.slip * 0.22, rate: 1.25 + e.slip * 0.5 });
      }
    });
    fishing.on('pump', () => {
      this.audio.play('reel_tick', { volume: 0.4, rate: 0.9 });
      this.haptics.pulse('nibble', 0.5);
    });
    fishing.on('lineStress', () => this.audio.play('line_stress', { volume: 0.25 }));
    fishing.on('castFailed', () => hud.notify('抛到岸上了，换个方向', 'bad'));
    fishing.on('enteredWater', (ctx) => {
      const name = ctx.spot?.name || BIOME_LABELS[ctx.biome] || '开阔水域';
      if (ctx.spot) {
        const first = !this.profile.spots?.[ctx.spot.id];
        hud.notify(`浮漂落水：${name}（水深 ${ctx.depth.toFixed(1)} m）`, first ? 'gold' : '');
        if (first) {
          this.profile.spots = this.profile.spots || {};
          this.profile.spots[ctx.spot.id] = { discovered: true, at: Date.now() };
          this.world.discover(ctx.spot.id);
          this.checkAchievements();
        }
      }
    });
    fishing.on('catch', (info) => {
      DIAG.catches++;
      this.audio.play(info.fish.rarity >= 4 ? 'catch_rare' : 'catch');
      this.haptics.pulse('catch', info.fish.rarity >= 4 ? 1 : 0.6);
      this.haptics.setContinuous(false);
      this.player.addShake(info.fish.rarity >= 4 ? 0.5 : 0.25, 1.6);
      hud.showCatch(info);      if (info.released) {
        hud.notify(`放生了 ${info.fish.name} · +${info.xp} 经验`, 'good');
      } else {
        keepFish(this.profile, info);
        if (info.junk) hud.notify(`钓上了 ${info.fish.name}…`, 'bad');
        else hud.notify(`+${formatCoins(info.value)} 金币 · +${info.xp} 经验 · 已放入保鲜网`, 'gold');
      }
      if (this.contest?.active) {
        const pts = this.contest.addCatch(info);
        if (pts) hud.notify(`比赛 +${pts} 分`, 'gold');
      }
      this._syncAquarium();
      // ---- v2.7.0: record celebration
      if (info.newRecord && !info.junk) {
        const better = info.weight >= 4 || info.fish.rarity >= 4;
        if (better) {
          this.audio.play('achieve');
          this.haptics.pulse('levelup', 0.7);
          hud.showToast(info.newSpecies ? '★ 新物种收录' : '★ 个人最佳', `${info.fish.icon} ${info.fish.name} · ${info.weight.toFixed(2)} kg`);
        }
      }
    });
    fishing.on('levelUp', (e) => {
      this.audio.play('level_up');
      hud.showToast(`等级提升！Lv.${e.level}`, '解锁了新的鱼种与装备');
      hud.notify(`升到 ${e.level} 级，奖励金币`, 'gold');
    });
    fishing.on('achievement', (a) => {
      this.audio.play('achieve');
      hud.showToast(`${a.icon} 成就达成`, `${a.name} · ${a.desc}`);
    });
    fishing.on('questDone', (q) => {
      hud.notify(`任务完成：${q.name}（${q.reward.coins} 金币）`, 'good');
    });
    fishing.on('baitEmpty', (id) => hud.notify(`${baitById(id).name} 用完了`, 'bad'));

    this.player.on('step', (surface) => {
      this.audio.play(`footstep_${surface}`, { volume: 0.5 });
    });
    this.player.on('jump', () => this.audio.play('jump'));
    this.player.on('hardLanding', () => this.audio.play('land'));

    this.world.weather.on('change', (e) => {
      this.audio.setWeather(this.world.weather.kind);
      hud.notify(`天气转为${e.label}`, '');
    });
    this.world.weather.on('lightning', () => this.audio.play('thunder'));

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.audio.setEnabled(false);
        if (this.mode === 'playing') this.saveGame();
      } else {
        this.audio.setEnabled(true);
      }
    });
    window.addEventListener('beforeunload', () => {
      if (this.mode === 'playing' || this.mode === 'paused') this.saveGame();
    });
  }

  // ------------------------------------------------------------------ flow

  /**
   * Adopt a profile object everywhere that caches a reference to it. Systems
   * built during boot hold the original object, so a plain reassignment of
   * `this.profile` would leave them writing to an orphaned profile.
   */
  _useProfile(profile) {
    this.profile = profile;
    this.fishing?.setProfile(profile);
    return profile;
  }

  startNewGame() {
    this._useProfile(defaultProfile());
    this._normalizeProfile();
    this._applyProfileToWorld();
    this._enterWorld();
    this.hud.showToast('新的旅程', '在湖畔小屋前开始你的钓鱼生涯');
    this.hud.setHint('WASD 移动 · 鼠标 视角 · F 抛竿 · Tab 背包 · M 地图', 8);
    this._requestPointerLock?.();
    this.saveGame(true);
  }

  continueGame() {
    const state = this.saveManager.load();
    if (!state) {
      this.startNewGame();
      return;
    }
    this._useProfile(state);
    this._normalizeProfile();
    this._applyProfileToWorld();
    this._enterWorld();
    this.hud.notify('欢迎回来', 'good');
  }

  _applyProfileToWorld() {
    const p = this.profile;
    p.settings.dayLengthMin = p.settings.dayLengthMin || DAY_LENGTH_DEFAULT;
    this.world.sky.dayLengthMinutes = p.settings.dayLengthMin;
    if (typeof p.timeOfDay === 'number') this.world.sky.setTime(p.timeOfDay);
    if (typeof p.dayCount === 'number') this.world.sky._days = p.dayCount;
    if (p.weather) this.world.weather.set(p.weather, true);
    this.applySettings(p.settings, true);
    this.fishing.equip({ rod: p.rod, line: p.line, lure: p.lure });

    // spawn position
    const pos = p.position;
    if (pos && Number.isFinite(pos.x)) {
      this.player.teleport(pos.x, pos.z);
      if (Number.isFinite(pos.y)) this.player.position.y = Math.max(pos.y, this.world.terrain.heightAt(pos.x, pos.z));
      if (Number.isFinite(p.yaw)) this.player.yaw = p.yaw;
      if (Number.isFinite(p.pitch)) this.player.pitch = p.pitch;
    } else {
      this.player.teleport(FEATURES.spawn.x, FEATURES.spawn.z);
    }
    this.player.setViewMode(p.settings.viewMode || 'first');

    // restore discovered spots and their records
    for (const s of this.world.spots) {
      const rec = p.spots?.[s.id];
      if (rec) {
        s.discovered = true;
        s.bestWeight = rec.bestWeight || 0;
        s.bestId = rec.bestId || null;
        s.catches = rec.catches || 0;
      }
    }
    this.minimap.setSpots(this.world.spots);
    this.minimap.setDiscovered(this.world.spots.filter((s) => s.discovered).map((s) => s.id));
    this.boats.restore(p.boats);
    checkAchievements(p);
  }

  _normalizeProfile() {
    const p = this.profile;
    const d = defaultProfile();
    p.settings = { ...d.settings, ...(p.settings || {}) };
    p.stats = { ...d.stats, ...(p.stats || {}) };
    p.bait = p.bait || { worm: 10, bread: 5 };
    p.lures = p.lures || [];
    p.ownedRods = p.ownedRods || [];
    p.ownedLines = p.ownedLines || [];
    p.journal = p.journal || {};
    p.records = p.records || {};
    p.achievements = p.achievements || {};
    p.quests = p.quests || { active: [], done: [] };
    p.spots = p.spots || {};
    p.baitId = p.baitId ?? (p.bait.worm ? 'worm' : 'bread');
  }

  _enterWorld() {
    this.mode = 'playing';
    DIAG.state = 'playing';
    $('menu')?.classList.add('hidden');
    $('hud')?.classList.remove('hidden');
    this.player.canMove = true;
    this.panels.close();
    this._syncAquarium();
    if (!this.profile.settings.tutorialDone) this.tutorial?.start();
    this.minimap.setDiscovered(this.world.spots.filter((s) => s.discovered).map((s) => s.id));
    this.audio.init();
    this.audio.setEnabled(true);
    this.audio.setAmbience(this.world.weather.ambientKind);
    this.audio.setWeather(this.world.weather.kind);
    this.audio.setAmbienceIntensity(0.7);
    this._refreshPointerLockHint?.();
    this.saveGame(true);
  }

  quitToMenu() {
    this.saveGame(true);
    this.mode = 'menu';
    DIAG.state = 'menu';
    this.panels.close();
    this._lastGrid = null;
    if (this.gridHelper) {
      this.engine.scene.remove(this.gridHelper);
      this.gridHelper = null;
    }
    $('hud')?.classList.add('hidden');
    $('menu')?.classList.remove('hidden');
    const peek = this.saveManager.peek();
    const btn = $('btnContinue');
    if (btn && peek) {
      btn.disabled = false;
      btn.textContent = `继续游戏 · Lv.${peek.level} · ${peek.species} 种鱼`;
    }
    this.input.exitLock();
    this._setupMenuCamera();
  }

  resetSave() {
    this.saveManager.clear();
    this._useProfile(defaultProfile());
    this._normalizeProfile();
    this.startNewGame();
    this.hud.notify('存档已清空', 'good');
  }

  // ------------------------------------------------------------------ saving

  saveGame(manual = false) {
    if (this.mode !== 'playing' && this.mode !== 'paused') return false;
    const p = this.profile;
    p.timeOfDay = this.world.timeOfDay;
    p.dayCount = this.world.sky.dayCount;
    p.weather = this.world.weather.kind;
    p.position = { x: this.player.position.x, y: this.player.position.y, z: this.player.position.z };
    p.yaw = this.player.yaw;
    p.pitch = this.player.pitch;
    p.settings.viewMode = this.player.viewMode;
    p.boats = this.boats.serialize();
    const spotSave = {};
    for (const s of this.world.spots) {
      if (!s.discovered) continue;
      const existing = p.spots?.[s.id];
      spotSave[s.id] = {
        discovered: true,
        catches: s.catches || 0,
        bestWeight: Math.max(s.bestWeight || 0, existing?.bestWeight || 0),
        bestId: s.bestId || existing?.bestId || null,
        at: existing?.at || Date.now(),
      };
    }
    p.spots = { ...(p.spots || {}), ...spotSave };
    const ok = this.saveManager.save(p);
    if (ok && manual) this.audio.play('save');
    return ok;
  }

  applySettings(s, initial = false) {
    this.engine.setQuality(s.quality || 'high');
    if (!s.shadows) {
      this.engine.renderer.shadowMap.enabled = false;
      this.world.sky.key.castShadow = false;
    }
    // feel settings (v2.0.0)
    if (this.haptics) {
      this.haptics.setEnabled(s.haptics !== false);
      this.haptics.setIntensity(clamp(s.shake ?? 1, 0, 2));
    }
    if (this.player) {
      this.player.shakeEnabled = (s.shake ?? 1) > 0.01;
      this.player.shakeScale = clamp(s.shake ?? 1, 0, 2);
    }
    this.engine.setFov(s.fov ?? 72);
    this.engine.setRenderScale(s.renderScale ?? 1);
    this.input.sensitivity = s.sensitivity ?? 1;
    this.input.invertY = !!s.invertY;
    this.player.sensitivity = s.sensitivity ?? 1;
    this.player.invertY = !!s.invertY;
    this.world.sky.dayLengthMinutes = s.dayLengthMin ?? DAY_LENGTH_DEFAULT;
    this.hud.setMinimapVisible(s.showMinimap !== false);
    this.hud.togglePerf(!!s.showPerf);
    this.world.setWildlife(s.wildlife !== false);
    if (s.volumeMaster !== undefined) this.audio.setVolume('master', s.volumeMaster);
    if (s.volumeSfx !== undefined) this.audio.setVolume('sfx', s.volumeSfx);
    if (s.volumeAmbience !== undefined) this.audio.setVolume('ambience', s.volumeAmbience);
    if (!initial && s.treeDensity !== undefined) this.world.setTreeDensity(s.treeDensity);
  }

  setQuality(name) {
    this.profile.settings.quality = name;
    const q = this.engine.setQuality(name);
    this.world.setQuality(q);
    this.audio.play('ui_click');
  }

  checkAchievements() {
    const unlocked = checkAchievements(this.profile);
    for (const a of unlocked) {
      this.audio.play('achieve');
      this.hud.notify(`成就：${a.icon} ${a.name}`, 'gold');
    }
    return unlocked;
  }

  togglePhotoMode() {
    this.photo.active = !this.photo.active;
    DIAG.state = this.photo.active ? 'photo' : 'playing';
    $('hud')?.classList.toggle('hidden', this.photo.active);
    if (this.photo.active) {
      this.photo.pos.copy(this.engine.camera.position);
      this.photo.yaw = this.player.yaw;
      this.photo.pitch = this.player.pitch;
      this.input.exitLock();
      this.hud.showToast('拍照模式', 'WASD 移动 · Space/Ctrl 升降 · Shift 加速 · P 退出');
    } else {
      this.audio.play('ui_close');
    }
  }

  // ------------------------------------------------------------------ input

  handleGlobalKeys() {
    const input = this.input;
    if (this.photo.active) {
      if (input.actionPressed('photo')) this.togglePhotoMode();
      // in photo mode: F shoots, 1-5 pick a filter, H hides the UI
      if (input.actionPressed('interact')) this._pendingCapture = true;
      const filters = Object.keys(PHOTO_FILTERS);
      for (let i = 0; i < filters.length; i++) {
        if (input.justPressed(`Digit${i + 1}`)) this.setPhotoFilter(filters[i]);
      }
      if (input.justPressed('KeyH')) {
        this.photo.hideUi = !this.photo.hideUi;
        this.hud.root.classList.toggle('hidden', this.photo.hideUi);
        this.minimap.setMode(this.minimap.getMode());
      }
      if (input.actionPressed('pause')) this.togglePhotoMode();
      return;
    }
    if (input.actionPressed('contest')) {
      if (this.contest.active) {
        const res = this.contest.finish();
        if (res) this.hud.showToast('比赛提前结束', `第 ${res.rank} 名 · 奖金 ${res.prize}`);
      } else {
        const res = this.contest.start(180);
        if (!res.ok) {
          this.audio.play('ui_error');
          this.hud.notify(res.error, 'bad');
        }
      }
    }
    if (input.actionPressed('viewToggle')) {
      this.player.toggleView();
      this.audio.play('ui_click');
      this.hud.notify(this.player.viewMode === 'first' ? '第一人称' : '第三人称', '');
      this.tutorial?.notifyViewToggle();
    }
    if (input.actionPressed('photo')) this.togglePhotoMode();
    // 出海 charter (v3.2.0): T takes you to the best offshore mark you have
    // unlocked, or brings you home if you are already out there.
    if (input.actionPressed('seaTrip')) {
      if (this.fishing.state !== STATE.IDLE) this.fishing.cancel('charter');
      const res = this.charterOffshore();
      if (!res.ok && res.error === 'coins') this.hud.notify('先去卖点鱼攒够船费', '');
    }
    // 召唤小船 (v3.3.0)
    if (input.actionPressed('summon')) {
      const res = this.summonBoat();
      if (!res.ok && res.error === 'already-aboard') this.hud.notify('已经在船上了 · B 下船', '');
    }
    // 生存：吃鱼 / 睡觉 (v4.0.0)
    if (input.actionPressed('eat')) this.eatFromNet();
    if (input.actionPressed('sleep')) {
      const r = this.sleepAtCabin();
      if (!r.ok) this.hud.notify('要回到篝火旁才能休息', 'bad');
    }
    if (input.actionPressed('boat')) {
      const wasAboard = !!this.boats.mounted;
      if (this.boats.toggle(this.player)) {
        this.audio.play(wasAboard ? 'land' : 'wood_creak');
        this.hud.notify(wasAboard ? '上岸' : '上船 · WASD 划桨，Shift 加速，B 下船', wasAboard ? '' : 'good');
        if (!wasAboard) this.fishing.cancel('board');
      } else if (!wasAboard) {
        this.hud.notify('附近没有可乘坐的小船', 'bad');
      } else {
        this.hud.notify('离岸太远，先划到浅水区', 'bad');
      }
    }
    if (input.justPressed('F1')) {
      this.profile.settings.showPerf = !this.profile.settings.showPerf;
      this.hud.togglePerf(this.profile.settings.showPerf);
    }
    if (input.actionPressed('inventory')) {
      this.panels.toggle('journal');
    } else if (input.actionPressed('map')) {
      this.panels.toggle('map');
    } else if (input.actionPressed('cook')) {
      this.panels.toggle('kitchen');
    } else if (input.actionPressed('pause')) {
      if (this.panels.isOpen) this.panels.close();
      else this.panels.open('settings');
    }
    // quick gear slots
    if (!this.panels.isOpen) {
      if (input.actionPressed('slot1')) this.cycleBait();
      if (input.actionPressed('slot2')) this.cycleLure();
      if (input.actionPressed('slot3')) {
        this.profile.baitId = null;
        this.hud.notify('已取下鱼饵', '');
        this.audio.play('ui_click');
      }
      if (input.justPressed('KeyN')) {
        this.minimap.setMode(this.minimap.getMode() === 'local' ? 'world' : 'local');
        this.audio.play('ui_click');
      }
    }
  }

  cycleBait(dir = 1) {
    const p = this.profile;
    const list = BAITS.filter((b) => (p.bait?.[b.id] || 0) > 0);
    if (!list.length) {
      this.hud.notify('没有鱼饵了，去商店买一些', 'bad');
      return;
    }
    const idx = list.findIndex((b) => b.id === p.baitId);
    const next = list[(idx + dir + list.length * 2) % list.length];
    p.baitId = next.id;
    p.lure = 'none';
    this.fishing.equip({ rod: p.rod, line: p.line, lure: 'none' });
    this.hud.notify(`鱼饵：${next.icon} ${next.name} ×${p.bait[next.id]}`, '');
    this.audio.play('ui_click');
  }

  cycleLure() {
    const p = this.profile;
    const list = [LURES[0], ...LURES.filter((l) => (p.lures || []).includes(l.id))];
    const idx = list.findIndex((l) => l.id === p.lure);
    const next = list[(idx + 1) % list.length];
    p.lure = next.id;
    if (next.id !== 'none') p.baitId = null;
    this.fishing.equip({ rod: p.rod, line: p.line, lure: p.lure });
    this.hud.notify(`拟饵：${next.icon} ${next.name}`, '');
    this.audio.play('ui_click');
  }

  // ------------------------------------------------------------------ loop

  loop(now) {
    requestAnimationFrame((t) => this.loop(t));
    const rawDt = (now - this._last) / 1000;
    this._last = now;
    const dt = clamp(Number.isFinite(rawDt) ? rawDt : 0.016, 0, 0.1);

    // ---- fps sampling
    this._fpsRing.push(dt);
    if (this._fpsRing.length > 60) this._fpsRing.shift();
    const avg = this._fpsRing.reduce((a, b) => a + b, 0) / this._fpsRing.length;
    const fps = avg > 0 ? 1 / avg : 0;
    DIAG.fps = Math.round(fps * 10) / 10;
    DIAG.frames++;

    const playing = this.mode === 'playing' && !this.panels.isOpen;

    if (this.mode === 'menu') {
      this.updateMenuCamera(dt);
      this.world.update(dt * 0.35, this.engine.camera, this._menuCenter);
      this.audio.update(dt);
    } else if (playing || this.photo.active) {
      this.handleGlobalKeys();
      if (this.photo.active) {
        this._updatePhotoCamera(dt);
      } else {
        // fixed-step physics, slowed while the big-fish reveal plays
        const tScale = this.fightVisuals ? this.fightVisuals.timeScale : 1;
        this._accum += dt * tScale;
        let steps = 0;
        while (this._accum >= this._step && steps < 5) {
          this.boats.update(this._step, this.input, this.player, this.world.env);
          this.player.update(this._step, this.input, this.engine.camera);
          this.fishing.update(this._step, this.input);
          this._accum -= this._step;
          steps++;
        }
        if (steps === 5) this._accum = 0;
        this.world.update(dt * tScale, this.engine.camera, this.player.position);
        this.fightVisuals?.update(dt, this.engine.camera, this.player.position);
        this._updateFightAudio(dt);
        this._updateFightCamera(dt);
        this._updateGrade();
        this._updateSeaWay();
        this.survival.update(dt, { player: this.player, world: this.world });
        this._updateRSI();
        this._refreshPointerLockHint?.();
        this._updateAudio(dt);
        this._updateAutosave(dt);
        this._updateProgression(dt);
        if (!this._noAdapt) this._updateAdaptiveQuality(dt, fps);
      }
      this.hud.update(dt, {
        player: this.player,
        world: this.world,
        fishing: this.fishing,
        profile: this.profile,
        survival: this.survival ? this.survival.snapshot() : null,
        fps,
        frameMs: avg * 1000,
        renderer: this.engine.resourceStats(),
      });
      this.minimap.update({
        px: this.player.position.x,
        pz: this.player.position.z,
        yaw: this.player.yaw,
        activeSpotId: this.world.activeSpot(this.player.position.x, this.player.position.z, this.profile.level)?.id || null,
      });
      this.audio.update(dt);
    } else {
      // paused behind a panel: keep the world alive but frozen in time
      this.hud.update(dt, {
        player: this.player,
        world: this.world,
        fishing: this.fishing,
        profile: this.profile,
        survival: this.survival ? this.survival.snapshot() : null,
        fps,
        frameMs: avg * 1000,
        renderer: this.engine.resourceStats(),
      });
      this.audio.update(dt);
    }

    this.engine.render();
    // haptics decay independently of gameplay state so rumble always settles
    this.haptics?.update(dt);
    // captures must happen in the same frame as the render (no preserved buffer)
    if (this._pendingCapture) {
      this._pendingCapture = false;
      this._lastCapture = this.capturePhoto();
    }
    this._updateDiag(dt, fps, avg * 1000);
    this.input.endFrame();
  }

  _updatePhotoCamera(dt) {
    const p = this.photo;
    const look = this.input.takeLook();
    p.yaw -= look.dx * 0.0022;
    p.pitch = clamp(p.pitch - look.dy * 0.0022, -1.5, 1.5);
    // keyboard fallback (v4.4.0) — same keys as normal play
    if (this.input.isDown('BracketLeft')) p.yaw += 1.9 * dt;
    if (this.input.isDown('BracketRight')) p.yaw -= 1.9 * dt;
    if (this.input.isDown('Comma')) p.pitch = clamp(p.pitch + 1.4 * dt, -1.5, 1.5);
    if (this.input.isDown('Period')) p.pitch = clamp(p.pitch - 1.4 * dt, -1.5, 1.5);
    const speed = (this.input.action('sprint') ? 42 : 14) * dt;
    const mv = this.input.moveVector();
    const forward = new THREE.Vector3(-Math.sin(p.yaw) * Math.cos(p.pitch), Math.sin(p.pitch), -Math.cos(p.yaw) * Math.cos(p.pitch));
    const right = new THREE.Vector3(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
    p.pos.addScaledVector(forward, mv.z * speed);
    p.pos.addScaledVector(right, mv.x * speed);
    if (this.input.action('jump')) p.pos.y += speed;
    if (this.input.isDown('ControlLeft')) p.pos.y -= speed;
    const cam = this.engine.camera;
    cam.position.copy(p.pos);
    cam.lookAt(p.pos.x + forward.x, p.pos.y + forward.y, p.pos.z + forward.z);
  }

  _updateAudio(dt) {
    const cam = this.engine.camera;
    const underwater = cam.position.y < WATER_LEVEL;
    const region = this.world.regionAt(cam.position.x, cam.position.z);
    let ambience = this.world.weather.ambientKind;
    if (underwater) ambience = 'underwater';
    else if (region === 'lake' || region === 'pond') ambience = 'lake';
    else if (region === 'swamp') ambience = 'forest';
    else if (region === 'ocean_deep' || region === 'ocean_shallow' || region === 'coast' || region === 'reef' || region === 'estuary') ambience = 'shore';
    if (this._ambience !== ambience) {
      this._ambience = ambience;
      this.audio.setAmbience(ambience);
    }
    const night = this.world.env?.night ?? 0;
    if (night > 0.5 && !underwater && ambience !== 'storm' && ambience !== 'rain') {
      this.audio.setAmbience(this.world.weather.kind === 'clear' ? 'night' : ambience);
    }
    this.audio.setAmbienceIntensity(underwater ? 0.5 : 0.75 - night * 0.15);
    if (underwater !== this._wasUnderwater) {
      this._wasUnderwater = underwater;
      this.audio.play(underwater ? 'dive' : 'surface_gasp', { volume: 0.6 });
    }
  }

  _updateProgression(dt) {
    this.profile.stats.playtime = (this.profile.stats.playtime || 0) + dt;
    this.profile.stats.distance = this.player.distanceWalked;
    this.profile.stats.swimTime = this.player.swimTime;
    this.profile.stats.deepest = Math.max(this.profile.stats.deepest || 0, this.player.deepest);
    this._progTimer = (this._progTimer || 0) + dt;
    if (this._progTimer > 4) {
      this._progTimer = 0;
      this.checkAchievements();
      this.minimap.setDiscovered(this.world.spots.filter((s) => s.discovered).map((s) => s.id));
    }
  }

  _updateTutorial(dt) {
    if (!this.tutorial) return;
    this.tutorial.update(dt, {
      player: this.player,
      world: this.world,
      fishing: this.fishing,
      profile: this.profile,
      panelsOpen: this.panels.isOpen,
      panelTab: this.panels.tab,
    });
  }

  /** Expire finished meals and surface the active ones. */
  _updateBuffs(dt) {
    this._buffTimer = (this._buffTimer || 0) + dt;
    if (this._buffTimer < 1) return;
    this._buffTimer = 0;
    const expired = tickBuffs(this.profile);
    for (const b of expired) {
      this.hud.notify(`${b.name} 效果结束`, '');
      this.fishing._gear = null;
    }
    const active = activeBuffs(this.profile);
    this.hud.setBuffs(active);
  }

  /** Cook at the campfire. Returns a result object for tests/UI. */
  cookAtFire(recipeId) {
    const near = this.nearCampfire();
    if (!near && !this._debugIgnoreFire) return { ok: false, error: '要先走到篝火旁' };
    const res = cook(this.profile, recipeId);
    if (res.ok) {
      this.fishing._gear = null;
      this.audio.play('achieve');
      this.hud.notify(`做好了 ${res.recipe.name}（用了 ${res.used.name} ${res.used.weight.toFixed(2)} kg）`, 'good');
      this.hud.setBuffs(activeBuffs(this.profile));
      this.checkAchievements();
      if (this.panels.isOpen) this.panels.refresh();
    } else {
      this.audio.play('ui_error');
      this.hud.notify(res.error, 'bad');
    }
    return res;
  }

  nearCampfire() {
    const f = this.world.props?.campfire;
    if (!f) return false;
    return Math.hypot(this.player.position.x - f.x, this.player.position.z - f.z) < 4.5;
  }

  /** Mirror the player's biggest catches into the cabin trophy tank. */
  _syncAquarium() {
    const props = this.world.props;
    if (!props?.setAquariumFish) return;
    const records = this.profile.records || {};
    const list = Object.entries(records)
      .map(([id, weight]) => ({ id, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
    const sig = list.map((e) => `${e.id}:${e.weight}`).join(',');
    if (sig === this._aquariumSig) return;
    this._aquariumSig = sig;
    props.setAquariumFish(list);
  }

  /** Capture the current frame into the photo gallery (called after render). */
  capturePhoto() {
    const canvas = this.engine.canvas;
    const w = 384;
    const h = Math.max(1, Math.round((canvas.height / canvas.width) * w));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.filter = PHOTO_FILTERS[this.photo.filter]?.css || 'none';
    try {
      ctx.drawImage(canvas, 0, 0, w, h);
    } catch (err) {
      return { ok: false, error: String(err) };
    }
    let url;
    try {
      url = c.toDataURL('image/jpeg', 0.72);
    } catch (err) {
      return { ok: false, error: String(err) };
    }
    const p = this.profile;
    if (!p.photos) p.photos = [];
    p.photos.unshift({
      url,
      filter: this.photo.filter,
      at: Date.now(),
      spot: this.world.activeSpot(this.player.position.x, this.player.position.z, p.level)?.name || this.world.biomeLabel(this.world.biomeAt(this.player.position.x, this.player.position.z)),
      time: formatClock(this.world.timeOfDay),
      weather: this.world.weather.label,
    });
    while (p.photos.length > 10) p.photos.pop();
    this.audio.play('ui_click');
    this.hud.notify(`已保存照片（${p.photos.length}/10）`, 'good');
    if (this.panels.isOpen && this.panels.tab === 'gallery') this.panels.refresh();
    return { ok: true, count: p.photos.length, filter: this.photo.filter };
  }

  setPhotoFilter(name) {
    if (!PHOTO_FILTERS[name]) return false;
    this.photo.filter = name;
    this.engine.canvas.style.filter = PHOTO_FILTERS[name].css;
    this.hud.notify(`滤镜：${PHOTO_FILTERS[name].label}`, '');
    return true;
  }

  _updateLantern(dt) {
    if (!this.lantern) {
      const light = new THREE.PointLight(0xffc98a, 0, 26, 2);
      this.engine.dynamicGroup.add(light);
      this.lantern = light;
    }
    const night = this.world.env?.night ?? 0;
    const underwater = this.engine.camera.position.y < WATER_LEVEL;
    const want = (!underwater && night > 0.25 ? 1.9 : 0) * (this.profile.settings.lantern === false ? 0 : 1);
    this.lantern.intensity = damp(this.lantern.intensity, want, 2.5, dt);
    this.lantern.position.set(this.player.position.x, this.player.position.y + 2.0, this.player.position.z);
  }

  _updateContest(dt) {
    if (!this.contest) return;
    this.contest.update(dt);
    const line = this.contest.hudLine;
    this.hud.setContest(line ? { ...line, entry: this.contest.entry } : null);
  }

  /** Continuous fight sound texture: line creak + reel ratchet (v2.4.0). */
  _updateFightAudio(dt) {
    const s = this.fishing?.getHudState?.();
    if (!s || s.state !== 'fight') {
      this._creakT = 0;
      this._ratchetT = 0;
      return;
    }
    this._creakT = (this._creakT || 0) + dt;
    const creakGap = 0.62 - clamp01(s.tension) * 0.34 - (s.wear || 0) * 0.1;
    if (this._creakT >= creakGap) {
      this._creakT = 0;
      this.audio.play('line_stress', { volume: 0.1 + clamp01(s.tension) * 0.22, rate: 1.5 - clamp01(s.tension) * 0.4 });
    }
    const reeling = this.fishing.forceReel ?? (this.input.mouse.left || this.input.action('reelAlt'));
    this._ratchetT = (this._ratchetT || 0) + dt;
    if (reeling) {
      const gap = 0.16 - (1 - (s.stamina ?? 1)) * 0.07;
      if (this._ratchetT >= gap) {
        this._ratchetT = 0;
        this.audio.play('reel_tick', { volume: 0.16 + (1 - (s.stamina ?? 1)) * 0.12, rate: 1.15 + (1 - (s.stamina ?? 1)) * 0.7 });
      }
    }
  }

  /** Fight camera choreography (v2.5.0): tension-tracking FOV + run recoil. */
  _updateFightCamera(dt) {
    if (this.fightVisuals?.revealing) return;
    const base = this.profile.settings.fov ?? 72;
    const s = this.fishing?.getHudState?.();
    let target = base;
    if (s && s.state === 'fight') {
      const ten = clamp01(s.tension || 0);
      // narrow while you load the rod, breathe out when the clutch slips
      target = base - 2.5 - ten * 4 + (s.slipping ? 4 : 0);
      if (this._fightRecoil > 0) {
        target += this._fightRecoil * 5;
        this._fightRecoil = Math.max(0, this._fightRecoil - dt * 3.2);
      }
    } else if (s && s.state === 'bite') {
      target = base - 1.5;
    }
    this._fovCurrent = damp(this._fovCurrent ?? base, target, 2.6, dt);
    const cam = this.engine.camera;
    if (Math.abs(cam.fov - this._fovCurrent) > 0.01) {
      cam.fov = this._fovCurrent;
      cam.updateProjectionMatrix();
    }
  }

  /** Sun glare overlay + vignette driven by the golden-hour factor (v3.0.0). */
  _updateGrade() {
    const el = this.hud.el.grade;
    if (!el) return;
    const env = this.world.env || {};
    const golden = clamp01(env.golden ?? 0);
    if (golden <= 0.02) {
      if ((this._gradeOpacity || 0) > 0.004) {
        this._gradeOpacity = 0;
        el.style.opacity = '0';
      }
      return;
    }
    const cam = this.engine.camera;
    // Is the sun in front of the camera? (clip-space z is unreliable at the
    // far plane, so test the direction, then project a near point for screen xy.)
    const sunDir = this.world.sky.sunDir;
    const fwd = this._camFwd || (this._camFwd = new THREE.Vector3());
    cam.getWorldDirection(fwd);
    const facing = sunDir.dot(fwd);
    let opacity = 0;
    if (facing > 0.05) {
      const v = this._sunScreen || (this._sunScreen = new THREE.Vector3());
      v.copy(sunDir).multiplyScalar(400).add(cam.position).project(cam);
      const gx = clamp(v.x * 0.5 + 0.5, -0.2, 1.2) * 100;
      const gy = clamp(-v.y * 0.5 + 0.5, -0.2, 1.2) * 100;
      el.style.setProperty('--gx', `${gx.toFixed(1)}%`);
      el.style.setProperty('--gy', `${gy.toFixed(1)}%`);
      // fade toward the frame edges
      const edge = clamp01(1 - (Math.abs(v.x) - 0.7) / 0.8) * clamp01(1 - (Math.abs(v.y) - 0.8) / 0.8);
      opacity = golden * edge * 0.62;
    }
    if (Math.abs((this._gradeOpacity || -1) - opacity) > 0.004) {
      this._gradeOpacity = opacity;
      el.style.opacity = opacity.toFixed(3);
    }
    const dbg = this._gradeDebug || (this._gradeDebug = { golden: 0, facing: 0, opacity: 0, edgeLess: false });
    dbg.golden = +golden.toFixed(3);
    dbg.facing = +facing.toFixed(3);
    dbg.opacity = +opacity.toFixed(3);
    dbg.edgeLess = !(facing > 0.05);
  }

  /**
   * 出海 (v3.2.0): charter a boat straight out to the best offshore mark you can
   * reach. The fare scales with the sea state, because rough water is exactly
   * when the market pays best — and exactly when the trip is dangerous.
   */
  charterOffshore() {
    const p = this.profile;
    const w = this.world;
    const OFFSHORE = ['ocean_shallow', 'reef', 'ocean_deep', 'ocean_cliff'];
    const candidates = OFFSHORE.map((id) => w.spots.find((s) => s.id === id)).filter((s) => s && p.level >= (s.minLevel || 1));
    if (!candidates.length) {
      this.hud.notify('等级不足：近海渔场需要 9 级', 'bad');
      this.audio.play('ui_error');
      return { ok: false, error: 'level' };
    }
    // highest-tier mark the player has unlocked
    const spot = candidates[candidates.length - 1];
    const sea = w.seaState;
    const fee = Math.round(30 + sea * 140);
    if (p.coins < fee) {
      this.hud.notify(`出海费 ${fee} 金币，不够了`, 'bad');
      this.audio.play('ui_error');
      return { ok: false, error: 'coins', fee };
    }
    // already out there? then this is the way home
    if (this._charterBoat && this.player.mounted === this._charterBoat) return this.returnToDock();

    const a = spot.anchor;
    const boat = new Boat(w, { id: 'charter', x: a[0], z: a[1], angle: (spot.dockAngle ?? 0) + Math.PI });    this.boats.boats.push(boat);
    this._charterBoat = boat;
    this._charterSpot = spot;
    this._charterOrigin = { x: this.player.position.x, z: this.player.position.z };
    boat.board(this.player);
    p.coins -= fee;
    p.stats.charters = (p.stats.charters || 0) + 1;
    this.audio.play('boat_push');
    this.hud.showToast(
      `出海 · ${spot.name}`,
      `船费 ${fee} 金币 · ${w.seaLabel.label} · 今日鱼价 ×${w.priceMultiplier}`
    );
    this.hud.notify(`水深 ${Math.max(4, Math.round(w.depthAt(a[0], a[1])))} m · 风浪越大鱼越贵`, 'gold');
    DIAG.charters = (DIAG.charters || 0) + 1;
    return { ok: true, spot: spot.id, fee, sea: +sea.toFixed(2), price: w.priceMultiplier };
  }

  /** Row the charter boat back to where you boarded it. */
  returnToDock() {
    const boat = this._charterBoat;
    const riding = this.player.mounted;
    if (!riding) return { ok: false, error: 'not-aboard' };
    const origin = this._charterOrigin || null;
    this.player.mounted = null;
    riding.aboard = false;
    if (origin) {
      this.player.teleport(origin.x, origin.z);
    } else {
      const land = this.world.terrain.findLand(riding.position.x, riding.position.z, 30);
      this.player.teleport(land.x, land.z);
    }
    this.player.canMove = true;
    this.player.angler.setPose('idle');
    if (boat && riding === boat) {
      const i = this.boats.boats.indexOf(boat);
      if (i >= 0) this.boats.boats.splice(i, 1);
      boat.dispose?.();
      this._charterBoat = null;
    }
    this.audio.play('ui_close');
    this.hud.notify('已返航', '');
    return { ok: true };
  }

  /**
   * 召唤小船 (v3.3.0): bring a rowboat to the nearest fishable water and board
   * it. This is the "just get me on the water" key — no walking to a mooring.
   */
  summonBoat() {
    const p = this.player;
    const w = this.world;
    if (p.mounted) return { ok: false, error: 'already-aboard' };
    if (this.fishing.state !== STATE.IDLE) this.fishing.cancel('summon');
    // find water close to the player, preferring something deep enough to float
    const px = p.position.x;
    const pz = p.position.z;
    let spot = null;
    for (let d = 2; d <= 26 && !spot; d += 2) {
      for (let i = 0; i < 16 && !spot; i++) {
        const a = (i / 16) * Math.PI * 2;
        const x = px + Math.cos(a) * d;
        const z = pz + Math.sin(a) * d;
        if (w.isWater(x, z) && w.depthAt(x, z) > 1.1) spot = { x, z };
      }
    }
    if (!spot) {
      this.hud.notify('附近没有可以下水的地方', 'bad');
      this.audio.play('ui_error');
      return { ok: false, error: 'no-water' };
    }
    // reuse a boat that is already on the water, else build one
    let boat = this.boats.boats.find((b) => !b.aboard) || null;
    if (!boat) {
      boat = new Boat(w, { id: `row-${this.boats.boats.length}`, x: spot.x, z: spot.z });
      this.boats.boats.push(boat);
    } else {
      boat.placeAt(spot.x, spot.z, Math.atan2(px - spot.x, pz - spot.z));
    }
    boat.board(this.player);
    this.audio.play('wood_creak');
    this.hud.notify('小船已靠岸 · WASD 划桨，Shift 加速，G 召回，B 下船', 'good');
    this.hud.showToast('上船', '向海里划：深海钓场在岛的西侧外海');
    DIAG.summoned = (DIAG.summoned || 0) + 1;
    return { ok: true, boat: boat.id, at: [+spot.x.toFixed(1), +spot.z.toFixed(1)] };
  }

  /** Nearest offshore mark + distance, for the sailing waypoint (v3.3.0). */
  seaWaypoint() {
    if (!this.player.mounted) return null;
    const p = this.player.position;
    let best = null;
    for (const s of this.world.spots) {
      if (!['ocean_shallow', 'reef', 'ocean_deep', 'ocean_cliff'].includes(s.id)) continue;
      const d = Math.hypot(s.x - p.x, s.z - p.z);
      if (!best || d < best.dist) best = { name: s.name, id: s.id, dist: d, x: s.x, z: s.z, minLevel: s.minLevel };
    }
    if (!best) return null;
    const marine = this.world.depthAt(p.x, p.z);
    best.offshore = marine > 10;
    return best;
  }

  /** Sailing waypoint: only while aboard a boat (v3.3.0). */
  _updateSeaWay() {
    const wp = this.seaWaypoint();
    if (!wp) {
      this.hud.setSeaWay(null);
      return;
    }
    const dx = wp.x - this.player.position.x;
    const dz = wp.z - this.player.position.z;
    const rel = Math.atan2(dx, dz) - this.player.yaw;
    this.hud.setSeaWay({
      name: wp.name,
      dist: wp.dist,
      rel,
      offshore: wp.offshore,
      locked: this.profile.level < (wp.minLevel || 1),
      minLevel: wp.minLevel,
    });
  }

  /** Apply a timed buff (used by shop supplies). */
  addBuff(buff) {
    const b = addBuff(this.profile, buff);
    this.hud.notify(`使用 ${buff.name}`, 'good');
    this.audio.play('ui_click');
    return b;
  }

  /** Helpers the shop system needs. */
  fishById(id) {
    return fishById(id);
  }

  fishValue(fish, weight) {
    return fishValue(fish, weight, 0);
  }

  get fishList() {
    return FISH;
  }

  /** Eat the smallest fish in the keeper net (H). Cooking gives better food. */
  eatFromNet() {
    const p = this.profile;
    if (this.survival.dead) return { ok: false, error: 'dead' };
    if (!p.pantry || !p.pantry.length) {
      this.hud.notify('保鲜网里没有能吃的鱼', 'bad');
      this.audio.play('ui_error');
      return { ok: false, error: 'empty' };
    }
    // smallest first, so the good fish stay for cooking and selling
    let idx = 0;
    for (let i = 1; i < p.pantry.length; i++) if (p.pantry[i].weight < p.pantry[idx].weight) idx = i;
    const entry = p.pantry[idx];
    p.pantry.splice(idx, 1);
    const res = this.survival.eat(entry, false);
    this.audio.play('eat');
    this.hud.notify(`吃掉 ${entry.name}（${entry.weight.toFixed(2)} kg） · 饱食 +${Math.round(res.gain * 100)}%`, 'good');
    this.checkAchievements();
    return { ok: true, ...res, entry };
  }

  /** Sleep at the cabin: a full night's recovery, costs hunger. */
  sleepAtCabin() {
    if (!this.nearCampfire()) return { ok: false, error: 'sleep-at-cabin' };
    if (this.survival.dead) return { ok: false, error: 'dead' };
    const s = this.survival.sleep();
    this.audio.play('ui_close');
    this.hud.showToast('睡了一觉', '生命与理智恢复，肚子饿了一些');
    return { ok: true, ...s };
  }

  /** Death → respawn at the cabin with a penalty. */
  _onDeath(info) {
    const p = this.profile;
    const lost = Math.round(p.coins * 0.1);
    p.coins = Math.max(0, p.coins - lost);
    p.stats.deaths = (p.stats.deaths || 0) + 1;
    p.stats.bestDays = Math.max(p.stats.bestDays || 0, info.days || 0);
    this.survival.revive();
    const c = this.world.props?.campfire;
    if (c) this.player.teleport(c.x + 3, c.z + 3);
    this.fishing.cancel('death');
    if (p.pantry && p.pantry.length > 4) p.pantry.splice(0, p.pantry.length - 4);
    this.audio.play('snap');
    this.hud.showDeath(info);
    this.hud.showToast('你倒下了', `在篝火边醒来 · 损失 ${lost} 金币，保鲜网只剩 4 条鱼`);
    this.hud.notify('生存法则：饥饿、寒冷和黑暗都会杀死你', 'bad');
    DIAG.deaths = (DIAG.deaths || 0) + 1;
  }

  /**
   * Mouse look needs the pointer captured. Browsers only grant that from a user
   * gesture, so every click on the game surface re-requests it and a hint tells
   * the player when the view is unlocked. (v4.4.0 — the original request call
   * was lost in an earlier refactor, which left the camera un-turnable.)
   */
  _setupPointerLock() {
    const canvas = this.engine.canvas;
    const hint = $('lockHint');
    let shown = null;
    const refresh = () => {
      const locked = this.input.pointerLocked;
      const playing = this.mode === 'playing' && !this.panels?.isOpen && !this.photo?.active;
      const show = playing && !locked;
      if (show !== shown) {
        shown = show;
        if (hint) hint.classList.toggle('hidden', !show);
        document.body.classList.toggle('locked', locked);
      }
    };
    const request = () => {
      if (this.mode !== 'playing') return;
      if (this.panels?.isOpen || this.photo?.active) return;
      const now = performance.now();
      if (now - (this._lastLockRequest || 0) < 600) return; // do not spam the API
      this._lastLockRequest = now;
      this.input.requestLock();
      setTimeout(refresh, 60);
    };
    this._requestPointerLock = request;
    canvas.addEventListener('pointerdown', request);
    if (hint) hint.addEventListener('pointerdown', request);
    // a key press is also a valid user gesture (fires once per unlock attempt)
    window.addEventListener('keydown', () => {
      if (!this.input.pointerLocked && this.mode === 'playing' && !this.panels?.isOpen) request();
    });
    this.input.on('lock', refresh);
    this.input.on('unlock', refresh);
    this.input.on('lockerror', () => {
      refresh();
      const now = performance.now();
      if (now - (this._lastLockError || 0) > 5000) {
        this._lastLockError = now;
        this.hud?.notify('浏览器拒绝了鼠标锁定 · 按住右键拖动或 [ / ] 转身', 'bad');
      }
    });
    this._refreshPointerLockHint = refresh;
  }

  /** Step the rival's self-improvement once per in-game day (v6.0.0). */
  _updateRSI() {
    if (!this.rsi?.ready) return;
    const day = Math.floor(this.world?.sky?.dayCount ?? 0);
    if (day === this._rsiDay) return;
    this._rsiDay = day;
    const res = this.rsi.stepDay({ note: `day ${day + 1}` });
    if (!res) return;
    // persist the essentials so progress survives a reload
    this.profile.rsi = {
      gen: this.rsi.gen,
      deployed: res.deployed,
      front: this.rsi.snapshot().front,
      history: this.rsi.history.slice(0, 6),
      replay: this.rsi.samples.length,
    };
    if (this.hud && res.accepted > 0) {
      const d = res.deployed;
      this.hud.notify(
        `老渔夫改良了策略（第 ${res.gen} 代 · 采纳 ${res.accepted} 条）· 日收益 ${res.before.value} → ${res.after.value}`,
        'gold'
      );
    }
    DIAG.rsiGen = this.rsi.gen;
    return res;
  }

  _updateAutosave(dt) {
    if (!this.profile.settings.autoSave) return;
    this._autosaveTimer += dt;
    if (this._autosaveTimer > 90) {
      this._autosaveTimer = 0;
      if (this.saveGame()) this.hud.notify('自动存档完成', '');
    }
  }

  /**
   * If the machine cannot hold a comfortable frame rate, step the quality
   * preset down once so the game stays playable instead of stuttering.
   */
  _updateAdaptiveQuality(dt, fps) {
    const s = this.profile.settings;
    if (s.adaptiveQuality === false || this._autoDropped) return;
    if (!this.engine || this.mode !== 'playing') return;
    this._qSample = (this._qSample || 0) + dt;
    this._qFrames = (this._qFrames || 0) + 1;
    if (this._qSample < 8) return;
    const avgFps = this._qFrames / this._qSample;
    this._qSample = 0;
    this._qFrames = 0;
    const order = ['high', 'medium', 'low'];
    const i = order.indexOf(s.quality);
    if (avgFps < 26 && i >= 0 && i < order.length - 1) {
      this._autoDropped = true;
      const next = order[i + 1];
      s.quality = next;
      this.engine.setQuality(next);
      this.world.setQuality(this.engine.quality);
      this.hud.notify(`帧率偏低（${avgFps.toFixed(0)} FPS），画质已自动调为「${QUALITY[next].label}」`, '');
      DIAG.autoQuality = next;
    }
  }

  _updateDiag(dt, fps, frameMs) {
    this._diagTimer += dt;
    DIAG.time = Math.round((performance.now() - DIAG.startedAt) / 1000);
    DIAG.level = this.profile.level;
    DIAG.weather = this.world.weather.kind;
    DIAG.biome = this.world.biomeAt(this.player.position.x, this.player.position.z);
    DIAG.playerPos = [
      Math.round(this.player.position.x * 10) / 10,
      Math.round(this.player.position.y * 10) / 10,
      Math.round(this.player.position.z * 10) / 10,
    ];
    if (this._diagTimer < 0.5) return;
    this._diagTimer = 0;
    const res = this.engine.resourceStats();
    DIAG.geometries = res.geometries;
    DIAG.textures = res.textures;
    DIAG.calls = res.calls;
    DIAG.triangles = res.triangles;
    DIAG.fps = Math.round(fps);
    DIAG.frameMs = Math.round(frameMs * 10) / 10;
    const mem = performance.memory;
    DIAG.jsHeapMB = mem ? Math.round((mem.usedJSHeapSize / 1048576) * 10) / 10 : 0;
    DIAG.heapLimitMB = mem ? Math.round(mem.jsHeapSizeLimit / 1048576) : 0;
    if (flag('diag') === '1' || DIAG.errors.length) {
      const el = $('diag');
      if (el) el.textContent = JSON.stringify(DIAG);
    }
  }
}

// ---------------------------------------------------------------------- start

const game = new Game();
window.__GAME = game;
window.__DATA = { FISH, RARITY };

// Debug hooks used by the automated verification run. Stripped from the
// production build (v6.1.0 size pass): `vite dev` keeps them, `vite build`
// tree-shakes the whole block.
if (import.meta.env.DEV) window.__DEBUG = {
  game,
  forceBite: () => {
    if (!game.fishing.isActive) game.fishing.beginCharge(), game.fishing.releaseCharge();
    game.fishing.state = STATE.WAITING;
    game.fishing.ctx = game.fishing.ctx || game.fishing.buildContext(game.player.position.x - 8, game.player.position.z - 8);
    game.fishing.biteTimer = 0.01;
  },
  hookNow: () => {
    game.fishing.state = STATE.BITE;
    game.fishing.biteWindow = 5;
    game.fishing.hook();
  },
  finishFight: () => {
    if (game.fishing.state !== STATE.FIGHT) return false;
    game.fishing.fight.stamina = 0;
    game.fishing.fight.distance = 0;
    game.fishing.land();
    game.fishing.commitPending(false);
    return true;
  },
  catchSpecies: (id) => {
    const fish = fishById(id) || FISH[0];
    const weight = (fish.minWeight + fish.maxWeight) / 2;
    const info = {
      fish,
      weight,
      length: 40,
      value: fish.baseValue,
      xp: fish.xp,
      junk: !!fish.junk,
      perfect: true,
      spotId: null,
      spotName: '测试',
      region: 'lake',
      biome: 'lake',
      weather: game.world.weather.kind,
      hour: game.world.timeOfDay,
      depth: 3,
      at: Date.now(),
    };
    applyCatch(game.profile, info);
    trackQuests(game.profile, info);
    checkAchievements(game.profile);
    DIAG.catches++;
    return info;
  },
  teleport: (spotId) => {
    const spot = game.world.getSpot(spotId) || game.world.spots[0];
    if (!spot) return false;
    if (spot.waterOnly) {
      // deep-water spots are reached by swimming: float the player above the anchor
      game.player.position.set(spot.x, WATER_LEVEL + 0.1, spot.z);
      game.player.velocity.set(0, 0, 0);
    } else {
      game.player.teleport(spot.x, spot.z);
    }
    return true;
  },
  setTime: (h) => game.world.setTimeOfDay(h),
  setWeather: (k) => game.world.weather.set(k, true),
  /** Aim the camera for screenshots: degrees, 0 = north (-Z), negative pitch = down. */
  look: (yawDeg = 0, pitchDeg = 0) => {
    game.player.yaw = (yawDeg * Math.PI) / 180;
    game.player.pitch = (pitchDeg * Math.PI) / 180;
    return [game.player.yaw, game.player.pitch];
  },
  /** Board the nearest boat (or step off), then optionally row for a while. */
  boat: (action = 'board', steps = 0, thrust = 1, steer = 0) => {
    const bm = game.boats;
    const list = () => bm.boats.map((b) => ({ id: b.id, x: +b.position.x.toFixed(1), z: +b.position.z.toFixed(1), aboard: b.aboard }));
    if (action === 'board') {
      const ok = bm.toggle(game.player);
      return { ok, aboard: !!bm.mounted, boats: list() };
    }
    if (action === 'force') {
      // stand next to the closest boat and climb in
      let b = null;
      let bd = Infinity;
      for (const x of bm.boats) {
        const d = x.distanceTo(game.player.position);
        if (d < bd) {
          bd = d;
          b = x;
        }
      }
      if (!b) return { ok: false };
      game.player.position.set(b.position.x + 2.0, WATER_LEVEL + 0.1, b.position.z + 2.0);
      game.player.velocity.set(0, 0, 0);
      const ok = b.board(game.player);
      return { ok, aboard: b.aboard, boat: { id: b.id, x: +b.position.x.toFixed(1), z: +b.position.z.toFixed(1) }, boats: list() };
    }
    if (action === 'row') {
      const boat = bm.mounted;
      if (!boat) return { ok: false };
      const start = { x: boat.position.x, z: boat.position.z };
      const input = game.input;
      const keys = ['KeyW', 'KeyS', 'KeyA', 'KeyD'];
      for (const k of keys) input.keys.delete(k);
      if (thrust > 0) input.keys.add('KeyW');
      if (thrust < 0) input.keys.add('KeyS');
      if (steer > 0) input.keys.add('KeyD');
      if (steer < 0) input.keys.add('KeyA');
      for (let i = 0; i < steps; i++) boat.update(1 / 60, input, game.player, game.world.env);
      for (const k of keys) input.keys.delete(k);
      return {
        ok: true,
        moved: +Math.hypot(boat.position.x - start.x, boat.position.z - start.z).toFixed(2),
        x: +boat.position.x.toFixed(1),
        z: +boat.position.z.toFixed(1),
        y: +boat.position.y.toFixed(2),
        aground: boat.aground,
        depth: +game.world.depthAt(boat.position.x, boat.position.z).toFixed(2),
        playerSeated: [+game.player.position.x.toFixed(1), +game.player.position.y.toFixed(2), +game.player.position.z.toFixed(1)],
      };
    }
    return { ok: false };
  },
  wildlife: () => ({
    fish: game.world.fishLife ? game.world.fishLife.stats : null,
    birds: game.world.birds ? game.world.birds.stats : null,
    fishUnderwaterSample: game.world.fishLife
      ? game.world.fishLife.fish.filter((f) => f.alive).slice(0, 3).map((f) => ({ x: +f.x.toFixed(1), y: +f.y.toFixed(2), z: +f.z.toFixed(1), depth: +game.world.depthAt(f.x, f.z).toFixed(2) }))
      : null,
  }),
  tutorial: () => ({
    active: game.tutorial.active,
    index: game.tutorial.index,
    total: game.tutorial.total,
    step: game.tutorial.step ? game.tutorial.step.id : null,
    title: game.tutorial.step ? game.tutorial.step.title : null,
    markerVisible: !!game.tutorial._marker?.visible,
    done: game.tutorial.done,
  }),
  /** Drive the tutorial forward without playing: simulate each trigger. */
  tutorialStep: (id) => {
    const t = game.tutorial;
    const target = STEPS.findIndex((s) => s.id === id);
    if (target < 0) return { ok: false };
    t.index = target;
    t.active = true;
    switch (id) {
      case 'first_cast':
        game.fishing.state = 'charging';
        break;
      case 'first_bite':
        game.fishing.state = 'bite';
        break;
      case 'first_catch':
        game.profile.stats.catches = Math.max(1, game.profile.stats.catches || 0);
        break;
      case 'first_shop':
        game.panels.open('shop');
        break;
      case 'first_view':
        t.notifyViewToggle();
        break;
      default:
        break;
    }
    t.update(1 / 60, {
      player: game.player,
      world: game.world,
      fishing: game.fishing,
      profile: game.profile,
      panelsOpen: game.panels.isOpen,
      panelTab: game.panels.tab,
    });
    const before = game.profile.settings.tutorialDone;
    return { ok: true, index: t.index, step: t.step ? t.step.id : null, active: t.active, done: game.profile.settings.tutorialDone, completed: !before && game.profile.settings.tutorialDone };
  },
  skipTutorial: () => {
    game.tutorial.skip();
    return { active: game.tutorial.active, done: game.profile.settings.tutorialDone };
  },
  kitchen: () => ({
    pantry: (game.profile.pantry || []).map((e) => `${e.name} ${e.weight.toFixed(2)}kg`),
    buffs: activeBuffs(game.profile).map((b) => ({ id: b.id, name: b.name, remaining: b.remaining, mods: b.mods })),
    recipes: availableRecipes(game.profile).map((r) => ({ id: r.recipe.id, name: r.recipe.name, count: r.count, best: r.best ? `${r.best.name} ${r.best.weight.toFixed(2)}kg` : null })),
    gearMods: game.fishing.gear.buffMods,
    nearFire: game.nearCampfire(),
    atFire: [Math.round(game.world.props.campfire.x), Math.round(game.world.props.campfire.z)],
  }),
  cook: (recipeId) => {
    game._debugIgnoreFire = true;
    const res = game.cookAtFire(recipeId);
    game._debugIgnoreFire = false;
    return { ok: res.ok, error: res.error || null, used: res.used ? `${res.used.name} ${res.used.weight.toFixed(2)}kg` : null, recipe: res.recipe ? res.recipe.id : null };
  },
  goToFire: () => {
    const f = game.world.props.campfire;
    game.player.teleport(f.x + 2, f.z + 2);
    return { x: +game.player.position.x.toFixed(1), z: +game.player.position.z.toFixed(1), nearFire: game.nearCampfire() };
  },
  grantCatch: (id, weight) => {
    const info = window.__DEBUG.catchSpecies(id);
    if (weight) info.weight = weight;
    return { name: info.fish.name, rarity: info.fish.rarity, weight: info.weight };
  },
  setReel: (on) => {
    game.fishing.forceReel = on ? true : null;
    return game.fishing.forceReel;
  },
  /**
   * Deterministic fight simulation: steps the fishing system directly so the
   * minigame can be verified independently of the render frame rate.
   * mode 'auto' plays like a competent angler (keeps tension inside the zone).
   */
  simFight: (steps = 900, dt = 1 / 60, mode = 'auto', autoCommit = true) => {
    const f = game.fishing;
    const samples = [];
    let n = 0;
    for (let i = 0; i < steps; i++) {
      if (mode === 'auto') {
        if (f.state === STATE.FIGHT) {
          const s = f.getHudState();
          f.forceReel = s.tension < (s.zoneLow + s.zoneHigh) / 2;
        } else {
          f.forceReel = null;
        }
      } else {
        f.forceReel = mode === 'reel' ? true : null;
      }
      f.update(dt, game.input);
      n++;
      if (i % 45 === 0) {
        const s = f.getHudState();
        samples.push({
          st: f.state,
          d: s.distance === undefined ? null : +s.distance.toFixed(3),
          t: s.tension === undefined ? null : +s.tension.toFixed(3),
          w: s.wear === undefined ? null : +s.wear.toFixed(3),
          fish: s.fishName || null,
        });
      }
      if (f.state === STATE.IDLE) break;
    }
    f.forceReel = null;
    // resolve the catch card so tests always see the committed result
    let committed = null;
    if (autoCommit && f.state === STATE.RESULT && f.pendingCatch) committed = f.commitPending(false);
    return {
      steps: n,
      samples,
      state: f.state,
      committed: committed ? { name: committed.fish.name, value: committed.value, xp: committed.xp, newSpecies: committed.newSpecies } : null,
      result: f.lastCatch
        ? { name: f.lastCatch.fish.name, weight: +f.lastCatch.weight.toFixed(3), value: f.lastCatch.value, perfect: f.lastCatch.perfect, length: Math.round(f.lastCatch.length) }
        : null,
    };
  },
  /**
   * One deterministic end-to-end catch: put the float in the water, wait for
   * the bite, strike, play the fight with an auto-reeler, then resolve the card
   * (keep or release). Used by the verification run.
   */
  simFullCatch: (released = false, maxSteps = 3000) => {
    const f = game.fishing;
    const input = game.input;
    if (f.state !== STATE.IDLE) f._endCast('reset');
    window.__DEBUG.teleport('lake_dock');
    const ctx = window.__DEBUG.castAt(-14, -6);
    f.biteTimer = 0.01;
    let struck = false;
    let steps = 0;
    let endReason = null;
    const onSnap = () => { endReason = 'snap'; };
    const onEscape = (e) => { endReason = e?.outOfLine ? 'outOfLine' : 'escape'; };
    f.on('snap', onSnap);
    f.on('escape', onEscape);
    for (let i = 0; i < maxSteps; i++) {
      steps = i;
      input._pressed.clear();
      if (f.state === STATE.BITE && !struck) {
        input._pressed.add('KeyF');
        struck = true;
      }
      if (f.state === STATE.FIGHT) {
        const s = f.getHudState();
        // a competent angler: reel under the band, pump above it
        f.forceReel = s.tension < s.zoneHigh - 0.02;
        input.mouse.right = s.tension > s.zoneHigh + 0.04;
      } else {
        f.forceReel = null;
        input.mouse.right = false;
      }
      f.update(1 / 60, input);
      if (f.state === STATE.RESULT) break;
      if (i > 10 && f.state === STATE.IDLE) break;
    }
    f.forceReel = null;
    input.mouse.right = false;
    input._pressed.clear();
    f.off('snap', onSnap);
    f.off('escape', onEscape);
    const before = {
      journal: Object.keys(game.profile.journal).length,
      coins: game.profile.coins,
      released: game.profile.stats.released || 0,
      pantry: (game.profile.pantry || []).length,
    };
    const info = f.commitPending(!!released);
    return {
      steps,
      struck,
      state: f.state,
      endReason,
      message: f.message,
      fish: info ? info.fish.name : null,
      weight: info ? +info.weight.toFixed(3) : null,
      isReleased: info ? !!info.released : null,
      value: info ? info.value : null,
      xp: info ? info.xp : null,
      before,
      after: {
        journal: Object.keys(game.profile.journal).length,
        coins: game.profile.coins,
        released: game.profile.stats.released || 0,
        pantry: (game.profile.pantry || []).length,
      },
      ctx: ctx ? { region: ctx.region, depth: +ctx.depth.toFixed(2) } : null,
    };
  },
  /** Resolve the current catch card: released=true gives the fish back. */
  commitCatch: (released = false) => {
    const info = game.fishing.commitPending(!!released);
    if (!info) return { ok: false };
    return { ok: true, released: !!info.released, name: info.fish.name, coins: info.value, xp: info.xp, species: Object.keys(game.profile.journal).length };
  },
  /**
   * Force a fight against a specific fish/weight and step it, sampling the
   * feel channels (drag, line out, rod bend, camera trauma, slipping).
   */
  debugFight: (fishId, weight, steps = 720, reel = 'auto') => {
    const f = game.fishing;
    if (f.state !== STATE.IDLE) f._endCast('reset');
    window.__DEBUG.teleport('lake_dock');
    window.__DEBUG.castAt(-14, -6);
    const fish = fishById(fishId) || FISH[0];
    const savedRoll = f.rollFish;
    const savedSize = f.rollSize;
    f.rollFish = () => fish;
    f.rollSize = () => weight;
    f.state = STATE.BITE;
    f.biteWindow = 5;
    f.hook();
    const dragUsed = f.fight ? +f.fight.drag.toFixed(2) : null;
    f.rollFish = savedRoll;
    f.rollSize = savedSize;
    const samples = [];
    let maxSlip = 0;
    let maxBend = 0;
    let maxTrauma = 0;
    let endReason = null;
    const onSnap = () => { endReason = 'snap'; };
    const onEscape = (e) => { endReason = e?.outOfLine ? 'outOfLine' : 'escape'; };
    const onLand = () => { endReason = 'landed'; };
    f.on('snap', onSnap);
    f.on('escape', onEscape);
    f.on('landed', onLand);
    for (let i = 0; i < steps; i++) {
      if (f.state !== STATE.FIGHT) break;
      if (reel === 'auto') {
        const s = f.getHudState();
        // competent angler: keep the tension as high as the band allows
        f.forceReel = s.tension < s.zoneHigh - 0.02;
        game.input.mouse.right = s.tension > s.zoneHigh + 0.04;
      } else {
        f.forceReel = !!reel;
        game.input.mouse.right = false;
      }
      f.update(1 / 60, game.input);
      const s = f.getHudState();
      maxBend = Math.max(maxBend, game.player.angler.bend);
      maxTrauma = Math.max(maxTrauma, game.player.trauma);
      if (s.slipping) maxSlip += 1 / 60;
      if (i % 45 === 0) {
        samples.push({
          t: +f.fight.time.toFixed(1),
          ten: +(s.tension || 0).toFixed(2),
          zone: `${(s.zoneLow || 0).toFixed(2)}-${(s.zoneHigh || 0).toFixed(2)}`,
          dist: +f.fight.distance.toFixed(2),
          stam: +(s.stamina || 0).toFixed(2),
          line: Math.round(s.lineOut || 0),
          wear: +(s.wear || 0).toFixed(2),
          slip: !!s.slipping,
          reel: !!f.forceReel,
          fishVis: game.fightVisuals ? game.fightVisuals.fish.visible : null,
          fishY: game.fightVisuals ? +game.fightVisuals.fish.position.y.toFixed(2) : null,
        });
      }
    }
    f.forceReel = null;
    game.input.mouse.right = false;
    f.off('snap', onSnap);
    f.off('escape', onEscape);
    f.off('landed', onLand);
    const s = f.getHudState();
    return {
      fish: fish.name,
      weight,
      drag: f.fight ? +f.fight.drag.toFixed(2) : dragUsed,
      rodBend: +maxBend.toFixed(2),
      shakeTrauma: +maxTrauma.toFixed(2),
      slipSeconds: +maxSlip.toFixed(2),
      state: f.state,
      endReason,
      samples: samples.slice(0, 18),
      end: {
        tension: +(s.tension || 0).toFixed(2),
        distance: f.fight ? +f.fight.distance.toFixed(2) : null,
        stamina: +(s.stamina || 0).toFixed(2),
        wear: +(s.wear || 0).toFixed(2),
        lineOut: Math.round(s.lineOut || 0),
      },
      haptics: game.haptics ? game.haptics.state : null,
    };
  },
  feel: () => ({
    rodBend: +game.player.angler.bend.toFixed(3),
    trauma: +game.player.trauma.toFixed(3),
    haptics: game.haptics ? game.haptics.state : null,
    fight: game.fishing.fight
      ? {
          tension: +game.fishing.fight.tension.toFixed(2),
          drag: +game.fishing.fight.drag.toFixed(2),
          slipping: game.fishing.fight.slipping,
          lineOutM: Math.round(game.fishing.fight.lineOutM),
          slipTime: +game.fishing.fight.slipTime.toFixed(1),
        }
      : null,
  }),
  /** Force a hook + immediate landing so the big-fish reveal can be tested. */
  forceLand: (fishId, weight) => {
    const f = game.fishing;
    if (f.state !== STATE.IDLE) f._endCast('reset');
    window.__DEBUG.teleport('lake_dock');
    window.__DEBUG.castAt(-14, -6);
    const fish = fishById(fishId) || FISH[0];
    const savedRoll = f.rollFish;
    const savedSize = f.rollSize;
    f.rollFish = () => fish;
    f.rollSize = () => weight;
    f.state = STATE.BITE;
    f.biteWindow = 5;
    f.hook();
    f.rollFish = savedRoll;
    f.rollSize = savedSize;
    const game_ = game;
    const surfaceFishVisible = game_.fightVisuals.fish.visible;
    f.land();
    const r = game_.fightVisuals.reveal;
    return {
      surfaceFishVisible,
      revealing: game_.fightVisuals.revealing,
      sizeClass: r.cls ? r.cls.id : null,
      sizeClassLabel: r.cls ? r.cls.name : null,
      revealLock: !!f.revealLock,
      fov: +game_.engine.camera.fov.toFixed(1),
      timeScale: +game_.fightVisuals.timeScale.toFixed(2),
      deservesReveal: deservesReveal(weight, fish.rarity),
    };
  },
  reveal: () => {
    const fv = game.fightVisuals;
    const r = fv.reveal;
    return {
      active: r.active,
      t: +r.t.toFixed(2),
      dur: +r.dur.toFixed(2),
      cls: r.cls ? r.cls.id : null,
      timeScale: +fv.timeScale.toFixed(2),
      fov: +game.engine.camera.fov.toFixed(1),
      revealLock: !!game.fishing.revealLock,
      revealFishVisible: fv.revealFish.visible,
      revealFishY: +fv.revealFish.position.y.toFixed(2),
      surfaceFishVisible: fv.fish.visible,
    };
  },
  /** Hook a fish and leave the game in FIGHT so the real loop drives it. */
  hookNow: (fishId, weight, lineId = null) => {
    const f = game.fishing;
    if (f.state !== STATE.IDLE) f._endCast('reset');
    if (lineId) {
      game.profile.line = lineId;
      f._gear = null;
    }
    window.__DEBUG.teleport('lake_dock');
    window.__DEBUG.castAt(-14, -6);
    const fish = fishById(fishId) || FISH[0];
    const savedRoll = f.rollFish;
    const savedSize = f.rollSize;
    f.rollFish = () => fish;
    f.rollSize = () => weight;
    f.state = STATE.BITE;
    f.biteWindow = 5;
    f.hook();
    f.rollFish = savedRoll;
    f.rollSize = savedSize;
    return {
      state: f.state,
      fish: fish.name,
      drag: +f.fight.drag.toFixed(2),
      dragMax: +f.fight.dragMax.toFixed(2),
      dragUser: +f.fight.dragUser.toFixed(2),
    };
  },
  fightProbe: () => {
    const f = game.fishing;
    const s = f.getHudState();
    return {
      state: f.state,
      fov: +game.engine.camera.fov.toFixed(1),
      fovTarget: +(game._fovCurrent ?? 0).toFixed(1),
      tension: +(s.tension || 0).toFixed(2),
      drag: f.fight ? +f.fight.drag.toFixed(2) : null,
      dragUser: f.fight ? +f.fight.dragUser.toFixed(2) : null,
      lineOut: Math.round(s.lineOut || 0),
      slipping: !!s.slipping,
      surfaceFish: game.fightVisuals.fish.visible,
      surfaceFishY: +game.fightVisuals.fish.position.y.toFixed(2),
      trauma: +game.player.trauma.toFixed(2),
      haptics: game.haptics.state,
    };
  },
  /** Abandon whatever cast/fight is in progress. */
  resetCast: () => {
    game.fishing._endCast('reset');
    game.fightVisuals._hideFish();
    return game.fishing.state;
  },
  /** Size-class table for the given weights. */
  sizes: (weights = [0.2, 1.5, 6, 20, 60, 150]) =>
    weights.map((w) => {
      const c = sizeClass(w);
      return { w, id: c.id, name: c.name };
    }),
  /** Hook + land a forced fish wherever the player currently is (boat/offshore). */
  forceLandHere: (fishId, weight) => {
    const f = game.fishing;
    if (f.state !== STATE.IDLE) f._endCast('reset');
    const px = game.player.position.x;
    const pz = game.player.position.z;
    // find water a cast away, in any direction
    let best = null;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      for (const d of [9, 14, 20, 26]) {
        const x = px + Math.cos(a) * d;
        const z = pz + Math.sin(a) * d;
        if (game.world.isWater(x, z) && game.world.depthAt(x, z) > 2) {
          best = { x, z };
          break;
        }
      }
      if (best) break;
    }
    const ctx = best ? window.__DEBUG.castAt(best.x - px, best.z - pz) : window.__DEBUG.castAt(6, 6);
    const fish = fishById(fishId) || FISH[0];
    const savedRoll = f.rollFish;
    const savedSize = f.rollSize;
    f.rollFish = () => fish;
    f.rollSize = () => weight;
    f.state = STATE.BITE;
    f.biteWindow = 5;
    f.hook();
    f.rollFish = savedRoll;
    f.rollSize = savedSize;
    f.land();
    return { ctx: ctx ? { depth: +ctx.depth.toFixed(1), region: ctx.region, biome: ctx.biome } : null };
  },
  /** Bring the boat alongside a whale and force it to the surface (screenshots). */
  whale: (id = 'orca') => {
    const list = game.world.whales?.list || [];
    const same = list.filter((x) => x.id === id);
    const w = same[0] || list[0];
    if (!w) return { ok: false };
    const cam = game.engine.camera;
    const fwd = new THREE.Vector3();
    cam.getWorldDirection(fwd);
    const d = id === 'dolphin' ? 14 : 20;
    const x = cam.position.x + fwd.x * d;
    const z = cam.position.z + fwd.z * d;
    w.freezeAt(x, z, id === 'dolphin' ? -1.0 : -1.5);
    w.group.rotation.y = Math.atan2(cam.position.x - x, cam.position.z - z);
    w.sighted = false;
    w._blow();
    // pods line up alongside the leader so the whole group is in frame
    const right = new THREE.Vector3(fwd.z, 0, -fwd.x).normalize();
    same.slice(1).forEach((s, i) => {
      const off = (i + 1) * 4.5;
      s.freezeAt(x + right.x * off, z + right.z * off, -1.0);
      s.group.rotation.y = w.group.rotation.y;
      s.sighted = true; // only the leader logs a sighting
    });
    return { ok: true, name: w.name, x: +x.toFixed(0), z: +z.toFixed(0), boat: !!game.player.mounted, pod: same.length };
  },
  /**
   * Step a whole fight with a bot that reads and counters every event.
   * Returns the fight's style, event tally and the resulting grade.
   */
  fightSim: (fishId = 'bluefin_tuna', weight = 60, seconds = 45, counter = true) => {
    const f = game.fishing;
    if (f.state !== STATE.IDLE) f._endCast('reset');
    window.__DEBUG.teleport('lake_dock');
    window.__DEBUG.castAt(-14, -6);
    const fish = fishById(fishId) || FISH[0];
    const savedRoll = f.rollFish;
    const savedSize = f.rollSize;
    f.rollFish = () => fish;
    f.rollSize = () => weight;
    f.state = STATE.BITE;
    f.biteWindow = 5;
    f.hook();
    f.rollFish = savedRoll;
    f.rollSize = savedSize;
    const seq = [];
    const onEv = (e) => seq.push(`${e.type}:${e.phase}`);
    f.on('fightEvent', onEv);
    const input = game.input;
    const steps = Math.round(seconds * 60);
    const trace = [];
    let i = 0;
    for (; i < steps; i++) {
      if (f.state !== STATE.FIGHT) break;
      const s = f.getHudState();
      const ev = s.event;
      const acting = ev && ev.phase === 'active';
      if (acting && counter) {
        if (ev.action === 'pump') {
          f.forceReel = false;
          input.mouse.right = true;
        } else {
          f.forceReel = false;
          input.mouse.right = false;
        }
      } else {
        input.mouse.right = false;
        f.forceReel = s.tension < s.zoneHigh - 0.02;
      }
      if (i % 40 === 0 && f.fight) {
        trace.push({
          t: +f.fight.time.toFixed(1),
          ten: +f.fight.tension.toFixed(2),
          zone: `${(s.zoneLow ?? 0).toFixed(2)}-${(s.zoneHigh ?? 0).toFixed(2)}`,
          dist: +f.fight.distance.toFixed(2),
          stam: +f.fight.stamina.toFixed(2),
          wear: +f.fight.wear.toFixed(2),
          reel: !!f.forceReel,
          ev: s.event ? `${s.event.type}:${s.event.phase}` : null,
        });
      }
      f.update(1 / 60, input);
    }
    f.forceReel = null;
    input.mouse.right = false;
    f.off('fightEvent', onEv);
    const ff = f.fight;
    const out = {
      fish: fish.name,
      style: ff?.style ? { id: ff.style.id, name: ff.style.name } : null,
      state: f.state,
      seconds: +(i / 60).toFixed(1),
      events: ff ? ff.eventsTotal : 0,
      countered: ff ? ff.eventsCountered : 0,
      stamina: ff ? +ff.stamina.toFixed(2) : null,
      tensionAtEnd: ff ? +ff.tension.toFixed(2) : null,
      message: f.message,
      trace: trace.slice(0, 14),
      sequence: seq.slice(0, 18),
    };
    if (f.state === STATE.RESULT && f.pendingCatch) {
      const info = f.pendingCatch;
      out.grade = info.grade || null;
      out.value = info.value;
      out.xp = info.xp;
      out.fightTime = info.fightTime;
      f.commitPending(true); // release so the sim leaves no loot behind
    }
    return out;
  },
  /** Force the next fight event immediately (for HUD screenshots). */
  fightEventNow: () => {
    const f = game.fishing;
    if (!f.fight) return { ok: false };
    f.fight.nextEvent = 0;
    return { ok: true, style: f.fight.style?.id, events: f.fight.eventsTotal };
  },
  /** Inject a long-running event so the HUD banner can be screenshotted. */
  showEvent: (type = 'shake', seconds = 8) => {
    const f = game.fishing;
    if (!f.fight) return { ok: false };
    const EV = { shake: ['疯狂甩头', '🌪️', '按住右键抬竿', 'pump'], jump: ['跃出水面', '🦘', '松开收线，压低竿尖', 'release'], dive: ['向深处钻', '⬇️', '按住右键抬竿', 'pump'], run: ['发力狂奔', '💨', '松卸力 / 松开收线', 'release'] };
    const d = EV[type] || EV.shake;
    f.fight.event = {
      id: type,
      label: d[0],
      icon: d[1],
      hint: d[2],
      action: d[3],
      telegraph: seconds,
      active: 1.0,
      tension: 0.4,
      wear: 0.2,
      stamina: 0.1,
      phase: 'telegraph',
      t: 0,
      countered: false,
    };
    f.fight.nextEvent = 999;
    return { ok: true, type, seconds };
  },
  /** RSI state, and a manual step for tests/screenshots. */
  rsi: () => (game.rsi ? game.rsi.snapshot() : null),
  rsiStep: (n = 1) => {
    if (!game.rsi) return null;
    const out = [];
    for (let i = 0; i < n; i++) out.push(game.rsi.stepDay({ note: `manual ${i + 1}` }));
    return out[out.length - 1];
  },
  /** Environment + sea/market probe (v3.0.0–v3.2.0). */
  env: () => {
    const w = game.world;
    const sky = w.sky;
    return {
      hour: +w.timeOfDay.toFixed(2),
      phase: sky.env.phase,
      golden: +(sky.env.golden ?? 0).toFixed(3),
      sunElev: +(sky.sunDir.y ?? 0).toFixed(3),
      sunset: !!sky.env.sunset,
      glowOpacity: +(sky.sunGlowMat?.opacity ?? 0).toFixed(3),
      glowVisible: !!sky.sunGlow?.visible,
      sunVisible: +(sky.domeUniforms?.uSunVisible?.value ?? 0).toFixed(3),
      cloudCover: +(sky.env.cloudCover ?? 0).toFixed(2),
      gradeOpacity: +(game._gradeOpacity ?? 0).toFixed(3),
      weather: w.weather.kind,
      seaState: +w.seaState.toFixed(3),
      seaLabel: w.seaLabel,
      priceMultiplier: w.priceMultiplier,
      stars: +(sky.starMat?.opacity ?? 0).toFixed(2),
      night: +(sky.env.night ?? 0).toFixed(2),
    };
  },
  setTime: (h) => {
    game.world.sky.setTime(h);
    game.world.sky.update(0.016, game.engine.camera, { weather: game.world.weather, playerPos: game.player.position });
    return game.world.sky.phaseInfo;
  },
  charter: () => game.charterOffshore(),
  home: () => game.returnToDock(),
  aquarium: () => (game.world.props.aquariumFish || []).map((f) => f.id),
  /** Deterministic full cast pipeline: charge, release, fly, land in water. */
  simCast: (steps = 300, dt = 1 / 60, holdSteps = 55) => {
    const f = game.fishing;
    const input = game.input;
    if (f.state !== STATE.IDLE) {
      f._endCast('reset');
    }
    const samples = [];
    input.keys.add('KeyF');
    input._pressed.add('KeyF');
    for (let i = 0; i < steps; i++) {
      if (i === holdSteps) input.keys.delete('KeyF');
      f.update(dt, input);
      input._pressed.clear();
      if (i % 15 === 0 || f.state === STATE.WAITING) {
        samples.push({
          i,
          st: f.state,
          charge: +f.charge.toFixed(2),
          bob: f.bobber.visible,
          y: +f.bobberPos.y.toFixed(2),
          region: f.ctx ? f.ctx.region : null,
          depth: f.ctx ? +f.ctx.depth.toFixed(2) : null,
        });
      }
      if (f.state === STATE.WAITING || f.state === STATE.IDLE) break;
    }
    input.keys.delete('KeyF');
    return {
      state: f.state,
      samples: samples.slice(-8),
      lastCast: f.lastCast,
      message: f.message,
      ctx: f.ctx ? { region: f.ctx.region, biome: f.ctx.biome, depth: +f.ctx.depth.toFixed(2), waters: f.ctx.waters, spot: f.ctx.spot ? f.ctx.spot.name : null } : null,
    };
  },
  /** Let the bite timer run down and strike at the right moment. */
  simBite: (steps = 600, dt = 1 / 60) => {
    const f = game.fishing;
    const input = game.input;
    let struckAt = -1;
    for (let i = 0; i < steps; i++) {
      f.update(dt, input);
      if (f.state === STATE.BITE && struckAt < 0) {
        struckAt = i;
        input._pressed.add('KeyF');
      } else {
        input._pressed.clear();
      }
      if (f.state === STATE.FIGHT || f.state === STATE.IDLE) break;
    }
    input._pressed.clear();
    return { state: f.state, struckAt, fish: f.hooked ? f.hooked.fish.name : null, weight: f.hooked ? +f.hooked.weight.toFixed(3) : null };
  },
  waterDebug: () => {
    const w = game.world.water;
    const u = w.uniforms;
    const cam = game.engine.camera;
    return {
      camY: +cam.position.y.toFixed(2),
      camX: +cam.position.x.toFixed(1),
      camZ: +cam.position.z.toFixed(1),
      underwater: w.underwater,
      waveScale: +w.waveScale.toFixed(3),
      nearVisible: w.mesh.visible,
      farVisible: w.farMesh.visible,
      cloudsVisible: game.world.sky.clouds.visible,
      uniforms: {
        sky: u.uSkyColor.value.getHexString(),
        horizon: u.uHorizonColor.value.getHexString(),
        sun: u.uSunColor.value.getHexString(),
        shallow: u.uShallowColor.value.getHexString(),
        deep: u.uDeepColor.value.getHexString(),
        fog: u.uFogColor.value.getHexString(),
        fogNear: u.uFogNear.value,
        fogFar: u.uFogFar.value,
        uTime: +u.uTime.value.toFixed(2),
        waveScale: +u.uWaveScale.value.toFixed(3),
        heightTexReady: !!u.uHeightTex.value,
      },
      sceneFog: game.engine.scene.fog ? { color: game.engine.scene.fog.color.getHexString(), near: game.engine.scene.fog.near, far: game.engine.scene.fog.far } : null,
      env: game.world.env
        ? {
            sky: game.world.env.skyColor.getHexString(),
            horizon: game.world.env.horizonColor.getHexString(),
            fog: game.world.env.fogColor.getHexString(),
            sunI: +game.world.env.sunIntensity.toFixed(2),
            keyI: +game.world.env.keyIntensity.toFixed(2),
            night: +game.world.env.night.toFixed(2),
          }
        : null,
    };
  },
  castAt: (dx = -8, dz = -8) => {
    const f = game.fishing;
    f.state = STATE.WAITING;
    f.bobberPos.set(game.player.position.x + dx, 0.05, game.player.position.z + dz);
    const surf = game.world.surfaceHeight(f.bobberPos.x, f.bobberPos.z);
    f.bobberPos.y = surf;
    f.bobber.position.copy(f.bobberPos);
    f.bobber.visible = true;
    f.line.visible = true;
    f.ctx = f.buildContext(f.bobberPos.x, f.bobberPos.z);
    f.biteTimer = 999;
    return f.ctx;
  },
  summary: () => DIAG,
};

game.boot().catch((err) => {
  pushError(`boot failed: ${err?.message}`, err?.stack);
  const loadStatus = $('loadStatus');
  if (loadStatus) loadStatus.textContent = `启动失败：${err?.message}`;
});
