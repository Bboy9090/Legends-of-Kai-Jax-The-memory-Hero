import { Vector2D } from '@smash-heroes/shared';

/**
 * Omega Protocol: After-Image Shadow System
 * "Speedsters should move so fast they leave 'After-Image Shadows'"
 * 
 * Creates ghost trails and motion blur for high-speed movement
 * Making speed feel LEGENDARY
 */
export class AfterImageSystem {
  private afterImages = new Map<string, AfterImageTrail[]>();
  private speedThresholds = new Map<string, SpeedThresholdConfig>();

  /**
   * Register an entity for after-image tracking
   */
  registerEntity(
    entityId: string,
    config?: SpeedThresholdConfig
  ): void {
    this.afterImages.set(entityId, []);
    this.speedThresholds.set(entityId, config || {
      minSpeed: 3.0,              // Minimum speed to create after-images
      maxAfterImages: 8,          // Maximum number of simultaneous after-images
      afterImageInterval: 0.03,   // Time between after-images (seconds)
      afterImageLifetime: 0.3,    // How long each after-image persists (seconds)
      fadeRate: 2.5,              // How fast after-images fade (alpha per second)
      blurIntensity: 1.0,         // Motion blur intensity
      trailColor: { r: 100, g: 150, b: 255 }, // Default blue trail
    });
  }

  /**
   * Update entity position and create after-images if moving fast enough
   */
  update(
    entityId: string,
    position: Vector2D,
    velocity: Vector2D,
    facing: 'left' | 'right',
    deltaTime: number,
    spriteData?: SpriteData
  ): void {
    const images = this.afterImages.get(entityId);
    const config = this.speedThresholds.get(entityId);
    
    if (!images || !config) return;

    // Calculate speed magnitude
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    // Check if moving fast enough to create after-images
    if (speed >= config.minSpeed) {
      // Find if we need to create a new after-image
      const lastImage = images[images.length - 1];
      const shouldCreateNew = !lastImage || 
        (lastImage.timeSinceCreation >= config.afterImageInterval);

      if (shouldCreateNew && images.length < config.maxAfterImages) {
        // Create new after-image
        const intensity = Math.min((speed - config.minSpeed) / config.minSpeed, 1.0);
        
        images.push({
          position: { ...position },
          alpha: 0.6 * intensity,
          lifetime: config.afterImageLifetime,
          timeSinceCreation: 0,
          facing,
          velocity: { ...velocity },
          spriteData: spriteData ? { ...spriteData } : undefined,
          color: config.trailColor,
          scale: 1.0,
        });
      }
    }

    // Update existing after-images
    for (let i = images.length - 1; i >= 0; i--) {
      const image = images[i];
      if (!image) continue; // Type guard
      
      image.timeSinceCreation += deltaTime;
      image.alpha -= config.fadeRate * deltaTime;
      
      // Shrink slightly as they fade
      image.scale = 0.8 + (image.alpha * 0.2);

      // Remove dead after-images
      if (image.alpha <= 0 || image.timeSinceCreation >= image.lifetime) {
        images.splice(i, 1);
      }
    }
  }

  /**
   * Get all after-images for rendering
   */
  getAfterImages(entityId: string): AfterImageTrail[] {
    return this.afterImages.get(entityId) || [];
  }

  /**
   * Get motion blur intensity based on speed
   */
  getMotionBlur(entityId: string, velocity: Vector2D): MotionBlurData {
    const config = this.speedThresholds.get(entityId);
    if (!config) {
      return { intensity: 0, direction: { x: 0, y: 0 } };
    }

    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    if (speed < config.minSpeed) {
      return { intensity: 0, direction: { x: 0, y: 0 } };
    }

    // Blur intensity increases with speed
    const intensity = Math.min(
      (speed - config.minSpeed) / (config.minSpeed * 2),
      1.0
    ) * config.blurIntensity;

    // Blur direction is opposite to movement
    const magnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    const direction = {
      x: velocity.x / magnitude,
      y: velocity.y / magnitude,
    };

    return { intensity, direction };
  }

  /**
   * Update configuration for an entity
   */
  updateConfig(entityId: string, config: Partial<SpeedThresholdConfig>): void {
    const existing = this.speedThresholds.get(entityId);
    if (existing) {
      this.speedThresholds.set(entityId, { ...existing, ...config });
    }
  }

  /**
   * Clear after-images for an entity
   */
  clear(entityId: string): void {
    const images = this.afterImages.get(entityId);
    if (images) {
      images.length = 0;
    }
  }

  /**
   * Clear all after-images
   */
  clearAll(): void {
    for (const images of this.afterImages.values()) {
      images.length = 0;
    }
  }

  /**
   * Remove entity tracking
   */
  unregisterEntity(entityId: string): void {
    this.afterImages.delete(entityId);
    this.speedThresholds.delete(entityId);
  }

  /**
   * Check if entity is moving fast enough for after-images
   */
  isSpeedsterMode(entityId: string, velocity: Vector2D): boolean {
    const config = this.speedThresholds.get(entityId);
    if (!config) return false;

    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    return speed >= config.minSpeed;
  }

  /**
   * Get speed as a percentage above threshold (for UI/effects)
   */
  getSpeedIntensity(entityId: string, velocity: Vector2D): number {
    const config = this.speedThresholds.get(entityId);
    if (!config) return 0;

    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (speed < config.minSpeed) return 0;

    return Math.min((speed - config.minSpeed) / config.minSpeed, 1.0);
  }
}

/**
 * Configuration for after-image thresholds
 */
export interface SpeedThresholdConfig {
  minSpeed: number;              // Minimum speed to trigger after-images
  maxAfterImages: number;        // Maximum simultaneous after-images
  afterImageInterval: number;    // Time between creating after-images
  afterImageLifetime: number;    // How long each after-image lasts
  fadeRate: number;              // Fade speed (alpha per second)
  blurIntensity: number;         // Motion blur strength
  trailColor: { r: number; g: number; b: number }; // Color tint for after-images
}

/**
 * After-image trail data
 */
export interface AfterImageTrail {
  position: Vector2D;
  alpha: number;
  lifetime: number;
  timeSinceCreation: number;
  facing: 'left' | 'right';
  velocity: Vector2D;
  spriteData?: SpriteData;
  color: { r: number; g: number; b: number };
  scale: number;
}

/**
 * Sprite data for rendering after-images
 */
export interface SpriteData {
  spriteIndex: number;
  animationFrame: number;
  animationName: string;
}

/**
 * Motion blur effect data
 */
export interface MotionBlurData {
  intensity: number;         // 0-1, how strong the blur is
  direction: Vector2D;       // Normalized direction of blur
}
