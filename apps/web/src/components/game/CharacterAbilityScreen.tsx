import React, { useState } from 'react';
import { useRunner } from '../../lib/stores/useRunner';
import { ArrowLeft, Sparkles, Shield, Flame, Zap, Check } from 'lucide-react';

interface AbilityNode {
  id: string;
  name: string;
  category: 'EMBER' | 'STORM' | 'MEMORY';
  description: string;
  unlocked: boolean;
  cost: number;
}

const ABILITIES: AbilityNode[] = [
  { id: 'fire_dash', name: 'Pyraxis Flame Dash', category: 'EMBER', description: 'Surge forward in a trail of elemental fire, damaging enemies.', unlocked: true, cost: 0 },
  { id: 'storm_lightning', name: 'Thryxen Lightning Burst', category: 'STORM', description: 'Unleash a radial electric shockwave stunning nearby targets.', unlocked: true, cost: 0 },
  { id: 'memory_weave', name: 'Memory Weave Shield', category: 'MEMORY', description: 'Absorb incoming damage and restore synergy energy.', unlocked: false, cost: 150 },
  { id: 'fusion_sovereign', name: 'Sovereign Nine-Tail Form', category: 'MEMORY', description: 'Unlock permanent Memory King Kai-Jax transformation duration.', unlocked: false, cost: 300 },
];

export default function CharacterAbilityScreen() {
  const { setGameState, totalScore } = useRunner();
  const [nodes, setNodes] = useState<AbilityNode[]>(ABILITIES);

  const handleUnlock = (id: string, cost: number) => {
    if (totalScore < cost) return;
    setNodes(nodes.map(n => n.id === id ? { ...n, unlocked: true } : n));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050510] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto font-sans">
      <div className="flex items-center justify-between z-10 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setGameState('menu')}
            className="p-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-black italic tracking-wider uppercase">CHARACTER ABILITIES</h1>
            <p className="text-xs text-amber-400 font-mono tracking-widest uppercase">UPGRADE MEMORY WEAVE & SKILLS</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-mono text-xs font-bold">
          MEMORY POINTS: {totalScore.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full mx-auto my-auto py-6 z-10">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`p-6 rounded-3xl border transition-all backdrop-blur-xl flex flex-col justify-between ${
              node.unlocked 
                ? 'bg-purple-950/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold tracking-widest px-3 py-1 rounded-full border ${
                  node.category === 'EMBER' ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                  node.category === 'STORM' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                  'bg-purple-500/20 text-purple-300 border-purple-500/40'
                }`}>
                  {node.category}
                </span>
                {node.unlocked && <Check className="w-5 h-5 text-emerald-400" />}
              </div>
              <h3 className="text-xl font-black italic uppercase">{node.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{node.description}</p>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400">COST: {node.cost} PTS</span>
              {!node.unlocked ? (
                <button
                  onClick={() => handleUnlock(node.id, node.cost)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 font-bold text-xs tracking-widest uppercase rounded-xl transition-all shadow-md"
                >
                  UNLOCK ABILITY
                </button>
              ) : (
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">UNLOCKED</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
