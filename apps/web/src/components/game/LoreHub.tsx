import { useState } from 'react';
import { BookOpen, ChevronRight, Flame, Shield, Swords, Zap } from 'lucide-react';
import { useRunner } from '../../lib/stores/useRunner';

type ArchiveTab = 'HEROES' | 'ANCESTORS' | 'WORLD';

interface ArchiveEntry {
  id: string;
  name: string;
  subtitle: string;
  body: string;
  tags: string[];
  accent: 'memory' | 'storm' | 'ember' | 'gold';
}

const HEROES: ArchiveEntry[] = [
  {
    id: 'kai',
    name: 'KAI',
    subtitle: 'Memory-Web / Ember Beast-Kin',
    body: 'A fully nonhuman Beast-Kin hero carrying equal dominant inheritance from Myrr’Kai and Pyraxis. Kai fights and traverses through four visible spider limbs, web movement, memory weave, venom-charged strikes, ember power, and a fierce protective instinct.',
    tags: ['Myrr’Kai', 'Pyraxis', '4 Spider Limbs', 'Web', 'Memory', 'Venom', 'Ember'],
    accent: 'memory',
  },
  {
    id: 'jax',
    name: 'JAX',
    subtitle: 'Storm / Displacement Beast-Kin',
    body: 'A fully nonhuman Beast-Kin hero dominated by Kar-Voth and Thryxen. Jax controls storm, lightning, pressure, air movement, and displacement. His gameplay identity is explosive and sovereign rather than a faster copy of Kai.',
    tags: ['Kar-Voth', 'Thryxen', 'Storm', 'Lightning', 'Pressure', 'Displacement'],
    accent: 'storm',
  },
  {
    id: 'kai-jax',
    name: 'KAI-JAX',
    subtitle: 'Fusion Hero / Bloodward Convergence',
    body: 'Kai-Jax carries all four ancestral godlines. Base fusion begins with exactly three tails and four spider limbs. Additional tails are earned through story, emotional growth, lineage mastery, memory discovery, and fusion stability—not purchased with score or XP. The ninth tail is coronation, not ownership of memory.',
    tags: ['4 Godlines', 'Base: 3 Tails', 'Fusion Stability', 'Story-Gated Growth'],
    accent: 'gold',
  },
  {
    id: 'boryn',
    name: 'BORYN',
    subtitle: 'Father / Protector / Sacrifice',
    body: 'Boryn saved and raised Kai and Jax as family. His combat identity centers on guarding, intercepting, endurance, protection, and sacrifice. His death remains a canonical sacrifice; later playable appearances must be framed through memory, archive, training, flashback, or Arena simulation.',
    tags: ['Father', 'Guardian', 'Protection', 'Sacrifice'],
    accent: 'ember',
  },
  {
    id: 'borax',
    name: 'BORAX',
    subtitle: 'Storm Ronin / Mentor',
    body: 'Boryn’s brother and a disciplined storm ronin. After feeling Boryn’s death, Borax finds and tests the brothers, reveals that Boryn was his brother, and becomes a mentor and second father without replacing Boryn. His fighting style is precision, counters, judgment, stance discipline, and deliberate storm pressure.',
    tags: ['Storm Ronin', 'Mentor', 'Counterplay', 'Discipline', 'Judgment'],
    accent: 'storm',
  },
];

const ANCESTORS: ArchiveEntry[] = [
  {
    id: 'kar-voth',
    name: 'KAR-VOTH',
    subtitle: 'The First Fang',
    body: 'The ancestral Sabertooth liger-mammoth line of electricity, displacement, hunger, and initiation. Kar-Voth is a dominant source of Jax’s explosive movement and lightning inheritance.',
    tags: ['Liger-Mammoth', 'Electricity', 'Displacement', 'Initiation'],
    accent: 'storm',
  },
  {
    id: 'thryxen',
    name: 'THRYXEN',
    subtitle: 'Storm Sovereign',
    body: 'The ancestral Sabertooth lion line of wind, storm, air pressure, sovereignty, and law. Thryxen shapes Jax’s command of pressure and the air around a fight.',
    tags: ['Lion', 'Storm', 'Wind', 'Pressure', 'Law'],
    accent: 'storm',
  },
  {
    id: 'pyraxis',
    name: 'PYRAXIS',
    subtitle: 'Bloodward Titan',
    body: 'The ancestral Sabertooth tiger line of fire, protection, sacrifice, and endurance. Pyraxis gives Kai more than flame: it anchors his instinct to protect and survive.',
    tags: ['Tiger', 'Fire', 'Protection', 'Sacrifice', 'Endurance'],
    accent: 'ember',
  },
  {
    id: 'myrr-kai',
    name: 'MYRR’KAI',
    subtitle: 'Memory Eater',
    body: 'The female ancestral Sabertooth wolf-spider line of memory, web, venom, continuity, and fusion. Her spider traits are visible and central to Kai’s identity, not a cosmetic or horror mutation.',
    tags: ['Wolf-Spider', 'Memory', 'Web', 'Venom', 'Continuity', 'Fusion'],
    accent: 'memory',
  },
];

const WORLD: ArchiveEntry[] = [
  {
    id: 'raging-city',
    name: 'RAGING CITY',
    subtitle: 'The Living Core of the Campaign',
    body: 'Raging City is gameplay space, not only menu scenery. Its districts support exploration, vertical traversal, civilians, faction pressure, secrets, memory fragments, side missions, environmental storytelling, alternate paths, and dynamic encounters. Kai and Jax should navigate the same city differently.',
    tags: ['Exploration', 'Traversal', 'Side Missions', 'Memory Fragments', 'Dynamic Encounters'],
    accent: 'gold',
  },
  {
    id: 'districts',
    name: 'KNOWN REGIONS',
    subtitle: 'Established Locations',
    body: 'Current established locations include Ashblock Heights, Ironvein Wards, Skyfall Spines, Storm Ronin Sanctum, Fang Syndicate territory, and memory-related facilities or ruins only where the story source confirms them.',
    tags: ['Ashblock Heights', 'Ironvein Wards', 'Skyfall Spines', 'Storm Ronin Sanctum'],
    accent: 'memory',
  },
  {
    id: 'fang-syndicate',
    name: 'FANG SYNDICATE',
    subtitle: 'Established Enemy Faction',
    body: 'A canonical threat tied to pursuit, control, and exploitation of Sabertooth bloodlines. Enemy design should grow from established faction purpose before adding disposable enemy races or invented organizations.',
    tags: ['Pursuit', 'Control', 'Bloodline Exploitation'],
    accent: 'ember',
  },
  {
    id: 'anti-sabertooth-covenant',
    name: 'ANTI-SABERTOOTH COVENANT',
    subtitle: 'Established Counter-Sabertooth Threat',
    body: 'A canonical hostile force built around anti-Sabertooth countermeasures, suppression, traps, and specialized responses to ancestral powers.',
    tags: ['Suppression', 'Traps', 'Countermeasures', 'Specialized Enemies'],
    accent: 'storm',
  },
  {
    id: 'archive-rule',
    name: 'LEGENDS ARCHIVE RULE',
    subtitle: 'Chronology-Safe Playability',
    body: 'Story chronology remains authoritative. Dead, historical, or otherwise impossible matchups stay playable through Memory Echoes, archive simulations, training, flashbacks, challenges, or Combat Arena framing rather than rewriting canonical deaths and events.',
    tags: ['Memory Echo', 'Archive', 'Training', 'Combat Arena', 'No Canon Resets'],
    accent: 'gold',
  },
];

const TAB_DATA: Record<ArchiveTab, ArchiveEntry[]> = {
  HEROES,
  ANCESTORS,
  WORLD,
};

const ACCENTS: Record<ArchiveEntry['accent'], { border: string; glow: string; tag: string }> = {
  memory: {
    border: 'border-purple-500/35',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.10)]',
    tag: 'border-purple-500/30 bg-purple-500/10 text-purple-200',
  },
  storm: {
    border: 'border-cyan-400/35',
    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.09)]',
    tag: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  },
  ember: {
    border: 'border-orange-400/35',
    glow: 'shadow-[0_0_30px_rgba(251,146,60,0.09)]',
    tag: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  },
  gold: {
    border: 'border-amber-400/35',
    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.09)]',
    tag: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  },
};

export default function LoreHub() {
  const { setGameState } = useRunner();
  const [tab, setTab] = useState<ArchiveTab>('HEROES');

  return (
    <main className="min-h-screen bg-[#05050b] text-white overflow-y-auto">
      <section className="relative border-b border-white/10 px-5 py-10 sm:px-10 lg:px-16 lg:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(124,58,237,0.18),transparent_42%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.12),transparent_38%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
                <BookOpen className="h-4 w-4" />
                Canon Archive
              </div>
              <h1 className="text-4xl font-black uppercase italic tracking-tight sm:text-6xl">
                Legends of Kai-Jax
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-amber-200 to-cyan-300">
                  The Memory King
                </span>
              </h1>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Forged in the Raging City. Crowned by Memory.
              </p>
              <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                This archive follows the current story and gameplay canon. Sabertooth is an ancestral blood-mark across species—not one animal species. Story chronology, bloodline identity, fusion progression, and character relationships remain authoritative across Story Mode and Combat Arena.
              </p>
            </div>

            <button
              onClick={() => setGameState('menu')}
              className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-amber-200 transition hover:bg-amber-400/20"
            >
              Enter Game
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3" role="tablist" aria-label="Legends Archive sections">
            {(['HEROES', 'ANCESTORS', 'WORLD'] as ArchiveTab[]).map((item) => (
              <button
                key={item}
                role="tab"
                aria-selected={tab === item}
                onClick={() => setTab(item)}
                className={`rounded-xl border px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
                  tab === item
                    ? 'border-purple-400/60 bg-purple-500/20 text-white'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-10 lg:px-16">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.06] p-5">
            <div className="mb-2 flex items-center gap-2 text-purple-300"><Shield className="h-4 w-4" /><span className="text-xs font-black uppercase tracking-widest">Story First</span></div>
            <p className="text-xs leading-6 text-slate-400">Adventure, relationships, exploration, memory, and chronology drive progression.</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-5">
            <div className="mb-2 flex items-center gap-2 text-cyan-300"><Swords className="h-4 w-4" /><span className="text-xs font-black uppercase tracking-widest">Arena Second</span></div>
            <p className="text-xs leading-6 text-slate-400">Arena simulation permits challenge matchups without turning them into literal story events.</p>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-5">
            <div className="mb-2 flex items-center gap-2 text-amber-300"><Flame className="h-4 w-4" /><span className="text-xs font-black uppercase tracking-widest">No Tail Shop</span></div>
            <p className="text-xs leading-6 text-slate-400">Kai-Jax tail progression is earned through narrative and emotional development, never purchased with score.</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {TAB_DATA[tab].map((entry) => {
            const accent = ACCENTS[entry.accent];
            return (
              <article
                key={entry.id}
                className={`rounded-3xl border bg-white/[0.025] p-6 sm:p-7 ${accent.border} ${accent.glow}`}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-wide">{entry.name}</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{entry.subtitle}</p>
                  </div>
                  {entry.accent === 'storm' ? <Zap className="h-5 w-5 text-cyan-300" /> : entry.accent === 'ember' ? <Flame className="h-5 w-5 text-orange-300" /> : <BookOpen className="h-5 w-5 text-purple-300" />}
                </div>
                <p className="text-sm leading-7 text-slate-300">{entry.body}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span key={tag} className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${accent.tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
          <div className="flex items-center gap-3 text-amber-300">
            <BookOpen className="h-5 w-5" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Continuity Lock</h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            The archive does not silently restore deaths, change lineage, invent factions, move revelations earlier, or grant characters knowledge before the story gives it to them. Where a source is not yet locked, implementation must mark the decision as pending rather than filling the gap with new lore.
          </p>
        </div>
      </section>
    </main>
  );
}
