#pragma once

#include <vector>
#include <memory>

namespace LegendsEngine {

// Mock math types - placeholder until math library is integrated
struct Vector3 {
    float x = 0.0f;
    float y = 0.0f;
    float z = 0.0f;
};

struct Quaternion {
    float x = 0.0f;
    float y = 0.0f;
    float z = 0.0f;
    float w = 1.0f;
};

// Mock engine component types - placeholders until asset system is integrated
struct Mesh {
    // Placeholder for 3D mesh data
};

struct Skeleton {
    // Placeholder for skeletal rig data
};

struct Material {
    // Placeholder for material/shader data
};

/**
 * Character - Runtime representation of a character in the game world
 * 
 * This class represents a live instance of a character after it has been
 * loaded from a CharacterSpecification and its assets have been loaded.
 * 
 * DESIGN PHILOSOPHY:
 * - This is a runtime entity, not a data container
 * - Holds state (position, health, etc.)
 * - References to loaded engine assets (mesh, skeleton, materials)
 * - Platform-agnostic (same logic for PC, mobile, tablet)
 * 
 * LIFECYCLE:
 * 1. Created by CharacterFactory from CharacterSpecification
 * 2. Updated each frame via Update(deltaTime)
 * 3. Rendered via Render()
 */
class Character {
public:
    Character() = default;
    ~Character() = default;

    // Disable copy/move to enforce single ownership
    Character(const Character&) = delete;
    Character& operator=(const Character&) = delete;
    Character(Character&&) = default;
    Character& operator=(Character&&) = default;

    /**
     * Update character state
     * Called once per frame to update character logic, physics, animation, etc.
     * 
     * @param deltaTime Time elapsed since last frame in seconds
     */
    void Update(float deltaTime);

    /**
     * Render character
     * Called once per frame to submit rendering commands for this character.
     */
    void Render();

    // Runtime state
    float health = 100.0f;
    Vector3 position;
    Quaternion rotation;

    // Pointers to loaded engine assets
    // These would be populated by CharacterFactory from the AssetManager
    Mesh* mesh = nullptr;
    Skeleton* skeleton = nullptr;
    std::vector<Material*> materials;
};

} // namespace LegendsEngine
