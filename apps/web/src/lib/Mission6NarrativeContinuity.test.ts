import { describe, expect, it } from "vitest";
import { getStoryMissionById } from "./story_missions";

/**
 * Narrative-only regression checks. Do not change the M6-A/B/C combat
 * contract or rewrite Mission 7 as a newly formed physical fusion.
 */
describe("Mission 5 → 6 → 7 canonical narrative handoff", () => {
  const m5 = getStoryMissionById("story_act1_m5")!;
  const m6 = getStoryMissionById("story_act2_m6")!;
  const m7 = getStoryMissionById("story_act2_m7")!;

  it("carries the defeat at Cross Point into the Ashblock briefing", () => {
    expect(m5.storyBeat).toMatch(/fail to close the rift/i);
    expect(m5.outroCutscene.map(x => x.text).join(" ")).toMatch(/arena falls.*retreat/i);
    expect(m6.introCutscene).toHaveLength(2);
    const [handoff, order] = m6.introCutscene.map(x => x.text);
    expect(handoff).toMatch(/Cross Point has fallen/i);
    expect(handoff).toMatch(/Rift remains open/i);
    expect(handoff).toMatch(/survivors.*retreat.*Ashblock/i);
    expect(order).toMatch(/could not close the breach/i);
    expect(order).toMatch(/three memories.*trapped/i);
    expect(order).toMatch(/Void takes them/i);
  });

  it("plants M7's distinct-voices tension without new bodily fusion", () => {
    const outro = m6.outroCutscene.map(x => x.text).join(" ");
    expect(outro).toMatch(/restoring the Weave/i);
    expect(outro).toMatch(/Kai and Jax/i);
    expect(outro).toMatch(/listen to both/i);
    expect(outro).not.toMatch(/first fusion|two bodies|new body|become one|separate bodies/i);
    expect(m7.title).toBe("The Third Voice Revealed");
    expect(m7.description).toMatch(/no physical separation occurs/i);
    expect(m7.requiredCharacters).toEqual(["kai-jax"]);
    expect(m7.outroCutscene.map(x => x.text).join(" ")).toMatch(/Three voices\. One body/i);
  });

  it("preserves M6 mission identity, objectives, wave counts, arena and rewards", () => {
    expect(m6.id).toBe("story_act2_m6");
    expect(m6.missionNumber).toBe(6);
    expect(m6.arena).toBe("rift_frontier");
    expect(m6.objectives).toEqual(["Contain the Void outbreak", "Rescue 3 Trapped Memories"]);
    expect(m6.enemyWaves).toEqual([
      { type: "void-grunt", count: 6 },
      { type: "void-scout", count: 8, delay: 3 },
    ]);
    expect(m6.rewards).toEqual({ xp: 500, currency: 350, loot: ["Ashblock Memory"] });
  });

  it("only uses valid StoryDialogue emotion values", () => {
    const valid = ["neutral", "angry", "sad", "determined", "happy"];
    for (const mission of [m5, m6, m7]) {
      for (const beat of [...mission.introCutscene, ...mission.outroCutscene]) {
        if (beat.emotion !== undefined) expect(valid).toContain(beat.emotion);
      }
    }
  });
});
