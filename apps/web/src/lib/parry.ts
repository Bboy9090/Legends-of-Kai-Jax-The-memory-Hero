/**
 * Dodge / parry resolution (ported from the zip prototype's single dodge-or-parry button).
 * Starting a dodge opens a short parry window; an enemy strike that lands inside it is deflected
 * (the enemy staggers and the player is rewarded). A strike that lands later in the dodge's i-frames is a
 * plain evade. Real damage only happens outside both.
 */
export const PARRY = {
  /** Seconds at the start of a dodge in which a strike counts as a parry. */
  window: 0.2,
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
