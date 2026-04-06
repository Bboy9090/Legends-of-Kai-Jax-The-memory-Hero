/**
 * OMEGA PROTOCOL: TRINITY METER HUD
 * 
 * Visual display of the three-fold combat resource system:
 * - SYNERGY (Gold): Offensive momentum - pulses and expands with combos
 * - RESONANCE (Cyan): Defensive mastery - shimmers and clarifies on parries
 * - DREAD (Red): Match tension - warps and distorts at high values
 * 
 * "Trinity meters now pulse and distort under pressure."
 * "Dread meter subtly warps UI edges—players feel danger before reading numbers."
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TrinityMeterHUDProps {
  synergy: number;      // 0-100
  resonance: number;    // 0-100
  dread: number;        // 0-100
  playerName?: string;
  side: 'left' | 'right';
  showNarrativeLog?: boolean;
  narrativeLog?: string[];
  compact?: boolean;
}

export default function TrinityMeterHUD({
  synergy,
  resonance,
  dread,
  playerName = 'Player',
  side,
  showNarrativeLog = false,
  narrativeLog = [],
  compact = false,
}: TrinityMeterHUDProps) {
  const containerStyle = useMemo(() => ({
    position: 'absolute' as const,
    [side]: compact ? '8px' : '16px',
    top: compact ? '8px' : '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: compact ? '4px' : '8px',
    pointerEvents: 'none' as const,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    zIndex: 100,
    transform: side === 'right' ? 'scaleX(-1)' : undefined,
  }), [side, compact]);

  const innerStyle = useMemo(() => ({
    transform: side === 'right' ? 'scaleX(-1)' : undefined,
  }), [side]);

  // Calculate dread distortion
  const dreadNormalized = dread / 100;
  const distortionAmount = dreadNormalized > 0.8 ? (dreadNormalized - 0.8) * 5 : 0;
  
  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        {/* Player Name */}
        <div style={{
          color: '#FFFFFF',
          fontSize: compact ? '10px' : '12px',
          fontWeight: 600,
          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          marginBottom: compact ? '2px' : '4px',
          letterSpacing: '0.5px',
        }}>
          {playerName.toUpperCase()}
        </div>

        {/* Synergy Meter - Gold */}
        <TrinityBar
          value={synergy}
          maxValue={100}
          label="SYN"
          color="#FFD700"
          glowColor="rgba(255, 215, 0, 0.6)"
          pulseOnHigh={true}
          compact={compact}
        />

        {/* Resonance Meter - Cyan */}
        <TrinityBar
          value={resonance}
          maxValue={100}
          label="RES"
          color="#00CED1"
          glowColor="rgba(0, 206, 209, 0.6)"
          shimmerOnHigh={true}
          compact={compact}
        />

        {/* Dread Meter - Red with distortion */}
        <TrinityBar
          value={dread}
          maxValue={100}
          label="DRD"
          color="#DC143C"
          glowColor="rgba(220, 20, 60, 0.6)"
          distortion={distortionAmount}
          pulseSpeed={2 + dreadNormalized * 3}
          compact={compact}
          warningThreshold={80}
        />

        {/* Critical Dread Warning */}
        {dread >= 80 && (
          <div style={{
            color: '#FF0000',
            fontSize: '10px',
            fontWeight: 700,
            textAlign: 'center',
            animation: 'pulse 0.5s ease-in-out infinite',
            textShadow: '0 0 10px rgba(255,0,0,0.8)',
            marginTop: '4px',
          }}>
            ⚠ CRITICAL DREAD
          </div>
        )}

        {/* Narrative Log */}
        {showNarrativeLog && narrativeLog.length > 0 && (
          <div style={{
            marginTop: compact ? '8px' : '16px',
            padding: '8px',
            background: 'rgba(0,0,0,0.6)',
            borderRadius: '4px',
            maxWidth: '200px',
          }}>
            {narrativeLog.slice(-3).map((log, index) => (
              <div
                key={index}
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '10px',
                  fontStyle: 'italic',
                  marginBottom: '4px',
                  opacity: 1 - (index * 0.2),
                }}
              >
                "{log}"
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes distort {
          0%, 100% { transform: skewX(0deg) translateX(0); }
          25% { transform: skewX(2deg) translateX(1px); }
          75% { transform: skewX(-2deg) translateX(-1px); }
        }
      `}</style>
    </div>
  );
}

interface TrinityBarProps {
  value: number;
  maxValue: number;
  label: string;
  color: string;
  glowColor: string;
  pulseOnHigh?: boolean;
  shimmerOnHigh?: boolean;
  distortion?: number;
  pulseSpeed?: number;
  compact?: boolean;
  warningThreshold?: number;
}

function TrinityBar({
  value,
  maxValue,
  label,
  color,
  glowColor,
  pulseOnHigh = false,
  shimmerOnHigh = false,
  distortion = 0,
  pulseSpeed = 1,
  compact = false,
  warningThreshold = 100,
}: TrinityBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const isHigh = value >= 60;
  const isWarning = value >= warningThreshold;
  
  const barWidth = compact ? 100 : 140;
  const barHeight = compact ? 8 : 12;
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: compact ? '4px' : '8px',
    animation: distortion > 0 ? `distort ${0.1 / distortion}s ease-in-out infinite` : undefined,
  };
  
  const labelStyle: React.CSSProperties = {
    color: color,
    fontSize: compact ? '8px' : '10px',
    fontWeight: 700,
    width: compact ? '24px' : '30px',
    textShadow: `0 0 6px ${glowColor}`,
  };
  
  const barContainerStyle: React.CSSProperties = {
    width: `${barWidth}px`,
    height: `${barHeight}px`,
    background: 'rgba(0,0,0,0.6)',
    borderRadius: `${barHeight / 2}px`,
    overflow: 'hidden',
    border: `1px solid ${isWarning ? color : 'rgba(255,255,255,0.2)'}`,
    boxShadow: isHigh ? `0 0 10px ${glowColor}` : 'none',
    transition: 'box-shadow 0.3s ease',
  };
  
  const fillStyle: React.CSSProperties = {
    width: `${percentage}%`,
    height: '100%',
    background: shimmerOnHigh && isHigh
      ? `linear-gradient(90deg, ${color}, ${lightenColor(color, 40)}, ${color})`
      : color,
    backgroundSize: shimmerOnHigh && isHigh ? '200% 100%' : undefined,
    animation: pulseOnHigh && isHigh
      ? `pulse ${1 / pulseSpeed}s ease-in-out infinite`
      : shimmerOnHigh && isHigh
        ? 'shimmer 2s linear infinite'
        : undefined,
    transition: 'width 0.15s ease-out',
    boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)`,
  };
  
  const valueStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.9)',
    fontSize: compact ? '8px' : '10px',
    fontWeight: 600,
    width: compact ? '24px' : '32px',
    textAlign: 'right' as const,
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  };
  
  return (
    <div style={containerStyle}>
      <span style={labelStyle}>{label}</span>
      <div style={barContainerStyle}>
        <div style={fillStyle} />
      </div>
      <span style={valueStyle}>{Math.round(value)}</span>
    </div>
  );
}

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

/**
 * 3D version for in-world display
 */
export function TrinityMeter3D({
  synergy,
  resonance,
  dread,
  position = [0, 2, 0],
}: {
  synergy: number;
  resonance: number;
  dread: number;
  position?: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Always face camera
      groupRef.current.quaternion.copy(state.camera.quaternion);
      
      // Subtle bob
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });
  
  const synergyColor = new THREE.Color('#FFD700');
  const resonanceColor = new THREE.Color('#00CED1');
  const dreadColor = new THREE.Color('#DC143C');
  
  const barWidth = 0.8;
  const barHeight = 0.06;
  const spacing = 0.1;
  
  return (
    <group ref={groupRef} position={position}>
      {/* Synergy Bar */}
      <MeterBar3D
        value={synergy}
        color={synergyColor}
        position={[0, spacing, 0]}
        width={barWidth}
        height={barHeight}
      />
      
      {/* Resonance Bar */}
      <MeterBar3D
        value={resonance}
        color={resonanceColor}
        position={[0, 0, 0]}
        width={barWidth}
        height={barHeight}
      />
      
      {/* Dread Bar */}
      <MeterBar3D
        value={dread}
        color={dreadColor}
        position={[0, -spacing, 0]}
        width={barWidth}
        height={barHeight}
      />
    </group>
  );
}

function MeterBar3D({
  value,
  color,
  position,
  width,
  height,
}: {
  value: number;
  color: THREE.Color;
  position: [number, number, number];
  width: number;
  height: number;
}) {
  const fillWidth = (value / 100) * width;
  
  return (
    <group position={position}>
      {/* Background */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} />
      </mesh>
      
      {/* Fill */}
      <mesh position={[-(width - fillWidth) / 2, 0, 0.001]}>
        <planeGeometry args={[fillWidth, height * 0.8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Glow */}
      {value > 50 && (
        <mesh position={[-(width - fillWidth) / 2, 0, -0.001]}>
          <planeGeometry args={[fillWidth + 0.02, height + 0.02]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

export { TrinityMeterHUD };
