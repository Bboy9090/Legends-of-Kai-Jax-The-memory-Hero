import { afterEach, describe, expect, it } from 'vitest';
import { useBattle } from '../../lib/stores/useBattle';
import { framesToSeconds } from './frameTiming';

const initial = useBattle.getState();
const snapshot = () => {
  const p = useBattle.getState();
  return { playerAttackElapsed: p.playerAttackElapsed, playerComboStep: p.playerComboStep,
    playerStamina: p.playerStamina, playerAttackHasHit: p.playerAttackHasHit,
    playerAttackType: p.playerAttackType };
};
const setup = (overrides: Record<string, unknown> = {}) => {
  useBattle.setState({ battlePhase: 'fighting', playerAttacking: true,
    playerAttackType: 'punch', playerComboStep: 0, playerAttackElapsed: framesToSeconds(10),
    playerAttackHasHit: true, playerStamina: 20, playerDodgeTimer: 0,
    guardBreakTimer: 0, playerHitStunTimer: 0, ...overrides });
};
afterEach(() => useBattle.setState(initial, true));

describe('arena live-store cancel integration', () => {
  it('debits light2 stamina once and advances the combo', () => {
    setup();
    expect(useBattle.getState().attemptComboCancel()).toBe(true);
    expect(snapshot()).toMatchObject({ playerComboStep: 1, playerStamina: 16,
      playerAttackElapsed: 0, playerAttackHasHit: false });
  });
  it('rejects insufficient stamina without partial state mutation', () => {
    setup({ playerStamina: 3 });
    const before = snapshot();
    expect(useBattle.getState().attemptComboCancel()).toBe(false);
    expect(snapshot()).toEqual(before);
  });
  it('rejects the frame immediately before the authored cancel', () => {
    setup({ playerAttackElapsed: framesToSeconds(9) });
    const before = snapshot();
    expect(useBattle.getState().attemptComboCancel()).toBe(false);
    expect(snapshot()).toEqual(before);
  });
  it.each(['playerHitStunTimer', 'guardBreakTimer', 'playerDodgeTimer'])('rejects %s without mutation', key => {
    setup({ [key]: 0.2 });
    const before = snapshot();
    expect(useBattle.getState().attemptComboCancel()).toBe(false);
    expect(snapshot()).toEqual(before);
  });
  it('requires light3 stamina on second cancel', () => {
    setup({ playerComboStep: 1, playerAttackElapsed: framesToSeconds(11), playerStamina: 6 });
    expect(useBattle.getState().attemptComboCancel()).toBe(false);
    useBattle.setState({ playerStamina: 7 });
    expect(useBattle.getState().attemptComboCancel()).toBe(true);
    expect(snapshot()).toMatchObject({ playerComboStep: 2, playerStamina: 0 });
  });
});
