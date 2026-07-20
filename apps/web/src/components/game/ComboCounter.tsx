/**
 * Combo Counter Component
 * Displays active combo count and damage multiplier
 */

import React, { useEffect, useState } from 'react';
import { getComboMultiplier } from '../../lib/combatAbilities';

interface ComboCounterProps {
  hitCount: number;
  lastHitTime?: number;
  maxComboResetTime?: number;
  position?: 'top' | 'center';
}

const COMBO_RESET_TIME = 3000; // 3 seconds of inactivity resets combo

export default function ComboCounter({
  hitCount,
  lastHitTime = 0,
  maxComboResetTime = COMBO_RESET_TIME,
  position = 'center',
}: ComboCounterProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if combo should reset
    if (lastHitTime && Date.now() - lastHitTime > maxComboResetTime) {
      setDisplayCount(0);
      setIsActive(false);
      return;
    }

    // Update display count
    if (hitCount > 1) {
      setDisplayCount(hitCount);
      setIsActive(true);

      // Schedule reset if no new hits
      const resetTimer = setTimeout(() => {
        setDisplayCount(0);
        setIsActive(false);
      }, maxComboResetTime);

      return () => clearTimeout(resetTimer);
    } else {
      setDisplayCount(0);
      setIsActive(false);
    }
  }, [hitCount, lastHitTime, maxComboResetTime]);

  if (!isActive || displayCount < 2) return null;

  const multiplier = getComboMultiplier(displayCount);
  const positionClass = position === 'center' ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : 'fixed top-8 left-1/2 -translate-x-1/2';

  return (
    <div className={`${positionClass} pointer-events-none z-30 text-center`}>
      <div
        className="animate-bounce transition-all duration-200"
        style={{
          textShadow: `0 0 20px rgba(14, 165, 233, 0.8), 0 0 40px rgba(14, 165, 233, 0.4)`,
        }}
      >
        <div className="text-6xl font-black tracking-widest text-cyan-400 drop-shadow-lg">
          {displayCount}
        </div>
        <div className="text-lg font-bold text-cyan-300 mt-2 uppercase tracking-wider">
          COMBO
        </div>
      </div>

      {/* Multiplier indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="h-1 w-32 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
            style={{ width: `${Math.min((displayCount / 10) * 100, 100)}%` }}
          />
        </div>
        <span className="text-yellow-400 font-bold text-sm whitespace-nowrap">
          ×{multiplier.toFixed(2)} DMG
        </span>
      </div>
    </div>
  );
}
