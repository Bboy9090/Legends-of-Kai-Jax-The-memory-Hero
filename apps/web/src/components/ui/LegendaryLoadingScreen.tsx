/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * LEGENDARY LOADING SCREEN
 * Epic transitions with beast wars theme
 */

import { useState, useEffect } from 'react';
import { Zap, Sparkles, Swords, Crown, Star, Flame, Shield, Trophy } from 'lucide-react';

interface LegendaryLoadingScreenProps {
  onComplete: () => void;
  duration?: number;
  message?: string;
  showProgress?: boolean;
}

export default function LegendaryLoadingScreen({
  onComplete,
  duration = 2000,
  message,
  showProgress = true,
}: LegendaryLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'complete' | 'done'>('loading');
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    { icon: Zap, text: 'Build SYNERGY by landing combos to transform into KAI-JAX!', color: 'from-yellow-400 to-orange-500' },
    { icon: Swords, text: 'Chain attacks together for devastating combos!', color: 'from-red-400 to-pink-500' },
    { icon: Crown, text: 'KAI-JAX form grants 1.5x damage and extended range!', color: 'from-purple-400 to-indigo-500' },
    { icon: Star, text: 'Perfect timing on attacks increases synergy gain!', color: 'from-cyan-400 to-blue-500' },
    { icon: Sparkles, text: 'The fusion timer lasts 30 seconds - make them count!', color: 'from-green-400 to-emerald-500' },
    { icon: Flame, text: 'Master flawless combat - arms, feet, punches, kicks!', color: 'from-orange-400 to-red-500' },
    { icon: Shield, text: 'Taunt, smirk, and encourage during battles!', color: 'from-blue-400 to-cyan-500' },
    { icon: Trophy, text: 'Complete 30 Beast Wars missions to unlock all content!', color: 'from-amber-400 to-yellow-500' },
  ];

  useEffect(() => {
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressInterval);
        setPhase('complete');
        setTimeout(() => {
          setPhase('done');
          setTimeout(onComplete, 300);
        }, 500);
      }
    }, 16);

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [duration, onComplete, tips.length]);

  if (phase === 'done') return null;

  const currentTipData = tips[currentTip] ?? tips[0]!;
  const CurrentTipIcon = currentTipData.icon;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0a0a0f] via-purple-950 to-[#0a0a0f] flex items-center justify-center">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              background: `linear-gradient(135deg, ${
                ['#88d0ff', '#ff6b6b', '#ffd700', '#a855f7', '#00ff88'][i % 5]
              }40, ${
                ['#88d0ff', '#ff6b6b', '#ffd700', '#a855f7', '#00ff88'][(i + 1) % 5]
              }40)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>

      {/* Central content */}
      <div className="relative z-10 text-center max-w-2xl w-full px-8">
        {/* Logo/Title */}
        <div className="mb-12 animate-in zoom-in duration-500">
          <div className="relative inline-block">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-60 animate-pulse" />
            
            {/* Main logo */}
            <h1
              className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 relative z-10"
              style={{
                fontFamily: "'Arial Black', 'Impact', sans-serif",
                letterSpacing: '0.1em',
                textShadow: '0 0 40px rgba(136, 208, 255, 0.8)',
              }}
            >
              KAI-JAX
            </h1>
          </div>
          <p
            className="text-2xl sm:text-3xl font-bold text-purple-300 mt-4"
            style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
          >
            THE MEMORY HERO
          </p>
        </div>

        {/* Loading message */}
        {message && (
          <p className="text-xl sm:text-2xl text-cyan-300 font-bold mb-8 animate-pulse">
            {message}
          </p>
        )}

        {/* Progress bar */}
        {showProgress && (
          <div className="mb-12">
            <div className="w-full max-w-md mx-auto h-3 bg-slate-800 rounded-full overflow-hidden border-2 border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2 font-bold">{Math.round(progress)}%</p>
          </div>
        )}

        {/* Tip display */}
        <div className="bg-slate-900/80 backdrop-blur-sm border-2 border-cyan-500/30 rounded-xl p-6 max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${currentTipData.color} shadow-lg`}>
              <CurrentTipIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm sm:text-base text-cyan-200 font-semibold text-left flex-1">
              {currentTipData.text}
            </p>
          </div>
        </div>

        {/* UEE Branding */}
        <p className="text-xs text-amber-400/70 font-semibold tracking-wider uppercase mt-8">
          Ultimate Entertainment Enterprises
        </p>
      </div>

      {/* Completion flash */}
      {phase === 'complete' && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-30 animate-in fade-in duration-500" />
      )}
    </div>
  );
}
