import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import * as THREE from 'three';

/**
 * OPERATION KAI-JAX — PROJECT BEAST GODS (P1-E CHARACTER FIDELITY UPGRADE)
 * Production Sculpted, Retopologized, UV-Unwrapped, High-Res PBR-Textured, Rigged & Animated GLB Compiler.
 *
 * Strictly governed by the Official Legends of Kai-Jax Visual Library sheets:
 *   - 01: Character Visual Library (Boryn, Kai, Kai-Jax, Jax, Borax) — 078f6bfc.png
 *   - 02: Fathers, Mentor, and Elder Fang (Boryn, Borax, Vharok) — 3e003001.png
 *
 * P1-E Fidelity Fixes & Upgrades:
 *   - Fixed vertical glTF UV inversion bug (V=0 maps directly to PNG row 0; removed erroneous `1.0 - v` flip).
 *   - Upgraded embedded PBR atlases to 1024x1024 on Master (256x256 per material region) and 512x512 on Mobile LOD1.
 *   - Added seamless sculpted pelvis/hip trousers bridge + belt buckles (zero thigh-to-torso gap).
 *   - Upgraded sabertooth cranial anatomy: sloped nasal bridge, bilobed whisker pads, gum sockets, flattened curved
 *     ivory sabre tusks, larger angled feline eyes, broad cupped tufted ears, 6 layered spiky cheek ruffs, and crown fur tufts.
 *   - Added character-specific armor & garment silhouettes: Kai purple shoulder yokes & high-arching spider limbs;
 *     Jax multi-layered roaring electric-blue storm mane; Kai-Jax Yin-Yang split fur, diamond knee/shin greaves &
 *     STRICTLY 3 sweeping luminous physical tails (tail_ember, tail_storm, tail_memory); Boryn cross-chest baldric,
 *     beast-skull buckle & forearm wraps; Borax 20-plume silver lion mane, tiered sode pauldrons & Thryxen waist wheel.
 *   - Bovar remains strictly withheld (awaiting_visual_approval — never fabricated).
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

// 4x4 UV Atlas Tiles (col, row in 0..3) — V=0 is top of PNG (row 0) per glTF 2.0 spec
const TILES = {
  FUR_PRIMARY: [0, 0],     // Primary fur (with tiger/cheek war stripes for Boryn/Kai/Kai-Jax)
  FUR_SECONDARY: [1, 0],   // Secondary fur (cream tiger muzzle, silver lion mane, or Kai-Jax obsidian +X half)
  IVORY_FANG: [2, 0],      // Sabertooth tusks & razor claws
  EYE_LEFT: [3, 0],        // +X (viewer-right) glowing predator eye
  JACKET_MAIN: [0, 1],     // Primary techwear jacket / fusion coat / ronin haori
  JACKET_ACCENT: [1, 1],   // Royal purple / cobalt / leather yokes, hood, cuffs, lapels
  INNER_SHIRT: [2, 1],     // Inner tech-shirt / chest fur / white calligraphy scroll sash
  EYE_RIGHT: [3, 1],       // -X (viewer-left) glowing predator eye (Ember-Gold on Kai-Jax!)
  PANTS_CARGO: [0, 2],     // Tactical cargo pants / hakama trousers / nose leather
  SNEAKER_BODY: [1, 2],    // Clawed high-top sneakers / combat boots
  ARMOR_GOLD: [2, 2],      // Brushed gold/bronze armor plates, greaves, buckles, spider hubs
  SASH_TABARD: [3, 2],     // Waist sash / burnt-orange runic tabard / fusion sash
  SPIDER_CHITIN: [0, 3],   // Obsidian-violet dorsal spider limbs with gold joint rings
  STORM_MANE: [1, 3],      // Roaring electric-blue storm-mane flame crests
  TAIL_EMBER: [2, 3],      // Ember Memory fiery tail (or striped tiger / tufted lion tail)
  TAIL_MEMORY: [3, 3],     // Split tile: u<0.5 Storm Current cyan tail | u>=0.5 Memory Weave violet tail
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
    raw[rowStart] = 0;
    Buffer.from(rgbaUint8.buffer, rgbaUint8.byteOffset + y * stride, stride).copy(raw, rowStart + 1);
  }
  const compressed = zlib.deflateSync(raw, { level: 6 });

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
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
 * Synthesizes 4 high-detail PBR PNG Atlases (1024x1024 for Master, 512x512 for LOD1):
 *   - baseColorPng (SRGB)
 *   - ormPng (Linear: R=AO, G=Roughness, B=Metalness)
 *   - normalPng (Linear tangent-space normal map with directional fur strands, seams & armor bevels)
 *   - emissivePng (SRGB glowing predator irises, lightning veins, spider web runes, storm mane & 3 tails)
 */
function buildCharacterPbrTextures(spec, tier = 'master') {
  const SIZE = tier === 'master' ? 1024 : 512;
  const TILE = SIZE / 4;
  const base = new Uint8Array(SIZE * SIZE * 4);
  const orm = new Uint8Array(SIZE * SIZE * 4);
  const norm = new Uint8Array(SIZE * SIZE * 4);
  const emis = new Uint8Array(SIZE * SIZE * 4);
  const heightField = new Float32Array(SIZE * SIZE);

  const cFur1 = hexToRgb(spec.palette.furPrimary);
  const cFurStripe = hexToRgb(spec.palette.furStripe);
  const cFur2 = hexToRgb(spec.palette.furSecondary);
  const cFang = hexToRgb('#F8F4EC');
  const cEyeL = hexToRgb(spec.palette.eyeLeft);
  const cEyeR = hexToRgb(spec.palette.eyeRight);
  const cJacket = hexToRgb(spec.palette.jacketMain);
  const cJacketAcc = hexToRgb(spec.palette.jacketAccent);
  const cInner = hexToRgb(spec.palette.innerShirt);
  const cPants = hexToRgb(spec.palette.pants);
  const cSneaker = hexToRgb(spec.palette.sneaker);
  const cGold = hexToRgb(spec.palette.armorTrim);
  const cSash = hexToRgb(spec.palette.sash);
  const cSpider = hexToRgb('#171326');
  const cSpiderGlow = hexToRgb('#A855F7');
  const cManeBase = hexToRgb('#1D4ED8');
  const cManeMid = hexToRgb('#38BDF8');
  const cManeTip = hexToRgb('#E0F2FE');
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
      let ao = 236;
      let rough = 180;
      let metal = 18;
      let em = [0, 0, 0];
      let hVal = 0.5;

      // Resolution-independent multi-frequency directional fur strands & ripstop tech-weave
      const furStrand =
        Math.sin(u * 138 + Math.sin(v * 26) * 2.8) * 0.45 +
        Math.sin(u * 290 - v * 34) * 0.25 +
        (hash2d(Math.floor(u * 220), Math.floor(v * 64)) - 0.5) * 0.45;
      const fabricWeave =
        Math.sin(u * 190) * Math.sin(v * 190) * 0.3 +
        (hash2d(Math.floor(u * 256), Math.floor(v * 256)) - 0.5) * 0.14;

      if (row === 0 && col === 0) {
        // FUR_PRIMARY (with tapered tiger/war stripes & directional fur normal relief)
        const jag = Math.sin(u * Math.PI * 6) * 0.65 + Math.sin(u * 38) * 0.12;
        const stripeWave = Math.sin(v * Math.PI * (spec.stripeFreq || 8) + jag);
        const isStripe = spec.hasBoldStripes
          ? stripeWave > 0.34 && Math.abs(u - 0.5) > 0.06
          : spec.hasSubtleStripes
            ? stripeWave > 0.66
            : false;
        const shade = Math.max(-0.12, Math.min(0.14, furStrand * 0.16));
        rgb = isStripe
          ? mixRgb(cFur1, cFurStripe, 0.9)
          : shade >= 0
            ? mixRgb(cFur1, [255, 255, 255], shade)
            : mixRgb(cFur1, cFurStripe, -shade * 1.4);
        if (spec.id === 'borax') {
          // Battle scars on Borax's grey-taupe lion face
          const scar = Math.abs((u - 0.34) * 1.4 + (v - 0.48) * 0.85) < 0.016 && v > 0.28 && v < 0.68;
          if (scar) rgb = [68, 56, 54];
        }
        rough = 196;
        metal = 10;
        ao = Math.round(222 + furStrand * 24);
        hVal = 0.5 + furStrand * 0.42 - (isStripe ? 0.06 : 0);
      } else if (row === 0 && col === 1) {
        // FUR_SECONDARY (Cream tiger muzzle, silver lion mane, or Kai-Jax obsidian +X half)
        const stripeWave = Math.sin(v * Math.PI * 8 + Math.cos(u * Math.PI * 4) * 1.1);
        let sub = cFur2;
        if (spec.id === 'kaijax' && stripeWave > 0.68) {
          sub = mixRgb(cFur2, [56, 189, 248], 0.28);
        } else if (spec.id === 'boryn' && v > 0.62 && Math.sin(u * 90) > 0.65) {
          // Whisker follicle spots on Boryn's cream muzzle
          sub = mixRgb(cFur2, [35, 24, 18], 0.55);
        }
        rgb = mixRgb(sub, [255, 255, 255], Math.max(0, furStrand * 0.14));
        rough = 188;
        metal = 12;
        ao = Math.round(226 + furStrand * 20);
        hVal = 0.5 + furStrand * 0.42;
      } else if (row === 0 && col === 2) {
        // IVORY_FANG (v=0 gum root -> v=1 gleaming sabre tip)
        const rootShade = Math.max(0, 1 - v * 1.35);
        const enamelGroove = Math.sin(u * Math.PI * 10) * 0.04 * (1 - v);
        rgb = mixRgb(cFang, [186, 158, 122], rootShade * 0.48);
        rough = Math.round(44 + rootShade * 34);
        metal = 22;
        hVal = 0.5 + enamelGroove;
      } else if ((row === 0 && col === 3) || (row === 1 && col === 3)) {
        // GLOWING PREDATOR EYES (EYE_LEFT [3,0] / EYE_RIGHT [3,1])
        const eyeCol = row === 0 ? cEyeL : cEyeR;
        const dx = (u - 0.5) * 2;
        const dy = (v - 0.5) * 2;
        const r = Math.hypot(dx, dy);
        const isSlit = Math.abs(dx) < 0.11 * (1 - Math.min(1, Math.abs(dy) * 1.15)) + 0.02 && Math.abs(dy) < 0.62;
        const specHighlight = Math.hypot(dx + 0.24, dy + 0.26) < 0.13;
        if (specHighlight) {
          rgb = [255, 255, 255];
          em = [255, 255, 255];
        } else if (isSlit) {
          rgb = [10, 8, 18];
          em = mixRgb(eyeCol, [0, 0, 0], 0.78);
        } else if (r < 0.82) {
          const irisFiber = Math.sin(Math.atan2(dy, dx) * 28) * 0.12;
          const irisGlow = Math.max(0, 1 - r / 0.82 + irisFiber);
          rgb = mixRgb(eyeCol, [255, 252, 240], irisGlow * 0.58);
          em = mixRgb(eyeCol, [255, 255, 255], irisGlow * 0.52);
        } else {
          // Dark feline eyeliner rim
          rgb = [16, 14, 22];
          em = mixRgb(eyeCol, [0, 0, 0], 0.72);
        }
        rough = 18;
        metal = 10;
      } else if (row === 1 && col === 0) {
        // JACKET_MAIN (Street-techwear paneling, zippers, lightning veins, or Ronin brocade)
        const hemTrim = v < 0.09 || v > 0.88;
        const panelSeam = Math.abs(u - 0.24) < 0.012 || Math.abs(u - 0.76) < 0.012 || Math.abs(v - 0.52) < 0.01;
        rgb = hemTrim ? cJacketAcc : panelSeam ? mixRgb(cJacket, cJacketAcc, 0.48) : cJacket;

        if (spec.id === 'kai') {
          // Kai cyber-tech purple chest/sleeve accents & gold micro-piping
          const goldPipe = Math.abs(v - 0.87) < 0.014 || Math.abs(v - 0.10) < 0.012;
          const purpleStripe = Math.abs(v - 0.34) < 0.045 && (u < 0.28 || u > 0.72);
          if (goldPipe) {
            rgb = cGold;
            metal = 210;
            rough = 68;
          } else if (purpleStripe) {
            rgb = cJacketAcc;
          }
        }
        if (spec.hasLightningSleeves) {
          // Branching storm/arcane lightning veins
          const jag1 = Math.sin(v * 22 + Math.sin(u * 19) * 2.1);
          const jag2 = Math.cos(u * 26 - Math.sin(v * 17) * 1.9);
          const bolt = Math.abs(jag1 * 0.7 + jag2 * 0.3);
          if (bolt > 0.90) {
            const intensity = (bolt - 0.90) / 0.10;
            rgb = mixRgb(rgb, cLightning, 0.75 + intensity * 0.25);
            em = mixRgb([0, 0, 0], cLightning, 0.55 + intensity * 0.45);
          }
        }
        if (spec.id === 'borax') {
          // Gold diamond samurai kumiko brocade on indigo haori
          const diamond = Math.abs(((u * 10) % 1) - 0.5) + Math.abs(((v * 10) % 1) - 0.5);
          if (Math.abs(diamond - 0.48) < 0.055 || u < 0.07 || u > 0.93) {
            rgb = mixRgb(rgb, cGold, 0.82);
            metal = 185;
            rough = 82;
          }
        }
        rough = Math.min(rough, 142);
        ao = panelSeam ? 182 : 236;
        hVal = 0.5 + fabricWeave * 0.28 + (panelSeam ? -0.22 : 0);
      } else if (row === 1 && col === 1) {
        // JACKET_ACCENT (Royal purple yokes/hood, cobalt cuffs, studded leather)
        const goldEdge = u < 0.08 || u > 0.92 || v > 0.91;
        const stitch = (Math.abs(u - 0.11) < 0.008 || Math.abs(u - 0.89) < 0.008) && Math.sin(v * 120) > 0;
        rgb = goldEdge ? mixRgb(cGold, cJacketAcc, 0.18) : stitch ? cGold : cJacketAcc;
        rough = goldEdge ? 68 : 148;
        metal = goldEdge ? 205 : 28;
        hVal = 0.5 + fabricWeave * 0.24 + (goldEdge ? 0.22 : 0);
      } else if (row === 1 && col === 2) {
        // INNER_SHIRT / CALLIGRAPHY SCROLL
        rgb = cInner;
        if (spec.id === 'borax') {
          // Crisp dark ink brush-calligraphy glyphs + gold border on white scroll sash
          const border = u < 0.12 || u > 0.88;
          const inCol = Math.abs(u - 0.5) < 0.22 && v > 0.08 && v < 0.92;
          const strokeA = Math.sin(v * 68 + Math.sin(u * 24) * 1.6);
          const strokeB = Math.cos((v * 110) % Math.PI + (u - 0.5) * 18);
          const cellGap = Math.sin(v * Math.PI * 9) > -0.65;
          if (border) {
            rgb = cGold;
            metal = 175;
            rough = 85;
          } else if (inCol && cellGap && strokeA * strokeB > 0.26) {
            rgb = [22, 26, 38];
          }
        } else if (spec.id === 'kai') {
          // Subtle rib-knit collar & violet pendant cord on Kai's inner tee
          const cord = Math.abs(Math.hypot((u - 0.5) * 1.8, (v - 0.72) * 1.2) - 0.28) < 0.022 && v > 0.45;
          if (cord) {
            rgb = cGold;
            metal = 190;
          }
        }
        rough = Math.min(rough, 172);
        hVal = 0.5 + fabricWeave * 0.22;
      } else if (row === 2 && col === 0) {
        // PANTS_CARGO (Dark charcoal/navy ripstop cargo trousers with tactical straps & seams)
        const strap = Math.abs(v - 0.44) < 0.036 || Math.abs(v - 0.74) < 0.028;
        const buckle = strap && Math.abs(u - 0.5) < 0.08;
        const seam = Math.abs(u - 0.5) < 0.012 || Math.abs(u - 0.18) < 0.01;
        rgb = buckle ? cGold : strap ? mixRgb(cPants, cJacketAcc, 0.72) : cPants;
        rough = buckle ? 65 : strap ? 118 : 176;
        metal = buckle ? 215 : strap ? 52 : 16;
        ao = seam ? 185 : 234;
        hVal = 0.5 + fabricWeave * 0.30 + (strap ? 0.22 : seam ? -0.18 : 0);
      } else if (row === 2 && col === 1) {
        // SNEAKER_BODY / COMBAT BOOTS (v=0 chunky rubber outsole -> v=1 ankle tongue/collar)
        const outsole = v < 0.16;
        const midsole = v >= 0.16 && v < 0.27;
        const chevron = Math.abs(u - 0.5) > 0.14 && Math.abs((v - 0.52) - Math.abs(u - 0.5) * 0.55) < 0.075;
        const laces = Math.abs(u - 0.5) < 0.13 && v > 0.42 && v < 0.84 && Math.sin(v * 95) > 0.15;
        if (spec.id === 'boryn' || spec.id === 'borax') {
          rgb = outsole
            ? [24, 21, 20]
            : midsole
              ? [46, 38, 34]
              : chevron || laces
                ? cGold
                : cSneaker;
        } else {
          rgb = outsole
            ? cJacketAcc
            : midsole
              ? [242, 245, 250]
              : laces
                ? cGold
                : chevron
                  ? cJacketAcc
                  : cSneaker;
        }
        rough = outsole ? 158 : midsole ? 128 : 96;
        metal = chevron || laces ? 130 : 32;
        hVal = 0.5 + (outsole ? Math.sin(u * 68) * 0.32 : fabricWeave * 0.2 + (chevron ? 0.18 : 0));
      } else if (row === 2 && col === 2) {
        // ARMOR_GOLD / BRUSHED METALLIC PLATES & FILIGREE
        const edgeDist = Math.min(u, 1 - u, v, 1 - v);
        const inlay = edgeDist > 0.16 && edgeDist < 0.22;
        const brush = Math.sin(u * 210) * 0.04;
        rgb = edgeDist < 0.09
          ? mixRgb(cGold, [255, 250, 224], 0.48)
          : inlay
            ? mixRgb(cJacket, cGold, 0.35)
            : cGold;
        rough = inlay ? 115 : 58;
        metal = inlay ? 140 : 232;
        hVal = 0.5 + brush + (edgeDist < 0.09 ? 0.28 : inlay ? -0.18 : 0);
      } else if (row === 2 && col === 3) {
        // SASH_TABARD (Runic burnt-orange tabard on Boryn, cobalt sash on Jax, white/purple fusion sash on Kai-Jax)
        const border = u < 0.11 || u > 0.89 || v < 0.06;
        const inGlyph = Math.abs(u - 0.5) < 0.24 && v > 0.12 && v < 0.88;
        const runePattern =
          Math.sin(v * 58) * Math.cos((u - 0.5) * 36) > 0.34 && Math.sin(v * Math.PI * 7) > -0.55;
        rgb = cSash;
        if (spec.id === 'boryn') {
          if (border) rgb = [48, 28, 18];
          else if (inGlyph && runePattern) rgb = [24, 16, 14];
        } else if (spec.id === 'kaijax') {
          if (u > 0.72 || u < 0.28) rgb = [109, 40, 217];
          else if (inGlyph && runePattern) rgb = mixRgb(cGold, [30, 22, 48], 0.55);
        } else if (border) {
          rgb = mixRgb(cSash, cGold, 0.45);
        }
        rough = 148;
        metal = border ? 110 : 22;
        hVal = 0.5 + fabricWeave * 0.24;
      } else if (row === 3 && col === 0) {
        // SPIDER_CHITIN (Obsidian carapace + gold joint collars + glowing violet Memory-Web neural veins)
        const goldRing = Math.abs(v - 0.33) < 0.038 || Math.abs(v - 0.66) < 0.035 || v < 0.06;
        const vein = Math.abs(u - 0.5) < 0.075 || Math.abs(u - 0.25) < 0.03 || Math.abs(u - 0.75) < 0.03 || v > 0.86;
        rgb = goldRing ? cGold : vein ? cSpiderGlow : cSpider;
        em = !goldRing && vein ? mixRgb(cSpiderGlow, [255, 255, 255], v > 0.86 ? 0.45 : 0.22) : [0, 0, 0];
        rough = goldRing ? 56 : 44;
        metal = goldRing ? 235 : 192;
        hVal = 0.5 + (goldRing ? 0.32 : Math.sin(u * 32) * 0.16);
      } else if (row === 3 && col === 1) {
        // STORM_MANE (Roaring electric-blue flame gradient: deep cobalt base -> cyan core -> white-hot arcs)
        const t = Math.pow(v, 0.72);
        const streak = Math.sin(u * 36 + Math.sin(v * 18) * 2.2) * 0.5 + 0.5;
        rgb = t < 0.55
          ? mixRgb(cManeBase, cManeMid, t / 0.55)
          : mixRgb(cManeMid, cManeTip, (t - 0.55) / 0.45 * (0.65 + streak * 0.35));
        em = mixRgb(cManeBase, cManeTip, Math.min(1, t * (0.62 + streak * 0.45)));
        rough = 72;
        metal = 28;
        hVal = 0.5 + furStrand * 0.42;
      } else if (row === 3 && col === 2) {
        // TAIL_EMBER (Kai-Jax fiery Ember Memory tail; Boryn ringed tiger tail; Borax lion tail)
        if (spec.id === 'kaijax') {
          const flame = Math.sin(u * 30 + v * 20) * 0.5 + 0.5;
          rgb = mixRgb([217, 70, 15], [254, 240, 138], Math.pow(v, 0.72) * (0.7 + flame * 0.3));
          em = mixRgb([234, 88, 12], [253, 224, 71], Math.min(1, v * 0.85 + flame * 0.2));
          rough = 82;
        } else if (spec.id === 'boryn') {
          const ring = Math.sin(v * Math.PI * 10 + Math.sin(u * 12) * 0.4) > 0.12 || v > 0.88;
          rgb = ring ? [22, 16, 13] : cFur1;
          rough = 194;
        } else {
          rgb = v > 0.74 ? cFur2 : cFur1;
          rough = 190;
        }
        hVal = 0.5 + furStrand * 0.38;
      } else if (row === 3 && col === 3) {
        // TAIL_MEMORY (u < 0.5 = Storm Current cyan-blue tail; u >= 0.5 = Memory Weave cosmic violet web tail)
        const lattice = Math.abs(Math.sin(u * 44 + v * 32)) > 0.90 || Math.abs(Math.sin(u * 44 - v * 32)) > 0.90;
        if (u < 0.5) {
          rgb = mixRgb([3, 105, 161], lattice ? [224, 242, 254] : [125, 211, 252], Math.pow(v, 0.74));
          em = mixRgb([14, 165, 233], [224, 242, 254], Math.min(1, v * 0.82 + (lattice ? 0.25 : 0)));
        } else {
          rgb = mixRgb([88, 28, 135], lattice ? [250, 232, 255] : [216, 180, 254], Math.pow(v, 0.74));
          em = mixRgb(cTailMemory, [245, 208, 254], Math.min(1, v * 0.82 + (lattice ? 0.28 : 0)));
        }
        rough = 80;
        metal = 32;
        hVal = 0.5 + furStrand * 0.36 + (lattice ? 0.18 : 0);
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

  // Compute tangent-space normal map from heightField (OpenGL +Y up tangent convention for glTF 2.0)
  const normalScale = tier === 'master' ? 2.6 : 2.2;
  for (let py = 0; py < SIZE; py++) {
    const ym = Math.max(0, py - 1);
    const yp = Math.min(SIZE - 1, py + 1);
    for (let px = 0; px < SIZE; px++) {
      const xm = Math.max(0, px - 1);
      const xp = Math.min(SIZE - 1, px + 1);
      const dx = (heightField[py * SIZE + xp] - heightField[py * SIZE + xm]) * normalScale;
      const dy = (heightField[yp * SIZE + px] - heightField[ym * SIZE + px]) * normalScale;
      const nx = -dx;
      const ny = dy;
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
    this.positions = [];
    this.uvs = [];
    this.tags = [];
    this.indices = [];
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
      liningTile = TILES.JACKET_ACCENT,
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
      const ringTile = ring.tileOverride || tile;

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

        const chosenTile = splitTilePositiveX && wx > 0.002 ? splitTilePositiveX : ringTile;
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
      const chosenTile = splitTilePositiveX && r0.cx > 0.002 ? splitTilePositiveX : r0.tileOverride || tile;
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
      const chosenTile = splitTilePositiveX && rn.cx > 0.002 ? splitTilePositiveX : rn.tileOverride || tile;
      this.positions.push([rn.cx, rn.cy + (rn.capLift || 0), rn.cz]);
      this.uvs.push(this.mapTileUv(chosenTile, 0.5, 0.95, uSubRange));
      this.tags.push({ tag, theta: 0, vFrac: 1, localX: 0, localZ: 0 });
      for (let s = 0; s < radialSegs; s++) {
        this.indices.push(cIdx, lastRow + s, lastRow + s + 1);
      }
    }

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
          const [uAtlas, vAtlas] = this.mapTileUv(liningTile, uFrac, vFrac);
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
          this.indices.push(a, c, d);
          this.indices.push(a, b, c);
        }
      }
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

  addSplineTube(points, radiusFn, opts) {
    const {
      tubularSegs = 16,
      radialSegs = 12,
      tile = TILES.FUR_PRIMARY,
      splitTilePositiveX = null,
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

        const chosenTile = splitTilePositiveX && wx > 0.002 ? splitTilePositiveX : tile;
        const [uAtlas, vAtlas] = this.mapTileUv(chosenTile, uFrac, vFrac, uSubRange);
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

    const endPt = curve.getPointAt(1.0);
    const tipIdx = this.vertexCount;
    const chosenTipTile = splitTilePositiveX && endPt.x > 0.002 ? splitTilePositiveX : tile;
    this.positions.push([endPt.x, endPt.y, endPt.z]);
    this.uvs.push(this.mapTileUv(chosenTipTile, 0.5, 0.96, uSubRange));
    this.tags.push({ tag, theta: 0, vFrac: 1, splineT: 1 });
    const lastRing = baseVertex + tubularSegs * cols;
    for (let s = 0; s < radialSegs; s++) {
      this.indices.push(tipIdx, lastRing + s + 1, lastRing + s);
    }
  }

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
    shoulderWidth: 0.242,
    hipWidth: 0.132,
    bulk: 0.96,
    spiderCount: 4,
    maneCount: 0,
    tailMode: 'none',
    hasHorns: true,
    hasCrownSpikes: true,
    garmentStyle: 'techwear_kai',
    hasSubtleStripes: true,
    hasBoldStripes: false,
    stripeFreq: 8,
    palette: {
      furPrimary: '#EDF2FA',
      furStripe: '#3A2C54',
      furSecondary: '#F8FAFC',
      eyeLeft: '#A855F7',
      eyeRight: '#A855F7',
      jacketMain: '#F1F5F9',
      jacketAccent: '#6D28D9',
      innerShirt: '#CBD5E1',
      pants: '#141722',
      sneaker: '#F1F5F9',
      armorTrim: '#F59E0B',
      sash: '#7C3AED',
      tailPrimary: '#F97316',
    },
  },
  {
    id: 'jax',
    height: 1.88,
    shoulderWidth: 0.272,
    hipWidth: 0.142,
    bulk: 1.08,
    spiderCount: 0,
    maneCount: 7,
    tailMode: 'none',
    hasHorns: false,
    hasCrownSpikes: true,
    garmentStyle: 'techwear_jax',
    hasLightningSleeves: true,
    hasSubtleStripes: false,
    hasBoldStripes: false,
    palette: {
      furPrimary: '#141924',
      furStripe: '#0A0D14',
      furSecondary: '#1F2738',
      eyeLeft: '#38BDF8',
      eyeRight: '#38BDF8',
      jacketMain: '#111622',
      jacketAccent: '#1D4ED8',
      jacketGlow: '#38BDF8',
      innerShirt: '#182032',
      pants: '#121622',
      sneaker: '#161D2E',
      armorTrim: '#38BDF8',
      sash: '#2563EB',
      tailPrimary: '#38BDF8',
    },
  },
  {
    id: 'kaijax',
    height: 2.04,
    shoulderWidth: 0.302,
    hipWidth: 0.155,
    bulk: 1.15,
    spiderCount: 4,
    maneCount: 7,
    tailMode: 'tri_canon', // STRICTLY 3 PHYSICAL TAILS: Ember, Storm, Memory!
    hasHorns: true,
    hasCrownSpikes: true,
    splitFurYinYang: true, // -X (viewer-left) Silver-White + Ember-Gold Eye; +X (viewer-right) Obsidian-Black + Storm-Blue Eye!
    garmentStyle: 'fusion_coat',
    hasLightningSleeves: true,
    hasSubtleStripes: true,
    hasBoldStripes: false,
    stripeFreq: 9,
    palette: {
      furPrimary: '#EFF4FC',   // Viewer-left (-X) Silver-White Fur
      furStripe: '#201B32',
      furSecondary: '#121622', // Viewer-right (+X) Obsidian-Black Fur
      eyeLeft: '#38BDF8',      // +X (viewer-right) Storm-Blue Eye
      eyeRight: '#F59E0B',     // -X (viewer-left) Ember-Gold Eye
      jacketMain: '#161426',
      jacketAccent: '#6D28D9',
      jacketGlow: '#A855F7',
      innerShirt: '#F1F5F9',
      pants: '#131522',
      sneaker: '#1C1730',
      armorTrim: '#D4AF37',
      sash: '#F8FAFC',
      tailPrimary: '#F97316',
    },
  },
  {
    id: 'boryn',
    height: 2.12,
    shoulderWidth: 0.338,
    hipWidth: 0.172,
    bulk: 1.32,
    spiderCount: 0,
    maneCount: 0,
    tailMode: 'single',
    hasHorns: false,
    hasCrownSpikes: false,
    garmentStyle: 'shield_harness',
    hasBoldStripes: true,
    stripeFreq: 10,
    palette: {
      furPrimary: '#E07A24',
      furStripe: '#16110E',
      furSecondary: '#F6E8D5',
      eyeLeft: '#F59E0B',
      eyeRight: '#F59E0B',
      jacketMain: '#241C19',
      jacketAccent: '#463225',
      innerShirt: '#E07A24',
      pants: '#1D1F26',
      sneaker: '#2C221C',
      armorTrim: '#C68E45',
      sash: '#CA5A18',
      tailPrimary: '#E07A24',
    },
  },
  {
    id: 'borax',
    height: 2.20,
    shoulderWidth: 0.328,
    hipWidth: 0.168,
    bulk: 1.24,
    spiderCount: 0,
    maneCount: 0,
    hasLionMane: true,
    tailMode: 'single',
    hasHorns: false,
    hasCrownSpikes: false,
    garmentStyle: 'storm_ronin',
    hasLightningSleeves: true,
    hasSubtleStripes: false,
    hasBoldStripes: false,
    palette: {
      furPrimary: '#9E958A',   // Scarred grey-taupe sabertooth lion muzzle/fur
      furStripe: '#575049',
      furSecondary: '#E6EDF7', // Voluminous silver-white lion mane
      eyeLeft: '#F59E0B',
      eyeRight: '#F59E0B',
      jacketMain: '#16243C',   // Deep Storm Ronin indigo haori
      jacketAccent: '#1E3A5F',
      jacketGlow: '#38BDF8',
      innerShirt: '#F4F1EA',   // White calligraphy scroll sash
      pants: '#121D30',
      sneaker: '#1C2434',
      armorTrim: '#D4AF37',    // Gold samurai trim
      sash: '#1D3557',
      tailPrimary: '#9E958A',
    },
  },
];

// ---------------------------------------------------------------------------
// 4. Unified Skeleton + Anatomical Sculpture + Skinning + 19 Animations
// ---------------------------------------------------------------------------
function buildSkeletonDefinition(spec) {
  const H = spec.height;
  const S = H / 1.85;
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
  addBone('head', 'neck', [0, 1.59 * S, 0.03 * S]);
  addBone('jaw', 'head', [0, 1.525 * S, 0.085 * S]);
  addBone('ear_L', 'head', [0.135 * S, 1.72 * S, -0.01 * S]);
  addBone('ear_R', 'head', [-0.135 * S, 1.72 * S, -0.01 * S]);

  // Arms & Articulated Hands (+X = Left, -X = Right when facing +Z)
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    addBone(`clavicle_${suf}`, 'chest', [sign * 0.095 * S, 1.43 * S, 0.01 * S]);
    addBone(`upper_arm_${suf}`, `clavicle_${suf}`, [sign * shX, 1.40 * S, 0]);
    addBone(`forearm_${suf}`, `upper_arm_${suf}`, [sign * (shX + 0.048 * S), 1.13 * S, 0.012 * S]);
    addBone(`hand_${suf}`, `forearm_${suf}`, [sign * (shX + 0.072 * S), 0.88 * S, 0.042 * S]);
  }

  // Legs, Ankles & Clawed Feet
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    addBone(`thigh_${suf}`, 'pelvis', [sign * hipX, 0.90 * S, 0]);
    addBone(`shin_${suf}`, `thigh_${suf}`, [sign * (hipX + 0.01 * S), 0.49 * S, 0.02 * S]);
    addBone(`foot_${suf}`, `shin_${suf}`, [sign * (hipX + 0.015 * S), 0.11 * S, 0.01 * S]);
    addBone(`toe_${suf}`, `foot_${suf}`, [sign * (hipX + 0.015 * S), 0.04 * S, 0.14 * S]);
  }

  // Kai & Kai-Jax: 4 High-Arching Articulated Dorsal Spider Limbs (12 bones: spider_UL/UR/LL/LR_01..03)
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
        ? [s * 0.11 * S, 1.42 * S, -0.14 * S]
        : [s * 0.13 * S, 1.25 * S, -0.15 * S];
      const p1 = cfg.upper
        ? [s * 0.42 * S, 1.86 * S, -0.24 * S]
        : [s * 0.48 * S, 1.44 * S, -0.27 * S];
      const p2 = cfg.upper
        ? [s * 0.46 * S, 2.11 * S, -0.04 * S]
        : [s * 0.65 * S, 1.08 * S, -0.08 * S];
      const pTip = cfg.upper
        ? [s * 0.22 * S, 1.94 * S, 0.16 * S]
        : [s * 0.48 * S, 0.62 * S, 0.15 * S];

      addBone(`${cfg.prefix}_01`, 'chest', p0);
      addBone(`${cfg.prefix}_02`, `${cfg.prefix}_01`, p1);
      addBone(`${cfg.prefix}_03`, `${cfg.prefix}_02`, p2);
      spiderChains.push({ ...cfg, points: [p0, p1, p2, pTip] });
    }
  }

  // Jax & Kai-Jax: 7 Roaring Electric-Blue Storm Mane Flame Crests (mane_01..07)
  const maneChains = [];
  if (spec.maneCount === 7) {
    for (let i = 1; i <= 7; i++) {
      const u = (i - 4) / 3; // -1 .. +1
      const arch = 1 - Math.abs(u) * 0.32;
      const base = [u * 0.16 * S, (1.66 - Math.abs(u) * 0.08) * S, -0.04 * S];
      const mid = [u * 0.34 * S, (1.92 * arch) * S, -0.22 * S];
      const tip = [u * 0.46 * S, (2.10 * arch) * S, -0.46 * S];
      addBone(`mane_0${i}`, 'head', base);
      maneChains.push({ name: `mane_0${i}`, u, points: [base, mid, tip] });
    }
  }

  // Physical Tails (STRICTLY 3-Tail Canon Rule for Kai-Jax; 1 Tail for Boryn & Borax; 0 for Kai & Jax)
  const tailChains = [];
  if (spec.tailMode === 'tri_canon') {
    const triDefs = [
      {
        prefix: 'tail_ember',
        tile: TILES.TAIL_EMBER,
        uSub: null,
        pts: [
          [-0.09 * S, 0.92 * S, -0.14 * S],
          [-0.34 * S, 0.72 * S, -0.34 * S],
          [-0.54 * S, 0.44 * S, -0.44 * S],
          [-0.44 * S, 0.24 * S, -0.16 * S],
          [-0.30 * S, 0.50 * S, 0.02 * S],
        ],
      },
      {
        prefix: 'tail_storm',
        tile: TILES.TAIL_MEMORY,
        uSub: [0.04, 0.46],
        pts: [
          [0, 0.92 * S, -0.15 * S],
          [0.06 * S, 0.66 * S, -0.42 * S],
          [0.14 * S, 0.34 * S, -0.56 * S],
          [0.06 * S, 0.18 * S, -0.26 * S],
          [0.02 * S, 0.40 * S, -0.08 * S],
        ],
      },
      {
        prefix: 'tail_memory',
        tile: TILES.TAIL_MEMORY,
        uSub: [0.54, 0.96],
        pts: [
          [0.09 * S, 0.92 * S, -0.14 * S],
          [0.34 * S, 0.72 * S, -0.34 * S],
          [0.54 * S, 0.46 * S, -0.44 * S],
          [0.45 * S, 0.26 * S, -0.16 * S],
          [0.32 * S, 0.54 * S, 0.02 * S],
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
      [0, 0.92 * S, -0.15 * S],
      [0.12 * S, 0.70 * S, -0.38 * S],
      [0.26 * S, 0.46 * S, -0.48 * S],
      [0.32 * S, 0.30 * S, -0.30 * S],
      [0.26 * S, 0.44 * S, -0.14 * S],
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
  const R_BODY = isMaster ? 22 : 12;
  const R_LIMB = isMaster ? 16 : 9;
  const R_DETAIL = isMaster ? 12 : 7;
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
          tileOverride: t < 0.5 ? a.tileOverride : b.tileOverride,
        });
      }
    }
    out.push(rings[rings.length - 1]);
    return out;
  };

  // 1. Muscular Core Torso & Neck (continuous sculpted V-taper anatomy)
  const torsoTile =
    spec.garmentStyle === 'shield_harness' || spec.garmentStyle === 'fusion_coat'
      ? TILES.FUR_PRIMARY
      : TILES.INNER_SHIRT;
  const torsoSplit = spec.garmentStyle === 'fusion_coat' ? splitFur : null;

  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 0.86 * S, cz: 0, rx: 0.152 * B * S, rz: 0.118 * B * S },
        { cx: 0, cy: 1.02 * S, cz: 0, rx: 0.144 * B * S, rz: 0.115 * B * S },
        {
          cx: 0,
          cy: 1.18 * S,
          cz: 0.01 * S,
          rx: 0.172 * B * S,
          rz: 0.136 * B * S,
          lobe: (th) => 1 + Math.max(0, Math.cos(th)) * 0.09,
        },
        {
          cx: 0,
          cy: 1.35 * S,
          cz: 0.016 * S,
          rx: 0.205 * B * S,
          rz: 0.152 * B * S,
          lobe: (th) => 1 + Math.pow(Math.max(0, Math.cos(th)), 2) * 0.14,
        },
        { cx: 0, cy: 1.46 * S, cz: 0.018 * S, rx: 0.118 * B * S, rz: 0.108 * B * S, tileOverride: TILES.FUR_PRIMARY },
        { cx: 0, cy: 1.57 * S, cz: 0.026 * S, rx: 0.098 * B * S, rz: 0.098 * B * S, tileOverride: TILES.FUR_PRIMARY },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_BODY, tile: torsoTile, splitTilePositiveX: torsoSplit || splitFur, tag: 'torso' }
  );

  // 1B. Seamless Sculpted Pelvis / Hip Trousers Block & Tactical Waist Belt (Eliminates leg-to-torso gap!)
  acc.addLoft(
    [
      {
        cx: 0,
        cy: 0.76 * S,
        cz: 0.005 * S,
        rx: (hipX + 0.095 * B) * S,
        rz: 0.118 * B * S,
        capDrop: 0.015 * S,
        lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 2) * 0.14 - Math.pow(Math.cos(th), 4) * 0.12,
      },
      {
        cx: 0,
        cy: 0.86 * S,
        cz: 0.004 * S,
        rx: (hipX + 0.102 * B) * S,
        rz: 0.132 * B * S,
        lobe: (th) => 1 + Math.max(0, -Math.cos(th)) * 0.12, // Glute fullness
      },
      {
        cx: 0,
        cy: 0.96 * S,
        cz: 0.002 * S,
        rx: 0.168 * B * S,
        rz: 0.132 * B * S,
        capLift: 0.01 * S,
      },
    ],
    { radialSegs: R_LIMB, tile: TILES.PANTS_CARGO, tag: 'pelvis_hip' }
  );

  // Sculpted Tactical Belt & Signature Center Buckle / Medallion
  const beltTile =
    spec.id === 'kai'
      ? TILES.INNER_SHIRT
      : spec.id === 'jax'
        ? TILES.SASH_TABARD
        : TILES.ARMOR_GOLD;
  acc.addLoft(
    [
      { cx: 0, cy: 0.92 * S, cz: 0.004 * S, rx: 0.176 * B * S, rz: 0.140 * B * S },
      { cx: 0, cy: 0.985 * S, cz: 0.004 * S, rx: 0.174 * B * S, rz: 0.138 * B * S },
    ],
    { radialSegs: R_LIMB, tile: beltTile, tag: 'belt' }
  );

  // Center Waist Crest (Beast-Skull Buckle on Boryn, Fusion Star on Kai-Jax, Thryxen Wheel on Borax, Tech Buckle on Kai/Jax)
  const buckleScale = spec.id === 'borax' || spec.id === 'boryn' || spec.id === 'kaijax' ? 1.25 : 0.82;
  acc.addLoft(
    [
      { cx: 0, cy: 0.955 * S, cz: 0.138 * B * S, rx: 0.052 * buckleScale * S, rz: 0.048 * buckleScale * S, pitch: Math.PI * 0.5 },
      { cx: 0, cy: 0.955 * S, cz: (0.138 * B + 0.026) * S, rx: 0.042 * buckleScale * S, rz: 0.038 * buckleScale * S, pitch: Math.PI * 0.5, capLift: 0.01 * S },
    ],
    { radialSegs: 10, tile: TILES.ARMOR_GOLD, tag: 'belt' }
  );

  // 2. Sculpted Sabertooth Beast Cranium + Strong Zygomatic Cheekbones
  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 1.50 * S, cz: 0.02 * S, rx: 0.106 * S, rz: 0.106 * S, capDrop: 0.01 * S },
        {
          cx: 0,
          cy: 1.565 * S,
          cz: 0.032 * S,
          rx: 0.168 * S,
          rz: 0.148 * S,
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 3) * 0.26 + (Math.cos(th) < -0.3 ? 0.08 : 0),
        },
        {
          cx: 0,
          cy: 1.64 * S,
          cz: 0.035 * S,
          rx: 0.154 * S,
          rz: 0.152 * S,
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 4) * 0.16 + Math.pow(Math.max(0, Math.cos(th)), 3) * 0.08,
        },
        { cx: 0, cy: 1.715 * S, cz: 0.018 * S, rx: 0.126 * S, rz: 0.134 * S },
        { cx: 0, cy: 1.77 * S, cz: 0.0 * S, rx: 0.078 * S, rz: 0.092 * S, capLift: 0.02 * S },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_BODY, tile: TILES.FUR_PRIMARY, splitTilePositiveX: splitFur, tag: 'head' }
  );

  // 2B. Layered Spiky Sabertooth Cheek Ruffs (3 layered fur tufts per cheek!)
  for (const sign of [-1, 1]) {
    const ruffTile = sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY;
    for (let r = 0; r < 3; r++) {
      const yOff = (r - 1) * 0.036 * S;
      const lenScale = r === 1 ? 1.15 : 0.92;
      acc.addSplineTube(
        [
          [sign * 0.125 * S, 1.595 * S + yOff, 0.055 * S],
          [sign * 0.195 * lenScale * S, 1.585 * S + yOff * 1.15, 0.015 * S],
          [sign * 0.248 * lenScale * S, 1.568 * S + yOff * 1.35, -0.045 * S],
        ],
        (t) => (1 - Math.pow(t, 1.15) * 0.88) * 0.032 * S,
        { tubularSegs: isMaster ? 6 : 4, radialSegs: isMaster ? 7 : 5, tile: ruffTile, tag: 'head', flattenY: 0.55 }
      );
    }
  }

  // 2C. Wild Spiky Crown Fur Tufts (Kai, Kai-Jax, Jax)
  if (spec.hasCrownSpikes) {
    const crownAngles = [-0.42, -0.18, 0, 0.18, 0.42];
    for (const ang of crownAngles) {
      const cTile = ang > 0.01 && splitFur ? splitFur : TILES.FUR_PRIMARY;
      const hBoost = 1 - Math.abs(ang) * 0.45;
      acc.addSplineTube(
        [
          [ang * 0.16 * S, 1.735 * S, 0.03 * S],
          [ang * 0.22 * S, (1.805 * hBoost + 0.03) * S, -0.01 * S],
          [ang * 0.27 * S, (1.865 * hBoost + 0.04) * S, -0.065 * S],
        ],
        (t) => (1 - Math.pow(t, 1.2) * 0.9) * 0.030 * S,
        { tubularSegs: isMaster ? 5 : 4, radialSegs: isMaster ? 6 : 5, tile: cTile, tag: 'head', flattenY: 0.65 }
      );
    }
  }

  // 3. Sculpted Sabertooth Nasal Bridge & Bilobed Upper Muzzle Whisker Pads
  const snoutTile = spec.id === 'boryn' ? TILES.FUR_SECONDARY : TILES.FUR_PRIMARY;
  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 1.60 * S, cz: 0.105 * S, rx: 0.102 * S, rz: 0.074 * S, pitch: Math.PI * 0.44 },
        {
          cx: 0,
          cy: 1.578 * S,
          cz: 0.172 * S,
          rx: 0.092 * S,
          rz: 0.066 * S,
          pitch: Math.PI * 0.47,
          // Bilobed feline whisker-pad swell with central philtrum cleft!
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 2) * 0.24 - Math.pow(Math.max(0, -Math.cos(th)), 4) * 0.10,
        },
        {
          cx: 0,
          cy: 1.560 * S,
          cz: 0.232 * S,
          rx: 0.076 * S,
          rz: 0.054 * S,
          pitch: Math.PI * 0.5,
          capLift: 0.016 * S,
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 2) * 0.16,
        },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_LIMB, tile: snoutTile, splitTilePositiveX: splitFur, tag: 'snout' }
  );

  // Sloped Dorsal Nasal Bridge (connects brow ridge smoothly to nose leather)
  acc.addLoft(
    [
      { cx: 0, cy: 1.648 * S, cz: 0.135 * S, rx: 0.044 * S, rz: 0.032 * S, pitch: Math.PI * 0.34 },
      { cx: 0, cy: 1.615 * S, cz: 0.188 * S, rx: 0.038 * S, rz: 0.028 * S, pitch: Math.PI * 0.38 },
      { cx: 0, cy: 1.588 * S, cz: 0.235 * S, rx: 0.032 * S, rz: 0.022 * S, pitch: Math.PI * 0.42, capLift: 0.008 * S },
    ],
    { radialSegs: 10, tile: TILES.FUR_PRIMARY, splitTilePositiveX: splitFur, tag: 'snout' }
  );

  // Sculpted Dark Triangular Feline Nose Leather
  acc.addLoft(
    [
      { cx: 0, cy: 1.582 * S, cz: 0.236 * S, rx: 0.036 * S, rz: 0.025 * S, pitch: Math.PI * 0.5 },
      { cx: 0, cy: 1.576 * S, cz: 0.256 * S, rx: 0.025 * S, rz: 0.018 * S, pitch: Math.PI * 0.5, capLift: 0.007 * S },
    ],
    { radialSegs: 10, tile: TILES.PANTS_CARGO, tag: 'snout' }
  );

  // 4. Articulated Lower Jaw & Chin Beard Tuft (bound to `jaw` bone + `roar` morph)
  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 1.512 * S, cz: 0.08 * S, rx: 0.082 * S, rz: 0.052 * S, pitch: Math.PI * 0.52 },
        { cx: 0, cy: 1.498 * S, cz: 0.152 * S, rx: 0.068 * S, rz: 0.045 * S, pitch: Math.PI * 0.52 },
        { cx: 0, cy: 1.488 * S, cz: 0.214 * S, rx: 0.050 * S, rz: 0.038 * S, pitch: Math.PI * 0.5, capLift: 0.015 * S },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_DETAIL, tile: snoutTile, splitTilePositiveX: splitFur, tag: 'jaw' }
  );

  // 5. Twin Oversized Blade-Profile Curved Ivory Sabertooth Fangs!
  for (const sign of [-1, 1]) {
    const fScale = spec.id === 'boryn' || spec.id === 'borax' ? 1.18 : 1.06;
    acc.addSplineTube(
      [
        [sign * 0.058 * S, 1.555 * S, 0.195 * S],
        [sign * 0.062 * S, 1.500 * S, 0.218 * S],
        [sign * 0.060 * S, 1.440 * S, 0.220 * S],
        [sign * 0.052 * S, 1.384 * S, 0.204 * S],
      ],
      (t) => (1 - Math.pow(t, 1.38) * 0.88) * 0.025 * fScale * S,
      {
        tubularSegs: isMaster ? 10 : 6,
        radialSegs: isMaster ? 10 : 7,
        tile: TILES.IVORY_FANG,
        tag: 'fang',
        flattenY: 0.62,
      }
    );
  }

  // 6. Larger Fierce Almond Predator Eyes + Sculpted Eyeliner Socket & Angled Brow Ridge
  for (const [sign, eyeTile, lidTag] of [
    [1, TILES.EYE_LEFT, 'eyelid_L'],   // +X (viewer-right)
    [-1, TILES.EYE_RIGHT, 'eyelid_R'], // -X (viewer-left)
  ]) {
    const ex = sign * 0.068 * S;
    const ey = 1.628 * S;
    const ez = 0.179 * S;
    // Dark feline eyeliner socket rim
    acc.addLoft(
      [
        { cx: ex, cy: ey, cz: ez - 0.010 * S, rx: 0.038 * S, rz: 0.025 * S, pitch: Math.PI * 0.5, yaw: sign * 0.24, roll: -sign * 0.16 },
        { cx: ex, cy: ey, cz: ez + 0.008 * S, rx: 0.036 * S, rz: 0.024 * S, pitch: Math.PI * 0.5, yaw: sign * 0.24, roll: -sign * 0.16 },
      ],
      { radialSegs: 12, tile: TILES.PANTS_CARGO, tag: 'eye' }
    );
    // Glowing convex almond predator cornea & slit pupil
    acc.addLoft(
      [
        { cx: ex, cy: ey, cz: ez + 0.004 * S, rx: 0.033 * S, rz: 0.021 * S, pitch: Math.PI * 0.5, yaw: sign * 0.24, roll: -sign * 0.16 },
        { cx: ex, cy: ey, cz: ez + 0.018 * S, rx: 0.030 * S, rz: 0.019 * S, pitch: Math.PI * 0.5, yaw: sign * 0.24, roll: -sign * 0.16, capLift: 0.010 * S },
      ],
      { radialSegs: 12, tile: eyeTile, tag: 'eye' }
    );

    // Fierce Angled Sabertooth Supraorbital Brow Ridge
    acc.addLoft(
      [
        { cx: ex - sign * 0.034 * S, cy: ey + 0.013 * S, cz: ez + 0.014 * S, rx: 0.015 * S, rz: 0.017 * S, roll: -sign * 0.38 },
        { cx: ex, cy: ey + 0.024 * S, cz: ez + 0.020 * S, rx: 0.018 * S, rz: 0.021 * S },
        { cx: ex + sign * 0.038 * S, cy: ey + 0.032 * S, cz: ez + 0.008 * S, rx: 0.016 * S, rz: 0.017 * S, roll: sign * 0.38 },
      ],
      { radialSegs: 8, tile: sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY, tag: lidTag }
    );
  }

  // 7. Broad Cupped Feline Sabertooth Ears + Lynx Tuft Tips (+ Twin Horn-Crests for Kai & Kai-Jax)
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    const earTile = sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY;
    acc.addSplineTube(
      [
        [sign * 0.112 * S, 1.70 * S, 0.005 * S],
        [sign * 0.172 * S, 1.785 * S, -0.018 * S],
        [sign * 0.218 * S, 1.868 * S, -0.042 * S],
      ],
      (t) => (1 - Math.pow(t, 1.15) * 0.88) * 0.062 * S,
      { tubularSegs: isMaster ? 8 : 5, radialSegs: isMaster ? 10 : 6, tile: earTile, tag: `ear_${suf}`, flattenY: 0.46 }
    );

    if (spec.hasHorns) {
      acc.addSplineTube(
        [
          [sign * 0.056 * S, 1.705 * S, 0.072 * S],
          [sign * 0.084 * S, 1.792 * S, 0.052 * S],
          [sign * 0.106 * S, 1.872 * S, 0.012 * S],
        ],
        (t) => (1 - t * 0.88) * 0.022 * S,
        { tubularSegs: 7, radialSegs: 8, tile: TILES.SPIDER_CHITIN, tag: 'head' }
      );
    }
  }

  // Borax Voluminous Multi-Layered Silver-White Sabertooth Lion Mane (frames crown, temples & shoulders!)
  if (spec.hasLionMane) {
    const outerCount = isMaster ? 16 : 10;
    for (let m = 0; m < outerCount; m++) {
      const ang = -Math.PI * 0.82 + (m / (outerCount - 1)) * Math.PI * 1.64;
      if (Math.abs(ang) < 0.36) continue; // Keep face & fangs clear in front
      const sx = Math.sin(ang);
      const cz = Math.cos(ang);
      acc.addSplineTube(
        [
          [sx * 0.13 * S, 1.71 * S, cz * 0.10 * S],
          [sx * 0.28 * S, 1.66 * S, cz * 0.22 * S - 0.04 * S],
          [sx * 0.33 * S, 1.48 * S, cz * 0.26 * S - 0.10 * S],
          [sx * 0.28 * S, 1.28 * S, cz * 0.24 * S - 0.14 * S],
        ],
        (t) => Math.sin(Math.min(0.96, t * 0.84 + 0.16) * Math.PI) * 0.088 * S,
        { tubularSegs: isMaster ? 9 : 5, radialSegs: isMaster ? 9 : 6, tile: TILES.FUR_SECONDARY, tag: 'mane_lion' }
      );
    }
    // Crown lion-mane crest sweeping up over forehead!
    for (let c = -2; c <= 2; c++) {
      const u = c * 0.065;
      acc.addSplineTube(
        [
          [u * S, 1.74 * S, 0.05 * S],
          [u * 1.4 * S, 1.88 * S, -0.04 * S],
          [u * 1.7 * S, 1.80 * S, -0.22 * S],
        ],
        (t) => Math.sin(Math.min(0.95, t * 0.82 + 0.18) * Math.PI) * 0.072 * S,
        { tubularSegs: isMaster ? 7 : 4, radialSegs: isMaster ? 8 : 5, tile: TILES.FUR_SECONDARY, tag: 'mane_lion' }
      );
    }
  }

  // 8. Signature Outerwear / Armor Sculptures (Authentic to Character Visual Library!)
  if (spec.garmentStyle === 'techwear_kai' || spec.garmentStyle === 'techwear_jax' || spec.garmentStyle === 'fusion_coat') {
    const isFusion = spec.garmentStyle === 'fusion_coat';
    const coatBottomY = isFusion ? 0.56 * S : 0.85 * S;
    acc.addLoft(
      subdivideRings(
        [
          {
            cx: 0,
            cy: coatBottomY,
            cz: -0.01 * S,
            rx: (isFusion ? 0.285 : 0.212) * B * S,
            rz: (isFusion ? 0.22 : 0.162) * B * S,
            lobe: (th) => 1 + Math.sin(th * 5) * 0.035,
          },
          { cx: 0, cy: 0.98 * S, cz: 0, rx: 0.192 * B * S, rz: 0.150 * B * S },
          { cx: 0, cy: 1.20 * S, cz: 0.006 * S, rx: 0.212 * B * S, rz: 0.162 * B * S },
          {
            cx: 0,
            cy: 1.41 * S,
            cz: 0.012 * S,
            rx: 0.232 * B * S,
            rz: 0.172 * B * S,
            tileOverride: spec.id === 'kai' ? TILES.JACKET_ACCENT : TILES.JACKET_MAIN,
          },
        ],
        SUB_RINGS
      ),
      {
        radialSegs: R_BODY,
        tile: TILES.JACKET_MAIN,
        thetaStart: 0.48,
        thetaLength: Math.PI * 2 - 0.96,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.016 * S,
        liningTile: isFusion ? TILES.JACKET_ACCENT : TILES.JACKET_ACCENT,
        tag: 'jacket',
      }
    );

    // Sculpted Streetwear Hood / High Flared Fusion Battle-Collar
    acc.addLoft(
      [
        { cx: 0, cy: 1.39 * S, cz: -0.015 * S, rx: 0.195 * B * S, rz: 0.162 * B * S },
        { cx: 0, cy: 1.53 * S, cz: -0.045 * S, rx: 0.222 * B * S, rz: 0.185 * B * S },
        { cx: 0, cy: isFusion ? 1.70 * S : 1.59 * S, cz: -0.075 * S, rx: (isFusion ? 0.21 : 0.185) * B * S, rz: 0.155 * B * S },
      ],
      {
        radialSegs: R_DETAIL,
        tile: TILES.JACKET_ACCENT,
        thetaStart: Math.PI * 0.36,
        thetaLength: Math.PI * 1.28,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.015 * S,
        liningTile: isFusion ? TILES.ARMOR_GOLD : TILES.INNER_SHIRT,
        tag: 'collar',
      }
    );

    // Kai-Jax X-Crossed Gold/Obsidian Fusion Chest Harness Straps
    if (isFusion) {
      for (const sign of [-1, 1]) {
        acc.addSplineTube(
          [
            [sign * 0.15 * B * S, 1.40 * S, 0.11 * B * S],
            [0, 1.18 * S, 0.155 * B * S],
            [-sign * 0.13 * B * S, 0.97 * S, 0.13 * B * S],
          ],
          () => 0.018 * S,
          { tubularSegs: 6, radialSegs: 6, tile: TILES.ARMOR_GOLD, tag: 'torso', flattenY: 0.45 }
        );
      }
    }
  } else if (spec.garmentStyle === 'shield_harness') {
    // Boryn's Tactical Leather & Iron Harness + Dark Furred Neck Mantle + Diagonal Studded Baldric
    acc.addLoft(
      [
        { cx: 0, cy: 1.16 * S, cz: 0.01 * S, rx: 0.196 * B * S, rz: 0.152 * B * S },
        { cx: 0, cy: 1.42 * S, cz: 0.01 * S, rx: 0.222 * B * S, rz: 0.168 * B * S },
      ],
      {
        radialSegs: R_BODY,
        tile: TILES.JACKET_MAIN,
        thetaStart: 0.48,
        thetaLength: Math.PI * 2 - 0.96,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.017 * S,
        tag: 'jacket',
      }
    );
    // Furred dark mantle hood around Boryn's neck
    acc.addLoft(
      [
        { cx: 0, cy: 1.40 * S, cz: -0.02 * S, rx: 0.21 * B * S, rz: 0.17 * B * S },
        { cx: 0, cy: 1.54 * S, cz: -0.05 * S, rx: 0.22 * B * S, rz: 0.18 * B * S },
      ],
      {
        radialSegs: R_DETAIL,
        tile: TILES.JACKET_MAIN,
        thetaStart: Math.PI * 0.35,
        thetaLength: Math.PI * 1.30,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.02 * S,
        tag: 'collar',
      }
    );
    // Diagonal Cross-Chest Studded Leather Strap across Boryn's bare tiger chest!
    acc.addSplineTube(
      [
        [0.18 * B * S, 1.42 * S, 0.11 * B * S],
        [0.02 * B * S, 1.21 * S, 0.165 * B * S],
        [-0.15 * B * S, 0.98 * S, 0.135 * B * S],
      ],
      () => 0.026 * S,
      { tubularSegs: 7, radialSegs: 6, tile: TILES.ARMOR_GOLD, tag: 'torso', flattenY: 0.42 }
    );
  } else if (spec.garmentStyle === 'storm_ronin') {
    // Borax's Layered Navy-Indigo & Gold Brocade Storm Ronin Haori Robe
    acc.addLoft(
      subdivideRings(
        [
          { cx: 0, cy: 0.34 * S, cz: -0.02 * S, rx: 0.30 * B * S, rz: 0.235 * B * S },
          { cx: 0, cy: 0.72 * S, cz: -0.01 * S, rx: 0.238 * B * S, rz: 0.185 * B * S },
          { cx: 0, cy: 0.98 * S, cz: 0, rx: 0.202 * B * S, rz: 0.160 * B * S },
          { cx: 0, cy: 1.39 * S, cz: 0.01 * S, rx: 0.238 * B * S, rz: 0.178 * B * S },
        ],
        SUB_RINGS
      ),
      {
        radialSegs: R_BODY,
        tile: TILES.JACKET_MAIN,
        thetaStart: 0.28,
        thetaLength: Math.PI * 2 - 0.56,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.016 * S,
        liningTile: TILES.ARMOR_GOLD,
        tag: 'jacket',
      }
    );
  }

  // Sculpted Deltoid Shoulder Caps / Tiered Samurai Sode Pauldrons
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    if (spec.id === 'borax' || spec.id === 'kaijax' || spec.id === 'boryn') {
      const tiers = spec.id === 'borax' ? 2 : 1;
      for (let t = 0; t < tiers; t++) {
        const yDrop = t * 0.075 * S;
        acc.addLoft(
          [
            { cx: sign * (shX + 0.028 * S), cy: 1.36 * S - yDrop, cz: 0, rx: 0.112 * S, rz: 0.112 * S, roll: -sign * 0.42 },
            { cx: sign * (shX - 0.018 * S), cy: 1.45 * S - yDrop * 0.7, cz: 0, rx: 0.090 * S, rz: 0.092 * S, roll: -sign * 0.32, capLift: 0.016 * S },
          ],
          { radialSegs: R_DETAIL, tile: TILES.ARMOR_GOLD, tag: `arm_${suf}` }
        );
      }
    } else {
      // Smooth rounded techwear shoulder cap (Kai purple shoulder yoke, Jax dark storm shoulder)
      const capTile = spec.id === 'kai' ? TILES.JACKET_ACCENT : TILES.JACKET_MAIN;
      acc.addLoft(
        [
          { cx: sign * shX, cy: 1.34 * S, cz: 0, rx: 0.092 * B * S, rz: 0.092 * B * S, roll: -sign * 0.25 },
          { cx: sign * (shX - 0.03 * S), cy: 1.43 * S, cz: 0, rx: 0.078 * B * S, rz: 0.080 * B * S, roll: -sign * 0.25, capLift: 0.018 * S },
        ],
        { radialSegs: R_DETAIL, tile: capTile, tag: `arm_${suf}` }
      );
    }
  }

  // Front Waist Sash / Inscribed Tabard / Calligraphy Scroll
  if (spec.id !== 'kai') {
    const sashTile = spec.id === 'borax' ? TILES.INNER_SHIRT : TILES.SASH_TABARD;
    const sashW = spec.id === 'jax' ? 0.068 : 0.088;
    const sashX = spec.id === 'jax' ? 0.105 * S : spec.id === 'borax' ? -0.075 * S : 0;
    acc.addLoft(
      [
        { cx: sashX * 1.15, cy: spec.id === 'borax' ? 0.40 * S : 0.46 * S, cz: 0.162 * B * S, rx: sashW * S, rz: 0.013 * S },
        { cx: sashX, cy: 0.70 * S, cz: 0.158 * B * S, rx: (sashW + 0.01) * S, rz: 0.013 * S },
        { cx: sashX * 0.7, cy: 0.94 * S, cz: 0.145 * B * S, rx: sashW * S, rz: 0.015 * S },
      ],
      { radialSegs: 10, tile: sashTile, tag: 'sash' }
    );
  }

  // 9. Arms (Baggy Techwear Sleeves / Bare Striped Tiger Muscle / Forearm Bracers) + 4-Clawed Sabertooth Hands
  const armTile = spec.id === 'boryn' ? TILES.FUR_PRIMARY : TILES.JACKET_MAIN;
  const sleeveBulk = spec.id === 'borax' ? 1.36 : spec.id === 'boryn' ? 1.14 : 1.08;
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    const uArm = byName.get(`upper_arm_${suf}`).worldPos;
    const fArm = byName.get(`forearm_${suf}`).worldPos;
    const hPos = byName.get(`hand_${suf}`).worldPos;

    acc.addLoft(
      subdivideRings(
        [
          {
            cx: hPos[0],
            cy: hPos[1] + 0.03 * S,
            cz: hPos[2] - 0.01 * S,
            rx: 0.050 * B * S,
            rz: 0.050 * B * S,
            tileOverride: spec.id === 'boryn' || spec.id === 'kaijax' ? TILES.ARMOR_GOLD : TILES.JACKET_ACCENT,
          },
          {
            cx: (fArm[0] + hPos[0]) * 0.5,
            cy: (fArm[1] + hPos[1]) * 0.5,
            cz: (fArm[2] + hPos[2]) * 0.5,
            rx: 0.068 * B * sleeveBulk * S,
            rz: 0.068 * B * sleeveBulk * S,
            tileOverride: spec.id === 'boryn' ? TILES.JACKET_ACCENT : armTile,
          },
          { cx: fArm[0], cy: fArm[1], cz: fArm[2], rx: 0.066 * B * sleeveBulk * S, rz: 0.066 * B * sleeveBulk * S },
          { cx: (uArm[0] + fArm[0]) * 0.5, cy: (uArm[1] + fArm[1]) * 0.5, cz: uArm[2], rx: 0.078 * B * S, rz: 0.078 * B * S },
          { cx: uArm[0] - sign * 0.015 * S, cy: uArm[1] + 0.035 * S, cz: uArm[2], rx: 0.084 * B * S, rz: 0.082 * B * S, capLift: 0.022 * S },
        ],
        SUB_RINGS
      ),
      { radialSegs: R_LIMB, tile: armTile, tag: `arm_${suf}` }
    );

    // Sculpted Beast Paw-Hand + 4 Curved Razor Claws
    const handTile = sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY;
    acc.addLoft(
      [
        { cx: hPos[0], cy: hPos[1] - 0.07 * S, cz: hPos[2] + 0.02 * S, rx: 0.047 * B * S, rz: 0.036 * B * S, capDrop: 0.012 * S },
        { cx: hPos[0], cy: hPos[1], cz: hPos[2], rx: 0.054 * B * S, rz: 0.040 * B * S },
        { cx: hPos[0], cy: hPos[1] + 0.04 * S, cz: hPos[2] - 0.01 * S, rx: 0.048 * B * S, rz: 0.044 * B * S },
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

  // 10. Tactical Cargo Trousers + Armored Greaves (Kai-Jax) + Chunky Clawed Sneakers / Combat Boots (Grounded at y = 0.0!)
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    const thPos = byName.get(`thigh_${suf}`).worldPos;
    const shPos = byName.get(`shin_${suf}`).worldPos;
    const ftPos = byName.get(`foot_${suf}`).worldPos;

    acc.addLoft(
      subdivideRings(
        [
          { cx: ftPos[0], cy: 0.20 * S, cz: ftPos[2], rx: 0.074 * B * S, rz: 0.076 * B * S },
          {
            cx: shPos[0],
            cy: 0.37 * S,
            cz: shPos[2],
            rx: 0.104 * B * S,
            rz: 0.102 * B * S,
            lobe: (th) => 1 + Math.max(0, sign * Math.sin(th)) * 0.18 + Math.sin(th * 3) * 0.04,
          },
          { cx: shPos[0], cy: shPos[1] + 0.02 * S, cz: shPos[2], rx: 0.096 * B * S, rz: 0.098 * B * S },
          { cx: (thPos[0] + shPos[0]) * 0.5, cy: 0.71 * S, cz: 0.01 * S, rx: 0.118 * B * S, rz: 0.118 * B * S },
          { cx: thPos[0] * 0.92, cy: thPos[1] + 0.05 * S, cz: 0, rx: 0.124 * B * S, rz: 0.122 * B * S, capLift: 0.02 * S },
        ],
        SUB_RINGS
      ),
      { radialSegs: R_LIMB, tile: TILES.PANTS_CARGO, tag: `leg_${suf}` }
    );

    // Kai-Jax Armored Gold-and-Obsidian Knee/Shin Greaves!
    if (spec.id === 'kaijax') {
      acc.addLoft(
        [
          { cx: shPos[0], cy: 0.28 * S, cz: shPos[2] + 0.055 * S, rx: 0.058 * B * S, rz: 0.048 * B * S },
          { cx: shPos[0], cy: 0.49 * S, cz: shPos[2] + 0.075 * S, rx: 0.074 * B * S, rz: 0.058 * B * S },
          { cx: shPos[0], cy: 0.58 * S, cz: shPos[2] + 0.062 * S, rx: 0.052 * B * S, rz: 0.042 * B * S, capLift: 0.018 * S },
        ],
        { radialSegs: 8, tile: TILES.ARMOR_GOLD, tag: `leg_${suf}` }
      );
    }

    // Chunky Clawed High-Top Sneaker / Combat Boot (strictly grounded at y = 0.0!)
    acc.addLoft(
      [
        { cx: ftPos[0], cy: 0.004, cz: ftPos[2] + 0.055 * S, rx: 0.082 * B * S, rz: 0.152 * S, capDrop: 0.003 },
        { cx: ftPos[0], cy: 0.050 * S, cz: ftPos[2] + 0.052 * S, rx: 0.080 * B * S, rz: 0.148 * S },
        { cx: ftPos[0], cy: 0.120 * S, cz: ftPos[2] + 0.022 * S, rx: 0.072 * B * S, rz: 0.102 * S },
        { cx: ftPos[0], cy: 0.220 * S, cz: ftPos[2] + 0.004 * S, rx: 0.070 * B * S, rz: 0.076 * S, capLift: 0.012 * S },
      ],
      { radialSegs: R_DETAIL, tile: TILES.SNEAKER_BODY, tag: `foot_${suf}` }
    );

    // 3 Protruding Toe-Box Saber Claws on each sneaker/boot!
    for (let c = -1; c <= 1; c++) {
      const cxOff = c * 0.027 * S;
      acc.addSplineTube(
        [
          [ftPos[0] + cxOff, 0.038 * S, ftPos[2] + 0.188 * S],
          [ftPos[0] + cxOff, 0.024 * S, ftPos[2] + 0.232 * S],
          [ftPos[0] + cxOff, 0.006 * S, ftPos[2] + 0.262 * S],
        ],
        (t) => (1 - t * 0.85) * 0.015 * S,
        { tubularSegs: 5, radialSegs: 6, tile: TILES.IVORY_FANG, tag: `toe_${suf}` }
      );
    }
  }

  // 11. Kai & Kai-Jax: 4 Articulated Dorsal Spider Limbs (12 bones) + Obsidian/Gold Carapace Joints
  if (spiderChains.length > 0) {
    acc.addLoft(
      [
        { cx: 0, cy: 1.22 * S, cz: -0.148 * S, rx: 0.115 * S, rz: 0.048 * S },
        { cx: 0, cy: 1.35 * S, cz: -0.160 * S, rx: 0.135 * S, rz: 0.058 * S },
        { cx: 0, cy: 1.45 * S, cz: -0.148 * S, rx: 0.095 * S, rz: 0.042 * S, capLift: 0.01 * S },
      ],
      { radialSegs: 12, tile: TILES.ARMOR_GOLD, tag: 'torso' }
    );

    for (const sc of spiderChains) {
      acc.addSplineTube(
        sc.points,
        (t) => {
          const jointBump =
            Math.exp(-Math.pow((t - 0.33) * 15, 2)) * 0.018 +
            Math.exp(-Math.pow((t - 0.66) * 15, 2)) * 0.015;
          return ((1 - Math.pow(t, 1.35) * 0.88) * 0.038 + jointBump) * S;
        },
        {
          tubularSegs: isMaster ? 22 : 12,
          radialSegs: isMaster ? 11 : 7,
          tile: TILES.SPIDER_CHITIN,
          tag: sc.prefix,
        }
      );
    }
  }

  // 12. Jax & Kai-Jax: Multi-Layered Roaring Electric-Blue Storm Mane (7 primary bone crests + 6 lower volume plumes!)
  for (const mc of maneChains) {
    acc.addSplineTube(
      mc.points,
      (t) => Math.sin(Math.min(0.98, t * 0.84 + 0.16) * Math.PI) * 0.094 * S,
      {
        tubularSegs: isMaster ? 13 : 8,
        radialSegs: isMaster ? 10 : 6,
        tile: TILES.STORM_MANE,
        tag: mc.name,
        flattenY: 0.68,
      }
    );
  }
  if (maneChains.length === 7) {
    // Secondary shoulder-framing storm-flame plumes bound to outer mane bones for unmistakable front silhouette!
    for (let k = 0; k < 6; k++) {
      const side = k < 3 ? -1 : 1;
      const rowIdx = k % 3;
      const boneTag = side < 0 ? `mane_0${rowIdx + 1}` : `mane_0${7 - rowIdx}`;
      const yBase = (1.58 - rowIdx * 0.08) * S;
      acc.addSplineTube(
        [
          [side * 0.15 * S, yBase, -0.06 * S],
          [side * (0.34 + rowIdx * 0.05) * S, yBase + 0.14 * S, -0.20 * S],
          [side * (0.48 + rowIdx * 0.06) * S, yBase + 0.24 * S, -0.38 * S],
        ],
        (t) => Math.sin(Math.min(0.98, t * 0.82 + 0.18) * Math.PI) * 0.082 * S,
        {
          tubularSegs: isMaster ? 9 : 6,
          radialSegs: isMaster ? 8 : 5,
          tile: TILES.STORM_MANE,
          tag: boneTag,
          flattenY: 0.62,
        }
      );
    }
  }

  // 13. Physical Tails (STRICTLY 3 for Kai-Jax: Ember, Storm, Memory; 1 for Boryn & Borax)
  for (const tc of tailChains) {
    const isKaiJaxTail = spec.id === 'kaijax';
    acc.addSplineTube(
      tc.pts,
      (t) => {
        const plume = isKaiJaxTail
          ? Math.sin(Math.min(0.98, t * 0.80 + 0.18) * Math.PI) * 0.106
          : (1 - t * 0.50) * 0.060;
        return Math.max(0.014, plume) * S;
      },
      {
        tubularSegs: isMaster ? 22 : 12,
        radialSegs: isMaster ? 13 : 8,
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

  const boneSegments = bones.map((b) => {
    const children = bones.filter(
      (c) =>
        c.parentIndex === b.index &&
        !c.name.startsWith('spider_') &&
        !c.name.startsWith('mane_') &&
        !c.name.startsWith('tail')
    );
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
    } else if (
      tag === 'head' ||
      tag === 'snout' ||
      tag === 'fang' ||
      tag === 'eye' ||
      tag.startsWith('eyelid_') ||
      tag === 'mane_lion'
    ) {
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
        [mIdx, Math.max(0.18, t)],
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
      const posF = t * 3.0;
      const s0 = Math.min(3, Math.floor(posF));
      const s1 = Math.min(3, s0 + 1);
      const frac = posF - s0;
      const b0 = idxOf(`${tag}_0${s0 + 1}`);
      const b1 = idxOf(`${tag}_0${s1 + 1}`);
      candidates = b0 === b1 ? [[b0, 1.0]] : [[b0, 1 - frac], [b1, frac]];
    } else {
      let allowedNames = null;
      if (tag === 'arm_L') allowedNames = ['chest', 'clavicle_L', 'upper_arm_L', 'forearm_L', 'hand_L'];
      else if (tag === 'arm_R') allowedNames = ['chest', 'clavicle_R', 'upper_arm_R', 'forearm_R', 'hand_R'];
      else if (tag === 'hand_L') allowedNames = ['hand_L', 'forearm_L'];
      else if (tag === 'hand_R') allowedNames = ['hand_R', 'forearm_R'];
      else if (tag === 'leg_L') allowedNames = ['pelvis', 'thigh_L', 'shin_L', 'foot_L'];
      else if (tag === 'leg_R') allowedNames = ['pelvis', 'thigh_R', 'shin_R', 'foot_R'];
      else if (tag === 'foot_L' || tag === 'toe_L') allowedNames = ['foot_L', 'toe_L', 'shin_L'];
      else if (tag === 'foot_R' || tag === 'toe_R') allowedNames = ['foot_R', 'toe_R', 'shin_R'];
      else if (tag === 'pelvis_hip' || tag === 'sash' || tag === 'belt')
        allowedNames = ['pelvis', 'spine_01', 'thigh_L', 'thigh_R'];
      else allowedNames = ['pelvis', 'spine_01', 'spine_02', 'chest', 'clavicle_L', 'clavicle_R', 'neck', 'thigh_L', 'thigh_R'];

      const pool = boneSegments.filter((bs) => allowedNames.includes(bs.name));
      const scored = pool.map((bs) => {
        const dSq = distToSegSq(p, bs.a, bs.b);
        return [bs.index, 1 / Math.pow(dSq + 0.0024, 1.65)];
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
      deltas.blink[o + 1] = -0.028 * S;
      deltas.blink[o + 2] = 0.009 * S;
      deltas.pain[o + 1] = -0.022 * S;
      deltas.pain[o + 2] = 0.007 * S;
      deltas.focus[o] = -signX * 0.007 * S;
      deltas.focus[o + 1] = -0.013 * S;
      deltas.snarl[o] = -signX * 0.009 * S;
      deltas.snarl[o + 1] = -0.010 * S;
    } else if (tag === 'snout') {
      const frontAmt = Math.max(0, vFrac);
      deltas.snarl[o] = signX * 0.012 * S * frontAmt;
      deltas.snarl[o + 1] = 0.020 * S * frontAmt;
      deltas.snarl[o + 2] = -0.006 * S * frontAmt;

      deltas.roar[o] = signX * 0.015 * S * frontAmt;
      deltas.roar[o + 1] = 0.024 * S * frontAmt;

      deltas.pain[o + 1] = 0.010 * S * frontAmt;
      deltas.focus[o + 1] = 0.005 * S * frontAmt;
    } else if (tag === 'fang') {
      deltas.snarl[o + 1] = 0.006 * S;
      deltas.roar[o + 1] = 0.010 * S;
    } else if (tag === 'jaw') {
      const tipAmt = 0.35 + vFrac * 0.65;
      deltas.roar[o + 1] = -0.062 * S * tipAmt;
      deltas.roar[o + 2] = -0.024 * S * tipAmt;
      deltas.snarl[o + 1] = -0.020 * S * tipAmt;
      deltas.pain[o + 1] = -0.026 * S * tipAmt;
      deltas.pain[o] = 0.008 * S * tipAmt;
    } else if (tag === 'ear_L' || tag === 'ear_R') {
      const earTip = vFrac;
      deltas.pain[o + 1] = -0.030 * S * earTip;
      deltas.pain[o + 2] = -0.038 * S * earTip;
      deltas.roar[o + 2] = -0.034 * S * earTip;
      deltas.focus[o + 1] = 0.018 * S * earTip;
      deltas.focus[o + 2] = 0.015 * S * earTip;
      deltas.blink[o + 2] = -0.004 * S * earTip;
    }
  }

  return deltas;
}

/**
 * Generates all 19 required skeletal animation clips with grounded foot-plant phases,
 * punchy anticipation/impact/recovery curves, and secondary supernatural appendage motion.
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
          ? 0.96
          : clipName === 'run'
            ? 0.68
            : clipName === 'sprint'
              ? 0.50
              : clipName === 'attack_1' || clipName === 'attack_2'
                ? 0.36
                : clipName === 'attack_3' || clipName === 'heavy_strike'
                  ? 0.50
                  : clipName === 'roar' || clipName === 'ability_cast'
                    ? 0.78
                    : clipName === 'victory'
                      ? 2.0
                      : clipName === 'defeat'
                        ? 1.1
                        : 0.44;

    const sampleCount = 11;
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

    if (clipName === 'idle' || clipName === 'breathing') {
      const amp = clipName === 'breathing' ? 1.25 : 1.0;
      addPelvisPosTrack((_, w) => [0, Math.sin(w) * 0.016 * amp - 0.01, 0]);
      addRotTrack('spine_01', (_, w) => [0.05 + Math.sin(w) * 0.022 * amp, Math.sin(w * 0.5) * 0.03, 0]);
      addRotTrack('chest', (_, w) => [-0.03 + Math.cos(w) * 0.028 * amp, -0.04, 0]);
      addRotTrack('head', (_, w) => [Math.sin(w) * 0.028, 0.04 + Math.sin(w) * 0.05, 0]);
      addRotTrack('upper_arm_L', (_, w) => [0.14 + Math.sin(w) * 0.04, 0.06, 0.16]);
      addRotTrack('upper_arm_R', (_, w) => [0.10 - Math.sin(w) * 0.04, -0.06, -0.16]);
      addRotTrack('forearm_L', () => [-0.42, 0, 0]);
      addRotTrack('forearm_R', () => [-0.46, 0, 0]);
      addRotTrack('thigh_L', () => [-0.08, 0.06, 0.03]);
      addRotTrack('thigh_R', () => [0.05, -0.06, -0.03]);
      addRotTrack('shin_L', () => [0.12, 0, 0]);
      addRotTrack('shin_R', () => [0.07, 0, 0]);
    } else if (clipName === 'walk' || clipName === 'run' || clipName === 'sprint') {
      const stride = clipName === 'walk' ? 0.56 : clipName === 'run' ? 0.94 : 1.22;
      const lean = clipName === 'walk' ? 0.09 : clipName === 'run' ? 0.26 : 0.42;
      const bounce = clipName === 'walk' ? 0.026 : clipName === 'run' ? 0.052 : 0.072;
      const hipSway = clipName === 'walk' ? 0.045 : 0.075;

      // Double-frequency vertical contact dip + lateral weight transfer over planted stance leg
      addPelvisPosTrack((_, w) => [
        Math.sin(w) * 0.018,
        -Math.cos(w * 2) * bounce - bounce * 0.45,
        0,
      ]);
      addRotTrack('pelvis', (_, w) => [0, -Math.sin(w) * hipSway, Math.cos(w) * 0.035]);
      addRotTrack('spine_01', (_, w) => [lean * 0.55, Math.sin(w) * 0.14, 0]);
      addRotTrack('chest', (_, w) => [lean * 0.55, -Math.sin(w) * 0.18, 0]);
      addRotTrack('head', (_, w) => [-lean * 0.72, Math.sin(w) * 0.04, 0]);

      // Asymmetric stance/swing knee & ankle articulation for crisp foot planting
      const legHip = (w) => -Math.sin(w) * stride - Math.sin(w * 2) * 0.06;
      const legKnee = (w) => {
        const swingLift = Math.max(0, Math.cos(w));
        const contactCushion = Math.max(0, -Math.sin(w)) * 0.16;
        return 0.08 + Math.pow(swingLift, 1.35) * stride * 1.05 + contactCushion;
      };
      const legFoot = (w) => {
        const pushOff = Math.max(0, -Math.cos(w)) * 0.34;
        const heelStrike = Math.max(0, Math.sin(w)) * 0.22;
        return pushOff - heelStrike;
      };

      addRotTrack('thigh_L', (_, w) => [legHip(w), 0, 0]);
      addRotTrack('thigh_R', (_, w) => [legHip(w + Math.PI), 0, 0]);
      addRotTrack('shin_L', (_, w) => [legKnee(w), 0, 0]);
      addRotTrack('shin_R', (_, w) => [legKnee(w + Math.PI), 0, 0]);
      addRotTrack('foot_L', (_, w) => [legFoot(w), 0, 0]);
      addRotTrack('foot_R', (_, w) => [legFoot(w + Math.PI), 0, 0]);

      const elbowBend = clipName === 'walk' ? -0.48 : clipName === 'run' ? -0.82 : -1.02;
      addRotTrack('upper_arm_L', (_, w) => [Math.sin(w) * stride * 0.82, 0, 0.15]);
      addRotTrack('upper_arm_R', (_, w) => [-Math.sin(w) * stride * 0.82, 0, -0.15]);
      addRotTrack('forearm_L', (_, w) => [elbowBend - Math.max(0, -Math.sin(w)) * 0.22, 0, 0]);
      addRotTrack('forearm_R', (_, w) => [elbowBend - Math.max(0, Math.sin(w)) * 0.22, 0, 0]);
    } else if (clipName === 'jump' || clipName === 'fall') {
      const up = clipName === 'jump' ? 1 : -0.5;
      addPelvisPosTrack((p) => [0, 0.06 * Math.sin(p * Math.PI), 0]);
      addRotTrack('spine_01', () => [0.18 * up, 0, 0]);
      addRotTrack('thigh_L', (_, w) => [-0.62 + Math.sin(w) * 0.08, 0, 0.08]);
      addRotTrack('thigh_R', (_, w) => [-0.26 - Math.sin(w) * 0.08, 0, -0.08]);
      addRotTrack('shin_L', () => [0.86, 0, 0]);
      addRotTrack('shin_R', () => [0.46, 0, 0]);
      addRotTrack('upper_arm_L', (_, w) => [-0.52 + Math.sin(w) * 0.1, 0, 0.44]);
      addRotTrack('upper_arm_R', (_, w) => [-0.52 - Math.sin(w) * 0.1, 0, -0.44]);
      addRotTrack('forearm_L', () => [-0.58, 0, 0]);
      addRotTrack('forearm_R', () => [-0.58, 0, 0]);
    } else if (clipName === 'landing') {
      const squash = (p) => Math.sin(Math.pow(p, 0.65) * Math.PI);
      addPelvisPosTrack((p) => [0, -squash(p) * 0.20, 0.04 * squash(p)]);
      addRotTrack('spine_01', (p) => [squash(p) * 0.40, 0, 0]);
      addRotTrack('head', (p) => [-squash(p) * 0.24, 0, 0]);
      addRotTrack('thigh_L', (p) => [-squash(p) * 0.68, 0, 0.10]);
      addRotTrack('thigh_R', (p) => [-squash(p) * 0.68, 0, -0.10]);
      addRotTrack('shin_L', (p) => [squash(p) * 0.92, 0, 0]);
      addRotTrack('shin_R', (p) => [squash(p) * 0.92, 0, 0]);
      addRotTrack('upper_arm_L', (p) => [squash(p) * 0.52, 0, 0.36]);
      addRotTrack('upper_arm_R', (p) => [squash(p) * 0.52, 0, -0.36]);
    } else if (clipName === 'dodge') {
      addPelvisPosTrack((p) => [0, -Math.sin(p * Math.PI) * 0.24, Math.sin(p * Math.PI) * 0.16]);
      addRotTrack('spine_01', (p) => [Math.sin(p * Math.PI) * 0.62, Math.sin(p * Math.PI * 2) * 0.38, 0]);
      addRotTrack('head', (p) => [-Math.sin(p * Math.PI) * 0.32, 0, 0]);
      addRotTrack('thigh_L', (p) => [-Math.sin(p * Math.PI) * 0.70, 0, 0.12]);
      addRotTrack('thigh_R', (p) => [Math.sin(p * Math.PI) * 0.38, 0, -0.12]);
      addRotTrack('shin_L', (p) => [Math.sin(p * Math.PI) * 0.78, 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.58 * Math.sin(p * Math.PI), 0, 0.50]);
      addRotTrack('upper_arm_R', (p) => [0.58 * Math.sin(p * Math.PI), 0, -0.50]);
    } else if (clipName === 'attack_1' || clipName === 'attack_2' || clipName === 'attack_3' || clipName === 'heavy_strike') {
      const isLeft = clipName === 'attack_2';
      const isHeavy = clipName === 'heavy_strike' || clipName === 'attack_3';
      // Sharp anticipation -> snap impact at p=0.38 -> weighted follow-through recovery
      const snap = (p) => (p < 0.22 ? -0.35 * (p / 0.22) : Math.sin(((p - 0.22) / 0.78) * Math.PI));
      addPelvisPosTrack((p) => [
        0,
        -Math.max(0, snap(p)) * (isHeavy ? 0.16 : 0.08),
        snap(p) * (isHeavy ? 0.20 : 0.14),
      ]);
      addRotTrack('spine_01', (p) => [
        snap(p) * (isHeavy ? 0.42 : 0.26),
        (isLeft ? -1 : 1) * snap(p) * 0.64,
        0,
      ]);
      addRotTrack('chest', (p) => [0.12, (isLeft ? -1 : 1) * snap(p) * 0.48, 0]);
      addRotTrack('jaw', (p) => [Math.max(0, snap(p)) * 0.36, 0, 0]);

      if (isHeavy) {
        addRotTrack('upper_arm_R', (p) => [-2.25 + Math.pow(p, 0.72) * 3.05, -0.25, -0.22]);
        addRotTrack('upper_arm_L', (p) => [-1.95 + Math.pow(p, 0.72) * 2.65, 0.25, 0.22]);
        addRotTrack('forearm_R', (p) => [-0.82 + p * 0.62, 0, 0]);
        addRotTrack('forearm_L', (p) => [-0.82 + p * 0.62, 0, 0]);
      } else if (isLeft) {
        addRotTrack('upper_arm_L', (p) => [-1.45 + snap(p) * 1.78, -0.48 * snap(p), 0.28]);
        addRotTrack('forearm_L', (p) => [-0.88 + Math.max(0, snap(p)) * 0.68, 0, 0]);
        addRotTrack('upper_arm_R', () => [0.38, 0, -0.26]);
      } else {
        addRotTrack('upper_arm_R', (p) => [-1.45 + snap(p) * 1.78, 0.48 * snap(p), -0.28]);
        addRotTrack('forearm_R', (p) => [-0.88 + Math.max(0, snap(p)) * 0.68, 0, 0]);
        addRotTrack('upper_arm_L', () => [0.38, 0, 0.26]);
      }
      addRotTrack('thigh_L', (p) => [-0.40 * Math.max(0, snap(p)), 0, 0.1]);
      addRotTrack('thigh_R', (p) => [0.32 * Math.max(0, snap(p)), 0, -0.1]);
      addRotTrack('shin_L', (p) => [0.52 * Math.max(0, snap(p)), 0, 0]);
    } else if (clipName === 'parry') {
      const guard = (p) => Math.sin(Math.pow(p, 0.6) * Math.PI);
      addPelvisPosTrack((p) => [0, -0.11 * guard(p), -0.06 * guard(p)]);
      addRotTrack('chest', (p) => [0.12, -0.36 * guard(p), 0]);
      addRotTrack('upper_arm_L', (p) => [-1.22 * guard(p), -0.58, 0.24]);
      addRotTrack('upper_arm_R', (p) => [-1.12 * guard(p), 0.58, -0.24]);
      addRotTrack('forearm_L', () => [-1.10, 0, 0]);
      addRotTrack('forearm_R', () => [-1.10, 0, 0]);
    } else if (clipName === 'hit_reaction') {
      const jolt = (p) => Math.sin(Math.pow(p, 0.55) * Math.PI);
      addPelvisPosTrack((p) => [0, -0.06 * jolt(p), -0.16 * jolt(p)]);
      addRotTrack('spine_01', (p) => [-0.40 * jolt(p), 0.20 * jolt(p), 0]);
      addRotTrack('head', (p) => [-0.46 * jolt(p), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.38 * jolt(p), 0, 0.48]);
      addRotTrack('upper_arm_R', (p) => [0.38 * jolt(p), 0, -0.48]);
    } else if (clipName === 'roar' || clipName === 'ability_cast') {
      addPelvisPosTrack((p) => [0, -0.09 * Math.sin(p * Math.PI), 0]);
      addRotTrack('spine_01', (p) => [-0.28 * Math.sin(p * Math.PI), 0, 0]);
      addRotTrack('chest', (p) => [-0.24 * Math.sin(p * Math.PI), 0, 0]);
      addRotTrack('head', (p) => [-0.34 * Math.sin(p * Math.PI), 0, 0]);
      addRotTrack('jaw', (p) => [0.56 * Math.sin(p * Math.PI), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [-0.88 * Math.sin(p * Math.PI), 0, 0.68 * Math.sin(p * Math.PI) + 0.15]);
      addRotTrack('upper_arm_R', (p) => [-0.88 * Math.sin(p * Math.PI), 0, -0.68 * Math.sin(p * Math.PI) - 0.15]);
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

    const energyBoost =
      clipName.startsWith('attack') || clipName === 'heavy_strike' || clipName === 'roar' || clipName === 'ability_cast'
        ? 2.2
        : clipName === 'sprint' || clipName === 'run'
          ? 1.5
          : 1.0;

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

  for (let v = 0; v < vCount; v++) {
    const [px, py, pz] = acc.positions[v];
    posFloat[v * 3] = px;
    posFloat[v * 3 + 1] = py;
    posFloat[v * 3 + 2] = pz;

    // glTF 2.0 UV convention: V=0 maps directly to top scanline (py=0) of PNG image!
    uvFloat[v * 2] = acc.uvs[v][0];
    uvFloat[v * 2 + 1] = acc.uvs[v][1];
  }

  const indexArray = vCount > 65535 ? new Uint32Array(acc.indices) : new Uint16Array(acc.indices);
  const indexComponentType = vCount > 65535 ? 5125 : 5123;

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

  const posAcc = appendAccessor(posFloat, 5126, 'VEC3', vCount, 34962, true);
  const normAcc = appendAccessor(baseNormals, 5126, 'VEC3', vCount, 34962, false);
  const uvAcc = appendAccessor(uvFloat, 5126, 'VEC2', vCount, 34962, false);
  const jointsAcc = appendAccessor(joints, 5123, 'VEC4', vCount, 34962, false);
  const weightsAcc = appendAccessor(weights, 5126, 'VEC4', vCount, 34962, false);
  const idxAcc = appendAccessor(indexArray, indexComponentType, 'SCALAR', indexArray.length, 34963, false);
  const ibmAcc = appendAccessor(ibmFloat, 5126, 'MAT4', boneCount, undefined, false);

  const targets = MORPH_NAMES.map((mName) => {
    const dPos = morphDeltas[mName];
    const mPosAcc = appendAccessor(dPos, 5126, 'VEC3', vCount, 34962, true);
    return { POSITION: mPosAcc };
  });

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
      occlusionTexture: { index: 1, strength: 0.88 },
      normalTexture: { index: 2, scale: 0.92 },
      emissiveTexture: { index: 3 },
      emissiveFactor: [1, 1, 1],
    },
  ];

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
      generator: 'Kai-Jax Beast Gods Production Rig Compiler v2.5 (P1-E)',
    },
    scene: 0,
    scenes: [
      {
        name: `${spec.id}_Scene`,
        nodes: [0, jointNodeOffset],
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
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(paddedJson.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binBody.length, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4);

  return Buffer.concat([header, jsonChunkHeader, paddedJson, binChunkHeader, binBody]);
}

// ---------------------------------------------------------------------------
// 6. Execute Build Pipeline for All 5 Canon-Approved Roster Characters
// ---------------------------------------------------------------------------
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const forbidden of ['bovar_master.glb', 'bovar_lod1.glb']) {
  const fp = path.join(OUT_DIR, forbidden);
  if (fs.existsSync(fp)) fs.rmSync(fp, { force: true });
}

for (const spec of ROSTER_SPECS) {
  for (const tier of ['master', 'lod1']) {
    const pbrPngs = buildCharacterPbrTextures(spec, tier);
    const glbBuf = packGlbBinary(spec, tier, pbrPngs);
    const outPath = path.join(OUT_DIR, `${spec.id}_${tier}.glb`);
    fs.writeFileSync(outPath, glbBuf);
    console.log(`[BUILT] ${path.basename(outPath).padEnd(20)} -> ${(glbBuf.length / 1e6).toFixed(2)} MB`);
  }
}
console.log('Beast Gods P1-E Production GLB Build Complete.');
