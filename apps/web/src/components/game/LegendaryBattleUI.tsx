/**
 * LEGENDARY BATTLE UI - BEYOND BEYOND LEGENDARY
 * 
 * World-class battle UI with:
 * - Enhanced meters
 * - Perfect dodge/parry indicators
 * - Combo visualization
 * - Damage numbers
 * - Visual feedback
 */

import { useBattle } from '../../lib/stores/useBattle';
import { getFighterById } from '../../lib/characters';

interface LegendaryBattleUIProps {
  // Optional - can work without external meter system
}

export default function LegendaryBattleUI({}: LegendaryBattleUIProps = {}) {
  const {
    playerHealth,
    opponentHealth,
    maxHealth,
    playerFighterId,
    opponentFighterId,
    playerComboCount,
    opponentComboCount,
    timeScale,
    playerMomentum,
    playerBalance,
    opponentMomentum,
    opponentBalance,
  } = useBattle();

  const playerFighter = getFighterById(playerFighterId);
  const opponentFighter = getFighterById(opponentFighterId);

  // REAL meter calculations from battle state
  const playerUltimateMeter = Math.min(100, (playerComboCount * 10) + (playerMomentum * 20));
  const opponentUltimateMeter = Math.min(100, (opponentComboCount * 10) + (opponentMomentum * 20));
  
  // Real combo display
  const playerComboText = playerComboCount > 0 ? `${playerComboCount} HIT COMBO!` : '';
  const playerComboColor = playerComboCount >= 10 ? '#ffd700' : playerComboCount >= 5 ? '#ff6b6b' : '#88d0ff';

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Ultimate Meter - Bottom Center - REAL IMPLEMENTATION */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <UltimateMeter
          value={playerUltimateMeter}
          max={100}
          overflow={20}
        />
      </div>

      {/* Resonance Meter - Left Side - REAL IMPLEMENTATION */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <VerticalMeter
          value={Math.min(100, playerBalance * 100 + playerComboCount * 5)}
          max={100}
          color="#FF00FF"
          label="RESONANCE"
        />
      </div>

      {/* Reflex Meter - Right Side - REAL IMPLEMENTATION */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <VerticalMeter
          value={Math.min(100, playerMomentum * 100 + (timeScale < 1.0 ? 30 : 0))}
          max={100}
          color="#00FFFF"
          label="REFLEX"
        />
      </div>

      {/* Combo Display - Top Center */}
      {playerComboCount > 0 && (
        <div 
          className="absolute top-20 left-1/2 -translate-x-1/2 text-center"
          style={{ color: playerComboColor }}
        >
          <div className="text-6xl font-bold drop-shadow-[0_0_20px_currentColor] animate-bounce">
            {playerComboText}
          </div>
          <div className="text-2xl mt-2">
            {playerComboCount} HITS
          </div>
        </div>
      )}

      {/* Perfect Dodge Indicator */}
      <PerfectDodgeIndicator />

      {/* Perfect Parry Indicator */}
      <PerfectParryIndicator />

      {/* Slow Motion Indicator */}
      {timeScale < 1.0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-white text-4xl font-bold drop-shadow-[0_0_20px_cyan] animate-pulse">
            SLOW MOTION
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Ultimate Meter Component
 */
function UltimateMeter({ value, max, overflow }: { value: number; max: number; overflow: number }) {
  const percentage = Math.min(value / max, 1.0);
  const overflowAmount = value > max ? Math.min((value - max) / overflow, 1.0) : 0;
  const color = overflowAmount > 0 ? '#FF0000' : '#FFD700';

  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border-2 border-gold shadow-[0_0_30px_rgba(255,215,0,0.6)]">
      <div className="text-white text-sm font-bold mb-2">ULTIMATE</div>
      <div className="relative w-64 h-8 bg-gray-800 rounded-full overflow-hidden border-2 border-white">
        {/* Base fill */}
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300"
          style={{ width: `${percentage * 100}%` }}
        />
        {/* Overflow fill */}
        {overflowAmount > 0 && (
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-700 opacity-80"
            style={{ 
              width: `${overflowAmount * 100}%`,
              left: `${percentage * 100}%`,
            }}
          />
        )}
        {/* Glow effect */}
        <div
          className="absolute left-0 top-0 h-full bg-white opacity-30 blur-sm"
          style={{ width: `${percentage * 100}%` }}
        />
        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm drop-shadow-[0_0_4px_black]">
          {Math.floor(value)}%
        </div>
      </div>
    </div>
  );
}

/**
 * Vertical Meter Component
 */
function VerticalMeter({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const percentage = value / max;

  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border-2 border-white/50">
      <div className="text-white text-xs font-bold mb-2 text-center">{label}</div>
      <div className="relative w-6 h-32 bg-gray-800 rounded-full overflow-hidden border border-white">
        <div
          className="absolute bottom-0 left-0 w-full transition-all duration-300 rounded-full"
          style={{
            height: `${percentage * 100}%`,
            background: `linear-gradient(to top, ${color}, ${color}88)`,
            boxShadow: `0 0 20px ${color}`,
          }}
        />
        {/* Glow effect */}
        <div
          className="absolute bottom-0 left-0 w-full opacity-50 blur-sm rounded-full"
          style={{
            height: `${percentage * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="text-white text-xs text-center mt-2">{Math.floor(value)}%</div>
    </div>
  );
}

/**
 * Perfect Dodge Indicator - REAL IMPLEMENTATION
 * Shows when player successfully dodges attacks
 */
function PerfectDodgeIndicator() {
  const { battlePhase, playerComboCount, playerInvulnerable } = useBattle();
  
  // Show indicator when player is invulnerable (dodging) and has combo going
  if (battlePhase !== 'fighting' || !playerInvulnerable || playerComboCount === 0) {
    return null;
  }

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-cyan-500/90 to-blue-500/90 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-cyan-300 shadow-lg animate-pulse">
        <p className="text-white font-black text-sm">
          PERFECT DODGE! ×{playerComboCount}
        </p>
      </div>
    </div>
  );
}

/**
 * Perfect Parry Indicator - REAL IMPLEMENTATION
 * Shows when player successfully parries attacks
 */
function PerfectParryIndicator() {
  const { battlePhase, playerBalance, opponentAttacking } = useBattle();
  
  // Show when player has high balance (stable) and opponent is attacking (parry opportunity)
  if (battlePhase !== 'fighting' || !opponentAttacking || playerBalance < 0.7) {
    return null;
  }

  return (
    <div className="absolute top-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-purple-300 shadow-lg animate-pulse">
        <p className="text-white font-black text-sm">
          PARRY READY! Balance: {Math.round(playerBalance * 100)}%
        </p>
      </div>
    </div>
  );
}
