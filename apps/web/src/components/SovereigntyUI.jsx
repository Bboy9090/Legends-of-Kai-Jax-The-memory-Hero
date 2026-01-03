import React, { useState, useEffect } from 'react';
import { Skull, Activity, Zap, Wind, Flame, ShieldAlert, Gamepad2 } from 'lucide-react';

/**
 * PROJECT OMEGA: SOVEREIGNTY UI (V2.0)
 * 
 * The primary HUD interface for Beast-Kin Resonance Sync (Character Select)
 * Displays Resonance meter, Dread presence, and Gauntlet progression
 * Integrates Bronx Grit aesthetic with cinematic timing sequences
 */

const SovereigntyUI = () => {
  // Game state
  const [era, setEra] = useState(1); // 1: Genesis, 2: Fracture, 3: Oblivion
  const [resonance, setResonance] = useState(0);
  const [dread, setDread] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [gauntletProgress, setGauntletProgress] = useState(1); // Book 1-9
  const [breathlessDialogue, setBreathlessDialogue] = useState('');

  // Genesis cast roster
  const characters = [
    { id: 'kai-jax', name: 'KAI-JAX', title: 'Memory King', type: 'Shape-shifter' },
    { id: 'lunara', name: 'LUNARA SOLIS', title: 'Wise Queen', type: 'Magic' },
    { id: 'chronos', name: 'CHRONOS SERE', title: 'Will of Tomorrow', type: 'Time' },
    { id: 'boryx', name: 'BORYX ZENITH', title: 'Guardian King', type: 'Heavy' },
    { id: 'umbra', name: 'UMBRA-FLUX', title: 'Velocity Wraith', type: 'Speed' },
    { id: 'sentinel', name: 'SENTINEL VOX', title: 'Star-Force Kitsune', type: 'Tech' }
  ];

  // Simulate resonance buildup and dread escalation
  useEffect(() => {
    const interval = setInterval(() => {
      setResonance(prev => Math.min(100, prev + Math.random() * 3));
      setDread(prev => {
        const delta = dread > 70 ? 0.8 : 0.3;
        return Math.min(100, prev + delta);
      });
    }, 300);

    return () => clearInterval(interval);
  }, [dread]);

  // High dread triggers breathless dialogue
  useEffect(() => {
    if (dread > 80) {
      const dialogues = [
        "The Architect... approaches...",
        "Can you feel it... the collapse?",
        "Your will... against inevitability...",
        "The void... calls... your name..."
      ];
      setBreathlessDialogue(dialogues[Math.floor(Math.random() * dialogues.length)]);
    } else {
      setBreathlessDialogue('');
    }
  }, [dread]);

  const handleCharacterSelect = (char) => {
    setSelectedCharacter(char);
    setResonance(50 + Math.random() * 30);
  };

  const handleRessonanceSync = () => {
    if (selectedCharacter && resonance > 40) {
      // Trigger Resonance Sync event
      console.log(`Synced with ${selectedCharacter.name}`);
      setEra(prev => (prev < 3 ? prev + 1 : 1)); // Progress through eras
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white font-mono overflow-hidden">
      {/* BRONX GRIT OVERLAY - Asphalt texture with 0.8 opacity */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' result=\'noise\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' fill=\'%23333\' filter=\'url(%23noise)\' /%3E%3C/svg%3E")',
          backgroundSize: '128px 128px'
        }}
      />

      {/* TOP HUD: RESONANCE SYNC & DREAD METRICS */}
      <div className="absolute top-6 w-full px-12 flex justify-between items-start z-50">
        {/* LEFT: RESONANCE METER */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
            Movie Arc {era}: {era === 1 ? "The Genesis of Convergence" : era === 2 ? "The Fracture of Legacy" : "The Rise of Next Generation"}
          </span>
          
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-cyan-500 animate-pulse" />
            <div className="w-80 h-3 bg-neutral-900 border border-cyan-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.8)] transition-all duration-200"
                style={{ width: `${resonance}%` }}
              />
            </div>
            <span className="text-[9px] text-cyan-300">{Math.floor(resonance)}%</span>
          </div>

          <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">
            Resonance Level (Book {gauntletProgress})
          </span>
        </div>

        {/* RIGHT: DREAD PRESENCE */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-[10px] font-black tracking-widest text-red-500 uppercase">
            Dread Presence: %{Math.floor(dread)}
          </span>
          
          <div className="flex items-center gap-3">
            <div className="w-80 h-3 bg-neutral-900 border border-red-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)] transition-all duration-200"
                style={{ width: `${dread}%` }}
              />
            </div>
            <Skull size={20} className={`transition-colors ${dread > 80 ? 'text-red-500 animate-bounce' : 'text-red-900'}`} />
          </div>

          {breathlessDialogue && (
            <span className="text-[8px] italic text-red-400 animate-pulse max-w-xs text-right">
              "{breathlessDialogue}"
            </span>
          )}
        </div>
      </div>

      {/* CHARACTER ROSTER: RESONANCE SYNC SELECTION */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-wider text-white mb-2 drop-shadow-lg">
            RESONANCE SYNC
          </h1>
          <p className="text-cyan-400 text-sm uppercase tracking-widest font-bold">
            Choose your Beast-Kin warrior
          </p>
        </div>

        {/* Character grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {characters.map(char => (
            <button
              key={char.id}
              onClick={() => handleCharacterSelect(char)}
              className={`relative group transition-all duration-300 ${
                selectedCharacter?.id === char.id ? 'scale-105' : 'hover:scale-102'
              }`}
            >
              {/* Card background */}
              <div className={`p-6 border-2 backdrop-blur-sm transition-all ${
                selectedCharacter?.id === char.id
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.5)]'
                  : 'border-neutral-700 bg-neutral-900/50 hover:border-cyan-400'
              }`}>
                {/* Character visual placeholder */}
                <div className="w-32 h-40 bg-gradient-to-b from-neutral-800 to-black border border-neutral-600 rounded mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <Gamepad2 size={24} className="mx-auto mb-2 text-neutral-600" />
                    <span className="text-[9px] text-neutral-500">{char.type}</span>
                  </div>
                </div>

                {/* Character info */}
                <h3 className="font-black text-[11px] tracking-widest uppercase mb-1">
                  {char.name}
                </h3>
                <p className="text-[9px] text-cyan-400 mb-3">{char.title}</p>

                {/* Stats preview */}
                <div className="text-[8px] text-neutral-400 space-y-1 mb-4">
                  <div>Speed: ████░</div>
                  <div>Power: ███░░</div>
                  <div>Range: ████░</div>
                </div>

                {/* Selection indicator */}
                {selectedCharacter?.id === char.id && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Sync button */}
        {selectedCharacter && (
          <button
            onClick={handleRessonanceSync}
            disabled={resonance < 40}
            className={`w-full py-4 px-8 font-black uppercase tracking-widest text-[12px] transition-all ${
              resonance >= 40
                ? 'bg-white text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]'
                : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            Initiate Resonance Sync ({Math.floor(resonance)}% Ready)
          </button>
        )}

        {!selectedCharacter && (
          <p className="text-center text-[10px] text-neutral-500 uppercase tracking-widest">
            Select a warrior to begin
          </p>
        )}
      </div>

      {/* BOTTOM HUD: STATUS & CONTROLS */}
      <div className="absolute bottom-10 w-full px-12 flex justify-between items-end z-50">
        {/* LEFT: Resonance bar (decorative) */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className={`w-6 h-10 skew-x-[-15deg] border border-cyan-500/30 transition-colors ${
                  resonance > i * 10 ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-neutral-900'
                }`} 
              />
            ))}
          </div>
          <span className="text-[8px] font-bold tracking-[0.2em] text-neutral-600 uppercase">
            Resonance Bars
          </span>
        </div>

        {/* CENTER: Protocol status */}
        <div className="flex flex-col items-center gap-3">
          <ShieldAlert 
            size={48} 
            className={`transition-all ${
              dread > 80 
                ? 'text-red-500 animate-bounce drop-shadow-lg' 
                : 'text-neutral-800'
            }`} 
          />
          <span className="text-[8px] font-bold tracking-[0.4em] text-neutral-500 uppercase">
            Aeterna Protocol Active
          </span>
          {dread > 70 && (
            <span className="text-[7px] text-red-500 font-bold uppercase tracking-wider">
              ⚠ High Dread Warning
            </span>
          )}
        </div>

        {/* RIGHT: Controls hint */}
        <div className="text-right">
          <p className="text-[8px] text-neutral-600 uppercase tracking-widest mb-2">
            Controls
          </p>
          <div className="text-[7px] text-neutral-700 space-y-1">
            <div>UP/DOWN: Navigate</div>
            <div>ENTER: Confirm Selection</div>
            <div>ESC: Return to Menu</div>
          </div>
        </div>
      </div>

      {/* CINEMATIC VIGNETTE OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, rgba(0,0,0,${0.3 + dread/300}) 100%)`
        }}
      />

      {/* DREAD CHROMATIC ABERRATION (High dread only) */}
      {dread > 66 && (
        <div className="absolute inset-0 pointer-events-none z-20 opacity-20">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, rgba(255,0,0,0.3) 0%, transparent 50%, rgba(0,255,255,0.3) 100%)',
            animation: 'aberration 0.1s infinite'
          }} />
        </div>
      )}

      <style>{`
        @keyframes aberration {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(1px); }
        }
      `}</style>
    </div>
  );
};

export default SovereigntyUI;
