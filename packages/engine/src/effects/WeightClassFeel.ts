import { Vector2D } from '@smash-heroes/shared';
import { ScreenEffects } from './ScreenEffects';
import { ParticleSystem } from './ParticleSystem';

/**
 * Omega Protocol: Weight Class Feel System
 * "Heavy hitters should feel like they are tearing the earth;
 * speedsters should move so fast they leave After-Image Shadows"
 * 
 * This system scales impact effects based on character weight
 * Making every weight class feel DISTINCT and POWERFUL
 */
export class WeightClassFeel {
  private screenEffects: ScreenEffects;
  private particleSystem: ParticleSystem;
  
  // Weight class thresholds
  private readonly SUPER_HEAVY = 120;   // Bowser-tier
  private readonly HEAVY = 100;         // Captain Falcon-tier
  private readonly MEDIUM = 80;         // Mario-tier
  private readonly LIGHT = 60;          // Fox-tier
  private readonly FEATHERWEIGHT = 50;  // Pikachu-tier

  constructor(screenEffects: ScreenEffects, particleSystem: ParticleSystem) {
    this.screenEffects = screenEffects;
    this.particleSystem = particleSystem;
  }

  /**
   * Trigger weight-based landing impact
   * Heavy characters create devastating ground impacts
   */
  onLanding(
    position: Vector2D,
    weight: number,
    velocity: number,
    isFastFall: boolean = false
  ): void {
    const impactStrength = this.calculateImpactStrength(weight, velocity, isFastFall);
    
    // Screen shake scales with weight and velocity
    const shakeIntensity = impactStrength * (weight / 100) * 0.8;
    if (shakeIntensity > 2) {
      this.screenEffects.triggerScreenShake(shakeIntensity, 0.15);
    }

    // Dust/debris particles scale with weight
    this.emitLandingParticles(position, weight, impactStrength);

    // Heavy characters create ground cracks
    if (weight >= this.HEAVY && impactStrength > 5) {
      this.emitGroundCrack(position, weight, impactStrength);
    }

    // Super heavy characters cause shockwave on heavy landings
    if (weight >= this.SUPER_HEAVY && impactStrength > 10) {
      this.screenEffects.triggerShockwave(position, impactStrength);
    }
  }

  /**
   * Trigger weight-based attack impact
   * Heavy characters' attacks should feel devastating
   */
  onAttackImpact(
    position: Vector2D,
    attackerWeight: number,
    damage: number,
    hitVelocity: Vector2D
  ): void {
    const weightFactor = attackerWeight / 100;
    const impactForce = damage * weightFactor;

    // Screen shake scales with attacker weight
    const shakeIntensity = (damage * 0.3 + impactForce * 0.2) * weightFactor;
    this.screenEffects.triggerScreenShake(shakeIntensity, 0.2);

    // Impact particles scale with weight
    this.emitImpactParticles(position, attackerWeight, damage, hitVelocity);

    // Heavy hits create more dramatic effects
    if (attackerWeight >= this.HEAVY && damage >= 15) {
      // Add extra particle burst
      this.emitHeavyImpactBurst(position, attackerWeight, damage);
    }

    // Super heavy legendary blows
    if (attackerWeight >= this.SUPER_HEAVY && damage >= 25) {
      this.screenEffects.triggerLegendaryBlow(position, damage, attackerWeight);
    }
  }

  /**
   * Trigger weight-based movement effects
   * Heavy characters should feel like they have MASS
   */
  onMovement(
    position: Vector2D,
    weight: number,
    velocity: Vector2D,
    isRunning: boolean
  ): void {
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // Heavy characters create ground tremors when running
    if (weight >= this.HEAVY && isRunning && speed > 2.0) {
      const tremorIntensity = ((weight - this.HEAVY) / 50) * (speed / 3.0);
      this.screenEffects.triggerScreenShake(tremorIntensity * 0.5, 0.05);
      
      // Dust trails for running heavy characters
      this.emitRunningDust(position, weight, velocity);
    }

    // Super heavy characters leave footprint impacts
    if (weight >= this.SUPER_HEAVY && isRunning) {
      this.emitFootprintImpact(position, weight);
    }
  }

  /**
   * Get weight class category
   */
  getWeightClass(weight: number): WeightClass {
    if (weight >= this.SUPER_HEAVY) return WeightClass.SUPER_HEAVY;
    if (weight >= this.HEAVY) return WeightClass.HEAVY;
    if (weight >= this.MEDIUM) return WeightClass.MEDIUM;
    if (weight >= this.LIGHT) return WeightClass.LIGHT;
    return WeightClass.FEATHERWEIGHT;
  }

  /**
   * Get weight class descriptor for UI/narrative
   */
  getWeightClassDescriptor(weight: number): string {
    const weightClass = this.getWeightClass(weight);
    switch (weightClass) {
      case WeightClass.SUPER_HEAVY:
        return "Tearing the earth with every step";
      case WeightClass.HEAVY:
        return "Devastating impact";
      case WeightClass.MEDIUM:
        return "Balanced force";
      case WeightClass.LIGHT:
        return "Swift and precise";
      case WeightClass.FEATHERWEIGHT:
        return "Lightning incarnate";
    }
  }

  /**
   * Calculate impact strength based on weight and velocity
   */
  private calculateImpactStrength(
    weight: number,
    velocity: number,
    isFastFall: boolean
  ): number {
    const baseImpact = velocity * (weight / 100);
    return isFastFall ? baseImpact * 1.5 : baseImpact;
  }

  /**
   * Emit landing dust/debris particles
   */
  private emitLandingParticles(
    position: Vector2D,
    weight: number,
    impactStrength: number
  ): void {
    const particleCount = Math.floor(10 + (weight / 100) * 15 + impactStrength * 2);
    const spreadRadius = 30 + (weight / 100) * 40;
    
    this.particleSystem.emit({
      position,
      count: particleCount,
      angle: -90, // Upward
      spread: spreadRadius,
      speed: 3,
      speedVariation: 1,
      lifetime: 0.5 + (weight / 200),
      color: 'rgb(139, 90, 43)', // Brown dust
      size: 2 + (weight / 100),
      sizeVariation: 0.5,
    });
  }

  /**
   * Emit ground crack effect for heavy impacts
   */
  private emitGroundCrack(
    position: Vector2D,
    weight: number,
    impactStrength: number
  ): void {
    // Create visual crack extending from impact point
    const crackLength = 50 + (weight / 100) * 50 + impactStrength * 5;
    
    this.particleSystem.emit({
      position,
      count: Math.floor(crackLength / 5),
      angle: 0, // Horizontal
      spread: 180,
      speed: 2,
      speedVariation: 0.5,
      lifetime: 1.5,
      color: 'rgb(60, 60, 60)', // Dark cracks
      size: 1,
      sizeVariation: 0,
    });
  }

  /**
   * Emit impact particles for attacks
   */
  private emitImpactParticles(
    position: Vector2D,
    attackerWeight: number,
    damage: number,
    hitVelocity: Vector2D
  ): void {
    const particleCount = Math.floor(5 + (attackerWeight / 100) * 10 + damage * 0.5);
    const hitAngle = Math.atan2(hitVelocity.y, hitVelocity.x) * (180 / Math.PI);
    
    this.particleSystem.emit({
      position,
      count: particleCount,
      angle: hitAngle,
      spread: 60,
      speed: 4,
      speedVariation: 2,
      lifetime: 0.3 + (attackerWeight / 200),
      color: this.getImpactColorString(damage),
      size: 1.5 + (attackerWeight / 100),
      sizeVariation: 0.5,
    });
  }

  /**
   * Emit extra burst for heavy impacts
   */
  private emitHeavyImpactBurst(
    position: Vector2D,
    attackerWeight: number,
    damage: number
  ): void {
    const burstCount = Math.floor(20 + (attackerWeight / 100) * 15);
    
    this.particleSystem.emit({
      position,
      count: burstCount,
      angle: -90, // Upward
      spread: 360, // Omnidirectional
      speed: 5,
      speedVariation: 2,
      lifetime: 0.6,
      color: 'rgb(255, 200, 100)', // Gold/orange burst
      size: 3,
      sizeVariation: 1,
    });
  }

  /**
   * Emit running dust for heavy characters
   */
  private emitRunningDust(
    position: Vector2D,
    weight: number,
    velocity: Vector2D
  ): void {
    // Dust opposite to movement direction
    const dustAngle = Math.atan2(-velocity.y, -velocity.x) * (180 / Math.PI);
    
    this.particleSystem.emit({
      position,
      count: Math.floor(2 + (weight / 100) * 3),
      angle: dustAngle,
      spread: 30,
      speed: Math.abs(velocity.x) * 0.5,
      speedVariation: 1,
      lifetime: 0.4,
      color: 'rgb(120, 100, 80)',
      size: 1.5 + (weight / 150),
      sizeVariation: 0.3,
    });
  }

  /**
   * Emit footprint impact for super heavy characters
   */
  private emitFootprintImpact(position: Vector2D, weight: number): void {
    this.particleSystem.emit({
      position,
      count: 5,
      angle: 0,
      spread: 20,
      speed: 0.5,
      speedVariation: 0.2,
      lifetime: 0.2,
      color: 'rgb(80, 80, 80)',
      size: 2,
      sizeVariation: 0.5,
    });
  }

  /**
   * Get impact color based on damage (as string)
   */
  private getImpactColorString(damage: number): string {
    if (damage < 10) {
      return 'rgb(255, 255, 255)'; // White - light hits
    } else if (damage < 20) {
      return 'rgb(255, 215, 0)';   // Gold - medium hits
    } else if (damage < 30) {
      return 'rgb(255, 140, 0)';   // Orange - heavy hits
    } else {
      return 'rgb(255, 50, 50)';   // Red - devastating hits
    }
  }
}

/**
 * Weight class categories
 */
export enum WeightClass {
  FEATHERWEIGHT = 'featherweight',  // < 60
  LIGHT = 'light',                  // 60-79
  MEDIUM = 'medium',                // 80-99
  HEAVY = 'heavy',                  // 100-119
  SUPER_HEAVY = 'super_heavy',      // 120+
}
