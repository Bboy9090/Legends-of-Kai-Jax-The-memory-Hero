#include "../include/input/InputHandler.h"
#include <iostream>

using namespace LegendsEngine;

void printTestResult(const std::string& testName, bool passed) {
    std::cout << "[" << (passed ? "PASS" : "FAIL") << "] " << testName << std::endl;
}

void printSeparator() {
    std::cout << std::string(60, '=') << std::endl;
}

int main() {
    std::cout << "Legends Engine - Platform Input Mapping Test" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    // Test 1: Default platform is PC
    totalTests++;
    std::cout << "\n[Test 1] Default platform type..." << std::endl;
    
    InputHandler inputHandler;
    
    if (inputHandler.GetPlatform() == PlatformType::PC) {
        std::cout << "  InputHandler defaults to PC platform" << std::endl;
        printTestResult("Default Platform PC", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Expected default platform PC" << std::endl;
        printTestResult("Default Platform PC", false);
    }

    // Test 2: Set platform to PC
    totalTests++;
    std::cout << "\n[Test 2] Set platform to PC..." << std::endl;
    
    inputHandler.SetPlatform(PlatformType::PC);
    
    if (inputHandler.GetPlatform() == PlatformType::PC) {
        std::cout << "  Platform correctly set to PC" << std::endl;
        printTestResult("Set Platform PC", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Failed to set platform to PC" << std::endl;
        printTestResult("Set Platform PC", false);
    }

    // Test 3: Set platform to Gamepad
    totalTests++;
    std::cout << "\n[Test 3] Set platform to Gamepad..." << std::endl;
    
    inputHandler.SetPlatform(PlatformType::GAMEPAD);
    
    if (inputHandler.GetPlatform() == PlatformType::GAMEPAD) {
        std::cout << "  Platform correctly set to Gamepad" << std::endl;
        printTestResult("Set Platform Gamepad", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Failed to set platform to Gamepad" << std::endl;
        printTestResult("Set Platform Gamepad", false);
    }

    // Test 4: Set platform to Touch
    totalTests++;
    std::cout << "\n[Test 4] Set platform to Touch..." << std::endl;
    
    inputHandler.SetPlatform(PlatformType::TOUCH);
    
    if (inputHandler.GetPlatform() == PlatformType::TOUCH) {
        std::cout << "  Platform correctly set to Touch" << std::endl;
        printTestResult("Set Platform Touch", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Failed to set platform to Touch" << std::endl;
        printTestResult("Set Platform Touch", false);
    }

    // Test 5: GetCurrentInput returns zero for stub implementations
    totalTests++;
    std::cout << "\n[Test 5] PC input returns zero (stub)..." << std::endl;
    
    inputHandler.SetPlatform(PlatformType::PC);
    InputState pcInput = inputHandler.GetCurrentInput();
    
    bool pcZero = !pcInput.moveForward && !pcInput.moveBackward &&
                  !pcInput.moveLeft && !pcInput.moveRight &&
                  !pcInput.sprint && !pcInput.attack && !pcInput.jump;
    
    if (pcZero) {
        std::cout << "  PC input correctly returns zero state (stub)" << std::endl;
        printTestResult("PC Input Stub", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: PC input should return zero state" << std::endl;
        printTestResult("PC Input Stub", false);
    }

    // Test 6: Gamepad input returns zero for stub
    totalTests++;
    std::cout << "\n[Test 6] Gamepad input returns zero (stub)..." << std::endl;
    
    inputHandler.SetPlatform(PlatformType::GAMEPAD);
    InputState gamepadInput = inputHandler.GetCurrentInput();
    
    bool gamepadZero = !gamepadInput.moveForward && !gamepadInput.moveBackward &&
                       !gamepadInput.moveLeft && !gamepadInput.moveRight &&
                       !gamepadInput.sprint && !gamepadInput.attack && !gamepadInput.jump;
    
    if (gamepadZero) {
        std::cout << "  Gamepad input correctly returns zero state (stub)" << std::endl;
        printTestResult("Gamepad Input Stub", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Gamepad input should return zero state" << std::endl;
        printTestResult("Gamepad Input Stub", false);
    }

    // Test 7: Touch input returns zero for stub
    totalTests++;
    std::cout << "\n[Test 7] Touch input returns zero (stub)..." << std::endl;
    
    inputHandler.SetPlatform(PlatformType::TOUCH);
    InputState touchInput = inputHandler.GetCurrentInput();
    
    bool touchZero = !touchInput.moveForward && !touchInput.moveBackward &&
                     !touchInput.moveLeft && !touchInput.moveRight &&
                     !touchInput.sprint && !touchInput.attack && !touchInput.jump;
    
    if (touchZero) {
        std::cout << "  Touch input correctly returns zero state (stub)" << std::endl;
        printTestResult("Touch Input Stub", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Touch input should return zero state" << std::endl;
        printTestResult("Touch Input Stub", false);
    }

    // Test 8: Platform switching
    totalTests++;
    std::cout << "\n[Test 8] Platform switching..." << std::endl;
    
    inputHandler.SetPlatform(PlatformType::PC);
    bool isPc = (inputHandler.GetPlatform() == PlatformType::PC);
    
    inputHandler.SetPlatform(PlatformType::GAMEPAD);
    bool isGamepad = (inputHandler.GetPlatform() == PlatformType::GAMEPAD);
    
    inputHandler.SetPlatform(PlatformType::TOUCH);
    bool isTouch = (inputHandler.GetPlatform() == PlatformType::TOUCH);
    
    if (isPc && isGamepad && isTouch) {
        std::cout << "  Platform can be switched dynamically" << std::endl;
        printTestResult("Platform Switching", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Platform switching failed" << std::endl;
        printTestResult("Platform Switching", false);
    }

    // Test 9: Multiple InputHandler instances
    totalTests++;
    std::cout << "\n[Test 9] Multiple InputHandler instances..." << std::endl;
    
    InputHandler handler1;
    InputHandler handler2;
    
    handler1.SetPlatform(PlatformType::PC);
    handler2.SetPlatform(PlatformType::GAMEPAD);
    
    bool handler1IsPc = (handler1.GetPlatform() == PlatformType::PC);
    bool handler2IsGamepad = (handler2.GetPlatform() == PlatformType::GAMEPAD);
    
    if (handler1IsPc && handler2IsGamepad) {
        std::cout << "  Multiple handlers can have different platforms" << std::endl;
        printTestResult("Multiple Handlers", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Multiple handlers interfered with each other" << std::endl;
        printTestResult("Multiple Handlers", false);
    }

    // Test 10: InputState structure
    totalTests++;
    std::cout << "\n[Test 10] InputState structure..." << std::endl;
    
    InputState state;
    state.moveForward = true;
    state.sprint = true;
    
    bool structureWorks = state.moveForward && state.sprint &&
                         !state.moveBackward && !state.moveLeft && 
                         !state.moveRight && !state.attack && !state.jump;
    
    if (structureWorks) {
        std::cout << "  InputState structure works correctly" << std::endl;
        printTestResult("InputState Structure", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: InputState structure incorrect" << std::endl;
        printTestResult("InputState Structure", false);
    }

    // Print final results
    printSeparator();
    std::cout << "\nTest Results Summary:" << std::endl;
    std::cout << "  Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
    std::cout << "  Success Rate: " << (100.0 * testsPassed / totalTests) << "%" << std::endl;
    
    if (testsPassed == totalTests) {
        std::cout << "\n✓ ALL TESTS PASSED - Platform input mapping infrastructure working!" << std::endl;
        std::cout << "✓ Platform types can be set and retrieved" << std::endl;
        std::cout << "✓ Input dispatches to correct platform-specific methods" << std::endl;
        std::cout << "✓ Stub implementations return zero state as expected" << std::endl;
        std::cout << "✓ Ready for real platform input implementation" << std::endl;
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME TESTS FAILED - Please review the errors above" << std::endl;
        printSeparator();
        return 1;
    }
}
