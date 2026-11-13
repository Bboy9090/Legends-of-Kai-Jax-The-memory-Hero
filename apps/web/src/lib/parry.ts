/**
 * Dodge / parry resolution (ported from the zip prototype's single dodge-or-parry button).
 * Starting a dodge opens a short parry window; an enemy strike that lands inside it is deflected
 * (the enemy staggers and the player is rewarded). A strike that lands later in the dodge's i-frames is a
 * plain evade. Real damage only happens outside both.
 */
export const PARRY = {
  /**
   * Seconds at the start of a dodge in which a strike counts as a parry (standard timing). 6 frames at 60fps.
   * Tuned against the dodge's 16-frame (0.267s) i-frames: at 0.2s a parry was 75% of every successful dodge and
   * an evade almost never happened; at 0.10s a typical player parries ~59%, evades ~25% and gets hit ~16%
   * (see parryOutcomeOdds and its test).
   */
  window: 0.1,
  /** Accessibility option: a wider window for players who find the timing hard. Still inside the i-frames. */
  generousWindow: 0.16,
  enemyStagger: 1.8,
  /** Fusion gauge awarded for a parry / for an evade. */
  fusionCharge: 22,
  evadeFusionCharge: 8,
} as const;

export type StrikeOutcome = "parry" | "evade" | "grace" | "hit";

export interface DefenseState {
  parryTimer: number;
  dodgeTimer: number;
  invulnTimer: number;
}

/**
 * - parry: inside the parry window, deflected.
 * - evade: still dodging with i-frames, but past the window.
 * - grace: brief invulnerability after a previous hit (no reward, no damage).
 * - hit: the strike connects.
 */
export function resolveIncomingStrike(d: DefenseState): StrikeOutcome {
  if (d.parryTimer > 0) return "parry";
  if (d.dodgeTimer > 0 && d.invulnTimer > 0) return "evade";
  if (d.invulnTimer > 0) return "grace";
  return "hit";
}

export type ParryTiming = "standard" | "generous";

export const parryWindowFor = (timing: ParryTiming): number => (timing === "generous" ? PARRY.generousWindow : PARRY.window);

/** Standard normal CDF (Abramowitz-Stegun 7.1.26 erf approximation, max error ~1.5e-7). */
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-(x * x) / 2);
  return 0.5 * (1 + (x >= 0 ? erf : -erf));
}

export interface TimingProfile {
  /** Mean seconds the player presses dodge before the strike lands (positive = early). */
  meanEarly: number;
  /** Spread of that press time, in seconds. */
  sd: number;
}

/** A few representative players, used to sanity-check the window against the i-frames. */
export const TIMING_PROFILES: Record<"sharp" | "typical" | "sloppy", TimingProfile> = {
  sharp: { meanEarly: 0.04, sd: 0.035 },
  typical: { meanEarly: 0.06, sd: 0.06 },
  sloppy: { meanEarly: 0.08, sd: 0.11 },
};

/**
 * Probability of each outcome when the press-to-strike delay is normally distributed.
 * Parry: delay in (0, window]; evade: (window, iFrames]; hit: anything else (too early or too late).
 */
export function parryOutcomeOdds(window: number, profile: TimingProfile, iFrameSeconds = 16 / 60) {
  const p = (a: number, b: number) => normalCdf((b - profile.meanEarly) / profile.sd) - normalCdf((a - profile.meanEarly) / profile.sd);
  const parry = p(0, window);
  const evade = p(window, iFrameSeconds);
  return { parry, evade, hit: Math.max(0, 1 - parry - evade) };
}
