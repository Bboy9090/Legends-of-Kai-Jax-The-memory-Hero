/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * VISUAL EFFECTS - Particles, glows, and animations
 */

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

interface VisualEffectsProps {
  particleCount?: number;
  colors?: string[];
  intensity?: 'low' | 'medium' | 'high';
}

export default function VisualEffects({
  particleCount = 50,
  colors = ['#88d0ff', '#ff6b6b', '#ffd700', '#a855f7', '#00ff88'],
  intensity = 'medium',
}: VisualEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const intensityMultiplier = intensity === 'low' ? 0.5 : intensity === 'medium' ? 1 : 1.5;
    const count = Math.floor(particleCount * intensityMultiplier);

    // Initialize particles
    const initialParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      color: colors[i % colors.length],
      opacity: 0.3 + Math.random() * 0.4,
    }));

    setParticles(initialParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: (p.x + p.speedX + 100) % 100,
          y: (p.y + p.speedY + 100) % 100,
          opacity: 0.3 + Math.sin(Date.now() * 0.001 + p.id) * 0.2,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, [particleCount, colors, intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, ${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}, transparent)`,
            filter: 'blur(1px)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

// Glow effect component
export function GlowEffect({ color = '#88d0ff', intensity = 0.5, size = 200 }: { color?: string; intensity?: number; size?: number }) {
  return (
    <div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}, transparent)`,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

// Energy wave effect
export function EnergyWave({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        animation: `energyWave 3s infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transform -skew-x-12" />
      <style>{`
        @keyframes energyWave {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
