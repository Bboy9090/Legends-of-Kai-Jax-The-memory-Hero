/**
 * Quill Trial Tests
 * 
 * Tests for the Quill Trial implementation and state machine.
 */

import { QuillTrial, TrialState } from '../QuillTrial';
import { LegendNodeManager } from '../progression/LegendNodeManager';
import { LegendNode } from '../progression/LegendNodeTypes';

describe('QuillTrial', () => {
  let manager: LegendNodeManager;
  let node: LegendNode;
  let trial: QuillTrial;

  beforeEach(() => {
    manager = new LegendNodeManager();
    
    node = {
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

    manager.loadLegendNode(node);
    trial = new QuillTrial(node, manager);
  });

  describe('initialization', () => {
    it('should start in SETUP state', () => {
      expect(trial.getState()).toBe(TrialState.SETUP);
    });

    it('should initialize with zero stats', () => {
      const stats = trial.getStats();
      expect(stats.perfectDodges).toBe(0);
      expect(stats.postureBreaks).toBe(0);
      expect(stats.damageTaken).toBe(0);
      expect(stats.enemiesDefeated).toBe(0);
    });
  });

  describe('start', () => {
    it('should transition to ACTIVE state', () => {
      trial.start(100);
      expect(trial.getState()).toBe(TrialState.ACTIVE);
    });

    it('should set max health', () => {
      trial.start(150);
      const stats = trial.getStats();
      expect(stats.maxHealth).toBe(150);
    });

    it('should throw error if not in SETUP state', () => {
      trial.start(100);
      expect(() => trial.start(100)).toThrow(
        'Trial can only be started from SETUP state'
      );
    });
  });

  describe('victory conditions', () => {
    beforeEach(() => {
      trial.start(100);
    });

    it('should succeed when all conditions met', () => {
      // Meet all victory conditions
      for (let i = 0; i < 5; i++) {
        trial.onDodge();
        // Simulate perfect dodge frames
        for (let j = 0; j < 20; j++) {
          trial.onDodgeFrame();
        }
      }

      for (let i = 0; i < 3; i++) {
        trial.onPostureBreak();
      }

      trial.onEnemyDefeated();

      // Damage under threshold (35% of 100 = 35)
      trial.onDamageTaken(30);

      // Update to check victory
      trial.update(0.016);

      expect(trial.getState()).toBe(TrialState.COMPLETE);
      expect(manager.isNodeCompleted('legend_node_quill')).toBe(true);
      expect(manager.getUnlockedTails()).toBe(4);
    });

    it('should not succeed without perfect dodges', () => {
      // Meet other conditions but not perfect dodges
      for (let i = 0; i < 3; i++) {
        trial.onPostureBreak();
      }
      trial.onEnemyDefeated();
      trial.onDamageTaken(30);

      trial.update(0.016);

      expect(trial.getState()).toBe(TrialState.ACTIVE);
    });

    it('should not succeed without posture breaks', () => {
      // Meet other conditions but not posture breaks
      for (let i = 0; i < 5; i++) {
        trial.onDodge();
        for (let j = 0; j < 20; j++) {
          trial.onDodgeFrame();
        }
      }
      trial.onEnemyDefeated();
      trial.onDamageTaken(30);

      trial.update(0.016);

      expect(trial.getState()).toBe(TrialState.ACTIVE);
    });

    it('should not succeed without defeating enemy', () => {
      // Meet other conditions but not enemy defeat
      for (let i = 0; i < 5; i++) {
        trial.onDodge();
        for (let j = 0; j < 20; j++) {
          trial.onDodgeFrame();
        }
      }
      for (let i = 0; i < 3; i++) {
        trial.onPostureBreak();
      }
      trial.onDamageTaken(30);

      trial.update(0.016);

      expect(trial.getState()).toBe(TrialState.ACTIVE);
    });
  });

  describe('failure conditions', () => {
    beforeEach(() => {
      trial.start(100);
    });

    it('should fail when damage threshold exceeded', () => {
      // Damage exceeds threshold (35% of 100 = 35)
      trial.onDamageTaken(40);

      trial.update(0.016);

      expect(trial.getState()).toBe(TrialState.FAILURE);
    });

    it('should fail when health depleted', () => {
      // Damage equals max health
      trial.onDamageTaken(100);

      trial.update(0.016);

      expect(trial.getState()).toBe(TrialState.FAILURE);
    });

    it('should output failure message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      trial.onDamageTaken(100);
      trial.update(0.016);

      expect(consoleSpy).toHaveBeenCalledWith('You flinch. The world does not.');
      
      consoleSpy.mockRestore();
    });
  });

  describe('retry', () => {
    beforeEach(() => {
      trial.start(100);
    });

    it('should allow retry after failure', () => {
      trial.onDamageTaken(100);
      trial.update(0.016);

      expect(trial.getState()).toBe(TrialState.FAILURE);

      trial.retry();

      expect(trial.getState()).toBe(TrialState.ACTIVE);
      
      const stats = trial.getStats();
      expect(stats.damageTaken).toBe(0);
      expect(stats.perfectDodges).toBe(0);
      expect(stats.postureBreaks).toBe(0);
    });

    it('should throw error if not in FAILURE state', () => {
      expect(() => trial.retry()).toThrow(
        'Can only retry from FAILURE state'
      );
    });
  });

  describe('cannot attempt trial twice', () => {
    it('should prevent completing same node twice', () => {
      trial.start(100);

      // Complete trial
      for (let i = 0; i < 5; i++) {
        trial.onDodge();
        for (let j = 0; j < 20; j++) {
          trial.onDodgeFrame();
        }
      }
      for (let i = 0; i < 3; i++) {
        trial.onPostureBreak();
      }
      trial.onEnemyDefeated();
      trial.onDamageTaken(30);
      trial.update(0.016);

      expect(trial.getState()).toBe(TrialState.COMPLETE);

      // Try to complete again through manager
      expect(() => manager.completeNode('legend_node_quill')).toThrow();
    });
  });

  describe('arena locking', () => {
    beforeEach(() => {
      trial.start(100);
    });

    it('should lock arena on victory', () => {
      // Complete trial
      for (let i = 0; i < 5; i++) {
        trial.onDodge();
        for (let j = 0; j < 20; j++) {
          trial.onDodgeFrame();
        }
      }
      for (let i = 0; i < 3; i++) {
        trial.onPostureBreak();
      }
      trial.onEnemyDefeated();
      trial.onDamageTaken(30);
      trial.update(0.016);

      expect(trial.isArenaLocked()).toBe(true);
    });

    it('should not lock arena before victory', () => {
      expect(trial.isArenaLocked()).toBe(false);
    });
  });

  describe('reward information', () => {
    it('should provide reward details', () => {
      const reward = trial.getReward();

      expect(reward.tail).toBe('quill');
      expect(reward.visualChange).toContain('Quill shadows');
      expect(reward.combatUnlocks).toContain('retaliation_spikes');
      expect(reward.combatUnlocks).toContain('posture_shred_on_dodge');
    });
  });

  describe('perfect dodge tracking', () => {
    beforeEach(() => {
      trial.start(100);
    });

    it('should count perfect dodges after sufficient frames', () => {
      trial.onDodge();
      
      // Simulate 15+ frames without damage
      for (let i = 0; i < 20; i++) {
        trial.onDodgeFrame();
      }

      const stats = trial.getStats();
      expect(stats.perfectDodges).toBeGreaterThan(0);
    });

    it('should reset dodge tracking on damage', () => {
      trial.onDodge();
      
      // Some frames
      for (let i = 0; i < 10; i++) {
        trial.onDodgeFrame();
      }

      // Take damage - should reset
      trial.onDamageTaken(5);

      // More frames - should not count toward same perfect dodge
      for (let i = 0; i < 10; i++) {
        trial.onDodgeFrame();
      }

      const stats = trial.getStats();
      expect(stats.perfectDodges).toBe(0);
    });
  });
});
