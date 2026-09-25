import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type MissionStage = 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';

interface AtmosphericEffectsProps {
  stage: MissionStage;
  fangBehavior?: string;
}

const PARTICLE_COUNT = 120;

function seededUnit(index: number, channel: number): number {
  const value = Math.sin((index + 1) * 12.9898 + channel * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function AtmosphericEffects({ stage, fangBehavior }: AtmosphericEffectsProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const particlePositionsRef = useRef<Float32Array | null>(null);
  const particleVelocitiesRef = useRef<Array<{ x: number; y: number; z: number }>>([]);

  if (!particlePositionsRef.current) {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities: Array<{ x: number; y: number; z: number }> = [];

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      positions[index * 3] = (seededUnit(index, 0) - 0.5) * 40;
      positions[index * 3 + 1] = seededUnit(index, 1) * 8;
      positions[index * 3 + 2] = (seededUnit(index, 2) - 0.5) * 50;

      velocities.push({
        x: (seededUnit(index, 3) - 0.5) * 0.7,
        y: 0.08 + seededUnit(index, 4) * 0.24,
        z: (seededUnit(index, 5) - 0.5) * 0.7,
      });
    }

    particlePositionsRef.current = positions;
    particleVelocitiesRef.current = velocities;
  }

  useFrame(({ clock }, rawDelta) => {
    if (!particlesRef.current || !particlePositionsRef.current) return;

    const elapsed = clock.elapsedTime;
    const delta = Math.min(Math.max(rawDelta, 0), 0.05);
    const positions = particlePositionsRef.current;
    const velocities = particleVelocitiesRef.current;

    const speed = stage === 'encounter'
      ? 1.35
      : stage === 'memory-trace'
        ? 0.7
        : 0.9;

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      let x = positions[index * 3];
      let y = positions[index * 3 + 1];
      let z = positions[index * 3 + 2];
      const velocity = velocities[index];

      const memorySwirl = stage === 'memory-trace' || stage === 'extraction'
        ? Math.sin(elapsed * 1.6 + index * 0.37) * 0.18
        : 0;

      x += (velocity.x + memorySwirl) * speed * delta;
      y += velocity.y * speed * delta;
      z += (velocity.z - memorySwirl * 0.4) * speed * delta;

      if (y > 9.5) y = -0.4;
      if (x > 22) x = -22;
      if (x < -22) x = 22;
      if (z > 25) z = -25;
      if (z < -25) z = 25;

      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;
    }

    const positionAttribute = particlesRef.current.geometry.attributes.position;
    if (positionAttribute) positionAttribute.needsUpdate = true;

    const material = particlesRef.current.material as THREE.PointsMaterial;
    const windupBoost = fangBehavior === 'WINDUP' ? 0.06 : 0;
    material.opacity = (
      stage === 'encounter'
        ? 0.24
        : stage === 'memory-trace'
          ? 0.3
          : stage === 'extraction'
            ? 0.2
            : 0.12
    ) + windupBoost;
  });

  const particleColor = stage === 'encounter'
    ? '#d29aa7'
    : stage === 'memory-trace' || stage === 'extraction'
      ? '#d8c8ff'
      : '#aab8cb';

  return (
    <points ref={particlesRef} name="ashblock-atmosphere" userData={{ presentationOnly: true }}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={particlePositionsRef.current ?? new Float32Array()}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={stage === 'memory-trace' ? 0.18 : 0.13}
        color={particleColor}
        transparent
        opacity={0.12}
        sizeAttenuation
        fog
        depthWrite={false}
      />
    </points>
  );
}
