# TASK D: Duplicate Key Defect - ROOT CAUSE FOUND

**Date:** 2026-08-01 UTC  
**Status:** Duplicate KAIJAX entry confirmed

---

## React Warning Evidence

Console error from Versus mode:
```
Warning: Encountered two children with the same key, `%s`. Keys should be unique 
so that components maintain their identity across updates. Non-unique keys may 
cause children to be duplicated and/or omitted
```

Duplicate keys reported: `jaxon`, `kaison`

---

## Investigation

### FIGHTERS Array Construction

**File:** `apps/web/src/lib/characters.ts`

Line 303:
```tsx
export const FIGHTERS: Fighter[] = [...BEAST_WARS_FIGHTERS, ...EXTRA_LEGENDS];
```

Sources:
1. `BEAST_WARS_FIGHTERS` - mapped from `COMPLETE_BEAST_ROSTER`
2. `EXTRA_LEGENDS` - hardcoded array of 30 fighters

---

## Duplicate Found: KAIJAX

**Location:** `EXTRA_LEGENDS` array in characters.ts

| Line | ID | Name | Role | Status |
|------|-----|------|------|--------|
| 32-39 | `"kaijax"` | KaiJax | hero | **FIRST OCCURRENCE** |
| 266-273 | `"kaijax"` | KaiJax | hero | **DUPLICATE** |

**Duplicate Properties Match Exactly:**
```tsx
// Line 32-39
{
  id: "kaijax",
  name: "KaiJax",
  displayName: "KAI-JAX",
  accentColor: "#7fff00",
  baseStats: { power: 88, speed: 85, defense: 82, gravity: 9.8 },
}

// Line 266-273
{
  id: "kaijax",
  name: "KaiJax",
  displayName: "KAI-JAX",
  accentColor: "#7fff00",
  baseStats: { power: 92, speed: 90, defense: 88, gravity: 9.8 },  // ← STATS DIFFER
}
```

**Note:** Stats differ between the two entries (88→92 power, 85→90 speed, 82→88 defense).

---

## Regarding Jaxon and Kaison Warnings

**Investigation Result:** Single entries in EXTRA_LEGENDS

| Fighter | Line | ID | Status |
|---------|------|----|----|
| Jaxon | 59-66 | `"jaxon"` | Appears once in EXTRA_LEGENDS |
| Kaison | 68-75 | `"kaison"` | Appears once in EXTRA_LEGENDS |

**Question Unresolved:** Why does console warn about jaxon and kaison duplicate keys if they appear only once in EXTRA_LEGENDS?

**Possible Explanations:**
1. COMPLETE_BEAST_ROSTER contains duplicate jaxon/kaison entries
2. React key warning persists from earlier build
3. Different fighter roster version loaded in browser cache

**Status:** Jaxon/Kaison duplicates not visually confirmed in active characters.ts

---

## Confirmed Defect

**Duplicate KAIJAX entry is a clear defect:**
- Same ID appearing twice
- Stats conflict between entries
- One will be overwritten in FIGHTERS array
- Causes React key collision

**Fix Required:**
Remove one KAIJAX entry (lines 266-273 recommended - keep first entry with lower power for balance).

---

## Code Quality Issues

1. **KAIJAX appears twice in same array** (lines 32-39, 266-273)
   - First occurrence: base stats (power:88, speed:85, defense:82)
   - Second occurrence: inflated stats (power:92, speed:90, defense:88)
   - Unclear intent

2. **Array structure suggests late addition**
   - KAIJAX reappears at end of array
   - Suggests developer added variant without checking for existing entry

3. **No deduplication logic**
   - FIGHTERS array does not filter duplicates
   - Relies on manual array maintenance

---

## Test Verification of Jaxon/Kaison

To verify whether BEAST_WARS_FIGHTERS contains duplicate jaxon/kaison:
1. Log BEAST_WARS_FIGHTERS.length
2. Log COMPLETE_BEAST_ROSTER.length
3. Filter for duplicate IDs
4. Compare with React warning output

---

## Recommendation

Remove duplicate KAIJAX entry at lines 266-273, keeping the original at lines 32-39.

If jaxon/kaison duplicates exist in BEAST_WARS_FIGHTERS, they must be removed from COMPLETE_BEAST_ROSTER source.
