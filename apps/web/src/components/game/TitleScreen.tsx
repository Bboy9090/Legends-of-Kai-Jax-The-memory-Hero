import { useEffect } from "react";
import { Settings } from "lucide-react";
import { useRunner } from "../../lib/stores/useRunner";
import { useAudio } from "../../lib/stores/useAudio";

export default function TitleScreen() {
  const setGameState = useRunner((s) => s.setGameState);
  const { playVictory } = useAudio();
  const start = () => { playVictory(); setGameState("menu"); };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (["Tab", "Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
      start();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  return (
    <div data-testid="new-title-screen" onClick={start} className="fixed inset-0 z-50 cursor-pointer select-none overflow-hidden bg-[#020308] text-white">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:'url("/images/lore/kaijax-shadow.png")'}} />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,8,.96)_0%,rgba(2,3,8,.46)_48%,rgba(2,3,8,.82)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_45%,transparent_0%,rgba(2,3,8,.16)_38%,rgba(2,3,8,.92)_100%)]" />
      <button aria-label="Settings" onClick={(e)=>{e.stopPropagation();setGameState("settings");}} className="absolute right-5 top-5 z-20 rounded-full border border-white/20 bg-black/40 p-3 backdrop-blur-md hover:border-cyan-300"><Settings className="h-5 w-5"/></button>
      <div className="absolute bottom-[14%] left-[7%] z-10 max-w-4xl">
        <p className="mb-4 text-xs font-black tracking-[.48em] text-amber-300">BOBBY BLANCO PRESENTS</p>
        <h1 className="font-['Bebas_Neue'] text-7xl sm:text-8xl md:text-[9rem] leading-[.76] tracking-[-.02em]">LEGENDS OF<br/><span className="text-cyan-300">KAI-JAX</span></h1>
        <p className="mt-5 text-sm sm:text-base font-black tracking-[.42em] text-white/70">THE MEMORY HERO</p>
        <button data-testid="title-enter" className="mt-10 border-l-2 border-amber-300 bg-black/35 px-6 py-4 text-left backdrop-blur-sm transition hover:bg-white/10">
          <span className="block text-xs font-black tracking-[.35em] text-amber-300">ENTER THE RAGING CITY</span>
          <span className="mt-1 block text-sm text-white/55">Press any button or tap to begin</span>
        </button>
      </div>
      <div className="absolute bottom-5 right-6 text-[10px] font-bold tracking-[.28em] text-white/35">MEMORY IS NEVER GONE</div>
    </div>
  );
}
