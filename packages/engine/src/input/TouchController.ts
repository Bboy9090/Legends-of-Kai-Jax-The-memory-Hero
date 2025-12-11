import { TouchInput, GestureInput, InputAction, InputState } from '@smash-heroes/shared';

export class TouchController {
  private touches: Map<number, TouchInput> = new Map();
  private listeners: Array<(input: InputState) => void> = [];
  private gestureListeners: Array<(gesture: GestureInput) => void> = [];
  private swipeThreshold = 50; // pixels
  private tapTimeout = 200; // milliseconds

  constructor(private element: HTMLElement) {
    this.attachListeners();
  }

  private attachListeners(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart);
    this.element.addEventListener('touchmove', this.handleTouchMove);
    this.element.addEventListener('touchend', this.handleTouchEnd);
    this.element.addEventListener('touchcancel', this.handleTouchCancel);
  }

  private handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches.item(i);
      if (!touch) continue;
      
      const touchInput: TouchInput = {
        id: touch.identifier,
        position: { x: touch.clientX, y: touch.clientY },
        startPosition: { x: touch.clientX, y: touch.clientY },
        pressed: true,
        held: false,
        released: false,
        timestamp: performance.now(),
      };

      this.touches.set(touch.identifier, touchInput);
    }
  };

  private handleTouchMove = (event: TouchEvent): void => {
    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches.item(i);
      if (!touch) continue;
      
      const touchInput = this.touches.get(touch.identifier);

      if (touchInput) {
        touchInput.position = { x: touch.clientX, y: touch.clientY };
        touchInput.held = true;
      }
    }
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches.item(i);
      if (!touch) continue;
      
      const touchInput = this.touches.get(touch.identifier);

      if (touchInput) {
        touchInput.released = true;
        touchInput.pressed = false;
        
        // Detect gestures
        this.detectGesture(touchInput);
        
        // Remove touch
        this.touches.delete(touch.identifier);
      }
    }
  };

  private handleTouchCancel = (event: TouchEvent): void => {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches.item(i);
      if (touch) {
        this.touches.delete(touch.identifier);
      }
    }
  };

  private detectGesture(touch: TouchInput): void {
    const dx = touch.position.x - touch.startPosition.x;
    const dy = touch.position.y - touch.startPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = performance.now() - touch.timestamp;

    // Tap
    if (distance < 10 && duration < this.tapTimeout) {
      const gesture: GestureInput = {
        type: 'tap',
        position: touch.position,
        timestamp: performance.now(),
      };
      this.notifyGestureListeners(gesture);
    }

    // Swipe
    if (distance > this.swipeThreshold) {
      let direction: 'up' | 'down' | 'left' | 'right';
      
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'right' : 'left';
      } else {
        direction = dy > 0 ? 'down' : 'up';
      }

      const gesture: GestureInput = {
        type: 'swipe',
        direction,
        position: touch.position,
        velocity: { x: dx / duration, y: dy / duration },
        distance,
        timestamp: performance.now(),
      };
      
      this.notifyGestureListeners(gesture);
    }
  }

  getTouches(): ReadonlyMap<number, TouchInput> {
    return this.touches;
  }

  addListener(callback: (input: InputState) => void): void {
    this.listeners.push(callback);
  }

  addGestureListener(callback: (gesture: GestureInput) => void): void {
    this.gestureListeners.push(callback);
  }

  private notifyGestureListeners(gesture: GestureInput): void {
    this.gestureListeners.forEach((listener) => listener(gesture));
  }

  destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
    this.listeners = [];
    this.gestureListeners = [];
  }
}
