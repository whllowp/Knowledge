/**
 * contest.js — timed fishing contests against three AI anglers.
 *
 * v1.9.0. A contest runs for a fixed duration at the spot you start it from.
 * Your own catches during the window score normally (weight × rarity), while
 * the AI anglers roll plausible catches on a timer. The live standings are
 * shown in the HUD and the winner takes the pot.
 */
import { Emitter, clamp, clamp01, pick, rand, randInt, formatDuration } from '../core/util.js';
import { FISH, RARITY } from '../data/fish.js';
import { fishValue } from './progression.js';

const AI_NAMES = ['老周', '小林', '阿海', '陈伯', '渔歌', '大壮', '阿岚'];
const AI_COLORS = ['#7fd8ff', '#ffd166', '#4ade80', '#ff8fa3', '#c9a7ff'];

export class Contest extends Emitter {
  constructor(game) {
    super();
    this.game = game;
    this.active = false;
    this.timeLeft = 0;
    this.duration = 180;
    this.entry = 100;
    this.entrants = [];
    this.results = null;
    this.spotId = null;
    this._acc = 0;
  }

  get standings() {
    return [...this.entrants]
      .map((e) => ({ ...e, score: Math.round(e.score) }))
      .sort((a, b) => b.score - a.score);
  }

  canStart() {
    const g = this.game;
    if (this.active) return { ok: false, error: '比赛进行中' };
    if (g.fishing.state !== 'idle') return { ok: false, error: '先收竿再开始比赛' };
    const spot = g.world.activeSpot(g.player.position.x, g.player.position.z, g.profile.level);
    if (!spot) return { ok: false, error: '要站在钓点范围内才能开始比赛' };
    if (g.profile.coins < this.entry) return { ok: false, error: `报名费需要 ${this.entry} 金币` };
    return { ok: true, spot };
  }

  start(duration = 180) {
    const check = this.canStart();
    if (!check.ok) return check;
    const g = this.game;
    this.duration = duration;
    this.timeLeft = duration;
    this.spotId = check.spot.id;
    this.active = true;
    this.results = null;
    g.profile.coins -= this.entry;
    this.entrants = [
      { id: 'you', name: '你', score: 0, you: true, color: '#ffffff', count: 0, best: null },
    ];
    const pool = [...AI_NAMES].sort(() => Math.random() - 0.5).slice(0, 3);
    for (let i = 0; i < pool.length; i++) {
      this.entrants.push({
        id: `ai${i}`,
        name: pool[i],
        score: 0,
        you: false,
        color: AI_COLORS[i % AI_COLORS.length],
        count: 0,
        best: null,
        // AI skill varies. Their scoring is paced (see update) so the contest
        // stays competitive whatever water you start it in.
        next: rand(14, 26),
        skill: rand(0.45, 0.95),
        pace: rand(52, 122),
        lastAt: 0,
      });
    }
    // ---- RSI rival (v6.0.0): the self-improving angler joins the field
    const rival = this.game?.rsi;
    if (rival?.ready && rival.gen > 0) {
      const pace = rival.contestPace();
      this.entrants.push({
        id: 'rival',
        name: '老渔夫',
        score: 0,
        you: false,
        rival: true,
        color: '#ffd166',
        count: 0,
        best: null,
        next: rand(14, 26),
        skill: 0.5 + Math.min(0.45, rival.gen / 60),
        pace,
        lastAt: 0,
      });
    }
    this._acc = 0;
    this.emit('start', { spot: check.spot, entry: this.entry });
    return { ok: true, spot: check.spot, entrants: this.entrants.length };
  }

  /** Score the player's own catch. */
  addCatch(info) {
    if (!this.active) return 0;
    const me = this.entrants.find((e) => e.you);
    if (!me) return 0;
    const r = RARITY[info.fish.rarity] || RARITY[1];
    const points = Math.round(info.weight * 14 * r.valueMult);
    me.score += points;
    me.count++;
    if (!me.best || info.weight > me.best.weight) me.best = { name: info.fish.name, weight: info.weight };
    this.emit('score', { points, standings: this.standings });
    return points;
  }

  update(dt) {
    if (!this.active) return;
    this.timeLeft -= dt;

    // AI anglers fish on their own timers
    for (const e of this.entrants) {
      if (e.you) continue;
      e.next -= dt * e.skill;
      e.lastAt += dt;
      if (e.next > 0) continue;
      e.next = rand(14, 26) / e.skill;
      // pick something plausible for this water
      const ctx = this.game.fishing.ctx;
      let fish;
      try {
        fish = this.game.fishing.rollFish(
          ctx || {
            region: 'lake',
            biome: 'lake',
            depth: 4,
            waters: ['lake', 'shore'],
            biomes: ['lake'],
            spot: null,
          }
        );
      } catch {
        fish = FISH[0];
      }
      const weight = fish.minWeight + (fish.maxWeight - fish.minWeight) * Math.pow(Math.random(), 0.7);
      // Pace-based scoring: what this angler banked since their last fish,
      // so their 3-minute total lands near pace × minutes.
      const minutes = Math.max(0.05, e.lastAt / 60);
      const points = Math.max(6, Math.round(e.pace * minutes * rand(0.75, 1.35)));
      e.lastAt = 0;
      e.score += points;
      e.count++;
      if (!e.best || weight > e.best.weight) e.best = { name: fish.name, weight };
      this.emit('aiCatch', { name: e.name, fish: fish.name, points });
    }

    if (this.timeLeft <= 0) this.finish();
  }

  finish() {
    if (!this.active) return null;
    this.active = false;
    this.timeLeft = 0;
    const table = this.standings;
    const rank = table.findIndex((e) => e.you) + 1;
    const pot = this.entry * this.entrants.length;
    const prizes = [Math.round(pot * 0.62), Math.round(pot * 0.26), Math.round(pot * 0.12), 0];
    const prize = prizes[clamp(rank - 1, 0, 3)] || 0;
    this.game.profile.coins += prize;
    this.game.profile.stats.contests = (this.game.profile.stats.contests || 0) + 1;
    if (rank === 1) this.game.profile.stats.contestWins = (this.game.profile.stats.contestWins || 0) + 1;
    this.results = { table, rank, prize, pot };
    this.emit('finish', this.results);
    return this.results;
  }

  /** Abandon without a result. */
  cancel() {
    if (!this.active) return false;
    this.active = false;
    this.timeLeft = 0;
    this.emit('cancel');
    return true;
  }

  get hudLine() {
    if (!this.active) return null;
    const table = this.standings;
    const rank = table.findIndex((e) => e.you) + 1;
    return {
      timeLeft: Math.max(0, Math.round(this.timeLeft)),
      rank,
      total: table.length,
      table: table.slice(0, 4).map((e, i) => ({ rank: i + 1, name: e.name, score: e.score, you: !!e.you })),
    };
  }
}
