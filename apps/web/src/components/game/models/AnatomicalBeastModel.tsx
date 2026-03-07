/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Fighter } from "../../../lib/characters";
import { COMPLETE_BEAST_ROSTER } from "../../../data/beastRoster";
import type { BeastPresetKind } from "../../../lib/stores/useBeastPreset";
import { getDesignForFighterId } from "../../../data/characterDesigns";

function fract(x: number): number {
  return x - Math.floor(x);
}

function hash3(x: number, y: number, z: number, seed: number): number {
  // Deterministic pseudo-random in [0,1)
  return fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 19.19) * 43758.5453123);
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise3(x: number, y: number, z: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;

  const u = smoothstep(xf);
  const v = smoothstep(yf);
  const w = smoothstep(zf);

  const n000 = hash3(xi, yi, zi, seed);
  const n100 = hash3(xi + 1, yi, zi, seed);
  const n010 = hash3(xi, yi + 1, zi, seed);
  const n110 = hash3(xi + 1, yi + 1, zi, seed);
  const n001 = hash3(xi, yi, zi + 1, seed);
  const n101 = hash3(xi + 1, yi, zi + 1, seed);
  const n011 = hash3(xi, yi + 1, zi + 1, seed);
  const n111 = hash3(xi + 1, yi + 1, zi + 1, seed);

  const x00 = n000 * (1 - u) + n100 * u;
  const x10 = n010 * (1 - u) + n110 * u;
  const x01 = n001 * (1 - u) + n101 * u;
  const x11 = n011 * (1 - u) + n111 * u;

  const y0 = x00 * (1 - v) + x10 * v;
  const y1 = x01 * (1 - v) + x11 * v;

  return y0 * (1 - w) + y1 * w;
}

function displaceGeometry(
  base: THREE.BufferGeometry,
  seed: number,
  opts: { amp: number; freq: number; normalPush?: number; clamp?: number }
): THREE.BufferGeometry {
  const { amp, freq, normalPush = 1, clamp = 0.25 } = opts;
  const g = base.clone();
  g.computeVertexNormals();

  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const nrm = g.getAttribute("normal") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nrm, i);
    const nn = valueNoise3(v.x * freq, v.y * freq, v.z * freq, seed) * 2 - 1; // [-1,1]
    const d = THREE.MathUtils.clamp(nn * amp, -clamp, clamp) * normalPush;
    v.addScaledVector(n, d);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

function warpGeometry(
  base: THREE.BufferGeometry,
  warp: (v: THREE.Vector3) => void
): THREE.BufferGeometry {
  const g = base.clone();
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    warp(v);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

function makeNoiseTexture(seed: number, size = 128, octaves = 4): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const img = ctx.createImageData(size, size);
  const data = img.data;

  // cheap fractal noise (deterministic enough for style)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let n = 0;
      let amp = 1;
      let freq = 1;
      let norm = 0;
      for (let o = 0; o < octaves; o++) {
        const nx = (x / size) * freq;
        const ny = (y / size) * freq;
        n += (valueNoise3(nx * 8, ny * 8, 0.25, seed + o * 17) * 2 - 1) * amp;
        norm += amp;
        amp *= 0.5;
        freq *= 2;
      }
      n = n / Math.max(0.0001, norm);
      const v = Math.floor((n * 0.5 + 0.5) * 255);
      const i = (y * size + x) * 4;
      data[i + 0] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function makeClothWeaveTexture(seed: number, size = 128): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "rgb(128,128,128)";
  ctx.fillRect(0, 0, size, size);

  // weave lines
  for (let i = 0; i < size; i += 4) {
    const v = 110 + Math.floor(valueNoise3(i * 0.12, 1.7, 0.4, seed) * 70);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(i, 0, 1, size);
  }
  for (let j = 0; j < size; j += 4) {
    const v = 110 + Math.floor(valueNoise3(2.3, j * 0.12, 0.8, seed + 99) * 70);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, j, size, 1);
  }

  // subtle grit
  const img = ctx.getImageData(0, 0, size, size);
  const data = img.data;
  for (let p = 0; p < data.length; p += 4) {
    const g = (valueNoise3((p % (size * 4)) * 0.01, Math.floor(p / (size * 4)) * 0.01, 0.3, seed + 131) * 2 - 1) * 18;
    const base = data[p] ?? 128;
    const v = THREE.MathUtils.clamp(base + g, 0, 255);
    data[p] = v;
    data[p + 1] = v;
    data[p + 2] = v;
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** LOD by layer: 0=close (all on), 1=mid (aura off), 2=far (fur shell off), 3=very far (base + emissive only) */
export type CharacterLODLevel = 0 | 1 | 2 | 3;

export interface AnatomicalBeastModelProps {
  fighter: Fighter;
  bodyRef: RefObject<THREE.Group>;
  headRef: RefObject<THREE.Group>;
  leftArmRef: RefObject<THREE.Group>;
  rightArmRef: RefObject<THREE.Group>;
  leftLegRef: RefObject<THREE.Group>;
  rightLegRef: RefObject<THREE.Group>;
  emotionIntensity: number;
  hitAnim: number;
  animTime: number;
  isAttacking: boolean;
  isInvulnerable: boolean;
  isMoving?: boolean;
  /**
   * Forces an “animal preset” look regardless of roster hybrid text.
   * Use `undefined`/`null` to let roster drive it (“auto”).
   */
  presetOverride?: Exclude<BeastPresetKind, "auto"> | null;
  /** LOD level: 0=close, 1=mid, 2=far, 3=very far. Gates layers per character_renderer_spec. */
  lodLevel?: CharacterLODLevel;
  attackType?: 'punch' | 'kick' | 'special' | 'ultimate' | null;
  velocityX?: number;
  velocityY?: number;
  isGrounded?: boolean;
  isJumping?: boolean;
}

/**
 * AnatomicalBeastModel
 * Goal: “actual animals fighting” (snout/jaw/ears, digitigrade legs, paws/claws),
 * driven by `COMPLETE_BEAST_ROSTER` hybrid + features.
 */
export default function AnatomicalBeastModel({
  fighter,
  bodyRef,
  headRef,
  leftArmRef,
  rightArmRef,
  leftLegRef,
  rightLegRef,
  emotionIntensity,
  hitAnim,
  animTime,
  isAttacking,
  isInvulnerable,
  isMoving = false,
  presetOverride = null,
  lodLevel = 0,
  attackType = null,
  velocityX = 0,
  velocityY = 0,
  isGrounded = true,
  isJumping = false,
}: AnatomicalBeastModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const landSquash = useRef<number>(0);
  const wasGrounded = useRef<boolean>(true);

  /** Layer visibility per character_renderer_spec: aura off at mid+, fur/veins/tail off at very far */
  const _showAuraLayer = lodLevel === 0;
  const showFurShellLayer = lodLevel < 3;
  const showVeinLayer = lodLevel < 3;
  const _showElementalTailLayer = lodLevel < 3;
  void _showAuraLayer;
  void _showElementalTailLayer;
  const nebulaRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const auraWingRef = useRef<THREE.Group>(null);
  const auraRibbonRef = useRef<THREE.Group>(null);

  const seed = useMemo(() => {
    // stable numeric seed from id
    let s = 0;
    for (let i = 0; i < fighter.id.length; i++) s = (s * 31 + fighter.id.charCodeAt(i)) >>> 0;
    return s % 10000;
  }, [fighter.id]);

  const beast = useMemo(
    () => COMPLETE_BEAST_ROSTER.find((b) => b.id === fighter.id) || null,
    [fighter.id]
  );

  const design = useMemo(() => getDesignForFighterId(fighter.id), [fighter.id]);

  const primary = design?.primaryColor ?? beast?.visual.primaryColor ?? fighter.color ?? "#1a1a1a";
  const accent = design?.accentColor ?? beast?.visual.accentColor ?? fighter.accentColor ?? "#00f2ff";
  const features = beast?.visual.features ?? [];
  const hybrid = beast?.beastHybrid ?? "";
  const featureKey = features.join("|");
  const webbingColor = design?.webbingColor ?? null;

  const has = (k: string) => features.some((f) => f === k || f.includes(k));
  const hasWord = (re: RegExp) => features.some((f) => re.test(f));

  const rosterKind = useMemo(() => {
    const isFox = /fox|kitsune/i.test(hybrid);
    const isWolf = /wolf|lupine/i.test(hybrid) && !isFox;
    const kind: Exclude<BeastPresetKind, "auto"> =
      /dragon|drake/i.test(hybrid) ? "dragon"
      : /bird|avian|hawk|eagle|falcon/i.test(hybrid) || has("eagle_head") ? "bird"
      : /reptile|lizard|snake|serpent|croc|alligator/i.test(hybrid) || has("serpent_body") ? "reptile"
      : /spider|arachnid/i.test(hybrid) ? "spider"
      : isWolf ? "wolf"
      : isFox ? "fox"
      : "wolf"; // fallback feels more “animal” than default humanoid
    return kind;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hybrid, featureKey]);

  const kind: Exclude<BeastPresetKind, "auto"> = (presetOverride ?? rosterKind) as Exclude<BeastPresetKind, "auto">;

  const isWolf = kind === "wolf";
  const isFox = kind === "fox";
  const isCat = kind === "cat";
  const isBoar = kind === "boar";
  const isTurtle = kind === "turtle";
  const isDragon = kind === "dragon";
  const isBird = kind === "bird";
  const isReptile = kind === "reptile" || isTurtle;
  const isSpider = kind === "spider";
  const isFrog = /frog|toad|amphib/i.test(hybrid); // only roster-driven for now

  const isCanine = isWolf || isFox || isCat || isBoar;

  const hasWings = hasWord(/wing/i) || isBird || isDragon || has("massive_wings");
  const hasHorns = hasWord(/horn/i) || isDragon || /bull|ram/i.test(hybrid);
  const hasSpines = hasWord(/spine|quill|spike/i) || isSpider || isDragon || has("electric_quills");
  const hasTails = hasWord(/tail/i) || isCanine || isDragon;

  const hasTacticalJacket = has("tactical_jacket") || hasWord(/jacket/i);
  const hasChaseBadge = has("chase_badge") || hasWord(/badge/i);
  const hasWebGear = has("web_equipment") || hasWord(/web/i);
  const hasTwinMechTails = has("two_mechanical_tails") || hasWord(/mechanical.*tail/i);

  const hasElectricAura = has("electric_aura") || has("lightning_aura") || hasWord(/electric|lightning/i);
  const hasInternalNebulae = has("internal_nebulae");
  const hasThreeMemoryTails = has("three_memory_tails");
  const hasSageEyes = has("sage_mode_eyes");

  const quillCount = has("seven_electric_quills") ? 7 : hasSpines ? 6 : 0;
  const eyeColor = design?.eyeColors?.[0] ?? (hasSageEyes ? "#FFD700" : has("feral_amber_eyes") ? "#FFB000" : accent);

  const furColor = design?.features?.includes("charcoal_fur") || has("charcoal_fur") ? "#1a1a1a" : primary;
  const clothColor = hasTacticalJacket ? "#0b1020" : primary;
  // Keep “hero jacket/armor” ONLY for heroes / explicit jacket DNA.
  // Applying it to all wolves/foxes makes everyone read like blocky robot armor.
  const hasCinematicJacket =
    !(design?.features?.includes("no_clothes")) &&
    (hasTacticalJacket || fighter.id === "jaxon" || fighter.id === "kaison");

  // Chest “fusion core” glow can read too bright / toy-like in this procedural pass.
  // Keeping it off for now to reduce “glowy robot” feel.
  const hasFusionCore = false;

  // Big aura ribbons/wings like the fused image.
  const hasAuraWings = fighter.id === "kai-jax" || hasThreeMemoryTails || hasInternalNebulae;

  const stats = fighter.baseStats ?? { power: 82, speed: 82, defense: 82, gravity: 9.8 };

  const silhouette = useMemo(() => {
    // Normalize 60..100 → 0..1
    const n = (v: number) => THREE.MathUtils.clamp((v - 60) / 40, 0, 1);
    const bulk = n((stats.power + stats.defense) * 0.5); // 0..1
    const agile = n(stats.speed); // 0..1

    const lerp = THREE.MathUtils.lerp;

    // Base (biped beast), then kind tweaks.
    // Aim: slimmer torso, less “square barrel”, more V/triangular silhouette.
    let torsoW = lerp(0.98, 1.16, bulk) * lerp(1.04, 0.90, agile);
    let torsoH = lerp(1.02, 1.16, bulk) * lerp(1.01, 1.10, agile);
    let torsoD = lerp(0.86, 1.04, bulk);

    let hipW = lerp(0.86, 1.02, bulk) * lerp(1.02, 0.88, agile);
    let hipH = lerp(0.94, 1.06, bulk) * lerp(1.00, 1.04, agile);
    let hipD = lerp(0.88, 1.06, bulk);

    let head = lerp(0.96, 1.10, bulk) * lerp(1.05, 0.95, agile);
    // Longer limbs helps kill the “rolly-polly robot” read.
    let limbLen = (lerp(0.98, 1.10, bulk) * lerp(1.08, 1.26, agile)) * 1.12;
    let limbRad = lerp(0.86, 1.18, bulk) * lerp(1.00, 0.86, agile);
    let paw = lerp(0.94, 1.16, bulk);

    let tailLen = lerp(0.95, 1.05, bulk) * lerp(1.05, 1.15, agile);
    let tailRad = lerp(0.92, 1.15, bulk);

    let spineScale = lerp(0.85, 1.15, bulk) * lerp(1.0, 1.12, agile);

    if (isBird) {
      // Birds: keel chest + slimmer hips + longer legs/arms see “avian”, not “robot barrel”
      torsoW *= 0.92;
      torsoD *= 0.88;
      torsoH *= 1.05;
      hipW *= 0.90;
      hipD *= 0.90;
      head *= 0.92;
      limbLen *= 1.10;
      limbRad *= 0.88;
      tailLen *= 0.85;
    }

    if (isDragon) {
      // Dragons: longer body/depth + heavier tail base; keep head a bit larger.
      torsoD *= 1.14;
      torsoW *= 1.06;
      hipD *= 1.12;
      head *= 1.08;
      tailLen *= 1.20;
      tailRad *= 1.12;
      limbRad *= 1.02;
    }

    if (isReptile && !isDragon) {
      torsoD *= 1.10;
      hipD *= 1.08;
      head *= 1.02;
      tailLen *= 1.18;
      tailRad *= 1.08;
    }

    if (isBoar) {
      // Boar: bulk forward + bigger hips
      torsoW *= 1.10;
      torsoD *= 1.18;
      hipW *= 1.12;
      hipD *= 1.12;
      head *= 1.06;
      paw *= 1.10;
      limbRad *= 1.12;
    }

    if (isSpider) {
      // Spider: lower profile, more compact torso, thinner arms/legs (extra legs do the identity)
      torsoW *= 0.95;
      torsoH *= 0.92;
      torsoD *= 1.02;
      hipW *= 0.95;
      hipH *= 0.90;
      head *= 0.92;
      limbRad *= 0.86;
      tailLen *= 0.80;
      spineScale *= 0.90;
    }

    if (isTurtle) {
      torsoW *= 1.05;
      torsoH *= 0.92;
      torsoD *= 1.20;
      hipW *= 1.05;
      hipH *= 0.90;
      hipD *= 1.18;
      head *= 0.92;
      limbLen *= 0.88;
      limbRad *= 1.05;
      tailLen *= 0.70;
    }

    return {
      torsoW,
      torsoH,
      torsoD,
      hipW,
      hipH,
      hipD,
      head,
      limbLen,
      limbRad,
      paw,
      tailLen,
      tailRad,
      spineScale,
    };
  }, [isBird, isBoar, isDragon, isReptile, isSpider, isTurtle, stats.defense, stats.power, stats.speed]);

  const jacketMain = useMemo(() => {
    // Give Jaxon/Kaison a clear “blue/red jacket” vibe like the reference images
    if (fighter.id === "jaxon") return "#0b4dd8";
    if (fighter.id === "kaison") return "#b1121a";
    return THREE.Color.NAMES ? clothColor : clothColor;
  }, [clothColor, fighter.id]);

  const jacketTrim = useMemo(() => {
    if (fighter.id === "jaxon") return "#4fd2ff";
    if (fighter.id === "kaison") return "#ffb000";
    return accent;
  }, [accent, fighter.id]);

  const preset = useMemo(() => {
    const k = kind;

    const base = {
      skull: { sx: 1.0, sy: 0.95, sz: 1.1, amp: 0.06, freq: 2.6 },
      muzzle: { len: 1.0, amp: 0.05, freq: 3.2 },
      ear: { h: 1.0, w: 1.0, amp: 0.04, freq: 3.0 },
      body: { chestAmp: 0.06, hipAmp: 0.05, freq: 2.2 },
      material: { roughness: 0.82, metalness: 0.08 },
    };

    if (k === "wolf") return { kind: k, ...base, muzzle: { len: 1.3, amp: 0.055, freq: 3.2 }, ear: { h: 1.05, w: 1.0, amp: 0.04, freq: 3.0 } };
    if (k === "fox") return { kind: k, ...base, skull: { sx: 0.95, sy: 0.94, sz: 1.2, amp: 0.055, freq: 2.8 }, muzzle: { len: 1.15, amp: 0.05, freq: 3.6 }, ear: { h: 1.25, w: 0.95, amp: 0.04, freq: 3.2 } };
    if (k === "cat") return { kind: k, ...base, skull: { sx: 1.05, sy: 0.96, sz: 1.05, amp: 0.05, freq: 3.2 }, muzzle: { len: 0.82, amp: 0.045, freq: 3.8 }, ear: { h: 0.95, w: 0.95, amp: 0.035, freq: 3.2 } };
    if (k === "boar") return { kind: k, ...base, skull: { sx: 1.15, sy: 1.02, sz: 1.2, amp: 0.065, freq: 2.4 }, muzzle: { len: 0.95, amp: 0.055, freq: 3.0 }, ear: { h: 0.75, w: 0.95, amp: 0.03, freq: 3.0 }, material: { roughness: 0.78, metalness: 0.10 } };
    if (k === "turtle") return { kind: k, ...base, skull: { sx: 0.98, sy: 0.9, sz: 1.08, amp: 0.05, freq: 2.8 }, muzzle: { len: 0.7, amp: 0.04, freq: 3.0 }, ear: { h: 0.2, w: 0.2, amp: 0.0, freq: 1.0 }, material: { roughness: 0.58, metalness: 0.16 } };
    // Keep dragons/reptiles organic (too much metal reads “robot”)
    if (k === "dragon") return { kind: k, ...base, skull: { sx: 1.1, sy: 1.0, sz: 1.28, amp: 0.075, freq: 2.2 }, muzzle: { len: 1.2, amp: 0.06, freq: 2.6 }, material: { roughness: 0.62, metalness: 0.06 } };
    if (k === "bird") return { kind: k, ...base, skull: { sx: 0.95, sy: 0.9, sz: 1.05, amp: 0.05, freq: 3.0 }, material: { roughness: 0.7, metalness: 0.1 } };
    if (k === "reptile") return { kind: k, ...base, skull: { sx: 1.05, sy: 0.9, sz: 1.28, amp: 0.06, freq: 2.4 }, material: { roughness: 0.66, metalness: 0.05 } };
    if (k === "spider") return { kind: k, ...base, skull: { sx: 1.0, sy: 0.9, sz: 1.15, amp: 0.06, freq: 3.4 }, material: { roughness: 0.48, metalness: 0.10 } };
    return { kind: k, ...base };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureKey, kind]);

  const chestGeo = useMemo(() => {
    const base = new THREE.CapsuleGeometry(0.20, 0.22, 8, 16);
    base.scale(1.05 * silhouette.torsoW, 1.12 * silhouette.torsoH, 0.95 * silhouette.torsoD);
    // Keel hint for birds
    const warped = isBird
      ? warpGeometry(base, (v) => {
          const keel = Math.exp(-Math.abs(v.x) * 7.0) * 0.04;
          v.z += keel * (v.y > 0 ? 1.0 : 0.6);
        })
      : base;
    return displaceGeometry(warped, seed + 11, { amp: preset.body.chestAmp, freq: preset.body.freq, normalPush: 1.0 });
  }, [isBird, seed, preset.body.chestAmp, preset.body.freq, silhouette.torsoD, silhouette.torsoH, silhouette.torsoW]);

  const hipGeo = useMemo(() => {
    const base = new THREE.CapsuleGeometry(0.16, 0.18, 8, 16);
    base.scale(1.02 * silhouette.hipW, 1.02 * silhouette.hipH, 1.05 * silhouette.hipD);
    return displaceGeometry(base, seed + 29, { amp: preset.body.hipAmp, freq: preset.body.freq, normalPush: 1.0 });
  }, [seed, preset.body.hipAmp, preset.body.freq, silhouette.hipD, silhouette.hipH, silhouette.hipW]);

  const skullGeo = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(0.22, 4);
    base.scale(preset.skull.sx * silhouette.head, preset.skull.sy * silhouette.head, preset.skull.sz * silhouette.head);
    return displaceGeometry(base, seed + 101, { amp: preset.skull.amp, freq: preset.skull.freq, normalPush: 1.0 });
  }, [seed, preset.skull.amp, preset.skull.freq, preset.skull.sx, preset.skull.sy, preset.skull.sz, silhouette.head]);

  const muzzleGeo = useMemo(() => {
    const base = new THREE.CapsuleGeometry(0.06, 0.16, 6, 12);
    base.scale(0.9, 0.9, preset.muzzle.len);
    return displaceGeometry(base, seed + 203, { amp: preset.muzzle.amp, freq: preset.muzzle.freq, normalPush: 1.0 });
  }, [seed, preset.muzzle.amp, preset.muzzle.freq, preset.muzzle.len]);

  const jawGeo = useMemo(() => {
    const base = new THREE.CapsuleGeometry(0.04, 0.10, 6, 12);
    base.scale(1.0, 0.55, 1.4);
    return displaceGeometry(base, seed + 211, { amp: 0.03, freq: 3.2, normalPush: 1.0 });
  }, [seed]);

  const earGeo = useMemo(() => {
    // higher segment count + displacement removes “cone ear” feel
    const base = new THREE.ConeGeometry(0.065, 0.24, 18, 6);
    base.translate(0, 0.11, 0);
    base.scale(preset.ear.w, preset.ear.h, 1.0);
    return displaceGeometry(base, seed + 307, { amp: preset.ear.amp, freq: preset.ear.freq, normalPush: 0.9 });
  }, [seed, preset.ear.amp, preset.ear.freq, preset.ear.h, preset.ear.w]);

  const beakGeo = useMemo(() => {
    if (!isBird && !isTurtle) return null;
    // Cylinder along Z, then taper + curve downward to read “beak”, not “cone”.
    const base = new THREE.CylinderGeometry(0.09, 0.02, 0.30, 18, 6, false);
    base.rotateX(Math.PI / 2);
    // center at origin so we can position easily
    base.translate(0, 0, 0.15);

    const warped = warpGeometry(base, (v) => {
      const t = THREE.MathUtils.clamp(v.z / 0.30, 0, 1); // 0..1 from base->tip
      const s = Math.pow(1 - t, 1.65);
      v.x *= 0.55 + 0.55 * s;
      v.y *= 0.48 + 0.52 * s;
      // subtle downward curve
      v.y -= t * t * 0.06;
      // slight lateral pinch near tip
      v.x *= 1 - t * 0.22;
    });

    return displaceGeometry(warped, seed + 551, { amp: 0.02, freq: 5.2, normalPush: 0.65, clamp: 0.06 });
  }, [isBird, isTurtle, seed]);

  const reptileSnoutGeo = useMemo(() => {
    if (!isReptile && !isDragon) return null;
    const base = new THREE.CapsuleGeometry(0.065, 0.22, 8, 14);
    base.rotateX(Math.PI / 2);
    base.scale(1.05, 0.75, preset.muzzle.len * (isDragon ? 1.15 : 1.05));
    base.translate(0, -0.02, 0.16);
    return displaceGeometry(base, seed + 607, { amp: 0.035, freq: 3.8, normalPush: 0.9, clamp: 0.09 });
  }, [isDragon, isReptile, preset.muzzle.len, seed]);

  const tuskGeo = useMemo(() => {
    if (!isBoar) return null;
    const base = new THREE.ConeGeometry(0.018, 0.16, 10, 4);
    base.translate(0, -0.08, 0);
    return displaceGeometry(base, seed + 813, { amp: 0.01, freq: 6.0, normalPush: 0.55, clamp: 0.03 });
  }, [isBoar, seed]);

  const shellGeo = useMemo(() => {
    if (!isTurtle) return null;
    const base = new THREE.SphereGeometry(0.32, 18, 14);
    base.scale(1.25, 0.85, 1.15);
    // flatten underside
    const warped = warpGeometry(base, (v) => {
      if (v.y < 0) v.y *= 0.55;
      // subtle ridge down the center
      v.x *= 1 - Math.abs(v.z) * 0.12;
    });
    return displaceGeometry(warped, seed + 901, { amp: 0.035, freq: 2.6, normalPush: 0.9, clamp: 0.08 });
  }, [isTurtle, seed]);

  // Jacket/armor parts (higher fidelity silhouette)
  const jacketTorsoGeo = useMemo(() => {
    const base = new THREE.BoxGeometry(0.54, 0.52, 0.12, 8, 8, 4);
    // shoulder flare
    const warped = warpGeometry(base, (v) => {
      if (v.y > 0.12) v.x *= 1.08;
      if (v.y > 0.18) v.x *= 1.12;
      // chest taper
      const t = THREE.MathUtils.clamp((v.y + 0.25) / 0.6, 0, 1);
      v.z += (1 - t) * 0.03;
    });
    return displaceGeometry(warped, seed + 1201, { amp: 0.02, freq: 3.4, normalPush: 0.8, clamp: 0.05 });
  }, [seed]);

  const jacketCollarGeo = useMemo(() => {
    const base = new THREE.BoxGeometry(0.56, 0.14, 0.22, 8, 4, 4);
    base.translate(0, 0.0, 0.02);
    const warped = warpGeometry(base, (v) => {
      // collar curve
      v.y += Math.sin((v.x / 0.56) * Math.PI) * 0.03;
      v.z += Math.abs(v.x) * 0.06;
    });
    return displaceGeometry(warped, seed + 1219, { amp: 0.015, freq: 4.2, normalPush: 0.7, clamp: 0.04 });
  }, [seed]);

  const shoulderPadGeo = useMemo(() => {
    const base = new THREE.SphereGeometry(0.16, 18, 14);
    base.scale(1.35, 0.7, 1.15);
    return displaceGeometry(base, seed + 1237, { amp: 0.02, freq: 3.2, normalPush: 0.85, clamp: 0.05 });
  }, [seed]);

  const bootGeo = useMemo(() => {
    const base = new THREE.BoxGeometry(0.18, 0.16, 0.32, 6, 6, 6);
    const warped = warpGeometry(base, (v) => {
      // toe taper
      const t = THREE.MathUtils.clamp((v.z + 0.16) / 0.32, 0, 1);
      v.x *= 0.9 + (1 - t) * 0.25;
      v.y *= 0.95;
    });
    return displaceGeometry(warped, seed + 1249, { amp: 0.02, freq: 3.6, normalPush: 0.9, clamp: 0.05 });
  }, [seed]);

  const maneSpikeGeo = useMemo(() => {
    const base = new THREE.ConeGeometry(0.032, 0.16, 10, 3);
    base.translate(0, 0.08, 0);
    return displaceGeometry(base, seed + 1301, { amp: 0.015, freq: 5.0, normalPush: 0.7, clamp: 0.04 });
  }, [seed]);

  const limbUpperGeo = useMemo(() => {
    const base = new THREE.CapsuleGeometry(0.07 * silhouette.limbRad, 0.28 * silhouette.limbLen, 8, 14);
    base.scale(1.0, preset.kind === "bird" ? 0.85 : 1.0, preset.kind === "spider" ? 0.85 : 1.0);
    return displaceGeometry(base, seed + 701, { amp: 0.03, freq: 3.6, normalPush: 0.85, clamp: 0.07 });
  }, [preset.kind, seed, silhouette.limbLen, silhouette.limbRad]);

  const limbLowerGeo = useMemo(() => {
    const base = new THREE.CapsuleGeometry(0.055 * silhouette.limbRad, 0.26 * (silhouette.limbLen * 1.04), 8, 14);
    base.scale(1.0, preset.kind === "bird" ? 0.85 : 1.0, preset.kind === "spider" ? 0.85 : 1.0);
    return displaceGeometry(base, seed + 719, { amp: 0.028, freq: 3.9, normalPush: 0.85, clamp: 0.06 });
  }, [preset.kind, seed, silhouette.limbLen, silhouette.limbRad]);

  const pawGeo = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(0.085, 3);
    base.scale(1.10 * silhouette.paw, 0.90 * silhouette.paw, 1.20 * silhouette.paw);
    return displaceGeometry(base, seed + 733, { amp: 0.035, freq: 3.4, normalPush: 1.0, clamp: 0.08 });
  }, [seed, silhouette.paw]);

  const footGeo = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(0.105, 3);
    base.scale(1.10 * silhouette.paw, 0.80 * silhouette.paw, 1.38 * silhouette.paw);
    return displaceGeometry(base, seed + 747, { amp: 0.04, freq: 3.2, normalPush: 1.0, clamp: 0.09 });
  }, [seed, silhouette.paw]);

  const furMat = useMemo(() => {
    return {
      roughness: preset.material.roughness,
      metalness: preset.material.metalness,
    };
  }, [preset.material.metalness, preset.material.roughness]);

  const useScales = preset.kind === "dragon" || preset.kind === "reptile" || preset.kind === "turtle";
  const useChitin = preset.kind === "spider";

  const scaleMat = useMemo(
    () => ({
      roughness: preset.kind === "dragon" ? 0.62 : 0.65,
      metalness: preset.kind === "dragon" ? 0.06 : 0.05,
      clearcoat: 0.55,
      clearcoatRoughness: 0.35,
    }),
    [preset.kind]
  );

  const chitinMat = useMemo(
    () => ({
      roughness: 0.48,
      metalness: 0.12,
      clearcoat: 0.65,
      clearcoatRoughness: 0.28,
    }),
    []
  );

  // Procedural texture maps (no placeholders, generated at runtime)
  const furNoiseTex = useMemo(() => {
    const t = makeNoiseTexture(seed + 501, 128, 4);
    if (t) t.repeat.set(5, 5);
    return t;
  }, [seed]);

  const clothTex = useMemo(() => {
    const t = makeClothWeaveTexture(seed + 777, 128);
    if (t) t.repeat.set(6, 6);
    return t;
  }, [seed]);

  const armorNoiseTex = useMemo(() => {
    const t = makeNoiseTexture(seed + 933, 128, 3);
    if (t) t.repeat.set(10, 10);
    return t;
  }, [seed]);

  const furPhysical = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(furColor),
      metalness: furMat.metalness,
      roughness: furMat.roughness,
      clearcoat: 0.18,
      clearcoatRoughness: 0.65,
      sheen: 0.7,
      sheenColor: new THREE.Color(accent),
      sheenRoughness: 0.78,
      envMapIntensity: 1.3,
    });
    if (furNoiseTex) {
      m.roughnessMap = furNoiseTex;
      m.bumpMap = furNoiseTex;
      m.bumpScale = 0.045;
    }
    return m;
  }, [accent, furColor, furMat.metalness, furMat.roughness, furNoiseTex]);

  const jacketMaterial = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(jacketMain),
      metalness: 0.26,
      roughness: 0.42,
      clearcoat: 0.35,
      clearcoatRoughness: 0.35,
      emissive: new THREE.Color(jacketTrim),
      emissiveIntensity: 0.10,
      envMapIntensity: 1.4,
    });
    if (clothTex) {
      m.roughnessMap = clothTex;
      m.bumpMap = clothTex;
      m.bumpScale = 0.035;
    }
    return m;
  }, [clothTex, jacketMain, jacketTrim]);

  const armorMaterial = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#050508"),
      metalness: 0.55,
      roughness: 0.28,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1.6,
    });
    if (armorNoiseTex) {
      m.roughnessMap = armorNoiseTex;
      m.bumpMap = armorNoiseTex;
      m.bumpScale = 0.02;
    }
    return m;
  }, [armorNoiseTex]);

  const rimGlowMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
  }, [accent]);

  const memoryTailGeometries = useMemo(() => {
    if (!hasThreeMemoryTails) return [] as THREE.TubeGeometry[];
    const mk = (phase: number) =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.10, -0.16),
        new THREE.Vector3(Math.sin(phase) * 0.18, 0.22, -0.34),
        new THREE.Vector3(Math.sin(phase + 1.0) * 0.34, 0.42, -0.56),
        new THREE.Vector3(Math.sin(phase + 2.0) * 0.48, 0.62, -0.74),
      ]);
    return [0, 1, 2].map((i) => new THREE.TubeGeometry(mk((i / 3) * Math.PI * 2), 36, 0.022, 8, false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fighter.id, featureKey]);

  // Swirling energy ribbons (reference-style Kai‑Jax arcs)
  const auraRibbonGeometries = useMemo(() => {
    if (!hasAuraWings) return [] as THREE.TubeGeometry[];

    const mkRibbon = (phase: number) =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.55, -0.10),
        new THREE.Vector3(Math.sin(phase + 0.0) * 0.55, 0.95, -0.25),
        new THREE.Vector3(Math.sin(phase + 1.1) * 0.75, 1.35, -0.35),
        new THREE.Vector3(Math.sin(phase + 2.0) * 0.55, 1.75, -0.22),
        new THREE.Vector3(Math.sin(phase + 3.2) * 0.25, 2.05, 0.05),
      ]);

    return [0, 1, 2, 3].map((i) => new THREE.TubeGeometry(mkRibbon((i / 4) * Math.PI * 2), 64, 0.018, 10, false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fighter.id, featureKey, hasAuraWings]);

  const lightningRibbonMaterialBase = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uHueOffset: { value: 0 },
        uAlpha: { value: 0.18 },
        uIntensity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vN;
        varying vec3 vV;
        void main() {
          vUv = uv;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vV = normalize(-mv.xyz);
          vN = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vN;
        varying vec3 vV;
        uniform float uTime;
        uniform float uHueOffset;
        uniform float uAlpha;
        uniform float uIntensity;
        uniform vec3 uWebbingRGB;
        uniform float uUseWebbing;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        vec3 hsl2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
          return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z-1.0));
        }

        void main() {
          // Tube UVs: y runs along the ribbon length
          float t = uTime;
          float along = vUv.y;
          float across = vUv.x;

          // Base cosmic hue drift + per-ribbon offset
          float hue = fract(t * 0.06 + uHueOffset + along * 0.12);
          vec3 base = hsl2rgb(vec3(hue, 0.85, 0.62));

          // Lightning streaks
          float n = noise(vec2(along * 18.0, t * 2.0 + uHueOffset * 7.0));
          float flicker = sin((along * 38.0 + t * 10.0 + n * 8.0) * 3.14159);
          flicker = flicker * 0.5 + 0.5;
          float streak = smoothstep(0.70, 0.98, flicker);

          // Edge fade across the ribbon (avoid hard edges)
          float edge = smoothstep(0.0, 0.18, across) * smoothstep(0.0, 0.18, 1.0 - across);

          // Fresnel glow
          float fres = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.5);

          vec3 c = base * (0.55 + fres * 1.25);
          c += vec3(1.0) * streak * 1.25;

          float a = uAlpha * edge * (0.65 + streak * 0.9) * (0.75 + fres * 0.9);
          gl_FragColor = vec4(c * uIntensity, a);
        }
      `,
    });
    return mat;
  }, [webbingColor]);

  const lightningRibbonMaterials = useMemo(() => {
    if (!hasAuraWings) return [] as THREE.ShaderMaterial[];
    return auraRibbonGeometries.map((_, i) => {
      const m = lightningRibbonMaterialBase.clone();
      m.uniforms = THREE.UniformsUtils.clone(lightningRibbonMaterialBase.uniforms);
      const u = m.uniforms as any;
      u.uHueOffset.value = i * 0.18;
      u.uAlpha.value = 0.18;
      u.uIntensity.value = 1.0;
      return m;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auraRibbonGeometries.length, hasAuraWings, lightningRibbonMaterialBase]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = animTime || state.clock.elapsedTime;
    const lerp = THREE.MathUtils.lerp;

    const absVX = Math.abs(velocityX);
    const moving = isMoving || absVX > 0.5;
    const speed = THREE.MathUtils.clamp(absVX / 6, 0, 1);
    const walkRate = 8 + speed * 8;
    const walkPhase = Math.sin(t * walkRate);

    if (!isGrounded && wasGrounded.current) {
      wasGrounded.current = false;
    }
    if (isGrounded && !wasGrounded.current) {
      landSquash.current = 1.0;
      wasGrounded.current = true;
    }
    landSquash.current = lerp(landSquash.current, 0, 1 - Math.pow(0.05, delta));

    const squashY = 1 - landSquash.current * 0.25;
    const squashXZ = 1 + landSquash.current * 0.15;

    if (isInvulnerable) {
      groupRef.current.visible = Math.sin(t * 30) > 0;
    } else {
      groupRef.current.visible = true;
    }

    let bodyPosY = Math.sin(t * 2.0) * 0.02;
    let bodyRotX = 0;
    let bodyRotY = Math.sin(t * 0.6) * 0.08;
    let bodyRotZ = 0;

    let leftArmX = 0;
    let leftArmZ = 0;
    let rightArmX = 0;
    let rightArmZ = 0;
    let leftLegX = 0;
    let rightLegX = 0;

    let headRotX = 0.06 + emotionIntensity * 0.06;
    let headRotY = Math.sin(t * 1.5) * 0.06;
    let headRotZ = 0;

    if (moving && isGrounded && !isAttacking) {
      leftArmX = -0.45 * walkPhase * (0.5 + speed * 0.5);
      rightArmX = 0.45 * walkPhase * (0.5 + speed * 0.5);
      leftLegX = 0.55 * walkPhase * (0.5 + speed * 0.5);
      rightLegX = -0.55 * walkPhase * (0.5 + speed * 0.5);
      bodyRotX = lerp(0, velocityX > 0 ? -0.06 : 0.06, speed);
      bodyPosY += Math.abs(Math.sin(t * walkRate * 2)) * 0.01 * speed;
      headRotY += Math.sin(t * walkRate) * 0.03 * speed;
    }

    if (!isGrounded) {
      const vyNorm = THREE.MathUtils.clamp(velocityY / 8, -1, 1);
      if (isJumping) {
        leftArmX = lerp(leftArmX, -1.2 - vyNorm * 0.3, 0.7);
        rightArmX = lerp(rightArmX, -1.2 - vyNorm * 0.3, 0.7);
        leftLegX = lerp(leftLegX, 0.4, 0.7);
        rightLegX = lerp(rightLegX, 0.4, 0.7);
        bodyPosY += 0.03;
        bodyRotX = lerp(bodyRotX, -0.08, 0.5);
      } else {
        leftArmX = lerp(leftArmX, -0.6 + vyNorm * 0.2, 0.5);
        rightArmX = lerp(rightArmX, -0.6 + vyNorm * 0.2, 0.5);
        leftArmZ = lerp(leftArmZ, -0.4, 0.5);
        rightArmZ = lerp(rightArmZ, 0.4, 0.5);
        leftLegX = lerp(leftLegX, -0.3, 0.5);
        rightLegX = lerp(rightLegX, -0.3, 0.5);
        bodyRotX = lerp(bodyRotX, 0.06 - vyNorm * 0.04, 0.5);
      }
    }

    if (isAttacking && attackType) {
      const atkT = (Math.sin(t * 16) * 0.5 + 0.5);
      if (attackType === 'punch') {
        rightArmX = lerp(rightArmX, -1.4 * atkT, 0.85);
        leftArmX = lerp(leftArmX, -0.3, 0.6);
        leftArmZ = lerp(leftArmZ, -0.2, 0.5);
        bodyRotX = lerp(bodyRotX, -0.12 * atkT, 0.7);
        headRotX = lerp(headRotX, 0.15, 0.6);
      } else if (attackType === 'kick') {
        rightLegX = lerp(rightLegX, -1.2 * atkT, 0.85);
        bodyRotX = lerp(bodyRotX, 0.15 * atkT, 0.7);
        leftArmX = lerp(leftArmX, -0.3, 0.5);
        rightArmX = lerp(rightArmX, -0.3, 0.5);
        leftArmZ = lerp(leftArmZ, -0.15, 0.4);
        rightArmZ = lerp(rightArmZ, 0.15, 0.4);
      } else if (attackType === 'special') {
        rightArmX = lerp(rightArmX, -1.3 * atkT, 0.9);
        leftArmX = lerp(leftArmX, -1.3 * atkT, 0.9);
        bodyRotX = lerp(bodyRotX, -0.2 * atkT, 0.8);
        headRotX = lerp(headRotX, 0.2, 0.7);
      } else if (attackType === 'ultimate') {
        const phase = (t * 4) % (Math.PI * 2);
        const spread = Math.sin(phase) * 0.5 + 0.5;
        const slam = Math.cos(phase) * 0.5 + 0.5;
        leftArmX = lerp(leftArmX, lerp(-0.8, -1.5, slam), 0.9);
        rightArmX = lerp(rightArmX, lerp(-0.8, -1.5, slam), 0.9);
        leftArmZ = lerp(leftArmZ, lerp(-0.8 * spread, 0, slam), 0.8);
        rightArmZ = lerp(rightArmZ, lerp(0.8 * spread, 0, slam), 0.8);
        bodyRotX = lerp(bodyRotX, lerp(0.1, -0.3, slam), 0.85);
        headRotX = lerp(headRotX, lerp(-0.3, 0.3, slam), 0.8);
      }
    }

    if (hitAnim > 0) {
      bodyRotX = lerp(bodyRotX, 0.2 * hitAnim, 0.7);
      bodyRotZ = Math.sin(t * 22) * 0.06 * hitAnim;
      headRotX = lerp(headRotX, -0.2 * hitAnim, 0.6);
      leftArmX = lerp(leftArmX, 0.3 * hitAnim, 0.5);
      rightArmX = lerp(rightArmX, 0.3 * hitAnim, 0.5);
    }

    groupRef.current.position.y = bodyPosY;
    groupRef.current.rotation.x = bodyRotX;
    groupRef.current.rotation.y = bodyRotY;
    groupRef.current.rotation.z = bodyRotZ;
    groupRef.current.scale.set(squashXZ, squashY, squashXZ);

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = leftArmX;
      leftArmRef.current.rotation.z = leftArmZ;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = rightArmX;
      rightArmRef.current.rotation.z = rightArmZ;
    }
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = leftLegX;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = rightLegX;
    }

    if (headRef.current) {
      headRef.current.rotation.x = headRotX;
      headRef.current.rotation.y = headRotY;
      headRef.current.rotation.z = headRotZ;
    }

    if (nebulaRef.current && hasInternalNebulae) {
      nebulaRef.current.rotation.y += delta * 0.8;
      const mat = nebulaRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.10 + (Math.sin(t * 1.8) * 0.5 + 0.5) * 0.20;
    }

    if (coreRef.current && hasFusionCore) {
      coreRef.current.rotation.y += delta * 1.2;
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + (Math.sin(t * 3.2) * 0.5 + 0.5) * 0.35;
    }

    if (coreLightRef.current && hasFusionCore) {
      coreLightRef.current.intensity = 1.6 + (Math.sin(t * 3.2) * 0.5 + 0.5) * 2.2;
    }

    if (auraWingRef.current && hasAuraWings) {
      auraWingRef.current.rotation.y = Math.sin(t * 0.7) * 0.18;
    }

    if (auraRibbonRef.current && hasAuraWings) {
      auraRibbonRef.current.rotation.y = Math.sin(t * 0.55) * 0.22;
      auraRibbonRef.current.rotation.z = Math.sin(t * 0.35) * 0.10;
      auraRibbonRef.current.position.y = Math.sin(t * 0.8) * 0.03;
      for (let i = 0; i < lightningRibbonMaterials.length; i++) {
        const m = lightningRibbonMaterials[i];
        if (!m) continue;
        const u = m.uniforms as any;
        u.uTime.value = t;
        u.uIntensity.value = isAttacking ? 1.35 : 1.0;
        u.uAlpha.value = 0.14 + (Math.sin(t * 2.2 + i) * 0.5 + 0.5) * 0.10;
      }
    }
  });

  const modelScale = useMemo(() => {
    // Slightly smaller overall so the camera framing + arena read better.
    if (fighter.id === "kai-jax") return 2.55;
    if (isDragon) return 2.35;
    if (isBird) return 2.25;
    if (isTurtle) return 2.15;
    return 2.2;
  }, [fighter.id, isBird, isDragon, isTurtle]);

  return (
    <group ref={groupRef} scale={[modelScale, modelScale, modelScale]}>
      <group ref={bodyRef} position={[0, 0.40, 0]}>
        {/* Chest + pelvis (animal proportions) */}
        <mesh castShadow receiveShadow position={[0, 0.18, 0.02]} geometry={chestGeo}>
          {useScales ? (
            <meshPhysicalMaterial
              color={furColor}
              metalness={scaleMat.metalness}
              roughness={scaleMat.roughness}
              clearcoat={scaleMat.clearcoat}
              clearcoatRoughness={scaleMat.clearcoatRoughness}
            />
          ) : useChitin ? (
            <meshPhysicalMaterial
              color={furColor}
              metalness={chitinMat.metalness}
              roughness={chitinMat.roughness}
              clearcoat={chitinMat.clearcoat}
              clearcoatRoughness={chitinMat.clearcoatRoughness}
            />
          ) : (
            <primitive attach="material" object={furPhysical} />
          )}
        </mesh>
        {/* Rim glow shell (reference-style render lighting) */}
        {!useScales && !useChitin && (
          <mesh position={[0, 0.18, 0.02]} geometry={chestGeo} scale={1.03}>
            <primitive attach="material" object={rimGlowMat} />
          </mesh>
        )}
        <mesh castShadow receiveShadow position={[0, -0.12, -0.02]} rotation={[0.08, 0, 0]} geometry={hipGeo}>
          {useScales ? (
            <meshPhysicalMaterial
              color={furColor}
              metalness={scaleMat.metalness}
              roughness={scaleMat.roughness}
              clearcoat={scaleMat.clearcoat}
              clearcoatRoughness={scaleMat.clearcoatRoughness}
            />
          ) : useChitin ? (
            <meshPhysicalMaterial
              color={furColor}
              metalness={chitinMat.metalness}
              roughness={chitinMat.roughness}
              clearcoat={chitinMat.clearcoat}
              clearcoatRoughness={chitinMat.clearcoatRoughness}
            />
          ) : (
            <primitive attach="material" object={furPhysical} />
          )}
        </mesh>
        {showFurShellLayer && !useScales && !useChitin && (
          <mesh position={[0, -0.12, -0.02]} rotation={[0.08, 0, 0]} geometry={hipGeo} scale={1.03}>
            <primitive attach="material" object={rimGlowMat} />
          </mesh>
        )}

        {/* Internal nebulae (Kai‑Jax) */}
        {hasInternalNebulae && (
          <mesh ref={nebulaRef} position={[0, 0.18, 0.03]} scale={0.95}>
            <sphereGeometry args={[0.28, 16, 12]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={0.22}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Cinematic jacket/armor silhouette (reference-style) */}
        {hasCinematicJacket && !isTurtle && (
          <group position={[0, 0.18, 0.16]}>
            <mesh castShadow geometry={jacketTorsoGeo}>
              <primitive attach="material" object={jacketMaterial} />
            </mesh>
            <mesh position={[0, 0.26, -0.02]} rotation={[0.05, 0, 0]} castShadow geometry={jacketCollarGeo}>
              <primitive attach="material" object={armorMaterial} />
            </mesh>
            <mesh position={[-0.34, 0.12, 0.02]} rotation={[0.10, 0, 0.18]} castShadow geometry={shoulderPadGeo}>
              <primitive attach="material" object={armorMaterial} />
            </mesh>
            <mesh position={[0.34, 0.12, 0.02]} rotation={[0.10, 0, -0.18]} castShadow geometry={shoulderPadGeo}>
              <primitive attach="material" object={armorMaterial} />
            </mesh>

            {/* Belt / waist strap */}
            <mesh position={[0, -0.12, 0.05]} castShadow>
              <boxGeometry args={[0.56, 0.08, 0.12]} />
              <primitive attach="material" object={armorMaterial} />
            </mesh>
            <mesh position={[0, -0.12, 0.12]} castShadow>
              <boxGeometry args={[0.12, 0.07, 0.06]} />
              <meshStandardMaterial color={jacketTrim} roughness={0.45} metalness={0.45} emissive={jacketTrim} emissiveIntensity={0.12} />
            </mesh>

            {/* Zipper line */}
            <mesh position={[0, 0.10, 0.12]} castShadow>
              <boxGeometry args={[0.02, 0.42, 0.02]} />
              <meshStandardMaterial color={jacketTrim} roughness={0.35} metalness={0.55} emissive={jacketTrim} emissiveIntensity={0.10} />
            </mesh>
          </group>
        )}

        {/* Muscular torso definition (pecs/abs) */}
        {!isTurtle && (
          <group position={[0, 0.16, 0.10]}>
            <mesh position={[-0.10, 0.10, 0.03]} castShadow>
              <sphereGeometry args={[0.10, 16, 12]} />
              <meshStandardMaterial color={furColor} roughness={0.88} metalness={0.06} />
            </mesh>
            <mesh position={[0.10, 0.10, 0.03]} castShadow>
              <sphereGeometry args={[0.10, 16, 12]} />
              <meshStandardMaterial color={furColor} roughness={0.88} metalness={0.06} />
            </mesh>
            <mesh position={[0, -0.05, 0.04]} castShadow scale={[1.35, 1.0, 0.75]}>
              <capsuleGeometry args={[0.055, 0.14, 8, 12]} />
              <meshStandardMaterial color={"#07070b"} roughness={0.85} metalness={0.12} emissive={accent} emissiveIntensity={0.03} />
            </mesh>
          </group>
        )}

        {/* Fusion chest core glow (matches reference) */}
        {hasFusionCore && (
          <group position={[0, 0.22, 0.10]}>
            <pointLight ref={coreLightRef} color={accent} intensity={2.2} distance={3.2} decay={2} />
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.075, 16, 12]} />
              <meshStandardMaterial color={"#0a0a0f"} roughness={0.6} metalness={0.15} />
            </mesh>
            <mesh ref={coreRef} scale={1.75}>
              <icosahedronGeometry args={[0.08, 3]} />
              <meshBasicMaterial color={accent} transparent opacity={0.65} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh scale={2.4}>
              <sphereGeometry args={[0.09, 16, 12]} />
              <meshBasicMaterial color={accent} transparent opacity={0.12} depthWrite={false} />
            </mesh>
            {/* Outer rim flare */}
            <mesh scale={3.2}>
              <sphereGeometry args={[0.10, 16, 12]} />
              <meshBasicMaterial
                color={accent}
                transparent
                opacity={0.06}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )}

        {/* Turtle shell (real silhouette change) */}
        {isTurtle && shellGeo && (
          <group position={[0, 0.16, -0.12]}>
            <mesh castShadow receiveShadow geometry={shellGeo}>
              <meshPhysicalMaterial
                color={"#14301f"}
                metalness={0.12}
                roughness={0.55}
                clearcoat={0.55}
                clearcoatRoughness={0.35}
              />
            </mesh>
            <mesh position={[0, -0.04, -0.02]} castShadow receiveShadow>
              <sphereGeometry args={[0.30, 18, 14]} />
              <meshStandardMaterial color={"#0a1a10"} roughness={0.9} metalness={0.05} />
            </mesh>
          </group>
        )}

        {hasChaseBadge && (
          <mesh position={[-0.22, 0.28, 0.22]} castShadow>
            <circleGeometry args={[0.08, 14]} />
            <meshBasicMaterial color={accent} />
          </mesh>
        )}

        {hasWebGear && (
          <mesh position={[0, 0.22, 0.12]} rotation={[0.6, 0, 0]} castShadow>
            <boxGeometry args={[0.52, 0.035, 0.22]} />
            <meshStandardMaterial color={"#101424"} roughness={0.85} metalness={0.1} />
          </mesh>
        )}

        {/* Head */}
        <group ref={headRef} position={[0, 0.62, 0.14]}>
          <mesh castShadow receiveShadow geometry={skullGeo}>
            {useScales ? (
              <meshPhysicalMaterial
                color={furColor}
                metalness={scaleMat.metalness}
                roughness={scaleMat.roughness}
                clearcoat={scaleMat.clearcoat}
                clearcoatRoughness={scaleMat.clearcoatRoughness}
              />
            ) : useChitin ? (
              <meshPhysicalMaterial
                color={furColor}
                metalness={chitinMat.metalness}
                roughness={chitinMat.roughness}
                clearcoat={chitinMat.clearcoat}
                clearcoatRoughness={chitinMat.clearcoatRoughness}
              />
            ) : (
              <primitive attach="material" object={furPhysical} />
            )}
          </mesh>
          {!useScales && !useChitin && (
            <mesh geometry={skullGeo} scale={1.04}>
              <primitive attach="material" object={rimGlowMat} />
            </mesh>
          )}

          {isCanine && (
            <>
              {/* Muzzle (sculpted) */}
              <mesh position={[0, -0.05, 0.24]} rotation={[0.08, 0, 0]} castShadow geometry={muzzleGeo}>
                <meshStandardMaterial color={furColor} metalness={furMat.metalness} roughness={furMat.roughness} />
              </mesh>
              {/* Jaw (sculpted) */}
              <mesh position={[0, -0.17, 0.22]} rotation={[0.10, 0, 0]} castShadow geometry={jawGeo}>
                <meshStandardMaterial color={"#0a0a0f"} roughness={0.95} metalness={0.02} />
              </mesh>
              {/* Nose + teeth (makes face read “real animal”) */}
              <mesh position={[0, -0.09, 0.33]} castShadow>
                <sphereGeometry args={[0.022, 12, 10]} />
                <meshStandardMaterial color={"#050508"} roughness={0.6} metalness={0.15} />
              </mesh>
              {[-0.04, 0.04].map((x) => (
                <mesh key={x} position={[x, -0.19, 0.26]} rotation={[0.35, 0, 0]} castShadow>
                  <coneGeometry args={[0.010, 0.055, 8]} />
                  <meshStandardMaterial color={"#f3efe6"} roughness={0.35} metalness={0.05} />
                </mesh>
              ))}
              {/* Ears (sculpted) */}
              <mesh position={[-0.19, 0.16, -0.02]} rotation={[0.10, 0, 0.42]} castShadow geometry={earGeo}>
                <meshStandardMaterial color={furColor} metalness={furMat.metalness} roughness={furMat.roughness} />
              </mesh>
              <mesh position={[0.19, 0.16, -0.02]} rotation={[0.10, 0, -0.42]} castShadow geometry={earGeo}>
                <meshStandardMaterial color={furColor} metalness={furMat.metalness} roughness={furMat.roughness} />
              </mesh>

              {/* Boar tusks */}
              {isBoar && tuskGeo && (
                <>
                  <mesh position={[-0.08, -0.18, 0.26]} rotation={[0.35, 0.22, 0.2]} castShadow geometry={tuskGeo}>
                    <meshStandardMaterial color={"#f5f1e8"} roughness={0.35} metalness={0.05} />
                  </mesh>
                  <mesh position={[0.08, -0.18, 0.26]} rotation={[0.35, -0.22, -0.2]} castShadow geometry={tuskGeo}>
                    <meshStandardMaterial color={"#f5f1e8"} roughness={0.35} metalness={0.05} />
                  </mesh>
                </>
              )}
            </>
          )}

          {(isBird || isTurtle) && (
            <>
              {/* Beak (curved + tapered) */}
              {beakGeo && (
                <mesh position={[0, -0.04, 0.18]} rotation={[0.04, 0, 0]} castShadow geometry={beakGeo}>
                  <meshPhysicalMaterial color={isTurtle ? furColor : accent} roughness={0.35} metalness={0.28} clearcoat={0.6} clearcoatRoughness={0.3} />
                </mesh>
              )}
              {/* Crest */}
              {isBird && (
                <mesh position={[0, 0.20, 0.02]} rotation={[Math.PI / 2.25, 0, 0]} castShadow>
                  <coneGeometry args={[0.04, 0.22, 10]} />
                  <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.12} roughness={0.55} metalness={0.18} />
                </mesh>
              )}
            </>
          )}

          {isReptile && (
            <>
              {/* Snout (not boxy) */}
              {reptileSnoutGeo && (
                <mesh castShadow geometry={reptileSnoutGeo}>
                  <meshPhysicalMaterial
                    color={furColor}
                    metalness={scaleMat.metalness}
                    roughness={scaleMat.roughness}
                    clearcoat={scaleMat.clearcoat}
                    clearcoatRoughness={scaleMat.clearcoatRoughness}
                  />
                </mesh>
              )}
              {/* Nostrils */}
              {[-0.05, 0.05].map((x) => (
                <mesh key={x} position={[x, -0.08, 0.30]} castShadow>
                  <sphereGeometry args={[0.012, 10, 8]} />
                  <meshStandardMaterial color={"#050508"} roughness={0.95} metalness={0.05} />
                </mesh>
              ))}
              <mesh position={[0, 0.18, -0.10]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
                <coneGeometry args={[0.05, 0.24, 6]} />
                <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.12} />
              </mesh>
            </>
          )}

          {isFrog && (
            <mesh position={[0, -0.14, 0.18]} castShadow>
              <boxGeometry args={[0.22, 0.06, 0.14]} />
              <meshStandardMaterial color={furColor} roughness={0.9} metalness={0.02} />
            </mesh>
          )}

          {isSpider &&
            Array.from({ length: 6 }).map((_, i) => (
              <mesh
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                position={[-0.14 + i * 0.056, 0.10, 0.20]}
              >
                <sphereGeometry args={[0.018, 10, 8]} />
                <meshBasicMaterial color={accent} />
              </mesh>
            ))}

          {/* Eyes (slits) */}
          <mesh position={[-0.08, 0.03, 0.20]} rotation={[0, 0.12, 0.14]}>
            <planeGeometry args={[0.11, 0.028]} />
            <meshBasicMaterial color={eyeColor} transparent opacity={0.96} />
          </mesh>
          <mesh position={[0.08, 0.03, 0.20]} rotation={[0, -0.12, -0.14]}>
            <planeGeometry args={[0.11, 0.028]} />
            <meshBasicMaterial color={eyeColor} transparent opacity={0.96} />
          </mesh>
          {/* Eye glow halo */}
          <mesh position={[-0.08, 0.03, 0.195]} rotation={[0, 0.12, 0.14]}>
            <planeGeometry args={[0.16, 0.06]} />
            <meshBasicMaterial color={eyeColor} transparent opacity={0.18} depthWrite={false} />
          </mesh>
          <mesh position={[0.08, 0.03, 0.195]} rotation={[0, -0.12, -0.14]}>
            <planeGeometry args={[0.16, 0.06]} />
            <meshBasicMaterial color={eyeColor} transparent opacity={0.18} depthWrite={false} />
          </mesh>

          {hasHorns && (
            <>
              <mesh position={[-0.16, 0.12, -0.02]} rotation={[0.2, 0.0, 0.6]} castShadow>
                <coneGeometry args={[0.05, 0.20, 6]} />
                <meshStandardMaterial
                  color={accent}
                  metalness={0.55}
                  roughness={0.35}
                  emissive={accent}
                  emissiveIntensity={0.18}
                />
              </mesh>
              <mesh position={[0.16, 0.12, -0.02]} rotation={[0.2, 0.0, -0.6]} castShadow>
                <coneGeometry args={[0.05, 0.20, 6]} />
                <meshStandardMaterial
                  color={accent}
                  metalness={0.55}
                  roughness={0.35}
                  emissive={accent}
                  emissiveIntensity={0.18}
                />
              </mesh>
            </>
          )}

          {/* Neck mane/ruff — fur shell layer (off at very far LOD) */}
          {showFurShellLayer && (kind === "wolf" || kind === "fox" || kind === "cat" || fighter.id === "kai-jax") && (
            <group position={[0, -0.08, 0.02]}>
              {Array.from({ length: 14 }).map((_, i) => (
                <mesh
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  geometry={maneSpikeGeo}
                  position={[
                    Math.sin((i / 14) * Math.PI * 2) * 0.20,
                    -0.04,
                    Math.cos((i / 14) * Math.PI * 2) * 0.16,
                  ]}
                  rotation={[Math.PI / 2.6, (i / 14) * Math.PI * 2, 0]}
                  castShadow
                >
                  <meshStandardMaterial color={furColor} roughness={0.92} metalness={0.05} />
                </mesh>
              ))}
            </group>
          )}
        </group>

        {/* Arms (paws/claws) */}
        <group ref={leftArmRef} position={[-0.28, 0.38, 0.02]} rotation={[0, 0, 0.55]}>
          <mesh castShadow geometry={limbUpperGeo}>
            {useScales ? (
              <meshPhysicalMaterial color={furColor} metalness={scaleMat.metalness} roughness={scaleMat.roughness} clearcoat={scaleMat.clearcoat} clearcoatRoughness={scaleMat.clearcoatRoughness} />
            ) : useChitin ? (
              <meshPhysicalMaterial color={furColor} metalness={chitinMat.metalness} roughness={chitinMat.roughness} clearcoat={chitinMat.clearcoat} clearcoatRoughness={chitinMat.clearcoatRoughness} />
            ) : (
              <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.08} />
            )}
          </mesh>
          <mesh position={[0, -0.28, 0]} castShadow geometry={limbLowerGeo}>
            {useScales ? (
              <meshPhysicalMaterial color={furColor} metalness={scaleMat.metalness} roughness={scaleMat.roughness} clearcoat={scaleMat.clearcoat} clearcoatRoughness={scaleMat.clearcoatRoughness} />
            ) : useChitin ? (
              <meshPhysicalMaterial color={furColor} metalness={chitinMat.metalness} roughness={chitinMat.roughness} clearcoat={chitinMat.clearcoat} clearcoatRoughness={chitinMat.clearcoatRoughness} />
            ) : (
              <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.08} />
            )}
          </mesh>
          <mesh position={[0, -0.50, 0.06]} castShadow geometry={pawGeo}>
            <meshStandardMaterial color={"#0b1020"} roughness={0.78} metalness={0.18} />
          </mesh>
          {[-0.04, 0, 0.04].map((x) => (
            <mesh key={x} position={[x, -0.50, 0.14]} rotation={[0.25, 0, 0]} castShadow>
              <coneGeometry args={[0.014, 0.07, 6]} />
              <meshStandardMaterial color="#e8e8ee" roughness={0.2} metalness={0.6} emissive="#8888aa" emissiveIntensity={0.08} />
            </mesh>
          ))}
        </group>

        <group ref={rightArmRef} position={[0.28, 0.38, 0.02]} rotation={[0, 0, -0.55]}>
          <mesh castShadow geometry={limbUpperGeo}>
            {useScales ? (
              <meshPhysicalMaterial color={furColor} metalness={scaleMat.metalness} roughness={scaleMat.roughness} clearcoat={scaleMat.clearcoat} clearcoatRoughness={scaleMat.clearcoatRoughness} />
            ) : useChitin ? (
              <meshPhysicalMaterial color={furColor} metalness={chitinMat.metalness} roughness={chitinMat.roughness} clearcoat={chitinMat.clearcoat} clearcoatRoughness={chitinMat.clearcoatRoughness} />
            ) : (
              <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.08} />
            )}
          </mesh>
          <mesh position={[0, -0.28, 0]} castShadow geometry={limbLowerGeo}>
            {useScales ? (
              <meshPhysicalMaterial color={furColor} metalness={scaleMat.metalness} roughness={scaleMat.roughness} clearcoat={scaleMat.clearcoat} clearcoatRoughness={scaleMat.clearcoatRoughness} />
            ) : useChitin ? (
              <meshPhysicalMaterial color={furColor} metalness={chitinMat.metalness} roughness={chitinMat.roughness} clearcoat={chitinMat.clearcoat} clearcoatRoughness={chitinMat.clearcoatRoughness} />
            ) : (
              <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.08} />
            )}
          </mesh>
          <mesh position={[0, -0.50, 0.06]} castShadow geometry={pawGeo}>
            <meshStandardMaterial color={"#0b1020"} roughness={0.78} metalness={0.18} />
          </mesh>
          {[-0.04, 0, 0.04].map((x) => (
            <mesh key={x} position={[x, -0.50, 0.14]} rotation={[0.25, 0, 0]} castShadow>
              <coneGeometry args={[0.014, 0.07, 6]} />
              <meshStandardMaterial color="#e8e8ee" roughness={0.2} metalness={0.6} emissive="#8888aa" emissiveIntensity={0.08} />
            </mesh>
          ))}
        </group>

        {/* Legs (digitigrade) */}
        <group ref={leftLegRef} position={[-0.14, 0.02, 0.02]}>
          <mesh castShadow geometry={limbUpperGeo}>
            {useScales ? (
              <meshPhysicalMaterial color={furColor} metalness={scaleMat.metalness} roughness={scaleMat.roughness} clearcoat={scaleMat.clearcoat} clearcoatRoughness={scaleMat.clearcoatRoughness} />
            ) : useChitin ? (
              <meshPhysicalMaterial color={furColor} metalness={chitinMat.metalness} roughness={chitinMat.roughness} clearcoat={chitinMat.clearcoat} clearcoatRoughness={chitinMat.clearcoatRoughness} />
            ) : (
              <meshStandardMaterial color={furColor} roughness={0.9} metalness={0.05} />
            )}
          </mesh>
          <mesh position={[0.02, -0.38, 0.12]} rotation={[0.55, 0, 0]} castShadow geometry={limbLowerGeo}>
            {useScales ? (
              <meshPhysicalMaterial color={furColor} metalness={scaleMat.metalness} roughness={scaleMat.roughness} clearcoat={scaleMat.clearcoat} clearcoatRoughness={scaleMat.clearcoatRoughness} />
            ) : useChitin ? (
              <meshPhysicalMaterial color={furColor} metalness={chitinMat.metalness} roughness={chitinMat.roughness} clearcoat={chitinMat.clearcoat} clearcoatRoughness={chitinMat.clearcoatRoughness} />
            ) : (
              <meshStandardMaterial color={furColor} roughness={0.9} metalness={0.05} />
            )}
          </mesh>
          <mesh position={[0.05, -0.62, 0.30]} rotation={[0.10, 0, 0]} castShadow geometry={footGeo}>
            <meshStandardMaterial color={"#0b1020"} roughness={0.78} metalness={0.18} />
          </mesh>
          {[-0.05, 0, 0.05].map((x) => (
            <mesh key={`lf-claw-${x}`} position={[0.05 + x, -0.64, 0.42]} rotation={[0.35, 0, 0]} castShadow>
              <coneGeometry args={[0.012, 0.07, 6]} />
              <meshStandardMaterial color={"#e8e8ee"} roughness={0.45} metalness={0.35} />
            </mesh>
          ))}
          {/* Boot/greave (more “hero” silhouette) */}
          {hasCinematicJacket && !isTurtle && (
            <mesh position={[0.06, -0.64, 0.32]} rotation={[0.08, 0, 0]} castShadow geometry={bootGeo}>
              <meshStandardMaterial color={"#050508"} roughness={0.55} metalness={0.28} emissive={jacketTrim} emissiveIntensity={0.06} />
            </mesh>
          )}
        </group>

        <group ref={rightLegRef} position={[0.14, 0.02, 0.02]}>
          <mesh castShadow geometry={limbUpperGeo}>
            {useScales ? (
              <meshPhysicalMaterial color={furColor} metalness={scaleMat.metalness} roughness={scaleMat.roughness} clearcoat={scaleMat.clearcoat} clearcoatRoughness={scaleMat.clearcoatRoughness} />
            ) : useChitin ? (
              <meshPhysicalMaterial color={furColor} metalness={chitinMat.metalness} roughness={chitinMat.roughness} clearcoat={chitinMat.clearcoat} clearcoatRoughness={chitinMat.clearcoatRoughness} />
            ) : (
              <meshStandardMaterial color={furColor} roughness={0.9} metalness={0.05} />
            )}
          </mesh>
          <mesh position={[-0.02, -0.38, 0.12]} rotation={[0.55, 0, 0]} castShadow geometry={limbLowerGeo}>
            {useScales ? (
              <meshPhysicalMaterial color={furColor} metalness={scaleMat.metalness} roughness={scaleMat.roughness} clearcoat={scaleMat.clearcoat} clearcoatRoughness={scaleMat.clearcoatRoughness} />
            ) : useChitin ? (
              <meshPhysicalMaterial color={furColor} metalness={chitinMat.metalness} roughness={chitinMat.roughness} clearcoat={chitinMat.clearcoat} clearcoatRoughness={chitinMat.clearcoatRoughness} />
            ) : (
              <meshStandardMaterial color={furColor} roughness={0.9} metalness={0.05} />
            )}
          </mesh>
          <mesh position={[-0.05, -0.62, 0.30]} rotation={[0.10, 0, 0]} castShadow geometry={footGeo}>
            <meshStandardMaterial color={"#0b1020"} roughness={0.78} metalness={0.18} />
          </mesh>
          {[-0.05, 0, 0.05].map((x) => (
            <mesh key={`rf-claw-${x}`} position={[-0.05 + x, -0.64, 0.42]} rotation={[0.35, 0, 0]} castShadow>
              <coneGeometry args={[0.012, 0.07, 6]} />
              <meshStandardMaterial color={"#e8e8ee"} roughness={0.45} metalness={0.35} />
            </mesh>
          ))}
          {hasCinematicJacket && !isTurtle && (
            <mesh position={[-0.06, -0.64, 0.32]} rotation={[0.08, 0, 0]} castShadow geometry={bootGeo}>
              <meshStandardMaterial color={"#050508"} roughness={0.55} metalness={0.28} emissive={jacketTrim} emissiveIntensity={0.06} />
            </mesh>
          )}
        </group>

        {/* Spider extra legs (reads “arachnid”, not just extra eyes) */}
        {isSpider && (
          <group position={[0, 0.12, -0.06]}>
            {[
              { x: -0.30, z: 0.06, ry: 0.45 },
              { x: -0.32, z: -0.06, ry: 0.62 },
              { x: 0.30, z: 0.06, ry: -0.45 },
              { x: 0.32, z: -0.06, ry: -0.62 },
            ].map((l) => (
              <group key={`${l.x}:${l.z}`} position={[l.x, 0.06, l.z]} rotation={[0.0, l.ry, 0.35]}>
                <mesh castShadow>
                  <capsuleGeometry args={[0.018, 0.26, 6, 10]} />
                  <meshPhysicalMaterial color={furColor} metalness={chitinMat.metalness} roughness={chitinMat.roughness} clearcoat={chitinMat.clearcoat} clearcoatRoughness={chitinMat.clearcoatRoughness} />
                </mesh>
                <mesh position={[0, -0.20, 0.02]} rotation={[0.35, 0, 0]} castShadow>
                  <capsuleGeometry args={[0.014, 0.22, 6, 10]} />
                  <meshPhysicalMaterial color={furColor} metalness={chitinMat.metalness} roughness={chitinMat.roughness} clearcoat={chitinMat.clearcoat} clearcoatRoughness={chitinMat.clearcoatRoughness} />
                </mesh>
              </group>
            ))}
          </group>
        )}

        {/* Wings */}
        {hasWings && (
          <group position={[0, 0.44, -0.08]}>
            <mesh position={[-0.30, 0.0, 0]} rotation={[0.2, 0.6, 0.2]} castShadow>
              <planeGeometry args={[0.60, 0.30]} />
              <meshStandardMaterial
                color={furColor}
                emissive={accent}
                emissiveIntensity={0.08}
                roughness={0.9}
                side={THREE.DoubleSide}
                transparent
                opacity={0.92}
              />
            </mesh>
            <mesh position={[0.30, 0.0, 0]} rotation={[0.2, -0.6, -0.2]} castShadow>
              <planeGeometry args={[0.60, 0.30]} />
              <meshStandardMaterial
                color={furColor}
                emissive={accent}
                emissiveIntensity={0.08}
                roughness={0.9}
                side={THREE.DoubleSide}
                transparent
                opacity={0.92}
              />
            </mesh>
          </group>
        )}

        {/* Quills / spines */}
        {(hasSpines || quillCount > 0) && (
          <group position={[0, 0.44, -0.18]}>
            {Array.from({ length: quillCount || 6 }).map((_, i) => (
              <mesh
                key={i}
                position={[0, 0.02 + i * 0.03 * silhouette.spineScale, -0.02 - i * 0.05 * silhouette.spineScale]}
                rotation={[Math.PI / 2.55, 0, 0]}
                castShadow
              >
                <coneGeometry args={[0.024 * silhouette.spineScale, (0.16 + i * 0.03) * silhouette.spineScale, 5]} />
                <meshStandardMaterial
                  color={accent}
                  emissive={accent}
                  emissiveIntensity={0.18}
                  roughness={0.55}
                  metalness={0.08}
                />
              </mesh>
            ))}
          </group>
        )}

        {/* Tails */}
        {hasThreeMemoryTails && (
          <group position={[0, 0.08, -0.10]}>
            {memoryTailGeometries.map((geo, i) => (
              <mesh
                key={i}
                geometry={geo}
                rotation={[0, (i / 3) * Math.PI * 2, 0]}
                castShadow
              >
                <meshStandardMaterial
                  color={accent}
                  emissive={accent}
                  emissiveIntensity={0.35}
                  roughness={0.35}
                  metalness={0.35}
                  transparent
                  opacity={0.85}
                />
              </mesh>
            ))}
          </group>
        )}

        {!hasThreeMemoryTails && hasTails && !hasTwinMechTails && (
          <group position={[0, 0.14, -0.22]}>
            <mesh position={[0, 0.0, -0.10]} rotation={[0.5, 0, 0]} castShadow>
              <capsuleGeometry args={[0.030 * silhouette.tailRad, 0.24 * silhouette.tailLen, 6, 10]} />
              <meshStandardMaterial color={furColor} roughness={0.85} metalness={0.1} />
            </mesh>
            <mesh position={[0, -0.12, -0.26]} castShadow>
              <dodecahedronGeometry args={[0.045 * silhouette.tailRad, 0]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} roughness={0.3} />
            </mesh>
          </group>
        )}

        {hasTwinMechTails && (
          <group position={[0, 0.10, -0.24]}>
            {[-0.12, 0.12].map((x) => (
              <group key={x} position={[x, 0, 0]} rotation={[0.35, x > 0 ? -0.35 : 0.35, 0]}>
                <mesh castShadow>
                  <capsuleGeometry args={[0.025, 0.24, 6, 10]} />
                  <meshStandardMaterial color={"#0b1020"} roughness={0.55} metalness={0.35} />
                </mesh>
                <mesh position={[0, -0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <boxGeometry args={[0.10, 0.035, 0.14]} />
                  <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} />
                </mesh>
              </group>
            ))}
          </group>
        )}
      </group>

      {/* Aura wings/ribbons (Kai‑Jax style) */}
      {hasAuraWings && (
        <group ref={auraWingRef} position={[0, 1.30, -0.25]}>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[0.55 * side, 0.05, 0]}
              rotation={[0.25, 0.25 * side, 0.15 * side]}
            >
              <planeGeometry args={[1.55, 1.10, 10, 6]} />
              <meshBasicMaterial
                color={accent}
                transparent
                opacity={0.12}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Vein/web layer (emissive ribbons — must survive LOD until very far) */}
      {hasAuraWings && showVeinLayer && auraRibbonGeometries.length > 0 && (
        <group ref={auraRibbonRef} position={[0, 0.0, 0]}>
          {auraRibbonGeometries.map((geo, i) => (
            <mesh
              key={i}
              geometry={geo}
              rotation={[0, (i / auraRibbonGeometries.length) * Math.PI * 2, 0]}
              userData={{ ribbonIndex: i }}
            >
              {lightningRibbonMaterials[i] ? (
                <primitive attach="material" object={lightningRibbonMaterials[i] as unknown as object} />
              ) : (
                <meshBasicMaterial
                  color={i % 2 === 0 ? accent : "#a855f7"}
                  transparent
                  opacity={0.12}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              )}
            </mesh>
          ))}
        </group>
      )}

      {/* Electric aura */}
      {hasElectricAura && (
        <mesh position={[0, 1.15, 0]} scale={2.2}>
          <sphereGeometry args={[0.55, 18, 14]} />
          <meshBasicMaterial color={accent} transparent opacity={0.10} depthWrite={false} />
        </mesh>
      )}

      {/* Invulnerability flash */}
      {isInvulnerable && (
        <mesh position={[0, 1.15, 0]} scale={2.2}>
          <sphereGeometry args={[0.60, 18, 14]} />
          <meshBasicMaterial color={eyeColor} transparent opacity={0.10} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

