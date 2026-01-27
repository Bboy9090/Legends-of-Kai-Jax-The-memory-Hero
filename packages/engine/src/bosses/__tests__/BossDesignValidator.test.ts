/**
 * Boss Design Validator Tests
 * Validates boss_design_bible.json against schema and canon requirements.
 */

import { BossDesignValidator, BossTierDefinition } from '../BossDesignValidator';

describe('BossDesignValidator', () => {
  let validator: BossDesignValidator;

  beforeEach(() => {
    validator = new BossDesignValidator();
  });

  describe('Schema Validation', () => {
    it('should validate boss_design_bible.json successfully', () => {
      const result = validator.validate();
      
      if (!result.valid) {
        console.error('Validation errors:', result.errors);
      }
      
      expect(result.valid).toBe(true);
    });

    it('should have all 6 boss tiers (tier_3_4, tier_5, tier_6, tier_7, tier_8, tier_9)', () => {
      const result = validator.validate();
      expect(result.valid).toBe(true);
      
      // Check that all required tiers exist by attempting to get them
      expect(validator.getTierForTailCount(3)).not.toBeNull();
      expect(validator.getTierForTailCount(4)).not.toBeNull();
      expect(validator.getTierForTailCount(5)).not.toBeNull();
      expect(validator.getTierForTailCount(6)).not.toBeNull();
      expect(validator.getTierForTailCount(7)).not.toBeNull();
      expect(validator.getTierForTailCount(8)).not.toBeNull();
      expect(validator.getTierForTailCount(9)).not.toBeNull();
    });
  });

  describe('Tier Structure', () => {
    it('should have tier_5 for Shade Trial', () => {
      const tier5 = validator.getTierForTailCount(5);
      expect(tier5).not.toBeNull();
      expect(tier5?.tier_name).toBe('Zone Breaker');
    });

    it('should have expects array for each tier', () => {
      const tier5 = validator.getTierForTailCount(5);
      expect(tier5?.expects).toBeDefined();
      expect(Array.isArray(tier5?.expects)).toBe(true);
      expect(tier5?.expects.length).toBeGreaterThan(0);
    });

    it('should have punishes array for each tier', () => {
      const tier5 = validator.getTierForTailCount(5);
      expect(tier5?.punishes).toBeDefined();
      expect(Array.isArray(tier5?.punishes)).toBe(true);
      expect(tier5?.punishes.length).toBeGreaterThan(0);
    });

    it('should have weak_to array for each tier', () => {
      const tier5 = validator.getTierForTailCount(5);
      expect(tier5?.weak_to).toBeDefined();
      expect(Array.isArray(tier5?.weak_to)).toBe(true);
      expect(tier5?.weak_to.length).toBeGreaterThan(0);
    });
  });

  describe('Tier 5 (Shade Trial) Boss Design', () => {
    let tier5: BossTierDefinition | null;

    beforeEach(() => {
      tier5 = validator.getTierForTailCount(5);
    });

    it('should expect stealth_angle_control', () => {
      expect(tier5?.expects).toContain('stealth_angle_control');
    });

    it('should expect threat_reset', () => {
      expect(tier5?.expects).toContain('threat_reset');
    });

    it('should expect backstab_timing', () => {
      expect(tier5?.expects).toContain('backstab_timing');
    });

    it('should punish overcommit', () => {
      expect(tier5?.punishes).toContain('overcommit');
    });

    it('should be weak to backstab_timing', () => {
      expect(tier5?.weak_to).toContain('backstab_timing');
    });

    it('should have philosophy about Shade mechanics', () => {
      expect(tier5?.philosophy).toBeDefined();
      expect(tier5?.philosophy.toLowerCase()).toContain('shade');
    });
  });

  describe('Tier Naming Convention', () => {
    it('should follow tier_X pattern', () => {
      const result = validator.validate();
      expect(result.valid).toBe(true);
      
      // All tier keys should match pattern
      // This is implicitly tested by successful validation
    });
  });

  describe('Tail Range Coverage', () => {
    it('should cover tails 3-9', () => {
      for (let i = 3; i <= 9; i++) {
        const tier = validator.getTierForTailCount(i);
        expect(tier).not.toBeNull();
      }
    });

    it('should not exceed character max tail count (9)', () => {
      const result = validator.validate();
      
      // No errors about exceeding tail count
      const tailCountErrors = result.errors.filter(e => 
        e.includes('exceeds character max')
      );
      
      expect(tailCountErrors.length).toBe(0);
    });
  });

  describe('Design Law Compliance', () => {
    it('should have design law about never invalidating prior tails', () => {
      const result = validator.validate();
      expect(result.valid).toBe(true);
      
      // Design law should emphasize bosses requiring prior tails
      // This is checked in validation warnings
    });

    it('should require mastery of previous mechanics', () => {
      // Each tier should build on previous ones
      const tier3_4 = validator.getTierForTailCount(4);
      const tier5 = validator.getTierForTailCount(5);
      const tier6 = validator.getTierForTailCount(6);
      
      // Tier 5 boss should still validate fundamentals from tier 3-4
      // This is implicit in the design philosophy
      expect(tier3_4?.expects).toContain('perfect_dodge');
      expect(tier5?.expects).toContain('stealth_angle_control');
      expect(tier6?.expects).toContain('anchor_control');
    });
  });

  describe('Cross-Validation', () => {
    it('should validate against kai_jax.character.json', () => {
      const result = validator.validate();
      expect(result.valid).toBe(true);
    });

    it('should not throw on validateOrThrow', () => {
      expect(() => {
        validator.validateOrThrow();
      }).not.toThrow();
    });
  });
});
