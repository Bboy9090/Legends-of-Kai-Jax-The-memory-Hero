#include "../include/StateManager.h"
#include <iostream>

namespace LegendsEngine {

AnimationState StateManager::GetNextState(AnimationState current, const InputState& input) {
    // Priority 1: Attack actions (highest priority)
    // If attack button is pressed, transition to attack state
    if (input.attack) {
        // TODO: Implement combo system and attack variation selection
        // For now, use LIGHT_COMBO as the default attack state
        if (CanTransition(current, AnimationState::LIGHT_COMBO)) {
            std::cout << "StateManager: Attack input detected, transitioning to LIGHT_COMBO" << std::endl;
            return AnimationState::LIGHT_COMBO;
        }
    }

    // Priority 2: Jump/dodge actions
    // If jump button is pressed, transition to dodge/jump state
    if (input.jump) {
        // TODO: Determine if character is grounded or airborne
        // For now, use DODGE_AIR as placeholder for jump
        if (CanTransition(current, AnimationState::DODGE_AIR)) {
            std::cout << "StateManager: Jump input detected, transitioning to DODGE_AIR" << std::endl;
            return AnimationState::DODGE_AIR;
        }
    }

    // Priority 3: Movement states
    // Check if there's any movement input
    if (HasMovementInput(input)) {
        // If sprinting, use SPRINT state (mapped to RUN in the enum)
        if (input.sprint && input.moveForward) {
            if (CanTransition(current, AnimationState::SPRINT)) {
                std::cout << "StateManager: Sprint movement detected, transitioning to SPRINT" << std::endl;
                return AnimationState::SPRINT;
            }
        }
        
        // If moving forward at normal speed, use WALK state
        if (input.moveForward) {
            if (CanTransition(current, AnimationState::WALK)) {
                std::cout << "StateManager: Forward movement detected, transitioning to WALK" << std::endl;
                return AnimationState::WALK;
            }
        }
        
        // For backward/strafe movement, also use WALK
        // TODO: Implement directional movement states if needed
        if (input.moveBackward || input.moveLeft || input.moveRight) {
            if (CanTransition(current, AnimationState::WALK)) {
                std::cout << "StateManager: Directional movement detected, transitioning to WALK" << std::endl;
                return AnimationState::WALK;
            }
        }
    }

    // Priority 4: Idle state (lowest priority, default)
    // If no input is detected, transition to idle
    if (!HasMovementInput(input) && !input.attack && !input.jump) {
        if (CanTransition(current, AnimationState::IDLE_CALM)) {
            // Only log if we're actually changing state to avoid spam
            if (current != AnimationState::IDLE_CALM) {
                std::cout << "StateManager: No input detected, transitioning to IDLE_CALM" << std::endl;
            }
            return AnimationState::IDLE_CALM;
        }
    }

    // If no valid transition found, stay in current state
    return current;
}

bool StateManager::CanTransition(AnimationState from, AnimationState to) {
    // Rule 1: DEATH state is terminal - cannot transition out
    if (from == AnimationState::DEATH) {
        return false;
    }

    // Rule 2: Cannot transition to the same state (already there)
    if (from == to) {
        return false;
    }

    // TODO: Implement more comprehensive transition validation:
    // 
    // Rule 3: Combat state interruption rules
    // - LIGHT_COMBO can be interrupted by dodge or another attack (combo)
    // - HEAVY_COMBO has longer commitment, may not be interruptible mid-animation
    // - SPECIAL_ATTACKS cannot be interrupted once started
    // - FINISHER cannot be interrupted
    // 
    // Rule 4: Hit reaction rules
    // - HIT_REACTIONS can be interrupted by dodge on successful recovery
    // - Cannot attack during hit reaction without recovery
    // 
    // Rule 5: Parry/counter timing windows
    // - PARRY has specific frame windows for counter transitions
    // - COUNTER cannot be interrupted once triggered
    // 
    // Rule 6: Dodge state rules
    // - Cannot dodge while already dodging (no spam)
    // - DODGE_GROUND and DODGE_AIR have different recovery windows
    // 
    // For now, allow most transitions except from DEATH
    return true;
}

bool StateManager::HasMovementInput(const InputState& input) {
    return input.moveForward || input.moveBackward || 
           input.moveLeft || input.moveRight;
}

} // namespace LegendsEngine
