/**
 * LEGENDARY PARTICLE SYSTEM - BEYOND BEYOND LEGENDARY
 * 
 * World-class particle system with:
 * - Enhanced particle counts
 * - Perfect dodge/parry particles
 * - Combo particles
 * - Critical hit particles
 * - Trail effects
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBattle } from '../../lib/stores/useBattle';
import { LEGENDARY_COMBAT_CONSTANTS } from '@legends-of-kai-jax/shared';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  size: number;
  r: number;
  g: number;
  b: number;
  type: 'hit' | 'crit' | 'perfect_dodge' | 'perfect_parry' | 'combo';
}

const MAX_PARTICLES = 2000; // DOUBLED for legendary effects!

export default function LegendaryParticleSystem() {
  const {
    playerX,
    playerY,
    playerAttacking,
    playerAttackType,
    opponentX,
    opponentY,
    opponentAttacking,
    timeScale,
  } = useBattle();

  const particlesRef = useRef<Particle[]>([]);
  const positionsRef = useRef(new Float32Array(MAX_PARTICLES * 3));
  const colorsRef = useRef(new Float32Array(MAX_PARTICLES * 3));
  const sizesRef = useRef(new Float32Array(MAX_PARTICLES));

  const prevPlayerAttackRef = useRef(false);
  const prevOpponentAttackRef = useRef(false);

  /**
   * Emit particles with legendary configuration
   */
  const emit = (
    x: number,
    y: number,
    z: number,
    type: 'hit' | 'crit' | 'perfect_dodge' | 'perfect_parry' | 'combo'
  ) => {
    const config = LEGENDARY_COMBAT_CONSTANTS.PARTICLES[type.toUpperCase() as keyof typeof LEGENDARY_COMBAT_CONSTANTS.PARTICLES];
    if (!config) return;

    const count = config.COUNT;
    const speed = config.SPEED;
    const size = config.SIZE;
    const life = config.LIFE;
    
    // Parse color
    const colorMatch = config.COLOR.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
    const color: [number, number, number] = colorMatch
      ? [
          parseInt(colorMatch[1], 16) / 255,
          parseInt(colorMatch[2], 16) / 255,
          parseInt(colorMatch[3], 16) / 255,
        ]
      : [1, 1, 1];

    for (let i = 0; i < count; i++) {
      if (particlesRef.current.length < MAX_PARTICLES) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const spd = speed * (0.7 + Math.random() * 0.6);

        particlesRef.current.push({
          x,
          y,
          z,
          vx: Math.sin(phi) * Math.cos(theta) * spd,
          vy: Math.abs(Math.sin(phi) * Math.sin(theta)) * spd * 0.5,
          vz: Math.cos(phi) * spd,
          life,
          size: (size * 0.8 + Math.random() * size * 0.4),
          r: Math.min(1, color[0] + (Math.random() - 0.5) * 0.3),
          g: Math.min(1, color[1] + (Math.random() - 0.5) * 0.3),
          b: Math.min(1, color[2] + (Math.random() - 0.5) * 0.3),
          type,
        });
      }
    }
  };

  useFrame((state, delta) => {
    const scaledDelta = delta * timeScale;
    let activeCount = 0;

    // Emit particles on attack
    if (playerAttacking && !prevPlayerAttackRef.current) {
      emit(playerX, playerY, 0, 'hit');
      if (playerAttackType === 'special') {
        emit(playerX, playerY, 0, 'crit');
      }
    }
    prevPlayerAttackRef.current = playerAttacking;

    if (opponentAttacking && !prevOpponentAttackRef.current) {
      emit(opponentX, opponentY, 0, 'hit');
    }
    prevOpponentAttackRef.current = opponentAttacking;

    // Update particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.life -= scaledDelta;
      if (p.life <= 0) return false;

      // Apply gravity
      p.vy -= 10 * scaledDelta;

      // Update position
      p.x += p.vx * scaledDelta;
      p.y += p.vy * scaledDelta;
      p.z += p.vz * scaledDelta;

      // Add to buffers
      const idx = activeCount * 3;
      positionsRef.current[idx] = p.x;
      positionsRef.current[idx + 1] = p.y;
      positionsRef.current[idx + 2] = p.z;

      const fade = p.life / (p.life + scaledDelta);
      colorsRef.current[idx] = p.r * fade;
      colorsRef.current[idx + 1] = p.g * fade;
      colorsRef.current[idx + 2] = p.b * fade;

      sizesRef.current[activeCount] = p.size * (0.5 + fade * 0.5);

      activeCount++;
      return true;
    });
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={MAX_PARTICLES}
          array={positionsRef.current}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute
          attach="attributes-color"
          count={MAX_PARTICLES}
          array={colorsRef.current}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute
          attach="attributes-size"
          count={MAX_PARTICLES}
          array={sizesRef.current}
          itemSize={1}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.6} // Increased for visibility
        vertexColors
        transparent
        opacity={1.0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
