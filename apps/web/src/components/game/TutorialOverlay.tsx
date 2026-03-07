import { useState, useMemo } from "react";
import { useTutorial } from "../../lib/stores/useTutorial";
import { useTouchInput } from "../../lib/stores/useTouchInput";

const BASE_SLIDES = [
  {
    title: "Movement & Jump",
    body: "Use **WASD** or **Arrow Keys** to move. **Space** or **W** to jump. **S** or **Down** to slide.",
  },
  {
    title: "Mobile Controls",
    body: "Use the joystick (left) to move. **ATK** = Punch, **HEAVY** = Kick, **SKILL** = Special, **ULT** = Ultimate. Swipe or tap **DODGE** to jump.",
  },
  {
    title: "Punch & Kick",
    body: "**J** or **X** to punch. **K** or **Z** to kick. Chain attacks for combos!",
  },
  {
    title: "Special & Ultimate",
    body: "**L** or **C** for your Special move. **R** for Ultimate when the meter is full.",
  },
  {
    title: "Synergy & Transform",
    body: "Press **T** to transform when synergy is charged. Unleash the full power of Kai-Jax!",
  },
];

const NON_MOBILE_SLIDES = BASE_SLIDES.filter((s) => s.title !== "Mobile Controls");

export default function TutorialOverlay({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const isTouchDevice = useTouchInput((s) => s.isTouchDevice);
  const SLIDES = useMemo(
    () => (isTouchDevice ? BASE_SLIDES : NON_MOBILE_SLIDES),
    [isTouchDevice]
  );
  const markTutorialSeen = useTutorial((s) => s.markTutorialSeen);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      markTutorialSeen();
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    markTutorialSeen();
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
      style={{
        background: "linear-gradient(160deg, rgba(5,5,16,0.97) 0%, rgba(26,10,46,0.98) 50%, rgba(7,7,13,0.97) 100%)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center"
        style={{
          border: "2px solid rgba(100, 211, 238, 0.3)",
          boxShadow: "0 0 40px rgba(46, 46, 254, 0.15)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <p className="text-cyan-400/70 text-xs tracking-[0.2em] uppercase mb-2">
          Step {step + 1} of {SLIDES.length}
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase tracking-tight">
          {slide.title}
        </h2>
        <p className="text-slate-300 text-base leading-relaxed mb-8">
          {slide.body.split(/\*\*(.+?)\*\*/g).map((part, j) => {
            const isKey = j % 2 === 1;
            return isKey ? (
              <kbd
                key={j}
                className="px-1.5 py-0.5 rounded text-cyan-300 font-bold text-sm mx-0.5 inline"
                style={{
                  background: "rgba(100, 211, 238, 0.15)",
                  border: "1px solid rgba(100, 211, 238, 0.4)",
                }}
              >
                {part}
              </kbd>
            ) : (
              <span key={j}>{part}</span>
            );
          })}
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleSkip}
            className="px-5 py-2.5 rounded-xl text-slate-400 text-sm font-semibold hover:text-slate-200 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(46,46,254,0.4), rgba(100,211,238,0.3))",
              border: "2px solid rgba(100, 211, 238, 0.6)",
              color: "#e0f2fe",
            }}
          >
            {isLast ? "Got it!" : "Next"}
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: i === step ? "rgba(100, 211, 238, 0.9)" : "rgba(255,255,255,0.15)",
                width: i === step ? 8 : 8,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
