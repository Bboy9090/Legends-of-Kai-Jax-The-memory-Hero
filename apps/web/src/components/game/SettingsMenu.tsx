import { useRunner } from "../../lib/stores/useRunner";
import { useAudio } from "../../lib/stores/useAudio";
import DefenseStatsPanel from "./DefenseStatsPanel";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { useMusic } from "../../lib/stores/useMusic";
import { useAccessibility } from "../../lib/stores/useAccessibility";
import { COLORBLIND_MODES } from "../../lib/accessibilitySettings";
import { Settings, Volume2, VolumeX, Monitor, ArrowLeft, Zap, Shield, Sparkles, Mic2 } from "lucide-react";
import { useState } from "react";
import { getQualityPreference, setQualityPreference, type QualityPreference } from "../../lib/threejs/PerformanceOptimizer";
import { getVoiceVolume, setVoiceVolume, isVoiceEnabled_, setVoiceEnabled } from "../../lib/voiceActing";

export default function SettingsMenu() {
  const { setGameState } = useRunner();
  const { isMuted, toggleMute, volume, setVolume } = useAudio();
  const [quality, setQuality] = useState<QualityPreference>(() => getQualityPreference());
  const [voiceVolume, setVoiceVolumeState] = useState(getVoiceVolume());
  const [voiceEnabled, setVoiceEnabledState] = useState(isVoiceEnabled_());
  const a11y = useAccessibility();
  const music = useMusic();
  const pwa = usePWAInstall();

  const handleBack = () => {
    setGameState("menu");
  };

  const handleVoiceVolumeChange = (value: number) => {
    setVoiceVolumeState(value);
    setVoiceVolume(value);
  };

  const handleVoiceToggle = () => {
    const newState = !voiceEnabled;
    setVoiceEnabledState(newState);
    setVoiceEnabled(newState);
  };

  return (
    <div className="kj-safe-screen fixed inset-0 z-50 w-full overflow-y-auto bg-[#050510] p-3 sm:p-6">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Settings Container */}
      <div className="relative z-10 mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/40">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-widest text-white uppercase sm:text-3xl">Settings</h1>
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
        <div className="space-y-8 p-4 sm:space-y-10 sm:p-8">
          {/* Audio Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-white/80">Audio</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
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
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-white font-bold text-lg">Master Volume</p>
                  <span className="text-blue-400 font-bold" data-testid="master-volume-value">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  aria-label="Master volume"
                  data-testid="master-volume-slider"
                  disabled={isMuted}
                  className="w-full accent-blue-500 disabled:opacity-40"
                />
              </div>
            </div>
          </section>

          <DefenseStatsPanel />

          {/* Install Section */}
          {pwa.canInstall || pwa.ios ? (
            <section data-testid="install-app" aria-label="Install app">
              <h2 className="mb-4 text-lg font-bold uppercase tracking-widest text-white/80">Install</h2>
              {pwa.canInstall ? (
                <button type="button" data-testid="install-app-button" className="rounded-lg border border-white/15 px-4 py-2 text-xs uppercase tracking-widest hover:bg-white/10" onClick={() => void pwa.install()}>
                  Install Kai-Jax on this device
                </button>
              ) : (
                <p className="text-sm text-white/70" data-testid="install-ios-hint">To install: tap Share, then &ldquo;Add to Home Screen&rdquo;.</p>
              )}
            </section>
          ) : null}

          {/* Music Section */}
          <section data-testid="music-settings" aria-label="Music">
            <h2 className="mb-4 text-lg font-bold uppercase tracking-widest text-white/80">Music</h2>
            <div className="space-y-4 text-sm text-white/80">
              <label className="flex items-center justify-between gap-3">
                <span>Adaptive score (changes with the action)</span>
                <input type="checkbox" data-testid="music-adaptive" checked={music.adaptive} onChange={(e) => music.setAdaptive(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Music volume</span>
                <input type="range" data-testid="music-volume" min={0} max={1} step={0.05} value={music.musicVolume} disabled={!music.adaptive} onChange={(e) => music.setMusicVolume(Number(e.target.value))} />
              </label>
            </div>
          </section>

          {/* Accessibility Section */}
          <section data-testid="a11y-settings" aria-label="Accessibility">
            <h2 className="mb-4 text-lg font-bold uppercase tracking-widest text-white/80">Accessibility &amp; HUD</h2>
            <div className="space-y-4 text-sm text-white/80">
              <label className="flex items-center justify-between gap-3">
                <span>Reduced motion</span>
                <input type="checkbox" data-testid="a11y-reduced-motion" checked={a11y.reducedMotion} onChange={(e) => a11y.update({ reducedMotion: e.target.checked })} />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Haptic feedback</span>
                <input type="checkbox" data-testid="a11y-haptics" checked={a11y.hapticsEnabled} onChange={(e) => a11y.update({ hapticsEnabled: e.target.checked })} />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Colorblind-safe HUD</span>
                <select data-testid="a11y-colorblind" className="rounded bg-black/60 px-2 py-1" value={a11y.colorblindMode} onChange={(e) => a11y.update({ colorblindMode: e.target.value as typeof a11y.colorblindMode })}>
                  {COLORBLIND_MODES.map((m) => <option key={m} value={m}>{m === "none" ? "Off" : m}</option>)}
                </select>
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Subtitle size</span>
                <select data-testid="a11y-subtitles" className="rounded bg-black/60 px-2 py-1" value={a11y.subtitleScale} onChange={(e) => a11y.update({ subtitleScale: e.target.value as "normal" | "large" })}>
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                </select>
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Parry timing</span>
                <select data-testid="a11y-parry-timing" className="rounded bg-black/60 px-2 py-1" value={a11y.parryTiming} onChange={(e) => a11y.update({ parryTiming: e.target.value as "standard" | "generous" })}>
                  <option value="standard">Standard</option>
                  <option value="generous">Generous</option>
                </select>
              </label>
              {([
                ["hudButtonScale", "Touch button size", 0.8, 1.4, 0.05],
                ["hudOpacity", "Touch control opacity", 0.4, 1, 0.05],
                ["hudEdgeOffset", "Touch edge offset (px)", 0, 48, 2],
              ] as const).map(([key, label, min, max, step]) => (
                <label key={key} className="flex items-center justify-between gap-3">
                  <span>{label}</span>
                  <input type="range" data-testid={`a11y-${key}`} min={min} max={max} step={step} value={a11y[key]} onChange={(e) => a11y.update({ [key]: Number(e.target.value) })} />
                </label>
              ))}
              <button type="button" className="rounded-lg border border-white/15 px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-white/10" onClick={() => a11y.reset()}>Reset accessibility</button>
            </div>
          </section>

          {/* Voice Acting Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Mic2 className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-white/80">Voice Acting</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <p className="text-white font-bold text-lg">Character Voices</p>
                  <p className="text-white/40 text-sm">Enable dialogue voice acting with TTS</p>
                </div>
                <button
                  onClick={handleVoiceToggle}
                  className={`
                    relative w-16 h-8 rounded-full transition-colors duration-300
                    ${voiceEnabled ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-gray-700'}
                  `}
                >
                  <div className={`
                    absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300
                    ${voiceEnabled ? 'left-9' : 'left-1'}
                  `} />
                </button>
              </div>
              {voiceEnabled && (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white font-bold">Voice Volume</p>
                    <span className="text-blue-400 font-bold">{Math.round(voiceVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceVolume}
                    onChange={(e) => handleVoiceVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-white/40 text-xs mt-3">Adjust volume for character dialogue and voice acting</p>
                </div>
              )}
            </div>
          </section>

          {/* Video Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-white/80">Performance</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['auto', 'low', 'medium', 'high'] as QualityPreference[]).map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuality(q);
                    setQualityPreference(q);
                  }}
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
                  {q === 'auto' && <Monitor className={`w-4 h-4 ${quality === q ? 'text-blue-400' : 'text-white/20'}`} />}
                  {q === 'high' && <Zap className={`w-4 h-4 ${quality === q ? 'text-blue-400' : 'text-white/20'}`} />}
                  {q === 'medium' && <Shield className={`w-4 h-4 ${quality === q ? 'text-blue-400' : 'text-white/20'}`} />}
                  {q === 'low' && <Sparkles className={`w-4 h-4 ${quality === q ? 'text-blue-400' : 'text-white/20'}`} />}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/30 text-center italic">
              "Auto adapts to your device. Low, Medium, and High override the renderer immediately."
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/40 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] mb-4">
            Legend of Kai-Jax Engine v2.0.0
          </p>
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={() => window.open('/privacy.html', '_blank')}
              className="text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => window.open('/terms.html', '_blank')}
              className="text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
