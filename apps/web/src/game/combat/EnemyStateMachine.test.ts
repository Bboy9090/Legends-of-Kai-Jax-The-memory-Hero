import { beforeEach, describe, expect, it } from 'vitest';
import {
  EnemyStateMachine,
  createMemoryWisp,
  createRiftDrone,
  createVoidStalker,
  type EnemyContract,
  type Position3D,
} from './EnemyStateMachine';

describe('EnemyStateMachine', () => {
  let wisp: EnemyContract;
  let ai: EnemyStateMachine;
  const playerPos: Position3D = { x: 0, y: 0, z: 0 };

  beforeEach(() => {
    wisp = createMemoryWisp('wisp-1', { x: 10, y: 0, z: 0 });
    ai = new EnemyStateMachine(wisp);
  });

  it('starts in IDLE state', () => {
    expect(ai.getEntity().currentState).toBe('IDLE');
    expect(ai.getEntity().isDead).toBe(false);
  });

  it('returns deep snapshots that cannot mutate authoritative state', () => {
    const snapshot = ai.getEntity();
    snapshot.position.x = -999;
    snapshot.stats.currentHealth = 1;
    snapshot.activeProjectiles.push({
      id: 'fake',
      ownerId: 'fake',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      damage: 999,
      lifetimeMs: 0,
      maxLifetimeMs: 999,
      active: true,
    });

    const authoritative = ai.getEntity();
    expect(authoritative.position.x).toBe(10);
    expect(authoritative.stats.currentHealth).toBe(30);
    expect(authoritative.activeProjectiles).toHaveLength(0);
  });

  it('transitions from IDLE to DETECTION when player enters detection radius', () => {
    const closePlayer: Position3D = { x: 7, y: 0, z: 0 };
    expect(ai.update(16, closePlayer)).toBe('DETECTION');
  });

  it('transitions from DETECTION to APPROACH after confirmation time', () => {
    const closePlayer: Position3D = { x: 7, y: 0, z: 0 };
    ai.update(16, closePlayer);
    expect(ai.update(300, closePlayer)).toBe('APPROACH');
  });

  it('moves towards player in APPROACH state', () => {
    const startX = ai.getEntity().position.x;
    const closePlayer: Position3D = { x: 5, y: 0, z: 0 };
    ai.update(16, closePlayer);
    ai.update(300, closePlayer);
    ai.update(100, closePlayer);
    expect(ai.getEntity().position.x).toBeLessThan(startX);
  });

  it('ignores invalid delta and invalid player coordinates safely', () => {
    const before = ai.getEntity();
    expect(ai.update(Number.NaN, playerPos)).toBe(before.currentState);
    expect(ai.update(16, { x: Number.NaN, y: 0, z: 0 })).toBe(before.currentState);
    expect(ai.getEntity().position).toEqual(before.position);
  });

  it('transitions from APPROACH to TELEGRAPH when within attack range', () => {
    const closeWisp = createMemoryWisp('wisp-2', { x: 2, y: 0, z: 0 });
    const meleeAi = new EnemyStateMachine(closeWisp);
    const meleePlayer: Position3D = { x: 1, y: 0, z: 0 };
    meleeAi.update(16, meleePlayer);
    meleeAi.update(300, meleePlayer);
    expect(meleeAi.update(16, meleePlayer)).toBe('TELEGRAPH');
  });

  it('sanitizes invalid damage instead of corrupting health with NaN', () => {
    const result = ai.applySingleHitDamage(Number.NaN);
    expect(result.damageDealt).toBe(0);
    expect(result.remainingHealth).toBe(30);
  });

  it('triggers single-hit damage and stagger', () => {
    const result = ai.applySingleHitDamage(15);
    expect(result.damageDealt).toBe(15);
    expect(result.remainingHealth).toBe(15);
    expect(result.triggeredStagger).toBe(true);
    expect(result.nextState).toBe('STAGGER');
  });

  it('triggers death and clears combat state when health reaches zero', () => {
    const result = ai.applySingleHitDamage(30);
    expect(result.remainingHealth).toBe(0);
    expect(result.triggeredDeath).toBe(true);
    expect(result.nextState).toBe('DEATH');
    expect(ai.getEntity().isDead).toBe(true);
  });

  it('creates deterministic projectile ids for the same enemy simulation', () => {
    const makeDrone = () => new EnemyStateMachine(createRiftDrone('drone-proof', { x: 6, y: 0, z: 0 }));
    const runToProjectile = (machine: EnemyStateMachine) => {
      machine.update(16, playerPos); // detection
      machine.update(300, playerPos); // approach
      machine.update(16, playerPos); // telegraph
      machine.update(600, playerPos); // attack + projectile
      return machine.getEntity().activeProjectiles[0]?.id;
    };
    expect(runToProjectile(makeDrone())).toBe(runToProjectile(makeDrone()));
  });

  it('replays deterministic stalker teleport placement from the same seed', () => {
    const run = () => {
      const stalker = new EnemyStateMachine(createVoidStalker('stalker-proof', { x: 5, y: 0, z: 0 }));
      stalker.update(16, playerPos);
      stalker.update(300, playerPos);
      stalker.update(16, playerPos);
      return stalker.getEntity().position;
    };
    expect(run()).toEqual(run());
  });
});
