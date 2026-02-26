import { useRunner } from "../../lib/stores/useRunner";
import { useBattle } from "../../lib/stores/useBattle";
import { getAdventureMissions, FREE_ARENA_ID } from "../../lib/adventure_missions";

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default function AdventureModeSelect() {
  const setGameState = useRunner((s) => s.setGameState);
  const setCharacter = useRunner((s) => s.setCharacter);
  const setActiveAdventureMission = useRunner((s) => s.setActiveAdventureMission);
  const setPlayerFighter = useBattle((s) => s.setPlayerFighter);

  const missions = getAdventureMissions();

  const launchAdventure = (missionId: string, heroId: string) => {
    setCharacter(heroId);
    setPlayerFighter(heroId);
    setActiveAdventureMission(missionId);
    setGameState("adventure");
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-b from-[#07070d] via-purple-950/25 to-[#07070d] overflow-auto">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_24px_rgba(34,211,238,0.2)]">
          Adventure Mode
        </h1>
        <p className="mt-2 text-slate-400 text-lg md:text-xl">Forged in the Raging City. Fight through the districts.</p>
        <p className="mt-1 text-slate-500 text-sm">Wave combat · Objectives · Same kernel as Versus</p>
      </div>

      <div className="w-full max-w-2xl space-y-4">
        {missions.map((mission) => {
          const isFree = mission.id === FREE_ARENA_ID;
          const goalLabel =
            mission.goalType === "free"
              ? "Endless"
              : mission.goalType === "eliminate"
                ? `${mission.goalValue} KOs`
                : `${mission.goalValue}s survive`;

          return (
            <div
              key={mission.id}
              className="rounded-xl border-2 p-4 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                borderColor: isFree ? "#22d3ee88" : "#a855f788",
                background: isFree ? "linear-gradient(180deg, #22d3ee15, #0b102060)" : "linear-gradient(180deg, #a855f715, #1a0a2e60)",
              }}
              onClick={() => launchAdventure(mission.id, "kai-jax")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-xl font-bold text-white">{mission.title}</h2>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        background: mission.goalType === "free" ? "#22d3ee33" : "#a855f733",
                        color: mission.goalType === "free" ? "#22d3ee" : "#a855f7",
                      }}
                    >
                      {goalLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-400 text-sm">{mission.description}</p>
                  <ul className="mt-2 space-y-0.5">
                    {mission.objectives.slice(0, 2).map((obj, i) => (
                      <li key={i} className="text-slate-500 text-xs flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-cyan-400" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                  {mission.rewards.xp > 0 && (
                    <div className="mt-2 flex gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">+{mission.rewards.xp} XP</span>
                      <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-300">+{mission.rewards.currency} Gold</span>
                    </div>
                  )}
                </div>
                <div
                  className="px-4 py-2 rounded-lg font-bold text-sm"
                  style={{
                    background: isFree ? "#22d3ee22" : "#a855f722",
                    color: isFree ? "#22d3ee" : "#a855f7",
                    border: `1px solid ${isFree ? "#22d3ee55" : "#a855f755"}`,
                  }}
                >
                  Play
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setGameState("menu")}
        className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
      >
        ← Back to Menu
      </button>
    </div>
  );
}
