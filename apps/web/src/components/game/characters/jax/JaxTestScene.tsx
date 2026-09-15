/**
 * JAX TEST SCENE
 * Focused runtime proof for Jax traversal, combat, target reactions and HUD.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { JaxCharacter } from './JaxCharacter';
import type { useJaxController } from './JaxController';

type JaxControllerHandle = ReturnType<typeof useJaxController>;

interface JaxDebugSnapshot {
  mode: string;
  energy: number;
  airborne: boolean;
  position: [number, number, number];
  groundCharges: number;
  airCharges: number;
  cooldown: number;
  attackType: string;
  attackPhase: string;
  fps: number;
  pressureHealth: number;
  pressureX: number;
  pressureZ: number;
  lightningHealth: number;
}

const INITIAL_DEBUG: JaxDebugSnapshot = {
  mode: 'LOADING',
  energy: 0,
  airborne: false,
  position: [0, 0, 0],
  groundCharges: 0,
  airCharges: 0,
  cooldown: 0,
  attackType: 'none',
  attackPhase: 'IDLE',
  fps: 0,
  pressureHealth: 100,
  pressureX: 1.2,
  pressureZ: 0.5,
  lightningHealth: 100,
};

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => material?.dispose());
  });
}

function TestEnvironment({
  onDebug,
}: {
  onDebug: (snapshot: JaxDebugSnapshot) => void;
}) {
  const { scene, camera } = useThree();
  const controllerRef = useRef<JaxControllerHandle | null>(null);
  const perfRef = useRef({ sampleTime: 0, frames: 0, fps: 0, hudTime: 0 });

  const handleController = useCallback((controller: JaxControllerHandle) => {
    controllerRef.current = controller;
  }, []);

  useEffect(() => {
    const created: THREE.Object3D[] = [];
    const add = <T extends THREE.Object3D>(object: T): T => {
      scene.add(object);
      created.push(object);
      return object;
    };

    const background = new THREE.Color(0x1a1a2e);
    scene.background = background;
    scene.fog = new THREE.Fog(0x1a1a2e, 100, 500);

    add(new THREE.AmbientLight(0xffffff, 0.6));

    const directionalLight = add(new THREE.DirectionalLight(0xffffff, 0.8));
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);

    const ground = add(new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    ));
    ground.name = 'jax-test-ground';
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.userData.isGround = true;
    ground.userData.isWalkable = true;

    const platform = add(new THREE.Mesh(
      new THREE.BoxGeometry(15, 1, 15),
      new THREE.MeshStandardMaterial({ color: 0x445588 })
    ));
    platform.name = 'jax-test-platform';
    platform.position.set(0, 8, -20);
    platform.castShadow = true;
    platform.receiveShadow = true;
    platform.userData.isCollider = true;
    platform.userData.isWalkable = true;

    const wall = add(new THREE.Mesh(
      new THREE.BoxGeometry(20, 8, 1),
      new THREE.MeshStandardMaterial({ color: 0x666666 })
    ));
    wall.name = 'jax-test-wall';
    wall.position.set(0, 4, 10);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.isWall = true;
    wall.userData.isCollider = true;
    wall.userData.isWalkable = false;

    for (let i = 5; i <= 20; i += 5) {
      const marker = add(new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.3, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xffff00 })
      ));
      marker.position.set(i, 0.2, 0);
      marker.userData.isWalkable = false;
    }

    const pressureDummy = add(new THREE.Mesh(
      new THREE.CapsuleGeometry(0.3, 1.5, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff4444,
        emissive: 0xff0000,
        emissiveIntensity: 0.2,
      })
    ));
    pressureDummy.name = 'jax-pressure-dummy';
    pressureDummy.position.set(1.2, 0.75, 0.5);
    pressureDummy.castShadow = true;
    pressureDummy.receiveShadow = true;
    pressureDummy.userData.combatTarget = true;
    pressureDummy.userData.targetId = 'dummy_pressure';
    pressureDummy.userData.isPressureTarget = true;
    pressureDummy.userData.health = 100;
    pressureDummy.userData.velocity = new THREE.Vector3();

    const lightningTarget = add(new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.3,
      })
    ));
    lightningTarget.name = 'jax-lightning-target';
    lightningTarget.position.set(0, 0.75, 3);
    lightningTarget.castShadow = true;
    lightningTarget.userData.combatTarget = true;
    lightningTarget.userData.targetId = 'target_lightning';
    lightningTarget.userData.isLightningTarget = true;
    lightningTarget.userData.health = 100;
    lightningTarget.userData.velocity = new THREE.Vector3();

    camera.position.set(0, 5, 15);
    camera.lookAt(0, 2, 0);

    return () => {
      for (const object of created) {
        scene.remove(object);
        disposeObject(object);
      }
      if (scene.background === background) scene.background = null;
      scene.fog = null;
    };
  }, [scene, camera]);

  useFrame((_, delta) => {
    scene.traverse((obj) => {
      if (!obj.userData.combatTarget) return;
      const velocity = obj.userData.velocity;
      if (!(velocity instanceof THREE.Vector3)) return;

      obj.position.addScaledVector(velocity, delta);
      velocity.multiplyScalar(Math.pow(0.86, delta * 60));
      if (velocity.lengthSq() < 0.0001) velocity.set(0, 0, 0);
    });

    const perf = perfRef.current;
    perf.sampleTime += delta;
    perf.hudTime += delta;
    perf.frames += 1;

    if (perf.sampleTime >= 0.5) {
      perf.fps = perf.frames / perf.sampleTime;
      perf.sampleTime = 0;
      perf.frames = 0;
    }

    if (perf.hudTime < 0.1 || !controllerRef.current) return;
    perf.hudTime = 0;

    const state = controllerRef.current.getState();
    const pressureDummy = scene.getObjectByName('jax-pressure-dummy');
    const lightningTarget = scene.getObjectByName('jax-lightning-target');

    onDebug({
      mode: state.locomotionMode,
      energy: state.energy,
      airborne: state.isAirborne,
      position: [state.position.x, state.position.y, state.position.z],
      groundCharges: state.groundDisplacementCharges,
      airCharges: state.airDisplacementCharges,
      cooldown: state.displacementCooldown,
      attackType: state.currentAttackType ?? 'none',
      attackPhase: state.attackPhase,
      fps: perf.fps,
      pressureHealth: pressureDummy?.userData.health ?? 100,
      pressureX: pressureDummy?.position.x ?? 0,
      pressureZ: pressureDummy?.position.z ?? 0,
      lightningHealth: lightningTarget?.userData.health ?? 100,
    });
  });

  return <JaxCharacter scene={scene} onController={handleController} />;
}

export function JaxTestScene() {
  const [debug, setDebug] = useState<JaxDebugSnapshot>(INITIAL_DEBUG);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        gl={{ antialias: true }}
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <TestEnvironment onDebug={setDebug} />
      </Canvas>

      <div
        data-testid="jax-debug-hud"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: '#00ff00',
          fontFamily: 'monospace',
          fontSize: '12px',
          backgroundColor: 'rgba(0,0,0,0.76)',
          padding: '10px',
          zIndex: 100,
          maxWidth: '340px',
          pointerEvents: 'none',
        }}
      >
        <div>JAX TEST SCENE</div>
        <div style={{ marginTop: 8, borderBottom: '1px solid #00ff00', paddingBottom: 6 }}>
          <div data-testid="jax-mode">Mode: {debug.mode}</div>
          <div data-testid="jax-energy">Energy: {Math.round(debug.energy)}/100</div>
          <div data-testid="jax-airborne">Airborne: {debug.airborne ? 'YES' : 'NO'}</div>
          <div data-testid="jax-position">
            Pos: ({debug.position.map((v) => v.toFixed(2)).join(', ')})
          </div>
          <div data-testid="jax-ground-charge">Ground charge: {debug.groundCharges}</div>
          <div data-testid="jax-air-charge">Air charge: {debug.airCharges}</div>
          <div data-testid="jax-cooldown">Cooldown: {debug.cooldown.toFixed(2)}</div>
          <div data-testid="jax-attack">Attack: {debug.attackType} / {debug.attackPhase}</div>
          <div data-testid="jax-fps">FPS: {debug.fps.toFixed(1)}</div>
          <div data-testid="jax-pressure-health">Pressure dummy HP: {Math.round(debug.pressureHealth)}</div>
          <div data-testid="jax-pressure-position">
            Pressure dummy Pos: ({debug.pressureX.toFixed(2)}, {debug.pressureZ.toFixed(2)})
          </div>
          <div data-testid="jax-lightning-health">
            Lightning target HP: {Math.round(debug.lightningHealth)}
          </div>
        </div>

        <div style={{ marginTop: 6, fontSize: '11px' }}>
          <div>WASD: Move</div>
          <div>Shift: Run</div>
          <div>Space: Jump</div>
          <div>E: Displacement</div>
          <div>Q: Dodge</div>
          <div>J/X: Light Attack</div>
          <div>K/Z: Heavy Attack</div>
          <div>L/C: Lightning Special</div>
          <div>I/V: Ultimate</div>
        </div>
      </div>
    </div>
  );
}
