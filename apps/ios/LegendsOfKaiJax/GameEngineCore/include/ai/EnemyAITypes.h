#pragma once

#include <string>
#include <vector>
#include <unordered_map>

namespace LegendsEngine {
namespace AI {

/**
 * @file EnemyAITypes.h
 * @brief Data structures for enemy AI behavior system
 * 
 * Maps to schemas/enemy_ai.schema.json
 * Integrates with data/world/tail_tier_reactions.json
 * 
 * CANONICAL LAW:
 * - Enemy behavior adapts to player tail count
 * - Fodder/Elite/Boss tiers have distinct AI complexity
 * - Platform-agnostic behavior rules
 */

/**
 * Enemy tier
 * Determines AI complexity and behavior patterns
 */
enum class EnemyTier {
    Fodder,  // Quick to defeat, spectacle-focused
    Elite,   // Tactical, smarter AI
    Boss     // Highly challenging, unique mechanics
};

/**
 * Engagement style
 */
enum class EngagementStyle {
    Aggressive,  // Rushes player, high aggression
    Defensive,   // Waits for openings, cautious
    Tactical,    // Uses strategy, coordinates
    Berserker,   // Reckless, high damage
    Desperate    // Low health, unpredictable
};

/**
 * AI state
 */
enum class AIState {
    Idle,
    Patrol,
    Alert,
    Engaging,
    Attacking,
    Retreating,
    Fleeing,
    Stunned,
    Dead
};

/**
 * Attack definition for enemies
 */
struct EnemyAttack {
    std::string attack_id;
    std::string attack_name;
    float damage_multiplier = 1.0f;
    float cooldown = 2.0f;           // Seconds between uses
    float range = 2.0f;
    float windup_time = 0.5f;        // Telegraph time
    bool can_be_interrupted = true;
};

/**
 * Base behavior pattern
 */
struct BehaviorPattern {
    EngagementStyle engagement_style = EngagementStyle::Aggressive;
    float aggression_level = 0.5f;    // 0.0 = passive, 1.0 = relentless
    float engagement_range = 5.0f;
    float retreat_threshold = 0.2f;   // Health % to consider retreat
    bool group_coordination = false;
};

/**
 * Tail tier adaptation
 * How AI behavior changes based on player tail count
 * References data/world/tail_tier_reactions.json
 */
struct TailTierAdaptation {
    float confidence_modifier = 1.0f;  // < 1.0 = fearful, > 1.0 = overconfident
    float engagement_distance_modifier = 0.0f;
    bool flee_on_sight = false;
    bool spawn_disabled = false;
    EngagementStyle tactics_override = EngagementStyle::Aggressive;
    bool has_tactics_override = false;
};

/**
 * Base enemy stats
 */
struct EnemyStats {
    float health = 100.0f;
    float damage = 10.0f;
    float speed = 3.0f;
    float defense = 0.0f;
};

/**
 * Combat capabilities for enemies
 */
struct EnemyCombatCapabilities {
    std::vector<EnemyAttack> attack_types;
    bool can_block = false;
    bool can_dodge = false;
    bool can_counter = false;
};

/**
 * Spawn rules
 */
struct SpawnRules {
    int group_size_min = 1;
    int group_size_max = 3;
    int requires_tail_tier = 3; // Minimum player tail tier
};

/**
 * Enemy AI configuration
 * Loaded from JSON files
 */
struct EnemyAIConfig {
    std::string enemy_id;
    std::string enemy_type;
    EnemyTier tier = EnemyTier::Fodder;
    
    EnemyStats base_stats;
    BehaviorPattern base_behavior;
    EnemyCombatCapabilities combat_capabilities;
    SpawnRules spawn_rules;
    
    // Tail tier adaptations (3-9)
    std::unordered_map<int, TailTierAdaptation> tail_tier_adaptations;
};

/**
 * Runtime enemy instance
 */
struct EnemyInstance {
    std::string instance_id;
    std::string enemy_config_id;
    
    // Current state
    AIState state = AIState::Patrol;
    float health = 100.0f;
    float max_health = 100.0f;
    
    // Position
    float pos_x = 0.0f;
    float pos_y = 0.0f;
    float pos_z = 0.0f;
    
    // Velocity
    float vel_x = 0.0f;
    float vel_y = 0.0f;
    float vel_z = 0.0f;
    
    // AI state
    float state_timer = 0.0f;
    std::string target_character_id; // Player or other target
    float last_attack_time = 0.0f;
    float alert_timer = 0.0f;
    
    // Behavior (modified by tail tier)
    BehaviorPattern current_behavior;
    
    // Group coordination
    std::vector<std::string> nearby_allies;
    bool is_group_leader = false;
    
    // Current attack
    std::string current_attack_id;
    float attack_windup_timer = 0.0f;
};

/**
 * Enemy group coordination data
 */
struct EnemyGroup {
    std::string group_id;
    std::string leader_id;
    std::vector<std::string> member_ids;
    
    // Group tactics
    float formation_spread = 3.0f;
    bool coordinate_attacks = false;
    float attack_delay_between_members = 0.5f;
};

} // namespace AI
} // namespace LegendsEngine
