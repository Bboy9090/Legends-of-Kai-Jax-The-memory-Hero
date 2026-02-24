import { useState, useEffect } from "react";

/** Story beats for the Raging City intro sequence */
const INTRO_BEATS = [
  {
    label: "THE RAGING CITY",
    title: "A mythic megacity fractured by forgotten gods and engineered extinction.",
    subtitle: "Gritty. Neon-soaked. Ancient power in a broken city.",
    accent: "#64D2FF",
  },
  {
    label: "THE MEMORY KING",
    title: "Forged in the Raging City. Crowned by Memory.",
    subtitle: "Survival is not strength. Survival is memory that refuses erasure.",
    accent: "#7fff00",
  },
  {
    label: "LEGENDS OF KAI-JAX",
    title: "Enter the city. Face what refuses to be erased.",
    subtitle: "Fight through the districts. Reach the crown.",
    accent: "#BF5AF2",
  },
];

const BEAT_DURATION_MS = 4500;
const FADE_MS = 600;

export function GameIntro({ onComplete }: { onComplete: () => void }) {
  const [skip, setSkip] = useState(false);
  const [beatIndex, setBeatIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-advance through story beats
  useEffect(() => {
    if (skip) return;
    const beat = INTRO_BEATS[beatIndex];
    if (!beat) return;
    const t = setTimeout(() => {
      if (beatIndex < INTRO_BEATS.length - 1) {
        setIsVisible(false);
        setTimeout(() => {
          setBeatIndex((i) => i + 1);
          setIsVisible(true);
        }, FADE_MS);
      } else {
        onComplete();
      }
    }, BEAT_DURATION_MS);
    return () => clearTimeout(t);
  }, [beatIndex, skip, onComplete]);

  const handleSkip = () => {
    setSkip(true);
    onComplete();
  };

  if (skip) {
    return null;
  }

  const beat = INTRO_BEATS[beatIndex];
  if (!beat) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white p-8 cursor-pointer select-none"
      style={{
        background: "linear-gradient(160deg, #0a0a1a 0%, #1a0a2e 40%, #0d0d1a 100%)",
      }}
      onClick={handleSkip}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), handleSkip())}
      role="button"
      tabIndex={0}
      aria-label="Click or press Enter to continue"
    >
      <div
        className="text-center max-w-2xl transition-opacity duration-[600ms]"
        style={{
          opacity: isVisible ? 1 : 0,
          transitionProperty: "opacity",
        }}
      >
        {/* Beat label */}
        <p
          className="text-xs md:text-sm font-semibold tracking-[0.4em] uppercase mb-4"
          style={{ color: beat.accent, textShadow: `0 0 20px ${beat.accent}40` }}
        >
          {beat.label}
        </p>
        {/* Main title / tagline */}
        <h1
          className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight"
          style={{
            color: "white",
            textShadow: `0 0 30px ${beat.accent}50`,
          }}
        >
          {beat.title}
        </h1>
        <p className="mt-4 text-slate-400 text-base md:text-lg max-w-lg mx-auto">
          {beat.subtitle}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-12">
        {INTRO_BEATS.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === beatIndex ? beat.accent : "rgba(255,255,255,0.2)",
              opacity: i === beatIndex ? 1 : 0.5,
              transform: i === beatIndex ? "scale(1.2)" : "scale(1)",
            }}
          />
        ))}
      </div>

      <p className="mt-8 text-cyan-400/90 text-sm font-medium animate-pulse">
        Click or press Enter to skip
      </p>
    </div>
  );
}
