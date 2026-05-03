import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/bronx_grit.css';
import '../../styles/legendary-effects.css';
import { BRAND } from '../../lib/brand';
import { useRunner } from '../../lib/stores/useRunner';


/**
 * ⚡ LEGENDS OF KAI-JAX: THE MEMORY WARRIOR ⚡
 * ULTIMATE LEGENDARY MAIN MENU - GOD-TIER EDITION
 * 
 * Features:
 * - Split cosmic battlefield (Kaison left, Jaxon right, Kai-Jax center fusion)
 * - Animated memory shards with prismatic colors
 * - Three Memory Strand Tails visual effects
 * - God-tier particle systems
 * - Legendary text effects with gradient shimmer
 * - Controller-friendly navigation
 * - Epic transformation-ready aesthetic
 */

interface MenuItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  legendary?: boolean;
}

const LegendaryMainMenu: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(1); // Start on New Game
  const [memoryShards, setMemoryShards] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
    type: 'velocity' | 'shield' | 'ghost';
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [titleGlow, setTitleGlow] = useState(0);
  const [showProfileSelect, setShowProfileSelect] = useState(false);

  const profiles = useRunner((s) => s.profiles);
  const activeProfileIndex = useRunner((s) => s.activeProfileIndex);
  const switchProfile = useRunner((s) => s.switchProfile);

  // Safety guard for hydration
  if (!profiles || !profiles.length) {
    return <div className="bg-[#050508] w-full h-screen flex items-center justify-center text-white/20 font-mono">HYDRATING ARCHIVE...</div>;
  }


  // Menu items with legendary styling
  const menuItems: MenuItem[] = [
    {
      id: 'continue',
      label: 'CONTINUE SAGA',
      sublabel: 'Select a memory profile',
      action: () => setShowProfileSelect(true),
    },
    {
      id: 'new-game',
      label: 'NEW GAME',
      sublabel: 'Begin the legend',
      action: () => navigate('/character-select'),
      legendary: true
    },
    {
      id: 'saga-mode',
      label: 'SAGA MODE',
      sublabel: '9 Books of the Memory King',
      action: () => navigate('/saga-mode')
    },
    {
      id: 'versus-mode',
      label: 'VERSUS MODE',
      sublabel: 'Battle your rivals',
      action: () => navigate('/versus-mode')
    },
    {
      id: 'training',
      label: 'TRAINING',
      sublabel: 'Master your forms',
      action: () => navigate('/training')
    },
    {
      id: 'codex',
      label: 'CODEX',
      sublabel: 'The Archive awaits',
      action: () => navigate('/codex')
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      sublabel: 'Configure your experience',
      action: () => navigate('/settings')
    },
  ];

  // Initialize memory shards with three types
  useEffect(() => {
    const shardTypes: Array<'velocity' | 'shield' | 'ghost'> = ['velocity', 'shield', 'ghost'];
    const colors: Record<string, string[]> = {
      velocity: ['#9d4edd', '#c084fc', '#a855f7'], // Purple tones - Jax Strand
      shield: ['#00d9ff', '#22d3ee', '#06b6d4'],    // Cyan tones - Kai Strand
      ghost: ['#7dd3fc', '#bae6fd', '#e0f2fe'],    // Light blue - Father's Strand
    };

    const shards = Array.from({ length: 30 }, (_, i) => {
      const type = shardTypes[i % 3];
      const typeColors = colors[type];
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 12 + 4,
        color: typeColors[Math.floor(Math.random() * typeColors.length)],
        delay: Math.random() * 5,
        type,
      };
    });
    setMemoryShards(shards);

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  // Title glow animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTitleGlow(prev => (prev + 0.02) % (Math.PI * 2));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Background canvas animation (split cosmic battlefield)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // === LEFT SIDE: Kaison's Domain (cool tones) ===
      const leftGradient = ctx.createLinearGradient(0, 0, canvas.width / 2, canvas.height);
      leftGradient.addColorStop(0, 'rgba(37, 99, 235, 0.08)');   // Blue
      leftGradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.06)'); // Purple
      leftGradient.addColorStop(1, 'rgba(6, 182, 212, 0.04)');    // Cyan
      ctx.fillStyle = leftGradient;
      ctx.fillRect(0, 0, canvas.width / 2, canvas.height);

      // Kaison's web pattern
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const x = canvas.width * 0.15 + Math.sin(time * 0.0005 + i) * 50;
        const y = canvas.height * 0.5 + Math.cos(time * 0.0007 + i) * 100;
        ctx.beginPath();
        ctx.arc(x, y, 100 + i * 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      // === RIGHT SIDE: Jaxon's Domain (electric tones) ===
      const rightGradient = ctx.createLinearGradient(canvas.width / 2, 0, canvas.width, canvas.height);
      rightGradient.addColorStop(0, 'rgba(0, 206, 209, 0.06)');   // Cyan
      rightGradient.addColorStop(0.5, 'rgba(0, 100, 200, 0.04)'); // Electric blue
      rightGradient.addColorStop(1, 'rgba(50, 50, 100, 0.03)');   // Dark blue
      ctx.fillStyle = rightGradient;
      ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);

      // Jaxon's electric quills
      for (let i = 0; i < 8; i++) {
        const angle = (time * 0.001 + i * 0.5) % (Math.PI * 2);
        const x = canvas.width * 0.85 + Math.cos(angle) * (60 + i * 10);
        const y = canvas.height * 0.5 + Math.sin(angle) * (60 + i * 10);
        
        const quillGradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
        quillGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
        quillGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = quillGradient;
        ctx.fillRect(x - 30, y - 30, 60, 60);
      }

      // === CENTER: Kai-Jax Fusion Zone ===
      const centerGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 300
      );
      centerGradient.addColorStop(0, 'rgba(255, 215, 0, 0.15)'); // Golden core
      centerGradient.addColorStop(0.3, 'rgba(157, 78, 237, 0.08)'); // Purple mid
      centerGradient.addColorStop(0.6, 'rgba(0, 217, 255, 0.05)'); // Cyan outer
      centerGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Three Memory Strand Tails emanating from center
      const tailColors = [
        { color: 'rgba(157, 78, 237, 0.4)', name: 'velocity' },  // Jax Strand
        { color: 'rgba(0, 217, 255, 0.4)', name: 'shield' },     // Kai Strand
        { color: 'rgba(125, 211, 252, 0.3)', name: 'ghost' },    // Father's Strand
      ];

      tailColors.forEach((tail, index) => {
        const baseAngle = (index / 3) * Math.PI * 2 + Math.PI / 2; // Start from bottom
        for (let seg = 0; seg < 20; seg++) {
          const wave = Math.sin(time * 0.002 + seg * 0.3 + index) * 30;
          const angle = baseAngle + wave * 0.01;
          const distance = 80 + seg * 15;
          const x = canvas.width / 2 + Math.sin(angle) * distance;
          const y = canvas.height / 2 + Math.cos(angle) * distance * 0.7;
          const size = 15 - seg * 0.5;
          
          const tailGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          tailGradient.addColorStop(0, tail.color);
          tailGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = tailGradient;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Nebula drift effect
      const nebulaX = canvas.width / 2 + Math.sin(time * 0.0003) * 100;
      const nebulaY = canvas.height / 2 + Math.cos(time * 0.0004) * 50;
      const nebulaGradient = ctx.createRadialGradient(
        nebulaX, nebulaY, 0,
        nebulaX, nebulaY, 200
      );
      nebulaGradient.addColorStop(0, 'rgba(157, 78, 237, 0.05)');
      nebulaGradient.addColorStop(0.5, 'rgba(0, 217, 255, 0.03)');
      nebulaGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Star field
      for (let i = 0; i < 100; i++) {
        const starX = (i * 137.508) % canvas.width;
        const starY = (i * 73.254) % canvas.height;
        const brightness = Math.sin(time * 0.001 + i) * 0.3 + 0.7;
        const starSize = Math.random() < 0.1 ? 2 : 1;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.5})`;
        ctx.beginPath();
        ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
        ctx.fill();
      }

      time += 16;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setSelectedIndex(prev => {
          let newIndex = prev - 1;
          if (newIndex < 0) newIndex = menuItems.length - 1;
          // Skip disabled items
          while (menuItems[newIndex].disabled && newIndex !== prev) {
            newIndex = newIndex - 1;
            if (newIndex < 0) newIndex = menuItems.length - 1;
          }
          return newIndex;
        });
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSelectedIndex(prev => {
          let newIndex = (prev + 1) % menuItems.length;
          // Skip disabled items
          while (menuItems[newIndex].disabled && newIndex !== prev) {
            newIndex = (newIndex + 1) % menuItems.length;
          }
          return newIndex;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const item = menuItems[selectedIndex];
        if (item && !item.disabled) {
          item.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, isLoading, menuItems]);

  // Loading screen
  if (isLoading) {
    return (
      <div className="legendary-loading">
        <div className="text-center">
          <div className="relative">
            <div className="legendary-loading-spinner" />
          </div>
          <p className="text-white/60 text-mono-small mt-8 uppercase tracking-widest animate-pulse">
            The Archive Awakens...
          </p>
        </div>
      </div>
    );
  }

  const renderProfileSelect = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-4xl w-full p-8">
        <h3 className="text-god-tier text-3xl mb-8 text-center">SELECT MEMORY PROFILE</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.map((profile, i) => (
            <button
              key={i}
              onClick={() => {
                switchProfile(i);
                navigate('/campaign-map');
              }}
              className={`group relative p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                i === activeProfileIndex ? 'border-legendary-gold bg-legendary-gold/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="text-xs font-mono mb-2 opacity-50 uppercase">Slot 0{i + 1}</div>
              <div className="text-2xl font-black mb-4 group-hover:text-legendary-cyan">
                {profile.totalScore > 0 ? `LEVEL ${Math.floor(profile.totalScore / 1000) + 1}` : 'EMPTY ECHO'}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Nodes: {profile.campaignCompletedNodes.length} / 54
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-legendary-gold opacity-0 group-hover:opacity-100 transition-opacity">
                LOAD MEMORY →
              </div>
            </button>
          ))}
        </div>
        <button 
          onClick={() => setShowProfileSelect(false)}
          className="mt-12 block mx-auto text-xs uppercase tracking-[0.4em] opacity-50 hover:opacity-100 transition-opacity"
        >
          [ ESCAPE TO MENU ]
        </button>
      </div>
    </div>
  );


  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050508]">
      {showProfileSelect && renderProfileSelect()}
      
      {/* Background Canvas - Split Cosmic Battlefield */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Memory Shards Overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {memoryShards.map(shard => (
          <div
            key={shard.id}
            className="absolute memory-shard"
            style={{
              left: `${shard.x}%`,
              top: `${shard.y}%`,
              width: `${shard.size}px`,
              height: `${shard.size}px`,
              background: `radial-gradient(circle, ${shard.color} 0%, transparent 70%)`,
              boxShadow: `0 0 ${shard.size * 2}px ${shard.color}`,
              animationDelay: `${shard.delay}s`,
              transform: `rotate(${shard.delay * 45}deg)`,
            }}
          />
        ))}
      </div>

      {/* Nebula Effect */}
      <div className="nebula-effect" style={{ zIndex: 2 }} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full p-6 lg:p-8">
        
        {/* Logo - Top Center with Legendary Effects */}
        <div className="mt-12 lg:mt-20 text-center">
          <h1 
            className="text-god-tier text-5xl lg:text-7xl mb-2"
            style={{
              filter: `drop-shadow(0 0 ${20 + Math.sin(titleGlow) * 10}px rgba(255, 215, 0, 0.6))`,
            }}
          >
            LEGENDS OF KAI-JAX
          </h1>
          <h2 className="text-transformation text-2xl lg:text-4xl text-white mb-4">
            THE MEMORY WARRIOR
          </h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-0.5 w-12 lg:w-24 bg-gradient-to-r from-transparent via-legendary-gold to-transparent" />
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-legendary-purple animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-legendary-cyan animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-legendary-gold animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="text-mono-small text-legendary-gold uppercase tracking-[0.3em] text-xs lg:text-sm">
              GODS WILL TREMBLE
            </p>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-legendary-gold animate-pulse" style={{ animationDelay: '0.4s' }} />
              <span className="w-2 h-2 rounded-full bg-legendary-cyan animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-legendary-purple animate-pulse" />
            </div>
            <div className="h-0.5 w-12 lg:w-24 bg-gradient-to-r from-transparent via-legendary-gold to-transparent" />
          </div>
        </div>

        {/* Menu Items - Center Vertical */}
        <div className="flex flex-col gap-2 lg:gap-3 mb-24 lg:mb-32 w-full max-w-md">
          {menuItems.map((item, index) => {
            const isSelected = index === selectedIndex;

            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && item.action()}
                onMouseEnter={() => !item.disabled && setSelectedIndex(index)}
                disabled={item.disabled}
                className={`
                  relative px-6 lg:px-8 py-3 lg:py-4 text-left w-full
                  transition-all duration-200 group
                  ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={{
                  background: isSelected
                    ? item.legendary 
                      ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.15), rgba(0, 217, 255, 0.1))'
                      : 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(10, 10, 15, 0.6)',
                  border: isSelected
                    ? item.legendary
                      ? '2px solid rgba(255, 215, 0, 0.8)'
                      : '2px solid rgba(0, 217, 255, 0.6)'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  boxShadow: isSelected
                    ? item.legendary
                      ? '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.05)'
                      : '0 0 20px rgba(0, 217, 255, 0.2)'
                    : 'none',
                  transform: isSelected ? 'translateX(8px)' : 'translateX(0)',
                }}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r"
                    style={{
                      background: item.legendary 
                        ? 'linear-gradient(180deg, #ffd700, #00d9ff)'
                        : '#00d9ff',
                      boxShadow: item.legendary
                        ? '0 0 10px rgba(255, 215, 0, 0.8)'
                        : '0 0 10px rgba(0, 217, 255, 0.8)',
                    }}
                  />
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <span 
                      className={`text-base lg:text-lg font-bold uppercase tracking-wider ${
                        item.legendary && isSelected ? 'text-legendary-gold' : 'text-white'
                      }`}
                      style={{
                        textShadow: item.legendary && isSelected
                          ? '0 0 10px rgba(255, 215, 0, 0.5)'
                          : 'none',
                      }}
                    >
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <p className="text-xs text-neutral-500 mt-0.5 tracking-wide">
                        {item.sublabel}
                      </p>
                    )}
                  </div>
                  
                  {isSelected && (
                    <div 
                      className="text-xl lg:text-2xl"
                      style={{
                        color: item.legendary ? '#ffd700' : '#00d9ff',
                      }}
                    >
                      →
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mb-6 lg:mb-8 text-center">
          <p className="text-mono-small text-neutral-600 uppercase tracking-[0.2em] text-xs">
            FORGED IN THE BRONX • MASTERED IN THE SILENCE
          </p>
          <p className="text-neutral-700 text-xs mt-2">
            v2.0.0 — THE ULTIMATE FORM
          </p>
        </div>
      </div>

      {/* Grit Filter Overlay */}
      <div className="grit-filter" style={{ zIndex: 50 }} />

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 z-40">
        <div className="bg-neutral-900/50 backdrop-blur-sm rounded px-3 py-1.5 border border-white/10">
          <p className="text-neutral-500 text-xs">
            ↑↓ Navigate • Enter Select
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegendaryMainMenu;
