import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
  variant?: "kaijax" | "lineage" | "random";
}

const loadingTips = [
  "Pyraxis sacrificed everything to protect the orphans...",
  "Thryxen's cold training forges the strongest warriors.",
  "Jaxon's electric quills can pierce any defense.",
  "Kaison's spider-sense warns of all danger.",
  "When fused, Kai-Jax wields the power of Memory itself.",
  "The Sabertooth Lineage mark: Oversized Fangs of legend.",
  "Raging City was once called the Bronx...",
  "Memory Strand Tails hold the echoes of fallen heroes.",
  "The Ouroboros cycle connects all timelines.",
  "Only those crowned by memory can save the multiverse."
];

const backgrounds = {
  kaijax: "/kai-jax-fusion.png",
  lineage: "/sabertooth-lineage.png"
};

export default function LoadingScreen({ 
  onComplete, 
  minDuration = 3000,
  variant = "random" 
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const selectedBg = variant === "kaijax" 
    ? backgrounds.kaijax 
    : variant === "lineage" 
      ? backgrounds.lineage 
      : backgrounds.lineage;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setFadeOut(true);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 3000);
    return () => clearInterval(tipInterval);
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-end transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        backgroundImage: `url(${selectedBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      
      <div className="relative z-10 w-full max-w-2xl px-8 pb-16">
        <p 
          className="text-center text-gray-300 text-sm mb-4 italic transition-opacity duration-500"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
        >
          {loadingTips[tipIndex]}
        </p>
        
        <div className="relative">
          <div className="text-center mb-2">
            <span 
              className="text-xs font-bold tracking-[0.3em] text-cyan-400"
              style={{ 
                fontFamily: "'Arial Black', 'Impact', sans-serif",
                textShadow: '0 0 10px rgba(0,191,255,0.5)'
              }}
            >
              OUROBOROS PROGRESS
            </span>
          </div>
          
          <div 
            className="h-3 rounded-full overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
              border: '1px solid rgba(0,191,255,0.3)',
              boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            <div 
              className="h-full transition-all duration-200 rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #00bfff 0%, #00ff88 50%, #ffaa00 100%)',
                boxShadow: '0 0 10px rgba(0,191,255,0.8), 0 0 20px rgba(0,255,136,0.5)'
              }}
            />
          </div>
          
          <div className="absolute -right-6 top-1/2 transform translate-y-1">
            <span className="text-lg">✦</span>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <span className="text-gray-500 text-xs tracking-wider">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
