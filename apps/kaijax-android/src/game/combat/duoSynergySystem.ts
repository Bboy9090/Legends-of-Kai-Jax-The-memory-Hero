/**
 * Duo Synergy Meter, Two-Button Chord Detector & Extensible Cinematic Duo Finisher Director.
 */

export const DUO_SYNERGY_MAX = 100;
export const DUO_FINISHER_COST = 50;
export const DUO_CHORD_WINDOW_SECONDS = 0.18;

export type DuoSynergyEvent =
  | 'partner_assist'
  | 'parry_partner_followup'
  | 'web_into_storm'
  | 'storm_launch_into_web'
  | 'switch_combo'
  | 'partner_intervention'
  | 'multi_enemy_takedown';

export const DUO_SYNERGY_GAINS: Record<DuoSynergyEvent, number> = {
  partner_assist: 12,
  parry_partner_followup: 22,
  web_into_storm: 24,
  storm_launch_into_web: 24,
  switch_combo: 18,
  partner_intervention: 20,
  multi_enemy_takedown: 26,
};

export type DuoFinisherId =
  | 'thunderweb-execution'
  | 'predator-crossfire'
  | 'storm-snare'
  | 'twin-fang-reversal'
  | 'apex-skyfall'
  | 'memory-storm-convergence';

export interface DuoFinisherDef {
  id: DuoFinisherId;
  name: string;
  duration: number;
  impactTimes: readonly number[];
  impactMultipliers: readonly number[];
  aoeRadius: number;
  requiresCounterState?: boolean;
  requiresAirborneOrLaunch?: boolean;
  requiresMultiTarget?: boolean;
  requiresFusionUnlocked?: boolean;
  summary: string;
}

export const DUO_FINISHERS: Record<DuoFinisherId, DuoFinisherDef> = {
  'thunderweb-execution': {
    id: 'thunderweb-execution',
    name: 'Thunderweb Execution',
    duration: 0.96,
    impactTimes: [0.36, 0.80],
    impactMultipliers: [1.45, 2.15],
    aoeRadius: 3.8,
    summary:
      'Kai webs and launches the target skyward; Jax performs an electric aerial dash strike before Kai slams the enemy into the pavement.',
  },
  'predator-crossfire': {
    id: 'predator-crossfire',
    name: 'Predator Crossfire',
    duration: 0.92,
    impactTimes: [0.30, 0.56, 0.82],
    impactMultipliers: [1.1, 1.15, 1.85],
    aoeRadius: 4.2,
    summary:
      'Kai and Jax flank from opposite vectors, exchanging synchronized saber-claw strikes before a coordinated knockback burst.',
  },
  'storm-snare': {
    id: 'storm-snare',
    name: 'Storm Snare',
    duration: 0.90,
    impactTimes: [0.32, 0.74],
    impactMultipliers: [0.95, 1.95],
    aoeRadius: 6.6,
    requiresMultiTarget: true,
    summary:
      'Kai binds nearby enemies in a Pyraxis web network while Jax arcs high-voltage storm lightning across every snared target.',
  },
  'twin-fang-reversal': {
    id: 'twin-fang-reversal',
    name: 'Twin Fang Reversal',
    duration: 0.88,
    impactTimes: [0.34, 0.76],
    impactMultipliers: [1.65, 2.1],
    aoeRadius: 3.6,
    requiresCounterState: true,
    summary:
      'Following a parry opening, Jax shatters the enemy guard with a heavy storm counter and Kai finishes with a spinning aerial slash.',
  },
  'apex-skyfall': {
    id: 'apex-skyfall',
    name: 'Apex Skyfall',
    duration: 1.0,
    impactTimes: [0.35, 0.84],
    impactMultipliers: [1.35, 2.35],
    aoeRadius: 5.0,
    requiresAirborneOrLaunch: true,
    summary:
      'Jax uppercuts the target skyward while Kai elevates on dorsal web lines; both brothers descend in a synchronized crater slam.',
  },
  'memory-storm-convergence': {
    id: 'memory-storm-convergence',
    name: 'Memory Storm Convergence',
    duration: 1.08,
    impactTimes: [0.34, 0.66, 0.94],
    impactMultipliers: [1.4, 1.5, 2.6],
    aoeRadius: 7.2,
    requiresFusionUnlocked: true,
    summary:
      'Advanced convergence finisher weaving Myrr’Kai memory threads, Pyraxis ember, and Kar-Voth thunder while preserving the three-tail canon.',
  },
};

export interface DuoSynergyState {
  meter: number;
  maxMeter: number;
  finisherCost: number;
  finishersExecuted: number;
  lastAttackInputTime: number;
  lastAbilityInputTime: number;
}

export interface ActiveFinisherExecution {
  finisher: DuoFinisherDef;
  targetEnemyId: string;
  elapsed: number;
  appliedImpacts: boolean[];
  completed: boolean;
  interrupted: boolean;
}

export interface FinisherValidationContext {
  synergyState: DuoSynergyState;
  hasValidTarget: boolean;
  targetEnemyId: string | null;
  nearbyEnemyCount: number;
  bothBrothersAvailable: boolean;
  isFused: boolean;
  fusionUnlocked: boolean;
  counterWindowOpen: boolean;
  playerAirborne: boolean;
  playerStunnedOrDown: boolean;
  alreadyInFinisher: boolean;
}

export function createInitialDuoSynergyState(initialMeter = 0): DuoSynergyState {
  return {
    meter: Math.max(0, Math.min(DUO_SYNERGY_MAX, initialMeter)),
    maxMeter: DUO_SYNERGY_MAX,
    finisherCost: DUO_FINISHER_COST,
    finishersExecuted: 0,
    lastAttackInputTime: -10,
    lastAbilityInputTime: -10,
  };
}

export function addDuoSynergy(
  state: DuoSynergyState,
  event: DuoSynergyEvent,
  multiplier = 1.0
): DuoSynergyState {
  const gain = Math.round(DUO_SYNERGY_GAINS[event] * Math.max(0.25, multiplier));
  return {
    ...state,
    meter: Math.min(state.maxMeter, state.meter + gain),
  };
}

export function registerChordInput(
  state: DuoSynergyState,
  kind: 'attack' | 'ability',
  nowSeconds: number
): { nextState: DuoSynergyState; chordTriggered: boolean } {
  const nextState: DuoSynergyState = {
    ...state,
    lastAttackInputTime: kind === 'attack' ? nowSeconds : state.lastAttackInputTime,
    lastAbilityInputTime: kind === 'ability' ? nowSeconds : state.lastAbilityInputTime,
  };
  const delta = Math.abs(nextState.lastAttackInputTime - nextState.lastAbilityInputTime);
  const chordTriggered =
    nextState.lastAttackInputTime >= 0 &&
    nextState.lastAbilityInputTime >= 0 &&
    delta <= DUO_CHORD_WINDOW_SECONDS &&
    state.meter >= state.finisherCost;

  if (chordTriggered) {
    nextState.lastAttackInputTime = -10;
    nextState.lastAbilityInputTime = -10;
  }

  return { nextState, chordTriggered };
}

export function selectContextualFinisher(ctx: FinisherValidationContext): DuoFinisherDef {
  if (ctx.isFused && ctx.fusionUnlocked) {
    return DUO_FINISHERS['memory-storm-convergence'];
  }
  if (ctx.counterWindowOpen) {
    return DUO_FINISHERS['twin-fang-reversal'];
  }
  if (ctx.playerAirborne) {
    return DUO_FINISHERS['apex-skyfall'];
  }
  if (ctx.nearbyEnemyCount >= 3) {
    return DUO_FINISHERS['storm-snare'];
  }
  return ctx.synergyState.finishersExecuted % 2 === 0
    ? DUO_FINISHERS['thunderweb-execution']
    : DUO_FINISHERS['predator-crossfire'];
}

export function tryStartDuoFinisher(
  ctx: FinisherValidationContext,
  preferredId?: DuoFinisherId
): {
  accepted: boolean;
  reason?: string;
  nextSynergy: DuoSynergyState;
  execution: ActiveFinisherExecution | null;
} {
  if (ctx.alreadyInFinisher) {
    return { accepted: false, reason: 'already_active', nextSynergy: ctx.synergyState, execution: null };
  }
  if (ctx.playerStunnedOrDown) {
    return { accepted: false, reason: 'invalid_player_state', nextSynergy: ctx.synergyState, execution: null };
  }
  if (!ctx.bothBrothersAvailable && !ctx.isFused) {
    return { accepted: false, reason: 'partner_unavailable', nextSynergy: ctx.synergyState, execution: null };
  }
  if (!ctx.hasValidTarget || !ctx.targetEnemyId) {
    return { accepted: false, reason: 'no_valid_target', nextSynergy: ctx.synergyState, execution: null };
  }
  if (ctx.synergyState.meter < ctx.synergyState.finisherCost) {
    return { accepted: false, reason: 'insufficient_synergy', nextSynergy: ctx.synergyState, execution: null };
  }

  let def = preferredId ? DUO_FINISHERS[preferredId] : selectContextualFinisher(ctx);
  if (def.requiresFusionUnlocked && !ctx.fusionUnlocked) {
    def = DUO_FINISHERS['thunderweb-execution'];
  }

  const nextSynergy: DuoSynergyState = {
    ...ctx.synergyState,
    meter: Math.max(0, ctx.synergyState.meter - ctx.synergyState.finisherCost),
    finishersExecuted: ctx.synergyState.finishersExecuted + 1,
  };

  return {
    accepted: true,
    nextSynergy,
    execution: {
      finisher: def,
      targetEnemyId: ctx.targetEnemyId,
      elapsed: 0,
      appliedImpacts: def.impactTimes.map(() => false),
      completed: false,
      interrupted: false,
    },
  };
}

export function stepDuoFinisher(
  exec: ActiveFinisherExecution,
  dt: number
): {
  nextExecution: ActiveFinisherExecution;
  triggeredImpactMultipliers: number[];
} {
  if (exec.completed || exec.interrupted) {
    return { nextExecution: exec, triggeredImpactMultipliers: [] };
  }

  const nextElapsed = exec.elapsed + Math.max(0, dt);
  const nextApplied = [...exec.appliedImpacts];
  const triggered: number[] = [];

  exec.finisher.impactTimes.forEach((impactT, idx) => {
    if (!nextApplied[idx] && nextElapsed >= impactT) {
      nextApplied[idx] = true;
      triggered.push(exec.finisher.impactMultipliers[idx]);
    }
  });

  const completed = nextElapsed >= exec.finisher.duration;
  return {
    nextExecution: {
      ...exec,
      elapsed: nextElapsed,
      appliedImpacts: nextApplied,
      completed,
    },
    triggeredImpactMultipliers: triggered,
  };
}

export function interruptDuoFinisher(exec: ActiveFinisherExecution): ActiveFinisherExecution {
  return {
    ...exec,
    interrupted: true,
    completed: true,
  };
}
