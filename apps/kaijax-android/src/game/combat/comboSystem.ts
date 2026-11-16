export const COMBO_DECAY_SECONDS = 3.5;

export interface ComboTierThresholds {
  flowTransition: number;
  finisherEligible: number;
  synergyBoost: number;
  apexMomentum: number;
}

export const DEFAULT_COMBO_THRESHOLDS: ComboTierThresholds = {
  flowTransition: 5,
  finisherEligible: 10,
  synergyBoost: 20,
  apexMomentum: 30,
};

export interface ComboState {
  count: number;
  timer: number;
  maxTimer: number;
  brokenSeq: number;
  lastBrokenCount: number;
  styleScore?: number;
  lastMoveTag?: string;
  varietyStreak?: number;
  repeatMoveCount?: number;
}

export interface ComboCombatBenefits {
  lungeMultiplier: number;
  finisherEligible: boolean;
  duoSynergyMultiplier: number;
  damageMultiplier: number;
  bonusCritChance: number;
  apexMomentumActive: boolean;
}

export function createInitialComboState(maxTimer = COMBO_DECAY_SECONDS): ComboState {
  return {
    count: 0,
    timer: 0,
    maxTimer,
    brokenSeq: 0,
    lastBrokenCount: 0,
    styleScore: 0,
    lastMoveTag: '',
    varietyStreak: 0,
    repeatMoveCount: 0,
  };
}

export function registerComboHit(state: ComboState, hits = 1, moveTag?: string): ComboState {
  const addHits = Math.max(1, hits);
  const nextCount = state.count + addHits;

  const prevTag = state.lastMoveTag ?? '';
  const isVaried = Boolean(moveTag && moveTag !== prevTag);
  const repeatCount = moveTag && moveTag === prevTag ? (state.repeatMoveCount ?? 0) + 1 : 1;
  const nextVariety = isVaried ? (state.varietyStreak ?? 0) + 1 : 0;

  // Reward technical variation rather than repetitive button mashing
  const basePoints = 25 * addHits;
  const varietyMult = isVaried ? 1.35 + Math.min(0.65, nextVariety * 0.1) : Math.max(0.45, 1.0 - (repeatCount - 1) * 0.18);
  const tierMult = nextCount >= 30 ? 2.0 : nextCount >= 20 ? 1.6 : nextCount >= 10 ? 1.3 : 1.0;
  const addedScore = Math.round(basePoints * varietyMult * tierMult);

  return {
    ...state,
    count: nextCount,
    timer: state.maxTimer,
    styleScore: (state.styleScore ?? 0) + addedScore,
    lastMoveTag: moveTag ?? prevTag,
    varietyStreak: nextVariety,
    repeatMoveCount: repeatCount,
  };
}

/**
 * Penalizes missing a heavily committed strike without punishing intentional defensive
 * movement or repositioning.
 */
export function registerCommittedWhiff(state: ComboState, timerPenalty = 1.6): ComboState {
  if (state.count <= 0 || state.timer <= 0) return state;
  const nextTimer = Math.max(0, state.timer - Math.max(0, timerPenalty));
  if (nextTimer === 0) {
    return {
      ...state,
      lastBrokenCount: state.count,
      count: 0,
      timer: 0,
      brokenSeq: state.brokenSeq + 1,
      varietyStreak: 0,
    };
  }
  return {
    ...state,
    timer: nextTimer,
    varietyStreak: 0,
  };
}

export function tickComboDecay(state: ComboState, dt: number): ComboState {
  if (state.count <= 0 || state.timer <= 0) {
    if (state.count === 0 && state.timer === 0) return state;
    return {
      ...state,
      count: 0,
      timer: 0,
      varietyStreak: 0,
      repeatMoveCount: 0,
    };
  }

  const nextTimer = Math.max(0, state.timer - Math.max(0, dt));
  if (nextTimer === 0) {
    return {
      ...state,
      count: 0,
      timer: 0,
      varietyStreak: 0,
      repeatMoveCount: 0,
    };
  }

  return {
    ...state,
    timer: nextTimer,
  };
}

export function resetComboOnDamage(state: ComboState): ComboState {
  if (state.count <= 0 && state.timer <= 0) {
    return state;
  }
  return {
    ...state,
    lastBrokenCount: state.count,
    count: 0,
    timer: 0,
    brokenSeq: state.brokenSeq + 1,
    varietyStreak: 0,
    repeatMoveCount: 0,
  };
}

export function getComboCombatBenefits(
  count: number,
  thresholds: ComboTierThresholds = DEFAULT_COMBO_THRESHOLDS
): ComboCombatBenefits {
  const apex = count >= thresholds.apexMomentum;
  const syn = count >= thresholds.synergyBoost;
  const fin = count >= thresholds.finisherEligible;
  const flow = count >= thresholds.flowTransition;

  return {
    lungeMultiplier: apex ? 1.32 : flow ? 1.18 : 1.0,
    finisherEligible: fin,
    duoSynergyMultiplier: apex ? 1.5 : syn ? 1.35 : 1.0,
    damageMultiplier: apex ? 1.24 : syn ? 1.14 : fin ? 1.08 : 1.0,
    bonusCritChance: apex ? 0.16 : syn ? 0.08 : 0,
    apexMomentumActive: apex,
  };
}

export function getComboTierLabel(
  count: number,
  thresholds: ComboTierThresholds = DEFAULT_COMBO_THRESHOLDS
): {
  title: string;
  accentHex: string;
  baseScale: number;
} {
  if (count >= thresholds.apexMomentum || count >= 25) {
    return { title: 'Apex Momentum', accentHex: '#D4AF37', baseScale: 1.14 };
  }
  if (count >= thresholds.synergyBoost || count >= 15) {
    return { title: 'Pyraxis Frenzy', accentHex: '#F97316', baseScale: 1.09 };
  }
  if (count >= thresholds.finisherEligible || count >= 8) {
    return { title: 'Storm Surge', accentHex: '#38BDF8', baseScale: 1.05 };
  }
  if (count >= thresholds.flowTransition || count >= 4) {
    return { title: 'Memory Rhythm', accentHex: '#A855F7', baseScale: 1.02 };
  }
  return { title: 'Strike Chain', accentHex: '#E2E8F0', baseScale: 1.0 };
}
