import { useEffect, useState } from "react";

/**
 * Dev-only: shows last rAF delta (ms) while battle is active. Helps catch frame spikes.
 * Hidden in production builds.
 */
export default function DevFrameHud({ active }: { active: boolean }) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV || !active) {
      setMs(null);
      return;
    }
    let rafId = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      setMs(now - last);
      last = now;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  if (!import.meta.env.DEV || !active || ms === null) return null;

  const warn = ms > 22;
  return (
    <div
      className="fixed top-14 right-3 z-[100] pointer-events-none font-mono text-[10px] px-2 py-1 rounded border border-white/10 bg-black/55 text-slate-300"
      aria-hidden
    >
      <span className={warn ? "text-amber-400" : "text-emerald-400/90"}>{ms.toFixed(1)} ms</span>
      <span className="text-slate-500 ml-1">rAF</span>
    </div>
  );
}
