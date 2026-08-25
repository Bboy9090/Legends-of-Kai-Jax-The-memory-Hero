import { describe, expect, it } from "vitest";
import {
  VERSUS_ROSTER,
  VERSUS_ROSTER_IDS,
  getVersusRosterEntry,
  isDefaultUnlockedVersusFighter,
} from "./versusRoster";

describe("Fighter Select V2 canonical roster", () => {
  it("contains the 27-entry current canonical versus roster", () => {
    expect(VERSUS_ROSTER).toHaveLength(27);
  });

  it("has globally unique canonical fighter ids", () => {
    expect(new Set(VERSUS_ROSTER_IDS).size).toBe(VERSUS_ROSTER_IDS.length);
  });

  it("locks the five-character main lineage", () => {
    expect(VERSUS_ROSTER_IDS).toEqual(
      expect.arrayContaining(["boryn", "kai", "kai-jax", "jax", "borax"]),
    );
  });

  it("classifies Vharok by current Bloodward canon", () => {
    expect(getVersusRosterEntry("vharok")).toMatchObject({
      faction: "bloodward-antagonist",
      role: "villain",
      defaultUnlocked: false,
    });
  });

  it("ships the current core heroes/allies and Fracture Circle unlocked by roster policy", () => {
    const unlocked = VERSUS_ROSTER.filter((entry) => entry.defaultUnlocked);
    expect(unlocked).toHaveLength(12);
    expect(unlocked.every((entry) => entry.faction === "core" || entry.faction === "fracture-circle")).toBe(true);
  });

  it("keeps the First Sabertooths canonically present but locked pending gameplay/portrait integration", () => {
    const firstSabertooths = VERSUS_ROSTER.filter((entry) => entry.faction === "first-sabertooths");
    expect(firstSabertooths).toHaveLength(4);
    expect(firstSabertooths.every((entry) => !entry.defaultUnlocked)).toBe(true);
    expect(firstSabertooths.every((entry) => entry.sourceSheet.endsWith(".docx"))).toBe(true);
    expect(firstSabertooths.every((entry) => entry.portraitSource === "PENDING_CURRENT_CHARACTER_LOCK")).toBe(true);
  });

  it("keeps Covenant identities locked by default", () => {
    const covenant = VERSUS_ROSTER.filter((entry) => entry.faction === "covenant");
    expect(covenant).toHaveLength(5);
    expect(covenant.every((entry) => !entry.defaultUnlocked)).toBe(true);
  });

  it("keeps engineered horrors boss-class and locked by default", () => {
    const horrors = VERSUS_ROSTER.filter((entry) => entry.faction === "engineered-horror");
    expect(horrors).toHaveLength(5);
    expect(horrors.every((entry) => entry.role === "boss" && entry.bossClass && !entry.defaultUnlocked)).toBe(true);
  });

  it("retains explicit visual or publication provenance for every roster entry", () => {
    for (const entry of VERSUS_ROSTER) {
      expect(entry.sourceSheet.length).toBeGreaterThan(0);
      expect(entry.portraitSource.length).toBeGreaterThan(0);

      if (entry.faction !== "first-sabertooths") {
        expect(entry.sourceSheet).toMatch(/\.png$/);
        expect(entry.portraitSource).toBe(entry.sourceSheet);
      }
    }
  });

  it("returns safe defaults for unknown ids", () => {
    expect(getVersusRosterEntry("not-a-real-fighter")).toBeNull();
    expect(isDefaultUnlockedVersusFighter("not-a-real-fighter")).toBe(false);
  });
});
