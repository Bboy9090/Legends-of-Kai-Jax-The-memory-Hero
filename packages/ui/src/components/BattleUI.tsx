import React from 'react';
import type { FighterDisplayState } from '@smash-heroes/shared';
import { HUD } from './HUD';

export interface BattleUIProps {
  player1: FighterDisplayState;
  player2: FighterDisplayState;
  timer: number;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  comboDisplay?: {
    hits: number;
    damage: number;
  };
}

/**
 * BattleUI - Complete battle interface including HUD, combo counter, and pause menu
 */
export const BattleUI: React.FC<BattleUIProps> = ({
  player1,
  player2,
  timer,
  isPaused = false,
  onPause,
  onResume,
  comboDisplay,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Main HUD */}
      <HUD player1={player1} player2={player2} timer={timer} />

      {/* Combo Display */}
      {comboDisplay && comboDisplay.hits > 1 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
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

      {/* Pause Menu */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center pointer-events-auto">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-white text-3xl font-bold mb-6 text-center">PAUSED</h2>
            <div className="space-y-4">
              <button
                onClick={onResume}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Resume
              </button>
              <button
                onClick={() => {/* TODO: Restart match */}}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Restart
              </button>
              <button
                onClick={() => {/* TODO: Return to menu */}}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Quit to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Button */}
      {!isPaused && (
        <div className="fixed top-4 right-4 pointer-events-auto">
          <button
            onClick={onPause}
            className="bg-gray-800/70 hover:bg-gray-700/70 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            ⏸ Pause
          </button>
        </div>
      )}
    </div>
  );
};

export default BattleUI;
