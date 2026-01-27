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
    std::cout << "Legends Engine - Character Factory Test Suite" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    // Test 1: Create Kai-Jax character instance
    totalTests++;
    std::cout << "\n[Test 1] Creating Kai-Jax character via CharacterFactory..." << std::endl;
    
    auto kaiJax = CharacterFactory::CreateCharacter("kai_jax");
    
    if (!kaiJax) {
        std::cout << "  ERROR: Failed to create character" << std::endl;
        printTestResult("Create Kai-Jax Character", false);
    } else {
        std::cout << "  Successfully created character instance" << std::endl;
        printTestResult("Create Kai-Jax Character", true);
        testsPassed++;
    }

    if (!kaiJax) {
        std::cout << "\nCannot continue tests without valid character." << std::endl;
        printSeparator();
        std::cout << "Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
        return 1;
    }

    // Test 2: Verify character has initialized state
    totalTests++;
    std::cout << "\n[Test 2] Verifying character state initialization..." << std::endl;
    bool stateValid = true;

    if (kaiJax->health != 100.0f) {
        std::cout << "  ERROR: Health should be 100.0f, got " << kaiJax->health << std::endl;
        stateValid = false;
    }

    if (kaiJax->position.x != 0.0f || kaiJax->position.y != 0.0f || kaiJax->position.z != 0.0f) {
        std::cout << "  ERROR: Position should be (0,0,0), got (" 
                  << kaiJax->position.x << "," 
                  << kaiJax->position.y << "," 
                  << kaiJax->position.z << ")" << std::endl;
        stateValid = false;
    }

    if (kaiJax->rotation.x != 0.0f || kaiJax->rotation.y != 0.0f || 
        kaiJax->rotation.z != 0.0f || kaiJax->rotation.w != 1.0f) {
        std::cout << "  ERROR: Rotation should be identity quaternion (0,0,0,1)" << std::endl;
        stateValid = false;
    }

    if (stateValid) {
        std::cout << "  Health: " << kaiJax->health << std::endl;
        std::cout << "  Position: (" << kaiJax->position.x << ", " 
                  << kaiJax->position.y << ", " << kaiJax->position.z << ")" << std::endl;
        std::cout << "  Rotation: (" << kaiJax->rotation.x << ", " 
                  << kaiJax->rotation.y << ", " << kaiJax->rotation.z 
                  << ", " << kaiJax->rotation.w << ")" << std::endl;
        testsPassed++;
    }
    printTestResult("Verify Character State", stateValid);

    // Test 3: Verify Update method can be called without crashing
    totalTests++;
    std::cout << "\n[Test 3] Testing Update method..." << std::endl;
    bool updateWorked = true;

    try {
        kaiJax->Update(0.016f); // Simulate 60 FPS frame time
        std::cout << "  Update(0.016f) executed successfully" << std::endl;
        testsPassed++;
    } catch (const std::exception& e) {
        std::cout << "  ERROR: Update threw exception: " << e.what() << std::endl;
        updateWorked = false;
    }
    printTestResult("Call Update Method", updateWorked);

    // Test 4: Verify Render method can be called without crashing
    totalTests++;
    std::cout << "\n[Test 4] Testing Render method..." << std::endl;
    bool renderWorked = true;

    try {
        kaiJax->Render();
        std::cout << "  Render() executed successfully" << std::endl;
        testsPassed++;
    } catch (const std::exception& e) {
        std::cout << "  ERROR: Render threw exception: " << e.what() << std::endl;
        renderWorked = false;
    }
    printTestResult("Call Render Method", renderWorked);

    // Test 5: Test multiple character creation
    totalTests++;
    std::cout << "\n[Test 5] Testing multiple character instances..." << std::endl;
    bool multipleInstancesWork = true;

    auto kaiJax2 = CharacterFactory::CreateCharacter("kai_jax");
    
    if (!kaiJax2) {
        std::cout << "  ERROR: Failed to create second character instance" << std::endl;
        multipleInstancesWork = false;
    } else if (kaiJax.get() == kaiJax2.get()) {
        std::cout << "  ERROR: Two characters should have different addresses" << std::endl;
        multipleInstancesWork = false;
    } else {
        std::cout << "  Successfully created second independent character instance" << std::endl;
        std::cout << "  Character 1 address: " << kaiJax.get() << std::endl;
        std::cout << "  Character 2 address: " << kaiJax2.get() << std::endl;
        testsPassed++;
    }
    printTestResult("Multiple Character Instances", multipleInstancesWork);

    // Test 6: Test invalid character ID handling
    totalTests++;
    std::cout << "\n[Test 6] Testing invalid character ID handling..." << std::endl;
    
    auto invalidChar = CharacterFactory::CreateCharacter("nonexistent_character");
    
    if (invalidChar) {
        std::cout << "  ERROR: Should return nullptr for invalid character ID" << std::endl;
        printTestResult("Invalid Character Handling", false);
    } else {
        std::cout << "  Correctly returned nullptr for invalid character ID" << std::endl;
        printTestResult("Invalid Character Handling", true);
        testsPassed++;
    }

    // Print final results
    printSeparator();
    std::cout << "\nTest Results Summary:" << std::endl;
    std::cout << "  Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
    std::cout << "  Success Rate: " << (100.0 * testsPassed / totalTests) << "%" << std::endl;
    
    if (testsPassed == totalTests) {
        std::cout << "\n✓ ALL TESTS PASSED - CharacterFactory is working correctly!" << std::endl;
        std::cout << "✓ Character instances can be created, updated, and rendered" << std::endl;
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME TESTS FAILED - Please review the errors above" << std::endl;
        printSeparator();
        return 1;
    }
}
