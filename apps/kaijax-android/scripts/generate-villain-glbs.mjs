import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import * as THREE from 'three';

/**
 * OPERATION KAI-JAX — WAVE 3 VILLAIN & ENEMY GLB COMPILER
 * Compiles mobile-budgeted, bilaterally UV-mapped, PBR-textured, rigged & 19-clip animated
 * Master + LOD1 GLBs for all 8 canonical district bosses + 3 Syndicate street archetypes.
 */

const OUT_DIR = path.resolve(process.cwd(), 'public/models/enemies');

const REQUIRED_CLIPS = [
  'idle', 'breathing', 'walk', 'run', 'sprint',
  'jump', 'fall', 'landing', 'dodge',
  'attack_1', 'attack_2', 'attack_3', 'heavy_strike',
  'parry', 'hit_reaction', 'roar', 'ability_cast',
  'victory', 'defeat',
];

const MORPH_NAMES = ['blink', 'snarl', 'roar', 'pain', 'focus'];

// 4x2 UV Atlas Tiles (col in 0..3, row in 0..1)
const TILES = {
  PRIMARY_BODY: [0, 0],
  ARMOR_PLATE: [1, 0],
  TRIM_ACCENT: [2, 0],
  EYE_VISOR: [3, 0],
  CLOTH_CAPE: [0, 1],
  WEAPON_BLADE: [1, 1],
  EMISSIVE_CORE: [2, 1],
  DARK_JOINT: [3, 1],
};

// ---------------------------------------------------------------------------
// 1. Pure Node.js PNG Encoder
// ---------------------------------------------------------------------------
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(typeStr, dataBuf) {
  const typeBuf = Buffer.from(typeStr, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(dataBuf.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, dataBuf])), 0);
  return Buffer.concat([lenBuf, typeBuf, dataBuf, crcBuf]);
}

function encodeRgbaPng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, rowStart + 1);
  }
  const compressed = zlib.deflateSync(raw, { level: 6 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixRgb(a, b, t) {
  const k = Math.max(0, Math.min(1, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ];
}

function hash2d(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// ---------------------------------------------------------------------------
// 2. Canonical Villain & Enemy Specs (11 total)
// ---------------------------------------------------------------------------
export const VILLAIN_SPECS = [
  {
    id: 'fang_enforcer',
    heightScale: 1.24,
    shoulderScale: 1.38,
    chestScale: 1.32,
    headStyle: 'saber_brute',
    accessory: 'spiked_pauldrons',
    palette: {
      body: '#2a1820',
      armor: '#19141d',
      trim: '#dc2626',
      eye: '#ff5722',
      cloth: '#45121b',
      weapon: '#94a3b8',
      emissive: '#ef4444',
      joint: '#121016',
    },
  },
  {
    id: 'blood_broker',
    heightScale: 1.08,
    shoulderScale: 1.12,
    chestScale: 1.04,
    headStyle: 'hooded_visor',
    accessory: 'trench_coat_blades',
    palette: {
      body: '#1c1218',
      armor: '#7f1d1d',
      trim: '#f59e0b',
      eye: '#fb7185',
      cloth: '#4c0519',
      weapon: '#fda4af',
      emissive: '#e11d48',
      joint: '#140c10',
    },
  },
  {
    id: 'syndicate_brawler',
    heightScale: 1.05,
    shoulderScale: 1.2,
    chestScale: 1.16,
    headStyle: 'beast_helm',
    accessory: 'heavy_gauntlets',
    palette: {
      body: '#231f2e',
      armor: '#33293f',
      trim: '#ea580c',
      eye: '#f97316',
      cloth: '#1e1b26',
      weapon: '#cbd5e1',
      emissive: '#f97316',
      joint: '#131118',
    },
  },
  {
    id: 'syndicate_stalker',
    heightScale: 0.96,
    shoulderScale: 0.94,
    chestScale: 0.92,
    headStyle: 'hooded_visor',
    accessory: 'twin_wrist_blades',
    palette: {
      body: '#181424',
      armor: '#312e81',
      trim: '#a855f7',
      eye: '#c084fc',
      cloth: '#1e1b4b',
      weapon: '#e9d5ff',
      emissive: '#a855f7',
      joint: '#0f0d16',
    },
  },
  {
    id: 'syndicate_marksman',
    heightScale: 1.0,
    shoulderScale: 1.0,
    chestScale: 0.96,
    headStyle: 'tactical_visor',
    accessory: 'rangefinder_pack',
    palette: {
      body: '#1e293b',
      armor: '#334155',
      trim: '#38bdf8',
      eye: '#22d3ee',
      cloth: '#0f172a',
      weapon: '#94a3b8',
      emissive: '#06b6d4',
      joint: '#0f172a',
    },
  },
  {
    id: 'architect_scout',
    heightScale: 1.04,
    shoulderScale: 1.06,
    chestScale: 1.0,
    headStyle: 'tactical_visor',
    accessory: 'dorsal_sensor_fins',
    palette: {
      body: '#0f172a',
      armor: '#1e293b',
      trim: '#22d3ee',
      eye: '#67e8f9',
      cloth: '#164e63',
      weapon: '#cffafe',
      emissive: '#06b6d4',
      joint: '#090d16',
    },
  },
  {
    id: 'neon_prince',
    heightScale: 1.05,
    shoulderScale: 1.08,
    chestScale: 1.02,
    headStyle: 'crowned_duelist',
    accessory: 'trench_coat_blades',
    palette: {
      body: '#1e1035',
      armor: '#4c1d95',
      trim: '#ec4899',
      eye: '#22d3ee',
      cloth: '#3b0764',
      weapon: '#f472b6',
      emissive: '#f43f5e',
      joint: '#120822',
    },
  },
  {
    id: 'undercrown_sentinel',
    heightScale: 1.28,
    shoulderScale: 1.44,
    chestScale: 1.38,
    headStyle: 'horned_helm',
    accessory: 'fortress_shields',
    palette: {
      body: '#1c1917',
      armor: '#44403c',
      trim: '#d97706',
      eye: '#fbbf24',
      cloth: '#292524',
      weapon: '#fcd34d',
      emissive: '#f59e0b',
      joint: '#0c0a09',
    },
  },
  {
    id: 'borax_zenith',
    heightScale: 1.18,
    shoulderScale: 1.28,
    chestScale: 1.24,
    headStyle: 'lion_zenith',
    accessory: 'zenith_halo_pauldrons',
    palette: {
      body: '#3b2416',
      armor: '#78350f',
      trim: '#fbbf24',
      eye: '#fef08a',
      cloth: '#451a03',
      weapon: '#fde68a',
      emissive: '#f59e0b',
      joint: '#1c110a',
    },
  },
  {
    id: 'erasure_choir',
    heightScale: 1.12,
    shoulderScale: 1.08,
    chestScale: 0.98,
    headStyle: 'hooded_visor',
    accessory: 'resonance_halos',
    palette: {
      body: '#0d0917',
      armor: '#2e1065',
      trim: '#c084fc',
      eye: '#f0abfc',
      cloth: '#1a0b2e',
      weapon: '#e9d5ff',
      emissive: '#9333ea',
      joint: '#07040d',
    },
  },
  {
    id: 'hollow_architect',
    heightScale: 1.32,
    shoulderScale: 1.34,
    chestScale: 1.22,
    headStyle: 'monolith_crown',
    accessory: 'zenith_halo_pauldrons',
    palette: {
      body: '#09090b',
      armor: '#18181b',
      trim: '#eab308',
      eye: '#fef08a',
      cloth: '#27272a',
      weapon: '#fde047',
      emissive: '#facc15',
      joint: '#030305',
    },
  },
];

// ---------------------------------------------------------------------------
// 3. PBR Atlas Synthesizer (4x2 tiles)
// ---------------------------------------------------------------------------
function buildVillainPbrTextures(spec, tier) {
  const W = tier === 'master' ? 512 : 256;
  const H = tier === 'master' ? 256 : 128;
  const TW = W / 4;
  const TH = H / 2;

  const base = new Uint8Array(W * H * 4);
  const orm = new Uint8Array(W * H * 4);
  const normal = new Uint8Array(W * H * 4);
  const emissive = new Uint8Array(W * H * 4);

  const pal = {
    body: hexToRgb(spec.palette.body),
    armor: hexToRgb(spec.palette.armor),
    trim: hexToRgb(spec.palette.trim),
    eye: hexToRgb(spec.palette.eye),
    cloth: hexToRgb(spec.palette.cloth),
    weapon: hexToRgb(spec.palette.weapon),
    emissive: hexToRgb(spec.palette.emissive),
    joint: hexToRgb(spec.palette.joint),
  };

  for (let py = 0; py < H; py++) {
    const row = Math.floor(py / TH);
    const lv = (py - row * TH) / TH;
    for (let px = 0; px < W; px++) {
      const col = Math.floor(px / TW);
      const lu = (px - col * TW) / TW;
      const idx = (py * W + px) * 4;
      const n = hash2d(px * 0.7, py * 0.7);
      const seam = Math.abs(lu - 0.5) < 0.03 || Math.abs(lv - 0.5) < 0.03;

      let rgb = pal.body;
      let ao = 225;
      let rough = 180;
      let metal = 20;
      let emis = [0, 0, 0];
      let nx = 128;
      let ny = 128;

      if (row === 0 && col === 0) {
        rgb = mixRgb(pal.body, pal.armor, n * 0.25);
        rough = 195;
        nx = Math.round(128 + (n - 0.5) * 28);
      } else if (row === 0 && col === 1) {
        rgb = seam ? mixRgb(pal.armor, pal.trim, 0.45) : mixRgb(pal.armor, [255, 255, 255], n * 0.08);
        rough = 95;
        metal = 190;
        ny = seam ? 155 : 128;
      } else if (row === 0 && col === 2) {
        rgb = mixRgb(pal.trim, [255, 240, 200], n * 0.15);
        rough = 75;
        metal = 215;
      } else if (row === 0 && col === 3) {
        const dist = Math.hypot(lu - 0.5, lv - 0.5);
        const glow = dist < 0.36 ? 1 - dist / 0.36 : 0;
        rgb = mixRgb(pal.joint, pal.eye, glow);
        emis = mixRgb([0, 0, 0], pal.eye, glow);
        rough = 40;
      } else if (row === 1 && col === 0) {
        rgb = mixRgb(pal.cloth, pal.trim, seam ? 0.35 : n * 0.12);
        rough = 210;
        metal = 15;
      } else if (row === 1 && col === 1) {
        rgb = mixRgb(pal.weapon, pal.emissive, Math.abs(lu - 0.5) < 0.12 ? 0.6 : 0.1);
        emis = Math.abs(lu - 0.5) < 0.1 ? pal.emissive : [0, 0, 0];
        rough = 50;
        metal = 235;
      } else if (row === 1 && col === 2) {
        const pulse = 0.5 + 0.5 * Math.sin(lu * Math.PI) * Math.sin(lv * Math.PI);
        rgb = mixRgb(pal.armor, pal.emissive, pulse);
        emis = mixRgb([0, 0, 0], pal.emissive, pulse);
        rough = 60;
        metal = 140;
      } else {
        rgb = mixRgb(pal.joint, pal.armor, n * 0.15);
        rough = 215;
        metal = 45;
      }

      base[idx] = rgb[0];
      base[idx + 1] = rgb[1];
      base[idx + 2] = rgb[2];
      base[idx + 3] = 255;

      orm[idx] = ao;
      orm[idx + 1] = rough;
      orm[idx + 2] = metal;
      orm[idx + 3] = 255;

      normal[idx] = nx;
      normal[idx + 1] = ny;
      normal[idx + 2] = 255;
      normal[idx + 3] = 255;

      emissive[idx] = emis[0];
      emissive[idx + 1] = emis[1];
      emissive[idx + 2] = emis[2];
      emissive[idx + 3] = 255;
    }
  }

  return {
    baseColorPng: encodeRgbaPng(W, H, base),
    ormPng: encodeRgbaPng(W, H, orm),
    normalPng: encodeRgbaPng(W, H, normal),
    emissivePng: encodeRgbaPng(W, H, emissive),
  };
}

// ---------------------------------------------------------------------------
// 4. Skeleton & Geometry Sculptor
// ---------------------------------------------------------------------------
function buildSkeleton(spec) {
  const s = spec.heightScale;
  const sw = spec.shoulderScale;
  const bones = [];
  const byName = new Map();

  function addBone(name, parentName, worldPos) {
    const parentIdx = parentName ? byName.get(parentName) : -1;
    const parentPos = parentIdx >= 0 ? bones[parentIdx].worldPos : [0, 0, 0];
    const idx = bones.length;
    bones.push({
      name,
      parentIdx,
      worldPos,
      localPos: [worldPos[0] - parentPos[0], worldPos[1] - parentPos[1], worldPos[2] - parentPos[2]],
      children: [],
    });
    if (parentIdx >= 0) bones[parentIdx].children.push(idx);
    byName.set(name, idx);
  }

  addBone('root', null, [0, 0, 0]);
  addBone('pelvis', 'root', [0, 0.94 * s, 0]);
  addBone('spine_1', 'pelvis', [0, 1.1 * s, 0]);
  addBone('spine_2', 'spine_1', [0, 1.28 * s, 0]);
  addBone('chest', 'spine_2', [0, 1.46 * s, 0]);
  addBone('neck', 'chest', [0, 1.62 * s, 0]);
  addBone('head', 'neck', [0, 1.76 * s, 0.02]);
  addBone('jaw', 'head', [0, 1.7 * s, 0.09]);

  for (const side of ['L', 'R']) {
    const dir = side === 'L' ? 1 : -1;
    addBone(`clavicle_${side}`, 'chest', [dir * 0.14 * sw, 1.54 * s, 0]);
    addBone(`upper_arm_${side}`, `clavicle_${side}`, [dir * 0.28 * sw, 1.48 * s, 0]);
    addBone(`forearm_${side}`, `upper_arm_${side}`, [dir * 0.34 * sw, 1.2 * s, 0.03]);
    addBone(`hand_${side}`, `forearm_${side}`, [dir * 0.36 * sw, 0.96 * s, 0.05]);

    addBone(`thigh_${side}`, 'pelvis', [dir * 0.13 * s, 0.88 * s, 0]);
    addBone(`shin_${side}`, `thigh_${side}`, [dir * 0.14 * s, 0.48 * s, 0]);
    addBone(`foot_${side}`, `shin_${side}`, [dir * 0.14 * s, 0.08 * s, 0.04]);
  }

  // Required attachment sockets
  addBone('socket_weapon_L', 'hand_L', [0.38 * sw, 0.94 * s, 0.12]);
  addBone('socket_weapon_R', 'hand_R', [-0.38 * sw, 0.94 * s, 0.12]);
  addBone('socket_relic', 'chest', [0, 1.48 * s, -0.18 * s]);
  addBone('socket_hitbox_L', 'hand_L', [0.4 * sw, 0.94 * s, 0.16]);
  addBone('socket_hitbox_R', 'hand_R', [-0.4 * sw, 0.94 * s, 0.16]);
  addBone('socket_head', 'head', [0, 1.88 * s, 0.04]);

  return { bones, byName };
}

class MeshAcc {
  constructor() {
    this.positions = [];
    this.uvs = [];
    this.indices = [];
    this.boneHints = [];
  }
  get vertexCount() {
    return this.positions.length;
  }
  addBox(cx, cy, cz, sx, sy, sz, tile, boneName, segs = 2) {
    const geo = new THREE.BoxGeometry(sx, sy, sz, segs, segs, segs);
    this.appendGeo(geo, cx, cy, cz, 0, 0, 0, tile, boneName);
    geo.dispose();
  }
  addLathe(cx, cy, cz, rTop, rBot, height, rx, ry, rz, tile, boneName, radSegs = 12, hSegs = 4) {
    const geo = new THREE.CylinderGeometry(rTop, rBot, height, radSegs, hSegs);
    this.appendGeo(geo, cx, cy, cz, rx, ry, rz, tile, boneName);
    geo.dispose();
  }
  addSphere(cx, cy, cz, r, sx, sy, sz, tile, boneName, segs = 12) {
    const geo = new THREE.SphereGeometry(r, segs, Math.max(6, Math.floor(segs * 0.75)));
    geo.scale(sx, sy, sz);
    this.appendGeo(geo, cx, cy, cz, 0, 0, 0, tile, boneName);
    geo.dispose();
  }
  appendGeo(geo, tx, ty, tz, rx, ry, rz, tile, boneName) {
    const pos = geo.getAttribute('position');
    const uv = geo.getAttribute('uv');
    const idx = geo.getIndex();
    const baseV = this.positions.length;
    const mat = new THREE.Matrix4().compose(
      new THREE.Vector3(tx, ty, tz),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
      new THREE.Vector3(1, 1, 1)
    );
    const v = new THREE.Vector3();
    const [col, row] = tile;
    const u0 = col * 0.25 + 0.015;
    const v0 = row * 0.5 + 0.025;
    const uSpan = 0.22;
    const vSpan = 0.45;

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mat);
      this.positions.push([v.x, v.y, v.z]);
      const uu = uv ? uv.getX(i) : 0.5;
      const vv = uv ? uv.getY(i) : 0.5;
      this.uvs.push([u0 + uu * uSpan, v0 + vv * vSpan]);
      this.boneHints.push(boneName);
    }
    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        this.indices.push(baseV + idx.getX(i));
      }
    }
  }
  computeNormals() {
    const n = new Float32Array(this.positions.length * 3);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const cb = new THREE.Vector3();
    const ab = new THREE.Vector3();
    for (let i = 0; i < this.indices.length; i += 3) {
      const i0 = this.indices[i];
      const i1 = this.indices[i + 1];
      const i2 = this.indices[i + 2];
      a.set(...this.positions[i0]);
      b.set(...this.positions[i1]);
      c.set(...this.positions[i2]);
      cb.subVectors(c, b);
      ab.subVectors(a, b);
      cb.cross(ab);
      for (const k of [i0, i1, i2]) {
        n[k * 3] += cb.x;
        n[k * 3 + 1] += cb.y;
        n[k * 3 + 2] += cb.z;
      }
    }
    for (let i = 0; i < this.positions.length; i++) {
      const x = n[i * 3];
      const y = n[i * 3 + 1];
      const z = n[i * 3 + 2];
      const len = Math.hypot(x, y, z) || 1;
      n[i * 3] = x / len;
      n[i * 3 + 1] = y / len;
      n[i * 3 + 2] = z / len;
    }
    return n;
  }
}

function sculptVillainGeometry(spec, tier) {
  const acc = new MeshAcc();
  const s = spec.heightScale;
  const sw = spec.shoulderScale;
  const cw = spec.chestScale;
  const seg = tier === 'master' ? 14 : 8;
  const boxSeg = tier === 'master' ? 3 : 2;

  // Pelvis & torso
  acc.addLathe(0, 0.94 * s, 0, 0.16 * cw, 0.14 * cw, 0.2 * s, 0, 0, 0, TILES.DARK_JOINT, 'pelvis', seg, 2);
  acc.addLathe(0, 1.18 * s, 0, 0.17 * cw, 0.15 * cw, 0.28 * s, 0, 0, 0, TILES.PRIMARY_BODY, 'spine_1', seg, 3);
  acc.addLathe(0, 1.44 * s, 0, 0.23 * cw, 0.17 * cw, 0.3 * s, 0, 0, 0, TILES.ARMOR_PLATE, 'chest', seg, 3);
  acc.addBox(0, 1.46 * s, 0.11 * cw, 0.26 * cw, 0.22 * s, 0.1, TILES.TRIM_ACCENT, 'chest', boxSeg);
  acc.addBox(0, 1.44 * s, 0.16 * cw, 0.1, 0.1, 0.05, TILES.EMISSIVE_CORE, 'chest', 1);

  // Neck & Head
  acc.addLathe(0, 1.63 * s, 0, 0.08 * s, 0.095 * s, 0.14 * s, 0, 0, 0, TILES.DARK_JOINT, 'neck', seg, 2);
  acc.addSphere(0, 1.79 * s, 0.02, 0.135 * s, 0.95, 1.08, 1.05, TILES.PRIMARY_BODY, 'head', seg);
  // Jaw / snout
  acc.addBox(0, 1.72 * s, 0.09 * s, 0.12 * s, 0.08 * s, 0.11 * s, TILES.ARMOR_PLATE, 'jaw', 2);
  // Glowing eyes / visor
  if (spec.headStyle === 'tactical_visor' || spec.headStyle === 'hooded_visor') {
    acc.addBox(0, 1.8 * s, 0.135 * s, 0.16 * s, 0.045 * s, 0.05, TILES.EYE_VISOR, 'head', 2);
  } else {
    acc.addSphere(-0.048 * s, 1.81 * s, 0.13 * s, 0.026 * s, 1.2, 0.7, 0.7, TILES.EYE_VISOR, 'head', 8);
    acc.addSphere(0.048 * s, 1.81 * s, 0.13 * s, 0.026 * s, 1.2, 0.7, 0.7, TILES.EYE_VISOR, 'head', 8);
  }

  // Head silhouette accents
  if (spec.headStyle === 'saber_brute' || spec.headStyle === 'beast_helm') {
    for (const dir of [-1, 1]) {
      acc.addLathe(dir * 0.045 * s, 1.69 * s, 0.14 * s, 0.005, 0.018 * s, 0.09 * s, Math.PI * 0.95, 0, dir * 0.12, TILES.WEAPON_BLADE, 'jaw', 8, 2);
      acc.addLathe(dir * 0.09 * s, 1.92 * s, -0.02, 0.006, 0.028 * s, 0.12 * s, -0.3, 0, dir * -0.25, TILES.ARMOR_PLATE, 'head', 8, 2);
    }
  } else if (spec.headStyle === 'crowned_duelist' || spec.headStyle === 'monolith_crown') {
    for (const dx of [-0.06, 0, 0.06]) {
      acc.addBox(dx * s, 1.96 * s, 0.02, 0.03 * s, 0.14 * s, 0.03 * s, TILES.EMISSIVE_CORE, 'head', 1);
    }
  } else if (spec.headStyle === 'horned_helm') {
    for (const dir of [-1, 1]) {
      acc.addLathe(dir * 0.12 * s, 1.93 * s, 0.02, 0.008, 0.035 * s, 0.18 * s, 0.2, 0, dir * -0.5, TILES.TRIM_ACCENT, 'head', 8, 2);
    }
  } else if (spec.headStyle === 'lion_zenith') {
    for (let i = 0; i < 7; i++) {
      const ang = ((i - 3) / 3) * 0.9;
      acc.addLathe(Math.sin(ang) * 0.13 * s, 1.86 * s, -0.08 * s, 0.01, 0.04 * s, 0.2 * s, -0.7, ang, 0, TILES.EMISSIVE_CORE, 'head', 8, 2);
    }
  }

  // Limbs (Left & Right)
  for (const side of ['L', 'R']) {
    const dir = side === 'L' ? 1 : -1;
    // Shoulder / Pauldron
    acc.addSphere(dir * 0.28 * sw, 1.51 * s, 0, 0.11 * sw, 1.15, 0.95, 1.1, TILES.ARMOR_PLATE, `upper_arm_${side}`, seg);
    if (spec.accessory === 'spiked_pauldrons' || spec.accessory === 'zenith_halo_pauldrons' || spec.accessory === 'fortress_shields') {
      acc.addBox(dir * 0.34 * sw, 1.58 * s, 0, 0.14 * sw, 0.12 * s, 0.2 * sw, TILES.TRIM_ACCENT, `upper_arm_${side}`, 2);
    }
    // Upper arm, forearm, hand
    acc.addLathe(dir * 0.31 * sw, 1.34 * s, 0.01, 0.075 * cw, 0.065 * cw, 0.28 * s, 0, 0, dir * -0.1, TILES.PRIMARY_BODY, `upper_arm_${side}`, seg, 3);
    acc.addLathe(dir * 0.35 * sw, 1.08 * s, 0.04, 0.07 * cw, 0.058 * cw, 0.25 * s, 0.12, 0, 0, TILES.ARMOR_PLATE, `forearm_${side}`, seg, 3);
    acc.addBox(dir * 0.36 * sw, 0.94 * s, 0.06, 0.085 * cw, 0.1 * s, 0.095 * cw, TILES.DARK_JOINT, `hand_${side}`, 2);

    // Weapon / gauntlet attachments
    if (spec.accessory === 'twin_wrist_blades' || spec.accessory === 'trench_coat_blades') {
      acc.addBox(dir * 0.38 * sw, 0.91 * s, 0.24, 0.025, 0.06, 0.36 * s, TILES.WEAPON_BLADE, `hand_${side}`, 2);
    } else if (spec.accessory === 'heavy_gauntlets' || spec.accessory === 'spiked_pauldrons') {
      acc.addBox(dir * 0.36 * sw, 0.94 * s, 0.09, 0.13 * cw, 0.13 * s, 0.14 * cw, TILES.TRIM_ACCENT, `hand_${side}`, 2);
    }

    // Thigh, shin, boot
    acc.addLathe(dir * 0.13 * s, 0.68 * s, 0, 0.095 * cw, 0.08 * cw, 0.4 * s, 0, 0, 0, TILES.CLOTH_CAPE, `thigh_${side}`, seg, 3);
    acc.addLathe(dir * 0.14 * s, 0.29 * s, 0, 0.078 * cw, 0.065 * cw, 0.38 * s, 0, 0, 0, TILES.ARMOR_PLATE, `shin_${side}`, seg, 3);
    acc.addBox(dir * 0.14 * s, 0.06 * s, 0.05, 0.11 * cw, 0.11 * s, 0.22 * s, TILES.DARK_JOINT, `foot_${side}`, 2);
  }

  // Dorsal accessories
  if (spec.accessory === 'trench_coat_blades') {
    acc.addBox(0, 0.96 * s, -0.14 * cw, 0.38 * cw, 0.72 * s, 0.06, TILES.CLOTH_CAPE, 'spine_1', boxSeg);
  } else if (spec.accessory === 'dorsal_sensor_fins') {
    for (const dir of [-1, 1]) {
      acc.addBox(dir * 0.14 * sw, 1.62 * s, -0.16, 0.04, 0.34 * s, 0.18, TILES.TRIM_ACCENT, 'chest', 2);
    }
  } else if (spec.accessory === 'resonance_halos') {
    acc.addLathe(0, 1.54 * s, -0.22, 0.36 * s, 0.36 * s, 0.03, Math.PI / 2, 0, 0, TILES.EMISSIVE_CORE, 'chest', seg, 1);
  }

  return acc;
}

function computeWeights(acc, skel) {
  const n = acc.vertexCount;
  const joints = new Uint16Array(n * 4);
  const weights = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const bName = acc.boneHints[i];
    const bIdx = skel.byName.get(bName) ?? 1;
    const pIdx = skel.bones[bIdx].parentIdx >= 0 ? skel.bones[bIdx].parentIdx : bIdx;
    joints[i * 4] = bIdx;
    joints[i * 4 + 1] = pIdx;
    weights[i * 4] = 0.88;
    weights[i * 4 + 1] = 0.12;
  }
  return { joints, weights };
}

function buildMorphDeltas(acc, skel) {
  const headIdx = skel.byName.get('head');
  const hy = skel.bones[headIdx].worldPos[1];
  const out = {};
  for (const name of MORPH_NAMES) {
    const d = new Float32Array(acc.vertexCount * 3);
    for (let i = 0; i < acc.vertexCount; i++) {
      const [px, py, pz] = acc.positions[i];
      if (py > hy - 0.15 && pz > 0.05) {
        if (name === 'roar' && py < hy) d[i * 3 + 1] = -0.025;
        else if (name === 'snarl' && py >= hy) d[i * 3 + 1] = 0.012;
        else if (name === 'pain') d[i * 3 + 2] = -0.015;
        else if (name === 'focus') d[i * 3 + 2] = 0.01;
        else if (name === 'blink') d[i * 3 + 1] = -0.005;
      }
    }
    out[name] = d;
  }
  return out;
}

function quatEuler(rx, ry, rz) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
  return [q.x, q.y, q.z, q.w];
}

function buildClips(skel) {
  const clips = [];
  for (const name of REQUIRED_CLIPS) {
    const channels = [];
    const addRot = (boneName, times, eulers) => {
      const idx = skel.byName.get(boneName);
      if (idx === undefined) return;
      const vals = new Float32Array(eulers.length * 4);
      eulers.forEach((e, i) => {
        const q = quatEuler(e[0], e[1], e[2]);
        vals.set(q, i * 4);
      });
      channels.push({ nodeIdx: idx, path: 'rotation', times: new Float32Array(times), values: vals });
    };

    if (name === 'idle' || name === 'breathing') {
      addRot('chest', [0, 0.8, 1.6], [[0, 0, 0], [0.05, 0, 0], [0, 0, 0]]);
      addRot('upper_arm_L', [0, 0.8, 1.6], [[0.06, 0, 0.12], [0.1, 0, 0.16], [0.06, 0, 0.12]]);
      addRot('upper_arm_R', [0, 0.8, 1.6], [[0.06, 0, -0.12], [0.1, 0, -0.16], [0.06, 0, -0.12]]);
    } else if (name === 'walk' || name === 'run' || name === 'sprint') {
      const amp = name === 'sprint' ? 0.85 : name === 'run' ? 0.65 : 0.42;
      const dur = name === 'sprint' ? 0.46 : name === 'run' ? 0.58 : 0.84;
      const t = [0, dur * 0.25, dur * 0.5, dur * 0.75, dur];
      addRot('chest', t, [[0.18, 0.08, 0], [0.2, 0, 0], [0.18, -0.08, 0], [0.2, 0, 0], [0.18, 0.08, 0]]);
      addRot('thigh_L', t, [[amp, 0, 0], [0, 0, 0], [-amp, 0, 0], [0, 0, 0], [amp, 0, 0]]);
      addRot('thigh_R', t, [[-amp, 0, 0], [0, 0, 0], [amp, 0, 0], [0, 0, 0], [-amp, 0, 0]]);
      addRot('upper_arm_L', t, [[-amp * 0.8, 0, 0.1], [0, 0, 0.1], [amp * 0.8, 0, 0.1], [0, 0, 0.1], [-amp * 0.8, 0, 0.1]]);
      addRot('upper_arm_R', t, [[amp * 0.8, 0, -0.1], [0, 0, -0.1], [-amp * 0.8, 0, -0.1], [0, 0, -0.1], [amp * 0.8, 0, -0.1]]);
    } else if (name.startsWith('attack_') || name === 'heavy_strike') {
      const dur = name === 'heavy_strike' ? 0.7 : 0.45;
      const t = [0, dur * 0.35, dur * 0.65, dur];
      const wind = name === 'heavy_strike' ? -1.4 : -0.9;
      const swing = name === 'heavy_strike' ? 1.5 : 1.1;
      addRot('chest', t, [[0, -0.35, 0], [-0.2, -0.5, 0], [0.35, 0.55, 0], [0, 0, 0]]);
      addRot('upper_arm_R', t, [[wind, 0, -0.3], [wind * 1.1, 0, -0.5], [swing, 0.3, -0.1], [0.06, 0, -0.12]]);
      addRot('upper_arm_L', t, [[0.3, 0, 0.2], [0.6, 0, 0.4], [-0.5, 0, 0.2], [0.06, 0, 0.12]]);
    } else if (name === 'roar' || name === 'ability_cast') {
      const t = [0, 0.25, 0.6, 0.9];
      addRot('chest', t, [[0.15, 0, 0], [-0.35, 0, 0], [-0.3, 0, 0], [0, 0, 0]]);
      addRot('head', t, [[0.1, 0, 0], [-0.45, 0, 0], [-0.4, 0, 0], [0, 0, 0]]);
      addRot('upper_arm_L', t, [[0, 0, 0.2], [-0.8, 0, 0.9], [-0.7, 0, 0.8], [0.06, 0, 0.12]]);
      addRot('upper_arm_R', t, [[0, 0, -0.2], [-0.8, 0, -0.9], [-0.7, 0, -0.8], [0.06, 0, -0.12]]);
    } else if (name === 'hit_reaction') {
      addRot('chest', [0, 0.12, 0.35], [[0, 0, 0], [-0.45, 0.2, 0], [0, 0, 0]]);
    } else if (name === 'defeat') {
      addRot('pelvis', [0, 0.4, 0.8], [[0, 0, 0], [0.5, 0, 0.1], [1.45, 0, 0.15]]);
    } else {
      addRot('chest', [0, 0.3, 0.6], [[0, 0, 0], [0.15, 0.15, 0], [0, 0, 0]]);
    }
    clips.push({ name, channels });
  }
  return clips;
}

// ---------------------------------------------------------------------------
// 5. GLB Binary Packer
// ---------------------------------------------------------------------------
function packGlb(spec, tier, pbr) {
  const skel = buildSkeleton(spec);
  const acc = sculptVillainGeometry(spec, tier);
  const norms = acc.computeNormals();
  const { joints, weights } = computeWeights(acc, skel);
  const morphs = buildMorphDeltas(acc, skel);
  const clips = buildClips(skel);

  const vc = acc.vertexCount;
  const posF = new Float32Array(vc * 3);
  const uvF = new Float32Array(vc * 2);
  for (let i = 0; i < vc; i++) {
    posF.set(acc.positions[i], i * 3);
    uvF.set(acc.uvs[i], i * 2);
  }
  const idxArr = vc > 65535 ? new Uint32Array(acc.indices) : new Uint16Array(acc.indices);
  const idxType = vc > 65535 ? 5125 : 5123;

  const ibmF = new Float32Array(skel.bones.length * 16);
  const m4 = new THREE.Matrix4();
  for (let b = 0; b < skel.bones.length; b++) {
    const wp = skel.bones[b].worldPos;
    m4.makeTranslation(-wp[0], -wp[1], -wp[2]).toArray(ibmF, b * 16);
  }

  const binChunks = [];
  let byteOffset = 0;
  const bufferViews = [];
  const accessors = [];

  const appendBv = (bufOrArr, target) => {
    const raw = Buffer.isBuffer(bufOrArr)
      ? bufOrArr
      : Buffer.from(bufOrArr.buffer, bufOrArr.byteOffset, bufOrArr.byteLength);
    const pad = (4 - (raw.length % 4)) % 4;
    const bvIdx = bufferViews.length;
    const bv = { buffer: 0, byteOffset, byteLength: raw.length };
    if (target !== undefined) bv.target = target;
    bufferViews.push(bv);
    binChunks.push(raw);
    if (pad > 0) binChunks.push(Buffer.alloc(pad));
    byteOffset += raw.length + pad;
    return bvIdx;
  };

  const appendAcc = (arr, compType, typeStr, count, target, minMax = false) => {
    const bvIdx = appendBv(arr, target);
    const obj = { bufferView: bvIdx, byteOffset: 0, componentType: compType, count, type: typeStr };
    if (minMax) {
      const mn = [Infinity, Infinity, Infinity];
      const mx = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < count; i++) {
        for (let k = 0; k < 3; k++) {
          const v = arr[i * 3 + k];
          if (v < mn[k]) mn[k] = v;
          if (v > mx[k]) mx[k] = v;
        }
      }
      obj.min = mn;
      obj.max = mx;
    }
    const idx = accessors.length;
    accessors.push(obj);
    return idx;
  };

  const posAcc = appendAcc(posF, 5126, 'VEC3', vc, 34962, true);
  const normAcc = appendAcc(norms, 5126, 'VEC3', vc, 34962);
  const uvAcc = appendAcc(uvF, 5126, 'VEC2', vc, 34962);
  const jAcc = appendAcc(joints, 5123, 'VEC4', vc, 34962);
  const wAcc = appendAcc(weights, 5126, 'VEC4', vc, 34962);
  const idxAcc = appendAcc(idxArr, idxType, 'SCALAR', idxArr.length, 34963);
  const ibmAcc = appendAcc(ibmF, 5126, 'MAT4', skel.bones.length);

  const targets = MORPH_NAMES.map((m) => ({
    POSITION: appendAcc(morphs[m], 5126, 'VEC3', vc, 34962, true),
  }));

  const images = [
    { name: `${spec.id}_base`, bufferView: appendBv(pbr.baseColorPng), mimeType: 'image/png' },
    { name: `${spec.id}_orm`, bufferView: appendBv(pbr.ormPng), mimeType: 'image/png' },
    { name: `${spec.id}_norm`, bufferView: appendBv(pbr.normalPng), mimeType: 'image/png' },
    { name: `${spec.id}_emis`, bufferView: appendBv(pbr.emissivePng), mimeType: 'image/png' },
  ];
  const samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }];
  const textures = [0, 1, 2, 3].map((source) => ({ sampler: 0, source }));
  const materials = [
    {
      name: `${spec.id}_pbr`,
      pbrMetallicRoughness: {
        baseColorTexture: { index: 0 },
        metallicRoughnessTexture: { index: 1 },
        metallicFactor: 1.0,
        roughnessFactor: 1.0,
      },
      normalTexture: { index: 2, scale: 0.7 },
      occlusionTexture: { index: 1, strength: 0.55 },
      emissiveTexture: { index: 3 },
      emissiveFactor: [1, 1, 1],
    },
  ];

  const nodes = skel.bones.map((b) => {
    const n = { name: b.name, translation: b.localPos };
    if (b.children.length > 0) n.children = b.children;
    return n;
  });
  const meshNodeIdx = nodes.length;
  nodes.push({ name: `${spec.id}_mesh`, mesh: 0, skin: 0 });

  const animations = clips.map((c) => {
    const samplersArr = [];
    const channelsArr = [];
    for (const ch of c.channels) {
      const tAcc = appendAcc(ch.times, 5126, 'SCALAR', ch.times.length);
      // Set min/max on animation time accessor per glTF 2.0 spec
      accessors[tAcc].min = [ch.times[0]];
      accessors[tAcc].max = [ch.times[ch.times.length - 1]];
      const vAcc = appendAcc(ch.values, 5126, 'VEC4', ch.values.length / 4);
      const sIdx = samplersArr.length;
      samplersArr.push({ input: tAcc, output: vAcc, interpolation: 'LINEAR' });
      channelsArr.push({ sampler: sIdx, target: { node: ch.nodeIdx, path: ch.path } });
    }
    return { name: c.name, samplers: samplersArr, channels: channelsArr };
  });

  const gltf = {
    asset: { version: '2.0', generator: 'KaiJax-Wave3-VillainCompiler' },
    scene: 0,
    scenes: [{ nodes: [0, meshNodeIdx] }],
    nodes,
    meshes: [
      {
        name: spec.id,
        primitives: [
          {
            attributes: { POSITION: posAcc, NORMAL: normAcc, TEXCOORD_0: uvAcc, JOINTS_0: jAcc, WEIGHTS_0: wAcc },
            indices: idxAcc,
            material: 0,
            targets,
          },
        ],
        extras: { targetNames: MORPH_NAMES },
      },
    ],
    skins: [{ name: `${spec.id}_skin`, inverseBindMatrices: ibmAcc, joints: skel.bones.map((_, i) => i), skeleton: 0 }],
    materials,
    textures,
    images,
    samplers,
    animations,
    bufferViews,
    accessors,
    buffers: [{ byteLength: byteOffset }],
  };

  const jsonBuf = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  const jsonChunk = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]);
  const binChunk = Buffer.concat(binChunks);
  const totalLen = 12 + 8 + jsonChunk.length + 8 + binChunk.length;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const jh = Buffer.alloc(8);
  jh.writeUInt32LE(jsonChunk.length, 0);
  jh.writeUInt32LE(0x4e4f534a, 4);

  const bh = Buffer.alloc(8);
  bh.writeUInt32LE(binChunk.length, 0);
  bh.writeUInt32LE(0x004e4942, 4);

  return Buffer.concat([header, jh, jsonChunk, bh, binChunk]);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const spec of VILLAIN_SPECS) {
  for (const tier of ['master', 'lod1']) {
    const pbr = buildVillainPbrTextures(spec, tier);
    const glb = packGlb(spec, tier, pbr);
    const outPath = path.join(OUT_DIR, `${spec.id}_${tier}.glb`);
    fs.writeFileSync(outPath, glb);
    console.log(`[GENERATED] ${spec.id}_${tier}.glb (${(glb.length / 1024).toFixed(1)} KB)`);
  }
}
