import { useGame } from "../../lib/stores/useGame";
import { useRunner } from "../../lib/stores/useRunner";
import { Swords, BookOpen } from "lucide-react";

export default function MainMenu() {
  const start = useGame((s) => s.start);
  const setGameState = useRunner((s) => s.setGameState);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-b from-[#07070d] via-purple-950/20 to-[#07070d]">
      <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase text-center">
        Legends of Kai-Jax
      </h1>
      <p className="text-slate-400 text-lg">The Memory King</p>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={() => {
            start();
            setGameState("playing");
          }}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-500/20 border-2 border-cyan-400 text-cyan-200 font-bold text-lg hover:bg-cyan-500/30 hover:border-cyan-300 transition-all"
        >
          <Swords className="w-6 h-6" />
          Enter Battle
        </button>
        <button
          onClick={() => setGameState("mission-select")}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-800/60 border-2 border-slate-500 text-slate-200 font-bold text-lg hover:border-indigo-400 transition-all"
        >
          <BookOpen className="w-6 h-6" />
          Missions
        </button>
      </div>
    </div>
  );
}
