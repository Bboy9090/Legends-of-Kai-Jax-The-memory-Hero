import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAdventure } from '../../lib/stores/useAdventure';
import { useRunner } from '../../lib/stores/useRunner';
import { useMissions } from '../../lib/stores/useMissions';
import { Mission1AdventureSession } from './Mission1AdventureSession';
import { EnemyStateMachine, createMemoryWisp, createRiftDrone } from './EnemyStateMachine';
import { isMission1Id } from './mission1Identity';

let session: Mission1AdventureSession | undefined;
beforeEach(() => {
  useAdventure.getState().reset();
  useRunner.setState({ completedStoryMissionIds: [], selectedCharacter: 'kai-jax', totalScore: 0 });
  useMissions.setState({ active: null, completedKeys: [], result: null, lastReward: null });
});
afterEach(() => session?.dispose());
function start() {
  useAdventure.getState().initAdventure('kai-jax', 'story_act1_m1', 'cross_point_arena');
  session = new Mission1AdventureSession('story_act1_m1');
  return session;
}

describe('Mission 1 adventure integration', () => {
  it('recognizes canonical and legacy mission identity without claiming other missions', () => {
    for (const id of ['story_act1_m1', 'mission1', 'm1', 'story_1']) expect(isMission1Id(id)).toBe(true);
    for (const id of ['story_act1_m2', 'training', null, undefined]) expect(isMission1Id(id)).toBe(false);
  });
  it('normal hits survive synchronization and count deaths once', () => {
    const runtime = start();
    useAdventure.getState().damageEnemy('wisp-1', 10);
    runtime.tick(0.016);
    expect(runtime.director.getEnemies()[0].stats.currentHealth).toBe(20);
    expect(useAdventure.getState().enemies[0].health).toBe(20);
    useAdventure.getState().damageEnemy('wisp-1', 50);
    useAdventure.getState().damageEnemy('wisp-1', 50);
    expect(useAdventure.getState().enemiesDefeated).toBe(1);
    useAdventure.getState().damageEnemy('wisp-2', 50);
    runtime.tick(0.016);
    expect(runtime.director.getCurrentWave()).toBe('WAVE_2');
    expect(useAdventure.getState().enemies.every(enemy => enemy.health > 0)).toBe(true);
  });
  it('completes every wave through the player damage entry and saves exactly once', () => {
    const runtime = start();
    for (const wave of ['WAVE_1', 'WAVE_2', 'WAVE_3', 'WAVE_4', 'ELITE', 'BOSS']) {
      expect(runtime.director.getCurrentWave()).toBe(wave);
      for (const enemy of useAdventure.getState().enemies) useAdventure.getState().damageEnemy(enemy.id, 10000, true);
      runtime.tick(0.016);
    }
    expect(runtime.director.getCurrentWave()).toBe('VICTORY');
    expect(useAdventure.getState().districtCompleted).toBe(true);
    expect(useRunner.getState().completedStoryMissionIds).toContain('story_act1_m1');
    expect(useMissions.getState().result).toBe('success');
    const score = useRunner.getState().totalScore;
    runtime.tick(0.05);
    expect(useRunner.getState().totalScore).toBe(score);
  });
  it('rejects simulation and hits while paused or dead', () => {
    const runtime = start();
    const before = runtime.director.getEnemies();
    useAdventure.setState({ isPaused: true });
    useAdventure.getState().damageEnemy('wisp-1', 100);
    runtime.tick(0.05);
    expect(runtime.director.getEnemies()).toEqual(before);
    useAdventure.setState(state => ({ isPaused: false, player: { ...state.player, health: 0 } }));
    useAdventure.getState().damageEnemy('wisp-1', 100);
    runtime.tick(0.05);
    expect(runtime.director.getEnemies()).toEqual(before);
    expect(useRunner.getState().completedStoryMissionIds).toEqual([]);
  });
  it('routes enemy damage through player vulnerability and releases ownership on exit', () => {
    const runtime = start();
    useAdventure.getState().setPlayerPos(5, 0, 0);
    for (let frame = 0; frame < 30; frame++) runtime.tick(0.05);
    expect(useAdventure.getState().player.health).toBeLessThan(100);
    expect(useAdventure.getState().player.invulnTimer).toBe(0.42);
    runtime.dispose();
    expect(useAdventure.getState().encounterDamageHandler).toBeNull();
    useAdventure.getState().initAdventure('jaxon', 'story_act1_m2', 'cross_point_arena');
    expect(useAdventure.getState().encounterDamageHandler).toBeNull();
  });
  it('propagates heavy damage to armor breaking', () => {
    const runtime = start();
    for (let wave = 0; wave < 2; wave++) {
      for (const enemy of useAdventure.getState().enemies) useAdventure.getState().damageEnemy(enemy.id, 10000, true);
      runtime.tick(0.016);
    }
    useAdventure.getState().damageEnemy('brute-1', 20, true);
    expect(runtime.director.getEnemies()[0].isArmorBroken).toBe(true);
  });
  it('rejects invalid damage and deltas', () => {
    const runtime = start();
    const before = runtime.director.getEnemies();
    for (const damage of [NaN, Infinity, -1, 0]) expect(runtime.applyDamage('wisp-1', damage, true)).toBeNull();
    for (const delta of [NaN, Infinity, -1, 0]) runtime.tick(delta);
    expect(runtime.director.getEnemies()).toEqual(before);
  });
  it('old disposed callbacks cannot affect or detach a replacement session', () => {
    const old = start(); old.dispose();
    const next = new Mission1AdventureSession('story_act1_m1'); session = next;
    old.dispose(); old.tick(0.05);
    expect(old.applyDamage('wisp-1', 1000)).toBeNull();
    useAdventure.getState().damageEnemy('wisp-1', 10);
    expect(next.director.getEnemies()[0].stats.currentHealth).toBe(20);
    expect(old.director.getEnemies()[0].stats.currentHealth).toBe(30);
  });
});

describe('enemy damage events', () => {
  const player = { x: 0, y: 0, z: 0 };
  it('emits one hit per melee attack and none when dodged or out of reach', () => {
    for (const [id, target, dodge, expected] of [
      ['hit', player, false, [5]],
      ['dodge', player, true, []],
      ['miss', { x: 20, y: 0, z: 0 }, false, []],
    ] as const) {
      const enemy = new EnemyStateMachine(createMemoryWisp(id, player));
      enemy.update(16, player); enemy.update(300, player); enemy.update(16, player);
      enemy.update(400, target, dodge);
      expect(enemy.drainPlayerDamage()).toEqual(expected);
      enemy.update(16, target);
      expect(enemy.drainPlayerDamage()).toEqual([]);
    }
  });
  it('emits projectile collision damage instead of only removing it', () => {
    const enemy = new EnemyStateMachine(createRiftDrone('drone', { x: 6, y: 0, z: 0 }));
    enemy.update(16, player); enemy.update(300, player); enemy.update(16, player); enemy.update(600, player);
    let damage = 0;
    for (let frame = 0; frame < 15; frame++) {
      enemy.update(50, player);
      damage += enemy.drainPlayerDamage().reduce((sum, amount) => sum + amount, 0);
    }
    expect(damage).toBeGreaterThan(0);
    expect(enemy.getEntity().activeProjectiles).toEqual([]);
  });
});
