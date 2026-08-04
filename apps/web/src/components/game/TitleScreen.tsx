import React, { useEffect } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { useAudio } from '../../lib/stores/useAudio';
import { Settings, UserCheck, Play } from 'lucide-react';

export default function TitleScreen() {
  const { setGameState } = useRunner();
  const { playVictory } = useAudio();

  const handleStart = () => {
    playVictory();
    setGameState('menu');
  };

  useEffect(() => {
    const handleKeyDown = () => handleStart();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      onClick={handleStart}
      className="fixed inset-0 z-50 flex flex-col justify-between p-8 bg-cover bg-center cursor-pointer select-none"
      style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(10,10,26,0.5) 0%, rgba(5,5,16,0.95) 100%), url("/models/ruined_city_bg.jpg")',
        backgroundColor: '#050510'
      }}
    >
      {/* Top Header */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-mono tracking-widest text-slate-300">VER. 1.0.0 | BUILD 2026.08.03</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setGameState('settings'); }}
          className="p-3 bg-white/5 hover:bg-white/15 backdrop-blur-md rounded-2xl border border-white/10 text-slate-300 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Center Branding */}
      <div className="flex flex-col items-center text-center my-auto z-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold tracking-[0.3em] uppercase backdrop-blur-md">
          <span>Raging City Saga</span>
        </div>

        <h1 
          className="text-6xl sm:text-8xl md:text-9xl font-black italic tracking-tighter uppercase"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #ffd700 40%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.8))'
          }}
        >
          LEGENDS OF
        </h1>

        <h2 
          className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tighter uppercase -mt-4 sm:-mt-6"
          style={{
            background: 'linear-gradient(135deg, #00f2ff 0%, #a855f7 60%, #ffffff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 40px rgba(168,85,247,0.6))'
          }}
        >
          KAI-JAX
        </h2>

        <p className="text-amber-400/90 text-sm sm:text-lg font-medium tracking-[0.25em] uppercase max-w-md pt-2">
          Forged in the Raging City. Crowned by Memory.
        </p>

        {/* Prompt Button */}
        <div className="pt-12">
          <div className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 rounded-2xl font-black text-white text-lg tracking-widest uppercase shadow-[0_0_50px_rgba(168,85,247,0.5)] animate-pulse hover:scale-105 transition-all">
            <Play className="w-5 h-5 fill-current" />
            <span>PRESS ANY BUTTON TO BEGIN</span>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex justify-between items-end z-10 text-[11px] text-slate-400 font-mono">
        <div>FACTION: FANG SYNDICATE vs COVENANT</div>
        <div className="flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>PROFILE 1: ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
