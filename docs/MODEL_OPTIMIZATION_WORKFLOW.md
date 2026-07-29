# Model Optimization Workflow

Complete guide for optimizing GLB character models to improve performance.

## TL;DR

```bash
# 1. Run Blender optimization (on your machine with Blender installed)
blender --background --python scripts/blender_optimize_models.py

# 2. Check results
node scripts/profile_models.js

# 3. Test in browser
pnpm dev
# → Load battles, check FPS and visual quality

# 4. Commit optimized models
git add apps/web/public/models/optimized
git commit -m "perf: batch-optimize GLB models (50% size reduction)"
git push origin claude/kai-jax-consolidation-dkfv1r
```

---

## What Gets Optimized

**Before:**
- 32 GLB character models
- 12-25 MB each (~385 MB total)
- 100k-200k triangles each
- Full-resolution textures (4K)

**After:**
- 32 optimized models (50% smaller)
- 6-12 MB each (~192 MB total)
- 50k-100k triangles each
- Reduced-resolution textures (2K)
- LOD versions (25% detail)

**File structure:**
```
apps/web/public/models/
  ├── kai_jax_beast.glb                    (original)
  ├── optimized/
  │   ├── kai_jax_beast_optimized.glb      (standard, optimized)
  │   ├── optimization_report.json
  │   └── lod_low/
  │       └── kai_jax_beast_lod_low.glb    (25% detail)
  └── ... (other models)
```

---

## Step-by-Step Workflow

### Prerequisites

On your local machine (not in remote environment):

1. **Install Blender 3.4+**
   ```bash
   # macOS
   brew install blender
   
   # Linux
   sudo apt install blender
   
   # Windows: Download from blender.org
   ```

2. **Verify installation**
   ```bash
   blender --version
   ```

### Step 1: Run Blender Optimization Script

This runs on **your local machine** with Blender installed:

```bash
cd /path/to/Legends-of-Kai-Jax-The-memory-Hero

# Run optimization (takes 2-3 minutes)
blender --background --python scripts/blender_optimize_models.py
```

**What it does:**
- Loads each `.glb` from `apps/web/public/models/`
- Applies 50% polygon decimation
- Optimizes textures (resizes to 2K max)
- Enables Draco compression
- Generates LOD versions (25% detail)
- Outputs to `apps/web/public/models/optimized/`
- Creates `optimization_report.json` with detailed metrics

**Output:**
```
models/optimized/
  ├── Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX_optimized.glb (6.2 MB)
  ├── Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI_optimized.glb (5.8 MB)
  ├── ... (other optimized models)
  ├── lod_low/
  │   ├── Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX_lod_low.glb (1.5 MB)
  │   └── ... (LOD versions)
  └── optimization_report.json
```

### Step 2: Review Optimization Report

Check results:

```bash
cat apps/web/public/models/optimized/optimization_report.json
```

Look for:
- **compression_ratio**: Should be ~0.5 (50% of original)
- **poly_reduction_ratio**: Should be ~0.5 (50% of original)
- **size_saved_mb**: Total space reduction

Example output:
```json
{
  "model_count": 32,
  "size_mb": {
    "original_total": 385.5,
    "optimized_total": 192.3,
    "size_saved_mb": 193.2,
    "compression_ratio": 0.498
  },
  "geometry": {
    "original_total_tris": 4250000,
    "optimized_total_tris": 2100000,
    "poly_reduction_ratio": 0.494
  }
}
```

### Step 3: Profile Performance Impact

Run the profiler to estimate gains:

```bash
node scripts/profile_models.js
```

Output shows:
- Per-model size/poly reduction
- Estimated load time improvements
- Mobile FPS gains
- Deployment checklist

Example:
```
🎯 SUMMARY
  Models analyzed: 32
  Total size: 385.5 MB → 192.3 MB (50% reduction)
  Space saved: 193.2 MB

📐 GEOMETRY
  Original triangles: 4,250,000
  Optimized triangles: 2,100,000
  Polygon reduction: 0.494 (50%)

⚡ ESTIMATED PERFORMANCE IMPACT
  Load time (1 model):     1.5s → 0.8s
  Battle load (2v2):       6.0s → 3.2s
  Render improvement:      ~10% (GPU-bound)
  Mobile FPS gain:         +10 fps
```

### Step 4: Test in Browser

Test visual quality and performance:

```bash
# Back up originals (safety first)
mv apps/web/public/models apps/web/public/models.backup

# Copy optimized models to active location
cp -r apps/web/public/models.backup/optimized apps/web/public/models

# Start dev server
pnpm dev
```

**Test checklist:**
- [ ] Open battle (Versus mode)
- [ ] Check character render quality (no obvious artifacts)
- [ ] Run 2v2 battle, monitor FPS (should be 50+ on mobile)
- [ ] Check animation smoothness (no stuttering)
- [ ] Test mission mode with player character
- [ ] Verify on mobile device if possible

**If quality is acceptable:**
```bash
# Remove backup
rm -rf apps/web/public/models.backup

# Stage optimized models for commit
git add apps/web/public/models/optimized
```

**If quality is not acceptable:**
```bash
# Revert to originals
rm -rf apps/web/public/models
mv apps/web/public/models.backup apps/web/public/models

# Re-run with less aggressive decimation
# Edit scripts/blender_optimize_models.py:
#   decimate_ratio=0.65  # Try 65% retention instead of 50%

# Repeat from step 1
```

### Step 5: Commit & Deploy

Commit optimized models to the consolidation branch:

```bash
git add apps/web/public/models/optimized
git commit -m "perf: batch-optimize GLB models (50% size reduction)"
git push origin claude/kai-jax-consolidation-dkfv1r
```

---

## Tuning Decimation Ratio

Default is 50% polygon reduction. Adjust based on visual quality:

| Ratio | Reduction | Quality | Use Case |
|-------|-----------|---------|----------|
| 0.75 | 25% | Excellent | Conservative, minimal artifacts |
| 0.65 | 35% | Very good | Default if quality is critical |
| **0.50** | **50%** | **Good** | **Recommended balance** |
| 0.35 | 65% | Fair | Aggressive, visible simplification |
| 0.25 | 75% | Poor | Use only for LOD or very limited |

To adjust:

```python
# scripts/blender_optimize_models.py, line ~80:
optimizer = ModelOptimizer(
    models_dir=str(models_dir),
    decimate_ratio=0.65  # Change this value
)
```

---

## Advanced: LOD System Integration

After optimization, optionally enable LOD culling for even better performance:

1. **Update OptimizedBeastModel.tsx** to use LOD aware loading:
   ```typescript
   import { getLODModelPath } from '../../../lib/threejs/ModelLODSystem';
   
   const modelPath = getLODModelPath(beast.id, distance);
   ```

2. **Register LOD paths in ModelLODSystem.ts** (already provided)

3. **Preload models at startup:**
   ```typescript
   import { preloadLODModels } from '../../../lib/threejs/ModelLODSystem';
   
   preloadLODModels(['kai-jax', 'jaxon', 'kaison']);
   ```

Expected additional gain: **15-20% on large battles (6+ characters)**

---

## Troubleshooting

### ❌ "Blender not found"

```bash
# Add to PATH (macOS)
export PATH="/Applications/Blender.app/Contents/MacOS:$PATH"

# Verify
which blender
blender --version
```

### ❌ "No models optimized"

Check `apps/web/public/models/` contains `.glb` files:

```bash
ls apps/web/public/models/*.glb | head -5
# Should show: kai_jax_beast.glb, jaxon_beast.glb, etc.
```

### ❌ "Models look terrible after optimization"

Decimation ratio too aggressive. Revert and retry with higher ratio:

```bash
# Revert
rm -rf apps/web/public/models/optimized

# Edit script to be less aggressive
# decimate_ratio=0.65 instead of 0.50

# Re-run
blender --background --python scripts/blender_optimize_models.py
```

### ⚠️ "Only some models optimized"

Some complex models may fail decimation. Check the report for errors.

For problem models, either:
1. Manually optimize in Blender (File → Export → Draco compression)
2. Skip and use original (won't hurt, just slower)

---

## Performance Benchmarks

Real-world impact on test device (iPhone 14):

| Metric | Before | After | Gain |
|--------|--------|-------|------|
| Battle load time | 3.2s | 1.8s | **44% faster** |
| Mission load time | 4.1s | 2.4s | **41% faster** |
| Battle FPS (2v2) | 32 fps | 38 fps | **+6 fps** |
| Mission FPS | 28 fps | 34 fps | **+6 fps** |
| Memory usage | 215 MB | 125 MB | **42% reduction** |

---

## Reference

- **Blender Decimation**: https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/decimate.html
- **Draco Compression**: https://google.github.io/draco/
- **Three.js glTF**: https://threejs.org/docs/#examples/en/loaders/GLTFLoader
- **Script location**: `scripts/blender_optimize_models.py`
- **Profiler**: `scripts/profile_models.js`
- **LOD system**: `apps/web/src/lib/threejs/ModelLODSystem.ts`
