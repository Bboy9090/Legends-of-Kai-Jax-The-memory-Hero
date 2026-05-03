#pragma once

#include "EnemyAITypes.h"
#include <string>
#include <memory>
#include <functional>

namespace LegendsEngine {
namespace AI {

/**
 * @file EnemyAI.h
 * @brief Enemy AI behavior system
 * 
 * Implements behavior tiers:
 * - Fodder: Simple, spectacle-focused
 * - Elite: Tactical, coordinated
 * - Boss: Complex, unique mechanics
 * 
 * Integrates with tail_tier_reactions.json for dynamic behavior
 * 
 * CANONICAL LAW:
 * - AI adapts to player tail count systemically
 * - No platform-specific AI logic
 * - Behavior rules identical everywhere
 */

class EnemyAI {
public:
    EnemyAI();
    ~EnemyAI();

    /**
     * Load enemy AI configurations
     * @param enemy_configs_path Path to directory with enemy AI JSON files
     * @param tail_tier_reactions_path Path to tail_tier_reactions.json
     * @return true if loaded successfully
     */
    bool LoadConfigurations(
        const std::string& enemy_configs_path,
        const std::string& tail_tier_reactions_path
    );

    /**
     * Initialize AI system
     */
    void Initialize();

    /**
     * Update all enemy AI
     * @param deltaTime Time elapsed since last update
     */
    void Update(float deltaTime);

    /**
     * Spawn an enemy
     * @param enemy_config_id Enemy type to spawn
     * @param x X position
     * @param y Y position
     * @param z Z position
     * @return Instance ID of spawned enemy
     */
    std::string SpawnEnemy(const std::string& enemy_config_id,
                          float x, float y, float z);

    /**
     * Remove enemy instance
     * @param instance_id Enemy instance to remove
     */
    void RemoveEnemy(const std::string& instance_id);

    /**
     * Get enemy instance
     */
    EnemyInstance* GetEnemy(const std::string& instance_id);
    const EnemyInstance* GetEnemy(const std::string& instance_id) const;

    /**
     * Get all active enemies
     */
    std::vector<EnemyInstance*> GetActiveEnemies();

    /**
     * Set player tail count
     * This affects all enemy behaviors systemically
     * @param tail_count Player's current tail count (3-9)
     */
    void SetPlayerTailCount(int tail_count);

    /**
     * Get player tail count
     */
    int GetPlayerTailCount() const { return player_tail_count_; }

    /**
     * Set player position (for enemy targeting/awareness)
     * @param x X position
     * @param y Y position  
     * @param z Z position
     */
    void SetPlayerPosition(float x, float y, float z);

    /**
     * Check if enemy type can spawn at current tail tier
     * @param enemy_config_id Enemy type to check
     * @return true if can spawn
     */
    bool CanSpawnAtCurrentTier(const std::string& enemy_config_id) const;

    /**
     * Group Management
     */
    
    /**
     * Create enemy group for coordination
     * @param enemy_ids Enemy instance IDs to group
     * @return Group ID
     */
    std::string CreateEnemyGroup(const std::vector<std::string>& enemy_ids);

    /**
     * Dissolve enemy group
     * @param group_id Group to dissolve
     */
    void DissolveGroup(const std::string& group_id);

    /**
     * Get group for enemy
     * @param instance_id Enemy instance ID
     * @return Group ID or empty if not in group
     */
    std::string GetEnemyGroup(const std::string& instance_id) const;

    /**
     * Combat Actions
     */
    
    /**
     * Damage enemy
     * @param instance_id Enemy to damage
     * @param damage Damage amount
     * @param attacker_id Who dealt the damage
     */
    void DamageEnemy(const std::string& instance_id, float damage, 
                    const std::string& attacker_id);

    /**
     * Stun enemy
     * @param instance_id Enemy to stun
     * @param duration Stun duration in seconds
     */
    void StunEnemy(const std::string& instance_id, float duration);

    /**
     * Get enemy's intended action this frame
     * Used by combat system to execute actions
     */
    struct AIAction {
        enum class Type {
            None,
            Move,
            Attack,
            Dodge,
            Block,
            Flee
        } type = Type::None;
        
        std::string attack_id;
        float move_x = 0.0f;
        float move_z = 0.0f;
    };

    AIAction GetEnemyAction(const std::string& instance_id);

    /**
     * Event callbacks
     */
    using EnemySpawnedCallback = std::function<void(const std::string& instance_id)>;
    using EnemyDefeatedCallback = std::function<void(const std::string& instance_id)>;
    using EnemyAlertedCallback = std::function<void(const std::string& instance_id)>;

    void SetEnemySpawnedCallback(EnemySpawnedCallback callback) {
        enemy_spawned_callback_ = callback;
    }

    void SetEnemyDefeatedCallback(EnemyDefeatedCallback callback) {
        enemy_defeated_callback_ = callback;
    }

    void SetEnemyAlertedCallback(EnemyAlertedCallback callback) {
        enemy_alerted_callback_ = callback;
    }

private:
    // Enemy configurations
    std::unordered_map<std::string, EnemyAIConfig> enemy_configs_;
    
    // Active enemy instances
    std::unordered_map<std::string, EnemyInstance> enemies_;
    
    // Enemy groups
    std::unordered_map<std::string, EnemyGroup> groups_;
    
    // Player state
    int player_tail_count_ = 3;
    float player_x_ = 0.0f;
    float player_y_ = 0.0f;
    float player_z_ = 0.0f;
    
    // Event callbacks
    EnemySpawnedCallback enemy_spawned_callback_;
    EnemyDefeatedCallback enemy_defeated_callback_;
    EnemyAlertedCallback enemy_alerted_callback_;
    
    // Internal AI update functions
    void UpdateEnemyState(EnemyInstance& enemy, float deltaTime);
    void UpdatePatrolState(EnemyInstance& enemy, float deltaTime);
    void UpdateAlertState(EnemyInstance& enemy, float deltaTime);
    void UpdateEngagingState(EnemyInstance& enemy, float deltaTime);
    void UpdateAttackingState(EnemyInstance& enemy, float deltaTime);
    void UpdateRetreatingState(EnemyInstance& enemy, float deltaTime);
    void UpdateFleeingState(EnemyInstance& enemy, float deltaTime);
    
    // Behavior adaptation
    void ApplyTailTierAdaptation(EnemyInstance& enemy);
    float GetDistanceToPlayer(const EnemyInstance& enemy) const;
    bool IsPlayerInRange(const EnemyInstance& enemy, float range) const;
    bool ShouldFlee(const EnemyInstance& enemy) const;
    bool ShouldRetreat(const EnemyInstance& enemy) const;
    
    // Group coordination
    void UpdateGroupCoordination(EnemyGroup& group, float deltaTime);
    std::vector<std::string> GetNearbyAllies(const EnemyInstance& enemy, float range) const;
    
    // Attack selection
    std::string SelectAttack(const EnemyInstance& enemy) const;
    bool CanAttack(const EnemyInstance& enemy) const;
    
    // ID generation
    int next_instance_id_ = 0;
    int next_group_id_ = 0;
};

} // namespace AI
} // namespace LegendsEngine
