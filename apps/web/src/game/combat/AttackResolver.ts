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
} from "./moveData";
import { getClashPriority } from "./guardAndClash";

export type ClashOutcome = "tie" | "initiator_wins" | "other_wins";
export type MoveKey = keyof typeof MOVES;

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
  const key = ATTACK_TYPE_TO_MOVE[attackType];
  return key && key in MOVES ? (key as MoveKey) : null;
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

/** Total authored move time in seconds at the canonical simulation rate. */
export function totalMoveSeconds(move: MoveData): number {
  const frames = Math.max(0, move.startup) + Math.max(0, move.active) + Math.max(0, move.recovery);
  return frames * FRAME_TIME;
}

/** True when an attack is allowed to spend stamina without underflow. */
export function hasStaminaForAttack(currentStamina: number, type: AttackType): boolean {
  const stamina = Math.max(0, finiteNumber(currentStamina));
  return stamina >= staminaCostForAttack(type);
}
