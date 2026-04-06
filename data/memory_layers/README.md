# Memory Layers

This directory contains the 9 memory layer data files for the Memory Weave system.

## Overview

Memory layers are behavioral modifiers that stack with every tail unlock in the game. Memory is force multiplication through meaning — it modifies perception, decision-making, and world interaction **before** stats.

### Core Principles

- **Cumulative Stacking**: Memory layers stack additively; they never replace each other
- **Irreversible**: Once activated, memory layers cannot be disabled, reset, or removed
- **Sequential Activation**: Memory layers activate in order (1→2→3→4→5→6→7→8→9)
- **Always Synchronized**: Memory count always equals tail count
- **Persist Across Save/Load**: Memory state saves and restores with player progression

## Memory Layer Files

Each tail (1-9) has a corresponding memory layer:

1. **tail_1_bond.memory.json** - First Trust (Bond)
2. **tail_2_chase.memory.json** - The Chase
3. **tail_3_connection.memory.json** - Connection
4. **tail_4_quill.memory.json** - Pain Remembered
5. **tail_5_shade.memory.json** - Disappearance
6. **tail_6_anchor.memory.json** - Holding the Line
7. **tail_7_echo.memory.json** - All the Paths You Could've Taken
8. **tail_8_rift.memory.json** - The Cost of Power
9. **tail_9_crown.memory.json** - Time Paid

## Schema Compliance

All memory layer files must conform to `schemas/memory_layer.schema.json`.

### Required Fields

- `memory_id` (string): Unique identifier
- `tail_number` (1-9): Associated tail number
- `memory_type` (enum): Type of memory
- `name` (string): Human-readable name
- `description` (string): Narrative description
- `read` (string): Core lesson/truth
- `gameplay_effects` (object): Effect arrays
  - `perception_shifts` (array): Visual/UI changes
  - `behavior_modifications` (array): Player behavior changes
  - `enemy_reactions` (array): Enemy AI changes
  - `world_interactions` (array): World state changes
- `stacking_rule` ("cumulative"): Always cumulative
- `persistence` ("irreversible"): Always irreversible

## Validation

Run validation to ensure all memory layers comply with schema:

```bash
npm run validate:memory
```

## Integration

Memory layers integrate with:

1. **Legend Node System** - Activated when completing Legend Nodes
2. **Character System** - Tracked in player character state
3. **Effect Handler** - Applied to gameplay every frame

### Activation Flow

1. Player completes Legend Node for tail N
2. Memory layer N is activated (unsealed)
3. Memory effects become active
4. Tail N is granted (power increase)
5. Memory + Tail count verified to be synchronized

## Design Philosophy

> **Power makes you dangerous. Memory makes you precise.**

Memory layers represent lived experience, not stat bonuses. They change how the world feels, how enemies behave, and how the player perceives combat. At 9 tails, all 9 memories are active, creating a cumulative behavioral advantage that reflects mastery through experience.

## Foundation for Sequel Persistence

Memory layers are designed to persist across game saves and can be extended to persist across sequels, allowing players to carry their experiential progression forward.
