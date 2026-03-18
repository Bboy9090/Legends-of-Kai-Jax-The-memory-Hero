# Legend Node System - Future Enhancements

This document tracks potential improvements and enhancements identified during code review. These are **not blocking issues** - the current implementation is production-ready. These suggestions can be addressed in future iterations.

## Enhancement Suggestions

### 1. Make Perfect Dodge Frames Configurable

**Current Implementation:**
```typescript
private readonly PERFECT_DODGE_FRAMES_REQUIRED = 15; // ~0.25 seconds at 60fps
```

**Suggested Enhancement:**
- Extract to trial_rules in JSON data
- Add framerate awareness
- Support different values per trial difficulty

**Priority:** Low (current hardcoded value works well)

### 2. Extract Magic Numbers to Named Constants

**Current Implementation:**
```typescript
if (timeSinceLastDamage > 100) { // Grace period
```

**Suggested Enhancement:**
```typescript
private readonly DAMAGE_GRACE_PERIOD_MS = 100;
if (timeSinceLastDamage > this.DAMAGE_GRACE_PERIOD_MS) {
```

**Priority:** Low (improves readability but not critical)

### 3. Add Logging for Save Data Corrections

**Current Implementation:**
```typescript
if (this.unlockedTails.size !== this.currentTailCount) {
  this.currentTailCount = this.unlockedTails.size;
}
```

**Suggested Enhancement:**
```typescript
if (this.unlockedTails.size !== this.currentTailCount) {
  // Emit event or use logging system
  this.emitWarning('Save data inconsistency corrected');
  this.currentTailCount = this.unlockedTails.size;
}
```

**Priority:** Medium (helpful for debugging)

### 4. Replace Console.warn in LegendNodeManager

**Current Location:**
`LegendNodeManager.loadCompletedNodes()` line 146

**Suggested Enhancement:**
- Implement proper logging system
- Use log levels (debug, info, warn, error)
- Make logging configurable per environment

**Priority:** Medium (aligns with event-driven architecture)

### 5. Expand TrialEvent Type System

**Current Implementation:**
```typescript
export interface TrialEvent {
  type: 'failure';
  message: string;
  effects: { ... };
}
```

**Suggested Enhancement:**
```typescript
export type TrialEventType = 'start' | 'victory' | 'failure' | 'retry';

export interface TrialEvent {
  type: TrialEventType;
  message: string;
  effects?: { ... }; // Optional for events without effects
}
```

**Priority:** Low (current system handles all critical events)

## Implementation Notes

### When to Address
- **Before Production Release:** Items marked Medium priority
- **Future Iterations:** Items marked Low priority
- **Never Required:** All are enhancements, not bugs

### How to Implement
1. **Configurable Constants**: Add to trial_rules in schema
2. **Named Constants**: Extract at class level with clear names
3. **Logging System**: Create centralized logging service
4. **Event Expansion**: Add union type for TrialEventType

### Testing Impact
- All enhancements should include updated tests
- Integration example should demonstrate new features
- Documentation should be updated accordingly

## Why These Aren't Blocking

1. **Magic Numbers**: Current values are well-documented and functional
2. **Console Logging**: Only used in development/debugging paths
3. **Event Types**: Current 'failure' type covers all critical feedback
4. **Save Corrections**: Auto-correction works correctly, logging is bonus

## Conclusion

The Legend Node system is **production-ready as-is**. These enhancements are opportunities for future polish and extensibility, not requirements for the current vertical slice.

**Current Status:** ✅ Ready for Merge
**Enhancement Priority:** Can be addressed in follow-up PRs
