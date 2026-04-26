/**
 * cinematicFlow — progression logic tests.
 */
import { describe, it, expect } from "vitest";
import {
  INITIAL_FLOW,
  advanceFlow,
  onCombatComplete,
  skipCurrentBeat,
  getCurrentBeat,
  getCurrentEncounter,
} from "./cinematicFlow";
import { ASHBLOCK_SCRIPTS } from "../../../game/world/zones/AshblockHeights/AshblockHeightsScript";

describe("cinematicFlow", () => {
  it("starts at encounter 0, beat 0, playing_beat", () => {
    expect(INITIAL_FLOW).toEqual({ encounterIndex: 0, beatIndex: 0, phase: "playing_beat" });
  });

  it("advanceFlow walks beat 0 → 1 → 2 within an encounter", () => {
    let s = INITIAL_FLOW;
    s = advanceFlow(s, ASHBLOCK_SCRIPTS);
    expect(s.beatIndex).toBe(1);
    s = advanceFlow(s, ASHBLOCK_SCRIPTS);
    expect(s.beatIndex).toBe(2);
  });

  it("advanceFlow reaches escalation (beat 3) and flips phase to combat", () => {
    let s = INITIAL_FLOW;
    for (let i = 0; i < 3; i++) s = advanceFlow(s, ASHBLOCK_SCRIPTS);
    expect(s.beatIndex).toBe(3);
    expect(s.phase).toBe("combat");
  });

  it("onCombatComplete moves combat → payoff (beat 4)", () => {
    let s = { encounterIndex: 0, beatIndex: 3, phase: "combat" as const };
    s = onCombatComplete(s);
    expect(s.beatIndex).toBe(4);
    expect(s.phase).toBe("payoff");
  });

  it("advanceFlow from payoff jumps to next encounter (beat 0, playing_beat)", () => {
    let s = { encounterIndex: 0, beatIndex: 4, phase: "payoff" as const };
    s = advanceFlow(s, ASHBLOCK_SCRIPTS);
    expect(s).toEqual({ encounterIndex: 1, beatIndex: 0, phase: "playing_beat" });
  });

  it("advanceFlow from final payoff transitions to done", () => {
    const last = ASHBLOCK_SCRIPTS.length - 1;
    let s = { encounterIndex: last, beatIndex: 4, phase: "payoff" as const };
    s = advanceFlow(s, ASHBLOCK_SCRIPTS);
    expect(s.phase).toBe("done");
  });

  it("skip during playing_beat jumps to combat without losing encounter context", () => {
    let s = { encounterIndex: 1, beatIndex: 0, phase: "playing_beat" as const };
    s = skipCurrentBeat(s, ASHBLOCK_SCRIPTS);
    expect(s).toEqual({ encounterIndex: 1, beatIndex: 3, phase: "combat" });
  });

  it("skip during payoff advances to next encounter", () => {
    let s = { encounterIndex: 0, beatIndex: 4, phase: "payoff" as const };
    s = skipCurrentBeat(s, ASHBLOCK_SCRIPTS);
    expect(s.encounterIndex).toBe(1);
    expect(s.phase).toBe("playing_beat");
  });

  it("getCurrentBeat returns null while combat is live", () => {
    const s = { encounterIndex: 0, beatIndex: 3, phase: "combat" as const };
    expect(getCurrentBeat(s, ASHBLOCK_SCRIPTS)).toBeNull();
  });

  it("getCurrentBeat returns the right beat for (enc=2, beat=4) — final payoff", () => {
    const s = { encounterIndex: 2, beatIndex: 4, phase: "payoff" as const };
    const beat = getCurrentBeat(s, ASHBLOCK_SCRIPTS);
    expect(beat?.step).toBe("payoff");
    expect(beat?.lines.some((l) => l.speaker === "kaison" && /remember/i.test(l.text))).toBe(true);
  });

  it("getCurrentEncounter follows the encounter index", () => {
    expect(getCurrentEncounter(INITIAL_FLOW, ASHBLOCK_SCRIPTS)?.encounterId).toBe("d1-e1");
    expect(
      getCurrentEncounter({ encounterIndex: 2, beatIndex: 0, phase: "playing_beat" }, ASHBLOCK_SCRIPTS)
        ?.encounterId,
    ).toBe("d1-e3");
  });

  it("advanceFlow on done state is idempotent", () => {
    const done = { encounterIndex: 99, beatIndex: 0, phase: "done" as const };
    expect(advanceFlow(done, ASHBLOCK_SCRIPTS)).toEqual(done);
  });
});
