import { MOVES, type MoveKey } from './moveData';
import { getMoveFrameTime } from './frameTiming';

export type CancelDenial = 'state_locked' | 'invalid_route' | 'too_early' | 'insufficient_stamina';
export type CancelDecision = { allowed: true } | { allowed: false; reason: CancelDenial };
export type CancelState = Readonly<{
  currentMove: MoveKey;
  elapsedSeconds: number;
  attacking: boolean;
  dodging: boolean;
  guardBroken: boolean;
  hitstun: boolean;
  stamina: number;
}>;

/** Pure early-chain gate. Caller must debit stamina exactly once after acceptance. */
export function evaluateCancelTransition(state: CancelState, nextAttack: MoveKey): CancelDecision {
  if (!state.attacking || state.dodging || state.guardBroken || state.hitstun)
    return { allowed: false, reason: 'state_locked' };
  if (!((state.currentMove === 'light1' && nextAttack === 'light2') ||
        (state.currentMove === 'light2' && nextAttack === 'light3')))
    return { allowed: false, reason: 'invalid_route' };
  const move = MOVES[state.currentMove];
  if (move.cancelAt <= 0 || !Number.isFinite(state.elapsedSeconds) ||
      state.elapsedSeconds < getMoveFrameTime(move).cancelTime)
    return { allowed: false, reason: 'too_early' };
  if (!Number.isFinite(state.stamina) || state.stamina < MOVES[nextAttack].staminaCost)
    return { allowed: false, reason: 'insufficient_stamina' };
  return { allowed: true };
}
