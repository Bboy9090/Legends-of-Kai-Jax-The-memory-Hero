import { useState } from "react";
import { useRunner } from "../../lib/stores/useRunner";
import { useBattle } from "../../lib/stores/useBattle";
import { useDifficulty, DIFFICULTY_LABELS, type Difficulty } from "../../lib/stores/useDifficulty";
import { Swords, BookOpen, Palette, ArrowLeft, Store, Settings } from "../ui/icons";
import SettingsPanel from "./SettingsPanel";

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default function MainMenu() {
  const setGameState = useRunner((s) => s.setGameState);
  const setCharacter = useRunner((s) => s.setCharacter);
  const difficulty = useDifficulty((s) => s.difficulty);
  const setDifficulty = useDifficulty((s) => s.setDifficulty);
  const totalScore = useRunner((s) => s.totalScore);
  const currency = useRunner((s) => s.currency);
  const xp = useRunner((s) => s.xp);
  const setPlayerFighter = useBattle((s) => s.setPlayerFighter);
  const [showSettings, setShowSettings] = useState(false);

  const startStoryMode = () => {
    setCharacter("kai-jax");
    setPlayerFighter("kai-jax");
    setGameState("campaign-map");
  };

  const startAdventureSelect = () => {
    setCharacter("kai-jax");
    setPlayerFighter("kai-jax");
    setGameState("adventure-select");
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-b from-[#07070d] via-purple-950/25 to-[#07070d] overflow-auto">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_24px_rgba(34,211,238,0.2)]">
          Legends of Kai-Jax
        </h1>
        <p className="mt-2 text-slate-400 text-lg md:text-xl">The Memory King</p>
        <p className="mt-1 text-slate-600 text-sm">Adventure · Campaign · Battle · Transform</p>
        {(totalScore > 0 || xp > 0 || currency > 0) && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm">
            {totalScore > 0 && (
              <span className="text-cyan-400/90 font-bold">
                Score: <span className="text-cyan-300">{totalScore.toLocaleString()}</span>
              </span>
            )}
            {xp > 0 && (
              <span className="text-amber-400/90 font-bold">
                XP: <span className="text-amber-300">{xp.toLocaleString()}</span>
              </span>
            )}
            {currency > 0 && (
              <span className="text-yellow-400/90 font-bold">
                Gold: <span className="text-yellow-300">{currency.toLocaleString()}</span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mt-4 max-w-xl">
            <button
              onClick={startAdventureSelect}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500/25 to-cyan-500/25 border-2 border-purple-400/80 text-purple-100 font-bold text-base shadow-lg shadow-purple-500/20 hover:from-purple-500/35 hover:to-cyan-500/35 hover:border-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <GlobeIcon className="w-5 h-5" />
              Adventure Mode
            </button>
            <button
              onClick={startStoryMode}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-cyan-500/25 border-2 border-cyan-400/80 text-cyan-100 font-bold text-base shadow-lg shadow-cyan-500/20 hover:bg-cyan-500/35 hover:border-cyan-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <BookOpen className="w-5 h-5" />
              Story Mode
            </button>
            <button
              onClick={() => setGameState("mission-select")}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-amber-500/25 border-2 border-amber-400/70 text-amber-100 font-bold text-base shadow-lg shadow-amber-500/20 hover:bg-amber-500/35 hover:border-amber-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Swords className="w-5 h-5" />
              Challenge Mode
            </button>
            <button
              onClick={() => setGameState("versus-select")}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-700/60 border-2 border-slate-500 text-slate-200 font-bold text-base hover:bg-slate-600/60 hover:border-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Swords className="w-5 h-5" />
              Versus
            </button>
            <button
              onClick={() => setGameState("beast-preview")}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-800/50 border-2 border-slate-600 text-slate-300 font-medium text-base hover:border-lime-400/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Palette className="w-5 h-5" />
              Beast Preview
            </button>
            <button
              onClick={() => setGameState("shop")}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-amber-500/20 border-2 border-amber-400/60 text-amber-200 font-bold text-base hover:bg-amber-500/30 hover:border-amber-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Store className="w-5 h-5" />
              Unlocks
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-slate-500 text-sm">Difficulty:</span>
            {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  difficulty === d
                    ? "bg-cyan-500/30 border border-cyan-400/60 text-cyan-100"
                    : "bg-slate-800/60 border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500"
                }`}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 text-slate-500 text-sm hover:text-cyan-400 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => setGameState("lore-hub")}
              className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Hub
            </button>
          </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <SettingsPanel onClose={() => setShowSettings(false)} variant="modal" />
        </div>
      )}
    </div>
  );
}
