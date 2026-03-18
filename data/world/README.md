# World Data Directory

This directory contains canonical world system configuration files that define how the game world responds to player progression.

## Files

### `tail_tier_reactions.json`
Defines systemic world responses to Kai-Jax's tail progression (3→9 tails).

**Each tier specifies:**
- **Enemy AI behavior** - Confidence levels, engagement tactics, boss triggers
- **Music intensity** - Dynamic soundtrack scaling with percussion, brass, choir
- **NPC reactions** - Dialogue tone, fear/worship levels, quest availability
- **World state** - Environmental responses, unlock gates, narrative weight

## Purpose

This file makes tail progression **systemically meaningful**, not just visual.

### Without This File:
```typescript
// BAD: Hardcoded values scattered in code
if (tailCount >= 5) {
  enemyConfidence = 0.3; // Magic number
  musicIntensity = 0.7;  // Another magic number
}
```

### With This File:
```typescript
// GOOD: Data-driven from canonical source
const tierData = loadTailTierReactions(currentTailCount);
enemy.setConfidence(tierData.enemy_behavior.fodder_confidence);
musicSystem.setIntensity(tierData.music_intensity);
```

## Structure

```json
{
  "tail_tiers": {
    "3": { /* awakened_hunter */ },
    "4": { /* proven_predator */ },
    "5": { /* zone_breaker */ },
    "6": { /* myth_in_motion */ },
    "7": { /* apex_legend */ },
    "8": { /* threshold_of_divinity */ },
    "9": { /* crown_of_memory */ }
  }
}
```

## Implementation Requirements

All world systems MUST:
1. Read from this file, not hardcode values
2. Check `current_tail_count` and apply appropriate tier
3. Handle tier transitions smoothly (e.g., music crossfades)
4. Validate tier data exists at startup (fail fast)
5. Log which tier is active for debugging

## Examples

### Enemy AI System
```typescript
import tierReactions from './data/world/tail_tier_reactions.json';

class EnemyAI {
  updateBehavior(playerTailCount: number) {
    const tier = tierReactions.tail_tiers[playerTailCount];
    if (!tier) {
      throw new Error(`No tier data for tail count: ${playerTailCount}`);
    }
    
    this.confidence = this.parseConfidence(tier.enemy_behavior.fodder_confidence);
    this.tactics = tier.enemy_behavior.elite_tactics;
    
    // Log for debugging
    console.log(`Enemy AI: ${tier.tier_name} (${playerTailCount} tails)`);
  }
}
```

### Music System
```typescript
import tierReactions from './data/world/tail_tier_reactions.json';

class MusicSystem {
  updateIntensity(playerTailCount: number) {
    const tier = tierReactions.tail_tiers[playerTailCount];
    
    // Apply intensity values
    this.setPercussion(tier.music_intensity.percussion_intensity);
    this.setBrass(tier.music_intensity.brass_presence);
    this.setChoir(tier.music_intensity.choir_enabled);
    
    // Transition smoothly
    this.crossfade(tier.music_intensity.combat_layer, 2.0);
  }
}
```

### NPC Dialogue System
```typescript
import tierReactions from './data/world/tail_tier_reactions.json';

class NPCDialogue {
  selectDialogue(npcId: string, playerTailCount: number) {
    const tier = tierReactions.tail_tiers[playerTailCount];
    
    // Filter dialogue by fear level
    const fearLevel = tier.npc_reactions.fear_level;
    const dialogue = this.getDialogueForFearLevel(npcId, fearLevel);
    
    return dialogue;
  }
}
```

## Validation

Run validation to ensure the file is properly formatted:
```bash
python3 -m json.tool data/world/tail_tier_reactions.json > /dev/null
```

## Design Philosophy

1. **Progression must be felt** - Not just cosmetic changes
2. **Systems respond organically** - World adapts to player power
3. **No hardcoded thresholds** - All values from this canonical file
4. **Build-time validation** - Fail early if data is missing/malformed

## Extending

When adding new world systems:
1. Add new fields to tier objects (maintain consistency across all tiers)
2. Document the field in this README
3. Update validation script to check new fields
4. Implement system to read and apply new field
5. Test that transitions work smoothly

## See Also

- [README_CANON.md](../README_CANON.md) - Franchise governance
- [schemas/character.schema.json](../schemas/character.schema.json) - Character validation
- [kai_jax.character.json](../kai_jax.character.json) - Character lockfile
