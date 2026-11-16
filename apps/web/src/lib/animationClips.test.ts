import { describe, expect, it } from "vitest";
import { RIGGED_CLIPS, isRiggedClipSet, selectClip, type ClipRequest } from "./animationClips";

const rigged = [...RIGGED_CLIPS];
const base: ClipRequest = { available: rigged, isAttacking: false, attackType: null, isMoving: false, isRunning: false };
const pick = (o: Partial<ClipRequest>) => selectClip({ ...base, ...o })?.clip;

describe("rigged clip selection", () => {
  it("recognises the rigged set and not legacy clips", () => {
    expect(isRiggedClipSet(rigged)).toBe(true);
    expect(isRiggedClipSet(["Armature|walking_man|baselayer"])).toBe(false);
  });

  it("stands in `idle`, never in `breathing` (which sorts before it)", () => {
    expect(pick({})).toBe("idle");
    expect(pick({ available: ["breathing", "idle", "walk", "run", "attack_1"] })).toBe("idle");
  });

  it("walks, and runs when running", () => {
    expect(pick({ isMoving: true })).toBe("walk");
    expect(pick({ isMoving: true, isRunning: true })).toBe("run");
    expect(selectClip({ ...base, isMoving: true, isRunning: true })).toMatchObject({ kind: "run", loop: "repeat" });
  });

  it("plays the matching attack clip for each combo step and move", () => {
    const attack = (attackType: ClipRequest["attackType"]) => pick({ isAttacking: true, attackType });
    expect(attack("light1")).toBe("attack_1");
    expect(attack("light2")).toBe("attack_2");
    expect(attack("light3")).toBe("attack_3");
    expect(attack("heavy")).toBe("heavy_strike");
    expect(attack("skill")).toBe("ability_cast");
    expect(attack("special")).toBe("ability_cast");
    expect(attack("ultimate")).toBe("roar");
    expect(attack("punch")).toBe("attack_1");
    expect(attack(null)).toBe("attack_1");
    expect(selectClip({ ...base, isAttacking: true, attackType: "light2" })).toMatchObject({ kind: "attack", loop: "once" });
  });

  it("reactions outrank attacking and moving", () => {
    expect(pick({ locomotion: "hitstun", isAttacking: true, attackType: "heavy" })).toBe("hit_reaction");
    expect(pick({ locomotion: "dodge", isMoving: true })).toBe("dodge");
    expect(pick({ locomotion: "parry" })).toBe("parry");
    expect(pick({ locomotion: "airborne" })).toBe("jump");
    expect(selectClip({ ...base, locomotion: "dodge" })).toMatchObject({ loop: "once", kind: "reaction" });
  });

  it("a roar pose plays the roar clip once, ahead of moving or idling", () => {
    expect(pick({ pose: "roar", isMoving: true })).toBe("roar");
    expect(selectClip({ ...base, pose: "roar" })).toMatchObject({ clip: "roar", loop: "once" });
    expect(selectClip({ ...base, available: ["Walking", "Running"], pose: "roar" })).toBeNull(); // legacy models have no roar
  });

  it("victory and defeat poses", () => {
    expect(pick({ pose: "victory" })).toBe("victory");
    expect(selectClip({ ...base, pose: "defeat" })).toMatchObject({ clip: "defeat", loop: "once" });
  });
});

describe("legacy models keep their old behaviour", () => {
  const legacy = ["Armature|walking_man|baselayer", "Running", "Walking"];
  it("walk and run by name", () => {
    expect(selectClip({ ...base, available: legacy, isMoving: true })?.clip).toBe("Armature|walking_man|baselayer");
    expect(selectClip({ ...base, available: legacy, isMoving: true, isRunning: true })?.clip).toBe("Running");
  });
  it("returns null (procedural pose) when nothing matches", () => {
    expect(selectClip({ ...base, available: legacy })).toBeNull();
    expect(selectClip({ ...base, available: ["Kick_A"], isAttacking: true, attackType: "light1" })).toBeNull();
    expect(selectClip({ ...base, available: [] })).toBeNull();
  });
  it("rotates kick variants", () => {
    const kicks = ["Lunge_Spin_Kick", "High_Kick"];
    expect(selectClip({ ...base, available: kicks, isAttacking: true, attackType: "kick", variant: 0 })?.clip).toBe("Lunge_Spin_Kick");
    expect(selectClip({ ...base, available: kicks, isAttacking: true, attackType: "kick", variant: 1 })?.clip).toBe("High_Kick");
  });
});
