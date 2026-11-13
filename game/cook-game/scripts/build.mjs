import { build, context, transform } from 'esbuild';
import { mkdir, copyFile, rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const minify = process.argv.includes('--minify');
const watch = process.argv.includes('--watch');

const options = {
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  target: ['chrome100', 'edge100', 'firefox100', 'safari15'],
  outfile: 'dist/game.js',
  minify,
  sourcemap: minify ? false : 'linked',
  logLevel: 'info',
  legalComments: 'none',
  charset: 'utf8',
};

async function copyAssets() {
  if (!existsSync('dist')) await mkdir('dist', { recursive: true });
  await copyFile('src/index.html', 'dist/index.html');
  await copyFile('src/styles.css', 'dist/styles.css');
  if (minify) {
    const css = await readFile('dist/styles.css', 'utf8');
    const out = await transform(css, { loader: 'css', minify: true });
    await writeFile('dist/styles.css', out.code);
    const html = await readFile('dist/index.html', 'utf8');
    const packed = html
      .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .trim();
    await writeFile('dist/index.html', packed);
  }
}

/**
 * Ship the production bundle as a self-extracting gzip payload. The raw
 * minified JS stays around 740 KB; the deployed game.js is roughly a third
 * of that, while Chrome/Edge/Safari 16.4+ inflate it in a few milliseconds.
 * Development builds stay plain JS for breakpoints and source maps.
 */
async function packProductionBundle() {
  const raw = await readFile('dist/game.js');
  const gz = gzipSync(raw, { level: 9 });
  const payload = gz.toString('base64');
  const loader = [
    '/* SIZZLE production bundle: gzip payload + native DecompressionStream. */',
    '(()=>{',
    `const P="${payload}";`,
    'try{',
    'const b=atob(P),u=new Uint8Array(b.length);',
    'for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);',
    'if(!("DecompressionStream" in window))throw new Error("DecompressionStream unavailable");',
    'new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).text().then((code)=>{(0,eval)(code);}).catch((e)=>{',
    'window.__SIZZLE_BOOT_ERROR__=e;',
    'const el=document.getElementById("boot");if(el)el.textContent="启动失败："+e.message;',
    'console.error("[sizzle] boot",e);',
    '});',
    '}catch(e){window.__SIZZLE_BOOT_ERROR__=e;console.error("[sizzle] boot",e);}',
    '})();',
  ].join('');
  await writeFile('dist/game.js', loader);
  console.log(`[sizzle] packed ${raw.length} -> ${loader.length} bytes (${(100 - (loader.length / raw.length) * 100).toFixed(1)}% smaller)`);
}

if (watch) {
  const ctx = await context({
    ...options,
    plugins: [
      {
        name: 'copy-assets',
        setup(b) {
          b.onEnd(async (result) => {
            if (result.errors.length === 0) await copyAssets();
          });
        },
      },
    ],
  });
  await ctx.watch();
  console.log('[sizzle] watching src/ -> dist/');
} else {
  await build(options);
  await copyAssets();
  if (minify) {
    await rm('dist/game.js.map', { force: true });
    await packProductionBundle();
  }
  console.log('[sizzle] built dist/');
}
