import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { type CinematicScene, type StoryBeat } from '../../lib/cinematicStory';

interface CinematicPlayerProps {
  scene: CinematicScene;
  onComplete: () => void;
  onSkip?: () => void;
}

const EMOTION_COLORS: Record<string, string> = {
  neutral: '#ffffff',
  angry: '#ff4444',
  sad: '#6688ff',
  happy: '#ffdd44',
  determined: '#ff8844',
  fear: '#aa66ff',
  mysterious: '#66ffdd'
};

const SPEAKER_COLORS: Record<string, string> = {
  'Jaxon': '#00ffff',
  'Kaison': '#aa66ff',
  'Kai-Jax': '#ffaa00',
  'Boryn': '#ff6600',
  'Boryx Zenith': '#00ddff',
  'The Hollow King': '#ff0000',
  'Ancient Voice': '#ffdd00',
  'Fang Enforcer': '#ff4444'
};

interface ParticleData {
  id: number;
  left: number;
  height: number;
  duration: number;
  delay: number;
}

function generateParticles(count: number, seed: number): ParticleData[] {
  const particles: ParticleData[] = [];
  for (let i = 0; i < count; i++) {
    const pseudoRandom = (seed * (i + 1) * 9301 + 49297) % 233280;
    const rand1 = pseudoRandom / 233280;
    const rand2 = ((pseudoRandom * 7) % 233280) / 233280;
    const rand3 = ((pseudoRandom * 13) % 233280) / 233280;
    const rand4 = ((pseudoRandom * 17) % 233280) / 233280;
    
    particles.push({
      id: i,
      left: rand1 * 100,
      height: 15 + rand2 * 20,
      duration: 0.5 + rand3 * 0.5,
      delay: rand4 * 2
    });
  }
  return particles;
}

export default function CinematicPlayer({ scene, onComplete, onSkip }: CinematicPlayerProps) {
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContinue, setShowContinue] = useState(false);
  const [visualEffect, setVisualEffect] = useState<string | null>(null);
  const [cameraEffect, setCameraEffect] = useState<string | null>(null);
  const [fadeOpacity, setFadeOpacity] = useState(0);
  
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentBeat = scene.beats[currentBeatIndex];
  
  const rainParticles = useMemo(() => generateParticles(50, 12345), []);
  const emberParticles = useMemo(() => generateParticles(30, 67890), []);
  
  const clearTimers = useCallback(() => {
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
  }, []);
  
  useEffect(() => {
    setFadeOpacity(1);
    return () => {
      clearTimers();
    };
  }, [clearTimers]);
  
  useEffect(() => {
    if (!currentBeat) {
      onComplete();
      return;
    }
    
    setDisplayedText('');
    setIsTyping(true);
    setShowContinue(false);
    
    if (currentBeat.visualEffect) {
      setVisualEffect(currentBeat.visualEffect);
      setTimeout(() => setVisualEffect(null), 1000);
    }
    
    if (currentBeat.cameraMove) {
      setCameraEffect(currentBeat.cameraMove);
      setTimeout(() => setCameraEffect(null), 800);
    }
    
    const text = currentBeat.text;
    let charIndex = 0;
    const typingSpeed = currentBeat.type === 'narration' ? 35 : 25;
    
    const typeNextChar = () => {
      if (charIndex < text.length) {
        setDisplayedText(text.substring(0, charIndex + 1));
        charIndex++;
        typewriterRef.current = setTimeout(typeNextChar, typingSpeed);
      } else {
        setIsTyping(false);
        setShowContinue(true);
        
        if (currentBeat.type === 'narration' || currentBeat.type === 'action' || currentBeat.type === 'transition') {
          const duration = currentBeat.duration || 3000;
          autoAdvanceRef.current = setTimeout(() => {
            advanceBeat();
          }, duration);
        }
      }
    };
    
    typewriterRef.current = setTimeout(typeNextChar, 100);
    
    return () => clearTimers();
  }, [currentBeatIndex, currentBeat, clearTimers]);
  
  const advanceBeat = useCallback(() => {
    clearTimers();
    if (currentBeatIndex < scene.beats.length - 1) {
      setCurrentBeatIndex(prev => prev + 1);
    } else {
      setFadeOpacity(0);
      setTimeout(() => onComplete(), 500);
    }
  }, [currentBeatIndex, scene.beats.length, onComplete, clearTimers]);
  
  const handleClick = () => {
    if (isTyping) {
      clearTimers();
      setDisplayedText(currentBeat.text);
      setIsTyping(false);
      setShowContinue(true);
    } else {
      advanceBeat();
    }
  };
  
  const handleSkip = () => {
    clearTimers();
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };
  
  const getBackgroundStyle = () => {
    const timeColors: Record<string, string> = {
      dawn: 'linear-gradient(to bottom, #ff6b35, #2d1b4e)',
      day: 'linear-gradient(to bottom, #87CEEB, #4a90a4)',
      dusk: 'linear-gradient(to bottom, #ff4500, #1a0a2e)',
      night: 'linear-gradient(to bottom, #0a0a1a, #1a1a3a)'
    };
    return timeColors[scene.timeOfDay] || timeColors.night;
  };
  
  const getWeatherOverlay = () => {
    switch (scene.weather) {
      case 'rain':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {rainParticles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-0.5 bg-blue-300/30"
                style={{
                  left: `${particle.left}%`,
                  top: '-20px',
                  height: `${particle.height}px`,
                  animation: `rain ${particle.duration}s linear infinite`,
                  animationDelay: `${particle.delay}s`
                }}
              />
            ))}
          </div>
        );
      case 'storm':
        return (
          <>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {rainParticles.map((particle) => (
                <div
                  key={particle.id}
                  className="absolute w-0.5 bg-blue-300/50"
                  style={{
                    left: `${particle.left}%`,
                    top: '-20px',
                    height: `${particle.height + 10}px`,
                    animation: `rain ${particle.duration * 0.7}s linear infinite`,
                    animationDelay: `${particle.delay * 0.5}s`
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-purple-900/10 pointer-events-none animate-pulse" />
          </>
        );
      case 'ember_rain':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {emberParticles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-2 h-2 rounded-full bg-orange-500/60"
                style={{
                  left: `${particle.left}%`,
                  bottom: '-20px',
                  animation: `ember ${2 + particle.duration}s ease-out infinite`,
                  animationDelay: `${particle.delay * 1.5}s`
                }}
              />
            ))}
          </div>
        );
      case 'fog':
        return (
          <div className="absolute inset-0 bg-gray-400/20 pointer-events-none" />
        );
      default:
        return null;
    }
  };
  
  const getVisualEffectOverlay = () => {
    switch (visualEffect) {
      case 'flash':
        return <div className="absolute inset-0 bg-white animate-pulse pointer-events-none" style={{ animation: 'flash 0.3s ease-out' }} />;
      case 'darken':
        return <div className="absolute inset-0 bg-black/50 pointer-events-none transition-opacity duration-500" />;
      case 'ember':
        return (
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 100px rgba(255, 100, 0, 0.3)' }} />
        );
      case 'lightning':
        return <div className="absolute inset-0 bg-cyan-400/30 pointer-events-none" style={{ animation: 'lightning 0.2s ease-out' }} />;
      case 'memory_swirl':
        return (
          <div className="absolute inset-0 pointer-events-none" style={{ 
            background: 'radial-gradient(circle at center, rgba(170, 100, 255, 0.4) 0%, transparent 70%)',
            animation: 'pulse 1s ease-in-out'
          }} />
        );
      default:
        return null;
    }
  };
  
  const getCameraClass = () => {
    switch (cameraEffect) {
      case 'shake':
        return 'animate-shake';
      case 'zoom_in':
        return 'scale-105 transition-transform duration-500';
      case 'zoom_out':
        return 'scale-95 transition-transform duration-500';
      case 'pan_left':
        return 'animate-pan-left';
      case 'pan_right':
        return 'animate-pan-right';
      case 'fade':
        return 'animate-fade-transition';
      default:
        return '';
    }
  };
  
  const renderBeatContent = () => {
    if (!currentBeat) return null;
    
    switch (currentBeat.type) {
      case 'narration':
        return (
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto bg-black/80 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <p className="text-gray-300 text-lg italic leading-relaxed text-center">
                {displayedText}
              </p>
            </div>
          </div>
        );
        
      case 'dialogue':
        const speakerColor = SPEAKER_COLORS[currentBeat.speaker || ''] || '#ffffff';
        const emotionColor = EMOTION_COLORS[currentBeat.emotion || 'neutral'];
        return (
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black shrink-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${speakerColor}40, ${speakerColor}10)`,
                    border: `3px solid ${speakerColor}`,
                    boxShadow: `0 0 20px ${speakerColor}40`
                  }}
                >
                  {currentBeat.speaker?.[0] || '?'}
                </div>
                
                <div className="flex-1 bg-black/80 backdrop-blur-sm rounded-lg p-5 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <span 
                      className="font-black text-xl"
                      style={{ color: speakerColor }}
                    >
                      {currentBeat.speaker}
                    </span>
                    {currentBeat.speakerTitle && (
                      <span className="text-gray-500 text-sm">
                        — {currentBeat.speakerTitle}
                      </span>
                    )}
                  </div>
                  <p 
                    className="text-lg leading-relaxed"
                    style={{ color: emotionColor }}
                  >
                    {displayedText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'action':
        return (
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto bg-red-900/40 backdrop-blur-sm rounded-lg p-6 border border-red-500/30">
              <p className="text-red-200 text-lg font-bold text-center uppercase tracking-wider">
                {displayedText}
              </p>
            </div>
          </div>
        );
        
      case 'transition':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/80 text-2xl font-bold tracking-[0.3em] uppercase">
                {displayedText}
              </p>
            </div>
          </div>
        );
        
      case 'reveal':
        const revealColor = SPEAKER_COLORS[currentBeat.speaker || ''] || '#ffdd00';
        return (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div 
              className="max-w-3xl text-center p-8 rounded-xl"
              style={{
                background: `radial-gradient(ellipse at center, ${revealColor}20 0%, transparent 70%)`,
                border: `2px solid ${revealColor}50`
              }}
            >
              {currentBeat.speaker && (
                <p 
                  className="text-sm tracking-[0.4em] uppercase mb-4"
                  style={{ color: revealColor }}
                >
                  {currentBeat.speakerTitle || currentBeat.speaker}
                </p>
              )}
              <p 
                className="text-3xl font-bold italic leading-relaxed"
                style={{ color: revealColor }}
              >
                {displayedText}
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`fixed inset-0 z-50 overflow-hidden cursor-pointer ${getCameraClass()}`}
      onClick={handleClick}
      style={{ 
        background: getBackgroundStyle(),
        opacity: fadeOpacity,
        transition: 'opacity 0.5s ease-in-out'
      }}
    >
      {getWeatherOverlay()}
      {getVisualEffectOverlay()}
      
      <div className="absolute top-4 left-4 z-20">
        <p className="text-white/60 text-xs tracking-wider uppercase">{scene.location}</p>
        <h2 className="text-white font-bold text-lg">{scene.title}</h2>
      </div>
      
      <button
        onClick={(e) => { e.stopPropagation(); handleSkip(); }}
        className="absolute top-4 right-4 z-20 px-4 py-2 bg-black/50 hover:bg-black/70 text-gray-400 hover:text-white text-sm rounded transition-colors"
      >
        SKIP
      </button>
      
      <div className="absolute bottom-4 right-4 z-20 text-gray-500 text-xs">
        {currentBeatIndex + 1} / {scene.beats.length}
      </div>
      
      {renderBeatContent()}
      
      {showContinue && currentBeat?.type === 'dialogue' && (
        <div className="absolute bottom-6 right-8 z-20">
          <div className="text-white/60 text-sm animate-pulse">
            Click to continue...
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes rain {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        
        @keyframes ember {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
        
        @keyframes flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes lightning {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes pan-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-30px); }
        }
        
        @keyframes pan-right {
          0% { transform: translateX(0); }
          100% { transform: translateX(30px); }
        }
        
        @keyframes fade-transition {
          0% { opacity: 0; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .animate-pan-left {
          animation: pan-left 0.8s ease-out forwards;
        }
        
        .animate-pan-right {
          animation: pan-right 0.8s ease-out forwards;
        }
        
        .animate-fade-transition {
          animation: fade-transition 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
