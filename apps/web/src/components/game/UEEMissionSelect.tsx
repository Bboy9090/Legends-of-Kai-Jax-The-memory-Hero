/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * 10 Missions — The Upgrades God Has Blessed Us With
 * Flawless combat • Taunts • Smirks • Encouragement
 */

import { useState } from 'react';
import { UEE_MISSIONS, getUEEMissionById } from '../../lib/uee_missions';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Swords, Zap, ArrowLeft } from 'lucide-react';

interface UEEMissionSelectProps {
  onSelectMission: (missionId: string) => void;
  onBack: () => void;
  completedMissions: string[];
}

export default function UEEMissionSelect({
  onSelectMission,
  onBack,
  completedMissions,
}: UEEMissionSelectProps) {
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const selectedMission = selectedMissionId ? getUEEMissionById(selectedMissionId) : null;
  const isCompleted = (id: string) => completedMissions.includes(id);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0f] via-purple-950/30 to-[#0a0a0f] text-white p-4 sm:p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* UEE BRANDING */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-amber-400/90 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-1">
            Ultimate Entertainment Enterprises presents
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent mb-2">
            Legends of Kai-Jax
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-purple-300 font-bold">
            The upgrades God has blessed us with
          </p>
          <p className="text-xs sm:text-sm text-cyan-400/80 mt-2">
            Flawless fighting • Arms & feet • Punches & kicks • Smirks • Taunts • Encouragement
          </p>
        </div>

        {/* BACK */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 sm:mb-6 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-sm sm:text-base"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Back
        </Button>

        {/* 10 MISSIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
          {UEE_MISSIONS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMissionId(m.id)}
              className={`text-left p-3 sm:p-4 rounded-xl border-2 transition-all ${
                selectedMissionId === m.id
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                  : isCompleted(m.id)
                    ? 'bg-green-900/30 border-green-500/60'
                    : 'bg-slate-900/60 border-slate-600 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-sm sm:text-base">
                  {m.missionNumber}. {m.name}
                </span>
                {isCompleted(m.id) && (
                  <span className="text-green-400" aria-hidden>
                    ✓
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                Diff {m.difficulty} • {m.objectives.length} objectives
              </div>
            </button>
          ))}
        </div>

        {/* SELECTED MISSION DETAIL + START */}
        {selectedMission && (
          <Card className="bg-slate-900/80 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-cyan-300 flex items-center gap-2">
                <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
                {selectedMission.name}
              </CardTitle>
              <p className="text-slate-300 text-xs sm:text-sm">{selectedMission.description}</p>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="text-cyan-400 font-semibold mb-2 text-sm sm:text-base">Objectives</h4>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-300 space-y-1">
                  {selectedMission.objectives.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                  +{selectedMission.rewards.xp} XP
                </span>
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">
                  +{selectedMission.rewards.currency} currency
                </span>
                {selectedMission.rewards.loot.map((l) => (
                  <span key={l} className="px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                    {l}
                  </span>
                ))}
              </div>
              <Button
                onClick={() => onSelectMission(selectedMission.id)}
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold py-3 sm:py-4 text-sm sm:text-base"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Mission
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
