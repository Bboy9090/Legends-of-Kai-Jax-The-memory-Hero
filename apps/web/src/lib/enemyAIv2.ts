/**
 * Enemy AI System v2
 * Advanced state machine with difficulty scaling, type variants, and group coordination
 */

export type AIState = 'idle' | 'patrol' | 'chase' | 'attack' | 'retreat' | 'stun' | 'dead';
export type EnemyType = 'grunt' | 'tank' | 'attacker' | 'healer' | 'elite' | 'boss' | 'void-scout' | 'void-stalker' | 'rift-drone' | 'hyena-scout';
export type AIBehaviorDifficulty = 'easy' | 'normal' | 'hard' | 'legendary';

export interface AIDecision {
  action: 'attack' | 'dodge' | 'block' | 'heal' | 'special' | 'retreat' | 'wait';
  moveIndex: number;
  priority: number; // 0-100
  confidence: number; // 0-1
}

export interface EnemyBehaviorProfile {
  type: EnemyType;
  difficulty: AIBehaviorDifficulty;
  aggressiveness: number; // 0-1: how likely to attack
  defensiveness: number; // 0-1: how likely to dodge/block
  attackSpacing: number; // milliseconds between attacks
  retreatThreshold: number; // HP % when enemy retreats
  telegraphDelay: number; // milliseconds to show attack intention
  decisionUpdateRate: number; // milliseconds between AI decisions
}

export interface BossPhase {
  id: string;
  name: string;
  healthThreshold: number; // HP % when phase starts
  moveSet: string[]; // special moves for this phase
  attacks: {
    moveIndex: number;
    weight: number; // relative probability
    delay: number; // milliseconds before executing
  }[];
  specialBehavior?: 'aggro' | 'defensive' | 'summon' | 'heal' | 'mega_attack';
}

export interface BossAIProfile {
  minionType?: EnemyType; // type of minions to summon
  minionCount?: number;
  phases: BossPhase[];
  phaseTransitionEffect?: string;
  enrageMultiplier: number; // damage multiplier when low HP
}

// Default behavior profiles for different enemy types
export const BEHAVIOR_PROFILES: Record<EnemyType, Record<AIBehaviorDifficulty, EnemyBehaviorProfile>> = {
  grunt: {
    easy: {
      type: 'grunt',
      difficulty: 'easy',
      aggressiveness: 0.4,
      defensiveness: 0.2,
      attackSpacing: 2000,
      retreatThreshold: 20,
      telegraphDelay: 600,
      decisionUpdateRate: 800,
    },
    normal: {
      type: 'grunt',
      difficulty: 'normal',
      aggressiveness: 0.6,
      defensiveness: 0.35,
      attackSpacing: 1500,
      retreatThreshold: 25,
      telegraphDelay: 400,
      decisionUpdateRate: 600,
    },
    hard: {
      type: 'grunt',
      difficulty: 'hard',
      aggressiveness: 0.75,
      defensiveness: 0.5,
      attackSpacing: 1200,
      retreatThreshold: 30,
      telegraphDelay: 300,
      decisionUpdateRate: 400,
    },
    legendary: {
      type: 'grunt',
      difficulty: 'legendary',
      aggressiveness: 0.9,
      defensiveness: 0.65,
      attackSpacing: 800,
      retreatThreshold: 35,
      telegraphDelay: 200,
      decisionUpdateRate: 300,
    },
  },

  tank: {
    easy: {
      type: 'tank',
      difficulty: 'easy',
      aggressiveness: 0.3,
      defensiveness: 0.7,
      attackSpacing: 2500,
      retreatThreshold: 30,
      telegraphDelay: 700,
      decisionUpdateRate: 1000,
    },
    normal: {
      type: 'tank',
      difficulty: 'normal',
      aggressiveness: 0.45,
      defensiveness: 0.8,
      attackSpacing: 2000,
      retreatThreshold: 35,
      telegraphDelay: 500,
      decisionUpdateRate: 800,
    },
    hard: {
      type: 'tank',
      difficulty: 'hard',
      aggressiveness: 0.6,
      defensiveness: 0.85,
      attackSpacing: 1600,
      retreatThreshold: 40,
      telegraphDelay: 350,
      decisionUpdateRate: 600,
    },
    legendary: {
      type: 'tank',
      difficulty: 'legendary',
      aggressiveness: 0.75,
      defensiveness: 0.9,
      attackSpacing: 1200,
      retreatThreshold: 45,
      telegraphDelay: 250,
      decisionUpdateRate: 400,
    },
  },

  attacker: {
    easy: {
      type: 'attacker',
      difficulty: 'easy',
      aggressiveness: 0.7,
      defensiveness: 0.15,
      attackSpacing: 1000,
      retreatThreshold: 15,
      telegraphDelay: 400,
      decisionUpdateRate: 500,
    },
    normal: {
      type: 'attacker',
      difficulty: 'normal',
      aggressiveness: 0.8,
      defensiveness: 0.25,
      attackSpacing: 800,
      retreatThreshold: 20,
      telegraphDelay: 300,
      decisionUpdateRate: 400,
    },
    hard: {
      type: 'attacker',
      difficulty: 'hard',
      aggressiveness: 0.88,
      defensiveness: 0.35,
      attackSpacing: 600,
      retreatThreshold: 25,
      telegraphDelay: 200,
      decisionUpdateRate: 300,
    },
    legendary: {
      type: 'attacker',
      difficulty: 'legendary',
      aggressiveness: 0.95,
      defensiveness: 0.45,
      attackSpacing: 400,
      retreatThreshold: 30,
      telegraphDelay: 150,
      decisionUpdateRate: 200,
    },
  },

  healer: {
    easy: {
      type: 'healer',
      difficulty: 'easy',
      aggressiveness: 0.25,
      defensiveness: 0.6,
      attackSpacing: 3000,
      retreatThreshold: 50,
      telegraphDelay: 800,
      decisionUpdateRate: 1200,
    },
    normal: {
      type: 'healer',
      difficulty: 'normal',
      aggressiveness: 0.35,
      defensiveness: 0.65,
      attackSpacing: 2500,
      retreatThreshold: 55,
      telegraphDelay: 600,
      decisionUpdateRate: 1000,
    },
    hard: {
      type: 'healer',
      difficulty: 'hard',
      aggressiveness: 0.45,
      defensiveness: 0.7,
      attackSpacing: 2000,
      retreatThreshold: 60,
      telegraphDelay: 400,
      decisionUpdateRate: 800,
    },
    legendary: {
      type: 'healer',
      difficulty: 'legendary',
      aggressiveness: 0.55,
      defensiveness: 0.75,
      attackSpacing: 1500,
      retreatThreshold: 65,
      telegraphDelay: 300,
      decisionUpdateRate: 600,
    },
  },

  elite: {
    easy: {
      type: 'elite',
      difficulty: 'easy',
      aggressiveness: 0.65,
      defensiveness: 0.5,
      attackSpacing: 1200,
      retreatThreshold: 25,
      telegraphDelay: 500,
      decisionUpdateRate: 600,
    },
    normal: {
      type: 'elite',
      difficulty: 'normal',
      aggressiveness: 0.75,
      defensiveness: 0.6,
      attackSpacing: 900,
      retreatThreshold: 30,
      telegraphDelay: 400,
      decisionUpdateRate: 500,
    },
    hard: {
      type: 'elite',
      difficulty: 'hard',
      aggressiveness: 0.82,
      defensiveness: 0.7,
      attackSpacing: 700,
      retreatThreshold: 35,
      telegraphDelay: 300,
      decisionUpdateRate: 400,
    },
    legendary: {
      type: 'elite',
      difficulty: 'legendary',
      aggressiveness: 0.9,
      defensiveness: 0.8,
      attackSpacing: 500,
      retreatThreshold: 40,
      telegraphDelay: 200,
      decisionUpdateRate: 300,
    },
  },

  boss: {
    easy: {
      type: 'boss',
      difficulty: 'easy',
      aggressiveness: 0.7,
      defensiveness: 0.55,
      attackSpacing: 1500,
      retreatThreshold: 40,
      telegraphDelay: 700,
      decisionUpdateRate: 1000,
    },
    normal: {
      type: 'boss',
      difficulty: 'normal',
      aggressiveness: 0.8,
      defensiveness: 0.65,
      attackSpacing: 1200,
      retreatThreshold: 45,
      telegraphDelay: 500,
      decisionUpdateRate: 800,
    },
    hard: {
      type: 'boss',
      difficulty: 'hard',
      aggressiveness: 0.85,
      defensiveness: 0.75,
      attackSpacing: 900,
      retreatThreshold: 50,
      telegraphDelay: 400,
      decisionUpdateRate: 600,
    },
    legendary: {
      type: 'boss',
      difficulty: 'legendary',
      aggressiveness: 0.92,
      defensiveness: 0.85,
      attackSpacing: 600,
      retreatThreshold: 55,
      telegraphDelay: 300,
      decisionUpdateRate: 400,
    },
  },
};

// Boss-specific behavior patterns
export const BOSS_AI_PROFILES: Record<string, BossAIProfile> = {
  'void-stalker': {
    minionType: 'grunt',
    minionCount: 2,
    phases: [
      {
        id: 'phase_1',
        name: 'First Encounter',
        healthThreshold: 100,
        moveSet: ['dash', 'slash', 'dodge'],
        attacks: [
          { moveIndex: 1, weight: 1, delay: 500 },
          { moveIndex: 2, weight: 0.5, delay: 300 },
        ],
      },
      {
        id: 'phase_2',
        name: 'Enraged',
        healthThreshold: 50,
        moveSet: ['dash', 'slash', 'special_attack', 'dodge'],
        attacks: [
          { moveIndex: 1, weight: 1.5, delay: 400 },
          { moveIndex: 2, weight: 1, delay: 600 },
          { moveIndex: 3, weight: 0.5, delay: 800 },
        ],
        specialBehavior: 'aggro',
      },
    ],
    enrageMultiplier: 1.5,
  },

  'rift-general': {
    minionType: 'void-scout',
    minionCount: 3,
    phases: [
      {
        id: 'phase_1',
        name: 'Summoning',
        healthThreshold: 100,
        moveSet: ['summon', 'shield', 'attack'],
        attacks: [
          { moveIndex: 0, weight: 1, delay: 1000 },
          { moveIndex: 1, weight: 1.5, delay: 500 },
        ],
        specialBehavior: 'summon',
      },
      {
        id: 'phase_2',
        name: 'Assault',
        healthThreshold: 70,
        moveSet: ['mega_attack', 'summon', 'special_1', 'special_2'],
        attacks: [
          { moveIndex: 1, weight: 1.5, delay: 600 },
          { moveIndex: 2, weight: 1, delay: 700 },
          { moveIndex: 3, weight: 1, delay: 800 },
        ],
        specialBehavior: 'mega_attack',
      },
      {
        id: 'phase_3',
        name: 'Last Stand',
        healthThreshold: 30,
        moveSet: ['ultima', 'mega_attack', 'dodge'],
        attacks: [
          { moveIndex: 0, weight: 1.5, delay: 1500 },
          { moveIndex: 1, weight: 2, delay: 700 },
          { moveIndex: 2, weight: 0.5, delay: 400 },
        ],
        specialBehavior: 'mega_attack',
      },
    ],
    enrageMultiplier: 2.0,
  },
};

/**
 * AI Decision Engine
 * Determines the next action for an enemy based on state, hp, and behavior profile
 */
export function makeAIDecision(
  profile: EnemyBehaviorProfile,
  currentHP: number,
  maxHP: number,
  playerDistance: number,
  currentState: AIState,
  isAggressive: boolean = true
): AIDecision {
  const healthPercent = (currentHP / maxHP) * 100;
  const shouldRetreat = healthPercent < profile.retreatThreshold;

  // Priority scoring for different actions
  let actions: Record<string, number> = {
    attack: profile.aggressiveness * (isAggressive ? 1.5 : 1),
    dodge: profile.defensiveness * 0.8,
    block: profile.defensiveness * 0.6,
    retreat: shouldRetreat ? 0.9 : 0.1,
    heal: 0,
    special: Math.random() * 0.3,
    wait: (1 - profile.aggressiveness) * 0.5,
  };

  // Adjust for distance
  if (playerDistance > 5) {
    actions.attack *= 0.5;
    actions.dodge *= 1.2;
  }

  // Healer-specific logic
  if (profile.type === 'healer' && healthPercent < 50) {
    actions.heal = 0.9;
  }

  // Normalize and select highest priority action
  const totalScore = Object.values(actions).reduce((a, b) => a + b, 0);
  const normalizedActions = Object.entries(actions).map(([action, score]) => ({
    action: action as AIDecision['action'],
    priority: (score / totalScore) * 100,
  }));

  const selectedAction = normalizedActions.reduce((max, curr) =>
    curr.priority > max.priority ? curr : max
  );

  return {
    action: selectedAction.action,
    moveIndex: Math.floor(Math.random() * 3), // Random move from available set
    priority: selectedAction.priority,
    confidence: Math.min(1, selectedAction.priority / 100),
  };
}

/**
 * Get the current phase for a boss based on HP
 */
export function getBossPhase(profile: BossAIProfile, healthPercent: number): BossPhase | null {
  return (
    profile.phases.find((phase) => healthPercent <= phase.healthThreshold) ||
    profile.phases[0] ||
    null
  );
}

/**
 * Calculate AI damage scaling based on difficulty
 */
export function getAIDamageMultiplier(difficulty: AIBehaviorDifficulty): number {
  const multipliers: Record<AIBehaviorDifficulty, number> = {
    easy: 0.75,
    normal: 1.0,
    hard: 1.3,
    legendary: 1.6,
  };
  return multipliers[difficulty];
}

/**
 * AI group coordination - affects behavior when multiple enemies present
 */
export function shouldCoordinate(
  profile: EnemyBehaviorProfile,
  nearbyAllies: number,
  playerHP: number,
  playerMaxHP: number
): boolean {
  const playerHealthPercent = (playerHP / playerMaxHP) * 100;
  const coordinationChance =
    profile.aggressiveness * 0.4 + (nearbyAllies / 5) * 0.4 + (playerHealthPercent < 40 ? 0.4 : 0);

  return Math.random() < coordinationChance;
}
