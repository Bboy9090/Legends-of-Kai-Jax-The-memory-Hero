/**
 * Move Set Tooltip/Help Overlay
 * Displays available moves and their inputs during gameplay
 */

import React, { useState } from 'react';
import type { MoveSet, ComboMove } from '../../lib/combatAbilities';
import { getAllMoves } from '../../lib/combatAbilities';

interface MoveSetTooltipProps {
  moveSet: MoveSet;
  isOpen: boolean;
  onClose: () => void;
  isTouch?: boolean;
}

type MoveCategory = 'basic' | 'special' | 'throw' | 'counter' | 'combo' | 'ultimate';

export default function MoveSetTooltip({
  moveSet,
  isOpen,
  onClose,
  isTouch = false,
}: MoveSetTooltipProps) {
  const [selectedCategory, setSelectedCategory] = useState<MoveCategory>('basic');

  if (!isOpen) return null;

  const getMovesByCategory = (): ComboMove[] => {
    switch (selectedCategory) {
      case 'basic':
        return moveSet.basicAttacks;
      case 'special':
        return moveSet.specialMoves;
      case 'throw':
        return moveSet.throws;
      case 'counter':
        return moveSet.counters;
      case 'combo':
        return moveSet.combos;
      default:
        return [];
    }
  };

  const moves = getMovesByCategory();

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center pointer-events-auto z-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-xl p-6 max-w-3xl max-h-[80vh] overflow-auto w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-wider text-white uppercase">
            {moveSet.fighterId.toUpperCase()} - Move Reference
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['basic', 'special', 'throw', 'counter', 'combo'] as MoveCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/30 border border-cyan-500 text-cyan-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ultimate ability section */}
        <div className="mb-8 p-4 rounded-lg border-2 border-yellow-500/50 bg-yellow-950/20">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-black text-yellow-400 uppercase">
                {moveSet.ultimate.name}
              </h3>
              <p className="text-sm text-yellow-300/80 mt-1">{moveSet.ultimate.description}</p>
              <div className="flex gap-6 mt-3 text-sm">
                <div>
                  <span className="text-slate-400">Damage: </span>
                  <span className="font-bold text-yellow-400">{moveSet.ultimate.damage}</span>
                </div>
                <div>
                  <span className="text-slate-400">Max Charge: </span>
                  <span className="font-bold text-yellow-400">{moveSet.ultimate.maxCharge}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Cooldown: </span>
                  <span className="font-bold text-yellow-400">{moveSet.ultimate.cooldown}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Moves list */}
        <div className="grid grid-cols-1 gap-3">
          {selectedCategory === 'combo' ? (
            // Combo display
            moves.map((move) => (
              <div key={move.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-black">{move.name}</h4>
                    <p className="text-sm text-slate-400 mt-1">{move.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-400">{move.damage} DMG</div>
                  </div>
                </div>

                {/* Input sequence */}
                <div className="flex items-center gap-2 mt-3 text-sm">
                  <span className="text-slate-400">Input: </span>
                  {move.inputSequence.map((input, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-slate-600">→</span>}
                      <span className="px-2 py-1 rounded bg-slate-700 text-cyan-300 font-mono text-xs">
                        {input.toUpperCase()}
                      </span>
                    </React.Fragment>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex gap-4 mt-3 text-xs text-slate-400">
                  <span>Knockback: {move.knockback}</span>
                  <span>Recovery: {move.recovery}f</span>
                  <span>Combo Bonus: +{move.comboBonus}%</span>
                </div>
              </div>
            ))
          ) : (
            // Regular moves display
            moves.map((move) => (
              <div key={move.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-black">{move.name}</h4>
                    <p className="text-sm text-slate-400">{move.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-400">{move.damage} DMG</div>
                  </div>
                </div>

                {/* Input sequence */}
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-slate-400">Input: </span>
                  {move.inputSequence.map((input, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-slate-600">+</span>}
                      <span className="px-2 py-1 rounded bg-slate-700 text-cyan-300 font-mono text-xs font-bold">
                        {input.toUpperCase()}
                      </span>
                    </React.Fragment>
                  ))}
                </div>

                {/* Stats bar */}
                <div className="flex gap-4 mt-3 text-xs text-slate-400">
                  <span>Knockback: {move.knockback.toFixed(1)}</span>
                  <span>Recovery: {move.recovery}f</span>
                  {move.comboBonus > 0 && <span className="text-amber-400">+{move.comboBonus}% Combo</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-slate-700 text-xs text-slate-400">
          <p className="mb-2">
            <span className="text-slate-500">f = frames</span> |{' '}
            <span className="text-slate-500">Recovery = frames before next action</span>
          </p>
          <p>
            Charge your ultimate ability by landing hits. At 100%, press your ultimate button to
            unleash devastating damage!
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold uppercase tracking-wider hover:scale-105 transition-transform"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
