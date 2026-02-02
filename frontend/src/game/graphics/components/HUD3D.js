/**
 * 3D HUD Overlay Component
 * Health bars, meters, and combat info rendered in screen space
 */

import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import useGraphicsStore from '../stores/graphicsStore';

// Health Bar Component
const HealthBar = ({
  current,
  max,
  label,
  color = '#30D158',
  position = 'left',
  showValue = true,
}) => {
  const percent = Math.max(0, current / max);
  const barColor = percent > 0.5 ? color : percent > 0.25 ? '#FFD60A' : '#FF3B30';
  
  return (
    <div className={`flex flex-col ${position === 'right' ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-heading text-sm text-white/80 uppercase tracking-wider">
          {label}
        </span>
        {showValue && (
          <span className="font-mono text-xs text-white/60">
            {Math.ceil(current)}/{max}
          </span>
        )}
      </div>
      <div className="w-64 h-5 bg-black/60 backdrop-blur rounded overflow-hidden border border-white/10">
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{
            width: `${percent * 100}%`,
            background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
            boxShadow: `0 0 20px ${barColor}66`,
          }}
        />
      </div>
    </div>
  );
};

// Meter Component (for tail energy, etc.)
const MeterBar = ({
  current,
  max,
  label,
  color = '#2E2EFE',
  segments = 5,
}) => {
  const percent = current / max;
  
  return (
    <div className="flex flex-col">
      <span className="font-tech text-xs text-white/60 mb-1">{label}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => {
          const segmentPercent = (i + 1) / segments;
          const filled = percent >= segmentPercent;
          const partial = percent > (i / segments) && percent < segmentPercent;
          
          return (
            <div
              key={i}
              className="w-8 h-2 rounded-sm border border-white/20"
              style={{
                background: filled
                  ? color
                  : partial
                  ? `linear-gradient(90deg, ${color} ${((percent - i / segments) * segments) * 100}%, transparent 0%)`
                  : 'rgba(0,0,0,0.3)',
                boxShadow: filled ? `0 0 10px ${color}66` : 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// Active Tail Indicator
const TailIndicator = ({ tailName, tailColor, element, cooldown = 0, maxCooldown = 60 }) => {
  const ready = cooldown <= 0;
  
  return (
    <div className="flex items-center gap-3 bg-black/60 backdrop-blur rounded-lg px-4 py-2 border border-white/10">
      <div
        className="w-4 h-4 rounded-full"
        style={{
          backgroundColor: tailColor,
          boxShadow: ready ? `0 0 15px ${tailColor}` : 'none',
          opacity: ready ? 1 : 0.4,
        }}
      />
      <div className="flex flex-col">
        <span className="font-heading text-sm" style={{ color: tailColor }}>
          {tailName}
        </span>
        <span className="font-tech text-xs text-white/40">
          {ready ? element : `${Math.ceil(cooldown / 60 * 100)}%`}
        </span>
      </div>
    </div>
  );
};

// Combo Counter
const ComboCounter = ({ count }) => {
  if (count <= 1) return null;
  
  return (
    <div className="text-center animate-pulse">
      <div
        className="font-heading text-6xl"
        style={{
          color: '#FFD60A',
          textShadow: '0 0 30px #FFD60A66',
        }}
      >
        {count}
      </div>
      <div className="font-tech text-sm text-white/60 tracking-widest">COMBO</div>
    </div>
  );
};

// Memory Meters (Synergy/Resonance/Dread)
const MemoryMeters = ({ synergy = 0, resonance = 0, dread = 0 }) => {
  const meters = [
    { name: 'SYN', value: synergy, color: '#30D158' },
    { name: 'RES', value: resonance, color: '#64D2FF' },
    { name: 'DRD', value: dread, color: '#BF5AF2' },
  ];
  
  return (
    <div className="flex flex-col gap-2">
      {meters.map(meter => (
        <div key={meter.name} className="flex items-center gap-2">
          <span className="font-mono text-xs text-white/40 w-8">{meter.name}</span>
          <div className="w-24 h-2 bg-black/40 rounded overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${Math.min(100, meter.value)}%`,
                backgroundColor: meter.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Main HUD Component
const HUD3D = ({
  player,
  enemy,
  activeTail,
  tailMeter,
  comboCount,
  memoryMeters,
}) => {
  const preset = useGraphicsStore(s => s.preset);
  const palette = useGraphicsStore(s => s.palette);
  
  // Tail data mapping
  const tailData = useMemo(() => ({
    ember: { name: 'Ember Tail', element: 'Fire', color: '#FF3B30' },
    gale: { name: 'Gale Tail', element: 'Wind', color: '#64D2FF' },
    shade: { name: 'Shade Tail', element: 'Shadow', color: '#BF5AF2' },
    volt: { name: 'Volt Tail', element: 'Lightning', color: '#FFD60A' },
    stone: { name: 'Stone Tail', element: 'Earth', color: '#8B8B8B' },
    tide: { name: 'Tide Tail', element: 'Water', color: '#007AFF' },
    thorn: { name: 'Thorn Tail', element: 'Nature', color: '#30D158' },
    prism: { name: 'Prism Tail', element: 'Light', color: '#FFFFFF' },
    void: { name: 'Void Tail', element: 'Memory', color: '#2E2EFE' },
  }), []);
  
  const currentTail = tailData[activeTail] || tailData.ember;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Bar - Health */}
      <div className="absolute top-4 left-0 right-0 px-8 flex justify-between items-start">
        {/* Player Health */}
        <HealthBar
          current={player?.health || 100}
          max={player?.maxHealth || 100}
          label="KAI-JAX"
          color={palette.playerPrimary}
          position="left"
        />
        
        {/* Combo Counter */}
        <ComboCounter count={comboCount} />
        
        {/* Enemy Health */}
        <HealthBar
          current={enemy?.health || 80}
          max={enemy?.maxHealth || 80}
          label={enemy?.name || 'ENEMY'}
          color={palette.enemyPrimary}
          position="right"
        />
      </div>
      
      {/* Bottom Left - Tail & Meters */}
      <div className="absolute bottom-4 left-8 flex flex-col gap-3">
        <TailIndicator
          tailName={currentTail.name}
          tailColor={currentTail.color}
          element={currentTail.element}
          cooldown={player?.tailCooldown || 0}
        />
        
        <MeterBar
          current={tailMeter}
          max={100}
          label="TAIL ENERGY"
          color={currentTail.color}
        />
        
        <MemoryMeters {...memoryMeters} />
      </div>
      
      {/* Bottom Right - Controls hint */}
      <div className="absolute bottom-4 right-8 bg-black/40 backdrop-blur rounded px-3 py-2">
        <div className="font-mono text-xs text-white/40">
          <div>J/K - Attack</div>
          <div>L - Tail</div>
          <div>Q/R - Switch</div>
          <div>F3 - Perf</div>
        </div>
      </div>
    </div>
  );
};

export default HUD3D;
export { HealthBar, MeterBar, TailIndicator, ComboCounter, MemoryMeters };
