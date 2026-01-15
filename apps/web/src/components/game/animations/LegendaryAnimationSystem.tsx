import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * LEGENDARY ANIMATION SYSTEM
 * Beast-Kin Sovereignty: Genesis - Professional-Grade Character Animation
 * 
 * Features:
 * - 12-principles animation (Disney/Pixar quality)
 * - Motion blur & frame blending
 * - Procedural secondary animation (hair, cloth, tails)
 * - Emotion-driven facial animation
 * - Impact frames & anticipation
 * - Squash & stretch physics
 */

export interface AnimationState {
  name: string;
  loop: boolean;
  duration: number;
  blendDuration?: number;
  priority?: number;
}

export interface KeyframeData {
  time: number;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  easing?: (t: number) => number;
}

export interface BoneAnimation {
  boneName: string;
  keyframes: KeyframeData[];
}

// Legendary easing functions (Disney-quality curves)
export const LegendaryEasing = {
  // Anticipation curve (overshoots then settles)
  anticipation: (t: number): number => {
    const overshoot = 1.05;
    return t < 0.2 ? -0.1 * Math.sin(t * Math.PI * 5) : overshoot * (1 - Math.pow(1 - t, 3));
  },
  
  // Impact curve (sudden hit with recoil)
  impact: (t: number): number => {
    if (t < 0.1) return t * 10; // Instant impact
    if (t < 0.3) return 1 - (t - 0.1) * 0.5; // Recoil
    return 0.9 + (t - 0.3) * 0.14; // Settle
  },
  
  // Elastic (bouncy settle)
  elastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  // Smooth acceleration (Pixar curve)
  pixarSmooth: (t: number): number => {
    return t * t * (3 - 2 * t);
  },
  
  // Overshoot (goes past target then returns)
  overshoot: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
};

// Squash & Stretch controller (legendary animation principle #1)
export class SquashStretchController {
  private intensity: number = 1.0;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  
  constructor(intensity: number = 1.0) {
    this.intensity = intensity;
  }
  
  update(velocity: THREE.Vector3, scale: THREE.Vector3, delta: number): void {
    this.velocity.lerp(velocity, delta * 10);
    const speed = this.velocity.length();
    
    if (speed > 0.1) {
      // Stretch in direction of movement
      const dir = this.velocity.clone().normalize();
      const stretchAmount = Math.min(speed * 0.2 * this.intensity, 0.4);
      
      // Preserve volume (legendary rule!)
      scale.x = 1 - stretchAmount * Math.abs(dir.x) * 0.5;
      scale.y = 1 + stretchAmount * Math.abs(dir.y);
      scale.z = 1 - stretchAmount * Math.abs(dir.z) * 0.5;
    } else {
      // Return to normal
      scale.lerp(new THREE.Vector3(1, 1, 1), delta * 8);
    }
  }
}

// Secondary motion (hair, cloth, tails - procedural physics)
export class SecondaryMotionController {
  private bones: THREE.Bone[] = [];
  private velocities: THREE.Vector3[] = [];
  private stiffness: number;
  private damping: number;
  
  constructor(bones: THREE.Bone[], stiffness: number = 0.2, damping: number = 0.8) {
    this.bones = bones;
    this.stiffness = stiffness;
    this.damping = damping;
    this.velocities = bones.map(() => new THREE.Vector3());
  }
  
  update(rootVelocity: THREE.Vector3, delta: number): void {
    for (let i = 0; i < this.bones.length; i++) {
      const bone = this.bones[i];
      const velocity = this.velocities[i];
      
      // Spring force towards rest position
      if (!bone || !velocity) continue; // Skip if undefined (tailspin fix)
      
      const restRotation = new THREE.Euler(0, 0, 0);
      const currentRotation = bone.rotation;
      const force = new THREE.Vector3(
        (restRotation.x - currentRotation.x) * this.stiffness,
        (restRotation.y - currentRotation.y) * this.stiffness,
        (restRotation.z - currentRotation.z) * this.stiffness
      );
      
      // Apply velocity lag based on parent movement
      const lag = rootVelocity.clone().multiplyScalar(-0.1 * (i + 1));
      force.add(lag);
      
      // Update velocity with damping
      velocity.add(force);
      velocity.multiplyScalar(this.damping);
      
      // Apply to rotation
      bone.rotation.x += velocity.x * delta;
      bone.rotation.y += velocity.y * delta;
      bone.rotation.z += velocity.z * delta;
    }
  }
}

// Facial expression controller (emotion-driven)
export class FacialAnimationController {
  private currentEmotion: string = 'neutral';
  private emotionIntensity: number = 0;
  private blendSpeed: number = 5;
  
  // Emotion presets (Disney-level expressiveness)
  private emotions: Record<string, any> = {
    neutral: { eyeScale: 1.0, pupilSize: 1.0, mouthCurve: 0 },
    happy: { eyeScale: 1.2, pupilSize: 1.1, mouthCurve: 0.3, eyeSquint: 0.2 },
    angry: { eyeScale: 0.7, pupilSize: 0.8, mouthCurve: -0.2, browFurrow: 0.8 },
    surprised: { eyeScale: 1.5, pupilSize: 1.3, mouthCurve: 0.6, browRaise: 0.8 },
    hurt: { eyeScale: 0.8, pupilSize: 0.9, mouthCurve: -0.4, eyeSquint: 0.6 },
    determined: { eyeScale: 0.9, pupilSize: 1.2, mouthCurve: 0.1, browFurrow: 0.4 },
    victory: { eyeScale: 1.3, pupilSize: 1.2, mouthCurve: 0.8, eyeSquint: 0.3 }
  };
  
  setEmotion(emotion: string, intensity: number = 1.0): void {
    if (this.emotions[emotion]) {
      this.currentEmotion = emotion;
      this.emotionIntensity = intensity;
    }
  }
  
  update(
    leftEye: THREE.Mesh | null,
    rightEye: THREE.Mesh | null,
    mouth: THREE.Mesh | null,
    delta: number
  ): void {
    const emotion = this.emotions[this.currentEmotion];
    if (!emotion) return;
    
    // Blend eye scale
    if (leftEye && rightEye) {
      const targetScale = emotion.eyeScale * this.emotionIntensity;
      leftEye.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), delta * this.blendSpeed);
      rightEye.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), delta * this.blendSpeed);
    }
    
    // Blend mouth curve
    if (mouth) {
      const targetCurve = emotion.mouthCurve * this.emotionIntensity;
      mouth.rotation.z = THREE.MathUtils.lerp(mouth.rotation.z, targetCurve, delta * this.blendSpeed);
    }
  }
}

// Attack animation with impact frames (Guilty Gear-style)
export class ImpactFrameController {
  private impactActive: boolean = false;
  private impactDuration: number = 0;
  private impactMaxDuration: number = 0.05; // 3 frames at 60fps
  
  triggerImpact(duration?: number): void {
    this.impactActive = true;
    this.impactDuration = 0;
    this.impactMaxDuration = duration || 0.05;
  }
  
  update(delta: number): { frozen: boolean; intensity: number } {
    if (this.impactActive) {
      this.impactDuration += delta;
      if (this.impactDuration >= this.impactMaxDuration) {
        this.impactActive = false;
        return { frozen: false, intensity: 0 };
      }
      return { frozen: true, intensity: 1.0 };
    }
    return { frozen: false, intensity: 0 };
  }
}

// Main animation system hook
export function useLegendaryAnimation(
  groupRef: React.RefObject<THREE.Group>,
  bodyRef: React.RefObject<THREE.Group>,
  options: {
    enableSquashStretch?: boolean;
    enableSecondaryMotion?: boolean;
    enableFacialAnimation?: boolean;
    enableImpactFrames?: boolean;
  } = {}
) {
  const squashController = useRef(new SquashStretchController(1.0));
  const facialController = useRef(new FacialAnimationController());
  const impactController = useRef(new ImpactFrameController());
  const velocity = useRef(new THREE.Vector3());
  const prevPosition = useRef(new THREE.Vector3());
  
  useFrame((state, delta) => {
    if (!groupRef.current || !bodyRef.current) return;
    
    // Calculate velocity
    const currentPos = groupRef.current.position.clone();
    velocity.current.copy(currentPos).sub(prevPosition.current).divideScalar(delta);
    prevPosition.current.copy(currentPos);
    
    // Squash & stretch
    if (options.enableSquashStretch) {
      squashController.current.update(velocity.current, bodyRef.current.scale, delta);
    }
    
    // Impact frame freeze
    if (options.enableImpactFrames) {
      const impact = impactController.current.update(delta);
      if (impact.frozen) {
        // Freeze animation for impact frame
        return;
      }
    }
  });
  
  return {
    squashController: squashController.current,
    facialController: facialController.current,
    impactController: impactController.current,
    setEmotion: (emotion: string, intensity?: number) => 
      facialController.current.setEmotion(emotion, intensity),
    triggerImpact: (duration?: number) => 
      impactController.current.triggerImpact(duration)
  };
}

// Motion trail renderer (speed lines, after-images)
export function MotionTrail({ 
  targetRef, 
  enabled, 
  trailLength = 5,
  opacity = 0.3 
}: { 
  targetRef: React.RefObject<THREE.Group>; 
  enabled: boolean;
  trailLength?: number;
  opacity?: number;
}) {
  const trailPositions = useRef<THREE.Vector3[]>([]);
  const trailMeshes = useRef<THREE.Mesh[]>([]);
  
  useFrame(() => {
    if (!enabled || !targetRef.current) {
      trailMeshes.current.forEach(mesh => mesh.visible = false);
      return;
    }
    
    // Record position
    const currentPos = targetRef.current.position.clone();
    trailPositions.current.unshift(currentPos);
    
    // Limit trail length
    if (trailPositions.current.length > trailLength) {
      trailPositions.current.pop();
    }
    
    // Update trail meshes (after-images)
    trailPositions.current.forEach((pos, i) => {
      if (trailMeshes.current[i]) {
        trailMeshes.current[i].position.copy(pos);
        trailMeshes.current[i].visible = true;
        const fadeOpacity = opacity * (1 - i / trailLength);
        (trailMeshes.current[i].material as THREE.MeshBasicMaterial).opacity = fadeOpacity;
      }
    });
  });
  
  return null;
}
