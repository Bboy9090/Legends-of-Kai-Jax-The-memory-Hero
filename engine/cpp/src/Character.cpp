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
    }
    
    // TODO: Additional character update logic
    // - Apply physics
    // - Update tail physics
    // - Handle combat state transitions
    // - Update VFX systems
    (void)deltaTime; // Suppress unused parameter warning
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
        
        // Trigger the new animation via the animation component
        animationComponent.PlayAnimation(currentAnimationState);
    }
}

void Character::Render() {
    // TODO: Implement character rendering
    // - Submit mesh to renderer
    // - Apply materials
    // - Render skeletal animation
    // - Render tail physics
    // - Render VFX
    
    // TODO: Add debug visualization here
    // - Current animation state (enum value and name)
    // - Current animation frame number
    // - Animation playback progress (percentage)
    // - Active tail physics bones
    // - Hit/hurt boxes visualization
}

} // namespace LegendsEngine

