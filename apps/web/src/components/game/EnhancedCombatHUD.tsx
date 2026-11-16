/**
 * ENHANCED COMBAT HUD ("Combat Intel")
 *
 * Supplemental layer mounted by BattleUI during a fight. It deliberately does NOT draw
 * health, combo, stamina, synergy or overdrive bars — BattleUI owns those — so the screen
 * never shows two copies of the same readout. It adds what BattleUI lacks:
 *   - boss phase banner, driven by the opponent's live health
 *   - the fighter's ability reference strip, with live ultimate readiness
 * All values come from the battle store (or props, for tests/storybook).
 */
import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import BossPhaseBanner from './BossPhaseBanner';
import { useBattle } from '../../lib/stores/useBattle';
import {
  abilitiesFor,
  activeBossPhase,
  resolveBoss,
  ultimateState,
} from '../../lib/combatIntel';
import type { Ability } from '../../lib/abilitySystems';

const NATIVE_ULTIMATE = ['kai-jax', 'kaijax', 'kai_jax', 'kai', 'jax', 'boryn'];

export interface EnhancedCombatHUDProps {
  /** Overrides, mainly for tests. Defaults come from the live battle store. */
  playerId?: string;
  opponentId?: string;
  opponentHealth?: number;
  maxHealth?: number;
  overdrive?: number;
  maxOverdrive?: number;
  transformed?: boolean;
  active?: boolean;
  onAbilitySelected?: (abilityId: string) => void;
}

export default function EnhancedCombatHUD(props: EnhancedCombatHUDProps) {
  const store = useBattle();
  const playerId = props.playerId ?? store.playerFighterId;
  const opponentId = props.opponentId ?? store.opponentFighterId;
  const opponentHealth = props.opponentHealth ?? store.opponentHealth;
  const maxHealth = props.maxHealth ?? store.maxHealth;
  const overdrive = props.overdrive ?? store.playerOverdrive;
  const maxOverdrive = props.maxOverdrive ?? store.maxOverdrive;
  const transformed = props.transformed ?? store.playerTransformed;
  const active = props.active ?? store.battlePhase === 'fighting';

  const [selected, setSelected] = useState<Ability | null>(null);

  const boss = useMemo(() => resolveBoss(opponentId), [opponentId]);
  const healthPct = maxHealth > 0 ? (opponentHealth / maxHealth) * 100 : 0;
  const phase = boss ? activeBossPhase(boss, healthPct) : null;
  const abilities = useMemo(() => abilitiesFor(playerId), [playerId]);
  const ultimate = ultimateState(playerId, overdrive, maxOverdrive, transformed, NATIVE_ULTIMATE.includes(playerId));

  if (!active) return null;
  if (!boss && abilities.length === 0 && !ultimate) return null;

  const toggle = (ability: Ability) => {
    const next = selected?.id === ability.id ? null : ability;
    setSelected(next);
    if (next) props.onAbilitySelected?.(next.id);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20" data-testid="combat-intel">
      {boss && phase && (
        <BossPhaseBanner
          boss={boss}
          healthPct={healthPct}
          className="absolute left-1/2 top-[84px] sm:top-[96px] -translate-x-1/2 max-w-[min(92vw,420px)]"
        />
      )}

      {(abilities.length > 0 || ultimate) && (
        <div
          className={`pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 sm:block ${
            boss && phase ? 'top-[156px]' : 'top-[100px]'
          }`}
          data-testid="combat-intel-abilities"
        >
          <div role="toolbar" aria-label="Combat abilities" className="kj-vision-hud flex items-center gap-1.5 p-1.5">
            {abilities.slice(0, 4).map((ability) => (
              <button
                key={ability.id}
                type="button"
                aria-pressed={selected?.id === ability.id}
                onClick={() => toggle(ability)}
                title={ability.description}
                data-testid="combat-intel-ability"
                className="min-h-[36px] border border-[#735a35]/60 bg-black/50 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[#efcf91] hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#efcf91]"
              >
                {ability.name}
              </button>
            ))}
            {ultimate && (
              <span
                data-testid="combat-intel-ultimate"
                data-ready={ultimate.ready ? 'true' : 'false'}
                className={`inline-flex min-h-[36px] items-center gap-1 border px-2 py-1 text-[10px] uppercase tracking-[0.08em] ${
                  ultimate.ready
                    ? 'border-amber-300 bg-amber-400/20 text-amber-200'
                    : 'border-[#735a35]/50 bg-black/40 text-slate-300'
                }`}
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {ultimate.name} · {ultimate.ready ? 'READY' : `${Math.floor(ultimate.percent)}%`}
              </span>
            )}
          </div>
          {selected && (
            <div
              className="kj-vision-hud mt-2 max-w-[320px] mx-auto px-3 py-2 text-[11px] text-slate-200"
              data-testid="combat-intel-ability-detail"
            >
              <div className="text-xs uppercase tracking-[0.1em] text-[#efcf91]">{selected.name}</div>
              <div className="mt-1 text-slate-300">{selected.description}</div>
              <div className="mt-1 font-mono text-slate-400">
                Tier {selected.tier} · {selected.damage} dmg (reference data; live readiness is shown on the ultimate only)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
