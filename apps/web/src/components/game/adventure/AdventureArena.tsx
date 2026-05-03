import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useAdventure, type AdventureEnemy } from "../../../lib/stores/useAdventure";
import { ENEMY_TIERS } from "../../../game/tuning/enemyTuning";
import { buildEncounterEnemies, getDistrictMeta } from "../../../lib/encounters";
import { useMissions } from "../../../lib/stores/useMissions";
import { ARENA_REGISTRY, type ArenaConfig, getArenaConfig } from "../../../assets/arenaRegistry";
import AdventureCharacter from "./AdventureCharacter";
import AdventureCamera from "./AdventureCamera";
import AdventurePlayerController from "./AdventurePlayerController";
import AdventureEnemyAI from "./AdventureEnemyAI";
import * as THREE from "three";

// ─── Arena Ground ──────────────────────────────────────────────────────────
function ArenaGround({ config }: { config: ArenaConfig }) {
  const { biome, ground } = config;

  return (
    <group>
      {/* Base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color={ground.color}
          roughness={biome === 'nature' ? 0.9 : 0.4}
          metalness={biome === 'tech' || biome === 'void' ? 0.6 : 0.1}
        />
      </mesh>

      {/* Biome-specific ground details */}
      {biome === 'tech' && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[45, 6]} />
            <meshStandardMaterial color="#1a2840" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[43, 45, 64]} />
            <meshStandardMaterial color={ground.gridColor} emissive={ground.gridColor} emissiveIntensity={0.5} transparent opacity={0.7} />
          </mesh>
          <gridHelper args={[90, 30, ground.gridColor, "#113311"]} position={[0, 0.02, 0]} />
        </>
      )}

      {biome === 'nature' && (
        <>
          {[-15, 0, 15, -8, 8].map((x, i) =>
            [-12, 0, 12, -6, 6].map((z, j) => (
              <mesh key={`moss-${i}-${j}`} rotation={[-Math.PI / 2, 0, Math.random()]} position={[x + (Math.random()-0.5)*4, 0.01, z + (Math.random()-0.5)*4]}>
                <circleGeometry args={[2 + Math.random() * 3, 8]} />
                <meshStandardMaterial color={j % 2 === 0 ? "#1a4a28" : "#0f2a18"} roughness={1.0} />
              </mesh>
            ))
          ).flat()}
        </>
      )}

      {biome === 'void' && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[40, 32]} />
            <meshStandardMaterial color="#1a0828" roughness={0.05} metalness={1.0} />
          </mesh>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <mesh key={`crack-${i}`} rotation={[-Math.PI/2, 0, (i / 7) * Math.PI * 2]} position={[0, 0.01, 0]}>
              <planeGeometry args={[40, 0.15]} />
              <meshStandardMaterial color={ground.gridColor} emissive={ground.gridColor} emissiveIntensity={1.5} transparent opacity={0.6} />
            </mesh>
          ))}
          <gridHelper args={[80, 20, ground.gridColor, "#200830"]} position={[0, 0.03, 0]} />
        </>
      )}

      {biome === 'mystic' && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[50, 64]} />
            <meshStandardMaterial color="#071828" roughness={0.15} metalness={0.9} />
          </mesh>
          {[5, 15, 25, 35].map((r, i) => (
            <mesh key={`ring-${i}`} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01 + i * 0.002, 0]}>
              <ringGeometry args={[r, r + 0.5, 64]} />
              <meshStandardMaterial color={ground.gridColor} emissive={ground.gridColor} emissiveIntensity={0.4 - i * 0.05} transparent opacity={0.5} />
            </mesh>
          ))}
          <gridHelper args={[100, 40, ground.gridColor, "#0e2540"]} position={[0, 0.015, 0]} />
        </>
      )}

      {biome === 'storm' && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[44, 32]} />
            <meshStandardMaterial color="#4a5870" roughness={0.8} metalness={0.1} />
          </mesh>
          {[-3, -1, 1, 3].map((col) =>
            [-3, -1, 1, 3].map((row) => (
              <mesh key={`tile-${col}-${row}`} rotation={[-Math.PI/2, 0, 0]} position={[col * 8, 0.01, row * 8]}>
                <planeGeometry args={[7.6, 7.6]} />
                <meshStandardMaterial color={(col + row) % 2 === 0 ? "#4a5870" : "#3a4a60"} roughness={0.7} />
              </mesh>
            ))
          ).flat()}
        </>
      )}
    </group>
  );
}

// ─── Pillars / Structural Elements ──────────────────────────────────────────
function ArenaEnvironment({ config }: { config: ArenaConfig }) {
  const { biome, lighting } = config;
  
  const pillars = useMemo(() => {
    const count = biome === 'void' ? 8 : biome === 'tech' ? 12 : 6;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = biome === 'mystic' ? 48 : 42;
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        h: biome === 'fire' ? 14 + (i % 2) * 6
          : biome === 'void' ? 20 + i * 1.5
          : 6 + Math.sin(i * 1.3) * 3,
        color: i % 3 === 0 ? lighting.color : i % 3 === 1 ? "#ffffff" : lighting.ambientColor,
      };
    });
  }, [biome, lighting]);

  return (
    <group>
      {pillars.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, p.h / 2, 0]} castShadow>
            {biome === 'fire'
              ? <boxGeometry args={[2.5, p.h, 2.5]} />
              : biome === 'void'
              ? <cylinderGeometry args={[0.4, 0.8, p.h, 6]} />
              : <boxGeometry args={[1.5, p.h, 1.5]} />
            }
            <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.9} />
          </mesh>
          <pointLight position={[0, p.h + 1, 0]} color={p.color} intensity={1.8} distance={18} decay={2} />
        </group>
      ))}

      {biome === 'nature' && (
        <>
          {[[-30, 0, -25], [28, 0, -20], [-22, 0, 30], [35, 0, 22]].map(([x, y, z], i) => (
            <group key={`tree-${i}`} position={[x, y, z]}>
              <mesh position={[0, 5, 0]} castShadow>
                <cylinderGeometry args={[0.5, 0.8, 10, 8]} />
                <meshStandardMaterial color="#2a1a0a" roughness={1.0} />
              </mesh>
              <mesh position={[0, 12, 0]} castShadow>
                <coneGeometry args={[5, 8, 8]} />
                <meshStandardMaterial color="#1a4a28" roughness={0.9} />
              </mesh>
            </group>
          ))}
        </>
      )}

      <fog attach="fog" args={[
        lighting.fogColor, 
        biome === 'void' ? 10 : biome === 'nature' ? 30 : 20, 
        biome === 'void' ? 60 : biome === 'storm' ? 50 : 120
      ]} />
    </group>
  );
}

function ArenaLighting({ config }: { config: ArenaConfig }) {
  const { lighting } = config;
  return (
    <group>
      <ambientLight intensity={0.8} color={lighting.ambientColor} />
      <directionalLight
        position={[10, 25, 10]}
        intensity={lighting.intensity}
        color={lighting.color}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight
        args={[lighting.color, "#000000", 0.8]}
      />
    </group>
  );
}

function WaveSpawner({ roamSessionId }: { roamSessionId: number }) {
  const spawnTimer = useRef(0);
  const waveNum = useRef(0);
  const cleanupTimer = useRef(0);
  const prevAlive = useRef(-1);

  useEffect(() => {
    prevAlive.current = -1;
    spawnTimer.current = 0;
  }, [roamSessionId]);

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
    const aliveCount = aliveEnemies.length;

    if (adv.roamDistrictId) {
      const meta = getDistrictMeta(adv.roamDistrictId);
      if (!meta) return;

      if (adv.districtCompleted) return;

      if (aliveCount > 0) {
        prevAlive.current = aliveCount;
        spawnTimer.current = 0;
        return;
      }

      if (
        prevAlive.current > 0 &&
        aliveCount === 0 &&
        adv.encounterIndex > 0 &&
        adv.encounterIndex < meta.encounters.length &&
        adv.checkpointBetweenEncounters
      ) {
        useAdventure.getState().applyDistrictCheckpoint();
      }
      prevAlive.current = 0;

      if (adv.encounterIndex >= meta.encounters.length) {
        useAdventure.setState({ districtCompleted: true });
        if (adv.roamDistrictId) {
          useMissions.getState().completeDistrictRoam(adv.roamDistrictId);
        }
        return;
      }

      spawnTimer.current += delta;
      const isFirst = adv.waveCount === 0;
      const delay = isFirst ? 2 : 1.5;
      if (spawnTimer.current <= delay) return;

      const spec = meta.encounters[adv.encounterIndex];
      const list = buildEncounterEnemies({
        districtId: adv.roamDistrictId,
        encounterIndex: adv.encounterIndex,
        spec,
      });
      adv.spawnEnemies(list);
      useAdventure.setState({
        waveCount: adv.encounterIndex + 1,
        encounterIndex: adv.encounterIndex + 1,
      });
      waveNum.current = adv.encounterIndex + 1;
      spawnTimer.current = 0;
      return;
    }

    if (aliveEnemies.length === 0) {
      spawnTimer.current += delta;
      if (spawnTimer.current > 2) {
        spawnTimer.current = 0;
        waveNum.current++;

        const wave = waveNum.current;
        const count = Math.min(2 + wave, 6);
        const minionIds = ["hyena-scout", "rift-drone", "blazing-fox", "sparky", "velocity"];
        const bossIds = ["malakor", "behemoth"];
        const newEnemies: AdventureEnemy[] = [];

        const spawnBoss = wave > 0 && wave % 3 === 0;

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

interface AdventureArenaProps {
  characterId: string;
  accentColor: string;
}

export default function AdventureArena({
  characterId,
  accentColor,
}: AdventureArenaProps) {
  const roamSessionId = useAdventure((s) => s.roamSessionId);
  const arenaId = useAdventure((s) => s.arenaId);

  // Get current arena config or fallback to default
  const config = useMemo(() => {
    return getArenaConfig(arenaId);
  }, [arenaId]);

  useEffect(() => {
    const s = useAdventure.getState();
    if (s.roamDistrictId) return;
    if (s.arenaId === "open-world") {
      useAdventure.getState().initAdventure(characterId, null, "cross_point_arena");
    }
  }, [characterId]);

  return (
    <>
      <AdventureCamera />
      <AdventurePlayerController />
      <ArenaLighting config={config} />
      <ArenaGround config={config} />
      <ArenaEnvironment config={config} />
      <AdventureCharacter fighterId={characterId} accentColor={accentColor} />
      <AdventureEnemyAI />
      <WaveSpawner roamSessionId={roamSessionId} />
    </>
  );
}
