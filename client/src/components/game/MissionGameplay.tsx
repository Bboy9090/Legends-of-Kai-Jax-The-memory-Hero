import { useEffect, useState } from 'react';
import { getMissionById } from '../../lib/missions';
import { getBossById } from '../../lib/bosses';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ChevronRight, Heart, Zap } from 'lucide-react';

interface MissionGameplayProps {
  missionId: string;
  onMissionComplete: (missionId: string, success: boolean) => void;
  onBack: () => void;
}

export default function MissionGameplay({
  missionId,
  onMissionComplete,
  onBack
}: MissionGameplayProps) {
  const mission = getMissionById(missionId);
  const [phase, setPhase] = useState<'briefing' | 'combat' | 'boss' | 'victory' | 'defeat'>('briefing');
  const [bossPhaseIndex, setBossPhaseIndex] = useState(0);
  const [simulatedHealth, setSimulatedHealth] = useState(100);
  const [simulatedBossHealth, setSimulatedBossHealth] = useState(100);

  if (!mission) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-black mb-4">Mission Not Found</h1>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const boss = mission.bossName ? getBossById(mission.bossName.toLowerCase().replace(/\s+/g, '_')) : null;

  const handleStartMission = () => {
    setPhase('combat');
    // Simulate combat
    const damageInterval = setInterval(() => {
      setSimulatedHealth(prev => Math.max(0, prev - Math.random() * 5));
      setSimulatedBossHealth(prev => Math.max(0, prev - Math.random() * 8));
    }, 1000);

    setTimeout(() => {
      clearInterval(damageInterval);
      if (Math.random() > 0.3) {
        // 70% win rate for demo
        setSimulatedBossHealth(0);
        setPhase('victory');
      } else {
        setSimulatedHealth(0);
        setPhase('defeat');
      }
    }, 8000);
  };

  const handleContinue = () => {
    if (phase === 'victory') {
      onMissionComplete(missionId, true);
    } else if (phase === 'defeat') {
      onMissionComplete(missionId, false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-purple-900 p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Briefing Phase */}
        {phase === 'briefing' && (
          <div className="space-y-6">
            <Button
              onClick={onBack}
              variant="outline"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              ← Back
            </Button>

            <div className="space-y-4">
              <h1 className="text-5xl font-black text-white drop-shadow-lg">
                {mission.name}
              </h1>
              <p className="text-xl text-gray-300">{mission.description}</p>
            </div>

            {/* Mission Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Objectives */}
              <Card className="bg-black/70 border-2 border-cyan-400">
                <CardContent className="p-6">
                  <h3 className="text-cyan-400 font-black text-lg mb-3">OBJECTIVES</h3>
                  <ul className="space-y-2">
                    {mission.objectives.map((obj, i) => (
                      <li key={i} className="text-gray-200 flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">▸</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Mission Stats */}
              <Card className="bg-black/70 border-2 border-purple-400">
                <CardContent className="p-6">
                  <h3 className="text-purple-400 font-black text-lg mb-3">MISSION DETAILS</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Difficulty</span>
                      <span className="text-yellow-300 font-bold">{mission.difficulty}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type</span>
                      <span className="text-cyan-300 font-bold">
                        {mission.isBoss ? '⚔️ Boss Fight' : '⚡ Combat'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">XP Reward</span>
                      <span className="text-purple-300 font-bold">{mission.rewards.xp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Currency</span>
                      <span className="text-yellow-300 font-bold">{mission.rewards.currency}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Boss Info */}
            {mission.isBoss && mission.bossName && (
              <Card className="bg-red-900/50 border-2 border-red-500">
                <CardContent className="p-6">
                  <h3 className="text-red-300 font-black text-lg mb-3">BOSS ENCOUNTER</h3>
                  <p className="text-gray-200 mb-2">{mission.bossName}</p>
                  <p className="text-red-300 text-sm">
                    {mission.bossPhases}-Phase Battle • Adaptive AI • Pattern Learning
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Start Mission Button */}
            <Button
              onClick={handleStartMission}
              className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-black py-4 text-lg"
            >
              READY FOR BATTLE <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Combat Phase */}
        {(phase === 'combat' || phase === 'victory' || phase === 'defeat') && (
          <div className="h-screen flex flex-col justify-between">
            {/* Battle Header */}
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white">{mission.name}</h2>
              
              {/* Health Bars */}
              <div className="grid grid-cols-2 gap-4">
                {/* Player Health */}
                <Card className="bg-black/70 border-2 border-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-bold">PLAYER</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-green-500 h-full transition-all duration-300"
                        style={{ width: `${simulatedHealth}%` }}
                      />
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{Math.ceil(simulatedHealth)}%</p>
                  </CardContent>
                </Card>

                {/* Boss Health */}
                <Card className="bg-black/70 border-2 border-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-bold">
                        {mission.bossName || 'ENEMY'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-red-500 h-full transition-all duration-300"
                        style={{ width: `${simulatedBossHealth}%` }}
                      />
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{Math.ceil(simulatedBossHealth)}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Battle Log */}
              <Card className="bg-black/70 border-2 border-cyan-400">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-sm">
                    {phase === 'combat' && 'Battle in progress... Watch your health!'}
                    {phase === 'victory' && '🎉 Victory! Mission Accomplished!'}
                    {phase === 'defeat' && '💀 Defeated... But you can try again!'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Continue Button (after battle ends) */}
            {(phase === 'victory' || phase === 'defeat') && (
              <Button
                onClick={handleContinue}
                className={`w-full py-4 text-lg font-black ${
                  phase === 'victory'
                    ? 'bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                }`}
              >
                {phase === 'victory' ? 'CLAIM REWARDS' : 'RETRY MISSION'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
