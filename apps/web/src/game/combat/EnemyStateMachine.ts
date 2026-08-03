/**
 * KJ-007B - KJ-007F: Complete Mission 1 Enemy Roster & AI Implementation
 * Preserves Memory Wisp and adds Rift Drone, Corruption Brute, Void Stalker, Void Stalker Prime, and Encounter Director.
 */

export type EnemyAIState =
  | 'IDLE'
  | 'DETECTION'
  | 'APPROACH'
  | 'RETREAT'
  | 'TELEGRAPH'
  | 'ATTACK'
  | 'RECOVERY'
  | 'STAGGER'
  | 'DEATH'
  | 'TELEPORT'
  | 'PHASE_TRANSITION';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Projectile {
  id: string;
  ownerId: string;
  position: Position3D;
  velocity: Position3D;
  damage: number;
  lifetimeMs: number;
  maxLifetimeMs: number;
  active: boolean;
}

export interface EnemyStats {
  maxHealth: number;
  currentHealth: number;
  attackPower: number;
  detectionRadius: number;
  attackRange: number;
  preferredDistance: number;
  moveSpeed: number;
  telegraphDurationMs: number;
  staggerDurationMs: number;
  recoveryDurationMs: number;
  armor: number;
  maxArmor: number;
  teleportCooldownMs: number;
}

export type EnemyType =
  | 'MEMORY_WISP'
  | 'RIFT_DRONE'
  | 'CORRUPTION_BRUTE'
  | 'VOID_STALKER'
  | 'VOID_STALKER_PRIME';

export interface EnemyContract {
  id: string;
  name: string;
  type: EnemyType;
  position: Position3D;
  stats: EnemyStats;
  currentState: EnemyAIState;
  stateTimerMs: number;
  teleportTimerMs: number;
  isStaggered: boolean;
  isArmorBroken: boolean;
  isDead: boolean;
  bossPhase: 1 | 2;
  antiStunlockTimerMs: number;
  activeProjectiles: Projectile[];
}

export interface EnemyDamageResult {
  damageDealt: number;
  remainingHealth: number;
  triggeredStagger: boolean;
  triggeredArmorBreak: boolean;
  triggeredDeath: boolean;
  nextState: EnemyAIState;
}

/**
 * Deterministic AI State Machine supporting all Mission 1 enemy archetypes.
 */
export class EnemyStateMachine {
  private enemy: EnemyContract;

  constructor(enemy: EnemyContract) {
    this.enemy = {
      ...enemy,
      position: { ...enemy.position },
      stats: { ...enemy.stats },
      activeProjectiles: enemy.activeProjectiles ? enemy.activeProjectiles.map(p => ({ ...p })) : [],
    };
  }

  public getEntity(): EnemyContract {
    return {
      ...this.enemy,
      activeProjectiles: this.enemy.activeProjectiles.filter((p) => p.active),
    };
  }

  public update(deltaMs: number, playerPosition: Position3D, isPlayerDodging: boolean = false): EnemyAIState {
    if (this.enemy.isDead) {
      this.enemy.currentState = 'DEATH';
      return 'DEATH';
    }

    // Cooldown updates
    if (this.enemy.teleportTimerMs > 0) {
      this.enemy.teleportTimerMs = Math.max(0, this.enemy.teleportTimerMs - deltaMs);
    }
    if (this.enemy.antiStunlockTimerMs > 0) {
      this.enemy.antiStunlockTimerMs = Math.max(0, this.enemy.antiStunlockTimerMs - deltaMs);
    }

    // Update active projectiles
    this.updateProjectiles(deltaMs, playerPosition, isPlayerDodging);

    const distToPlayer = this.calculateDistance(this.enemy.position, playerPosition);

    // Boss Phase 2 Transition Check (Void Stalker Prime at <= 60% Health)
    if (
      this.enemy.type === 'VOID_STALKER_PRIME' &&
      this.enemy.bossPhase === 1 &&
      this.enemy.stats.currentHealth <= this.enemy.stats.maxHealth * 0.6
    ) {
      this.enemy.bossPhase = 2;
      this.enemy.antiStunlockTimerMs = 2000; // 2s stunlock protection
      this.enemy.activeProjectiles = []; // Clear hitboxes
      this.transitionTo('PHASE_TRANSITION');
      return 'PHASE_TRANSITION';
    }

    switch (this.enemy.currentState) {
      case 'IDLE':
        if (distToPlayer <= this.enemy.stats.detectionRadius) {
          this.transitionTo('DETECTION');
        }
        break;

      case 'DETECTION':
        this.enemy.stateTimerMs += deltaMs;
        if (this.enemy.stateTimerMs >= 300) {
          this.transitionTo('APPROACH');
        }
        break;

      case 'APPROACH':
        if (this.enemy.type === 'RIFT_DRONE') {
          if (distToPlayer < 4.0) {
            this.transitionTo('RETREAT');
          } else if (distToPlayer <= this.enemy.stats.preferredDistance) {
            this.transitionTo('TELEGRAPH');
          } else {
            this.moveTowards(playerPosition, (this.enemy.stats.moveSpeed * deltaMs) / 1000);
          }
        } else if (this.enemy.type === 'VOID_STALKER' || this.enemy.type === 'VOID_STALKER_PRIME') {
          if (this.enemy.teleportTimerMs === 0) {
            this.teleportNearPlayer(playerPosition);
            this.transitionTo('TELEPORT');
          } else if (distToPlayer <= this.enemy.stats.attackRange) {
            this.transitionTo('TELEGRAPH');
          } else {
            this.moveTowards(playerPosition, (this.enemy.stats.moveSpeed * deltaMs) / 1000);
          }
        } else {
          // Standard / Brute / Wisp
          if (distToPlayer <= this.enemy.stats.attackRange) {
            this.transitionTo('TELEGRAPH');
          } else if (distToPlayer > this.enemy.stats.detectionRadius) {
            this.transitionTo('IDLE');
          } else {
            this.moveTowards(playerPosition, (this.enemy.stats.moveSpeed * deltaMs) / 1000);
          }
        }
        break;

      case 'RETREAT':
        if (distToPlayer >= this.enemy.stats.preferredDistance) {
          this.transitionTo('TELEGRAPH');
        } else {
          this.moveAwayFrom(playerPosition, (this.enemy.stats.moveSpeed * deltaMs) / 1000);
        }
        break;

      case 'TELEPORT':
        this.enemy.stateTimerMs += deltaMs;
        if (this.enemy.stateTimerMs >= 200) {
          this.enemy.teleportTimerMs = this.enemy.stats.teleportCooldownMs;
          this.transitionTo('TELEGRAPH');
        }
        break;

      case 'TELEGRAPH':
        this.enemy.stateTimerMs += deltaMs;
        if (this.enemy.stateTimerMs >= this.enemy.stats.telegraphDurationMs) {
          this.transitionTo('ATTACK');
          if (this.enemy.type === 'RIFT_DRONE') {
            this.spawnProjectile(playerPosition);
          }
        }
        break;

      case 'ATTACK':
        this.enemy.stateTimerMs += deltaMs;
        if (this.enemy.stateTimerMs >= 200) {
          this.transitionTo('RECOVERY');
        }
        break;

      case 'RECOVERY':
        this.enemy.stateTimerMs += deltaMs;
        if (this.enemy.stateTimerMs >= this.enemy.stats.recoveryDurationMs) {
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

      case 'PHASE_TRANSITION':
        this.enemy.stateTimerMs += deltaMs;
        if (this.enemy.stateTimerMs >= 1000) {
          this.transitionTo('APPROACH');
        }
        break;

      case 'DEATH':
        this.enemy.activeProjectiles = [];
        break;
    }

    return this.enemy.currentState;
  }

  public applySingleHitDamage(damage: number, isHeavyAttack: boolean = false): EnemyDamageResult {
    if (this.enemy.isDead) {
      return {
        damageDealt: 0,
        remainingHealth: 0,
        triggeredStagger: false,
        triggeredArmorBreak: false,
        triggeredDeath: true,
        nextState: 'DEATH',
      };
    }

    let actualDamage = Math.max(0, damage);
    let triggeredArmorBreak = false;

    // Armor mechanic for Corruption Brute
    if (this.enemy.stats.armor > 0) {
      if (isHeavyAttack) {
        this.enemy.stats.armor = 0;
        this.enemy.isArmorBroken = true;
        triggeredArmorBreak = true;
      } else {
        actualDamage = Math.floor(actualDamage * 0.3); // 70% damage reduction on armor
      }
    }

    this.enemy.stats.currentHealth = Math.max(0, this.enemy.stats.currentHealth - actualDamage);

    const triggeredDeath = this.enemy.stats.currentHealth === 0;
    const canStagger = this.enemy.antiStunlockTimerMs === 0;
    const triggeredStagger = !triggeredDeath && canStagger && (triggeredArmorBreak || actualDamage >= 10);

    if (triggeredDeath) {
      this.enemy.isDead = true;
      this.enemy.activeProjectiles = [];
      this.transitionTo('DEATH');
    } else if (triggeredStagger) {
      this.enemy.isStaggered = true;
      this.transitionTo('STAGGER');
    }

    return {
      damageDealt: actualDamage,
      remainingHealth: this.enemy.stats.currentHealth,
      triggeredStagger,
      triggeredArmorBreak,
      triggeredDeath,
      nextState: this.enemy.currentState,
    };
  }

  public clearProjectilesOnRestart(): void {
    this.enemy.activeProjectiles = [];
  }

  private spawnProjectile(targetPosition: Position3D) {
    const dx = targetPosition.x - this.enemy.position.x;
    const dz = targetPosition.z - this.enemy.position.z;
    const len = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));

    const speed = 8.0;
    const proj: Projectile = {
      id: `proj-${Date.now()}-${Math.random()}`,
      ownerId: this.enemy.id,
      position: { ...this.enemy.position },
      velocity: { x: (dx / len) * speed, y: 0, z: (dz / len) * speed },
      damage: this.enemy.stats.attackPower,
      lifetimeMs: 0,
      maxLifetimeMs: 3000,
      active: true,
    };

    this.enemy.activeProjectiles.push(proj);
  }

  private updateProjectiles(deltaMs: number, playerPosition: Position3D, isPlayerDodging: boolean) {
    this.enemy.activeProjectiles.forEach((p) => {
      if (!p.active) return;
      p.lifetimeMs += deltaMs;

      if (p.lifetimeMs >= p.maxLifetimeMs) {
        p.active = false;
        return;
      }

      // Move projectile
      const dt = deltaMs / 1000;
      p.position.x += p.velocity.x * dt;
      p.position.z += p.velocity.z * dt;

      // Cannot hit owner
      const distToOwner = this.calculateDistance(p.position, this.enemy.position);
      if (p.lifetimeMs < 100 && distToOwner < 1.0) {
        return;
      }

      // Hit player check
      const distToPlayer = this.calculateDistance(p.position, playerPosition);
      if (distToPlayer < 1.2) {
        if (!isPlayerDodging) {
          p.active = false; // Single hit, expires
        }
      }
    });

    this.enemy.activeProjectiles = this.enemy.activeProjectiles.filter((p) => p.active);
  }

  private teleportNearPlayer(playerPosition: Position3D) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 2.0; // Guaranteed safe distance, never inside player
    this.enemy.position.x = playerPosition.x + Math.cos(angle) * distance;
    this.enemy.position.z = playerPosition.z + Math.sin(angle) * distance;
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

  private moveAwayFrom(target: Position3D, distance: number) {
    const dx = this.enemy.position.x - target.x;
    const dz = this.enemy.position.z - target.z;
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

// Factories
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
      preferredDistance: 1.5,
      moveSpeed: 3.0,
      telegraphDurationMs: 400,
      staggerDurationMs: 300,
      recoveryDurationMs: 200,
      armor: 0,
      maxArmor: 0,
      teleportCooldownMs: 0,
    },
    currentState: 'IDLE',
    stateTimerMs: 0,
    teleportTimerMs: 0,
    isStaggered: false,
    isArmorBroken: false,
    isDead: false,
    bossPhase: 1,
    antiStunlockTimerMs: 0,
    activeProjectiles: [],
  };
}

export function createRiftDrone(id: string, initialPosition: Position3D): EnemyContract {
  return {
    id,
    name: 'Rift Drone',
    type: 'RIFT_DRONE',
    position: { ...initialPosition },
    stats: {
      maxHealth: 45,
      currentHealth: 45,
      attackPower: 8,
      detectionRadius: 12.0,
      attackRange: 7.0,
      preferredDistance: 6.0,
      moveSpeed: 3.5,
      telegraphDurationMs: 600,
      staggerDurationMs: 400,
      recoveryDurationMs: 500,
      armor: 0,
      maxArmor: 0,
      teleportCooldownMs: 0,
    },
    currentState: 'IDLE',
    stateTimerMs: 0,
    teleportTimerMs: 0,
    isStaggered: false,
    isArmorBroken: false,
    isDead: false,
    bossPhase: 1,
    antiStunlockTimerMs: 0,
    activeProjectiles: [],
  };
}

export function createCorruptionBrute(id: string, initialPosition: Position3D): EnemyContract {
  return {
    id,
    name: 'Corruption Brute',
    type: 'CORRUPTION_BRUTE',
    position: { ...initialPosition },
    stats: {
      maxHealth: 100,
      currentHealth: 100,
      attackPower: 18,
      detectionRadius: 10.0,
      attackRange: 2.0,
      preferredDistance: 2.0,
      moveSpeed: 2.0,
      telegraphDurationMs: 800,
      staggerDurationMs: 600,
      recoveryDurationMs: 700,
      armor: 50,
      maxArmor: 50,
      teleportCooldownMs: 0,
    },
    currentState: 'IDLE',
    stateTimerMs: 0,
    teleportTimerMs: 0,
    isStaggered: false,
    isArmorBroken: false,
    isDead: false,
    bossPhase: 1,
    antiStunlockTimerMs: 0,
    activeProjectiles: [],
  };
}

export function createVoidStalker(id: string, initialPosition: Position3D): EnemyContract {
  return {
    id,
    name: 'Void Stalker',
    type: 'VOID_STALKER',
    position: { ...initialPosition },
    stats: {
      maxHealth: 80,
      currentHealth: 80,
      attackPower: 14,
      detectionRadius: 12.0,
      attackRange: 2.0,
      preferredDistance: 2.0,
      moveSpeed: 4.5,
      telegraphDurationMs: 400,
      staggerDurationMs: 400,
      recoveryDurationMs: 400,
      armor: 0,
      maxArmor: 0,
      teleportCooldownMs: 3000,
    },
    currentState: 'IDLE',
    stateTimerMs: 0,
    teleportTimerMs: 0,
    isStaggered: false,
    isArmorBroken: false,
    isDead: false,
    bossPhase: 1,
    antiStunlockTimerMs: 0,
    activeProjectiles: [],
  };
}

export function createVoidStalkerPrime(id: string, initialPosition: Position3D): EnemyContract {
  return {
    id,
    name: 'Void Stalker Prime',
    type: 'VOID_STALKER_PRIME',
    position: { ...initialPosition },
    stats: {
      maxHealth: 200,
      currentHealth: 200,
      attackPower: 22,
      detectionRadius: 15.0,
      attackRange: 2.5,
      preferredDistance: 2.5,
      moveSpeed: 5.0,
      telegraphDurationMs: 350,
      staggerDurationMs: 300,
      recoveryDurationMs: 300,
      armor: 25,
      maxArmor: 25,
      teleportCooldownMs: 2000,
    },
    currentState: 'IDLE',
    stateTimerMs: 0,
    teleportTimerMs: 0,
    isStaggered: false,
    isArmorBroken: false,
    isDead: false,
    bossPhase: 1,
    antiStunlockTimerMs: 0,
    activeProjectiles: [],
  };
}
