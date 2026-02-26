import { useEffect, useState } from "react";
import { useAudio } from "../../lib/stores/useAudio";
import { useKeybinds, type KeybindAction } from "../../lib/stores/useKeybinds";
import {
  useSettings,
  type JoystickSize,
  type GraphicsQuality,
  type ColorblindMode,
  type UIScale,
} from "../../lib/stores/useSettings";
import { ArrowLeft } from "../ui/icons";
import { Settings } from "../ui/icons";

const CYAN = "#22d3ee";
const AMBER = "#f59e0b";

function SegmentedButton<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            value === o.value ? "bg-cyan-500/40 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface SettingsPanelProps {
  onClose: () => void;
  /** If true, render as slide-out panel; otherwise as modal overlay */
  variant?: "modal" | "slide";
}

const ACTION_LABELS: Record<KeybindAction, string> = {
  punch: "Punch",
  kick: "Kick",
  special: "Special",
  ultimate: "Ultimate",
  transform: "Transform",
  jump: "Jump",
  pause: "Pause",
};

function formatKey(code: string): string {
  if (code.startsWith("Key")) return code.slice(3).toUpperCase();
  if (code === "Space") return "Space";
  if (code.startsWith("Arrow")) return code.replace("Arrow", "");
  if (code.startsWith("Digit")) return code.slice(5);
  return code;
}

export default function SettingsPanel({ onClose, variant = "modal" }: SettingsPanelProps) {
  const {
    isMuted,
    setMuted,
    masterVolume,
    setMasterVolume,
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    playHit,
  } = useAudio();

  const keybinds = useKeybinds((s) => ({
    punch: s.punch,
    kick: s.kick,
    special: s.special,
    ultimate: s.ultimate,
    transform: s.transform,
  }));
  const [capturing, setCapturing] = useState<KeybindAction | null>(null);

  useEffect(() => {
    if (!capturing) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const ok = useKeybinds.getState().setKeybind(capturing, e.code);
      if (ok) setCapturing(null);
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [capturing]);

  const {
    joystickSize,
    setJoystickSize,
    graphicsQuality,
    setGraphicsQuality,
    colorblindMode,
    setColorblindMode,
    uiScale,
    setUiScale,
  } = useSettings();

  const playTestSfx = () => {
    if (!isMuted) playHit();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const panelClasses =
    variant === "slide"
      ? "fixed top-0 right-0 h-full w-full max-w-sm shadow-2xl transition-transform duration-300 ease-out"
      : "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-fit max-h-[90vh] w-full max-w-md overflow-auto rounded-xl shadow-2xl";

  return (
    <>
      {/* Backdrop (for modal or slide overlay) */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`z-50 flex flex-col gap-6 p-6 ${panelClasses}`}
        style={{
          background: "linear-gradient(180deg, #0a0a14 0%, #0f0f1a 50%, #0a0a14 100%)",
          border: "1px solid rgba(34,211,238,0.15)",
          boxShadow: `0 0 40px rgba(34,211,238,0.08), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ color: CYAN }}><Settings className="w-6 h-6" /></span>
            <h2 className="text-xl font-bold text-white tracking-wide">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-600/60 hover:border-cyan-500/40"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="space-y-6">
          {/* Mute toggle */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-200 font-medium">Mute all sound</span>
              <button
                role="switch"
                aria-checked={isMuted}
                onClick={() => setMuted(!isMuted)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  isMuted ? "bg-slate-600" : "bg-cyan-500/60"
                }`}
                style={!isMuted ? { boxShadow: `0 0 12px ${CYAN}50` } : undefined}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    isMuted ? "left-1" : "left-7"
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Master volume */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label className="block text-slate-200 font-medium mb-3">Master volume</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full accent-cyan-500"
              style={{
                background: `linear-gradient(to right, ${CYAN}80 0%, ${CYAN}80 ${masterVolume * 100}%, rgba(255,255,255,0.1) ${masterVolume * 100}%)`,
              }}
            />
            <p className="text-slate-500 text-sm mt-1">{Math.round(masterVolume * 100)}%</p>
          </div>

          {/* Music volume */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label className="block text-slate-200 font-medium mb-3">Music volume</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full accent-cyan-500"
              style={{
                background: `linear-gradient(to right, ${CYAN}60 0%, ${CYAN}60 ${musicVolume * 100}%, rgba(255,255,255,0.1) ${musicVolume * 100}%)`,
              }}
            />
            <p className="text-slate-500 text-sm mt-1">{Math.round(musicVolume * 100)}%</p>
          </div>

          {/* Joystick size */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label className="block text-slate-200 font-medium mb-3">Joystick size</label>
            <SegmentedButton<JoystickSize>
              options={[
                { value: "normal", label: "Normal" },
                { value: "large", label: "Large" },
              ]}
              value={joystickSize}
              onChange={setJoystickSize}
            />
          </div>

          {/* Graphics quality */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label className="block text-slate-200 font-medium mb-3">Graphics</label>
            <SegmentedButton<GraphicsQuality>
              options={[
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
              value={graphicsQuality}
              onChange={setGraphicsQuality}
            />
          </div>

          {/* Colorblind mode */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label className="block text-slate-200 font-medium mb-3">Colorblind mode</label>
            <SegmentedButton<ColorblindMode>
              options={[
                { value: "off", label: "Off" },
                { value: "protanopia", label: "Protanopia" },
                { value: "deuteranopia", label: "Deuteranopia" },
              ]}
              value={colorblindMode}
              onChange={setColorblindMode}
            />
          </div>

          {/* UI scale */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label className="block text-slate-200 font-medium mb-3">UI scale</label>
            <SegmentedButton<UIScale>
              options={[
                { value: "small", label: "Small" },
                { value: "normal", label: "Normal" },
                { value: "large", label: "Large" },
              ]}
              value={uiScale}
              onChange={setUiScale}
            />
          </div>

          {/* SFX volume */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-200 font-medium">SFX volume</label>
              <button
                onClick={playTestSfx}
                className="text-xs px-2 py-1 rounded text-amber-400/90 hover:text-amber-400 border border-amber-500/40 hover:border-amber-400/60 transition-colors"
                style={{ background: "rgba(245,158,11,0.08)" }}
              >
                Test
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full"
              style={{
                accentColor: AMBER,
                background: `linear-gradient(to right, ${AMBER}80 0%, ${AMBER}80 ${sfxVolume * 100}%, rgba(255,255,255,0.1) ${sfxVolume * 100}%)`,
              }}
            />
            <p className="text-slate-500 text-sm mt-1">{Math.round(sfxVolume * 100)}%</p>
          </div>

          {/* Controls */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-slate-200 font-medium mb-3">Controls</h3>
            <div className="space-y-2">
              {(["punch", "kick", "special", "ultimate", "transform"] as KeybindAction[]).map((action) => (
                <div key={action} className="flex items-center justify-between gap-3">
                  <span className="text-slate-300 text-sm">{ACTION_LABELS[action]}:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`min-w-[3rem] px-2 py-1 rounded text-sm font-mono ${
                        capturing === action ? "bg-amber-500/30 text-amber-300 border-amber-500/60" : "bg-slate-700/60 text-slate-200"
                      }`}
                    >
                      {capturing === action ? "..." : formatKey((keybinds as Record<string, string>)[action] ?? "")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCapturing(capturing === action ? null : action)}
                      className="text-xs px-2 py-1 rounded text-cyan-400 hover:text-cyan-300 border border-cyan-500/40 hover:border-cyan-400/60 transition-colors"
                      style={{ background: "rgba(34,211,238,0.08)" }}
                    >
                      {capturing === action ? "Cancel" : "Change"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-xs">Settings are saved automatically.</p>
      </aside>
    </>
  );
}
