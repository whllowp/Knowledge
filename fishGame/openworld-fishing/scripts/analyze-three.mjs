/** analyze-three.mjs — how much of three's build is the GLSL shader chunk table. */
import { readFileSync } from 'node:fs';

const src = readFileSync('node_modules/three/build/three.module.js', 'utf8');
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
// count bytes inside template literals and single-quoted strings
let glsl = 0;
let count = 0;
const tpl = /`([\s\S]*?)`/g;
let m;
while ((m = tpl.exec(block))) {
  glsl += Buffer.byteLength(m[1], 'utf8');
  count++;
}
const sq = /'([^'\\\n]*)'/g;
while ((m = sq.exec(block))) {
  glsl += m[1].length;
  count++;
}
const names = [...block.matchAll(/^\t([a-zA-Z0-9_]+):/gm)].map((x) => x[1]);
const heavy = names.filter((k) => /physical|toon|matcap|transmission|clearcoat|sheen|iridescence|anisotropy/i.test(k));
console.log(
  JSON.stringify(
    {
      shaderChunkBytes: block.length,
      stringLiterals: count,
      glslBytes: glsl,
      totalChunks: names.length,
      heavyChunks: heavy.length,
      heavyNames: heavy.slice(0, 20),
      threeSourceBytes: src.length,
    },
    null,
    2
  )
);
