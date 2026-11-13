/** drop-unused-field.mjs — remove the never-rendered `latin` field from fish data. */
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/data/fish.js';
const src = readFileSync(path, 'utf8');
const before = src.length;
// Only drop lines that are exactly a latin field (never referenced by the UI).
const out = src.replace(/^\s*latin: '[^']*',\s*\n/gm, '');
writeFileSync(path, out, 'utf8');
const removed = (src.match(/^\s*latin: /gm) || []).length;
console.log(JSON.stringify({ removed, bytesSaved: before - out.length, bytes: [before, out.length] }));
