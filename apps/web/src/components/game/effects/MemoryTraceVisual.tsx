import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MemoryTraceVisualProps {
  isActivated: boolean;
  position?: [number, number, number];
}

const PARTICLE_COUNT = 12;

export function MemoryTraceVisual({ isActivated, position = [0, 0.6, 5] }: MemoryTraceVisualProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const aura1Ref = useRef<THREE.Mesh>(null);
  const aura2Ref = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Group>(null);
  const borynEchoRef = useRef<THREE.Group>(null);
  const ulgorrOmenRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    const pulse = 0.82 + 0.18 * Math.sin(elapsed * 2.5);

    if (coreRef.current) {
      coreRef.current.scale.setScalar(pulse);
      const material = coreRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = isActivated
        ? 1.15 + 0.35 * Math.sin(elapsed * 4.2)
        : 0.52 + 0.12 * Math.sin(elapsed * 2);
    }

    if (aura1Ref.current) {
      aura1Ref.current.rotation.set(
        elapsed * 0.16,
        elapsed * 0.1,
        elapsed * (isActivated ? 0.72 : 0.2)
      );
      const scale = isActivated
        ? 1.85 + 0.2 * Math.sin(elapsed * 3)
        : 1.5 + 0.1 * Math.sin(elapsed * 1.5);
      aura1Ref.current.scale.setScalar(scale);
    }

    if (aura2Ref.current) {
      aura2Ref.current.rotation.set(
        -elapsed * 0.12,
        elapsed * 0.22,
        -elapsed * (isActivated ? 0.58 : 0.16)
      );
      const scale = isActivated
        ? 2.25 + 0.28 * Math.sin(elapsed * 2.4 + Math.PI / 4)
        : 1.82 + 0.12 * Math.sin(elapsed * 1.2);
      aura2Ref.current.scale.setScalar(scale);
    }

    if (particleRef.current) {
      particleRef.current.children.forEach((particle, index) => {
        const angle = (index / PARTICLE_COUNT) * Math.PI * 2 + elapsed * (isActivated ? 0.75 : 0.22);
        const radius = isActivated ? 1.55 + (index % 3) * 0.12 : 1.25 + (index % 2) * 0.1;
        particle.position.set(
          Math.cos(angle) * radius,
          0.25 + Math.sin(elapsed * 1.8 + index * 0.7) * 0.55,
          Math.sin(angle) * radius
        );
      });
    }

    if (borynEchoRef.current) {
      borynEchoRef.current.position.y = 1.4 + Math.sin(elapsed * 1.25) * 0.08;
      borynEchoRef.current.rotation.y = Math.sin(elapsed * 0.55) * 0.08;
    }

    if (ulgorrOmenRef.current) {
      ulgorrOmenRef.current.rotation.y = -elapsed * 0.9;
      ulgorrOmenRef.current.position.y = 0.35 + Math.sin(elapsed * 2.2) * 0.08;
    }
  });

  return (
    <group position={position} name="memory-trace-presentation" userData={{ presentationOnly: true }}>
      <mesh ref={coreRef} name="memory-trace-core" castShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#6d28d9"
          emissiveIntensity={0.55}
          roughness={0.35}
          metalness={0.02}
        />
      </mesh>

      <mesh ref={aura1Ref} name="memory-trace-aura-1">
        <torusGeometry args={[1.5, 0.12, 8, 48]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={0.42}
          transparent
          opacity={0.58}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={aura2Ref} name="memory-trace-aura-2">
        <torusGeometry args={[1.8, 0.08, 6, 32]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={0.32}
          transparent
          opacity={0.38}
          depthWrite={false}
        />
      </mesh>

      <group ref={particleRef} name="memory-trace-particles">
        {Array.from({ length: PARTICLE_COUNT }, (_, index) => (
          <mesh key={`memory-particle-${index}`}>
            <sphereGeometry args={[index % 3 === 0 ? 0.075 : 0.05, 6, 6]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? '#ddd6fe' : '#f2b36f'}
              emissive={index % 2 === 0 ? '#a78bfa' : '#E4511E'}
              emissiveIntensity={isActivated ? 0.95 : 0.45}
            />
          </mesh>
        ))}
      </group>

      {isActivated && (
        <>
          <group ref={borynEchoRef} name="boryn-memory-echo" position={[-1.2, 1.4, 0.3]}>
            <mesh position={[0, 0.4, 0]} scale={[1.15, 1.35, 0.8]}>
              <sphereGeometry args={[0.62, 12, 10]} />
              <meshStandardMaterial
                color="#d7d9de"
                emissive="#b8c4d6"
                emissiveIntensity={0.55}
                transparent
                opacity={0.3}
                depthWrite={false}
              />
            </mesh>
            <mesh position={[0, 1.15, 0]} scale={[0.82, 0.72, 0.74]}>
              <sphereGeometry args={[0.48, 12, 10]} />
              <meshStandardMaterial
                color="#e5e7eb"
                emissive="#cbd5e1"
                emissiveIntensity={0.65}
                transparent
                opacity={0.38}
                depthWrite={false}
              />
            </mesh>
            {[-0.26, 0.26].map((x) => (
              <mesh key={`boryn-fang-${x}`} position={[x, 0.77, 0.35]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.08, 0.72, 8]} />
                <meshStandardMaterial
                  color="#f3f4f6"
                  emissive="#dbeafe"
                  emissiveIntensity={0.7}
                  transparent
                  opacity={0.58}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>

          <group ref={ulgorrOmenRef} name="ulgorr-fang-omen" position={[1.35, 0.35, -0.25]}>
            {[-0.26, 0.26].map((x, index) => (
              <mesh
                key={`ulgorr-tooth-${index}`}
                position={[x, index === 0 ? 0.12 : -0.04, 0]}
                rotation={[index === 0 ? 0.28 : -0.22, 0, index === 0 ? -0.32 : 0.34]}
              >
                <coneGeometry args={[0.13, 1.15, 10]} />
                <meshStandardMaterial
                  color="#C7C3BB"
                  emissive="#E4511E"
                  emissiveIntensity={0.72}
                  metalness={0.18}
                  roughness={0.42}
                />
              </mesh>
            ))}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.72, 0.07, 8, 24]} />
              <meshStandardMaterial
                color="#4A2A7A"
                emissive="#2360D1"
                emissiveIntensity={0.55}
                transparent
                opacity={0.72}
                depthWrite={false}
              />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
}
