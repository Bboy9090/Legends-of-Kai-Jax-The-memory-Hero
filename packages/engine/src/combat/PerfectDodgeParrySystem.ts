/**
 * PERFECT DODGE & PARRY SYSTEM - BEYOND LEGENDARY
 * 
 * World-class dodge and parry mechanics with:
 * - Perfect timing windows
 * - Slow-motion effects
 * - Counter opportunities
 * - Visual feedback
 * - Meter generation
 */

import { LEGENDARY_COMBAT_CONSTANTS } from '@legends-of-kai-jax/shared';

export interface PerfectDodgeState {
  isActive: boolean;
  windowStart: number; // Timestamp when window opens
  windowEnd: number; // Timestamp when window closes
  slowMotionActive: boolean;
  slowMotionEndTime: number;
  counterWindowActive: boolean;
  counterWindowEndTime: number;
  reflexMeterGain: number;
}

export interface PerfectParryState {
  isActive: boolean;
  windowStart: number;
  windowEnd: number;
  stunActive: boolean;
  stunEndTime: number;
  resonanceMeterGain: number;
  guaranteedCrit: boolean;
}

export class PerfectDodgeParrySystem {
  private perfectDodgeStates: Map<string, PerfectDodgeState> = new Map();
  private perfectParryStates: Map<string, PerfectParryState> = new Map();
  private currentTime: number = 0;

  /**
   * Update system (call every frame)
   */
  update(deltaTime: number): void {
    this.currentTime = performance.now();
    
    // Update perfect dodge states
    this.perfectDodgeStates.forEach((state, id) => {
      if (state.slowMotionActive && this.currentTime > state.slowMotionEndTime) {
        state.slowMotionActive = false;
      }
      if (state.counterWindowActive && this.currentTime > state.counterWindowEndTime) {
        state.counterWindowActive = false;
      }
      if (this.currentTime > state.windowEnd) {
        state.isActive = false;
      }
    });
    
    // Update perfect parry states
    this.perfectParryStates.forEach((state, id) => {
      if (state.stunActive && this.currentTime > state.stunEndTime) {
        state.stunActive = false;
      }
      if (this.currentTime > state.windowEnd) {
        state.isActive = false;
      }
    });
  }

  /**
   * Attempt perfect dodge
   */
  attemptPerfectDodge(fighterId: string, attackIncomingTime: number): {
    success: boolean;
    state?: PerfectDodgeState;
    timeScale?: number;
  } {
    const now = this.currentTime;
    const timeUntilHit = attackIncomingTime - now;
    const window = LEGENDARY_COMBAT_CONSTANTS.PERFECT_DODGE.WINDOW_MS;
    
    // Check if within perfect dodge window
    if (timeUntilHit > 0 && timeUntilHit <= window) {
      // Perfect dodge successful!
      const state: PerfectDodgeState = {
        isActive: true,
        windowStart: now,
        windowEnd: now + window,
        slowMotionActive: true,
        slowMotionEndTime: now + LEGENDARY_COMBAT_CONSTANTS.PERFECT_DODGE.SLOW_MOTION_DURATION,
        counterWindowActive: true,
        counterWindowEndTime: now + LEGENDARY_COMBAT_CONSTANTS.PERFECT_DODGE.COUNTER_WINDOW_MS,
        reflexMeterGain: LEGENDARY_COMBAT_CONSTANTS.PERFECT_DODGE.REFLEX_METER_GAIN,
      };
      
      this.perfectDodgeStates.set(fighterId, state);
      
      return {
        success: true,
        state,
        timeScale: LEGENDARY_COMBAT_CONSTANTS.PERFECT_DODGE.SLOW_MOTION_SCALE,
      };
    }
    
    return { success: false };
  }

  /**
   * Attempt perfect parry
   */
  attemptPerfectParry(fighterId: string, attackIncomingTime: number): {
    success: boolean;
    state?: PerfectParryState;
    stunDuration?: number;
  } {
    const now = this.currentTime;
    const timeUntilHit = attackIncomingTime - now;
    const window = LEGENDARY_COMBAT_CONSTANTS.PERFECT_PARRY.WINDOW_MS;
    
    // Check if within perfect parry window
    if (timeUntilHit > 0 && timeUntilHit <= window) {
      // Perfect parry successful!
      const state: PerfectParryState = {
        isActive: true,
        windowStart: now,
        windowEnd: now + window,
        stunActive: true,
        stunEndTime: now + LEGENDARY_COMBAT_CONSTANTS.PERFECT_PARRY.STUN_DURATION_MS,
        resonanceMeterGain: LEGENDARY_COMBAT_CONSTANTS.PERFECT_PARRY.RESONANCE_METER_GAIN,
        guaranteedCrit: LEGENDARY_COMBAT_CONSTANTS.PERFECT_PARRY.PERFECT_REWARD.GUARANTEED_CRIT,
      };
      
      this.perfectParryStates.set(fighterId, state);
      
      return {
        success: true,
        state,
        stunDuration: LEGENDARY_COMBAT_CONSTANTS.PERFECT_PARRY.STUN_DURATION_MS,
      };
    }
    
    return { success: false };
  }

  /**
   * Get perfect dodge state
   */
  getPerfectDodgeState(fighterId: string): PerfectDodgeState | undefined {
    return this.perfectDodgeStates.get(fighterId);
  }

  /**
   * Get perfect parry state
   */
  getPerfectParryState(fighterId: string): PerfectParryState | undefined {
    return this.perfectParryStates.get(fighterId);
  }

  /**
   * Check if in counter window
   */
  isInCounterWindow(fighterId: string): boolean {
    const state = this.perfectDodgeStates.get(fighterId);
    return state?.counterWindowActive ?? false;
  }

  /**
   * Check if target is stunned
   */
  isStunned(fighterId: string): boolean {
    const state = this.perfectParryStates.get(fighterId);
    return state?.stunActive ?? false;
  }

  /**
   * Get current time scale (for slow motion)
   */
  getTimeScale(fighterId: string): number {
    const state = this.perfectDodgeStates.get(fighterId);
    if (state?.slowMotionActive) {
      return LEGENDARY_COMBAT_CONSTANTS.PERFECT_DODGE.SLOW_MOTION_SCALE;
    }
    return 1.0;
  }

  /**
   * Reset all states
   */
  reset(): void {
    this.perfectDodgeStates.clear();
    this.perfectParryStates.clear();
  }
}
