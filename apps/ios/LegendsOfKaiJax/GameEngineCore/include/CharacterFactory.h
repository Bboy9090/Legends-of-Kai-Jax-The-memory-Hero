#pragma once

#include "Character.h"
#include <memory>
#include <string>

namespace LegendsEngine {

/**
 * CharacterFactory - Factory for creating runtime Character instances
 * 
 * This factory bridges the gap between loaded character data (CharacterSpecification)
 * and a renderable in-game entity (Character).
 * 
 * RESPONSIBILITIES:
 * 1. Load character specification from JSON
 * 2. Request asset loading (mesh, skeleton, materials) from AssetManager
 * 3. Instantiate Character object
 * 4. Populate Character with loaded assets and initial state
 * 
 * DESIGN PHILOSOPHY:
 * - Data-driven: Character behavior comes from specification data
 * - Platform-agnostic: Same factory logic for PC, mobile, tablet
 * - Separation of concerns: Factory only creates, doesn't manage lifecycle
 * 
 * USAGE:
 *     auto character = CharacterFactory::CreateCharacter("kai_jax");
 *     // character is now ready for Update() and Render() calls
 */
class CharacterFactory {
public:
    /**
     * Create a runtime Character instance from a character specification
     * 
     * This method:
     * 1. Loads the character specification from JSON
     * 2. Simulates loading assets (mesh, skeleton, materials)
     * 3. Creates and initializes a Character object
     * 4. Returns the ready-to-use character instance
     * 
     * @param characterId The character identifier (e.g., "kai_jax")
     * @return Unique pointer to a fully initialized Character, or nullptr on failure
     */
    static Character* CreateCharacter(const std::string& characterId);
};

} // namespace LegendsEngine
