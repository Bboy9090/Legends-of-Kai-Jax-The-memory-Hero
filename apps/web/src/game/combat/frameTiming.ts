import type { MoveData } from "./moveData";
import { FRAME_TIME } from "./moveData";

export function getMoveFrameTime(move: MoveData): {
  startupTime: number;
  activeTime: number;
  recoveryTime: number;
  totalTime: number;
  cancelTime: number;
} {
  const startupTime = move.startup * FRAME_TIME;
  const activeTime = move.active * FRAME_TIME;
  const recoveryTime = move.recovery * FRAME_TIME;
  const totalTime = startupTime + activeTime + recoveryTime;
  const cancelTime = move.cancelAt > 0 ? move.cancelAt * FRAME_TIME : totalTime;
  return { startupTime, activeTime, recoveryTime, totalTime, cancelTime };
}

export function isInActiveWindow(move: MoveData, elapsedSeconds: number): boolean {
  const timing = getMoveFrameTime(move);
  return elapsedSeconds >= timing.startupTime && elapsedSeconds <= timing.startupTime + timing.activeTime;
}
