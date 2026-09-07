/**
 * KAI TEST SCENE
 * Isolated MVP testing environment for Phase C Day 1-2
 *
 * Tests:
 * - Kai model loads and renders
 * - Movement works (walk, run)
 * - Animations play correctly
 * - Camera follows player
 * - Performance (target: 60 FPS)
 *
 * Usage: http://localhost:3000/?mode=kai-test
 */

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Stats } from '@react-three/drei';
import { KaiCharacter } from './KaiCharacter';
import { useKaiController } from './KaiController';
import { createTestClimbableWall } from './WallClimbSystem';
import { createTestWebAnchors } from './WebZipSystem';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function KaiTestContent() {
  const kaiRef = useRef<THREE.Group>(null!);
  const [fps, setFps] = useState(60);
  const [isMoving, setIsMoving] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isWallCrawling, setIsWallCrawling] = useState(false);
  const [isWebZipping, setIsWebZipping] = useState(false);

  // Get scene from Three.js context
  const { scene } = useThree();

  // Add test assets to scene
  useEffect(() => {
    createTestClimbableWall(scene);
    createTestWebAnchors(scene);
  }, [scene]);

  // Use Kai controller for input/movement
  const controller = useKaiController(kaiRef, scene);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsMoving(controller.state.isMoving);
      setIsAttacking(controller.state.isAttacking);
      setIsWallCrawling(controller.state.isWallCrawling);
      setIsWebZipping(controller.state.isWebZipping);
    }, 16);
    return () => clearInterval(interval);
  }, [controller]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 4]} fov={60} />
      <OrbitControls makeDefault />

      {/* Scene lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={2048} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a3a2f" />
      </mesh>

      {/* Grid reference */}
      <Grid args={[100, 100]} cellSize={1} cellColor="#444" sectionSize={10} sectionColor="#666" />

      {/* Kai character */}
      <KaiCharacter
        ref={kaiRef}
        position={[0, 0, 0]}
        scale={1}
        isMoving={isMoving}
        isAttacking={isAttacking}
        isWallCrawling={isWallCrawling}
        isWebZipping={isWebZipping}
        bodyRef={kaiRef}
      />

      {/* Performance stats */}
      <Stats />

      {/* Debug HUD */}
      <group position={[-20, 8, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[8, 3]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
        </mesh>
      </group>
    </>
  );
}

export default function KaiTestScene() {
  const [fpsFmt, setFpsFmt] = useState('60');

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas shadows>
        <KaiTestContent />
      </Canvas>

      {/* UI Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '12px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px',
          borderRadius: '4px',
          zIndex: 100,
        }}
      >
        <div>Kai Test Scene - Phase C Day 1-3 Integration</div>
        <div>WASD/Arrows: Move</div>
        <div>Shift: Run</div>
        <div>W (near wall): Climb / Release: Drop</div>
        <div>E (near anchor): Web Zip / Release: Cancel</div>
        <div>J/X: Light Attack</div>
        <div>K/Z: Heavy Attack</div>
        <div>L/C: Special Attack</div>
        <div>I/V: Ultimate Attack</div>
        <div>Space: Dodge</div>
        <div style={{ marginTop: '8px', color: '#9f9' }}>
          State: {isWallCrawling ? '🧗 WALL' : isWebZipping ? '🕷 ZIP' : 'GROUND'}
        </div>
      </div>

      {/* Performance indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '12px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '8px',
          borderRadius: '4px',
        }}
      >
        FPS Monitor: <span id="fpsCounter">--</span>
      </div>
    </div>
  );
}
