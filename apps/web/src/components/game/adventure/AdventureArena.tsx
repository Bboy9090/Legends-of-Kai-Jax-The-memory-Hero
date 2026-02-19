import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { FIGHTERS } from "../../../lib/characters";
import AdventureCharacter from "./AdventureCharacter";
import AdventureCamera from "./AdventureCamera";
import AdventurePlayerController from "./AdventurePlayerController";
import AdventureEnemyAI from "./AdventureEnemyAI";
import * as THREE from "three";

function ArenaGround() {
  const gridRef = useRef<THREE.GridHelper>(null);
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#0d1117"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      <gridHelper
        ref={gridRef}
        args={[100, 50, "#1a2332", "#111827"]}
        position={[0, 0.01, 0]}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[44, 45, 64]} />
        <meshStandardMaterial
          color="#00f2ff"
          emissive="#00f2ff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}

function ArenaEnvironment() {
  const pillars = useMemo(() => {
    const items: { x: number; z: number; h: number; color: string }[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 40;
      items.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        h: 6 + Math.sin(i * 1.3) * 3,
        color: i % 3 === 0 ? "#7f00ff" : i % 3 === 1 ? "#00f2ff" : "#ff6b00",
      });
    }
    return items;
  }, []);

  return (
    <group>
      {pillars.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, p.h / 2, 0]} castShadow>
            <boxGeometry args={[1.5, p.h, 1.5]} />
            <meshStandardMaterial
              color="#1a1a2e"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
          <pointLight
            position={[0, p.h + 1, 0]}
            color={p.color}
            intensity={2}
            distance={10}
            decay={2}
          />
          <mesh position={[0, p.h + 0.5, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial
              color={p.color}
              emissive={p.color}
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}

      <fog attach="fog" args={["#070b14", 30, 80]} />
    </group>
  );
}

function ArenaLighting() {
  return (
    <group>
      <ambientLight intensity={0.15} color="#8899bb" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.6}
        color="#aabbff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <hemisphereLight
        args={["#1a0a3e", "#0a0a14", 0.3]}
      />
      <pointLight
        position={[0, 15, 0]}
        color="#7f00ff"
        intensity={1.5}
        distance={50}
        decay={2}
      />
    </group>
  );
}

function WaveSpawner() {
  const spawnTimer = useRef(0);
  const waveNum = useRef(0);
  const cleanupTimer = useRef(0);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const adv = useAdventure.getState();
    if (adv.isPaused) return;

    cleanupTimer.current += delta;
    if (cleanupTimer.current > 1) {
      cleanupTimer.current = 0;
      const dead = adv.enemies.filter((e) => e.isDead);
      dead.forEach((e) => adv.removeEnemy(e.id));
    }

    const aliveEnemies = adv.enemies.filter((e) => !e.isDead);

    if (aliveEnemies.length === 0) {
      spawnTimer.current += delta;
      if (spawnTimer.current > 2) {
        spawnTimer.current = 0;
        waveNum.current++;

        const count = Math.min(2 + waveNum.current, 6);
        const enemyIds = FIGHTERS.map((f) => f.id);
        const newEnemies = [];

        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
          const dist = 15 + Math.random() * 10;
          newEnemies.push({
            id: `wave${waveNum.current}-enemy${i}`,
            fighterId: enemyIds[i % enemyIds.length],
            posX: Math.cos(angle) * dist,
            posY: 0,
            posZ: Math.sin(angle) * dist,
            rotY: 0,
            health: 60 + waveNum.current * 10,
            maxHealth: 60 + waveNum.current * 10,
            isAggro: false,
            isAttacking: false,
            isDead: false,
          });
        }

        adv.spawnEnemies(newEnemies);
        useAdventure.setState({ waveCount: waveNum.current });
      }
    }
  });

  return null;
}

interface AdventureArenaProps {
  characterId: string;
  accentColor: string;
}

export default function AdventureArena({
  characterId,
  accentColor,
}: AdventureArenaProps) {
  useEffect(() => {
    useAdventure.getState().initAdventure(characterId, null, "open-world");
  }, [characterId]);

  return (
    <>
      <AdventureCamera />
      <AdventurePlayerController />
      <ArenaLighting />
      <ArenaGround />
      <ArenaEnvironment />
      <AdventureCharacter fighterId={characterId} accentColor={accentColor} />
      <AdventureEnemyAI />
      <WaveSpawner />
    </>
  );
}
