/**
 * Ultimate Ability Charge Bar Component
 * Displays charge progress and cooldown for ultimate abilities
 */

import React, { useState, useEffect } from 'react';
import type { UltimateAbility } from '../../lib/combatAbilities';

interface UltimateAbilityBarProps {
  ultimate: UltimateAbility;
  chargePercent: number; // 0-100
  isReady: boolean;
  inCooldown: boolean;
  cooldownRemaining?: number; // seconds
  onReady?: () => void;
}

export default function UltimateAbilityBar({
  ultimate,
  chargePercent,
  isReady,
  inCooldown,
  cooldownRemaining = 0,
  onReady,
}: UltimateAbilityBarProps) {
  const [cooldownDisplay, setCooldownDisplay] = useState(cooldownRemaining);

  useEffect(() => {
    setCooldownDisplay(cooldownRemaining);
  }, [cooldownRemaining]);

  const isFullyCharged = chargePercent >= 100;

  return (
    <div className="flex flex-col gap-2">
      {/* Ultimate name and status */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white">
            {ultimate.name}
          </h4>
          <p className="text-xs text-slate-400">{ultimate.description}</p>
        </div>
        <div className="text-right">
          {inCooldown && cooldownRemaining > 0 ? (
            <span className="text-sm font-bold text-red-400">
              Cooldown: {cooldownRemaining.toFixed(1)}s
            </span>
          ) : isFullyCharged ? (
            <span className="text-sm font-black text-yellow-400 animate-pulse">
              READY!
            </span>
          ) : (
            <span className="text-sm font-bold text-cyan-400">
              {Math.round(chargePercent)}%
            </span>
          )}
        </div>
      </div>

      {/* Charge bar */}
      <div className="relative h-6 bg-slate-800 rounded-lg border-2 border-slate-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-200 flex items-center justify-center"
          style={{
            width: `${Math.min(chargePercent, 100)}%`,
          }}
        >
          {isFullyCharged && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-30 animate-pulse" />
          )}
        </div>

        {/* Ready indicator overlay */}
        {isFullyCharged && !inCooldown && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-xs font-black uppercase tracking-wider text-white"
              style={{
                textShadow: '0 0 10px rgba(255, 200, 0, 0.8)',
              }}
            >
              ▲ ULTIMATE ▲
            </div>
          </div>
        )}

        {/* Cooldown overlay */}
        {inCooldown && cooldownRemaining > 0 && (
          <div
            className="absolute inset-0 bg-red-600/30 flex items-center justify-center"
            style={{
              width: `${Math.max(0, (cooldownRemaining / ultimate.cooldown) * 100)}%`,
              transition: 'width 0.1s linear',
            }}
          />
        )}
      </div>

      {/* Damage value */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Damage</span>
        <span className="font-bold text-orange-400">{ultimate.damage}</span>
      </div>
    </div>
  );
}
