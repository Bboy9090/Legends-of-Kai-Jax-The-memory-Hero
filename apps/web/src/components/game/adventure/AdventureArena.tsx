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
import AdventureSessionGuard from "./AdventureSessionGuard";
import AdventureEnemyAI from "./AdventureEnemyAI";
import Mission1EncounterBridge from "./Mission1EncounterBridge";
import * as THREE from "three";

const VISUAL_ARENA_SIZE = 76;
const VISUAL_ARENA_HALF = VISUAL_ARENA_SIZE / 2;
const SCRIPTED_ENCOUNTER_CLEAR_DELAY_SEC = 0.9;

function ArenaGround({ config }: { config: ArenaConfig }) {
  const { biome, ground } = config;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[VISUAL_ARENA_SIZE, VISUAL_ARENA_SIZE]} />
        <meshStandardMaterial
          color={ground.color}
          roughness={biome === "nature" ? 0.9 : 0.4}
          metalness={biome === "tech" || biome === "void" ? 0.6 : 0.1}
        />
      </mesh>

      {biome === "urban" && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <planeGeometry args={[72, 72]} />
            <meshStandardMaterial color="#141419" roughness={0.88} metalness={0.15} />
          </mesh>
          {[-20, 0, 20].map((z, i) => (
            <mesh key={`lane-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
              <planeGeometry args={[68, 0.35]} />
              <meshStandardMaterial color="#d97706" emissive="#b45309" emissiveIntensity={0.14} roughness={0.9} />
            </mesh>
          ))}
          {[-29, 29].map((x, i) => (
            <mesh key={`curb-${i}`} position={[x, 0.12, 0]}>
              <boxGeometry args={[2.4, 0.24, 70]} />
              <meshStandardMaterial color="#334155" roughness={0.7} />
            </mesh>
          ))}
        </>
      )}

      {biome === "tech" && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[31, 6]} />
            <meshStandardMaterial color="#1a2840" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[29, 31, 48]} />
            <meshStandardMaterial color={ground.gridColor} emissive={ground.gridColor} emissiveIntensity={0.38} transparent opacity={0.62} />
          </mesh>
          <gridHelper args={[64, 24, ground.gridColor, "#113311"]} position={[0, 0.02, 0]} />
        </>
      )}

      {biome === "nature" && (
        <>
          {[-16, 0, 16].map((x, i) =>
            [-16, 0, 16].map((z, j) => (
              <mesh key={`moss-${i}-${j}`} rotation={[-Math.PI / 2, 0, (i + j) * 0.35]} position={[x, 0.01, z]}>
                <circleGeometry args={[3 + ((i + j) % 2), 8]} />
                <meshStandardMaterial color={(i + j) % 2 === 0 ? "#1a4a28" : "#0f2a18"} roughness={1.0} />
              </mesh>
            )),
          ).flat()}
        </>
      )}

      {biome === "void" && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[31, 32]} />
            <meshStandardMaterial color="#1a0828" roughness={0.05} metalness={1.0} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={`crack-${i}`} rotation={[-Math.PI / 2, 0, (i / 5) * Math.PI * 2]} position={[0, 0.01, 0]}>
              <planeGeometry args={[30, 0.12]} />
              <meshStandardMaterial color={ground.gridColor} emissive={ground.gridColor} emissiveIntensity={1.1} transparent opacity={0.52} />
            </mesh>
          ))}
          <gridHelper args={[64, 18, ground.gridColor, "#200830"]} position={[0, 0.03, 0]} />
        </>
      )}

      {biome === "mystic" && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[32, 48]} />
            <meshStandardMaterial color="#071828" roughness={0.15} metalness={0.9} />
          </mesh>
          {[8, 18, 28].map((r, i) => (
            <mesh key={`ring-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01 + i * 0.002, 0]}>
              <ringGeometry args={[r, r + 0.42, 48]} />
              <meshStandardMaterial color={ground.gridColor} emissive={ground.gridColor} emissiveIntensity={0.32 - i * 0.05} transparent opacity={0.42} />
            </mesh>
          ))}
          <gridHelper args={[66, 28, ground.gridColor, "#0e2540"]} position={[0, 0.015, 0]} />
        </>
      )}

      {biome === "storm" && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[31, 32]} />
            <meshStandardMaterial color="#4a5870" roughness={0.8} metalness={0.1} />
          </mesh>
          {[-2, 0, 2].map((col) =>
            [-2, 0, 2].map((row) => (
              <mesh key={`tile-${col}-${row}`} rotation={[-Math.PI / 2, 0, 0]} position={[col * 10, 0.01, row * 10]}>
                <planeGeometry args={[9.4, 9.4]} />
                <meshStandardMaterial color={(col + row) % 2 === 0 ? "#4a5870" : "#3a4a60"} roughness={0.7} />
              </mesh>
            )),
          ).flat()}
        </>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <ringGeometry args={[31.5, 32.2, 64]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function ArenaEnvironment({ config }: { config: ArenaConfig }) {
  const { biome, lighting } = config;

  const pillars = useMemo(() => {
    const count = biome === "void" || biome === "tech" ? 6 : 4;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = biome === "mystic" ? 35 : 34;
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        h: biome === "fire" ? 12 + (i % 2) * 4 : biome === "void" ? 14 + i : 6 + Math.sin(i * 1.3) * 2,
        color: i % 2 === 0 ? lighting.color : lighting.ambientColor,
      };
    });
  }, [biome, lighting]);

  return (
    <group>
      {pillars.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, p.h / 2, 0]} castShadow>
            {biome === "fire" ? (
              <boxGeometry args={[2.2, p.h, 2.2]} />
            ) : biome === "void" ? (
              <cylinderGeometry args={[0.35, 0.7, p.h, 6]} />
            ) : (
              <boxGeometry args={[1.3, p.h, 1.3]} />
            )}
            <meshStandardMaterial color="#111111" roughness={0.25} metalness={0.8} />
          </mesh>
          <mesh position={[0, p.h + 0.5, 0]}>
            <sphereGeometry args={[0.28, 10, 10]} />
            <meshBasicMaterial color={p.color} />
          </mesh>
        </group>
      ))}

      {biome === "urban" && (
        <>
          {[
            { x: -33, z: -25, w: 12, h: 22, d: 14, c: "#1e1e24" },
            { x: 33, z: -24, w: 13, h: 24, d: 14, c: "#262024" },
            { x: -33, z: 24, w: 14, h: 20, d: 13, c: "#1b2028" },
            { x: 33, z: 24, w: 12, h: 23, d: 14, c: "#221c22" },
          ].map((b, i) => (
            <group key={`bldg-${i}`} position={[b.x, b.h / 2, b.z]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[b.w, b.h, b.d]} />
                <meshStandardMaterial color={b.c} roughness={0.8} />
              </mesh>
              {[-b.w / 4, b.w / 4].map((wx, j) =>
                [5, 11, 17].map((wy, k) => (
                  <mesh key={`win-${j}-${k}`} position={[wx, wy - b.h / 2, b.d / 2 + 0.06]}>
                    <planeGeometry args={[1.8, 2.4]} />
                    <meshBasicMaterial color={k % 2 === 0 ? "#fbbf24" : "#475569"} />
                  </mesh>
                )),
              )}
            </group>
          ))}
          <group position={[0, 14, -34]}>
            <mesh>
              <planeGeometry args={[12, 4]} />
              <meshBasicMaterial color="#e11d48" />
            </mesh>
          </group>
          {[-20, 20].map((x, i) =>
            [-16, 16].map((z, j) => (
              <group key={`lamp-${i}-${j}`} position={[x, 0, z]}>
                <mesh position={[0, 3.5, 0]}>
                  <cylinderGeometry args={[0.12, 0.2, 7, 8]} />
                  <meshStandardMaterial color="#0f172a" metalness={0.8} />
                </mesh>
                <mesh position={[0, 7.2, 0]}>
                  <sphereGeometry args={[0.3, 10, 10]} />
                  <meshBasicMaterial color="#ffb703" />
                </mesh>
              </group>
            )),
          ).flat()}
        </>
      )}

      {biome === "nature" && (
        <>
          {[[-28, 0, -24], [28, 0, -22], [-24, 0, 28], [28, 0, 24]].map(([x, y, z], i) => (
            <group key={`tree-${i}`} position={[x, y, z]}>
              <mesh position={[0, 4, 0]} castShadow>
                <cylinderGeometry args={[0.45, 0.7, 8, 8]} />
                <meshStandardMaterial color="#2a1a0a" roughness={1.0} />
              </mesh>
              <mesh position={[0, 9.5, 0]} castShadow>
                <coneGeometry args={[4, 7, 8]} />
                <meshStandardMaterial color="#1a4a28" roughness={0.9} />
              </mesh>
            </group>
          ))}
        </>
      )}

      <fog attach="fog" args={[lighting.fogColor, biome === "void" ? 10 : 18, biome === "void" ? 52 : 78]} />
    </group>
  );
}

function ArenaLighting({ config }: { config: ArenaConfig }) {
  const { lighting } = config;
  return (
    <group>
      <ambientLight intensity={0.72} color={lighting.ambientColor} />
      <directionalLight
        position={[10, 24, 10]}
        intensity={Math.min(2.2, lighting.intensity)}
        color={lighting.color}
        castShadow
        shadow-mapSize-width={768}
        shadow-mapSize-height={768}
      />
      <hemisphereLight args={[lighting.color, "#000000", 0.55]} />
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

    const alive = adv.enemies.filter((e) => !e.isDead).length;
    if (alive === 0 && prevAlive.current > 0) spawnTimer.current = 0;
    prevAlive.current = alive;
    if (alive > 0) return;

    spawnTimer.current += delta;
    if (spawnTimer.current < 1.5) return;
    spawnTimer.current = 0;
    waveNum.current += 1;

    const tier = waveNum.current % 5 === 0 ? "boss1" : waveNum.current % 3 === 0 ? "minion2" : "minion1";
    const tierCfg = ENEMY_TIERS[tier];
    const count = tier === "boss1" ? 1 : Math.min(4, 1 + Math.floor(waveNum.current / 2));
    const next: AdventureEnemy[] = [];
    for (let i = 0; i < count; i += 1) {
      const angle = (i / Math.max(1, count)) * Math.PI * 2 + waveNum.current * 0.4;
      const radius = tier === "boss1" ? 17 : 11 + (i % 2) * 3;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      next.push({
        id: `wave-${waveNum.current}-${i}`,
        fighterId: tier === "boss1" ? "vharok" : i % 2 === 0 ? "vesryn" : "rookan",
        tier,
        posX: x,
        posY: 0,
        posZ: z,
        rotY: Math.atan2(-x, -z),
        health: tierCfg.health,
        maxHealth: tierCfg.health,
        isAggro: true,
        isAttacking: false,
        isDead: false,
        aiState: "chase",
        telegraphTimer: 0,
        patrolTargetX: x,
        patrolTargetZ: z,
        stunTimer: 0,
      });
    }
    adv.spawnEnemies(next);
    useAdventure.setState({ waveCount: waveNum.current });
  });

  return null;
}

function ScriptedEncounterSpawner({ roamSessionId }: { roamSessionId: number }) {
  const started = useRef(false);
  const lastEncounter = useRef(-1);
  const clearTimer = useRef(0);
  const completionIssued = useRef(false);

  useEffect(() => {
    started.current = false;
    lastEncounter.current = -1;
    clearTimer.current = 0;
    completionIssued.current = false;
  }, [roamSessionId]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const adv = useAdventure.getState();
    if (adv.isPaused || !adv.roamDistrictId || adv.districtCompleted) return;
    const meta = getDistrictMeta(adv.roamDistrictId);
    if (!meta) return;

    const encounter = meta.encounters[adv.encounterIndex];
    if (!encounter) {
      if (!completionIssued.current) {
        completionIssued.current = true;
        useAdventure.setState({ districtCompleted: true });
        useMissions.getState().completeDistrictRoam(adv.roamDistrictId);
      }
      return;
    }

    if (!started.current || adv.encounterIndex !== lastEncounter.current) {
      adv.spawnEnemies(
        buildEncounterEnemies({
          districtId: adv.roamDistrictId,
          encounterIndex: adv.encounterIndex,
          spec: encounter,
        }),
      );
      started.current = true;
      lastEncounter.current = adv.encounterIndex;
      clearTimer.current = 0;
      return;
    }

    const alive = adv.enemies.some((enemy) => !enemy.isDead);
    if (alive) {
      clearTimer.current = 0;
      return;
    }

    clearTimer.current += delta;
    if (clearTimer.current < SCRIPTED_ENCOUNTER_CLEAR_DELAY_SEC) return;
    clearTimer.current = 0;

    const nextEncounterIndex = adv.encounterIndex + 1;
    if (nextEncounterIndex >= meta.encounters.length) {
      if (!completionIssued.current) {
        completionIssued.current = true;
        useAdventure.setState({ districtCompleted: true });
        useMissions.getState().completeDistrictRoam(adv.roamDistrictId);
      }
      return;
    }

    // Checkpoint belongs to the encounter we just cleared. Restore resources,
    // then advance; AdventureSessionGuard clears transient combat state at the handoff.
    adv.applyDistrictCheckpoint();
    useAdventure.setState({ encounterIndex: nextEncounterIndex });
  });

  return null;
}

export default function AdventureArena() {
  const arenaId = useAdventure((s) => s.arenaId);
  const roamDistrictId = useAdventure((s) => s.roamDistrictId);
  const roamSessionId = useAdventure((s) => s.roamSessionId);
  const missionId = useAdventure((s) => s.missionId);
  const trainingSession = useMissions((s) => s.active?.id === "training");
  const arena = getArenaConfig(arenaId) || ARENA_REGISTRY[0];

  return (
    <>
      <ArenaLighting config={arena} />
      <ArenaGround config={arena} />
      <ArenaEnvironment config={arena} />
      <AdventureCharacter />
      <AdventureCamera />
      <AdventureSessionGuard />
      <AdventurePlayerController />
      <AdventureEnemyAI />
      {missionId === "mission1" && <Mission1EncounterBridge />}
      {roamDistrictId ? <ScriptedEncounterSpawner roamSessionId={roamSessionId} /> : !missionId && !trainingSession ? <WaveSpawner roamSessionId={roamSessionId} /> : null}
    </>
  );
}
