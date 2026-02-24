import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useAdventure, type AdventureEnemy } from "../../../lib/stores/useAdventure";
import { ENEMY_TIERS } from "../../../lib/combatSystems";
import { getAdventureMissionById } from "../../../lib/adventure_missions";
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
          color="#2a3348"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      <gridHelper
        ref={gridRef}
        args={[100, 50, "#3d4d66", "#2e3e55"]}
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
          emissiveIntensity={0.2}
          transparent
          opacity={0.35}
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
            intensity={1.5}
            distance={15}
            decay={2}
          />
          <mesh position={[0, p.h + 0.5, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial
              color={p.color}
              emissive={p.color}
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}

      <fog attach="fog" args={["#1a2440", 50, 120]} />
    </group>
  );
}

function ArenaLighting() {
  return (
    <group>
      <ambientLight intensity={0.8} color="#b0bbdd" />
      <directionalLight
        position={[10, 25, 10]}
        intensity={1.8}
        color="#dde4ff"
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
      <directionalLight
        position={[-10, 15, -8]}
        intensity={0.7}
        color="#aabbdd"
      />
      <directionalLight
        position={[5, 10, -12]}
        intensity={0.4}
        color="#99aacc"
      />
      <hemisphereLight
        args={["#5544aa", "#2a2a44", 0.8]}
      />
      <pointLight
        position={[0, 18, 0]}
        color="#9966ff"
        intensity={0.6}
        distance={60}
        decay={2}
      />
    </group>
  );
}

function WaveSpawner({ missionId }: { missionId: string }) {
  const spawnTimer = useRef(0);
  const waveNum = useRef(0);
  const cleanupTimer = useRef(0);
  const mission = getAdventureMissionById(missionId);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const adv = useAdventure.getState();
    if (adv.isPaused || adv.missionComplete) return;
    if (missionId === "story-mode") return;

    cleanupTimer.current += delta;
    if (cleanupTimer.current > 1) {
      cleanupTimer.current = 0;
      const dead = adv.enemies.filter((e) => e.isDead);
      dead.forEach((e) => adv.removeEnemy(e.id));
    }

    const aliveEnemies = adv.enemies.filter((e) => !e.isDead);

    const hitEliminateTarget = mission?.goalType === "eliminate" && adv.enemiesDefeated >= (mission?.goalValue ?? 0);
    if (hitEliminateTarget) return;

    if (aliveEnemies.length === 0) {
      spawnTimer.current += delta;
      if (spawnTimer.current > 2) {
        spawnTimer.current = 0;
        waveNum.current++;

        const wave = waveNum.current;
        const minionIds = mission?.enemyPool ?? ["hyena-scout", "rift-drone", "blazing-fox", "sparky", "velocity"];
        const bossIds = mission?.bossId ? [mission.bossId, "behemoth"] : ["malakor", "behemoth"];
        const wavesBeforeBoss = mission?.wavesBeforeBoss ?? 3;
        const spawnBoss = wave > 0 && wave % wavesBeforeBoss === 0;

        const count = Math.min(2 + wave, 6);
        const newEnemies: AdventureEnemy[] = [];

        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
          const dist = 15 + Math.random() * 10;
          const tier = (wave >= 4 ? "minion2" : "minion1") as AdventureEnemy["tier"];
          const tierConfig = ENEMY_TIERS[tier];
          const fighterId = minionIds[i % minionIds.length];
          const hp = tierConfig.health + wave * 8;
          newEnemies.push({
            id: `wave${wave}-enemy${i}`,
            fighterId,
            tier,
            posX: Math.cos(angle) * dist,
            posY: 0,
            posZ: Math.sin(angle) * dist,
            rotY: 0,
            health: hp,
            maxHealth: hp,
            isAggro: false,
            isAttacking: false,
            isDead: false,
            aiState: "idle",
            telegraphTimer: 0,
            patrolTargetX: Math.cos(angle) * dist + (Math.random() - 0.5) * 10,
            patrolTargetZ: Math.sin(angle) * dist + (Math.random() - 0.5) * 10,
            stunTimer: 0,
          });
        }

        if (spawnBoss) {
          const bossTier = (wave >= 6 ? "boss2" : "boss1") as AdventureEnemy["tier"];
          const bossConfig = ENEMY_TIERS[bossTier];
          const bossAngle = Math.random() * Math.PI * 2;
          const bossDist = 20;
          const bossId = bossIds[wave >= 6 ? 1 : 0];
          const bossHp = bossConfig.health + wave * 15;
          newEnemies.push({
            id: `wave${wave}-boss`,
            fighterId: bossId,
            tier: bossTier,
            posX: Math.cos(bossAngle) * bossDist,
            posY: 0,
            posZ: Math.sin(bossAngle) * bossDist,
            rotY: 0,
            health: bossHp,
            maxHealth: bossHp,
            isAggro: false,
            isAttacking: false,
            isDead: false,
            aiState: "idle",
            telegraphTimer: 0,
            patrolTargetX: Math.cos(bossAngle) * bossDist + (Math.random() - 0.5) * 8,
            patrolTargetZ: Math.sin(bossAngle) * bossDist + (Math.random() - 0.5) * 8,
            stunTimer: 0,
          });
        }

        adv.spawnEnemies(newEnemies);
        useAdventure.setState({ waveCount: waveNum.current });
      }
    }
  });

  return null;
}

/** Ticks survive timer and checks eliminate/survive goals. Also detects player death. */
function MissionGoalTracker({ missionId }: { missionId: string }) {
  const mission = getAdventureMissionById(missionId);
  const elapsedRef = useRef(0);

  useFrame((_, rawDelta) => {
    const adv = useAdventure.getState();
    if (adv.isPaused || adv.missionComplete) return;

    if (adv.player.health <= 0) {
      adv.setMissionComplete(false);
      return;
    }

    if (!mission || mission.goalType === "free") return;

    if (mission.goalType === "survive") {
      const delta = Math.min(rawDelta, 0.05);
      elapsedRef.current += delta;
      adv.setMissionElapsedSeconds(Math.floor(elapsedRef.current));
      if (elapsedRef.current >= mission.goalValue) {
        adv.setMissionComplete(true);
      }
    } else if (mission.goalType === "eliminate") {
      const allDead = adv.enemies.length > 0 && adv.enemies.every((e) => e.isDead);
      if (adv.enemiesDefeated >= mission.goalValue && allDead) {
        adv.setMissionComplete(true);
      }
    }
  });

  return null;
}

interface AdventureArenaProps {
  characterId: string;
  accentColor: string;
  adventureMissionId: string;
}

export default function AdventureArena({
  characterId,
  accentColor,
  adventureMissionId,
}: AdventureArenaProps) {
  const mission = getAdventureMissionById(adventureMissionId);

  useEffect(() => {
    const goalType = mission?.goalType ?? "free";
    const goalValue = mission?.goalValue ?? 0;
    const arenaId = mission?.arenaId ?? "open-world";
    useAdventure.getState().initAdventure(characterId, adventureMissionId, arenaId, goalType, goalValue);
  }, [characterId, adventureMissionId, mission?.goalType, mission?.goalValue, mission?.arenaId]);

  return (
    <>
      <AdventureCamera />
      <AdventurePlayerController />
      <ArenaLighting />
      <ArenaGround />
      <ArenaEnvironment />
      <AdventureCharacter fighterId={characterId} accentColor={accentColor} />
      <AdventureEnemyAI />
      <WaveSpawner missionId={adventureMissionId} />
      <MissionGoalTracker missionId={adventureMissionId} />
    </>
  );
}
