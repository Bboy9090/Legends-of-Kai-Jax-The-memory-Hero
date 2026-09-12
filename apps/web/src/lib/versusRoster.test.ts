import { describe, expect, it } from "vitest";
import {
  VERSUS_ROSTER,
  VERSUS_ROSTER_IDS,
  getCombatProfileId,
  getVersusRosterEntry,
  isDefaultUnlockedVersusFighter,
} from "./versusRoster";

describe("Fighter Select V2 publication-safe roster", () => {
  it("contains only the 12 currently publication-supported combat identities", () => {
    expect(VERSUS_ROSTER).toHaveLength(12);
  });

  it("has globally unique canonical fighter ids", () => {
    expect(new Set(VERSUS_ROSTER_IDS).size).toBe(VERSUS_ROSTER_IDS.length);
  });

  it("contains the five core lineage identities", () => {
    expect(VERSUS_ROSTER_IDS).toEqual(
      expect.arrayContaining(["boryn", "kai", "kai-jax", "jax", "borax"]),
    );
  });

  it("keeps Kai-Jax story gated and uses an explicit legacy combat-profile bridge", () => {
    const kaiJax = getVersusRosterEntry("kai-jax");
    expect(kaiJax).toMatchObject({
      faction: "core",
      role: "hero",
      defaultUnlocked: false,
      combatProfileId: "kaijax",
    });
    expect(kaiJax && getCombatProfileId(kaiJax)).toBe("kaijax");
  });

  it("classifies Vharok by current Bloodward canon", () => {
    expect(getVersusRosterEntry("vharok")).toMatchObject({
      faction: "bloodward-antagonist",
      role: "villain",
      defaultUnlocked: false,
    });
  });

  it("defaults only Kai, Jax, Boryn, and Borax to Arena availability", () => {
    const unlocked = VERSUS_ROSTER.filter((entry) => entry.defaultUnlocked);
    expect(unlocked.map((entry) => entry.id)).toEqual(["kai", "jax", "boryn", "borax"]);
  });

  it("keeps the First Sabertooths present but locked pending gameplay and portrait integration", () => {
    const firstSabertooths = VERSUS_ROSTER.filter((entry) => entry.faction === "first-sabertooths");
    expect(firstSabertooths).toHaveLength(4);
    expect(firstSabertooths.every((entry) => !entry.defaultUnlocked)).toBe(true);
    expect(firstSabertooths.every((entry) => entry.sourceSheet.endsWith(".docx"))).toBe(true);
    expect(firstSabertooths.every((entry) => entry.portraitSource === "PENDING_CURRENT_CHARACTER_LOCK")).toBe(true);
  });

  it("keeps Ulgorr and Behemoth boss-class and locked", () => {
    expect(getVersusRosterEntry("ulgorr")).toMatchObject({
      faction: "ancient-antagonist",
      role: "boss",
      bossClass: true,
      defaultUnlocked: false,
    });
    expect(getVersusRosterEntry("behemoth")).toMatchObject({
      faction: "engineered-horror",
      role: "boss",
      bossClass: true,
      defaultUnlocked: false,
    });
  });

  it("does not auto-promote identities that the active Bloodward audit marks unverified", () => {
    const excludedUntilVerified = [
      "aurelion",
      "selene",
      "sable-nine",
      "widow-of-the-alley",
      "varkesh-the-grafted",
      "sybeth-the-choir-mother",
      "ironvein-overseer",
      "korthyx-prime",
      "pillar-twins",
      "hollow-architect",
      "fang-colossus",
      "erasure-choir",
    ];
    for (const id of excludedUntilVerified) {
      expect(VERSUS_ROSTER_IDS).not.toContain(id);
    }
  });

  it("retains explicit visual or publication provenance for every roster entry", () => {
    for (const entry of VERSUS_ROSTER) {
      expect(entry.sourceSheet.length).toBeGreaterThan(0);
      expect(entry.portraitSource.length).toBeGreaterThan(0);

      if (entry.portraitSource === "PENDING_CURRENT_CHARACTER_LOCK") {
        expect(entry.defaultUnlocked).toBe(false);
      }
    }
  });

  it("returns safe defaults for unknown ids", () => {
    expect(getVersusRosterEntry("not-a-real-fighter")).toBeNull();
    expect(isDefaultUnlockedVersusFighter("not-a-real-fighter")).toBe(false);
  });
});
