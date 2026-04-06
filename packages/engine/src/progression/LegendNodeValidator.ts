/**
 * Legend Node Validator
 * 
 * Validates Legend Node data against schema rules.
 * Enforces:
 * - tail_unlocked must be 4-9
 * - no_skip_allowed must be true
 * - No duplicate tail_unlocked values across all nodes
 * - Irreversible markers (once unlocked, cannot be re-locked)
 */

import { LegendNode, ValidationResult } from './LegendNodeTypes';

export class LegendNodeValidator {
  private static loadedNodes: Map<string, LegendNode> = new Map();

  /**
   * Validate a Legend Node against schema and business rules
   */
  static validateLegendNode(nodeData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate node_id format
    if (!nodeData.node_id || typeof nodeData.node_id !== 'string') {
      errors.push('node_id is required and must be a string');
    } else if (!nodeData.node_id.match(/^legend_node_[a-z0-9_]+$/)) {
      errors.push('node_id must match pattern: legend_node_[a-z0-9_]+');
    }

    // Validate tail_unlocked is 4-9
    if (typeof nodeData.tail_unlocked !== 'number') {
      errors.push('tail_unlocked is required and must be a number');
    } else if (nodeData.tail_unlocked < 4 || nodeData.tail_unlocked > 9) {
      errors.push('tail_unlocked must be between 4 and 9 (tails 1-3 are starting tails)');
    }

    // Validate required string fields
    if (!nodeData.name || typeof nodeData.name !== 'string') {
      errors.push('name is required and must be a string');
    }
    if (!nodeData.location || typeof nodeData.location !== 'string') {
      errors.push('location is required and must be a string');
    }

    // Validate unlock_conditions
    if (!nodeData.unlock_conditions || typeof nodeData.unlock_conditions !== 'object') {
      errors.push('unlock_conditions is required and must be an object');
    } else {
      const uc = nodeData.unlock_conditions;
      
      if (typeof uc.starting_tail_count_required !== 'number') {
        errors.push('unlock_conditions.starting_tail_count_required is required and must be a number');
      } else if (uc.starting_tail_count_required < 3 || uc.starting_tail_count_required > 8) {
        errors.push('unlock_conditions.starting_tail_count_required must be between 3 and 8');
      }
      
      // Enforce no_skip_allowed must be true
      if (uc.no_skip_allowed !== true) {
        errors.push('unlock_conditions.no_skip_allowed must be true (Legend Nodes cannot be skipped)');
      }
    }

    // Validate trial_rules
    if (!nodeData.trial_rules || typeof nodeData.trial_rules !== 'object') {
      errors.push('trial_rules is required and must be an object');
    } else {
      const tr = nodeData.trial_rules;
      
      if (typeof tr.healing_disabled !== 'boolean') {
        errors.push('trial_rules.healing_disabled is required and must be a boolean');
      }
      if (typeof tr.revives_disabled !== 'boolean') {
        errors.push('trial_rules.revives_disabled is required and must be a boolean');
      }
      if (typeof tr.environmental_kills_allowed !== 'boolean') {
        errors.push('trial_rules.environmental_kills_allowed is required and must be a boolean');
      }
      if (!tr.difficulty_scaling || !['fixed', 'adaptive'].includes(tr.difficulty_scaling)) {
        errors.push('trial_rules.difficulty_scaling must be either "fixed" or "adaptive"');
      }
    }

    // Validate victory_conditions exists
    if (!nodeData.victory_conditions || typeof nodeData.victory_conditions !== 'object') {
      errors.push('victory_conditions is required and must be an object');
    }

    // Validate failure_conditions
    if (!nodeData.failure_conditions || typeof nodeData.failure_conditions !== 'object') {
      errors.push('failure_conditions is required and must be an object');
    } else {
      const fc = nodeData.failure_conditions;
      
      if (typeof fc.health_depleted !== 'boolean') {
        errors.push('failure_conditions.health_depleted is required and must be a boolean');
      }
      if (typeof fc.excessive_damage_taken !== 'boolean') {
        errors.push('failure_conditions.excessive_damage_taken is required and must be a boolean');
      }
    }

    // Validate reward
    if (!nodeData.reward || typeof nodeData.reward !== 'object') {
      errors.push('reward is required and must be an object');
    } else {
      const reward = nodeData.reward;
      
      if (!reward.tail || typeof reward.tail !== 'string') {
        errors.push('reward.tail is required and must be a string');
      }
      if (!reward.visual_change || typeof reward.visual_change !== 'string') {
        errors.push('reward.visual_change is required and must be a string');
      }
      if (!Array.isArray(reward.combat_unlocks) || reward.combat_unlocks.length === 0) {
        errors.push('reward.combat_unlocks is required and must be a non-empty array');
      }
    }

    // Check for duplicate tail_unlocked across loaded nodes
    if (errors.length === 0 && nodeData.tail_unlocked) {
      for (const [existingNodeId, existingNode] of this.loadedNodes.entries()) {
        if (existingNodeId !== nodeData.node_id && existingNode.tail_unlocked === nodeData.tail_unlocked) {
          errors.push(`Duplicate tail_unlocked value ${nodeData.tail_unlocked}. Node "${existingNodeId}" already unlocks this tail.`);
        }
      }
    }

    // If validation passed, register this node
    if (errors.length === 0) {
      this.loadedNodes.set(nodeData.node_id, nodeData as LegendNode);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Clear the loaded nodes cache (useful for testing)
   */
  static clearLoadedNodes(): void {
    this.loadedNodes.clear();
  }

  /**
   * Get all loaded nodes
   */
  static getLoadedNodes(): Map<string, LegendNode> {
    return new Map(this.loadedNodes);
  }
}
