#pragma once

#include "CombatTypes.h"
#include <string>
#include <memory>
#include <functional>

namespace LegendsEngine {
namespace Combat {

/**
 * @file CombatSystem.h
 * @brief Unified combat system for Legends of Kai-Jax
 * 
 * CANONICAL LAW:
 * - Single unified combat core across ALL platforms
 * - PC is source of truth
 * - Mobile/tablet are scaled profiles, not separate systems
 * - Combat timing, damage, and progression are identical everywhere
 * - Mass, inertia, and recovery matter
 * - Punish spamming, reward precision
 * - Tail tier affects gameplay systemically
 */

class CombatSystem {
public:
    CombatSystem();
    ~CombatSystem();

    /**
     * Load combat configuration from JSON
     * @param combat_config_path Path to combat_system configuration
     * @param tail_tier_reactions_path Path to tail_tier_reactions.json
     * @return true if loaded successfully
     */
    bool LoadConfiguration(
        const std::string& combat_config_path,
        const std::string& tail_tier_reactions_path
    );

    /**
     * Initialize combat system
     */
    void Initialize();

    /**
     * Update combat logic
     * @param deltaTime Time elapsed since last update in seconds
     */
    void Update(float deltaTime);

    /**
     * Register a character for combat
     * @param character Character to register
     * @return Character ID for future reference
     */
    std::string RegisterCharacter(const CombatCharacter& character);

    /**
     * Remove character from combat
     * @param character_id Character ID to remove
     */
    void UnregisterCharacter(const std::string& character_id);

    /**
     * Get character combat state
     */
    CombatCharacter* GetCharacter(const std::string& character_id);
    const CombatCharacter* GetCharacter(const std::string& character_id) const;

    /**
     * Update character's tail count
     * This affects available attacks, damage modifiers, etc.
     * @param character_id Character to update
     * @param tail_count New tail count (3-9)
     */
    void SetCharacterTailCount(const std::string& character_id, int tail_count);

    /**
     * Combat Actions
     */
    
    /**
     * Execute an attack
     * @param attacker_id Attacking character ID
     * @param attack_id Attack ID to execute
     * @return true if attack was started successfully
     */
    bool ExecuteAttack(const std::string& attacker_id, const std::string& attack_id);

    /**
     * Attempt to dodge
     * @param character_id Character performing dodge
     * @param dodge_type Type of dodge
     * @param direction_x Dodge direction X
     * @param direction_z Dodge direction Z
     * @return true if dodge was executed
     */
    bool ExecuteDodge(const std::string& character_id, 
                     DodgeType dodge_type,
                     float direction_x,
                     float direction_z);

    /**
     * Attempt to parry
     * @param character_id Character attempting parry
     * @return true if parry window was opened
     */
    bool AttemptParry(const std::string& character_id);

    /**
     * Attempt to block
     * @param character_id Character attempting block
     * @param is_blocking true to start blocking, false to stop
     */
    void SetBlocking(const std::string& character_id, bool is_blocking);

    /**
     * Movement
     */
    
    /**
     * Set character movement input
     * @param character_id Character to move
     * @param input_x Horizontal input (-1 to 1)
     * @param input_z Vertical input (-1 to 1)
     * @param is_sprinting Whether sprint is active
     */
    void SetMovementInput(const std::string& character_id,
                         float input_x,
                         float input_z,
                         bool is_sprinting);

    /**
     * Apply momentum to character
     * Used for knockback, physics interactions, etc.
     * @param character_id Character to affect
     * @param impulse_x X impulse
     * @param impulse_y Y impulse
     * @param impulse_z Z impulse
     */
    void ApplyImpulse(const std::string& character_id,
                     float impulse_x,
                     float impulse_y,
                     float impulse_z);

    /**
     * Combat Resolution
     */
    
    /**
     * Check for hit detection between attacker and potential targets
     * @param attacker_id Attacking character
     * @return List of hit data for successful hits
     */
    std::vector<HitData> DetectHits(const std::string& attacker_id);

    /**
     * Apply damage to a character
     * @param hit Hit data to apply
     */
    void ApplyHit(const HitData& hit);

    /**
     * Check if attack hit was countered/parried
     * @param attacker_id Attacker
     * @param defender_id Defender
     * @return true if attack was countered
     */
    bool CheckCounter(const std::string& attacker_id, const std::string& defender_id);

    /**
     * Combo System
     */
    
    /**
     * Get current combo for character
     */
    const ComboState& GetCombo(const std::string& character_id) const;

    /**
     * Reset combo for character
     */
    void ResetCombo(const std::string& character_id);

    /**
     * Get combat configuration
     */
    const CombatSystemConfig& GetConfig() const { return config_; }

    /**
     * Event callbacks
     */
    using HitCallback = std::function<void(const HitData&)>;
    using ComboCallback = std::function<void(const std::string& character_id, int hit_count)>;
    using ParryCallback = std::function<void(const std::string& character_id)>;

    void SetHitCallback(HitCallback callback) { hit_callback_ = callback; }
    void SetComboCallback(ComboCallback callback) { combo_callback_ = callback; }
    void SetParryCallback(ParryCallback callback) { parry_callback_ = callback; }

private:
    CombatSystemConfig config_;
    std::unordered_map<std::string, CombatCharacter> characters_;
    
    // Event callbacks
    HitCallback hit_callback_;
    ComboCallback combo_callback_;
    ParryCallback parry_callback_;
    
    // Internal helpers
    void UpdateCharacterMovement(CombatCharacter& character, float deltaTime);
    void UpdateCharacterAttack(CombatCharacter& character, float deltaTime);
    void UpdateCharacterCombo(CombatCharacter& character, float deltaTime);
    void ApplyTailTierModifiers(CombatCharacter& character);
    bool CanExecuteAttack(const CombatCharacter& character, const std::string& attack_id) const;
    bool CanCancelInto(const std::string& current_attack, const std::string& next_attack) const;
    float CalculateMomentumBonus(const CombatCharacter& character) const;
};

} // namespace Combat
} // namespace LegendsEngine
