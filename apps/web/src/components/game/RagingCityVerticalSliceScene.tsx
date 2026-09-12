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
const MEMORY_TRACE_Z = 5;
const EXTRACTION_GATE_Z = 15;

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
    const currentTime = frameState.clock.elapsedTime;
    const mission = stateRef.current;
    const playerPos = player.position;

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
          incomingDamage += aiResult.attackDamage;
        }
      }

      if (incomingDamage > 0 && controllerDebugRef.current.invulnTimer <= 0) {
        mission.playerHealth = Math.max(0, mission.playerHealth - incomingDamage);
        mission.playerDown = mission.playerHealth === 0;
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
      <EnvironmentAmbience
        stage={renderStage}
        fangBehavior={primaryCombatant?.behavior ?? 'IDLE'}
        playerHealth={renderMission.playerHealth}
      />
      <AtmosphericEffects stage={renderStage} fangBehavior={primaryCombatant?.behavior ?? 'IDLE'} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 20]}
        receiveShadow
        userData={{ isGround: true, isWalkable: true }}
      >
        <planeGeometry args={[44, 100]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} metalness={0.12} />
      </mesh>

      {[-15, 0, 15, 30, 45].map((z) => (
        <mesh key={`street-mark-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, z]}>
          <planeGeometry args={[0.22, 5]} />
          <meshStandardMaterial color="#c76b22" emissive="#7c2d12" emissiveIntensity={0.15} />
        </mesh>
      ))}

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
  const missionObjectives: Record<MissionStage, string> = {
    traversal: 'Reach the Ashblock disturbance',
    encounter: 'Break through the Fang-controlled block',
    'memory-trace': 'Investigate the Memory Trace',
    extraction: 'Reach extraction',
    complete: 'Ashblock secured',
  };

  const objective = debug.stage === 'traversal' || debug.stage === 'encounter' || debug.stage === 'memory-trace'
    ? debug.beatObjective
    : missionObjectives[debug.stage];
  const fangHealthPercent = debug.fangMaxHealth > 0
    ? (debug.fangHealth / debug.fangMaxHealth) * 100
    : 0;
  const playerHealthPercent = (debug.playerHealth / 100) * 100;
  const fangRoleLabel = debug.fangArchetype === 'none'
    ? 'Fang'
    : debug.fangArchetype.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 text-white font-sans">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="text-sm sm:text-base font-bold uppercase tracking-wide">
            {debug.hero === 'kai' && '⚪ Kai'}
            {debug.hero === 'jax' && '🟣 Jax'}
            {debug.hero === 'INVALID' && '? Unknown'}
          </div>
        </div>
        <div className="text-xs sm:text-sm text-slate-300 max-w-md">
          {objective}
        </div>
      </div>

      <div className="flex flex-col gap-4 max-w-xs">
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-1">Health</div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                debug.playerDown
                  ? 'bg-gray-500'
                  : playerHealthPercent > 30
                    ? 'bg-gradient-to-r from-green-500 to-lime-400'
                    : 'bg-gradient-to-r from-red-600 to-orange-400'
              }`}
              style={{ width: `${Math.max(0, playerHealthPercent)}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {debug.playerHealth.toFixed(0)} / 100
            {debug.playerDown && ' (DOWN)'}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-300 mb-1">Energy</div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200"
              style={{ width: `${Math.min(100, (debug.energy / 100) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {debug.stage === 'encounter' && debug.enemyCount > 0 && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col gap-3">
          <div className="flex flex-col gap-1 bg-black/60 rounded-lg p-3 backdrop-blur-sm min-w-44">
            <div className="text-xs font-semibold text-slate-300">{fangRoleLabel}</div>
            <div className="text-[10px] text-slate-400 mb-1">
              {debug.fangBehavior} · {debug.enemyCount} active
            </div>
            <div className="h-3 w-40 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${Math.max(0, fangHealthPercent)}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {debug.fangHealth.toFixed(0)} / {debug.fangMaxHealth.toFixed(0)}
              {debug.lieutenantAlive && ' · LIEUTENANT PRESENT'}
            </div>
          </div>
        </div>
      )}

      {debug.stage === 'encounter' && debug.enemyCount === 0 && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-slate-900/65 border border-slate-500/40 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="text-sm font-semibold text-slate-200">Route clear — keep moving</div>
        </div>
      )}

      {debug.stage === 'memory-trace' && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-purple-900/60 border border-purple-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="text-sm font-semibold text-purple-300">
            {debug.memoryTraceActivated ? '✓ Memory Trace Complete' : '◆ Memory Trace Ready'}
          </div>
        </div>
      )}

      {debug.stage === 'extraction' && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-green-900/60 border border-green-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="text-sm font-semibold text-green-300">➤ Extraction Ready</div>
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
      className="absolute bottom-3 left-3 z-40 rounded-xl border border-purple-500/30 bg-black/80 px-3 py-2 font-mono text-[10px] text-slate-200 pointer-events-auto cursor-pointer"
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      <div className="font-bold text-purple-300 flex items-center justify-between gap-2">
        <span>DIAGNOSTICS</span>
        <span className="text-xs">{isCollapsed ? '▶' : '▼'}</span>
      </div>

      {!isCollapsed && (
        <div className="mt-1.5 space-y-0.5">
          <div data-testid="slice-hero">Hero: {debug.hero.toUpperCase()}</div>
          <div data-testid="slice-stage">Stage: {debug.stage}</div>
          <div data-testid="slice-beat">Beat: {debug.beatId}</div>
          <div data-testid="slice-objective">Objective: {debug.beatObjective}</div>
          <div data-testid="slice-position">Pos: ({debug.position.map((value) => value.toFixed(2)).join(', ')})</div>
          <div data-testid="slice-mode">Mode: {debug.locomotionMode}</div>
          <div data-testid="slice-wall">Wall: {debug.wallCrawling ? 'YES' : 'NO'}</div>
          <div data-testid="slice-webzip">Web Zip: {debug.webZipping ? 'YES' : 'NO'}</div>
          <div data-testid="slice-ground-charge">Ground Charge: {debug.groundCharges ?? 'N/A'}</div>
          <div data-testid="slice-air-charge">Air Charge: {debug.airCharges ?? 'N/A'}</div>
          <div data-testid="slice-energy">Energy: {debug.energy.toFixed(1)}</div>
          <div data-testid="slice-player-health">Player HP: {debug.playerHealth.toFixed(0)}</div>
          <div data-testid="slice-player-down">Player Down: {debug.playerDown ? 'YES' : 'NO'}</div>
          <div data-testid="slice-enemy-count">Enemies: {debug.enemyCount}</div>
          <div data-testid="slice-total-enemy-health">Enemy HP Total: {debug.totalEnemyHealth.toFixed(0)}</div>
          <div data-testid="slice-fang-role">Fang Role: {debug.fangArchetype}</div>
          <div data-testid="slice-fang-health">Fang HP: {debug.fangHealth.toFixed(0)}</div>
          <div data-testid="slice-fang-behavior">Fang: {debug.fangBehavior}</div>
          <div data-testid="slice-fang-windup">Windup: {debug.fangWindup.toFixed(2)}</div>
          <div data-testid="slice-lieutenant">Lieutenant: {debug.lieutenantAlive ? 'YES' : 'NO'}</div>
          <div data-testid="slice-memory">Memory Trace: {debug.memoryTraceActivated ? 'COMPLETE' : 'PENDING'}</div>
          <div data-testid="slice-extraction">Extraction: {debug.extractionUnlocked ? 'OPEN' : 'LOCKED'}</div>
          <div data-testid="slice-fps">FPS: {debug.fps.toFixed(1)}</div>
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
