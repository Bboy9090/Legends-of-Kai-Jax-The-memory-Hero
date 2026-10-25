import { beforeEach, describe, expect, it } from 'vitest';
import { useAdventure, type AdventureEnemy } from './stores/useAdventure';

const enemy = (overrides: Partial<AdventureEnemy> = {}): AdventureEnemy => ({
  id: 'enemy', fighterId: 'rift-grunt', tier: 'minion1',
  posX: 0, posY: 0, posZ: 0, rotY: 0,
  health: 100, maxHealth: 100, isAggro: false, isAttacking: false,
  isDead: false, aiState: 'idle', telegraphTimer: 0,
  patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0,
  ...overrides,
});

beforeEach(() => useAdventure.getState().reset());

describe('Mission 4 nonlethal interception', () => {
  it('survives a single lethal overkill hit at the exact 10% floor', () => {
    useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
    useAdventure.setState({ enemies: [enemy({ id: 'stalker', fighterId: 'void-stalker', tier: 'boss1', health: 2500, maxHealth: 2500 })] });
    useAdventure.getState().damageEnemy('stalker', 6000);
    const s = useAdventure.getState();
    expect(s.enemies[0]).toMatchObject({ health: 250, isDead: false, aiState: 'retreat' });
    expect(s.objectives.milestones.stalkerIntercepted).toBe(true);
    expect(s.enemiesDefeated).toBe(0);
  });

  it('intercepts gradual attrition and ignores subsequent overkill', () => {
    useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
    useAdventure.setState({ enemies: [enemy({ id: 'stalker', fighterId: 'void-stalker', tier: 'boss1', health: 2500, maxHealth: 2500 })] });
    useAdventure.getState().damageEnemy('stalker', 2000);
    expect(useAdventure.getState().objectives.milestones.stalkerIntercepted).toBe(false);
    useAdventure.getState().damageEnemy('stalker', 300);
    expect(useAdventure.getState().enemies[0].health).toBe(250);
    useAdventure.getState().damageEnemy('stalker', 5000);
    expect(useAdventure.getState().enemies[0]).toMatchObject({ health: 250, isDead: false, aiState: 'retreat' });
    expect(useAdventure.getState().enemiesDefeated).toBe(0);
  });

  it('does not count repeated hits on a dead enemy', () => {
    useAdventure.getState().initAdventure('kai-jax', 'story_act1_m4', 'arena');
    useAdventure.setState({ enemies: [enemy({ id: 'grunt' })] });
    useAdventure.getState().damageEnemy('grunt', 200);
    useAdventure.getState().damageEnemy('grunt', 200);
    expect(useAdventure.getState().enemiesDefeated).toBe(1);
    expect(useAdventure.getState().enemies[0]).toMatchObject({ health: 0, isDead: true });
  });
});
