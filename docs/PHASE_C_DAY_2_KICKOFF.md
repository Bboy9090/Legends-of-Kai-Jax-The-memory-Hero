# Phase C Day 2: Performance Profiling & Asset Integration Kickoff

**Date:** Sept 2, 2026  
**Focus:** Performance validation + Asset integration  
**Success Criteria:** Kai at 60 FPS (high-end), 57+ FPS (mid-range), model asset loaded  
**Estimated Duration:** 1 day  

---

## Overview

Day 1 delivered a complete Kai MVP architecture with all mechanics implemented. Day 2 focuses on:

1. **Performance Profiling** - Measure FPS on different hardware tiers
2. **Asset Integration** - Load GLB model if available
3. **Animation Verification** - Confirm clips work correctly
4. **Wall Climbing Setup** - Enable vertical traversal mechanics

---

## Task Breakdown by Role

### ENGINEER TASKS (Primary)

#### Task 1: Performance Profile Kai in Test Scene
**Duration:** 2-3 hours  
**Acceptance Criteria:**
- Measure FPS on high-end hardware (target: 60 FPS)
- Measure FPS on mid-range hardware (target: 57+ FPS)
- Measure FPS on low-end hardware (fallback: 30 FPS)
- Log metrics: draw calls, memory, frame time

**Process:**
1. Start Kai test scene: `http://localhost:3000/?mode=kai-test`
2. Record performance with Chrome DevTools Performance tab
   - Record 30 seconds of idle movement
   - Record 30 seconds of attacking
   - Measure average frame time
3. Use WebGL profiler to check:
   - Draw calls per frame
   - GPU memory usage
   - Texture memory
4. Create performance report file: `docs/PERFORMANCE_KAI_DAY_2.md`

**Optimization Targets (if needed):**
- Draw calls: target < 100 (high), < 70 (mid), < 50 (low)
- Frame time: target < 16.7ms (60 FPS), < 17.5ms (57 FPS)
- Memory: target < 512MB (high), < 256MB (mid), < 128MB (low)

**If Performance Below Target:**
- Reduce limb animation complexity
- Disable shadow casting on non-critical meshes
- Implement LOD (level of detail) system
- Consider texture downsampling

#### Task 2: Integrate Kai Model Asset (If Available)
**Duration:** 1-2 hours (depends on asset availability)  
**Acceptance Criteria:**
- GLB model loads without errors
- All animation clips recognized
- Character visible and textured
- No console warnings

**Process:**
1. Check if `/public/models/kai_spider.glb` exists
   ```bash
   ls -lh /home/user/Legends-of-Kai-Jax-The-memory-Hero/apps/web/public/models/
   ```
2. If exists, test in KaiTestScene:
   - Model should appear instead of fallback
   - Animation clips should play
   - No "Failed to load" errors
3. If missing, create placeholder asset:
   - Download or source Kai model
   - Convert to GLTF/GLB format if needed
   - Place at `/public/models/kai_spider.glb`
   - Minimum requirements: 1 idle animation, < 2MB file size
4. Update `KaiCharacter.tsx` if path changes

**Fallback:** Placeholder procedural renderer (already in code) works fine if asset unavailable.

#### Task 3: Implement Wall Climbing Mechanics
**Duration:** 2-3 hours  
**Acceptance Criteria:**
- Raycasting detects nearby walls
- Animation switches to `wall_crawl` state
- Character can move vertically on walls
- Gravity disabled while on walls
- Fall-off edge detection working

**Process:**
1. Update `KaiController.tsx`:
   ```typescript
   // Add wall detection in useFrame
   const raycaster = new THREE.Raycaster(
     kai.position,
     // forward direction
     0,
     WALL_CLIMB_CONFIG.detectionDistance
   );
   const walls = raycaster.intersectObjects(scene.children, true);
   kai.isWallCrawling = walls.length > 0;
   ```

2. Create `WallClimbSystem.ts`:
   ```typescript
   interface WallClimbState {
     isOnWall: boolean;
     wallNormal: THREE.Vector3;
     wallFriction: number;
   }
   
   function updateWallPhysics(kai: KaiState, delta: number) {
     if (kai.isWallCrawling) {
       // Disable gravity
       // Apply wall movement
       // Detect fall-off
     }
   }
   ```

3. Test in scene with vertical surfaces (can use simple planes for now)

#### Task 4: Animation Clip Verification
**Duration:** 1 hour  
**Acceptance Criteria:**
- All 8-10 animation clips detected
- Clip names match expected naming
- Animation timing correct
- No skipped/missing frames

**Process:**
1. In browser console, log animation data:
   ```javascript
   // In KaiCharacter.tsx useEffect after useAnimations
   console.log('Available animations:', Object.keys(actions));
   Object.entries(actions).forEach(([name, action]) => {
     console.log(`${name}: ${action.getClip().duration}s`);
   });
   ```

2. Expected clips (prioritized):
   - `idle` or `idle_breathing` (loop)
   - `walk` or `walk_cycle` (loop)
   - `run` or `run_sprint` (loop)
   - `wall_crawl` (loop)
   - `attack_light` or `punch`
   - `attack_heavy` or `kick`
   - `dodge` or `evade`
   - `hit` or `damage` (no loop)

3. Compare durations to `ATTACK_TIMING` config
   - Adjust timing values if animations differ from expectations

#### Task 5: Create Cosmetic Variant
**Duration:** 1.5 hours  
**Acceptance Criteria:**
- Second material/color variant created
- Can switch between variants in code
- Both render correctly

**Process:**
1. Create variant system in `KaiCharacter.tsx`:
   ```typescript
   interface KaiCharacterProps {
     variant?: 'default' | 'alternate';
   }
   
   // Apply different material colors based on variant
   const colorVariant = variant === 'alternate' ? '#3a5c6b' : '#4a7c59';
   ```

2. Test switching between variants
3. Prepare for cosmetics system (Days 5-7)

---

### 3D ARTIST TASKS (Support)

#### Task 1: Model Verification (If Asset Available)
**Duration:** 30 minutes  
**Acceptance Criteria:**
- GLB model loads without errors
- All animations present (8-10 minimum)
- Skeletal rig verified (4 limbs + body + head)
- File size < 2MB
- Quality acceptable

**Process:**
1. Export Kai model to GLTF/GLB if not already
2. Test in three.js editor: https://gltf.pmnd.rs/
3. Verify:
   - Model visible and textured
   - All bones present
   - Animations play without glitches
   - No degenerate triangles
4. If issues found, debug in Blender
5. Re-export when ready

#### Task 2: Animation Clip Validation
**Duration:** 30-45 minutes  
**Acceptance Criteria:**
- All clips present and named correctly
- Durations match timing config
- Looping states correct (walk/idle loop, attack/dodge don't)
- No frame skips or T-pose artifacts

**Process:**
1. Open Kai GLB in Blender
2. Verify animation tracks:
   ```
   idle: 2.0s (loop)
   walk: 1.5s (loop)
   run: 1.2s (loop)
   wall_crawl: 1.8s (loop)
   attack_light: 0.4s (no loop)
   attack_heavy: 0.6s (no loop)
   dodge: 0.5s (no loop)
   hit: 0.3s (no loop)
   ```
3. If timing different, update `ATTACK_TIMING` config
4. Export and re-upload if changes made

#### Task 3: Cosmetic Variant Creation (Optional)
**Duration:** 30-60 minutes  
**Acceptance Criteria:**
- Alternate color scheme created
- Same model, different material colors
- Can be toggled in game

**Process:**
1. Create color variant in Blender:
   - Copy Kai material
   - Change base color (e.g., blue instead of green)
   - Keep same roughness/metallic/normal maps
2. Export as separate variant or material override
3. Provide color values (hex codes) for code implementation

---

### GAME DESIGNER TASKS (Support)

#### Task 1: Kai Stats Finalization
**Duration:** 30 minutes  
**Acceptance Criteria:**
- All stats defined and documented
- Balanced relative to other fighters
- Progression plan outlined

**Stats Template:**
```
Kai (Memory Spider):
- Health: 120 (range: 50-200)
- Speed: 0.8x (range: 0.5-2.0)
- Strength: 1.1x (range: 0.5-2.0)
- Defense: 0.9x (range: 0.5-2.0)
- Special: Venom stacking (unique mechanic)

Justification:
- Health 120: Slightly tankier than Jax (110)
- Speed 0.8x: Slower but more methodical
- Strength 1.1x: Venom damage scaling
- Defense 0.9x: Fragile but mobile playstyle
```

**Output:** Update `docs/KAI_CHARACTER_SPEC.md` with stats

#### Task 2: Move Balancing Framework
**Duration:** 1 hour  
**Acceptance Criteria:**
- Move spreadsheet created
- Damage values assigned
- DPS calculations shown
- Balance targets documented

**Spreadsheet Template:**
```
Move           | Type    | Damage | Speed | Recovery | DPS  | Cost
Light Jab      | Combo   | 12     | 0.4s  | 0.2s     | 30   | 15E
Light Combo    | Combo   | 14     | 0.4s  | 0.2s     | 35   | 15E
Light Finisher | Combo   | 16     | 0.4s  | 0.2s     | 40   | 15E
Venomous Swipe | Heavy   | 35     | 0.6s  | 0.4s     | 58   | 30E
Web Binding    | Special | 50     | 0.6s  | 0.3s     | 83   | 50E
Memory Strike  | Ultimate| 100    | 1.0s  | 0.5s     | 100  | 80E
```

**Target:** DPS across moves should be similar (25-100 range) for balance

#### Task 3: Progression Path Outline
**Duration:** 30 minutes  
**Acceptance Criteria:**
- Unlock levels defined
- Move progression plan documented
- Special ability gates defined

**Progression Template:**
```
Level 1: Unlock Kai
- Available: Light attack, Walk, Run

Level 3: Combat Training
- Unlock: Heavy attack
- New move: Venomous Swipe

Level 5: Web Mastery
- Unlock: Web Binding special
- Energy cost: 50

Level 10: Memory Fusion
- Unlock: Memory Strike ultimate
- Requires: Kai-Jax form

Level 15: Ascension
- Unlock: 9-tail transformation
- Stat boost: +30% damage, +20% speed
```

---

## Success Checklist

### Engineer
- [ ] Performance metrics collected (FPS, draw calls, memory)
- [ ] Performance report created
- [ ] Kai model loaded (if asset available)
- [ ] Animation clips verified (8-10 expected)
- [ ] Wall climbing detection working
- [ ] Cosmetic variant system implemented
- [ ] No console errors in test scene

### 3D Artist
- [ ] GLB model verified (if available)
- [ ] Animation clips validated
- [ ] Durations match timing config
- [ ] Cosmetic variant created (optional)
- [ ] Model ready for production

### Game Designer
- [ ] Kai stats finalized and documented
- [ ] Move balancing framework created
- [ ] Progression path outlined
- [ ] DPS calculations verified

---

## Key Files to Reference

**Implementation:**
- `apps/web/src/components/game/characters/kai/KaiCharacter.tsx`
- `apps/web/src/components/game/characters/kai/KaiController.tsx`
- `apps/web/src/components/game/characters/kai/KaiAttackSystem.tsx`
- `apps/web/src/components/game/characters/kai/KaiTestScene.tsx`

**Configuration:**
- `apps/web/src/components/game/characters/kai/KaiController.tsx` (MOVEMENT_CONFIG, COMBAT_CONFIG)
- `apps/web/src/components/game/characters/kai/KaiAttackSystem.tsx` (ATTACK_TIMING, ATTACK_DAMAGE)

**Testing:**
- Test Scene: `http://localhost:3000/?mode=kai-test`

---

## Performance Targets (Goal)

| Hardware | FPS Target | Frame Time | Draw Calls | Memory |
|----------|-----------|-----------|-----------|---------|
| High-end (desktop) | 60 | < 16.7ms | < 100 | < 512MB |
| Mid-range (iPhone 12) | 57+ | < 17.5ms | < 70 | < 256MB |
| Low-end (iPhone SE) | 30 | < 33.3ms | < 50 | < 128MB |

**If targets not met:** Implement texture atlasing, reduce shadow quality, enable LOD system.

---

## Optional Enhancements (If Time Allows)

- [ ] Wall climbing visual feedback (glow/particle effects)
- [ ] Energy bar UI overlay
- [ ] Combo counter display
- [ ] Venom stack visualization
- [ ] Screen shake on heavy attacks
- [ ] Victory pose animation

---

## Handoff to Day 3

At end of Day 2:
- ✅ Kai performance profiled and documented
- ✅ Model asset integrated (if available)
- ✅ Animation system verified
- ✅ Wall climbing mechanics enabled
- ✅ Character ready for Jax parallel implementation
- ✅ Performance baseline established

**Next:** Start Day 3 with Jax storm sovereign implementation (parallel track)

---

**Target Completion:** End of Sept 2, 2026  
**Ready for Day 3:** YES  
**Blockers:** None identified

🎯 **Day 2 Goal: Get Kai to 60 FPS + Asset Ready**
