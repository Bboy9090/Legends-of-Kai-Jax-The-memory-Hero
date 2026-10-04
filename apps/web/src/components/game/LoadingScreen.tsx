import { useCallback, useEffect, useRef, useState } from "react";

const INTRO_SEEN_KEY = "kai-jax-cinematic-intro-v1";

export function GameIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"bloodline" | "fracture" | "hero" | "title" | "done">("bloodline");
  const completed = useRef(false);

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    try { localStorage.setItem(INTRO_SEEN_KEY, "1"); } catch {}
    setPhase("done");
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    let returning = false;
    try { returning = localStorage.getItem(INTRO_SEEN_KEY) === "1"; } catch {}
    if (returning) {
      const short = window.setTimeout(finish, 1400);
      return () => window.clearTimeout(short);
    }

    const timers = [
      window.setTimeout(() => setPhase("fracture"), 1900),
      window.setTimeout(() => setPhase("hero"), 3900),
      window.setTimeout(() => setPhase("title"), 6000),
      window.setTimeout(finish, 8200),
      window.setTimeout(finish, 11000),
    ];
    const skip = (event: KeyboardEvent) => {
      if (["Enter", "Escape", " "].includes(event.key)) finish();
    };
    window.addEventListener("keydown", skip);
    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener("keydown", skip);
    };
  }, [finish]);

  if (phase === "done") return null;

  const image =
    phase === "bloodline" ? "/brand/kai-and-jax-before-merge.png" :
    phase === "fracture" ? "/images/lore/brothers-fusion.png" :
    phase === "hero" ? "/images/lore/hero-kaijax.png" :
    "/brand/kai-jax-vs-architect.png";

  return (
    <div data-testid="game-intro" className="fixed inset-0 z-[200] overflow-hidden bg-[#020308] text-white">
      <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url("${image}")`, transform: phase === "hero" ? "scale(1.03)" : "scale(1.08)" }} />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,8,.96)_0%,rgba(2,3,8,.38)_48%,rgba(2,3,8,.86)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(2,3,8,.12)_38%,rgba(2,3,8,.92)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

      <button type="button" data-testid="game-intro-skip" onClick={finish} className="absolute right-5 top-5 z-20 rounded-full border border-white/25 bg-black/55 px-5 py-3 text-xs font-black tracking-[.24em] backdrop-blur-md hover:border-cyan-300/80">
        SKIP
      </button>

      <div className="absolute bottom-[12%] left-[7%] z-10 max-w-3xl">
        <p className="mb-3 text-xs font-black tracking-[.45em] text-cyan-300/90">THE RAGING CITY SAGA</p>
        {phase === "bloodline" && <>
          <h1 className="font-['Bebas_Neue'] text-5xl sm:text-7xl md:text-8xl leading-[.86]">TWO VOICES.<br/>ONE BLOODLINE.</h1>
          <p className="mt-5 max-w-xl text-sm sm:text-base text-slate-200/80">Before the city knew the Memory Hero, there were brothers carrying a legacy bigger than either of them.</p>
        </>}
        {phase === "fracture" && <>
          <h1 className="font-['Bebas_Neue'] text-5xl sm:text-7xl md:text-8xl leading-[.86]">MEMORY<br/><span className="text-amber-300">BECAME POWER.</span></h1>
          <p className="mt-5 max-w-xl text-sm sm:text-base text-slate-200/80">Kai. Jax. Kai-Jax. One body. Three identities learning to move without becoming divided.</p>
        </>}
        {phase === "hero" && <>
          <h1 className="font-['Bebas_Neue'] text-6xl sm:text-8xl md:text-9xl leading-[.82]">THE MEMORY<br/><span className="text-cyan-300">HERO RISES.</span></h1>
          <p className="mt-5 max-w-xl text-sm sm:text-base text-slate-200/80">The streets remember every wound. The blood remembers every name.</p>
        </>}
        {phase === "title" && <>
          <p className="text-lg font-black tracking-[.5em] text-amber-300">BOBBY BLANCO PRESENTS</p>
          <h1 className="mt-2 font-['Bebas_Neue'] text-6xl sm:text-8xl md:text-9xl leading-[.82]">LEGENDS OF<br/><span className="text-cyan-300">KAI-JAX</span></h1>
          <p className="mt-4 text-sm font-bold tracking-[.35em] text-white/70">THE MEMORY HERO</p>
        </>}
      </div>
      <div className="absolute bottom-5 right-6 text-[10px] font-bold tracking-[.25em] text-white/45">ENTER / SPACE / TAP SKIP</div>
    </div>
  );
}

export default function LoadingScreen({ onComplete, duration = 1200 }: { onComplete: () => void; duration?: number }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onComplete]);
  return <div className="fixed inset-0 z-[190] grid place-items-center bg-[#020308] text-white"><div className="text-center"><p className="font-['Bebas_Neue'] text-4xl tracking-[.18em]">MEMORY AWAKENING</p><div className="mx-auto mt-5 h-px w-52 overflow-hidden bg-white/10"><div className="h-full w-full origin-left animate-pulse bg-cyan-300"/></div></div></div>;
}
