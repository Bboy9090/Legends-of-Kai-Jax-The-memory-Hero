import { describe, it, expect, beforeEach } from 'vitest';
import {
  EnemyStateMachine,
  createRiftDrone,
  createCorruptionBrute,
  createVoidStalker,
  createVoidStalkerPrime,
  Position3D,
} from './EnemyStateMachine';
import { EncounterDirector } from './EncounterDirector';

describe('KJ-007B — Rift Drone', () => {
  it('respects preferred distance and retreats when Kai-Jax gets too close', () => {
    const drone = createRiftDrone('d1', { x: 3, y: 0, z: 0 }); // Too close (< 4.0)
    const ai = new EnemyStateMachine(drone);
    const playerPos: Position3D = { x: 0, y: 0, z: 0 };

    ai.update(16, playerPos); // IDLE -> DETECTION
    ai.update(300, playerPos); // DETECTION -> APPROACH
    const state = ai.update(16, playerPos); // APPROACH -> RETREAT
    expect(state).toBe('RETREAT');
  });

  it('spawns projectile during telegraph/attack phase which expires', () => {
    const drone = createRiftDrone('d2', { x: 6, y: 0, z: 0 });
    const ai = new EnemyStateMachine(drone);
    const playerPos: Position3D = { x: 0, y: 0, z: 0 };

    ai.update(16, playerPos); // IDLE -> DETECTION
    ai.update(300, playerPos); // DETECTION -> APPROACH
    ai.update(16, playerPos); // APPROACH -> TELEGRAPH
    ai.update(600, playerPos); // TELEGRAPH -> ATTACK (spawns projectile)

    expect(ai.getEntity().activeProjectiles.length).toBe(1);
    expect(ai.getEntity().activeProjectiles[0].ownerId).toBe('d2');

    // Advance 4000ms so projectile expires (maxLifetime = 3000ms)
    ai.update(4000, playerPos);
    expect(ai.getEntity().activeProjectiles.length).toBe(0);
  });
});

describe('KJ-007C — Corruption Brute', () => {
  it('light attack does not break armor, heavy attack breaks armor', () => {
    const brute = createCorruptionBrute('b1', { x: 5, y: 0, z: 0 });
    const ai = new EnemyStateMachine(brute);

    // Light attack (10 dmg -> reduced to 3 dmg by 70% armor)
    const resLight = ai.applySingleHitDamage(10, false);
    expect(resLight.triggeredArmorBreak).toBe(false);
    expect(ai.getEntity().stats.armor).toBe(50);

    // Heavy attack (20 dmg -> breaks armor)
    const resHeavy = ai.applySingleHitDamage(20, true);
    expect(resHeavy.triggeredArmorBreak).toBe(true);
    expect(ai.getEntity().stats.armor).toBe(0);
    expect(ai.getEntity().isArmorBroken).toBe(true);
  });
});

describe('KJ-007D — Void Stalker Elite', () => {
  it('teleports near player without spawning directly inside player', () => {
    const stalker = createVoidStalker('s1', { x: 10, y: 0, z: 0 });
    const ai = new EnemyStateMachine(stalker);
    const playerPos: Position3D = { x: 0, y: 0, z: 0 };

    ai.update(16, playerPos); // IDLE -> DETECTION
    ai.update(300, playerPos); // DETECTION -> APPROACH
    ai.update(16, playerPos); // APPROACH -> TELEPORT
    const entity = ai.getEntity();
    expect(entity.currentState).toBe('TELEPORT');

    const dist = Math.sqrt(entity.position.x ** 2 + entity.position.z ** 2);
    expect(dist).toBeGreaterThan(1.0); // Never directly inside player
  });
});

describe('KJ-007E — Void Stalker Prime Boss', () => {
  it('triggers Phase 2 transition at 60% health', () => {
    const boss = createVoidStalkerPrime('boss-1', { x: 5, y: 0, z: 0 });
    const ai = new EnemyStateMachine(boss);
    const playerPos: Position3D = { x: 0, y: 0, z: 0 };

    // Deal damage to drop below 60% (200 * 0.6 = 120 HP threshold)
    ai.applySingleHitDamage(90, true); // HP drops to 110
    const state = ai.update(16, playerPos);

    expect(state).toBe('PHASE_TRANSITION');
    expect(ai.getEntity().bossPhase).toBe(2);
    expect(ai.getEntity().antiStunlockTimerMs).toBe(2000);
  });
});

describe('KJ-007F — Encounter Director Mission 1 Path', () => {
  let director: EncounterDirector;
  const playerPos: Position3D = { x: 0, y: 0, z: 0 };

  beforeEach(() => {
    director = new EncounterDirector();
  });

  it('starts at Wave 1 with 2 Memory Wisps', () => {
    expect(director.getCurrentWave()).toBe('WAVE_1');
    expect(director.getEnemies().length).toBe(2);
  });

  it('advances through waves upon killing enemies and triggers save state at victory', () => {
    // Wave 1
    director.getEnemies().forEach((e) => director.applyDamageToEnemy(e.id, 100, true));
    director.update(16, playerPos);
    expect(director.getCurrentWave()).toBe('WAVE_2');

    // Wave 2
    director.getEnemies().forEach((e) => director.applyDamageToEnemy(e.id, 100, true));
    director.update(16, playerPos);
    expect(director.getCurrentWave()).toBe('WAVE_3');

    // Wave 3
    director.getEnemies().forEach((e) => director.applyDamageToEnemy(e.id, 100, true));
    director.update(16, playerPos);
    expect(director.getCurrentWave()).toBe('WAVE_4');

    // Wave 4
    director.getEnemies().forEach((e) => director.applyDamageToEnemy(e.id, 100, true));
    director.update(16, playerPos);
    expect(director.getCurrentWave()).toBe('ELITE');

    // Elite
    director.getEnemies().forEach((e) => director.applyDamageToEnemy(e.id, 100, true));
    director.update(16, playerPos);
    expect(director.getCurrentWave()).toBe('BOSS');

    // Boss Defeat
    director.getEnemies().forEach((e) => director.applyDamageToEnemy(e.id, 300, true));
    director.update(16, playerPos);

    expect(director.getCurrentWave()).toBe('VICTORY');
    expect(director.isMissionCompleted()).toBe(true);
    expect(director.getSaveState().completed).toBe(true);
  });
});
