import { useBattle } from "../../lib/stores/useBattle";
import { useRunner } from "../../lib/stores/useRunner";
import { useGame } from "../../lib/stores/useGame";
import { MOVES, FRAME_TIME } from "../../lib/combatSystems";

const MOVE_LABELS: Record<string, string> = {
  light1: "Light 1",
  light2: "Light 2",
  light3: "Light 3",
  heavy: "Heavy",
  skill: "Special",
};

export default function TrainingOverlay() {
  const setGameState = useRunner((s) => s.setGameState);
  const end = useGame((s) => s.end);
  const returnToMenu = useBattle((s) => s.returnToMenu);
  const timeScale = useBattle((s) => s.timeScale);
  const setTimeScale = useBattle((s) => s.setTimeScale);
  const playerAttackType = useBattle((s) => s.playerAttackType);
  const comboCount = useBattle((s) => s.comboCount);

  const handleBack = () => {
    returnToMenu();
    end();
    setGameState("menu");
  };

  const moveKey = playerAttackType === "punch" ? "light1" : playerAttackType === "kick" ? "heavy" : playerAttackType === "special" ? "skill" : null;
  const moveData = moveKey ? MOVES[moveKey] : null;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      <div className="absolute top-4 right-4 flex flex-col gap-2 max-w-xs">
        <div className="bg-slate-900/90 border border-cyan-500/50 rounded-lg p-3 text-xs">
          <div className="font-bold text-cyan-300 mb-2">Frame Data</div>
          {moveData ? (
            <div className="space-y-1 text-slate-200">
              <div>Startup: {moveData.startup}f ({(moveData.startup * FRAME_TIME * 1000).toFixed(0)}ms)</div>
              <div>Active: {moveData.active}f</div>
              <div>Recovery: {moveData.recovery}f</div>
              <div>Damage: {moveData.damage} · KB: {moveData.knockback}</div>
            </div>
          ) : (
            <div className="text-slate-400">Use J/K/L to see frame data</div>
          )}
        </div>
        <div className="bg-slate-900/90 border border-amber-500/50 rounded-lg p-3 text-xs">
          <div className="font-bold text-amber-300 mb-2">Move Reference</div>
          {Object.entries(MOVES).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2 text-slate-300">
              <span>{MOVE_LABELS[k] ?? k}</span>
              <span>{v.startup}/{v.active}/{v.recovery} · {v.damage}dmg</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setTimeScale(0.5)}
            className={`px-4 py-2 rounded-lg font-bold text-sm ${timeScale === 0.5 ? "bg-amber-500/60 text-white" : "bg-slate-700/60 text-slate-300"}`}
          >
            50% Speed
          </button>
          <button
            onClick={() => setTimeScale(1)}
            className={`px-4 py-2 rounded-lg font-bold text-sm ${timeScale === 1 ? "bg-cyan-500/60 text-white" : "bg-slate-700/60 text-slate-300"}`}
          >
            100% Speed
          </button>
        </div>
        <div className="text-slate-400 text-xs">
          Combo: {comboCount} · Time scale for lab work
        </div>
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-lg bg-slate-700/80 text-slate-200 font-bold text-sm hover:bg-slate-600/80"
        >
          Exit Training
        </button>
      </div>
    </div>
  );
}
