export const COMBAT_CONSTANTS = {
  // Knockback calculation
  KNOCKBACK_BASE_MULTIPLIER: 0.03,
  KNOCKBACK_SCALING_MULTIPLIER: 0.01,
  WEIGHT_MULTIPLIER: 2.0,
  RAGE_MULTIPLIER_MAX: 1.15, // 15% extra knockback at high %
  
  // DI (Directional Influence)
  DI_STRENGTH: 18, // Degrees that DI can influence
  DI_MULTIPLIER: 0.25,
  
  // Hitstun and hitlag
  HITSTUN_BASE_FRAMES: 2,
  HITSTUN_MULTIPLIER: 0.4,
  HITLAG_BASE_FRAMES: 2,
  HITLAG_MULTIPLIER: 0.3,
  HITLAG_MAX_FRAMES: 20,
  
  // Counter and parry
  COUNTER_WINDOW_FRAMES: 8,
  COUNTER_MULTIPLIER: 1.5,
  PARRY_WINDOW_FRAMES: 3,
  PARRY_MULTIPLIER: 2.0,
  PERFECT_PARRY_BONUS_FRAMES: 2, // Extra counter window
  
  // Combo system
  COMBO_RESET_TIME: 1000, // milliseconds
  COMBO_MULTIPLIER_SCALING: 0.1, // 10% per hit
  MAX_COMBO_MULTIPLIER: 2.0, // 200% max
  FREEFLOW_RANGE: 5, // Units - range to chain to new target
  
  // Screen effects
  SCREEN_SHAKE_INTENSITY_MULTIPLIER: 0.1,
  SCREEN_SHAKE_DURATION_BASE: 100, // milliseconds
  SLOW_MOTION_DURATION: 200, // milliseconds for big hits
  SLOW_MOTION_SCALE: 0.3, // 30% speed
  
  // Damage types
  PHYSICAL_DAMAGE_MULTIPLIER: 1.0,
  ENERGY_DAMAGE_MULTIPLIER: 1.0,
  SPECIAL_DAMAGE_MULTIPLIER: 1.2,
  
  // Attack properties
  ATTACK_CANCEL_WINDOW_START: 0.7, // 70% through animation
  LEDGE_CANCEL_WINDOW: 5, // Frames
  
  // Ultimate meter
  ULTIMATE_METER_GAIN_PER_HIT: 2,
  ULTIMATE_METER_GAIN_PER_DAMAGE_TAKEN: 1,
  ULTIMATE_METER_MAX: 100,
  
  // Grab
  GRAB_RANGE: 2,
  GRAB_STARTUP_FRAMES: 6,
  PUMMEL_DAMAGE: 1,
  PUMMEL_COOLDOWN_FRAMES: 20,
} as const;
