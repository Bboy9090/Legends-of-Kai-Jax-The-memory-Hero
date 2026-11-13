import { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Eye, LockKeyhole } from "lucide-react";
import { useRunner } from "../../lib/stores/useRunner";
import { useHeroRoster } from "../../lib/stores/useHeroRoster";
import { useDifficulty } from "../../lib/stores/useDifficulty";
import { HERO_ORDER, HERO_IDENTITIES, hasBattleModel, normalizeHeroId } from "../../lib/heroVisualIdentity";
import { unlockHintFor } from "../../lib/heroUnlockSource";
import HeroSilhouette from "./HeroSilhouette";

const HeroTurntable = lazy(() => import("./HeroTurntable"));

/** Existing painted key art for the three story leads; everyone else uses their silhouette. */
const LEAD_ART: Record<string, { image: string; position: string }> = {
  kai: { image: "/brand/kai-and-jax-before-merge.png", position: "30% center" },
  jax: { image: "/brand/kai-and-jax-before-merge.png", position: "72% center" },
  "kai-jax": { image: "/images/lore/hero-kaijax.png", position: "center 22%" },
};

const ROLE: Record<string, string> = { boryn: "MENTOR MEMORY", borax: "GUARDIAN ECHO" };

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function LegendSelectScreen() {
  const selectedCharacter = useRunner((s) => s.selectedCharacter);
  const setCharacter = useRunner((s) => s.setCharacter);
  const setGameState = useRunner((s) => s.setGameState);
  const unlocked = useHeroRoster((s) => s.unlockedHeroIds);
  const difficulty = useDifficulty((s) => s.difficulty);
  const webgl = useMemo(canUseWebGL, []);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeId = normalizeHeroId(selectedCharacter ?? "kai-jax");
  const active = HERO_IDENTITIES[activeId] ?? HERO_IDENTITIES["kai-jax"];
  const isUnlocked = (id: string) => unlocked.includes(id);
  const activeUnlocked = isUnlocked(active.id);
  const activePlayable = activeUnlocked && hasBattleModel(active.id);

  const confirm = () => {
    if (!activePlayable) return;
    setGameState("mission-select");
  };
  const viewAbilities = () => {
    if (!activeUnlocked) return;
    setGameState("abilities");
  };

  useEffect(() => {
    cardRefs.current[active.id]?.scrollIntoView?.({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const index = HERO_ORDER.indexOf(active.id as (typeof HERO_ORDER)[number]);
      if (e.key === "Escape") setGameState("story-hub");
      else if (e.key === "Enter") confirm();
      else if (e.key.toLowerCase() === "r") viewAbilities();
      else if (e.key === "ArrowRight") setCharacter(HERO_ORDER[Math.min(HERO_ORDER.length - 1, index + 1)]);
      else if (e.key === "ArrowLeft") setCharacter(HERO_ORDER[Math.max(0, index - 1)]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="kj-vision-shell kj-safe-screen fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-hidden" data-testid="legend-select" aria-label="Legends of Kai-Jax: The Memory Hero — Character Select">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(2,3,7,.28),rgba(2,3,7,.72)),url('/models/ruined_city_bg.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(157,78,221,.18),transparent_32%),linear-gradient(90deg,rgba(0,0,0,.72),transparent_28%,transparent_72%,rgba(0,0,0,.72))]" />

      <header className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-start gap-2 border-b border-[#7d6136]/55 px-3 pb-2 pt-1 sm:px-8 sm:py-4">
        <div className="text-[8px] uppercase tracking-[0.28em] text-[#a48d6a] sm:text-[10px] sm:tracking-[0.4em]">Adventure Mode</div>
        <div className="min-w-0 text-center">
          <div className="text-[8px] uppercase tracking-[0.45em] text-[#a48d6a] sm:text-[11px]">Legends of</div>
          <h1 className="kj-vision-title mt-0.5 whitespace-nowrap text-[clamp(1.35rem,7vw,2.2rem)] leading-none tracking-[0.1em] sm:text-5xl">KAI-JAX</h1>
          <div className="kj-vision-subtitle mt-1 text-[9px] tracking-[0.28em] sm:text-xs sm:tracking-[0.4em]">CHARACTER SELECT</div>
        </div>
        <div className="text-right text-[8px] uppercase tracking-[0.2em] text-[#a48d6a] sm:text-[10px] sm:tracking-[0.35em]">Story Mode · The Raging City</div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col px-3 pb-2 pt-3 sm:px-6 sm:py-4">
        <div
          className="kj-mobile-legend-strip mx-auto flex h-full w-full max-w-[1540px] snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden pb-2"
          role="group"
          aria-label="Heroes"
        >
          {HERO_ORDER.map((id) => {
            const hero = HERO_IDENTITIES[id];
            const selected = id === active.id;
            const open = isUnlocked(id);
            const playable = open && hasBattleModel(id);
            const art = LEAD_ART[id];
            return (
              <button
                key={id}
                ref={(el) => { cardRefs.current[id] = el; }}
                type="button"
                onClick={() => setCharacter(id)}
                aria-pressed={selected}
                data-testid={`legend-card-${id}`}
                data-locked={!open}
                className={
                  "group relative flex w-[64vw] max-w-[270px] shrink-0 snap-center flex-col overflow-hidden border bg-black/55 text-left transition sm:w-[210px] " +
                  (open ? "hover:-translate-y-1 hover:bg-black/70" : "opacity-90")
                }
                style={{
                  borderColor: selected ? hero.rimColor : "rgba(122,96,53,.52)",
                  boxShadow: selected ? `0 0 32px ${hero.primaryColor}55, inset 0 0 40px ${hero.primaryColor}1a` : "none",
                }}
              >
                <div
                  className="relative min-h-0 flex-1 overflow-hidden"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, ${hero.primaryColor}33, transparent 40%), linear-gradient(180deg, ${hero.primaryColor}14, rgba(2,3,7,.94))`,
                  }}
                >
                  {selected && playable && webgl ? (
                    <Suspense fallback={<HeroSilhouette heroId={id} className="absolute inset-0 m-auto h-[88%]" />}>
                      <HeroTurntable heroId={id} className="absolute inset-0" />
                    </Suspense>
                  ) : art && open ? (
                    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 40%, rgba(2,3,7,.92)), url('${art.image}') ${art.position}/cover no-repeat` }} />
                  ) : (
                    <HeroSilhouette heroId={id} locked={!open} className="absolute inset-0 m-auto h-[92%] w-full" />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.03)_45%,rgba(0,0,0,.9)_100%)]" />

                  {!open ? (
                    <div className="absolute inset-x-2 top-[48%] flex flex-col items-center gap-1 border border-[#9d835b]/50 bg-black/80 px-2 py-1.5 text-center text-[8px] uppercase tracking-[0.18em] text-[#b7a17d]">
                      <span className="flex items-center gap-1.5"><LockKeyhole className="h-3 w-3" />Locked</span>
                      <span className="text-[#9c8e73]">{unlockHintFor(id)}</span>
                    </div>
                  ) : !playable ? (
                    <div className="absolute inset-x-2 top-2 border border-[#9d835b]/50 bg-black/75 px-2 py-1 text-center text-[8px] uppercase tracking-[0.18em] text-[#b7a17d]">Build pending</div>
                  ) : null}
                </div>

                <div className="relative border-t border-[#735c39]/45 bg-[linear-gradient(180deg,rgba(10,10,14,.96),rgba(3,4,7,.99))] p-3">
                  <div className="text-[8px] uppercase tracking-[0.24em] text-[#9a9184]">{ROLE[id] ?? (open ? "PLAYABLE LEGEND" : "UNDISCOVERED")}</div>
                  <div className="mt-1 text-[clamp(17px,2vw,26px)] tracking-[0.12em] text-[#efe5cf]">{hero.displayName}</div>
                  <div className="mt-1 text-[8px] uppercase tracking-[0.18em]" style={{ color: hero.rimColor }}>{hero.subtitle}</div>
                  <div className="mt-2 space-y-1 border-t border-white/5 pt-2">
                    {hero.traits.map((trait) => (
                      <div key={trait} className="flex items-center gap-2 text-[8px] uppercase tracking-[0.12em] text-[#9a9081]">
                        <span className="text-[10px]" style={{ color: hero.accentColor }}>✦</span>
                        <span>{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-1 text-center text-[8px] uppercase tracking-[0.3em] text-[#b3a690] sm:text-[10px]">Choose your hero. The Raging City awaits.</div>
      </main>

      <footer
        className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-[#735c39]/60 bg-[#05070bf2] px-3 pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3rem))] pt-2 sm:px-8 sm:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="hidden min-w-0 text-[9px] uppercase tracking-[0.2em] text-[#b3a690] sm:block">
          Faction: <span style={{ color: active.rimColor }} data-testid="legend-faction">{active.faction}</span>
        </div>
        <div className="col-span-3 flex items-center justify-center gap-2 sm:col-span-1">
          <button type="button" onClick={() => setGameState("story-hub")} data-testid="legend-select-back" className="kj-vision-button flex items-center gap-1.5 px-3 py-2.5 text-[10px] sm:px-5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back <kbd className="hidden text-[8px] opacity-60 sm:inline">ESC</kbd>
          </button>
          <button
            type="button"
            disabled={!activePlayable}
            onClick={confirm}
            data-testid="legend-select-confirm"
            aria-label={`Confirm ${active.displayName} and continue to missions`}
            className="kj-vision-button min-w-0 flex-1 px-4 py-2.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-44 sm:flex-none sm:px-8"
            style={{ borderColor: activePlayable ? active.rimColor : undefined }}
          >
            {activeUnlocked && !activePlayable ? "Build pending" : "Confirm"}
          </button>
          <button type="button" disabled={!activeUnlocked} onClick={viewAbilities} data-testid="legend-select-abilities" className="kj-vision-button flex items-center gap-1.5 px-3 py-2.5 text-[10px] disabled:opacity-40 sm:px-5">
            <Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">View </span>Abilities <kbd className="hidden text-[8px] opacity-60 sm:inline">R</kbd>
          </button>
        </div>
        <div className="hidden text-right text-[9px] uppercase tracking-[0.2em] text-[#b3a690] sm:block">
          Difficulty: <span className="text-[#c8af82]">{difficulty}</span>
        </div>
      </footer>
    </div>
  );
}
