// Discrete-event balance simulator.
//
// Uses the real Kitchen/OrderManager/GameSession rules and a pathfinding agent
// with different skill profiles. This is *not* a substitute for human playtests
// — it is a calibration aid that estimates how score/timeouts move with skill.

import { GameSession } from '../src/core/session.js';
import { createHands } from '../src/core/kitchen.js';
import { RECIPES, LEVELS, STATIONS, COLLIDERS, ROOM, SPAWN, INGREDIENTS } from '../src/core/data.js';

const CELL = 0.15;
const AGENT_MARGIN = 0.34;
const PATH_SCALE = 1.12;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round = (n, d = 0) => Math.round(n * 10 ** d) / 10 ** d;
const pct = (arr, p) => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = clamp(Math.floor((p / 100) * (sorted.length - 1)), 0, sorted.length - 1);
  return sorted[idx];
};

// ---------------------------------------------------------------------------
// Grid / pathfinding
// ---------------------------------------------------------------------------

class Grid {
  constructor() {
    this.minX = ROOM.minX + AGENT_MARGIN;
    this.maxX = ROOM.maxX - AGENT_MARGIN;
    this.minZ = ROOM.minZ + AGENT_MARGIN;
    this.maxZ = ROOM.maxZ - AGENT_MARGIN;
    this.cols = Math.floor((this.maxX - this.minX) / CELL) + 1;
    this.rows = Math.floor((this.maxZ - this.minZ) / CELL) + 1;
    this.walk = new Uint8Array(this.cols * this.rows);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.minX + c * CELL;
        const z = this.minZ + r * CELL;
        this.walk[r * this.cols + c] = this.isFree(x, z) ? 1 : 0;
      }
    }
    this.fields = new Map();
  }

  isFree(x, z) {
    if (x < this.minX || x > this.maxX || z < this.minZ || z > this.maxZ) return false;
    for (const c of COLLIDERS) {
      if (x > c.minX - AGENT_MARGIN && x < c.maxX + AGENT_MARGIN && z > c.minZ - AGENT_MARGIN && z < c.maxZ + AGENT_MARGIN) {
        return false;
      }
    }
    return true;
  }

  cellOf(x, z) {
    const c = clamp(Math.round((x - this.minX) / CELL), 0, this.cols - 1);
    const r = clamp(Math.round((z - this.minZ) / CELL), 0, this.rows - 1);
    return [c, r];
  }

  cellIndex(c, r) {
    return r * this.cols + c;
  }

  world(index) {
    const c = index % this.cols;
    const r = Math.floor(index / this.cols);
    return { x: this.minX + c * CELL, z: this.minZ + r * CELL };
  }

  nearestFree(x, z) {
    const [c0, r0] = this.cellOf(x, z);
    if (this.walk[this.cellIndex(c0, r0)]) return this.cellIndex(c0, r0);
    for (let radius = 1; radius <= 12; radius++) {
      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          if (Math.max(Math.abs(dr), Math.abs(dc)) !== radius) continue;
          const c = c0 + dc;
          const r = r0 + dr;
          if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) continue;
          const idx = this.cellIndex(c, r);
          if (this.walk[idx]) return idx;
        }
      }
    }
    throw new Error(`no walkable cell near ${x},${z}`);
  }

  /** Dijkstra field from a cell, 8-way, no corner cutting. */
  field(startIndex) {
    if (this.fields.has(startIndex)) return this.fields.get(startIndex);
    const N = this.cols * this.rows;
    const dist = new Float32Array(N).fill(Infinity);
    const done = new Uint8Array(N);
    // small binary heap
    const heap = [[0, startIndex]];
    const push = (d, i) => {
      heap.push([d, i]);
      let k = heap.length - 1;
      while (k > 0) {
        const p = (k - 1) >> 1;
        if (heap[p][0] <= heap[k][0]) break;
        [heap[p], heap[k]] = [heap[k], heap[p]];
        k = p;
      }
    };
    const pop = () => {
      const top = heap[0];
      const last = heap.pop();
      if (heap.length && last) {
        heap[0] = last;
        let k = 0;
        for (;;) {
          const l = k * 2 + 1;
          const r = l + 1;
          let m = k;
          if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
          if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
          if (m === k) break;
          [heap[m], heap[k]] = [heap[k], heap[m]];
          k = m;
        }
      }
      return top;
    };
    dist[startIndex] = 0;
    push(0, startIndex);
    const dirs = [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 1, 1],
      [0, -1, 1],
      [1, 1, Math.SQRT2],
      [1, -1, Math.SQRT2],
      [-1, 1, Math.SQRT2],
      [-1, -1, Math.SQRT2],
    ];
    while (heap.length) {
      const [d, idx] = pop();
      if (done[idx]) continue;
      done[idx] = 1;
      const c = idx % this.cols;
      const r = Math.floor(idx / this.cols);
      for (const [dc, dr, cost] of dirs) {
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= this.cols || nr >= this.rows) continue;
        const ni = this.cellIndex(nc, nr);
        if (!this.walk[ni]) continue;
        if (dc && dr) {
          if (!this.walk[this.cellIndex(c + dc, r)] || !this.walk[this.cellIndex(c, r + dr)]) continue;
        }
        const nd = d + cost * CELL;
        if (nd < dist[ni]) {
          dist[ni] = nd;
          push(nd, ni);
        }
      }
    }
    this.fields.set(startIndex, dist);
    return dist;
  }
}

const grid = new Grid();

// Access points around each station (metres).
function candidatePoints(def) {
  if (def.kind === 'trash') {
    return [
      { x: def.x, z: def.z - 0.9 },
      { x: def.x - 0.9, z: def.z },
      { x: def.x, z: def.z + 0.9 },
    ];
  }
  if (def.z < -2) return [{ x: def.x, z: def.z + 0.85 }];
  if (def.kind === 'pass') return [{ x: def.x, z: def.z + 0.85 }];
  return [
    { x: def.x, z: def.z + 0.95 },
    { x: def.x, z: def.z - 0.95 },
  ];
}

const accessNodes = new Map(); // stationId -> [{index, x, z}]
for (const def of STATIONS) {
  const nodes = [];
  for (const p of candidatePoints(def)) {
    const idx = grid.nearestFree(p.x, p.z);
    if (nodes.some((n) => n.index === idx)) continue;
    const w = grid.world(idx);
    nodes.push({ index: idx, ...w });
  }
  accessNodes.set(def.id, nodes);
}
const spawnIndex = grid.nearestFree(SPAWN.x, SPAWN.z);
const spawnNode = { index: spawnIndex, ...grid.world(spawnIndex) };

function nodeDistance(a, b) {
  if (a.index === b.index) return 0;
  return grid.field(a.index)[b.index] * PATH_SCALE;
}

// ---------------------------------------------------------------------------
// Skill profiles
// ---------------------------------------------------------------------------

const PROFILES = {
  novice: {
    name: '新手',
    speed: 0.78,
    handling: 0.85,
    chop: 1.55,
    reaction: 0.45,
    overlap: false,
    mistake: 0.38,
    extraWait: [0, 4.2],
    baseSpeed: 3.05,
  },
  average: {
    name: '普通',
    speed: 0.95,
    handling: 0.5,
    chop: 1.22,
    reaction: 0.22,
    overlap: true,
    mistake: 0.18,
    extraWait: [0, 3.8],
    baseSpeed: 3.05,
  },
  expert: {
    name: '熟练',
    speed: 1.05,
    handling: 0.28,
    chop: 1.0,
    reaction: 0.05,
    overlap: true,
    mistake: 0,
    extraWait: [0, 0],
    baseSpeed: 3.05,
  },
};

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

class Agent {
  constructor(session, profile, seed = 1) {
    this.session = session;
    this.profile = profile;
    this.hands = createHands();
    this.node = spawnNode;
    this.rng = mulberry(seed);
    this.errors = 0;
    this.actions = 0;
  }

  get kitchen() {
    return this.session.kitchen;
  }

  rnd() {
    return this.rng();
  }

  advance(seconds) {
    let left = Math.max(0, seconds);
    while (left > 1e-6 && this.session.state === 'playing') {
      const dt = Math.min(0.1, left);
      this.session.tick(dt);
      left -= dt;
    }
    return this.session.state === 'playing';
  }

  travelTo(stationId) {
    const nodes = accessNodes.get(stationId);
    if (!nodes?.length) return false;
    let best = nodes[0];
    let bestD = nodeDistance(this.node, nodes[0]);
    for (const n of nodes.slice(1)) {
      const d = nodeDistance(this.node, n);
      if (d < bestD) {
        best = n;
        bestD = d;
      }
    }
    const speed = this.profile.baseSpeed * this.profile.speed;
    const time = Math.max(0.12, bestD / speed) + this.profile.reaction * (0.4 + this.rnd() * 0.8);
    this.advance(time);
    this.node = best;
    return true;
  }

  act(stationId, { extra = 0 } = {}) {
    if (!this.travelTo(stationId)) return { ok: false, action: 'blocked', message: 'no access' };
    this.advance(this.profile.handling + extra);
    if (this.session.state !== 'playing') return { ok: false, action: 'blocked', message: 'over' };
    this.actions++;
    const r = this.session.interact(stationId, this.hands);
    if (!r.ok) this.errors++;
    return r;
  }

  clearHands() {
    if (!this.hands.carry) return true;
    this.act('trash');
    return !this.hands.carry;
  }

  clearStove(stoveId) {
    const st = this.kitchen.getStation(stoveId);
    if (!st?.item) return true;
    this.clearHands();
    const r = this.act(stoveId);
    if (r.ok && this.hands.carry) this.act('trash');
    return !this.kitchen.getStation(stoveId).item;
  }

  ensurePlate() {
    const counter = this.kitchen.getStation('counter');
    if (counter.item?.type === 'plate') {
      if (counter.item.contents.length === 0) return true;
      // A leftover plate from a failed dish: throw it away.
      this.act('counter');
      if (this.hands.carry) this.act('trash');
    }
    if (this.hands.carry) {
      this.clearHands();
    }
    if (this.hands.carry?.type === 'plate') {
      this.act('counter');
    } else {
      const r = this.act('plates');
      if (!r.ok || this.hands.carry?.type !== 'plate') return false;
      this.act('counter');
    }
    return this.kitchen.getStation('counter').item?.type === 'plate';
  }

  grabCrate(ingredient) {
    const r = this.act(`crate_${ingredient}`);
    return r.ok && this.hands.carry?.ingredient === ingredient;
  }

  prepTopping(ingredient, state) {
    if (!this.grabCrate(ingredient)) return false;
    if (state === 'chopped') {
      const place = this.act('board');
      if (!place.ok) return false;
      const def = INGREDIENTS[ingredient];
      const duration = def.chopTime * this.profile.chop;
      this.advance(duration);
      this.session.chopTick('board', this.hands, duration);
      this.advance(this.profile.handling);
      const pick = this.act('board');
      if (!pick.ok || this.hands.carry?.state !== 'chopped') return false;
    }
    const add = this.act('counter');
    return add.ok && !this.hands.carry;
  }

  placePatty(stoveId) {
    if (!this.grabCrate('patty')) return null;
    const r = this.act(stoveId);
    if (!r.ok) return null;
    const item = this.kitchen.getStation(stoveId).item;
    return item?.type === 'ingredient' ? { stoveId, uid: item.uid } : null;
  }

  waitCooked(stoveId, uid) {
    const st = this.kitchen.getStation(stoveId);
    if (this.profile.mistake > 0 && this.rnd() < this.profile.mistake) {
      const extra = this.profile.extraWait[0] + this.rnd() * (this.profile.extraWait[1] - this.profile.extraWait[0]);
      this.advance(extra);
    }
    for (let i = 0; i < 260 && this.session.state === 'playing'; i++) {
      const item = this.kitchen.getStation(stoveId).item;
      if (!item || item.uid !== uid) return false;
      if (item.state === 'cooked') return true;
      if (item.state === 'burnt') return false;
      this.advance(0.1);
    }
    return false;
  }

  retrievePatty(stoveId) {
    this.clearHands();
    const r = this.act(stoveId);
    if (!r.ok || !this.hands.carry) return false;
    if (this.hands.carry.state === 'burnt') {
      this.act('trash');
      return false;
    }
    const add = this.act('counter');
    return add.ok && !this.hands.carry;
  }

  serve() {
    this.clearHands();
    const pickup = this.act('counter');
    if (!pickup.ok || this.hands.carry?.type !== 'plate') return false;
    const r = this.act('pass');
    return r.ok && r.action === 'serve';
  }

  freeStove() {
    for (const id of ['stove1', 'stove2']) {
      if (!this.kitchen.getStation(id).item) return id;
    }
    return null;
  }

  makeDish(recipe) {
    const startedAt = this.session.timeLeft;
    const result = this._makeDish(recipe);
    if (process.env.DEBUG) {
      console.log(
        `  dish ${recipe.id.padEnd(12)} ${result ? 'ok ' : 'FAIL'} ${((startedAt - this.session.timeLeft)).toFixed(1)}s  left=${this.session.timeLeft.toFixed(1)} score=${this.session.score}`,
      );
    }
    return result;
  }

  _makeDish(recipe) {
    if (!this.ensurePlate()) return false;

    // Clear any leftovers so the plan starts from a known state.
    for (const id of ['stove1', 'stove2']) {
      if (this.kitchen.getStation(id).item) this.clearStove(id);
    }

    const patties = recipe.ingredients.filter((t) => t.ingredient === 'patty').length;
    const toppings = recipe.ingredients.filter((t) => t.ingredient !== 'patty');

    if (this.profile.overlap) {
      // Prep the vegetables first, then cook the patties last — this is the
      // safe "mise en place" strategy and avoids burning food while chopping.
      for (const t of toppings) {
        if (!this.prepTopping(t.ingredient, t.state)) return false;
      }
      for (let i = 0; i < patties; i++) {
        const stove = this.freeStove();
        if (!stove) return false;
        const p = this.placePatty(stove);
        if (!p) return false;
        if (!this.waitCooked(p.stoveId, p.uid)) return false;
        if (!this.retrievePatty(p.stoveId)) return false;
      }
    } else {
      for (let i = 0; i < patties; i++) {
        const stove = this.freeStove();
        if (!stove) return false;
        const p = this.placePatty(stove);
        if (!p) return false;
        if (!this.waitCooked(p.stoveId, p.uid)) return false;
        if (!this.retrievePatty(p.stoveId)) return false;
      }
      for (const t of toppings) {
        if (!this.prepTopping(t.ingredient, t.state)) return false;
      }
    }

    // If the ticket expired while cooking, serving still happens (and counts as waste).
    return this.serve();
  }

  pickTicket() {
    const tickets = this.session.orders.sorted;
    for (const t of tickets) {
      if (t.time > 12) return t;
    }
    return tickets[0] ?? null;
  }

  run() {
    let guard = 0;
    while (this.session.state === 'playing' && guard++ < 400) {
      const ticket = this.pickTicket();
      if (!ticket) {
        this.advance(0.4);
        continue;
      }
      const recipe = RECIPES[ticket.recipeId];
      if (!recipe) {
        this.advance(0.2);
        continue;
      }
      if (process.env.DEBUG) console.log(`ticket ${recipe.id} time=${ticket.time.toFixed(1)}`);
      if (ticket.time < 8) {
        this.advance(0.3);
        continue;
      }
      const ok = this.makeDish(recipe);
      if (!ok) {
        this.clearHands();
        this.advance(0.15);
      }
    }
    if (this.session.state === 'playing') this.session.finish();
    return this.session;
  }
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Experiment
// ---------------------------------------------------------------------------

const RUNS = Number(process.env.RUNS || 80);

function runOne(level, profile, seed) {
  const session = new GameSession(level, { seed, mode: 'fp' });
  const agent = new Agent(session, profile, seed * 7919 + 13);
  agent.run();
  const stars = session.stars;
  return {
    score: session.score,
    served: session.stats.served,
    expired: session.stats.expired,
    wasted: session.stats.wasted,
    burnt: session.stats.burnt,
    maxCombo: session.maxCombo,
    timeoutRate: session.stats.expired / Math.max(1, session.stats.expired + session.stats.served),
    stars,
    errors: agent.errors,
    actions: agent.actions,
  };
}

const results = [];
for (const level of LEVELS) {
  for (const [key, profile] of Object.entries(PROFILES)) {
    const runs = [];
    for (let i = 1; i <= RUNS; i++) runs.push(runOne(level, profile, i * 11003 + level.id * 97));
    results.push({ level: level.id, profile: key, name: profile.name, runs });
  }
}

const summary = results.map(({ level, profile, name, runs }) => {
  const scores = runs.map((r) => r.score);
  const served = runs.map((r) => r.served);
  const timeouts = runs.map((r) => r.timeoutRate * 100);
  const stars = runs.map((r) => r.stars);
  return {
    level,
    profile,
    name,
    n: runs.length,
    score: {
      p10: pct(scores, 10),
      p25: pct(scores, 25),
      p50: pct(scores, 50),
      p75: pct(scores, 75),
      p90: pct(scores, 90),
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    },
    served: { p10: pct(served, 10), p50: pct(served, 50), p90: pct(served, 90), avg: round(served.reduce((a, b) => a + b, 0) / served.length, 1) },
    timeoutRate: round(timeouts.reduce((a, b) => a + b, 0) / timeouts.length, 1),
    stars: { avg: round(stars.reduce((a, b) => a + b, 0) / stars.length, 2), three: runs.filter((r) => r.stars === 3).length },
    wasted: round(runs.reduce((a, b) => a + b.wasted, 0) / runs.length, 1),
    burnt: round(runs.reduce((a, b) => a + b.burnt, 0) / runs.length, 1),
    errors: runs.reduce((a, b) => a + b.errors, 0),
  };
});

console.log(`Balance simulation · RUNS=${RUNS} per level/profile · real GameSession rules\n`);
console.log('level profile  n   score p25/p50/p75   served p50   timeout%   avgStars  3star  waste  burnt  errors');
for (const s of summary) {
  console.log(
    `${String(s.level).padEnd(5)} ${s.name.padEnd(6)} ${String(s.n).padEnd(3)} ${String(s.score.p25).padStart(4)}/${String(s.score.p50).padStart(4)}/${String(s.score.p75).padStart(4)}   ${String(s.served.p50).padStart(6)}      ${String(s.timeoutRate).padStart(5)}%     ${String(s.stars.avg).padStart(5)}   ${String(s.stars.three).padStart(4)}  ${String(s.wasted).padStart(5)}  ${String(s.burnt).padStart(5)}  ${String(s.errors).padStart(5)}`,
  );
}

console.log('\nReference targets from this run (p50 rounded; current targets are manually adjusted for star mix):');
for (const level of LEVELS) {
  const novice = summary.find((s) => s.level === level.id && s.profile === 'novice');
  const average = summary.find((s) => s.level === level.id && s.profile === 'average');
  const expert = summary.find((s) => s.level === level.id && s.profile === 'expert');
  const t1 = Math.max(250, Math.round(novice.score.p50 / 50) * 50);
  const t2 = Math.max(t1 + 150, Math.round(average.score.p50 / 50) * 50);
  const t3 = Math.max(t2 + 150, Math.round(expert.score.p50 / 50) * 50);
  console.log(
    `SHIFT ${level.id}: reference [${t1}, ${t2}, ${t3}]   current [${level.target.join(', ')}]   (novice ${novice.score.p50}, avg ${average.score.p50}, expert ${expert.score.p50})`,
  );
}
