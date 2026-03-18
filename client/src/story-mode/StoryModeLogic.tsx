import type { MutableRefObject } from "react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { create } from "zustand";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";

/**
 * Story Mode Logic — lightweight browser-first scene manager.
 *
 * Sectors:
 * 1) The Awakening (Tutorial)
 * 2) The Fractured Crossing (open zone)
 * 3) The Corruption (Void Boss Arena)
 */
export type ObjectiveStatus = "PENDING" | "COMPLETE";

export interface HeroConfig {
  id: string;
  name: string;
  glbUrl?: string;
  scale?: number;
  color?: string;
}

const DEFAULT_HERO: HeroConfig = {
  id: "radiant-jumper",
  name: "Radiant Jumper",
  color: "#fbbf24",
};

interface StoryState {
  currentLevel: number;
  objectiveStatus: ObjectiveStatus;
  dialogue: string;
  actName: string;
  completeObjective: () => void;
  nextLevel: () => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  currentLevel: 1,
  objectiveStatus: "PENDING",
  dialogue: "System Initialized. Welcome to the Void.",
  actName: "ACT I: THE AWAKENING",
  completeObjective: () =>
    set({
      objectiveStatus: "COMPLETE",
      dialogue: "Signal Detected. Rift Portal Stabilized.",
    }),
  nextLevel: () =>
    set((state) => {
      const next = Math.min(state.currentLevel + 1, 3);
      let name = "ACT I";
      let text = "";

      if (next === 2) {
        name = "ACT II: THE FRACTURED CROSSING";
        text = "Entering emerald ridge and sky-ruin sector...";
      }

      if (next === 3) {
        name = "ACT III: THE CORRUPTION";
        text = "WARNING: Void Energy Spiking.";
      }

      return {
        currentLevel: next,
        objectiveStatus: "PENDING" as ObjectiveStatus,
        dialogue: text,
        actName: name,
      };
    }),
}));

interface PlayerControllerProps {
  playerRef: MutableRefObject<THREE.Group | null>;
  heroConfig?: HeroConfig;
}

const PlayerController = ({ playerRef, heroConfig = DEFAULT_HERO }: PlayerControllerProps) => {
  const { camera } = useThree();
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const isGrounded = useRef(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          setMovement((m) => ({ ...m, forward: true }));
          break;
        case "s":
        case "arrowdown":
          setMovement((m) => ({ ...m, backward: true }));
          break;
        case "a":
        case "arrowleft":
          setMovement((m) => ({ ...m, left: true }));
          break;
        case "d":
        case "arrowright":
          setMovement((m) => ({ ...m, right: true }));
          break;
        case " ":
          setMovement((m) => ({ ...m, jump: true }));
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          setMovement((m) => ({ ...m, forward: false }));
          break;
        case "s":
        case "arrowdown":
          setMovement((m) => ({ ...m, backward: false }));
          break;
        case "a":
        case "arrowleft":
          setMovement((m) => ({ ...m, left: false }));
          break;
        case "d":
        case "arrowright":
          setMovement((m) => ({ ...m, right: false }));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const speed = 12 * delta;
    const gravity = -25 * delta;

    const frontVector = new THREE.Vector3(
      0,
      0,
      Number(movement.backward) - Number(movement.forward)
    );
    const sideVector = new THREE.Vector3(
      Number(movement.left) - Number(movement.right),
      0,
      0
    );
    const direction = new THREE.Vector3();
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(new THREE.Euler(0, camera.rotation.y, 0));

    playerRef.current.position.add(direction);

    const horizontal = new THREE.Vector3(direction.x, 0, direction.z);
    if (horizontal.lengthSq() > 0.0001) {
      playerRef.current.rotation.y = Math.atan2(horizontal.x, horizontal.z);
    }

    if (movement.jump && isGrounded.current) {
      velocity.current.y = 0.35;
      isGrounded.current = false;
      setMovement((m) => ({ ...m, jump: false }));
    }

    velocity.current.y += gravity * delta;
    playerRef.current.position.y += velocity.current.y;

    if (playerRef.current.position.y <= 1) {
      playerRef.current.position.y = 1;
      velocity.current.y = 0;
      isGrounded.current = true;
    }

    const bodyPos = playerRef.current.position;
    const cameraOffset = new THREE.Vector3(0, 6, 12);
    const smoothSpeed = 0.1;
    const targetPos = new THREE.Vector3(
      bodyPos.x + cameraOffset.x,
      bodyPos.y + cameraOffset.y,
      bodyPos.z + cameraOffset.z
    );
    state.camera.position.lerp(targetPos, smoothSpeed);
    state.camera.lookAt(bodyPos);
  });

  return (
    <group ref={playerRef} position={[0, 2, 0]}>
      <HeroAvatar config={heroConfig} />
    </group>
  );
};

interface LevelManagerProps {
  playerRef: MutableRefObject<THREE.Group | null>;
}

const LevelManager = ({ playerRef }: LevelManagerProps) => {
  const { currentLevel, completeObjective } = useStoryStore();

  useFrame(() => {
    if (!playerRef.current) return;

    const target = new THREE.Vector3(0, 0, 0);
    if (currentLevel === 1) target.set(0, 1, -15);
    if (currentLevel === 2) target.set(20, 1, -20);
    if (currentLevel === 3) target.set(0, 1, 0);

    if (playerRef.current.position.distanceTo(target) < 3) {
      completeObjective();
    }
  });

  return (
    <>
      {currentLevel === 1 && (
        <group>
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[30, 60]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <gridHelper args={[30, 30, 0x4f46e5, 0x4f46e5]} position={[0, 0.01, 0]} />

          <mesh position={[0, 1, -5]}>
            <boxGeometry args={[10, 1, 1]} />
            <meshStandardMaterial color="#374151" />
          </mesh>

          <mesh position={[0, 2, -15]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="cyan" wireframe />
          </mesh>
          <pointLight position={[0, 2, -15]} color="cyan" intensity={2} distance={10} />
        </group>
      )}

      {currentLevel === 2 && (
        <group>
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#15803d" />
          </mesh>

          <mesh position={[-10, 5, -10]} rotation={[0, Math.PI / 4, 0]}>
            <torusGeometry args={[5, 1, 16, 100]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>

          <mesh position={[15, 2, -15]}>
            <boxGeometry args={[4, 4, 4]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
          <mesh position={[20, 1, -20]}>
            <coneGeometry args={[1, 2, 4]} />
            <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.5} />
          </mesh>

          {[...Array(10)].map((_, index) => (
            <mesh key={index} position={[Math.sin(index) * 20, 2, Math.cos(index) * 20]}>
              <coneGeometry args={[1, 4, 8]} />
              <meshStandardMaterial color="#166534" />
            </mesh>
          ))}

          <directionalLight position={[-10, 20, 5]} intensity={1.5} castShadow />
          <ambientLight intensity={0.5} />
        </group>
      )}

      {currentLevel === 3 && (
        <group>
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[20, 32]} />
            <meshStandardMaterial color="#2e1065" />
          </mesh>

          {[...Array(5)].map((_, index) => (
            <mesh
              key={index}
              position={[
                Math.sin(index) * 10,
                5 + Math.sin(index),
                Math.cos(index) * 10,
              ]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#4c1d95" />
            </mesh>
          ))}

          <mesh position={[0, 3, 0]}>
            <icosahedronGeometry args={[3, 1]} />
            <meshStandardMaterial color="black" wireframe />
          </mesh>
          <pointLight position={[0, 3, 0]} color="purple" intensity={3} distance={20} />
        </group>
      )}
    </>
  );
};

interface StoryModeLogicProps {
  heroConfig?: HeroConfig;
}

export const StoryModeLogic = ({ heroConfig = DEFAULT_HERO }: StoryModeLogicProps) => {
  const playerRef = useRef<THREE.Group | null>(null);
  const { objectiveStatus, dialogue, actName, nextLevel, currentLevel } = useStoryStore();

  useEffect(() => {
    if (objectiveStatus === "COMPLETE" && currentLevel < 3) {
      const timeout = setTimeout(() => nextLevel(), 900);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [objectiveStatus, currentLevel, nextLevel]);

  return (
    <div style={{ position: "relative", width: "100%", height: "80vh" }}>
      <Canvas
        shadows
        camera={{ position: [0, 6, 14], fov: 60, near: 0.1, far: 500 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#0f172a"]} />
        <fog attach="fog" args={["#0f172a", 20, 140]} />

        <Suspense fallback={null}>
          <PlayerController playerRef={playerRef} heroConfig={heroConfig} />
          <LevelManager playerRef={playerRef} />
        </Suspense>

        <hemisphereLight intensity={0.4} groundColor={new THREE.Color("#0f172a")} />
        <spotLight
          position={[20, 30, 10]}
          angle={0.3}
          penumbra={0.5}
          intensity={2}
          castShadow
        />
      </Canvas>

      <div
        style={{
          position: "absolute",
          inset: "1rem",
          maxWidth: "480px",
          padding: "1rem",
          borderRadius: "12px",
          backdropFilter: "blur(8px)",
          background: "rgba(15, 23, 42, 0.75)",
          color: "#e2e8f0",
          border: "1px solid rgba(148, 163, 184, 0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div style={{ fontSize: "0.85rem", letterSpacing: "0.06em", color: "#93c5fd" }}>{actName}</div>
        <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>Fragmented Path — Story Mode</div>
        <p style={{ margin: 0, color: "#cbd5e1" }}>{dialogue}</p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Badge label="Hero" />
          <span style={{ color: "#e5e7eb", fontWeight: 600 }}>{heroConfig.name}</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Badge label="Virtual Joystick → Camera forward" />
          <Badge label="Kinematic feel (platformer)" />
          <Badge label="50m render bubble" />
          <Badge label="Instancing for forests" />
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: objectiveStatus === "COMPLETE" ? "#22c55e" : "#e5e7eb",
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: "0.9rem" }}>Objective</span>
          <span style={{ opacity: 0.8 }}>
            {objectiveStatus === "COMPLETE" ? "Stabilized" : "Reach the sector relic"}
          </span>
        </div>
        {objectiveStatus === "COMPLETE" && currentLevel < 3 && (
          <div style={{ fontSize: "0.9rem", color: "#22c55e" }}>
            Rift secure. Auto-loading next sector...
          </div>
        )}
        {objectiveStatus === "COMPLETE" && currentLevel === 3 && (
          <div style={{ fontSize: "0.9rem", color: "#c084fc" }}>
            Boss arena unlocked. Drop in.
          </div>
        )}
      </div>
    </div>
  );
};

interface BadgeProps {
  label: string;
}

const Badge = ({ label }: BadgeProps) => (
  <span
    style={{
      background: "rgba(59, 130, 246, 0.15)",
      color: "#bfdbfe",
      border: "1px solid rgba(59, 130, 246, 0.4)",
      padding: "0.3rem 0.6rem",
      borderRadius: "999px",
      fontSize: "0.75rem",
      letterSpacing: "0.02em",
    }}
  >
    {label}
  </span>
);

interface HeroAvatarProps {
  config: HeroConfig;
}

const HeroAvatar = ({ config }: HeroAvatarProps) => {
  if (config.glbUrl) {
    return (
      <Suspense fallback={<HeroFallback color={config.color} />}>
        <HeroModelFromGLB url={config.glbUrl} scale={config.scale ?? 1} />
      </Suspense>
    );
  }

  return <HeroFallback color={config.color} />;
};

interface HeroModelFromGLBProps {
  url: string;
  scale?: number;
}

const HeroModelFromGLB = ({ url, scale = 1 }: HeroModelFromGLBProps) => {
  const gltf = useGLTF(url) as GLTF & { scene: THREE.Group };

  return <primitive object={gltf.scene} scale={scale} castShadow receiveShadow />;
};

interface HeroFallbackProps {
  color?: string;
}

const HeroFallback = ({ color = "#fbbf24" }: HeroFallbackProps) => (
  <>
    <mesh castShadow receiveShadow>
      <cylinderGeometry args={[0.5, 0.5, 1.5, 32]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
    </mesh>
    <mesh position={[0, 0.5, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.2, 0.5, 16]} />
      <meshBasicMaterial color="white" />
    </mesh>
  </>
);

export default StoryModeLogic;
