import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type MissionStage = 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';

interface AtmosphericEffectsProps {
  stage: MissionStage;
  fangBehavior?: string;
}

export function AtmosphericEffects({ stage, fangBehavior }: AtmosphericEffectsProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const particlePositionsRef = useRef<Float32Array | null>(null);
  const particleVelocitiesRef = useRef<Array<{ x: number; y: number; z: number }>>([]);

  const particleCount = 120;

  if (!particlePositionsRef.current) {
    const positions = new Float32Array(particleCount * 3);
    const velocities: Array<{ x: number; y: number; z: number }> = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      velocities.push({
        x: (Math.random() - 0.5) * 0.5,
        y: Math.random() * 0.2 + 0.05,
        z: (Math.random() - 0.5) * 0.5,
      });
    }

    particlePositionsRef.current = positions;
    particleVelocitiesRef.current = velocities;
  }

  useFrame(({ clock }) => {
    if (!particlesRef.current || !particlePositionsRef.current) return;

    const elapsed = clock.getElapsedTime();
    const positions = particlePositionsRef.current;
    const velocities = particleVelocitiesRef.current;

    const densityMultiplier = stage === 'encounter' ? 1.5 : 1.0;
    const dustAmount = stage === 'traversal' ? 0.3 : stage === 'encounter' ? 0.6 : 0.4;

    for (let i = 0; i < particleCount; i++) {
      let x = positions[i * 3];
      let y = positions[i * 3 + 1];
      let z = positions[i * 3 + 2];

      const vel = velocities[i];
      x += vel.x * dustAmount;
      y += vel.y * dustAmount;
      z += vel.z * dustAmount;

      if (y > 10) {
        y = -0.5;
        x = (Math.random() - 0.5) * 40;
        z = (Math.random() - 0.5) * 50;
      }

      if (x > 22) x = -22;
      if (x < -22) x = 22;
      if (z > 25) z = -25;
      if (z < -25) z = 25;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    if (particlesRef.current.geometry.attributes.position) {
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const baseOpacity = stage === 'encounter' ? 0.25 : stage === 'memory-trace' ? 0.15 : 0.1;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={particlePositionsRef.current || new Float32Array()} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={stage === 'encounter' ? '#ffb8b8' : stage === 'memory-trace' ? '#d9c5f0' : '#c7d2e8'}
        transparent
        opacity={baseOpacity}
        sizeAttenuation
        fog={true}
        depthWrite={false}
      />
    </points>
  );
}
