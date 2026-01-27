#pragma once

#include <string>
#include <unordered_map>
#include <iostream>

namespace LegendsEngine {

// Forward declaration
struct AnimationSpec;

/**
 * AnimationState - Enum representing the different animation states
 * These map to the animation sets defined in the character JSON specification
 */
enum class AnimationState {
    IDLE_CALM,
    IDLE_COMBAT,
    WALK,
    RUN,
    SPRINT,
    LIGHT_COMBO,
    HEAVY_COMBO,
    SPECIAL_ATTACKS,
    DODGE_GROUND,
    DODGE_AIR,
    PARRY,
    COUNTER,
    FINISHER,
    HIT_REACTIONS,
    DEATH
};

/**
 * AnimationComponent - Component responsible for managing character animations
 * 
 * This component stores animation paths for each animation state and provides
 * methods to load animation data from the character specification and play animations.
 * 
 * DESIGN PHILOSOPHY:
 * - Data-driven: Animation paths are loaded from JSON specification
 * - Platform-agnostic: Same animation logic for PC, mobile, tablet
 * - Engine integration placeholder: Uses stubs until animation system is integrated
 */
class AnimationComponent {
public:
    AnimationComponent() = default;
    ~AnimationComponent() = default;

    /**
     * LoadAnimationSets - Populate animation paths from character specification
     * 
     * This method extracts animation set information from the AnimationSpec
     * and populates the animationPaths map with paths to animation files.
     * 
     * @param spec The animation specification from the character JSON
     */
    void LoadAnimationSets(const AnimationSpec& spec);

    /**
     * PlayAnimation - Stub method to play an animation
     * 
     * This is a placeholder that logs which animation would be played.
     * In a production engine, this would interface with the animation system
     * to actually play the animation.
     * 
     * @param state The animation state to play
     */
    void PlayAnimation(AnimationState state);

    /**
     * GetAnimationPath - Get the file path for a specific animation state
     * 
     * @param state The animation state to query
     * @return The file path to the animation, or empty string if not found
     */
    const std::string& GetAnimationPath(AnimationState state) const;

    /**
     * HasAnimation - Check if an animation exists for a given state
     * 
     * @param state The animation state to check
     * @return true if the animation exists, false otherwise
     */
    bool HasAnimation(AnimationState state) const;

private:
    // Map from animation state to animation file path
    std::unordered_map<AnimationState, std::string> animationPaths;
    
    // Helper to convert animation set name to AnimationState enum
    AnimationState StringToAnimationState(const std::string& name) const;
};

} // namespace LegendsEngine
