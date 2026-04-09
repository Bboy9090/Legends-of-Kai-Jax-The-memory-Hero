/**
 * Pure helpers for attack clash resolution, move key selection, and stamina costs.
 * Gameplay side effects stay in useBattle; these are the canonical rules.
 */
import {
  ATTACK_TYPE_TO_MOVE,
  FRAME_TIME,
  MOVES,
  type AttackType,
} from "./moveData";
import { getClashPriority } from "./guardAndClash";

export type ClashOutcome = "tie" | "initiator_wins" | "other_wins";

/** Who wins a simultaneous exchange: initiator = current attacker starting their attack. */
export function resolveClash(initiatorPriority: number, otherPriority: number): ClashOutcome {
  if (initiatorPriority === otherPriority) return "tie";
  return initiatorPriority > otherPriority ? "initiator_wins" : "other_wins";
}

export function clashPriorityForAttack(type: AttackType | null | undefined): number {
  return getClashPriority(type);
}

export function getMoveKeyForPlayerAttack(
  attackType: AttackType,
  comboStep: number
): keyof typeof MOVES | null {
  if (attackType === "punch") {
    return `light${Math.min(comboStep + 1, 3)}` as keyof typeof MOVES;
  }
  const k = ATTACK_TYPE_TO_MOVE[attackType];
  return k ? (k as keyof typeof MOVES) : null;
}

export function staminaCostForAttack(type: AttackType): number {
  if (type === "ultimate") {
    return MOVES.heavy?.staminaCost ?? 25;
  }
  const moveKey = ATTACK_TYPE_TO_MOVE[type];
  const move = moveKey ? MOVES[moveKey] : null;
  return move?.staminaCost ?? 0;
}

export function hitStopSecondsForMove(move: (typeof MOVES)[keyof typeof MOVES]): number {
  return move.hitStopFrames * FRAME_TIME;
}
