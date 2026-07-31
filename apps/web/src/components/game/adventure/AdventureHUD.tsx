import { useAdventure } from "../../../lib/stores/useAdventure";
import { useRunner } from "../../../lib/stores/useRunner";
import { useGame } from "../../../lib/stores/useGame";
import { CombatState } from "../../../game/combat/stateEnums";
import { STAMINA_CONFIG } from "../../../game/tuning/adventureTuning";
import { getDistrictMeta } from "../../../lib/encounters";
import { useMissions } from "../../../lib/stores/useMissions";
import { ASHBLOCK_OBJECTIVE_BLURBS } from "../../../game/world/zones/AshblockHeights/AshblockHeightsNarrative";
import MoveListOverlay from "../MoveListOverlay";
import { useState, useEffect } from "react";
import { isTouchDevice } from "../../../lib/touchUtils";

function HealthBar({
  current,
  max,
  color,
  label,
  flashLow,
}: {
  current: number;
  max: number;
  color: string;
  label: string;
  flashLow?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const isLow = flashLow && pct < 25;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-slate-400 w-6">{label}</span>
      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-200 ${isLow ? "animate-pulse" : ""}`}
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
      <span className="text-xs font-mono text-slate-300 w-12 text-right">
        {Math.ceil(current)}
      </span>
    </div>
  );
}

function StaminaBar({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const exhausted = current < STAMINA_CONFIG.exhaustedThreshold;
  const color = exhausted ? "#ef4444" : "#a855f7";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-slate-400 w-6">SP</span>
      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-200 ${exhausted ? "animate-pulse" : ""}`}
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
      <span className={`text-xs font-mono w-12 text-right ${exhausted ? "text-red-400" : "text-slate-300"}`}>
        {Math.ceil(current)}
      </span>
    </div>
  );
}

function ComboDisplay({ step, state }: { step: number; state: CombatState }) {
  if (step <= 0 || state !== CombatState.ATTACKING) return null;
  const comboNum = step + 1;
  return (
    <div className="absolute top-1/4 right-8 text-right">
      <div
        className="text-5xl font-black text-transparent bg-clip-text animate-pulse"
        style={{
          backgroundImage: "linear-gradient(135deg, #00f2ff, #7f00ff)",
        }}
      >
        {comboNum}x
      </div>
      <div className="text-sm font-bold text-cyan-300 tracking-widest">
        COMBO
      </div>
    </div>
  );
}

function AutoTargetIndicator({ targetId, enemies }: { targetId: string | null; enemies: any[] }) {
  if (!targetId) return null;
  const target = enemies.find((e: any) => e.id === targetId);
  if (!target || target.isDead) return null;
  const hpPct = Math.max(0, (target.health / target.maxHealth) * 100);
  const isBoss = target.tier === "boss1" || target.tier === "boss2";
  const isTelegraphing = target.aiState === "telegraph";
  const label = isBoss ? "⚠ BOSS" : "TARGET";
  const accent = isBoss ? "#f59e0b" : "#ef4444";
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
      {/* Attack telegraph warning — enemy is winding up */}
      {isTelegraphing && (
        <div className="text-[11px] font-black uppercase tracking-widest text-amber-300 animate-pulse">
          ⚡ Incoming — dodge!
        </div>
      )}
      <div
        className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-1.5 flex items-center gap-3 min-w-[180px]"
        style={{ border: `1px solid ${accent}55` }}
      >
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
        <div className="flex-1">
          <div
            className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
            style={{ color: accent }}
          >
            {label}
          </div>
          <div className={`h-1.5 bg-slate-800 rounded-full overflow-hidden ${isBoss ? "border border-amber-500/40" : ""}`}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${hpPct}%`,
                background: isBoss
                  ? "linear-gradient(90deg, #f59e0b, #dc2626)"
                  : "linear-gradient(90deg, #ef4444, #dc2626)",
              }}
            />
          </div>
        </div>
        <span className="text-[10px] font-mono" style={{ color: accent }}>{Math.ceil(target.health)}</span>
      </div>
    </div>
  );
}

function ImpactFlash({ color }: { color: string | null }) {
  if (!color) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none z-50"
      style={{
        background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
        animation: "fadeOut 0.15s ease-out forwards",
      }}
    />
  );
}

function CombatStateLabel({ state }: { state: CombatState }) {
  if (state === CombatState.FREE) return null;
  const labels: Record<CombatState, { text: string; color: string }> = {
    [CombatState.ATTACKING]: { text: "ATTACKING", color: "#00f2ff" },
    [CombatState.DODGING]: { text: "DODGE!", color: "#22c55e" },
    [CombatState.HITSTUN]: { text: "STUNNED", color: "#ef4444" },
    [CombatState.BLOCKING]: { text: "BLOCK", color: "#eab308" },
    [CombatState.FREE]: { text: "", color: "" },
  };
  const label = labels[state];
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div
        className="text-2xl font-black uppercase tracking-wider opacity-70"
        style={{ color: label.color, textShadow: `0 0 12px ${label.color}66` }}
      >
        {label.text}
      </div>
    </div>
  );
}

let hardQuitInProgress = false;

function forcePersistedRunnerHubState() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("kai-jax-save");
    if (!raw) return;
    const saved = JSON.parse(raw) as { state?: Record<string, unknown>; version?: number };
    const next = {
      ...saved,
      state: {
        ...(saved.state ?? {}),
        gameState: "lore-hub",
        activeStoryMissionId: null,
        trainingSession: false,
      },
    };
    window.localStorage.setItem("kai-jax-save", JSON.stringify(next));
  } catch (error) {
    console.warn("[AdventureHUD] Failed to force persisted hub state", error);
  }
}

function hardQuitAdventureSession() {
  if (hardQuitInProgress) return;
  hardQuitInProgress = true;

  useAdventure.getState().reset();
  useGame.getState().reset();
  useRunner.getState().setActiveStoryMission(null);
  useRunner.getState().setTrainingSession(false);
  useRunner.getState().setGameState("lore-hub");

  // Belt-and-suspenders: force the persisted runner state to the landing hub too.
  useRunner.setState({
    gameState: "lore-hub",
    activeStoryMissionId: null,
    trainingSession: false,
  });
  forcePersistedRunnerHubState();

  // Final emergency exit for stuck overlays/canvases. The state above is saved first.
  window.setTimeout(() => {
    window.location.assign("/");
  }, 75);
}

export default function AdventureHUD() {
  const player = useAdventure((s) => s.player);
  const enemies = useAdventure((s) => s.enemies);
  const waveCount = useAdventure((s) => s.waveCount);
  const enemiesDefeated = useAdventure((s) => s.enemiesDefeated);
  const roamDistrictId = useAdventure((s) => s.roamDistrictId);
  const encounterIndex = useAdventure((s) => s.encounterIndex);
  const districtCompleted = useAdventure((s) => s.districtCompleted);
  const trainingSession = useRunner((s) => s.trainingSession);
  const isPaused = useAdventure((s) => s.isPaused);
  const [showMoves, setShowMoves] = useState(trainingSession);
  const [touchCapable] = useState(() => isTouchDevice());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Tab") {
        e.preventDefault();
        setShowMoves((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isPaused) return;
    const handlePausedKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyQ") {
        e.preventDefault();
        e.stopPropagation();
        hardQuitAdventureSession();
      }
    };
    window.addEventListener("keydown", handlePausedKeyDown, true);
    return () => window.removeEventListener("keydown", handlePausedKeyDown, true);
  }, [isPaused]);

  const districtMeta = roamDistrictId ? getDistrictMeta(roamDistrictId) : null;
  const lastReward = useMissions((s) => s.lastReward);

  const aliveEnemies = enemies.filter((e) => !e.isDead).length;

  if (isPaused) {
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[9999] pointer-events-auto">
        <div className="text-center space-y-6 pointer-events-auto">
          <h2 className="text-4xl font-black text-white tracking-tight">
            PAUSED
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => useAdventure.getState().togglePause()}
              className="block w-48 mx-auto px-6 py-4 rounded-2xl bg-cyan-500 border-2 border-cyan-300 text-white font-bold hover:bg-cyan-600 active:bg-cyan-700 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/75"
            >
              Resume
            </button>
            <button
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                hardQuitAdventureSession();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                hardQuitAdventureSession();
              }}
              className="block w-56 mx-auto px-6 py-4 rounded-2xl bg-red-600 border-2 border-red-400 text-white font-black hover:bg-red-700 active:bg-red-800 transition-all shadow-lg shadow-red-600/50 hover:shadow-red-600/75"
            >
              Force Quit to Hub
            </button>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Press Q here if the button refuses to behave.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const playerHpPct = player.maxHealth > 0 ? (player.health / player.maxHealth) * 100 : 100;
  const isCritical = !trainingSession && playerHpPct > 0 && playerHpPct < 25;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <ImpactFlash color={player.impactFlash} />

      {/* Critical low-health vignette (mirrors versus danger feedback) */}
      {isCritical && (
        <div
          className="absolute inset-0 pointer-events-none z-10 animate-pulse"
          style={{ boxShadow: "inset 0 0 120px 40px rgba(239,68,68,0.4)" }}
        />
      )}

      {trainingSession && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="bg-amber-500/80 text-white px-4 py-1 rounded-full font-black text-xs tracking-[0.2em] border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            TRAINING MODE - IMMORTAL
          </div>
          <div className="text-[10px] text-amber-200/60 font-bold uppercase tracking-widest animate-pulse">
            Press [TAB] to toggle move list
          </div>
        </div>
      )}

      {showMoves && (
        <div className="absolute top-1/2 left-8 -translate-y-1/2 pointer-events-auto">
          <MoveListOverlay />
        </div>
      )}

      <div className="absolute top-4 left-4 right-4 pointer-events-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="w-64 space-y-1 bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
            <HealthBar
              current={player.health}
              max={player.maxHealth}
              color="#22d3ee"
              label="HP"
              flashLow
            />
            <StaminaBar current={player.stamina} max={player.maxStamina} />
          </div>

          <div className="flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-700/50">
            <div className="text-center">
              <div className="text-xs text-slate-400">{districtMeta ? "Encounter" : "Wave"}</div>
              <div className="text-lg font-black text-cyan-300">
                {districtMeta
                  ? districtCompleted
                    ? "Done"
                    : `${Math.min(encounterIndex + 1, districtMeta.encounters.length)}/${districtMeta.encounters.length}`
                  : waveCount}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <div className="text-xs text-slate-400">Enemies</div>
              <div className="text-lg font-black text-red-400">{aliveEnemies}</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <div className="text-xs text-slate-400">KOs</div>
              <div className="text-lg font-black text-green-400">{enemiesDefeated}</div>
            </div>
          </div>
        </div>
      </div>

      {districtMeta && (
        <div className="absolute top-20 left-4 max-w-xs bg-black/55 backdrop-blur-sm rounded-lg px-3 py-2 border border-cyan-500/25 pointer-events-none">
          <div className="text-[10px] text-cyan-300/90 font-bold uppercase tracking-wider">{districtMeta.name}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{districtMeta.theme}</div>
          {roamDistrictId === "district-1" && !districtCompleted && districtMeta.encounters[encounterIndex] && (
            <div className="text-[11px] text-slate-300/95 mt-1.5 italic border-t border-white/10 pt-1.5">
              {ASHBLOCK_OBJECTIVE_BLURBS[Math.min(encounterIndex, ASHBLOCK_OBJECTIVE_BLURBS.length - 1)]}
            </div>
          )}
          {districtCompleted && (
            <div className="text-xs text-emerald-400 font-bold mt-1 space-y-1">
              <div>District cleared — exit via pause menu.</div>
              {lastReward?.granted && lastReward.totalPoints > 0 && (
                <div className="text-cyan-200/90 font-mono text-[11px]">
                  +{lastReward.totalPoints} score (first clear)
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ComboDisplay step={player.comboStep} state={player.combatState} />
      <CombatStateLabel state={player.combatState} />
      <AutoTargetIndicator targetId={player.autoTargetId} enemies={enemies} />

      {!touchCapable && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <div className="inline-flex gap-3 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-700/50 text-slate-400 text-xs">
            <span>WASD move</span>
            <span className="text-slate-600">|</span>
            <span>J attack</span>
            <span className="text-slate-600">|</span>
            <span>K heavy</span>
            <span className="text-slate-600">|</span>
            <span>L skill</span>
            <span className="text-slate-600">|</span>
            <span>Space dodge</span>
            <span className="text-slate-600">|</span>
            <span>Esc pause</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
