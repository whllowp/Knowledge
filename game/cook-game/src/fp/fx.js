// GPU point particles for steam, smoke, food bits and confetti.
// One draw call per field, pooled CPU-side.

import * as THREE from '../three.js';

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (340.0 / max(0.1, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.12, d) * vAlpha;
    if (a < 0.005) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

export class ParticleField {
  constructor(scene, { additive = false, max = 180, order = 5 } = {}) {
    this.max = max;
    this.cursor = 0;
    this.additive = additive;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.size = new Float32Array(max);
    this.alpha = new Float32Array(max);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.gravity = new Float32Array(max);
    this.drag = new Float32Array(max);

    for (let i = 0; i < max; i++) {
      this.pos[i * 3 + 1] = -50;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1));
    this.geo = geo;

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = order;
    scene.add(this.points);
  }

  spawn({ x = 0, y = 1, z = 0, vx = 0, vy = 0.4, vz = 0, color = 0xffffff, size = 0.12, life = 1, gravity = 0, drag = 0.2 }) {
    const i = this.cursor;
    this.cursor = (this.cursor + 1) % this.max;
    const c = new THREE.Color(color);
    this.pos[i * 3] = x;
    this.pos[i * 3 + 1] = y;
    this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx;
    this.vel[i * 3 + 1] = vy;
    this.vel[i * 3 + 2] = vz;
    this.col[i * 3] = c.r;
    this.col[i * 3 + 1] = c.g;
    this.col[i * 3 + 2] = c.b;
    this.size[i] = size;
    this.alpha[i] = 0;
    this.life[i] = life;
    this.maxLife[i] = life;
    this.gravity[i] = gravity;
    this.drag[i] = drag;
    return i;
  }

  update(dt) {
    const { pos, vel, life, maxLife, alpha, size, gravity, drag } = this;
    for (let i = 0; i < this.max; i++) {
      if (life[i] <= 0) continue;
      life[i] -= dt;
      if (life[i] <= 0) {
        alpha[i] = 0;
        pos[i * 3 + 1] = -50;
        continue;
      }
      const v = i * 3;
      vel[v + 1] += gravity[i] * dt;
      const damp = Math.max(0, 1 - drag[i] * dt);
      vel[v] *= damp;
      vel[v + 2] *= damp;
      pos[v] += vel[v] * dt;
      pos[v + 1] += vel[v + 1] * dt;
      pos[v + 2] += vel[v + 2] * dt;
      const age = maxLife[i] - life[i];
      const fadeIn = Math.min(1, age / 0.12);
      const fadeOut = Math.min(1, life[i] / (maxLife[i] * 0.45));
      alpha[i] = fadeIn * fadeOut;
      size[i] += dt * 0.02;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aColor.needsUpdate = true;
    this.geo.attributes.aSize.needsUpdate = true;
    this.geo.attributes.aAlpha.needsUpdate = true;
  }

  dispose() {
    this.points.parent?.remove(this.points);
    this.geo.dispose();
    this.points.material.dispose();
  }
}

/** Spawn a burst of chopped food bits. */
export function spawnBits(field, position, color, count = 5) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 0.6 + Math.random() * 1.2;
    field.spawn({
      x: position.x + (Math.random() - 0.5) * 0.15,
      y: position.y + 0.03,
      z: position.z + (Math.random() - 0.5) * 0.15,
      vx: Math.cos(a) * sp,
      vy: 0.9 + Math.random() * 1.1,
      vz: Math.sin(a) * sp,
      color,
      size: 0.045 + Math.random() * 0.03,
      life: 0.5 + Math.random() * 0.35,
      gravity: -7.5,
      drag: 0.6,
    });
  }
}

export function spawnSteam(field, position, strength = 1) {
  field.spawn({
    x: position.x + (Math.random() - 0.5) * 0.2,
    y: position.y + 0.02,
    z: position.z + (Math.random() - 0.5) * 0.2,
    vx: (Math.random() - 0.5) * 0.1,
    vy: 0.26 + Math.random() * 0.22,
    vz: (Math.random() - 0.5) * 0.1,
    color: 0xffd8ae,
    size: (0.065 + Math.random() * 0.045) * strength,
    life: 0.85 + Math.random() * 0.55,
    gravity: 0.1,
    drag: 0.5,
  });
}

export function spawnSmoke(field, position) {
  field.spawn({
    x: position.x + (Math.random() - 0.5) * 0.2,
    y: position.y + 0.02,
    z: position.z + (Math.random() - 0.5) * 0.2,
    vx: (Math.random() - 0.5) * 0.28,
    vy: 0.3 + Math.random() * 0.3,
    vz: (Math.random() - 0.5) * 0.28,
    color: 0x3a332f,
    size: 0.13 + Math.random() * 0.1,
    life: 1.3 + Math.random() * 0.8,
    gravity: 0.15,
    drag: 0.25,
  });
}

export function spawnConfetti(field, position, count = 26) {
  const colors = [0xf6a623, 0xe8503a, 0x7ad0a3, 0xffe8c8, 0xff6f91, 0x6fc7ff];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 0.8 + Math.random() * 2.4;
    field.spawn({
      x: position.x + (Math.random() - 0.5) * 0.4,
      y: position.y + 0.1,
      z: position.z + (Math.random() - 0.5) * 0.3,
      vx: Math.cos(a) * sp,
      vy: 1.4 + Math.random() * 2.2,
      vz: Math.sin(a) * sp,
      color: colors[i % colors.length],
      size: 0.055 + Math.random() * 0.05,
      life: 0.9 + Math.random() * 0.8,
      gravity: -5.5,
      drag: 0.5,
    });
  }
}

export function spawnSparks(field, position, count = 6) {
  for (let i = 0; i < count; i++) {
    field.spawn({
      x: position.x + (Math.random() - 0.5) * 0.2,
      y: position.y,
      z: position.z + (Math.random() - 0.5) * 0.2,
      vx: (Math.random() - 0.5) * 0.9,
      vy: 0.7 + Math.random() * 0.8,
      vz: (Math.random() - 0.5) * 0.9,
      color: 0xffa040,
      size: 0.04,
      life: 0.35 + Math.random() * 0.3,
      gravity: -4,
      drag: 0.4,
    });
  }
}
