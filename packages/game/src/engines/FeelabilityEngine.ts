/**
 * FEELABILITY PROTOCOL — Combat Polish & Juice (AETERNA COVENANT V1.3)
 * 
 * Purpose: Make every interaction feel legendary and responsive
 * Pattern: Event-driven VFX/juice system
 * 
 * Core Principles:
 * - Hit-Stop: Momentary freeze on impact (makes hits feel HEAVY)
 * - Screen Shake: Dynamic shake based on damage/weight
 * - Coyote Time: Forgiveness window for jumps (4 frames)
 * - Input Buffering: 8-frame window for combo extensions (LULU Protocol v7)
 * - Directional Influence (DI): Player agency even when launched
 * - Variable Gravity Curves: Snappy jumps, weighted falls
 * 
 * Mathematics:
 * - Hit-Stop frames = damage * 0.02 (capped at 30 frames)
 * - Screen Shake magnitude = knockback * weight * 0.01
 * - Coyote Time = 4 frames (66.7ms at 60fps)
 * - Input Buffer = 8 frames (133ms at 60fps) — UPDATED to match LULU Protocol v7
 * - Jump liftoff velocity = weight * 12 (heavier = slower jump arc)
 * - DI effectiveness = (inputQuality * resonance) / 100
 */

import { eventBus } from '../core/EventBus';

export interface FeelabilityConfig {
  hitStopEnabled: boolean;
  screenShakeEnabled: boolean;
  coyoteTimeFrames: number;
  inputBufferFrames: number; // LULU Protocol v7: 8 frames
  diEnabled: boolean;
  particlesEnabled: boolean;
}

export interface HitReaction {
  attackerId: string;
  defenderId: string;
  damage: number;
  attackWeight: number;
  defenderWeight: number;
  knockback: { x: number; y: number };
  hitType: 'light' | 'medium' | 'heavy' | 'launcher' | 'shieldbreak';
}

export interface InputBuffer {
  frameIndex: number;
  inputs: string[];
  validWindow: number; // Frames from now until input expires
}

class FeelabilityEngine {
  private static instance: FeelabilityEngine;
  private config: FeelabilityConfig;
  private hitStopTimer: number = 0;
  private screenShakeIntensity: number = 0;
  private inputBuffer: InputBuffer[] = [];
  private coyoteTimeFrames: Map<string, number> = new Map(); // characterId -> frames remaining

  private constructor() {
    this.config = {
      hitStopEnabled: true,
      screenShakeEnabled: true,
      coyoteTimeFrames: 4,
      inputBufferFrames: 8, // LULU Protocol v7: Updated from 6 to 8 frames
      diEnabled: true,
      particlesEnabled: true,
    };

    this.subscribeToEvents();
  }

  public static getInstance(): FeelabilityEngine {
    if (!FeelabilityEngine.instance) {
      FeelabilityEngine.instance = new FeelabilityEngine();
    }
    return FeelabilityEngine.instance;
  }

  /**
   * Subscribe to combat events
   */
  private subscribeToEvents(): void {
    // Hit landed → apply hit-stop and screen shake
    eventBus.on('hit_landed', (data) => {
      this.onHitLanded({
        attackerId: data.attackerId,
        defenderId: data.defenderId,
        damage: data.damage,
        attackWeight: 95, // TODO: Get from character data
        defenderWeight: 95,
        knockback: data.knockback,
        hitType: data.damage > 30 ? 'heavy' : data.damage > 15 ? 'medium' : 'light',
      });
    });

    // Character jump input → track coyote time
    eventBus.on('combat_state_change', (data) => {
      if (data.currentState === 'JUMP') {
        this.startCoyoteTime(data.characterId);
      }
    });

    // Input submitted → buffer for combo checking
    eventBus.on('attack_triggered', (data) => {
      this.bufferInput(data.characterId, data.moveId);
    });
  }

  /**
   * CORE: Hit-Stop Implementation
   * 
   * When a hit lands:
   * 1. Freeze game for N frames (proportional to damage)
   * 2. Play impact sound
   * 3. Trigger screen shake
   * 4. Apply knockback after unfreeze
   * 
   * Formula: hitStopFrames = damage * 0.02 (capped at 30)
   * Example: 20 damage = 0.4 frames (minimal)
   *          50 damage = 1 frame (noticeable)
   *          150 damage = 3 frames (heavy feel)
   */
  private onHitLanded(reaction: HitReaction): void {
    if (!this.config.hitStopEnabled) return;

    // Calculate hit-stop duration
    const baseHitStop = reaction.damage * 0.02;
    const weightMultiplier = (reaction.attackWeight / 100) * 1.5; // Heavier attacks = longer stop
    const hitStopFrames = Math.min(30, baseHitStop * weightMultiplier);

    console.log(`[Feelability] Hit-Stop: ${hitStopFrames.toFixed(1)} frames (damage: ${reaction.damage})`);

    // Apply hit-stop
    this.hitStopTimer = hitStopFrames;
    eventBus.emit('vfx_spawn', {
      type: 'impact',
      position: { x: 0, y: 0 }, // Would be calculated from hit location
      intensity: reaction.damage / 100,
    });

    // Screen shake intensity proportional to knockback
    this.applyScreenShake(reaction);

    // Emit impact particles
    if (this.config.particlesEnabled) {
      this.spawnImpactParticles(reaction);
    }
  }

  /**
   * Screen Shake
   * 
   * Shake magnitude = knockback magnitude * (attackWeight / 100) * 0.01
   * Duration = shake magnitude * 5 (stronger = longer)
   * 
   * Example:
   *   Knockback of 20 units, 110 weight = 0.022 magnitude = ~0.11s duration
   *   Knockback of 50 units, 110 weight = 0.055 magnitude = ~0.27s duration
   */
  private applyScreenShake(reaction: HitReaction): void {
    if (!this.config.screenShakeEnabled) return;

    const knockbackMagnitude = Math.sqrt(
      reaction.knockback.x ** 2 + reaction.knockback.y ** 2
    );

    const weightRatio = reaction.attackWeight / 100;
    const intensity = knockbackMagnitude * weightRatio * 0.01;
    const duration = intensity * 5; // Frames

    this.screenShakeIntensity = intensity;

    console.log(`[Feelability] Screen Shake: ${intensity.toFixed(2)} intensity, ${duration.toFixed(1)}ms duration`);

    eventBus.emit('screen_shake', {
      duration: duration / 16.67, // Convert to milliseconds
      intensity: intensity,
    });
  }

  /**
   * Spawn impact particles (sparks, debris, etc.)
   */
  private spawnImpactParticles(reaction: HitReaction): void {
    const particleCount = Math.ceil(reaction.damage / 10);

    eventBus.emit('vfx_spawn', {
      type: 'impact',
      intensity: reaction.damage / 150,
    });

    console.log(`[Feelability] Spawned ${particleCount} impact particles`);
  }

  /**
   * CORE: Coyote Time
   * 
   * Allows player to jump for 4 frames after walking off a ledge
   * Prevents "cheap" deaths and makes movement feel generous
   * 
   * Usage:
   * 1. Character leaves ground → startCoyoteTime(characterId)
   * 2. Update each frame → decrementCoyoteTime()
   * 3. Player presses jump → if coyoteFrames > 0, allow jump
   */
  public startCoyoteTime(characterId: string): void {
    this.coyoteTimeFrames.set(characterId, this.config.coyoteTimeFrames);
    console.log(`[Feelability] Coyote time started for ${characterId}`);
  }

  /**
   * Decrement coyote time each frame
   */
  public updateCoyoteTime(): void {
    for (const [characterId, frames] of this.coyoteTimeFrames.entries()) {
      if (frames > 0) {
        this.coyoteTimeFrames.set(characterId, frames - 1);
      } else {
        this.coyoteTimeFrames.delete(characterId);
      }
    }
  }

  /**
   * Check if character can use coyote jump
   */
  public canCoyoteJump(characterId: string): boolean {
    const frames = this.coyoteTimeFrames.get(characterId) ?? 0;
    return frames > 0;
  }

  /**
   * CORE: Input Buffering
   * 
   * Allows combo extensions even if player input is 1-2 frames late
   * Window: 6 frames (100ms at 60fps)
   * 
   * Example:
   * Frame 0: jab lands (hitStop)
   * Frame 2: player presses "light kick" (late input)
   * Frame 6: input buffer expires
   * If jab recovery ends before frame 6, combo is valid
   */
  public bufferInput(characterId: string, moveId: string): void {
    const bufferEntry: InputBuffer = {
      frameIndex: 0,
      inputs: [moveId],
      validWindow: this.config.inputBufferFrames,
    };

    this.inputBuffer.push(bufferEntry);

    console.log(`[Feelability] Input buffered: ${moveId} (valid for ${this.config.inputBufferFrames} frames)`);
  }

  /**
   * Check if buffered input is still valid
   */
  public isInputBufferValid(moveId: string): boolean {
    const entry = this.inputBuffer.find(b => b.inputs.includes(moveId));
    if (!entry) return false;

    return entry.validWindow > 0;
  }

  /**
   * Consume buffered input (apply it to combo)
   */
  public consumeBufferedInput(moveId: string): boolean {
    const index = this.inputBuffer.findIndex(b => b.inputs.includes(moveId));
    if (index === -1) return false;

    this.inputBuffer.splice(index, 1);
    console.log(`[Feelability] Buffered input consumed: ${moveId}`);
    return true;
  }

  /**
   * Update input buffer each frame (decrement valid windows)
   */
  public updateInputBuffer(): void {
    for (let i = this.inputBuffer.length - 1; i >= 0; i--) {
      this.inputBuffer[i].validWindow--;
      if (this.inputBuffer[i].validWindow <= 0) {
        this.inputBuffer.splice(i, 1);
      }
    }
  }

  /**
   * CORE: Directional Influence (DI)
   * 
   * When launched, player can influence trajectory by holding a direction
   * Effectiveness scales with character resonance (higher resonance = better DI)
   * 
   * Formula: diStrength = (playerInput * (resonance / 100)) * 0.5
   * Example: 100% resonance, perfect input = 50% knockback reduction
   *          50% resonance, perfect input = 25% knockback reduction
   */
  public applyDirectionalInfluence(
    baseKnockback: { x: number; y: number },
    playerInput: { x: number; y: number },
    resonance: number
  ): { x: number; y: number } {
    if (!this.config.diEnabled) return baseKnockback;

    // Normalize player input
    const inputMagnitude = Math.sqrt(playerInput.x ** 2 + playerInput.y ** 2);
    const normalizedInput = {
      x: inputMagnitude > 0 ? playerInput.x / inputMagnitude : 0,
      y: inputMagnitude > 0 ? playerInput.y / inputMagnitude : 0,
    };

    // DI strength based on resonance
    const diStrength = (resonance / 100) * 0.5;

    // Apply DI reduction to knockback
    const reducedKnockback = {
      x: baseKnockback.x * (1 - normalizedInput.x * diStrength),
      y: baseKnockback.y * (1 - normalizedInput.y * diStrength),
    };

    console.log(`[Feelability] DI applied: ${diStrength.toFixed(2)}x strength`);

    return reducedKnockback;
  }

  /**
   * CORE: Variable Gravity Curves
   * 
   * Jump feels snappy on liftoff, weighted on descent
   * 
   * Liftoff phase (0-50% of jump):
   *   - Reduce gravity to 0.5x for snappy feel
   * Descent phase (50%+ of jump):
   *   - Increase gravity to 1.5x for weight
   * 
   * Formula:
   * jumpVelocity = sqrt(weight * 2 * jumpHeight * g)
   * jumpHeight = weight / 10 (heavier = less height)
   */
  public getGravityModifier(jumpPhase: number): number {
    // jumpPhase: 0 = start, 1 = peak, 2 = landing
    if (jumpPhase < 0.5) {
      return 0.5; // Snappy liftoff
    } else if (jumpPhase < 1.0) {
      return 1.0; // Normal descent start
    } else {
      return 1.5; // Weighted fall
    }
  }

  /**
   * Calculate jump velocity based on character weight
   */
  public calculateJumpVelocity(weight: number, jumpHeight: number = 10): number {
    const g = 18.0; // Bronx Standard gravity
    return Math.sqrt(weight * 2 * jumpHeight * g);
  }

  /**
   * Get current feelability state (for debugging)
   */
  public getState() {
    return {
      hitStopActive: this.hitStopTimer > 0,
      hitStopFrames: this.hitStopTimer,
      screenShakeIntensity: this.screenShakeIntensity,
      inputBufferSize: this.inputBuffer.length,
      coyoteCharacters: Array.from(this.coyoteTimeFrames.keys()),
      config: this.config,
    };
  }

  /**
   * Update system each frame
   */
  public update(): void {
    // Decrement hit-stop
    if (this.hitStopTimer > 0) {
      this.hitStopTimer--;
    }

    // Decrement screen shake
    if (this.screenShakeIntensity > 0) {
      this.screenShakeIntensity *= 0.95; // Fade out
    }

    // Update time-dependent systems
    this.updateCoyoteTime();
    this.updateInputBuffer();
  }

  /**
   * Configure feelability settings
   */
  public configure(partial: Partial<FeelabilityConfig>): void {
    this.config = { ...this.config, ...partial };
    console.log('[Feelability] Configuration updated:', this.config);
  }
}

export const feelabilityEngine = FeelabilityEngine.getInstance();
