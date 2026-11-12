// App shell: screen flow, mode lifecycle, HUD updates, audio, persistence.

import { UI } from './ui/ui.js';
import { AudioEngine } from './core/audio.js';
import { GameSession } from './core/session.js';
import { LEVELS, LEVEL_BY_ID, RECIPES } from './core/data.js';
import { createHands, createPlate } from './core/kitchen.js';
import { FirstPersonMode } from './fp/fpMode.js';
import { ArcadeMode } from './arcade/arcadeMode.js';
import * as save from './core/save.js';
import { recordSession, toCSV, toJSON, clearSessions } from './core/playtest.js';
import { isTouchDevice } from './core/touch.js';
import * as rsi from './core/rsi.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

class App {
  constructor() {
    this.settings = save.getSettings();
    this.ui = new UI(this);
    this.audio = new AudioEngine(this.settings);

    this.modeName = 'fp';
    this.levelId = 1;
    this.players = 1;
    this.session = null;
    this.mode = null;
    this.hands = null;
    this.paused = false;
    this.active = false;
    this.resultsOpen = false;
    this.lastTs = 0;
    this.settingsReturn = null;
    this.dataReturn = null;
    this.inputDevice = 'keyboard';
    this._sessionSubs = [];
    this._blockedAt = 0;
    this._lastFrame = performance.now();

    this.canvasFP = document.getElementById('fp-canvas');
    this.canvas2D = document.getElementById('arcade-canvas');

    this._bindGlobal();
    this._bindActions();
    this.ui.showMenu();
    setTimeout(() => this.ui.bootDone(), 500);

    window.__SIZZLE__ = {
      app: this,
      start: (mode = 'fp', level = 1, players = 1) => this.startShift(mode, level, players),
      pause: () => this.pause(),
      resume: () => this.resume(),
      finish: () => this.session?.finish(),
      get session() {
        return window.__SIZZLE__.app.session;
      },
      get mode() {
        return window.__SIZZLE__.app.mode;
      },
      get ui() {
        return window.__SIZZLE__.app.ui;
      },
      giveDish: (recipeId = 'cheeseburger') => this.debugGiveDish(recipeId),
      teleport: (stationId) => this.mode?.teleportToStation?.(stationId),
      interact: (stationId) => this.session?.interact(stationId, this.mode?.hands),
      setScore: (n) => {
        if (this.session) this.session.score = n;
      },
    };

    requestAnimationFrame(this._loop);
  }

  /* --------------------------------------------------------------- actions */

  _bindActions() {
    const actions = {
      help: () => {
        this.settingsReturn = null;
        this.ui.show('help');
      },
      pause: () => this.pause(),
      mute: () => this.toggleMute(),
      resume: () => this.resume(),
      restart: () => this.startShift(this.modeName, this.levelId, this.players),
      retry: () => this.startShift(this.modeName, this.levelId, this.players),
      menu: () => this.toMenu(),
      next: () => {
        if (this.levelId < LEVELS.length) this.startShift(this.modeName, this.levelId + 1, this.players);
        else this.toMenu();
      },
      'reset-progress': () => {
        save.resetProgress();
        this.ui._renderStarsTotal();
        this.ui._renderShiftList(this.modeName);
        this.ui.toast('最佳记录已清空');
      },
      'playtest-data': () => {
        const origin = this.ui.screen === 'results' || this.ui.screen === 'pause' ? this.ui.screen : 'settings';
        this.dataReturn = () => this.ui.show(origin);
        this.ui.showPlaytestData();
      },
      'export-csv': () => {
        this._download(`sizzle-rush-playtest-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(), 'text/csv;charset=utf-8');
      },
      'export-json': () => {
        this._download(`sizzle-rush-playtest-${new Date().toISOString().slice(0, 10)}.json`, toJSON(), 'application/json;charset=utf-8');
      },
      'clear-playtest': () => {
        if (typeof confirm === 'function' && !confirm('清空本机所有试玩记录？导出备份后再操作。')) return;
        clearSessions();
        this.ui.showPlaytestData();
      },
      album: () => {
        const returnScreen = this.ui.screen === 'modes' ? 'modes' : 'menu';
        this.albumReturn = () => this.ui.show(returnScreen);
        this.ui.showAlbum();
      },
      'export-album': () => this.ui.exportAlbum(),
      'print-album': () => {
        try {
          window.print();
        } catch {
          /* ignore */
        }
      },
    };
    this.ui.onAction = (name, fn) => {
      actions[name] = fn;
    };
    this.ui.actions = actions;

    // UI's delegated click calls app.onAction(name); route to our table.
    this.onAction = (name) => {
      if (name === 'settings') {
        this.settingsReturn = this.paused || this.resultsOpen ? () => this.ui.show(this.resultsOpen ? 'results' : 'pause') : null;
        this.ui.show('settings');
        return;
      }
      const fn = actions[name];
      if (fn) {
        this.audio.unlock();
        this.audio.play('ui');
        fn();
      }
    };
    this.ui.app = this;
  }

  _bindGlobal() {
    window.addEventListener('resize', () => this.mode?.resize?.());
    document.addEventListener('pointerlockerror', () => {
      /* in headless or unsupported browsers just keep playing with keyboard */
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        if (this.ui.screen === 'settings') {
          if (typeof this.settingsReturn === 'function') this.settingsReturn();
          else this.ui.show('menu');
          return;
        }
        if (this.ui.screen === 'help') {
          this.ui.show('menu');
          return;
        }
        if (!this.active) return;
        if (this.resultsOpen) {
          this.toMenu();
          return;
        }
        if (this.paused) this.resume();
        else this.pause();
      }
    });
  }

  playClick() {
    this.audio.unlock();
    this.audio.startMusic();
    this.audio.setIntensity(0.16);
    this.audio.play('ui');
  }

  /* ------------------------------------------------------------ mode stuff */

  startShift(modeName = this.modeName, levelId = this.levelId, players = this.players) {
    const baseLevel = save.resolveLevel(LEVEL_BY_ID[levelId] || LEVELS[0], modeName);
    const recommendation =
      this.ui?.getRsiRecommendation?.(baseLevel) || rsi.recommendForLevel(baseLevel);
    const level = {
      ...baseLevel,
      recipes: [...new Set([...recommendation.ids, ...baseLevel.recipes])],
      featured: recommendation.ids,
    };
    this.activeRecommendation = recommendation;
    this.activeLevel = level;
    this.modeName = modeName;
    this.levelId = level.id;
    this.players = players;
    this.ui.modeSelection = modeName;
    this.ui.levelSelection = level.id;
    this.ui.playerCount = players;
    this.audio.unlock();
    this.audio.startMusic();
    this.audio.setSizzle(0);
    this.audio.setIntensity(0.28);

    this._teardown();
    this.session = new GameSession(level, {
      seed: Math.floor(Math.random() * 1e9),
      mode: modeName,
      recommended: recommendation.ids,
    });
    this.paused = false;
    this.resultsOpen = false;
    this.active = true;
    this.inputDevice = 'keyboard';
    this.pauseCount = 0;
    this.settingsReturn = null;

    this.ui.hideScreens();
    this.ui.showHUD(modeName, level);
    this.ui.setupTutorial(modeName, modeName === 'fp' ? this.settings.showHints !== false && level.id === 1 : this.settings.showHints !== false && level.id === 1);
    this.ui.showLevelIntro(level, modeName);

    document.getElementById('fp-canvas').classList.toggle('hidden', modeName !== 'fp');
    document.getElementById('arcade-canvas').classList.toggle('hidden', modeName !== 'arcade');

    const touchSetting = this.settings.touchControls || 'auto';
    const forceTouch = typeof location !== 'undefined' && new URLSearchParams(location.search).get('touch') === '1';
    const touchEnabled = modeName === 'arcade' && (touchSetting === 'on' || (touchSetting !== 'off' && (isTouchDevice() || forceTouch)));

    if (modeName === 'fp') {
      this.hands = createHands();
      this.mode = new FirstPersonMode({
        canvas: this.canvasFP,
        session: this.session,
        hands: this.hands,
        settings: this.settings,
        audio: this.audio,
        onPauseRequest: () => this.pause(),
        onDeviceChange: (device) => {
          this.inputDevice = device;
          this.ui.setInputDevice?.(device);
        },
      });
    } else {
      this.mode = new ArcadeMode({
        canvas: this.canvas2D,
        session: this.session,
        settings: this.settings,
        players,
        audio: this.audio,
        onPauseRequest: () => this.pause(),
        onDeviceChange: (device) => {
          this.inputDevice = device;
          this.ui.setInputDevice?.(device);
        },
        touchEnabled,
      });
      this.hands = this.mode.hands;
    }

    if (modeName === 'fp' && touchSetting !== 'off' && isTouchDevice()) {
      this.ui.toast('第一人称需要键鼠或手柄；触屏建议玩街机厨房', 'bad');
    }

    this._bindSessionEvents();
    this.lastTs = performance.now();
    this._setHudVisibility(true);
  }

  _bindSessionEvents() {
    const session = this.session;
    const on = (type, fn) => this._sessionSubs.push(session.events.on(type, fn));
    const ui = this.ui;

    on('pickup', () => {
      this.audio.play('pickup');
      ui.tutorialEvent('pickup');
    });
    on('place', () => this.audio.play('place'));
    on('topping', () => {
      this.audio.play('place');
      ui.tutorialEvent('topping');
    });
    on('chop:done', () => {
      this.audio.play('chopDone');
      ui.tutorialEvent('chop:done');
    });
    on('cook:done', () => {
      this.audio.play('cookDone');
      ui.toast('肉饼熟了，快拿走', 'good');
      ui.tutorialEvent('cook:done');
    });
    on('cook:burn', () => {
      this.audio.play('burn');
      ui.toast('烧焦了！扔进垃圾桶，别上菜', 'bad');
    });
    on('serve', (e) => {
      this.audio.play('serve');
      ui.tutorialEvent('serve');
      ui.scorePop(e.points);
      const combo = e.comboAfter > 1 ? ` · 连击 ×${(1 + Math.min(e.comboAfter - 1, 4) * 0.25).toFixed(2)}` : '';
      ui.toast(`${e.recipe.name} +${e.points}${combo}`, 'good');
      if (e.comboAfter > 1) setTimeout(() => this.audio.play('combo'), 140);
    });
    on('dish:waste', () => {
      this.audio.play('waste');
      ui.toast('这盘菜没人认得出来…', 'bad');
    });
    on('dish:unwanted', (e) => {
      this.audio.play('waste');
      ui.toast(`没有客人点${e.recipe.name}`, 'bad');
    });
    on('order:new', () => this.audio.play('orderNew'));
    on('order:expired', () => {
      this.audio.play('expire');
      ui.toast('订单超时，客人走了', 'bad');
    });
    on('blocked', (e) => {
      const now = performance.now();
      if (e.message && now - this._blockedAt > 1600) {
        this._blockedAt = now;
        ui.toast(e.message, 'bad');
      }
    });
    on('trash', () => this.audio.play('trash'));
    on('level:end', (e) => this._onLevelEnd(e));
  }

  _onLevelEnd(ev) {
    if (this.resultsOpen) return;
    this.resultsOpen = true;
    this.paused = true;
    this.audio.setIntensity(0.08);
    this.audio.play('result');
    this.mode?.pause?.();

    const level = this.activeLevel || save.resolveLevel(LEVEL_BY_ID[this.levelId], this.modeName);
    const prev = save.getBest(this.modeName, this.levelId);
    const isBest = this.session.score > prev.score || this.session.stars > prev.stars;
    save.recordBest(this.modeName, this.levelId, this.session.score, this.session.stars);

    let recorded = null;
    if (this.settings.recordPlaytest !== false) {
      const profile = this.settings.playtestProfile || {};
      try {
        recorded = recordSession({
          mode: this.modeName,
          level: level.id,
          players: this.players,
          source: typeof navigator !== 'undefined' && navigator.webdriver ? 'automation' : 'human',
          device: this.mode?.inputDevice || this.inputDevice || 'keyboard',
          participant: profile.participant || '',
          skill: profile.skill || 'unknown',
          firstTime: profile.firstTime !== false,
          duration: this.session.elapsed,
          firstServe: this.session.firstServeAt,
          pauses: this.pauseCount,
          score: this.session.score,
          stars: this.session.stars,
          served: this.session.stats.served,
          expired: this.session.stats.expired,
          wasted: this.session.stats.wasted,
          burnt: this.session.stats.burnt,
          maxCombo: this.session.maxCombo,
        });
      } catch {
        recorded = null;
      }
    }

    let rsiResult = null;
    try {
      rsiResult = rsi.recordShift({
        mode: this.modeName,
        level: level.id,
        players: this.players,
        recommended: this.activeRecommendation?.ids || level.recipes || [],
        dishCounts: this.session.stats.dishCounts,
        served: this.session.stats.served,
        score: this.session.score,
        stars: this.session.stars,
        timeoutRate:
          this.session.stats.expired /
          Math.max(1, this.session.stats.expired + this.session.stats.served),
        difficulty: recorded?.difficulty || 0,
        wantReplay: recorded?.wantReplay || '',
      });
      this.lastRsiResult = rsiResult;
    } catch {
      rsiResult = null;
    }

    setTimeout(() => {
      if (!this.resultsOpen) return;
      this.ui.showResults({
        session: this.session,
        mode: this.modeName,
        level,
        best: prev,
        isBest,
        recorded,
        rsiResult,
      });
      this.ui._renderStarsTotal();
    }, 700);
  }

  _download(filename, text, mime) {
    try {
      const blob = new Blob([text], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {
      /* downloads can be blocked; the data screen still shows the summary */
    }
  }

  pause() {
    if (!this.active || this.paused || this.resultsOpen) return;
    this.paused = true;
    this.pauseCount++;
    this.mode?.pause?.();
    this.audio.setSizzle(0);
    this.audio.setIntensity(0.05);
    this.ui.showPause(this.session);
  }

  resume() {
    if (!this.active || this.resultsOpen) return;
    this.paused = false;
    this.ui.hideScreens();
    this.mode?.resume?.();
    this.audio.setIntensity(this._intensity());
  }

  toMenu() {
    this._teardown();
    this.active = false;
    this.paused = false;
    this.resultsOpen = false;
    this.audio.setSizzle(0);
    this.audio.setIntensity(0.14);
    this.ui.showMenu();
  }

  _teardown() {
    for (const un of this._sessionSubs) un();
    this._sessionSubs = [];
    if (this.mode) {
      try {
        this.mode.dispose();
      } catch {
        /* ignore */
      }
      this.mode = null;
    }
    this.session = null;
    this.hands = null;
  }

  _setHudVisibility(v) {
    this.ui.refs.hud.classList.toggle('hidden', !v);
  }

  _intensity() {
    if (!this.session) return 0.2;
    const t = 1 - this.session.timeLeft / this.session.duration;
    return clamp(0.28 + t * 0.35 + this.session.combo * 0.05, 0.2, 1);
  }

  toggleMute() {
    this.audio.unlock();
    this.audio.setMuted(!this.audio.muted);
    this.ui.setMuteIcon(this.audio.muted);
  }

  onSettingsChange(settings) {
    this.settings = settings;
    this.audio.setSettings(settings);
    this.mode?.applySettings?.(settings);
  }

  /* --------------------------------------------------------------- debug */

  debugGiveDish(recipeId = 'cheeseburger') {
    if (!this.session || !this.mode) return null;
    const recipe = RECIPES[recipeId];
    if (!recipe) return null;
    const plate = createPlate();
    plate.contents = recipe.ingredients.map((t) => ({ ...t }));
    const hands = this.mode.hands || this.hands;
    hands.carry = plate;
    if (this.mode.players?.[0]) this.mode.players[0].hands.carry = plate;
    const ticket =
      this.session.orders.tickets.find((t) => t.recipeId === recipeId) ||
      (() => {
        const t = {
          id: 9000 + Math.floor(Math.random() * 1000),
          recipeId,
          maxTime: 70,
          time: 70,
          done: false,
          spawnedAt: 0,
        };
        this.session.orders.tickets.push(t);
        return t;
      })();
    return { plate, ticket };
  }

  /* ----------------------------------------------------------------- loop */

  _loop = (ts) => {
    requestAnimationFrame(this._loop);
    const raw = (ts - this.lastTs) / 1000;
    this.lastTs = ts;
    const dt = clamp(Number.isFinite(raw) ? raw : 0.016, 0, 0.1);

    if (!this.active || !this.session || !this.mode) return;

    if (!this.paused && this.session.state === 'playing') {
      this.session.tick(dt);
      this.mode.update(dt);
      this.ui.updateGame(this.session, this.mode);
      this.audio.setIntensity(this._intensity());
    }

    this.mode.render(dt);
  };
}

const app = new App();
export default app;
