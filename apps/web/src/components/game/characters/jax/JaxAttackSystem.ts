/**
 * JAX ATTACK SYSTEM
 * Deterministic hitbox lifecycle and target filtering for Jax.
 */

import * as THREE from 'three';

export type JaxAttackType =
  | 'jax_light_combo'
  | 'jax_pressure_heavy'
  | 'jax_lightning_special'
  | 'jax_storm_ultimate';

export type AttackPhase = 'IDLE' | 'STARTUP' | 'ACTIVE' | 'RECOVERY';

export interface AttackEvent {
  type: JaxAttackType;
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

const ATTACK_CONFIG: Record<JaxAttackType, {
  duration: number;
  activeStart: number;
  activeEnd: number;
  damage: number;
  radius: number;
  knockback: number;
}> = {
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
  private hitTargets = new Set<string>();

  constructor(private scene: THREE.Scene) {}

  startAttack(
    type: JaxAttackType,
    position: THREE.Vector3,
    direction: THREE.Vector3,
    currentTime: number
  ): AttackEvent {
    const config = ATTACK_CONFIG[type];
    const safeDirection = direction.lengthSq() > 0.0001
      ? direction.clone().normalize()
      : new THREE.Vector3(0, 0, 1);

    this.currentAttack = {
      type,
      startTime: currentTime,
      duration: config.duration,
      position: position.clone(),
      direction: safeDirection,
      damage: config.damage,
      radius: config.radius,
      knockback: config.knockback,
      activeStart: config.activeStart,
      activeEnd: config.activeEnd,
    };

    this.hitTargets.clear();
    return this.currentAttack;
  }

  update(currentTime: number, position: THREE.Vector3): AttackEvent | null {
    if (!this.currentAttack) return null;

    this.currentAttack.position.copy(position);
    const elapsed = currentTime - this.currentAttack.startTime;

    if (elapsed > this.currentAttack.duration) {
      this.currentAttack = null;
      this.hitTargets.clear();
      return null;
    }

    return this.currentAttack;
  }

  getPhase(currentTime: number): AttackPhase {
    if (!this.currentAttack) return 'IDLE';

    const elapsed = currentTime - this.currentAttack.startTime;
    if (elapsed < 0 || elapsed > this.currentAttack.duration) return 'IDLE';
    if (elapsed < this.currentAttack.activeStart) return 'STARTUP';
    if (elapsed <= this.currentAttack.activeEnd) return 'ACTIVE';
    return 'RECOVERY';
  }

  isHitboxActive(currentTime: number): boolean {
    return this.getPhase(currentTime) === 'ACTIVE';
  }

  tryHit(
    targetId: string,
    targetPos: THREE.Vector3,
    currentTime: number
  ): { hit: boolean; damage: number } {
    if (!this.currentAttack || !this.isHitboxActive(currentTime)) {
      return { hit: false, damage: 0 };
    }

    if (this.hitTargets.has(targetId)) {
      return { hit: false, damage: 0 };
    }

    if (this.getPlanarDistance(targetPos) > this.currentAttack.radius) {
      return { hit: false, damage: 0 };
    }

    this.hitTargets.add(targetId);
    return { hit: true, damage: this.currentAttack.damage };
  }

  processActiveHitboxes(
    currentTime: number,
    onHit: (target: THREE.Object3D, damage: number, attack: AttackEvent) => void
  ): void {
    if (!this.currentAttack || !this.isHitboxActive(currentTime)) return;

    for (const target of this.findCombatTargets()) {
      const targetId = String(target.userData.targetId ?? target.uuid);
      const targetPos = new THREE.Vector3();
      target.getWorldPosition(targetPos);

      const result = this.tryHit(targetId, targetPos, currentTime);
      if (result.hit) {
        onHit(target, result.damage, this.currentAttack);
      }
    }
  }

  private findCombatTargets(): THREE.Object3D[] {
    if (!this.currentAttack) return [];

    const targets: THREE.Object3D[] = [];
    const attack = this.currentAttack;

    this.scene.traverse((obj) => {
      if (!obj.userData.combatTarget) return;

      // The special is deliberately targetable/telegraphed in the MVP so the
      // eventual enemy registry can mark lightning-valid targets explicitly.
      if (attack.type === 'jax_lightning_special' && !obj.userData.isLightningTarget) {
        return;
      }

      const objPos = new THREE.Vector3();
      obj.getWorldPosition(objPos);
      if (this.getPlanarDistance(objPos) > attack.radius) return;

      if (attack.type === 'jax_light_combo' && !this.isInForwardCone(objPos, 0.0)) {
        return;
      }

      if (attack.type === 'jax_lightning_special' && !this.isInForwardCone(objPos, 0.5)) {
        return;
      }

      targets.push(obj);
    });

    return targets;
  }

  private isInForwardCone(targetPos: THREE.Vector3, minimumDot: number): boolean {
    if (!this.currentAttack) return false;

    const toTarget = targetPos.clone().sub(this.currentAttack.position);
    toTarget.y = 0;
    if (toTarget.lengthSq() < 0.0001) return true;

    return toTarget.normalize().dot(this.currentAttack.direction) >= minimumDot;
  }

  private getPlanarDistance(targetPos: THREE.Vector3): number {
    if (!this.currentAttack) return Number.POSITIVE_INFINITY;

    const offset = targetPos.clone().sub(this.currentAttack.position);
    offset.y = 0;
    return offset.length();
  }

  getKnockbackForce(): THREE.Vector3 | null {
    if (!this.currentAttack) return null;
    return this.currentAttack.direction.clone().multiplyScalar(this.currentAttack.knockback);
  }

  getCurrentAttack(): AttackEvent | null {
    return this.currentAttack;
  }

  getConfig(type: JaxAttackType) {
    return { ...ATTACK_CONFIG[type] };
  }

  reset() {
    this.currentAttack = null;
    this.hitTargets.clear();
  }
}
