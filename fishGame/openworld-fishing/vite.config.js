import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig(({ command }) => ({
  plugins: [
    {
      name: 'minify-html',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html
            .replace(/<!--(?!\[)[\s\S]*?-->/g, '')
            .replace(/\n\s*\n/g, '\n')
            .replace(/\n[ \t]+/g, '\n');
        },
      },
    },
  ],
  // In production `three` is aliased to a copy with the shader paths this game
  // never uses removed (scripts/trim-three.mjs), so Rollup can drop their GLSL.
  resolve: {
    // match only the bare specifier so `three/addons/...` still resolves
    alias:
      command === 'build'
        ? [{ find: /^three$/, replacement: resolve(process.cwd(), '.build/three.trimmed.js') }]
        : [],
  },
  server: {
    host: '127.0.0.1',
    port: 5177,
    strictPort: true,
    open: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 5178,
    strictPort: true,
  },
  css: {
    // modern targets let lightningcss drop legacy prefixes we never need
    lightningcss: { targets: { chrome: 110 << 16, firefox: 110 << 16, safari: 16 << 16 } },
  },
  // Strip debug output and go for the smallest possible tree-shaken bundle
  // (v6.1.0 size pass). Console calls are removed from the shipped build only.
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'terser',
    cssMinify: 'lightningcss',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2048,
    terserOptions: {
      ecma: 2022,
      module: true,
      toplevel: true,
      compress: {
        passes: 5,
        drop_console: true,
        drop_debugger: true,
        ecma: 2022,
        booleans_as_integers: true,
        pure_getters: false,
        unsafe: false,
      },
      mangle: {
        toplevel: true,
        // Internals are marked with a leading underscore; `__` stays reserved
        // for the API surface the tests poke at.
        properties: { regex: /^_[a-zA-Z]/, reserved: [/^__/] },
      },
      format: { comments: false, ecma: 2022 },
    },
    rollupOptions: {
      // 'smallest' turns off moduleSideEffects, which drops the game's whole
      // entry (everything runs from side effects), so keep it explicitly on.
      treeshake: { preset: 'smallest', moduleSideEffects: true },
    },
  },
}));

