/**
 * Legend Node Validator Tests
 * 
 * Tests for schema validation and business rules enforcement.
 */

import { LegendNodeValidator } from '../LegendNodeValidator';

describe('LegendNodeValidator', () => {
  beforeEach(() => {
    // Clear loaded nodes before each test
    LegendNodeValidator.clearLoadedNodes();
  });

  describe('validateLegendNode', () => {
    it('should validate valid quill_trial.node.json', () => {
      const validNode = {
        node_id: 'legend_node_quill',
        tail_unlocked: 4,
        name: 'Trial of the Quill',
        location: 'Resonance Sanctum',
        unlock_conditions: {
          starting_tail_count_required: 3,
          no_skip_allowed: true,
        },
        trial_rules: {
          healing_disabled: true,
          revives_disabled: true,
          environmental_kills_allowed: false,
          difficulty_scaling: 'fixed',
        },
        victory_conditions: {
          perfect_dodges_required: 5,
          posture_breaks_required: 3,
          damage_taken_threshold: 0.35,
          enemies_defeated_required: 1,
        },
        failure_conditions: {
          health_depleted: true,
          excessive_damage_taken: true,
        },
        reward: {
          tail: 'quill',
          visual_change: 'Quill shadows ripple along spine',
          combat_unlocks: ['retaliation_spikes', 'posture_shred_on_dodge'],
        },
      };

      const result = LegendNodeValidator.validateLegendNode(validNode);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid tail_unlocked (e.g., tail 3)', () => {
      const invalidNode = {
        node_id: 'legend_node_invalid',
        tail_unlocked: 3, // Invalid: tails 1-3 are starting tails
        name: 'Invalid Trial',
        location: 'Test Zone',
        unlock_conditions: {
          starting_tail_count_required: 3,
          no_skip_allowed: true,
        },
        trial_rules: {
          healing_disabled: true,
          revives_disabled: true,
          environmental_kills_allowed: false,
          difficulty_scaling: 'fixed',
        },
        victory_conditions: {},
        failure_conditions: {
          health_depleted: true,
          excessive_damage_taken: true,
        },
        reward: {
          tail: 'invalid',
          visual_change: 'Test',
          combat_unlocks: ['test'],
        },
      };

      const result = LegendNodeValidator.validateLegendNode(invalidNode);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'tail_unlocked must be between 4 and 9 (tails 1-3 are starting tails)'
      );
    });

    it('should reject invalid tail_unlocked (e.g., tail 10)', () => {
      const invalidNode = {
        node_id: 'legend_node_invalid',
        tail_unlocked: 10, // Invalid: max is 9
        name: 'Invalid Trial',
        location: 'Test Zone',
        unlock_conditions: {
          starting_tail_count_required: 3,
          no_skip_allowed: true,
        },
        trial_rules: {
          healing_disabled: true,
          revives_disabled: true,
          environmental_kills_allowed: false,
          difficulty_scaling: 'fixed',
        },
        victory_conditions: {},
        failure_conditions: {
          health_depleted: true,
          excessive_damage_taken: true,
        },
        reward: {
          tail: 'invalid',
          visual_change: 'Test',
          combat_unlocks: ['test'],
        },
      };

      const result = LegendNodeValidator.validateLegendNode(invalidNode);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'tail_unlocked must be between 4 and 9 (tails 1-3 are starting tails)'
      );
    });

    it('should reject missing victory_conditions', () => {
      const invalidNode = {
        node_id: 'legend_node_invalid',
        tail_unlocked: 4,
        name: 'Invalid Trial',
        location: 'Test Zone',
        unlock_conditions: {
          starting_tail_count_required: 3,
          no_skip_allowed: true,
        },
        trial_rules: {
          healing_disabled: true,
          revives_disabled: true,
          environmental_kills_allowed: false,
          difficulty_scaling: 'fixed',
        },
        // victory_conditions missing
        failure_conditions: {
          health_depleted: true,
          excessive_damage_taken: true,
        },
        reward: {
          tail: 'invalid',
          visual_change: 'Test',
          combat_unlocks: ['test'],
        },
      };

      const result = LegendNodeValidator.validateLegendNode(invalidNode);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'victory_conditions is required and must be an object'
      );
    });

    it('should reject duplicate nodes with same tail_unlocked', () => {
      const node1 = {
        node_id: 'legend_node_quill',
        tail_unlocked: 4,
        name: 'Trial of the Quill',
        location: 'Resonance Sanctum',
        unlock_conditions: {
          starting_tail_count_required: 3,
          no_skip_allowed: true,
        },
        trial_rules: {
          healing_disabled: true,
          revives_disabled: true,
          environmental_kills_allowed: false,
          difficulty_scaling: 'fixed',
        },
        victory_conditions: {},
        failure_conditions: {
          health_depleted: true,
          excessive_damage_taken: true,
        },
        reward: {
          tail: 'quill',
          visual_change: 'Test',
          combat_unlocks: ['test'],
        },
      };

      const node2 = {
        node_id: 'legend_node_duplicate',
        tail_unlocked: 4, // Duplicate!
        name: 'Duplicate Trial',
        location: 'Test Zone',
        unlock_conditions: {
          starting_tail_count_required: 3,
          no_skip_allowed: true,
        },
        trial_rules: {
          healing_disabled: true,
          revives_disabled: true,
          environmental_kills_allowed: false,
          difficulty_scaling: 'fixed',
        },
        victory_conditions: {},
        failure_conditions: {
          health_depleted: true,
          excessive_damage_taken: true,
        },
        reward: {
          tail: 'duplicate',
          visual_change: 'Test',
          combat_unlocks: ['test'],
        },
      };

      // First node should pass
      const result1 = LegendNodeValidator.validateLegendNode(node1);
      expect(result1.valid).toBe(true);

      // Second node should fail due to duplicate tail_unlocked
      const result2 = LegendNodeValidator.validateLegendNode(node2);
      expect(result2.valid).toBe(false);
      expect(result2.errors).toContain(
        'Duplicate tail_unlocked value 4. Node "legend_node_quill" already unlocks this tail.'
      );
    });

    it('should reject node_id that does not match pattern', () => {
      const invalidNode = {
        node_id: 'invalid_id', // Should be legend_node_*
        tail_unlocked: 4,
        name: 'Invalid Trial',
        location: 'Test Zone',
        unlock_conditions: {
          starting_tail_count_required: 3,
          no_skip_allowed: true,
        },
        trial_rules: {
          healing_disabled: true,
          revives_disabled: true,
          environmental_kills_allowed: false,
          difficulty_scaling: 'fixed',
        },
        victory_conditions: {},
        failure_conditions: {
          health_depleted: true,
          excessive_damage_taken: true,
        },
        reward: {
          tail: 'invalid',
          visual_change: 'Test',
          combat_unlocks: ['test'],
        },
      };

      const result = LegendNodeValidator.validateLegendNode(invalidNode);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'node_id must match pattern: legend_node_[a-z_]+'
      );
    });

    it('should reject no_skip_allowed if not true', () => {
      const invalidNode = {
        node_id: 'legend_node_invalid',
        tail_unlocked: 4,
        name: 'Invalid Trial',
        location: 'Test Zone',
        unlock_conditions: {
          starting_tail_count_required: 3,
          no_skip_allowed: false, // Must be true
        },
        trial_rules: {
          healing_disabled: true,
          revives_disabled: true,
          environmental_kills_allowed: false,
          difficulty_scaling: 'fixed',
        },
        victory_conditions: {},
        failure_conditions: {
          health_depleted: true,
          excessive_damage_taken: true,
        },
        reward: {
          tail: 'invalid',
          visual_change: 'Test',
          combat_unlocks: ['test'],
        },
      };

      const result = LegendNodeValidator.validateLegendNode(invalidNode);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'unlock_conditions.no_skip_allowed must be true (Legend Nodes cannot be skipped)'
      );
    });
  });
});
