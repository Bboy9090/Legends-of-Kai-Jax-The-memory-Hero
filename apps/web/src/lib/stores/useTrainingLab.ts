import { create } from "zustand";
import {
  sanitizeRecordedActions,
  type TrainingDummyAction,
  type TrainingRecordedAction,
} from "../../game/combat/trainingRecording";

export type DummyBehavior = "normal" | "idle" | "jump" | "attack" | "playback";

export interface TrainingLabState {
  enabled: boolean;
  showCollisionVolumes: boolean;
  dummyBehavior: DummyBehavior;
  simulationPaused: boolean;
  stepEpoch: number;
  recording: boolean;
  recordingStartedAtMs: number;
  recordedActions: TrainingRecordedAction[];
  playbackActive: boolean;
  playbackNonce: number;
  setEnabled: (enabled: boolean) => void;
  setShowCollisionVolumes: (show: boolean) => void;
  setDummyBehavior: (behavior: DummyBehavior) => void;
  setSimulationPaused: (paused: boolean) => void;
  requestStep: () => boolean;
  startRecording: (nowMs: number) => void;
  stopRecording: () => void;
  recordAction: (action: TrainingDummyAction, nowMs: number) => void;
  clearRecording: () => void;
  startPlayback: () => boolean;
  stopPlayback: () => void;
  resetTrainingControls: () => void;
}

const DEFAULTS = Object.freeze({
  enabled: false,
  showCollisionVolumes: false,
  dummyBehavior: "normal" as DummyBehavior,
  simulationPaused: false,
  stepEpoch: 0,
  recording: false,
  recordingStartedAtMs: 0,
  recordedActions: [] as TrainingRecordedAction[],
  playbackActive: false,
  playbackNonce: 0,
});

function safeNowMs(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export const useTrainingLab = create<TrainingLabState>((set, get) => ({
  ...DEFAULTS,
  setEnabled: (enabled) => set({ enabled: !!enabled }),
  setShowCollisionVolumes: (showCollisionVolumes) => set({ showCollisionVolumes: !!showCollisionVolumes }),
  setDummyBehavior: (dummyBehavior) => set({
    dummyBehavior,
    playbackActive: dummyBehavior === "playback" ? get().playbackActive : false,
  }),
  setSimulationPaused: (simulationPaused) => set({ simulationPaused: !!simulationPaused }),
  requestStep: () => {
    if (!get().simulationPaused) return false;
    set((state) => ({ stepEpoch: state.stepEpoch + 1 }));
    return true;
  },
  startRecording: (nowMs) => set({
    recording: true,
    recordingStartedAtMs: safeNowMs(nowMs),
    recordedActions: [],
    playbackActive: false,
  }),
  stopRecording: () => set({ recording: false }),
  recordAction: (action, nowMs) => {
    const state = get();
    if (!state.recording) return;
    const elapsedSec = Math.max(0, (safeNowMs(nowMs) - state.recordingStartedAtMs) / 1000);
    const recordedActions = sanitizeRecordedActions([
      ...state.recordedActions,
      { atSec: elapsedSec, action },
    ]);
    set({ recordedActions });
  },
  clearRecording: () => set({ recordedActions: [], recording: false, playbackActive: false }),
  startPlayback: () => {
    if (get().recordedActions.length === 0) return false;
    set((state) => ({
      playbackActive: true,
      playbackNonce: state.playbackNonce + 1,
      dummyBehavior: "playback",
      recording: false,
    }));
    return true;
  },
  stopPlayback: () => set({ playbackActive: false, dummyBehavior: "idle" }),
  resetTrainingControls: () => set({ ...DEFAULTS }),
}));
