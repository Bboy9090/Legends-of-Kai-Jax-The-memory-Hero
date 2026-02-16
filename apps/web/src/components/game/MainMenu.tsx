import { useRunner } from "../../lib/stores/useRunner";
import { useBattle } from "../../lib/stores/useBattle";
import { Swords, BookOpen, Palette, ArrowLeft } from "../ui/icons";

export default function MainMenu() {
  const setGameState = useRunner((s) => s.setGameState);
  const setCharacter = useRunner((s) => s.setCharacter);
  const setPlayerFighter = useBattle((s) => s.setPlayerFighter);

  const startStoryMode = () => {
    setCharacter("kai-jax");
    setPlayerFighter("kai-jax");
    setGameState("campaign-map");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-b from-[#07070d] via-purple-950/25 to-[#07070d]">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_24px_rgba(34,211,238,0.2)]">
          Legends of Kai-Jax
        </h1>
        <p className="mt-2 text-slate-400 text-lg md:text-xl">The Memory King</p>
        <p className="mt-1 text-slate-600 text-sm">Campaign · Battle · Transform</p>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mt-4 max-w-xl">
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
    </div>
  );
}
