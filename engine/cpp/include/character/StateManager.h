#pragma once

#include "../AnimationComponent.h"
#include "../input/InputHandler.h"

namespace LegendsEngine {

/**
 * AnimationProgress - Tracks the current progress of an animation
 * Used to determine if a state can be interrupted
 */
struct AnimationProgress {
    float currentTime = 0.0f;      // Current playback time in seconds
    float duration = 1.0f;         // Total animation duration in seconds
    bool isComplete = false;       // True if animation has finished playing
    
    /**
     * Get the normalized progress (0.0 to 1.0)
     */
    float GetNormalizedProgress() const {
        if (duration <= 0.0f) return 1.0f;
        float progress = currentTime / duration;
        return progress > 1.0f ? 1.0f : progress; // Clamp to [0.0, 1.0]
    }
    
    /**
     * Check if animation is in a specific progress window
     */
    bool IsInWindow(float minProgress, float maxProgress) const {
        float progress = GetNormalizedProgress();
        return progress >= minProgress && progress <= maxProgress;
    }
};

/**
 * AnimationBlendState - Tracks blending between two animation states
 * Used for smooth transitions between animations
 */
struct AnimationBlendState {
    AnimationState fromState = AnimationState::IDLE_CALM;
    AnimationState toState = AnimationState::IDLE_CALM;
    float blendTime = 0.0f;          // Total time for blend
    float currentBlendTime = 0.0f;   // Current blend progress
    bool isBlending = false;         // True if currently blending
    
    /**
     * Get the blend weight (0.0 = fully fromState, 1.0 = fully toState)
     */
    float GetBlendWeight() const {
        if (blendTime <= 0.0f || !isBlending) return 1.0f;
        float weight = currentBlendTime / blendTime;
        return weight > 1.0f ? 1.0f : weight; // Clamp to [0.0, 1.0]
    }
    
    /**
     * Check if blend is complete
     */
    bool IsComplete() const {
        return !isBlending || currentBlendTime >= blendTime;
    }
};

/**
 * StateManager - Manages character state transitions based on input
 * 
 * This class determines which animation state a character should be in
 * based on the current input and validates state transitions.
 * 
 * DESIGN PHILOSOPHY:
 * - Input-driven: Animation state is determined by player input
 * - Platform-agnostic: Same logic regardless of input source
 * - Rule-based: Clear priority and transition rules
 * 
 * STATE PRIORITY:
 * 1. Attack actions (highest priority)
 * 2. Jump actions
 * 3. Movement (sprint > run > walk)
 * 4. Idle (lowest priority)
 * 
 * TRANSITION VALIDATION:
 * - Some states can be interrupted (e.g., movement)
 * - Some states must complete (e.g., attack animations)
 * - Some transitions are invalid (e.g., death to any other state)
 * 
 * STATE INTERRUPTION:
 * - Priority-based: Higher priority actions can interrupt lower priority
 * - Window-based: Some animations have interruptible windows
 * - Attack combos can be interrupted after hit confirmation
 * - Movement can always be interrupted
 */
class StateManager {
public:
    StateManager() = default;
    ~StateManager() = default;

    // Disable copy/move
    StateManager(const StateManager&) = delete;
    StateManager& operator=(const StateManager&) = delete;
    StateManager(StateManager&&) = delete;
    StateManager& operator=(StateManager&&) = delete;

    /**
     * Get the next animation state based on current state and input
     * 
     * Determines which animation state the character should transition to
     * based on the current state and player input.
     * 
     * Priority order:
     * - ATTACK input → LIGHT_COMBO (placeholder for attack system)
     * - JUMP input → IDLE_CALM (placeholder for jump system)
     * - MOVE_FORWARD + SPRINT → SPRINT
     * - MOVE_FORWARD → WALK
     * - No movement → IDLE_CALM
     * 
     * @param current The current animation state
     * @param input The current input state
     * @return The animation state the character should transition to
     */
    AnimationState GetNextState(AnimationState current, const InputState& input);

    /**
     * Check if a state transition is valid
     * 
     * Validates whether the character can transition from one state to another.
     * Some states must complete before transitioning (e.g., attack animations),
     * while others can be interrupted freely (e.g., movement).
     * 
     * @param from The current animation state
     * @param to The desired animation state
     * @return true if the transition is valid, false otherwise
     */
    bool CanTransition(AnimationState from, AnimationState to);

    /**
     * Check if a state can be interrupted based on animation progress
     * 
     * Determines if the current state can be interrupted by a new state,
     * taking into account animation progress and priority rules.
     * 
     * @param currentState The current animation state
     * @param desiredState The desired animation state
     * @param progress The current animation progress
     * @return true if the state can be interrupted, false otherwise
     */
    bool CanInterrupt(AnimationState currentState, AnimationState desiredState, 
                     const AnimationProgress& progress);
     * Get the blend time for transitioning between two states
     * 
     * Returns the time in seconds that should be used to blend from one
     * animation state to another for smooth transitions.
     * 
     * @param from The current animation state
     * @param to The desired animation state
     * @return Blend time in seconds
     */
    float GetBlendTime(AnimationState from, AnimationState to) const;

    /**
     * Update animation progress tracking
     * 

     * @param deltaTime Time elapsed since last frame in seconds
     */
    void UpdateProgress(float deltaTime);

    /**
     * Get current animation progress
     */
    const AnimationProgress& GetCurrentProgress() const { return currentProgress; }

    /**
     * Set animation progress (called when transitioning to a new state)
     * 
     * @param state The state to set progress for
     * @param duration The duration of the animation in seconds
     */
    void SetAnimationDuration(AnimationState state, float duration);

    /**
     * Get the blend time for a specific state transition
     * 
     * @param from The state transitioning from
     * @param to The state transitioning to
     * @return The blend time in seconds
     */
    float GetBlendTime(AnimationState from, AnimationState to) const;

    /**
     * Start a blend transition between two states
     * 
     * @param from The state transitioning from
     * @param to The state transitioning to
     */
    void StartBlend(AnimationState from, AnimationState to);

    /**
     * Update blend state
     * 
     * @param deltaTime Time elapsed since last frame in seconds
     */
    void UpdateBlend(float deltaTime);

    /**
     * Get current blend state
     */
    const AnimationBlendState& GetBlendState() const { return blendState; }

private:
    AnimationProgress currentProgress;
    AnimationState trackedState = AnimationState::IDLE_CALM;
    AnimationBlendState blendState;

    /**
     * Get the priority level of a state (higher = more important)
     */
    int GetStatePriority(AnimationState state) const;

    /**
     * Check if a state is interruptible at the current progress
     */
    bool IsStateInterruptible(AnimationState state, const AnimationProgress& progress) const;

     * Updates the internal tracking of animation progress, which is used
     * for determining if states can be interrupted.
     * 
     * @param state The current animation state
     * @param progress Animation progress (0.0 = start, 1.0 = complete)
     */
    void UpdateAnimationProgress(AnimationState state, float progress);

    /**
     * Check if the current state can be interrupted based on animation progress
     * 
     * Some states can only be interrupted during specific windows in the animation.
     * This method checks if the current progress allows interruption.
     * 
     * @param state The animation state to check
     * @return true if the state can be interrupted at current progress
     */
    bool CanInterruptAtCurrentProgress(AnimationState state) const;

private:
    // Animation progress tracking (0.0 to 1.0)
    float currentAnimationProgress = 0.0f;
    AnimationState trackedState = AnimationState::IDLE_CALM;

};

} // namespace LegendsEngine
