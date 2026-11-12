// Persistence for settings and best scores. Falls back to memory when
// localStorage is unavailable (node tests, private mode).

const KEY = 'sizzle-rush:v1';

export const DEFAULT_SETTINGS = {
  master: 0.8,
  music: 0.55,
  sfx: 0.85,
  sensitivity: 1.0,
  fov: 74,
  shake: 1.0,
  quality: 1.0,
  invertY: false,
  showHints: true,
  recordPlaytest: true,
  touchControls: 'auto',
  playtestProfile: { participant: '', skill: 'unknown', firstTime: true },
};

const memory = { settings: { ...DEFAULT_SETTINGS }, best: {}, meta: {} };

function readStore() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeStore(data) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify(data));
      return;
    }
  } catch {
    /* ignore */
  }
  memory.settings = data.settings;
  memory.best = data.best;
  memory.meta = data.meta;
}

function load() {
  const stored = readStore();
  if (stored && typeof stored === 'object') {
    return {
      settings: { ...DEFAULT_SETTINGS, ...(stored.settings || {}) },
      best: stored.best || {},
      meta: stored.meta || {},
    };
  }
  return { settings: { ...DEFAULT_SETTINGS }, best: {}, meta: {} };
}

let state = load();

export function getSettings() {
  return { ...state.settings };
}

export function saveSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  writeStore(state);
  return getSettings();
}

export function bestKey(mode, levelId) {
  return `${mode}:${levelId}`;
}

export function getBest(mode, levelId) {
  return state.best[bestKey(mode, levelId)] || { score: 0, stars: 0 };
}

export function allBests() {
  return { ...state.best };
}

export function recordBest(mode, levelId, score, stars) {
  const key = bestKey(mode, levelId);
  const prev = state.best[key] || { score: 0, stars: 0 };
  if (score > prev.score || stars > prev.stars) {
    state.best[key] = { score: Math.max(score, prev.score), stars: Math.max(stars, prev.stars) };
    writeStore(state);
    return state.best[key];
  }
  return prev;
}

export function totalStars() {
  return Object.values(state.best).reduce((n, b) => n + (b.stars || 0), 0);
}

function validTarget(target) {
  return (
    Array.isArray(target) &&
    target.length === 3 &&
    target.every((n) => Number.isFinite(Number(n)) && Number(n) >= 0) &&
    Number(target[0]) <= Number(target[1]) &&
    Number(target[1]) <= Number(target[2])
  );
}

export function getTargetOverride(mode, levelId) {
  const target = state.meta?.targets?.[mode]?.[levelId];
  return validTarget(target) ? target.map(Number) : null;
}

export function setTargetOverride(mode, levelId, target) {
  if (!validTarget(target)) return null;
  state.meta.targets ||= {};
  state.meta.targets[mode] ||= {};
  state.meta.targets[mode][levelId] = target.map((n) => Math.round(Number(n)));
  writeStore(state);
  return getTargetOverride(mode, levelId);
}

export function clearTargetOverrides() {
  state.meta.targets = {};
  writeStore(state);
}

export function targetOverrides() {
  return state.meta?.targets || {};
}

/** Return a level with the local target override applied, if any. */
export function resolveLevel(level, mode) {
  const override = getTargetOverride(mode, level.id);
  return override ? { ...level, target: override } : level;
}

export function resetProgress() {
  state.best = {};
  writeStore(state);
}
