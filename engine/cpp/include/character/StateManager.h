#pragma once

#include "../AnimationComponent.h"
#include "../input/InputHandler.h"

namespace LegendsEngine {

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
