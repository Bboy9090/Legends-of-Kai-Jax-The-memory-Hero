#pragma once

#include <string>
#include <vector>
#include <array>
#include <map>

/**
 * CharacterTypes.h
 * 
 * Data structures that map to the character JSON specification.
 * These types are designed to be data-driven and platform-agnostic.
 * 
 * DESIGN INTENT:
 * - Pure data containers - no game logic here
 * - Direct mapping to kai_jax.character.json structure
 * - Standard containers for portability
 * - Forward declarations for engine types to avoid coupling
 */

namespace LegendsEngine {
namespace Character {

/**
 * AnatomySpec - Physical composition and body structure
 * 
 * Maps to the "anatomy" section of character JSON.
 * Defines species composition, body type, and physical attributes.
 */
struct AnatomySpec {
    std::vector<std::string> species_composite;
    std::string body_type;
    float height_multiplier;
    std::string build;
    std::string legs;
    std::string hands;
    std::string head;
    std::string spine;
    int tail_count;  // CRITICAL: For Kai-Jax, this MUST be 9
};

/**
 * SilhouetteRules - Visual distinctiveness requirements
 * 
 * Enforces readability and anti-derivative rules.
 */
struct SilhouetteRules {
    bool readable_in_shadow;
    bool no_mascot_proportions;
    bool no_cape_substitution;
    std::string tails_must_arc;
    bool anti_derivative_enforced;
};

/**
 * LODTarget - Level of detail polygon budget
 */
struct LODTarget {
    std::array<int, 2> triangles;  // [min, max]
};

/**
 * ModelingSpec - 3D model topology and LOD requirements
 * 
 * Maps to the "modeling" section.
 * Defines units, scale, topology requirements, and LOD targets.
 */
struct ModelingSpec {
    std::string units;
    float scale;
    std::string topology;
    std::map<std::string, LODTarget> lod_targets;  // "lod0", "lod1", "lod2"
    std::vector<std::string> edge_loops_required;
};

/**
 * FurMaterial - Fur rendering specification
 */
struct FurMaterial {
    std::string type;
    bool pbr;
    std::vector<std::string> maps;
    std::string notes;
};

/**
 * SkinMaterial - Skin/flesh material specification
 */
struct SkinMaterial {
    bool pbr;
    bool subsurface_scattering;
};

/**
 * ArmorMaterial - Armor/metal material specification
 */
struct ArmorMaterial {
    std::string material;
    std::array<float, 2> roughness_range;  // [min, max]
    bool edge_wear;
    bool clean_surfaces_disallowed;
};

/**
 * SpikesMaterial - Spikes/bone material specification
 */
struct SpikesMaterial {
    std::string material;
    std::string emissive;
};

/**
 * WeaveEnergyMaterial - Energy/effect material specification
 */
struct WeaveEnergyMaterial {
    bool emissive;
    bool always_on;
    bool mobile_disabled;
};

/**
 * MaterialSpec - All material definitions
 * 
 * Maps to the "materials" section.
 * Defines PBR materials for fur, skin, armor, etc.
 */
struct MaterialSpec {
    FurMaterial fur;
    SkinMaterial skin;
    ArmorMaterial armor;
    SpikesMaterial spikes;
    WeaveEnergyMaterial weave_energy;
};

/**
 * TailConstraints - Physics constraints for tail bones
 */
struct TailConstraints {
    bool swing_limit;
    bool twist_limit;
    bool noodle_physics;  // Must be false - no noodle physics!
};

/**
 * TailSpec - Tail rigging specification
 * 
 * Defines tail bone structure and physics.
 * CRITICAL: For Kai-Jax, count MUST be 9.
 */
struct TailSpec {
    int count;
    std::array<int, 2> bones_per_tail;  // [min, max]
    bool physics_enabled;
    TailConstraints constraints;
};

/**
 * ExtraBones - Additional bone requirements beyond humanoid base
 */
struct ExtraBones {
    TailSpec tails;
    bool spine_deformation;
    bool jaw;
    bool ears;
};

/**
 * FacialSystem - Facial animation system specification
 */
struct FacialSystem {
    std::string type;
    std::vector<std::string> required;
    bool anime_exaggeration;  // Must be false - no anime style
};

/**
 * RiggingSpec - Skeletal rig and animation system
 * 
 * Maps to the "rigging" section.
 * Defines skeleton type, extra bones, and facial system.
 */
struct RiggingSpec {
    std::string skeleton_type;
    bool single_skeleton_only;
    ExtraBones extra_bones;
    FacialSystem facial_system;
};

/**
 * FrameRules - Animation frame timing rules
 */
struct FrameRules {
    int min_frames_per_action;
    std::string cancel_rules;
};

/**
 * AnimationSpec - Animation philosophy and requirements
 * 
 * Maps to the "animation" section.
 * Defines animation philosophy (mass and inertia), required sets, and frame rules.
 */
struct AnimationSpec {
    std::string philosophy;
    bool no_floaty_motion;  // Must be true - mass matters
    std::vector<std::string> root_motion_only_for;
    std::vector<std::string> required_sets;
    FrameRules frame_rules;
};

/**
 * CombatIdentity - Combat role and scaling
 */
struct CombatIdentity {
    std::string role;
    std::string scales_from;
    std::string scales_to;
    std::vector<std::string> strengths;
    std::vector<std::string> weaknesses;
};

/**
 * TailRole - Individual tail function definition
 * 
 * Maps to entries in the "tail_roles" array.
 * Each of Kai-Jax's 9 tails has a specific mechanical function.
 */
struct TailRole {
    int index;
    std::string name;
    std::string function;
};

/**
 * EngineIntegration - Engine-specific rendering and system requirements
 */
struct EngineIntegration {
    std::string renderer;
    bool gpu_skinning;
    bool physics_bones;
    bool lod_system;
    bool event_driven_vfx;
    struct {
        bool no_baked_character_lighting;
        std::string validation_lighting;
    } lighting;
};

/**
 * MobileProfile - Mobile platform adaptation rules
 * 
 * Defines what can and cannot be cut on mobile.
 * CRITICAL: silhouette, tail_count, animation_timing, posture_system, hit_stop
 * can NEVER be cut.
 */
struct MobileProfile {
    std::vector<std::string> allowed_cuts;
    std::vector<std::string> never_cut;
};

/**
 * AcceptanceCriteria - Quality validation checklist
 */
struct AcceptanceCriteria {
    bool silhouette_match;
    bool tail_independence_visible;
    bool armor_reads_worn;
    bool idle_feels_dangerous;
    bool combat_weight_preserved;
};

/**
 * AuthoritativeReference - Source of truth metadata
 */
struct AuthoritativeReference {
    std::string type;
    std::string rule;
    std::string notes;
};

} // namespace Character
} // namespace LegendsEngine
