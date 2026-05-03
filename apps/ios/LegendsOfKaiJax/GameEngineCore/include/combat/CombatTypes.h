#pragma once

#include <string>
#include <vector>
#include <unordered_map>

namespace LegendsEngine {
namespace Combat {

/**
 * @file CombatTypes.h
 * @brief Core data structures for the unified combat system
 * 
 * Maps to schemas/combat_system.schema.json
 * 
 * CANONICAL LAW ENFORCEMENT:
 * - Platform-agnostic (PC is source of truth)
 * - Mass and inertia matter (no floaty motion)
 * - Punish spamming, reward precision
 * - Tail tier integration (combat scales with progression)
 */

/**
 * Attack categories
 */
enum class AttackCategory {
    Light,      // Fast, low damage, easy to combo
    Heavy,      // Slow, high damage, momentum-based
    Special,    // Unique abilities, tail-based
    Finisher    // High-damage ending moves
};

/**
 * Combat philosophy focus areas
 */
enum class CombatFocus {
    Speed,
    Precision,
    Momentum,
    Agility
};

/**
 * Dodge types available
 */
enum class DodgeType {
    GroundRoll,
    AirDash,
    Sidestep,
    Backstep
};

/**
 * Movement style
 */
enum class MovementStyle {
    Agile,
    Standard,
    Parkour
};

/**
 * Attack definition
 * Defines a specific attack move
 */
struct AttackDefinition {
    std::string id;
    std::string name;
    AttackCategory category = AttackCategory::Light;
    float damage = 10.0f;
    int execution_frames = 30;   // Frames to complete attack
    int recovery_frames = 15;    // Frames before next action
    std::vector<std::string> can_cancel_into; // Attack IDs this can cancel into
    int requires_tail_tier = 3;  // Minimum tail tier (3-9)
    bool momentum_based = false; // Whether damage scales with momentum
    
    // Hit properties
    float knockback_strength = 1.0f;
    float hitstun_frames = 10.0f;
    float range = 2.0f;
};

/**
 * Combat stats modifiers based on tail tier
 * References data/world/tail_tier_reactions.json
 */
struct TailTierCombatModifier {
    float damage_multiplier = 1.0f;
    float speed_multiplier = 1.0f;
    std::vector<std::string> available_attacks; // Attack IDs unlocked
    std::vector<std::string> unlocked_abilities; // Special abilities
};

/**
 * Base movement parameters
 */
struct MovementParameters {
    float walk_speed = 3.0f;
    float run_speed = 6.0f;
    float sprint_speed = 10.0f;
    bool mass_affects_momentum = true; // CANON REQUIREMENT
    float mass = 1.0f;                 // Character mass
    float inertia_factor = 0.85f;      // How much momentum is preserved
};

/**
 * Agility features
 */
struct AgilityFeatures {
    bool instant_direction_change = true;
    bool air_control_enabled = true;
    std::vector<DodgeType> available_dodges;
    bool wall_run_enabled = true;
    bool wall_jump_enabled = true;
    float dodge_distance = 3.0f;
    int dodge_invincibility_frames = 8;
};

/**
 * Combat mechanics configuration
 */
struct CombatMechanics {
    bool hit_stop_enabled = true;
    int hit_stop_duration_ms = 80;    // Hit-stop freeze frame duration
    bool combo_system_enabled = true;
    bool parry_enabled = true;
    bool counter_enabled = true;
    int parry_window_frames = 6;      // Parry timing window
    float perfect_parry_multiplier = 2.0f; // Damage multiplier on perfect parry
};

/**
 * Combo state tracking
 */
struct ComboState {
    int hit_count = 0;
    float total_damage = 0.0f;
    std::vector<std::string> move_sequence;
    float last_hit_time = 0.0f;
    float combo_timeout = 2.0f; // Seconds before combo resets
    bool is_active = false;
};

/**
 * Hit data - information about a landed hit
 */
struct HitData {
    std::string attacker_id;
    std::string defender_id;
    std::string attack_id;
    float damage = 0.0f;
    float knockback_x = 0.0f;
    float knockback_y = 0.0f;
    float knockback_z = 0.0f;
    int hitstun_frames = 0;
    bool is_counter_hit = false;
    bool is_parried = false;
};

/**
 * Character combat state
 */
enum class CombatState {
    Idle,
    Moving,
    Attacking,
    Dodging,
    Blocking,
    Stunned,
    KnockedDown
};

/**
 * Character in combat
 */
struct CombatCharacter {
    std::string character_id;
    int current_tail_count = 3; // 3-9, affects combat abilities
    
    // Current state
    CombatState state = CombatState::Idle;
    float health = 100.0f;
    float max_health = 100.0f;
    
    // Position and velocity
    float pos_x = 0.0f;
    float pos_y = 0.0f;
    float pos_z = 0.0f;
    float vel_x = 0.0f;
    float vel_y = 0.0f;
    float vel_z = 0.0f;
    
    // Combat state
    ComboState combo;
    std::string current_attack_id;
    int attack_frame = 0;
    int stun_frames_remaining = 0;
    
    // Tail tier modifiers (loaded from combat_system.json)
    TailTierCombatModifier tail_modifiers;
    
    // Movement
    MovementParameters movement;
    AgilityFeatures agility;
};

/**
 * Combat system configuration
 * Loaded from schemas/combat_system.schema.json
 */
struct CombatSystemConfig {
    std::string version;
    std::vector<CombatFocus> philosophy_focus;
    bool punish_spamming = true;     // CANON REQUIREMENT
    bool reward_precision = true;    // CANON REQUIREMENT
    
    CombatMechanics mechanics;
    MovementParameters base_movement;
    AgilityFeatures agility_features;
    
    // All attack definitions
    std::unordered_map<std::string, AttackDefinition> attacks;
    
    // Tail tier combat modifiers (3-9)
    std::unordered_map<int, TailTierCombatModifier> tail_tier_modifiers;
};

} // namespace Combat
} // namespace LegendsEngine
