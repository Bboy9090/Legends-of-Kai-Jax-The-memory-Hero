/**
 * Sovereignty Animation Manifesto — Technical Lockdown
 * One GLB per character. String IDs. 60 FPS. g=18.0 weight.
 */

import type * as THREE from "three";

/** Clip identifiers — must match exported GLB clip names exactly. */
export const CLIP_IDS = {
  IDLE: "idle",
  WALK: "walk",
  RUN: "run",
  BURST_STEP: "burst_step",
  ATK_LIGHT_1: "atk_light_1",
  ATK_LIGHT_2: "atk_light_2",
  ATK_HEAVY: "atk_heavy_finisher",
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
  [CLIP_IDS.ATK_LIGHT_1]: "combat",
  [CLIP_IDS.ATK_LIGHT_2]: "combat",
  [CLIP_IDS.ATK_HEAVY]: "combat",
  [CLIP_IDS.WEB_LAUNCH]: "combat",
  [CLIP_IDS.HIT_LIGHT]: "reaction",
  [CLIP_IDS.HIT_HEAVY]: "reaction",
  [CLIP_IDS.BLOCK_IDLE]: "block",
  [CLIP_IDS.BLOCK_IMPACT]: "block",
  [CLIP_IDS.ERASURE_GLITCH]: "special",
};

/** Clips that can overlay additively on locomotion (upper body only).
 *  TODO: Implement bone-masked additive layer for web_launch during run.
 *  Currently uses full crossfade (0.05s loco→combat) for snap-to feel. */
export const ADDITIVE_OVERLAY_CLIPS: Set<string> = new Set([
  CLIP_IDS.WEB_LAUNCH,
]);

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

/** Map battle attack types to manifest clip IDs. */
export function battleAttackToClip(
  attackType: "punch" | "kick" | "special" | "ultimate",
  comboStep: number
): string {
  switch (attackType) {
    case "punch":
      return comboStep === 0 ? CLIP_IDS.ATK_LIGHT_1 : comboStep === 1 ? CLIP_IDS.ATK_LIGHT_2 : CLIP_IDS.ATK_HEAVY;
    case "kick":
      return CLIP_IDS.ATK_HEAVY;
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
