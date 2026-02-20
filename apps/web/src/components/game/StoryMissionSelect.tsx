import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, BookOpen, Swords, Zap } from "../ui/icons";
import { getStoryMissionById, getStoryMissionsByAct } from "../../lib/story_missions";

interface StoryMissionSelectProps {
  onSelectMission: (missionId: string) => void;
  onBack: () => void;
  completedMissions: string[];
  embedded?: boolean;
}

export default function StoryMissionSelect({
  onSelectMission,
  onBack,
  completedMissions,
  embedded = false,
}: StoryMissionSelectProps) {
  const [act, setAct] = useState<1 | 2 | 3>(1);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const missions = useMemo(() => getStoryMissionsByAct(act), [act]);
  const selectedMission = selectedMissionId ? getStoryMissionById(selectedMissionId) : null;

  const isCompleted = (id: string) => completedMissions.includes(id);

  const content = (
    <>
      {!embedded && (
        <>
          <div className="text-center mb-8">
            <p className="text-amber-300/90 text-sm sm:text-base font-semibold tracking-[0.2em] uppercase mb-1">
              Story Mode
            </p>
            <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-amber-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent mb-2">
              Beast Wars Campaign
            </h1>
            <p className="text-sm text-cyan-200/80">
              Adventure missions with narrative, dialogue, and epic boss battles.
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </>
      )}

      <div className="flex gap-2 mb-6">
        {([1, 2, 3] as const).map((a) => (
          <button
            key={a}
            onClick={() => {
              setAct(a);
              setSelectedMissionId(null);
            }}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {missions.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMissionId(m.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                selectedMissionId === m.id
                  ? "bg-purple-500/20 border-purple-300 shadow-[0_0_20px_rgba(196,181,253,0.35)]"
                  : isCompleted(m.id)
                    ? "bg-green-900/25 border-green-400/60"
                    : "bg-slate-900/60 border-slate-700 hover:border-purple-400/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white">
                  {m.missionNumber}. {m.name}
                </span>
                {isCompleted(m.id) && (
                  <span className="text-green-300" aria-hidden>
                    ✓
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                Diff {m.difficulty} • ADVENTURE • {m.enemyWaves.length} wave{m.enemyWaves.length > 1 ? "s" : ""}
              </div>
            </button>
          ))}
        </div>

        {selectedMission && (
          <Card className="bg-slate-900/80 border-2 border-purple-400/50 shadow-[0_0_30px_rgba(196,181,253,0.18)]">
            <CardHeader>
              <CardTitle className="text-xl text-purple-200 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {selectedMission.title}
              </CardTitle>
              <p className="text-slate-300 text-sm">{selectedMission.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="rounded-lg bg-black/30 border border-white/10 p-3">
                  <div className="text-slate-400 mb-1">Story Beat</div>
                  <div>{selectedMission.storyBeat}</div>
                </div>
                <div className="rounded-lg bg-black/30 border border-white/10 p-3">
                  <div className="text-slate-400 mb-1">Enemy Waves</div>
                  <div>{selectedMission.enemyWaves.length} wave{selectedMission.enemyWaves.length > 1 ? "s" : ""}{selectedMission.bossId ? " (includes boss)" : ""}</div>
                </div>
              </div>

              {selectedMission.introCutscene.length > 0 && (
                <div className="rounded-lg bg-black/30 border border-white/10 p-3">
                  <div className="text-slate-400 text-xs mb-1">Dialogue Preview</div>
                  <p className="text-slate-300 text-sm italic">"{selectedMission.introCutscene[0].text}"</p>
                  <p className="text-slate-500 text-xs mt-1">— {selectedMission.introCutscene[0].speaker}</p>
                </div>
              )}

              <div>
                <h4 className="text-purple-200 font-semibold mb-2 flex items-center gap-2">
                  <Swords className="w-4 h-4" />
                  Objectives
                </h4>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {selectedMission.objectives.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300">
                  +{selectedMission.rewards.xp} XP
                </span>
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-300">
                  +{selectedMission.rewards.currency} Gold
                </span>
                {selectedMission.rewards.loot.map((l) => (
                  <span key={l} className="px-2 py-1 rounded bg-purple-500/20 text-purple-200">
                    {l}
                  </span>
                ))}
              </div>

              <Button
                onClick={() => onSelectMission(selectedMission.id)}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-4"
              >
                <Zap className="w-4 h-4 mr-2" />
                Begin Adventure Mission
              </Button>
            </CardContent>
          </Card>
        )}
    </>
  );

  if (embedded) return <div className="text-white">{content}</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#070812] via-indigo-950/35 to-[#070812] text-white p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">{content}</div>
    </div>
  );
}
