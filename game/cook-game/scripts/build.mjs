import { build, context } from 'esbuild';
import { mkdir, copyFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

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
  if (minify) await rm('dist/game.js.map', { force: true });
  console.log('[sizzle] built dist/');
}
