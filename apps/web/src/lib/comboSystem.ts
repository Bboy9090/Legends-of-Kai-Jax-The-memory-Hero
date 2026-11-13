/**
 * Combo counter rules: every landed strike adds one and refreshes a decay timer; if the timer runs out the
 * combo fades, and taking real damage breaks it instantly. Pure functions so the timing is unit-testable.
 */
export const COMBO = {
  decaySeconds: 3.5,
  /** Below this share of the timer the HUD warns that the combo is about to drop. */
  warnFraction: 0.28,
  /** How long the "Combo Broken" state is shown before the widget dismisses. */
  brokenSeconds: 0.7,
} as const;

export type ComboRankId = "strike-chain" | "memory-rhythm" | "storm-surge" | "pyraxis-frenzy" | "convergence-apex";

export interface ComboRank {
  id: ComboRankId;
  label: string;
  /** The heritage the rank draws on (Convergence is all four together). */
  heritage: string;
  /** Lowest hit count of the rank. */
  min: number;
  /** Resting size of the counter at this rank. */
  scale: number;
}

export const COMBO_RANKS: readonly ComboRank[] = [
  { id: "strike-chain", label: "Strike Chain", heritage: "Street instinct", min: 1, scale: 1 },
  { id: "memory-rhythm", label: "Memory Rhythm", heritage: "Myrr'Kai", min: 5, scale: 1.08 },
  { id: "storm-surge", label: "Storm Surge", heritage: "Kar-Voth", min: 10, scale: 1.17 },
  { id: "pyraxis-frenzy", label: "Pyraxis Frenzy", heritage: "Pyraxis", min: 20, scale: 1.28 },
  { id: "convergence-apex", label: "Convergence Apex", heritage: "All four heritages", min: 35, scale: 1.4 },
];

export function rankFor(count: number): ComboRank {
  let rank = COMBO_RANKS[0];
  for (const r of COMBO_RANKS) if (count >= r.min) rank = r;
  return rank;
}

export interface ComboState {
  count: number;
  /** Seconds left before the combo fades; 0 when there is no combo. */
  timeLeft: number;
  /** Increments on every landed strike so the HUD can pop on each one. */
  hitSeq: number;
  /** Seconds of the "Combo Broken" state remaining. */
  broken: number;
  /** The count that was lost, shown while broken. */
  brokenFrom: number;
}

export const initialCombo = (): ComboState => ({ count: 0, timeLeft: 0, hitSeq: 0, broken: 0, brokenFrom: 0 });

export const registerHit = (s: ComboState): ComboState => ({ ...s, count: s.count + 1, timeLeft: COMBO.decaySeconds, hitSeq: s.hitSeq + 1, broken: 0, brokenFrom: 0 });

/** A parry keeps the combo alive without adding to it. */
export const refreshCombo = (s: ComboState): ComboState => (s.count > 0 ? { ...s, timeLeft: COMBO.decaySeconds } : s);

/** Real damage: zero the count and the timer immediately and flag the broken state. No-op without a combo. */
export function breakCombo(s: ComboState): ComboState {
  if (s.count <= 0) return s;
  return { ...s, count: 0, timeLeft: 0, broken: COMBO.brokenSeconds, brokenFrom: s.count };
}

export function tickCombo(s: ComboState, dt: number): ComboState {
  if (!(dt > 0)) return s;
  let next = s;
  if (s.count > 0) {
    const timeLeft = s.timeLeft - dt;
    next = timeLeft <= 0 ? { ...s, count: 0, timeLeft: 0 } : { ...s, timeLeft };
  }
  if (next.broken > 0) {
    const broken = Math.max(0, next.broken - dt);
    next = { ...next, broken, brokenFrom: broken > 0 ? next.brokenFrom : 0 };
  }
  return next;
}

export const comboProgress = (s: ComboState) => Math.max(0, Math.min(1, s.timeLeft / COMBO.decaySeconds));
export const isComboWarning = (s: ComboState) => s.count > 0 && comboProgress(s) < COMBO.warnFraction;
