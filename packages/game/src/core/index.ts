/**
 * CORE SYSTEMS — Central Exports
 * 
 * Import this to access all game systems:
 * import { eventBus, gameStateManager, sagaEngine } from '@game/core';
 */

export { eventBus, EventMap, EventCallback } from './EventBus';
export { 
  gameStateManager, 
  GameMode, 
  GameState, 
  MatchState, 
  CharacterState,
  SagaModeState 
} from './GameStateManager';
export { 
  sagaEngine, 
  BookId, 
  NarrativeEra, 
  StoryNode, 
  NarrativeChoice 
} from './SagaEngine';
