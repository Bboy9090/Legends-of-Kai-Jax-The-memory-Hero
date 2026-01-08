# Jaxon Export Guide
## GLB Export with LOD System

**Character:** Jaxon - The Unstoppable Force 🦔  
**Estimated Time:** 2-4 hours  
**Format:** GLB (GLTF 2.0)

---

## 🚀 Phase 1: Create LODs (1-2 hours)

### Step 1.1: LOD0 (High Detail)
- **Current Model:** Use as-is
- **Polycount:** 35,000-45,000 tris
- **Target:** < 50MB

### Step 1.2: LOD1 (Medium Detail)
1. **Duplicate Model**
   - Shift+D
   - Name: "Jaxon_LOD1"

2. **Apply Decimate**
   - Add Modifier → Decimate
   - Ratio: 0.5-0.6
   - Target: 18,000-25,000 tris

### Step 1.3: LOD2 (Low Detail)
1. **Duplicate LOD1**
   - Shift+D
   - Name: "Jaxon_LOD2"

2. **Apply More Decimation**
   - Decimate Ratio: 0.3-0.4
   - Target: 8,000-12,000 tris

---

## 📦 Phase 2: Export GLB (1-2 hours)

### Step 2.1: Export Settings

**In Blender:**
1. **File → Export → glTF 2.0 (.glb)**
2. **Settings:**
   - Format: GLB
   - Include: Selected Objects
   - Transform: +Y Up
   - Geometry: Apply Modifiers ✓
   - Compression: Draco ✓

3. **Export LOD0**
   - Select Jaxon_LOD0
   - Export → `JAXON_LOD0.glb`

4. **Export LOD1**
   - Select Jaxon_LOD1
   - Export → `JAXON_LOD1.glb`

5. **Export LOD2**
   - Select Jaxon_LOD2
   - Export → `JAXON_LOD2.glb`

### Step 2.2: Verify Export

**Check Files:**
- [ ] All LOD files created
- [ ] File sizes within targets
- [ ] GLB files load in Three.js
- [ ] Materials display correctly
- [ ] Animations play correctly

---

## ✅ Quality Check

**Export is complete when:**
- ✅ All LODs created
- ✅ File sizes < targets
- ✅ GLB files load correctly
- ✅ Materials display correctly
- ✅ Animations play correctly
- ✅ Ready for game integration

---

**Ready?** Start exporting! 📦

---

*"Export is the bridge to the game."* ⚡🦔
