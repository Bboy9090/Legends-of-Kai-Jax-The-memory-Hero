import React from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { Trophy, Star, ArrowRight, RotateCcw, ShieldCheck, Award } from 'lucide-react';

export default function MissionCompleteScreen() {
  const { setGameState } = useRunner();

  const handleContinue = () => {
    setGameState('story-hub');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050510] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-amber-500/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto my-auto py-8 z-10 space-y-8 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>MISSION VICTORY</span>
          </div>
          <h1 
            className="text-5xl sm:text-6xl font-black italic tracking-wide uppercase"
            style={{
              background: 'linear-gradient(135deg, #ffd700 0%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            VICTORY ACHIEVED!
          </h1>
          <p className="text-sm text-slate-300 font-mono">STORM RONIN SANCTUM CLEARED</p>
        </div>

        {/* Grade */}
        <div className="py-4">
          <div className="text-7xl font-black italic text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">
            RANK S
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-4 border-t border-b border-white/10 py-6 text-xs font-mono">
          <div>
            <span className="text-slate-500 block mb-1">SCORE</span>
            <span className="text-xl font-bold text-white">45,800</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">EXP GAINED</span>
            <span className="text-xl font-bold text-cyan-400">+350 XP</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">LOOT DROPS</span>
            <span className="text-xl font-bold text-purple-400">TACTICAL CREST</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={handleContinue}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 rounded-2xl font-black text-white text-base tracking-widest uppercase shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all hover:scale-105"
          >
            <span>RETURN TO HUB</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
