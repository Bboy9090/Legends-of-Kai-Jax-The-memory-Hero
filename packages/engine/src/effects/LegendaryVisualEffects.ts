/**
 * LEGENDARY VISUAL EFFECTS SYSTEM - BEYOND BEYOND LEGENDARY
 * 
 * World-class visual effects including:
 * - Enhanced particle systems
 * - Screen effects (shake, flash, chromatic aberration)
 * - Hit effects and feedback
 * - Combo visualizations
 * - Meter visualizations
 * - Cinematic effects
 */

import * as THREE from 'three';
import { LEGENDARY_COMBAT_CONSTANTS } from '@beast-kin/shared';

export interface ScreenShake {
  intensity: number;
  duration: number;
  frequency: number;
  startTime: number;
  direction: THREE.Vector3;
}

export interface ScreenFlash {
  color: string;
  intensity: number;
  duration: number;
  startTime: number;
}

export interface HitEffect {
  position: THREE.Vector3;
  type: 'hit' | 'crit' | 'perfect_dodge' | 'perfect_parry' | 'combo';
  particleCount: number;
  color: string;
  size: number;
  duration: number;
  startTime: number;
}

export interface ComboVisualization {
  hits: number;
  tier: string | null;
  color: string;
  position: THREE.Vector2;
  scale: number;
  duration: number;
  startTime: number;
}

export class LegendaryVisualEffects {
  private screenShakes: ScreenShake[] = [];
  private screenFlashes: ScreenFlash[] = [];
  private hitEffects: HitEffect[] = [];
  private comboVisualizations: ComboVisualization[] = [];
  private currentTime: number = 0;

  /**
   * Update all effects (call every frame)
   */
  update(deltaTime: number): void {
    this.currentTime = performance.now();
    
    // Update screen shakes
    this.screenShakes = this.screenShakes.filter(shake => {
      return (this.currentTime - shake.startTime) < shake.duration;
    });
    
    // Update screen flashes
    this.screenFlashes = this.screenFlashes.filter(flash => {
      return (this.currentTime - flash.startTime) < flash.duration;
    });
    
    // Update hit effects
    this.hitEffects = this.hitEffects.filter(effect => {
      return (this.currentTime - effect.startTime) < effect.duration;
    });
    
    // Update combo visualizations
    this.comboVisualizations = this.comboVisualizations.filter(viz => {
      return (this.currentTime - viz.startTime) < viz.duration;
    });
  }

  /**
   * Trigger screen shake
   */
  triggerScreenShake(intensity: number, duration?: number, damage?: number): void {
    const shake: ScreenShake = {
      intensity: intensity * LEGENDARY_COMBAT_CONSTANTS.SCREEN_EFFECTS.SHAKE.INTENSITY_MULTIPLIER,
      duration: duration ?? (LEGENDARY_COMBAT_CONSTANTS.SCREEN_EFFECTS.SHAKE.DURATION_BASE + 
        (damage ?? 0) * LEGENDARY_COMBAT_CONSTANTS.SCREEN_EFFECTS.SHAKE.DURATION_PER_DAMAGE),
      frequency: LEGENDARY_COMBAT_CONSTANTS.SCREEN_EFFECTS.SHAKE.FREQUENCY,
      startTime: this.currentTime,
      direction: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        0
      ).normalize(),
    };
    
    this.screenShakes.push(shake);
  }

  /**
   * Trigger screen flash
   */
  triggerScreenFlash(color?: string, intensity?: number): void {
    const flash: ScreenFlash = {
      color: color ?? LEGENDARY_COMBAT_CONSTANTS.SCREEN_EFFECTS.FLASH.COLOR,
      intensity: intensity ?? LEGENDARY_COMBAT_CONSTANTS.SCREEN_EFFECTS.FLASH.INTENSITY,
      duration: LEGENDARY_COMBAT_CONSTANTS.SCREEN_EFFECTS.FLASH.DURATION,
      startTime: this.currentTime,
    };
    
    this.screenFlashes.push(flash);
  }

  /**
   * Trigger hit effect
   */
  triggerHitEffect(
    position: THREE.Vector3,
    type: 'hit' | 'crit' | 'perfect_dodge' | 'perfect_parry' | 'combo'
  ): void {
    const config = this.getHitEffectConfig(type);
    
    const effect: HitEffect = {
      position: position.clone(),
      type,
      particleCount: config.count,
      color: config.color,
      size: config.size,
      duration: config.life * 1000, // Convert to ms
      startTime: this.currentTime,
    };
    
    this.hitEffects.push(effect);
  }

  /**
   * Trigger combo visualization
   */
  triggerComboVisualization(hits: number, tier: string | null): void {
    const color = this.getComboColor(hits);
    const scale = 1.0 + (hits / 100); // Scale grows with combo
    
    const viz: ComboVisualization = {
      hits,
      tier,
      color,
      position: new THREE.Vector2(0, 0.5), // Top center
      scale,
      duration: LEGENDARY_COMBAT_CONSTANTS.VISUAL.COMBO_DISPLAY.ENABLED ? 2000 : 0,
      startTime: this.currentTime,
    };
    
    this.comboVisualizations.push(viz);
  }

  /**
   * Get hit effect configuration
   */
  private getHitEffectConfig(type: string): {
    count: number;
    color: string;
    size: number;
    life: number;
  } {
    switch (type) {
      case 'crit':
        return {
          count: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.CRIT.COUNT,
          color: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.CRIT.COLOR,
          size: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.CRIT.SIZE,
          life: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.CRIT.LIFE,
        };
      case 'perfect_dodge':
        return {
          count: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.PERFECT_DODGE.COUNT,
          color: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.PERFECT_DODGE.COLOR,
          size: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.PERFECT_DODGE.SIZE,
          life: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.PERFECT_DODGE.LIFE,
        };
      case 'perfect_parry':
        return {
          count: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.PERFECT_PARRY.COUNT,
          color: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.PERFECT_PARRY.COLOR,
          size: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.PERFECT_PARRY.SIZE,
          life: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.PERFECT_PARRY.LIFE,
        };
      case 'combo':
        return {
          count: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.COMBO.COUNT,
          color: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.COMBO.COLOR,
          size: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.COMBO.SIZE,
          life: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.COMBO.LIFE,
        };
      default:
        return {
          count: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.HIT.COUNT,
          color: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.HIT.COLOR,
          size: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.HIT.SIZE,
          life: LEGENDARY_COMBAT_CONSTANTS.PARTICLES.HIT.LIFE,
        };
    }
  }

  /**
   * Get combo color based on hit count
   */
  private getComboColor(hits: number): string {
    const colors = LEGENDARY_COMBAT_CONSTANTS.METERS.COMBO.COLOR_SHIFTS;
    
    if (hits >= 100) return colors[100];
    if (hits >= 50) return colors[50];
    if (hits >= 20) return colors[20];
    if (hits >= 10) return colors[10];
    return colors[0];
  }

  /**
   * Get current screen shake offset
   */
  getScreenShakeOffset(): THREE.Vector3 {
    const offset = new THREE.Vector3(0, 0, 0);
    
    this.screenShakes.forEach(shake => {
      const elapsed = (this.currentTime - shake.startTime) / 1000;
      const progress = elapsed / (shake.duration / 1000);
      
      if (progress < 1.0) {
        const intensity = shake.intensity * (1.0 - progress); // Fade out
        const shakeAmount = Math.sin(elapsed * shake.frequency * Math.PI * 2) * intensity;
        
        offset.add(
          shake.direction.clone().multiplyScalar(shakeAmount)
        );
      }
    });
    
    return offset;
  }

  /**
   * Get current screen flash intensity
   */
  getScreenFlashIntensity(): { color: string; intensity: number } | null {
    if (this.screenFlashes.length === 0) return null;
    
    // Get most recent flash
    const flash = this.screenFlashes[this.screenFlashes.length - 1];
    const elapsed = this.currentTime - flash.startTime;
    const progress = elapsed / flash.duration;
    
    if (progress < 1.0) {
      const intensity = flash.intensity * (1.0 - progress); // Fade out
      return {
        color: flash.color,
        intensity,
      };
    }
    
    return null;
  }

  /**
   * Get active hit effects
   */
  getActiveHitEffects(): HitEffect[] {
    return this.hitEffects.filter(effect => {
      return (this.currentTime - effect.startTime) < effect.duration;
    });
  }

  /**
   * Get active combo visualizations
   */
  getActiveComboVisualizations(): ComboVisualization[] {
    return this.comboVisualizations.filter(viz => {
      return (this.currentTime - viz.startTime) < viz.duration;
    });
  }

  /**
   * Reset all effects
   */
  reset(): void {
    this.screenShakes = [];
    this.screenFlashes = [];
    this.hitEffects = [];
    this.comboVisualizations = [];
  }
}
