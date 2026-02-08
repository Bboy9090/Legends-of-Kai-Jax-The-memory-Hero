import { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "../../lib/stores/useGame";
import { useRunner } from "../../lib/stores/useRunner";
import { useBattle } from "../../lib/stores/useBattle";
import { Fighter, FIGHTERS, getFighterById } from "../../lib/characters";
import AnatomicalBeastModel from "./models/AnatomicalBeastModel";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import CinematicPostFX from "./graphics/CinematicPostFX";
import { getQualitySettings } from "../../lib/threejs/PerformanceOptimizer";

function getGrade(fighterId: string): "cosmic" | "ice" | "ember" | "neutral" {
  if (fighterId === "kai-jax") return "cosmic";
  if (fighterId === "jaxon") return "ice";
  if (fighterId === "kaison") return "ember";
  return "neutral";
}

function getPunch(fighterId: string): number {
  return fighterId === "kai-jax" ? 0.35 : 0.18;
}

function FighterPanel({
  fighter,
  selected,
  onClick,
}: {
  fighter: Fighter;
  selected: boolean;
  onClick: () => void;
}) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const stats = fighter.baseStats;

  return (
    <div
      onClick={onClick}
      className="flex-1 min-w-0 flex flex-col cursor-pointer group transition-all duration-300"
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          height: "55vh",
          minHeight: 320,
          border: selected
            ? `3px solid ${fighter.accentColor}`
            : "3px solid rgba(255,255,255,0.08)",
          boxShadow: selected
            ? `0 0 32px 6px ${fighter.accentColor}55, 0 0 80px 12px ${fighter.accentColor}22, inset 0 0 60px 8px ${fighter.accentColor}18`
            : "0 0 0 0 transparent",
        }}
      >
        {selected && (
          <div
            className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(ellipse at 50% 80%, ${fighter.accentColor}18 0%, transparent 70%)`,
            }}
          />
        )}
        <Canvas
          shadows
          camera={{ position: [0, 1.65, 6.4], fov: 42 }}
          onCreated={({ gl }) => {
            const q = getQualitySettings();
            gl.setPixelRatio(q.pixelRatio);
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.2;
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = q.shadowMap.type as THREE.ShadowMapType;
          }}
          gl={{
            antialias: getQualitySettings().antialias,
            powerPreference: "high-performance",
          }}
        >
          <color attach="background" args={["#0b0b12"]} />
          <LegendaryLightingRig />
          <Environment preset="sunset" />
          <CinematicPostFX
            grade={getGrade(fighter.id)}
            accent={fighter.accentColor || "#00f2ff"}
            punch={getPunch(fighter.id)}
            center={[0.5, 0.44]}
          />
          <Suspense fallback={null}>
            <group position={[0, -1, 0]}>
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
            </group>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -1.7, 0]}
              receiveShadow
            >
              <planeGeometry args={[10, 10]} />
              <shadowMaterial opacity={0.3} />
            </mesh>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2}
              autoRotate
              autoRotateSpeed={2}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="mt-3 px-2 text-center">
        <h3
          className="text-xl font-extrabold tracking-wider"
          style={{ color: fighter.accentColor }}
        >
          {fighter.displayName}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-widest">
          {fighter.id === "kai-jax"
            ? "The Fused Apex"
            : fighter.id === "jaxon"
              ? "The Swift Blade"
              : fighter.id === "kaison"
                ? "The Iron Will"
                : "Unknown"}
        </p>
        {stats && (
          <div className="mt-2 flex flex-col gap-1.5">
            <StatBar label="PWR" value={stats.power} color={fighter.accentColor} />
            <StatBar label="SPD" value={stats.speed} color={fighter.accentColor} />
            <StatBar label="DEF" value={stats.defense} color={fighter.accentColor} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-slate-500 w-8 text-right">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>
      <span className="text-[10px] font-bold text-slate-400 w-6">{value}</span>
    </div>
  );
}

export default function VersusCharacterSelect() {
  const start = useGame((s) => s.start);
  const setGameState = useRunner((s) => s.setGameState);
  const setCharacter = useRunner((s) => s.setCharacter);
  const setPlayerFighter = useBattle((s) => s.setPlayerFighter);
  const setOpponentFighter = useBattle((s) => s.setOpponentFighter);

  const [selectedId, setSelectedId] = useState<string>(FIGHTERS[0]?.id ?? "kai-jax");

  const handleFight = () => {
    const fighter = getFighterById(selectedId);
    if (!fighter) return;

    setCharacter(selectedId);
    setPlayerFighter(selectedId);

    const others = FIGHTERS.map((f) => f.id).filter((id) => id !== selectedId);
    const opponentId =
      others[Math.floor(Math.random() * others.length)] ?? selectedId;
    setOpponentFighter(opponentId);

    start();
    setGameState("playing");
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#07070d] via-purple-950/20 to-[#07070d] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        <button
          onClick={() => setGameState("menu")}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-sm font-medium"
        >
          ← BACK
        </button>
        <h1 className="text-2xl font-black tracking-[0.25em] text-white/90 uppercase">
          Choose Your Fighter
        </h1>
        <div className="w-20" />
      </div>

      <div className="flex-1 flex gap-4 px-6 py-4 min-h-0">
        {FIGHTERS.map((f) => {
          const fighter = getFighterById(f.id);
          if (!fighter) return null;
          return (
            <FighterPanel
              key={f.id}
              fighter={fighter}
              selected={selectedId === f.id}
              onClick={() => setSelectedId(f.id)}
            />
          );
        })}
      </div>

      <div className="flex justify-center pb-6 pt-2">
        <button
          onClick={handleFight}
          className="relative px-12 py-4 rounded-xl font-black text-xl tracking-widest text-white uppercase transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${getFighterById(selectedId)?.accentColor ?? "#7fff00"}cc, ${getFighterById(selectedId)?.color ?? "#1a1a1a"})`,
            boxShadow: `0 0 30px 4px ${getFighterById(selectedId)?.accentColor ?? "#7fff00"}44, 0 4px 20px rgba(0,0,0,0.5)`,
            border: `2px solid ${getFighterById(selectedId)?.accentColor ?? "#7fff00"}88`,
          }}
        >
          FIGHT
        </button>
      </div>
    </div>
  );
}
