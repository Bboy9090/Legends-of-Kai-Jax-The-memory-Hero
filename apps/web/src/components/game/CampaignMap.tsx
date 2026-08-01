import { useState, useMemo } from "react";
import { useRunner } from "../../lib/stores/useRunner";
import { useBattle } from "../../lib/stores/useBattle";
import { useMissions } from "../../lib/stores/useMissions";
import { getStoryMissionsByAct, type StoryMission } from "../../lib/story_missions";
import { BookOpen, Swords, ArrowLeft, ChevronRight, Skull } from "../ui/icons";

export default function CampaignMap() {
  const { setGameState, selectedCharacter } = useRunner();
  const setPlayerFighter = useBattle((s) => s.setPlayerFighter);
  const completedKeys = useMissions((s) => s.completedKeys);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [act, setAct] = useState<number>(1);

  const completedMissions = useMemo(
    () => completedKeys.filter((k) => k.startsWith("story:")).map((k) => k.replace("story:", "")),
    [completedKeys]
  );

  const missions = useMemo(() => getStoryMissionsByAct(act), [act]);
  const selected = missions.find((m) => m.id === selectedMissionId) || null;

  const isCompleted = (id: string) => completedMissions.includes(id);
  const isUnlocked = (m: StoryMission, index: number) => {
    if (index === 0) return true;
    const prev = missions[index - 1];
    return prev ? isCompleted(prev.id) : true;
  };

  const setActiveStoryMission = useRunner((s) => s.setActiveStoryMission);
  const startMission = useMissions((s) => s.startMission);

  const launchMission = (missionId: string) => {
    const charId = selectedCharacter || "kai-jax";
    setPlayerFighter(charId);
    startMission("story", missionId);
    setActiveStoryMission(missionId);
    setGameState("story-mode");
  };

  return (
    <div
      className="h-screen w-full p-6 overflow-auto text-white"
      style={{
        background: "linear-gradient(160deg, #0a0a1a 0%, #1a0a2e 50%, #0d0d1a 100%)",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))"
      }}
    >
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setGameState("menu")}
          className="mb-6 px-4 py-2.5 rounded-xl border-2 border-slate-600 bg-slate-900/60 text-slate-300 hover:border-cyan-400/60 hover:bg-slate-800/60 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>

        <div className="text-center mb-8">
          <p className="text-amber-300/80 text-xs font-semibold tracking-[0.3em] uppercase mb-1">Story Mode</p>
          <h1 className="text-4xl font-black bg-gradient-to-r from-amber-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent mb-2">
            Legends of Kai-Jax Campaign
          </h1>
          <p className="text-slate-400 text-sm">
            Follow Kai-Jax's journey to reclaim stolen memories through adventure combat missions.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <span className="text-slate-500 text-sm">Progress</span>
          <div className="flex-1 h-2 max-w-[240px] bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedMissions.length / missions.length) * 100}%` }}
            />
          </div>
          <span className="text-cyan-300 font-bold tabular-nums text-sm">{completedMissions.length} / {missions.length}</span>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((a) => (
            <button
              key={a}
              onClick={() => { setAct(a); setSelectedMissionId(null); }}
              className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                act === a
                  ? "bg-amber-500/20 border-amber-300 shadow-[0_0_18px_rgba(253,230,138,0.25)]"
                  : "bg-slate-900/60 border-slate-700 hover:border-amber-400/40"
              }`}
            >
              ACT {a}
            </button>
          ))}
        </div>

        <div className="space-y-2 mb-8">
          {missions.map((m, index) => {
            const completed = isCompleted(m.id);
            const unlocked = isUnlocked(m, index);
            const isSelected = selectedMissionId === m.id;
            const isBoss = !!m.bossId;

            return (
              <button
                key={m.id}
                onClick={() => unlocked ? setSelectedMissionId(isSelected ? null : m.id) : undefined}
                disabled={!unlocked}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  isSelected
                    ? "bg-purple-500/20 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                    : completed
                      ? "bg-green-900/25 border-green-500/50"
                      : unlocked
                        ? "bg-slate-800/60 border-slate-600 hover:border-cyan-400/60 hover:bg-slate-700/60"
                        : "bg-slate-900/40 border-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 border border-slate-600">
                  {isBoss ? (
                    <Skull className="w-5 h-5 text-amber-400" />
                  ) : (
                    <span className="text-cyan-400 font-bold text-sm">{m.missionNumber}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold flex items-center gap-2">
                    {m.title}
                    {isBoss && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 uppercase">Boss</span>}
                    {completed && <span className="text-green-400">✓</span>}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{m.storyBeat}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < m.difficulty ? "bg-red-400" : "bg-slate-700"}`} />
                    ))}
                  </div>
                  {unlocked && <ChevronRight className="w-4 h-4 text-slate-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="bg-slate-900/80 border-2 border-purple-400/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-purple-300" />
              <h2 className="text-xl font-bold text-purple-200">{selected.title}</h2>
            </div>
            <p className="text-slate-300 text-sm mb-4">{selected.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                <div className="text-slate-400 mb-1">Story Beat</div>
                <div className="text-slate-200">{selected.storyBeat}</div>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                <div className="text-slate-400 mb-1">Enemy Waves</div>
                <div className="text-slate-200">{selected.enemyWaves.length} wave{selected.enemyWaves.length > 1 ? "s" : ""}</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-purple-200 font-semibold text-sm mb-2 flex items-center gap-2">
                <Swords className="w-4 h-4" />
                Objectives
              </h4>
              <ul className="space-y-1">
                {selected.objectives.map((o, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 text-xs mb-4">
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300">+{selected.rewards.xp} XP</span>
              <span className="px-2 py-1 rounded bg-green-500/20 text-green-300">+{selected.rewards.currency} Gold</span>
            </div>

            {selected.introCutscene.length > 0 && (
              <div className="mb-4 bg-black/30 border border-white/10 rounded-lg p-3">
                <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Preview</div>
                <p className="text-slate-300 text-xs italic">"{selected.introCutscene[0].text}"</p>
                <p className="text-slate-500 text-[10px] mt-1">— {selected.introCutscene[0].speaker}</p>
              </div>
            )}

            <button
              onClick={() => launchMission(selected.id)}
              className="w-full min-h-[44px] py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Swords className="w-5 h-5" />
              Begin Mission
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
