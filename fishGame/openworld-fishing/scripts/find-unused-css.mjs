/** find-unused-css.mjs — report selectors in styles.css that no source refers to. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync('src/styles.css', 'utf8');
const sources = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(js|html)$/.test(p)) sources.push(readFileSync(p, 'utf8'));
  }
})('src');
sources.push(readFileSync('index.html', 'utf8'));
const blob = sources.join('\n');

// strip comments, then take every selector group before a {
const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
const selectors = new Set();
const re = /([^{}]+)\{/g;
let m;
while ((m = re.exec(stripped))) {
  const block = m[1].trim();
  if (!block || block.startsWith('@') || block.includes('%')) continue;
  for (const part of block.split(',')) {
    const sel = part.trim();
    if (!sel || sel.startsWith('from') || sel.startsWith('to') || /^[\d.]+%$/.test(sel)) continue;
    selectors.add(sel);
  }
}
const unused = [];
let bytes = 0;
for (const sel of selectors) {
  const names = [...sel.matchAll(/[.#]([a-zA-Z][\w-]*)/g)].map((x) => x[1]);
  if (!names.length) continue;
  const used = names.some((n) => blob.includes(n));
  if (!used) {
    unused.push(sel);
    bytes += sel.length;
  }
}
console.log(JSON.stringify({ totalSelectors: selectors.size, unusedCount: unused.length, unused }, null, 2));
