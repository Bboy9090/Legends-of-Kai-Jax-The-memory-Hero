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
    // Character rendering (stub implementations until renderer is integrated)
    
    // Submit mesh to renderer
    // In a production engine, this would submit the mesh geometry to the rendering pipeline
    if (mesh) {
        // std::cout << "[Render] Submitting mesh to renderer" << std::endl;
    }
    
    // Apply materials
    // In a production engine, this would bind materials/shaders for each mesh part
    if (!materials.empty()) {
        // std::cout << "[Render] Applying " << materials.size() << " materials" << std::endl;
    }
    
    // Render skeletal animation
    // In a production engine, this would update GPU skinning matrices based on current animation
    if (skeleton) {
        // std::cout << "[Render] Updating skeletal animation" << std::endl;
    }
    
    // Render tail physics
    // In a production engine, this would render the 9 tails with physics-driven bone transforms
    // According to kai_jax.character.json: 9 tails, each with 5-7 physics bones
    // std::cout << "[Render] Rendering 9 tail physics bones" << std::endl;
    
    // Render VFX
    // In a production engine, this would render particle effects, emissive materials, etc.
    // std::cout << "[Render] Rendering VFX effects" << std::endl;
    
    // Debug visualization
    // This provides runtime information about the character's current state
    // Useful for debugging animation state machines and gameplay systems
    
    std::cout << "=== Character Debug Visualization ===" << std::endl;
    
    // Current animation state (enum value and name)
    std::cout << "Animation State: " << AnimationStateToString(currentAnimationState) 
              << " (enum value: " << static_cast<int>(currentAnimationState) << ")" << std::endl;
    
    // Current animation frame number and playback progress
    if (stateManager) {
        const AnimationProgress& progress = stateManager->GetCurrentProgress();
        
        // Animation playback progress (percentage)
        float progressPercent = progress.GetNormalizedProgress() * 100.0f;
        std::cout << "Animation Progress: " << progressPercent << "% "
                  << "(" << progress.currentTime << "s / " << progress.duration << "s)" << std::endl;
        
        // Current animation frame number
        // Assuming 30 FPS animation (typical for game animations)
        int currentFrame = static_cast<int>(progress.currentTime * 30.0f);
        int totalFrames = static_cast<int>(progress.duration * 30.0f);
        std::cout << "Animation Frame: " << currentFrame << " / " << totalFrames 
                  << " (at 30 FPS)" << std::endl;
        
        // Animation completion status
        std::cout << "Animation Complete: " << (progress.isComplete ? "YES" : "NO") << std::endl;
        
        // Blending state if actively blending
        const AnimationBlendState& blend = stateManager->GetBlendState();
        if (blend.isBlending) {
            std::cout << "Blending: " << AnimationStateToString(blend.fromState) 
                      << " -> " << AnimationStateToString(blend.toState)
                      << " (weight: " << blend.GetBlendWeight() << ")" << std::endl;
        }
    }
    
    // Active tail physics bones
    // According to kai_jax.character.json: 9 tails with 5-7 bones each = 45-63 physics bones
    std::cout << "Active Tail Physics: 9 tails (45-63 bones total)" << std::endl;
    std::cout << "  - Tail 1 (bond): parry/counter/revive" << std::endl;
    std::cout << "  - Tail 2 (hunter): dash/pursuit/execute" << std::endl;
    std::cout << "  - Tail 3 (thread): web/pull/group" << std::endl;
    std::cout << "  - Tail 4 (quill): retaliation/posture damage" << std::endl;
    std::cout << "  - Tail 5 (shade): stealth/threat reset" << std::endl;
    std::cout << "  - Tail 6 (anchor): anti-knockback/root" << std::endl;
    std::cout << "  - Tail 7 (echo): after-image/repeat" << std::endl;
    std::cout << "  - Tail 8 (rift): reality tear AOE" << std::endl;
    std::cout << "  - Tail 9 (crown): aura/command" << std::endl;
    
    // Hit/hurt boxes visualization
    // In a production engine, this would render collision volumes for debugging
    std::cout << "Hit/Hurt Boxes: [Visualization stub - would render collision volumes]" << std::endl;
    
    std::cout << "====================================" << std::endl;
}

} // namespace LegendsEngine

