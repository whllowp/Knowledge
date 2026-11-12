// Order tickets: what the customers want, how long they will wait.

import { RECIPES } from './data.js';
import { makeRng } from './rng.js';

const RECIPE_WEIGHTS = {
  salad: 3,
  cheeseburger: 4,
  double: 2,
};

export class OrderManager {
  constructor(level, rng = makeRng(7)) {
    this.level = level;
    this.rng = rng;
    this.tickets = [];
    this.nextId = 1;
    this.lastRecipe = null;
    this.spawnTimer = level.spawnInterval * 0.6;
    this.spawned = 0;
    this.expired = 0;

    const first = Math.min(level.slots, 2);
    for (let i = 0; i < first; i++) this.spawn();
  }

  get active() {
    return this.tickets.filter((t) => !t.done);
  }

  maxTimeFor(recipeId) {
    const recipe = RECIPES[recipeId];
    return Math.max(18, recipe.orderTime * (this.level.orderTimeScale ?? 1));
  }

  pickRecipe() {
    const pool = this.level.recipes.filter((id) => RECIPES[id]);
    const featured = new Set(this.level.featured || []);
    const weighted = [];
    for (const id of pool) {
      const base = RECIPE_WEIGHTS[id] ?? RECIPES[id]?.weight ?? 1;
      const w = Math.max(1, Math.round(base * (featured.has(id) ? 2.2 : 1)));
      for (let i = 0; i < w; i++) weighted.push(id);
    }
    let choice = this.rng.pick(weighted);
    if (pool.length > 1 && choice === this.lastRecipe) {
      choice = this.rng.pick(weighted.filter((id) => id !== this.lastRecipe));
    }
    this.lastRecipe = choice;
    return choice;
  }

  spawn() {
    if (this.active.length >= this.level.slots) return null;
    const recipeId = this.pickRecipe();
    const maxTime = this.maxTimeFor(recipeId);
    const ticket = {
      id: this.nextId++,
      recipeId,
      maxTime,
      time: maxTime,
      done: false,
      spawnedAt: this.spawned,
    };
    this.spawned++;
    this.tickets.push(ticket);
    return ticket;
  }

  tick(dt) {
    const expired = [];
    for (const t of this.tickets) {
      if (t.done) continue;
      t.time -= dt;
      if (t.time <= 0) {
        t.time = 0;
        t.done = true;
        expired.push(t);
        this.expired++;
      }
    }
    this.tickets = this.tickets.filter((t) => !t.done);

    const spawned = [];
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      const t = this.spawn();
      if (t) spawned.push(t);
      const base = this.level.spawnInterval;
      this.spawnTimer = base * this.rng.range(0.8, 1.2);
    }
    return { expired, spawned };
  }

  /** Remove and return the most urgent ticket that wants this recipe. */
  consume(recipeId) {
    let best = null;
    for (const t of this.tickets) {
      if (t.done || t.recipeId !== recipeId) continue;
      if (!best || t.time < best.time) best = t;
    }
    if (!best) return null;
    best.done = true;
    this.tickets = this.tickets.filter((t) => t !== best);
    return best;
  }

  get sorted() {
    return [...this.tickets].sort((a, b) => a.time - b.time);
  }
}
