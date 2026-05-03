#pragma once

#include "../AnimationComponent.h"
#include "../input/InputHandler.h"

namespace LegendsEngine {

/**
 * AnimationProgress - Tracks the current progress of an animation
 */
struct AnimationProgress {
    float currentTime = 0.0f;
    float duration = 1.0f;
    bool isComplete = false;
    
    float GetNormalizedProgress() const {
        if (duration <= 0.0f) return 1.0f;
        float progress = currentTime / duration;
        return progress > 1.0f ? 1.0f : progress;
    }
    
    bool IsInWindow(float minProgress, float maxProgress) const {
        float progress = GetNormalizedProgress();
        return progress >= minProgress && progress <= maxProgress;
    }
};

/**
 * AnimationBlendState - Tracks blending between two animation states
 */
struct AnimationBlendState {
    AnimationState fromState = AnimationState::IDLE_CALM;
    AnimationState toState = AnimationState::IDLE_CALM;
    float blendTime = 0.0f;
    float currentBlendTime = 0.0f;
    bool isBlending = false;
    
    float GetBlendWeight() const {
        if (blendTime <= 0.0f || !isBlending) return 1.0f;
        float weight = currentBlendTime / blendTime;
        return weight > 1.0f ? 1.0f : weight;
    }
    
    bool IsComplete() const {
        return !isBlending || currentBlendTime >= blendTime;
    }
};

/**
 * StateManager - Manages character state transitions based on input
 */
class StateManager {
public:
    StateManager() = default;
    ~StateManager() = default;

    StateManager(const StateManager&) = delete;
    StateManager& operator=(const StateManager&) = delete;

    AnimationState GetNextState(AnimationState current, const InputState& input);
    bool CanTransition(AnimationState from, AnimationState to);
    bool CanInterrupt(AnimationState currentState, AnimationState desiredState, const AnimationProgress& progress);
    
    float GetBlendTime(AnimationState from, AnimationState to) const;
    
    void UpdateProgress(float deltaTime);
    const AnimationProgress& GetCurrentProgress() const { return currentProgress; }
    void SetAnimationDuration(AnimationState state, float duration);

    void StartBlend(AnimationState from, AnimationState to);
    void UpdateBlend(float deltaTime);
    const AnimationBlendState& GetBlendState() const { return blendState; }

    void UpdateAnimationProgress(AnimationState state, float progress);
    bool CanInterruptAtCurrentProgress(AnimationState state) const;

private:
    int GetStatePriority(AnimationState state) const;
    bool IsStateInterruptible(AnimationState state, const AnimationProgress& progress) const;

    AnimationProgress currentProgress;
    AnimationState trackedState = AnimationState::IDLE_CALM;
    AnimationBlendState blendState;
    float currentAnimationProgress = 0.0f;
};

} // namespace LegendsEngine
