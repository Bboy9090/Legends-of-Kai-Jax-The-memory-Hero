/**
 * Canonical pure helpers for duel attack resolution.
 *
 * Side effects belong in `useBattle`; this module owns deterministic decisions
 * that must stay identical for player input, AI, tests, replays, and future rollback.
 */
import {
  ATTACK_TYPE_TO_MOVE,
  FRAME_TIME,
  MOVES,
  type AttackType,
  type MoveData,
  type MoveKey,
} from "./moveData";
import { getClashPriority } from "./guardAndClash";

export type ClashOutcome = "tie" | "initiator_wins" | "other_wins";
export interface LaunchVector {
  x: number;
  y: number;
}

const MAX_LIGHT_CHAIN_STEP = 2;

function finiteNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/** Who wins a simultaneous exchange: initiator = attacker currently starting the move. */
export function resolveClash(initiatorPriority: number, otherPriority: number): ClashOutcome {
  const a = finiteNumber(initiatorPriority);
  const b = finiteNumber(otherPriority);
  if (a === b) return "tie";
  return a > b ? "initiator_wins" : "other_wins";
}

export function clashPriorityForAttack(type: AttackType | null | undefined): number {
  return getClashPriority(type);
}

/** Clamp combo state so stale/corrupt values can never create an invalid move key. */
export function normalizeComboStep(comboStep: number): number {
  if (!Number.isFinite(comboStep)) return 0;
  return Math.max(0, Math.min(MAX_LIGHT_CHAIN_STEP, Math.trunc(comboStep)));
}

export function getMoveKeyForPlayerAttack(
  attackType: AttackType,
  comboStep: number
): MoveKey | null {
  if (attackType === "punch") {
    return `light${normalizeComboStep(comboStep) + 1}` as MoveKey;
  }
  return ATTACK_TYPE_TO_MOVE[attackType] ?? null;
}

export function getMoveForAttack(
  attackType: AttackType,
  comboStep = 0
): MoveData | null {
  const key = getMoveKeyForPlayerAttack(attackType, comboStep);
  return key ? MOVES[key] ?? null : null;
}

export function staminaCostForAttack(type: AttackType): number {
  return Math.max(0, getMoveForAttack(type)?.staminaCost ?? 0);
}

export function hitStopSecondsForMove(move: MoveData): number {
  return Math.max(0, move.hitStopFrames) * FRAME_TIME;
}

export function hitstunSecondsForMove(move: MoveData): number {
  return Math.max(0, move.hitstunFrames) * FRAME_TIME;
}

export function blockstunSecondsForMove(move: MoveData): number {
  return Math.max(0, move.blockstunFrames) * FRAME_TIME;
}

/** Total authored move time in seconds at the canonical simulation rate. */
export function totalMoveSeconds(move: MoveData): number {
  const frames = Math.max(0, move.startup) + Math.max(0, move.active) + Math.max(0, move.recovery);
  return frames * FRAME_TIME;
}

/** Convert authored knockback + angle into a facing-aware normalized launch vector. */
export function launchVectorForMove(move: MoveData, facingRight = true): LaunchVector {
  const magnitude = Math.max(0, finiteNumber(move.knockback));
  const angleDeg = Math.max(-89, Math.min(89, finiteNumber(move.launchAngleDeg)));
  const radians = (angleDeg * Math.PI) / 180;
  const direction = facingRight ? 1 : -1;
  return {
    x: Math.cos(radians) * magnitude * direction,
    y: Math.sin(radians) * magnitude,
  };
}

/** True when an attack is allowed to spend stamina without underflow. */
export function hasStaminaForAttack(currentStamina: number, type: AttackType): boolean {
  const stamina = Math.max(0, finiteNumber(currentStamina));
  return stamina >= staminaCostForAttack(type);
}
