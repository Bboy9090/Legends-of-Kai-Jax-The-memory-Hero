/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";

const PARTICLE_COUNT = 60;
const RING_SEGMENTS = 48;

function EnergyBurst({ position, color, active }: { position: [number, number, number]; color: string; active: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const progressRef = useRef(0);

  const particlePositions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = 0;
      arr[i * 3 + 1] = 0;
      arr[i * 3 + 2] = 0;
    }
    return arr;
  }, []);

  const particleSizes = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i] = 0.05 + Math.random() * 0.15;
    }
    return arr;
  }, []);

  const velocities = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 2 + Math.random() * 6;
      arr.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed * 0.6 + 1.5,
        Math.cos(phi) * speed * 0.5
      ));
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (active) {
      progressRef.current = Math.min(1, progressRef.current + delta * 2.5);
    } else {
      progressRef.current = Math.max(0, progressRef.current - delta * 4);
    }

    const p = progressRef.current;
    if (p <= 0) return;

    if (particlesRef.current) {
      const geo = particlesRef.current.geometry;
      const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
      const sizeAttr = geo.getAttribute("size") as THREE.BufferAttribute;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const v = velocities[i];
        const life = p;
        posAttr.setXYZ(i,
          v.x * life * (0.3 + Math.sin(i + p * 5) * 0.2),
          v.y * life * 0.8 + Math.sin(p * Math.PI) * 0.5,
          v.z * life * 0.3
        );
        sizeAttr.setX(i, particleSizes[i] * (1 - life * 0.5) * p);
      }
      posAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      (particlesRef.current.material as THREE.PointsMaterial).opacity = (1 - p * 0.6) * p * 2;
    }

    if (ringRef.current) {
      const ringScale = p * 4;
      ringRef.current.scale.set(ringScale, ringScale, ringScale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI) * 0.6;
      ringRef.current.rotation.z += delta * 3;
    }

    if (glowRef.current) {
      glowRef.current.intensity = Math.sin(p * Math.PI) * 8;
      glowRef.current.distance = 6 + p * 4;
    }
  });

  if (progressRef.current <= 0 && !active) return null;

  return (
    <group position={position}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
            count={PARTICLE_COUNT}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[particleSizes, 1]}
            count={PARTICLE_COUNT}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.15}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, RING_SEGMENTS]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, RING_SEGMENTS]} />
        <meshBasicMaterial
          color={"#ffffff"}
          transparent
          opacity={active ? 0.3 : 0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight ref={glowRef} color={color} intensity={0} distance={6} decay={2} />
    </group>
  );
}

function ShockwaveRing({ position, color, active }: { position: [number, number, number]; color: string; active: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    if (active) {
      progressRef.current = Math.min(1, progressRef.current + delta * 3);
    } else {
      progressRef.current = Math.max(0, progressRef.current - delta * 5);
    }

    if (ringRef.current) {
      const p = progressRef.current;
      const scale = 1 + p * 6;
      ringRef.current.scale.set(scale, scale, 1);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI) * 0.5;
    }
  });

  if (progressRef.current <= 0 && !active) return null;

  return (
    <mesh ref={ringRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.5, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function EffectManager() {
  const {
    playerX, playerY, playerAttacking, playerAttackType,
    opponentX, opponentY, opponentAttacking, opponentAttackType,
    playerFighterId, opponentFighterId,
  } = useBattle();
  const playerFighter = getFighterById(playerFighterId);
  const opponentFighter = getFighterById(opponentFighterId);

  const playerUltimate = playerAttacking && playerAttackType === "ultimate";
  const playerSpecial = playerAttacking && playerAttackType === "special";
  const opponentUltimate = opponentAttacking && opponentAttackType === "special";

  const playerColor = playerFighter?.accentColor ?? "#ff6600";
  const opponentColor = opponentFighter?.accentColor ?? "#00aaff";

  return (
    <>
      <EnergyBurst
        position={[playerX, playerY + 1.4, 0]}
        color={playerColor}
        active={playerUltimate}
      />
      <ShockwaveRing
        position={[playerX, playerY + 0.1, 0]}
        color={playerColor}
        active={playerUltimate}
      />
      {playerSpecial && (
        <pointLight
          position={[playerX + 1, playerY + 1.5, 0.5]}
          color={playerColor}
          intensity={4}
          distance={5}
          decay={2}
        />
      )}

      <EnergyBurst
        position={[opponentX, opponentY + 1.4, 0]}
        color={opponentColor}
        active={opponentUltimate}
      />
      <ShockwaveRing
        position={[opponentX, opponentY + 0.1, 0]}
        color={opponentColor}
        active={opponentUltimate}
      />
    </>
  );
}
