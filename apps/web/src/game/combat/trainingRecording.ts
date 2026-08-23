export type TrainingDummyAction = "jump" | "punch" | "kick" | "special";

export interface TrainingRecordedAction {
  atSec: number;
  action: TrainingDummyAction;
}

const MAX_RECORDING_SEC = 15;
const MAX_ACTIONS = 128;

export function sanitizeRecordedActions(
  actions: readonly TrainingRecordedAction[]
): TrainingRecordedAction[] {
  return actions
    .filter((entry) => Number.isFinite(entry.atSec) && entry.atSec >= 0 && entry.atSec <= MAX_RECORDING_SEC)
    .filter((entry) => entry.action === "jump" || entry.action === "punch" || entry.action === "kick" || entry.action === "special")
    .slice(0, MAX_ACTIONS)
    .map((entry) => ({ ...entry }))
    .sort((a, b) => a.atSec - b.atSec);
}

export function mapKeyCodeToDummyAction(code: string): TrainingDummyAction | null {
  switch (code) {
    case "Space":
    case "ArrowUp":
    case "KeyW":
      return "jump";
    case "KeyJ":
    case "KeyX":
      return "punch";
    case "KeyK":
    case "KeyZ":
      return "kick";
    case "KeyL":
    case "KeyC":
      return "special";
    default:
      return null;
  }
}

export function getDueRecordedActions(
  actions: readonly TrainingRecordedAction[],
  previousSec: number,
  nextSec: number
): TrainingRecordedAction[] {
  const start = Math.max(0, Number.isFinite(previousSec) ? previousSec : 0);
  const end = Math.max(start, Number.isFinite(nextSec) ? nextSec : start);
  return sanitizeRecordedActions(actions).filter((entry) => entry.atSec > start && entry.atSec <= end);
}

export function getRecordingDuration(actions: readonly TrainingRecordedAction[]): number {
  const safe = sanitizeRecordedActions(actions);
  return safe.length === 0 ? 0 : safe[safe.length - 1].atSec;
}
