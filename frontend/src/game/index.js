/**
 * LEGENDS OF KAI-JAX: Game Module Exports
 * 
 * This is the skeleton that becomes Unreal/Unity.
 */

// ═══════════════════════════════════════════════════════════
// CORE SYSTEMS (Engine-Ready)
// ═══════════════════════════════════════════════════════════
export { default as CharacterController } from './core/CharacterController';
export * from './data/FrameData';

// ═══════════════════════════════════════════════════════════
// LEGACY SYSTEMS (Reference Implementation)
// ═══════════════════════════════════════════════════════════
export { default as GameEngine, GAME_CONFIG, GAME_STATES } from './engine/GameEngine';
export { default as Fighter } from './entities/Fighter';
export { default as KaiJax, TAIL_DATA, TAIL_MOVES } from './entities/KaiJax';
export { default as Enemy, ENEMY_TYPES, AI_STATES } from './entities/Enemy';

// ═══════════════════════════════════════════════════════════
// ARENAS
// ═══════════════════════════════════════════════════════════
export { default as CombatArena } from './CombatArena';
export { default as TestArena } from './TestArena';
