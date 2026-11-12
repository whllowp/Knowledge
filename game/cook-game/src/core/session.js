// A single shift: kitchen + orders + scoring + timer.
// Modes own the player and the camera; this owns the rules.

import { Kitchen, itemName } from './kitchen.js';
import { OrderManager } from './orders.js';
import { RECIPES, recipeForToppings } from './data.js';
import { Emitter } from './events.js';
import { makeRng } from './rng.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class GameSession {
  constructor(level, { seed = 20261102, mode = 'fp', recommended = [] } = {}) {
    this.level = level;
    this.mode = mode;
    this.recommended = new Set(Array.isArray(recommended) ? recommended : []);
    this.rng = makeRng(seed);
    this.kitchen = new Kitchen();
    this.orders = new OrderManager(level, this.rng);
    this.timeLeft = level.duration;
    this.duration = level.duration;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.state = 'playing';
    this.elapsed = 0;
    this.firstServeAt = null;
    this.events = new Emitter();
    this.stats = {
      served: 0,
      wasted: 0,
      expired: 0,
      burnt: 0,
      chopped: 0,
      bestDish: null,
      bestPoints: 0,
      rsiBonus: 0,
      recommendedServed: 0,
      dishCounts: {},
    };
    this.lastResult = null;
    this.stars = 0;
  }

  get comboMultiplier() {
    return 1 + Math.min(this.combo, 4) * 0.25;
  }

  tick(dt) {
    if (this.state !== 'playing') return;
    dt = clamp(dt, 0, 0.1);
    this.elapsed += dt;
    this.timeLeft = Math.max(0, this.timeLeft - dt);

    const { expired, spawned } = this.orders.tick(dt);
    for (const ticket of expired) {
      this.stats.expired++;
      this.combo = 0;
      this.comboTimer = 0;
      this.events.emit('order:expired', { ticket });
    }
    for (const ticket of spawned) {
      this.events.emit('order:new', { ticket });
    }

    for (const ev of this.kitchen.tick(dt)) {
      if (ev.type === 'cook:burn') {
        this.stats.burnt++;
        this.combo = Math.max(0, this.combo - 1);
      }
      this.events.emit(ev.type, ev);
    }

    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.comboTimer = 0;
      }
    }

    if (this.timeLeft <= 0) this.finish();
  }

  /** Discrete action. Returns the kitchen result plus serve scoring when relevant. */
  interact(stationId, hands) {
    if (this.state !== 'playing') return { ok: false, action: 'blocked', message: '' };
    const result = this.kitchen.interact(stationId, hands);
    if (result.ok) {
      if (result.action === 'pickup' || result.action === 'place' || result.action === 'topping') {
        this.events.emit(result.action, result);
      } else if (result.action === 'trash') {
        this.events.emit('trash', result);
      } else if (result.action === 'serve') {
        const scored = this.servePlate(result.plate, result.station);
        Object.assign(result, scored);
        this.events.emit('serve', result);
      }
    } else {
      this.events.emit('blocked', result);
    }
    this.lastResult = result;
    return result;
  }

  chopTick(stationId, hands, dt) {
    if (this.state !== 'playing') return null;
    const r = this.kitchen.chopTick(stationId, hands, dt);
    if (r?.done) {
      this.stats.chopped++;
      this.events.emit('chop:done', r);
    }
    return r;
  }

  servePlate(plate, station) {
    const recipe = recipeForToppings(plate.contents);
    if (!recipe) {
      this.stats.wasted++;
      this.events.emit('dish:waste', { plate, station });
      return { recipe: null, points: 0, message: '这盘菜没人认得出来…', wasted: true };
    }

    const ticket = this.orders.consume(recipe.id);
    if (!ticket) {
      this.stats.wasted++;
      this.events.emit('dish:unwanted', { plate, station, recipe });
      return { recipe, points: 0, message: `没有客人点${recipe.name}`, wasted: true, unwanted: true };
    }

    const timeFrac = clamp(ticket.time / ticket.maxTime, 0, 1);
    const base = recipe.score;
    const tip = Math.round(base * 0.35 * timeFrac);
    const mult = this.comboMultiplier;
    const pointsBeforeRsi = Math.round((base + tip) * mult);
    const recommended = this.recommended.has(recipe.id);
    const rsiBonus = recommended ? Math.round(pointsBeforeRsi * 0.25) : 0;
    const points = pointsBeforeRsi + rsiBonus;
    const comboBefore = this.combo;
    this.combo = Math.min(this.combo + 1, 8);
    this.comboTimer = 30;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.score += points;
    this.stats.served++;
    this.stats.dishCounts[recipe.id] = (this.stats.dishCounts[recipe.id] || 0) + 1;
    if (recommended) {
      this.stats.recommendedServed++;
      this.stats.rsiBonus += rsiBonus;
    }
    if (this.stats.served === 1) this.firstServeAt = Math.round(this.elapsed * 10) / 10;
    if (points > this.stats.bestPoints) {
      this.stats.bestPoints = points;
      this.stats.bestDish = recipe.id;
    }

    return {
      recipe,
      ticket,
      points,
      base,
      tip,
      mult,
      comboBefore,
      comboAfter: this.combo,
      timeFrac,
      recommended,
      rsiBonus,
      message: `${recipe.name} +${points}`,
      wasted: false,
    };
  }

  finish() {
    if (this.state === 'over') return;
    this.state = 'over';
    this.timeLeft = 0;
    let stars = 0;
    for (let i = 0; i < this.level.target.length; i++) {
      if (this.score >= this.level.target[i]) stars = i + 1;
    }
    this.stars = stars;
    this.events.emit('level:end', {
      score: this.score,
      stars,
      stats: this.stats,
      maxCombo: this.maxCombo,
    });
  }

  /** Debug/test snapshot — no DOM. */
  snapshot() {
    return {
      timeLeft: this.timeLeft,
      score: this.score,
      combo: this.combo,
      state: this.state,
      stars: this.stars,
      stats: { ...this.stats },
      tickets: this.orders.tickets.map((t) => ({ ...t })),
      stations: this.kitchen.list.map((s) => ({
        id: s.id,
        kind: s.kind,
        item: s.item
          ? s.item.type === 'plate'
            ? { type: 'plate', contents: s.item.contents.map((c) => ({ ...c })) }
            : { type: 'ingredient', ingredient: s.item.ingredient, state: s.item.state, chop: s.item.chopProgress, cook: s.item.cookTimer }
          : null,
      })),
    };
  }
}

/** Recipe availability helper for menus. */
export function recipeName(id) {
  return RECIPES[id]?.name ?? id;
}

export { itemName };
