import React, { useEffect, useRef } from 'react';
import { ChevronRight, FastForward } from 'lucide-react';
import { DialogueLine } from '../game/types';

interface DialogueOverlayProps {
  lines: DialogueLine[];
  currentIndex: number;
  subtitleScale: 'normal' | 'large';
  onAdvance: () => void;
  onSkip: () => void;
}

const SPEAKER_ACCENT: Record<string, string> = {
  kai: 'border-violet-500/70 text-violet-300',
  jax: 'border-sky-500/70 text-sky-300',
  kaijax: 'border-amber-400/80 text-amber-300',
  bovar: 'border-amber-500/50 text-amber-200',
  enforcer: 'border-red-500/70 text-red-300',
  civilian: 'border-slate-500/70 text-slate-200',
};

export function trapDialogueTabFocus(
  event: Pick<React.KeyboardEvent, 'key' | 'shiftKey' | 'preventDefault'>,
  activeElement: unknown,
  firstAction: Pick<HTMLButtonElement, 'focus'> | null,
  lastAction: Pick<HTMLButtonElement, 'focus'> | null,
): void {
  if (event.key !== 'Tab' || !firstAction || !lastAction) return;

  if (event.shiftKey && activeElement === firstAction) {
    event.preventDefault();
    lastAction.focus();
  } else if (!event.shiftKey && activeElement === lastAction) {
    event.preventDefault();
    firstAction.focus();
  }
}

export const DialogueOverlay: React.FC<DialogueOverlayProps> = ({
  lines,
  currentIndex,
  subtitleScale,
  onAdvance,
  onSkip,
}) => {
  const line = lines[currentIndex];
  const skipRef = useRef<HTMLButtonElement>(null);
  const advanceRef = useRef<HTMLButtonElement>(null);

  const keepTabFocusInsideDialogue = (event: React.KeyboardEvent<HTMLDivElement>) => {
    trapDialogueTabFocus(event, document.activeElement, skipRef.current, advanceRef.current);
  };

  // Keyboard / gamepad / switch users: keep focus on the primary action for every new line so
  // Enter or Space advances without having to tab through the HUD first.
  useEffect(() => {
    if (line) advanceRef.current?.focus({ preventScroll: true });
  }, [currentIndex, line]);

  if (!line) return null;

  const accent = SPEAKER_ACCENT[line.portraitHero ?? 'civilian'] ?? SPEAKER_ACCENT.civilian;
  const textSize = subtitleScale === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base';

  return (
    <div
      role="dialog"
      aria-label="Story dialogue"
      aria-modal="true"
      onKeyDown={keepTabFocusInsideDialogue}
      data-testid="dialogue-overlay"
      className="fixed inset-x-0 bottom-0 z-40 p-4 sm:p-6 safe-area-pad flex justify-center pointer-events-auto"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-[#0a0b10]/95 border border-slate-700/90 p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`font-display text-xl font-bold tracking-wide px-2.5 py-0.5 rounded-md border bg-[#131620] ${accent}`}>
                {line.speaker}
              </span>
              <span className="text-xs text-slate-400 font-medium">{line.role}</span>
            </div>
          </div>
          <span
            className="text-xs font-mono-tabular text-slate-400"
            aria-label={`Line ${currentIndex + 1} of ${lines.length}`}
          >
            {currentIndex + 1} / {lines.length}
          </span>
        </div>

        {/* Polite live region: the speaker is part of the announcement so a screen-reader user knows who is talking. */}
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="dialogue-line"
          className={`mt-3 text-slate-100 leading-relaxed ${textSize}`}
        >
          <span className="sr-only">{line.speaker}: </span>
          {line.text}
        </p>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            ref={skipRef}
            onClick={onSkip}
            aria-label="Skip scene"
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#131620] hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            <FastForward className="w-3.5 h-3.5" />
            Skip Scene
          </button>
          <button
            ref={advanceRef}
            onClick={onAdvance}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors"
          >
            {currentIndex + 1 >= lines.length ? 'Continue' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
