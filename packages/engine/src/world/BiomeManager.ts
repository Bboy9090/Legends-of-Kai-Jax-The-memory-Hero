/**
 * Biome Manager
 * Loads and applies biome rules for encounters, visibility, and music.
 * 
 * Biomes are NOT cosmetic—they define gameplay complexity.
 */

import * as fs from 'fs';
import * as path from 'path';
import { BiomeRulesValidator, BiomeDefinition } from '../progression/BiomeRulesValidator';

/**
 * Active biome state
 */
export interface ActiveBiomeState {
  biome_id: string;
  display_name: string;
  verticality: 'low' | 'medium' | 'high';
  visibility: 'clear' | 'low_dynamic' | 'occluded';
  enemy_density: 'sparse' | 'moderate' | 'high_but_queued';
  encounter_bias: string[];
  music_profile: string;
  systems_enabled: string[];
}

/**
 * BiomeManager class
 * Manages biome state and applies gameplay rules per zone.
 */
export class BiomeManager {
  private validator: BiomeRulesValidator;
  private currentBiome: ActiveBiomeState | null;

  constructor() {
    this.validator = new BiomeRulesValidator();
    this.currentBiome = null;
  }

  /**
   * Load and activate a biome
   */
  public loadBiome(biomeId: string): ActiveBiomeState {
    // Validate biome rules first
    this.validator.validateOrThrow();

    // Get biome definition
    const biomeDefinition = this.validator.getBiome(biomeId);
    if (!biomeDefinition) {
      throw new Error(`Biome not found: ${biomeId}`);
    }

    // Create active state
    this.currentBiome = {
      biome_id: biomeDefinition.biome_id,
      display_name: biomeDefinition.display_name,
      verticality: biomeDefinition.verticality,
      visibility: biomeDefinition.visibility,
      enemy_density: biomeDefinition.enemy_density,
      encounter_bias: [...biomeDefinition.encounter_bias],
      music_profile: biomeDefinition.music_profile,
      systems_enabled: biomeDefinition.systems_enabled || []
    };

    return this.currentBiome;
  }

  /**
   * Get current biome state
   */
  public getCurrentBiome(): ActiveBiomeState | null {
    return this.currentBiome ? { ...this.currentBiome } : null;
  }

  /**
   * Check if system is enabled in current biome
   */
  public isSystemEnabled(systemName: string): boolean {
    return this.currentBiome?.systems_enabled.includes(systemName) || false;
  }

  /**
   * Get encounter settings for current biome
   */
  public getEncounterSettings(): {
    density: string;
    bias: string[];
    max_simultaneous: number;
  } {
    if (!this.currentBiome) {
      throw new Error('No biome loaded');
    }

    // Map density to max simultaneous enemies
    const densityMap: Record<string, number> = {
      'sparse': 5,
      'moderate': 8,
      'high_but_queued': 10 // High density but queued, never swarm spam
    };

    return {
      density: this.currentBiome.enemy_density,
      bias: [...this.currentBiome.encounter_bias],
      max_simultaneous: densityMap[this.currentBiome.enemy_density] || 8
    };
  }

  /**
   * Get visibility settings for current biome
   */
  public getVisibilitySettings(): {
    visibility: string;
    stealth_enabled: boolean;
    dynamic_lighting: boolean;
  } {
    if (!this.currentBiome) {
      throw new Error('No biome loaded');
    }

    return {
      visibility: this.currentBiome.visibility,
      stealth_enabled: this.isSystemEnabled('stealth'),
      dynamic_lighting: this.currentBiome.visibility === 'low_dynamic'
    };
  }

  /**
   * Get music profile for current biome
   */
  public getMusicProfile(): string {
    if (!this.currentBiome) {
      throw new Error('No biome loaded');
    }
    return this.currentBiome.music_profile;
  }

  /**
   * Check if verticality bonus is enabled
   */
  public hasVerticalityBonus(): boolean {
    return this.isSystemEnabled('verticality_bonuses') && 
           this.currentBiome?.verticality === 'high';
  }

  /**
   * Check if environmental hazards are enabled
   */
  public hasEnvironmentalHazards(): boolean {
    return this.isSystemEnabled('environmental_hazards');
  }

  /**
   * Apply biome-specific combat modifiers
   */
  public getCombatModifiers(): {
    stealth_enabled: boolean;
    threat_reset_enabled: boolean;
    verticality_bonus: number;
    environmental_kills: boolean;
  } {
    if (!this.currentBiome) {
      throw new Error('No biome loaded');
    }

    const verticalityBonus = this.currentBiome.verticality === 'high' ? 1.2 :
                              this.currentBiome.verticality === 'medium' ? 1.0 : 0.8;

    return {
      stealth_enabled: this.isSystemEnabled('stealth'),
      threat_reset_enabled: this.isSystemEnabled('threat_reset'),
      verticality_bonus: verticalityBonus,
      environmental_kills: this.hasEnvironmentalHazards()
    };
  }

  /**
   * Validate Blackreach Underpass for Shade Trial
   * Throws if biome is not properly configured
   */
  public validateBlackreachForShadeTrial(): void {
    const blackreach = this.validator.getBiome('blackreach_underpass');
    if (!blackreach) {
      throw new Error('Blackreach Underpass biome not defined');
    }

    const errors: string[] = [];

    if (blackreach.verticality !== 'high') {
      errors.push('Blackreach must have high verticality for Shade Trial');
    }

    if (blackreach.visibility !== 'low_dynamic') {
      errors.push('Blackreach must have low_dynamic visibility for stealth mechanics');
    }

    if (blackreach.enemy_density !== 'high_but_queued') {
      errors.push('Blackreach must have high_but_queued density (no swarm spam)');
    }

    if (!blackreach.systems_enabled?.includes('stealth') ||
        !blackreach.systems_enabled?.includes('threat_reset')) {
      errors.push('Blackreach must enable stealth and threat_reset systems');
    }

    if (errors.length > 0) {
      throw new Error(
        `Blackreach Underpass validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
      );
    }
  }
}
