import { describe, expect, it } from 'vitest';
import {
  IRONVEIN_ALLOWED_MECHANICS,
  IRONVEIN_FIELD_SEQUENCE,
} from './IronveinFieldContent';

describe('Ironvein publication-safe field contract', () => {
  it('keeps a complete mechanics-only sequence', () => {
    expect(IRONVEIN_FIELD_SEQUENCE.map((beat) => beat.kind)).toEqual([
      'TRAVERSAL',
      'PRESSURE',
      'TRAP',
      'SUPPRESSION',
      'RECOVERY',
      'MEMORY_TRACE',
    ]);
    expect(new Set(IRONVEIN_FIELD_SEQUENCE.map((beat) => beat.id)).size)
      .toBe(IRONVEIN_FIELD_SEQUENCE.length);
  });

  it('uses only explicitly allowed field mechanics', () => {
    const allowed = new Set(IRONVEIN_ALLOWED_MECHANICS);
    expect(IRONVEIN_FIELD_SEQUENCE.every((beat) => allowed.has(beat.kind))).toBe(true);
  });

  it('does not smuggle named chronology or boss outcomes into objectives', () => {
    const objectiveText = IRONVEIN_FIELD_SEQUENCE
      .map((beat) => beat.objective)
      .join(' ')
      .toLowerCase();

    for (const forbidden of [
      'defeat boss',
      'kill ',
      'dies',
      'death of',
      'covenant enforcer',
      'fang warlord',
      'first blood',
    ]) {
      expect(objectiveText).not.toContain(forbidden);
    }
  });
});
