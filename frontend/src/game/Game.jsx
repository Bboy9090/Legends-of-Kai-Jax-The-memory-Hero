import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';

import { useGameStore } from './stores/gameStore';
import PlayerWithModel from './entities/PlayerWithModel';
import { EnemyWithModel } from './entities/EnemyWithModel';
import IronveinWards from './world/IronveinWards';
import { ThirdPersonCamera } from './systems/CameraSystem';
import GameHUD from './ui/GameHUD';

// Lighting setup for Ironvein Wards (industrial, moody)
const Lighting = () => {
  return (
    <>
      <ambientLight intensity={0.3} color="#aabbcc" />
      <directionalLight
        position={[50, 80, 30]}
        intensity={0.8}
        color="#aaccff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <pointLight position={[-20, 8, -15]} intensity={1} color="#FF6B00" distance={25} />
      <pointLight position={[15, 5, 10]} intensity={0.8} color="#FFD60A" distance={20} />
      <pointLight position={[25, 12, -10]} intensity={0.6} color="#64D2FF" distance={15} />
      <pointLight position={[-10, 3, 5]} intensity={0.5} color="#FF0000" distance={10} />
      <pointLight position={[8, 1, -8]} intensity={0.5} color="#FF3B30" distance={8} />
      <spotLight position={[0, 20, 0]} angle={0.3} penumbra={0.5} intensity={1} color="#ffffff" castShadow />
    </>
  );
};

// Atmospheric effects
const Atmosphere = () => {
  return (
    <>
      <fog attach="fog" args={['#0a0a1a', 15, 100]} />
      <color attach="background" args={['#05050f']} />
    </>
  );
};

// Enemy spawns for the level
const EnemySpawns = () => {
  const enemies = [
    { id: 'fang-1', type: 'fangGrunt', position: [8, 1, -5], patrol: [[8, 1, -5], [15, 1, -5], [15, 1, 5], [8, 1, 5]] },
    { id: 'fang-2', type: 'fangGrunt', position: [10, 1, -3], patrol: [[10, 1, -3], [17, 1, -3]] },
    { id: 'fang-enforcer', type: 'fangEnforcer', position: [20, 4, 0], patrol: [[15, 4, -5], [20, 4, 0], [15, 4, 5]] },
    { id: 'covenant-1', type: 'covenantCultist', position: [-12, 1, 8], patrol: [[-12, 1, 8], [-8, 1, 12], [-15, 1, 12]] },
    { id: 'covenant-2', type: 'covenantCultist', position: [-10, 1, 15], patrol: [[-10, 1, 15], [-18, 1, 15]] },
    { id: 'fang-3', type: 'fangGrunt', position: [15, 4, 2], patrol: [[12, 4, -2], [18, 4, 2]] },
    { id: 'covenant-champion', type: 'covenantChampion', position: [-18, 6, 15], patrol: [] },
  ];

  return (
    <>
      {enemies.map((enemy) => (
        <EnemyWithModel
          key={enemy.id}
          id={enemy.id}
          type={enemy.type}
          initialPosition={enemy.position}
          patrolPoints={enemy.patrol}
        />
      ))}
    </>
  );
};

// Memory Fragments (collectibles)
const MemoryFragment = ({ position, id }) => {
  const { memoryFragments, collectFragment } = useGameStore();
  const isCollected = memoryFragments.fragments.includes(id);
  if (isCollected) return null;
  return (
    <mesh position={position} onClick={() => collectFragment(id)}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#FFD60A" emissive="#FFD60A" emissiveIntensity={1.5} transparent opacity={0.9} />
      <pointLight color="#FFD60A" intensity={2} distance={5} />
    </mesh>
  );
};

const MemoryFragmentSpawns = () => {
  const fragments = [
    { id: 'fragment-1', position: [5, 2, 5] },
    { id: 'fragment-2', position: [-8, 2, -8] },
    { id: 'fragment-3', position: [18, 5, 3] },
    { id: 'fragment-4', position: [-15, 7, 12] },
    { id: 'fragment-5', position: [0, 6, -15] },
    { id: 'fragment-6', position: [22, 10, 8] },
    { id: 'fragment-7', position: [-20, 3, -5] },
    { id: 'fragment-8', position: [12, 2, 15] },
    { id: 'fragment-9', position: [-5, 8, 0] },
    { id: 'fragment-10', position: [0, 15, 0] },
  ];
  return (
    <>
      {fragments.map((frag) => (
        <MemoryFragment key={frag.id} id={frag.id} position={frag.position} />
      ))}
    </>
  );
};

// Loading screen primitive (visible inside Canvas)
const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#FFD60A" wireframe />
  </mesh>
);

// Main Game Scene
const GameScene = () => {
  const { gameState } = useGameStore();
  return (
    <>
      <Lighting />
      <Atmosphere />
      <Physics gravity={[0, -20, 0]} debug={false}>
        <IronveinWards />
        {gameState === 'playing' && (
          <Suspense fallback={<LoadingFallback />}>
            <PlayerWithModel />
          </Suspense>
        )}
        {gameState === 'playing' && (
          <Suspense fallback={null}>
            <EnemySpawns />
          </Suspense>
        )}
        <MemoryFragmentSpawns />
      </Physics>
      <ThirdPersonCamera offset={[0, 5, 10]} smoothness={0.08} />
    </>
  );
};

// Main Game Component
const Game = () => {
  const { setGameState, resetGame } = useGameStore();

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        const state = useGameStore.getState().gameState;
        if (state === 'playing') {
          setGameState('paused');
        } else if (state === 'paused') {
          setGameState('playing');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGameState]);

  return (
    <div className="w-full h-screen bg-black relative" data-testid="game-container">
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60, near: 0.1, far: 500 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <GameScene />
        </Suspense>
      </Canvas>
      <GameHUD />
    </div>
  );
};

export default Game;
