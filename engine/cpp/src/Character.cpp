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
        
        // Step 4: Update animation progress tracking
        stateManager->UpdateProgress(deltaTime);
        
        // Step 5: Update animation blending
        stateManager->UpdateBlend(deltaTime);
    }
    
    // Additional character update logic
    // - Physics would be applied here
    // - Tail physics would be updated
    // - VFX systems would be updated
    // - Combat state transitions would be handled
    (void)deltaTime; // Suppress unused parameter warning for additional logic
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
        
        // Start blend transition if state manager is available
        if (stateManager) {
            stateManager->StartBlend(currentAnimationState, newState);
        }
        
        // Log the state transition for debugging
        std::cout << "Character animation state changed from: " 
                  << static_cast<int>(currentAnimationState) 
                  << " to: " << static_cast<int>(newState);
        
        // Log blend time if blending
        if (stateManager) {
            const AnimationBlendState& blend = stateManager->GetBlendState();
            if (blend.isBlending) {
                std::cout << " (blending over " << blend.blendTime << "s)";
            }
        }
        std::cout << std::endl;
        
        // Update the current state
        currentAnimationState = newState;
        
        // Reset animation progress tracking
        animationProgressTime = 0.0f;
        
        // Trigger the new animation via the animation component
        animationComponent.PlayAnimation(currentAnimationState);
        
        // Set animation duration for progress tracking
        if (stateManager) {
            // In a real engine, animation duration would come from the asset
            // For now, use default durations based on animation type
            float duration = 1.0f; // Default 1 second
            
            // Different animation types have different typical durations
            switch (newState) {
                case AnimationState::LIGHT_COMBO:
                    duration = 0.6f;  // Fast attack
                    break;
                case AnimationState::HEAVY_COMBO:
                    duration = 1.2f;  // Slower, more powerful
                    break;
                case AnimationState::FINISHER:
                    duration = 2.5f;  // Cinematic
                    break;
                case AnimationState::PARRY:
                    duration = 0.4f;  // Quick timing window
                    break;
                case AnimationState::DODGE_GROUND:
                case AnimationState::DODGE_AIR:
                    duration = 0.5f;  // Evasive
                    break;
                case AnimationState::HIT_REACTIONS:
                    duration = 0.8f;  // Stagger
                    break;
                default:
                    duration = 1.0f;  // Default for movement/idle
                    break;
            }
            
            stateManager->SetAnimationDuration(newState, duration);
        }
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

