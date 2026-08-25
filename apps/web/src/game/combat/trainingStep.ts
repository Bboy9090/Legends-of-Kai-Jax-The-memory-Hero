export const TRAINING_FIXED_STEP_SEC = 1 / 60;

export interface TrainingStepInput {
  rawDelta: number;
  timeScale: number;
  simulationPaused: boolean;
  stepEpoch: number;
  lastConsumedStepEpoch: number;
}

export interface TrainingStepResolution {
  delta: number;
  consumedStepEpoch: number;
  stepped: boolean;
}

function finiteNonNegative(value: number, fallback: number): number {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

/**
 * Resolves one authoritative simulation delta for a combat consumer.
 *
 * While running, raw frame delta is scaled normally. While training-paused,
 * consumers remain frozen until `stepEpoch` advances; each consumer can then
 * process exactly one 60 Hz step and remember the consumed epoch locally.
 * This avoids callback-order coupling between BattleScene, player control and AI.
 */
export function resolveTrainingStep(input: TrainingStepInput): TrainingStepResolution {
  const stepEpoch = Math.max(0, Math.floor(finiteNonNegative(input.stepEpoch, 0)));
  const lastConsumedStepEpoch = Math.max(
    0,
    Math.floor(finiteNonNegative(input.lastConsumedStepEpoch, 0))
  );

  if (!input.simulationPaused) {
    const rawDelta = finiteNonNegative(input.rawDelta, 0);
    const timeScale = finiteNonNegative(input.timeScale, 1);
    return {
      delta: rawDelta * timeScale,
      consumedStepEpoch: stepEpoch,
      stepped: false,
    };
  }

  if (stepEpoch > lastConsumedStepEpoch) {
    return {
      delta: TRAINING_FIXED_STEP_SEC,
      consumedStepEpoch: stepEpoch,
      stepped: true,
    };
  }

  return {
    delta: 0,
    consumedStepEpoch: lastConsumedStepEpoch,
    stepped: false,
  };
}
