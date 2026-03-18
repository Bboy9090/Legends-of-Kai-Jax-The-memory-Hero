#include "CharacterSpecification.h"
#include <nlohmann/json.hpp>
#include <fstream>
#include <sstream>
#include <stdexcept>

/**
 * CharacterLoader.cpp
 * 
 * Implementation of character loading and JSON deserialization.
 * Uses nlohmann/json for parsing.
 * 
 * DESIGN INTENT:
 * - Fail loudly on missing or invalid data
 * - Enforce canon rules (Kai-Jax must have 9 tails)
 * - Provide clear error messages for content creators
 * - Data-driven: code follows the spec, not the other way around
 * 
 * VALIDATION PHILOSOPHY:
 * - Validate at load time, not runtime
 * - Invalid data = throw exception
 * - No silent failures or default values for critical fields
 */

// IMPORTANT: kai_jax.character.json is a LOCKFILE
// Any implementation that violates the character spec is INVALID
// Validation is enforced at runtime in CharacterSpecification::Validate()

namespace LegendsEngine {
namespace Character {

using json = nlohmann::json;

// ============================================================================
// JSON DESERIALIZATION HELPERS
// ============================================================================

/**
 * Helper to get required field from JSON with clear error message
 */
template<typename T>
T GetRequired(const json& j, const std::string& field, const std::string& context) {
    if (!j.contains(field)) {
        throw std::runtime_error(
            "LOAD ERROR: Required field '" + field + "' missing in " + context
        );
    }
    try {
        return j[field].get<T>();
    } catch (const json::exception& e) {
        throw std::runtime_error(
            "LOAD ERROR: Invalid type for field '" + field + "' in " + context + 
            ": " + e.what()
        );
    }
}

/**
 * Helper to get optional field with default value
 */
template<typename T>
T GetOptional(const json& j, const std::string& field, const T& default_value) {
    if (!j.contains(field)) {
        return default_value;
    }
    return j[field].get<T>();
}

// ============================================================================
// from_json SPECIALIZATIONS
// ============================================================================

/**
 * Deserialize AnatomySpec from JSON
 * Maps to the "anatomy" section of character JSON
 */
void from_json(const json& j, AnatomySpec& spec) {
    spec.species_composite = GetRequired<std::vector<std::string>>(j, "species_composite", "anatomy");
    spec.body_type = GetRequired<std::string>(j, "body_type", "anatomy");
    spec.height_multiplier = GetRequired<float>(j, "height_multiplier", "anatomy");
    spec.build = GetRequired<std::string>(j, "build", "anatomy");
    spec.legs = GetRequired<std::string>(j, "legs", "anatomy");
    spec.hands = GetRequired<std::string>(j, "hands", "anatomy");
    spec.head = GetRequired<std::string>(j, "head", "anatomy");
    spec.spine = GetRequired<std::string>(j, "spine", "anatomy");
    spec.tail_count = GetRequired<int>(j, "tail_count", "anatomy");
}

/**
 * Deserialize SilhouetteRules from JSON
 */
void from_json(const json& j, SilhouetteRules& spec) {
    spec.readable_in_shadow = GetRequired<bool>(j, "readable_in_shadow", "silhouette_rules");
    spec.no_mascot_proportions = GetRequired<bool>(j, "no_mascot_proportions", "silhouette_rules");
    spec.no_cape_substitution = GetRequired<bool>(j, "no_cape_substitution", "silhouette_rules");
    spec.tails_must_arc = GetRequired<std::string>(j, "tails_must_arc", "silhouette_rules");
    spec.anti_derivative_enforced = GetRequired<bool>(j, "anti_derivative_enforced", "silhouette_rules");
}

/**
 * Deserialize LODTarget from JSON
 */
void from_json(const json& j, LODTarget& spec) {
    auto triangles = GetRequired<std::vector<int>>(j, "triangles", "lod_target");
    if (triangles.size() != 2) {
        throw std::runtime_error("LOD triangles must be [min, max]");
    }
    spec.triangles[0] = triangles[0];
    spec.triangles[1] = triangles[1];
}

/**
 * Deserialize ModelingSpec from JSON
 */
void from_json(const json& j, ModelingSpec& spec) {
    spec.units = GetRequired<std::string>(j, "units", "modeling");
    spec.scale = GetRequired<float>(j, "scale", "modeling");
    spec.topology = GetRequired<std::string>(j, "topology", "modeling");
    spec.edge_loops_required = GetRequired<std::vector<std::string>>(j, "edge_loops_required", "modeling");
    
    // Parse LOD targets
    if (j.contains("lod_targets")) {
        for (auto& [key, value] : j["lod_targets"].items()) {
            spec.lod_targets[key] = value.get<LODTarget>();
        }
    }
}

/**
 * Deserialize material specs from JSON
 */
void from_json(const json& j, FurMaterial& spec) {
    spec.type = GetRequired<std::string>(j, "type", "fur");
    spec.pbr = GetRequired<bool>(j, "pbr", "fur");
    spec.maps = GetRequired<std::vector<std::string>>(j, "maps", "fur");
    spec.notes = GetOptional<std::string>(j, "notes", "");
}

void from_json(const json& j, SkinMaterial& spec) {
    spec.pbr = GetRequired<bool>(j, "pbr", "skin");
    spec.subsurface_scattering = GetRequired<bool>(j, "subsurface_scattering", "skin");
}

void from_json(const json& j, ArmorMaterial& spec) {
    spec.material = GetRequired<std::string>(j, "material", "armor");
    auto roughness = GetRequired<std::vector<float>>(j, "roughness_range", "armor");
    if (roughness.size() != 2) {
        throw std::runtime_error("Armor roughness_range must be [min, max]");
    }
    spec.roughness_range[0] = roughness[0];
    spec.roughness_range[1] = roughness[1];
    spec.edge_wear = GetRequired<bool>(j, "edge_wear", "armor");
    spec.clean_surfaces_disallowed = GetRequired<bool>(j, "clean_surfaces_disallowed", "armor");
}

void from_json(const json& j, SpikesMaterial& spec) {
    spec.material = GetRequired<std::string>(j, "material", "spikes");
    spec.emissive = GetRequired<std::string>(j, "emissive", "spikes");
}

void from_json(const json& j, WeaveEnergyMaterial& spec) {
    spec.emissive = GetRequired<bool>(j, "emissive", "weave_energy");
    spec.always_on = GetRequired<bool>(j, "always_on", "weave_energy");
    spec.mobile_disabled = GetRequired<bool>(j, "mobile_disabled", "weave_energy");
}

void from_json(const json& j, MaterialSpec& spec) {
    if (j.contains("fur")) {
        spec.fur = j["fur"].get<FurMaterial>();
    }
    if (j.contains("skin")) {
        spec.skin = j["skin"].get<SkinMaterial>();
    }
    if (j.contains("armor")) {
        spec.armor = j["armor"].get<ArmorMaterial>();
    }
    if (j.contains("spikes")) {
        spec.spikes = j["spikes"].get<SpikesMaterial>();
    }
    if (j.contains("weave_energy")) {
        spec.weave_energy = j["weave_energy"].get<WeaveEnergyMaterial>();
    }
}

/**
 * Deserialize rigging specs from JSON
 */
void from_json(const json& j, TailConstraints& spec) {
    spec.swing_limit = GetRequired<bool>(j, "swing_limit", "tail_constraints");
    spec.twist_limit = GetRequired<bool>(j, "twist_limit", "tail_constraints");
    spec.noodle_physics = GetRequired<bool>(j, "noodle_physics", "tail_constraints");
}

void from_json(const json& j, TailSpec& spec) {
    spec.count = GetRequired<int>(j, "count", "tails");
    auto bones_per = GetRequired<std::vector<int>>(j, "bones_per_tail", "tails");
    if (bones_per.size() != 2) {
        throw std::runtime_error("bones_per_tail must be [min, max]");
    }
    spec.bones_per_tail[0] = bones_per[0];
    spec.bones_per_tail[1] = bones_per[1];
    spec.physics_enabled = GetRequired<bool>(j, "physics_enabled", "tails");
    if (j.contains("constraints")) {
        spec.constraints = j["constraints"].get<TailConstraints>();
    }
}

void from_json(const json& j, ExtraBones& spec) {
    if (j.contains("tails")) {
        spec.tails = j["tails"].get<TailSpec>();
    }
    spec.spine_deformation = GetRequired<bool>(j, "spine_deformation", "extra_bones");
    spec.jaw = GetRequired<bool>(j, "jaw", "extra_bones");
    spec.ears = GetRequired<bool>(j, "ears", "extra_bones");
}

void from_json(const json& j, FacialSystem& spec) {
    spec.type = GetRequired<std::string>(j, "type", "facial_system");
    spec.required = GetRequired<std::vector<std::string>>(j, "required", "facial_system");
    spec.anime_exaggeration = GetRequired<bool>(j, "anime_exaggeration", "facial_system");
}

void from_json(const json& j, RiggingSpec& spec) {
    spec.skeleton_type = GetRequired<std::string>(j, "skeleton_type", "rigging");
    spec.single_skeleton_only = GetRequired<bool>(j, "single_skeleton_only", "rigging");
    if (j.contains("extra_bones")) {
        spec.extra_bones = j["extra_bones"].get<ExtraBones>();
    }
    if (j.contains("facial_system")) {
        spec.facial_system = j["facial_system"].get<FacialSystem>();
    }
}

/**
 * Deserialize animation specs from JSON
 */
void from_json(const json& j, FrameRules& spec) {
    spec.min_frames_per_action = GetRequired<int>(j, "min_frames_per_action", "frame_rules");
    spec.cancel_rules = GetRequired<std::string>(j, "cancel_rules", "frame_rules");
}

void from_json(const json& j, AnimationSpec& spec) {
    spec.philosophy = GetRequired<std::string>(j, "philosophy", "animation");
    spec.no_floaty_motion = GetRequired<bool>(j, "no_floaty_motion", "animation");
    spec.root_motion_only_for = GetRequired<std::vector<std::string>>(j, "root_motion_only_for", "animation");
    spec.required_sets = GetRequired<std::vector<std::string>>(j, "required_sets", "animation");
    if (j.contains("frame_rules")) {
        spec.frame_rules = j["frame_rules"].get<FrameRules>();
    }
}

/**
 * Deserialize combat identity from JSON
 */
void from_json(const json& j, CombatIdentity& spec) {
    spec.role = GetRequired<std::string>(j, "role", "combat_identity");
    spec.scales_from = GetRequired<std::string>(j, "scales_from", "combat_identity");
    spec.scales_to = GetRequired<std::string>(j, "scales_to", "combat_identity");
    spec.strengths = GetRequired<std::vector<std::string>>(j, "strengths", "combat_identity");
    spec.weaknesses = GetRequired<std::vector<std::string>>(j, "weaknesses", "combat_identity");
}

/**
 * Deserialize TailRole from JSON
 * Each tail has a unique mechanical function
 */
void from_json(const json& j, TailRole& role) {
    role.index = GetRequired<int>(j, "index", "tail_role");
    role.name = GetRequired<std::string>(j, "name", "tail_role");
    role.function = GetRequired<std::string>(j, "function", "tail_role");
}

/**
 * Deserialize engine integration specs from JSON
 */
void from_json(const json& j, EngineIntegration& spec) {
    spec.renderer = GetRequired<std::string>(j, "renderer", "engine_integration");
    spec.gpu_skinning = GetRequired<bool>(j, "gpu_skinning", "engine_integration");
    spec.physics_bones = GetRequired<bool>(j, "physics_bones", "engine_integration");
    spec.lod_system = GetRequired<bool>(j, "lod_system", "engine_integration");
    spec.event_driven_vfx = GetRequired<bool>(j, "event_driven_vfx", "engine_integration");
    
    if (j.contains("lighting")) {
        auto lighting = j["lighting"];
        spec.lighting.no_baked_character_lighting = GetRequired<bool>(lighting, "no_baked_character_lighting", "lighting");
        spec.lighting.validation_lighting = GetRequired<std::string>(lighting, "validation_lighting", "lighting");
    }
}

/**
 * Deserialize mobile profile from JSON
 */
void from_json(const json& j, MobileProfile& spec) {
    spec.allowed_cuts = GetRequired<std::vector<std::string>>(j, "allowed_cuts", "mobile_profile");
    spec.never_cut = GetRequired<std::vector<std::string>>(j, "never_cut", "mobile_profile");
}

/**
 * Deserialize acceptance criteria from JSON
 */
void from_json(const json& j, AcceptanceCriteria& spec) {
    spec.silhouette_match = GetRequired<bool>(j, "silhouette_match", "acceptance_criteria");
    spec.tail_independence_visible = GetRequired<bool>(j, "tail_independence_visible", "acceptance_criteria");
    spec.armor_reads_worn = GetRequired<bool>(j, "armor_reads_worn", "acceptance_criteria");
    spec.idle_feels_dangerous = GetRequired<bool>(j, "idle_feels_dangerous", "acceptance_criteria");
    spec.combat_weight_preserved = GetRequired<bool>(j, "combat_weight_preserved", "acceptance_criteria");
}

/**
 * Deserialize authoritative reference from JSON
 */
void from_json(const json& j, AuthoritativeReference& spec) {
    spec.type = GetRequired<std::string>(j, "type", "authoritative_reference");
    spec.rule = GetRequired<std::string>(j, "rule", "authoritative_reference");
    spec.notes = GetOptional<std::string>(j, "notes", "");
}

// ============================================================================
// MAIN LOAD FUNCTION
// ============================================================================

/**
 * Load character specification from JSON file
 * 
 * VALIDATION:
 * - File must exist and be valid JSON
 * - All required fields must be present
 * - For Kai-Jax: tail_count must be exactly 9 (HARD RULE)
 * - tail_roles array size must match tail_count
 */
CharacterSpecification CharacterSpecification::LoadFromFile(const std::string& path) {
    // Open and parse JSON file
    std::ifstream file(path);
    if (!file.is_open()) {
        throw std::runtime_error("LOAD ERROR: Cannot open file: " + path);
    }
    
    json j;
    try {
        file >> j;
    } catch (const json::exception& e) {
        throw std::runtime_error("LOAD ERROR: JSON parse failed for " + path + ": " + e.what());
    }
    
    // Create specification instance
    CharacterSpecification spec;
    
    // Load top-level fields
    spec.character_id = GetRequired<std::string>(j, "character_id", path);
    spec.display_name = GetRequired<std::string>(j, "display_name", path);
    spec.title = GetOptional<std::string>(j, "title", "");
    spec.version = GetRequired<std::string>(j, "version", path);
    
    // Load authoritative reference
    if (j.contains("authoritative_reference")) {
        spec.authoritative_reference = j["authoritative_reference"].get<AuthoritativeReference>();
    }
    
    // Load all specification sections
    if (j.contains("anatomy")) {
        spec.anatomy = j["anatomy"].get<AnatomySpec>();
    } else {
        throw std::runtime_error("LOAD ERROR: 'anatomy' section missing in " + path);
    }
    
    if (j.contains("silhouette_rules")) {
        spec.silhouette_rules = j["silhouette_rules"].get<SilhouetteRules>();
    }
    
    if (j.contains("modeling")) {
        spec.modeling = j["modeling"].get<ModelingSpec>();
    }
    
    if (j.contains("materials")) {
        spec.materials = j["materials"].get<MaterialSpec>();
    }
    
    if (j.contains("rigging")) {
        spec.rigging = j["rigging"].get<RiggingSpec>();
    }
    
    if (j.contains("animation")) {
        spec.animation = j["animation"].get<AnimationSpec>();
    }
    
    if (j.contains("combat_identity")) {
        spec.combat_identity = j["combat_identity"].get<CombatIdentity>();
    }
    
    if (j.contains("tail_roles")) {
        spec.tail_roles = j["tail_roles"].get<std::vector<TailRole>>();
    }
    
    if (j.contains("engine_integration")) {
        spec.engine_integration = j["engine_integration"].get<EngineIntegration>();
    }
    
    if (j.contains("mobile_profile")) {
        spec.mobile_profile = j["mobile_profile"].get<MobileProfile>();
    }
    
    if (j.contains("acceptance_criteria")) {
        spec.acceptance_criteria = j["acceptance_criteria"].get<AcceptanceCriteria>();
    }
    
    // Validate the loaded specification
    spec.Validate();
    
    return spec;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate the character specification
 * 
 * CRITICAL RULES:
 * - For Kai-Jax: tail_count MUST be 9 (LOCKFILE ENFORCEMENT)
 * - tail_roles array size must match tail_count
 * - rigging.extra_bones.tails.count must match anatomy.tail_count
 */
void CharacterSpecification::Validate() {
    // HARD RULE: Kai-Jax tail count enforcement
    if (IsKaiJax()) {
        if (anatomy.tail_count != 9) {
            throw std::runtime_error(
                "VALIDATION ERROR: Kai-Jax MUST have exactly 9 tails. "
                "Found: " + std::to_string(anatomy.tail_count) + ". "
                "kai_jax.character.json is a LOCKFILE and cannot be modified."
            );
        }
    }
    
    // Validate tail_roles count matches tail_count
    if (!tail_roles.empty()) {
        if (static_cast<int>(tail_roles.size()) != anatomy.tail_count) {
            throw std::runtime_error(
                "VALIDATION ERROR: tail_roles count (" + 
                std::to_string(tail_roles.size()) + 
                ") does not match anatomy.tail_count (" + 
                std::to_string(anatomy.tail_count) + ")"
            );
        }
    }
    
    // Validate rigging tail count matches anatomy tail count
    if (rigging.extra_bones.tails.count != anatomy.tail_count) {
        throw std::runtime_error(
            "VALIDATION ERROR: rigging.extra_bones.tails.count (" + 
            std::to_string(rigging.extra_bones.tails.count) + 
            ") does not match anatomy.tail_count (" + 
            std::to_string(anatomy.tail_count) + ")"
        );
    }
    
    // Enforce design philosophy
    if (!animation.no_floaty_motion) {
        throw std::runtime_error(
            "VALIDATION ERROR: animation.no_floaty_motion must be true. "
            "Mass and inertia matter."
        );
    }
    
    if (rigging.facial_system.anime_exaggeration) {
        throw std::runtime_error(
            "VALIDATION ERROR: facial_system.anime_exaggeration must be false. "
            "No mascot proportions."
        );
    }
    
    if (rigging.extra_bones.tails.constraints.noodle_physics) {
        throw std::runtime_error(
            "VALIDATION ERROR: tail constraints noodle_physics must be false. "
            "Physics must feel grounded."
        );
    }
}

} // namespace Character
} // namespace LegendsEngine
