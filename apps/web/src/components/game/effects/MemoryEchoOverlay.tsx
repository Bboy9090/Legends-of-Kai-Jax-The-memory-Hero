interface MemoryEchoOverlayProps {
  visible: boolean;
}

export function MemoryEchoOverlay({ visible }: MemoryEchoOverlayProps) {
  if (!visible) return null;

  return (
    <div
      data-testid="memory-echo-overlay"
      aria-live="polite"
      className="pointer-events-none absolute left-1/2 top-20 z-30 w-[min(92vw,34rem)] -translate-x-1/2 rounded-2xl border border-violet-300/30 bg-slate-950/85 px-5 py-4 text-white shadow-2xl backdrop-blur-md"
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-violet-300">
        Memory Echo // Ashblock
      </div>
      <div data-testid="memory-echo-boryn" className="mt-2 text-sm font-semibold text-slate-100">
        Boryn: “Kai. Jax. Keep moving.”
      </div>
      <div data-testid="memory-echo-ulgorr" className="mt-2 text-xs leading-relaxed text-slate-300">
        The imprint fractures. Ulgorr cuts through the memory — Boryn’s great saber teeth clatter against his armor.
      </div>
    </div>
  );
}
