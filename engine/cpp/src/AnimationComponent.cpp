#include "../include/AnimationComponent.h"
#include "../include/CharacterTypes.h"
#include <algorithm>
#include <cctype>

namespace LegendsEngine {

void AnimationComponent::LoadAnimationSets(const AnimationSpec& spec) {
    // Populate animation paths from the specification's animation sets
    for (const auto& animSet : spec.sets) {
        AnimationState state = StringToAnimationState(animSet.name);
        animationPaths[state] = animSet.path;
    }
}

void AnimationComponent::PlayAnimation(AnimationState state) {
    // Stub implementation: Log which animation would be played
    auto it = animationPaths.find(state);
    if (it != animationPaths.end()) {
        std::cout << "Playing animation: " << it->second << std::endl;
    } else {
        std::cerr << "Warning: No animation path found for requested state" << std::endl;
    }
}

const std::string& AnimationComponent::GetAnimationPath(AnimationState state) const {
    static const std::string emptyString;
    auto it = animationPaths.find(state);
    if (it != animationPaths.end()) {
        return it->second;
    }
    return emptyString;
}

bool AnimationComponent::HasAnimation(AnimationState state) const {
    return animationPaths.find(state) != animationPaths.end();
}

AnimationState AnimationComponent::StringToAnimationState(const std::string& name) const {
    // Convert animation set name to AnimationState enum
    // Names are expected in format like "idle_calm", "walk", "run", etc.
    std::string lowerName = name;
    std::transform(lowerName.begin(), lowerName.end(), lowerName.begin(),
                   [](unsigned char c) { return std::tolower(c); });

    if (lowerName == "idle_calm") return AnimationState::IDLE_CALM;
    if (lowerName == "idle_combat") return AnimationState::IDLE_COMBAT;
    if (lowerName == "walk") return AnimationState::WALK;
    if (lowerName == "run") return AnimationState::RUN;
    if (lowerName == "sprint") return AnimationState::SPRINT;
    if (lowerName == "light_combo") return AnimationState::LIGHT_COMBO;
    if (lowerName == "heavy_combo") return AnimationState::HEAVY_COMBO;
    if (lowerName == "special_attacks") return AnimationState::SPECIAL_ATTACKS;
    if (lowerName == "dodge_ground") return AnimationState::DODGE_GROUND;
    if (lowerName == "dodge_air") return AnimationState::DODGE_AIR;
    if (lowerName == "parry") return AnimationState::PARRY;
    if (lowerName == "counter") return AnimationState::COUNTER;
    if (lowerName == "finisher") return AnimationState::FINISHER;
    if (lowerName == "hit_reactions") return AnimationState::HIT_REACTIONS;
    if (lowerName == "death") return AnimationState::DEATH;

    // Default to IDLE_CALM if not recognized
    return AnimationState::IDLE_CALM;
}

} // namespace LegendsEngine
