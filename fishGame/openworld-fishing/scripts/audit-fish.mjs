/**
 * audit-fish.mjs — offline audit of the species selection tables.
 *
 * Runs the exact weighting code the game uses (src/systems/fishSelect.js) for
 * every fishing spot and prints the tier distribution, junk rate and the most
 * likely species, plus the reasons fish were rejected.
 *
 * Usage: node scripts/audit-fish.mjs
 */
import { FISH, RARITY } from '../src/data/fish.js';
import { buildWeights, filterPool, watersForRegion, rollFish, tierProbabilities } from '../src/systems/fishSelect.js';
import { BAITS, LURES } from '../src/data/gear.js';

// Spot contexts mirroring data/spots.js (region + depth + standing spot).
const CONTEXTS = [
  { id: 'lake_dock', region: 'lake', biome: 'lake', depth: 6.5, spot: true },
  { id: 'lake_weeds', region: 'lake', biome: 'lake', depth: 4.8, spot: true },
  { id: 'lake_center', region: 'lake', biome: 'lake', depth: 11.7, spot: true },
  { id: 'river_bend', region: 'river', biome: 'river', depth: 2.9, spot: true },
  { id: 'river_gorge', region: 'river', biome: 'river', depth: 2.9, spot: true },
  { id: 'pond_frog', region: 'pond', biome: 'pond', depth: 3.8, spot: true },
  { id: 'swamp_edge', region: 'swamp', biome: 'swamp', depth: 1.2, spot: true },
  { id: 'swamp_deep', region: 'swamp', biome: 'swamp', depth: 1.6, spot: true },
  { id: 'outlet_creek', region: 'estuary', biome: 'river', depth: 3.6, spot: true },
  { id: 'estuary', region: 'estuary', biome: 'estuary', depth: 3.6, spot: true },
  { id: 'coast_beach', region: 'coast', biome: 'coast', depth: 1.5, spot: true },
  { id: 'reef', region: 'reef', biome: 'reef', depth: 5.5, spot: true },
  { id: 'ocean_shallow', region: 'ocean_shallow', biome: 'ocean_shallow', depth: 4.0, spot: true },
  { id: 'ocean_deep', region: 'ocean_deep', biome: 'ocean_deep', depth: 30, spot: true },
  { id: 'ocean_cliff', region: 'ocean_deep', biome: 'ocean_deep', depth: 42, spot: true },
  { id: 'wild_lake', region: 'lake', biome: 'lake', depth: 3.0, spot: false },
  { id: 'wild_sea', region: 'ocean_shallow', biome: 'ocean_shallow', depth: 8.0, spot: false },
];

const CONDITIONS = [
  { label: 'noon clear  L50', hour: 12, weather: 'clear', level: 50, bait: null, lure: null, luck: 0 },
  { label: 'dawn rain   L50', hour: 6.2, weather: 'rain', level: 50, bait: null, lure: null, luck: 0 },
  { label: 'night clear L50', hour: 22, weather: 'clear', level: 50, bait: null, lure: null, luck: 0 },
  { label: 'L1 worm      ', hour: 12, weather: 'clear', level: 1, bait: BAITS[1], lure: null, luck: 0 },
  { label: 'L20 jig+luck ', hour: 12, weather: 'clear', level: 20, bait: null, lure: LURES.find((l) => l.id === 'jig'), luck: 0.38 },
];

function ctxOf(c) {
  return {
    region: c.region,
    biome: c.biome,
    depth: c.depth,
    waters: watersForRegion(c.region, c.depth),
    biomes: [c.biome],
    spot: c.spot ? { id: c.id } : null,
    x: 0,
    z: 0,
  };
}

let rows = 0;
const problems = [];
const tierTotals = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
let junkTotal = 0;
let rollTotal = 0;

console.log(`FISH total: ${FISH.length}`);
const rarityCounts = {};
for (const f of FISH) rarityCounts[f.rarity] = (rarityCounts[f.rarity] || 0) + 1;
console.log('species per rarity:', JSON.stringify(rarityCounts));
console.log('junk species:', FISH.filter((f) => f.junk).length);
console.log('');

for (const cond of CONDITIONS) {
  console.log(`\n=== ${cond.label} ===`);
  for (const c of CONTEXTS) {
    const ctx = ctxOf(c);
    const opts = {
      level: cond.level,
      hour: cond.hour,
      weather: cond.weather,
      lure: cond.lure,
      bait: cond.bait,
      luck: cond.luck,
    };
    const diag = {};
    const { byRarity, widened } = buildWeights(ctx, opts, diag);
    const tiers = tierProbabilities(ctx, opts);
    // sample
    const counts = {};
    const sampleTiers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let junk = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) {
      const fish = rollFish(ctx, opts);
      counts[fish.name] = (counts[fish.name] || 0) + 1;
      sampleTiers[fish.rarity]++;
      if (fish.junk) junk++;
      tierTotals[fish.rarity]++;
      if (fish.junk) junkTotal++;
      rollTotal++;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([n, k]) => `${n} ${(k / N * 100).toFixed(1)}%`);
    const tierStr = [1, 2, 3, 4, 5].map((r) => `${r}:${(tiers[r] * 100).toFixed(1)}%`).join(' ');
    const sampleStr = [1, 2, 3, 4, 5].map((r) => `${r}:${(sampleTiers[r] / N * 100).toFixed(1)}%`).join(' ');
    console.log(
      `${c.id.padEnd(14)} pool=${String(diag.pool.length).padStart(3)} grp=${JSON.stringify(byRarity)} widen=${widened} junk=${(junk / N * 100).toFixed(1)}%`
    );
    console.log(`  model  ${tierStr}`);
    console.log(`  sample ${sampleStr}   top: ${top.join(' | ')}`);
    if (widened === 0 && c.spot && cond.level >= 20 && Object.keys(byRarity).length <= 1) {
      problems.push(`${cond.label} / ${c.id}: only one rarity tier available at level ${cond.level}`);
    }
    rows++;
  }
}

console.log('\n=== OVERALL ===');
console.log('junk share of all rolls:', (junkTotal / rollTotal * 100).toFixed(2) + '%');
console.log('tier share:', [1, 2, 3, 4, 5].map((r) => `${r}:${(tierTotals[r] / rollTotal * 100).toFixed(1)}%`).join(' '));
if (problems.length) {
  console.log('\nPROBLEMS:');
  for (const p of problems) console.log(' -', p);
} else {
  console.log('\nno single-tier pools detected');
}

// Which fish are never reachable anywhere (a content red flag)
const reachable = new Set();
for (const c of CONTEXTS) {
  const ctx = ctxOf(c);
  for (const hour of [2, 6.2, 9, 12, 15, 18.5, 21, 23]) {
    for (const weather of ['clear', 'cloudy', 'rain', 'storm', 'fog', 'snow']) {
      const opts = { level: 99, hour, weather, lure: null, bait: null, luck: 0 };
      for (const e of filterPool(ctx, opts)) reachable.add(e.fish.id);
    }
  }
}
const unreachable = FISH.filter((f) => !reachable.has(f.id));
console.log(`\nreachable species (union over all contexts/hours/weathers): ${reachable.size} / ${FISH.length}`);
if (unreachable.length) {
  console.log('never selectable in the audited contexts:');
  for (const f of unreachable) console.log(` - ${f.id} ${f.name} rarity${f.rarity} biomes=[${f.biomes}] waters=[${f.waters}] depthM=[${f.depthM}] minLevel=${f.minLevel}`);
} else {
  console.log('every species is catchable somewhere');
}
