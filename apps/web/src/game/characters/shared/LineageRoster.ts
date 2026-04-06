/**
 * Canonical fusion-line ids shared by roster, beast visuals, and design specs.
 * Full tables remain in `data/beastRoster.ts` and `data/characterDesigns.ts`.
 */
export const CANONICAL_LINEAGE_IDS = ["kai-jax", "jaxon", "kaison"] as const;
export type CanonicalLineageId = (typeof CANONICAL_LINEAGE_IDS)[number];

export function isCanonicalLineageId(id: string): id is CanonicalLineageId {
  return (CANONICAL_LINEAGE_IDS as readonly string[]).includes(id);
}
