import { describe, expect, it } from "vitest";
import {
  buildTrainingTelemetry,
  resolveTrainingMove,
  sanitizeInputHistory,
  type TrainingInputEvent,
} from "./trainingLab";

describe("training lab telemetry", () => {
  it("resolves startup, active, recovery, and complete phases from canonical frame data", () => {
    expect(resolveTrainingMove("punch", 0, 0)?.phase).toBe("startup");
    expect(resolveTrainingMove("punch", 0, 0.11)?.phase).toBe("active");
    expect(resolveTrainingMove("punch", 0, 0.2)?.phase).toBe("recovery");
    expect(resolveTrainingMove("punch", 0, 1)?.phase).toBe("complete");
  });

  it("uses combo step to select the correct light chain move", () => {
    expect(resolveTrainingMove("punch", 0, 0)?.key).toBe("light1");
    expect(resolveTrainingMove("punch", 1, 0)?.key).toBe("light2");
    expect(resolveTrainingMove("punch", 2, 0)?.key).toBe("light3");
  });

  it("sanitizes corrupt numeric telemetry instead of leaking NaN into the HUD", () => {
    const telemetry = buildTrainingTelemetry({
      playerAttackType: null,
      playerAttackElapsed: Number.NaN,
      playerComboStep: 0,
      comboCount: Number.NaN,
      comboDamage: -3,
      playerHitStunTimer: Number.NaN,
      opponentHitStunTimer: -1,
      playerDodgeTimer: 0,
      guardBreakTimer: 0,
      playerBlockParryWindow: 0,
      playerStamina: Number.POSITIVE_INFINITY,
      maxPlayerStamina: 0,
      playerX: Number.NaN,
      opponentX: 3,
      playerVelocityX: Number.NaN,
      playerVelocityY: 2,
    });

    expect(telemetry.comboCount).toBe(0);
    expect(telemetry.comboDamage).toBe(0);
    expect(telemetry.playerHitStunTimer).toBe(0);
    expect(telemetry.opponentHitStunTimer).toBe(0);
    expect(telemetry.staminaRatio).toBe(0);
    expect(telemetry.distance).toBe(3);
    expect(telemetry.velocityX).toBe(0);
  });

  it("caps input history and returns defensive copies", () => {
    const events: TrainingInputEvent[] = Array.from({ length: 20 }, (_, index) => ({
      id: index,
      code: `Key${index}`,
      pressed: index % 2 === 0,
      atMs: index * 10,
    }));

    const history = sanitizeInputHistory(events, 5);
    expect(history).toHaveLength(5);
    expect(history[0].id).toBe(15);
    expect(history).not.toBe(events);
    expect(history[0]).not.toBe(events[15]);
  });
});
