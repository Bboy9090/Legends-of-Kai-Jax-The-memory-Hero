import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MemoryTraceVisualProps {
  isActivated: boolean;
  position?: [number, number, number];
}

export function MemoryTraceVisual({ isActivated, position = [0, 0.6, 4.1] }: MemoryTraceVisualProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const aura1Ref = useRef<THREE.Mesh>(null);
  const aura2Ref = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Group>(null);
  const fragmentsRef = useRef<THREE.Group>(null);
  const expansionRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const pulse = 0.7 + 0.3 * Math.sin(elapsed * 2.5);
    const rotationSpeed = isActivated ? 0.03 : 0.008;

    // Activation wave expansion
    if (expansionRef.current) {
      if (isActivated) {
        const waveProgress = (elapsed * 1.2) % 1;
        expansionRef.current.scale.set(
          1 + waveProgress * 3,
          1,
          1 + waveProgress * 3
        );
        const mat = expansionRef.current.material as THREE.MeshStandardMaterial;
        mat.opacity = Math.max(0, 1 - waveProgress);
      }
    }

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

    // Memory fragments animation during activation
    if (fragmentsRef.current && isActivated) {
      fragmentsRef.current.rotation.x += 0.01;
      fragmentsRef.current.rotation.y += 0.015;
      fragmentsRef.current.children.forEach((fragment, idx) => {
        const fragmentElapsed = elapsed + idx * 0.2;
        fragment.position.y += Math.sin(fragmentElapsed * 1.5) * 0.02;
        fragment.rotation.x += 0.015;
        fragment.rotation.z += 0.02;
      });
    }
  });

  return (
    <group position={position}>
      {/* Expansion shockwave when activated */}
      {isActivated && (
        <mesh ref={expansionRef} name="memory-trace-expansion">
          <torusGeometry args={[2.0, 0.15, 12, 64]} />
          <meshStandardMaterial
            color="#c4b5fd"
            emissive="#a78bfa"
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>
      )}

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

      {/* Memory fragments - Fang origin/motivation visualization */}
      {isActivated && (
        <group ref={fragmentsRef} name="memory-fragments">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 2.0 + Math.random() * 0.5;
            const height = (Math.random() - 0.5) * 2;
            return (
              <mesh
                key={`memory-fragment-${i}`}
                position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
              >
                <boxGeometry args={[0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2]} />
                <meshStandardMaterial
                  color="#d8b4fe"
                  emissive="#a78bfa"
                  emissiveIntensity={0.6 + Math.random() * 0.4}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}
