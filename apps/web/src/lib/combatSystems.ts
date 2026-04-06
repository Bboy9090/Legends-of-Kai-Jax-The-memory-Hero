export enum CombatState {
  FREE = "FREE",
  ATTACKING = "ATTACKING",
  DODGING = "DODGING",
  HITSTUN = "HITSTUN",
  BLOCKING = "BLOCKING",
}

/** Duel / arena mode: formal FSM for player combat posture (separate from round `battlePhase`). */
export enum BattleCombatState {
  FREE = "FREE",
  ATTACKING = "ATTACKING",
  DODGING = "DODGING",
  BLOCKING = "BLOCKING",
  /** Brief window after block start — perfect parry */
  PARRY_WINDOW = "PARRY_WINDOW",
  HITSTUN = "HITSTUN",
  GUARD_BROKEN = "GUARD_BROKEN",
}

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
