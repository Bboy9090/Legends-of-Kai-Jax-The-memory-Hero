/**
 * Legend Node Type Definitions
 * 
 * Types for the Legend Node progression system.
 * Legend Nodes are irreversible behavioral trials that gate tail unlocks.
 */

export interface LegendNodeUnlockConditions {
  starting_tail_count_required: number;
  no_skip_allowed: true; // Always true for Legend Nodes
}

export interface LegendNodeTrialRules {
  healing_disabled: boolean;
  revives_disabled: boolean;
  environmental_kills_allowed: boolean;
  difficulty_scaling: 'fixed' | 'adaptive';
}

export interface LegendNodeVictoryConditions {
  perfect_dodges_required?: number;
  posture_breaks_required?: number;
  damage_taken_threshold?: number;
  time_limit_seconds?: number;
  enemies_defeated_required?: number;
}

export interface LegendNodeFailureConditions {
  health_depleted: boolean;
  excessive_damage_taken: boolean;
  time_limit_exceeded?: boolean;
}

export interface LegendNodeReward {
  tail: string;
  visual_change: string;
  combat_unlocks: string[];
}

export interface MemoryUnsealed {
  memory_id: string;
  tail_number: number;
}

export interface LegendNode {
  node_id: string;
  tail_unlocked: 4 | 5 | 6 | 7 | 8 | 9;
  name: string;
  location: string;
  unlock_conditions: LegendNodeUnlockConditions;
  trial_rules: LegendNodeTrialRules;
  victory_conditions: LegendNodeVictoryConditions;
  failure_conditions: LegendNodeFailureConditions;
  reward: LegendNodeReward;
  memory_unsealed?: MemoryUnsealed;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
