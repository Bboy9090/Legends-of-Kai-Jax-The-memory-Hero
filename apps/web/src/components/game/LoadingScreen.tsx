import { useState } from "react";

export function GameIntro({ onComplete }: { onComplete: () => void }) {
  const [skip, setSkip] = useState(false);

  if (skip) {
    onComplete();
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-white p-6"
      onClick={() => setSkip(true)}
    >
      <h1 className="text-4xl font-black uppercase tracking-tighter">Legends of Kai-Jax</h1>
      <p className="mt-2 text-slate-400">The Memory King</p>
      <p className="mt-8 text-slate-500 text-sm">Click to start</p>
    </div>
  );
}
