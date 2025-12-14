import React from 'react';
import type { FighterDisplayState } from '@smash-heroes/shared';

export interface HUDProps {
  player1: FighterDisplayState;
  player2: FighterDisplayState;
  timer: number;
}

/**
 * HUD Component - Displays player health, damage %, and match timer
 */
export const HUD: React.FC<HUDProps> = ({ player1, player2, timer }) => {
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHealthPercentage = (health: number, maxHealth: number) => {
    if (maxHealth <= 0) return 0;
    return Math.max(0, Math.min(100, (health / maxHealth) * 100));
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-screen-xl mx-auto">
        {/* Timer */}
        <div className="text-center mb-4">
          <div className="inline-block bg-black/70 px-6 py-2 rounded-lg">
            <span className="text-white text-2xl font-bold">{formatTimer(timer)}</span>
          </div>
        </div>

        {/* Player Stats Container */}
        <div className="flex justify-between items-start gap-8">
          {/* Player 1 */}
          <div className="flex-1">
            <div className="bg-black/70 rounded-lg p-3">
              <div className="text-white font-bold mb-2">{player1.name || 'Player 1'}</div>
              <div className="flex items-center gap-2">
                {/* Health Bar */}
                <div className="flex-1 h-6 bg-gray-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                    style={{ width: `${getHealthPercentage(player1.health, player1.maxHealth)}%` }}
                  />
                </div>
                {/* Damage % */}
                <div className="text-white font-bold text-xl min-w-[60px] text-right">
                  {Math.floor(player1.damage)}%
                </div>
              </div>
              {/* Stock/Lives Display */}
              {player1.stocks !== undefined && player1.stocks > 0 && (
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: Math.min(player1.stocks, 10) }).map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-blue-500 rounded-full" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Player 2 */}
          <div className="flex-1">
            <div className="bg-black/70 rounded-lg p-3">
              <div className="text-white font-bold mb-2 text-right">{player2.name || 'Player 2'}</div>
              <div className="flex items-center gap-2">
                {/* Damage % */}
                <div className="text-white font-bold text-xl min-w-[60px]">
                  {Math.floor(player2.damage)}%
                </div>
                {/* Health Bar */}
                <div className="flex-1 h-6 bg-gray-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
                    style={{ width: `${getHealthPercentage(player2.health, player2.maxHealth)}%` }}
                  />
                </div>
              </div>
              {/* Stock/Lives Display */}
              {player2.stocks !== undefined && player2.stocks > 0 && (
                <div className="flex gap-1 mt-2 justify-end">
                  {Array.from({ length: Math.min(player2.stocks, 10) }).map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-red-500 rounded-full" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
