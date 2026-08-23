import type { AttackType } from "./moveData";
import { getCharacterMoves } from "../../lib/characterMoves";

export interface BattleAttackRangeOptions {
  transformed?: boolean;
}

const BASE_MELEE_RANGE: Readonly<Record<"punch" | "kick", number>> = Object.freeze({
  punch: 2.2,
  kick: 2.8,
});

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
  return Math.max(0, base * transformedMultiplier);
}
