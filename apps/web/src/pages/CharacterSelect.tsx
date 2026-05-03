// LEGENDS OF KAI-JAX: HERO SELECTION
// Path: apps/web/src/pages/CharacterSelect.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { GameStateContext } from '@web/router/gameRouter';
import { getAllCharacters, Character } from '../lib/roster';
import AnatomicalBeastModel from '../components/game/models/AnatomicalBeastModel';
import '@web/styles/bronx_grit.css';

const CharacterSelect: React.FC = () => {
  const navigate = useNavigate();
  const { state, setState } = React.useContext(GameStateContext);
  
  const characters = useMemo(() => getAllCharacters(), []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = characters[selectedIndex];

  const handleSelectCharacter = () => {
    setState({ ...state, selectedCharacter: selected.id });
    
    if (state.selectedMode === 'saga') {
      navigate('/saga-mode');
    } else if (state.selectedMode === 'versus') {
      navigate('/versus-mode');
    } else {
      navigate('/saga-mode');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        setSelectedIndex(Math.max(0, selectedIndex - 1));
        break;
      case 'ArrowRight':
        setSelectedIndex(Math.min(characters.length - 1, selectedIndex + 1));
        break;
      case 'Enter':
      case ' ':
        handleSelectCharacter();
        break;
      case 'Escape':
        navigate('/');
        break;
    }
  };

  return (
    <div
      className="w-full h-screen bg-black flex flex-col relative overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Background Gritty Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/textures/grunge_overlay.png')] bg-cover" />
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-cyan-900/20 to-transparent" />
      </div>

      <div className="grit-filter" />

      {/* Header */}
      <div className="relative z-20 text-center pt-8 pointer-events-none">
        <h1 className="text-legendary text-5xl tracking-[0.2em] drop-shadow-[0_0_15px_rgba(0,242,255,0.5)]">
          SELECT YOUR HERO
        </h1>
        <div className="h-0.5 w-64 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2" />
        <p className="text-mono-small text-cyan-400 mt-2 uppercase tracking-widest">{selected.title}</p>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-4 px-4 md:px-12 py-4">
        
        {/* Left Stats Panel */}
        <div className="w-full md:w-80 flex flex-col gap-6 bg-black/40 backdrop-blur-md p-6 border border-cyan-400/20 rounded-lg order-2 md:order-1">
          <div>
            <h2 className="text-legendary text-3xl mb-1 text-cyan-400">{selected.name}</h2>
            <span className="text-mono-small px-2 py-0.5 bg-cyan-900/40 border border-cyan-400/30 rounded text-cyan-300">
              {selected.role.toUpperCase()}
            </span>
          </div>

          <p className="text-grit text-sm leading-relaxed opacity-80">
            Legendary fighter forged in the {selected.id === 'kai-jax' || selected.id === 'jaxon' ? 'Bronx' : 'Rift'} sector. 
            Master of the {selected.abilities[0]} technique.
          </p>

          <div className="space-y-4">
            {Object.entries(selected.stats).map(([stat, value]) => (
              <div key={stat} className="group">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-mono-small text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                    {stat.toUpperCase()}
                  </span>
                  <span className="text-cyan-400 text-xs font-bold">{value}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500 ease-out"
                    style={{ 
                      width: `${value}%`,
                      boxShadow: '0 0 10px rgba(0, 242, 255, 0.5)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleSelectCharacter}
            className="mt-4 w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black tracking-widest rounded transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,242,255,0.3)]"
          >
            INITIALIZE SYNC
          </button>
        </div>

        {/* Center 3D Preview */}
        <div className="flex-1 w-full h-[40vh] md:h-full relative order-1 md:order-2">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={40} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color={selected.primaryColor} />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <AnatomicalBeastModel
                fighter={{
                  id: selected.id,
                  name: selected.name,
                  color: selected.primaryColor,
                  accentColor: selected.accentColor,
                  baseStats: {
                    power: selected.stats.attack,
                    speed: selected.stats.speed,
                    defense: selected.stats.defense,
                    gravity: 9.8
                  }
                } as any}
                bodyRef={null as any}
                headRef={null as any}
                leftArmRef={null as any}
                rightArmRef={null as any}
                leftLegRef={null as any}
                rightLegRef={null as any}
                emotionIntensity={0}
                hitAnim={0}
                animTime={0}
                isAttacking={false}
                isInvulnerable={false}
              />
            </Float>

            <ContactShadows 
              position={[0, -1, 0]} 
              opacity={0.4} 
              scale={10} 
              blur={2} 
              far={4.5} 
            />
            <Environment preset="city" />
          </Canvas>

          {/* Selector Navigation Arrows (Visual only for hint) */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none opacity-50">
             <div className="text-4xl text-cyan-400">«</div>
             <div className="text-4xl text-cyan-400">»</div>
          </div>
        </div>

        {/* Right Info Panel (Abilities/Details) */}
        <div className="hidden lg:flex w-64 flex-col gap-4 bg-black/40 backdrop-blur-md p-6 border border-cyan-400/20 rounded-lg order-3">
          <h3 className="text-mono-small text-cyan-400 border-b border-cyan-400/20 pb-2">CORE ABILITIES</h3>
          <div className="space-y-4">
            {selected.abilities.map((ability, i) => (
              <div key={i} className="group cursor-help">
                <p className="text-cyan-200 text-sm font-bold group-hover:text-white transition-colors">{ability}</p>
                <p className="text-[10px] text-gray-500 uppercase">Primary Memory Strand</p>
              </div>
            ))}
          </div>

          <h3 className="text-mono-small text-cyan-400 border-b border-cyan-400/20 pb-2 mt-4">SYNERGIES</h3>
          <div className="flex flex-wrap gap-2">
            {selected.synergies.map((syn, i) => (
              <span key={i} className="text-[10px] px-2 py-1 bg-gray-900 border border-white/5 rounded text-gray-400 capitalize">
                {syn}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Navigation (Thumbnails) */}
      <div className="relative z-20 w-full bg-black/80 backdrop-blur-xl border-t border-cyan-400/20 py-4 px-6 overflow-x-auto no-scrollbar">
        <div className="flex justify-center gap-3 min-w-max mx-auto">
          {characters.map((char, idx) => (
            <button
              key={char.id}
              onClick={() => setSelectedIndex(idx)}
              className={`
                group relative px-6 py-3 rounded overflow-hidden transition-all duration-300
                ${
                  idx === selectedIndex
                    ? 'bg-cyan-500 text-black scale-105 shadow-[0_0_15px_rgba(0,242,255,0.4)]'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-white/5'
                }
              `}
            >
              <span className="relative z-10 text-mono-small font-bold uppercase tracking-widest">{char.name}</span>
              {idx === selectedIndex && (
                 <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-transparent opacity-50" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Hint */}
      <div className="absolute bottom-2 right-4 z-30 text-[10px] text-gray-600 flex gap-4 pointer-events-none uppercase tracking-tighter">
        <span>[Arrow Keys] Navigate</span>
        <span>[Enter] Confirm</span>
        <span>[Esc] Back</span>
      </div>
    </div>
  );
};

export default CharacterSelect;
