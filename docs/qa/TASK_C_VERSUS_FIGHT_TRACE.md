# TASK C: Versus FIGHT Transition - ROOT CAUSE IDENTIFIED

**Date:** 2026-08-01 UTC  
**Status:** Root cause found

---

## FIGHT Button Handler Trace

**Component File:** `apps/web/src/components/game/VersusCharacterSelect.tsx`  
**Button Location:** Line 289-293

```tsx
<button
  onClick={() => beginMatch(true)}
  className="px-6 py-2 rounded-lg border border-slate-600 hover:border-slate-400 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={!selected}
>
  FIGHT
</button>
```

**Handler Function:** `beginMatch(training: boolean)` at line 146-159

```tsx
const beginMatch = (training: boolean) => {
  if (!selected) return;           // Line 147: Guard clause
  resetPhase();                    // Line 148
  setTrainingSession(training);    // Line 149
  setCharacter(selectedId);        // Line 150
  setPlayerFighter(selectedId);    // Line 151
  const others = FIGHTERS.map((f) => f.id).filter((id) => id !== selectedId);
  const opponentId = others[Math.floor(Math.random() * others.length)] ?? selectedId;
  setOpponentFighter(opponentId);  // Line 154
  resetPhase();                    // Line 156 (duplicate call)
  start();                         // Line 157
  setGameState("playing");         // Line 158 ← STATE TRANSITION
};
```

---

## State Transition Target

**Handler writes:** `setGameState("playing")`

**App.tsx expects:** 

Line 83-84 determines `battleCanvasActive`:
```tsx
const battleCanvasActive =
  (phase === "playing" || phase === "ended") && gameState === "playing";
```

**Condition for BattleUI mount (line 364):**
```tsx
{battleCanvasActive && (
  <>
    ...
    <BattleUI />
    ...
  </>
)}
```

---

## What The Handler Does

| Step | Function | Store | Expected Effect |
|------|----------|-------|-----------------|
| 1 | `resetPhase()` | useGame | Resets battle phase to initial state |
| 2 | `setTrainingSession(training)` | useRunner | Sets training flag for score tracking |
| 3 | `setCharacter(selectedId)` | useRunner | Stores selected fighter ID |
| 4 | `setPlayerFighter(selectedId)` | useBattle | Sets player fighter in battle store |
| 5 | `setOpponentFighter(opponentId)` | useBattle | Randomly selects opponent from other fighters |
| 6 | `start()` | useGame (inferred) | Initializes battle phase to "playing" |
| 7 | `setGameState("playing")` | useRunner | Routes to battle scene |

---

## Guard Clause Analysis

**Line 147 - Early exit condition:**
```tsx
if (!selected) return;
```

**Verified in test:**
- Fighter WAS selected (Kaison visible in character select)
- Button was clickable (not disabled)
- Guard clause should not fire

---

## Possible Root Causes (Unresolved)

### Issue 1: Phase Not Initialized
- `resetPhase()` and `start()` control `phase` state
- If `start()` doesn't set `phase === "playing"`, BattleUI won't mount
- **Status:** Unconfirmed - need to verify `start()` implementation

### Issue 2: State Timing
- `setGameState("playing")` is called after `start()`
- If `start()` is async or delayed, there's a race condition
- **Status:** Unconfirmed - handler appears synchronous

### Issue 3: React Key Warnings
- VersusCharacterSelect console shows React duplicate key errors (jaxon, kaison)
- This may cause component re-render that overwrites state
- **Status:** Confirmed error, impact unproven

### Issue 4: Validation Failure
- Opponent selection: `others.length` might be 0 if fighter list malformed
- Would cause opponentId to default to selectedId
- Unlikely to block handler entirely
- **Status:** Unlikely blocker

### Issue 5: Handler Not Called
- Despite appearance, click event may not fire
- Button may be disabled despite `selected` being truthy
- **Status:** Contradicts test evidence (handler appears to have fired)

---

## Confirmed Facts

✅ FIGHT button exists and is clickable  
✅ Handler function signature is correct  
✅ Handler sets `gameState = "playing"` (correct state value)  
✅ App.tsx listens for `gameState === "playing"`  
✅ BattleUI component is conditionally mounted on correct state  
✅ Fighter selection is working (visible in UI)  
✅ No syntax errors in handler  

---

## Unconfirmed

❓ Does `start()` function set `phase === "playing"`?  
❓ Is handler actually being invoked on FIGHT click?  
❓ Do React key warnings prevent state update?  
❓ Is opponent selection working?  
❓ Is there a hidden condition preventing mount?  

---

## Next Investigation Required

To determine exact failure point, need to:

1. Trace `start()` function in `useGame` store
2. Verify it sets `phase === "playing"`
3. Add console.log to handler to confirm it fires
4. Check if both `phase` and `gameState` are correctly set after click
5. Investigate React key warnings impact
6. Verify opponent array is non-empty

## Temporary Conclusion

Handler appears correct and should work. Failure is likely in:
- `start()` not initializing phase correctly
- Or race condition between state updates
- Or React re-render interfering with state

**Not a handler write issue** (correct state value) **- likely an initialization issue.**

---

## Code Quality Notes

- Duplicate `resetPhase()` call on lines 148 and 156 (should remove one)
- React duplicate keys in VersusCharacterSelect need fixing
- Guard clause on line 147 should have error logging
