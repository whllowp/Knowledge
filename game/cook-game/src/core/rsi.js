// RSI kitchen brain: a small, local recursive self-improvement loop for menu
// recommendations. It follows the Dream-RSI shape at game scale:
//   online shift -> recorded discovery history -> replay candidate policies
//   offline -> deploy the best policy for the next shift.
// Everything is deterministic and local; no network or LLM calls.

import { RECIPES } from './data.js';

const KEY = 'sizzle-rush:rsi:v1';
const MAX_HISTORY = 180;
const TAG_LIST = ['fresh', 'light', 'veg', 'hearty', 'cheese', 'classic', 'beef', 'onion', 'tomato', 'double'];

export const CITIES = [
  { id: 'shanghai', name: '上海', emoji: '🏙️', tags: ['cheese', 'fresh', 'classic'], line: '弄堂口的芝士香' },
  { id: 'chengdu', name: '成都', emoji: '🌶️', tags: ['onion', 'hearty', 'beef'], line: '雨夜里要一口扎实的' },
  { id: 'guangzhou', name: '广州', emoji: '🌴', tags: ['fresh', 'light', 'veg'], line: '天热也要清爽' },
  { id: 'beijing', name: '北京', emoji: '🏮', tags: ['hearty', 'classic', 'beef'], line: '大风天吃厚实的' },
  { id: 'hangzhou', name: '杭州', emoji: '🌿', tags: ['light', 'fresh', 'tomato'], line: '湖边的小清新' },
];

export const WEATHERS = [
  { id: 'sunny', name: '晴朗', emoji: '☀️', tags: ['fresh', 'light', 'tomato'] },
  { id: 'rain', name: '下雨', emoji: '🌧️', tags: ['hearty', 'cheese', 'classic'] },
  { id: 'snow', name: '下雪', emoji: '❄️', tags: ['hearty', 'beef', 'cheese'] },
  { id: 'heat', name: '热浪', emoji: '🔥', tags: ['fresh', 'light', 'veg'] },
  { id: 'wind', name: '起风', emoji: '🌬️', tags: ['classic', 'onion'] },
];

export const PREFERENCES = [
  { id: 'fresh', name: '清爽', emoji: '🥬' },
  { id: 'veg', name: '素食', emoji: '🥗' },
  { id: 'hearty', name: '肉食', emoji: '🥩' },
  { id: 'cheese', name: '芝士', emoji: '🧀' },
  { id: 'onion', name: '辛香', emoji: '🧅' },
  { id: 'tomato', name: '番茄', emoji: '🍅' },
  { id: 'classic', name: '经典', emoji: '🍔' },
];

export const TAG_NAMES = {
  fresh: '清爽',
  light: '轻食',
  veg: '素食',
  hearty: '厚实',
  cheese: '芝士',
  classic: '经典',
  beef: '牛肉',
  onion: '辛香',
  tomato: '番茄',
  double: '双层',
};

const memory = { state: null };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round = (n, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

function defaultWeights() {
  return Object.fromEntries(TAG_LIST.map((tag) => [tag, 1]));
}

function defaultState(date = new Date()) {
  const month = date.getMonth() + 1;
  const weather = month >= 6 && month <= 8 ? 'heat' : month === 12 || month <= 2 ? 'snow' : 'sunny';
  return {
    version: 1,
    context: { city: 'shanghai', weather, prefs: ['fresh'] },
    policy: { version: 1, weights: defaultWeights(), exploration: 0.12, replayScore: 0, updatedAt: null },
    history: [],
    lastRecommendation: null,
  };
}

function normalize(value) {
  const base = defaultState();
  if (!value || typeof value !== 'object') return base;
  const state = {
    ...base,
    ...value,
    context: { ...base.context, ...(value.context || {}) },
    policy: { ...base.policy, ...(value.policy || {}) },
    history: Array.isArray(value.history) ? value.history.slice(-MAX_HISTORY) : [],
  };
  state.context.prefs = Array.isArray(state.context.prefs)
    ? state.context.prefs.filter((p) => PREFERENCES.some((x) => x.id === p)).slice(0, 4)
    : [];
  if (!CITIES.some((c) => c.id === state.context.city)) state.context.city = base.context.city;
  if (!WEATHERS.some((w) => w.id === state.context.weather)) state.context.weather = base.context.weather;
  state.policy.weights = { ...defaultWeights(), ...(state.policy.weights || {}) };
  for (const tag of TAG_LIST) state.policy.weights[tag] = clamp(Number(state.policy.weights[tag]) || 1, 0.2, 2.5);
  state.policy.version = Math.max(1, Number(state.policy.version) || 1);
  state.policy.exploration = clamp(Number(state.policy.exploration) || 0.12, 0, 0.4);
  return state;
}

function storage() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    /* ignore */
  }
  return null;
}

export function getState() {
  if (memory.state) return memory.state;
  const store = storage();
  if (store) {
    try {
      const raw = store.getItem(KEY);
      if (raw) memory.state = normalize(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }
  if (!memory.state) memory.state = defaultState();
  return memory.state;
}

function persist() {
  if (!memory.state) return;
  const store = storage();
  if (store) {
    try {
      store.setItem(KEY, JSON.stringify(memory.state));
    } catch {
      /* ignore */
    }
  }
}

export function reset() {
  memory.state = defaultState();
  persist();
  return memory.state;
}

export function getContext() {
  return contextInfo(getState());
}

function contextInfo(state) {
  return {
    ...state.context,
    cityInfo: cityById(state.context.city),
    weatherInfo: weatherById(state.context.weather),
    prefsInfo: state.context.prefs.map((id) => PREFERENCES.find((p) => p.id === id)).filter(Boolean),
  };
}

export function setContext(patch = {}) {
  const state = getState();
  state.context = { ...state.context, ...patch };
  state.context.prefs = Array.isArray(state.context.prefs)
    ? state.context.prefs.filter((p) => PREFERENCES.some((x) => x.id === p)).slice(0, 4)
    : state.context.prefs;
  if (!CITIES.some((c) => c.id === state.context.city)) state.context.city = 'shanghai';
  if (!WEATHERS.some((w) => w.id === state.context.weather)) state.context.weather = 'sunny';
  persist();
  return getContext();
}

/** Infer a nearby city from the browser timezone, without geolocation/network. */
export function detectCityId() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/Chongqing|Chengdu/i.test(tz)) return 'chengdu';
    if (/Guangzhou|Shenzhen/i.test(tz)) return 'guangzhou';
    if (/Beijing|Tianjin/i.test(tz)) return 'beijing';
    if (/Hangzhou/i.test(tz)) return 'hangzhou';
    if (/Shanghai/i.test(tz)) return 'shanghai';
  } catch {
    /* ignore */
  }
  return 'shanghai';
}

/** Seasonal weather guess; deterministic per city/day, not a live weather API. */
export function seasonalWeather(cityId = 'shanghai', date = new Date()) {
  const month = date.getMonth() + 1;
  let base = 'sunny';
  if (month >= 6 && month <= 8) base = 'heat';
  else if (month === 12 || month <= 2) base = 'snow';
  else if (month >= 3 && month <= 5) base = 'rain';
  else base = 'wind';
  const variants = {
    heat: ['heat', 'sunny', 'wind'],
    snow: ['snow', 'wind'],
    rain: ['rain', 'wind'],
    wind: ['wind', 'rain', 'sunny'],
    sunny: ['sunny', 'wind'],
  };
  const list = variants[base] || [base];
  return list[Math.floor(hash(`${cityId}|${dateInfo(date).key}|${base}`) * list.length)] || base;
}

export function autoContext(date = new Date()) {
  const city = detectCityId();
  const weather = seasonalWeather(city, date);
  return setContext({ city, weather });
}

export function cityById(id) {
  return CITIES.find((c) => c.id === id) || CITIES[0];
}

export function weatherById(id) {
  return WEATHERS.find((w) => w.id === id) || WEATHERS[0];
}

function dateInfo(date) {
  const d = date instanceof Date ? date : new Date(date);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
  };
}

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < String(text).length; i++) {
    h ^= String(text).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

function recipeTotals(history) {
  const totals = {};
  for (const record of history || []) {
    for (const [id, count] of Object.entries(record.dishCounts || {})) {
      totals[id] = (totals[id] || 0) + (Number(count) || 0);
    }
  }
  return totals;
}

function scoreRecipe(recipe, state, totals, recent, dateKey, variant) {
  const context = state.context;
  const city = cityById(context.city);
  const weather = weatherById(context.weather);
  const tags = new Set(recipe.tags || []);
  const w = (tag) => state.policy.weights[tag] ?? 1;
  let score = 0.25;
  const reasons = [];

  for (const tag of tags) {
    score += w(tag) * 0.3;
    if (city.tags.includes(tag)) score += w(tag) * 0.8;
    if (weather.tags.includes(tag)) score += w(tag) * 1.0;
    if (context.prefs.includes(tag)) score += w(tag) * 1.25;
  }

  const cityHit = city.tags.filter((tag) => tags.has(tag));
  if (cityHit.length) reasons.push(`${city.name} · ${cityHit.map((t) => TAG_NAMES[t]).join('/')}`);
  const weatherHit = weather.tags.filter((tag) => tags.has(tag));
  if (weatherHit.length) reasons.push(`${weather.name} · ${weatherHit.map((t) => TAG_NAMES[t]).join('/')}`);
  const prefHit = context.prefs.filter((tag) => tags.has(tag));
  if (prefHit.length) reasons.push(`你偏好 · ${prefHit.map((t) => TAG_NAMES[t]).join('/')}`);

  if (weather.id === 'heat' && (tags.has('fresh') || tags.has('light'))) score += 0.5;
  if (weather.id === 'heat' && tags.has('hearty')) score -= 0.35;
  if ((weather.id === 'rain' || weather.id === 'snow') && (tags.has('hearty') || tags.has('cheese'))) score += 0.45;

  const made = totals[recipe.id] || 0;
  score += Math.max(0, 0.8 - made * 0.12);
  if (made === 0) reasons.push('没做过 · 新鲜感');
  else if (made >= 4) reasons.push(`做过 ${made} 次`);
  if (recent.includes(recipe.id)) score -= 0.18;
  if (recipe.tier === 3) score += 0.05;
  score += hash(`${dateKey}|${recipe.id}|${variant}`) * 0.08;

  return { recipe, score, reasons: reasons.slice(0, 3), made };
}

export function recommendForLevel(level, { state = getState(), date = new Date(), variant = 0 } = {}) {
  const tier = Number(level?.tier) || 3;
  const info = dateInfo(date);
  const totals = recipeTotals(state.history);
  const recent = (state.history || []).slice(-6).flatMap((h) => h.recommended || []);
  const candidates = Object.values(RECIPES).filter((recipe) => (recipe.tier || 1) <= tier);
  const scored = candidates
    .map((recipe) => scoreRecipe(recipe, state, totals, recent, info.key, variant))
    .sort((a, b) => b.score - a.score || a.recipe.id.localeCompare(b.recipe.id));

  // One exploration slot: among the next few dishes, prefer the least-cooked.
  let picked = scored.slice(0, 3);
  const pool = scored.slice(0, Math.max(3, Math.min(8, scored.length)));
  if (variant > 0 && pool.length > 3) {
    const offset = variant % pool.length;
    picked = [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, 3);
  }
  if (state.policy.exploration > 0 && pool.length > 3) {
    const rest = pool.slice(3);
    const novel = rest
      .filter((x) => !picked.some((p) => p.recipe.id === x.recipe.id))
      .sort((a, b) => a.made - b.made || b.score - a.score)[0];
    if (novel && novel.made < 2) picked = [...picked.slice(0, 2), novel];
  }

  return {
    ids: picked.map((x) => x.recipe.id),
    items: picked.map((x) => ({
      id: x.recipe.id,
      name: x.recipe.name,
      emoji: x.recipe.emoji,
      score: x.recipe.score,
      tier: x.recipe.tier,
      tags: x.recipe.tags || [],
      reasons: x.reasons,
      predicted: round(x.score),
    })),
    context: contextInfo(state),
    tier,
    policyVersion: state.policy.version,
    date: info,
    variant,
  };
}

function policyScore(state, weights, history, exploration = state.policy.exploration) {
  if (!history.length) return 0;
  let total = 0;
  for (let i = 0; i < history.length; i++) {
    const record = history[i];
    const temp = {
      ...state,
      context: { ...state.context, ...(record.context || {}) },
      history: history.slice(0, i),
      policy: { ...state.policy, weights, exploration },
    };
    const level = { tier: Math.max(1, Math.min(3, Number(record.level) || 1)) };
    const rec = recommendForLevel(level, { state: temp, date: record.at || new Date(), variant: 0 });
    const served = Object.values(record.dishCounts || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const hit = served ? rec.ids.reduce((n, id) => n + (Number(record.dishCounts?.[id]) || 0), 0) / served : 0;
    const satisfaction =
      (Number(record.stars) || 0) / 3 * 0.5 +
      (1 - clamp(Number(record.timeoutRate) || 0, 0, 1)) * 0.3 +
      (record.wantReplay === 'yes' ? 0.15 : record.wantReplay === 'maybe' ? 0.07 : 0) +
      (Number(record.difficulty) >= 3 && Number(record.difficulty) <= 4 ? 0.05 : 0);
    total += hit * 0.6 + satisfaction * 0.4;
  }
  return total / history.length;
}

export function improvePolicy(state = getState()) {
  const history = state.history || [];
  if (history.length < 2) {
    return { changed: false, reason: 'need-more-shifts', score: state.policy.replayScore, candidates: 0 };
  }
  const currentWeights = { ...state.policy.weights };
  const currentExploration = state.policy.exploration;
  let best = { weights: currentWeights, score: policyScore(state, currentWeights, history, currentExploration), exploration: currentExploration };
  const candidates = [];
  for (const tag of TAG_LIST) {
    for (const delta of [-0.2, 0.2]) {
      const weights = { ...currentWeights, [tag]: clamp(currentWeights[tag] + delta, 0.2, 2.5) };
      const score = policyScore(state, weights, history, currentExploration);
      candidates.push({ weights, score, tag, delta });
      if (score > best.score + 1e-6) best = { weights, score, exploration: currentExploration };
    }
  }
  for (const exploration of [0.05, 0.2, 0.3]) {
    const score = policyScore(state, currentWeights, history, exploration);
    candidates.push({ weights: currentWeights, score, exploration });
    if (score > best.score + 1e-6) best = { weights: currentWeights, score, exploration };
  }

  // Empirical candidate: move weights toward tags the kitchen actually served.
  const empirical = { ...defaultWeights() };
  for (const record of history) {
    for (const [id, count] of Object.entries(record.dishCounts || {})) {
      const recipe = RECIPES[id];
      if (!recipe) continue;
      for (const tag of recipe.tags || []) {
        empirical[tag] = clamp((empirical[tag] || 1) + (Number(count) || 0) * 0.12, 0.2, 2.5);
      }
    }
  }
  const empiricalScore = policyScore(state, empirical, history, currentExploration);
  candidates.push({ weights: empirical, score: empiricalScore, source: 'empirical' });
  if (empiricalScore > best.score + 1e-6) best = { weights: empirical, score: empiricalScore, exploration: currentExploration };

  const previous = state.policy.replayScore || 0;
  if (best.score <= previous + 1e-5) {
    state.policy.replayScore = round(Math.max(previous, best.score), 4);
    persist();
    return { changed: false, reason: 'no-better-policy', score: round(best.score, 4), candidates: candidates.length };
  }
  state.policy = {
    ...state.policy,
    weights: best.weights,
    exploration: clamp(best.exploration ?? state.policy.exploration, 0, 0.4),
    replayScore: round(best.score, 4),
    version: state.policy.version + 1,
    updatedAt: new Date().toISOString(),
  };
  persist();
  return {
    changed: true,
    fromVersion: state.policy.version - 1,
    toVersion: state.policy.version,
    score: round(best.score, 4),
    delta: round(best.score - previous, 4),
    candidates: candidates.length,
  };
}

export function recordShift(entry) {
  const state = getState();
  const info = dateInfo(entry.at || new Date());
  const recommended = Array.isArray(entry.recommended) ? entry.recommended.filter((id) => RECIPES[id]) : [];
  const dishCounts = {};
  for (const [id, n] of Object.entries(entry.dishCounts || {})) {
    if (RECIPES[id] && Number(n) > 0) dishCounts[id] = Number(n);
  }
  const record = {
    id: entry.id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    at: entry.at || new Date().toISOString(),
    year: info.year,
    month: info.month,
    day: info.day,
    mode: entry.mode === 'arcade' ? 'arcade' : 'fp',
    level: Number(entry.level) || 1,
    players: Number(entry.players) || 1,
    context: { ...state.context },
    recommended,
    dishCounts,
    served: Math.max(0, Math.round(entry.served || 0)),
    score: Math.max(0, Math.round(entry.score || 0)),
    stars: Math.max(0, Math.min(3, Math.round(entry.stars || 0))),
    timeoutRate: clamp(Number(entry.timeoutRate) || 0, 0, 1),
    difficulty: Math.max(0, Math.min(5, Math.round(entry.difficulty || 0))),
    wantReplay: ['yes', 'maybe', 'no'].includes(entry.wantReplay) ? entry.wantReplay : '',
    policyVersion: state.policy.version,
  };
  state.history.push(record);
  state.history = state.history.slice(-MAX_HISTORY);
  state.lastRecommendation = recommended;
  const improvement = improvePolicy(state);
  record.policyVersion = state.policy.version;
  persist();
  return { record, improvement, policy: { ...state.policy } };
}

export function getAlbum(year = new Date().getFullYear(), state = getState()) {
  const y = Number(year) || new Date().getFullYear();
  const shifts = state.history.filter((r) => Number(r.year) === y);
  const totals = recipeTotals(shifts);
  const dishes = Object.entries(totals)
    .map(([id, count]) => ({ ...RECIPES[id], id, count }))
    .filter((d) => d.name)
    .sort((a, b) => b.count - a.count || b.score - a.score);
  const cityCounts = {};
  const weatherCounts = {};
  const months = new Map();
  for (const r of shifts) {
    cityCounts[r.context?.city] = (cityCounts[r.context?.city] || 0) + 1;
    weatherCounts[r.context?.weather] = (weatherCounts[r.context?.weather] || 0) + 1;
    const key = Number(r.month) || 1;
    if (!months.has(key)) months.set(key, { month: key, shifts: 0, dishes: {} });
    const m = months.get(key);
    m.shifts++;
    for (const [id, n] of Object.entries(r.dishCounts || {})) m.dishes[id] = (m.dishes[id] || 0) + Number(n);
  }
  const cityList = Object.entries(cityCounts)
    .map(([id, count]) => ({ ...cityById(id), count }))
    .sort((a, b) => b.count - a.count);
  const weatherList = Object.entries(weatherCounts)
    .map(([id, count]) => ({ ...weatherById(id), count }))
    .sort((a, b) => b.count - a.count);
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const monthList = [...months.values()]
    .sort((a, b) => a.month - b.month)
    .map((m) => {
      const top = Object.entries(m.dishes).sort((a, b) => b[1] - a[1])[0];
      return {
        ...m,
        label: monthNames[m.month - 1],
        totalDishes: Object.values(m.dishes).reduce((a, b) => a + b, 0),
        top: top ? { ...RECIPES[top[0]], count: top[1] } : null,
      };
    });
  const seasonOf = (m) => (m >= 3 && m <= 5 ? '春' : m >= 6 && m <= 8 ? '夏' : m >= 9 && m <= 11 ? '秋' : '冬');
  const seasons = ['春', '夏', '秋', '冬'].map((name) => {
    const list = monthList.filter((m) => seasonOf(m.month) === name);
    return { name, shifts: list.reduce((n, m) => n + m.shifts, 0), dishes: list.reduce((n, m) => n + m.totalDishes, 0), months: list };
  });
  const bestShift = shifts.reduce((best, r) => (!best || r.score > best.score ? r : best), null);
  const totalDishes = dishes.reduce((n, d) => n + d.count, 0);
  const topDish = dishes[0] || null;
  const topCity = cityList[0] || null;
  const topWeather = weatherList[0] || null;
  const policyVersions = [...new Set(shifts.map((r) => r.policyVersion).filter(Boolean))];
  const memoir = [];
  if (!shifts.length) {
    memoir.push(`这一年还没有开火记录。去厨房做第一道菜，RSI 会把它们收进相册。`);
  } else {
    memoir.push(
      `${y} 年，你在 ${topCity ? topCity.name : '这座城市'} 的 ${shifts.length} 个班次里，端出了 ${totalDishes} 道菜。` +
        (topWeather ? `最常遇到的是${topWeather.name}。` : ''),
    );
    if (topDish) {
      memoir.push(`最常做的是${topDish.name}，一共 ${topDish.count} 次。${topDish.desc}，是你这一年最熟练的味道。`);
    }
    if (bestShift) {
      memoir.push(
        `最高分的一班是 ${bestShift.mode === 'arcade' ? '街机厨房' : '沉浸厨房'} SHIFT ${String(bestShift.level).padStart(2, '0')}，${bestShift.score} 分、${bestShift.stars} 星。`,
      );
    }
    if (policyVersions.length) {
      const from = Math.min(...policyVersions);
      const to = Math.max(...policyVersions);
      memoir.push(
        to > from
          ? `RSI 厨房大脑从 v${from} 长到 v${to}，学会了在${topWeather ? topWeather.name : '不同天气'}里先推荐什么。`
          : `RSI 厨房大脑还停在 v${from}，正在攒更多回放样本。`,
      );
    }
    if (cityList.length > 1) {
      memoir.push(`你走过 ${cityList.map((c) => c.name).join('、')}，每座城市都留下了一张菜单。`);
    }
  }
  return {
    year: y,
    shifts,
    totalShifts: shifts.length,
    totalDishes,
    totalScore: shifts.reduce((n, r) => n + (Number(r.score) || 0), 0),
    totalStars: shifts.reduce((n, r) => n + (Number(r.stars) || 0), 0),
    dishes,
    topDish,
    cities: cityList,
    weathers: weatherList,
    months: monthList,
    seasons,
    bestShift,
    policyVersions,
    memoir,
    generatedAt: new Date().toISOString(),
  };
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

export function buildAlbumHTML(album) {
  const dishCards = album.dishes
    .map(
      (d) => `<div class="dish"><div class="emoji">${esc(d.emoji)}</div><div><b>${esc(d.name)}</b><small>${d.count} 次 · ${esc(d.desc)}</small></div></div>`,
    )
    .join('');
  const monthRows = album.months
    .map(
      (m) => `<div class="month"><b>${esc(m.label)}</b><span>${m.shifts} 班 · ${m.totalDishes} 道${m.top ? ` · 最常做 ${esc(m.top.name)}` : ''}</span></div>`,
    )
    .join('');
  const seasonRows = album.seasons
    .filter((s) => s.shifts > 0)
    .map((s) => `<span class="season"><b>${esc(s.name)}</b>${s.shifts} 班 · ${s.dishes} 道</span>`)
    .join('');
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>${album.year} 灶台风暴年度相册</title>
<style>
body{margin:0;background:#120b08;color:#f7e8d0;font-family:"Microsoft YaHei",system-ui,sans-serif}
.wrap{max-width:860px;margin:0 auto;padding:48px 28px 80px}
.kicker{letter-spacing:.28em;color:#f6a623;font-size:12px}.title{font-size:56px;margin:8px 0;line-height:1}
.sub{color:#bfae98;margin-bottom:28px}.stats{display:flex;gap:20px;flex-wrap:wrap;margin:24px 0 32px}
.stat{background:#1e130e;border:1px solid #3a2a20;border-radius:14px;padding:14px 18px;min-width:120px}
.stat b{display:block;font-size:28px;color:#ffd27a}.stat span{font-size:11px;color:#bfae98}
h2{font-size:22px;margin:32px 0 12px;color:#ffd27a}.memoir p{line-height:1.9;color:#d9c3a6}
.dishes{display:grid;grid-template-columns:1fr 1fr;gap:10px}.dish{display:flex;gap:12px;align-items:center;background:#1e130e;border:1px solid #3a2a20;border-radius:12px;padding:10px}
.dish .emoji{font-size:30px}.dish small{display:block;color:#bfae98;font-size:11px;margin-top:3px}
.month{display:flex;justify-content:space-between;border-bottom:1px dashed #3a2a20;padding:9px 0;font-size:13px}.month span{color:#bfae98}
.season{display:inline-block;margin:10px 6px 0 0;padding:6px 9px;border:1px solid #3a2a20;border-radius:7px;font-size:11px;color:#bfae98}.season b{color:#ffd27a;margin-right:5px}
.foot{margin-top:36px;color:#8f7d68;font-size:11px}
</style></head><body><div class="wrap">
<div class="kicker">SIZZLE! · RSI KITCHEN BRAIN</div><h1 class="title">${album.year} 年度相册</h1>
<div class="sub">一份由班次、城市、天气和推荐菜单生成的回忆录</div>
<div class="stats">
<div class="stat"><b>${album.totalShifts}</b><span>班次</span></div>
<div class="stat"><b>${album.totalDishes}</b><span>端出的菜</span></div>
<div class="stat"><b>${album.totalStars}</b><span>星星</span></div>
<div class="stat"><b>${album.totalScore}</b><span>总分</span></div>
</div>
<h2>回忆录</h2><div class="memoir">${album.memoir.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
<h2>这一年做过的菜</h2><div class="dishes">${dishCards || '<p>还没有菜。</p>'}</div>
<h2>月份</h2>${monthRows || '<p>还没有月份记录。</p>'}
${seasonRows ? `<div class="seasons">${seasonRows}</div>` : ''}
<div class="foot">生成于 ${esc(new Date(album.generatedAt).toLocaleString('zh-CN'))} · RSI 本机档案</div>
</div></body></html>`;
}

export function getPolicy() {
  return { ...getState().policy };
}
