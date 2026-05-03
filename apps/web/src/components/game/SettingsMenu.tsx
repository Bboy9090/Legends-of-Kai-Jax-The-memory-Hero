import { useRunner } from "../../lib/stores/useRunner";
import { useAudio } from "../../lib/stores/useAudio";
import { Settings, Volume2, VolumeX, Monitor, ArrowLeft, Zap, Shield, Sparkles } from "lucide-react";
import { useState } from "react";

export default function SettingsMenu() {
  const { setGameState } = useRunner();
  const { isMuted, toggleMute } = useAudio();
  const [quality, setQuality] = useState("high");

  const handleBack = () => {
    setGameState("menu");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative p-6 bg-[#050510]">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Settings Container */}
      <div className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/40">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-widest text-white uppercase">Settings</h1>
              <p className="text-blue-400/60 text-xs tracking-[0.2em] font-bold mt-1">Configure your experience</p>
            </div>
          </div>
          <button 
            onClick={handleBack}
            className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-10">
          {/* Audio Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-white/80">Audio</h2>
            </div>
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-white font-bold text-lg">Master Mute</p>
                <p className="text-white/40 text-sm">Silence all game sounds and music</p>
              </div>
              <button 
                onClick={toggleMute}
                className={`
                  relative w-16 h-8 rounded-full transition-colors duration-300
                  ${isMuted ? 'bg-gray-700' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]'}
                `}
              >
                <div className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300
                  ${isMuted ? 'left-1' : 'left-9'}
                `} />
                {isMuted ? <VolumeX className="w-3 h-3 text-gray-900 absolute left-2.5 top-2.5" /> : <Volume2 className="w-3 h-3 text-blue-600 absolute right-2.5 top-2.5" />}
              </button>
            </div>
          </section>

          {/* Video Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-white/80">Performance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['low', 'medium', 'high'].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`
                    relative p-4 rounded-xl border flex flex-col items-center gap-2 transition-all
                    ${quality === q 
                      ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}
                  `}
                >
                  <span className={`text-sm font-black uppercase tracking-widest ${quality === q ? 'text-blue-400' : 'text-white/40'}`}>
                    {q}
                  </span>
                  {q === 'high' && <Zap className={`w-4 h-4 ${quality === q ? 'text-blue-400' : 'text-white/20'}`} />}
                  {q === 'medium' && <Shield className={`w-4 h-4 ${quality === q ? 'text-blue-400' : 'text-white/20'}`} />}
                  {q === 'low' && <Sparkles className={`w-4 h-4 ${quality === q ? 'text-blue-400' : 'text-white/20'}`} />}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/30 text-center italic">
              "Higher quality enables complex particle systems and emissive fur layers."
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/40 border-t border-white/10 text-center">
<<<<<<< Updated upstream
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] mb-4">
            Legend of Kai-Jax Engine v2.0.0
          </p>
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={() => window.open('https://legendsofkaijax.com/privacy', '_blank')}
              className="text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => window.open('https://legendsofkaijax.com/terms', '_blank')}
              className="text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest"
            >
              Terms of Service
            </button>
          </div>
=======
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em]">
            Legend of Kai-Jax Engine v1.0.4
          </p>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
}
