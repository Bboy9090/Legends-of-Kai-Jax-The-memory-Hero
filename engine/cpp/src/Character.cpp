#include "../include/Character.h"
#include "../include/input/InputHandler.h"
#include "../include/character/StateManager.h"
#include <iostream>

namespace LegendsEngine {

void Character::Update(float deltaTime) {
    // Input-driven state machine logic
    // This is the integration point that wires player input to character animation
    
    if (inputHandler && stateManager) {
        // Step 1: Get current player input
        InputState input = inputHandler->GetCurrentInput();
        
        // Step 2: Determine next animation state based on current state and input
        AnimationState nextState = stateManager->GetNextState(currentAnimationState, input);
        
        // Step 3: Transition to new state if different from current
        if (nextState != currentAnimationState) {
            SetAnimationState(nextState);
        }
        
        // Step 4: Update animation progress for state manager
        // In a full implementation, this would come from the animation system
        // For now, we increment a simple counter
        animationProgressTime += deltaTime;
        float progress = animationProgressTime / GetEstimatedAnimationDuration(currentAnimationState);
        if (progress > 1.0f) {
            progress = 1.0f;
        }
        stateManager->UpdateAnimationProgress(currentAnimationState, progress);
    }
    
    // Additional character update logic
    // - Physics integration would happen here
    // - Tail physics simulation
    // - Combat state transitions (damage application, hit reactions)
    // - VFX system updates
    // - Audio event triggers
}

float Character::GetEstimatedAnimationDuration(AnimationState state) const {
    // Estimated animation durations for progress tracking
    // In a full implementation, these would come from the animation system
    switch (state) {
        case AnimationState::IDLE_CALM:
        case AnimationState::IDLE_COMBAT:
            return 2.0f; // Idle loops are long
        case AnimationState::WALK:
            return 1.0f;
        case AnimationState::SPRINT:
            return 0.8f;
        case AnimationState::LIGHT_COMBO:
            return 0.5f; // Quick attack
        case AnimationState::HEAVY_COMBO:
            return 0.8f; // Slower, heavier attack
        case AnimationState::SPECIAL_ATTACKS:
            return 1.2f;
        case AnimationState::FINISHER:
            return 2.0f; // Long dramatic animation
        case AnimationState::PARRY:
            return 0.3f; // Quick defensive action
        case AnimationState::COUNTER:
            return 0.6f;
        case AnimationState::DODGE_GROUND:
        case AnimationState::DODGE_AIR:
            return 0.5f;
        case AnimationState::HIT_REACTIONS:
            return 0.4f;
        case AnimationState::DEATH:
            return 3.0f; // Long death animation
        default:
            return 1.0f;
    }
}

void Character::SetAnimationState(AnimationState newState) {
    // Check if the animation state has actually changed
    if (currentAnimationState != newState) {
        // Verify that the animation exists before transitioning
        if (!animationComponent.HasAnimation(newState)) {
            std::cerr << "Warning: Cannot transition to animation state " 
                      << static_cast<int>(newState) 
                      << " - animation not loaded" << std::endl;
            return;
        }
        
        // Log the state transition for debugging
        std::cout << "Character animation state changed from: " 
                  << static_cast<int>(currentAnimationState) 
                  << " to: " << static_cast<int>(newState) << std::endl;
        
        // Update the current state
        currentAnimationState = newState;
        
        // Reset animation progress tracking
        animationProgressTime = 0.0f;
        
        // Trigger the new animation via the animation component
        animationComponent.PlayAnimation(currentAnimationState);
    }
}

void Character::Render() {
    // Character rendering pipeline
    // In a full implementation, this would submit rendering commands
    // to the platform-specific renderer (Vulkan/Metal/DX12)
    
    // Rendering steps would include:
    // 1. Submit mesh to renderer with current pose from animation system
    // 2. Apply materials (PBR shaders with tail-tier specific properties)
    // 3. Render skeletal animation with bone transforms
    // 4. Render tail physics (dynamic secondary motion)
    // 5. Render VFX (aura, attack effects, tail glow based on tier)
    
    // Debug visualization (when enabled):
    // - Current animation state name overlay
    // - Animation frame counter
    // - Animation playback progress bar
    // - Tail bone chain visualization
    // - Hit/hurt box wireframe overlay
    // - State transition history
}

} // namespace LegendsEngine

