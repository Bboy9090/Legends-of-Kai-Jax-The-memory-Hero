import { useState, useEffect } from "react";
import { Zap, Sparkles, Swords, Crown, Star } from "lucide-react";
import { BRAND } from "../../lib/brand";

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number;
}

// ⚡ LEGENDARY LOADING SCREEN
export default function LoadingScreen({ onComplete, duration = 3000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  
  const tips = [
    { icon: Zap, text: "Build SYNERGY by landing combos—then unleash the Memory Weave." },
    { icon: Swords, text: "Chain attacks together for devastating combos!" },
    { icon: Crown, text: "Kai‑Jax hits harder in Resonance Flow—control space and end rounds fast." },
    { icon: Star, text: "Perfect timing on attacks increases synergy gain!" },
    { icon: Sparkles, text: "Resonance Flow lasts 30 seconds—make every hit count." },
  ];
  
  useEffect(() => {
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(progressInterval);
        setFadeOut(true);
        setTimeout(onComplete, 500);
      }
    }, 16);
    
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 2000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [duration, onComplete, tips.length]);
  
  const currentTipData = tips[currentTip] ?? tips[0]!;
  const CurrentTipIcon = currentTipData.icon;
  
  return (
    <div 
      className={`
        fixed inset-0 z-[200] flex flex-col items-center justify-center
        transition-opacity duration-500
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
      style={{
        background: 'linear-gradient(to bottom, #0a0a1a, #1a0a2e)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 220px rgba(0,0,0,0.85)' }} />
      
      {/* Self-contained release background: no remote/CDN dependency. */}
      <div className="absolute inset-0 flex overflow-hidden opacity-40" aria-hidden="true">
        <div
          className="w-1/2 h-full"
          style={{
            background:
              "radial-gradient(circle at 30% 45%, rgba(255,69,0,0.42), transparent 42%), linear-gradient(135deg, rgba(88,28,135,0.28), transparent 65%)",
          }}
        />
        <div
          className="w-1/2 h-full"
          style={{
            background:
              "radial-gradient(circle at 70% 45%, rgba(0,206,209,0.42), transparent 42%), linear-gradient(225deg, rgba(30,64,175,0.28), transparent 65%)",
          }}
        />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              backgroundColor: ['#FFD700', '#00FFFF', '#A855F7', '#FF6B6B'][Math.floor(Math.random() * 4)],
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Loading Bar Center - Ouroboros Progress Style */}
      <div className="relative z-10 w-full max-w-2xl px-12 mt-auto mb-20">
        <div className="flex justify-between items-end mb-2">
           <span className="text-cyan-400 font-black tracking-tighter text-sm uppercase">Ouroboros Progress</span>
           <span className="text-yellow-400 font-black text-xl">{Math.round(progress)}%</span>
        </div>
        <div className="h-4 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5 backdrop-blur-md">
          <div 
            className="h-full bg-gradient-to-r from-orange-600 via-purple-500 to-cyan-400 rounded-full transition-all duration-100 relative"
            style={{ 
              width: `${progress}%`,
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
            }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
          </div>
        </div>
      </div>
      
      {/* Logo/Titles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="flex gap-12 items-center justify-center mb-8">
           <div className="text-orange-500 font-black text-4xl tracking-tighter opacity-80 uppercase">The Shield's Warmth</div>
           <div className="text-cyan-400 font-black text-4xl tracking-tighter opacity-80 uppercase">The Mentor's Vigil</div>
        </div>
      </div>

      
      {/* Tip Display */}
      <div className="relative z-10 max-w-md text-center">
        <div 
          className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
          key={currentTip}
          style={{ animation: 'fadeIn 0.5s ease-out' }}
        >
          <CurrentTipIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
          <p className="text-gray-300 text-sm sm:text-base">{currentTipData.text}</p>
        </div>
      </div>
      
      {/* Character Silhouettes */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-8 opacity-30">
        <div className="text-6xl transform -scale-x-100">🐺</div>
        <div className="text-8xl">👑</div>
        <div className="text-6xl">🦊</div>
      </div>
      
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ⚡ GAME INTRO SEQUENCE
export function GameIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'crest' | 'city' | 'ready' | 'done'>('crest');

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase('city'), 1200),
      window.setTimeout(() => setPhase('ready'), 2600),
      window.setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 3900),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    const skip = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Escape') return;
      event.preventDefault();
      setPhase('done');
      onComplete();
    };
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      data-testid="game-intro"
      className="kj-vision-shell fixed inset-0 z-[200] overflow-hidden bg-[linear-gradient(rgba(2,3,7,.38),rgba(2,3,7,.76)),url('/models/ruined_city_bg.jpg')] bg-cover bg-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_28%,rgba(157,78,221,.20),transparent_26%),linear-gradient(90deg,rgba(0,0,0,.7),transparent_58%)]" />

      <div className="relative z-10 flex h-full items-center justify-center px-8 text-center">
        {phase === 'crest' && (
          <div className="animate-[zoomIn_.6s_ease-out]">
            <div className="mb-4 text-4xl text-[#c69b55]">✦</div>
            <div className="text-xs uppercase tracking-[0.62em] text-[#a88d62]">Legends of</div>
            <h1 className="kj-vision-title mt-3 text-[clamp(62px,10vw,150px)] font-black leading-none">
              KAI<span className="text-purple-400">✦</span>JAX
            </h1>
            <div className="kj-vision-divider mx-auto mt-6 max-w-2xl" />
          </div>
        )}

        {phase === 'city' && (
          <div className="max-w-4xl animate-[fadeIn_.6s_ease-out]">
            <p className="text-xs uppercase tracking-[0.55em] text-[#a88d62]">The Raging City</p>
            <h2 className="kj-vision-subtitle mt-5 text-[clamp(28px,4vw,58px)]">The Memory King</h2>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 tracking-[0.12em] text-[#d4c2a0] sm:text-lg">
              Forged in the Raging City. Crowned by Memory.
            </p>
          </div>
        )}

        {phase === 'ready' && (
          <div className="animate-[zoomIn_.35s_ease-out]">
            <p className="text-xs uppercase tracking-[0.42em] text-[#9e8967]">Memory wakes. The city remembers.</p>
            <h2 className="kj-vision-title mt-5 text-[clamp(42px,7vw,92px)]">Enter The City</h2>
            <div className="mt-8 text-[10px] uppercase tracking-[0.32em] text-purple-300/80">Press Enter / Space to skip</div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[0.34em] text-[#756a58]">
        We take. We hold. We hunt.
      </div>

      <style>{`
        @keyframes zoomIn {
          from { transform: scale(.82); opacity: 0; filter: blur(10px); }
          to { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
