import { describe, expect, it } from "vitest";
import { STORY_HERO_IDS, isStoryHeroId } from "../../game/story/storyHeroPolicy";

describe("Story Hero Select canon allowlist", () => {
  it("contains only Kai and Jax", () => {
    expect(STORY_HERO_IDS).toEqual(["kai", "jax"]);
  });

  it("does not expose Kai-Jax or legacy prototype identities as ordinary story swaps", () => {
    expect(isStoryHeroId("kai")).toBe(true);
    expect(isStoryHeroId("jax")).toBe(true);
    expect(isStoryHeroId("kai-jax")).toBe(false);
    expect(isStoryHeroId("kaijax")).toBe(false);
    expect(isStoryHeroId("jaxon")).toBe(false);
    expect(isStoryHeroId("kaison")).toBe(false);
  });
});
