# Story Mode Integration Guide

## Overview

This document provides integration instructions for the Story Mode systems in Legends of Kai-Jax. The implementation includes:

1. **C++ Core Systems** - High-performance combat and AI logic
2. **TypeScript Services** - Browser/web integration layer
3. **JSON Data Files** - Data-driven configuration

## Architecture

### C++ Backend (engine/cpp/)

The C++ backend provides the core gameplay systems:

- **CombatSystem** (`src/combat/CombatSystem.cpp`) - Unified combat logic
- **EnemyAI** (`src/ai/EnemyAI.cpp`) - Enemy behavior and tail-tier adaptation
- **StoryModeManager** (`src/story_mode/StoryModeManager.cpp`) - Quest and NPC management

### TypeScript Integration Layer (packages/engine/src/story/)

The TypeScript layer provides web/browser access to story mode features:

- **StoryModeService** - Quest, NPC, and district management
- **CombatService** - Combat system interface
- **AIService** - Enemy AI interface

### JSON Data Files (data/)

All game content is data-driven:

```
data/
├── story_mode/roaring_city.json    # World districts and zones
├── quests/                         # Quest definitions
├── npcs/                           # NPC configurations
├── enemies/                        # Enemy AI configurations
└── combat/unified_combat_system.json  # Combat system config
```

## Quick Start

### 1. Initialize Services

```typescript
import { 
  getStoryModeService, 
  getCombatService, 
  getAIService 
} from '@legends-of-kai-jax/engine';

// Initialize services
const storyMode = getStoryModeService();
const combat = getCombatService();
const ai = getAIService();

// Load configurations
await storyMode.initialize();
await combat.loadConfiguration();
await ai.loadConfigurations();

// Start new game
storyMode.startNewGame();
```

### 2. Quest System Usage

```typescript
// Get available quests
const availableQuests = storyMode.getAvailableQuests();

// Start a quest
storyMode.startQuest('first_awakening');

// Complete objectives
storyMode.completeQuestObjective('first_awakening', 'reach_rooftops');

// Complete quest (grants rewards including tail tier unlock)
storyMode.completeQuest('first_awakening');
```

### 3. Combat System Usage

```typescript
// Register player character
const player: CombatCharacter = {
  character_id: 'kai_jax',
  current_tail_count: 3, // CANON: Start with 3 tails
  // ... other properties
};

combat.registerCharacter(player);

// Execute attack
combat.executeAttack('kai_jax', 'light_slash');

// Detect and apply hits
const hits = combat.detectHits('kai_jax');
hits.forEach(hit => combat.applyHit(hit));

// Update each frame
function gameLoop(deltaTime: number) {
  combat.update(deltaTime);
}
```

### 4. Enemy AI Usage

```typescript
// Spawn an enemy
const enemyId = ai.spawnEnemy('corrupted_shadow', 10, 0, 5);

// Update player position for AI targeting
ai.setPlayerPosition(playerX, playerY, playerZ);

// Update AI each frame
function gameLoop(deltaTime: number) {
  ai.update(deltaTime);
  
  // Get enemy actions
  const action = ai.getEnemyAction(enemyId);
  if (action.type === 'attack') {
    // Enemy is attacking
    combat.executeAttack(enemyId, action.attackId!);
  }
}

// Damage enemy when hit
ai.damageEnemy(enemyId, 25, 'kai_jax');
```

### 5. Tail Tier Progression (CANON)

```typescript
// CANON: Tail count must be 3-9, sequential only
storyMode.setPlayerTailCount(4); // ✅ Valid: 3 -> 4
combat.setCharacterTailCount('kai_jax', 4);
ai.setPlayerTailCount(4);

// World systems adapt to new tail tier:
// - New attacks unlock in combat
// - Enemy AI changes behavior
// - NPCs react differently
// - New districts may unlock
```

## Event Handling

### Listen for Story Mode Events

```typescript
storyMode.addEventListener((event) => {
  switch (event.type) {
    case 'quest_started':
      console.log('Quest started:', event.quest_id);
      break;
      
    case 'quest_completed':
      console.log('Quest completed:', event.quest_id);
      break;
      
    case 'tail_tier_changed':
      console.log(`Tail tier: ${event.old_tier} -> ${event.new_tier}`);
      // Update UI, trigger animations, etc.
      break;
  }
});
```

### Combat Callbacks

```typescript
combat.setHitCallback((hit) => {
  console.log(`Hit! ${hit.damage} damage to ${hit.defender_id}`);
  // Trigger hit effects, camera shake, etc.
});

combat.setComboCallback((characterId, hitCount) => {
  console.log(`Combo: ${hitCount} hits!`);
  // Update combo UI
});
```

### AI Callbacks

```typescript
ai.setEnemySpawnedCallback((instanceId) => {
  console.log('Enemy spawned:', instanceId);
  // Create enemy 3D model
});

ai.setEnemyDefeatedCallback((instanceId) => {
  console.log('Enemy defeated:', instanceId);
  // Play death animation, grant rewards
});
```

## Canon Compliance Checklist

When implementing story mode features, ensure:

- ✅ **Unified Gameplay Core** - Same logic for PC/mobile/tablet
- ✅ **Tail Progression 3→9** - No skipping, no reversal
- ✅ **Data-Driven** - Load from JSON, don't hardcode
- ✅ **Mass & Momentum** - Combat respects physics
- ✅ **Tail Tier Integration** - World systems respond to player power

## Data File Schemas

All data files must validate against JSON schemas in `schemas/`:

- `story_mode.schema.json` - District and zone definitions
- `quest.schema.json` - Quest structure
- `npc.schema.json` - NPC configuration
- `enemy_ai.schema.json` - Enemy AI behavior
- `combat_system.schema.json` - Combat mechanics

## Testing

### C++ Tests

```bash
cd engine/cpp/build
ctest --output-on-failure
```

### TypeScript Type Checking

```bash
cd packages/engine
npm run build
```

## Troubleshooting

### Issue: Tail count not updating correctly

**Solution**: Ensure you're calling `setPlayerTailCount()` on all three services:
```typescript
storyMode.setPlayerTailCount(newCount);
combat.setCharacterTailCount('kai_jax', newCount);
ai.setPlayerTailCount(newCount);
```

### Issue: Quest won't start

**Solution**: Check quest prerequisites are completed:
```typescript
const quest = storyMode.getQuests().find(q => q.quest_id === 'my_quest');
console.log('Prerequisites:', quest.prerequisites);
console.log('Completed:', storyMode.getPlayerState().completed_quests);
```

### Issue: Enemy won't spawn

**Solution**: Check tail tier requirements:
```typescript
const canSpawn = ai.canSpawnAtCurrentTier('enemy_id');
console.log('Can spawn:', canSpawn);
```

## Next Steps

1. **UI Components** - Create React components for story mode UI
2. **Save/Load** - Implement save game functionality
3. **More Content** - Add additional districts, quests, enemies
4. **Music Integration** - Dynamic soundtrack based on tail tier

## Support

For questions or issues:
- Check `engine/cpp/STORY_MODE_README.md` for C++ implementation details
- Review canonical rules in `README_CANON.md`
- Verify data against schemas in `schemas/`
