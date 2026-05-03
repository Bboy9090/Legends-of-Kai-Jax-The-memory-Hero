#include "../include/Character.h"
#include "../include/input/InputHandler.h"
#include "../include/character/StateManager.h"
#include <iostream>

namespace LegendsEngine {

// Helper function to convert AnimationState enum to string for debugging
static const char* AnimationStateToString(AnimationState state) {
    switch (state) {
        case AnimationState::IDLE_CALM: return "IDLE_CALM";
        case AnimationState::IDLE_COMBAT: return "IDLE_COMBAT";
        case AnimationState::WALK: return "WALK";
        case AnimationState::RUN: return "RUN";
        case AnimationState::SPRINT: return "SPRINT";
        case AnimationState::LIGHT_COMBO: return "LIGHT_COMBO";
        case AnimationState::HEAVY_COMBO: return "HEAVY_COMBO";
        case AnimationState::SPECIAL_ATTACKS: return "SPECIAL_ATTACKS";
        case AnimationState::DODGE_GROUND: return "DODGE_GROUND";
        case AnimationState::DODGE_AIR: return "DODGE_AIR";
        case AnimationState::PARRY: return "PARRY";
        case AnimationState::COUNTER: return "COUNTER";
        case AnimationState::FINISHER: return "FINISHER";
        case AnimationState::HIT_REACTIONS: return "HIT_REACTIONS";
        case AnimationState::DEATH: return "DEATH";
        default: return "UNKNOWN";
    }
}

void Character::Update(float deltaTime) {
    if (!inputHandler || !stateManager) return;

    // 1. Read input
    InputState input = inputHandler->GetCurrentInput();
    
    // 2. Handle Movement
    float speed = 5.0f; // Units per second
    if (input.sprint) speed *= 2.0f;

    if (input.moveForward) position.z -= speed * deltaTime;
    if (input.moveBackward) position.z += speed * deltaTime;
    if (input.moveLeft) position.x -= speed * deltaTime;
    if (input.moveRight) position.x += speed * deltaTime;

    // 3. Handle State Transitions
    AnimationState nextState = stateManager->GetNextState(currentAnimationState, input);
    if (nextState != currentAnimationState) {
        SetAnimationState(nextState);
    }
    
    // 4. Update Progress and Blending
    stateManager->UpdateProgress(deltaTime);
    stateManager->UpdateBlend(deltaTime);

    animationProgressTime += deltaTime;
    float duration = GetEstimatedAnimationDuration(currentAnimationState);
    float progress = (duration > 0) ? std::min(1.0f, animationProgressTime / duration) : 1.0f;
    
    stateManager->UpdateAnimationProgress(currentAnimationState, progress);
}

float Character::GetEstimatedAnimationDuration(AnimationState state) const {
    switch (state) {
        case AnimationState::IDLE_CALM:
        case AnimationState::IDLE_COMBAT: return 2.0f;
        case AnimationState::WALK: return 1.0f;
        case AnimationState::SPRINT: return 0.8f;
        case AnimationState::LIGHT_COMBO: return 0.5f;
        case AnimationState::HEAVY_COMBO: return 0.8f;
        case AnimationState::SPECIAL_ATTACKS: return 1.2f;
        case AnimationState::FINISHER: return 2.0f;
        case AnimationState::PARRY: return 0.3f;
        case AnimationState::COUNTER: return 0.6f;
        case AnimationState::DODGE_GROUND:
        case AnimationState::DODGE_AIR: return 0.5f;
        case AnimationState::HIT_REACTIONS: return 0.4f;
        case AnimationState::DEATH: return 3.0f;
        default: return 1.0f;
    }
}

void Character::SetAnimationState(AnimationState newState) {
    if (currentAnimationState != newState) {
        if (!animationComponent.HasAnimation(newState)) {
            std::cerr << "Warning: Cannot transition to animation state " << static_cast<int>(newState) << std::endl;
            return;
        }
        
        if (stateManager) {
            stateManager->StartBlend(currentAnimationState, newState);
        }
        
        currentAnimationState = newState;
        animationProgressTime = 0.0f;
        animationComponent.PlayAnimation(currentAnimationState);
        
        if (stateManager) {
            stateManager->SetAnimationDuration(newState, GetEstimatedAnimationDuration(newState));
        }
    }
}

void Character::SetInputAction(InputAction action, bool state) {
    if (inputHandler) {
        inputHandler->SetActionState(action, state);
    }
}

void Character::Render() {
    std::cout << "=== Character Debug Visualization ===" << std::endl;
    std::cout << "Animation State: " << AnimationStateToString(currentAnimationState) << std::endl;
    
    if (stateManager) {
        const AnimationProgress& progress = stateManager->GetCurrentProgress();
        std::cout << "Animation Progress: " << (progress.GetNormalizedProgress() * 100.0f) << "%" << std::endl;
        
        const AnimationBlendState& blend = stateManager->GetBlendState();
        if (blend.isBlending) {
            std::cout << "Blending: " << AnimationStateToString(blend.fromState) << " -> " << AnimationStateToString(blend.toState) << std::endl;
        }
    }
}

} // namespace LegendsEngine

