import { Vector2D, Vec2 } from '@smash-heroes/shared';
import { ParticleSystem, ParticleConfig } from './ParticleSystem';

/**
 * Visual Juice System - Every action needs secondary effects
 * Dust clouds on dash, sparks on parry, trail effects on movement
 */
export class VisualJuiceSystem {
  private particleSystem: ParticleSystem;
  private trailPositions: Map<string, Vector2D[]> = new Map();
  private readonly MAX_TRAIL_LENGTH = 10;

  constructor(particleSystem: ParticleSystem) {
    this.particleSystem = particleSystem;
  }

  /**
   * Emit dust cloud when dashing
   */
  emitDashDust(position: Vector2D, direction: number): void {
    const config: ParticleConfig = {
      position: { ...position },
      count: 8,
      angle: Math.PI + direction, // Opposite to movement direction
      spread: Math.PI / 4,
      speed: 2,
      speedVariation: 1,
      lifetime: 20,
      size: 4,
      sizeVariation: 2,
      color: '#8B7355',
    };
    
    this.particleSystem.emit(config);
  }

  /**
   * Emit sparks on parry
   */
  emitParrySparks(position: Vector2D): void {
    const config: ParticleConfig = {
      position: { ...position },
      count: 15,
      angle: 0,
      spread: Math.PI * 2, // Full circle
      speed: 4,
      speedVariation: 2,
      lifetime: 15,
      size: 2,
      sizeVariation: 1,
      color: '#FFD700', // Gold sparks
    };
    
    this.particleSystem.emit(config);
  }

  /**
   * Emit impact particles on hit
   */
  emitImpactEffect(position: Vector2D, damage: number, knockbackAngle: number): void {
    const particleCount = Math.min(5 + Math.floor(damage / 2), 30);
    
    const config: ParticleConfig = {
      position: { ...position },
      count: particleCount,
      angle: knockbackAngle,
      spread: Math.PI / 3,
      speed: 3 + damage * 0.1,
      speedVariation: 2,
      lifetime: 25,
      size: 3,
      sizeVariation: 2,
      color: this.getImpactColor(damage),
    };
    
    this.particleSystem.emit(config);
  }

  /**
   * Emit landing dust when landing on ground
   */
  emitLandingDust(position: Vector2D, impactSpeed: number): void {
    const intensity = Math.min(impactSpeed / 5, 2);
    const particleCount = Math.floor(5 + intensity * 5);
    
    const config: ParticleConfig = {
      position: { ...position },
      count: particleCount,
      angle: -Math.PI / 2, // Upward
      spread: Math.PI / 2,
      speed: 1 + intensity,
      speedVariation: 1,
      lifetime: 20,
      size: 3,
      sizeVariation: 2,
      color: '#A0826D',
    };
    
    this.particleSystem.emit(config);
  }

  /**
   * Emit jump dust when jumping
   */
  emitJumpDust(position: Vector2D): void {
    const config: ParticleConfig = {
      position: { ...position },
      count: 6,
      angle: Math.PI / 2, // Downward
      spread: Math.PI / 3,
      speed: 1.5,
      speedVariation: 0.5,
      lifetime: 15,
      size: 3,
      sizeVariation: 1,
      color: '#8B7355',
    };
    
    this.particleSystem.emit(config);
  }

  /**
   * Emit charge-up effect particles
   */
  emitChargeEffect(position: Vector2D, chargeLevel: number): void {
    const config: ParticleConfig = {
      position: { ...position },
      count: 3,
      angle: -Math.PI / 2,
      spread: Math.PI / 6,
      speed: 1,
      speedVariation: 0.5,
      lifetime: 30,
      size: 2 + chargeLevel * 0.5,
      sizeVariation: 1,
      color: this.getChargeColor(chargeLevel),
    };
    
    this.particleSystem.emit(config);
  }

  /**
   * Emit aura particles for powered-up states
   */
  emitAuraEffect(position: Vector2D, auraColor: string): void {
    const config: ParticleConfig = {
      position: { ...position },
      count: 2,
      angle: 0,
      spread: Math.PI * 2,
      speed: 0.5,
      speedVariation: 0.3,
      lifetime: 40,
      size: 4,
      sizeVariation: 2,
      color: auraColor,
    };
    
    this.particleSystem.emit(config);
  }

  /**
   * Update trail for movement-based effects
   */
  updateTrail(entityId: string, position: Vector2D, speed: number): void {
    let trail = this.trailPositions.get(entityId);
    
    if (!trail) {
      trail = [];
      this.trailPositions.set(entityId, trail);
    }

    // Add new position
    trail.push({ ...position });

    // Trim trail to max length
    if (trail.length > this.MAX_TRAIL_LENGTH) {
      trail.shift();
    }

    // Emit trail particles if moving fast enough
    if (speed > 5 && trail.length > 1) {
      this.emitTrailEffect(position);
    }
  }

  /**
   * Emit trail effect particles
   */
  private emitTrailEffect(position: Vector2D): void {
    const config: ParticleConfig = {
      position: { ...position },
      count: 1,
      angle: 0,
      spread: 0,
      speed: 0,
      speedVariation: 0,
      lifetime: 10,
      size: 3,
      sizeVariation: 1,
      color: '#4A90E2',
    };
    
    this.particleSystem.emit(config);
  }

  /**
   * Get trail positions for rendering
   */
  getTrail(entityId: string): ReadonlyArray<Vector2D> {
    return this.trailPositions.get(entityId) ?? [];
  }

  /**
   * Clear trail for an entity
   */
  clearTrail(entityId: string): void {
    this.trailPositions.delete(entityId);
  }

  /**
   * Get impact color based on damage
   */
  private getImpactColor(damage: number): string {
    if (damage < 10) return '#FFFFFF';  // White for light hits
    if (damage < 20) return '#FFD700';  // Gold for medium hits
    if (damage < 30) return '#FF6B35';  // Orange for heavy hits
    return '#FF0000';                    // Red for very heavy hits
  }

  /**
   * Get charge color based on charge level
   */
  private getChargeColor(chargeLevel: number): string {
    if (chargeLevel < 0.33) return '#4A90E2';  // Blue
    if (chargeLevel < 0.66) return '#FFD700';  // Gold
    return '#FF0000';                           // Red (full charge)
  }

  /**
   * Clear all trails
   */
  clearAll(): void {
    this.trailPositions.clear();
  }
}
