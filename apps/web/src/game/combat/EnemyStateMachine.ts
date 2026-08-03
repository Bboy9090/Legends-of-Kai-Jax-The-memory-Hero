/**
 * KJ-007A: Enemy Contracts and AI State Machine Definitions
 * Explicit, typed interfaces for Enemy entities and AI State transitions.
 */

export type EnemyAIState =
  | 'IDLE'
  | 'DETECTION'
  | 'APPROACH'
  | 'TELEGRAPH'
  | 'ATTACK'
  | 'STAGGER'
  | 'DEATH';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface EnemyStats {
  maxHealth: number;
  currentHealth: number;
  attackPower: number;
  detectionRadius: number;
  attackRange: number;
  moveSpeed: number;
  telegraphDurationMs: number;
  staggerDurationMs: number;
}

export interface EnemyContract {
  id: string;
  name: string;
  type: 'MEMORY_WISP' | 'SCOUT' | 'BRUTE' | 'BOSS';
  position: Position3D;
  stats: EnemyStats;
  currentState: EnemyAIState;
  stateTimerMs: number;
  targetPosition?: Position3D;
  isStaggered: boolean;
  isDead: boolean;
}

export interface EnemyDamageResult {
  damageDealt: number;
  remainingHealth: number;
  triggeredStagger: boolean;
  triggeredDeath: boolean;
  nextState: EnemyAIState;
}

/**
 * Reusable, deterministic AI state machine for enemy entities.
 */
export class EnemyStateMachine {
  private enemy: EnemyContract;

  constructor(enemy: EnemyContract) {
    this.enemy = {
      ...enemy,
      position: { ...enemy.position },
      stats: { ...enemy.stats },
    };
  }

  public getEntity(): EnemyContract {
    return this.enemy;
  }

  public update(deltaMs: number, playerPosition: Position3D): EnemyAIState {
    if (this.enemy.isDead) {
      this.enemy.currentState = 'DEATH';
      return 'DEATH';
    }

    const distToPlayer = this.calculateDistance(this.enemy.position, playerPosition);

    switch (this.enemy.currentState) {
      case 'IDLE':
        if (distToPlayer <= this.enemy.stats.detectionRadius) {
          this.transitionTo('DETECTION');
        }
        break;

      case 'DETECTION':
        this.enemy.stateTimerMs += deltaMs;
        if (this.enemy.stateTimerMs >= 300) { // 300ms detection delay
          this.transitionTo('APPROACH');
        }
        break;

      case 'APPROACH':
        if (distToPlayer <= this.enemy.stats.attackRange) {
          this.transitionTo('TELEGRAPH');
        } else if (distToPlayer > this.enemy.stats.detectionRadius) {
          this.transitionTo('IDLE');
        } else {
          // Move towards player
          this.moveTowards(playerPosition, (this.enemy.stats.moveSpeed * deltaMs) / 1000);
        }
        break;

      case 'TELEGRAPH':
        this.enemy.stateTimerMs += deltaMs;
        if (this.enemy.stateTimerMs >= this.enemy.stats.telegraphDurationMs) {
          this.transitionTo('ATTACK');
        }
        break;

      case 'ATTACK':
        // Attack execution lasts 200ms before returning to approach/telegraph
        this.enemy.stateTimerMs += deltaMs;
        if (this.enemy.stateTimerMs >= 200) {
          this.transitionTo(distToPlayer <= this.enemy.stats.attackRange ? 'TELEGRAPH' : 'APPROACH');
        }
        break;

      case 'STAGGER':
        this.enemy.stateTimerMs += deltaMs;
        if (this.enemy.stateTimerMs >= this.enemy.stats.staggerDurationMs) {
          this.enemy.isStaggered = false;
          this.transitionTo('APPROACH');
        }
        break;

      case 'DEATH':
        // Terminal state
        break;
    }

    return this.enemy.currentState;
  }

  public applySingleHitDamage(damage: number): EnemyDamageResult {
    if (this.enemy.isDead) {
      return {
        damageDealt: 0,
        remainingHealth: 0,
        triggeredStagger: false,
        triggeredDeath: true,
        nextState: 'DEATH',
      };
    }

    const actualDamage = Math.max(0, damage);
    this.enemy.stats.currentHealth = Math.max(0, this.enemy.stats.currentHealth - actualDamage);

    const triggeredDeath = this.enemy.stats.currentHealth === 0;
    const triggeredStagger = !triggeredDeath && actualDamage >= 10; // Stagger threshold

    if (triggeredDeath) {
      this.enemy.isDead = true;
      this.transitionTo('DEATH');
    } else if (triggeredStagger) {
      this.enemy.isStaggered = true;
      this.transitionTo('STAGGER');
    }

    return {
      damageDealt: actualDamage,
      remainingHealth: this.enemy.stats.currentHealth,
      triggeredStagger,
      triggeredDeath,
      nextState: this.enemy.currentState,
    };
  }

  private transitionTo(newState: EnemyAIState) {
    this.enemy.currentState = newState;
    this.enemy.stateTimerMs = 0;
  }

  private moveTowards(target: Position3D, distance: number) {
    const dx = target.x - this.enemy.position.x;
    const dz = target.z - this.enemy.position.z;
    const len = Math.sqrt(dx * dx + dz * dz);

    if (len > 0.001) {
      this.enemy.position.x += (dx / len) * distance;
      this.enemy.position.z += (dz / len) * distance;
    }
  }

  private calculateDistance(a: Position3D, b: Position3D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

/**
 * Factory for creating standard Mission 1 Memory Wisp entity
 */
export function createMemoryWisp(id: string, initialPosition: Position3D): EnemyContract {
  return {
    id,
    name: 'Memory Wisp',
    type: 'MEMORY_WISP',
    position: { ...initialPosition },
    stats: {
      maxHealth: 30,
      currentHealth: 30,
      attackPower: 5,
      detectionRadius: 8.0,
      attackRange: 1.5,
      moveSpeed: 3.0,
      telegraphDurationMs: 400,
      staggerDurationMs: 300,
    },
    currentState: 'IDLE',
    stateTimerMs: 0,
    isStaggered: false,
    isDead: false,
  };
}
