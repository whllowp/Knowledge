// Playtest telemetry: every completed shift can be recorded locally and
// exported as JSON/CSV. Deliberately no network: a playtest session stays on
// the player's machine until the facilitator exports it.

const KEY = 'sizzle-rush:playtests:v1';
const MAX_SESSIONS = 500;

const memory = [];

function storage() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    /* private mode / file:// restrictions */
  }
  return null;
}

function read() {
  const store = storage();
  if (!store) return [...memory];
  try {
    const raw = store.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries) {
  const store = storage();
  if (store) {
    try {
      store.setItem(KEY, JSON.stringify(entries));
      return;
    } catch {
      /* quota / privacy */
    }
  }
  memory.length = 0;
  memory.push(...entries);
}

function makeRecord(entry, id) {
  const served = Math.max(0, Math.round(entry.served || 0));
  const expired = Math.max(0, Math.round(entry.expired || 0));
  const attempted = Math.max(1, served + expired);
  const skill = ['novice', 'average', 'expert', 'unknown'].includes(entry.skill) ? entry.skill : 'unknown';
  const firstTime = !(entry.firstTime === false || entry.firstTime === 'false');
  return {
    id: id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    at: typeof entry.at === 'string' && entry.at ? entry.at : new Date().toISOString(),
    build: entry.build || '1.0.0',
    mode: entry.mode === 'arcade' ? 'arcade' : 'fp',
    level: Number(entry.level) || 1,
    players: Number(entry.players) || 1,
    source: entry.source === 'automation' ? 'automation' : 'human',
    device: entry.device || 'keyboard',
    participant: typeof entry.participant === 'string' ? entry.participant.trim().slice(0, 24) : '',
    skill,
    firstTime,
    duration: Math.round(entry.duration || 0),
    firstServe: entry.firstServe == null ? null : Math.max(0, Math.round(Number(entry.firstServe) * 10) / 10),
    pauses: Math.max(0, Math.round(entry.pauses || 0)),
    difficulty: Math.max(0, Math.min(5, Math.round(entry.difficulty || 0))),
    wantReplay: ['yes', 'maybe', 'no'].includes(entry.wantReplay) ? entry.wantReplay : '',
    score: Math.max(0, Math.round(entry.score || 0)),
    stars: Math.max(0, Math.min(3, Math.round(entry.stars || 0))),
    served,
    expired,
    wasted: Math.max(0, Math.round(entry.wasted || 0)),
    burnt: Math.max(0, Math.round(entry.burnt || 0)),
    maxCombo: Math.max(0, Math.round(entry.maxCombo || 0)),
    timeoutRate: Math.round((expired / attempted) * 1000) / 1000,
    notes: typeof entry.notes === 'string' ? entry.notes.slice(0, 240) : '',
  };
}

export function recordSession(entry) {
  const record = makeRecord(entry);
  const entries = read();
  entries.push(record);
  const trimmed = entries.slice(-MAX_SESSIONS);
  write(trimmed);
  return record;
}

/**
 * Merge rows parsed from an exported CSV into local storage.
 * Existing ids are skipped so re-importing the same file is safe.
 */
export function importSessions(rows) {
  const byId = new Map(read().map((s) => [s.id, s]));
  let added = 0;
  let skipped = 0;
  for (const row of rows || []) {
    if (!row || typeof row !== 'object') {
      skipped++;
      continue;
    }
    const id = typeof row.id === 'string' && row.id ? row.id : null;
    if (id && byId.has(id)) {
      skipped++;
      continue;
    }
    const record = makeRecord(row, id);
    if (byId.has(record.id)) {
      skipped++;
      continue;
    }
    byId.set(record.id, record);
    added++;
  }
  const entries = [...byId.values()].slice(-MAX_SESSIONS);
  write(entries);
  return { added, skipped, total: entries.length };
}

export function updateSession(id, patch = {}) {
  const entries = read();
  const index = entries.findIndex((s) => s.id === id);
  if (index < 0) return null;
  const current = entries[index];
  const next = {
    ...current,
    difficulty:
      patch.difficulty != null ? Math.max(1, Math.min(5, Math.round(Number(patch.difficulty) || 0))) : current.difficulty || 0,
    wantReplay: ['yes', 'maybe', 'no'].includes(patch.wantReplay) ? patch.wantReplay : current.wantReplay || '',
  };
  entries[index] = next;
  write(entries);
  return next;
}

export function getSessions(filter = {}) {  return read().filter((s) => {
    if (filter.mode && s.mode !== filter.mode) return false;
    if (filter.level && s.level !== filter.level) return false;
    if (filter.source && s.source !== filter.source) return false;
    if (filter.skill && s.skill !== filter.skill) return false;
    if (filter.participant && s.participant !== filter.participant) return false;
    return true;
  });
}

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

export function summarize(filter = {}) {
  const all = getSessions(filter);
  const human = all.filter((s) => s.source === 'human');
  const rows = [];
  const modes = ['fp', 'arcade'];
  const levels = [...new Set(all.map((s) => s.level))].sort((a, b) => a - b);
  for (const mode of modes) {
    for (const level of levels) {
      const group = all.filter((s) => s.mode === mode && s.level === level);
      if (!group.length) continue;
      const humanGroup = group.filter((s) => s.source === 'human');
      rows.push({
        mode,
        level,
        count: group.length,
        humanCount: humanGroup.length,
        avgServed: round(avg(group.map((s) => s.served))),
        avgExpired: round(avg(group.map((s) => s.expired))),
        avgWasted: round(avg(group.map((s) => s.wasted))),
        timeoutRate: round(avg(group.map((s) => s.timeoutRate)) * 100, 1),
        avgScore: Math.round(avg(group.map((s) => s.score))),
        avgStars: round(avg(group.map((s) => s.stars))),
        bestScore: Math.max(...group.map((s) => s.score)),
        humanAvgServed: humanGroup.length ? round(avg(humanGroup.map((s) => s.served))) : null,
        humanTimeoutRate: humanGroup.length ? round(avg(humanGroup.map((s) => s.timeoutRate)) * 100, 1) : null,
        humanAvgScore: humanGroup.length ? Math.round(avg(humanGroup.map((s) => s.score))) : null,
        humanAvgStars: humanGroup.length ? round(avg(humanGroup.map((s) => s.stars))) : null,
        humanAvgFirstServe: (() => {
          const withFirst = humanGroup.filter((s) => s.firstServe != null);
          return withFirst.length ? round(avg(withFirst.map((s) => s.firstServe))) : null;
        })(),
        humanAvgPauses: humanGroup.length ? round(avg(humanGroup.map((s) => s.pauses || 0))) : null,
      });
    }
  }
  return {
    total: all.length,
    human: human.length,
    automation: all.length - human.length,
    rows,
    avgServed: round(avg(all.map((s) => s.served))),
    timeoutRate: round(avg(all.map((s) => s.timeoutRate)) * 100, 1),
    avgScore: Math.round(avg(all.map((s) => s.score))),
    avgFirstServe: (() => {
      const withFirst = all.filter((s) => s.firstServe != null);
      return withFirst.length ? round(avg(withFirst.map((s) => s.firstServe))) : null;
    })(),
    avgPauses: round(avg(all.map((s) => s.pauses || 0))),
  };
}

function csvCell(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const CSV_COLUMNS = [
  'id',
  'at',
  'build',
  'mode',
  'level',
  'players',
  'source',
  'device',
  'participant',
  'skill',
  'firstTime',
  'duration',
  'firstServe',
  'pauses',
  'difficulty',
  'wantReplay',
  'score',
  'stars',
  'served',
  'expired',
  'wasted',
  'burnt',
  'maxCombo',
  'timeoutRate',
  'notes',
];

export function toCSV(filter = {}) {
  const rows = getSessions(filter);
  const lines = [CSV_COLUMNS.join(',')];
  for (const row of rows) lines.push(CSV_COLUMNS.map((c) => csvCell(row[c])).join(','));
  return `${lines.join('\n')}\n`;
}

export function toJSON(filter = {}) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), sessions: getSessions(filter) }, null, 2);
}

export function clearSessions() {
  write([]);
}

export function playtestKey() {
  return KEY;
}
