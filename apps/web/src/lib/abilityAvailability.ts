/**
 * Real readiness of the adventure combat actions, mirroring the gating in AdventurePlayerController:
 *   - attacks/skills/dodge need the player to be FREE (not mid-attack, dodging, blocking or stunned),
 *   - not exhausted (stamina below STAMINA_CONFIG.exhaustedThreshold),
 *   - and enough stamina for the move's cost (training mode has infinite stamina).
 * The UI reads this instead of static reference data so indicators always match what the button will do.
 */
import { MOVES } from '../game/combat/moveData';
import { DODGE, STAMINA_CONFIG } from '../game/tuning/adventureTuning';
import { CombatState } from '../game/combat/stateEnums';

export type TouchAction = 'attack' | 'heavy' | 'skill' | 'dodge';

export type BlockedReason = 'busy' | 'exhausted' | 'low-stamina';

export interface AvailabilityInput {
  stamina: number;
  combatState: CombatState;
  trainingSession?: boolean;
}

export interface Availability {
  ready: boolean;
  /** Stamina the action will spend. */
  cost: number;
  /** 0..1 — how much of the required stamina is currently available (1 when ready). */
  progress: number;
  reason: BlockedReason | null;
}

const MOVE_FOR: Record<Exclude<TouchAction, 'dodge'>, string> = {
  attack: 'light1',
  heavy: 'heavy',
  skill: 'skill',
};

export function staminaCostFor(action: TouchAction): number {
  if (action === 'dodge') return DODGE.staminaCost;
  return MOVES[MOVE_FOR[action]]?.staminaCost ?? 0;
}

export function abilityAvailability(action: TouchAction, input: AvailabilityInput): Availability {
  const cost = staminaCostFor(action);
  if (input.trainingSession) return { ready: input.combatState === CombatState.FREE, cost, progress: 1, reason: input.combatState === CombatState.FREE ? null : 'busy' };
  const progress = cost <= 0 ? 1 : Math.max(0, Math.min(1, input.stamina / cost));
  if (input.combatState !== CombatState.FREE) return { ready: false, cost, progress, reason: 'busy' };
  if (input.stamina < STAMINA_CONFIG.exhaustedThreshold) return { ready: false, cost, progress, reason: 'exhausted' };
  if (input.stamina < cost) return { ready: false, cost, progress, reason: 'low-stamina' };
  return { ready: true, cost, progress: 1, reason: null };
}

export function describeAvailability(label: string, a: Availability): string {
  if (a.ready) return `${label}, ready`;
  const why = a.reason === 'busy' ? 'recovering' : a.reason === 'exhausted' ? 'exhausted' : 'not enough stamina';
  return `${label}, ${why}`;
}
