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
    std::cout << "Legends Engine - State Interruption Logic Test" << std::endl;
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
    // Test 1: Light combo early interruption (before recovery frames)
    totalTests++;
    std::cout << "\n[Test 1] Light combo early interruption..." << std::endl;
    
    stateManager.UpdateAnimationProgress(AnimationState::LIGHT_COMBO, 0.5f);
    
    // Should be able to chain to other combat states during combo
    bool canChainToHeavy = stateManager.CanTransition(AnimationState::LIGHT_COMBO, AnimationState::HEAVY_COMBO);
    bool canChainToSpecial = stateManager.CanTransition(AnimationState::LIGHT_COMBO, AnimationState::SPECIAL_ATTACKS);
    bool cannotTransitionToWalk = !stateManager.CanTransition(AnimationState::LIGHT_COMBO, AnimationState::WALK);
    
    if (canChainToHeavy && canChainToSpecial && cannotTransitionToWalk) {
        std::cout << "  Light combo correctly allows chaining to other attacks mid-combo" << std::endl;
        printTestResult("Light Combo Early Interruption", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Light combo interruption rules incorrect" << std::endl;
        printTestResult("Light Combo Early Interruption", false);
    }

    // Test 2: Light combo late interruption (after recovery frames)
    totalTests++;
    std::cout << "\n[Test 2] Light combo late interruption..." << std::endl;
    
    stateManager.UpdateAnimationProgress(AnimationState::LIGHT_COMBO, 0.8f);
    
    // Should be able to transition to movement after recovery
    bool canTransitionToWalk = stateManager.CanTransition(AnimationState::LIGHT_COMBO, AnimationState::WALK);
    bool canTransitionToSprint = stateManager.CanTransition(AnimationState::LIGHT_COMBO, AnimationState::SPRINT);
    
    if (canTransitionToWalk && canTransitionToSprint) {
        std::cout << "  Light combo correctly allows movement after recovery frames" << std::endl;
        printTestResult("Light Combo Late Interruption", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Light combo should allow movement after recovery" << std::endl;
        printTestResult("Light Combo Late Interruption", false);
    }

    // Test 3: Heavy combo cannot be interrupted early
    totalTests++;
    std::cout << "\n[Test 3] Heavy combo interruption blocking..." << std::endl;
    
    stateManager.UpdateAnimationProgress(AnimationState::HEAVY_COMBO, 0.5f);
    
    bool cannotInterruptToWalk = !stateManager.CanTransition(AnimationState::HEAVY_COMBO, AnimationState::WALK);
    bool cannotInterruptToIdle = !stateManager.CanTransition(AnimationState::HEAVY_COMBO, AnimationState::IDLE_CALM);
    
    if (cannotInterruptToWalk && cannotInterruptToIdle) {
        std::cout << "  Heavy combo correctly blocks interruption mid-animation" << std::endl;
        printTestResult("Heavy Combo Interrupt Block", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Heavy combo should not be interruptible early" << std::endl;
        printTestResult("Heavy Combo Interrupt Block", false);
    }

    // Test 4: Heavy combo can be interrupted after recovery
    totalTests++;
    std::cout << "\n[Test 4] Heavy combo late interruption..." << std::endl;
    
    stateManager.UpdateAnimationProgress(AnimationState::HEAVY_COMBO, 0.9f);
    
    bool canInterruptAfterRecovery = stateManager.CanTransition(AnimationState::HEAVY_COMBO, AnimationState::IDLE_CALM);
    
    if (canInterruptAfterRecovery) {
        std::cout << "  Heavy combo allows transition after recovery frames" << std::endl;
        printTestResult("Heavy Combo Late Interruption", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Heavy combo should allow transition after recovery" << std::endl;
        printTestResult("Heavy Combo Late Interruption", false);
    }

    // Test 5: Finisher cannot be interrupted
    totalTests++;
    std::cout << "\n[Test 5] Finisher interruption blocking..." << std::endl;
    
    stateManager.UpdateAnimationProgress(AnimationState::FINISHER, 0.5f);
    
    bool cannotInterruptFinisher = !stateManager.CanTransition(AnimationState::FINISHER, AnimationState::WALK) &&
                                   !stateManager.CanTransition(AnimationState::FINISHER, AnimationState::IDLE_CALM) &&
                                   !stateManager.CanTransition(AnimationState::FINISHER, AnimationState::LIGHT_COMBO);
    
    if (cannotInterruptFinisher) {
        std::cout << "  Finisher correctly cannot be interrupted at any point" << std::endl;
        printTestResult("Finisher No Interrupt", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Finisher should never be interruptible" << std::endl;
        printTestResult("Finisher No Interrupt", false);
    }

    // Test 6: Parry can counter
    totalTests++;
    std::cout << "\n[Test 6] Parry to counter transition..." << std::endl;
    
    stateManager.UpdateAnimationProgress(AnimationState::PARRY, 0.5f);
    
    bool canCounter = stateManager.CanTransition(AnimationState::PARRY, AnimationState::COUNTER);
    bool cannotTransitionToOther = !stateManager.CanTransition(AnimationState::PARRY, AnimationState::WALK);
    
    if (canCounter && cannotTransitionToOther) {
        std::cout << "  Parry correctly allows only counter transition" << std::endl;
        printTestResult("Parry Counter Transition", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Parry should only allow counter" << std::endl;
        printTestResult("Parry Counter Transition", false);
    }

    // Test 7: Dodge i-frames
    totalTests++;
    std::cout << "\n[Test 7] Dodge invincibility frames..." << std::endl;
    
    stateManager.UpdateAnimationProgress(AnimationState::DODGE_GROUND, 0.2f);
    
    bool cannotInterruptDuringIFrames = !stateManager.CanTransition(AnimationState::DODGE_GROUND, AnimationState::WALK);
    
    stateManager.UpdateAnimationProgress(AnimationState::DODGE_GROUND, 0.5f);
    bool canInterruptAfterIFrames = stateManager.CanTransition(AnimationState::DODGE_GROUND, AnimationState::WALK);
    
    if (cannotInterruptDuringIFrames && canInterruptAfterIFrames) {
        std::cout << "  Dodge correctly protects i-frames and allows interrupt after" << std::endl;
        printTestResult("Dodge I-Frames", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Dodge i-frame logic incorrect" << std::endl;
        printTestResult("Dodge I-Frames", false);
    }

    // Test 8: Special attack to finisher window
    totalTests++;
    std::cout << "\n[Test 8] Special attack finisher window..." << std::endl;
    
    stateManager.UpdateAnimationProgress(AnimationState::SPECIAL_ATTACKS, 0.3f);
    bool cannotFinishEarly = !stateManager.CanTransition(AnimationState::SPECIAL_ATTACKS, AnimationState::FINISHER);
    
    stateManager.UpdateAnimationProgress(AnimationState::SPECIAL_ATTACKS, 0.6f);
    bool canFinishLate = stateManager.CanTransition(AnimationState::SPECIAL_ATTACKS, AnimationState::FINISHER);
    
    if (cannotFinishEarly && canFinishLate) {
        std::cout << "  Special attack correctly has finisher cancel window" << std::endl;
        printTestResult("Special Attack Finisher Window", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Special attack finisher window incorrect" << std::endl;
        printTestResult("Special Attack Finisher Window", false);
    }

    // Test 9: Hit reactions limited transitions
    totalTests++;
    std::cout << "\n[Test 9] Hit reaction transitions..." << std::endl;
    
    stateManager.UpdateAnimationProgress(AnimationState::HIT_REACTIONS, 0.5f);
    
    bool canTransitionToIdle = stateManager.CanTransition(AnimationState::HIT_REACTIONS, AnimationState::IDLE_CALM);
    bool canTransitionToDeath = stateManager.CanTransition(AnimationState::HIT_REACTIONS, AnimationState::DEATH);
    bool cannotTransitionToAttack = !stateManager.CanTransition(AnimationState::HIT_REACTIONS, AnimationState::LIGHT_COMBO);
    bool cannotTransitionToWalkFromHit = !stateManager.CanTransition(AnimationState::HIT_REACTIONS, AnimationState::WALK);
    
    if (canTransitionToIdle && canTransitionToDeath && cannotTransitionToAttack && cannotTransitionToWalkFromHit) {
        std::cout << "  Hit reactions correctly limited to idle/death only" << std::endl;
        printTestResult("Hit Reaction Transitions", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Hit reaction transitions incorrect" << std::endl;
        printTestResult("Hit Reaction Transitions", false);
    }

    // Test 10: Death state is terminal
    totalTests++;
    std::cout << "\n[Test 10] Death state is terminal..." << std::endl;
    
    bool cannotTransitionFromDeath = !stateManager.CanTransition(AnimationState::DEATH, AnimationState::IDLE_CALM) &&
                                     !stateManager.CanTransition(AnimationState::DEATH, AnimationState::WALK) &&
                                     !stateManager.CanTransition(AnimationState::DEATH, AnimationState::LIGHT_COMBO);
    
    if (cannotTransitionFromDeath) {
        std::cout << "  Death state correctly cannot transition to any other state" << std::endl;
        printTestResult("Death State Terminal", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Death state should be terminal" << std::endl;
        printTestResult("Death State Terminal", false);
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
        std::cout << "✓ Combat states have proper interrupt windows" << std::endl;
        std::cout << "✓ Recovery frames and i-frames are respected" << std::endl;
        std::cout << "✓ Special transition rules (parry-counter, special-finisher) work" << std::endl;
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME TESTS FAILED - Please review the errors above" << std::endl;
        printSeparator();
        return 1;
    }
}
