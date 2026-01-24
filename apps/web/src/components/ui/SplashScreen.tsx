/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * SPLASH SCREEN - Transitions between scenes
 */

import { useState, useEffect } from 'react';
import { Zap, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  title?: string;
  subtitle?: string;
  duration?: number;
}

export default function SplashScreen({
  onComplete,
  title = 'KAI-JAX',
  subtitle = 'THE MEMORY HERO',
  duration = 1500,
}: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit' | 'done'>('enter');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('hold'), 500),
      setTimeout(() => setPhase('exit'), duration),
      setTimeout(() => {
        setPhase('done');
        onComplete();
      }, duration + 500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [duration, onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[9998] bg-gradient-to-br from-[#0a0a0f] via-purple-950 to-[#0a0a0f] flex items-center justify-center transition-opacity duration-500 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${10 + Math.random() * 20}px`,
              height: `${10 + Math.random() * 20}px`,
              background: `radial-gradient(circle, ${
                ['#88d0ff', '#ff6b6b', '#ffd700'][i % 3]
              }80, transparent)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className={`text-center transition-all duration-500 ${
          phase === 'enter' ? 'scale-110 opacity-0' : phase === 'exit' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Icon */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse" />
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-cyan-300">
            <Zap className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4"
          style={{
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            letterSpacing: '0.1em',
            textShadow: '0 0 30px rgba(136, 208, 255, 0.6)',
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="text-xl sm:text-2xl font-bold text-purple-300"
            style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
          >
            {subtitle}
          </p>
        )}

        {/* Sparkles */}
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(3)].map((_, i) => (
            <Sparkles
              key={i}
              className="w-5 h-5 text-amber-400 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}
