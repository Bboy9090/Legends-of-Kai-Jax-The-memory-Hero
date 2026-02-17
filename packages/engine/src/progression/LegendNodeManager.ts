/**
 * Legend Node Manager
 * 
 * Manages Legend Node lifecycle and player progression through the tail unlock system.
 * - Loads all Legend Node files
 * - Tracks completed nodes per player (immutable set)
 * - Enforces sequential progression rules
 * - Prevents duplicate completions
 * - Integrates with Memory Weave system for memory layer activation
 */

import { LegendNode } from './LegendNodeTypes';
import { LegendNodeValidator } from './LegendNodeValidator';
import { MemoryWeaveManager } from './MemoryWeaveManager';

export class LegendNodeManager {
  private legendNodes: Map<string, LegendNode> = new Map();
  private completedNodes: Set<string> = new Set();
  private unlockedTails: Set<number> = new Set([1, 2, 3]); // Start with 3 tails
  private memoryWeaveManager?: MemoryWeaveManager;

  /**
   * Load a Legend Node and validate it
   */
  loadLegendNode(nodeData: any): void {
    const validation = LegendNodeValidator.validateLegendNode(nodeData);
    
    if (!validation.valid) {
      throw new Error(
        `Legend Node validation failed for ${nodeData.node_id || 'unknown'}:\n${validation.errors.join('\n')}`
      );
    }

    this.legendNodes.set(nodeData.node_id, nodeData as LegendNode);
  }

  /**
   * Load multiple Legend Nodes
   */
  loadLegendNodes(nodes: any[]): void {
    nodes.forEach(node => this.loadLegendNode(node));
  }

  /**
   * Check if player can attempt a specific Legend Node
   */
  canAttemptNode(nodeId: string, playerTails: number): boolean {
    const node = this.legendNodes.get(nodeId);
    
    if (!node) {
      throw new Error(`Legend Node "${nodeId}" not found`);
    }

    // Cannot attempt if already completed
    if (this.completedNodes.has(nodeId)) {
      return false;
    }

    // Must have exact required tail count
    if (playerTails !== node.unlock_conditions.starting_tail_count_required) {
      return false;
    }

    return true;
  }

  /**
   * Set the Memory Weave Manager for integration
   */
  setMemoryWeaveManager(manager: MemoryWeaveManager): void {
    this.memoryWeaveManager = manager;
  }

  /**
   * Complete a Legend Node and grant the tail unlock
   * This is irreversible - once complete, cannot be undone
   * 
   * Integration with Memory Weave:
   * 1. Memory layer is activated BEFORE tail count increments
   * 2. Memory unsealing happens first (perception changes)
   * 3. Then tail unlock happens (power changes)
   */
  completeNode(nodeId: string): void {
    const node = this.legendNodes.get(nodeId);
    
    if (!node) {
      throw new Error(`Legend Node "${nodeId}" not found`);
    }

    // Prevent attempting same node twice
    if (this.completedNodes.has(nodeId)) {
      throw new Error(`Legend Node "${nodeId}" has already been completed. Tail unlocks are irreversible.`);
    }

    // MEMORY WEAVE INTEGRATION:
    // Activate memory layer BEFORE granting tail (memory before power)
    if (this.memoryWeaveManager) {
      try {
        this.memoryWeaveManager.activateMemoryLayer(node.tail_unlocked);
      } catch (error) {
        // CRITICAL: Must not proceed if memory activation fails
        // This would break the memory-tail invariant permanently
        throw new Error(
          `Failed to activate memory layer for tail ${node.tail_unlocked}: ${error instanceof Error ? error.message : String(error)}. ` +
          `Cannot complete node "${nodeId}" - memory-tail invariant must be maintained.`
        );
      }
    }

    // Mark as complete (immutable)
    this.completedNodes.add(nodeId);
    
    // Grant the tail unlock (irreversible)
    this.unlockedTails.add(node.tail_unlocked);

    // Verify memory and tail counts are synchronized
    if (this.memoryWeaveManager) {
      const memoryCount = this.memoryWeaveManager.getActiveMemoryCount();
      const tailCount = this.unlockedTails.size;
      
      if (memoryCount !== tailCount) {
        // This should never happen now that we fail on memory activation errors
        throw new Error(
          `CRITICAL: Memory count (${memoryCount}) does not match tail count (${tailCount})! ` +
          `Memory must always equal tails. This indicates a severe invariant violation.`
        );
      }
    }
  }

  /**
   * Get the current tail count after all completed nodes
   */
  getUnlockedTails(): number {
    return this.unlockedTails.size;
  }

  /**
   * Get all unlocked tail numbers
   */
  getUnlockedTailNumbers(): Set<number> {
    return new Set(this.unlockedTails);
  }

  /**
   * Check if a specific tail is unlocked
   */
  isTailUnlocked(tailNumber: number): boolean {
    return this.unlockedTails.has(tailNumber);
  }

  /**
   * Check if a node has been completed
   */
  isNodeCompleted(nodeId: string): boolean {
    return this.completedNodes.has(nodeId);
  }

  /**
   * Get all completed node IDs
   */
  getCompletedNodes(): Set<string> {
    return new Set(this.completedNodes);
  }

  /**
   * Get a specific Legend Node by ID
   */
  getNode(nodeId: string): LegendNode | undefined {
    return this.legendNodes.get(nodeId);
  }

  /**
   * Get all loaded Legend Nodes
   */
  getAllNodes(): Map<string, LegendNode> {
    return new Map(this.legendNodes);
  }

  /**
   * Load completed nodes from save data
   * This restores player progression
   */
  loadCompletedNodes(completedNodeIds: string[]): void {
    // Validate and restore completed nodes
    for (const nodeId of completedNodeIds) {
      const node = this.legendNodes.get(nodeId);
      
      if (!node) {
        console.warn(`Warning: Saved node "${nodeId}" not found in current Legend Nodes`);
        continue;
      }

      this.completedNodes.add(nodeId);
      this.unlockedTails.add(node.tail_unlocked);
    }
  }

  /**
   * Reset manager state (for testing or new game)
   */
  reset(): void {
    this.completedNodes.clear();
    this.unlockedTails.clear();
    this.unlockedTails.add(1);
    this.unlockedTails.add(2);
    this.unlockedTails.add(3);
  }

  /**
   * Get the next available Legend Node for the current tail count
   */
  getNextAvailableNode(currentTailCount: number): LegendNode | null {
    for (const [nodeId, node] of this.legendNodes) {
      if (
        !this.completedNodes.has(nodeId) &&
        node.unlock_conditions.starting_tail_count_required === currentTailCount
      ) {
        return node;
      }
    }
    return null;
  }
}
