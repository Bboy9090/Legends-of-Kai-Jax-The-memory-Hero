import { describe, expect, it } from 'vitest';
import { SKYFALL_ALLOWED_MECHANICS, SKYFALL_FIELD_SEQUENCE } from './SkyfallFieldContent';

describe('Skyfall publication-safe field contract', () => {
  it('keeps traversal and memory as the entire field vocabulary', () => {
    expect(SKYFALL_FIELD_SEQUENCE.map((beat) => beat.kind)).toEqual([
      'TRAVERSAL',
      'ALT_ROUTE',
      'VERTICAL_READ',
      'RECOVERY',
      'MEMORY_TRACE',
    ]);
    const allowed = new Set(SKYFALL_ALLOWED_MECHANICS);
    expect(SKYFALL_FIELD_SEQUENCE.every((beat) => allowed.has(beat.kind))).toBe(true);
  });

  it('keeps chronology and named combat out of field objectives', () => {
    const text = SKYFALL_FIELD_SEQUENCE.map((beat) => beat.objective).join(' ').toLowerCase();
    for (const forbidden of ['defeat ', 'kill ', 'dies', 'boss', 'warlord', 'chapter ']) {
      expect(text).not.toContain(forbidden);
    }
  });
});
