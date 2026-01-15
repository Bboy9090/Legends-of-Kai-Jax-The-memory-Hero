import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/design-system.css';
import '../../styles/bronx_grit.css';

/**
 * LEGENDS OF KAI-JAX: THE MEMORY WARRIOR - LEGENDARY MAIN MENU
 * Phase 1 Implementation - Based on Design Bible
 * 
 * Features:
 * - Split cosmic battlefield background (Kaison left, Jaxon right, Kai-Jax center)
 * - Memory shards and echo trails animations
 * - Prismatic energy effects
 * - Beast Form Style UI
 * - Matte-Mythic aesthetic
 */

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
}

const LegendaryMainMenu: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [memoryShards, setMemoryShards] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
  }>>([]);

  // Check for save file
  const hasSaveFile = localStorage.getItem('AETERNA_SLOT_1') !== null;

  // Menu items
  const menuItems: MenuItem[] = [
    {
      id: 'continue',
      label: 'Continue',
      action: () => {
        // Load game logic
        navigate('/game');
      },
      disabled: !hasSaveFile
    },
    {
      id: 'new-game',
      label: 'New Game',
      action: () => {
        navigate('/character-select');
      }
    },
    {
      id: 'load',
      label: 'Load Game',
      action: () => {
        // Load menu logic
        navigate('/load');
      }
    },
    {
      id: 'settings',
      label: 'Settings',
      action: () => {
        navigate('/settings');
      }
    },
    {
      id: 'extras',
      label: 'Extras',
      action: () => {
        navigate('/extras');
      }
    },
    {
      id: 'codex',
      label: 'Codex / Legend Mode',
      action: () => {
        navigate('/codex');
      }
    },
    {
      id: 'quit',
      label: 'Quit',
      action: () => {
        // Quit logic
        if (confirm('Exit game?')) {
          window.close();
        }
      }
    }
  ];

  // Initialize memory shards
  useEffect(() => {
    const colors = ['#7C3AED', '#2563EB', '#FF8C00', '#10B981']; // Prismatic colors
    const shards = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)] || '#7C3AED', // Fallback to purple
      delay: Math.random() * 4
    }));
    setMemoryShards(shards);
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
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Split cosmic background - Left (cool tones - Kaison)
      const leftGradient = ctx.createLinearGradient(0, 0, canvas.width / 2, canvas.height);
      leftGradient.addColorStop(0, 'rgba(37, 99, 235, 0.1)');   // Blue
      leftGradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.1)'); // Purple
      leftGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)'); // White
      ctx.fillStyle = leftGradient;
      ctx.fillRect(0, 0, canvas.width / 2, canvas.height);

      // Split cosmic background - Right (warm tones - Jaxon)
      const rightGradient = ctx.createLinearGradient(canvas.width / 2, 0, canvas.width, canvas.height);
      rightGradient.addColorStop(0, 'rgba(255, 69, 0, 0.1)');   // Orange
      rightGradient.addColorStop(0.5, 'rgba(220, 38, 38, 0.1)'); // Red
      rightGradient.addColorStop(1, 'rgba(255, 215, 0, 0.05)'); // Yellow
      ctx.fillStyle = rightGradient;
      ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);

      // Center prismatic energy (Kai-Jax fusion)
      const centerGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 200
      );
      centerGradient.addColorStop(0, 'rgba(255, 215, 0, 0.2)'); // Golden yellow
      centerGradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.1)'); // Purple
      centerGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Echo trails (memory fragments)
      for (let i = 0; i < 5; i++) {
        const x = canvas.width / 2 + Math.sin(time * 0.001 + i) * 100;
        const y = canvas.height / 2 + Math.cos(time * 0.001 + i) * 100;
        const size = 20 + Math.sin(time * 0.002 + i) * 10;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${0.1 * Math.sin(time * 0.003 + i)})`;
        ctx.fill();
      }

      time += 16; // ~60fps
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

  // Keyboard navigation (controller-friendly)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(menuItems.length - 1, prev + 1));
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
  }, [selectedIndex]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0A0A]">
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
            className="absolute rounded-full animate-memory-shard"
            style={{
              left: `${shard.x}%`,
              top: `${shard.y}%`,
              width: `${shard.size}px`,
              height: `${shard.size}px`,
              background: `radial-gradient(circle, ${shard.color} 0%, transparent 70%)`,
              boxShadow: `0 0 ${shard.size * 2}px ${shard.color}`,
              animationDelay: `${shard.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full p-8">
        
        {/* Logo - Top Center */}
        <div className="mt-20 text-center">
          <h1 className="text-display-h1 text-glow-accent mb-2">
            LEGENDS OF KAI-JAX
          </h1>
          <h2 className="text-display-h3 text-glow-primary">
            THE MEMORY WARRIOR
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent" />
            <p className="text-ui-caption text-[#FFD700] uppercase tracking-widest">
              THE ULTIMATE FUSION • GODS WILL TREMBLE
            </p>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent" />
          </div>
        </div>

        {/* Menu Items - Center Vertical */}
        <div className="flex flex-col gap-4 mb-32">
          {menuItems.map((item, index) => {
            const isSelected = index === selectedIndex;
            const isQuit = item.id === 'quit';

            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && item.action()}
                disabled={item.disabled}
                className={`
                  relative px-12 py-4 text-left
                  ${isQuit ? 'btn-ghost text-sm' : 'btn-primary'}
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  transition-all duration-200
                `}
                style={{
                  background: isSelected && !isQuit
                    ? 'rgba(255, 69, 0, 0.2)'
                    : isQuit
                    ? 'transparent'
                    : 'rgba(26, 26, 26, 0.8)',
                  border: isSelected
                    ? '2px solid #FFD700'
                    : isQuit
                    ? '2px solid rgba(255, 255, 255, 0.3)'
                    : '2px solid rgba(255, 69, 0, 0.5)',
                  borderRadius: '8px',
                  boxShadow: isSelected ? '0 0 16px rgba(255, 215, 0, 0.5)' : 'none',
                }}
              >
                <span className="text-ui-button text-white uppercase tracking-wider">
                  {item.label}
                </span>
                {item.disabled && (
                  <span className="ml-4 text-ui-caption text-[#666666]">
                    (No Save File)
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mb-8 text-center">
          <p className="text-ui-caption text-[#999999] uppercase tracking-wider">
            FORGED IN THE BRONX • MASTERED IN THE SILENCE
          </p>
        </div>
      </div>

      {/* Grit Filter Overlay */}
      <div className="grit-filter" style={{ zIndex: 5 }} />
    </div>
  );
};

export default LegendaryMainMenu;
