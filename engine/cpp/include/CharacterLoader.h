#pragma once

#include "CharacterSpecification.h"
#include <nlohmann/json.hpp>
#include <memory>
#include <string>

namespace LegendsEngine {

/**
 * CharacterLoader - Loads character specifications from JSON files
 * 
 * This class is responsible for:
 * 1. Parsing JSON character specifications
 * 2. Validating the data against engine requirements
 * 3. Populating CharacterSpecification objects
 * 
 * CRITICAL VALIDATIONS:
 * - Kai-Jax MUST have exactly 9 tails (LOCKFILE requirement)
 * - All required fields must be present
 * - Data types must match expected types
 * - Tail roles must match tail count
 */
class CharacterLoader {
public:
    /**
     * Load a character specification from a JSON file
     * 
     * @param filePath Path to the JSON specification file
     * @return Unique pointer to loaded CharacterSpecification, or nullptr on failure
     */
    static std::unique_ptr<CharacterSpecification> loadFromFile(const std::string& filePath);

    /**
     * Load a character specification from parsed JSON data
     * 
     * @param jsonData Parsed JSON object
     * @return Unique pointer to loaded CharacterSpecification
     */
    static std::unique_ptr<CharacterSpecification> loadFromJson(const nlohmann::json& jsonData);

private:
    using json = nlohmann::json;

    static void loadAuthoritativeReference(const json& j, AuthoritativeReference& ref);
    static void loadAnatomy(const json& j, Anatomy& anatomy);
    static void loadSilhouetteRules(const json& j, SilhouetteRules& rules);
    static void loadModeling(const json& j, Modeling& modeling);
    static void loadMaterials(const json& j, Materials& materials);
    static void loadRigging(const json& j, Rigging& rigging);
    static void loadAnimation(const json& j, Animation& animation);
    static void loadAnimationSpec(const json& j, AnimationSpec& animationSpec, const std::string& characterId);
    static void loadCombatIdentity(const json& j, CombatIdentity& combat);
    static void loadTailRoles(const json& j, std::vector<TailRole>& tailRoles);
    static void loadEngineIntegration(const json& j, EngineIntegration& engine);
    static void loadMobileProfile(const json& j, MobileProfile& profile);
    static void loadAcceptanceCriteria(const json& j, AcceptanceCriteria& criteria);

    /**
     * CRITICAL VALIDATION: Tail count consistency check
     * 
     * For Kai-Jax, this MUST be 9. This is a LOCKFILE requirement.
     * All tail-related data (anatomy, rigging, tail_roles) must be consistent.
     */
    static void validateTailCount(CharacterSpecification* spec);
};

} // namespace LegendsEngine
