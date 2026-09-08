import { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';
import type { FangCombatantState, FangCombatantBehavior } from '../../../../game/characters/fang/FangCombatantContract';

interface FangCombatantVisualProps {
  state: FangCombatantState;
}

function getVisualStateForBehavior(behavior: FangCombatantBehavior, attackWindupTimer: number, health: number) {
  const maxWindup = 0.35;
  const windupProgress = health <= 0 ? 0 : Math.min(1, attackWindupTimer / maxWindup);

  const baseColor = {
    IDLE: '#37214f',
    CHASE: '#4c1f5a',
    WINDUP: '#8b2e2e',
    RECOVERY: '#3d2947',
    STAGGER: '#2d3d5f',
    DEAD: '#1a1520',
  }[behavior];

  const emissiveColor = {
    IDLE: '#2854b8',
    CHASE: '#5a6ef8',
    WINDUP: '#ff3333',
    RECOVERY: '#5a4d7a',
    STAGGER: '#6b7fc9',
    DEAD: '#000000',
  }[behavior];

  const emissiveIntensity = {
    IDLE: 0.34,
    CHASE: 0.55,
    WINDUP: 0.8 + 0.4 * Math.sin(Date.now() * 0.01),
    RECOVERY: 0.25,
    STAGGER: 0.6,
    DEAD: 0,
  }[behavior];

  const scale =
    behavior === 'WINDUP' ? 1 + windupProgress * 0.12 : behavior === 'STAGGER' ? 0.95 : 1;

  const rotationY = behavior === 'CHASE' ? 0.1 : 0;

  return { baseColor, emissiveColor, emissiveIntensity: emissiveIntensity as number, scale, rotationY };
}

function FangModelContent({ state }: { state: FangCombatantState }) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/Meshy_AI_Voltage_Fang_0219222028_texture.glb');

  const visualState = useMemo(
    () => getVisualStateForBehavior(state.behavior, state.attackWindupTimer, state.health),
    [state.behavior, state.attackWindupTimer, state.health]
  );

  useFrame(() => {
    if (!groupRef.current) return;

    const modelGroup = modelRef.current;
    if (modelGroup) {
      modelGroup.scale.set(visualState.scale, visualState.scale, visualState.scale);
      modelGroup.rotation.y = visualState.rotationY;

      modelGroup.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          const mat = node.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.color.setHex(parseInt(visualState.baseColor.slice(1), 16));
            mat.emissive.setHex(parseInt(visualState.emissiveColor.slice(1), 16));
            mat.emissiveIntensity = visualState.emissiveIntensity;
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={modelRef} castShadow>
        <Clone object={scene} castShadow />
      </group>

      {state.behavior === 'WINDUP' && (
        <mesh position={[0, 0.5, 0]}>
          <torusGeometry args={[0.8, 0.15, 8, 16]} />
          <meshStandardMaterial
            color="#ff3333"
            emissive="#ff0000"
            emissiveIntensity={0.6 + 0.3 * Math.sin(Date.now() * 0.015)}
            transparent
            opacity={0.6 * (1 - Math.pow((state.attackWindupTimer / 0.35) * 0.8, 2))}
            depthWrite={false}
          />
        </mesh>
      )}

      {state.isStaggered && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[1.2, 8, 8]} />
          <meshStandardMaterial
            color="#6b7fc9"
            emissive="#4d5fa3"
            emissiveIntensity={0.7}
            wireframe
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export function FangCombatantVisual({ state }: FangCombatantVisualProps) {
  return (
    <Suspense fallback={null}>
      <FangModelContent state={state} />
    </Suspense>
  );
}
