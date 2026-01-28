/**
 * @file index.ts
 * @brief Story Mode System - Main exports
 * 
 * Complete story mode implementation with:
 * - Open-world district traversal
 * - NPC interaction and quest framework
 * - Unified combat system
 * - Enemy AI with tail-tier adaptation
 * 
 * CANONICAL LAW:
 * - Platform-agnostic (PC/mobile/tablet use same systems)
 * - Tail progression 3→9 enforced
 * - Single unified gameplay core
 * - Data-driven from JSON
 */

// Services
export { StoryModeService, getStoryModeService } from './StoryModeService';
export { CombatService, getCombatService } from './CombatService';
export { AIService, getAIService } from './AIService';

// Types
export * from './StoryModeTypes';

// Re-export common types for convenience
export type {
  StoryModeEventCallback,
} from './StoryModeService';

export type {
  HitCallback,
  ComboCallback,
  ParryCallback,
} from './CombatService';

export type {
  AIAction,
  EnemySpawnedCallback,
  EnemyDefeatedCallback,
  EnemyAlertedCallback,
} from './AIService';
