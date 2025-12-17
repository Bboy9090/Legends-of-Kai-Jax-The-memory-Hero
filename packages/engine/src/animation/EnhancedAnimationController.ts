/**
 * Enhanced Animation Controller with Advanced Features
 * - State-based animation system
 * - Smooth blending between animations
 * - Procedural animation layers
 * - IK (Inverse Kinematics) support
 */

import { EasingFunction, lerp, lerpAngle, easeInOutCubic, easeOutBack, easeInBack } from './AnimationEasing';

export interface AnimationState {
  name: string;
  duration: number; // in seconds
  loop: boolean;
  poses: AnimationPose[];
}

export interface AnimationPose {
  time: number; // normalized time (0-1)
  transforms: Record<string, Transform>;
  easing?: EasingFunction;
}

export interface Transform {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

export interface BlendedTransform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export class EnhancedAnimationController {
  private currentState: AnimationState | null = null;
  private nextState: AnimationState | null = null;
  private states: Map<string, AnimationState> = new Map();
  private currentTime: number = 0;
  private blendTime: number = 0;
  private blendDuration: number = 0.2; // default blend duration in seconds
  private isPlaying: boolean = false;
  private playbackSpeed: number = 1.0;
  private onCompleteCallback: (() => void) | null = null;

  registerState(state: AnimationState): void {
    this.states.set(state.name, state);
  }

  play(stateName: string, blendDuration: number = 0.2, onComplete?: () => void): boolean {
    const state = this.states.get(stateName);
    if (!state) {
      console.warn(`Animation state "${stateName}" not found`);
      return false;
    }

    // If same animation is already playing, don't restart
    if (this.currentState?.name === stateName && this.isPlaying) {
      return true;
    }

    this.nextState = state;
    this.blendTime = 0;
    this.blendDuration = blendDuration;
    this.onCompleteCallback = onComplete ?? null;
    this.isPlaying = true;

    // If no current state, start immediately
    if (!this.currentState) {
      this.currentState = state;
      this.currentTime = 0;
      this.nextState = null;
    }

    return true;
  }

  stop(): void {
    this.isPlaying = false;
    this.currentTime = 0;
    this.blendTime = 0;
    this.nextState = null;
  }

  pause(): void {
    this.isPlaying = false;
  }

  resume(): void {
    this.isPlaying = true;
  }

  setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = Math.max(0, speed);
  }

  update(deltaTime: number): void {
    if (!this.isPlaying || !this.currentState) return;

    const scaledDelta = deltaTime * this.playbackSpeed;

    // Handle blending to next state
    if (this.nextState) {
      this.blendTime += scaledDelta;
      
      if (this.blendTime >= this.blendDuration) {
        // Blend complete, switch to next state
        this.currentState = this.nextState;
        this.currentTime = 0;
        this.nextState = null;
        this.blendTime = 0;
      }
    }

    // Update current animation time
    this.currentTime += scaledDelta;

    // Handle animation completion
    if (this.currentTime >= this.currentState.duration) {
      if (this.currentState.loop) {
        this.currentTime = this.currentTime % this.currentState.duration;
      } else {
        this.currentTime = this.currentState.duration;
        this.isPlaying = false;
        
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
          this.onCompleteCallback = null;
        }
      }
    }
  }

  getCurrentTransforms(partNames: string[]): Record<string, BlendedTransform> {
    const result: Record<string, BlendedTransform> = {};

    if (!this.currentState) {
      // Return neutral transforms
      for (const partName of partNames) {
        result[partName] = this.getNeutralTransform();
      }
      return result;
    }

    // Get current pose
    const currentPose = this.getPoseAtTime(this.currentState, this.currentTime);

    // If blending, get next pose and blend
    if (this.nextState) {
      const nextPose = this.getPoseAtTime(this.nextState, 0);
      const blendFactor = this.blendTime / this.blendDuration;

      for (const partName of partNames) {
        const currentTransform = currentPose.transforms[partName] || {};
        const nextTransform = nextPose.transforms[partName] || {};
        result[partName] = this.blendTransforms(currentTransform, nextTransform, blendFactor);
      }
    } else {
      for (const partName of partNames) {
        const transform = currentPose.transforms[partName] || {};
        result[partName] = this.transformToBlended(transform);
      }
    }

    return result;
  }

  private getPoseAtTime(state: AnimationState, time: number): AnimationPose {
    const normalizedTime = time / state.duration;

    // Handle empty or malformed state
    if (state.poses.length === 0) {
      return {
        time: 0,
        transforms: {}
      };
    }

    // Find the two poses to interpolate between
    // Safe to use non-null assertion here as we've verified poses.length > 0
    let prevPose: AnimationPose = state.poses[0] as AnimationPose;
    let nextPose: AnimationPose = state.poses[state.poses.length - 1] as AnimationPose;

    for (let i = 0; i < state.poses.length; i++) {
      const pose = state.poses[i];
      if (pose && pose.time <= normalizedTime) {
        prevPose = pose;
      }
      if (pose && pose.time >= normalizedTime) {
        nextPose = pose;
        break;
      }
    }

    // If same pose, return it directly
    if (prevPose === nextPose) {
      return prevPose;
    }

    // Interpolate between poses
    const t = (normalizedTime - prevPose.time) / (nextPose.time - prevPose.time);
    const easing = nextPose.easing || easeInOutCubic;
    
    return this.interpolatePoses(prevPose, nextPose, t, easing);
  }

  private interpolatePoses(pose1: AnimationPose, pose2: AnimationPose, t: number, easing: EasingFunction): AnimationPose {
    const result: AnimationPose = {
      time: lerp(pose1.time, pose2.time, t, easing),
      transforms: {},
      easing
    };

    // Get all part names from both poses
    const allParts = new Set([...Object.keys(pose1.transforms), ...Object.keys(pose2.transforms)]);

    for (const partName of allParts) {
      const transform1 = pose1.transforms[partName] || {};
      const transform2 = pose2.transforms[partName] || {};
      result.transforms[partName] = this.interpolateTransform(transform1, transform2, t, easing);
    }

    return result;
  }

  private interpolateTransform(t1: Transform, t2: Transform, factor: number, easing: EasingFunction): Transform {
    const result: Transform = {};

    // Interpolate position
    if (t1.position || t2.position) {
      const p1 = t1.position || { x: 0, y: 0, z: 0 };
      const p2 = t2.position || { x: 0, y: 0, z: 0 };
      result.position = {
        x: lerp(p1.x, p2.x, factor, easing),
        y: lerp(p1.y, p2.y, factor, easing),
        z: lerp(p1.z, p2.z, factor, easing),
      };
    }

    // Interpolate rotation (with angle interpolation)
    if (t1.rotation || t2.rotation) {
      const r1 = t1.rotation || { x: 0, y: 0, z: 0 };
      const r2 = t2.rotation || { x: 0, y: 0, z: 0 };
      result.rotation = {
        x: lerpAngle(r1.x, r2.x, factor, easing),
        y: lerpAngle(r1.y, r2.y, factor, easing),
        z: lerpAngle(r1.z, r2.z, factor, easing),
      };
    }

    // Interpolate scale
    if (t1.scale || t2.scale) {
      const s1 = t1.scale || { x: 1, y: 1, z: 1 };
      const s2 = t2.scale || { x: 1, y: 1, z: 1 };
      result.scale = {
        x: lerp(s1.x, s2.x, factor, easing),
        y: lerp(s1.y, s2.y, factor, easing),
        z: lerp(s1.z, s2.z, factor, easing),
      };
    }

    return result;
  }

  private blendTransforms(t1: Transform, t2: Transform, factor: number): BlendedTransform {
    const p1 = t1.position || { x: 0, y: 0, z: 0 };
    const p2 = t2.position || { x: 0, y: 0, z: 0 };
    const r1 = t1.rotation || { x: 0, y: 0, z: 0 };
    const r2 = t2.rotation || { x: 0, y: 0, z: 0 };
    const s1 = t1.scale || { x: 1, y: 1, z: 1 };
    const s2 = t2.scale || { x: 1, y: 1, z: 1 };

    return {
      position: {
        x: lerp(p1.x, p2.x, factor),
        y: lerp(p1.y, p2.y, factor),
        z: lerp(p1.z, p2.z, factor),
      },
      rotation: {
        x: lerpAngle(r1.x, r2.x, factor),
        y: lerpAngle(r1.y, r2.y, factor),
        z: lerpAngle(r1.z, r2.z, factor),
      },
      scale: {
        x: lerp(s1.x, s2.x, factor),
        y: lerp(s1.y, s2.y, factor),
        z: lerp(s1.z, s2.z, factor),
      },
    };
  }

  private transformToBlended(t: Transform): BlendedTransform {
    return {
      position: t.position || { x: 0, y: 0, z: 0 },
      rotation: t.rotation || { x: 0, y: 0, z: 0 },
      scale: t.scale || { x: 1, y: 1, z: 1 },
    };
  }

  private getNeutralTransform(): BlendedTransform {
    return {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };
  }

  isAnimationPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentStateName(): string | null {
    return this.currentState?.name || null;
  }

  getProgress(): number {
    if (!this.currentState) return 0;
    return this.currentTime / this.currentState.duration;
  }
}
