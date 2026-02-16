import { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FIGHTERS, getFighterById } from "../../lib/characters";
import AnatomicalBeastModel from "./models/AnatomicalBeastModel";
import GLBCharacterModel, { CHARACTER_MODELS } from "./models/GLBCharacterModel";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import CinematicPostFX from "./graphics/CinematicPostFX";
import { getQualitySettings } from "../../lib/threejs/PerformanceOptimizer";
import { useRunner } from "../../lib/stores/useRunner";

function BeastModelPanel({ fighterId, useGLB = false }: { fighterId: string; useGLB?: boolean }) {
  const fighter = getFighterById(fighterId);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  if (!fighter) return null;

  const grade = fighterId === "kai-jax" ? "cosmic" : fighterId === "jaxon" ? "ice" : "ember";
  const punch = fighterId === "kai-jax" ? 0.35 : 0.18;
  const hasGLB = !!CHARACTER_MODELS[fighterId];

  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.65, 5.5], fov: 42 }}
      onCreated={({ gl }) => {
        const q = getQualitySettings();
        gl.setPixelRatio(q.pixelRatio);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = q.shadowMap.type as THREE.ShadowMapType;
      }}
      gl={{ antialias: getQualitySettings().antialias, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0b0b12"]} />
      <LegendaryLightingRig />
      <Environment preset="sunset" />
      <CinematicPostFX grade={grade} accent={fighter.accentColor} punch={punch} center={[0.5, 0.44]} />
      <Suspense fallback={null}>
        <group position={[0, -1, 0]}>
          {useGLB && hasGLB ? (
            <GLBCharacterModel
              fighterId={fighterId}
              accentColor={fighter.accentColor}
              emotionIntensity={0.5}
            />
          ) : (
            <AnatomicalBeastModel
              fighter={fighter}
              bodyRef={bodyRef}
              headRef={headRef}
              leftArmRef={leftArmRef}
              rightArmRef={rightArmRef}
              leftLegRef={leftLegRef}
              rightLegRef={rightLegRef}
              emotionIntensity={0.5}
              hitAnim={0}
              animTime={0}
              isAttacking={false}
              isInvulnerable={false}
              lodLevel={0}
            />
          )}
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.3} />
        </mesh>
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
          minDistance={3}
          maxDistance={12}
          autoRotate
          autoRotateSpeed={1.5}
        />
      </Suspense>
    </Canvas>
  );
}

export default function BeastPreview() {
  const setGameState = useRunner((s) => s.setGameState);
  const [activeFighter, setActiveFighter] = useState("kai-jax");
  const [useGLB, setUseGLB] = useState(false);
  const fighter = getFighterById(activeFighter);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[#07070d] via-purple-950/20 to-[#07070d]">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setGameState("menu")}
          className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition-all"
        >
          Back
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">
          Beast Preview — {useGLB ? "3D Model" : "Layered Rendering"}
        </h1>
        <button
          onClick={() => setUseGLB(!useGLB)}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            useGLB
              ? "bg-cyan-500/25 border-2 border-cyan-400 text-cyan-200"
              : "border-2 border-slate-600 text-slate-400 hover:border-cyan-500/50"
          }`}
        >
          {useGLB ? "3D Models" : "Procedural"}
        </button>
      </div>

      <div className="flex gap-2 justify-center mb-2">
        {FIGHTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFighter(f.id)}
            className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
              activeFighter === f.id
                ? "text-white scale-105"
                : "text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500"
            }`}
            style={
              activeFighter === f.id
                ? {
                    background: `linear-gradient(135deg, ${f.color}, ${f.accentColor})`,
                    borderColor: f.accentColor,
                    border: `2px solid ${f.accentColor}`,
                    boxShadow: `0 0 20px ${f.accentColor}40`,
                  }
                : undefined
            }
          >
            {f.displayName}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 relative">
        <BeastModelPanel key={`${activeFighter}-${useGLB}`} fighterId={activeFighter} useGLB={useGLB} />
      </div>

      {fighter && (
        <div className="p-4 flex flex-col items-center gap-2">
          <h2 className="text-xl font-black text-white">{fighter.displayName}</h2>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="text-slate-500 text-xs uppercase">Power</div>
              <div className="text-white font-bold">{fighter.baseStats?.power ?? 0}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-xs uppercase">Speed</div>
              <div className="text-white font-bold">{fighter.baseStats?.speed ?? 0}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-xs uppercase">Defense</div>
              <div className="text-white font-bold">{fighter.baseStats?.defense ?? 0}</div>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {useGLB ? "Mode: 3D GLB Model (Meshy AI)" : "Layers: Base Mesh · Fur Shell · Emissive Veins · Memory Tails · Aura Wings · Particles"}
          </p>
          <p className="text-slate-600 text-xs">
            Scroll to zoom · Drag to rotate · {useGLB ? "Toggle to switch rendering mode" : "All layers active (LOD 0)"}
          </p>
        </div>
      )}
    </div>
  );
}
