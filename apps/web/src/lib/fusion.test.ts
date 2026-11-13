import { describe, expect, it } from "vitest";
import { FUSION, addCharge, canFuse, damageMultiplier, endFusion, fusionStatus, initialFusion, isFused, speedMultiplier, stepFusion, toggleFusion, type FusionState } from "./fusion";

const full = (): FusionState => ({ ...initialFusion(), charge: 100 });

describe("fusion rules", () => {
  it("only Kai and Jax can fuse", () => {
    expect(canFuse("kai")).toBe(true);
    expect(canFuse("jax")).toBe(true);
    expect(canFuse("kai-jax")).toBe(false);
    expect(canFuse("boryn")).toBe(false);
    expect(fusionStatus(full(), true, "kai-jax")).toBe("unavailable");
  });

  it("is locked until the story unlocks it, and the gauge does not fill while locked", () => {
    expect(fusionStatus(initialFusion(), false, "kai")).toBe("locked");
    expect(addCharge(initialFusion(), 50, false).charge).toBe(0);
    expect(toggleFusion(full(), false, "kai").event).toBe("locked");
  });

  it("charges from hits and dodges, caps at 100, and needs a full gauge", () => {
    let s = initialFusion();
    s = addCharge(s, 7, true);
    expect(s.charge).toBe(7);
    expect(fusionStatus(s, true, "jax")).toBe("charging");
    expect(toggleFusion(s, true, "jax").event).toBe("need-charge");
    s = addCharge(s, 999, true);
    expect(s.charge).toBe(100);
    expect(fusionStatus(s, true, "jax")).toBe("ready");
  });

  it("fuses: spends the gauge, runs 22s, remembers the base hero, boosts damage and speed", () => {
    const { state, event } = toggleFusion(full(), true, "kai");
    expect(event).toBe("started");
    expect(state).toMatchObject({ charge: 0, timeLeft: FUSION.duration, baseFighterId: "kai" });
    expect(isFused(state)).toBe(true);
    expect(damageMultiplier(state)).toBe(1.4);
    expect(speedMultiplier(state)).toBe(1.18);
    expect(damageMultiplier(initialFusion())).toBe(1);
    expect(addCharge(state, 50, true)).toBe(state); // the form earns no gauge
  });

  it("expires on time, then runs a cooldown that blocks refusing even with a full gauge", () => {
    const fused = toggleFusion(full(), true, "jax").state;
    const mid = stepFusion(fused, 10);
    expect(mid.expired).toBe(false);
    expect(mid.state.timeLeft).toBeCloseTo(12);
    const done = stepFusion(mid.state, 12.5);
    expect(done.expired).toBe(true);
    expect(done.state).toMatchObject({ baseFighterId: null, cooldown: FUSION.cooldown });
    const refull = { ...done.state, charge: 100 };
    expect(fusionStatus(refull, true, "jax")).toBe("cooldown");
    expect(toggleFusion(refull, true, "jax").event).toBe("cooldown");
    const cooled = stepFusion(refull, FUSION.cooldown + 1).state;
    expect(cooled.cooldown).toBe(0);
    expect(toggleFusion(cooled, true, "jax").event).toBe("started");
  });

  it("can be cancelled early, which also starts the cooldown", () => {
    const fused = toggleFusion(full(), true, "kai").state;
    const { state, event } = toggleFusion(fused, true, "kai");
    expect(event).toBe("cancelled");
    expect(state).toMatchObject({ baseFighterId: null, cooldown: FUSION.cooldown });
    expect(endFusion(initialFusion()).cooldown).toBe(FUSION.cooldown);
  });

  it("ignores non-positive time steps", () => {
    const fused = toggleFusion(full(), true, "kai").state;
    expect(stepFusion(fused, 0).state).toBe(fused);
    expect(stepFusion(fused, -1).state).toBe(fused);
  });
});
