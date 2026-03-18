#include "../include/CharacterLoader.h"
#include <iostream>
#include <iomanip>

using namespace LegendsEngine;

void printTestResult(const std::string& testName, bool passed) {
    std::cout << "[" << (passed ? "PASS" : "FAIL") << "] " << testName << std::endl;
}

void printSeparator() {
    std::cout << std::string(60, '=') << std::endl;
}

int main() {
    std::cout << "Legends Engine - Character Loader Test Suite" << std::endl;
    printSeparator();

    int testsPassed = 0;
    int totalTests = 0;

    // Test 1: Load Kai-Jax character specification
    totalTests++;
    std::cout << "\n[Test 1] Loading kai_jax.character.json..." << std::endl;
    
    std::string kaiJaxPath = "../../../kai_jax.character.json";
    auto kaiJax = CharacterLoader::loadFromFile(kaiJaxPath);
    
    if (!kaiJax) {
        std::cout << "  ERROR: Failed to create character specification object" << std::endl;
        printTestResult("Load Kai-Jax JSON", false);
    } else if (!kaiJax->isValid()) {
        std::cout << "  ERROR: " << kaiJax->getValidationError() << std::endl;
        printTestResult("Load Kai-Jax JSON", false);
    } else {
        std::cout << "  Successfully loaded: " << kaiJax->getDisplayName() << std::endl;
        printTestResult("Load Kai-Jax JSON", true);
        testsPassed++;
    }

    if (!kaiJax || !kaiJax->isValid()) {
        std::cout << "\nCannot continue tests without valid character data." << std::endl;
        printSeparator();
        std::cout << "Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
        return 1;
    }

    // Test 2: Verify character metadata
    totalTests++;
    std::cout << "\n[Test 2] Verifying character metadata..." << std::endl;
    bool metadataValid = true;
    
    if (kaiJax->getCharacterId() != "kai_jax") {
        std::cout << "  ERROR: Wrong character_id: " << kaiJax->getCharacterId() << std::endl;
        metadataValid = false;
    }
    
    if (kaiJax->getDisplayName() != "Kai-Jax") {
        std::cout << "  ERROR: Wrong display_name: " << kaiJax->getDisplayName() << std::endl;
        metadataValid = false;
    }
    
    if (kaiJax->getTitle() != "The Memory Hero") {
        std::cout << "  ERROR: Wrong title: " << kaiJax->getTitle() << std::endl;
        metadataValid = false;
    }
    
    if (metadataValid) {
        std::cout << "  Character ID: " << kaiJax->getCharacterId() << std::endl;
        std::cout << "  Display Name: " << kaiJax->getDisplayName() << std::endl;
        std::cout << "  Title: " << kaiJax->getTitle() << std::endl;
        std::cout << "  Version: " << kaiJax->getVersion() << std::endl;
        testsPassed++;
    }
    printTestResult("Verify Character Metadata", metadataValid);

    // Test 3: CRITICAL - Verify tail count is exactly 9
    totalTests++;
    std::cout << "\n[Test 3] CRITICAL: Verifying tail count is exactly 9..." << std::endl;
    bool tailCountValid = true;
    
    const auto& anatomy = kaiJax->getAnatomy();
    const auto& rigging = kaiJax->getRigging();
    const auto& tailRoles = kaiJax->getTailRoles();
    
    int anatomyTailCount = anatomy.tailCount;
    int riggingTailCount = rigging.extraBones.tails.count;
    int tailRolesCount = static_cast<int>(tailRoles.size());
    
    std::cout << "  Anatomy tail count: " << anatomyTailCount << std::endl;
    std::cout << "  Rigging tail count: " << riggingTailCount << std::endl;
    std::cout << "  Tail roles count: " << tailRolesCount << std::endl;
    
    if (anatomyTailCount != 9) {
        std::cout << "  ERROR: Anatomy tail count must be 9, got " << anatomyTailCount << std::endl;
        tailCountValid = false;
    }
    
    if (riggingTailCount != 9) {
        std::cout << "  ERROR: Rigging tail count must be 9, got " << riggingTailCount << std::endl;
        tailCountValid = false;
    }
    
    if (tailRolesCount != 9) {
        std::cout << "  ERROR: Tail roles count must be 9, got " << tailRolesCount << std::endl;
        tailCountValid = false;
    }
    
    if (tailCountValid) {
        std::cout << "  ✓ LOCKFILE REQUIREMENT MET: All tail counts = 9" << std::endl;
        testsPassed++;
    }
    printTestResult("Verify 9 Tails Requirement", tailCountValid);

    // Test 4: Verify anatomy details
    totalTests++;
    std::cout << "\n[Test 4] Verifying anatomy specification..." << std::endl;
    bool anatomyValid = true;
    
    if (anatomy.heightMultiplier != 1.15f) {
        std::cout << "  ERROR: Wrong height multiplier: " << anatomy.heightMultiplier << std::endl;
        anatomyValid = false;
    }
    
    if (anatomy.bodyType != "humanoid_beast") {
        std::cout << "  ERROR: Wrong body type: " << anatomy.bodyType << std::endl;
        anatomyValid = false;
    }
    
    if (anatomyValid) {
        std::cout << "  Body Type: " << anatomy.bodyType << std::endl;
        std::cout << "  Height Multiplier: " << anatomy.heightMultiplier << std::endl;
        std::cout << "  Build: " << anatomy.build << std::endl;
        std::cout << "  Species Composite: ";
        for (size_t i = 0; i < anatomy.speciesComposite.size(); ++i) {
            std::cout << anatomy.speciesComposite[i];
            if (i < anatomy.speciesComposite.size() - 1) std::cout << ", ";
        }
        std::cout << std::endl;
        testsPassed++;
    }
    printTestResult("Verify Anatomy", anatomyValid);

    // Test 5: Verify tail roles
    totalTests++;
    std::cout << "\n[Test 5] Verifying tail roles specification..." << std::endl;
    bool tailRolesValid = true;
    
    std::cout << "  Tail Roles:" << std::endl;
    for (const auto& role : tailRoles) {
        std::cout << "    " << role.index << ". " << role.name 
                  << " - " << role.function << std::endl;
        
        if (role.index < 1 || role.index > 9) {
            std::cout << "    ERROR: Tail index out of range: " << role.index << std::endl;
            tailRolesValid = false;
        }
    }
    
    if (tailRolesValid) {
        testsPassed++;
    }
    printTestResult("Verify Tail Roles", tailRolesValid);

    // Test 6: Verify combat identity
    totalTests++;
    std::cout << "\n[Test 6] Verifying combat identity..." << std::endl;
    bool combatValid = true;
    
    const auto& combat = kaiJax->getCombatIdentity();
    
    if (combat.role != "stance_shifting_battlefield_controller") {
        std::cout << "  ERROR: Wrong combat role: " << combat.role << std::endl;
        combatValid = false;
    }
    
    if (combat.scalesFrom != "1v1") {
        std::cout << "  ERROR: Wrong scales_from: " << combat.scalesFrom << std::endl;
        combatValid = false;
    }
    
    if (combat.scalesTo != "1v20_plus") {
        std::cout << "  ERROR: Wrong scales_to: " << combat.scalesTo << std::endl;
        combatValid = false;
    }
    
    if (combatValid) {
        std::cout << "  Role: " << combat.role << std::endl;
        std::cout << "  Scales: " << combat.scalesFrom << " → " << combat.scalesTo << std::endl;
        std::cout << "  Strengths: ";
        for (size_t i = 0; i < combat.strengths.size(); ++i) {
            std::cout << combat.strengths[i];
            if (i < combat.strengths.size() - 1) std::cout << ", ";
        }
        std::cout << std::endl;
        testsPassed++;
    }
    printTestResult("Verify Combat Identity", combatValid);

    // Test 7: Verify animation requirements
    totalTests++;
    std::cout << "\n[Test 7] Verifying animation specifications..." << std::endl;
    bool animationValid = true;
    
    const auto& anim = kaiJax->getAnimation();
    
    if (anim.philosophy != "mass_and_inertia") {
        std::cout << "  ERROR: Wrong animation philosophy: " << anim.philosophy << std::endl;
        animationValid = false;
    }
    
    if (!anim.noFloatyMotion) {
        std::cout << "  ERROR: no_floaty_motion must be true" << std::endl;
        animationValid = false;
    }
    
    if (animationValid) {
        std::cout << "  Philosophy: " << anim.philosophy << std::endl;
        std::cout << "  No Floaty Motion: " << (anim.noFloatyMotion ? "true" : "false") << std::endl;
        std::cout << "  Required Sets: " << anim.requiredSets.size() << std::endl;
        std::cout << "  Min Frames Per Action: " << anim.frameRules.minFramesPerAction << std::endl;
        testsPassed++;
    }
    printTestResult("Verify Animation Specs", animationValid);

    // Test 8: Verify mobile profile restrictions
    totalTests++;
    std::cout << "\n[Test 8] Verifying mobile profile restrictions..." << std::endl;
    bool mobileValid = true;
    
    const auto& mobile = kaiJax->getMobileProfile();
    
    // Check that critical elements are in "never_cut" list
    bool hasSilhouette = false;
    bool hasTailCount = false;
    for (const auto& item : mobile.neverCut) {
        if (item == "silhouette") hasSilhouette = true;
        if (item == "tail_count") hasTailCount = true;
    }
    
    if (!hasSilhouette || !hasTailCount) {
        std::cout << "  ERROR: silhouette and tail_count must be in never_cut list" << std::endl;
        mobileValid = false;
    }
    
    if (mobileValid) {
        std::cout << "  Allowed cuts: ";
        for (size_t i = 0; i < mobile.allowedCuts.size(); ++i) {
            std::cout << mobile.allowedCuts[i];
            if (i < mobile.allowedCuts.size() - 1) std::cout << ", ";
        }
        std::cout << std::endl;
        std::cout << "  Never cut: ";
        for (size_t i = 0; i < mobile.neverCut.size(); ++i) {
            std::cout << mobile.neverCut[i];
            if (i < mobile.neverCut.size() - 1) std::cout << ", ";
        }
        std::cout << std::endl;
        testsPassed++;
    }
    printTestResult("Verify Mobile Profile", mobileValid);

    // Test 9: Verify rigging constraints
    totalTests++;
    std::cout << "\n[Test 9] Verifying rigging constraints..." << std::endl;
    bool riggingValid = true;
    
    const auto& tailSpec = rigging.extraBones.tails;
    
    if (!tailSpec.physicsEnabled) {
        std::cout << "  ERROR: Tail physics must be enabled" << std::endl;
        riggingValid = false;
    }
    
    if (tailSpec.constraints.noodlePhysics) {
        std::cout << "  ERROR: Noodle physics must be disabled" << std::endl;
        riggingValid = false;
    }
    
    if (riggingValid) {
        std::cout << "  Skeleton Type: " << rigging.skeletonType << std::endl;
        std::cout << "  Physics Enabled: " << (tailSpec.physicsEnabled ? "true" : "false") << std::endl;
        std::cout << "  Bones Per Tail: " << tailSpec.minBonesPerTail 
                  << "-" << tailSpec.maxBonesPerTail << std::endl;
        std::cout << "  Noodle Physics: " << (tailSpec.constraints.noodlePhysics ? "true" : "false") << std::endl;
        testsPassed++;
    }
    printTestResult("Verify Rigging Constraints", riggingValid);

    // Print final results
    printSeparator();
    std::cout << "\nTest Results Summary:" << std::endl;
    std::cout << "  Tests Passed: " << testsPassed << "/" << totalTests << std::endl;
    std::cout << "  Success Rate: " << std::fixed << std::setprecision(1) 
              << (100.0 * testsPassed / totalTests) << "%" << std::endl;
    
    if (testsPassed == totalTests) {
        std::cout << "\n✓ ALL TESTS PASSED - Character loading pipeline is working correctly!" << std::endl;
        std::cout << "✓ LOCKFILE REQUIREMENT MET - Kai-Jax has exactly 9 tails" << std::endl;
        printSeparator();
        return 0;
    } else {
        std::cout << "\n✗ SOME TESTS FAILED - Please review the errors above" << std::endl;
        printSeparator();
        return 1;
    }
}
