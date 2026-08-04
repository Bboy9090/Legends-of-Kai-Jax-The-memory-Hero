import React, { useState } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { useAudio } from '../../lib/stores/useAudio';
import { Volume2, VolumeX, Eye, Sparkles, ArrowRight, ShieldCheck, Monitor } from 'lucide-react';

export default function BootAccessibilityScreen({ onComplete }: { onComplete: () => void }) {
  const { isMuted, toggleMute } = useAudio();
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState<'standard' | 'large'>('standard');
  const [reduceMotion, setReduceMotion] = useState(false);

  const handleConfirm = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#050510] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between z-10 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black italic tracking-wider uppercase">Accessibility & Setup</h1>
            <p className="text-xs text-slate-400 tracking-widest font-mono">FIRST BOOT PREFERENCES</p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-500 hidden sm:block">LEGENDS OF KAI-JAX</span>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl w-full mx-auto my-auto py-8 z-10 space-y-6">
        <div className="text-center sm:text-left space-y-2 mb-8">
          <h2 className="text-3xl font-black italic text-amber-400 uppercase">Welcome, Hero</h2>
          <p className="text-sm text-slate-300">Configure display, visual clarity, and audio settings before entering The Raging City.</p>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:border-purple-500/40 transition-all">
          <div className="flex items-center gap-4">
            {isMuted ? <VolumeX className="w-6 h-6 text-rose-400" /> : <Volume2 className="w-6 h-6 text-cyan-400" />}
            <div>
              <p className="font-bold text-white text-base">Audio Sound Effects & Music</p>
              <p className="text-xs text-slate-400">Master audio state for all ambient tracks and combat impact FX.</p>
            </div>
          </div>
          <button
            onClick={toggleMute}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              !isMuted ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
            }`}
          >
            {!isMuted ? 'ENABLED' : 'MUTED'}
          </button>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:border-purple-500/40 transition-all">
          <div className="flex items-center gap-4">
            <Eye className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-bold text-white text-base">High-Contrast UI Mode</p>
              <p className="text-xs text-slate-400">Enhance borders and HUD outlines for maximum visibility during combat.</p>
            </div>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              highContrast ? 'bg-amber-500 text-black font-black' : 'bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            {highContrast ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Motion Reduction */}
        <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:border-purple-500/40 transition-all">
          <div className="flex items-center gap-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <div>
              <p className="font-bold text-white text-base">Reduce Motion & Camera Shake</p>
              <p className="text-xs text-slate-400">Disable intense screen shake and fast background transitions.</p>
            </div>
          </div>
          <button
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              reduceMotion ? 'bg-purple-500 text-white font-black' : 'bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            {reduceMotion ? 'REDUCED' : 'NORMAL'}
          </button>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex justify-end z-10 border-t border-white/10 pt-4">
        <button
          onClick={handleConfirm}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 rounded-2xl font-black text-white text-base tracking-widest uppercase shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all hover:scale-105"
        >
          <span>ENTER GAME</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
