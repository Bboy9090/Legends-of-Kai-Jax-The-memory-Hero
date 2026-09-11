import { describe, expect, it } from 'vitest';
import {
  ASHBLOCK_PHASE_55_ROLE_SET,
  ASHBLOCK_PHASE_55_SEQUENCE,
} from './AshblockPhase55Content';

describe('Ashblock Phase 5.5 content sequence', () => {
  it('keeps the authored beat order locked', () => {
    expect(ASHBLOCK_PHASE_55_SEQUENCE.map((beat) => beat.kind)).toEqual([
      'TRAVERSAL',
      'COMBAT',
      'RECOVERY',
      'COMBAT',
      'LIEUTENANT',
      'MEMORY_TRACE',
    ]);
  });

  it('uses each approved Fang combat role', () => {
    const usedRoles = new Set(
      ASHBLOCK_PHASE_55_SEQUENCE.flatMap((beat) => beat.spawns.map((spawn) => spawn.archetype))
    );

    for (const role of ASHBLOCK_PHASE_55_ROLE_SET) {
      expect(usedRoles.has(role)).toBe(true);
    }
  });

  it('contains exactly one District Lieutenant authority', () => {
    const lieutenants = ASHBLOCK_PHASE_55_SEQUENCE
      .flatMap((beat) => beat.spawns)
      .filter((spawn) => spawn.archetype === 'district-lieutenant');

    expect(lieutenants).toHaveLength(1);
    expect(lieutenants[0].id).toBe('fang-lieutenant-01');
  });

  it('keeps Memory Trace as the payoff after the lieutenant beat', () => {
    const lieutenantIndex = ASHBLOCK_PHASE_55_SEQUENCE.findIndex((beat) => beat.kind === 'LIEUTENANT');
    const memoryIndex = ASHBLOCK_PHASE_55_SEQUENCE.findIndex((beat) => beat.kind === 'MEMORY_TRACE');

    expect(lieutenantIndex).toBeGreaterThanOrEqual(0);
    expect(memoryIndex).toBe(lieutenantIndex + 1);
  });

  it('uses unique runtime ids for every authored spawn', () => {
    const ids = ASHBLOCK_PHASE_55_SEQUENCE.flatMap((beat) => beat.spawns.map((spawn) => spawn.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
