/**
 * Sovereignty Animation Manifesto — Technical Lockdown
 * One GLB per character. String IDs. 60 FPS. g=18.0 weight.
 */

import * as THREE from "three";

/** Clip identifiers — must match exported GLB clip names exactly. */
export const CLIP_IDS = {
  IDLE: "idle",
  WALK: "walk",
  RUN: "run",
  BURST_STEP: "burst_step",
  LUNGE: "lunge",
  ATK_LIGHT_1: "atk_light_1",
  ATK_LIGHT_2: "atk_light_2",
  ATK_HEAVY: "atk_heavy_finisher",
  PUNCH_LIGHT: "punch_light",
  PUNCH_MED: "punch_med",
  PUNCH_HEAVY: "punch_heavy",
  KICK_LIGHT: "kick_light",
  KICK_MED: "kick_med",
  KICK_HEAVY: "kick_heavy",
  WEB_LAUNCH: "web_launch",
  HIT_LIGHT: "hit_light",
  HIT_HEAVY: "hit_heavy",
  BLOCK_IDLE: "block_idle",
  BLOCK_IMPACT: "block_impact",
  ERASURE_GLITCH: "erasure_glitch",
} as const;

export type ClipId = (typeof CLIP_IDS)[keyof typeof CLIP_IDS];

/** State categories for blend duration lookup. */
export type StateCategory = "loco" | "combat" | "reaction" | "block" | "special";

/** Crossfade durations (seconds) — no floaty transitions. */
export const BLEND_DURATIONS = {
  locoToLoco: 0.2,
  locoToCombat: 0.05,
  combatToLoco: 0.15,
  combatToCombat: 0.08,
  reactionToLoco: 0.15,
} as const;

/** Which category each clip belongs to. */
export const CLIP_CATEGORY: Record<string, StateCategory> = {
  [CLIP_IDS.IDLE]: "loco",
  [CLIP_IDS.WALK]: "loco",
  [CLIP_IDS.RUN]: "loco",
  [CLIP_IDS.BURST_STEP]: "loco",
  [CLIP_IDS.LUNGE]: "combat",
  [CLIP_IDS.ATK_LIGHT_1]: "combat",
  [CLIP_IDS.ATK_LIGHT_2]: "combat",
  [CLIP_IDS.ATK_HEAVY]: "combat",
  [CLIP_IDS.PUNCH_LIGHT]: "combat",
  [CLIP_IDS.PUNCH_MED]: "combat",
  [CLIP_IDS.PUNCH_HEAVY]: "combat",
  [CLIP_IDS.KICK_LIGHT]: "combat",
  [CLIP_IDS.KICK_MED]: "combat",
  [CLIP_IDS.KICK_HEAVY]: "combat",
  [CLIP_IDS.WEB_LAUNCH]: "combat",
  [CLIP_IDS.HIT_LIGHT]: "reaction",
  [CLIP_IDS.HIT_HEAVY]: "reaction",
  [CLIP_IDS.BLOCK_IDLE]: "block",
  [CLIP_IDS.BLOCK_IMPACT]: "block",
  [CLIP_IDS.ERASURE_GLITCH]: "special",
};

/** Clips that can overlay additively on locomotion (upper body only). */
export const ADDITIVE_OVERLAY_CLIPS: Set<string> = new Set([
  CLIP_IDS.WEB_LAUNCH,
]);

/** Bone name patterns for upper body — used for additive overlay masking. */
const UPPER_BODY_PATTERNS = [
  /spine|chest|rib|trunk|back|torso|abdomen/i,
  /neck/i,
  /^head\d*$|skull|jaw|face|snout|cranium/i,
  /shoulder|arm|forearm|bicep|elbow|hand|wrist|claw|fist|finger/i,
  /tail/i, // Kai-Jax tails are upper-body expressives
];

/** True if bone name indicates upper body (spine up, arms, head, tails). */
export function isUpperBodyBone(name: string): boolean {
  const n = name.toLowerCase();
  if (/leg|thigh|knee|shin|calf|foot|ankle|toe|hip|pelvis|groin/i.test(n)) return false;
  return UPPER_BODY_PATTERNS.some((p) => p.test(n));
}

/** Get blend duration for transition from prev to next. */
export function getBlendDuration(prevClip: string | null, nextClip: string): number {
  const prevCat = prevClip ? CLIP_CATEGORY[prevClip] : "loco";
  const nextCat = CLIP_CATEGORY[nextClip] ?? "loco";

  if (nextCat === "loco" && (prevCat === "combat" || prevCat === "reaction")) {
    return BLEND_DURATIONS.combatToLoco;
  }
  if (prevCat === "loco" && nextCat === "loco") {
    return BLEND_DURATIONS.locoToLoco;
  }
  if (prevCat === "loco" && nextCat === "combat") {
    return BLEND_DURATIONS.locoToCombat;
  }
  if ((prevCat === "combat" || prevCat === "block") && nextCat === "combat") {
    return BLEND_DURATIONS.combatToCombat;
  }
  return BLEND_DURATIONS.locoToLoco;
}

/** Fallback order: prefer rigged clip, else legacy ID. */
function pickClip(available: Set<string>, preferred: string, fallback: string): string {
  return available.has(preferred) ? preferred : fallback;
}

/** Map battle attack types to manifest clip IDs. Uses granular clips when available. */
export function battleAttackToClip(
  attackType: "punch" | "kick" | "special" | "ultimate",
  comboStep: number,
  availableClipIds?: Set<string>
): string {
  const avail = availableClipIds ?? new Set<string>();
  const pick = (pref: string, fb: string) => pickClip(avail, pref, fb);

  switch (attackType) {
    case "punch":
      if (comboStep === 0) return pick(CLIP_IDS.PUNCH_LIGHT, CLIP_IDS.ATK_LIGHT_1);
      if (comboStep === 1) return pick(CLIP_IDS.PUNCH_MED, CLIP_IDS.ATK_LIGHT_2);
      return pick(CLIP_IDS.PUNCH_HEAVY, CLIP_IDS.ATK_HEAVY);
    case "kick":
      return pick(CLIP_IDS.KICK_HEAVY, CLIP_IDS.ATK_HEAVY);
    case "special":
      return CLIP_IDS.WEB_LAUNCH;
    case "ultimate":
      return CLIP_IDS.ERASURE_GLITCH;
    default:
      return CLIP_IDS.ATK_LIGHT_1;
  }
}

/** Find a clip in the GLB animations array by name. */
export function findClipByName(animations: THREE.AnimationClip[], name: string): THREE.AnimationClip | null {
  return animations.find((a) => a.name === name) ?? null;
}

/** Copy upper-body bone transforms from overlay skeleton to main. */
export function copyUpperBodyBones(mainRoot: THREE.Object3D, overlayRoot: THREE.Object3D): void {
  const mainBones = new Map<string, THREE.Bone>();
  const overlayBones = new Map<string, THREE.Bone>();

  mainRoot.traverse((obj) => {
    if (obj.type === "Bone" && obj.name) mainBones.set(obj.name, obj as THREE.Bone);
  });
  overlayRoot.traverse((obj) => {
    if (obj.type === "Bone" && obj.name) overlayBones.set(obj.name, obj as THREE.Bone);
  });

  for (const [name, mainBone] of mainBones) {
    if (!isUpperBodyBone(name)) continue;
    const overlayBone = overlayBones.get(name);
    if (!overlayBone) continue;
    mainBone.quaternion.copy(overlayBone.quaternion);
    mainBone.position.copy(overlayBone.position);
  }
}
