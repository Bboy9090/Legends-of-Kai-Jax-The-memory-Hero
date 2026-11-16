/**
 * Agile Block, Dodge I-Frames, Perfect-Timing Parry, Counter Eligibility & Guard Break System.
 */

import { ParryTiming } from '../types';

export const PARRY = {
  window: 0.10,
  generousWindow: 0.16,
  dodgeIFrames: 0.28,
  enemyStagger: 1.8,
  counterWindow: 1.35,
  blockDamageFactor: 0.35,
  fusionCharge: 22,
  evadeFusionCharge: 8,
} as const;

export type StrikeOutcome = 'parry' | 'evade' | 'grace' | 'block' | 'guard_broken' | 'hit';

export interface DefenseState {
  parryTimer: number;
  dodgeTimer: number;
  invulnTimer: number;
  blockHeld?: boolean;
  unblockable?: boolean;
}

export interface CounterWindowState {
  active: boolean;
  timer: number;
  targetEnemyId: string | null;
}

export function createCounterWindowState(): CounterWindowState {
  return {
    active: false,
    timer: 0,
    targetEnemyId: null,
  };
}

export function openCounterWindow(targetEnemyId: string | null, duration = PARRY.counterWindow): CounterWindowState {
  return {
    active: true,
    timer: Math.max(0.1, duration),
    targetEnemyId,
  };
}

export function tickCounterWindow(state: CounterWindowState, dt: number): CounterWindowState {
  if (!state.active || state.timer <= 0) {
    if (!state.active && state.timer === 0) return state;
    return { active: false, timer: 0, targetEnemyId: null };
  }
  const next = Math.max(0, state.timer - Math.max(0, dt));
  if (next === 0) {
    return { active: false, timer: 0, targetEnemyId: null };
  }
  return { ...state, timer: next };
}

export function consumeCounterWindow(state: CounterWindowState): {
  consumed: boolean;
  targetEnemyId: string | null;
  nextState: CounterWindowState;
} {
  if (!state.active || state.timer <= 0) {
    return { consumed: false, targetEnemyId: null, nextState: state };
  }
  return {
    consumed: true,
    targetEnemyId: state.targetEnemyId,
    nextState: { active: false, timer: 0, targetEnemyId: null },
  };
}

export function parryWindowFor(timing: ParryTiming): number {
  return timing === 'generous' ? PARRY.generousWindow : PARRY.window;
}

export function resolveIncomingStrike(d: DefenseState): StrikeOutcome {
  // Unblockable heavy strikes cannot be passively blocked; must be evaded (or dodged in i-frames)
  if (d.unblockable) {
    if (d.dodgeTimer > 0 && d.invulnTimer > 0) return 'evade';
    if (d.invulnTimer > 0) return 'grace';
    if (d.blockHeld) return 'guard_broken';
    return 'hit';
  }

  if (d.parryTimer > 0) return 'parry';
  if (d.dodgeTimer > 0 && d.invulnTimer > 0) return 'evade';
  if (d.invulnTimer > 0) return 'grace';
  if (d.blockHeld) return 'block';
  return 'hit';
}

export function applyGuardBreakToShield(
  currentShieldHp: number,
  attackDamage: number,
  isGuardBreakMove: boolean
): { nextShieldHp: number; broken: boolean; passThroughMultiplier: number } {
  if (currentShieldHp <= 0) {
    return { nextShieldHp: 0, broken: false, passThroughMultiplier: 1.0 };
  }
  if (!isGuardBreakMove) {
    const chip = Math.max(2, attackDamage * 0.15);
    const next = Math.max(1, currentShieldHp - chip);
    return { nextShieldHp: next, broken: false, passThroughMultiplier: 0.12 };
  }
  const breakAmount = Math.max(45, attackDamage * 1.45);
  const next = Math.max(0, currentShieldHp - breakAmount);
  return {
    nextShieldHp: next,
    broken: next === 0,
    passThroughMultiplier: next === 0 ? 1.15 : 0.45,
  };
}

function normalCdf(x: number): number {
  const t = 1 / (1 + (0.3275911 * Math.abs(x)) / Math.SQRT2);
  const poly =
    t *
    (0.254829592 +
      t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-(x * x) / 2);
  return 0.5 * (1 + (x >= 0 ? erf : -erf));
}

export interface TimingProfile {
  meanEarly: number;
  sd: number;
}

export const TIMING_PROFILES: Record<'sharp' | 'typical' | 'sloppy', TimingProfile> = {
  sharp: { meanEarly: 0.04, sd: 0.035 },
  typical: { meanEarly: 0.06, sd: 0.06 },
  sloppy: { meanEarly: 0.08, sd: 0.11 },
};

export function parryOutcomeOdds(window: number, profile: TimingProfile, iFrameSeconds = PARRY.dodgeIFrames) {
  const p = (a: number, b: number) =>
    normalCdf((b - profile.meanEarly) / profile.sd) - normalCdf((a - profile.meanEarly) / profile.sd);
  const parry = p(0, window);
  const evade = p(window, iFrameSeconds);
  return {
    parry,
    evade,
    hit: Math.max(0, 1 - parry - evade),
  };
}
