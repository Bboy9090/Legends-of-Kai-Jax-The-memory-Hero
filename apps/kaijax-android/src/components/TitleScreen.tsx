import React, { useState } from 'react';
import { BookOpen, CloudDownload, Download, Play, RotateCcw, Settings, Shield, WifiOff } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import { SaveSlotData } from '../game/types';

interface TitleScreenProps {
  hasExistingSave: boolean;
  latestSave: SaveSlotData | null;
  syncedCanonCount: number;
  onContinue: (selectedHero: 'kai' | 'jax') => void;
  onNewCampaign: (selectedHero: 'kai' | 'jax') => void;
  onOpenHub: (tab: 'canon' | 'settings' | 'map') => void;
  onOpenCanonDrive: () => void;
  onOpenLegal: (docId: 'privacy' | 'terms') => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasExistingSave,
  latestSave,
  syncedCanonCount,
  onContinue,
  onNewCampaign,
  onOpenHub,
  onOpenCanonDrive,
  onOpenLegal,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [selectedHero, setSelectedHero] = useState<'kai' | 'jax'>(
    () => latestSave?.activeHero ?? 'kai'
  );

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-6 lg:p-8 safe-area-pad pointer-events-none">
      {/* Top Bar: Clean Single-Row Navigation */}
      <header className="flex items-center justify-between gap-4 pointer-events-auto">
        <div className="text-sm font-medium tracking-wide text-slate-200 whitespace-nowrap shrink-0">
          Act I · Ashblock Heights
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {!isOnline && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 bg-[#131620]/95 border border-amber-500/40 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
              Offline Ready
            </span>
          )}

          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="min-h-[40px] sm:min-h-[44px] inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          )}

          {!isInstalled && !isInstallable && isIOS && (
            <button
              onClick={install}
              onClickCapture={(e) => {
                e.stopPropagation();
                setShowIOSGuide(true);
              }}
              className="min-h-[40px] sm:min-h-[44px] inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#131620]/95 border border-slate-600 hover:border-slate-400 text-slate-100 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              Install on iOS
            </button>
          )}

          <button
            onClick={onOpenCanonDrive}
            className="min-h-[40px] sm:min-h-[44px] inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/70 text-emerald-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <CloudDownload className="w-4 h-4 text-emerald-300" />
            <span>
              {syncedCanonCount > 0 ? `Canon Drive (${syncedCanonCount})` : 'Sync Google Drive Canon'}
            </span>
          </button>

          <button
            onClick={() => onOpenHub('canon')}
            className="min-h-[40px] sm:min-h-[44px] inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#131620]/95 border border-slate-600 hover:border-violet-400/80 text-slate-100 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4 text-violet-300" />
            Canon Bible
          </button>

          <button
            onClick={() => onOpenHub('settings')}
            aria-label="Open Settings and Saves"
            className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] inline-flex items-center justify-center rounded-lg bg-[#131620]/95 border border-slate-600 hover:border-slate-400 text-slate-100 transition-colors shrink-0"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Title, Lead Predator Selection & Primary Actions anchored cleanly at bottom-left */}
      <div className="max-w-xl max-h-[calc(100dvh-64px)] overflow-y-auto bg-[#0a0b10]/92 border border-slate-700/90 rounded-2xl p-4 sm:p-6 [@media(max-height:500px)]:p-3.5 pointer-events-auto shadow-2xl">
        <p className="text-xs font-medium text-amber-300 tracking-wider mb-1 [@media(max-height:500px)]:mb-0.5">
          Original Urban Fantasy Action RPG · Single-Player Offline
        </p>
        <h1 className="font-display text-3xl sm:text-5xl [@media(max-height:500px)]:text-2xl font-bold tracking-tight text-slate-50 leading-none text-balance">
          Legends of Kai-Jax: The Memory Hero
        </h1>
        <p className="mt-2 [@media(max-height:500px)]:mt-1 text-sm [@media(max-height:500px)]:text-xs text-slate-200 leading-relaxed [@media(max-height:500px)]:leading-snug max-w-lg [@media(max-height:500px)]:line-clamp-2">
          Master Kai&apos;s Memory Weave and spider-limb web combat alongside Jax&apos;s Storm Fang displacement. Rescue Ashblock Heights, execute Duo Finishers, and awaken the three-tail convergence.
        </p>

        {/* Character Selection: Choose Lead Predator (Partner fights alongside as AI & instant Switch) */}
        <div className="mt-3.5 [@media(max-height:500px)]:mt-2">
          <div className="text-xs font-semibold text-slate-300 mb-1.5 [@media(max-height:500px)]:mb-1">
            Select Lead Predator (Switch brothers anytime in combat)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedHero('kai')}
              className={`min-h-[44px] [@media(max-height:500px)]:min-h-[40px] rounded-xl border px-3 py-1.5 text-left transition-colors ${
                selectedHero === 'kai'
                  ? 'bg-[#171326] border-violet-400 text-white'
                  : 'bg-[#131620] border-slate-700 hover:border-slate-500 text-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-violet-300 whitespace-nowrap">KAI · Spider &amp; Memory</div>
              <div className="text-[11px] text-slate-300 truncate">
                4 Dorsal Limbs · Web Pull &amp; Wall Pin
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedHero('jax')}
              className={`min-h-[44px] [@media(max-height:500px)]:min-h-[40px] rounded-xl border px-3 py-1.5 text-left transition-colors ${
                selectedHero === 'jax'
                  ? 'bg-[#101c2a] border-sky-400 text-white'
                  : 'bg-[#131620] border-slate-700 hover:border-slate-500 text-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-sky-300 whitespace-nowrap">JAX · Storm &amp; Guard Break</div>
              <div className="text-[11px] text-slate-300 truncate">
                7 Storm Crests · Electric Launcher
              </div>
            </button>
          </div>
        </div>

        {latestSave && (
          <div className="mt-2.5 [@media(max-height:500px)]:mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-300 font-mono-tabular">
            <span>Saved Slot: {latestSave.label}</span>
            <span aria-hidden="true">·</span>
            <span>Kai Lv.{latestSave.heroes.kai.level}</span>
            <span aria-hidden="true">·</span>
            <span>Jax Lv.{latestSave.heroes.jax.level}</span>
            <span aria-hidden="true">·</span>
            <span>Fragments: {latestSave.memoryFragments}</span>
          </div>
        )}

        <div className="mt-3.5 [@media(max-height:500px)]:mt-2 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            {hasExistingSave ? (
              <>
                <button
                  onClick={() => onContinue(selectedHero)}
                  className="min-h-[44px] [@media(max-height:500px)]:min-h-[40px] inline-flex items-center gap-2 px-5 py-2 [@media(max-height:500px)]:py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm [@media(max-height:500px)]:text-xs transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Continue as {selectedHero === 'kai' ? 'Kai' : 'Jax'}
                </button>
                <button
                  onClick={() => onNewCampaign(selectedHero)}
                  className="min-h-[44px] [@media(max-height:500px)]:min-h-[40px] inline-flex items-center gap-2 px-4 py-2 [@media(max-height:500px)]:py-1.5 rounded-xl bg-[#131620] hover:bg-slate-800 border border-slate-600 text-slate-100 font-medium text-sm [@media(max-height:500px)]:text-xs transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Game
                </button>
              </>
            ) : (
              <button
                onClick={() => onNewCampaign(selectedHero)}
                className="min-h-[44px] [@media(max-height:500px)]:min-h-[40px] inline-flex items-center gap-2 px-5 py-2 [@media(max-height:500px)]:py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm [@media(max-height:500px)]:text-xs transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                Enter Ashblock as {selectedHero === 'kai' ? 'Kai' : 'Jax'}
              </button>
            )}

            <button
              onClick={() => onOpenHub('map')}
              className="min-h-[44px] [@media(max-height:500px)]:min-h-[40px] inline-flex items-center gap-2 px-3.5 py-2 [@media(max-height:500px)]:py-1.5 rounded-xl bg-[#131620] hover:bg-slate-800 border border-slate-600 text-slate-100 font-medium text-sm [@media(max-height:500px)]:text-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Shield className="w-4 h-4 text-sky-300" />
              8 Districts
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="min-h-[36px] hover:text-amber-300 underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onOpenLegal('terms')}
              className="min-h-[36px] hover:text-amber-300 underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Terms of Use
            </button>
          </div>
        </div>
      </div>

      {/* iOS Install Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pointer-events-auto">
          <div className="w-full max-w-sm rounded-2xl bg-[#131620] border border-slate-700 p-6 shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-white">Install on iPhone or iPad</h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              1. Tap the <strong>Share</strong> icon in Safari&apos;s toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong> for full offline standalone play.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
