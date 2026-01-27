/**
 * Blackreach Descent Validator Tests
 * Validates blackreach_descent.slice.json and scenario execution.
 */

import * as fs from 'fs';
import * as path from 'path';
import { BlackreachDescent, VerticalSlice } from '../BlackreachDescent';
import { WorldStateManager, createDefaultWorldState } from '../../world/WorldState';

describe('BlackreachDescentValidator', () => {
  let sliceData: VerticalSlice;
  let worldStateManager: WorldStateManager;

  beforeEach(() => {
    // Load slice data
    const slicePath = path.resolve(__dirname, '../../../../data/vertical_slices/blackreach_descent.slice.json');
    const data = fs.readFileSync(slicePath, 'utf-8');
    sliceData = JSON.parse(data);

    // Create world state with 4 tails (prerequisite for Shade Trial)
    const initialState = createDefaultWorldState();
    initialState.current_tail_count = 4;
    initialState.completed_legend_nodes = ['quill_trial']; // Assuming previous trial
    initialState.unlocked_abilities = ['bond', 'hunter', 'thread', 'quill'];
    worldStateManager = new WorldStateManager(initialState);
  });

  describe('Schema Validation', () => {
    it('should load blackreach_descent.slice.json successfully', () => {
      expect(sliceData).toBeDefined();
      expect(sliceData.slice_id).toBe('vertical_slice_blackreach');
    });

    it('should have correct name', () => {
      expect(sliceData.name).toBe('Blackreach Descent');
    });

    it('should have playtime_target_minutes of 30', () => {
      expect(sliceData.playtime_target_minutes).toBe(30);
    });
  });

  describe('Player State', () => {
    it('should start with 4 tails', () => {
      expect(sliceData.player_state.starting_tails).toBe(4);
    });

    it('should have abilities_locked array', () => {
      expect(Array.isArray(sliceData.player_state.abilities_locked)).toBe(true);
    });

    it('should lock anchor, echo, rift, crown', () => {
      expect(sliceData.player_state.abilities_locked).toContain('anchor');
      expect(sliceData.player_state.abilities_locked).toContain('echo');
      expect(sliceData.player_state.abilities_locked).toContain('rift');
      expect(sliceData.player_state.abilities_locked).toContain('crown');
    });
  });

  describe('Zone Configuration', () => {
    it('should be in Blackreach Underpass', () => {
      expect(sliceData.zone.name).toBe('Blackreach Underpass');
    });

    it('should have subterranean_ruins biome', () => {
      expect(sliceData.zone.biome).toBe('subterranean_ruins');
    });

    it('should have high verticality', () => {
      expect(sliceData.zone.verticality).toBe('high');
    });

    it('should use streaming chunks', () => {
      expect(sliceData.zone.streaming_chunks).toBe(true);
    });
  });

  describe('Mission Flow', () => {
    it('should have 4 phases', () => {
      expect(sliceData.mission_flow).toHaveLength(4);
    });

    it('should have phases in correct order', () => {
      expect(sliceData.mission_flow[0].phase).toBe(1);
      expect(sliceData.mission_flow[1].phase).toBe(2);
      expect(sliceData.mission_flow[2].phase).toBe(3);
      expect(sliceData.mission_flow[3].phase).toBe(4);
    });

    it('should have correct phase types', () => {
      expect(sliceData.mission_flow[0].type).toBe('stealth_exploration');
      expect(sliceData.mission_flow[1].type).toBe('hybrid_combat');
      expect(sliceData.mission_flow[2].type).toBe('elite_duel');
      expect(sliceData.mission_flow[3].type).toBe('legend_node');
    });
  });

  describe('Phase 1: Stealth Exploration', () => {
    let phase1: any;

    beforeEach(() => {
      phase1 = sliceData.mission_flow[0];
    });

    it('should have stealth exploration objective', () => {
      expect(phase1.objective).toContain('floodlit');
    });

    it('should target 8 minutes duration', () => {
      expect(phase1.duration_minutes).toBe(8);
    });

    it('should have stealth mechanics', () => {
      expect(phase1.mechanics).toBeDefined();
      expect(phase1.mechanics.length).toBeGreaterThan(0);
    });
  });

  describe('Phase 2: Hybrid Combat', () => {
    let phase2: any;

    beforeEach(() => {
      phase2 = sliceData.mission_flow[1];
    });

    it('should have 4 enemy waves', () => {
      expect(phase2.enemy_waves).toBe(4);
    });

    it('should cap at 10 simultaneous enemies', () => {
      expect(phase2.max_enemies_simultaneous).toBe(10);
    });

    it('should target 10 minutes duration', () => {
      expect(phase2.duration_minutes).toBe(10);
    });
  });

  describe('Phase 3: Elite Duel', () => {
    let phase3: any;

    beforeEach(() => {
      phase3 = sliceData.mission_flow[2];
    });

    it('should have boss name', () => {
      expect(phase3.boss_name).toBe('Shade Warden');
    });

    it('should target 7 minutes duration', () => {
      expect(phase3.duration_minutes).toBe(7);
    });

    it('should include dodge_timing mechanic', () => {
      expect(phase3.mechanics).toContain('dodge_timing');
    });
  });

  describe('Phase 4: Legend Node', () => {
    let phase4: any;

    beforeEach(() => {
      phase4 = sliceData.mission_flow[3];
    });

    it('should reference shade_trial legend node', () => {
      expect(phase4.legend_node_id).toBe('legend_node_shade');
    });

    it('should target 5 minutes duration', () => {
      expect(phase4.duration_minutes).toBe(5);
    });

    it('should have stealth mechanics', () => {
      expect(phase4.mechanics).toContain('stealth_strikes');
    });
  });

  describe('End State', () => {
    it('should unlock tail 5', () => {
      expect(sliceData.end_state.tail_unlocked).toBe(5);
    });

    it('should update world state', () => {
      expect(sliceData.end_state.world_state_updated).toBe(true);
    });

    it('should have narrative beat', () => {
      expect(sliceData.end_state.narrative_beat).toBeDefined();
      expect(sliceData.end_state.narrative_beat.length).toBeGreaterThan(0);
    });
  });

  describe('Duration Target', () => {
    it('should sum to 30 minutes total', () => {
      const totalDuration = sliceData.mission_flow.reduce(
        (sum, phase) => sum + (phase.duration_minutes || 0),
        0
      );
      expect(totalDuration).toBe(30);
    });
  });

  describe('Scenario Execution', () => {
    let scenario: BlackreachDescent;

    beforeEach(() => {
      scenario = new BlackreachDescent(worldStateManager);
    });

    it('should initialize successfully', () => {
      expect(() => {
        scenario.initialize();
      }).not.toThrow();
    });

    it('should start with phase 1', () => {
      scenario.initialize();
      const phase = scenario.getCurrentPhase();
      expect(phase.phase).toBe(1);
    });

    it('should not allow skipping phases', () => {
      scenario.initialize();
      
      expect(() => {
        scenario.startPhase(3); // Try to skip to phase 3
      }).toThrow();
    });

    it('should track scenario statistics', () => {
      scenario.initialize();
      const stats = scenario.getStats();
      
      expect(stats.current_phase).toBe(1);
      expect(stats.target_time_minutes).toBe(30);
    });
  });

  describe('Validation Criteria', () => {
    it('should enforce must_complete_in_order', () => {
      expect(sliceData.validation_criteria?.must_complete_in_order).toBe(true);
    });

    it('should enforce cannot_skip_phases', () => {
      expect(sliceData.validation_criteria?.cannot_skip_phases).toBe(true);
    });

    it('should enforce tail_5_locked_until_trial_complete', () => {
      expect(sliceData.validation_criteria?.tail_5_locked_until_trial_complete).toBe(true);
    });
  });
});
