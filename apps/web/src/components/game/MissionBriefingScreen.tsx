import React, { useMemo } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { ArrowLeft, Target, Play, Zap } from 'lucide-react';
import { ALL_STORY_MISSIONS, type StoryMission } from '../../lib/story_missions';

export default function MissionBriefingScreen() {
  const { setGameState, activeStoryMissionId, selectedCharacter } = useRunner();

  const mission = useMemo<StoryMission | null>(() => {
    if (!activeStoryMissionId) return null;
    return ALL_STORY_MISSIONS.find(m => m.id === activeStoryMissionId) || null;
  }, [activeStoryMissionId]);

  if (!mission) {
    return null;
  }

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
            <h1 className="text-3xl font-black italic tracking-wider uppercase">MISSION BRIEFING</h1>
            <p className="text-xs text-amber-400 font-mono tracking-widest uppercase">ACT {mission.actNumber} · MISSION {mission.missionNumber}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto my-auto py-6 z-10">
        <div className="space-y-6 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          {/* Mission Title */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold tracking-widest uppercase rounded-full">
                STORY CAMPAIGN
              </span>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold tracking-widest uppercase rounded-full">
                {mission.gameplayType}
              </span>
            </div>
            <h2 className="text-4xl font-black italic tracking-wide uppercase mt-2">{mission.title}</h2>
            <p className="text-slate-300 text-sm mt-3 leading-7">
              {mission.description}
            </p>
          </div>

          {/* Intro Cutscene */}
          {mission.introCutscene.length > 0 && (
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 space-y-4">
              <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Intro Dialogue</span>
              </h3>
              <div className="space-y-3">
                {mission.introCutscene.map((dialogue, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-bold text-cyan-300">[{dialogue.speaker}]</span>
                    <p className="text-slate-200 mt-1 italic">{dialogue.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objectives */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>OBJECTIVES</span>
            </h3>
            <ul className="space-y-3 text-sm text-slate-200 font-medium">
              {mission.objectives.map((objective, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Story Beat */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-xs leading-6 text-slate-400">
            <span className="text-amber-300 flex-shrink-0 mt-0.5">📖</span>
            <p>
              <span className="font-bold text-amber-300">Story Beat:</span> {mission.storyBeat}
            </p>
          </div>

          {/* Start Mission */}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-xs">
              <span className="text-emerald-400 flex-shrink-0">⚔️</span>
              <div>
                <span className="text-slate-500 block font-mono uppercase tracking-widest">Difficulty</span>
                <span className="font-bold text-slate-300">{'⭐'.repeat(Math.min(mission.difficulty, 5))}</span>
              </div>
            </div>

            <button
              onClick={handleStartMission}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 rounded-2xl font-black text-white text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all hover:scale-105 flex-shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START MISSION</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
