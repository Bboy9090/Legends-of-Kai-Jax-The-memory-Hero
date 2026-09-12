import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../../styles/bronx_grit.css';
import '../../styles/legendary-effects.css';
import { useRunner } from '../../lib/stores/useRunner';

interface MenuItem {
  id: string;
  label: string;
  sublabel?: string;
  action: () => void;
  disabled?: boolean;
  legendary?: boolean;
}

type ShardType = 'memory' | 'ember' | 'storm';

interface MemoryShard {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  type: ShardType;
}

const SHARD_COLORS: Record<ShardType, string[]> = {
  memory: ['#a855f7', '#c084fc', '#e9d5ff'],
  ember: ['#f97316', '#fb923c', '#fbbf24'],
  storm: ['#06b6d4', '#38bdf8', '#7dd3fc'],
};

/**
 * Canon-facing main menu.
 *
 * Visual language centers Kai (memory/web + ember), Jax (storm + displacement),
 * and the three-tail base convergence without presenting Kai-Jax as an
 * immediately available permanent form or inventing a separate lineage.
 */
const LegendaryMainMenu: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [memoryShards, setMemoryShards] = useState<MemoryShard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [titleGlow, setTitleGlow] = useState(0);
  const [showProfileSelect, setShowProfileSelect] = useState(false);

  const profiles = useRunner((s) => s.profiles);
  const activeProfileIndex = useRunner((s) => s.activeProfileIndex);
  const switchProfile = useRunner((s) => s.switchProfile);
  const setGameState = useRunner((s) => s.setGameState);
  const setTrainingSession = useRunner((s) => s.setTrainingSession);

  const menuItems = useMemo<MenuItem[]>(() => [
    {
      id: 'continue',
      label: 'CONTINUE',
      sublabel: 'Resume the Raging City story hub',
      action: () => setGameState('story-hub'),
      legendary: true,
    },
    {
      id: 'story',
      label: 'STORY HUB',
      sublabel: 'Raging City field map and chronology-safe missions',
      action: () => setGameState('story-hub'),
    },
    {
      id: 'missions',
      label: 'FIELD BRIEFINGS',
      sublabel: 'Open the active Phase C mission briefing',
      action: () => setGameState('mission-select'),
    },
    {
      id: 'training',
      label: 'TRAINING ARENA',
      sublabel: 'Practice movement, traversal, defense, and combat',
      action: () => {
        setTrainingSession(true);
        setGameState('adventure');
      },
    },
    {
      id: 'versus',
      label: 'COMBAT ARENA',
      sublabel: 'Chronology-safe 1v1 Archive battles',
      action: () => setGameState('versus-select'),
    },
    {
      id: 'codex',
      label: 'LEGENDS ARCHIVE',
      sublabel: 'Heroes, ancestors, factions, and world canon',
      action: () => setGameState('lore-hub'),
    },
    {
      id: 'customize',
      label: 'CUSTOMIZE',
      sublabel: 'Approved character outfits and variants',
      action: () => setGameState('customization'),
    },
    {
      id: 'abilities',
      label: 'LINEAGE & ABILITIES',
      sublabel: 'Review baseline powers and story-gated progression',
      action: () => setGameState('abilities'),
    },
    {
      id: 'options',
      label: 'OPTIONS',
      sublabel: 'Audio, video, accessibility, and controls',
      action: () => setGameState('settings'),
    },
    {
      id: 'credits',
      label: 'CREDITS',
      sublabel: 'Project credits',
      action: () => setGameState('title'),
    },
    {
      id: 'quit',
      label: 'TITLE SCREEN',
      sublabel: 'Return to the title screen',
      action: () => setGameState('title'),
    },
  ], [setGameState, setTrainingSession]);

  useEffect(() => {
    const shardTypes: ShardType[] = ['memory', 'ember', 'storm'];
    setMemoryShards(Array.from({ length: 30 }, (_, i) => {
      const type = shardTypes[i % shardTypes.length];
      const colors = SHARD_COLORS[type];
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 12 + 4,
        color: colors[Math.floor(Math.random() * colors.length)] || '#ffffff',
        delay: Math.random() * 5,
        type,
      };
    }));

    const timer = window.setTimeout(() => setIsLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setTitleGlow((prev) => (prev + 0.02) % (Math.PI * 2));
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      const { width, height } = canvas;
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, width, height);

      // Kai: memory-web and ember pressure on the left.
      const kaiGradient = ctx.createLinearGradient(0, 0, width / 2, height);
      kaiGradient.addColorStop(0, 'rgba(168, 85, 247, 0.10)');
      kaiGradient.addColorStop(0.55, 'rgba(249, 115, 22, 0.07)');
      kaiGradient.addColorStop(1, 'rgba(251, 191, 36, 0.03)');
      ctx.fillStyle = kaiGradient;
      ctx.fillRect(0, 0, width / 2, height);

      ctx.strokeStyle = 'rgba(216, 180, 254, 0.055)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i += 1) {
        const x = width * 0.18 + Math.sin(time * 0.0005 + i) * 45;
        const y = height * 0.5 + Math.cos(time * 0.0007 + i) * 90;
        ctx.beginPath();
        ctx.arc(x, y, 90 + i * 28, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Jax: storm and displacement pressure on the right.
      const jaxGradient = ctx.createLinearGradient(width / 2, 0, width, height);
      jaxGradient.addColorStop(0, 'rgba(56, 189, 248, 0.06)');
      jaxGradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)');
      jaxGradient.addColorStop(1, 'rgba(30, 64, 175, 0.04)');
      ctx.fillStyle = jaxGradient;
      ctx.fillRect(width / 2, 0, width / 2, height);

      for (let i = 0; i < 8; i += 1) {
        const angle = (time * 0.001 + i * 0.5) % (Math.PI * 2);
        const x = width * 0.82 + Math.cos(angle) * (50 + i * 9);
        const y = height * 0.5 + Math.sin(angle) * (50 + i * 9);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 28);
        glow.addColorStop(0, 'rgba(56, 189, 248, 0.24)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - 28, y - 28, 56, 56);
      }

      // Center: base Kai-Jax convergence, exactly three visual strands.
      const center = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 300);
      center.addColorStop(0, 'rgba(251, 191, 36, 0.14)');
      center.addColorStop(0.35, 'rgba(168, 85, 247, 0.08)');
      center.addColorStop(0.7, 'rgba(56, 189, 248, 0.05)');
      center.addColorStop(1, 'transparent');
      ctx.fillStyle = center;
      ctx.fillRect(0, 0, width, height);

      const strandColors = ['rgba(168,85,247,0.38)', 'rgba(249,115,22,0.34)', 'rgba(56,189,248,0.36)'];
      strandColors.forEach((color, index) => {
        const baseAngle = (index / 3) * Math.PI * 2 + Math.PI / 2;
        for (let seg = 0; seg < 18; seg += 1) {
          const wave = Math.sin(time * 0.002 + seg * 0.3 + index) * 26;
          const angle = baseAngle + wave * 0.01;
          const distance = 75 + seg * 14;
          const x = width / 2 + Math.sin(angle) * distance;
          const y = height / 2 + Math.cos(angle) * distance * 0.7;
          const size = Math.max(3, 14 - seg * 0.5);
          const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
          glow.addColorStop(0, color);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      time += 16;
      animationFrameId = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const activateItem = useCallback((index: number) => {
    const item = menuItems[index];
    if (item && !item.disabled) item.action();
  }, [menuItems]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLoading || showProfileSelect) return;
      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      } else if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % menuItems.length);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateItem(selectedIndex);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activateItem, isLoading, menuItems.length, selectedIndex, showProfileSelect]);

  if (!profiles || profiles.length === 0) {
    return <div className="bg-[#050508] w-full h-screen flex items-center justify-center text-white/30 font-mono">HYDRATING ARCHIVE...</div>;
  }

  if (isLoading) {
    return (
      <div className="legendary-loading">
        <div className="text-center">
          <div className="relative"><div className="legendary-loading-spinner" /></div>
          <p className="text-white/60 text-mono-small mt-8 uppercase tracking-widest animate-pulse">The Archive Awakens...</p>
        </div>
      </div>
    );
  }

  const activeProfile = profiles[activeProfileIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050508]">
      {showProfileSelect && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="max-w-4xl w-full p-8">
            <h3 className="text-god-tier text-3xl mb-8 text-center">SELECT MEMORY PROFILE</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profiles.map((profile, index) => (
                <button
                  key={index}
                  onClick={() => {
                    switchProfile(index);
                    setShowProfileSelect(false);
                    setGameState('story-hub');
                  }}
                  className={`group relative p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                    index === activeProfileIndex ? 'border-legendary-gold bg-legendary-gold/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="text-xs font-mono mb-2 opacity-50 uppercase">Slot 0{index + 1}</div>
                  <div className="text-xl font-black mb-3 group-hover:text-legendary-cyan">
                    COMBAT SCORE {profile.totalScore.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Story records: {profile.completedStoryMissionIds.length}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                    Kai-Jax fusion: {profile.kaiJaxFusionUnlocked ? 'Story unlocked' : 'Story gated'}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowProfileSelect(false)}
              className="mt-12 block mx-auto text-xs uppercase tracking-[0.4em] opacity-50 hover:opacity-100 transition-opacity"
            >
              [ RETURN TO MENU ]
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {memoryShards.map((shard) => (
          <div
            key={shard.id}
            className="absolute memory-shard"
            data-shard-type={shard.type}
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

      <div className="nebula-effect" style={{ zIndex: 2 }} />

      <div className="relative z-10 flex flex-col items-center justify-between h-full p-6 lg:p-8">
        <div className="mt-10 lg:mt-16 text-center">
          <h1
            className="text-god-tier text-5xl lg:text-7xl mb-2"
            style={{ filter: `drop-shadow(0 0 ${20 + Math.sin(titleGlow) * 10}px rgba(255, 215, 0, 0.6))` }}
          >
            LEGENDS OF KAI-JAX
          </h1>
          <h2 className="text-transformation text-2xl lg:text-4xl text-white mb-3">THE MEMORY KING</h2>
          <p className="text-mono-small text-legendary-gold uppercase tracking-[0.3em] text-xs lg:text-sm">
            FORGED IN THE RAGING CITY. CROWNED BY MEMORY.
          </p>

          <div className="mt-4 flex items-center justify-center gap-4 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Profile:</span>
            <button
              onClick={() => setShowProfileSelect(true)}
              className="text-[10px] font-bold text-cyan-400 hover:text-white transition-colors flex items-center gap-2"
            >
              SLOT 0{activeProfileIndex + 1} • SCORE {activeProfile.totalScore.toLocaleString()}
              <span className="text-slate-600">[CHANGE]</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:gap-3 mb-20 lg:mb-24 w-full max-w-md overflow-y-auto max-h-[58vh] pr-1">
          {menuItems.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.id}
                onClick={() => activateItem(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                disabled={item.disabled}
                className={`relative px-6 lg:px-8 py-3 text-left w-full transition-all duration-200 ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  background: isSelected
                    ? item.legendary ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.15), rgba(0, 217, 255, 0.1))' : 'rgba(255,255,255,0.05)'
                    : 'rgba(10,10,15,0.66)',
                  border: isSelected
                    ? item.legendary ? '2px solid rgba(255,215,0,0.8)' : '2px solid rgba(0,217,255,0.6)'
                    : '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  boxShadow: isSelected ? '0 0 24px rgba(0,217,255,0.14)' : 'none',
                  transform: isSelected ? 'translateX(8px)' : 'translateX(0)',
                }}
              >
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r bg-legendary-cyan shadow-[0_0_10px_rgba(0,217,255,0.8)]" />
                )}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-base lg:text-lg font-bold uppercase tracking-wider text-white">{item.label}</span>
                    {item.sublabel && <p className="text-xs mt-0.5 tracking-wide text-slate-300">{item.sublabel}</p>}
                  </div>
                  {isSelected && <div className="text-xl lg:text-2xl text-legendary-cyan">→</div>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mb-5 text-center">
          <p className="text-mono-small text-neutral-500 uppercase tracking-[0.2em] text-xs">
            RAGING CITY • MEMORY • BLOODWARD
          </p>
          <p className="text-neutral-700 text-[10px] mt-3 uppercase tracking-widest">Phase C gameplay build</p>
        </div>
      </div>

      <div className="grit-filter pointer-events-none" style={{ zIndex: 50 }} />
      <div className="absolute bottom-4 right-4 z-40 hidden sm:block">
        <div className="bg-neutral-900/50 backdrop-blur-sm rounded px-3 py-1.5 border border-white/10">
          <p className="text-neutral-500 text-xs">↑↓ Navigate • Enter Select</p>
        </div>
      </div>
    </div>
  );
};

export default LegendaryMainMenu;
