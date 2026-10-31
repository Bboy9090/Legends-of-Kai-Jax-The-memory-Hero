import { describe, expect, it, beforeEach } from 'vitest';
import { useAdventure, type AdventureEnemy } from './stores/useAdventure';
import { civilianPursuitStep } from './civilianPursuit';
import { hasChaseTargetEscaped, findCivilianAttack } from './adventureTelemetry';

/**
 * Comprehensive verification for Mission 4 and 5 mechanics
 * covering all user-specified requirements.
 */

describe('Mission 4 & 5 Comprehensive Verification', () => {
  beforeEach(() => {
    useAdventure.getState().reset();
  });

  // ============= Mission 4: Void Stalker Overkill & Retreat =============

  describe('Mission 4: Void Stalker Overkill Floor Protection', () => {
    it('clamps void-stalker health to exactly 10% floor when massive overkill applied', () => {
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

      // Apply 6000 damage to 2500 max (would be 3500 overkill at floor)
      useAdventure.getState().damageEnemy('stalker', 6000);

      const s = useAdventure.getState();
      const stalker = s.enemies[0];

      // Floor should be 10% of max = 250 HP
      expect(stalker.health).toBe(250);
      expect(stalker.isDead).toBe(false);
      expect(stalker.aiState).toBe('retreat');
      expect(s.objectives.milestones.stalkerIntercepted).toBe(true);
    });

    it('does not reduce health below floor on repeated overkill', () => {
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

      // First overkill to floor
      useAdventure.getState().damageEnemy('stalker', 6000);
      expect(useAdventure.getState().enemies[0].health).toBe(250);

      // Second overkill attempt
      useAdventure.getState().damageEnemy('stalker', 5000);
      expect(useAdventure.getState().enemies[0].health).toBe(250);
    });

    it('stalker cannot be killed while intercepted (floor prevents death)', () => {
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

      useAdventure.getState().damageEnemy('stalker', 6000);
      const s = useAdventure.getState();
      expect(s.enemies[0].health).toBe(250);
      expect(s.enemies[0].isDead).toBe(false);

      // Even massive overkill at floor won't reduce below 250
      useAdventure.getState().damageEnemy('stalker', 10000);
      expect(useAdventure.getState().enemies[0].health).toBe(250);
      expect(useAdventure.getState().enemies[0].isDead).toBe(false);
    });

    it('intercepted stalker sets retreat aiState and spawns retreat behavior', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.setState({
        player: { ...useAdventure.getState().player, posX: 10, posY: 0, posZ: 0 },
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

      useAdventure.getState().damageEnemy('stalker', 6000);
      const s = useAdventure.getState();

      expect(s.enemies[0].aiState).toBe('retreat');
      expect(s.objectives.milestones.stalkerIntercepted).toBe(true);
    });
  });

  describe('Mission 4: Chase Target Escape Detection', () => {
    it('marks escape when void-stalker exceeds 75 units from player', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.setState({
        player: { ...useAdventure.getState().player, posX: 0, posY: 0, posZ: 0 },
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

      const player = { posX: 0, posZ: 0 };

      // At 74 units - should not escape
      useAdventure.setState({ enemies: [{ ...useAdventure.getState().enemies[0], posX: 74, posZ: 0 }] });
      const notEscaped = hasChaseTargetEscaped(player, useAdventure.getState().enemies);
      expect(notEscaped).toBe(false);

      // At 75 units - should escape
      useAdventure.setState({ enemies: [{ ...useAdventure.getState().enemies[0], posX: 75, posZ: 0 }] });
      const escaped = hasChaseTargetEscaped(player, useAdventure.getState().enemies);
      expect(escaped).toBe(true);
    });

    it('does not mark escape for dead enemies beyond threshold', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
      useAdventure.setState({
        player: { ...useAdventure.getState().player, posX: 0, posY: 0, posZ: 0 },
        enemies: [{
          id: 'stalker',
          fighterId: 'void-stalker',
          tier: 'boss1',
          posX: 100, posY: 0, posZ: 0, rotY: 0,
          health: 0, maxHealth: 2500,
          isDead: true, isAggro: false, isAttacking: false,
          aiState: 'idle', telegraphTimer: 0,
          patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
        }],
      });

      const player = { posX: 0, posZ: 0 };
      const escaped = hasChaseTargetEscaped(player, useAdventure.getState().enemies);
      expect(escaped).toBe(false);
    });
  });

  // ============= Mission 5: Civilian Pursuit & Management =============

  describe('Mission 5: Civilian Initialization & Management', () => {
    it('initializes exactly 2 civilians at fixed spawn positions for mission 5', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      const civs = useAdventure.getState().objectives.civilianRegistry;

      expect(civs.length).toBe(2);
      expect(civs[0]).toEqual({
        id: 'civ_01',
        health: 100,
        maxHealth: 100,
        posX: -5,
        posY: 0,
        posZ: 10,
      });
      expect(civs[1]).toEqual({
        id: 'civ_02',
        health: 100,
        maxHealth: 100,
        posX: -8,
        posY: 0,
        posZ: 12,
      });
    });

    it('applies damage to civilians only in mission 5', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      useAdventure.getState().damageCivilian('civ_01', 50);

      expect(useAdventure.getState().objectives.civilianRegistry[0].health).toBe(50);
    });

    it('clamps civilian health to minimum of 0', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      useAdventure.getState().damageCivilian('civ_01', 200);

      expect(useAdventure.getState().objectives.civilianRegistry[0].health).toBe(0);
    });
  });

  describe('Mission 5: Civilian Pursuit System', () => {
    const enemy = {
      id: 'drone',
      fighterId: 'rift-drone',
      tier: 'minion1',
      posX: -15,
      posY: 0,
      posZ: -15,
      rotY: 0,
      health: 50,
      maxHealth: 50,
      isDead: false,
      isAggro: false,
      isAttacking: false,
      aiState: 'idle',
      telegraphTimer: 0,
      patrolTargetX: -15,
      patrolTargetZ: -15,
      stunTimer: 0,
    } as AdventureEnemy;

    it('targets nearest living civilian for pursuit', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      const civs = useAdventure.getState().objectives.civilianRegistry;

      const pursuit = civilianPursuitStep(enemy, civs, 5, 0.016);

      // Should target civ_01 at (-5, 10) as it's nearest
      expect(pursuit).not.toBeNull();
      if (pursuit) {
        expect(pursuit.targetId).toBe('civ_01');
      }
    });

    it('ignores dead civilians in pursuit calculation', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      useAdventure.getState().damageCivilian('civ_01', 100); // Kill civ_01

      const civs = useAdventure.getState().objectives.civilianRegistry;
      const pursuit = civilianPursuitStep(enemy, civs, 5, 0.016);

      // Should target civ_02 since civ_01 is dead
      expect(pursuit).not.toBeNull();
      if (pursuit) {
        expect(pursuit.targetId).toBe('civ_02');
      }
    });

    it('returns null when no living civilians remain', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      useAdventure.getState().damageCivilian('civ_01', 100);
      useAdventure.getState().damageCivilian('civ_02', 100);

      const civs = useAdventure.getState().objectives.civilianRegistry;
      const pursuit = civilianPursuitStep(enemy, civs, 5, 0.016);

      expect(pursuit).toBeNull();
    });
  });

  describe('Mission 5: Civilian Attack Mechanics', () => {
    it('permits civilian attacks only for living, engaged enemies in range and off cooldown', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');

      // Place enemy close to first civilian
      const civs = useAdventure.getState().objectives.civilianRegistry;
      const civ1 = civs[0];

      useAdventure.setState({
        player: { ...useAdventure.getState().player, posX: 0, posY: 0, posZ: 0 },
        enemies: [{
          id: 'e1',
          fighterId: 'rift-drone',
          tier: 'minion1',
          posX: civ1.posX + 2, // ~2 units from civilian
          posY: 0,
          posZ: civ1.posZ,
          rotY: 0,
          health: 50,
          maxHealth: 50,
          isDead: false,
          isAggro: true,
          isAttacking: false,
          aiState: 'chase',
          telegraphTimer: 0,
          patrolTargetX: 0,
          patrolTargetZ: 0,
          stunTimer: 0,
        }],
      });

      const enemies = useAdventure.getState().enemies;
      const updatedCivs = useAdventure.getState().objectives.civilianRegistry;

      // Within range, off cooldown
      const attacks = findCivilianAttack(enemies, updatedCivs, 1000, new Map());
      expect(attacks.length).toBeGreaterThan(0);

      // Same enemy on cooldown
      const cooldownMap = new Map([['e1', 0]]);
      const noAttacks = findCivilianAttack(enemies, updatedCivs, 100, cooldownMap);
      expect(noAttacks).toEqual([]);
    });

    it('does not permit attacks from enemies outside pursuit range', () => {
      useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
      const civs = useAdventure.getState().objectives.civilianRegistry;

      useAdventure.setState({
        player: { ...useAdventure.getState().player, posX: 0, posY: 0, posZ: 0 },
        enemies: [{
          id: 'e1',
          fighterId: 'rift-drone',
          tier: 'minion1',
          posX: civs[0].posX + 30, // Far beyond attack range
          posY: 0,
          posZ: civs[0].posZ,
          rotY: 0,
          health: 50,
          maxHealth: 50,
          isDead: false,
          isAggro: true,
          isAttacking: false,
          aiState: 'chase',
          telegraphTimer: 0,
          patrolTargetX: 0,
          patrolTargetZ: 0,
          stunTimer: 0,
        }],
      });

      const enemies = useAdventure.getState().enemies;
      const updatedCivs = useAdventure.getState().objectives.civilianRegistry;

      const attacks = findCivilianAttack(enemies, updatedCivs, 1000, new Map());
      expect(attacks).toEqual([]);
    });
  });

  describe('Mission 4 Victory Conditions', () => {
    it('stalker intercept triggers both health floor and retreat state', () => {
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

      // Apply overkill
      useAdventure.getState().damageEnemy('stalker', 6000);

      // Stalker is intercepted and put in retreat
      let s = useAdventure.getState();
      expect(s.objectives.milestones.stalkerIntercepted).toBe(true);
      expect(s.enemies[0].health).toBe(250); // At 10% floor
      expect(s.enemies[0].aiState).toBe('retreat');
      expect(s.enemies[0].isDead).toBe(false); // Still alive, cannot be killed

      // Even more overkill keeps it at floor
      useAdventure.getState().damageEnemy('stalker', 5000);
      s = useAdventure.getState();
      expect(s.enemies[0].health).toBe(250); // Still at floor
      expect(s.objectives.milestones.stalkerIntercepted).toBe(true);
    });
  });

  describe('Mission 5 Victory Conditions', () => {
    it('requires at least one civilian alive for mission 5 victory', () => {
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

      // Kill general while civilians alive
      useAdventure.getState().damageEnemy('general', 1000);

      let s = useAdventure.getState();
      expect(s.objectives.milestones.generalDefeated).toBe(true);
      expect(s.objectives.civilianRegistry.some(c => c.health > 0)).toBe(true);
    });

    it('fails mission when all civilians die', () => {
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

      useAdventure.getState().damageCivilian('civ_01', 100);
      useAdventure.getState().damageCivilian('civ_02', 100);

      const s = useAdventure.getState();
      expect(s.objectives.civilianRegistry.every(c => c.health <= 0)).toBe(true);
    });
  });
});
