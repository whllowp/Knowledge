/**
 * progression.js — XP curve, level-ups, achievements and quest tracking.
 * Kept free of three.js so it can be unit-checked in node.
 */
import { FISH, RARITY } from '../data/fish.js';
import { BAITS, LURES, RODS, LINES, rodById, lineById, lureById, baitById } from '../data/gear.js';

/** XP required to go from level n to n+1. */
export function xpForLevel(n) {
  return Math.round(48 * Math.pow(n, 1.62) + 22 * n);
}

export function totalXpForLevel(level) {
  let sum = 0;
  for (let i = 1; i < level; i++) sum += xpForLevel(i);
  return sum;
}

export const MAX_LEVEL = 60;

export const ACHIEVEMENTS = [
  { id: 'first_cast', name: '第一竿', desc: '完成第一次抛竿', icon: '🎣', check: (s) => s.stats.casts >= 1 },
  { id: 'first_fish', name: '开张大吉', desc: '钓到第一条鱼', icon: '🐟', check: (s) => s.stats.catches >= 1, reward: 50 },
  { id: 'ten_fish', name: '手感来了', desc: '累计钓到 10 条鱼', icon: '🐠', check: (s) => s.stats.catches >= 10, reward: 120 },
  { id: 'fifty_fish', name: '老手', desc: '累计钓到 50 条鱼', icon: '🎏', check: (s) => s.stats.catches >= 50, reward: 500 },
  { id: 'hundred_fish', name: '百鱼猎人', desc: '累计钓到 100 条鱼', icon: '🏅', check: (s) => s.stats.catches >= 100, reward: 1500 },
  { id: 'species_10', name: '图鉴入门', desc: '解锁 10 个图鉴条目', icon: '📖', check: (s) => Object.keys(s.journal).length >= 10, reward: 200 },
  { id: 'species_30', name: '博物学者', desc: '解锁 30 个图鉴条目', icon: '📚', check: (s) => Object.keys(s.journal).length >= 30, reward: 900 },
  { id: 'species_50', name: '鱼类百科', desc: '解锁 50 个图鉴条目', icon: '🧠', check: (s) => Object.keys(s.journal).length >= 50, reward: 3000 },
  { id: 'big_fish', name: '十公斤俱乐部', desc: '钓上一条 10 公斤以上的鱼', icon: '💪', check: (s) => s.stats.biggest >= 10, reward: 800 },
  { id: 'huge_fish', name: '巨物猎人', desc: '钓上一条 100 公斤以上的鱼', icon: '🦈', check: (s) => s.stats.biggest >= 100, reward: 4000 },
  { id: 'legend', name: '传说', desc: '钓到一条传说级鱼', icon: '🌟', check: (s) => Object.keys(s.journal).some((k) => FISH.find((f) => f.id === k && f.rarity === 5)), reward: 5000 },
  { id: 'junk', name: '海底清道夫', desc: '钓上 5 件垃圾', icon: '🥾', check: (s) => s.stats.junk >= 5, reward: 150 },
  { id: 'level_10', name: '小有所成', desc: '达到 10 级', icon: '⭐', check: (s) => s.level >= 10, reward: 400 },
  { id: 'level_30', name: '远近闻名', desc: '达到 30 级', icon: '✨', check: (s) => s.level >= 30, reward: 3000 },
  { id: 'rich', name: '小康', desc: '累计赚取 10000 金币', icon: '💰', check: (s) => s.stats.totalCoins >= 10000, reward: 500 },
  { id: 'explorer', name: '踏遍全岛', desc: '发现 8 个钓点', icon: '🗺️', check: (s) => Object.keys(s.spots || {}).length >= 8, reward: 600 },
  { id: 'swimmer', name: '浪里白条', desc: '累计游泳 5 分钟', icon: '🏊', check: (s) => (s.stats.swimTime || 0) >= 300, reward: 300 },
  { id: 'walker', name: '徒步旅行', desc: '累计行走 10 公里', icon: '🥾', check: (s) => (s.stats.distance || 0) >= 10000, reward: 700 },
  { id: 'rain_fish', name: '雨中人', desc: '在雨天钓到 10 条鱼', icon: '🌧️', check: (s) => (s.stats.rainCatches || 0) >= 10, reward: 500 },
  { id: 'night_fish', name: '夜钓客', desc: '在夜里钓到 10 条鱼', icon: '🌙', check: (s) => (s.stats.nightCatches || 0) >= 10, reward: 500 },
  { id: 'deep_diver', name: '深潜者', desc: '下潜到 8 米以下', icon: '🤿', check: (s) => (s.stats.deepest || 0) >= 8, reward: 400 },
  { id: 'perfect_10', name: '完美控线', desc: '完成 10 次完美收线', icon: '🎯', check: (s) => (s.stats.perfect || 0) >= 10, reward: 900 },
  { id: 'release_10', name: '放流者', desc: '放生 10 条鱼', icon: '🕊️', check: (s) => (s.stats.released || 0) >= 10, reward: 600 },
  { id: 'release_50', name: '与鱼为善', desc: '放生 50 条鱼', icon: '💚', check: (s) => (s.stats.released || 0) >= 50, reward: 2500 },
  { id: 'no_snap', name: '稳如泰山', desc: '连续 20 次收线不断线', icon: '🧵', check: (s) => (s.stats.streak || 0) >= 20, reward: 1200 },
  { id: 'all_rods', name: '装备收藏家', desc: '拥有全部鱼竿', icon: '🎣', check: (s) => RODS.every((r) => r.id === 'bamboo' || s.ownedRods?.includes(r.id)), reward: 8000 },
  { id: 'master', name: '静水之滨的主人', desc: '解锁全部 66 个图鉴条目', icon: '👑', check: (s) => Object.keys(s.journal).length >= FISH.length, reward: 30000 },
];

export const QUESTS = [
  { id: 'q_carp', name: '晚餐吃鱼', desc: '钓到 3 条鲫鱼', target: 3, match: (c) => c.fish.id === 'crucian_carp', reward: { coins: 120, xp: 60 } },
  { id: 'q_bass', name: '掠食者', desc: '用假饵钓到 2 条鲈鱼', target: 2, match: (c) => c.fish.id === 'largemouth_bass' || (c.fish.name || '').includes('鲈'), reward: { coins: 300, xp: 140 } },
  { id: 'q_rain', name: '雨天收获', desc: '在雨天钓到 4 条鱼', target: 4, match: (c) => c.weather === 'rain' || c.weather === 'storm', reward: { coins: 400, xp: 180 } },
  { id: 'q_night', name: '夜行者', desc: '在 22:00 之后钓到 3 条鱼', target: 3, match: (c) => c.hour >= 22 || c.hour < 4, reward: { coins: 450, xp: 200 } },
  { id: 'q_big', name: '十公斤挑战', desc: '钓到一条 10 公斤以上的鱼', target: 1, match: (c) => c.weight >= 10, reward: { coins: 900, xp: 400 } },
  { id: 'q_junk', name: '清理水域', desc: '钓上 4 件垃圾', target: 4, match: (c) => !!c.junk, reward: { coins: 260, xp: 120 } },
  { id: 'q_sea', name: '出海一趟', desc: '在海域钓到 5 条鱼', target: 5, match: (c) => ['ocean_deep', 'ocean_shallow', 'coast', 'reef', 'estuary'].includes(c.region), reward: { coins: 700, xp: 320 } },
  { id: 'q_rare', name: '稀有收藏', desc: '钓到 2 条稀有及以上的鱼', target: 2, match: (c) => c.fish.rarity >= 3, reward: { coins: 800, xp: 380 } },
];

/** Apply a catch to the profile: coins, xp, journal, records, achievements. */
export function applyCatch(profile, catchInfo) {
  const { fish, weight, value, xp, junk } = catchInfo;
  const result = { coins: 0, xp: 0, levelUps: 0, newSpecies: false, newRecord: false, achievements: [], questsDone: [] };

  profile.coins += value;
  profile.stats.totalCoins = (profile.stats.totalCoins || 0) + value;
  result.coins = value;

  // journal
  const entry = profile.journal[fish.id];
  if (!entry) {
    profile.journal[fish.id] = { count: 1, best: weight, first: Date.now() };
    result.newSpecies = true;
  } else {
    entry.count++;
    if (weight > entry.best) {
      entry.best = weight;
      result.newRecord = true;
    }
  }

  profile.stats.catches = (profile.stats.catches || 0) + 1;
  profile.stats.totalWeight = (profile.stats.totalWeight || 0) + weight;
  if (junk) profile.stats.junk = (profile.stats.junk || 0) + 1;
  if (weight > (profile.stats.biggest || 0)) {
    profile.stats.biggest = weight;
    profile.stats.biggestId = fish.id;
  }
  if (catchInfo.weather === 'rain' || catchInfo.weather === 'storm') profile.stats.rainCatches = (profile.stats.rainCatches || 0) + 1;
  if (catchInfo.hour >= 21 || catchInfo.hour < 5) profile.stats.nightCatches = (profile.stats.nightCatches || 0) + 1;
  if (catchInfo.perfect) profile.stats.perfect = (profile.stats.perfect || 0) + 1;
  profile.stats.streak = catchInfo.snapped ? 0 : (profile.stats.streak || 0) + 1;

  // xp + levels
  result.xp = xp;
  profile.xp += xp;
  let guard = 0;
  while (profile.level < MAX_LEVEL && profile.xp >= totalXpForLevel(profile.level + 1) && guard++ < 100) {
    profile.level++;
    result.levelUps++;
    profile.coins += 100 * profile.level;
  }
  return result;
}

export function rarityInfo(r) {
  return RARITY[r] || RARITY[1];
}

export function gearLabel(loadout) {
  return {
    rod: rodById(loadout.rod).name,
    line: lineById(loadout.line).name,
    lure: lureById(loadout.lure).name,
    bait: loadout.bait ? baitById(loadout.bait).name : '无',
  };
}

export const GEAR_TABLES = { RODS, LINES, LURES, BAITS };

/** Progress toward the next level, 0..1. */
export function levelProgress(profile) {
  const base = totalXpForLevel(profile.level);
  const next = totalXpForLevel(profile.level + 1);
  if (profile.level >= MAX_LEVEL) return 1;
  return Math.max(0, Math.min(1, (profile.xp - base) / Math.max(1, next - base)));
}

/** Check achievements and return the ids newly unlocked. */
export function checkAchievements(profile) {
  const unlocked = [];
  for (const a of ACHIEVEMENTS) {
    if (profile.achievements[a.id]) continue;
    let ok = false;
    try {
      ok = !!a.check(profile);
    } catch {
      ok = false;
    }
    if (ok) {
      profile.achievements[a.id] = Date.now();
      if (a.reward) profile.coins += a.reward;
      unlocked.push(a);
    }
  }
  return unlocked;
}

export function questState(profile, id) {
  const q = QUESTS.find((x) => x.id === id);
  const rec = profile.quests?.active?.find((x) => x.id === id) || profile.quests?.done?.find((x) => x.id === id);
  return { def: q, progress: rec?.progress || 0, done: !!profile.quests?.done?.find((x) => x.id === id) };
}

/** Feed a catch into the quest tracker. */
export function trackQuests(profile, catchInfo) {
  if (!profile.quests) profile.quests = { active: [], done: [] };
  const completed = [];
  for (const q of QUESTS) {
    if (profile.quests.done.find((d) => d.id === q.id)) continue;
    let rec = profile.quests.active.find((a) => a.id === q.id);
    if (!rec) {
      rec = { id: q.id, progress: 0 };
      profile.quests.active.push(rec);
    }
    let hit = false;
    try {
      hit = !!q.match(catchInfo);
    } catch {
      hit = false;
    }
    if (hit) rec.progress++;
    if (rec.progress >= q.target) {
      profile.quests.active = profile.quests.active.filter((a) => a.id !== q.id);
      profile.quests.done.push({ id: q.id, at: Date.now() });
      if (q.reward?.coins) profile.coins += q.reward.coins;
      if (q.reward?.xp) {
        profile.xp += q.reward.xp;
        let guard = 0;
        while (profile.level < MAX_LEVEL && profile.xp >= totalXpForLevel(profile.level + 1) && guard++ < 100) profile.level++;
      }
      completed.push(q);
    }
  }
  return completed;
}

/** Estimated sell price of a fish instance. */
export function fishValue(fish, weight, luck = 0) {
  const r = rarityInfo(fish.rarity);
  const sizeK = 0.55 + 0.45 * Math.sqrt(Math.max(0.001, weight / Math.max(0.001, fish.maxWeight)));
  return Math.max(1, Math.round(fish.baseValue * r.valueMult * sizeK * (1 + luck * 0.35)));
}

export function fishXp(fish, weight) {
  const sizeK = 0.7 + 0.6 * Math.sqrt(Math.max(0.001, weight / Math.max(0.001, fish.maxWeight)));
  return Math.max(1, Math.round(fish.xp * sizeK * (1 + fish.rarity * 0.1)));
}
