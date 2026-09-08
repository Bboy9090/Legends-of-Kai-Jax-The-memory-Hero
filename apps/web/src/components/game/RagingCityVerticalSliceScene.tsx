/**
 * RAGING CITY VERTICAL SLICE SCENE
 * Day 5.1B - Ashblock Heights with real Kai/Jax controller integration
 *
 * Architecture:
 * - Canvas-based Ashblock Heights vertical slice
 * - Exactly one real controller is mounted for the selected Story Hero
 * - One playerRef is shared by controller and rendered proxy
 * - Mission stages: traversal -> encounter -> memory trace -> extraction
 * - Memory Trace requires proximity plus an interact rising edge
 * - Story Hero access: Kai or Jax only; Kai-Jax remains story-earned fusion
 */

import { Suspense, useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRunner } from '../../lib/stores/useRunner';
import { getFighterById } from '../../lib/characters';
import { useKaiController } from './characters/kai/KaiController';
import { useJaxController } from './characters/jax/JaxController';
import { createFangCombatant, updateFangCombatant, type FangCombatantState } from '../../game/characters/fang/FangCombatantContract';
import { gameplayInputManager } from '../../lib/input/GameplayInputState';

export type VerticalSliceHero = 'kai' | 'jax';
type MissionStage = 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';

interface ControllerDebugState {
  locomotionMode: string;
  wallCrawling: boolean;
  webZipping: boolean;
  energy: number;
  groundCharges: number | null;
  airCharges: number | null;
}

export interface VerticalSliceDebugSnapshot extends ControllerDebugState {
  hero: VerticalSliceHero | 'INVALID';
  stage: MissionStage;
  position: [number, number, number];
  fangHealth: number;
  memoryTraceActivated: boolean;
  extractionUnlocked: boolean;
  fps: number;
}

const INITIAL_CONTROLLER_DEBUG: ControllerDebugState = {
  locomotionMode: 'LOADING',
  wallCrawling: false,
  webZipping: false,
  energy: 100,
  groundCharges: null,
  airCharges: null,
};

const INITIAL_DEBUG: VerticalSliceDebugSnapshot = {
  ...INITIAL_CONTROLLER_DEBUG,
  hero: 'INVALID',
  stage: 'traversal',
  position: [0, 0, -20],
  fangHealth: 100,
  memoryTraceActivated: false,
  extractionUnlocked: false,
  fps: 0,
};

interface MissionStateRef {
  stage: MissionStage;
  encounterActive: boolean;
  memoryTraceActivated: boolean;
  extractionUnlocked: boolean;
  fangCombatant: FangCombatantState;
  completionRecorded: boolean;
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
  const controllerDebugRef = useRef<ControllerDebugState>({ ...INITIAL_CONTROLLER_DEBUG });
  const previousInteractRef = useRef(false);
  const perfRef = useRef({ elapsed: 0, frames: 0, fps: 0, hudElapsed: 0 });
  const stateRef = useRef<MissionStateRef>({
    stage: 'traversal',
    encounterActive: false,
    memoryTraceActivated: false,
    extractionUnlocked: false,
    fangCombatant: createFangCombatant('fang_01'),
    completionRecorded: false,
  });

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

  useFrame((_, rawDelta) => {
    const player = playerRef.current;
    if (!player || hero === 'INVALID') return;

    const delta = Math.min(rawDelta, 0.05);
    const mission = stateRef.current;
    const playerPos = player.position;

    updateFangCombatant(mission.fangCombatant, delta);

    if (mission.stage === 'traversal' && playerPos.z > -5) {
      mission.stage = 'encounter';
      mission.encounterActive = true;
    }

    if (mission.stage === 'encounter' && mission.fangCombatant.isDead) {
      mission.stage = 'memory-trace';
      mission.encounterActive = false;
    }

    const input = gameplayInputManager.getState();
    const interactEdge = input.interact && !previousInteractRef.current;
    previousInteractRef.current = input.interact;

    const distToTrace = Math.hypot(playerPos.x, playerPos.z - 5);
    if (mission.stage === 'memory-trace' && distToTrace < 2 && interactEdge) {
      mission.memoryTraceActivated = true;
    }

    if (mission.stage === 'memory-trace' && mission.memoryTraceActivated) {
      mission.stage = 'extraction';
      mission.extractionUnlocked = true;
    }

    if (mission.stage === 'extraction' && playerPos.z > 15) {
      mission.stage = 'complete';
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
      onDebug({
        ...controllerDebugRef.current,
        hero,
        stage: mission.stage,
        position: [playerPos.x, playerPos.y, playerPos.z],
        fangHealth: mission.fangCombatant.health,
        memoryTraceActivated: mission.memoryTraceActivated,
        extractionUnlocked: mission.extractionUnlocked,
        fps: perf.fps,
      });
    }
  });

  if (!fighter || hero === 'INVALID') return null;

  return (
    <group>
      <ambientLight intensity={0.55} color="#dbeafe" />
      <directionalLight position={[12, 24, -8]} intensity={1.0} color="#f8fafc" castShadow />
      <hemisphereLight args={["#334155", "#050505", 0.45]} />

      {/* Shared Ashblock street. Ground is explicitly walkable for Jax ground queries. */}
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

      {/* Kai route: a real climbable facade directly on the opening path plus reachable Web Zip anchors. */}
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

      {/* Jax route: offset walkable landing platforms and colliders for displacement traversal. */}
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
          <mesh position={[-8, 2.5, -1]} castShadow receiveShadow userData={{ isCollider: true, isWall: true }}>
            <boxGeometry args={[2, 5, 5]} />
            <meshStandardMaterial color="#292f3b" roughness={0.75} />
          </mesh>
        </>
      )}

      {/* Source-safe Fang combatant proxy. Rank, weapon, biology and chronology remain canon-gated. */}
      {stateRef.current.encounterActive && (
        <mesh name="fang-syndicate-combatant-proxy" position={[0, 0.8, 2]} castShadow>
          <capsuleGeometry args={[0.45, 1.1, 6, 10]} />
          <meshStandardMaterial color="#4a2a7a" emissive="#2360d1" emissiveIntensity={0.28} />
        </mesh>
      )}

      {stateRef.current.stage === 'memory-trace' && (
        <mesh name="ashblock-memory-trace" position={[0, 0.6, 5]} castShadow userData={{ memoryTrace: true }}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial
            color={stateRef.current.memoryTraceActivated ? '#6ee7b7' : '#8b5cf6'}
            emissive={stateRef.current.memoryTraceActivated ? '#10b981' : '#6d28d9'}
            emissiveIntensity={0.55}
          />
        </mesh>
      )}

      <mesh name="ashblock-extraction" position={[0, 0.6, 17]} castShadow userData={{ extraction: true }}>
        <cylinderGeometry args={[0.7, 0.7, 0.14, 24]} />
        <meshStandardMaterial
          color={stateRef.current.extractionUnlocked ? '#22c55e' : '#475569'}
          emissive={stateRef.current.extractionUnlocked ? '#16a34a' : '#000000'}
          emissiveIntensity={stateRef.current.extractionUnlocked ? 0.6 : 0}
        />
      </mesh>

      {/* Exactly one real controller bridge is mounted. Both can never write this ref simultaneously. */}
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
            <mesh key={`slice-kai-limb-${index}`} position={[side * 0.48, y, 0]} rotation={[0, 0, side * 0.65]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.85, 8]} />
              <meshStandardMaterial color="#7c3aed" />
            </mesh>
          );
        })}
      </group>
    </group>
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
  const handleDebug = useCallback((snapshot: VerticalSliceDebugSnapshot) => setDebug(snapshot), []);

  return (
    <div className="relative w-full h-screen bg-[#080a10]">
      <Canvas shadows camera={{ position: [0, 5, -30], fov: 52, near: 0.1, far: 220 }}>
        <Suspense fallback={null}>
          <VerticalSliceEnvironment forcedCharacter={forcedCharacter} onDebug={handleDebug} />
        </Suspense>
      </Canvas>

      <div
        data-testid="vertical-slice-debug-hud"
        className="absolute top-3 left-3 z-50 rounded-xl border border-purple-500/30 bg-black/80 px-3 py-2 font-mono text-[11px] text-slate-200 pointer-events-none"
      >
        <div className="font-bold text-purple-300">ASHBLOCK HEIGHTS — LIVE SLICE</div>
        <div data-testid="slice-hero">Hero: {debug.hero.toUpperCase()}</div>
        <div data-testid="slice-stage">Stage: {debug.stage}</div>
        <div data-testid="slice-position">Pos: ({debug.position.map((value) => value.toFixed(2)).join(', ')})</div>
        <div data-testid="slice-mode">Mode: {debug.locomotionMode}</div>
        <div data-testid="slice-wall">Wall: {debug.wallCrawling ? 'YES' : 'NO'}</div>
        <div data-testid="slice-webzip">Web Zip: {debug.webZipping ? 'YES' : 'NO'}</div>
        <div data-testid="slice-ground-charge">Ground Charge: {debug.groundCharges ?? 'N/A'}</div>
        <div data-testid="slice-air-charge">Air Charge: {debug.airCharges ?? 'N/A'}</div>
        <div data-testid="slice-energy">Energy: {debug.energy.toFixed(1)}</div>
        <div data-testid="slice-fang-health">Fang HP: {debug.fangHealth.toFixed(0)}</div>
        <div data-testid="slice-memory">Memory Trace: {debug.memoryTraceActivated ? 'COMPLETE' : 'PENDING'}</div>
        <div data-testid="slice-extraction">Extraction: {debug.extractionUnlocked ? 'OPEN' : 'LOCKED'}</div>
        <div data-testid="slice-fps">FPS: {debug.fps.toFixed(1)}</div>
      </div>
    </div>
  );
}
