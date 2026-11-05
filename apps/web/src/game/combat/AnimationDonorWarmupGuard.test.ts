import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  new URL('../../components/game/models/OptimizedBeastModel.tsx', import.meta.url),
  'utf8',
);

describe('lazy authored animation donor warm-up', () => {
  it('resets deformation sampling when a new authored action starts', () => {
    expect(source).toContain(
      'deformationSampleRef.current = { frames: 0, motion: 0, last: null };',
    );
    expect(source).toContain(
      'skinDeformationSampleRef.current = { frames: 0, motion: 0, last: null };',
    );
    expect(source).toContain('authoredActionStartedAtRef.current =');
  });

  it('does not declare an authored donor static during its bind/crossfade window', () => {
    expect(source).toContain('const authoredWarmupComplete = authoredWarmupElapsedMs >= 250;');
    expect(source).toContain('if (measuredFrames >= 2 && authoredWarmupComplete)');
  });
});
