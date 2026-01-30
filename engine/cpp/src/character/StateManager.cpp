#include "../../include/character/StateManager.h"
#include <iostream>

namespace LegendsEngine {

AnimationState StateManager::GetNextState(AnimationState current, const InputState& input) {
    // Priority 1: Attack actions (highest priority)
    if (input.attack) {
        // Attack state machine with combo tracking
        // - First attack: LIGHT_COMBO
        // - Can chain into heavy attacks or special attacks
        // - Must respect interrupt windows
        if (CanTransition(current, AnimationState::LIGHT_COMBO)) {
            return AnimationState::LIGHT_COMBO;
        }
    }

    // Priority 2: Jump actions
    if (input.jump) {
        // Jump state machine
        // - Check if on ground vs in air
        // - Allow jump from most states except finishers
        // - Return to idle as placeholder (jump animations not yet implemented)
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

        // Backward and strafe movement
        // - moveBackward → use WALK (backward variant not in enum yet)
        // - moveLeft/moveRight → use WALK (strafe variant not in enum yet)
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
            

    // State interruption logic based on animation progress and state type
    // Some states can only be interrupted during specific windows
    
    switch (from) {

        case AnimationState::LIGHT_COMBO:
            // Light combo can be interrupted after recovery frames (>70% complete)
            // or can chain into other combat states early in animation
            if (!CanInterruptAtCurrentProgress(AnimationState::LIGHT_COMBO)) {
                // Can only transition to other combat states during combo window
                return (to == AnimationState::HEAVY_COMBO ||
                        to == AnimationState::SPECIAL_ATTACKS ||
                        to == AnimationState::LIGHT_COMBO);
            }
            // After recovery, can transition to any valid state
            return (to != AnimationState::FINISHER && 
                    to != AnimationState::PARRY && 
                    to != AnimationState::COUNTER &&
                    to != AnimationState::DEATH);

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
            // Heavy combo cannot be interrupted once started
            // Must wait for recovery frames (>80% complete)
            if (!CanInterruptAtCurrentProgress(AnimationState::HEAVY_COMBO)) {
                return false;
            }
            // After recovery, can only transition to idle or other combat states
            return (to == AnimationState::IDLE_CALM || 
                    to == AnimationState::IDLE_COMBAT ||
                    to == AnimationState::LIGHT_COMBO ||
                    to == AnimationState::SPECIAL_ATTACKS);

        case AnimationState::SPECIAL_ATTACKS:
            // Special attacks have strict timing windows
            // Can be canceled into finisher during specific frames
            if (to == AnimationState::FINISHER && currentAnimationProgress >= 0.5f) {
                return true;
            }
            // Otherwise must complete
            return CanInterruptAtCurrentProgress(AnimationState::SPECIAL_ATTACKS);

        case AnimationState::FINISHER:
            // Finisher cannot be interrupted - must complete
            return false;

        case AnimationState::PARRY:
            // Parry has specific window - must complete or counter
            if (to == AnimationState::COUNTER) {
                return true; // Can always counter from successful parry
            }
            return false;

        case AnimationState::COUNTER:
            // Counter must complete before transitioning
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
            // Hit reactions can only transition to idle or death
            return (to == AnimationState::IDLE_CALM || 
                    to == AnimationState::IDLE_COMBAT ||
                    to == AnimationState::DEATH);

        case AnimationState::DODGE_GROUND:
        case AnimationState::DODGE_AIR:
            // Dodge has invincibility frames - can interrupt after i-frames end
            if (currentAnimationProgress < 0.4f) {
                return false; // Still in i-frames
            }
            // After i-frames, can transition to most states
            return (to != AnimationState::FINISHER);

        default:
            // Idle and movement states can freely transition
            return true;
    }
}

float StateManager::GetBlendTime(AnimationState from, AnimationState to) const {
    // Define blend times for smooth transitions between animation states
    
    // Same state = instant (no blend)
    if (from == to) {
        return 0.0f;
    }

    // Death transitions are instant (no blend)
    if (to == AnimationState::DEATH) {
        return 0.0f;
    }

    // Hit reactions should be quick
    if (to == AnimationState::HIT_REACTIONS) {
        return 0.05f;
    }

    // Combat state transitions
    if ((from == AnimationState::LIGHT_COMBO || from == AnimationState::HEAVY_COMBO) &&
        (to == AnimationState::LIGHT_COMBO || to == AnimationState::HEAVY_COMBO)) {
        // Fast combo transitions
        return 0.1f;
    }

    // Movement to movement transitions
    if ((from == AnimationState::WALK || from == AnimationState::SPRINT) &&
        (to == AnimationState::WALK || to == AnimationState::SPRINT)) {
        // Smooth movement speed changes
        return 0.2f;
    }

    // Idle to movement
    if ((from == AnimationState::IDLE_CALM || from == AnimationState::IDLE_COMBAT) &&
        (to == AnimationState::WALK || to == AnimationState::SPRINT)) {
        // Quick anticipation
        return 0.1f;
    }

    // Movement to idle
    if ((from == AnimationState::WALK || from == AnimationState::SPRINT) &&
        (to == AnimationState::IDLE_CALM || to == AnimationState::IDLE_COMBAT)) {
        // Smooth deceleration
        return 0.15f;
    }

    // Attack to movement (wait for recovery frames)
    if ((from == AnimationState::LIGHT_COMBO || from == AnimationState::HEAVY_COMBO) &&
        (to == AnimationState::WALK || to == AnimationState::SPRINT)) {
        return 0.2f;
    }

    // Default blend time for other transitions
    return 0.15f;
}

void StateManager::UpdateAnimationProgress(AnimationState state, float progress) {
    trackedState = state;
    currentAnimationProgress = progress;
}

bool StateManager::CanInterruptAtCurrentProgress(AnimationState state) const {
    // Only check interrupt if we're tracking the same state
    if (trackedState != state) {
        return true; // Not currently in this state, so can transition
    }

    // Define interrupt windows based on state type and animation progress
    switch (state) {
        case AnimationState::LIGHT_COMBO:
            // Can interrupt after 70% (recovery frames)
            return currentAnimationProgress >= 0.7f;

        case AnimationState::HEAVY_COMBO:
            // Can interrupt after 80% (longer recovery)
            return currentAnimationProgress >= 0.8f;

        case AnimationState::SPECIAL_ATTACKS:
            // Can interrupt after 75%
            return currentAnimationProgress >= 0.75f;

        case AnimationState::FINISHER:
            // Cannot interrupt finisher
            return false;

        case AnimationState::PARRY:
        case AnimationState::COUNTER:
            // Must complete
            return false;

        case AnimationState::DODGE_GROUND:
        case AnimationState::DODGE_AIR:
            // Can interrupt after invincibility frames (40%)
            return currentAnimationProgress >= 0.4f;

        default:
            // Movement and idle can always be interrupted
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

float StateManager::GetBlendTime(AnimationState from, AnimationState to) const {
    // Define blend times for different transition types
    // Based on animation philosophy: mass and inertia matter
    
    // Same state = no blend
    if (from == to) {
        return 0.0f;
    }
    
    // Movement to movement transitions
    if ((from == AnimationState::WALK || from == AnimationState::RUN || from == AnimationState::SPRINT) &&
        (to == AnimationState::WALK || to == AnimationState::RUN || to == AnimationState::SPRINT)) {
        return 0.2f; // 200ms blend for movement speed changes
    }
    
    // Idle to movement
    if ((from == AnimationState::IDLE_CALM || from == AnimationState::IDLE_COMBAT) &&
        (to == AnimationState::WALK || to == AnimationState::RUN || to == AnimationState::SPRINT)) {
        return 0.1f; // 100ms blend for movement start (anticipation)
    }
    
    // Movement to idle
    if ((from == AnimationState::WALK || from == AnimationState::RUN || from == AnimationState::SPRINT) &&
        (to == AnimationState::IDLE_CALM || to == AnimationState::IDLE_COMBAT)) {
        return 0.15f; // 150ms blend for stopping (deceleration)
    }
    
    // Combat to movement (must wait for recovery frames)
    if ((from == AnimationState::LIGHT_COMBO || from == AnimationState::HEAVY_COMBO || 
         from == AnimationState::SPECIAL_ATTACKS) &&
        (to == AnimationState::WALK || to == AnimationState::RUN || to == AnimationState::SPRINT)) {
        return 0.25f; // 250ms blend for combat exit (recovery)
    }
    
    // Movement to combat (quick transitions for responsive feel)
    if ((from == AnimationState::WALK || from == AnimationState::RUN || from == AnimationState::SPRINT) &&
        (to == AnimationState::LIGHT_COMBO || to == AnimationState::HEAVY_COMBO)) {
        return 0.1f; // 100ms blend for attack startup
    }
    
    // Dodge transitions (fast for evasive actions)
    if (to == AnimationState::DODGE_GROUND || to == AnimationState::DODGE_AIR) {
        return 0.05f; // 50ms blend for dodge (must be responsive)
    }
    
    // Parry and counter (instant for timing precision)
    if (to == AnimationState::PARRY || to == AnimationState::COUNTER) {
        return 0.0f; // No blend for precise timing actions
    }
    
    // Hit reactions (instant to preserve impact feel)
    if (to == AnimationState::HIT_REACTIONS) {
        return 0.0f; // No blend for hit reactions
    }
    
    // Finisher (smooth entry for cinematic feel)
    if (to == AnimationState::FINISHER) {
        return 0.3f; // 300ms blend for finisher entry
    }
    
    // Death (no blend, immediate)
    if (to == AnimationState::DEATH) {
        return 0.0f;
    }
    
    // Default blend time for uncategorized transitions
    return 0.15f;
}

void StateManager::StartBlend(AnimationState from, AnimationState to) {
    blendState.fromState = from;
    blendState.toState = to;
    blendState.blendTime = GetBlendTime(from, to);
    blendState.currentBlendTime = 0.0f;
    blendState.isBlending = (blendState.blendTime > 0.0f);
}

void StateManager::UpdateBlend(float deltaTime) {
    if (blendState.isBlending) {
        blendState.currentBlendTime += deltaTime;
        
        if (blendState.currentBlendTime >= blendState.blendTime) {
            blendState.isBlending = false;
            blendState.currentBlendTime = blendState.blendTime;
        }
    }
}

} // namespace LegendsEngine
