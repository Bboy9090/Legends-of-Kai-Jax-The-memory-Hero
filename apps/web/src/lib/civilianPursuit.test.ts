import { describe, expect, it } from 'vitest';
import type { AdventureEnemy } from './stores/useAdventure';
import { civilianPursuitStep } from './civilianPursuit';
const enemy = { id: 'e', posX: 0, posY: 0, posZ: 0, isDead: false } as AdventureEnemy;
describe('civilian pursuit proposals', () => {
  it('clamps movement and chooses nearest living civilian without mutation', () => {
    const civilians = [{ id: 'dead', health: 0, maxHealth: 100, posX: 1, posY: 0, posZ: 0 }, { id: 'live', health: 100, maxHealth: 100, posX: 2, posY: 0, posZ: 0 }];
    expect(civilianPursuitStep(enemy, civilians, 5, 1)).toEqual({ targetId: 'live', nextX: 2, nextZ: 0 });
    expect(enemy.posX).toBe(0);
    expect(civilians[1].posX).toBe(2);
  });
  it('returns no pursuit for dead enemies or absent living civilians', () => {
    expect(civilianPursuitStep(enemy, [], 5, 1)).toBeNull();
    expect(civilianPursuitStep({ ...enemy, isDead: true }, [{ id: 'c', health: 100, maxHealth: 100, posX: 1, posY: 0, posZ: 0 }], 5, 1)).toBeNull();
  });
});
