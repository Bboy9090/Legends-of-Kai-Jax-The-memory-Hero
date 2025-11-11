import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";

interface TrailPoint {
  x: number;
  y: number;
  z: number;
  life: number;
  size: number;
  color: THREE.Color;
}

const MAX_TRAIL_POINTS = 100;

export default function AttackTrails() {
  const {
    playerX,
    playerY,
    playerFighterId,
    playerAttacking,
    playerAttackType,
    playerFacingRight,
    opponentX,
    opponentY,
    opponentFighterId,
    opponentAttacking,
    opponentAttackType,
    opponentFacingRight,
    timeScale
  } = useBattle();

  const playerTrailRef = useRef<TrailPoint[]>([]);
  const opponentTrailRef = useRef<TrailPoint[]>([]);
  
  const playerGeometryRef = useRef<THREE.BufferGeometry>(null);
  const opponentGeometryRef = useRef<THREE.BufferGeometry>(null);

  const playerFighter = getFighterById(playerFighterId);
  const opponentFighter = getFighterById(opponentFighterId);

  const trailColor = playerFighter ? new THREE.Color(playerFighter.accentColor) : new THREE.Color('#FFD700');
  const opponentTrailColor = opponentFighter ? new THREE.Color(opponentFighter.accentColor) : new THREE.Color('#FF4444');

  useFrame((state, delta) => {
    const scaledDelta = delta * timeScale;

    // PLAYER ATTACK TRAILS
    if (playerAttacking && playerAttackType) {
      // Create trail points based on attack type
      const attackX = playerX + (playerFacingRight ? 1.5 : -1.5);
      const attackY = playerY + (playerAttackType === 'kick' ? 0.3 : 1.0);
      
      // Add new trail point
      if (playerTrailRef.current.length < MAX_TRAIL_POINTS) {
        playerTrailRef.current.push({
          x: attackX,
          y: attackY,
          z: Math.sin(Date.now() * 0.01) * 0.3, // Wavy motion!
          life: 0.3,
          size: playerAttackType === 'special' ? 0.5 : 0.3,
          color: trailColor.clone()
        });
      }
    }

    // OPPONENT ATTACK TRAILS
    if (opponentAttacking && opponentAttackType) {
      const attackX = opponentX + (opponentFacingRight ? 1.5 : -1.5);
      const attackY = opponentY + (opponentAttackType === 'kick' ? 0.3 : 1.0);
      
      if (opponentTrailRef.current.length < MAX_TRAIL_POINTS) {
        opponentTrailRef.current.push({
          x: attackX,
          y: attackY,
          z: Math.sin(Date.now() * 0.01) * 0.3,
          life: 0.3,
          size: opponentAttackType === 'special' ? 0.5 : 0.3,
          color: opponentTrailColor.clone()
        });
      }
    }

    // Update player trails
    playerTrailRef.current = playerTrailRef.current.filter(point => {
      point.life -= scaledDelta;
      return point.life > 0;
    });

    // Update opponent trails
    opponentTrailRef.current = opponentTrailRef.current.filter(point => {
      point.life -= scaledDelta;
      return point.life > 0;
    });

    // Update geometry for player trails
    if (playerGeometryRef.current && playerTrailRef.current.length > 1) {
      const positions: number[] = [];
      const colors: number[] = [];
      
      playerTrailRef.current.forEach(point => {
        positions.push(point.x, point.y, point.z);
        const fade = point.life / 0.3;
        colors.push(point.color.r * fade, point.color.g * fade, point.color.b * fade);
      });

      playerGeometryRef.current.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      playerGeometryRef.current.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3)
      );
    }

    // Update geometry for opponent trails
    if (opponentGeometryRef.current && opponentTrailRef.current.length > 1) {
      const positions: number[] = [];
      const colors: number[] = [];
      
      opponentTrailRef.current.forEach(point => {
        positions.push(point.x, point.y, point.z);
        const fade = point.life / 0.3;
        colors.push(point.color.r * fade, point.color.g * fade, point.color.b * fade);
      });

      opponentGeometryRef.current.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      opponentGeometryRef.current.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3)
      );
    }
  });

  return (
    <>
      {/* Player Attack Trails */}
      {playerTrailRef.current.length > 1 && (
        <line>
          <bufferGeometry ref={playerGeometryRef} />
          <lineBasicMaterial
            vertexColors
            linewidth={5}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </line>
      )}

      {/* Opponent Attack Trails */}
      {opponentTrailRef.current.length > 1 && (
        <line>
          <bufferGeometry ref={opponentGeometryRef} />
          <lineBasicMaterial
            vertexColors
            linewidth={5}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </line>
      )}

      {/* GLOWING ORBS at trail points for extra visibility! */}
      {playerTrailRef.current.map((point, i) => (
        <mesh key={`player-orb-${i}`} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[point.size * (point.life / 0.3), 8, 6]} />
          <meshBasicMaterial
            color={point.color}
            transparent
            opacity={point.life / 0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {opponentTrailRef.current.map((point, i) => (
        <mesh key={`opponent-orb-${i}`} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[point.size * (point.life / 0.3), 8, 6]} />
          <meshBasicMaterial
            color={point.color}
            transparent
            opacity={point.life / 0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}
