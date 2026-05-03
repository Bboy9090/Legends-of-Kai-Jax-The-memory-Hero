#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

namespace LegendsEngine {
namespace StoryMode {

/**
 * @file StoryModeTypes.h
 * @brief Core data structures for Story Mode systems
 * 
 * These structures map directly to the JSON schemas defined in:
 * - schemas/story_mode.schema.json
 * - schemas/quest.schema.json
 * - schemas/npc.schema.json
 * 
 * Following CANONICAL LAW:
 * - Data-driven design (read from JSON, not hardcoded)
 * - Platform-agnostic (same logic across PC/mobile/tablet)
 * - Tail tier integration (systems respond to current_tail_count)
 */

// Forward declarations
struct District;
struct Zone;
struct Quest;
struct NPC;
struct QuestObjective;

/**
 * Traversal features for a district
 * Defines movement capabilities available in this area
 */
struct TraversalFeatures {
    bool verticality_enabled = true;
    bool rooftop_access = true;
    bool interior_transitions = true;
    std::string movement_style = "agile"; // agile, standard, parkour
};

/**
 * Zone types
 */
enum class ZoneType {
    Combat,
    Exploration,
    Safe,
    BossArena
};

/**
 * Zone - Sub-area within a district
 */
struct Zone {
    std::string id;
    std::string name;
    ZoneType zone_type = ZoneType::Exploration;
    bool enemy_spawn_enabled = false;
    std::vector<std::string> npc_interaction_ids; // NPC IDs present in this zone
};

/**
 * Unlock requirement types
 */
enum class UnlockRequirementType {
    StoryProgress,
    TailCount,
    QuestComplete
};

/**
 * Unlock requirement for districts
 */
struct UnlockRequirement {
    UnlockRequirementType type = UnlockRequirementType::StoryProgress;
    std::string value_str; // For quest IDs, etc.
    int value_int = 0;     // For tail counts, etc.
};

/**
 * District - Major area in the game world
 * Contains zones, quests, and NPCs
 */
struct District {
    std::string id;
    std::string name;
    std::string description;
    UnlockRequirement unlock_requirement;
    TraversalFeatures traversal_features;
    std::vector<std::shared_ptr<Zone>> zones;
    std::vector<std::string> main_quest_ids;
    std::vector<std::string> side_quest_ids;
    bool is_unlocked = false;
};

/**
 * Quest types
 */
enum class QuestType {
    Main,
    Side,
    Mythological,
    Challenge
};

/**
 * Quest objective types
 */
enum class ObjectiveType {
    DefeatEnemies,
    ReachLocation,
    InteractNPC,
    CollectItem
};

/**
 * Individual quest objective
 */
struct QuestObjective {
    std::string id;
    ObjectiveType type = ObjectiveType::DefeatEnemies;
    std::string description;
    std::string target; // Enemy type, location ID, NPC ID, item ID
    int count = 1;
    int current_progress = 0;
    bool is_complete = false;
};

/**
 * Quest requirements
 */
struct QuestRequirements {
    int min_tail_count = 3;
    std::vector<std::string> prerequisite_quest_ids;
};

/**
 * Quest rewards
 */
struct QuestRewards {
    int experience = 0;
    std::vector<std::string> unlocks; // What gets unlocked
};

/**
 * Quest dialogue
 */
struct QuestDialogue {
    std::string intro;
    std::string progress;
    std::string completion;
};

/**
 * Quest - Story or side mission
 */
struct Quest {
    std::string quest_id;
    QuestType quest_type = QuestType::Side;
    std::string name;
    std::string description;
    std::string giver_npc_id;
    QuestRequirements requirements;
    std::vector<QuestObjective> objectives;
    QuestRewards rewards;
    QuestDialogue dialogue;
    
    bool is_active = false;
    bool is_complete = false;
    bool can_accept = false; // Determined at runtime based on requirements
};

/**
 * NPC types
 */
enum class NPCType {
    QuestGiver,
    Merchant,
    StoryCharacter,
    Ambient
};

/**
 * NPC emotional state
 */
enum class NPCEmotion {
    Neutral,
    Friendly,
    Fearful,
    Reverent,
    Hostile
};

/**
 * Dialogue option (player response)
 */
struct DialogueOption {
    std::string text;
    std::string next_node;
    std::string triggers_quest_id; // Optional: quest to trigger
};

/**
 * Dialogue node in NPC conversation tree
 */
struct DialogueNode {
    std::string text;
    NPCEmotion emotion = NPCEmotion::Neutral;
    std::vector<DialogueOption> options;
};

/**
 * Tail tier reaction for NPCs
 * Based on data/world/tail_tier_reactions.json
 */
struct TailTierReaction {
    std::string override_dialogue;
    float fear_modifier = 0.0f;    // 0.0 = no fear, 1.0 = terrified
    float respect_modifier = 0.0f; // 0.0 = no respect, 1.0 = absolute worship
};

/**
 * NPC position in world
 */
struct NPCLocation {
    std::string district_id;
    std::string zone_id;
    float x = 0.0f;
    float y = 0.0f;
    float z = 0.0f;
};

/**
 * NPC - Non-player character for interaction
 */
struct NPC {
    std::string npc_id;
    std::string name;
    NPCType npc_type = NPCType::Ambient;
    NPCLocation location;
    std::string model_id;
    float scale = 1.0f;
    
    // Dialogue tree - node_id -> DialogueNode
    std::unordered_map<std::string, DialogueNode> dialogue_tree;
    
    // Tail tier reactions (tier 3-9)
    std::unordered_map<int, TailTierReaction> tail_tier_reactions;
    
    // Quests this NPC can give
    std::vector<std::string> quest_ids;
    
    // Runtime state
    bool is_active = true;
    std::string current_dialogue_node = "default";
};

/**
 * Story Mode game world state
 */
struct StoryModeWorld {
    std::string version;
    std::string world_name;
    std::string setting;
    std::vector<std::shared_ptr<District>> districts;
    
    // All quests in the game
    std::unordered_map<std::string, std::shared_ptr<Quest>> quests;
    
    // All NPCs in the game
    std::unordered_map<std::string, std::shared_ptr<NPC>> npcs;
    
    // Player state
    int player_current_tail_count = 3;
    std::string current_district_id;
    std::string current_zone_id;
};

} // namespace StoryMode
} // namespace LegendsEngine
