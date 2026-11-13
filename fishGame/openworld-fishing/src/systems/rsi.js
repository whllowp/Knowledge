/**
 * rsi.js — Recursive Self-Improvement for the island's rival angler (v6.x).
 *
 * Two papers shaped this:
 *
 *  - Dream-RSI (arXiv:2609.14858): improve by *dreaming* inside a replay
 *    simulator built from accumulated discovery history, instead of paying for
 *    expensive online rollouts. Here the rival records every day it fishes into
 *    a replay pool, and candidate policies are scored offline against that pool
 *    before anything is deployed.
 *
 *  - Harmony Harness (arXiv:2610.15150): multi-objective evolution by
 *    decomposition (MOEA/D + Tchebycheff), a factorized genome (general
 *    mechanisms vs environment-specific calibration) and a held-out gate so a
 *    child that only wins by degenerating (e.g. fishing one spot for junk) is
 *    rejected.
 *
 * The rival's "harness" is a small policy genome. Every in-game day it dreams
 * up mutants, evaluates them on the replay pool, keeps a Pareto front over
 * (daily value, average rarity), and deploys the most balanced point.
 */
import { clamp, clamp01, mulberry32, rand, lerp } from '../core/util.js';
import { rollFish } from './fishSelect.js';
import { fishValue } from './progression.js';
import { RARITY } from '../data/fish.js';

/** Objective weight vectors (MOEA/D decomposition), value vs rarity. */
const WEIGHTS = [
  [0.95, 0.05],
  [0.8, 0.2],
  [0.65, 0.35],
  [0.5, 0.5],
  [0.35, 0.65],
  [0.2, 0.8],
  [0.05, 0.95],
];

const HOUR_BUCKETS = [
  { id: 'dawn', label: '清晨', hours: [5, 8] },
  { id: 'day', label: '白天', hours: [9, 16] },
  { id: 'dusk', label: '黄昏', hours: [17, 19] },
  { id: 'night', label: '夜里', hours: [20, 4] },
];

const SPOT_IDS = [
  'lake_dock',
  'lake_weeds',
  'lake_center',
  'river_bend',
  'river_gorge',
  'pond_frog',
  'swamp_edge',
  'swamp_deep',
  'outlet_creek',
  'estuary',
  'coast_beach',
  'reef',
  'ocean_shallow',
  'ocean_deep',
  'ocean_cliff',
];

/** A fresh genome: mediocre but valid. */
export function baseGenome(rng = Math.random) {
  const spotWeights = {};
  for (const id of SPOT_IDS) spotWeights[id] = 0.4 + rng() * 0.3;
  return {
    skill: 0.35 + rng() * 0.2, // luck / rarity pull
    patience: 0.4 + rng() * 0.2, // casts per spot before moving
    gearTier: 2 + Math.floor(rng() * 2), // rod/line tier it fishes with
    hourBias: { dawn: 0.5, day: 0.5, dusk: 0.5, night: 0.5 },
    depthBias: 0.5,
    spotWeights,
  };
}

function clone(g) {
  return {
    ...g,
    hourBias: { ...g.hourBias },
    spotWeights: { ...g.spotWeights },
  };
}

function mutateGeneral(g, rng) {
  const c = clone(g);
  const k = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < k; i++) {
    const r = rng();
    if (r < 0.34) c.skill = clamp01(c.skill + (rng() - 0.5) * 0.25);
    else if (r < 0.67) c.patience = clamp01(c.patience + (rng() - 0.5) * 0.25);
    else c.gearTier = clamp(Math.round(c.gearTier + (rng() - 0.5) * 2), 1, 5);
  }
  return c;
}

function mutateSpecific(g, rng) {
  const c = clone(g);
  const r = rng();
  if (r < 0.45) {
    const b = HOUR_BUCKETS[Math.floor(rng() * HOUR_BUCKETS.length)];
    c.hourBias[b.id] = clamp01(c.hourBias[b.id] + (rng() - 0.5) * 0.45);
  } else if (r < 0.7) {
    c.depthBias = clamp01(c.depthBias + (rng() - 0.5) * 0.35);
  } else {
    const id = SPOT_IDS[Math.floor(rng() * SPOT_IDS.length)];
    c.spotWeights[id] = clamp(c.spotWeights[id] + (rng() - 0.5) * 0.5, 0.02, 1);
  }
  return c;
}

/** Factorized operator: mutate one scope or the other, never both at once. */
function mutate(g, rng) {
  return rng() < 0.5 ? mutateGeneral(g, rng) : mutateSpecific(g, rng);
}

export class RivalRSI {
  constructor(game) {
    this.game = game;
    this.rng = mulberry32(0x5eed);
    this.gen = 0;
    this.samples = []; // the replay pool: observed contexts
    this.incumbents = []; // one genome per weight vector
    this.front = []; // Pareto front snapshot (from the archive)
    this.archive = []; // non-dominated genomes ever found (Harmony's elite set)
    this.history = []; // accepted/rejected mutations
    this.days = []; // the rival's actual daily results
    this.deployed = null;
    this.zStar = [0, 0]; // ideal point
    this.ready = false;
  }

  /**
   * Initial population: one specialist per weight vector, so the front starts
   * spread instead of collapsing into a single basin. t=0 chases money
   * (big gear, night, few spots), t=1 chases variety (many spots, all hours).
   */
  _specialist(i) {
    const t = WEIGHTS.length > 1 ? i / (WEIGHTS.length - 1) : 0.5;
    const g = baseGenome(this.rng);
    g.skill = clamp01(0.3 + (1 - t) * 0.55);
    g.gearTier = 2 + Math.round((1 - t) * 3);
    g.patience = clamp01(0.3 + t * 0.6);
    g.depthBias = clamp01(0.35 + (1 - t) * 0.5);
    for (const id of SPOT_IDS) {
      g.spotWeights[id] = t > 0.55 ? 0.5 + this.rng() * 0.35 : this.rng() < 0.35 ? 0.85 : 0.12 + this.rng() * 0.15;
    }
    g.hourBias = t > 0.55
      ? { dawn: 0.6, day: 0.6, dusk: 0.6, night: 0.6 }
      : { dawn: 0.5, day: 0.3, dusk: 0.75, night: 0.85 };
    return g;
  }

  /** Keep an elite archive of non-dominated genomes (diversity floor). */
  _archiveAdd(g, f) {
    for (const a of this.archive) if (this._dominates(a.f, f)) return false;
    this.archive = this.archive.filter((a) => !this._dominates(f, a.f));
    this.archive.push({ g, f });
    if (this.archive.length > 24) this.archive.shift();
    return true;
  }

  /** Build the initial replay pool from the world's spots. */
  init(world) {
    this.world = world;
    this.spots = (world?.spots || []).filter((s) => SPOT_IDS.includes(s.id));
    if (!this.spots.length) return false;
    this.samples = this._seedSamples(220);
    this.incumbents = WEIGHTS.map((_, i) => this._specialist(i));
    // prime the ideal point + archive
    for (const g of this.incumbents) {
      const f = this._evaluate(g, this.samples);
      this.zStar[0] = Math.max(this.zStar[0], f.value);
      this.zStar[1] = Math.max(this.zStar[1], f.variety);
      this._archiveAdd(g, f);
    }
    this.ready = true;
    this.deployed = this.incumbents[Math.floor(WEIGHTS.length / 2)];
    this._refreshFront();
    return true;
  }

  /** Synthetic replay: many contexts across spots/hours/weathers. */
  _seedSamples(n) {
    const out = [];
    const weathers = ['clear', 'cloudy', 'rain', 'storm', 'fog'];
    for (let i = 0; i < n; i++) {
      const spot = this.spots[Math.floor(this.rng() * this.spots.length)];
      const bucket = HOUR_BUCKETS[Math.floor(this.rng() * HOUR_BUCKETS.length)];
      const lo = bucket.hours[0];
      const hi = bucket.hours[1];
      const hour = hi >= lo ? lo + this.rng() * (hi - lo) : (lo + this.rng() * (24 - lo + hi + 1)) % 24;
      const weather = weathers[Math.floor(this.rng() * weathers.length)];
      out.push(this._makeSample(spot, hour, weather));
    }
    return out;
  }

  _makeSample(spot, hour, weather) {
    const depth = spot.depth ?? 3;
    const ctx = {
      region: spot.region || spot.biomes?.[0] || 'coast',
      biome: spot.biomes?.[0] || 'coast',
      depth,
      waters: spot.waters || ['shore'],
      biomes: spot.biomes || ['coast'],
      spot,
      hour,
      weather,
    };
    return { spotId: spot.id, hour, weather, ctx, depth };
  }

  /** How much this policy wants to fish a given sample (0..1). */
  _preference(g, s) {
    const spotW = g.spotWeights[s.spotId] ?? 0.3;
    let bucket = 'day';
    for (const b of HOUR_BUCKETS) {
      const [lo, hi] = b.hours;
      if (hi >= lo ? s.hour >= lo && s.hour < hi : s.hour >= lo || s.hour < hi) {
        bucket = b.id;
        break;
      }
    }
    const hourW = g.hourBias[bucket] ?? 0.5;
    const depthW = lerp(0.6, 1.15, g.depthBias) * (s.depth >= 10 ? clamp01(g.depthBias + 0.35) : 1);
    return clamp01(spotW * (0.45 + hourW * 0.55) * depthW);
  }

  /**
   * Dream evaluation: score a genome against the replay pool without touching
   * the world. Returns daily value, mean rarity and catch count.
   */
  _evaluate(g, pool) {
    const rng = mulberry32(hashGenome(g) ^ this.gen);
    let value = 0;
    let rarity = 0;
    let count = 0;
    const seen = new Set();
    const castsPerDay = 26;
    const picks = [];
    for (const s of pool) if (rng() < this._preference(g, s)) picks.push(s);
    const n = picks.length ? Math.min(castsPerDay, picks.length) : 0;
    for (let i = 0; i < n; i++) {
      const s = picks[Math.floor(rng() * picks.length)];
      let fish;
      try {
        fish = rollFish(s.ctx, { luck: g.skill * 0.35 + (g.gearTier - 1) * 0.02 }, rng);
      } catch {
        continue;
      }
      if (!fish) continue;
      const span = Math.max(0.01, fish.maxWeight - fish.minWeight);
      const weight = fish.minWeight + span * Math.pow(rng(), 1.4 - g.patience * 0.5);
      value += fishValue(fish, weight, g.skill + (g.gearTier - 1) * 0.04);
      rarity += (RARITY[fish.rarity]?.valueMult ?? 1);
      seen.add(fish.id);
      count++;
    }
    // patience spreads effort: more spots, steadier income
    const spread = 1 + g.patience * 0.12;
    return {
      value: (value / Math.max(1, castsPerDay)) * 26 * spread,
      rarity: count ? (rarity / count) * spread : 0,
      variety: seen.size,
      count,
    };
  }

  /** Tchebycheff scalarization for weight vector w (value vs variety). */
  _tcheby(f, w) {
    const a = Math.abs(f.value - this.zStar[0]) / Math.max(1, this.zStar[0]);
    const b = Math.abs(f.variety - this.zStar[1]) / Math.max(1, this.zStar[1]);
    return Math.max(w[0] * a, w[1] * b);
  }

  _dominates(fa, fb) {
    return fa.value >= fb.value && fa.variety >= fb.variety && (fa.value > fb.value || fa.variety > fb.variety);
  }

  _refreshFront() {
    // the archive holds every non-dominated genome ever found, so the front
    // keeps its spread even when the live population converges
    let pts = this.archive.map((a) => ({ g: a.g, f: a.f }));
    for (const g of this.incumbents) {
      const f = this._evaluate(g, this.samples);
      this._archiveAdd(g, f);
    }
    pts = this.archive.map((a) => ({ g: a.g, f: a.f }));
    this.front = pts.filter((p) => !pts.some((q) => q !== p && this._dominates(q.f, p.f)));
    if (!this.front.length) this.front = pts.slice();
    this.front.sort((a, b) => b.f.value - a.f.value);
  }

  /**
   * One evolutionary generation: dream a child per subproblem, gate it, then
   * replace neighbours by Tchebycheff value. This is the heart of the loop.
   */
  stepDay({ note = null } = {}) {
    if (!this.ready) return null;
    this.gen++;
    const rng = this.rng;
    const before = this._evaluate(this.deployed || this.incumbents[0], this.samples);
    let accepted = 0;
    let rejected = 0;
    const log = [];
    for (let i = 0; i < this.incumbents.length; i++) {
      const parent = this.incumbents[i];
      const child = mutate(parent, rng);
      const fChild = this._evaluate(child, this.samples);
      const gate = this._gate(parent, child, fChild);
      if (!gate.ok) {
        rejected++;
        log.push({ i, ok: false, reason: gate.reason });
        continue;
      }
      this.zStar[0] = Math.max(this.zStar[0], fChild.value);
      this.zStar[1] = Math.max(this.zStar[1], fChild.variety);
      this._archiveAdd(child, fChild); // elite archive keeps the front alive
      const w = WEIGHTS[i];
      const fParent = this._evaluate(parent, this.samples);
      if (this._tcheby(fChild, w) < this._tcheby(fParent, w)) {
        this.incumbents[i] = child;
        accepted++;
        log.push({ i, ok: true, reason: 'tchebycheff-improved', value: Math.round(fChild.value), rarity: +fChild.rarity.toFixed(2) });
      } else {
        rejected++;
        log.push({ i, ok: false, reason: 'not-better' });
      }
    }
    // deploy the most balanced incumbent (stable across generations, and it
    // improves monotonically as the population does)
    this._refreshFront();
    const wBal = [0.5, 0.5];
    let bestI = 0;
    let bestV = Infinity;
    this.incumbents.forEach((g, i) => {
      const v = this._tcheby(this._evaluate(g, this.samples), wBal);
      if (v < bestV) {
        bestV = v;
        bestI = i;
      }
    });
    this.deployed = this.incumbents[bestI];
    const after = this._evaluate(this.deployed, this.samples);
    // the rival actually fishes today: one real sampled day, logged into replay
    const day = this._fishDay(this.deployed);
    // remember today's contexts (the replay pool grows with play)
    for (const s of day._samples || []) this.samples.push(s);
    delete day._samples;
    this.days.push(day);
    if (this.days.length > 30) this.days.shift();
    if (this.samples.length > 600) this.samples.splice(0, this.samples.length - 600);
    this.history.unshift({
      gen: this.gen,
      accepted,
      rejected,
      before: { value: Math.round(before.value), rarity: +before.rarity.toFixed(2) },
      after: { value: Math.round(after.value), rarity: +after.rarity.toFixed(2) },
      deployed: summarize(this.deployed),
      log: log.slice(0, 6),
      note,
      at: Date.now(),
    });
    if (this.history.length > 12) this.history.pop();
    return {
      gen: this.gen,
      accepted,
      rejected,
      before: { value: Math.round(before.value), rarity: +before.rarity.toFixed(2) },
      after: { value: Math.round(after.value), rarity: +after.rarity.toFixed(2) },
      day,
      deployed: summarize(this.deployed),
    };
  }

  /**
   * Held-out gate (Harmony Harness §4.2): the child must not win only by
   * collapsing coverage. We re-score on samples the child was not tuned on
   * (the tail of the pool) and reject degenerate trades.
   */
  _gate(parent, child, fChild) {
    const holdout = this.samples.slice(-Math.max(20, Math.floor(this.samples.length * 0.25)));
    const hc = this._evaluate(child, holdout);
    const hp = this._evaluate(parent, holdout);
    if (hc.count < 4) return { ok: false, reason: 'held-out: too few catches' };
    if (hp.count > 0 && hc.count < hp.count * 0.55) return { ok: false, reason: 'held-out: coverage collapsed' };
    if (fChild.variety < Math.max(3, hp.variety * 0.4)) return { ok: false, reason: 'held-out: variety collapsed' };
    return { ok: true };
  }

  /** The rival actually fishes: pick casts by policy and record the result. */
  _fishDay(g) {
    const rng = this.rng;
    let value = 0;
    let rarity = 0;
    let count = 0;
    const used = [];
    const casts = 24;
    for (let i = 0; i < casts; i++) {
      const s = this._pickSample(g, rng);
      if (!s) break;
      let fish;
      try {
        fish = rollFish(s.ctx, { luck: g.skill * 0.35 }, rng);
      } catch {
        continue;
      }
      if (!fish) continue;
      const span = Math.max(0.01, fish.maxWeight - fish.minWeight);
      const weight = fish.minWeight + span * Math.pow(rng(), 1.3);
      value += fishValue(fish, weight, g.skill);
      rarity += RARITY[fish.rarity]?.valueMult ?? 1;
      count++;
      used.push(s);
    }
    return {
      value: Math.round(value),
      rarity: count ? +(rarity / count).toFixed(2) : 0,
      variety: new Set(used.map((s) => s.spotId)).size,
      count,
      _samples: used.slice(0, 12),
    };
  }

  _pickSample(g, rng) {
    // weighted pick from the replay pool by policy preference
    let total = 0;
    const ws = this.samples.map((s) => {
      const w = this._preference(g, s);
      total += w;
      return w;
    });
    if (total <= 0) return this.samples[Math.floor(rng() * this.samples.length)];
    let r = rng() * total;
    for (let i = 0; i < this.samples.length; i++) {
      r -= ws[i];
      if (r <= 0) return this.samples[i];
    }
    return this.samples[this.samples.length - 1];
  }

  /** A rival "pace" (points/minute) for the contest system, from its policy. */
  contestPace() {
    if (!this.deployed) return 70;
    const f = this._evaluate(this.deployed, this.samples);
    // log-scale so an evolved policy stays a believable opponent instead of
    // pinning the contest cap
    return clamp(Math.round(40 + Math.log10(Math.max(10, f.value)) * 12), 50, 150);
  }

  snapshot() {
    return {
      gen: this.gen,
      ready: this.ready,
      replay: this.samples.length,
      deployed: this.deployed ? summarize(this.deployed) : null,
      front: dedupe(this.front.map((p) => ({ value: Math.round(p.f.value), variety: p.f.variety, rarity: +p.f.rarity.toFixed(2) }))),
      history: this.history.slice(0, 6),
      days: this.days.slice(-6),
      pace: this.contestPace(),
      ideal: { value: Math.round(this.zStar[0]), variety: this.zStar[1] },
    };
  }
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((p) => {
    const k = `${p.value}|${p.variety}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function summarize(g) {
  return {
    skill: +g.skill.toFixed(2),
    patience: +g.patience.toFixed(2),
    gearTier: g.gearTier,
    depthBias: +g.depthBias.toFixed(2),
    hours: Object.fromEntries(Object.entries(g.hourBias).map(([k, v]) => [k, +v.toFixed(2)])),
    topSpots: Object.entries(g.spotWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, w]) => `${id}:${w.toFixed(2)}`),
  };
}

function hashGenome(g) {
  let h = 2166136261;
  const s = `${g.skill.toFixed(3)}|${g.patience.toFixed(3)}|${g.gearTier}|${g.depthBias.toFixed(3)}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
