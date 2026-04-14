import React, { useEffect, useState, useCallback } from 'react';
import { Heart, Zap, Activity, Clock, Trophy, Flame, Star, Shield } from 'lucide-react';
import '../styles/bronx_grit.css';
import '../styles/legendary-effects.css';

/**
 * ⚡ LEGENDARY MATCH OVERLAY ⚡
 * Ultimate God-Tier HUD for Legends of Kai-Jax
 * 
 * Displays:
 * - HP bars with vitality styling and legendary effects
 * - Resonance meters with transformation thresholds
 * - Transformation indicator with tier display
 * - Dread Pulse meter with visual intensity
 * - Round timer with urgency effects
 * - Win indicators
 * - Combo counter with legendary styling
 * - Voice line display for transformations
 * 
 * Aesthetic: Bronx Grit + Legendary God-Tier Effects
 */

interface MatchOverlayProps {
  p1Hp: number;
  p2Hp: number;
  p1Resonance: number;
  p2Resonance: number;
  matchTime: number;
  winner: string | null;
  p1Name: string;
  p2Name: string;
  p1TransformationTier?: number;
  p2TransformationTier?: number;
  isPaused?: boolean;
  comboCount?: number;
  dreadLevel?: number;
  voiceLine?: string;
  // 🔥 LEGENDARY COMBAT DATA
  comboMultiplier?: number;
  comboTier?: string | null;
  p1Ultimate?: number;
  p2Ultimate?: number;
  p1Reflex?: number;
  p2Reflex?: number;
  slowMotionActive?: boolean;
  screenShakeActive?: boolean;
}

// Transformation tier names and colors
const TRANSFORMATION_TIERS = [
  { name: 'BASE', color: 'rgba(255, 255, 255, 0.5)', glow: 'none' },
  { name: 'AWAKENED', color: '#c084fc', glow: '0 0 15px rgba(192, 132, 252, 0.6)' },
  { name: 'SAGE', color: '#fbbf24', glow: '0 0 20px rgba(251, 191, 36, 0.7)' },
  { name: 'LEGENDARY', color: '#00d9ff', glow: '0 0 25px rgba(0, 217, 255, 0.8)' },
  { name: 'GOD', color: '#ffffff', glow: '0 0 30px rgba(255, 255, 255, 0.9), 0 0 60px rgba(255, 215, 0, 0.5)' },
];

export const MatchOverlay: React.FC<MatchOverlayProps> = ({
  p1Hp,
  p2Hp,
  p1Resonance,
  p2Resonance,
  matchTime,
  winner,
  p1Name,
  p2Name,
  p1TransformationTier = 0,
  p2TransformationTier = 0,
  isPaused = false,
  comboCount = 0,
  dreadLevel = 0,
  voiceLine,
  // 🔥 LEGENDARY COMBAT DATA
  comboMultiplier = 1.0,
  comboTier = null,
  p1Ultimate = 0,
  p2Ultimate = 0,
  p1Reflex = 0,
  p2Reflex = 0,
  slowMotionActive = false,
  screenShakeActive = false,
}) => {
  const [showVoiceLine, setShowVoiceLine] = useState(false);
  const [currentVoiceLine, setCurrentVoiceLine] = useState('');
  const [dreadPulse, setDreadPulse] = useState(0);
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);

  // Calculate percentages
  const p1HpPercent = Math.max(0, Math.min(100, p1Hp));
  const p2HpPercent = Math.max(0, Math.min(100, p2Hp));
  const p1ResPercent = Math.max(0, Math.min(100, p1Resonance));
  const p2ResPercent = Math.max(0, Math.min(100, p2Resonance));
  const dreadIntensity = dreadLevel / 100;

  // Get transformation tier info
  const p1Tier = TRANSFORMATION_TIERS[p1TransformationTier] || TRANSFORMATION_TIERS[0];
  const p2Tier = TRANSFORMATION_TIERS[p2TransformationTier] || TRANSFORMATION_TIERS[0];

  // Voice line effect
  useEffect(() => {
    if (voiceLine) {
      setCurrentVoiceLine(voiceLine);
      setShowVoiceLine(true);
      const timer = setTimeout(() => setShowVoiceLine(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [voiceLine]);

  // Dread pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDreadPulse(Math.sin(Date.now() / 500) * 0.5 + 0.5);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Format timer display
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get HP bar color based on percentage
  const getHpBarColor = (percent: number) => {
    if (percent > 60) return 'linear-gradient(90deg, #22c55e, #16a34a)';
    if (percent > 30) return 'linear-gradient(90deg, #eab308, #ca8a04)';
    return 'linear-gradient(90deg, #ef4444, #dc2626)';
  };

  // Get resonance bar style based on tier
  const getResonanceBarStyle = (percent: number, tier: number) => {
    const baseGradient = 'linear-gradient(90deg, #06b6d4, #0891b2)';
    const tierColors = [
      baseGradient,
      'linear-gradient(90deg, #c084fc, #9d4edd)',
      'linear-gradient(90deg, #fbbf24, #f59e0b)',
      'linear-gradient(90deg, #00d9ff, #0ea5e9)',
      'linear-gradient(90deg, #ffffff, #ffd700, #00f2ff)',
    ];
    return {
      background: tierColors[tier] || baseGradient,
      boxShadow: percent >= 25 ? TRANSFORMATION_TIERS[tier]?.glow || 'none' : 'none',
    };
  };

  // Dread level category
  const dreadLevelCategory = 
    dreadLevel >= 80 ? 'EXTREME' :
    dreadLevel >= 60 ? 'HIGH' :
    dreadLevel >= 40 ? 'MEDIUM' : 'LOW';

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-50 ${dreadIntensity >= 0.8 ? 'dread-active' : ''}`}
      style={{
        filter: dreadIntensity > 0.6 ? `contrast(${1 + dreadIntensity / 2})` : 'none',
      }}
    >
      {/* Grit Filter Overlay */}
      <div className="grit-filter" />

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center pointer-events-auto z-[100]">
          <div className="text-center">
            <h1 className="text-god-tier text-6xl mb-8">PAUSED</h1>
            <p className="text-neutral-400 tracking-widest text-mono-small mt-4 uppercase">
              Press ESC to resume
            </p>
          </div>
        </div>
      )}

      {/* Winner Overlay */}
      {winner && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center pointer-events-auto z-[100]">
          <div className="text-center">
            <h1 className="text-god-tier text-8xl mb-4 animate-pulse">
              {winner === 'draw' ? 'DRAW!' : 'VICTORY!'}
            </h1>
            {winner !== 'draw' && (
              <p className="text-4xl font-bold text-legendary-gold uppercase tracking-widest">
                {winner} WINS
              </p>
            )}
            <div className="mt-8 flex items-center justify-center gap-4">
              <Star className="text-legendary-gold w-8 h-8 animate-spin" />
              <p className="text-neutral-300 text-lg">Press any key to continue</p>
              <Star className="text-legendary-gold w-8 h-8 animate-spin" />
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR: HP, Resonance & Transformation */}
      <div className="absolute top-0 left-0 right-0 p-4 lg:p-6">
        <div className="flex items-start justify-between gap-4 lg:gap-8">
          
          {/* PLAYER 1 */}
          <div className="flex-1 max-w-[40%]">
            {/* Name & Wins Row */}
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="transformation-icon"
                style={{
                  borderColor: p1Tier.color,
                  boxShadow: p1Tier.glow,
                }}
              >
                <Flame size={24} style={{ color: p1Tier.color }} />
              </div>
              <div>
                <span className="text-mono-small text-white font-bold uppercase tracking-wider">
                  {p1Name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span 
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: p1Tier.color, textShadow: p1Tier.glow }}
                  >
                    {p1Tier.name}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: p1Wins }).map((_, i) => (
                      <Trophy key={i} size={12} className="text-legendary-gold fill-legendary-gold" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* HP Bar */}
            <div className="relative h-8 bg-neutral-900/80 backdrop-blur-sm border-2 border-white/20 rounded overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full transition-all duration-300"
                style={{
                  width: `${p1HpPercent}%`,
                  background: getHpBarColor(p1HpPercent),
                  boxShadow: p1HpPercent < 30 ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none',
                }}
              />
              {/* HP Shimmer */}
              <div className="absolute inset-0 overflow-hidden">
                <div 
                  className="absolute top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{ animation: 'bar-shimmer 2s linear infinite' }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart size={14} className="text-white/80 mr-2" />
                <span className="text-white font-bold text-sm drop-shadow-lg">
                  {Math.ceil(p1Hp)}
                </span>
              </div>
            </div>

            {/* Resonance Bar */}
            <div className="relative h-4 bg-neutral-900/60 backdrop-blur-sm border border-cyan-500/30 rounded overflow-hidden mt-2">
              <div 
                className={`absolute top-0 left-0 h-full transition-all duration-200 ${p1ResPercent >= 100 ? 'animate-pulse' : ''}`}
                style={{
                  width: `${p1ResPercent}%`,
                  ...getResonanceBarStyle(p1ResPercent, p1TransformationTier),
                }}
              />
              {/* Transformation thresholds */}
              <div className="absolute inset-0 flex">
                <div className="w-1/4 border-r border-white/20" title="Awakened" />
                <div className="w-1/4 border-r border-white/30" title="Sage" />
                <div className="w-1/4 border-r border-white/40" title="Legendary" />
                <div className="w-1/4" title="God" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={10} className="text-white/80 mr-1" />
                <span className="text-white font-bold text-xs drop-shadow-lg">
                  {Math.floor(p1Resonance)}%
                </span>
              </div>
            </div>
            
            {p1Resonance >= 100 && (
              <div className="mt-2 text-mono-small text-legendary-gold animate-pulse flex items-center gap-2">
                <Star size={14} className="fill-legendary-gold" />
                <span>GOD FORM READY</span>
                <Star size={14} className="fill-legendary-gold" />
              </div>
            )}
          </div>

          {/* CENTER: Round Info & Timer */}
          <div className="text-center min-w-[180px] lg:min-w-[220px]">
            <div className="bg-neutral-900/90 backdrop-blur-lg border-2 border-legendary-gold/30 rounded-lg px-4 lg:px-6 py-3 shadow-lg">
              <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1 font-bold">
                THE MEMORY KING
              </p>
              <div className="flex items-center justify-center gap-2">
                <Clock size={18} className="text-white" />
                <span className={`text-3xl lg:text-4xl font-black ${
                  matchTime < 10 ? 'text-red-500 animate-pulse' : 
                  matchTime < 30 ? 'text-yellow-500' : 'text-white'
                }`}>
                  {formatTimer(matchTime)}
                </span>
              </div>
              {matchTime < 30 && (
                <p className="text-xs text-red-400 uppercase mt-1 animate-pulse">
                  FINAL MOMENTS
                </p>
              )}
            </div>
          </div>

          {/* PLAYER 2 */}
          <div className="flex-1 max-w-[40%]">
            {/* Name & Wins Row */}
            <div className="flex items-center justify-end gap-3 mb-2">
              <div>
                <span className="text-mono-small text-white font-bold uppercase tracking-wider">
                  {p2Name}
                </span>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <div className="flex gap-1">
                    {Array.from({ length: p2Wins }).map((_, i) => (
                      <Trophy key={i} size={12} className="text-legendary-gold fill-legendary-gold" />
                    ))}
                  </div>
                  <span 
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: p2Tier.color, textShadow: p2Tier.glow }}
                  >
                    {p2Tier.name}
                  </span>
                </div>
              </div>
              <div 
                className="transformation-icon"
                style={{
                  borderColor: p2Tier.color,
                  boxShadow: p2Tier.glow,
                }}
              >
                <Flame size={24} style={{ color: p2Tier.color }} />
              </div>
            </div>
            
            {/* HP Bar */}
            <div className="relative h-8 bg-neutral-900/80 backdrop-blur-sm border-2 border-white/20 rounded overflow-hidden">
              <div 
                className="absolute top-0 right-0 h-full transition-all duration-300"
                style={{
                  width: `${p2HpPercent}%`,
                  background: getHpBarColor(p2HpPercent),
                  boxShadow: p2HpPercent < 30 ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm drop-shadow-lg">
                  {Math.ceil(p2Hp)}
                </span>
                <Heart size={14} className="text-white/80 ml-2" />
              </div>
            </div>

            {/* Resonance Bar */}
            <div className="relative h-4 bg-neutral-900/60 backdrop-blur-sm border border-cyan-500/30 rounded overflow-hidden mt-2">
              <div 
                className={`absolute top-0 right-0 h-full transition-all duration-200 ${p2ResPercent >= 100 ? 'animate-pulse' : ''}`}
                style={{
                  width: `${p2ResPercent}%`,
                  ...getResonanceBarStyle(p2ResPercent, p2TransformationTier),
                }}
              />
              {/* Transformation thresholds */}
              <div className="absolute inset-0 flex">
                <div className="w-1/4 border-r border-white/20" />
                <div className="w-1/4 border-r border-white/30" />
                <div className="w-1/4 border-r border-white/40" />
                <div className="w-1/4" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-xs drop-shadow-lg">
                  {Math.floor(p2Resonance)}%
                </span>
                <Zap size={10} className="text-white/80 ml-1" />
              </div>
            </div>
            
            {p2Resonance >= 100 && (
              <div className="mt-2 text-mono-small text-legendary-gold animate-pulse flex items-center justify-end gap-2">
                <Star size={14} className="fill-legendary-gold" />
                <span>GOD FORM READY</span>
                <Star size={14} className="fill-legendary-gold" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT: Dread Pulse Meter */}
      <div className="absolute bottom-6 left-6">
        <div 
          className={`bg-neutral-900/90 backdrop-blur-lg border-2 rounded-lg p-4 transition-all duration-300 ${
            dreadIntensity >= 0.8 ? 'shake-intense border-red-500' : 
            dreadIntensity >= 0.6 ? 'shake-mild border-orange-500' : 'border-white/20'
          }`}
          style={{
            boxShadow: dreadIntensity > 0.6 
              ? `0 0 ${20 + dreadPulse * 15}px rgba(239, 68, 68, ${0.4 + dreadPulse * 0.3})`
              : 'none',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className={
              dreadIntensity >= 0.8 ? 'text-red-500 animate-pulse' :
              dreadIntensity >= 0.6 ? 'text-orange-500' :
              dreadIntensity >= 0.4 ? 'text-yellow-500' :
              'text-cyan-400'
            } />
            <span className="text-mono-small text-white font-bold uppercase">
              Dread Pulse
            </span>
          </div>
          
          <div className="relative w-52 h-5 bg-neutral-800 rounded overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-200 ${dreadIntensity >= 0.8 ? 'animate-pulse' : ''}`}
              style={{
                width: `${dreadIntensity * 100}%`,
                background: dreadIntensity >= 0.8 
                  ? 'linear-gradient(90deg, #dc2626, #ef4444, #f87171)'
                  : dreadIntensity >= 0.6 
                    ? 'linear-gradient(90deg, #ea580c, #f97316)'
                    : dreadIntensity >= 0.4
                      ? 'linear-gradient(90deg, #ca8a04, #eab308)'
                      : 'linear-gradient(90deg, #0891b2, #06b6d4)',
              }}
            />
            {/* Threshold line at 80% */}
            <div className="absolute top-0 left-[80%] w-0.5 h-full bg-red-500/50" />
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-grit">
              {Math.round(dreadIntensity * 100)}%
            </p>
            <p className={`text-xs font-bold uppercase ${
              dreadLevelCategory === 'EXTREME' ? 'text-red-500 animate-pulse' :
              dreadLevelCategory === 'HIGH' ? 'text-orange-500' :
              dreadLevelCategory === 'MEDIUM' ? 'text-yellow-500' :
              'text-cyan-400'
            }`}>
              {dreadLevelCategory}
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT: LEGENDARY COMBO COUNTER 🔥 */}
      {comboCount > 0 && (
        <div className="absolute bottom-6 right-6">
          <div 
            className={`bg-neutral-900/90 backdrop-blur-lg border-2 rounded-lg px-6 py-4 ${
              comboTier === 'infinite' ? 'border-white animate-pulse' :
              comboTier === 'legendary' ? 'border-legendary-cyan' :
              comboTier === 'amazing' ? 'border-legendary-gold' :
              comboTier === 'great' ? 'border-purple-500' :
              'border-cyan-400'
            }`}
            style={{
              boxShadow: comboCount >= 50 
                ? '0 0 40px rgba(255, 255, 255, 0.8)' 
                : comboCount >= 20
                ? '0 0 30px rgba(0, 217, 255, 0.6)' 
                : comboCount >= 10
                ? '0 0 20px rgba(251, 191, 36, 0.5)'
                : '0 0 15px rgba(0, 217, 255, 0.3)',
            }}
          >
            <div className="text-center">
              <span className={`font-black drop-shadow-lg ${
                comboTier === 'infinite' ? 'text-7xl text-god-tier animate-pulse' :
                comboTier === 'legendary' ? 'text-7xl text-legendary-cyan' :
                comboTier === 'amazing' ? 'text-6xl text-legendary-gold' :
                comboCount >= 10 ? 'text-6xl text-legendary-cyan' :
                'text-5xl text-white'
              }`}>
                {comboCount}
              </span>
              <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1 font-bold">
                {comboTier === 'infinite' ? 'INFINITE COMBO!' :
                 comboTier === 'legendary' ? 'LEGENDARY COMBO!' :
                 comboTier === 'amazing' ? 'AMAZING COMBO!' :
                 comboTier === 'great' ? 'GREAT COMBO!' :
                 comboCount >= 5 ? 'GOOD COMBO!' : 'COMBO'}
              </p>
              {comboMultiplier > 1.0 && (
                <p className="text-sm font-bold text-legendary-gold mt-1">
                  {comboMultiplier.toFixed(1)}x DAMAGE
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 🔥 SLOW MOTION INDICATOR */}
      {slowMotionActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-cyan-500/20 backdrop-blur-md border-2 border-cyan-400 rounded-lg px-8 py-4 animate-pulse">
            <p className="text-4xl font-bold text-cyan-400 tracking-widest" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.8)' }}>
              SLOW MOTION
            </p>
          </div>
        </div>
      )}

      {/* BOTTOM CENTER: Controls Hint with LEGENDARY COMBAT 🔥 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-neutral-900/70 backdrop-blur-sm rounded-full px-6 py-2 border border-white/10">
          <p className="text-mono-small text-amber-400/80 text-xs uppercase tracking-wider">
            A/D - Move | SPACE - Jump | J - Attack | 🔥 SHIFT - Dodge | Q - Parry | ESC - Exit
          </p>
        </div>
      </div>

      {/* Voice Line Display */}
      {showVoiceLine && currentVoiceLine && (
        <div className="voice-line">
          "{currentVoiceLine}"
        </div>
      )}
    </div>
  );
};

export default MatchOverlay;
