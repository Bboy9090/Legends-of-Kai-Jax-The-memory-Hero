/**
 * Simple AI Brain
 * Basic approach/attack behavior for enemy entities
 * Supports behavior flavors: 'grunt' | 'rusher' | 'defender' | 'sniper'
 */

import * as THREE from 'three';
import { MovePlayer } from '../combat/MovePlayer';
import type { MoveSpec } from '../types/MoveSpec';

export type AIState = 'idle' | 'approach' | 'attack' | 'retreat' | 'block' | 'hitstun' | 'dead';
export type AIBehavior = 'grunt' | 'rusher' | 'defender' | 'sniper';

export interface AITarget {
  position: THREE.Vector3;
  isAlive: () => boolean;
}

interface BehaviorTuning {
  attackRange: number;
  moveSpeed: number;
  cooldownSeconds: number;
  hitstunFrames: number;
  retreatChance: number;   // after taking damage
  blockChance: number;     // before approaching
  preferredDistance: number; // sniper keeps this distance
}

const BEHAVIOR_TABLE: Record<AIBehavior, BehaviorTuning> = {
  grunt:    { attackRange: 1.5, moveSpeed: 2.0, cooldownSeconds: 1.0, hitstunFrames: 20, retreatChance: 0.0, blockChance: 0.0, preferredDistance: 1.5 },
  rusher:   { attackRange: 1.6, moveSpeed: 3.6, cooldownSeconds: 0.4, hitstunFrames: 12, retreatChance: 0.0, blockChance: 0.0, preferredDistance: 1.5 },
  defender: { attackRange: 1.8, moveSpeed: 1.4, cooldownSeconds: 1.4, hitstunFrames: 14, retreatChance: 0.35, blockChance: 0.45, preferredDistance: 1.8 },
  sniper:   { attackRange: 4.5, moveSpeed: 1.8, cooldownSeconds: 1.6, hitstunFrames: 22, retreatChance: 0.55, blockChance: 0.0, preferredDistance: 4.5 },
};

export class SimpleAI {
  private movePlayer: MovePlayer;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private state: AIState = 'idle';
  private target: AITarget | null = null;
  private behavior: AIBehavior;
  private tuning: BehaviorTuning;
  private attackCooldown: number = 0;
  private hitstunFrames: number = 0;
  private retreatTimer: number = 0;
  private blockTimer: number = 0;
  private moveLibrary: MoveSpec[] = [];

  constructor(movePlayer: MovePlayer, position: THREE.Vector3, behavior: AIBehavior = 'grunt') {
    this.movePlayer = movePlayer;
    this.position = position;
    this.velocity = new THREE.Vector3();
    this.behavior = behavior;
    this.tuning = BEHAVIOR_TABLE[behavior];
  }

  setTarget(target: AITarget): void {
    this.target = target;
  }

  loadMove(move: MoveSpec): void {
    this.moveLibrary.push(move);
  }

  getBehavior(): AIBehavior {
    return this.behavior;
  }

  update(deltaTime: number): void {
    if (!this.target || !this.target.isAlive()) {
      this.state = 'idle';
      return;
    }

    if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
    if (this.retreatTimer > 0) this.retreatTimer -= deltaTime;
    if (this.blockTimer > 0) this.blockTimer -= deltaTime;

    if (this.hitstunFrames > 0) {
      this.hitstunFrames--;
      this.state = 'hitstun';
      return;
    }

    // Defender: while block timer is active, guard
    if (this.blockTimer > 0) {
      this.movePlayer.setShield(true);
      this.state = 'block';
      return;
    } else {
      this.movePlayer.setShield(false);
    }

    // Retreat state: sniper/defender back-pedal briefly
    if (this.retreatTimer > 0) {
      this.updateRetreat(deltaTime);
      return;
    }

    switch (this.state) {
      case 'idle':
        this.state = 'approach';
        break;
      case 'approach':
        this.updateApproach(deltaTime);
        break;
      case 'attack':
        if (!this.movePlayer.isBusy()) {
          this.state = 'approach';
          this.attackCooldown = this.tuning.cooldownSeconds;
        }
        break;
      case 'retreat':
      case 'block':
        this.state = 'approach';
        break;
    }
  }

  private updateApproach(deltaTime: number): void {
    if (!this.target) return;

    const toTarget = new THREE.Vector3()
      .subVectors(this.target.position, this.position)
      .setZ(0);
    const distance = toTarget.length();

    // Defender: random block before committing to approach
    if (this.behavior === 'defender' && distance < this.tuning.attackRange + 1.0 && Math.random() < 0.02) {
      this.blockTimer = 0.5;
      return;
    }

    // Sniper: keep preferred distance
    if (this.behavior === 'sniper') {
      const desired = this.tuning.preferredDistance;
      if (distance < desired - 0.5) {
        // back away
        toTarget.normalize().negate();
        this.position.add(new THREE.Vector3().copy(toTarget).multiplyScalar(this.tuning.moveSpeed * deltaTime));
        this.movePlayer.setFacing(-toTarget.x > 0);
        return;
      }
    }

    if (distance <= this.tuning.attackRange && this.attackCooldown <= 0) {
      this.tryAttack();
      return;
    }

    if (distance > this.tuning.attackRange) {
      toTarget.normalize();
      this.velocity.copy(toTarget).multiplyScalar(this.tuning.moveSpeed);
      this.position.add(
        new THREE.Vector3().copy(this.velocity).multiplyScalar(deltaTime)
      );
      this.movePlayer.setFacing(toTarget.x > 0);
    } else {
      this.velocity.set(0, 0, 0);
    }
  }

  private updateRetreat(deltaTime: number): void {
    if (!this.target) return;
    const toTarget = new THREE.Vector3().subVectors(this.target.position, this.position).setZ(0).normalize().negate();
    this.position.add(new THREE.Vector3().copy(toTarget).multiplyScalar(this.tuning.moveSpeed * deltaTime));
    this.state = 'retreat';
  }

  private tryAttack(): void {
    if (this.moveLibrary.length === 0 || this.movePlayer.isBusy()) return;
    const move = this.moveLibrary[Math.floor(Math.random() * this.moveLibrary.length)];
    this.movePlayer.startMove(move);
    this.state = 'attack';
    console.log(`[SimpleAI:${this.behavior}] Attacking with ${move.id}`);
  }

  takeDamage(damage: number, knockback: THREE.Vector2): void {
    console.log(`[SimpleAI:${this.behavior}] Took ${damage} damage`);
    this.hitstunFrames = this.tuning.hitstunFrames;
    this.state = 'hitstun';

    this.velocity.set(knockback.x, knockback.y, 0);
    this.position.add(new THREE.Vector3(knockback.x * 0.1, knockback.y * 0.1, 0));

    // Behavior-driven reaction
    if (Math.random() < this.tuning.retreatChance) {
      this.retreatTimer = 0.6;
    }
    if (Math.random() < this.tuning.blockChance) {
      this.blockTimer = 0.8;
    }
  }

  getPosition(): THREE.Vector3 { return this.position; }
  getState(): AIState { return this.state; }
  getVelocity(): THREE.Vector3 { return this.velocity; }
  setPosition(x: number, y: number, z: number = 0): void { this.position.set(x, y, z); }
  isAttacking(): boolean { return this.state === 'attack' && this.movePlayer.isBusy(); }
  isInHitstun(): boolean { return this.hitstunFrames > 0; }
}
