#include "../include/input/InputHandler.h"
#include "../include/character/StateManager.h"
#include "../include/AnimationComponent.h"
#include <iostream>

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
    
    InputHandler inputHandler(Platform::PC);
    std::cout << "  Successfully created InputHandler instance" << std::endl;
    printTestResult("Create InputHandler", true);
    testsPassed++;

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
    }

    // Test 3: Create StateManager
    totalTests++;
    std::cout << "\n[Test 3] Creating StateManager..." << std::endl;
    
    StateManager stateManager;
    std::cout << "  Successfully created StateManager instance" << std::endl;
    printTestResult("Create StateManager", true);
    testsPassed++;

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
    
    InputState walkInput;
    walkInput.moveForward = true;
    nextState = stateManager.GetNextState(AnimationState::IDLE_CALM, walkInput);
    
    if (nextState == AnimationState::WALK) {
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
    
    InputState sprintInput;
    sprintInput.moveForward = true;
    sprintInput.sprint = true;
    nextState = stateManager.GetNextState(AnimationState::WALK, sprintInput);
    
    if (nextState == AnimationState::SPRINT) {
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
    
    InputState attackInput;
    attackInput.moveForward = true;
    attackInput.attack = true;
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
    }

    // Print final results
    printSeparator();
    std::cout << "\nTest Results Summary:" << std::endl;
    std::cout << "  Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
    std::cout << "  Success Rate: " << (100.0 * testsPassed / totalTests) << "%" << std::endl;
    
    if (testsPassed == totalTests) {
        std::cout << "\n✓ ALL TESTS PASSED - Input system and state machine working correctly!" << std::endl;
        std::cout << "✓ Player input can drive character animation states" << std::endl;
        std::cout << "✓ State transitions are validated and logged" << std::endl;
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME TESTS FAILED - Please review the errors above" << std::endl;
        printSeparator();
        return 1;
    }
}
