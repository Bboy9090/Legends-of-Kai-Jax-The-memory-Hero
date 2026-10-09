export const GOLD_SLICE_PLAYABLE_IDS = ["kai-jax", "jaxon", "kaison"] as const;

export type GoldSlicePlayableId = (typeof GOLD_SLICE_PLAYABLE_IDS)[number];

export function normalizeGoldSlicePublicId(id: string): string {
  const normalized = (id ?? "").trim().toLowerCase().replace(/_/g, "-");
  return normalized === "kaijax" ? "kai-jax" : normalized;
}

export function isGoldSlicePlayableId(id: string): boolean {
  return (GOLD_SLICE_PLAYABLE_IDS as readonly string[]).includes(
    normalizeGoldSlicePublicId(id),
  );
}
