/**
 * JAX TEST SCENE
 * Gameplay environment for testing Jax traversal and combat
 *
 * Contains:
 * - Ground platform
 * - Elevated platform for air testing
 * - Collision wall
 * - Pressure-reactive dummy
 * - Lightning-reactive target
 * - Distance markers
 * - Debug HUD
 */

import { useRef, useEffect, useState, createContext, useContext } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { JaxCharacter } from './JaxCharacter';

const JaxStateContext = createContext<{ jaxState: any; setJaxState: (state: any) => void }>({
  jaxState: null,
  setJaxState: () => {},
});

function DebugHUD() {
  return (
    <group>
      {/* Mode indicator text mesh (could be enhanced with canvas texture for text) */}
      <mesh position={[-20, 10, 0]}>
        <planeGeometry args={[8, 2]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>
    </group>
  );
}

function TestEnvironment() {
  const { scene, camera } = useThree();
  const jaxRef = useRef<THREE.Group>(null);
  const jaxControllerRef = useRef<any>(null);
  const { setJaxState } = useContext(JaxStateContext);

  useEffect(() => {
    // Setup scene
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 100, 500);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Ground
    const groundGeom = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.userData.isGround = true;
    ground.userData.isWalkable = true;
    scene.add(ground);

    // Elevated platform (for air testing)
    const platformGeom = new THREE.BoxGeometry(15, 1, 15);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x445588 });
    const platform = new THREE.Mesh(platformGeom, platformMat);
    platform.position.set(0, 8, -20);
    platform.castShadow = true;
    platform.receiveShadow = true;
    platform.userData.isCollider = true;
    platform.userData.isWalkable = true;
    scene.add(platform);

    // Collision wall
    const wallGeom = new THREE.BoxGeometry(20, 8, 1);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const wall = new THREE.Mesh(wallGeom, wallMat);
    wall.position.set(0, 4, 15);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.isWall = true;
    scene.add(wall);

    // Distance markers
    for (let i = 5; i <= 20; i += 5) {
      const markerGeom = new THREE.BoxGeometry(0.5, 0.3, 0.5);
      const markerMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
      const marker = new THREE.Mesh(markerGeom, markerMat);
      marker.position.set(i, 0.2, 0);
      scene.add(marker);
    }

    // Pressure-reactive dummy (combat-enabled)
    const dummyGeom = new THREE.CapsuleGeometry(0.3, 1.5, 8, 8);
    const dummyMat = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      emissive: 0xff0000,
      emissiveIntensity: 0.2,
    });
    const dummy = new THREE.Mesh(dummyGeom, dummyMat);
    dummy.position.set(10, 0.75, 0);
    dummy.castShadow = true;
    dummy.receiveShadow = true;
    dummy.userData.combatTarget = true;
    dummy.userData.targetId = 'dummy_pressure';
    dummy.userData.isPressureTarget = true;
    dummy.userData.health = 100;
    dummy.userData.velocity = new THREE.Vector3();
    scene.add(dummy);

    // Lightning target (combat-enabled)
    const targetGeom = new THREE.SphereGeometry(0.5, 8, 8);
    const targetMat = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.3,
    });
    const target = new THREE.Mesh(targetGeom, targetMat);
    target.position.set(-15, 3, -10);
    target.castShadow = true;
    target.userData.combatTarget = true;
    target.userData.targetId = 'target_lightning';
    target.userData.isLightningTarget = true;
    target.userData.health = 100;
    target.userData.velocity = new THREE.Vector3();
    scene.add(target);

    // Camera setup
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 2, 0);

    return () => {
      scene.clear();
    };
  }, [scene, camera]);

  useFrame(() => {
    if (jaxControllerRef.current) {
      setJaxState(jaxControllerRef.current.getState());
    }
  });

  return (
    <>
      <JaxCharacter
        scene={scene}
        onController={(controller) => {
          jaxControllerRef.current = controller;
        }}
      />
      <DebugHUD />
    </>
  );
}

export function JaxTestScene() {
  const [jaxState, setJaxState] = useState<any>(null);

  return (
    <JaxStateContext.Provider value={{ jaxState, setJaxState }}>
      <div style={{ width: '100%', height: '100vh' }}>
        <Canvas
          gl={{
            antialias: true,
            shadowMap: { enabled: true, type: THREE.PCFShadowMap },
          }}
          shadows
        >
          <TestEnvironment />
        </Canvas>

      {/* Debug UI overlay */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: '#00ff00',
          fontFamily: 'monospace',
          fontSize: '12px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px',
          zIndex: 100,
          maxWidth: '300px',
        }}
      >
        <div>JAX TEST SCENE</div>
        <div style={{ marginTop: '10px', fontSize: '11px', borderBottom: '1px solid #00ff00', paddingBottom: '5px' }}>
          <div>Mode: {jaxState?.locomotionMode || 'LOADING'}</div>
          <div>Energy: {jaxState?.energy ? Math.round(jaxState.energy) : 0}/100</div>
          <div>Airborne: {jaxState?.isAirborne ? 'YES' : 'NO'}</div>
          <div>Pos: ({jaxState?.position?.x?.toFixed(1) || 0}, {jaxState?.position?.y?.toFixed(1) || 0}, {jaxState?.position?.z?.toFixed(1) || 0})</div>
          <div>Attack: {jaxState?.isAttacking ? 'ACTIVE' : 'IDLE'}</div>
        </div>
        <div style={{ marginTop: '5px', fontSize: '11px' }}>
          <div>WASD: Move</div>
          <div>Shift: Run</div>
          <div>Space: Jump</div>
          <div>E: Displacement</div>
          <div>Q: Dodge</div>
          <div>J/X: Light Attack</div>
          <div>K/Z: Heavy Attack</div>
          <div>L: Special</div>
          <div>I: Ultimate</div>
        </div>
      </div>
      </div>
    </JaxStateContext.Provider>
  );
}
