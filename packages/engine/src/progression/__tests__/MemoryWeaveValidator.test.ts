/**
 * Memory Weave Validator Tests
 * 
 * Tests for memory layer validation and schema compliance.
 */

import { MemoryWeaveManager } from '../MemoryWeaveManager';

describe('MemoryWeaveValidator', () => {
  let manager: MemoryWeaveManager;

  beforeEach(() => {
    manager = new MemoryWeaveManager();
  });

  const createValidMemoryLayer = (tailNumber: number) => ({
    memory_id: `memory_test_${tailNumber}`,
    tail_number: tailNumber,
    memory_type: 'bond',
    name: `Test Memory ${tailNumber}`,
    description: 'Test memory description',
    read: 'Test memory read',
    gameplay_effects: {
      perception_shifts: ['test_shift'],
      behavior_modifications: ['test_mod'],
      enemy_reactions: ['test_reaction'],
      world_interactions: ['test_interaction'],
    },
    stacking_rule: 'cumulative',
    persistence: 'irreversible',
  });

  describe('Memory Layer Schema Validation', () => {
    it('should validate all 9 memory layers against schema', () => {
      for (let i = 1; i <= 9; i++) {
        const memory = createValidMemoryLayer(i);
        expect(() => manager.loadMemoryLayer(memory)).not.toThrow();
      }
    });

    it('should require memory_id', () => {
      const invalid = { ...createValidMemoryLayer(1) };
      delete (invalid as any).memory_id;
      
      expect(() => manager.loadMemoryLayer(invalid)).toThrow();
    });

    it('should require tail_number between 1-9', () => {
      const invalidLow = createValidMemoryLayer(0);
      expect(() => manager.loadMemoryLayer(invalidLow)).toThrow();
      
      const invalidHigh = createValidMemoryLayer(10);
      expect(() => manager.loadMemoryLayer(invalidHigh)).toThrow();
    });

    it('should require gameplay_effects object', () => {
      const invalid = { ...createValidMemoryLayer(1) };
      delete (invalid as any).gameplay_effects;
      
      expect(() => manager.loadMemoryLayer(invalid)).toThrow();
    });

    it('should require all gameplay_effects arrays', () => {
      const memory = createValidMemoryLayer(1);
      
      // Missing perception_shifts
      const noPerception = { ...memory };
      delete (noPerception.gameplay_effects as any).perception_shifts;
      expect(() => manager.loadMemoryLayer(noPerception)).toThrow();
      
      // Missing behavior_modifications
      const noBehavior = { ...memory };
      delete (noBehavior.gameplay_effects as any).behavior_modifications;
      expect(() => manager.loadMemoryLayer(noBehavior)).toThrow();
      
      // Missing enemy_reactions
      const noEnemy = { ...memory };
      delete (noEnemy.gameplay_effects as any).enemy_reactions;
      expect(() => manager.loadMemoryLayer(noEnemy)).toThrow();
      
      // Missing world_interactions
      const noWorld = { ...memory };
      delete (noWorld.gameplay_effects as any).world_interactions;
      expect(() => manager.loadMemoryLayer(noWorld)).toThrow();
    });
  });

  describe('Memory Layer Immutability', () => {
    it('should not allow memory layers to be disabled after activation', () => {
      const memory = createValidMemoryLayer(4);
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(4);
      
      expect(manager.isMemoryActive(4)).toBe(true);
      
      // There should be no method to deactivate
      expect((manager as any).deactivateMemoryLayer).toBeUndefined();
    });

    it('should maintain active memories through multiple activations', () => {
      for (let i = 1; i <= 5; i++) {
        manager.loadMemoryLayer(createValidMemoryLayer(i));
        manager.activateMemoryLayer(i);
      }
      
      expect(manager.getActiveMemoryCount()).toBe(5);
      expect(manager.isMemoryActive(1)).toBe(true);
      expect(manager.isMemoryActive(3)).toBe(true);
      expect(manager.isMemoryActive(5)).toBe(true);
    });
  });

  describe('Memory Layer Stacking', () => {
    it('should stack memory effects cumulatively (not replace)', () => {
      const memory1 = createValidMemoryLayer(1);
      memory1.gameplay_effects.perception_shifts = ['shift_1'];
      
      const memory2 = createValidMemoryLayer(2);
      memory2.gameplay_effects.perception_shifts = ['shift_2'];
      
      manager.loadMemoryLayers([memory1, memory2]);
      manager.activateMemoryLayer(1);
      manager.activateMemoryLayer(2);
      
      const effects = manager.getMemoryEffect('perception_shifts');
      expect(effects).toContain('shift_1');
      expect(effects).toContain('shift_2');
      expect(effects.length).toBe(2);
    });

    it('should return effects in order by tail number', () => {
      const memory1 = createValidMemoryLayer(1);
      memory1.gameplay_effects.perception_shifts = ['shift_1'];
      
      const memory3 = createValidMemoryLayer(3);
      memory3.gameplay_effects.perception_shifts = ['shift_3'];
      
      const memory2 = createValidMemoryLayer(2);
      memory2.gameplay_effects.perception_shifts = ['shift_2'];
      
      manager.loadMemoryLayers([memory3, memory1, memory2]);
      manager.activateMemoryLayer(3);
      manager.activateMemoryLayer(1);
      manager.activateMemoryLayer(2);
      
      const activeMemories = manager.getActiveMemories();
      expect(activeMemories[0].tail_number).toBe(1);
      expect(activeMemories[1].tail_number).toBe(2);
      expect(activeMemories[2].tail_number).toBe(3);
    });
  });

  describe('Memory-Tail Synchronization', () => {
    it('should verify memory count matches tail count', () => {
      manager.loadMemoryLayers([
        createValidMemoryLayer(1),
        createValidMemoryLayer(2),
        createValidMemoryLayer(3),
      ]);
      
      manager.activateMemoryLayer(1);
      manager.activateMemoryLayer(2);
      manager.activateMemoryLayer(3);
      
      expect(manager.verifyMemoryTailSync(3)).toBe(true);
      expect(manager.verifyMemoryTailSync(4)).toBe(false);
    });

    it('should track each memory for each tail (1-9)', () => {
      for (let i = 1; i <= 9; i++) {
        manager.loadMemoryLayer(createValidMemoryLayer(i));
      }
      
      // Activate memories 1-5
      for (let i = 1; i <= 5; i++) {
        manager.activateMemoryLayer(i);
      }
      
      expect(manager.verifyMemoryTailSync(5)).toBe(true);
      expect(manager.getActiveMemoryCount()).toBe(5);
    });
  });

  describe('Memory Layer for Each Tail', () => {
    it('should have exactly one memory layer per tail number', () => {
      const memories = [];
      for (let i = 1; i <= 9; i++) {
        memories.push(createValidMemoryLayer(i));
      }
      
      manager.loadMemoryLayers(memories);
      
      for (let i = 1; i <= 9; i++) {
        const memory = manager.getMemoryLayer(i);
        expect(memory).toBeDefined();
        expect(memory?.tail_number).toBe(i);
      }
    });

    it('should match tail_number in memory layer to intended tail', () => {
      const memory4 = createValidMemoryLayer(4);
      memory4.memory_id = 'memory_pain_remembered';
      
      manager.loadMemoryLayer(memory4);
      
      const loaded = manager.getMemoryLayer(4);
      expect(loaded?.tail_number).toBe(4);
      expect(loaded?.memory_id).toBe('memory_pain_remembered');
    });
  });

  describe('Save/Load Persistence', () => {
    it('should persist active memories across save/load', () => {
      for (let i = 1; i <= 5; i++) {
        manager.loadMemoryLayer(createValidMemoryLayer(i));
        manager.activateMemoryLayer(i);
      }
      
      const state = manager.getActiveMemoryState();
      expect(state.activeTailNumbers.size).toBe(5);
      
      // Create new manager and restore
      const newManager = new MemoryWeaveManager();
      for (let i = 1; i <= 9; i++) {
        newManager.loadMemoryLayer(createValidMemoryLayer(i));
      }
      newManager.loadActiveMemories(Array.from(state.activeTailNumbers));
      
      expect(newManager.getActiveMemoryCount()).toBe(5);
      expect(newManager.isMemoryActive(1)).toBe(true);
      expect(newManager.isMemoryActive(5)).toBe(true);
      expect(newManager.isMemoryActive(6)).toBe(false);
    });
  });

  describe('Memory Reset Behavior', () => {
    it('should reset to initial 3 memories on new game', () => {
      for (let i = 1; i <= 7; i++) {
        manager.loadMemoryLayer(createValidMemoryLayer(i));
        manager.activateMemoryLayer(i);
      }
      
      expect(manager.getActiveMemoryCount()).toBe(7);
      
      manager.reset();
      
      expect(manager.getActiveMemoryCount()).toBe(3);
      expect(manager.isMemoryActive(1)).toBe(true);
      expect(manager.isMemoryActive(2)).toBe(true);
      expect(manager.isMemoryActive(3)).toBe(true);
      expect(manager.isMemoryActive(4)).toBe(false);
    });
  });

  describe('Memory Cannot Be Farmed', () => {
    it('should not allow reactivating same memory multiple times', () => {
      manager.loadMemoryLayer(createValidMemoryLayer(4));
      
      manager.activateMemoryLayer(4);
      expect(manager.getActiveMemoryCount()).toBe(4); // 1, 2, 3 (default) + 4
      
      // Try to activate again
      manager.activateMemoryLayer(4);
      expect(manager.getActiveMemoryCount()).toBe(4); // Should still be 4
    });
  });
});
