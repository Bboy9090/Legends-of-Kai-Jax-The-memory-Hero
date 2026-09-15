import { describe, expect, it } from "vitest";
import {
  canTriggerKaiJaxFusion,
  isKaiJaxFusionParticipant,
} from "./fusionPolicy";

describe("Kai-Jax canon fusion policy", () => {
  it("recognizes only Kai and Jax as base-fusion participants", () => {
    expect(isKaiJaxFusionParticipant("kai")).toBe(true);
    expect(isKaiJaxFusionParticipant("jax")).toBe(true);
    expect(isKaiJaxFusionParticipant("jaxon")).toBe(false);
    expect(isKaiJaxFusionParticipant("kaison")).toBe(false);
    expect(isKaiJaxFusionParticipant("kai-jax")).toBe(false);
  });

  it("requires story unlock and full synchronization", () => {
    const base = {
      fighterId: "kai",
      fusionUnlocked: true,
      synergy: 100,
      maxSynergy: 100,
      transformed: false,
      battlePhase: "fighting" as const,
    };

    expect(canTriggerKaiJaxFusion(base)).toBe(true);
    expect(canTriggerKaiJaxFusion({ ...base, fusionUnlocked: false })).toBe(false);
    expect(canTriggerKaiJaxFusion({ ...base, synergy: 99 })).toBe(false);
  });

  it("rejects legacy prototype lineage and non-fighting states", () => {
    const base = {
      fusionUnlocked: true,
      synergy: 100,
      maxSynergy: 100,
      transformed: false,
      battlePhase: "fighting" as const,
    };

    expect(canTriggerKaiJaxFusion({ ...base, fighterId: "jaxon" })).toBe(false);
    expect(canTriggerKaiJaxFusion({ ...base, fighterId: "kaison" })).toBe(false);
    expect(canTriggerKaiJaxFusion({ ...base, fighterId: "jax", battlePhase: "paused" })).toBe(false);
    expect(canTriggerKaiJaxFusion({ ...base, fighterId: "jax", transformed: true })).toBe(false);
  });
});
