import { useRunner } from "../../lib/stores/useRunner";
import { getFighterById } from "../../lib/characters";
import {
  VERSUS_ROSTER,
  getCombatProfileId,
  type VersusRosterEntry,
} from "../../lib/versusRoster";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";

function factionLabel(faction: VersusRosterEntry['faction']): string {
  switch (faction) {
    case 'core': return 'Core Lineage';
    case 'first-sabertooths': return 'First Sabertooths';
    case 'bloodward-antagonist': return 'Bloodward Antagonist';
    case 'ancient-antagonist': return 'Ancient Antagonist';
    case 'engineered-horror': return 'Engineered Horror';
  }
}

export default function CustomizationMenu() {
  const setGameState = useRunner((s) => s.setGameState);
  const fusionUnlocked = useRunner((s) => s.kaiJaxFusionUnlocked);

  const isUnlocked = (entry: VersusRosterEntry) =>
    entry.defaultUnlocked || (entry.id === 'kai-jax' && fusionUnlocked);

  const unlockedCount = VERSUS_ROSTER.filter(isUnlocked).length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#130a22] via-[#071426] to-[#07131a] text-white overflow-y-auto">
      <div className="bg-black/40 border-b border-cyan-400/50 p-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300 mb-1">Legends Archive</p>
            <h1 className="text-4xl font-black bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Character Customization
            </h1>
            <p className="text-gray-300 mt-2 text-sm max-w-2xl">
              Only publication-safe identities appear here. A visual source or old combat profile does not automatically make a character, costume, or form story-unlocked.
            </p>
          </div>
          <Button
            onClick={() => setGameState('menu')}
            className="bg-slate-800 hover:bg-slate-700 px-6 py-3 text-white font-bold self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {VERSUS_ROSTER.map((entry) => {
            const combatProfile = getFighterById(getCombatProfileId(entry));
            const unlocked = isUnlocked(entry);
            const profileReady = Boolean(combatProfile);
            const accent = combatProfile?.accentColor ?? (entry.role === 'boss' ? '#a78bfa' : '#94a3b8');
            const base = combatProfile?.color ?? '#111827';

            return (
              <Card
                key={entry.id}
                className={`border-2 bg-slate-950/65 ${unlocked ? '' : 'opacity-70'}`}
                style={{ borderColor: `${accent}88` }}
              >
                <CardContent className="p-5">
                  <div
                    className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl text-2xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${accent}55, ${base})`,
                      border: `2px solid ${accent}77`,
                      color: accent,
                    }}
                  >
                    {entry.displayName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="text-center">
                    <h2 className="text-lg font-black text-white">{entry.displayName}</h2>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">{factionLabel(entry.faction)}</p>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-slate-300 space-y-2">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Story state</span>
                      <span className={unlocked ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                        {unlocked ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Combat profile</span>
                      <span className={profileReady ? 'text-cyan-300' : 'text-slate-500'}>
                        {profileReady ? 'INTEGRATED' : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/[0.03] border border-white/5 p-3 text-[11px] leading-5 text-slate-400">
                    {unlocked ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <LockKeyhole className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span>
                      {entry.id === 'kai-jax' && !unlocked
                        ? 'Kai-Jax remains story-gated. Base fusion begins with exactly three tails.'
                        : unlocked
                          ? 'Customization may use only approved visual variants for this identity.'
                          : 'Unlock conditions remain controlled by story chronology and current character locks.'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-black/40 border border-amber-400/40 mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-black text-amber-300 mb-2">Publication-Safe Roster</h3>
            <p className="text-4xl font-black text-white mb-2">{unlockedCount} / {VERSUS_ROSTER.length}</p>
            <p className="text-sm text-slate-400">
              Locked identities stay visible for provenance and planning, but cannot be treated as story-available until their required canon and gameplay gates close.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
