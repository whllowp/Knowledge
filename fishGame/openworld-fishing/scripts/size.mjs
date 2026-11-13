/** size.mjs — report the shipped bundle size (raw + gzip + brotli). */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { join } from 'node:path';

const dir = process.argv[2] || 'dist';
const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else files.push({ p, size: st.size });
  }
})(dir);

let raw = 0;
let gz = 0;
let br = 0;
const rows = [];
for (const f of files) {
  const buf = readFileSync(f.p);
  const g = gzipSync(buf, { level: 9 }).length;
  const b = brotliCompressSync(buf).length;
  raw += f.size;
  gz += g;
  br += b;
  rows.push({ file: f.p.replace(/\\/g, '/'), raw: f.size, gzip: g, brotli: b });
}
rows.sort((a, b) => b.raw - a.raw);
console.log(JSON.stringify({ total: { raw, gzip: gz, brotli: br }, files: rows }, null, 2));
