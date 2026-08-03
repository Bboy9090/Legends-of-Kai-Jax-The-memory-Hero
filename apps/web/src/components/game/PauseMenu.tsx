import React, { useState } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { ArrowLeft, Play, RotateCcw, Volume2, Shield, Settings } from 'lucide-react';

export default function PauseMenu({ onResume }: { onResume: () => void }) {
  const { setGameState } = useRunner();
  const [activeTab, setActiveTab] = useState<'options' | 'controls'>('options');

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full bg-[#050510] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">GAME PAUSED</span>
          <h2 className="text-4xl font-black italic tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400">
            PAUSE MENU
          </h2>
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 font-black text-sm tracking-widest uppercase rounded-2xl transition-all shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME GAME</span>
          </button>

          <button
            onClick={() => setGameState('settings')}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs tracking-widest uppercase rounded-2xl transition-all"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>SETTINGS & ACCESSIBILITY</span>
          </button>

          <button
            onClick={() => setGameState('menu')}
            className="w-full flex items-center justify-center gap-2 py-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs tracking-widest uppercase rounded-2xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>EXIT TO MAIN MENU</span>
          </button>
        </div>

        <div className="text-center pt-4 border-t border-white/10 text-[10px] text-slate-500 font-mono">
          LEGENDS OF KAI-JAX — PAUSE CONTROLS ACTIVE
        </div>
      </div>
    </div>
  );
}
