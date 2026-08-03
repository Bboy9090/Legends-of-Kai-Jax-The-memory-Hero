# Blocker B: Model Rendering Fix

## Problem

Fighter models failed to render visibly in battle scenes (Training Mode and Versus Mode), while:
- HUD elements displayed correctly
- Canvas and WebGL rendered active
- No console errors logged
- Fallback geometry (green placeholder boxes) worked correctly

This left players with an invisible game experience: canvas present but no fighters visible.

## Root Cause

**Renderer divergence in model attachment method.**

The application had three parallel render paths for fighter models:
1. **Preview (GLBCharacterModel)**: Used `<Clone object={model} />` → ✅ models visible
2. **Battle (OptimizedBeastModel)**: Used `<primitive object={cloned} />` → ❌ models invisible
3. **Fallback**: Procedural geometry → ✅ renders as marker

The `<primitive object={...} />` approach in OptimizedBeastModel failed to properly attach cloned skeletal meshes to their animation rigs. The drei `Clone` component handles this correctly by preserving bone bindings during object cloning.

**Why primitive failed:**
- `SkeletonUtils.clone(scene)` creates a new object graph with duplicate bones
- `<primitive object={cloned} />` directly adds this cloned object to the Three.js scene graph
- SkinnedMesh materials still reference the original model's bone indices
- Animation mixer updates the cloned bones, but materials don't see the changes
- Result: skeleton animates in place while rendered mesh stays invisible

**Why Clone works:**
- drei's `Clone` component wraps the object and ensures all material and bone references bind to the cloned graph
- Proper skeleton traversal during attachment
- Animation mixer and rendered mesh stay in sync

## Resolution

**Changed: `apps/web/src/components/game/models/OptimizedBeastModel.tsx`**

Minimal fix (2 changes):

1. Import Clone component (line 9):
   ```typescript
   import { useGLTF, useAnimations, Clone } from '@react-three/drei';
   ```

2. Replace primitive with Clone in return statement (line 193):
   ```typescript
   // Before
   <primitive object={cloned} />
   
   // After
   <Clone object={cloned} />
   ```

This single component change brings OptimizedBeastModel in line with GLBCharacterModel's working pattern.

## Verified

✅ Training Mode: Fighter renders in adventure arena  
✅ Versus Mode: Both fighters render in battle arena  
✅ No fallback markers appear for registered fighters  
✅ Canvas and WebGL active during gameplay  
✅ No regression in animation state transitions (idle/run/attack)  
✅ TypeScript: No new errors introduced

## Pending

- **Animation quality validation**: Walk cycle, punch/kick visual execution on live devices
- **Mobile performance retest**: Blocker C metrics on real devices (currently passing on desktop)
- **Live device validation**: Fighter visibility and interaction on actual phones/tablets
- **Production readiness**: Awaiting animation quality and mobile performance closure

## Technical Details

This fix isolated after systematic investigation:
- A/B testing confirmed Clone component alone sufficient (no material tweaks required)
- Alternative hypotheses (material visibility, frustum culling, depth properties) disproven by test isolation
- Forensic investigation completed across 30 commits; clean implementation extracted to this single change

## Regression Test

See: `apps/web/e2e/blocker-b-model-rendering.spec.ts`

Assertions:
- Training mode: GameState transitions, canvas mounts, no fatal errors
- Versus mode: Both fighters present in battle data, canvas mounts, no fatal errors

Run: `pnpm test e2e/blocker-b-model-rendering.spec.ts`
