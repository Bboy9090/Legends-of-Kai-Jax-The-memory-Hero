import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import SceneEnvironment from "./graphics/SceneEnvironment";
import GLBCharacterModel from "./models/GLBCharacterModel";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import CinematicPostFX from "./graphics/CinematicPostFX";
import VariantSelector from "./VariantSelector";

import { useGame } from "../../lib/stores/useGame";
import { useRunner } from "../../lib/stores/useRunner";
import { useBattle } from "../../lib/stores/useBattle";
import { FIGHTERS, getFighterById } from "../../lib/characters";
import { getDefaultVariant } from "../../lib/characterVariants";
import { getQualitySettings } from "../../lib/threejs/PerformanceOptimizer";
import {
  VERSUS_ROSTER,
  type VersusRosterEntry,
} from "../../lib/versusRoster";

const GRID_COLUMNS = 3;
const GAMEPAD_REPEAT_MS = 180;

const COMBAT_ID_ALIASES: Record<string, string> = {
  "kai-jax": "kaijax",
};

function resolveCombatId(id: string): string {
  return COMBAT_ID_ALIASES[id] ?? id;
}

function getCombatProfile(entry: VersusRosterEntry) {
  return getFighterById(resolveCombatId(entry.id));
}

function getGrade(fighterId: string): "cosmic" | "ice" | "ember" | "neutral" {
  if (fighterId === "kai-jax" || fighterId === "kaijax") return "cosmic";
  if (fighterId === "jax") return "ice";
  if (fighterId === "kai") return "ember";
  return "neutral";
}

function factionLabel(faction: VersusRosterEntry["faction"]): string {
  switch (faction) {
    case "core": return "Core";
    case "fracture-circle": return "Fracture Circle";
    case "covenant": return "Covenant";
    case "engineered-horror": return "Engineered Horror";
  }
}

function roleLabel(role: VersusRosterEntry["role"]): string {
  switch (role) {
    case "hero": return "Hero";
    case "ally": return "Ally";
    case "villain": return "Villain";
    case "boss": return "Boss";
  }
}

function roleTone(role: VersusRosterEntry["role"]): string {
  switch (role) {
    case "hero": return "border-cyan-500/60 text-cyan-200 bg-cyan-950/35";
    case "ally": return "border-emerald-500/60 text-emerald-200 bg-emerald-950/35";
    case "villain": return "border-rose-500/60 text-rose-200 bg-rose-950/35";
    case "boss": return "border-violet-500/60 text-violet-200 bg-violet-950/35";
  }
}

function FighterCard({
  entry,
  selected,
  playable,
  onClick,
}: {
  entry: VersusRosterEntry;
  selected: boolean;
  playable: boolean;
  onClick: () => void;
}) {
  const profile = getCombatProfile(entry);
  const accent = profile?.accentColor ?? (entry.role === "boss" ? "#a78bfa" : "#94a3b8");
  const base = profile?.color ?? "#111827";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`${entry.displayName}, ${roleLabel(entry.role)}, ${playable ? "playable" : "locked"}${selected ? ", selected" : ""}`}
      data-fighter-id={entry.id}
      data-selected={selected ? "true" : "false"}
      data-playable={playable ? "true" : "false"}
      className={`relative min-h-24 p-2 rounded-xl border-2 transition-transform duration-150 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${selected ? "scale-[1.04] z-10" : "hover:scale-[1.02]"}`}
      style={{
        borderColor: selected ? accent : "rgba(100,116,139,0.3)",
        background: selected
          ? `linear-gradient(180deg, ${accent}20, ${base}66)`
          : "rgba(15,23,42,0.72)",
        boxShadow: selected ? `0 0 20px ${accent}33` : "none",
        opacity: playable ? 1 : 0.7,
      }}
    >
      <div
        className="w-10 h-10 mx-auto rounded-full mb-1 flex items-center justify-center text-base font-black"
        aria-hidden="true"
        style={{
          background: `linear-gradient(135deg, ${accent}55, ${base})`,
          color: accent,
          border: `2px solid ${accent}77`,
        }}
      >
        {entry.displayName.slice(0, 2).toUpperCase()}
      </div>
      <div className="text-[11px] sm:text-xs font-bold tracking-wide leading-tight text-slate-100">
        {entry.displayName}
      </div>
      <div className="mt-1 flex justify-center gap-1 flex-wrap">
        <span className={`text-[8px] px-1.5 py-0.5 rounded border ${roleTone(entry.role)}`}>
          {roleLabel(entry.role)}
        </span>
        {!playable && (
          <span className="text-[8px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-300 bg-slate-900/70">
            LOCKED
          </span>
        )}
      </div>
    </button>
  );
}

export default function VersusCharacterSelect() {
  const start = useGame((s) => s.start);
  const resetPhase = useGame((s) => s.reset);
  const setGameState = useRunner((s) => s.setGameState);
  const setTrainingSession = useRunner((s) => s.setTrainingSession);
  const setCharacter = useRunner((s) => s.setCharacter);
  const persistedCharacter = useRunner((s) => s.selectedCharacter);
  const setPlayerFighter = useBattle((s) => s.setPlayerFighter);
  const setOpponentFighter = useBattle((s) => s.setOpponentFighter);
  const completedStoryMissionIds = useRunner((s) => s.completedStoryMissionIds);

  const playableEntries = useMemo(
    () => VERSUS_ROSTER.filter((entry) => entry.defaultUnlocked && Boolean(getCombatProfile(entry))),
    [],
  );

  const initialSelection = useMemo(() => {
    const persisted = persistedCharacter
      ? VERSUS_ROSTER.find((entry) => resolveCombatId(entry.id) === persistedCharacter || entry.id === persistedCharacter)
      : undefined;
    return persisted?.id ?? playableEntries[0]?.id ?? VERSUS_ROSTER[0]?.id ?? "kai";
  }, [persistedCharacter, playableEntries]);

  const [selectedId, setSelectedId] = useState(initialSelection);
  const [variantByFighter, setVariantByFighter] = useState<Record<string, string>>({});

  const selectedEntry = VERSUS_ROSTER.find((entry) => entry.id === selectedId) ?? VERSUS_ROSTER[0];
  const selectedProfile = selectedEntry ? getCombatProfile(selectedEntry) : null;
  const selectedPlayable = Boolean(selectedEntry?.defaultUnlocked && selectedProfile);
  const selectedCombatId = selectedEntry ? resolveCombatId(selectedEntry.id) : "";

  const selectedVariantId = selectedCombatId
    ? variantByFighter[selectedCombatId] ?? getDefaultVariant(selectedCombatId)?.id ?? ""
    : "";

  const playerProgress = {
    characterLevel: 1,
    completedMissions: completedStoryMissionIds,
    completedQuests: [] as string[],
  };

  const selectByIndex = useCallback((nextIndex: number) => {
    if (VERSUS_ROSTER.length === 0) return;
    const wrapped = ((nextIndex % VERSUS_ROSTER.length) + VERSUS_ROSTER.length) % VERSUS_ROSTER.length;
    const next = VERSUS_ROSTER[wrapped];
    if (!next) return;
    setSelectedId(next.id);
  }, []);

  const moveSelection = useCallback((delta: number) => {
    const currentIndex = Math.max(0, VERSUS_ROSTER.findIndex((entry) => entry.id === selectedId));
    selectByIndex(currentIndex + delta);
  }, [selectedId, selectByIndex]);

  const beginMatch = useCallback((training: boolean) => {
    if (!selectedEntry || !selectedPlayable || !selectedProfile) return;

    const playerId = resolveCombatId(selectedEntry.id);
    const opponentPool = playableEntries
      .map((entry) => resolveCombatId(entry.id))
      .filter((id) => id !== playerId && Boolean(getFighterById(id)));
    const opponentId = opponentPool[0] ?? FIGHTERS.find((fighter) => fighter.id !== playerId)?.id ?? playerId;

    resetPhase();
    setTrainingSession(training);
    setCharacter(playerId);
    setPlayerFighter(playerId);
    setOpponentFighter(opponentId);
    start();
    setGameState("playing");
  }, [selectedEntry, selectedPlayable, selectedProfile, playableEntries, resetPhase, setTrainingSession, setCharacter, setPlayerFighter, setOpponentFighter, start, setGameState]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      switch (event.code) {
        case "ArrowLeft":
        case "KeyA": event.preventDefault(); moveSelection(-1); break;
        case "ArrowRight":
        case "KeyD": event.preventDefault(); moveSelection(1); break;
        case "ArrowUp":
        case "KeyW": event.preventDefault(); moveSelection(-GRID_COLUMNS); break;
        case "ArrowDown":
        case "KeyS": event.preventDefault(); moveSelection(GRID_COLUMNS); break;
        case "Enter":
        case "Space": event.preventDefault(); beginMatch(false); break;
        case "KeyT": event.preventDefault(); beginMatch(true); break;
        case "Escape":
        case "Backspace": event.preventDefault(); setGameState("menu"); break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [beginMatch, moveSelection, setGameState]);

  useEffect(() => {
    let animationFrame = 0;
    let lastActionAt = 0;
    let previousButtons: boolean[] = [];

    const pollGamepad = (timestamp: number) => {
      const gamepad = navigator.getGamepads?.().find((pad) => pad?.connected);
      if (gamepad) {
        const pressed = gamepad.buttons.map((button) => button.pressed);
        const edge = (index: number) => Boolean(pressed[index] && !previousButtons[index]);
        const repeatReady = timestamp - lastActionAt >= GAMEPAD_REPEAT_MS;
        if (edge(0)) { beginMatch(false); lastActionAt = timestamp; }
        else if (edge(1)) { setGameState("menu"); lastActionAt = timestamp; }
        else if (edge(3)) { beginMatch(true); lastActionAt = timestamp; }
        else if (repeatReady && pressed[14]) { moveSelection(-1); lastActionAt = timestamp; }
        else if (repeatReady && pressed[15]) { moveSelection(1); lastActionAt = timestamp; }
        else if (repeatReady && pressed[12]) { moveSelection(-GRID_COLUMNS); lastActionAt = timestamp; }
        else if (repeatReady && pressed[13]) { moveSelection(GRID_COLUMNS); lastActionAt = timestamp; }
        previousButtons = pressed;
      } else {
        previousButtons = [];
      }
      animationFrame = window.requestAnimationFrame(pollGamepad);
    };

    animationFrame = window.requestAnimationFrame(pollGamepad);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [beginMatch, moveSelection, setGameState]);

  useEffect(() => {
    document.querySelector<HTMLButtonElement>(`[data-fighter-id="${CSS.escape(selectedId)}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedId]);

  const accent = selectedProfile?.accentColor ?? (selectedEntry?.role === "boss" ? "#a78bfa" : "#94a3b8");
  const base = selectedProfile?.color ?? "#111827";

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#07070d] via-purple-950/20 to-[#07070d] flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-3 sm:px-6 pt-3 sm:pt-5 pb-2 gap-3">
        <button type="button" onClick={() => setGameState("menu")} className="px-3 sm:px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white text-xs sm:text-sm font-medium" aria-label="Return to main menu">
          ← BACK
        </button>
        <div className="text-center min-w-0">
          <h1 className="text-lg sm:text-2xl font-black tracking-[0.14em] sm:tracking-[0.25em] text-white/90 uppercase truncate">Choose Your Fighter</h1>
          <p className="hidden md:block text-[10px] uppercase tracking-[0.18em] text-slate-500 mt-1">Locked Visual Baseline · Arrows/WASD · A confirm · B back · Y training</p>
        </div>
        <div className="w-16 sm:w-20" aria-hidden="true" />
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-3 lg:gap-6 px-3 sm:px-6 py-2 sm:py-4 min-h-0">
        <section className="flex-1 flex flex-col min-h-[38vh] lg:min-h-0">
          <div className="flex-1 rounded-2xl overflow-hidden border-2 relative" style={{ borderColor: `${accent}66`, boxShadow: `0 0 40px ${accent}22` }} aria-live="polite">
            {selectedProfile ? (
              <Canvas
                style={{ pointerEvents: "auto" }}
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
                gl={{ antialias: getQualitySettings().antialias, powerPreference: "high-performance" }}
              >
                <color attach="background" args={["#0b0b12"]} />
                <LegendaryLightingRig />
                <SceneEnvironment mode="sunset" />
                <CinematicPostFX grade={getGrade(selectedEntry?.id ?? "")} accent={accent} punch={selectedEntry?.id === "kai-jax" ? 0.35 : 0.18} center={[0.5, 0.44]} />
                <Suspense fallback={null}>
                  <group position={[0, -1, 0]}>
                    <GLBCharacterModel fighterId={selectedCombatId} accentColor={accent} emotionIntensity={0.5} />
                  </group>
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]} receiveShadow>
                    <planeGeometry args={[10, 10]} />
                    <shadowMaterial opacity={0.3} />
                  </mesh>
                  <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} autoRotate autoRotateSpeed={2} />
                </Suspense>
              </Canvas>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-slate-950/70">
                <div>
                  <div className="text-5xl font-black tracking-widest" style={{ color: accent }}>{selectedEntry?.displayName.slice(0, 2).toUpperCase()}</div>
                  <p className="mt-4 text-sm text-slate-300">Locked visual identity confirmed. Combat model and moveset profile still need integration.</p>
                  <p className="mt-2 text-[11px] text-slate-500">Source: {selectedEntry?.sourceSheet}</p>
                </div>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none">
              <h2 className="text-2xl sm:text-3xl font-black tracking-wider" style={{ color: accent }}>{selectedEntry?.displayName}</h2>
              <div className="mt-1 flex gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded border ${selectedEntry ? roleTone(selectedEntry.role) : ""}`}>{selectedEntry ? roleLabel(selectedEntry.role) : ""}</span>
                <span className="text-xs px-2 py-0.5 rounded border border-slate-600 text-slate-300 bg-slate-900/70">{selectedEntry ? factionLabel(selectedEntry.faction) : ""}</span>
              </div>
              {selectedProfile?.baseStats && (
                <div className="mt-3 max-w-xs grid grid-cols-3 gap-2 text-[10px] text-slate-300">
                  <span>PWR {selectedProfile.baseStats.power}</span>
                  <span>SPD {selectedProfile.baseStats.speed}</span>
                  <span>DEF {selectedProfile.baseStats.defense}</span>
                </div>
              )}
              {selectedProfile && (
                <div className="mt-3 max-w-xs pointer-events-auto">
                  <VariantSelector
                    fighterId={selectedCombatId}
                    selectedVariantId={selectedVariantId}
                    onSelect={(variantId) => setVariantByFighter((prev) => ({ ...prev, [selectedCombatId]: variantId }))}
                    playerProgress={playerProgress}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="lg:w-[25rem] max-h-[36vh] lg:max-h-none flex flex-col gap-3 overflow-y-auto pr-1" role="group" aria-label="Locked baseline fighter roster">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-2">
            {VERSUS_ROSTER.map((entry) => {
              const playable = entry.defaultUnlocked && Boolean(getCombatProfile(entry));
              return (
                <FighterCard
                  key={entry.id}
                  entry={entry}
                  selected={selectedId === entry.id}
                  playable={playable}
                  onClick={() => setSelectedId(entry.id)}
                />
              );
            })}
          </div>
        </aside>
      </main>

      <footer className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 pb-3 sm:pb-6 pt-2 px-3 sm:px-4">
        <button
          type="button"
          disabled={!selectedPlayable}
          onClick={() => beginMatch(false)}
          className="relative px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-black text-lg sm:text-xl tracking-widest text-white uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${accent}cc, ${base})`, border: `2px solid ${accent}88` }}
        >
          {selectedPlayable ? "FIGHT" : "COMBAT PROFILE LOCKED"}
        </button>
        <button
          type="button"
          disabled={!selectedPlayable}
          onClick={() => beginMatch(true)}
          className="px-6 sm:px-8 py-3 rounded-xl font-bold text-sm tracking-widest text-slate-200 uppercase border border-emerald-500/50 bg-emerald-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Training
        </button>
      </footer>
    </div>
  );
}
