/**
 * analyze-shaders.mjs — measure how much of three's bundle is GLSL for shaders
 * the game never uses, by resolving the ShaderChunk table and its #include
 * closure.
 */
import { readFileSync } from 'node:fs';

const src = readFileSync('node_modules/three/build/three.module.js', 'utf8');

// 1. locate the ShaderChunk object literal and read its `name: identifier,` map
const start = src.indexOf('const ShaderChunk = {');
let depth = 0;
let end = -1;
const open = src.indexOf('{', start);
for (let i = open; i < src.length; i++) {
  const c = src[i];
  if (c === '{') depth++;
  else if (c === '}') {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
const block = src.slice(start, end);
const map = new Map();
for (const m of block.matchAll(/^\t([A-Za-z0-9_]+): ([A-Za-z0-9_]+),?$/gm)) map.set(m[1], m[2]);

// 2. measure each chunk's GLSL literal (build uses `var name = "..."`)
const literalOf = (ident) => {
  const re = new RegExp(`var ${ident} = "((?:[^"\\\\]|\\\\.)*)";`);
  const m = src.match(re);
  return m ? m[1] : null;
};
const chunks = new Map();
let totalGlsl = 0;
for (const [name, ident] of map) {
  const txt = literalOf(ident);
  if (txt == null) continue;
  chunks.set(name, txt);
  totalGlsl += Buffer.byteLength(txt, 'utf8');
}

// 3. include closure for the shaders we keep
const KEEP = ['basic', 'lambert', 'points', 'sprite', 'depth', 'shadow', 'background', 'backgroundCube', 'cube', 'equirect', 'distanceRGBA', 'dashed', 'normal', 'phong'];
const libStart = src.indexOf('const ShaderLib = {');
depth = 0;
end = -1;
for (let i = src.indexOf('{', libStart); i < src.length; i++) {
  const c = src[i];
  if (c === '{') depth++;
  else if (c === '}') {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
const libBlock = src.slice(libStart, end);
const libMap = new Map();
for (const m of libBlock.matchAll(/^\t([A-Za-z0-9_]+): \{([\s\S]*?)^\t\},?$/gm)) {
  const body = m[2];
  const refs = [...body.matchAll(/ShaderChunk\.([A-Za-z0-9_]+)/g)].map((x) => x[1]);
  libMap.set(m[1], refs);
}

const needed = new Set();
const visit = (name) => {
  if (needed.has(name)) return;
  const txt = chunks.get(name);
  if (txt == null) return;
  needed.add(name);
  for (const inc of txt.matchAll(/#include <([A-Za-z0-9_]+)>/g)) visit(inc[1]);
};
for (const k of KEEP) for (const ref of (libMap.get(k) || [])) visit(ref);
// non-shader chunks referenced by name from JS (e.g. 'common' used by ShaderMaterial users)
for (const extra of ['common', 'fog_vertex', 'fog_pars_fragment', 'fog_pars_vertex', 'fog_fragment']) visit(extra);

let needGlsl = 0;
for (const n of needed) needGlsl += Buffer.byteLength(chunks.get(n) || '', 'utf8');
const unused = [...chunks.keys()].filter((n) => !needed.has(n));
let unusedGlsl = 0;
for (const n of unused) unusedGlsl += Buffer.byteLength(chunks.get(n) || '', 'utf8');

console.log(
  JSON.stringify(
    {
      chunks: chunks.size,
      totalGlslBytes: totalGlsl,
      neededChunks: needed.size,
      neededGlslBytes: needGlsl,
      unusedChunks: unused.length,
      unusedGlslBytes: unusedGlsl,
      biggestUnused: unused
        .map((n) => [n, Buffer.byteLength(chunks.get(n), 'utf8')])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12),
    },
    null,
    2
  )
);
