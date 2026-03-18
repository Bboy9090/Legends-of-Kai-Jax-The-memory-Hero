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

bool floatEquals(float a, float b, float epsilon = 0.001f) {
    return std::fabs(a - b) < epsilon;
}

int main() {
    std::cout << "Legends Engine - Animation Blending Test Suite" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    StateManager stateManager;

    // Test 1: Movement transitions have appropriate blend times
    totalTests++;
    std::cout << "\n[Test 1] Testing movement transition blend times..." << std::endl;
    
    float walkToSprintBlend = stateManager.GetBlendTime(
        AnimationState::WALK, 
        AnimationState::SPRINT
    );
    
    if (floatEquals(walkToSprintBlend, 0.2f)) {
        std::cout << "  Walk→Sprint blend time correctly set to 0.2s" << std::endl;
        printTestResult("Movement Blend Time", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.2s, got " << walkToSprintBlend << "s" << std::endl;
        printTestResult("Movement Blend Time", false);
    }

    // Test 2: Idle to movement has anticipation blend
    totalTests++;
    std::cout << "\n[Test 2] Testing idle to movement blend..." << std::endl;
    
    float idleToWalkBlend = stateManager.GetBlendTime(
        AnimationState::IDLE_CALM,
        AnimationState::WALK
    );
    
    if (floatEquals(idleToWalkBlend, 0.1f)) {
        std::cout << "  Idle→Walk blend time correctly set to 0.1s (anticipation)" << std::endl;
        printTestResult("Idle to Movement Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.1s, got " << idleToWalkBlend << "s" << std::endl;
        printTestResult("Idle to Movement Blend", false);
    }

    // Test 3: Movement to idle has deceleration blend
    totalTests++;
    std::cout << "\n[Test 3] Testing movement to idle blend..." << std::endl;
    
    float walkToIdleBlend = stateManager.GetBlendTime(
        AnimationState::WALK,
        AnimationState::IDLE_CALM
    );
    
    if (floatEquals(walkToIdleBlend, 0.15f)) {
        std::cout << "  Walk→Idle blend time correctly set to 0.15s (deceleration)" << std::endl;
        printTestResult("Movement to Idle Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.15s, got " << walkToIdleBlend << "s" << std::endl;
        printTestResult("Movement to Idle Blend", false);
    }

    // Test 4: Combat exit requires recovery frames
    totalTests++;
    std::cout << "\n[Test 4] Testing combat to movement blend..." << std::endl;
    
    float attackToWalkBlend = stateManager.GetBlendTime(
        AnimationState::LIGHT_COMBO,
        AnimationState::WALK
    );
    
    if (floatEquals(attackToWalkBlend, 0.25f)) {
        std::cout << "  Attack→Walk blend time correctly set to 0.25s (recovery)" << std::endl;
        printTestResult("Combat Exit Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.25s, got " << attackToWalkBlend << "s" << std::endl;
        printTestResult("Combat Exit Blend", false);
    }

    // Test 5: Movement to combat is responsive
    totalTests++;
    std::cout << "\n[Test 5] Testing movement to combat blend..." << std::endl;
    
    float walkToAttackBlend = stateManager.GetBlendTime(
        AnimationState::WALK,
        AnimationState::LIGHT_COMBO
    );
    
    if (floatEquals(walkToAttackBlend, 0.1f)) {
        std::cout << "  Walk→Attack blend time correctly set to 0.1s (responsive)" << std::endl;
        printTestResult("Combat Entry Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.1s, got " << walkToAttackBlend << "s" << std::endl;
        printTestResult("Combat Entry Blend", false);
    }

    // Test 6: Dodge is instant (minimal blend)
    totalTests++;
    std::cout << "\n[Test 6] Testing dodge blend time..." << std::endl;
    
    float walkToDodgeBlend = stateManager.GetBlendTime(
        AnimationState::WALK,
        AnimationState::DODGE_GROUND
    );
    
    if (floatEquals(walkToDodgeBlend, 0.05f)) {
        std::cout << "  Walk→Dodge blend time correctly set to 0.05s (instant)" << std::endl;
        printTestResult("Dodge Blend Time", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.05s, got " << walkToDodgeBlend << "s" << std::endl;
        printTestResult("Dodge Blend Time", false);
    }

    // Test 7: Parry has no blend (precision timing)
    totalTests++;
    std::cout << "\n[Test 7] Testing parry has no blend..." << std::endl;
    
    float walkToParryBlend = stateManager.GetBlendTime(
        AnimationState::WALK,
        AnimationState::PARRY
    );
    
    if (floatEquals(walkToParryBlend, 0.0f)) {
        std::cout << "  Walk→Parry blend time correctly set to 0.0s (no blend)" << std::endl;
        printTestResult("Parry No Blend", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.0s, got " << walkToParryBlend << "s" << std::endl;
        printTestResult("Parry No Blend", false);
    }

    // Test 8: Blend state initialization
    totalTests++;
    std::cout << "\n[Test 8] Testing blend state initialization..." << std::endl;
    
    stateManager.StartBlend(AnimationState::WALK, AnimationState::SPRINT);
    const AnimationBlendState& blendState = stateManager.GetBlendState();
    
    if (blendState.fromState == AnimationState::WALK &&
        blendState.toState == AnimationState::SPRINT &&
        floatEquals(blendState.blendTime, 0.2f) &&
        floatEquals(blendState.currentBlendTime, 0.0f) &&
        blendState.isBlending) {
        std::cout << "  Blend state correctly initialized" << std::endl;
        printTestResult("Blend State Initialization", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Blend state initialization failed" << std::endl;
        printTestResult("Blend State Initialization", false);
    }

    // Test 9: Blend weight calculation
    totalTests++;
    std::cout << "\n[Test 9] Testing blend weight calculation..." << std::endl;
    
    stateManager.StartBlend(AnimationState::WALK, AnimationState::SPRINT);
    stateManager.UpdateBlend(0.1f);  // Half way through 0.2s blend
    const AnimationBlendState& halfBlend = stateManager.GetBlendState();
    
    if (floatEquals(halfBlend.GetBlendWeight(), 0.5f)) {
        std::cout << "  Blend weight correctly calculated (0.5 at 50% progress)" << std::endl;
        printTestResult("Blend Weight Calculation", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected 0.5, got " << halfBlend.GetBlendWeight() << std::endl;
        printTestResult("Blend Weight Calculation", false);
    }

    // Test 10: Blend completion
    totalTests++;
    std::cout << "\n[Test 10] Testing blend completion..." << std::endl;
    
    stateManager.StartBlend(AnimationState::WALK, AnimationState::SPRINT);
    stateManager.UpdateBlend(0.3f);  // Past 0.2s blend time
    const AnimationBlendState& completedBlend = stateManager.GetBlendState();
    
    if (completedBlend.IsComplete() && !completedBlend.isBlending) {
        std::cout << "  Blend correctly marked as complete" << std::endl;
        printTestResult("Blend Completion", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Blend should be complete and not blending" << std::endl;
        printTestResult("Blend Completion", false);
    }

    // Print final results
    printSeparator();
    std::cout << "\nTest Results Summary:" << std::endl;
    std::cout << "  Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
    std::cout << "  Success Rate: " << (100.0 * testsPassed / totalTests) << "%" << std::endl;
    
    if (testsPassed == totalTests) {
        std::cout << "\n✓ ALL TESTS PASSED - Animation blending working correctly!" << std::endl;
        std::cout << "✓ Blend times configured per transition type" << std::endl;
        std::cout << "✓ Blend weight calculation functional" << std::endl;
        std::cout << "✓ Mass and inertia preserved in transitions" << std::endl;
        std::cout << "✓ Responsive combat and evasive actions" << std::endl;
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME TESTS FAILED - Please review the errors above" << std::endl;
        printSeparator();
        return 1;
    }
}
