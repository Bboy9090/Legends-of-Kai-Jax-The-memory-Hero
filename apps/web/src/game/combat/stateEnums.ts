/** Adventure / open-world player combat posture. */
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
