import { describe, expect, it } from "vitest";
import {
  VERSUS_ROSTER,
  VERSUS_ROSTER_IDS,
  getVersusRosterEntry,
  isDefaultUnlockedVersusFighter,
} from "./versusRoster";

describe("Fighter Select V2 canonical roster", () => {
  it("contains the 23 locked-baseline roster candidates", () => {
    expect(VERSUS_ROSTER).toHaveLength(23);
  });

  it("has globally unique canonical fighter ids", () => {
    expect(new Set(VERSUS_ROSTER_IDS).size).toBe(VERSUS_ROSTER_IDS.length);
  });

  it("locks the five-character main lineage", () => {
    expect(VERSUS_ROSTER_IDS).toEqual(
      expect.arrayContaining(["boryn", "kai", "kai-jax", "jax", "borax"]),
    );
  });

  it("includes Vharok as the sixth core roster identity", () => {
    expect(getVersusRosterEntry("vharok")).toMatchObject({
      faction: "core",
      role: "ally",
      defaultUnlocked: true,
    });
  });

  it("ships the core and Fracture Circle identities unlocked by roster policy", () => {
    const unlocked = VERSUS_ROSTER.filter((entry) => entry.defaultUnlocked);
    expect(unlocked).toHaveLength(13);
    expect(unlocked.every((entry) => entry.faction === "core" || entry.faction === "fracture-circle")).toBe(true);
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

  it("retains locked visual-library provenance for every entry", () => {
    for (const entry of VERSUS_ROSTER) {
      expect(entry.sourceSheet).toMatch(/\.png$/);
      expect(entry.portraitSource).toBe(entry.sourceSheet);
    }
  });

  it("returns safe defaults for unknown ids", () => {
    expect(getVersusRosterEntry("not-a-real-fighter")).toBeNull();
    expect(isDefaultUnlockedVersusFighter("not-a-real-fighter")).toBe(false);
  });
});
