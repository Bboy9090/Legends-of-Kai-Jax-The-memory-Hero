import * as THREE from "three";

export interface LimbRefs {
  rightArm: THREE.Object3D | null;
  leftArm: THREE.Object3D | null;
  rightLeg: THREE.Object3D | null;
  leftLeg: THREE.Object3D | null;
  torso: THREE.Object3D | null;
  head: THREE.Object3D | null;
}

export interface LimbBaseRotations {
  rightArm: THREE.Euler;
  leftArm: THREE.Euler;
  rightLeg: THREE.Euler;
  leftLeg: THREE.Euler;
  torso: THREE.Euler;
  head: THREE.Euler;
}

const ARM_PATTERN = /arm|shoulder|hand|claw|wing|forelimb|front.?leg|paw|upper.?arm|lower.?arm|fist/i;
const LEG_PATTERN = /leg|thigh|knee|foot|hind|rear.?leg|ankle|shin|lower.?leg|upper.?leg/i;
const TORSO_PATTERN = /torso|spine|body|chest|hip|pelvis|root|abdomen|rib|trunk/i;
const HEAD_PATTERN = /head|skull|jaw|neck|face|snout|cranium/i;
const RIGHT_PATTERN = /right|_r$|\.r$|_r_|\.R\.|_R_/i;
const LEFT_PATTERN = /left|_l$|\.l$|_l_|\.L\.|_L_/i;

export function findLimbs(root: THREE.Object3D): LimbRefs {
  const limbs: LimbRefs = {
    rightArm: null,
    leftArm: null,
    rightLeg: null,
    leftLeg: null,
    torso: null,
    head: null,
  };

  root.traverse((child) => {
    const name = child.name.toLowerCase();

    if (HEAD_PATTERN.test(name) && !limbs.head) {
      limbs.head = child;
    } else if (TORSO_PATTERN.test(name) && !limbs.torso) {
      limbs.torso = child;
    } else if (ARM_PATTERN.test(name)) {
      if (RIGHT_PATTERN.test(name) && !limbs.rightArm) limbs.rightArm = child;
      else if (LEFT_PATTERN.test(name) && !limbs.leftArm) limbs.leftArm = child;
      else if (!limbs.rightArm) limbs.rightArm = child;
      else if (!limbs.leftArm) limbs.leftArm = child;
    } else if (LEG_PATTERN.test(name)) {
      if (RIGHT_PATTERN.test(name) && !limbs.rightLeg) limbs.rightLeg = child;
      else if (LEFT_PATTERN.test(name) && !limbs.leftLeg) limbs.leftLeg = child;
      else if (!limbs.rightLeg) limbs.rightLeg = child;
      else if (!limbs.leftLeg) limbs.leftLeg = child;
    }
  });

  const foundCount = Object.values(limbs).filter(Boolean).length;
  if (foundCount < 2) {
    root.updateWorldMatrix(true, true);
    assignLimbsByGeometry(root, limbs);
  }

  return limbs;
}

function assignLimbsFromBones(bones: THREE.Bone[], limbs: LimbRefs) {
  const positions = bones.map(b => {
    const pos = new THREE.Vector3();
    b.getWorldPosition(pos);
    return { bone: b, pos };
  });

  let minY = Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0;
  for (const { pos } of positions) {
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
    sumX += pos.x;
    sumY += pos.y;
  }
  const midY = (minY + maxY) * 0.5;
  const midX = sumX / positions.length;

  const upper = positions.filter(p => p.pos.y > midY);
  const lower = positions.filter(p => p.pos.y <= midY);

  upper.sort((a, b) => b.pos.y - a.pos.y);
  if (upper.length > 0 && !limbs.head) {
    limbs.head = upper[0].bone;
  }

  const upperNoHead = upper.filter(p => limbs.head ? p.bone !== limbs.head : true);
  const uRight = upperNoHead.filter(p => p.pos.x > midX + 0.01).sort((a, b) => b.pos.x - a.pos.x);
  const uLeft = upperNoHead.filter(p => p.pos.x < midX - 0.01).sort((a, b) => a.pos.x - b.pos.x);

  if (uRight.length > 0 && !limbs.rightArm) limbs.rightArm = uRight[0].bone;
  if (uLeft.length > 0 && !limbs.leftArm) limbs.leftArm = uLeft[0].bone;

  const lRight = lower.filter(p => p.pos.x > midX + 0.01).sort((a, b) => b.pos.x - a.pos.x);
  const lLeft = lower.filter(p => p.pos.x < midX - 0.01).sort((a, b) => a.pos.x - b.pos.x);

  if (lRight.length > 0 && !limbs.rightLeg) limbs.rightLeg = lRight[0].bone;
  if (lLeft.length > 0 && !limbs.leftLeg) limbs.leftLeg = lLeft[0].bone;

  if (!limbs.torso) {
    const centerBones = positions.filter(p =>
      p.bone !== limbs.head && p.bone !== limbs.rightArm && p.bone !== limbs.leftArm &&
      p.bone !== limbs.rightLeg && p.bone !== limbs.leftLeg
    );
    if (centerBones.length > 0) {
      limbs.torso = centerBones[0].bone;
    }
  }
}

function assignLimbsByGeometry(root: THREE.Object3D, limbs: LimbRefs) {
  const candidates: { obj: THREE.Object3D; center: THREE.Vector3; size: THREE.Vector3 }[] = [];
  const bbox = new THREE.Box3();

  root.traverse((child) => {
    if (child === root) return;

    const skinned = child as THREE.SkinnedMesh;
    if (skinned.isSkinnedMesh && skinned.skeleton) {
      const bones = skinned.skeleton.bones;
      if (bones.length >= 4) {
        assignLimbsFromBones(bones, limbs);
        return;
      }
    }

    if (child.children.length > 0 || (child as THREE.Mesh).isMesh) {
      bbox.setFromObject(child);
      if (bbox.isEmpty()) return;
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      bbox.getCenter(center);
      bbox.getSize(size);
      if (size.length() > 0.01) {
        candidates.push({ obj: child, center, size });
      }
    }
  });

  if (Object.values(limbs).filter(Boolean).length >= 2) return;
  if (candidates.length < 2) return;

  const rootBox = new THREE.Box3().setFromObject(root);
  const rootCenter = new THREE.Vector3();
  const rootSize = new THREE.Vector3();
  rootBox.getCenter(rootCenter);
  rootBox.getSize(rootSize);

  const midY = rootCenter.y;
  const midX = rootCenter.x;

  const upper = candidates.filter(c => c.center.y > midY);
  const lower = candidates.filter(c => c.center.y <= midY);

  const topMost = upper.sort((a, b) => b.center.y - a.center.y);
  if (topMost.length > 0 && !limbs.head) {
    limbs.head = topMost[0].obj;
  }

  const upperSides = upper.filter(c => c !== (limbs.head ? { obj: limbs.head } : null))
    .filter(c => limbs.head ? c.obj !== limbs.head : true);

  const rightUpper = upperSides.filter(c => c.center.x > midX).sort((a, b) => b.center.x - a.center.x);
  const leftUpper = upperSides.filter(c => c.center.x <= midX).sort((a, b) => a.center.x - b.center.x);

  if (rightUpper.length > 0 && !limbs.rightArm) limbs.rightArm = rightUpper[0].obj;
  if (leftUpper.length > 0 && !limbs.leftArm) limbs.leftArm = leftUpper[0].obj;

  const rightLower = lower.filter(c => c.center.x > midX).sort((a, b) => b.center.x - a.center.x);
  const leftLower = lower.filter(c => c.center.x <= midX).sort((a, b) => a.center.x - b.center.x);

  if (rightLower.length > 0 && !limbs.rightLeg) limbs.rightLeg = rightLower[0].obj;
  if (leftLower.length > 0 && !limbs.leftLeg) limbs.leftLeg = leftLower[0].obj;

  const torsoCandidate = candidates
    .filter(c => c.obj !== limbs.head && c.obj !== limbs.rightArm && c.obj !== limbs.leftArm && c.obj !== limbs.rightLeg && c.obj !== limbs.leftLeg)
    .sort((a, b) => b.size.length() - a.size.length());
  if (torsoCandidate.length > 0 && !limbs.torso) limbs.torso = torsoCandidate[0].obj;
}

export function captureBaseRotations(limbs: LimbRefs): LimbBaseRotations {
  return {
    rightArm: limbs.rightArm ? limbs.rightArm.rotation.clone() : new THREE.Euler(),
    leftArm: limbs.leftArm ? limbs.leftArm.rotation.clone() : new THREE.Euler(),
    rightLeg: limbs.rightLeg ? limbs.rightLeg.rotation.clone() : new THREE.Euler(),
    leftLeg: limbs.leftLeg ? limbs.leftLeg.rotation.clone() : new THREE.Euler(),
    torso: limbs.torso ? limbs.torso.rotation.clone() : new THREE.Euler(),
    head: limbs.head ? limbs.head.rotation.clone() : new THREE.Euler(),
  };
}

export function hasAnyLimb(limbs: LimbRefs | null): boolean {
  if (!limbs) return false;
  return !!(limbs.rightArm || limbs.leftArm || limbs.rightLeg || limbs.leftLeg);
}

function lerpRotX(obj: THREE.Object3D | null, base: THREE.Euler, target: number, speed: number, delta: number) {
  if (!obj) return;
  obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, base.x + target, speed * delta);
}

function lerpRotZ(obj: THREE.Object3D | null, base: THREE.Euler, target: number, speed: number, delta: number) {
  if (!obj) return;
  obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, base.z + target, speed * delta);
}

function setRotX(obj: THREE.Object3D | null, base: THREE.Euler, target: number) {
  if (!obj) return;
  obj.rotation.x = base.x + target;
}

function setRotZ(obj: THREE.Object3D | null, base: THREE.Euler, target: number) {
  if (!obj) return;
  obj.rotation.z = base.z + target;
}

export interface AnimState {
  walkCycle: number;
  attackPhase: number;
  hitFlash: number;
  deathProgress: number;
}

export function createAnimState(): AnimState {
  return { walkCycle: 0, attackPhase: 0, hitFlash: 0, deathProgress: 0 };
}

export function animateIdle(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  t: number,
  delta: number,
  seed: number = 0
) {
  const noLimbs = !limbs;
  const breatheAmp = noLimbs ? 0.06 : 0.012;
  const swayAmp = noLimbs ? 0.06 : 0.015;
  const breathe = Math.sin(t * 2.0 + seed) * breatheAmp;
  const sway = Math.sin(t * 0.6 + seed) * swayAmp;

  inner.rotation.x = THREE.MathUtils.lerp(inner.rotation.x, 0, delta * 6);
  inner.rotation.z = THREE.MathUtils.lerp(inner.rotation.z, sway, delta * 4);
  inner.position.y = breathe;

  if (noLimbs) {
    const headBob = Math.sin(t * 1.5 + seed) * 0.04;
    inner.rotation.x = THREE.MathUtils.lerp(inner.rotation.x, headBob, delta * 5);
    const yaw = Math.sin(t * 0.8 + seed + 1) * 0.05;
    inner.rotation.y = THREE.MathUtils.lerp(inner.rotation.y || 0, yaw, delta * 3);
  }

  if (limbs && bases) {
    const idleArm = Math.sin(t * 1.2 + seed) * 0.08;
    lerpRotX(limbs.rightArm, bases.rightArm, idleArm, 4, delta);
    lerpRotZ(limbs.rightArm, bases.rightArm, 0, 4, delta);
    lerpRotX(limbs.leftArm, bases.leftArm, -idleArm * 0.8, 4, delta);
    lerpRotZ(limbs.leftArm, bases.leftArm, 0, 4, delta);
    lerpRotX(limbs.rightLeg, bases.rightLeg, 0, 4, delta);
    lerpRotX(limbs.leftLeg, bases.leftLeg, 0, 4, delta);
    if (limbs.head) {
      const headTilt = Math.sin(t * 1.5 + seed) * 0.02;
      lerpRotX(limbs.head, bases.head, headTilt, 5, delta);
    }
  }
}

export function animateWalk(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  anim: AnimState,
  delta: number,
  isRunning: boolean
) {
  const noLimbs = !limbs;
  const rate = isRunning ? 12 : 8;
  anim.walkCycle += delta * rate;
  const stride = Math.sin(anim.walkCycle);
  const bounceBase = isRunning ? 0.06 : 0.03;
  const bounce = Math.abs(Math.sin(anim.walkCycle)) * (noLimbs ? bounceBase * 3 : bounceBase);
  const tiltBase = isRunning ? 0.12 : 0.06;
  const tilt = noLimbs ? tiltBase * 2.5 : tiltBase;

  inner.rotation.x = THREE.MathUtils.lerp(inner.rotation.x, tilt, delta * 8);
  inner.position.y = bounce;

  const sideBase = isRunning ? 0.06 : 0.03;
  const sideSwing = Math.sin(anim.walkCycle * 0.5) * (noLimbs ? sideBase * 3 : sideBase);
  inner.rotation.z = THREE.MathUtils.lerp(inner.rotation.z, sideSwing, delta * 6);

  if (noLimbs) {
    const yawSwing = Math.sin(anim.walkCycle * 0.5) * (isRunning ? 0.12 : 0.06);
    inner.rotation.y = THREE.MathUtils.lerp(inner.rotation.y || 0, yawSwing, delta * 6);
  }

  if (limbs && bases) {
    const armAmp = isRunning ? 0.7 : 0.4;
    const legAmp = isRunning ? 0.8 : 0.5;

    lerpRotX(limbs.rightArm, bases.rightArm, stride * armAmp, 10, delta);
    lerpRotX(limbs.leftArm, bases.leftArm, -stride * armAmp, 10, delta);
    lerpRotX(limbs.rightLeg, bases.rightLeg, -stride * legAmp, 10, delta);
    lerpRotX(limbs.leftLeg, bases.leftLeg, stride * legAmp, 10, delta);

    if (limbs.head) {
      const headBob = Math.sin(anim.walkCycle * 2) * 0.03;
      lerpRotX(limbs.head, bases.head, headBob, 5, delta);
    }
  }
}

export function animatePunch(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  anim: AnimState,
  delta: number,
  t: number
) {
  const noLimbs = !limbs;
  const amp = noLimbs ? 2.5 : 1;
  anim.attackPhase = THREE.MathUtils.lerp(anim.attackPhase, 1, delta * 22);
  const swing = Math.sin(anim.attackPhase * Math.PI);

  inner.rotation.x = swing * 0.25 * amp;
  inner.rotation.z = swing * 0.08 * amp;
  inner.position.z = swing * 0.18 * amp;
  inner.position.y = swing * 0.05 * amp;

  if (limbs && bases) {
    setRotX(limbs.rightArm, bases.rightArm, -swing * 1.4);
    setRotZ(limbs.rightArm, bases.rightArm, swing * 0.4);
    setRotX(limbs.leftArm, bases.leftArm, swing * 0.4);
    setRotZ(limbs.leftArm, bases.leftArm, -swing * 0.2);
    lerpRotX(limbs.rightLeg, bases.rightLeg, swing * 0.15, 12, delta);
    lerpRotX(limbs.leftLeg, bases.leftLeg, -swing * 0.1, 12, delta);
    if (limbs.head) setRotX(limbs.head, bases.head, -swing * 0.15);
  }
}

export function animateKick(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  anim: AnimState,
  delta: number
) {
  const noLimbs = !limbs;
  const amp = noLimbs ? 2.5 : 1;
  anim.attackPhase = THREE.MathUtils.lerp(anim.attackPhase, 1, delta * 20);
  const swing = Math.sin(anim.attackPhase * Math.PI);

  inner.rotation.x = -swing * 0.15 * amp;
  inner.rotation.z = swing * 0.12 * amp;
  inner.position.y = swing * 0.12 * amp;

  if (limbs && bases) {
    setRotX(limbs.rightLeg, bases.rightLeg, -swing * 1.6);
    setRotX(limbs.leftLeg, bases.leftLeg, swing * 0.2);
    setRotX(limbs.rightArm, bases.rightArm, swing * 0.35);
    setRotZ(limbs.rightArm, bases.rightArm, -swing * 0.2);
    lerpRotX(limbs.leftArm, bases.leftArm, swing * 0.2, 10, delta);
    if (limbs.head) setRotX(limbs.head, bases.head, swing * 0.1);
  }
}

export function animateSpecial(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  anim: AnimState,
  delta: number
) {
  const noLimbs = !limbs;
  const amp = noLimbs ? 2.0 : 1;
  anim.attackPhase = THREE.MathUtils.lerp(anim.attackPhase, 1, delta * 16);
  const swing = Math.sin(anim.attackPhase * Math.PI);
  const spin = Math.sin(anim.attackPhase * Math.PI * 2);

  inner.rotation.x = swing * 0.3 * amp;
  inner.rotation.y = spin * 0.7 * amp;
  inner.position.y = swing * 0.2 * amp;

  if (limbs && bases) {
    setRotX(limbs.rightArm, bases.rightArm, -swing * 1.6);
    setRotZ(limbs.rightArm, bases.rightArm, swing * 0.9);
    setRotX(limbs.leftArm, bases.leftArm, -swing * 1.4);
    setRotZ(limbs.leftArm, bases.leftArm, -swing * 0.9);
    setRotX(limbs.rightLeg, bases.rightLeg, swing * 0.3);
    setRotX(limbs.leftLeg, bases.leftLeg, -swing * 0.3);
    if (limbs.head) setRotX(limbs.head, bases.head, -swing * 0.2);
  }
}

export function animateUltimate(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  anim: AnimState,
  delta: number
) {
  const noLimbs = !limbs;
  const amp = noLimbs ? 2.0 : 1;
  anim.attackPhase = THREE.MathUtils.lerp(anim.attackPhase, 1, delta * 14);
  const swing = Math.sin(anim.attackPhase * Math.PI);

  inner.rotation.x = swing * 0.4 * amp;
  inner.position.y = swing * 0.4 * amp;
  inner.scale.setScalar(1 + swing * (noLimbs ? 0.18 : 0.1));

  if (limbs && bases) {
    setRotX(limbs.rightArm, bases.rightArm, -swing * 2.0);
    setRotZ(limbs.rightArm, bases.rightArm, swing * 1.1);
    setRotX(limbs.leftArm, bases.leftArm, -swing * 2.0);
    setRotZ(limbs.leftArm, bases.leftArm, -swing * 1.1);
    setRotX(limbs.rightLeg, bases.rightLeg, swing * 0.4);
    setRotX(limbs.leftLeg, bases.leftLeg, -swing * 0.4);
    if (limbs.head) setRotX(limbs.head, bases.head, -swing * 0.3);
  }
}

export function animateEnemyAttack(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  anim: AnimState,
  delta: number,
  t: number,
  variant: number
) {
  const noLimbs = !limbs;
  const amp = noLimbs ? 2.5 : 1;
  anim.attackPhase = THREE.MathUtils.lerp(anim.attackPhase, 1, delta * 18);
  const swing = Math.sin(anim.attackPhase * Math.PI);

  if (variant % 3 === 0) {
    inner.rotation.x = swing * 0.3 * amp;
    inner.position.z = swing * 0.15 * amp;
    inner.position.y = swing * 0.05 * amp;
    if (limbs && bases) {
      setRotX(limbs.rightArm, bases.rightArm, -swing * 1.5);
      setRotZ(limbs.rightArm, bases.rightArm, swing * 0.4);
      setRotX(limbs.leftArm, bases.leftArm, swing * 0.3);
    }
  } else if (variant % 3 === 1) {
    inner.rotation.x = -swing * 0.2 * amp;
    inner.position.y = swing * 0.1 * amp;
    if (limbs && bases) {
      setRotX(limbs.rightLeg, bases.rightLeg, -swing * 1.4);
      setRotX(limbs.leftLeg, bases.leftLeg, swing * 0.2);
      setRotX(limbs.rightArm, bases.rightArm, swing * 0.3);
    }
  } else {
    inner.rotation.x = swing * 0.25 * amp;
    inner.rotation.y = swing * 0.4 * amp;
    inner.position.y = swing * 0.15 * amp;
    if (limbs && bases) {
      setRotX(limbs.rightArm, bases.rightArm, -swing * 1.3);
      setRotX(limbs.leftArm, bases.leftArm, -swing * 1.1);
      setRotZ(limbs.rightArm, bases.rightArm, swing * 0.6);
      setRotZ(limbs.leftArm, bases.leftArm, -swing * 0.6);
    }
  }
}

export function animateHitReaction(
  inner: THREE.Object3D,
  anim: AnimState,
  delta: number,
  t: number
) {
  if (anim.hitFlash > 0) {
    anim.hitFlash = Math.max(0, anim.hitFlash - delta * 5);
    const shake = Math.sin(t * 35) * anim.hitFlash * 0.1;
    inner.rotation.z += shake;
    inner.position.x = shake * 0.5;
  }
}

export function animateDeath(
  group: THREE.Object3D,
  inner: THREE.Object3D,
  anim: AnimState,
  delta: number
) {
  anim.deathProgress = Math.min(1, anim.deathProgress + delta * 2);
  const p = anim.deathProgress;
  group.scale.y = THREE.MathUtils.lerp(1, 0.05, p);
  inner.rotation.x = THREE.MathUtils.lerp(0, 1.2, p);
  inner.rotation.z = THREE.MathUtils.lerp(0, 0.3, p);
  inner.position.y = THREE.MathUtils.lerp(0, -0.3, p);
}

export function animateAggroWalk(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  anim: AnimState,
  delta: number,
  t: number
) {
  const noLimbs = !limbs;
  anim.walkCycle += delta * 10;
  const stride = Math.sin(anim.walkCycle);
  const bounceAmp = noLimbs ? 0.14 : 0.04;
  const bounce = Math.abs(Math.sin(anim.walkCycle)) * bounceAmp;

  const tiltTarget = noLimbs ? 0.25 : 0.1;
  inner.rotation.x = THREE.MathUtils.lerp(inner.rotation.x, tiltTarget, delta * 6);
  inner.position.y = bounce;

  const swayAmp = noLimbs ? 0.12 : 0.04;
  const sway = Math.sin(anim.walkCycle * 0.5) * swayAmp;
  inner.rotation.z = THREE.MathUtils.lerp(inner.rotation.z, sway, delta * 5);

  if (noLimbs) {
    const yawSwing = Math.sin(anim.walkCycle * 0.5) * 0.1;
    inner.rotation.y = THREE.MathUtils.lerp(inner.rotation.y || 0, yawSwing, delta * 6);
  }

  if (limbs && bases) {
    lerpRotX(limbs.rightArm, bases.rightArm, stride * 0.55, 10, delta);
    lerpRotX(limbs.leftArm, bases.leftArm, -stride * 0.55, 10, delta);
    lerpRotX(limbs.rightLeg, bases.rightLeg, -stride * 0.65, 10, delta);
    lerpRotX(limbs.leftLeg, bases.leftLeg, stride * 0.65, 10, delta);
    if (limbs.head) {
      const headBob = Math.sin(anim.walkCycle * 2) * 0.025;
      lerpRotX(limbs.head, bases.head, headBob, 5, delta);
    }
  }
}

export function resetAttackPhase(anim: AnimState, inner: THREE.Object3D, delta: number) {
  anim.attackPhase = THREE.MathUtils.lerp(anim.attackPhase, 0, delta * 10);
  inner.scale.setScalar(1);
  inner.position.z = THREE.MathUtils.lerp(inner.position.z, 0, delta * 8);
  inner.position.x = THREE.MathUtils.lerp(inner.position.x, 0, delta * 8);
}

export function triggerHit(anim: AnimState) {
  anim.hitFlash = 1;
}
