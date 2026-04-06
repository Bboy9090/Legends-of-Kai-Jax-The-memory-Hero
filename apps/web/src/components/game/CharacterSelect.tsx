import { useState, useMemo } from "react";
import { useGame } from "../../lib/stores/useGame";
import { useRunner } from "../../lib/stores/useRunner";
import { useBattle } from "../../lib/stores/useBattle";
import { FIGHTERS, getFighterById } from "../../lib/characters";
import CharacterPreview3D from "./CharacterPreview3D";

export default function CharacterSelect() {
  const start = useGame((s) => s.start);
  const resetPhase = useGame((s) => s.reset);
  const setGameState = useRunner((s) => s.setGameState);
  const setCharacter = useRunner((s) => s.setCharacter);
  const selectedCharacter = useRunner((s) => s.selectedCharacter);
  const setPlayerFighter = useBattle((s) => s.setPlayerFighter);
  const setOpponentFighter = useBattle((s) => s.setOpponentFighter);

  const [previewId, setPreviewId] = useState<string | null>(selectedCharacter ?? FIGHTERS[0]?.id ?? null);
  const previewFighter = useMemo(
    () => getFighterById(previewId ?? FIGHTERS[0]?.id ?? ""),
    [previewId]
  );

  const pick = (fighterId: string) => {
    resetPhase();
    setCharacter(fighterId);
    setPlayerFighter(fighterId);
    const others = FIGHTERS.map((f) => f.id).filter((id) => id !== fighterId);
    setOpponentFighter(others[Math.floor(Math.random() * others.length)] ?? fighterId);
    start();
    setGameState("playing");
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 bg-gradient-to-b from-[#07070d] via-purple-950/30 to-[#07070d] flex flex-col lg:flex-row gap-6">
      <div className="flex flex-col flex-1 min-w-0">
        <h2 className="text-2xl font-bold text-white mb-4">Select Fighter</h2>
        <p className="text-slate-400 text-sm mb-4">
          Pick your fighter to battle with across all game modes.
        </p>
        <div className="flex flex-wrap gap-3">
          {FIGHTERS.map((f) => {
            const fighter = getFighterById(f.id);
            if (!fighter) return null;
            const isPreview = (previewId ?? FIGHTERS[0]?.id) === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setPreviewId(f.id)}
                onDoubleClick={() => pick(f.id)}
                className={`px-5 py-3 rounded-xl border-2 font-bold text-white transition-all hover:scale-105 ${
                  isPreview ? "ring-2 ring-white/60 ring-offset-2 ring-offset-[#07070d]" : ""
                }`}
                style={{
                  background: `linear-gradient(135deg, ${fighter.color}, ${fighter.accentColor})`,
                  borderColor: isPreview ? "#fff" : fighter.accentColor,
                }}
              >
                {fighter.displayName}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => previewId && pick(previewId)}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold border-2 border-cyan-400"
          >
            Fight with {previewFighter?.displayName ?? "Fighter"}
          </button>
          <button
            onClick={() => setGameState("menu")}
            className="px-6 py-3 rounded-xl border-2 border-slate-500 text-slate-300 hover:border-slate-400"
          >
            Back
          </button>
        </div>
      </div>
      <div className="w-full lg:w-[380px] h-[320px] rounded-xl overflow-hidden border-2 border-slate-600 bg-black/40 flex-shrink-0">
        {previewFighter && (
          <CharacterPreview3D fighter={previewFighter} />
        )}
      </div>
    </div>
  );
}
