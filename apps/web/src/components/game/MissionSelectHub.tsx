import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Swords } from "../ui/icons";
import { useBattle } from "../../lib/stores/useBattle";
import { useGame } from "../../lib/stores/useGame";
import { useMissions } from "../../lib/stores/useMissions";
import { useRunner } from "../../lib/stores/useRunner";
import { FIGHTERS, getFighterById } from "../../lib/characters";
import { getStoryMissionById } from "../../lib/story_missions";
import UEEMissionSelect from "./UEEMissionSelect";
import StoryMissionSelect from "./StoryMissionSelect";
import CharacterPreview3D from "./CharacterPreview3D";

type Tab = "story" | "uee";

function pickRandomOpponent(excludeId: string): string {
  const ids = FIGHTERS.map((f) => f.id).filter((id) => id !== excludeId);
  return ids[Math.floor(Math.random() * ids.length)] || excludeId;
}

export default function MissionSelectHub() {
  const { setGameState, selectedCharacter, setCharacter } = useRunner();
  const { start } = useGame();
  const { setArena, setPlayerFighter, setOpponentFighter } = useBattle();
  const { completedKeys, startMission } = useMissions();

  const [tab, setTab] = useState<Tab>("story");
  const missionCharacter = useMemo(
    () => getFighterById(selectedCharacter ?? FIGHTERS[0]?.id ?? ""),
    [selectedCharacter]
  );

  const completedStory = useMemo(
    () => completedKeys.filter((k) => k.startsWith("story:")).map((k) => k.slice("story:".length)),
    [completedKeys]
  );
  const completedUEE = useMemo(
    () => completedKeys.filter((k) => k.startsWith("uee:")).map((k) => k.slice("uee:".length)),
    [completedKeys]
  );

  const beginMission = (source: "story" | "uee", id: string) => {
    let playerId = selectedCharacter as unknown as string;

    if (source === "story") {
      const m = getStoryMissionById(id);
      const required = m?.requiredCharacters ?? [];
      const playableRequired = required.find((cid) => !!getFighterById(cid));
      if (playableRequired) playerId = playableRequired;

      setCharacter(playerId as any);
      setPlayerFighter(playerId);
      startMission(source, id);
      useRunner.getState().setActiveStoryMission(id);
      setGameState("story-mode");
      return;
    }

    startMission(source, id);

    const active = useMissions.getState().active;
    if (active?.arenaId) setArena(active.arenaId);

    setCharacter(playerId as any);
    setPlayerFighter(playerId);
    setOpponentFighter(pickRandomOpponent(playerId));

    start();
    setGameState("playing");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#07070d] via-purple-950/30 to-[#07070d] text-white p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setGameState("menu")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-600 bg-slate-900/60 hover:border-cyan-400/60 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-300" />
              <span className="font-bold">Back</span>
            </button>
            {missionCharacter && (
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-600 bg-black/40 overflow-hidden">
                <div className="w-[120px] h-[80px] flex-shrink-0">
                  <CharacterPreview3D fighter={missionCharacter} />
                </div>
                <div className="px-3 py-1 text-sm text-slate-300">
                  <span className="font-bold text-white">{missionCharacter.displayName}</span>
                  <br />
                  <span>Ready for battle</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("story")}
              className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
                tab === "story"
                  ? "bg-indigo-500/20 border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
                  : "bg-slate-900/60 border-slate-600 hover:border-indigo-400/60"
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-200" />
              <span className="font-bold">Story</span>
            </button>
            <button
              onClick={() => setTab("uee")}
              className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
                tab === "uee"
                  ? "bg-cyan-500/20 border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                  : "bg-slate-900/60 border-slate-600 hover:border-cyan-400/60"
              }`}
            >
              <Swords className="w-4 h-4 text-cyan-200" />
              <span className="font-bold">UEE</span>
            </button>
          </div>
        </div>

        {tab === "story" ? (
          <StoryMissionSelect
            embedded
            onBack={() => setGameState("menu")}
            completedMissions={completedStory}
            onSelectMission={(missionId) => beginMission("story", missionId)}
          />
        ) : (
          <UEEMissionSelect
            embedded
            onBack={() => setGameState("menu")}
            completedMissions={completedUEE}
            onSelectMission={(missionId) => beginMission("uee", missionId)}
          />
        )}
      </div>
    </div>
  );
}

