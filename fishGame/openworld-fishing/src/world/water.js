/**
 * water.js — animated ocean/lake surface.
 *
 * The wave field is defined once in WAVE_DEFS and consumed twice: the GLSL
 * snippet is generated from it (so the GPU surface can never drift from the
 * CPU one), and `waveHeight()` evaluates the same sum in JavaScript so the
 * bobber, boat and swimming player float on the water you can actually see.
 */
import * as THREE from 'three';
import { clamp, clamp01, lerp, TAU } from '../core/util.js';
import { WORLD, WATER_LEVEL } from './terrain.js';

/** Directional wave components: metres/second phase speed. */
export const WAVE_DEFS = [
  { dx: 0.96, dz: 0.28, amp: 0.34, len: 16.0, speed: 1.65 },
  { dx: 0.62, dz: -0.78, amp: 0.2, len: 9.5, speed: 1.25 },
  { dx: -0.42, dz: 0.91, amp: 0.11, len: 5.6, speed: 1.05 },
  { dx: 0.88, dz: 0.47, amp: 0.055, len: 3.1, speed: 0.9 },
];

const MAX_AMP = WAVE_DEFS.reduce((s, w) => s + w.amp, 0);

/** CPU-side wave height at a world position, in metres above WATER_LEVEL. */
export function waveHeight(x, z, time, ampScale = 1) {
  let y = 0;
  for (let i = 0; i < WAVE_DEFS.length; i++) {
    const w = WAVE_DEFS[i];
    const k = TAU / w.len;
    const d = w.dx * x + w.dz * z;
    y += Math.sin(k * d - time * w.speed * k) * w.amp * ampScale;
  }
  return y;
}

/** CPU-side surface normal (unnormalised y = 1). */
export function waveNormal(x, z, time, ampScale = 1, out = new THREE.Vector3()) {
  let dx = 0;
  let dz = 0;
  for (let i = 0; i < WAVE_DEFS.length; i++) {
    const w = WAVE_DEFS[i];
    const k = TAU / w.len;
    const d = w.dx * x + w.dz * z;
    const c = Math.cos(k * d - time * w.speed * k) * w.amp * ampScale * k;
    dx += c * w.dx;
    dz += c * w.dz;
  }
  return out.set(-dx, 1, -dz).normalize();
}

function glslWaveSum(varName = 'waveY', ampExpr = 'amp', pExpr = 'p') {
  let src = '';
  for (const w of WAVE_DEFS) {
    const k = TAU / w.len;
    src += `  ${varName} += sin(${k.toFixed(6)} * dot(vec2(${w.dx.toFixed(4)}, ${w.dz.toFixed(4)}), ${pExpr}) - uTime * ${(w.speed * k).toFixed(5)}) * ${w.amp.toFixed(4)} * ${ampExpr};\n`;
  }
  return src;
}

const WATER_VERT = /* glsl */ `
uniform float uTime;
uniform float uWaveScale;
uniform float uDepthDamp;   // how strongly shallow water flattens the waves
uniform sampler2D uHeightTex;
uniform vec2 uWorldToUv;
uniform vec3 uPlaneOffset;  // plane centre in world space

varying vec3 vWorld;
varying vec2 vMapUv;
varying float vWaveY;
varying vec3 vNormalW;
varying float vDepth;

void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec3 p = wp.xyz;
  vec2 mapUv = p.xz * uWorldToUv + vec2(0.5);
  vec4 hSample = texture2D(uHeightTex, mapUv);
  float terrainH = hSample.r;
  float depth = max(0.0, -terrainH);
  float damp = clamp(depth / 2.2, 0.0, 1.0);
  damp = mix(1.0, damp, uDepthDamp);
  float amp = uWaveScale * damp;

  float waveY = 0.0;
${glslWaveSum('waveY', 'amp', 'p.xz')}
  p.y += waveY;

  // Analytic normal from the wave field.
  vec2 grad = vec2(0.0);
  {
    float yx1 = 0.0; vec2 px1 = p.xz + vec2(0.6, 0.0);
${glslWaveSum('yx1', 'amp', 'px1')}
    float yz1 = 0.0; vec2 pz1 = p.xz + vec2(0.0, 0.6);
${glslWaveSum('yz1', 'amp', 'pz1')}
    grad = vec2(yx1 - waveY, yz1 - waveY) / 0.6;
  }
  vec3 nrm = normalize(vec3(-grad.x, 1.0, -grad.y));

  vWorld = p;
  vMapUv = mapUv;
  vWaveY = waveY;
  vNormalW = nrm;
  vDepth = depth;

  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}
`;

const WATER_FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uHorizonColor;
uniform vec3 uShallowColor;
uniform vec3 uDeepColor;
uniform vec3 uFoamColor;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uCameraPos;
uniform float uRain;
uniform float uUnderwater;
uniform float uTurbidity;
uniform float uShoreFade;
uniform float uOpacity;

varying vec3 vWorld;
varying vec2 vMapUv;
varying float vWaveY;
varying vec3 vNormalW;
varying float vDepth;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 viewDir = normalize(uCameraPos - vWorld);
  vec3 nrm = normalize(vNormalW);

  // --- fine ripple detail (normal perturbation only, cheap)
  vec2 rp = vWorld.xz * 0.9;
  float n1 = fbm(rp + vec2(uTime * 0.22, uTime * 0.13));
  float n2 = fbm(rp * 1.7 - vec2(uTime * 0.17, uTime * 0.31));
  vec2 ripple = (vec2(n1, n2) - 0.5) * 0.42;
  // rain pockmarks
  float rainRipple = 0.0;
  if (uRain > 0.01) {
    vec2 cell = floor(vWorld.xz * 2.3);
    float ph = hash(cell) * 6.2831;
    float t = fract(uTime * 1.7 + hash(cell + 7.3));
    rainRipple = sin(t * 12.566) * (1.0 - t) * uRain;
    ripple += vec2(cos(ph), sin(ph)) * rainRipple * 0.28;
  }
  nrm = normalize(nrm + vec3(-ripple.x, 0.0, -ripple.y));

  // --- water body colour
  float depthK = clamp(vDepth / 14.0, 0.0, 1.0);
  vec3 body = mix(uShallowColor, uDeepColor, pow(depthK, 0.65));
  body = mix(body, uDeepColor * 0.72, clamp(vDepth / 55.0, 0.0, 1.0));

  // --- sky reflection (fresnel). Kept under full strength so the surface does
  //     not turn into a mirror of the pale horizon at grazing angles.
  float fres = pow(1.0 - clamp(dot(nrm, viewDir), 0.0, 1.0), 4.0);
  fres = clamp(0.02 + fres * 0.72, 0.0, 1.0);
  vec3 skyRefl = mix(uHorizonColor, uSkyColor, clamp(nrm.y, 0.0, 1.0)) * 0.9;
  vec3 col = mix(body, skyRefl, fres * (1.0 - uUnderwater));

  // --- sun specular
  vec3 h = normalize(uSunDir + viewDir);
  float spec = pow(max(dot(nrm, h), 0.0), 220.0);
  float glitter = pow(max(dot(nrm, h), 0.0), 34.0) * 0.18;
  col += uSunColor * (spec * 1.5 + glitter) * (1.0 - uUnderwater);

  // --- subsurface glow in shallow, sunlit water
  float sss = clamp(1.0 - depthK, 0.0, 1.0) * clamp(dot(nrm, uSunDir) * 0.5 + 0.5, 0.0, 1.0);
  col += uShallowColor * sss * 0.16;

  // --- shoreline foam
  float shore = 1.0 - smoothstep(0.0, 1.35, vDepth);
  float foamNoise = fbm(vWorld.xz * 0.55 + vec2(uTime * 0.14, -uTime * 0.1));
  float crest = smoothstep(0.55, 0.95, (vWaveY / 0.5) + 0.5);
  float foam = clamp(shore * (0.35 + foamNoise * 0.9) + crest * 0.14 * (1.0 - depthK), 0.0, 1.0);
  foam *= uShoreFade;
  col = mix(col, uFoamColor, foam * 0.85);

  // --- suspended matter / murk underwater
  col = mix(col, body * 0.55, uTurbidity * 0.5);

  // --- distance fade into the scene fog
  float dist = length(uCameraPos - vWorld);
  float fogF = clamp((dist - uFogNear) / max(0.001, uFogFar - uFogNear), 0.0, 1.0);
  fogF = pow(fogF, 1.35);
  col = mix(col, uFogColor, fogF);

  float alpha = mix(clamp(uOpacity + shore * 0.35 + (1.0 - depthK) * 0.25, 0.0, 1.0), 1.0, fogF * 0.9);
  alpha = mix(alpha, 0.88, uUnderwater);

  gl_FragColor = vec4(col, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const FAR_FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uDeepColor;
uniform vec3 uFogColor;
uniform vec3 uCameraPos;
uniform float uFogNear;
uniform float uFogFar;
varying vec3 vWorld;
void main() {
  float dist = length(uCameraPos - vWorld);
  float fogF = clamp((dist - uFogNear * 0.5) / max(0.001, uFogFar - uFogNear * 0.5), 0.0, 1.0);
  vec3 col = mix(uDeepColor, uFogColor, pow(fogF, 0.8));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const FAR_VERT = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export class Water {
  constructor(terrain, quality) {
    this.terrain = terrain;
    this.time = 0;
    this.waveScale = 1;
    this.group = new THREE.Group();
    this.group.name = 'water';
    this._underwater = false;
    this.nearSize = 760;
    this.uniforms = {
      uTime: { value: 0 },
      uWaveScale: { value: 1 },
      uDepthDamp: { value: 0.82 },
      uHeightTex: { value: terrain.heightTexture },
      uWorldToUv: { value: new THREE.Vector2(1 / WORLD.size, 1 / WORLD.size) },
      uPlaneOffset: { value: new THREE.Vector3() },
      uSunDir: { value: new THREE.Vector3(0.4, 0.6, 0.3).normalize() },
      uSunColor: { value: new THREE.Color(0xfff2d5) },
      uSkyColor: { value: new THREE.Color(0x6ea8d8) },
      uHorizonColor: { value: new THREE.Color(0xbfd8e8) },
      uShallowColor: { value: new THREE.Color(0x2f8fa3) },
      uDeepColor: { value: new THREE.Color(0x0b3550) },
      uFoamColor: { value: new THREE.Color(0xeaf6fb) },
      uFogColor: { value: new THREE.Color(0xa8c8dc) },
      uFogNear: { value: 60 },
      uFogFar: { value: 900 },
      uCameraPos: { value: new THREE.Vector3() },
      uRain: { value: 0 },
      uUnderwater: { value: 0 },
      uTurbidity: { value: 0.25 },
      uShoreFade: { value: 1 },
      uOpacity: { value: 0.72 },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: WATER_VERT,
      fragmentShader: WATER_FRAG,
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
      fog: false,
    });

    const seg = quality?.waterSegments || 180;
    this.nearGeo = new THREE.PlaneGeometry(this.nearSize, this.nearSize, seg, seg);
    this.nearGeo.rotateX(-Math.PI / 2);
    this.nearGeo.computeBoundingSphere();
    this.mesh = new THREE.Mesh(this.nearGeo, this.material);
    this.mesh.name = 'water-near';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 4;
    this.mesh.receiveShadow = false;
    this.group.add(this.mesh);

    // Far water: a cheap flat plane that reaches the horizon.
    this.farUniforms = {
      uDeepColor: { value: new THREE.Color(0x0b3550) },
      uFogColor: { value: new THREE.Color(0xa8c8dc) },
      uCameraPos: { value: new THREE.Vector3() },
      uFogNear: { value: 60 },
      uFogFar: { value: 900 },
    };
    this.farMaterial = new THREE.ShaderMaterial({
      uniforms: this.farUniforms,
      vertexShader: FAR_VERT,
      fragmentShader: FAR_FRAG,
      side: THREE.DoubleSide,
      depthWrite: true,
      fog: false,
    });
    this.farGeo = new THREE.PlaneGeometry(9000, 9000, 1, 1);
    this.farGeo.rotateX(-Math.PI / 2);
    this.farMesh = new THREE.Mesh(this.farGeo, this.farMaterial);
    this.farMesh.position.y = WATER_LEVEL - 0.35;
    this.farMesh.frustumCulled = false;
    this.farMesh.renderOrder = 3;
    this.group.add(this.farMesh);
  }

  /** Surface height including waves at a world point. */
  surfaceHeight(x, z) {
    const depth = this.terrain.depthAt(x, z);
    const damp = clamp(depth / 2.2, 0, 1) * this.uniforms.uDepthDamp.value + (1 - this.uniforms.uDepthDamp.value);
    return WATER_LEVEL + waveHeight(x, z, this.time, this.waveScale * clamp(damp, 0, 1));
  }

  /** Set the environment (sun, sky, fog, weather) each frame. */
  setEnvironment(env) {
    const u = this.uniforms;
    if (env.sunDir) u.uSunDir.value.copy(env.sunDir);
    if (env.sunColor) u.uSunColor.value.copy(env.sunColor).multiplyScalar(clamp(env.sunIntensity ?? 1, 0.05, 2));
    if (env.skyColor) u.uSkyColor.value.copy(env.skyColor);
    if (env.horizonColor) u.uHorizonColor.value.copy(env.horizonColor);
    if (env.fogColor) {
      u.uFogColor.value.copy(env.fogColor);
      this.farUniforms.uFogColor.value.copy(env.fogColor);
    }
    if (env.fogNear !== undefined) {
      u.uFogNear.value = env.fogNear;
      this.farUniforms.uFogNear.value = env.fogNear;
    }
    if (env.fogFar !== undefined) {
      u.uFogFar.value = env.fogFar;
      this.farUniforms.uFogFar.value = env.fogFar;
    }
    if (env.wind !== undefined) this.waveScale = lerp(0.55, 1.65, clamp01(env.wind));
    if (env.rain !== undefined) u.uRain.value = clamp01(env.rain);
    if (env.turbidity !== undefined) u.uTurbidity.value = clamp01(env.turbidity);
    if (env.shallowColor) u.uShallowColor.value.copy(env.shallowColor);
    if (env.deepColor) {
      u.uDeepColor.value.copy(env.deepColor);
      this.farUniforms.uDeepColor.value.copy(env.deepColor);
    }
  }

  /** Camera crossed the surface — swap to the underwater look. */
  setUnderwater(on) {
    this._underwater = on;
    this.uniforms.uUnderwater.value = on ? 1 : 0;
    this.uniforms.uShoreFade.value = on ? 0.35 : 1;
  }

  get underwater() {
    return this._underwater;
  }

  update(dt, camera) {
    this.time += dt;
    const u = this.uniforms;
    u.uTime.value = this.time;
    u.uWaveScale.value = this.waveScale;

    // Keep the high-detail water centred on the camera, snapped so the
    // wave field stays anchored in world space.
    const snap = 4;
    const cx = Math.round(camera.position.x / snap) * snap;
    const cz = Math.round(camera.position.z / snap) * snap;
    this.mesh.position.set(cx, WATER_LEVEL, cz);
    this.farMesh.position.set(cx, WATER_LEVEL - 0.35, cz);
    u.uPlaneOffset.value.set(cx, WATER_LEVEL, cz);
    u.uCameraPos.value.copy(camera.position);
    this.farUniforms.uCameraPos.value.copy(camera.position);

    const below = camera.position.y < this.surfaceHeight(camera.position.x, camera.position.z) - 0.02;
    if (below !== this._underwater) this.setUnderwater(below);
  }

  setQuality(quality) {
    const seg = quality?.waterSegments || 180;
    if (this.nearGeo.parameters.widthSegments === seg) return;
    this.nearGeo.dispose();
    this.nearGeo = new THREE.PlaneGeometry(this.nearSize, this.nearSize, seg, seg);
    this.nearGeo.rotateX(-Math.PI / 2);
    this.nearGeo.computeBoundingSphere();
    this.mesh.geometry = this.nearGeo;
  }

  dispose() {
    this.nearGeo.dispose();
    this.farGeo.dispose();
    this.material.dispose();
    this.farMaterial.dispose();
    this.group.clear();
  }
}
