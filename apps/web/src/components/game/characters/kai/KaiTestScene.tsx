/**
 * KAI TEST SCENE
 * Deterministic developer-only runtime proof for Kai locomotion, traversal,
 * combat-state lifecycle and measured performance.
 *
 * This scene intentionally uses a simple developer proxy instead of claiming a
 * production/canon Kai model. Gameplay systems under test are the real runtime
 * controller, unified input manager, wall-climb controller and Web Zip system.
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useKaiController } from './KaiController';

type KaiControllerHandle = ReturnType<typeof useKaiController>;

interface KaiDebugSnapshot {
  mode: string;
  position: [number, number, number];
  energy: number;
  attacking: boolean;
  attackTimer: number;
  wallCrawling: boolean;
  webZipping: boolean;
  dodging: boolean;
  invulnTimer: number;
  fps: number;
}

const INITIAL_DEBUG: KaiDebugSnapshot = {
  mode: 'LOADING',
  position: [0, 0, 0],
  energy: 100,
  attacking: false,
  attackTimer: 0,
  wallCrawling: false,
  webZipping: false,
  dodging: false,
  invulnTimer: 0,
  fps: 0,
};

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const renderable = child as THREE.Mesh;
    if (!renderable.geometry) return;
    renderable.geometry.dispose();
    const material = (renderable as THREE.Mesh).material;
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    materials.forEach((entry) => entry?.dispose());
  });
}

function KaiRuntimeEnvironment({
  onDebug,
}: {
  onDebug: (snapshot: KaiDebugSnapshot) => void;
}) {
  const { scene, camera } = useThree();
  const kaiRef = useRef<THREE.Group>(null!);
  const controller = useKaiController(kaiRef, scene);
  const controllerRef = useRef<KaiControllerHandle>(controller);
  const perfRef = useRef({ sampleTime: 0, frames: 0, fps: 0, hudTime: 0 });
  controllerRef.current = controller;

  useEffect(() => {
    const created: THREE.Object3D[] = [];
    const add = <T extends THREE.Object3D>(object: T): T => {
      scene.add(object);
      created.push(object);
      return object;
    };

    const background = new THREE.Color(0x15111f);
    scene.background = background;

    add(new THREE.AmbientLight(0xffffff, 0.65));
    const keyLight = add(new THREE.DirectionalLight(0xffffff, 0.95));
    keyLight.position.set(5, 9, -6);

    const ground = add(new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x292532 })
    ));
    ground.name = 'kai-runtime-ground';
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    // Camera looks toward +Z, so W now proves the shared camera-forward contract.
    const wall = add(new THREE.Mesh(
      new THREE.BoxGeometry(4, 6, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x514763 })
    ));
    wall.name = 'kai-runtime-wall';
    wall.position.set(0, 3, 1.15);
    wall.userData.climbable = true;
    wall.castShadow = true;
    wall.receiveShadow = true;

    const anchorGroup = add(new THREE.Group());
    anchorGroup.name = 'kai-runtime-web-anchors';
    const anchorPositions = [
      new THREE.Vector3(0, 4.5, 6),
      new THREE.Vector3(5, 3.5, 4),
    ];
    for (const position of anchorPositions) {
      const anchor = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          emissive: 0x5b21b6,
          emissiveIntensity: 0.45,
        })
      );
      anchor.position.copy(position);
      anchor.userData.webAnchor = true;
      anchorGroup.add(anchor);
    }

    camera.position.set(0, 3.5, -8);
    camera.lookAt(0, 1.2, 0);
    camera.updateMatrixWorld(true);

    controllerRef.current.refreshAnchors();

    return () => {
      for (const object of created) {
        scene.remove(object);
        disposeObject(object);
      }
      if (scene.background === background) scene.background = null;
    };
  }, [scene, camera]);

  useFrame((_, delta) => {
    const perf = perfRef.current;
    perf.sampleTime += delta;
    perf.hudTime += delta;
    perf.frames += 1;

    if (perf.sampleTime >= 0.5) {
      perf.fps = perf.frames / perf.sampleTime;
      perf.sampleTime = 0;
      perf.frames = 0;
    }

    if (perf.hudTime < 0.1 || !kaiRef.current) return;
    perf.hudTime = 0;

    const state = controllerRef.current.getState();
    onDebug({
      mode: state.locomotionMode,
      position: [state.position.x, state.position.y, state.position.z],
      energy: state.energy,
      attacking: state.isAttacking,
      attackTimer: state.attackTimer,
      wallCrawling: state.isWallCrawling,
      webZipping: state.isWebZipping,
      dodging: state.isDodging,
      invulnTimer: state.invulnTimer,
      fps: perf.fps,
    });
  });

  return (
    <group ref={kaiRef} position={[0, 0, 0]}>
      <mesh castShadow position={[0, 0.85, 0]}>
        <capsuleGeometry args={[0.28, 1.15, 6, 8]} />
        <meshStandardMaterial color={0x6d3fa0} />
      </mesh>
      {[0, 1, 2, 3].map((index) => {
        const side = index < 2 ? -1 : 1;
        const vertical = index % 2 === 0 ? 0.45 : 1.15;
        return (
          <mesh
            key={`kai-dev-limb-${index}`}
            castShadow
            position={[side * 0.48, vertical, 0]}
            rotation={[0, 0, side * 0.7]}
          >
            <cylinderGeometry args={[0.055, 0.055, 0.8, 8]} />
            <meshStandardMaterial color={0x8b5cf6} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function KaiTestScene() {
  const [debug, setDebug] = useState<KaiDebugSnapshot>(INITIAL_DEBUG);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas shadows>
        <KaiRuntimeEnvironment onDebug={setDebug} />
      </Canvas>

      <div
        data-testid="kai-debug-hud"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: '#d8b4fe',
          fontFamily: 'monospace',
          fontSize: '12px',
          backgroundColor: 'rgba(0,0,0,0.78)',
          padding: '10px',
          zIndex: 100,
          maxWidth: '360px',
          pointerEvents: 'none',
        }}
      >
        <div>KAI LIVE RUNTIME HARNESS</div>
        <div style={{ opacity: 0.75 }}>DEV PROXY — NO VISUAL CANON CLAIM</div>
        <div style={{ marginTop: 8, borderBottom: '1px solid #a855f7', paddingBottom: 6 }}>
          <div data-testid="kai-mode">Mode: {debug.mode}</div>
          <div data-testid="kai-position">
            Pos: ({debug.position.map((value) => value.toFixed(2)).join(', ')})
          </div>
          <div data-testid="kai-energy">Energy: {debug.energy.toFixed(1)}/100</div>
          <div data-testid="kai-attacking">Attacking: {debug.attacking ? 'YES' : 'NO'}</div>
          <div data-testid="kai-attack-timer">Attack timer: {debug.attackTimer.toFixed(2)}</div>
          <div data-testid="kai-wall">Wall: {debug.wallCrawling ? 'YES' : 'NO'}</div>
          <div data-testid="kai-webzip">Web Zip: {debug.webZipping ? 'YES' : 'NO'}</div>
          <div data-testid="kai-dodging">Dodging: {debug.dodging ? 'YES' : 'NO'}</div>
          <div data-testid="kai-invuln">Invuln: {debug.invulnTimer.toFixed(2)}</div>
          <div data-testid="kai-fps">FPS: {debug.fps.toFixed(1)}</div>
        </div>
        <div style={{ marginTop: 6, fontSize: '11px' }}>
          <div>WASD: Move</div>
          <div>Shift+W at wall: Climb</div>
          <div>E hold: Web Zip</div>
          <div>J/X: Light Attack</div>
          <div>K/Z: Heavy Attack</div>
          <div>L/C: Special Attack</div>
          <div>I/V: Ultimate Attack</div>
          <div>Q: Dodge</div>
        </div>
      </div>
    </div>
  );
}
