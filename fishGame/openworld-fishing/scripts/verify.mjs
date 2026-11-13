/**
 * verify.mjs — headless verification driver.
 *
 * Launches nothing itself: it attaches to an already-running Chrome with a
 * remote debugging port, navigates to the game, waits for boot, captures
 * console errors, exercises the fishing loop through the in-page debug hooks,
 * takes screenshots and prints a JSON report.
 *
 * Usage: node scripts/verify.mjs <url> [outDir] [--shots]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:5177/?autostart=1&diag=1&quality=medium';const outDir = process.argv[3] || 'verify-out';
const shots = process.argv.includes('--shots');
const fast = process.argv.includes('--fast');
const CDP_PORT = Number(process.env.CDP_PORT || 9222);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  throw new Error('no CDP page target found');
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    this.consoleErrors = [];
    this.exceptions = [];
    this.logs = [];
    ws.addEventListener('message', (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        resolve(msg);
        return;
      }
      this.events.push(msg);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = (msg.params.args || [])
          .map((a) => a.value ?? a.description ?? a.unserializableValue ?? a.type)
          .join(' ');
        if (msg.params.type === 'error') this.consoleErrors.push(text);
        else this.logs.push(`[${msg.params.type}] ${text}`);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const d = msg.params.exceptionDetails;
        this.exceptions.push(d.exception?.description || d.text);
      } else if (msg.method === 'Log.entryAdded') {
        const e = msg.params.entry;
        if (e.level === 'error') this.consoleErrors.push(`${e.source}: ${e.text}`);
        else this.logs.push(`[log/${e.level}] ${e.text}`);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          resolve({ error: { message: `timeout: ${method}` } });
        }
      }, 120000);
    });
  }

  async evaluate(expression, { awaitPromise = false, returnByValue = true } = {}) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise,
      returnByValue,
      userGesture: true,
    });
    if (res.error) return { ok: false, error: res.error.message };
    const r = res.result;
    if (r.exceptionDetails) {
      return { ok: false, error: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    }
    return { ok: true, value: r.result?.value };
  }
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const target = await findTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });
  const cdp = new CDP(ws);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const report = { url, steps: [], shots: [], errors: [], exceptions: [], logs: [] };
  const step = (name, data) => {
    report.steps.push({ name, ...data });
    console.log(`· ${name}: ${JSON.stringify(data).slice(0, 400)}`);
  };

  await cdp.send('Page.navigate', { url });
  step('navigate', { url });

  // ---- wait for boot
  let booted = false;
  for (let i = 0; i < 240; i++) {
    const r = await cdp.evaluate('!!(window.__DIAG && window.__DIAG.ready)');
    if (r.ok && r.value) {
      booted = true;
      break;
    }
    await sleep(1000);
  }
  step('boot', { booted, waited: true });
  if (!booted) {
    const err = await cdp.evaluate('JSON.stringify(window.__DIAG ? window.__DIAG.errors : ["no __DIAG"])');
    report.errors.push('boot timed out');
    report.errors.push(err.value);
    writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2).slice(0, 4000));
    process.exit(1);
  }

  // ---- let the loop run a while
  await sleep(6000);
  const diag1 = await cdp.evaluate('JSON.stringify(window.__DIAG)');
  step('diag-after-boot', { diag: JSON.parse(diag1.value || '{}') });

  const render = await cdp.evaluate(
    'JSON.stringify({frames: __DIAG.frames, calls: __DIAG.calls, tris: __DIAG.triangles, geo: __DIAG.geometries, tex: __DIAG.textures})'
  );
  step('render-stats', JSON.parse(render.value || '{}'));

  const glInfo = await cdp.evaluate(`(() => {
    const c = document.querySelector('canvas');
    if (!c) return JSON.stringify({canvas:false});
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    return JSON.stringify({
      canvas: true,
      width: c.width, height: c.height,
      gl: !!gl,
      renderer: gl ? gl.getParameter(gl.RENDERER) : null,
      vendor: gl ? gl.getParameter(gl.VENDOR) : null,
      lost: gl ? gl.isContextLost() : null
    });
  })()`);
  step('webgl', JSON.parse(glInfo.value || '{}'));

  // ---- drive the fishing loop through the debug hooks
  const castFlow = [];
  const log = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    castFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
    return r;
  };

  await log('teleport-to-lake-dock', `String(__DEBUG.teleport('lake_dock'))`);
  await sleep(1500);
  await log('player-pos', `JSON.stringify({x: +__GAME.player.position.x.toFixed(1), y: +__GAME.player.position.y.toFixed(2), z: +__GAME.player.position.z.toFixed(1), biome: __GAME.world.biomeAt(__GAME.player.position.x, __GAME.player.position.z), onDock: __GAME.player.onDock})`);
  await log('cast-at', `(() => { const c = __DEBUG.castAt(-16, -8); return JSON.stringify({region: c.region, biome: c.biome, depth: +c.depth.toFixed(2), waters: c.waters, biomes: c.biomes, spot: c.spot ? c.spot.name : null}); })()`);
  await log('force-bite', `String(__DEBUG.forceBite())`);
  await sleep(400);
  await log('state-after-bite', `__GAME.fishing.state`);

  // strike through the real input path (simulated key press consumed by the loop)
  await log('strike-via-input', `(() => { __GAME.input._pressed.add('KeyF'); return __GAME.fishing.state; })()`);
  await sleep(600);
  await log('state-after-strike', `__GAME.fishing.state`);

  // deterministic fight simulation (independent of the render frame rate)
  await log('sim-fight', `JSON.stringify(__DEBUG.simFight(900, 1/60, 'auto'))`);
  await sleep(300);
  await log('result', `JSON.stringify({state: __GAME.fishing.state, species: Object.keys(__GAME.profile.journal).length, coins: __GAME.profile.coins, xp: __GAME.profile.xp, level: __GAME.profile.level, stats: {casts: __GAME.profile.stats.casts, catches: __GAME.profile.stats.catches, escapes: __GAME.profile.stats.escapes, snapped: __GAME.profile.stats.snapped, perfect: __GAME.profile.stats.perfect}})`);
  step('fishing-loop', { castFlow });

  // ---- full cast pipeline (charge -> release -> fly -> water), deterministically
  await log('sim-cast', `JSON.stringify(__DEBUG.simCast())`);
  await log('sim-bite', `JSON.stringify(__DEBUG.simBite())`);
  await log('fight-after-bite', `__GAME.fishing.state`);
  await log('water-debug', `JSON.stringify(__DEBUG.waterDebug())`);

  // ---- boats (v1.2.0)
  const boatFlow = [];
  const blog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    boatFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await blog('boat-list', `JSON.stringify(__GAME.boats.boats.map(b => ({id:b.id, x:+b.position.x.toFixed(1), z:+b.position.z.toFixed(1), inWater: __GAME.world.isWater(b.position.x, b.position.z), depth:+__GAME.world.depthAt(b.position.x,b.position.z).toFixed(2)})))`);
  await blog('boat-moorings-ok', `JSON.stringify(__GAME.boats.boats.map(b => __GAME.world.depthAt(b.position.x, b.position.z) > 0.9))`);
  await blog('boat-board-force', `JSON.stringify(__DEBUG.boat('force'))`);
  await blog('boat-seated', `JSON.stringify({aboard: !!__GAME.boats.mounted, playerMounted: !!__GAME.player.mounted, pose: __GAME.player.angler._pose, py: +__GAME.player.position.y.toFixed(2)})`);
  await blog('boat-row-forward', `JSON.stringify(__DEBUG.boat('row', 420, 1, 0))`);
  await blog('boat-row-turn', `JSON.stringify(__DEBUG.boat('row', 300, 1, 1))`);
  await blog('boat-float', `JSON.stringify({y:+__GAME.boats.boats[0].position.y.toFixed(2), surf:+__GAME.world.surfaceHeight(__GAME.boats.boats[0].position.x, __GAME.boats.boats[0].position.z).toFixed(2)})`);
  await blog('boat-fish-from-boat', `JSON.stringify(__DEBUG.simCast(200))`);
  await blog('boat-disembark', `JSON.stringify(__DEBUG.boat('board'))`);
  await blog('wildlife', `JSON.stringify(__DEBUG.wildlife())`);
  step('boats', { boatFlow });

  // ---- tutorial (v1.3.0)
  const tutFlow = [];
  const tlog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    tutFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await tlog('tutorial-reset', `(() => { __GAME.profile.settings.tutorialDone = false; __GAME.tutorial.start(); return JSON.stringify(__DEBUG.tutorial()); })()`);
  for (const stepId of ['reach_water', 'first_cast', 'first_bite', 'first_catch', 'first_shop', 'first_view']) {
    await tlog(`step-${stepId}`, `(() => { const before = __GAME.tutorial.index; const r = __DEBUG.tutorialStep('${stepId}'); return JSON.stringify({ before, after: r.index, step: r.step, active: r.active, done: r.done, advanced: r.index > before }); })()`);
  }
  await tlog('tutorial-final', `JSON.stringify({tutorial: __DEBUG.tutorial(), coins: __GAME.profile.coins, tutorialDone: __GAME.profile.settings.tutorialDone})`);
  step('tutorial', { tutFlow });

  // ---- kitchen / buffs (v1.4.0)
  const kitFlow = [];
  const klog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    kitFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await klog('go-to-fire', `JSON.stringify(__DEBUG.goToFire())`);
  await klog('grant-fish', `(() => {
    const ids = ['crucian_carp','common_carp','grass_carp','mandarin_fish','bluefin_tuna'];
    const out = [];
    for (const id of ids) { try { out.push(__DEBUG.grantCatch(id)); } catch (e) { out.push('err:'+e.message); } }
    return JSON.stringify(out);
  })()`);
  await klog('pantry-before', `JSON.stringify(__DEBUG.kitchen())`);
  await klog('cook-grilled', `JSON.stringify(__DEBUG.cook('grilled'))`);
  await klog('kitchen-after', `JSON.stringify(__DEBUG.kitchen())`);
  await klog('cook-soup', `JSON.stringify(__DEBUG.cook('soup'))`);
  await klog('cook-smoked', `JSON.stringify(__DEBUG.cook('smoked'))`);
  await klog('buffs-active', `JSON.stringify(__DEBUG.kitchen())`);
  await klog('gear-with-buffs', `JSON.stringify({luck: +__GAME.fishing.gear.luck.toFixed(3), bite: +__GAME.fishing.gear.biteBonus.toFixed(3), line: +__GAME.fishing.gear.lineStrength.toFixed(2), mods: __GAME.fishing.gear.buffMods})`);
  await klog('buff-expiry', `(() => {
    for (const b of __GAME.profile.buffs) b.until = Date.now() - 1;
    __GAME._buffTimer = 99;
    __GAME._updateBuffs(0.5);
    return JSON.stringify({buffs: __GAME.profile.buffs.length, gearLuck: +__GAME.fishing.gear.luck.toFixed(3), mods: __GAME.fishing.gear.buffMods});
  })()`);
  await klog('pantry-size', `JSON.stringify({pantry: (__GAME.profile.pantry||[]).length, buffs: (__GAME.profile.buffs||[]).length})`);
  step('kitchen', { kitFlow });

  // ---- v1.5-v1.9: release, aquarium, forecast/moon, photo, contest
  const lateFlow = [];
  const llog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    lateFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await llog('keep-catch', `JSON.stringify(__DEBUG.simFullCatch(false))`);
  await llog('release-catch', `JSON.stringify(__DEBUG.simFullCatch(true))`);
  await llog('forecast', `JSON.stringify({forecast: __GAME.world.weatherInfo.forecast, pressure: __GAME.world.weatherInfo.pressure, wind: __GAME.world.weatherInfo.windSpeed, wave: __GAME.world.weatherInfo.waveHeight, moon: __GAME.world.moonPhase})`);
  await llog('aquarium', `JSON.stringify({fish: __DEBUG.aquarium(), records: Object.keys(__GAME.profile.records||{}).length})`);
  await llog('photo-mode-on', `(() => { if (!__GAME.photo.active) __GAME.togglePhotoMode(); __GAME.setPhotoFilter('vivid'); return __GAME.photo.active; })()`);
  await sleep(1500);
  await llog('capture', `(() => { __GAME._pendingCapture = true; return 'queued'; })()`);
  await sleep(2500);
  await llog('photo-result', `JSON.stringify({photos: (__GAME.profile.photos||[]).length, last: (__GAME.profile.photos||[])[0] ? { len: __GAME.profile.photos[0].url.length, head: __GAME.profile.photos[0].url.slice(0,22), filter: __GAME.profile.photos[0].filter, spot: __GAME.profile.photos[0].spot } : null, capture: __GAME._lastCapture})`);
  await llog('photo-mode-off', `(() => { if (__GAME.photo.active) __GAME.togglePhotoMode(); __GAME.setPhotoFilter('none'); return __GAME.photo.active; })()`);
  await llog('contest-start', `(() => { __GAME.profile.coins = 5000; __DEBUG.teleport('lake_dock'); __GAME.fishing._endCast('reset'); const r = __GAME.contest.start(180); return JSON.stringify({ok: r.ok, error: r.error||null, spot: r.spot ? r.spot.name : null, entrants: __GAME.contest.entrants.length, coins: __GAME.profile.coins}); })()`);
  await llog('contest-run', `(() => {
    // run the full 3 minutes; the player lands 8 fish along the way
    let mine = 0;
    for (let i = 0; i < 180 * 60; i++) {
      __GAME.contest.update(1 / 60);
      if (i % 1320 === 0 && i > 0 && mine < 8) { __GAME.contest.addCatch({ fish: { rarity: 2 }, weight: 2.4 }); mine++; }
    }
    const r = __GAME.contest.results;
    return JSON.stringify({
      active: __GAME.contest.active,
      playerCatches: mine,
      rank: r ? r.rank : null,
      prize: r ? r.prize : null,
      pot: r ? r.pot : null,
      table: r ? r.table.map(e => e.name + ':' + Math.round(e.score)) : null,
      coins: __GAME.profile.coins,
      contests: __GAME.profile.stats.contests,
      wins: __GAME.profile.stats.contestWins,
    });
  })()`);
  await llog('panels-with-gallery', `(() => { const out=[]; for (const t of ['kitchen','gallery','quests']) { try { __GAME.panels.open(t); out.push(t+':'+__GAME.panels.body.children.length); } catch(e) { out.push(t+':ERR:'+e.message); } } __GAME.panels.close(); return JSON.stringify(out); })()`);
  step('late-features', { lateFlow });

  // ---- v2.0.0: drag / rod bend / shake / haptics feel channels
  const feelFlow = [];
  const flog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    feelFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await flog('heavy-fish-light-line', `(() => {
    __GAME.fishing._endCast('reset');
    __GAME.profile.rod = 'bamboo'; __GAME.profile.line = 'nylon_2'; __GAME.fishing._gear = null;
    return JSON.stringify(__DEBUG.debugFight('bluefin_tuna', 120, 900, 'auto'));
  })()`);
  await flog('small-fish-strong-line', `(() => {
    __GAME.fishing._endCast('reset');
    __GAME.profile.line = 'braid_20'; __GAME.fishing._gear = null;
    return JSON.stringify(__DEBUG.debugFight('crucian_carp', 0.6, 900, 'auto'));
  })()`);
  await flog('feel-snapshot', `JSON.stringify(__DEBUG.feel())`);
  await flog('haptics-api', `(() => { const h = __GAME.haptics; h.pulse('run', 1); h.setContinuous(true, 0.5, 0.5); h.update(0.016); const s1 = {...h.state}; h.setContinuous(false); h.update(0.2); return JSON.stringify({supported: h.supported, afterPulse: s1, afterStop: h.state}); })()`);
  step('feel-v200', { feelFlow });

  // ---- v2.1.0 / v2.2.0: surface fish during the fight, big-fish reveal
  const revealFlow = [];
  const rlog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    revealFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await rlog('force-land-big', `JSON.stringify(__DEBUG.forceLand('common_carp', 18))`);
  await sleep(900);
  await rlog('reveal-mid', `JSON.stringify(__DEBUG.reveal())`);
  await sleep(2600);
  await rlog('reveal-end', `JSON.stringify(__DEBUG.reveal())`);
  await rlog('commit-big', `JSON.stringify(__DEBUG.commitCatch(false))`);
  await rlog('force-land-small', `JSON.stringify(__DEBUG.forceLand('crucian_carp', 0.4))`);
  await sleep(400);
  await rlog('small-reveal', `JSON.stringify(__DEBUG.reveal())`);
  await rlog('commit-small', `JSON.stringify(__DEBUG.commitCatch(false))`);
  await rlog('surface-fish-in-fight', `(() => {
    const r = __DEBUG.debugFight('common_carp', 3.2, 300, 'auto');
    const mid = r.samples.find(s => s.t > 1) || r.samples[0] || null;
    return JSON.stringify({endReason: r.endReason, state: r.state, midSample: mid});
  })()`);
  step('reveal-v210', { revealFlow });

  // ---- v2.5.0 / v2.6.0: fight camera + adjustable drag, driven by the real loop
  const camFlow = [];
  const clog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    camFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await clog('hook-now', `JSON.stringify(__DEBUG.hookNow('common_carp', 6.5))`);
  await sleep(1400);
  await clog('probe-fighting', `JSON.stringify(__DEBUG.fightProbe())`);
  await clog('drag-down', `(() => { __GAME.input._pressed.add('KeyZ'); return 'sent'; })()`);
  await sleep(350);
  await clog('probe-after-z', `JSON.stringify(__DEBUG.fightProbe())`);
  await clog('drag-up-twice', `(() => { __GAME.input._pressed.add('KeyX'); return 'sent'; })()`);
  await sleep(250);
  await clog('probe-after-x', `JSON.stringify(__DEBUG.fightProbe())`);
  await clog('reset-cast', `JSON.stringify(__DEBUG.resetCast())`);
  await sleep(400);
  await clog('probe-idle-fov', `JSON.stringify(__DEBUG.fightProbe())`);
  step('camera-drag-v250', { camFlow });

  // ---- v2.7.0 / v2.8.0: size classes, personal bests, weather cues in the fight
  const wrFlow = [];
  const wlog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    wrFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await wlog('size-classes', `JSON.stringify(__DEBUG.sizes([0.2, 1.5, 6, 20, 60, 150]))`);
  await wlog('catch-record', `(() => {
    const sp = 'loach';
    if (!__GAME.profile.journal[sp]) __GAME.profile.journal[sp] = { count: 1, best: 0.01, first: Date.now() };
    const before = { best: __GAME.profile.journal[sp].best, pbs: __GAME.profile.stats.personalBests || 0 };
    __DEBUG.forceLand(sp, 2.5); const info = __DEBUG.commitCatch(false);
    const after = { best: __GAME.profile.journal[sp].best, pbs: __GAME.profile.stats.personalBests || 0 };
    const cls = __GAME.fightVisuals.reveal.cls ? __GAME.fightVisuals.reveal.cls.id : null;
    return JSON.stringify({ before, after, info, sizeClassOfCatch: cls, recordFlag: __GAME.fishing.lastCatch?.newRecord });
  })()`);
  await wlog('rain-instant', `(() => { __GAME.world.weather.set('rain', true); return {kind: __GAME.world.weather.kind, rain: +( __GAME.world.weather.rainIntensity||0).toFixed(2)}; })()`);
  await sleep(2500);
  await wlog('rain-fight-hook', `(() => { __GAME.world.weather.set('rain', true); __DEBUG.hookNow('common_carp', 5.0); return JSON.stringify({rain: +(__GAME.world.weather.rainIntensity||0).toFixed(2), state: __GAME.fishing.state}); })()`);
  await sleep(2200);
  await wlog('splash-count', `JSON.stringify({splashes: __GAME.fightVisuals.splashes.length, rain: +( __GAME.world.weather.rainIntensity||0).toFixed(2), state: __GAME.fishing.state, fishPos: [+__GAME.fightVisuals.fish.position.x.toFixed(2), +__GAME.fightVisuals.fish.position.z.toFixed(2)], wind: +(__GAME.world.weather.wind||0).toFixed(2)})`);
  await wlog('reset', `JSON.stringify(__DEBUG.resetCast())`);
  await wlog('weather-back', `(() => { __GAME.world.weather.set('clear', true); return __GAME.world.weather.kind; })()`);
  step('records-weather-v270', { wrFlow });

  // ---- v3.0.0–v3.2.0: sunrise/sunset phases, sea state economy, offshore charter
  const envFlow = [];
  const elog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    envFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await elog('phase-noon', `(() => { __DEBUG.setTime(12.0); return JSON.stringify(__DEBUG.env()); })()`);
  await elog('phase-sunrise', `(() => { __DEBUG.setTime(6.12); const s = __GAME.world.sky.sunDir; __GAME.player.yaw = Math.atan2(s.x, s.z); __GAME.player.pitch = 0.02; return JSON.stringify(__DEBUG.env()); })()`);
  await sleep(800);
  await elog('sunrise-glare', `JSON.stringify({dbg: __GAME._gradeDebug, css: document.getElementById('grade')?.style.opacity, glow: +(__GAME.world.sky.sunGlowMat?.opacity??0).toFixed(2), stars: +(__GAME.world.sky.starMat?.opacity??0).toFixed(2)})`);
  await elog('phase-sunset', `(() => { __DEBUG.setTime(17.85); const s = __GAME.world.sky.sunDir; __GAME.player.yaw = Math.atan2(s.x, s.z); __GAME.player.pitch = 0.02; __GAME.world.weather.set('clear', true); for (let i=0;i<180;i++) __GAME.world.weather.update(1/60, __GAME.engine.camera, __GAME.world.env); return JSON.stringify(__DEBUG.env()); })()`);
  await sleep(900);
  await elog('grade-live', `(() => JSON.stringify({grade: +( __GAME._gradeOpacity ?? 0).toFixed(3), glow: +( __GAME.world.sky.sunGlowMat?.opacity ?? 0).toFixed(3), dbg: __GAME._gradeDebug}))()`);
  await elog('phase-night', `(() => { __DEBUG.setTime(23.0); return JSON.stringify(__DEBUG.env()); })()`);
  await sleep(700);
  await elog('grade-night', `(() => JSON.stringify({grade: +( __GAME._gradeOpacity ?? 0).toFixed(3), stars: +( __GAME.world.sky.starMat?.opacity ?? 0).toFixed(2)}))()`);
  await elog('seastate-calm', `(() => { __DEBUG.setTime(12.0); __GAME.world.weather.set('clear', true); for (let i=0;i<180;i++) __GAME.world.weather.update(1/60, __GAME.engine.camera, __GAME.world.env); return JSON.stringify({sea: +__GAME.world.seaState.toFixed(2), label: __GAME.world.seaLabel.label, price: __GAME.world.priceMultiplier, wave: __GAME.world.weather.waveHeight}); })()`);
  await elog('seastate-storm', `(() => { __GAME.world.weather.set('storm', true); for (let i=0;i<180;i++) __GAME.world.weather.update(1/60, __GAME.engine.camera, __GAME.world.env); return JSON.stringify({sea: +__GAME.world.seaState.toFixed(2), label: __GAME.world.seaLabel.label, price: __GAME.world.priceMultiplier, wave: __GAME.world.weather.waveHeight, wind: __GAME.world.weather.wind}); })()`);
  await elog('offshore-charter', `(() => {
    __GAME.profile.level = 40; __GAME.profile.coins = 5000;
    if (__GAME.player.mounted) __DEBUG.home();
    const r = __DEBUG.charter();
    return JSON.stringify({r, mounted: !!__GAME.player.mounted, coins: __GAME.profile.coins, spot: __GAME._charterSpot ? __GAME._charterSpot.id : null});
  })()`);
  await sleep(500);
  await elog('offshore-pos', `(() => JSON.stringify({pos: [+__GAME.player.position.x.toFixed(0), +__GAME.player.position.z.toFixed(0)], boat: __GAME._charterBoat ? [+__GAME._charterBoat.position.x.toFixed(0), +__GAME._charterBoat.position.z.toFixed(0)] : null, depth: +__GAME.world.depthAt(__GAME.player.position.x, __GAME.player.position.z).toFixed(1)}))()`);
  await elog('offshore-catch-value', `(() => {
    __DEBUG.forceLandHere('red_snapper', 4.0);
    const info = __GAME.fishing.lastCatch;
    const out = info ? { value: info.value, seaFactor: info.seaFactor, seaBonus: info.seaBonus, offshore: info.offshore, sea: +(+info.seaState).toFixed(2), depth: +info.depth.toFixed(1) } : null;
    __DEBUG.commitCatch(true);
    return JSON.stringify(out);
  })()`);
  await elog('came-home', `(() => { const r = __DEBUG.home(); return JSON.stringify({r, mounted: !!__GAME.player.mounted, pos: [+__GAME.player.position.x.toFixed(0), +__GAME.player.position.z.toFixed(0)]}); })()`);
  await elog('weather-reset', `(() => { __GAME.world.weather.set('clear', true); __DEBUG.setTime(9.0); return __GAME.world.weather.kind; })()`);
  step('env-sea-v300', { envFlow });

  // ---- v3.3.0–v3.5.0: boat summon, offshore sailing, whales, shop system
  const seaFlow = [];
  const slog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    seaFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await slog('boat-summon', `(() => { __DEBUG.teleport('lake_dock'); const r = __GAME.summonBoat(); return JSON.stringify({r, mounted: !!__GAME.player.mounted, depth: __GAME.player.mounted ? +__GAME.world.depthAt(__GAME.player.mounted.position.x, __GAME.player.mounted.position.z).toFixed(1) : null}); })()`);
  await slog('boat-row', `JSON.stringify(__DEBUG.boat('row', 300, 1, 0))`);
  await slog('sea-waypoint', `(() => { __GAME._updateSeaWay(); const el = document.getElementById('seaWay'); return JSON.stringify({hidden: el.classList.contains('hidden'), text: el.textContent.replace(/\\s+/g,' ').trim(), wp: __GAME.seaWaypoint()?.name}); })()`);
  await slog('charter-and-sail', `(() => { __DEBUG.home(); __GAME.profile.level = 40; __GAME.profile.coins = 5000; const r = __DEBUG.charter(); const b = __GAME.player.mounted; const before = b ? {x:+b.position.x.toFixed(0), z:+b.position.z.toFixed(0)} : null; const row = __DEBUG.boat('row', 240, 1, 0); return JSON.stringify({r, before, row, depth: b ? +__GAME.world.depthAt(b.position.x, b.position.z).toFixed(1) : null}); })()`);
  await slog('whales-present', `(() => { const list = __GAME.world.whales.list.map(w => ({id:w.id, name:w.name, state:w.state})); return JSON.stringify({count: list.length, list, nearest: __GAME.world.whales.nearest(__GAME.player.position)}); })()`);
  await sleep(14000);
  await slog('whale-sighting', `JSON.stringify({sightings: __GAME.profile.stats.sightings || 0, records: __GAME.profile.sightings || null, diag: (window.__DIAG||{}).sightings || 0})`);
  await slog('marine-species', `(() => { const all = __GAME.fishList; const big = all.filter(f => f.maxWeight >= 300).length; const sharks = all.filter(f => /shark/.test(f.id) || /鲨/.test(f.name)).length; const whales = all.filter(f => /whale/.test(f.id)).length; return JSON.stringify({total: all.length, big, sharks, whales, names: all.filter(f => /shark|marlin|manta|ray/.test(f.id)).map(f => f.name + '/' + f.maxWeight + 'kg/r' + f.rarity)}); })()`);
  await slog('shark-roll', `(() => {
    __DEBUG.setTime(22.0);
    __GAME.profile.level = 45;
    const f = __GAME.fishing;
    const ctx = { region: 'ocean_deep', biome: 'ocean_deep', depth: 30, waters: ['ocean', 'deep'], biomes: ['ocean_deep'], spot: null };
    const counts = {};
    for (let i = 0; i < 400; i++) {
      const fish = f.rollFish(ctx);
      if (fish) counts[fish.name] = (counts[fish.name] || 0) + 1;
    }
    const marine = Object.entries(counts).filter(([n]) => /鲨|鲼|枪鱼|金枪鱼|剑鱼|旗鱼/.test(n)).map(([n, c]) => n + ':' + c);
    return JSON.stringify({distinct: Object.keys(counts).length, marine, top: Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0, 6)});
  })()`);
  await slog('shop-supplies', `(() => {
    __GAME.profile.coins = 5000; __GAME.profile.level = 30; __GAME.profile.items = {}; __GAME.profile.shop = null;
    __GAME.panels.open('shop'); __GAME.panels._shopTab = 'supply'; __GAME.panels.refresh();
    const cards = [...document.querySelectorAll('.panel-body .card .card-name')].map(e => e.textContent);
    const buy = [...document.querySelectorAll('.panel-body .card button')].find(b => b.textContent === '购买');
    const before = __GAME.profile.coins;
    if (buy) buy.click();
    const use = [...document.querySelectorAll('.panel-body .card button')].find(b => b.textContent === '使用' && !b.disabled);
    if (use) use.click();
    return JSON.stringify({cards, bought: before - __GAME.profile.coins, items: __GAME.profile.items, buffs: (__GAME.profile.buffs||[]).map(b => b.id), stock: __GAME.profile.shop?.stock});
  })()`);
  await slog('shop-market', `(() => {
    __GAME.profile.pantry = [{id:'bluefin_tuna',name:'蓝鳍金枪鱼',weight:120},{id:'great_white_shark',name:'大白鲨',weight:400}];
    __GAME.panels._shopTab = 'market'; __GAME.panels.refresh();
    const before = {coins: __GAME.profile.coins, pantry: __GAME.profile.pantry.length};
    const all = [...document.querySelectorAll('.panel-body button')].find(b => b.textContent === '全部卖出');
    if (all) all.click();
    const after = {coins: __GAME.profile.coins, pantry: __GAME.profile.pantry.length, sales: __GAME.profile.stats.marketSales};
    __GAME.panels.close();
    return JSON.stringify({before, after});
  })()`);
  await slog('weather-reset-2', `(() => { if (__GAME.player.mounted) __DEBUG.home(); __GAME.world.weather.set('clear', true); __DEBUG.setTime(9.0); return 1; })()`);
  step('sea-shop-v350', { seaFlow });

  // ---- v4.0.0–v4.3.0: survival rules
  const svFlow = [];
  const vlog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    svFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await vlog('meters', `JSON.stringify(__GAME.survival.snapshot())`);
  await vlog('starve', `(() => { const s = __GAME.profile.survival; s.hunger = 0; s.health = 0.6; s.warmth = 28; s.sanity = 0.9; return JSON.stringify({hp: s.health, status: __GAME.survival.statusList().map(x => x.label)}); })()`);
  await sleep(2500);
  await vlog('starve-drains', `JSON.stringify({hp: +__GAME.profile.survival.health.toFixed(3), hunger: +__GAME.profile.survival.hunger.toFixed(2)})`);
  await vlog('eat', `(() => { __GAME.profile.pantry = [{id:'crucian_carp',name:'鲫鱼',weight:0.4}]; const before = __GAME.profile.survival.hunger; const r = __GAME.eatFromNet(); return JSON.stringify({before: +before.toFixed(2), after: +__GAME.profile.survival.hunger.toFixed(2), gain: +r.gain.toFixed(2)}); })()`);
  await vlog('warm-by-fire', `(() => { const f = __GAME.world.props.campfire; __GAME.player.teleport(f.x + 2, f.z + 2); __GAME.profile.survival.warmth = 30; return 'at-fire'; })()`);
  await sleep(4000);
  await vlog('warmth-up', `JSON.stringify({warmth: +__GAME.profile.survival.warmth.toFixed(1)})`);
  await vlog('sanity-fx', `(() => { __GAME.profile.survival.sanity = 0.12; return 'low'; })()`);
  await sleep(800);
  await vlog('sanity-fx-state', `(() => { const fx = document.getElementById('sanityFx'); return JSON.stringify({on: fx.classList.contains('on'), dark: fx.style.getPropertyValue('--dark')}); })()`);
  await vlog('bite-penalty', `(() => { const f = __GAME.fishing; const ctx = {region:'lake',biome:'lake',depth:5,waters:['lake'],biomes:['lake'],spot:null}; __GAME.profile.survival.sanity = 0.08; const slow = f.rollWaitTime(ctx); __GAME.profile.survival.sanity = 1; const fast = f.rollWaitTime(ctx); return JSON.stringify({fast: +fast.toFixed(1), insane: +slow.toFixed(1)}); })()`);
  await vlog('season', `(() => { const sky = __GAME.world.sky; const labels = [0, 3, 6, 9].map(d => { sky._days = d; return sky.season.label; }); sky._days = 2; return JSON.stringify({labels, snowBias: +(__GAME.world.weather.snowBias ?? 0).toFixed(2)}); })()`);
  await vlog('death', `(() => { __GAME.profile.coins = 1000; const s = __GAME.profile.survival; s.health = 0.001; s.hunger = 0; s.warmth = 25; __GAME.survival.dead = false; return JSON.stringify({coins: 1000}); })()`);
  await sleep(1200);
  await vlog('after-death', `(() => { const dc = document.getElementById('deathcard'); return JSON.stringify({deaths: __GAME.profile.stats.deaths, coins: __GAME.profile.coins, hp: +__GAME.profile.survival.health.toFixed(2), card: dc.textContent.replace(/\\s+/g,' ').trim().slice(0, 40)}); })()`);
  await vlog('panel', `(() => { __GAME.panels.open('survival'); const t = document.querySelector('.panel-body')?.textContent || ''; const ok = t.includes('生存法则'); __GAME.panels.close(); return JSON.stringify({hasRules: ok, len: t.length}); })()`);
  // leave the world in a clean, healthy state for the screenshot pass
  await vlog('reset', `(() => { __GAME.hud._deathTimer = 0; document.getElementById('deathcard')?.classList.add('hidden'); const s = __GAME.profile.survival; s.health = 1; s.hunger = 0.9; s.sanity = 1; s.warmth = 36.6; __GAME.survival.dead = false; __GAME.world.sky._days = 2; return 1; })()`);
  step('survival-v430', { svFlow });

  // ---- v5.0.0–v5.1.0: fight styles, telegraphed events, counters, grades
  const fgFlow = [];
  const flog2 = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    fgFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await flog2('starter-line', `(() => { __GAME.profile.line = 'nylon_2'; __GAME.fishing._gear = null; const s = __GAME.survival.state; s.health = 1; s.hunger = 1; s.sanity = 1; s.warmth = 36.6; return JSON.stringify({strength: __GAME.fishing.gear.lineStrength}); })()`);
  await flog2('jumper', `JSON.stringify(__DEBUG.fightSim('rainbow_trout', 2.0, 90, true))`);
  await flog2('thrasher', `JSON.stringify(__DEBUG.fightSim('largemouth_bass', 3.2, 90, true))`);
  await flog2('braid-line', `(() => { __GAME.profile.line = 'braid_20'; __GAME.fishing._gear = null; return JSON.stringify({strength: __GAME.fishing.gear.lineStrength}); })()`);
  await flog2('bulldog', `JSON.stringify(__DEBUG.fightSim('tiger_shark', 300, 180, true))`);
  await flog2('runner', `JSON.stringify(__DEBUG.fightSim('bluefin_tuna', 60, 150, true))`);
  await flog2('no-counter', `JSON.stringify(__DEBUG.fightSim('largemouth_bass', 3.2, 90, false))`);
  await flog2('hud-banner', `(() => {
    __DEBUG.teleport('lake_dock');
    __DEBUG.hookNow('largemouth_bass', 3.0);
    __DEBUG.showEvent('shake', 9);
    return 'shown';
  })()`);
  await sleep(700);
  await flog2('banner-state', `(() => { const b = document.getElementById('fightEvent'); return JSON.stringify({hidden: b.classList.contains('hidden'), label: document.getElementById('feLabel').textContent, hint: document.getElementById('feHint').textContent, style: document.getElementById('fishStyle').textContent, stamina: document.getElementById('fishStamPct').textContent}); })()`);
  await flog2('fight-cleanup', `(() => { __GAME.fishing._endCast('reset'); __GAME.profile.line = 'nylon_2'; __GAME.fishing._gear = null; return 1; })()`);
  step('fight-v510', { fgFlow });

  // ---- v5.2.0: expanded marine roster (tuna family, sharks, rays, cetaceans)
  const spFlow = [];
  const splog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    spFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await splog('roster', `(() => { const a = __GAME.fishList; const byR = {}; for (const f of a) byR[f.rarity] = (byR[f.rarity] || 0) + 1; return JSON.stringify({total: a.length, byR, sharks: a.filter(f => /shark/.test(f.id)).length, tuna: a.filter(f => /tuna|marlin|sailfish|swordfish/.test(f.id)).length}); })()`);
  await splog('new-species', `(() => { const ids = ['skipjack_tuna','albacore','yellowfin_tuna','bigeye_tuna','mako_shark','blue_shark','thresher_shark','whitetip_reef_shark','eagle_ray','electric_ray']; return JSON.stringify(ids.map(id => { const f = __GAME.fishList.find(x => x.id === id); return f ? f.name + '/' + f.maxWeight + 'kg' : id + ':MISSING'; })); })()`);
  await splog('new-styles', `(() => { const out = {}; for (const id of ['yellowfin_tuna','mako_shark','thresher_shark','eagle_ray','electric_ray','whitetip_reef_shark']) { const f = __GAME.fishList.find(x => x.id === id); if (!f) continue; const r = __DEBUG.fightSim(id, Math.min(f.maxWeight * 0.3, 200), 3, true); out[id] = r.style ? r.style.name : '?'; } return JSON.stringify(out); })()`);
  await splog('cetaceans', `(() => { const w = __GAME.world.whales; const byId = {}; for (const x of w.list) byId[x.id] = (byId[x.id] || 0) + 1; return JSON.stringify({instances: w.list.length, types: Object.keys(byId).length, byId, names: [...new Set(w.list.map(x => x.name))]}); })()`);
  await splog('dolphin-sighting', `(() => { __DEBUG.teleport('lake_dock'); const w = __GAME.world.whales.list.find(x => x.id === 'dolphin' && x.primary); if (!w) return 'no-dolphin'; const p = __GAME.player.position; w.freezeAt(p.x + 35, p.z + 35, -1.0); w.sighted = false; return JSON.stringify({frozen: true}); })()`);
  await sleep(2200);
  await splog('sighting-count', `JSON.stringify({sightings: __GAME.profile.stats.sightings || 0, records: __GAME.profile.sightings || null})`);
  await splog('whale-hud', `(() => { __GAME.profile.level = 40; __GAME.profile.coins = 5000; if (__GAME.player.mounted) __DEBUG.home(); const r = __DEBUG.charter(); const w = __DEBUG.whale('sperm_whale'); return JSON.stringify({charter: r.ok, whale: w}); })()`);
  await sleep(1500);
  await splog('cleanup-whales', `(() => { __DEBUG.home(); return 1; })()`);
  step('species-v520', { spFlow });

  // ---- v6.0.0: RSI (dream-evaluated, Pareto-front, gated rival evolution)
  const rsiFlow = [];
  const rsilog = async (label, expr) => {
    const r = await cdp.evaluate(expr);
    rsiFlow.push({ label, ok: r.ok, value: r.value, error: r.error });
  };
  await rsilog('init', `(() => { const s = __DEBUG.rsi(); return JSON.stringify({ready: s.ready, gen: s.gen, replay: s.replay, front: s.front.length, pace: s.pace}); })()`);
  await rsilog('evolve', `(() => { const o = __DEBUG.rsiStep(14); return JSON.stringify({gen: o.gen, accepted: o.accepted, rejected: o.rejected, before: o.before, after: o.after, day: o.day}); })()`);
  await rsilog('front', `(() => { const s = __DEBUG.rsi(); return JSON.stringify({gen: s.gen, replay: s.replay, frontSize: s.front.length, front: s.front, ideal: s.ideal, gap: Math.max(0, s.ideal.value - Math.max(...s.front.map(p => p.value)))}); })()`);
  await rsilog('panel', `(() => { __GAME.panels.open('rsi'); return JSON.stringify({cells: document.querySelectorAll('.rsi-cell').length, dots: document.querySelectorAll('.rsi-front i').length, rows: document.querySelectorAll('.rsi-row').length, title: (document.querySelector('.panel-win')?.innerText || '').includes('递归自我改进')}); })()`);
  await sleep(500);
  await rsilog('contest-rival', `(() => { __GAME.panels.close(); if (__GAME.fishing.state !== 'idle') __GAME.fishing._endCast('reset'); __GAME.profile.level = 25; __GAME.profile.coins = 3000; __DEBUG.teleport('lake_dock'); const r = __GAME.contest.start(); const rival = __GAME.contest.entrants.find(e => e.rival); return JSON.stringify({ok: r.ok, error: r.error || null, entrants: __GAME.contest.entrants.length, rival: rival ? {name: rival.name, pace: rival.pace} : null}); })()`);
  await sleep(400);
  await rsilog('contest-cleanup', `(() => { __GAME.contest.finish && __GAME.contest.finish(); return 1; })()`);
  step('rsi-v600', { rsiFlow });

  // ---- systems sanity
  const systems = await cdp.evaluate(`JSON.stringify({    spots: __GAME.world.spots.length,
    discovered: __GAME.world.spots.filter(s => s.discovered).length,
    vegetation: __GAME.world.vegetation.stats,
    props: __GAME.world.props.stats,
    buildMs: __DIAG.buildMs,
    terrainStats: __GAME.world.terrain.stats,
    fishCount: __DATA.FISH.length,
    deckCount: __GAME.world.props.docks.length
  })`);
  step('world-systems', JSON.parse(systems.value || '{}'));

  // every spot: is it in the right water body, and can the angler stand there?
  const spotsReport = await cdp.evaluate(`JSON.stringify(__GAME.world.spots.map(s => ({
    id: s.id, name: s.name, region: s.region, biome: s.biome, depth: s.depth,
    waterOnly: !!s.waterOnly, distToWater: s.distToWater,
    standH: +__GAME.world.heightAt(s.x, s.z).toFixed(2),
    standSlope: +__GAME.world.slopeAt(s.x, s.z).toFixed(2),
    standDry: __GAME.world.heightAt(s.x, s.z) > 0.1,
    anchorIsWater: __GAME.world.isWater(s.anchorX, s.anchorZ),
    anchorDepth: +__GAME.world.depthAt(s.anchorX, s.anchorZ).toFixed(2),
    expectedWaters: s.waters, expectedBiomes: s.biomes,
    x: Math.round(s.x), z: Math.round(s.z), ax: Math.round(s.anchorX), az: Math.round(s.anchorZ)
  })))`);
  const spotsParsed = JSON.parse(spotsReport.value || '[]');
  const spanOf = (s) => {
    const r = s.region;
    if (r === 'ocean_deep') return 'deep';
    if (r === 'ocean_shallow' || r === 'coast') return 'shallow';
    return r;
  };
  step('spots-report', {
    count: spotsParsed.length,
    waterProblems: spotsParsed.filter((s) => !s.anchorIsWater || s.anchorDepth < 0.5).map((s) => `${s.id}:${s.anchorDepth}`),
    standProblems: spotsParsed.filter((s) => !s.waterOnly && !s.standDry).map((s) => s.id),
    waterOnly: spotsParsed.filter((s) => s.waterOnly).map((s) => s.id),
    table: spotsParsed.map((s) => `${s.id} ${s.region}/${s.depth}m${s.waterOnly ? ' [swim]' : ''} slope ${s.standSlope}`),
  });

  // species distribution in several different waters
  const rollAll = await cdp.evaluate(`(() => {
    __GAME.profile.level = 50;
    const f = __GAME.fishing;
    const out = {};
    for (const id of ['lake_dock','lake_center','river_bend','pond_frog','swamp_edge','reef','ocean_deep','estuary','coast_beach']) {
      const s = __GAME.world.getSpot(id);
      if (!s) continue;
      const ctx = f.buildContext(s.anchorX, s.anchorZ);
      const tiers = {1:0,2:0,3:0,4:0,5:0};
      let junk = 0;
      const names = {};
      for (let i = 0; i < 600; i++) {
        const fish = f.rollFish(ctx);
        tiers[fish.rarity]++;
        if (fish.junk) junk++;
        names[fish.name] = (names[fish.name]||0)+1;
      }
      out[id] = {
        region: ctx.region, depth: +ctx.depth.toFixed(1),
        ctxBiomes: ctx.biomes, ctxWaters: ctx.waters, ctxBiome: ctx.biome,
        loot: __GAME.fishing.rollFish(ctx, (window.__diagTmp = {})) && JSON.stringify({ groups: window.__diagTmp.groups, widened: window.__diagTmp.widened, pool: (window.__diagTmp.pool || []).length, rej: window.__diagTmp.rejected, bR: window.__diagTmp.byRarity }),
        junkPct: +(junk/600*100).toFixed(1),
        tiers, distinct: Object.keys(names).length,
        top: Object.entries(names).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,c]) => n+':'+c)
      };
    }
    return JSON.stringify(out);
  })()`);
  step('fish-distribution', JSON.parse(rollAll.value || '{}'));

  // ---- UI: panels render without throwing
  if (!fast) {
    const panels = await cdp.evaluate(`(() => {
      const out = [];
      for (const tab of ['journal','gear','shop','quests','map','settings']) {
        try { __GAME.panels.open(tab); out.push(tab + ':ok:' + __GAME.panels.body.children.length); }
        catch (e) { out.push(tab + ':ERR:' + e.message); }
      }
      __GAME.panels.close();
      return JSON.stringify(out);
    })()`);
    step('panels', JSON.parse(panels.value || '[]'));
  }

  // ---- screenshots
  if (shots) {
    const shot = async (name) => {
      const r = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      if (r.result?.data) {
        const p = join(outDir, `${name}.png`);
        writeFileSync(p, Buffer.from(r.result.data, 'base64'));
        report.shots.push(p);
        console.log(`· shot ${p}`);
      }
    };
    await cdp.evaluate(`(() => { __GAME.player.setViewMode('third'); __DEBUG.teleport('lake_dock'); return 1; })()`);
    await sleep(2500);
    await shot('01-lake-third-person');

    await cdp.evaluate(`__GAME.player.setViewMode('first')`);
    await sleep(1800);
    await shot('02-lake-first-person');

    await cdp.evaluate(`(() => { __DEBUG.setTime(17.85); const s=__GAME.world.sky.sunDir; __GAME.player.yaw=Math.atan2(s.x,s.z); __GAME.player.pitch=0.0; return 1; })()`);
    await sleep(2600);
    await shot('03-sunset');

    // v3.0.0: golden hour glare framed at the sun, then the same spot at sunrise
    await cdp.evaluate(`(() => { __DEBUG.setTime(17.8); __GAME.profile.settings.viewMode='first'; __GAME.player.setViewMode('first'); const s=__GAME.world.sky.sunDir; __GAME.player.yaw=Math.atan2(s.x,s.z); __GAME.player.pitch=0.02; return 1; })()`);
    await sleep(2400);
    await shot('03b-sunset-glare');
    await cdp.evaluate(`(() => { __DEBUG.setTime(6.14); __DEBUG.setWeather('clear'); __DEBUG.teleport('coast_beach'); const s=__GAME.world.sky.sunDir; __GAME.player.yaw=Math.atan2(s.x,s.z); __GAME.player.pitch=0.03; return 1; })()`);
    await sleep(2400);
    await shot('03c-sunrise');

    // v3.3.0–v3.4.0: offshore, alongside a surfacing whale
    await cdp.evaluate(`(() => { if (__GAME.player.mounted) __DEBUG.home(); __DEBUG.setWeather('clear'); __DEBUG.setTime(9.5); __GAME.profile.level = 40; __GAME.profile.coins = 5000; __DEBUG.charter(); return 1; })()`);
    await sleep(1400);
    await cdp.evaluate(`(() => { const r = __DEBUG.whale('orca'); const b = __GAME.player.mounted; if (b) { const w = __GAME.world.whales.list.find(x=>x.id==='orca'); __GAME.player.yaw = Math.atan2(w.group.position.x - b.position.x, w.group.position.z - b.position.z); __GAME.player.pitch = -0.02; } return JSON.stringify(r); })()`);
    await sleep(2200);
    await shot('03d-whale');
    await cdp.evaluate(`(() => { __DEBUG.home(); return 1; })()`);
    await cdp.evaluate(`(() => { __GAME.player.setViewMode('third'); return 1; })()`);

    await cdp.evaluate(`(() => { __DEBUG.setWeather('rain'); __DEBUG.setTime(11.0); return 1; })()`);
    await sleep(3000);
    await shot('04-rain-day');

    await cdp.evaluate(`(() => { __DEBUG.setWeather('clear'); __DEBUG.setTime(21.8); __DEBUG.teleport('river_bend'); return 1; })()`);
    await sleep(3000);
    await shot('05-night-river');

    await cdp.evaluate(`(() => { __DEBUG.setWeather('fog'); __DEBUG.setTime(7.4); __DEBUG.teleport('swamp_edge'); return 1; })()`);
    await sleep(3000);
    await shot('06-fog-swamp');

    await cdp.evaluate(`(() => { __DEBUG.setWeather('clear'); __DEBUG.setTime(10); __DEBUG.teleport('ocean_deep'); return 1; })()`);
    await sleep(3000);
    await shot('07-open-sea');

    await cdp.evaluate(`(() => { __GAME.profile.level = 30; __GAME.panels.open('map'); return 1; })()`);
    await sleep(1200);
    await shot('08-map-panel');

    await cdp.evaluate(`(() => { __GAME.panels.open('shop'); return 1; })()`);
    await sleep(800);
    await shot('09-shop-panel');

    await cdp.evaluate(`(() => { __GAME.panels.open('journal'); return 1; })()`);
    await sleep(800);
    await shot('10-journal-panel');
    await cdp.evaluate(`__GAME.panels.close()`);

    // ---- isolation shots for the water/cloud investigation
    await cdp.evaluate(`(() => { __DEBUG.setWeather('clear'); __DEBUG.setTime(12); __DEBUG.teleport('lake_dock'); __DEBUG.look(250, -4); __GAME.player.setViewMode('third'); return 1; })()`);
    await sleep(3500);
    await shot('11-noon-lake-normal');
    await cdp.evaluate(`__GAME.world.water.group.visible = false`);
    await sleep(1800);
    await shot('12-water-hidden');
    await cdp.evaluate(`__GAME.world.water.group.visible = true; __GAME.world.sky.clouds.visible = false`);
    await sleep(1800);
    await shot('13-clouds-hidden');
    await cdp.evaluate(`__GAME.world.sky.clouds.visible = true`);
    await sleep(600);
    const wd = await cdp.evaluate(`JSON.stringify(__DEBUG.waterDebug())`);
    step('water-debug', JSON.parse(wd.value || '{}'));

    // ---- composition shots from a known vantage point
    await cdp.evaluate(`(() => { __DEBUG.teleport('lake_weeds'); __DEBUG.look(120, -2); __GAME.player.setViewMode('third'); return 1; })()`);
    await sleep(3000);
    await shot('14-lake-weeds-third');

    await cdp.evaluate(`(() => { __DEBUG.setTime(6.6); __DEBUG.setWeather('clear'); __DEBUG.teleport('coast_beach'); __DEBUG.look(200, -1); return 1; })()`);
    await sleep(3200);
    await shot('15-coast-sunrise');

    await cdp.evaluate(`(() => { __DEBUG.setTime(13); __DEBUG.setWeather('clear'); __DEBUG.teleport('river_bend'); __DEBUG.look(300, -6); return 1; })()`);
    await sleep(3000);
    await shot('16-river-day');

    await cdp.evaluate(`(() => { __DEBUG.setWeather('storm'); __DEBUG.setTime(16); return 1; })()`);
    await sleep(3000);
    await shot('17-storm');
  }

  // ---- final diag
  await sleep(1500);
  const finalDiag = await cdp.evaluate('JSON.stringify(window.__DIAG)');
  report.diag = JSON.parse(finalDiag.value || '{}');
  report.errors = cdp.consoleErrors.slice(0, 40);
  report.exceptions = cdp.exceptions.slice(0, 40);
  report.logs = cdp.logs.slice(-25);
  report.pageErrors = report.diag.errors || [];

  writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log('\n===== SUMMARY =====');
  console.log(
    JSON.stringify(
      {
        booted: true,
        fps: report.diag.fps,
        frameMs: report.diag.frameMs,
        frames: report.diag.frames,
        calls: report.diag.calls,
        triangles: report.diag.triangles,
        geometries: report.diag.geometries,
        textures: report.diag.textures,
        jsHeapMB: report.diag.jsHeapMB,
        heapLimitMB: report.diag.heapLimitMB,
        buildMs: report.diag.buildMs,
        catches: report.diag.catches,
        casts: report.diag.casts,
        pageErrorCount: report.pageErrors.length,
        consoleErrorCount: report.errors.length,
        exceptionCount: report.exceptions.length,
        consoleErrors: report.errors.slice(0, 8),
        exceptions: report.exceptions.slice(0, 8),
        pageErrors: report.pageErrors.slice(0, 8),
      },
      null,
      2
    )
  );
  ws.close();
}

main().catch((e) => {
  console.error('verify failed:', e);
  process.exit(1);
});
