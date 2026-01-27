# Shade Trial (Tail 5) Implementation

This document describes the complete implementation of the Shade Trial Legend Node system, including biome rules, boss design principles, and the Blackreach Descent vertical slice.

## Overview

The Shade Trial is a Legend Node that unlocks Tail 5 (Shade) for Kai-Jax. This implementation enforces:
- **Sequential progression**: Players cannot skip from Tail 3 to Tail 5. They must complete Tail 4 (Quill Trial) first.
- **Data-driven design**: All gameplay rules are defined in JSON files, validated by schemas.
- **Canon compliance**: Every value matches authoritative sources (README_CANON.md, kai_jax.character.json).

## Architecture

### Data Files (Source of Truth)

#### 1. Legend Nodes (`data/legend_nodes/`)
- **shade_trial.node.json** - Defines the Shade Trial
  - Requires: 4 tails (Quill unlocked)
  - Unlocks: Tail 5 (Shade)
  - Location: Blackreach Underpass
  - Trial rules: minimap/lock-on/healing disabled, environmental kills allowed
  - Victory: 6 stealth strikes, 3 threat resets, max 18s detected
  - Rewards: shade tail, threat_reset_on_stealth_hit, short_blink_backstab

#### 2. Biome Rules (`data/biomes/`)
- **biome_rules.json** - Defines gameplay per biome
  - Ashbone District: medium verticality, clear visibility, moderate density
  - Blackreach Underpass: high verticality, low_dynamic visibility, high_but_queued density
  - Hard rules: No swarm spam, visibility is gameplay, mobile never cuts silhouettes

#### 3. Boss Design Bible (`data/bosses/`)
- **boss_design_bible.json** - Defines boss expectations per tier
  - Tier 3-4: Tests fundamentals (dodge, posture, retaliation)
  - Tier 5: Tests Shade mechanics (stealth angle, threat reset, backstab timing)
  - Tier 6-9: Progressive mastery requirements
  - Design Law: "Bosses never invalidate prior tails; they require them"

#### 4. Vertical Slices (`data/vertical_slices/`)
- **blackreach_descent.slice.json** - 30-minute Tail 4→5 progression demo
  - Phase 1 (8 min): Stealth exploration through floodlit passages
  - Phase 2 (10 min): Hybrid combat - 4 waves, max 10 simultaneous enemies
  - Phase 3 (7 min): Elite duel vs Shade Warden
  - Phase 4 (5 min): Shade Trial Legend Node

### Schemas (`schemas/`)
JSON schemas enforce structure and canon compliance:
- **legend_node.schema.json** - Validates Legend Node structure
- **biome_rules.schema.json** - Validates biome gameplay rules
- **boss_design_bible.schema.json** - Validates boss design per tier
- **vertical_slice.schema.json** - Validates vertical slice missions

### TypeScript Integration (`packages/engine/src/`)

#### Validators
- **progression/BiomeRulesValidator.ts** - Loads and validates biome_rules.json
- **bosses/BossDesignValidator.ts** - Validates boss_design_bible.json against character data

#### Managers
- **progression/LegendNodeManager.ts** - Manages Legend Node progression, enforces sequential unlocking
- **world/WorldState.ts** - Tracks completed nodes, tail count, irreversible progression
- **world/BiomeManager.ts** - Applies biome rules (encounter settings, visibility, music)

#### Scenarios
- **scenarios/BlackreachDescent.ts** - Implements Blackreach Descent vertical slice

### Tests (`packages/engine/src/**/__tests__/`)
- **ShadeTrialValidator.test.ts** - Tests Shade Trial data and progression rules
- **BossDesignValidator.test.ts** - Tests boss design bible structure and coverage
- **BlackreachDescentValidator.test.ts** - Tests vertical slice mission flow

## Validation

Run the validation script to verify all data files:

```bash
node validate-shade-trial.cjs
```

This checks:
- ✓ Shade Trial unlocks tail 5 (not 4, not 6)
- ✓ Requires exactly 4 tails to start
- ✓ Victory conditions: 6 stealth strikes, 3 threat resets, 18s max detected
- ✓ Blackreach Underpass has high verticality, low_dynamic visibility
- ✓ Stealth and threat_reset systems enabled
- ✓ Boss design covers tiers 3-9 with proper expectations
- ✓ Vertical slice sums to 30 minutes
- ✓ Cross-validates against kai_jax.character.json

**Result: 32/32 checks passing**

## Sequential Progression Enforcement

The system enforces canonical tail progression:

```
Starting: 3 tails (bond, hunter, thread)
   ↓
Tail 4: Quill Trial (retaliation, posture damage)
   ↓
Tail 5: Shade Trial (stealth, threat reset) ← THIS IMPLEMENTATION
   ↓
Tail 6: Anchor (anti-knockback, root)
   ↓
...
   ↓
Tail 9: Crown (aura, command)
```

### Code Enforcement

`LegendNodeManager.canAttemptLegendNode()` checks:
1. Player has required tail count (4 for Shade Trial)
2. Previous Legend Nodes completed (Quill Trial for Shade)
3. Cannot skip tails (3→5 is blocked, must go 3→4→5)

`WorldStateManager.updateTailCount()` prevents:
- Decreasing tail count (progression is permanent)
- Skipping tail unlocks (sequential only)
- Invalid tail counts (3-9 range enforced)

## Integration with World Systems

When Tail 5 unlocks, the world reacts:

### From `tail_tier_reactions.json` (Tier 5: Zone Breaker)
- **Enemy Behavior**: Fodder keeps distance, elites coordinate interrupts, bosses trigger early desperation
- **Music**: Full combat intensity, percussion 0.65, brass prominent, choir enabled
- **NPCs**: Nervous deference, high-risk quests unlock, fear level medium, worship low
- **World State**: Combat zones clear faster, elite trials unlock

### Biome Rules Applied (Blackreach Underpass)
- High verticality enables vertical combat advantages
- Low_dynamic visibility enables stealth gameplay
- Stealth + threat_reset systems active
- High_but_queued density (never swarm spam, always queued reinforcements)

## Boss Design Philosophy (Tier 5)

**Tier 5 Boss (Zone Breaker):**
- **Expects**: stealth_angle_control, threat_reset, backstab_timing
- **Punishes**: overcommit, frontal_assault_spam, ignoring_threat_state
- **Weak To**: backstab_timing, threat_manipulation, stealth_repositioning
- **Philosophy**: "Boss forces player to use Shade Trial mechanics: threat, stealth, positioning over brute force"

This validates that the player has mastered the Shade tail's core mechanics before progressing.

## File Structure

```
data/
├── legend_nodes/
│   └── shade_trial.node.json
├── biomes/
│   └── biome_rules.json
├── bosses/
│   └── boss_design_bible.json
└── vertical_slices/
    └── blackreach_descent.slice.json

schemas/
├── legend_node.schema.json
├── biome_rules.schema.json
├── boss_design_bible.schema.json
└── vertical_slice.schema.json

packages/engine/src/
├── progression/
│   ├── BiomeRulesValidator.ts
│   ├── LegendNodeManager.ts
│   └── __tests__/
│       └── ShadeTrialValidator.test.ts
├── bosses/
│   ├── BossDesignValidator.ts
│   └── __tests__/
│       └── BossDesignValidator.test.ts
├── world/
│   ├── WorldState.ts
│   └── BiomeManager.ts
└── scenarios/
    ├── BlackreachDescent.ts
    └── __tests__/
        └── BlackreachDescentValidator.test.ts
```

## Usage Examples

### Check if player can attempt Shade Trial
```typescript
import { LegendNodeManager, PlayerProgressionState } from './progression/LegendNodeManager';

const manager = new LegendNodeManager();
const playerState: PlayerProgressionState = {
  current_tail_count: 4,
  completed_legend_nodes: ['quill_trial'],
  unlocked_abilities: ['bond', 'hunter', 'thread', 'quill']
};

const result = manager.canAttemptLegendNode('shade_trial', playerState);
if (result.can_attempt) {
  // Player can attempt the trial
} else {
  console.log(result.reason); // e.g., "Requires 4 tails"
}
```

### Load Blackreach biome rules
```typescript
import { BiomeManager } from './world/BiomeManager';

const biomeManager = new BiomeManager();
biomeManager.loadBiome('blackreach_underpass');

const encounterSettings = biomeManager.getEncounterSettings();
// { density: 'high_but_queued', bias: ['swarmer', 'disruptor', 'elite'], max_simultaneous: 10 }

const stealthEnabled = biomeManager.isSystemEnabled('stealth'); // true
```

### Run Blackreach Descent scenario
```typescript
import { BlackreachDescent } from './scenarios/BlackreachDescent';
import { WorldStateManager } from './world/WorldState';

const worldState = new WorldStateManager();
const scenario = new BlackreachDescent(worldState);

scenario.initialize(); // Loads biome, validates state
scenario.startPhase(1); // Start stealth exploration
scenario.executeStealthExploration();
// ... complete phases
scenario.completeScenario(); // Unlocks Tail 5
```

## Design Principles Applied

### From README_CANON.md
1. **Unified Gameplay Core**: All platforms use same progression rules
2. **Sequential Tail Unlocking**: 3→4→5→...→9, no skipping
3. **Data-Driven**: All rules in JSON files, validated at build time
4. **Immutable Progression**: Tails cannot be removed after unlock

### From kai_jax.character.json
- Starting tail count: 3 (const)
- Final tail count: 9 (const)
- Tail 5 (shade): stealth_threat_reset function
- Unlock rule: sequential_only

### From tail_tier_reactions.json
- Tier 5 activates "Zone Breaker" world state
- Enemy AI shifts to coordinated tactics
- Music intensity increases to full combat
- NPCs show nervous deference

## Next Steps

After this implementation:
1. **Tail 6 (Anchor)**: Implement anchor trial, siege-scale vertical slice
2. **Tail 7 (Echo)**: After-image mechanics, tempo mastery
3. **Tail 8 (Rift)**: Reality manipulation, execution chains
4. **Tail 9 (Crown)**: Final trial, complete mastery

Each tier builds on previous mechanics, enforced by boss design bible.

## Validation Commands

```bash
# Validate all JSON syntax
node -e "
const fs = require('fs');
['data/legend_nodes/shade_trial.node.json',
 'data/biomes/biome_rules.json',
 'data/bosses/boss_design_bible.json',
 'data/vertical_slices/blackreach_descent.slice.json']
.forEach(f => JSON.parse(fs.readFileSync(f, 'utf-8')));
console.log('All JSON valid');
"

# Run full validation
node validate-shade-trial.cjs

# TypeScript type checking (after adding @types/node)
cd packages/engine && npm run typecheck
```

## Canon Compliance

This implementation is **authoritative** and supersedes:
- Slack discussions
- Design docs
- Informal specifications

All values are explicitly defined in lockfiles:
- `kai_jax.character.json` - Character anatomy and tail progression
- `data/world/tail_tier_reactions.json` - World system responses
- `README_CANON.md` - Non-negotiable franchise rules

**Version**: 1.0.0  
**Last Updated**: 2026-01-27  
**Status**: Ready for Merge
