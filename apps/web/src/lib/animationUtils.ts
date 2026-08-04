import * as THREE from "three";

export interface LimbRefs {
  rightUpperArm: THREE.Object3D | null;
  rightForearm: THREE.Object3D | null;
  rightHand: THREE.Object3D | null;
  leftUpperArm: THREE.Object3D | null;
  leftForearm: THREE.Object3D | null;
  leftHand: THREE.Object3D | null;
  rightUpperLeg: THREE.Object3D | null;
  rightLowerLeg: THREE.Object3D | null;
  rightFoot: THREE.Object3D | null;
  leftUpperLeg: THREE.Object3D | null;
  leftLowerLeg: THREE.Object3D | null;
  leftFoot: THREE.Object3D | null;
  spine: THREE.Object3D | null;
  hips: THREE.Object3D | null;
  head: THREE.Object3D | null;
  neck: THREE.Object3D | null;
  rightArm: THREE.Object3D | null;
  leftArm: THREE.Object3D | null;
  rightLeg: THREE.Object3D | null;
  leftLeg: THREE.Object3D | null;
  torso: THREE.Object3D | null;
}

export interface LimbBaseRotations {
  rightUpperArm: THREE.Euler;
  rightForearm: THREE.Euler;
  rightHand: THREE.Euler;
  leftUpperArm: THREE.Euler;
  leftForearm: THREE.Euler;
  leftHand: THREE.Euler;
  rightUpperLeg: THREE.Euler;
  rightLowerLeg: THREE.Euler;
  rightFoot: THREE.Euler;
  leftUpperLeg: THREE.Euler;
  leftLowerLeg: THREE.Euler;
  leftFoot: THREE.Euler;
  spine: THREE.Euler;
  hips: THREE.Euler;
  head: THREE.Euler;
  neck: THREE.Euler;
  rightArm: THREE.Euler;
  leftArm: THREE.Euler;
  rightLeg: THREE.Euler;
  leftLeg: THREE.Euler;
  torso: THREE.Euler;
}

const SHOULDER_PAT = /^(left|right)?shoulder$/i;
const UPPER_ARM_PAT = /upper.?arm|^(left|right)arm$|bicep|arm.*upper/i;
const FOREARM_PAT = /fore.?arm|lower.?arm|arm.*lower|elbow/i;
const HAND_PAT = /hand|wrist|fist|palm|finger|claw/i;
const UPPER_LEG_PAT = /upper.?leg|up.?leg|thigh|femur|leg.*upper/i;
const LOWER_LEG_PAT = /lower.?leg|^(left|right)leg$|shin|calf|knee|tibia|leg.*lower/i;
const FOOT_PAT = /foot|ankle|heel|paw/i;
const TOE_SKIP = /toe.?base|toe.?end|toe.?tip/i;
const SPINE_PAT = /spine|chest|rib|trunk|back/i;
const HIPS_PAT = /hip|pelvis|groin|waist|root/i;
const NECK_PAT = /neck/i;
const HEAD_PAT = /^head\d*$|skull|jaw|face|snout|cranium/i;
const HEAD_SKIP = /head.?end|headfront|head.?top|head.?nub/i;
const ARM_GENERIC = /arm|shoulder|hand|claw|wing|forelimb|front.?leg|paw|fist/i;
const LEG_GENERIC = /leg|thigh|knee|foot|hind|rear.?leg|ankle|shin/i;
const TORSO_GENERIC = /torso|spine|body|chest|hip|pelvis|root|abdomen|rib|trunk/i;
const RIGHT_PAT = /right|_r$|\.r$|_r_|\.R\.|_R_|\.R$/i;
const LEFT_PAT = /left|_l$|\.l$|_l_|\.L\.|_L_|\.L$/i;

export function findLimbs(root: THREE.Object3D): LimbRefs {
  const limbs: LimbRefs = {
    rightUpperArm: null, rightForearm: null, rightHand: null,
    leftUpperArm: null, leftForearm: null, leftHand: null,
    rightUpperLeg: null, rightLowerLeg: null, rightFoot: null,
    leftUpperLeg: null, leftLowerLeg: null, leftFoot: null,
    spine: null, hips: null, head: null, neck: null,
    rightArm: null, leftArm: null, rightLeg: null, leftLeg: null, torso: null,
  };

  root.traverse((child) => {
    const name = child.name.toLowerCase();
    const isRight = RIGHT_PAT.test(name);
    const isLeft = LEFT_PAT.test(name);

    if (SHOULDER_PAT.test(name) || HEAD_SKIP.test(name) || TOE_SKIP.test(name)) {
      // Skip shoulder bones and head endpoints
    } else if (HEAD_PAT.test(name) && !NECK_PAT.test(name) && !limbs.head) {
      limbs.head = child;
    } else if (NECK_PAT.test(name) && !limbs.neck) {
      limbs.neck = child;
    } else if (HIPS_PAT.test(name) && !limbs.hips) {
      limbs.hips = child;
    } else if (SPINE_PAT.test(name) && !limbs.spine) {
      limbs.spine = child;
    } else if (HAND_PAT.test(name)) {
      if (isRight && !limbs.rightHand) limbs.rightHand = child;
      else if (isLeft && !limbs.leftHand) limbs.leftHand = child;
      else if (!limbs.rightHand) limbs.rightHand = child;
      else if (!limbs.leftHand) limbs.leftHand = child;
    } else if (FOREARM_PAT.test(name)) {
      if (isRight && !limbs.rightForearm) limbs.rightForearm = child;
      else if (isLeft && !limbs.leftForearm) limbs.leftForearm = child;
      else if (!limbs.rightForearm) limbs.rightForearm = child;
      else if (!limbs.leftForearm) limbs.leftForearm = child;
    } else if (UPPER_ARM_PAT.test(name)) {
      if (isRight && !limbs.rightUpperArm) limbs.rightUpperArm = child;
      else if (isLeft && !limbs.leftUpperArm) limbs.leftUpperArm = child;
      else if (!limbs.rightUpperArm) limbs.rightUpperArm = child;
      else if (!limbs.leftUpperArm) limbs.leftUpperArm = child;
    } else if (FOOT_PAT.test(name)) {
      if (isRight && !limbs.rightFoot) limbs.rightFoot = child;
      else if (isLeft && !limbs.leftFoot) limbs.leftFoot = child;
      else if (!limbs.rightFoot) limbs.rightFoot = child;
      else if (!limbs.leftFoot) limbs.leftFoot = child;
    } else if (LOWER_LEG_PAT.test(name)) {
      if (isRight && !limbs.rightLowerLeg) limbs.rightLowerLeg = child;
      else if (isLeft && !limbs.leftLowerLeg) limbs.leftLowerLeg = child;
      else if (!limbs.rightLowerLeg) limbs.rightLowerLeg = child;
      else if (!limbs.leftLowerLeg) limbs.leftLowerLeg = child;
    } else if (UPPER_LEG_PAT.test(name)) {
      if (isRight && !limbs.rightUpperLeg) limbs.rightUpperLeg = child;
      else if (isLeft && !limbs.leftUpperLeg) limbs.leftUpperLeg = child;
      else if (!limbs.rightUpperLeg) limbs.rightUpperLeg = child;
      else if (!limbs.leftUpperLeg) limbs.leftUpperLeg = child;
    } else if (ARM_GENERIC.test(name)) {
      if (isRight && !limbs.rightArm) limbs.rightArm = child;
      else if (isLeft && !limbs.leftArm) limbs.leftArm = child;
      else if (!limbs.rightArm) limbs.rightArm = child;
      else if (!limbs.leftArm) limbs.leftArm = child;
    } else if (LEG_GENERIC.test(name)) {
      if (isRight && !limbs.rightLeg) limbs.rightLeg = child;
      else if (isLeft && !limbs.leftLeg) limbs.leftLeg = child;
      else if (!limbs.rightLeg) limbs.rightLeg = child;
      else if (!limbs.leftLeg) limbs.leftLeg = child;
    } else if (TORSO_GENERIC.test(name) && !limbs.torso) {
      limbs.torso = child;
    }
  });

  if (!limbs.rightArm && limbs.rightUpperArm) limbs.rightArm = limbs.rightUpperArm;
  if (!limbs.leftArm && limbs.leftUpperArm) limbs.leftArm = limbs.leftUpperArm;
  if (!limbs.rightLeg && limbs.rightUpperLeg) limbs.rightLeg = limbs.rightUpperLeg;
  if (!limbs.leftLeg && limbs.leftUpperLeg) limbs.leftLeg = limbs.leftUpperLeg;
  if (!limbs.torso && limbs.spine) limbs.torso = limbs.spine;
  if (!limbs.torso && limbs.hips) limbs.torso = limbs.hips;

  walkBoneChains(limbs);

  const foundCount = Object.values(limbs).filter(Boolean).length;
  if (foundCount < 3) {
    root.updateWorldMatrix(true, true);
    assignLimbsByGeometry(root, limbs);
    walkBoneChains(limbs);
  }

  inferMissingLimbsFromSkeleton(root, limbs);

  const limbNames = Object.entries(limbs).filter(([, v]) => v !== null).map(([k, v]) => `${k}="${(v as THREE.Object3D).name}"`);
  console.log(`[Rigging] Found ${limbNames.length}/21 limbs: ${limbNames.join(", ")}`);

  return limbs;
}

function walkBoneChains(limbs: LimbRefs) {
  walkArmChain(limbs, "right");
  walkArmChain(limbs, "left");
  walkLegChain(limbs, "right");
  walkLegChain(limbs, "left");

  if (!limbs.neck && limbs.head && limbs.head.parent && limbs.head.parent !== limbs.spine) {
    const p = limbs.head.parent;
    if (p && p !== limbs.torso && p !== limbs.hips) {
      limbs.neck = p;
    }
  }
}

function walkArmChain(limbs: LimbRefs, side: "right" | "left") {
  const uaKey = side === "right" ? "rightUpperArm" : "leftUpperArm";
  const faKey = side === "right" ? "rightForearm" : "leftForearm";
  const hKey = side === "right" ? "rightHand" : "leftHand";
  const armKey = side === "right" ? "rightArm" : "leftArm";

  let start = limbs[uaKey] || limbs[armKey];
  if (!start) return;

  if (!limbs[uaKey]) limbs[uaKey] = start;

  if (!limbs[faKey] && start.children.length > 0) {
    const child = findBestChild(start, FOREARM_PAT) || findBestChild(start, ARM_GENERIC) || start.children[0];
    if (child && child !== limbs.head && child !== limbs.neck) {
      limbs[faKey] = child;
    }
  }

  const forearm = limbs[faKey];
  if (!limbs[hKey] && forearm && forearm.children.length > 0) {
    const child = findBestChild(forearm, HAND_PAT) || forearm.children[0];
    if (child) {
      limbs[hKey] = child;
    }
  }
}

function walkLegChain(limbs: LimbRefs, side: "right" | "left") {
  const ulKey = side === "right" ? "rightUpperLeg" : "leftUpperLeg";
  const llKey = side === "right" ? "rightLowerLeg" : "leftLowerLeg";
  const ftKey = side === "right" ? "rightFoot" : "leftFoot";
  const legKey = side === "right" ? "rightLeg" : "leftLeg";

  let start = limbs[ulKey] || limbs[legKey];
  if (!start) return;

  if (!limbs[ulKey]) limbs[ulKey] = start;

  if (!limbs[llKey] && start.children.length > 0) {
    const child = findBestChild(start, LOWER_LEG_PAT) || findBestChild(start, LEG_GENERIC) || start.children[0];
    if (child && child !== limbs.hips && child !== limbs.spine) {
      limbs[llKey] = child;
    }
  }

  const lowerLeg = limbs[llKey];
  if (!limbs[ftKey] && lowerLeg && lowerLeg.children.length > 0) {
    const child = findBestChild(lowerLeg, FOOT_PAT) || lowerLeg.children[0];
    if (child) {
      limbs[ftKey] = child;
    }
  }
}

function findBestChild(parent: THREE.Object3D, pattern: RegExp): THREE.Object3D | null {
  for (const child of parent.children) {
    if (pattern.test(child.name)) return child;
  }
  return null;
}

function inferMissingLimbsFromSkeleton(root: THREE.Object3D, limbs: LimbRefs) {
  const skinnedMeshes: THREE.SkinnedMesh[] = [];
  root.traverse((child) => {
    if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
      skinnedMeshes.push(child as THREE.SkinnedMesh);
    }
  });

  if (skinnedMeshes.length === 0) return;

  for (const mesh of skinnedMeshes) {
    if (!mesh.skeleton) continue;
    const bones = mesh.skeleton.bones;
    if (bones.length < 4) continue;

    root.updateWorldMatrix(true, true);

    const positions = bones.map(b => {
      const pos = new THREE.Vector3();
      b.getWorldPosition(pos);
      return { bone: b, pos };
    });

    let minY = Infinity, maxY = -Infinity;
    let sumX = 0;
    for (const { pos } of positions) {
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
      sumX += pos.x;
    }
    const height = maxY - minY;
    if (height < 0.01) continue;

    const midX = sumX / positions.length;
    const hipLine = minY + height * 0.45;
    const shoulderLine = minY + height * 0.75;

    if (!limbs.hips) {
      const hipCandidates = positions.filter(p => Math.abs(p.pos.y - hipLine) < height * 0.15 && Math.abs(p.pos.x - midX) < height * 0.1);
      hipCandidates.sort((a, b) => Math.abs(a.pos.x - midX) - Math.abs(b.pos.x - midX));
      if (hipCandidates.length > 0) limbs.hips = hipCandidates[0].bone;
    }

    if (!limbs.spine) {
      const spineCandidates = positions.filter(p => p.pos.y > hipLine && p.pos.y < shoulderLine && Math.abs(p.pos.x - midX) < height * 0.1);
      spineCandidates.sort((a, b) => a.pos.y - b.pos.y);
      if (spineCandidates.length > 0) limbs.spine = spineCandidates[0].bone;
      if (!limbs.torso) limbs.torso = limbs.spine;
    }

    if (!limbs.head) {
      const topBones = positions.filter(p => p.pos.y > minY + height * 0.85);
      topBones.sort((a, b) => b.pos.y - a.pos.y);
      if (topBones.length > 0) limbs.head = topBones[0].bone;
    }

    const usedBones = new Set([limbs.head, limbs.neck, limbs.spine, limbs.hips, limbs.torso].filter(Boolean));

    if (!limbs.rightUpperArm || !limbs.leftUpperArm) {
      const shoulderBones = positions
        .filter(p => !usedBones.has(p.bone) && p.pos.y > shoulderLine - height * 0.1 && Math.abs(p.pos.x - midX) > height * 0.05)
        .sort((a, b) => Math.abs(b.pos.x - midX) - Math.abs(a.pos.x - midX));

      for (const sb of shoulderBones) {
        if (sb.pos.x > midX && !limbs.rightUpperArm) {
          limbs.rightUpperArm = sb.bone;
          if (!limbs.rightArm) limbs.rightArm = sb.bone;
        } else if (sb.pos.x <= midX && !limbs.leftUpperArm) {
          limbs.leftUpperArm = sb.bone;
          if (!limbs.leftArm) limbs.leftArm = sb.bone;
        }
      }
    }

    if (!limbs.rightUpperLeg || !limbs.leftUpperLeg) {
      const legBones = positions
        .filter(p => !usedBones.has(p.bone) && p.pos.y < hipLine + height * 0.05 && p.pos.y > minY + height * 0.2 && Math.abs(p.pos.x - midX) > height * 0.02)
        .sort((a, b) => b.pos.y - a.pos.y);

      for (const lb of legBones) {
        if (lb.pos.x > midX && !limbs.rightUpperLeg) {
          limbs.rightUpperLeg = lb.bone;
          if (!limbs.rightLeg) limbs.rightLeg = lb.bone;
        } else if (lb.pos.x <= midX && !limbs.leftUpperLeg) {
          limbs.leftUpperLeg = lb.bone;
          if (!limbs.leftLeg) limbs.leftLeg = lb.bone;
        }
      }
    }

    walkBoneChains(limbs);
    break;
  }
}

function assignLimbsFromBones(bones: THREE.Bone[], limbs: LimbRefs) {
  const positions = bones.map(b => {
    const pos = new THREE.Vector3();
    b.getWorldPosition(pos);
    return { bone: b, pos };
  });

  let minY = Infinity, maxY = -Infinity;
  let sumX = 0;
  for (const { pos } of positions) {
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
    sumX += pos.x;
  }
  const midY = (minY + maxY) * 0.5;
  const midX = sumX / positions.length;

  const upper = positions.filter(p => p.pos.y > midY);
  const lower = positions.filter(p => p.pos.y <= midY);

  upper.sort((a, b) => b.pos.y - a.pos.y);
  if (upper.length > 0 && !limbs.head) limbs.head = upper[0].bone;

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
    if (centerBones.length > 0) limbs.torso = centerBones[0].bone;
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
      if (size.length() > 0.01) candidates.push({ obj: child, center, size });
    }
  });

  if (Object.values(limbs).filter(Boolean).length >= 3) return;
  if (candidates.length < 2) return;

  const rootBox = new THREE.Box3().setFromObject(root);
  const rootCenter = new THREE.Vector3();
  rootBox.getCenter(rootCenter);
  const midY = rootCenter.y;
  const midX = rootCenter.x;

  const upper = candidates.filter(c => c.center.y > midY);
  const lower = candidates.filter(c => c.center.y <= midY);

  const topMost = upper.sort((a, b) => b.center.y - a.center.y);
  if (topMost.length > 0 && !limbs.head) limbs.head = topMost[0].obj;

  const upperSides = upper.filter(c => limbs.head ? c.obj !== limbs.head : true);
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

const ZERO_EULER = new THREE.Euler();
function getBase(obj: THREE.Object3D | null): THREE.Euler {
  return obj ? obj.rotation.clone() : ZERO_EULER.clone();
}

export function captureBaseRotations(limbs: LimbRefs): LimbBaseRotations {
  return {
    rightUpperArm: getBase(limbs.rightUpperArm),
    rightForearm: getBase(limbs.rightForearm),
    rightHand: getBase(limbs.rightHand),
    leftUpperArm: getBase(limbs.leftUpperArm),
    leftForearm: getBase(limbs.leftForearm),
    leftHand: getBase(limbs.leftHand),
    rightUpperLeg: getBase(limbs.rightUpperLeg),
    rightLowerLeg: getBase(limbs.rightLowerLeg),
    rightFoot: getBase(limbs.rightFoot),
    leftUpperLeg: getBase(limbs.leftUpperLeg),
    leftLowerLeg: getBase(limbs.leftLowerLeg),
    leftFoot: getBase(limbs.leftFoot),
    spine: getBase(limbs.spine),
    hips: getBase(limbs.hips),
    head: getBase(limbs.head),
    neck: getBase(limbs.neck),
    rightArm: getBase(limbs.rightArm),
    leftArm: getBase(limbs.leftArm),
    rightLeg: getBase(limbs.rightLeg),
    leftLeg: getBase(limbs.leftLeg),
    torso: getBase(limbs.torso),
  };
}

export function hasAnyLimb(limbs: LimbRefs | null): boolean {
  if (!limbs) return false;
  return !!(limbs.rightArm || limbs.leftArm || limbs.rightLeg || limbs.leftLeg ||
    limbs.rightUpperArm || limbs.leftUpperArm || limbs.rightUpperLeg || limbs.leftUpperLeg);
}

function setRot(obj: THREE.Object3D | null, base: THREE.Euler, x?: number, y?: number, z?: number) {
  if (!obj) return;
  if (x !== undefined) obj.rotation.x = base.x + x;
  if (y !== undefined) obj.rotation.y = base.y + y;
  if (z !== undefined) obj.rotation.z = base.z + z;
}

function lerpRot(obj: THREE.Object3D | null, base: THREE.Euler, x: number | undefined, y: number | undefined, z: number | undefined, speed: number, delta: number) {
  if (!obj) return;
  if (x !== undefined) obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, base.x + x, speed * delta);
  if (y !== undefined) obj.rotation.y = THREE.MathUtils.lerp(obj.rotation.y, base.y + y, speed * delta);
  if (z !== undefined) obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, base.z + z, speed * delta);
}

function rUA(l: LimbRefs) { return l.rightUpperArm || l.rightArm; }
function rFA(l: LimbRefs) { return l.rightForearm; }
function rH(l: LimbRefs) { return l.rightHand; }
function lUA(l: LimbRefs) { return l.leftUpperArm || l.leftArm; }
function lFA(l: LimbRefs) { return l.leftForearm; }
function lH(l: LimbRefs) { return l.leftHand; }
function rUL(l: LimbRefs) { return l.rightUpperLeg || l.rightLeg; }
function rLL(l: LimbRefs) { return l.rightLowerLeg; }
function rFt(l: LimbRefs) { return l.rightFoot; }
function lUL(l: LimbRefs) { return l.leftUpperLeg || l.leftLeg; }
function lLL(l: LimbRefs) { return l.leftLowerLeg; }
function lFt(l: LimbRefs) { return l.leftFoot; }
function sp(l: LimbRefs) { return l.spine || l.torso; }
function hp(l: LimbRefs) { return l.hips; }
function hd(l: LimbRefs) { return l.head; }
function nk(l: LimbRefs) { return l.neck; }

function baseFor(l: LimbRefs, b: LimbBaseRotations, primary: keyof LimbRefs, fallback: keyof LimbRefs): THREE.Euler {
  if (l[primary]) return b[primary as keyof LimbBaseRotations] as THREE.Euler;
  return b[fallback as keyof LimbBaseRotations] as THREE.Euler;
}
function bUA(l: LimbRefs, b: LimbBaseRotations) { return baseFor(l, b, "rightUpperArm", "rightArm"); }
function bFA(_l: LimbRefs, b: LimbBaseRotations) { return b.rightForearm; }
function bRH(_l: LimbRefs, b: LimbBaseRotations) { return b.rightHand; }
function bLUA(l: LimbRefs, b: LimbBaseRotations) { return baseFor(l, b, "leftUpperArm", "leftArm"); }
function bLFA(_l: LimbRefs, b: LimbBaseRotations) { return b.leftForearm; }
function bLH(_l: LimbRefs, b: LimbBaseRotations) { return b.leftHand; }
function bRUL(l: LimbRefs, b: LimbBaseRotations) { return baseFor(l, b, "rightUpperLeg", "rightLeg"); }
function bRLL(_l: LimbRefs, b: LimbBaseRotations) { return b.rightLowerLeg; }
function bRFt(_l: LimbRefs, b: LimbBaseRotations) { return b.rightFoot; }
function bLUL(l: LimbRefs, b: LimbBaseRotations) { return baseFor(l, b, "leftUpperLeg", "leftLeg"); }
function bLLL(_l: LimbRefs, b: LimbBaseRotations) { return b.leftLowerLeg; }
function bLFt(_l: LimbRefs, b: LimbBaseRotations) { return b.leftFoot; }
function bSp(l: LimbRefs, b: LimbBaseRotations) { return baseFor(l, b, "spine", "torso"); }
function bHp(_l: LimbRefs, b: LimbBaseRotations) { return b.hips; }
function bHd(_l: LimbRefs, b: LimbBaseRotations) { return b.head; }
function bNk(_l: LimbRefs, b: LimbBaseRotations) { return b.neck; }

export interface AnimState {
  walkCycle: number;
  attackPhase: number;
  hitFlash: number;
  deathProgress: number;
  comboStep: number;
}

export function createAnimState(): AnimState {
  return { walkCycle: 0, attackPhase: 0, hitFlash: 0, deathProgress: 0, comboStep: 0 };
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
  const breathe = Math.sin(t * 2.0 + seed) * (noLimbs ? 0.06 : 0.015);
  const sway = Math.sin(t * 0.6 + seed) * (noLimbs ? 0.06 : 0.02);

  inner.rotation.x = THREE.MathUtils.lerp(inner.rotation.x, 0.05, delta * 6);
  inner.rotation.z = THREE.MathUtils.lerp(inner.rotation.z, sway, delta * 4);
  inner.position.y = breathe;

  if (noLimbs) {
    inner.rotation.x = THREE.MathUtils.lerp(inner.rotation.x, Math.sin(t * 1.5 + seed) * 0.04, delta * 5);
    inner.rotation.y = THREE.MathUtils.lerp(inner.rotation.y || 0, Math.sin(t * 0.8 + seed + 1) * 0.05, delta * 3);
    return;
  }

  if (!limbs || !bases) return;

  const guardPulse = Math.sin(t * 1.8 + seed) * 0.04;
  const weightShift = Math.sin(t * 0.9 + seed) * 0.03;

  lerpRot(rUA(limbs), bUA(limbs, bases), -1.2 + guardPulse, undefined, 0.6, 5, delta);
  lerpRot(rFA(limbs), bFA(limbs, bases), -1.0, undefined, undefined, 5, delta);
  lerpRot(rH(limbs), bRH(limbs, bases), -0.3, undefined, undefined, 5, delta);

  lerpRot(lUA(limbs), bLUA(limbs, bases), -1.2 - guardPulse * 0.7, undefined, -0.5, 5, delta);
  lerpRot(lFA(limbs), bLFA(limbs, bases), -1.1, undefined, undefined, 5, delta);
  lerpRot(lH(limbs), bLH(limbs, bases), -0.3, undefined, undefined, 5, delta);

  lerpRot(rUL(limbs), bRUL(limbs, bases), -0.08 + weightShift, undefined, undefined, 4, delta);
  lerpRot(rLL(limbs), bRLL(limbs, bases), 0.15, undefined, undefined, 4, delta);
  lerpRot(lUL(limbs), bLUL(limbs, bases), 0.05 - weightShift, undefined, undefined, 4, delta);
  lerpRot(lLL(limbs), bLLL(limbs, bases), 0.1, undefined, undefined, 4, delta);

  lerpRot(sp(limbs), bSp(limbs, bases), 0.05, undefined, sway * 0.5, 5, delta);
  lerpRot(hp(limbs), bHp(limbs, bases), undefined, weightShift * 0.3, undefined, 4, delta);

  const headBob = Math.sin(t * 1.5 + seed) * 0.03;
  lerpRot(hd(limbs), bHd(limbs, bases), headBob, undefined, undefined, 5, delta);
  lerpRot(nk(limbs), bNk(limbs, bases), headBob * 0.5, undefined, undefined, 5, delta);
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
  const bounce = Math.abs(Math.sin(anim.walkCycle)) * (noLimbs ? 0.14 : isRunning ? 0.06 : 0.03);
  const tilt = noLimbs ? 0.2 : isRunning ? 0.1 : 0.06;

  inner.rotation.x = THREE.MathUtils.lerp(inner.rotation.x, tilt, delta * 8);
  inner.position.y = bounce;
  inner.rotation.z = THREE.MathUtils.lerp(inner.rotation.z, Math.sin(anim.walkCycle * 0.5) * (noLimbs ? 0.1 : 0.04), delta * 6);

  if (noLimbs) {
    inner.rotation.y = THREE.MathUtils.lerp(inner.rotation.y || 0, Math.sin(anim.walkCycle * 0.5) * 0.1, delta * 6);
    return;
  }

  if (!limbs || !bases) return;

  const armAmp = isRunning ? 0.8 : 0.45;
  const legAmp = isRunning ? 0.9 : 0.55;

  lerpRot(rUA(limbs), bUA(limbs, bases), stride * armAmp - 0.4, undefined, -0.1, 10, delta);
  lerpRot(rFA(limbs), bFA(limbs, bases), -0.6 - Math.max(0, stride) * 0.4, undefined, undefined, 10, delta);
  lerpRot(lUA(limbs), bLUA(limbs, bases), -stride * armAmp - 0.4, undefined, 0.1, 10, delta);
  lerpRot(lFA(limbs), bLFA(limbs, bases), -0.6 - Math.max(0, -stride) * 0.4, undefined, undefined, 10, delta);

  lerpRot(rUL(limbs), bRUL(limbs, bases), -stride * legAmp, undefined, undefined, 10, delta);
  lerpRot(rLL(limbs), bRLL(limbs, bases), Math.max(0, stride) * 0.8, undefined, undefined, 10, delta);
  lerpRot(rFt(limbs), bRFt(limbs, bases), stride * 0.15, undefined, undefined, 10, delta);
  lerpRot(lUL(limbs), bLUL(limbs, bases), stride * legAmp, undefined, undefined, 10, delta);
  lerpRot(lLL(limbs), bLLL(limbs, bases), Math.max(0, -stride) * 0.8, undefined, undefined, 10, delta);
  lerpRot(lFt(limbs), bLFt(limbs, bases), -stride * 0.15, undefined, undefined, 10, delta);

  lerpRot(sp(limbs), bSp(limbs, bases), 0.05, Math.sin(anim.walkCycle * 0.5) * 0.04, undefined, 8, delta);
  lerpRot(hp(limbs), bHp(limbs, bases), undefined, -Math.sin(anim.walkCycle * 0.5) * 0.06, undefined, 8, delta);

  const headBob = Math.sin(anim.walkCycle * 2) * 0.025;
  lerpRot(hd(limbs), bHd(limbs, bases), headBob, undefined, undefined, 5, delta);
}

export function animatePunch(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  anim: AnimState,
  delta: number,
  _t: number
) {
  const noLimbs = !limbs;
  anim.attackPhase = THREE.MathUtils.lerp(anim.attackPhase, 1, delta * 20);
  const p = anim.attackPhase;
  const swing = Math.sin(p * Math.PI);
  const snap = Math.sin(p * Math.PI * 0.5);

  const combo = anim.comboStep % 4;

  if (noLimbs) {
    const amp = 2.5;
    if (combo === 0) {
      inner.rotation.x = swing * 0.2 * amp;
      inner.position.z = snap * 0.25 * amp;
    } else if (combo === 1) {
      inner.rotation.x = swing * 0.25 * amp;
      inner.rotation.y = -swing * 0.15 * amp;
      inner.position.z = snap * 0.3 * amp;
    } else if (combo === 2) {
      inner.rotation.y = swing * 0.5 * amp;
      inner.position.z = snap * 0.2 * amp;
    } else {
      inner.rotation.x = -swing * 0.3 * amp;
      inner.position.y = swing * 0.3 * amp;
      inner.position.z = snap * 0.15 * amp;
    }
    inner.position.y += swing * 0.05 * amp;
    return;
  }

  if (!limbs || !bases) return;

  if (combo === 0) {
    setRot(sp(limbs), bSp(limbs, bases), 0.1, -swing * 0.15, undefined);
    setRot(hp(limbs), bHp(limbs, bases), undefined, swing * 0.08, undefined);
    setRot(rUA(limbs), bUA(limbs, bases), -1.4 * snap, undefined, 0.3 - swing * 0.2);
    setRot(rFA(limbs), bFA(limbs, bases), -0.8 * snap, undefined, undefined);
    setRot(rH(limbs), bRH(limbs, bases), -0.5 * snap, undefined, undefined);
    lerpRot(lUA(limbs), bLUA(limbs, bases), -1.3, undefined, -0.5, 10, delta);
    lerpRot(lFA(limbs), bLFA(limbs, bases), -1.2, undefined, undefined, 10, delta);
    inner.position.z = snap * 0.12;
  } else if (combo === 1) {
    setRot(sp(limbs), bSp(limbs, bases), 0.12, swing * 0.2, undefined);
    setRot(hp(limbs), bHp(limbs, bases), undefined, -swing * 0.1, undefined);
    setRot(lUA(limbs), bLUA(limbs, bases), -1.5 * snap, undefined, -0.3 + swing * 0.2);
    setRot(lFA(limbs), bLFA(limbs, bases), -0.7 * snap, undefined, undefined);
    setRot(lH(limbs), bLH(limbs, bases), -0.5 * snap, undefined, undefined);
    lerpRot(rUA(limbs), bUA(limbs, bases), -1.3, undefined, 0.5, 10, delta);
    lerpRot(rFA(limbs), bFA(limbs, bases), -1.2, undefined, undefined, 10, delta);
    inner.position.z = snap * 0.15;
  } else if (combo === 2) {
    setRot(sp(limbs), bSp(limbs, bases), 0.08, swing * 0.45, undefined);
    setRot(hp(limbs), bHp(limbs, bases), undefined, swing * 0.25, undefined);
    setRot(rUA(limbs), bUA(limbs, bases), -0.8, swing * 1.2, 1.2 * snap);
    setRot(rFA(limbs), bFA(limbs, bases), -1.4 * snap, undefined, undefined);
    setRot(rH(limbs), bRH(limbs, bases), -0.4, swing * 0.3, undefined);
    lerpRot(lUA(limbs), bLUA(limbs, bases), -1.2, undefined, -0.5, 10, delta);
    lerpRot(lFA(limbs), bLFA(limbs, bases), -1.1, undefined, undefined, 10, delta);
    inner.position.z = snap * 0.08;
    inner.rotation.y = swing * 0.15;
  } else {
    setRot(sp(limbs), bSp(limbs, bases), -0.15 * swing, -swing * 0.12, undefined);
    setRot(hp(limbs), bHp(limbs, bases), -swing * 0.08, undefined, undefined);
    setRot(rUA(limbs), bUA(limbs, bases), -2.0 * snap, undefined, 0.4);
    setRot(rFA(limbs), bFA(limbs, bases), -1.5 * snap, undefined, undefined);
    setRot(rH(limbs), bRH(limbs, bases), -0.6 * snap, undefined, undefined);
    lerpRot(lUA(limbs), bLUA(limbs, bases), -1.3, undefined, -0.5, 10, delta);
    lerpRot(lFA(limbs), bLFA(limbs, bases), -1.2, undefined, undefined, 10, delta);
    inner.position.y = swing * 0.08;
    setRot(rUL(limbs), bRUL(limbs, bases), -swing * 0.15, undefined, undefined);
    setRot(lUL(limbs), bLUL(limbs, bases), swing * 0.1, undefined, undefined);
  }

  lerpRot(rUL(limbs), bRUL(limbs, bases), -0.08 + swing * 0.05, undefined, undefined, 8, delta);
  lerpRot(rLL(limbs), bRLL(limbs, bases), 0.15, undefined, undefined, 8, delta);
  lerpRot(lUL(limbs), bLUL(limbs, bases), 0.05, undefined, undefined, 8, delta);
  lerpRot(lLL(limbs), bLLL(limbs, bases), 0.1, undefined, undefined, 8, delta);

  const headTrack = swing * 0.08;
  setRot(hd(limbs), bHd(limbs, bases), -headTrack, combo === 2 ? swing * 0.1 : 0, undefined);
  setRot(nk(limbs), bNk(limbs, bases), -headTrack * 0.5, undefined, undefined);
}

export function animateKick(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  anim: AnimState,
  delta: number
) {
  const noLimbs = !limbs;
  anim.attackPhase = THREE.MathUtils.lerp(anim.attackPhase, 1, delta * 18);
  const p = anim.attackPhase;
  const swing = Math.sin(p * Math.PI);
  const snap = Math.sin(p * Math.PI * 0.5);

  const combo = anim.comboStep % 3;

  if (noLimbs) {
    const amp = 2.5;
    if (combo === 0) {
      inner.rotation.x = -swing * 0.2 * amp;
      inner.position.y = swing * 0.15 * amp;
      inner.position.z = snap * 0.2 * amp;
    } else if (combo === 1) {
      inner.rotation.y = swing * 0.6 * amp;
      inner.rotation.z = swing * 0.15 * amp;
      inner.position.y = swing * 0.1 * amp;
    } else {
      inner.rotation.x = -swing * 0.3 * amp;
      inner.position.y = swing * 0.25 * amp;
    }
    return;
  }

  if (!limbs || !bases) return;

  if (combo === 0) {
    setRot(sp(limbs), bSp(limbs, bases), -0.1 * swing, undefined, undefined);
    setRot(hp(limbs), bHp(limbs, bases), -swing * 0.05, undefined, undefined);
    setRot(rUL(limbs), bRUL(limbs, bases), -1.4 * snap, undefined, undefined);
    setRot(rLL(limbs), bRLL(limbs, bases), 0.5 * (1 - snap), undefined, undefined);
    setRot(rFt(limbs), bRFt(limbs, bases), -0.5 * snap, undefined, undefined);
    lerpRot(lUL(limbs), bLUL(limbs, bases), 0.15, undefined, undefined, 8, delta);
    lerpRot(lLL(limbs), bLLL(limbs, bases), 0.2, undefined, undefined, 8, delta);
    inner.position.z = snap * 0.1;
  } else if (combo === 1) {
    setRot(sp(limbs), bSp(limbs, bases), 0.05, swing * 0.3, swing * 0.1);
    setRot(hp(limbs), bHp(limbs, bases), undefined, swing * 0.4, swing * 0.1);
    setRot(rUL(limbs), bRUL(limbs, bases), -0.5, swing * 1.2 * snap, 0.8 * snap);
    setRot(rLL(limbs), bRLL(limbs, bases), 0.4 * (1 - snap), undefined, undefined);
    setRot(rFt(limbs), bRFt(limbs, bases), -0.3 * snap, undefined, swing * 0.2);
    lerpRot(lUL(limbs), bLUL(limbs, bases), 0.2, undefined, -0.1, 8, delta);
    lerpRot(lLL(limbs), bLLL(limbs, bases), 0.3, undefined, undefined, 8, delta);
    inner.position.y = swing * 0.05;
  } else {
    setRot(sp(limbs), bSp(limbs, bases), -0.15 * swing, undefined, -swing * 0.05);
    setRot(hp(limbs), bHp(limbs, bases), -swing * 0.1, undefined, undefined);
    setRot(rUL(limbs), bRUL(limbs, bases), -1.8 * snap, undefined, undefined);
    setRot(rLL(limbs), bRLL(limbs, bases), 0.3, undefined, undefined);
    setRot(rFt(limbs), bRFt(limbs, bases), -0.6 * snap, undefined, undefined);
    lerpRot(lUL(limbs), bLUL(limbs, bases), 0.15, undefined, undefined, 8, delta);
    lerpRot(lLL(limbs), bLLL(limbs, bases), 0.25, undefined, undefined, 8, delta);
    inner.position.y = swing * 0.12;
  }

  lerpRot(rUA(limbs), bUA(limbs, bases), -1.0, undefined, 0.4 + swing * 0.2, 8, delta);
  lerpRot(rFA(limbs), bFA(limbs, bases), -0.8, undefined, undefined, 8, delta);
  lerpRot(lUA(limbs), bLUA(limbs, bases), -1.1, undefined, -0.4 - swing * 0.15, 8, delta);
  lerpRot(lFA(limbs), bLFA(limbs, bases), -0.9, undefined, undefined, 8, delta);

  setRot(hd(limbs), bHd(limbs, bases), swing * 0.06, combo === 1 ? swing * 0.1 : 0, undefined);
}

export function animateSpecial(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  anim: AnimState,
  delta: number
) {
  const noLimbs = !limbs;
  anim.attackPhase = THREE.MathUtils.lerp(anim.attackPhase, 1, delta * 16);
  const p = anim.attackPhase;
  const swing = Math.sin(p * Math.PI);
  const spin = Math.sin(p * Math.PI * 2);

  const combo = anim.comboStep % 2;

  if (noLimbs) {
    const amp = 2.0;
    inner.rotation.x = swing * 0.3 * amp;
    inner.rotation.y = spin * 0.8 * amp;
    inner.position.y = swing * 0.25 * amp;
    return;
  }

  if (!limbs || !bases) return;

  if (combo === 0) {
    setRot(sp(limbs), bSp(limbs, bases), 0.15 * swing, spin * 0.5, swing * 0.1);
    setRot(hp(limbs), bHp(limbs, bases), undefined, -spin * 0.3, undefined);

    setRot(rUA(limbs), bUA(limbs, bases), -0.6, swing * 0.8, 1.5 * swing);
    setRot(rFA(limbs), bFA(limbs, bases), -1.8 * swing, undefined, undefined);
    setRot(rH(limbs), bRH(limbs, bases), -0.5, undefined, undefined);
    lerpRot(lUA(limbs), bLUA(limbs, bases), -1.3, undefined, -0.6, 10, delta);
    lerpRot(lFA(limbs), bLFA(limbs, bases), -1.0, undefined, undefined, 10, delta);

    setRot(rUL(limbs), bRUL(limbs, bases), -swing * 0.3, undefined, undefined);
    setRot(lUL(limbs), bLUL(limbs, bases), swing * 0.2, undefined, undefined);

    inner.position.y = swing * 0.05;
    inner.rotation.y = spin * 0.1;
  } else {
    const knee = Math.min(1, p * 2);
    const kneeSwing = Math.sin(knee * Math.PI);

    setRot(sp(limbs), bSp(limbs, bases), -0.2 * kneeSwing, swing * 0.15, undefined);
    setRot(hp(limbs), bHp(limbs, bases), -kneeSwing * 0.15, undefined, undefined);

    setRot(rUL(limbs), bRUL(limbs, bases), -1.6 * kneeSwing, undefined, undefined);
    setRot(rLL(limbs), bRLL(limbs, bases), 0.4 * kneeSwing, undefined, undefined);
    setRot(rFt(limbs), bRFt(limbs, bases), -0.4 * kneeSwing, undefined, undefined);
    lerpRot(lUL(limbs), bLUL(limbs, bases), 0.2, undefined, undefined, 8, delta);
    lerpRot(lLL(limbs), bLLL(limbs, bases), 0.3, undefined, undefined, 8, delta);

    lerpRot(rUA(limbs), bUA(limbs, bases), -1.0, undefined, 0.5, 8, delta);
    lerpRot(lUA(limbs), bLUA(limbs, bases), -1.0, undefined, -0.5, 8, delta);

    inner.position.y = kneeSwing * 0.1;
  }

  setRot(hd(limbs), bHd(limbs, bases), -swing * 0.15, spin * 0.08, undefined);
}

export function animateUltimate(
  inner: THREE.Object3D,
  limbs: LimbRefs | null,
  bases: LimbBaseRotations | null,
  anim: AnimState,
  delta: number
) {
  const noLimbs = !limbs;
  anim.attackPhase = THREE.MathUtils.lerp(anim.attackPhase, 1, delta * 10);
  const p = anim.attackPhase;

  const charge = Math.min(1, p * 2.5);
  const release = Math.max(0, (p - 0.4) / 0.6);
  const chargeSwing = Math.sin(charge * Math.PI * 0.5);
  const releaseSwing = Math.sin(release * Math.PI);
  const pulse = Math.sin(p * Math.PI * 6) * (1 - p) * 0.5;

  if (noLimbs) {
    const amp = 2.0;
    inner.rotation.x = (chargeSwing * -0.3 + releaseSwing * 0.5) * amp;
    inner.position.y = (chargeSwing * -0.15 + releaseSwing * 0.5) * amp;
    inner.scale.setScalar(1 + releaseSwing * 0.2 + pulse * 0.05);
    inner.rotation.y = pulse * 0.3;
    return;
  }

  if (!limbs || !bases) return;

  inner.scale.setScalar(1 + releaseSwing * 0.12 + pulse * 0.03);

  setRot(sp(limbs), bSp(limbs, bases),
    chargeSwing * -0.3 + releaseSwing * 0.3,
    pulse * 0.15,
    releaseSwing * 0.05
  );
  setRot(hp(limbs), bHp(limbs, bases),
    chargeSwing * -0.15 + releaseSwing * 0.1,
    undefined,
    undefined
  );

  setRot(rUA(limbs), bUA(limbs, bases),
    chargeSwing * -0.6 + releaseSwing * -2.2,
    undefined,
    chargeSwing * 0.3 + releaseSwing * 1.2
  );
  setRot(rFA(limbs), bFA(limbs, bases),
    chargeSwing * -1.5 + releaseSwing * -0.5,
    undefined,
    undefined
  );
  setRot(rH(limbs), bRH(limbs, bases), -0.4 * releaseSwing, undefined, undefined);

  setRot(lUA(limbs), bLUA(limbs, bases),
    chargeSwing * -0.6 + releaseSwing * -2.2,
    undefined,
    chargeSwing * -0.3 + releaseSwing * -1.2
  );
  setRot(lFA(limbs), bLFA(limbs, bases),
    chargeSwing * -1.5 + releaseSwing * -0.5,
    undefined,
    undefined
  );
  setRot(lH(limbs), bLH(limbs, bases), -0.4 * releaseSwing, undefined, undefined);

  setRot(rUL(limbs), bRUL(limbs, bases),
    chargeSwing * 0.2 + releaseSwing * -0.3,
    undefined,
    undefined
  );
  setRot(rLL(limbs), bRLL(limbs, bases), chargeSwing * 0.4, undefined, undefined);
  setRot(lUL(limbs), bLUL(limbs, bases),
    chargeSwing * 0.15 + releaseSwing * -0.2,
    undefined,
    undefined
  );
  setRot(lLL(limbs), bLLL(limbs, bases), chargeSwing * 0.35, undefined, undefined);

  setRot(hd(limbs), bHd(limbs, bases),
    chargeSwing * -0.2 + releaseSwing * 0.15,
    pulse * 0.1,
    undefined
  );

  inner.position.y = chargeSwing * -0.1 + releaseSwing * 0.2;
  inner.rotation.y = pulse * 0.08;
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
  anim.comboStep = variant;
  if (variant % 2 === 0) {
    animatePunch(inner, limbs, bases, anim, delta, t);
  } else {
    animateKick(inner, limbs, bases, anim, delta);
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
  _t: number
) {
  animateWalk(inner, limbs, bases, anim, delta, true);
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
