import { useEffect, useState } from 'react';

type EndState = 'victory' | 'defeat' | null;

/**
 * Presentation-only end-state layer for the isolated Ashblock vertical slice.
 *
 * The production scene remains the sole owner of mission/combat state. This
 * component only observes the already-rendered HUD copy and adds a closure UI;
 * it never mutates health, combat targets, mission progression, persistence, or
 * controller state.
 */
export function VerticalSliceEndStateOverlay() {
  const [endState, setEndState] = useState<EndState>(null);

  useEffect(() => {
    if (endState) return;

    const readHud = () => {
      const text = document.body.textContent ?? '';
      if (text.includes('Ashblock secured')) {
        setEndState('victory');
        return;
      }
      if (text.includes('(DOWN)')) {
        setEndState('defeat');
      }
    };

    readHud();
    const timer = window.setInterval(readHud, 150);
    return () => window.clearInterval(timer);
  }, [endState]);

  useEffect(() => {
    if (!endState) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'r') {
        window.location.reload();
      } else if (event.key === 'Escape') {
        window.location.assign('/');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [endState]);

  if (!endState) return null;

  const victory = endState === 'victory';

  return (
    <div
      data-testid="vertical-slice-endstate"
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-6 text-white backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/95 p-8 text-center shadow-2xl">
        <div
          data-testid="endstate-title"
          className={`text-3xl font-black tracking-[0.18em] ${victory ? 'text-emerald-300' : 'text-red-300'}`}
        >
          {victory ? 'MISSION COMPLETE' : 'HERO DOWN'}
        </div>
        <p className="mt-3 text-sm text-slate-300">
          {victory
            ? 'Ashblock Heights secured. Mission progress has been recorded by the existing mission authority.'
            : 'The Ashblock run ended in combat. Retry from the same isolated slice without changing mission state.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            data-testid="endstate-retry-btn"
            className="pointer-events-auto rounded-lg border border-cyan-400/50 bg-cyan-500/15 px-5 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-500/25"
            onClick={() => window.location.reload()}
          >
            Retry (R)
          </button>
          <button
            type="button"
            data-testid="endstate-exit-btn"
            className="pointer-events-auto rounded-lg border border-slate-500/50 bg-slate-700/25 px-5 py-2 text-sm font-bold text-slate-100 hover:bg-slate-700/40"
            onClick={() => window.location.assign('/')}
          >
            Exit (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
