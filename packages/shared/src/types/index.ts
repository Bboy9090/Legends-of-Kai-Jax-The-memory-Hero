// Explicit re-exports to avoid TS2308 ambiguity errors
export type {
  Vector2D,
  Vector3D,
  Velocity,
  AABB,
  Circle,
  RigidBody,
  PhysicsConfig,
  CollisionResult,
  Platform,
} from './physics.types';

// Enums must be exported as values, not types
export { SurfaceType } from './physics.types';

export type {
  Hitbox,
  HitResult,
  ComboState,
  AttackData,
  CounterWindow,
  KnockbackState,
} from './combat.types';

// Enums must be exported as values, not types
export { DamageType, HitboxType } from './combat.types';

export {
  FighterState,
  type FighterStats,
  type MoveSet,
  type Fighter,
  type FighterConfig,
  type FighterDisplayState,
} from './character.types';

export {
  InputType,
  InputAction,
  type InputState,
  type InputBuffer,
  type TouchInput,
  type GamepadState,
  type KeyboardState,
  type GestureInput,
  type InputConfig,
} from './input.types';

export {
  GameState,
  BattleMode,
  type GameConfig,
  type BattleConfig,
  type PlayerSlot,
  type BattleState,
  type Stage,
  type GameSession,
  type PerformanceMetrics,
} from './game.types';
