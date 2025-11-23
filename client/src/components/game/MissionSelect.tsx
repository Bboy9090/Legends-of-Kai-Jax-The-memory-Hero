import { useState } from 'react';
import { ActNumber } from '../../lib/storyMode';
import { getMissionsByAct } from '../../lib/missions';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ChevronRight, Flame, Lock } from 'lucide-react';

interface MissionSelectProps {
  actNumber: ActNumber;
  onSelectMission: (missionId: string) => void;
  onBack: () => void;
  completedMissions: string[];
}

export default function MissionSelect({
  actNumber,
  onSelectMission,
  onBack,
  completedMissions
}: MissionSelectProps) {
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const missions = getMissionsByAct(actNumber);

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-400 bg-green-400/10';
    if (difficulty <= 4) return 'text-blue-400 bg-blue-400/10';
    if (difficulty <= 6) return 'text-yellow-400 bg-yellow-400/10';
    if (difficulty <= 8) return 'text-orange-400 bg-orange-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const isCompleted = (missionId: string) => completedMissions.includes(missionId);
  const isLocked = (index: number) => index > 0 && !isCompleted(missions[index - 1].id);

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
            ← Back to Act Select
          </Button>
          <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg mb-2">
            ACT {actNumber} MISSIONS
          </h1>
          <p className="text-lg text-cyan-300">
            Select a mission to begin. Complete objectives to progress.
          </p>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {missions.map((mission, index) => {
            const locked = isLocked(index);
            const completed = isCompleted(mission.id);
            const isSelected = selectedMissionId === mission.id;

            return (
              <Card
                key={mission.id}
                className={`cursor-pointer transition-all duration-300 border-2 ${
                  locked
                    ? 'border-gray-600 bg-gray-800/30 opacity-50'
                    : isSelected
                    ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400'
                    : 'border-cyan-400 bg-black/50 hover:border-cyan-300'
                }`}
                onClick={() => !locked && setSelectedMissionId(mission.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg md:text-xl text-white">
                          Mission {mission.missionNumber}: {mission.name}
                        </CardTitle>
                        {completed && <Flame className="w-5 h-5 text-orange-400" />}
                      </div>
                      <p className="text-xs text-gray-400">
                        {mission.isBoss ? '⚔️ BOSS FIGHT' : mission.isFireMoment ? '🔥 FIRE MOMENT' : '⚡ Combat Mission'}
                      </p>
                    </div>
                    {locked && <Lock className="w-5 h-5 text-gray-400 mt-1" />}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Description */}
                  <p className="text-gray-200 text-sm">{mission.description}</p>

                  {/* Objectives */}
                  <div>
                    <p className="text-cyan-400 text-xs font-bold mb-1">OBJECTIVES</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {mission.objectives.slice(0, 2).map((obj, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-yellow-400">▸</span> {obj}
                        </li>
                      ))}
                      {mission.objectives.length > 2 && (
                        <li className="text-gray-400 italic">+{mission.objectives.length - 2} more...</li>
                      )}
                    </ul>
                  </div>

                  {/* Difficulty & Rewards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`p-2 rounded ${getDifficultyColor(mission.difficulty)}`}>
                      <p className="text-xs font-bold">Difficulty</p>
                      <p className="font-bold">{mission.difficulty}/10</p>
                    </div>
                    <div className="p-2 rounded bg-purple-400/10 text-purple-300">
                      <p className="text-xs font-bold">XP</p>
                      <p className="font-bold">{mission.rewards.xp}</p>
                    </div>
                    <div className="p-2 rounded bg-yellow-400/10 text-yellow-300">
                      <p className="text-xs font-bold">$</p>
                      <p className="font-bold">{mission.rewards.currency}</p>
                    </div>
                  </div>

                  {/* Boss Info */}
                  {mission.isBoss && mission.bossName && (
                    <div className="p-2 rounded bg-red-900/50 border-l-2 border-red-400">
                      <p className="text-red-300 text-xs font-bold">BOSS: {mission.bossName}</p>
                      {mission.bossPhases && (
                        <p className="text-red-400 text-xs">{mission.bossPhases}-Phase Battle</p>
                      )}
                    </div>
                  )}

                  {/* Locked Message */}
                  {locked && (
                    <p className="text-red-400 text-xs font-bold text-center">
                      Complete Mission {index} to unlock
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mission Details Panel */}
        {selectedMissionId && (
          <div className="mt-8 p-6 bg-black/80 border-2 border-cyan-400 rounded-lg">
            {missions.find(m => m.id === selectedMissionId) && (
              (() => {
                const mission = missions.find(m => m.id === selectedMissionId)!;
                const locked = isLocked(missions.indexOf(mission));

                return (
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black text-cyan-300">
                      {mission.name}
                    </h2>
                    <p className="text-gray-300 text-lg">{mission.description}</p>

                    {/* Full Objectives */}
                    <div>
                      <h3 className="text-cyan-400 font-bold mb-2">ALL OBJECTIVES</h3>
                      <ul className="space-y-1 ml-4">
                        {mission.objectives.map((obj, i) => (
                          <li key={i} className="text-gray-200 flex items-center gap-2">
                            <span className="text-yellow-400">✓</span> {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Rewards */}
                    <div className="grid grid-cols-4 gap-3 p-4 bg-gray-900/50 rounded">
                      <div>
                        <p className="text-gray-400 text-xs font-bold">XP REWARD</p>
                        <p className="text-purple-300 text-xl font-bold">{mission.rewards.xp}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-bold">CURRENCY</p>
                        <p className="text-yellow-300 text-xl font-bold">{mission.rewards.currency}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-bold">DIFFICULTY</p>
                        <p className="text-orange-300 text-xl font-bold">{mission.difficulty}/10</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-bold">LOOT</p>
                        <p className="text-green-300 text-xl font-bold">{mission.rewards.loot.length}</p>
                      </div>
                    </div>

                    {/* Start Button */}
                    <Button
                      onClick={() => !locked && onSelectMission(mission.id)}
                      disabled={locked}
                      className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-bold py-3 text-lg"
                    >
                      START MISSION <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>
    </div>
  );
}
