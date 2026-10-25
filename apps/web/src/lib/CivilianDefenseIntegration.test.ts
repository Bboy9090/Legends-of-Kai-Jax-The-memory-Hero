import { beforeEach, describe, expect, it } from 'vitest';
import { useAdventure, type AdventureEnemy } from './stores/useAdventure';
import { findCivilianAttack, CIVILIAN_ATTACK_DAMAGE, CIVILIAN_ATTACK_COOLDOWN_MS } from './adventureTelemetry';
import { civilianPursuitStep } from './civilianPursuit';
import { evaluateCampaignProgressionGating } from './adventureEvaluator';
import { ENEMY_TIERS } from '../game/tuning/enemyTuning';

const drone = (posX: number, posZ: number): AdventureEnemy => ({
  id: 'drone', fighterId: 'rift-drone', tier: 'minion1', posX, posY: 0, posZ, rotY: 0,
  health: 40, maxHealth: 40, isDead: false, isAggro: false, isAttacking: false,
  aiState: 'chase', telegraphTimer: 0, patrolTargetX: posX, patrolTargetZ: posZ, stunTimer: 0,
});

function outcome() {
  const state = useAdventure.getState();
  return evaluateCampaignProgressionGating({ missionId: state.missionId,
    enemies: state.enemies, objectives: state.objectives, currentWaveIndex: 0, totalWavesCount: 1 });
}

describe('Mission 5 civilian defense frame/cooldown integration', () => {
  beforeEach(() => useAdventure.getState().reset());

  it('moves a live drone toward a civilian across store frames and stops at the target', () => {
    useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
    useAdventure.getState().spawnEnemies([drone(-5, 5)]);
    const target = useAdventure.getState().objectives.civilianRegistry[0];
    const initial = Math.hypot(target.posX + 5, target.posZ - 5);
    for (let frame = 0; frame < 90; frame++) {
      const state = useAdventure.getState();
      const enemy = state.enemies[0];
      const step = civilianPursuitStep(enemy, state.objectives.civilianRegistry, ENEMY_TIERS[enemy.tier].speed, 1 / 60);
      expect(step?.targetId).toBe(target.id);
      state.setEnemyPos(enemy.id, step!.nextX, enemy.posY, step!.nextZ);
    }
    const enemy = useAdventure.getState().enemies[0];
    expect(Math.hypot(enemy.posX - target.posX, enemy.posZ - target.posZ)).toBeLessThan(initial);
    expect(enemy.posZ).toBeLessThanOrEqual(target.posZ);
  });

  it('applies civilian damage only on cooldown expiry, then fails when both civilians die', () => {
    useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
    useAdventure.getState().spawnEnemies([drone(-5, 10)]);
    const lastAttack = new Map<string, number>();
    let totalHits = 0;
    for (let now = 0; now <= 26000; now += 500) {
      const state = useAdventure.getState();
      for (const attack of findCivilianAttack(state.enemies, state.objectives.civilianRegistry, now, lastAttack)) {
        state.damageCivilian(attack.civilianId, CIVILIAN_ATTACK_DAMAGE);
        lastAttack.set(attack.enemyId, now);
        totalHits++;
      }
    }
    // One enemy attacks at most once every two seconds, retargeting a surviving civilian.
    expect(totalHits).toBe(14);
    expect(useAdventure.getState().objectives.civilianRegistry.map(c => c.health)).toEqual([0, 0]);
    expect(outcome()).toBe('FAILED');
    expect(lastAttack.get('drone')).toBe(13 * CIVILIAN_ATTACK_COOLDOWN_MS);
  });

  it('does not damage civilians if the attacker dies or the mission has ended', () => {
    useAdventure.getState().initAdventure('kai-jax', 'story_act1_m5', 'arena');
    useAdventure.getState().spawnEnemies([drone(-5, 10)]);
    useAdventure.getState().damageEnemy('drone', 100);
    const state = useAdventure.getState();
    expect(findCivilianAttack(state.enemies, state.objectives.civilianRegistry, 0, new Map())).toEqual([]);
    state.damageCivilian('civ_01', 15);
    const before = useAdventure.getState().objectives.civilianRegistry[0].health;
    useAdventure.setState(s => ({ objectives: { ...s.objectives, status: 'VICTORY' } }));
    useAdventure.getState().damageCivilian('civ_01', 15);
    expect(useAdventure.getState().objectives.civilianRegistry[0].health).toBe(before);
  });
});
