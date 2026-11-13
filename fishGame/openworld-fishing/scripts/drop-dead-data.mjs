/** drop-dead-data.mjs — remove data fields the UI never reads, plus dead CSS. */
import { readFileSync, writeFileSync } from 'node:fs';

const report = {};

// 1. spot descriptions are never rendered (panels use short/depth/biome)
{
  const p = 'src/data/spots.js';
  const src = readFileSync(p, 'utf8');
  const out = src.replace(/^\s*desc: '[^']*',\s*\n/gm, '');
  writeFileSync(p, out, 'utf8');
  report.spotDesc = { removed: (src.match(/^\s*desc: /gm) || []).length, bytes: src.length - out.length };
}

// 2. CSS rules nothing references
{
  const p = 'src/styles.css';
  const src = readFileSync(p, 'utf8');
  let out = src;
  const dead = ['.r4', '.pause-title'];
  for (const sel of dead) {
    const re = new RegExp('(^|\\})\\s*' + sel.replace('.', '\\.') + '\\s*\\{[^}]*\\}', 'g');
    out = out.replace(re, '$1');
  }
  writeFileSync(p, out, 'utf8');
  report.css = { bytes: src.length - out.length };
}

console.log(JSON.stringify(report));
