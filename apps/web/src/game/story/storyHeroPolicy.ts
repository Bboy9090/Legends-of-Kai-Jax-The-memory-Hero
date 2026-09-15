export const STORY_HERO_IDS = ["kai", "jax"] as const;

export type StoryHeroId = (typeof STORY_HERO_IDS)[number];

/**
 * Literal Story Hub hero swapping is intentionally limited to the two
 * protagonists. Kai-Jax remains an earned fusion event, while historical,
 * arena-only, and prototype identities use their own chronology-safe surfaces.
 */
export function isStoryHeroId(id: string | null | undefined): id is StoryHeroId {
  return id === "kai" || id === "jax";
}
