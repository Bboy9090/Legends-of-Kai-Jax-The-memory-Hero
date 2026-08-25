/**
 * Pure duel posture state resolution.
 *
 * This module deliberately contains no store access or side effects. It defines the
 * authoritative precedence rules used by arena combat and is safe to reuse in tests,
 * replay validation, bots, and future rollback/netcode layers.
 */
import { BattleCombatState } from "./stateEnums";

export type BattleCombatFsmInput = Readonly<{
  playerDodgeTimer: number;
  playerAttacking: boolean;
  guardBreakTimer: number;
  playerHitStunTimer: number;
  /** True when block is held and all gate conditions allow blocking. */
  blocking: boolean;
  playerBlockParryWindow: number;
}>;

function timerActive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Resolve a single authoritative posture.
 *
 * Precedence is intentional:
 * DODGING > GUARD_BROKEN > HITSTUN > ATTACKING > PARRY/BLOCKING > FREE.
 * Forced-loss-of-control states must beat stale attack flags so UI, AI, animation,
 * and input gates all observe the same truth after an interruption.
 */
export function resolveBattleCombatState(p: BattleCombatFsmInput): BattleCombatState {
  if (timerActive(p.playerDodgeTimer)) return BattleCombatState.DODGING;
  if (timerActive(p.guardBreakTimer)) return BattleCombatState.GUARD_BROKEN;
  if (timerActive(p.playerHitStunTimer)) return BattleCombatState.HITSTUN;
  if (p.playerAttacking) return BattleCombatState.ATTACKING;

  if (p.blocking) {
    return timerActive(p.playerBlockParryWindow)
      ? BattleCombatState.PARRY_WINDOW
      : BattleCombatState.BLOCKING;
  }

  return BattleCombatState.FREE;
}

export function isActionLockedCombatState(state: BattleCombatState): boolean {
  return (
    state === BattleCombatState.DODGING ||
    state === BattleCombatState.GUARD_BROKEN ||
    state === BattleCombatState.HITSTUN
  );
}

export function canStartOffensiveAction(state: BattleCombatState): boolean {
  return state === BattleCombatState.FREE;
}
