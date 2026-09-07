import React, { useMemo, useState } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { ArrowLeft, Target, Play, ShieldCheck, BookOpen } from 'lucide-react';

type Difficulty = 'story' | 'standard' | 'hard';

interface FieldBriefing {
  location: string;
  pressure: string;
}

const FIELD_BRIEFINGS: Record<string, FieldBriefing> = {
  vertical_slice_ashblock_heights: {
    location: 'ASHBLOCK HEIGHTS',
    pressure: 'FANG SYNDICATE PRESSURE',
  },
  vertical_slice_ironvein_wards: {
    location: 'IRONVEIN WARDS',
    pressure: 'ANTI-SABERTOOTH COVENANT ACTIVITY',
  },
  vertical_slice_skyfall_spines: {
    location: 'SKYFALL SPINES',
    pressure: 'CONTESTED TERRITORY',
  },
  vertical_slice_storm_ronin_sanctum: {
    location: 'STORM RONIN SANCTUM',
    pressure: 'RONIN LEGACY SITE',
  },
};

export default function MissionSelectScreen() {
  const { setGameState, activeStoryMissionId } = useRunner();
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');

  const briefing = useMemo<FieldBriefing>(() => {
    if (activeStoryMissionId && FIELD_BRIEFINGS[activeStoryMissionId]) {
      return FIELD_BRIEFINGS[activeStoryMissionId];
    }
    return FIELD_BRIEFINGS.vertical_slice_ashblock_heights;
  }, [activeStoryMissionId]);

  const handleStartMission = () => {
    setGameState('adventure');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050510] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto font-sans">
      <div className="absolute top-0 right-0 w-full max-w-4xl h-96 bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="flex items-center justify-between z-10 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setGameState('story-hub')}
            aria-label="Back to Story Hub"
            className="p-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-black italic tracking-wider uppercase">FIELD BRIEFING</h1>
            <p className="text-xs text-amber-400 font-mono tracking-widest uppercase">{briefing.location}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto my-auto py-6 z-10">
        <div className="space-y-6 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold tracking-widest uppercase rounded-full">
                PHASE C VERTICAL SLICE
              </span>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold tracking-widest uppercase rounded-full">
                {briefing.pressure}
              </span>
            </div>
            <h2 className="text-4xl font-black italic tracking-wide uppercase mt-2">RAGING CITY FIELD OP</h2>
            <p className="text-slate-300 text-sm mt-3 leading-7">
              Enter {briefing.location} with the selected hero and prove the shared adventure loop: character-specific traversal, Memory Trace interaction, environmental routing, and a canon-faction encounter where the mission spawner has an approved assignment.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-xs leading-6 text-slate-400">
            <BookOpen className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
            <p>
              This field op does not claim a new event from the book. Final chapter placement, enemy identity, dialogue, discoveries, deaths, and consequences remain controlled by the publication-locked chronology.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>SLICE OBJECTIVES</span>
            </h3>
            <ul className="space-y-3 text-sm text-slate-200 font-medium">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                <span>Traverse the district using the selected hero’s distinct movement identity.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                <span>Locate and inspect a Memory Trace or Memory Echo interaction point.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span>Resolve only approved encounter content; do not invent a faction, boss, relic, or story reveal.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span>Return with continuity intact: wounds, knowledge, unlocks, and chronology must persist correctly.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase">DIFFICULTY</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['story', 'standard', 'hard'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setDifficulty(value)}
                  className={`py-3 px-3 rounded-xl border text-xs font-black tracking-widest uppercase transition-all ${
                    difficulty === value
                      ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-slate-500 block font-mono uppercase tracking-widest">PROGRESSION RULE</span>
                <span className="font-bold text-slate-300">Completion may record story progress and combat score. It cannot purchase lineage, fusion stability, or tails.</span>
              </div>
            </div>

            <button
              onClick={handleStartMission}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 rounded-2xl font-black text-white text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all hover:scale-105 flex-shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>ENTER SLICE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
