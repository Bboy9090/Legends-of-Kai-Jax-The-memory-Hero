/**
 * CINEMATIC CAMERA SYSTEM - BEYOND BEYOND LEGENDARY
 * 
 * World-class camera system with:
 * - Dynamic camera movement
 * - Cinematic angles
 * - Slow-motion camera
 * - Impact zoom
 * - Dramatic framing
 */

import * as THREE from 'three';
import { LEGENDARY_COMBAT_CONSTANTS } from '@legends-of-kai-jax/shared';

export interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  rotation: THREE.Euler;
}

export interface CinematicShot {
  id: string;
  name: string;
  duration: number;
  cameraPath: Array<{
    time: number;
    position: THREE.Vector3;
    target: THREE.Vector3;
    fov: number;
  }>;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export class CinematicCameraSystem {
  private camera: THREE.PerspectiveCamera;
  private baseState: CameraState;
  private currentState: CameraState;
  private targetState: CameraState;
  private cinematicActive: boolean = false;
  private cinematicShot: CinematicShot | null = null;
  private cinematicTime: number = 0;
  private shakeOffset: THREE.Vector3 = new THREE.Vector3();
  private zoomActive: boolean = false;
  private zoomTarget: number = 0;
  private zoomDuration: number = 0;
  private zoomTime: number = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    
    // Store base state
    this.baseState = {
      position: camera.position.clone(),
      target: new THREE.Vector3(0, 0, 0),
      fov: camera.fov,
      rotation: camera.rotation.clone(),
    };
    
    this.currentState = { ...this.baseState };
    this.targetState = { ...this.baseState };
  }

  /**
   * Update camera (call every frame)
   */
  update(deltaTime: number, shakeOffset?: THREE.Vector3): void {
    // Apply shake
    if (shakeOffset) {
      this.shakeOffset.copy(shakeOffset);
    }

    // Update cinematic camera
    if (this.cinematicActive && this.cinematicShot) {
      this.updateCinematicCamera(deltaTime);
      return;
    }

    // Update zoom
    if (this.zoomActive) {
      this.updateZoom(deltaTime);
    }

    // Smooth camera movement
    this.currentState.position.lerp(this.targetState.position, 0.1);
    this.currentState.target.lerp(this.targetState.target, 0.1);
    
    // Apply to camera
    this.camera.position.copy(this.currentState.position).add(this.shakeOffset);
    this.camera.lookAt(this.currentState.target);
    this.camera.fov = this.currentState.fov;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Trigger impact zoom
   */
  triggerImpactZoom(intensity: number = 1.2, duration: number = 200): void {
    if (!LEGENDARY_COMBAT_CONSTANTS.CAMERA.ZOOM_ON_HIT) return;

    this.zoomActive = true;
    this.zoomTarget = this.baseState.fov / intensity;
    this.zoomDuration = duration;
    this.zoomTime = 0;
  }

  /**
   * Update zoom animation
   */
  private updateZoom(deltaTime: number): void {
    this.zoomTime += deltaTime * 1000; // Convert to ms
    
    if (this.zoomTime >= this.zoomDuration) {
      this.zoomActive = false;
      this.currentState.fov = this.baseState.fov;
      return;
    }

    const progress = this.zoomTime / this.zoomDuration;
    const easeProgress = this.easeInOut(progress);
    
    // Zoom in then zoom out
    if (progress < 0.5) {
      this.currentState.fov = THREE.MathUtils.lerp(this.baseState.fov, this.zoomTarget, easeProgress * 2);
    } else {
      this.currentState.fov = THREE.MathUtils.lerp(this.zoomTarget, this.baseState.fov, (easeProgress - 0.5) * 2);
    }
  }

  /**
   * Start cinematic shot
   */
  startCinematicShot(shot: CinematicShot): void {
    if (!LEGENDARY_COMBAT_CONSTANTS.CAMERA.CINEMATIC_ENABLED) return;

    this.cinematicActive = true;
    this.cinematicShot = shot;
    this.cinematicTime = 0;
  }

  /**
   * Update cinematic camera
   */
  private updateCinematicCamera(deltaTime: number): void {
    if (!this.cinematicShot) return;

    this.cinematicTime += deltaTime * 1000; // Convert to ms

    if (this.cinematicTime >= this.cinematicShot.duration) {
      this.cinematicActive = false;
      this.cinematicShot = null;
      this.currentState = { ...this.baseState };
      return;
    }

    const progress = this.cinematicTime / this.cinematicShot.duration;
    const easedProgress = this.applyEasing(progress, this.cinematicShot.easing);

    // Interpolate between camera path points
    const path = this.cinematicShot.cameraPath;
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      
      if (progress >= current.time && progress <= next.time) {
        const localProgress = (progress - current.time) / (next.time - current.time);
        const localEased = this.applyEasing(localProgress, this.cinematicShot.easing);

        this.currentState.position.lerpVectors(current.position, next.position, localEased);
        this.currentState.target.lerpVectors(current.target, next.target, localEased);
        this.currentState.fov = THREE.MathUtils.lerp(current.fov, next.fov, localEased);
        break;
      }
    }
  }

  /**
   * Create cinematic shot for ultimate
   */
  createUltimateShot(position: THREE.Vector3): CinematicShot {
    return {
      id: 'ultimate_shot',
      name: 'Ultimate Activation',
      duration: LEGENDARY_COMBAT_CONSTANTS.CAMERA.CINEMATIC_DURATION,
      easing: 'easeInOut',
      cameraPath: [
        {
          time: 0,
          position: new THREE.Vector3(0, 5, 10),
          target: position.clone(),
          fov: 50,
        },
        {
          time: 0.3,
          position: new THREE.Vector3(5, 3, 5),
          target: position.clone(),
          fov: 40,
        },
        {
          time: 0.7,
          position: new THREE.Vector3(-5, 8, 8),
          target: position.clone(),
          fov: 35,
        },
        {
          time: 1.0,
          position: this.baseState.position.clone(),
          target: position.clone(),
          fov: this.baseState.fov,
        },
      ],
    };
  }

  /**
   * Create cinematic shot for perfect parry
   */
  createPerfectParryShot(position: THREE.Vector3): CinematicShot {
    return {
      id: 'perfect_parry_shot',
      name: 'Perfect Parry',
      duration: 1000, // 1 second
      easing: 'easeOut',
      cameraPath: [
        {
          time: 0,
          position: new THREE.Vector3(0, 2, 5),
          target: position.clone(),
          fov: 45,
        },
        {
          time: 0.5,
          position: new THREE.Vector3(2, 1, 3),
          target: position.clone(),
          fov: 30,
        },
        {
          time: 1.0,
          position: this.baseState.position.clone(),
          target: position.clone(),
          fov: this.baseState.fov,
        },
      ],
    };
  }

  /**
   * Apply easing function
   */
  private applyEasing(t: number, easing: string): number {
    switch (easing) {
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return t * (2 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default:
        return t;
    }
  }

  /**
   * Ease in-out function
   */
  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Reset camera to base state
   */
  reset(): void {
    this.cinematicActive = false;
    this.cinematicShot = null;
    this.zoomActive = false;
    this.currentState = { ...this.baseState };
    this.targetState = { ...this.baseState };
    this.shakeOffset.set(0, 0, 0);
  }
}
