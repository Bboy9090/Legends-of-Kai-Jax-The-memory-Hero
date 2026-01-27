/**
 * Mobile Input Handler
 * 
 * Optimized touch input handling for mobile devices following governance rules:
 * - Mobile gets optimized rendering, NOT simplified gameplay
 * - Performance cuts allowed: emissive materials, particle effects
 * - Never cut: silhouette, tail_count, animation_timing, posture_system, hit_stop
 * 
 * References:
 * - kai_jax.character.json: mobile_profile section
 * - config/input-keybinds.json: mobile_defaults section
 */

import { InputAction, InputState, GestureInput } from '@beast-kin/shared';

interface TouchPoint {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  lastMoveTime: number;
}

interface HapticFeedbackConfig {
  enabled: boolean;
  on_hit: { duration: number; intensity: number };
  on_attack: { duration: number; intensity: number };
  on_parry: { duration: number; intensity: number };
  on_state_change: { duration: number; intensity: number };
}

export interface MobileInputConfig {
  swipeThreshold: number; // Minimum distance for swipe detection
  swipeVelocityThreshold: number; // Minimum velocity for swipe
  longPressDelay: number; // ms for long-press detection
  doubleTapDelay: number; // ms for double-tap detection
  pinchThreshold: number; // Minimum pinch distance change
  haptics: HapticFeedbackConfig;
  autoHideUIDelay: number; // ms before hiding UI during input
}

/**
 * Mobile-specific input handler with gesture recognition and haptic feedback
 */
export class MobileInputHandler {
  private element: HTMLElement;
  private config: MobileInputConfig;
  private activeTouches: Map<number, TouchPoint> = new Map();
  private lastTapTime: number = 0;
  private tapCount: number = 0;
  private listeners: Set<(input: InputState) => void> = new Set();
  private gestureListeners: Set<(gesture: GestureInput) => void> = new Set();
  private uiHideTimer: number | null = null;
  private enabled: boolean = true;

  constructor(element: HTMLElement, config?: Partial<MobileInputConfig>) {
    this.element = element;
    this.config = {
      swipeThreshold: 50,
      swipeVelocityThreshold: 0.3,
      longPressDelay: 500,
      doubleTapDelay: 300,
      pinchThreshold: 10,
      haptics: {
        enabled: true,
        on_hit: { duration: 100, intensity: 0.7 },
        on_attack: { duration: 50, intensity: 0.5 },
        on_parry: { duration: 150, intensity: 0.9 },
        on_state_change: { duration: 30, intensity: 0.3 },
      },
      autoHideUIDelay: 3000,
      ...config,
    };

    this.setupEventListeners();
  }

  /**
   * Setup touch event listeners
   */
  private setupEventListeners(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel, { passive: false });
  }

  /**
   * Handle touch start
   */
  private handleTouchStart = (event: TouchEvent): void => {
    if (!this.enabled) return;
    event.preventDefault();

    const now = performance.now();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchPoint: TouchPoint = {
        id: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: now,
        lastMoveTime: now,
      };

      this.activeTouches.set(touch.identifier, touchPoint);
    }

    // Handle tap detection
    if (event.touches.length === 1) {
      this.handleTapDetection(now, event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }

    // Auto-hide UI during input
    this.startAutoHideTimer();
  };

  /**
   * Handle touch move
   */
  private handleTouchMove = (event: TouchEvent): void => {
    if (!this.enabled) return;
    event.preventDefault();

    const now = performance.now();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchPoint = this.activeTouches.get(touch.identifier);

      if (touchPoint) {
        touchPoint.currentX = touch.clientX;
        touchPoint.currentY = touch.clientY;
        touchPoint.lastMoveTime = now;
      }
    }

    // Detect pinch gesture
    if (event.touches.length === 2) {
      this.detectPinchGesture(event.touches);
    }
  };

  /**
   * Handle touch end
   */
  private handleTouchEnd = (event: TouchEvent): void => {
    if (!this.enabled) return;
    event.preventDefault();

    const now = performance.now();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchPoint = this.activeTouches.get(touch.identifier);

      if (touchPoint) {
        // Detect swipe
        this.detectSwipe(touchPoint, now);

        // Detect long press
        this.detectLongPress(touchPoint, now);

        this.activeTouches.delete(touch.identifier);
      }
    }
  };

  /**
   * Handle touch cancel
   */
  private handleTouchCancel = (event: TouchEvent): void => {
    if (!this.enabled) return;

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.activeTouches.delete(touch.identifier);
    }
  };

  /**
   * Detect tap and double-tap
   */
  private handleTapDetection(now: number, x: number, y: number): void {
    const timeSinceLastTap = now - this.lastTapTime;

    if (timeSinceLastTap < this.config.doubleTapDelay) {
      this.tapCount++;

      if (this.tapCount === 2) {
        // Double tap detected
        this.emitGesture({
          type: 'double-tap',
          position: { x, y },
          timestamp: now,
        });

        // Emit dash action (from config/input-keybinds.json: double_tap -> dash)
        this.emitInput(InputAction.DASH, now);

        this.tapCount = 0;
      }
    } else {
      // Single tap
      this.tapCount = 1;
      this.emitGesture({
        type: 'tap',
        position: { x, y },
        timestamp: now,
      });
    }

    this.lastTapTime = now;
  }

  /**
   * Detect swipe gesture
   */
  private detectSwipe(touchPoint: TouchPoint, now: number): void {
    const deltaX = touchPoint.currentX - touchPoint.startX;
    const deltaY = touchPoint.currentY - touchPoint.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = now - touchPoint.startTime;

    if (duration === 0) return;

    const velocity = distance / duration;

    if (
      distance > this.config.swipeThreshold &&
      velocity > this.config.swipeVelocityThreshold
    ) {
      // Determine swipe direction
      const angle = Math.atan2(deltaY, deltaX);
      let direction: 'up' | 'down' | 'left' | 'right';

      if (Math.abs(angle) < Math.PI / 4) {
        direction = 'right';
      } else if (Math.abs(angle) > (3 * Math.PI) / 4) {
        direction = 'left';
      } else if (angle > 0) {
        direction = 'down';
      } else {
        direction = 'up';
      }

      this.emitGesture({
        type: 'swipe',
        direction,
        position: { x: touchPoint.currentX, y: touchPoint.currentY },
        velocity: { x: deltaX / duration, y: deltaY / duration },
        distance,
        timestamp: now,
      });

      // Map swipe to actions (from config/input-keybinds.json)
      switch (direction) {
        case 'up':
          this.emitInput(InputAction.JUMP, now);
          break;
        case 'down':
          this.emitInput(InputAction.CROUCH, now);
          break;
        case 'left':
        case 'right':
          // Dodge in swipe direction
          this.emitInput(InputAction.DODGE, now);
          break;
      }
    }
  }

  /**
   * Detect long press
   */
  private detectLongPress(touchPoint: TouchPoint, now: number): void {
    const duration = now - touchPoint.startTime;
    const deltaX = Math.abs(touchPoint.currentX - touchPoint.startX);
    const deltaY = Math.abs(touchPoint.currentY - touchPoint.startY);

    // Long press if held long enough and didn't move much
    if (duration >= this.config.longPressDelay && deltaX < 10 && deltaY < 10) {
      this.emitGesture({
        type: 'hold',
        position: { x: touchPoint.currentX, y: touchPoint.currentY },
        timestamp: now,
      });

      // Long press is charge attack (from config/input-keybinds.json)
      this.emitInput(InputAction.HEAVY_ATTACK, now);
    }
  }

  /**
   * Detect pinch gesture (for camera zoom, NOT state changes per governance)
   */
  private detectPinchGesture(touches: TouchList): void {
    if (touches.length !== 2) return;

    const touch1 = touches[0];
    const touch2 = touches[1];

    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    // Store initial distance on first pinch detection
    if (!this.activeTouches.has(-1)) {
      this.activeTouches.set(-1, {
        id: -1,
        startX: distance,
        startY: 0,
        currentX: distance,
        currentY: 0,
        startTime: performance.now(),
        lastMoveTime: performance.now(),
      });
      return;
    }

    const pinchData = this.activeTouches.get(-1);
    if (!pinchData) return;

    const deltaDistance = distance - pinchData.startX;

    if (Math.abs(deltaDistance) > this.config.pinchThreshold) {
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      this.emitGesture({
        type: 'pinch',
        direction: deltaDistance > 0 ? 'right' : 'left', // Zoom out/in
        position: { x: centerX, y: centerY },
        distance: Math.abs(deltaDistance),
        timestamp: performance.now(),
      });

      // Update stored distance
      pinchData.startX = distance;
    }
  }

  /**
   * Emit input state
   */
  private emitInput(action: InputAction, timestamp: number): void {
    const inputState: InputState = {
      action,
      pressed: true,
      held: false,
      released: false,
      timestamp,
      duration: 0,
    };

    this.listeners.forEach((listener) => listener(inputState));
  }

  /**
   * Emit gesture
   */
  private emitGesture(gesture: GestureInput): void {
    this.gestureListeners.forEach((listener) => listener(gesture));
  }

  /**
   * Auto-hide UI during input
   */
  private startAutoHideTimer(): void {
    if (this.uiHideTimer !== null) {
      clearTimeout(this.uiHideTimer);
    }

    // Emit UI hide event
    document.dispatchEvent(new CustomEvent('mobile:hide_ui'));

    this.uiHideTimer = window.setTimeout(() => {
      document.dispatchEvent(new CustomEvent('mobile:show_ui'));
      this.uiHideTimer = null;
    }, this.config.autoHideUIDelay);
  }

  /**
   * Trigger haptic feedback
   * 
   * Uses Vibration API when available
   * Categories match config/input-keybinds.json mobile_defaults.haptics
   */
  public triggerHaptic(
    type: 'hit' | 'attack' | 'parry' | 'state_change'
  ): void {
    if (!this.config.haptics.enabled) return;
    if (!('vibrate' in navigator)) return;

    let pattern: number;
    let intensity: number;

    switch (type) {
      case 'hit':
        pattern = this.config.haptics.on_hit.duration;
        intensity = this.config.haptics.on_hit.intensity;
        break;
      case 'attack':
        pattern = this.config.haptics.on_attack.duration;
        intensity = this.config.haptics.on_attack.intensity;
        break;
      case 'parry':
        pattern = this.config.haptics.on_parry.duration;
        intensity = this.config.haptics.on_parry.intensity;
        break;
      case 'state_change':
        pattern = this.config.haptics.on_state_change.duration;
        intensity = this.config.haptics.on_state_change.intensity;
        break;
    }

    // Scale pattern by intensity
    const adjustedPattern = Math.round(pattern * intensity);
    navigator.vibrate(adjustedPattern);
  }

  /**
   * Add input listener
   */
  public addListener(listener: (input: InputState) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove input listener
   */
  public removeListener(listener: (input: InputState) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Add gesture listener
   */
  public addGestureListener(listener: (gesture: GestureInput) => void): void {
    this.gestureListeners.add(listener);
  }

  /**
   * Remove gesture listener
   */
  public removeGestureListener(listener: (gesture: GestureInput) => void): void {
    this.gestureListeners.delete(listener);
  }

  /**
   * Enable/disable input handling
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.activeTouches.clear();
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);

    if (this.uiHideTimer !== null) {
      clearTimeout(this.uiHideTimer);
    }

    this.activeTouches.clear();
    this.listeners.clear();
    this.gestureListeners.clear();
  }
}
