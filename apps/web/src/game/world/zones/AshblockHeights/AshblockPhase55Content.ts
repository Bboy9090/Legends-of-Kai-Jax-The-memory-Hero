import type { FangCombatantArchetype } from '../../../characters/fang/FangCombatantContract';

export type AshblockPhase55BeatKind =
  | 'TRAVERSAL'
  | 'COMBAT'
  | 'RECOVERY'
  | 'LIEUTENANT'
  | 'MEMORY_TRACE';

export interface AshblockPhase55Spawn {
  id: string;
  archetype: FangCombatantArchetype;
  position: readonly [number, number, number];
}

export interface AshblockPhase55Beat {
  id: string;
  kind: AshblockPhase55BeatKind;
  objective: string;
  spawns: readonly AshblockPhase55Spawn[];
}

/**
 * Source-safe content pacing for the Ashblock Heights vertical slice.
 *
 * These beats define gameplay order only. They do not add book chronology,
 * named NPCs, weapons, drops, or faction lore. Runtime integration must keep
 * Kai/Jax controllers and attack systems as the existing combat authorities.
 */
export const ASHBLOCK_PHASE_55_SEQUENCE: readonly AshblockPhase55Beat[] = [
  {
    id: 'ashblock-entry-traversal',
    kind: 'TRAVERSAL',
    objective: 'Cross the Ashblock approach and reach the first contested street.',
    spawns: [],
  },
  {
    id: 'ashblock-first-ambush',
    kind: 'COMBAT',
    objective: 'Break the first Fang ambush.',
    spawns: [
      { id: 'fang-ambush-scout-01', archetype: 'razor-scout', position: [-2.5, 0.5, 2] },
      { id: 'fang-ambush-baseline-01', archetype: 'baseline', position: [2.5, 0.5, 3.5] },
    ],
  },
  {
    id: 'ashblock-recovery-corridor',
    kind: 'RECOVERY',
    objective: 'Push deeper through the block and read the district before the next clash.',
    spawns: [],
  },
  {
    id: 'ashblock-combination-fight',
    kind: 'COMBAT',
    objective: 'Survive a mixed Fang formation.',
    spawns: [
      { id: 'fang-combo-scout-01', archetype: 'razor-scout', position: [-4, 0.5, 5] },
      { id: 'fang-combo-enforcer-01', archetype: 'enforcer', position: [0, 0.5, 7] },
      { id: 'fang-combo-bruiser-01', archetype: 'chain-bruiser', position: [4, 0.5, 5] },
    ],
  },
  {
    id: 'ashblock-district-lieutenant',
    kind: 'LIEUTENANT',
    objective: 'Defeat the Fang District Lieutenant and open the path to the memory site.',
    spawns: [
      { id: 'fang-lieutenant-01', archetype: 'district-lieutenant', position: [0, 0.5, 9] },
      { id: 'fang-lieutenant-scout-01', archetype: 'razor-scout', position: [-5, 0.5, 7] },
    ],
  },
  {
    id: 'ashblock-memory-trace',
    kind: 'MEMORY_TRACE',
    objective: 'Reach the Memory Trace and recover what Ashblock is holding.',
    spawns: [],
  },
] as const;

export const ASHBLOCK_PHASE_55_ROLE_SET: readonly FangCombatantArchetype[] = [
  'baseline',
  'razor-scout',
  'enforcer',
  'chain-bruiser',
  'district-lieutenant',
] as const;
