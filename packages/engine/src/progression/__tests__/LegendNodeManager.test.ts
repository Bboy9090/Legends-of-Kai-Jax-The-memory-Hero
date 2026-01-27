/**
 * Legend Node Manager Tests
 * 
 * Tests for Legend Node lifecycle management and progression rules.
 * 
 * Note: This test suite requires Jest to be configured.
 * Install: npm install --save-dev jest @types/jest ts-jest
 */

import { LegendNodeManager } from '../LegendNodeManager';
import { LegendNodeValidator } from '../LegendNodeValidator';

describe('LegendNodeManager', () => {
  let manager: LegendNodeManager;

  beforeEach(() => {
    manager = new LegendNodeManager();
    LegendNodeValidator.clearLoadedNodes();
  });

  const createValidNode = (tailNumber: number) => ({
    node_id: `legend_node_tail_${tailNumber}`,
    tail_unlocked: tailNumber,
    name: `Trial of Tail ${tailNumber}`,
    location: 'Test Zone',
    unlock_conditions: {
      starting_tail_count_required: tailNumber - 1,
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
    },
    failure_conditions: {
      health_depleted: true,
      excessive_damage_taken: true,
    },
    reward: {
      tail: `tail_${tailNumber}`,
      visual_change: 'Visual change',
      combat_unlocks: ['ability_1'],
    },
  });

  describe('loadLegendNode', () => {
    it('should load a valid Legend Node', () => {
      const node = createValidNode(4);
      
      expect(() => manager.loadLegendNode(node)).not.toThrow();
      
      const loadedNode = manager.getNode(node.node_id);
      expect(loadedNode).toBeDefined();
      expect(loadedNode?.tail_unlocked).toBe(4);
    });

    it('should throw on invalid Legend Node', () => {
      const invalidNode = {
        node_id: 'legend_node_invalid',
        tail_unlocked: 3, // Invalid
        // Missing required fields
      };

      expect(() => manager.loadLegendNode(invalidNode)).toThrow();
    });
  });

  describe('canAttemptNode', () => {
    it('should allow attempting node with exact starting tail count', () => {
      const node = createValidNode(4);
      manager.loadLegendNode(node);

      const canAttempt = manager.canAttemptNode('legend_node_tail_4', 3);
      expect(canAttempt).toBe(true);
    });

    it('should not allow attempting node without exact tail count', () => {
      const node = createValidNode(4);
      manager.loadLegendNode(node);

      const canAttempt = manager.canAttemptNode('legend_node_tail_4', 4);
      expect(canAttempt).toBe(false);
    });

    it('should not allow attempting completed node', () => {
      const node = createValidNode(4);
      manager.loadLegendNode(node);

      manager.completeNode('legend_node_tail_4');

      const canAttempt = manager.canAttemptNode('legend_node_tail_4', 3);
      expect(canAttempt).toBe(false);
    });

    it('should throw error for non-existent node', () => {
      expect(() => 
        manager.canAttemptNode('nonexistent', 3)
      ).toThrow('Legend Node "nonexistent" not found');
    });
  });

  describe('completeNode', () => {
    it('should mark node complete and increment tail count', () => {
      const node = createValidNode(4);
      manager.loadLegendNode(node);

      expect(manager.getUnlockedTails()).toBe(3);

      manager.completeNode('legend_node_tail_4');

      expect(manager.isNodeCompleted('legend_node_tail_4')).toBe(true);
      expect(manager.getUnlockedTails()).toBe(4);
      expect(manager.isTailUnlocked(4)).toBe(true);
    });

    it('should throw error when attempting same node twice', () => {
      const node = createValidNode(4);
      manager.loadLegendNode(node);

      manager.completeNode('legend_node_tail_4');

      expect(() => manager.completeNode('legend_node_tail_4')).toThrow(
        'Legend Node "legend_node_tail_4" has already been completed. Tail unlocks are irreversible.'
      );
    });

    it('should throw error for non-existent node', () => {
      expect(() => manager.completeNode('nonexistent')).toThrow(
        'Legend Node "nonexistent" not found'
      );
    });
  });

  describe('tail count progression', () => {
    it('should increment tail count after each node completion', () => {
      const node4 = createValidNode(4);
      const node5 = createValidNode(5);
      const node6 = createValidNode(6);

      manager.loadLegendNodes([node4, node5, node6]);

      expect(manager.getUnlockedTails()).toBe(3);

      manager.completeNode('legend_node_tail_4');
      expect(manager.getUnlockedTails()).toBe(4);

      manager.completeNode('legend_node_tail_5');
      expect(manager.getUnlockedTails()).toBe(5);

      manager.completeNode('legend_node_tail_6');
      expect(manager.getUnlockedTails()).toBe(6);
    });

    it('should track all unlocked tail numbers', () => {
      const node4 = createValidNode(4);
      const node5 = createValidNode(5);

      manager.loadLegendNodes([node4, node5]);

      manager.completeNode('legend_node_tail_4');
      manager.completeNode('legend_node_tail_5');

      const unlockedTails = manager.getUnlockedTailNumbers();
      expect(unlockedTails).toEqual(new Set([1, 2, 3, 4, 5]));
    });
  });

  describe('save and load', () => {
    it('should restore completed nodes from save data', () => {
      const node4 = createValidNode(4);
      const node5 = createValidNode(5);

      manager.loadLegendNodes([node4, node5]);

      // Complete nodes
      manager.completeNode('legend_node_tail_4');
      manager.completeNode('legend_node_tail_5');

      expect(manager.getUnlockedTails()).toBe(5);

      // Create new manager and restore state
      const newManager = new LegendNodeManager();
      newManager.loadLegendNodes([node4, node5]);
      newManager.loadCompletedNodes(['legend_node_tail_4', 'legend_node_tail_5']);

      expect(newManager.isNodeCompleted('legend_node_tail_4')).toBe(true);
      expect(newManager.isNodeCompleted('legend_node_tail_5')).toBe(true);
      expect(newManager.getUnlockedTails()).toBe(5);
    });
  });

  describe('reset', () => {
    it('should reset manager to initial state', () => {
      const node4 = createValidNode(4);
      manager.loadLegendNode(node4);
      manager.completeNode('legend_node_tail_4');

      expect(manager.getUnlockedTails()).toBe(4);

      manager.reset();

      expect(manager.getUnlockedTails()).toBe(3);
      expect(manager.isNodeCompleted('legend_node_tail_4')).toBe(false);
    });
  });

  describe('getNextAvailableNode', () => {
    it('should return next available node for current tail count', () => {
      const node4 = createValidNode(4);
      const node5 = createValidNode(5);

      manager.loadLegendNodes([node4, node5]);

      const nextNode = manager.getNextAvailableNode(3);
      expect(nextNode?.node_id).toBe('legend_node_tail_4');

      manager.completeNode('legend_node_tail_4');

      const nextNode2 = manager.getNextAvailableNode(4);
      expect(nextNode2?.node_id).toBe('legend_node_tail_5');
    });

    it('should return null when no nodes available', () => {
      const node4 = createValidNode(4);
      manager.loadLegendNode(node4);

      const nextNode = manager.getNextAvailableNode(5);
      expect(nextNode).toBeNull();
    });
  });
});
