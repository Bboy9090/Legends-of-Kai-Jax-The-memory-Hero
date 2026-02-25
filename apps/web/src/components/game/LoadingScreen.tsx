import { useState, useEffect } from "react";

export function LoadingView({ progress }: { progress: number }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white p-8"
      style={{
        background: "linear-gradient(160deg, #0a0a1a 0%, #1a0a2e 40%, #0d0d1a 100%)",
      }}
    >
      <div className="text-center max-w-md w-full">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-cyan-300/90">
          Legends of Kai-Jax
        </h1>
        <p className="mt-4 text-slate-400">Loading… {Math.round(progress)}%</p>
        <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const LORE_SNIPPETS = [
  "Sector-7 fell years ago. The Fang Syndicate rules the rubble.",
  "Memory King lives. Nine tails.",
  "Boryn holds the line at the Undercity gates.",
  "The Bronx streets remember. So does Kai-Jax.",
  "Malakor stirs below. The depths call.",
  "Raging City burns. Nine tails. One destiny.",
  "Nine tails. One soul. Two worlds.",
  "The Memory Thief stole more than memories.",
];

export function GameIntro({ onComplete }: { onComplete: () => void }) {
  const [skip, setSkip] = useState(false);
  const [loreIndex, setLoreIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setLoreIndex((i) => (i + 1) % LORE_SNIPPETS.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  if (skip) {
    onComplete();
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white p-8 cursor-pointer select-none"
      style={{ background: "linear-gradient(160deg, #0a0a1a 0%, #1a0a2e 40%, #0d0d1a 100%)" }}
      onClick={() => setSkip(true)}
      onKeyDown={(e) => e.key === "Enter" && setSkip(true)}
      role="button"
      tabIndex={0}
      aria-label="Click or press Enter to start"
    >
      <div className="text-center max-w-lg">
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
          Legends of Kai-Jax
        </h1>
        <p className="mt-2 text-cyan-300/90 text-lg font-medium">The Memory King</p>
        <p className="mt-4 text-slate-500 text-sm min-h-[2.5rem] transition-opacity duration-500" key={loreIndex}>
          {LORE_SNIPPETS[loreIndex]}
        </p>
      </div>
      <p className="mt-10 text-cyan-400/90 text-sm font-medium animate-pulse">Click or press Enter to start</p>
    </div>
  );
}
