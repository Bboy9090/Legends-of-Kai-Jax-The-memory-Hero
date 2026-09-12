import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Flame, Shield, Sparkles, Zap } from "lucide-react";

import { STORY_HERO_IDS, isStoryHeroId, type StoryHeroId } from "../../game/story/storyHeroPolicy";
import { getFighterById } from "../../lib/characters";
import { useRunner } from "../../lib/stores/useRunner";
import CharacterPreview3D from "./CharacterPreview3D";

export { STORY_HERO_IDS, isStoryHeroId } from "../../game/story/storyHeroPolicy";
export type { StoryHeroId } from "../../game/story/storyHeroPolicy";

const STORY_HEROES: Record<StoryHeroId, {
  name: string;
  lineage: string;
  combatIdentity: string;
  traversalIdentity: string;
  description: string;
}> = {
  kai: {
    name: "Kai",
    lineage: "Myrr'Kai + Pyraxis",
    combatIdentity: "Memory-Web • Venom • Ember • Protection",
    traversalIdentity: "Four-limb wall movement • Web Zip • Aerial redirection",
    description: "An acrobatic protector who turns memory-web control, venom pressure, and ember power into close-range openings and rescue routes.",
  },
  jax: {
    name: "Jax",
    lineage: "Kar-Voth + Thryxen",
    combatIdentity: "Storm • Lightning • Pressure • Displacement",
    traversalIdentity: "Air control • Storm movement • Displacement bursts",
    description: "An explosive storm fighter who controls spacing through pressure, lightning, air movement, and displacement instead of copying Kai's traversal rhythm.",
  },
};

export default function StoryHeroSelect() {
  const selectedCharacter = useRunner((s) => s.selectedCharacter);
  const setCharacter = useRunner((s) => s.setCharacter);
  const setGameState = useRunner((s) => s.setGameState);

  const initial = isStoryHeroId(selectedCharacter) ? selectedCharacter : "kai";
  const [selectedId, setSelectedId] = useState<StoryHeroId>(initial);

  const selectedIndex = STORY_HERO_IDS.indexOf(selectedId);
  const selected = STORY_HEROES[selectedId];
  const profile = getFighterById(selectedId);
  const accent = profile?.accentColor ?? (selectedId === "kai" ? "#f97316" : "#38bdf8");

  const choose = useCallback(() => {
    setCharacter(selectedId);
    setGameState("story-hub");
  }, [selectedId, setCharacter, setGameState]);

  const moveSelection = useCallback((direction: number) => {
    const next = (selectedIndex + direction + STORY_HERO_IDS.length) % STORY_HERO_IDS.length;
    setSelectedId(STORY_HERO_IDS[next] ?? "kai");
  }, [selectedIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        event.preventDefault();
        moveSelection(-1);
      } else if (event.code === "ArrowRight" || event.code === "KeyD") {
        event.preventDefault();
        moveSelection(1);
      } else if (event.code === "Enter" || event.code === "Space") {
        event.preventDefault();
        choose();
      } else if (event.code === "Escape" || event.code === "Backspace") {
        event.preventDefault();
        setGameState("story-hub");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [choose, moveSelection, setGameState]);

  useEffect(() => {
    let raf = 0;
    let previousButtons: boolean[] = [];

    const poll = () => {
      const gamepad = navigator.getGamepads?.().find((pad) => pad?.connected);
      if (gamepad) {
        const pressed = gamepad.buttons.map((button) => button.pressed);
        const edge = (index: number) => Boolean(pressed[index] && !previousButtons[index]);
        if (edge(14)) moveSelection(-1);
        else if (edge(15)) moveSelection(1);
        else if (edge(0)) choose();
        else if (edge(1)) setGameState("story-hub");
        previousButtons = pressed;
      } else {
        previousButtons = [];
      }
      raf = window.requestAnimationFrame(poll);
    };

    raf = window.requestAnimationFrame(poll);
    return () => window.cancelAnimationFrame(raf);
  }, [choose, moveSelection, setGameState]);

  const cards = useMemo(() => STORY_HERO_IDS.map((id) => {
    const hero = STORY_HEROES[id];
    const fighter = getFighterById(id);
    return {
      id,
      ...hero,
      accent: fighter?.accentColor ?? (id === "kai" ? "#f97316" : "#38bdf8"),
      base: fighter?.color ?? "#111827",
    };
  }), []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050510] text-white">
      <div className="min-h-full p-5 sm:p-10 flex flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <button
            type="button"
            onClick={() => setGameState("story-hub")}
            className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Return to Story Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-[0.32em] text-amber-300">Raging City Story</p>
            <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-wide">Choose Your Hero</h1>
          </div>
          <div className="w-11" aria-hidden="true" />
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto py-8 sm:py-12 flex flex-col justify-center">
          {profile && (
            <section
              className="mb-6 sm:mb-8 overflow-hidden rounded-3xl border border-white/10 bg-black/30"
              aria-label={`${selected.name} production character preview`}
            >
              <div className="relative h-64 sm:h-80">
                <CharacterPreview3D key={selectedId} fighter={profile} />
                <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-sm">
                  <div className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Production rig preview</div>
                  <div className="mt-1 text-sm font-black uppercase" style={{ color: accent }}>{selected.name}</div>
                </div>
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
            {cards.map((hero) => {
              const active = hero.id === selectedId;
              return (
                <button
                  key={hero.id}
                  type="button"
                  onClick={() => setSelectedId(hero.id)}
                  onDoubleClick={() => {
                    setCharacter(hero.id);
                    setGameState("story-hub");
                  }}
                  aria-pressed={active}
                  data-story-hero-id={hero.id}
                  className={`relative text-left rounded-3xl border-2 p-6 sm:p-8 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${active ? "scale-[1.015]" : "opacity-80 hover:opacity-100"}`}
                  style={{
                    borderColor: active ? hero.accent : "rgba(148,163,184,0.25)",
                    background: `linear-gradient(145deg, ${hero.accent}${active ? "28" : "12"}, ${hero.base}dd)`,
                    boxShadow: active ? `0 0 36px ${hero.accent}33` : "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Playable protagonist</p>
                      <h2 className="text-4xl sm:text-5xl font-black italic uppercase mt-1" style={{ color: hero.accent }}>
                        {hero.name}
                      </h2>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mt-2">{hero.lineage}</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-black/30">
                      {hero.id === "kai" ? (
                        <div className="relative">
                          <Sparkles className="w-8 h-8 text-purple-300" />
                          <Flame className="absolute -bottom-2 -right-2 w-5 h-5 text-orange-400" />
                        </div>
                      ) : (
                        <div className="relative">
                          <Zap className="w-8 h-8 text-cyan-300" />
                          <Shield className="absolute -bottom-2 -right-2 w-5 h-5 text-blue-300" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-6 text-sm leading-6 text-slate-300">{hero.description}</p>

                  <div className="mt-6 space-y-3 text-xs">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <span className="block text-[9px] uppercase tracking-widest text-slate-500 mb-1">Combat identity</span>
                      <span className="font-bold text-slate-100">{hero.combatIdentity}</span>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <span className="block text-[9px] uppercase tracking-widest text-slate-500 mb-1">Traversal identity</span>
                      <span className="font-bold text-slate-100">{hero.traversalIdentity}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-500/[0.06] p-4 text-center text-xs sm:text-sm text-amber-100">
            Kai-Jax is not a normal Story Hub character swap. Fusion remains an earned convergence controlled by story chronology and synchronization.
          </div>
        </main>

        <footer className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-2">
          <button
            type="button"
            onClick={choose}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{
              background: `linear-gradient(135deg, ${accent}, #6d28d9)`,
              boxShadow: `0 0 26px ${accent}44`,
            }}
          >
            Continue as {selected.name}
          </button>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">A/D or ←/→ • Enter/A confirm • Esc/B back</p>
        </footer>
      </div>
    </div>
  );
}
