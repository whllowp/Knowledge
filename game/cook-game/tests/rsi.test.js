import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  reset,
  setContext,
  getContext,
  recommendForLevel,
  recordShift,
  getState,
  getAlbum,
  buildAlbumHTML,
  autoContext,
  detectCityId,
  seasonalWeather,
} from '../src/core/rsi.js';

test('recommendations respect level tier and are unique', () => {
  reset();
  setContext({ city: 'chengdu', weather: 'rain', prefs: ['hearty', 'onion'] });
  const rec = recommendForLevel({ tier: 1 });
  assert.equal(rec.ids.length, 3);
  assert.equal(new Set(rec.ids).size, 3);
  for (const item of rec.items) assert.ok(item.tier <= 1, `${item.name} tier ${item.tier}`);
  assert.equal(rec.context.cityInfo.name, '成都');
  assert.ok(rec.items.some((i) => i.reasons.length > 0));
});

test('context changes and RSI state persist', () => {
  reset();
  setContext({ city: 'guangzhou', weather: 'heat', prefs: ['fresh'] });
  const context = getContext();
  assert.equal(context.cityInfo.name, '广州');
  assert.equal(context.weatherInfo.name, '热浪');
  assert.deepEqual(context.prefs, ['fresh']);
  const rec = recommendForLevel({ tier: 2 });
  assert.ok(rec.items.some((i) => i.reasons.some((r) => r.includes('热浪') || r.includes('广州') || r.includes('清爽'))));
});

test('recordShift builds replay history and a yearbook', () => {
  reset();
  recordShift({
    at: '2026-03-12T12:00:00.000Z',
    mode: 'fp',
    level: 1,
    recommended: ['salad', 'garden_salad', 'cheeseburger'],
    dishCounts: { salad: 3, cheeseburger: 1 },
    served: 4,
    score: 550,
    stars: 2,
    timeoutRate: 0.2,
    difficulty: 4,
    wantReplay: 'yes',
  });
  recordShift({
    at: '2026-07-08T12:00:00.000Z',
    mode: 'arcade',
    level: 2,
    recommended: ['tomato_toast', 'veggie_burger', 'deluxe'],
    dishCounts: { tomato_toast: 2, veggie_burger: 2 },
    served: 4,
    score: 700,
    stars: 3,
    timeoutRate: 0.1,
    difficulty: 3,
    wantReplay: 'yes',
  });
  const state = getState();
  assert.equal(state.history.length, 2);
  assert.ok(state.policy.version >= 2, `policy version ${state.policy.version}`);
  assert.ok(state.policy.replayScore > 0);
  const album = getAlbum(2026);
  assert.equal(album.totalShifts, 2);
  assert.equal(album.totalDishes, 8);
  assert.equal(album.topDish.id, 'salad');
  assert.ok(album.months.length >= 2);
  assert.ok(album.memoir.some((p) => p.includes('2026')));
  const html = buildAlbumHTML(album);
  assert.match(html, /2026 年度相册/);
  assert.match(html, /回忆录/);
  assert.match(html, /田园沙拉/);
});

test('empty yearbook is explicit', () => {
  reset();
  const album = getAlbum(2026);
  assert.equal(album.totalShifts, 0);
  assert.equal(album.totalDishes, 0);
  assert.ok(album.memoir[0].includes('还没有开火记录'));
});

test('auto context uses timezone/season without network', () => {
  reset();
  const city = detectCityId();
  assert.ok(['shanghai', 'chengdu', 'guangzhou', 'beijing', 'hangzhou'].includes(city));
  assert.ok(['sunny', 'rain', 'snow', 'heat', 'wind'].includes(seasonalWeather(city, new Date('2026-07-15'))));
  autoContext(new Date('2026-07-15'));
  const context = getContext();
  assert.equal(context.city, city);
  assert.ok(['sunny', 'rain', 'snow', 'heat', 'wind'].includes(context.weather));
});
