import { useState, useEffect, useRef } from 'react';
import { PILLARS, type PillarType } from '../../lib/ragingCityCampaign';

interface GameHUDProps {
  health: number;
  maxHealth: number;
  dread: number;
  fusion: number;
  maxFusion: number;
  fusionLocked: boolean;
  isNearDeath: boolean;
  onHit?: boolean;
  currentPillar?: PillarType;
  showMinimal?: boolean;
}

export default function GameHUD({
  health,
  maxHealth,
  dread,
  fusion,
  maxFusion,
  fusionLocked,
  isNearDeath,
  onHit = false,
  currentPillar = 'memory',
  showMinimal = false
}: GameHUDProps) {
  const [shaking, setShaking] = useState(false);
  const [dreadPulsing, setDreadPulsing] = useState(false);
  const healthBarRef = useRef<HTMLDivElement>(null);
  
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const fusionPercent = Math.max(0, Math.min(100, (fusion / maxFusion) * 100));
  
  useEffect(() => {
    if (onHit) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 200);
      return () => clearTimeout(timer);
    }
  }, [onHit]);
  
  useEffect(() => {
    if (dread > 50) {
      setDreadPulsing(true);
    } else {
      setDreadPulsing(false);
    }
  }, [dread]);
  
  const getHealthColor = () => {
    if (isNearDeath) return '#ff6600';
    if (healthPercent < 30) return '#ff4444';
    if (healthPercent < 60) return '#ffaa00';
    return '#ff3333';
  };
  
  const getFusionGradient = () => {
    if (fusionLocked) return 'linear-gradient(90deg, #444 0%, #666 100%)';
    return `linear-gradient(90deg, #00bfff 0%, #ffd700 ${fusionPercent}%, #00bfff 100%)`;
  };
  
  if (showMinimal) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <div 
          className={`w-48 h-4 rounded-full overflow-hidden border-2 border-gray-700 ${shaking ? 'animate-shake' : ''}`}
          style={{ boxShadow: `0 0 10px ${getHealthColor()}40` }}
        >
          <div 
            className="h-full transition-all duration-200"
            style={{ 
              width: `${healthPercent}%`,
              background: `linear-gradient(90deg, ${getHealthColor()} 0%, ${isNearDeath ? '#ff9900' : '#ff6666'} 100%)`
            }}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div 
        ref={healthBarRef}
        className={`absolute top-4 left-4 ${shaking ? 'animate-shake' : ''}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-bold text-xs tracking-wider" style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}>
            HP
          </span>
          <span className="text-gray-400 text-xs">
            {Math.floor(health)}/{maxHealth}
          </span>
        </div>
        
        <div 
          className="w-56 h-6 rounded-sm overflow-hidden relative"
          style={{ 
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            border: `2px solid ${isNearDeath ? '#ff6600' : '#333'}`,
            boxShadow: isNearDeath ? '0 0 20px rgba(255, 100, 0, 0.5)' : 'none'
          }}
        >
          <div 
            className="absolute inset-0 transition-all duration-300"
            style={{ 
              width: `${healthPercent}%`,
              background: `linear-gradient(180deg, ${getHealthColor()} 0%, ${isNearDeath ? '#cc4400' : '#aa2222'} 100%)`,
              boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3)`
            }}
          />
          
          {isNearDeath && (
            <div 
              className="absolute inset-0 animate-pulse"
              style={{ 
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 100, 0, 0.3) 50%, transparent 100%)'
              }}
            />
          )}
          
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)'
            }}
          />
        </div>
        
        {currentPillar && (
          <div className="mt-2 flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ background: PILLARS[currentPillar].hex }}
            />
            <span 
              className="text-xs font-bold tracking-wider uppercase"
              style={{ color: PILLARS[currentPillar].hex }}
            >
              {currentPillar}
            </span>
          </div>
        )}
      </div>
      
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2 mb-1 justify-end">
          <span className="text-gray-400 text-xs">DREAD</span>
        </div>
        
        <div 
          className={`w-32 h-4 rounded-sm overflow-hidden ${dreadPulsing ? 'animate-pulse' : ''}`}
          style={{ 
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            border: `2px solid ${dread > 70 ? '#000' : '#222'}`,
            boxShadow: dread > 50 ? '0 0 15px rgba(0, 0, 0, 0.8)' : 'none'
          }}
        >
          <div 
            className="h-full transition-all duration-500"
            style={{ 
              width: `${dread}%`,
              background: `linear-gradient(90deg, #222 0%, #000 100%)`,
            }}
          />
          
          {dread > 70 && (
            <div 
              className="absolute inset-0"
              style={{ 
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 70%)',
                animation: 'pulse 1s ease-in-out infinite'
              }}
            />
          )}
        </div>
        
        {dread > 80 && (
          <p className="text-xs text-red-900 mt-1 text-right animate-pulse">
            ARCHITECT PRESENCE
          </p>
        )}
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 mb-1 justify-center">
          <span 
            className="text-xs font-bold tracking-wider"
            style={{ 
              color: fusionLocked ? '#666' : '#00bfff',
              fontFamily: "'Arial Black', 'Impact', sans-serif"
            }}
          >
            {fusionLocked ? 'FUSION DENIED' : 'RESONANCE'}
          </span>
        </div>
        
        <div 
          className="w-64 h-5 rounded-full overflow-hidden relative"
          style={{ 
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            border: fusionLocked ? '2px solid #444' : '2px solid #00bfff40',
            boxShadow: fusionLocked ? 'none' : '0 0 20px rgba(0, 191, 255, 0.3)'
          }}
        >
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${fusionPercent}%`,
              background: getFusionGradient()
            }}
          />
          
          {fusionLocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-6 h-6 rounded-full border-2 border-gray-500 flex items-center justify-center"
                style={{ background: '#222' }}
              >
                <span className="text-gray-500 text-xs">X</span>
              </div>
            </div>
          )}
          
          {!fusionLocked && fusionPercent >= 100 && (
            <div 
              className="absolute inset-0 animate-pulse"
              style={{ 
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.4) 50%, transparent 100%)'
              }}
            />
          )}
        </div>
        
        {!fusionLocked && fusionPercent >= 100 && (
          <p 
            className="text-xs font-bold text-center mt-1 animate-pulse"
            style={{ 
              color: '#ffd700',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
            }}
          >
            FUSION READY - PRESS T
          </p>
        )}
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
