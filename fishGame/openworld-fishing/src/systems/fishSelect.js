/**
 * fishSelect.js — pure species-selection logic (no three.js, no DOM).
 *
 * Split out of the fishing system so the exact same weighting code can be
 * audited from node (`scripts/audit-fish.mjs`) and reused by the journal UI.
 *
 * Design rules learned from the audit:
 *  - `waters` is a HARD filter (it defines the water body you are fishing).
 *  - `biomes` is a hard filter too, but if it leaves fewer than 5 species the
 *    pool is widened to a soft biome weight, so no spot is a one-fish lottery.
 *  - depth is a SOFT gaussian fit, not a cut: a shallow fish still shows up in
 *    deeper water, just less often.
 *  - probability is per rarity TIER (normalised by group size). Without this
 *    the six junk items and the large common-fish tier swamped everything.
 *  - junk gets a small fixed share of the table instead of competing per tier.
 */
import { FISH, RARITY } from '../data/fish.js';

export const VALID_BIOMES = ['ocean_deep', 'ocean_shallow', 'coast', 'reef', 'lake', 'river', 'pond', 'swamp', 'estuary'];

const JUNK_SHARE = 0.05;

/** Which `waters` ids exist in a water body (matches the fish data enum). */
export function watersForRegion(region, depth) {
  switch (region) {
    case 'lake':
      return depth > 6 ? ['lake', 'deep', 'shore'] : ['lake', 'shore'];
    case 'pond':
      return ['pond', 'shore'];
    case 'river':
      return ['river', 'shore'];
    case 'swamp':
      return ['swamp', 'shore'];
    case 'estuary':
      return ['estuary', 'shore', 'ocean'];
    case 'reef':
      return ['reef', 'ocean'];
    case 'ocean_deep':
      return ['ocean', 'deep'];
    case 'ocean_shallow':
      return ['ocean', 'shore'];
    case 'coast':
      return ['shore', 'ocean'];
    case 'shore':
      return ['shore', 'lake', 'pond'];
    default:
      return ['shore', 'ocean', 'lake'];
  }
}

export function inTimeWindow(hour, window) {
  const [a, b] = window;
  if (a === b) return true;
  if (a < b) return hour >= a && hour < b;
  return hour >= a || hour < b; // wraps midnight
}

/** Gaussian depth preference, 0..1. */
export function depthFit(fish, depth) {
  const [d0, d1] = fish.depthM;
  const center = (d0 + d1) / 2;
  const spread = Math.max(1.6, (d1 - d0) / 2 + 2.6);
  const t = (depth - center) / spread;
  return Math.exp(-t * t);
}

/**
 * Species that can be caught here, with a depth fit and a biome-match flag.
 * @param {object} ctx   { region, biome, depth, waters, biomes, spot }
 * @param {object} opts  { level }
 */
export function filterPool(ctx, opts, diag = null) {
  const rejected = diag ? { level: 0, waters: 0, depth: 0, biome: 0 } : null;
  const all = [];
  for (const fish of FISH) {
    if (fish.minLevel > opts.level) {
      if (rejected) rejected.level++;
      continue;
    }
    if (!fish.waters.some((x) => ctx.waters.includes(x))) {
      if (rejected) rejected.waters++;
      continue;
    }
    const fit = depthFit(fish, ctx.depth);
    if (fit < 0.04) {
      if (rejected) rejected.depth++;
      continue;
    }
    const biomeOk = fish.biomes.some((x) => ctx.biomes.includes(x));
    all.push({ fish, fit, biomeOk });
  }

  let list = all.filter((e) => e.biomeOk);
  let widened = 0;
  if (list.length < 5) {
    list = all;
    widened = 1;
  }
  if (!list.length) {
    // last resort: anything legal by level
    list = FISH.filter((f) => f.minLevel <= opts.level).map((f) => ({ fish: f, fit: 0.5, biomeOk: false }));
    widened = 2;
  }
  if (diag) {
    rejected.biome = all.length - all.filter((e) => e.biomeOk).length;
    diag.rejected = rejected;
    diag.widened = widened;
  }
  return list;
}

/** Full weight table for a context. */
export function buildWeights(ctx, opts, diag = null) {
  const { hour, weather, lure, bait, luck } = opts;
  const entries = filterPool(ctx, opts, diag);

  const fishEntries = [];
  const junkEntries = [];
  for (const e of entries) (e.fish.junk ? junkEntries : fishEntries).push(e);

  // ---- group the real fish by rarity tier
  const groups = new Map();
  for (const e of fishEntries) {
    if (!groups.has(e.fish.rarity)) groups.set(e.fish.rarity, []);
    groups.get(e.fish.rarity).push(e);
  }

  const weighted = [];
  let total = 0;
  const push = (fish, weight) => {
    weight = Math.max(1e-6, weight);
    weighted.push({ fish, weight });
    total += weight;
  };

  const envFactor = (e) => {
    const fish = e.fish;
    let w = 0.25 + e.fit * 1.75; // depth suitability
    if (e.biomeOk) w *= 1.25;
    w *= fish.weather.includes(weather) ? 1 + (fish.weatherBonus || 0) * 2.2 : 0.3;
    w *= inTimeWindow(hour, fish.time) ? 1.4 : 0.18;
    if (lure && lure.id !== 'none') {
      if (fish.name && lure.targets?.some((t) => fish.name.includes(t) || (fish.en || '').toLowerCase().includes(t.toLowerCase()))) w *= 2.6;
      if (lure.biomes?.includes(ctx.region) || lure.biomes?.includes(ctx.biome)) w *= 1.3;
    }
    if (bait) w *= 1 + (bait.rarity || 0) * fish.rarity * 1.6;
    if (ctx.spot) w *= 1 + (fish.rarity - 1) * 0.06;
    if (fish.depth === 'deep' && ctx.depth > 10) w *= 1.15;
    return w;
  };

  for (const [rarity, list] of groups) {
    const tier = RARITY[rarity] || RARITY[1];
    let tierWeight = tier.weight;
    if (rarity >= 3) tierWeight *= 1 + luck * (rarity - 1) * 0.8;
    // A tier's total odds are shared by its members in proportion to how well
    // they suit the water, so a tier with one species cannot take everything
    // and the tier odds stay stable as the pool grows.
    let envSum = 0;
    for (const e of list) envSum += envFactor(e);
    if (envSum <= 0) envSum = list.length;
    for (const e of list) {
      push(e.fish, (tierWeight * envFactor(e)) / envSum);
    }
  }

  // ---- junk gets a small fixed share
  if (junkEntries.length) {
    let share = JUNK_SHARE * (1 + (bait?.junk || 0));
    if (lure && lure.id !== 'none') share *= 0.3;
    let envSum = 0;
    for (const e of junkEntries) envSum += envFactor(e);
    if (envSum <= 0) envSum = junkEntries.length;
    for (const e of junkEntries) {
      push(e.fish, (share * envFactor(e)) / envSum);
    }
    // normalise so junk is `share` of the realised distribution
    const realTotal = total - share;
    if (realTotal > 0) {
      const scale = (1 - share) / realTotal;
      for (const w of weighted) {
        if (!w.fish.junk) w.weight *= scale;
      }
      total = 1;
    }
  } else if (total > 0) {
    for (const w of weighted) w.weight /= total;
    total = 1;
  }

  if (diag) {
    diag.weighted = weighted;
    diag.total = total;
    diag.groups = Object.fromEntries([...groups].map(([r, l]) => [r, l.length]));
    diag.pool = [...fishEntries, ...junkEntries].map((e) => e.fish);
  }
  return {
    weighted,
    total,
    byRarity: Object.fromEntries([...groups].map(([r, l]) => [r, l.length])),
    junkCount: junkEntries.length,
    widened: diag?.widened ?? 0,
    pool: [...fishEntries, ...junkEntries].map((e) => e.fish),
  };
}

/** Weighted pick. `rng` is injectable for deterministic audits. */
export function rollFish(ctx, opts, rng = Math.random, diag = null) {
  const table = buildWeights(ctx, opts, diag);
  const { weighted, total } = table;
  if (!weighted.length) return FISH[0];
  let r = rng() * total;
  for (let i = 0; i < weighted.length; i++) {
    r -= weighted[i].weight;
    if (r <= 0) return weighted[i].fish;
  }
  return weighted[weighted.length - 1].fish;
}

/** Probability of each rarity tier for a context (for UI previews). */
export function tierProbabilities(ctx, opts) {
  const { weighted, total } = buildWeights(ctx, opts);
  const out = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, junk: 0 };
  if (!total) return out;
  for (const w of weighted) {
    if (w.fish.junk) out.junk += w.weight / total;
    else out[w.fish.rarity] += w.weight / total;
  }
  return out;
}

/** The most likely species here (for the journal's "what lives here" hint). */
export function topSpecies(ctx, opts, n = 5) {
  const { weighted, total } = buildWeights(ctx, opts);
  return weighted
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .slice(0, n)
    .map((w) => ({ fish: w.fish, pct: (w.weight / total) * 100 }));
}
