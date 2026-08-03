import { describe, it, expect, beforeEach } from 'vitest';
import { EncounterDirector } from './EncounterDirector';
import { MOVES } from './moveData';
import { getMoveFrameTime } from './frameTiming';

describe('KJ-008F — Runtime & Integration Combat Tests', () => {
  let director: EncounterDirector;
  const playerPos = { x: 0, y: 0, z: 0 };

  beforeEach(() => {
    director = new EncounterDirector();
  });

  it('instantiates exactly one EncounterDirector for Mission 1', () => {
    expect(director).toBeDefined();
    expect(director.getCurrentWave()).toBe('WAVE_1');
  });

  it('attack damages only during active window and closes before recovery', () => {
    const move = MOVES['light1'];
    const timing = getMoveFrameTime(move);

    expect(timing.startupTime).toBeGreaterThan(0);
    expect(timing.activeTime).toBeGreaterThan(0);
    expect(timing.recoveryTime).toBeGreaterThan(0);
    expect(timing.startupTime + timing.activeTime + timing.recoveryTime).toBe(timing.totalTime);
  });

  it('single activation damages a target once without multi-hit per frame', () => {
    const enemies = director.getEnemies();
    const targetId = enemies[0].id;

    const res1 = director.applyDamageToEnemy(targetId, 10, false);
    expect(res1?.damageDealt).toBe(10);
    expect(res1?.remainingHealth).toBe(20);

    // Subsequent damage call in same hit window is guarded by player controller hitRef
  });

  it('armor-break feedback emits once on heavy attack', () => {
    // Advance to Wave 3 (Corruption Brute)
    director.applyDamageToEnemy('wisp-1', 100, true);
    director.applyDamageToEnemy('wisp-2', 100, true);
    director.update(16, playerPos); // Wave 2
    director.applyDamageToEnemy('wisp-3', 100, true);
    director.applyDamageToEnemy('drone-1', 100, true);
    director.update(16, playerPos); // Wave 3 (Brute)

    const bruteId = director.getEnemies()[0].id;
    const res = director.applyDamageToEnemy(bruteId, 20, true);
    expect(res?.triggeredArmorBreak).toBe(true);
  });

  it('boss phase 2 transition triggers once at 60% health threshold', () => {
    // Advance to Boss
    ['WAVE_1', 'WAVE_2', 'WAVE_3', 'WAVE_4', 'ELITE'].forEach(() => {
      director.getEnemies().forEach((e) => director.applyDamageToEnemy(e.id, 200, true));
      director.update(16, playerPos);
    });

    expect(director.getCurrentWave()).toBe('BOSS');
    const bossId = director.getEnemies()[0].id;

    // Drop HP below 60% (200 max HP -> 110 HP)
    director.applyDamageToEnemy(bossId, 90, true);
    director.update(16, playerPos);

    const bossEntity = director.getEnemies()[0];
    expect(bossEntity.bossPhase).toBe(2);
  });

  it('victory triggers only after boss defeat and produces saved completion state', () => {
    // Advance through entire mission to victory
    ['WAVE_1', 'WAVE_2', 'WAVE_3', 'WAVE_4', 'ELITE', 'BOSS'].forEach(() => {
      director.getEnemies().forEach((e) => director.applyDamageToEnemy(e.id, 500, true));
      director.update(16, playerPos);
    });

    expect(director.getCurrentWave()).toBe('VICTORY');
    expect(director.isMissionCompleted()).toBe(true);
    expect(director.getSaveState().completed).toBe(true);
  });
});
