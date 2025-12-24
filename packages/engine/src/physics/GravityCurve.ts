import { RigidBody } from '@smash-heroes/shared';

/**
 * Variable Gravity Curves - Makes jumping feel snappy on ascent and weighted on descent
 * Inspired by Super Smash Bros Ultimate's satisfying jump feel
 */
export class GravityCurve {
  private baseGravity: number;
  private ascentGravityMultiplier: number;
  private descentGravityMultiplier: number;
  private peakGravityMultiplier: number;
  private peakThreshold: number; // Velocity threshold to be considered at peak

  constructor(config?: GravityCurveConfig) {
    this.baseGravity = config?.baseGravity ?? 0.8;
    // Lighter gravity during ascent for snappy, floaty jumps
    this.ascentGravityMultiplier = config?.ascentGravityMultiplier ?? 0.75;
    // Heavier gravity during descent for weighted falls
    this.descentGravityMultiplier = config?.descentGravityMultiplier ?? 1.2;
    // Even lighter gravity near peak for hang time
    this.peakGravityMultiplier = config?.peakGravityMultiplier ?? 0.5;
    this.peakThreshold = config?.peakThreshold ?? 2.0;
  }

  /**
   * Calculate the appropriate gravity based on the body's current state
   * Returns a gravity value that creates "legendary" jump feel
   */
  calculateGravity(body: RigidBody, isJumpHeld: boolean): number {
    const velocity = body.velocity.y;
    
    // Going up (negative Y velocity)
    if (velocity < 0) {
      // Near peak of jump (very slow upward movement)
      if (Math.abs(velocity) < this.peakThreshold) {
        return this.baseGravity * this.peakGravityMultiplier;
      }
      
      // Rising - apply reduced gravity for snappy liftoff
      // If jump is released, apply more gravity for short hop
      const multiplier = isJumpHeld 
        ? this.ascentGravityMultiplier 
        : this.descentGravityMultiplier * 0.8;
      
      return this.baseGravity * multiplier;
    }
    
    // Falling down (positive Y velocity)
    // Apply increased gravity for weighted, decisive falls
    return this.baseGravity * this.descentGravityMultiplier;
  }

  /**
   * Get the current phase of the jump
   */
  getJumpPhase(body: RigidBody): JumpPhase {
    const velocity = body.velocity.y;
    
    if (body.isGrounded) {
      return JumpPhase.GROUNDED;
    }
    
    if (velocity < 0) {
      if (Math.abs(velocity) < this.peakThreshold) {
        return JumpPhase.PEAK;
      }
      return JumpPhase.ASCENDING;
    }
    
    return JumpPhase.DESCENDING;
  }

  /**
   * Apply the variable gravity to a body
   */
  applyVariableGravity(body: RigidBody, isJumpHeld: boolean): void {
    if (!body.isGrounded) {
      const gravity = this.calculateGravity(body, isJumpHeld);
      body.velocity.y += gravity;
    }
  }
}

export interface GravityCurveConfig {
  baseGravity?: number;
  ascentGravityMultiplier?: number;
  descentGravityMultiplier?: number;
  peakGravityMultiplier?: number;
  peakThreshold?: number;
}

export enum JumpPhase {
  GROUNDED = 'grounded',
  ASCENDING = 'ascending',
  PEAK = 'peak',
  DESCENDING = 'descending',
}
