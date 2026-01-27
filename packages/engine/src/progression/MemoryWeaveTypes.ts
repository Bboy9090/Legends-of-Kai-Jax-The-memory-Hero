/**
 * Memory Weave Type Definitions
 * 
 * Types for the Memory Weave system - behavioral modifiers that stack with tail unlocks.
 * Memory is force multiplication through meaning — it modifies perception, decision-making, 
 * and world interaction before stats.
 */

export type MemoryType =
  | 'bond'
  | 'chase'
  | 'connection'
  | 'pain_remembered'
  | 'disappearance'
  | 'holding_line'
  | 'alternate_futures'
  | 'cost_of_power'
  | 'time_paid';

export interface MemoryLayerGameplayEffects {
  perception_shifts: string[];
  behavior_modifications: string[];
  enemy_reactions: string[];
  world_interactions: string[];
}

export interface MemoryLayer {
  memory_id: string;
  tail_number: number;
  memory_type: MemoryType;
  name: string;
  description: string;
  read: string;
  gameplay_effects: MemoryLayerGameplayEffects;
  stacking_rule: 'cumulative';
  persistence: 'irreversible';
}

export interface ActiveMemoryState {
  activeTailNumbers: Set<number>;
  memoryLayers: Map<number, MemoryLayer>;
}

export interface MemoryEffectContext {
  playerState?: any;
  enemyState?: any;
  worldState?: any;
  combatState?: any;
}

export interface CumulativeMemoryEffects {
  perception_shifts: string[];
  behavior_modifications: string[];
  enemy_reactions: string[];
  world_interactions: string[];
}
