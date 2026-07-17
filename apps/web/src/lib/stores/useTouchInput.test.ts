/**
 * useTouchInput is the sole bridge between on-screen touch controls
 * (AdventureTouchControls) and AdventurePlayerController's per-frame read
 * of joystick/attack state. These tests cover the press/release/reset
 * behavior that guards against "stuck" input.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useTouchInput } from "./useTouchInput";

beforeEach(() => {
  useTouchInput.setState({
    joystickX: 0,
    joystickY: 0,
    isJoystickActive: false,
    isTouchDevice: false,
    pendingAttacks: [],
  });
});

describe("useTouchInput", () => {
  it("starts at rest with no pending attacks", () => {
    const s = useTouchInput.getState();
    expect(s.joystickX).toBe(0);
    expect(s.joystickY).toBe(0);
    expect(s.isJoystickActive).toBe(false);
    expect(s.pendingAttacks).toEqual([]);
  });

  it("setJoystick updates position and activates the joystick", () => {
    useTouchInput.getState().setJoystick(0.5, -0.75, true);
    const s = useTouchInput.getState();
    expect(s.joystickX).toBe(0.5);
    expect(s.joystickY).toBe(-0.75);
    expect(s.isJoystickActive).toBe(true);
  });

  it("releaseJoystick resets position and clears active state", () => {
    useTouchInput.getState().setJoystick(1, 1, true);
    useTouchInput.getState().releaseJoystick();
    const s = useTouchInput.getState();
    expect(s.joystickX).toBe(0);
    expect(s.joystickY).toBe(0);
    expect(s.isJoystickActive).toBe(false);
  });

  it("queueAttack appends without dropping previously queued actions", () => {
    useTouchInput.getState().queueAttack("attack");
    useTouchInput.getState().queueAttack("dodge");
    expect(useTouchInput.getState().pendingAttacks).toEqual(["attack", "dodge"]);
  });

  it("consumeAttacks drains the queue exactly once (single frame's worth)", () => {
    useTouchInput.getState().queueAttack("heavy");
    useTouchInput.getState().queueAttack("skill");

    const first = useTouchInput.getState().consumeAttacks();
    expect(first).toEqual(["heavy", "skill"]);
    expect(useTouchInput.getState().pendingAttacks).toEqual([]);

    // A second consume in the same "frame" with nothing new queued must
    // come back empty, not replay stale actions.
    const second = useTouchInput.getState().consumeAttacks();
    expect(second).toEqual([]);
  });

  it("consumeAttacks on an empty queue returns an empty array and is a no-op", () => {
    const result = useTouchInput.getState().consumeAttacks();
    expect(result).toEqual([]);
    expect(useTouchInput.getState().pendingAttacks).toEqual([]);
  });

  it("attacks queued after a release are unaffected by the release", () => {
    useTouchInput.getState().setJoystick(0.2, 0.2, true);
    useTouchInput.getState().releaseJoystick();
    useTouchInput.getState().queueAttack("attack");
    const s = useTouchInput.getState();
    expect(s.isJoystickActive).toBe(false);
    expect(s.pendingAttacks).toEqual(["attack"]);
  });

  it("setIsTouchDevice toggles independently of joystick/attack state", () => {
    useTouchInput.getState().setIsTouchDevice(true);
    expect(useTouchInput.getState().isTouchDevice).toBe(true);
    useTouchInput.getState().setJoystick(0.3, -0.3, true);
    expect(useTouchInput.getState().isTouchDevice).toBe(true);
  });
});
