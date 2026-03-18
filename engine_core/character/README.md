# Legends Engine - Character Loader C++ Scaffold

## Overview

This directory contains the C++ character loading system for the Legends Engine. It provides a type-safe, validated interface for loading character specifications from JSON files.

## Architecture

### Design Principles

- **Data-Driven**: All character data comes from JSON, code never hardcodes gameplay values
- **Single Source of Truth**: `kai_jax.character.json` is a LOCKFILE
- **Platform-Agnostic**: Uses only standard C++ containers, no platform-specific code
- **Fail Loudly**: Invalid data throws exceptions with clear messages
- **Immutable After Load**: CharacterSpecification cannot be modified after loading

### Files

- **CharacterTypes.h**: Data structures that map 1:1 with the character JSON schema
- **CharacterSpecification.h**: Main class that aggregates all character data
- **CharacterLoader.cpp**: JSON parsing and validation implementation

## Usage

```cpp
#include "character/CharacterSpecification.h"

// Load Kai-Jax
auto kai_jax = LegendsEngine::Character::CharacterSpecification::LoadFromFile(
    "kai_jax.character.json"
);

// Access data
std::cout << kai_jax.display_name << " has " 
          << kai_jax.anatomy.tail_count << " tails\n";

// Iterate tail roles
for (const auto& tail : kai_jax.tail_roles) {
    std::cout << "Tail " << tail.index << " (" << tail.name 
              << "): " << tail.function << "\n";
}
```

## Validation Rules

### Hard Rules (LOCKFILE Enforcement)

1. **Kai-Jax Tail Count**: If `character_id == "kai_jax"`, then `anatomy.tail_count` MUST be 9
2. **tail_roles**: Array size must match `anatomy.tail_count`
3. **rigging.extra_bones.tails.count**: Must match `anatomy.tail_count`

### Design Philosophy Enforcement

- `animation.no_floaty_motion` must be `true` (mass and inertia matter)
- `facial_system.anime_exaggeration` must be `false` (no mascot proportions)
- `tail constraints.noodle_physics` must be `false` (physics must feel grounded)

## Dependencies

- **nlohmann/json**: JSON parsing library
  - Header-only, modern C++ JSON library
  - https://github.com/nlohmann/json

## Building

This is a scaffold for integration into the full engine build system. The files are designed to compile cleanly with:

- C++17 or later
- Standard library containers only
- nlohmann/json for JSON parsing

### Quick Compilation Test (Unix/Linux)

```bash
# Install nlohmann/json (header-only)
# On Ubuntu/Debian:
# sudo apt-get install nlohmann-json3-dev

# Compile (assuming nlohmann/json is in include path)
g++ -std=c++17 -c CharacterLoader.cpp -o CharacterLoader.o
```

### Quick Compilation Test (Windows)

```powershell
# Download nlohmann/json single header
# https://github.com/nlohmann/json/releases

# Compile
cl /std:c++17 /EHsc /c CharacterLoader.cpp
```

## Integration

To integrate into the full engine:

1. Add `engine_core/character/` to include paths
2. Link against nlohmann/json
3. Include `CharacterSpecification.h` in your gameplay systems
4. Load characters during initialization

## Testing

Test files should validate:

1. Loading `kai_jax.character.json` succeeds
2. Kai-Jax has exactly 9 tails
3. Loading a JSON with `character_id="kai_jax"` but `tail_count != 9` throws
4. Loading invalid JSON throws with clear error messages
5. All required fields are validated

## Future Work

- [ ] Add CMakeLists.txt for standalone builds
- [ ] Add unit tests using Catch2 or Google Test
- [ ] Add fuzzing for JSON parsing robustness
- [ ] Add schema validation (JSON Schema)
- [ ] Add performance benchmarks for loading
- [ ] Add hot-reload support for content iteration

## License

This code is part of the Legends of Kai-Jax project.

## Author Notes

This scaffold follows the LEGENDS ENGINE HARD RULES:

- ✅ Single unified gameplay core
- ✅ Platform-agnostic data structures
- ✅ Canon enforcement (Kai-Jax is LOCKFILE)
- ✅ Clear, data-driven architecture
- ✅ No platform-specific forks
- ✅ Deterministic, validated systems
