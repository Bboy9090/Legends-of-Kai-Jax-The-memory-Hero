import { useRef, Suspense, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { CHARACTER_MODELS } from "../models/GLBCharacterModel";
import * as THREE from "three";

interface Props {
  fighterId: string;
  accentColor: string;
}

interface LimbRefs {
  rightArm: THREE.Object3D | null;
  leftArm: THREE.Object3D | null;
  rightLeg: THREE.Object3D | null;
  leftLeg: THREE.Object3D | null;
  torso: THREE.Object3D | null;
  head: THREE.Object3D | null;
}

function findLimbs(root: THREE.Object3D): LimbRefs {
  const limbs: LimbRefs = {
    rightArm: null,
    leftArm: null,
    rightLeg: null,
    leftLeg: null,
    torso: null,
    head: null,
  };

  const armPatterns = /arm|shoulder|hand|claw|wing|forelimb|front.?leg|paw/i;
  const legPatterns = /leg|thigh|knee|foot|hind|rear.?leg|ankle/i;
  const torsoPatterns = /torso|spine|body|chest|hip|pelvis|root|abdomen/i;
  const headPatterns = /head|skull|jaw|neck|face|snout/i;
  const rightPatterns = /right|_r$|\.r$|_r_/i;
  const leftPatterns = /left|_l$|\.l$|_l_/i;

  root.traverse((child) => {
    const name = child.name.toLowerCase();

    if (headPatterns.test(name) && !limbs.head) {
      limbs.head = child;
    } else if (torsoPatterns.test(name) && !limbs.torso) {
      limbs.torso = child;
    } else if (armPatterns.test(name)) {
      if (rightPatterns.test(name) && !limbs.rightArm) {
        limbs.rightArm = child;
      } else if (leftPatterns.test(name) && !limbs.leftArm) {
        limbs.leftArm = child;
      } else if (!limbs.rightArm) {
        limbs.rightArm = child;
      } else if (!limbs.leftArm) {
        limbs.leftArm = child;
      }
    } else if (legPatterns.test(name)) {
      if (rightPatterns.test(name) && !limbs.rightLeg) {
        limbs.rightLeg = child;
      } else if (leftPatterns.test(name) && !limbs.leftLeg) {
        limbs.leftLeg = child;
      } else if (!limbs.rightLeg) {
        limbs.rightLeg = child;
      } else if (!limbs.leftLeg) {
        limbs.leftLeg = child;
      }
    }
  });

  return limbs;
}

function CharacterInner({ fighterId, accentColor }: Props) {
  const config = CHARACTER_MODELS[fighterId];
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const mixerInitialized = useRef(false);
  const limbsRef = useRef<LimbRefs | null>(null);
  const limbsSearched = useRef(false);

  const punchPhase = useRef(0);
  const kickPhase = useRef(0);
  const specialPhase = useRef(0);
  const walkCycle = useRef(0);

  const modelPath = config?.path || "/models/blazing-fox-vanguard.glb";
  const modelScale = config?.scale || 2.5;

  const { scene, animations } = useGLTF(modelPath);

  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  useFrame((state, rawDelta) => {
    if (!groupRef.current || !innerRef.current) return;
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const { player } = useAdventure.getState();

    if (innerRef.current && animations.length > 0 && !mixerInitialized.current) {
      mixerInitialized.current = true;
      const mixer = new THREE.AnimationMixer(innerRef.current);
      mixerRef.current = mixer;
      const action = mixer.clipAction(animations[0]);
      action.play();
    }

    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    if (!limbsSearched.current && innerRef.current) {
      limbsSearched.current = true;
      limbsRef.current = findLimbs(innerRef.current);
    }

    groupRef.current.position.set(player.posX, player.posY, player.posZ);
    groupRef.current.rotation.y = player.rotY;

    const breathe = Math.sin(t * 2.0) * 0.012;
    const speed = player.speed;
    const limbs = limbsRef.current;
    const hasLimbs = limbs && (limbs.rightArm || limbs.leftArm || limbs.rightLeg || limbs.leftLeg);

    if (player.isAttacking) {
      const attackType = player.attackType || "punch";
      const attackProgress = Math.min(1, (player.attackCooldown > 0 ? 1 - (player.attackCooldown / getMaxCooldown(attackType)) : 1));

      if (attackType === "punch") {
        punchPhase.current = THREE.MathUtils.lerp(punchPhase.current, 1, delta * 20);
        const swing = Math.sin(punchPhase.current * Math.PI);

        innerRef.current.rotation.x = swing * 0.25;
        innerRef.current.rotation.z = swing * 0.08;
        innerRef.current.position.z = swing * 0.15;
        innerRef.current.position.y = breathe + swing * 0.05;

        if (hasLimbs && limbs.rightArm) {
          limbs.rightArm.rotation.x = -swing * 1.2;
          limbs.rightArm.rotation.z = swing * 0.3;
        }
        if (hasLimbs && limbs.leftArm) {
          limbs.leftArm.rotation.x = swing * 0.4;
          limbs.leftArm.rotation.z = -swing * 0.2;
        }
      } else if (attackType === "kick") {
        kickPhase.current = THREE.MathUtils.lerp(kickPhase.current, 1, delta * 18);
        const swing = Math.sin(kickPhase.current * Math.PI);

        innerRef.current.rotation.x = -swing * 0.15;
        innerRef.current.rotation.z = swing * 0.12;
        innerRef.current.position.y = breathe + swing * 0.1;

        if (hasLimbs && limbs.rightLeg) {
          limbs.rightLeg.rotation.x = -swing * 1.4;
        }
        if (hasLimbs && limbs.leftLeg) {
          limbs.leftLeg.rotation.x = swing * 0.2;
        }
        if (hasLimbs && limbs.rightArm) {
          limbs.rightArm.rotation.x = swing * 0.3;
        }
      } else if (attackType === "special") {
        specialPhase.current = THREE.MathUtils.lerp(specialPhase.current, 1, delta * 15);
        const swing = Math.sin(specialPhase.current * Math.PI);
        const spin = Math.sin(specialPhase.current * Math.PI * 2);

        innerRef.current.rotation.x = swing * 0.3;
        innerRef.current.rotation.y = spin * 0.6;
        innerRef.current.position.y = breathe + swing * 0.2;

        if (hasLimbs && limbs.rightArm) {
          limbs.rightArm.rotation.x = -swing * 1.5;
          limbs.rightArm.rotation.z = swing * 0.8;
        }
        if (hasLimbs && limbs.leftArm) {
          limbs.leftArm.rotation.x = -swing * 1.3;
          limbs.leftArm.rotation.z = -swing * 0.8;
        }
      } else if (attackType === "ultimate") {
        specialPhase.current = THREE.MathUtils.lerp(specialPhase.current, 1, delta * 12);
        const swing = Math.sin(specialPhase.current * Math.PI);

        innerRef.current.rotation.x = swing * 0.4;
        innerRef.current.position.y = breathe + swing * 0.35;
        innerRef.current.scale.setScalar(1 + swing * 0.08);

        if (hasLimbs) {
          if (limbs.rightArm) {
            limbs.rightArm.rotation.x = -swing * 1.8;
            limbs.rightArm.rotation.z = swing * 1.0;
          }
          if (limbs.leftArm) {
            limbs.leftArm.rotation.x = -swing * 1.8;
            limbs.leftArm.rotation.z = -swing * 1.0;
          }
          if (limbs.rightLeg) {
            limbs.rightLeg.rotation.x = swing * 0.3;
          }
          if (limbs.leftLeg) {
            limbs.leftLeg.rotation.x = -swing * 0.3;
          }
        }
      }
    } else {
      punchPhase.current = THREE.MathUtils.lerp(punchPhase.current, 0, delta * 10);
      kickPhase.current = THREE.MathUtils.lerp(kickPhase.current, 0, delta * 10);
      specialPhase.current = THREE.MathUtils.lerp(specialPhase.current, 0, delta * 10);

      innerRef.current.scale.setScalar(1);

      if (player.isMoving) {
        walkCycle.current += delta * (player.isRunning ? 12 : 8);
        const stride = Math.sin(walkCycle.current);
        const bounce = Math.abs(Math.sin(walkCycle.current)) * (player.isRunning ? 0.06 : 0.03);

        const tilt = player.isRunning ? 0.12 : 0.06;
        innerRef.current.rotation.x = THREE.MathUtils.lerp(
          innerRef.current.rotation.x, tilt, delta * 8
        );
        innerRef.current.position.y = breathe + bounce;

        const sideSwing = Math.sin(walkCycle.current * 0.5) * (player.isRunning ? 0.06 : 0.03);
        innerRef.current.rotation.z = THREE.MathUtils.lerp(
          innerRef.current.rotation.z, sideSwing, delta * 6
        );

        if (hasLimbs) {
          const armSwing = stride * (player.isRunning ? 0.7 : 0.4);
          const legSwing = stride * (player.isRunning ? 0.8 : 0.5);

          if (limbs.rightArm) {
            limbs.rightArm.rotation.x = THREE.MathUtils.lerp(
              limbs.rightArm.rotation.x, armSwing, delta * 10
            );
          }
          if (limbs.leftArm) {
            limbs.leftArm.rotation.x = THREE.MathUtils.lerp(
              limbs.leftArm.rotation.x, -armSwing, delta * 10
            );
          }
          if (limbs.rightLeg) {
            limbs.rightLeg.rotation.x = THREE.MathUtils.lerp(
              limbs.rightLeg.rotation.x, -legSwing, delta * 10
            );
          }
          if (limbs.leftLeg) {
            limbs.leftLeg.rotation.x = THREE.MathUtils.lerp(
              limbs.leftLeg.rotation.x, legSwing, delta * 10
            );
          }
        }
      } else {
        walkCycle.current = 0;

        innerRef.current.rotation.x = THREE.MathUtils.lerp(
          innerRef.current.rotation.x, 0, delta * 6
        );
        innerRef.current.position.y = breathe;

        const idleSway = Math.sin(t * 0.6) * 0.015;
        innerRef.current.rotation.z = THREE.MathUtils.lerp(
          innerRef.current.rotation.z, idleSway, delta * 4
        );

        if (hasLimbs) {
          const idleArm = Math.sin(t * 1.2) * 0.08;
          if (limbs.rightArm) {
            limbs.rightArm.rotation.x = THREE.MathUtils.lerp(
              limbs.rightArm.rotation.x, idleArm, delta * 4
            );
            limbs.rightArm.rotation.z = THREE.MathUtils.lerp(
              limbs.rightArm.rotation.z, 0, delta * 4
            );
          }
          if (limbs.leftArm) {
            limbs.leftArm.rotation.x = THREE.MathUtils.lerp(
              limbs.leftArm.rotation.x, -idleArm * 0.8, delta * 4
            );
            limbs.leftArm.rotation.z = THREE.MathUtils.lerp(
              limbs.leftArm.rotation.z, 0, delta * 4
            );
          }
          if (limbs.rightLeg) {
            limbs.rightLeg.rotation.x = THREE.MathUtils.lerp(
              limbs.rightLeg.rotation.x, 0, delta * 4
            );
          }
          if (limbs.leftLeg) {
            limbs.leftLeg.rotation.x = THREE.MathUtils.lerp(
              limbs.leftLeg.rotation.x, 0, delta * 4
            );
          }
        }
      }
    }

    if (hasLimbs && limbs.head) {
      const headBob = player.isMoving
        ? Math.sin(walkCycle.current * 2) * 0.03
        : Math.sin(t * 1.5) * 0.02;
      limbs.head.rotation.x = THREE.MathUtils.lerp(
        limbs.head.rotation.x, headBob, delta * 5
      );
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef} scale={modelScale}>
        <primitive object={clonedScene} castShadow receiveShadow />
      </group>
      <pointLight
        position={[0, 2, 0.5]}
        color={accentColor}
        intensity={0.4}
        distance={4}
        decay={2}
      />
    </group>
  );
}

function getMaxCooldown(type: string): number {
  const map: Record<string, number> = {
    punch: 0.3,
    kick: 0.3,
    special: 0.6,
    ultimate: 1.0,
  };
  return map[type] || 0.3;
}

export default function AdventureCharacter(props: Props) {
  return (
    <Suspense fallback={null}>
      <CharacterInner {...props} />
    </Suspense>
  );
}
