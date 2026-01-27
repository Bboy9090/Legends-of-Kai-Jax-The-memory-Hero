/**
 * Animation Player - Three.js Integration
 * 
 * Binds AnimationStateMachine to Three.js AnimationMixer for playback.
 * Enforces governance rules from kai_jax.character.json:
 * - Min 12 frames per action
 * - LOD animation selection (LOD0=full, LOD2=simplified)
 * - Tail physics updates per frame
 * - No animation timing alterations per platform
 * 
 * References:
 * - kai_jax.character.json: animation.frame_rules, rigging.extra_bones.tails
 * - README_CANON.md: Animation timing never altered per platform
 */

import * as THREE from 'three';
import { AnimationStateType, AnimationStateMetadata } from '../character/AnimationStateMachine';

/**
 * LOD (Level of Detail) target
 */
export enum LODLevel {
  LOD0 = 0, // Full detail - all animations
  LOD1 = 1, // Medium detail - simplified secondary animations
  LOD2 = 2, // Low detail - essential animations only
}

/**
 * Tail physics update configuration
 */
interface TailPhysicsConfig {
  enabled: boolean;
  tailCount: number; // Must be 9 per governance
  bonesPerTail: number;
  springConstant: number;
  damping: number;
  gravity: number;
}

/**
 * Animation Player for Three.js
 * 
 * Handles:
 * - Binding Three.js AnimationAction to AnimationStateType
 * - Animation blending between states
 * - LOD animation selection
 * - Tail physics updates per frame
 * - Frame minimum enforcement (12 frames min)
 */
export class AnimationPlayer {
  private mixer: THREE.AnimationMixer;
  private character: THREE.Group;
  private animations: Map<AnimationStateType, THREE.AnimationClip>;
  private currentAction: THREE.AnimationAction | null = null;
  private currentState: AnimationStateType | null = null;
  private lodLevel: LODLevel = LODLevel.LOD0;
  private tailPhysicsConfig: TailPhysicsConfig;
  private frameCount: number = 0;

  constructor(
    character: THREE.Group,
    animations?: Map<AnimationStateType, THREE.AnimationClip>,
    lodLevel: LODLevel = LODLevel.LOD0
  ) {
    this.character = character;
    this.mixer = new THREE.AnimationMixer(character);
    this.animations = animations || new Map();
    this.lodLevel = lodLevel;

    // Initialize tail physics per kai_jax.character.json
    this.tailPhysicsConfig = {
      enabled: true,
      tailCount: 9, // Governance: Must be 9
      bonesPerTail: 6, // Average from spec (5-7 range)
      springConstant: 0.5,
      damping: 0.8,
      gravity: 0.2,
    };
  }

  /**
   * Register animation clip for a state
   * 
   * @param state - Animation state type
   * @param clip - Three.js animation clip
   */
  public registerAnimation(state: AnimationStateType, clip: THREE.AnimationClip): void {
    // Validate clip duration against min frames rule (12 frames at 60fps = 0.2s)
    const minDuration = 12 / 60;
    if (clip.duration < minDuration && !this.isLoopingState(state)) {
      console.warn(
        `[AnimationPlayer] Animation "${clip.name}" for state ${state} is shorter than minimum 12 frames (${clip.duration}s < ${minDuration}s)`
      );
    }

    this.animations.set(state, clip);
  }

  /**
   * Check if state should loop
   */
  private isLoopingState(state: AnimationStateType): boolean {
    return (
      state === AnimationStateType.IDLE_CALM ||
      state === AnimationStateType.IDLE_COMBAT ||
      state === AnimationStateType.WALK ||
      state === AnimationStateType.RUN ||
      state === AnimationStateType.SPRINT ||
      state === AnimationStateType.FALL
    );
  }

  /**
   * Play animation for given state with blending
   * 
   * @param state - Target animation state
   * @param metadata - Animation metadata from state machine
   */
  public playState(state: AnimationStateType, metadata: AnimationStateMetadata): void {
    // Skip if already playing this state
    if (this.currentState === state && this.currentAction?.isRunning()) {
      return;
    }

    // Get animation clip (with LOD fallback)
    const clip = this.getAnimationClip(state);
    if (!clip) {
      console.warn(`[AnimationPlayer] No animation clip for state: ${state}`);
      return;
    }

    // Create action from clip
    const action = this.mixer.clipAction(clip);

    // Configure action based on metadata
    action.clampWhenFinished = !metadata.looping;
    action.loop = metadata.looping ? THREE.LoopRepeat : THREE.LoopOnce;
    action.timeScale = metadata.speed;

    // Handle root motion (for finishers, knockdowns)
    if (metadata.rootMotion) {
      // Enable root motion in Three.js (would need custom implementation)
      // For now, just note it's enabled
      action.setEffectiveWeight(1);
    }

    // Blend transition
    if (this.currentAction) {
      this.currentAction.fadeOut(metadata.blendDuration);
    }

    action.reset();
    action.fadeIn(metadata.blendDuration);
    action.play();

    // Update state
    this.currentAction = action;
    this.currentState = state;
    this.frameCount = 0;

    console.log(`[AnimationPlayer] Playing: ${state} (blend: ${metadata.blendDuration}s)`);
  }

  /**
   * Get animation clip with LOD fallback
   * 
   * LOD0: Full animations
   * LOD1: Simplified secondary animations
   * LOD2: Essential animations only (idle, walk, attack)
   */
  private getAnimationClip(state: AnimationStateType): THREE.AnimationClip | undefined {
    // Check if animation exists for current LOD
    const clip = this.animations.get(state);
    
    if (!clip && this.lodLevel >= LODLevel.LOD1) {
      // Fallback for LOD1+: Use simpler animation
      return this.getLODFallbackClip(state);
    }

    return clip;
  }

  /**
   * Get LOD fallback clip for simplified animations
   */
  private getLODFallbackClip(state: AnimationStateType): THREE.AnimationClip | undefined {
    // LOD2: Essential animations only
    if (this.lodLevel === LODLevel.LOD2) {
      switch (state) {
        case AnimationStateType.RUN:
        case AnimationStateType.SPRINT:
          return this.animations.get(AnimationStateType.WALK);
        
        case AnimationStateType.ATTACK_2:
        case AnimationStateType.ATTACK_3:
        case AnimationStateType.ATTACK_HEAVY:
          return this.animations.get(AnimationStateType.ATTACK_1);
        
        case AnimationStateType.DODGE_AIR:
          return this.animations.get(AnimationStateType.DODGE_GROUND);
        
        default:
          return undefined;
      }
    }

    return undefined;
  }

  /**
   * Update animation mixer and tail physics
   * 
   * @param deltaTime - Time since last frame
   */
  public update(deltaTime: number): void {
    this.frameCount++;
    
    // Update Three.js animation mixer
    this.mixer.update(deltaTime);

    // Update tail physics
    if (this.tailPhysicsConfig.enabled) {
      this.updateTailPhysics(deltaTime);
    }
  }

  /**
   * Update tail physics per frame
   * 
   * Simulates physics for 9 tails following kai_jax.character.json constraints:
   * - 9 tails (governance rule)
   * - Physics-enabled bones
   * - Swing and twist limits
   * - No noodle physics (enforced)
   */
  private updateTailPhysics(deltaTime: number): void {
    // Find tail bones in character skeleton
    this.character.traverse((child) => {
      if (child instanceof THREE.Bone) {
        const boneName = child.name.toLowerCase();
        
        // Check if this is a tail bone (e.g., "tail_1_bone_3")
        if (boneName.includes('tail')) {
          this.updateTailBone(child, deltaTime);
        }
      }
    });
  }

  /**
   * Update individual tail bone physics
   */
  private updateTailBone(bone: THREE.Bone, deltaTime: number): void {
    // Simple spring physics for tail movement
    // In production, this would use a proper physics engine
    
    const { springConstant, damping, gravity } = this.tailPhysicsConfig;
    
    // Apply gravity
    const gravityForce = new THREE.Vector3(0, -gravity * deltaTime, 0);
    
    // Calculate spring force (towards rest position)
    const restRotation = new THREE.Quaternion(); // Default rotation
    const currentRotation = bone.quaternion;
    const springForce = new THREE.Quaternion();
    springForce.slerpQuaternions(currentRotation, restRotation, springConstant * deltaTime);
    
    // Apply damping
    const dampedRotation = new THREE.Quaternion();
    dampedRotation.slerpQuaternions(currentRotation, springForce, damping);
    
    // Update bone rotation (would be more complex in real implementation)
    bone.quaternion.copy(dampedRotation);
    
    // Enforce constraints per kai_jax.character.json
    // - swingLimit: rotation constraint
    // - twistLimit: twist constraint
    // - noodlePhysics: false (no excessive flexibility)
    this.enforceTailConstraints(bone);
  }

  /**
   * Enforce tail bone constraints
   * 
   * Per kai_jax.character.json:
   * - swingLimit: 60-180 degrees depending on tail
   * - twistLimit: 20-90 degrees depending on tail
   * - noodlePhysics: false (no jelly-like movement)
   */
  private enforceTailConstraints(bone: THREE.Bone): void {
    // Extract Euler angles from quaternion
    const euler = new THREE.Euler().setFromQuaternion(bone.quaternion);
    
    // Enforce swing limits (X and Z rotation)
    const maxSwing = THREE.MathUtils.degToRad(120); // Average swing limit
    euler.x = THREE.MathUtils.clamp(euler.x, -maxSwing, maxSwing);
    euler.z = THREE.MathUtils.clamp(euler.z, -maxSwing, maxSwing);
    
    // Enforce twist limit (Y rotation)
    const maxTwist = THREE.MathUtils.degToRad(45); // Average twist limit
    euler.y = THREE.MathUtils.clamp(euler.y, -maxTwist, maxTwist);
    
    // Apply constrained rotation
    bone.quaternion.setFromEuler(euler);
  }

  /**
   * Set LOD level
   * 
   * @param level - Target LOD level
   */
  public setLODLevel(level: LODLevel): void {
    this.lodLevel = level;
    console.log(`[AnimationPlayer] LOD level set to: ${level}`);
  }

  /**
   * Enable/disable tail physics
   */
  public setTailPhysicsEnabled(enabled: boolean): void {
    this.tailPhysicsConfig.enabled = enabled;
  }

  /**
   * Get current animation state
   */
  public getCurrentState(): AnimationStateType | null {
    return this.currentState;
  }

  /**
   * Get animation progress (0-1)
   */
  public getProgress(): number {
    if (!this.currentAction) return 0;
    
    const clip = this.currentAction.getClip();
    const time = this.currentAction.time;
    
    return clip.duration > 0 ? time / clip.duration : 0;
  }

  /**
   * Get frame count
   */
  public getFrameCount(): number {
    return this.frameCount;
  }

  /**
   * Check if current animation is finished
   */
  public isFinished(): boolean {
    if (!this.currentAction) return true;
    
    const clip = this.currentAction.getClip();
    const time = this.currentAction.time;
    
    return time >= clip.duration && !this.currentAction.loop;
  }

  /**
   * Stop all animations
   */
  public stopAll(): void {
    this.mixer.stopAllAction();
    this.currentAction = null;
    this.currentState = null;
    this.frameCount = 0;
  }

  /**
   * Reset animation player
   */
  public reset(): void {
    this.stopAll();
  }

  /**
   * Get Three.js animation mixer
   */
  public getMixer(): THREE.AnimationMixer {
    return this.mixer;
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.stopAll();
    this.animations.clear();
  }
}
