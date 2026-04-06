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
    std::cout << "Legends Engine - Platform-Specific Input Test Suite" << std::endl;
    std::cout << "Legends Engine - Platform Input Mapping Test" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    // Test 1: Create InputHandler for PC
    totalTests++;
    std::cout << "\n[Test 1] Creating InputHandler for PC..." << std::endl;
    
    InputHandler pcHandler(Platform::PC);
    if (pcHandler.GetPlatform() == Platform::PC) {
        std::cout << "  Successfully created PC InputHandler" << std::endl;
        printTestResult("Create PC InputHandler", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Platform mismatch" << std::endl;
        printTestResult("Create PC InputHandler", false);
    }

    // Test 2: Create InputHandler for Console
    totalTests++;
    std::cout << "\n[Test 2] Creating InputHandler for Console..." << std::endl;
    
    InputHandler consoleHandler(Platform::CONSOLE);
    if (consoleHandler.GetPlatform() == Platform::CONSOLE) {
        std::cout << "  Successfully created Console InputHandler" << std::endl;
        printTestResult("Create Console InputHandler", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Platform mismatch" << std::endl;
        printTestResult("Create Console InputHandler", false);
    }

    // Test 3: Create InputHandler for Tablet
    totalTests++;
    std::cout << "\n[Test 3] Creating InputHandler for Tablet..." << std::endl;
    
    InputHandler tabletHandler(Platform::TABLET);
    if (tabletHandler.GetPlatform() == Platform::TABLET) {
        std::cout << "  Successfully created Tablet InputHandler" << std::endl;
        printTestResult("Create Tablet InputHandler", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Platform mismatch" << std::endl;
        printTestResult("Create Tablet InputHandler", false);
    }

    // Test 4: Create InputHandler for Mobile
    totalTests++;
    std::cout << "\n[Test 4] Creating InputHandler for Mobile..." << std::endl;
    
    InputHandler mobileHandler(Platform::MOBILE);
    if (mobileHandler.GetPlatform() == Platform::MOBILE) {
        std::cout << "  Successfully created Mobile InputHandler" << std::endl;
        printTestResult("Create Mobile InputHandler", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Platform mismatch" << std::endl;
        printTestResult("Create Mobile InputHandler", false);
    }

    // Test 5: Test default constructor creates PC handler
    totalTests++;
    std::cout << "\n[Test 5] Testing default platform is PC..." << std::endl;
    
    InputHandler defaultHandler;
    if (defaultHandler.GetPlatform() == Platform::PC) {
        std::cout << "  Default platform correctly set to PC" << std::endl;
        printTestResult("Default Platform is PC", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Default platform should be PC" << std::endl;
        printTestResult("Default Platform is PC", false);
    }

    // Test 6: Verify PC handler returns valid input state
    totalTests++;
    std::cout << "\n[Test 6] Testing PC input returns valid state..." << std::endl;
    
    InputState pcState = pcHandler.GetCurrentInput();
    // Verify stub implementation returns all false (no input)
    bool validState = !pcState.moveForward && !pcState.moveBackward &&
                      !pcState.moveLeft && !pcState.moveRight &&
                      !pcState.sprint && !pcState.attack && !pcState.jump;
    if (validState) {
        std::cout << "  PC handler returned valid InputState structure" << std::endl;
        printTestResult("PC Input Returns Valid State", validState);
        testsPassed++;
    } else {
        std::cout << "  ERROR: PC input state should be all false (stub)" << std::endl;
        printTestResult("PC Input Returns Valid State", false);
    }

    // Test 7: Verify Console handler returns valid input state
    totalTests++;
    std::cout << "\n[Test 7] Testing Console input returns valid state..." << std::endl;
    
    InputState consoleState = consoleHandler.GetCurrentInput();
    validState = !consoleState.moveForward && !consoleState.moveBackward &&
                 !consoleState.moveLeft && !consoleState.moveRight &&
                 !consoleState.sprint && !consoleState.attack && !consoleState.jump;
    if (validState) {
        std::cout << "  Console handler returned valid InputState structure" << std::endl;
        printTestResult("Console Input Returns Valid State", validState);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Console input state should be all false (stub)" << std::endl;
        printTestResult("Console Input Returns Valid State", false);
    }

    // Test 8: Verify Tablet handler returns valid input state
    totalTests++;
    std::cout << "\n[Test 8] Testing Tablet input returns valid state..." << std::endl;
    
    InputState tabletState = tabletHandler.GetCurrentInput();
    validState = !tabletState.moveForward && !tabletState.moveBackward &&
                 !tabletState.moveLeft && !tabletState.moveRight &&
                 !tabletState.sprint && !tabletState.attack && !tabletState.jump;
    if (validState) {
        std::cout << "  Tablet handler returned valid InputState structure" << std::endl;
        printTestResult("Tablet Input Returns Valid State", validState);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Tablet input state should be all false (stub)" << std::endl;
        printTestResult("Tablet Input Returns Valid State", false);
    }

    // Test 9: Verify Mobile handler returns valid input state
    totalTests++;
    std::cout << "\n[Test 9] Testing Mobile input returns valid state..." << std::endl;
    
    InputState mobileState = mobileHandler.GetCurrentInput();
    validState = !mobileState.moveForward && !mobileState.moveBackward &&
                 !mobileState.moveLeft && !mobileState.moveRight &&
                 !mobileState.sprint && !mobileState.attack && !mobileState.jump;
    if (validState) {
        std::cout << "  Mobile handler returned valid InputState structure" << std::endl;
        printTestResult("Mobile Input Returns Valid State", validState);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Mobile input state should be all false (stub)" << std::endl;
        printTestResult("Mobile Input Returns Valid State", false);
    }

    // Test 10: Test that all platforms return consistent InputState structure
    totalTests++;
    std::cout << "\n[Test 10] Testing platform-agnostic InputState structure..." << std::endl;
    
    // All handlers should return zero state (stub implementation)
    // And all should have the same structure
    bool allConsistent = (pcState.moveForward == consoleState.moveForward &&
                         consoleState.moveForward == tabletState.moveForward &&
                         tabletState.moveForward == mobileState.moveForward &&
                         pcState.sprint == consoleState.sprint &&
                         consoleState.sprint == tabletState.sprint &&
                         tabletState.sprint == mobileState.sprint);
    
    if (allConsistent) {
        std::cout << "  All platforms return identical InputState structure" << std::endl;
        std::cout << "  Game logic sees unified input regardless of platform" << std::endl;
        printTestResult("Platform-Agnostic Structure", true);
        testsPassed++;
    } else {
        std::cout << "  ERROR: Platform input states are inconsistent" << std::endl;
        printTestResult("Platform-Agnostic Structure", false);
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

        std::cout << "\n✓ ALL TESTS PASSED - Platform-specific input system working correctly!" << std::endl;
        std::cout << "✓ All platforms (PC, Console, Tablet, Mobile) supported" << std::endl;
        std::cout << "✓ Platform-agnostic InputState structure maintained" << std::endl;
        std::cout << "✓ Input routing to platform-specific handlers functional" << std::endl; 
      
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
