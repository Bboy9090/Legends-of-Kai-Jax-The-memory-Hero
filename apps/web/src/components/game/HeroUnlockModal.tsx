import { lazy, Suspense, useEffect } from "react";
import { useHeroRoster } from "../../lib/stores/useHeroRoster";
import { getHeroIdentity, hasBattleModel } from "../../lib/heroVisualIdentity";
import { CHARACTER_DATA_MAP } from "../../lib/characterStats";
import { playSfx } from "../../lib/sfx";
import HeroSilhouette from "./HeroSilhouette";

const HeroTurntable = lazy(() => import("./HeroTurntable"));

/** Celebratory modal shown once for each newly unlocked hero, with a 3D turntable preview. */
export default function HeroUnlockModal() {
  const heroId = useHeroRoster((s) => s.pendingUnlocks[0]);
  const acknowledge = useHeroRoster((s) => s.acknowledgeUnlock);

  useEffect(() => {
    if (heroId) playSfx("victory");
  }, [heroId]);

  const identity = heroId ? getHeroIdentity(heroId) : undefined;
  if (!heroId || !identity) return null;
  const data = CHARACTER_DATA_MAP[identity.id];
  const playable = hasBattleModel(identity.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`New hero unlocked: ${identity.displayName}`}
      data-testid="hero-unlock-modal"
      data-hero={identity.id}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <div
        className="relative flex max-h-full w-full max-w-md flex-col items-center overflow-y-auto border bg-[#07080d] p-5 text-center"
        style={{ borderColor: identity.rimColor, boxShadow: `0 0 60px ${identity.primaryColor}55, inset 0 0 40px ${identity.primaryColor}1a` }}
      >
        <div className="text-[10px] uppercase tracking-[0.5em] text-[#b9a16d]">Story Reward</div>
        <h2 className="kj-vision-title mt-1 whitespace-nowrap text-[clamp(1.4rem,7vw,2rem)] tracking-[0.12em]" style={{ color: "#f5e6bd", textShadow: `0 0 18px ${identity.primaryColor}` }}>
          NEW HERO UNLOCKED
        </h2>

        <div className="relative my-3 h-56 w-full overflow-hidden rounded-sm" style={{ background: `radial-gradient(circle at 50% 70%, ${identity.primaryColor}33, transparent 62%)` }}>
          <Suspense fallback={<HeroSilhouette heroId={identity.id} mood="triumphant" className="mx-auto h-full" />}>
            <HeroTurntable heroId={identity.id} className="absolute inset-0" />
          </Suspense>
        </div>

        <div className="text-3xl tracking-[0.14em] text-[#f1e8d2]">{identity.displayName}</div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.3em]" style={{ color: identity.rimColor }}>{identity.subtitle}</div>
        {data ? <p className="mt-3 text-sm leading-snug text-[#b8ad9a]">{data.description}</p> : null}

        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {identity.traits.map((trait) => (
            <li key={trait} className="border px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#d8cdb8]" style={{ borderColor: `${identity.rimColor}66` }}>{trait}</li>
          ))}
        </ul>

        {!playable ? <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[#8f806b]">Added to your roster · playable build coming soon</p> : null}

        <button
          type="button"
          onClick={acknowledge}
          data-testid="hero-unlock-continue"
          className="kj-vision-button mt-5 w-full px-6 py-3 text-xs"
          style={{ borderColor: identity.rimColor }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
