import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync(
  new URL('../../../../.github/workflows/mobile-store-readiness.yml', import.meta.url),
  'utf8',
);

describe('mobile store core-character authority gate', () => {
  it('runs the fail-closed character asset validator before store packaging', () => {
    expect(workflow).toContain('core-character-release-authority:');
    expect(workflow).toContain('node apps/web/scripts/validate-core-character-assets.mjs');
  });

  it('blocks all store-facing packaging/runtime jobs behind character authority', () => {
    for (const job of [
      'android-release:',
      'ios-release-compile:',
      'runtime-mobile-e2e:',
      'ios-device-archive:',
    ]) {
      const index = workflow.indexOf(job);
      expect(index).toBeGreaterThan(-1);
      const block = workflow.slice(index, index + 220);
      expect(block).toContain('needs: core-character-release-authority');
    }
  });
});
