import { useState } from 'react';
import { GAME_MODES, type GameModeType } from '../../lib/storyMode';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ChevronRight, Lock, Star } from 'lucide-react';

interface GameModesMenuProps {
  onSelectMode: (mode: GameModeType) => void;
  onBack: () => void;
  unlockedModes: GameModeType[];
}

export default function GameModesMenu({ onSelectMode, onBack, unlockedModes }: GameModesMenuProps) {
  const [expandedMode, setExpandedMode] = useState<GameModeType | null>(null);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-600/50 text-green-300';
      case 'normal':
        return 'bg-blue-600/50 text-blue-300';
      case 'hard':
        return 'bg-orange-600/50 text-orange-300';
      case 'extreme':
        return 'bg-red-600/50 text-red-300';
      case 'godlike':
        return 'bg-purple-600/50 text-purple-300';
      default:
        return 'bg-gray-600/50 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-black to-purple-900 p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-4 bg-red-600 hover:bg-red-700 text-white"
          >
            ← Back
          </Button>
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg mb-2">
            GAME MODES
          </h1>
          <p className="text-xl text-cyan-300 font-bold">
            12 Ways to Become Legendary
          </p>
        </div>

        {/* Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(GAME_MODES).map((mode) => {
            const isUnlocked = unlockedModes.includes(mode.id);

            return (
              <div key={mode.id} className="group">
                <Card
                  className={`cursor-pointer transition-all duration-300 border-2 h-full flex flex-col ${
                    !isUnlocked
                      ? 'border-gray-600 bg-gray-800/30 opacity-60'
                      : expandedMode === mode.id
                      ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400'
                      : 'border-cyan-400 bg-black/50 hover:border-cyan-300'
                  }`}
                  onClick={() => isUnlocked && setExpandedMode(expandedMode === mode.id ? null : mode.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-3xl">{mode.icon}</span>
                          <CardTitle className="text-xl text-white">{mode.name}</CardTitle>
                        </div>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(mode.difficulty)}`}>
                          {mode.difficulty.toUpperCase()}
                        </div>
                      </div>
                      {!isUnlocked && <Lock className="w-5 h-5 text-gray-400 mt-1" />}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col space-y-3">
                    {/* Description */}
                    <p className="text-gray-200 text-sm flex-1">{mode.description}</p>

                    {/* Rewards Preview */}
                    {isUnlocked && (
                      <div className="bg-gray-900/70 p-2 rounded text-xs space-y-1">
                        <p className="text-yellow-400 font-bold">REWARDS:</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-blue-300">XP</p>
                            <p className="text-cyan-300 font-bold">{mode.reward.xp}</p>
                          </div>
                          <div>
                            <p className="text-yellow-300">$</p>
                            <p className="text-yellow-400 font-bold">{mode.reward.currency}</p>
                          </div>
                          <div>
                            <p className="text-purple-300">LOOT</p>
                            <p className="text-purple-300 font-bold">{mode.reward.loot.length}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Unlock Condition */}
                    {!isUnlocked && (
                      <p className="text-red-400 text-xs font-bold text-center py-2">
                        🔒 {mode.unlockCondition}
                      </p>
                    )}

                    {/* Expanded Details */}
                    {expandedMode === mode.id && isUnlocked && (
                      <div className="mt-3 pt-3 border-t border-cyan-400/30 space-y-2">
                        <div>
                          <p className="text-purple-400 text-xs font-bold mb-1">LOOT DROPS:</p>
                          <div className="flex flex-wrap gap-1">
                            {mode.reward.loot.map((item, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded text-xs"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Play Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMode(mode.id);
                          }}
                          className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 text-sm"
                        >
                          PLAY {mode.icon} <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-black/70 border-2 border-cyan-400/30 rounded-lg text-center space-y-2">
          <p className="text-gray-300 text-sm">
            <Star className="w-4 h-4 inline text-yellow-400" /> UNLOCK ALL MODES BY PROGRESSING THROUGH STORY MODE
          </p>
          <p className="text-xs text-gray-400">
            Complete acts to unlock new game modes and unlock legendary rewards!
          </p>
        </div>
      </div>
    </div>
  );
}
