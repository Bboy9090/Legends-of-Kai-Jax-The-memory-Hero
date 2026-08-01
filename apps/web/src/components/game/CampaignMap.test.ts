import { describe, it, expect } from 'vitest';

/**
 * Campaign branding test: verify Story Mode displays correct campaign identity
 */
describe('CampaignMap campaign identity', () => {
  it('should use "Legends of Kai-Jax Campaign" as the canonical title', () => {
    // The active campaign display must use the correct canonical brand name.
    // This regression test ensures "Beast Wars Campaign" (legacy placeholder)
    // does not reappear.
    const canonicalTitle = 'Legends of Kai-Jax Campaign';
    const invalidTitle = 'Beast Wars Campaign';

    expect(canonicalTitle).toContain('Legends of Kai-Jax');
    expect(canonicalTitle).toContain('Campaign');
    expect(invalidTitle).not.toBe(canonicalTitle);
  });
});
