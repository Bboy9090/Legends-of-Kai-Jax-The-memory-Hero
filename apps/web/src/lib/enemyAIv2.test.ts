import { describe, expect, it } from "vitest";
import {
  BEHAVIOR_PROFILES,
  BOSS_AI_PROFILES,
  getAIDamageMultiplier,
  getBossPhase,
  makeAIDecision,
  shouldCoordinate,
} from "./enemyAIv2";

function sequenceRandom(values: number[]): () => number {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)] ?? 0.5;
}

describe("enemyAIv2 pure decision rules", () => {
  it("returns wait while dead or stunned", () => {
    const profile = BEHAVIOR_PROFILES.grunt.normal;
    expect(makeAIDecision(profile, 100, 100, 2, "dead", true, () => 0.1).action).toBe("wait");
    expect(makeAIDecision(profile, 100, 100, 2, "stun", true, () => 0.1).action).toBe("wait");
  });

  it("is reproducible when supplied the same random stream", () => {
    const profile = BEHAVIOR_PROFILES.elite.hard;
    const a = makeAIDecision(profile, 55, 100, 3, "chase", true, sequenceRandom([0.2, 0.8]));
    const b = makeAIDecision(profile, 55, 100, 3, "chase", true, sequenceRandom([0.2, 0.8]));
    expect(a).toEqual(b);
  });

  it("sanitizes invalid health and distance inputs", () => {
    const decision = makeAIDecision(
      BEHAVIOR_PROFILES.grunt.easy,
      Number.NaN,
      0,
      Number.NaN,
      "idle",
      true,
      () => Number.NaN
    );
    expect(Number.isFinite(decision.priority)).toBe(true);
    expect(decision.confidence).toBeGreaterThanOrEqual(0);
    expect(decision.confidence).toBeLessThanOrEqual(1);
  });

  it("selects the deepest crossed boss phase instead of always phase one", () => {
    const rift = BOSS_AI_PROFILES["rift-general"];
    expect(getBossPhase(rift, 95)?.id).toBe("phase_1");
    expect(getBossPhase(rift, 65)?.id).toBe("phase_2");
    expect(getBossPhase(rift, 25)?.id).toBe("phase_3");
  });

  it("handles phase boundaries exactly", () => {
    const stalker = BOSS_AI_PROFILES["void-stalker"];
    expect(getBossPhase(stalker, 50)?.id).toBe("phase_2");
    expect(getBossPhase(stalker, 50.01)?.id).toBe("phase_1");
  });

  it("keeps difficulty damage scaling monotonic", () => {
    const values = ["easy", "normal", "hard", "legendary"].map((difficulty) =>
      getAIDamageMultiplier(difficulty as "easy" | "normal" | "hard" | "legendary")
    );
    expect(values).toEqual([...values].sort((a, b) => a - b));
  });

  it("makes coordination deterministic with an injected random source", () => {
    const profile = BEHAVIOR_PROFILES.attacker.normal;
    expect(shouldCoordinate(profile, 3, 25, 100, () => 0)).toBe(true);
    expect(shouldCoordinate(profile, 0, 100, 100, () => 0.999999)).toBe(false);
  });
});
