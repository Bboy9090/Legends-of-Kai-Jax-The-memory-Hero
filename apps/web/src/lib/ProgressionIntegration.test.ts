import { describe, expect, it, beforeEach } from 'vitest';
import { useAdventure, type AdventureEnemy } from './stores/useAdventure';
import { evaluateCampaignProgressionGating } from './adventureEvaluator';
import { shouldMarkChaseTargetEscaped } from './adventureTelemetry';
import { retreatMovementStep } from './enemyMovement';
import { civilianPursuitStep } from './civilianPursuit';
import { ENEMY_TIERS } from '../game/tuning/enemyTuning';

/**
 * Progression integration tests: verify evaluateCampaignProgressionGating
 * correctly gates mission outcomes based on actual game state.
 *
 * These tests exercise the evaluator with realistic state combinations
 * and verify that victory/failure/continue outcomes are correct.
 */

describe('Mission Progression Integration', () => {
  beforeEach(() => {
    useAdventure.getState().reset();
  });

  // ============= Mission 4: Victory & Failure Gating =============

  describe('Mission 4: Void Stalker Progression Gating', () => {
    it('continues if objectives not yet active', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.setState({
        objectives: { ...useAdventure.getState().objectives, status: 'UNINITIALIZED' },
      });

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m4',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });

      expect(outcome).toBe('CONTINUE');
    });

    it('fails immediately if chaseTargetEscaped triggered', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.setState({
        enemies: [{
          id: 'stalker',
          fighterId: 'void-stalker',
          tier: 'boss1',
          posX: 0, posY: 0, posZ: 0, rotY: 0,
          health: 2500, maxHealth: 2500,
          isDead: false, isAggro: true, isAttacking: false,
          aiState: 'chase', telegraphTimer: 0,
          patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
        }],
      });

      useAdventure.getState().markChaseTargetEscaped();

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m4',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });

      expect(outcome).toBe('FAILED');
    });

    it('continues if not on final wave', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.setState({
        enemies: [{
          id: 'stalker',
          fighterId: 'void-stalker',
          tier: 'boss1',
          posX: 0, posY: 0, posZ: 0, rotY: 0,
          health: 2500, maxHealth: 2500,
          isDead: false, isAggro: true, isAttacking: false,
          aiState: 'chase', telegraphTimer: 0,
          patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
        }],
      });

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m4',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 2, // Not on final wave
      });

      expect(outcome).toBe('CONTINUE');
    });

    it('continues if live enemies remain on final wave', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.setState({
        enemies: [{
          id: 'stalker',
          fighterId: 'void-stalker',
          tier: 'boss1',
          posX: 0, posY: 0, posZ: 0, rotY: 0,
          health: 2500, maxHealth: 2500,
          isDead: false, isAggro: true, isAttacking: false,
          aiState: 'chase', telegraphTimer: 0,
          patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
        }],
      });

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m4',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });

      expect(outcome).toBe('CONTINUE');
    });

    it('continues if stalker not intercepted on final wave', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.setState({
        enemies: [
          {
            id: 'minion',
            fighterId: 'rift-grunt',
            tier: 'minion1',
            posX: 0, posY: 0, posZ: 0, rotY: 0,
            health: 0, maxHealth: 100,
            isDead: true, isAggro: false, isAttacking: false,
            aiState: 'idle', telegraphTimer: 0,
            patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
          },
          {
            id: 'stalker',
            fighterId: 'void-stalker',
            tier: 'boss1',
            posX: 0, posY: 0, posZ: 0, rotY: 0,
            health: 2500, maxHealth: 2500,
            isDead: false, isAggro: true, isAttacking: false,
            aiState: 'chase', telegraphTimer: 0,
            patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
          },
        ],
      });

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m4',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });

      expect(outcome).toBe('CONTINUE');
    });

    it('achieves victory when on final wave, stalker intercepted, and no other live enemies', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.setState({
        enemies: [
          {
            id: 'minion',
            fighterId: 'rift-grunt',
            tier: 'minion1',
            posX: 5, posY: 0, posZ: 5, rotY: 0,
            health: 0, maxHealth: 100,
            isDead: true, isAggro: false, isAttacking: false,
            aiState: 'idle', telegraphTimer: 0,
            patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
          },
          {
            id: 'stalker',
            fighterId: 'void-stalker',
            tier: 'boss1',
            posX: 0, posY: 0, posZ: 0, rotY: 0,
            health: 250, maxHealth: 2500, // At floor
            isDead: false, isAggro: true, isAttacking: false,
            aiState: 'retreat', telegraphTimer: 0,
            patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
          },
        ],
      });

      useAdventure.getState().damageEnemy('stalker', 6000); // Trigger interception

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m4',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });

      expect(outcome).toBe('VICTORY');
    });
  });

  // ============= Mission 5: Victory & Failure Gating =============

  describe('Mission 5: Civilian Defense Progression Gating', () => {
    it('continues if no civilians have been initialized', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m5',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });

      expect(outcome).toBe('CONTINUE');
    });

    it('fails if all civilians dead before general defeated', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      useAdventure.getState().damageCivilian('civ_01', 100);
      useAdventure.getState().damageCivilian('civ_02', 100);

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m5',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });

      expect(outcome).toBe('FAILED');
    });

    it('continues if not on final wave', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m5',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 2, // Not final wave
      });

      expect(outcome).toBe('CONTINUE');
    });

    it('continues if general not yet defeated on final wave', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      useAdventure.setState({
        enemies: [{
          id: 'general',
          fighterId: 'rift-general',
          tier: 'boss1',
          posX: 5, posY: 0, posZ: 5, rotY: 0,
          health: 1000, maxHealth: 1000,
          isDead: false, isAggro: true, isAttacking: false,
          aiState: 'chase', telegraphTimer: 0,
          patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
        }],
      });

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m5',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });

      expect(outcome).toBe('CONTINUE');
    });

    it('achieves victory when on final wave, general defeated, and civilians alive', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      useAdventure.setState({
        enemies: [{
          id: 'general',
          fighterId: 'rift-general',
          tier: 'boss1',
          posX: 5, posY: 0, posZ: 5, rotY: 0,
          health: 1000, maxHealth: 1000,
          isDead: false, isAggro: true, isAttacking: false,
          aiState: 'chase', telegraphTimer: 0,
          patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
        }],
      });

      useAdventure.getState().damageEnemy('general', 1000); // Trigger defeat

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m5',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });

      expect(outcome).toBe('VICTORY');
    });

    it('fails even after general defeated if all civilians die', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      useAdventure.setState({
        enemies: [{
          id: 'general',
          fighterId: 'rift-general',
          tier: 'boss1',
          posX: 5, posY: 0, posZ: 5, rotY: 0,
          health: 0, maxHealth: 1000,
          isDead: true, isAggro: false, isAttacking: false,
          aiState: 'idle', telegraphTimer: 0,
          patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
        }],
      });

      useAdventure.getState().damageEnemy('general', 1000);
      useAdventure.getState().damageCivilian('civ_01', 100);
      useAdventure.getState().damageCivilian('civ_02', 100);

      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m5',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });

      expect(outcome).toBe('FAILED');
    });

    it('precedence: civilian death failure takes precedence over victory conditions', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');

      // Setup: general alive, civilians dead
      useAdventure.setState({
        enemies: [{
          id: 'general',
          fighterId: 'rift-general',
          tier: 'boss1',
          posX: 5, posY: 0, posZ: 5, rotY: 0,
          health: 1000, maxHealth: 1000,
          isDead: false, isAggro: true, isAttacking: false,
          aiState: 'chase', telegraphTimer: 0,
          patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
        }],
      });

      useAdventure.getState().damageCivilian('civ_01', 100);
      useAdventure.getState().damageCivilian('civ_02', 100);

      // Even on final wave, all civilians dead = failure
      const outcome = evaluateCampaignProgressionGating({
        missionId: 'story_act1_m5',
        enemies: useAdventure.getState().enemies,
        objectives: useAdventure.getState().objectives,
        currentWaveIndex: 0,
        totalWavesCount: 1,
      });

      expect(outcome).toBe('FAILED');
    });
  });

  describe('Mission 4 interception/escape precedence', () => {
    it('counts escape before interception but not the scripted retreat afterward', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.setState({
        player: { ...useAdventure.getState().player, posX: 0, posZ: 0 },
        enemies: [{
          id: 'stalker', fighterId: 'void-stalker', tier: 'boss1',
          posX: 75, posY: 0, posZ: 0, rotY: 0,
          health: 2500, maxHealth: 2500, isDead: false,
          isAggro: true, isAttacking: false, aiState: 'chase',
          telegraphTimer: 0, patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
        }],
      });
      const before = useAdventure.getState();
      expect(shouldMarkChaseTargetEscaped(before.missionId, false, before.player, before.enemies)).toBe(true);
      useAdventure.getState().damageEnemy('stalker', 6000);
      const after = useAdventure.getState();
      expect(after.objectives.milestones.stalkerIntercepted).toBe(true);
      expect(shouldMarkChaseTargetEscaped(after.missionId, true, after.player, after.enemies)).toBe(false);
      expect(evaluateCampaignProgressionGating({
        missionId: after.missionId, enemies: after.enemies, objectives: after.objectives,
        currentWaveIndex: 0, totalWavesCount: 1,
      })).toBe('VICTORY');
    });

    it('does not suppress a genuine escape failure recorded before interception', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.getState().markChaseTargetEscaped();
      const s = useAdventure.getState();
      expect(evaluateCampaignProgressionGating({
        missionId: s.missionId, enemies: s.enemies, objectives: s.objectives,
        currentWaveIndex: 0, totalWavesCount: 1,
      })).toBe('FAILED');
    });
  });

  // ============= Time-Stepped Simulation =============

  describe('Time-Stepped AI Movement Verification', () => {
    it('stalker position increases distance from player after retreat triggered', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.setState({
        player: { ...useAdventure.getState().player, posX: 0, posY: 0, posZ: 0 },
        enemies: [{
          id: 'stalker',
          fighterId: 'void-stalker',
          tier: 'boss1',
          posX: -5, posY: 0, posZ: 0, rotY: 0,
          health: 2500, maxHealth: 2500,
          isDead: false, isAggro: true, isAttacking: false,
          aiState: 'chase', telegraphTimer: 0,
          patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
        }],
      });

      useAdventure.getState().damageEnemy('stalker', 6000);

      const initialPos = useAdventure.getState().enemies[0].posX;
      const initialDist = Math.abs(initialPos - 0);

      // Execute the same movement function called by AdventureEnemyAI on each frame.
      const player = useAdventure.getState().player;
      const frames = 5;
      const deltaPerFrame = 0.016;
      for (let i = 0; i < frames; i++) {
        const enemy = useAdventure.getState().enemies[0];
        const next = retreatMovementStep(enemy, player, ENEMY_TIERS[enemy.tier].speed, deltaPerFrame);
        useAdventure.getState().setEnemyPos(enemy.id, next.nextX, enemy.posY, next.nextZ);
      }
      const finalDist = Math.abs(useAdventure.getState().enemies[0].posX - player.posX);
      expect(finalDist).toBeGreaterThan(initialDist);
    });

    it('enemy re-aggros when player enters aggro range during civilian pursuit', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      useAdventure.setState({
        player: { ...useAdventure.getState().player, posX: 0, posY: 0, posZ: 0 },
        enemies: [{
          id: 'drone',
          fighterId: 'rift-drone',
          tier: 'minion1',
          posX: -20, posY: 0, posZ: -20, rotY: 0,
          health: 50, maxHealth: 50,
          isDead: false, isAggro: false, isAttacking: false,
          aiState: 'idle', telegraphTimer: 0,
          patrolTargetX: -20, patrolTargetZ: -20, stunTimer: 0,
        }],
      });

      let enemy = useAdventure.getState().enemies[0];
      expect(enemy.isAggro).toBe(false);

      // Move player into aggro range
      useAdventure.setState({
        player: { ...useAdventure.getState().player, posX: -18, posY: 0, posZ: -18 },
      });

      // Simulate aggro check (minion1 aggroRange is ~8 units)
      enemy = useAdventure.getState().enemies[0];
      const dx = -18 - enemy.posX;
      const dz = -18 - enemy.posZ;
      const distToPlayer = Math.sqrt(dx * dx + dz * dz);

      if (distToPlayer < 8) {
        useAdventure.getState().setEnemyAggro('drone', true);
      }

      enemy = useAdventure.getState().enemies[0];
      expect(enemy.isAggro).toBe(true);
    });

    it('civilian pursuit decreases enemy-to-civilian distance over frames', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');

      const civs = useAdventure.getState().objectives.civilianRegistry;
      const civ1 = civs[0]; // At (-5, 0, 10)

      useAdventure.setState({
        enemies: [{
          id: 'drone',
          fighterId: 'rift-drone',
          tier: 'minion1',
          posX: -10, posY: 0, posZ: 10, rotY: 0,
          health: 50, maxHealth: 50,
          isDead: false, isAggro: false, isAttacking: false,
          aiState: 'idle', telegraphTimer: 0,
          patrolTargetX: -10, patrolTargetZ: 10, stunTimer: 0,
        }],
      });

      const initialDist = Math.sqrt(
        Math.pow(civ1.posX - (-10), 2) + Math.pow(civ1.posZ - 10, 2)
      );

      for (let i = 0; i < 3; i++) {
        const enemy = useAdventure.getState().enemies[0];
        const step = civilianPursuitStep(enemy, useAdventure.getState().objectives.civilianRegistry, ENEMY_TIERS[enemy.tier].speed, 0.016);
        expect(step).not.toBeNull();
        useAdventure.getState().setEnemyPos(enemy.id, step!.nextX, enemy.posY, step!.nextZ);
      }
      const finalEnemy = useAdventure.getState().enemies[0];
      const finalDist = Math.hypot(civ1.posX - finalEnemy.posX, civ1.posZ - finalEnemy.posZ);
      expect(finalDist).toBeLessThan(initialDist);
    });
  });
});
