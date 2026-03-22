import { useState } from "react";

export function GameIntro({ onComplete }: { onComplete: () => void }) {
  const [skip, setSkip] = useState(false);

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
        <p className="mt-4 text-slate-500 text-sm">Fight through the city. Face the Big Bad.</p>
      </div>
      <p className="mt-10 text-cyan-400/90 text-sm font-medium animate-pulse">Click or press Enter to start</p>
    </div>
  );
}
