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
    std::cout << "Legends Engine - State Interruption Logic Test" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    StateManager stateManager;

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
