import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { MOVEMENT_TUNING } from "../../game/tuning/movementTuning";

const ARENA_X_MIN = MOVEMENT_TUNING.battle.arenaXMin;
const ARENA_X_MAX = MOVEMENT_TUNING.battle.arenaXMax;
const MAX_PARTICLES = 220;
const PARTICLE_LIFE = 0.52;

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
    timeScale,
  } = useBattle();

  const particlesRef = useRef<Particle[]>([]);
  const positionsRef = useRef(new Float32Array(MAX_PARTICLES * 3));
  const colorsRef = useRef(new Float32Array(MAX_PARTICLES * 3));
  const sizesRef = useRef(new Float32Array(MAX_PARTICLES));
  const prevPlayerHealthRef = useRef(100);
  const prevOpponentHealthRef = useRef(100);
  const prevPlayerAttackRef = useRef(false);
  const prevOpponentAttackRef = useRef(false);
  const prevBattlePhaseRef = useRef("intro");
  const koParticlesFiredRef = useRef(false);
  const prevGroundedRef = useRef(true);
  const prevWallContactRef = useRef(false);
  const pounceEmitCooldownRef = useRef(0);

  const emit = (
    x: number,
    y: number,
    z: number,
    count: number,
    color: [number, number, number],
    speed: number,
    sizeMultiplier = 1,
  ) => {
    const capacity = MAX_PARTICLES - particlesRef.current.length;
    const safeCount = Math.min(Math.max(0, Math.floor(count)), capacity);
    for (let i = 0; i < safeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const spd = speed * (0.72 + Math.random() * 0.45);
      particlesRef.current.push({
        x,
        y,
        z,
        vx: Math.sin(phi) * Math.cos(theta) * spd,
        vy: Math.abs(Math.sin(phi) * Math.sin(theta)) * spd * 0.45,
        vz: Math.cos(phi) * spd,
        life: PARTICLE_LIFE,
        size: (0.18 + Math.random() * 0.14) * sizeMultiplier,
        r: Math.max(0, Math.min(1, color[0] + (Math.random() - 0.5) * 0.18)),
        g: Math.max(0, Math.min(1, color[1] + (Math.random() - 0.5) * 0.18)),
        b: Math.max(0, Math.min(1, color[2] + (Math.random() - 0.5) * 0.18)),
      });
    }
  };

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const scaledDelta = delta * timeScale;

    if (battlePhase === "ko" && prevBattlePhaseRef.current !== "ko" && !koParticlesFiredRef.current) {
      koParticlesFiredRef.current = true;
      const koX = winner === "player" ? opponentX : playerX;
      const koY = winner === "player" ? opponentY : playerY;
      const winnerX = winner === "player" ? playerX : opponentX;
      const winnerY = winner === "player" ? playerY : opponentY;

      emit(koX, koY + 1, 0, 46, [1, 0.08, 0.05], 9, 1.9);
      emit(koX, koY + 1, 0, 26, [1, 0.85, 0.25], 7, 1.45);
      emit(winnerX, winnerY + 1.4, 0, 20, [1, 0.9, 0.15], 3.5, 1.1);
    }
    if (battlePhase !== "ko") koParticlesFiredRef.current = false;
    prevBattlePhaseRef.current = battlePhase;

    if (playerHealth < prevPlayerHealthRef.current) {
      emit(playerX, playerY + 1, 0, 18, [1, 0.25, 0.2], 6.5, 1.25);
      emit(playerX, playerY + 1, 0, 8, [1, 1, 1], 4.5, 0.9);
    }
    prevPlayerHealthRef.current = playerHealth;

    if (opponentHealth < prevOpponentHealthRef.current) {
      emit(opponentX, opponentY + 1, 0, 18, [1, 0.25, 0.2], 6.5, 1.25);
      emit(opponentX, opponentY + 1, 0, 8, [1, 1, 1], 4.5, 0.9);
    }
    prevOpponentHealthRef.current = opponentHealth;

    if (playerAttacking && !prevPlayerAttackRef.current && playerAttackType) {
      const attackX = playerX + (opponentX > playerX ? 1.25 : -1.25);
      const colors: Record<string, [number, number, number]> = {
        punch: [1, 0.84, 0],
        kick: [1, 0.4, 0],
        special: [0.9, 0.05, 1],
        ultimate: [1, 0.85, 0.15],
      };
      const counts: Record<string, number> = { punch: 10, kick: 16, special: 34, ultimate: 46 };
      const sizes: Record<string, number> = { punch: 0.9, kick: 1.05, special: 1.55, ultimate: 1.8 };
      emit(
        attackX,
        playerY + 1,
        0,
        counts[playerAttackType] ?? 10,
        colors[playerAttackType] ?? [1, 1, 0],
        playerAttackType === "special" || playerAttackType === "ultimate" ? 6.5 : 5.2,
        sizes[playerAttackType] ?? 1,
      );
      if (playerAttackType === "special" || playerAttackType === "ultimate") {
        emit(attackX, playerY + 1, 0, 10, [0.2, 0.95, 1], 5.5, 1.15);
      }
    }
    prevPlayerAttackRef.current = playerAttacking;

    if (opponentAttacking && !prevOpponentAttackRef.current && opponentAttackType) {
      const attackX = opponentX + (playerX > opponentX ? 1.25 : -1.25);
      const colors: Record<string, [number, number, number]> = {
        punch: [1, 0.72, 0.08],
        kick: [1, 0.32, 0.05],
        special: [0.55, 0.05, 1],
      };
      const counts: Record<string, number> = { punch: 10, kick: 16, special: 34 };
      emit(
        attackX,
        opponentY + 1,
        0,
        counts[opponentAttackType] ?? 10,
        colors[opponentAttackType] ?? [1, 1, 0],
        opponentAttackType === "special" ? 6.5 : 5.2,
        opponentAttackType === "special" ? 1.55 : 1,
      );
      if (opponentAttackType === "special") emit(attackX, opponentY + 1, 0, 10, [1, 0.15, 0.15], 5.5, 1.1);
    }
    prevOpponentAttackRef.current = opponentAttacking;

    const snap = useBattle.getState();
    const isPouncing = !snap.playerGrounded && Math.abs(snap.playerVelocityX) > 12;
    const isAtWall = snap.playerX <= ARENA_X_MIN + 0.15 || snap.playerX >= ARENA_X_MAX - 0.15;

    if (snap.playerGrounded && !prevGroundedRef.current) {
      emit(snap.playerX, snap.playerY - 0.45, 0, 10, [0.65, 0.65, 0.65], 3.2, 0.9);
    }
    if (isAtWall && !prevWallContactRef.current && isPouncing) {
      emit(snap.playerX, snap.playerY + 0.5, 0, 12, [1, 0.9, 0.35], 6, 1.05);
    }

    pounceEmitCooldownRef.current = Math.max(0, pounceEmitCooldownRef.current - delta);
    if (isPouncing && pounceEmitCooldownRef.current <= 0) {
      emit(snap.playerX - Math.sign(snap.playerVelocityX) * 0.7, snap.playerY + 0.45, 0, 2, [1, 1, 1], 1, 0.55);
      pounceEmitCooldownRef.current = 0.09;
    }

    prevGroundedRef.current = snap.playerGrounded;
    prevWallContactRef.current = isAtWall;

    let activeCount = 0;
    particlesRef.current = particlesRef.current.filter((p) => {
      p.life -= scaledDelta;
      if (p.life <= 0) return false;
      p.vy -= 9 * scaledDelta;
      p.x += p.vx * scaledDelta;
      p.y += p.vy * scaledDelta;
      p.z += p.vz * scaledDelta;

      const idx = activeCount * 3;
      positionsRef.current[idx] = p.x;
      positionsRef.current[idx + 1] = p.y;
      positionsRef.current[idx + 2] = p.z;
      const fade = Math.max(0, Math.min(1, p.life / PARTICLE_LIFE));
      colorsRef.current[idx] = p.r * fade;
      colorsRef.current[idx + 1] = p.g * fade;
      colorsRef.current[idx + 2] = p.b * fade;
      sizesRef.current[activeCount] = p.size * (0.55 + fade * 0.45);
      activeCount++;
      return true;
    });

    for (let i = activeCount; i < MAX_PARTICLES; i++) {
      const idx = i * 3;
      positionsRef.current[idx] = 9999;
      positionsRef.current[idx + 1] = 9999;
      positionsRef.current[idx + 2] = 9999;
      sizesRef.current[i] = 0;
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={MAX_PARTICLES} array={positionsRef.current} itemSize={3} usage={THREE.DynamicDrawUsage} />
        <bufferAttribute attach="attributes-color" count={MAX_PARTICLES} array={colorsRef.current} itemSize={3} usage={THREE.DynamicDrawUsage} />
        <bufferAttribute attach="attributes-size" count={MAX_PARTICLES} array={sizesRef.current} itemSize={1} usage={THREE.DynamicDrawUsage} />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.86}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
