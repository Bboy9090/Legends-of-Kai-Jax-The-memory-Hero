/**
 * Simple AI Brain
 * Basic approach/attack behavior for enemy entities
 */

import * as THREE from 'three';
import { MovePlayer } from '../combat/MovePlayer';
import type { MoveSpec } from '../types/MoveSpec';

export type AIState = 'idle' | 'approach' | 'attack' | 'hitstun' | 'dead';

export interface AITarget {
  position: THREE.Vector3;
  isAlive: () => boolean;
}

export class SimpleAI {
  private movePlayer: MovePlayer;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private state: AIState = 'idle';
  private target: AITarget | null = null;
  private attackRange: number = 1.5;
  private moveSpeed: number = 2.0;
  private attackCooldown: number = 0;
  private hitstunFrames: number = 0;
  private moveLibrary: MoveSpec[] = [];

  constructor(movePlayer: MovePlayer, position: THREE.Vector3) {
    this.movePlayer = movePlayer;
    this.position = position;
    this.velocity = new THREE.Vector3();
  }

  /**
   * Set AI target (player)
   */
  setTarget(target: AITarget): void {
    this.target = target;
  }

  /**
   * Load move into AI's repertoire
   */
  loadMove(move: MoveSpec): void {
    this.moveLibrary.push(move);
  }

  /**
   * Update AI behavior each frame
   */
  update(deltaTime: number): void {
    if (!this.target || !this.target.isAlive()) {
      this.state = 'idle';
      return;
    }

    // Update cooldowns
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    if (this.hitstunFrames > 0) {
      this.hitstunFrames--;
      this.state = 'hitstun';
      return;
    }

    // State machine
    switch (this.state) {
      case 'idle':
        this.state = 'approach';
        break;

      case 'approach':
        this.updateApproach(deltaTime);
        break;

      case 'attack':
        // Wait for attack to complete
        if (!this.movePlayer.isBusy()) {
          this.state = 'approach';
          this.attackCooldown = 1.0; // 1 second cooldown
        }
        break;
    }
  }

  /**
   * Approach behavior: move toward target
   */
  private updateApproach(deltaTime: number): void {
    if (!this.target) return;

    const toTarget = new THREE.Vector3()
      .subVectors(this.target.position, this.position)
      .setZ(0);
    
    const distance = toTarget.length();

    // Check if in attack range
    if (distance <= this.attackRange && this.attackCooldown <= 0) {
      this.tryAttack();
      return;
    }

    // Move toward target
    if (distance > this.attackRange) {
      toTarget.normalize();
      this.velocity.copy(toTarget).multiplyScalar(this.moveSpeed);
      this.position.add(
        new THREE.Vector3()
          .copy(this.velocity)
          .multiplyScalar(deltaTime)
      );

      // Update facing direction
      this.movePlayer.setFacing(toTarget.x > 0);
    } else {
      // At range but on cooldown, maintain distance
      this.velocity.set(0, 0, 0);
    }
  }

  /**
   * Attempt to execute attack
   */
  private tryAttack(): void {
    if (this.moveLibrary.length === 0) {
      console.warn('[SimpleAI] No moves loaded');
      return;
    }

    if (this.movePlayer.isBusy()) {
      return;
    }

    // Pick random move (or first move for now)
    const move = this.moveLibrary[0];
    this.movePlayer.startMove(move);
    this.state = 'attack';

    console.log(`[SimpleAI] Attacking with ${move.id}`);
  }

  /**
   * React to taking damage
   */
  takeDamage(damage: number, knockback: THREE.Vector2): void {
    console.log(`[SimpleAI] Took ${damage} damage, entering hitstun`);
    
    // Enter hitstun
    this.hitstunFrames = 20; // ~0.33 seconds at 60fps
    this.state = 'hitstun';

    // Apply knockback
    this.velocity.set(knockback.x, knockback.y, 0);
    this.position.add(
      new THREE.Vector3(knockback.x * 0.1, knockback.y * 0.1, 0)
    );
  }

  /**
   * Get current position
   */
  getPosition(): THREE.Vector3 {
    return this.position;
  }

  /**
   * Get current state
   */
  getState(): AIState {
    return this.state;
  }

  /**
   * Get velocity
   */
  getVelocity(): THREE.Vector3 {
    return this.velocity;
  }

  /**
   * Set position (for external physics)
   */
  setPosition(x: number, y: number, z: number = 0): void {
    this.position.set(x, y, z);
  }

  /**
   * Check if AI is attacking
   */
  isAttacking(): boolean {
    return this.state === 'attack' && this.movePlayer.isBusy();
  }

  /**
   * Check if in hitstun
   */
  isInHitstun(): boolean {
    return this.hitstunFrames > 0;
  }
}
