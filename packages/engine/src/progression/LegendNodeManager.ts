/**
 * Legend Node Manager
 * Manages Legend Node progression and enforces sequential tail unlocking.
 * 
 * Legend Nodes are story-critical trials that unlock new tails.
 * Players cannot skip trials: 3→4 (Quill)→5 (Shade)→6 (Anchor)→...→9 (Crown)
 */

import * as fs from 'fs';
import * as path from 'path';

// Constants for tail progression (from kai_jax.character.json)
const STARTING_TAIL_COUNT = 3;

/**
 * Legend Node definition
 */
export interface LegendNode {
  node_id: string;
  node_name: string;
  tail_unlocked: number;
  starting_tail_count_required: number;
  location: string;
  description?: string;
  trial_rules: {
    minimap_disabled?: boolean;
    lock_on_disabled?: boolean;
    healing_disabled?: boolean;
    environmental_kills_allowed?: boolean;
  };
  victory_conditions: Record<string, any>;
  failure_conditions: string[];
  reward: {
    tail_name: string;
    tail_function: string;
    visual_change?: string;
    narrative_weight?: string;
  };
  combat_unlocks?: string[];
  lore?: Record<string, any>;
}

/**
 * Player progression state
 */
export interface PlayerProgressionState {
  current_tail_count: number;
  completed_legend_nodes: string[];
  unlocked_abilities: string[];
}

/**
 * Validation result for Legend Node attempt
 */
export interface LegendNodeAttemptResult {
  can_attempt: boolean;
  reason?: string;
  required_tail_count?: number;
  missing_prerequisites?: string[];
}

/**
 * LegendNodeManager class
 * Manages Legend Node progression and enforces canonical tail unlocking.
 */
export class LegendNodeManager {
  private legendNodesPath: string;
  private loadedNodes: Map<string, LegendNode>;

  constructor(legendNodesPath: string = '../../../data/legend_nodes') {
    this.legendNodesPath = path.resolve(__dirname, legendNodesPath);
    this.loadedNodes = new Map();
  }

  /**
   * Load a Legend Node from JSON file
   */
  private loadLegendNode(nodeId: string): LegendNode {
    if (this.loadedNodes.has(nodeId)) {
      return this.loadedNodes.get(nodeId)!;
    }

    try {
      const filePath = path.join(this.legendNodesPath, `${nodeId}.node.json`);
      const data = fs.readFileSync(filePath, 'utf-8');
      const node = JSON.parse(data) as LegendNode;
      
      this.loadedNodes.set(nodeId, node);
      return node;
    } catch (error) {
      throw new Error(`Failed to load Legend Node ${nodeId}: ${error}`);
    }
  }

  /**
   * Load all available Legend Nodes
   */
  public loadAllLegendNodes(): LegendNode[] {
    try {
      const files = fs.readdirSync(this.legendNodesPath);
      const nodeFiles = files.filter(f => f.endsWith('.node.json'));
      
      const nodes: LegendNode[] = [];
      for (const file of nodeFiles) {
        const nodeId = file.replace('.node.json', '');
        try {
          const node = this.loadLegendNode(nodeId);
          nodes.push(node);
        } catch (error) {
          console.error(`Failed to load ${file}:`, error);
        }
      }
      
      return nodes.sort((a, b) => a.tail_unlocked - b.tail_unlocked);
    } catch (error) {
      console.error('Failed to load Legend Nodes:', error);
      return [];
    }
  }

  /**
   * Get Legend Node by ID
   */
  public getLegendNode(nodeId: string): LegendNode | null {
    try {
      return this.loadLegendNode(nodeId);
    } catch (error) {
      console.error(`Failed to get Legend Node ${nodeId}:`, error);
      return null;
    }
  }

  /**
   * Check if player can attempt a Legend Node
   */
  public canAttemptLegendNode(
    nodeId: string,
    playerState: PlayerProgressionState
  ): LegendNodeAttemptResult {
    try {
      const node = this.loadLegendNode(nodeId);

      // Check if already completed
      if (playerState.completed_legend_nodes.includes(nodeId)) {
        return {
          can_attempt: false,
          reason: 'Legend Node already completed'
        };
      }

      // Check tail count requirement
      if (playerState.current_tail_count < node.starting_tail_count_required) {
        return {
          can_attempt: false,
          reason: `Requires ${node.starting_tail_count_required} tails (you have ${playerState.current_tail_count})`,
          required_tail_count: node.starting_tail_count_required
        };
      }

      // Enforce sequential progression (no skipping)
      const expectedTailCount = node.starting_tail_count_required;
      if (playerState.current_tail_count !== expectedTailCount) {
        return {
          can_attempt: false,
          reason: `Must complete previous Legend Node first. You cannot skip tail unlocks.`,
          required_tail_count: expectedTailCount
        };
      }

      // Check if there are prerequisite nodes that must be completed first
      const missingPrereqs = this.getMissingPrerequisites(node, playerState);
      if (missingPrereqs.length > 0) {
        return {
          can_attempt: false,
          reason: 'Must complete prerequisite Legend Nodes first',
          missing_prerequisites: missingPrereqs
        };
      }

      return {
        can_attempt: true
      };
    } catch (error) {
      return {
        can_attempt: false,
        reason: `Failed to validate Legend Node: ${error}`
      };
    }
  }

  /**
   * Get missing prerequisite nodes
   */
  private getMissingPrerequisites(
    node: LegendNode,
    playerState: PlayerProgressionState
  ): string[] {
    const missing: string[] = [];
    
    // For sequential progression, all previous tails must be unlocked
    const requiredTailCount = node.starting_tail_count_required;
    
    // Load all nodes and check if all previous tail unlocks are completed
    const allNodes = this.loadAllLegendNodes();
    
    for (const otherNode of allNodes) {
      if (otherNode.tail_unlocked < node.tail_unlocked) {
        // This node unlocks an earlier tail
        if (!playerState.completed_legend_nodes.includes(otherNode.node_id)) {
          missing.push(otherNode.node_id);
        }
      }
    }
    
    return missing;
  }

  /**
   * Complete a Legend Node and unlock tail
   */
  public completeLegendNode(
    nodeId: string,
    playerState: PlayerProgressionState
  ): PlayerProgressionState {
    const node = this.loadLegendNode(nodeId);

    // Verify can attempt
    const attemptResult = this.canAttemptLegendNode(nodeId, playerState);
    if (!attemptResult.can_attempt) {
      throw new Error(`Cannot complete Legend Node: ${attemptResult.reason}`);
    }

    // Update player state
    const newState: PlayerProgressionState = {
      current_tail_count: node.tail_unlocked,
      completed_legend_nodes: [...playerState.completed_legend_nodes, nodeId],
      unlocked_abilities: [
        ...playerState.unlocked_abilities,
        node.reward.tail_name,
        ...(node.combat_unlocks || [])
      ]
    };

    return newState;
  }

  /**
   * Get next available Legend Node for player
   */
  public getNextLegendNode(playerState: PlayerProgressionState): LegendNode | null {
    const allNodes = this.loadAllLegendNodes();
    
    for (const node of allNodes) {
      const attemptResult = this.canAttemptLegendNode(node.node_id, playerState);
      if (attemptResult.can_attempt) {
        return node;
      }
    }
    
    return null;
  }

  /**
   * Validate sequential tail progression
   * Throws error if player state violates progression rules
   */
  public validateSequentialProgression(playerState: PlayerProgressionState): void {
    const allNodes = this.loadAllLegendNodes();
    
    // Build expected progression path
    const expectedPath: number[] = [STARTING_TAIL_COUNT]; // Starting tails
    
    for (const node of allNodes) {
      if (playerState.completed_legend_nodes.includes(node.node_id)) {
        expectedPath.push(node.tail_unlocked);
      }
    }
    
    // Verify no gaps
    for (let i = 1; i < expectedPath.length; i++) {
      if (expectedPath[i] !== expectedPath[i - 1] + 1) {
        throw new Error(
          `Invalid tail progression: jumped from ${expectedPath[i - 1]} to ${expectedPath[i]}. ` +
          `Sequential progression is required (no skipping).`
        );
      }
    }
    
    // Verify current tail count matches progression
    const lastTailCount = expectedPath[expectedPath.length - 1];
    if (playerState.current_tail_count !== lastTailCount) {
      throw new Error(
        `Current tail count (${playerState.current_tail_count}) does not match ` +
        `progression history (expected ${lastTailCount})`
      );
    }
  }
}
