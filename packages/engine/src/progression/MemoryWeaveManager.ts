/**
 * Memory Weave Manager
 * 
 * Manages memory layer lifecycle and player memory progression.
 * 
 * Memory layers are behavioral modifiers that:
 * - Stack cumulatively with every tail unlock
 * - Cannot be toggled, respecced, or reset
 * - Persist irreversibly across save/load cycles
 * - Apply before gameplay systems (perception → decision → action)
 * 
 * System enforces: Power makes you dangerous. Memory makes you precise.
 */

import {
  MemoryLayer,
  ActiveMemoryState,
  CumulativeMemoryEffects,
} from './MemoryWeaveTypes';

export class MemoryWeaveManager {
  private memoryLayers: Map<number, MemoryLayer> = new Map();
  private activeMemories: Set<number> = new Set([1, 2, 3]); // Start with first 3 tails

  /**
   * Load a memory layer and validate it
   */
  loadMemoryLayer(memoryData: any): void {
    if (!this.validateMemoryLayer(memoryData)) {
      throw new Error(
        `Memory layer validation failed for ${memoryData.memory_id || 'unknown'}`
      );
    }

    const memory = memoryData as MemoryLayer;
    this.memoryLayers.set(memory.tail_number, memory);
  }

  /**
   * Load multiple memory layers
   */
  loadMemoryLayers(memories: any[]): void {
    memories.forEach(memory => this.loadMemoryLayer(memory));
  }

  /**
   * Validate a memory layer against requirements
   */
  private validateMemoryLayer(memory: any): boolean {
    if (!memory.memory_id || typeof memory.memory_id !== 'string') {
      return false;
    }
    if (
      !memory.tail_number ||
      typeof memory.tail_number !== 'number' ||
      memory.tail_number < 1 ||
      memory.tail_number > 9
    ) {
      return false;
    }
    if (!memory.memory_type || typeof memory.memory_type !== 'string') {
      return false;
    }
    if (!memory.gameplay_effects || typeof memory.gameplay_effects !== 'object') {
      return false;
    }
    if (!Array.isArray(memory.gameplay_effects.perception_shifts)) {
      return false;
    }
    if (!Array.isArray(memory.gameplay_effects.behavior_modifications)) {
      return false;
    }
    if (!Array.isArray(memory.gameplay_effects.enemy_reactions)) {
      return false;
    }
    if (!Array.isArray(memory.gameplay_effects.world_interactions)) {
      return false;
    }
    return true;
  }

  /**
   * Activate a memory layer for a specific tail number
   * This is irreversible - once activated, cannot be deactivated
   */
  activateMemoryLayer(tailNumber: number): void {
    if (tailNumber < 1 || tailNumber > 9) {
      throw new Error(`Invalid tail number: ${tailNumber}. Must be 1-9.`);
    }

    const memory = this.memoryLayers.get(tailNumber);
    if (!memory) {
      throw new Error(`Memory layer not found for tail ${tailNumber}`);
    }

    // Activate the memory (immutable operation)
    this.activeMemories.add(tailNumber);
  }

  /**
   * Get all active memory layers in order (1 → current tail)
   */
  getActiveMemories(): MemoryLayer[] {
    const activeMemoryArray: MemoryLayer[] = [];

    // Sort active memories by tail number
    const sortedTailNumbers = Array.from(this.activeMemories).sort((a, b) => a - b);

    for (const tailNumber of sortedTailNumbers) {
      const memory = this.memoryLayers.get(tailNumber);
      if (memory) {
        activeMemoryArray.push(memory);
      }
    }

    return activeMemoryArray;
  }

  /**
   * Get cumulative effects of a specific type from all active memories
   */
  getMemoryEffect(effectType: keyof CumulativeMemoryEffects): string[] {
    const effects: string[] = [];

    for (const memory of this.getActiveMemories()) {
      const memoryEffects = memory.gameplay_effects[effectType];
      if (memoryEffects && Array.isArray(memoryEffects)) {
        effects.push(...memoryEffects);
      }
    }

    return effects;
  }

  /**
   * Get all cumulative effects from active memories
   */
  getCumulativeEffects(): CumulativeMemoryEffects {
    return {
      perception_shifts: this.getMemoryEffect('perception_shifts'),
      behavior_modifications: this.getMemoryEffect('behavior_modifications'),
      enemy_reactions: this.getMemoryEffect('enemy_reactions'),
      world_interactions: this.getMemoryEffect('world_interactions'),
    };
  }

  /**
   * Apply memory behavioral modifications to a context
   * This runs every frame and is additive with increasing tail count
   */
  applyMemoryBehavior(context: any): void {
    const effects = this.getCumulativeEffects();

    // Store effects in context for other systems to read
    if (context) {
      context.memoryEffects = effects;
      context.activeMemoryCount = this.activeMemories.size;
      context.activeMemories = this.getActiveMemories();
    }
  }

  /**
   * Check if a specific tail's memory is active
   */
  isMemoryActive(tailNumber: number): boolean {
    return this.activeMemories.has(tailNumber);
  }

  /**
   * Get the count of active memories
   */
  getActiveMemoryCount(): number {
    return this.activeMemories.size;
  }

  /**
   * Get a specific memory layer by tail number
   */
  getMemoryLayer(tailNumber: number): MemoryLayer | undefined {
    return this.memoryLayers.get(tailNumber);
  }

  /**
   * Get all loaded memory layers
   */
  getAllMemoryLayers(): Map<number, MemoryLayer> {
    return new Map(this.memoryLayers);
  }

  /**
   * Get active memory state for serialization (save file)
   */
  getActiveMemoryState(): ActiveMemoryState {
    return {
      activeTailNumbers: new Set(this.activeMemories),
      memoryLayers: new Map(this.memoryLayers),
    };
  }

  /**
   * Load active memories from save data
   * This restores player progression
   */
  loadActiveMemories(activeTailNumbers: number[]): void {
    // Validate and restore active memories
    for (const tailNumber of activeTailNumbers) {
      if (tailNumber < 1 || tailNumber > 9) {
        console.warn(`Warning: Invalid tail number ${tailNumber} in save data`);
        continue;
      }

      const memory = this.memoryLayers.get(tailNumber);
      if (!memory) {
        console.warn(`Warning: Memory layer not found for tail ${tailNumber}`);
        continue;
      }

      this.activeMemories.add(tailNumber);
    }
  }

  /**
   * Verify memory count matches tail count
   * Memory count should always equal tail count
   */
  verifyMemoryTailSync(tailCount: number): boolean {
    return this.activeMemories.size === tailCount;
  }

  /**
   * Reset manager state (for testing or new game)
   */
  reset(): void {
    this.activeMemories.clear();
    // Start with memories for first 3 tails
    this.activeMemories.add(1);
    this.activeMemories.add(2);
    this.activeMemories.add(3);
  }
}
