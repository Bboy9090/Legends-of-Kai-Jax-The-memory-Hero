import React, { useState, useEffect, useRef } from 'react';
import { 
  Skull, 
  Activity, 
  Zap, 
  Swords, 
  Crown, 
  ShieldAlert,
  BookOpen,
  Trophy,
  Settings,
  Users,
  PlayCircle
} from 'lucide-react';

/**
 * THE AETERNA: LEGENDARY MAIN MENU
 * 
 * Aesthetic: Bronx Grit + $200M Cinematic Polish
 * Philosophy: "Easy to navigate, impossible not to stare in awe"
 * 
 * Visual Language:
 * - Asphalt-dark textures (0.8 opacity overlay)
 * - Practical lighting (harsh overhead, neon accents)
 * - High-contrast (deep blacks, blown-out whites)
 * - Beast-like majesty (obsidian geometry, living textures)
 */

const AeternaMainMenu = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dreadPulse, setDreadPulse] = useState(0);
  const [resonanceGlow, setResonanceGlow] = useState(0);
  const canvasRef = useRef(null);

  // Menu items - The Sovereignty Navigation
  const menuItems = [
    {
      id: 'saga',
      title: 'SAGA MODE',
      subtitle: 'Books 1-3: Genesis',
      icon: BookOpen,
      color: 'cyan',
      description: 'The Father\'s Fall. The Brothers\' Echo. The Convergence Crown.'
    },
    {
      id: 'gauntlet',
      title: 'SOVEREIGNTY GAUNTLET',
      subtitle: 'The Eternal Trial',
      icon: Trophy,
      color: 'red',
      description: 'Ascend the ladder of resonance. Prove your worthiness to the Aeterna.'
    },
    {
      id: 'resonance-sync',
      title: 'RESONANCE SYNC',
      subtitle: 'Choose Your Beast-Kin',
      icon: Swords,
      color: 'cyan',
      description: 'Attune yourself to the 6 Genesis warriors. Feel their DNA in your core.'
    },
    {
      id: 'core-refinement',
      title: 'CORE REFINEMENT',
      subtitle: 'Training Protocol',
      icon: Zap,
      color: 'yellow',
      description: 'Master frame-perfect inputs. The Kinetic Engine demands precision.'
    },
    {
      id: 'coalition',
      title: 'COALITION WARFARE',
      subtitle: 'Multiplayer Conquest',
      icon: Users,
      color: 'purple',
      description: 'Local 2-4 player battles. Test your resonance against rivals.'
    },
    {
      id: 'settings',
      title: 'PROTOCOL SETTINGS',
      subtitle: 'System Configuration',
      icon: Settings,
      color: 'neutral',
      description: 'Adjust Dread calibration, input polling, and accessibility options.'
    }
  ];

  // Breathing animation for dread/resonance ambience
  useEffect(() => {
    const interval = setInterval(() => {
      setDreadPulse(prev => (prev + 1) % 360);
      setResonanceGlow(prev => Math.sin(prev * 0.02) * 50 + 50);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Particle system for living background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.fillStyle = `rgba(34, 211, 238, ${p.opacity})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const handleSelect = (index) => {
    setIsTransitioning(true);
    setSelectedIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleEnter = () => {
    console.log(`Entering: ${menuItems[selectedIndex].id}`);
    // Navigate to selected screen
  };

  const selectedItem = menuItems[selectedIndex];

  return (
    <div className="relative w-full h-screen bg-black text-white font-mono overflow-hidden">
      {/* LIVING PARTICLE BACKGROUND */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-30"
      />

      {/* BRONX GRIT ASPHALT OVERLAY */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'6\' result=\'noise\' /%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' fill=\'%23111\' filter=\'url(%23noise)\' /%3E%3C/svg%3E")',
          backgroundSize: '256px 256px'
        }}
      />

      {/* TOP: LEGENDARY TITLE SEQUENCE */}
      <div className="absolute top-0 left-0 right-0 z-50 pt-12 px-16">
        <div className="flex flex-col items-center gap-4">
          {/* The Aeterna Logo (Text-based for now) */}
          <div className="relative">
            <h1 className="text-8xl font-black tracking-tight text-white drop-shadow-2xl"
                style={{
                  textShadow: '0 0 40px rgba(34, 211, 238, 0.6), 0 0 80px rgba(34, 211, 238, 0.3)',
                  letterSpacing: '0.05em'
                }}>
              THE AETERNA
            </h1>
            {/* Glitch effect lines */}
            <div className="absolute -top-1 left-0 w-full h-1 bg-cyan-500 opacity-20 blur-sm" />
            <div className="absolute -bottom-1 left-0 w-full h-1 bg-red-500 opacity-20 blur-sm" />
          </div>

          {/* Subtitle */}
          <p className="text-sm tracking-[0.5em] uppercase text-cyan-400 font-bold opacity-80">
            Genesis: The Father's Fall
          </p>

          {/* Separator Line */}
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        </div>
      </div>

      {/* CENTER: BEAST-KIN MENU NAVIGATION */}
      <div className="absolute inset-0 flex items-center justify-center z-40">
        <div className="w-[1200px] flex gap-12">
          {/* LEFT: MENU ITEMS */}
          <div className="flex-1 flex flex-col gap-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === index;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(index)}
                  className={`group relative px-8 py-6 transition-all duration-300 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-transparent border-l-4 border-cyan-500' 
                      : 'bg-neutral-900/30 border-l-4 border-transparent hover:border-neutral-700'
                  }`}
                  style={{
                    backdropFilter: 'blur(8px)',
                    transform: isSelected ? 'translateX(12px) scale(1.02)' : 'translateX(0) scale(1)'
                  }}
                >
                  {/* Hover glow effect */}
                  {isSelected && (
                    <div 
                      className="absolute inset-0 bg-cyan-500/10 animate-pulse pointer-events-none"
                      style={{
                        boxShadow: '0 0 30px rgba(34, 211, 238, 0.3) inset'
                      }}
                    />
                  )}

                  <div className="flex items-center gap-4 relative z-10">
                    {/* Icon */}
                    <div className={`p-3 rounded border transition-all ${
                      isSelected 
                        ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)]' 
                        : 'bg-neutral-800 border-neutral-700 group-hover:border-neutral-600'
                    }`}>
                      <Icon 
                        size={28} 
                        className={isSelected ? 'text-cyan-400' : 'text-neutral-500 group-hover:text-neutral-400'}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 text-left">
                      <h3 className={`text-lg font-black tracking-widest mb-1 transition-colors ${
                        isSelected ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'
                      }`}>
                        {item.title}
                      </h3>
                      <p className={`text-xs uppercase tracking-wider transition-colors ${
                        isSelected ? 'text-cyan-400' : 'text-neutral-600 group-hover:text-neutral-500'
                      }`}>
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: SELECTED ITEM DETAIL PANEL */}
          <div className="w-[500px] relative">
            {/* Beast-like obsidian frame */}
            <div 
              className="relative h-full bg-gradient-to-br from-neutral-900 to-black border-2 border-neutral-800 p-8 transition-all duration-500"
              style={{
                backdropFilter: 'blur(12px)',
                boxShadow: `0 0 60px rgba(34, 211, 238, ${resonanceGlow / 200})`,
                transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
                opacity: isTransitioning ? 0.5 : 1
              }}
            >
              {/* Corner accents (Beast-like geometry) */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-500/50" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-500/50" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-500/50" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-500/50" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Icon large */}
                <div className="mb-6">
                  {React.createElement(selectedItem.icon, {
                    size: 64,
                    className: 'text-cyan-400',
                    strokeWidth: 1.5
                  })}
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black tracking-wider mb-3 text-white">
                  {selectedItem.title}
                </h2>

                {/* Separator */}
                <div className="w-24 h-px bg-cyan-500 mb-6" />

                {/* Description */}
                <p className="text-base leading-relaxed text-neutral-300 mb-8">
                  {selectedItem.description}
                </p>

                {/* Action button */}
                <button
                  onClick={handleEnter}
                  className="mt-auto w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm
                             hover:bg-cyan-400 transition-all duration-200 
                             shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
                >
                  <PlayCircle size={20} className="inline mr-2 mb-1" />
                  INITIATE
                </button>

                {/* Status indicator */}
                <div className="mt-4 text-center text-xs text-neutral-600 uppercase tracking-widest">
                  Press ENTER or Click to Begin
                </div>
              </div>

              {/* Ambient glow pulse */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  background: `radial-gradient(circle at 50% 50%, rgba(34, 211, 238, ${Math.sin(dreadPulse * 0.05) * 0.5 + 0.5}), transparent 70%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: STATUS BAR */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pb-8 px-16">
        <div className="flex justify-between items-center text-xs text-neutral-600 uppercase tracking-widest">
          <div className="flex gap-8">
            <span>▲▼ Navigate</span>
            <span>Enter Confirm</span>
            <span>ESC Exit</span>
          </div>
          
          <div className="flex items-center gap-4">
            <ShieldAlert size={16} className="text-neutral-700" />
            <span>Aeterna Protocol Active</span>
            <div className="w-32 h-1 bg-neutral-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 transition-all duration-1000"
                style={{ width: `${resonanceGlow}%` }}
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-center text-[10px] text-neutral-800 tracking-wider">
          THE AETERNA © 2025 • LEGENDS OF THE MEMORY KING • ALL RIGHTS RESERVED
        </div>
      </div>

      {/* AMBIENT VIGNETTE */}
      <div 
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      {/* DREAD CHROMATIC PULSE (Subtle) */}
      <div 
        className="absolute inset-0 pointer-events-none z-20 opacity-5"
        style={{
          background: `linear-gradient(90deg, rgba(255,0,0,${Math.sin(dreadPulse * 0.02) * 0.3 + 0.3}) 0%, transparent 50%, rgba(0,255,255,${Math.sin(dreadPulse * 0.02) * 0.3 + 0.3}) 100%)`
        }}
      />
    </div>
  );
};

export default AeternaMainMenu;
