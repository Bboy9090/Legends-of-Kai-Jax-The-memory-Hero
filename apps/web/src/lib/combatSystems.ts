export { CombatState, BattleCombatState } from "../game/combat/stateEnums";

/** Battle mode stamina / input / impact tuning — `game/tuning/combat.json`. */
export {
  BATTLE_STAMINA,
  COMBAT_INPUT,
  COMBAT_IMPACT,
  COMBAT_TUNING,
  PLAYER_DODGE,
} from "../game/tuning/combatTuning";

/** Duel move tables — `game/combat/moveData.ts`. */
export type { AttackType, MoveData, DodgeData } from "../game/combat/moveData";
export { FRAME_TIME, MOVES, ATTACK_TYPE_TO_MOVE } from "../game/combat/moveData";

/** Adventure open-world stamina/combo/dodge — `game/tuning/adventure.json`. */
export { STAMINA_CONFIG, COMBO_CONFIG, DODGE } from "../game/tuning/adventureTuning";

/** Pure guard, clash, timing, and attack-resolution rules. */
export {
  GUARD_PRESSURE_BY_ATTACK,
  CLASH_PRIORITY_BY_ATTACK,
  attackBreaksGuard,
  getClashPriority,
} from "../game/combat/guardAndClash";
export {
  clashPriorityForAttack,
  getMoveForAttack,
  getMoveKeyForPlayerAttack,
  hasStaminaForAttack,
  hitStopSecondsForMove,
  normalizeComboStep,
  resolveClash,
  staminaCostForAttack,
  totalMoveSeconds,
} from "../game/combat/AttackResolver";

export type { EnemyTierConfig, EnemyTierId } from "../game/tuning/enemyTuning";
export { ENEMY_TIERS, ENEMY_TUNING } from "../game/tuning/enemyTuning";

export {
  framesToSeconds,
  getMoveFrameTime,
  isInActiveWindow,
  isMoveComplete,
} from "../game/combat/frameTiming";
export { getAutoTarget } from "../game/combat/targeting";
