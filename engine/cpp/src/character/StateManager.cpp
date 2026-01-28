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

    // Check if we can interrupt the current state
    return CanInterrupt(from, to, currentProgress);
}

bool StateManager::CanInterrupt(AnimationState currentState, AnimationState desiredState, 
                                const AnimationProgress& progress) {
    // Get priority levels
    int currentPriority = GetStatePriority(currentState);
    int desiredPriority = GetStatePriority(desiredState);

    // Higher priority states can always interrupt lower priority
    if (desiredPriority > currentPriority) {
        return true;
    }

    // Same priority states can interrupt if the current is interruptible
    if (desiredPriority == currentPriority) {
        return IsStateInterruptible(currentState, progress);
    }

    // Lower priority cannot interrupt higher priority unless animation is complete
    return progress.isComplete || IsStateInterruptible(currentState, progress);
}

int StateManager::GetStatePriority(AnimationState state) const {
    // Priority levels (higher = more important):
    // 5: Critical states (death, finisher)
    // 4: Combat actions (attack, parry, counter)
    // 3: Evasive actions (dodge, jump)
    // 2: Movement (walk, run, sprint)
    // 1: Idle states
    
    switch (state) {
        case AnimationState::DEATH:
        case AnimationState::FINISHER:
            return 5;
            
        case AnimationState::LIGHT_COMBO:
        case AnimationState::HEAVY_COMBO:
        case AnimationState::SPECIAL_ATTACKS:
        case AnimationState::PARRY:
        case AnimationState::COUNTER:
            return 4;
            
        case AnimationState::DODGE_GROUND:
        case AnimationState::DODGE_AIR:
            return 3;
            
        case AnimationState::WALK:
        case AnimationState::RUN:
        case AnimationState::SPRINT:
            return 2;
            
        case AnimationState::IDLE_CALM:
        case AnimationState::IDLE_COMBAT:
        case AnimationState::HIT_REACTIONS:
            return 1;
            
        default:
            return 0;
    }
}

bool StateManager::IsStateInterruptible(AnimationState state, 
                                       const AnimationProgress& progress) const {
    switch (state) {
        case AnimationState::LIGHT_COMBO:
            // Light attacks can be interrupted after 40% completion (hit confirm window)
            return progress.GetNormalizedProgress() >= 0.4f;
            
        case AnimationState::HEAVY_COMBO:
            // Heavy attacks can only be interrupted after 70% completion
            return progress.GetNormalizedProgress() >= 0.7f;
            
        case AnimationState::SPECIAL_ATTACKS:
            // Special attacks can be interrupted in recovery window (after 80%)
            return progress.GetNormalizedProgress() >= 0.8f;
            
        case AnimationState::PARRY:
            // Parry has a specific window (20-60% of animation)
            return progress.IsInWindow(0.2f, 0.6f);
            
        case AnimationState::COUNTER:
        case AnimationState::FINISHER:
            // These must complete fully
            return false;
            
        case AnimationState::DODGE_GROUND:
        case AnimationState::DODGE_AIR:
            // Dodges can be interrupted after 50% (allows for combat flow)
            return progress.GetNormalizedProgress() >= 0.5f;
            
        case AnimationState::HIT_REACTIONS:
            // Hit reactions can be interrupted after 60% (stagger recovery)
            return progress.GetNormalizedProgress() >= 0.6f;
            
        case AnimationState::WALK:
        case AnimationState::RUN:
        case AnimationState::SPRINT:
        case AnimationState::IDLE_CALM:
        case AnimationState::IDLE_COMBAT:
            // Movement and idle states can always be interrupted
            return true;
            
        case AnimationState::DEATH:
            // Death cannot be interrupted
            return false;
            
        default:
            return false;
    }
}

void StateManager::UpdateProgress(float deltaTime) {
    if (!currentProgress.isComplete) {
        currentProgress.currentTime += deltaTime;
        
        if (currentProgress.currentTime >= currentProgress.duration) {
            currentProgress.isComplete = true;
        }
    }
}

void StateManager::SetAnimationDuration(AnimationState state, float duration) {
    trackedState = state;
    currentProgress.currentTime = 0.0f;
    currentProgress.duration = duration;
    currentProgress.isComplete = false;
}

} // namespace LegendsEngine
