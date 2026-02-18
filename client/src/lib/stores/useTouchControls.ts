import { create } from 'zustand';

interface TouchControlsState {
  moveX: number;
  moveY: number;
  jump: boolean;
  dodge: boolean;
  run: boolean;
  lightAttack: boolean;
  heavyAttack: boolean;
  launcher: boolean;
  special: boolean;
  ultimate: boolean;
  isTouchDevice: boolean;
  showControls: boolean;
  setMove: (x: number, y: number) => void;
  setButton: (name: string, pressed: boolean) => void;
  setShowControls: (show: boolean) => void;
  detectTouch: () => void;
}

export const useTouchControls = create<TouchControlsState>((set) => ({
  moveX: 0,
  moveY: 0,
  jump: false,
  dodge: false,
  run: false,
  lightAttack: false,
  heavyAttack: false,
  launcher: false,
  special: false,
  ultimate: false,
  isTouchDevice: false,
  showControls: false,
  setMove: (x, y) => set({ moveX: x, moveY: y }),
  setButton: (name, pressed) => set({ [name]: pressed } as any),
  setShowControls: (show) => set({ showControls: show }),
  detectTouch: () => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    set({ isTouchDevice: isTouch, showControls: isTouch });
  },
}));
