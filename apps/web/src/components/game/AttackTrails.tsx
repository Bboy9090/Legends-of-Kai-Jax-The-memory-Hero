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

const MAX_TRAIL_POINTS = 24;
const TRAIL_LIFE = 0.22;
const TRAIL_EMIT_INTERVAL = 1 / 30;

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
    timeScale,
  } = useBattle();

  const playerTrailRef = useRef<TrailPoint[]>([]);
  const opponentTrailRef = useRef<TrailPoint[]>([]);
  const playerGeometryRef = useRef<THREE.BufferGeometry>(null);
  const opponentGeometryRef = useRef<THREE.BufferGeometry>(null);
  const playerEmitTimerRef = useRef(0);
  const opponentEmitTimerRef = useRef(0);

  const playerFighter = getFighterById(playerFighterId);
  const opponentFighter = getFighterById(opponentFighterId);
  const trailColor = new THREE.Color(playerFighter?.accentColor || "#FFD700");
  const opponentTrailColor = new THREE.Color(opponentFighter?.accentColor || "#FF4444");

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const scaledDelta = delta * timeScale;
    playerEmitTimerRef.current = Math.max(0, playerEmitTimerRef.current - delta);
    opponentEmitTimerRef.current = Math.max(0, opponentEmitTimerRef.current - delta);

    if (playerAttacking && playerAttackType && playerEmitTimerRef.current <= 0) {
      const attackX = playerX + (playerFacingRight ? 1.35 : -1.35);
      const attackY = playerY + (playerAttackType === "kick" ? 0.45 : 1.0);
      if (playerTrailRef.current.length >= MAX_TRAIL_POINTS) playerTrailRef.current.shift();
      playerTrailRef.current.push({
        x: attackX,
        y: attackY,
        z: Math.sin(state.clock.elapsedTime * 18) * 0.16,
        life: TRAIL_LIFE,
        size: playerAttackType === "special" || playerAttackType === "ultimate" ? 0.34 : 0.2,
        color: trailColor.clone(),
      });
      playerEmitTimerRef.current = TRAIL_EMIT_INTERVAL;
    }

    if (opponentAttacking && opponentAttackType && opponentEmitTimerRef.current <= 0) {
      const attackX = opponentX + (opponentFacingRight ? 1.35 : -1.35);
      const attackY = opponentY + (opponentAttackType === "kick" ? 0.45 : 1.0);
      if (opponentTrailRef.current.length >= MAX_TRAIL_POINTS) opponentTrailRef.current.shift();
      opponentTrailRef.current.push({
        x: attackX,
        y: attackY,
        z: Math.sin(state.clock.elapsedTime * 18) * 0.16,
        life: TRAIL_LIFE,
        size: opponentAttackType === "special" ? 0.34 : 0.2,
        color: opponentTrailColor.clone(),
      });
      opponentEmitTimerRef.current = TRAIL_EMIT_INTERVAL;
    }

    playerTrailRef.current = playerTrailRef.current.filter((point) => {
      point.life -= scaledDelta;
      return point.life > 0;
    });
    opponentTrailRef.current = opponentTrailRef.current.filter((point) => {
      point.life -= scaledDelta;
      return point.life > 0;
    });

    const updateGeometry = (geometry: THREE.BufferGeometry | null, points: TrailPoint[]) => {
      if (!geometry) return;
      const positions = new Float32Array(points.length * 3);
      const colors = new Float32Array(points.length * 3);
      points.forEach((point, i) => {
        const idx = i * 3;
        const fade = Math.max(0, Math.min(1, point.life / TRAIL_LIFE));
        positions[idx] = point.x;
        positions[idx + 1] = point.y;
        positions[idx + 2] = point.z;
        colors[idx] = point.color.r * fade;
        colors[idx + 1] = point.color.g * fade;
        colors[idx + 2] = point.color.b * fade;
      });
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.computeBoundingSphere();
    };

    updateGeometry(playerGeometryRef.current, playerTrailRef.current);
    updateGeometry(opponentGeometryRef.current, opponentTrailRef.current);
  });

  return (
    <>
      <line>
        <bufferGeometry ref={playerGeometryRef} />
        <lineBasicMaterial vertexColors transparent opacity={0.68} blending={THREE.AdditiveBlending} depthWrite={false} />
      </line>
      <line>
        <bufferGeometry ref={opponentGeometryRef} />
        <lineBasicMaterial vertexColors transparent opacity={0.68} blending={THREE.AdditiveBlending} depthWrite={false} />
      </line>

      {/* Only the newest few points get glow meshes; the line carries the rest. */}
      {playerTrailRef.current.slice(-4).map((point, i) => (
        <mesh key={`player-orb-${i}`} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[point.size * Math.max(0.3, point.life / TRAIL_LIFE), 6, 4]} />
          <meshBasicMaterial color={point.color} transparent opacity={0.58 * (point.life / TRAIL_LIFE)} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      {opponentTrailRef.current.slice(-4).map((point, i) => (
        <mesh key={`opponent-orb-${i}`} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[point.size * Math.max(0.3, point.life / TRAIL_LIFE), 6, 4]} />
          <meshBasicMaterial color={point.color} transparent opacity={0.58 * (point.life / TRAIL_LIFE)} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}
