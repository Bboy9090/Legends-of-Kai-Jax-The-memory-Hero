/**
 * Pure battle duel posture FSM (player combat state — not round `battlePhase`).
 * Extracted from useBattle.tickBattleCombatFsm for canonical reuse and tests.
 */
import { BattleCombatState } from "./stateEnums";

export type BattleCombatFsmInput = {
  playerDodgeTimer: number;
  playerAttacking: boolean;
  guardBreakTimer: number;
  playerHitStunTimer: number;
  /** True when block is held and all gate conditions allow blocking */
  blocking: boolean;
  playerBlockParryWindow: number;
};

export function resolveBattleCombatState(p: BattleCombatFsmInput): BattleCombatState {
  if (p.playerDodgeTimer > 0) return BattleCombatState.DODGING;
  if (p.playerAttacking) return BattleCombatState.ATTACKING;
  if (p.guardBreakTimer > 0) return BattleCombatState.GUARD_BROKEN;
  if (p.playerHitStunTimer > 0) return BattleCombatState.HITSTUN;
  if (p.blocking) {
    return p.playerBlockParryWindow > 0
      ? BattleCombatState.PARRY_WINDOW
      : BattleCombatState.BLOCKING;
  }
  return BattleCombatState.FREE;
}
