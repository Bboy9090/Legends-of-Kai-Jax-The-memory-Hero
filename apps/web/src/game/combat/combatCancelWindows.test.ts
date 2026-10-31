import { describe, expect, it } from 'vitest';
import { getMoveFrameTime, framesToSeconds, isMoveComplete } from './frameTiming';
import { MOVES, type MoveKey } from './moveData';
import { resolveBattleCombatState, isActionLockedCombatState } from './CombatStateMachine';
import { BattleCombatState } from './stateEnums';
import { queueBufferedAttack, tickBufferedAttack, isBufferedAttackActive } from './inputBuffer';

// Characterization tests for certified data and pure helpers. They do NOT
// imply that both runtime controllers already enforce the proposed contract.
const earlyCancelEligible = (move: MoveKey, frame: number) => {
  const data = MOVES[move];
  return data.cancelAt > 0 && framesToSeconds(frame) >= getMoveFrameTime(data).cancelTime;
};

const posture = (overrides: Partial<Parameters<typeof resolveBattleCombatState>[0]> = {}) =>
  resolveBattleCombatState({
    playerDodgeTimer: 0, playerAttacking: true, guardBreakTimer: 0,
    playerHitStunTimer: 0, blocking: false, playerBlockParryWindow: 0,
    ...overrides,
  });

describe('Mission 6 cancel-window contract: existing foundations', () => {
  it.each([
    ['light1', 9, false], ['light1', 10, true],
    ['light2', 10, false], ['light2', 11, true],
  ] as const)('%s at authored frame %i eligibility is %s', (move, frame, allowed) => {
    expect(earlyCancelEligible(move, frame)).toBe(allowed);
  });

  it.each(['light3', 'heavy', 'skill'] as const)('%s has no early cancel', move => {
    expect(MOVES[move].cancelAt).toBe(0);
    expect(earlyCancelEligible(move, 0)).toBe(false);
    expect(earlyCancelEligible(move, 999)).toBe(false);
    expect(getMoveFrameTime(MOVES[move]).cancelTime).toBe(getMoveFrameTime(MOVES[move]).totalTime);
  });

  it('only the authored light-chain edges have early cancel metadata', () => {
    expect(Object.entries(MOVES).filter(([, move]) => move.cancelAt > 0).map(([key]) => key))
      .toEqual(['light1', 'light2']);
  });

  it.each([
    [{ playerDodgeTimer: 0.1 }, BattleCombatState.DODGING],
    [{ guardBreakTimer: 0.1 }, BattleCombatState.GUARD_BROKEN],
    [{ playerHitStunTimer: 0.1 }, BattleCombatState.HITSTUN],
  ] as const)('forced interruption %j locks offensive actions', (flags, expected) => {
    const state = posture(flags);
    expect(state).toBe(expected);
    expect(isActionLockedCombatState(state)).toBe(true);
  });

  it('does not treat authored cancel metadata as a stamina authorization', () => {
    expect(MOVES.light2.staminaCost).toBeGreaterThan(0);
    expect(MOVES.light3.staminaCost).toBeGreaterThan(0);
    // Runtime stamina debiting is a separate gate in arena/adventure controllers.
    expect(earlyCancelEligible('light1', 10)).toBe(true);
  });

  it('input buffering expires at zero gameplay time and remains stable at zero delta (paused simulation)', () => {
    const buffered = queueBufferedAttack('punch', 0.1);
    expect(tickBufferedAttack(buffered, 0)).toEqual(buffered);
    expect(isBufferedAttackActive(tickBufferedAttack(buffered, 0.099))).toBe(true);
    expect(tickBufferedAttack(buffered, 0.1)).toBeNull();
  });

  it('move completion is separate from early cancel permission', () => {
    expect(isMoveComplete(MOVES.light1, framesToSeconds(10))).toBe(false);
    expect(isMoveComplete(MOVES.light1, framesToSeconds(17))).toBe(true);
  });
});
