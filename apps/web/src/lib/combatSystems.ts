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
export type {
  AttackType,
  DodgeData,
  HitLevel,
  MoveData,
  MoveKey,
} from "../game/combat/moveData";
export {
  FRAME_RATE,
  FRAME_TIME,
  MOVES,
  ATTACK_TYPE_TO_MOVE,
} from "../game/combat/moveData";

/** Canonical per-fighter combat identity — movement, defense, aerial, reaction and combo rules. */
export type {
  FighterAerialProfile,
  FighterArchetype,
  FighterCombatProfile,
  FighterComboProfile,
  FighterComboRoute,
  FighterDefenseProfile,
  FighterMovementProfile,
  FighterReactionProfile,
  HitReactionClass,
} from "../game/characters/shared/FighterCombatProfile";
export {
  DEFAULT_FIGHTER_COMBAT_PROFILE,
  FIGHTER_COMBAT_PROFILES,
  getFighterCombatProfile,
  getResolvedMovementTuning,
  resolveCombatProfileId,
} from "../game/characters/shared/FighterCombatProfile";

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
  blockstunSecondsForMove,
  clashPriorityForAttack,
  getMoveForAttack,
  getMoveKeyForPlayerAttack,
  hasStaminaForAttack,
  hitStopSecondsForMove,
  hitstunSecondsForMove,
  launchVectorForMove,
  normalizeComboStep,
  resolveClash,
  staminaCostForAttack,
  totalMoveSeconds,
} from "../game/combat/AttackResolver";

/** Combat-design doctrine: counter hits, juggle budgets, defensive escape, stage impacts. */
export type {
  CounterHitContext,
  CounterHitResult,
  DefensiveEscapeInput,
  DefensiveEscapeResult,
  HitOutcome,
  JuggleResult,
  JuggleState,
  StageImpactInput,
  StageImpactKind,
  StageImpactResult,
} from "../game/combat/combatDoctrine";
export {
  COMBAT_DOCTRINE_LIMITS,
  resolveCounterHit,
  resolveDefensiveEscape,
  resolveJuggleHit,
  resolveStageImpact,
} from "../game/combat/combatDoctrine";

export type { EnemyTierConfig, EnemyTierId } from "../game/tuning/enemyTuning";
export { ENEMY_TIERS, ENEMY_TUNING } from "../game/tuning/enemyTuning";

export {
  framesToSeconds,
  getMoveFrameTime,
  isInActiveWindow,
  isMoveComplete,
} from "../game/combat/frameTiming";
export { getAutoTarget } from "../game/combat/targeting";
