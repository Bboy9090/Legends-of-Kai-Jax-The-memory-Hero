# Legends Engine - C++ Character Loading Pipeline

This directory contains the C++ implementation of the character loading system for the Legends Engine. This system is responsible for loading and validating character specifications from JSON files according to the authoritative `kai_jax.character.json` LOCKFILE.

## Directory Structure

```
engine/cpp/
├── CMakeLists.txt              # CMake build configuration
├── include/                     # Public header files
│   ├── CharacterTypes.h        # C++ data structures matching JSON spec
│   └── CharacterSpecification.h # Character specification class
├── src/                        # Implementation files
│   └── CharacterLoader.cpp     # JSON loading and validation logic
├── tests/                      # Test files
│   └── CharacterLoaderTest.cpp # Comprehensive test suite
└── README.md                   # This file
```

## Architecture

### Data-Driven Design

The character system follows a **strict data-driven architecture**:

1. **CharacterTypes.h** - Defines C++ structures that mirror the JSON specification
2. **CharacterSpecification.h** - Container class holding all character data
3. **CharacterLoader.cpp** - Loads JSON and validates against engine requirements

### Key Principles

Following the `.github/copilot-instructions.md` HARD RULES:

- ✅ **Single unified gameplay core** - No platform-specific logic
- ✅ **PC is source of truth** - Mobile/tablet are scaled profiles only
- ✅ **Mass, inertia, and recovery matter** - Enforced in animation specs
- ✅ **LOCKFILE compliance** - Kai-Jax MUST have exactly 9 tails

## Build Instructions

### Prerequisites

- CMake 3.15 or later
- C++17 compatible compiler (GCC 7+, Clang 5+, MSVC 2017+)
- Internet connection (for automatic nlohmann/json download)

### Building on Linux/macOS

```bash
cd engine/cpp
mkdir build
cd build
cmake ..
make
```

### Building on Windows

```powershell
cd engine/cpp
mkdir build
cd build
cmake ..
cmake --build .
```

## Running Tests

After building, run the test suite:

```bash
# From the build directory
./bin/CharacterLoaderTest

# Or using CTest
ctest --verbose
```

The test suite validates:

1. ✅ Successful loading of `kai_jax.character.json`
2. ✅ Character metadata (ID, name, title, version)
3. ✅ **CRITICAL: Tail count is exactly 9** (LOCKFILE requirement)
4. ✅ Anatomy specifications
5. ✅ Tail roles (9 unique functions)
6. ✅ Combat identity and scaling (1v1 to 1v20+)
7. ✅ Animation requirements (mass and inertia philosophy)
8. ✅ Mobile profile restrictions (never cut silhouette/tail_count)
9. ✅ Rigging constraints (physics enabled, no noodle physics)

## Usage Example

```cpp
#include "CharacterSpecification.h"
#include "CharacterLoader.cpp"

using namespace LegendsEngine;

int main() {
    // Load character specification
    auto kaiJax = CharacterLoader::loadFromFile("kai_jax.character.json");
    
    // Validate
    if (!kaiJax->isValid()) {
        std::cerr << "Error: " << kaiJax->getValidationError() << std::endl;
        return 1;
    }
    
    // Access data
    const auto& anatomy = kaiJax->getAnatomy();
    std::cout << "Tail count: " << anatomy.tailCount << std::endl;
    
    const auto& combat = kaiJax->getCombatIdentity();
    std::cout << "Combat role: " << combat.role << std::endl;
    
    return 0;
}
```

## Critical Validations

The `CharacterLoader` enforces several critical validations:

### 1. Tail Count Consistency

All tail-related fields must agree:
- `anatomy.tail_count`
- `rigging.extra_bones.tails.count`
- `tail_roles` array length

### 2. Kai-Jax LOCKFILE Requirement

For the character with `character_id == "kai_jax"`:
- **Tail count MUST be exactly 9**
- This is enforced at load time
- Violation throws an error

### 3. Tail Role Indexing

Tail roles must have sequential indices from 1 to N:
- Index 1: bond (parry/counter/revive)
- Index 2: hunter (dash/pursuit/execute)
- Index 3: thread (web/pull/group)
- Index 4: quill (retaliation/posture damage)
- Index 5: shade (stealth/threat reset)
- Index 6: anchor (anti-knockback/root)
- Index 7: echo (after-image/repeat)
- Index 8: rift (reality tear AOE)
- Index 9: crown (aura/command)

### 4. Required Fields

All fields defined in the JSON spec are required. Missing fields will cause load failure.

## Design Philosophy

### No Platform Divergence

Character data is **platform-agnostic**. Mobile adaptations only strip visuals:

**Allowed Cuts (Mobile)**:
- Fur shell layers
- Secondary emissive effects
- Minor decals

**Never Cut (Mobile)**:
- Silhouette
- Tail count (always 9)
- Animation timing
- Posture system
- Hit stop

### Mass and Inertia Matter

The animation system enforces:
- `philosophy: "mass_and_inertia"`
- `no_floaty_motion: true`
- Minimum 12 frames per action
- Cancel rules: hit-confirm or perfect parry only

### Combat Scaling

Kai-Jax is designed to scale seamlessly:
- `scales_from: "1v1"`
- `scales_to: "1v20_plus"`
- No rule changes between scales
- Single unified combat system

## Dependencies

### nlohmann/json

The character loader uses [nlohmann/json](https://github.com/nlohmann/json) for JSON parsing.

- Version: 3.11.3
- License: MIT
- Automatically downloaded by CMake via FetchContent

## Integration with Engine

This C++ character loading system is designed to integrate with:

1. **Rendering Pipeline** - PBR renderer (Vulkan/DX12/Metal)
2. **Animation System** - GPU skinning with physics bones
3. **Combat System** - Stance-shifting battlefield controller
4. **LOD System** - Multiple detail levels for performance scaling
5. **Mobile Pipeline** - Platform-agnostic data with visual scaling

## Future Work

- [ ] Integration with asset pipeline (FBX/GLTF loading)
- [ ] Runtime validation of loaded meshes against LOD targets
- [ ] Character state management system
- [ ] Animation state machine integration
- [ ] Combat system integration
- [ ] Mobile profile application system

## References

### Authoritative Documents

1. **kai_jax.character.json** - The LOCKFILE (single source of truth)
2. **.github/copilot-instructions.md** - Engine architecture rules
3. **LEGENDS_ENGINE_SETUP.md** - Setup and philosophy guide

### Key Specifications

- **Anatomy**: 9-tailed wolf/fox/hedgehog/spider hybrid
- **Modeling**: 80K-120K triangles (LOD0), clean quad topology
- **Rigging**: Physics-enabled tails (5-7 bones each)
- **Combat**: Stance-shifting battlefield controller
- **Scales**: 1v1 to 1v20+ without rule changes

## Status

✅ **COMPLETE** - Character loading pipeline is fully implemented and tested.

All acceptance criteria met:
- [x] C++ structures match JSON spec
- [x] Loader successfully parses kai_jax.character.json
- [x] Validation logic enforces 9 tails for Kai-Jax
- [x] No per-platform logic divergence
- [x] Data-driven architecture
- [x] Comprehensive test coverage

---

**Built with production-grade engineering discipline.**

*"If a decision conflicts with these rules, the rules win."*
