# 🧪 LEGENDARY COMBAT - INTEGRATION TEST PLAN

## Test Objective
Verify that the legendary combat systems integration is working correctly in Match.tsx.

## Files to Test
1. `/app/apps/web/src/pages/Match.tsx` - Main integration
2. `/app/apps/web/src/components/MatchOverlay.tsx` - UI updates
3. Legendary combat packages (engine/combat, engine/effects)

---

## Test Checklist

### ✅ **Pre-Test: Compilation Check**
- [ ] TypeScript compilation succeeds
- [ ] No import errors
- [ ] All packages build successfully

### ✅ **Test 1: Basic Match Load**
**Steps:**
1. Start dev server: `pnpm dev`
2. Navigate to character select
3. Select characters and start match
4. Verify match loads without errors

**Expected:**
- ✅ Match screen appears
- ✅ Both characters visible
- ✅ HUD shows HP bars
- ✅ No console errors
- ✅ "🔥 LEGENDARY COMBAT SYSTEMS ACTIVATED!" in console

**Status:** ⏳ Pending

---

### ✅ **Test 2: Combo System**
**Steps:**
1. In match, press `J` repeatedly to attack
2. Land multiple hits on opponent
3. Watch combo counter (bottom-right)

**Expected:**
- ✅ Combo counter appears after first hit
- ✅ Hit count increases with each hit
- ✅ Multiplier climbs (1.0x → 1.15x → 1.30x...)
- ✅ Damage increases with multiplier
- ✅ Combo tier changes color at thresholds:
  - 5 hits = GOOD (cyan)
  - 10 hits = GREAT (purple)
  - 20 hits = AMAZING (gold)
- ✅ Console shows: "🔥 [LEGENDARY HIT] ..." with multiplier

**Status:** ⏳ Pending

---

### ✅ **Test 3: Perfect Dodge System**
**Steps:**
1. In match, press `Shift` key
2. Observe screen

**Expected:**
- ✅ "SLOW MOTION" indicator appears (center screen)
- ✅ Time slows to 25% speed for ~3 seconds
- ✅ Console shows: "🔥 PERFECT DODGE! Slow-motion activated!"
- ✅ Cyan visual effects appear
- ✅ Time returns to normal after 3 seconds

**Status:** ⏳ Pending

---

### ✅ **Test 4: Perfect Parry System**
**Steps:**
1. In match, press `Q` key
2. Observe screen

**Expected:**
- ✅ Console shows: "🔥 PERFECT PARRY! Enemy stunned!"
- ✅ Gold spark effects appear
- ✅ Screen flashes white briefly
- ✅ Resonance meter increases

**Status:** ⏳ Pending

---

### ✅ **Test 5: Screen Shake**
**Steps:**
1. In match, land attacks with `J`
2. Watch camera/screen

**Expected:**
- ✅ Screen shakes on hit
- ✅ Shake intensity scales with damage
- ✅ Stronger hits = stronger shake

**Status:** ⏳ Pending

---

### ✅ **Test 6: UI Integration**
**Steps:**
1. Check Match Overlay displays all new data
2. Verify controls hint updated

**Expected:**
- ✅ Combo counter visible (bottom-right)
- ✅ Shows hit count + multiplier
- ✅ Shows tier badge
- ✅ Slow-motion indicator appears when active
- ✅ Controls show: "SHIFT - Dodge | Q - Parry"

**Status:** ⏳ Pending

---

### ✅ **Test 7: Performance**
**Steps:**
1. Press `D` to toggle debug mode
2. Check FPS in profiler widget
3. Land 50+ hit combo
4. Observe performance

**Expected:**
- ✅ Maintains 60 FPS
- ✅ No lag during slow-motion
- ✅ No memory leaks during long combos
- ✅ Smooth animations throughout

**Status:** ⏳ Pending

---

## Known Limitations (Acceptable for Testing)

1. **Dodge/Parry timing is simulated** - We use `performance.now() + 200ms` for testing
   - In production, would need actual enemy attack detection
   - For testing, pressing Shift/Q will trigger the effects

2. **AI opponent doesn't attack** - Can't fully test counter-windows yet
   - Would need AI implementation
   - Can still verify visual effects work

3. **Only 2 characters have enhanced models** - Others use placeholders
   - Doesn't affect combat system testing
   - Visual quality varies by character

---

## Success Criteria

**Minimum Viable Test (MVP):**
- ✅ Game compiles and runs
- ✅ Match loads without errors
- ✅ Combo system tracks hits
- ✅ Multiplier displays in UI
- ✅ Console shows legendary combat messages

**Full Success:**
- ✅ All 7 tests pass
- ✅ No console errors
- ✅ 60 FPS maintained
- ✅ All visual effects appear correctly
- ✅ UI updates dynamically

---

## Troubleshooting

### Issue: Game won't compile
**Solution:**
1. Build shared packages: `cd packages/shared && pnpm build`
2. Build engine packages: `cd packages/engine && pnpm build`
3. Clear cache: `rm -rf apps/web/.vite apps/web/node_modules/.vite`

### Issue: Import errors
**Solution:**
1. Check tsconfig.json paths
2. Verify package.json dependencies
3. Run `pnpm install` in root

### Issue: Legendary systems not activating
**Solution:**
1. Check console for "🔥 LEGENDARY COMBAT SYSTEMS ACTIVATED!"
2. If missing, check Match.tsx line ~170
3. Verify systems are initialized before game loop

### Issue: UI not updating
**Solution:**
1. Check MatchOverlay receives all props
2. Verify gameState includes combo/slowMotion data
3. Check React dev tools for state updates

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Document successful integration
2. Move to next feature (Story Mode or Training)
3. Consider adding AI for real dodge/parry testing

### If Some Tests Fail ⚠️
1. Document which tests failed
2. Check console errors
3. Debug specific failing systems
4. Re-test after fixes

### If Major Issues 🔴
1. Call troubleshoot_agent for RCA
2. Review integration steps
3. Check package versions
4. Verify all imports resolved

---

**Test Date:** ⏳ Pending  
**Tester:** AI Agent  
**Status:** Ready to Execute

**Let's test the legendary combat!** 🔥
