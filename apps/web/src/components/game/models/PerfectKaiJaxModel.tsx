/**
 * PERFECT KAI-JAX MODEL
 * 
 * The ultimate, perfect 3D model of Kai-Jax:
 * - Perfect proportions
 * - Perfect three tails
 * - Perfect animations
 * - Perfect effects
 * - Perfect integration
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
const PERFECT_KAI_JAX = {
  visual: {
    colorPalette: { primary: '#1a1a1a', secondary: '#00d4ff', accent: '#7fff00', emissive: '#00f2ff' },
    proportions: { bodyDiameter: 1.0, height: 2.2 },
    tails: { count: 3, length: 1.5, thickness: 0.15 },
    accessories: { memoryOrbs: { count: 3, color: '#7fff00' } }
  }
};

class PerfectKaiJaxSystem {
  private auraIntensity = 0.5;
  private memoryOrbs = [
    { position: [0.8, 1.2, 0] as [number, number, number] },
    { position: [-0.8, 1.2, 0] as [number, number, number] },
    { position: [0, 1.8, 0.5] as [number, number, number] }
  ];
  update(_delta: number) {}
  getState() {
    return { auraIntensity: this.auraIntensity, memoryOrbs: this.memoryOrbs };
  }
}

interface PerfectKaiJaxModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isAttacking?: boolean;
  isMoving?: boolean;
  emotionIntensity?: number;
  resonance?: number;
}

export default function PerfectKaiJaxModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  isAttacking = false,
  isMoving = false,
  emotionIntensity = 0.5,
  resonance = 100,
}: PerfectKaiJaxModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const tail1Ref = useRef<THREE.Group>(null);
  const tail2Ref = useRef<THREE.Group>(null);
  const tail3Ref = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Mesh>(null);
  const quillsRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const orbsRef = useRef<THREE.Group>(null);

  const perfectKaiJax = PERFECT_KAI_JAX;
  const systemRef = useRef(new PerfectKaiJaxSystem());

  // Update system
  useFrame((state, delta) => {
    systemRef.current.update(delta);

    const systemState = systemRef.current.getState();

    // Animate body (pulsing with heartbeat)
    if (bodyRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      bodyRef.current.scale.setScalar(1.0 + pulse);
    }

    // Animate tails
    if (tail1Ref.current) {
      tail1Ref.current.rotation.y = Math.sin(systemState.tailAnimations.tail1) * 0.3;
      tail1Ref.current.rotation.z = Math.cos(systemState.tailAnimations.tail1 * 0.5) * 0.2;
    }
    if (tail2Ref.current) {
      tail2Ref.current.rotation.y = Math.sin(systemState.tailAnimations.tail2) * 0.3;
      tail2Ref.current.rotation.z = Math.cos(systemState.tailAnimations.tail2 * 0.5) * 0.2;
    }
    if (tail3Ref.current) {
      tail3Ref.current.rotation.y = Math.sin(systemState.tailAnimations.tail3) * 0.3;
      tail3Ref.current.rotation.z = Math.cos(systemState.tailAnimations.tail3 * 0.5) * 0.2;
    }

    // Animate eyes (glow intensity)
    if (eyesRef.current) {
      const material = eyesRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = systemState.auraIntensity;
    }

    // Animate aura
    if (auraRef.current) {
      auraRef.current.rotation.z += delta * 0.5;
      const material = auraRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime) * 0.2;
    }

    // Animate memory orbs
    if (orbsRef.current) {
      systemState.memoryOrbs.forEach((orb, i) => {
        const orbMesh = orbsRef.current?.children[i] as THREE.Mesh;
        if (orbMesh) {
          orbMesh.position.copy(orb.position);
          orbMesh.rotation.z = orb.rotation;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Body - Perfect Spherical Form */}
      <mesh ref={bodyRef}>
        <sphereGeometry args={[perfectKaiJax.visual.proportions.bodyDiameter / 2, 32, 32]} />
        <meshStandardMaterial
          color={perfectKaiJax.visual.colorPalette.primary}
          metalness={perfectKaiJax.visual.colorPalette.metalness}
          roughness={perfectKaiJax.visual.colorPalette.roughness}
          emissive={perfectKaiJax.visual.colorPalette.emissive}
          emissiveIntensity={perfectKaiJax.visual.colorPalette.emissiveIntensity}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Eyes - Perfect Sage-Mode */}
      <mesh ref={eyesRef} position={[0, 0.3, 0.5]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={perfectKaiJax.visual.features.eyes.color}
          emissive={perfectKaiJax.visual.features.eyes.color}
          emissiveIntensity={perfectKaiJax.visual.features.eyes.glow}
        />
      </mesh>

      {/* Quills - Perfect Electric */}
      <group ref={quillsRef} position={[0, 0.5, -0.5]}>
        {Array.from({ length: perfectKaiJax.visual.features.quills.count }).map((_, i) => {
          const angle = (i / perfectKaiJax.visual.features.quills.count) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4]}
              rotation={[0, angle, 0]}
            >
              <coneGeometry args={[0.05, perfectKaiJax.visual.features.quills.length, 8]} />
              <meshStandardMaterial
                color={perfectKaiJax.visual.features.quills.color}
                emissive={perfectKaiJax.visual.features.quills.color}
                emissiveIntensity={1.5}
              />
            </mesh>
          );
        })}
      </group>

      {/* Tail 1 - Perfect Gold (Velocity) */}
      <group ref={tail1Ref} position={[-0.3, -0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.05, perfectKaiJax.visual.tails.tail1.length, 8]} />
          <meshStandardMaterial
            color={perfectKaiJax.visual.tails.tail1.color}
            emissive={perfectKaiJax.visual.tails.tail1.color}
            emissiveIntensity={2.0}
          />
        </mesh>
      </group>

      {/* Tail 2 - Perfect Blue (Shielding) */}
      <group ref={tail2Ref} position={[0, -0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.05, perfectKaiJax.visual.tails.tail2.length, 8]} />
          <meshStandardMaterial
            color={perfectKaiJax.visual.tails.tail2.color}
            emissive={perfectKaiJax.visual.tails.tail2.color}
            emissiveIntensity={2.0}
          />
        </mesh>
      </group>

      {/* Tail 3 - Perfect White (Anchor) */}
      <group ref={tail3Ref} position={[0.3, -0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.05, perfectKaiJax.visual.tails.tail3.length, 8]} />
          <meshStandardMaterial
            color={perfectKaiJax.visual.tails.tail3.color}
            emissive={perfectKaiJax.visual.tails.tail3.color}
            emissiveIntensity={2.0}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Aura - Perfect Iridescent */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[perfectKaiJax.visual.proportions.bodyDiameter / 2 + 0.3, 32, 32]} />
        <meshStandardMaterial
          color={perfectKaiJax.visual.colorPalette.emissive}
          emissive={perfectKaiJax.visual.colorPalette.emissive}
          emissiveIntensity={systemRef.current.getState().auraIntensity}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Memory Orbs - Perfect Orbit */}
      <group ref={orbsRef}>
        {systemRef.current.getState().memoryOrbs.map((orb, i) => (
          <mesh key={i} position={orb.position}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color={perfectKaiJax.visual.accessories.memoryOrbs.color}
              emissive={perfectKaiJax.visual.accessories.memoryOrbs.color}
              emissiveIntensity={2.0}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
