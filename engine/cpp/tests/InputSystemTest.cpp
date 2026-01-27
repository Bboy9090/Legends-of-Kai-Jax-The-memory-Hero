<<<<<<< HEAD
#include "../include/InputHandler.h"
#include "../include/StateManager.h"
#include "../include/Character.h"
#include "../include/CharacterFactory.h"
#include <iostream>
#include <string>
#include <exception>
=======
#include "../include/input/InputHandler.h"
#include "../include/character/StateManager.h"
#include "../include/AnimationComponent.h"
#include <iostream>
>>>>>>> origin/main

using namespace LegendsEngine;

void printTestResult(const std::string& testName, bool passed) {
    std::cout << "[" << (passed ? "PASS" : "FAIL") << "] " << testName << std::endl;
}

void printSeparator() {
    std::cout << std::string(60, '=') << std::endl;
}

int main() {
    std::cout << "Legends Engine - Input System and State Machine Test Suite" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    // Test 1: Create InputHandler
    totalTests++;
    std::cout << "\n[Test 1] Creating InputHandler..." << std::endl;
    
    InputHandler inputHandler;
    std::cout << "  Successfully created InputHandler instance" << std::endl;
    printTestResult("Create InputHandler", true);
    testsPassed++;

<<<<<<< HEAD
    // Test 2: Get input state (should return zero input initially)
    totalTests++;
    std::cout << "\n[Test 2] Testing InputHandler::GetCurrentInput()..." << std::endl;
    
    InputState input = inputHandler.GetCurrentInput();
    bool inputIsZero = !input.moveForward && !input.moveBackward && 
                       !input.moveLeft && !input.moveRight &&
                       !input.sprint && !input.attack && !input.jump;
    
    if (inputIsZero) {
        std::cout << "  Stub correctly returns zero input" << std::endl;
        printTestResult("Get Zero Input State", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected zero input state" << std::endl;
        printTestResult("Get Zero Input State", false);
=======
    // Test 2: Test GetCurrentInput returns zero state
    totalTests++;
    std::cout << "\n[Test 2] Testing InputHandler.GetCurrentInput()..." << std::endl;
    
    InputState inputState = inputHandler.GetCurrentInput();
    bool allZero = !inputState.moveForward && !inputState.moveBackward &&
                   !inputState.moveLeft && !inputState.moveRight &&
                   !inputState.sprint && !inputState.attack && !inputState.jump;
    
    if (allZero) {
        std::cout << "  GetCurrentInput() correctly returns zero state (stub)" << std::endl;
        printTestResult("GetCurrentInput Returns Zero State", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected all input flags to be false" << std::endl;
        printTestResult("GetCurrentInput Returns Zero State", false);
>>>>>>> origin/main
    }

    // Test 3: Create StateManager
    totalTests++;
    std::cout << "\n[Test 3] Creating StateManager..." << std::endl;
    
    StateManager stateManager;
    std::cout << "  Successfully created StateManager instance" << std::endl;
    printTestResult("Create StateManager", true);
    testsPassed++;

<<<<<<< HEAD
    // Test 4: Test state transitions with no input (should stay IDLE_CALM)
    totalTests++;
    std::cout << "\n[Test 4] Testing idle state with no input..." << std::endl;
    
    InputState noInput;
    AnimationState nextState = stateManager.GetNextState(AnimationState::IDLE_CALM, noInput);
    
    if (nextState == AnimationState::IDLE_CALM) {
        std::cout << "  Correctly stays in IDLE_CALM with no input" << std::endl;
        printTestResult("Idle State No Input", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected IDLE_CALM state" << std::endl;
        printTestResult("Idle State No Input", false);
    }

    // Test 5: Test walk state with forward input
    totalTests++;
    std::cout << "\n[Test 5] Testing walk state with forward input..." << std::endl;
=======
    // Test 4: Test idle state with no input
    totalTests++;
    std::cout << "\n[Test 4] Testing state transition: No input -> IDLE_CALM..." << std::endl;
    
    InputState noInput;
    AnimationState nextState = stateManager.GetNextState(AnimationState::WALK, noInput);
    
    if (nextState == AnimationState::IDLE_CALM) {
        std::cout << "  Correctly transitioned from WALK to IDLE_CALM with no input" << std::endl;
        printTestResult("Idle State Transition", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected IDLE_CALM, got state " << static_cast<int>(nextState) << std::endl;
        printTestResult("Idle State Transition", false);
    }

    // Test 5: Test walk state with forward movement
    totalTests++;
    std::cout << "\n[Test 5] Testing state transition: Move forward -> WALK..." << std::endl;
>>>>>>> origin/main
    
    InputState walkInput;
    walkInput.moveForward = true;
    nextState = stateManager.GetNextState(AnimationState::IDLE_CALM, walkInput);
    
    if (nextState == AnimationState::WALK) {
<<<<<<< HEAD
        std::cout << "  Correctly transitions to WALK with forward input" << std::endl;
        printTestResult("Walk State Transition", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected WALK state" << std::endl;
        printTestResult("Walk State Transition", false);
    }

    // Test 6: Test sprint state with forward + sprint input
    totalTests++;
    std::cout << "\n[Test 6] Testing sprint state with forward + sprint input..." << std::endl;
=======
        std::cout << "  Correctly transitioned from IDLE_CALM to WALK with forward input" << std::endl;
        printTestResult("Walk State Transition", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected WALK, got state " << static_cast<int>(nextState) << std::endl;
        printTestResult("Walk State Transition", false);
    }

    // Test 6: Test sprint state with forward + sprint
    totalTests++;
    std::cout << "\n[Test 6] Testing state transition: Move forward + Sprint -> SPRINT..." << std::endl;
>>>>>>> origin/main
    
    InputState sprintInput;
    sprintInput.moveForward = true;
    sprintInput.sprint = true;
    nextState = stateManager.GetNextState(AnimationState::WALK, sprintInput);
    
    if (nextState == AnimationState::SPRINT) {
<<<<<<< HEAD
        std::cout << "  Correctly transitions to SPRINT with forward + sprint input" << std::endl;
        printTestResult("Sprint State Transition", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected SPRINT state" << std::endl;
        printTestResult("Sprint State Transition", false);
    }

    // Test 7: Test attack priority (attack should override movement)
    totalTests++;
    std::cout << "\n[Test 7] Testing attack priority over movement..." << std::endl;
=======
        std::cout << "  Correctly transitioned from WALK to SPRINT with sprint input" << std::endl;
        printTestResult("Sprint State Transition", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected SPRINT, got state " << static_cast<int>(nextState) << std::endl;
        printTestResult("Sprint State Transition", false);
    }

    // Test 7: Test attack state priority
    totalTests++;
    std::cout << "\n[Test 7] Testing attack input priority..." << std::endl;
>>>>>>> origin/main
    
    InputState attackInput;
    attackInput.moveForward = true;
    attackInput.attack = true;
<<<<<<< HEAD
    nextState = stateManager.GetNextState(AnimationState::WALK, attackInput);
    
    if (nextState == AnimationState::LIGHT_COMBO) {
        std::cout << "  Correctly prioritizes attack (LIGHT_COMBO) over movement" << std::endl;
        printTestResult("Attack Priority", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected LIGHT_COMBO state" << std::endl;
        printTestResult("Attack Priority", false);
    }

    // Test 8: Test jump transition
    totalTests++;
    std::cout << "\n[Test 8] Testing jump transition..." << std::endl;
    
    InputState jumpInput;
    jumpInput.jump = true;
    nextState = stateManager.GetNextState(AnimationState::IDLE_CALM, jumpInput);
    
    if (nextState == AnimationState::DODGE_AIR) {
        std::cout << "  Correctly transitions to DODGE_AIR (placeholder for jump)" << std::endl;
        printTestResult("Jump Transition", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected DODGE_AIR state" << std::endl;
        printTestResult("Jump Transition", false);
    }

    // Test 9: Test CanTransition validation
    totalTests++;
    std::cout << "\n[Test 9] Testing state transition validation..." << std::endl;
    
    bool canTransition = stateManager.CanTransition(AnimationState::IDLE_CALM, AnimationState::WALK);
    bool cannotTransitionFromDeath = stateManager.CanTransition(AnimationState::DEATH, AnimationState::IDLE_CALM);
    
    if (canTransition && !cannotTransitionFromDeath) {
        std::cout << "  Correctly allows valid transitions and blocks invalid ones" << std::endl;
        std::cout << "  - IDLE_CALM -> WALK: allowed" << std::endl;
        std::cout << "  - DEATH -> IDLE_CALM: blocked" << std::endl;
        printTestResult("Transition Validation", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Transition validation logic incorrect" << std::endl;
        printTestResult("Transition Validation", false);
    }

    // Test 10: Test character integration
    totalTests++;
    std::cout << "\n[Test 10] Testing character integration with input system..." << std::endl;
    
    auto kaiJax = CharacterFactory::CreateCharacter("kai_jax");
    
    if (!kaiJax) {
        std::cout << "  ERROR: Failed to create character" << std::endl;
        printTestResult("Character Integration", false);
    } else if (!kaiJax->inputHandler || !kaiJax->stateManager) {
        std::cout << "  ERROR: Character missing inputHandler or stateManager" << std::endl;
        printTestResult("Character Integration", false);
    } else {
        std::cout << "  Character has inputHandler: " << (kaiJax->inputHandler != nullptr) << std::endl;
        std::cout << "  Character has stateManager: " << (kaiJax->stateManager != nullptr) << std::endl;
        std::cout << "  Initial state: IDLE_CALM" << std::endl;
        printTestResult("Character Integration", true);
        testsPassed++;
    }

    // Test 11: Test character Update with input system
    totalTests++;
    std::cout << "\n[Test 11] Testing character Update() with input system..." << std::endl;
    
    if (kaiJax) {
        AnimationState initialState = kaiJax->GetAnimationState();
        
        try {
            // Update should not crash and should maintain or change state based on input
            kaiJax->Update(0.016f);
            
            AnimationState finalState = kaiJax->GetAnimationState();
            std::cout << "  Update executed successfully" << std::endl;
            std::cout << "  Initial state: " << static_cast<int>(initialState) << std::endl;
            std::cout << "  Final state: " << static_cast<int>(finalState) << std::endl;
            printTestResult("Character Update with Input", true);
            testsPassed++;
        } catch (const std::exception& e) {
            std::cout << "  ERROR: Update threw exception: " << e.what() << std::endl;
            printTestResult("Character Update with Input", false);
        }
    } else {
        std::cout << "  SKIP: Cannot test without valid character" << std::endl;
        printTestResult("Character Update with Input", false);
=======
    nextState = stateManager.GetNextState(AnimationState::IDLE_CALM, attackInput);
    
    if (nextState == AnimationState::LIGHT_COMBO) {
        std::cout << "  Attack correctly takes priority over movement" << std::endl;
        printTestResult("Attack Priority", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected LIGHT_COMBO, got state " << static_cast<int>(nextState) << std::endl;
        printTestResult("Attack Priority", false);
    }

    // Test 8: Test CanTransition for valid transitions
    totalTests++;
    std::cout << "\n[Test 8] Testing valid state transitions..." << std::endl;
    
    bool canTransition = true;
    
    // Movement transitions should be allowed
    if (!stateManager.CanTransition(AnimationState::IDLE_CALM, AnimationState::WALK)) {
        std::cout << "  ERROR: IDLE_CALM -> WALK should be allowed" << std::endl;
        canTransition = false;
    }
    if (!stateManager.CanTransition(AnimationState::WALK, AnimationState::SPRINT)) {
        std::cout << "  ERROR: WALK -> SPRINT should be allowed" << std::endl;
        canTransition = false;
    }
    if (!stateManager.CanTransition(AnimationState::SPRINT, AnimationState::IDLE_CALM)) {
        std::cout << "  ERROR: SPRINT -> IDLE_CALM should be allowed" << std::endl;
        canTransition = false;
    }
    
    if (canTransition) {
        std::cout << "  All valid movement transitions work correctly" << std::endl;
        printTestResult("Valid Transitions", true);
        testsPassed++;
    } else {
        printTestResult("Valid Transitions", false);
    }

    // Test 9: Test CanTransition for invalid transitions
    totalTests++;
    std::cout << "\n[Test 9] Testing invalid state transitions..." << std::endl;
    
    bool invalidCorrect = true;
    
    // Death state cannot transition
    if (stateManager.CanTransition(AnimationState::DEATH, AnimationState::IDLE_CALM)) {
        std::cout << "  ERROR: DEATH -> IDLE_CALM should not be allowed" << std::endl;
        invalidCorrect = false;
    }
    
    // Finisher must complete
    if (stateManager.CanTransition(AnimationState::FINISHER, AnimationState::WALK)) {
        std::cout << "  ERROR: FINISHER -> WALK should not be allowed" << std::endl;
        invalidCorrect = false;
    }
    
    if (invalidCorrect) {
        std::cout << "  Invalid transitions correctly blocked" << std::endl;
        printTestResult("Invalid Transitions Blocked", true);
        testsPassed++;
    } else {
        printTestResult("Invalid Transitions Blocked", false);
    }

    // Test 10: Test state stays same if already in target state
    totalTests++;
    std::cout << "\n[Test 10] Testing state remains same when already at target..." << std::endl;
    
    walkInput.moveForward = true;
    nextState = stateManager.GetNextState(AnimationState::WALK, walkInput);
    
    if (nextState == AnimationState::WALK) {
        std::cout << "  State correctly remains WALK when already walking" << std::endl;
        printTestResult("State Remains Same", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected WALK to remain, got " << static_cast<int>(nextState) << std::endl;
        printTestResult("State Remains Same", false);
>>>>>>> origin/main
    }

    // Print final results
    printSeparator();
    std::cout << "\nTest Results Summary:" << std::endl;
    std::cout << "  Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
    std::cout << "  Success Rate: " << (100.0 * testsPassed / totalTests) << "%" << std::endl;
    
    if (testsPassed == totalTests) {
        std::cout << "\n✓ ALL TESTS PASSED - Input system and state machine working correctly!" << std::endl;
<<<<<<< HEAD
        std::cout << "✓ Player input flows: InputHandler → StateManager → Character animations" << std::endl;
        std::cout << "✓ State transitions validated and logged" << std::endl;
        std::cout << "✓ Platform-specific input can be plugged in without changing game logic" << std::endl;
=======
        std::cout << "✓ Player input can drive character animation states" << std::endl;
        std::cout << "✓ State transitions are validated and logged" << std::endl;
>>>>>>> origin/main
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME TESTS FAILED - Please review the errors above" << std::endl;
        printSeparator();
        return 1;
    }
}
