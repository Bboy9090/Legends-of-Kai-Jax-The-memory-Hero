#include "../include/AnimationComponent.h"
#include "../include/CharacterTypes.h"
#include "../include/CharacterFactory.h"
#include <iostream>
#include <cassert>

using namespace LegendsEngine;

void printTestResult(const std::string& testName, bool passed) {
    std::cout << "[" << (passed ? "PASS" : "FAIL") << "] " << testName << std::endl;
}

void printSeparator() {
    std::cout << std::string(60, '=') << std::endl;
}

int main() {
    std::cout << "Legends Engine - Animation Component Test Suite" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    // Test 1: Create AnimationSpec and load animation sets
    totalTests++;
    std::cout << "\n[Test 1] Testing LoadAnimationSets with AnimationSpec..." << std::endl;
    
    AnimationComponent animComp;
    AnimationSpec testSpec;
    
    // Populate test spec with animation sets
    AnimationSet idleSet;
    idleSet.name = "idle_calm";
    idleSet.path = "./assets/anims/kai_jax_idle_calm.anim";
    testSpec.sets.push_back(idleSet);
    
    AnimationSet walkSet;
    walkSet.name = "walk";
    walkSet.path = "./assets/anims/kai_jax_walk.anim";
    testSpec.sets.push_back(walkSet);
    
    AnimationSet runSet;
    runSet.name = "run";
    runSet.path = "./assets/anims/kai_jax_run.anim";
    testSpec.sets.push_back(runSet);
    
    animComp.LoadAnimationSets(testSpec);
    
    bool loaded = animComp.HasAnimation(AnimationState::IDLE_CALM) &&
                  animComp.HasAnimation(AnimationState::WALK) &&
                  animComp.HasAnimation(AnimationState::RUN);
    
    if (loaded) {
        std::cout << "  Successfully loaded animation sets" << std::endl;
        std::cout << "  IDLE_CALM path: " << animComp.GetAnimationPath(AnimationState::IDLE_CALM) << std::endl;
        std::cout << "  WALK path: " << animComp.GetAnimationPath(AnimationState::WALK) << std::endl;
        std::cout << "  RUN path: " << animComp.GetAnimationPath(AnimationState::RUN) << std::endl;
        testsPassed++;
    } else {
        std::cout << "  ERROR: Failed to load animation sets" << std::endl;
    }
    printTestResult("Load Animation Sets", loaded);

    // Test 2: Test HasAnimation method
    totalTests++;
    std::cout << "\n[Test 2] Testing HasAnimation method..." << std::endl;
    
    bool hasIdle = animComp.HasAnimation(AnimationState::IDLE_CALM);
    bool hasWalk = animComp.HasAnimation(AnimationState::WALK);
    bool hasNonExistent = animComp.HasAnimation(AnimationState::DODGE_AIR);
    
    bool hasAnimationWorks = hasIdle && hasWalk && !hasNonExistent;
    
    if (hasAnimationWorks) {
        std::cout << "  HasAnimation(IDLE_CALM): " << (hasIdle ? "true" : "false") << std::endl;
        std::cout << "  HasAnimation(WALK): " << (hasWalk ? "true" : "false") << std::endl;
        std::cout << "  HasAnimation(DODGE_AIR): " << (hasNonExistent ? "true" : "false") << std::endl;
        testsPassed++;
    } else {
        std::cout << "  ERROR: HasAnimation not working correctly" << std::endl;
    }
    printTestResult("Has Animation Method", hasAnimationWorks);

    // Test 3: Test GetAnimationPath method
    totalTests++;
    std::cout << "\n[Test 3] Testing GetAnimationPath method..." << std::endl;
    
    const std::string& idlePath = animComp.GetAnimationPath(AnimationState::IDLE_CALM);
    const std::string& nonExistentPath = animComp.GetAnimationPath(AnimationState::DODGE_AIR);
    
    bool pathsCorrect = (idlePath == "./assets/anims/kai_jax_idle_calm.anim") && 
                        nonExistentPath.empty();
    
    if (pathsCorrect) {
        std::cout << "  IDLE_CALM path: " << idlePath << std::endl;
        std::cout << "  DODGE_AIR path (should be empty): '" << nonExistentPath << "'" << std::endl;
        testsPassed++;
    } else {
        std::cout << "  ERROR: Animation paths incorrect" << std::endl;
        std::cout << "  Expected idle path: ./assets/anims/kai_jax_idle_calm.anim" << std::endl;
        std::cout << "  Got: " << idlePath << std::endl;
    }
    printTestResult("Get Animation Path", pathsCorrect);

    // Test 4: Test PlayAnimation method (stub)
    totalTests++;
    std::cout << "\n[Test 4] Testing PlayAnimation stub method..." << std::endl;
    
    bool playWorked = true;
    try {
        std::cout << "  Calling PlayAnimation(IDLE_CALM):" << std::endl;
        std::cout << "    ";
        animComp.PlayAnimation(AnimationState::IDLE_CALM);
        
        std::cout << "  Calling PlayAnimation(DODGE_AIR) - should warn:" << std::endl;
        std::cout << "    ";
        animComp.PlayAnimation(AnimationState::DODGE_AIR);
        
        testsPassed++;
    } catch (const std::exception& e) {
        std::cout << "  ERROR: PlayAnimation threw exception: " << e.what() << std::endl;
        playWorked = false;
    }
    printTestResult("Play Animation Stub", playWorked);

    // Test 5: Test animation component integration with Character
    totalTests++;
    std::cout << "\n[Test 5] Testing AnimationComponent integration with Character..." << std::endl;
    
    auto kaiJax = CharacterFactory::CreateCharacter("kai_jax");
    
    if (!kaiJax) {
        std::cout << "  ERROR: Failed to create character" << std::endl;
        printTestResult("Character Integration", false);
    } else {
        // Check if animations were loaded
        bool hasIdleCombat = kaiJax->animationComponent.HasAnimation(AnimationState::IDLE_COMBAT);
        bool hasSprint = kaiJax->animationComponent.HasAnimation(AnimationState::SPRINT);
        
        bool integrationWorks = hasIdleCombat && hasSprint;
        
        if (integrationWorks) {
            std::cout << "  Character has animation component with loaded animations" << std::endl;
            std::cout << "  Sample animation paths:" << std::endl;
            std::cout << "    IDLE_COMBAT: " << kaiJax->animationComponent.GetAnimationPath(AnimationState::IDLE_COMBAT) << std::endl;
            std::cout << "    SPRINT: " << kaiJax->animationComponent.GetAnimationPath(AnimationState::SPRINT) << std::endl;
            testsPassed++;
        } else {
            std::cout << "  ERROR: Animation component not properly integrated" << std::endl;
            std::cout << "  HasAnimation(IDLE_COMBAT): " << hasIdleCombat << std::endl;
            std::cout << "  HasAnimation(SPRINT): " << hasSprint << std::endl;
        }
        printTestResult("Character Integration", integrationWorks);
    }

    // Test 6: Test all required animation sets loaded for Kai-Jax
    totalTests++;
    std::cout << "\n[Test 6] Verifying all required animations loaded for Kai-Jax..." << std::endl;
    
    if (!kaiJax) {
        std::cout << "  ERROR: Cannot test without valid character" << std::endl;
        printTestResult("All Required Animations", false);
    } else {
        // Check key animations from the required_sets in kai_jax.character.json
        bool allLoaded = true;
        std::vector<std::pair<AnimationState, std::string>> requiredAnims = {
            {AnimationState::IDLE_CALM, "idle_calm"},
            {AnimationState::IDLE_COMBAT, "idle_combat"},
            {AnimationState::WALK, "walk"},
            {AnimationState::RUN, "run"},
            {AnimationState::SPRINT, "sprint"},
            {AnimationState::PARRY, "parry"},
            {AnimationState::COUNTER, "counter"}
        };
        
        for (const auto& anim : requiredAnims) {
            if (!kaiJax->animationComponent.HasAnimation(anim.first)) {
                std::cout << "  ERROR: Missing animation: " << anim.second << std::endl;
                allLoaded = false;
            }
        }
        
        if (allLoaded) {
            std::cout << "  All required animations loaded successfully" << std::endl;
            std::cout << "  Verified " << requiredAnims.size() << " key animations (more available in specification)" << std::endl;
            testsPassed++;
        } else {
            std::cout << "  ERROR: Some required animations are missing" << std::endl;
        }
        printTestResult("All Required Animations", allLoaded);
    }

    // Print final results
    printSeparator();
    std::cout << "\nTest Results Summary:" << std::endl;
    std::cout << "  Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
    std::cout << "  Success Rate: " << (100.0 * testsPassed / totalTests) << "%" << std::endl;
    
    if (testsPassed == totalTests) {
        std::cout << "\n✓ ALL TESTS PASSED - AnimationComponent is working correctly!" << std::endl;
        std::cout << "✓ Animation loading and playback integration complete" << std::endl;
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME TESTS FAILED - Please review the errors above" << std::endl;
        printSeparator();
        return 1;
    }
}
