// Read a playtest CSV exported from the game and print a threshold report.
//
// Usage:
//   node scripts/analyze-playtest.mjs path/to/playtest.csv
//   node scripts/analyze-playtest.mjs path.csv --players=all --min=5
//   node scripts/analyze-playtest.mjs path.csv --include-automation --json

import { readFile, writeFile } from 'node:fs/promises';
import { parseCSV, analyzePlaytests, formatReport } from '../src/core/playtest-analysis.js';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('用法: node scripts/analyze-playtest.mjs <playtest.csv> [--players=1|2|all] [--min=3] [--include-automation] [--json] [--out=report.md]');
  process.exitCode = 2;
} else {
  const flag = (name, fallback) => {
    const hit = args.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : fallback;
  };
  const playersRaw = flag('players', '1');
  const players = playersRaw === 'all' ? 'all' : [1, 2].includes(Number(playersRaw)) ? Number(playersRaw) : 1;
  const minSamples = Number(flag('min', '3')) || 3;
  const includeAutomation = args.includes('--include-automation');
  const json = args.includes('--json');
  const out = flag('out', '');

  const text = await readFile(file, 'utf8');
  const rows = parseCSV(text);
  if (!rows.length) {
    console.error(`CSV 没有数据行: ${file}`);
    process.exitCode = 1;
  } else {
    const result = analyzePlaytests(rows, { players, minSamples, includeAutomation });
    const report = formatReport(result);
    console.log(report);
    if (out) {
      await writeFile(out, report, 'utf8');
      console.error(`已写入 ${out}`);
    }
    if (json) {
      console.log(JSON.stringify(result, null, 2));
    }
    if (!result.recommendations.some((r) => r.ready)) {
      console.error('\n当前还没有任何一组达到重标条件；先补真人样本。');
    }
  }
}
