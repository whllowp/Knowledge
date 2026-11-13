/**
 * merge.js — collapse static, material-sharing meshes into single draw calls.
 *
 * The world is built from many small prop meshes (fences, crates, lanterns…).
 * Each one is a draw call plus its own uniform uploads, which dominated the
 * profile (~62% of samples in draw submission). Props never move, so they can
 * be baked into one geometry per material.
 */
import * as THREE from 'three';
import { flag } from './flags.js';

/**
 * Merge a list of already-normalised geometries (position/normal/uv + index)
 * into one indexed geometry. Small replacement for three's BufferGeometryUtils
 * addon, which otherwise drags a whole utility module into the bundle.
 */
export function mergeGeometriesSimple(geos) {
  if (!geos.length) return null;
  if (geos.length === 1) return geos[0];
  let total = 0;
  let idxLen = 0;
  for (const g of geos) {
    total += g.attributes.position.count;
    idxLen += g.index ? g.index.count : g.attributes.position.count;
  }
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  const idx = total > 65535 ? new Uint32Array(idxLen) : new Uint16Array(idxLen);
  let off = 0;
  let w = 0;
  for (const g of geos) {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array.subarray(0, n * 3), off * 3);
    nor.set(g.attributes.normal.array.subarray(0, n * 3), off * 3);
    uv.set(g.attributes.uv.array.subarray(0, n * 2), off * 2);
    if (g.index) {
      const src = g.index.array;
      for (let i = 0; i < src.length; i++) idx[w++] = src[i] + off;
    } else {
      for (let i = 0; i < n; i++) idx[w++] = off + i;
    }
    off += n;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeBoundingSphere();
  out.computeBoundingBox();
  return out;
}

/** A/B switch so the merge can be benchmarked with ?merge=0. */
export function mergeEnabled() {
  // production compiles the switch away entirely (see flags.js)
  return flag('merge', '1') !== '0';
}

/**
 * Merge every static mesh under `root` that shares a material.
 * Meshes with morph targets, instancing, arrays of materials or skinning are
 * left alone. Returns the number of draw calls saved.
 */
export function mergeStaticMeshes(root, { minCount = 3, maxGroups = 96, cellSize = 0 } = {}) {
  if (!root) return 0;
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();

  const buckets = new Map();
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) return;
    if (Array.isArray(o.material) || !o.material) return;
    if (o.geometry.morphAttributes && Object.keys(o.geometry.morphAttributes).length) return;
    if (o.userData && o.userData.noMerge) return;
    // Bucket by material AND by spatial cell: a single island-wide mesh cannot
    // be frustum-culled, which costs more than the draw call saves.
    let cell = '';
    if (cellSize > 0) {
      const p = o.getWorldPosition(new THREE.Vector3());
      cell = `${Math.floor(p.x / cellSize)},${Math.floor(p.z / cellSize)}|`;
    }
    const k = `${cell}${o.material.uuid}|${o.castShadow ? 1 : 0}|${o.receiveShadow ? 1 : 0}|${o.renderOrder || 0}`;
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(o);
  });

  let saved = 0;
  let groupsDone = 0;
  for (const list of buckets.values()) {
    if (list.length < minCount || groupsDone >= maxGroups) continue;
    const parts = [];
    let ok = true;
    for (const m of list) {
      let g;
      try {
        g = m.geometry.clone();
      } catch {
        ok = false;
        break;
      }
      const n = g.attributes.position ? g.attributes.position.count : 0;
      if (!n) {
        ok = false;
        break;
      }
      if (!g.attributes.normal) g.computeVertexNormals();
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
      const rel = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
      g.applyMatrix4(rel);
      parts.push(g);
    }
    if (!ok || parts.length < minCount) continue;

    const total = parts.reduce((s, g) => s + g.attributes.position.count, 0);
    const pos = new Float32Array(total * 3);
    const nor = new Float32Array(total * 3);
    const uv = new Float32Array(total * 2);
    let off = 0;
    let idxLen = 0;
    for (const g of parts) {
      const n = g.attributes.position.count;
      pos.set(g.attributes.position.array.subarray(0, n * 3), off * 3);
      nor.set(g.attributes.normal.array.subarray(0, n * 3), off * 3);
      uv.set(g.attributes.uv.array.subarray(0, n * 2), off * 2);
      idxLen += g.index ? g.index.count : n;
      off += n;
    }
    // Rebuild the index. Dropping it (non-indexed) triples vertex-shader work,
    // which made an earlier version of this merge slower than no merge at all.
    const idx = total > 65535 ? new Uint32Array(idxLen) : new Uint16Array(idxLen);
    let base = 0;
    let w = 0;
    for (const g of parts) {
      const n = g.attributes.position.count;
      if (g.index) {
        const src = g.index.array;
        for (let i = 0; i < src.length; i++) idx[w++] = src[i] + base;
      } else {
        for (let i = 0; i < n; i++) idx[w++] = base + i;
      }
      base += n;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeBoundingSphere();
    geo.computeBoundingBox();

    const mesh = new THREE.Mesh(geo, list[0].material);
    mesh.castShadow = list[0].castShadow;
    mesh.receiveShadow = list[0].receiveShadow;
    mesh.renderOrder = list[0].renderOrder || 0;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    mesh.name = `merged-${groupsDone}`;
    root.add(mesh);

    for (const m of list) {
      m.parent?.remove(m);
      // geometries are shared between props, so only dispose the clones we made
      if (m.geometry.__disposableClone) m.geometry.dispose();
    }
    saved += list.length - 1;
    groupsDone++;
  }
  return saved;
}
