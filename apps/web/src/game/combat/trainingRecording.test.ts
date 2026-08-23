import { describe, expect, it } from "vitest";
import {
  getDueRecordedActions,
  getRecordingDuration,
  mapKeyCodeToDummyAction,
  sanitizeRecordedActions,
} from "./trainingRecording";

describe("training dummy recording", () => {
  it("maps combat keys to discrete dummy actions", () => {
    expect(mapKeyCodeToDummyAction("KeyJ")).toBe("punch");
    expect(mapKeyCodeToDummyAction("KeyK")).toBe("kick");
    expect(mapKeyCodeToDummyAction("KeyL")).toBe("special");
    expect(mapKeyCodeToDummyAction("Space")).toBe("jump");
    expect(mapKeyCodeToDummyAction("KeyT")).toBeNull();
  });

  it("sanitizes and sorts recorded action timing", () => {
    const safe = sanitizeRecordedActions([
      { atSec: 0.5, action: "kick" },
      { atSec: Number.NaN, action: "punch" },
      { atSec: 0, action: "jump" },
      { atSec: 0.2, action: "special" },
    ]);
    expect(safe.map((entry) => entry.action)).toEqual(["jump", "special", "kick"]);
    expect(getRecordingDuration(safe)).toBe(0.5);
  });

  it("replays zero-time events once when playback starts", () => {
    const actions = [
      { atSec: 0, action: "jump" as const },
      { atSec: 0.1, action: "punch" as const },
    ];
    expect(getDueRecordedActions(actions, -Number.EPSILON, 1 / 60).map((entry) => entry.action)).toEqual(["jump"]);
    expect(getDueRecordedActions(actions, 0.08, 0.12).map((entry) => entry.action)).toEqual(["punch"]);
  });
});
