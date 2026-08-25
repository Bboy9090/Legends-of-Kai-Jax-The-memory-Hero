import type { AttackType } from "./moveData";
import { getCharacterMoves } from "../../lib/characterMoves";

export interface BattleAttackRangeOptions {
  transformed?: boolean;
  /** Optional designer/authored additive forgiveness in world units. */
  contactPadding?: number;
}

export interface BattleAttackContactInput extends BattleAttackRangeOptions {
  attackerX: number;
  defenderX: number;
  fighterId: string;
  attackType: AttackType;
}

const BASE_MELEE_RANGE: Readonly<Record<"punch" | "kick", number>> = Object.freeze({
  punch: 2.2,
  kick: 2.8,
});

function finiteNonNegative(value: number, fallback = 0): number {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

/**
 * Canonical duel attack reach in world units.
 *
 * This is deliberately the only place that applies transformation reach scaling
 * and optional contact padding. Runtime hit checks, clash checks, AI evaluation,
 * and Training Lab visualization should all consume this function or the contact
 * predicate below so authored reach cannot drift across systems.
 */
export function getBattleAttackRange(
  fighterId: string,
  attackType: AttackType,
  options: BattleAttackRangeOptions = {}
): number {
  const moves = getCharacterMoves(fighterId);
  const base =
    attackType === "ultimate"
      ? moves.ultimateRange
      : attackType === "special"
        ? moves.specialRange
        : BASE_MELEE_RANGE[attackType];

  const transformedMultiplier = options.transformed ? 1.5 : 1;
  const padding = finiteNonNegative(options.contactPadding ?? 0);
  return Math.max(0, finiteNonNegative(base) * transformedMultiplier + padding);
}

/**
 * Canonical scalar contact test for the duel arena.
 *
 * Contact is inclusive at the authored boundary. Invalid coordinates fail closed
 * so corrupt transforms can never manufacture a phantom hit or clash.
 */
export function isWithinBattleAttackRange(input: BattleAttackContactInput): boolean {
  if (!Number.isFinite(input.attackerX) || !Number.isFinite(input.defenderX)) return false;
  const range = getBattleAttackRange(input.fighterId, input.attackType, input);
  return Math.abs(input.defenderX - input.attackerX) <= range;
}
