/**
 * Legend Node Manager
 * 
 * Manages Legend Node lifecycle and player progression through the tail unlock system.
 * - Loads all Legend Node files
 * - Tracks completed nodes per player (immutable set)
 * - Enforces sequential progression rules
 * - Prevents duplicate completions
 */

import { LegendNode } from './LegendNodeTypes';
import { LegendNodeValidator } from './LegendNodeValidator';

export class LegendNodeManager {
  private legendNodes: Map<string, LegendNode> = new Map();
  private completedNodes: Set<string> = new Set();
  private unlockedTails: Set<number> = new Set([1, 2, 3]); // Start with 3 tails

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
   * Complete a Legend Node and grant the tail unlock
   * This is irreversible - once complete, cannot be undone
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

    // Mark as complete (immutable)
    this.completedNodes.add(nodeId);
    
    // Grant the tail unlock (irreversible)
    this.unlockedTails.add(node.tail_unlocked);
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
