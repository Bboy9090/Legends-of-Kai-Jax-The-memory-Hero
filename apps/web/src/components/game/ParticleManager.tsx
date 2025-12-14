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

const MAX_PARTICLES = 500; // TRIPLED for MASSIVE particle explosions!

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
    battlePhase,
    winner,
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
  const prevBattlePhaseRef = useRef('intro');
  const koParticlesFiredRef = useRef(false);

  // ENHANCED emit - EXPLOSIVE particles!
  const emit = (x: number, y: number, z: number, count: number, color: [number, number, number], speed: number, sizeMultiplier = 1.0) => {
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
          life: 0.7, // Longer life for more visibility!
          size: (0.25 + Math.random() * 0.2) * sizeMultiplier, // BIGGER particles!
          r: Math.min(1, color[0] + (Math.random() - 0.5) * 0.3),
          g: Math.min(1, color[1] + (Math.random() - 0.5) * 0.3),
          b: Math.min(1, color[2] + (Math.random() - 0.5) * 0.3)
        });
      }
    }
  };

  useFrame((state, delta) => {
    // Apply slow-motion time scale
    const scaledDelta = delta * timeScale;
    
    // LEGENDARY KO EXPLOSION - ONCE when entering KO phase!
    if (battlePhase === 'ko' && prevBattlePhaseRef.current !== 'ko' && !koParticlesFiredRef.current) {
      koParticlesFiredRef.current = true;
      const koX = winner === 'player' ? opponentX : playerX;
      const koY = winner === 'player' ? opponentY : playerY;
      
      // APOCALYPTIC PARTICLE BURST!!!
      emit(koX, koY + 1, 0, 100, [1, 0, 0], 12, 3.0); // MASSIVE red explosion!
      emit(koX, koY + 1, 0, 80, [1, 1, 1], 10, 2.5); // Huge white flash
      emit(koX, koY + 1, 0, 60, [1, 0.5, 0], 8, 2.0); // Orange shockwave
      emit(koX, koY + 1, 0, 50, [1, 1, 0], 9, 2.2); // Yellow sparks
      
      // Victory sparkles for winner
      const winnerX = winner === 'player' ? playerX : opponentX;
      const winnerY = winner === 'player' ? playerY : opponentY;
      emit(winnerX, winnerY + 1.5, 0, 50, [1, 1, 0], 4, 1.5); // Gold confetti
      emit(winnerX, winnerY + 1.5, 0, 40, [0, 1, 1], 3, 1.2); // Cyan sparkles
    }
    
    // Reset KO flag when leaving KO phase
    if (battlePhase !== 'ko') {
      koParticlesFiredRef.current = false;
    }
    prevBattlePhaseRef.current = battlePhase;
    
    // EXPLOSIVE HIT EFFECTS - HUGE bursts of particles!
    if (playerHealth < prevPlayerHealthRef.current) {
      // MASSIVE hit burst!
      emit(playerX, playerY + 1, 0, 40, [1, 0.3, 0.3], 8, 2.0); // Red impact
      emit(playerX, playerY + 1, 0, 20, [1, 1, 1], 6, 1.5); // White flash
      emit(playerX, playerY + 1, 0, 15, [1, 0.8, 0], 5, 1.2); // Orange sparks
    }
    prevPlayerHealthRef.current = playerHealth;

    // EXPLOSIVE HIT EFFECTS on opponent too!
    if (opponentHealth < prevOpponentHealthRef.current) {
      // MASSIVE hit burst!
      emit(opponentX, opponentY + 1, 0, 40, [1, 0.3, 0.3], 8, 2.0); // Red impact
      emit(opponentX, opponentY + 1, 0, 20, [1, 1, 1], 6, 1.5); // White flash
      emit(opponentX, opponentY + 1, 0, 15, [1, 0.8, 0], 5, 1.2); // Orange sparks
    }
    prevOpponentHealthRef.current = opponentHealth;

    // DRAMATIC ATTACK EFFECTS - WAY more particles!
    if (playerAttacking && !prevPlayerAttackRef.current && playerAttackType) {
      const attackX = playerX + (opponentX > playerX ? 1.5 : -1.5);
      const colors: Record<string, [number, number, number]> = {
        punch: [1, 0.84, 0],   // Bright gold
        kick: [1, 0.4, 0],     // Fiery orange
        special: [1, 0, 1]     // Magenta
      };
      const counts: Record<string, number> = {
        punch: 30,    // TRIPLED particles!
        kick: 45,     // TRIPLED!
        special: 80   // MASSIVE special attack!
      };
      const sizes: Record<string, number> = {
        punch: 1.2,
        kick: 1.5,
        special: 2.5  // HUGE special particles!
      };
      
      // Primary attack burst
      emit(attackX, playerY + 1, 0, counts[playerAttackType] || 30, colors[playerAttackType] || [1, 1, 0], 6, sizes[playerAttackType] || 1.0);
      
      // Add white flash for all attacks
      emit(attackX, playerY + 1, 0, 15, [1, 1, 1], 5, sizes[playerAttackType] || 1.0);
      
      // Special gets extra effects!
      if (playerAttackType === 'special') {
        emit(attackX, playerY + 1, 0, 30, [0, 1, 1], 7, 2.0); // Cyan ring
        emit(attackX, playerY + 1, 0, 25, [1, 1, 0], 8, 1.8); // Yellow burst
      }
    }
    prevPlayerAttackRef.current = playerAttacking;

    // DRAMATIC OPPONENT ATTACK EFFECTS too!
    if (opponentAttacking && !prevOpponentAttackRef.current && opponentAttackType) {
      const attackX = opponentX + (playerX > opponentX ? 1.5 : -1.5);
      const colors: Record<string, [number, number, number]> = {
        punch: [1, 0.84, 0],
        kick: [1, 0.4, 0],
        special: [0.6, 0, 1]  // Purple for villain special!
      };
      const counts: Record<string, number> = {
        punch: 30,
        kick: 45,
        special: 80
      };
      const sizes: Record<string, number> = {
        punch: 1.2,
        kick: 1.5,
        special: 2.5
      };
      
      emit(attackX, opponentY + 1, 0, counts[opponentAttackType] || 30, colors[opponentAttackType] || [1, 1, 0], 6, sizes[opponentAttackType] || 1.0);
      emit(attackX, opponentY + 1, 0, 15, [1, 1, 1], 5, sizes[opponentAttackType] || 1.0);
      
      if (opponentAttackType === 'special') {
        emit(attackX, opponentY + 1, 0, 30, [1, 0, 0], 7, 2.0); // Red ring
        emit(attackX, opponentY + 1, 0, 25, [0.8, 0, 0.8], 8, 1.8); // Purple burst
      }
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
        size={0.4}  // DOUBLED base size for visibility!
        vertexColors
        transparent
        opacity={1.0}  // Full brightness!
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}  // Additive for GLOW!
      />
    </points>
  );
}
