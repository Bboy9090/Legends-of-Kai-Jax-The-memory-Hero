#pragma once

#include "CharacterTypes.h"
#include <string>
#include <memory>

namespace LegendsEngine {

/**
 * CharacterSpecification - The authoritative character data container
 * 
 * This class holds all character data loaded from the JSON specification.
 * It is the single source of truth for character configuration in the engine.
 * 
 * RULES:
 * - This is a data-driven system - no logic, only data
 * - All validation happens at load time
 * - Immutable after loading (const accessors only)
 * - Platform-agnostic (PC, mobile, tablet use same data)
 */
class CharacterSpecification {
public:
    CharacterSpecification() = default;
    ~CharacterSpecification() = default;

    // Disable copy/move to enforce single ownership
    CharacterSpecification(const CharacterSpecification&) = delete;
    CharacterSpecification& operator=(const CharacterSpecification&) = delete;
    CharacterSpecification(CharacterSpecification&&) = delete;
    CharacterSpecification& operator=(CharacterSpecification&&) = delete;

    // Metadata accessors
    const std::string& getCharacterId() const { return characterId; }
    const std::string& getDisplayName() const { return displayName; }
    const std::string& getTitle() const { return title; }
    const std::string& getVersion() const { return version; }

    // Core data accessors
    const AuthoritativeReference& getAuthoritativeReference() const { return authoritativeReference; }
    const Anatomy& getAnatomy() const { return anatomy; }
    const SilhouetteRules& getSilhouetteRules() const { return silhouetteRules; }
    const Modeling& getModeling() const { return modeling; }
    const Materials& getMaterials() const { return materials; }
    const Rigging& getRigging() const { return rigging; }
    const Animation& getAnimation() const { return animation; }
    const CombatIdentity& getCombatIdentity() const { return combatIdentity; }
    const std::vector<TailRole>& getTailRoles() const { return tailRoles; }
    const EngineIntegration& getEngineIntegration() const { return engineIntegration; }
    const MobileProfile& getMobileProfile() const { return mobileProfile; }
    const AcceptanceCriteria& getAcceptanceCriteria() const { return acceptanceCriteria; }

    // Validation status
    bool isValid() const { return valid; }
    const std::string& getValidationError() const { return validationError; }

    // Friend class for loading
    friend class CharacterLoader;

private:
    // Metadata
    std::string characterId;
    std::string displayName;
    std::string title;
    std::string version;

    // Core specification data
    AuthoritativeReference authoritativeReference;
    Anatomy anatomy;
    SilhouetteRules silhouetteRules;
    Modeling modeling;
    Materials materials;
    Rigging rigging;
    Animation animation;
    CombatIdentity combatIdentity;
    std::vector<TailRole> tailRoles;
    EngineIntegration engineIntegration;
    MobileProfile mobileProfile;
    AcceptanceCriteria acceptanceCriteria;

    // Validation state
    bool valid = false;
    std::string validationError;
};

} // namespace LegendsEngine
