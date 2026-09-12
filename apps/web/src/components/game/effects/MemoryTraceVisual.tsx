import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MemoryTraceVisualProps {
  isActivated: boolean;
  position?: [number, number, number];
}

export function MemoryTraceVisual({ isActivated, position = [0, 0.6, 5] }: MemoryTraceVisualProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const aura1Ref = useRef<THREE.Mesh>(null);
  const aura2Ref = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const pulse = 0.7 + 0.3 * Math.sin(elapsed * 2.5);
    const rotationSpeed = isActivated ? 0.03 : 0.008;

    if (coreRef.current) {
      coreRef.current.scale.set(pulse, pulse, pulse);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isActivated ? 1.0 + 0.5 * Math.sin(elapsed * 4) : 0.55 + 0.15 * Math.sin(elapsed * 2);
    }

    if (aura1Ref.current) {
      aura1Ref.current.rotation.z += rotationSpeed;
      aura1Ref.current.rotation.x += rotationSpeed * 0.5;
      const scale = isActivated ? 1.8 + 0.3 * Math.sin(elapsed * 3) : 1.5 + 0.15 * Math.sin(elapsed * 1.5);
      aura1Ref.current.scale.set(scale, scale, scale);
    }

    if (aura2Ref.current) {
      aura2Ref.current.rotation.z -= rotationSpeed * 1.3;
      aura2Ref.current.rotation.y += rotationSpeed * 0.7;
      const scale = isActivated ? 2.2 + 0.4 * Math.sin(elapsed * 2.5 + Math.PI / 4) : 1.8 + 0.2 * Math.sin(elapsed * 1.2);
      aura2Ref.current.scale.set(scale, scale, scale);
    }

    if (particleRef.current) {
      particleRef.current.rotation.y += rotationSpeed * 0.5;
      particleRef.current.rotation.x += rotationSpeed * 0.3;
      particleRef.current.children.forEach((particle, idx) => {
        particle.position.y += Math.sin(elapsed + idx) * 0.01;
      });
    }
  });

  return (
    <group position={position}>
      <mesh ref={coreRef} name="memory-trace-core" castShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#6d28d9"
          emissiveIntensity={0.55}
          roughness={0.4}
          metalness={0.0}
        />
      </mesh>

      <mesh ref={aura1Ref} name="memory-trace-aura-1" receiveShadow>
        <torusGeometry args={[1.5, 0.12, 8, 48]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={0.4}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={aura2Ref} name="memory-trace-aura-2" receiveShadow>
        <torusGeometry args={[1.8, 0.08, 6, 32]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {isActivated && (
        <group ref={particleRef} name="memory-trace-particles">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={`particle-${i}`} position={[Math.cos((i / 6) * Math.PI * 2) * 1.2, 0, Math.sin((i / 6) * Math.PI * 2) * 1.2]}>
              <sphereGeometry args={[0.08, 6, 6]} />
              <meshStandardMaterial
                color="#c4b5fd"
                emissive="#a78bfa"
                emissiveIntensity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
