import React from 'react';
import type { FighterDisplayState } from '../../lib/types/fighterTypes';

export interface EnhancedHUDProps {
  player1: FighterDisplayState;
  player2: FighterDisplayState;
  timer: number;
  comboDisplay?: {
    hits: number;
    damage: number;
  };
}

const formatTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getHealthPercentage = (health: number, maxHealth: number) => {
  if (maxHealth <= 0) return 0;
  return Math.max(0, Math.min(100, (health / maxHealth) * 100));
};

const getHealthColor = (percentage: number) => {
  if (percentage > 50) return 'from-green-500 to-green-400';
  if (percentage > 25) return 'from-yellow-500 to-orange-400';
  return 'from-red-600 to-red-400';
};

export const EnhancedHUD: React.FC<EnhancedHUDProps> = ({
  player1,
  player2,
  timer,
  comboDisplay,
}) => {
  const player1HealthPercent = getHealthPercentage(player1.health, player1.maxHealth);
  const player2HealthPercent = getHealthPercentage(player2.health, player2.maxHealth);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-4">
          <div className={`inline-block bg-black/80 px-6 py-2 rounded-lg border-2 ${timer < 10 ? 'border-red-500 animate-pulse' : 'border-yellow-400'}`}>
            <span className={`text-2xl font-bold ${timer < 10 ? 'text-red-400' : 'text-white'}`}>
              {formatTimer(timer)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-start gap-8">
          <div className="flex-1">
            <div className={`bg-black/70 rounded-lg p-3 border-2 ${player1HealthPercent < 30 ? 'border-red-500 animate-pulse' : 'border-blue-400'}`}>
              <div className="text-white font-bold mb-2">{player1.name || 'Player 1'}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-6 bg-gray-700 rounded overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getHealthColor(player1HealthPercent)} transition-all duration-300`}
                    style={{ width: `${player1HealthPercent}%` }}
                  />
                </div>
                <div className="text-white font-bold text-xl min-w-[60px] text-right">
                  {Math.floor(player1.damage)}%
                </div>
              </div>
              {player1.stocks !== undefined && player1.stocks > 0 && (
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: Math.min(player1.stocks, 5) }).map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-blue-500 rounded-full" />
                  ))}
                </div>
              )}
              {player1.ultimateMeter !== undefined && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${player1.ultimateMeter >= 100 ? 'bg-yellow-400 animate-pulse' : 'bg-purple-500'}`}
                      style={{ width: `${Math.min(player1.ultimateMeter, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className={`bg-black/70 rounded-lg p-3 border-2 ${player2HealthPercent < 30 ? 'border-orange-500 animate-pulse' : 'border-red-400'}`}>
              <div className="text-white font-bold mb-2 text-right">{player2.name || 'Enemy'}</div>
              <div className="flex items-center gap-2">
                <div className="text-white font-bold text-xl min-w-[60px]">
                  {Math.floor(player2.damage)}%
                </div>
                <div className="flex-1 h-6 bg-gray-700 rounded overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getHealthColor(player2HealthPercent)} transition-all duration-300`}
                    style={{ width: `${player2HealthPercent}%` }}
                  />
                </div>
              </div>
              {player2.stocks !== undefined && player2.stocks > 0 && (
                <div className="flex gap-1 mt-2 justify-end">
                  {Array.from({ length: Math.min(player2.stocks, 5) }).map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-red-500 rounded-full" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {comboDisplay && comboDisplay.hits > 1 && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-black/80 px-8 py-4 rounded-lg border-4 border-yellow-500 animate-pulse">
              <div className="text-yellow-500 text-6xl font-bold text-center">
                {comboDisplay.hits}
              </div>
              <div className="text-white text-2xl text-center">COMBO!</div>
              <div className="text-yellow-300 text-xl text-center">
                {Math.floor(comboDisplay.damage)}% damage
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedHUD;
