import { FighterStats, MoveSet } from '@smash-heroes/shared';
import { GravityCurveConfig } from '../physics/GravityCurve';

/**
 * Omega Protocol: Transformation System
 * "Transformations must be mid-combat, instant, and alter the character's 
 * entire moveset, frame-data, and gravity curve in real-time"
 * 
 * This system enables characters to evolve during battle with zero delay
 */
export class TransformationSystem {
  private transformationStates = new Map<string, TransformationState>();
  private activeTransformations = new Map<string, string>(); // entityId -> transformationId

  /**
   * Register a new transformation for a character
   */
  registerTransformation(
    entityId: string,
    transformation: TransformationDefinition
  ): void {
    const state: TransformationState = {
      definition: transformation,
      isActive: false,
      timeRemaining: 0,
      canTransform: true,
      cooldownTimer: 0,
    };

    const key = `${entityId}_${transformation.id}`;
    this.transformationStates.set(key, state);
  }

  /**
   * Attempt to transform - instant, mid-combat
   * Returns the transformation data if successful, null otherwise
   */
  transform(
    entityId: string,
    transformationId: string,
    currentStats: FighterStats
  ): TransformationResult | null {
    const key = `${entityId}_${transformationId}`;
    const state = this.transformationStates.get(key);

    if (!state || !state.canTransform) {
      return null;
    }

    const { definition } = state;

    // Check requirements
    if (definition.requirements) {
      if (definition.requirements.ultimateMeter && 
          currentStats.ultimateMeter < definition.requirements.ultimateMeter) {
        return null;
      }
      if (definition.requirements.minDamage && 
          currentStats.currentDamage < definition.requirements.minDamage) {
        return null;
      }
      if (definition.requirements.maxDamage && 
          currentStats.currentDamage > definition.requirements.maxDamage) {
        return null;
      }
    }

    // Activate transformation INSTANTLY
    state.isActive = true;
    state.timeRemaining = definition.duration || Infinity;
    state.canTransform = false;
    this.activeTransformations.set(entityId, transformationId);

    // Consume resources
    if (definition.requirements?.ultimateMeter) {
      currentStats.ultimateMeter -= definition.requirements.ultimateMeter;
    }

    // Return transformation data for INSTANT application
    return {
      transformationId,
      statModifiers: definition.statModifiers,
      moveSetOverride: definition.moveSetOverride,
      gravityCurveOverride: definition.gravityCurveOverride,
      visualEffects: definition.visualEffects,
      audioEffects: definition.audioEffects,
      frameDataModifiers: definition.frameDataModifiers,
    };
  }

  /**
   * Revert transformation
   */
  revertTransformation(entityId: string): boolean {
    const transformationId = this.activeTransformations.get(entityId);
    if (!transformationId) return false;

    const key = `${entityId}_${transformationId}`;
    const state = this.transformationStates.get(key);
    if (!state) return false;

    // Deactivate
    state.isActive = false;
    state.timeRemaining = 0;
    
    // Start cooldown if specified
    if (state.definition.cooldown) {
      state.cooldownTimer = state.definition.cooldown;
    } else {
      state.canTransform = true;
    }

    this.activeTransformations.delete(entityId);
    return true;
  }

  /**
   * Update transformation timers
   */
  update(deltaTime: number): void {
    // Update active transformations
    for (const [entityId, transformationId] of this.activeTransformations) {
      const key = `${entityId}_${transformationId}`;
      const state = this.transformationStates.get(key);
      
      if (!state) continue;

      // Countdown duration
      if (state.timeRemaining !== Infinity) {
        state.timeRemaining -= deltaTime;
        
        if (state.timeRemaining <= 0) {
          // Auto-revert when time expires
          this.revertTransformation(entityId);
        }
      }
    }

    // Update cooldowns
    for (const [key, state] of this.transformationStates) {
      if (state.cooldownTimer > 0) {
        state.cooldownTimer -= deltaTime;
        
        if (state.cooldownTimer <= 0) {
          state.cooldownTimer = 0;
          state.canTransform = true;
        }
      }
    }
  }

  /**
   * Check if a transformation is active
   */
  isTransformed(entityId: string, transformationId?: string): boolean {
    if (transformationId) {
      return this.activeTransformations.get(entityId) === transformationId;
    }
    return this.activeTransformations.has(entityId);
  }

  /**
   * Get active transformation ID
   */
  getActiveTransformation(entityId: string): string | null {
    return this.activeTransformations.get(entityId) || null;
  }

  /**
   * Get transformation state for UI display
   */
  getTransformationState(entityId: string, transformationId: string): TransformationState | null {
    const key = `${entityId}_${transformationId}`;
    return this.transformationStates.get(key) || null;
  }

  /**
   * Check if can transform
   */
  canTransform(entityId: string, transformationId: string): boolean {
    const key = `${entityId}_${transformationId}`;
    const state = this.transformationStates.get(key);
    return state?.canTransform ?? false;
  }

  /**
   * Get remaining time for active transformation (in seconds)
   */
  getRemainingTime(entityId: string): number {
    const transformationId = this.activeTransformations.get(entityId);
    if (!transformationId) return 0;

    const key = `${entityId}_${transformationId}`;
    const state = this.transformationStates.get(key);
    
    if (!state || state.timeRemaining === Infinity) return Infinity;
    return state.timeRemaining / 1000; // Convert to seconds
  }

  /**
   * Get cooldown remaining (in seconds)
   */
  getCooldownRemaining(entityId: string, transformationId: string): number {
    const key = `${entityId}_${transformationId}`;
    const state = this.transformationStates.get(key);
    return state ? state.cooldownTimer / 1000 : 0;
  }

  /**
   * Force end a transformation (for special cases)
   */
  forceRevert(entityId: string): void {
    this.revertTransformation(entityId);
  }

  /**
   * Clear all transformations (for reset/cleanup)
   */
  clear(): void {
    this.transformationStates.clear();
    this.activeTransformations.clear();
  }
}

/**
 * Omega Protocol: Transformation Definition
 * Defines everything that changes during transformation
 */
export interface TransformationDefinition {
  id: string;
  name: string;
  description: string;
  
  // Stat multipliers (applied instantly)
  statModifiers: Partial<StatModifiers>;
  
  // Complete moveset override (optional)
  moveSetOverride?: MoveSet;
  
  // Gravity curve changes
  gravityCurveOverride?: GravityCurveConfig;
  
  // Frame data modifications (speed up or slow down attacks)
  frameDataModifiers?: FrameDataModifiers;
  
  // Visual effects during transformation
  visualEffects?: VisualEffectConfig;
  
  // Audio effects
  audioEffects?: AudioEffectConfig;
  
  // Requirements to transform
  requirements?: {
    ultimateMeter?: number;
    minDamage?: number;
    maxDamage?: number;
    customCondition?: () => boolean;
  };
  
  // Duration in milliseconds (undefined = infinite)
  duration?: number;
  
  // Cooldown before can transform again
  cooldown?: number;
}

/**
 * Stat modifiers applied during transformation
 * All values are MULTIPLIERS (1.0 = no change, 2.0 = double, 0.5 = half)
 */
export interface StatModifiers {
  weight: number;
  walkSpeed: number;
  runSpeed: number;
  airSpeed: number;
  jumpHeight: number;
  fallSpeed: number;
  fastFallSpeed: number;
  attackPower: number;
  defense: number;
}

/**
 * Frame data modifiers
 * Affects startup, active, recovery frames of all attacks
 */
export interface FrameDataModifiers {
  startupMultiplier: number;    // < 1.0 = faster startup
  activeMultiplier: number;      // > 1.0 = longer active frames
  recoveryMultiplier: number;    // < 1.0 = less endlag
  animationSpeedMultiplier: number; // Global animation speed
}

/**
 * Visual effects configuration
 */
export interface VisualEffectConfig {
  auraColor?: { r: number; g: number; b: number };
  auraIntensity?: number;
  particleEffect?: string;
  screenFlash?: boolean;
  screenFlashColor?: { r: number; g: number; b: number };
  trailColor?: { r: number; g: number; b: number };
  glowEffect?: boolean;
}

/**
 * Audio effects configuration
 */
export interface AudioEffectConfig {
  transformationSound?: string;
  ambientLoop?: string;
  voiceClip?: string;
}

/**
 * Transformation state (internal tracking)
 */
interface TransformationState {
  definition: TransformationDefinition;
  isActive: boolean;
  timeRemaining: number;
  canTransform: boolean;
  cooldownTimer: number;
}

/**
 * Result of a successful transformation
 * Contains all data needed to apply transformation instantly
 */
export interface TransformationResult {
  transformationId: string;
  statModifiers: Partial<StatModifiers>;
  moveSetOverride?: MoveSet;
  gravityCurveOverride?: GravityCurveConfig;
  visualEffects?: VisualEffectConfig;
  audioEffects?: AudioEffectConfig;
  frameDataModifiers?: FrameDataModifiers;
}
