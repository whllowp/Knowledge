/**
 * trim-three.mjs — build a three.js copy without the shader paths the game
 * never uses (physical / standard / toon / matcap / normal / phong / dashed).
 *
 * Rollup cannot drop them on its own: `ShaderChunk` is one object literal that
 * names every GLSL chunk, so the whole table stays reachable. Rewriting that
 * table to the include-closure of the shaders we do use makes the unused GLSL
 * consts unreachable, and then normal tree-shaking removes them.
 *
 * Run before a production build; the output is aliased over `three`.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';

const SRC = 'node_modules/three/build/three.module.js';
const OUT = '.build/three.trimmed.js';

/**
 * ShaderLib entries the game can actually reach. Derived from the materials the
 * source creates (MeshLambertMaterial, MeshBasicMaterial, ShaderMaterial,
 * SpriteMaterial, PointsMaterial, LineBasicMaterial) plus what the renderer
 * itself needs (depth pass, shadow map, colour background).
 */
const KEEP_LIB = ['basic', 'lambert', 'points', 'sprite', 'depth', 'background', 'cube'];

const src = readFileSync(SRC, 'utf8');

/** Find `const NAME = { ... }` and return { start, end } of the whole statement. */
function objectLiteralRange(text, decl) {
  const start = text.indexOf(decl);
  if (start < 0) return null;
  let depth = 0;
  let i = text.indexOf('{', start);
  const open = i;
  for (; i < text.length; i++) {
    const c = text[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return { start, open, close: i + 1 };
    }
  }
  return null;
}

const libRange = objectLiteralRange(src, 'const ShaderLib = {');
const chunkRange = objectLiteralRange(src, 'const ShaderChunk = {');
if (!libRange || !chunkRange) {
  console.error('could not locate ShaderLib/ShaderChunk');
  process.exit(1);
}

const libBlock = src.slice(libRange.start, libRange.close);
const chunkBlock = src.slice(chunkRange.start, chunkRange.close);

// ---- parse `name: ident,` from the ShaderChunk table
const chunkIdents = new Map();
for (const m of chunkBlock.matchAll(/^[\t ]*([A-Za-z0-9_$]+):[ \t]*([A-Za-z0-9_$]+)[ \t]*,?[ \t]*$/gm)) {
  chunkIdents.set(m[1], m[2]);
}

// ---- read each chunk's raw source segment and pull its #include list out of
// the text directly. Parsing the string literal is unreliable (some shaders are
// built by concatenation), and a wrong closure blanks a chunk that a live
// shader needs — which renders the whole scene invisible.
const chunkText = new Map();
const chunkIncludes = new Map();
for (const [name, ident] of chunkIdents) {
  const esc = ident.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(?:var|let|const) ' + esc + ' = ');
  const m = re.exec(src);
  if (!m) continue;
  // Parse the literal properly: shaders may be double-quoted or template
  // literals, and searching for ";\n" truncates template literals early.
  let i = m.index + m[0].length;
  let body = '';
  if (src[i] === '`') {
    const end = src.indexOf('`', i + 1);
    body = src.slice(i + 1, end > 0 ? end : i + 40000);
  } else if (src[i] === '"') {
    let j = i + 1;
    while (j < src.length) {
      const c = src[j];
      if (c === '\\') {
        j += 2;
        continue;
      }
      if (c === '"') break;
      j++;
    }
    body = src.slice(i + 1, j);
  }
  const incs = [...body.matchAll(/#include <([A-Za-z0-9_]+)>/g)].map((x) => x[1]);
  chunkIncludes.set(name, incs);
  chunkText.set(name, body);
}

// ---- split the ShaderLib block into entries
const entries = new Map();
const entryRe = /^\t([A-Za-z0-9_$]+): \{[\s\S]*?^\t\},?$/gm;
for (const m of libBlock.matchAll(entryRe)) entries.set(m[1], m[0]);

// ---- include closure from the kept shaders
const needed = new Set();
const visitChunk = (name) => {
  if (needed.has(name)) return;
  needed.add(name);
  for (const inc of chunkIncludes.get(name) || []) visitChunk(inc);
};
// three also pulls chunks by name from WebGLProgram's prefix, e.g.
// ShaderChunk['tonemapping_pars_fragment'] — bracket access, not #include.
for (const m of src.matchAll(/ShaderChunk\s*\[\s*['"]([A-Za-z0-9_]+)['"]\s*\]/g)) visitChunk(m[1]);

const missingLib = [];
for (const key of KEEP_LIB) {
  const body = entries.get(key);
  if (!body) {
    missingLib.push(key);
    continue;
  }
  for (const ref of body.matchAll(/ShaderChunk\.([A-Za-z0-9_$]+)/g)) visitChunk(ref[1]);
}

// The game's own ShaderMaterials also `#include <...>` three chunks (fog, uv,
// packing and friends). Any chunk they name must survive, or those materials
// silently render nothing.
let gameIncludes = 0;
(function scanDir(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) scanDir(p);
    else if (e.name.endsWith('.js')) {
      const text = readFileSync(p, 'utf8');
      for (const m of text.matchAll(/#include <([A-Za-z0-9_]+)>/g)) {
        gameIncludes++;
        visitChunk(m[1]);
      }
    }
  }
})('src');
if (missingLib.length) {
  console.error('ShaderLib entries not found:', missingLib);
  process.exit(1);
}
// Safety: a plausible closure must keep dozens of chunks. If the table parse
// regressed we would emit a table missing real includes, which breaks shaders
// at runtime — fail the build instead.
if (needed.size < 20) {
  console.error(`refusing to trim: include closure only found ${needed.size} chunks (expected >= 20)`);
  process.exit(1);
}

// ---- rebuild the two object literals
// Default '2' (blank every shader the kept materials cannot reach). Set
// BLANK_SHADERS=0 to build with the original three for comparison.
const BLANK = process.env.BLANK_SHADERS ?? '2';
// ShaderLib trimming (dropping material definitions nothing creates) is safe on
// its own, so it always applies; BLANK only controls GLSL blanking.
const sourceLibBlock = null;
const keptLib = KEEP_LIB.map((k) => entries.get(k).replace(/[\s,]+$/, '')).join(',\n');
// In BLANK mode ShaderLib stays exactly as it was: only the GLSL is emptied.
const newLibBlock = sourceLibBlock || `const ShaderLib = {\n${keptLib}\n};`;

const keptChunks = [...chunkIdents.keys()].filter((n) => needed.has(n));
// Chunk-table trimming is opt-in: it is what actually lets Rollup drop the
// unused GLSL (~60 kB), but every include has to resolve or three silently
// renders nothing — so verify the closure before writing.
const TRIM_CHUNKS = process.env.TRIM_CHUNKS === '1';
// BLANK mode keeps the whole table and every ShaderLib entry intact — it only
// empties the GLSL string of chunks no kept shader can reach. Structure is
// untouched, so nothing can reorder or go missing.
const BLANK2 = BLANK;
const newChunkBlock = BLANK2
  ? chunkBlock
  : TRIM_CHUNKS
    ? `const ShaderChunk = {\n${keptChunks.map((n) => `\t${n}: ${chunkIdents.get(n)},`).join('\n')}\n};`
    : chunkBlock;

export function resolveCheck() {
  if (!TRIM_CHUNKS) return [];
  const missing = new Set();
  const walk = (name, seen) => {
    if (seen.has(name)) return;
    seen.add(name);
    const txt = chunkText.get(name);
    if (txt == null) {
      if (!chunkIdents.has(name)) missing.add(name);
      return;
    }
    for (const inc of txt.matchAll(/#include <([A-Za-z0-9_]+)>/g)) walk(inc[1], seen);
  };
  for (const key of KEEP_LIB) {
    const body = entries.get(key);
    if (!body) continue;
    for (const ref of body.matchAll(/ShaderChunk\.([A-Za-z0-9_]+)/g)) walk(ref[1], new Set());
  }
  return [...missing];
}

let out = src;
// replace the chunk table first (it starts later in the file), then the lib
out = out.slice(0, chunkRange.start) + newChunkBlock + out.slice(chunkRange.close);
const libRange2 = objectLiteralRange(out, 'const ShaderLib = {');
out = out.slice(0, libRange2.start) + newLibBlock + out.slice(libRange2.close);
// three assigns a few extra shaders *after* the literal (physical depends on
// standard), so those statements have to go too or they dereference a shader
// we removed.
// BLANK mode: empty the GLSL of chunks nothing can reach. Only chunks that no
// `#include <...>` anywhere mentions are blanked (the root shaders of materials
// we dropped) — that can never starve a live shader of a snippet it includes.
// A closure-based version blanked snippet chunks like tonemapping_pars_fragment
// and rendered the whole scene invisible, so this stays deliberately dumb.
const includedAnywhere = new Set();
for (const mm of src.matchAll(/#include <([A-Za-z0-9_]+)>/g)) includedAnywhere.add(mm[1]);
let blanked = 0;
if (BLANK) {
  // Blank only consts that a *dropped* ShaderLib entry references and no kept
  // entry does. Nothing else is touched, so no include closure to get wrong.
  const keptRefs = new Set();
  const droppedRefs = new Set();
  for (const [key, body] of entries) {
    const target = KEEP_LIB.includes(key) ? keptRefs : droppedRefs;
    for (const m2 of body.matchAll(/ShaderChunk\.([A-Za-z0-9_$]+)/g)) target.add(m2[1]);
  }
  const blankable = BLANK === '2'
    ? [...chunkIdents.keys()].filter((n) => !needed.has(n))
    : [...droppedRefs].filter((n) => !keptRefs.has(n));
  for (const name of blankable) {
    const ident = chunkIdents.get(name);
    if (!ident || needed.has(name)) continue;
    const esc = ident.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(?:var|let|const) ' + esc + ' = (?:`[\\s\\S]*?`|"(?:[^"\\\\]|\\\\.)*");');
    const before = out;
    out = out.replace(re, 'var ' + ident + ' = "";');
    if (out !== before) blanked++;
  }
  console.log('blankable roots:', blankable.length, '-> blanked', blanked);
}
if (false) {
  for (const [name, ident] of chunkIdents) {
    if (needed.has(name) || includedAnywhere.has(name) || !chunkIncludes.has(name)) continue;
    const esc = ident.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(?:var|let|const) ' + esc + ' = (?:`[\\s\\S]*?`|"(?:[^"\\\\]|\\\\.)*");');
    const next = out.replace(re, `var ${ident} = "";`);
    if (next !== out) {
      out = next;
      blanked++;
    }
  }
}

let removedAssignments = 0;
const droppedLib = [...entries.keys()].filter((k) => !KEEP_LIB.includes(k));
// `physical` is not in the literal at all: it is defined afterwards in terms of
// `ShaderLib.standard`, so it must be removed by name.
for (const name of [...droppedLib, 'physical', 'physical.uniforms']) {
  const marker = `ShaderLib.${name} = {`;
  for (;;) {
    const at = out.indexOf(marker);
    if (at < 0) break;
    // find the end of the statement: `{...};`
    let depth = 0;
    let end = -1;
    for (let i = out.indexOf('{', at); i < out.length; i++) {
      const c = out[i];
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end < 0) break;
    const semi = out.indexOf(';', end);
    out = out.slice(0, at) + out.slice(semi + 1);
    removedAssignments++;
  }
}

mkdirSync(dirname(resolve(OUT)), { recursive: true });
// Stamp the mode into the file so a running page can prove which three it got.
const marker = `globalThis.__THREE_TRIM__ = ${JSON.stringify(TRIM_CHUNKS ? 'lib+chunks' : 'lib')};\n`;
writeFileSync(OUT, marker + out, 'utf8');

console.log(
  JSON.stringify(
    {
      wrote: OUT,
      droppedShaderLib: droppedLib,
      keptShaderLib: KEEP_LIB,
      chunksKept: keptChunks.length,
      chunksDropped: chunkIdents.size - keptChunks.length,
      removedAssignments,
      chunkTableBytes: [chunkBlock.length, newChunkBlock.length],
      fileBytes: [src.length, out.length],
      savedBytes: src.length - out.length,
    },
    null,
    2
  )
);
