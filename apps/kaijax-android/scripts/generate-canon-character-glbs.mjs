import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import * as THREE from 'three';

/**
 * OPERATION KAI-JAX — PROJECT BEAST GODS (P1-G CHARACTER MASTERING PIPELINE v3.0)
 * Production Sculpted, Retopologized, Seamlessly UV-Mapped, PBR-Textured, Rigged & Animated GLB Compiler.
 *
 * Strictly governed by the 18 Official Legends of Kai-Jax Visual Library sheets:
 *   - 078f6bfc.png: CHARACTER VISUAL LIBRARY (BORYN · KAI · KAI-JAX · JAX · BORAX)
 *   - 3e003001.png: FATHERS, MENTOR, AND ELDER FANG (BORYN · BORAX · VHAROK)
 *   - 16464786.png: STORM RONIN SANCTUM (Borax rear haori reference)
 *
 * P1-G Mastering Upgrades over P1-E:
 *   1. Bilateral Symmetric UV Unwrap (`uSym = acos(cos(theta)) / PI`): Eliminates the center-face/forehead/chest
 *      +Z UV seam completely while guaranteeing symmetric fur & stripe flow across both halves of the face and body.
 *   2. Planar Forward Cornea UV Projection (`planarFrontUv`): Projects glowing predator irises, vertical feline slit
 *      pupils, and crisp white specular catchlights directly forward instead of radial pole-pinching.
 *   3. Anatomically Sculpted Sabertooth Heads: Wedge-shaped feline predator cranium, defined zygomatic cheekbones,
 *      dark feline upper lip margin + canine gum sockets, curved blade-profile ivory sabertooth fangs, V-angled
 *      supraorbital brows, 4-lock swept cheek ruffs, spiky sabertooth crown locks (removed non-canon bug-horn cones),
 *      and cupped two-tone feline ears with recessed inner ear concha shells.
 *   4. Authentic Layered Streetwear & Armor Separation:
 *      - Removed non-canon horizontal purple/blue leg rings & boxy hip shelves; sculpted tapered matte-charcoal
 *        cargo trousers with 3D outer-thigh cargo pockets + flaps and hanging tactical belt straps.
 *      - Kai: Open cropped white/violet techwear hoodie-jacket with 3D turned-out lapels, gold shoulder badges,
 *        fang pendant over inner tee, pushed-up sleeves exposing white-furred forearms + violet wrist wraps,
 *        exposed furred ankles, and white/violet/amber high-top clawed sneakers.
 *      - Jax: Open matte-obsidian asymmetrical storm parka with 3D storm lapels, electric-blue sleeve lightning
 *        traces, royal-blue double waist sash, obsidian-furred clawed hands, and black/cobalt high-top sneakers.
 *   5. Articulated 4-Finger + Opposable-Thumb Hands, 3-Ring Joint Loops & Hermite Joint-Plane Skin Weighting.
 *   6. Kai's 4 Segmented Carapace/Gold Ball-Joint Spider Limbs + Memory-Web Silk Filaments & Jax's 7 Swept-Back
 *      Cobalt-Cyan Storm-Mane Flame Crests.
 *   7. Canon Locks Enforced: Kai-Jax has STRICTLY 3 primary physical tails; Bovar remains withheld (`null` GLBs).
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
  FUR_SECONDARY: [1, 0],   // Secondary fur (cream tiger muzzle, silver lion mane, pale inner ear, or Kai-Jax obsidian +X half)
  IVORY_FANG: [2, 0],      // Sabertooth tusks & razor claws
  EYE_LEFT: [3, 0],        // +X (viewer-right) glowing predator eye
  JACKET_MAIN: [0, 1],     // Primary techwear jacket / fusion coat / ronin haori
  JACKET_ACCENT: [1, 1],   // Royal purple / cobalt / leather yokes, hood, cuffs, lapels, wrist wraps
  INNER_SHIRT: [2, 1],     // Inner V-neck tee / chest fur / white calligraphy scroll sash
  EYE_RIGHT: [3, 1],       // -X (viewer-left) glowing predator eye (Ember-Gold on Kai-Jax!)
  PANTS_CARGO: [0, 2],     // Matte charcoal ripstop cargo trousers / hakama / dark feline lip & nose leather
  SNEAKER_BODY: [1, 2],    // Multi-panel clawed high-top sneakers / combat boots
  ARMOR_GOLD: [2, 2],      // Brushed gold/bronze armor plates, greaves, buckles, spider ball-joints
  SASH_TABARD: [3, 2],     // Waist sash / tactical belt straps / burnt-orange runic tabard
  SPIDER_CHITIN: [0, 3],   // Obsidian-silver dorsal spider carapace + glowing violet Memory-Web veins
  STORM_MANE: [1, 3],      // Swept-back electric cobalt-cyan storm-mane lightning hair
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

function smoothstep01(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/**
 * Synthesizes 4 high-detail PBR PNG Atlases (1024x1024 for Master, 512x512 for LOD1):
 *   - baseColorPng (SRGB)
 *   - ormPng (Linear: R=AO, G=Roughness, B=Metalness)
 *   - normalPng (Linear tangent-space normal map with directional fur strands, ripstop seams & armor bevels)
 *   - emissivePng (SRGB glowing predator irises, lightning traces, spider web runes, storm mane & 3 tails)
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
  const cFang = hexToRgb('#FAF6EE');
  const cEyeL = hexToRgb(spec.palette.eyeLeft);
  const cEyeR = hexToRgb(spec.palette.eyeRight);
  const cJacket = hexToRgb(spec.palette.jacketMain);
  const cJacketAcc = hexToRgb(spec.palette.jacketAccent);
  const cInner = hexToRgb(spec.palette.innerShirt);
  const cPants = hexToRgb(spec.palette.pants);
  const cSneaker = hexToRgb(spec.palette.sneaker);
  const cGold = hexToRgb(spec.palette.armorTrim);
  const cSash = hexToRgb(spec.palette.sash);
  const cSpider = hexToRgb('#1A1829');
  const cSpiderPlate = hexToRgb('#3A3952');
  const cSpiderGlow = hexToRgb('#B967FF');
  const cManeRoot = hexToRgb('#0F296B');
  const cManeBase = hexToRgb('#1D4ED8');
  const cManeMid = hexToRgb('#38BDF8');
  const cManeTip = hexToRgb('#BAE6FD');
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

      // Symmetrical directional fur strands (smooth derivative at u=0 center-front!)
      const furStrand =
        Math.cos(u * Math.PI * 44 + Math.sin(v * 22) * 2.2) * 0.42 +
        Math.cos(u * Math.PI * 92 - v * 28) * 0.24 +
        (hash2d(Math.floor(u * 200), Math.floor(v * 68)) - 0.5) * 0.36;
      const fabricWeave =
        Math.cos(u * Math.PI * 64) * Math.sin(v * Math.PI * 64) * 0.28 +
        (hash2d(Math.floor(u * 256), Math.floor(v * 256)) - 0.5) * 0.12;

      if (row === 0 && col === 0) {
        // FUR_PRIMARY (Seamless bilateral fur with tapered sabertooth cheek/tiger stripes)
        const jag = Math.cos(u * Math.PI * 6) * 0.55 + Math.cos(u * Math.PI * 14) * 0.14;
        const stripeWave = Math.sin(v * Math.PI * (spec.stripeFreq || 8) + jag);
        // Keep center-front bridge (u < 0.16) clean of harsh stripes on Kai & Kai-Jax!
        const lateralMask = smoothstep01((u - 0.14) / 0.18);
        const isStripe = spec.hasBoldStripes
          ? stripeWave > 0.30 && u > 0.08
          : spec.hasSubtleStripes
            ? stripeWave > 0.72 && lateralMask > 0.45
            : false;
        const shade = Math.max(-0.10, Math.min(0.13, furStrand * 0.15));
        rgb = isStripe
          ? mixRgb(cFur1, cFurStripe, spec.hasBoldStripes ? 0.92 : 0.65 * lateralMask)
          : shade >= 0
            ? mixRgb(cFur1, [255, 255, 255], shade)
            : mixRgb(cFur1, cFurStripe, -shade * 0.95);

        if (spec.id === 'borax') {
          const scar = Math.abs((u - 0.34) * 1.4 + (v - 0.48) * 0.85) < 0.015 && v > 0.28 && v < 0.68;
          if (scar) rgb = [68, 56, 54];
        }
        rough = 198;
        metal = 8;
        ao = Math.round(224 + furStrand * 22);
        hVal = 0.5 + furStrand * 0.38 - (isStripe ? 0.05 : 0);
      } else if (row === 0 && col === 1) {
        // FUR_SECONDARY (Cream tiger muzzle, silver lion mane, pale inner ear, or Kai-Jax obsidian +X half)
        const stripeWave = Math.sin(v * Math.PI * 8 + Math.cos(u * Math.PI * 4) * 1.0);
        let sub = cFur2;
        if (spec.id === 'kaijax' && stripeWave > 0.70 && u > 0.18) {
          sub = mixRgb(cFur2, [56, 189, 248], 0.25);
        } else if (spec.id === 'boryn' && v > 0.60 && Math.cos(u * Math.PI * 28) > 0.68) {
          sub = mixRgb(cFur2, [35, 24, 18], 0.52);
        }
        rgb = mixRgb(sub, [255, 255, 255], Math.max(0, furStrand * 0.13));
        rough = 190;
        metal = 10;
        ao = Math.round(228 + furStrand * 18);
        hVal = 0.5 + furStrand * 0.38;
      } else if (row === 0 && col === 2) {
        // IVORY_FANG (v=0 gum root -> v=1 gleaming curved sabertooth blade)
        const rootShade = Math.max(0, 1 - v * 1.55);
        const enamelGroove = Math.cos(u * Math.PI * 8) * 0.035 * (1 - v);
        rgb = mixRgb(cFang, [182, 152, 118], rootShade * 0.42);
        rough = Math.round(38 + rootShade * 32);
        metal = 24;
        hVal = 0.5 + enamelGroove;
      } else if ((row === 0 && col === 3) || (row === 1 && col === 3)) {
        // GLOWING PREDATOR EYES (EYE_LEFT [3,0] / EYE_RIGHT [3,1]) — Planar Forward Projection!
        const eyeCol = row === 0 ? cEyeL : cEyeR;
        const dx = (u - 0.5) * 2;
        const dy = (v - 0.5) * 2;
        const r = Math.hypot(dx, dy);
        const isSlit = Math.abs(dx) < 0.105 * (1 - Math.min(1, Math.abs(dy) * 1.18)) + 0.018 && Math.abs(dy) < 0.64;
        const specHighlight = Math.hypot(dx + 0.22, dy + 0.24) < 0.14 || Math.hypot(dx - 0.18, dy - 0.20) < 0.06;
        if (specHighlight) {
          rgb = [255, 255, 255];
          em = [255, 255, 255];
        } else if (isSlit) {
          rgb = [10, 8, 16];
          em = mixRgb(eyeCol, [0, 0, 0], 0.82);
        } else if (r < 0.86) {
          const irisFiber = Math.sin(Math.atan2(dy, dx) * 32) * 0.10;
          const rimDark = smoothstep01((r - 0.62) / 0.24);
          const irisGlow = Math.max(0, 1 - r / 0.88 + irisFiber);
          const brightCore = mixRgb(eyeCol, [255, 252, 244], irisGlow * 0.62);
          rgb = mixRgb(brightCore, eyeCol, rimDark * 0.55);
          em = mixRgb(eyeCol, [255, 255, 255], irisGlow * 0.58);
        } else {
          rgb = [14, 12, 20];
          em = mixRgb(eyeCol, [0, 0, 0], 0.80);
        }
        rough = 14;
        metal = 12;
      } else if (row === 1 && col === 0) {
        // JACKET_MAIN (Authentic streetwear paneling, piping, storm lightning veins, or Ronin brocade)
        const hemRib = v < 0.075;
        const panelSeam = Math.abs(u - 0.26) < 0.010 || Math.abs(u - 0.74) < 0.010 || Math.abs(v - 0.54) < 0.009;
        rgb = hemRib ? mixRgb(cJacket, cJacketAcc, 0.85) : panelSeam ? mixRgb(cJacket, cJacketAcc, 0.42) : cJacket;

        if (spec.id === 'kai') {
          // Crisp white techwear jacket with violet upper shoulder block & gold trim line
          const upperYoke = v > 0.76;
          const goldTrim = Math.abs(v - 0.755) < 0.013 || Math.abs(v - 0.08) < 0.010;
          if (goldTrim) {
            rgb = cGold;
            metal = 215;
            rough = 62;
          } else if (upperYoke) {
            rgb = cJacketAcc;
          }
        }
        if (spec.hasLightningSleeves) {
          // Crisp branching electric storm traces (Jax & Kai-Jax & Borax)
          const jag1 = Math.sin(v * 20 + Math.sin(u * 17) * 2.2);
          const jag2 = Math.cos(u * 24 - Math.sin(v * 15) * 2.0);
          const bolt = Math.abs(jag1 * 0.72 + jag2 * 0.28);
          if (bolt > 0.915) {
            const intensity = (bolt - 0.915) / 0.085;
            rgb = mixRgb(rgb, cLightning, 0.80 + intensity * 0.20);
            em = mixRgb([0, 0, 0], cLightning, 0.65 + intensity * 0.35);
          }
        }
        if (spec.id === 'borax') {
          const diamond = Math.abs(((u * 10) % 1) - 0.5) + Math.abs(((v * 10) % 1) - 0.5);
          if (Math.abs(diamond - 0.48) < 0.052 || u < 0.07 || u > 0.93) {
            rgb = mixRgb(rgb, cGold, 0.84);
            metal = 190;
            rough = 78;
          }
        }
        rough = Math.min(rough, 146);
        ao = panelSeam ? 184 : 238;
        hVal = 0.5 + fabricWeave * 0.26 + (panelSeam ? -0.20 : 0);
      } else if (row === 1 && col === 1) {
        // JACKET_ACCENT (Royal violet yokes/hood/wrist-wraps, cobalt lapels, dark leather bracers)
        const goldEdge = v > 0.91 || v < 0.06;
        const stitch = (Math.abs(v - 0.88) < 0.008 || Math.abs(v - 0.09) < 0.008) && Math.cos(u * Math.PI * 48) > 0;
        rgb = goldEdge ? mixRgb(cGold, cJacketAcc, 0.16) : stitch ? cGold : cJacketAcc;
        rough = goldEdge ? 64 : 150;
        metal = goldEdge ? 210 : 24;
        hVal = 0.5 + fabricWeave * 0.24 + (goldEdge ? 0.20 : 0);
      } else if (row === 1 && col === 2) {
        // INNER_SHIRT / CALLIGRAPHY SCROLL
        rgb = cInner;
        if (spec.id === 'borax') {
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
        } else if (spec.id === 'kai' || spec.id === 'jax') {
          // Subtle athletic rib-knit shading with bilateral symmetry (u=0 is center chest!)
          const vNeck = v > 0.78 && u < 0.18;
          const cord = Math.abs(Math.hypot(u * 2.2, (v - 0.72) * 1.35) - 0.28) < 0.020 && v > 0.44;
          if (cord) {
            rgb = spec.id === 'jax' ? cLightning : cGold;
            metal = 195;
            rough = 68;
          } else if (vNeck) {
            rgb = mixRgb(cInner, cFur1, 0.85);
          }
        }
        rough = Math.min(rough, 174);
        hVal = 0.5 + fabricWeave * 0.20;
      } else if (row === 2 && col === 0) {
        // PANTS_CARGO (Clean matte charcoal/obsidian tactical ripstop — NO purple/blue caterpillar rings!)
        const sideSeam = Math.abs(u - 0.48) < 0.011;
        const kneeDart = Math.abs(v - 0.46) < 0.008 && u > 0.12 && u < 0.82;
        const cuffRib = v < 0.06;
        rgb = cuffRib
          ? mixRgb(cPants, [10, 12, 18], 0.45)
          : sideSeam || kneeDart
            ? mixRgb(cPants, [48, 54, 68], 0.28)
            : cPants;
        rough = 186;
        metal = 12;
        ao = sideSeam || kneeDart ? 182 : 234;
        hVal = 0.5 + fabricWeave * 0.30 + (sideSeam || kneeDart ? -0.18 : 0);
      } else if (row === 2 && col === 1) {
        // SNEAKER_BODY / COMBAT BOOTS (Multi-panel streetwear high-tops matching 078f6bfc.png!)
        const outsole = v < 0.15;
        const midsole = v >= 0.15 && v < 0.28;
        const mudguard = v >= 0.28 && v < 0.42;
        const collar = v > 0.80;
        const laces = u < 0.22 && v > 0.40 && v < 0.82 && Math.sin(v * 96) > 0.18;
        const sideSlash = u > 0.24 && u < 0.76 && Math.abs((v - 0.56) - (u - 0.35) * 0.45) < 0.065;
        if (spec.id === 'boryn' || spec.id === 'borax') {
          rgb = outsole
            ? [22, 19, 18]
            : midsole
              ? [42, 35, 31]
              : sideSlash || laces
                ? cGold
                : cSneaker;
        } else if (spec.id === 'kai') {
          // Kai: Crisp white leather upper, dark violet mudguard/slash, white midsole, gold lace aglets/tongue
          rgb = outsole
            ? [32, 24, 48]
            : midsole
              ? [244, 247, 252]
              : laces
                ? cGold
                : sideSlash || collar
                  ? cJacketAcc
                  : mudguard
                    ? [226, 232, 242]
                    : cSneaker;
        } else {
          // Jax / Kai-Jax: Matte obsidian upper, electric cobalt/violet slash & outsole, dark midsole
          rgb = outsole
            ? cJacketAcc
            : midsole
              ? [30, 36, 48]
              : laces
                ? cGold
                : sideSlash || collar
                  ? cJacketAcc
                  : cSneaker;
        }
        rough = outsole ? 164 : midsole ? 132 : 98;
        metal = sideSlash || laces ? 115 : 26;
        hVal = 0.5 + (outsole ? Math.cos(u * Math.PI * 24) * 0.30 : fabricWeave * 0.2 + (sideSlash ? 0.18 : 0));
      } else if (row === 2 && col === 2) {
        // ARMOR_GOLD / BRUSHED METALLIC PLATES, BADGES & BALL-JOINTS
        const edgeDist = Math.min(u, 1 - u, v, 1 - v);
        const inlay = edgeDist > 0.16 && edgeDist < 0.22;
        const brush = Math.cos(u * Math.PI * 68) * 0.04;
        rgb = edgeDist < 0.09
          ? mixRgb(cGold, [255, 250, 224], 0.48)
          : inlay
            ? mixRgb(cJacket, cGold, 0.35)
            : cGold;
        rough = inlay ? 112 : 54;
        metal = inlay ? 145 : 235;
        hVal = 0.5 + brush + (edgeDist < 0.09 ? 0.28 : inlay ? -0.18 : 0);
      } else if (row === 2 && col === 3) {
        // SASH_TABARD / HANGING TACTICAL BELT STRAPS
        const border = u < 0.12 || u > 0.88 || v < 0.07;
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
        } else if (spec.id === 'kai') {
          // White/violet/gold techwear strap
          rgb = v < 0.14 ? cGold : border ? cJacketAcc : [238, 242, 249];
        } else if (border) {
          rgb = mixRgb(cSash, cGold, 0.42);
        }
        rough = 144;
        metal = border ? 115 : 22;
        hVal = 0.5 + fabricWeave * 0.24;
      } else if (row === 3 && col === 0) {
        // SPIDER_CHITIN (Segmented obsidian-silver carapace + gold ball-joint collars + violet Memory-Web veins)
        const goldRing = Math.abs(v - 0.33) < 0.034 || Math.abs(v - 0.67) < 0.032 || v < 0.055;
        const dorsalRidge = u < 0.22 || u > 0.78;
        const vein = Math.abs(u - 0.5) < 0.065 || v > 0.88;
        rgb = goldRing ? cGold : vein ? cSpiderGlow : dorsalRidge ? cSpiderPlate : cSpider;
        em = !goldRing && vein ? mixRgb(cSpiderGlow, [255, 255, 255], v > 0.88 ? 0.48 : 0.24) : [0, 0, 0];
        rough = goldRing ? 52 : dorsalRidge ? 62 : 42;
        metal = goldRing ? 238 : 202;
        hVal = 0.5 + (goldRing ? 0.32 : dorsalRidge ? 0.16 : 0);
      } else if (row === 3 && col === 1) {
        // STORM_MANE (Rich swept-back cobalt-blue & electric-cyan hair locks — NOT washed-out white!)
        const t = Math.pow(v, 0.82);
        const streak = Math.cos(u * Math.PI * 12 + Math.sin(v * 16) * 1.8) * 0.5 + 0.5;
        const arc = Math.abs(Math.sin(u * Math.PI * 8 - v * 14)) > 0.92;
        rgb = t < 0.38
          ? mixRgb(cManeRoot, cManeBase, t / 0.38)
          : t < 0.78
            ? mixRgb(cManeBase, cManeMid, (t - 0.38) / 0.40 * (0.72 + streak * 0.28))
            : mixRgb(cManeMid, cManeTip, (t - 0.78) / 0.22 * (0.55 + streak * 0.45));
        if (arc) rgb = mixRgb(rgb, [240, 249, 255], 0.75);
        em = mixRgb(cManeBase, cManeMid, Math.min(1, t * 0.75 + streak * 0.25));
        if (arc) em = [186, 230, 253];
        rough = 78;
        metal = 24;
        hVal = 0.5 + furStrand * 0.42;
      } else if (row === 3 && col === 2) {
        // TAIL_EMBER (Kai-Jax fiery Ember Memory tail; Boryn ringed tiger tail; Borax lion tail)
        if (spec.id === 'kaijax') {
          const flame = Math.cos(u * Math.PI * 10 + v * 20) * 0.5 + 0.5;
          rgb = mixRgb([217, 70, 15], [254, 240, 138], Math.pow(v, 0.72) * (0.7 + flame * 0.3));
          em = mixRgb([234, 88, 12], [253, 224, 71], Math.min(1, v * 0.85 + flame * 0.2));
          rough = 82;
        } else if (spec.id === 'boryn') {
          const ring = Math.sin(v * Math.PI * 10 + Math.cos(u * Math.PI * 4) * 0.35) > 0.12 || v > 0.88;
          rgb = ring ? [22, 16, 13] : cFur1;
          rough = 194;
        } else {
          rgb = v > 0.74 ? cFur2 : cFur1;
          rough = 190;
        }
        hVal = 0.5 + furStrand * 0.38;
      } else if (row === 3 && col === 3) {
        // TAIL_MEMORY (u < 0.5 = Storm Current cyan-blue tail; u >= 0.5 = Memory Weave violet tail)
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

  // Compute tangent-space normal map from heightField (clamped within each 256px tile to avoid cross-tile bleed!)
  const normalScale = tier === 'master' ? 2.4 : 2.0;
  for (let py = 0; py < SIZE; py++) {
    const tileMinY = Math.floor(py / TILE) * TILE;
    const tileMaxY = tileMinY + TILE - 1;
    const ym = Math.max(tileMinY, py - 1);
    const yp = Math.min(tileMaxY, py + 1);
    for (let px = 0; px < SIZE; px++) {
      const tileMinX = Math.floor(px / TILE) * TILE;
      const tileMaxX = tileMinX + TILE - 1;
      const xm = Math.max(tileMinX, px - 1);
      const xp = Math.min(tileMaxX, px + 1);
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
// 2. Sculpted Organic Mesh Builder (Seamless Bilateral UVs + Planar Eye UVs)
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
      planarFrontUv = false,
    } = opts;

    const ringCount = rings.length;
    const cols = radialSegs + 1;
    const baseVertex = this.vertexCount;

    const rotMat = new THREE.Matrix4();
    const euler = new THREE.Euler();
    const pt = new THREE.Vector3();

    let maxRx = 0.001;
    let maxRz = 0.001;
    for (const r of rings) {
      if (r.rx > maxRx) maxRx = r.rx;
      if (r.rz > maxRz) maxRz = r.rz;
    }

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
        let uMap = uFrac;
        let vMap = vFrac;
        if (planarFrontUv) {
          uMap = 0.5 + (lx / maxRx) * 0.44;
          vMap = 0.5 + (lz / maxRz) * 0.44;
        } else if (closedCircle) {
          // Seamless bilateral symmetry: u=0 at +Z front, u=1 at -Z back (zero seam on face or chest!)
          uMap = Math.acos(Math.max(-1, Math.min(1, Math.cos(theta)))) / Math.PI;
        }

        const [uAtlas, vAtlas] = this.mapTileUv(chosenTile, uMap, vMap, uSubRange);

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
      this.uvs.push(
        this.mapTileUv(chosenTile, planarFrontUv ? 0.5 : 0.06, planarFrontUv ? 0.5 : 0.05, uSubRange)
      );
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
      euler.set(rn.pitch || 0, rn.yaw || 0, rn.roll || 0, 'YXZ');
      rotMat.makeRotationFromEuler(euler);
      pt.set(0, rn.capLift || 0, 0).applyMatrix4(rotMat);
      this.positions.push([rn.cx + pt.x, rn.cy + pt.y, rn.cz + pt.z]);
      this.uvs.push(
        this.mapTileUv(chosenTile, planarFrontUv ? 0.5 : 0.06, planarFrontUv ? 0.5 : 0.95, uSubRange)
      );
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
      const rad = Math.max(0.0022, radiusFn(vFrac));

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
        const uSym = Math.acos(Math.max(-1, Math.min(1, Math.cos(theta)))) / Math.PI;
        const [uAtlas, vAtlas] = this.mapTileUv(chosenTile, uSym, vFrac, uSubRange);
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

  /**
   * Computes smooth normals per anatomical material/part group so fur stays velvety smooth
   * while jacket lapels, cargo pockets, spider armor plates, and fangs retain crisp silhouettes!
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

    const seamBuckets = new Map();
    for (let v = 0; v < vCount; v++) {
      const p = posArray[v];
      const tag = this.tags[v]?.tag || 'body';
      const key = `${tag}_${Math.round(p[0] * 5000)}_${Math.round(p[1] * 5000)}_${Math.round(p[2] * 5000)}`;
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
// 3. Canonical Character Roster Specifications (Reconciled vs 078f6bfc.png)
// ---------------------------------------------------------------------------
const ROSTER_SPECS = [
  {
    id: 'kai',
    height: 1.82,
    shoulderWidth: 0.240,
    hipWidth: 0.124,
    bulk: 0.94,
    spiderCount: 4,
    maneCount: 0,
    tailMode: 'none',
    hasCrownSpikes: true,
    garmentStyle: 'techwear_kai',
    hasSubtleStripes: true,
    hasBoldStripes: false,
    stripeFreq: 8,
    palette: {
      furPrimary: '#EEF3FA',
      furStripe: '#352B4D',
      furSecondary: '#E2D9F3',
      eyeLeft: '#C084FC',
      eyeRight: '#C084FC',
      jacketMain: '#F4F7FB',
      jacketAccent: '#5B21B6',
      innerShirt: '#CBD5E1',
      pants: '#171A24',
      sneaker: '#F8FAFC',
      armorTrim: '#F59E0B',
      sash: '#6D28D9',
      tailPrimary: '#F97316',
    },
  },
  {
    id: 'jax',
    height: 1.88,
    shoulderWidth: 0.268,
    hipWidth: 0.134,
    bulk: 1.05,
    spiderCount: 0,
    maneCount: 7,
    tailMode: 'none',
    hasCrownSpikes: true,
    garmentStyle: 'techwear_jax',
    hasLightningSleeves: true,
    hasSubtleStripes: false,
    hasBoldStripes: false,
    palette: {
      furPrimary: '#161B26',
      furStripe: '#0B0E15',
      furSecondary: '#263147',
      eyeLeft: '#38BDF8',
      eyeRight: '#38BDF8',
      jacketMain: '#121620',
      jacketAccent: '#1D4ED8',
      jacketGlow: '#38BDF8',
      innerShirt: '#1A2234',
      pants: '#141822',
      sneaker: '#181F2E',
      armorTrim: '#38BDF8',
      sash: '#2563EB',
      tailPrimary: '#38BDF8',
    },
  },
  {
    id: 'kaijax',
    height: 2.04,
    shoulderWidth: 0.298,
    hipWidth: 0.148,
    bulk: 1.12,
    spiderCount: 4,
    maneCount: 7,
    tailMode: 'tri_canon', // STRICTLY 3 PHYSICAL TAILS: Ember, Storm, Memory!
    hasCrownSpikes: true,
    splitFurYinYang: true, // -X (viewer-left) Silver-White + Ember-Gold Eye; +X (viewer-right) Obsidian-Black + Storm-Blue Eye!
    garmentStyle: 'fusion_coat',
    hasLightningSleeves: true,
    hasSubtleStripes: true,
    hasBoldStripes: false,
    stripeFreq: 9,
    palette: {
      furPrimary: '#EFF4FC',   // Viewer-left (-X) Silver-White Fur
      furStripe: '#221D35',
      furSecondary: '#141824', // Viewer-right (+X) Obsidian-Black Fur
      eyeLeft: '#38BDF8',      // +X (viewer-right) Storm-Blue Eye
      eyeRight: '#F59E0B',     // -X (viewer-left) Ember-Gold Eye
      jacketMain: '#161426',
      jacketAccent: '#6D28D9',
      jacketGlow: '#A855F7',
      innerShirt: '#F1F5F9',
      pants: '#141722',
      sneaker: '#1C1730',
      armorTrim: '#D4AF37',
      sash: '#F8FAFC',
      tailPrimary: '#F97316',
    },
  },
  {
    id: 'boryn',
    height: 2.12,
    shoulderWidth: 0.334,
    hipWidth: 0.164,
    bulk: 1.28,
    spiderCount: 0,
    maneCount: 0,
    tailMode: 'single',
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
    shoulderWidth: 0.326,
    hipWidth: 0.162,
    bulk: 1.22,
    spiderCount: 0,
    maneCount: 0,
    hasLionMane: true,
    tailMode: 'single',
    hasCrownSpikes: false,
    garmentStyle: 'storm_ronin',
    hasLightningSleeves: true,
    hasSubtleStripes: false,
    hasBoldStripes: false,
    palette: {
      furPrimary: '#9E958A',
      furStripe: '#575049',
      furSecondary: '#E6EDF7',
      eyeLeft: '#F59E0B',
      eyeRight: '#F59E0B',
      jacketMain: '#16243C',
      jacketAccent: '#1E3A5F',
      jacketGlow: '#38BDF8',
      innerShirt: '#F4F1EA',
      pants: '#121D30',
      sneaker: '#1C2434',
      armorTrim: '#D4AF37',
      sash: '#1D3557',
      tailPrimary: '#9E958A',
    },
  },
];

// ---------------------------------------------------------------------------
// 4. Unified Skeleton + Mastered Anatomical Sculpture + Hermite Skinning
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
  addBone('chest', 'spine_02', [0, 1.35 * S, 0.012 * S]);
  addBone('neck', 'chest', [0, 1.49 * S, 0.02 * S]);
  addBone('head', 'neck', [0, 1.595 * S, 0.032 * S]);
  addBone('jaw', 'head', [0, 1.528 * S, 0.088 * S]);
  addBone('ear_L', 'head', [0.128 * S, 1.725 * S, -0.008 * S]);
  addBone('ear_R', 'head', [-0.128 * S, 1.725 * S, -0.008 * S]);

  // Arms & Articulated Hands (+X = Left, -X = Right when facing +Z; natural athletic A-pose with slight elbow bend)
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    addBone(`clavicle_${suf}`, 'chest', [sign * 0.095 * S, 1.43 * S, 0.01 * S]);
    addBone(`upper_arm_${suf}`, `clavicle_${suf}`, [sign * shX, 1.40 * S, -0.005 * S]);
    addBone(`forearm_${suf}`, `upper_arm_${suf}`, [sign * (shX + 0.056 * S), 1.135 * S, -0.018 * S]);
    addBone(`hand_${suf}`, `forearm_${suf}`, [sign * (shX + 0.078 * S), 0.885 * S, 0.048 * S]);
  }

  // Legs, Ankles & Clawed Feet (natural slight knee flexion readiness)
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    addBone(`thigh_${suf}`, 'pelvis', [sign * hipX, 0.90 * S, 0]);
    addBone(`shin_${suf}`, `thigh_${suf}`, [sign * (hipX + 0.010 * S), 0.49 * S, 0.024 * S]);
    addBone(`foot_${suf}`, `shin_${suf}`, [sign * (hipX + 0.014 * S), 0.11 * S, 0.005 * S]);
    addBone(`toe_${suf}`, `foot_${suf}`, [sign * (hipX + 0.014 * S), 0.04 * S, 0.145 * S]);
  }

  // Kai & Kai-Jax: 4 Segmented Dorsal Spider Limbs (12 bones: spider_UL/UR/LL/LR_01..03) matching 078f6bfc.png!
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
        ? [s * 0.105 * S, 1.42 * S, -0.145 * S]
        : [s * 0.125 * S, 1.25 * S, -0.155 * S];
      const p1 = cfg.upper
        ? [s * 0.44 * S, 1.88 * S, -0.22 * S]
        : [s * 0.52 * S, 1.46 * S, -0.25 * S];
      const p2 = cfg.upper
        ? [s * 0.54 * S, 2.12 * S, -0.03 * S]
        : [s * 0.68 * S, 1.06 * S, -0.06 * S];
      const pTip = cfg.upper
        ? [s * 0.30 * S, 1.88 * S, 0.18 * S]
        : [s * 0.52 * S, 0.58 * S, 0.16 * S];

      addBone(`${cfg.prefix}_01`, 'chest', p0);
      addBone(`${cfg.prefix}_02`, `${cfg.prefix}_01`, p1);
      addBone(`${cfg.prefix}_03`, `${cfg.prefix}_02`, p2);
      spiderChains.push({ ...cfg, points: [p0, p1, p2, pTip] });
    }
  }

  // Jax & Kai-Jax: 7 Swept-Back Electric Storm-Mane Crests (mane_01..07) matching 078f6bfc.png!
  const maneChains = [];
  if (spec.maneCount === 7) {
    for (let i = 1; i <= 7; i++) {
      const u = (i - 4) / 3; // -1 .. +1 across crown & temples
      const crownFactor = 1 - Math.abs(u) * 0.38;
      // Rises from forehead/crown and sweeps dynamically BACKWARD (-Z) over neck & upper back!
      const base = [u * 0.125 * S, (1.715 - Math.abs(u) * 0.065) * S, (0.045 - Math.abs(u) * 0.045) * S];
      const crest = [u * 0.195 * S, (1.92 * crownFactor + 0.09) * S, -0.10 * S];
      const sweep = [u * 0.255 * S, (1.84 * crownFactor + 0.04) * S, -0.32 * S];
      const tip = [u * 0.295 * S, (1.68 * crownFactor) * S, -0.52 * S];
      addBone(`mane_0${i}`, 'head', base);
      maneChains.push({ name: `mane_0${i}`, u, points: [base, crest, sweep, tip] });
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
          [-0.36 * S, 0.74 * S, -0.34 * S],
          [-0.56 * S, 0.46 * S, -0.44 * S],
          [-0.46 * S, 0.26 * S, -0.16 * S],
          [-0.32 * S, 0.52 * S, 0.02 * S],
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
          [0.36 * S, 0.74 * S, -0.34 * S],
          [0.56 * S, 0.48 * S, -0.44 * S],
          [0.47 * S, 0.28 * S, -0.16 * S],
          [0.34 * S, 0.56 * S, 0.02 * S],
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

  // 1. Athletic V-Taper Torso & Furred Neck
  const torsoTile =
    spec.garmentStyle === 'shield_harness' || spec.garmentStyle === 'fusion_coat'
      ? TILES.FUR_PRIMARY
      : TILES.INNER_SHIRT;
  const torsoSplit = spec.garmentStyle === 'fusion_coat' ? splitFur : null;

  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 0.88 * S, cz: 0, rx: 0.140 * B * S, rz: 0.112 * B * S },
        { cx: 0, cy: 1.03 * S, cz: 0, rx: 0.138 * B * S, rz: 0.112 * B * S },
        {
          cx: 0,
          cy: 1.19 * S,
          cz: 0.010 * S,
          rx: 0.168 * B * S,
          rz: 0.132 * B * S,
          lobe: (th) => 1 + Math.max(0, Math.cos(th)) * 0.08,
        },
        {
          cx: 0,
          cy: 1.35 * S,
          cz: 0.016 * S,
          rx: 0.198 * B * S,
          rz: 0.146 * B * S,
          lobe: (th) => 1 + Math.pow(Math.max(0, Math.cos(th)), 2) * 0.12,
        },
        { cx: 0, cy: 1.46 * S, cz: 0.020 * S, rx: 0.112 * B * S, rz: 0.104 * B * S, tileOverride: TILES.FUR_PRIMARY },
        { cx: 0, cy: 1.575 * S, cz: 0.028 * S, rx: 0.094 * B * S, rz: 0.094 * B * S, tileOverride: TILES.FUR_PRIMARY },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_BODY, tile: torsoTile, splitTilePositiveX: torsoSplit || splitFur, tag: 'torso' }
  );

  // Fang Pendant / Medallion on Kai & Jax's Inner Shirt (visible inside open streetwear jacket per 078f6bfc.png!)
  if (spec.id === 'kai' || spec.id === 'jax') {
    acc.addSplineTube(
      [
        [0, 1.325 * S, 0.156 * B * S],
        [0, 1.285 * S, 0.164 * B * S],
      ],
      (t) => (1 - t * 0.72) * 0.018 * S,
      {
        tubularSegs: 4,
        radialSegs: 6,
        tile: spec.id === 'kai' ? TILES.ARMOR_GOLD : TILES.STORM_MANE,
        tag: 'torso',
        flattenY: 0.65,
      }
    );
  }

  // 1B. Tapered Athletic Pelvis / Trousers Waist Block (Eliminates boxy hip-shelf while keeping zero leg gap!)
  acc.addLoft(
    [
      {
        cx: 0,
        cy: 0.77 * S,
        cz: 0.004 * S,
        rx: (hipX + 0.068 * B) * S,
        rz: 0.112 * B * S,
        capDrop: 0.015 * S,
        lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 2) * 0.08 - Math.pow(Math.cos(th), 4) * 0.10,
      },
      {
        cx: 0,
        cy: 0.87 * S,
        cz: 0.003 * S,
        rx: (hipX + 0.064 * B) * S,
        rz: 0.122 * B * S,
        lobe: (th) => 1 + Math.max(0, -Math.cos(th)) * 0.10,
      },
      {
        cx: 0,
        cy: 0.965 * S,
        cz: 0.002 * S,
        rx: 0.154 * B * S,
        rz: 0.122 * B * S,
        capLift: 0.008 * S,
      },
    ],
    { radialSegs: R_LIMB, tile: TILES.PANTS_CARGO, tag: 'pelvis_hip' }
  );

  // Sculpted Tactical Belt & Center Buckle
  const beltTile =
    spec.id === 'kai'
      ? TILES.SASH_TABARD
      : spec.id === 'jax'
        ? TILES.SASH_TABARD
        : TILES.ARMOR_GOLD;
  acc.addLoft(
    [
      { cx: 0, cy: 0.925 * S, cz: 0.004 * S, rx: 0.162 * B * S, rz: 0.128 * B * S },
      { cx: 0, cy: 0.980 * S, cz: 0.004 * S, rx: 0.160 * B * S, rz: 0.126 * B * S },
    ],
    { radialSegs: R_LIMB, tile: beltTile, tag: 'belt' }
  );

  const buckleScale = spec.id === 'borax' || spec.id === 'boryn' || spec.id === 'kaijax' ? 1.22 : 0.78;
  acc.addLoft(
    [
      { cx: 0, cy: 0.952 * S, cz: 0.128 * B * S, rx: 0.046 * buckleScale * S, rz: 0.042 * buckleScale * S, pitch: Math.PI * 0.5 },
      { cx: 0, cy: 0.952 * S, cz: (0.128 * B + 0.022) * S, rx: 0.038 * buckleScale * S, rz: 0.034 * buckleScale * S, pitch: Math.PI * 0.5, capLift: 0.008 * S },
    ],
    { radialSegs: 10, tile: TILES.ARMOR_GOLD, tag: 'belt' }
  );

  // 2. Anatomically Sculpted Sabertooth Wedge Cranium + Angular Zygomatic Cheekbones (078f6bfc.png!)
  acc.addLoft(
    subdivideRings(
      [
        // Tapered lower jaw/neck base
        { cx: 0, cy: 1.505 * S, cz: 0.018 * S, rx: 0.098 * S, rz: 0.102 * S, capDrop: 0.010 * S },
        // Angular sabertooth cheek/zygomatic flare (broad across ±X cheekbones, tapered chin/temple)
        {
          cx: 0,
          cy: 1.575 * S,
          cz: 0.034 * S,
          rx: 0.156 * S,
          rz: 0.144 * S,
          lobe: (th) =>
            1 +
            Math.pow(Math.abs(Math.sin(th)), 3) * 0.24 -
            Math.pow(Math.max(0, Math.cos(th)), 4) * 0.06 +
            (Math.cos(th) < -0.35 ? 0.06 : 0),
        },
        // Eye/supraorbital plane
        {
          cx: 0,
          cy: 1.648 * S,
          cz: 0.036 * S,
          rx: 0.140 * S,
          rz: 0.146 * S,
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 4) * 0.12 + Math.pow(Math.max(0, Math.cos(th)), 3) * 0.08,
        },
        // Narrower feline predator temple/forehead
        { cx: 0, cy: 1.720 * S, cz: 0.018 * S, rx: 0.114 * S, rz: 0.126 * S },
        { cx: 0, cy: 1.768 * S, cz: 0.002 * S, rx: 0.072 * S, rz: 0.086 * S, capLift: 0.018 * S },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_BODY, tile: TILES.FUR_PRIMARY, splitTilePositiveX: splitFur, tag: 'head' }
  );

  // 2B. Swept-Up Sabertooth Cheek Fur Locks (4 sharp layered predator tufts per cheek matching 078f6bfc.png!)
  for (const sign of [-1, 1]) {
    const ruffTile = sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY;
    for (let r = 0; r < 4; r++) {
      const yOff = (r - 1.5) * 0.028 * S;
      const lenScale = r === 1 || r === 2 ? 1.16 : 0.88;
      acc.addSplineTube(
        [
          [sign * 0.118 * S, 1.592 * S + yOff, 0.056 * S],
          [sign * 0.188 * lenScale * S, 1.592 * S + yOff * 1.12, 0.016 * S],
          [sign * 0.242 * lenScale * S, 1.598 * S + yOff * 1.28, -0.042 * S],
        ],
        (t) => (1 - Math.pow(t, 1.12) * 0.90) * 0.028 * S,
        { tubularSegs: isMaster ? 6 : 4, radialSegs: isMaster ? 7 : 5, tile: ruffTile, tag: 'head', flattenY: 0.52 }
      );
    }
  }

  // 2C. Wild Sabertooth Crown Fur Locks (Kai & Kai-Jax spiky silver-white crown hair; Jax forward dark tufts)
  if (spec.hasCrownSpikes) {
    const crownLocks =
      spec.id === 'jax'
        ? [-0.30, 0, 0.30]
        : [-0.46, -0.22, 0, 0.22, 0.46];
    for (const ang of crownLocks) {
      const cTile = ang > 0.01 && splitFur ? splitFur : TILES.FUR_PRIMARY;
      const hBoost = 1 - Math.abs(ang) * 0.38;
      acc.addSplineTube(
        [
          [ang * 0.14 * S, 1.735 * S, 0.042 * S],
          [ang * 0.19 * S, (1.815 * hBoost + 0.025) * S, 0.012 * S],
          [ang * 0.23 * S, (1.882 * hBoost + 0.035) * S, -0.045 * S],
        ],
        (t) => (1 - Math.pow(t, 1.18) * 0.92) * 0.030 * S,
        { tubularSegs: isMaster ? 6 : 4, radialSegs: isMaster ? 6 : 5, tile: cTile, tag: 'head', flattenY: 0.62 }
      );
    }
  }

  // 3. Sculpted Sabertooth Muzzle, Dark Feline Upper Lip Margin & Nasal Bridge
  const snoutTile = spec.id === 'boryn' ? TILES.FUR_SECONDARY : TILES.FUR_PRIMARY;
  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 1.598 * S, cz: 0.102 * S, rx: 0.096 * S, rz: 0.070 * S, pitch: Math.PI * 0.44 },
        {
          cx: 0,
          cy: 1.576 * S,
          cz: 0.168 * S,
          rx: 0.088 * S,
          rz: 0.062 * S,
          pitch: Math.PI * 0.48,
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 2) * 0.22 - Math.pow(Math.max(0, -Math.cos(th)), 4) * 0.10,
        },
        {
          cx: 0,
          cy: 1.560 * S,
          cz: 0.228 * S,
          rx: 0.072 * S,
          rz: 0.050 * S,
          pitch: Math.PI * 0.5,
          capLift: 0.015 * S,
          lobe: (th) => 1 + Math.pow(Math.abs(Math.sin(th)), 2) * 0.15,
        },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_LIMB, tile: snoutTile, splitTilePositiveX: splitFur, tag: 'snout' }
  );

  // Crisp Dark Feline Upper Lip Margin (frames the mouth opening & canine sockets cleanly!)
  acc.addSplineTube(
    [
      [-0.074 * S, 1.548 * S, 0.165 * S],
      [-0.048 * S, 1.542 * S, 0.218 * S],
      [0, 1.548 * S, 0.236 * S],
      [0.048 * S, 1.542 * S, 0.218 * S],
      [0.074 * S, 1.548 * S, 0.165 * S],
    ],
    () => 0.010 * S,
    { tubularSegs: 8, radialSegs: 6, tile: TILES.PANTS_CARGO, tag: 'snout' }
  );

  // Sloped Dorsal Nasal Bridge
  acc.addLoft(
    [
      { cx: 0, cy: 1.650 * S, cz: 0.132 * S, rx: 0.040 * S, rz: 0.030 * S, pitch: Math.PI * 0.34 },
      { cx: 0, cy: 1.616 * S, cz: 0.186 * S, rx: 0.035 * S, rz: 0.026 * S, pitch: Math.PI * 0.38 },
      { cx: 0, cy: 1.590 * S, cz: 0.232 * S, rx: 0.030 * S, rz: 0.020 * S, pitch: Math.PI * 0.42, capLift: 0.008 * S },
    ],
    { radialSegs: 10, tile: TILES.FUR_PRIMARY, splitTilePositiveX: splitFur, tag: 'snout' }
  );

  // Dark Triangular Feline Nose Leather (rhinarium)
  acc.addLoft(
    [
      { cx: 0, cy: 1.584 * S, cz: 0.234 * S, rx: 0.034 * S, rz: 0.023 * S, pitch: Math.PI * 0.5 },
      { cx: 0, cy: 1.578 * S, cz: 0.254 * S, rx: 0.023 * S, rz: 0.016 * S, pitch: Math.PI * 0.5, capLift: 0.006 * S },
    ],
    { radialSegs: 10, tile: TILES.PANTS_CARGO, tag: 'snout' }
  );

  // 4. Articulated Lower Jaw & Chin Tuft
  acc.addLoft(
    subdivideRings(
      [
        { cx: 0, cy: 1.514 * S, cz: 0.082 * S, rx: 0.078 * S, rz: 0.048 * S, pitch: Math.PI * 0.52 },
        { cx: 0, cy: 1.500 * S, cz: 0.150 * S, rx: 0.064 * S, rz: 0.042 * S, pitch: Math.PI * 0.52 },
        { cx: 0, cy: 1.490 * S, cz: 0.210 * S, rx: 0.046 * S, rz: 0.035 * S, pitch: Math.PI * 0.5, capLift: 0.014 * S },
      ],
      SUB_RINGS
    ),
    { radialSegs: R_DETAIL, tile: snoutTile, splitTilePositiveX: splitFur, tag: 'jaw' }
  );

  // 5. Twin Curved Blade-Profile Ivory Sabertooth Fangs (Proportioned & Angled per 078f6bfc.png!)
  for (const sign of [-1, 1]) {
    const fScale = spec.id === 'boryn' || spec.id === 'borax' ? 1.18 : 1.0;
    const tipY = spec.id === 'boryn' || spec.id === 'borax' ? 1.385 : 1.412;
    acc.addSplineTube(
      [
        [sign * 0.054 * S, 1.552 * S, 0.194 * S],
        [sign * 0.058 * S, 1.504 * S, 0.216 * S],
        [sign * 0.056 * S, 1.456 * S, 0.218 * S],
        [sign * 0.049 * S, tipY * S, 0.204 * S],
      ],
      (t) => (1 - Math.pow(t, 1.32) * 0.88) * 0.023 * fScale * S,
      {
        tubularSegs: isMaster ? 10 : 6,
        radialSegs: isMaster ? 10 : 7,
        tile: TILES.IVORY_FANG,
        tag: 'fang',
        flattenY: 0.58,
      }
    );
  }

  // 6. Luminous Forward-Projected Almond Predator Eyes + Fierce V-Angled Supraorbital Brows!
  for (const [sign, eyeTile, lidTag] of [
    [1, TILES.EYE_LEFT, 'eyelid_L'],   // +X (viewer-right)
    [-1, TILES.EYE_RIGHT, 'eyelid_R'], // -X (viewer-left)
  ]) {
    const ex = sign * 0.064 * S;
    const ey = 1.632 * S;
    const ez = 0.176 * S;
    // Crisp dark feline eyeliner socket
    acc.addLoft(
      [
        { cx: ex, cy: ey, cz: ez - 0.010 * S, rx: 0.038 * S, rz: 0.024 * S, pitch: Math.PI * 0.5, yaw: sign * 0.22, roll: -sign * 0.18 },
        { cx: ex, cy: ey, cz: ez + 0.008 * S, rx: 0.036 * S, rz: 0.023 * S, pitch: Math.PI * 0.5, yaw: sign * 0.22, roll: -sign * 0.18 },
      ],
      { radialSegs: 12, tile: TILES.PANTS_CARGO, tag: 'eye' }
    );
    // Planar-UV Glowing Convex Predator Cornea (projects bright iris + vertical slit + catchlight straight forward!)
    acc.addLoft(
      [
        { cx: ex, cy: ey, cz: ez + 0.005 * S, rx: 0.033 * S, rz: 0.020 * S, pitch: Math.PI * 0.5, yaw: sign * 0.22, roll: -sign * 0.18 },
        { cx: ex, cy: ey, cz: ez + 0.018 * S, rx: 0.029 * S, rz: 0.018 * S, pitch: Math.PI * 0.5, yaw: sign * 0.22, roll: -sign * 0.18, capLift: 0.008 * S },
      ],
      { radialSegs: 14, tile: eyeTile, planarFrontUv: true, tag: 'eye' }
    );

    // Expressive Fierce V-Angled Supraorbital Brow Ridge
    const browTile =
      spec.id === 'kai'
        ? TILES.PANTS_CARGO
        : sign > 0 && splitFur
          ? splitFur
          : TILES.FUR_PRIMARY;
    acc.addSplineTube(
      [
        [ex - sign * 0.038 * S, ey + 0.009 * S, ez + 0.018 * S],
        [ex, ey + 0.025 * S, ez + 0.022 * S],
        [ex + sign * 0.042 * S, ey + 0.038 * S, ez + 0.006 * S],
      ],
      (t) => (0.85 + Math.sin(t * Math.PI) * 0.35) * 0.015 * S,
      { tubularSegs: 6, radialSegs: 7, tile: browTile, tag: lidTag, flattenY: 0.72 }
    );
  }

  // 7. Tall Swept-Back Cupped Sabertooth Ears + Inner Ear Concha Shell (078f6bfc.png!)
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    const earTile = sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY;
    // Outer dorsal ear shell
    acc.addSplineTube(
      [
        [sign * 0.106 * S, 1.705 * S, 0.004 * S],
        [sign * 0.165 * S, 1.805 * S, -0.022 * S],
        [sign * 0.212 * S, 1.902 * S, -0.052 * S],
      ],
      (t) => (1 - Math.pow(t, 1.18) * 0.90) * 0.058 * S,
      { tubularSegs: isMaster ? 8 : 5, radialSegs: isMaster ? 10 : 6, tile: earTile, tag: `ear_${suf}`, flattenY: 0.44 }
    );
    // Contrasting Inner Ear Concha Tuft on the front (+Z) face of each ear!
    acc.addSplineTube(
      [
        [sign * 0.112 * S, 1.715 * S, 0.022 * S],
        [sign * 0.158 * S, 1.792 * S, 0.002 * S],
        [sign * 0.194 * S, 1.862 * S, -0.024 * S],
      ],
      (t) => (1 - Math.pow(t, 1.25) * 0.92) * 0.032 * S,
      {
        tubularSegs: isMaster ? 6 : 4,
        radialSegs: 6,
        tile: spec.id === 'kai' ? TILES.FUR_SECONDARY : TILES.PANTS_CARGO,
        tag: `ear_${suf}`,
        flattenY: 0.35,
      }
    );
  }

  // Borax Voluminous Multi-Layered Silver-White Sabertooth Lion Mane
  if (spec.hasLionMane) {
    const outerCount = isMaster ? 16 : 10;
    for (let m = 0; m < outerCount; m++) {
      const ang = -Math.PI * 0.82 + (m / (outerCount - 1)) * Math.PI * 1.64;
      if (Math.abs(ang) < 0.36) continue;
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

  // 8. Signature Layered Outerwear, 3D Turned-Out Lapels & Armor Separation (078f6bfc.png!)
  if (spec.garmentStyle === 'techwear_kai' || spec.garmentStyle === 'techwear_jax' || spec.garmentStyle === 'fusion_coat') {
    const isFusion = spec.garmentStyle === 'fusion_coat';
    const coatBottomY = isFusion ? 0.56 * S : spec.id === 'kai' ? 0.96 * S : 0.88 * S;
    const openGapRad = spec.id === 'kai' ? 0.58 : 0.48;
    acc.addLoft(
      subdivideRings(
        [
          {
            cx: 0,
            cy: coatBottomY,
            cz: -0.008 * S,
            rx: (isFusion ? 0.275 : 0.194) * B * S,
            rz: (isFusion ? 0.215 : 0.152) * B * S,
            lobe: (th) => 1 + Math.sin(th * 5) * 0.03,
          },
          { cx: 0, cy: 1.04 * S, cz: 0, rx: 0.186 * B * S, rz: 0.146 * B * S },
          { cx: 0, cy: 1.22 * S, cz: 0.006 * S, rx: 0.208 * B * S, rz: 0.158 * B * S },
          {
            cx: 0,
            cy: 1.41 * S,
            cz: 0.012 * S,
            rx: 0.228 * B * S,
            rz: 0.168 * B * S,
            tileOverride: spec.id === 'kai' ? TILES.JACKET_ACCENT : TILES.JACKET_MAIN,
          },
        ],
        SUB_RINGS
      ),
      {
        radialSegs: R_BODY,
        tile: TILES.JACKET_MAIN,
        thetaStart: openGapRad,
        thetaLength: Math.PI * 2 - openGapRad * 2,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.016 * S,
        liningTile: TILES.JACKET_ACCENT,
        tag: 'jacket',
      }
    );

    // 3D Turned-Out Open Front Jacket Lapels (gives unmistakable streetwear depth & material separation!)
    for (const sign of [-1, 1]) {
      const lapelTile = spec.id === 'kai' ? TILES.JACKET_ACCENT : spec.id === 'jax' ? TILES.JACKET_ACCENT : TILES.ARMOR_GOLD;
      acc.addSplineTube(
        [
          [sign * 0.115 * B * S, 1.42 * S, 0.142 * B * S],
          [sign * 0.132 * B * S, 1.24 * S, 0.156 * B * S],
          [sign * 0.118 * B * S, coatBottomY + 0.04 * S, 0.140 * B * S],
        ],
        (t) => (1.15 - t * 0.35) * 0.024 * S,
        { tubularSegs: 6, radialSegs: 6, tile: lapelTile, tag: 'jacket', flattenY: 0.42 }
      );
    }

    // Sculpted Streetwear Hood / High Flared Storm Collar
    acc.addLoft(
      [
        { cx: 0, cy: 1.39 * S, cz: -0.015 * S, rx: 0.192 * B * S, rz: 0.158 * B * S },
        { cx: 0, cy: 1.52 * S, cz: -0.045 * S, rx: 0.218 * B * S, rz: 0.180 * B * S },
        { cx: 0, cy: isFusion ? 1.69 * S : 1.57 * S, cz: -0.072 * S, rx: (isFusion ? 0.205 : 0.178) * B * S, rz: 0.150 * B * S },
      ],
      {
        radialSegs: R_DETAIL,
        tile: spec.id === 'jax' ? TILES.JACKET_MAIN : TILES.JACKET_ACCENT,
        thetaStart: Math.PI * 0.36,
        thetaLength: Math.PI * 1.28,
        closedCircle: false,
        doubleSidedShell: true,
        shellThickness: 0.015 * S,
        liningTile: isFusion ? TILES.ARMOR_GOLD : TILES.JACKET_ACCENT,
        tag: 'collar',
      }
    );

    if (isFusion) {
      for (const sign of [-1, 1]) {
        acc.addSplineTube(
          [
            [sign * 0.15 * B * S, 1.40 * S, 0.11 * B * S],
            [0, 1.18 * S, 0.152 * B * S],
            [-sign * 0.13 * B * S, 0.97 * S, 0.128 * B * S],
          ],
          () => 0.018 * S,
          { tubularSegs: 6, radialSegs: 6, tile: TILES.ARMOR_GOLD, tag: 'torso', flattenY: 0.45 }
        );
      }
    }
  } else if (spec.garmentStyle === 'shield_harness') {
    acc.addLoft(
      [
        { cx: 0, cy: 1.16 * S, cz: 0.01 * S, rx: 0.194 * B * S, rz: 0.150 * B * S },
        { cx: 0, cy: 1.42 * S, cz: 0.01 * S, rx: 0.220 * B * S, rz: 0.166 * B * S },
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
    acc.addSplineTube(
      [
        [0.18 * B * S, 1.42 * S, 0.11 * B * S],
        [0.02 * B * S, 1.21 * S, 0.162 * B * S],
        [-0.15 * B * S, 0.98 * S, 0.132 * B * S],
      ],
      () => 0.026 * S,
      { tubularSegs: 7, radialSegs: 6, tile: TILES.ARMOR_GOLD, tag: 'torso', flattenY: 0.42 }
    );
  } else if (spec.garmentStyle === 'storm_ronin') {
    acc.addLoft(
      subdivideRings(
        [
          { cx: 0, cy: 0.34 * S, cz: -0.02 * S, rx: 0.295 * B * S, rz: 0.230 * B * S },
          { cx: 0, cy: 0.72 * S, cz: -0.01 * S, rx: 0.234 * B * S, rz: 0.182 * B * S },
          { cx: 0, cy: 0.98 * S, cz: 0, rx: 0.198 * B * S, rz: 0.156 * B * S },
          { cx: 0, cy: 1.39 * S, cz: 0.01 * S, rx: 0.234 * B * S, rz: 0.175 * B * S },
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

  // Sculpted Deltoid Shoulder Caps / Gold Badges (Kai) / Tiered Samurai Sode Pauldrons (Borax)
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    if (spec.id === 'borax' || spec.id === 'kaijax' || spec.id === 'boryn') {
      const tiers = spec.id === 'borax' ? 2 : 1;
      for (let t = 0; t < tiers; t++) {
        const yDrop = t * 0.075 * S;
        acc.addLoft(
          [
            { cx: sign * (shX + 0.026 * S), cy: 1.36 * S - yDrop, cz: 0, rx: 0.108 * S, rz: 0.108 * S, roll: -sign * 0.42 },
            { cx: sign * (shX - 0.018 * S), cy: 1.45 * S - yDrop * 0.7, cz: 0, rx: 0.088 * S, rz: 0.090 * S, roll: -sign * 0.32, capLift: 0.016 * S },
          ],
          { radialSegs: R_DETAIL, tile: TILES.ARMOR_GOLD, tag: `arm_${suf}` }
        );
      }
    } else {
      const capTile = spec.id === 'kai' ? TILES.JACKET_ACCENT : TILES.JACKET_MAIN;
      acc.addLoft(
        [
          { cx: sign * shX, cy: 1.34 * S, cz: 0, rx: 0.088 * B * S, rz: 0.088 * B * S, roll: -sign * 0.25 },
          { cx: sign * (shX - 0.028 * S), cy: 1.425 * S, cz: 0, rx: 0.074 * B * S, rz: 0.076 * B * S, roll: -sign * 0.25, capLift: 0.016 * S },
        ],
        { radialSegs: R_DETAIL, tile: capTile, tag: `arm_${suf}` }
      );
      // Gold shoulder badge emblem on Kai's violet shoulder yokes (078f6bfc.png!)
      if (spec.id === 'kai') {
        acc.addLoft(
          [
            { cx: sign * (shX + 0.068 * B * S), cy: 1.355 * S, cz: 0.01 * S, rx: 0.020 * S, rz: 0.024 * S, roll: -sign * Math.PI * 0.46 },
            { cx: sign * (shX + 0.078 * B * S), cy: 1.358 * S, cz: 0.01 * S, rx: 0.016 * S, rz: 0.020 * S, roll: -sign * Math.PI * 0.46, capLift: 0.004 * S },
          ],
          { radialSegs: 8, tile: TILES.ARMOR_GOLD, tag: `arm_${suf}` }
        );
      }
    }
  }

  // Hanging Tactical Belt Straps (Kai & Jax) / Inscribed Tabard (Boryn & Kai-Jax) / Calligraphy Scroll (Borax)
  if (spec.id === 'kai') {
    // Kai's hanging white/violet tactical hip strap on viewer-left (-X) hip (078f6bfc.png!)
    acc.addSplineTube(
      [
        [-0.135 * S, 0.94 * S, 0.095 * S],
        [-0.162 * S, 0.78 * S, 0.102 * S],
        [-0.175 * S, 0.64 * S, 0.092 * S],
      ],
      () => 0.018 * S,
      { tubularSegs: 6, radialSegs: 6, tile: TILES.SASH_TABARD, tag: 'sash', flattenY: 0.28 }
    );
  } else if (spec.id === 'jax') {
    // Jax's signature double royal-blue hanging tactical belt ribbons on +X hip (078f6bfc.png!)
    for (const zOff of [0.095, 0.045]) {
      acc.addSplineTube(
        [
          [0.145 * S, 0.94 * S, zOff * S],
          [0.178 * S, 0.72 * S, (zOff + 0.01) * S],
          [0.192 * S, 0.48 * S, zOff * S],
        ],
        (t) => (1 - t * 0.22) * 0.024 * S,
        { tubularSegs: 7, radialSegs: 6, tile: TILES.SASH_TABARD, tag: 'sash', flattenY: 0.25 }
      );
    }
  } else {
    const sashTile = spec.id === 'borax' ? TILES.INNER_SHIRT : TILES.SASH_TABARD;
    const sashW = 0.088;
    const sashX = spec.id === 'borax' ? -0.075 * S : 0;
    acc.addLoft(
      [
        { cx: sashX * 1.15, cy: spec.id === 'borax' ? 0.40 * S : 0.46 * S, cz: 0.154 * B * S, rx: sashW * S, rz: 0.013 * S },
        { cx: sashX, cy: 0.70 * S, cz: 0.150 * B * S, rx: (sashW + 0.01) * S, rz: 0.013 * S },
        { cx: sashX * 0.7, cy: 0.94 * S, cz: 0.138 * B * S, rx: sashW * S, rz: 0.015 * S },
      ],
      { radialSegs: 10, tile: sashTile, tag: 'sash' }
    );
  }

  // 9. Arms (3-Ring Joint Loops + Kai's Rolled Sleeves & Furred Forearms + 4-Finger + Opposable-Thumb Clawed Hands!)
  const armTile = spec.id === 'boryn' ? TILES.FUR_PRIMARY : TILES.JACKET_MAIN;
  const sleeveBulk = spec.id === 'borax' ? 1.34 : spec.id === 'boryn' ? 1.12 : 1.04;
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    const uArm = byName.get(`upper_arm_${suf}`).worldPos;
    const fArm = byName.get(`forearm_${suf}`).worldPos;
    const hPos = byName.get(`hand_${suf}`).worldPos;

    if (spec.id === 'kai') {
      // Kai: Pushed-up white techwear sleeve to elbow + violet rolled cuff + exposed white-furred forearm + violet wrist wrap!
      acc.addLoft(
        subdivideRings(
          [
            // Violet wrist wrap
            { cx: hPos[0], cy: hPos[1] + 0.025 * S, cz: hPos[2] - 0.012 * S, rx: 0.044 * B * S, rz: 0.044 * B * S, tileOverride: TILES.JACKET_ACCENT },
            { cx: hPos[0] - sign * 0.004 * S, cy: hPos[1] + 0.085 * S, cz: hPos[2] - 0.028 * S, rx: 0.047 * B * S, rz: 0.047 * B * S, tileOverride: TILES.JACKET_ACCENT },
            // Muscular white-furred sabertooth forearm!
            { cx: (fArm[0] + hPos[0]) * 0.5, cy: (fArm[1] + hPos[1]) * 0.52, cz: (fArm[2] + hPos[2]) * 0.5, rx: 0.056 * B * S, rz: 0.056 * B * S, tileOverride: TILES.FUR_PRIMARY },
            // 3-ring elbow joint loop + rolled violet sleeve cuff
            { cx: fArm[0], cy: fArm[1] - 0.022 * S, cz: fArm[2] + 0.004 * S, rx: 0.068 * B * S, rz: 0.068 * B * S, tileOverride: TILES.JACKET_ACCENT },
            { cx: fArm[0], cy: fArm[1] + 0.022 * S, cz: fArm[2], rx: 0.072 * B * S, rz: 0.072 * B * S, tileOverride: TILES.JACKET_MAIN },
            // Baggy white techwear upper sleeve
            { cx: (uArm[0] + fArm[0]) * 0.5, cy: (uArm[1] + fArm[1]) * 0.5, cz: (uArm[2] + fArm[2]) * 0.5, rx: 0.076 * B * S, rz: 0.076 * B * S, tileOverride: TILES.JACKET_MAIN },
            { cx: uArm[0] - sign * 0.014 * S, cy: uArm[1] + 0.032 * S, cz: uArm[2], rx: 0.080 * B * S, rz: 0.080 * B * S, capLift: 0.020 * S, tileOverride: TILES.JACKET_ACCENT },
          ],
          SUB_RINGS
        ),
        { radialSegs: R_LIMB, tile: TILES.JACKET_MAIN, tag: `arm_${suf}` }
      );
    } else {
      acc.addLoft(
        subdivideRings(
          [
            {
              cx: hPos[0],
              cy: hPos[1] + 0.028 * S,
              cz: hPos[2] - 0.012 * S,
              rx: 0.048 * B * S,
              rz: 0.048 * B * S,
              tileOverride: spec.id === 'boryn' || spec.id === 'kaijax' ? TILES.ARMOR_GOLD : TILES.JACKET_ACCENT,
            },
            {
              cx: (fArm[0] + hPos[0]) * 0.5,
              cy: (fArm[1] + hPos[1]) * 0.5,
              cz: (fArm[2] + hPos[2]) * 0.5,
              rx: 0.064 * B * sleeveBulk * S,
              rz: 0.064 * B * sleeveBulk * S,
              tileOverride: spec.id === 'boryn' ? TILES.JACKET_ACCENT : armTile,
            },
            // Dedicated 3-ring elbow joint flexion loop
            { cx: fArm[0], cy: fArm[1] - 0.020 * S, cz: fArm[2] + 0.004 * S, rx: 0.064 * B * sleeveBulk * S, rz: 0.064 * B * sleeveBulk * S },
            { cx: fArm[0], cy: fArm[1] + 0.020 * S, cz: fArm[2] - 0.002 * S, rx: 0.066 * B * sleeveBulk * S, rz: 0.066 * B * sleeveBulk * S },
            { cx: (uArm[0] + fArm[0]) * 0.5, cy: (uArm[1] + fArm[1]) * 0.5, cz: (uArm[2] + fArm[2]) * 0.5, rx: 0.075 * B * S, rz: 0.075 * B * S },
            { cx: uArm[0] - sign * 0.015 * S, cy: uArm[1] + 0.034 * S, cz: uArm[2], rx: 0.082 * B * S, rz: 0.080 * B * S, capLift: 0.020 * S },
          ],
          SUB_RINGS
        ),
        { radialSegs: R_LIMB, tile: armTile, tag: `arm_${suf}` }
      );
    }

    // Anatomical Sabertooth Metacarpal Hand + 4 Curved Fingers + 1 Opposable Inner Thumb!
    const handTile = sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY;
    acc.addLoft(
      [
        { cx: hPos[0] - sign * 0.004 * S, cy: hPos[1] - 0.058 * S, cz: hPos[2] + 0.018 * S, rx: 0.042 * B * S, rz: 0.030 * B * S, capDrop: 0.010 * S },
        { cx: hPos[0], cy: hPos[1] - 0.012 * S, cz: hPos[2] + 0.006 * S, rx: 0.048 * B * S, rz: 0.036 * B * S },
        { cx: hPos[0], cy: hPos[1] + 0.032 * S, cz: hPos[2] - 0.010 * S, rx: 0.044 * B * S, rz: 0.040 * B * S },
      ],
      { radialSegs: 12, tile: handTile, tag: `hand_${suf}` }
    );

    // 4 Articulated Curved Fingers + Razor Claws
    for (let c = 0; c < 4; c++) {
      const zOff = (1.5 - c) * 0.016 * S;
      const lenF = c === 1 || c === 2 ? 1.06 : 0.92;
      acc.addSplineTube(
        [
          [hPos[0] + sign * 0.014 * S, hPos[1] - 0.054 * S, hPos[2] + 0.022 * S + zOff],
          [hPos[0] + sign * 0.012 * S, hPos[1] - 0.098 * lenF * S, hPos[2] + 0.036 * S + zOff],
          [hPos[0] - sign * 0.004 * S, hPos[1] - 0.132 * lenF * S, hPos[2] + 0.032 * S + zOff],
        ],
        (t) => (1 - t * 0.55) * 0.012 * B * S,
        { tubularSegs: 5, radialSegs: 6, tile: handTile, tag: `hand_${suf}` }
      );
      acc.addSplineTube(
        [
          [hPos[0] - sign * 0.004 * S, hPos[1] - 0.128 * lenF * S, hPos[2] + 0.032 * S + zOff],
          [hPos[0] - sign * 0.016 * S, hPos[1] - 0.154 * lenF * S, hPos[2] + 0.026 * S + zOff],
        ],
        (t) => (1 - t * 0.88) * 0.009 * S,
        { tubularSegs: 4, radialSegs: 5, tile: TILES.IVORY_FANG, tag: `hand_${suf}` }
      );
    }

    // Opposable Inner Thumb (+Z medial side) + Thumb Claw
    acc.addSplineTube(
      [
        [hPos[0] - sign * 0.022 * S, hPos[1] - 0.022 * S, hPos[2] + 0.028 * S],
        [hPos[0] - sign * 0.034 * S, hPos[1] - 0.062 * S, hPos[2] + 0.052 * S],
        [hPos[0] - sign * 0.028 * S, hPos[1] - 0.092 * S, hPos[2] + 0.058 * S],
      ],
      (t) => (1 - t * 0.65) * 0.014 * B * S,
      { tubularSegs: 5, radialSegs: 6, tile: handTile, tag: `hand_${suf}` }
    );
  }

  // 10. Tapered Streetwear Cargo Trousers + 3D Thigh Cargo Pockets + Exposed Furred Ankles (Kai) + High-Top Clawed Sneakers!
  for (const [suf, sign] of [['L', 1], ['R', -1]]) {
    const thPos = byName.get(`thigh_${suf}`).worldPos;
    const shPos = byName.get(`shin_${suf}`).worldPos;
    const ftPos = byName.get(`foot_${suf}`).worldPos;
    const ankleFurTile = sign > 0 && splitFur ? splitFur : TILES.FUR_PRIMARY;

    acc.addLoft(
      subdivideRings(
        [
          // Exposed furred ankle on Kai (matching 078f6bfc.png!), tapered cuff on others
          {
            cx: ftPos[0],
            cy: 0.195 * S,
            cz: ftPos[2],
            rx: 0.056 * B * S,
            rz: 0.058 * B * S,
            tileOverride: spec.id === 'kai' ? ankleFurTile : TILES.PANTS_CARGO,
          },
          {
            cx: ftPos[0],
            cy: 0.255 * S,
            cz: ftPos[2] + 0.004 * S,
            rx: 0.066 * B * S,
            rz: 0.068 * B * S,
            tileOverride: TILES.PANTS_CARGO,
          },
          {
            cx: shPos[0],
            cy: 0.375 * S,
            cz: shPos[2],
            rx: 0.092 * B * S,
            rz: 0.092 * B * S,
            lobe: (th) => 1 + Math.sin(th * 3) * 0.035,
          },
          // Dedicated 3-ring knee joint flexion loop
          { cx: shPos[0], cy: shPos[1] - 0.022 * S, cz: shPos[2], rx: 0.088 * B * S, rz: 0.090 * B * S },
          { cx: shPos[0], cy: shPos[1] + 0.025 * S, cz: shPos[2], rx: 0.092 * B * S, rz: 0.094 * B * S },
          { cx: (thPos[0] + shPos[0]) * 0.5, cy: 0.705 * S, cz: 0.012 * S, rx: 0.108 * B * S, rz: 0.108 * B * S },
          { cx: thPos[0] * 0.94, cy: thPos[1] + 0.045 * S, cz: 0, rx: 0.112 * B * S, rz: 0.112 * B * S, capLift: 0.018 * S },
        ],
        SUB_RINGS
      ),
      { radialSegs: R_LIMB, tile: TILES.PANTS_CARGO, tag: `leg_${suf}` }
    );

    // 3D Outer-Thigh Tactical Cargo Pocket Pouch + Beveled Flap (Kai, Jax, Kai-Jax, Boryn)
    if (spec.id !== 'borax') {
      const px = thPos[0] + sign * 0.088 * B * S;
      acc.addLoft(
        [
          { cx: px, cy: 0.58 * S, cz: 0.014 * S, rx: 0.026 * B * S, rz: 0.062 * B * S },
          { cx: px + sign * 0.006 * S, cy: 0.72 * S, cz: 0.014 * S, rx: 0.028 * B * S, rz: 0.065 * B * S },
          { cx: px + sign * 0.010 * S, cy: 0.755 * S, cz: 0.014 * S, rx: 0.031 * B * S, rz: 0.068 * B * S, capLift: 0.008 * S },
        ],
        { radialSegs: 8, tile: TILES.PANTS_CARGO, tag: `leg_${suf}` }
      );
    }

    // Kai-Jax Armored Gold-and-Obsidian Knee/Shin Greaves
    if (spec.id === 'kaijax') {
      acc.addLoft(
        [
          { cx: shPos[0], cy: 0.28 * S, cz: shPos[2] + 0.055 * S, rx: 0.056 * B * S, rz: 0.046 * B * S },
          { cx: shPos[0], cy: 0.49 * S, cz: shPos[2] + 0.074 * S, rx: 0.072 * B * S, rz: 0.056 * B * S },
          { cx: shPos[0], cy: 0.58 * S, cz: shPos[2] + 0.060 * S, rx: 0.050 * B * S, rz: 0.040 * B * S, capLift: 0.016 * S },
        ],
        { radialSegs: 8, tile: TILES.ARMOR_GOLD, tag: `leg_${suf}` }
      );
    }

    // Sculpted Multi-Panel High-Top Clawed Sneaker / Combat Boot (strictly grounded at y = 0.0!)
    acc.addLoft(
      [
        { cx: ftPos[0], cy: 0.004, cz: ftPos[2] + 0.058 * S, rx: 0.078 * B * S, rz: 0.150 * S, capDrop: 0.003 },
        { cx: ftPos[0], cy: 0.048 * S, cz: ftPos[2] + 0.055 * S, rx: 0.076 * B * S, rz: 0.146 * S },
        { cx: ftPos[0], cy: 0.118 * S, cz: ftPos[2] + 0.022 * S, rx: 0.068 * B * S, rz: 0.100 * S },
        { cx: ftPos[0], cy: 0.205 * S, cz: ftPos[2] + 0.004 * S, rx: 0.066 * B * S, rz: 0.072 * S, capLift: 0.010 * S },
      ],
      { radialSegs: R_DETAIL, tile: TILES.SNEAKER_BODY, tag: `foot_${suf}` }
    );

    // 3 Protruding Toe-Box Saber Claws on each sneaker/boot!
    for (let c = -1; c <= 1; c++) {
      const cxOff = c * 0.026 * S;
      acc.addSplineTube(
        [
          [ftPos[0] + cxOff, 0.036 * S, ftPos[2] + 0.188 * S],
          [ftPos[0] + cxOff, 0.022 * S, ftPos[2] + 0.230 * S],
          [ftPos[0] + cxOff, 0.006 * S, ftPos[2] + 0.258 * S],
        ],
        (t) => (1 - t * 0.85) * 0.014 * S,
        { tubularSegs: 5, radialSegs: 6, tile: TILES.IVORY_FANG, tag: `toe_${suf}` }
      );
    }
  }

  // 11. Kai & Kai-Jax: 4 Segmented Dorsal Spider Limbs + Gold Ball-Joint Housings + Memory-Web Silk Filaments!
  if (spiderChains.length > 0) {
    // Dorsal Arachnid Neural Hub Harness
    acc.addLoft(
      [
        { cx: 0, cy: 1.22 * S, cz: -0.148 * S, rx: 0.112 * S, rz: 0.046 * S },
        { cx: 0, cy: 1.35 * S, cz: -0.162 * S, rx: 0.132 * S, rz: 0.056 * S },
        { cx: 0, cy: 1.45 * S, cz: -0.148 * S, rx: 0.092 * S, rz: 0.040 * S, capLift: 0.010 * S },
      ],
      { radialSegs: 12, tile: TILES.ARMOR_GOLD, tag: 'torso' }
    );

    for (const sc of spiderChains) {
      const [p0, p1, p2, pTip] = sc.points;
      // Sleek blade-profile segmented chitinous arachnid limb
      acc.addSplineTube(
        [p0, p1, p2, pTip],
        (t) => {
          const taper = (1 - Math.pow(t, 1.42) * 0.90) * 0.034;
          const jointNode =
            Math.exp(-Math.pow((t - 0.33) * 18, 2)) * 0.022 +
            Math.exp(-Math.pow((t - 0.67) * 18, 2)) * 0.018;
          return (taper + jointNode) * S;
        },
        {
          tubularSegs: isMaster ? 24 : 12,
          radialSegs: isMaster ? 10 : 7,
          tile: TILES.SPIDER_CHITIN,
          tag: sc.prefix,
          flattenY: 0.76,
        }
      );

      // Dedicated Gold/Obsidian Ball-Joint Collars at p0, p1, p2 (matching 078f6bfc.png mechanical-arachnid joints!)
      if (isMaster) {
        for (const [jIdx, jp] of [p0, p1, p2].entries()) {
          const jr = (jIdx === 0 ? 0.042 : jIdx === 1 ? 0.036 : 0.030) * S;
          acc.addLoft(
            [
              { cx: jp[0], cy: jp[1] - jr * 0.7, cz: jp[2], rx: jr, rz: jr, capDrop: jr * 0.3 },
              { cx: jp[0], cy: jp[1] + jr * 0.7, cz: jp[2], rx: jr, rz: jr, capLift: jr * 0.3 },
            ],
            { radialSegs: 8, tile: TILES.ARMOR_GOLD, tag: sc.prefix }
          );
        }
        // Taut Glowing Violet Memory-Web Silk Thread spanning inner arch (p0 -> mid-tarsus) per 078f6bfc.png!
        acc.addSplineTube(
          [
            p0,
            [(p0[0] + p2[0]) * 0.52, (p0[1] + p2[1]) * 0.48, (p0[2] + p2[2]) * 0.5],
            [(p2[0] + pTip[0]) * 0.5, (p2[1] + pTip[1]) * 0.5, (p2[2] + pTip[2]) * 0.5],
          ],
          () => 0.0045 * S,
          { tubularSegs: 6, radialSegs: 5, tile: TILES.SPIDER_CHITIN, tag: sc.prefix }
        );
      }
    }
  }

  // 12. Jax & Kai-Jax: Swept-Back Roaring Cobalt-Cyan Storm-Mane Hair Cascade (7 primary bone crests + 8 layered locks!)
  for (const mc of maneChains) {
    acc.addSplineTube(
      mc.points,
      (t) => Math.sin(Math.min(0.98, t * 0.86 + 0.14) * Math.PI) * 0.072 * S,
      {
        tubularSegs: isMaster ? 14 : 8,
        radialSegs: isMaster ? 9 : 6,
        tile: TILES.STORM_MANE,
        tag: mc.name,
        flattenY: 0.58,
      }
    );
  }
  if (maneChains.length === 7) {
    // Secondary swept-back temple & nape lightning locks framing neck/shoulders without blocking ears or looking like flat paddles!
    for (let k = 0; k < 8; k++) {
      const side = k < 4 ? -1 : 1;
      const rowIdx = k % 4;
      const boneTag = side < 0 ? `mane_0${Math.min(3, rowIdx + 1)}` : `mane_0${Math.max(5, 7 - rowIdx)}`;
      const yBase = (1.66 - rowIdx * 0.055) * S;
      acc.addSplineTube(
        [
          [side * 0.135 * S, yBase, -0.02 * S],
          [side * (0.21 + rowIdx * 0.025) * S, yBase + 0.08 * S, -0.16 * S],
          [side * (0.26 + rowIdx * 0.032) * S, yBase - 0.02 * S, -0.34 * S],
          [side * (0.29 + rowIdx * 0.035) * S, yBase - 0.12 * S, -0.48 * S],
        ],
        (t) => Math.sin(Math.min(0.98, t * 0.84 + 0.16) * Math.PI) * 0.058 * S,
        {
          tubularSegs: isMaster ? 10 : 6,
          radialSegs: isMaster ? 8 : 5,
          tile: TILES.STORM_MANE,
          tag: boneTag,
          flattenY: 0.55,
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
 * Computes smooth 4-bone Hermite joint-plane skinning weights (JOINTS_0, WEIGHTS_0) for every vertex.
 * Preserves elbow, shoulder, hip, and knee volume during deep combat strikes and crouches.
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
        [idxOf('jaw'), 0.86],
        [idxOf('head'), 0.14],
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
        [idxOf('head'), 0.94],
        [idxOf('neck'), 0.06],
      ];
    } else if (tag === 'ear_L' || tag === 'ear_R') {
      candidates = [
        [idxOf(tag), 0.86],
        [idxOf('head'), 0.14],
      ];
    } else if (tag.startsWith('mane_0')) {
      const mIdx = idxOf(tag);
      const t = meta.splineT ?? 0.5;
      candidates = [
        [mIdx, Math.max(0.22, t)],
        [idxOf('head'), Math.max(0.06, 1 - t)],
      ];
    } else if (tag.startsWith('spider_')) {
      const t = meta.splineT ?? 0.5;
      const b1 = idxOf(`${tag}_01`);
      const b2 = idxOf(`${tag}_02`);
      const b3 = idxOf(`${tag}_03`);
      if (t < 0.34) {
        const k = smoothstep01(t / 0.34);
        candidates = [[b1, 1 - k * 0.48], [b2, k * 0.48]];
      } else if (t < 0.68) {
        const k = smoothstep01((t - 0.34) / 0.34);
        candidates = [[b2, 1 - k * 0.52], [b3, k * 0.52]];
      } else {
        candidates = [[b3, 0.92], [b2, 0.08]];
      }
    } else if (tag.startsWith('tail')) {
      const t = meta.splineT ?? 0.5;
      const posF = t * 3.0;
      const s0 = Math.min(3, Math.floor(posF));
      const s1 = Math.min(3, s0 + 1);
      const frac = smoothstep01(posF - s0);
      const b0 = idxOf(`${tag}_0${s0 + 1}`);
      const b1 = idxOf(`${tag}_0${s1 + 1}`);
      candidates = b0 === b1 ? [[b0, 1.0]] : [[b0, 1 - frac], [b1, frac]];
    } else if (tag === 'arm_L' || tag === 'arm_R') {
      // Hermite axial joint-plane blending across shoulder -> elbow -> wrist!
      const suf = tag.endsWith('_L') ? 'L' : 'R';
      const uY = byName.get(`upper_arm_${suf}`).worldPos[1];
      const fY = byName.get(`forearm_${suf}`).worldPos[1];
      const hY = byName.get(`hand_${suf}`).worldPos[1];
      const y = p[1];
      if (y >= fY - 0.065 * S) {
        const shBlend = smoothstep01((y - (uY - 0.04 * S)) / (0.11 * S));
        const elBlend = smoothstep01(((fY + 0.055 * S) - y) / (0.11 * S));
        const wClav = shBlend * 0.38;
        const wFore = elBlend * 0.50;
        const wUpper = Math.max(0.05, 1 - wClav - wFore);
        candidates = [
          [idxOf(`upper_arm_${suf}`), wUpper],
          [idxOf(`forearm_${suf}`), wFore],
          [idxOf(`clavicle_${suf}`), wClav],
        ];
      } else {
        const elBlend = smoothstep01((y - (fY - 0.065 * S)) / (0.12 * S));
        const wrBlend = smoothstep01(((hY + 0.045 * S) - y) / (0.09 * S));
        const wUpper = elBlend * 0.45;
        const wHand = wrBlend * 0.35;
        const wFore = Math.max(0.05, 1 - wUpper - wHand);
        candidates = [
          [idxOf(`forearm_${suf}`), wFore],
          [idxOf(`upper_arm_${suf}`), wUpper],
          [idxOf(`hand_${suf}`), wHand],
        ];
      }
    } else if (tag === 'leg_L' || tag === 'leg_R') {
      // Hermite axial joint-plane blending across pelvis/hip -> knee -> ankle!
      const suf = tag.endsWith('_L') ? 'L' : 'R';
      const thY = byName.get(`thigh_${suf}`).worldPos[1];
      const shY = byName.get(`shin_${suf}`).worldPos[1];
      const ftY = byName.get(`foot_${suf}`).worldPos[1];
      const y = p[1];
      if (y >= shY - 0.06 * S) {
        const hipBlend = smoothstep01((y - (thY - 0.05 * S)) / (0.12 * S));
        const kneeBlend = smoothstep01(((shY + 0.06 * S) - y) / (0.12 * S));
        const wPelvis = hipBlend * 0.36;
        const wShin = kneeBlend * 0.50;
        const wThigh = Math.max(0.05, 1 - wPelvis - wShin);
        candidates = [
          [idxOf(`thigh_${suf}`), wThigh],
          [idxOf(`shin_${suf}`), wShin],
          [idxOf('pelvis'), wPelvis],
        ];
      } else {
        const kneeBlend = smoothstep01((y - (shY - 0.06 * S)) / (0.12 * S));
        const ankBlend = smoothstep01(((ftY + 0.09 * S) - y) / (0.11 * S));
        const wThigh = kneeBlend * 0.45;
        const wFoot = ankBlend * 0.32;
        const wShin = Math.max(0.05, 1 - wThigh - wFoot);
        candidates = [
          [idxOf(`shin_${suf}`), wShin],
          [idxOf(`thigh_${suf}`), wThigh],
          [idxOf(`foot_${suf}`), wFoot],
        ];
      }
    } else if (tag === 'hand_L' || tag === 'hand_R') {
      const suf = tag.endsWith('_L') ? 'L' : 'R';
      candidates = [
        [idxOf(`hand_${suf}`), 0.88],
        [idxOf(`forearm_${suf}`), 0.12],
      ];
    } else if (tag === 'foot_L' || tag === 'foot_R') {
      const suf = tag.endsWith('_L') ? 'L' : 'R';
      const ftZ = byName.get(`foot_${suf}`).worldPos[2];
      const toeBlend = smoothstep01((p[2] - (ftZ + 0.08 * S)) / (0.10 * S));
      candidates = [
        [idxOf(`foot_${suf}`), 0.88 - toeBlend * 0.35],
        [idxOf(`toe_${suf}`), toeBlend * 0.35],
        [idxOf(`shin_${suf}`), 0.12],
      ];
    } else if (tag === 'toe_L' || tag === 'toe_R') {
      const suf = tag.endsWith('_L') ? 'L' : 'R';
      candidates = [
        [idxOf(`toe_${suf}`), 0.85],
        [idxOf(`foot_${suf}`), 0.15],
      ];
    } else {
      const allowedNames =
        tag === 'pelvis_hip' || tag === 'sash' || tag === 'belt'
          ? ['pelvis', 'spine_01', 'thigh_L', 'thigh_R']
          : ['pelvis', 'spine_01', 'spine_02', 'chest', 'clavicle_L', 'clavicle_R', 'neck', 'thigh_L', 'thigh_R'];

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
      deltas.blink[o + 1] = -0.030 * S;
      deltas.blink[o + 2] = 0.010 * S;
      deltas.pain[o + 1] = -0.024 * S;
      deltas.pain[o + 2] = 0.008 * S;
      deltas.focus[o] = -signX * 0.008 * S;
      deltas.focus[o + 1] = -0.014 * S;
      deltas.snarl[o] = -signX * 0.010 * S;
      deltas.snarl[o + 1] = -0.012 * S;
    } else if (tag === 'snout') {
      const frontAmt = Math.max(0, vFrac);
      deltas.snarl[o] = signX * 0.013 * S * frontAmt;
      deltas.snarl[o + 1] = 0.022 * S * frontAmt;
      deltas.snarl[o + 2] = -0.006 * S * frontAmt;

      deltas.roar[o] = signX * 0.016 * S * frontAmt;
      deltas.roar[o + 1] = 0.026 * S * frontAmt;

      deltas.pain[o + 1] = 0.010 * S * frontAmt;
      deltas.focus[o + 1] = 0.005 * S * frontAmt;
    } else if (tag === 'fang') {
      deltas.snarl[o + 1] = 0.007 * S;
      deltas.roar[o + 1] = 0.012 * S;
    } else if (tag === 'jaw') {
      const tipAmt = 0.35 + vFrac * 0.65;
      deltas.roar[o + 1] = -0.066 * S * tipAmt;
      deltas.roar[o + 2] = -0.024 * S * tipAmt;
      deltas.snarl[o + 1] = -0.022 * S * tipAmt;
      deltas.pain[o + 1] = -0.026 * S * tipAmt;
      deltas.pain[o] = 0.008 * S * tipAmt;
    } else if (tag === 'ear_L' || tag === 'ear_R') {
      const earTip = vFrac;
      deltas.pain[o + 1] = -0.032 * S * earTip;
      deltas.pain[o + 2] = -0.040 * S * earTip;
      deltas.roar[o + 2] = -0.036 * S * earTip;
      deltas.focus[o + 1] = 0.018 * S * earTip;
      deltas.focus[o + 2] = 0.015 * S * earTip;
      deltas.blink[o + 2] = -0.004 * S * earTip;
    }
  }

  return deltas;
}

/**
 * Generates all 19 required skeletal animation clips with grounded foot-plant phases,
 * snappy anticipation/impact/recovery curves that return smoothly toward idle stance at p=1.0,
 * and secondary supernatural appendage motion.
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

    const sampleCount = 13;
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
        const wave = phase * Math.PI * 2;
        const [rx, ry, rz] = isLoop && i === sampleCount - 1 ? fn(0, 0) : fn(phase, wave);
        const q = qEuler(rx, ry, rz);
        values[i * 4] = q[0];
        values[i * 4 + 1] = q[1];
        values[i * 4 + 2] = q[2];
        values[i * 4 + 3] = q[3];
      }
      tracks.push({ boneIndex: b.index, path: 'rotation', values });
    };

    const addPelvisPosTrack = (fn) => {
      const b = byName.get('pelvis');
      const values = new Float32Array(sampleCount * 3);
      for (let i = 0; i < sampleCount; i++) {
        const phase = i / (sampleCount - 1);
        const wave = phase * Math.PI * 2;
        const [dx, dy, dz] = isLoop && i === sampleCount - 1 ? fn(0, 0) : fn(phase, wave);
        values[i * 3] = pelvisRest[0] + dx * S;
        values[i * 3 + 1] = pelvisRest[1] + dy * S;
        values[i * 3 + 2] = pelvisRest[2] + dz * S;
      }
      tracks.push({ boneIndex: b.index, path: 'translation', values });
    };

    if (clipName === 'idle' || clipName === 'breathing') {
      const amp = clipName === 'breathing' ? 1.25 : 1.0;
      const combatReady = spec.id === 'kai' || spec.id === 'jax' || spec.id === 'kaijax';
      addPelvisPosTrack((_, w) => [0, Math.sin(w) * 0.016 * amp - (combatReady ? 0.02 : 0), 0]);
      addRotTrack('spine_01', (_, w) => [0.04 + Math.sin(w) * 0.025 * amp, combatReady ? 0.06 : 0, 0]);
      addRotTrack('chest', (_, w) => [0.03 - Math.sin(w) * 0.03 * amp, combatReady ? -0.05 : 0, 0]);
      addRotTrack('head', (_, w) => [Math.sin(w) * 0.02, Math.cos(w) * 0.035, 0]);
      addRotTrack('upper_arm_L', (_, w) => [0.06 + Math.sin(w) * 0.03, 0, 0.14 + Math.cos(w) * 0.02]);
      addRotTrack('upper_arm_R', (_, w) => [0.08 - Math.sin(w) * 0.03, 0, -0.14 - Math.cos(w) * 0.02]);
      addRotTrack('forearm_L', (_, w) => [-0.24 - Math.sin(w) * 0.04, 0, 0]);
      addRotTrack('forearm_R', (_, w) => [-0.28 + Math.sin(w) * 0.04, 0, 0]);
      addRotTrack('thigh_L', () => [-0.06, 0, 0.04]);
      addRotTrack('thigh_R', () => [0.04, 0, -0.04]);
      addRotTrack('shin_L', () => [0.10, 0, 0]);
      addRotTrack('shin_R', () => [0.06, 0, 0]);
      addRotTrack('ear_L', (_, w) => [Math.sin(w * 2) * 0.04, 0, 0]);
      addRotTrack('ear_R', (_, w) => [-Math.sin(w * 2) * 0.04, 0, 0]);
    } else if (clipName === 'walk' || clipName === 'run' || clipName === 'sprint') {
      const stride = clipName === 'walk' ? 0.56 : clipName === 'run' ? 0.96 : 1.24;
      const lean = clipName === 'walk' ? 0.08 : clipName === 'run' ? 0.24 : 0.40;
      const bounce = clipName === 'walk' ? 0.030 : clipName === 'run' ? 0.064 : 0.088;

      addPelvisPosTrack((_, w) => [Math.sin(w) * 0.024, Math.abs(Math.cos(w)) * bounce - bounce * 0.48, 0]);
      addRotTrack('pelvis', (_, w) => [0, Math.sin(w) * 0.12 * stride, Math.cos(w) * 0.045]);
      addRotTrack('spine_01', (_, w) => [lean * 0.55 + Math.abs(Math.cos(w)) * 0.04, -Math.sin(w) * 0.16 * stride, 0]);
      addRotTrack('chest', (_, w) => [lean * 0.48, -Math.sin(w) * 0.20 * stride, 0]);
      addRotTrack('head', (_, w) => [-lean * 0.62, Math.sin(w) * 0.08, 0]);

      addRotTrack('thigh_L', (_, w) => [-Math.sin(w) * stride, 0, 0.03]);
      addRotTrack('thigh_R', (_, w) => [Math.sin(w) * stride, 0, -0.03]);
      addRotTrack('shin_L', (_, w) => [Math.max(0.06, Math.cos(w) * 0.85 * stride + 0.26 * stride), 0, 0]);
      addRotTrack('shin_R', (_, w) => [Math.max(0.06, -Math.cos(w) * 0.85 * stride + 0.26 * stride), 0, 0]);
      addRotTrack('foot_L', (_, w) => [Math.sin(w) * 0.34 * stride - 0.08, 0, 0]);
      addRotTrack('foot_R', (_, w) => [-Math.sin(w) * 0.34 * stride - 0.08, 0, 0]);

      addRotTrack('upper_arm_L', (_, w) => [Math.sin(w) * stride * 0.85 + 0.08, 0, 0.16]);
      addRotTrack('upper_arm_R', (_, w) => [-Math.sin(w) * stride * 0.85 + 0.08, 0, -0.16]);
      addRotTrack('forearm_L', (_, w) => [-0.46 - Math.max(0, -Math.sin(w)) * 0.44, 0, 0]);
      addRotTrack('forearm_R', (_, w) => [-0.46 - Math.max(0, Math.sin(w)) * 0.44, 0, 0]);
    } else if (clipName === 'jump') {
      addPelvisPosTrack((p) => [0, Math.sin(p * Math.PI) * 0.24, 0]);
      addRotTrack('spine_01', (p) => [0.22 - p * 0.32, 0, 0]);
      addRotTrack('thigh_L', (p) => [-0.88 * Math.sin(p * Math.PI * 0.85), 0, 0.08]);
      addRotTrack('thigh_R', (p) => [-0.46 * Math.sin(p * Math.PI * 0.85), 0, -0.08]);
      addRotTrack('shin_L', (p) => [1.08 * Math.sin(p * Math.PI * 0.85), 0, 0]);
      addRotTrack('shin_R', (p) => [0.64 * Math.sin(p * Math.PI * 0.85), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [-0.95 * Math.sin(p * Math.PI * 0.9), 0, 0.36]);
      addRotTrack('upper_arm_R', (p) => [-0.95 * Math.sin(p * Math.PI * 0.9), 0, -0.36]);
    } else if (clipName === 'fall') {
      addPelvisPosTrack((_, w) => [0, Math.sin(w) * 0.025, 0]);
      addRotTrack('spine_01', () => [0.18, 0, 0]);
      addRotTrack('thigh_L', (_, w) => [-0.52 + Math.sin(w) * 0.06, 0, 0.12]);
      addRotTrack('thigh_R', (_, w) => [-0.28 - Math.sin(w) * 0.06, 0, -0.12]);
      addRotTrack('shin_L', () => [0.86, 0, 0]);
      addRotTrack('shin_R', () => [0.46, 0, 0]);
      addRotTrack('upper_arm_L', (_, w) => [-0.52 + Math.sin(w) * 0.1, 0, 0.44]);
      addRotTrack('upper_arm_R', (_, w) => [-0.52 - Math.sin(w) * 0.1, 0, -0.44]);
      addRotTrack('forearm_L', () => [-0.58, 0, 0]);
      addRotTrack('forearm_R', () => [-0.58, 0, 0]);
    } else if (clipName === 'landing') {
      const squash = (p) => Math.sin(Math.pow(p, 0.65) * Math.PI);
      addPelvisPosTrack((p) => [0, -squash(p) * 0.20, 0.04 * squash(p)]);
      addRotTrack('spine_01', (p) => [squash(p) * 0.38, 0, 0]);
      addRotTrack('head', (p) => [-squash(p) * 0.22, 0, 0]);
      addRotTrack('thigh_L', (p) => [-squash(p) * 0.66, 0, 0.10]);
      addRotTrack('thigh_R', (p) => [-squash(p) * 0.66, 0, -0.10]);
      addRotTrack('shin_L', (p) => [squash(p) * 0.90, 0, 0]);
      addRotTrack('shin_R', (p) => [squash(p) * 0.90, 0, 0]);
      addRotTrack('upper_arm_L', (p) => [squash(p) * 0.48, 0, 0.34]);
      addRotTrack('upper_arm_R', (p) => [squash(p) * 0.48, 0, -0.34]);
    } else if (clipName === 'dodge') {
      const env = (p) => Math.sin(p * Math.PI);
      addPelvisPosTrack((p) => [0, -env(p) * 0.24, env(p) * 0.16]);
      addRotTrack('spine_01', (p) => [env(p) * 0.58, Math.sin(p * Math.PI * 2) * 0.36, 0]);
      addRotTrack('head', (p) => [-env(p) * 0.28, 0, 0]);
      addRotTrack('thigh_L', (p) => [-env(p) * 0.68, 0, 0.12]);
      addRotTrack('thigh_R', (p) => [env(p) * 0.36, 0, -0.12]);
      addRotTrack('shin_L', (p) => [env(p) * 0.76, 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.54 * env(p), 0, 0.46]);
      addRotTrack('upper_arm_R', (p) => [0.54 * env(p), 0, -0.46]);
    } else if (clipName === 'attack_1' || clipName === 'attack_2' || clipName === 'attack_3' || clipName === 'heavy_strike') {
      const isLeft = clipName === 'attack_2';
      const isHeavy = clipName === 'heavy_strike' || clipName === 'attack_3';
      // Crisp martial-arts curve: windup (0..0.20) -> snap impact (0.38) -> smooth recovery to combat neutral at p=1.0!
      const snap = (p) =>
        p < 0.18
          ? -0.32 * (p / 0.18)
          : Math.sin(((p - 0.18) / 0.82) * Math.PI);
      const env = (p) => Math.sin(Math.pow(p, 0.72) * Math.PI);

      addPelvisPosTrack((p) => [
        0,
        -Math.max(0, snap(p)) * (isHeavy ? 0.15 : 0.08),
        snap(p) * (isHeavy ? 0.20 : 0.14),
      ]);
      addRotTrack('spine_01', (p) => [
        0.04 + snap(p) * (isHeavy ? 0.40 : 0.25),
        (isLeft ? -1 : 1) * snap(p) * 0.62,
        0,
      ]);
      addRotTrack('chest', (p) => [0.06 * env(p), (isLeft ? -1 : 1) * snap(p) * 0.48, 0]);
      addRotTrack('jaw', (p) => [Math.max(0, snap(p)) * 0.36, 0, 0]);

      if (isHeavy) {
        addRotTrack('upper_arm_R', (p) => [0.08 + (-2.15 + Math.pow(p, 0.68) * 2.85) * env(p), -0.22 * env(p), -0.18]);
        addRotTrack('upper_arm_L', (p) => [0.06 + (-1.88 + Math.pow(p, 0.68) * 2.48) * env(p), 0.22 * env(p), 0.18]);
        addRotTrack('forearm_R', (p) => [-0.28 - 0.56 * (1 - p) * env(p), 0, 0]);
        addRotTrack('forearm_L', (p) => [-0.24 - 0.56 * (1 - p) * env(p), 0, 0]);
      } else if (isLeft) {
        addRotTrack('upper_arm_L', (p) => [0.06 + (-1.42 + Math.max(0, snap(p)) * 1.74) * env(p), -0.46 * snap(p), 0.22]);
        addRotTrack('forearm_L', (p) => [-0.24 - 0.62 * (1 - Math.max(0, snap(p))) * env(p), 0, 0]);
        addRotTrack('upper_arm_R', (p) => [0.08 + 0.28 * env(p), 0, -0.22]);
      } else {
        addRotTrack('upper_arm_R', (p) => [0.08 + (-1.42 + Math.max(0, snap(p)) * 1.74) * env(p), 0.46 * snap(p), -0.22]);
        addRotTrack('forearm_R', (p) => [-0.28 - 0.62 * (1 - Math.max(0, snap(p))) * env(p), 0, 0]);
        addRotTrack('upper_arm_L', (p) => [0.06 + 0.28 * env(p), 0, 0.22]);
      }
      addRotTrack('thigh_L', (p) => [-0.06 - 0.38 * Math.max(0, snap(p)), 0, 0.08]);
      addRotTrack('thigh_R', (p) => [0.04 + 0.30 * Math.max(0, snap(p)), 0, -0.08]);
      addRotTrack('shin_L', (p) => [0.10 + 0.48 * Math.max(0, snap(p)), 0, 0]);
    } else if (clipName === 'parry') {
      const guard = (p) => Math.sin(Math.pow(p, 0.6) * Math.PI);
      addPelvisPosTrack((p) => [0, -0.11 * guard(p), -0.06 * guard(p)]);
      addRotTrack('chest', (p) => [0.10 * guard(p), -0.36 * guard(p), 0]);
      addRotTrack('upper_arm_L', (p) => [-1.18 * guard(p), -0.54 * guard(p), 0.22]);
      addRotTrack('upper_arm_R', (p) => [-1.08 * guard(p), 0.54 * guard(p), -0.22]);
      addRotTrack('forearm_L', (p) => [-0.24 - 0.86 * guard(p), 0, 0]);
      addRotTrack('forearm_R', (p) => [-0.28 - 0.82 * guard(p), 0, 0]);
    } else if (clipName === 'hit_reaction') {
      const jolt = (p) => Math.sin(Math.pow(p, 0.55) * Math.PI);
      addPelvisPosTrack((p) => [0, -0.06 * jolt(p), -0.16 * jolt(p)]);
      addRotTrack('spine_01', (p) => [-0.38 * jolt(p), 0.20 * jolt(p), 0]);
      addRotTrack('head', (p) => [-0.44 * jolt(p), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [0.36 * jolt(p), 0, 0.44]);
      addRotTrack('upper_arm_R', (p) => [0.36 * jolt(p), 0, -0.44]);
    } else if (clipName === 'roar' || clipName === 'ability_cast') {
      const env = (p) => Math.sin(p * Math.PI);
      addPelvisPosTrack((p) => [0, -0.09 * env(p), 0]);
      addRotTrack('spine_01', (p) => [-0.26 * env(p), 0, 0]);
      addRotTrack('chest', (p) => [-0.22 * env(p), 0, 0]);
      addRotTrack('head', (p) => [-0.32 * env(p), 0, 0]);
      addRotTrack('jaw', (p) => [0.54 * env(p), 0, 0]);
      addRotTrack('upper_arm_L', (p) => [-0.86 * env(p), 0, 0.64 * env(p) + 0.14]);
      addRotTrack('upper_arm_R', (p) => [-0.86 * env(p), 0, -0.64 * env(p) - 0.14]);
      addRotTrack('forearm_L', (p) => [-0.24 - 0.24 * env(p), 0, 0]);
      addRotTrack('forearm_R', (p) => [-0.28 - 0.20 * env(p), 0, 0]);
    } else if (clipName === 'victory') {
      addPelvisPosTrack((_, w) => [0, Math.sin(w) * 0.025, 0]);
      addRotTrack('chest', (_, w) => [-0.14, Math.sin(w) * 0.08, 0]);
      addRotTrack('head', (_, w) => [-0.08, Math.sin(w) * 0.1, 0]);
      addRotTrack('upper_arm_R', (_, w) => [-2.22 + Math.sin(w) * 0.08, 0, -0.30]);
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
        ? 2.1
        : clipName === 'sprint' || clipName === 'run'
          ? 1.5
          : 1.0;

    for (const b of bones) {
      if (b.name.startsWith('spider_')) {
        const phaseOff = b.index * 0.85;
        const sign = b.name.includes('_UL_') || b.name.includes('_LL_') ? 1 : -1;
        addRotTrack(b.name, (_, w) => [
          Math.sin(w + phaseOff) * 0.11 * energyBoost,
          Math.cos(w + phaseOff) * 0.09 * energyBoost,
          sign * Math.sin(w + phaseOff * 0.7) * 0.07 * energyBoost,
        ]);
      } else if (b.name.startsWith('mane_0')) {
        const idx = Number(b.name.slice(-1));
        addRotTrack(b.name, (_, w) => [
          Math.sin(w * 2 + idx * 0.6) * 0.08 * energyBoost,
          Math.cos(w + idx * 0.5) * 0.05 * energyBoost,
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
      normalTexture: { index: 2, scale: 0.88 },
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
      generator: 'Kai-Jax Beast Gods Production Rig Compiler v3.0 (P1-G Mastered)',
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
console.log('Beast Gods P1-G Mastered Production GLB Build Complete.');
