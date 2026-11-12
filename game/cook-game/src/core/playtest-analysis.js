// Playtest CSV analysis: turn exported human sessions into per-skill stats and
// proposed 1★/2★/3★ thresholds. Pure functions, no DOM/Node APIs.

import { LEVELS } from './data.js';

export const SKILLS = ['novice', 'average', 'expert', 'unknown'];
const MODES = ['fp', 'arcade'];

const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const round = (n, digits = 1) => Math.round(n * 10 ** digits) / 10 ** digits;
const round25 = (n) => Math.round(n / 25) * 25;

/** Minimal RFC-4180 CSV parser (quotes, escaped quotes, CRLF). */
export function parseCSV(text) {
  const source = String(text || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((cell) => cell !== ''))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
}

/** Linear-interpolated percentile; p is 0..100. */
export function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * (Math.max(0, Math.min(100, p)) / 100);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function stats(sessions) {
  if (!sessions.length) return null;
  const served = sessions.map((s) => num(s.served));
  const score = sessions.map((s) => num(s.score));
  const timeout = sessions.map((s) => num(s.timeoutRate) * 100);
  const first = sessions.filter((s) => s.firstServe != null && s.firstServe !== '').map((s) => num(s.firstServe));
  const difficulty = sessions.filter((s) => num(s.difficulty) > 0).map((s) => num(s.difficulty));
  const replay = { yes: 0, maybe: 0, no: 0 };
  for (const s of sessions) if (replay[s.wantReplay] != null) replay[s.wantReplay]++;
  return {
    n: sessions.length,
    served: { p25: round(percentile(served, 25)), p50: round(percentile(served, 50)), p75: round(percentile(served, 75)) },
    timeout: { p25: round(percentile(timeout, 25)), p50: round(percentile(timeout, 50)), p75: round(percentile(timeout, 75)) },
    score: { p25: Math.round(percentile(score, 25)), p50: Math.round(percentile(score, 50)), p75: Math.round(percentile(score, 75)) },
    firstServe: first.length ? round(percentile(first, 50)) : null,
    avgDifficulty: difficulty.length ? round(difficulty.reduce((a, b) => a + b, 0) / difficulty.length, 1) : null,
    replay,
    avgStars: round(sessions.reduce((a, s) => a + num(s.stars), 0) / sessions.length, 2),
  };
}

function skillOf(row) {
  return SKILLS.includes(row.skill) ? row.skill : 'unknown';
}

function sourceOf(row) {
  return row.source === 'automation' ? 'automation' : 'human';
}

/**
 * Analyze rows from a playtest CSV.
 * - defaults to human, 1-player sessions (2P is reported separately by caller)
 * - recommendations need >= minSamples in novice/average/expert each
 */
export function analyzePlaytests(rows, { minSamples = 3, players = 1, includeAutomation = false } = {}) {
  const all = Array.isArray(rows) ? rows : [];
  const human = all.filter((r) => sourceOf(r) === 'human');
  const eligible = includeAutomation ? all : human;
  const selected = eligible.filter((r) => {
    if (players === 'all') return true;
    return num(r.players, 1) === Number(players);
  });

  const warnings = [];
  if (!human.length) warnings.push('CSV 里没有真人样本（source=human）；请用非自动化浏览器试玩，或从导出文件里移除 automation 行后再分析。');
  if (!includeAutomation && eligible.length !== all.length) {
    warnings.push(`已忽略 ${all.length - eligible.length} 条自动化样本。`);
  }
  if (players !== 'all') warnings.push(`只统计 ${players}P 样本；2P 合作会显著提高分数，目标仍以 1P 为准。`);
  if (!selected.length) {
    warnings.push(`没有符合当前筛选（${players === 'all' ? '全部人数' : `${players}P`}）的样本，请检查 CSV 的 players/source 列。`);
  }

  const keyed = new Map();
  for (const row of selected) {
    const mode = row.mode === 'arcade' ? 'arcade' : 'fp';
    const level = num(row.level, 1);
    const key = `${mode}:${level}`;
    if (!keyed.has(key)) keyed.set(key, { mode, level, sessions: [] });
    keyed.get(key).sessions.push(row);
  }

  const groups = [];
  for (const mode of MODES) {
    for (const level of LEVELS) {
      const group = keyed.get(`${mode}:${level.id}`);
      const sessions = group?.sessions || [];
      const bySkill = Object.fromEntries(SKILLS.map((skill) => [skill, stats(sessions.filter((s) => skillOf(s) === skill))]));
      const unknown = sessions.filter((s) => skillOf(s) === 'unknown').length;
      if (unknown) warnings.push(`${mode} SHIFT ${level.id}: ${unknown} 条样本没有经验标签（skill=unknown），不会参与阈值推荐。`);
      groups.push({
        mode,
        level: level.id,
        currentTarget: [...level.target],
        sessions: sessions.length,
        bySkill,
        overall: stats(sessions),
      });
    }
  }

  const recommendations = groups.map((group) => {
    const novice = group.bySkill.novice;
    const average = group.bySkill.average;
    const expert = group.bySkill.expert;
    const missing = [];
    if (!novice || novice.n < minSamples) missing.push(`novice(${novice?.n || 0}/${minSamples})`);
    if (!average || average.n < minSamples) missing.push(`average(${average?.n || 0}/${minSamples})`);
    if (!expert || expert.n < minSamples) missing.push(`expert(${expert?.n || 0}/${minSamples})`);
    let target = null;
    if (!missing.length) {
      const one = Math.max(100, round25(novice.score.p50));
      const two = Math.max(one + 100, round25(average.score.p50));
      const three = Math.max(two + 100, round25(expert.score.p75));
      target = [one, two, three];
    }
    return {
      mode: group.mode,
      level: group.level,
      currentTarget: group.currentTarget,
      target,
      ready: !!target,
      missing,
      samples: { novice: novice?.n || 0, average: average?.n || 0, expert: expert?.n || 0, total: group.sessions },
    };
  });

  for (const rec of recommendations) {
    const group = groups.find((g) => g.mode === rec.mode && g.level === rec.level);
    if (!rec.ready) {
      if (group.sessions > 0) warnings.push(`${modeName(rec.mode)} SHIFT ${rec.level}: 样本不足（${rec.missing.join('、')}），未生成建议。`);
      continue;
    }
    const expertTimeout = group.bySkill.expert.timeout.p50;
    if (expertTimeout > 25) {
      warnings.push(`${modeName(rec.mode)} SHIFT ${rec.level}: 熟练组超时率 p50=${expertTimeout}% > 25%，优先放宽订单耐心/队列，而不是继续降分。`);
    }
  }

  return {
    totalRows: all.length,
    humanRows: human.length,
    automationRows: all.length - human.length,
    selectedRows: selected.length,
    players,
    minSamples,
    includeAutomation,
    groups,
    recommendations,
    warnings,
  };
}

function modeName(mode) {
  return mode === 'fp' ? '沉浸厨房' : '街机厨房';
}

function fmtTarget(target) {
  return target ? target.join(' / ') : '—';
}

export function formatReport(result) {
  const lines = [];
  lines.push('# 真人试玩分析与阈值建议');
  lines.push('');
  lines.push(`- 总行数：${result.totalRows}（真人 ${result.humanRows} / 自动 ${result.automationRows}）`);
  lines.push(`- 参与统计：${result.selectedRows} 条（${result.players === 'all' ? '全部人数' : `${result.players}P`}）`);
  lines.push(`- 每组经验标签最少样本：${result.minSamples}`);
  lines.push('');

  if (result.warnings.length) {
    lines.push('## 警告');
    for (const w of result.warnings) lines.push(`- ${w}`);
    lines.push('');
  }

  lines.push('## 建议阈值');
  lines.push('');
  lines.push('| 模式 | 班次 | 样本（新/普/熟） | 当前 1★/2★/3★ | 建议 1★/2★/3★ | 状态 |');
  lines.push('|---|---:|---|---|---|---|');
  for (const rec of result.recommendations) {
    const s = rec.samples;
    const status = rec.ready ? '可重标' : `缺 ${rec.missing.join('、')}`;
    lines.push(
      `| ${modeName(rec.mode)} | ${rec.level} | ${s.novice}/${s.average}/${s.expert} | ${fmtTarget(rec.currentTarget)} | ${fmtTarget(rec.target)} | ${status} |`,
    );
  }
  lines.push('');

  lines.push('## 分经验明细');
  lines.push('');
  lines.push('| 模式 | 班次 | 经验 | n | 出餐 p50 | 超时率 p50 | 首单 p50 | 分数 p25/p50/p75 | 难度均值 | 平均星 |');
  lines.push('|---|---:|---|---:|---:|---:|---:|---|---:|---:|');
  for (const group of result.groups) {
    for (const skill of ['novice', 'average', 'expert', 'unknown']) {
      const s = group.bySkill[skill];
      if (!s) continue;
      const label = { novice: '新手', average: '普通', expert: '熟练', unknown: '未标注' }[skill];
      lines.push(
        `| ${modeName(group.mode)} | ${group.level} | ${label} | ${s.n} | ${s.served.p50} | ${s.timeout.p50}% | ${s.firstServe != null ? `${s.firstServe}s` : '—'} | ${s.score.p25}/${s.score.p50}/${s.score.p75} | ${s.avgDifficulty ?? '—'} | ${s.avgStars} |`,
      );
    }
  }
  lines.push('');
  lines.push('> 规则：1★ = 新手分数 p50；2★ = 普通分数 p50；3★ = 熟练分数 p75。所有建议以 1P 样本为准，2P 只做参考。');
  lines.push('> 如果状态是“缺样本”，先补人，不要用自动化行凑数。');
  lines.push('');
  return lines.join('\n');
}
