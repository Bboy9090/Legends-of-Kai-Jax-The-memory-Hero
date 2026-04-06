#include "story_mode/StoryModeManager.h"
#include <nlohmann/json.hpp>
#include <fstream>
#include <iostream>

using json = nlohmann::json;

namespace LegendsEngine {
namespace StoryMode {

StoryModeManager::StoryModeManager() {
    // Initialize with default state
    world_.player_current_tail_count = 3; // Start with 3 tails (canon requirement)
}

StoryModeManager::~StoryModeManager() = default;

bool StoryModeManager::LoadConfiguration(
    const std::string& story_mode_config_path,
    const std::string& tail_tier_reactions_path
) {
    try {
        // Load story mode configuration
        std::ifstream story_file(story_mode_config_path);
        if (!story_file.is_open()) {
            std::cerr << "Failed to open story mode config: " << story_mode_config_path << std::endl;
            return false;
        }

        json story_json;
        story_file >> story_json;

        // TODO: Load tail_tier_reactions_path for centralized NPC/enemy reaction rules
        // For now, tail tier reactions are embedded in individual NPC/enemy JSON files
        // Future implementation will load tail_tier_reactions.json and apply globally
        (void)tail_tier_reactions_path; // Suppress unused parameter warning

        // Parse story mode data
        world_.version = story_json["version"];
        world_.world_name = story_json["game_world"]["name"];
        world_.setting = story_json["game_world"]["setting"];

        // Parse districts
        for (const auto& district_json : story_json["districts"]) {
            auto district = std::make_shared<District>();
            district->id = district_json["id"];
            district->name = district_json["name"];
            district->description = district_json["description"];

            // Parse traversal features
            const auto& traversal = district_json["traversal_features"];
            district->traversal_features.verticality_enabled = traversal["verticality_enabled"];
            district->traversal_features.rooftop_access = traversal["rooftop_access"];
            district->traversal_features.interior_transitions = traversal["interior_transitions"];
            district->traversal_features.movement_style = traversal["movement_style"];

            // Parse zones
            for (const auto& zone_json : district_json["zones"]) {
                auto zone = std::make_shared<Zone>();
                zone->id = zone_json["id"];
                zone->name = zone_json["name"];
                
                std::string zone_type_str = zone_json["zone_type"];
                if (zone_type_str == "combat") {
                    zone->zone_type = ZoneType::Combat;
                } else if (zone_type_str == "exploration") {
                    zone->zone_type = ZoneType::Exploration;
                } else if (zone_type_str == "safe") {
                    zone->zone_type = ZoneType::Safe;
                } else if (zone_type_str == "boss_arena") {
                    zone->zone_type = ZoneType::BossArena;
                }

                zone->enemy_spawn_enabled = zone_json["enemy_spawn_enabled"];

                if (zone_json.contains("npc_interactions")) {
                    for (const auto& npc_id : zone_json["npc_interactions"]) {
                        zone->npc_interaction_ids.push_back(npc_id);
                    }
                }

                district->zones.push_back(zone);
            }

            // Parse quest lists
            if (district_json.contains("main_quests")) {
                for (const auto& quest_id : district_json["main_quests"]) {
                    district->main_quest_ids.push_back(quest_id);
                }
            }

            if (district_json.contains("side_quests")) {
                for (const auto& quest_id : district_json["side_quests"]) {
                    district->side_quest_ids.push_back(quest_id);
                }
            }

            // Check if unlocked
            if (district_json["unlock_requirement"]["type"] == "story_progress" &&
                district_json["unlock_requirement"]["value"] == "start") {
                district->is_unlocked = true;
            }

            world_.districts.push_back(district);
        }

        std::cout << "Loaded Story Mode configuration: " << world_.world_name << std::endl;
        std::cout << "Districts loaded: " << world_.districts.size() << std::endl;

        return true;

    } catch (const std::exception& e) {
        std::cerr << "Error loading story mode configuration: " << e.what() << std::endl;
        return false;
    }
}

void StoryModeManager::StartNewGame() {
    // Set starting location to first unlocked district
    for (const auto& district : world_.districts) {
        if (district->is_unlocked) {
            world_.current_district_id = district->id;
            if (!district->zones.empty()) {
                world_.current_zone_id = district->zones[0]->id;
            }
            break;
        }
    }

    // Initialize player with 3 tails (canon requirement)
    world_.player_current_tail_count = 3;

    std::cout << "New game started in district: " << world_.current_district_id << std::endl;
}

void StoryModeManager::Update(float deltaTime) {
    // Update quest timers, NPC states, etc.
    // This would be called every frame
    (void)deltaTime; // Suppress unused parameter warning - will be used in future
    
    // Check for district unlocks
    UpdateDistrictUnlocks();
    
    // Future: Update quest timers, NPC movement, dynamic events, etc.
}

void StoryModeManager::SetPlayerTailCount(int tail_count) {
    // Enforce canon: tail count must be 3-9
    if (tail_count < 3 || tail_count > 9) {
        std::cerr << "Invalid tail count: " << tail_count << ". Must be 3-9." << std::endl;
        return;
    }

    world_.player_current_tail_count = tail_count;

    // Apply tail tier reactions to NPCs
    for (auto& [npc_id, npc] : world_.npcs) {
        ApplyTailTierReactionsToNPC(*npc, tail_count);
    }

    std::cout << "Player tail count updated to: " << tail_count << std::endl;
}

bool StoryModeManager::TravelToDistrict(const std::string& district_id) {
    for (const auto& district : world_.districts) {
        if (district->id == district_id) {
            if (!district->is_unlocked) {
                std::cout << "District " << district_id << " is locked." << std::endl;
                return false;
            }

            world_.current_district_id = district_id;
            if (!district->zones.empty()) {
                world_.current_zone_id = district->zones[0]->id;
            }

            std::cout << "Traveled to district: " << district->name << std::endl;
            return true;
        }
    }

    std::cerr << "District not found: " << district_id << std::endl;
    return false;
}

bool StoryModeManager::MoveToZone(const std::string& zone_id) {
    auto district = GetCurrentDistrict();
    if (!district) {
        return false;
    }

    for (const auto& zone : district->zones) {
        if (zone->id == zone_id) {
            world_.current_zone_id = zone_id;
            std::cout << "Moved to zone: " << zone->name << std::endl;
            return true;
        }
    }

    std::cerr << "Zone not found in current district: " << zone_id << std::endl;
    return false;
}

std::shared_ptr<District> StoryModeManager::GetCurrentDistrict() const {
    for (const auto& district : world_.districts) {
        if (district->id == world_.current_district_id) {
            return district;
        }
    }
    return nullptr;
}

std::shared_ptr<Zone> StoryModeManager::GetCurrentZone() const {
    auto district = GetCurrentDistrict();
    if (!district) {
        return nullptr;
    }

    for (const auto& zone : district->zones) {
        if (zone->id == world_.current_zone_id) {
            return zone;
        }
    }
    return nullptr;
}

bool StoryModeManager::AcceptQuest(const std::string& quest_id) {
    auto it = world_.quests.find(quest_id);
    if (it == world_.quests.end()) {
        std::cerr << "Quest not found: " << quest_id << std::endl;
        return false;
    }

    auto& quest = it->second;
    if (!CheckQuestRequirements(*quest)) {
        std::cout << "Quest requirements not met: " << quest_id << std::endl;
        return false;
    }

    quest->is_active = true;
    quest->can_accept = true;

    if (quest_accepted_callback_) {
        quest_accepted_callback_(quest_id);
    }

    std::cout << "Quest accepted: " << quest->name << std::endl;
    return true;
}

void StoryModeManager::UpdateQuestProgress(const std::string& quest_id, 
                                          const std::string& objective_id, 
                                          int progress) {
    auto it = world_.quests.find(quest_id);
    if (it == world_.quests.end() || !it->second->is_active) {
        return;
    }

    auto& quest = it->second;
    for (auto& objective : quest->objectives) {
        if (objective.id == objective_id) {
            objective.current_progress += progress;
            if (objective.current_progress >= objective.count) {
                objective.is_complete = true;
                std::cout << "Objective complete: " << objective.description << std::endl;
            }
            break;
        }
    }
}

bool StoryModeManager::IsQuestComplete(const std::string& quest_id) const {
    auto it = world_.quests.find(quest_id);
    if (it == world_.quests.end()) {
        return false;
    }

    const auto& quest = it->second;
    for (const auto& objective : quest->objectives) {
        if (!objective.is_complete) {
            return false;
        }
    }

    return true;
}

void StoryModeManager::CompleteQuest(const std::string& quest_id) {
    auto it = world_.quests.find(quest_id);
    if (it == world_.quests.end()) {
        return;
    }

    auto& quest = it->second;
    quest->is_complete = true;
    quest->is_active = false;

    if (quest_completed_callback_) {
        quest_completed_callback_(quest_id);
    }

    std::cout << "Quest completed: " << quest->name << std::endl;
}

std::vector<std::shared_ptr<Quest>> StoryModeManager::GetActiveQuests() const {
    std::vector<std::shared_ptr<Quest>> active_quests;
    for (const auto& [quest_id, quest] : world_.quests) {
        if (quest->is_active && !quest->is_complete) {
            active_quests.push_back(quest);
        }
    }
    return active_quests;
}

DialogueNode StoryModeManager::InteractWithNPC(const std::string& npc_id) {
    return GetNPCDialogue(npc_id);
}

DialogueNode StoryModeManager::SelectDialogueOption(const std::string& npc_id, int option_index) {
    auto it = world_.npcs.find(npc_id);
    if (it == world_.npcs.end()) {
        return DialogueNode{};
    }

    auto& npc = it->second;
    auto current_it = npc->dialogue_tree.find(npc->current_dialogue_node);
    if (current_it == npc->dialogue_tree.end()) {
        return DialogueNode{};
    }

    const auto& current_node = current_it->second;
    if (option_index < 0 || option_index >= static_cast<int>(current_node.options.size())) {
        return DialogueNode{};
    }

    const auto& option = current_node.options[option_index];
    npc->current_dialogue_node = option.next_node;

    // Trigger quest if specified
    if (!option.triggers_quest_id.empty()) {
        AcceptQuest(option.triggers_quest_id);
    }

    return GetNPCDialogue(npc_id);
}

DialogueNode StoryModeManager::GetNPCDialogue(const std::string& npc_id) {
    auto it = world_.npcs.find(npc_id);
    if (it == world_.npcs.end()) {
        return DialogueNode{};
    }

    auto& npc = it->second;
    
    // Check for tail tier override
    auto tier_it = npc->tail_tier_reactions.find(world_.player_current_tail_count);
    if (tier_it != npc->tail_tier_reactions.end() && 
        !tier_it->second.override_dialogue.empty()) {
        DialogueNode node;
        node.text = tier_it->second.override_dialogue;
        node.emotion = NPCEmotion::Reverent; // Default for tail tier reactions
        return node;
    }

    // Return current dialogue node
    auto node_it = npc->dialogue_tree.find(npc->current_dialogue_node);
    if (node_it != npc->dialogue_tree.end()) {
        return node_it->second;
    }

    return DialogueNode{};
}

void StoryModeManager::UpdateDistrictUnlocks() {
    // Check if any new districts should be unlocked
    for (auto& district : world_.districts) {
        if (district->is_unlocked) {
            continue;
        }

        bool should_unlock = false;

        // Check unlock requirements
        const auto& req = district->unlock_requirement;
        if (req.type == UnlockRequirementType::TailCount) {
            if (world_.player_current_tail_count >= req.value_int) {
                should_unlock = true;
            }
        } else if (req.type == UnlockRequirementType::QuestComplete) {
            auto it = world_.quests.find(req.value_str);
            if (it != world_.quests.end() && it->second->is_complete) {
                should_unlock = true;
            }
        }

        if (should_unlock) {
            district->is_unlocked = true;
            if (district_unlocked_callback_) {
                district_unlocked_callback_(district->id);
            }
            std::cout << "District unlocked: " << district->name << std::endl;
        }
    }
}

bool StoryModeManager::CheckQuestRequirements(const Quest& quest) const {
    // Check tail count requirement
    if (world_.player_current_tail_count < quest.requirements.min_tail_count) {
        return false;
    }

    // Check prerequisite quests
    for (const auto& prereq_id : quest.requirements.prerequisite_quest_ids) {
        auto it = world_.quests.find(prereq_id);
        if (it == world_.quests.end() || !it->second->is_complete) {
            return false;
        }
    }

    return true;
}

void StoryModeManager::ApplyTailTierReactionsToNPC(NPC& npc, int tail_count) {
    // Apply tail tier reactions from tail_tier_reactions.json
    // Currently, tail tier reactions are embedded in NPC JSON files directly.
    // In a future implementation, this function would:
    // 1. Load tail_tier_reactions.json centrally
    // 2. Apply global NPC reaction rules based on tier
    // 3. Merge with NPC-specific overrides
    // 
    // For now, NPC files contain their own tail_tier_reactions which are
    // already loaded and accessible via npc.tail_tier_reactions map.
    // This function serves as a hook for future centralized reaction management.
    
    (void)npc;        // Suppress unused parameter warning
    (void)tail_count; // Suppress unused parameter warning
}

} // namespace StoryMode
} // namespace LegendsEngine
