export type SkyfallFieldBeatKind =
  | 'TRAVERSAL'
  | 'ALT_ROUTE'
  | 'VERTICAL_READ'
  | 'RECOVERY'
  | 'MEMORY_TRACE';

export interface SkyfallFieldBeat {
  id: string;
  kind: SkyfallFieldBeatKind;
  objective: string;
}

/**
 * Publication-safe Skyfall Spines gameplay pacing.
 *
 * This contract is intentionally mechanical. It introduces no named encounter,
 * faction outcome, death, reward, or chronology. Story placement remains owned
 * by the publication source.
 */
export const SKYFALL_FIELD_SEQUENCE: readonly SkyfallFieldBeat[] = [
  {
    id: 'skyfall-entry-climb',
    kind: 'TRAVERSAL',
    objective: 'Enter the Spines and establish the first vertical route.',
  },
  {
    id: 'skyfall-route-fork',
    kind: 'ALT_ROUTE',
    objective: 'Choose between two movement paths without changing story state.',
  },
  {
    id: 'skyfall-height-read',
    kind: 'VERTICAL_READ',
    objective: 'Read elevation, spacing, and landing options before advancing.',
  },
  {
    id: 'skyfall-recovery-ledge',
    kind: 'RECOVERY',
    objective: 'Recover on a safe ledge and prepare for the final traversal.',
  },
  {
    id: 'skyfall-memory-trace',
    kind: 'MEMORY_TRACE',
    objective: 'Reach the environmental memory trace and defer chronology to the publication source.',
  },
] as const;

export const SKYFALL_ALLOWED_MECHANICS: readonly SkyfallFieldBeatKind[] = [
  'TRAVERSAL',
  'ALT_ROUTE',
  'VERTICAL_READ',
  'RECOVERY',
  'MEMORY_TRACE',
] as const;
