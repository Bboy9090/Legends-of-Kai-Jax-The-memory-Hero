import { describe, expect, it } from "vitest";
import { TRAINING_FIXED_STEP_SEC, resolveTrainingStep } from "./trainingStep";

describe("training fixed-step resolver", () => {
  it("scales normal simulation delta by timeScale", () => {
    expect(resolveTrainingStep({
      rawDelta: 0.02,
      timeScale: 0.5,
      simulationPaused: false,
      stepEpoch: 3,
      lastConsumedStepEpoch: 2,
    })).toEqual({ delta: 0.01, consumedStepEpoch: 3, stepped: false });
  });

  it("freezes paused simulation until a new step epoch arrives", () => {
    expect(resolveTrainingStep({
      rawDelta: 0.02,
      timeScale: 1,
      simulationPaused: true,
      stepEpoch: 4,
      lastConsumedStepEpoch: 4,
    }).delta).toBe(0);
  });

  it("consumes one exact 60 Hz step for a new epoch", () => {
    const result = resolveTrainingStep({
      rawDelta: 0.5,
      timeScale: 0.1,
      simulationPaused: true,
      stepEpoch: 5,
      lastConsumedStepEpoch: 4,
    });
    expect(result.delta).toBe(TRAINING_FIXED_STEP_SEC);
    expect(result.consumedStepEpoch).toBe(5);
    expect(result.stepped).toBe(true);
  });

  it("sanitizes invalid runtime inputs", () => {
    expect(resolveTrainingStep({
      rawDelta: Number.NaN,
      timeScale: Number.NaN,
      simulationPaused: false,
      stepEpoch: Number.NaN,
      lastConsumedStepEpoch: -2,
    })).toEqual({ delta: 0, consumedStepEpoch: 0, stepped: false });
  });
});
