// Low-poly food built from primitives. Stylized, readable at a glance.

import * as THREE from 'three';
import { INGREDIENTS } from '../core/data.js';

const geoCache = new Map();
const matCache = new Map();

const geo = (key, make) => {
  if (!geoCache.has(key)) geoCache.set(key, make());
  return geoCache.get(key);
};

const mat = (color, opts = {}) => {
  const key = `${color}|${JSON.stringify(opts)}`;
  if (!matCache.has(key)) {
    matCache.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness: opts.roughness ?? 0.62,
        metalness: opts.metalness ?? 0.02,
        flatShading: opts.flat ?? false,
        emissive: opts.emissive ?? 0x000000,
        emissiveIntensity: opts.emissiveIntensity ?? 0,
      }),
    );
  }
  return matCache.get(key);
};

const C = {
  bun: 0xe2aa5d,
  pattyRaw: 0xb45a44,
  pattyCooked: 0x733523,
  pattyBurnt: 0x241713,
  cheese: 0xf3c845,
  lettuce: 0x6fbf4a,
  tomato: 0xd94a3a,
  onion: 0xc9a0d8,
  plate: 0xf3ede2,
  stem: 0x4f8a35,
};

function meshOf(geometry, material) {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function makePatty(state, cookFrac) {
  const g = new THREE.Group();
  const color = state === 'burnt' ? C.pattyBurnt : state === 'cooked' ? C.pattyCooked : C.pattyRaw;
  const body = meshOf(geo('patty', () => new THREE.CylinderGeometry(0.13, 0.133, 0.045, 20)), mat(color, { roughness: 0.5 }));
  if (state === 'raw' && cookFrac > 0) {
    const c = new THREE.Color(C.pattyRaw).lerp(new THREE.Color(C.pattyCooked), Math.min(1, cookFrac));
    body.material = new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 });
  }
  g.add(body);
  if (state === 'cooked') {
    const mark = meshOf(geo('pattyMark', () => new THREE.BoxGeometry(0.18, 0.004, 0.02)), mat(0x4a2115, { roughness: 0.9 }));
    mark.position.y = 0.024;
    mark.rotation.y = 0.5;
    g.add(mark);
  }
  return g;
}

function makeBun() {
  const g = new THREE.Group();
  const body = meshOf(geo('bun', () => new THREE.SphereGeometry(0.13, 18, 12)), mat(C.bun, { roughness: 0.72 }));
  body.scale.set(1, 0.6, 1);
  g.add(body);
  for (let i = 0; i < 3; i++) {
    const seed = meshOf(geo('seed', () => new THREE.SphereGeometry(0.012, 6, 4)), mat(0xf4dca0, { roughness: 0.8 }));
    const a = (i / 3) * Math.PI * 2;
    seed.position.set(Math.cos(a) * 0.055, 0.06, Math.sin(a) * 0.055);
    g.add(seed);
  }
  return g;
}

function makeCheese() {
  const g = new THREE.Group();
  const body = meshOf(geo('cheese', () => new THREE.BoxGeometry(0.19, 0.018, 0.19)), mat(C.cheese, { roughness: 0.4 }));
  body.rotation.y = 0.22;
  g.add(body);
  return g;
}

function makeLettuce(chopped) {
  const g = new THREE.Group();
  if (!chopped) {
    const body = meshOf(geo('lettuce', () => new THREE.IcosahedronGeometry(0.115, 0)), mat(C.lettuce, { roughness: 0.75, flat: true }));
    body.scale.set(1.18, 0.72, 1.12);
    g.add(body);
  } else {
    for (let i = 0; i < 7; i++) {
      const piece = meshOf(geo('lettuceBit', () => new THREE.TetrahedronGeometry(0.038, 0)), mat(i % 2 ? 0x5ea83f : C.lettuce, { flat: true, roughness: 0.8 }));
      piece.position.set((Math.random() - 0.5) * 0.15, 0.012 + Math.random() * 0.02, (Math.random() - 0.5) * 0.15);
      piece.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      g.add(piece);
    }
  }
  return g;
}

function makeTomato(chopped) {
  const g = new THREE.Group();
  if (!chopped) {
    const body = meshOf(geo('tomato', () => new THREE.SphereGeometry(0.1, 16, 12)), mat(C.tomato, { roughness: 0.45 }));
    body.scale.set(1, 0.9, 1);
    g.add(body);
    const stem = meshOf(geo('stem', () => new THREE.CylinderGeometry(0.012, 0.02, 0.035, 5)), mat(C.stem, { roughness: 0.9 }));
    stem.position.y = 0.095;
    g.add(stem);
  } else {
    for (let i = 0; i < 8; i++) {
      const piece = meshOf(geo('tomatoBit', () => new THREE.BoxGeometry(0.045, 0.035, 0.045)), mat(i % 2 ? C.tomato : 0xc7402f, { roughness: 0.55 }));
      piece.position.set((Math.random() - 0.5) * 0.14, 0.014 + Math.random() * 0.015, (Math.random() - 0.5) * 0.14);
      piece.rotation.y = Math.random() * 3;
      g.add(piece);
    }
  }
  return g;
}

function makeOnion(chopped) {
  const g = new THREE.Group();
  if (!chopped) {
    const body = meshOf(geo('onion', () => new THREE.SphereGeometry(0.105, 16, 12)), mat(C.onion, { roughness: 0.62 }));
    body.scale.set(1, 0.88, 1);
    g.add(body);
    const tip = meshOf(geo('onionTip', () => new THREE.ConeGeometry(0.03, 0.06, 6)), mat(0xb184c4, { roughness: 0.7 }));
    tip.position.y = 0.105;
    g.add(tip);
  } else {
    for (let i = 0; i < 6; i++) {
      const piece = meshOf(geo('onionBit', () => new THREE.TorusGeometry(0.036, 0.009, 4, 8, Math.PI * 1.4)), mat(i % 2 ? 0xd8b3e6 : C.onion, { roughness: 0.6 }));
      piece.position.set((Math.random() - 0.5) * 0.14, 0.014 + i * 0.004, (Math.random() - 0.5) * 0.14);
      piece.rotation.set(Math.PI / 2 + Math.random() * 0.4, Math.random() * 3, 0);
      g.add(piece);
    }
  }
  return g;
}

export function createIngredientMesh(ingredient, state = 'raw', cookFrac = 0) {
  switch (ingredient) {
    case 'bun':
      return makeBun();
    case 'patty':
      return makePatty(state, cookFrac);
    case 'cheese':
      return makeCheese();
    case 'lettuce':
      return makeLettuce(state === 'chopped');
    case 'tomato':
      return makeTomato(state === 'chopped');
    case 'onion':
      return makeOnion(state === 'chopped');
    default: {
      const g = new THREE.Group();
      g.add(meshOf(geo('unknown', () => new THREE.BoxGeometry(0.1, 0.1, 0.1)), mat(0x888888)));
      return g;
    }
  }
}

function createToppingMesh(topping) {
  const g = createIngredientMesh(topping.ingredient, topping.state);
  g.scale.setScalar(0.92);
  return g;
}

export function createPlateMesh(contents = []) {
  const g = new THREE.Group();
  const base = meshOf(geo('plateBase', () => new THREE.CylinderGeometry(0.215, 0.185, 0.016, 28)), mat(C.plate, { roughness: 0.35 }));
  base.position.y = 0.008;
  g.add(base);
  const rim = meshOf(geo('plateRim', () => new THREE.TorusGeometry(0.205, 0.012, 6, 30)), mat(C.plate, { roughness: 0.35 }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.02;
  g.add(rim);

  // The bun reads best as the top of the stack; the recipe treats it as a
  // topping like any other, so this is presentation only.
  const ordered = [...contents].sort((a, b) => (a.ingredient === 'bun' ? 1 : 0) - (b.ingredient === 'bun' ? 1 : 0));
  let y = 0.022;
  const step = ordered.length > 3 ? 0.028 : 0.04;
  ordered.forEach((topping, i) => {
    const piece = createToppingMesh(topping);
    piece.position.y = y;
    piece.rotation.y = (i * 1.7) % (Math.PI * 2);
    piece.position.x = (Math.random() - 0.5) * 0.012;
    piece.position.z = (Math.random() - 0.5) * 0.012;
    g.add(piece);
    y += step;
  });
  return g;
}

/** Build the visual for a carried/placed item (ingredient or plate). */
export function createItemMesh(item, cookFrac = 0) {
  if (!item) return new THREE.Group();
  if (item.type === 'plate') {
    return createPlateMesh(item.contents);
  }
  return createIngredientMesh(item.ingredient, item.state, cookFrac);
}

export function createIngredientProp(ingredient, count = 3) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const mesh = createIngredientMesh(ingredient, 'raw');
    mesh.scale.setScalar(0.8);
    const a = (i / count) * Math.PI * 2 + 0.4;
    mesh.position.set(Math.cos(a) * 0.14, i === 2 ? 0.05 : 0, Math.sin(a) * 0.1);
    mesh.rotation.y = Math.random() * 3;
    g.add(mesh);
  }
  return g;
}

export const INGREDIENT_COLORS = {
  bun: C.bun,
  patty: C.pattyCooked,
  cheese: C.cheese,
  lettuce: C.lettuce,
  tomato: C.tomato,
  onion: C.onion,
};

export function toppingColor(topping) {
  if (!topping) return 0xffffff;
  if (topping.state === 'burnt') return C.pattyBurnt;
  return INGREDIENT_COLORS[topping.ingredient] || 0xffffff;
}

export { INGREDIENTS };
