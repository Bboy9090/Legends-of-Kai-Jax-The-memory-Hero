import { Vector2D } from '@smash-heroes/shared';
import { COMBAT_CONSTANTS } from '@smash-heroes/shared';

/**
 * Enhanced ScreenEffects - Omega Protocol Compliance
 * "Combat Crunch": Dynamic Hit-Stop with desaturation, shockwaves, and screen flash
 * Making every "Legendary Blow" feel like a world-ending impact
 */
export class ScreenEffects {
  private shakeIntensity = 0;
  private shakeDuration = 0;
  private shakeTimer = 0;
  private shakeOffset: Vector2D = { x: 0, y: 0 };
  
  private slowMotionActive = false;
  private slowMotionTimer = 0;
  private slowMotionScale = 1.0;

  private hitlagActive = false;
  private hitlagFrames = 0;

  // Omega Protocol: Screen desaturation for legendary blows
  private desaturationAmount = 0;
  private desaturationTimer = 0;
  private desaturationDuration = 0;

  // Omega Protocol: Screen flash for critical hits
  private flashIntensity = 0;
  private flashTimer = 0;
  private flashDuration = 0;
  private flashColor = { r: 255, g: 255, b: 255 };

  // Omega Protocol: Shockwave ripple data
  private shockwaves: Shockwave[] = [];

  update(deltaTime: number): void {
    // Update screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= deltaTime;
      
      const progress = 1 - (this.shakeTimer / this.shakeDuration);
      const currentIntensity = this.shakeIntensity * (1 - progress);
      
      this.shakeOffset = {
        x: (Math.random() - 0.5) * currentIntensity * 2,
        y: (Math.random() - 0.5) * currentIntensity * 2,
      };

      if (this.shakeTimer <= 0) {
        this.shakeOffset = { x: 0, y: 0 };
      }
    }

    // Update slow motion
    if (this.slowMotionTimer > 0) {
      this.slowMotionTimer -= deltaTime;
      if (this.slowMotionTimer <= 0) {
        this.slowMotionActive = false;
        this.slowMotionScale = 1.0;
      }
    }

    // Update hitlag
    if (this.hitlagFrames > 0) {
      this.hitlagFrames--;
      if (this.hitlagFrames <= 0) {
        this.hitlagActive = false;
      }
    }

    // Omega Protocol: Update desaturation
    if (this.desaturationTimer > 0) {
      this.desaturationTimer -= deltaTime;
      const progress = this.desaturationTimer / this.desaturationDuration;
      this.desaturationAmount = progress;
      
      if (this.desaturationTimer <= 0) {
        this.desaturationAmount = 0;
      }
    }

    // Omega Protocol: Update screen flash
    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime;
      const progress = this.flashTimer / this.flashDuration;
      this.flashIntensity = progress;
      
      if (this.flashTimer <= 0) {
        this.flashIntensity = 0;
      }
    }

    // Omega Protocol: Update shockwaves
    this.shockwaves = this.shockwaves.filter(wave => {
      wave.radius += wave.speed * deltaTime;
      wave.alpha -= wave.fadeRate * deltaTime;
      return wave.alpha > 0 && wave.radius < wave.maxRadius;
    });
  }

  triggerScreenShake(intensity: number, duration?: number): void {
    this.shakeIntensity = intensity * COMBAT_CONSTANTS.SCREEN_SHAKE_INTENSITY_MULTIPLIER;
    this.shakeDuration = duration ?? COMBAT_CONSTANTS.SCREEN_SHAKE_DURATION_BASE;
    this.shakeTimer = this.shakeDuration;
  }

  triggerSlowMotion(duration?: number, scale?: number): void {
    this.slowMotionActive = true;
    this.slowMotionTimer = duration ?? COMBAT_CONSTANTS.SLOW_MOTION_DURATION;
    this.slowMotionScale = scale ?? COMBAT_CONSTANTS.SLOW_MOTION_SCALE;
  }

  triggerHitlag(frames: number): void {
    this.hitlagActive = true;
    this.hitlagFrames = frames;
  }

  /**
   * Omega Protocol: Trigger "Legendary Blow" effect
   * - 0.08 second freeze (approximately 5 frames at 60fps)
   * - Screen desaturation
   * - Shockwave ripple
   * Called for high-damage attacks that deserve cinematic impact
   */
  triggerLegendaryBlow(position: Vector2D, damage: number, weight: number = 100): void {
    // Legendary threshold: 30+ damage or 150+ knockback-equivalent
    const isLegendary = damage >= 30;
    
    if (isLegendary) {
      // Freeze frame for exactly 0.08 seconds (5 frames at 60fps)
      this.triggerHitlag(5);
      
      // Desaturate screen for dramatic effect
      this.triggerDesaturation(0.7, 0.15); // 70% desaturation for 0.15s
      
      // Create expanding shockwave ripple
      this.triggerShockwave(position, damage);
      
      // Screen shake scaled by damage and weight
      const shakeIntensity = Math.min(damage * 0.5, 20) * (weight / 100);
      this.triggerScreenShake(shakeIntensity, 0.3);
      
      // Optional: Flash for ultra-heavy hits
      if (damage >= 50) {
        this.triggerFlash({ r: 255, g: 200, b: 100 }, 0.5, 0.1);
      }
    }
  }

  /**
   * Omega Protocol: Screen desaturation effect
   * Makes legendary blows feel like time stops
   */
  triggerDesaturation(amount: number, duration: number): void {
    this.desaturationAmount = Math.min(amount, 1.0);
    this.desaturationDuration = duration;
    this.desaturationTimer = duration;
  }

  /**
   * Omega Protocol: Screen flash effect
   * For critical hits and finishers
   */
  triggerFlash(color: { r: number; g: number; b: number }, intensity: number, duration: number): void {
    this.flashColor = color;
    this.flashIntensity = Math.min(intensity, 1.0);
    this.flashDuration = duration;
    this.flashTimer = duration;
  }

  /**
   * Omega Protocol: Shockwave ripple effect
   * Expands from impact point through environment
   */
  triggerShockwave(position: Vector2D, damage: number): void {
    const maxRadius = Math.min(300 + damage * 5, 800);
    const speed = 600 + damage * 10; // Faster for bigger hits
    
    this.shockwaves.push({
      position: { ...position },
      radius: 0,
      maxRadius,
      speed,
      alpha: 0.8,
      fadeRate: 4.0,
      thickness: 3 + damage * 0.1,
    });
  }

  getShakeOffset(): Vector2D {
    return { ...this.shakeOffset };
  }

  getTimeScale(): number {
    return this.slowMotionActive ? this.slowMotionScale : 1.0;
  }

  isHitlagActive(): boolean {
    return this.hitlagActive;
  }

  /**
   * Get current desaturation amount (0-1)
   * For rendering: reduce color saturation based on this value
   */
  getDesaturation(): number {
    return this.desaturationAmount;
  }

  /**
   * Get current flash effect
   * For rendering: overlay this color at specified intensity
   */
  getFlash(): { color: { r: number; g: number; b: number }; intensity: number } {
    return {
      color: this.flashColor,
      intensity: this.flashIntensity,
    };
  }

  /**
   * Get all active shockwaves for rendering
   */
  getShockwaves(): Shockwave[] {
    return [...this.shockwaves];
  }

  reset(): void {
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.shakeOffset = { x: 0, y: 0 };
    this.slowMotionActive = false;
    this.slowMotionTimer = 0;
    this.slowMotionScale = 1.0;
    this.hitlagActive = false;
    this.hitlagFrames = 0;
    this.desaturationAmount = 0;
    this.desaturationTimer = 0;
    this.desaturationDuration = 0;
    this.flashIntensity = 0;
    this.flashTimer = 0;
    this.flashDuration = 0;
    this.shockwaves = [];
  }
}

/**
 * Omega Protocol: Shockwave data structure
 * Represents an expanding ripple through the environment
 */
export interface Shockwave {
  position: Vector2D;
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  fadeRate: number;
  thickness: number;
}
