import { useMemo, useEffect, useState } from "react";
import { BookOpen, Shield, Sparkles, Swords, Zap } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number;
}

const TIPS = [
  { icon: Zap, text: "Jax combines storm pressure, lightning, air control, and displacement." },
  { icon: Sparkles, text: "Kai uses memory-web techniques, venom strikes, ember power, and four spider limbs." },
  { icon: Shield, text: "Boryn's combat identity is protection, interception, endurance, and sacrifice." },
  { icon: Swords, text: "Combat Arena uses Archive framing so impossible matchups do not rewrite story chronology." },
  { icon: BookOpen, text: "Kai-Jax begins with three tails. Fusion and later tails are earned through story progression." },
] as const;

/** Publication-safe loading screen with no external asset dependency. */
export default function LoadingScreen({ onComplete, duration = 3000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const particles = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: (i * 37.71) % 100,
    top: (i * 61.83) % 100,
    size: 2 + (i % 4),
    delay: (i % 7) * 0.33,
    color: ['#c084fc', '#fb923c', '#38bdf8', '#fbbf24'][i % 4],
  })), []);

  useEffect(() => {
    const startTime = performance.now();
    let finishTimer: number | null = null;
    const progressInterval = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const next = Math.min(100, (elapsed / Math.max(1, duration)) * 100);
      setProgress(next);
      if (next >= 100) {
        window.clearInterval(progressInterval);
        setFadeOut(true);
        finishTimer = window.setTimeout(onComplete, 500);
      }
    }, 32);

    const tipInterval = window.setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 2200);

    return () => {
      window.clearInterval(progressInterval);
      window.clearInterval(tipInterval);
      if (finishTimer !== null) window.clearTimeout(finishTimer);
    };
  }, [duration, onComplete]);

  const currentTipData = TIPS[currentTip] ?? TIPS[0];
  const CurrentTipIcon = currentTipData.icon;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'radial-gradient(circle at 50% 40%, #21102f 0%, #0b1324 46%, #050510 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 220px rgba(0,0,0,0.88)' }} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: 0.4,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-6">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-amber-300 mb-3">Raging City Archive</p>
        <h1 className="text-4xl sm:text-6xl font-black italic tracking-tight text-white">LEGENDS OF KAI-JAX</h1>
        <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-amber-200 to-cyan-300">
          THE MEMORY KING
        </h2>
        <p className="mt-4 text-xs sm:text-sm uppercase tracking-[0.24em] text-slate-400">Forged in the Raging City. Crowned by Memory.</p>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-8 mt-auto mb-8 sm:mb-12">
        <div className="flex justify-between items-end mb-2">
          <span className="text-cyan-300 font-black tracking-widest text-[10px] uppercase">Loading field systems</span>
          <span className="text-amber-300 font-black text-lg">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%`, boxShadow: '0 0 16px rgba(56,189,248,0.34)' }}
          />
        </div>

        <div className="mt-5 flex items-center gap-3 px-5 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <CurrentTipIcon className="w-5 h-5 text-amber-300 flex-shrink-0" />
          <p className="text-slate-300 text-xs sm:text-sm">{currentTipData.text}</p>
        </div>
      </div>
    </div>
  );
}

export function GameIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'ready' | 'done'>('logo');

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase('tagline'), 1200),
      window.setTimeout(() => setPhase('ready'), 2600),
      window.setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 3500),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
      {phase === 'logo' && (
        <div className="text-center animate-[zoomIn_0.5s_ease-out] px-4">
          <h1 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-orange-400">
            LEGENDS
          </h1>
          <h2 className="text-4xl sm:text-6xl font-black -mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-white">
            OF KAI-JAX
          </h2>
          <p className="mt-5 text-sm sm:text-base font-black tracking-[0.28em] text-amber-300">THE MEMORY KING</p>
        </div>
      )}

      {phase === 'tagline' && (
        <div className="text-center animate-[fadeIn_0.5s_ease-out] px-6">
          <p className="text-2xl sm:text-3xl text-amber-300 font-bold mb-4 tracking-widest uppercase">The Raging City Remembers</p>
          <p className="text-lg sm:text-2xl font-black text-slate-100 uppercase tracking-[0.2em]">Forged in the Raging City. Crowned by Memory.</p>
        </div>
      )}

      {phase === 'ready' && (
        <div className="text-center animate-[zoomIn_0.3s_ease-out]">
          <h1 className="text-7xl sm:text-9xl font-black text-white animate-pulse" style={{ textShadow: '0 0 60px rgba(255,255,255,0.7)' }}>
            READY?
          </h1>
        </div>
      )}

      <style>{`
        @keyframes zoomIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
