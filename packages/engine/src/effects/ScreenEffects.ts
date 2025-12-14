import { Vector2D } from '@smash-heroes/shared';
import { COMBAT_CONSTANTS } from '@smash-heroes/shared';

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

  getShakeOffset(): Vector2D {
    return { ...this.shakeOffset };
  }

  getTimeScale(): number {
    return this.slowMotionActive ? this.slowMotionScale : 1.0;
  }

  isHitlagActive(): boolean {
    return this.hitlagActive;
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
  }
}
