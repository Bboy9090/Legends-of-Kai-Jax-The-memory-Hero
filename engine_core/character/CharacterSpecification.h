#pragma once

#include "CharacterTypes.h"
#include <string>
#include <vector>
#include <memory>
#include <stdexcept>

/**
 * CharacterSpecification.h
 * 
 * Main character specification class that aggregates all character data.
 * Loads and validates character definitions from JSON files.
 * 
 * DESIGN INTENT:
 * - Single source of truth for character data
 * - Immutable after load (no setters)
 * - Validation enforced on construction
 * - Factory pattern for controlled instantiation
 * 
 * USAGE:
 *   auto kai_jax = CharacterSpecification::LoadFromFile("kai_jax.character.json");
 *   std::cout << kai_jax.display_name << " has " 
 *             << kai_jax.anatomy.tail_count << " tails\n";
 * 
 * VALIDATION RULES:
 * - kai_jax.character.json is a LOCKFILE
 * - For character_id "kai_jax", tail_count MUST be 9
 * - All required fields must be present
 * - Validation failures throw std::runtime_error
 */

namespace LegendsEngine {
namespace Character {

/**
 * CharacterSpecification - Complete character definition
 * 
 * Aggregates all character data from JSON into a validated, immutable structure.
 * This class represents the CONTRACT between content and code.
 */
class CharacterSpecification {
public:
    // ====================================================================
    // TOP-LEVEL FIELDS
    // ====================================================================
    
    /**
     * Unique identifier for this character (e.g., "kai_jax")
     * Used for lookups, validation, and canon enforcement.
     */
    std::string character_id;
    
    /**
     * Display name for UI (e.g., "Kai-Jax")
     */
    std::string display_name;
    
    /**
     * Character title/subtitle (e.g., "The Memory Hero")
     */
    std::string title;
    
    /**
     * Specification version for migration/compatibility
     */
    std::string version;
    
    /**
     * Authoritative reference metadata
     */
    AuthoritativeReference authoritative_reference;
    
    // ====================================================================
    // SPECIFICATION SECTIONS
    // ====================================================================
    
    /**
     * Physical anatomy and body structure
     */
    AnatomySpec anatomy;
    
    /**
     * Silhouette and visual distinctiveness rules
     */
    SilhouetteRules silhouette_rules;
    
    /**
     * 3D modeling requirements
     */
    ModelingSpec modeling;
    
    /**
     * Material and shader specifications
     */
    MaterialSpec materials;
    
    /**
     * Skeletal rig and bone structure
     */
    RiggingSpec rigging;
    
    /**
     * Animation requirements and philosophy
     */
    AnimationSpec animation;
    
    /**
     * Combat role and mechanical identity
     */
    CombatIdentity combat_identity;
    
    /**
     * Individual tail functions (9 for Kai-Jax)
     */
    std::vector<TailRole> tail_roles;
    
    /**
     * Engine integration requirements
     */
    EngineIntegration engine_integration;
    
    /**
     * Mobile platform adaptation rules
     */
    MobileProfile mobile_profile;
    
    /**
     * Quality acceptance criteria
     */
    AcceptanceCriteria acceptance_criteria;
    
    // ====================================================================
    // FACTORY METHOD
    // ====================================================================
    
    /**
     * Load and validate a character specification from a JSON file.
     * 
     * This is the ONLY public way to construct a CharacterSpecification.
     * Enforces validation and canon rules during load.
     * 
     * @param path Path to the character JSON file
     * @return Fully validated CharacterSpecification
     * @throws std::runtime_error if file not found, parse error, or validation fails
     * 
     * VALIDATION RULES:
     * - If character_id == "kai_jax", anatomy.tail_count MUST be 9
     * - All required fields must be present
     * - JSON structure must match spec
     * 
     * EXAMPLE:
     *   auto kai_jax = CharacterSpecification::LoadFromFile("kai_jax.character.json");
     */
    static CharacterSpecification LoadFromFile(const std::string& path);
    
    // ====================================================================
    // RULE ENFORCEMENT
    // ====================================================================
    
    /**
     * Check if this character is Kai-Jax (the canonical flagship character)
     */
    bool IsKaiJax() const {
        static const std::string kai_jax_id = "kai_jax";
        return character_id == kai_jax_id;
    }
    
    /**
     * Get the expected tail count for validation
     * For Kai-Jax, this is always 9 (LOCKFILE rule)
     */
    int GetExpectedTailCount() const {
        if (IsKaiJax()) {
            return 9;  // HARD RULE: Kai-Jax always has 9 tails
        }
        return anatomy.tail_count;  // Other characters may vary
    }

private:
    /**
     * Validate the loaded specification.
     * 
     * VALIDATION CHECKS:
     * - Canon enforcement (Kai-Jax rules)
     * - Required field presence
     * - Logical consistency (e.g., tail_roles.size() == tail_count)
     * - Cross-field validation
     * 
     * @throws std::runtime_error if validation fails
     */
    void Validate();
    
    /**
     * Private constructor - use LoadFromFile instead.
     * This enforces the factory pattern and ensures all instances are validated.
     */
    CharacterSpecification() = default;
};

} // namespace Character
} // namespace LegendsEngine
