#include "../include/CharacterFactory.h"
#include "../include/CharacterLoader.h"
#include "../include/CharacterSpecification.h"
#include <iostream>

namespace LegendsEngine {

std::unique_ptr<Character> CharacterFactory::CreateCharacter(const std::string& characterId) {
    // Step 1: Load character specification from JSON
    // For kai_jax, the file path is kai_jax.character.json
    // The path is relative to the repository root
    std::string filePath = "../../../" + characterId + ".character.json";
    
    auto spec = CharacterLoader::loadFromFile(filePath);
    
    if (!spec || !spec->isValid()) {
        std::cerr << "CharacterFactory: Failed to load character specification for '" 
                  << characterId << "'" << std::endl;
        if (spec) {
            std::cerr << "  Error: " << spec->getValidationError() << std::endl;
        }
        return nullptr;
    }
    
    // Step 2: Simulate asset loading from specification
    // In a real engine, these would call AssetManager::Load<T>()
    const auto& modeling = spec->getModeling();
    const auto& materials = spec->getMaterials();
    const auto& rigging = spec->getRigging();
    
    // TODO: Replace with actual asset loading when AssetManager is implemented
    // auto mesh = AssetManager::Load<Mesh>(modeling.mesh_path);
    // auto skeleton = AssetManager::Load<Skeleton>(rigging.skeleton_path);
    // auto furMaterial = AssetManager::Load<Material>(materials.fur.material_path);
    // auto skinMaterial = AssetManager::Load<Material>(materials.skin.material_path);
    // auto armorMaterial = AssetManager::Load<Material>(materials.armor.material_path);
    // auto spikesMaterial = AssetManager::Load<Material>(materials.spikes.material_path);
    // auto weaveEnergyMaterial = AssetManager::Load<Material>(materials.weave_energy.material_path);
    
    // Placeholder: Simulate asset loading
    (void)modeling;   // Suppress unused variable warning
    (void)materials;  // Suppress unused variable warning
    (void)rigging;    // Suppress unused variable warning
    
    // Step 3: Create Character instance
    auto character = std::make_unique<Character>();
    
    // Step 4: Populate character with simulated assets and initial state
    
    // TODO: Assign loaded assets when AssetManager is available
    // character->mesh = mesh;
    // character->skeleton = skeleton;
    // character->materials.push_back(furMaterial);
    // character->materials.push_back(skinMaterial);
    // character->materials.push_back(armorMaterial);
    // character->materials.push_back(spikesMaterial);
    // character->materials.push_back(weaveEnergyMaterial);
    
    // Initialize state from specification data
    const auto& anatomy = spec->getAnatomy();
    
    // Set initial position (origin for now)
    character->position = Vector3{0.0f, 0.0f, 0.0f};
    
    // Set initial rotation (identity quaternion)
    character->rotation = Quaternion{0.0f, 0.0f, 0.0f, 1.0f};
    
    // Set initial health (could be derived from combat spec in the future)
    character->health = 100.0f;
    
    // Log character creation
    std::cout << "CharacterFactory: Created character '" << spec->getDisplayName() 
              << "' (" << characterId << ")" << std::endl;
    std::cout << "  Anatomy: " << anatomy.bodyType 
              << ", Tail count: " << anatomy.tailCount << std::endl;
    
    // Step 5: Return the fully initialized character
    return character;
}

} // namespace LegendsEngine
