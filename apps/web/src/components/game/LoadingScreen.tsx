import { useState, useEffect } from "react";
import { Zap, Sparkles, Swords, Crown, Star } from "lucide-react";

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
    { icon: Zap, text: "Build SYNERGY by landing combos to transform into KAI-JAX!" },
    { icon: Swords, text: "Chain attacks together for devastating combos!" },
    { icon: Crown, text: "KAI-JAX form grants 1.5x damage and extended range!" },
    { icon: Star, text: "Perfect timing on attacks increases synergy gain!" },
    { icon: Sparkles, text: "The fusion timer lasts 30 seconds - make them count!" },
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
        background: `
          radial-gradient(ellipse at center, rgba(30,10,60,0.9) 0%, rgba(10,10,30,0.95) 100%),
          linear-gradient(180deg, #0a0a1a 0%, #1a0a3a 100%)
        `,
      }}
    >
      {/* Animated Background */}
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
      
      {/* Logo */}
      <div className="relative z-10 text-center mb-12">
        <h1 
          className="text-5xl sm:text-6xl md:text-7xl font-black"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FF6B6B, #A855F7, #00FFFF)',
            backgroundSize: '300% 300%',
            animation: 'gradient-shift 3s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.5))',
          }}
        >
          SMASH HEROES
        </h1>
        <p className="text-2xl text-cyan-400 font-bold mt-2 tracking-widest">ULTIMATE</p>
      </div>
      
      {/* Loading Bar */}
      <div className="relative z-10 w-80 sm:w-96 mb-8">
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 via-purple-500 to-cyan-400 transition-all duration-100"
            style={{ 
              width: `${progress}%`,
              boxShadow: '0 0 20px rgba(255,215,0,0.5)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-400">Loading...</span>
          <span className="text-yellow-400 font-bold">{Math.round(progress)}%</span>
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
        <div className="text-6xl transform -scale-x-100">🦊</div>
        <div className="text-8xl">⚡</div>
        <div className="text-6xl">🦔</div>
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
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'ready' | 'done'>('logo');
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('tagline'), 1500),
      setTimeout(() => setPhase('ready'), 3000),
      setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 4000),
    ];
    
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);
  
  if (phase === 'done') return null;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
      {/* Logo Phase */}
      {phase === 'logo' && (
        <div className="text-center animate-[zoomIn_0.5s_ease-out]">
          <h1 
            className="text-7xl sm:text-8xl md:text-9xl font-black"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FF6B6B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 50px rgba(255,215,0,0.8))',
            }}
          >
            SMASH
          </h1>
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl font-black -mt-4"
            style={{
              background: 'linear-gradient(135deg, #00FFFF, #A855F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(0,255,255,0.6))',
            }}
          >
            HEROES
          </h1>
        </div>
      )}
      
      {/* Tagline Phase */}
      {phase === 'tagline' && (
        <div className="text-center animate-[fadeIn_0.5s_ease-out]">
          <p className="text-2xl sm:text-3xl text-white font-medium mb-4">
            "When two become one..."
          </p>
          <p 
            className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text"
            style={{
              background: 'linear-gradient(90deg, #FFD700, #A855F7, #00FFFF)',
              WebkitBackgroundClip: 'text',
            }}
          >
            THE MEMORY HERO WAKES
          </p>
        </div>
      )}
      
      {/* Ready Phase */}
      {phase === 'ready' && (
        <div className="text-center animate-[zoomIn_0.3s_ease-out]">
          <h1 
            className="text-8xl sm:text-9xl font-black text-white animate-pulse"
            style={{ textShadow: '0 0 60px rgba(255,255,255,0.8)' }}
          >
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
