/* eslint-disable react/no-unknown-property */
import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import InputController from "../../lib/InputController";
import CharacterController from "../../lib/CharacterController";
import { useRunner } from "../../lib/stores/useRunner";

// ─── state-to-color map ────────────────────────────────────────
const STATE_COLORS: Record<string, string> = {
  idle: "#888888",
  walk: "#22d3ee",
  run: "#a855f7",
  jump: "#facc15",
  fall: "#f97316",
  attack_light: "#ef4444",
  attack_heavy: "#dc2626",
  hit: "#ff0000",
  block: "#3b82f6",
};

// ─── the capsule player driven by CharacterController ──────────
function Player({
  controller,
  onStateChange,
}: {
  controller: CharacterController;
  onStateChange: (info: DebugInfo) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    controller.update(delta);

    if (meshRef.current) {
      meshRef.current.position.set(
        controller.posX,
        controller.posY + 1,
        controller.posZ
      );

      const move = controller.getMoveDirection();
      if (move.lengthSq() > 0.001) {
        const angle = Math.atan2(move.x, move.z);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y,
          angle,
          delta * 10
        );
      }
    }

    if (matRef.current) {
      const hex = STATE_COLORS[controller.state] || "#888888";
      matRef.current.color.set(hex);
      matRef.current.emissive.set(hex);
      matRef.current.emissiveIntensity = controller.state === "idle" ? 0.1 : 0.35;
    }

    const move = controller.getMoveDirection();
    onStateChange({
      state: controller.state,
      moveX: +move.x.toFixed(2),
      moveZ: +move.z.toFixed(2),
      grounded: controller.isGrounded,
      sprint: controller.input.keys.shift,
      posX: +controller.posX.toFixed(1),
      posY: +controller.posY.toFixed(2),
      posZ: +controller.posZ.toFixed(1),
      velY: +controller.velocityY.toFixed(1),
    });
  });

  return (
    <mesh ref={meshRef} castShadow position={[0, 1, 0]}>
      <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
      <meshStandardMaterial ref={matRef} color="#888888" roughness={0.4} metalness={0.3} />
    </mesh>
  );
}

// ─── camera that follows the player ────────────────────────────
function FollowCamera({ controller }: { controller: CharacterController }) {
  const { camera } = useThree();
  const offset = useMemo(() => new THREE.Vector3(0, 5, 8), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    target.set(controller.posX, controller.posY + 1.5, controller.posZ);

    const desired = target.clone().add(offset);
    camera.position.lerp(desired, delta * 4);
    camera.lookAt(target);
  });

  return null;
}

// ─── ground plane ──────────────────────────────────────────────
function Ground() {
  return (
    <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
    </mesh>
  );
}

function GridLines() {
  return (
    <gridHelper
      args={[100, 50, "#333355", "#222244"]}
      position={[0, 0.01, 0]}
    />
  );
}

// ─── debug info type ───────────────────────────────────────────
interface DebugInfo {
  state: string;
  moveX: number;
  moveZ: number;
  grounded: boolean;
  sprint: boolean;
  posX: number;
  posY: number;
  posZ: number;
  velY: number;
}

// ─── debug HUD overlay ────────────────────────────────────────
function DebugHUD({ info }: { info: DebugInfo }) {
  const color = STATE_COLORS[info.state] || "#888";
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        padding: "12px 16px",
        background: "rgba(0,0,0,0.75)",
        borderRadius: 8,
        border: `1px solid ${color}66`,
        fontFamily: "monospace",
        fontSize: 13,
        color: "#ccc",
        lineHeight: 1.7,
        pointerEvents: "none",
        zIndex: 10,
        minWidth: 220,
      }}
    >
      <div style={{ color, fontWeight: "bold", fontSize: 16, marginBottom: 4 }}>
        {info.state.toUpperCase()}
      </div>
      <div>move: ({info.moveX}, {info.moveZ})</div>
      <div>
        grounded:{" "}
        <span style={{ color: info.grounded ? "#4ade80" : "#f87171" }}>
          {String(info.grounded)}
        </span>
      </div>
      <div>
        sprint:{" "}
        <span style={{ color: info.sprint ? "#a855f7" : "#666" }}>
          {String(info.sprint)}
        </span>
      </div>
      <div>pos: ({info.posX}, {info.posY}, {info.posZ})</div>
      <div>velY: {info.velY}</div>
    </div>
  );
}

// ─── controls legend ───────────────────────────────────────────
function ControlsLegend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "monospace",
        fontSize: 13,
        color: "#666",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      W A S D move · Shift sprint · Space jump · Esc back
    </div>
  );
}

// ─── inner 3D scene ────────────────────────────────────────────
function Scene({
  controller,
  onStateChange,
}: {
  controller: CharacterController;
  onStateChange: (info: DebugInfo) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Ground />
      <GridLines />
      <Player controller={controller} onStateChange={onStateChange} />
      <FollowCamera controller={controller} />
    </>
  );
}

// ─── main exported component ───────────────────────────────────
export default function ControllerTestScene() {
  const setGameState = useRunner((s) => s.setGameState);

  const { input, character } = useMemo(() => {
    const inp = new InputController();
    const chr = new CharacterController(inp);
    return { input: inp, character: chr };
  }, []);

  const [debug, setDebug] = useState<DebugInfo>({
    state: "idle",
    moveX: 0,
    moveZ: 0,
    grounded: true,
    sprint: false,
    posX: 0,
    posY: 0,
    posZ: 0,
    velY: 0,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") setGameState("menu");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setGameState]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#0a0a1a" }}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 8], fov: 50, near: 0.1, far: 200 }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.9;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Scene controller={character} onStateChange={setDebug} />
      </Canvas>
      <DebugHUD info={debug} />
      <ControlsLegend />
    </div>
  );
}
