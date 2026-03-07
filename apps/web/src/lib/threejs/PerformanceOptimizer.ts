/**
 * Quality settings and device type for Three.js (pixel ratio, post-processing, shadows).
 * Reads graphics quality from useSettings (high/medium/low).
 */

import { useSettings } from "../stores/useSettings";

export type DeviceType = "desktop" | "mobile";

export interface QualitySettings {
  pixelRatio: number;
  postProcessing: boolean;
  antialias: boolean;
  shadowMap: { type: number };
  shadowsEnabled: boolean;
}

export function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ? "mobile" : "desktop";
}

export function getQualitySettings(): QualitySettings {
  const graphics = typeof window !== "undefined" ? useSettings.getState().graphicsQuality : "high";
  const basePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1;
  const pixelRatio =
    graphics === "low"
      ? Math.min(basePixelRatio, 1)
      : graphics === "medium"
        ? Math.min(basePixelRatio, 1.5)
        : Math.min(basePixelRatio, 2);
  const shadowsEnabled = graphics !== "low";
  const shadowType = graphics === "high" ? 2 : 1; // PCFSoft vs Basic
  return {
    pixelRatio,
    postProcessing: graphics === "high",
    antialias: graphics !== "low",
    shadowMap: { type: shadowType },
    shadowsEnabled,
  };
}
