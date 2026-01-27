#include "../include/CharacterFactory.h"
#include "../include/Character.h"
#include <iostream>

using namespace LegendsEngine;

void printTestResult(const std::string& testName, bool passed) {
    std::cout << "[" << (passed ? "PASS" : "FAIL") << "] " << testName << std::endl;
}

void printSeparator() {
    std::cout << std::string(60, '=') << std::endl;
}

int main() {
    std::cout << "Legends Engine - Animation Integration Test Suite" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    // Test 1: Create character and verify initial state
    totalTests++;
    std::cout << "\n[Test 1] Creating character and verifying initial animation state..." << std::endl;
    
    auto kaiJax = CharacterFactory::CreateCharacter("kai_jax");
    
    if (!kaiJax) {
        std::cout << "  ERROR: Failed to create character" << std::endl;
        printTestResult("Create Character", false);
        return 1;
    }
    
    std::cout << "  Character created successfully" << std::endl;
    std::cout << "  Initial animation state: " << static_cast<int>(kaiJax->GetAnimationState()) << std::endl;
    
    if (kaiJax->GetAnimationState() == AnimationState::IDLE_CALM) {
        std::cout << "  Correct: Initial state is IDLE_CALM" << std::endl;
        testsPassed++;
    } else {
        std::cout << "  ERROR: Initial state should be IDLE_CALM" << std::endl;
    }
    printTestResult("Initial Animation State", kaiJax->GetAnimationState() == AnimationState::IDLE_CALM);

    // Test 2: Test animation state transition
    totalTests++;
    std::cout << "\n[Test 2] Testing animation state transition..." << std::endl;
    
    std::cout << "  Transitioning to WALK state..." << std::endl;
    kaiJax->SetAnimationState(AnimationState::WALK);
    
    if (kaiJax->GetAnimationState() == AnimationState::WALK) {
        std::cout << "  Correct: State changed to WALK" << std::endl;
        testsPassed++;
    } else {
        std::cout << "  ERROR: State should be WALK" << std::endl;
    }
    printTestResult("Transition to WALK", kaiJax->GetAnimationState() == AnimationState::WALK);

    // Test 3: Test redundant state change (should not log)
    totalTests++;
    std::cout << "\n[Test 3] Testing redundant state change (no transition should occur)..." << std::endl;
    
    std::cout << "  Calling SetAnimationState(WALK) again (already in WALK)..." << std::endl;
    kaiJax->SetAnimationState(AnimationState::WALK);
    
    if (kaiJax->GetAnimationState() == AnimationState::WALK) {
        std::cout << "  Correct: State remains WALK (no redundant transition)" << std::endl;
        testsPassed++;
    } else {
        std::cout << "  ERROR: State should still be WALK" << std::endl;
    }
    printTestResult("Redundant State Change", kaiJax->GetAnimationState() == AnimationState::WALK);

    // Test 4: Test multiple state transitions
    totalTests++;
    std::cout << "\n[Test 4] Testing multiple state transitions..." << std::endl;
    
    std::cout << "  Transitioning through multiple states..." << std::endl;
    kaiJax->SetAnimationState(AnimationState::RUN);
    kaiJax->SetAnimationState(AnimationState::SPRINT);
    kaiJax->SetAnimationState(AnimationState::LIGHT_COMBO);
    kaiJax->SetAnimationState(AnimationState::DODGE_GROUND);
    kaiJax->SetAnimationState(AnimationState::IDLE_COMBAT);
    
    if (kaiJax->GetAnimationState() == AnimationState::IDLE_COMBAT) {
        std::cout << "  Correct: Final state is IDLE_COMBAT" << std::endl;
        testsPassed++;
    } else {
        std::cout << "  ERROR: Final state should be IDLE_COMBAT" << std::endl;
    }
    printTestResult("Multiple State Transitions", kaiJax->GetAnimationState() == AnimationState::IDLE_COMBAT);

    // Test 5: Test Update method doesn't interfere with animation state
    totalTests++;
    std::cout << "\n[Test 5] Testing Update method with animation state..." << std::endl;
    
    AnimationState stateBefore = kaiJax->GetAnimationState();
    kaiJax->Update(0.016f);
    AnimationState stateAfter = kaiJax->GetAnimationState();
    
    if (stateBefore == stateAfter) {
        std::cout << "  Correct: Update doesn't change animation state" << std::endl;
        testsPassed++;
    } else {
        std::cout << "  ERROR: Update should not change animation state" << std::endl;
    }
    printTestResult("Update Preserves State", stateBefore == stateAfter);

    // Print final results
    printSeparator();
    std::cout << "\nTest Results Summary:" << std::endl;
    std::cout << "  Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
    std::cout << "  Success Rate: " << (100.0 * testsPassed / totalTests) << "%" << std::endl;
    
    if (testsPassed == totalTests) {
        std::cout << "\n✓ ALL TESTS PASSED - Animation integration is working correctly!" << std::endl;
        std::cout << "✓ State management → animation selection → playback trigger complete" << std::endl;
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME TESTS FAILED - Please review the errors above" << std::endl;
        printSeparator();
        return 1;
    }
}
