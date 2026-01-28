#include "../include/character/StateManager.h"
#include <iostream>
#include <cmath>

using namespace LegendsEngine;

void printTestResult(const std::string& testName, bool passed) {
    std::cout << "[" << (passed ? "PASS" : "FAIL") << "] " << testName << std::endl;
}

void printSeparator() {
    std::cout << std::string(60, '=') << std::endl;
}

bool floatEqual(float a, float b, float epsilon = 0.01f) {
    return std::abs(a - b) < epsilon;
}

int main() {
    std::cout << "Legends Engine - Animation Blending Test" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    StateManager stateManager;

    // Test 1: Same state blend time is zero
    totalTests++;
    std::cout << "\n[Test 1] Same state transition..." << std::endl;
    
    float blendTime = stateManager.GetBlendTime(AnimationState::WALK, AnimationState::WALK);
    
    if (floatEqual(blendTime, 0.0f)) {
        std::cout << "  Same state correctly has 0s blend time" << std::endl;
        printTestResult("Same State Zero Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0s blend, got " << blendTime << "s" << std::endl;
        printTestResult("Same State Zero Blend", false);
    }

    // Test 2: Death transition is instant
    totalTests++;
    std::cout << "\n[Test 2] Death transition instant..." << std::endl;
    
    blendTime = stateManager.GetBlendTime(AnimationState::WALK, AnimationState::DEATH);
    
    if (floatEqual(blendTime, 0.0f)) {
        std::cout << "  Death transition correctly instant" << std::endl;
        printTestResult("Death Instant Transition", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Death transition should be instant, got " << blendTime << "s" << std::endl;
        printTestResult("Death Instant Transition", false);
    }

    // Test 3: Hit reactions are quick
    totalTests++;
    std::cout << "\n[Test 3] Hit reaction blend time..." << std::endl;
    
    blendTime = stateManager.GetBlendTime(AnimationState::WALK, AnimationState::HIT_REACTIONS);
    
    if (floatEqual(blendTime, 0.05f)) {
        std::cout << "  Hit reaction has quick 0.05s blend" << std::endl;
        printTestResult("Hit Reaction Quick Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.05s blend, got " << blendTime << "s" << std::endl;
        printTestResult("Hit Reaction Quick Blend", false);
    }

    // Test 4: Combat combo transitions
    totalTests++;
    std::cout << "\n[Test 4] Combat combo transitions..." << std::endl;
    
    float lightToHeavy = stateManager.GetBlendTime(AnimationState::LIGHT_COMBO, AnimationState::HEAVY_COMBO);
    float heavyToLight = stateManager.GetBlendTime(AnimationState::HEAVY_COMBO, AnimationState::LIGHT_COMBO);
    
    if (floatEqual(lightToHeavy, 0.1f) && floatEqual(heavyToLight, 0.1f)) {
        std::cout << "  Combat combos have fast 0.1s blend for chaining" << std::endl;
        printTestResult("Combat Combo Blends", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.1s blend for combos" << std::endl;
        printTestResult("Combat Combo Blends", false);
    }

    // Test 5: Walk to sprint transition
    totalTests++;
    std::cout << "\n[Test 5] Walk to sprint transition..." << std::endl;
    
    blendTime = stateManager.GetBlendTime(AnimationState::WALK, AnimationState::SPRINT);
    
    if (floatEqual(blendTime, 0.2f)) {
        std::cout << "  Walk to sprint has smooth 0.2s blend" << std::endl;
        printTestResult("Walk Sprint Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.2s blend, got " << blendTime << "s" << std::endl;
        printTestResult("Walk Sprint Blend", false);
    }

    // Test 6: Sprint to walk transition
    totalTests++;
    std::cout << "\n[Test 6] Sprint to walk transition..." << std::endl;
    
    blendTime = stateManager.GetBlendTime(AnimationState::SPRINT, AnimationState::WALK);
    
    if (floatEqual(blendTime, 0.2f)) {
        std::cout << "  Sprint to walk has smooth 0.2s blend" << std::endl;
        printTestResult("Sprint Walk Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.2s blend, got " << blendTime << "s" << std::endl;
        printTestResult("Sprint Walk Blend", false);
    }

    // Test 7: Idle to movement anticipation
    totalTests++;
    std::cout << "\n[Test 7] Idle to movement transition..." << std::endl;
    
    float idleToWalk = stateManager.GetBlendTime(AnimationState::IDLE_CALM, AnimationState::WALK);
    float idleToSprint = stateManager.GetBlendTime(AnimationState::IDLE_COMBAT, AnimationState::SPRINT);
    
    if (floatEqual(idleToWalk, 0.1f) && floatEqual(idleToSprint, 0.1f)) {
        std::cout << "  Idle to movement has quick 0.1s anticipation" << std::endl;
        printTestResult("Idle Movement Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.1s blend for idle to movement" << std::endl;
        printTestResult("Idle Movement Blend", false);
    }

    // Test 8: Movement to idle deceleration
    totalTests++;
    std::cout << "\n[Test 8] Movement to idle transition..." << std::endl;
    
    float walkToIdle = stateManager.GetBlendTime(AnimationState::WALK, AnimationState::IDLE_CALM);
    float sprintToIdle = stateManager.GetBlendTime(AnimationState::SPRINT, AnimationState::IDLE_COMBAT);
    
    if (floatEqual(walkToIdle, 0.15f) && floatEqual(sprintToIdle, 0.15f)) {
        std::cout << "  Movement to idle has smooth 0.15s deceleration" << std::endl;
        printTestResult("Movement Idle Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.15s blend for movement to idle" << std::endl;
        printTestResult("Movement Idle Blend", false);
    }

    // Test 9: Attack to movement recovery
    totalTests++;
    std::cout << "\n[Test 9] Attack to movement transition..." << std::endl;
    
    float attackToWalk = stateManager.GetBlendTime(AnimationState::LIGHT_COMBO, AnimationState::WALK);
    float heavyToWalk = stateManager.GetBlendTime(AnimationState::HEAVY_COMBO, AnimationState::SPRINT);
    
    if (floatEqual(attackToWalk, 0.2f) && floatEqual(heavyToWalk, 0.2f)) {
        std::cout << "  Attack to movement has 0.2s recovery blend" << std::endl;
        printTestResult("Attack Movement Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.2s blend for attack to movement" << std::endl;
        printTestResult("Attack Movement Blend", false);
    }

    // Test 10: Default blend time
    totalTests++;
    std::cout << "\n[Test 10] Default blend time..." << std::endl;
    
    // Test a transition that doesn't have specific rules
    blendTime = stateManager.GetBlendTime(AnimationState::DODGE_GROUND, AnimationState::RUN);
    
    if (floatEqual(blendTime, 0.15f)) {
        std::cout << "  Unspecified transitions use default 0.15s blend" << std::endl;
        printTestResult("Default Blend Time", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected default 0.15s blend, got " << blendTime << "s" << std::endl;
        printTestResult("Default Blend Time", false);
    }

    // Test 11: Blend time symmetry check
    totalTests++;
    std::cout << "\n[Test 11] Blend time consistency..." << std::endl;
    
    bool consistent = true;
    
    // Walk-Sprint should be same both ways
    float walkSprint = stateManager.GetBlendTime(AnimationState::WALK, AnimationState::SPRINT);
    float sprintWalk = stateManager.GetBlendTime(AnimationState::SPRINT, AnimationState::WALK);
    if (!floatEqual(walkSprint, sprintWalk)) {
        std::cout << "  ERROR: Walk-Sprint blend time not symmetric" << std::endl;
        consistent = false;
    }
    
    // Combat transitions should be same both ways
    float lightHeavy = stateManager.GetBlendTime(AnimationState::LIGHT_COMBO, AnimationState::HEAVY_COMBO);
    float heavyLight = stateManager.GetBlendTime(AnimationState::HEAVY_COMBO, AnimationState::LIGHT_COMBO);
    if (!floatEqual(lightHeavy, heavyLight)) {
        std::cout << "  ERROR: Combat combo blend time not symmetric" << std::endl;
        consistent = false;
    }
    
    if (consistent) {
        std::cout << "  Blend times are consistent and symmetric" << std::endl;
        printTestResult("Blend Time Consistency", true);
        testsPassed++;
    } else {
        printTestResult("Blend Time Consistency", false);
    }

    // Test 12: Verify reasonable blend time ranges
    totalTests++;
    std::cout << "\n[Test 12] Blend time ranges..." << std::endl;
    
    bool rangesCorrect = true;
    
    // Test several transitions to ensure blend times are in reasonable range (0-0.3s)
    AnimationState states[] = {
        AnimationState::IDLE_CALM, AnimationState::WALK, AnimationState::SPRINT,
        AnimationState::LIGHT_COMBO, AnimationState::HEAVY_COMBO
    };
    
    for (int i = 0; i < 5; i++) {
        for (int j = 0; j < 5; j++) {
            if (i != j) {
                float blend = stateManager.GetBlendTime(states[i], states[j]);
                if (blend < 0.0f || blend > 0.3f) {
                    std::cout << "  ERROR: Blend time out of range: " << blend << "s" << std::endl;
                    rangesCorrect = false;
                }
            }
        }
    }
    
    if (rangesCorrect) {
        std::cout << "  All blend times in reasonable range (0-0.3s)" << std::endl;
        printTestResult("Blend Time Ranges", true);
        testsPassed++;
    } else {
        printTestResult("Blend Time Ranges", false);
    }

    // Print final results
    printSeparator();
    std::cout << "\nTest Results Summary:" << std::endl;
    std::cout << "  Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
    std::cout << "  Success Rate: " << (100.0 * testsPassed / totalTests) << "%" << std::endl;
    
    if (testsPassed == totalTests) {
        std::cout << "\n✓ ALL TESTS PASSED - Animation blending logic working correctly!" << std::endl;
        std::cout << "✓ Blend times are appropriate for each transition type" << std::endl;
        std::cout << "✓ Special cases (death, hit reactions) handled properly" << std::endl;
        std::cout << "✓ Movement and combat transitions have smooth timing" << std::endl;
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME TESTS FAILED - Please review the errors above" << std::endl;
        printSeparator();
        return 1;
    }
}
