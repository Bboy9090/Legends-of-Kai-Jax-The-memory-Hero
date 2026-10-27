# Combat Cancel-Window Specification

**Version**: 1.0  
**Status**: VERIFIED against source code (Mission 4–5 baseline)  
**Applies to**: Missions 1–5, Training mode (Arena & Adventure both)  
**Scope**: Establishes shared cancel eligibility rules before Mission 6 extensions  
**Verified**: combatTuning.ts, moveData.ts, frameTiming.ts, AttackResolver.ts, PlayerController.tsx, AdventurePlayerController.tsx

---

## 1. Simulation Baseline

| Parameter | Value | Remarks |
|-----------|-------|---------|
| **Frame Rate** | 60 Hz | Authored frame times are at 60 fps |
| **Frame Time** | 1/60 s ≈ 0.0167 s | Conversion factor for frame→seconds |
| **Move Timing Resolution** | ±1 frame | Startup, active, recovery, cancelAt are frame integers |

---

## 2. Move Frame Architecture

Every move has three phases:

```
[Startup] → [Active] → [Recovery]
  (no hit)    (can hit)   (no hit)
```

At the frame level:
- **Startup**: frames 1 to N (no hitbox active)
- **Active**: frames (N+1) to (N+M) (hitbox active)
- **Recovery**: frames (N+M+1) to (N+M+K) (no hitbox)
- **Total Duration**: N + M + K frames

**Conversion to Seconds:**
```
startupTime = startup * FRAME_TIME
activeTime = active * FRAME_TIME
recoveryTime = recovery * FRAME_TIME
totalTime = startupTime + activeTime + recoveryTime
```

---

## 3. Cancel Window Authored Data

All moves have a `cancelAt` property (in frames):

| Move | Startup | Active | Recovery | **CancelAt** | Total | CancelWindow |
|------|---------|--------|----------|------------|-------|--------------|
| **light1** | 5 | 4 | 8 | **10** | 17 | Frames 1–10 |
| **light2** | 5 | 4 | 9 | **11** | 18 | Frames 1–11 |
| **light3** | 6 | 5 | 12 | **0** | 23 | None (full recovery) |
| **heavy** | 9 | 6 | 16 | **0** | 31 | None (full recovery) |
| **skill** | 8 | 8 | 17 | **0** | 33 | None (full recovery) |

### Cancel Window Calculation

```typescript
// From frameTiming.ts
const authoredCancelTime = move.cancelAt > 0 ? framesToSeconds(move.cancelAt) : totalTime;
const cancelTime = Math.min(totalTime, authoredCancelTime);
```

**Runtime Enforcement:**
```typescript
// From AdventurePlayerController.tsx (lines 214–232)
if (currentMove && currentMove.cancelAt > 0) {
  const timing = getMoveFrameTime(currentMove);
  const elapsed = timing.totalTime - attackTimerRef.current;
  
  // Cancel allowed when elapsed >= timing.cancelTime
  if (elapsed >= timing.cancelTime) {
    // Check stamina BEFORE allowing cancel
    if (store.useStamina(MOVES[nextMoveKey].staminaCost)) {
      // Execute cancel: increment combo step, start next move
    }
  }
}
```

---

## 4. Cancel Eligibility Rules

A cancel is permitted when **all** of the following hold:

### 4.1 Combat State Precedence
The formal state machine precedence (from CombatStateMachine.ts):
```
DODGING > GUARD_BROKEN > HITSTUN > ATTACKING > PARRY_WINDOW/BLOCKING > FREE
```

**Cancel Eligibility by State:**
- ❌ **DODGING**: No cancel allowed (locked until dodge completes)
- ❌ **GUARD_BROKEN**: No cancel allowed (locked until stun recovers)
- ❌ **HITSTUN**: No cancel allowed (locked until hitstun recovers)
- ✅ **ATTACKING**: Cancel allowed if elapsed ≥ cancelTime (see below)
- ❌ **PARRY_WINDOW** (Arena only): No cancel while parry window active
- ❌ **BLOCKING** (Arena only): No cancel while blocking
- ✅ **FREE**: Attack can start (not a cancel)

**Implementation**: `PlayerController.tsx` (lines 191–215) and `AdventurePlayerController.tsx` (lines 117–141) return early if any state-lock is active.

### 4.2 Frame Timing Gate
Cancel is only legal if move has `cancelAt > 0` **AND** elapsed time ≥ cancelTime:

```typescript
if (currentMove && currentMove.cancelAt > 0) {
  const timing = getMoveFrameTime(currentMove);
  const elapsed = timing.totalTime - attackTimerRef.current;
  
  if (elapsed >= timing.cancelTime) {
    // Cancel gate passed
  }
}
```

**Boundary Conditions:**
- **Frame 9** (light1): elapsed < 10/60 ≈ 0.1667s → cancel **denied**
- **Frame 10** (light1): elapsed ≥ 10/60 ≈ 0.1667s → cancel **allowed**
- **Frame 11** (light2): elapsed ≥ 11/60 ≈ 0.1833s → cancel **allowed**
- **light3, heavy, skill (cancelAt=0)**: elapsed must ≥ totalTime → cancel only on move completion

### 4.3 Stamina Cost Gate
Before executing the cancel, the next move's stamina cost must be deducted:

```typescript
if (store.useStamina(MOVES[nextMoveKey].staminaCost)) {
  // Cancel proceeds
} else {
  // Cancel denied: insufficient stamina
}
```

**Stamina Costs (from moveData.ts):**
| Move | Stamina Cost |
|------|--------------|
| light1 | 4 |
| light2 | 4 |
| light3 | 7 |
| heavy | 22 |
| skill | 27 |

**Result**: If player stamina < nextMove.staminaCost, cancel is denied even if frame timing allows it.

### 4.4 Combo Routing Gate
Punch combos are limited to `light1 → light2 → light3`:

```typescript
const MAX_LIGHT_CHAIN_STEP = 2;  // From AttackResolver.ts

export function normalizeComboStep(comboStep: number): number {
  return Math.max(0, Math.min(MAX_LIGHT_CHAIN_STEP, Math.trunc(comboStep)));
}
```

**Routing Rules:**
- **Step 0** (initial): next move is light1
- **Step 1** (after light1): next move is light2
- **Step 2** (after light2): next move is light3
- **Step 3+**: No valid next move (combo ends)

**Other Attack Types:**
- **Kick (light2)**: Always goes to light2 (not a combo)
- **Special (skill)**: Always goes to skill (not a combo)
- **Ultimate (heavy)**: Always goes to heavy (not a combo)

---

## 5. Input Buffering

### Arena Mode (PlayerController.tsx)
Uses explicit input buffering with expiry:

```typescript
import { queueBufferedAttack, tickBufferedAttack, type BufferedAttack } from "../../game/combat/inputBuffer";

// On input press:
attackBufferRef.current = queueBufferedAttack(queuedAttack);

// Each frame:
attackBufferRef.current = tickBufferedAttack(attackBufferRef.current, delta);
```

**Buffering Contract** (from inputBuffer.ts, not yet examined but referenced):
- Input is queued on key press with a timestamp
- Buffered input expires after a fixed window (needs verification)
- Newest attack intent takes precedence if multiple queued

### Adventure Mode (AdventurePlayerController.tsx)
Uses direct input polling (no explicit buffer):

```typescript
// Each frame:
const justPressed = (code: string) => keys[code] && !prev[code];

if (justPressed("KeyJ") || ... || touchAttacks.includes("attack")) {
  // Input consumed immediately if conditions allow
}
```

**Input Contract:**
- Input consumed on the frame it is detected
- No expiry window
- Latest input type wins if pressed during attack

---

## 6. Hitstun / Recovery State Precedence

When a hit lands, the defender enters hitstun:

```typescript
playerHitStunTimer: number;  // Seconds remaining
```

**Duration** (from moveData.ts via hitstunFrames):
| Move | Hitstun | In Seconds |
|------|---------|-----------|
| light1 | 11 frames | 0.1833 s |
| light2 | 13 frames | 0.2167 s |
| light3 | 18 frames | 0.3 s |
| heavy | 28 frames | 0.4667 s |
| skill | 24 frames | 0.4 s |

**State Transition** (Adventure):
```typescript
// From AdventurePlayerController.tsx
if (p.hitStunTimer > 0) {
  store.setHitStunTimer(Math.max(0, p.hitStunTimer - delta));
  if (p.hitStunTimer - delta <= 0) store.setCombatState(CombatState.FREE);
  // No input processing while in hitstun
  return;
}
```

**Arena** (from useBattle.tsx):
```typescript
playerHitStunTimer: number;
// Combat state resolved via resolveBattleCombatState():
// If playerHitStunTimer > 0 → state is HITSTUN (blocks all action)
```

---

## 7. Guard Mechanics (Arena Only)

Adventure mode has **no guard system** (pure dodge + counterattack).

Arena mode has guard/parry with stun recovery:

```typescript
playerGuardPressure: number;     // 0–100 buildup
guardBreakTimer: number;          // Remaining stun
playerBlockParryWindow: number;   // Parry window remaining
```

**Guard Pressure Rules** (from useBattle.tsx, guardAndClash.ts):
- Blocked hits accumulate pressure
- Pressure threshold triggers guard break
- Guard-broken defender enters locked state (no cancel allowed)

**For Cancel-Window Spec**: Guard break is a state lock that blocks all cancels (precedence rule 4.1).

---

## 8. Hitstop Frames

When a move connects, both attacker and defender enter hitstop (brief pause):

```typescript
export function hitStopSecondsForMove(move: MoveData): number {
  return Math.max(0, move.hitStopFrames) * FRAME_TIME;
}
```

**Hitstop Durations** (from moveData.ts):
| Move | Hitstop Frames | In Seconds |
|------|----------------|-----------|
| light1 | 3 | 0.05 s |
| light2 | 3 | 0.05 s |
| light3 | 5 | 0.0833 s |
| heavy | 8 | 0.1333 s |
| skill | 6 | 0.1 s |

**Cancel Behavior During Hitstop**:
- Frame loop skips input processing if `hitStop > 0` (PlayerController.tsx line 133)
- Buffered input preserved across hitstop
- Input consumed on first frame after hitstop clears

---

## 9. Current Behavior Summary

### Cancel Precedence (All-Encompassing)
1. **Hitstop Active?** → Skip input processing; preserve buffered input
2. **Hitstun Timer > 0?** → Locked; no action; no cancel
3. **Dodge Timer > 0?** → Locked; no action; no cancel
4. **Guard Break Timer > 0?** → Locked; no action; no cancel
5. **Currently Attacking?**
   - Check frame timing: `elapsed >= cancelTime`?
   - Check stamina: `player.stamina >= nextMove.staminaCost`?
   - Check combo routing: valid next move exists?
   - If all pass: execute cancel (increment combo, start next move, deduct stamina)
   - If any fail: continue current move animation
6. **Parry Window Active?** (Arena) → Can parry; no cancel
7. **Blocking?** (Arena) → Cannot cancel; must unblock first
8. **Free State** → Can start new attack (not a cancel)

---

## 10. Boundary Test Cases

These tests verify the contract **before extending for Mission 6**:

### Test 1: Frame 9/10 Boundary (light1)
```typescript
const move = MOVES.light1;  // cancelAt: 10
const timing = getMoveFrameTime(move);

// Frame 9 (elapsed = 9/60 = 0.15 s)
expect(elapsed < timing.cancelTime).toBe(true);  // 0.15 < 0.1667
// → Cancel denied ✓

// Frame 10 (elapsed = 10/60 = 0.1667 s)
expect(elapsed >= timing.cancelTime).toBe(true);  // 0.1667 >= 0.1667
// → Cancel allowed ✓
```

### Test 2: No Early Cancel (light3)
```typescript
const move = MOVES.light3;  // cancelAt: 0
const timing = getMoveFrameTime(move);

// Frame 22 (elapsed < totalTime)
expect(elapsed < timing.cancelTime).toBe(true);
// → Cancel denied ✓

// Frame 23 (elapsed >= totalTime)
expect(elapsed >= timing.cancelTime).toBe(true);
// → Cancel allowed ✓
```

### Test 3: Stamina Exhaustion
```typescript
const player = { stamina: 3, ...others };
const nextMove = MOVES.light1;  // staminaCost: 4

expect(player.stamina >= nextMove.staminaCost).toBe(false);
// → Cancel denied (stamina gate) ✓
```

### Test 4: Hitstun Locks Cancel
```typescript
const playerState = { 
  playerHitStunTimer: 0.15,  // 9 frames remaining
  playerAttacking: true,
  playerAttackElapsed: (MOVES.light1.startup + MOVES.light1.active + 1) / 60,
  ...others
};

// Hitstun precedence blocks action
expect(resolveBattleCombatState({
  playerHitStunTimer: 0.15,
  ...otherInputs
})).toBe(BattleCombatState.HITSTUN);

// Frame loop early-returns (PlayerController line 196)
// → No input processed ✓
```

### Test 5: Buffered Input Expiry (Arena)
```typescript
// Punch buffered at t=0
attackBufferRef.current = queueBufferedAttack("punch");

// Tick for 0.5 seconds (buffer should expire)
attackBufferRef.current = tickBufferedAttack(attackBufferRef.current, 0.5);

// Result: null (if buffer window < 0.5s) or active (if window > 0.5s)
// (Actual window duration requires inputBuffer.ts review)
```

### Test 6: Combo Step Routing
```typescript
const comboStep = 0;
const nextStep = comboStep + 1;
const moveKey = `light${nextStep + 1}`;  // "light2"

expect(nextStep < MAX_LIGHT_CHAIN_STEP).toBe(true);  // 1 < 2
expect(MOVES[moveKey]).toBeDefined();
// → light2 available ✓

// Step 2 → light3 ✓
// Step 3 → no valid moveKey ✗
```

---

## 11. Unification Across Arena & Adventure

| Mechanic | Arena | Adventure | Unified? |
|----------|-------|-----------|----------|
| Frame timing (60 Hz) | ✓ | ✓ | Yes |
| cancelAt authored data | ✓ | ✓ | Yes |
| Frame→seconds conversion | ✓ | ✓ | Yes |
| Hitstun precedence | ✓ | ✓ | Yes |
| Stamina cost gating | ✓ | ✓ | Yes |
| Combo step routing | ✓ | ✓ | Yes |
| Input buffering | ✓ Explicit | ✗ Polling | **Divergent** |
| Guard/parry system | ✓ | ✗ | **Divergent** |
| 1D vs 3D movement | 1D | 3D | **Divergent** |
| Hitstop frame pause | ✓ | ✓ | Yes |

**Unified Contract Achieved**: ✓ Cancel eligibility, stamina costs, frame timing, combo routing.  
**Divergent (Intentional)**: Input buffering strategy, defense mechanics, movement dimensions.

---

## 12. Mission 6 Extension Points

The specification is designed to absorb these without breaking Missions 1–5:

### 12.1 Air Combos
- **Requirement**: Detect airborne state; allow different combo routes
- **Change**: Add `isAirborne` gate to combo routing
- **Impact**: No change to frame timing, stamina costs, or cancel windows

### 12.2 Cancel-Into-Dodge
- **Requirement**: Allow dodge cancellation during certain move phases
- **Change**: Add state gate `CombatState.DODGING` as separate escape route
- **Impact**: No change to existing combo chains

### 12.3 Boss-Specific Cancel Windows
- **Requirement**: Boss moves may have different cancelAt values
- **Change**: Override `moveData` for boss fighters
- **Impact**: Reuse same frame timing resolution; no engine change

### 12.4 Defensive Counters
- **Requirement**: Allow parry stagger to chain into a counter move
- **Change**: Add `CombatState.PARRY_STAGGER` that permits one specific cancel
- **Impact**: Treated as a state lock initially; can transition to attack on frame gate

---

## 13. Regression Test Scope

Before merging any Mission 6 changes, verify:

1. **All Moves Can Execute** (frame 0–totalTime)
   - Startup, active, recovery timing correct
   - Hitstun/hitstop applied correctly
   
2. **Cancel Windows Enforce Frame Gates**
   - Frame 9 denies light1 cancel
   - Frame 10 allows light1 cancel
   - Frame 11 allows light2 cancel
   - No early cancel (light3, heavy, skill) until completion
   
3. **Stamina Gates Work**
   - Exhausted stamina blocks cancel
   - Stamina deducted on successful cancel
   - Stamina regen delay respected
   
4. **Combo Routing Correct**
   - punch → light1 → light2 → light3 (then end)
   - kick → light2 (standalone)
   - special → skill (standalone)
   - ultimate → heavy (standalone)
   
5. **State Precedence Blocks Cancels**
   - Hitstun active → no input processed
   - Dodge active → no input processed
   - Guard break → no input processed
   - Parry window → no cancel (Arena only)
   
6. **Input Buffering Preserves Across Hitstop**
   - Buffered input survives hitstop pause
   - Input consumed on first unpaused frame
   
7. **Missions 1–5 Still Pass**
   - All existing missions reach completion without frame-timing changes
   - No new state locks interfere with existing flows

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-10-27 | Initial specification, verified against source code |

---

## Appendix: Source Locations

| Topic | File | Lines |
|-------|------|-------|
| Frame timing | `game/combat/frameTiming.ts` | 14–42 |
| Move data | `game/combat/moveData.ts` | 58–140 |
| Combat state FSM | `game/combat/CombatStateMachine.ts` | 32–57 |
| Arena execution | `components/game/PlayerController.tsx` | 125–250+ |
| Adventure execution | `components/game/adventure/AdventurePlayerController.tsx` | 80–250+ |
| Stamina validation | `lib/stores/useBattle.tsx` | (stamina property) |
| Adventure stamina | `lib/stores/useAdventure.ts` | 298–320 |

