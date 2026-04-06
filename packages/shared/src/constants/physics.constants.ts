export const PHYSICS_CONSTANTS = {
  // Gravity and falling
  GRAVITY: 0.8, // Units per frame^2
  MAX_FALL_SPEED: 20,
  FAST_FALL_MULTIPLIER: 1.6,

  // Ground movement
  GROUND_FRICTION: 0.85,
  ICE_FRICTION: 0.98,
  STICKY_FRICTION: 0.7,
  
  // Air movement
  AIR_RESISTANCE: 0.98,
  AIR_ACCELERATION: 0.3,
  AIR_DECELERATION: 0.95,
  
  // Jump mechanics
  JUMP_BUFFER_FRAMES: 6,
  COYOTE_TIME_FRAMES: 5,
  SHORT_HOP_MULTIPLIER: 0.6,
  
  // Collision
  COLLISION_EPSILON: 0.01,
  MAX_COLLISION_ITERATIONS: 4,
  
  // Momentum
  MOMENTUM_PRESERVATION: 0.9, // How much speed is kept
  DASH_MOMENTUM_MULTIPLIER: 1.3,
  
  // Platform
  PLATFORM_DROP_FRAMES: 3, // Frames to hold down to drop through
} as const;
