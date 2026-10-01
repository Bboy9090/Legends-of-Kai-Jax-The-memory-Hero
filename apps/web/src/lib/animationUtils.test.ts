import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  findLimbs,
  captureBaseRotations,
  createAnimState,
  animateWalk,
  animatePunch,
  hasAnyLimb,
} from "./animationUtils";

function makeHumanoid() {
  const root = new THREE.Group();
  const hips = new THREE.Bone(); hips.name = "Hips"; hips.position.y = 1;
  const spine = new THREE.Bone(); spine.name = "Spine"; spine.position.y = 0.5;
  const head = new THREE.Bone(); head.name = "Head"; head.position.y = 0.6;
  const rua = new THREE.Bone(); rua.name = "RightUpperArm"; rua.position.set(0.3, 0.4, 0);
  const rfa = new THREE.Bone(); rfa.name = "RightForeArm"; rfa.position.x = 0.35;
  const lua = new THREE.Bone(); lua.name = "LeftUpperArm"; lua.position.set(-0.3, 0.4, 0);
  const lfa = new THREE.Bone(); lfa.name = "LeftForeArm"; lfa.position.x = -0.35;
  const rul = new THREE.Bone(); rul.name = "RightUpperLeg"; rul.position.set(0.18, -0.45, 0);
  const rll = new THREE.Bone(); rll.name = "RightLowerLeg"; rll.position.y = -0.5;
  const lul = new THREE.Bone(); lul.name = "LeftUpperLeg"; lul.position.set(-0.18, -0.45, 0);
  const lll = new THREE.Bone(); lll.name = "LeftLowerLeg"; lll.position.y = -0.5;
  root.add(hips); hips.add(spine, rul, lul); spine.add(head, rua, lua); rua.add(rfa); lua.add(lfa); rul.add(rll); lul.add(lll);
  root.updateMatrixWorld(true);
  return root;
}

describe("skeletal motion release gate", () => {
  it("walk changes articulated limb rotations, not only root placement", () => {
    const root = makeHumanoid();
    const limbs = findLimbs(root);
    expect(hasAnyLimb(limbs)).toBe(true);
    const bases = captureBaseRotations(limbs);
    const state = createAnimState();
    const before = limbs.rightUpperArm!.rotation.clone();
    animateWalk(root, limbs, bases, state, 1 / 30, false);
    animateWalk(root, limbs, bases, state, 1 / 30, false);
    expect(Math.abs(limbs.rightUpperArm!.rotation.x - before.x)).toBeGreaterThan(0.001);
    expect(Math.abs(limbs.rightUpperLeg!.rotation.x - bases.rightUpperLeg.x)).toBeGreaterThan(0.001);
  });

  it("attack changes upper-body bone pose", () => {
    const root = makeHumanoid();
    const limbs = findLimbs(root);
    const bases = captureBaseRotations(limbs);
    const state = createAnimState();
    for (let i = 0; i < 8; i++) animatePunch(root, limbs, bases, state, 1 / 60, i / 60);
    const armDelta = Math.abs(limbs.rightUpperArm!.rotation.x - bases.rightUpperArm.x);
    const forearmDelta = Math.abs(limbs.rightForearm!.rotation.x - bases.rightForearm.x);
    expect(armDelta + forearmDelta).toBeGreaterThan(0.01);
  });
});
