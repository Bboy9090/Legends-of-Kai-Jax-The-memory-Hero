export type StormRoninSanctumBeatKind =
  | 'TRAINING'
  | 'ARCHIVE'
  | 'MEMORY_RECONSTRUCTION'
  | 'REFLECTION'
  | 'EXIT';

export interface StormRoninSanctumBeat {
  id: string;
  kind: StormRoninSanctumBeatKind;
  objective: string;
}

/**
 * Publication-safe Storm Ronin Sanctum pacing.
 *
 * The Sanctum may support training, archive review, and memory reconstruction.
 * This contract does not assert who appears, what is revealed, or when any
 * memory belongs in chronology.
 */
export const STORM_RONIN_SANCTUM_SEQUENCE: readonly StormRoninSanctumBeat[] = [
  {
    id: 'sanctum-training-floor',
    kind: 'TRAINING',
    objective: 'Enter the training space and exercise established movement/combat systems.',
  },
  {
    id: 'sanctum-archive-access',
    kind: 'ARCHIVE',
    objective: 'Open a chronology-safe archive surface without asserting new lore.',
  },
  {
    id: 'sanctum-memory-reconstruction',
    kind: 'MEMORY_RECONSTRUCTION',
    objective: 'Reconstruct an authorized memory fragment only when publication source data is supplied.',
  },
  {
    id: 'sanctum-reflection',
    kind: 'REFLECTION',
    objective: 'Return control to the player without declaring a permanent story consequence.',
  },
  {
    id: 'sanctum-exit',
    kind: 'EXIT',
    objective: 'Leave the Sanctum and return to the Story Hub safely.',
  },
] as const;

export const STORM_RONIN_SANCTUM_ALLOWED_MECHANICS: readonly StormRoninSanctumBeatKind[] = [
  'TRAINING',
  'ARCHIVE',
  'MEMORY_RECONSTRUCTION',
  'REFLECTION',
  'EXIT',
] as const;
