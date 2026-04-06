/**
 * Canonical registry for tail / fusion abilities. Gameplay execution stays in useBattle;
 * this module names and documents what exists today and reserves ids for the 9-tail framework.
 *
 * @see memory/TAIL_ABILITY_SYSTEM.md
 */

export type TailImplementationPhase = "wired" | "partial" | "spec_only";

export interface TailAbilityDefinition {
  id: string;
  /** Index in production bible (0–8); undefined for composite / fusion-only */
  docIndex?: number;
  displayName: string;
  elementHint?: string;
  phase: TailImplementationPhase;
  /** Where mechanics live today (for migration) */
  implementationNotes: string;
}

/** Nine-tail bible slots (spec); not all are playable yet. */
export const NINE_TAIL_SLOTS: readonly TailAbilityDefinition[] = [
  { id: "tail-ember", docIndex: 0, displayName: "Ember", elementHint: "fire", phase: "spec_only", implementationNotes: "Spec only — see TAIL_ABILITY_SYSTEM.md" },
  { id: "tail-gale", docIndex: 1, displayName: "Gale", elementHint: "wind", phase: "spec_only", implementationNotes: "Spec only" },
  { id: "tail-shade", docIndex: 2, displayName: "Shade", elementHint: "shadow", phase: "spec_only", implementationNotes: "Spec only" },
  { id: "tail-volt", docIndex: 3, displayName: "Volt", elementHint: "lightning", phase: "spec_only", implementationNotes: "Spec only" },
  { id: "tail-stone", docIndex: 4, displayName: "Stone", elementHint: "earth", phase: "spec_only", implementationNotes: "Spec only" },
  { id: "tail-tide", docIndex: 5, displayName: "Tide", elementHint: "water", phase: "spec_only", implementationNotes: "Spec only" },
  { id: "tail-thorn", docIndex: 6, displayName: "Thorn", elementHint: "nature", phase: "spec_only", implementationNotes: "Spec only" },
  { id: "tail-prism", docIndex: 7, displayName: "Prism", elementHint: "light", phase: "spec_only", implementationNotes: "Spec only" },
  { id: "tail-void", docIndex: 8, displayName: "Void (Memory)", elementHint: "memory", phase: "spec_only", implementationNotes: "Closest thematic match to fusion / memory hybrid" },
];

/** Jaxon/Kaison → Kai-Jax fusion: wired via synergy + triggerTransformation in useBattle. */
export const FUSION_KAI_JAX_TAIL: TailAbilityDefinition = {
  id: "kai-jax-fusion",
  docIndex: 8,
  displayName: "Kai-Jax fusion (Father's Strand)",
  elementHint: "memory",
  phase: "wired",
  implementationNotes:
    "useBattle: addSynergy, triggerTransformation, battlePhase transforming, playerFighterId kai-jax, endTransformation revert",
};

export const TAIL_ABILITY_REGISTRY: Record<string, TailAbilityDefinition> = (() => {
  const r: Record<string, TailAbilityDefinition> = {};
  for (const t of NINE_TAIL_SLOTS) r[t.id] = t;
  r[FUSION_KAI_JAX_TAIL.id] = FUSION_KAI_JAX_TAIL;
  return r;
})();

export function getTailAbility(id: string): TailAbilityDefinition | undefined {
  return TAIL_ABILITY_REGISTRY[id];
}

/** Fusion tail relevant to current roster ids (jaxon / kaison lines). */
export function getFusionTailForLineage(fighterId: string): TailAbilityDefinition | null {
  if (fighterId === "jaxon" || fighterId === "jax" || fighterId === "kaison" || fighterId === "kai") {
    return FUSION_KAI_JAX_TAIL;
  }
  if (fighterId === "kai-jax") return FUSION_KAI_JAX_TAIL;
  return null;
}
