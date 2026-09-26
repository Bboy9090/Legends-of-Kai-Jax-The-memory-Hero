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
import { gameplayInputManager } from '../../lib/input/GameplayInputState';
import { gameplayPulseBuffer } from '../../lib/input/GameplayPulseBuffer';
import { combatActionBuffer } from '../../lib/input/CombatActionBuffer';
import VerticalSliceTouchControls from './VerticalSliceTouchControls';
import {
  getFieldMission,
  type FieldMissionCatalogEntry,
} from '../../mission/FieldMissionCatalog';

type FieldHero = 'kai' | 'jax';

interface FieldDebug {
  hero: FieldHero | 'INVALID';
  missionId: string;
  location: string;
  beatIndex: number;
  beatObjective: string;
  position: [number, number, number];
  interactReady: boolean;
  completed: boolean;
}

interface ControllerDebug {
  locomotionMode: string;
  energy: number;
}

const INITIAL_CONTROLLER_DEBUG: ControllerDebug = {
  locomotionMode: 'LOADING',
  energy: 100,
};

function KaiBridge({
  playerRef,
  debugRef,
}: {
  playerRef: RefObject<THREE.Group>;
  debugRef: MutableRefObject<ControllerDebug>;
}) {
  const { scene } = useThree();
  const controller = useKaiController(playerRef, scene);

  useFrame(() => {
    const state = controller.getState();
    debugRef.current = {
      locomotionMode: state.locomotionMode,
      energy: state.energy,
    };
  });

  return null;
}

function JaxBridge({
  playerRef,
  debugRef,
}: {
  playerRef: RefObject<THREE.Group>;
  debugRef: MutableRefObject<ControllerDebug>;
}) {
  const { scene } = useThree();
  const controller = useJaxController(playerRef, scene);

  useFrame(() => {
    const state = controller.getState();
    debugRef.current = {
      locomotionMode: state.locomotionMode,
      energy: state.energy,
    };
  });

  return null;
}

function colorForMission(id: string): string {
  if (id.includes('ironvein')) return '#7c3aed';
  if (id.includes('skyfall')) return '#0ea5e9';
  if (id.includes('storm_ronin')) return '#f59e0b';
  return '#64748b';
}

function FieldEnvironment({
  mission,
  onDebug,
}: {
  mission: FieldMissionCatalogEntry;
  onDebug: (debug: FieldDebug) => void;
}) {
  const { scene, camera } = useThree();
  const selectedCharacter = useRunner((state) => state.selectedCharacter);
  const setMissionCompleted = useRunner((state) => state.setMissionCompleted);
  const setGameState = useRunner((state) => state.setGameState);

  const hero: FieldHero | 'INVALID' =
    selectedCharacter === 'kai' ? 'kai' : selectedCharacter === 'jax' ? 'jax' : 'INVALID';
  const fighter = getFighterById(selectedCharacter ?? '');
  const playerRef = useRef<THREE.Group>(null);
  const controllerDebugRef = useRef<ControllerDebug>({ ...INITIAL_CONTROLLER_DEBUG });
  const previousInteractRef = useRef(false);
  const [beatIndex, setBeatIndex] = useState(0);
  const completionRecordedRef = useRef(false);
  const beatIndexRef = useRef(0);

  const accent = colorForMission(mission.id);
  const interactionZ = -4 + Math.max(0, mission.objectives.length - 1) * 9;

  const advanceBeat = useCallback((next: number) => {
    const clamped = Math.min(next, mission.objectives.length - 1);
    beatIndexRef.current = clamped;
    setBeatIndex(clamped);
  }, [mission.objectives.length]);

  useEffect(() => {
    if (hero === 'INVALID') setGameState('mission-select');
  }, [hero, setGameState]);

  useEffect(() => {
    const previousBackground = scene.background;
    const previousFog = scene.fog;
    const bg = new THREE.Color(0x090b14);
    scene.background = bg;
    scene.fog = new THREE.Fog(0x090b14, 45, 140);
    camera.position.set(0, 5, -30);
    camera.lookAt(0, 1, -12);

    return () => {
      if (scene.background === bg) scene.background = previousBackground;
      scene.fog = previousFog;
    };
  }, [scene, camera]);

  useFrame((_state, rawDelta) => {
    const player = playerRef.current;
    if (!player || hero === 'INVALID') return;

    const delta = Math.min(Math.max(rawDelta, 0), 0.05);
    const currentBeat = beatIndexRef.current;
    const finalBeat = currentBeat >= mission.objectives.length - 1;
    const nextThreshold = -8 + currentBeat * 9;

    if (!finalBeat && player.position.z >= nextThreshold) {
      advanceBeat(currentBeat + 1);
    }

    const input = gameplayInputManager.getState();
    const interactEdge =
      gameplayPulseBuffer.consume('interact') ||
      (input.interact && !previousInteractRef.current);
    previousInteractRef.current = input.interact;

    const interactReady =
      finalBeat &&
      Math.hypot(player.position.x, player.position.z - interactionZ) <= 2.5;

    if (interactReady && interactEdge && !completionRecordedRef.current) {
      completionRecordedRef.current = true;
      setMissionCompleted(mission.id);
      setGameState('mission-complete');
    }

    const cameraTarget = new THREE.Vector3(player.position.x * 0.2, 5, player.position.z - 10);
    camera.position.lerp(cameraTarget, Math.min(1, delta * 5));
    camera.lookAt(player.position.x, 1.2, player.position.z + 5);

    onDebug({
      hero,
      missionId: mission.id,
      location: mission.location,
      beatIndex: beatIndexRef.current,
      beatObjective: mission.objectives[beatIndexRef.current] ?? mission.objectives[0] ?? 'Advance',
      position: [player.position.x, player.position.y, player.position.z],
      interactReady,
      completed: completionRecordedRef.current,
    });
  });

  if (!fighter || hero === 'INVALID') return null;

  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 16, -4]} intensity={1.2} castShadow />
      <pointLight position={[0, 5, interactionZ]} intensity={1.4} distance={18} color={accent} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 22]}
        receiveShadow
        userData={{ isGround: true, isWalkable: true }}
      >
        <planeGeometry args={[36, 110]} />
        <meshStandardMaterial color="#171923" roughness={0.9} />
      </mesh>

      {mission.objectives.map((objective, index) => {
        const z = -10 + index * 9;
        const side = index % 2 === 0 ? -1 : 1;
        return (
          <group key={`${mission.id}-course-${index}`}>
            <mesh
              position={[side * 5, 1 + (index % 3) * 0.5, z]}
              castShadow
              receiveShadow
              userData={{ isCollider: true, isWalkable: true }}
            >
              <boxGeometry args={[5, 1.2, 4]} />
              <meshStandardMaterial color={accent} roughness={0.65} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.2, 1.5, 24]} />
              <meshBasicMaterial color={accent} transparent opacity={0.3 + index * 0.04} />
            </mesh>
          </group>
        );
      })}

      {hero === 'kai' && [0, 1, 2].map((index) => (
        <mesh
          key={`field-web-anchor-${index}`}
          position={[(index - 1) * 4, 6 + index, -2 + index * 12]}
          userData={{ webAnchor: true }}
        >
          <sphereGeometry args={[0.28, 10, 10]} />
          <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {hero === 'jax' && [0, 1, 2].map((index) => (
        <mesh
          key={`field-jax-platform-${index}`}
          position={[6, 1 + index, -3 + index * 12]}
          castShadow
          receiveShadow
          userData={{ isWalkable: true, isCollider: true }}
        >
          <boxGeometry args={[5, 1, 5]} />
          <meshStandardMaterial color="#155e75" roughness={0.6} metalness={0.25} />
        </mesh>
      ))}

      <group position={[0, 1.2, interactionZ]}>
        <mesh>
          <octahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.9}
            transparent
            opacity={0.75}
          />
        </mesh>
      </group>

      {hero === 'kai' ? (
        <KaiBridge playerRef={playerRef} debugRef={controllerDebugRef} />
      ) : (
        <JaxBridge playerRef={playerRef} debugRef={controllerDebugRef} />
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
      </group>
    </group>
  );
}

export default function RagingCityFieldScene() {
  const activeStoryMissionId = useRunner((state) => state.activeStoryMissionId);
  const mission = getFieldMission(activeStoryMissionId);
  const [debug, setDebug] = useState<FieldDebug>({
    hero: 'INVALID',
    missionId: mission.id,
    location: mission.location,
    beatIndex: 0,
    beatObjective: mission.objectives[0] ?? 'Advance',
    position: [0, 0, -20],
    interactReady: false,
    completed: false,
  });

  useEffect(() => {
    gameplayInputManager.setSuppressed(false);
    combatActionBuffer.clear();
    gameplayPulseBuffer.clear();
    return () => {
      gameplayInputManager.setSuppressed(false);
      combatActionBuffer.clear();
      gameplayPulseBuffer.clear();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#080a10]">
      <Canvas shadows camera={{ position: [0, 5, -30], fov: 52, near: 0.1, far: 220 }}>
        <Suspense fallback={null}>
          <FieldEnvironment mission={mission} onDebug={setDebug} />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 text-white">
        <div className="max-w-xl rounded-xl border border-white/10 bg-black/55 backdrop-blur-sm p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{debug.location}</div>
          <div data-testid="field-beat-objective" className="mt-1 text-sm font-semibold">
            {debug.beatObjective}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Beat {debug.beatIndex + 1} / {mission.objectives.length}
          </div>
          {debug.interactReady && (
            <div data-testid="field-interact-ready" className="mt-3 text-xs font-bold text-cyan-300">
              INTERACT TO COMPLETE FIELD TRACE
            </div>
          )}
        </div>
      </div>

      <VerticalSliceTouchControls />
    </div>
  );
}
