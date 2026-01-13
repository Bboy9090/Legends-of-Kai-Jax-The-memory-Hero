import React, { useEffect, useState } from 'react';
import { Heart, Zap, Activity, Clock, Trophy } from 'lucide-react';
import { gameStateManager, MatchState } from '../../packages/game/src/core/GameStateManager';
import '../styles/bronx_grit.css';

/**
 * MATCH OVERLAY — In-Game HUD (AETERNA COVENANT V1.3)
 * 
 * Displays:
 * - HP bars (P1 & P2) with vitality-bar styling
 * - Resonance meters with cyan glow
 * - Dread Pulse meter with 80%+ visual intensity (red glow + shake)
 * - Round timer
 * - Win indicators
 * - Combo counter
 * 
 * Aesthetic: Bronx Grit with dynamic Dread distortion
 * Dread 80%+: Triggers dread-active class for chromatic aberration + pulse
 */

interface MatchOverlayProps {
  isPaused?: boolean;
}

export const MatchOverlay: React.FC<MatchOverlayProps> = ({ isPaused = false }) => {
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const [dreadIntensity, setDreadIntensity] = useState(0); // 0-1 float
  const [dreadPulse, setDreadPulse] = useState(0);

  useEffect(() => {
    // Subscribe to game state changes
    const unsubscribe = gameStateManager.subscribe((state) => {
      setMatchState(state.match);
      
      // Update dread intensity (0-100 → 0-1)
      if (state.match?.p1) {
        const dreadLevel = state.match.p1.dread || 0;
        setDreadIntensity(dreadLevel / 100);
      }
    });

    // Initialize with current state
    setMatchState(gameStateManager.getState().match);

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Dread pulse animation
    const interval = setInterval(() => {
      setDreadPulse(Math.sin(Date.now() / 500) * 0.5 + 0.5);
    }, 16); // 60fps

    return () => clearInterval(interval);
  }, []);

  if (!matchState) {
    return null; // No match active
  }

  const { player1, player2, dreadLevel, roundTimer, currentRound } = matchState;

  // Calculate percentages
  const p1HpPercent = (player1.hp / player1.maxHp) * 100;
  const p2HpPercent = (player2.hp / player2.maxHp) * 100;
  const p1ResPercent = (player1.resonance / player1.maxResonance) * 100;
  const p2ResPercent = (player2.resonance / player2.maxResonance) * 100;

  // Dread intensity
  const dreadIntensity = 
    dreadLevel >= 80 ? 'extreme' :
    dreadLevel >= 60 ? 'high' :
    dreadLevel >= 40 ? 'medium' : 'low';

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-50 ${dreadIntensity >= 0.8 ? 'dread-active dread-filter-blur' : ''}`}
      style={{
        filter: dreadIntensity > 0.6 ? `contrast(${1 + dreadIntensity / 2})` : 'none',
      }}
    >
      {/* Grit Filter Overlay */}
      <div className="grit-filter" />

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center pointer-events-auto">
          <div className="text-center">
            <h1 className="text-legendary">PAUSED</h1>
            <p className="text-neutral-400 tracking-widest text-mono-small mt-4">Press ESC to resume</p>
          </div>
        </div>
      )}

      {/* TOP BAR: HP & Resonance */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-start justify-between gap-8">
          {/* PLAYER 1 */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Heart size={20} className="text-red-500" />
              <span className="text-mono-small text-white">
                {player1.name}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: player1.wins }).map((_, i) => (
                  <Trophy key={i} size={14} className="text-cyan-400 fill-cyan-400" />
                ))}
              </div>
            </div>
            
            {/* HP Bar */}
            <div className="ui-bar relative h-8">
              <div 
                className="ui-bar-fill vitality-bar"
                style={{
                  width: `${p1HpPercent}%`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm drop-shadow-lg">
                  {Math.ceil(player1.hp)}
                </span>
              </div>
            </div>

            {/* Resonance Bar */}
            <div className="ui-bar relative h-3 mt-1">
              <div 
                className={`ui-bar-fill resonance-bar ${p1ResPercent > 80 ? 'resonance-glow' : ''}`}
                style={{
                  width: `${p1ResPercent}%`,
                }}
              />
            </div>
            
            {player1.legacyConvergenceActive && (
              <div className="mt-1 text-mono-small text-cyan-400 animate-pulse">
                ⚡ Legacy Convergence Active
              </div>
            )}
          </div>

          {/* CENTER: Round Info & Timer */}
          <div className="text-center min-w-[200px]">
            <div className="bg-neutral-900/80 backdrop-blur-md border border-cyan-500/30 rounded px-6 py-3">
              <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Round {currentRound}</p>
              <div className="flex items-center justify-center gap-2">
                <Clock size={16} className="text-white" />
                <span className={`text-2xl font-bold ${
                  roundTimer < 10 ? 'text-red-500 animate-pulse' : 'text-white'
                }`}>
                  {formatTimer(roundTimer)}
                </span>
              </div>
            </div>
          </div>

          {/* PLAYER 2 */}
          <div className="flex-1">
            <div className="flex items-center justify-end gap-3 mb-2">
              <div className="flex gap-1">
                {Array.from({ length: player2.wins }).map((_, i) => (
                  <Trophy key={i} size={14} className="text-cyan-400 fill-cyan-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                {player2.name}
              </span>
              <Heart size={20} className="text-red-500" />
            </div>
            
            {/* HP Bar */}
            <div className="relative h-8 bg-neutral-900/80 backdrop-blur-sm border border-white/20 rounded overflow-hidden">
              <div 
                className="absolute top-0 right-0 h-full transition-all duration-300"
                style={{
                  width: `${p2HpPercent}%`,
                  background: p2HpPercent > 60 
                    ? 'linear-gradient(270deg, #22c55e, #16a34a)'
                    : p2HpPercent > 30
                      ? 'linear-gradient(270deg, #eab308, #ca8a04)'
                      : 'linear-gradient(270deg, #ef4444, #dc2626)',
                  boxShadow: p2HpPercent < 30 ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm drop-shadow-lg">
                  {Math.ceil(player2.hp)}
                </span>
              </div>
            </div>

            {/* Resonance Bar */}
            <div className="relative h-3 bg-neutral-900/60 backdrop-blur-sm border border-cyan-500/30 rounded overflow-hidden mt-1">
              <div 
                className="absolute top-0 right-0 h-full transition-all duration-200"
                style={{
                  width: `${p2ResPercent}%`,
                  background: 'linear-gradient(270deg, #06b6d4, #0891b2)',
                  boxShadow: p2ResPercent > 80 ? '0 0 15px rgba(6, 182, 212, 0.8)' : 'none',
                }}
              />
            </div>
            
            {player2.legacyConvergenceActive && (
              <div className="mt-1 text-xs font-bold text-cyan-400 uppercase animate-pulse text-right">
                Legacy Convergence Active ⚡
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT: Dread Pulse Meter - AETERNA COVENANT V1.3 */}
      <div className="absolute bottom-6 left-6">
        <div 
          className={`bg-neutral-900/80 backdrop-blur-md border rounded p-4 transition-all duration-300 ${dreadIntensity >= 0.8 ? 'shake-intense' : dreadIntensity >= 0.6 ? 'shake-mild' : ''}`}
          style={{
            borderColor: 
              dreadIntensity >= 0.8 ? 'rgba(239, 68, 68, 0.8)' :
              dreadIntensity >= 0.6 ? 'rgba(249, 115, 22, 0.6)' :
              dreadIntensity >= 0.4 ? 'rgba(234, 179, 8, 0.4)' :
              'rgba(255, 255, 255, 0.2)',
            boxShadow: dreadIntensity > 0.6 
              ? `0 0 ${20 + dreadPulse * 10}px rgba(239, 68, 68, ${0.3 + dreadPulse * 0.2})`
              : 'none',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className={
              dreadIntensity >= 0.8 ? 'text-red-500' :
              dreadIntensity >= 0.6 ? 'text-orange-500' :
              dreadIntensity >= 0.4 ? 'text-yellow-500' :
              'text-cyan-400'
            } />
            <span className="text-mono-small text-white">
              Dread Pulse
            </span>
          </div>
          
          <div className="ui-bar w-48 h-4">
            <div 
              className={`ui-bar-fill dread-bar ${dreadIntensity >= 0.8 ? 'animate-pulse' : ''}`}
              style={{
                width: `${dreadIntensity * 100}%`,
              }}
            />
          </div>
          
          <p className="text-xs text-grit mt-1">
            {Math.round(dreadIntensity * 100)}% — {
              dreadIntensity >= 0.8 ? 'EXTREME' :
              dreadIntensity >= 0.6 ? 'HIGH' :
              dreadIntensity >= 0.4 ? 'MEDIUM' :
              'LOW'
            }
          </p>
        </div>
      </div>

      {/* BOTTOM RIGHT: Combo Counter */}
      {comboCount > 0 && (
        <div className="absolute bottom-6 right-6">
          <div className="bg-neutral-900/80 backdrop-blur-md border border-cyan-500/50 rounded px-6 py-4">
            <div className="text-center">
              <span className="text-5xl font-black text-cyan-400 animate-pulse">
                {comboCount}
              </span>
              <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">
                Combo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Combat State Indicator (Debug/Training Mode) */}
      <div className="absolute top-32 left-6 text-xs text-neutral-500 font-mono">
        <div>P1: {player1.combatState}</div>
        <div>P2: {player2.combatState}</div>
      </div>
    </div>
  );
};

export default MatchOverlay;
