import { describe, expect, it } from 'vitest';
import { getBossEncounter } from './bossEncounters';
import { abilitiesFor, activeBossPhase, matrixIdFor, phaseNumber, resolveBoss, ultimateState } from './combatIntel';

const ashen = getBossEncounter('ashen-enforcer')!;

describe('combatIntel boss phases', () => {
  it('maps the Ashen Tiger fighter onto the Ashen Enforcer encounter', () => {
    expect(resolveBoss('ashen-tiger')?.id).toBe('ashen-enforcer');
    expect(resolveBoss('void-stalker')?.id).toBe('void-stalker');
    expect(resolveBoss('kai')).toBeNull();
    expect(resolveBoss('')).toBeNull();
  });

  it('selects phase 1 at full health, phase 2 at 50%, phase 3 at 25%', () => {
    expect(phaseNumber(ashen, activeBossPhase(ashen, 100)!)).toBe(1);
    expect(phaseNumber(ashen, activeBossPhase(ashen, 80)!)).toBe(1);
    expect(phaseNumber(ashen, activeBossPhase(ashen, 50)!)).toBe(2);
    expect(phaseNumber(ashen, activeBossPhase(ashen, 40)!)).toBe(2);
    expect(phaseNumber(ashen, activeBossPhase(ashen, 25)!)).toBe(3);
    expect(phaseNumber(ashen, activeBossPhase(ashen, 0)!)).toBe(3);
  });

  it('clamps out-of-range health and handles bosses without phases', () => {
    expect(phaseNumber(ashen, activeBossPhase(ashen, 250)!)).toBe(1);
    expect(phaseNumber(ashen, activeBossPhase(ashen, -5)!)).toBe(3);
    expect(activeBossPhase({ ...ashen, phases: [] }, 50)).toBeNull();
  });
});

describe('combatIntel abilities and ultimate', () => {
  it('normalises fighter ids to power-matrix ids', () => {
    expect(matrixIdFor('kaijax')).toBe('kai-jax');
    expect(matrixIdFor('jax')).toBe('jax');
    expect(abilitiesFor('kaijax').length).toBeGreaterThan(0);
    expect(abilitiesFor('does-not-exist')).toEqual([]);
  });

  it('ultimate is ready only when the meter is full and the fighter may channel it', () => {
    const half = ultimateState('jax', 50, 100, false, true)!;
    expect(half.ready).toBe(false);
    expect(Math.round(half.percent)).toBe(50);
    expect(ultimateState('jax', 100, 100, false, true)!.ready).toBe(true);
    expect(ultimateState('jax', 100, 100, false, false)!.ready).toBe(false);
    expect(ultimateState('jax', 100, 100, true, false)!.ready).toBe(true);
    expect(ultimateState('jax', 500, 100, true, true)!.percent).toBe(100);
    expect(ultimateState('jax', 10, 0, true, true)!.percent).toBe(0);
    expect(ultimateState('nobody', 100, 100, true, true)).toBeNull();
  });
});
