import type { AttackType } from "./moveData";

export interface ImpactProfile {
  shakeIntensity: number;
  shakeDurationSec: number;
  slowMoScale: number;
  slowMoDurationMs: number;
  flashStrength: number;
}

export const IMPACT_PROFILES: Readonly<Record<AttackType, Readonly<ImpactProfile>>> = Object.freeze({
  punch: Object.freeze({
    shakeIntensity: 0.18,
    shakeDurationSec: 0.08,
    slowMoScale: 1,
    slowMoDurationMs: 0,
    flashStrength: 0.12,
  }),
  kick: Object.freeze({
    shakeIntensity: 0.32,
    shakeDurationSec: 0.12,
    slowMoScale: 0.92,
    slowMoDurationMs: 55,
    flashStrength: 0.2,
  }),
  special: Object.freeze({
    shakeIntensity: 0.72,
    shakeDurationSec: 0.2,
    slowMoScale: 0.55,
    slowMoDurationMs: 120,
    flashStrength: 0.45,
  }),
  ultimate: Object.freeze({
    shakeIntensity: 1,
    shakeDurationSec: 0.32,
    slowMoScale: 0.35,
    slowMoDurationMs: 220,
    flashStrength: 0.7,
  }),
});

export const KO_IMPACT_PROFILE: Readonly<ImpactProfile> = Object.freeze({
  shakeIntensity: 1.15,
  shakeDurationSec: 0.42,
  slowMoScale: 0.22,
  slowMoDurationMs: 480,
  flashStrength: 0.85,
});

export function getImpactProfile(type: AttackType | null | undefined): Readonly<ImpactProfile> {
  return type ? IMPACT_PROFILES[type] : IMPACT_PROFILES.punch;
}

export function impactProfileForDamage(
  damage: number,
  type?: AttackType | null
): Readonly<ImpactProfile> {
  const safeDamage = Math.max(0, Number.isFinite(damage) ? damage : 0);
  const base = getImpactProfile(type);
  const damageScale = Math.max(0.5, Math.min(1.35, safeDamage / 18));

  return {
    ...base,
    shakeIntensity: Math.min(1.2, base.shakeIntensity * damageScale),
    shakeDurationSec: Math.min(0.45, base.shakeDurationSec * Math.max(0.8, damageScale)),
    slowMoScale: safeDamage >= 15 ? Math.min(base.slowMoScale, 0.6) : 1,
    slowMoDurationMs: safeDamage >= 15 ? Math.max(base.slowMoDurationMs, 90) : 0,
  };
}

/**
 * Deterministic camera shake sample. Using elapsed time instead of Math.random()
 * keeps presentation reproducible for capture, QA, and future replay systems.
 */
export function sampleCameraShake(
  elapsedSec: number,
  intensity: number
): { x: number; y: number; z: number } {
  const t = Number.isFinite(elapsedSec) ? elapsedSec : 0;
  const i = Math.max(0, Number.isFinite(intensity) ? intensity : 0);
  if (i === 0) return { x: 0, y: 0, z: 0 };
  return {
    x: Math.sin(t * 113.7) * i * 0.5,
    y: Math.sin(t * 157.3 + 1.7) * i * 0.45,
    z: Math.sin(t * 83.1 + 3.2) * i * 0.24,
  };
}
