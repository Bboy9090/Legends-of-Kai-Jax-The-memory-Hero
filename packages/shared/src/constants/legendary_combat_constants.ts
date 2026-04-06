/**
 * LEGENDARY COMBAT CONSTANTS - BEYOND BEYOND LEGENDARY
 * 
 * World-class combat system constants for:
 * - Advanced combo systems
 * - Perfect dodge/parry mechanics
 * - Enhanced meters and feedback
 * - Cinematic combat feel
 */

export const LEGENDARY_COMBAT_CONSTANTS = {
  // ==================== COMBO SYSTEM ====================
  COMBO: {
    // Extended combo window for flow
    RESET_TIME: 2000, // 2 seconds (increased from 1s)
    EXTENDED_WINDOW: 3000, // 3 seconds for perfect combos
    
    // Advanced multiplier scaling
    MULTIPLIER_SCALING: 0.15, // 15% per hit (increased from 10%)
    MAX_MULTIPLIER: 5.0, // 500% max (increased from 200%)
    PERFECT_COMBO_BONUS: 0.5, // 50% bonus for perfect timing
    
    // Combo tiers for visual feedback
    TIERS: {
      GOOD: 5,      // 5+ hits = "Good!"
      GREAT: 10,    // 10+ hits = "Great!"
      AMAZING: 20,  // 20+ hits = "Amazing!"
      LEGENDARY: 50, // 50+ hits = "LEGENDARY!"
      INFINITE: 100, // 100+ hits = "INFINITE!"
    },
    
    // Combo route system
    ROUTE_BONUS: 0.2, // 20% bonus for following combo routes
    AIR_COMBO_BONUS: 0.3, // 30% bonus for aerial combos
    TEAM_COMBO_BONUS: 0.5, // 50% bonus for team combos
  },

  // ==================== PERFECT DODGE SYSTEM ====================
  PERFECT_DODGE: {
    WINDOW_MS: 200, // 0.2 seconds before impact
    SLOW_MOTION_SCALE: 0.25, // 75% slow-down (more dramatic)
    SLOW_MOTION_DURATION: 3000, // 3 seconds (increased from 2s)
    COUNTER_WINDOW_MS: 3000, // 3 seconds to counter (increased)
    
    // Visual feedback
    OUTLINE_COLOR: '#00FFFF', // Cyan outline
    OUTLINE_INTENSITY: 2.0,
    PARTICLE_BURST: 50, // Particles on perfect dodge
    
    // Rewards
    REFLEX_METER_GAIN: 25, // 25% per perfect dodge (increased)
    DAMAGE_BONUS: 2.0, // 2x damage in counter window
    INVINCIBILITY_FRAMES: 10, // 10 frames of invincibility
  },

  // ==================== PERFECT PARRY SYSTEM ====================
  PERFECT_PARRY: {
    WINDOW_MS: 150, // 0.15 seconds (tighter window = more skill)
    STUN_DURATION_MS: 2000, // 2 seconds (increased from 1.5s)
    COMBO_MULTIPLIER: 3.0, // 3x damage in combo window (increased)
    
    // Visual feedback
    SPARK_COLOR: '#FFD700', // Gold sparks
    SPARK_COUNT: 100, // Massive spark burst
    SCREEN_FLASH: true,
    SCREEN_FLASH_COLOR: '#FFFFFF',
    SCREEN_FLASH_INTENSITY: 0.8,
    
    // Rewards
    RESONANCE_METER_GAIN: 30, // 30% per perfect parry (increased)
    GUARANTEED_CRIT: true, // Perfect parry = guaranteed crit
    CRIT_MULTIPLIER: 2.5, // 2.5x crit damage
  },

  // ==================== METER SYSTEMS ====================
  METERS: {
    // Ultimate Meter
    ULTIMATE: {
      GAIN_PER_HIT: 3, // Increased from 2
      GAIN_PER_DAMAGE: 2, // Increased from 1
      GAIN_PER_PERFECT_DODGE: 10, // NEW
      GAIN_PER_PERFECT_PARRY: 15, // NEW
      GAIN_PER_COMBO_HIT: 1, // NEW - per hit in combo
      MAX: 100,
      OVERFLOW: true, // Can exceed 100% for bonus effects
      OVERFLOW_MULTIPLIER: 1.5, // 1.5x damage at 150%+
    },
    
    // Resonance Meter (Special Abilities)
    RESONANCE: {
      BASE_MAX: 100,
      GAIN_PER_ACTION: 5,
      GAIN_PER_COMBO: 10,
      GAIN_PER_PERFECT_PARRY: 30,
      DECAY_RATE: 0.5, // Per second
      OVERFLOW_ENABLED: true,
    },
    
    // Reflex Meter (Dodge/Parry)
    REFLEX: {
      BASE_MAX: 100,
      GAIN_PER_DODGE: 15,
      GAIN_PER_PERFECT_DODGE: 25,
      GAIN_PER_PARRY: 20,
      DECAY_RATE: 1.0, // Per second
      OVERFLOW_ENABLED: true,
    },
    
    // Combo Meter (Visual Display)
    COMBO: {
      MAX_DISPLAY: 999, // Display up to 999
      FADE_TIME: 5000, // 5 seconds to fade
      SIZE_SCALING: true, // Text grows with combo count
      COLOR_SHIFTS: {
        0: '#FFFFFF',   // White
        10: '#00FF00',  // Green
        20: '#00FFFF',  // Cyan
        50: '#FF00FF',  // Magenta
        100: '#FF0000', // Red
      },
    },
  },

  // ==================== SCREEN EFFECTS ====================
  SCREEN_EFFECTS: {
    // Screen Shake
    SHAKE: {
      INTENSITY_MULTIPLIER: 0.2, // Increased from 0.1
      DURATION_BASE: 200, // Increased from 100ms
      DURATION_PER_DAMAGE: 2, // 2ms per damage point
      MAX_DURATION: 1000, // 1 second max
      FREQUENCY: 20, // Hz
    },
    
    // Hit Stop (Frame Freeze)
    HIT_STOP: {
      ENABLED: true,
      BASE_FRAMES: 3, // 3 frames base
      PER_DAMAGE: 0.1, // 0.1 frames per damage
      MAX_FRAMES: 15, // 15 frames max
      SCALE: 0.0, // Time scale during hit stop
    },
    
    // Slow Motion
    SLOW_MOTION: {
      DURATION: 500, // 500ms (increased from 200ms)
      SCALE: 0.2, // 20% speed (more dramatic)
      TRIGGER_THRESHOLD: 50, // Damage threshold
      PERFECT_DODGE_SCALE: 0.25, // Special scale for perfect dodge
    },
    
    // Screen Flash
    FLASH: {
      ENABLED: true,
      DURATION: 100, // 100ms
      COLOR: '#FFFFFF',
      INTENSITY: 0.3,
      TRIGGER_ON_CRIT: true,
      TRIGGER_ON_ULTIMATE: true,
    },
    
    // Chromatic Aberration (for big hits)
    CHROMATIC_ABERRATION: {
      ENABLED: true,
      INTENSITY: 0.01,
      TRIGGER_THRESHOLD: 100, // Damage threshold
    },
    
    // Vignette (for dramatic moments)
    VIGNETTE: {
      ENABLED: true,
      INTENSITY: 0.5,
      TRIGGER_ON_LOW_HEALTH: true,
      LOW_HEALTH_THRESHOLD: 25, // 25% health
    },
  },

  // ==================== PARTICLE EFFECTS ====================
  PARTICLES: {
    // Hit Particles
    HIT: {
      COUNT: 30, // Increased from default
      SPEED: 5.0,
      SIZE: 0.3,
      LIFE: 0.8,
      COLOR: '#FFD700', // Gold
      BURST_SHAPE: 'sphere',
    },
    
    // Critical Hit Particles
    CRIT: {
      COUNT: 100, // Massive burst
      SPEED: 8.0,
      SIZE: 0.5,
      LIFE: 1.2,
      COLOR: '#FF0000', // Red
      BURST_SHAPE: 'explosion',
    },
    
    // Perfect Dodge Particles
    PERFECT_DODGE: {
      COUNT: 50,
      SPEED: 6.0,
      SIZE: 0.4,
      LIFE: 1.0,
      COLOR: '#00FFFF', // Cyan
      TRAIL_ENABLED: true,
    },
    
    // Perfect Parry Particles
    PERFECT_PARRY: {
      COUNT: 150, // Massive burst
      SPEED: 10.0,
      SIZE: 0.6,
      LIFE: 1.5,
      COLOR: '#FFD700', // Gold
      RING_EFFECT: true, // Expanding ring
    },
    
    // Combo Particles
    COMBO: {
      COUNT: 20,
      SPEED: 3.0,
      SIZE: 0.2,
      LIFE: 0.6,
      COLOR: '#FFFFFF',
      TRAIL_ENABLED: true,
    },
  },

  // ==================== DAMAGE SYSTEM ====================
  DAMAGE: {
    // Base multipliers
    PHYSICAL: 1.0,
    ENERGY: 1.0,
    SPECIAL: 1.5, // Increased from 1.2
    ULTIMATE: 3.0, // NEW - ultimate damage multiplier
    
    // Critical hits
    CRIT_CHANCE_BASE: 0.05, // 5% base
    CRIT_DAMAGE_MULTIPLIER: 2.0, // 2x damage
    PERFECT_PARRY_CRIT: true, // Perfect parry = guaranteed crit
    
    // Damage scaling
    COMBO_DAMAGE_SCALING: true,
    AIR_COMBO_BONUS: 0.2, // 20% bonus
    WALL_BOUNCE_BONUS: 0.3, // 30% bonus
    GROUND_SLAM_BONUS: 0.4, // 40% bonus
  },

  // ==================== ATTACK SYSTEM ====================
  ATTACK: {
    // Cancel windows
    CANCEL_WINDOW_START: 0.6, // 60% through animation (earlier)
    CANCEL_WINDOW_END: 0.9, // 90% through animation
    CANCEL_TYPES: ['dodge', 'special', 'ultimate'], // What can cancel
    
    // Attack properties
    STARTUP_FRAMES: 3, // Minimum startup
    ACTIVE_FRAMES: 5, // Active hitbox duration
    RECOVERY_FRAMES: 10, // Recovery time
    HITSTOP_FRAMES: 3, // Hit stop on connect
    
    // Combo routes
    MAX_COMBO_LENGTH: 20, // Maximum hits in one combo
    COMBO_ROUTE_BONUS: 0.15, // 15% bonus for following routes
  },

  // ==================== DODGE SYSTEM ====================
  DODGE: {
    // Standard dodge
    IFRAME_DURATION: 15, // 15 frames of invincibility
    COOLDOWN: 30, // 30 frame cooldown
    DISTANCE: 3.0, // Dodge distance
    
    // Perfect dodge
    PERFECT_WINDOW: 200, // 200ms window
    PERFECT_REWARD: {
      SLOW_MOTION: true,
      COUNTER_WINDOW: 3000,
      DAMAGE_BONUS: 2.0,
      METER_GAIN: 25,
    },
    
    // Air dodge
    AIR_DODGE_ENABLED: true,
    AIR_DODGE_COUNT: 1, // One air dodge per jump
    AIR_DODGE_IFRAMES: 10,
  },

  // ==================== PARRY SYSTEM ====================
  PARRY: {
    // Standard parry
    WINDOW_FRAMES: 5, // 5 frame window
    DAMAGE_MULTIPLIER: 1.5,
    STUN_DURATION: 1000, // 1 second
    
    // Perfect parry
    PERFECT_WINDOW: 150, // 150ms window (tighter)
    PERFECT_REWARD: {
      STUN_DURATION: 2000, // 2 seconds
      DAMAGE_MULTIPLIER: 3.0,
      GUARANTEED_CRIT: true,
      METER_GAIN: 30,
    },
    
    // Parry types
    TYPES: ['light', 'heavy', 'special', 'ultimate'],
    COUNTER_ATTACK_BONUS: 0.5, // 50% bonus for counter attacks
  },

  // ==================== ULTIMATE SYSTEM ====================
  ULTIMATE: {
    // Charge requirements
    CHARGE_REQUIRED: 100,
    CHARGE_OVERFLOW: true, // Can exceed 100%
    
    // Ultimate properties
    DAMAGE_MULTIPLIER: 3.0, // 3x damage
    INVINCIBILITY_DURATION: 60, // 60 frames
    SCREEN_FREEZE: true, // Freeze screen on activation
    CINEMATIC_CAMERA: true, // Cinematic camera angles
    
    // Team ultimate
    TEAM_ULTIMATE_ENABLED: true,
    TEAM_ULTIMATE_MULTIPLIER: 5.0, // 5x damage
    TEAM_ULTIMATE_REQUIREMENT: 4, // 4 characters needed
  },

  // ==================== VISUAL FEEDBACK ====================
  VISUAL: {
    // Damage numbers
    DAMAGE_NUMBERS: {
      ENABLED: true,
      SIZE: 1.0,
      DURATION: 1000, // 1 second
      COLOR: '#FFFFFF',
      CRIT_COLOR: '#FF0000',
      COMBO_COLOR: '#00FFFF',
      FLOAT_SPEED: 2.0,
      SCALE_ANIMATION: true,
    },
    
    // Hit indicators
    HIT_INDICATORS: {
      ENABLED: true,
      PERFECT_DODGE_COLOR: '#00FFFF',
      PERFECT_PARRY_COLOR: '#FFD700',
      CRIT_COLOR: '#FF0000',
      SIZE: 2.0,
      DURATION: 500,
    },
    
    // Combo display
    COMBO_DISPLAY: {
      ENABLED: true,
      POSITION: 'top-center',
      SIZE_SCALING: true,
      COLOR_SHIFTS: true,
      ANIMATION: 'bounce',
    },
  },

  // ==================== CAMERA SYSTEM ====================
  CAMERA: {
    // Dynamic camera
    DYNAMIC_ENABLED: true,
    FOLLOW_SPEED: 0.1,
    ZOOM_ON_HIT: true,
    ZOOM_INTENSITY: 1.2,
    ZOOM_DURATION: 200,
    
    // Cinematic camera
    CINEMATIC_ENABLED: true,
    CINEMATIC_TRIGGERS: ['ultimate', 'perfect_parry', 'ko'],
    CINEMATIC_DURATION: 2000, // 2 seconds
    CINEMATIC_ANGLES: ['low', 'high', 'side', 'dramatic'],
  },
} as const;
