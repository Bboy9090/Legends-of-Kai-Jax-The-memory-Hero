import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import * as THREE from 'three';

/**
 * OPERATION KAI-JAX — PROJECT BEAST GODS
 * Production Sculpted, Retopologized, UV-Unwrapped, PBR-Textured, Rigged & Animated GLB Compiler.
 *
 * Strictly governed by the Official Legends of Kai-Jax Visual Library sheets:
 *   - 01: Character Visual Library (Boryn, Kai, Kai-Jax, Jax, Borax)
 *   - 02: Fathers, Mentor, and Elder Fang (Boryn, Borax, Vharok)
 *
 * Enforces:
 *   - Kai: Silver-white fur, violet eyes, white/purple street-techwear jacket, 4 dorsal spider limbs (12 bones), 0 tails.
 *   - Jax: Jet-black fur, electric-blue eyes, 7 roaring storm-mane crests (7 bones), black lightning-veined jacket, cobalt sash, 0 tails.
 *   - Kai-Jax: Split Yin-Yang fur (viewer-left white + gold-ember eye; viewer-right black + storm-blue eye),
 *     purple/white/gold/obsidian fusion battle coat, 4 spider limbs (12 bones), 7 storm-mane crests (7 bones),
 *     and STRICTLY 3 primary physical tails (12 bones: tail_ember, tail_storm, tail_memory).
 *   - Boryn: Muscular orange-and-black striped sabertooth tiger, tactical leather/iron harness, burnt-orange runic sash, 1 tail (4 bones).
 *   - Borax: Towering silver-maned sabertooth lion, navy-indigo & gold Storm Ronin robes, white calligraphy scroll sash, 1 tail (4 bones).
 *   - Bovar: Withheld (awaiting_visual_approval — never fabricated).
 */

const OUT_DIR = path.resolve('/app/applet/public/models/characters');

const REQUIRED_CLIPS = [
  'idle',
  'breathing',
  'walk',
  'run',
  'sprint',
  'jump',
  'fall',
  'landing',
  'dodge',
  'attack_1',
  'attack_2',
  'attack_3',
  'heavy_strike',
  'parry',
  'hit_reaction',
  'roar',
  'ability_cast',
  'victory',
  'defeat',
];

const MORPH_NAMES = ['blink', 'snarl', 'roar', 'pain', 'focus'];

// 4x4 UV Atlas Tiles (col, row in 0..3)
const TILES = {
  FUR_PRIMARY: [0, 0],     // Primary fur (with stripes for Boryn/Kai)
  FUR_SECONDARY: [1, 0],   // Secondary fur (muzzle cream, or Kai-Jax black right half)
  IVORY_FANG: [2, 0],      // Sabertooth tusks & claws
  EYE_LEFT: [3, 0],        // Viewer-right (+X) eye
  JACKET_MAIN: [0, 1],     // Primary jacket / longcoat / ronin haori
  JACKET_ACCENT: [1, 1],   // Hood, lapels, purple/cobalt accents
  INNER_SHIRT: [2, 1],     // Inner shirt / chest harness / calligraphy scroll sash
  EYE_RIGHT: [3, 1],       // Viewer-left (-X) eye (Ember-gold on Kai-Jax!)
  PANTS_CARGO: [0, 2],     // Tactical cargo pants / hakama
  SNEAKER_BODY: [1, 2],    // High-top sneaker / combat boot upper
  ARMOR_GOLD: [2, 2],      // Gold/bronze trim, pauldrons, buckles, spider joints
  SASH_TABARD: [3, 2],     // Waist sash / burnt-orange tabard / purple-white sash
  SPIDER_CHITIN: [0, 3],   // Obsidian-violet dorsal spider limbs
  STORM_MANE: [1, 3],      // Electric-blue roaring storm mane
  TAIL_EMBER: [2, 3],      // Ember Memory tail (or tiger/lion tail)
  TAIL_MEMORY: [3, 3],     // Memory Weave violet tail
};

// ---------------------------------------------------------------------------
// 1. Pure Node.js PNG Encoder (CRC32 + zlib deflate) for Embedded PBR Maps
// ---------------------------------------------------------------------------
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(typeStr, dataBuf) {
  const typeBuf = Buffer.from(typeStr, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(dataBuf.length, 0);
  const crcInput = Buffer.concat([typeBuf, dataBuf]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, dataBuf, crcBuf]);
}

function encodeRgbaPng(width, height, rgbaUint8) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // Filter type 0 (None)
    Buffer.from(rgbaUint8.buffer, rgbaUint8.byteOffset + y * stride, stride).copy(raw, rowStart + 1);
  }
  const compressed = zlib.deflateSync(raw, { level: 6 });

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
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

/**
 * Synthesizes 4 high-detail 512x512 PBR PNG Atlases for a given character:
 *   - baseColorPng (SRGB)
 *   - ormPng (Linear: R=AO, G=Roughness, B=Metalness)
 *   - normalPng (Linear tangent-space normal map with fur strands & fabric weave)
 *   - emissivePng (SRGB glowing eyes, lightning veins, spider runes, 3 tails)
 */
function buildCharacterPbrTextures(spec) {
  const SIZE = 512;
  const TILE = SIZE / 4; // 128x128 per region tile
  const base = new Uint8Array(SIZE * SIZE * 4);
  const orm = new Uint8Array(SIZE * SIZE * 4);
  const norm = new Uint8Array(SIZE * SIZE * 4);
  const emis = new Uint8Array(SIZE * SIZE * 4);

  const heightField = new Float32Array(SIZE * SIZE);

  const cFur1 = hexToRgb(spec.palette.furPrimary);
  const cFurStripe = hexToRgb(spec.palette.furStripe);
  const cFur2 = hexToRgb(spec.palette.furSecondary);
  const cFang = hexToRgb('#F6F3EA');
  const cEyeL = hexToRgb(spec.palette.eyeLeft);
  const cEyeR = hexToRgb(spec.palette.eyeRight);
  const cJacket = hexToRgb(spec.palette.jacketMain);
  const cJacketAcc = hexToRgb(spec.palette.jacketAccent);
  const cInner = hexToRgb(spec.palette.innerShirt);
  const cPants = hexToRgb(spec.palette.pants);
  const cSneaker = hexToRgb(spec.palette.sneaker);
  const cGold = hexToRgb(spec.palette.armorTrim);
  const cSash = hexToRgb(spec.palette.sash);
  const cSpider = hexToRgb('#1A162B');
  const cSpiderGlow = hexToRgb('#A855F7');
  const cManeBase = hexToRgb('#1D4ED8');
  const cManeTip = hexToRgb('#7DD3FC');
  const cTailEmber = hexToRgb(spec.palette.tailPrimary);
  const cTailMemory = hexToRgb('#A855F7');
  const cLightning = hexToRgb(spec.palette.jacketGlow || '#000000');

  for (let py = 0; py < SIZE; py++) {
    const row = Math.floor(py / TILE);
    const v = (py % TILE) / TILE;
    for (let px = 0; px < SIZE; px++) {
      const col = Math.floor(px / TILE);
      const u = (px % TILE) / TILE;
      const idx = (py * SIZE + px) * 4;

      let rgb = [180, 180, 180];
      let ao = 235;
      let rough = 180;
      let metal = 20;
      let em = [0, 0, 0];
      let hVal = 0.5;

      const furGrain =
        Math.sin(u * 95 + Math.sin(v * 22) * 2.5) * 0.5 +
        (hash2d(Math.floor(px * 0.8), Math.floor(py * 0.25)) - 0.5) * 0.6;
      const weave =
        (Math.sin(px * 1.57) * Math.sin(py * 1.57)) * 0.35 +
        (hash2d(px, py) - 0.5) * 0.15;

      if (row === 0 && col === 0) {
        // FUR_PRIMARY (with tiger/sabertooth stripes if configured)
        const stripeWave = Math.sin(v * Math.PI * (spec.stripeFreq || 8) + Math.sin(u * Math.PI * 3) * 1.4);
        const isStripe = spec.hasBoldStripes
          ? stripeWave > 0.38
          : spec.hasSubtleStripes
            ? stripeWave > 0.68
            : false;
        rgb = isStripe ? mixRgb(cFur1, cFurStripe, 0.88) : mixRgb(cFur1, cFurStripe, Math.max(0, furGrain * 0.14));
        rough = 198;
        metal = 12;
        ao = Math.round(220 + furGrain * 22);
        hVal = 0.5 + furGrain * 0.35;
      } else if (row === 0 && col === 1) {
        // FUR_SECONDARY (Kai-Jax obsidian right side, or cream muzzle/mane)
        const stripeWave = Math.sin(v * Math.PI * 7 + Math.cos(u * Math.PI * 2) * 1.2);
        const sub = spec.id === 'kaijax' && stripeWave > 0.65 ? mixRgb(cFur2, [56, 189, 248], 0.22) : cFur2;
        rgb = mixRgb(sub, [255, 255, 255], furGrain * 0.08);
        rough = 192;
        metal = 15;
        hVal = 0.5 + furGrain * 0.35;
      } else if (row === 0 && col === 2) {
        // IVORY_FANG
        const rootShade = Math.max(0, 1 - v * 1.25);
        rgb = mixRgb(cFang, [195, 172, 138], rootShade * 0.45);
        rough = 58;
        metal = 24;
        hVal = 0.5 + Math.sin(u * 40) * 0.05;
      } else if (row === 0 && col === 3 || (row === 1 && col === 3)) {
        // GLOWING PREDATOR EYES (EYE_LEFT / EYE_RIGHT)
        const eyeCol = row === 0 ? cEyeL : cEyeR;
        const dx = (u - 0.5) * 2;
        const dy = (v - 0.5) * 2;
        const r = Math.hypot(dx, dy);
        // Vertical feline slit pupil!
        const isSlit = Math.abs(dx) < 0.13 && Math.abs(dy) < 0.58;
        if (isSlit) {
          rgb = [14, 10, 22];
          em = mixRgb(eyeCol, [0, 0, 0], 0.65);
        } else if (r < 0.78) {
          const irisGlow = 1 - r / 0.78;
          rgb = mixRgb(eyeCol, [255, 255, 255], irisGlow * 0.55);
          em = mixRgb(eyeCol, [255, 255, 255], irisGlow * 0.45);
        } else {
          rgb = [22, 20, 28];
          em = mixRgb(eyeCol, [0, 0, 0], 0.5);
        }
        rough = 28;
        metal = 10;
      } else if (row === 1 && col === 0) {
        // JACKET_MAIN (with lightning veins on Jax / brocade on Borax / purple-gold trim on Kai-Jax)
        rgb = mixRgb(cJacket, cJacketAcc, v > 0.82 || v < 0.12 ? 0.55 : 0);
        if (spec.hasLightningSleeves) {
          const bolt = Math.abs(Math.sin(v * 18 + Math.sin(u * 14) * 1.8) - 0.92);
          if (bolt < 0.055) {
            rgb = mixRgb(rgb, cLightning, 0.85);
            em = mixRgb(cLightning, [0, 0, 0], 0.25);
          }
        }
        if (spec.id === 'borax') {
          const diamond = Math.abs(((u * 8) % 1) - 0.5) + Math.abs(((v * 8) % 1) - 0.5);
          if (Math.abs(diamond - 0.48) < 0.06) {
            rgb = mixRgb(rgb, cGold, 0.75);
            metal = 165;
          }
        }
        rough = 148;
        hVal = 0.5 + weave * 0.25;
      } else if (row === 1 && col === 1) {
        // JACKET_ACCENT (Royal purple hood/lapels, cobalt collar, etc.)
        const trimBand = u < 0.1 || u > 0.9;
        rgb = trimBand ? mixRgb(cGold, cJacketAcc, 0.25) : cJacketAcc;
        rough = trimBand ? 75 : 155;
        metal = trimBand ? 190 : 30;
        hVal = 0.5 + weave * 0.22;
      } else if (row === 1 && col === 2) {
        // INNER_SHIRT / CALLIGRAPHY SCROLL
        rgb = cInner;
        if (spec.id === 'borax' && Math.abs(u - 0.5) < 0.16) {
          // Kanji/rune brush strokes on white scroll sash
          const glyph = Math.sin(v * 52) * Math.cos(u * 38);
          if (glyph > 0.35) rgb = [28, 32, 44];
        }
        rough = 175;
        metal = 15;
        hVal = 0.5 + weave * 0.2;
      } else if (row === 2 && col === 0) {
        // PANTS_CARGO
        const strap = Math.abs(v - 0.42) < 0.045 || Math.abs(v - 0.72) < 0.035;
        rgb = strap ? cJacketAcc : cPants;
        rough = strap ? 120 : 178;
        metal = strap ? 60 : 18;
        hVal = 0.5 + weave * 0.28 + (strap ? 0.2 : 0);
      } else if (row === 2 && col === 1) {
        // SNEAKER_BODY / COMBAT BOOTS
        const sole = v < 0.24;
        const stripe = Math.abs(u - v * 0.8 - 0.15) < 0.09;
        rgb = sole ? [245, 245, 250] : stripe ? cJacketAcc : cSneaker;
        if (spec.id === 'boryn' || spec.id === 'borax') {
          rgb = sole ? [32, 28, 26] : stripe ? cGold : cSneaker;
        }
        rough = sole ? 140 : 105;
        metal = stripe ? 110 : 35;
        hVal = 0.5 + (sole ? Math.sin(u * 50) * 0.25 : weave * 0.18);
      } else if (row === 2 && col === 2) {
        // ARMOR_GOLD / METALLIC TRIM
        const bevel = Math.min(u, 1 - u, v, 1 - v);
        rgb = bevel < 0.08 ? mixRgb(cGold, [255, 250, 220], 0.45) : cGold;
        rough = 68;
        metal = 228;
        hVal = 0.5 + (bevel < 0.08 ? 0.3 : 0);
      } else if (row === 2 && col === 3) {
        // SASH_TABARD (with runic markings!)
        const rune = Math.abs(u - 0.5) < 0.22 && Math.sin(v * 44) * Math.cos(u * 30) > 0.38;
        rgb = rune ? mixRgb(cGold, [20, 16, 18], spec.id === 'boryn' ? 0.75 : 0.15) : cSash;
        if (spec.id === 'kaijax' && Math.abs(u - 0.5) > 0.34) {
          rgb = [126, 34, 206];
        }
        rough = 152;
        metal = rune ? 140 : 20;
        hVal = 0.5 + weave * 0.22;
      } else if (row === 3 && col === 0) {
        // SPIDER_CHITIN (Obsidian carapace + gold joint + glowing violet Memory-Web vein)
        const vein = Math.abs(u - 0.5) < 0.08 || v > 0.82;
        const goldRing = Math.abs(v - 0.18) < 0.05;
        rgb = goldRing ? cGold : vein ? cSpiderGlow : cSpider;
        em = vein ? mixRgb(cSpiderGlow, [255, 255, 255], 0.25) : [0, 0, 0];
        rough = 52;
        metal = goldRing ? 230 : 185;
        hVal = 0.5 + (goldRing ? 0.28 : Math.sin(u * 24) * 0.15);
      } else if (row === 3 && col === 1) {
        // STORM_MANE (Roaring electric-blue flame gradient!)
        rgb = mixRgb(cManeBase, cManeTip, Math.pow(v, 0.75));
        const arc = Math.sin(u * 28 + v * 16) > 0.45 ? 1 : 0.65;
        em = mixRgb(cManeBase, cManeTip, v * arc);
        rough = 78;
        metal = 35;
        hVal = 0.5 + furGrain * 0.4;
      } else if (row === 3 && col === 2) {
        // TAIL_EMBER (or striped tiger / lion tail for Boryn / Borax, or Storm Current when blended)
        if (spec.id === 'kaijax') {
          rgb = mixRgb([234, 88, 12], [253, 224, 71], Math.pow(v, 0.8));
          em = mixRgb([249, 115, 22], [253, 186, 116], v * 0.85);
          rough = 90;
        } else if (spec.id === 'boryn') {
          const ring = Math.sin(v * Math.PI * 9) > 0.15;
          rgb = ring ? [22, 18, 15] : cFur1;
          rough = 195;
        } else {
          rgb = v > 0.75 ? cFur2 : cFur1;
          rough = 190;
        }
        hVal = 0.5 + furGrain * 0.35;
      } else if (row === 3 && col === 3) {
        // TAIL_MEMORY (Kai-Jax split: left half = Storm Current blue, right half = Memory Weave violet!)
        if (u < 0.5) {
          rgb = mixRgb([2, 132, 199], [125, 211, 252], Math.pow(v, 0.8));
          em = mixRgb([14, 165, 233], [186, 230, 253], v * 0.85);
        } else {
          rgb = mixRgb([109, 40, 217], [216, 180, 254], Math.pow(v, 0.8));
          em = mixRgb(cTailMemory, [233, 213, 255], v * 0.85);
        }
        rough = 88;
        metal = 30;
        hVal = 0.5 + furGrain * 0.35;
      }

      base[idx] = rgb[0];
      base[idx + 1] = rgb[1];
      base[idx + 2] = rgb[2];
      base[idx + 3] = 255;

      orm[idx] = Math.max(0, Math.min(255, ao));
      orm[idx + 1] = Math.max(0, Math.min(255, rough));
      orm[idx + 2] = Math.max(0, Math.min(255, metal));
      orm[idx + 3] = 255;

      emis[idx] = em[0];
      emis[idx + 1] = em[1];
      emis[idx + 2] = em[2];
      emis[idx + 3] = 255;

      heightField[py * SIZE + px] = hVal;
    }
  }

  // Compute tangent-space normal map from heightField
  for (let py = 0; py < SIZE; py++) {
    const ym = Math.max(0, py - 1);
    const yp = Math.min(SIZE - 1, py + 1);
    for (let px = 0; px < SIZE; px++) {
      const xm = Math.max(0, px - 1);
      const xp = Math.min(SIZE - 1, px + 1);
      const dx = (heightField[py * SIZE + xp] - heightField[py * SIZE + xm]) * 2.2;
      const dy = (heightField[yp * SIZE + px] - heightField[ym * SIZE + px]) * 2.2;
      const nx = -dx;
      const ny = -dy;
      const nz = 1.0;
      const len = Math.hypot(nx, ny, nz) || 1;
      const idx = (py * SIZE + px) * 4;
      norm[idx] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      norm[idx + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      norm[idx + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      norm[idx + 3] = 255;
    }
  }

  return {
    baseColorPng: encodeRgbaPng(SIZE, SIZE, base),
    ormPng: encodeRgbaPng(SIZE, SIZE, orm),
    normalPng: encodeRgbaPng(SIZE, SIZE, norm),
    emissivePng: encodeRgbaPng(SIZE, SIZE, emis),
  };
}

// ---------------------------------------------------------------------------
// 2. Sculpted Organic Mesh Builder (Continuous Lofted Surfaces + Smooth Normals)
// ---------------------------------------------------------------------------
class SculptMeshAccumulator {
  constructor() {
    this.positions = []; // [x, y, z]
    this.uvs = [];       // [u, v]
    this.tags = [];      // metadata per vertex for skinning & facial morphs
    this.indices = [];   // triangle indices
  }

  get vertexCount() {
    return this.positions.length;
  }

  mapTileUv(tile, uLocal, vLocal, uSubRange = null) {
    const [col, row] = tile;
    let uIn = Math.max(0.04, Math.min(0.96, uLocal));
    if (uSubRange) {
      uIn = uSubRange[0] + (uSubRange[1] - uSubRange[0]) * uIn;
    }
    const vIn = Math.max(0.04, Math.min(0.96, vLocal));
    return [(col + uIn) * 0.25, (row + vIn) * 0.25];
  }

  /**
   * Lofts a smooth organic anatomical tube/garment across arbitrary 3D rings.
   * Supports closed tubes (limbs, head, fangs, tails) and open C-shells (open jackets, capes, sashes).
   */
  addLoft(rings, opts) {
    const {
      radialSegs = 16,
      tile = TILES.FUR_PRIMARY,
      splitTilePositiveX = null,
      uSubRange = null,
      thetaStart = 0,
      thetaLength = Math.PI * 2,
      closedCircle = Math.abs(thetaLength - Math.PI * 2) < 1e-4,
      capStart = true,
      capEnd = true,
      tag = 'body',
      doubleSidedShell = false,
      shellThickness = 0.014,
    } = opts;

    const ringCount = rings.length;
    const cols = radialSegs + 1;
    const baseVertex = this.vertexCount;

    const rotMat = new THREE.Matrix4();
    const euler = new THREE.Euler();
    const pt = new THREE.Vector3();

    for (let r = 0; r < ringCount; r++) {
      const ring = rings[r];
      const vFrac = ringCount > 1 ? r / (ringCount - 1) : 0.5;
      euler.set(ring.pitch || 0, ring.yaw || 0, ring.roll || 0, 'YXZ');
      rotMat.makeRotationFromEuler(euler);

      for (let s = 0; s < cols; s++) {
        const uFrac = s / radialSegs;
        const theta = thetaStart + uFrac * thetaLength;
        const lobeScale = ring.lobe ? ring.lobe(theta, vFrac) : 1.0;
        const lx = Math.sin(theta) * ring.rx * lobeScale;
        const lz = Math.cos(theta) * ring.rz * lobeScale;
        const ly = ring.crown ? ring.crown(theta) : 0;

        pt.set(lx, ly, lz).applyMatrix4(rotMat);
        const wx = ring.cx + pt.x;
        const wy = ring.cy + pt.y;
        const wz = ring.cz + pt.z;

        const chosenTile = splitTilePositiveX && wx > 0.002 ? splitTilePositiveX : tile;
        const [uAtlas, vAtlas] = this.mapTileUv(chosenTile, uFrac, vFrac, uSubRange);

        this.positions.push([wx, wy, wz]);
        this.uvs.push([uAtlas, vAtlas]);
        this.tags.push({ tag, theta, vFrac, localX: lx, localZ: lz });
      }
    }

    for (let r = 0; r < ringCount - 1; r++) {
      for (let s = 0; s < radialSegs; s++) {
        const a = baseVertex + r * cols + s;
        const b = baseVertex + (r + 1) * cols + s;
        const c = baseVertex + (r + 1) * cols + (s + 1);
        const d = baseVertex + r * cols + (s + 1);
        this.indices.push(a, d, c);
        this.indices.push(a, c, b);
      }
    }

    if (closedCircle && capStart && rings[0].rx + rings[0].rz > 0.004) {
      const r0 = rings[0];
      const cIdx = this.vertexCount;
      const chosenTile = splitTilePositiveX && r0.cx > 0.002 ? splitTilePositiveX : tile;
      this.positions.push([r0.cx, r0.cy - (r0.capDrop || 0), r0.cz]);
      this.uvs.push(this.mapTileUv(chosenTile, 0.5, 0.05, uSubRange));
      this.tags.push({ tag, theta: 0, vFrac: 0, localX: 0, localZ: 0 });
      for (let s = 0; s < radialSegs; s++) {
        this.indices.push(cIdx, baseVertex + s + 1, baseVertex + s);
      }
    }

    if (closedCircle && capEnd && rings[ringCount - 1].rx + rings[ringCount - 1].rz > 0.004) {
      const rn = rings[ringCount - 1];
      const cIdx = this.vertexCount;
      const lastRow = baseVertex + (ringCount - 1) * cols;
      const chosenTile = splitTilePositiveX && rn.cx > 0.002 ? splitTilePositiveX : tile;
      this.positions.push([rn.cx, rn.cy + (rn.capLift || 0), rn.cz]);
      this.uvs.push(this.mapTileUv(chosenTile, 0.5, 0.95, uSubRange));
      this.tags.push({ tag, theta: 0, vFrac: 1, localX: 0, localZ: 0 });
      for (let s = 0; s < radialSegs; s++) {
        this.indices.push(cIdx, lastRow + s, lastRow + s + 1);
      }
    }

    // For open garments (jackets, capes, collars, sashes), build an inner lining & stitched rim!
    if (doubleSidedShell && !closedCircle) {
      const innerBase = this.vertexCount;
      for (let r = 0; r < ringCount; r++) {
        const ring = rings[r];
        const vFrac = ringCount > 1 ? r / (ringCount - 1) : 0.5;
        euler.set(ring.pitch || 0, ring.yaw || 0, ring.roll || 0, 'YXZ');
        rotMat.makeRotationFromEuler(euler);
        for (let s = 0; s < cols; s++) {
          const uFrac = s / radialSegs;
          const theta = thetaStart + uFrac * thetaLength;
          const lobeScale = ring.lobe ? ring.lobe(theta, vFrac) : 1.0;
          const lx = Math.sin(theta) * Math.max(0.01, ring.rx * lobeScale - shellThickness);
          const lz = Math.cos(theta) * Math.max(0.01, ring.rz * lobeScale - shellThickness);
          const ly = ring.crown ? ring.crown(theta) : 0;
          pt.set(lx, ly, lz).applyMatrix4(rotMat);
          const wx = ring.cx + pt.x;
          const wy = ring.cy + pt.y;
          const wz = ring.cz + pt.z;
          const [uAtlas, vAtlas] = this.mapTileUv(TILES.JACKET_ACCENT, uFrac, vFrac);
          this.positions.push([wx, wy, wz]);
          this.uvs.push([uAtlas, vAtlas]);
          this.tags.push({ tag, theta, vFrac, localX: lx, localZ: lz });
        }
      }
      for (let r = 0; r < ringCount - 1; r++) {
        for (let s = 0; s < radialSegs; s++) {
          const a = innerBase + r * cols + s;
          const b = innerBase + (r + 1) * cols + s;
          const c = innerBase + (r + 1) * cols + (s + 1);
          const d = innerBase + r * cols + (s + 1);
          // Reversed winding for inner lining
          this.indices.push(a, c, d);
          this.indices.push(a, b, c);
        }
      }
      // Stitch left/right lapel edges
      for (let r = 0; r < ringCount - 1; r++) {
        const o0 = baseVertex + r * cols;
        const o1 = baseVertex + (r + 1) * cols;
        const i0 = innerBase + r * cols;
        const i1 = innerBase + (r + 1) * cols;
        this.indices.push(o0, o1, i1, o0, i1, i0);

        const ro0 = baseVertex + r * cols + radialSegs;
        const ro1 = baseVertex + (r + 1) * cols + radialSegs;
        const ri0 = innerBase + r * cols + radialSegs;
        const ri1 = innerBase + (r + 1) * cols + radialSegs;
        this.indices.push(ro0, ri1, ro1, ro0, ri0, ri1);
      }
    }
  }

  /**
   * Lofts an organic tapered tube along a 3D CatmullRomCurve3 spline
   * (used for curved saber fangs, dorsal spider legs, roaring storm-mane crests, and 3 physical tails).
   */
  addSplineTube(points, radiusFn, opts) {
    const {
      tubularSegs = 16,
      radialSegs = 12,
      tile = TILES.FUR_PRIMARY,
      uSubRange = null,
      tag = 'spline',
      flattenY = 1.0,
    } = opts;

    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    const frames = curve.computeFrenetFrames(tubularSegs, false);
    const cols = radialSegs + 1;
    const baseVertex = this.vertexCount;
    const pt = new THREE.Vector3();
    const offset = new THREE.Vector3();

    for (let i = 0; i <= tubularSegs; i++) {
      const vFrac = i / tubularSegs;
      curve.getPointAt(vFrac, pt);
      const N = frames.normals[i];
      const B = frames.binormals[i];
      const rad = Math.max(0.0025, radiusFn(vFrac));

      for (let s = 0; s < cols; s++) {
        const uFrac = s / radialSegs;
        const theta = uFrac * Math.PI * 2;
        const c = Math.cos(theta) * rad;
        const sn = Math.sin(theta) * rad * flattenY;
        offset.set(0, 0, 0).addScaledVector(N, c).addScaledVector(B, sn);
        const wx = pt.x + offset.x;
        const wy = pt.y + offset.y;
        const wz = pt.z + offset.z;

        const [uAtlas, vAtlas] = this.mapTileUv(tile, uFrac, vFrac, uSubRange);
        this.positions.push([wx, wy, wz]);
        this.uvs.push([uAtlas, vAtlas]);
        this.tags.push({ tag, theta, vFrac, splineT: vFrac });
      }
    }

    for (let i = 0; i < tubularSegs; i++) {
      for (let s = 0; s < radialSegs; s++) {
        const a = baseVertex + i * cols + s;
        const b = baseVertex + (i + 1) * cols + s;
        const c = baseVertex + (i + 1) * cols + (s + 1);
        const d = baseVertex + i * cols + (s + 1);
        this.indices.push(a, b, c);
        this.indices.push(a, c, d);
      }
    }

    // Cap tip
    const endPt = curve.getPointAt(1.0);
    const tipIdx = this.vertexCount;
    this.positions.push([endPt.x, endPt.y, endPt.z]);
    this.uvs.push(this.mapTileUv(tile, 0.5, 0.96, uSubRange));
    this.tags.push({ tag, theta: 0, vFrac: 1, splineT: 1 });
    const lastRing = baseVertex + tubularSegs * cols;
    for (let s = 0; s < radialSegs; s++) {
      this.indices.push(tipIdx, lastRing + s + 1, lastRing + s);
    }
  }

  /**
   * Computes smooth welded vertex normals across UV-seam vertices sharing identical 3D positions.
   */
  computeSmoothNormals(posArray = this.positions) {
    const vCount = posArray.length;
    const accum = new Float32Array(vCount * 3);

    const ax = new THREE.Vector3();
    const bx = new THREE.Vector3();
    const cx = new THREE.Vector3();
    const e1 = new THREE.Vector3();
    const e2 = new THREE.Vector3();
    const fn = new THREE.Vector3();

    for (let i = 0; i < this.indices.length; i += 3) {
      const i0 = this.indices[i];
      const i1 = this.indices[i + 1];
      const i2 = this.indices[i + 2];
      const p0 = posArray[i0];
      const p1 = posArray[i1];
      const p2 = posArray[i2];
      ax.set(p0[0], p0[1], p0[2]);
      bx.set(p1[0], p1[1], p1[2]);
      cx.set(p2[0], p2[1], p2[2]);
      e1.subVectors(bx, ax);
      e2.subVectors(cx, ax);
      fn.crossVectors(e1, e2);

      for (const vi of [i0, i1, i2]) {
        accum[vi * 3] += fn.x;
        accum[vi * 3 + 1] += fn.y;
        accum[vi * 3 + 2] += fn.z;
      }
    }

    // Weld normals across coincident seam vertices (quantized to 0.2mm)
    const seamBuckets = new Map();
    for (let v = 0; v < vCount; v++) {
      const p = posArray[v];
      const key = `${Math.round(p[0] * 5000)}_${Math.round(p[1] * 5000)}_${Math.round(p[2] * 5000)}`;
      let list = seamBuckets.get(key);
      if (!list) {
        list = [];
        seamBuckets.set(key, list);
      }
      list.push(v);
    }

    const out = new Float32Array(vCount * 3);
    for (const list of seamBuckets.values()) {
      let sx = 0;
      let sy = 0;
      let sz = 0;
      for (const v of list) {
        sx += accum[v * 3];
        sy += accum[v * 3 + 1];
        sz += accum[v * 3 + 2];
      }
      const len = Math.hypot(sx, sy, sz) || 1;
      const nx = sx / len;
      const ny = sy / len;
      const nz = sz / len;
      for (const v of list) {
        out[v * 3] = nx;
        out[v * 3 + 1] = ny;
        out[v * 3 + 2] = nz;
      }
    }
    return out;
  }
}

// ---------------------------------------------------------------------------
// 3. Canonical Character Roster Specifications
// ---------------------------------------------------------------------------
const ROSTER_SPECS = [
  {
    id: 'kai',
    height: 1.82,
    shoulderWidth: 0.245,
    hipWidth: 0.135,
    bulk: 0.96,
    spiderCount: 4,
    maneCount: 0,
    tailMode: 'none',
    hasHorns: true,
    garmentStyle: 'techwear_kai',
    hasSubtleStripes: true,
    hasBoldStripes: false,
    stripeFreq: 8,
    palette: {
      furPrimary: '#EAEFF8',
      furStripe: '#362C4C',
      furSecondary: '#F8FAFC',
      eyeLeft: '#A855F7',
      eyeRight: '#A855F7',
      jacketMain: '#F1F5F9',
      jacketAccent: '#6D28D9',
      innerShirt: '#E2E8F0',
      pants: '#131620',
      sneaker: '#F1F5F9',
      armorTrim: '#F59E0B',
      sash: '#7C3AED',
      tailPrimary: '#F97316',
    },
  },
  {
    id: 'jax',
    height: 1.88,
    shoulderWidth: 0.275,
    hipWidth: 0.145,
    bulk: 1.08,
    spiderCount: 0,
    maneCount: 7,
    tailMode: 'none',
    hasHorns: false,
    garmentStyle: 'techwear_jax',
    hasLightningSleeves: true,
    hasSubtleStripes: false,
    hasBoldStripes: false,
    palette: {
      furPrimary: '#151A25',
      furStripe: '#0B0E15',
      furSecondary: '#1F2636',
      eyeLeft: '#38BDF8',
      eyeRight: '#38BDF8',
      jacketMain: '#10141E',
      jacketAccent: '#1D4ED8',
      jacketGlow: '#38BDF8',
      innerShirt: '#161C2A',
      pants: '#121621',
      sneaker: '#151B28',
      armorTrim: '#38BDF8',
      sash: '#2563EB',
      tailPrimary: '#38BDF8',
    },
  },
  {
    id: 'kaijax',
    height: 2.04,
    shoulderWidth: 0.305,
    hipWidth: 0.158,
    bulk: 1.16,
    spiderCount: 4,
    maneCount: 7,
    tailMode: 'tri_canon', // STRICTLY 3 PHYSICAL TAILS: Ember, Storm, Memory!
    hasHorns: true,
    splitFurYinYang: true, // -X (viewer-left) White + Gold-Ember Eye; +X (viewer-right) Black + Storm-Blue Eye!
    garmentStyle: 'fusion_coat',
    hasLightningSleeves: true,
    hasSubtleStripes: true,
    hasBoldStripes: false,
    stripeFreq: 9,
    palette: {
      furPrimary: '#EDF2FA',   // Viewer-left (-X) Silver-White Fur
      furStripe: '#1E1B2E',
      furSecondary: '#131722', // Viewer-right (+X) Obsidian-Black Fur
      eyeLeft: '#38BDF8',      // +X (viewer-right) Storm-Blue Eye
      eyeRight: '#F59E0B',     // -X (viewer-left) Ember-Gold Eye
      jacketMain: '#161424',
      jacketAccent: '#6D28D9',
      jacketGlow: '#A855F7',
      innerShirt: '#F1F5F9',
      pants: '#131420',
      sneaker: '#1D1830',
      armorTrim: '#D4AF37',
      sash: '#F8FAFC',
      tailPrimary: '#F97316',
    },
  },
  {
    id: 'boryn',
    height: 2.12,
    shoulderWidth: 0.34,
    hipWidth: 0.175,
    bulk: 1.32,
    spiderCount: 0,
    maneCount: 0,
    tailMode: 'single',
    hasHorns: false,
    garmentStyle: 'shield_harness',
    hasBoldStripes: true,
    stripeFreq: 10,
    palette: {
      furPrimary: '#DF7A26',
      furStripe: '#17120F',
      furSecondary: '#F4E6D2',
      eyeLeft: '#F59E0B',
      eyeRight: '#F59E0B',
      jacketMain: '#261E1B',
      jacketAccent: '#453226',
      innerShirt: '#DF7A26',
      pants: '#1B1D24',
      sneaker: '#2B221D',
      armorTrim: '#C58B43',
      sash: '#C85A19',
      tailPrimary: '#DF7A26',
    },
  },
  {
    id: 'borax',
    height: 2.20,
    shoulderWidth: 0.33,
    hipWidth: 0.172,
    bulk: 1.24,
    spiderCount: 0,
    maneCount: 0,
    hasLionMane: true,
    tailMode: 'single',
    hasHorns: false,
    garmentStyle: 'storm_ronin',
    hasLightningSleeves: true,
    hasSubtleStripes: false,
    hasBoldStripes: false,
    palette: {
      furPrimary: '#989086',   // Scarred grey-taupe sabertooth lion muzzle/fur
      furStripe: '#57524C',
      furSecondary: '#E2E8F2', // Voluminous silver-white lion mane
      eyeLeft: '#F59E0B',
      eyeRight: '#F59E0B',
      jacketMain: '#16243A',   // Deep Storm Ronin indigo haori
      jacketAccent: '#1E3A5F',
      jacketGlow: '#38BDF8',
      innerShirt: '#F1EFEA',   // White calligraphy scroll sash
      pants: '#121D30',
      sneaker: '#1C2434',
      armorTrim: '#D4AF37',    // Gold samurai trim
      sash: '#1D3557',
      tailPrimary: '#989086',
    },
  },
];

// ---------------------------------------------------------------------------
// 4. Unified Skeleton + Anatomical Sculpture + Skinning + 19 Animations
// ---------------------------------------------------------------------------
function buildSkeletonDefinition(spec) {
  const H = spec.height;
  const S = H / 1.85; // Proportional height scale
  const shX = spec.shoulderWidth;
  const hipX = spec.hipWidth;

  const bones = [];
  const byName = new Map();

  function addBone(name, parentName, worldPos) {
    const parent = parentName ? byName.get(parentName) : null;
    const localPos = parent
      ? [worldPos[0] - parent.worldPos[0], worldPos[1] - parent.worldPos[1], worldPos[2] - parent.worldPos[2]]
      : [...worldPos];
    const b = {
      index: bones.length,
      name,
      parentIndex: parent ? parent.index : -1,
      worldPos,
      localPos,
    };
    bones.push(b);
    byName.set(name, b);
    return b;
  }

  // Core Spine, Neck, Sabertooth Head, Jaw & Ears
  addBone('pelvis', null, [0, 0.94 * S, 0]);
  addBone('spine_01', 'pelvis', [0, 1.07 * S, 0]);
  addBone('spine_02', 'spine_01', [0, 1.21 * S, 0.01 * S]);
  addBone('chest', 'spine_02', [0, 1.35 * S, 0.01 * S]);
  addBone('neck', 'chest', [0, 1.49 * S, 0.02 * S]);
  addBone('head', 'neck', [0, 1.58 * S, 0.03 * S]);
  addBone('jaw', 'head', [0, 1.52 * S, 0.08 * S]);
  addBone('ear_L', 'head', [0.13 * S, 1.71 * S, -0.01 * S]);
  addBone('ear_R', 'head', [-0.13 * S, 1.71 * S, -0.01 * S]);

  // Arms & Articulated Hands (+X = Left, -X = Right when facing +Z)
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    addBone(`clavicle_${suf}`, 'chest', [sign * 0.09 * S, 1.43 * S, 0.01 * S]);
    addBone(`upper_arm_${suf}`, `clavicle_${suf}`, [sign * shX, 1.41 * S, 0]);
    addBone(`forearm_${suf}`, `upper_arm_${suf}`, [sign * (shX + 0.05 * S), 1.14 * S, 0.01 * S]);
    addBone(`hand_${suf}`, `forearm_${suf}`, [sign * (shX + 0.08 * S), 0.88 * S, 0.04 * S]);
  }

  // Legs, Ankles & Clawed Feet
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    addBone(`thigh_${suf}`, 'pelvis', [sign * hipX, 0.90 * S, 0]);
    addBone(`shin_${suf}`, `thigh_${suf}`, [sign * (hipX + 0.01 * S), 0.49 * S, 0.02 * S]);
    addBone(`foot_${suf}`, `shin_${suf}`, [sign * (hipX + 0.015 * S), 0.11 * S, 0.01 * S]);
    addBone(`toe_${suf}`, `foot_${suf}`, [sign * (hipX + 0.015 * S), 0.04 * S, 0.14 * S]);
  }

  // Kai & Kai-Jax: 4 Articulated Dorsal Spider Limbs (12 bones: spider_UL/UR/LL/LR_01..03)
  const spiderChains = [];
  if (spec.spiderCount === 4) {
    const spiderConfigs = [
      { prefix: 'spider_UL', sign: 1, upper: true },
      { prefix: 'spider_UR', sign: -1, upper: true },
      { prefix: 'spider_LL', sign: 1, upper: false },
      { prefix: 'spider_LR', sign: -1, upper: false },
    ];
    for (const cfg of spiderConfigs) {
      const s = cfg.sign;
      const p0 = cfg.upper
        ? [s * 0.11 * S, 1.40 * S, -0.14 * S]
        : [s * 0.13 * S, 1.24 * S, -0.15 * S];
      const p1 = cfg.upper
        ? [s * 0.38 * S, 1.78 * S, -0.26 * S]
        : [s * 0.44 * S, 1.38 * S, -0.28 * S];
      const p2 = cfg.upper
        ? [s * 0.52 * S, 1.98 * S, -0.06 * S]
        : [s * 0.62 * S, 1.06 * S, -0.10 * S];
      const pTip = cfg.upper
        ? [s * 0.30 * S, 1.84 * S, 0.16 * S]
        : [s * 0.48 * S, 0.64 * S, 0.14 * S];

      addBone(`${cfg.prefix}_01`, 'chest', p0);
      addBone(`${cfg.prefix}_02`, `${cfg.prefix}_01`, p1);
      addBone(`${cfg.prefix}_03`, `${cfg.prefix}_02`, p2);
      spiderChains.push({ ...cfg, points: [p0, p1, p2, pTip] });
    }
  }

  // Jax & Kai-Jax: 7 Electric-Blue Storm Mane Spikes (mane_01..07)
  const maneChains = [];
  if (spec.maneCount === 7) {
    for (let i = 1; i <= 7; i++) {
      const u = (i - 4) / 3; // -1 .. +1
      const base = [u * 0.15 * S, (1.67 - Math.abs(u) * 0.08) * S, -0.06 * S];
      const mid = [u * 0.28 * S, (1.84 - Math.abs(u) * 0.06) * S, -0.26 * S];
      const tip = [u * 0.36 * S, (1.96 - Math.abs(u) * 0.10) * S, -0.52 * S];
      addBone(`mane_0${i}`, 'head', base);
      maneChains.push({ name: `mane_0${i}`, points: [base, mid, tip] });
    }
  }

  // Physical Tails (3-Tail Canon Rule for Kai-Jax; 1 Tail for Boryn & Borax; 0 for Kai & Jax)
  const tailChains = [];
  if (spec.tailMode === 'tri_canon') {
    const triDefs = [
      {
        prefix: 'tail_ember',
        tile: TILES.TAIL_EMBER,
        uSub: null,
        pts: [
          [-0.08 * S, 0.93 * S, -0.14 * S],
          [-0.26 * S, 0.72 * S, -0.38 * S],
          [-0.42 * S, 0.46 * S, -0.52 * S],
          [-0.32 * S, 0.28 * S, -0.26 * S],
          [-0.20 * S, 0.52 * S, -0.12 * S],
        ],
      },
      {
        prefix: 'tail_storm',
        tile: TILES.TAIL_MEMORY,
        uSub: [0.04, 0.46], // Left half of tile = Storm Current electric-blue!
        pts: [
          [0, 0.93 * S, -0.15 * S],
          [0.04 * S, 0.68 * S, -0.44 * S],
          [0.10 * S, 0.38 * S, -0.60 * S],
          [0.02 * S, 0.22 * S, -0.32 * S],
          [-0.02 * S, 0.44 * S, -0.18 * S],
        ],
      },
      {
        prefix: 'tail_memory',
        tile: TILES.TAIL_MEMORY,
        uSub: [0.54, 0.96], // Right half of tile = Memory Weave violet!
        pts: [
          [0.08 * S, 0.93 * S, -0.14 * S],
          [0.28 * S, 0.72 * S, -0.38 * S],
          [0.46 * S, 0.48 * S, -0.50 * S],
          [0.36 * S, 0.30 * S, -0.24 * S],
          [0.24 * S, 0.56 * S, -0.10 * S],
        ],
      },
    ];
    for (const td of triDefs) {
      for (let seg = 1; seg <= 4; seg++) {
        const bName = `${td.prefix}_0${seg}`;
        const pName = seg === 1 ? 'pelvis' : `${td.prefix}_0${seg - 1}`;
        addBone(bName, pName, td.pts[seg - 1]);
      }
      tailChains.push(td);
    }
  } else if (spec.tailMode === 'single') {
    const pts = [
      [0, 0.93 * S, -0.15 * S],
      [0.08 * S, 0.72 * S, -0.38 * S],
      [0.18 * S, 0.48 * S, -0.52 * S],
      [0.24 * S, 0.34 * S, -0.36 * S],
      [0.20 * S, 0.46 * S, -0.22 * S],
    ];
    for (let seg = 1; seg <= 4; seg++) {
      const bName = `tail_0${seg}`;
      const pName = seg === 1 ? 'pelvis' : `tail_0${seg - 1}`;
      addBone(bName, pName, pts[seg - 1]);
    }
    tailChains.push({ prefix: 'tail', tile: TILES.TAIL_EMBER, uSub: null, pts });
  }

  return { bones, byName, S, spiderChains, maneChains, tailChains };
}

function sculptCharacterGeometry(spec, skel, tier) {
  const isMaster = tier === 'master';
  const R_BODY = isMaster ? 24 : 12;
  const R_LIMB = isMaster ? 18 : 10;
  const R_DETAIL = isMaster ? 14 : 8;
  const SUB_RINGS = isMaster ? 2 : 1;

  const { S, byName, spiderChains, maneChains, tailChains } = skel;
  const B = spec.bulk;
  const shX = spec.shoulderWidth;
  const hipX = spec.hipWidth;
  const splitFur = spec.splitFurYinYang ? TILES.FUR_SECONDARY : null;

  const acc = new SculptMeshAccumulator();

  const subdivideRings = (rings, mult) => {
    if (mult <= 1) return rings;
    const out = [];
    for (let i = 0; i < rings.length - 1; i++) {
      const a = rings[i];
      const b = rings[i + 1];
      out.push(a);
      for (let m = 1; m < mult; m++) {
        const t = m / mult;
        out.push({
          cx: a.cx + (b.cx - a.cx) * t,
          cy: a.cy + (b.cy - a.cy) * t,
          cz: a.cz + (b.cz - a.cz) * t,
          rx: a.rx + (b.rx - a.rx) * t,
          rz: a.rz + (b.rz - a.rz) * t,
          pitch: (a.pitch || 0) + ((b.pitch || 0) - (a.pitch || 0)) * t,
          yaw: (a.yaw || 0) + ((b.yaw || 0) - (a.yaw || 0)) * t,
          roll: (a.roll || 0) + ((b.roll || 0) - (a.roll || 0)) * t,
          lobe: a.lobe || b.lobe,
          crown: a.crown || b.crown,
        });
      }
    }
    out.push(rings[rings.length - 1]);
    return out;
  };

  // 1. Muscular Core Torso & Neck (continuous sculpted anatomy)
  const torsoTile =
    spec.garmentStyle === 'shield_harness'
      ? TILES.FUR_PRIMARY
      : spec.garmentStyle === 'fusion_coat'
        ? TILES.FUR_PRIMARY
        : TILES.INNER_SHIRT;
  const torsoSplit = spec.garmentStyle === 'fusion_coat' ? splitFur : null;

  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 0.88 * S, cz: 0, rx: 0.145 * B * S, rz: 0.115 * B * S },
        { cx: 0, cy: 1.02 * S, cz: 0, rx: 0.138 * B * S, rz: 0.112 * B * S },
        {
          cx: 0,
          cy: 1.18 * S,
          cz: 0.01 * S,
          rx: 0.165 * B * S,
          rz: 0.132 * B * S,
          lobe: (th) => 1 + Math.max(0, Math.cos(th)) * 0.08, // Abdominal / ribcage contour
        },
        {
          cx: 0,
          cy: 1.35 * S,
          cz: 0.015 * S,
          rx: 0.195 * B * S,
          rz: 0.148 * B * S,
          lobe: (th) => 1 + Math.pow(Math.max(0, Math.cos(th)), 2) * 0.12, // Pectoral sculpt
        },
        { cx: 0, cy: 1.46 * S, cz: 0.015 * S, rx: 0.115 * B * S, rz: 0.105 * B * S },
        { cx: 0, cy: 1.56 * S, cz: 0.025 * S, rx: 0.095 * B * S, rz: 0.095 * B * S },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_BODY, tile: torsoTile, splitTilePositiveX: torsoSplit, tag: 'torso' }
  );

  // 2. Sculpted Sabertooth Beast Cranium + Cheek Ruffs
  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 1.51 * S, cz: 0.02 * S, rx: 0.105 * S, rz: 0.105 * S, capDrop: 0.01 * S },
        {
          cx: 0,
          cy: 1.56 * S,
          cz: 0.03 * S,
          rx: 0.162 * S,
          rz: 0.142 * S,
          // Sculpted flared sabertooth cheek ruffs laterally!
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 3) * 0.24 + (Math.cos(th) < -0.3 ? 0.08 : 0),
        },
        {
          cx: 0,
          cy: 1.63 * S,
          cz: 0.03 * S,
          rx: 0.146 * S,
          rz: 0.148 * S,
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 4) * 0.14,
        },
        { cx: 0, cy: 1.70 * S, cz: 0.015 * S, rx: 0.118 * S, rz: 0.128 * S },
        { cx: 0, cy: 1.75 * S, cz: 0.0 * S, rx: 0.068 * S, rz: 0.082 * S, capLift: 0.018 * S },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_BODY, tile: TILES.FUR_PRIMARY, splitTilePositiveX: splitFur, tag: 'head' }
  );

  // 3. Sculpted Sabertooth Snout, Nasal Bridge & Upper Muzzle Cushions
  const snoutTile = spec.id === 'boryn' ? TILES.FUR_SECONDARY : TILES.FUR_PRIMARY;
  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 1.585 * S, cz: 0.10 * S, rx: 0.095 * S, rz: 0.065 * S, pitch: Math.PI * 0.46 },
        {
          cx: 0,
          cy: 1.565 * S,
          cz: 0.165 * S,
          rx: 0.082 * S,
          rz: 0.058 * S,
          pitch: Math.PI * 0.48,
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 2) * 0.18, // Whisker pad swell
        },
        {
          cx: 0,
          cy: 1.552 * S,
          cz: 0.222 * S,
          rx: 0.068 * S,
          rz: 0.048 * S,
          pitch: Math.PI * 0.5,
          capLift: 0.014 * S,
        },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_LIMB, tile: snoutTile, splitTilePositiveX: splitFur, tag: 'snout' }
  );

  // Sculpted Dark Nose Pad
  acc.addLoft(
    [
      { cx: 0, cy: 1.572 * S, cz: 0.225 * S, rx: 0.032 * S, rz: 0.022 * S, pitch: Math.PI * 0.5 },
      { cx: 0, cy: 1.568 * S, cz: 0.244 * S, rx: 0.022 * S, rz: 0.016 * S, pitch: Math.PI * 0.5, capLift: 0.006 * S },
    ],
    { radialSegs: 10, tile: TILES.PANTS_CARGO, tag: 'snout' }
  );

  // 4. Articulated Lower Jaw & Chin Beard/Ruff (bound to `jaw` bone + `roar` morph)
  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 1.505 * S, cz: 0.075 * S, rx: 0.078 * S, rz: 0.048 * S, pitch: Math.PI * 0.52 },
        { cx: 0, cy: 1.492 * S, cz: 0.145 * S, rx: 0.064 * S, rz: 0.042 * S, pitch: Math.PI * 0.52 },
        { cx: 0, cy: 1.486 * S, cz: 0.205 * S, rx: 0.046 * S, rz: 0.035 * S, pitch: Math.PI * 0.5, capLift: 0.012 * S },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_DETAIL, tile: snoutTile, splitTilePositiveX: splitFur, tag: 'jaw' }
  );

  // 5. Twin Oversized Curved Ivory Sabertooth Fangs!
  for (const sign of [-1, 1]) {
    acc.addSplineTube(
      [
        [sign * 0.054 * S, 1.545 * S, 0.185 * S],
        [sign * 0.058 * S, 1.495 * S, 0.205 * S],
        [sign * 0.056 * S, 1.440 * S, 0.208 * S],
        [sign * 0.050 * S, 1.392 * S, 0.196 * S],
      ],
      (t) => (1 - Math.pow(t, 1.35) * 0.88) * 0.022 * S * (spec.id === 'boryn' || spec.id === 'borax' ? 1.18 : 1.0),
      { tubularSegs: isMaster ? 10 : 6, radialSegs: isMaster ? 10 : 7, tile: TILES.IVORY_FANG, tag: 'fang' }
    );
  }

  // 6. Glowing Predator Eyes + Sculpted Eyelids & Brow Ridge
  for (const [sign, eyeTile, lidTag] of [
    [1, TILES.EYE_LEFT, 'eyelid_L'],   // +X (viewer-right)
    [-1, TILES.EYE_RIGHT, 'eyelid_R'], // -X (viewer-left)
  ]) {
    const ex = sign * 0.064 * S;
    const ey = 1.615 * S;
    const ez = 0.148 * S;
    acc.addLoft(
      [
        { cx: ex, cy: ey, cz: ez - 0.014 * S, rx: 0.028 * S, rz: 0.018 * S, pitch: Math.PI * 0.5, yaw: sign * 0.22 },
        { cx: ex, cy: ey, cz: ez + 0.012 * S, rx: 0.026 * S, rz: 0.017 * S, pitch: Math.PI * 0.5, yaw: sign * 0.22, capLift: 0.008 * S },
      ],
      { radialSegs: 12, tile: eyeTile, tag: 'eye' }
    );

    // Sculpted Upper Eyelid & Fierce Brow Ridge
    acc.addLoft(
      [
        { cx: ex - sign * 0.028 * S, cy: ey + 0.012 * S, cz: ez + 0.006 * S, rx: 0.012 * S, rz: 0.014 * S, roll: -sign * 0.35 },
        { cx: ex, cy: ey + 0.020 * S, cz: ez + 0.012 * S, rx: 0.015 * S, rz: 0.018 * S },
        { cx: ex + sign * 0.032 * S, cy: ey + 0.026 * S, cz: ez + 0.002 * S, rx: 0.013 * S, rz: 0.015 * S, roll: sign * 0.35 },
      ],
      { radialSegs: 8, tile: sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY, tag: lidTag }
    );
  }

  // 7. Pointed Tufted Sabertooth Ears (+ Twin Horn-Crests for Kai & Kai-Jax)
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    const earTile = sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY;
    acc.addSplineTube(
      [
        [sign * 0.115 * S, 1.695 * S, 0.0 * S],
        [sign * 0.165 * S, 1.775 * S, -0.02 * S],
        [sign * 0.195 * S, 1.855 * S, -0.045 * S],
      ],
      (t) => (1 - Math.pow(t, 1.2) * 0.85) * 0.046 * S,
      { tubularSegs: isMaster ? 8 : 5, radialSegs: isMaster ? 10 : 6, tile: earTile, tag: `ear_${suf}`, flattenY: 0.55 }
    );

    if (spec.hasHorns) {
      acc.addSplineTube(
        [
          [sign * 0.052 * S, 1.695 * S, 0.075 * S],
          [sign * 0.075 * S, 1.775 * S, 0.055 * S],
          [sign * 0.092 * S, 1.845 * S, 0.015 * S],
        ],
        (t) => (1 - t * 0.88) * 0.019 * S,
        { tubularSegs: 7, radialSegs: 8, tile: TILES.SPIDER_CHITIN, tag: 'head' }
      );
    }
  }

  // Borax Voluminous Silver-White Sabertooth Lion Mane!
  if (spec.hasLionMane) {
    const maneCount = isMaster ? 14 : 9;
    for (let m = 0; m < maneCount; m++) {
      const ang = -Math.PI * 0.72 + (m / (maneCount - 1)) * Math.PI * 1.44;
      if (Math.abs(ang) < 0.42) continue; // Keep face & fangs unobstructed in front!
      const sx = Math.sin(ang);
      const cz = Math.cos(ang);
      acc.addSplineTube(
        [
          [sx * 0.13 * S, 1.68 * S, cz * 0.11 * S],
          [sx * 0.25 * S, 1.62 * S, cz * 0.22 * S - 0.05 * S],
          [sx * 0.29 * S, 1.44 * S, cz * 0.26 * S - 0.10 * S],
          [sx * 0.24 * S, 1.28 * S, cz * 0.24 * S - 0.14 * S],
        ],
        (t) => Math.sin(Math.min(0.95, t * 0.85 + 0.15) * Math.PI) * 0.078 * S,
        { tubularSegs: isMaster ? 9 : 5, radialSegs: isMaster ? 9 : 6, tile: TILES.FUR_SECONDARY, tag: 'mane_lion' }
      );
    }
  }

  // 8. Signature Outerwear / Armor Sculptures (Authentic to Character Visual Library!)
  if (spec.garmentStyle === 'techwear_kai' || spec.garmentStyle === 'techwear_jax' || spec.garmentStyle === 'fusion_coat') {
    const isFusion = spec.garmentStyle === 'fusion_coat';
    // Open-front Street-Techwear Jacket / Armored Fusion Longcoat (leaves front V-opening!)
    const coatBottomY = isFusion ? 0.62 * S : 0.86 * S;
    acc.addLoft(
      subdivideRings(
        [
          { cx: 0, cy: coatBottomY, cz: -0.01 * S, rx: (isFusion ? 0.27 : 0.205) * B * S, rz: (isFusion ? 0.21 : 0.155) * B * S },
          { cx: 0, cy: 0.98 * S, cz: 0, rx: 0.185 * B * S, rz: 0.145 * B * S },
          { cx: 0, cy: 1.20 * S, cz: 0.005 * S, rx: 0.205 * B * S, rz: 0.158 * B * S },
          { cx: 0, cy: 1.41 * S, cz: 0.01 * S, rx: 0.225 * B * S, rz: 0.168 * B * S },
        ],
        SUB_RINGS
      ),
      {
        radialSegs: R_BODY,
        tile: TILES.JACKET_MAIN,
        thetaStart: 0.52, // Open front chest V!
        thetaLength: Math.PI * 2 - 1.04,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.015 * S,
        tag: 'jacket',
      }
    );

    // Sculpted Streetwear Hood / High Fusion Collar behind neck
    acc.addLoft(
      [
        { cx: 0, cy: 1.40 * S, cz: -0.02 * S, rx: 0.19 * B * S, rz: 0.16 * B * S },
        { cx: 0, cy: 1.53 * S, cz: -0.05 * S, rx: 0.21 * B * S, rz: 0.18 * B * S },
        { cx: 0, cy: isFusion ? 1.68 * S : 1.59 * S, cz: -0.08 * S, rx: 0.18 * B * S, rz: 0.15 * B * S },
      ],
      {
        radialSegs: R_DETAIL,
        tile: TILES.JACKET_ACCENT,
        thetaStart: Math.PI * 0.42,
        thetaLength: Math.PI * 1.16,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.014 * S,
        tag: 'collar',
      }
    );
  } else if (spec.garmentStyle === 'shield_harness') {
    // Boryn's Tactical Leather & Iron Harness + Skull Buckle Belt
    acc.addLoft(
      [
        { cx: 0, cy: 0.90 * S, cz: 0, rx: 0.175 * B * S, rz: 0.138 * B * S },
        { cx: 0, cy: 0.99 * S, cz: 0, rx: 0.172 * B * S, rz: 0.136 * B * S },
      ],
      { radialSegs: R_LIMB, tile: TILES.ARMOR_GOLD, tag: 'belt' }
    );
    acc.addLoft(
      [
        { cx: 0, cy: 1.16 * S, cz: 0.01 * S, rx: 0.19 * B * S, rz: 0.148 * B * S },
        { cx: 0, cy: 1.42 * S, cz: 0.01 * S, rx: 0.215 * B * S, rz: 0.162 * B * S },
      ],
      {
        radialSegs: R_BODY,
        tile: TILES.JACKET_MAIN,
        thetaStart: 0.42,
        thetaLength: Math.PI * 2 - 0.84,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.016 * S,
        tag: 'jacket',
      }
    );
  } else if (spec.garmentStyle === 'storm_ronin') {
    // Borax's Layered Navy-Indigo & Gold Storm Ronin Haori Robe
    acc.addLoft(
      subdivideRings(
        [
          { cx: 0, cy: 0.36 * S, cz: -0.02 * S, rx: 0.29 * B * S, rz: 0.23 * B * S },
          { cx: 0, cy: 0.72 * S, cz: -0.01 * S, rx: 0.23 * B * S, rz: 0.18 * B * S },
          { cx: 0, cy: 0.98 * S, cz: 0, rx: 0.195 * B * S, rz: 0.155 * B * S },
          { cx: 0, cy: 1.38 * S, cz: 0.01 * S, rx: 0.23 * B * S, rz: 0.172 * B * S },
        ],
        SUB_RINGS
      ),
      {
        radialSegs: R_BODY,
        tile: TILES.JACKET_MAIN,
        thetaStart: 0.30,
        thetaLength: Math.PI * 2 - 0.60,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.015 * S,
        tag: 'jacket',
      }
    );
  }

  // Sculpted Layered Pauldrons (Kai-Jax, Boryn, Borax) & Shoulder Emblems (Kai)
  if (spec.id === 'kaijax' || spec.id === 'boryn' || spec.id === 'borax' || spec.id === 'kai') {
    for (const sign of [-1, 1]) {
      const pScale = spec.id === 'kai' ? 0.68 : 1.0;
      acc.addLoft(
        [
          { cx: sign * (shX + 0.02 * S), cy: 1.38 * S, cz: 0, rx: 0.105 * pScale * S, rz: 0.105 * pScale * S, roll: -sign * 0.45 },
          { cx: sign * (shX - 0.02 * S), cy: 1.46 * S, cz: 0, rx: 0.085 * pScale * S, rz: 0.088 * pScale * S, roll: -sign * 0.35, capLift: 0.015 * S },
        ],
        { radialSegs: R_DETAIL, tile: TILES.ARMOR_GOLD, tag: sign > 0 ? 'arm_L' : 'arm_R' }
      );
    }
  }

  // Front Waist Sash / Inscribed Tabard (Jax cobalt sash, Kai-Jax fusion tabard, Boryn orange runic tabard, Borax calligraphy scroll)
  if (spec.id !== 'kai') {
    const sashTile = spec.id === 'borax' ? TILES.INNER_SHIRT : TILES.SASH_TABARD;
    const sashW = spec.id === 'jax' ? 0.065 : 0.085;
    acc.addLoft(
      [
        { cx: spec.id === 'jax' ? 0.11 * S : 0, cy: 0.48 * S, cz: 0.155 * S, rx: sashW * S, rz: 0.012 * S },
        { cx: spec.id === 'jax' ? 0.09 * S : 0, cy: 0.72 * S, cz: 0.152 * S, rx: (sashW + 0.01) * S, rz: 0.012 * S },
        { cx: spec.id === 'jax' ? 0.06 * S : 0, cy: 0.94 * S, cz: 0.138 * S, rx: sashW * S, rz: 0.014 * S },
      ],
      { radialSegs: 10, tile: sashTile, tag: 'sash' }
    );
  }

  // 9. Arms (Sleeve / Bare Tiger Muscle) + Articulated 4-Clawed Sabertooth Hands
  const armTile = spec.id === 'boryn' ? TILES.FUR_PRIMARY : TILES.JACKET_MAIN;
  const sleeveBulk = spec.id === 'borax' ? 1.35 : spec.id === 'boryn' ? 1.12 : 1.05;
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    const uArm = byName.get(`upper_arm_${suf}`).worldPos;
    const fArm = byName.get(`forearm_${suf}`).worldPos;
    const hPos = byName.get(`hand_${suf}`).worldPos;

    acc.addLoft(
      subdivideRings(
        [
          { cx: hPos[0], cy: hPos[1] + 0.03 * S, cz: hPos[2] - 0.01 * S, rx: 0.048 * B * S, rz: 0.048 * B * S },
          { cx: (fArm[0] + hPos[0]) * 0.5, cy: (fArm[1] + hPos[1]) * 0.5, cz: (fArm[2] + hPos[2]) * 0.5, rx: 0.064 * B * sleeveBulk * S, rz: 0.064 * B * sleeveBulk * S },
          { cx: fArm[0], cy: fArm[1], cz: fArm[2], rx: 0.062 * B * sleeveBulk * S, rz: 0.062 * B * sleeveBulk * S },
          { cx: (uArm[0] + fArm[0]) * 0.5, cy: (uArm[1] + fArm[1]) * 0.5, cz: uArm[2], rx: 0.074 * B * S, rz: 0.074 * B * S },
          { cx: uArm[0], cy: uArm[1] + 0.03 * S, cz: uArm[2], rx: 0.078 * B * S, rz: 0.078 * B * S, capLift: 0.02 * S },
        ],
        SUB_RINGS
      ),
      { radialSegs: R_LIMB, tile: armTile, tag: `arm_${suf}` }
    );

    // Sculpted Beast Paw-Hand + 4 Curved Razor Claws
    const handTile = sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY;
    acc.addLoft(
      [
        { cx: hPos[0], cy: hPos[1] - 0.07 * S, cz: hPos[2] + 0.02 * S, rx: 0.045 * B * S, rz: 0.034 * B * S, capDrop: 0.012 * S },
        { cx: hPos[0], cy: hPos[1], cz: hPos[2], rx: 0.052 * B * S, rz: 0.038 * B * S },
        { cx: hPos[0], cy: hPos[1] + 0.04 * S, cz: hPos[2] - 0.01 * S, rx: 0.046 * B * S, rz: 0.042 * B * S },
      ],
      { radialSegs: 12, tile: handTile, tag: `hand_${suf}` }
    );

    for (let c = 0; c < 4; c++) {
      const zOff = (c - 1.5) * 0.018 * S;
      acc.addSplineTube(
        [
          [hPos[0] + sign * 0.015 * S, hPos[1] - 0.065 * S, hPos[2] + 0.02 * S + zOff],
          [hPos[0] + sign * 0.018 * S, hPos[1] - 0.115 * S, hPos[2] + 0.038 * S + zOff],
          [hPos[0] + sign * 0.008 * S, hPos[1] - 0.152 * S, hPos[2] + 0.052 * S + zOff],
        ],
        (t) => (1 - t * 0.85) * 0.011 * S,
        { tubularSegs: 5, radialSegs: 6, tile: TILES.IVORY_FANG, tag: `hand_${suf}` }
      );
    }
  }

  // 10. Tactical Cargo Trousers + Chunky Clawed High-Top Sneakers / Combat Boots (Grounded at y = 0.0!)
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    const thPos = byName.get(`thigh_${suf}`).worldPos;
    const shPos = byName.get(`shin_${suf}`).worldPos;
    const ftPos = byName.get(`foot_${suf}`).worldPos;

    // Baggy tapered street-techwear cargo pants
    acc.addLoft(
      subdivideRings(
        [
          { cx: ftPos[0], cy: 0.21 * S, cz: ftPos[2], rx: 0.072 * B * S, rz: 0.074 * B * S },
          {
            cx: shPos[0],
            cy: 0.36 * S,
            cz: shPos[2],
            rx: 0.098 * B * S,
            rz: 0.098 * B * S,
            lobe: (th) => 1 + Math.max(0, sign * Math.sin(th)) * 0.14, // Outer cargo pocket flare!
          },
          { cx: shPos[0], cy: shPos[1], cz: shPos[2], rx: 0.092 * B * S, rz: 0.094 * B * S },
          { cx: (thPos[0] + shPos[0]) * 0.5, cy: 0.70 * S, cz: 0.01 * S, rx: 0.112 * B * S, rz: 0.112 * B * S },
          { cx: thPos[0], cy: thPos[1] + 0.02 * S, cz: 0, rx: 0.116 * B * S, rz: 0.115 * B * S, capLift: 0.02 * S },
        ],
        SUB_RINGS
      ),
      { radialSegs: R_LIMB, tile: TILES.PANTS_CARGO, tag: `leg_${suf}` }
    );

    // Chunky Clawed High-Top Sneaker / Combat Boot (strictly grounded at y = 0.0!)
    acc.addLoft(
      [
        { cx: ftPos[0], cy: 0.004, cz: ftPos[2] + 0.055 * S, rx: 0.078 * B * S, rz: 0.148 * S, capDrop: 0.003 },
        { cx: ftPos[0], cy: 0.048 * S, cz: ftPos[2] + 0.052 * S, rx: 0.076 * B * S, rz: 0.144 * S },
        { cx: ftPos[0], cy: 0.115 * S, cz: ftPos[2] + 0.022 * S, rx: 0.068 * B * S, rz: 0.098 * S },
        { cx: ftPos[0], cy: 0.215 * S, cz: ftPos[2] + 0.004 * S, rx: 0.066 * B * S, rz: 0.072 * S, capLift: 0.01 * S },
      ],
      { radialSegs: R_DETAIL, tile: TILES.SNEAKER_BODY, tag: `foot_${suf}` }
    );

    // 3 Protruding Toe-Box Saber Claws on each sneaker/boot!
    for (let c = -1; c <= 1; c++) {
      const cxOff = c * 0.026 * S;
      acc.addSplineTube(
        [
          [ftPos[0] + cxOff, 0.036 * S, ftPos[2] + 0.185 * S],
          [ftPos[0] + cxOff, 0.024 * S, ftPos[2] + 0.228 * S],
          [ftPos[0] + cxOff, 0.006 * S, ftPos[2] + 0.256 * S],
        ],
        (t) => (1 - t * 0.85) * 0.014 * S,
        { tubularSegs: 5, radialSegs: 6, tile: TILES.IVORY_FANG, tag: `toe_${suf}` }
      );
    }
  }

  // 11. Kai & Kai-Jax: 4 Articulated Dorsal Spider Limbs (12 bones)
  if (spiderChains.length > 0) {
    // Dorsal Arachnid Neural Harness Hub
    acc.addLoft(
      [
        { cx: 0, cy: 1.22 * S, cz: -0.145 * S, rx: 0.11 * S, rz: 0.045 * S },
        { cx: 0, cy: 1.35 * S, cz: -0.155 * S, rx: 0.13 * S, rz: 0.055 * S },
        { cx: 0, cy: 1.44 * S, cz: -0.145 * S, rx: 0.09 * S, rz: 0.04 * S, capLift: 0.01 * S },
      ],
      { radialSegs: 12, tile: TILES.ARMOR_GOLD, tag: 'torso' }
    );

    for (const sc of spiderChains) {
      acc.addSplineTube(
        sc.points,
        (t) => {
          // Jointed chitinous arachnid profile (swells at mechanical joints t=0.33, t=0.66, razor tip at 1.0)
          const jointBump =
            Math.exp(-Math.pow((t - 0.34) * 14, 2)) * 0.014 +
            Math.exp(-Math.pow((t - 0.67) * 14, 2)) * 0.012;
          return ((1 - Math.pow(t, 1.4) * 0.88) * 0.034 + jointBump) * S;
        },
        {
          tubularSegs: isMaster ? 22 : 12,
          radialSegs: isMaster ? 12 : 7,
          tile: TILES.SPIDER_CHITIN,
          tag: sc.prefix,
        }
      );
    }
  }

  // 12. Jax & Kai-Jax: 7 Roaring Electric-Blue Storm Mane Crests (mane_01..07)
  for (const mc of maneChains) {
    acc.addSplineTube(
      mc.points,
      (t) => Math.sin(Math.min(0.98, t * 0.86 + 0.14) * Math.PI) * 0.072 * S,
      {
        tubularSegs: isMaster ? 14 : 8,
        radialSegs: isMaster ? 10 : 6,
        tile: TILES.STORM_MANE,
        tag: mc.name,
        flattenY: 0.65,
      }
    );
  }

  // 13. Physical Tails (STRICTLY 3 for Kai-Jax: Ember, Storm, Memory; 1 for Boryn & Borax)
  for (const tc of tailChains) {
    const isKaiJaxTail = spec.id === 'kaijax';
    acc.addSplineTube(
      tc.pts,
      (t) => {
        const plume = isKaiJaxTail
          ? Math.sin(Math.min(0.98, t * 0.82 + 0.16) * Math.PI) * 0.095
          : (1 - t * 0.55) * 0.056;
        return Math.max(0.012, plume) * S;
      },
      {
        tubularSegs: isMaster ? 24 : 13,
        radialSegs: isMaster ? 14 : 8,
        tile: tc.tile,
        uSubRange: tc.uSub,
        tag: tc.prefix,
      }
    );
  }

  return acc;
}

/**
 * Computes smooth 4-bone skinning weights (JOINTS_0, WEIGHTS_0) for every vertex.
 */
function computeSkinWeights(acc, skel) {
  const vCount = acc.vertexCount;
  const joints = new Uint16Array(vCount * 4);
  const weights = new Float32Array(vCount * 4);

  const { bones, byName, S } = skel;
  const idxOf = (name) => byName.get(name)?.index ?? 0;

  // Build segment capsules for distance-based multi-bone blending
  const boneSegments = bones.map((b) => {
    const children = bones.filter((c) => c.parentIndex === b.index && !c.name.startsWith('spider_') && !c.name.startsWith('mane_') && !c.name.startsWith('tail'));
    const endPos =
      children.length === 1
        ? children[0].worldPos
        : [b.worldPos[0], b.worldPos[1] + 0.08 * S, b.worldPos[2]];
    return { index: b.index, name: b.name, a: b.worldPos, b: endPos };
  });

  function distToSegSq(p, a, b) {
    const abx = b[0] - a[0];
    const aby = b[1] - a[1];
    const abz = b[2] - a[2];
    const lenSq = abx * abx + aby * aby + abz * abz;
    let t = 0;
    if (lenSq > 1e-6) {
      t = ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby + (p[2] - a[2]) * abz) / lenSq;
      t = Math.max(0, Math.min(1, t));
    }
    const dx = p[0] - (a[0] + abx * t);
    const dy = p[1] - (a[1] + aby * t);
    const dz = p[2] - (a[2] + abz * t);
    return dx * dx + dy * dy + dz * dz;
  }

  for (let v = 0; v < vCount; v++) {
    const p = acc.positions[v];
    const meta = acc.tags[v];
    const tag = meta.tag;

    let candidates = [];

    if (tag === 'jaw') {
      candidates = [
        [idxOf('jaw'), 0.85],
        [idxOf('head'), 0.15],
      ];
    } else if (tag === 'head' || tag === 'snout' || tag === 'fang' || tag === 'eye' || tag.startsWith('eyelid_') || tag === 'mane_lion') {
      candidates = [
        [idxOf('head'), 0.92],
        [idxOf('neck'), 0.08],
      ];
    } else if (tag === 'ear_L' || tag === 'ear_R') {
      candidates = [
        [idxOf(tag), 0.85],
        [idxOf('head'), 0.15],
      ];
    } else if (tag.startsWith('mane_0')) {
      const mIdx = idxOf(tag);
      const t = meta.splineT ?? 0.5;
      candidates = [
        [mIdx, Math.max(0.15, t)],
        [idxOf('head'), Math.max(0.05, 1 - t)],
      ];
    } else if (tag.startsWith('spider_')) {
      const t = meta.splineT ?? 0.5;
      const b1 = idxOf(`${tag}_01`);
      const b2 = idxOf(`${tag}_02`);
      const b3 = idxOf(`${tag}_03`);
      if (t < 0.34) {
        const k = t / 0.34;
        candidates = [[b1, 1 - k * 0.45], [b2, k * 0.45]];
      } else if (t < 0.68) {
        const k = (t - 0.34) / 0.34;
        candidates = [[b2, 1 - k * 0.5], [b3, k * 0.5]];
      } else {
        candidates = [[b3, 0.9], [b2, 0.1]];
      }
    } else if (tag.startsWith('tail')) {
      const t = meta.splineT ?? 0.5;
      const posF = t * 3.0; // 0..3 across _01.._04
      const s0 = Math.min(3, Math.floor(posF));
      const s1 = Math.min(3, s0 + 1);
      const frac = posF - s0;
      const b0 = idxOf(`${tag}_0${s0 + 1}`);
      const b1 = idxOf(`${tag}_0${s1 + 1}`);
      candidates = b0 === b1 ? [[b0, 1.0]] : [[b0, 1 - frac], [b1, frac]];
    } else {
      // Smooth anatomical distance weighting across matching body/limb bone subset
      let allowedNames = null;
      if (tag === 'arm_L') allowedNames = ['clavicle_L', 'upper_arm_L', 'forearm_L', 'hand_L'];
      else if (tag === 'arm_R') allowedNames = ['clavicle_R', 'upper_arm_R', 'forearm_R', 'hand_R'];
      else if (tag === 'hand_L') allowedNames = ['hand_L', 'forearm_L'];
      else if (tag === 'hand_R') allowedNames = ['hand_R', 'forearm_R'];
      else if (tag === 'leg_L') allowedNames = ['pelvis', 'thigh_L', 'shin_L', 'foot_L'];
      else if (tag === 'leg_R') allowedNames = ['pelvis', 'thigh_R', 'shin_R', 'foot_R'];
      else if (tag === 'foot_L' || tag === 'toe_L') allowedNames = ['foot_L', 'toe_L', 'shin_L'];
      else if (tag === 'foot_R' || tag === 'toe_R') allowedNames = ['foot_R', 'toe_R', 'shin_R'];
      else if (tag === 'sash' || tag === 'belt') allowedNames = ['pelvis', 'spine_01', 'thigh_L', 'thigh_R'];
      else allowedNames = ['pelvis', 'spine_01', 'spine_02', 'chest', 'neck', 'thigh_L', 'thigh_R'];

      const pool = boneSegments.filter((bs) => allowedNames.includes(bs.name));
      const scored = pool.map((bs) => {
        const dSq = distToSegSq(p, bs.a, bs.b);
        return [bs.index, 1 / Math.pow(dSq + 0.0022, 1.65)];
      });
      scored.sort((a, b) => b[1] - a[1]);
      candidates = scored.slice(0, 4);
    }

    let sum = 0;
    for (const c of candidates) sum += c[1];
    if (sum <= 0) {
      joints[v * 4] = 0;
      weights[v * 4] = 1.0;
      continue;
    }
    for (let k = 0; k < 4; k++) {
      if (k < candidates.length) {
        joints[v * 4 + k] = candidates[k][0];
        weights[v * 4 + k] = candidates[k][1] / sum;
      } else {
        joints[v * 4 + k] = 0;
        weights[v * 4 + k] = 0;
      }
    }
  }

  return { joints, weights };
}

/**
 * Builds the 5 required facial morph target delta POSITION arrays:
 * ['blink', 'snarl', 'roar', 'pain', 'focus']
 */
function buildFacialMorphDeltas(acc, skel) {
  const S = skel.S;
  const vCount = acc.vertexCount;
  const deltas = {};
  for (const mName of MORPH_NAMES) {
    deltas[mName] = new Float32Array(vCount * 3);
  }

  for (let v = 0; v < vCount; v++) {
    const p = acc.positions[v];
    const { tag, vFrac } = acc.tags[v];
    const o = v * 3;
    const signX = p[0] >= 0 ? 1 : -1;

    if (tag === 'eyelid_L' || tag === 'eyelid_R') {
      // blink: close eyelids downward & slightly forward over iris
      deltas.blink[o + 1] = -0.026 * S;
      deltas.blink[o + 2] = 0.008 * S;
      // pain: tight wince
      deltas.pain[o + 1] = -0.020 * S;
      deltas.pain[o + 2] = 0.006 * S;
      // focus: sharp predator squint + inner brow furrow
      deltas.focus[o] = -signX * 0.006 * S;
      deltas.focus[o + 1] = -0.012 * S;
      // snarl: fierce angled brow
      deltas.snarl[o] = -signX * 0.008 * S;
      deltas.snarl[o + 1] = -0.009 * S;
    } else if (tag === 'snout') {
      // snarl: curl upper muzzle lip upward & flare whisker pads to bare sabertooth fangs!
      const frontAmt = Math.max(0, vFrac);
      deltas.snarl[o] = signX * 0.011 * S * frontAmt;
      deltas.snarl[o + 1] = 0.018 * S * frontAmt;
      deltas.snarl[o + 2] = -0.006 * S * frontAmt;

      deltas.roar[o] = signX * 0.014 * S * frontAmt;
      deltas.roar[o + 1] = 0.022 * S * frontAmt;

      deltas.pain[o + 1] = 0.009 * S * frontAmt;
      deltas.focus[o + 1] = 0.004 * S * frontAmt;
    } else if (tag === 'fang') {
      deltas.snarl[o + 1] = 0.006 * S;
      deltas.roar[o + 1] = 0.010 * S;
    } else if (tag === 'jaw') {
      const tipAmt = 0.35 + vFrac * 0.65;
      // roar: drop sabertooth jaw wide open!
      deltas.roar[o + 1] = -0.058 * S * tipAmt;
      deltas.roar[o + 2] = -0.022 * S * tipAmt;
      // snarl: slight growl opening
      deltas.snarl[o + 1] = -0.018 * S * tipAmt;
      // pain: clenched/grimace jaw shift
      deltas.pain[o + 1] = -0.024 * S * tipAmt;
      deltas.pain[o] = 0.008 * S * tipAmt;
    } else if (tag === 'ear_L' || tag === 'ear_R') {
      const earTip = vFrac;
      // pain & roar pin ears back; focus perks ears alertly!
      deltas.pain[o + 1] = -0.028 * S * earTip;
      deltas.pain[o + 2] = -0.036 * S * earTip;
      deltas.roar[o + 2] = -0.032 * S * earTip;
      deltas.focus[o + 1] = 0.016 * S * earTip;
      deltas.focus[o + 2] = 0.014 * S * earTip;
      deltas.blink[o + 2] = -0.003 * S * earTip;
    }
  }

  return deltas;
}

/**
 * Generates all 19 required skeletal animation clips with expressive combat & traversal motion,
 * including secondary spider-limb, storm-mane, jaw, and 3-tail wave articulation!
 */
function buildAllAnimationClips(spec, skel) {
  const { bones, byName, S } = skel;
  const euler = new THREE.Euler(0, 0, 0, 'XYZ');
  const quat = new THREE.Quaternion();

  function qEuler(rx, ry, rz) {
    euler.set(rx, ry, rz, 'XYZ');
    quat.setFromEuler(euler);
    return [quat.x, quat.y, quat.z, quat.w];
  }

  const pelvisRest = byName.get('pelvis').localPos;

  return REQUIRED_CLIPS.map((clipName) => {
    const isLoop = ['idle', 'breathing', 'walk', 'run', 'sprint', 'fall', 'victory'].includes(clipName);
    const duration =
      clipName === 'idle' || clipName === 'breathing'
        ? 2.2
        : clipName === 'walk'
          ? 1.0
          : clipName === 'run'
            ? 0.72
            : clipName === 'sprint'
              ? 0.54
              : clipName === 'attack_1' || clipName === 'attack_2'
                ? 0.38
                : clipName === 'attack_3' || clipName === 'heavy_strike'
                  ? 0.52
                  : clipName === 'roar' || clipName === 'ability_cast'
                    ? 0.78
                    : clipName === 'victory'
                      ? 2.0
                      : clipName === 'defeat'
                        ? 1.1
                        : 0.45;

    const sampleCount = 9;
    const times = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      times[i] = (i / (sampleCount - 1)) * duration;
    }

    const tracks = [];
    const addRotTrack = (boneName, fn) => {
      const b = byName.get(boneName);
      if (!b) return;
      const values = new Float32Array(sampleCount * 4);
      for (let i = 0; i < sampleCount; i++) {
        const phase = i / (sampleCount - 1);
        const p = isLoop && i === sampleCount - 1 ? 0 : phase;
        const [rx, ry, rz] = fn(p, p * Math.PI * 2);
        const q = qEuler(rx, ry, rz);
        values.set(q, i * 4);
      }
      tracks.push({ boneIndex: b.index, path: 'rotation', values });
    };

    const addPelvisPosTrack = (fn) => {
      const b = byName.get('pelvis');
      const values = new Float32Array(sampleCount * 3);
      for (let i = 0; i < sampleCount; i++) {
        const phase = i / (sampleCount - 1);
        const p = isLoop && i === sampleCount - 1 ? 0 : phase;
        const [dx, dy, dz] = fn(p, p * Math.PI * 2);
        values[i * 3] = pelvisRest[0] + dx * S;
        values[i * 3 + 1] = pelvisRest[1] + dy * S;
        values[i * 3 + 2] = pelvisRest[2] + dz * S;
      }
      tracks.push({ boneIndex: b.index, path: 'translation', values });
    };

    // Locomotion & Combat Pose Synthesis per Clip
    if (clipName === 'idle' || clipName === 'breathing') {
      const amp = clipName === 'breathing' ? 1.25 : 1.0;
      addPelvisPosTrack((_, w) => [0, Math.sin(w) * 0.018 * amp, 0]);
      addRotTrack('spine_01', (_, w) => [0.04 + Math.sin(w) * 0.025 * amp, Math.sin(w * 0.5) * 0.03, 0]);
      addRotTrack('chest', (_, w) => [-0.03 + Math.cos(w) * 0.03 * amp, 0, 0]);
      addRotTrack('head', (_, w) => [Math.sin(w) * 0.03, Math.sin(w * 1.0) * 0.06, 0]);
      addRotTrack('upper_arm_L', (_, w) => [0.12 + Math.sin(w) * 0.04, 0, 0.14]);
      addRotTrack('upper_arm_R', (_, w) => [0.12 - Math.sin(w) * 0.04, 0, -0.14]);
      addRotTrack('forearm_L', () => [-0.36, 0, 0]);
      addRotTrack('forearm_R', () => [-0.36, 0, 0]);
      addRotTrack('thigh_L', () => [-0.06, 0.05, 0.03]);
      addRotTrack('thigh_R', () => [0.04, -0.05, -0.03]);
      addRotTrack('shin_L', () => [0.10, 0, 0]);
      addRotTrack('shin_R', () => [0.06, 0, 0]);
    } else if (clipName === 'walk' || clipName === 'run' || clipName === 'sprint') {
      const stride = clipName === 'walk' ? 0.52 : clipName === 'run' ? 0.88 : 1.16;
      const lean = clipName === 'walk' ? 0.08 : clipName === 'run' ? 0.24 : 0.38;
      const bounce = clipName === 'walk' ? 0.028 : clipName === 'run' ? 0.055 : 0.075;
      addPelvisPosTrack((_, w) => [0, Math.abs(Math.cos(w)) * bounce - bounce * 0.4, 0]);
      addRotTrack('spine_01', (_, w) => [lean * 0.55, Math.sin(w) * 0.12, 0]);
      addRotTrack('chest', (_, w) => [lean * 0.55, -Math.sin(w) * 0.16, 0]);
      addRotTrack('head', (_, w) => [-lean * 0.65, Math.sin(w) * 0.05, 0]);

      addRotTrack('thigh_L', (_, w) => [-Math.sin(w) * stride, 0, 0]);
      addRotTrack('thigh_R', (_, w) => [Math.sin(w) * stride, 0, 0]);
      addRotTrack('shin_L', (_, w) => [Math.max(0.08, Math.cos(w) * stride * 0.85 + 0.32), 0, 0]);
      addRotTrack('shin_R', (_, w) => [Math.max(0.08, -Math.cos(w) * stride * 0.85 + 0.32), 0, 0]);
      addRotTrack('foot_L', (_, w) => [Math.sin(w) * 0.28, 0, 0]);
      addRotTrack('foot_R', (_, w) => [-Math.sin(w) * 0.28, 0, 0]);

      addRotTrack('upper_arm_L', (_, w) => [Math.sin(w) * stride * 0.78, 0, 0.16]);
      addRotTrack('upper_arm_R', (_, w) => [-Math.sin(w) * stride * 0.78, 0, -0.16]);
      addRotTrack('forearm_L', () => [-0.68, 0, 0]);
      addRotTrack('forearm_R', () => [-0.68, 0, 0]);
    } else if (clipName === 'jump' || clipName === 'fall') {
      const up = clipName === 'jump' ? 1 : -0.5;
      addPelvisPosTrack((p) => [0, 0.06 * Math.sin(p * Math.PI), 0]);
      addRotTrack('spine_01', () => [0.16 * up, 0, 0]);
      addRotTrack('thigh_L', (_, w) => [-0.55 + Math.sin(w) * 0.08, 0, 0.08]);
      addRotTrack('thigh_R', (_, w) => [-0.28 - Math.sin(w) * 0.08, 0, -0.08]);
      addRotTrack('shin_L', () => [0.78, 0, 0]);
      addRotTrack('shin_R', () => [0.48, 0, 0]);
      addRotTrack('upper_arm_L', (_, w) => [-0.45 + Math.sin(w) * 0.1, 0, 0.42]);
      addRotTrack('upper_arm_R', (_, w) => [-0.45 - Math.sin(w) * 0.1, 0, -0.42]);
      addRotTrack('forearm_L', () => [-0.55, 0, 0]);
      addRotTrack('forearm_R', () => [-0.55, 0, 0]);
    } else if (clipName === 'landing') {
      addPelvisPosTrack((p) => [0, -Math.sin(p * Math.PI) * 0.18, 0]);
      addRotTrack('spine_01', (p) => [Math.sin(p * Math.PI) * 0.36, 0, 0]);
      addRotTrack('thigh_L', (p) => [-Math.sin(p * Math.PI) * 0.62, 0, 0.08]);
      addRotTrack('thigh_R', (p) => [-Math.sin(p * Math.PI) * 0.62, 0, -0.08]);
      addRotTrack('shin_L', (p) => [Math.sin(p * Math.PI) * 0.85, 0, 0]);
      addRotTrack('shin_R', (p) => [Math.sin(p * Math.PI) * 0.85, 0, 0]);
      addRotTrack('upper_arm_L', (p) => [Math.sin(p * Math.PI) * 0.45, 0, 0.32]);
      addRotTrack('upper_arm_R', (p) => [Math.sin(p * Math.PI) * 0.45, 0, -0.32]);
    } else if (clipName === 'dodge') {
      addPelvisPosTrack((p) => [0, -Math.sin(p * Math.PI) * 0.22, Math.sin(p * Math.PI) * 0.12]);
      addRotTrack('spine_01', (p) => [Math.sin(p * Math.PI) * 0.58, Math.sin(p * Math.PI * 2) * 0.35, 0]);
      addRotTrack('thigh_L', (p) => [-Math.sin(p * Math.PI) * 0.65, 0, 0.12]);
      addRotTrack('thigh_R', (p) => [Math.sin(p * Math.PI) * 0.35, 0, -0.12]);
      addRotTrack('upper_arm_L', (p) => [0.55 * Math.sin(p * Math.PI), 0, 0.48]);
      addRotTrack('upper_arm_R', (p) => [0.55 * Math.sin(p * Math.PI), 0, -0.48]);
    } else if (clipName === 'attack_1' || clipName === 'attack_2' || clipName === 'attack_3' || clipName === 'heavy_strike') {
      const isLeft = clipName === 'attack_2';
      const isHeavy = clipName === 'heavy_strike' || clipName === 'attack_3';
      addPelvisPosTrack((p) => [0, -Math.sin(p * Math.PI) * (isHeavy ? 0.14 : 0.07), Math.sin(p * Math.PI) * 0.14]);
      addRotTrack('spine_01', (p) => [
        Math.sin(p * Math.PI) * (isHeavy ? 0.38 : 0.22),
        (isLeft ? -1 : 1) * Math.sin(p * Math.PI) * 0.58,
        0,
      ]);
      addRotTrack('chest', (p) => [0.12, (isLeft ? -1 : 1) * Math.sin(p * Math.PI) * 0.42, 0]);
      addRotTrack('jaw', (p) => [Math.sin(p * Math.PI) * 0.32, 0, 0]);

      if (isHeavy) {
        addRotTrack('upper_arm_R', (p) => [-2.1 + p * 2.9, -0.25, -0.22]);
        addRotTrack('upper_arm_L', (p) => [-1.8 + p * 2.5, 0.25, 0.22]);
        addRotTrack('forearm_R', (p) => [-0.75 + p * 0.55, 0, 0]);
        addRotTrack('forearm_L', (p) => [-0.75 + p * 0.55, 0, 0]);
      } else if (isLeft) {
        addRotTrack('upper_arm_L', (p) => [-1.45 + Math.sin(p * Math.PI) * 1.65, -0.45 * Math.sin(p * Math.PI), 0.28]);
        addRotTrack('forearm_L', (p) => [-0.85 + Math.sin(p * Math.PI) * 0.65, 0, 0]);
        addRotTrack('upper_arm_R', () => [0.35, 0, -0.25]);
      } else {
        addRotTrack('upper_arm_R', (p) => [-1.45 + Math.sin(p * Math.PI) * 1.65, 0.45 * Math.sin(p * Math.PI), -0.28]);
        addRotTrack('forearm_R', (p) => [-0.85 + Math.sin(p * Math.PI) * 0.65, 0, 0]);
        addRotTrack('upper_arm_L', () => [0.35, 0, 0.25]);
      }
      addRotTrack('thigh_L', (p) => [-0.35 * Math.sin(p * Math.PI), 0, 0.1]);
      addRotTrack('thigh_R', (p) => [0.28 * Math.sin(p * Math.PI), 0, -0.1]);
      addRotTrack('shin_L', (p) => [0.45 * Math.sin(p * Math.PI), 0, 0]);
    } else if (clipName === 'parry') {
      addPelvisPosTrack((p) => [0, -0.09 * Math.sin(p * Math.PI), -0.05 * Math.sin(p * Math.PI)]);
      addRotTrack('chest', (p) => [0.1, -0.32 * Math.sin(p * Math.PI), 0]);
      addRotTrack('upper_arm_L', (p) => [-1.15 * Math.sin(p * Math.PI), -0.55, 0.22]);
      addRotTrack('upper_arm_R', (p) => [-1.05 * Math.sin(p * Math.PI), 0.55, -0.22]);
      addRotTrack('forearm_L', () => [-1.05, 0, 0]);
      addRotTrack('forearm_R', () => [-1.05, 0, 0]);
    } else if (clipName === 'hit_reaction') {
      addPelvisPosTrack((p) => [0, -0.05 * Math.sin(p * Math.PI), -0.14 * Math.sin(p * Math.PI)]);
      addRotTrack('spine_01', (p) => [-0.36 * Math.sin(p * Math.PI), 0.18 * Math.sin(p * Math.PI), 0]);
      addRotTrack('head', (p) => [-0.42 * Math.sin(p * Math.PI), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.35 * Math.sin(p * Math.PI), 0, 0.45]);
      addRotTrack('upper_arm_R', (p) => [0.35 * Math.sin(p * Math.PI), 0, -0.45]);
    } else if (clipName === 'roar' || clipName === 'ability_cast') {
      addPelvisPosTrack((p) => [0, -0.08 * Math.sin(p * Math.PI), 0]);
      addRotTrack('spine_01', (p) => [-0.26 * Math.sin(p * Math.PI), 0, 0]);
      addRotTrack('chest', (p) => [-0.22 * Math.sin(p * Math.PI), 0, 0]);
      addRotTrack('head', (p) => [-0.32 * Math.sin(p * Math.PI), 0, 0]);
      addRotTrack('jaw', (p) => [0.52 * Math.sin(p * Math.PI), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [-0.85 * Math.sin(p * Math.PI), 0, 0.65 * Math.sin(p * Math.PI) + 0.15]);
      addRotTrack('upper_arm_R', (p) => [-0.85 * Math.sin(p * Math.PI), 0, -0.65 * Math.sin(p * Math.PI) - 0.15]);
      addRotTrack('forearm_L', () => [-0.45, 0, 0]);
      addRotTrack('forearm_R', () => [-0.45, 0, 0]);
    } else if (clipName === 'victory') {
      addPelvisPosTrack((_, w) => [0, Math.sin(w) * 0.025, 0]);
      addRotTrack('chest', (_, w) => [-0.14, Math.sin(w) * 0.08, 0]);
      addRotTrack('head', (_, w) => [-0.08, Math.sin(w) * 0.1, 0]);
      addRotTrack('upper_arm_R', (_, w) => [-2.25 + Math.sin(w) * 0.08, 0, -0.32]);
      addRotTrack('forearm_R', () => [-0.45, 0, 0]);
      addRotTrack('upper_arm_L', () => [0.18, 0, 0.22]);
      addRotTrack('forearm_L', () => [-0.55, 0, 0]);
    } else if (clipName === 'defeat') {
      addPelvisPosTrack((p) => [0, -0.44 * p, -0.10 * p]);
      addRotTrack('spine_01', (p) => [0.62 * p, 0, 0]);
      addRotTrack('head', (p) => [0.45 * p, 0, 0]);
      addRotTrack('thigh_L', (p) => [-1.05 * p, 0, 0.1]);
      addRotTrack('thigh_R', (p) => [-0.85 * p, 0, -0.1]);
      addRotTrack('shin_L', (p) => [1.55 * p, 0, 0]);
      addRotTrack('shin_R', (p) => [1.35 * p, 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.45 * p, 0, 0.18]);
      addRotTrack('upper_arm_R', (p) => [0.45 * p, 0, -0.18]);
    }

    // Secondary Supernatural Appendage Articulation across ALL clips!
    const energyBoost =
      clipName.startsWith('attack') || clipName === 'heavy_strike' || clipName === 'roar' || clipName === 'ability_cast'
        ? 2.2
        : clipName === 'sprint' || clipName === 'run'
          ? 1.5
          : 1.0;

    // Spider Limbs (12 independent bones)
    for (const b of bones) {
      if (b.name.startsWith('spider_')) {
        const phaseOff = b.index * 0.85;
        const sign = b.name.includes('_UL_') || b.name.includes('_LL_') ? 1 : -1;
        addRotTrack(b.name, (_, w) => [
          Math.sin(w + phaseOff) * 0.12 * energyBoost,
          Math.cos(w + phaseOff) * 0.10 * energyBoost,
          sign * Math.sin(w + phaseOff * 0.7) * 0.08 * energyBoost,
        ]);
      } else if (b.name.startsWith('mane_0')) {
        const idx = Number(b.name.slice(-1));
        addRotTrack(b.name, (_, w) => [
          Math.sin(w * 2 + idx * 0.6) * 0.09 * energyBoost,
          Math.cos(w + idx * 0.5) * 0.06 * energyBoost,
          0,
        ]);
      } else if (b.name.startsWith('tail')) {
        const segNum = Number(b.name.slice(-1));
        const chainHash = b.name.includes('ember') ? 0 : b.name.includes('storm') ? 2.1 : 4.2;
        addRotTrack(b.name, (_, w) => [
          Math.sin(w + chainHash - segNum * 0.55) * (0.08 + segNum * 0.035) * energyBoost,
          Math.cos(w + chainHash - segNum * 0.45) * (0.10 + segNum * 0.04) * energyBoost,
          0,
        ]);
      }
    }

    return { name: clipName, times, tracks };
  });
}

// ---------------------------------------------------------------------------
// 5. Spec-Compliant glTF 2.0 Binary (.glb) Serializer
// ---------------------------------------------------------------------------
function packGlbBinary(spec, tier, pbrPngs) {
  const skel = buildSkeletonDefinition(spec);
  const acc = sculptCharacterGeometry(spec, skel, tier);
  const baseNormals = acc.computeSmoothNormals();
  const { joints, weights } = computeSkinWeights(acc, skel);
  const morphDeltas = buildFacialMorphDeltas(acc, skel);
  const clips = buildAllAnimationClips(spec, skel);

  const vCount = acc.vertexCount;
  const posFloat = new Float32Array(vCount * 3);
  const uvFloat = new Float32Array(vCount * 2);
  const posMin = [Infinity, Infinity, Infinity];
  const posMax = [-Infinity, -Infinity, -Infinity];

  for (let v = 0; v < vCount; v++) {
    const [px, py, pz] = acc.positions[v];
    posFloat[v * 3] = px;
    posFloat[v * 3 + 1] = py;
    posFloat[v * 3 + 2] = pz;
    if (px < posMin[0]) posMin[0] = px;
    if (py < posMin[1]) posMin[1] = py;
    if (pz < posMin[2]) posMin[2] = pz;
    if (px > posMax[0]) posMax[0] = px;
    if (py > posMax[1]) posMax[1] = py;
    if (pz > posMax[2]) posMax[2] = pz;

    uvFloat[v * 2] = acc.uvs[v][0];
    uvFloat[v * 2 + 1] = 1.0 - acc.uvs[v][1]; // glTF top-left V convention
  }

  const indexArray = vCount > 65535 ? new Uint32Array(acc.indices) : new Uint16Array(acc.indices);
  const indexComponentType = vCount > 65535 ? 5125 : 5123;

  // Inverse Bind Matrices (each bone has rest rotation = Identity, worldPos = skel.bones[i].worldPos)
  const boneCount = skel.bones.length;
  const ibmFloat = new Float32Array(boneCount * 16);
  const m4 = new THREE.Matrix4();
  for (let b = 0; b < boneCount; b++) {
    const wp = skel.bones[b].worldPos;
    m4.makeTranslation(-wp[0], -wp[1], -wp[2]);
    m4.toArray(ibmFloat, b * 16);
  }

  const binChunks = [];
  let byteOffset = 0;
  const bufferViews = [];
  const accessors = [];

  function appendBufferView(typedOrBuf, target = undefined) {
    const raw = Buffer.isBuffer(typedOrBuf)
      ? typedOrBuf
      : Buffer.from(typedOrBuf.buffer, typedOrBuf.byteOffset, typedOrBuf.byteLength);
    const pad = (4 - (raw.length % 4)) % 4;
    const bvIdx = bufferViews.length;
    const bv = { buffer: 0, byteOffset, byteLength: raw.length };
    if (target !== undefined) bv.target = target;
    bufferViews.push(bv);
    binChunks.push(raw);
    if (pad > 0) binChunks.push(Buffer.alloc(pad));
    byteOffset += raw.length + pad;
    return bvIdx;
  }

  function appendAccessor(typedArray, componentType, typeStr, count, target = undefined, includeMinMaxVec3 = false) {
    const bvIdx = appendBufferView(typedArray, target);
    const accObj = {
      bufferView: bvIdx,
      byteOffset: 0,
      componentType,
      count,
      type: typeStr,
    };
    if (includeMinMaxVec3) {
      const mn = [Infinity, Infinity, Infinity];
      const mx = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < count; i++) {
        const x = typedArray[i * 3];
        const y = typedArray[i * 3 + 1];
        const z = typedArray[i * 3 + 2];
        if (x < mn[0]) mn[0] = x;
        if (y < mn[1]) mn[1] = y;
        if (z < mn[2]) mn[2] = z;
        if (x > mx[0]) mx[0] = x;
        if (y > mx[1]) mx[1] = y;
        if (z > mx[2]) mx[2] = z;
      }
      accObj.min = mn;
      accObj.max = mx;
    }
    const idx = accessors.length;
    accessors.push(accObj);
    return idx;
  }

  // Geometry Accessors
  const posAcc = appendAccessor(posFloat, 5126, 'VEC3', vCount, 34962, true);
  const normAcc = appendAccessor(baseNormals, 5126, 'VEC3', vCount, 34962, false);
  const uvAcc = appendAccessor(uvFloat, 5126, 'VEC2', vCount, 34962, false);
  const jointsAcc = appendAccessor(joints, 5123, 'VEC4', vCount, 34962, false);
  const weightsAcc = appendAccessor(weights, 5126, 'VEC4', vCount, 34962, false);
  const idxAcc = appendAccessor(indexArray, indexComponentType, 'SCALAR', indexArray.length, 34963, false);
  const ibmAcc = appendAccessor(ibmFloat, 5126, 'MAT4', boneCount, undefined, false);

  // 5 Facial Morph Targets
  const targets = MORPH_NAMES.map((mName) => {
    const dPos = morphDeltas[mName];
    const mPosAcc = appendAccessor(dPos, 5126, 'VEC3', vCount, 34962, true);
    return { POSITION: mPosAcc };
  });

  // Embedded PBR Texture PNGs
  const baseImgBv = appendBufferView(pbrPngs.baseColorPng);
  const ormImgBv = appendBufferView(pbrPngs.ormPng);
  const normImgBv = appendBufferView(pbrPngs.normalPng);
  const emisImgBv = appendBufferView(pbrPngs.emissivePng);

  const images = [
    { name: `${spec.id}_baseColor`, bufferView: baseImgBv, mimeType: 'image/png' },
    { name: `${spec.id}_orm`, bufferView: ormImgBv, mimeType: 'image/png' },
    { name: `${spec.id}_normal`, bufferView: normImgBv, mimeType: 'image/png' },
    { name: `${spec.id}_emissive`, bufferView: emisImgBv, mimeType: 'image/png' },
  ];
  const samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }];
  const textures = [
    { sampler: 0, source: 0 },
    { sampler: 0, source: 1 },
    { sampler: 0, source: 2 },
    { sampler: 0, source: 3 },
  ];

  const materials = [
    {
      name: `${spec.id}_surface_pbr`,
      doubleSided: false,
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        baseColorTexture: { index: 0 },
        metallicFactor: 1.0,
        roughnessFactor: 1.0,
        metallicRoughnessTexture: { index: 1 },
      },
      occlusionTexture: { index: 1, strength: 0.85 },
      normalTexture: { index: 2, scale: 0.85 },
      emissiveTexture: { index: 3 },
      emissiveFactor: [1, 1, 1],
    },
  ];

  // Scene Graph Nodes:
  // Node 0: SkinnedMesh node
  // Nodes 1 .. boneCount: Skeleton joints
  // Nodes boneCount+1 .. boneCount+6: 6 Required Attachment Sockets parented to hand_L, hand_R, chest, head!
  const nodes = [];
  nodes.push({
    name: `${spec.id}_SkinnedMesh`,
    mesh: 0,
    skin: 0,
  });

  const jointNodeOffset = 1;
  const jointNodeIndices = [];
  for (let b = 0; b < boneCount; b++) {
    const bone = skel.bones[b];
    const children = skel.bones
      .filter((c) => c.parentIndex === b)
      .map((c) => c.index + jointNodeOffset);
    const nodeObj = {
      name: bone.name,
      translation: bone.localPos,
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    };
    if (children.length > 0) nodeObj.children = children;
    nodes.push(nodeObj);
    jointNodeIndices.push(b + jointNodeOffset);
  }

  const attachSocket = (socketName, parentBoneName, localOffset) => {
    const pBone = skel.byName.get(parentBoneName);
    const pNode = nodes[pBone.index + jointNodeOffset];
    const sNodeIdx = nodes.length;
    nodes.push({
      name: socketName,
      translation: localOffset,
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    });
    if (!pNode.children) pNode.children = [];
    pNode.children.push(sNodeIdx);
  };

  const S = skel.S;
  attachSocket('socket_weapon_L', 'hand_L', [0, -0.08 * S, 0.04 * S]);
  attachSocket('socket_weapon_R', 'hand_R', [0, -0.08 * S, 0.04 * S]);
  attachSocket('socket_hitbox_L', 'hand_L', [0, -0.14 * S, 0.12 * S]);
  attachSocket('socket_hitbox_R', 'hand_R', [0, -0.14 * S, 0.12 * S]);
  attachSocket('socket_relic', 'chest', [0, 0.04 * S, 0.16 * S]);
  attachSocket('socket_head', 'head', [0, 0.14 * S, 0.04 * S]);

  // Serialize 19 NLA Animation Clips
  const animations = clips.map((clip) => {
    const tBv = appendBufferView(clip.times);
    const tAcc = accessors.length;
    accessors.push({
      bufferView: tBv,
      byteOffset: 0,
      componentType: 5126,
      count: clip.times.length,
      type: 'SCALAR',
      min: [clip.times[0]],
      max: [clip.times[clip.times.length - 1]],
    });

    const animSamplers = [];
    const animChannels = [];
    for (const tr of clip.tracks) {
      const isRot = tr.path === 'rotation';
      const outAcc = appendAccessor(
        tr.values,
        5126,
        isRot ? 'VEC4' : 'VEC3',
        clip.times.length,
        undefined,
        false
      );
      const sIdx = animSamplers.length;
      animSamplers.push({
        input: tAcc,
        interpolation: 'LINEAR',
        output: outAcc,
      });
      animChannels.push({
        sampler: sIdx,
        target: {
          node: tr.boneIndex + jointNodeOffset,
          path: tr.path,
        },
      });
    }

    return {
      name: clip.name,
      samplers: animSamplers,
      channels: animChannels,
    };
  });

  const gltf = {
    asset: {
      version: '2.0',
      generator: 'Kai-Jax Beast Gods Production Rig Compiler v2.0',
    },
    scene: 0,
    scenes: [
      {
        name: `${spec.id}_Scene`,
        nodes: [0, jointNodeOffset], // SkinnedMesh root + Pelvis skeleton root
      },
    ],
    nodes,
    meshes: [
      {
        name: `${spec.id}_UnifiedBody`,
        primitives: [
          {
            attributes: {
              POSITION: posAcc,
              NORMAL: normAcc,
              TEXCOORD_0: uvAcc,
              JOINTS_0: jointsAcc,
              WEIGHTS_0: weightsAcc,
            },
            indices: idxAcc,
            material: 0,
            targets,
          },
        ],
        weights: [0, 0, 0, 0, 0],
        extras: {
          targetNames: MORPH_NAMES,
        },
      },
    ],
    skins: [
      {
        name: `${spec.id}_Armature`,
        skeleton: jointNodeOffset,
        joints: jointNodeIndices,
        inverseBindMatrices: ibmAcc,
      },
    ],
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
  const paddedJson = jsonPad > 0 ? Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]) : jsonBuf;
  const binBody = Buffer.concat(binChunks);

  const totalLen = 12 + 8 + paddedJson.length + 8 + binBody.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // 'glTF'
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(paddedJson.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4); // 'JSON'

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binBody.length, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4); // 'BIN\0'

  return Buffer.concat([header, jsonChunkHeader, paddedJson, binChunkHeader, binBody]);
}

// ---------------------------------------------------------------------------
// 6. Execute Build Pipeline for All 5 Canon-Approved Roster Characters
// ---------------------------------------------------------------------------
fs.mkdirSync(OUT_DIR, { recursive: true });

// Strictly enforce Bovar Governance Rule: never fabricate bovar_master.glb
for (const forbidden of ['bovar_master.glb', 'bovar_lod1.glb']) {
  const fp = path.join(OUT_DIR, forbidden);
  if (fs.existsSync(fp)) fs.rmSync(fp, { force: true });
}

for (const spec of ROSTER_SPECS) {
  const pbrPngs = buildCharacterPbrTextures(spec);
  for (const tier of ['master', 'lod1']) {
    const glbBuf = packGlbBinary(spec, tier, pbrPngs);
    const outPath = path.join(OUT_DIR, `${spec.id}_${tier}.glb`);
    fs.writeFileSync(outPath, glbBuf);
    console.log(`[BUILT] ${path.basename(outPath).padEnd(20)} -> ${(glbBuf.length / 1e6).toFixed(2)} MB`);
  }
}
console.log('Beast Gods Production GLB Build Complete.');
