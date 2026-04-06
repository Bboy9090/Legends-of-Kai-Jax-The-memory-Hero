export { CombatState, BattleCombatState } from "../game/combat/stateEnums";

/** Battle mode stamina — `game/tuning/combat.json`. */
export { BATTLE_STAMINA } from "../game/tuning/combatTuning";

/** Duel move tables — `game/combat/moveData.ts`. */
export type { AttackType, MoveData, DodgeData } from "../game/combat/moveData";
export { FRAME_TIME, MOVES, ATTACK_TYPE_TO_MOVE } from "../game/combat/moveData";

/** Adventure open-world stamina/combo/dodge — `game/tuning/adventure.json`. */
export { STAMINA_CONFIG, COMBO_CONFIG, DODGE } from "../game/tuning/adventureTuning";

export { attackBreaksGuard, getClashPriority } from "../game/combat/guardAndClash";

export type { EnemyTierConfig, EnemyTierId } from "../game/tuning/enemyTuning";
export { ENEMY_TIERS, ENEMY_TUNING } from "../game/tuning/enemyTuning";

export { isInActiveWindow, getMoveFrameTime } from "../game/combat/frameTiming";
export { getAutoTarget } from "../game/combat/targeting";
