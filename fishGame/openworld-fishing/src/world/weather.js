/**
 * weather.js — weather state machine plus rain/snow particle systems and
 * lightning flashes. Also publishes the fishing modifiers that make weather
 * matter: some species only bite in the rain, others in fog or snow.
 */
import * as THREE from 'three';
import { Emitter, clamp, clamp01, lerp, rand, randInt, pick, chance, smoothstep } from '../core/util.js';
export const WEATHER_NAMES = ['clear', 'cloudy', 'rain', 'storm', 'fog', 'snow'];

export const WEATHER_DEFS = {
  clear: {
    label: '晴朗',
    icon: '☀️',
    cloudCover: 0.12,
    wind: 0.22,
    rain: 0,
    snow: 0,
    lightning: 0,
    bite: 1.0,
    rarity: 1.0,
    ambient: 'lake',
    next: { clear: 0.4, cloudy: 0.45, fog: 0.08, rain: 0.07, storm: 0.0, snow: 0.0 },
  },
  cloudy: {
    label: '多云',
    icon: '⛅',
    cloudCover: 0.5,
    wind: 0.38,
    rain: 0,
    snow: 0,
    lightning: 0,
    bite: 1.12,
    rarity: 1.03,
    ambient: 'lake',
    next: { clear: 0.3, cloudy: 0.32, rain: 0.26, fog: 0.06, storm: 0.04, snow: 0.02 },
  },
  rain: {
    label: '小雨',
    icon: '🌧️',
    cloudCover: 0.82,
    wind: 0.5,
    rain: 0.62,
    snow: 0,
    lightning: 0.05,
    bite: 1.24,
    rarity: 1.09,
    ambient: 'rain',
    next: { cloudy: 0.34, rain: 0.36, storm: 0.16, clear: 0.06, fog: 0.06, snow: 0.02 },
  },
  storm: {
    label: '暴风雨',
    icon: '⛈️',
    cloudCover: 0.98,
    wind: 0.9,
    rain: 1,
    snow: 0,
    lightning: 1,
    bite: 0.74,
    rarity: 1.22,
    ambient: 'storm',
    next: { rain: 0.54, storm: 0.24, cloudy: 0.22 },
  },
  fog: {
    label: '浓雾',
    icon: '🌫️',
    cloudCover: 0.62,
    wind: 0.12,
    rain: 0,
    snow: 0,
    lightning: 0,
    bite: 0.95,
    rarity: 1.06,
    ambient: 'shore',
    next: { fog: 0.42, cloudy: 0.3, clear: 0.22, rain: 0.06 },
  },
  snow: {
    label: '降雪',
    icon: '🌨️',
    cloudCover: 0.78,
    wind: 0.44,
    rain: 0,
    snow: 0.7,
    lightning: 0.03,
    bite: 0.84,
    rarity: 1.14,
    ambient: 'shore',
    next: { snow: 0.4, cloudy: 0.34, clear: 0.16, fog: 0.1 },
  },
};

const PRECIP_VERT = /* glsl */ `
uniform float uSize;
uniform float uPixelRatio;
attribute float aScale;
varying float vFade;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float d = max(0.001, -mv.z);
  gl_PointSize = max(1.0, uSize * aScale * uPixelRatio * (140.0 / d));
  vFade = clamp(1.0 - d / 90.0, 0.0, 1.0);
}
`;

const RAIN_FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
uniform float uOpacity;
varying float vFade;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float streak = smoothstep(0.5, 0.0, abs(c.x) * 7.0);
  float lengthFade = smoothstep(0.5, 0.05, abs(c.y));
  float a = streak * lengthFade * uOpacity * vFade;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a);
}
`;

const SNOW_FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
uniform float uOpacity;
varying float vFade;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  float a = smoothstep(0.5, 0.08, r) * uOpacity * vFade;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a);
}
`;

class Precipitation {
  constructor({ count, speed, drift, box, size, color, frag, opacity }) {
    this.count = count;
    this.speed = speed;
    this.drift = drift;
    this.box = box; // { x, y, z } half-extents around the camera
    this.pos = new Float32Array(count * 3);
    this.scale = new Float32Array(count);
    this.seedPhase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      this.pos[i * 3] = rand(-box.x, box.x);
      this.pos[i * 3 + 1] = rand(-box.y, box.y);
      this.pos[i * 3 + 2] = rand(-box.z, box.z);
      this.scale[i] = rand(0.7, 1.45);
      this.seedPhase[i] = rand(0, 100);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(this.scale, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), box.x * 2);
    this.geo = geo;
    this.uniforms = {
      uSize: { value: size },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: PRECIP_VERT,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      fog: false,
    });
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    this.points.visible = false;
    this.points.renderOrder = 900;
    this.center = new THREE.Vector3();
    this.intensity = 0;
  }

  update(dt, camera, wind, time) {
    const box = this.box;
    this.center.set(Math.round(camera.position.x), Math.round(camera.position.y), Math.round(camera.position.z));
    const fall = this.speed * dt;
    const wx = -wind * 6.5 * dt;
    const wz = wind * 2.2 * dt;
    const p = this.pos;
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      p[i3 + 1] -= fall * this.scale[i];
      p[i3] += wx;
      p[i3 + 2] += wz;
      if (this.drift > 0) {
        p[i3] += Math.sin(time * 1.7 + this.seedPhase[i]) * this.drift * dt;
        p[i3 + 2] += Math.cos(time * 1.3 + this.seedPhase[i] * 1.7) * this.drift * dt;
      }
      // recycle relative to the camera
      if (
        p[i3 + 1] < -box.y ||
        Math.abs(p[i3]) > box.x ||
        Math.abs(p[i3 + 2]) > box.z
      ) {
        p[i3] = rand(-box.x, box.x);
        p[i3 + 1] = box.y * rand(0.55, 1);
        p[i3 + 2] = rand(-box.z, box.z);
      }
    }
    this.geo.attributes.position.needsUpdate = true;
    // the geometry is authored around the origin, so move the cloud with the camera
    this.points.position.set(this.center.x, this.center.y, this.center.z);
  }

  setVisible(v, intensity) {
    this.points.visible = v && intensity > 0.01;
    this.uniforms.uOpacity.value = clamp01(intensity) * this.baseOpacity;
  }

  applyPixelRatio(r) {
    this.uniforms.uPixelRatio.value = r;
  }

  dispose() {
    this.geo.dispose();
    this.mat.dispose();
  }
}

export class Weather extends Emitter {
  constructor(scene, quality, opts = {}) {
    super();
    this.scene = scene;
    this.quality = quality;
    this.kind = opts.kind || 'clear';
    this.targetKind = this.kind;
    this.intensity = 1;
    this._targetIntensity = 1;
    this._transition = 0;
    this.wind = WEATHER_DEFS[this.kind].wind;
    this.windDir = opts.windDir ?? rand(0, Math.PI * 2);
    this.flash = 0;
    this._flashTimer = rand(4, 14);
    this._changeTimer = rand(60, 150); // seconds of real time
    this._elapsed = 0;
    this.forced = false;

    const dens = quality.particles;
    const rainCount = Math.round(3400 * dens);
    const snowCount = Math.round(2200 * dens);

    this.rain = new Precipitation({
      count: rainCount,
      speed: 34,
      drift: 0,
      box: { x: 42, y: 26, z: 42 },
      size: 2.4,
      color: 0xcfe6f5,
      frag: RAIN_FRAG,
      opacity: 0.5,
    });
    this.rain.baseOpacity = 0.5;
    this.snow = new Precipitation({
      count: snowCount,
      speed: 3.1,
      drift: 1.5,
      box: { x: 40, y: 22, z: 40 },
      size: 4.6,
      color: 0xffffff,
      frag: SNOW_FRAG,
      opacity: 0.85,
    });
    this.snow.baseOpacity = 0.85;

    const group = new THREE.Group();
    group.name = 'precipitation';
    group.add(this.rain.points, this.snow.points);
    this.group = group;
    scene.add(group);

    // splash ring pool on the water surface (cheap, pooled)
    this._splashTimer = 0;
    this.splashes = null;
    this._buildSplashes(28);

    this.set(this.kind, true);
  }

  _buildSplashes(count) {
    const geo = new THREE.RingGeometry(0.35, 0.5, 14);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xdff2fa,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.visible = false;
    this.scene.add(mesh);
    this.splashes = {
      mesh,
      geo,
      mat,
      count,
      life: new Float32Array(count),
      x: new Float32Array(count),
      z: new Float32Array(count),
      next: 0,
      dummy: new THREE.Object3D(),
    };
  }

  get def() {
    return WEATHER_DEFS[this.kind];
  }

  get label() {
    return this.def.label;
  }

  get icon() {
    return this.def.icon;
  }

  get cloudCover() {
    const a = WEATHER_DEFS[this.kind].cloudCover;
    const b = WEATHER_DEFS[this.targetKind].cloudCover;
    return lerp(a, b, this._transition);
  }

  get rainIntensity() {
    const a = WEATHER_DEFS[this.kind].rain;
    const b = WEATHER_DEFS[this.targetKind].rain;
    return lerp(a, b, this._transition) * this.intensity;
  }

  get snowIntensity() {
    const a = WEATHER_DEFS[this.kind].snow;
    const b = WEATHER_DEFS[this.targetKind].snow;
    return lerp(a, b, this._transition) * this.intensity;
  }

  get lightningChance() {
    const a = WEATHER_DEFS[this.kind].lightning;
    const b = WEATHER_DEFS[this.targetKind].lightning;
    return lerp(a, b, this._transition);
  }

  /** Bite-rate multiplier for the current weather (1 = neutral). */
  get biteModifier() {
    const a = WEATHER_DEFS[this.kind].bite;
    const b = WEATHER_DEFS[this.targetKind].bite;
    return lerp(a, b, this._transition);
  }

  /** Rarity bonus (1 = neutral, >1 shifts the table toward rarer fish). */
  get rarityModifier() {
    const a = WEATHER_DEFS[this.kind].rarity;
    const b = WEATHER_DEFS[this.targetKind].rarity;
    return lerp(a, b, this._transition);
  }

  get ambientKind() {
    return WEATHER_DEFS[this.kind].ambient;
  }

  /** Switch weather. `instant` skips the crossfade. */
  set(kind, instant = false, opts = {}) {
    if (!WEATHER_DEFS[kind]) return;
    if (kind === this.targetKind && !instant) return;
    if (instant) {
      this.kind = kind;
      this.targetKind = kind;
      this._transition = 0;
      this.intensity = 1;
      this._targetIntensity = 1;
    } else {
      this.kind = this.targetKind;
      this.targetKind = kind;
      this._transition = 0;
    }
    this.forced = !!opts.forced;
    this._changeTimer = this.forced ? Infinity : rand(90, 260);
    this.emit('change', { kind, label: this.label, instant });
  }

  /** Reset the auto-change timer (used when the player rests or loads). */
  reroll() {
    this._changeTimer = rand(80, 220);
  }

  /** Markov step to the next weather kind. */
  _nextKind() {
    const def = WEATHER_DEFS[this.targetKind];
    const entries = Object.entries(def.next).filter(([, w]) => w > 0);
    // seasonal bias (v4.2.0): winter snows, summer never does
    const snowBias = clamp01(this.snowBias ?? 0);
    const weightOf = (k, w) => (k === 'snow' ? w * (1 + snowBias * 4) : w);
    let total = 0;
    for (const [k, w] of entries) total += weightOf(k, w);
    let r = Math.random() * total;
    for (const [k, w] of entries) {
      r -= weightOf(k, w);
      if (r <= 0) return k;
    }
    return 'clear';
  }

  /**
   * A plausible look-ahead for the HUD forecast (not the actual future roll —
   * that would let players game it — but the same Markov weights).
   */
  forecastSteps(n = 3) {
    const out = [];
    let kind = this.targetKind;
    let minutes = Math.max(1, Math.round(this._changeTimer / 60));
    for (let i = 0; i < n; i++) {
      const def = WEATHER_DEFS[kind];
      const entries = Object.entries(def.next).filter(([, w]) => w > 0);
      let total = 0;
      for (const [, w] of entries) total += w;
      let r = Math.random() * total;
      let next = 'clear';
      for (const [k, w] of entries) {
        r -= w;
        if (r <= 0) {
          next = k;
          break;
        }
      }
      out.push({ kind: next, label: WEATHER_DEFS[next].label, icon: WEATHER_DEFS[next].icon, inMinutes: minutes });
      kind = next;
      minutes += randInt(60, 200);
    }
    return out;
  }

  /** Barometer reading in hPa, derived from cloud cover and wind. */
  get pressure() {
    return Math.round((1024 - this.cloudCover * 26 - this.wind * 12) * 10) / 10;
  }

  /** Significant wave height in metres (matches the water's wave scale). */
  get waveHeight() {
    return Math.round((0.35 + this.wind * 1.5) * 100) / 100;
  }

  /** Wind speed in m/s, for the HUD. */
  get windSpeed() {
    return Math.round(this.wind * 14 * 10) / 10;
  }

  /**
   * @param {number} dt seconds
   * @param {THREE.Camera} camera
   * @param {object} env environment produced by Sky (for colours/intensity)
   */
  update(dt, camera, env) {
    this._elapsed += dt;

    if (this._transition < 1) {
      this._transition = clamp01(this._transition + dt / 14);
    }
    if (this._changeTimer !== Infinity) {
      this._changeTimer -= dt;
      if (this._changeTimer <= 0 && !this.forced) {
        this.set(this._nextKind());
      }
    }

    // wind slowly veers
    this.windDir += rand(-1, 1) * dt * 0.12;
    const targetWind = lerp(WEATHER_DEFS[this.kind].wind, WEATHER_DEFS[this.targetKind].wind, this._transition);
    this.wind = lerp(this.wind, targetWind, 1 - Math.exp(-0.6 * dt));

    // ---- rain
    const rainI = this.rainIntensity;
    this.rain.setVisible(rainI > 0.02, rainI);
    if (this.rain.points.visible) this.rain.update(dt, camera, this.wind, this._elapsed);

    // ---- snow
    const snowI = this.snowIntensity;
    this.snow.setVisible(snowI > 0.02, snowI);
    if (this.snow.points.visible) this.snow.update(dt, camera, this.wind, this._elapsed);

    // ---- lightning
    const lc = this.lightningChance;
    if (lc > 0.02) {
      this._flashTimer -= dt;
      if (this._flashTimer <= 0) {
        this.flash = 1;
        this._flashTimer = rand(3.5, 16) * (1.4 - lc);
        this.emit('lightning');
      }
    }
    if (this.flash > 0) {
      this.flash = Math.max(0, this.flash - dt * (this.flash > 0.6 ? 6 : 2.4));
    }

    // ---- surface splashes when it rains on water
    const pool = this.splashes;
    if (pool) {
      const active = rainI > 0.15;
      pool.mesh.visible = active;
      if (active) {
        this._splashTimer -= dt;
        const spawnEvery = 0.05 / Math.max(0.2, rainI);
        while (this._splashTimer <= 0) {
          this._splashTimer += spawnEvery;
          const i = pool.next;
          pool.next = (pool.next + 1) % pool.count;
          const ang = rand(0, Math.PI * 2);
          const r = Math.sqrt(Math.random()) * 26;
          pool.x[i] = camera.position.x + Math.cos(ang) * r;
          pool.z[i] = camera.position.z + Math.sin(ang) * r;
          pool.life[i] = 1;
        }
        const d = pool.dummy;
        for (let i = 0; i < pool.count; i++) {
          const l = pool.life[i];
          if (l > 0) {
            pool.life[i] = Math.max(0, l - dt * 2.2);
            const k = 1 - pool.life[i];
            const s = 1 + k * 4.5;
            d.position.set(pool.x[i], 0.06, pool.z[i]);
            d.scale.set(s, 1, s);
            d.rotation.y = 0;
            d.updateMatrix();
            pool.mesh.setMatrixAt(i, d.matrix);
            // fade by shrinking alpha through scale trick (material is shared)
          } else {
            d.position.set(0, -100, 0);
            d.scale.set(0.001, 0.001, 0.001);
            d.updateMatrix();
            pool.mesh.setMatrixAt(i, d.matrix);
          }
        }
        pool.mesh.instanceMatrix.needsUpdate = true;
        pool.mat.opacity = clamp01(0.16 + rainI * 0.3);
      }
    }
  }

  /** Brightness boost for the flash, consumed by the world each frame. */
  get flashBoost() {
    return this.flash * this.flash;
  }

  applyPixelRatio(r) {
    this.rain.applyPixelRatio(r);
    this.snow.applyPixelRatio(r);
  }

  setQuality(quality) {
    this.quality = quality;
    // Scaling particle counts in place would require rebuilding the buffers;
    // instead thin the drawn range so the cost tracks the quality tier.
    this.rain.points.geometry.setDrawRange(0, Math.round(this.rain.count * clamp(quality.particles, 0.2, 1)));
    this.snow.points.geometry.setDrawRange(0, Math.round(this.snow.count * clamp(quality.particles, 0.2, 1)));
  }

  dispose() {
    this.rain.dispose();
    this.snow.dispose();
    this.scene.remove(this.group);
    if (this.splashes) {
      this.scene.remove(this.splashes.mesh);
      this.splashes.geo.dispose();
      this.splashes.mat.dispose();
    }
  }
}
