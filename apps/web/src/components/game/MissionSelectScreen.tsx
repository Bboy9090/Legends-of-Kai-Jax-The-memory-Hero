import React, { useState } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { ArrowLeft, Target, Award, Play, ShieldAlert, Zap } from 'lucide-react';

export default function MissionSelectScreen() {
  const { setGameState } = useRunner();
  const [difficulty, setDifficulty] = useState<'story' | 'ronin' | 'nightmare'>('ronin');

  const handleStartMission = () => {
    setGameState('adventure');
  };

  return (
    <div className="kj-vision-shell kj-vision-city-vignette fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto p-6 text-white sm:p-12">
      {/* Ambient background */}
      <div className="absolute top-0 right-0 w-full max-w-4xl h-96 bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#735a35]/60 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setGameState('story-hub')}
            className="kj-vision-button p-3 group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="kj-vision-title text-3xl font-black">MISSION BRIEFING</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[#ae9160]">STORM RONIN SANCTUM</p>
          </div>
        </div>
      </div>

      {/* Mission Details */}
      <div className="kj-vision-panel relative z-10 mx-auto my-auto w-full max-w-5xl space-y-6 p-6 sm:p-8">
        <div>
          <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold tracking-widest uppercase rounded-full">
            ACT I — MISSION 1
          </span>
          <h2 className="text-4xl font-black italic tracking-wide uppercase mt-2">THE RONIN'S VOW</h2>
          <p className="text-slate-300 text-sm mt-2">
            Infiltrate the sacred Ronin Sanctum and recover the lost oath scroll before the Anti-Sabertooth Covenant erases it from memory.
          </p>
        </div>

        {/* Objectives */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>MISSION OBJECTIVES</span>
          </h3>
          <ul className="space-y-2 text-sm text-slate-200 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Reach the Inner Sanctum Courtyard</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Defeat the Chainsworn Syndicate Guardians</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Survive the Ronin Trial</span>
            </li>
          </ul>
        </div>

        {/* Difficulty Selector */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase">DIFFICULTY LEVEL</h3>
          <div className="grid grid-cols-3 gap-4">
            {(['story', 'ronin', 'nightmare'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-3 px-4 rounded-xl border text-xs font-black tracking-widest uppercase transition-all ${
                  difficulty === d 
                    ? 'text-[#f0cf87] border-[#f0cf87]' 
                    : 'text-[#9c9180]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Rewards */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-mono">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-slate-400 block">REWARDS</span>
              <span className="font-bold text-amber-300">250 XP | Tactical Crest Loot</span>
            </div>
          </div>

          <button
            onClick={handleStartMission}
            className="kj-vision-button flex items-center gap-3 px-8 py-4 font-black text-base"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START MISSION</span>
          </button>
        </div>
      </div>
    </div>
  );
}
