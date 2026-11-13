/**
 * sky.js — sky dome, sun/moon, stars, cloud layer, day-night cycle, lighting
 * and the scene fog that ties it all together.
 *
 * `Sky.update()` produces the `env` object every other system consumes
 * (water colours, weather particles, ambient audio, fish activity).
 */
import * as THREE from 'three';
import { Noise2D, clamp, clamp01, lerp, smoothstep, smoothRange, mulberry32, TAU } from '../core/util.js';

const DOME_RADIUS = 2800;
const CLOUD_HEIGHT = 900;

/**
 * Colour stops keyed by sun elevation (sunDir.y, -1..1).
 *
 * Light budgets matter: sun + hemisphere + ambient should total roughly
 * 1.2–1.5, otherwise a mid-albedo surface blows past 1.0 and the scene washes
 * out to white after tone mapping.
 */
const SKY_STOPS = [  { elev: -1.0, zenith: 0x05070f, horizon: 0x0a1220, sun: 0x1a2440, hemiSky: 0x16223a, hemiGround: 0x0a0f16, fog: 0x0b1421, sunI: 0.0, hemiI: 0.13, ambI: 0.05, moonI: 0.34 },
  { elev: -0.3, zenith: 0x070c1a, horizon: 0x121d33, sun: 0x1f2c4e, hemiSky: 0x1c2a46, hemiGround: 0x0c1119, fog: 0x121c2c, sunI: 0.0, hemiI: 0.15, ambI: 0.06, moonI: 0.32 },
  { elev: -0.12, zenith: 0x152040, horizon: 0x4a4468, sun: 0x3a3a66, hemiSky: 0x2c3a5e, hemiGround: 0x141922, fog: 0x2a2c44, sunI: 0.04, hemiI: 0.2, ambI: 0.07, moonI: 0.2 },
  { elev: -0.02, zenith: 0x2a3566, horizon: 0xd06a3a, sun: 0xff6a2e, hemiSky: 0x4a4a72, hemiGround: 0x1e1a1a, fog: 0x8a6a5c, sunI: 0.22, hemiI: 0.26, ambI: 0.08, moonI: 0.1 },
  { elev: 0.1, zenith: 0x2f4f8f, horizon: 0xff9a58, sun: 0xff9a55, hemiSky: 0x6080aa, hemiGround: 0x2a2620, fog: 0xa88a72, sunI: 0.62, hemiI: 0.38, ambI: 0.12, moonI: 0.03 },
  { elev: 0.3, zenith: 0x3a72bd, horizon: 0xe8c3a0, sun: 0xffe0b0, hemiSky: 0x8fb6da, hemiGround: 0x40402c, fog: 0xa8bccc, sunI: 0.92, hemiI: 0.4, ambI: 0.12, moonI: 0.0 },
  { elev: 1.0, zenith: 0x3a78c8, horizon: 0xcfe4f2, sun: 0xfffaf0, hemiSky: 0x9cc2e6, hemiGround: 0x4a4a34, fog: 0xa6c4dc, sunI: 1.06, hemiI: 0.38, ambI: 0.11, moonI: 0.0 },
];

const CLOUD_GREY_DAY = new THREE.Color(0xe8eef4);
const CLOUD_GREY_NIGHT = new THREE.Color(0x2a3444);
const CLOUD_STORM = new THREE.Color(0x6b7480);

/**
 * Seasons (v4.2.0): a 12-day year, 3 days each. The season shifts the base
 * temperature and how likely snow is, which the survival layer reads.
 */
const SEASONS = [
  { id: 'spring', label: '春', icon: '🌸', temp: 1.0, snow: 0.1, note: '回暖，鱼开始靠岸' },
  { id: 'summer', label: '夏', icon: '☀️', temp: 4.5, snow: 0.0, note: '白昼漫长，正午暴晒' },
  { id: 'autumn', label: '秋', icon: '🍂', temp: 0.0, snow: 0.25, note: '鱼最肥的季节，夜开始变冷' },
  { id: 'winter', label: '冬', icon: '❄️', temp: -7.0, snow: 1.0, note: '落雪与失温，需要火' },
];
const SEASON_DAYS = 3;

/**
 * Named time-of-day phases (v3.0.0). `until` is the local hour the phase ends.
 */
const TIME_PHASES = [
  { until: 4.0, id: 'night', label: '深夜', icon: '🌙' },
  { until: 5.3, id: 'predawn', label: '黎明', icon: '🌌' },
  { until: 6.9, id: 'sunrise', label: '日出', icon: '🌅' },
  { until: 9.0, id: 'morning', label: '清晨', icon: '🌤️' },
  { until: 11.2, id: 'lateMorning', label: '上午', icon: '☀️' },
  { until: 13.4, id: 'noon', label: '正午', icon: '🌞' },
  { until: 16.2, id: 'afternoon', label: '下午', icon: '🕓' },
  { until: 18.0, id: 'sunset', label: '日落', icon: '🌆' },
  { until: 19.6, id: 'dusk', label: '暮色', icon: '🌃' },
  { until: 24.0, id: 'night', label: '夜晚', icon: '🌙' },
];

/** Soft radial texture used by the sun glare sprite. */
function makeGlowTexture(size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,248,230,0.72)');
  g.addColorStop(0.42, 'rgba(255,220,170,0.26)');
  g.addColorStop(0.72, 'rgba(255,180,120,0.07)');
  g.addColorStop(1, 'rgba(255,160,100,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const DOME_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const DOME_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uGround;
uniform vec3 uSunColor;
uniform vec3 uMoonColor;
uniform vec3 uSunDir;
uniform vec3 uMoonDir;
uniform float uSunVisible;
uniform float uMoonVisible;
uniform float uNight;
varying vec3 vDir;

void main() {
  vec3 d = normalize(vDir);
  float up = d.y;

  // vertical gradient (a little brighter just above the horizon)
  float t = pow(clamp(up, 0.0, 1.0), 0.62);
  vec3 col = mix(uHorizon, uZenith, t);

  // below-horizon haze so the world does not end in a hard line
  col = mix(col, uGround, clamp(-up * 6.0, 0.0, 1.0));

  // sun disc + halo
  float sd = max(dot(d, uSunDir), 0.0);
  float disc = pow(sd, 1600.0) * 3.0;
  float halo = pow(sd, 9.0) * 0.34 + pow(sd, 90.0) * 0.3;
  col += uSunColor * (disc + halo) * uSunVisible;

  // moon disc + soft glow
  float md = max(dot(d, uMoonDir), 0.0);
  float mdisc = pow(md, 3200.0) * 2.6;
  float mhalo = pow(md, 40.0) * 0.12;
  col += uMoonColor * (mdisc + mhalo) * uMoonVisible;

  // faint milky band at night
  col += vec3(0.03, 0.035, 0.06) * uNight * pow(max(1.0 - abs(up - 0.35), 0.0), 4.0) * 0.5;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const CLOUD_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const CLOUD_FRAG = /* glsl */ `
precision mediump float;
uniform sampler2D uMap;
uniform vec3 uTint;
uniform vec3 uFogColor;
uniform float uOpacity;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uCameraPos;
uniform vec2 uScroll;
uniform vec2 uRepeat;
varying vec2 vUv;
varying vec3 vWorld;

void main() {
  vec4 c = texture2D(uMap, vUv * uRepeat + uScroll);
  float a = c.a * uOpacity;
  if (a < 0.004) discard;
  float dist = length(uCameraPos - vWorld);
  float fogF = clamp((dist - uFogNear) / max(1.0, uFogFar - uFogNear), 0.0, 1.0);
  vec3 col = mix(uTint, uFogColor, pow(fogF, 0.7));
  a *= 1.0 - fogF * 0.92;
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

function makeStarTexture() {
  const s = 32;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Seamless puffy-cloud alpha texture drawn with wrapped radial blobs. */
function makeCloudTexture(seed = 4242) {
  const size = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  const blobs = 110;
  const drawBlob = (x, y, r, a) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(0.5, `rgba(255,255,255,${a * 0.4})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  };
  for (let i = 0; i < blobs; i++) {
    // cluster blobs so clouds have cores and wisps, leaving plenty of open sky
    const cx = rnd() * size;
    const cy = rnd() * size;
    const cluster = 2 + Math.floor(rnd() * 3);
    for (let k = 0; k < cluster; k++) {
      const ox = (rnd() - 0.5) * 78;
      const oy = (rnd() - 0.5) * 60;
      const r = 16 + rnd() * 34;
      const a = 0.05 + rnd() * 0.13;
      const x = cx + ox;
      const y = cy + oy;
      // draw wrapped copies so the tile is seamless
      for (const dx of [-size, 0, size]) {
        for (const dy of [-size, 0, size]) drawBlob(x + dx, y + dy, r, a);
      }
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 2;
  return tex;
}

export class Sky {
  constructor(scene, quality, opts = {}) {
    this.scene = scene;
    this.quality = quality;
    this.time = opts.time ?? 6.5;
    this.dayLengthMinutes = opts.dayLengthMin ?? 24;
    this.paused = false;
    this._days = 1;

    this.sunDir = new THREE.Vector3(0.6, 0.3, -0.4).normalize();
    this.moonDir = new THREE.Vector3(-0.6, -0.3, 0.4).normalize();

    const palette = this._lerpPalette(0.5);
    this.palette = palette;

    // ---- sky dome
    this.domeUniforms = {
      uZenith: { value: palette.zenith.clone() },
      uHorizon: { value: palette.horizon.clone() },
      uGround: { value: new THREE.Color(0x1b2a33) },
      uSunColor: { value: palette.sun.clone() },
      uMoonColor: { value: new THREE.Color(0xdfe8ff) },
      uSunDir: { value: this.sunDir.clone() },
      uMoonDir: { value: this.moonDir.clone() },
      uSunVisible: { value: 1 },
      uMoonVisible: { value: 0 },
      uNight: { value: 0 },
    };
    const domeGeo = new THREE.SphereGeometry(DOME_RADIUS, 32, 20);
    this.domeMat = new THREE.ShaderMaterial({
      uniforms: this.domeUniforms,
      vertexShader: DOME_VERT,
      fragmentShader: DOME_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      fog: false,
      toneMapped: true,
    });
    this.dome = new THREE.Mesh(domeGeo, this.domeMat);
    this.dome.name = 'sky-dome';
    this.dome.frustumCulled = false;
    this.dome.renderOrder = -1000;
    scene.add(this.dome);

    // ---- stars
    this.starTex = makeStarTexture();
    const starCount = opts.stars ?? 1400;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    const rnd = mulberry32(9182);
    const c = new THREE.Color();
    for (let i = 0; i < starCount; i++) {
      // uniform on the upper hemisphere
      const u = rnd() * 2 - 1;
      const phi = rnd() * TAU;
      const s = Math.sqrt(1 - u * u);
      const y = Math.abs(u) * 0.98 + 0.02;
      const r = DOME_RADIUS * 0.97;
      starPos[i * 3] = Math.cos(phi) * s * r;
      starPos[i * 3 + 1] = y * r;
      starPos[i * 3 + 2] = Math.sin(phi) * s * r;
      const t = rnd();
      c.setHSL(0.55 + (t - 0.5) * 0.16, 0.35 * rnd(), 0.72 + rnd() * 0.28);
      starCol[i * 3] = c.r;
      starCol[i * 3 + 1] = c.g;
      starCol[i * 3 + 2] = c.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    this.starMat = new THREE.PointsMaterial({
      size: 12,
      sizeAttenuation: true,
      map: this.starTex,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      fog: false,
      blending: THREE.AdditiveBlending,
    });
    this.stars = new THREE.Points(starGeo, this.starMat);
    this.stars.frustumCulled = false;
    this.stars.renderOrder = -999;
    scene.add(this.stars);

    // ---- clouds
    this.cloudTex = makeCloudTexture(4242);
    this.cloudUniforms = {
      uMap: { value: this.cloudTex },
      uTint: { value: new THREE.Color(0xffffff) },
      uFogColor: { value: palette.fog.clone() },
      uOpacity: { value: 0.5 },
      uFogNear: { value: 200 },
      uFogFar: { value: 1400 },
      uCameraPos: { value: new THREE.Vector3() },
      uScroll: { value: new THREE.Vector2() },
      uRepeat: { value: new THREE.Vector2(11, 11) },
    };
    this.cloudMat = new THREE.ShaderMaterial({
      uniforms: this.cloudUniforms,
      vertexShader: CLOUD_VERT,
      fragmentShader: CLOUD_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      fog: false,
    });
    const cloudGeo = new THREE.PlaneGeometry(16000, 16000, 1, 1);
    cloudGeo.rotateX(-Math.PI / 2);
    this.clouds = new THREE.Mesh(cloudGeo, this.cloudMat);
    this.clouds.name = 'cloud-layer';
    this.clouds.position.y = CLOUD_HEIGHT;
    this.clouds.frustumCulled = false;
    this.clouds.renderOrder = -900;
    scene.add(this.clouds);

    // ---- sun glare sprite (v3.0.0): atmospheric bloom around the low sun
    this.sunGlowTex = makeGlowTexture();
    this.sunGlowMat = new THREE.SpriteMaterial({
      map: this.sunGlowTex,
      color: 0xffd9a0,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      fog: false,
    });
    this.sunGlow = new THREE.Sprite(this.sunGlowMat);
    this.sunGlow.name = 'sun-glare';
    this.sunGlow.scale.setScalar(620);
    this.sunGlow.renderOrder = -880;
    this.sunGlow.visible = false;
    scene.add(this.sunGlow);

    // ---- lights
    this.key = new THREE.DirectionalLight(0xffffff, 1.5);
    this.key.name = 'sun-light';
    this.key.castShadow = quality.shadows;
    this.key.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
    this.key.shadow.camera.near = 1;
    this.key.shadow.camera.far = quality.shadowDistance * 3.2;
    this.key.shadow.bias = -0.0006;
    this.key.shadow.normalBias = 0.035;
    this._setShadowExtent(quality.shadowDistance);
    scene.add(this.key);
    scene.add(this.key.target);

    this.hemi = new THREE.HemisphereLight(0x9cc2e6, 0x4a4a34, 0.7);
    scene.add(this.hemi);
    this.ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(this.ambient);

    // ---- fog
    this.fog = new THREE.Fog(palette.fog.clone().getHex(), 120, quality.drawDistance);
    scene.fog = this.fog;

    // ---- exported environment for other systems
    this.env = {
      sunDir: this.sunDir,
      moonDir: this.moonDir,
      sunColor: palette.sun.clone(),
      sunIntensity: palette.sunI,
      skyColor: palette.zenith.clone(),
      horizonColor: palette.horizon.clone(),
      fogColor: palette.fog.clone(),
      fogNear: quality.drawDistance * quality.fogNear,
      fogFar: quality.drawDistance,
      wind: 0.3,
      rain: 0,
      snow: 0,
      cloudCover: 0.35,
      turbidity: 0.22,
      shallowColor: new THREE.Color(0x2f8fa3),
      deepColor: new THREE.Color(0x0b3550),
      night: 0,
      temperature: 18,
    };

    this._scratch = new THREE.Color();
    this._scratch2 = new THREE.Color();
    this._scratch3 = new THREE.Color();
    this._scratchGrey = new THREE.Color();
    this._scratchGlow = new THREE.Color(0xff7a3c);
    this._keyColorNight = new THREE.Color(0xbcd0ff);
    this._ambientDay = new THREE.Color(0xbfd4e8);
    this._ambientNight = new THREE.Color(0x31405e);
    this._night = 0;
    this._cloudScroll = new THREE.Vector2();
    this._shadowDist = quality.shadowDistance;
    this.update(0, new THREE.PerspectiveCamera(), null);
  }

  _setShadowExtent(d) {
    const cam = this.key.shadow.camera;
    cam.left = -d;
    cam.right = d;
    cam.top = d;
    cam.bottom = -d;
    cam.updateProjectionMatrix();
  }

  setQuality(quality) {
    this.quality = quality;
    this.key.castShadow = quality.shadows;
    this.key.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
    this.key.shadow.camera.far = quality.shadowDistance * 3.2;
    if (this.key.shadow.map) {
      this.key.shadow.map.dispose();
      this.key.shadow.map = null;
    }
    this._shadowDist = quality.shadowDistance;
    this._setShadowExtent(quality.shadowDistance);
  }

  /** Interpolate the colour stops for a given sun elevation. */
  _lerpPalette(elev) {
    const stops = SKY_STOPS;
    let a = stops[0];
    let b = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (elev >= stops[i].elev && elev <= stops[i + 1].elev) {
        a = stops[i];
        b = stops[i + 1];
        break;
      }
    }
    const k = clamp01((elev - a.elev) / (b.elev - a.elev || 1));
    const s = smoothstep(k);
    const out = {
      zenith: new THREE.Color(a.zenith).lerp(new THREE.Color(b.zenith), s),
      horizon: new THREE.Color(a.horizon).lerp(new THREE.Color(b.horizon), s),
      sun: new THREE.Color(a.sun).lerp(new THREE.Color(b.sun), s),
      hemiSky: new THREE.Color(a.hemiSky).lerp(new THREE.Color(b.hemiSky), s),
      hemiGround: new THREE.Color(a.hemiGround).lerp(new THREE.Color(b.hemiGround), s),
      fog: new THREE.Color(a.fog).lerp(new THREE.Color(b.fog), s),
      sunI: lerp(a.sunI, b.sunI, s),
      hemiI: lerp(a.hemiI, b.hemiI, s),
      ambI: lerp(a.ambI, b.ambI, s),
      moonI: lerp(a.moonI, b.moonI, s),
    };
    return out;
  }

  setTime(hours) {
    this.time = ((hours % 24) + 24) % 24;
  }

  /** Advance the clock. `dt` in real seconds. */
  advance(dt) {    if (this.paused) return;
    const hoursPerSecond = 24 / Math.max(1, this.dayLengthMinutes * 60);
    const before = this.time;
    this.time = (this.time + dt * hoursPerSecond) % 24;
    if (this.time < before) this._days++;
  }

  get dayCount() {
    return this._days;
  }

  /** Current season (v4.2.0). */
  get season() {
    const d = Math.max(0, this._days);
    const idx = Math.floor(d / SEASON_DAYS) % SEASONS.length;
    return { ...SEASONS[idx], index: idx, dayInSeason: (d % SEASON_DAYS) + 1 };
  }

  /**
   * Named time-of-day phase (v3.0.0). Windows are in local game hours and are
   * what the HUD shows and what the "prime feeding" bonus is keyed on.
   */
  get phaseInfo() {
    const t = this.time;
    const P = TIME_PHASES;
    for (const p of P) {
      if (t < p.until) return { id: p.id, label: p.label, icon: p.icon, index: P.indexOf(p) };
    }
    return { id: 'night', label: '夜晚', icon: '🌙', index: P.length - 1 };
  }

  /** Prime feeding windows: dawn and dusk, scaled by how golden it is. */
  get primeFeeding() {
    const p = this.phaseInfo;
    if (p.id === 'sunrise' || p.id === 'sunset') return 1;
    if (p.id === 'predawn' || p.id === 'dusk') return 0.6;
    return 0;
  }

  /** Sun/moon positions for the current clock time. */
  _updateDirections() {
    const a = ((this.time - 6) / 12) * Math.PI; // 0 at 06:00, PI at 18:00
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    this.sunDir.set(cosA * 0.94, sinA, -0.34).normalize();
    this.moonDir.copy(this.sunDir).negate();
    // keep the moon a touch off the exact anti-solar point
    this.moonDir.x += 0.12;
    this.moonDir.normalize();
  }

  /** temperature from time of day + weather */
  _temperature(weather) {
    const dayCurve = Math.sin(((this.time - 9) / 24) * TAU + Math.PI / 2) * 0.5 + 0.5;
    let t = 12 + dayCurve * 14;
    if (weather?.kind === 'snow') t -= 16;
    else if (weather?.kind === 'rain') t -= 5;
    else if (weather?.kind === 'storm') t -= 7;
    else if (weather?.kind === 'fog') t -= 3;
    else if (weather?.kind === 'cloudy') t -= 2;
    return t;
  }

  /**
   * @param {number} dt seconds
   * @param {THREE.Camera} camera
   * @param {object|null} ctx { playerPos, weather } weather is a Weather instance
   */
  update(dt, camera, ctx = null) {
    this._updateDirections();

    const weather = ctx?.weather || null;
    const cloudCover = clamp01(weather?.cloudCover ?? 0.3);
    const kind = weather?.kind || 'clear';
    const elev = this.sunDir.y;

    const p = this._lerpPalette(elev);
    this.palette = p;

    // ---- night factor (0 by day, 1 once the sun is well below the horizon)
    const night = clamp01(smoothRange(0.02, -0.22, elev));
    this._night = night;

    // ---- golden hour (v3.0.0): strongest just above and below the horizon.
    // Sunset reads warmer than sunrise (more haze in the air by evening).
    const setting = this.time > 12;
    const warmBias = setting ? 1 : 0.72;
    const goldenBase = Math.exp(-Math.pow((elev - 0.03) / 0.145, 2));
    const golden = clamp01(goldenBase * (1 - cloudCover * 0.72) * (kind === 'storm' ? 0.25 : 1) * warmBias);
    this._golden = golden;
    const phase = this.phaseInfo;

    // ---- weather shading of the sky
    const grey = this._scratchGrey.copy(CLOUD_GREY_DAY).lerp(CLOUD_GREY_NIGHT, night);
    if (kind === 'storm') grey.lerp(CLOUD_STORM, 0.55);
    const greyAmt = clamp01(cloudCover * (kind === 'clear' ? 0.35 : 0.95));
    const zenith = this._scratch.copy(p.zenith).lerp(grey, greyAmt * 0.62);
    const horizon = this._scratch2.copy(p.horizon).lerp(grey, greyAmt * 0.72);
    const fogCol = this._scratch3.copy(p.fog).lerp(grey, greyAmt * 0.6);

    let sunI = p.sunI * (1 - 0.72 * cloudCover);
    let moonI = p.moonI * (1 - 0.7 * cloudCover);
    const sunUp = elev > -0.03;

    // ---- darken everything for storm/night
    if (kind === 'storm') sunI *= 0.62;
    if (kind === 'rain') sunI *= 0.78;
    if (kind === 'fog') sunI *= 0.72;

    // ---- dome uniforms
    const du = this.domeUniforms;
    du.uZenith.value.copy(zenith);
    du.uHorizon.value.copy(horizon);
    du.uGround.value.copy(fogCol).multiplyScalar(0.75);
    du.uSunColor.value.copy(p.sun);
    du.uSunDir.value.copy(this.sunDir);
    du.uMoonDir.value.copy(this.moonDir);
    du.uSunVisible.value = clamp01(smoothRange(-0.09, 0.03, elev)) * (1 - 0.85 * cloudCover);
    du.uMoonVisible.value = clamp01(smoothRange(-0.06, 0.05, this.moonDir.y)) * (1 - 0.85 * cloudCover) * (0.35 + 0.65 * night);
    du.uNight.value = night;

    // ---- star opacity
    this.starMat.opacity = clamp01(smoothRange(0.03, -0.16, elev)) * (1 - cloudCover * 0.92);
    this.stars.visible = this.starMat.opacity > 0.01;

    // ---- key light: sun by day, moon by night
    const keyUp = sunUp && sunI > 0.02;
    const dir = keyUp ? this.sunDir : this.moonDir;
    const intensity = keyUp ? sunI : moonI * 0.5;
    const color = keyUp ? p.sun : this._keyColorNight;
    this.key.color.copy(color);
    this.key.intensity = Math.max(0.05, intensity);
    this.key.visible = intensity > 0.01 || this.quality.shadows === false;

    // ---- hemi + ambient
    this.hemi.color.copy(p.hemiSky).lerp(grey, greyAmt * 0.5);
    this.hemi.groundColor.copy(p.hemiGround);
    this.hemi.intensity = p.hemiI * (1 - 0.28 * cloudCover);
    this.ambient.intensity = p.ambI * (1 + 0.2 * cloudCover) + night * 0.05;
    this.ambient.color.copy(this._ambientDay).lerp(this._ambientNight, night);

    // ---- fog distance
    const base = this.quality.drawDistance;
    let fogFar = base;
    let fogNearK = 0.34;
    if (kind === 'fog') {
      fogFar = Math.min(150, base * 0.17);
      fogNearK = 0.02;
    } else if (kind === 'storm') {
      fogFar = base * 0.42;
      fogNearK = 0.1;
    } else if (kind === 'rain' || kind === 'snow') {
      fogFar = base * 0.6;
      fogNearK = 0.16;
    } else if (kind === 'cloudy') {
      fogFar = base * 0.86;
    }
    fogFar *= 1 - night * 0.22;
    fogFar *= 1 - cloudCover * 0.12;
    const fogNear = Math.max(1.5, fogFar * fogNearK);
    this.fog.color.copy(fogCol);
    this.fog.near = fogNear;
    this.fog.far = fogFar;

    // Fog and heavy rain scatter light: lift the ambient so the ground reads
    // as washed-out grey rather than black.
    if (kind === 'fog') {
      this.ambient.intensity = Math.max(this.ambient.intensity, 0.5);
      this.hemi.intensity = Math.max(this.hemi.intensity, 0.85);
    } else if (kind === 'rain' || kind === 'snow' || kind === 'storm') {
      this.ambient.intensity = Math.max(this.ambient.intensity, 0.32);
      this.hemi.intensity = Math.max(this.hemi.intensity, 0.55);
    }

    // ---- clouds (warm them up at golden hour)
    const cu = this.cloudUniforms;
    cu.uTint.value.copy(CLOUD_GREY_DAY).lerp(CLOUD_GREY_NIGHT, night);
    if (kind === 'storm') cu.uTint.value.lerp(CLOUD_STORM, 0.5);
    if (golden > 0.02) cu.uTint.value.lerp(p.horizon, golden * 0.45 * (1 - cloudCover * 0.2));
    cu.uTint.value.multiplyScalar(0.62 + 0.34 * clamp01(elev * 2 + 0.6));
    cu.uOpacity.value = clamp01(0.05 + cloudCover * 0.9);
    cu.uFogColor.value.copy(fogCol);
    cu.uFogNear.value = fogFar * 0.2;
    cu.uFogFar.value = fogFar * 2.4;

    // ---- follow the camera so the backdrop never gets closer
    if (camera) {
      this.dome.position.copy(camera.position);
      this.stars.position.copy(camera.position);
      this.stars.rotation.y = (this.time / 24) * TAU * 0.5;
      this.clouds.position.set(camera.position.x, CLOUD_HEIGHT, camera.position.z);
      cu.uCameraPos.value.copy(camera.position);
      const wind = this.env.wind;
      this._cloudScroll.x += dt * 0.0009 * (0.3 + wind * 1.6);
      this._cloudScroll.y += dt * 0.0004 * (0.3 + wind * 1.6);
      cu.uScroll.value.copy(this._cloudScroll);
      // ---- sun glow sprite: atmospheric bloom that the dome alone cannot give
      // (kept inside the camera's far plane — beyond it the quad gets clipped
      // into a hard little disc)
      if (this.sunGlow) {
        const sv = clamp01(this.domeUniforms.uSunVisible.value);
        const far = camera.far || 1300;
        const dist = Math.min(900, far * 0.62);
        this.sunGlow.position.copy(camera.position).addScaledVector(this.sunDir, dist);
        this.sunGlow.visible = sv > 0.015;
        this.sunGlowMat.opacity = Math.min(0.92, sv * (0.42 + golden * 0.85));
        this.sunGlowMat.color.copy(p.sun).lerp(this._scratchGlow, setting ? 0.25 : 0.05);
        const near = clamp01(1 - Math.abs(elev) * 3.4);
        this.sunGlow.scale.setScalar(dist * (0.22 + golden * 0.3 + near * 0.12));
      }
    }

    // ---- shadow frustum follows the player
    const focus = ctx?.playerPos || camera?.position;
    if (focus && this.key.castShadow) {
      const d = this._shadowDist;
      this.key.target.position.set(focus.x, focus.y, focus.z);
      this.key.position.set(focus.x + dir.x * d * 1.4, focus.y + dir.y * d * 1.4 + 12, focus.z + dir.z * d * 1.4);
      this.key.target.updateMatrixWorld();
      this.key.shadow.camera.updateProjectionMatrix();
    }

    // ---- publish env
    const env = this.env;
    env.sunColor.copy(p.sun);
    env.sunIntensity = keyUp ? sunI : 0;
    env.moonIntensity = keyUp ? 0 : moonI;
    env.keyDir = dir;
    env.keyColor = color;
    env.keyIntensity = Math.max(0.05, intensity);
    env.skyColor.copy(zenith);
    env.horizonColor.copy(horizon);
    env.fogColor.copy(fogCol);
    env.fogNear = fogNear;
    env.fogFar = fogFar;
    env.cloudCover = cloudCover;
    env.night = night;
    env.temperature = this._temperature(weather);
    env.wind = clamp01(weather?.wind ?? 0.3);
    env.rain = clamp01(weather?.rainIntensity ?? 0);
    env.snow = clamp01(weather?.snowIntensity ?? 0);
    env.turbidity = clamp01(0.18 + cloudCover * 0.16 + env.rain * 0.35);
    // ---- environment phase + golden hour (v3.0.0)
    env.golden = golden;
    env.sunElev = elev;
    env.phase = phase;
    env.sunset = setting;
    env.season = this.season;

    // water colours follow the sky so the sea looks right at every hour
    const shallow = this._waterShallow || (this._waterShallow = new THREE.Color());
    const deep = this._waterDeep || (this._waterDeep = new THREE.Color());
    shallow.setHex(0x2f8fa3).lerp(horizon, 0.07 + night * 0.05);
    shallow.multiplyScalar(0.42 + 0.5 * clamp01(elev * 2.2 + 0.75));
    deep.setHex(0x0b3550).lerp(zenith, 0.2).multiplyScalar(0.44 + 0.5 * clamp01(elev * 2 + 0.7));
    env.shallowColor.copy(shallow);
    env.deepColor.copy(deep);

    return env;
  }

  dispose() {
    this.dome.geometry.dispose();
    this.domeMat.dispose();
    this.stars.geometry.dispose();
    this.starMat.dispose();
    this.starTex.dispose();
    this.clouds.geometry.dispose();
    this.cloudMat.dispose();
    this.cloudTex.dispose();
    this.sunGlowTex.dispose();
    this.sunGlowMat.dispose();
    this.scene.remove(this.dome, this.stars, this.clouds, this.sunGlow, this.key, this.key.target, this.hemi, this.ambient);
  }
}
