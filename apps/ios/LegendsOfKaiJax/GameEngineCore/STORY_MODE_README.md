# Story Mode Core Systems

This document describes the core systems implemented for Story Mode in "Legends of Kai-Jax: The Roaring City".

## Overview

Story Mode is the foundation of the game, with all systems designed to be:
- **Reusable** across all game modes (Survival, Gauntlet, Versus)
- **Platform-agnostic** (PC, mobile, tablet use identical logic)
- **Data-driven** (configuration via JSON, not hardcoded)
- **Tail-tier integrated** (systems respond to player progression)

## Architecture

### Core Systems

1. **Story Mode Manager** (`engine/cpp/src/story_mode/`)
   - District and zone management
   - Quest tracking and progression
   - NPC interaction framework
   - World state management

2. **Unified Combat System** (`engine/cpp/include/combat/`)
   - Platform-agnostic combat mechanics
   - Tail tier combat scaling
   - Speed, precision, and momentum focus
   - Mass and inertia enforcement

3. **Enemy AI System** (`engine/cpp/include/ai/`)
   - Behavior tiers: Fodder, Elite, Boss
   - Tail tier adaptive AI
   - Group coordination
   - Dynamic difficulty scaling

### Data Schemas

All game data is validated against JSON schemas in `schemas/`:

- `story_mode.schema.json` - District, zone, and traversal configuration
- `quest.schema.json` - Quest and objective definitions
- `npc.schema.json` - NPC dialogue and interaction trees
- `enemy_ai.schema.json` - Enemy behavior and AI patterns
- `combat_system.schema.json` - Combat mechanics and attacks

### Canonical Law Enforcement

These systems enforce the rules defined in `README_CANON.md`:

#### ✅ Unified Gameplay Core
- Single codebase for all platforms
- No platform-specific gameplay logic
- PC is source of truth

#### ✅ Tail Progression (3→9)
- Player always starts with 3 tails
- Sequential unlock only (no skipping)
- Tail count affects combat, AI, NPCs, music
- Enforced at runtime and build time

#### ✅ Data-Driven Design
- All configuration loaded from JSON
- Validates against `kai_jax.character.json`
- Respects `tail_tier_reactions.json`

## Data Files

### Vertical Slice: The Awakening District

Example data for testing and demonstration:

**Story Mode Configuration:**
- `data/story_mode/roaring_city.json` - Game world and districts

**Quests:**
- `data/quests/first_awakening.json` - Tutorial quest
- `data/quests/memory_trial.json` - First boss quest

**NPCs:**
- `data/npcs/elder_kaito.json` - Quest giver with tail-tier reactions

**Enemies:**
- `data/enemies/corrupted_shadow.json` - Fodder enemy
- `data/enemies/corruption_guardian.json` - Boss enemy

**Combat:**
- `data/combat/unified_combat_system.json` - Combat configuration

## Key Features

### 1. Open-World District Traversal
- **Verticality:** Rooftops, interior/exterior transitions
- **Movement Styles:** Agile, parkour-focused
- **Momentum:** Mass and inertia affect movement (canon requirement)

### 2. NPC Interaction Framework
- **Dialogue Trees:** Dynamic branching conversations
- **Tail Tier Reactions:** NPCs respond to player power
- **Quest Triggers:** Dialogue can initiate quests

### 3. Unified Combat System
- **Philosophy:** Speed, precision, momentum
- **Canon Compliant:** Punishes spamming, rewards precision
- **Tail Scaling:** Combat abilities unlock with progression
- **Platform Agnostic:** Identical on PC, mobile, tablet

### 4. Enemy AI Behavior Tiers
- **Fodder:** Fast, spectacle-focused, flee at high tail tiers
- **Elite:** Tactical, coordinate attacks, adapt strategies
- **Boss:** Complex mechanics, unique behaviors per tier

## Build Instructions

### Prerequisites
- CMake 3.15+
- C++17 compatible compiler
- nlohmann/json (auto-fetched by CMake)

### Building

```bash
cd engine/cpp
mkdir build && cd build
cmake ..
cmake --build .
```

### Running Tests

```bash
cd engine/cpp/build
ctest --verbose
```

### Specific Test

```bash
./bin/StoryModeTest
```

## Usage Example

```cpp
#include "story_mode/StoryModeManager.h"

using namespace LegendsEngine::StoryMode;

int main() {
    StoryModeManager story;
    
    // Load game configuration
    story.LoadConfiguration(
        "data/story_mode/roaring_city.json",
        "data/world/tail_tier_reactions.json"
    );
    
    // Start new game (player starts with 3 tails)
    story.StartNewGame();
    
    // Game loop
    while (running) {
        float deltaTime = GetDeltaTime();
        
        // Update story mode systems
        story.Update(deltaTime);
        
        // Check player progression
        if (playerUnlockedFourthTail) {
            story.SetPlayerTailCount(4);
            // NPCs, enemies, music will all react
        }
        
        // Accept quests
        if (playerInteractsWithNPC("elder_kaito")) {
            auto dialogue = story.InteractWithNPC("elder_kaito");
            DisplayDialogue(dialogue);
        }
    }
    
    return 0;
}
```

## Integration with Other Modes

These systems are designed to be **modular and reusable**:

### Survival Mode
- Reuses: Combat System, Enemy AI
- Adds: Wave spawning, time limits

### Gauntlet Mode
- Reuses: Combat System, Enemy AI, District traversal
- Adds: Challenge rooms, scoring

### Versus Mode
- Reuses: Combat System, Movement mechanics
- Adds: PvP balancing, multiplayer

## Tail Tier System Integration

Every system responds to player tail count (3-9):

### Combat System
- Damage multipliers scale with tails
- New attacks unlock at specific tiers
- Movement speed increases

### Enemy AI
- Fodder enemies flee at high tail counts
- Elite enemies change tactics
- Boss attacks become desperate

### NPC Reactions
- Dialogue changes based on tail tier
- Fear and respect modifiers apply
- Quest availability affected

### Music System (future integration)
- Combat intensity scales with power
- Triumphant themes at high tiers
- Reality-warping at tier 9

## Future Enhancements

- [ ] Music system integration with tail tiers
- [ ] Environmental hazards in districts
- [ ] Cinematic event system
- [ ] Save/load system
- [ ] Multiplayer quest coordination

## Testing

Tests verify:
- ✅ Canon compliance (tail count 3-9)
- ✅ Platform-agnostic logic
- ✅ Data-driven configuration
- ✅ Quest progression
- ✅ NPC interaction
- ✅ District navigation

## License

This implementation follows the project's governance rules defined in `README_CANON.md`.
All systems must validate against the canonical lockfiles and schemas.
