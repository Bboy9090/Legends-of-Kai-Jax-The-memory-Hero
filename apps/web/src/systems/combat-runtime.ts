/**
 * Combat Systems Index
 * Central export point for combat runtime
 */

export { MoveInterpreter } from './MoveInterpreter';
export { Hurtbox } from './Hurtbox';
export { CollisionResolver } from './CollisionResolver';
export { FighterEntity } from './FighterEntity';
export { CombatTestHarness, runCombatTest } from './CombatTestHarness';

export type { ActiveHitbox } from '../types/MoveSpec';
export type { MoveSpec, HitSpec } from '../types/MoveSpec';
export type { CollisionResult } from './CollisionResolver';
export type { FighterState } from './FighterEntity';
