

export interface MoveInfo {
  name: string;
  command: string;
  description: string;
  stamina: number;
  type: 'light' | 'heavy' | 'special' | 'ultimate';
}

export const TRAINING_MOVES: MoveInfo[] = [
  { name: "Light Combo 1", command: "J (x1)", description: "Quick slash with the memory claws.", stamina: 10, type: 'light' },
  { name: "Light Combo 2", command: "J, J", description: "Follow-up spinning kick.", stamina: 10, type: 'light' },
  { name: "Light Combo 3", command: "J, J, J", description: "Memory surge finisher.", stamina: 15, type: 'light' },
  { name: "Heavy Strike", command: "K", description: "Powerful overhead smash. Breaks armor.", stamina: 25, type: 'heavy' },
  { name: "Dash Attack", command: "Dash + J", description: "Sliding thrust that launches enemies.", stamina: 20, type: 'special' },
  { name: "Dodge", command: "Space", description: "Quick dash with i-frames.", stamina: 15, type: 'special' },
  { name: "Memory Burst", command: "L", description: "AoE energy blast. Clears surroundings.", stamina: 40, type: 'special' },
  { name: "Ultimate: Rift End", command: "Resonance 100%", description: "Unleashes all 9 tails in a reality-warping strike.", stamina: 0, type: 'ultimate' },
];

export default function MoveListOverlay() {
  return (
    <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6 w-80 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
      <h3 className="text-cyan-400 font-black tracking-widest text-sm mb-4 uppercase flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        Command List
      </h3>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {TRAINING_MOVES.map((move, i) => (
          <div key={i} className="group border-b border-white/5 pb-3 last:border-0">
            <div className="flex justify-between items-start mb-1">
              <span className="text-white font-bold text-xs uppercase tracking-tight">{move.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-white/5">
                {move.command}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed group-hover:text-slate-300 transition-colors">
              {move.description}
            </p>
            <div className="flex gap-2 mt-1.5">
               <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${
                 move.type === 'ultimate' ? 'bg-amber-500/20 text-amber-400' :
                 move.type === 'heavy' ? 'bg-red-500/20 text-red-400' :
                 'bg-cyan-500/20 text-cyan-400'
               }`}>
                 {move.type}
               </span>
               {move.stamina > 0 && (
                 <span className="text-[8px] text-slate-600 font-mono">STAMINA: {move.stamina}</span>
               )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[9px] text-slate-600 italic text-center">
        Practice these forms to unlock hidden resonance.
      </p>
    </div>
  );
}
