import { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SceneEnvironment from "./graphics/SceneEnvironment";
import * as THREE from "three";
import { useGame } from "../../lib/stores/useGame";
import { useRunner } from "../../lib/stores/useRunner";
import { useBattle } from "../../lib/stores/useBattle";
import { Fighter, FIGHTERS, getFighterById } from "../../lib/characters";
import GLBCharacterModel from "./models/GLBCharacterModel";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import CinematicPostFX from "./graphics/CinematicPostFX";
import { getQualitySettings } from "../../lib/threejs/PerformanceOptimizer";
import VariantSelector from "./VariantSelector";
import { getDefaultVariant } from "../../lib/characterVariants";

function getGrade(fighterId: string): "cosmic" | "ice" | "ember" | "neutral" {
  if (fighterId === "kai-jax") return "cosmic";
  if (fighterId === "jax" || fighterId === "jaxon") return "ice";
  if (fighterId === "kai" || fighterId === "kaison") return "ember";
  return "neutral";
}

function getPunch(fighterId: string): number {
  return fighterId === "kai-jax" ? 0.35 : 0.18;
}

function getRoleLabel(fighter: Fighter): string {
  switch (fighter.role) {
    case "hero": return "Hero";
    case "rival": return "Rival";
    case "boss": return "Boss";
    case "enemy": return "Fighter";
    default: return "Unknown";
  }
}

function getRoleBadgeColor(fighter: Fighter): string {
  switch (fighter.role) {
    case "hero": return "bg-green-500/30 text-green-300 border-green-500/50";
    case "rival": return "bg-amber-500/30 text-amber-300 border-amber-500/50";
    case "boss": return "bg-red-500/30 text-red-300 border-red-500/50";
    default: return "bg-slate-500/30 text-slate-300 border-slate-500/50";
  }
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{label}</span>
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

function FighterCard({
  fighter,
  selected,
  onClick,
}: {
  fighter: Fighter;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-xl border-2 transition-all duration-200 text-center ${
        selected
          ? "scale-[1.05] z-10"
          : "hover:scale-[1.03] hover:border-slate-500"
      }`}
      style={{
        borderColor: selected ? fighter.accentColor : "rgba(100,116,139,0.3)",
        background: selected
          ? `linear-gradient(180deg, ${fighter.accentColor}15, ${fighter.color}40)`
          : "rgba(15,23,42,0.6)",
        boxShadow: selected ? `0 0 20px ${fighter.accentColor}33` : "none",
      }}
    >
      <div
        className="w-10 h-10 mx-auto rounded-full mb-1 flex items-center justify-center text-lg font-black"
        style={{
          background: `linear-gradient(135deg, ${fighter.accentColor}44, ${fighter.color})`,
          color: fighter.accentColor,
          border: `2px solid ${fighter.accentColor}66`,
        }}
      >
        {fighter.name[0]}
      </div>
      <div
        className="text-xs font-bold tracking-wide truncate"
        style={{ color: selected ? fighter.accentColor : "#94a3b8" }}
      >
        {fighter.displayName}
      </div>
      <span className={`inline-block mt-0.5 text-[9px] px-1.5 py-0.5 rounded border ${getRoleBadgeColor(fighter)}`}>
        {getRoleLabel(fighter)}
      </span>
    </button>
  );
}

export default function VersusCharacterSelect() {
  const start = useGame((s) => s.start);
  const resetPhase = useGame((s) => s.reset);
  const setGameState = useRunner((s) => s.setGameState);
  const setTrainingSession = useRunner((s) => s.setTrainingSession);
  const setCharacter = useRunner((s) => s.setCharacter);
  const setPlayerFighter = useBattle((s) => s.setPlayerFighter);
  const setOpponentFighter = useBattle((s) => s.setOpponentFighter);

  const completedStoryMissionIds = useRunner((s) => s.completedStoryMissionIds);

  const [selectedId, setSelectedId] = useState<string>(FIGHTERS[0]?.id ?? "kai-jax");
  const [variantByFighter, setVariantByFighter] = useState<Record<string, string>>({});
  const selected = getFighterById(selectedId);

  // DIAGNOSTIC: log fighter selection for Versus mode
  useEffect(() => {
    console.log('[VersusCharacterSelect] Fighter selection trace:', {
      selectedId,
      fighter: selected ? { id: selected.id, displayName: selected.displayName, color: selected.color } : null,
      fightersTotal: FIGHTERS.length,
      defaultFirst: FIGHTERS[0]?.id,
    });
  }, [selectedId, selected]);

  const playerProgress = {
    characterLevel: 1,
    completedMissions: completedStoryMissionIds,
    completedQuests: [] as string[],
  };
  const selectedVariantId =
    variantByFighter[selectedId] ?? getDefaultVariant(selectedId)?.id ?? "";

  const beginMatch = (training: boolean) => {
    if (!selected) return;
    console.log('[Blocker A Trace] beginMatch invoked', { training, selectedId: selected.id, selectedName: selected.displayName });

    resetPhase();
    console.log('[Blocker A Trace] After resetPhase (1)');

    setTrainingSession(training);
    setCharacter(selectedId);
    setPlayerFighter(selectedId);
    console.log('[Blocker A Trace] Fighter assignments complete');

    const others = FIGHTERS.map((f) => f.id).filter((id) => id !== selectedId);
    const opponentId = others[Math.floor(Math.random() * others.length)] ?? selectedId;
    setOpponentFighter(opponentId);
    console.log('[Blocker A Trace] Opponent assigned:', { opponentId });

    resetPhase();
    console.log('[Blocker A Trace] After resetPhase (2)');

    start();
    console.log('[Blocker A Trace] After start()');

    setGameState("playing");
    console.log('[Blocker A Trace] After setGameState("playing")');
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

      <div className="flex-1 flex gap-6 px-6 py-4 min-h-0">
        <div className="flex-1 flex flex-col">
          {selected && (
            <div
              className="flex-1 rounded-2xl overflow-hidden border-2 relative"
              style={{
                borderColor: `${selected.accentColor}66`,
                boxShadow: `0 0 40px ${selected.accentColor}22`,
              }}
            >
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
                <SceneEnvironment mode="sunset" />
                <CinematicPostFX
                  grade={getGrade(selected.id)}
                  accent={selected.accentColor || "#00f2ff"}
                  punch={getPunch(selected.id)}
                  center={[0.5, 0.44]}
                />
                <Suspense fallback={null}>
                  <group position={[0, -1, 0]}>
                    <GLBCharacterModel
                      fighterId={selected.id}
                      accentColor={selected.accentColor}
                      emotionIntensity={0.5}
                    />
                  </group>
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]} receiveShadow>
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

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-3xl font-black tracking-wider" style={{ color: selected.accentColor }}>
                  {selected.displayName}
                </h2>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded border ${getRoleBadgeColor(selected)}`}>
                  {getRoleLabel(selected)}
                </span>
                {selected.baseStats && (
                  <div className="mt-2 max-w-xs space-y-1">
                    <StatBar label="PWR" value={selected.baseStats.power} color={selected.accentColor} />
                    <StatBar label="SPD" value={selected.baseStats.speed} color={selected.accentColor} />
                    <StatBar label="DEF" value={selected.baseStats.defense} color={selected.accentColor} />
                  </div>
                )}
                <div className="mt-3 max-w-xs">
                  <VariantSelector
                    fighterId={selectedId}
                    selectedVariantId={selectedVariantId}
                    onSelect={(variantId) =>
                      setVariantByFighter((prev) => ({ ...prev, [selectedId]: variantId }))
                    }
                    playerProgress={playerProgress}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-72 flex flex-col gap-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-3 md:gap-2">
            {FIGHTERS.map((f) => (
              <FighterCard
                key={f.id}
                fighter={f}
                selected={selectedId === f.id}
                onClick={() => setSelectedId(f.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-6 pt-2 px-4">
        <button
          type="button"
          onClick={() => beginMatch(false)}
          className="relative px-12 py-4 rounded-xl font-black text-xl tracking-widest text-white uppercase transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${selected?.accentColor ?? "#7fff00"}cc, ${selected?.color ?? "#1a1a1a"})`,
            boxShadow: `0 0 30px 4px ${selected?.accentColor ?? "#7fff00"}44, 0 4px 20px rgba(0,0,0,0.5)`,
            border: `2px solid ${selected?.accentColor ?? "#7fff00"}88`,
          }}
        >
          FIGHT
        </button>
        <button
          type="button"
          onClick={() => beginMatch(true)}
          className="px-8 py-3 rounded-xl font-bold text-sm tracking-widest text-slate-200 uppercase border border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-900/50 hover:border-emerald-400/70 transition-all duration-200"
        >
          Training (no rank score)
        </button>
      </div>
    </div>
  );
}
