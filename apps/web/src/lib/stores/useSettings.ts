/**
 * UI and accessibility settings persisted to localStorage.
 * Joystick size, graphics quality, colorblind mode, UI scale.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type JoystickSize = "normal" | "large";
export type GraphicsQuality = "high" | "medium" | "low";
export type ColorblindMode = "off" | "protanopia" | "deuteranopia";
export type UIScale = "small" | "normal" | "large";

const STORAGE_KEY = "MK_SETTINGS_V1";

export const JOYSTICK_SIZES: Record<JoystickSize, number> = {
  normal: 150,
  large: 180,
};

export const UI_SCALE_VALUES: Record<UIScale, number> = {
  small: 0.9,
  normal: 1,
  large: 1.1,
};

/** For colorblind modes: player = blue, opponent = orange (more distinguishable than cyan/red). */
export function getColorblindAccent(
  accentColor: string,
  side: "player" | "opponent",
  colorblindMode: ColorblindMode
): string {
  if (colorblindMode === "off") return accentColor;
  return side === "player" ? "#3b82f6" : "#f97316";
}

interface SettingsState {
  joystickSize: JoystickSize;
  graphicsQuality: GraphicsQuality;
  colorblindMode: ColorblindMode;
  uiScale: UIScale;

  setJoystickSize: (v: JoystickSize) => void;
  setGraphicsQuality: (v: GraphicsQuality) => void;
  setColorblindMode: (v: ColorblindMode) => void;
  setUiScale: (v: UIScale) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      joystickSize: "normal",
      graphicsQuality: "high",
      colorblindMode: "off",
      uiScale: "normal",

      setJoystickSize: (v) => set({ joystickSize: v }),
      setGraphicsQuality: (v) => set({ graphicsQuality: v }),
      setColorblindMode: (v) => set({ colorblindMode: v }),
      setUiScale: (v) => set({ uiScale: v }),
    }),
    { name: STORAGE_KEY }
  )
);
