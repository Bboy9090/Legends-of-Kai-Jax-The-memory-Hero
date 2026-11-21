import { AlertTriangle } from 'lucide-react';
import { activeBossPhase, phaseNumber } from '../../lib/combatIntel';
import type { BossEncounter } from '../../lib/bossEncounters';

/** Phase banner driven by a boss's real health. Shared by the versus HUD and the adventure HUD. */
export default function BossPhaseBanner({ boss, healthPct, className = '' }: { boss: BossEncounter; healthPct: number; className?: string }) {
  const phase = activeBossPhase(boss, healthPct);
  if (!phase) return null;
  return (
    <div className={className} data-testid="combat-intel-boss" role="status" aria-live="polite">
      <div className="kj-vision-hud flex items-start gap-2 px-3 py-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.12em] text-amber-200/90">
            {boss.displayName} · Phase {phaseNumber(boss, phase)}/{boss.phases.length}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-200 leading-snug">{phase.description}</div>
        </div>
      </div>
    </div>
  );
}
