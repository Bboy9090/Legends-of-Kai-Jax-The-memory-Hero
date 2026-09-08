/**
 * FANG SYNDICATE COMBATANT ATTACKS
 * Day 5.2 - Attack hitbox lifecycle and damage application
 *
 * Fang has basic attacks with deterministic damage + knockback.
 * No rank/weapon/biography.
 */

import * as THREE from 'three';

export type FangAttackType = 'fang_strike' | 'fang_grab';

export interface FangAttack {
  type: FangAttackType;
  startTime: number;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  damage: number;
  radius: number;
  knockback: number;
  activeStart: number;
  activeEnd: number;
}

const ATTACK_CONFIG: Record<FangAttackType, {
  duration: number;
  activeStart: number;
  activeEnd: number;
  damage: number;
  radius: number;
  knockback: number;
}> = {
  fang_strike: {
    duration: 0.4,
    activeStart: 0.08,
    activeEnd: 0.28,
    damage: 10,
    radius: 1.8,
    knockback: 4.0,
  },
  fang_grab: {
    duration: 0.6,
    activeStart: 0.12,
    activeEnd: 0.4,
    damage: 15,
    radius: 2.2,
    knockback: 6.0,
  },
};

export class FangAttackSystem {
  private currentAttack: FangAttack | null = null;
  private hitTargets = new Set<string>();

  startAttack(
    type: FangAttackType,
    position: THREE.Vector3,
    direction: THREE.Vector3,
    currentTime: number
  ): void {
    const config = ATTACK_CONFIG[type];
    this.currentAttack = {
      type,
      startTime: currentTime,
      position: position.clone(),
      direction: direction.normalize(),
      damage: config.damage,
      radius: config.radius,
      knockback: config.knockback,
      activeStart: config.activeStart,
      activeEnd: config.activeEnd,
    };
    this.hitTargets.clear();
  }

  getCurrentAttack(currentTime: number): FangAttack | null {
    if (!this.currentAttack) return null;

    const elapsed = currentTime - this.currentAttack.startTime;
    const config = ATTACK_CONFIG[this.currentAttack.type];

    if (elapsed > config.duration) {
      this.currentAttack = null;
      return null;
    }

    return this.currentAttack;
  }

  isAttackActive(currentTime: number): boolean {
    const attack = this.getCurrentAttack(currentTime);
    if (!attack) return false;

    const elapsed = currentTime - attack.startTime;
    return elapsed >= attack.activeStart && elapsed <= attack.activeEnd;
  }

  canHitTarget(targetId: string): boolean {
    return !this.hitTargets.has(targetId);
  }

  registerHit(targetId: string): void {
    this.hitTargets.add(targetId);
  }

  reset(): void {
    this.currentAttack = null;
    this.hitTargets.clear();
  }
}

export function chooseRandomFangAttack(): FangAttackType {
  const types: FangAttackType[] = ['fang_strike', 'fang_grab'];
  return types[Math.floor(Math.random() * types.length)];
}

export const FANG_ATTACK_CONFIG = ATTACK_CONFIG;
