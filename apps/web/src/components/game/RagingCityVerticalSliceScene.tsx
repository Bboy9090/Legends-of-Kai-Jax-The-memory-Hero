/**
 * RAGING CITY VERTICAL SLICE SCENE
 * Day 5.1 - Ashblock Heights mission shell with 4-stage mission structure
 *
 * Architecture:
 * - Canvas-based scene for Ashblock Heights vertical slice
 * - Mission stages: traversal → encounter → memory trace → extraction
 * - Character routing: Kai vs Jax determines traversal path
 * - Fang Syndicate combatant encounter (source-safe internal contract)
 * - Memory Trace interaction with neutral narrative payload
 *
 * Future: Integrate real Kai/Jax controllers once scene shell is stable
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Suspense } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { getFighterById, resolvePublicCombatId } from '../../lib/characters';
import { createFangCombatant, damageFangCombatant, updateFangCombatant, type FangCombatantState } from '../../game/characters/fang/FangCombatantContract';

type MissionStage = 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';

interface MissionStateRef {
  stage: MissionStage;
  encounterActive: boolean;
  memoryTraceActivated: boolean;
  extractionUnlocked: boolean;
  fangCombatant: FangCombatantState;
  playerPosition: THREE.Vector3;
  totalTime: number;
}

function VerticalSliceEnvironment() {
  const { scene, camera } = useThree();
  const { selectedCharacter, activeStoryMissionId, setGameState, completeStoryMission } = useRunner();

  const charId = resolvePublicCombatId(selectedCharacter);
  const fighter = getFighterById(charId);
  const isKai = charId === 'kai' || charId === 'kai-jax';
  const isJax = charId === 'jax' || charId === 'kai-jax';

  const stateRef = useRef<MissionStateRef>({
    stage: 'traversal',
    encounterActive: false,
    memoryTraceActivated: false,
    extractionUnlocked: false,
    fangCombatant: createFangCombatant('fang_01'),
    playerPosition: new THREE.Vector3(0, 1, -20),
    totalTime: 0,
  });

  const state = stateRef.current;

  // Scene setup
  useEffect(() => {
    const bg = new THREE.Color(0x1a1a2e);
    scene.background = bg;
    scene.fog = new THREE.Fog(0x1a1a2e, 120, 400);

    // Lighting
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

  // Character validation
  useEffect(() => {
    if (!isKai && !isJax) {
      setGameState('mission-select');
    }
  }, [charId, isKai, isJax, setGameState]);

  useFrame(({ camera }, delta) => {
    state.totalTime += delta;

    // Update Fang combatant
    updateFangCombatant(state.fangCombatant, delta);

    // Stage progression
    if (state.stage === 'traversal') {
      // Player moves forward automatically in demo (would use controller input)
      state.playerPosition.z += delta * 3;

      // Traversal complete when reaching encounter area
      if (state.playerPosition.z > -5) {
        state.stage = 'encounter';
        state.encounterActive = true;
      }
    }

    if (state.stage === 'encounter' && state.fangCombatant.isDead) {
      state.stage = 'memory-trace';
      state.encounterActive = false;
    }

    if (state.stage === 'memory-trace' && state.memoryTraceActivated) {
      state.stage = 'extraction';
      state.extractionUnlocked = true;
    }

    // Auto-activate memory trace after 2 seconds in that stage
    if (state.stage === 'memory-trace' && !state.memoryTraceActivated && state.totalTime > 30) {
      state.memoryTraceActivated = true;
    }

    if (state.stage === 'extraction' && state.playerPosition.z > 15) {
      state.stage = 'complete';
      if (activeStoryMissionId) {
        completeStoryMission(activeStoryMissionId);
      }
      setGameState('mission-complete');
    }

    // Camera follow
    camera.position.lerp(
      new THREE.Vector3(0, 5, state.playerPosition.z + 15),
      0.1
    );
  });

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

      {/* Kai-specific: Wall climb path on left */}
      {isKai && (
        <>
          {[-100, -50, 0, 50].map((z_base, i) => (
            <mesh key={`kai-wall-${i}`} position={[-20, 3, z_base]} castShadow receiveShadow>
              <boxGeometry args={[1.2, 8, 15]} />
              <meshStandardMaterial color="#4a4a4a" roughness={0.6} />
            </mesh>
          ))}
          {/* Web zip anchors */}
          {[-20, -10, 0].map((x, i) =>
            [0, 50].map((z, j) => (
              <mesh key={`web-anchor-${i}-${j}`} position={[x, 6, z]} castShadow>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.6} />
              </mesh>
            ))
          )}
        </>
      )}

      {/* Jax-specific: Displacement gaps on right */}
      {isJax && (
        <>
          {[0, 50].map((z_base, i) => (
            <group key={`jax-platforms-${i}`}>
              <mesh position={[20, 1, z_base]} castShadow receiveShadow>
                <boxGeometry args={[2, 2, 12]} />
                <meshStandardMaterial color="#1a3a4a" roughness={0.6} />
              </mesh>
              <mesh position={[20, 1, z_base + 18]} castShadow receiveShadow>
                <boxGeometry args={[2, 2, 12]} />
                <meshStandardMaterial color="#1a3a4a" roughness={0.6} />
              </mesh>
            </group>
          ))}
        </>
      )}

      {/* Fang Syndicate Combatant - Encounter */}
      {state.encounterActive && (
        <mesh
          position={[0, state.fangCombatant.position.y, state.fangCombatant.position.z]}
          castShadow
        >
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial
            color={state.fangCombatant.isDead ? '#333333' : '#ff3333'}
            emissive={state.fangCombatant.isDead ? '#000000' : '#990000'}
            emissiveIntensity={state.fangCombatant.isDead ? 0 : 0.4}
          />
        </mesh>
      )}

      {/* Memory Trace interaction point */}
      {state.stage === 'memory-trace' && (
        <mesh position={[0, 0.5, 5]} castShadow>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial
            color={state.memoryTraceActivated ? '#00ff00' : '#00ffff'}
            emissive={state.memoryTraceActivated ? '#00ff00' : '#00ffff'}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Extraction marker */}
      <mesh position={[0, 0.5, 15]} castShadow>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color={state.extractionUnlocked ? '#00ff00' : '#555555'}
          emissive={state.extractionUnlocked ? '#00ff00' : '#000000'}
          emissiveIntensity={state.extractionUnlocked ? 0.6 : 0}
        />
      </mesh>

      {/* Player character proxy */}
      <mesh position={state.playerPosition} castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={fighter.color}
          emissive={fighter.accentColor}
          emissiveIntensity={0.3}
        />
      </mesh>
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
