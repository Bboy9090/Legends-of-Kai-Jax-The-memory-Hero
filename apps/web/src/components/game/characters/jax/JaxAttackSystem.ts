/**
 * JAX ATTACK SYSTEM
 * Hitbox lifecycle and damage mechanics
 *
 * Attack events:
 * - jax_light_combo: fast electrical hitbox, combo damage
 * - jax_pressure_heavy: physical hitbox with pressure knockback
 * - jax_lightning_special: targeted storm hit
 * - jax_storm_ultimate: placeholder storm event
 */

import * as THREE from 'three';

export interface AttackEvent {
  type: 'jax_light_combo' | 'jax_pressure_heavy' | 'jax_lightning_special' | 'jax_storm_ultimate';
  startTime: number;
  duration: number;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  damage: number;
  radius: number;
  knockback: number;
  activeStart: number;
  activeEnd: number;
}

export interface HitRecord {
  targetId: string;
  timestamp: number;
  damage: number;
}

const ATTACK_CONFIG = {
  jax_light_combo: {
    duration: 0.35,
    activeStart: 0.05,
    activeEnd: 0.25,
    damage: 8,
    radius: 1.5,
    knockback: 3.0,
  },
  jax_pressure_heavy: {
    duration: 0.5,
    activeStart: 0.1,
    activeEnd: 0.35,
    damage: 15,
    radius: 2.0,
    knockback: 8.0,
  },
  jax_lightning_special: {
    duration: 0.7,
    activeStart: 0.15,
    activeEnd: 0.5,
    damage: 25,
    radius: 3.5,
    knockback: 5.0,
  },
  jax_storm_ultimate: {
    duration: 1.0,
    activeStart: 0.2,
    activeEnd: 0.7,
    damage: 40,
    radius: 5.0,
    knockback: 10.0,
  },
};

export class JaxAttackSystem {
  private currentAttack: AttackEvent | null = null;
  private hitRecords: Map<string, HitRecord> = new Map();
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  startAttack(
    type: keyof typeof ATTACK_CONFIG,
    position: THREE.Vector3,
    direction: THREE.Vector3,
    currentTime: number
  ): AttackEvent {
    const config = ATTACK_CONFIG[type];

    const attack: AttackEvent = {
      type,
      startTime: currentTime,
      duration: config.duration,
      position: position.clone(),
      direction: direction.normalize(),
      damage: config.damage,
      radius: config.radius,
      knockback: config.knockback,
      activeStart: config.activeStart,
      activeEnd: config.activeEnd,
    };

    this.currentAttack = attack;
    return attack;
  }

  update(
    currentTime: number,
    position: THREE.Vector3
  ): AttackEvent | null {
    if (!this.currentAttack) return null;

    // Update attack position to follow Jax
    this.currentAttack.position.copy(position);

    const elapsed = currentTime - this.currentAttack.startTime;

    // Attack expired
    if (elapsed > this.currentAttack.duration) {
      this.currentAttack = null;
      return null;
    }

    return this.currentAttack;
  }

  isHitboxActive(currentTime: number): boolean {
    if (!this.currentAttack) return false;

    const elapsed = currentTime - this.currentAttack.startTime;
    return elapsed >= this.currentAttack.activeStart && elapsed <= this.currentAttack.activeEnd;
  }

  tryHit(
    targetId: string,
    targetPos: THREE.Vector3,
    currentTime: number
  ): { hit: boolean; damage: number } {
    if (!this.currentAttack || !this.isHitboxActive(currentTime)) {
      return { hit: false, damage: 0 };
    }

    // Check distance
    const distance = targetPos.distanceTo(this.currentAttack.position);
    if (distance > this.currentAttack.radius) {
      return { hit: false, damage: 0 };
    }

    // Prevent double-hitting same target in same attack
    const lastHit = this.hitRecords.get(targetId);
    if (lastHit && (currentTime - lastHit.timestamp) < 0.05) {
      return { hit: false, damage: 0 };
    }

    // Record hit
    this.hitRecords.set(targetId, {
      targetId,
      timestamp: currentTime,
      damage: this.currentAttack.damage,
    });

    return {
      hit: true,
      damage: this.currentAttack.damage,
    };
  }

  getKnockbackForce(): THREE.Vector3 | null {
    if (!this.currentAttack) return null;

    return this.currentAttack.direction.clone()
      .multiplyScalar(this.currentAttack.knockback);
  }

  getCurrentAttack(): AttackEvent | null {
    return this.currentAttack;
  }

  reset() {
    this.currentAttack = null;
    this.hitRecords.clear();
  }
}
