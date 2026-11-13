/**
 * engine.js — WebGL renderer, scene/camera plumbing, quality tiers and resize.
 *
 * Everything that touches raw WebGL/three renderer state lives here so the
 * rest of the game can stay declarative. Quality tiers keep the frame cheap
 * on integrated GPUs and bound GPU/CPU memory well under the 800 MB budget.
 */
import * as THREE from 'three';
import { Emitter, clamp } from './util.js';
import { optOn } from './flags.js';

export const QUALITY = {
  low: {
    name: 'low',
    label: '流畅',
    pixelRatioCap: 0.85,
    renderScale: 0.8,
    shadows: false,
    shadowMapSize: 1024,
    shadowDistance: 90,
    drawDistance: 620,
    fogNear: 0.35,
    vegetationScale: 0.45,
    waterSegments: 96,
    terrainSegments: 160,
    maxFish: 40,
    particles: 0.4,
    anisotropy: 1,
    postFx: false,
  },
  medium: {
    name: 'medium',
    label: '均衡',
    pixelRatioCap: 1.15,
    renderScale: 1,
    shadows: true,
    shadowMapSize: 1024,
    shadowDistance: 130,
    drawDistance: 900,
    fogNear: 0.4,
    vegetationScale: 0.62,
    waterSegments: 160,
    terrainSegments: 192,
    maxFish: 80,
    particles: 0.7,
    anisotropy: 2,
    postFx: false,
  },
  high: {
    name: 'high',
    label: '精细',
    pixelRatioCap: 1.5,
    renderScale: 1,
    shadows: true,
    shadowMapSize: 1280,
    shadowDistance: 160,
    drawDistance: 1300,
    fogNear: 0.45,
    vegetationScale: 0.8,
    waterSegments: 192,
    terrainSegments: 224,
    maxFish: 120,
    particles: 0.9,
    anisotropy: 4,
    postFx: false,
  },
};

export class Engine extends Emitter {
  constructor(container, opts = {}) {
    super();
    this.container = container || document.body;
    this.quality = QUALITY[opts.quality] || QUALITY.high;
    this._renderScale = clamp(opts.renderScale ?? 1, 0.5, 1.5);
    this.width = 1;
    this.height = 1;
    this._rafId = 0;
    this._disposed = false;

    const canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    this.canvas = canvas;
    this.container.appendChild(canvas);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: this.quality.name !== 'low',
        alpha: false,
        stencil: false,
        depth: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      });
    } catch (err) {
      console.error('[engine] WebGLRenderer creation failed', err);
      throw err;
    }
    this.renderer = renderer;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = this.quality.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._shadowCadence = optOn();
    renderer.shadowMap.autoUpdate = !this._shadowCadence;
    renderer.shadowMap.needsUpdate = true;
    renderer.setClearColor(0x8fb8cc, 1);
    renderer.info.autoReset = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(opts.fov ?? 72, 1, 0.12, this.quality.drawDistance);
    this.camera.position.set(0, 6, 0);
    this.scene.add(this.camera);

    // Groups keep the graph tidy and let systems be toggled wholesale.
    this.worldGroup = new THREE.Group();
    this.worldGroup.name = 'world';
    this.dynamicGroup = new THREE.Group();
    this.dynamicGroup.name = 'dynamic';
    this.effectsGroup = new THREE.Group();
    this.effectsGroup.name = 'effects';
    this.scene.add(this.worldGroup, this.dynamicGroup, this.effectsGroup);

    this.clock = new THREE.Clock();
    this.frame = 0;

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    window.addEventListener('orientationchange', this._onResize);

    this.resize();
  }

  /** Apply a quality tier (called when the player changes settings). */
  setQuality(name) {
    const q = QUALITY[name];
    if (!q || q === this.quality) return this.quality;
    this.quality = q;
    this.renderer.shadowMap.enabled = q.shadows;
    this.renderer.shadowMap.needsUpdate = true;
    this.camera.far = q.drawDistance;
    this.camera.updateProjectionMatrix();
    this.resize();
    this.emit('quality', q);
    return q;
  }

  setRenderScale(s) {
    this._renderScale = clamp(s, 0.5, 1.5);
    this.resize();
  }

  setFov(fov) {
    this.camera.fov = clamp(fov, 55, 100);
    this.camera.updateProjectionMatrix();
  }

  /** Device pixel ratio actually used for the backing store. */
  get effectivePixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    const cap = Math.min(dpr, this.quality.pixelRatioCap) * this._renderScale;
    return clamp(cap, 0.5, 2);
  }

  resize() {
    const w = Math.max(1, this.container.clientWidth || window.innerWidth);
    const h = Math.max(1, this.container.clientHeight || window.innerHeight);
    this.width = w;
    this.height = h;
    this.renderer.setPixelRatio(this.effectivePixelRatio);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.emit('resize', { width: w, height: h });
  }

  /** Render one frame; resets per-frame info counters. */
  render() {
    if (this._disposed) return;
    this.renderer.info.reset();
    // Shadows are re-rendered every 3rd frame instead of every frame: the sun
    // moves slowly enough that the lag is invisible, and it removes ~2/3 of the
    // shadow pass from the main thread (v6.1.0).
    if (this._shadowCadence && this.renderer.shadowMap.enabled && this.renderer.shadowMap.autoUpdate === false) {
      this.renderer.shadowMap.needsUpdate = this.frame % 3 === 0;
    }
    this.renderer.render(this.scene, this.camera);
    this.frame++;
  }

  get info() {
    return this.renderer.info;
  }

  /** Approximate GPU/CPU resource footprint used by the performance HUD. */
  resourceStats() {
    const info = this.renderer.info;
    return {
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs ? info.programs.length : 0,
      calls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
    };
  }

  dispose() {
    this._disposed = true;
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onResize);
    cancelAnimationFrame(this._rafId);
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose?.();
      const mat = obj.material;
      if (Array.isArray(mat)) mat.forEach((m) => this._disposeMaterial(m));
      else if (mat) this._disposeMaterial(mat);
    });
    this.renderer.dispose();
    this.canvas.remove();
    this.clear();
  }

  _disposeMaterial(mat) {
    if (!mat) return;
    for (const key of Object.keys(mat)) {
      const v = mat[key];
      if (v && v.isTexture) v.dispose();
    }
    mat.dispose?.();
  }
}
