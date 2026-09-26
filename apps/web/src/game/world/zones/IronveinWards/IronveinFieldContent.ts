export type IronveinFieldBeatKind =
  | 'TRAVERSAL'
  | 'PRESSURE'
  | 'TRAP'
  | 'SUPPRESSION'
  | 'RECOVERY'
  | 'MEMORY_TRACE';

export interface IronveinFieldBeat {
  id: string;
  kind: IronveinFieldBeatKind;
  objective: string;
}

/**
 * Publication-safe Ironvein Wards gameplay pacing.
 *
 * This contract deliberately defines mechanics, not book events. It introduces
 * no named NPC, boss, death, weapon, reward, or irreversible chronology. The
 * Story Hub already authorizes Ironvein as an established Raging City field
 * node for pressure, suppression, traps, traversal, and memory work.
 */
export const IRONVEIN_FIELD_SEQUENCE: readonly IronveinFieldBeat[] = [
  {
    id: 'ironvein-entry-route',
    kind: 'TRAVERSAL',
    objective: 'Enter the ward and cross the first restricted route.',
  },
  {
    id: 'ironvein-pressure-lane',
    kind: 'PRESSURE',
    objective: 'Advance while the ward closes safe movement lanes.',
  },
  {
    id: 'ironvein-trap-read',
    kind: 'TRAP',
    objective: 'Read and clear the environmental trap pattern without forcing a story event.',
  },
  {
    id: 'ironvein-suppression-push',
    kind: 'SUPPRESSION',
    objective: 'Break through a suppression corridor using established movement and defensive systems.',
  },
  {
    id: 'ironvein-recovery-pocket',
    kind: 'RECOVERY',
    objective: 'Regain spacing and inspect the ward before the final route.',
  },
  {
    id: 'ironvein-memory-trace',
    kind: 'MEMORY_TRACE',
    objective: 'Reach the field memory trace and hand chronology back to the publication source.',
  },
] as const;

export const IRONVEIN_ALLOWED_MECHANICS: readonly IronveinFieldBeatKind[] = [
  'TRAVERSAL',
  'PRESSURE',
  'TRAP',
  'SUPPRESSION',
  'RECOVERY',
  'MEMORY_TRACE',
] as const;
