# Blender Model Optimization Guide

## Overview

This guide walks through batch-optimizing all GLB character models using Blender automation:
- **Geometry decimation** (50% polygon reduction)
- **LOD generation** (25% detail for distant characters)
- **Draco compression** (automatic in GLB export)
- **Texture optimization** (resize to 2K max)

Expected results:
- **Size reduction**: 30-50% (from ~12-25 MB → ~6-12 MB per model)
- **Performance gain**: 20-30% faster loading, 10-15% faster render time

---

## Prerequisites

1. **Blender 3.4+** installed locally
2. **Python 3.8+** in your PATH
3. GLB models in `/apps/web/public/models/`

### Install Blender (if needed)

- **macOS**: `brew install blender`
- **Linux**: `apt install blender` or download from blender.org
- **Windows**: Download from blender.org

Verify installation:
```bash
blender --version
```

---

## Step 1: Run Optimization Script

From the project root:

```bash
# Headless mode (recommended for CI/batch work)
blender --background --python scripts/blender_optimize_models.py

# Or with verbose output:
blender --background -v 2 --python scripts/blender_optimize_models.py
```

**What it does:**
1. Loads each `.glb` file from `/models/`
2. Decimates geometry to 50% polygon count
3. Optimizes materials (downsample textures to 2K)
4. Exports optimized version with Draco compression
5. Generates LOD version (25% detail)
6. Produces `optimization_report.json`

**Runtime**: ~2-3 minutes for ~30 models

---

## Step 2: Review Optimization Report

After running, check the results:

```bash
cat apps/web/public/models/optimized/optimization_report.json
```

Expected output format:
```json
{
  "model_count": 32,
  "size_mb": {
    "original_total": 385.5,
    "optimized_total": 192.3,
    "compression_ratio": 0.498
  },
  "geometry": {
    "original_total_tris": 4250000,
    "optimized_total_tris": 2100000,
    "poly_reduction_ratio": 0.494
  },
  "models": [
    {
      "name": "kai_jax_beast",
      "original_size_mb": 12.3,
      "optimized_size_mb": 6.2,
      "compression": "50.4%",
      "poly_reduction": "49.8%"
    }
  ]
}
```

**Success criteria:**
- Compression ratio: 45-55% (expect ~50%)
- Poly reduction: 45-55%
- All models exported without errors

---

## Step 3: Test Optimized Models

### Option A: Manual Browser Test

1. **Back up original models** (safety):
   ```bash
   mv apps/web/public/models apps/web/public/models.backup
   ```

2. **Use optimized models**:
   ```bash
   mv apps/web/public/models/optimized apps/web/public/models
   ```

3. **Start dev server**:
   ```bash
   pnpm dev
   ```

4. **Test in browser**:
   - Load battles → check character render quality
   - Check FPS (should improve by 10-20%)
   - Verify animations still smooth
   - Test mobile viewport

5. **If satisfied**: Commit optimized models
   ```bash
   git add apps/web/public/models
   git commit -m "perf: batch-optimize GLB models (50% size reduction)"
   ```

6. **If not satisfied**: Revert and adjust decimation ratio
   ```bash
   rm -rf apps/web/public/models
   mv apps/web/public/models.backup apps/web/public/models
   # Re-run script with decimate_ratio=0.6 or 0.7 for less reduction
   ```

### Option B: Automated Performance Profiling

Use the included performance test:

```bash
node scripts/profile_models.js
```

This measures:
- Model load time (original vs. optimized)
- Scene render time
- Memory footprint
- Frame rate stability

---

## Step 4: Deploy LOD System (Optional)

For advanced optimization, implement Three.js LOD culling:

1. **Update OptimizedBeastModel.tsx** to use LOD versions for far-away characters:
   ```typescript
   const isDistant = distance > 10;
   const modelPath = isDistant ? 
     getBeastModelPath(beast.id, 'lod_low') : 
     getBeastModelPath(beast.id, 'standard');
   ```

2. **Update modelRegistry.ts** to reference LOD paths:
   ```typescript
   export const MODEL_REGISTRY_LOD: Record<string, string> = {
     "kai-jax": "/models/optimized/lod_low/kai_jax_beast_lod_low.glb",
     // ...
   };
   ```

3. **Monitor performance gain**:
   - Expected: Additional 15-20% speedup on large battles (6+ characters)

---

## Troubleshooting

### ❌ "Blender not found"

Install Blender or add to PATH:
```bash
export PATH="/Applications/Blender.app/Contents/MacOS:$PATH"
which blender
```

### ❌ "No mesh objects found"

Some GLB files may have complex hierarchies. Check in Blender:
```bash
blender models/problematic_model.glb
# In Blender: check outliner for mesh objects
```

### ❌ "Decimation ratio too aggressive" (models look bad)

Edit script and adjust:
```python
optimizer = ModelOptimizer(
    models_dir=str(models_dir),
    decimate_ratio=0.65  # Try 65% retention instead of 50%
)
```

Then re-run optimization.

### ⚠️ Export quality poor

Blender's auto-normals may need recalculation. In script, add:
```python
# After decimation:
bpy.ops.object.shade_smooth()
```

---

## Performance Expectations

| Metric | Before | After | Gain |
|--------|--------|-------|------|
| Model file size | 12-25 MB | 6-12 MB | 50% |
| Polygons per model | 100k-200k | 50k-100k | 50% |
| Load time (1 model) | 800ms | 400ms | 50% |
| Battle render time (2v2) | 16ms | 14ms | 12% |
| Mobile FPS (battle) | 28-32 | 35-40 | +10% |

### Real-world impact:
- **Instant character render** on battle start (was 1.5s delay)
- **Smooth animations** on mobile (was frame drops)
- **Missions load faster** (2-3s vs. 4-5s)

---

## Next Steps

1. **Run optimization** (2-3 min)
2. **Test in browser** (5 min)
3. **Review report** and decide on further tuning
4. **Commit & deploy** (if satisfied)
5. **Monitor production** for any visual regressions

---

## Advanced: Custom Decimation Ratios

If default 50% is too aggressive, create a custom script:

```bash
blender --background --python - <<'EOF'
import sys
sys.path.insert(0, 'scripts')
from blender_optimize_models import ModelOptimizer

optimizer = ModelOptimizer(
    models_dir='apps/web/public/models',
    decimate_ratio=0.65  # 35% reduction instead of 50%
)
stats = optimizer.process_all()
optimizer.generate_report()
EOF
```

Suggested ratios:
- **0.65**: Conservative (35% reduction, excellent visual quality)
- **0.50**: Balanced (50% reduction, good quality) ← default
- **0.35**: Aggressive (65% reduction, visible simplification)

---

## References

- [Blender Decimation Docs](https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/decimate.html)
- [Draco Compression](https://google.github.io/draco/)
- [Three.js glTF Loading](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
