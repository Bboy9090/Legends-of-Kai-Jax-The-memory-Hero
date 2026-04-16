/**
 * Wave Director
 * Authoritative implementation from architecture doctrine
 */

import { MissionTracker } from './MissionTracker';

export type EnemyType = 'fang_grunt' | 'covenant_scout' | 'covenant_enforcer';

export interface Enemy {
  type: EnemyType;
  hp: number;
  maxHP: number;
  x: number;
  y: number;
  isBoss: boolean;
  id: string;
}

export class WaveDirector {
  private scene: any; // THREE.Scene type, kept generic per spec
  private tracker: MissionTracker;
  private activeEnemies: Enemy[] = [];
  private enemyIdCounter = 0;

  constructor(scene: any, tracker: MissionTracker) {
    this.scene = scene;
    this.tracker = tracker;
  }

  /**
   * Spawn enemy at position
   */
  spawnEnemy(type: EnemyType, x: number, y: number): Enemy {
    const isBoss = type === 'covenant_enforcer';
    const hp = isBoss ? 100 : 30;

    const enemy: Enemy = {
      type,
      hp,
      maxHP: hp,
      x,
      y,
      isBoss,
      id: `enemy_${this.enemyIdCounter++}`,
    };

    this.activeEnemies.push(enemy);
    console.log(`[WaveDirector] Spawned ${type} at (${x}, ${y}) | HP: ${hp} | Boss: ${isBoss}`);

    return enemy;
  }

  /**
   * Spawn wave from definition
   */
  spawnWave(enemies: Array<{ type: EnemyType; count: number }>): void {
    enemies.forEach(({ type, count }) => {
      for (let i = 0; i < count; i++) {
        // Spread enemies across arena
        const x = -5 + (i * 2);
        const y = 0;
        this.spawnEnemy(type, x, y);
      }
    });
  }

  /**
   * Update active enemies, check for deaths
   */
  update(): void {
    const before = this.activeEnemies.length;
    this.activeEnemies = this.activeEnemies.filter((e) => e.hp > 0);
    const after = this.activeEnemies.length;

    const died = before - after;
    if (died > 0) {
      for (let i = 0; i < died; i++) {
        this.tracker.registerKill();
      }
    }
  }

  /**
   * Apply damage to enemy
   */
  damageEnemy(enemyId: string, damage: number): boolean {
    const enemy = this.activeEnemies.find((e) => e.id === enemyId);
    if (!enemy) return false;

    enemy.hp = Math.max(0, enemy.hp - damage);
    console.log(`[WaveDirector] ${enemy.type} took ${damage} damage. HP: ${enemy.hp}/${enemy.maxHP}`);

    if (enemy.hp === 0) {
      this.markEnemyDead(enemy);
      return true;
    }

    return false;
  }

  /**
   * Mark enemy as dead
   */
  markEnemyDead(enemy: Enemy): void {
    enemy.hp = 0;
    console.log(`[WaveDirector] ${enemy.type} defeated`);

    if (enemy.isBoss) {
      this.tracker.registerBossDefeated();
    }
  }

  /**
   * Get all active enemies
   */
  getActiveEnemies(): Enemy[] {
    return [...this.activeEnemies];
  }

  /**
   * Get enemy count
   */
  getEnemyCount(): number {
    return this.activeEnemies.length;
  }

  /**
   * Check if wave is cleared
   */
  isWaveCleared(): boolean {
    return this.activeEnemies.length === 0;
  }

  /**
   * Clear all enemies
   */
  clearAll(): void {
    this.activeEnemies = [];
  }
}
