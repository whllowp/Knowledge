import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseCSV, percentile, analyzePlaytests, formatReport } from '../src/core/playtest-analysis.js';

const row = ({
  mode = 'fp',
  level = 1,
  players = 1,
  skill = 'novice',
  source = 'human',
  score = 300,
  served = 3,
  expired = 1,
  stars = 1,
  timeoutRate = 0.25,
} = {}) => ({
  mode,
  level,
  players,
  skill,
  source,
  score,
  served,
  expired,
  stars,
  timeoutRate,
});

test('CSV parser handles quotes, escaped quotes and CRLF', () => {
  const rows = parseCSV('\uFEFFa,b,c\r\n1,"x, y","he said ""hi"""\r\n2,3,4\r\n');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].a, '1');
  assert.equal(rows[0].b, 'x, y');
  assert.equal(rows[0].c, 'he said "hi"');
  assert.equal(rows[1].c, '4');
});

test('percentile interpolates and clamps', () => {
  assert.equal(percentile([1, 2, 3, 4], 0), 1);
  assert.equal(percentile([1, 2, 3, 4], 50), 2.5);
  assert.equal(percentile([1, 2, 3, 4], 100), 4);
  assert.equal(percentile([], 50), 0);
});

test('recommends 1/2/3 star targets from skill groups', () => {
  const rows = [
    ...[300, 310, 320].map((score) => row({ skill: 'novice', score })),
    ...[500, 510, 520].map((score) => row({ skill: 'average', score })),
    ...[700, 800, 900].map((score) => row({ skill: 'expert', score })),
  ];
  const result = analyzePlaytests(rows, { minSamples: 3 });
  const rec = result.recommendations.find((r) => r.mode === 'fp' && r.level === 1);
  assert.equal(rec.ready, true);
  assert.deepEqual(rec.target, [300, 500, 850]);
  assert.equal(rec.samples.novice, 3);
  assert.equal(rec.samples.average, 3);
  assert.equal(rec.samples.expert, 3);
  assert.match(formatReport(result), /建议 1★\/2★\/3★/);
});

test('automation rows and 2P rows are excluded from 1P human recommendations', () => {
  const rows = [
    ...[300, 310, 320].map((score) => row({ skill: 'novice', score })),
    ...[500, 510, 520].map((score) => row({ skill: 'average', score })),
    ...[700, 800, 900].map((score) => row({ skill: 'expert', score })),
    ...Array.from({ length: 10 }, (_, i) => row({ source: 'automation', skill: 'expert', score: 5000 + i })),
    ...Array.from({ length: 10 }, (_, i) => row({ players: 2, skill: 'expert', score: 5000 + i })),
  ];
  const result = analyzePlaytests(rows, { minSamples: 3 });
  assert.equal(result.humanRows, 19);
  assert.equal(result.automationRows, 10);
  assert.equal(result.selectedRows, 9);
  const rec = result.recommendations[0];
  assert.equal(rec.ready, true);
  assert.equal(rec.target[2], 850);
});

test('missing skill groups block a recommendation instead of guessing', () => {
  const rows = [
    ...[300, 310, 320].map((score) => row({ skill: 'novice', score })),
    ...[500, 510, 520].map((score) => row({ skill: 'average', score })),
  ];
  const result = analyzePlaytests(rows, { minSamples: 3 });
  const rec = result.recommendations[0];
  assert.equal(rec.ready, false);
  assert.ok(rec.missing.some((m) => m.startsWith('expert')));
  assert.equal(rec.target, null);
  assert.ok(result.warnings.some((w) => w.includes('样本不足')));
});

test('empty automation-only export has no recommendations', () => {
  const rows = Array.from({ length: 4 }, () => row({ source: 'automation', skill: 'unknown' }));
  const result = analyzePlaytests(rows, { minSamples: 3 });
  assert.equal(result.humanRows, 0);
  assert.equal(result.recommendations.length, 6);
  assert.ok(result.recommendations.every((r) => !r.ready));
  assert.ok(result.warnings.some((w) => w.includes('没有真人样本')));
});
