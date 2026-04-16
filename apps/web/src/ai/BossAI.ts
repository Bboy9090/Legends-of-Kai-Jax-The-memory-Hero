/**
 * Boss AI Brain
 * Multi-phase behavior with special patterns
 */

import * as THREE from 'three';
import { MovePlayer } from '../combat/MovePlayer';
import type { MoveSpec } from '../types/MoveSpec';
import type { AITarget } from './SimpleAI';

export type BossPhase = 'phase1' | 'phase2' | 'phase3';
export type BossState = 'idle' | 'approach' | 'attack' | 'special' | 'enrage' | 'hitstun' | 'dead';

export class BossAI {
  private movePlayer: MovePlayer;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private state: BossState = 'idle';
  private phase: BossPhase = 'phase1';
  private target: AITarget | null = null;
  private hp: number = 100;
  private maxHP: number = 100;
  
  // AI tuning
  private attackRange: number = 2.0; // Longer range than grunts
  private moveSpeed: number = 1.5; // Slower but methodical
  private attackCooldown: number = 0;
  private specialCooldown: number = 0;
  private hitstunFrames: number = 0;
  private moveLibrary: MoveSpec[] = [];
  
  // Phase thresholds
  private phase2Threshold: number = 0.66; // 66% HP
  private phase3Threshold: number = 0.33; // 33% HP

  constructor(movePlayer: MovePlayer, position: THREE.Vector3, hp: number) {
    this.movePlayer = movePlayer;
    this.position = position;
    this.velocity = new THREE.Vector3();
    this.hp = hp;
    this.maxHP = hp;
  }

  setTarget(target: AITarget): void {
    this.target = target;
  }

  loadMove(move: MoveSpec): void {
    this.moveLibrary.push(move);
  }

  update(deltaTime: number): void {
    if (!this.target || !this.target.isAlive()) {
      this.state = 'idle';
      return;
    }

    // Update cooldowns
    if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
    if (this.specialCooldown > 0) this.specialCooldown -= deltaTime;

    // Check phase transitions
    this.updatePhase();

    // Hitstun check
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
        if (!this.movePlayer.isBusy()) {
          this.state = 'approach';
          this.attackCooldown = this.getAttackCooldown();
        }
        break;

      case 'special':
        if (!this.movePlayer.isBusy()) {
          this.state = 'approach';
          this.specialCooldown = 5.0; // 5 second special cooldown
        }
        break;

      case 'enrage':
        // Enrage is visual state, transition back to approach
        this.state = 'approach';
        break;
    }
  }

  private updatePhase(): void {
    const hpPercent = this.hp / this.maxHP;

    if (hpPercent <= this.phase3Threshold && this.phase !== 'phase3') {
      this.phase = 'phase3';
      this.state = 'enrage';
      this.moveSpeed = 2.5; // Fast and aggressive
      console.log('[BossAI] Phase 3: ENRAGED!');
    } else if (hpPercent <= this.phase2Threshold && this.phase !== 'phase2') {
      this.phase = 'phase2';
      this.state = 'enrage';
      this.moveSpeed = 2.0; // Faster
      console.log('[BossAI] Phase 2: Increased aggression');
    }
  }

  private updateApproach(deltaTime: number): void {
    if (!this.target) return;

    const toTarget = new THREE.Vector3()
      .subVectors(this.target.position, this.position)
      .setZ(0);
    
    const distance = toTarget.length();

    // Special attack chance (phase-dependent)
    if (this.canUseSpecial() && Math.random() < this.getSpecialChance()) {
      this.trySpecialAttack();
      return;
    }

    // Check attack range
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

      this.movePlayer.setFacing(toTarget.x > 0);
    } else {
      this.velocity.set(0, 0, 0);
    }
  }

  private tryAttack(): void {
    if (this.moveLibrary.length === 0 || this.movePlayer.isBusy()) return;

    // Boss uses heavy attacks more often
    const moveIndex = this.phase === 'phase1' ? 0 : 1; // Switch to heavier move in phase 2+
    const move = this.moveLibrary[Math.min(moveIndex, this.moveLibrary.length - 1)];
    
    this.movePlayer.startMove(move);
    this.state = 'attack';
    console.log(`[BossAI] Attacking with ${move.id} (Phase ${this.phase})`);
  }

  private trySpecialAttack(): void {
    if (this.moveLibrary.length === 0 || this.movePlayer.isBusy()) return;

    // Use combo chain as special if available
    const specialMove = this.moveLibrary.find(m => m.id.includes('combo') || m.id.includes('special'));
    const move = specialMove || this.moveLibrary[this.moveLibrary.length - 1];

    this.movePlayer.startMove(move);
    this.state = 'special';
    console.log(`[BossAI] SPECIAL ATTACK: ${move.id}!`);
  }

  private canUseSpecial(): boolean {
    return this.specialCooldown <= 0 && this.moveLibrary.length > 0;
  }

  private getSpecialChance(): number {
    switch (this.phase) {
      case 'phase3': return 0.3; // 30% chance
      case 'phase2': return 0.2; // 20% chance
      default: return 0.1; // 10% chance
    }
  }

  private getAttackCooldown(): number {
    switch (this.phase) {
      case 'phase3': return 0.5; // Very aggressive
      case 'phase2': return 0.8;
      default: return 1.2;
    }
  }

  takeDamage(damage: number, knockback: THREE.Vector2): void {
    this.hp = Math.max(0, this.hp - damage);
    
    // Boss has reduced hitstun
    const hitstunReduction = this.phase === 'phase3' ? 0.5 : this.phase === 'phase2' ? 0.7 : 1.0;
    this.hitstunFrames = Math.floor(15 * hitstunReduction);
    this.state = 'hitstun';

    // Reduced knockback
    this.velocity.set(knockback.x * 0.5, knockback.y * 0.5, 0);
    this.position.add(new THREE.Vector3(knockback.x * 0.05, knockback.y * 0.05, 0));

    console.log(`[BossAI] Took ${damage} damage. HP: ${this.hp}/${this.maxHP} (Phase ${this.phase})`);
  }

  getPosition(): THREE.Vector3 {
    return this.position;
  }

  getState(): BossState {
    return this.state;
  }

  getPhase(): BossPhase {
    return this.phase;
  }

  getHP(): number {
    return this.hp;
  }

  setPosition(x: number, y: number, z: number = 0): void {
    this.position.set(x, y, z);
  }

  isAttacking(): boolean {
    return (this.state === 'attack' || this.state === 'special') && this.movePlayer.isBusy();
  }

  isInHitstun(): boolean {
    return this.hitstunFrames > 0;
  }
}
