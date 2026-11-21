import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('CinematicPostFX three.js API usage', () => {
  const src = readFileSync(new URL('./CinematicPostFX.tsx', import.meta.url), 'utf8');

  it('builds FilmPass with the (intensity, grayscale) signature, never a truthy grayscale', () => {
    expect(src).toMatch(/new FilmPass\(0\.22, false\)/);
    expect(src).not.toMatch(/new FilmPass\(\s*0\.22,\s*0\.04/);
  });

  it('animates the real FilmPass uniform name', () => {
    expect(src).toContain('film.uniforms["intensity"]');
    expect(src).not.toContain('nIntensity');
    expect(src).not.toContain('sIntensity');
  });
});
