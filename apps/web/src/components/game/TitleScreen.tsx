import React, { useEffect } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { useAudio } from '../../lib/stores/useAudio';
import { Settings, UserCheck, Play } from 'lucide-react';
import { BRAND } from '../../lib/brand';

export default function TitleScreen() {
  const { setGameState } = useRunner();
  const { playVictory } = useAudio();

  const handleStart = () => {
    playVictory();
    setGameState('menu');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      handleStart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const releaseVersion = import.meta.env.VITE_RELEASE_VERSION || 'dev';
  const releaseSha = (import.meta.env.VITE_RELEASE_SHA || 'local').slice(0, 7);

  return (
    <div
      data-testid="title-screen"
      className="kj-vision-shell kj-vision-city-vignette fixed inset-0 z-50 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_73%_22%,rgba(128,58,180,.20),transparent_24%),linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.54))]" />
      <div className="absolute right-[9%] top-[12%] h-[56vh] w-[36vw] min-w-[320px] rounded-full bg-[radial-gradient(circle,rgba(185,112,255,.18),rgba(78,24,118,.04)_45%,transparent_72%)] blur-[1px]" />
      <div className="absolute right-[15%] top-[6%] text-[min(24vw,280px)] leading-none text-purple-200/[0.06] drop-shadow-[0_0_45px_rgba(168,85,247,.18)]" aria-hidden>
        ✦
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="kj-vision-panel px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--kj-muted)]">
          VER. <span data-testid="title-release-metadata">{releaseVersion} | BUILD {releaseSha}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setGameState('settings')}
            className="kj-vision-button flex items-center gap-2 px-4 py-2 text-xs"
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={() => setGameState('save-slots')}
            className="kj-vision-button flex items-center gap-2 px-4 py-2 text-xs"
            aria-label="Switch profile"
          >
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex h-[calc(100vh-112px)] items-center px-7 sm:px-12 md:px-[7vw]">
        <section className="max-w-[760px] -translate-y-[3vh]">
          <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.48em] text-[var(--kj-gold)]">
            <span className="h-px w-16 bg-[var(--kj-gold-dim)]" />
            Legends of
          </div>

          <h1
            className="kj-vision-title text-[clamp(68px,10vw,160px)] font-black leading-[0.78]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            KAI<span className="text-purple-400 drop-shadow-[0_0_16px_rgba(192,132,252,.9)]">✦</span>JAX
          </h1>

          <div className="kj-vision-divider my-5 max-w-xl" />

          <h2 className="kj-vision-subtitle text-[clamp(18px,2.4vw,36px)]">
            The Memory King
          </h2>

          <p className="mt-7 max-w-xl text-sm tracking-[0.12em] text-[#d4bd91] sm:text-base">
            {BRAND.shortTagline}
          </p>

          <div className="mt-10 max-w-xl">
            <button
              type="button"
              data-testid="title-begin-button"
              onClick={handleStart}
              className="kj-vision-button group flex w-full items-center justify-between px-6 py-4 text-sm sm:text-base"
              aria-label="Begin Legends of Kai-Jax"
            >
              <span className="flex items-center gap-3">
                <Play className="h-4 w-4 fill-current text-purple-300" aria-hidden />
                Enter the Raging City
              </span>
              <span className="text-[10px] tracking-[0.24em] text-[#9f9180]">ENTER / SPACE</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="absolute bottom-4 left-6 right-6 z-10 flex items-end justify-between text-[10px] uppercase tracking-[0.2em] text-[#8e8578] sm:left-10 sm:right-10">
        <span>Memory is currency. Blood remembers.</span>
        <span>Raging City Saga</span>
      </footer>
    </div>
  );
}
