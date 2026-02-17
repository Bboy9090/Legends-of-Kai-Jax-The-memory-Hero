/**
 * World State Manager
 * Tracks game world state including completed Legend Nodes, tail progression, and narrative beats.
 * 
 * World state changes are irreversible once committed to save file.
 */

// Constants for tail progression (from kai_jax.character.json)
const STARTING_TAIL_COUNT = 3;
const MAX_TAIL_COUNT = 9;

/**
 * World state data structure
 */
export interface WorldState {
  // Progression tracking
  current_tail_count: number;
  completed_legend_nodes: string[];
  unlocked_abilities: string[];
  
  // Zone states
  discovered_zones: string[];
  cleared_zones: string[];
  
  // Narrative tracking
  narrative_beats_completed: string[];
  current_chapter: number;
  
  // Enemy behavior tracking
  enemy_threat_level: number; // Scales with tail count
  elite_tactics_enabled: boolean;
  
  // Music state
  music_intensity_tier: number; // Tied to tail count
  
  // NPC reactions
  npc_fear_level: number;
  npc_worship_level: number;
  
  // Metadata
  save_version: string;
  last_updated: number; // timestamp
}

/**
 * Default starting world state
 */
export function createDefaultWorldState(): WorldState {
  return {
    current_tail_count: STARTING_TAIL_COUNT,
    completed_legend_nodes: [],
    unlocked_abilities: ['bond', 'hunter', 'thread'], // Starting tails
    discovered_zones: [],
    cleared_zones: [],
    narrative_beats_completed: [],
    current_chapter: 1,
    enemy_threat_level: 3,
    elite_tactics_enabled: false,
    music_intensity_tier: 3,
    npc_fear_level: 0,
    npc_worship_level: 0,
    save_version: '1.0.0',
    last_updated: Date.now()
  };
}

/**
 * WorldStateManager class
 * Manages persistent world state and enforces progression rules.
 */
export class WorldStateManager {
  private worldState: WorldState;

  constructor(initialState?: WorldState) {
    this.worldState = initialState || createDefaultWorldState();
  }

  /**
   * Get current world state
   * Returns a deep copy to prevent external mutation of internal state
   */
  public getState(): Readonly<WorldState> {
    return {
      ...this.worldState,
      completed_legend_nodes: [...this.worldState.completed_legend_nodes],
      unlocked_abilities: [...this.worldState.unlocked_abilities],
      discovered_zones: [...this.worldState.discovered_zones],
      cleared_zones: [...this.worldState.cleared_zones],
      narrative_beats_completed: [...this.worldState.narrative_beats_completed]
    };
  }

  /**
   * Update tail count and associated world reactions
   */
  public updateTailCount(newCount: number): void {
    if (newCount < this.worldState.current_tail_count) {
      throw new Error(
        'Cannot decrease tail count. Tail progression is permanent and irreversible.'
      );
    }

    if (newCount < STARTING_TAIL_COUNT || newCount > MAX_TAIL_COUNT) {
      throw new Error(`Invalid tail count: ${newCount}. Must be between ${STARTING_TAIL_COUNT} and ${MAX_TAIL_COUNT}.`);
    }

    // Sequential progression check
    if (newCount > this.worldState.current_tail_count + 1) {
      throw new Error(
        `Cannot skip tail unlocks: attempting to go from ${this.worldState.current_tail_count} to ${newCount}. ` +
        `Sequential progression is required.`
      );
    }

    this.worldState.current_tail_count = newCount;
    this.worldState.enemy_threat_level = newCount;
    this.worldState.music_intensity_tier = newCount;
    
    // Update NPC reactions based on tail tier
    this.updateNPCReactions(newCount);
    
    // Enable elite tactics at tier 5+
    if (newCount >= 5) {
      this.worldState.elite_tactics_enabled = true;
    }

    this.worldState.last_updated = Date.now();
  }

  /**
   * Update NPC reactions based on tail count (from tail_tier_reactions.json)
   */
  private updateNPCReactions(tailCount: number): void {
    // Map tail count to fear/worship levels (from tail_tier_reactions.json)
    const reactionMap: Record<number, { fear: number; worship: number }> = {
      [STARTING_TAIL_COUNT]: { fear: 0, worship: 0 },
      4: { fear: 1, worship: 0 },
      5: { fear: 2, worship: 1 },
      6: { fear: 3, worship: 2 },
      7: { fear: 4, worship: 3 },
      8: { fear: 5, worship: 4 },
      9: { fear: 5, worship: 5 }
    };

    const reaction = reactionMap[tailCount] || { fear: 0, worship: 0 };
    this.worldState.npc_fear_level = reaction.fear;
    this.worldState.npc_worship_level = reaction.worship;
  }

  /**
   * Mark Legend Node as completed
   */
  public completeLegendNode(nodeId: string, tailUnlocked: number): void {
    if (this.worldState.completed_legend_nodes.includes(nodeId)) {
      console.warn(`Legend Node ${nodeId} already completed`);
      return;
    }

    // Update tail count first - this may throw validation errors
    // Only record completion if tail count update succeeds (atomic ordering)
    this.updateTailCount(tailUnlocked);
    this.worldState.completed_legend_nodes.push(nodeId);
    this.worldState.last_updated = Date.now();
  }

  /**
   * Check if Legend Node is completed
   */
  public isLegendNodeCompleted(nodeId: string): boolean {
    return this.worldState.completed_legend_nodes.includes(nodeId);
  }

  /**
   * Unlock ability
   */
  public unlockAbility(abilityName: string): void {
    if (!this.worldState.unlocked_abilities.includes(abilityName)) {
      this.worldState.unlocked_abilities.push(abilityName);
      this.worldState.last_updated = Date.now();
    }
  }

  /**
   * Check if ability is unlocked
   */
  public isAbilityUnlocked(abilityName: string): boolean {
    return this.worldState.unlocked_abilities.includes(abilityName);
  }

  /**
   * Discover zone
   */
  public discoverZone(zoneName: string): void {
    if (!this.worldState.discovered_zones.includes(zoneName)) {
      this.worldState.discovered_zones.push(zoneName);
      this.worldState.last_updated = Date.now();
    }
  }

  /**
   * Clear zone (all encounters defeated)
   */
  public clearZone(zoneName: string): void {
    if (!this.worldState.cleared_zones.includes(zoneName)) {
      this.worldState.cleared_zones.push(zoneName);
      this.worldState.last_updated = Date.now();
    }
  }

  /**
   * Complete narrative beat
   */
  public completeNarrativeBeat(beatId: string): void {
    if (!this.worldState.narrative_beats_completed.includes(beatId)) {
      this.worldState.narrative_beats_completed.push(beatId);
      this.worldState.last_updated = Date.now();
    }
  }

  /**
   * Advance to next chapter
   */
  public advanceChapter(): void {
    this.worldState.current_chapter++;
    this.worldState.last_updated = Date.now();
  }

  /**
   * Serialize world state for save file
   */
  public serialize(): string {
    return JSON.stringify(this.worldState, null, 2);
  }

  /**
   * Deserialize world state from save file
   */
  public static deserialize(data: string): WorldStateManager {
    try {
      const state = JSON.parse(data) as WorldState;
      return new WorldStateManager(state);
    } catch (error) {
      throw new Error(`Failed to deserialize world state: ${error}`);
    }
  }

  /**
   * Validate world state integrity
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate tail count
    if (this.worldState.current_tail_count < STARTING_TAIL_COUNT || this.worldState.current_tail_count > MAX_TAIL_COUNT) {
      errors.push(`Invalid tail count: ${this.worldState.current_tail_count}`);
    }

    // Validate sequential progression
    const completedNodes = this.worldState.completed_legend_nodes.length;
    const expectedTailCount = STARTING_TAIL_COUNT + completedNodes;
    if (this.worldState.current_tail_count !== expectedTailCount) {
      errors.push(
        `Tail count mismatch: have ${this.worldState.current_tail_count} tails but ` +
        `${completedNodes} nodes completed (expected ${expectedTailCount})`
      );
    }

    // Validate ability unlocks match tail count
    const startingAbilities = STARTING_TAIL_COUNT; // bond, hunter, thread
    const minAbilities = startingAbilities + completedNodes;
    if (this.worldState.unlocked_abilities.length < minAbilities) {
      errors.push(
        `Insufficient unlocked abilities: have ${this.worldState.unlocked_abilities.length}, ` +
        `expected at least ${minAbilities}`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
