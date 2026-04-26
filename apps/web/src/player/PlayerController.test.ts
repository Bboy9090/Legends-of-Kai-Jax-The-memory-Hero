/**
 * Sprint 1 Validation — PlayerController WASD physics tests
 * Asserts WASD direction normalization, friction decay, arena clamp, speed setter.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as THREE from "three";

// PlayerController calls window.addEventListener in its constructor; mock window
// before importing the module under test (vitest env is node).
type Listener = (e: { key: string }) => void;
let listeners: { keydown: Listener[]; keyup: Listener[] };

beforeEach(() => {
  listeners = { keydown: [], keyup: [] };
  (globalThis as any).window = {
    addEventListener: (evt: "keydown" | "keyup", fn: Listener) => {
      listeners[evt].push(fn);
    },
    removeEventListener: () => {},
  };
});

afterEach(() => {
  delete (globalThis as any).window;
});

function press(key: string) {
  for (const fn of listeners.keydown) fn({ key });
}
function release(key: string) {
  for (const fn of listeners.keyup) fn({ key });
}

async function loadController() {
  // Dynamic import after window mock is installed.
  const mod = await import("./PlayerController");
  return mod.PlayerController;
}

describe("PlayerController — WASD physics", () => {
  it("starts stationary (no velocity, not moving)", async () => {
    const PC = await loadController();
    const pos = new THREE.Vector3(0, 0.9, 0);
    const pc = new PC(pos);
    expect(pc.isMoving()).toBe(false);
    expect(pc.getVelocity().lengthSq()).toBe(0);
  });

  it("W key drives the player in -Z direction over time", async () => {
    const PC = await loadController();
    const pos = new THREE.Vector3(0, 0.9, 0);
    const pc = new PC(pos);

    press("W"); // controller lowercases internally
    for (let i = 0; i < 20; i++) pc.update(1 / 60);

    expect(pc.getPosition().z).toBeLessThan(0);
    expect(pc.isMoving()).toBe(true);
  });

  it("diagonal W+D produces normalised speed (not sqrt(2)x faster)", async () => {
    const PC = await loadController();
    const pos = new THREE.Vector3(0, 0.9, 0);
    const pc = new PC(pos);
    pc.setMoveSpeed(4);

    press("w");
    press("d");
    // Run long enough to reach near-terminal velocity.
    for (let i = 0; i < 60; i++) pc.update(1 / 60);

    const speed = pc.getVelocity().length();
    // Should approach 4, NOT 4*sqrt(2) ≈ 5.66
    expect(speed).toBeLessThan(4.5);
    expect(speed).toBeGreaterThan(2.5);
  });

  it("friction decays velocity to ~0 after release", async () => {
    const PC = await loadController();
    const pos = new THREE.Vector3(0, 0.9, 0);
    const pc = new PC(pos);

    press("d");
    for (let i = 0; i < 30; i++) pc.update(1 / 60);
    release("d");
    for (let i = 0; i < 120; i++) pc.update(1 / 60);

    expect(pc.getVelocity().length()).toBeLessThan(0.05);
  });

  it("clamps to arena boundaries (cannot escape minX)", async () => {
    const PC = await loadController();
    const pos = new THREE.Vector3(0, 0.9, 0);
    const pc = new PC(pos);
    pc.setBoundaries(-5, 5, -5, 5);
    pc.setMoveSpeed(20);

    press("a"); // -X
    for (let i = 0; i < 200; i++) pc.update(1 / 60);

    expect(pc.getPosition().x).toBeGreaterThanOrEqual(-5);
  });

  it("keeps Y locked to ground level (0.9)", async () => {
    const PC = await loadController();
    const pos = new THREE.Vector3(0, 5, 0); // start above ground
    const pc = new PC(pos);

    pc.update(1 / 60);
    expect(pc.getPosition().y).toBe(0.9);
  });

  it("setMoveSpeed adjusts terminal velocity", async () => {
    const PC = await loadController();
    const pc1 = new PC(new THREE.Vector3(0, 0.9, 0));
    pc1.setMoveSpeed(2);
    press("d");
    for (let i = 0; i < 60; i++) pc1.update(1 / 60);
    const slowSpeed = pc1.getVelocity().length();
    release("d");

    const pc2 = new PC(new THREE.Vector3(0, 0.9, 0));
    pc2.setMoveSpeed(8);
    press("d");
    for (let i = 0; i < 60; i++) pc2.update(1 / 60);
    const fastSpeed = pc2.getVelocity().length();

    expect(fastSpeed).toBeGreaterThan(slowSpeed);
  });
});
