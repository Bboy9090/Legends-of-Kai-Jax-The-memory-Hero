/**
 * Boss Design Validator
 * Validates boss_design_bible.json against schema and character tail progression.
 * 
 * Design Law: "Bosses never invalidate prior tails; they require them"
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Boss tier definition
 */
export interface BossTierDefinition {
  tier_name: string;
  tail_range: [number, number];
  expects: string[];
  punishes: string[];
  weak_to: string[];
  philosophy: string;
}

/**
 * Boss design bible data structure
 */
export interface BossDesignBibleData {
  title: string;
  description: string;
  version: string;
  last_updated?: string;
  design_law: string;
  boss_tiers: Record<string, BossTierDefinition>;
}

/**
 * Character data for cross-validation
 */
export interface CharacterData {
  evolution: {
    starting_tail_count: number;
    final_tail_count: number;
  };
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
 * BossDesignValidator class
 * Validates boss design bible against schema and enforces design principles.
 */
export class BossDesignValidator {
  private bossDesignPath: string;
  private characterPath: string;
  private schemaPath: string;

  constructor(
    bossDesignPath: string = '../../../data/bosses/boss_design_bible.json',
    characterPath: string = '../../../kai_jax.character.json',
    schemaPath: string = '../../../schemas/boss_design_bible.schema.json'
  ) {
    this.bossDesignPath = path.resolve(__dirname, bossDesignPath);
    this.characterPath = path.resolve(__dirname, characterPath);
    this.schemaPath = path.resolve(__dirname, schemaPath);
  }

  /**
   * Load boss design bible from JSON file
   */
  private loadBossDesign(): BossDesignBibleData {
    try {
      const data = fs.readFileSync(this.bossDesignPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load boss design bible: ${error}`);
    }
  }

  /**
   * Load character data for cross-validation
   */
  private loadCharacterData(): CharacterData {
    try {
      const data = fs.readFileSync(this.characterPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load character data: ${error}`);
    }
  }

  /**
   * Validate tier naming convention
   */
  private validateTierNaming(tierKey: string): string | null {
    if (!/^tier_[0-9_]+$/.test(tierKey)) {
      return `Invalid tier key format: ${tierKey} (must match pattern tier_X or tier_X_Y)`;
    }
    return null;
  }

  /**
   * Validate a single boss tier
   */
  private validateTier(tierKey: string, tier: BossTierDefinition): string[] {
    const errors: string[] = [];

    // Validate tier naming
    const namingError = this.validateTierNaming(tierKey);
    if (namingError) {
      errors.push(namingError);
    }

    // Validate required fields
    if (!tier.tier_name) {
      errors.push(`Tier ${tierKey}: missing tier_name`);
    }

    if (!tier.tail_range || tier.tail_range.length !== 2) {
      errors.push(`Tier ${tierKey}: tail_range must be [min, max] array`);
    } else {
      const [min, max] = tier.tail_range;
      if (min < 3 || max > 9) {
        errors.push(`Tier ${tierKey}: tail_range [${min}, ${max}] out of bounds (3-9)`);
      }
      if (min > max) {
        errors.push(`Tier ${tierKey}: tail_range min (${min}) cannot exceed max (${max})`);
      }
    }

    // Validate expects array
    if (!tier.expects || tier.expects.length === 0) {
      errors.push(`Tier ${tierKey}: expects array is required and cannot be empty`);
    }

    // Validate punishes array
    if (!tier.punishes || tier.punishes.length === 0) {
      errors.push(`Tier ${tierKey}: punishes array is required and cannot be empty`);
    }

    // Validate weak_to array
    if (!tier.weak_to || tier.weak_to.length === 0) {
      errors.push(`Tier ${tierKey}: weak_to array is required and cannot be empty`);
    }

    // Validate philosophy
    if (!tier.philosophy) {
      errors.push(`Tier ${tierKey}: missing philosophy`);
    }

    return errors;
  }

  /**
   * Validate all boss tiers
   */
  public validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const bossDesign = this.loadBossDesign();
      const characterData = this.loadCharacterData();

      // Validate top-level structure
      if (!bossDesign.title) {
        errors.push('Missing required field: title');
      }

      if (!bossDesign.description) {
        errors.push('Missing required field: description');
      }

      if (!bossDesign.version || !/^\d+\.\d+\.\d+$/.test(bossDesign.version)) {
        errors.push('Version must be in semantic versioning format (e.g., 1.0.0)');
      }

      if (!bossDesign.design_law) {
        errors.push('Missing required field: design_law');
      } else if (!bossDesign.design_law.toLowerCase().includes('never invalidate')) {
        warnings.push('design_law should emphasize that bosses never invalidate prior tails');
      }

      if (!bossDesign.boss_tiers || typeof bossDesign.boss_tiers !== 'object') {
        errors.push('Missing or invalid boss_tiers object');
        return { valid: false, errors, warnings };
      }

      // Validate each tier
      const tierKeys = Object.keys(bossDesign.boss_tiers);
      if (tierKeys.length === 0) {
        errors.push('boss_tiers object is empty - at least one tier required');
      }

      for (const tierKey of tierKeys) {
        const tier = bossDesign.boss_tiers[tierKey];
        const tierErrors = this.validateTier(tierKey, tier);
        errors.push(...tierErrors);
      }

      // Cross-validate against character data
      const maxTailCount = characterData.evolution.final_tail_count;
      for (const tierKey of tierKeys) {
        const tier = bossDesign.boss_tiers[tierKey];
        if (tier.tail_range && tier.tail_range[1] > maxTailCount) {
          errors.push(
            `Tier ${tierKey}: max tail range ${tier.tail_range[1]} exceeds character max ${maxTailCount}`
          );
        }
      }

      // Check for required tiers (Tail 5 for Shade Trial)
      const hasTier5 = tierKeys.some(key => {
        const tier = bossDesign.boss_tiers[key];
        return tier.tail_range && tier.tail_range[0] <= 5 && tier.tail_range[1] >= 5;
      });

      if (!hasTier5) {
        warnings.push('No tier defined for Tail 5 (required for Shade Trial boss)');
      }

      // Verify tier coverage (3-9)
      const coveredTails = new Set<number>();
      for (const tierKey of tierKeys) {
        const tier = bossDesign.boss_tiers[tierKey];
        if (tier.tail_range) {
          for (let i = tier.tail_range[0]; i <= tier.tail_range[1]; i++) {
            coveredTails.add(i);
          }
        }
      }

      for (let i = 3; i <= maxTailCount; i++) {
        if (!coveredTails.has(i)) {
          warnings.push(`Tail ${i} is not covered by any boss tier`);
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
   * Get boss tier for specific tail count
   */
  public getTierForTailCount(tailCount: number): BossTierDefinition | null {
    try {
      const bossDesign = this.loadBossDesign();
      
      for (const tierKey of Object.keys(bossDesign.boss_tiers)) {
        const tier = bossDesign.boss_tiers[tierKey];
        if (tier.tail_range && 
            tailCount >= tier.tail_range[0] && 
            tailCount <= tier.tail_range[1]) {
          return tier;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to get tier for tail count ${tailCount}:`, error);
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
        'Boss Design Bible Validation Failed:',
        ...result.errors.map(e => `  - ${e}`),
        '',
        'Design Law: Bosses never invalidate prior tails; they require them.',
        'Fix errors in data/bosses/boss_design_bible.json before proceeding.'
      ].join('\n');
      
      throw new Error(errorMessage);
    }

    if (result.warnings.length > 0) {
      console.warn('Boss Design Bible Validation Warnings:');
      result.warnings.forEach(w => console.warn(`  - ${w}`));
    }
  }
}

/**
 * Convenience function for validation
 */
export function validateBossDesign(): ValidationResult {
  const validator = new BossDesignValidator();
  return validator.validate();
}
