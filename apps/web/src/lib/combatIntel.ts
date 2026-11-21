/**
 * Pure rules behind the supplemental combat HUD ("Combat Intel").
 * BattleUI owns health / combo / stamina / meters; this layer only adds
 * boss-phase information and the fighter's ability reference with live ultimate readiness.
 */
import { getBossEncounter, type BossEncounter, type BossPhase } from './bossEncounters';
import { getCharacterAbilities, getCharacterUltimate, type Ability } from './abilitySystems';

import { ACT_I_STORY_MISSIONS, ACT_II_STORY_MISSIONS, ACT_III_STORY_MISSIONS } from './story_missions';

/**
 * A boss identity is "verified" only when a story mission names it as its `bossId` AND an encounter definition
 * with that exact id exists. Name similarity (e.g. "ashen-tiger" vs "ashen-enforcer") is NOT evidence: nothing in
 * the game links those, so no banner is shown for such fighters.
 */
export function verifiedBossIds(): string[] {
  const missionBosses = new Set(
    [...ACT_I_STORY_MISSIONS, ...ACT_II_STORY_MISSIONS, ...ACT_III_STORY_MISSIONS]
      .map((m) => (m as { bossId?: string }).bossId)
      .filter((id): id is string => Boolean(id)),
  );
  return [...missionBosses].filter((id) => getBossEncounter(id) !== undefined).sort();
}

/** Fighter ids that differ from the power-matrix ids. */
const FIGHTER_TO_MATRIX: Record<string, string> = {
  kaijax: 'kai-jax',
  kai_jax: 'kai-jax',
};

export function resolveBoss(fighterId: string): BossEncounter | null {
  return verifiedBossIds().includes(fighterId) ? (getBossEncounter(fighterId) ?? null) : null;
}

export function matrixIdFor(fighterId: string): string {
  return FIGHTER_TO_MATRIX[fighterId] ?? fighterId;
}

/** Phase thresholds are "active while health% is at or below the threshold" — the lowest matching one wins. */
export function activeBossPhase(boss: BossEncounter, healthPct: number): BossPhase | null {
  if (!boss.phases || boss.phases.length === 0) return null;
  const pct = Math.max(0, Math.min(100, healthPct));
  const sorted = [...boss.phases].sort((a, b) => a.healthThreshold - b.healthThreshold);
  const match = sorted.find((p) => pct <= p.healthThreshold);
  return match ?? sorted[sorted.length - 1];
}

export function phaseNumber(boss: BossEncounter, phase: BossPhase): number {
  const ordered = [...boss.phases].sort((a, b) => b.healthThreshold - a.healthThreshold);
  return ordered.findIndex((p) => p.id === phase.id) + 1;
}

export interface UltimateState {
  name: string;
  percent: number;
  ready: boolean;
}

/** Mirrors the useBattle ultimate gate: meter full AND (transformed OR native ultimate roster). */
export function ultimateState(
  fighterId: string,
  overdrive: number,
  maxOverdrive: number,
  transformed: boolean,
  hasNativeUltimate: boolean,
): UltimateState | null {
  const ult = getCharacterUltimate(matrixIdFor(fighterId));
  if (!ult) return null;
  const percent = maxOverdrive > 0 ? Math.max(0, Math.min(100, (overdrive / maxOverdrive) * 100)) : 0;
  return { name: ult.name, percent, ready: percent >= 100 && (transformed || hasNativeUltimate) };
}

export function abilitiesFor(fighterId: string): Ability[] {
  return getCharacterAbilities(matrixIdFor(fighterId));
}
