import { describe, expect, it } from 'vitest';
import {
  STORM_RONIN_SANCTUM_ALLOWED_MECHANICS,
  STORM_RONIN_SANCTUM_SEQUENCE,
} from './StormRoninSanctumContent';

describe('Storm Ronin Sanctum publication-safe contract', () => {
  it('keeps the Sanctum limited to training/archive/reconstruction mechanics', () => {
    const allowed = new Set(STORM_RONIN_SANCTUM_ALLOWED_MECHANICS);
    expect(STORM_RONIN_SANCTUM_SEQUENCE.every((beat) => allowed.has(beat.kind))).toBe(true);
    expect(new Set(STORM_RONIN_SANCTUM_SEQUENCE.map((beat) => beat.id)).size)
      .toBe(STORM_RONIN_SANCTUM_SEQUENCE.length);
  });

  it('does not hardcode revelations or irreversible chronology', () => {
    const text = STORM_RONIN_SANCTUM_SEQUENCE.map((beat) => beat.objective).join(' ').toLowerCase();
    for (const forbidden of ['dies', 'death of', 'kills', 'reveals that', 'becomes king', 'final battle']) {
      expect(text).not.toContain(forbidden);
    }
  });
});
