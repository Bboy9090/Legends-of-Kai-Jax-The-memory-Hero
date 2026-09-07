import React from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * Safe temporary debrief for the Phase C field slice.
 *
 * Do not fabricate score, XP, loot, rank, or story consequences while the
 * publication-locked mission ledger is still being mapped into runtime data.
 */
export default function MissionCompleteScreen() {
  const { setGameState, selectedCharacter } = useRunner();

  const handleContinue = () => {
    setGameState('story-hub');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050510] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-amber-500/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto my-auto py-8 z-10 space-y-8 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>FIELD OBJECTIVE COMPLETE</span>
          </div>
          <h1
            className="text-4xl sm:text-6xl font-black italic tracking-wide uppercase"
            style={{
              background: 'linear-gradient(135deg, #ffd700 0%, #f97316 45%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            RETURN TO RAGING CITY
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            The current Phase C mission slice is complete. Final chapter rewards, rank rules, unlocks, and chronology consequences remain gated until the Bloodward mission ledger is wired into runtime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-b border-white/10 py-6 text-xs font-mono text-left sm:text-center">
          <div className="rounded-xl bg-black/20 p-3">
            <span className="text-slate-500 block mb-1">ACTIVE HERO</span>
            <span className="font-bold text-white uppercase">{selectedCharacter === 'jax' ? 'JAX' : 'KAI'}</span>
          </div>
          <div className="rounded-xl bg-black/20 p-3">
            <span className="text-slate-500 block mb-1">STORY REWARD</span>
            <span className="font-bold text-amber-300 uppercase">CANON GATED</span>
          </div>
          <div className="rounded-xl bg-black/20 p-3">
            <span className="text-slate-500 block mb-1">TAIL / FUSION PROGRESS</span>
            <span className="font-bold text-purple-300 uppercase">NOT AUTO-GRANTED</span>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={handleContinue}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 rounded-2xl font-black text-white text-base tracking-widest uppercase shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all hover:scale-105"
          >
            <span>RETURN TO STORY HUB</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
