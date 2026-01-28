#include "../include/character/StateManager.h"
#include <iostream>

using namespace LegendsEngine;

void printTestResult(const std::string& testName, bool passed) {
    std::cout << "[" << (passed ? "PASS" : "FAIL") << "] " << testName << std::endl;
}

void printSeparator() {
    std::cout << std::string(60, '=') << std::endl;
}

int main() {
    std::cout << "Legends Engine - State Interruption Logic Test Suite" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    StateManager stateManager;

    // Test 1: Attack can interrupt movement (higher priority)
    totalTests++;
    std::cout << "\n[Test 1] Testing attack interrupts movement..." << std::endl;
    
    AnimationProgress walkProgress;
    walkProgress.currentTime = 0.5f;
    walkProgress.duration = 1.0f;
    
    bool canInterrupt = stateManager.CanInterrupt(
        AnimationState::WALK, 
        AnimationState::LIGHT_COMBO, 
        walkProgress
    );
    
    if (canInterrupt) {
        std::cout << "  Attack correctly interrupts movement (priority 4 > 2)" << std::endl;
        printTestResult("Attack Interrupts Movement", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Attack should be able to interrupt movement" << std::endl;
        printTestResult("Attack Interrupts Movement", false);
    }

    // Test 2: Movement cannot interrupt attack early
    totalTests++;
    std::cout << "\n[Test 2] Testing movement cannot interrupt early attack..." << std::endl;
    
    AnimationProgress earlyAttackProgress;
    earlyAttackProgress.currentTime = 0.2f;  // 20% through attack
    earlyAttackProgress.duration = 1.0f;
    
    canInterrupt = stateManager.CanInterrupt(
        AnimationState::LIGHT_COMBO,
        AnimationState::WALK,
        earlyAttackProgress
    );
    
    if (!canInterrupt) {
        std::cout << "  Movement correctly blocked from interrupting early attack" << std::endl;
        printTestResult("Movement Cannot Interrupt Early Attack", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Movement should not interrupt attack before 40%" << std::endl;
        printTestResult("Movement Cannot Interrupt Early Attack", false);
    }

    // Test 3: Light attack can be interrupted after hit confirm (40%)
    totalTests++;
    std::cout << "\n[Test 3] Testing light attack interruptible after 40%..." << std::endl;
    
    AnimationProgress lateAttackProgress;
    lateAttackProgress.currentTime = 0.45f;  // 45% through attack
    lateAttackProgress.duration = 1.0f;
    
    canInterrupt = stateManager.CanInterrupt(
        AnimationState::LIGHT_COMBO,
        AnimationState::WALK,
        lateAttackProgress
    );
    
    if (canInterrupt) {
        std::cout << "  Light attack correctly interruptible after 40%" << std::endl;
        printTestResult("Light Attack Interruptible After 40%", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Light attack should be interruptible after 40%" << std::endl;
        printTestResult("Light Attack Interruptible After 40%", false);
    }

    // Test 4: Finisher cannot be interrupted
    totalTests++;
    std::cout << "\n[Test 4] Testing finisher cannot be interrupted..." << std::endl;
    
    AnimationProgress finisherProgress;
    finisherProgress.currentTime = 0.5f;
    finisherProgress.duration = 2.0f;
    
    canInterrupt = stateManager.CanInterrupt(
        AnimationState::FINISHER,
        AnimationState::LIGHT_COMBO,  // Even high priority attack
        finisherProgress
    );
    
    if (!canInterrupt) {
        std::cout << "  Finisher correctly cannot be interrupted" << std::endl;
        printTestResult("Finisher Cannot Be Interrupted", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Finisher should never be interruptible" << std::endl;
        printTestResult("Finisher Cannot Be Interrupted", false);
    }

    // Test 5: Heavy attack requires 70% completion
    totalTests++;
    std::cout << "\n[Test 5] Testing heavy attack requires 70% completion..." << std::endl;
    
    AnimationProgress heavyEarlyProgress;
    heavyEarlyProgress.currentTime = 0.6f;  // 60% - too early
    heavyEarlyProgress.duration = 1.0f;
    
    bool earlyInterrupt = stateManager.CanInterrupt(
        AnimationState::HEAVY_COMBO,
        AnimationState::WALK,
        heavyEarlyProgress
    );
    
    AnimationProgress heavyLateProgress;
    heavyLateProgress.currentTime = 0.75f;  // 75% - OK
    heavyLateProgress.duration = 1.0f;
    
    bool lateInterrupt = stateManager.CanInterrupt(
        AnimationState::HEAVY_COMBO,
        AnimationState::WALK,
        heavyLateProgress
    );
    
    if (!earlyInterrupt && lateInterrupt) {
        std::cout << "  Heavy attack correctly requires 70% completion" << std::endl;
        printTestResult("Heavy Attack 70% Rule", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Heavy attack interruption threshold incorrect" << std::endl;
        printTestResult("Heavy Attack 70% Rule", false);
    }

    // Test 6: Parry window is 20-60%
    totalTests++;
    std::cout << "\n[Test 6] Testing parry has specific window (20-60%)..." << std::endl;
    
    AnimationProgress parryEarly;
    parryEarly.currentTime = 0.1f;  // 10% - too early
    parryEarly.duration = 1.0f;
    
    AnimationProgress parryInWindow;
    parryInWindow.currentTime = 0.4f;  // 40% - in window
    parryInWindow.duration = 1.0f;
    
    AnimationProgress parryLate;
    parryLate.currentTime = 0.7f;  // 70% - too late
    parryLate.duration = 1.0f;
    
    bool earlyParry = stateManager.CanInterrupt(
        AnimationState::PARRY,
        AnimationState::LIGHT_COMBO,
        parryEarly
    );
    
    bool windowParry = stateManager.CanInterrupt(
        AnimationState::PARRY,
        AnimationState::LIGHT_COMBO,
        parryInWindow
    );
    
    bool lateParry = stateManager.CanInterrupt(
        AnimationState::PARRY,
        AnimationState::LIGHT_COMBO,
        parryLate
    );
    
    if (!earlyParry && windowParry && !lateParry) {
        std::cout << "  Parry window correctly set to 20-60%" << std::endl;
        printTestResult("Parry Window 20-60%", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Parry window should be 20-60% only" << std::endl;
        printTestResult("Parry Window 20-60%", false);
    }

    // Test 7: Dodge can be interrupted by higher priority, but same priority needs 50%
    totalTests++;
    std::cout << "\n[Test 7] Testing dodge interruption rules..." << std::endl;
    
    AnimationProgress dodgeEarly;
    dodgeEarly.currentTime = 0.3f;  // 30% - too early for same priority
    dodgeEarly.duration = 1.0f;
    
    AnimationProgress dodgeLate;
    dodgeLate.currentTime = 0.6f;  // 60% - OK for same priority
    dodgeLate.duration = 1.0f;
    
    // Higher priority (attack) can interrupt dodge at any time
    bool attackInterruptEarly = stateManager.CanInterrupt(
        AnimationState::DODGE_GROUND,
        AnimationState::LIGHT_COMBO,
        dodgeEarly
    );
    
    // Same priority cannot interrupt early
    bool samePriorityEarly = stateManager.CanInterrupt(
        AnimationState::DODGE_GROUND,
        AnimationState::DODGE_AIR,
        dodgeEarly
    );
    
    // Same priority can interrupt after 50%
    bool samePriorityLate = stateManager.CanInterrupt(
        AnimationState::DODGE_GROUND,
        AnimationState::DODGE_AIR,
        dodgeLate
    );
    
    if (attackInterruptEarly && !samePriorityEarly && samePriorityLate) {
        std::cout << "  Dodge interruption rules correct:" << std::endl;
        std::cout << "    - Higher priority can interrupt anytime" << std::endl;
        std::cout << "    - Same priority requires 50% completion" << std::endl;
        printTestResult("Dodge Interruption Rules", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Dodge interruption rules incorrect" << std::endl;
        printTestResult("Dodge Interruption Rules", false);
    }

    // Test 8: Animation progress tracking
    totalTests++;
    std::cout << "\n[Test 8] Testing animation progress tracking..." << std::endl;
    
    stateManager.SetAnimationDuration(AnimationState::WALK, 2.0f);
    const AnimationProgress& progress = stateManager.GetCurrentProgress();
    
    if (progress.currentTime == 0.0f && progress.duration == 2.0f && !progress.isComplete) {
        std::cout << "  Animation progress correctly initialized" << std::endl;
        printTestResult("Animation Progress Tracking", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Animation progress not initialized correctly" << std::endl;
        printTestResult("Animation Progress Tracking", false);
    }

    // Test 9: Progress update
    totalTests++;
    std::cout << "\n[Test 9] Testing progress update..." << std::endl;
    
    stateManager.SetAnimationDuration(AnimationState::WALK, 1.0f);
    stateManager.UpdateProgress(0.3f);
    const AnimationProgress& updatedProgress = stateManager.GetCurrentProgress();
    
    if (updatedProgress.currentTime == 0.3f && !updatedProgress.isComplete) {
        std::cout << "  Progress correctly updated" << std::endl;
        printTestResult("Progress Update", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Progress update failed" << std::endl;
        printTestResult("Progress Update", false);
    }

    // Test 10: Animation completion
    totalTests++;
    std::cout << "\n[Test 10] Testing animation completion..." << std::endl;
    
    stateManager.SetAnimationDuration(AnimationState::WALK, 1.0f);
    stateManager.UpdateProgress(1.5f);  // Update past duration
    const AnimationProgress& completedProgress = stateManager.GetCurrentProgress();
    
    if (completedProgress.isComplete) {
        std::cout << "  Animation correctly marked as complete" << std::endl;
        printTestResult("Animation Completion", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Animation should be marked complete" << std::endl;
        printTestResult("Animation Completion", false);
    }

    // Print final results
    printSeparator();
    std::cout << "\nTest Results Summary:" << std::endl;
    std::cout << "  Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
    std::cout << "  Success Rate: " << (100.0 * testsPassed / totalTests) << "%" << std::endl;
    
    if (testsPassed == totalTests) {
        std::cout << "\n✓ ALL TESTS PASSED - State interruption logic working correctly!" << std::endl;
        std::cout << "✓ Priority-based interruption implemented" << std::endl;
        std::cout << "✓ Animation progress tracking functional" << std::endl;
        std::cout << "✓ Window-based interruption rules enforced" << std::endl;
        std::cout << "✓ Combat flow preserved with proper timing" << std::endl;
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME TESTS FAILED - Please review the errors above" << std::endl;
        printSeparator();
        return 1;
    }
}
