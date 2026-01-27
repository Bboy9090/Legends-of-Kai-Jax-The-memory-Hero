/**
 * Biome Rules Validator
 * Validates biome_rules.json against schema and enforces gameplay requirements.
 * 
 * Biomes are NOT cosmetic—they define encounter rules, visibility systems, and enemy behavior.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Biome definition interface
 */
export interface BiomeDefinition {
  biome_id: string;
  display_name: string;
  verticality: 'low' | 'medium' | 'high';
  visibility: 'clear' | 'low_dynamic' | 'occluded';
  enemy_density: 'sparse' | 'moderate' | 'high_but_queued';
  encounter_bias: Array<'bruiser' | 'swarmer' | 'disruptor' | 'elite' | 'ranged'>;
  music_profile: string;
  systems_enabled?: Array<'stealth' | 'threat_reset' | 'verticality_bonuses' | 'environmental_hazards'>;
  description: string;
}

/**
 * Biome rules data structure
 */
export interface BiomeRulesData {
  title: string;
  description: string;
  version: string;
  last_updated?: string;
  biomes: Record<string, BiomeDefinition>;
  hard_rules?: Record<string, any>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * BiomeRulesValidator class
 * Validates biome rules data against schema and enforces design rules.
 */
export class BiomeRulesValidator {
  private biomeRulesPath: string;
  private schemaPath: string;

  constructor(
    biomeRulesPath: string = '../../../data/biomes/biome_rules.json',
    schemaPath: string = '../../../schemas/biome_rules.schema.json'
  ) {
    this.biomeRulesPath = path.resolve(__dirname, biomeRulesPath);
    this.schemaPath = path.resolve(__dirname, schemaPath);
  }

  /**
   * Load biome rules from JSON file
   */
  private loadBiomeRules(): BiomeRulesData {
    try {
      const data = fs.readFileSync(this.biomeRulesPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load biome rules: ${error}`);
    }
  }

  /**
   * Validate a single biome definition
   */
  private validateBiome(biomeId: string, biome: BiomeDefinition): string[] {
    const errors: string[] = [];

    // Validate biome_id matches key
    if (biome.biome_id !== biomeId) {
      errors.push(`Biome ${biomeId}: biome_id field (${biome.biome_id}) must match key (${biomeId})`);
    }

    // Validate required fields
    if (!biome.display_name) {
      errors.push(`Biome ${biomeId}: missing display_name`);
    }

    if (!biome.verticality || !['low', 'medium', 'high'].includes(biome.verticality)) {
      errors.push(`Biome ${biomeId}: verticality must be 'low', 'medium', or 'high'`);
    }

    if (!biome.visibility || !['clear', 'low_dynamic', 'occluded'].includes(biome.visibility)) {
      errors.push(`Biome ${biomeId}: visibility must be 'clear', 'low_dynamic', or 'occluded'`);
    }

    if (!biome.enemy_density || !['sparse', 'moderate', 'high_but_queued'].includes(biome.enemy_density)) {
      errors.push(`Biome ${biomeId}: enemy_density must be 'sparse', 'moderate', or 'high_but_queued'`);
    }

    if (!biome.encounter_bias || biome.encounter_bias.length === 0) {
      errors.push(`Biome ${biomeId}: encounter_bias must be non-empty array`);
    }

    if (!biome.music_profile) {
      errors.push(`Biome ${biomeId}: missing music_profile`);
    }

    return errors;
  }

  /**
   * Validate all biome rules
   */
  public validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const biomeRules = this.loadBiomeRules();

      // Validate top-level structure
      if (!biomeRules.title) {
        errors.push('Missing required field: title');
      }

      if (!biomeRules.description) {
        errors.push('Missing required field: description');
      }

      if (!biomeRules.version || !/^\d+\.\d+\.\d+$/.test(biomeRules.version)) {
        errors.push('Version must be in semantic versioning format (e.g., 1.0.0)');
      }

      if (!biomeRules.biomes || typeof biomeRules.biomes !== 'object') {
        errors.push('Missing or invalid biomes object');
        return { valid: false, errors, warnings };
      }

      // Validate each biome
      const biomeIds = Object.keys(biomeRules.biomes);
      if (biomeIds.length === 0) {
        errors.push('Biomes object is empty - at least one biome required');
      }

      for (const biomeId of biomeIds) {
        const biome = biomeRules.biomes[biomeId];
        const biomeErrors = this.validateBiome(biomeId, biome);
        errors.push(...biomeErrors);
      }

      // Check for canon-required biomes (Blackreach Underpass for Shade Trial)
      if (!biomeRules.biomes['blackreach_underpass']) {
        warnings.push('Missing blackreach_underpass biome (required for Shade Trial)');
      } else {
        const blackreach = biomeRules.biomes['blackreach_underpass'];
        
        // Validate Blackreach Underpass specific requirements
        if (blackreach.verticality !== 'high') {
          errors.push('Blackreach Underpass must have high verticality (required for Shade Trial)');
        }

        if (blackreach.visibility !== 'low_dynamic') {
          errors.push('Blackreach Underpass must have low_dynamic visibility (stealth mechanics)');
        }

        if (blackreach.enemy_density !== 'high_but_queued') {
          errors.push('Blackreach Underpass must have high_but_queued density (attack queues, not swarm spam)');
        }

        if (!blackreach.systems_enabled?.includes('stealth') || 
            !blackreach.systems_enabled?.includes('threat_reset')) {
          errors.push('Blackreach Underpass must enable stealth and threat_reset systems');
        }
      }

    } catch (error) {
      errors.push(`Validation failed: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get biome definition by ID
   */
  public getBiome(biomeId: string): BiomeDefinition | null {
    try {
      const biomeRules = this.loadBiomeRules();
      return biomeRules.biomes[biomeId] || null;
    } catch (error) {
      console.error(`Failed to get biome ${biomeId}:`, error);
      return null;
    }
  }

  /**
   * Throw clear error on validation failure
   */
  public validateOrThrow(): void {
    const result = this.validate();
    
    if (!result.valid) {
      const errorMessage = [
        'Biome Rules Validation Failed:',
        ...result.errors.map(e => `  - ${e}`),
        '',
        'Biomes define gameplay complexity, not just visuals.',
        'Fix errors in data/biomes/biome_rules.json before proceeding.'
      ].join('\n');
      
      throw new Error(errorMessage);
    }

    if (result.warnings.length > 0) {
      console.warn('Biome Rules Validation Warnings:');
      result.warnings.forEach(w => console.warn(`  - ${w}`));
    }
  }
}

/**
 * Convenience function for validation
 */
export function validateBiomeRules(): ValidationResult {
  const validator = new BiomeRulesValidator();
  return validator.validate();
}
