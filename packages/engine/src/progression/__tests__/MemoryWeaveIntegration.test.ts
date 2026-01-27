/**
 * Memory Weave Integration Tests
 * 
 * Tests for integration between Memory Weave, Legend Nodes, and Character systems.
 */

import { MemoryWeaveManager } from '../MemoryWeaveManager';
import { LegendNodeManager } from '../LegendNodeManager';

describe('MemoryWeaveIntegration', () => {
  let memoryManager: MemoryWeaveManager;
  let nodeManager: LegendNodeManager;

  beforeEach(() => {
    memoryManager = new MemoryWeaveManager();
    nodeManager = new LegendNodeManager();
    nodeManager.setMemoryWeaveManager(memoryManager);
  });

  const createMemoryLayer = (tailNumber: number) => ({
    memory_id: `memory_test_${tailNumber}`,
    tail_number: tailNumber,
    memory_type: 'bond' as const,
    name: `Test Memory ${tailNumber}`,
    description: 'Test',
    read: 'Test',
    gameplay_effects: {
      perception_shifts: [],
      behavior_modifications: [],
      enemy_reactions: [],
      world_interactions: [],
    },
    stacking_rule: 'cumulative' as const,
    persistence: 'irreversible' as const,
  });

  const createLegendNode = (tailNumber: number) => ({
    node_id: `legend_node_tail_${tailNumber}`,
    tail_unlocked: tailNumber as 4 | 5 | 6 | 7 | 8 | 9,
    name: `Trial of Tail ${tailNumber}`,
    location: 'Test Zone',
    unlock_conditions: {
      starting_tail_count_required: tailNumber - 1,
      no_skip_allowed: true as const,
    },
    trial_rules: {
      healing_disabled: true,
      revives_disabled: true,
      environmental_kills_allowed: false,
      difficulty_scaling: 'fixed' as const,
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
    memory_unsealed: {
      memory_id: `memory_test_${tailNumber}`,
      tail_number: tailNumber,
    },
  });

  describe('Legend Node Completion Activates Memory', () => {
    it('should activate memory layer when Legend Node is completed', () => {
      memoryManager.loadMemoryLayer(createMemoryLayer(4));
      nodeManager.loadLegendNode(createLegendNode(4));

      expect(memoryManager.isMemoryActive(4)).toBe(false);

      nodeManager.completeNode('legend_node_tail_4');

      expect(memoryManager.isMemoryActive(4)).toBe(true);
      expect(nodeManager.isTailUnlocked(4)).toBe(true);
    });

    it('should activate memory BEFORE tail count increments', () => {
      memoryManager.loadMemoryLayer(createMemoryLayer(4));
      nodeManager.loadLegendNode(createLegendNode(4));

      // Before completion
      expect(memoryManager.getActiveMemoryCount()).toBe(3); // Starting 1,2,3
      expect(nodeManager.getUnlockedTails()).toBe(3);

      nodeManager.completeNode('legend_node_tail_4');

      // After completion - both should be 4
      expect(memoryManager.getActiveMemoryCount()).toBe(4);
      expect(nodeManager.getUnlockedTails()).toBe(4);
    });

    it('should complete multiple Legend Nodes sequentially', () => {
      for (let i = 4; i <= 6; i++) {
        memoryManager.loadMemoryLayer(createMemoryLayer(i));
        nodeManager.loadLegendNode(createLegendNode(i));
      }

      nodeManager.completeNode('legend_node_tail_4');
      expect(memoryManager.isMemoryActive(4)).toBe(true);
      expect(nodeManager.getUnlockedTails()).toBe(4);

      nodeManager.completeNode('legend_node_tail_5');
      expect(memoryManager.isMemoryActive(5)).toBe(true);
      expect(nodeManager.getUnlockedTails()).toBe(5);

      nodeManager.completeNode('legend_node_tail_6');
      expect(memoryManager.isMemoryActive(6)).toBe(true);
      expect(nodeManager.getUnlockedTails()).toBe(6);
    });
  });

  describe('Memory Count Always Equals Tail Count', () => {
    it('should maintain memory/tail synchronization', () => {
      for (let i = 4; i <= 9; i++) {
        memoryManager.loadMemoryLayer(createMemoryLayer(i));
        nodeManager.loadLegendNode(createLegendNode(i));
      }

      // Complete nodes 4-7
      for (let i = 4; i <= 7; i++) {
        nodeManager.completeNode(`legend_node_tail_${i}`);
        
        const memoryCount = memoryManager.getActiveMemoryCount();
        const tailCount = nodeManager.getUnlockedTails();
        
        expect(memoryCount).toBe(tailCount);
        expect(memoryManager.verifyMemoryTailSync(tailCount)).toBe(true);
      }
    });

    it('should verify synchronization after each unlock', () => {
      memoryManager.loadMemoryLayer(createMemoryLayer(4));
      nodeManager.loadLegendNode(createLegendNode(4));

      nodeManager.completeNode('legend_node_tail_4');

      expect(memoryManager.verifyMemoryTailSync(4)).toBe(true);
    });
  });

  describe('Memory Persistence Across Save/Load', () => {
    it('should persist memories through save/load cycles', () => {
      // Complete nodes 4-6
      for (let i = 4; i <= 6; i++) {
        memoryManager.loadMemoryLayer(createMemoryLayer(i));
        nodeManager.loadLegendNode(createLegendNode(i));
        nodeManager.completeNode(`legend_node_tail_${i}`);
      }

      // Get save state
      const completedNodes = Array.from(nodeManager.getCompletedNodes());
      const activeMemoryState = memoryManager.getActiveMemoryState();

      // Create new managers (simulating load)
      const newMemoryManager = new MemoryWeaveManager();
      const newNodeManager = new LegendNodeManager();
      newNodeManager.setMemoryWeaveManager(newMemoryManager);

      // Load data
      for (let i = 1; i <= 9; i++) {
        newMemoryManager.loadMemoryLayer(createMemoryLayer(i));
      }
      for (let i = 4; i <= 9; i++) {
        newNodeManager.loadLegendNode(createLegendNode(i));
      }

      newMemoryManager.loadActiveMemories(Array.from(activeMemoryState.activeTailNumbers));
      newNodeManager.loadCompletedNodes(completedNodes);

      // Verify state restored
      expect(newMemoryManager.getActiveMemoryCount()).toBe(6);
      expect(newNodeManager.getUnlockedTails()).toBe(6);
      expect(newMemoryManager.isMemoryActive(4)).toBe(true);
      expect(newMemoryManager.isMemoryActive(6)).toBe(true);
      expect(newMemoryManager.isMemoryActive(7)).toBe(false);
    });

    it('should mark memories with irreversible persistence', () => {
      const memory = createMemoryLayer(4);
      expect(memory.persistence).toBe('irreversible');
      
      memoryManager.loadMemoryLayer(memory);
      memoryManager.activateMemoryLayer(4);

      // Should remain active (no deactivation method exists)
      expect(memoryManager.isMemoryActive(4)).toBe(true);
    });
  });

  describe('Memory Cannot Be Reset or Farmed', () => {
    it('should not allow memory resets after activation', () => {
      memoryManager.loadMemoryLayer(createMemoryLayer(4));
      nodeManager.loadLegendNode(createLegendNode(4));

      nodeManager.completeNode('legend_node_tail_4');

      expect(memoryManager.isMemoryActive(4)).toBe(true);

      // Attempting to complete same node again should fail
      expect(() => nodeManager.completeNode('legend_node_tail_4')).toThrow();

      // Memory should still be active
      expect(memoryManager.isMemoryActive(4)).toBe(true);
    });

    it('should prevent memory farming through node replay', () => {
      memoryManager.loadMemoryLayer(createMemoryLayer(4));
      nodeManager.loadLegendNode(createLegendNode(4));

      const initialMemoryCount = memoryManager.getActiveMemoryCount();

      nodeManager.completeNode('legend_node_tail_4');
      const afterFirstCompletion = memoryManager.getActiveMemoryCount();

      // Try to complete again
      expect(() => nodeManager.completeNode('legend_node_tail_4')).toThrow();

      // Memory count should not increase
      expect(memoryManager.getActiveMemoryCount()).toBe(afterFirstCompletion);
    });
  });

  describe('Memory Unsealed Reference in Legend Nodes', () => {
    it('should include memory_unsealed in Legend Node data', () => {
      const node = createLegendNode(4);

      expect(node.memory_unsealed).toBeDefined();
      expect(node.memory_unsealed?.memory_id).toBe('memory_test_4');
      expect(node.memory_unsealed?.tail_number).toBe(4);
    });

    it('should verify memory layer exists before granting tail', () => {
      nodeManager.loadLegendNode(createLegendNode(4));
      // Don't load memory layer

      // Should still complete (warning logged, not error)
      nodeManager.completeNode('legend_node_tail_4');

      expect(nodeManager.getUnlockedTails()).toBe(4);
    });
  });

  describe('Complete Progression Path (Tail 3 → 9)', () => {
    it('should progress from 3 tails to 9 tails with memories', () => {
      // Load all memories and nodes
      for (let i = 1; i <= 9; i++) {
        memoryManager.loadMemoryLayer(createMemoryLayer(i));
        if (i >= 4) {
          nodeManager.loadLegendNode(createLegendNode(i));
        }
      }

      // Complete all nodes sequentially
      for (let i = 4; i <= 9; i++) {
        nodeManager.completeNode(`legend_node_tail_${i}`);
      }

      // Verify final state
      expect(memoryManager.getActiveMemoryCount()).toBe(9);
      expect(nodeManager.getUnlockedTails()).toBe(9);

      // All memories should be active
      for (let i = 1; i <= 9; i++) {
        expect(memoryManager.isMemoryActive(i)).toBe(true);
      }
    });

    it('should have all 9 memories stacked at tail 9', () => {
      for (let i = 1; i <= 9; i++) {
        const memory = createMemoryLayer(i);
        memory.gameplay_effects.perception_shifts = [`shift_${i}`];
        memoryManager.loadMemoryLayer(memory);
        if (i >= 4) {
          nodeManager.loadLegendNode(createLegendNode(i));
        }
      }

      // Complete all nodes
      for (let i = 4; i <= 9; i++) {
        nodeManager.completeNode(`legend_node_tail_${i}`);
      }

      const effects = memoryManager.getCumulativeEffects();
      
      // Should have effects from all 9 memories
      expect(effects.perception_shifts.length).toBe(9);
      expect(effects.perception_shifts).toContain('shift_1');
      expect(effects.perception_shifts).toContain('shift_9');
    });
  });

  describe('System Enforces Memory Before Stats', () => {
    it('should activate memory before incrementing tail power', () => {
      memoryManager.loadMemoryLayer(createMemoryLayer(4));
      nodeManager.loadLegendNode(createLegendNode(4));

      let memoryActivatedFirst = false;
      let tailUnlockedAfter = false;

      // Mock to track order
      const originalActivate = memoryManager.activateMemoryLayer.bind(memoryManager);
      memoryManager.activateMemoryLayer = (tail: number) => {
        memoryActivatedFirst = !nodeManager.isTailUnlocked(tail);
        originalActivate(tail);
      };

      nodeManager.completeNode('legend_node_tail_4');

      expect(memoryActivatedFirst).toBe(true); // Memory activated before tail was marked unlocked
    });
  });
});
