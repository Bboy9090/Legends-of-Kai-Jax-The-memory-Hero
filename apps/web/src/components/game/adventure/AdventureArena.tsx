import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useAdventure, type AdventureEnemy } from "../../../lib/stores/useAdventure";
import { ENEMY_TIERS } from "../../../game/tuning/enemyTuning";
import { buildEncounterEnemies, getDistrictMeta } from "../../../lib/encounters";
import { useMissions } from "../../../lib/stores/useMissions";
import AdventureCharacter from "./AdventureCharacter";
import AdventureCamera from "./AdventureCamera";
import AdventurePlayerController from "./AdventurePlayerController";
import AdventureEnemyAI from "./AdventureEnemyAI";
import * as THREE from "three";

interface ArenaConfig {
  groundColor: string;
  gridColor1: string;
  gridColor2: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  ambientColor: string;
  lightColor1: string;
  lightColor2: string;
  pillarColor: string;
  accentColor: string;
  showPillars: boolean;
  showGrid: boolean;
  arenaType: string;
  skyColor: string;
  groundRoughness: number;
  groundMetalness: number;
}

const ARENA_CONFIGS: Record<string, ArenaConfig> = {
  "cross_point_arena": {
    groundColor: "#1e2a3a", gridColor1: "#2e3e55", gridColor2: "#1e2a3a",
    fogColor: "#0a1220", fogNear: 60, fogFar: 140,
    ambientColor: "#8090bb", lightColor1: "#c0d0ff", lightColor2: "#6070aa",
    pillarColor: "#0d1525", accentColor: "#00f2ff",
    showPillars: true, showGrid: true, arenaType: "tournament",
    skyColor: "#0a1220", groundRoughness: 0.4, groundMetalness: 0.6,
  },
  "emerald_frontier": {
    groundColor: "#0f2a1a", gridColor1: "#1a3d25", gridColor2: "#0f2a1a",
    fogColor: "#081408", fogNear: 25, fogFar: 90,
    ambientColor: "#70bb88", lightColor1: "#aaffcc", lightColor2: "#55aa77",
    pillarColor: "#071208", accentColor: "#30d158",
    showPillars: false, showGrid: false, arenaType: "jungle",
    skyColor: "#0a1a0d", groundRoughness: 0.9, groundMetalness: 0.0,
  },
  "void_tower": {
    groundColor: "#120818", gridColor1: "#2a1030", gridColor2: "#120818",
    fogColor: "#060308", fogNear: 18, fogFar: 70,
    ambientColor: "#9070a0", lightColor1: "#dd88ff", lightColor2: "#7722aa",
    pillarColor: "#050305", accentColor: "#bf5af2",
    showPillars: true, showGrid: true, arenaType: "void",
    skyColor: "#060308", groundRoughness: 0.1, groundMetalness: 0.9,
  },
  "memory_nexus": {
    groundColor: "#061828", gridColor1: "#0e2d48", gridColor2: "#061828",
    fogColor: "#030d18", fogNear: 35, fogFar: 160,
    ambientColor: "#80aaff", lightColor1: "#ffffff", lightColor2: "#4488ee",
    pillarColor: "#030d18", accentColor: "#007aff",
    showPillars: true, showGrid: true, arenaType: "nexus",
    skyColor: "#030d18", groundRoughness: 0.2, groundMetalness: 0.8,
  },
  "skyforge_plateau": {
    groundColor: "#3a4860", gridColor1: "#4a5870", gridColor2: "#3a4860",
    fogColor: "#c0ccdd", fogNear: 8, fogFar: 55,
    ambientColor: "#ffffff", lightColor1: "#ffffff", lightColor2: "#d0e8ff",
    pillarColor: "#1a2030", accentColor: "#60a5fa",
    showPillars: false, showGrid: false, arenaType: "sky",
    skyColor: "#9ab8d8", groundRoughness: 0.7, groundMetalness: 0.1,
  },
  "rift_citadel": {
    groundColor: "#180505", gridColor1: "#300a0a", gridColor2: "#180505",
    fogColor: "#040000", fogNear: 25, fogFar: 90,
    ambientColor: "#ff9090", lightColor1: "#ff3333", lightColor2: "#770000",
    pillarColor: "#000000", accentColor: "#f43f5e",
    showPillars: true, showGrid: true, arenaType: "citadel",
    skyColor: "#040000", groundRoughness: 0.2, groundMetalness: 0.9,
  },
  "ashen_expanse": {
    groundColor: "#181818", gridColor1: "#303030", gridColor2: "#181818",
    fogColor: "#141414", fogNear: 18, fogFar: 65,
    ambientColor: "#606060", lightColor1: "#ff9933", lightColor2: "#333333",
    pillarColor: "#000000", accentColor: "#ff5500",
    showPillars: true, showGrid: false, arenaType: "ash",
    skyColor: "#0a0806", groundRoughness: 0.95, groundMetalness: 0.0,
  },
  "nexus_haven": {
    groundColor: "#0a1a2e", gridColor1: "#1a3a5e", gridColor2: "#0a1a2e",
    fogColor: "#050e18", fogNear: 80, fogFar: 200,
    ambientColor: "#c0d8ff", lightColor1: "#ffffff", lightColor2: "#88bbff",
    pillarColor: "#0a1828", accentColor: "#ffd700",
    showPillars: true, showGrid: true, arenaType: "nexus",
    skyColor: "#050e18", groundRoughness: 0.3, groundMetalness: 0.7,
  },
};

// ─── Arena Ground ──────────────────────────────────────────────────────────
function ArenaGround({ config }: { config: ArenaConfig }) {
  return (
    <group>
      {/* Base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color={config.groundColor}
          roughness={config.groundRoughness}
          metalness={config.groundMetalness}
        />
      </mesh>

      {/* Arena-type specific ground details */}
      {config.arenaType === "tournament" && (
        <>
          {/* Hexagonal arena floor pattern */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[45, 6]} />
            <meshStandardMaterial color="#1a2840" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[43, 45, 64]} />
            <meshStandardMaterial color={config.accentColor} emissive={config.accentColor} emissiveIntensity={0.5} transparent opacity={0.7} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[22, 23, 64]} />
            <meshStandardMaterial color={config.accentColor} emissive={config.accentColor} emissiveIntensity={0.3} transparent opacity={0.4} />
          </mesh>
          <gridHelper args={[90, 30, config.gridColor1, config.gridColor2]} position={[0, 0.02, 0]} />
        </>
      )}

      {config.arenaType === "jungle" && (
        <>
          {/* Mossy terrain patches */}
          {[-15, 0, 15, -8, 8].map((x, i) =>
            [-12, 0, 12, -6, 6].map((z, j) => (
              <mesh key={`moss-${i}-${j}`} rotation={[-Math.PI / 2, 0, Math.random()]} position={[x + (Math.random()-0.5)*4, 0.01, z + (Math.random()-0.5)*4]}>
                <circleGeometry args={[2 + Math.random() * 3, 8]} />
                <meshStandardMaterial color={j % 2 === 0 ? "#1a4a28" : "#0f2a18"} roughness={1.0} />
              </mesh>
            ))
          ).flat()}
          {/* Root-like raised ground ridges */}
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={`root-${i}`} position={[Math.cos(i * 1.26) * 18, 0.15, Math.sin(i * 1.26) * 18]} rotation={[0, i * 0.63, 0]}>
              <boxGeometry args={[12, 0.3, 0.8]} />
              <meshStandardMaterial color="#0d1e12" roughness={1.0} />
            </mesh>
          ))}
        </>
      )}

      {config.arenaType === "void" && (
        <>
          {/* Cracked void floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[40, 32]} />
            <meshStandardMaterial color="#1a0828" roughness={0.05} metalness={1.0} />
          </mesh>
          {/* Void crack lines */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <mesh key={`crack-${i}`} rotation={[-Math.PI/2, 0, (i / 7) * Math.PI * 2]} position={[0, 0.01, 0]}>
              <planeGeometry args={[40, 0.15]} />
              <meshStandardMaterial color={config.accentColor} emissive={config.accentColor} emissiveIntensity={1.5} transparent opacity={0.6} />
            </mesh>
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[38, 40, 64]} />
            <meshStandardMaterial color={config.accentColor} emissive={config.accentColor} emissiveIntensity={0.8} transparent opacity={0.5} />
          </mesh>
          <gridHelper args={[80, 20, "#3a1050", "#200830"]} position={[0, 0.03, 0]} />
        </>
      )}

      {config.arenaType === "nexus" && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[50, 64]} />
            <meshStandardMaterial color="#071828" roughness={0.15} metalness={0.9} />
          </mesh>
          {[5, 15, 25, 35].map((r, i) => (
            <mesh key={`ring-${i}`} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01 + i * 0.002, 0]}>
              <ringGeometry args={[r, r + 0.5, 64]} />
              <meshStandardMaterial color={config.accentColor} emissive={config.accentColor} emissiveIntensity={0.4 - i * 0.05} transparent opacity={0.5} />
            </mesh>
          ))}
          <gridHelper args={[100, 40, "#1a3a5e", "#0e2540"]} position={[0, 0.015, 0]} />
        </>
      )}

      {config.arenaType === "sky" && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[44, 32]} />
            <meshStandardMaterial color="#4a5870" roughness={0.8} metalness={0.1} />
          </mesh>
          {/* Stone tile pattern */}
          {[-3, -1, 1, 3].map((col) =>
            [-3, -1, 1, 3].map((row) => (
              <mesh key={`tile-${col}-${row}`} rotation={[-Math.PI/2, 0, 0]} position={[col * 8, 0.01, row * 8]}>
                <planeGeometry args={[7.6, 7.6]} />
                <meshStandardMaterial color={(col + row) % 2 === 0 ? "#4a5870" : "#3a4a60"} roughness={0.7} />
              </mesh>
            ))
          ).flat()}
          {/* Cloud wisps (flat meshes) */}
          {[[-30, 5, -20], [25, 8, -15], [-20, 6, 30], [35, 4, 20]].map(([x, y, z], i) => (
            <mesh key={`cloud-${i}`} position={[x, y, z]}>
              <sphereGeometry args={[5 + i, 6, 4]} />
              <meshStandardMaterial color="#d8e8f0" transparent opacity={0.3} roughness={1.0} />
            </mesh>
          ))}
        </>
      )}

      {config.arenaType === "citadel" && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[45, 8]} />
            <meshStandardMaterial color="#200808" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Lava crack veins */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={`lava-${i}`} rotation={[-Math.PI/2, 0, (i/6) * Math.PI * 2]} position={[0, 0.01, 0]}>
              <planeGeometry args={[35, 0.3]} />
              <meshStandardMaterial color="#ff3300" emissive="#ff2200" emissiveIntensity={2.0} transparent opacity={0.8} />
            </mesh>
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[43, 45, 8]} />
            <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={1.0} transparent opacity={0.6} />
          </mesh>
        </>
      )}

      {config.arenaType === "ash" && (
        <>
          {/* Ash field: irregular dark patches */}
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={`ash-${i}`} rotation={[-Math.PI/2, Math.random() * Math.PI, 0]}
              position={[(Math.random()-0.5)*60, 0.005, (Math.random()-0.5)*60]}>
              <circleGeometry args={[3 + Math.random() * 5, 7]} />
              <meshStandardMaterial color={i % 3 === 0 ? "#222222" : "#111111"} roughness={1.0} />
            </mesh>
          ))}
          {/* Burning embers: small point lights near ground */}
          {[[-8,3], [12,-5], [-15,8], [6,-12], [18,4]].map(([x,z], i) => (
            <pointLight key={`ember-${i}`} position={[x, 0.3, z]} color="#ff5500" intensity={0.8} distance={6} decay={2} />
          ))}
        </>
      )}
    </group>
  );
}

// ─── Pillars / Structural Elements ──────────────────────────────────────────
function ArenaEnvironment({ config }: { config: ArenaConfig }) {
  const pillars = useMemo(() => {
    if (!config.showPillars) return [];
    const count = config.arenaType === "citadel" ? 8 : config.arenaType === "void" ? 6 : 12;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = config.arenaType === "nexus" ? 48 : 42;
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        h: config.arenaType === "citadel" ? 14 + (i % 2) * 6
          : config.arenaType === "void" ? 20 + i * 1.5
          : 6 + Math.sin(i * 1.3) * 3,
        color: i % 3 === 0 ? config.accentColor : i % 3 === 1 ? "#ffffff" : config.lightColor1,
      };
    });
  }, [config]);

  return (
    <group>
      {pillars.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, p.h / 2, 0]} castShadow>
            {config.arenaType === "citadel"
              ? <boxGeometry args={[2.5, p.h, 2.5]} />
              : config.arenaType === "void"
              ? <cylinderGeometry args={[0.4, 0.8, p.h, 6]} />
              : <boxGeometry args={[1.5, p.h, 1.5]} />
            }
            <meshStandardMaterial color={config.pillarColor} roughness={0.2} metalness={0.9} />
          </mesh>
          <pointLight position={[0, p.h + 1, 0]} color={p.color} intensity={1.8} distance={18} decay={2} />
          <mesh position={[0, p.h + 0.6, 0]}>
            <sphereGeometry args={[config.arenaType === "citadel" ? 0.7 : 0.4, 8, 8]} />
            <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={1.0} />
          </mesh>
        </group>
      ))}

      {/* Jungle trees */}
      {config.arenaType === "jungle" && (
        <>
          {[[-30, 0, -25], [28, 0, -20], [-22, 0, 30], [35, 0, 22], [-38, 0, 10], [15, 0, -35]].map(([x, y, z], i) => (
            <group key={`tree-${i}`} position={[x, y, z]}>
              <mesh position={[0, 5, 0]} castShadow>
                <cylinderGeometry args={[0.5, 0.8, 10, 8]} />
                <meshStandardMaterial color="#2a1a0a" roughness={1.0} />
              </mesh>
              <mesh position={[0, 12, 0]} castShadow>
                <coneGeometry args={[5, 8, 8]} />
                <meshStandardMaterial color="#1a4a28" roughness={0.9} />
              </mesh>
              <mesh position={[0, 16, 0]}>
                <coneGeometry args={[3.5, 6, 8]} />
                <meshStandardMaterial color="#0f3a1e" roughness={0.9} />
              </mesh>
              <pointLight position={[0, 1, 0]} color="#30d158" intensity={0.4} distance={8} decay={2} />
            </group>
          ))}
        </>
      )}

      {/* Void spires */}
      {config.arenaType === "void" && (
        <>
          {[[-20, 0, -18], [22, 0, -15], [-18, 0, 20], [24, 0, 18]].map(([x, y, z], i) => (
            <group key={`spire-${i}`} position={[x, y, z]}>
              <mesh position={[0, 6, 0]} castShadow>
                <coneGeometry args={[1.5, 12, 5]} />
                <meshStandardMaterial color="#1a0830" roughness={0.05} metalness={1.0} />
              </mesh>
              <pointLight position={[0, 10, 0]} color="#bf5af2" intensity={1.2} distance={12} decay={2} />
            </group>
          ))}
        </>
      )}

      {/* Sky plateau rocks */}
      {config.arenaType === "sky" && (
        <>
          {[[-40, -2, -30], [38, -3, -25], [-35, -1, 32], [42, -2, 28]].map(([x, y, z], i) => (
            <mesh key={`rock-${i}`} position={[x, y, z]} castShadow>
              <dodecahedronGeometry args={[4 + i, 0]} />
              <meshStandardMaterial color="#3a4860" roughness={0.9} />
            </mesh>
          ))}
        </>
      )}

      {/* Citadel fortifications */}
      {config.arenaType === "citadel" && (
        <>
          {[[-42, 0, 0], [42, 0, 0], [0, 0, -42], [0, 0, 42]].map(([x, y, z], i) => (
            <group key={`fort-${i}`} position={[x, y, z]}>
              <mesh position={[0, 8, 0]} castShadow>
                <boxGeometry args={[8, 16, 8]} />
                <meshStandardMaterial color="#0a0000" roughness={0.2} metalness={0.9} />
              </mesh>
              <pointLight position={[0, 14, 0]} color="#ff2200" intensity={2.0} distance={20} decay={2} />
            </group>
          ))}
        </>
      )}

      {/* Ash burned tree stumps */}
      {config.arenaType === "ash" && (
        <>
          {[[-20, 0, -15], [18, 0, -18], [-16, 0, 20], [22, 0, 16], [-25, 0, 5]].map(([x, y, z], i) => (
            <group key={`stump-${i}`} position={[x, y, z]}>
              <mesh position={[0, 2, 0]} castShadow>
                <cylinderGeometry args={[0.6, 1.0, 4, 7]} />
                <meshStandardMaterial color="#111111" roughness={1.0} />
              </mesh>
              <pointLight position={[0, 3, 0]} color="#ff4400" intensity={0.6} distance={6} decay={2} />
            </group>
          ))}
        </>
      )}

      <fog attach="fog" args={[config.fogColor, config.fogNear, config.fogFar]} />
    </group>
  );
}



function ArenaLighting({ config }: { config: ArenaConfig }) {
  return (
    <group>
      <ambientLight intensity={0.8} color={config.ambientColor} />
      <directionalLight
        position={[10, 25, 10]}
        intensity={1.8}
        color={config.lightColor1}
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
        color={config.lightColor2}
      />
      <directionalLight
        position={[5, 10, -12]}
        intensity={0.4}
        color={config.ambientColor}
      />
      <hemisphereLight
        args={[config.lightColor1, config.groundColor, 0.8]}
      />
      <pointLight
        position={[0, 18, 0]}
        color={config.accentColor}
        intensity={0.6}
        distance={60}
        decay={2}
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

      if (adv.districtCompleted) {
        return;
      }

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
    return ARENA_CONFIGS[arenaId] || ARENA_CONFIGS["cross_point_arena"];
  }, [arenaId]);

  useEffect(() => {
    const s = useAdventure.getState();
    if (s.roamDistrictId) return;
    // Note: arenaId from store is preserved if already set by story mode
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
