/**
 * RAGING CITY VERTICAL SLICE SCENE
 * Ashblock Heights with real Kai/Jax controllers and deterministic Fang combat AI.
 *
 * Architecture:
 * - Exactly one real Kai/Jax controller owns player position.
 * - Phase 5.5 content order is authored by ASHBLOCK_PHASE_55_SEQUENCE.
 * - Fang variants share the same deterministic combat contract/AI authority.
 * - Kai and Jax damage real scene combat targets through their certified attack systems.
 * - This scene only reconciles combat-target userData into FangCombatantState;
 *   it never applies hero-specific direct damage.
 */

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRunner } from '../../lib/stores/useRunner';
import { getFighterById } from '../../lib/characters';
import { useKaiController } from './characters/kai/KaiController';
import { useJaxController } from './characters/jax/JaxController';
import { FangCombatantVisual } from './characters/fang/FangCombatantVisual';
import { MemoryTraceVisual } from './effects/MemoryTraceVisual';
import { ExtractionPortalVisual } from './effects/ExtractionPortalVisual';
import { EnvironmentAmbience } from './effects/EnvironmentAmbience';
import { AtmosphericEffects } from './effects/AtmosphericEffects';
import { AshblockHeightsEnvironment } from './environments/AshblockHeightsEnvironment';
import { PerformanceOptimizer } from './performance/PerformanceOptimizer';
import {
  applyFangKnockback,
  createFangCombatant,
  damageFangCombatant,
  type FangCombatantArchetype,
  type FangCombatantState,
} from '../../game/characters/fang/FangCombatantContract';
import { updateFangCombatantAI } from '../../game/characters/fang/FangCombatantAI';
import { gameplayInputManager } from '../../lib/input/GameplayInputState';
import {
  ASHBLOCK_PHASE_55_SEQUENCE,
  type AshblockPhase55Beat,
} from '../../game/world/zones/AshblockHeights/AshblockPhase55Content';

export type VerticalSliceHero = 'kai' | 'jax';
type MissionStage = 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';

const RECOVERY_GATE_Z = 3.5;
const MEMORY_TRACE_Z = 4.1;
const EXTRACTION_GATE_Z = 15;
const PLAYER_HIT_GRACE_SECONDS = 1.0;
const RECOVERY_HEALTH_RESTORE = 30;

interface ControllerDebugState {
  locomotionMode: string;
  wallCrawling: boolean;
  webZipping: boolean;
  attacking: boolean;
  invulnTimer: number;
  energy: number;
  groundCharges: number | null;
  airCharges: number | null;
}

export interface VerticalSliceDebugSnapshot extends ControllerDebugState {
  hero: VerticalSliceHero | 'INVALID';
  stage: MissionStage;
  beatId: string;
  beatObjective: string;
  position: [number, number, number];
  playerHealth: number;
  playerDown: boolean;
  playerHitGrace: number;
  enemyCount: number;
  totalEnemyHealth: number;
  fangHealth: number;
  fangMaxHealth: number;
  fangArchetype: FangCombatantArchetype | 'none';
  fangBehavior: string;
  fangWindup: number;
  lieutenantAlive: boolean;
  memoryTraceActivated: boolean;
  extractionUnlocked: boolean;
  fps: number;
}

const INITIAL_CONTROLLER_DEBUG: ControllerDebugState = {
  locomotionMode: 'LOADING',
  wallCrawling: false,
  webZipping: false,
  attacking: false,
  invulnTimer: 0,
  energy: 100,
  groundCharges: null,
  airCharges: null,
};

const INITIAL_BEAT = ASHBLOCK_PHASE_55_SEQUENCE[0];

const INITIAL_DEBUG: VerticalSliceDebugSnapshot = {
  ...INITIAL_CONTROLLER_DEBUG,
  hero: 'INVALID',
  stage: 'traversal',
  beatId: INITIAL_BEAT.id,
  beatObjective: INITIAL_BEAT.objective,
  position: [0, 0, -20],
  playerHealth: 100,
  playerDown: false,
  playerHitGrace: 0,
  enemyCount: 0,
  totalEnemyHealth: 0,
  fangHealth: 0,
  fangMaxHealth: 0,
  fangArchetype: 'none',
  fangBehavior: 'IDLE',
  fangWindup: 0,
  lieutenantAlive: false,
  memoryTraceActivated: false,
  extractionUnlocked: false,
  fps: 0,
};

interface MissionStateRef {
  stage: MissionStage;
  beatIndex: number;
  encounterActive: boolean;
  memoryTraceActivated: boolean;
  extractionUnlocked: boolean;
  combatants: FangCombatantState[];
  playerHealth: number;
  playerDown: boolean;
  playerHitGrace: number;
  completionRecorded: boolean;
}

function buildCombatantsForBeat(beat: AshblockPhase55Beat): FangCombatantState[] {
  return beat.spawns.map((spawn) => {
    const combatant = createFangCombatant(spawn.id, spawn.archetype);
    combatant.position.x = spawn.position[0];
    combatant.position.y = spawn.position[1];
    combatant.position.z = spawn.position[2];
    return combatant;
  });
}

function getPrimaryCombatant(combatants: FangCombatantState[]): FangCombatantState | null {
  return combatants.find((combatant) => !combatant.isDead)
    ?? combatants[combatants.length - 1]
    ?? null;
}

function getStageForBeat(beat: AshblockPhase55Beat): MissionStage {
  if (beat.kind === 'TRAVERSAL') return 'traversal';
  if (beat.kind === 'MEMORY_TRACE') return 'memory-trace';
  return 'encounter';
}

function KaiControllerBridge({
  playerRef,
  debugRef,
}: {
  playerRef: RefObject<THREE.Group>;
  debugRef: MutableRefObject<ControllerDebugState>;
}) {
  const { scene } = useThree();
  const controller = useKaiController(playerRef, scene);

  useFrame(() => {
    const state = controller.getState();
    debugRef.current = {
      locomotionMode: state.locomotionMode,
      wallCrawling: state.isWallCrawling,
      webZipping: state.isWebZipping,
      attacking: state.isAttacking,
      invulnTimer: state.invulnTimer,
      energy: state.energy,
      groundCharges: null,
      airCharges: null,
    };
  });

  return null;
}

function JaxControllerBridge({
  playerRef,
  debugRef,
}: {
  playerRef: RefObject<THREE.Group>;
  debugRef: MutableRefObject<ControllerDebugState>;
}) {
  const { scene } = useThree();
  const controller = useJaxController(playerRef, scene);

  useFrame(() => {
    const state = controller.getState();
    debugRef.current = {
      locomotionMode: state.locomotionMode,
      wallCrawling: false,
      webZipping: false,
      attacking: state.isAttacking,
      invulnTimer: state.invulnTimer,
      energy: state.energy,
      groundCharges: state.groundDisplacementCharges,
      airCharges: state.airDisplacementCharges,
    };
  });

  return null;
}

function VerticalSliceEnvironment({
  forcedCharacter,
  onDebug,
}: {
  forcedCharacter?: VerticalSliceHero;
  onDebug: (snapshot: VerticalSliceDebugSnapshot) => void;
}) {
  const { scene, camera } = useThree();
  const selectedCharacter = useRunner((state) => state.selectedCharacter);
  const activeStoryMissionId = useRunner((state) => state.activeStoryMissionId);
  const setGameState = useRunner((state) => state.setGameState);
  const setMissionCompleted = useRunner((state) => state.setMissionCompleted);

  const charId = forcedCharacter ?? selectedCharacter;
  const isKai = charId === 'kai';
  const isJax = charId === 'jax';
  const hero: VerticalSliceHero | 'INVALID' = isKai ? 'kai' : isJax ? 'jax' : 'INVALID';
  const fighter = getFighterById(charId ?? '');

  const playerRef = useRef<THREE.Group>(null);
  const fangRefs = useRef<Map<string, THREE.Group>>(new Map());
  const controllerDebugRef = useRef<ControllerDebugState>({ ...INITIAL_CONTROLLER_DEBUG });
  const previousInteractRef = useRef(false);
  const perfRef = useRef({ elapsed: 0, frames: 0, fps: 0, hudElapsed: 0 });
  const [renderStage, setRenderStage] = useState<MissionStage>('traversal');
  const [renderBeatIndex, setRenderBeatIndex] = useState(0);

  const stateRef = useRef<MissionStateRef>({
    stage: 'traversal',
    beatIndex: 0,
    encounterActive: false,
    memoryTraceActivated: false,
    extractionUnlocked: false,
    combatants: [],
    playerHealth: 100,
    playerDown: false,
    playerHitGrace: 0,
    completionRecorded: false,
  });

  const transitionStage = useCallback((next: MissionStage) => {
    const mission = stateRef.current;
    if (mission.stage === next) return;
    mission.stage = next;
    setRenderStage(next);
  }, []);

  const transitionToBeat = useCallback((nextBeatIndex: number) => {
    const beat = ASHBLOCK_PHASE_55_SEQUENCE[nextBeatIndex];
    if (!beat) return;

    const mission = stateRef.current;
    mission.beatIndex = nextBeatIndex;
    mission.combatants = buildCombatantsForBeat(beat);
    mission.encounterActive = beat.kind === 'COMBAT' || beat.kind === 'LIEUTENANT';

    if (mission.encounterActive) {
      // New authored combat beats begin with one short, deterministic response
      // window so several independent Fang AIs cannot resolve a spawn-frame pileup.
      mission.playerHitGrace = PLAYER_HIT_GRACE_SECONDS;
    } else if (beat.kind === 'RECOVERY') {
      // The recovery corridor is now mechanically meaningful rather than a label:
      // it restores a bounded amount between the opening ambush and mixed fight.
      mission.playerHealth = Math.min(100, mission.playerHealth + RECOVERY_HEALTH_RESTORE);
      mission.playerHitGrace = 0;
    }

    const nextStage = getStageForBeat(beat);
    mission.stage = nextStage;
    setRenderBeatIndex(nextBeatIndex);
    setRenderStage(nextStage);
  }, []);

  const registerFangRef = useCallback((id: string, node: THREE.Group | null) => {
    if (node) {
      fangRefs.current.set(id, node);
    } else {
      fangRefs.current.delete(id);
    }
  }, []);

  useEffect(() => {
    if (!forcedCharacter && !isKai && !isJax) {
      setGameState('mission-select');
    }
  }, [forcedCharacter, isKai, isJax, setGameState]);

  useEffect(() => {
    const previousBackground = scene.background;
    const previousFog = scene.fog;
    const bg = new THREE.Color(0x11131c);
    scene.background = bg;
    scene.fog = new THREE.Fog(0x11131c, 55, 150);

    camera.position.set(0, 5, -30);
    camera.lookAt(0, 1.2, -14);
    camera.updateMatrixWorld(true);

    return () => {
      if (scene.background === bg) scene.background = previousBackground;
      scene.fog = previousFog;
    };
  }, [scene, camera]);

  useEffect(() => {
    for (const combatant of stateRef.current.combatants) {
      const fang = fangRefs.current.get(combatant.id);
      if (!fang) continue;

      fang.userData.combatTarget = !combatant.isDead;
      fang.userData.targetId = combatant.id;
      fang.userData.isLightningTarget = true;
      fang.userData.health = combatant.health;
      fang.userData.velocity = new THREE.Vector3();
      fang.userData.archetype = combatant.archetype;
    }
  }, [renderBeatIndex]);

  useFrame((frameState, rawDelta) => {
    const player = playerRef.current;
    if (!player || hero === 'INVALID') return;

    const delta = Math.min(rawDelta, 0.05);
    const lifecycleDelta = Math.min(Math.max(rawDelta, 0), 0.25);
    const currentTime = frameState.clock.elapsedTime;
    const mission = stateRef.current;
    const playerPos = player.position;

    mission.playerHitGrace = Math.max(0, mission.playerHitGrace - lifecycleDelta);

    let beat = ASHBLOCK_PHASE_55_SEQUENCE[mission.beatIndex];

    if (beat.kind === 'TRAVERSAL' && playerPos.z > -5) {
      transitionToBeat(mission.beatIndex + 1);
      beat = ASHBLOCK_PHASE_55_SEQUENCE[stateRef.current.beatIndex];
    }

    const input = gameplayInputManager.getState();

    if ((beat.kind === 'COMBAT' || beat.kind === 'LIEUTENANT') && !mission.playerDown) {
      let incomingDamage = 0;

      for (const fangState of mission.combatants) {
        const fangObject = fangRefs.current.get(fangState.id);
        if (!fangObject) continue;

        const externalHealth = typeof fangObject.userData.health === 'number'
          ? fangObject.userData.health
          : fangState.health;

        if (externalHealth < fangState.health) {
          damageFangCombatant(fangState, fangState.health - externalHealth, currentTime);
        }

        const externalVelocity = fangObject.userData.velocity;
        if (externalVelocity instanceof THREE.Vector3 && externalVelocity.lengthSq() > 0.0001) {
          applyFangKnockback(fangState, {
            x: externalVelocity.x,
            y: externalVelocity.y,
            z: externalVelocity.z,
          });
          externalVelocity.set(0, 0, 0);
        }

        const aiResult = updateFangCombatantAI(
          fangState,
          { x: playerPos.x, y: playerPos.y, z: playerPos.z },
          delta,
          currentTime
        );

        fangObject.position.set(
          fangState.position.x,
          Math.max(0.8, fangState.position.y + 0.3),
          fangState.position.z
        );
        fangObject.visible = !fangState.isDead;
        fangObject.userData.combatTarget = !fangState.isDead;
        fangObject.userData.health = fangState.health;
        fangObject.userData.isDead = fangState.isDead;
        fangObject.userData.behavior = fangState.behavior;
        fangObject.userData.archetype = fangState.archetype;

        if (aiResult.attackResolved) {
          // Multiple independent AIs may resolve on the same low-FPS catch-up
          // frame. Treat that as one readable player hit, not stacked burst damage.
          incomingDamage = Math.max(incomingDamage, aiResult.attackDamage);
        }
      }

      if (
        incomingDamage > 0
        && controllerDebugRef.current.invulnTimer <= 0
        && mission.playerHitGrace <= 0
      ) {
        mission.playerHealth = Math.max(0, mission.playerHealth - incomingDamage);
        mission.playerDown = mission.playerHealth === 0;
        if (!mission.playerDown) {
          mission.playerHitGrace = PLAYER_HIT_GRACE_SECONDS;
        }
      }

      if (mission.combatants.length > 0 && mission.combatants.every((combatant) => combatant.isDead)) {
        mission.encounterActive = false;
        transitionToBeat(mission.beatIndex + 1);
        beat = ASHBLOCK_PHASE_55_SEQUENCE[stateRef.current.beatIndex];
      }
    }

    if (beat.kind === 'RECOVERY' && playerPos.z > RECOVERY_GATE_Z) {
      transitionToBeat(mission.beatIndex + 1);
      beat = ASHBLOCK_PHASE_55_SEQUENCE[stateRef.current.beatIndex];
    }

    if (beat.kind === 'MEMORY_TRACE' && mission.stage !== 'memory-trace' && mission.stage !== 'extraction') {
      transitionStage('memory-trace');
    }

    const interactEdge = input.interact && !previousInteractRef.current;
    previousInteractRef.current = input.interact;

    const distToTrace = Math.hypot(playerPos.x, playerPos.z - MEMORY_TRACE_Z);
    if (mission.stage === 'memory-trace' && distToTrace < 2 && interactEdge) {
      mission.memoryTraceActivated = true;
    }

    if (mission.stage === 'memory-trace' && mission.memoryTraceActivated) {
      mission.extractionUnlocked = true;
      transitionStage('extraction');
    }

    if (mission.stage === 'extraction' && playerPos.z > EXTRACTION_GATE_Z) {
      transitionStage('complete');
      if (!mission.completionRecorded && activeStoryMissionId) {
        mission.completionRecorded = true;
        setMissionCompleted(activeStoryMissionId);
      }
      if (!forcedCharacter) setGameState('mission-complete');
    }

    const cameraTarget = new THREE.Vector3(playerPos.x * 0.2, 5, playerPos.z - 10);
    camera.position.lerp(cameraTarget, Math.min(1, delta * 5));
    camera.lookAt(playerPos.x, 1.2, playerPos.z + 5);

    const perf = perfRef.current;
    perf.elapsed += delta;
    perf.hudElapsed += delta;
    perf.frames += 1;
    if (perf.elapsed >= 0.5) {
      perf.fps = perf.frames / perf.elapsed;
      perf.elapsed = 0;
      perf.frames = 0;
    }

    if (perf.hudElapsed >= 0.1) {
      perf.hudElapsed = 0;
      const livingCombatants = mission.combatants.filter((combatant) => !combatant.isDead);
      const primary = getPrimaryCombatant(mission.combatants);
      const totalEnemyHealth = livingCombatants.reduce((sum, combatant) => sum + combatant.health, 0);
      const currentBeat = ASHBLOCK_PHASE_55_SEQUENCE[mission.beatIndex];

      onDebug({
        ...controllerDebugRef.current,
        hero,
        stage: mission.stage,
        beatId: currentBeat.id,
        beatObjective: currentBeat.objective,
        position: [playerPos.x, playerPos.y, playerPos.z],
        playerHealth: mission.playerHealth,
        playerDown: mission.playerDown,
        playerHitGrace: mission.playerHitGrace,
        enemyCount: livingCombatants.length,
        totalEnemyHealth,
        fangHealth: primary?.health ?? 0,
        fangMaxHealth: primary?.maxHealth ?? 0,
        fangArchetype: primary?.archetype ?? 'none',
        fangBehavior: primary?.behavior ?? 'IDLE',
        fangWindup: primary?.attackWindupTimer ?? 0,
        lieutenantAlive: livingCombatants.some((combatant) => combatant.archetype === 'district-lieutenant'),
        memoryTraceActivated: mission.memoryTraceActivated,
        extractionUnlocked: mission.extractionUnlocked,
        fps: perf.fps,
      });
    }
  });

  if (!fighter || hero === 'INVALID') return null;
  const renderMission = stateRef.current;
  const primaryCombatant = getPrimaryCombatant(renderMission.combatants);

  return (
    <group>
      <PerformanceOptimizer />

      {/* Ashblock Heights environmental polish */}
      <AshblockHeightsEnvironment stage={renderStage} />

      <EnvironmentAmbience
        stage={renderStage}
        fangBehavior={primaryCombatant?.behavior ?? 'IDLE'}
        playerHealth={renderMission.playerHealth}
      />
      <AtmosphericEffects stage={renderStage} fangBehavior={primaryCombatant?.behavior ?? 'IDLE'} />

      {isKai && (
        <>
          <mesh
            name="ashblock-kai-climb-wall"
            position={[0, 3, -14]}
            castShadow
            receiveShadow
            userData={{ climbable: true, isWall: true }}
          >
            <boxGeometry args={[10, 6, 1]} />
            <meshStandardMaterial color="#3f3a46" roughness={0.72} />
          </mesh>
          {[
            [0, 5.5, -9],
            [4, 6.5, -1],
            [-3, 7, 8],
          ].map(([x, y, z], index) => (
            <mesh
              key={`ashblock-web-anchor-${index}`}
              name={`ashblock-web-anchor-${index}`}
              position={[x, y, z]}
              castShadow
              userData={{ webAnchor: true }}
            >
              <sphereGeometry args={[0.28, 10, 10]} />
              <meshStandardMaterial color="#9d4edd" emissive="#6d28d9" emissiveIntensity={0.7} />
            </mesh>
          ))}
        </>
      )}

      {isJax && (
        <>
          {[
            [7, 1, -12],
            [7, 2, -1],
            [7, 3, 11],
          ].map(([x, y, z], index) => (
            <mesh
              key={`ashblock-jax-platform-${index}`}
              name={`ashblock-jax-platform-${index}`}
              position={[x, y, z]}
              castShadow
              receiveShadow
              userData={{ isWalkable: true, isCollider: true }}
            >
              <boxGeometry args={[5, 1, 6]} />
              <meshStandardMaterial color="#15395a" roughness={0.62} metalness={0.25} />
            </mesh>
          ))}
          <mesh
            position={[-8, 2.5, -1]}
            castShadow
            receiveShadow
            userData={{ isCollider: true, isWall: true }}
          >
            <boxGeometry args={[2, 5, 5]} />
            <meshStandardMaterial color="#292f3b" roughness={0.75} />
          </mesh>
        </>
      )}

      {renderMission.combatants.map((combatant) => (
        <group
          key={combatant.id}
          ref={(node) => registerFangRef(combatant.id, node)}
          name={`fang-syndicate-${combatant.archetype}-${combatant.id}`}
          position={[combatant.position.x, Math.max(0.8, combatant.position.y + 0.3), combatant.position.z]}
          visible={!combatant.isDead}
          userData={{
            combatTarget: !combatant.isDead,
            targetId: combatant.id,
            isLightningTarget: true,
            health: combatant.health,
            archetype: combatant.archetype,
          }}
        >
          <FangCombatantVisual state={combatant} />
        </group>
      ))}

      {renderStage === 'memory-trace' && (
        <MemoryTraceVisual isActivated={renderMission.memoryTraceActivated} />
      )}

      <ExtractionPortalVisual isUnlocked={renderMission.extractionUnlocked} />

      {isKai ? (
        <KaiControllerBridge playerRef={playerRef} debugRef={controllerDebugRef} />
      ) : (
        <JaxControllerBridge playerRef={playerRef} debugRef={controllerDebugRef} />
      )}

      <group ref={playerRef} position={[0, 0, -20]}>
        <mesh castShadow position={[0, 0.85, 0]}>
          <capsuleGeometry args={[0.3, 1.1, 6, 10]} />
          <meshStandardMaterial
            color={fighter.color}
            emissive={fighter.accentColor}
            emissiveIntensity={0.32}
          />
        </mesh>
        {isKai && [0, 1, 2, 3].map((index) => {
          const side = index < 2 ? -1 : 1;
          const y = index % 2 === 0 ? 0.5 : 1.15;
          return (
            <mesh
              key={`slice-kai-limb-${index}`}
              position={[side * 0.48, y, 0]}
              rotation={[0, 0, side * 0.65]}
              castShadow
            >
              <cylinderGeometry args={[0.05, 0.05, 0.85, 8]} />
              <meshStandardMaterial color="#7c3aed" />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function PlayerHUD({
  debug,
}: {
  debug: VerticalSliceDebugSnapshot;
}) {
  const [lastDamageTime, setLastDamageTime] = useState(0);
  const prevHealthRef = useRef(debug.playerHealth);

  // Detect damage and trigger flash
  useEffect(() => {
    if (debug.playerHealth < prevHealthRef.current) {
      setLastDamageTime(Date.now());
    }
    prevHealthRef.current = debug.playerHealth;
  }, [debug.playerHealth]);

  const isDamageFlashing = Date.now() - lastDamageTime < 200;

  const missionObjectives: Record<MissionStage, string> = {
    traversal: 'Reach the Ashblock disturbance',
    encounter: 'Break through the Fang-controlled block',
    'memory-trace': 'Investigate the Memory Trace',
    extraction: 'Reach extraction',
    complete: 'Ashblock secured',
  };

  const stagePhaseMap: Record<MissionStage, { label: string; icon: string; color: string }> = {
    traversal: { label: 'TRAVERSAL', icon: '➤', color: 'from-blue-500 to-cyan-400' },
    encounter: { label: 'ENCOUNTER', icon: '⚔', color: 'from-red-500 to-orange-500' },
    'memory-trace': { label: 'MEMORY TRACE', icon: '◆', color: 'from-purple-500 to-pink-500' },
    extraction: { label: 'EXTRACTION', icon: '⬆', color: 'from-green-500 to-emerald-400' },
    complete: { label: 'COMPLETE', icon: '✓', color: 'from-green-600 to-lime-500' },
  };

  const objective = debug.stage === 'traversal' || debug.stage === 'encounter' || debug.stage === 'memory-trace'
    ? debug.beatObjective
    : missionObjectives[debug.stage];

  const fangHealthPercent = debug.fangMaxHealth > 0
    ? (debug.fangHealth / debug.fangMaxHealth) * 100
    : 0;
  const playerHealthPercent = (debug.playerHealth / 100) * 100;
  const energyPercent = Math.min(100, (debug.energy / 100) * 100);

  const fangRoleLabel = debug.fangArchetype === 'none'
    ? 'Fang'
    : debug.fangArchetype.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');

  // Character-specific colors
  const isKai = debug.hero === 'kai';
  const isJax = debug.hero === 'jax';
  const heroColor = isKai ? 'from-blue-600 to-cyan-500' : isJax ? 'from-yellow-600 to-orange-500' : 'from-slate-600 to-slate-400';
  const heroAccent = isKai ? '#0066FF' : isJax ? '#FFD700' : '#64748b';
  const heroTextColor = isKai ? 'text-cyan-300' : isJax ? 'text-yellow-300' : 'text-slate-300';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 md:p-6 text-white font-sans">
      {/* TOP-LEFT: Stage Indicator & Objective */}
      <div className="flex flex-col gap-2 sm:gap-3 max-w-sm">
        {/* Stage Indicator */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 bg-black/50 rounded-lg px-3 py-1.5 border border-slate-700/40 backdrop-blur-sm`}>
            <span className="text-lg sm:text-xl">{stagePhaseMap[debug.stage].icon}</span>
            <div className={`text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r ${stagePhaseMap[debug.stage].color} bg-clip-text text-transparent`}>
              {stagePhaseMap[debug.stage].label}
            </div>
          </div>
        </div>

        {/* Objective */}
        <div className="text-xs sm:text-sm text-slate-300 max-w-md bg-black/30 rounded-lg px-3 py-2 backdrop-blur-sm border border-slate-700/20">
          {objective}
        </div>

        {/* Hero Identity */}
        <div className="flex items-center gap-2">
          <div className={`text-xs sm:text-sm font-bold uppercase tracking-wide bg-gradient-to-r ${heroColor} bg-clip-text text-transparent`}>
            {debug.hero === 'kai' && '◆ Kai'}
            {debug.hero === 'jax' && '◆ Jax'}
            {debug.hero === 'INVALID' && '◆ Unknown'}
          </div>
        </div>
      </div>

      {/* BOTTOM-LEFT: Health & Energy Bars */}
      <div className="flex flex-col gap-3 max-w-xs sm:max-w-sm">
        {/* Health Bar Section */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">HEALTH</span>
            <span className={`text-xs font-mono ${debug.playerDown ? 'text-red-400' : playerHealthPercent > 50 ? 'text-green-400' : 'text-orange-400'}`}>
              {debug.playerHealth.toFixed(0)} / 100
            </span>
          </div>

          {/* Health Bar with Damage Flash */}
          <div className={`relative h-3 sm:h-4 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700/50 transition-all duration-100 ${
            isDamageFlashing ? 'ring-2 ring-red-500/60' : ''
          }`}>
            <div
              className={`h-full transition-all duration-300 ${
                debug.playerDown
                  ? 'bg-gradient-to-r from-gray-600 to-gray-500'
                  : playerHealthPercent > 50
                    ? `bg-gradient-to-r ${heroColor}`
                    : playerHealthPercent > 25
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-500'
                      : 'bg-gradient-to-r from-red-600 to-red-500'
              }`}
              style={{
                width: `${Math.max(0, playerHealthPercent)}%`,
              }}
            />
            {/* Damage flash overlay */}
            {isDamageFlashing && (
              <div className="absolute inset-0 bg-red-500/40 animate-pulse" />
            )}
          </div>

          {/* Health Status */}
          {debug.playerDown && (
            <div className="text-xs text-red-400 font-semibold">HERO DOWN</div>
          )}
        </div>

        {/* Energy Bar Section */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">ENERGY</span>
            <span className="text-xs font-mono text-cyan-400">{energyPercent.toFixed(0)}%</span>
          </div>

          <div className="h-2 sm:h-3 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200 ease-out"
              style={{
                width: `${Math.max(0, energyPercent)}%`,
                boxShadow: energyPercent > 90 ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* TOP-RIGHT: Enemy/Stage-Specific Info */}
      {debug.stage === 'encounter' && debug.enemyCount > 0 && (
        <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 flex flex-col gap-2">
          <div className="flex flex-col gap-2 bg-black/70 rounded-lg p-3 sm:p-4 backdrop-blur-sm border border-red-500/30 min-w-52 sm:min-w-60">
            {/* Enemy Role Header */}
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm font-bold text-red-300 uppercase tracking-wider">
                {fangRoleLabel}
              </div>
              {debug.lieutenantAlive && (
                <div className="text-xs font-bold text-red-500 bg-red-500/20 px-2 py-1 rounded">
                  LIEUTENANT
                </div>
              )}
            </div>

            {/* Enemy Status */}
            <div className="text-xs text-slate-400">
              {debug.fangBehavior} • {debug.enemyCount} active
            </div>

            {/* Primary Enemy Health */}
            <div className="flex flex-col gap-1">
              <div className="text-xs text-slate-400">
                Primary Health
              </div>
              <div className="h-3 bg-slate-900/60 rounded-full overflow-hidden border border-slate-700/40">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                  style={{ width: `${Math.max(0, fangHealthPercent)}%` }}
                />
              </div>
              <div className="text-xs text-red-400 font-mono">
                {debug.fangHealth.toFixed(0)} / {debug.fangMaxHealth.toFixed(0)}
              </div>
            </div>

            {/* Total Enemy Health (if multiple) */}
            {debug.enemyCount > 1 && (
              <div className="flex flex-col gap-1 pt-2 border-t border-slate-700/30">
                <div className="text-xs text-slate-400">
                  Total Enemies: {debug.enemyCount}
                </div>
                <div className="text-xs text-red-400 font-mono">
                  {debug.totalEnemyHealth.toFixed(0)} total HP
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All-Clear Message */}
      {debug.stage === 'encounter' && debug.enemyCount === 0 && (
        <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6">
          <div className="bg-green-900/60 border border-green-500/50 rounded-lg px-4 py-2 backdrop-blur-sm animate-pulse">
            <div className="text-sm font-semibold text-green-300">✓ Route Clear — Keep Moving</div>
          </div>
        </div>
      )}

      {/* Memory Trace Indicator */}
      {debug.stage === 'memory-trace' && (
        <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6">
          <div className={`bg-purple-900/60 border ${debug.memoryTraceActivated ? 'border-purple-400/70' : 'border-purple-500/50'} rounded-lg px-4 py-2 backdrop-blur-sm transition-all duration-300`}>
            <div className={`text-sm font-semibold ${debug.memoryTraceActivated ? 'text-purple-200' : 'text-purple-300'}`}>
              {debug.memoryTraceActivated ? '✓ Memory Trace Complete' : '◆ Memory Trace Ready'}
            </div>
          </div>
        </div>
      )}

      {/* Extraction Indicator */}
      {debug.stage === 'extraction' && (
        <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6">
          <div className="bg-green-900/60 border border-green-500/50 rounded-lg px-4 py-2 backdrop-blur-sm animate-pulse">
            <div className="text-sm font-semibold text-green-300">➤ Extraction Ready</div>
          </div>
        </div>
      )}

      {/* Complete Indicator */}
      {debug.stage === 'complete' && (
        <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6">
          <div className="bg-emerald-900/60 border border-emerald-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
            <div className="text-sm font-semibold text-emerald-300">✓ ASHBLOCK SECURED</div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeveloperDiagnostics({
  debug,
  isCollapsed,
  setIsCollapsed,
}: {
  debug: VerticalSliceDebugSnapshot;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  return (
    <div
      data-testid="vertical-slice-debug-hud"
      className="absolute bottom-3 left-3 z-40 rounded-lg border border-purple-500/40 bg-black/85 backdrop-blur-sm px-3 py-2 font-mono text-[9px] sm:text-[10px] text-slate-200 pointer-events-auto cursor-pointer hover:border-purple-500/60 transition-colors"
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      <div className="font-bold text-purple-300 flex items-center justify-between gap-2 select-none">
        <span className="uppercase tracking-wide">⚙ Debug</span>
        <span className={`text-xs transition-transform duration-200 ${!isCollapsed ? 'rotate-90' : ''}`}>
          {isCollapsed ? '▶' : '▼'}
        </span>
      </div>

      {!isCollapsed && (
        <div className="mt-2 space-y-0.5 max-h-96 overflow-y-auto">
          {/* Core State Section */}
          <div className="border-t border-purple-500/20 pt-1.5 mt-1.5">
            <div className="text-purple-400 font-semibold mb-0.5">CORE</div>
            <div data-testid="slice-hero">H: {debug.hero.toUpperCase()}</div>
            <div data-testid="slice-stage">S: {debug.stage}</div>
            <div data-testid="slice-beat">B: {debug.beatId}</div>
            <div data-testid="slice-position">Pos: ({debug.position.map((v) => v.toFixed(1)).join(',')})</div>
          </div>

          {/* Controller State Section */}
          <div className="border-t border-purple-500/20 pt-1.5 mt-1.5">
            <div className="text-cyan-400 font-semibold mb-0.5">CONTROLLER</div>
            <div data-testid="slice-mode">Mode: {debug.locomotionMode}</div>
            <div data-testid="slice-wall">Wall: {debug.wallCrawling ? '✓' : '·'}</div>
            <div data-testid="slice-webzip">Web: {debug.webZipping ? '✓' : '·'}</div>
            <div data-testid="slice-attacking">Atk: {debug.attacking ? '✓' : '·'}</div>
            <div data-testid="slice-ground-charge">GndCh: {debug.groundCharges ?? '-'}</div>
            <div data-testid="slice-air-charge">AirCh: {debug.airCharges ?? '-'}</div>
            <div data-testid="slice-energy">Energy: {debug.energy.toFixed(0)}</div>
          </div>

          {/* Player State Section */}
          <div className="border-t border-purple-500/20 pt-1.5 mt-1.5">
            <div className="text-green-400 font-semibold mb-0.5">PLAYER</div>
            <div data-testid="slice-player-health">HP: {debug.playerHealth.toFixed(0)}/100</div>
            <div data-testid="slice-player-down" className={debug.playerDown ? 'text-red-400 font-bold' : ''}>
              {debug.playerDown ? 'DOWN ✗' : 'Active ✓'}
            </div>
            <div data-testid="slice-player-hit-grace">Grace: {debug.playerHitGrace.toFixed(2)}s</div>
          </div>

          {/* Combat State Section */}
          {debug.stage === 'encounter' && (
            <div className="border-t border-purple-500/20 pt-1.5 mt-1.5">
              <div className="text-red-400 font-semibold mb-0.5">COMBAT</div>
              <div data-testid="slice-enemy-count">Enemies: {debug.enemyCount}</div>
              <div data-testid="slice-total-enemy-health">Total HP: {debug.totalEnemyHealth.toFixed(0)}</div>
              <div data-testid="slice-fang-role">{debug.fangArchetype}</div>
              <div data-testid="slice-fang-health">Primary: {debug.fangHealth.toFixed(0)}/{debug.fangMaxHealth.toFixed(0)}</div>
              <div data-testid="slice-fang-behavior">Behavior: {debug.fangBehavior}</div>
              <div data-testid="slice-fang-windup">Windup: {debug.fangWindup.toFixed(2)}s</div>
              <div data-testid="slice-lieutenant">Lieut: {debug.lieutenantAlive ? '✓' : '·'}</div>
            </div>
          )}

          {/* Mission State Section */}
          {debug.stage !== 'traversal' && (
            <div className="border-t border-purple-500/20 pt-1.5 mt-1.5">
              <div className="text-yellow-400 font-semibold mb-0.5">MISSION</div>
              <div data-testid="slice-memory">Trace: {debug.memoryTraceActivated ? 'DONE' : 'PENDING'}</div>
              <div data-testid="slice-extraction">Extract: {debug.extractionUnlocked ? 'OPEN' : 'LOCKED'}</div>
            </div>
          )}

          {/* Performance Section */}
          <div className="border-t border-purple-500/20 pt-1.5 mt-1.5">
            <div className="text-blue-400 font-semibold mb-0.5">PERF</div>
            <div data-testid="slice-fps" className={debug.fps < 50 ? 'text-orange-400' : ''}>
              FPS: {debug.fps.toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RagingCityVerticalSliceScene({
  forcedCharacter,
}: {
  forcedCharacter?: VerticalSliceHero;
}) {
  const [debug, setDebug] = useState<VerticalSliceDebugSnapshot>({
    ...INITIAL_DEBUG,
    hero: forcedCharacter ?? 'INVALID',
  });
  const [diagnosticsCollapsed, setDiagnosticsCollapsed] = useState(false);
  const handleDebug = useCallback(
    (snapshot: VerticalSliceDebugSnapshot) => setDebug(snapshot),
    []
  );

  return (
    <div className="relative w-full h-screen bg-[#080a10]">
      <Canvas shadows camera={{ position: [0, 5, -30], fov: 52, near: 0.1, far: 220 }}>
        <Suspense fallback={null}>
          <VerticalSliceEnvironment forcedCharacter={forcedCharacter} onDebug={handleDebug} />
        </Suspense>
      </Canvas>

      <PlayerHUD debug={debug} />
      <DeveloperDiagnostics
        debug={debug}
        isCollapsed={diagnosticsCollapsed}
        setIsCollapsed={setDiagnosticsCollapsed}
      />
    </div>
  );
}
