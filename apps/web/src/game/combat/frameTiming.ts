import type { MoveData } from "./moveData";
import { FRAME_TIME } from "./moveData";

export interface MoveFrameTime {
  startupTime: number;
  activeTime: number;
  recoveryTime: number;
  totalTime: number;
  cancelTime: number;
  activeStartTime: number;
  activeEndTime: number;
}

function safeFrames(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function framesToSeconds(frames: number): number {
  return safeFrames(frames) * FRAME_TIME;
}

/** Convert authored frame data into canonical simulation seconds. */
export function getMoveFrameTime(move: MoveData): MoveFrameTime {
  const startupTime = framesToSeconds(move.startup);
  const activeTime = framesToSeconds(move.active);
  const recoveryTime = framesToSeconds(move.recovery);
  const totalTime = startupTime + activeTime + recoveryTime;
  const authoredCancelTime = move.cancelAt > 0 ? framesToSeconds(move.cancelAt) : totalTime;
  const cancelTime = Math.min(totalTime, authoredCancelTime);
  const activeStartTime = startupTime;
  const activeEndTime = startupTime + activeTime;

  return {
    startupTime,
    activeTime,
    recoveryTime,
    totalTime,
    cancelTime,
    activeStartTime,
    activeEndTime,
  };
}

/**
 * Active windows use a half-open interval [start, end). This avoids a boundary
 * frame being counted twice when fixed-step or replay clocks land exactly on end.
 */
export function isInActiveWindow(move: MoveData, elapsedSeconds: number): boolean {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) return false;
  const timing = getMoveFrameTime(move);
  return elapsedSeconds >= timing.activeStartTime && elapsedSeconds < timing.activeEndTime;
}

export function isMoveComplete(move: MoveData, elapsedSeconds: number): boolean {
  if (!Number.isFinite(elapsedSeconds)) return false;
  return elapsedSeconds >= getMoveFrameTime(move).totalTime;
}
