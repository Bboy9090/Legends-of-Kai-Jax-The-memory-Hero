/**
 * AshblockHeightsScript — canon validation tests
 * Locks down voice rules so future edits cannot ship drift.
 */
import { describe, it, expect } from "vitest";
import {
  ASHBLOCK_SCRIPTS,
  validateAshblockScript,
  getScriptForEncounter,
  SPEAKER_COLORS,
  CanonViolationError,
  type EncounterScript,
  type NarrativeBeat,
  __TEST_INTERNALS,
} from "./AshblockHeightsScript";
import { ASHBLOCK_ENCOUNTERS } from "./AshblockHeightsEncounters";

describe("AshblockHeightsScript — structural canon", () => {
  it("validateAshblockScript() succeeds on the shipped script (eager + explicit)", () => {
    const summary = validateAshblockScript();
    expect(summary.encounters).toBe(3);
    // 3 encounters * 5 beats = 15
    expect(summary.beats).toBe(15);
    expect(summary.lines).toBeGreaterThanOrEqual(15);
  });

  it("script encounter ids match AshblockHeightsEncounters 1:1", () => {
    const encIds = ASHBLOCK_ENCOUNTERS.map((e) => e.id).sort();
    const scriptIds = ASHBLOCK_SCRIPTS.map((s) => s.encounterId).sort();
    expect(scriptIds).toEqual(encIds);
  });

  it("every encounter has the 5 required beats in order", () => {
    const expected = ["scene_entry", "objective", "conflict", "escalation", "payoff"];
    for (const script of ASHBLOCK_SCRIPTS) {
      expect(script.beats.map((b) => b.step)).toEqual(expected);
    }
  });

  it("every beat has at least one non-empty line", () => {
    for (const script of ASHBLOCK_SCRIPTS) {
      for (const beat of script.beats) {
        expect(beat.lines.length).toBeGreaterThan(0);
        for (const line of beat.lines) {
          expect(line.text.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("getScriptForEncounter returns the right script for a known id", () => {
    const s = getScriptForEncounter("d1-e1");
    expect(s).toBeDefined();
    expect(s!.title).toMatch(/Street Sweep/);
  });

  it("getScriptForEncounter returns undefined for an unknown id", () => {
    expect(getScriptForEncounter("nope")).toBeUndefined();
  });
});

describe("AshblockHeightsScript — speaker voice canon", () => {
  it("Boryn never speaks cold/dismissive phrases", () => {
    const forbidden = __TEST_INTERNALS.FORBIDDEN_PHRASES.boryn ?? [];
    const borynLines = ASHBLOCK_SCRIPTS
      .flatMap((s) => s.beats)
      .flatMap((b) => b.lines)
      .filter((l) => l.speaker === "boryn");
    expect(borynLines.length).toBeGreaterThan(0);
    for (const line of borynLines) {
      const lower = line.text.toLowerCase();
      for (const f of forbidden) {
        expect(lower).not.toContain(f.toLowerCase());
      }
    }
  });

  it("Boryn lines hit the warm-father markers (kid / stay / block / remember)", () => {
    const borynText = ASHBLOCK_SCRIPTS
      .flatMap((s) => s.beats)
      .flatMap((b) => b.lines)
      .filter((l) => l.speaker === "boryn")
      .map((l) => l.text.toLowerCase())
      .join(" | ");
    expect(borynText).toMatch(/kid|stay|block|remember|breathe|tight/);
  });

  it("Kaison voice is observant Memory — no bravado, no command", () => {
    const forbidden = __TEST_INTERNALS.FORBIDDEN_PHRASES.kaison ?? [];
    const kLines = ASHBLOCK_SCRIPTS
      .flatMap((s) => s.beats)
      .flatMap((b) => b.lines)
      .filter((l) => l.speaker === "kaison");
    for (const line of kLines) {
      const lower = line.text.toLowerCase();
      for (const f of forbidden) expect(lower).not.toContain(f.toLowerCase());
    }
  });

  it("Fang scouts never use lore/philosophy words", () => {
    const forbidden = __TEST_INTERNALS.FORBIDDEN_PHRASES.fang_scout ?? [];
    const sLines = ASHBLOCK_SCRIPTS
      .flatMap((s) => s.beats)
      .flatMap((b) => b.lines)
      .filter((l) => l.speaker === "fang_scout");
    expect(sLines.length).toBeGreaterThan(0);
    for (const line of sLines) {
      const lower = line.text.toLowerCase();
      for (const f of forbidden) expect(lower).not.toContain(f.toLowerCase());
    }
  });

  it("speaker → tone alignment is enforced (boryn=warm, kaison=memory, fang=hungry, narrator=narrative)", () => {
    const map = __TEST_INTERNALS.SPEAKER_TO_TONE;
    for (const script of ASHBLOCK_SCRIPTS) {
      for (const beat of script.beats) {
        for (const line of beat.lines) {
          expect(line.tone).toBe(map[line.speaker]);
        }
      }
    }
  });

  it("Boryx is reserved for Book 2 — must NOT appear in Ashblock script", () => {
    const lines = ASHBLOCK_SCRIPTS
      .flatMap((s) => s.beats)
      .flatMap((b) => b.lines);
    expect(lines.some((l) => l.speaker === "boryx")).toBe(false);
  });

  it("Block captain (sub-boss) only appears in encounter d1-e3", () => {
    for (const script of ASHBLOCK_SCRIPTS) {
      const hasCaptain = script.beats.some((b) =>
        b.lines.some((l) => l.speaker === "block_captain"),
      );
      if (script.encounterId === "d1-e3") {
        expect(hasCaptain).toBe(true);
      } else {
        expect(hasCaptain).toBe(false);
      }
    }
  });

  it("escalation beat in every encounter is delivered by Boryn (warm father gives the go-cue)", () => {
    for (const script of ASHBLOCK_SCRIPTS) {
      const escalation = script.beats.find((b) => b.step === "escalation") as NarrativeBeat;
      expect(escalation.lines[0].speaker).toBe("boryn");
    }
  });

  it("payoff beat in every encounter ends on warm/memory tone (no Fang or captain gloating)", () => {
    for (const script of ASHBLOCK_SCRIPTS) {
      const payoff = script.beats.find((b) => b.step === "payoff") as NarrativeBeat;
      for (const line of payoff.lines) {
        expect(["warm", "memory", "narrative"]).toContain(line.tone);
      }
    }
  });
});

describe("AshblockHeightsScript — validator failure modes", () => {
  function clone(s: EncounterScript): EncounterScript {
    return JSON.parse(JSON.stringify(s));
  }

  it("throws when speaker tone is wrong", () => {
    const broken = clone(ASHBLOCK_SCRIPTS[0]);
    broken.beats[1].lines[0].tone = "cold"; // Boryn assigned cold tone — illegal
    expect(() => validateAshblockScript([broken, ASHBLOCK_SCRIPTS[1], ASHBLOCK_SCRIPTS[2]])).toThrow(
      CanonViolationError,
    );
  });

  it("throws when Boryn line contains a forbidden phrase", () => {
    const broken = clone(ASHBLOCK_SCRIPTS[0]);
    broken.beats[1].lines[0].text = "Useless. Pathetic. Try again.";
    expect(() => validateAshblockScript([broken, ASHBLOCK_SCRIPTS[1], ASHBLOCK_SCRIPTS[2]])).toThrow(
      CanonViolationError,
    );
  });

  it("throws when beat order is shuffled", () => {
    const broken = clone(ASHBLOCK_SCRIPTS[0]);
    [broken.beats[0], broken.beats[2]] = [broken.beats[2], broken.beats[0]];
    expect(() => validateAshblockScript([broken, ASHBLOCK_SCRIPTS[1], ASHBLOCK_SCRIPTS[2]])).toThrow(
      CanonViolationError,
    );
  });

  it("throws when encounter id list does not match real encounters", () => {
    const ghost = clone(ASHBLOCK_SCRIPTS[0]);
    ghost.encounterId = "ghost-encounter";
    expect(() => validateAshblockScript([ghost, ASHBLOCK_SCRIPTS[1], ASHBLOCK_SCRIPTS[2]])).toThrow(
      CanonViolationError,
    );
  });

  it("throws when a line is empty", () => {
    const broken = clone(ASHBLOCK_SCRIPTS[0]);
    broken.beats[0].lines[0].text = "   ";
    expect(() => validateAshblockScript([broken, ASHBLOCK_SCRIPTS[1], ASHBLOCK_SCRIPTS[2]])).toThrow(
      CanonViolationError,
    );
  });

  it("throws on unknown speaker", () => {
    const broken = clone(ASHBLOCK_SCRIPTS[0]);
    // @ts-expect-error force invalid speaker
    broken.beats[0].lines[0].speaker = "the_architect";
    expect(() => validateAshblockScript([broken, ASHBLOCK_SCRIPTS[1], ASHBLOCK_SCRIPTS[2]])).toThrow(
      CanonViolationError,
    );
  });
});

describe("AshblockHeightsScript — UI palette canon", () => {
  it("Boryn portrait is Pyraxis orange (sacrifice)", () => {
    expect(SPEAKER_COLORS.boryn.hex).toBe("#ff8a3d");
  });
  it("Boryx portrait is Thryxen cyan (law) — reserved", () => {
    expect(SPEAKER_COLORS.boryx.hex).toBe("#3dd6ff");
  });
  it("Kaison portrait is Myrr'Kai purple (memory)", () => {
    expect(SPEAKER_COLORS.kaison.hex).toBe("#b76dff");
  });
});
