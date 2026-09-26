import { describe, expect, it } from 'vitest';
import { SOUND_EFFECTS } from './soundEffects';

describe('sound effect registry integrity', () => {
  it('keeps every effect on a packaged /sounds asset path with valid playback settings', () => {
    const entries = Object.entries(SOUND_EFFECTS);
    expect(entries.length).toBeGreaterThan(0);

    for (const [key, sound] of entries) {
      expect(key.length).toBeGreaterThan(0);
      expect(sound.name.length).toBeGreaterThan(0);
      expect(sound.path).toMatch(/^\/sounds\//);
      expect(sound.volume).toBeGreaterThanOrEqual(0);
      expect(sound.volume).toBeLessThanOrEqual(1);
      if (sound.playbackRate !== undefined) {
        expect(Number.isFinite(sound.playbackRate)).toBe(true);
        expect(sound.playbackRate).toBeGreaterThan(0);
      }
    }
  });

  it('does not register duplicate packaged sound paths under accidental aliases', () => {
    const paths = Object.values(SOUND_EFFECTS).map((sound) => sound.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
