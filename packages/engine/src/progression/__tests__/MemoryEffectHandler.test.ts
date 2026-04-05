/**
 * Memory Effect Handler Tests
 * 
 * Tests for memory effect application to gameplay systems.
 */

import { MemoryWeaveManager } from '../MemoryWeaveManager';
import { MemoryEffectHandler } from '../MemoryEffectHandler';
import { MemoryEffectContext } from '../MemoryWeaveTypes';

describe('MemoryEffectHandler', () => {
  let manager: MemoryWeaveManager;
  let handler: MemoryEffectHandler;

  beforeEach(() => {
    manager = new MemoryWeaveManager();
    handler = new MemoryEffectHandler(manager);
  });

  const createMemoryWithEffects = (
    tailNumber: number,
    perceptionShifts: string[],
    behaviorMods: string[],
    enemyReactions: string[],
    worldInteractions: string[]
  ) => ({
    memory_id: `memory_test_${tailNumber}`,
    tail_number: tailNumber,
    memory_type: 'bond' as const,
    name: `Test Memory ${tailNumber}`,
    description: 'Test',
    read: 'Test',
    gameplay_effects: {
      perception_shifts: perceptionShifts,
      behavior_modifications: behaviorMods,
      enemy_reactions: enemyReactions,
      world_interactions: worldInteractions,
    },
    stacking_rule: 'cumulative' as const,
    persistence: 'irreversible' as const,
  });

  describe('Perception Shifts', () => {
    it('should apply parry window clarity modifier', () => {
      const memory = createMemoryWithEffects(
        1,
        ['parry_windows_feel_clearer'],
        [],
        [],
        []
      );
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(1);

      const context: MemoryEffectContext = {
        playerState: {},
      };

      handler.applyAllEffects(context);

      expect(context.playerState.parryWindowClarity).toBe(1.5);
    });

    it('should apply ally visibility bonus', () => {
      const memory = createMemoryWithEffects(
        1,
        ['ally_positions_more_visible'],
        [],
        [],
        []
      );
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(1);

      const context: MemoryEffectContext = {
        playerState: {},
      };

      handler.applyAllEffects(context);

      expect(context.playerState.allyVisibilityBonus).toBe(1.3);
    });

    it('should enable connection visualization', () => {
      const memory = createMemoryWithEffects(
        3,
        ['connected_enemies_glow_subtly', 'tether_paths_visible'],
        [],
        [],
        []
      );
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(3);

      const context: MemoryEffectContext = {
        playerState: {},
      };

      handler.applyAllEffects(context);

      expect(context.playerState.connectionVisualization).toBe(true);
      expect(context.playerState.tetherVisualization).toBe(true);
    });

    it('should stack multiple perception shifts', () => {
      const memory1 = createMemoryWithEffects(
        1,
        ['parry_windows_feel_clearer'],
        [],
        [],
        []
      );
      const memory2 = createMemoryWithEffects(
        2,
        ['isolated_enemies_appear_vulnerable'],
        [],
        [],
        []
      );

      manager.loadMemoryLayers([memory1, memory2]);
      manager.activateMemoryLayer(1);
      manager.activateMemoryLayer(2);

      const context: MemoryEffectContext = {
        playerState: {},
      };

      handler.applyAllEffects(context);

      expect(context.playerState.parryWindowClarity).toBe(1.5);
      expect(context.playerState.isolatedEnemyHighlight).toBe(true);
    });
  });

  describe('Behavior Modifications', () => {
    it('should apply revive deliberateness modifier', () => {
      const memory = createMemoryWithEffects(
        1,
        [],
        ['revives_feel_deliberate_slower'],
        [],
        []
      );
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(1);

      const context: MemoryEffectContext = {
        playerState: {},
      };

      handler.applyAllEffects(context);

      expect(context.playerState.reviveDeliberateness).toBe(1.2);
    });

    it('should enable grouping behavior', () => {
      const memory = createMemoryWithEffects(
        3,
        [],
        ['naturally_group_enemies_before_striking'],
        [],
        []
      );
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(3);

      const context: MemoryEffectContext = {
        playerState: {},
      };

      handler.applyAllEffects(context);

      expect(context.playerState.groupingBehavior).toBe(true);
    });

    it('should modify combat rhythm', () => {
      const memory = createMemoryWithEffects(
        5,
        [],
        ['combat_rhythm_slows_deliberately'],
        [],
        []
      );
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(5);

      const context: MemoryEffectContext = {
        playerState: {},
      };

      handler.applyAllEffects(context);

      expect(context.playerState.rhythmModifier).toBe(0.85);
    });

    it('should stack behavior modifications', () => {
      const memory1 = createMemoryWithEffects(
        1,
        [],
        ['revives_feel_deliberate_slower'],
        [],
        []
      );
      const memory2 = createMemoryWithEffects(
        3,
        [],
        ['naturally_group_enemies_before_striking'],
        [],
        []
      );

      manager.loadMemoryLayers([memory1, memory2]);
      manager.activateMemoryLayer(1);
      manager.activateMemoryLayer(3);

      const context: MemoryEffectContext = {
        playerState: {},
      };

      handler.applyAllEffects(context);

      expect(context.playerState.reviveDeliberateness).toBe(1.2);
      expect(context.playerState.groupingBehavior).toBe(true);
    });
  });

  describe('Enemy Reactions', () => {
    it('should apply outnumbered hesitation', () => {
      const memory = createMemoryWithEffects(
        1,
        [],
        [],
        ['enemies_hesitate_when_outnumbered'],
        []
      );
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(1);

      const context: MemoryEffectContext = {
        enemyState: {},
      };

      handler.applyAllEffects(context);

      expect(context.enemyState.outnumberedHesitation).toBe(1.5);
    });

    it('should enable surrender system', () => {
      const memory = createMemoryWithEffects(
        8,
        [],
        [],
        ['surrender_becomes_option', 'mercy_becomes_possible'],
        []
      );
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(8);

      const context: MemoryEffectContext = {
        enemyState: {},
      };

      handler.applyAllEffects(context);

      expect(context.enemyState.surrenderEnabled).toBe(true);
      expect(context.enemyState.mercyEnabled).toBe(true);
    });

    it('should stack enemy reactions based on active memories', () => {
      const memory1 = createMemoryWithEffects(
        1,
        [],
        [],
        ['enemies_hesitate_when_outnumbered'],
        []
      );
      const memory2 = createMemoryWithEffects(
        2,
        [],
        [],
        ['enemies_flee_sooner_when_isolated'],
        []
      );

      manager.loadMemoryLayers([memory1, memory2]);
      manager.activateMemoryLayer(1);
      manager.activateMemoryLayer(2);

      const context: MemoryEffectContext = {
        enemyState: {},
      };

      handler.applyAllEffects(context);

      expect(context.enemyState.outnumberedHesitation).toBe(1.5);
      expect(context.enemyState.isolationFleeThreshold).toBe(0.7);
    });
  });

  describe('World Interactions', () => {
    it('should increase NPC trust', () => {
      const memory = createMemoryWithEffects(
        1,
        [],
        [],
        [],
        ['npc_trust_increases']
      );
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(1);

      const context: MemoryEffectContext = {
        worldState: {},
      };

      handler.applyAllEffects(context);

      expect(context.worldState.npcTrustModifier).toBe(1.3);
    });

    it('should enable environmental highlighting', () => {
      const memory = createMemoryWithEffects(
        3,
        [],
        [],
        [],
        ['environmental_connections_highlighted', 'story_hooks_more_apparent']
      );
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(3);

      const context: MemoryEffectContext = {
        worldState: {},
      };

      handler.applyAllEffects(context);

      expect(context.worldState.environmentalHighlighting).toBe(true);
      expect(context.worldState.storyHookVisibility).toBe(1.5);
    });

    it('should enable collective memory at tail 9', () => {
      const memory = createMemoryWithEffects(
        9,
        [],
        [],
        [],
        ['collective_memory_accessible', 'sacrifice_honored_globally']
      );
      manager.loadMemoryLayer(memory);
      manager.activateMemoryLayer(9);

      const context: MemoryEffectContext = {
        worldState: {},
      };

      handler.applyAllEffects(context);

      expect(context.worldState.collectiveMemoryEnabled).toBe(true);
      expect(context.worldState.globalSacrificeHonor).toBe(true);
    });
  });

  describe('Cumulative Effect Compounding', () => {
    it('should compound effects with increasing tail count', () => {
      // Load memories 1-5
      for (let i = 1; i <= 5; i++) {
        manager.loadMemoryLayer(
          createMemoryWithEffects(
            i,
            [`perception_${i}`],
            [`behavior_${i}`],
            [`enemy_${i}`],
            [`world_${i}`]
          )
        );
        manager.activateMemoryLayer(i);
      }

      const summary = handler.getActiveEffectSummary();

      expect(summary.perception_shifts.length).toBe(5);
      expect(summary.behavior_modifications.length).toBe(5);
      expect(summary.enemy_reactions.length).toBe(5);
      expect(summary.world_interactions.length).toBe(5);
    });

    it('should apply all effects every frame', () => {
      const memory1 = createMemoryWithEffects(
        1,
        ['parry_windows_feel_clearer'],
        ['revives_feel_deliberate_slower'],
        ['enemies_hesitate_when_outnumbered'],
        ['npc_trust_increases']
      );

      manager.loadMemoryLayer(memory1);
      manager.activateMemoryLayer(1);

      const context: MemoryEffectContext = {
        playerState: {},
        enemyState: {},
        worldState: {},
      };

      // Apply multiple times (simulating frames)
      handler.applyAllEffects(context);
      handler.applyAllEffects(context);

      // Effects should be applied consistently
      expect(context.playerState.parryWindowClarity).toBe(1.5);
      expect(context.enemyState.outnumberedHesitation).toBe(1.5);
      expect(context.worldState.npcTrustModifier).toBe(1.3);
    });
  });

  describe('Memory Effect Progression', () => {
    it('should show clear progression from tail 1 to tail 9', () => {
      // Tail 1: Basic awareness
      const mem1 = createMemoryWithEffects(
        1,
        ['parry_windows_feel_clearer'],
        [],
        [],
        []
      );

      // Tail 5: Advanced perception
      const mem5 = createMemoryWithEffects(
        5,
        ['shadow_density_readable', 'threat_meter_visible'],
        [],
        [],
        []
      );

      // Tail 9: Complete mastery
      const mem9 = createMemoryWithEffects(
        9,
        ['enemies_recognize_kai_jax', 'authority_changes_outcomes'],
        [],
        [],
        []
      );

      manager.loadMemoryLayers([mem1, mem5, mem9]);
      manager.activateMemoryLayer(1);
      manager.activateMemoryLayer(5);
      manager.activateMemoryLayer(9);

      const context: MemoryEffectContext = {
        playerState: {},
      };

      handler.applyAllEffects(context);

      // All effects should be active
      expect(context.playerState.parryWindowClarity).toBe(1.5);
      expect(context.playerState.shadowReadability).toBe(true);
      expect(context.playerState.recognitionEffect).toBe(true);
    });
  });
});
