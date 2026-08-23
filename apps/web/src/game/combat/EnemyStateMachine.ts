/**
 * Mission 1 enemy runtime state machine.
 *
 * Deterministic, side-effect-contained enemy simulation for Memory Wisp, Rift Drone,
 * Corruption Brute, Void Stalker, and Void Stalker Prime. Runtime snapshots are deep
 * copies so rendering/debug tooling cannot accidentally mutate simulation state.
 */

import { createAIRng, type AIRandom } from './aiIdentity';

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

const DETECTION_CONFIRM_MS = 300;
const TELEPORT_RECOVERY_MS = 200;
const ATTACK_ACTIVE_MS = 200;
const BOSS_PHASE_TRANSITION_MS = 1000;
const BOSS_PHASE_TWO_HEALTH_RATIO = 0.6;
const BOSS_ANTI_STUN_MS = 2000;
const RIFT_DRONE_RETREAT_DISTANCE = 4;
const ARMOR_DAMAGE_MULTIPLIER = 0.3;
const STAGGER_DAMAGE_THRESHOLD = 10;
const PROJECTILE_SPEED = 8;
const PROJECTILE_LIFETIME_MS = 3000;
const PROJECTILE_OWNER_GRACE_MS = 100;
const PROJECTILE_OWNER_RADIUS = 1;
const PROJECTILE_PLAYER_RADIUS = 1.2;
const TELEPORT_DISTANCE = 2;
const EPSILON = 0.001;

function clonePosition(position: Position3D): Position3D {
  return { x: position.x, y: position.y, z: position.z };
}

function cloneProjectile(projectile: Projectile): Projectile {
  return {
    ...projectile,
    position: clonePosition(projectile.position),
    velocity: clonePosition(projectile.velocity),
  };
}

function safeDeltaMs(deltaMs: number): number {
  return Number.isFinite(deltaMs) ? Math.max(0, deltaMs) : 0;
}

function safeDamage(damage: number): number {
  return Number.isFinite(damage) ? Math.max(0, damage) : 0;
}

function isFinitePosition(position: Position3D): boolean {
  return Number.isFinite(position.x) && Number.isFinite(position.y) && Number.isFinite(position.z);
}

/** Deterministic AI state machine supporting all Mission 1 enemy archetypes. */
export class EnemyStateMachine {
  private enemy: EnemyContract;
  private readonly random: AIRandom;
  private projectileSerial = 0;

  constructor(enemy: EnemyContract) {
    this.enemy = {
      ...enemy,
      position: clonePosition(enemy.position),
      stats: { ...enemy.stats },
      activeProjectiles: (enemy.activeProjectiles ?? []).map(cloneProjectile),
    };
    this.random = createAIRng(`mission1:${enemy.id}:${enemy.type}`);
  }

  /** Deep snapshot: consumers cannot mutate authoritative runtime state. */
  public getEntity(): EnemyContract {
    return {
      ...this.enemy,
      position: clonePosition(this.enemy.position),
      stats: { ...this.enemy.stats },
      activeProjectiles: this.enemy.activeProjectiles
        .filter((projectile) => projectile.active)
        .map(cloneProjectile),
    };
  }

  public update(deltaMs: number, playerPosition: Position3D, isPlayerDodging = false): EnemyAIState {
    if (this.enemy.isDead) {
      this.enemy.currentState = 'DEATH';
      return 'DEATH';
    }
    if (!isFinitePosition(playerPosition)) return this.enemy.currentState;

    const dt = safeDeltaMs(deltaMs);

    this.enemy.teleportTimerMs = Math.max(0, this.enemy.teleportTimerMs - dt);
    this.enemy.antiStunlockTimerMs = Math.max(0, this.enemy.antiStunlockTimerMs - dt);

    this.updateProjectiles(dt, playerPosition, isPlayerDodging);

    const distToPlayer = this.calculateDistance(this.enemy.position, playerPosition);

    if (
      this.enemy.type === 'VOID_STALKER_PRIME' &&
      this.enemy.bossPhase === 1 &&
      this.enemy.stats.currentHealth <= this.enemy.stats.maxHealth * BOSS_PHASE_TWO_HEALTH_RATIO
    ) {
      this.enemy.bossPhase = 2;
      this.enemy.antiStunlockTimerMs = BOSS_ANTI_STUN_MS;
      this.enemy.activeProjectiles = [];
      this.transitionTo('PHASE_TRANSITION');
      return 'PHASE_TRANSITION';
    }

    switch (this.enemy.currentState) {
      case 'IDLE':
        if (distToPlayer <= this.enemy.stats.detectionRadius) this.transitionTo('DETECTION');
        break;

      case 'DETECTION':
        this.enemy.stateTimerMs += dt;
        if (this.enemy.stateTimerMs >= DETECTION_CONFIRM_MS) this.transitionTo('APPROACH');
        break;

      case 'APPROACH':
        this.updateApproach(dt, playerPosition, distToPlayer);
        break;

      case 'RETREAT':
        if (distToPlayer >= this.enemy.stats.preferredDistance) {
          this.transitionTo('TELEGRAPH');
        } else {
          this.moveAwayFrom(playerPosition, (this.enemy.stats.moveSpeed * dt) / 1000);
        }
        break;

      case 'TELEPORT':
        this.enemy.stateTimerMs += dt;
        if (this.enemy.stateTimerMs >= TELEPORT_RECOVERY_MS) {
          this.enemy.teleportTimerMs = this.enemy.stats.teleportCooldownMs;
          this.transitionTo('TELEGRAPH');
        }
        break;

      case 'TELEGRAPH':
        this.enemy.stateTimerMs += dt;
        if (this.enemy.stateTimerMs >= this.enemy.stats.telegraphDurationMs) {
          this.transitionTo('ATTACK');
          if (this.enemy.type === 'RIFT_DRONE') this.spawnProjectile(playerPosition);
        }
        break;

      case 'ATTACK':
        this.enemy.stateTimerMs += dt;
        if (this.enemy.stateTimerMs >= ATTACK_ACTIVE_MS) this.transitionTo('RECOVERY');
        break;

      case 'RECOVERY':
        this.enemy.stateTimerMs += dt;
        if (this.enemy.stateTimerMs >= this.enemy.stats.recoveryDurationMs) {
          this.transitionTo(distToPlayer <= this.enemy.stats.attackRange ? 'TELEGRAPH' : 'APPROACH');
        }
        break;

      case 'STAGGER':
        this.enemy.stateTimerMs += dt;
        if (this.enemy.stateTimerMs >= this.enemy.stats.staggerDurationMs) {
          this.enemy.isStaggered = false;
          this.transitionTo('APPROACH');
        }
        break;

      case 'PHASE_TRANSITION':
        this.enemy.stateTimerMs += dt;
        if (this.enemy.stateTimerMs >= BOSS_PHASE_TRANSITION_MS) this.transitionTo('APPROACH');
        break;

      case 'DEATH':
        this.enemy.activeProjectiles = [];
        break;
    }

    return this.enemy.currentState;
  }

  public applySingleHitDamage(damage: number, isHeavyAttack = false): EnemyDamageResult {
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

    let actualDamage = safeDamage(damage);
    let triggeredArmorBreak = false;

    if (this.enemy.stats.armor > 0) {
      if (isHeavyAttack) {
        this.enemy.stats.armor = 0;
        this.enemy.isArmorBroken = true;
        triggeredArmorBreak = true;
      } else {
        actualDamage = Math.floor(actualDamage * ARMOR_DAMAGE_MULTIPLIER);
      }
    }

    this.enemy.stats.currentHealth = Math.max(0, this.enemy.stats.currentHealth - actualDamage);

    const triggeredDeath = this.enemy.stats.currentHealth === 0;
    const canStagger = this.enemy.antiStunlockTimerMs === 0;
    const triggeredStagger =
      !triggeredDeath &&
      canStagger &&
      (triggeredArmorBreak || actualDamage >= STAGGER_DAMAGE_THRESHOLD);

    if (triggeredDeath) {
      this.enemy.isDead = true;
      this.enemy.isStaggered = false;
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

  private updateApproach(deltaMs: number, playerPosition: Position3D, distToPlayer: number): void {
    if (this.enemy.type === 'RIFT_DRONE') {
      if (distToPlayer < RIFT_DRONE_RETREAT_DISTANCE) {
        this.transitionTo('RETREAT');
      } else if (distToPlayer <= this.enemy.stats.preferredDistance) {
        this.transitionTo('TELEGRAPH');
      } else {
        this.moveTowards(playerPosition, (this.enemy.stats.moveSpeed * deltaMs) / 1000);
      }
      return;
    }

    if (this.enemy.type === 'VOID_STALKER' || this.enemy.type === 'VOID_STALKER_PRIME') {
      if (this.enemy.teleportTimerMs === 0) {
        this.teleportNearPlayer(playerPosition);
        this.transitionTo('TELEPORT');
      } else if (distToPlayer <= this.enemy.stats.attackRange) {
        this.transitionTo('TELEGRAPH');
      } else {
        this.moveTowards(playerPosition, (this.enemy.stats.moveSpeed * deltaMs) / 1000);
      }
      return;
    }

    if (distToPlayer <= this.enemy.stats.attackRange) {
      this.transitionTo('TELEGRAPH');
    } else if (distToPlayer > this.enemy.stats.detectionRadius) {
      this.transitionTo('IDLE');
    } else {
      this.moveTowards(playerPosition, (this.enemy.stats.moveSpeed * deltaMs) / 1000);
    }
  }

  private spawnProjectile(targetPosition: Position3D): void {
    const dx = targetPosition.x - this.enemy.position.x;
    const dz = targetPosition.z - this.enemy.position.z;
    const len = Math.max(EPSILON, Math.hypot(dx, dz));

    this.projectileSerial += 1;
    const projectile: Projectile = {
      id: `${this.enemy.id}-projectile-${this.projectileSerial}`,
      ownerId: this.enemy.id,
      position: clonePosition(this.enemy.position),
      velocity: { x: (dx / len) * PROJECTILE_SPEED, y: 0, z: (dz / len) * PROJECTILE_SPEED },
      damage: this.enemy.stats.attackPower,
      lifetimeMs: 0,
      maxLifetimeMs: PROJECTILE_LIFETIME_MS,
      active: true,
    };

    this.enemy.activeProjectiles.push(projectile);
  }

  private updateProjectiles(deltaMs: number, playerPosition: Position3D, isPlayerDodging: boolean): void {
    for (const projectile of this.enemy.activeProjectiles) {
      if (!projectile.active) continue;
      projectile.lifetimeMs += deltaMs;

      if (projectile.lifetimeMs >= projectile.maxLifetimeMs) {
        projectile.active = false;
        continue;
      }

      const dt = deltaMs / 1000;
      projectile.position.x += projectile.velocity.x * dt;
      projectile.position.z += projectile.velocity.z * dt;

      const distToOwner = this.calculateDistance(projectile.position, this.enemy.position);
      if (
        projectile.lifetimeMs < PROJECTILE_OWNER_GRACE_MS &&
        distToOwner < PROJECTILE_OWNER_RADIUS
      ) continue;

      const distToPlayer = this.calculateDistance(projectile.position, playerPosition);
      if (distToPlayer < PROJECTILE_PLAYER_RADIUS && !isPlayerDodging) {
        projectile.active = false;
      }
    }

    this.enemy.activeProjectiles = this.enemy.activeProjectiles.filter((projectile) => projectile.active);
  }

  private teleportNearPlayer(playerPosition: Position3D): void {
    const angle = this.random() * Math.PI * 2;
    this.enemy.position.x = playerPosition.x + Math.cos(angle) * TELEPORT_DISTANCE;
    this.enemy.position.z = playerPosition.z + Math.sin(angle) * TELEPORT_DISTANCE;
  }

  private transitionTo(newState: EnemyAIState): void {
    this.enemy.currentState = newState;
    this.enemy.stateTimerMs = 0;
  }

  private moveTowards(target: Position3D, distance: number): void {
    this.moveAlongVector(target.x - this.enemy.position.x, target.z - this.enemy.position.z, distance);
  }

  private moveAwayFrom(target: Position3D, distance: number): void {
    this.moveAlongVector(this.enemy.position.x - target.x, this.enemy.position.z - target.z, distance);
  }

  private moveAlongVector(dx: number, dz: number, distance: number): void {
    const len = Math.hypot(dx, dz);
    const travel = Number.isFinite(distance) ? Math.max(0, distance) : 0;
    if (len <= EPSILON || travel <= 0) return;
    this.enemy.position.x += (dx / len) * travel;
    this.enemy.position.z += (dz / len) * travel;
  }

  private calculateDistance(a: Position3D, b: Position3D): number {
    return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  }
}

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
