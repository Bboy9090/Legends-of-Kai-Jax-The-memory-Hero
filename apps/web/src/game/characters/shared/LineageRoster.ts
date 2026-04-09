/**
 * Canonical fusion-line ids shared by roster, beast visuals, and design specs.
 * Full tables remain in `data/beastRoster.ts` and `data/characterDesigns.ts`.
 */
export const CANONICAL_LINEAGE_IDS = ["kai-jax", "jaxon", "kaison"] as const;
export type CanonicalLineageId = (typeof CANONICAL_LINEAGE_IDS)[number];

export function isCanonicalLineageId(id: string): id is CanonicalLineageId {
  return (CANONICAL_LINEAGE_IDS as readonly string[]).includes(id);
}

/**
 * Roster uses both short and long ids for the same lineage (jax / jaxon, kai / kaison).
 * Move tuning is authored once per line; resolve here for lookups.
 */
export const MOVESET_KEY_BY_ROSTER_ID: Record<string, string> = {
  jax: "jaxon",
  jaxon: "jaxon",
  kai: "kaison",
  kaison: "kaison",
};

export function resolveMovesetKey(characterId: string): string {
  return MOVESET_KEY_BY_ROSTER_ID[characterId] ?? characterId;
}
