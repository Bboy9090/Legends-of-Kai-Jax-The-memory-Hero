/**
 * Enemy AI behavior profiles and pure decision helpers.
 *
 * Profile data stays declarative; decision helpers accept an injectable random
 * source so simulations, tests, replays, and future rollback can be deterministic.
 */

export type AIState = 'idle' | 'patrol' | 'chase' | 'attack' | 'retreat' | 'stun' | 'dead';
export type EnemyType = 'grunt' | 'tank' | 'attacker' | 'healer' | 'elite' | 'boss';
export type AIBehaviorDifficulty = 'easy' | 'normal' | 'hard' | 'legendary';
export type AIRandomSource = () => number;

export interface AIDecision {
  action: 'attack' | 'dodge' | 'block' | 'heal' | 'special' | 'retreat' | 'wait';
  moveIndex: number;
  priority: number;
  confidence: number;
}

export interface EnemyBehaviorProfile {
  type: EnemyType;
  difficulty: AIBehaviorDifficulty;
  aggressiveness: number;
  defensiveness: number;
  attackSpacing: number;
  retreatThreshold: number;
  telegraphDelay: number;
  decisionUpdateRate: number;
}

export interface BossPhase {
  id: string;
  name: string;
  healthThreshold: number;
  moveSet: string[];
  attacks: {
    moveIndex: number;
    weight: number;
    delay: number;
  }[];
  specialBehavior?: 'aggro' | 'defensive' | 'summon' | 'heal' | 'mega_attack';
}

export interface BossAIProfile {
  minionType?: EnemyType;
  minionCount?: number;
  phases: BossPhase[];
  phaseTransitionEffect?: string;
  enrageMultiplier: number;
}

export const BEHAVIOR_PROFILES: Record<EnemyType, Record<AIBehaviorDifficulty, EnemyBehaviorProfile>> = {
  grunt: {
    easy: {
      type: 'grunt', difficulty: 'easy', aggressiveness: 0.4, defensiveness: 0.2,
      attackSpacing: 2000, retreatThreshold: 20, telegraphDelay: 600, decisionUpdateRate: 800,
    },
    normal: {
      type: 'grunt', difficulty: 'normal', aggressiveness: 0.6, defensiveness: 0.35,
      attackSpacing: 1500, retreatThreshold: 25, telegraphDelay: 400, decisionUpdateRate: 600,
    },
    hard: {
      type: 'grunt', difficulty: 'hard', aggressiveness: 0.75, defensiveness: 0.5,
      attackSpacing: 1200, retreatThreshold: 30, telegraphDelay: 300, decisionUpdateRate: 400,
    },
    legendary: {
      type: 'grunt', difficulty: 'legendary', aggressiveness: 0.9, defensiveness: 0.65,
      attackSpacing: 800, retreatThreshold: 35, telegraphDelay: 200, decisionUpdateRate: 300,
    },
  },
  tank: {
    easy: {
      type: 'tank', difficulty: 'easy', aggressiveness: 0.3, defensiveness: 0.7,
      attackSpacing: 2500, retreatThreshold: 30, telegraphDelay: 700, decisionUpdateRate: 1000,
    },
    normal: {
      type: 'tank', difficulty: 'normal', aggressiveness: 0.45, defensiveness: 0.8,
      attackSpacing: 2000, retreatThreshold: 35, telegraphDelay: 500, decisionUpdateRate: 800,
    },
    hard: {
      type: 'tank', difficulty: 'hard', aggressiveness: 0.6, defensiveness: 0.85,
      attackSpacing: 1600, retreatThreshold: 40, telegraphDelay: 350, decisionUpdateRate: 600,
    },
    legendary: {
      type: 'tank', difficulty: 'legendary', aggressiveness: 0.75, defensiveness: 0.9,
      attackSpacing: 1200, retreatThreshold: 45, telegraphDelay: 250, decisionUpdateRate: 400,
    },
  },
  attacker: {
    easy: {
      type: 'attacker', difficulty: 'easy', aggressiveness: 0.7, defensiveness: 0.15,
      attackSpacing: 1000, retreatThreshold: 15, telegraphDelay: 400, decisionUpdateRate: 500,
    },
    normal: {
      type: 'attacker', difficulty: 'normal', aggressiveness: 0.8, defensiveness: 0.25,
      attackSpacing: 800, retreatThreshold: 20, telegraphDelay: 300, decisionUpdateRate: 400,
    },
    hard: {
      type: 'attacker', difficulty: 'hard', aggressiveness: 0.88, defensiveness: 0.35,
      attackSpacing: 600, retreatThreshold: 25, telegraphDelay: 200, decisionUpdateRate: 300,
    },
    legendary: {
      type: 'attacker', difficulty: 'legendary', aggressiveness: 0.95, defensiveness: 0.45,
      attackSpacing: 400, retreatThreshold: 30, telegraphDelay: 150, decisionUpdateRate: 200,
    },
  },
  healer: {
    easy: {
      type: 'healer', difficulty: 'easy', aggressiveness: 0.25, defensiveness: 0.6,
      attackSpacing: 3000, retreatThreshold: 50, telegraphDelay: 800, decisionUpdateRate: 1200,
    },
    normal: {
      type: 'healer', difficulty: 'normal', aggressiveness: 0.35, defensiveness: 0.65,
      attackSpacing: 2500, retreatThreshold: 55, telegraphDelay: 600, decisionUpdateRate: 1000,
    },
    hard: {
      type: 'healer', difficulty: 'hard', aggressiveness: 0.45, defensiveness: 0.7,
      attackSpacing: 2000, retreatThreshold: 60, telegraphDelay: 400, decisionUpdateRate: 800,
    },
    legendary: {
      type: 'healer', difficulty: 'legendary', aggressiveness: 0.55, defensiveness: 0.75,
      attackSpacing: 1500, retreatThreshold: 65, telegraphDelay: 300, decisionUpdateRate: 600,
    },
  },
  elite: {
    easy: {
      type: 'elite', difficulty: 'easy', aggressiveness: 0.65, defensiveness: 0.5,
      attackSpacing: 1200, retreatThreshold: 25, telegraphDelay: 500, decisionUpdateRate: 600,
    },
    normal: {
      type: 'elite', difficulty: 'normal', aggressiveness: 0.75, defensiveness: 0.6,
      attackSpacing: 900, retreatThreshold: 30, telegraphDelay: 400, decisionUpdateRate: 500,
    },
    hard: {
      type: 'elite', difficulty: 'hard', aggressiveness: 0.82, defensiveness: 0.7,
      attackSpacing: 700, retreatThreshold: 35, telegraphDelay: 300, decisionUpdateRate: 400,
    },
    legendary: {
      type: 'elite', difficulty: 'legendary', aggressiveness: 0.9, defensiveness: 0.8,
      attackSpacing: 500, retreatThreshold: 40, telegraphDelay: 200, decisionUpdateRate: 300,
    },
  },
  boss: {
    easy: {
      type: 'boss', difficulty: 'easy', aggressiveness: 0.7, defensiveness: 0.55,
      attackSpacing: 1500, retreatThreshold: 40, telegraphDelay: 700, decisionUpdateRate: 1000,
    },
    normal: {
      type: 'boss', difficulty: 'normal', aggressiveness: 0.8, defensiveness: 0.65,
      attackSpacing: 1200, retreatThreshold: 45, telegraphDelay: 500, decisionUpdateRate: 800,
    },
    hard: {
      type: 'boss', difficulty: 'hard', aggressiveness: 0.85, defensiveness: 0.75,
      attackSpacing: 900, retreatThreshold: 50, telegraphDelay: 400, decisionUpdateRate: 600,
    },
    legendary: {
      type: 'boss', difficulty: 'legendary', aggressiveness: 0.92, defensiveness: 0.85,
      attackSpacing: 600, retreatThreshold: 55, telegraphDelay: 300, decisionUpdateRate: 400,
    },
  },
};

export const BOSS_AI_PROFILES: Record<string, BossAIProfile> = {
  'void-stalker': {
    minionType: 'grunt',
    minionCount: 2,
    phases: [
      {
        id: 'phase_1', name: 'First Encounter', healthThreshold: 100,
        moveSet: ['dash', 'slash', 'dodge'],
        attacks: [
          { moveIndex: 1, weight: 1, delay: 500 },
          { moveIndex: 2, weight: 0.5, delay: 300 },
        ],
      },
      {
        id: 'phase_2', name: 'Enraged', healthThreshold: 50,
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
    minionType: 'void-scout' as EnemyType,
    minionCount: 3,
    phases: [
      {
        id: 'phase_1', name: 'Summoning', healthThreshold: 100,
        moveSet: ['summon', 'shield', 'attack'],
        attacks: [
          { moveIndex: 0, weight: 1, delay: 1000 },
          { moveIndex: 1, weight: 1.5, delay: 500 },
        ],
        specialBehavior: 'summon',
      },
      {
        id: 'phase_2', name: 'Assault', healthThreshold: 70,
        moveSet: ['mega_attack', 'summon', 'special_1', 'special_2'],
        attacks: [
          { moveIndex: 1, weight: 1.5, delay: 600 },
          { moveIndex: 2, weight: 1, delay: 700 },
          { moveIndex: 3, weight: 1, delay: 800 },
        ],
        specialBehavior: 'mega_attack',
      },
      {
        id: 'phase_3', name: 'Last Stand', healthThreshold: 30,
        moveSet: ['ultima', 'mega_attack', 'dodge'],
        attacks: [
          { moveIndex: 0, weight: 1.5, delay: 1500 },
          { moveIndex: 1, weight: 2, delay: 700 },
          { moveIndex: 2, weight: 0.5, delay: 400 },
        ],
        specialBehavior: 'mega_attack',
      },
    ],
    enrageMultiplier: 2,
  },
};

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function normalizedRandom(random: AIRandomSource): number {
  return clamp(random(), 0, 0.999999999, 0.5);
}

export function makeAIDecision(
  profile: EnemyBehaviorProfile,
  currentHP: number,
  maxHP: number,
  playerDistance: number,
  currentState: AIState,
  isAggressive = true,
  random: AIRandomSource = Math.random
): AIDecision {
  if (currentState === 'dead' || currentState === 'stun') {
    return { action: 'wait', moveIndex: 0, priority: 100, confidence: 1 };
  }

  const safeMaxHP = Math.max(1, Number.isFinite(maxHP) ? maxHP : 1);
  const healthPercent = clamp((Math.max(0, currentHP) / safeMaxHP) * 100, 0, 100, 100);
  const distance = Math.max(0, Number.isFinite(playerDistance) ? playerDistance : 0);
  const shouldRetreat = healthPercent < profile.retreatThreshold;
  const specialRoll = normalizedRandom(random);

  const actions: Record<AIDecision['action'], number> = {
    attack: Math.max(0, profile.aggressiveness) * (isAggressive ? 1.5 : 1),
    dodge: Math.max(0, profile.defensiveness) * 0.8,
    block: Math.max(0, profile.defensiveness) * 0.6,
    retreat: shouldRetreat ? 0.9 : 0.1,
    heal: 0,
    special: specialRoll * 0.3,
    wait: Math.max(0, 1 - profile.aggressiveness) * 0.5,
  };

  if (distance > 5) {
    actions.attack *= 0.5;
    actions.dodge *= 1.2;
  }
  if (profile.type === 'healer' && healthPercent < 50) actions.heal = 0.9;
  if (currentState === 'retreat') actions.retreat *= 1.25;
  if (currentState === 'attack') actions.block *= 0.75;

  const totalScore = Math.max(Number.EPSILON, Object.values(actions).reduce((a, b) => a + b, 0));
  const normalizedActions = Object.entries(actions).map(([action, score]) => ({
    action: action as AIDecision['action'],
    priority: (score / totalScore) * 100,
  }));
  const selectedAction = normalizedActions.reduce((best, current) =>
    current.priority > best.priority ? current : best
  );

  return {
    action: selectedAction.action,
    moveIndex: Math.floor(normalizedRandom(random) * 3),
    priority: selectedAction.priority,
    confidence: clamp(selectedAction.priority / 100, 0, 1, 0),
  };
}

/**
 * Return the deepest phase whose threshold has been crossed.
 * Thresholds are authored high-to-low (100 -> 70 -> 30), so simple `find()` is wrong.
 */
export function getBossPhase(profile: BossAIProfile, healthPercent: number): BossPhase | null {
  if (!profile.phases.length) return null;
  const hp = clamp(healthPercent, 0, 100, 100);
  const crossed = profile.phases
    .filter((phase) => hp <= phase.healthThreshold)
    .sort((a, b) => a.healthThreshold - b.healthThreshold);
  return crossed[0] ?? profile.phases[0] ?? null;
}

export function getAIDamageMultiplier(difficulty: AIBehaviorDifficulty): number {
  const multipliers: Readonly<Record<AIBehaviorDifficulty, number>> = Object.freeze({
    easy: 0.75,
    normal: 1,
    hard: 1.3,
    legendary: 1.6,
  });
  return multipliers[difficulty];
}

export function shouldCoordinate(
  profile: EnemyBehaviorProfile,
  nearbyAllies: number,
  playerHP: number,
  playerMaxHP: number,
  random: AIRandomSource = Math.random
): boolean {
  const safeMaxHP = Math.max(1, Number.isFinite(playerMaxHP) ? playerMaxHP : 1);
  const playerHealthPercent = clamp((Math.max(0, playerHP) / safeMaxHP) * 100, 0, 100, 100);
  const allies = Math.max(0, Number.isFinite(nearbyAllies) ? nearbyAllies : 0);
  const coordinationChance = clamp(
    profile.aggressiveness * 0.4 + (allies / 5) * 0.4 + (playerHealthPercent < 40 ? 0.4 : 0),
    0,
    1,
    0
  );
  return normalizedRandom(random) < coordinationChance;
}
