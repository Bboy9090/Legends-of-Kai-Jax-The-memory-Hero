import React from 'react';
import '../../styles/design-system.css';

interface LegendaryHUDBarProps {
  value: number; // 0-100
  max?: number; // Default 100
  type?: 'health' | 'stamina' | 'memory' | 'fusion' | 'resonance';
  label?: string;
  showLabel?: boolean;
  className?: string;
}

/**
 * LEGENDARY HUD BAR COMPONENT
 * Based on Design Bible - Tactical HUD elements
 */
export const LegendaryHUDBar: React.FC<LegendaryHUDBarProps> = ({
  value,
  max = 100,
  type = 'health',
  label,
  showLabel = true,
  className = ''
}) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  
  const typeClasses = {
    health: 'hud-bar-health',
    stamina: 'hud-bar-stamina',
    memory: 'hud-bar-memory',
    fusion: 'hud-bar-fusion',
    resonance: 'hud-bar-resonance'
  };

  const defaultLabels = {
    health: 'HP',
    stamina: 'Stamina',
    memory: 'Memory',
    fusion: 'Fusion',
    resonance: 'Resonance'
  };

  const displayLabel = label || defaultLabels[type] || '';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-ui-hud text-[#CCCCCC]">
          <span>{displayLabel}</span>
          <span className="text-[#FFD700] font-bold">{Math.round(value)}/{max}</span>
        </div>
      )}
      <div className="hud-bar">
        <div
          className={`hud-bar-fill ${typeClasses[type]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default LegendaryHUDBar;
