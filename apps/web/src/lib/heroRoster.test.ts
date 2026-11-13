import { beforeEach, describe, expect, it } from "vitest";
import { CHARACTER_DATA_MAP } from "./characterStats";
import { ALL_STORY_MISSIONS } from "./story_missions";
import { HERO_IDENTITIES, HERO_ORDER, getHeroIdentity, hasBattleModel, identityForSpeaker, moodFromEmotion, normalizeHeroId } from "./heroVisualIdentity";
import { DEFAULT_UNLOCKED_HEROES, useHeroRoster } from "./stores/useHeroRoster";
import { MAX_BEAT_CHARS, expandDialogue, splitIntoBeats } from "./dialogueBeats";

describe("hero visual identity", () => {
  it("defines an identity for every one of the 15 roster heroes plus Kai", () => {
    for (const id of Object.keys(CHARACTER_DATA_MAP)) expect(HERO_IDENTITIES[id], id).toBeDefined();
    expect(HERO_IDENTITIES.kai).toBeDefined();
    expect(Object.keys(HERO_IDENTITIES)).toHaveLength(16);
    expect(HERO_ORDER).toHaveLength(16);
  });

  it("gives every hero a distinct silhouette signature (headgear + attachment + build)", () => {
    const sigs = Object.values(HERO_IDENTITIES).map((h) => `${h.build}|${h.headgear}|${h.attachment}`);
    expect(new Set(sigs).size).toBe(sigs.length);
    const attachments = Object.values(HERO_IDENTITIES).map((h) => h.attachment);
    expect(new Set(attachments).size).toBe(attachments.length);
  });

  it("follows the approved key-art palettes for Kai, Jax and Kai-Jax", () => {
    expect(getHeroIdentity("kai")).toMatchObject({ primaryColor: "#8b5cf6", accentColor: "#ff7a1a" });
    expect(getHeroIdentity("jax")?.primaryColor).toBe("#2f6bff");
    expect(getHeroIdentity("kai-jax")?.aura.kind).toBe("fusion");
  });

  it("frames small heroes closer and towering heroes farther away", () => {
    expect(getHeroIdentity("rikka")!.camera.position[2]).toBeLessThan(getHeroIdentity("kai")!.camera.position[2]);
    expect(getHeroIdentity("boryn")!.camera.position[2]).toBeGreaterThan(getHeroIdentity("kai")!.camera.position[2]);
  });

  it("resolves aliases and speaker labels", () => {
    expect(normalizeHeroId("Jaxon")).toBe("jax");
    expect(identityForSpeaker("Kai-Jax Zenith")?.id).toBe("kai-jax");
    expect(identityForSpeaker("Old Moss")?.id).toBe("old-moss");
    expect(identityForSpeaker("Narrator")).toBeUndefined();
  });

  it("is honest about which heroes have a 3D model", () => {
    for (const id of ["kai", "jax", "kai-jax", "kaison", "silver", "volter", "boryn", "borax"]) expect(hasBattleModel(id), id).toBe(true);
    for (const id of ["vharck", "aurelion", "selene", "miri", "old-moss", "rikka", "mirek", "sable-nine"]) expect(hasBattleModel(id), id).toBe(false);
  });

  it("maps authored emotions onto the four portrait moods", () => {
    expect(moodFromEmotion("neutral")).toBe("neutral");
    expect(moodFromEmotion(undefined)).toBe("neutral");
    expect(moodFromEmotion("angry")).toBe("determined");
    expect(moodFromEmotion("determined")).toBe("determined");
    expect(moodFromEmotion("sad")).toBe("hit");
    expect(moodFromEmotion("happy")).toBe("triumphant");
  });
});

describe("hero roster unlocks", () => {
  beforeEach(() => useHeroRoster.getState().resetRoster());

  it("starts with only Kai, Jax and Kai-Jax unlocked", () => {
    expect(useHeroRoster.getState().unlockedHeroIds).toEqual([...DEFAULT_UNLOCKED_HEROES]);
    expect(useHeroRoster.getState().pendingUnlocks).toEqual([]);
  });

  it("unlocks a hero once, queues the celebration, and normalizes aliases", () => {
    const s = useHeroRoster.getState();
    expect(s.unlockHero("kaison")).toBe(true);
    expect(s.unlockHero("kaison")).toBe(false);
    expect(s.unlockHero("jax")).toBe(false); // already unlocked
    expect(useHeroRoster.getState().pendingUnlocks).toEqual(["kaison"]);
    expect(useHeroRoster.getState().isUnlocked("Kaison")).toBe(true);
  });

  it("ignores unknown ids", () => {
    expect(useHeroRoster.getState().unlockHero("not-a-hero")).toBe(false);
  });

  it("acknowledges queued unlocks in order", () => {
    useHeroRoster.getState().unlockHeroes(["mirek", "rikka"]);
    expect(useHeroRoster.getState().pendingUnlocks).toEqual(["mirek", "rikka"]);
    useHeroRoster.getState().acknowledgeUnlock();
    expect(useHeroRoster.getState().pendingUnlocks).toEqual(["rikka"]);
  });

  it("every mission unlock id resolves to a real hero, and all 13 locked heroes are earnable", () => {
    const earned = new Set<string>();
    for (const m of ALL_STORY_MISSIONS) for (const id of m.rewards.unlocks ?? []) {
      expect(HERO_IDENTITIES[normalizeHeroId(id)], `${m.id} unlocks ${id}`).toBeDefined();
      earned.add(normalizeHeroId(id));
    }
    const locked = HERO_ORDER.filter((id) => !(DEFAULT_UNLOCKED_HEROES as readonly string[]).includes(id));
    expect(locked).toHaveLength(13);
    for (const id of locked) expect(earned.has(id), `${id} is never unlocked by a mission`).toBe(true);
  });
});

describe("dialogue beats", () => {
  it("leaves short lines alone", () => {
    expect(splitIntoBeats("No turning back now.")).toEqual(["No turning back now."]);
  });

  it("breaks long speech into beats of at most two lines without losing words", () => {
    const text = "I come from a timeline where you won, and then kept winning, until there was no one left to tell you to stop. Do you understand what that costs?";
    const beats = splitIntoBeats(text);
    expect(beats.length).toBeGreaterThan(1);
    for (const b of beats) expect(b.length).toBeLessThanOrEqual(MAX_BEAT_CHARS);
    expect(beats.join(" ").replace(/\s+/g, " ")).toBe(text);
  });

  it("keeps speaker and emotion on every beat, and every authored line ends up short", () => {
    for (const m of ALL_STORY_MISSIONS) {
      const lines = [...m.introCutscene, ...m.outroCutscene];
      for (const beat of expandDialogue(lines)) {
        expect(beat.text.length, `${m.id}: "${beat.text}"`).toBeLessThanOrEqual(MAX_BEAT_CHARS);
        expect(beat.speaker).toBeTruthy();
      }
    }
    const [first, second] = expandDialogue([{ speaker: "Silver", emotion: "sad", side: "right", text: "A copy sees what you show it, nothing more. Show it who you are, not who you were afraid to be." }]);
    expect(first).toMatchObject({ speaker: "Silver", emotion: "sad", side: "right" });
    expect(second).toMatchObject({ speaker: "Silver", emotion: "sad", side: "right" });
  });
});

describe("unlock source hints", () => {
  it("points every locked hero at the mission that unlocks them", async () => {
    const { unlockSourceFor, unlockHintFor } = await import("./heroUnlockSource");
    expect(unlockSourceFor("kaison")?.id).toBe("story_act1_m1");
    expect(unlockSourceFor("Jaxon")?.id).toBe("story_act1_m3"); // alias of jax, who is already unlocked at start, so the reward is a no-op
    expect(unlockHintFor("mirek")).toBe("Complete Act 4 · Mission 17");
    expect(unlockHintFor("sable-nine")).toBe("Complete Act 6 · Mission 29");
    expect(unlockHintFor("kai")).toBe("Story reward");
  });
});
