/**
 * Sovereignty Animation Controller
 * Clip-based state machine with strict crossfade durations. No floaty transitions.
 */

import * as THREE from "three";
import {
  CLIP_IDS,
  getBlendDuration,
  battleAttackToClip,
  ADDITIVE_OVERLAY_CLIPS,
} from "./animationManifest";

export interface SovereigntyAnimInput {
  isMoving: boolean;
  speed: number;
  isAttacking: boolean;
  attackType: "punch" | "kick" | "special" | "ultimate" | null;
  comboStep: number;
  isGrounded: boolean;
  isJumping: boolean;
  isInvulnerable: boolean;
  isHitHeavy: boolean;
  isBlocking?: boolean;
  isBurstStepping?: boolean;
  isErasureActive?: boolean;
}

/** Resolve which base clip to play from game state. Combat > Locomotion. */
export function resolveBaseClip(input: SovereigntyAnimInput): string {
  if (input.isErasureActive) return CLIP_IDS.ERASURE_GLITCH;
  if (input.isInvulnerable) return input.isHitHeavy ? CLIP_IDS.HIT_HEAVY : CLIP_IDS.HIT_LIGHT;
  if (input.isBlocking) return CLIP_IDS.BLOCK_IDLE;
  if (input.isAttacking && input.attackType) {
    return battleAttackToClip(input.attackType, input.comboStep);
  }
  if (input.isBurstStepping) return CLIP_IDS.BURST_STEP;
  if (!input.isGrounded && input.isJumping) {
    return CLIP_IDS.RUN; // Fallback: use run in air if no jump clip
  }
  if (input.isMoving) {
    return input.speed > 0.7 ? CLIP_IDS.RUN : CLIP_IDS.WALK;
  }
  return CLIP_IDS.IDLE;
}

/** When additive overlay is active: overlay clip + base loco clip. Returns { overlay, base } or null. */
export function resolveAdditiveMode(
  targetClip: string,
  prevClip: string | null,
  input: SovereigntyAnimInput
): { overlay: string; base: string } | null {
  if (!isAdditiveOverlay(targetClip)) return null;
  const isLoco = prevClip === CLIP_IDS.RUN || prevClip === CLIP_IDS.WALK;
  if (!isLoco) return null;
  const base = input.speed > 0.7 ? CLIP_IDS.RUN : CLIP_IDS.WALK;
  return { overlay: targetClip, base };
}

/** Check if this clip can be additive overlay (upper body only). */
export function isAdditiveOverlay(clipId: string): boolean {
  return ADDITIVE_OVERLAY_CLIPS.has(clipId);
}

/** Loop mode per clip type. */
export function getLoopMode(clipId: string): THREE.AnimationActionLoopStyles {
  switch (clipId) {
    case CLIP_IDS.IDLE:
    case CLIP_IDS.WALK:
    case CLIP_IDS.RUN:
    case CLIP_IDS.BLOCK_IDLE:
      return THREE.LoopRepeat;
    default:
      return THREE.LoopOnce;
  }
}

/** Should clamp at end when LoopOnce finishes. */
export function shouldClampWhenFinished(clipId: string): boolean {
  return clipId === CLIP_IDS.ATK_LIGHT_1 || clipId === CLIP_IDS.ATK_LIGHT_2 ||
    clipId === CLIP_IDS.ATK_HEAVY || clipId === CLIP_IDS.WEB_LAUNCH ||
    clipId === CLIP_IDS.HIT_LIGHT || clipId === CLIP_IDS.HIT_HEAVY ||
    clipId === CLIP_IDS.BURST_STEP;
}

export interface ActionEntry {
  action: THREE.AnimationAction;
  clipId: string;
}

/**
 * Creates and configures all animation actions from clips.
 * Call once when mixer is ready.
 */
export function createActions(
  mixer: THREE.AnimationMixer,
  animations: THREE.AnimationClip[],
  clipIds: string[],
  findClip: (anims: THREE.AnimationClip[], name: string) => THREE.AnimationClip | null
): Map<string, THREE.AnimationAction> {
  const actions = new Map<string, THREE.AnimationAction>();
  for (const clipId of clipIds) {
    const clip = findClip(animations, clipId);
    if (!clip) continue;
    const action = mixer.clipAction(clip);
    const mode = getLoopMode(clipId);
    action.setLoop(mode, mode === THREE.LoopRepeat ? Infinity : 1);
    if (shouldClampWhenFinished(clipId)) {
      action.clampWhenFinished = true;
    }
    action.setEffectiveWeight(0);
    actions.set(clipId, action);
  }
  return actions;
}

/**
 * Crossfade from current action to target.
 */
export function crossfadeTo(
  _mixer: THREE.AnimationMixer,
  currentAction: THREE.AnimationAction | null,
  currentClipId: string | null,
  targetAction: THREE.AnimationAction,
  targetClipId: string
): void {
  const duration = getBlendDuration(currentClipId, targetClipId);
  if (currentAction) {
    currentAction.crossFadeTo(targetAction, duration, false);
  } else {
    targetAction.setEffectiveWeight(1);
  }
  targetAction.play();
  targetAction.enabled = true;
}

/**
 * Get the list of clip IDs we expect to find in the GLB.
 */
export function getExpectedClipIds(): string[] {
  return [
    CLIP_IDS.IDLE,
    CLIP_IDS.WALK,
    CLIP_IDS.RUN,
    CLIP_IDS.BURST_STEP,
    CLIP_IDS.ATK_LIGHT_1,
    CLIP_IDS.ATK_LIGHT_2,
    CLIP_IDS.ATK_HEAVY,
    CLIP_IDS.WEB_LAUNCH,
    CLIP_IDS.HIT_LIGHT,
    CLIP_IDS.HIT_HEAVY,
    CLIP_IDS.BLOCK_IDLE,
    CLIP_IDS.BLOCK_IMPACT,
    CLIP_IDS.ERASURE_GLITCH,
  ];
}
