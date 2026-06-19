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
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2">
      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-1.5 border border-red-500/30 flex items-center gap-3 min-w-[180px]">
        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        <div className="flex-1">
          <div className="text-[10px] text-red-300 font-bold uppercase tracking-wider mb-0.5">TARGET</div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${hpPct}%`,
                background: "linear-gradient(90deg, #ef4444, #dc2626)",
              }}
            />
          </div>
        </div>
        <span className="text-[10px] font-mono text-red-300">{Math.ceil(target.health)}</span>
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

function hardQuitAdventureSession() {
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

  const districtMeta = roamDistrictId ? getDistrictMeta(roamDistrictId) : null;
  const lastReward = useMissions((s) => s.lastReward);

  const aliveEnemies = enemies.filter((e) => !e.isDead).length;

  if (isPaused) {
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-auto">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-black text-white tracking-tight">
            PAUSED
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => useAdventure.getState().togglePause()}
              className="block w-48 mx-auto px-6 py-3 rounded-xl bg-cyan-500/20 border-2 border-cyan-400 text-cyan-100 font-bold hover:bg-cyan-500/30 transition-all"
            >
              Resume
            </button>
            <button
              onClick={hardQuitAdventureSession}
              className="block w-48 mx-auto px-6 py-3 rounded-xl bg-slate-700/60 border-2 border-slate-500 text-slate-200 font-bold hover:bg-slate-600/60 transition-all"
            >
              Quit to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <ImpactFlash color={player.impactFlash} />

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

      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
