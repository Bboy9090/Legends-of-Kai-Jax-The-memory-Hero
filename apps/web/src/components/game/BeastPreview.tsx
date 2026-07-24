import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SceneEnvironment from "./graphics/SceneEnvironment";
import * as THREE from "three";
import { FIGHTERS, getFighterById } from "../../lib/characters";
import GLBCharacterModel from "./models/GLBCharacterModel";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import CinematicPostFX from "./graphics/CinematicPostFX";
import { getQualitySettings } from "../../lib/threejs/PerformanceOptimizer";
import { useRunner } from "../../lib/stores/useRunner";

function BeastModelPanel({ fighterId }: { fighterId: string }) {
  const fighter = getFighterById(fighterId);
  if (!fighter) return null;

  const grade = fighterId === "kai-jax" ? "cosmic" : fighterId === "jaxon" ? "ice" : "ember";
  const punch = fighterId === "kai-jax" ? 0.35 : 0.18;

  return (
    <Canvas
      shadows
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
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
      <SceneEnvironment mode="sunset" />
      <CinematicPostFX grade={grade} accent={fighter.accentColor} punch={punch} center={[0.5, 0.44]} />
      <Suspense fallback={null}>
        <group position={[0, -1, 0]}>
          <GLBCharacterModel
            fighterId={fighterId}
            accentColor={fighter.accentColor}
            emotionIntensity={0.5}
          />
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
  const fighter = getFighterById(activeFighter);

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-[#07070d] via-purple-950/20 to-[#07070d]">
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={() => setGameState("menu")}
          className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition-all"
        >
          Back
        </button>
        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
          Beast Preview
        </h1>
        <div className="w-20" />
      </div>

      <div className="flex gap-2 justify-center pb-2 shrink-0 flex-wrap px-2">
        {FIGHTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFighter(f.id)}
            className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${
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

      <div className="flex-1 min-h-0 relative w-full">
        <BeastModelPanel key={activeFighter} fighterId={activeFighter} />
      </div>

      {fighter && (
        <div className="px-4 py-3 flex items-center justify-center gap-8 shrink-0 border-t border-slate-800/50">
          <h2 className="text-lg font-black text-white">{fighter.displayName}</h2>
          <div className="flex gap-5 text-sm">
            <div className="text-center">
              <div className="text-slate-500 text-[10px] uppercase">Power</div>
              <div className="text-white font-bold">{fighter.baseStats?.power ?? 0}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-[10px] uppercase">Speed</div>
              <div className="text-white font-bold">{fighter.baseStats?.speed ?? 0}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-[10px] uppercase">Defense</div>
              <div className="text-white font-bold">{fighter.baseStats?.defense ?? 0}</div>
            </div>
          </div>
          <span className="text-slate-600 text-xs hidden sm:inline">Scroll to zoom · Drag to rotate</span>
        </div>
      )}
    </div>
  );
}
