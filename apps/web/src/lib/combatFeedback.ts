/** Pure combat-feedback rules: hit classification, hit-stop, damped shake and damage-number styling. */

export type HitKind = "normal" | "critical" | "elemental" | "ultimate";
/** 1 = basic / Tier 1, 2 = Tier 2 ability, 3 = Ultimate. */
export type HitTier = 1 | 2 | 3;

export const HIT_STOP_SECONDS = 0.05;
export const MAX_CRIT_CHANCE = 25;
export const DEFAULT_CRIT_CHANCE = 10;
export const DEFAULT_CRIT_MULTIPLIER = 1.5;

export interface HitInput {
  tier: HitTier;
  isCrit: boolean;
  /** Elemental Tier 2 abilities read as cyan instead of white. */
  elemental?: boolean;
}

export interface HitFeedback {
  kind: HitKind;
  tier: HitTier;
  /** Zero for Tier 1 / basic non-crit hits. */
  hitStopSeconds: number;
  /** 0..1 initial shake amplitude; zero for Tier 1 / basic non-crit hits. */
  shakeIntensity: number;
}

export function classifyHit({ tier, isCrit, elemental = false }: HitInput): HitFeedback {
  const kind: HitKind = tier === 3 ? "ultimate" : isCrit ? "critical" : tier === 2 && elemental ? "elemental" : "normal";
  const heavy = tier >= 2 || isCrit;
  const shakeIntensity = tier === 3 ? 0.9 : isCrit ? 0.6 : tier === 2 ? 0.45 : 0;
  return { kind, tier, hitStopSeconds: heavy ? HIT_STOP_SECONDS : 0, shakeIntensity };
}

/** Tier for the versus-mode attack types. */
export function tierForAttackType(type: "punch" | "kick" | "special" | "ultimate"): HitTier {
  return type === "ultimate" ? 3 : type === "special" ? 2 : 1;
}

/** Tier for adventure move keys (light1..3 basic, heavy/skill Tier 2). */
export function tierForMoveKey(moveKey: string): HitTier {
  if (moveKey === "ultimate") return 3;
  return moveKey === "heavy" || moveKey === "skill" ? 2 : 1;
}

/** Crit chance in percent, clamped so stat-driven crits never dominate. */
export function clampCritChance(statChance: number | undefined): number {
  if (typeof statChance !== "number" || !Number.isFinite(statChance)) return DEFAULT_CRIT_CHANCE;
  return Math.max(0, Math.min(MAX_CRIT_CHANCE, statChance));
}

export function rollCrit(chancePercent: number, rng: () => number = Math.random): boolean {
  return rng() * 100 < chancePercent;
}

export function critMultiplier(statCritDamagePercent: number | undefined): number {
  if (typeof statCritDamagePercent !== "number" || !Number.isFinite(statCritDamagePercent)) return DEFAULT_CRIT_MULTIPLIER;
  return Math.max(1, statCritDamagePercent / 100);
}

/** Exponential damping for a shake amplitude; snaps to zero once imperceptible. */
export function decayShake(value: number, deltaSeconds: number, rate = 7): number {
  if (value <= 0) return 0;
  const next = value * Math.exp(-rate * Math.max(0, deltaSeconds));
  return next < 0.01 ? 0 : next;
}

/** Damped sinusoidal offset at time t (seconds) after a shake of the given intensity started. */
export function dampedShakeOffset(t: number, intensity: number, decay = 7, frequency = 22): number {
  return intensity * Math.exp(-decay * t) * Math.sin(2 * Math.PI * frequency * t);
}

export interface DamageNumberStyle {
  color: string;
  scale: number;
  label: string | null;
  glow: string;
}

export function damageNumberStyle(kind: HitKind, amount: number): DamageNumberStyle {
  switch (kind) {
    case "critical":
      return { color: "#ffd24a", scale: 1.35 + Math.min(0.65, amount / 150), label: "CRIT!", glow: "#ff9a1f" };
    case "elemental":
      return { color: "#35e6ff", scale: 1.15, label: null, glow: "#0aa8d6" };
    case "ultimate":
      return { color: "#b36bff", scale: 1.5, label: null, glow: "#7a2cff" };
    default:
      return { color: "#ffffff", scale: 1, label: null, glow: "#000000" };
  }
}
