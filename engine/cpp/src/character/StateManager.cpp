#include "../../include/character/StateManager.h"
#include <iostream>

namespace LegendsEngine {

AnimationState StateManager::GetNextState(AnimationState current, const InputState& input) {
    // Priority 1: Attack actions (highest priority)
    if (input.attack) {
        // TODO: Implement proper attack state machine
        // - Track combo counter
        // - Determine light vs heavy attack
        // - Handle special attacks
        // For now, transition to LIGHT_COMBO as placeholder
        if (CanTransition(current, AnimationState::LIGHT_COMBO)) {
            return AnimationState::LIGHT_COMBO;
        }
    }

    // Priority 2: Jump actions
    if (input.jump) {
        // TODO: Implement proper jump state machine
        // - Check if on ground vs in air
        // - Handle double jump
        // - Handle air attacks
        // For now, return IDLE_CALM as placeholder (jump not implemented)
        if (CanTransition(current, AnimationState::IDLE_CALM)) {
            return AnimationState::IDLE_CALM;
        }
    }

    // Priority 3: Movement
    // Check if any movement input is active
    bool hasMovement = input.moveForward || input.moveBackward || 
                       input.moveLeft || input.moveRight;

    if (hasMovement) {
        // Forward movement with sprint
        if (input.moveForward && input.sprint) {
            if (CanTransition(current, AnimationState::SPRINT)) {
                return AnimationState::SPRINT;
            }
        }
        
        // Forward movement (normal speed)
        if (input.moveForward) {
            if (CanTransition(current, AnimationState::WALK)) {
                return AnimationState::WALK;
            }
        }

        // TODO: Implement backward/strafe movement animations
        // - moveBackward → WALK_BACKWARD
        // - moveLeft/moveRight → STRAFE_LEFT/STRAFE_RIGHT
        // For now, treat all movement as forward walk
        if (CanTransition(current, AnimationState::WALK)) {
            return AnimationState::WALK;
        }
    }

    // Priority 4: Idle (no input)
    if (!hasMovement && !input.attack && !input.jump) {
        if (CanTransition(current, AnimationState::IDLE_CALM)) {
            return AnimationState::IDLE_CALM;
        }
    }

    // If no valid transition found, stay in current state
    return current;
}

bool StateManager::CanTransition(AnimationState from, AnimationState to) {
    // If already in the target state, transition is valid (no-op)
    if (from == to) {
        return true;
    }

    // Death state cannot transition to anything
    if (from == AnimationState::DEATH) {
        return false;
    }

    // TODO: Implement state interruption logic
    // - Attack animations should not be interruptible mid-combo
    // - Finisher animations must complete
    // - Parry/counter windows have specific timing
    // - Hit reactions can be interrupted by certain actions
    // 
    // Example rules:
    // - LIGHT_COMBO can be interrupted after first attack frame window
    // - HEAVY_COMBO cannot be interrupted once started
    // - FINISHER cannot be interrupted
    // - PARRY has a specific window
    // - COUNTER must complete
    // - HIT_REACTIONS can be interrupted by invincibility frames

    // TODO: Implement animation blending rules
    // - Movement transitions should blend smoothly
    // - Attack to movement needs proper exit frames
    // - Idle to movement should have anticipation
    // - Sprint entry/exit needs transition time
    //
    // Example blending:
    // - WALK ↔ SPRINT: 0.2s blend time
    // - IDLE_CALM → WALK: 0.1s blend time
    // - WALK → IDLE_CALM: 0.15s blend time
    // - ATTACK → WALK: wait for recovery frames

    // For now, allow most transitions
    // Exception: Combat states have restrictions
    switch (from) {
        case AnimationState::LIGHT_COMBO:
        case AnimationState::HEAVY_COMBO:
        case AnimationState::SPECIAL_ATTACKS:
            // Combat animations can only transition to other combat states or idle
            // This is a simplified rule; real implementation would check animation progress
            return (to == AnimationState::IDLE_CALM || 
                    to == AnimationState::IDLE_COMBAT ||
                    to == AnimationState::LIGHT_COMBO ||
                    to == AnimationState::HEAVY_COMBO ||
                    to == AnimationState::SPECIAL_ATTACKS);

        case AnimationState::FINISHER:
        case AnimationState::PARRY:
        case AnimationState::COUNTER:
            // These states must complete before transitioning
            // In a real implementation, this would check animation completion percentage
            return false;

        case AnimationState::HIT_REACTIONS:
            // Hit reactions can only transition to idle or death
            return (to == AnimationState::IDLE_CALM || 
                    to == AnimationState::IDLE_COMBAT ||
                    to == AnimationState::DEATH);

        default:
            // All other states (idle, movement) can freely transition
            return true;
    }
}

} // namespace LegendsEngine
