import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync(
  new URL('../../../../../.github/workflows/mobile-store-readiness.yml', import.meta.url),
  'utf8',
);

describe('mobile store core-character authority gate', () => {
  it('runs the fail-closed character asset validator before store packaging', () => {
    expect(workflow).toContain('core-character-release-authority:');
    expect(workflow).toContain('node apps/web/scripts/validate-core-character-assets.mjs');
    expect(workflow).toContain('blocked-pending-approved-canonical-glbs');
    expect(workflow).toContain('if [ "${{ github.event_name }}" = "pull_request" ]; then');
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
      const block = workflow.slice(index, index + 320);
      expect(block).toContain('needs: core-character-release-authority');
      expect(block).toContain("if: ${{ github.event_name != 'pull_request' }}");
    }
  });

  it('keeps non-PR release execution fail-closed when authority validation fails', () => {
    expect(workflow).toContain('exit "${STATUS}"');
    expect(workflow).toContain('CORE_CHARACTER_RELEASE_AUTHORITY=blocked');
  });
});
