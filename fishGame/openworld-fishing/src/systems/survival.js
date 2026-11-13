/**
 * survival.js — the Don't Starve layer (v4.x).
 *
 * Four meters, all 0..1, all interacting:
 *   hunger  — drains with time and effort; at zero you starve and lose health.
 *   health  — the only meter that kills you. Starvation, freezing and drowning
 *             drain it; food, shelter and warmth restore it slowly.
 *   sanity  — drains in darkness, fog and storms; light, fire and a good meal
 *             restore it. Low sanity makes the night actively hostile.
 *   warmth  — body temperature in °C, pulled toward the environment and toward
 *             any nearby fire; below ~33 you are cold, below 30 you are freezing.
 *
 * Everything is stored in `profile.survival` so it saves with the profile.
 */
import { clamp, clamp01, lerp } from '../core/util.js';

export const SURVIVAL_DEFAULTS = {
  hunger: 1,
  health: 1,
  sanity: 1,
  warmth: 36.6,
  days: 0,
  deaths: 0,
  eaten: 0,
  lastDay: 0,
};

/** Environmental targets, per weather kind. */
const WEATHER_DRAIN = {
  clear: { sanity: 0, warmth: 0 },
  cloudy: { sanity: 0.001, warmth: -0.2 },
  rain: { sanity: 0.0025, warmth: -1.4 },
  storm: { sanity: 0.005, warmth: -1.9 },
  fog: { sanity: 0.004, warmth: -0.6 },
  snow: { sanity: 0.0015, warmth: -2.6 },
};

export class Survival {
  constructor(game) {
    this.game = game;
    this.onDeath = null;
    this.dead = false;
    this._eatCooldown = 0;
    this._warned = {};
    this.stats = null;
  }

  /** Ensure the profile has the meters, filling in anything missing. */
  ensure(profile) {
    if (!profile.survival) profile.survival = { ...SURVIVAL_DEFAULTS };
    const s = profile.survival;
    for (const k of Object.keys(SURVIVAL_DEFAULTS)) if (s[k] === undefined) s[k] = SURVIVAL_DEFAULTS[k];
    s.hunger = clamp01(s.hunger);
    s.health = clamp01(s.health);
    s.sanity = clamp01(s.sanity);
    s.warmth = clamp(s.warmth, 20, 42);
    return s;
  }

  get state() {
    return this.ensure(this.game.profile);
  }

  /** Meters with display-ready values. */
  snapshot() {
    const s = this.state;
    const season = this.game.world?.sky?.season || null;
    return {
      hunger: s.hunger,
      health: s.health,
      sanity: s.sanity,
      warmth: s.warmth,
      days: s.days,
      deaths: s.deaths,
      temperature: Math.round(s.warmth * 10) / 10,
      season: season ? { id: season.id, label: season.label, icon: season.icon, note: season.note } : null,
      status: this.statusList(),
    };
  }

  statusList() {
    const out = [];
    const s = this.state;
    if (s.hunger < 0.2) out.push({ id: 'hungry', label: '饥饿', icon: '🍖', level: 1 });
    if (s.hunger <= 0.001) out.push({ id: 'starving', label: '挨饿', icon: '💀', level: 2 });
    if (s.sanity < 0.35) out.push({ id: 'insane', label: '理智崩溃', icon: '🌀', level: 1 });
    if (s.warmth < 33) out.push({ id: 'cold', label: '寒冷', icon: '❄️', level: 1 });
    if (s.warmth < 30) out.push({ id: 'freezing', label: '失温', icon: '🥶', level: 2 });
    if (s.health < 0.35) out.push({ id: 'hurt', label: '重伤', icon: '❤️‍🩹', level: 2 });
    return out;
  }

  /** Warmth from any campfire the player is standing next to. */
  _fireWarmth(ctx) {
    const { world, player } = ctx;
    const c = world?.props?.campfire;
    if (!c) return 0;
    const fires = Array.isArray(c) ? c : [c];
    const px = player.position.x;
    const pz = player.position.z;
    let best = 0;
    for (const f of fires) {
      const d = Math.hypot(f.x - px, f.z - pz);
      if (d < 9) best = Math.max(best, 1 - d / 9);
    }
    return best;
  }

  update(dt, ctx) {
    if (this.dead) return null;
    const s = this.ensure(this.game.profile);
    const { player, world } = ctx;
    const env = world?.sky?.env || {};
    const kind = world?.weather?.kind || 'clear';
    const night = clamp01(env.night ?? 0);
    const golden = clamp01(env.golden ?? 0);
    const wd = WEATHER_DRAIN[kind] || WEATHER_DRAIN.clear;

    // ---- day counter
    const day = Math.floor(world?.sky?.dayCount ?? 0);
    if (day > (s.lastDay ?? 0)) {
      s.lastDay = day;
      s.days = (s.days || 0) + (day - (s.lastDay - 1));
      s.days = day + 1;
    }

    // ---- hunger
    let burn = 0.0016;
    if (player.sprinting) burn *= 1.7;
    if (player.swimming) burn *= 1.35;
    if (player.mounted) burn *= 0.55; // sitting in a boat is restful
    if (s.warmth < 33) burn *= 1.35; // shivering costs energy
    s.hunger = clamp01(s.hunger - burn * dt);

    // ---- warmth: environment pulls, fire pushes
    const season = ctx.world?.sky?.season;
    const seasonTemp = season?.temp ?? 0;
    const ambient = 35 + seasonTemp - night * 2.5 - (kind === 'snow' ? 7 : 0) - Math.max(0, -wd.warmth) * 1.1;
    const fire = this._fireWarmth(ctx);
    const target = fire > 0 ? lerp(ambient, 40, 0.55 + fire * 0.45) : ambient + golden * 2.6;
    const pull = fire > 0 ? 0.35 : 0.06;
    s.warmth = clamp(s.warmth + (target - s.warmth) * clamp01(pull * dt * 3), 20, 42);

    // ---- sanity
    let sanity = 0;
    if (night > 0.5) sanity -= 0.0075 * night;
    else sanity += 0.0016;
    if (kind === 'fog' || kind === 'storm') sanity -= wd.sanity;
    if (fire > 0.1) sanity += 0.011 * fire;
    // a lit lantern holds the dark back (v4.1.0)
    const lantern = clamp01((this.game.lantern?.intensity ?? 0) / 1.9);
    if (lantern > 0.05) sanity += 0.006 * lantern;
    if (s.warmth < 32) sanity -= 0.003;
    if (s.hunger <= 0.001) sanity -= 0.004;
    s.sanity = clamp01(s.sanity + sanity * dt);

    // ---- health
    let health = 0;
    if (s.hunger <= 0.001) health -= 0.012; // starvation
    if (s.warmth < 30) health -= 0.009; // hypothermia
    if (s.sanity <= 0.001) health -= 0.003; // the dark gets in
    if (s.hunger > 0.5 && s.warmth > 34 && s.sanity > 0.4) health += 0.0012; // recovery
    s.health = clamp01(s.health + health * dt);

    // ---- warnings (once each per crossing)
    this._warn('hungry', s.hunger < 0.22, '饿了 · 吃条鱼（H）或回篝火边做饭', 'bad');
    this._warn('starving', s.hunger <= 0.001, '你在挨饿，生命正在流失', 'bad');
    this._warn('cold', s.warmth < 33, '有点冷 · 靠近篝火或回屋', '');
    this._warn('freezing', s.warmth < 30, '失温！快去篝火边', 'bad');
    this._warn('insane', s.sanity < 0.3, '理智在流失 · 点亮提灯或回到火边', 'bad');

    // ---- death
    if (s.health <= 0.001) {
      this.dead = true;
      s.deaths = (s.deaths || 0) + 1;
      this.onDeath?.({ hunger: s.hunger, sanity: s.sanity, warmth: s.warmth, days: s.days });
      return { died: true };
    }
    return null;
  }

  _warn(id, condition, text, tone) {
    if (!condition) {
      this._warned[id] = false;
      return;
    }
    if (this._warned[id]) return;
    this._warned[id] = true;
    this.game.hud?.notify(text, tone);
    if (tone === 'bad') this.game.audio?.play('ui_error');
  }

  /**
   * Eat something from the keeper net. `entry` is a pantry record; cooked food
   * comes in with a `cooked` flag and restores more.
   */
  eat(entry, cooked = false) {
    const s = this.state;
    const fish = this.game.fishById?.(entry?.id);
    const weight = clamp(entry?.weight || 0.3, 0.1, 30);
    // bigger fish fill you up more, with diminishing returns
    const size = clamp01(Math.cbrt(weight) / 2.4);
    const gain = clamp01(0.18 + size * 0.42) * (cooked ? 1.35 : 1);
    s.hunger = clamp01(s.hunger + gain);
    s.sanity = clamp01(s.sanity + (cooked ? 0.06 : 0.02));
    s.warmth = Math.min(42, s.warmth + (cooked ? 1.2 : 0.2));
    s.eaten = (s.eaten || 0) + 1;
    // eating the wrong thing hurts a little (raw junk/fugu handled by caller)
    if (fish && fish.rarity >= 5 && !cooked) s.sanity = clamp01(s.sanity - 0.02);
    return { gain, name: entry?.name || '鱼', hunger: s.hunger, sanity: s.sanity };
  }

  /** Restore after a death: everything back to a survivable level. */
  revive() {
    const s = this.state;
    s.health = 0.55;
    s.hunger = 0.45;
    s.sanity = 0.5;
    s.warmth = 36.6;
    this.dead = false;
    this._warned = {};
    return s;
  }

  /** Sleep at the cabin: restores health and sanity, costs hunger. */
  sleep() {
    const s = this.state;
    s.health = clamp01(s.health + 0.5);
    s.sanity = clamp01(s.sanity + 0.5);
    s.hunger = clamp01(s.hunger - 0.25);
    s.warmth = 36.6;
    return s;
  }
}
