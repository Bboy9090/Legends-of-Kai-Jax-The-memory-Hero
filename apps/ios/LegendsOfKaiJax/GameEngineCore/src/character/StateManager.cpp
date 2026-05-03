#include "../../include/character/StateManager.h"

namespace LegendsEngine {

AnimationState StateManager::GetNextState(AnimationState current, const InputState& input) {
    if (input.attack) {
        if (CanTransition(current, AnimationState::LIGHT_COMBO)) {
            return AnimationState::LIGHT_COMBO;
        }
    }

    if (input.jump) {
        if (CanTransition(current, AnimationState::IDLE_CALM)) {
            return AnimationState::IDLE_CALM;
        }
    }

    bool hasMovement = input.moveForward || input.moveBackward || input.moveLeft || input.moveRight;

    if (hasMovement) {
        if (input.moveForward && input.sprint) {
            if (CanTransition(current, AnimationState::SPRINT)) {
                return AnimationState::SPRINT;
            }
        }
        
        if (CanTransition(current, AnimationState::WALK)) {
            return AnimationState::WALK;
        }
    }

    if (!hasMovement && !input.attack && !input.jump) {
        if (CanTransition(current, AnimationState::IDLE_CALM)) {
            return AnimationState::IDLE_CALM;
        }
    }

    return current;
}

bool StateManager::CanTransition(AnimationState from, AnimationState to) {
    if (from == to) return true;
    if (from == AnimationState::DEATH) return false;
    
    return CanInterrupt(from, to, currentProgress);
}

bool StateManager::CanInterrupt(AnimationState currentState, AnimationState desiredState, const AnimationProgress& progress) {
    int currentPriority = GetStatePriority(currentState);
    int desiredPriority = GetStatePriority(desiredState);

    if (desiredPriority > currentPriority) return true;
    if (desiredPriority == currentPriority) return IsStateInterruptible(currentState, progress);
    
    return progress.isComplete || IsStateInterruptible(currentState, progress);
}

int StateManager::GetStatePriority(AnimationState state) const {
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
            return 1;
        default:
            return 0;
    }
}

bool StateManager::IsStateInterruptible(AnimationState state, const AnimationProgress& progress) const {
    switch (state) {
        case AnimationState::LIGHT_COMBO:
            return progress.GetNormalizedProgress() >= 0.4f;
        case AnimationState::HEAVY_COMBO:
            return progress.GetNormalizedProgress() >= 0.7f;
        case AnimationState::SPECIAL_ATTACKS:
            return progress.GetNormalizedProgress() >= 0.8f;
        case AnimationState::PARRY:
            return progress.IsInWindow(0.2f, 0.6f);
        case AnimationState::DODGE_GROUND:
        case AnimationState::DODGE_AIR:
            return progress.GetNormalizedProgress() >= 0.5f;
        case AnimationState::WALK:
        case AnimationState::RUN:
        case AnimationState::SPRINT:
        case AnimationState::IDLE_CALM:
        case AnimationState::IDLE_COMBAT:
            return true;
        default:
            return progress.isComplete;
    }
}

float StateManager::GetBlendTime(AnimationState from, AnimationState to) const {
    if (from == to || to == AnimationState::DEATH) return 0.0f;
    if (to == AnimationState::HIT_REACTIONS) return 0.05f;
    
    if ((from == AnimationState::LIGHT_COMBO || from == AnimationState::HEAVY_COMBO) &&
        (to == AnimationState::LIGHT_COMBO || to == AnimationState::HEAVY_COMBO)) return 0.1f;
        
    if ((from == AnimationState::WALK || from == AnimationState::SPRINT) &&
        (to == AnimationState::WALK || to == AnimationState::SPRINT)) return 0.2f;
        
    return 0.15f;
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

void StateManager::UpdateAnimationProgress(AnimationState state, float progress) {
    trackedState = state;
    currentAnimationProgress = progress;
}

bool StateManager::CanInterruptAtCurrentProgress(AnimationState state) const {
    if (trackedState != state) return true;
    
    switch (state) {
        case AnimationState::LIGHT_COMBO:
            return currentAnimationProgress >= 0.7f;
        case AnimationState::HEAVY_COMBO:
            return currentAnimationProgress >= 0.8f;
        case AnimationState::DODGE_GROUND:
        case AnimationState::DODGE_AIR:
            return currentAnimationProgress >= 0.4f;
        case AnimationState::FINISHER:
        case AnimationState::DEATH:
            return false;
        default:
            return true;
    }
}

} // namespace LegendsEngine
