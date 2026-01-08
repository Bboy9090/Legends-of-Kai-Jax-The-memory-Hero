# Jaxon Retopology Guide
## Clean Topology for Animation

**Character:** Jaxon - The Unstoppable Force 🦔  
**Estimated Time:** 4-8 hours  
**Target Polycount:** 35,000-45,000 tris (LOD0)

---

## 🚀 Phase 1: Setup (30 min)

### Step 1.1: Prepare High-Poly
1. **Duplicate Sculpt**
   - Select high-poly sculpt
   - Shift+D to duplicate
   - Hide original (H)
   - Name: "Jaxon_HighPoly"

2. **Create Base Mesh**
   - Add UV Sphere
   - Scale to match body
   - Name: "Jaxon_Retopo"

### Step 1.2: Enable Shrinkwrap
1. **Add Shrinkwrap Modifier**
   - Select retopo mesh
   - Modifier Properties → Add Modifier
   - Shrinkwrap
   - Target: Jaxon_HighPoly
   - Mode: Nearest Surface Point
   - Offset: 0.001

---

## 🔧 Phase 2: Body Topology (2-4 hours)

### Step 2.1: Build Base Topology

**Create Edge Loops:**
1. **Horizontal Loops (Body)**
   - Use Loop Cut (Ctrl+R)
   - Add loops around torso:
     - Chest loop
     - Waist loop
     - Hip loop
   - Follow muscle flow

2. **Vertical Loops (Body)**
   - Add loops from top to bottom:
     - Front center
     - Side loops
     - Back center
   - Maintain quads

### Step 2.2: Refine Body Shape

**Match High-Poly:**
1. **Use Proportional Editing (O)**
   - Enable Proportional Editing
   - Adjust vertices to match high-poly
   - Smooth transitions

2. **Extrude & Inset**
   - Use Inset (I) to create loops
   - Use Extrude (E) to build form
   - Follow high-poly shape

### Step 2.3: Joint Loops

**Add Extra Loops at Joints:**
1. **Shoulders**
   - 2-3 loops around shoulders
   - Smooth deformation ready

2. **Elbows**
   - 2 loops around elbows
   - Bend ready

3. **Hips**
   - 2-3 loops around hips
   - Leg movement ready

4. **Knees**
   - 2 loops around knees
   - Bend ready

---

## ⚡ Phase 3: Head Topology (1-2 hours)

### Step 3.1: Head Edge Loops

**Create Head Topology:**
1. **Face Loops**
   - Loop around eyes
   - Loop around mouth
   - Loop around nose
   - Maintain quads

2. **Head Loops**
   - Horizontal loops around head
   - Vertical loops from top to bottom
   - Clean topology

### Step 3.2: Refine Head

**Match High-Poly:**
1. **Use Shrinkwrap**
   - Adjust vertices
   - Match head shape
   - Smooth transitions

---

## 🦔 Phase 4: Quill Topology (1-2 hours)

### Step 4.1: Quill Base Topology

**Each of 7 Quills:**
1. **Create Quill Base**
   - Start with cylinder
   - Low polycount (8-12 sides)
   - Match quill position

2. **Refine Quill Shape**
   - Use Shrinkwrap
   - Match high-poly quill
   - Maintain clean topology

### Step 4.2: Quill Details

**Optimize Quills:**
1. **Reduce Polycount**
   - 8-12 sides per quill
   - Clean edge loops
   - Animation-ready

2. **Quill Tips**
   - Sharp tips
   - Clean topology
   - Ready for rigging

---

## 🎨 Phase 5: UV Unwrapping (2-4 hours)

### Step 5.1: Mark Seams

**Strategic Seam Placement:**
1. **Body Seams**
   - Under arms (armpits)
   - Inner legs
   - Back center
   - Head/body separation

2. **Quill Seams**
   - Around each quill base
   - Hide seams strategically

### Step 5.2: Unwrap

**Unwrap UVs:**
1. **Select All (A)**
2. **Unwrap (U → Unwrap)**
3. **Check for Stretching**
   - Look for distortion
   - Adjust as needed

### Step 5.3: Pack UVs

**Optimize UV Layout:**
1. **Select All Islands**
2. **Pack Islands (UV → Pack Islands)**
3. **Target: 80-90% usage**
4. **No overlapping**

---

## ✅ Phase 6: Quality Check (30 min)

### Step 6.1: Topology Verification

**Check Topology:**
- [ ] All quads (or clean tris)
- [ ] Edge loops follow muscle flow
- [ ] Joints have extra loops
- [ ] No n-gons
- [ ] Clean edge flow

### Step 6.2: Polycount Check

**Verify Polycount:**
- [ ] LOD0: 35,000-45,000 tris
- [ ] Optimized
- [ ] Ready for texturing

### Step 6.3: UV Check

**Verify UVs:**
- [ ] All faces unwrapped
- [ ] No stretching
- [ ] Efficient packing
- [ ] Ready for texturing

---

## 🎯 Key Topology Patterns

### Body Topology
```
Horizontal Loops:
- Chest
- Waist  
- Hips

Vertical Loops:
- Front center
- Sides
- Back center

Joint Loops:
- Shoulders (2-3)
- Elbows (2)
- Hips (2-3)
- Knees (2)
```

### Head Topology
```
Face Loops:
- Eye loops
- Mouth loop
- Nose loop

Head Loops:
- Horizontal (around head)
- Vertical (top to bottom)
```

### Quill Topology
```
Per Quill:
- 8-12 sides
- Clean edge loops
- Sharp tip
- Animation-ready
```

---

## 🚨 Common Issues

### Issue: Topology too dense
**Fix:** Reduce loops, optimize polycount

### Issue: Stretching in UVs
**Fix:** Adjust seams, re-unwrap

### Issue: N-gons present
**Fix:** Convert to quads/tris, clean up

### Issue: Joints don't deform well
**Fix:** Add more loops at joints

---

## ✅ Success Criteria

**Jaxon retopology is complete when:**
- ✅ Clean quad topology
- ✅ Edge loops follow muscle flow
- ✅ 7 quills have clean topology
- ✅ Polycount: 35,000-45,000 tris
- ✅ UVs unwrapped and packed
- ✅ Ready for texturing

---

**Ready?** Start retopology! 🦔

---

*"Clean topology is the foundation of great animation."* ⚡🦔
