/**
 * KAI-JAX CHARACTER LOADER
 * 
 * Loads and validates Kai-Jax character data from canonical lockfile.
 * Ensures all game systems read from single source of truth.
 * 
 * This module is the integration layer between:
 * - kai_jax.character.json (lockfile)
 * - schemas/character.schema.json (validation)
 * - data/world/tail_tier_reactions.json (world systems)
 * - Game engine (rendering, physics, AI)
 */

import kaiJaxData from '../../../../kai_jax.character.json';
import characterSchema from '../../../../schemas/character.schema.json';
import tailTierReactions from '../../../../data/world/tail_tier_reactions.json';

/**
 * Validate character data against schema
 * @throws Error if validation fails
 */
function validateCharacterData(data: any): void {
  // Basic validation (full JSON schema validation would require ajv)
  if (!data.evolution) {
    throw new Error('Missing evolution object in character data');
  }

  const evolution = data.evolution;
  
  // Validate immutable evolution rules
  if (evolution.starting_tail_count !== 3) {
    throw new Error(`Invalid starting_tail_count: ${evolution.starting_tail_count} (must be 3)`);
  }
  
  if (evolution.final_tail_count !== 9) {
    throw new Error(`Invalid final_tail_count: ${evolution.final_tail_count} (must be 9)`);
  }
  
  if (evolution.unlock_rule !== 'sequential_only') {
    throw new Error(`Invalid unlock_rule: ${evolution.unlock_rule} (must be 'sequential_only')`);
  }
  
  if (evolution.skip_unlocks_disallowed !== true) {
    throw new Error('skip_unlocks_disallowed must be true');
  }
  
  if (evolution.tails_are_permanent !== true) {
    throw new Error('tails_are_permanent must be true');
  }
  
  // Validate tail count matches anatomy
  if (data.anatomy.tail_count !== evolution.final_tail_count) {
    throw new Error(`Anatomy tail_count (${data.anatomy.tail_count}) must match evolution final_tail_count (${evolution.final_tail_count})`);
  }
  
  // Validate tail roles array
  if (!data.tail_roles || data.tail_roles.length !== 9) {
    throw new Error(`tail_roles must have exactly 9 entries (found: ${data.tail_roles?.length || 0})`);
  }
  
  // Validate rigging tail count
  if (data.rigging?.extra_bones?.tails?.count !== 9) {
    throw new Error(`Rigging tail count must be 9 (found: ${data.rigging?.extra_bones?.tails?.count})`);
  }
}

/**
 * Get tail tier reaction data for current tail count
 */
export function getTailTierReaction(currentTailCount: number): any {
  const tierKey = currentTailCount.toString();
  
  if (!(tierKey in tailTierReactions.tail_tiers)) {
    throw new Error(`No tail tier reaction data for tail count: ${currentTailCount}`);
  }
  
  return tailTierReactions.tail_tiers[tierKey];
}

/**
 * Check if tail unlock is valid (sequential only)
 */
export function canUnlockTail(currentTailCount: number, targetTailCount: number): boolean {
  // Per canonical rules: 3→4→5→6→7→8→9 only
  
  // Already at maximum
  if (currentTailCount >= 9) {
    return false;
  }
  
  // Must be sequential (next tail only)
  if (targetTailCount !== currentTailCount + 1) {
    return false;
  }
  
  // Must be within valid range
  if (targetTailCount < 3 || targetTailCount > 9) {
    return false;
  }
  
  return true;
}

/**
 * Get tail role data for specific tail index (1-9)
 */
export function getTailRole(tailIndex: number): any {
  if (tailIndex < 1 || tailIndex > 9) {
    throw new Error(`Invalid tail index: ${tailIndex} (must be 1-9)`);
  }
  
  const tailRole = kaiJaxData.tail_roles.find(t => t.index === tailIndex);
  
  if (!tailRole) {
    throw new Error(`No tail role data for index: ${tailIndex}`);
  }
  
  return tailRole;
}

/**
 * Get required animation sets
 */
export function getRequiredAnimations(): string[] {
  return kaiJaxData.animation.required_sets;
}

/**
 * Get modeling LOD targets
 */
export function getLODTargets(): any {
  return kaiJaxData.modeling.lod_targets;
}

/**
 * Get material specifications
 */
export function getMaterialSpecs(): any {
  return kaiJaxData.materials;
}

/**
 * Get combat identity
 */
export function getCombatIdentity(): any {
  return kaiJaxData.combat_identity;
}

/**
 * Validate and load Kai-Jax character data
 */
export function loadKaiJaxCharacter() {
  console.log('[KaiJax Loader] Validating canonical character data...');
  
  try {
    validateCharacterData(kaiJaxData);
    console.log('[KaiJax Loader] ✓ Validation passed');
  } catch (error) {
    console.error('[KaiJax Loader] ✗ Validation failed:', error);
    throw error;
  }
  
  return {
    // Core identity
    id: kaiJaxData.character_id,
    name: kaiJaxData.display_name,
    title: kaiJaxData.title,
    version: kaiJaxData.version,
    
    // Anatomy
    anatomy: kaiJaxData.anatomy,
    
    // Evolution system
    evolution: kaiJaxData.evolution,
    
    // Silhouette rules
    silhouette: kaiJaxData.silhouette_rules,
    
    // Modeling specs
    modeling: kaiJaxData.modeling,
    
    // Materials
    materials: kaiJaxData.materials,
    
    // Rigging
    rigging: kaiJaxData.rigging,
    
    // Animation
    animation: kaiJaxData.animation,
    
    // Combat
    combat: kaiJaxData.combat_identity,
    
    // Tail roles
    tailRoles: kaiJaxData.tail_roles,
    
    // Memory weave
    memoryWeave: kaiJaxData.memory_weave,
    
    // Engine integration
    engine: kaiJaxData.engine_integration,
    
    // Mobile profile
    mobile: kaiJaxData.mobile_profile,
    
    // Acceptance criteria
    acceptance: kaiJaxData.acceptance_criteria,
    
    // Helper methods
    getTailRole,
    canUnlockTail,
    getTailTierReaction,
    getRequiredAnimations,
    getLODTargets,
    getMaterialSpecs,
    getCombatIdentity,
  };
}

/**
 * Singleton instance
 */
let _instance: ReturnType<typeof loadKaiJaxCharacter> | null = null;

/**
 * Get Kai-Jax character instance (singleton)
 */
export function getKaiJax() {
  if (!_instance) {
    _instance = loadKaiJaxCharacter();
  }
  return _instance;
}

/**
 * Export raw data for debugging
 */
export const RAW_DATA = {
  character: kaiJaxData,
  schema: characterSchema,
  tailTierReactions: tailTierReactions,
};

// Validate on module load
try {
  validateCharacterData(kaiJaxData);
  console.log('[KaiJax Module] ✓ Canonical data validated on load');
} catch (error) {
  console.error('[KaiJax Module] ✗ CRITICAL: Canonical data validation failed:', error);
  throw new Error('Kai-Jax canonical data validation failed - cannot proceed');
}
