/**
 * Procedural Animation Helpers
 * Provides utilities for creating realistic, physics-based character animations
 */

import { lerp, Spring } from './AnimationEasing';

/**
 * Simulates natural breathing animation
 */
export class BreathingAnimation {
  private time: number = 0;
  private breathRate: number;
  private breathDepth: number;

  constructor(breathsPerMinute: number = 15, depth: number = 1.0) {
    this.breathRate = breathsPerMinute / 60; // Convert to breaths per second
    this.breathDepth = depth;
  }

  update(deltaTime: number): { chestExpansion: number; shoulderRise: number; headTilt: number } {
    this.time += deltaTime;
    const breathCycle = Math.sin(this.time * this.breathRate * Math.PI * 2);
    
    return {
      chestExpansion: breathCycle * this.breathDepth * 0.05,
      shoulderRise: breathCycle * this.breathDepth * 0.03,
      headTilt: breathCycle * this.breathDepth * 0.02,
    };
  }

  reset(): void {
    this.time = 0;
  }
}

/**
 * Simulates head look-at behavior with realistic neck constraints
 */
export class HeadLookAt {
  private currentYaw: number = 0;
  private currentPitch: number = 0;
  private targetYaw: number = 0;
  private targetPitch: number = 0;
  private yawSpring: Spring;
  private pitchSpring: Spring;

  constructor(stiffness: number = 100, damping: number = 20) {
    this.yawSpring = new Spring(0, stiffness, damping);
    this.pitchSpring = new Spring(0, stiffness, damping);
  }

  setTarget(yaw: number, pitch: number): void {
    // Clamp to realistic neck rotation limits
    const maxYaw = Math.PI / 2; // 90 degrees left/right
    const maxPitch = Math.PI / 3; // 60 degrees up/down
    
    this.targetYaw = Math.max(-maxYaw, Math.min(maxYaw, yaw));
    this.targetPitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));
    
    this.yawSpring.setTarget(this.targetYaw);
    this.pitchSpring.setTarget(this.targetPitch);
  }

  update(deltaTime: number): { yaw: number; pitch: number; roll: number } {
    this.currentYaw = this.yawSpring.update(deltaTime);
    this.currentPitch = this.pitchSpring.update(deltaTime);
    
    // Add slight roll when looking to the side (natural head tilt)
    const roll = this.currentYaw * 0.15;
    
    return {
      yaw: this.currentYaw,
      pitch: this.currentPitch,
      roll: roll,
    };
  }

  reset(): void {
    this.currentYaw = 0;
    this.currentPitch = 0;
    this.yawSpring.setValue(0);
    this.pitchSpring.setValue(0);
  }
}

/**
 * Simulates inverse kinematics for a 2-joint limb (shoulder-elbow-hand or hip-knee-foot)
 */
export class TwoJointIK {
  private upperLength: number;
  private lowerLength: number;

  constructor(upperLength: number, lowerLength: number) {
    this.upperLength = upperLength;
    this.lowerLength = lowerLength;
  }

  /**
   * Solve IK for a two-joint chain
   * @param targetX - Target position X
   * @param targetY - Target position Y
   * @param bendDirection - 1 for forward bend, -1 for backward bend
   * @returns Joint angles in radians { upper, lower }
   */
  solve(targetX: number, targetY: number, bendDirection: number = 1): { upper: number; lower: number } {
    const distance = Math.sqrt(targetX * targetX + targetY * targetY);
    const maxReach = this.upperLength + this.lowerLength;
    
    // Clamp target to reachable area
    const clampedDistance = Math.min(distance, maxReach * 0.99);
    const clampedX = (targetX / distance) * clampedDistance;
    const clampedY = (targetY / distance) * clampedDistance;
    
    // Law of cosines to find angles
    const a = this.upperLength;
    const b = this.lowerLength;
    const c = clampedDistance;
    
    // Angle at the middle joint (elbow/knee)
    const cosLower = (a * a + b * b - c * c) / (2 * a * b);
    const lowerAngle = Math.acos(Math.max(-1, Math.min(1, cosLower)));
    
    // Angle at the upper joint (shoulder/hip)
    const cosUpper = (a * a + c * c - b * b) / (2 * a * c);
    const upperAngleOffset = Math.acos(Math.max(-1, Math.min(1, cosUpper)));
    const targetAngle = Math.atan2(clampedY, clampedX);
    const upperAngle = targetAngle - upperAngleOffset * bendDirection;
    
    return {
      upper: upperAngle,
      lower: lowerAngle * bendDirection,
    };
  }

  getMaxReach(): number {
    return this.upperLength + this.lowerLength;
  }
}

/**
 * Simulates weight shift during movement
 */
export class WeightShift {
  private time: number = 0;
  private shiftAmount: Spring;

  constructor() {
    this.shiftAmount = new Spring(0, 150, 25);
  }

  setDirection(direction: number): void {
    // direction: -1 (left), 0 (center), 1 (right)
    this.shiftAmount.setTarget(direction);
  }

  update(deltaTime: number): { hipOffset: number; shoulderOffset: number; headOffset: number } {
    this.time += deltaTime;
    const shift = this.shiftAmount.update(deltaTime);
    
    return {
      hipOffset: shift * 0.15,
      shoulderOffset: -shift * 0.1, // Counter-rotation
      headOffset: -shift * 0.05,
    };
  }

  reset(): void {
    this.time = 0;
    this.shiftAmount.setValue(0);
  }
}

/**
 * Simulates anticipation, action, and follow-through for attacks
 */
export class AttackAnimationPhase {
  private currentPhase: 'anticipation' | 'action' | 'follow-through' | 'recovery' = 'anticipation';
  private phaseTime: number = 0;
  private phaseStartTime: number = 0;

  constructor(
    private anticipationDuration: number = 0.1,
    private actionDuration: number = 0.15,
    private followThroughDuration: number = 0.1,
    private recoveryDuration: number = 0.15
  ) {}

  update(deltaTime: number): { phase: string; progress: number; intensity: number } {
    this.phaseTime += deltaTime;

    let phaseDuration = 0;
    let intensity = 0;
    let progress = 0;

    const totalDuration = this.anticipationDuration + this.actionDuration + 
                          this.followThroughDuration + this.recoveryDuration;

    if (this.phaseTime < this.anticipationDuration) {
      if (this.currentPhase !== 'anticipation') {
        this.currentPhase = 'anticipation';
        this.phaseStartTime = this.phaseTime;
      }
      phaseDuration = this.anticipationDuration;
      progress = this.phaseTime / phaseDuration;
      // Build up tension
      intensity = progress * 0.3;
    } else if (this.phaseTime < this.anticipationDuration + this.actionDuration) {
      if (this.currentPhase !== 'action') {
        this.currentPhase = 'action';
        this.phaseStartTime = this.phaseTime;
      }
      phaseDuration = this.actionDuration;
      progress = (this.phaseTime - this.anticipationDuration) / phaseDuration;
      // Peak intensity
      intensity = 1.0;
    } else if (this.phaseTime < this.anticipationDuration + this.actionDuration + this.followThroughDuration) {
      if (this.currentPhase !== 'follow-through') {
        this.currentPhase = 'follow-through';
        this.phaseStartTime = this.phaseTime;
      }
      phaseDuration = this.followThroughDuration;
      progress = (this.phaseTime - this.anticipationDuration - this.actionDuration) / phaseDuration;
      // Decay intensity
      intensity = 1.0 - progress * 0.7;
    } else if (this.phaseTime < totalDuration) {
      if (this.currentPhase !== 'recovery') {
        this.currentPhase = 'recovery';
        this.phaseStartTime = this.phaseTime;
      }
      phaseDuration = this.recoveryDuration;
      progress = (this.phaseTime - this.anticipationDuration - this.actionDuration - this.followThroughDuration) / phaseDuration;
      // Return to neutral
      intensity = 0.3 * (1.0 - progress);
    } else {
      // Animation complete
      progress = 1.0;
      intensity = 0;
    }

    return {
      phase: this.currentPhase,
      progress: Math.min(1, Math.max(0, progress)),
      intensity,
    };
  }

  isComplete(): boolean {
    const totalDuration = this.anticipationDuration + this.actionDuration + 
                          this.followThroughDuration + this.recoveryDuration;
    return this.phaseTime >= totalDuration;
  }

  reset(): void {
    this.currentPhase = 'anticipation';
    this.phaseTime = 0;
    this.phaseStartTime = 0;
  }

  getCurrentPhase(): string {
    return this.currentPhase;
  }
}

/**
 * Simulates secondary motion (like clothes, hair, accessories)
 */
export class SecondaryMotion {
  private springs: Spring[] = [];

  constructor(numChains: number = 3, stiffness: number = 80, damping: number = 15) {
    for (let i = 0; i < numChains; i++) {
      // Each chain segment has progressively less stiffness for cascading effect
      const segmentStiffness = stiffness * (1 - i * 0.2);
      const segmentDamping = damping * (1 - i * 0.1);
      this.springs.push(new Spring(0, segmentStiffness, segmentDamping));
    }
  }

  applyForce(force: number): void {
    // Apply force to first segment
    if (this.springs.length > 0 && this.springs[0]) {
      this.springs[0].setTarget(force);
    }
  }

  update(deltaTime: number): number[] {
    const values: number[] = [];
    
    for (let i = 0; i < this.springs.length; i++) {
      const spring = this.springs[i];
      if (!spring) continue;
      
      const value = spring.update(deltaTime);
      values.push(value);
      
      // Cascade to next segment
      const nextSpring = this.springs[i + 1];
      if (i < this.springs.length - 1 && nextSpring) {
        nextSpring.setTarget(value * 0.8);
      }
    }
    
    return values;
  }

  reset(): void {
    for (const spring of this.springs) {
      if (spring) {
        spring.setValue(0);
        spring.setTarget(0);
      }
    }
  }
}

/**
 * Simulates foot placement for walking/running
 */
export class FootPlacement {
  private leftFootPhase: number = 0;
  private rightFootPhase: number = Math.PI; // Start opposite

  update(deltaTime: number, speed: number): { 
    leftFoot: { lift: number; forward: number };
    rightFoot: { lift: number; forward: number };
    bodyBob: number;
  } {
    const strideFrequency = speed * 2; // Higher speed = faster steps
    
    this.leftFootPhase += deltaTime * strideFrequency * Math.PI;
    this.rightFootPhase += deltaTime * strideFrequency * Math.PI;
    
    // Keep phases in 0-2π range
    this.leftFootPhase = this.leftFootPhase % (Math.PI * 2);
    this.rightFootPhase = this.rightFootPhase % (Math.PI * 2);
    
    // Lift follows a parabolic arc
    const leftLift = Math.max(0, Math.sin(this.leftFootPhase)) * 0.3;
    const rightLift = Math.max(0, Math.sin(this.rightFootPhase)) * 0.3;
    
    // Forward motion
    const leftForward = Math.cos(this.leftFootPhase) * 0.4;
    const rightForward = Math.cos(this.rightFootPhase) * 0.4;
    
    // Body bobs up when both feet are grounded
    const bodyBob = (Math.abs(Math.cos(this.leftFootPhase)) + Math.abs(Math.cos(this.rightFootPhase))) * 0.05;
    
    return {
      leftFoot: { lift: leftLift, forward: leftForward },
      rightFoot: { lift: rightLift, forward: rightForward },
      bodyBob,
    };
  }

  reset(): void {
    this.leftFootPhase = 0;
    this.rightFootPhase = Math.PI;
  }
}
