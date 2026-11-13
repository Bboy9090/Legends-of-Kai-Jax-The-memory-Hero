import { describe, expect, it } from "vitest";
import { SAVE_ENVELOPE_VERSION, SAVE_SLOT_IDS, createEnvelope, deleteSlot, exportEnvelope, importEnvelope, listSlots, migrateEnvelope, readSlot, writeSlot, type SlotStorage } from "./saveSlots";

const memory = (): SlotStorage & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
};
const profile = { totalScore: 900, campaignCompletedNodes: [], completedStoryMissionIds: ["story_act1_m1", "story_act1_m2"], storyLoot: ["a", "a"], completedRoamDistrictIds: [], unlockedUpgrades: [], lastPlayedTitle: null };

describe("save slots", () => {
  it("has an autosave plus three manual slots", () => expect([...SAVE_SLOT_IDS]).toEqual(["autosave", "slot-1", "slot-2", "slot-3"]));

  it("round-trips a slot through storage and cleans the profile", () => {
    const s = memory();
    expect(writeSlot(createEnvelope("slot-1", profile, ["kai", "jax"], new Date("2026-01-02T03:04:05Z")), s)).toBe(true);
    const back = readSlot("slot-1", s)!;
    expect(back.version).toBe(SAVE_ENVELOPE_VERSION);
    expect(back.profile.totalScore).toBe(900);
    expect(back.profile.storyLoot).toEqual(["a"]);
    expect(back.label).toBe("2 missions cleared");
    expect(back.savedAt).toBe("2026-01-02T03:04:05.000Z");
    expect(listSlots(s)["slot-2"]).toBeNull();
    deleteSlot("slot-1", s);
    expect(readSlot("slot-1", s)).toBeNull();
  });

  it("migrates a version-less v1 profile and rejects garbage without throwing", () => {
    expect(migrateEnvelope(profile, "slot-2")?.profile.completedStoryMissionIds).toHaveLength(2);
    expect(migrateEnvelope("nope", "slot-2")).toBeNull();
    expect(migrateEnvelope({ unrelated: true }, "slot-2")).toBeNull();
    const s = memory();
    s.data.set("kaijax_slot_v2_slot-3", "{not json");
    expect(readSlot("slot-3", s)).toBeNull();
  });

  it("repairs bad fields instead of loading them", () => {
    const env = migrateEnvelope({ version: 2, savedAt: "garbage", profile: { totalScore: "lots", completedStoryMissionIds: 7 } }, "slot-1")!;
    expect(env.profile.totalScore).toBe(0);
    expect(env.profile.completedStoryMissionIds).toEqual([]);
    expect(env.savedAt).toBe(new Date(0).toISOString());
  });

  it("exports and imports into a different slot", () => {
    const json = exportEnvelope(createEnvelope("slot-1", profile, ["kai"]));
    const imported = importEnvelope(json, "slot-3")!;
    expect(imported.slotId).toBe("slot-3");
    expect(imported.profile.totalScore).toBe(900);
    expect(importEnvelope("not json", "slot-3")).toBeNull();
  });

  it("survives storage that throws", () => {
    const bad: SlotStorage = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("quota"); }, removeItem: () => { throw new Error("denied"); } };
    expect(writeSlot(createEnvelope("autosave", profile, []), bad)).toBe(false);
    expect(readSlot("autosave", bad)).toBeNull();
    expect(() => deleteSlot("autosave", bad)).not.toThrow();
  });
});
