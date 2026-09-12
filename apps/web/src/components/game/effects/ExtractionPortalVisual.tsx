import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ExtractionPortalVisualProps {
  isUnlocked: boolean;
  position?: [number, number, number];
}

export function ExtractionPortalVisual({ isUnlocked, position = [0, 0.6, 17] }: ExtractionPortalVisualProps) {
  const padRef = useRef<THREE.Mesh>(null);
  const rimRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Group>(null);
  const lockIndicatorRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (padRef.current) {
      const mat = padRef.current.material as THREE.MeshStandardMaterial;
      if (isUnlocked) {
        mat.color.setHex(0x22c55e);
        mat.emissive.setHex(0x16a34a);
        mat.emissiveIntensity = 0.6 + 0.2 * Math.sin(elapsed * 3);
      } else {
        mat.color.setHex(0x475569);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    }

    if (rimRef.current) {
      rimRef.current.rotation.z += isUnlocked ? 0.02 : 0.002;
      const scale = isUnlocked ? 1.2 + 0.15 * Math.sin(elapsed * 2.5) : 1;
      rimRef.current.scale.set(scale, scale, scale);
      const mat = rimRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isUnlocked ? 0.7 : 0.15;
    }

    if (glowRef.current) {
      if (isUnlocked) {
        glowRef.current.scale.set(
          1 + 0.3 * Math.sin(elapsed * 2),
          1 + 0.3 * Math.sin(elapsed * 2),
          1
        );
        const mat = glowRef.current.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.3 + 0.2 * Math.sin(elapsed * 2.5);
      }
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.z += isUnlocked ? 0.03 : 0.001;
      particlesRef.current.children.forEach((particle, idx) => {
        const angle = (idx / particlesRef.current!.children.length) * Math.PI * 2;
        const radius = 1.5 + 0.3 * Math.sin(elapsed + idx);
        particle.position.x = Math.cos(angle) * radius;
        particle.position.z = Math.sin(angle) * radius;
        if (isUnlocked) {
          particle.position.y = 0.3 + 0.15 * Math.sin(elapsed * 2 + idx);
        } else {
          particle.position.y = 0;
        }
      });
    }

    if (lockIndicatorRef.current) {
      if (!isUnlocked) {
        lockIndicatorRef.current.visible = true;
        lockIndicatorRef.current.rotation.z += 0.02;
        lockIndicatorRef.current.scale.set(
          0.8 + 0.1 * Math.sin(elapsed * 2),
          0.8 + 0.1 * Math.sin(elapsed * 2),
          1
        );
      } else {
        lockIndicatorRef.current.visible = false;
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={padRef} name="ashblock-extraction" castShadow receiveShadow userData={{ extraction: true }}>
        <cylinderGeometry args={[0.7, 0.7, 0.14, 24]} />
        <meshStandardMaterial color="#475569" roughness={0.55} metalness={0.2} />
      </mesh>

      {isUnlocked && (
        <>
          <mesh ref={glowRef} name="extraction-glow" position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.05, 24]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#16a34a"
              emissiveIntensity={0.4}
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>

          <mesh ref={rimRef} name="extraction-rim" position={[0, 0.12, 0]}>
            <torusGeometry args={[0.95, 0.08, 8, 32]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#16a34a"
              emissiveIntensity={0.7}
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>

          <group ref={particlesRef} name="extraction-particles">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <mesh key={`extraction-particle-${i}`}>
                <sphereGeometry args={[0.06, 6, 6]} />
                <meshStandardMaterial
                  color="#86efac"
                  emissive="#22c55e"
                  emissiveIntensity={0.8}
                />
              </mesh>
            ))}
          </group>
        </>
      )}

      <group ref={lockIndicatorRef} name="extraction-lock-indicator" position={[0, 0.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial
            color="#dc2626"
            emissive="#7f1d1d"
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
            wireframe
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.15, 0.25, 0.05]} />
          <meshStandardMaterial
            color="#dc2626"
            emissive="#7f1d1d"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>
    </group>
  );
}
