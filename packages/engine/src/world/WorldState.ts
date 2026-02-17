/**
 * World State
 * 
 * Global state manager for world progression and Legend Node tracking.
 * Persists to save file and loads on game start.
 * Tracks irreversible progression markers.
 */

export interface WorldStateData {
  completedLegendNodes: string[];
  currentTailCount: number;
  unlockedTails: number[];
  playerLevel: number;
  discoveredZones: string[];
}

export class WorldState {
  private completedLegendNodes: Set<string> = new Set();
  private currentTailCount: number = 3; // Start with 3 tails
  private unlockedTails: Set<number> = new Set([1, 2, 3]);
  private playerLevel: number = 1;
  private discoveredZones: Set<string> = new Set();

  /**
   * Mark a Legend Node as complete
   * This is irreversible
   */
  completeNode(nodeId: string, tailUnlocked: number): void {
    if (this.completedLegendNodes.has(nodeId)) {
      throw new Error(`Node ${nodeId} is already complete. Cannot complete twice.`);
    }

    this.completedLegendNodes.add(nodeId);
    this.unlockedTails.add(tailUnlocked);
    this.currentTailCount = this.unlockedTails.size;

    // Enforce: tail count never exceeds 9
    if (this.currentTailCount > 9) {
      throw new Error('Tail count cannot exceed 9');
    }
  }

  /**
   * Check if a node has been completed
   */
  isNodeCompleted(nodeId: string): boolean {
    return this.completedLegendNodes.has(nodeId);
  }

  /**
   * Get current tail count
   */
  getCurrentTailCount(): number {
    return this.currentTailCount;
  }

  /**
   * Get all unlocked tail numbers
   */
  getUnlockedTails(): number[] {
    return Array.from(this.unlockedTails).sort((a, b) => a - b);
  }

  /**
   * Check if a specific tail is unlocked
   */
  isTailUnlocked(tailNumber: number): boolean {
    return this.unlockedTails.has(tailNumber);
  }

  /**
   * Get all completed Legend Node IDs
   */
  getCompletedNodes(): string[] {
    return Array.from(this.completedLegendNodes);
  }

  /**
   * Discover a new zone
   */
  discoverZone(zoneName: string): void {
    this.discoveredZones.add(zoneName);
  }

  /**
   * Check if a zone has been discovered
   */
  isZoneDiscovered(zoneName: string): boolean {
    return this.discoveredZones.has(zoneName);
  }

  /**
   * Set player level
   */
  setPlayerLevel(level: number): void {
    if (level < 1) {
      throw new Error('Player level must be at least 1');
    }
    this.playerLevel = Math.max(this.playerLevel, level);
  }

  /**
   * Get player level
   */
  getPlayerLevel(): number {
    return this.playerLevel;
  }

  /**
   * Serialize world state to save file
   */
  serialize(): WorldStateData {
    return {
      completedLegendNodes: Array.from(this.completedLegendNodes),
      currentTailCount: this.currentTailCount,
      unlockedTails: Array.from(this.unlockedTails).sort((a, b) => a - b),
      playerLevel: this.playerLevel,
      discoveredZones: Array.from(this.discoveredZones),
    };
  }

  /**
   * Load world state from save file
   */
  load(data: WorldStateData): void {
    // Validate data
    if (!data.completedLegendNodes || !Array.isArray(data.completedLegendNodes)) {
      throw new Error('Invalid save data: completedLegendNodes must be an array');
    }
    if (typeof data.currentTailCount !== 'number' || data.currentTailCount < 3 || data.currentTailCount > 9) {
      throw new Error('Invalid save data: currentTailCount must be between 3 and 9');
    }
    if (!data.unlockedTails || !Array.isArray(data.unlockedTails)) {
      throw new Error('Invalid save data: unlockedTails must be an array');
    }

    // Validate unlocked tails content and range
    for (const tail of data.unlockedTails) {
      if (
        typeof tail !== 'number' ||
        !Number.isInteger(tail) ||
        tail < 1 ||
        tail > 9
      ) {
        throw new Error('Invalid save data: unlockedTails entries must be integers between 1 and 9');
      }
    }

    // Validate player level explicitly to avoid silent coercion
    if (
      typeof data.playerLevel !== 'number' ||
      !Number.isFinite(data.playerLevel) ||
      data.playerLevel < 1
    ) {
      throw new Error('Invalid save data: playerLevel must be a number greater than or equal to 1');
    }

    // Validate discoveredZones if present
    if (data.discoveredZones !== undefined && !Array.isArray(data.discoveredZones)) {
      throw new Error('Invalid save data: discoveredZones must be an array if provided');
    }

    // Load data
    this.completedLegendNodes = new Set(data.completedLegendNodes);
    this.currentTailCount = data.currentTailCount;
    this.unlockedTails = new Set(data.unlockedTails);
    this.playerLevel = data.playerLevel;
    this.discoveredZones = new Set(data.discoveredZones || []);

    // Validate consistency after loading
    const unlockedCount = this.unlockedTails.size;
    if (unlockedCount < 3 || unlockedCount > 9) {
      throw new Error('Invalid save data: unlockedTails size must be between 3 and 9');
    }
    if (unlockedCount !== this.currentTailCount) {
      throw new Error('Invalid save data: unlockedTails size must match currentTailCount');
    }
  }

  /**
   * Reset world state (for new game)
   */
  reset(): void {
    this.completedLegendNodes.clear();
    this.currentTailCount = 3;
    this.unlockedTails.clear();
    this.unlockedTails.add(1);
    this.unlockedTails.add(2);
    this.unlockedTails.add(3);
    this.playerLevel = 1;
    this.discoveredZones.clear();
  }

  /**
   * Create a new empty world state
   */
  static create(): WorldState {
    return new WorldState();
  }

  /**
   * Create a world state from save data
   */
  static fromSaveData(data: WorldStateData): WorldState {
    const state = new WorldState();
    state.load(data);
    return state;
  }
}
