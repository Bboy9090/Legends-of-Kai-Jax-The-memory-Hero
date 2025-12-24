import { AttackData } from '@smash-heroes/shared';

/**
 * Frame-Canceling System - Allows high-skill players to string creative combos
 * Inspired by advanced fighting game techniques (IASA frames, canceling)
 */
export class FrameCancelSystem {
  private cancelWindows: Map<string, CancelWindow> = new Map();
  
  /**
   * Check if an attack can be canceled at the current frame
   */
  canCancel(attackName: string, currentFrame: number, cancelType: CancelType): boolean {
    const window = this.cancelWindows.get(attackName);
    
    if (!window) return false;
    
    // Check if we're in a valid cancel window
    switch (cancelType) {
      case CancelType.NORMAL:
        return currentFrame >= window.normalCancelStart && currentFrame <= window.normalCancelEnd;
      
      case CancelType.SPECIAL:
        return currentFrame >= window.specialCancelStart && currentFrame <= window.specialCancelEnd;
      
      case CancelType.JUMP:
        return currentFrame >= window.jumpCancelStart && currentFrame <= window.jumpCancelEnd;
      
      case CancelType.DASH:
        return currentFrame >= window.dashCancelStart && currentFrame <= window.dashCancelEnd;
      
      case CancelType.LEDGE:
        return window.canLedgeCancel && this.isNearLedge();
      
      default:
        return false;
    }
  }

  /**
   * Register cancel windows for an attack
   */
  registerAttackCancelWindows(attack: AttackData, config: CancelWindowConfig): void {
    const totalFrames = attack.startupFrames + attack.activeFrames + attack.recoveryFrames;
    
    const window: CancelWindow = {
      attackName: attack.name,
      totalFrames,
      
      // Normal cancel (into other normals) - usually late in recovery
      normalCancelStart: config.normalCancelStart ?? Math.floor(totalFrames * 0.7),
      normalCancelEnd: totalFrames,
      
      // Special cancel (into special moves) - earlier than normal
      specialCancelStart: config.specialCancelStart ?? Math.floor(totalFrames * 0.5),
      specialCancelEnd: totalFrames,
      
      // Jump cancel - very late or on hit
      jumpCancelStart: config.jumpCancelStart ?? Math.floor(totalFrames * 0.8),
      jumpCancelEnd: totalFrames,
      
      // Dash cancel - similar to jump
      dashCancelStart: config.dashCancelStart ?? Math.floor(totalFrames * 0.8),
      dashCancelEnd: totalFrames,
      
      // Ledge cancel - can cancel by grabbing ledge
      canLedgeCancel: config.canLedgeCancel ?? false,
      
      // Hit cancel - can cancel on successful hit
      canHitCancel: config.canHitCancel ?? false,
      hitCancelAdvantage: config.hitCancelAdvantage ?? 5, // Extra frames on hit
      
      // Whiff cancel - can cancel if attack missed
      canWhiffCancel: config.canWhiffCancel ?? false,
    };
    
    this.cancelWindows.set(attack.name, window);
  }

  /**
   * Check if attack can be canceled due to hitting opponent
   */
  canHitCancel(attackName: string, currentFrame: number, didHit: boolean): boolean {
    const window = this.cancelWindows.get(attackName);
    
    if (!window || !window.canHitCancel) return false;
    
    if (didHit) {
      // Grant additional cancel window on hit
      return currentFrame >= window.specialCancelStart - window.hitCancelAdvantage;
    }
    
    return false;
  }

  /**
   * Check if attack can be canceled even if it whiffed
   */
  canWhiffCancel(attackName: string, currentFrame: number, didWhiff: boolean): boolean {
    const window = this.cancelWindows.get(attackName);
    
    if (!window || !window.canWhiffCancel) return false;
    
    return didWhiff && currentFrame >= window.jumpCancelStart;
  }

  /**
   * Get the earliest possible cancel frame for any action
   */
  getEarliestCancelFrame(attackName: string): number {
    const window = this.cancelWindows.get(attackName);
    
    if (!window) return Infinity;
    
    return Math.min(
      window.normalCancelStart,
      window.specialCancelStart,
      window.jumpCancelStart,
      window.dashCancelStart
    );
  }

  /**
   * Check if near ledge (placeholder - would be implemented with actual stage data)
   */
  private isNearLedge(): boolean {
    // This would check actual position relative to stage ledges
    return false;
  }

  /**
   * Clear all cancel windows
   */
  clear(): void {
    this.cancelWindows.clear();
  }
}

export interface CancelWindow {
  attackName: string;
  totalFrames: number;
  
  // Different cancel timings for different actions
  normalCancelStart: number;
  normalCancelEnd: number;
  
  specialCancelStart: number;
  specialCancelEnd: number;
  
  jumpCancelStart: number;
  jumpCancelEnd: number;
  
  dashCancelStart: number;
  dashCancelEnd: number;
  
  // Special cancel conditions
  canLedgeCancel: boolean;
  canHitCancel: boolean;
  hitCancelAdvantage: number;
  canWhiffCancel: boolean;
}

export interface CancelWindowConfig {
  normalCancelStart?: number;
  specialCancelStart?: number;
  jumpCancelStart?: number;
  dashCancelStart?: number;
  canLedgeCancel?: boolean;
  canHitCancel?: boolean;
  hitCancelAdvantage?: number;
  canWhiffCancel?: boolean;
}

export enum CancelType {
  NORMAL = 'normal',     // Cancel into another normal attack
  SPECIAL = 'special',   // Cancel into special move
  JUMP = 'jump',         // Cancel into jump
  DASH = 'dash',         // Cancel into dash
  LEDGE = 'ledge',       // Cancel by grabbing ledge
}
