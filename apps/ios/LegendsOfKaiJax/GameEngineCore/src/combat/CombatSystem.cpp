#include "combat/CombatSystem.h"
#include <nlohmann/json.hpp>
#include <fstream>
#include <iostream>
#include <cmath>
#include <algorithm>

using json = nlohmann::json;

namespace LegendsEngine {
namespace Combat {

CombatSystem::CombatSystem() {}

CombatSystem::~CombatSystem() {}

bool CombatSystem::LoadConfiguration(
    const std::string& combat_config_path,
    const std::string& tail_tier_reactions_path
) {
    try {
        // Load combat system configuration
        std::ifstream config_file(combat_config_path);
        if (!config_file.is_open()) {
            std::cerr << "Failed to open combat config: " << combat_config_path << std::endl;
            return false;
        }

        json config_json = json::parse(config_file);
        
        // Parse philosophy
        config_.version = config_json["version"].get<std::string>();
        config_.punish_spamming = config_json["punish_spamming"].get<bool>();
        config_.reward_precision = config_json["reward_precision"].get<bool>();
        
        // Parse mechanics
        auto& mech = config_json["mechanics"];
        config_.mechanics.hit_stop_enabled = mech["hit_stop_enabled"].get<bool>();
        config_.mechanics.hit_stop_duration_ms = mech["hit_stop_duration_ms"].get<int>();
        config_.mechanics.combo_system_enabled = mech["combo_system_enabled"].get<bool>();
        config_.mechanics.parry_enabled = mech["parry_enabled"].get<bool>();
        config_.mechanics.counter_enabled = mech["counter_enabled"].get<bool>();
        config_.mechanics.parry_window_frames = mech["parry_window_frames"].get<int>();
        config_.mechanics.perfect_parry_multiplier = mech["perfect_parry_multiplier"].get<float>();
        
        // Parse base movement
        auto& mov = config_json["base_movement"];
        config_.base_movement.walk_speed = mov["walk_speed"].get<float>();
        config_.base_movement.run_speed = mov["run_speed"].get<float>();
        config_.base_movement.sprint_speed = mov["sprint_speed"].get<float>();
        config_.base_movement.mass_affects_momentum = mov["mass_affects_momentum"].get<bool>();
        config_.base_movement.mass = mov["mass"].get<float>();
        config_.base_movement.inertia_factor = mov["inertia_factor"].get<float>();
        
        // Parse agility features
        auto& agil = config_json["agility_features"];
        config_.agility_features.instant_direction_change = agil["instant_direction_change"].get<bool>();
        config_.agility_features.air_control_enabled = agil["air_control_enabled"].get<bool>();
        config_.agility_features.dodge_distance = agil["dodge_distance"].get<float>();
        config_.agility_features.dodge_invincibility_frames = agil["dodge_invincibility_frames"].get<int>();
        
        // Parse attacks
        for (auto& [attack_id, attack_data] : config_json["attacks"].items()) {
            AttackDefinition attack;
            attack.id = attack_id;
            attack.name = attack_data["name"].get<std::string>();
            attack.damage = attack_data["damage"].get<float>();
            attack.execution_frames = attack_data["execution_frames"].get<int>();
            attack.recovery_frames = attack_data["recovery_frames"].get<int>();
            attack.requires_tail_tier = attack_data["requires_tail_tier"].get<int>();
            attack.momentum_based = attack_data.value("momentum_based", false);
            attack.knockback_strength = attack_data.value("knockback_strength", 1.0f);
            attack.range = attack_data.value("range", 2.0f);
            
            if (attack_data.contains("can_cancel_into")) {
                attack.can_cancel_into = attack_data["can_cancel_into"].get<std::vector<std::string>>();
            }
            
            config_.attacks[attack_id] = attack;
        }
        
        // Parse tail tier modifiers
        for (auto& [tier_str, tier_data] : config_json["tail_tier_modifiers"].items()) {
            int tier = std::stoi(tier_str);
            TailTierCombatModifier modifier;
            modifier.damage_multiplier = tier_data["damage_multiplier"].get<float>();
            modifier.speed_multiplier = tier_data["speed_multiplier"].get<float>();
            modifier.available_attacks = tier_data["available_attacks"].get<std::vector<std::string>>();
            
            config_.tail_tier_modifiers[tier] = modifier;
        }
        
        std::cout << "Combat system configuration loaded successfully" << std::endl;
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "Error loading combat configuration: " << e.what() << std::endl;
        return false;
    }
}

void CombatSystem::Initialize() {
    std::cout << "Combat system initialized" << std::endl;
}

void CombatSystem::Update(float deltaTime) {
    // Update all active characters
    for (auto& [id, character] : characters_) {
        UpdateCharacterMovement(character, deltaTime);
        UpdateCharacterAttack(character, deltaTime);
        UpdateCharacterCombo(character, deltaTime);
        
        // Update stun frames
        if (character.stun_frames_remaining > 0) {
            character.stun_frames_remaining--;
            if (character.stun_frames_remaining == 0) {
                character.state = CombatState::Idle;
            }
        }
    }
}

std::string CombatSystem::RegisterCharacter(const CombatCharacter& character) {
    characters_[character.character_id] = character;
    ApplyTailTierModifiers(characters_[character.character_id]);
    std::cout << "Registered character: " << character.character_id << std::endl;
    return character.character_id;
}

void CombatSystem::UnregisterCharacter(const std::string& character_id) {
    characters_.erase(character_id);
}

CombatCharacter* CombatSystem::GetCharacter(const std::string& character_id) {
    auto it = characters_.find(character_id);
    return (it != characters_.end()) ? &it->second : nullptr;
}

const CombatCharacter* CombatSystem::GetCharacter(const std::string& character_id) const {
    auto it = characters_.find(character_id);
    return (it != characters_.end()) ? &it->second : nullptr;
}

void CombatSystem::SetCharacterTailCount(const std::string& character_id, int tail_count) {
    auto* character = GetCharacter(character_id);
    if (!character) return;
    
    // CANON ENFORCEMENT: Tail count must be 3-9
    if (tail_count < 3 || tail_count > 9) {
        std::cerr << "Invalid tail count: " << tail_count << " (must be 3-9)" << std::endl;
        return;
    }
    
    character->current_tail_count = tail_count;
    ApplyTailTierModifiers(*character);
    std::cout << "Character " << character_id << " tail count set to " << tail_count << std::endl;
}

bool CombatSystem::ExecuteAttack(const std::string& attacker_id, const std::string& attack_id) {
    auto* attacker = GetCharacter(attacker_id);
    if (!attacker) return false;
    
    // Check if attack can be executed
    if (!CanExecuteAttack(*attacker, attack_id)) {
        return false;
    }
    
    auto attack_it = config_.attacks.find(attack_id);
    if (attack_it == config_.attacks.end()) {
        return false;
    }
    
    const auto& attack = attack_it->second;
    
    // Start attack
    attacker->current_attack_id = attack_id;
    attacker->attack_frame = 0;
    attacker->state = CombatState::Attacking;
    
    return true;
}

bool CombatSystem::ExecuteDodge(const std::string& character_id,
                                DodgeType dodge_type,
                                float direction_x,
                                float direction_z) {
    auto* character = GetCharacter(character_id);
    if (!character) return false;
    
    if (character->state == CombatState::Stunned || 
        character->state == CombatState::KnockedDown) {
        return false;
    }
    
    // Execute dodge
    character->state = CombatState::Dodging;
    
    // Apply dodge velocity
    float dodge_speed = config_.agility_features.dodge_distance * 60.0f; // Convert to velocity
    float magnitude = std::sqrt(direction_x * direction_x + direction_z * direction_z);
    if (magnitude > 0.01f) {
        character->vel_x = (direction_x / magnitude) * dodge_speed;
        character->vel_z = (direction_z / magnitude) * dodge_speed;
    }
    
    return true;
}

bool CombatSystem::AttemptParry(const std::string& character_id) {
    auto* character = GetCharacter(character_id);
    if (!character) return false;
    
    if (!config_.mechanics.parry_enabled) return false;
    if (character->state != CombatState::Idle && character->state != CombatState::Moving) {
        return false;
    }
    
    // Open parry window (would need frame-perfect timing logic in full implementation)
    if (parry_callback_) {
        parry_callback_(character_id);
    }
    
    return true;
}

void CombatSystem::SetBlocking(const std::string& character_id, bool is_blocking) {
    auto* character = GetCharacter(character_id);
    if (!character) return;
    
    if (is_blocking) {
        if (character->state == CombatState::Idle || character->state == CombatState::Moving) {
            character->state = CombatState::Blocking;
        }
    } else {
        if (character->state == CombatState::Blocking) {
            character->state = CombatState::Idle;
        }
    }
}

void CombatSystem::SetMovementInput(const std::string& character_id,
                                    float input_x,
                                    float input_z,
                                    bool is_sprinting) {
    auto* character = GetCharacter(character_id);
    if (!character) return;
    
    // Can only move if not in an action state
    if (character->state != CombatState::Idle && character->state != CombatState::Moving) {
        return;
    }
    
    float magnitude = std::sqrt(input_x * input_x + input_z * input_z);
    if (magnitude > 0.01f) {
        character->state = CombatState::Moving;
        
        // Determine speed based on sprint
        float target_speed = is_sprinting ? 
            character->movement.sprint_speed : 
            character->movement.run_speed;
        
        // Apply tail tier speed modifier
        target_speed *= character->tail_modifiers.speed_multiplier;
        
        // Set velocity
        character->vel_x = (input_x / magnitude) * target_speed;
        character->vel_z = (input_z / magnitude) * target_speed;
    } else {
        if (character->state == CombatState::Moving) {
            character->state = CombatState::Idle;
        }
    }
}

void CombatSystem::ApplyImpulse(const std::string& character_id,
                                float impulse_x,
                                float impulse_y,
                                float impulse_z) {
    auto* character = GetCharacter(character_id);
    if (!character) return;
    
    character->vel_x += impulse_x;
    character->vel_y += impulse_y;
    character->vel_z += impulse_z;
}

std::vector<HitData> CombatSystem::DetectHits(const std::string& attacker_id) {
    std::vector<HitData> hits;
    
    auto* attacker = GetCharacter(attacker_id);
    if (!attacker || attacker->state != CombatState::Attacking) {
        return hits;
    }
    
    auto attack_it = config_.attacks.find(attacker->current_attack_id);
    if (attack_it == config_.attacks.end()) {
        return hits;
    }
    
    const auto& attack = attack_it->second;
    
    // Check all other characters for hits
    for (auto& [defender_id, defender] : characters_) {
        if (defender_id == attacker_id) continue;
        
        // Calculate distance
        float dx = defender.pos_x - attacker->pos_x;
        float dz = defender.pos_z - attacker->pos_z;
        float dist = std::sqrt(dx * dx + dz * dz);
        
        if (dist <= attack.range) {
            HitData hit;
            hit.attacker_id = attacker_id;
            hit.defender_id = defender_id;
            hit.attack_id = attacker->current_attack_id;
            
            // Calculate damage with tail tier modifier
            float base_damage = attack.damage * attacker->tail_modifiers.damage_multiplier;
            
            // Add momentum bonus if applicable
            if (attack.momentum_based) {
                base_damage *= CalculateMomentumBonus(*attacker);
            }
            
            hit.damage = base_damage;
            hit.hitstun_frames = static_cast<int>(attack.hitstun_frames);
            
            // Calculate knockback
            float knockback_dir_x = dx / dist;
            float knockback_dir_z = dz / dist;
            hit.knockback_x = knockback_dir_x * attack.knockback_strength;
            hit.knockback_z = knockback_dir_z * attack.knockback_strength;
            
            hits.push_back(hit);
        }
    }
    
    return hits;
}

void CombatSystem::ApplyHit(const HitData& hit) {
    auto* defender = GetCharacter(hit.defender_id);
    if (!defender) return;
    
    // Check if parried
    if (hit.is_parried) {
        // Parry counters the attack
        return;
    }
    
    // Apply damage
    defender->health -= hit.damage;
    
    // Apply knockback
    defender->vel_x += hit.knockback_x;
    defender->vel_z += hit.knockback_z;
    
    // Apply hitstun
    defender->stun_frames_remaining = hit.hitstun_frames;
    defender->state = CombatState::Stunned;
    
    // Update combo on attacker
    auto* attacker = GetCharacter(hit.attacker_id);
    if (attacker) {
        attacker->combo.hit_count++;
        attacker->combo.total_damage += hit.damage;
        attacker->combo.is_active = true;
        
        if (combo_callback_) {
            combo_callback_(hit.attacker_id, attacker->combo.hit_count);
        }
    }
    
    // Trigger hit callback
    if (hit_callback_) {
        hit_callback_(hit);
    }
}

bool CombatSystem::CheckCounter(const std::string& attacker_id, const std::string& defender_id) {
    // Simplified counter check
    auto* defender = GetCharacter(defender_id);
    if (!defender) return false;
    
    return defender->state == CombatState::Blocking && config_.mechanics.counter_enabled;
}

const ComboState& CombatSystem::GetCombo(const std::string& character_id) const {
    static ComboState empty_combo;
    auto* character = GetCharacter(character_id);
    return character ? character->combo : empty_combo;
}

void CombatSystem::ResetCombo(const std::string& character_id) {
    auto* character = GetCharacter(character_id);
    if (character) {
        character->combo = ComboState();
    }
}

// Private helper functions

void CombatSystem::UpdateCharacterMovement(CombatCharacter& character, float deltaTime) {
    // Apply inertia (CANON: mass affects momentum)
    if (config_.base_movement.mass_affects_momentum) {
        character.vel_x *= character.movement.inertia_factor;
        character.vel_z *= character.movement.inertia_factor;
    }
    
    // Update position
    character.pos_x += character.vel_x * deltaTime;
    character.pos_z += character.vel_z * deltaTime;
}

void CombatSystem::UpdateCharacterAttack(CombatCharacter& character, float deltaTime) {
    if (character.state != CombatState::Attacking) return;
    
    character.attack_frame++;
    
    auto attack_it = config_.attacks.find(character.current_attack_id);
    if (attack_it == config_.attacks.end()) {
        character.state = CombatState::Idle;
        return;
    }
    
    const auto& attack = attack_it->second;
    
    // Check if attack is complete
    if (character.attack_frame >= attack.execution_frames + attack.recovery_frames) {
        character.state = CombatState::Idle;
        character.current_attack_id.clear();
        character.attack_frame = 0;
    }
}

void CombatSystem::UpdateCharacterCombo(CombatCharacter& character, float deltaTime) {
    if (!character.combo.is_active) return;
    
    character.combo.last_hit_time += deltaTime;
    
    // Check for combo timeout
    if (character.combo.last_hit_time >= character.combo.combo_timeout) {
        ResetCombo(character.character_id);
    }
}

void CombatSystem::ApplyTailTierModifiers(CombatCharacter& character) {
    auto it = config_.tail_tier_modifiers.find(character.current_tail_count);
    if (it != config_.tail_tier_modifiers.end()) {
        character.tail_modifiers = it->second;
    }
}

bool CombatSystem::CanExecuteAttack(const CombatCharacter& character, const std::string& attack_id) const {
    // Check if character is in valid state
    if (character.state == CombatState::Stunned || 
        character.state == CombatState::KnockedDown) {
        return false;
    }
    
    // Get attack definition
    auto attack_it = config_.attacks.find(attack_id);
    if (attack_it == config_.attacks.end()) {
        return false;
    }
    
    const auto& attack = attack_it->second;
    
    // Check tail tier requirement (CANON: attacks unlock with tail progression)
    if (character.current_tail_count < attack.requires_tail_tier) {
        return false;
    }
    
    // Check if attack is in available attacks list for this tail tier
    const auto& available = character.tail_modifiers.available_attacks;
    if (std::find(available.begin(), available.end(), attack_id) == available.end()) {
        return false;
    }
    
    // If already attacking, check if we can cancel
    if (character.state == CombatState::Attacking) {
        return CanCancelInto(character.current_attack_id, attack_id);
    }
    
    return true;
}

bool CombatSystem::CanCancelInto(const std::string& current_attack, const std::string& next_attack) const {
    auto attack_it = config_.attacks.find(current_attack);
    if (attack_it == config_.attacks.end()) {
        return false;
    }
    
    const auto& attack = attack_it->second;
    const auto& cancels = attack.can_cancel_into;
    
    return std::find(cancels.begin(), cancels.end(), next_attack) != cancels.end();
}

float CombatSystem::CalculateMomentumBonus(const CombatCharacter& character) const {
    // Calculate speed from velocity
    float speed = std::sqrt(
        character.vel_x * character.vel_x + 
        character.vel_z * character.vel_z
    );
    
    // Bonus scales with speed (1.0x at walk, 1.5x at sprint)
    float speed_ratio = speed / config_.base_movement.sprint_speed;
    return 1.0f + (speed_ratio * 0.5f);
}

} // namespace Combat
} // namespace LegendsEngine
