/**
 * save.js — localStorage persistence with schema versioning and migration.
 *
 * The whole player profile lives under a single key. `SaveManager.VERSION`
 * is bumped whenever the shape changes; `migrate()` upgrades older payloads
 * in place so a save from v3 still loads in v10.
 */
import { clamp } from './util.js';

const STORAGE_KEY = 'stillwaters.profile';

export class SaveManager {
  /** Current schema version. Bump on every breaking change. */
  static VERSION = 10;

  constructor(key = STORAGE_KEY) {
    this.key = key;
    this.available = SaveManager.storageAvailable();
    this._lastError = null;
  }

  static storageAvailable() {
    try {
      const t = '__sw_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return true;
    } catch {
      return false;
    }
  }

  get lastError() {
    return this._lastError;
  }

  has() {
    if (!this.available) return false;
    try {
      return !!window.localStorage.getItem(this.key);
    } catch {
      return false;
    }
  }

  save(state) {
    if (!this.available) return false;
    try {
      const payload = {
        v: SaveManager.VERSION,
        savedAt: Date.now(),
        state,
      };
      window.localStorage.setItem(this.key, JSON.stringify(payload));
      this._lastError = null;
      return true;
    } catch (err) {
      this._lastError = err;
      console.warn('[save] failed:', err);
      return false;
    }
  }

  /** Returns the saved state object, or null. */
  load() {
    if (!this.available) return null;
    let raw;
    try {
      raw = window.localStorage.getItem(this.key);
    } catch {
      return null;
    }
    if (!raw) return null;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.warn('[save] corrupt payload, ignoring:', err);
      this._lastError = err;
      return null;
    }
    if (!parsed || typeof parsed !== 'object') return null;
    const fromVersion = Number(parsed.v) || 1;
    let state = parsed.state;
    if (!state || typeof state !== 'object') return null;
    state = SaveManager.migrate(state, fromVersion);
    state.__loadedFrom = fromVersion;
    state.__savedAt = parsed.savedAt || 0;
    return state;
  }

  /** Metadata for the main menu ("continue" button). */
  peek() {
    const state = this.load();
    if (!state) return null;
    return {
      level: state.level || 1,
      coins: state.coins || 0,
      species: state.journal ? Object.keys(state.journal).length : 0,
      playtime: state.stats?.playtime || 0,
      savedAt: state.__savedAt || 0,
      version: state.__loadedFrom,
    };
  }

  clear() {
    if (!this.available) return;
    try {
      window.localStorage.removeItem(this.key);
    } catch (err) {
      this._lastError = err;
    }
  }

  /**
   * Forward-migrate an old save. Each step is defensive: missing fields get
   * sane defaults so a partially written save never breaks the boot.
   */
  static migrate(state, fromVersion) {
    const s = { ...state };
    let v = fromVersion;

    if (v < 2) {
      s.bait = s.bait || {};
      s.lures = s.lures || [];
      v = 2;
    }
    if (v < 3) {
      s.journal = s.journal || {};
      s.achievements = s.achievements || {};
      v = 3;
    }
    if (v < 4) {
      s.weather = s.weather || 'clear';
      s.timeOfDay = typeof s.timeOfDay === 'number' ? s.timeOfDay : 6.5;
      v = 4;
    }
    if (v < 5) {
      s.stats = s.stats || {};
      v = 5;
    }
    if (v < 6) {
      s.spots = s.spots || {};
      s.settings = s.settings || {};
      v = 6;
    }
    if (v < 7) {
      s.quests = s.quests || { active: [], done: [] };
      v = 7;
    }
    if (v < 8) {
      s.rodDurability = s.rodDurability || {};
      v = 8;
    }
    if (v < 9) {
      s.records = s.records || {};
      v = 9;
    }
    if (v < 10) {
      s.photoMode = false;
      s.boatUnlocked = !!s.boatUnlocked;
      v = 10;
    }

    // Clamp obviously wrong values so a hand-edited save cannot wedge the game.
    s.level = clamp(Number(s.level) || 1, 1, 99);
    s.coins = Math.max(0, Number(s.coins) || 0);
    s.xp = Math.max(0, Number(s.xp) || 0);
    return s;
  }
}

/** Rough "everything the player owns and knows" default profile. */
export function defaultProfile() {
  return {
    level: 1,
    xp: 0,
    coins: 50,
    rod: 'bamboo',
    line: 'nylon_2',
    lure: 'none',
    bait: { worm: 10, bread: 5 },
    lures: [],
    journal: {},
    records: {},
    achievements: {},
    quests: { active: [], done: [] },
    spots: {},
    rodDurability: {},
    pantry: [],
    buffs: [],
    photos: [],
    weather: 'clear',
    timeOfDay: 6.5,
    boatUnlocked: false,
    photoMode: false,
    settings: {
      // v3.2.0: default to 'medium' so the whole browser stays inside the
      // 800 MB memory budget; 'high' is one click away in the settings panel.
      quality: 'medium',
      viewMode: 'first',
      sensitivity: 1,
      invertY: false,
      fov: 72,
      volumeMaster: 0.7,
      volumeSfx: 0.85,
      volumeAmbience: 0.6,
      showPerf: false,
      showMinimap: true,
      wildlife: true,
      haptics: true,
      shake: 1,
      dragIndicator: true,
      dragSetting: 1,
      treeDensity: 1,
      renderScale: 1,
      dayLengthMin: 24,
      autoSave: true,
      shadows: true,
      tutorialDone: false,
    },
    stats: {
      casts: 0,
      catches: 0,
      escapes: 0,
      snapped: 0,
      junk: 0,
      biggest: 0,
      biggestId: null,
      totalWeight: 0,
      totalCoins: 0,
      playtime: 0,
      distance: 0,
      swimTime: 0,
      deepest: 0,
      days: 1,
    },
  };
}
