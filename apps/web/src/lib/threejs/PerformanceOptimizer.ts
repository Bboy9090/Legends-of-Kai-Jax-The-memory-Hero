/**
 * Quality settings and device type for Three.js (pixel ratio, post-processing, shadows).
 */

export type DeviceType = "desktop" | "mobile";

export interface QualitySettings {
  pixelRatio: number;
  postProcessing: boolean;
  antialias: boolean;
  shadowMap: { type: number };
}

export function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ? "mobile" : "desktop";
}

export function getQualitySettings(): QualitySettings {
  const device = getDeviceType();
  const pixelRatio = typeof window !== "undefined" ? Math.min(window.devicePixelRatio ?? 1, 2) : 1;
  return {
    pixelRatio,
    postProcessing: true,
    antialias: true,
    shadowMap: { type: 2 }, // THREE.PCFSoftShadowMap
  };
}
