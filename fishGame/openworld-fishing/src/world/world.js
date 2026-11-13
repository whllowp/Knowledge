/**
 * world.js — assembles the island and exposes one coherent API to the rest of
 * the game: ground/water queries, biomes, fishing spots, day-night and weather.
 *
 * `build()` is staged and yields to the browser between stages so the loading
 * screen can paint its progress bar.
 */
import * as THREE from 'three';
import { Terrain, WATER_LEVEL, WORLD, BIOME_COLORS_CSS, BIOME_LABELS, FEATURES } from './terrain.js';
import { Water } from './water.js';
import { Sky } from './sky.js';
import { Weather } from './weather.js';
import { Vegetation } from './vegetation.js';
import { Props } from './props.js';
import { FishLife, Birds, Fireflies } from '../entities/wildlife.js';
import { Whales } from '../entities/megafauna.js';
import { resolveSpots, spotById } from '../data/spots.js';
import { clamp, clamp01, dist2 } from '../core/util.js';
import { mergeStaticMeshes, mergeEnabled } from '../core/merge.js';
import { optOn } from '../core/flags.js';

const nextFrame = () =>
  new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 0);
  });

export class World {
  constructor(engine, opts = {}) {
    this.engine = engine;
    this.quality = engine.quality;
    this.seed = opts.seed ?? 20240607;
    this.terrain = new Terrain(this.seed);
    this.spots = [];
    this.built = false;
    this._spotLookup = new Map();
    this._disposables = [];
  }

  /**
   * @param {(p:number, label:string)=>void} onProgress
   */
  async build(onProgress = () => {}) {
    const report = (p, label) => onProgress(clamp01(p), label);

    report(0.02, '正在生成岛屿地形…');
    await nextFrame();
    this.terrain.build();
    report(0.3, '正在烘焙水面高度图…');
    await nextFrame();
    this.terrain.buildHeightTexture(512);
    report(0.4, '正在铺设地表…');
    await nextFrame();

    // ---- water must exist before the terrain material is created (shader needs the height map)
    this.water = new Water(this.terrain, this.quality);
    this.engine.worldGroup.add(this.water.group);

    const terrainMesh = this.terrain.buildMesh(this.quality);
    this.engine.worldGroup.add(terrainMesh);

    report(0.5, '正在升起天空…');
    await nextFrame();
    this.sky = new Sky(this.engine.scene, this.quality, { time: 6.5, dayLengthMin: 24 });
    this.weather = new Weather(this.engine.scene, this.quality, { kind: 'clear' });
    this.weather.applyPixelRatio(this.engine.effectivePixelRatio);

    report(0.58, '正在布置钓点…');
    await nextFrame();
    this.spots = resolveSpots(this.terrain);
    for (const s of this.spots) this._spotLookup.set(s.id, s);

    report(0.66, '正在建造小屋与码头…');
    await nextFrame();
    this.props = new Props(this.terrain, this.quality);
    this.props.build(this.spots);
    this.engine.worldGroup.add(this.props.group);

    report(0.78, '正在种下森林…');
    await nextFrame();
    this.vegetation = new Vegetation(this.terrain, this.quality, {
      seed: this.seed + 31,
      clearings: [
        ...this.spots.map((s) => ({ x: s.x, z: s.z, r: Math.max(6, s.radius * 0.35) })),
        { x: FEATURES.cabin.x, z: FEATURES.cabin.z, r: 21 },
        { x: FEATURES.spawn.x, z: FEATURES.spawn.z, r: 12 },
      ],
      density: 1,
    });
    this.vegetation.build();
    this.engine.worldGroup.add(this.vegetation.group);

    // Static subtrees never move, so freeze their matrices: three then skips
    // recomputing them (and their children) every frame.
    if (optOn())
      for (const g of [this.terrain.group, this.props.group, this.vegetation.group]) {
        if (!g) continue;
        g.traverse((o) => {
          if (o === g) return;
          o.matrixAutoUpdate = false;
          o.updateMatrix();
        });
      }

    // Collapse material-sharing props into fewer draw calls, bucketed by
    // spatial cell so frustum culling still works (v6.1.0).
    this.mergedCalls = mergeEnabled()
      ? mergeStaticMeshes(this.props.group, { minCount: 3, cellSize: 260 })
      : 0;

    report(0.9, '正在放生鱼群…');
    await nextFrame();
    this.fishLife = new FishLife(this, this.quality);
    this.birds = new Birds(this, this.quality);
    this.fireflies = new Fireflies(this, this.quality);
    this.whales = new Whales(this, this.quality);
    this.engine.worldGroup.add(this.fishLife.group, this.birds.group, this.fireflies.group);

    report(0.96, '正在调整光线…');
    await nextFrame();
    this.built = true;
    report(1, '准备就绪');
    return this;
  }

  // ------------------------------------------------------------------ queries

  heightAt(x, z) {
    return this.terrain.heightAt(x, z);
  }

  /**
   * Height the player should stand on: terrain, or a dock deck when standing
   * over one and above the water.
   */
  groundHeightAt(x, z, playerY = Infinity) {
    const h = this.terrain.heightAt(x, z);
    if (this.props) {
      const dock = this.props.dockHeightAt(x, z);
      if (dock !== null) {
        if (playerY >= dock - 1.2) return dock;
        return Math.max(h, dock);
      }
    }
    return h;
  }

  onDock(x, z, playerY = Infinity) {
    if (!this.props) return false;
    const dock = this.props.dockHeightAt(x, z);
    return dock !== null && playerY >= dock - 1.2;
  }

  dockHeightAt(x, z) {
    return this.props ? this.props.dockHeightAt(x, z) : null;
  }

  surfaceHeight(x, z) {
    return this.water ? this.water.surfaceHeight(x, z) : WATER_LEVEL;
  }

  depthAt(x, z) {
    return this.terrain.depthAt(x, z);
  }

  isWater(x, z) {
    return this.terrain.isWater(x, z);
  }

  biomeAt(x, z) {
    return this.terrain.biomeAt(x, z);
  }

  regionAt(x, z) {
    return this.terrain.regionAt(x, z);
  }

  biomeLabel(idOrPoint, z) {
    const id = typeof idOrPoint === 'string' ? idOrPoint : this.terrain.biomeAt(idOrPoint, z);
    return BIOME_LABELS[id] || id;
  }

  slopeAt(x, z) {
    return this.terrain.slopeAt(x, z);
  }

  normalAt(x, z, out) {
    return this.terrain.normalAt(x, z, out);
  }

  /** Nearest fishing spot within `maxDist` metres. */
  nearestSpot(x, z, maxDist = Infinity) {
    let best = null;
    let bestD = maxDist;
    for (const s of this.spots) {
      const d = dist2(x, z, s.x, s.z);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  /** The spot whose fishing radius the player is standing in. */
  activeSpot(x, z, level = 99) {
    let best = null;
    let bestD = Infinity;
    for (const s of this.spots) {
      const d = dist2(x, z, s.x, s.z);
      const reach = s.radius;
      if (d <= reach && d < bestD && s.minLevel <= level) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  getSpot(id) {
    return this._spotLookup.get(id) || null;
  }

  /** Mark a spot as discovered for the map/journal. */
  discover(id) {
    const s = this._spotLookup.get(id);
    if (s && !s.discovered) {
      s.discovered = true;
      return true;
    }
    return false;
  }

  get discoveredCount() {
    return this.spots.reduce((n, s) => n + (s.discovered ? 1 : 0), 0);
  }

  get weatherInfo() {
    return {
      kind: this.weather.kind,
      label: this.weather.label,
      icon: this.weather.icon,
      cloudCover: this.weather.cloudCover,
      wind: this.weather.wind,
      windSpeed: this.weather.windSpeed,
      waveHeight: this.weather.waveHeight,
      pressure: this.weather.pressure,
      rain: this.weather.rainIntensity,
      snow: this.weather.snowIntensity,
      bite: this.weather.biteModifier,
      rarity: this.weather.rarityModifier,
      temperature: this.sky.env.temperature,
      forecast: this._forecast,
      moonPhase: this.moonPhase,
      phase: this.sky.env.phase,
      golden: this.sky.env.golden,
      seaState: this.seaState,
      seaLabel: this.seaLabel,
      priceMultiplier: this.priceMultiplier,
    };
  }

  /**
   * Sea state 0..1 (v3.1.0): glassy calm → storm surf. Wind and waves drive it,
   * and it is what the "rough weather pays more" economy is keyed on.
   */
  get seaState() {
    const w = this.weather;
    const wave = w.waveHeight;
    const wind = w.wind;
    const rain = w.rainIntensity;
    return clamp01(((wave - 0.35) / 1.55) * 0.62 + wind * 0.28 + rain * 0.1);
  }

  /** Human label for the sea state. */
  get seaLabel() {
    const s = this.seaState;
    if (s < 0.14) return { label: '平静', icon: '🌊', tier: 0 };
    if (s < 0.32) return { label: '微浪', icon: '🌊', tier: 1 };
    if (s < 0.52) return { label: '中浪', icon: '🌊', tier: 2 };
    if (s < 0.72) return { label: '大浪', icon: '🌊', tier: 3 };
    if (s < 0.88) return { label: '狂浪', icon: '🌀', tier: 4 };
    return { label: '风暴海况', icon: '🌪️', tier: 5 };
  }

  /** Today's price multiplier: the rougher the sea, the better the market. */
  get priceMultiplier() {
    return Math.round((1 + this.seaState * 0.85) * 100) / 100;
  }

  /** Lunar cycle: 8 in-game days, affects night fishing. */
  get moonPhase() {
    const day = Math.floor(this.sky.dayCount);
    const phases = ['🌑 新月', '🌒 娥眉月', '🌓 上弦月', '🌔 盈凸月', '🌕 满月', '🌖 亏凸月', '🌗 下弦月', '🌘 残月'];
    return { index: day % 8, label: phases[day % 8] };
  }

  get timeOfDay() {
    return this.sky.time;
  }

  setTimeOfDay(h) {
    this.sky.setTime(h);
    this.sky.update(0.001, this.engine.camera, { playerPos: this.engine.camera.position, weather: this.weather });
  }

  // ------------------------------------------------------------------ runtime

  update(dt, camera, playerPos) {
    if (!this.built) return;
    this.sky.advance(dt);
    const ctx = { playerPos: playerPos || camera.position, weather: this.weather };
    const env = this.sky.update(dt, camera, ctx);
    this.weather.update(dt, camera, env);

    // lightning flash brightens the whole scene for a moment
    const flash = this.weather.flashBoost;
    if (flash > 0.001) {
      this.sky.hemi.intensity += flash * 1.6;
      this.sky.ambient.intensity += flash * 1.2;
      this.sky.fog.color.lerp(new THREE.Color(0xdfe9ff), flash * 0.6);
    }

    // weather + player position feed the water
    const underwater = camera.position.y < WATER_LEVEL;
    const region = this.terrain.regionAt(camera.position.x, camera.position.z);
    const murk = underwater ? (region === 'swamp' ? 0.85 : region === 'river' ? 0.5 : 0.32) : 0.22;
    this.water.setEnvironment({
      ...env,
      turbidity: clamp01(murk + env.rain * 0.2),
    });
    this.water.update(dt, camera);

    // seasons bias the weather (v4.2.0)
    this.weather.snowBias = this.sky.season?.snow ?? 0;

    this.vegetation.update(dt, camera);
    this.props.update(dt, camera, this.water, env);
    // refresh the forecast occasionally (it is randomised, so not per frame)
    this._forecastTimer = (this._forecastTimer || 0) + dt;
    if (!this._forecast || this._forecastTimer > 45) {
      this._forecastTimer = 0;
      this._forecast = this.weather.forecastSteps(3);
    }
    if (this.wildlifeEnabled !== false) {
      this.fishLife?.update(dt, camera, playerPos, env);
      this.birds?.update(dt, camera, env);
      this.fireflies?.update(dt, camera, env, playerPos);
      this.whales?.update(dt, camera, playerPos, env);
    }

    this.env = env;
    return env;
  }

  setQuality(quality) {
    this.quality = quality;
    this.water?.setQuality(quality);
    this.sky?.setQuality(quality);
    this.weather?.setQuality(quality);
    this.fishLife?.setQuality(quality);
    if (this.props) {
      // props lights/shadows adapt automatically; nothing to rebuild
    }
  }

  /** Turn visible fish/birds on or off (settings + low-end machines). */
  setWildlife(on) {
    this.wildlifeEnabled = !!on;
    if (this.fishLife) this.fishLife.group.visible = !!on;
    if (this.birds) this.birds.group.visible = !!on;
  }

  /** Rebuild vegetation at a new density (called from the settings panel). */
  setTreeDensity(scale) {
    if (!this.vegetation) return;
    this.vegetation.clear();
    this.vegetation.density = clamp(scale, 0.2, 1.6);
    this.vegetation.build();
  }

  dispose() {
    this.water?.dispose();
    this.sky?.dispose();
    this.weather?.dispose();
    this.vegetation?.dispose();
    this.props?.dispose();
    this.fishLife?.dispose();
    this.birds?.dispose();
    this.fireflies?.dispose();
    this.whales?.dispose();
    this.terrain.dispose();
    for (const d of this._disposables) d.dispose?.();
    this._disposables.length = 0;
    this.built = false;
  }
}

export { WORLD, WATER_LEVEL, BIOME_COLORS_CSS, BIOME_LABELS, FEATURES, spotById };
