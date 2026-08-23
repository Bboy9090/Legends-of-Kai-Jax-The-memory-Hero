import { create } from "zustand";

export type DummyBehavior = "normal" | "idle" | "jump" | "attack";

export interface TrainingLabState {
  enabled: boolean;
  showCollisionVolumes: boolean;
  dummyBehavior: DummyBehavior;
  simulationPaused: boolean;
  setEnabled: (enabled: boolean) => void;
  setShowCollisionVolumes: (show: boolean) => void;
  setDummyBehavior: (behavior: DummyBehavior) => void;
  setSimulationPaused: (paused: boolean) => void;
  resetTrainingControls: () => void;
}

const DEFAULTS = Object.freeze({
  enabled: false,
  showCollisionVolumes: false,
  dummyBehavior: "normal" as DummyBehavior,
  simulationPaused: false,
});

export const useTrainingLab = create<TrainingLabState>((set) => ({
  ...DEFAULTS,
  setEnabled: (enabled) => set({ enabled: !!enabled }),
  setShowCollisionVolumes: (showCollisionVolumes) => set({ showCollisionVolumes: !!showCollisionVolumes }),
  setDummyBehavior: (dummyBehavior) => set({ dummyBehavior }),
  setSimulationPaused: (simulationPaused) => set({ simulationPaused: !!simulationPaused }),
  resetTrainingControls: () => set({ ...DEFAULTS }),
}));
