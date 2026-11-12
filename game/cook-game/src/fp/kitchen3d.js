// The physical 3D kitchen: room, counters, stations, props, lights, labels.
// Every station keeps its own visual state and syncs from the shared Kitchen.

import * as THREE from 'three';
import { STATIONS, ROOM, INGREDIENTS } from '../core/data.js';
import { createItemMesh, createIngredientProp } from './items3d.js';
import * as T from './textures.js';

const COUNTER_H = 0.92;

const box = (w, h, d, material, x = 0, y = 0, z = 0) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

const cyl = (rt, rb, h, material, seg = 20) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

function nightWindowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 320);
  g.addColorStop(0, '#0b1426');
  g.addColorStop(0.55, '#243554');
  g.addColorStop(1, '#5a3a2c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 320);
  // moon
  ctx.fillStyle = 'rgba(255,240,210,0.9)';
  ctx.beginPath();
  ctx.arc(390, 70, 26, 0, Math.PI * 2);
  ctx.fill();
  // skyline
  ctx.fillStyle = '#0d111b';
  let x = 0;
  while (x < 512) {
    const w = 18 + Math.random() * 42;
    const h = 70 + Math.random() * 120;
    ctx.fillRect(x, 320 - h, w, h);
    for (let wy = 320 - h + 10; wy < 300; wy += 18) {
      for (let wx = x + 6; wx < x + w - 6; wx += 12) {
        if (Math.random() > 0.55) {
          ctx.fillStyle = `rgba(255,${180 + Math.random() * 60},120,${0.35 + Math.random() * 0.5})`;
          ctx.fillRect(wx, wy, 4, 5);
          ctx.fillStyle = '#0d111b';
        }
      }
    }
    x += w + 4;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Kitchen3D {
  constructor(scene) {
    this.scene = scene;
    this.time = 0;
    this.stationVisuals = new Map();
    this._labelTimer = 0;
    this._makeMaterials();
    this._buildRoom();
    this._buildCounters();
    this._buildStations();
    this._buildDecor();
  }

  _makeMaterials() {
    const floorMap = T.makeFloorTexture();
    const wallMap = T.makeWallTexture();
    const woodMap = T.makeWoodTexture();
    const tileMap = T.makeTileTexture();
    const steelMap = T.makeSteelTexture();

    this.mats = {
      floor: new THREE.MeshStandardMaterial({ map: floorMap, roughness: 0.72, metalness: 0.02 }),
      wall: new THREE.MeshStandardMaterial({ map: wallMap, roughness: 0.88, metalness: 0 }),
      tile: new THREE.MeshStandardMaterial({ map: tileMap, roughness: 0.42, metalness: 0.1 }),
      wood: new THREE.MeshStandardMaterial({ map: woodMap, roughness: 0.58, metalness: 0.02 }),
      boardWood: new THREE.MeshStandardMaterial({ map: woodMap, color: 0xe0b98a, roughness: 0.5, metalness: 0.01 }),
      islandBody: new THREE.MeshStandardMaterial({ color: 0x2d4b3f, roughness: 0.62, metalness: 0.04 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x5c3a22, roughness: 0.65 }),
      woodLight: new THREE.MeshStandardMaterial({ color: 0xb98552, roughness: 0.55 }),
      steel: new THREE.MeshStandardMaterial({ map: steelMap, color: 0xb9c2c7, metalness: 0.82, roughness: 0.32 }),
      steelDark: new THREE.MeshStandardMaterial({ color: 0x333a3f, metalness: 0.72, roughness: 0.35 }),
      black: new THREE.MeshStandardMaterial({ color: 0x15181a, roughness: 0.55, metalness: 0.2 }),
      brass: new THREE.MeshStandardMaterial({ color: 0xc08a3e, metalness: 0.9, roughness: 0.28 }),
      cream: new THREE.MeshStandardMaterial({ color: 0xe8dcc4, roughness: 0.6 }),
      ceiling: new THREE.MeshStandardMaterial({ color: 0x241814, roughness: 0.95 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x0d0907, roughness: 0.9 }),
      fabric: new THREE.MeshStandardMaterial({ color: 0x7d2f24, roughness: 0.95 }),
      red: new THREE.MeshStandardMaterial({ color: 0xa83524, roughness: 0.7 }),
      paper: new THREE.MeshStandardMaterial({ color: 0xf2e2c4, roughness: 0.9 }),
      plant: new THREE.MeshStandardMaterial({ color: 0x3f7a3b, roughness: 0.85, flatShading: true }),
      bulb: new THREE.MeshBasicMaterial({ color: 0xffd9a0 }),
    };
  }

  _buildRoom() {
    const { scene, mats } = this;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10.2, 7.2), mats.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10.2, 7.2), mats.ceiling);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3.0;
    scene.add(ceiling);

    // ceiling beams
    for (let i = -1; i <= 1; i++) {
      const beam = box(10.2, 0.14, 0.18, mats.woodDark, 0, 2.89, i * 2.2);
      scene.add(beam);
    }

    // walls
    const side = (x) => {
      const wall = box(0.16, 3, 7.2, mats.wall, x, 1.5, 0);
      scene.add(wall);
      const band = box(0.05, 1.05, 7.05, mats.wall, x + (x > 0 ? -0.1 : 0.1), 0.525, 0);
      band.material = mats.wall;
      scene.add(band);
      const base = box(0.08, 0.12, 7.2, mats.woodDark, x + (x > 0 ? -0.09 : 0.09), 0.06, 0);
      scene.add(base);
    };
    side(-5.04);
    side(5.04);

    // front wall + door
    const front = box(10.2, 3, 0.16, mats.wall, 0, 1.5, 3.56);
    scene.add(front);
    const door = box(1.1, 2.15, 0.08, mats.woodDark, 2.2, 1.07, 3.45);
    scene.add(door);
    scene.add(box(1.28, 0.12, 0.12, mats.woodLight, 2.2, 2.18, 3.43));
    scene.add(box(0.28, 0.06, 0.04, mats.brass, 2.6, 1.0, 3.39));
    const exitSign = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.18),
      new THREE.MeshBasicMaterial({ color: 0x8ef0b1, transparent: true, opacity: 0.85 }),
    );
    exitSign.position.set(2.2, 2.45, 3.47);
    exitSign.rotation.y = Math.PI;
    scene.add(exitSign);

    // back wall with a serving window (x 2.4..4.8, y 1.05..2.1)
    scene.add(box(7.44, 3, 0.16, mats.wall, -1.32, 1.5, -3.56));
    scene.add(box(0.24, 3, 0.16, mats.wall, 4.92, 1.5, -3.56));
    scene.add(box(2.4, 0.9, 0.16, mats.wall, 3.6, 2.55, -3.56));
    scene.add(box(2.4, 1.05, 0.16, mats.wall, 3.6, 0.525, -3.56));

    // backsplash tiles behind the crates
    const splash = box(7.3, 1.24, 0.04, mats.tile, -1.28, 1.56, -3.47);
    scene.add(splash);
    // brass trim along the backsplash
    scene.add(box(7.3, 0.05, 0.07, mats.brass, -1.28, 2.2, -3.44));

    // window frame + dark recess + warm light
    const frameMat = mats.brass;
    scene.add(box(2.5, 0.08, 0.1, frameMat, 3.6, 2.1, -3.47));
    scene.add(box(2.5, 0.08, 0.1, frameMat, 3.6, 1.05, -3.47));
    scene.add(box(0.08, 1.1, 0.1, frameMat, 2.36, 1.575, -3.47));
    scene.add(box(0.08, 1.1, 0.1, frameMat, 4.84, 1.575, -3.47));
    // pass-through interior: a warm back wall, side panels, a shelf with
    // stacked plates and a heat lamp, so the window never reads as a black hole
    const innerBack = new THREE.Mesh(
      new THREE.PlaneGeometry(2.34, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x5a3520, roughness: 0.9, emissive: 0x2a1208, emissiveIntensity: 0.7 }),
    );
    innerBack.position.set(3.6, 1.575, -3.94);
    scene.add(innerBack);
    scene.add(box(0.05, 1.05, 0.42, mats.woodDark, 2.43, 1.575, -3.73));
    scene.add(box(0.05, 1.05, 0.42, mats.woodDark, 4.77, 1.575, -3.73));
    scene.add(box(2.34, 0.04, 0.42, mats.woodDark, 3.6, 2.08, -3.73));
    scene.add(box(2.34, 0.05, 0.42, mats.woodLight, 3.6, 1.07, -3.73));
    scene.add(box(2.25, 0.05, 0.36, mats.woodLight, 3.6, 1.3, -3.8));
    for (let i = 0; i < 4; i++) {
      const plate = cyl(0.14, 0.12, 0.02, mats.cream, 20);
      plate.position.set(2.85 + i * 0.48, 1.334, -3.8);
      scene.add(plate);
    }
    scene.add(box(2.25, 0.04, 0.3, mats.brass, 3.6, 1.96, -3.86));
    const passGlow = new THREE.PointLight(0xffa860, 11, 5, 2);
    passGlow.position.set(3.6, 1.95, -3.55);
    scene.add(passGlow);
    this.passGlow = passGlow;

    // hanging ticket rail above the window
    scene.add(box(2.5, 0.03, 0.03, mats.brass, 3.6, 2.24, -3.42));
    for (let i = 0; i < 3; i++) {
      const paper = box(0.28, 0.36, 0.012, mats.paper, 3.0 + i * 0.6, 2.06, -3.41);
      paper.rotation.z = (Math.random() - 0.5) * 0.12;
      scene.add(paper);
      scene.add(box(0.03, 0.06, 0.02, mats.brass, 3.0 + i * 0.6, 2.24, -3.4));
    }

    // window on the left wall
    const nightTex = nightWindowTexture();
    const night = new THREE.Mesh(
      new THREE.PlaneGeometry(2.16, 1.2),
      new THREE.MeshBasicMaterial({ map: nightTex }),
    );
    night.position.set(-4.955, 1.95, 1.5);
    night.rotation.y = Math.PI / 2;
    scene.add(night);
    // window frame around the night glass
    scene.add(box(0.08, 0.07, 2.36, mats.woodDark, -4.93, 2.59, 1.5));
    scene.add(box(0.08, 0.07, 2.36, mats.woodDark, -4.93, 1.31, 1.5));
    scene.add(box(0.08, 1.35, 0.07, mats.woodDark, -4.93, 1.95, 0.33));
    scene.add(box(0.08, 1.35, 0.07, mats.woodDark, -4.93, 1.95, 2.67));
    scene.add(box(0.07, 1.22, 0.06, mats.woodDark, -4.9, 1.95, 1.5));

    // rug in the walkway
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), mats.fabric);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0.4, 0.012, 2.45);
    rug.receiveShadow = true;
    scene.add(rug);
  }

  _counterRun(width, depth, x, z, topMaterial = null, bodyMaterial = null) {
    const g = new THREE.Group();
    const body = box(width - 0.08, COUNTER_H - 0.12, depth - 0.06, bodyMaterial || this.mats.wood, 0, (COUNTER_H - 0.12) / 2, 0);
    g.add(body);
    // vertical panel lines
    const panels = Math.max(2, Math.round(width / 0.9));
    for (let i = 0; i < panels; i++) {
      const px = -width / 2 + 0.08 + (i / panels) * (width - 0.16) + (width - 0.16) / panels / 2;
      const line = box(0.02, COUNTER_H - 0.3, depth - 0.05, this.mats.woodDark, px, (COUNTER_H - 0.12) / 2 + 0.03, 0.01);
      g.add(line);
    }
    const top = box(width, 0.06, depth, topMaterial || this.mats.woodLight, 0, COUNTER_H - 0.03, 0);
    g.add(top);
    const kick = box(width - 0.2, 0.1, depth - 0.2, this.mats.black, 0, 0.05, 0);
    g.add(kick);
    g.position.set(x, 0, z);
    this.scene.add(g);
    return g;
  }

  _buildCounters() {
    this._counterRun(7.3, 1.0, -1.28, -3.0);
    this._counterRun(2.4, 1.0, 3.6, -3.0, this.mats.steel);
    this._counterRun(7.6, 1.1, -0.15, 0.3, this.mats.steel, this.mats.islandBody);

    // prep sink on the island far side? small detail: towel + cutting board props
    const towel = box(0.34, 0.02, 0.24, this.mats.cream, 3.2, 0.955, 0.6);
    towel.rotation.y = 0.2;
    this.scene.add(towel);

    // chalkboard menu on the island front
    this.scene.add(box(1.38, 0.74, 0.035, this.mats.woodDark, -0.3, 0.58, 0.845));
    const menu = new THREE.Mesh(
      new THREE.PlaneGeometry(1.26, 0.64),
      new THREE.MeshBasicMaterial({ map: T.makeMenuBoardTexture() }),
    );
    menu.position.set(-0.3, 0.58, 0.866);
    this.scene.add(menu);

    // brass cabinet pulls on the island and back counter
    for (let i = 0; i < 8; i++) {
      const x = -3.55 + i * 0.95;
      if (x > -1.25 && x < 0.7) continue;
      this.scene.add(box(0.26, 0.032, 0.03, this.mats.brass, x, 0.68, 0.868));
    }
    for (let i = 0; i < 7; i++) {
      const x = -4.2 + i * 1.0;
      if (x > 2.1) break;
      this.scene.add(box(0.26, 0.032, 0.03, this.mats.brass, x, 0.68, -2.488));
    }

    // trash bin
    const bin = new THREE.Group();
    const body = cyl(0.32, 0.29, 0.78, this.mats.steelDark);
    body.position.y = 0.39;
    bin.add(body);
    const lid = cyl(0.335, 0.335, 0.05, this.mats.steel);
    lid.position.y = 0.8;
    bin.add(lid);
    const bag = cyl(0.27, 0.27, 0.03, this.mats.black);
    bag.position.y = 0.82;
    bin.add(bag);
    const pedal = box(0.16, 0.05, 0.08, this.mats.black, 0, 0.06, 0.34);
    bin.add(pedal);
    bin.position.set(4.35, 0, 2.55);
    this.scene.add(bin);
    this.trashBin = bin;
  }

  _makeLabel(title, y, scale = 1) {
    const tex = T.makeLabelTexture(title, '');
    const material = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.9 });
    const sprite = new THREE.Sprite(material);
    const baseW = 0.72 * scale;
    const baseH = 0.22 * scale;
    sprite.scale.set(baseW, baseH, 1);
    sprite.position.set(0, y, 0.06);
    return { sprite, tex, title, subtitle: '', baseW, baseH };
  }

  _setLabel(label, title, subtitle) {
    if (label.title === title && label.subtitle === subtitle) return;
    label.title = title;
    label.subtitle = subtitle;
    const tex = T.makeLabelTexture(title, subtitle);
    label.sprite.material.map.dispose();
    label.sprite.material.map = tex;
    label.sprite.material.needsUpdate = true;
    label.tex = tex;
  }

  _buildStations() {
    for (const def of STATIONS) {
      const group = new THREE.Group();
      group.position.set(def.x, 0, def.z);
      this.scene.add(group);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(
          Math.max(def.w, def.d) * 0.42,
          Math.max(def.w, def.d) * 0.47,
          40,
        ),
        new THREE.MeshBasicMaterial({
          color: 0xf6a623,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.948;
      ring.visible = false;
      group.add(ring);

      const visual = {
        def,
        group,
        ring,
        itemRoot: null,
        itemAnchor: new THREE.Vector3(0, 0.96, 0),
        label: null,
        burner: null,
        pan: null,
        stoveLight: null,
        lastSig: '',
        fxAnchor: new THREE.Vector3(def.x, 1.15, def.z),
      };

      switch (def.kind) {
        case 'crate': {
          const crate = box(0.82, 0.42, 0.72, this.mats.wood, 0, 1.14, 0);
          group.add(crate);
          // slats on the side, front tag on the front face
          for (let i = 0; i < 3; i++) {
            const slat = box(0.84, 0.035, 0.03, this.mats.woodDark, 0, 1.0 + i * 0.13, -0.37);
            group.add(slat);
          }
          const inner = box(0.7, 0.06, 0.6, this.mats.black, 0, 1.36, 0);
          group.add(inner);
          const prop = createIngredientProp(def.ingredient, 3);
          prop.position.y = 1.4;
          group.add(prop);
          const tag = new THREE.Mesh(
            new THREE.PlaneGeometry(0.54, 0.19),
            new THREE.MeshBasicMaterial({ map: T.makeCrateTagTexture(INGREDIENTS[def.ingredient].emoji, def.label) }),
          );
          tag.position.set(0, 1.02, 0.365);
          group.add(tag);
          visual.itemAnchor.set(0, 1.4, 0);
          visual.label = null;
          break;
        }

        case 'board': {
          const board = box(1.32, 0.06, 0.84, this.mats.boardWood, 0, 0.955, 0);
          group.add(board);
          const rimL = box(0.05, 0.04, 0.84, this.mats.woodDark, -0.64, 0.985, 0);
          const rimR = box(0.05, 0.04, 0.84, this.mats.woodDark, 0.64, 0.985, 0);
          group.add(rimL, rimR);
          // a few old knife marks on the board
          for (let i = 0; i < 5; i++) {
            const mark = box(0.16 + Math.random() * 0.2, 0.002, 0.012, this.mats.woodDark, (Math.random() - 0.5) * 0.8, 0.986, (Math.random() - 0.5) * 0.5);
            mark.rotation.y = Math.random() * 1.2;
            group.add(mark);
          }
          // knife resting on the board
          const knife = new THREE.Group();
          const blade = box(0.26, 0.012, 0.06, this.mats.steel, 0, 0, 0);
          const handle = box(0.14, 0.025, 0.05, this.mats.woodDark, 0.2, 0, 0);
          knife.add(blade, handle);
          knife.position.set(0.32, 1.0, 0.24);
          knife.rotation.y = -0.5;
          group.add(knife);
          visual.knife = knife;

          const itemRoot = new THREE.Group();
          itemRoot.position.set(0, 1.0, 0);
          group.add(itemRoot);
          visual.itemRoot = itemRoot;
          visual.itemAnchor.set(0, 1.0, 0);

          const label = this._makeLabel('🔪 砧板', 1.3, 0.9);
          group.add(label.sprite);
          visual.label = label;
          break;
        }

        case 'stove': {
          const top = box(1.15, 0.05, 1.0, this.mats.steelDark, 0, 0.945, 0);
          group.add(top);
          const cookTop = box(0.92, 0.02, 0.78, this.mats.black, 0, 0.975, 0);
          group.add(cookTop);
          // burner glow ring
          const burner = new THREE.Mesh(
            new THREE.TorusGeometry(0.22, 0.018, 8, 32),
            new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false }),
          );
          burner.rotation.x = Math.PI / 2;
          burner.position.y = 0.99;
          group.add(burner);
          visual.burner = burner;

          // pan
          const pan = new THREE.Group();
          const panBody = cyl(0.28, 0.24, 0.045, this.mats.black, 26);
          panBody.position.y = 0.03;
          pan.add(panBody);
          const panInner = cyl(0.245, 0.225, 0.01, this.mats.steelDark, 26);
          panInner.position.y = 0.052;
          pan.add(panInner);
          const handle = box(0.34, 0.026, 0.06, this.mats.woodDark, 0.4, 0.055, 0);
          pan.add(handle);
          pan.position.y = 0.99;
          group.add(pan);
          visual.pan = pan;

          const itemRoot = new THREE.Group();
          itemRoot.position.set(0, 1.045, 0);
          group.add(itemRoot);
          visual.itemRoot = itemRoot;
          visual.itemAnchor.set(0, 1.045, 0);

          const stoveLight = new THREE.PointLight(0xff7a2a, 0, 2.6, 2);
          stoveLight.position.set(0, 1.2, 0);
          group.add(stoveLight);
          visual.stoveLight = stoveLight;

          // knobs on the front
          for (let i = 0; i < 3; i++) {
            const knob = cyl(0.028, 0.028, 0.03, this.mats.brass, 10);
            knob.rotation.x = Math.PI / 2;
            knob.position.set(-0.28 + i * 0.16, 0.86, 0.51);
            group.add(knob);
          }

          const label = this._makeLabel('🔥 煎炉', 1.3, 0.9);
          group.add(label.sprite);
          visual.label = label;
          break;
        }

        case 'counter': {
          const top = box(1.4, 0.05, 1.0, this.mats.steel, 0, 0.95, 0);
          group.add(top);
          const matPad = box(0.75, 0.02, 0.55, this.mats.boardWood, 0, 0.98, 0);
          matPad.rotation.y = 0.08;
          group.add(matPad);
          const itemRoot = new THREE.Group();
          itemRoot.position.set(0, 1.0, 0);
          group.add(itemRoot);
          visual.itemRoot = itemRoot;
          visual.itemAnchor.set(0, 1.0, 0);
          const label = this._makeLabel('🍽️ 出餐台', 1.3, 0.95);
          group.add(label.sprite);
          visual.label = label;
          break;
        }

        case 'plateStack': {
          for (let i = 0; i < 7; i++) {
            const plate = cyl(0.2, 0.17, 0.016, this.mats.cream, 24);
            plate.position.y = 0.96 + i * 0.018;
            plate.rotation.y = i * 0.3;
            group.add(plate);
          }
          const rail = box(0.9, 0.03, 0.03, this.mats.brass, 0, 1.16, -0.32);
          group.add(rail);
          const label = this._makeLabel('🍽️ 盘子', 1.28, 0.8);
          group.add(label.sprite);
          visual.label = label;
          break;
        }

        case 'pass': {
          const bellBase = cyl(0.07, 0.085, 0.03, this.mats.brass, 16);
          bellBase.position.set(0.45, 0.98, 0.12);
          group.add(bellBase);
          const bell = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
            this.mats.brass,
          );
          bell.position.set(0.45, 1.02, 0.12);
          bell.castShadow = true;
          group.add(bell);
          const handle = cyl(0.012, 0.012, 0.06, this.mats.brass, 8);
          handle.position.set(0.45, 1.1, 0.12);
          group.add(handle);

          const sign = this._makeLabel('🛎️ 上菜窗口', 1.95, 1.0);
          group.add(sign.sprite);
          visual.label = sign;
          visual.bell = bell;
          break;
        }

        case 'trash': {
          const label = this._makeLabel('🗑️ 垃圾桶', 1.18, 0.78);
          group.add(label.sprite);
          visual.label = label;
          break;
        }

        default:
          break;
      }

      this.stationVisuals.set(def.id, visual);
    }
  }

  _buildDecor() {
    const { scene, mats } = this;

    // neon sign
    const neonTex = T.makeNeonTexture('SIZZLE!');
    const neon = new THREE.Mesh(
      new THREE.PlaneGeometry(3.1, 0.9),
      new THREE.MeshBasicMaterial({ map: neonTex, transparent: true, opacity: 0.92, depthWrite: false }),
    );
    neon.position.set(-0.9, 2.55, -3.44);
    scene.add(neon);
    const neonGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.7, 1.3),
      new THREE.MeshBasicMaterial({ map: neonTex, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    neonGlow.position.set(-0.9, 2.55, -3.43);
    scene.add(neonGlow);
    const neonLight = new THREE.PointLight(0xff6a3a, 4, 6, 2);
    neonLight.position.set(-0.9, 2.3, -2.9);
    scene.add(neonLight);
    this.neonLight = neonLight;

    // pendant lamps
    this.pendantLights = [];
    for (const x of [-2.4, 0.55, 3.0]) {
      const g = new THREE.Group();
      const cable = cyl(0.008, 0.008, 0.38, mats.black, 6);
      cable.position.y = 2.76;
      g.add(cable);
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.19, 0.16, 24, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0x8a3b2a,
          metalness: 0.45,
          roughness: 0.5,
          side: THREE.DoubleSide,
          emissive: 0x3a1508,
          emissiveIntensity: 0.9,
        }),
      );
      shade.position.y = 2.53;
      g.add(shade);
      const glowDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.175, 20),
        new THREE.MeshBasicMaterial({ color: 0xffc882 }),
      );
      glowDisc.rotation.x = Math.PI / 2;
      glowDisc.position.y = 2.5;
      g.add(glowDisc);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), mats.bulb);
      bulb.position.y = 2.47;
      g.add(bulb);
      const light = new THREE.PointLight(0xffb070, 5.2, 5.5, 2);
      light.position.y = 2.42;
      g.add(light);
      g.position.set(x, 0, 0.3);
      scene.add(g);
      this.pendantLights.push({ light, bulb, base: 5.2 });
    }

    // clock
    const clock = new THREE.Group();
    const face = cyl(0.26, 0.26, 0.04, mats.cream, 28);
    face.rotation.x = Math.PI / 2;
    clock.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 8, 32), mats.brass);
    clock.add(rim);
    const hand1 = box(0.02, 0.16, 0.012, mats.black, 0, 0.07, 0.03);
    const hand2 = box(0.13, 0.02, 0.012, mats.black, 0.055, 0, 0.03);
    hand1.position.z = 0.025;
    hand2.position.z = 0.025;
    clock.add(hand1, hand2);
    clock.position.set(1.85, 2.45, -3.45);
    scene.add(clock);

    // posters on the right wall
    for (let i = 0; i < 2; i++) {
      const poster = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.95),
        new THREE.MeshStandardMaterial({ map: T.makePosterTexture(i ? 'HOT!' : 'FRESH', i ? '趁热吃' : '今日蔬菜', i ? 8 : 110), roughness: 0.9 }),
      );
      poster.position.set(4.89, 1.85, -1.1 + i * 1.3);
      poster.rotation.y = -Math.PI / 2;
      scene.add(poster);
      scene.add(box(0.06, 1.06, 0.8, mats.woodDark, 4.97, 1.85, -1.1 + i * 1.3));
      scene.add(box(0.04, 0.05, 0.72, mats.brass, 4.9, 2.4, -1.1 + i * 1.3));
    }

    // shelf with jars on the right wall
    const shelf = box(0.35, 0.05, 2.2, mats.woodLight, 4.78, 1.62, 2.1);
    scene.add(shelf);
    for (let i = 0; i < 5; i++) {
      const jar = cyl(0.07, 0.07, 0.16, i % 2 ? mats.brass : mats.cream, 14);
      jar.position.set(4.75, 1.73, 1.2 + i * 0.42);
      scene.add(jar);
      const lid = cyl(0.075, 0.075, 0.03, mats.woodDark, 14);
      lid.position.set(4.75, 1.82, 1.2 + i * 0.42);
      scene.add(lid);
    }

    // plant near the front-left corner
    const pot = cyl(0.18, 0.14, 0.28, mats.red, 16);
    pot.position.set(-4.4, 0.14, 2.9);
    scene.add(pot);
    const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), mats.plant);
    foliage.position.set(-4.4, 0.52, 2.9);
    foliage.scale.set(0.9, 1.2, 0.9);
    foliage.castShadow = true;
    scene.add(foliage);

    // hanging utensils above the island
    for (let i = 0; i < 4; i++) {
      const pan = cyl(0.09, 0.09, 0.015, mats.steelDark, 12);
      pan.position.set(-1.3 + i * 0.75, 2.1, 1.35);
      pan.rotation.x = Math.PI / 2;
      scene.add(pan);
      scene.add(box(0.015, 0.3, 0.015, mats.black, -1.3 + i * 0.75, 2.24, 1.35));
    }

    // ambient cookbook stack on the back counter end
    for (let i = 0; i < 3; i++) {
      const book = box(0.32, 0.05, 0.24, i === 1 ? mats.red : i === 2 ? mats.cream : mats.woodDark, 2.1, 0.955 + i * 0.055, -2.75);
      book.rotation.y = 0.15 + i * 0.1;
      scene.add(book);
    }
  }

  /** Flicker/pulse lights and steam visuals. */
  update(dt, session, activeStationId, cameraPos = null) {
    this.time += dt;
    const kitchen = session.kitchen;
    const t = this.time;

    this._labelTimer -= dt;
    const updateLabels = this._labelTimer <= 0;
    if (updateLabels) this._labelTimer = 0.12;

    for (const [id, visual] of this.stationVisuals) {
      const st = kitchen.getStation(id);
      if (!st) continue;

      // item visual
      const cookFrac = st.item?.type === 'ingredient' ? kitchen.cookProgress(st) : 0;
      const brownBucket = st.item?.state === 'raw' ? Math.floor(cookFrac * 4) : 0;
      const contentsSig = st.item?.type === 'plate' ? st.item.contents.map((c) => c.ingredient + c.state).join(',') : '';
      const sig = st.item
        ? `${st.item.uid}|${st.item.type}|${st.item.state || ''}|${brownBucket}|${contentsSig}`
        : 'empty';

      if (sig !== visual.lastSig && visual.itemRoot) {
        visual.lastSig = sig;
        visual.itemRoot.clear();
        if (st.item) {
          const mesh = createItemMesh(st.item, cookFrac);
          if (st.item.type === 'plate') mesh.position.y = 0;
          visual.itemRoot.add(mesh);
          visual.currentMesh = mesh;
        }
      }

      // ring highlight
      const active = id === activeStationId;
      visual.ring.visible = active;
      if (active) {
        const pulse = 0.3 + 0.18 * (0.5 + 0.5 * Math.sin(t * 7));
        visual.ring.material.opacity = pulse;
        visual.ring.scale.setScalar(1 + Math.sin(t * 5) * 0.03);
      }

      // Labels are small and fade when you stand on top of them. Crates are
      // always labelled so the room reads at a glance; every other station only
      // announces itself when it is the thing you are aiming at.
      const label = visual.label;
      if (label) {
        const dx = cameraPos ? visual.def.x - cameraPos.x : 99;
        const dz = cameraPos ? visual.def.z - cameraPos.z : 99;
        const dist = Math.hypot(dx, dz);
        const nearFade = Math.max(0, Math.min(1, (dist - 1.35) / 0.55));
        let base = 0;
        if (visual.def.kind === 'crate') base = dist < 5.4 ? 0.72 : 0.25;
        else if (visual.def.kind === 'stove') base = active || st.item ? 0.95 : 0;
        else base = active ? 0.95 : 0;
        const opacity = base * nearFade;
        label.sprite.visible = opacity > 0.02;
        label.sprite.material.opacity = opacity;
        const grow = active ? 1.05 : 1;
        label.sprite.scale.set(label.baseW * grow, label.baseH * grow, 1);
      }

      // stove-specific
      if (st.kind === 'stove') {
        const cooking = st.item?.type === 'ingredient' && st.item.state !== 'burnt';
        const pct = cooking ? (st.item.state === 'cooked' ? 1 : cookFrac) : 0;
        visual.burner.material.opacity = cooking ? 0.24 + Math.sin(t * 10 + id.length) * 0.08 + pct * 0.24 : 0.06;
        if (visual.stoveLight) visual.stoveLight.intensity = cooking ? 1.25 + Math.sin(t * 12) * 0.35 : 0;
        if (visual.currentMesh) {
          visual.currentMesh.position.y = 0 + Math.sin(t * 2) * 0.002;
        }
        if (updateLabels) {
          let sub = '';
          if (st.item) {
            if (st.item.state === 'burnt') sub = '烧焦了 · 扔进垃圾桶';
            else if (st.item.state === 'cooked') sub = '已熟 · 快拿走';
            else if (st.item.type === 'ingredient') sub = `煎制中 ${Math.round(cookFrac * 100)}%`;
          }
          this._setLabel(visual.label, '🔥 煎炉', sub);
        }
      }

      if (st.kind === 'board' && updateLabels) {
        const item = st.item;
        let sub = '';
        if (item?.type === 'ingredient') {
          const def = INGREDIENTS[item.ingredient];
          if (item.state === 'chopped') sub = '切好了 · 拿走';
          else if (def?.choppable) sub = `切碎 ${Math.round(((item.chopProgress || 0) / def.chopTime) * 100)}%`;
          else sub = '这个不用切';
        }
        this._setLabel(visual.label, '🔪 砧板', sub);
      }

      if (st.kind === 'counter' && updateLabels) {
        let sub = '';
        if (st.item?.type === 'plate') {
          const n = st.item.contents.length;
          sub = n ? `已摆 ${n} 种配料` : '空盘 · 放配料';
        }
        this._setLabel(visual.label, '🍽️ 出餐台', sub);
      }
    }

    // lamp flicker
    this.pendantLights?.forEach(({ light, base }, i) => {
      light.intensity = base + Math.sin(t * 7 + i * 2) * 0.35;
    });
    if (this.neonLight) this.neonLight.intensity = 3.6 + Math.sin(t * 3.2) * 0.5;

    // serving bell jiggle
    const passBell = this.stationVisuals.get('pass')?.bell;
    if (passBell && passBell.userData.ping > 0) {
      passBell.userData.ping = Math.max(0, passBell.userData.ping - dt * 2.2);
      const p = passBell.userData.ping;
      passBell.rotation.z = Math.sin(p * 46) * 0.28 * p;
      passBell.position.y = 1.02 + Math.abs(Math.sin(p * 18)) * 0.025 * p;
    }
  }

  /** World position of a stove's pan (for steam particles). */
  stoveAnchor(id) {
    const v = this.stationVisuals.get(id);
    if (!v) return null;
    return new THREE.Vector3(v.def.x, 1.08, v.def.z);
  }

  /** Ping the serving bell. */
  ringBell() {
    const v = this.stationVisuals.get('pass');
    if (v?.bell) v.bell.userData.ping = 1;
  }

  dispose() {
    for (const v of this.stationVisuals.values()) {
      v.label?.sprite.material.map?.dispose();
      v.label?.sprite.material.dispose();
    }
    this.stationVisuals.clear();
  }
}
