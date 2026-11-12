import { test } from 'node:test';
import assert from 'node:assert/strict';

import { recordSession, getSessions, summarize, toCSV, toJSON, clearSessions, importSessions, updateSession } from '../src/core/playtest.js';

test('telemetry records and summarizes sessions', () => {
  clearSessions();
  recordSession({
    mode: 'fp',
    level: 1,
    players: 1,
    source: 'human',
    device: 'keyboard',
    duration: 180,
    score: 1200,
    stars: 2,
    served: 8,
    expired: 2,
    wasted: 1,
    burnt: 0,
    maxCombo: 4,
  });
  recordSession({
    mode: 'fp',
    level: 1,
    players: 2,
    source: 'human',
    device: 'gamepad',
    duration: 180,
    score: 900,
    stars: 1,
    served: 6,
    expired: 4,
    wasted: 0,
    burnt: 1,
    maxCombo: 2,
  });
  recordSession({
    mode: 'arcade',
    level: 2,
    players: 2,
    source: 'automation',
    device: 'keyboard',
    duration: 210,
    score: 500,
    stars: 0,
    served: 3,
    expired: 3,
  });

  assert.equal(getSessions().length, 3);
  assert.equal(getSessions({ mode: 'fp' }).length, 2);
  assert.equal(getSessions({ source: 'human' }).length, 2);

  const summary = summarize();
  assert.equal(summary.total, 3);
  assert.equal(summary.human, 2);
  const fp1 = summary.rows.find((r) => r.mode === 'fp' && r.level === 1);
  assert.equal(fp1.count, 2);
  assert.equal(fp1.avgServed, 7);
  assert.equal(fp1.bestScore, 1200);
  assert.equal(fp1.timeoutRate, 30); // (2/10 + 4/10)/2 * 100
});

test('timeout rate and served are sanitized', () => {
  clearSessions();
  const row = recordSession({
    mode: 'weird',
    level: '2',
    score: -50,
    stars: 99,
    served: -2,
    expired: '3',
  });
  assert.equal(row.mode, 'fp');
  assert.equal(row.level, 2);
  assert.equal(row.score, 0);
  assert.equal(row.stars, 3);
  assert.equal(row.served, 0);
  assert.equal(row.expired, 3);
  assert.equal(row.timeoutRate, 1);
});

test('participant, skill and first-time labels are recorded', () => {
  clearSessions();
  const row = recordSession({
    mode: 'fp',
    level: 1,
    source: 'human',
    participant: ' P01 ',
    skill: 'novice',
    firstTime: false,
    score: 500,
    served: 4,
    expired: 1,
  });
  assert.equal(row.participant, 'P01');
  assert.equal(row.skill, 'novice');
  assert.equal(row.firstTime, false);
  const human = summarize({ source: 'human' });
  assert.equal(human.human, 1);
  assert.equal(human.avgServed, 4);
  const group = summarize().rows[0];
  assert.equal(group.humanAvgServed, 4);
  assert.equal(group.humanTimeoutRate, 20);
});

test('first-serve, pauses and post-shift survey are recorded', () => {
  clearSessions();
  const row = recordSession({
    mode: 'fp',
    level: 1,
    source: 'human',
    participant: 'P02',
    skill: 'average',
    firstServe: 42.46,
    pauses: 2,
    score: 600,
    served: 5,
    expired: 1,
  });
  assert.equal(row.firstServe, 42.5);
  assert.equal(row.pauses, 2);
  assert.equal(summarize({ source: 'human' }).avgFirstServe, 42.5);

  const updated = updateSession(row.id, { difficulty: 4 });
  assert.equal(updated.difficulty, 4);
  const replay = updateSession(row.id, { wantReplay: 'yes' });
  assert.equal(replay.wantReplay, 'yes');
  assert.equal(getSessions()[0].difficulty, 4);
  assert.equal(updateSession('missing', { difficulty: 2 }), null);
});

test('CSV import dedupes ids and preserves profile fields', () => {
  clearSessions();
  const result = importSessions([
    {
      id: 'imported-1',
      at: '2026-11-03T01:00:00.000Z',
      mode: 'fp',
      level: '1',
      players: '1',
      source: 'human',
      device: 'gamepad',
      participant: 'P07',
      skill: 'expert',
      firstTime: 'false',
      served: '5',
      expired: '1',
      score: '700',
      stars: '2',
    },
  ]);
  assert.equal(result.added, 1);
  const row = getSessions()[0];
  assert.equal(row.id, 'imported-1');
  assert.equal(row.participant, 'P07');
  assert.equal(row.skill, 'expert');
  assert.equal(row.firstTime, false);
  assert.equal(row.timeoutRate, 0.167);
  const again = importSessions([{ ...row, id: 'imported-1' }]);
  assert.equal(again.added, 0);
  assert.equal(again.skipped, 1);
  assert.equal(getSessions().length, 1);
});

test('CSV and JSON exports are valid', () => {
  clearSessions();
  recordSession({
    mode: 'fp',
    level: 1,
    score: 100,
    served: 1,
    expired: 0,
    notes: 'says, "hello"',
  });
  const csv = toCSV();
  assert.match(csv, /^id,at,build,mode,level/);
  assert.match(csv, /"says, ""hello"""/);
  const parsed = JSON.parse(toJSON());
  assert.equal(parsed.sessions.length, 1);
  assert.equal(parsed.sessions[0].score, 100);
});
