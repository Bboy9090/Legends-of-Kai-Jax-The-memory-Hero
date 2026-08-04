import React from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { UserCheck, Trophy, ArrowLeft, RefreshCw, Play } from 'lucide-react';

export default function SaveSlotScreen() {
  const { profiles, activeProfileIndex, switchProfile, resetProfile, setGameState } = useRunner();

  const handleSelectSlot = (index: number) => {
    switchProfile(index);
    setGameState('story-hub');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050510] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setGameState('menu')}
            className="p-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-black italic tracking-wider uppercase">SAVE ARCHIVES</h1>
            <p className="text-xs text-amber-400 font-mono tracking-widest uppercase">SELECT A RUNNER PROFILE</p>
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mx-auto my-auto py-8 z-10">
        {profiles.map((profile, idx) => {
          const isActive = activeProfileIndex === idx;
          const completedCount = profile.completedStoryMissionIds?.length || 0;
          const pct = Math.min(100, Math.round((completedCount / 12) * 100));

          return (
            <div
              key={idx}
              className={`relative flex flex-col justify-between p-6 rounded-3xl border-2 transition-all duration-300 bg-white/5 backdrop-blur-xl ${
                isActive 
                  ? 'border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.3)] bg-gradient-to-b from-cyan-950/30 to-purple-950/20' 
                  : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute -top-3 left-6 px-3 py-1 bg-cyan-500 text-black font-black text-[10px] tracking-widest uppercase rounded-full shadow-lg">
                  CURRENT PROFILE
                </div>
              )}

              {/* Slot Header */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black italic tracking-wide uppercase">SLOT {idx + 1}</h3>
                  <UserCheck className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {profile.lastPlayedTitle || 'New Adventure Archive'}
                </p>
              </div>

              {/* Stats */}
              <div className="my-8 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-400">SAGA COMPLETION</span>
                    <span className="text-cyan-300 font-mono">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5 text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>TOTAL SCORE</span>
                  </div>
                  <span className="text-amber-300 font-bold">{profile.totalScore.toLocaleString()}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleSelectSlot(idx)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-black text-xs tracking-widest uppercase rounded-xl transition-all shadow-md"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>LOAD GAME</span>
                </button>
                <button
                  onClick={() => resetProfile(idx)}
                  title="Clear Save Data"
                  className="p-3 bg-rose-500/10 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl text-rose-400 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="text-center z-10 text-xs font-mono text-slate-500">
        SELECT AN ACTIVE RUNNER PROFILE TO SYNC RAGIGN CITY MISSION PROGRESSION
      </div>
    </div>
  );
}
