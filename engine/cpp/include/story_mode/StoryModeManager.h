#pragma once

#include "StoryModeTypes.h"
#include <string>
#include <memory>
#include <functional>

namespace LegendsEngine {
namespace StoryMode {

/**
 * @file StoryModeManager.h
 * @brief Core Story Mode system manager
 * 
 * Manages the overall Story Mode experience including:
 * - District progression
 * - Quest management
 * - NPC interactions
 * - World state
 * 
 * This is the main entry point for Story Mode gameplay.
 * Platform-agnostic - same logic for PC, mobile, tablet.
 */

class StoryModeManager {
public:
    StoryModeManager();
    ~StoryModeManager();

    /**
     * Load story mode configuration from JSON files
     * @param story_mode_config_path Path to story_mode configuration JSON
     * @param tail_tier_reactions_path Path to tail_tier_reactions.json
     * @return true if loaded successfully
     */
    bool LoadConfiguration(
        const std::string& story_mode_config_path,
        const std::string& tail_tier_reactions_path
    );

    /**
     * Initialize story mode with a new game
     * Sets up starting district, initial quests, etc.
     */
    void StartNewGame();

    /**
     * Update story mode logic
     * Called every frame to update quest progress, NPC states, etc.
     * @param deltaTime Time elapsed since last update
     */
    void Update(float deltaTime);

    /**
     * Get current world state
     */
    const StoryModeWorld& GetWorld() const { return world_; }
    StoryModeWorld& GetWorld() { return world_; }

    /**
     * Set player's current tail count
     * This affects NPC reactions, enemy AI, music, etc.
     * @param tail_count Must be 3-9 (enforced by canon)
     */
    void SetPlayerTailCount(int tail_count);

    /**
     * Get player's current tail count
     */
    int GetPlayerTailCount() const { return world_.player_current_tail_count; }

    /**
     * Travel to a different district
     * @param district_id ID of district to travel to
     * @return true if travel was successful (district unlocked)
     */
    bool TravelToDistrict(const std::string& district_id);

    /**
     * Move to a different zone within current district
     * @param zone_id ID of zone to move to
     * @return true if move was successful
     */
    bool MoveToZone(const std::string& zone_id);

    /**
     * Get current district
     */
    std::shared_ptr<District> GetCurrentDistrict() const;

    /**
     * Get current zone
     */
    std::shared_ptr<Zone> GetCurrentZone() const;

    /**
     * Quest Management
     */
    
    /**
     * Accept a quest
     * @param quest_id Quest ID to accept
     * @return true if quest was accepted (requirements met)
     */
    bool AcceptQuest(const std::string& quest_id);

    /**
     * Update quest objective progress
     * @param quest_id Quest ID
     * @param objective_id Objective ID
     * @param progress Amount to add to progress
     */
    void UpdateQuestProgress(const std::string& quest_id, 
                            const std::string& objective_id, 
                            int progress);

    /**
     * Check if quest is complete
     * @param quest_id Quest ID to check
     * @return true if all objectives are complete
     */
    bool IsQuestComplete(const std::string& quest_id) const;

    /**
     * Complete a quest and award rewards
     * @param quest_id Quest ID to complete
     */
    void CompleteQuest(const std::string& quest_id);

    /**
     * Get active quests
     */
    std::vector<std::shared_ptr<Quest>> GetActiveQuests() const;

    /**
     * NPC Interaction
     */
    
    /**
     * Interact with an NPC
     * @param npc_id NPC ID to interact with
     * @return DialogueNode to display
     */
    DialogueNode InteractWithNPC(const std::string& npc_id);

    /**
     * Select a dialogue option
     * @param npc_id NPC being talked to
     * @param option_index Index of selected option
     * @return Next DialogueNode to display
     */
    DialogueNode SelectDialogueOption(const std::string& npc_id, int option_index);

    /**
     * Get NPC's current dialogue node based on tail tier
     * Applies tail_tier_reactions.json modifications
     * @param npc_id NPC ID
     * @return Current DialogueNode with tail tier modifications applied
     */
    DialogueNode GetNPCDialogue(const std::string& npc_id);

    /**
     * Event callbacks
     */
    using QuestAcceptedCallback = std::function<void(const std::string& quest_id)>;
    using QuestCompletedCallback = std::function<void(const std::string& quest_id)>;
    using DistrictUnlockedCallback = std::function<void(const std::string& district_id)>;

    void SetQuestAcceptedCallback(QuestAcceptedCallback callback) {
        quest_accepted_callback_ = callback;
    }

    void SetQuestCompletedCallback(QuestCompletedCallback callback) {
        quest_completed_callback_ = callback;
    }

    void SetDistrictUnlockedCallback(DistrictUnlockedCallback callback) {
        district_unlocked_callback_ = callback;
    }

private:
    StoryModeWorld world_;

    // Event callbacks
    QuestAcceptedCallback quest_accepted_callback_;
    QuestCompletedCallback quest_completed_callback_;
    DistrictUnlockedCallback district_unlocked_callback_;

    /**
     * Check and update district unlock status
     * Called when conditions change (quest complete, tail tier increase, etc.)
     */
    void UpdateDistrictUnlocks();

    /**
     * Check if quest requirements are met
     */
    bool CheckQuestRequirements(const Quest& quest) const;

    /**
     * Apply tail tier reactions to NPC dialogue
     */
    void ApplyTailTierReactionsToNPC(NPC& npc, int tail_count);
};

} // namespace StoryMode
} // namespace LegendsEngine
