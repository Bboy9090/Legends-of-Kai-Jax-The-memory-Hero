#include "../include/Character.h"
#include <iostream>

namespace LegendsEngine {

void Character::Update(float deltaTime) {
    // TODO: Integration point for physics and input handling
    // Future: Input system will call SetAnimationState based on player actions
    // Future: Physics system will influence animation blending (air vs ground, etc.)
    
    // Animation playback is handled through SetAnimationState calls
    // which trigger immediate animation changes via animationComponent.PlayAnimation
    
    // TODO: Implement additional character update logic
    // - Process input
    // - Update animation state machine
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

