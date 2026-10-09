import React, { useMemo } from 'react';
import { ArrowLeft, LockKeyhole, Shield, Sparkles, Zap } from 'lucide-react';
import { useRunner } from '../../lib/stores/useRunner';

type LegendCard = {
  id: string;
  name: string;
  subtitle: string;
  role: string;
  accent: string;
  locked?: boolean;
  mentor?: boolean;
  traits: string[];
};

const LEGENDS: LegendCard[] = [
  {
    id: 'boryn',
    name: 'BORYN',
    subtitle: 'THE SHIELD',
    role: 'MENTOR MEMORY',
    accent: '#d97732',
    locked: true,
    mentor: true,
    traits: ['Protection', 'Blood Memory', 'Legacy'],
  },
  {
    id: 'kai',
    name: 'KAI',
    subtitle: 'MEMORY-WEB HEIR',
    role: 'PLAYABLE LEGEND',
    accent: '#c76cff',
    traits: ['Memory-Web', 'Venom Strike', 'Rescue Utility'],
  },
  {
    id: 'jax',
    name: 'JAX',
    subtitle: 'STORM FANG',
    role: 'PLAYABLE LEGEND',
    accent: '#5aaeff',
    traits: ['Storm Pressure', 'Speed', 'Disrupt'],
  },
  {
    id: 'kai-jax',
    name: 'KAI-JAX',
    subtitle: 'FUSION HERO',
    role: 'PLAYABLE LEGEND',
    accent: '#efc76d',
    traits: ['Fusion Form', 'Memory Resistance', 'Synergy'],
  },
  {
    id: 'borax',
    name: 'BORAX',
    subtitle: 'THE LAW',
    role: 'GUARDIAN ECHO',
    accent: '#9dc6ff',
    locked: true,
    mentor: true,
    traits: ['Discipline', 'Mentorship', 'Authority'],
  },
];

export default function LegendSelectScreen() {
  const selectedCharacter = useRunner((s) => s.selectedCharacter);
  const setCharacter = useRunner((s) => s.setCharacter);
  const setGameState = useRunner((s) => s.setGameState);

  const active = useMemo(
    () => LEGENDS.find((legend) => legend.id === selectedCharacter)
      ?? LEGENDS.find((legend) => legend.id === 'kai-jax')!,
    [selectedCharacter],
  );

  const confirm = () => {
    if (active.locked) return;
    setGameState('mission-select');
  };

  return (
    <div className="kj-vision-shell fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(2,3,7,.28),rgba(2,3,7,.72)),url('/models/ruined_city_bg.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(157,78,221,.18),transparent_32%),linear-gradient(90deg,rgba(0,0,0,.72),transparent_28%,transparent_72%,rgba(0,0,0,.72))]" />

      <header className="relative z-10 flex items-center justify-between border-b border-[#7d6136]/55 px-5 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => setGameState('story-hub')}
          className="kj-vision-button flex items-center gap-2 px-4 py-2 text-[10px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Story Hub
        </button>

        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.45em] text-[#9f8762]">Adventure Mode</div>
          <h1 className="kj-vision-title mt-1 text-3xl sm:text-5xl">Choose Your Legend</h1>
          <div className="kj-vision-subtitle mt-2 text-[10px] sm:text-xs">The Raging City Awaits</div>
        </div>

        <div className="hidden text-right text-[9px] uppercase tracking-[0.24em] text-[#8b806f] sm:block">
          <div>Story Mode</div>
          <div className="mt-1 text-[#c8af82]">Memory King</div>
        </div>
      </header>

      <main className="relative z-10 flex h-[calc(100vh-152px)] min-h-0 flex-col px-4 py-4 sm:px-6">
        <div className="mx-auto grid h-full w-full max-w-[1540px] grid-cols-5 gap-2 lg:gap-4">
          {LEGENDS.map((legend) => {
            const selected = legend.id === active.id;
            return (
              <button
                key={legend.id}
                type="button"
                disabled={legend.locked}
                onClick={() => setCharacter(legend.id)}
                aria-pressed={selected}
                className={
                  'group relative flex min-w-0 flex-col overflow-hidden border bg-black/55 text-left transition ' +
                  (legend.locked
                    ? 'cursor-default opacity-72'
                    : 'hover:-translate-y-1 hover:bg-black/70')
                }
                style={{
                  borderColor: selected ? legend.accent : 'rgba(122,96,53,.52)',
                  boxShadow: selected ? `0 0 32px ${legend.accent}44, inset 0 0 40px ${legend.accent}12` : 'none',
                }}
              >
                <div
                  className="relative min-h-0 flex-1 overflow-hidden"
                  style={{
                    background: `
                      radial-gradient(circle at 50% 24%, ${legend.accent}38, transparent 30%),
                      linear-gradient(180deg, ${legend.accent}14, rgba(2,3,7,.16) 42%, rgba(2,3,7,.96)),
                      url('/models/ruined_city_bg.jpg') center/cover
                    `,
                  }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(0,0,0,.94)_96%)]" />
                  <div
                    className="absolute left-1/2 top-[18%] grid h-28 w-28 -translate-x-1/2 place-items-center rounded-full border text-5xl sm:h-36 sm:w-36"
                    style={{
                      color: legend.accent,
                      borderColor: `${legend.accent}66`,
                      background: `radial-gradient(circle, ${legend.accent}2f, rgba(0,0,0,.68) 68%)`,
                      boxShadow: `0 0 44px ${legend.accent}28`,
                    }}
                    aria-hidden="true"
                  >
                    {legend.mentor ? <Shield className="h-16 w-16" /> : legend.id === 'jax' ? <Zap className="h-16 w-16" /> : <Sparkles className="h-16 w-16" />}
                  </div>

                  {legend.locked ? (
                    <div className="absolute left-1/2 top-[54%] flex -translate-x-1/2 items-center gap-2 border border-[#9d835b]/50 bg-black/75 px-3 py-1.5 text-[9px] uppercase tracking-[0.22em] text-[#b7a17d]">
                      <LockKeyhole className="h-3 w-3" />
                      Story Mentor
                    </div>
                  ) : null}
                </div>

                <div className="relative border-t border-[#735c39]/45 bg-[linear-gradient(180deg,rgba(10,10,14,.96),rgba(3,4,7,.99))] p-3 sm:p-4">
                  <div className="text-[8px] uppercase tracking-[0.24em] text-[#817665]">{legend.role}</div>
                  <div className="mt-1 text-[clamp(17px,2vw,30px)] tracking-[0.12em] text-[#efe5cf]">{legend.name}</div>
                  <div className="mt-1 text-[8px] uppercase tracking-[0.18em]" style={{ color: legend.accent }}>{legend.subtitle}</div>

                  <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
                    {legend.traits.map((trait) => (
                      <div key={trait} className="flex items-center gap-2 text-[8px] uppercase tracking-[0.12em] text-[#9a9081]">
                        <span className="text-[10px]" style={{ color: legend.accent }}>✦</span>
                        <span>{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-3 flex w-full max-w-[900px] items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setGameState('story-hub')}
            className="kj-vision-button min-w-36 px-6 py-3 text-xs"
          >
            Back
          </button>

          <div className="hidden text-center text-[9px] uppercase tracking-[0.25em] text-[#8f806b] md:block">
            Selected · <span style={{ color: active.accent }}>{active.name}</span>
          </div>

          <button
            type="button"
            disabled={active.locked}
            onClick={confirm}
            data-testid="legend-select-confirm"
            className="kj-vision-button min-w-44 px-8 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: active.locked ? undefined : active.accent }}
          >
            Confirm Legend
          </button>
        </div>
      </main>
    </div>
  );
}
