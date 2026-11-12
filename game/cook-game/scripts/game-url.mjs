import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** file:// URL for the built game, or GAME_URL when testing a server build. */
export const gameUrl = process.env.GAME_URL || pathToFileURL(resolve('dist/index.html')).href;
