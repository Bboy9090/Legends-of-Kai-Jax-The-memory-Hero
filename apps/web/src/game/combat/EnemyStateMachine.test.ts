import { describe, it, expect, beforeEach } from 'vitest';
import {
  EnemyStateMachine,
  createMemoryWisp,
  EnemyContract,
  Position3D,
} from './EnemyStateMachine';

describe('EnemyStateMachine (KJ-007A)', () => {
  let wisp: EnemyContract;
  let ai: EnemyStateMachine;
  const playerPos: Position3D = { x: 0, y: 0, z: 0 };

  beforeEach(() => {
    // Memory Wisp placed at (10, 0, 0)
    wisp = createMemoryWisp('wisp-1', { x: 10, y: 0, z: 0 });
    ai = new EnemyStateMachine(wisp);
  });

  it('starts in IDLE state', () => {
    expect(ai.getEntity().currentState).toBe('IDLE');
    expect(ai.getEntity().isDead).toBe(false);
  });

  it('transitions from IDLE to DETECTION when player enters detection radius', () => {
    // Detection radius is 8.0, place player at (7, 0, 0)
    const closePlayer: Position3D = { x: 7, y: 0, z: 0 };
    const state = ai.update(16, closePlayer);
    expect(state).toBe('DETECTION');
  });

  it('transitions from DETECTION to APPROACH after detection timer elapses', () => {
    const closePlayer: Position3D = { x: 7, y: 0, z: 0 };
    ai.update(16, closePlayer); // enters DETECTION
    const state = ai.update(300, closePlayer); // 300ms elapsed
    expect(state).toBe('APPROACH');
  });

  it('moves towards player in APPROACH state', () => {
    const startX = ai.getEntity().position.x;
    const closePlayer: Position3D = { x: 5, y: 0, z: 0 };

    ai.update(16, closePlayer); // IDLE -> DETECTION
    ai.update(300, closePlayer); // DETECTION -> APPROACH
    ai.update(100, closePlayer); // Move step

    expect(ai.getEntity().position.x).toBeLessThan(startX);
  });

  it('transitions from APPROACH to TELEGRAPH when within attack range', () => {
    const closeWisp = createMemoryWisp('wisp-2', { x: 2, y: 0, z: 0 });
    const meleeAi = new EnemyStateMachine(closeWisp);
    const meleePlayer: Position3D = { x: 1.0, y: 0, z: 0 };
    meleeAi.update(16, meleePlayer); // IDLE -> DETECTION
    meleeAi.update(300, meleePlayer); // DETECTION -> APPROACH
    const state = meleeAi.update(16, meleePlayer); // APPROACH -> TELEGRAPH
    expect(state).toBe('TELEGRAPH');
  });

  it('triggers single-hit damage and stagger', () => {
    const result = ai.applySingleHitDamage(15);
    expect(result.damageDealt).toBe(15);
    expect(result.remainingHealth).toBe(15);
    expect(result.triggeredStagger).toBe(true);
    expect(result.nextState).toBe('STAGGER');
  });

  it('triggers death and encounter advancement state when health reaches zero', () => {
    const result = ai.applySingleHitDamage(30);
    expect(result.remainingHealth).toBe(0);
    expect(result.triggeredDeath).toBe(true);
    expect(result.nextState).toBe('DEATH');
    expect(ai.getEntity().isDead).toBe(true);
  });
});
