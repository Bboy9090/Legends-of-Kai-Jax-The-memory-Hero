/**
 * THE AETERNA COVENANT - COMBAT STATE MACHINE
 * 
 * Frame-Data Logic. The combat system that respects timing.
 * 
 * State Cycle:
 *   IDLE → TELEGRAPH (Yellow) → ACTIVE (Cyan) → RECOVERY → IDLE
 * 
 * Frame Data:
 *   - Telegraph: Configurable (typically 8-12 frames)
 *   - Active: 4 frames (hit window)
 *   - Recovery: 12 frames (vulnerable)
 */

import { bus } from './EventBus';
import { Events } from './EventBus';

export enum CombatState {
  IDLE = 'IDLE',
  TELEGRAPH = 'TELEGRAPH',  // Wind-up (Yellow indicator)
  ACTIVE = 'ACTIVE',        // Hit window (Cyan flash)
  RECOVERY = 'RECOVERY',    // Cooldown (vulnerable)
  HITSTUN = 'HITSTUN',      // Hit reaction
  BLOCKSTUN = 'BLOCKSTUN'   // Block reaction
}

export interface AttackData {
  damage: number;
  knockback: number;
  hitbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  frameData: {
    telegraph: number;  // Frames before active
    active: number;      // Frames of hit window
    recovery: number;    // Frames of recovery
  };
}

export class CombatStateMachine {
  public state: CombatState = CombatState.IDLE;
  private timer: number = 0;
  private frameTimer: number = 0;
  private currentAttack: AttackData | null = null;
  private hitStopFrames: number = 0;

  /**
   * Update state machine (call every frame)
   */
  update(deltaTime: number): void {
    // Handle hit-stop (freeze frames on hit)
    if (this.hitStopFrames > 0) {
      this.hitStopFrames -= deltaTime * 60; // Convert to frames
      if (this.hitStopFrames <= 0) {
        this.hitStopFrames = 0;
      }
      return; // Don't advance state during hit-stop
    }

    // Advance frame timer
    this.frameTimer += deltaTime * 60; // Convert to frames

    // Check if timer expired
    if (this.timer > 0) {
      this.timer -= deltaTime * 60; // Convert to frames
      if (this.timer <= 0) {
        this.transition();
      }
    }
  }

  /**
   * Transition to next state in cycle
   */
  private transition(): void {
    const previousState = this.state;

    switch (this.state) {
      case CombatState.TELEGRAPH:
        // Move to active hit window
        this.state = CombatState.ACTIVE;
        if (this.currentAttack) {
          this.timer = this.currentAttack.frameData.active;
        } else {
          this.timer = 4; // Default active frames
        }
        bus.emit(Events.PLAYER_ATTACK, { 
          state: this.state, 
          attack: this.currentAttack,
          hitbox: this.currentAttack?.hitbox 
        });
        break;

      case CombatState.ACTIVE:
        // Move to recovery
        this.state = CombatState.RECOVERY;
        if (this.currentAttack) {
          this.timer = this.currentAttack.frameData.recovery;
        } else {
          this.timer = 12; // Default recovery frames
        }
        break;

      case CombatState.RECOVERY:
        // Return to idle
        this.state = CombatState.IDLE;
        this.currentAttack = null;
        this.frameTimer = 0;
        break;

      case CombatState.HITSTUN:
      case CombatState.BLOCKSTUN:
        // Return to idle after stun
        this.state = CombatState.IDLE;
        this.currentAttack = null;
        this.frameTimer = 0;
        break;

      default:
        // Already idle or unknown state
        break;
    }

    // Emit state change
    if (previousState !== this.state) {
      bus.emit('COMBAT_STATE_CHANGE', { 
        from: previousState, 
        to: this.state,
        attack: this.currentAttack 
      });
    }
  }

  /**
   * Trigger an attack
   */
  trigger(attack: AttackData): boolean {
    if (this.state === CombatState.IDLE) {
      this.state = CombatState.TELEGRAPH;
      this.currentAttack = attack;
      this.timer = attack.frameData.telegraph;
      this.frameTimer = 0;
      
      bus.emit(Events.PLAYER_ATTACK, { 
        state: this.state, 
        attack: attack,
        telegraph: true 
      });
      
      return true;
    }
    return false; // Can't attack while busy
  }

  /**
   * Apply hit-stop (freeze frames on impact)
   */
  applyHitStop(frames: number = 6): void {
    this.hitStopFrames = frames;
  }

  /**
   * Enter hitstun state
   */
  enterHitstun(frames: number = 20): void {
    this.state = CombatState.HITSTUN;
    this.timer = frames;
    this.currentAttack = null;
  }

  /**
   * Enter blockstun state
   */
  enterBlockstun(frames: number = 10): void {
    this.state = CombatState.BLOCKSTUN;
    this.timer = frames;
    this.currentAttack = null;
  }

  /**
   * Cancel current attack (for special moves)
   */
  cancel(): void {
    if (this.state === CombatState.TELEGRAPH || this.state === CombatState.ACTIVE) {
      this.state = CombatState.IDLE;
      this.currentAttack = null;
      this.timer = 0;
      this.frameTimer = 0;
    }
  }

  /**
   * Check if attack is in active hit window
   */
  isActive(): boolean {
    return this.state === CombatState.ACTIVE;
  }

  /**
   * Check if can attack
   */
  canAttack(): boolean {
    return this.state === CombatState.IDLE;
  }

  /**
   * Get current attack data
   */
  getCurrentAttack(): AttackData | null {
    return this.currentAttack;
  }

  /**
   * Get current frame in attack sequence
   */
  getCurrentFrame(): number {
    return Math.floor(this.frameTimer);
  }

  /**
   * Reset to idle
   */
  reset(): void {
    this.state = CombatState.IDLE;
    this.timer = 0;
    this.frameTimer = 0;
    this.currentAttack = null;
    this.hitStopFrames = 0;
  }
}
