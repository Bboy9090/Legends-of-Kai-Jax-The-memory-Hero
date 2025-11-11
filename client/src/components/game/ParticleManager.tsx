import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";

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
}

const MAX_PARTICLES = 200;

export default function ParticleManager() {
  const {
    playerX,
    playerY,
    opponentX,
    opponentY,
    playerAttacking,
    playerAttackType,
    opponentAttacking,
    opponentAttackType,
    playerHealth,
    opponentHealth,
    timeScale
  } = useBattle();

  const particlesRef = useRef<Particle[]>([]);
  const positionsRef = useRef(new Float32Array(MAX_PARTICLES * 3));
  const colorsRef = useRef(new Float32Array(MAX_PARTICLES * 3));
  const sizesRef = useRef(new Float32Array(MAX_PARTICLES));
  
  const prevPlayerHealthRef = useRef(100);
  const prevOpponentHealthRef = useRef(100);
  const prevPlayerAttackRef = useRef(false);
  const prevOpponentAttackRef = useRef(false);

  // Emit particles helper
  const emit = (x: number, y: number, z: number, count: number, color: [number, number, number], speed: number) => {
    for (let i = 0; i < count; i++) {
      if (particlesRef.current.length < MAX_PARTICLES) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const spd = speed * (0.7 + Math.random() * 0.6);
        
        particlesRef.current.push({
          x, y, z,
          vx: Math.sin(phi) * Math.cos(theta) * spd,
          vy: Math.abs(Math.sin(phi) * Math.sin(theta)) * spd * 0.5,
          vz: Math.cos(phi) * spd,
          life: 0.5,
          size: 0.15 + Math.random() * 0.1,
          r: color[0] + (Math.random() - 0.5) * 0.2,
          g: color[1] + (Math.random() - 0.5) * 0.2,
          b: color[2] + (Math.random() - 0.5) * 0.2
        });
      }
    }
  };

  useFrame((state, delta) => {
    // Apply slow-motion time scale
    const scaledDelta = delta * timeScale;
    
    // Detect player damage and emit hit particles
    if (playerHealth < prevPlayerHealthRef.current) {
      emit(playerX, playerY + 1, 0, 15, [1, 1, 1], 5);
    }
    prevPlayerHealthRef.current = playerHealth;

    // Detect opponent damage and emit hit particles
    if (opponentHealth < prevOpponentHealthRef.current) {
      emit(opponentX, opponentY + 1, 0, 15, [1, 1, 1], 5);
    }
    prevOpponentHealthRef.current = opponentHealth;

    // Detect player attack and emit attack particles
    if (playerAttacking && !prevPlayerAttackRef.current && playerAttackType) {
      const attackX = playerX + (opponentX > playerX ? 1.5 : -1.5);
      const colors: Record<string, [number, number, number]> = {
        punch: [1, 0.84, 0],
        kick: [1, 0.27, 0],
        special: [1, 0, 1]
      };
      const counts: Record<string, number> = {
        punch: 10,
        kick: 15,
        special: 25
      };
      emit(attackX, playerY + 1, 0, counts[playerAttackType] || 10, colors[playerAttackType] || [1, 1, 0], 4);
    }
    prevPlayerAttackRef.current = playerAttacking;

    // Detect opponent attack and emit attack particles
    if (opponentAttacking && !prevOpponentAttackRef.current && opponentAttackType) {
      const attackX = opponentX + (playerX > opponentX ? 1.5 : -1.5);
      const colors: Record<string, [number, number, number]> = {
        punch: [1, 0.84, 0],
        kick: [1, 0.27, 0],
        special: [1, 0, 1]
      };
      const counts: Record<string, number> = {
        punch: 10,
        kick: 15,
        special: 25
      };
      emit(attackX, opponentY + 1, 0, counts[opponentAttackType] || 10, colors[opponentAttackType] || [1, 1, 0], 4);
    }
    prevOpponentAttackRef.current = opponentAttacking;

    // Update particles
    let activeCount = 0;
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

      const fade = p.life / 0.5;
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
        size={0.2}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
