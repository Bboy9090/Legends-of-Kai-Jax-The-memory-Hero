/**
 * Kai-Jax tail / fusion registry.
 *
 * Current Bloodward authority establishes the count progression (base fusion has
 * exactly three tails and later story progression grows toward nine) but does
 * not authorize the old one-element-per-tail table. Keep unproven tail-specific
 * powers out of runtime canon until the publication source explicitly defines them.
 */

export type TailImplementationPhase = "wired" | "partial" | "spec_only";

export interface TailAbilityDefinition {
  id: string;
  /** Zero-based position in the nine-tail progression, when applicable. */
  docIndex?: number;
  displayName: string;
  elementHint?: string;
  phase: TailImplementationPhase;
  implementationNotes: string;
}

/**
 * Narrative tail-count slots only. These are not purchasable abilities and do
 * not imply an element, move, or stat bonus. Tails 1-3 are visible in base
 * Kai-Jax; later counts remain story gated, with Tail IX reserved for coronation.
 */
export const NINE_TAIL_SLOTS: readonly TailAbilityDefinition[] = [
  { id: "tail-1", docIndex: 0, displayName: "Tail I", phase: "spec_only", implementationNotes: "Base-fusion tail; no independent element assigned by current Bloodward authority." },
  { id: "tail-2", docIndex: 1, displayName: "Tail II", phase: "spec_only", implementationNotes: "Base-fusion tail; no independent element assigned by current Bloodward authority." },
  { id: "tail-3", docIndex: 2, displayName: "Tail III", phase: "spec_only", implementationNotes: "Base-fusion tail; Kai-Jax starts with exactly three tails." },
  { id: "tail-4", docIndex: 3, displayName: "Tail IV", phase: "spec_only", implementationNotes: "Story-progression slot; unlock condition not yet wired." },
  { id: "tail-5", docIndex: 4, displayName: "Tail V", phase: "spec_only", implementationNotes: "Story-progression slot; unlock condition not yet wired." },
  { id: "tail-6", docIndex: 5, displayName: "Tail VI", phase: "spec_only", implementationNotes: "Story-progression slot; unlock condition not yet wired." },
  { id: "tail-7", docIndex: 6, displayName: "Tail VII", phase: "spec_only", implementationNotes: "Story-progression slot; unlock condition not yet wired." },
  { id: "tail-8", docIndex: 7, displayName: "Tail VIII", phase: "spec_only", implementationNotes: "Story-progression slot; unlock condition not yet wired." },
  { id: "tail-9", docIndex: 8, displayName: "Tail IX — Coronation", phase: "spec_only", implementationNotes: "Final narrative coronation state; never a normal score/currency purchase." },
];

/**
 * Base Kai + Jax convergence. The current battle store still contains legacy
 * transformation internals, so runtime entry is guarded by fusionPolicy until
 * that store is fully rewritten around the canonical sibling synchronization model.
 */
export const FUSION_KAI_JAX_TAIL: TailAbilityDefinition = {
  id: "kai-jax-base-fusion",
  displayName: "Kai-Jax Base Fusion — Three Tails",
  elementHint: "all-four-godlines",
  phase: "partial",
  implementationNotes:
    "Kai/Jax only; story unlock + full synchronization required by game/fusion/fusionPolicy. Base fusion renders exactly three tails; later tail counts remain story gated.",
};

export const TAIL_ABILITY_REGISTRY: Record<string, TailAbilityDefinition> = (() => {
  const registry: Record<string, TailAbilityDefinition> = {};
  for (const tail of NINE_TAIL_SLOTS) registry[tail.id] = tail;
  registry[FUSION_KAI_JAX_TAIL.id] = FUSION_KAI_JAX_TAIL;
  return registry;
})();

export function getTailAbility(id: string): TailAbilityDefinition | undefined {
  return TAIL_ABILITY_REGISTRY[id];
}

/** Returns the base-fusion descriptor only for the current Kai/Jax lineage. */
export function getFusionTailForLineage(fighterId: string): TailAbilityDefinition | null {
  if (fighterId === "kai" || fighterId === "jax" || fighterId === "kai-jax" || fighterId === "kaijax") {
    return FUSION_KAI_JAX_TAIL;
  }
  return null;
}
