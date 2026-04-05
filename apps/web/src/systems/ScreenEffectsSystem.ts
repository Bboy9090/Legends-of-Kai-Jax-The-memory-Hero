/**
 * ⚡ SCREEN EFFECTS SYSTEM ⚡
 * God-Tier Visual Effects Engine for Legends of Kai-Jax
 * 
 * Features:
 * - Camera shake with intensity control
 * - Screen flash with color tinting
 * - Chromatic aberration effect
 * - Speed lines for transformation
 * - Slow motion / time dilation
 * - Impact freeze frames
 * - Legendary particle bursts
 */

import * as THREE from 'three';
import { EventBus } from '@game/core/EventBus';

// Effect types
export interface ShakeConfig {
  intensity: number;
  duration: number;
  decay?: boolean;
}

export interface FlashConfig {
  color: number;
  intensity: number;
  duration: number;
}

export interface ChromaticConfig {
  intensity: number;
  duration: number;
}

export interface SlowMotionConfig {
  factor: number;
  duration: number;
}

export interface FreezeFrameConfig {
  duration: number;
  brightness: number;
}

export class ScreenEffectsSystem {
  private eventBus: EventBus;
  private camera: THREE.PerspectiveCamera;
  private cameraBasePosition: THREE.Vector3;
  private scene: THREE.Scene;

  // Active effects
  private shakeConfig: ShakeConfig | null = null;
  private shakeTime: number = 0;
  private flashOverlay: HTMLDivElement | null = null;
  private chromaticOverlay: HTMLDivElement | null = null;
  private speedLinesOverlay: HTMLDivElement | null = null;
  private slowMotionFactor: number = 1.0;
  private slowMotionDuration: number = 0;
  private freezeFrameActive: boolean = false;
  private freezeFrameDuration: number = 0;

  // Particle system
  private particleSystems: THREE.Points[] = [];
  private particleGeometries: THREE.BufferGeometry[] = [];
  private particleMaterials: THREE.PointsMaterial[] = [];

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, eventBus: EventBus) {
    this.scene = scene;
    this.camera = camera;
    this.cameraBasePosition = camera.position.clone();
    this.eventBus = eventBus;

    this.setupEventListeners();
    this.createOverlays();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('screen:shake', this.triggerShake.bind(this));
    this.eventBus.subscribe('screen:flash', this.triggerFlash.bind(this));
    this.eventBus.subscribe('screen:chromaticAberration', this.triggerChromatic.bind(this));
    this.eventBus.subscribe('screen:speedLines', this.triggerSpeedLines.bind(this));
    this.eventBus.subscribe('time:slowMotion', this.triggerSlowMotion.bind(this));
    this.eventBus.subscribe('screen:freezeFrame', this.triggerFreezeFrame.bind(this));
    this.eventBus.subscribe('particles:burst', this.triggerParticleBurst.bind(this));
    this.eventBus.subscribe('transformation:started', this.handleTransformationStart.bind(this));
    this.eventBus.subscribe('ultimate:started', this.handleUltimateStart.bind(this));
  }

  /**
   * Create HTML overlays for screen effects
   */
  private createOverlays(): void {
    // Flash overlay
    this.flashOverlay = document.createElement('div');
    this.flashOverlay.id = 'screen-flash-overlay';
    this.flashOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.1s ease-out;
    `;
    document.body.appendChild(this.flashOverlay);

    // Chromatic aberration overlay
    this.chromaticOverlay = document.createElement('div');
    this.chromaticOverlay.id = 'screen-chromatic-overlay';
    this.chromaticOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9998;
      opacity: 0;
    `;
    document.body.appendChild(this.chromaticOverlay);

    // Speed lines overlay
    this.speedLinesOverlay = document.createElement('div');
    this.speedLinesOverlay.id = 'screen-speed-lines';
    this.speedLinesOverlay.className = 'speed-lines';
    this.speedLinesOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9997;
      opacity: 0;
    `;
    document.body.appendChild(this.speedLinesOverlay);
  }

  /**
   * Trigger camera shake
   */
  public triggerShake(config: ShakeConfig): void {
    this.shakeConfig = config;
    this.shakeTime = 0;
  }

  /**
   * Trigger screen flash
   */
  public triggerFlash(config: FlashConfig): void {
    if (!this.flashOverlay) return;

    const color = new THREE.Color(config.color);
    this.flashOverlay.style.backgroundColor = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, ${config.intensity})`;
    this.flashOverlay.style.opacity = '1';

    setTimeout(() => {
      if (this.flashOverlay) {
        this.flashOverlay.style.opacity = '0';
      }
    }, config.duration * 1000);
  }

  /**
   * Trigger chromatic aberration
   */
  public triggerChromatic(config: ChromaticConfig): void {
    if (!this.chromaticOverlay) return;

    // Apply chromatic aberration class to body
    document.body.classList.add('chromatic-aberration');
    this.chromaticOverlay.style.opacity = '1';

    setTimeout(() => {
      document.body.classList.remove('chromatic-aberration');
      if (this.chromaticOverlay) {
        this.chromaticOverlay.style.opacity = '0';
      }
    }, config.duration * 1000);
  }

  /**
   * Trigger speed lines
   */
  public triggerSpeedLines(config: { duration: number; intensity: number }): void {
    if (!this.speedLinesOverlay) return;

    this.speedLinesOverlay.style.opacity = String(config.intensity);

    setTimeout(() => {
      if (this.speedLinesOverlay) {
        this.speedLinesOverlay.style.opacity = '0';
      }
    }, config.duration * 1000);
  }

  /**
   * Trigger slow motion
   */
  public triggerSlowMotion(config: SlowMotionConfig): void {
    this.slowMotionFactor = config.factor;
    this.slowMotionDuration = config.duration;

    this.eventBus.emit('time:factorChanged', {
      factor: config.factor,
    });
  }

  /**
   * Trigger freeze frame (hit-stop)
   */
  public triggerFreezeFrame(config: FreezeFrameConfig): void {
    this.freezeFrameActive = true;
    this.freezeFrameDuration = config.duration;

    // Add impact class to body
    document.body.classList.add('impact-freeze');

    setTimeout(() => {
      this.freezeFrameActive = false;
      document.body.classList.remove('impact-freeze');
    }, config.duration * 1000);
  }

  /**
   * Trigger particle burst
   */
  public triggerParticleBurst(config: {
    position: THREE.Vector3;
    color: number;
    count: number;
    size: number;
    speed: number;
    lifetime: number;
  }): void {
    const { position, color, count, size, speed, lifetime } = config;

    // Create particle geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = position.x;
      positions[i3 + 1] = position.y;
      positions[i3 + 2] = position.z;

      // Random velocity in sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = speed * Math.random();
      velocities[i3] = r * Math.sin(phi) * Math.cos(theta);
      velocities[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      velocities[i3 + 2] = r * Math.cos(phi);

      lifetimes[i] = lifetime;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    // Create material
    const material = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create points
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    this.particleSystems.push(particles);
    this.particleGeometries.push(geometry);
    this.particleMaterials.push(material);

    // Remove after lifetime
    setTimeout(() => {
      this.removeParticleSystem(particles);
    }, lifetime * 1000);
  }

  /**
   * Handle transformation start
   */
  private handleTransformationStart(data: {
    characterId: string;
    fromTier: number;
    toTier: number;
  }): void {
    const { toTier } = data;

    // Intensity based on tier
    const intensity = 0.05 + toTier * 0.03;
    const flashColor = toTier >= 4 ? 0xffffff : toTier >= 3 ? 0x00d9ff : toTier >= 2 ? 0xffd700 : 0xc084fc;

    // Screen shake
    this.triggerShake({
      intensity,
      duration: 1.5,
      decay: true,
    });

    // Screen flash
    this.triggerFlash({
      color: flashColor,
      intensity: toTier >= 4 ? 1.0 : 0.5,
      duration: 0.3,
    });

    // Speed lines for high tiers
    if (toTier >= 3) {
      this.triggerSpeedLines({
        duration: 1.0,
        intensity: 0.5,
      });
    }

    // Chromatic aberration for god tier
    if (toTier >= 4) {
      this.triggerChromatic({
        intensity: 0.1,
        duration: 2.0,
      });
    }
  }

  /**
   * Handle ultimate start
   */
  private handleUltimateStart(data: {
    characterId: string;
    move: { effects: any };
  }): void {
    const { effects } = data.move;

    // Apply all effects from ultimate move config
    if (effects.screenFlash) {
      this.triggerFlash({
        color: 0xffffff,
        intensity: 1.0,
        duration: 0.5,
      });
    }

    if (effects.screenShake) {
      this.triggerShake({
        intensity: effects.screenShake,
        duration: 2.0,
        decay: true,
      });
    }

    if (effects.slowMotion) {
      this.triggerSlowMotion({
        factor: 0.2,
        duration: 1.5,
      });
    }

    if (effects.chromaticAberration) {
      this.triggerChromatic({
        intensity: 0.15,
        duration: 2.5,
      });
    }

    // Always add speed lines for ultimate
    this.triggerSpeedLines({
      duration: 2.0,
      intensity: 0.7,
    });
  }

  /**
   * Remove particle system
   */
  private removeParticleSystem(particles: THREE.Points): void {
    const index = this.particleSystems.indexOf(particles);
    if (index !== -1) {
      this.scene.remove(particles);
      this.particleGeometries[index].dispose();
      this.particleMaterials[index].dispose();
      this.particleSystems.splice(index, 1);
      this.particleGeometries.splice(index, 1);
      this.particleMaterials.splice(index, 1);
    }
  }

  /**
   * Update screen effects (call in game loop)
   */
  public update(deltaTime: number): number {
    // Apply slow motion to delta time
    let effectiveDelta = deltaTime;
    if (this.slowMotionDuration > 0) {
      effectiveDelta *= this.slowMotionFactor;
      this.slowMotionDuration -= deltaTime * 1000;

      if (this.slowMotionDuration <= 0) {
        this.slowMotionFactor = 1.0;
        this.eventBus.emit('time:factorChanged', { factor: 1.0 });
      }
    }

    // Skip updates during freeze frame
    if (this.freezeFrameActive) {
      return 0;
    }

    // Update camera shake
    if (this.shakeConfig) {
      this.shakeTime += deltaTime;
      const progress = this.shakeTime / this.shakeConfig.duration;

      if (progress >= 1) {
        // Shake complete
        this.camera.position.copy(this.cameraBasePosition);
        this.shakeConfig = null;
      } else {
        // Apply shake
        let intensity = this.shakeConfig.intensity;
        if (this.shakeConfig.decay) {
          intensity *= (1 - progress);
        }

        const shakeX = (Math.random() - 0.5) * 2 * intensity;
        const shakeY = (Math.random() - 0.5) * 2 * intensity;
        const shakeZ = (Math.random() - 0.5) * intensity;

        this.camera.position.set(
          this.cameraBasePosition.x + shakeX,
          this.cameraBasePosition.y + shakeY,
          this.cameraBasePosition.z + shakeZ
        );
      }
    }

    // Update particle systems
    this.particleSystems.forEach((particles) => {
      const positions = particles.geometry.attributes.position as THREE.BufferAttribute;
      const velocities = particles.geometry.attributes.velocity as THREE.BufferAttribute;
      const lifetimes = particles.geometry.attributes.lifetime as THREE.BufferAttribute;
      const material = particles.material as THREE.PointsMaterial;

      // Update positions based on velocity
      for (let i = 0; i < positions.count; i++) {
        const i3 = i * 3;
        positions.array[i3] += velocities.array[i3] * effectiveDelta;
        positions.array[i3 + 1] += velocities.array[i3 + 1] * effectiveDelta;
        positions.array[i3 + 2] += velocities.array[i3 + 2] * effectiveDelta;

        // Apply gravity
        velocities.array[i3 + 1] -= 9.8 * effectiveDelta;

        // Update lifetime
        lifetimes.array[i] -= effectiveDelta;
      }

      positions.needsUpdate = true;
      velocities.needsUpdate = true;
      lifetimes.needsUpdate = true;

      // Fade out
      const avgLifetime = Array.from(lifetimes.array).reduce((a, b) => a + b, 0) / lifetimes.count;
      material.opacity = Math.max(0, avgLifetime);
    });

    return effectiveDelta;
  }

  /**
   * Set camera base position
   */
  public setCameraBasePosition(position: THREE.Vector3): void {
    this.cameraBasePosition.copy(position);
  }

  /**
   * Get current time factor (for slow motion)
   */
  public getTimeFactor(): number {
    return this.slowMotionFactor;
  }

  /**
   * Check if freeze frame is active
   */
  public isFrozen(): boolean {
    return this.freezeFrameActive;
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    // Remove overlays
    this.flashOverlay?.remove();
    this.chromaticOverlay?.remove();
    this.speedLinesOverlay?.remove();

    // Remove particle systems
    this.particleSystems.forEach((particles) => {
      this.scene.remove(particles);
    });
    this.particleGeometries.forEach((g) => g.dispose());
    this.particleMaterials.forEach((m) => m.dispose());

    // Reset state
    this.particleSystems = [];
    this.particleGeometries = [];
    this.particleMaterials = [];
    this.shakeConfig = null;
    this.slowMotionFactor = 1.0;
    this.freezeFrameActive = false;
  }
}

export default ScreenEffectsSystem;
