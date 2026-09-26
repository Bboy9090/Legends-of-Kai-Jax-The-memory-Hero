export interface TouchGesture {
  type: 'tap' | 'swipe' | 'hold';
  direction?: 'up' | 'down' | 'left' | 'right';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
}

export class TouchManager {
  private touchStart: { x: number; y: number; time: number } | null = null;
  private minSwipeDistance = 50;
  private maxTapDuration = 200;
  
  constructor(
    private onTap: () => void,
    private onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void
  ) {}
  
  handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (!touch) return;
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };
  
  handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault();
    if (!this.touchStart) return;
    
    const touch = event.changedTouches[0];
    if (!touch) return;
    const endX = touch.clientX;
    const endY = touch.clientY;
    const duration = Date.now() - this.touchStart.time;
    
    const deltaX = endX - this.touchStart.x;
    const deltaY = endY - this.touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Determine gesture type
    if (duration < this.maxTapDuration && distance < this.minSwipeDistance) {
      // Tap gesture
      this.onTap();
    } else if (distance >= this.minSwipeDistance) {
      // Swipe gesture
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        this.onSwipe(deltaX > 0 ? 'right' : 'left');
      } else {
        // Vertical swipe
        this.onSwipe(deltaY > 0 ? 'down' : 'up');
      }
    }
    
    this.touchStart = null;
  };
  
  handleTouchMove = (event: TouchEvent) => {
    event.preventDefault();
  };
}

// Haptic feedback for mobile devices
export type HapticFeedbackResult = 'vibration' | 'unsupported' | 'failed';

export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): HapticFeedbackResult {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return 'unsupported';
  }

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [40],
  } as const;

  try {
    return navigator.vibrate(patterns[type]) ? 'vibration' : 'unsupported';
  } catch {
    // Haptics must never block gameplay input or pause handling.
    return 'failed';
  }
}

// Check if device supports touch
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Prevent zoom on double tap
export function preventZoom() {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

// Get viewport dimensions for responsive design
export function getViewportSize() {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  };
}
