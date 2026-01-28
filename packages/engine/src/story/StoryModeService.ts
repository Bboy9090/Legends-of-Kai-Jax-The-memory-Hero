/**
 * @file StoryModeService.ts
 * @brief Core service for Story Mode systems
 * 
 * This service manages the story mode state and provides an interface
 * to the C++ backend (via WebAssembly or other bridging mechanism).
 * 
 * CANONICAL LAW:
 * - Platform-agnostic implementation
 * - Tail progression 3→9 enforced
 * - Single unified gameplay core
 * - Data-driven from JSON
 */

import {
  District,
  NPC,
  Quest,
  QuestObjective,
  QuestObjectiveType,
  PlayerState,
  StoryModeState,
  StoryModeEvent,
  ZoneType
} from './StoryModeTypes';

export type StoryModeEventCallback = (event: StoryModeEvent) => void;

export class StoryModeService {
  private state: StoryModeState;
  private eventCallbacks: StoryModeEventCallback[] = [];
  private dataPath: string;

  constructor(dataPath: string = '/data') {
    this.dataPath = dataPath;
    
    // Initialize empty state
    this.state = {
      player: {
        player_id: 'kai_jax',
        current_tail_count: 3, // CANON: Start with 3 tails
        current_district: '',
        current_zone: '',
        active_quests: [],
        completed_quests: [],
        combat_character: {
          character_id: 'kai_jax',
          current_tail_count: 3,
          state: 'idle' as any,
          health: 100,
          max_health: 100,
          pos_x: 0,
          pos_y: 0,
          pos_z: 0,
          vel_x: 0,
          vel_y: 0,
          vel_z: 0,
          combo: {
            hit_count: 0,
            total_damage: 0,
            move_sequence: [],
            last_hit_time: 0,
            combo_timeout: 2.0,
            is_active: false
          },
          current_attack_id: '',
          attack_frame: 0,
          stun_frames_remaining: 0,
          tail_modifiers: {
            damage_multiplier: 1.0,
            speed_multiplier: 1.0,
            available_attacks: [],
            unlocked_abilities: []
          },
          movement: {
            walk_speed: 3.0,
            run_speed: 6.0,
            sprint_speed: 10.0,
            mass_affects_momentum: true,
            mass: 1.0,
            inertia_factor: 0.85
          },
          agility: {
            instant_direction_change: true,
            air_control_enabled: true,
            available_dodges: [],
            wall_run_enabled: true,
            wall_jump_enabled: true,
            dodge_distance: 3.0,
            dodge_invincibility_frames: 8
          }
        }
      },
      districts: [],
      npcs: [],
      quests: [],
      active_enemies: []
    };
  }

  /**
   * Initialize the story mode system by loading all data files
   */
  async initialize(): Promise<void> {
    try {
      // Load all game data from JSON files
      await Promise.all([
        this.loadDistricts(),
        this.loadNPCs(),
        this.loadQuests()
      ]);

      console.log('Story Mode initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Story Mode:', error);
      throw error;
    }
  }

  /**
   * Start a new game
   */
  startNewGame(): void {
    // CANON: Player starts with 3 tails
    this.state.player.current_tail_count = 3;
    this.state.player.combat_character.current_tail_count = 3;
    this.state.player.completed_quests = [];
    this.state.player.active_quests = [];
    
    // Set starting district
    if (this.state.districts.length > 0) {
      const startingDistrict = this.state.districts[0];
      if (startingDistrict) {
        this.state.player.current_district = startingDistrict.district_id;
        if (startingDistrict.zones && startingDistrict.zones.length > 0) {
          this.state.player.current_zone = startingDistrict.zones[0].zone_id;
        }
      }
    }

    console.log('New game started - Tail count: 3');
  }

  /**
   * Get current player state
   */
  getPlayerState(): PlayerState {
    return this.state.player;
  }

  /**
   * Get current tail count (CANON: 3-9)
   */
  getPlayerTailCount(): number {
    return this.state.player.current_tail_count;
  }

  /**
   * Set player tail count
   * CANON ENFORCEMENT: Must be 3-9, sequential only
   */
  setPlayerTailCount(tailCount: number): boolean {
    // CANON: Validate range
    if (tailCount < 3 || tailCount > 9) {
      console.error(`Invalid tail count: ${tailCount} (must be 3-9)`);
      return false;
    }

    // CANON: Sequential only - can only increase by 1
    if (tailCount > this.state.player.current_tail_count + 1) {
      console.error(`Cannot skip tail tiers: ${this.state.player.current_tail_count} -> ${tailCount}`);
      return false;
    }

    // CANON: Cannot decrease
    if (tailCount < this.state.player.current_tail_count) {
      console.error('Cannot decrease tail count');
      return false;
    }

    const oldTier = this.state.player.current_tail_count;
    this.state.player.current_tail_count = tailCount;
    this.state.player.combat_character.current_tail_count = tailCount;

    // Emit tail tier changed event
    this.emitEvent({
      type: 'tail_tier_changed',
      old_tier: oldTier,
      new_tier: tailCount
    });

    console.log(`Tail count updated: ${oldTier} -> ${tailCount}`);
    return true;
  }

  /**
   * Get all available districts
   */
  getDistricts(): District[] {
    return this.state.districts;
  }

  /**
   * Get districts unlocked at current tail tier
   */
  getUnlockedDistricts(): District[] {
    return this.state.districts.filter(
      d => d.unlocked_by_tail_tier <= this.state.player.current_tail_count
    );
  }

  /**
   * Travel to a district
   */
  travelToDistrict(districtId: string): boolean {
    const district = this.state.districts.find(d => d.district_id === districtId);
    if (!district) {
      console.error(`District not found: ${districtId}`);
      return false;
    }

    // Check if unlocked
    if (district.unlocked_by_tail_tier > this.state.player.current_tail_count) {
      console.error(`District locked until tail tier ${district.unlocked_by_tail_tier}`);
      return false;
    }

    this.state.player.current_district = districtId;
    
    // Set to first zone
    if (district.zones && district.zones.length > 0) {
      const firstZone = district.zones[0];
      if (firstZone) {
        this.state.player.current_zone = firstZone.zone_id;
      }
    }

    console.log(`Traveled to district: ${district.district_name}`);
    return true;
  }

  /**
   * Get all NPCs
   */
  getNPCs(): NPC[] {
    return this.state.npcs;
  }

  /**
   * Get NPC dialogue based on current tail tier
   */
  getNPCDialogue(npcId: string): string {
    const npc = this.state.npcs.find(n => n.npc_id === npcId);
    if (!npc) return '';

    // Get tail-tier specific dialogue if available
    const tailTierDialogue = npc.tail_tier_reactions[this.state.player.current_tail_count];
    if (tailTierDialogue) {
      return tailTierDialogue;
    }

    // Fallback to base dialogue
    if (npc.base_dialogue.length > 0) {
      return npc.base_dialogue[0].dialogue_text;
    }

    return '';
  }

  /**
   * Get all quests
   */
  getQuests(): Quest[] {
    return this.state.quests;
  }

  /**
   * Get available quests (prerequisites met)
   */
  getAvailableQuests(): Quest[] {
    return this.state.quests.filter(quest => {
      // Check if already active or completed
      if (this.state.player.active_quests.includes(quest.quest_id) ||
          this.state.player.completed_quests.includes(quest.quest_id)) {
        return false;
      }

      // Check prerequisites
      return quest.prerequisites.every(prereq =>
        this.state.player.completed_quests.includes(prereq)
      );
    });
  }

  /**
   * Start a quest
   */
  startQuest(questId: string): boolean {
    const quest = this.state.quests.find(q => q.quest_id === questId);
    if (!quest) {
      console.error(`Quest not found: ${questId}`);
      return false;
    }

    // Check if already active
    if (this.state.player.active_quests.includes(questId)) {
      console.error('Quest already active');
      return false;
    }

    // Check prerequisites
    const prerequisitesMet = quest.prerequisites.every(prereq =>
      this.state.player.completed_quests.includes(prereq)
    );

    if (!prerequisitesMet) {
      console.error('Quest prerequisites not met');
      return false;
    }

    this.state.player.active_quests.push(questId);

    this.emitEvent({
      type: 'quest_started',
      quest_id: questId
    });

    console.log(`Quest started: ${quest.quest_name}`);
    return true;
  }

  /**
   * Complete a quest objective
   */
  completeQuestObjective(questId: string, objectiveId: string): boolean {
    const quest = this.state.quests.find(q => q.quest_id === questId);
    if (!quest) return false;

    if (!this.state.player.active_quests.includes(questId)) return false;

    this.emitEvent({
      type: 'objective_completed',
      quest_id: questId,
      objective_id: objectiveId
    });

    // Check if all objectives are complete
    // In a full implementation, we'd track objective progress
    // For now, simplified logic
    
    console.log(`Objective completed: ${objectiveId}`);
    return true;
  }

  /**
   * Complete a quest and grant rewards
   */
  completeQuest(questId: string): boolean {
    const quest = this.state.quests.find(q => q.quest_id === questId);
    if (!quest) return false;

    if (!this.state.player.active_quests.includes(questId)) return false;

    // Remove from active
    this.state.player.active_quests = this.state.player.active_quests.filter(
      id => id !== questId
    );

    // Add to completed
    this.state.player.completed_quests.push(questId);

    // Grant rewards
    if (quest.rewards.unlock_tail_tier) {
      this.setPlayerTailCount(quest.rewards.unlock_tail_tier);
    }

    this.emitEvent({
      type: 'quest_completed',
      quest_id: questId
    });

    console.log(`Quest completed: ${quest.quest_name}`);
    return true;
  }

  /**
   * Register event callback
   */
  addEventListener(callback: StoryModeEventCallback): void {
    this.eventCallbacks.push(callback);
  }

  /**
   * Unregister event callback
   */
  removeEventListener(callback: StoryModeEventCallback): void {
    this.eventCallbacks = this.eventCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Emit an event to all listeners
   */
  private emitEvent(event: StoryModeEvent): void {
    this.eventCallbacks.forEach(callback => callback(event));
  }

  /**
   * Load districts from JSON
   */
  private async loadDistricts(): Promise<void> {
    try {
      const response = await fetch(`${this.dataPath}/story_mode/roaring_city.json`);
      const data = await response.json();
      
      if (data.districts) {
        this.state.districts = data.districts;
      }
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  }

  /**
   * Load NPCs from JSON
   */
  private async loadNPCs(): Promise<void> {
    try {
      // Load all NPC files
      const npcFiles = ['elder_kaito'];
      
      for (const npcFile of npcFiles) {
        const response = await fetch(`${this.dataPath}/npcs/${npcFile}.json`);
        const npc = await response.json();
        this.state.npcs.push(npc);
      }
    } catch (error) {
      console.error('Failed to load NPCs:', error);
    }
  }

  /**
   * Load quests from JSON
   */
  private async loadQuests(): Promise<void> {
    try {
      // Load all quest files
      const questFiles = ['first_awakening', 'memory_trial'];
      
      for (const questFile of questFiles) {
        const response = await fetch(`${this.dataPath}/quests/${questFile}.json`);
        const quest = await response.json();
        this.state.quests.push(quest);
      }
    } catch (error) {
      console.error('Failed to load quests:', error);
    }
  }
}

// Singleton instance
let storyModeServiceInstance: StoryModeService | null = null;

/**
 * Get the Story Mode service singleton
 */
export function getStoryModeService(): StoryModeService {
  if (!storyModeServiceInstance) {
    storyModeServiceInstance = new StoryModeService();
  }
  return storyModeServiceInstance;
}
