# Story Mode Tail Progression Enforcement

## Overview

The StoryModeManager API implements **ENFORCED** sequential tail progression and story act advancement. This document details the enforcement rules and API endpoints.

## Enforcement Rules

### 1. Sequential Act Progression
- **Rule**: Players must progress through acts sequentially (Act 1 → Act 2 → Act 3 → Act 4 → Act 5)
- **Cannot**: Skip acts (e.g., jumping from Act 1 to Act 3)
- **Cannot**: Go backwards (e.g., returning from Act 3 to Act 2)
- **Enforced by**: `StoryModeManager.validate_act_progression()`

### 2. Tail Count Limits by Act
Tail progression is tied to story act completion:

| Act | Act Name | Max Tail Count | Tails Unlocked |
|-----|----------|----------------|----------------|
| 1   | SURVIVAL | 3              | Initial 3-Tail fusion |
| 2   | LAW      | 5              | Expand to 4-5 tails |
| 3   | MEMORY   | 6              | Expand to 6 tails |
| 4   | ALIGNMENT | 8             | Expand to 7-8 tails |
| 5   | SOVEREIGNTY | 9           | Ninth tail manifestation |

### 3. Tail Count Enforcement
- **Cannot Decrease**: Once tails are unlocked, the count cannot be reduced
- **Cannot Exceed Act Limit**: Tail count cannot exceed the maximum for current act
- **No Tier Skipping**: Cannot jump from 3 tails directly to 6+ tails
- **Enforced by**: `StoryModeManager.validate_tail_count()`

## API Endpoints

### Get Player Progress
```
GET /api/story-progress/{player_id}
```
Returns the player's current story progress and tail unlock status.

**Response:**
```json
{
  "player_id": "string",
  "current_act": 1,
  "max_tail_count": 3,
  "completed_acts": [],
  "updated_at": "2026-02-08T07:00:00Z"
}
```

### Advance Story Act
```
POST /api/story-progress/{player_id}/advance
Content-Type: application/json

{
  "current_act": 2
}
```

**Enforcement:**
- ✅ Allows sequential progression to next act
- ❌ Rejects act skipping (400 error)
- ❌ Rejects backward progression (400 error)
- Automatically unlocks appropriate tail count for new act

**Success Response (200):**
```json
{
  "player_id": "string",
  "current_act": 2,
  "max_tail_count": 5,
  "completed_acts": [1],
  "updated_at": "2026-02-08T07:00:00Z"
}
```

**Error Response (400):**
```json
{
  "detail": "Cannot skip acts. Current act: 1, attempted: 3. Must progress sequentially."
}
```

### Update Tail Count
```
POST /api/story-progress/{player_id}/tails
Content-Type: application/json

{
  "tail_count": 4
}
```

**Enforcement:**
- ✅ Allows increasing tail count within act limits
- ❌ Rejects decreasing tail count (400 error)
- ❌ Rejects exceeding act limit (400 error)
- ❌ Rejects tier skipping (400 error)

**Success Response (200):**
```json
{
  "player_id": "string",
  "current_act": 2,
  "max_tail_count": 4,
  "completed_acts": [1],
  "updated_at": "2026-02-08T07:00:00Z"
}
```

**Error Response (400):**
```json
{
  "detail": "Cannot have 6 tails in Act 2. Maximum allowed: 5. Complete more acts to unlock additional tails."
}
```

### Get Max Allowed Tails
```
GET /api/story-progress/{player_id}/max-tails
```

Returns the maximum tail count allowed for the player's current act.

**Response:**
```json
{
  "max_tails": 5,
  "current_act": 2,
  "completed_acts": [1]
}
```

## Implementation Details

### StoryModeManager Class

Located in `backend/server.py`, the StoryModeManager class provides:

1. **ACT_TAIL_LIMITS**: Mapping of act numbers to maximum tail counts
2. **validate_act_progression()**: Validates sequential act advancement
3. **validate_tail_count()**: Validates tail count changes
4. **update_progress()**: Updates player progress with enforcement
5. **update_tail_count()**: Updates tail count with validation

### Data Models

**PlayerProgress:**
```python
class PlayerProgress(BaseModel):
    player_id: str
    current_act: int (1-5)
    max_tail_count: int (3-9)
    completed_acts: List[int]
    updated_at: datetime
```

**ProgressUpdate:**
```python
class ProgressUpdate(BaseModel):
    current_act: int (1-5)
```

**TailCountUpdate:**
```python
class TailCountUpdate(BaseModel):
    tail_count: int (3-9)
```

## Testing

Comprehensive tests are included in `backend_test.py`:

1. **test_story_progress_enforcement()**: Tests sequential act progression rules
2. **test_tail_count_enforcement()**: Tests tail count validation rules

Run tests with:
```bash
python backend_test.py
```

## Design Philosophy

The enforcement system aligns with the game's core narrative:

> "Survival is not strength. Survival is memory that refuses erasure."

Tail progression is earned through story completion, not through exploitation or grinding. The system ensures:

- **Narrative Integrity**: Tail unlocks match story beats
- **No Save Scumming**: Progress is irreversible
- **Earned Power**: Each tail represents meaningful story progression
- **Design Coherence**: The system can't be cheesed or exploited

## Quest Rewards Integration

Quest rewards automatically advance story progress through the StoryModeManager:

1. Complete Act 1 missions → Unlock Act 2
2. Act 2 completion → Unlock 4-5 tail capacity
3. Act 3 completion → Unlock 6 tail capacity
4. Act 4 completion → Unlock 7-8 tail capacity
5. Act 5 completion → Unlock 9th tail (Memory King state)

The system ensures tail progression is **ENFORCED** by quest rewards, not player manipulation.

## Error Messages

All enforcement errors return HTTP 400 with descriptive messages:

- "Cannot skip acts. Current act: X, attempted: Y. Must progress sequentially."
- "Cannot decrease act from X to Y. Story progression is irreversible."
- "Tail count cannot decrease from X to Y. Tail progression is irreversible."
- "Cannot have X tails in Act Y. Maximum allowed: Z. Complete more acts to unlock additional tails."
- "Cannot skip tail tiers. Current: X, attempted: Y. Progression must be gradual."

## Summary

The StoryModeManager API provides a complete enforcement system that:

✅ **Prevents tier skipping** - Acts and tails must be unlocked sequentially  
✅ **Prevents decreasing progression** - No backwards movement  
✅ **Validates all changes** - API-level enforcement  
✅ **Matches documentation** - Behavior aligns with ENGINEERING_SPECS  
✅ **Preserves narrative** - Tail unlocks tied to story beats  

This resolves the issue raised in PR #40 where documentation claimed enforcement but implementation was missing.
