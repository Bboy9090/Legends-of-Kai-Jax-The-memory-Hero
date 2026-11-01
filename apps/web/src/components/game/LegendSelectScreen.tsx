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
  image?: string;
  imagePosition?: string;
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
    image: '/brand/kai-and-jax-before-merge.png',
    imagePosition: '30% center',
    traits: ['Memory-Web', 'Venom Strike', 'Rescue Utility'],
  },
  {
    id: 'jax',
    name: 'JAX',
    subtitle: 'STORM FANG',
    role: 'PLAYABLE LEGEND',
    accent: '#5aaeff',
    image: '/brand/kai-and-jax-before-merge.png',
    imagePosition: '72% center',
    traits: ['Storm Pressure', 'Speed', 'Disrupt'],
  },
  {
    id: 'kai-jax',
    name: 'KAI-JAX',
    subtitle: 'FUSION HERO',
    role: 'PLAYABLE LEGEND',
    accent: '#efc76d',
    image: '/images/lore/hero-kaijax.png',
    imagePosition: 'center 22%',
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
    <div className="kj-vision-shell kj-safe-screen fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(2,3,7,.28),rgba(2,3,7,.72)),url('/models/ruined_city_bg.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(157,78,221,.18),transparent_32%),linear-gradient(90deg,rgba(0,0,0,.72),transparent_28%,transparent_72%,rgba(0,0,0,.72))]" />

      <header className="relative z-10 grid grid-cols-[auto_1fr] items-start gap-3 border-b border-[#7d6136]/55 px-3 pb-3 pt-1 sm:flex sm:items-center sm:justify-between sm:px-8 sm:py-4">
        <button
          type="button"
          onClick={() => setGameState('story-hub')}
          className="kj-vision-button flex items-center gap-1.5 px-3 py-2 text-[9px] sm:gap-2 sm:px-4 sm:text-[10px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Story Hub
        </button>

        <div className="min-w-0 text-center">
          <div className="text-[8px] uppercase tracking-[0.28em] text-[#9f8762] sm:text-[10px] sm:tracking-[0.45em]">Adventure Mode</div>
          <h1 className="kj-vision-title mt-1 text-[clamp(1.45rem,7vw,2.2rem)] leading-none tracking-[0.08em] sm:text-5xl sm:tracking-[0.13em]">Character Select</h1>
          <div className="kj-vision-subtitle mt-1 text-[8px] leading-snug tracking-[0.18em] sm:mt-2 sm:text-xs sm:tracking-[0.32em]">Choose Your Hero · The Raging City Awaits</div>
        </div>

        <div className="hidden text-right text-[9px] uppercase tracking-[0.24em] text-[#8b806f] sm:block">
          <div>Story Mode</div>
          <div className="mt-1 text-[#c8af82]">Memory King</div>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col px-3 pb-24 pt-3 sm:h-[calc(100vh-152px)] sm:px-6 sm:py-4">
        <div className="kj-mobile-legend-strip mx-auto flex h-full w-full max-w-[1540px] snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden pb-2 sm:grid sm:snap-none sm:grid-cols-[minmax(105px,.58fr)_repeat(3,minmax(0,1fr))_minmax(105px,.58fr)] sm:overflow-visible sm:pb-0 lg:gap-4">
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
                  'group relative flex w-[72vw] max-w-[290px] shrink-0 snap-center flex-col overflow-hidden border bg-black/55 text-left transition sm:w-auto sm:max-w-none sm:shrink sm:snap-align-none ' +
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
                    background: legend.image
                      ? `
                        radial-gradient(circle at 50% 28%, ${legend.accent}20, transparent 34%),
                        linear-gradient(180deg, rgba(2,3,7,.02) 32%, rgba(2,3,7,.92) 94%),
                        url('${legend.image}') ${legend.imagePosition ?? 'center'}/cover no-repeat
                      `
                      : `
                        radial-gradient(circle at 50% 24%, ${legend.accent}38, transparent 30%),
                        linear-gradient(180deg, ${legend.accent}14, rgba(2,3,7,.16) 42%, rgba(2,3,7,.96)),
                        url('/models/ruined_city_bg.jpg') center/cover
                      `,
                  }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05)_35%,rgba(0,0,0,.94)_96%)]" />
                  {!legend.image ? (
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
                  ) : (
                    <div
                      className="absolute inset-x-[8%] bottom-[8%] h-[30%] rounded-[50%] blur-3xl"
                      style={{ background: `${legend.accent}20` }}
                      aria-hidden="true"
                    />
                  )}

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

                  <div className="mt-2 space-y-1 border-t border-white/5 pt-2 sm:mt-4 sm:space-y-1.5 sm:pt-3">
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

        <div className="fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),12px)] z-40 mx-auto flex max-w-[900px] items-center justify-between gap-2 border border-[#735c39]/70 bg-[#05070bf2] p-2 shadow-[0_-10px_30px_rgba(0,0,0,.55)] backdrop-blur-md sm:static sm:mt-3 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
          <button
            type="button"
            onClick={() => setGameState('story-hub')}
            className="kj-vision-button min-w-0 flex-1 px-4 py-2.5 text-[10px] sm:min-w-36 sm:flex-none sm:px-6 sm:py-3 sm:text-xs"
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
            className="kj-vision-button min-w-0 flex-[1.4] px-4 py-2.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-44 sm:flex-none sm:px-8 sm:py-3 sm:text-xs"
            style={{ borderColor: active.locked ? undefined : active.accent }}
          >
            Confirm Legend
          </button>
        </div>
      </main>
    </div>
  );
}
