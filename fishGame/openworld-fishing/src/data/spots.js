/**
 * spots.js — fishing spot definitions.
 *
 * Anchors are points out on the water; the actual standing position, dock
 * angle and water depth are resolved against the generated terrain at build
 * time, so a spot always ends up on a real shoreline of the right water body.
 */

/** @typedef {{id:string,name:string,short:string,anchor:[number,number],waters:string[],biomes:string[],minLevel:number,radius:number,dock?:boolean,boat?:boolean,desc:string}} SpotDef */

export const SPOT_DEFS = [
  {
    id: 'lake_dock',
    name: '湖畔栈桥',
    short: '静水湖 · 东岸',
    anchor: [-84, 118],
    waters: ['lake', 'shore'],
    biomes: ['lake'],
    minLevel: 1,
    radius: 28,
    dock: true,
  },
  {
    id: 'lake_weeds',
    name: '芦苇湾',
    short: '静水湖 · 西北',
    anchor: [-192, 148],
    waters: ['lake', 'shore'],
    biomes: ['lake'],
    minLevel: 2,
    radius: 24,
  },
  {
    id: 'lake_center',
    name: '湖心深水',
    short: '静水湖 · 湖心',
    anchor: [-150, 100],
    waters: ['lake', 'deep'],
    biomes: ['lake'],
    minLevel: 8,
    radius: 40,
    boat: true,
  },
  {
    id: 'river_bend',
    name: '溪流拐弯',
    short: '苍岩溪 · 下游',
    anchor: [-24, 12],
    waters: ['river'],
    biomes: ['river'],
    minLevel: 1,
    radius: 18,
  },
  {
    id: 'river_gorge',
    name: '上游峡谷',
    short: '苍岩溪 · 上游',
    anchor: [100, -140],
    waters: ['river'],
    biomes: ['river'],
    minLevel: 6,
    radius: 17,
  },
  {
    id: 'pond_frog',
    name: '蛙鸣塘',
    short: '林间池塘',
    anchor: [95, -42],
    waters: ['pond', 'shore'],
    biomes: ['pond'],
    minLevel: 1,
    radius: 22,
    dock: true,
  },
  {
    id: 'swamp_edge',
    name: '迷雾沼泽',
    short: '沼泽 · 边缘',
    anchor: [228, 232],
    waters: ['swamp', 'shore'],
    biomes: ['swamp'],
    minLevel: 5,
    radius: 30,
  },
  {
    id: 'swamp_deep',
    name: '沼泽深处',
    short: '沼泽 · 深处',
    anchor: [258, 232],
    waters: ['swamp'],
    biomes: ['swamp'],
    minLevel: 12,
    radius: 22,
  },
  {
    id: 'outlet_creek',
    name: '出湖溪口',
    short: '静水湖 · 泄水口',
    anchor: [-330, 112],
    waters: ['river', 'shore'],
    biomes: ['river', 'estuary'],
    minLevel: 10,
    radius: 24,
  },
  {
    id: 'estuary',
    name: '入海口',
    short: '咸淡交界',
    anchor: [-486, 78],
    waters: ['shore', 'ocean'],
    biomes: ['estuary', 'coast'],
    minLevel: 14,
    radius: 34,
    dock: true,
  },
  {
    id: 'coast_beach',
    name: '金沙海滩',
    short: '海岸 · 沙滩',
    anchor: [-120, -420],
    waters: ['shore', 'ocean'],
    biomes: ['coast', 'ocean_shallow'],
    minLevel: 3,
    radius: 30,
  },
  {
    id: 'reef',
    name: '碎珊瑚礁',
    short: '外海 · 礁盘',
    anchor: [-320, -330],
    waters: ['reef', 'ocean'],
    biomes: ['reef'],
    minLevel: 20,
    radius: 46,
    boat: true,
  },
  {
    id: 'ocean_shallow',
    name: '近海渔场',
    short: '近海 · 洋流',
    anchor: [-330, 380],
    waters: ['ocean', 'shore'],
    biomes: ['ocean_shallow', 'coast'],
    minLevel: 9,
    radius: 36,
  },
  {
    id: 'ocean_deep',
    name: '深海钓场',
    short: '外海 · 深渊',
    anchor: [-520, -430],
    waters: ['ocean', 'deep'],
    biomes: ['ocean_deep'],
    minLevel: 30,
    radius: 52,
    boat: true,
  },
  {
    id: 'ocean_cliff',
    name: '断崖外海',
    short: '外海 · 断崖',
    anchor: [430, -520],
    waters: ['ocean', 'deep'],
    biomes: ['ocean_deep'],
    minLevel: 38,
    radius: 52,
    boat: true,
  },
];

/** Region id -> the `waters` tags it satisfies (used to score anchor placement). */
const REGION_WATERS = {
  ocean_deep: ['ocean', 'deep'],
  ocean_shallow: ['ocean', 'shore'],
  coast: ['shore', 'ocean'],
  reef: ['reef', 'ocean'],
  lake: ['lake', 'shore'],
  river: ['river', 'shore'],
  pond: ['pond', 'shore'],
  swamp: ['swamp', 'shore'],
  estuary: ['estuary', 'shore', 'ocean'],
};

function regionScore(want, region) {
  const tags = REGION_WATERS[region] || [];
  for (const w of want) if (tags.includes(w)) return 0;
  return 1;
}

/** Depth band a spot's water type should end up in. */
function targetDepthRange(want) {
  if (want.includes('deep') && !want.includes('shore')) return [12, 60];
  if (want.includes('shore') && !want.includes('deep')) return [1.4, 8];
  if (want.includes('reef')) return [2, 12];
  return [2, 20];
}

/**
 * Resolve spot definitions against the terrain to get real shoreline positions.
 * @param {import('./terrain.js').Terrain} terrain
 */
export function resolveSpots(terrain) {
  const out = [];
  for (const def of SPOT_DEFS) {
    let ax = def.anchor[0];
    let az = def.anchor[1];
    const want = def.waters || [];

    // 1. make sure the anchor is on the water. Search outward in rings, and
    //    among the nearest ring prefer the water body we actually asked for.
    if (!terrain.isWater(ax, az)) {
      const startR = Math.hypot(ax, az);
      let best = null;
      for (let r = 4; r <= 200 && !best; r += 4) {
        const ring = [];
        for (let i = 0; i < 32; i++) {
          const a = (i / 32) * Math.PI * 2;
          const px = ax + Math.cos(a) * r;
          const pz = az + Math.sin(a) * r;
          if (Math.abs(px) > 570 || Math.abs(pz) > 570) continue;
          if (!terrain.isWater(px, pz)) continue;
          const region = terrain.regionAt(px, pz);
          ring.push({
            x: px,
            z: pz,
            score: regionScore(want, region),
            seaward: Math.hypot(px, pz) - startR,
          });
        }
        if (ring.length) {
          ring.sort((a, b) => a.score - b.score || b.seaward - a.seaward);
          best = ring[0];
        }
      }
      if (best) {
        ax = best.x;
        az = best.z;
      }
    }

    // 2a. Shore-type water (beaches, near-shore marks) must actually be near a
    //     shore. Walk out from land until the depth enters the band, which
    //     guarantees a beach rather than a cliff-edge mark in deep water.
    const [dLo, dHi] = targetDepthRange(want);
    const wantShallow = want.includes('shore') && !want.includes('deep');
    let depth = terrain.depthAt(ax, az);
    if (wantShallow) {
      const land = terrain.findLand(ax, az, 520);
      const vx = ax - land.x;
      const vz = az - land.z;
      const vlen = Math.hypot(vx, vz) || 1;
      const ux = vx / vlen;
      const uz = vz / vlen;
      let found = null;
      for (let d = 0; d <= 320; d += 2) {
        const px = land.x + ux * d;
        const pz = land.z + uz * d;
        if (Math.abs(px) > 575 || Math.abs(pz) > 575) break;
        const dep = terrain.depthAt(px, pz);
        if (dep >= Math.max(1.3, dLo) && dep <= dHi) {
          found = { x: px, z: pz, d: dep };
          break;
        }
      }
      if (found) {
        ax = found.x;
        az = found.z;
        depth = found.d;
      }
    }

    // 2b. nudge the anchor into the depth band the spot's water type implies so
    //     a "beach" spot does not end up 30 m down a cliff.
    const wantDepth = (dLo + dHi) / 2;
    if (depth < dLo || depth > dHi) {
      let best = null;
      for (let r = 3; r <= 90; r += 3) {
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2;
          const px = ax + Math.cos(a) * r;
          const pz = az + Math.sin(a) * r;
          const d = terrain.depthAt(px, pz);
          if (d < dLo || d > dHi) continue;
          const region = terrain.regionAt(px, pz);
          const score = regionScore(want, region) + r / 400 + Math.abs(d - wantDepth) / 100;
          if (!best || score < best.score) best = { x: px, z: pz, d, score };
        }
        if (best) break;
      }
      if (best) {
        ax = best.x;
        az = best.z;
        depth = best.d;
      }
    }
    if (depth < 0.8) depth = terrain.depthAt(ax, az);

    // 3. Walk from the anchor toward the nearest land to find the shoreline.
    //    Spots whose water is too far from any shore become "water only":
    //    the angler has to swim (or later, row) out to them.
    const land = terrain.findLand(ax, az, 460);
    const dirX = land.x - ax;
    const dirZ = land.z - az;
    const dirLen = Math.hypot(dirX, dirZ) || 1;
    const ux = dirX / dirLen;
    const uz = dirZ / dirLen;
    let shoreX = ax;
    let shoreZ = az;
    let foundShore = false;
    for (let d = 1.5; d <= 130; d += 1.5) {
      const px = ax + ux * d;
      const pz = az + uz * d;
      if (terrain.heightAt(px, pz) >= terrain.waterLevel + 0.25) {
        shoreX = px;
        shoreZ = pz;
        foundShore = true;
        break;
      }
    }

    let waterOnly = false;
    let sx;
    let sz;
    if (foundShore) {
      // step back inland a little so the angler is not standing in the surf
      sx = shoreX + ux * 2.2;
      sz = shoreZ + uz * 2.2;
      if (!terrain.isWalkable(sx, sz)) {
        // look for the best standing spot within a few metres of the shoreline
        let best = null;
        for (let r = 1.5; r <= 7.5; r += 1.5) {
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const px = shoreX + Math.cos(a) * r;
            const pz = shoreZ + Math.sin(a) * r;
            const h = terrain.heightAt(px, pz);
            if (h < terrain.waterLevel + 0.1) continue;
            const slope = terrain.slopeAt(px, pz);
            if (slope > 3.6) continue;
            const score = slope + r * 0.06;
            if (!best || score < best.score) best = { x: px, z: pz, score };
          }
        }
        if (best) {
          sx = best.x;
          sz = best.z;
        } else {
          sx = shoreX;
          sz = shoreZ;
        }
      }
    } else {
      waterOnly = true;
      sx = ax;
      sz = az;
    }
    const groundH = waterOnly ? terrain.waterLevel : terrain.heightAt(sx, sz);

    // dock points from the shore toward the anchor
    const dockAngle = Math.atan2(-(ax - sx), -(az - sz));
    const distToWater = Math.hypot(ax - sx, az - sz);

    const biome = terrain.biomeAtExact(ax, az);
    const region = terrain.regionAt(ax, az);

    out.push({
      ...def,
      x: sx,
      z: sz,
      y: groundH,
      waterOnly,
      angle: Math.atan2(ax - sx, az - sz),
      anchorX: ax,
      anchorZ: az,
      depth: Math.round(depth * 10) / 10,
      biome,
      region,
      dockAngle,
      dockLength: Math.max(14, Math.min(34, Math.round(distToWater + 12))),
      distToWater: Math.round(distToWater),
      discovered: false,
      catches: 0,
      bestWeight: 0,
      bestId: null,
    });
  }
  return out;
}

export function spotById(spots, id) {
  return spots.find((s) => s.id === id) || null;
}

/** Spots the player is allowed to fish right now (level gate). */
export function accessibleSpots(spots, level) {
  return spots.filter((s) => s.minLevel <= level);
}
