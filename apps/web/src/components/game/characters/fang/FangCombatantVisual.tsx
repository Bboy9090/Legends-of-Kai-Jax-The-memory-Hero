import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';
import {
  getFangCombatantConfig,
  type FangCombatantArchetype,
  type FangCombatantState,
  type FangCombatantBehavior,
} from '../../../../game/characters/fang/FangCombatantContract';

interface FangCombatantVisualProps {
  state: FangCombatantState;
}

const ROLE_STYLE: Record<FangCombatantArchetype, {
  scale: number;
  accent: string;
  telegraph: string;
}> = {
  baseline: { scale: 1, accent: '#2360D1', telegraph: '#E4511E' },
  'razor-scout': { scale: 0.9, accent: '#2360D1', telegraph: '#6f8cff' },
  enforcer: { scale: 1.1, accent: '#E4511E', telegraph: '#ff7a35' },
  'chain-bruiser': { scale: 1.18, accent: '#C7C3BB', telegraph: '#d5c8ad' },
  'district-lieutenant': { scale: 1.25, accent: '#4A2A7A', telegraph: '#E4511E' },
};

function getBehaviorColors(behavior: FangCombatantBehavior) {
  const baseColor = {
    IDLE: '#37214f',
    CHASE: '#4c1f5a',
    WINDUP: '#6b244c',
    RECOVERY: '#3d2947',
    STAGGER: '#2d3d5f',
    DEAD: '#1a1520',
  }[behavior];

  const emissiveIntensity = {
    IDLE: 0.34,
    CHASE: 0.55,
    WINDUP: 0.9,
    RECOVERY: 0.25,
    STAGGER: 0.6,
    DEAD: 0,
  }[behavior];

  return { baseColor, emissiveIntensity };
}

function FangModelContent({ state }: { state: FangCombatantState }) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const telegraphRef = useRef<THREE.Mesh>(null);
  const { scene } = useGLTF('/models/Meshy_AI_Voltage_Fang_0219222028_texture.glb');
  const roleStyle = ROLE_STYLE[state.archetype];
  const config = getFangCombatantConfig(state);

  useFrame((frameState) => {
    const modelGroup = modelRef.current;
    if (!modelGroup) return;

    const { baseColor, emissiveIntensity } = getBehaviorColors(state.behavior);
    const maxWindup = Math.max(0.001, config.attackWindup);
    const windupProgress = state.health <= 0
      ? 0
      : THREE.MathUtils.clamp(1 - state.attackWindupTimer / maxWindup, 0, 1);
    const behaviorScale = state.behavior === 'WINDUP'
      ? 1 + windupProgress * 0.1
      : state.behavior === 'STAGGER'
        ? 0.96
        : 1;
    const scale = roleStyle.scale * behaviorScale;
    const pulse = 0.5 + 0.5 * Math.sin(frameState.clock.elapsedTime * 10);

    modelGroup.scale.setScalar(scale);
    modelGroup.rotation.y = state.behavior === 'CHASE' ? 0.1 : 0;

    modelGroup.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      const mat = node.material as THREE.MeshStandardMaterial;
      if (!mat) return;

      mat.color.set(baseColor);
      mat.emissive.set(roleStyle.accent);
      mat.emissiveIntensity = state.behavior === 'WINDUP'
        ? emissiveIntensity + pulse * 0.35
        : emissiveIntensity;
    });

    if (telegraphRef.current) {
      const material = telegraphRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.55 + pulse * 0.35;
      material.opacity = 0.25 + windupProgress * 0.5;
      telegraphRef.current.scale.setScalar(0.9 + windupProgress * 0.35);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={modelRef} castShadow>
        <Clone object={scene} castShadow />
      </group>

      {state.behavior === 'WINDUP' && (
        <mesh ref={telegraphRef} position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8 * roleStyle.scale, 0.15, 8, 20]} />
          <meshStandardMaterial
            color={roleStyle.telegraph}
            emissive={roleStyle.telegraph}
            emissiveIntensity={0.7}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      )}

      {state.isStaggered && (
        <mesh position={[0, 0.5, 0]} scale={roleStyle.scale}>
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

      {state.archetype === 'district-lieutenant' && state.behavior !== 'DEAD' && (
        <mesh position={[0, 1.8, 0]}>
          <octahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial
            color="#C7C3BB"
            emissive="#E4511E"
            emissiveIntensity={0.65}
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
