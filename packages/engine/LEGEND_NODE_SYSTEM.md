# Legend Node System

## Overview

The Legend Node system implements **irreversible behavioral trials** that gate tail unlocks in Legends of Kai-Jax. This establishes the foundation for all progression content from Tail 4 through Tail 9.

## Core Principles

### Immutability
- **Tail unlocks are permanent** - Once a tail is unlocked, it cannot be removed or re-locked
- **Sequential progression only** - Tails must unlock in order: 3→4→5→6→7→8→9
- **No skipping allowed** - Players cannot skip trials or unlock tails out of sequence
- **One completion only** - Each Legend Node can only be completed once per save file

### Canon Compliance
All Legend Node logic enforces the rules from `README_CANON.md`:
- Starting tails: **3** (const)
- Final tails: **9** (const)
- Unlock rule: **sequential_only** (enum)
- Skip unlocks: **disallowed** (const true)
- Tails are **permanent** (const true)

## Architecture

### Schema Layer
- **`schemas/legend_node.schema.json`** - JSON Schema defining valid Legend Node structure
- Enforces required fields, type constraints, and business rules
- Validates `tail_unlocked` is 4-9 only
- Enforces `no_skip_allowed` must be true

### Data Layer
- **`data/legend_nodes/*.node.json`** - Individual Legend Node definitions
- Example: `quill_trial.node.json` for Tail 4 unlock
- Each node validates against the schema

### Core Systems

#### LegendNodeValidator (`packages/engine/src/progression/LegendNodeValidator.ts`)
Static validator that enforces schema and business rules:
- Validates node structure against schema
- Prevents duplicate `tail_unlocked` values across nodes
- Ensures `no_skip_allowed` is always true
- Tracks loaded nodes to detect conflicts

#### LegendNodeManager (`packages/engine/src/progression/LegendNodeManager.ts`)
Manages Legend Node lifecycle:
- Loads and validates Legend Nodes from data files
- Tracks completed nodes per player (immutable set)
- Enforces: player must have exact `starting_tail_count_required`
- Prevents duplicate completions (throws error)
- Returns unlocked tail count after all completions

#### WorldState (`packages/engine/src/world/WorldState.ts`)
Global progression tracker:
- Persists completed Legend Nodes to save file
- Tracks current tail count (3-9)
- Loads on game start
- Marks nodes as irreversible
- Validates save data consistency

### Trial Implementation

#### QuillTrial (`packages/engine/src/trials/QuillTrial.ts`)
First Legend Node trial implementing state machine:

**States:** SETUP → ACTIVE → VICTORY/FAILURE → COMPLETE

**Victory Conditions:**
- Perfect dodges: 5 required (consecutive frames without damage post-dodge)
- Posture breaks: 3 required (enemy posture broken by player)
- Damage taken: Must stay under 35% threshold
- Enemies defeated: 1 required

**Failure Conditions:**
- Health depleted (health <= 0)
- Excessive damage taken (exceeds threshold)

**On Victory:**
- Lock arena
- Grant Tail 4 (Quill)
- Grant combat unlocks: `retaliation_spikes`, `posture_shred_on_dodge`
- Mark node complete in LegendNodeManager

**On Failure:**
- Diegetic feedback (no UI):
  - Camera tightens
  - Sound dampens
  - Quill shadows flicker on spine and fade
- Output: "You flinch. The world does not."
- Allow retry without penalty

### Character Integration

#### KaiJaxCharacter Updates (`packages/characters/src/heroes/KaiJax/KaiJaxCharacter.ts`)
Added progression tracking:
- `currentTailCount: number` - Current tail count (starts at 3)
- `unlockedTails: Set<string>` - Tracks which tails are available
- `unlockTail(tailName, tailNumber)` - Grant tail on Legend Node completion
- Enforces: tail count never exceeds 9
- Enforces: tail count cannot decrease

## Usage

### Loading a Legend Node

```typescript
import { LegendNodeManager } from '@beast-kin/engine';

const manager = new LegendNodeManager();

// Load from JSON data
const quillNode = require('../../data/legend_nodes/quill_trial.node.json');
manager.loadLegendNode(quillNode);
```

### Checking If Player Can Attempt

```typescript
const playerTailCount = 3; // Player's current tail count
const canAttempt = manager.canAttemptNode('legend_node_quill', playerTailCount);

if (!canAttempt) {
  console.log('Cannot attempt - requires exactly 3 tails');
}
```

### Running a Trial

```typescript
import { QuillTrial, TrialState } from '@beast-kin/engine';

const node = manager.getNode('legend_node_quill');
const trial = new QuillTrial(node, manager);

// Start trial
trial.start(100); // Player max health

// During gameplay, call these methods:
trial.onDodge();           // Player dodges
trial.onDodgeFrame();      // Each frame after dodge with no damage
trial.onDamageTaken(10);   // Player takes damage
trial.onPostureBreak();    // Player breaks enemy posture
trial.onEnemyDefeated();   // Player defeats enemy

// Each frame
trial.update(deltaTime);

// Check state
if (trial.getState() === TrialState.COMPLETE) {
  console.log('Trial completed!');
  console.log(`Unlocked: ${trial.getReward().tail}`);
}

if (trial.getState() === TrialState.FAILURE) {
  // Allow retry
  trial.retry();
}
```

### Saving and Loading Progress

```typescript
import { WorldState } from '@beast-kin/engine';

// Save
const worldState = WorldState.create();
worldState.completeNode('legend_node_quill', 4);
const saveData = worldState.serialize();
// Save to file/database

// Load
const loadedState = WorldState.fromSaveData(saveData);
console.log(`Current tails: ${loadedState.getCurrentTailCount()}`);
console.log(`Completed nodes: ${loadedState.getCompletedNodes()}`);
```

## Testing

Comprehensive test suite validates:
- Schema validation (`LegendNodeValidator.test.ts`)
- Node lifecycle management (`LegendNodeManager.test.ts`)
- Trial state machine (`QuillTrial.test.ts`)

Run tests:
```bash
# When test infrastructure is set up
npm test
```

## Future Legend Nodes

To create a new Legend Node:

1. Create data file: `data/legend_nodes/[name]_trial.node.json`
2. Follow schema: `schemas/legend_node.schema.json`
3. Set `tail_unlocked` to 5-9 (Tail 4 is Quill Trial)
4. Set `starting_tail_count_required` to `tail_unlocked - 1`
5. Keep `no_skip_allowed: true` (immutable)
6. Implement trial in `packages/engine/src/trials/[Name]Trial.ts`

Example for Tail 5:
```json
{
  "node_id": "legend_node_shade",
  "tail_unlocked": 5,
  "unlock_conditions": {
    "starting_tail_count_required": 4,
    "no_skip_allowed": true
  },
  ...
}
```

## Validation

All Legend Nodes automatically validate:
- ✅ Tail unlocked is 4-9 only
- ✅ No duplicate tail_unlocked values
- ✅ No skipping allowed (always true)
- ✅ Required fields present
- ✅ Victory and failure conditions defined
- ✅ Reward includes tail name, visual change, combat unlocks

Failed validation throws clear error with specific reason.

## Integration Points

### With World Systems
Legend Node completion triggers world reactions from `data/world/tail_tier_reactions.json`:
- Enemy AI behavior changes
- Music intensity scales
- NPC reactions evolve
- Environmental responses

### With Character System
Tail unlocks grant:
- New combat abilities
- Increased power scaling
- Visual transformations (diegetic, not UI)

### With Save System
Legend Nodes persist as irreversible markers:
- Cannot be undone
- Cannot be re-attempted
- Survive game restarts

## Security

- No client-side tail count manipulation
- Save file validation on load
- Schema enforcement at build time
- Runtime assertions in debug builds

## License

Part of Legends of Kai-Jax franchise codebase.
