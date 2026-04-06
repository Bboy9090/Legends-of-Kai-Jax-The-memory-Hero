/**
 * OMEGA PROTOCOL: FRAME TIMELINE DEBUG OVERLAY
 * 
 * Visual debug tool showing per-entity combat state:
 * - Current phase (startup/active/recovery/hitstun)
 * - Frames remaining in current state
 * - Cancel flags and i-frames
 * - Hit-stop visualization
 * 
 * "The prototype can no longer lie about how it feels."
 */

import { useMemo } from 'react';

interface EntityData {
  id: string;
  name: string;
  phase: CombatPhase;
  framesRemaining: number;
  totalFrames: number;
  currentMove?: string;
  cancelFlags: CancelFlag[];
  iFrames: number;
  armorFrames: number;
  hitStopActive: boolean;
  hitStopRemaining: number;
  comboCount: number;
  damagePercent: number;
  synergy?: number;
  resonance?: number;
  dread?: number;
}

type CombatPhase = 'idle' | 'startup' | 'active' | 'recovery' | 'hitstun' | 'blockstun' | 'tumble' | 'ledge';

interface CancelFlag {
  type: 'dash' | 'jump' | 'special' | 'dodge' | 'attack' | 'any';
  condition: 'on_hit' | 'on_whiff' | 'always' | 'never';
  enabled: boolean;
}

interface FrameTimelineDebugProps {
  entities: EntityData[];
  enabled?: boolean;
  position?: 'top' | 'bottom';
  showHistory?: boolean;
  historyLength?: number;
}

const PHASE_COLORS: Record<CombatPhase, string> = {
  idle: '#4A90E2',
  startup: '#F5A623',
  active: '#7ED321',
  recovery: '#D0021B',
  hitstun: '#9013FE',
  blockstun: '#50E3C2',
  tumble: '#BD10E0',
  ledge: '#B8E986',
};

const PHASE_LABELS: Record<CombatPhase, string> = {
  idle: 'IDLE',
  startup: 'STARTUP',
  active: 'ACTIVE',
  recovery: 'RECOVERY',
  hitstun: 'HITSTUN',
  blockstun: 'BLOCK',
  tumble: 'TUMBLE',
  ledge: 'LEDGE',
};

export default function FrameTimelineDebug({
  entities,
  enabled = true,
  position = 'top',
  showHistory = true,
  historyLength = 60,
}: FrameTimelineDebugProps) {
  if (!enabled) return null;

  const containerStyle = useMemo(() => ({
    position: 'fixed' as const,
    left: 0,
    right: 0,
    [position]: 0,
    padding: '8px 16px',
    background: 'rgba(0, 0, 0, 0.85)',
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#FFFFFF',
    zIndex: 9999,
    pointerEvents: 'none' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  }), [position]);

  return (
    <div style={containerStyle}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        paddingBottom: '4px',
        marginBottom: '4px',
      }}>
        <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
          FRAME TIMELINE DEBUG
        </span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>
          OMEGA PROTOCOL
        </span>
      </div>

      {entities.map((entity) => (
        <EntityTimeline 
          key={entity.id} 
          entity={entity} 
          showHistory={showHistory}
          historyLength={historyLength}
        />
      ))}
    </div>
  );
}

interface EntityTimelineProps {
  entity: EntityData;
  showHistory: boolean;
  historyLength: number;
}

function EntityTimeline({ entity, showHistory, historyLength }: EntityTimelineProps) {
  const phaseColor = PHASE_COLORS[entity.phase] || '#888888';
  const phaseLabel = PHASE_LABELS[entity.phase] || 'UNKNOWN';
  const progress = entity.totalFrames > 0 
    ? ((entity.totalFrames - entity.framesRemaining) / entity.totalFrames) * 100 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* Entity header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Entity name */}
        <div style={{ 
          width: '80px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {entity.name}
        </div>

        {/* Phase indicator */}
        <div style={{
          width: '70px',
          padding: '2px 6px',
          background: phaseColor,
          color: '#FFFFFF',
          fontWeight: 'bold',
          textAlign: 'center',
          borderRadius: '3px',
          fontSize: '9px',
        }}>
          {phaseLabel}
        </div>

        {/* Frame progress bar */}
        <div style={{
          flex: 1,
          height: '16px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: phaseColor,
            transition: 'width 0.016s linear',
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '9px',
            fontWeight: 'bold',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}>
            {entity.framesRemaining}/{entity.totalFrames}f
            {entity.currentMove && ` [${entity.currentMove}]`}
          </div>
        </div>

        {/* Status indicators */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {/* Hit-stop */}
          {entity.hitStopActive && (
            <StatusBadge 
              label={`HS:${entity.hitStopRemaining}f`}
              color="#FF0000"
              pulse
            />
          )}

          {/* I-frames */}
          {entity.iFrames > 0 && (
            <StatusBadge 
              label={`INV:${entity.iFrames}f`}
              color="#00FFFF"
            />
          )}

          {/* Armor */}
          {entity.armorFrames > 0 && (
            <StatusBadge 
              label={`ARM:${entity.armorFrames}f`}
              color="#FFD700"
            />
          )}

          {/* Combo count */}
          {entity.comboCount > 0 && (
            <StatusBadge 
              label={`${entity.comboCount}x`}
              color="#7ED321"
            />
          )}
        </div>

        {/* Damage percent */}
        <div style={{
          width: '50px',
          textAlign: 'right',
          color: getDamageColor(entity.damagePercent),
          fontWeight: 'bold',
        }}>
          {Math.round(entity.damagePercent)}%
        </div>
      </div>

      {/* Cancel flags */}
      {entity.cancelFlags.length > 0 && (
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          marginLeft: '92px',
          opacity: 0.7,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>
            CANCEL:
          </span>
          {entity.cancelFlags.map((flag, i) => (
            <CancelFlagBadge key={i} flag={flag} />
          ))}
        </div>
      )}

      {/* Trinity meters (compact) */}
      {(entity.synergy !== undefined || entity.resonance !== undefined || entity.dread !== undefined) && (
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginLeft: '92px',
          fontSize: '9px',
        }}>
          {entity.synergy !== undefined && (
            <span style={{ color: '#FFD700' }}>
              SYN:{Math.round(entity.synergy)}
            </span>
          )}
          {entity.resonance !== undefined && (
            <span style={{ color: '#00CED1' }}>
              RES:{Math.round(entity.resonance)}
            </span>
          )}
          {entity.dread !== undefined && (
            <span style={{ color: '#DC143C' }}>
              DRD:{Math.round(entity.dread)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  label: string;
  color: string;
  pulse?: boolean;
}

function StatusBadge({ label, color, pulse }: StatusBadgeProps) {
  return (
    <div style={{
      padding: '1px 4px',
      background: color,
      color: '#000000',
      fontSize: '8px',
      fontWeight: 'bold',
      borderRadius: '2px',
      animation: pulse ? 'badge-pulse 0.3s ease-in-out infinite' : undefined,
    }}>
      {label}
      <style>{`
        @keyframes badge-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

interface CancelFlagBadgeProps {
  flag: CancelFlag;
}

function CancelFlagBadge({ flag }: CancelFlagBadgeProps) {
  const colors: Record<string, string> = {
    on_hit: '#7ED321',
    on_whiff: '#F5A623',
    always: '#4A90E2',
    never: '#888888',
  };

  return (
    <div style={{
      padding: '1px 4px',
      background: flag.enabled ? colors[flag.condition] : 'rgba(255,255,255,0.2)',
      color: flag.enabled ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
      fontSize: '8px',
      fontWeight: 'bold',
      borderRadius: '2px',
      textDecoration: flag.enabled ? 'none' : 'line-through',
    }}>
      {flag.type.toUpperCase()}
    </div>
  );
}

function getDamageColor(damage: number): string {
  if (damage < 50) return '#FFFFFF';
  if (damage < 100) return '#FFFF00';
  if (damage < 150) return '#FF8800';
  return '#FF0000';
}

export { FrameTimelineDebug };
