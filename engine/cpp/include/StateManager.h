#pragma once

#include "AnimationComponent.h"
#include "InputHandler.h"

namespace LegendsEngine {

/**
 * StateManager - Character state machine for managing animation transitions
 * 
 * This class implements the state machine logic that determines which animation
 * state the character should be in based on current input and game state.
 * 
 * DESIGN PHILOSOPHY:
 * - Input-driven: Animation states follow player intent
 * - Priority-based: Attack > Jump > Movement > Idle
 * - Validation: Not all transitions are valid (e.g., can't attack during death)
 * - Platform-agnostic: Same logic for PC, mobile, tablet
 * 
 * STATE PRIORITY:
 * 1. Attack actions (highest priority)
 * 2. Jump/dodge actions
 * 3. Movement (walk/run/sprint)
 * 4. Idle states (lowest priority)
 */
class StateManager {
public:
    StateManager() = default;
    ~StateManager() = default;

    /**
     * GetNextState - Determine the next animation state based on input
     * 
     * This method implements the state machine logic:
     * - MOVE_FORWARD + normal speed → WALK
     * - MOVE_FORWARD + SPRINT → SPRINT (RUN in the enum)
     * - No movement → IDLE_CALM
     * - ATTACK → ATTACK placeholder (LIGHT_COMBO)
     * - JUMP → JUMP placeholder (not in current enum, use DODGE_AIR)
     * 
     * Priority order: attack > jump > movement > idle
     * 
     * TODO: Implement state interruption logic:
     * - Some states can be interrupted (e.g., walk can be interrupted by attack)
     * - Some states cannot be interrupted (e.g., death animation)
     * - Heavy attacks may have longer commitment windows
     * - Parry/counter windows require precise timing
     * 
     * TODO: Add animation blending support:
     * - Smooth transitions between locomotion states
     * - Blend time varies by transition type
     * - Combat transitions may be instant (no blend)
     * - Turn-in-place blending for direction changes
     * 
     * @param current The current animation state
     * @param input The current input state for this frame
     * @return The next animation state to transition to
     */
    AnimationState GetNextState(AnimationState current, const InputState& input);

    /**
     * CanTransition - Validate whether a state transition is allowed
     * 
     * Not all state transitions are valid. For example:
     * - Cannot transition from DEATH to any other state
     * - Cannot interrupt certain attack animations
     * - Cannot dodge while already dodging
     * 
     * This method enforces state machine rules and prevents invalid transitions.
     * 
     * TODO: Implement comprehensive transition validation:
     * - Death state is terminal (no transitions out)
     * - Heavy attacks have longer commitment windows
     * - Parry/counter states have specific transition rules
     * - Hit reactions may force specific state transitions
     * - Animation priority system (can high-priority interrupt low-priority?)
     * 
     * @param from The state transitioning from
     * @param to The state attempting to transition to
     * @return true if the transition is valid, false otherwise
     */
    bool CanTransition(AnimationState from, AnimationState to);

private:
    /**
     * HasMovementInput - Helper to check if any movement input is active
     * 
     * @param input The input state to check
     * @return true if any directional input is pressed
     */
    bool HasMovementInput(const InputState& input);
};

} // namespace LegendsEngine
