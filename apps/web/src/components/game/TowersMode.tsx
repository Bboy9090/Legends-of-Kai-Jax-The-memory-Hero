/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * TOWERS TOURNAMENT MODE
 * Mortal Kombat Style - Climb the towers!
 */

import { useState } from 'react';
import { TOWERS, getTowerById, getUnlockedTowers, type Tower } from '../../lib/game_modes';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Lock, Trophy, Play } from 'lucide-react';

interface TowersModeProps {
  onSelectTower: (towerId: string) => void;
  onBack: () => void;
  completedTowers: string[];
}

export default function TowersMode({ onSelectTower, onBack, completedTowers }: TowersModeProps) {
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const unlockedTowers = getUnlockedTowers(completedTowers);

  const isCompleted = (id: string) => completedTowers.includes(id);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0f] via-amber-950/30 to-[#0a0a0f] text-white p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <p className="text-amber-400/90 text-sm font-semibold tracking-[0.2em] uppercase mb-1">
            Ultimate Entertainment Enterprises presents
          </p>
          <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            TOWERS TOURNAMENT
          </h1>
          <p className="text-lg text-amber-300 font-bold">Mortal Kombat Style • Climb the Towers</p>
        </div>

        <Button variant="ghost" onClick={onBack} className="mb-6 text-amber-400 hover:text-amber-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* TOWERS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {TOWERS.map((tower) => {
            const unlocked = unlockedTowers.includes(tower);
            const completed = isCompleted(tower.id);
            const isSelected = selectedTower === tower.id;

            return (
              <button
                key={tower.id}
                onClick={() => unlocked && setSelectedTower(tower.id)}
                disabled={!unlocked}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  !unlocked
                    ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                    : completed
                      ? 'bg-amber-900/30 border-amber-500'
                      : isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                        : 'bg-slate-900/60 border-slate-600 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{tower.name}</span>
                  <div className="flex items-center gap-2">
                    {completed && <Trophy className="w-5 h-5 text-amber-400" />}
                    {!unlocked && <Lock className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>
                <div className="text-xs text-slate-400 mb-2">{tower.description}</div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                    {tower.floors} Floors
                  </span>
                  <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                    Diff {tower.difficulty}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* SELECTED TOWER DETAILS */}
        {selectedTower && (
          <Card className="bg-slate-900/80 border-2 border-amber-500/50">
            <CardHeader>
              <CardTitle className="text-xl text-amber-300">
                {(() => {
                  const tower = getTowerById(selectedTower);
                  return tower?.name;
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const tower = getTowerById(selectedTower);
                if (!tower) return null;

                return (
                  <>
                    <p className="text-slate-300 text-sm">{tower.description}</p>
                    <div>
                      <h4 className="text-amber-400 font-semibold mb-2">Tower Structure</h4>
                      <p className="text-sm text-slate-300">
                        {tower.floors} floors of increasing difficulty. Each floor features unique
                        challenges and enemies.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                        +{tower.rewards.xp} XP
                      </span>
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">
                        +{tower.rewards.currency} currency
                      </span>
                      {tower.rewards.loot.map((l) => (
                        <span key={l} className="px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                          {l}
                        </span>
                      ))}
                    </div>
                    <Button
                      onClick={() => onSelectTower(tower.id)}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Climb Tower
                    </Button>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
