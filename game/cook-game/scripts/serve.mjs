// Tiny static server for dist/, optionally rebuilding on change.
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve('dist');
const PORT = Number(process.env.PORT || 5173);
const watch = process.argv.includes('--watch');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
};

if (watch) {
  const { context } = await import('esbuild');
  const ctx = await context({
    entryPoints: ['src/main.js'],
    bundle: true,
    format: 'iife',
    target: ['chrome100'],
    outfile: 'dist/game.js',
    sourcemap: 'linked',
    logLevel: 'info',
  });
  const { copyFile, mkdir } = await import('node:fs/promises');
  await mkdir('dist', { recursive: true });
  await copyFile('src/index.html', 'dist/index.html');
  await copyFile('src/styles.css', 'dist/styles.css');
  await ctx.watch();
  console.log('[sizzle] watching…');
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let filePath = normalize(join(ROOT, urlPath === '/' ? 'index.html' : urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(ROOT, 'index.html');
  }
  const type = MIME[extname(filePath)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[sizzle] http://127.0.0.1:${PORT}`);
});
