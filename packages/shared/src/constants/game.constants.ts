export const GAME_CONSTANTS = {
  TARGET_FPS: 60,
  FIXED_TIMESTEP: 16.67, // milliseconds (1000/60)
  MAX_DELTA_TIME: 100, // Maximum delta time to prevent spiral of death
  
  BATTLE: {
    DEFAULT_STOCK_COUNT: 3,
    DEFAULT_TIME_LIMIT: 480, // 8 minutes in seconds
    DEFAULT_STAMINA: 150,
    MAX_DAMAGE: 999,
  },

  PERFORMANCE: {
    FPS_SAMPLE_SIZE: 60,
    PERFORMANCE_WARNING_THRESHOLD: 30, // FPS
  },
} as const;
