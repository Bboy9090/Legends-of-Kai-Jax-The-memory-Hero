#include "ai/EnemyAI.h"
#include <nlohmann/json.hpp>
#include <fstream>
#include <iostream>
#include <cmath>
#include <algorithm>
#include <filesystem>

using json = nlohmann::json;
namespace fs = std::filesystem;

namespace LegendsEngine {
namespace AI {

EnemyAI::EnemyAI() {}

EnemyAI::~EnemyAI() {}

bool EnemyAI::LoadConfigurations(
    const std::string& enemy_configs_path,
    const std::string& tail_tier_reactions_path
) {
    try {
        // Load all enemy configuration files from directory
        for (const auto& entry : fs::directory_iterator(enemy_configs_path)) {
            if (entry.path().extension() == ".json") {
                std::ifstream config_file(entry.path());
                if (!config_file.is_open()) {
                    std::cerr << "Failed to open enemy config: " << entry.path() << std::endl;
                    continue;
                }

                json enemy_json = json::parse(config_file);
                
                EnemyAIConfig config;
                config.enemy_id = enemy_json["enemy_id"].get<std::string>();
                config.enemy_type = enemy_json["enemy_type"].get<std::string>();
                
                // Parse tier
                std::string tier_str = enemy_json["tier"].get<std::string>();
                if (tier_str == "fodder") config.tier = EnemyTier::Fodder;
                else if (tier_str == "elite") config.tier = EnemyTier::Elite;
                else if (tier_str == "boss") config.tier = EnemyTier::Boss;
                
                // Parse base stats
                auto& stats = enemy_json["base_stats"];
                config.base_stats.health = stats["health"].get<float>();
                config.base_stats.damage = stats["damage"].get<float>();
                config.base_stats.speed = stats["speed"].get<float>();
                config.base_stats.defense = stats.value("defense", 0.0f);
                
                // Parse base behavior
                auto& behavior = enemy_json["base_behavior"];
                
                std::string engagement_str = behavior["engagement_style"].get<std::string>();
                if (engagement_str == "aggressive") config.base_behavior.engagement_style = EngagementStyle::Aggressive;
                else if (engagement_str == "defensive") config.base_behavior.engagement_style = EngagementStyle::Defensive;
                else if (engagement_str == "tactical") config.base_behavior.engagement_style = EngagementStyle::Tactical;
                
                config.base_behavior.aggression_level = behavior["aggression_level"].get<float>();
                config.base_behavior.engagement_range = behavior["engagement_range"].get<float>();
                config.base_behavior.retreat_threshold = behavior["retreat_threshold"].get<float>();
                config.base_behavior.group_coordination = behavior.value("group_coordination", false);
                
                // Parse combat capabilities
                if (enemy_json.contains("combat_capabilities")) {
                    auto& combat = enemy_json["combat_capabilities"];
                    
                    if (combat.contains("attack_types")) {
                        for (auto& attack : combat["attack_types"]) {
                            EnemyAttack enemy_attack;
                            enemy_attack.attack_id = attack["attack_id"].get<std::string>();
                            enemy_attack.attack_name = attack["attack_name"].get<std::string>();
                            enemy_attack.damage_multiplier = attack["damage_multiplier"].get<float>();
                            enemy_attack.cooldown = attack["cooldown"].get<float>();
                            enemy_attack.range = attack["range"].get<float>();
                            enemy_attack.windup_time = attack["windup_time"].get<float>();
                            enemy_attack.can_be_interrupted = attack.value("can_be_interrupted", true);
                            
                            config.combat_capabilities.attack_types.push_back(enemy_attack);
                        }
                    }
                    
                    config.combat_capabilities.can_block = combat.value("can_block", false);
                    config.combat_capabilities.can_dodge = combat.value("can_dodge", false);
                    config.combat_capabilities.can_counter = combat.value("can_counter", false);
                }
                
                // Parse spawn rules
                if (enemy_json.contains("spawn_rules")) {
                    auto& spawn = enemy_json["spawn_rules"];
                    config.spawn_rules.group_size_min = spawn.value("group_size_min", 1);
                    config.spawn_rules.group_size_max = spawn.value("group_size_max", 3);
                    config.spawn_rules.requires_tail_tier = spawn.value("requires_tail_tier", 3);
                }
                
                // Parse tail tier adaptations
                if (enemy_json.contains("tail_tier_adaptations")) {
                    for (auto& [tier_str, tier_data] : enemy_json["tail_tier_adaptations"].items()) {
                        int tier = std::stoi(tier_str);
                        TailTierAdaptation adaptation;
                        adaptation.confidence_modifier = tier_data["confidence_modifier"].get<float>();
                        adaptation.engagement_distance_modifier = tier_data["engagement_distance_modifier"].get<float>();
                        adaptation.flee_on_sight = tier_data.value("flee_on_sight", false);
                        adaptation.spawn_disabled = tier_data.value("spawn_disabled", false);
                        
                        if (tier_data.contains("tactics_override")) {
                            std::string tactics_str = tier_data["tactics_override"].get<std::string>();
                            adaptation.has_tactics_override = true;
                            if (tactics_str == "aggressive") adaptation.tactics_override = EngagementStyle::Aggressive;
                            else if (tactics_str == "defensive") adaptation.tactics_override = EngagementStyle::Defensive;
                            else if (tactics_str == "desperate") adaptation.tactics_override = EngagementStyle::Desperate;
                        }
                        
                        config.tail_tier_adaptations[tier] = adaptation;
                    }
                }
                
                enemy_configs_[config.enemy_id] = config;
                std::cout << "Loaded enemy config: " << config.enemy_id << std::endl;
            }
        }
        
        std::cout << "Enemy AI configurations loaded successfully" << std::endl;
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "Error loading enemy AI configurations: " << e.what() << std::endl;
        return false;
    }
}

void EnemyAI::Initialize() {
    std::cout << "Enemy AI system initialized" << std::endl;
}

void EnemyAI::Update(float deltaTime) {
    // Update all active enemies
    for (auto& [id, enemy] : enemies_) {
        UpdateEnemyState(enemy, deltaTime);
    }
    
    // Update group coordination
    for (auto& [id, group] : groups_) {
        UpdateGroupCoordination(group, deltaTime);
    }
}

std::string EnemyAI::SpawnEnemy(const std::string& enemy_config_id,
                               float x, float y, float z) {
    auto config_it = enemy_configs_.find(enemy_config_id);
    if (config_it == enemy_configs_.end()) {
        std::cerr << "Enemy config not found: " << enemy_config_id << std::endl;
        return "";
    }
    
    // Check if can spawn at current tail tier
    if (!CanSpawnAtCurrentTier(enemy_config_id)) {
        std::cerr << "Enemy cannot spawn at current tail tier: " << enemy_config_id << std::endl;
        return "";
    }
    
    const auto& config = config_it->second;
    
    // Create enemy instance
    EnemyInstance enemy;
    enemy.instance_id = "enemy_" + std::to_string(next_instance_id_++);
    enemy.enemy_config_id = enemy_config_id;
    enemy.state = AIState::Patrol;
    enemy.health = config.base_stats.health;
    enemy.max_health = config.base_stats.health;
    enemy.pos_x = x;
    enemy.pos_y = y;
    enemy.pos_z = z;
    enemy.current_behavior = config.base_behavior;
    
    // Apply tail tier adaptations
    enemies_[enemy.instance_id] = enemy;
    ApplyTailTierAdaptation(enemies_[enemy.instance_id]);
    
    if (enemy_spawned_callback_) {
        enemy_spawned_callback_(enemy.instance_id);
    }
    
    std::cout << "Spawned enemy: " << enemy.instance_id << " at (" << x << ", " << y << ", " << z << ")" << std::endl;
    return enemy.instance_id;
}

void EnemyAI::RemoveEnemy(const std::string& instance_id) {
    enemies_.erase(instance_id);
}

EnemyInstance* EnemyAI::GetEnemy(const std::string& instance_id) {
    auto it = enemies_.find(instance_id);
    return (it != enemies_.end()) ? &it->second : nullptr;
}

const EnemyInstance* EnemyAI::GetEnemy(const std::string& instance_id) const {
    auto it = enemies_.find(instance_id);
    return (it != enemies_.end()) ? &it->second : nullptr;
}

std::vector<EnemyInstance*> EnemyAI::GetActiveEnemies() {
    std::vector<EnemyInstance*> active;
    for (auto& [id, enemy] : enemies_) {
        if (enemy.state != AIState::Dead) {
            active.push_back(&enemy);
        }
    }
    return active;
}

void EnemyAI::SetPlayerTailCount(int tail_count) {
    // CANON ENFORCEMENT: Tail count must be 3-9
    if (tail_count < 3 || tail_count > 9) {
        std::cerr << "Invalid tail count: " << tail_count << " (must be 3-9)" << std::endl;
        return;
    }
    
    player_tail_count_ = tail_count;
    
    // Re-apply tail tier adaptations to all active enemies
    for (auto& [id, enemy] : enemies_) {
        ApplyTailTierAdaptation(enemy);
    }
    
    std::cout << "Player tail count updated to " << tail_count << std::endl;
}

void EnemyAI::SetPlayerPosition(float x, float y, float z) {
    player_x_ = x;
    player_y_ = y;
    player_z_ = z;
}

bool EnemyAI::CanSpawnAtCurrentTier(const std::string& enemy_config_id) const {
    auto config_it = enemy_configs_.find(enemy_config_id);
    if (config_it == enemy_configs_.end()) {
        return false;
    }
    
    const auto& config = config_it->second;
    
    // Check spawn tier requirement
    if (player_tail_count_ < config.spawn_rules.requires_tail_tier) {
        return false;
    }
    
    // Check if spawn disabled at current tier
    auto adapt_it = config.tail_tier_adaptations.find(player_tail_count_);
    if (adapt_it != config.tail_tier_adaptations.end()) {
        if (adapt_it->second.spawn_disabled) {
            return false;
        }
    }
    
    return true;
}

std::string EnemyAI::CreateEnemyGroup(const std::vector<std::string>& enemy_ids) {
    EnemyGroup group;
    group.group_id = "group_" + std::to_string(next_group_id_++);
    group.member_ids = enemy_ids;
    
    // Set first enemy as leader
    if (!enemy_ids.empty()) {
        group.leader_id = enemy_ids[0];
        auto* leader = GetEnemy(group.leader_id);
        if (leader) {
            leader->is_group_leader = true;
        }
    }
    
    groups_[group.group_id] = group;
    return group.group_id;
}

void EnemyAI::DissolveGroup(const std::string& group_id) {
    groups_.erase(group_id);
}

std::string EnemyAI::GetEnemyGroup(const std::string& instance_id) const {
    for (const auto& [group_id, group] : groups_) {
        auto it = std::find(group.member_ids.begin(), group.member_ids.end(), instance_id);
        if (it != group.member_ids.end()) {
            return group_id;
        }
    }
    return "";
}

void EnemyAI::DamageEnemy(const std::string& instance_id, float damage,
                         const std::string& attacker_id) {
    auto* enemy = GetEnemy(instance_id);
    if (!enemy) return;
    
    enemy->health -= damage;
    
    if (enemy->health <= 0.0f) {
        enemy->health = 0.0f;
        enemy->state = AIState::Dead;
        
        if (enemy_defeated_callback_) {
            enemy_defeated_callback_(instance_id);
        }
    }
}

void EnemyAI::StunEnemy(const std::string& instance_id, float duration) {
    auto* enemy = GetEnemy(instance_id);
    if (!enemy) return;
    
    enemy->state = AIState::Stunned;
    enemy->state_timer = duration;
}

EnemyAI::AIAction EnemyAI::GetEnemyAction(const std::string& instance_id) {
    auto* enemy = GetEnemy(instance_id);
    if (!enemy) return AIAction();
    
    AIAction action;
    
    switch (enemy->state) {
        case AIState::Patrol:
        case AIState::Alert:
        case AIState::Engaging:
            action.type = AIAction::Type::Move;
            // Calculate direction to player
            if (IsPlayerInRange(*enemy, enemy->current_behavior.engagement_range)) {
                float dx = player_x_ - enemy->pos_x;
                float dz = player_z_ - enemy->pos_z;
                float dist = std::sqrt(dx * dx + dz * dz);
                if (dist > 0.01f) {
                    action.move_x = dx / dist;
                    action.move_z = dz / dist;
                }
            }
            break;
            
        case AIState::Attacking:
            action.type = AIAction::Type::Attack;
            action.attack_id = enemy->current_attack_id;
            break;
            
        case AIState::Retreating:
        case AIState::Fleeing:
            action.type = AIAction::Type::Flee;
            // Move away from player
            {
                float dx = enemy->pos_x - player_x_;
                float dz = enemy->pos_z - player_z_;
                float dist = std::sqrt(dx * dx + dz * dz);
                if (dist > 0.01f) {
                    action.move_x = dx / dist;
                    action.move_z = dz / dist;
                }
            }
            break;
            
        default:
            action.type = AIAction::Type::None;
            break;
    }
    
    return action;
}

// Private helper functions

void EnemyAI::UpdateEnemyState(EnemyInstance& enemy, float deltaTime) {
    enemy.state_timer += deltaTime;
    
    // Check for state transitions based on player tail count
    if (ShouldFlee(enemy)) {
        enemy.state = AIState::Fleeing;
    }
    
    switch (enemy.state) {
        case AIState::Idle:
            enemy.state = AIState::Patrol;
            break;
            
        case AIState::Patrol:
            UpdatePatrolState(enemy, deltaTime);
            break;
            
        case AIState::Alert:
            UpdateAlertState(enemy, deltaTime);
            break;
            
        case AIState::Engaging:
            UpdateEngagingState(enemy, deltaTime);
            break;
            
        case AIState::Attacking:
            UpdateAttackingState(enemy, deltaTime);
            break;
            
        case AIState::Retreating:
            UpdateRetreatingState(enemy, deltaTime);
            break;
            
        case AIState::Fleeing:
            UpdateFleeingState(enemy, deltaTime);
            break;
            
        case AIState::Stunned:
            if (enemy.state_timer >= 1.0f) { // Stun duration
                enemy.state = AIState::Engaging;
                enemy.state_timer = 0.0f;
            }
            break;
            
        case AIState::Dead:
            // Do nothing
            break;
    }
}

void EnemyAI::UpdatePatrolState(EnemyInstance& enemy, float deltaTime) {
    // Check if player is in range
    if (IsPlayerInRange(enemy, enemy.current_behavior.engagement_range * 1.5f)) {
        enemy.state = AIState::Alert;
        enemy.state_timer = 0.0f;
        
        if (enemy_alerted_callback_) {
            enemy_alerted_callback_(enemy.instance_id);
        }
    }
}

void EnemyAI::UpdateAlertState(EnemyInstance& enemy, float deltaTime) {
    // Transition to engaging after alert period
    if (enemy.state_timer >= 0.5f) {
        enemy.state = AIState::Engaging;
        enemy.state_timer = 0.0f;
    }
}

void EnemyAI::UpdateEngagingState(EnemyInstance& enemy, float deltaTime) {
    // Check if should retreat
    if (ShouldRetreat(enemy)) {
        enemy.state = AIState::Retreating;
        enemy.state_timer = 0.0f;
        return;
    }
    
    // Check if can attack
    if (CanAttack(enemy)) {
        enemy.current_attack_id = SelectAttack(enemy);
        if (!enemy.current_attack_id.empty()) {
            enemy.state = AIState::Attacking;
            enemy.state_timer = 0.0f;
            enemy.last_attack_time = 0.0f;
        }
    }
}

void EnemyAI::UpdateAttackingState(EnemyInstance& enemy, float deltaTime) {
    // Get attack windup time
    auto config_it = enemy_configs_.find(enemy.enemy_config_id);
    if (config_it == enemy_configs_.end()) {
        enemy.state = AIState::Engaging;
        return;
    }
    
    // Find attack definition
    float windup_time = 0.5f; // Default
    for (const auto& attack : config_it->second.combat_capabilities.attack_types) {
        if (attack.attack_id == enemy.current_attack_id) {
            windup_time = attack.windup_time;
            break;
        }
    }
    
    // Complete attack after windup
    if (enemy.state_timer >= windup_time) {
        enemy.state = AIState::Engaging;
        enemy.state_timer = 0.0f;
        enemy.current_attack_id.clear();
    }
}

void EnemyAI::UpdateRetreatingState(EnemyInstance& enemy, float deltaTime) {
    // Retreat for a duration
    if (enemy.state_timer >= 2.0f) {
        // Check if safe to re-engage
        if (!ShouldRetreat(enemy)) {
            enemy.state = AIState::Engaging;
            enemy.state_timer = 0.0f;
        }
    }
}

void EnemyAI::UpdateFleeingState(EnemyInstance& enemy, float deltaTime) {
    // Keep fleeing if flee condition is still active
    if (!ShouldFlee(enemy)) {
        enemy.state = AIState::Patrol;
        enemy.state_timer = 0.0f;
    }
}

void EnemyAI::ApplyTailTierAdaptation(EnemyInstance& enemy) {
    auto config_it = enemy_configs_.find(enemy.enemy_config_id);
    if (config_it == enemy_configs_.end()) return;
    
    const auto& config = config_it->second;
    
    // Start with base behavior
    enemy.current_behavior = config.base_behavior;
    
    // Apply tail tier adaptation
    auto adapt_it = config.tail_tier_adaptations.find(player_tail_count_);
    if (adapt_it != config.tail_tier_adaptations.end()) {
        const auto& adaptation = adapt_it->second;
        
        // Apply confidence modifier to aggression
        enemy.current_behavior.aggression_level *= adaptation.confidence_modifier;
        
        // Apply engagement distance modifier
        enemy.current_behavior.engagement_range += adaptation.engagement_distance_modifier;
        
        // Override tactics if specified
        if (adaptation.has_tactics_override) {
            enemy.current_behavior.engagement_style = adaptation.tactics_override;
        }
    }
}

float EnemyAI::GetDistanceToPlayer(const EnemyInstance& enemy) const {
    float dx = enemy.pos_x - player_x_;
    float dz = enemy.pos_z - player_z_;
    return std::sqrt(dx * dx + dz * dz);
}

bool EnemyAI::IsPlayerInRange(const EnemyInstance& enemy, float range) const {
    return GetDistanceToPlayer(enemy) <= range;
}

bool EnemyAI::ShouldFlee(const EnemyInstance& enemy) const {
    auto config_it = enemy_configs_.find(enemy.enemy_config_id);
    if (config_it == enemy_configs_.end()) return false;
    
    const auto& config = config_it->second;
    
    // Check tail tier adaptation for flee condition
    auto adapt_it = config.tail_tier_adaptations.find(player_tail_count_);
    if (adapt_it != config.tail_tier_adaptations.end()) {
        if (adapt_it->second.flee_on_sight) {
            return true;
        }
    }
    
    return false;
}

bool EnemyAI::ShouldRetreat(const EnemyInstance& enemy) const {
    // Retreat if health is below threshold
    float health_ratio = enemy.health / enemy.max_health;
    return health_ratio < enemy.current_behavior.retreat_threshold;
}

void EnemyAI::UpdateGroupCoordination(EnemyGroup& group, float deltaTime) {
    // Simple group coordination - stagger attacks
    if (group.coordinate_attacks) {
        // Would implement coordinated attack timing here
    }
}

std::vector<std::string> EnemyAI::GetNearbyAllies(const EnemyInstance& enemy, float range) const {
    std::vector<std::string> allies;
    
    for (const auto& [id, other_enemy] : enemies_) {
        if (id == enemy.instance_id) continue;
        if (other_enemy.state == AIState::Dead) continue;
        
        float dx = other_enemy.pos_x - enemy.pos_x;
        float dz = other_enemy.pos_z - enemy.pos_z;
        float dist = std::sqrt(dx * dx + dz * dz);
        
        if (dist <= range) {
            allies.push_back(id);
        }
    }
    
    return allies;
}

std::string EnemyAI::SelectAttack(const EnemyInstance& enemy) const {
    auto config_it = enemy_configs_.find(enemy.enemy_config_id);
    if (config_it == enemy_configs_.end()) return "";
    
    const auto& attacks = config_it->second.combat_capabilities.attack_types;
    if (attacks.empty()) return "";
    
    // Simple attack selection - pick first available attack in range
    float dist_to_player = GetDistanceToPlayer(enemy);
    
    for (const auto& attack : attacks) {
        if (dist_to_player <= attack.range) {
            return attack.attack_id;
        }
    }
    
    return "";
}

bool EnemyAI::CanAttack(const EnemyInstance& enemy) const {
    // Check if enough time has passed since last attack
    auto config_it = enemy_configs_.find(enemy.enemy_config_id);
    if (config_it == enemy_configs_.end()) return false;
    
    const auto& attacks = config_it->second.combat_capabilities.attack_types;
    if (attacks.empty()) return false;
    
    // Check cooldown (simplified - using first attack's cooldown)
    return enemy.last_attack_time <= 0.0f || 
           enemy.state_timer >= attacks[0].cooldown;
}

} // namespace AI
} // namespace LegendsEngine
