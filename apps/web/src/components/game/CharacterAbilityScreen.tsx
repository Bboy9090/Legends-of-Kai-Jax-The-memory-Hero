import React from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { ArrowLeft, Check, LockKeyhole } from 'lucide-react';

interface AbilityNode {
  id: string;
  name: string;
  category: 'KAI' | 'JAX' | 'FUSION';
  description: string;
  status: 'AVAILABLE' | 'STORY-GATED';
  requirement: string;
}

/**
 * Canon rule: score is performance telemetry, not a currency for lineage,
 * fusion stability, or Kai-Jax tail progression. The ninth tail is a story
 * coronation milestone and can never be purchased from this screen.
 */
const ABILITIES: AbilityNode[] = [
  {
    id: 'kai-memory-weave',
    name: 'Memory Weave',
    category: 'KAI',
    description: 'Kai uses Myrr’Kai inheritance to trace, connect, bind, and protect through memory-web techniques.',
    status: 'AVAILABLE',
    requirement: 'Kai baseline lineage ability',
  },
  {
    id: 'kai-ember-protection',
    name: 'Ember Protection',
    category: 'KAI',
    description: 'Pyraxis inheritance turns Kai’s fire toward protection, endurance, and close-range pressure.',
    status: 'AVAILABLE',
    requirement: 'Kai baseline lineage ability',
  },
  {
    id: 'jax-storm-displacement',
    name: 'Storm Displacement',
    category: 'JAX',
    description: 'Jax combines Kar-Voth displacement with Thryxen storm pressure for explosive traversal and combat control.',
    status: 'AVAILABLE',
    requirement: 'Jax baseline lineage ability',
  },
  {
    id: 'kai-jax-fusion-stability',
    name: 'Fusion Stability',
    category: 'FUSION',
    description: 'Kai-Jax gains control, duration, and access through story-earned synchronization. Base fusion begins with exactly three tails.',
    status: 'STORY-GATED',
    requirement: 'Earned through story, trust, memory discovery, and ancestral synchronization',
  },
  {
    id: 'kai-jax-nine-tail-coronation',
    name: 'Ninth Tail — Coronation',
    category: 'FUSION',
    description: 'The ninth tail is the culmination of Kai-Jax’s emotional and narrative progression. It is never a purchasable permanent-form upgrade.',
    status: 'STORY-GATED',
    requirement: 'Late-story coronation milestone only',
  },
];

const CATEGORY_STYLE: Record<AbilityNode['category'], string> = {
  KAI: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  JAX: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  FUSION: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
};

export default function CharacterAbilityScreen() {
  const { setGameState, totalScore } = useRunner();

  return (
    <div className="fixed inset-0 z-50 bg-[#050510] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between z-10 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setGameState('menu')}
            aria-label="Back to menu"
            className="p-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-black italic tracking-wider uppercase">CHARACTER ABILITIES</h1>
            <p className="text-xs text-amber-400 font-mono tracking-widest uppercase">LINEAGE MASTERY & STORY PROGRESSION</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 font-mono text-xs font-bold">
          COMBAT SCORE: {totalScore.toLocaleString()}
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto py-8 z-10">
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-slate-300 leading-relaxed">
          Combat score measures performance. It does not buy bloodline powers, fusion stability, or tails. Story-gated abilities unlock only when their canonical narrative milestones are reached.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ABILITIES.map((node) => {
            const available = node.status === 'AVAILABLE';
            return (
              <div
                key={node.id}
                className={`p-6 rounded-3xl border backdrop-blur-xl flex flex-col justify-between ${
                  available
                    ? 'bg-purple-950/20 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.14)]'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-3">
                    <span className={`text-[10px] font-bold tracking-widest px-3 py-1 rounded-full border ${CATEGORY_STYLE[node.category]}`}>
                      {node.category}
                    </span>
                    {available ? (
                      <Check className="w-5 h-5 text-emerald-400" aria-label="Available" />
                    ) : (
                      <LockKeyhole className="w-5 h-5 text-slate-500" aria-label="Story gated" />
                    )}
                  </div>
                  <h3 className="text-xl font-black italic uppercase">{node.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{node.description}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Requirement</div>
                  <div className="text-xs text-slate-300">{node.requirement}</div>
                  <div className={`mt-3 text-xs font-mono font-bold uppercase ${available ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {available ? 'AVAILABLE' : 'STORY-GATED'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
