import { ArrowLeft, Code2, Gamepad2, Heart, ShieldCheck } from 'lucide-react';
import { useRunner } from '../../lib/stores/useRunner';

export default function CreditsScreen() {
  const setGameState = useRunner((s) => s.setGameState);

  const sections = [
    {
      icon: Gamepad2,
      title: 'Game Direction',
      lines: ['Bobby’s Workshop', 'Legends of Kai-Jax: The Memory Hero'],
    },
    {
      icon: Code2,
      title: 'Engineering & Systems',
      lines: ['Web / Mobile Runtime', 'Combat, Adventure, Save & Progression Systems'],
    },
    {
      icon: ShieldCheck,
      title: 'Release & Quality',
      lines: ['Cross-platform CI', 'Android, iOS, Web and Accessibility Qualification'],
    },
    {
      icon: Heart,
      title: 'Special Thanks',
      lines: ['To the family, players, testers, and everyone helping the Raging City remember.'],
    },
  ];

  return (
    <div className="kj-vision-shell kj-safe-screen fixed inset-0 z-50 overflow-y-auto px-4 py-4 text-white sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <button
          type="button"
          onClick={() => setGameState('menu')}
          className="kj-vision-button mb-6 flex items-center gap-2 px-4 py-2.5 text-[10px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Menu
        </button>

        <header className="mb-8 text-center">
          <div className="text-[9px] uppercase tracking-[0.35em] text-[#9f8762]">The Memory King</div>
          <h1 className="kj-vision-title mt-2 text-3xl sm:text-5xl">Credits</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#b7ad9e]">
            Built as a living action-adventure universe across story, combat, mobile, and desktop experiences.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map(({ icon: Icon, title, lines }) => (
            <section key={title} className="kj-vision-panel p-5">
              <Icon className="h-5 w-5 text-[#efc76d]" />
              <h2 className="mt-3 text-sm uppercase tracking-[0.18em] text-[#efcf91]">{title}</h2>
              <div className="mt-3 space-y-1 text-sm leading-6 text-[#b7ad9e]">
                {lines.map((line) => <p key={line}>{line}</p>)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 text-center text-[9px] uppercase tracking-[0.22em] text-[#776d60]">
          Forged in the Raging City · Crowned by Memory
        </div>
      </div>
    </div>
  );
}
