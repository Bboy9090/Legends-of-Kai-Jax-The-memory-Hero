import { useState } from 'react';
import { STORY_ACTS, type ActNumber } from '../../lib/storyMode';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ChevronRight, Lock, Flame } from 'lucide-react';

interface StoryModeSelectProps {
  onSelectAct: (actNumber: ActNumber) => void;
  onBack: () => void;
  completedActs: ActNumber[];
}

export default function StoryModeSelect({ onSelectAct, onBack, completedActs }: StoryModeSelectProps) {
  const [expandedAct, setExpandedAct] = useState<ActNumber | null>(null);

  const getActProgress = (actNumber: ActNumber): number => {
    if (completedActs.includes(actNumber)) return 100;
    if (actNumber > 1 && !completedActs.includes((actNumber - 1) as ActNumber)) return 0;
    return 50; // In progress
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-black to-red-900 p-4">
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
            STORY MODE
          </h1>
          <p className="text-xl text-yellow-300 font-bold">
            Super Smash Grand Saga: Legends of the Weave
          </p>
        </div>

        {/* Acts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.values(STORY_ACTS).map((act) => {
            const isLocked = act.locked && !completedActs.includes((act.number - 1) as ActNumber);
            const progress = getActProgress(act.number);

            return (
              <div key={act.number} className="group">
                <Card
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    isLocked
                      ? 'border-gray-600 bg-gray-800/30 opacity-50'
                      : expandedAct === act.number
                      ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400'
                      : 'border-cyan-400 bg-black/50 hover:border-cyan-300'
                  }`}
                  onClick={() => !isLocked && setExpandedAct(expandedAct === act.number ? null : act.number)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl md:text-3xl text-white mb-1">
                          Act {act.number}: {act.title}
                        </CardTitle>
                        <p className="text-sm text-yellow-300 font-bold">{act.bookRef}</p>
                      </div>
                      {isLocked && <Lock className="w-6 h-6 text-gray-400 mt-1" />}
                      {!isLocked && progress === 100 && <Flame className="w-6 h-6 text-orange-400" />}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Description */}
                    <p className="text-gray-200 text-sm">{act.description}</p>

                    {/* Progress Bar */}
                    <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          progress === 100
                            ? 'bg-green-500'
                            : progress === 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Expandable Details */}
                    {expandedAct === act.number && !isLocked && (
                      <div className="mt-4 pt-4 border-t border-cyan-400/30 space-y-3">
                        <div>
                          <p className="text-cyan-400 text-xs font-bold mb-1">GAMEPLAY TWIST</p>
                          <p className="text-sm text-gray-300 italic">{act.gameplayTwist}</p>
                        </div>

                        <div>
                          <p className="text-cyan-400 text-xs font-bold mb-1">PLAYSTYLES</p>
                          <div className="flex flex-wrap gap-2">
                            {act.playstyles.map((style, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-cyan-600/30 text-cyan-300 rounded text-xs"
                              >
                                {style}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-orange-400 text-xs font-bold mb-1">🔥 FIRE MOMENTS ({act.fireMoments.length})</p>
                          <ul className="text-xs text-gray-300 space-y-1 max-h-24 overflow-y-auto">
                            {act.fireMoments.map((moment) => (
                              <li key={moment.id} className="flex items-center gap-2">
                                <span className="text-yellow-400">✦</span> {moment.name}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                          <div className="bg-purple-900/50 p-2 rounded">
                            <p className="text-purple-300 font-bold">DIFFICULTY</p>
                            <p className="text-yellow-300">{act.difficultyRange[0]} - {act.difficultyRange[1]}/10</p>
                          </div>
                          <div className="bg-blue-900/50 p-2 rounded">
                            <p className="text-blue-300 font-bold">PLAYTIME</p>
                            <p className="text-cyan-300">~{act.estimatedPlaytime} min</p>
                          </div>
                        </div>

                        {/* Start Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAct(act.number);
                          }}
                          className="w-full mt-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-bold py-2"
                        >
                          START ACT {act.number} <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}

                    {isLocked && (
                      <p className="text-red-400 text-xs font-bold text-center">
                        Complete Act {act.number - 1} to unlock
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-black/70 border-2 border-cyan-400/30 rounded-lg text-center">
          <p className="text-gray-300 text-sm">
            <span className="text-red-400 font-bold">●</span> Locked •{' '}
            <span className="text-yellow-400 font-bold">●</span> In Progress •{' '}
            <span className="text-green-400 font-bold">●</span> Completed
          </p>
        </div>
      </div>
    </div>
  );
}
