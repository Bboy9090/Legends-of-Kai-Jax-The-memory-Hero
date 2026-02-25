import { create } from "zustand";

const AUDIO_URLS = [
  "/sounds/background.mp3",
  "/sounds/hit.mp3",
  "/sounds/success.mp3",
];

// Key GLB models for initial load (battle/character select)
const KEY_GLB_PATHS = [
  "/models/Meshy_AI_Character_output9TAILSKAIJAX.glb",
  "/models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb",
  "/models/blazing-fox-vanguard.glb",
  "/models/marble_gladiator.glb",
];

interface LoadingProgressState {
  progress: number;
  isReady: boolean;
  setProgress: (p: number) => void;
  setReady: () => void;
  startLoading: () => void;
}

export const useLoadingProgress = create<LoadingProgressState>((set, get) => ({
  progress: 0,
  isReady: false,
  setProgress: (progress) => set({ progress: Math.min(100, Math.max(0, progress)) }),
  setReady: () => set({ progress: 100, isReady: true }),
  startLoading: () => {
    if (get().isReady) return;

    const setMinProgress = (p: number) =>
      set((s) => ({ progress: Math.max(s.progress, Math.min(100, p)) }));

    // 0% -> 25%: audio | 25% -> 50% -> 75% -> 100%: GLBs
    const audioPromises = AUDIO_URLS.map(
      (url) =>
        new Promise<void>((resolve) => {
          try {
            const a = new Audio();
            a.oncanplaythrough = () => resolve();
            a.onerror = () => resolve();
            a.src = url;
          } catch {
            resolve();
          }
        })
    );
    Promise.all(audioPromises).then(() => setMinProgress(25));

    const loadGLBs = async () => {
      try {
        const { useGLTF } = await import("@react-three/drei");
        const [b1, b2] = [
          KEY_GLB_PATHS.slice(0, 2),
          KEY_GLB_PATHS.slice(2, 4),
        ];
        await Promise.all(
          b1.map((p) => Promise.resolve(useGLTF.preload(p)).catch(() => {}))
        );
        setMinProgress(50);
        await Promise.all(
          b2.map((p) => Promise.resolve(useGLTF.preload(p)).catch(() => {}))
        );
        setMinProgress(75);
      } catch (_e) {
        setMinProgress(75);
      }
      set({ progress: 100, isReady: true });
    };
    loadGLBs();
  },
}));
