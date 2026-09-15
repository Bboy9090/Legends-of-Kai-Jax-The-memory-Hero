export type BattleFusionPhase = "preRound" | "fighting" | "ko" | "results" | "transforming" | "paused";

export interface KaiJaxFusionCheck {
  fighterId: string | null | undefined;
  fusionUnlocked: boolean;
  synergy: number;
  maxSynergy: number;
  transformed: boolean;
  battlePhase: BattleFusionPhase;
}

export const KAI_JAX_FUSION_PARTICIPANTS = ["kai", "jax"] as const;

export function isKaiJaxFusionParticipant(fighterId: string | null | undefined): boolean {
  return fighterId === "kai" || fighterId === "jax";
}

/**
 * Canon gate for the base Kai-Jax convergence.
 *
 * The current arena runtime may only request fusion when:
 * - the selected fighter is Kai or Jax;
 * - story progression has explicitly unlocked fusion;
 * - synchronization is completely full;
 * - the fighter is not already transformed; and
 * - the round is actively fighting.
 *
 * This gate intentionally does not encode a mission id or tail-upgrade purchase.
 * Story code owns the moment that flips `fusionUnlocked`.
 */
export function canTriggerKaiJaxFusion(check: KaiJaxFusionCheck): boolean {
  if (!isKaiJaxFusionParticipant(check.fighterId)) return false;
  if (!check.fusionUnlocked || check.transformed || check.battlePhase !== "fighting") return false;
  if (!Number.isFinite(check.maxSynergy) || check.maxSynergy <= 0) return false;
  return check.synergy >= check.maxSynergy;
}
