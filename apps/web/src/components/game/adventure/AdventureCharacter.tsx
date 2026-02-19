import { useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Clone } from "@react-three/drei";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { CHARACTER_MODELS } from "../models/GLBCharacterModel";
import * as THREE from "three";

interface Props {
  fighterId: string;
  accentColor: string;
}

function CharacterInner({ fighterId, accentColor }: Props) {
  const config = CHARACTER_MODELS[fighterId];
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const mixerInitialized = useRef(false);

  const modelPath = config?.path || "/models/blazing-fox-vanguard.glb";
  const modelScale = config?.scale || 2.5;

  const { scene, animations } = useGLTF(modelPath);

  useFrame((state, rawDelta) => {
    if (!groupRef.current) return;
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

    groupRef.current.position.set(player.posX, player.posY, player.posZ);
    groupRef.current.rotation.y = player.rotY;

    const breathe = Math.sin(t * 2.0) * 0.015;
    const speed = player.speed;
    const walkBob = player.isMoving ? Math.sin(t * (8 + speed * 1.5)) * 0.03 * Math.min(speed / 5, 1) : 0;

    if (innerRef.current) {
      innerRef.current.position.y = breathe + walkBob;

      if (player.isAttacking) {
        const leanMap: Record<string, number> = {
          punch: 0.2,
          kick: -0.15,
          special: 0.3,
          ultimate: 0.35,
        };
        const target = leanMap[player.attackType || "punch"] || 0.15;
        innerRef.current.rotation.x = THREE.MathUtils.lerp(
          innerRef.current.rotation.x,
          target,
          delta * 12
        );
      } else if (player.isMoving) {
        const tilt = player.isRunning ? 0.1 : 0.05;
        innerRef.current.rotation.x = THREE.MathUtils.lerp(
          innerRef.current.rotation.x,
          tilt,
          delta * 6
        );
      } else {
        innerRef.current.rotation.x = THREE.MathUtils.lerp(
          innerRef.current.rotation.x,
          0,
          delta * 6
        );
      }

      const sway = player.isMoving
        ? Math.sin(t * (6 + speed)) * 0.04 * Math.min(speed / 5, 1)
        : Math.sin(t * 0.6) * 0.02;
      innerRef.current.rotation.z = sway;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef} scale={modelScale}>
        <Clone object={scene} castShadow receiveShadow />
      </group>
      <pointLight
        position={[0, 2, 0.5]}
        color={accentColor}
        intensity={1.5}
        distance={5}
        decay={2}
      />
      <spotLight
        position={[0, 4, 0]}
        angle={0.5}
        penumbra={0.8}
        color={accentColor}
        intensity={0.5}
        distance={6}
        castShadow={false}
        target-position={[0, 0, 0]}
      />
    </group>
  );
}

export default function AdventureCharacter(props: Props) {
  return (
    <Suspense fallback={null}>
      <CharacterInner {...props} />
    </Suspense>
  );
}
