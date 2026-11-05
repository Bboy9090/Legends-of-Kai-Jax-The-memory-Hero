import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  new URL('../../components/game/BattleScene.tsx', import.meta.url),
  'utf8',
);

describe('BattleScene auto-start guard', () => {
  it('only auto-starts from intro and cannot overwrite KO/results/paused phases', () => {
    expect(source).toContain('if (s.battlePhase === "preRound")');
    expect(source).not.toContain('s.battlePhase !== "fighting"');
    expect(source).not.toContain('s.battlePhase !== "transforming"');
  });
});
