import { useState, useMemo } from 'react';
import { GAME_MODES, type GameModeType } from '../../lib/storyMode';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ChevronRight, Lock, Star, Brain, Crown, Sparkles, Gamepad2 } from 'lucide-react';

interface GameModesMenuProps {
  onSelectMode: (mode: GameModeType) => void;
  onBack: () => void;
  unlockedModes: GameModeType[];
}

export default function GameModesMenu({ onSelectMode, onBack, unlockedModes }: GameModesMenuProps) {
  const [expandedMode, setExpandedMode] = useState<GameModeType | null>(null);

  const particles = useMemo(() => 
    [...Array(15)].map((_, i) => ({
      size: 3 + (i % 4) * 1.5,
      color: ["#FFD700", "#9333EA", "#06B6D4"][i % 3],
      left: (i * 7) % 100,
      top: (i * 9 + 5) % 100,
      delay: i * 0.3,
      duration: 2 + (i % 3)
    })), []
  );

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-600/50 text-emerald-200 border-emerald-400';
      case 'normal':
        return 'bg-cyan-600/50 text-cyan-200 border-cyan-400';
      case 'hard':
        return 'bg-orange-600/50 text-orange-200 border-orange-400';
      case 'extreme':
        return 'bg-red-600/50 text-red-200 border-red-400';
      case 'godlike':
        return 'bg-purple-600/50 text-purple-200 border-purple-400';
      default:
        return 'bg-gray-600/50 text-gray-200 border-gray-400';
    }
  };

  return (
    <div 
      className="min-h-screen w-full p-4 overflow-auto"
      style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 25%, #0d1f3c 50%, #1a0a2e 75%, #0a0a1a 100%)"
      }}
    >
      {/* Animated particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: 0.3,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            onClick={onBack}
            className="mb-4 font-bold text-white border"
            style={{
              background: "linear-gradient(90deg, #9333EA, #7C3AED)",
              borderColor: "rgba(255, 215, 0, 0.5)"
            }}
          >
            ← Back to Menu
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Gamepad2 className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400" 
              style={{ filter: "drop-shadow(0 0 10px #9333EA)" }}
            />
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              GAME MODES
            </h1>
          </div>
          <p className="text-base sm:text-xl font-bold"
            style={{
              background: "linear-gradient(90deg, #06B6D4, #9333EA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            12 Ways to Master Your Memories
          </p>
        </div>

        {/* Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Object.values(GAME_MODES).map((mode) => {
            const isUnlocked = unlockedModes.includes(mode.id);

            return (
              <div key={mode.id} className="group">
                <Card
                  className={`cursor-pointer transition-all duration-300 h-full flex flex-col border-2 ${
                    !isUnlocked
                      ? 'opacity-60'
                      : expandedMode === mode.id
                      ? 'ring-2 ring-yellow-400'
                      : 'hover:border-purple-400'
                  }`}
                  style={{
                    background: isUnlocked 
                      ? "linear-gradient(180deg, rgba(26, 10, 46, 0.9) 0%, rgba(13, 31, 60, 0.9) 100%)"
                      : "rgba(31, 41, 55, 0.5)",
                    borderColor: !isUnlocked 
                      ? "rgba(107, 114, 128, 0.5)" 
                      : expandedMode === mode.id 
                      ? "#FFD700" 
                      : "rgba(147, 51, 234, 0.5)"
                  }}
                  onClick={() => isUnlocked && setExpandedMode(expandedMode === mode.id ? null : mode.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl sm:text-3xl">{mode.icon}</span>
                          <CardTitle className="text-lg sm:text-xl text-white font-black">{mode.name}</CardTitle>
                        </div>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getDifficultyColor(mode.difficulty)}`}>
                          {mode.difficulty.toUpperCase()}
                        </div>
                      </div>
                      {!isUnlocked && <Lock className="w-5 h-5 text-yellow-400" />}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col space-y-3">
                    <p className="text-gray-300 text-sm flex-1">{mode.description}</p>

                    {isUnlocked && (
                      <div className="p-3 rounded-lg text-xs space-y-2"
                        style={{ background: "rgba(0, 0, 0, 0.4)" }}
                      >
                        <p className="text-yellow-400 font-bold flex items-center gap-1">
                          <Crown className="w-3 h-3" /> REWARDS
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-cyan-400">XP</p>
                            <p className="text-white font-bold">{mode.reward.xp}</p>
                          </div>
                          <div>
                            <p className="text-yellow-400">GOLD</p>
                            <p className="text-white font-bold">{mode.reward.currency}</p>
                          </div>
                          <div>
                            <p className="text-purple-400">LOOT</p>
                            <p className="text-white font-bold">{mode.reward.loot.length}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isUnlocked && (
                      <p className="text-yellow-400 text-xs font-bold text-center py-2 px-3 rounded"
                        style={{ background: "rgba(0, 0, 0, 0.4)" }}
                      >
                        <Lock className="w-3 h-3 inline mr-1" />
                        {mode.unlockCondition}
                      </p>
                    )}

                    {expandedMode === mode.id && isUnlocked && (
                      <div className="mt-3 pt-3 space-y-3"
                        style={{ borderTop: "1px solid rgba(147, 51, 234, 0.3)" }}
                      >
                        <div>
                          <p className="text-purple-300 text-xs font-bold mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> LOOT DROPS
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {mode.reward.loot.map((item, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 rounded text-xs font-semibold"
                                style={{
                                  background: "rgba(147, 51, 234, 0.3)",
                                  color: "#E9D5FF"
                                }}
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMode(mode.id);
                          }}
                          className="w-full font-bold text-white py-3"
                          style={{
                            background: "linear-gradient(90deg, #9333EA 0%, #7C3AED 100%)",
                            boxShadow: "0 0 15px rgba(147, 51, 234, 0.4)"
                          }}
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
        <div className="mt-8 p-4 rounded-xl text-center space-y-2 border"
          style={{
            background: "rgba(0, 0, 0, 0.6)",
            borderColor: "rgba(147, 51, 234, 0.3)"
          }}
        >
          <p className="text-gray-300 text-sm flex items-center justify-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            Complete Story Mode to unlock all game modes
          </p>
          <p className="text-xs text-purple-300">
            Master each mode to earn legendary rewards and unlock Resonance abilities!
          </p>
        </div>
      </div>
    </div>
  );
}

