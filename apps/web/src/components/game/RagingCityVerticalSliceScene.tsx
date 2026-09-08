/**
 * RAGING CITY VERTICAL SLICE SCENE
 * Day 5.1A - Ashblock Heights with real Kai/Jax controller integration
 *
 * Architecture:
 * - Canvas-based scene for Ashblock Heights vertical slice
 * - Real controller ownership: useKaiController or useJaxController
 * - One playerRef for both controller and render (no duplicate position state)
 * - Mission stages: traversal → encounter → memory trace → extraction
 * - Character routing: Kai vs Jax determines traversal path
 * - Fang Syndicate combatant encounter (source-safe internal contract)
 * - Memory Trace requires actual proximity + interact input (no auto-activation)
 * - Story hero access: Kai or Jax only (kai-jax is earned fusion, not selectable)
 */

import { useCallback, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Suspense } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { getFighterById } from '../../lib/characters';
import { useKaiController } from './characters/kai/KaiController';
import { useJaxController } from './characters/jax/JaxController';
import { createFangCombatant, updateFangCombatant, type FangCombatantState } from '../../game/characters/fang/FangCombatantContract';
import { gameplayInputManager } from '../../lib/input/GameplayInputState';

type MissionStage = 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';
type ControllerHandle = ReturnType<typeof useKaiController> | ReturnType<typeof useJaxController>;

interface MissionStateRef {
  stage: MissionStage;
  encounterActive: boolean;
  memoryTraceActivated: boolean;
  extractionUnlocked: boolean;
  fangCombatant: FangCombatantState;
  totalTime: number;
  controller: ControllerHandle | null;
}

function VerticalSliceEnvironment() {
  const { scene, camera } = useThree();
  const { selectedCharacter, activeStoryMissionId, setGameState, setMissionCompleted } = useRunner();

  // Story hero must be canonical: "kai" or "jax" only. kai-jax is earned fusion, not story selectable.
  const charId = selectedCharacter;
  const isKai = charId === 'kai';
  const isJax = charId === 'jax';

  // Redirect if not Kai or Jax
  useEffect(() => {
    if (!isKai && !isJax) {
      setGameState('mission-select');
    }
  }, [charId, isKai, isJax, setGameState]);

  const fighter = getFighterById(charId);
  const playerRef = useRef<THREE.Group>(null);

  // Mount the real controller (Kai or Jax)
  const kaiController = useKaiController(playerRef, scene);
  const jaxController = useJaxController(playerRef, scene);
  const controller = isKai ? kaiController : jaxController;

  const stateRef = useRef<MissionStateRef>({
    stage: 'traversal',
    encounterActive: false,
    memoryTraceActivated: false,
    extractionUnlocked: false,
    fangCombatant: createFangCombatant('fang_01'),
    totalTime: 0,
    controller,
  });

  const state = stateRef.current;
  state.controller = controller;

  // Scene setup
  useEffect(() => {
    const bg = new THREE.Color(0x1a1a2e);
    scene.background = bg;
    scene.fog = new THREE.Fog(0x1a1a2e, 120, 400);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    scene.add(directionalLight);

    camera.position.set(0, 5, 15);
    camera.lookAt(0, 2, 0);

    return () => {
      scene.clear();
    };
  }, [scene, camera]);

  // Mission stage progression reads controller-owned position (NOT auto-movement)
  useFrame(({ camera }, delta) => {
    if (!controller || !playerRef.current) return;

    state.totalTime += delta;
    const playerPos = playerRef.current.position;

    updateFangCombatant(state.fangCombatant, delta);

    // Stage progression based on controller-owned player position
    if (state.stage === 'traversal' && playerPos.z > -5) {
      state.stage = 'encounter';
      state.encounterActive = true;
    }

    if (state.stage === 'encounter' && state.fangCombatant.isDead) {
      state.stage = 'memory-trace';
      state.encounterActive = false;
    }

    // Memory Trace requires proximity AND interact input (not auto-activation)
    const distToTrace = Math.hypot(playerPos.x - 0, playerPos.z - 5);
    if (state.stage === 'memory-trace' && distToTrace < 2) {
      const input = gameplayInputManager.getState();
      if (input.interact) {
        state.memoryTraceActivated = true;
      }
    }

    if (state.stage === 'memory-trace' && state.memoryTraceActivated) {
      state.stage = 'extraction';
      state.extractionUnlocked = true;
    }

    // Extraction unlocked only when objectives complete
    if (state.stage === 'extraction' && playerPos.z > 15) {
      state.stage = 'complete';
      if (activeStoryMissionId) {
        setMissionCompleted(activeStoryMissionId);
      }
      setGameState('mission-complete');
    }

    // Camera follow player
    camera.position.lerp(
      new THREE.Vector3(0, 5, playerPos.z + 15),
      0.1
    );
  });

  if (!fighter) return null;

  if (!fighter) return null;

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 120]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>

      {/* Ashblock street surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[56, 116]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.88} metalness={0.15} />
      </mesh>

      {/* Street lanes - shared route */}
      {[-12, 0, 12].map((z_offset, i) =>
        [-100, -50, 0, 50, 100].map((base_z, j) => (
          <mesh
            key={`lane-${i}-${j}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, z_offset + base_z]}
          >
            <planeGeometry args={[52, 15]} />
            <meshStandardMaterial color="#d97706" emissive="#b45309" emissiveIntensity={0.14} roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Kai-specific: Wall climb path on left (tagged as climbable) */}
      {isKai && (
        <>
          {[-100, -50, 0, 50].map((z_base, i) => (
            <mesh
              key={`kai-wall-${i}`}
              position={[-20, 3, z_base]}
              castShadow
              receiveShadow
              userData={{ climbable: true, isWall: true }}
            >
              <boxGeometry args={[1.2, 8, 15]} />
              <meshStandardMaterial color="#4a4a4a" roughness={0.6} />
            </mesh>
          ))}
          {/* Web zip anchors (tagged for aerial traversal) */}
          {[-20, -10, 0].map((x, i) =>
            [0, 50].map((z, j) => (
              <mesh key={`web-anchor-${i}-${j}`} position={[x, 6, z]} castShadow userData={{ webAnchor: true }}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.6} />
              </mesh>
            ))
          )}
        </>
      )}

      {/* Jax-specific: Displacement gaps with tagged walkable/collider geometry */}
      {isJax && (
        <>
          {[0, 50].map((z_base, i) => (
            <group key={`jax-platforms-${i}`}>
              <mesh
                position={[20, 1, z_base]}
                castShadow
                receiveShadow
                userData={{ isWalkable: true, isCollider: true }}
              >
                <boxGeometry args={[2, 2, 12]} />
                <meshStandardMaterial color="#1a3a4a" roughness={0.6} />
              </mesh>
              <mesh
                position={[20, 1, z_base + 18]}
                castShadow
                receiveShadow
                userData={{ isWalkable: true, isCollider: true }}
              >
                <boxGeometry args={[2, 2, 12]} />
                <meshStandardMaterial color="#1a3a4a" roughness={0.6} />
              </mesh>
            </group>
          ))}
        </>
      )}

      {/* Fang Syndicate Combatant - Encounter (source-safe: no rank/weapon/biography) */}
      {state.encounterActive && (
        <mesh position={[0, 0.5, 2]} castShadow>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial
            color={state.fangCombatant.isDead ? '#333333' : '#ff3333'}
            emissive={state.fangCombatant.isDead ? '#000000' : '#990000'}
            emissiveIntensity={state.fangCombatant.isDead ? 0 : 0.4}
          />
        </mesh>
      )}

      {/* Memory Trace interaction point (requires proximity + interact input) */}
      {state.stage === 'memory-trace' && (
        <mesh position={[0, 0.5, 5]} castShadow userData={{ memoryTrace: true }}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial
            color={state.memoryTraceActivated ? '#00ff00' : '#00ffff'}
            emissive={state.memoryTraceActivated ? '#00ff00' : '#00ffff'}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Extraction marker (locked until objectives complete) */}
      <mesh position={[0, 0.5, 15]} castShadow userData={{ extraction: true }}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color={state.extractionUnlocked ? '#00ff00' : '#555555'}
          emissive={state.extractionUnlocked ? '#00ff00' : '#000000'}
          emissiveIntensity={state.extractionUnlocked ? 0.6 : 0}
        />
      </mesh>

      {/* Player character - uses controller-owned position */}
      <group ref={playerRef} position={[0, 1, -20]}>
        <mesh castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={fighter.color}
            emissive={fighter.accentColor}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function RagingCityVerticalSliceScene() {
  return (
    <div className="relative w-full h-screen">
      <Canvas
        shadows
        camera={{
          position: [0, 5, 15],
          fov: 50,
          near: 0.1,
          far: 500,
        }}
      >
        <Suspense fallback={null}>
          <VerticalSliceEnvironment />
        </Suspense>
      </Canvas>
    </div>
  );
}
