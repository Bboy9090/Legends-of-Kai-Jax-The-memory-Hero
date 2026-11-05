import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const runtimeSurfaces = [
  'src/lib/brand.ts',
  'src/components/game/CreditsScreen.tsx',
  'src/components/game/LegendSelectScreen.tsx',
  'src/components/game/StoryHubScreen.tsx',
  'src/components/game/TitleScreen.tsx',
  'src/components/game/LoadingScreen.tsx',
  'src/components/game/LegendaryMainMenu.tsx',
  'src/components/game/LoreHub.tsx',
];

describe('runtime Memory Hero brand identity', () => {
  it('uses Memory Hero on the public runtime surfaces', () => {
    for (const relative of runtimeSurfaces) {
      const source = readFileSync(new URL(`../../../${relative}`, import.meta.url), 'utf8');
      expect(source.toUpperCase()).toContain('MEMORY HERO');
      expect(source.toUpperCase()).not.toContain('MEMORY KING');
      expect(source.toUpperCase()).not.toContain('FUSION HERO');
    }
  });
});
