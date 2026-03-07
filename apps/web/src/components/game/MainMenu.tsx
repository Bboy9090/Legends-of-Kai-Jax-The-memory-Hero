import { useState } from "react";
import { useRunner } from "../../lib/stores/useRunner";
import { useBattle } from "../../lib/stores/useBattle";
import { HERO_FIGHTERS } from "../../lib/characters";
import { Swords, BookOpen, Palette, ArrowLeft } from "../ui/icons";

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
  const setPlayerFighter = useBattle((s) => s.setPlayerFighter);
  const [showHeroPicker, setShowHeroPicker] = useState(false);

  const startStoryMode = () => {
    setCharacter("kai-jax");
    setPlayerFighter("kai-jax");
    setGameState("campaign-map");
  };

  const launchAdventure = (heroId: string) => {
    setCharacter(heroId);
    setPlayerFighter(heroId);
    setGameState("adventure");
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-b from-[#07070d] via-purple-950/25 to-[#07070d] overflow-auto">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_24px_rgba(34,211,238,0.2)]">
          Legends of Kai-Jax
        </h1>
        <p className="mt-2 text-slate-400 text-lg md:text-xl">The Memory King</p>
        <p className="mt-1 text-slate-600 text-sm">Adventure · Campaign · Battle · Transform</p>
      </div>

      {showHeroPicker ? (
        <div className="flex flex-col items-center gap-4 mt-2">
          <h2 className="text-xl font-bold text-white tracking-wide">Choose Your Hero</h2>
          <div className="flex gap-3">
            {HERO_FIGHTERS.map((hero) => (
              <button
                key={hero.id}
                onClick={() => launchAdventure(hero.id)}
                className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.05] active:scale-[0.97]"
                style={{
                  borderColor: `${hero.accentColor}88`,
                  background: `linear-gradient(180deg, ${hero.accentColor}15, ${hero.color}60)`,
                  boxShadow: `0 0 20px ${hero.accentColor}22`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black"
                  style={{
                    background: `linear-gradient(135deg, ${hero.accentColor}44, ${hero.color})`,
                    color: hero.accentColor,
                    border: `3px solid ${hero.accentColor}66`,
                  }}
                >
                  {hero.name[0]}
                </div>
                <span className="text-sm font-bold" style={{ color: hero.accentColor }}>
                  {hero.displayName}
                </span>
                {hero.baseStats && (
                  <div className="text-[10px] text-slate-400 space-x-2">
                    <span>PWR {hero.baseStats.power}</span>
                    <span>SPD {hero.baseStats.speed}</span>
                    <span>DEF {hero.baseStats.defense}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowHeroPicker(false)}
            className="mt-2 text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            ← Back to Menu
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mt-4 max-w-xl">
            <button
              onClick={() => setShowHeroPicker(true)}
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
          </div>

          <button
            onClick={() => setGameState("lore-hub")}
            className="flex items-center gap-2 mt-4 text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hub
          </button>
        </>
      )}
    </div>
  );
}
