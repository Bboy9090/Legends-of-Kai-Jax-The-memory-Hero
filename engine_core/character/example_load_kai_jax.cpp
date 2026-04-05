#include "character/CharacterSpecification.h"
#include <iostream>
#include <exception>

/**
 * Example: Loading Kai-Jax character specification
 * 
 * This demonstrates how to use the CharacterSpecification loader
 * to load and validate character data from JSON.
 */

int main(int argc, char* argv[]) {
    using namespace LegendsEngine::Character;
    
    // Default to kai_jax.character.json in current directory
    std::string json_path = "kai_jax.character.json";
    if (argc > 1) {
        json_path = argv[1];
    }
    
    std::cout << "Loading character from: " << json_path << "\n\n";
    
    try {
        // Load the character specification
        auto kai_jax = CharacterSpecification::LoadFromFile(json_path);
        
        // Display basic info
        std::cout << "=== CHARACTER LOADED ===" << "\n";
        std::cout << "ID: " << kai_jax.character_id << "\n";
        std::cout << "Name: " << kai_jax.display_name << "\n";
        std::cout << "Title: " << kai_jax.title << "\n";
        std::cout << "Version: " << kai_jax.version << "\n\n";
        
        // Display anatomy
        std::cout << "=== ANATOMY ===" << "\n";
        std::cout << "Body Type: " << kai_jax.anatomy.body_type << "\n";
        std::cout << "Build: " << kai_jax.anatomy.build << "\n";
        std::cout << "Height Multiplier: " << kai_jax.anatomy.height_multiplier << "\n";
        std::cout << "Tail Count: " << kai_jax.anatomy.tail_count << "\n";
        std::cout << "Species Composite: ";
        for (size_t i = 0; i < kai_jax.anatomy.species_composite.size(); ++i) {
            std::cout << kai_jax.anatomy.species_composite[i];
            if (i < kai_jax.anatomy.species_composite.size() - 1) {
                std::cout << ", ";
            }
        }
        std::cout << "\n\n";
        
        // Display tail roles
        std::cout << "=== TAIL ROLES ===" << "\n";
        for (const auto& tail : kai_jax.tail_roles) {
            std::cout << "  [" << tail.index << "] " 
                      << tail.name << ": " << tail.function << "\n";
        }
        std::cout << "\n";
        
        // Display combat identity
        std::cout << "=== COMBAT IDENTITY ===" << "\n";
        std::cout << "Role: " << kai_jax.combat_identity.role << "\n";
        std::cout << "Scales: " << kai_jax.combat_identity.scales_from 
                  << " to " << kai_jax.combat_identity.scales_to << "\n";
        std::cout << "Strengths: ";
        for (size_t i = 0; i < kai_jax.combat_identity.strengths.size(); ++i) {
            std::cout << kai_jax.combat_identity.strengths[i];
            if (i < kai_jax.combat_identity.strengths.size() - 1) {
                std::cout << ", ";
            }
        }
        std::cout << "\n\n";
        
        // Display animation philosophy
        std::cout << "=== ANIMATION ===" << "\n";
        std::cout << "Philosophy: " << kai_jax.animation.philosophy << "\n";
        std::cout << "No Floaty Motion: " 
                  << (kai_jax.animation.no_floaty_motion ? "YES" : "NO") << "\n";
        std::cout << "Required Sets: " << kai_jax.animation.required_sets.size() << " total\n\n";
        
        // Display modeling
        std::cout << "=== MODELING ===" << "\n";
        std::cout << "Units: " << kai_jax.modeling.units << "\n";
        std::cout << "Scale: " << kai_jax.modeling.scale << "\n";
        std::cout << "Topology: " << kai_jax.modeling.topology << "\n";
        std::cout << "LOD Targets:\n";
        for (const auto& [lod_name, lod_target] : kai_jax.modeling.lod_targets) {
            std::cout << "  " << lod_name << ": [" 
                      << lod_target.triangles[0] << ", " 
                      << lod_target.triangles[1] << "] triangles\n";
        }
        std::cout << "\n";
        
        // Validation check
        std::cout << "=== VALIDATION ===" << "\n";
        std::cout << "Is Kai-Jax: " << (kai_jax.IsKaiJax() ? "YES" : "NO") << "\n";
        std::cout << "Expected Tail Count: " << kai_jax.GetExpectedTailCount() << "\n";
        std::cout << "Actual Tail Count: " << kai_jax.anatomy.tail_count << "\n";
        
        if (kai_jax.IsKaiJax() && kai_jax.anatomy.tail_count == 9) {
            std::cout << "[PASS] Kai-Jax LOCKFILE validation PASSED\n";
        }
        std::cout << "\n";
        
        std::cout << "=== LOAD SUCCESSFUL ===" << "\n";
        return 0;
        
    } catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << "\n";
        return 1;
    }
}
