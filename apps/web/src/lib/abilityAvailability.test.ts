import { describe, expect, it } from 'vitest';
import { CombatState } from '../game/combat/stateEnums';
import { MOVES } from '../game/combat/moveData';
import { DODGE, STAMINA_CONFIG } from '../game/tuning/adventureTuning';
import { abilityAvailability, describeAvailability, staminaCostFor } from './abilityAvailability';

const free = (stamina: number) => ({ stamina, combatState: CombatState.FREE });

describe('abilityAvailability mirrors the controller gating', () => {
  it('uses the real move/dodge costs', () => {
    expect(staminaCostFor('attack')).toBe(MOVES.light1.staminaCost);
    expect(staminaCostFor('heavy')).toBe(MOVES.heavy.staminaCost);
    expect(staminaCostFor('skill')).toBe(MOVES.skill.staminaCost);
    expect(staminaCostFor('dodge')).toBe(DODGE.staminaCost);
  });

  it('is ready with full stamina while FREE', () => {
    for (const a of ['attack', 'heavy', 'skill', 'dodge'] as const) {
      const r = abilityAvailability(a, free(STAMINA_CONFIG.max));
      expect(r.ready).toBe(true);
      expect(r.reason).toBeNull();
      expect(r.progress).toBe(1);
    }
  });

  it('blocks on insufficient stamina with proportional progress', () => {
    const cost = MOVES.heavy.staminaCost;
    const stamina = Math.max(STAMINA_CONFIG.exhaustedThreshold, cost - 1);
    const r = abilityAvailability('heavy', free(stamina));
    if (stamina < cost) {
      expect(r.ready).toBe(false);
      expect(r.reason).toBe('low-stamina');
      expect(r.progress).toBeCloseTo(stamina / cost, 5);
    }
  });

  it('reports exhaustion below the exhausted threshold', () => {
    const r = abilityAvailability('attack', free(STAMINA_CONFIG.exhaustedThreshold - 1));
    expect(r.ready).toBe(false);
    expect(r.reason).toBe('exhausted');
  });

  it('is busy while attacking, dodging or stunned, regardless of stamina', () => {
    for (const state of [CombatState.ATTACKING, CombatState.DODGING, CombatState.HITSTUN, CombatState.BLOCKING]) {
      const r = abilityAvailability('attack', { stamina: STAMINA_CONFIG.max, combatState: state });
      expect(r.ready).toBe(false);
      expect(r.reason).toBe('busy');
    }
  });

  it('training mode has infinite stamina but still respects combat state', () => {
    expect(abilityAvailability('heavy', { stamina: 0, combatState: CombatState.FREE, trainingSession: true }).ready).toBe(true);
    expect(abilityAvailability('heavy', { stamina: 0, combatState: CombatState.ATTACKING, trainingSession: true }).ready).toBe(false);
  });

  it('produces accessible labels', () => {
    expect(describeAvailability('STRIKE', abilityAvailability('attack', free(STAMINA_CONFIG.max)))).toBe('STRIKE, ready');
    expect(describeAvailability('DODGE', abilityAvailability('dodge', { stamina: STAMINA_CONFIG.max, combatState: CombatState.DODGING }))).toBe('DODGE, recovering');
    expect(describeAvailability('MEMORY', abilityAvailability('skill', free(0)))).toBe('MEMORY, exhausted');
  });
});
