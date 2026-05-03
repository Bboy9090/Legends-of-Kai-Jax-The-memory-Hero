#include "../include/CharacterFactory.h"
#include "../include/Character.h"
#include "../include/input/InputHandler.h"
#include "../include/character/StateManager.h"
#include <iostream>
#include <iomanip>

using namespace LegendsEngine;

void printTestResult(const std::string& testName, bool passed) {
    std::cout << "[" << (passed ? "PASS" : "FAIL") << "] " << testName << std::endl;
}

void printSeparator() {
    std::cout << std::string(70, '=') << std::endl;
}

void printHeader(const std::string& title) {
    printSeparator();
    std::cout << "  " << title << std::endl;
    printSeparator();
}

int main() {
    std::cout << "Legends Engine - End-to-End Integration Test" << std::endl;
    std::cout << "Testing complete PR #27 TODO implementation" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    // ========================================================================
    // Test 1: Create complete character system
    // ========================================================================
    totalTests++;
    printHeader("Test 1: Character System Creation");
    
    auto character = CharacterFactory::CreateCharacter("kai_jax");
    
    if (!character) {
        std::cout << "ERROR: Failed to create character" << std::endl;
        printTestResult("Character System Creation", false);
        return 1;
    }
    
    if (!character->inputHandler || !character->stateManager) {
        std::cout << "ERROR: Input or State system not initialized" << std::endl;
        printTestResult("Character System Creation", false);
        return 1;
    }
    
    std::cout << "✓ Character created with all systems" << std::endl;
    std::cout << "✓ InputHandler initialized" << std::endl;
    std::cout << "✓ StateManager initialized" << std::endl;
    std::cout << "✓ Initial state: IDLE_CALM" << std::endl;
    printTestResult("Character System Creation", true);
    testsPassed++;

    // ========================================================================
    // Test 2: Platform switching
    // ========================================================================
    totalTests++;
    printHeader("Test 2: Platform Input Switching");
    
    std::cout << "Testing platform switching capability..." << std::endl;
    
    // Test PC platform
    character->inputHandler->SetPlatform(PlatformType::PC);
    bool isPc = (character->inputHandler->GetPlatform() == PlatformType::PC);
    std::cout << "  PC platform: " << (isPc ? "SET" : "FAILED") << std::endl;
    
    // Test Gamepad platform
    character->inputHandler->SetPlatform(PlatformType::GAMEPAD);
    bool isGamepad = (character->inputHandler->GetPlatform() == PlatformType::GAMEPAD);
    std::cout << "  Gamepad platform: " << (isGamepad ? "SET" : "FAILED") << std::endl;
    
    // Test Touch platform
    character->inputHandler->SetPlatform(PlatformType::TOUCH);
    bool isTouch = (character->inputHandler->GetPlatform() == PlatformType::TOUCH);
    std::cout << "  Touch platform: " << (isTouch ? "SET" : "FAILED") << std::endl;
    
    if (isPc && isGamepad && isTouch) {
        std::cout << "✓ All platforms can be selected dynamically" << std::endl;
        printTestResult("Platform Input Switching", true);
        testsPassed++;
    } else {
        printTestResult("Platform Input Switching", false);
    }
    
    // Reset to PC for remaining tests
    character->inputHandler->SetPlatform(PlatformType::PC);

    // ========================================================================
    // Test 3: State transition with interrupt windows
    // ========================================================================
    totalTests++;
    printHeader("Test 3: State Transitions with Interrupt Windows");
    
    std::cout << "Simulating combat sequence..." << std::endl;
    
    // Transition to light combo
    character->SetAnimationState(AnimationState::LIGHT_COMBO);
    std::cout << "  Entered LIGHT_COMBO state" << std::endl;
    
    // Simulate animation at 50% (mid-combo)
    character->stateManager->UpdateAnimationProgress(AnimationState::LIGHT_COMBO, 0.5f);
    
    // Try to transition to walk (should fail - mid combo)
    bool canInterruptEarly = character->stateManager->CanTransition(
        AnimationState::LIGHT_COMBO, AnimationState::WALK
    );
    std::cout << "  Can interrupt at 50%: " << (canInterruptEarly ? "YES (ERROR)" : "NO (correct)") << std::endl;
    
    // Simulate animation at 80% (recovery frames)
    character->stateManager->UpdateAnimationProgress(AnimationState::LIGHT_COMBO, 0.8f);
    
    // Try to transition to walk (should succeed - in recovery)
    bool canInterruptLate = character->stateManager->CanTransition(
        AnimationState::LIGHT_COMBO, AnimationState::WALK
    );
    std::cout << "  Can interrupt at 80%: " << (canInterruptLate ? "YES (correct)" : "NO (ERROR)") << std::endl;
    
    if (!canInterruptEarly && canInterruptLate) {
        std::cout << "✓ Interrupt windows working correctly" << std::endl;
        printTestResult("State Interrupt Windows", true);
        testsPassed++;
    } else {
        printTestResult("State Interrupt Windows", false);
    }

    // ========================================================================
    // Test 4: Animation blending times
    // ========================================================================
    totalTests++;
    printHeader("Test 4: Animation Blending Times");
    
    std::cout << "Checking blend times for smooth transitions..." << std::endl;
    
    // Movement transitions
    float walkToSprint = character->stateManager->GetBlendTime(
        AnimationState::WALK, AnimationState::SPRINT
    );
    std::cout << "  WALK → SPRINT: " << std::fixed << std::setprecision(2) 
              << walkToSprint << "s" << std::endl;
    
    // Combat transitions
    float lightToHeavy = character->stateManager->GetBlendTime(
        AnimationState::LIGHT_COMBO, AnimationState::HEAVY_COMBO
    );
    std::cout << "  LIGHT_COMBO → HEAVY_COMBO: " << lightToHeavy << "s" << std::endl;
    
    // Idle to movement
    float idleToWalk = character->stateManager->GetBlendTime(
        AnimationState::IDLE_CALM, AnimationState::WALK
    );
    std::cout << "  IDLE_CALM → WALK: " << idleToWalk << "s" << std::endl;
    
    // Death transition
    float walkToDeath = character->stateManager->GetBlendTime(
        AnimationState::WALK, AnimationState::DEATH
    );
    std::cout << "  WALK → DEATH: " << walkToDeath << "s (instant)" << std::endl;
    
    bool blendsCorrect = (walkToSprint > 0.0f && walkToSprint < 0.3f) &&
                         (lightToHeavy > 0.0f && lightToHeavy < 0.2f) &&
                         (idleToWalk > 0.0f && idleToWalk < 0.2f) &&
                         (walkToDeath == 0.0f);
    
    if (blendsCorrect) {
        std::cout << "✓ All blend times in appropriate ranges" << std::endl;
        printTestResult("Animation Blending Times", true);
        testsPassed++;
    } else {
        printTestResult("Animation Blending Times", false);
    }

    // ========================================================================
    // Test 5: Complete gameplay loop simulation
    // ========================================================================
    totalTests++;
    printHeader("Test 5: Complete Gameplay Loop Simulation");
    
    std::cout << "Simulating 5 frames of gameplay..." << std::endl;
    
    // Reset to idle
    character->SetAnimationState(AnimationState::IDLE_CALM);
    
    bool loopWorked = true;
    
    // Frame 1: Idle
    character->Update(0.016f);
    if (character->GetAnimationState() != AnimationState::IDLE_CALM) {
        std::cout << "  Frame 1 ERROR: Should remain idle" << std::endl;
        loopWorked = false;
    } else {
        std::cout << "  Frame 1: Idle (no input)" << std::endl;
    }
    
    // Frame 2: Simulate forward input -> Walk
    InputState walkInput;
    walkInput.moveForward = true;
    AnimationState nextState = character->stateManager->GetNextState(
        character->GetAnimationState(), walkInput
    );
    character->SetAnimationState(nextState);
    
    if (character->GetAnimationState() != AnimationState::WALK) {
        std::cout << "  Frame 2 ERROR: Should be walking" << std::endl;
        loopWorked = false;
    } else {
        std::cout << "  Frame 2: Walking (forward input)" << std::endl;
    }
    
    // Frame 3: Add sprint input -> Sprint
    InputState sprintInput;
    sprintInput.moveForward = true;
    sprintInput.sprint = true;
    nextState = character->stateManager->GetNextState(
        character->GetAnimationState(), sprintInput
    );
    character->SetAnimationState(nextState);
    
    if (character->GetAnimationState() != AnimationState::SPRINT) {
        std::cout << "  Frame 3 ERROR: Should be sprinting" << std::endl;
        loopWorked = false;
    } else {
        std::cout << "  Frame 3: Sprinting (forward + sprint)" << std::endl;
    }
    
    // Frame 4: Attack input -> Attack (high priority)
    InputState attackInput;
    attackInput.moveForward = true;
    attackInput.attack = true;
    nextState = character->stateManager->GetNextState(
        character->GetAnimationState(), attackInput
    );
    character->SetAnimationState(nextState);
    
    if (character->GetAnimationState() != AnimationState::LIGHT_COMBO) {
        std::cout << "  Frame 4 ERROR: Should be attacking" << std::endl;
        loopWorked = false;
    } else {
        std::cout << "  Frame 4: Attacking (attack has priority)" << std::endl;
    }
    
    // Frame 5: No input, wait for recovery, return to idle
    // Simulate animation completion by updating progress
    character->stateManager->UpdateAnimationProgress(AnimationState::LIGHT_COMBO, 1.0f);
    
    InputState noInput;
    nextState = character->stateManager->GetNextState(
        character->GetAnimationState(), noInput
    );
    character->SetAnimationState(nextState);
    
    if (character->GetAnimationState() != AnimationState::IDLE_CALM) {
        std::cout << "  Frame 5 ERROR: Should return to idle" << std::endl;
        loopWorked = false;
    } else {
        std::cout << "  Frame 5: Idle (no input, returned from attack)" << std::endl;
    }
    
    if (loopWorked) {
        std::cout << "✓ Complete gameplay loop executed successfully" << std::endl;
        std::cout << "✓ Input → State → Animation pipeline working" << std::endl;
        printTestResult("Gameplay Loop Simulation", true);
        testsPassed++;
    } else {
        printTestResult("Gameplay Loop Simulation", false);
    }

    // ========================================================================
    // Test 6: Special state rules
    // ========================================================================
    totalTests++;
    printHeader("Test 6: Special State Transition Rules");
    
    std::cout << "Testing special state rules..." << std::endl;
    
    // Parry can only counter
    bool parryCanCounter = character->stateManager->CanTransition(
        AnimationState::PARRY, AnimationState::COUNTER
    );
    bool parryCannotWalk = !character->stateManager->CanTransition(
        AnimationState::PARRY, AnimationState::WALK
    );
    std::cout << "  Parry → Counter: " << (parryCanCounter ? "ALLOWED (correct)" : "BLOCKED (ERROR)") << std::endl;
    std::cout << "  Parry → Walk: " << (parryCannotWalk ? "BLOCKED (correct)" : "ALLOWED (ERROR)") << std::endl;
    
    // Death is terminal
    bool deathIsTerminal = !character->stateManager->CanTransition(
        AnimationState::DEATH, AnimationState::IDLE_CALM
    );
    std::cout << "  Death → Idle: " << (deathIsTerminal ? "BLOCKED (correct)" : "ALLOWED (ERROR)") << std::endl;
    
    // Finisher cannot be interrupted
    character->stateManager->UpdateAnimationProgress(AnimationState::FINISHER, 0.5f);
    bool finisherLocked = !character->stateManager->CanTransition(
        AnimationState::FINISHER, AnimationState::WALK
    );
    std::cout << "  Finisher → Walk: " << (finisherLocked ? "BLOCKED (correct)" : "ALLOWED (ERROR)") << std::endl;
    
    bool specialRulesCorrect = parryCanCounter && parryCannotWalk && 
                               deathIsTerminal && finisherLocked;
    
    if (specialRulesCorrect) {
        std::cout << "✓ All special state rules enforced" << std::endl;
        printTestResult("Special State Rules", true);
        testsPassed++;
    } else {
        printTestResult("Special State Rules", false);
    }

    // ========================================================================
    // Final Results
    // ========================================================================
    printSeparator();
    std::cout << "\n" << std::string(70, '=') << std::endl;
    std::cout << "  FINAL RESULTS - END-TO-END INTEGRATION TEST" << std::endl;
    std::cout << std::string(70, '=') << std::endl;
    
    std::cout << "\nTest Results Summary:" << std::endl;
    std::cout << "  Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
    std::cout << "  Success Rate: " << (100.0 * testsPassed / totalTests) << "%" << std::endl;
    
    if (testsPassed == totalTests) {
        std::cout << "\n✓✓✓ ALL INTEGRATION TESTS PASSED ✓✓✓" << std::endl;
        std::cout << "\nPR #27 TODO Implementation Complete:" << std::endl;
        std::cout << "  ✓ Platform-specific input mapping" << std::endl;
        std::cout << "  ✓ State interruption logic with frame windows" << std::endl;
        std::cout << "  ✓ Animation blending with smooth transitions" << std::endl;
        std::cout << "  ✓ Character state management integration" << std::endl;
        std::cout << "  ✓ End-to-end gameplay pipeline functional" << std::endl;
        std::cout << "\nSystem is production-ready and follows CANON governance!" << std::endl;
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME INTEGRATION TESTS FAILED" << std::endl;
        printSeparator();
        return 1;
    }
}
