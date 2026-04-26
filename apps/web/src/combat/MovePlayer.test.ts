/**
 * Sprint 1 Validation — MovePlayer frame interpreter tests
 * Asserts attack timeline, hitstop, shield, grab bypass, facing.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as THREE from "three";
import { MovePlayer } from "./MovePlayer";
import { Hurtbox } from "./Hurtbox";
import type { MoveSpec } from "../types/MoveSpec";

beforeEach(() => {
  // Suppress noisy console.log from the kernel during tests.
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

function makeRig(opts: { hurtX?: number; fighterX?: number } = {}) {
  const scene = new THREE.Scene();
  const hurtbox = new Hurtbox(scene, 0.8, 1.6);
  hurtbox.setPosition(opts.hurtX ?? 2, 0.8, 0);
  hurtbox.mesh.updateMatrixWorld(true);
  const fighterPos = new THREE.Vector3(opts.fighterX ?? 0, 0.9, 0);
  const mp = new MovePlayer(scene, hurtbox, fighterPos);
  return { scene, hurtbox, fighterPos, mp };
}

function lightJab(): MoveSpec {
  return {
    id: "test_light_jab",
    startup: 3,
    active: 2,
    recovery: 8,
    shield_damage: 2,
    di_resist: 0.1,
    hitstopOnHit: 4,
    hitstopOnBlock: 2,
    hits: [
      {
        startF: 3,
        endF: 5,
        offX: 0.6,
        offY: 1.2,
        halfW: 0.3,
        halfH: 0.25,
        kbX: 1.5,
        kbY: 0.5,
        dmg: 4,
        usedOnce: false,
        isGrab: false,
      },
    ],
  };
}

function longRangeReach(dmg = 4, isGrab = false, kbX = 1.5): MoveSpec {
  // Hitbox tuned to overlap a hurtbox placed at x=2 when fighter is at x=0, facing right.
  return {
    id: isGrab ? "test_grab" : "test_reach",
    startup: 2,
    active: 2,
    recovery: 6,
    shield_damage: 4,
    di_resist: 0.1,
    hitstopOnHit: 4,
    hitstopOnBlock: 2,
    hits: [
      {
        startF: 2,
        endF: 3,
        offX: 2.0,
        offY: 1.2,
        halfW: 1.2,
        halfH: 0.6,
        kbX,
        kbY: 0.0,
        dmg,
        usedOnce: false,
        isGrab,
      },
    ],
  };
}

describe("MovePlayer — timeline & state", () => {
  it("isBusy() flips true on startMove and false after total frames", () => {
    const { mp } = makeRig({ hurtX: 50 }); // far away — no collisions
    const move = lightJab();
    expect(mp.isBusy()).toBe(false);

    mp.startMove(move);
    expect(mp.isBusy()).toBe(true);

    const total = move.startup + move.active + move.recovery; // 13
    for (let i = 0; i < total + 2; i++) mp.update();

    expect(mp.isBusy()).toBe(false);
    expect(mp.getCurrentFrame()).toBe(0);
  });

  it("warns and ignores second startMove while a move is in progress", () => {
    const warn = vi.spyOn(console, "warn");
    const { mp } = makeRig({ hurtX: 50 });
    const a = lightJab();
    const b = { ...lightJab(), id: "test_jab_b" } as MoveSpec;

    mp.startMove(a);
    mp.startMove(b); // should warn, not replace
    expect(warn).toHaveBeenCalled();
    expect(mp.currentMove?.id).toBe("test_light_jab");
  });

  it("facing flag flips when setFacing(false) called", () => {
    const { mp } = makeRig();
    expect(mp.facingRight).toBe(true);
    mp.setFacing(false);
    expect(mp.facingRight).toBe(false);
  });
});

describe("MovePlayer — hit resolution", () => {
  it("connects hit on overlapping hurtbox and applies damage + hitstop", () => {
    const { mp, hurtbox } = makeRig({ hurtX: 2, fighterX: 0 });
    const move = longRangeReach(8);
    const onHit = vi.fn();
    mp.setCallbacks({ onHit });
    mp.startMove(move);

    // Run forward enough frames for hitbox to spawn (frame becomes startF=2 on second update).
    mp.update(); // frame 1
    mp.update(); // frame 2 — hitbox active, collision check

    expect(onHit).toHaveBeenCalledTimes(1);
    expect(hurtbox.getHealth()).toBe(92); // 100 - 8
    // hitstopOnHit=4 frames, so player remains busy via hitstop branch
    expect(mp.isBusy()).toBe(true);
  });

  it("does NOT connect when hurtbox is far away", () => {
    const { mp, hurtbox } = makeRig({ hurtX: 50 });
    const onHit = vi.fn();
    mp.setCallbacks({ onHit });
    mp.startMove(longRangeReach(8));

    for (let i = 0; i < 12; i++) mp.update();

    expect(onHit).not.toHaveBeenCalled();
    expect(hurtbox.getHealth()).toBe(100);
  });

  it("hitstop pauses move progression while frames > 0", () => {
    const { mp } = makeRig({ hurtX: 2 });
    mp.startMove(longRangeReach(4));
    mp.update(); // f1
    mp.update(); // f2 — hit lands, hitstopFrames = 4
    expect(mp.hitstopFrames).toBeGreaterThan(0);
    const frameBefore = mp.getCurrentFrame();
    mp.update(); // hitstop tick, frame should NOT advance
    expect(mp.getCurrentFrame()).toBe(frameBefore);
  });
});

describe("MovePlayer — shield mechanics", () => {
  it("setShield(true) blocks a non-grab hit, applies shield_damage, fires onBlock", () => {
    const { mp, hurtbox } = makeRig({ hurtX: 2 });
    const onBlock = vi.fn();
    const onHit = vi.fn();
    mp.setCallbacks({ onBlock, onHit });
    mp.setShield(true);
    expect(mp.isShielding()).toBe(true);
    expect(mp.getShieldHP()).toBe(100);

    mp.startMove(longRangeReach(8));
    mp.update(); mp.update();

    expect(onBlock).toHaveBeenCalledTimes(1);
    expect(onHit).not.toHaveBeenCalled();
    expect(hurtbox.getHealth()).toBe(100); // no chip
    // Move's shield_damage = 4 (per longRangeReach)
    expect(mp.getShieldHP()).toBeLessThan(100);
  });

  it("GRAB bypasses shield and applies damage", () => {
    const { mp, hurtbox } = makeRig({ hurtX: 2 });
    const onHit = vi.fn();
    mp.setCallbacks({ onHit });
    mp.setShield(true);

    mp.startMove(longRangeReach(12, true /* isGrab */, 0));
    mp.update(); mp.update();

    expect(onHit).toHaveBeenCalledTimes(1);
    expect(hurtbox.getHealth()).toBe(88); // 100 - 12
  });

  it("shield breaks when shieldHP drops to 0 and the hit then connects", () => {
    const { mp, hurtbox } = makeRig({ hurtX: 2 });
    const onShieldBreak = vi.fn();
    const onHit = vi.fn();
    mp.setCallbacks({ onShieldBreak, onHit });

    // Drain shield artificially to 0 so the next blocked hit triggers the break path.
    mp.setShield(true);
    mp.shieldHP = 0;
    mp.startMove(longRangeReach(7));
    mp.update(); mp.update();

    expect(onShieldBreak).toHaveBeenCalledTimes(1);
    // Hit applied AFTER the break in the same collision per kernel logic.
    expect(onHit).toHaveBeenCalledTimes(1);
    expect(hurtbox.getHealth()).toBe(93);
  });
});

describe("MovePlayer — feedback callbacks", () => {
  it("onMoveStart fires once on startMove", () => {
    const { mp } = makeRig({ hurtX: 50 });
    const onMoveStart = vi.fn();
    mp.setCallbacks({ onMoveStart });
    mp.startMove(lightJab());
    expect(onMoveStart).toHaveBeenCalledTimes(1);
  });

  it("onActiveFrame fires for every active hitbox spawn", () => {
    const { mp } = makeRig({ hurtX: 50 });
    const onActiveFrame = vi.fn();
    mp.setCallbacks({ onActiveFrame });
    mp.startMove(lightJab());
    // jab active is 2 frames (startF=3, endF=5 inclusive in update loop -> 3 spawns)
    for (let i = 0; i < 6; i++) mp.update();
    expect(onActiveFrame.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
