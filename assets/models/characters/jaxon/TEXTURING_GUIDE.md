# Jaxon Texturing Guide
## PBR Workflow for Electric Blue Hero

**Character:** Jaxon - The Unstoppable Force 🦔  
**Estimated Time:** 8-16 hours  
**Texture Resolution:** 2048x2048 (main), 1024x1024 (emissive/AO)

---

## 🚀 Phase 1: Bake Maps (2-4 hours)

### Step 1.1: Setup Baking

1. **Prepare Scene**
   - High-poly: Visible, selected
   - Low-poly: Active, selected
   - Both in same scene

2. **Bake Normal Map**
   - Render Properties → Bake
   - Bake Type: Normal
   - Selected to Active: ✓
   - Resolution: 2048
   - Click "Bake"
   - Save: `JAXON_Normal.png`

3. **Bake AO Map**
   - Bake Type: Ambient Occlusion
   - Resolution: 1024
   - Samples: 128
   - Click "Bake"
   - Save: `JAXON_AO.png`

---

## 🎨 Phase 2: Create Albedo Map (2-4 hours)

### Step 2.1: Base Colors

**In Substance Painter or Blender:**

1. **Body Base Color**
   - Electric Blue: #0066FF
   - Add color variation (not flat)
   - Subtle highlights/shadows

2. **Quill Base Color**
   - Electric Blue: #3399FF (lighter)
   - Metallic appearance ready
   - Sharp, angular

3. **Eye Base Color**
   - Bright Green: #00FF00
   - Emissive ready

### Step 2.2: Save Albedo
- Resolution: 2048x2048
- Format: PNG
- Save: `JAXON_Albedo.png`

---

## ⚡ Phase 3: Create Metallic/Roughness Map (1-2 hours)

### Step 3.1: Metallic Values

**In Substance Painter or Blender:**

1. **Body**
   - Metallic: 0.0 (Black)
   - Roughness: 0.3 (Gray)

2. **Quills**
   - Metallic: 0.8 (White)
   - Roughness: 0.2 (Dark Gray)

3. **Eyes**
   - Metallic: 0.0 (Black)
   - Roughness: 0.1 (Very Dark Gray)

### Step 3.2: Save MR Map
- Resolution: 2048x2048
- Format: PNG
- Channels: R=Metallic, G=Roughness
- Save: `JAXON_MR.png`

---

## 🎨 Phase 4: Create Emissive Map (1-2 hours)

### Step 4.1: Emissive Areas

**In Substance Painter or Blender:**

1. **Quill Tips**
   - Cyan: #00D9FF
   - Intensity: White = full emission
   - Gradient from base to tip

2. **Eyes**
   - Bright Green: #00FF00
   - Intensity: White = full emission
   - Full coverage

### Step 4.2: Save Emissive
- Resolution: 1024x1024
- Format: PNG
- Save: `JAXON_Emissive.png`

---

## ✨ Phase 5: Apply Materials (1-2 hours)

### Step 5.1: Setup PBR Materials

**In Blender:**

1. **Load Textures**
   - Albedo → Base Color
   - Normal → Normal Map
   - MR → Metallic/Roughness
   - Emissive → Emission
   - AO → Multiply with Base Color

2. **Apply Bronx Grit**
   - Add asphalt overlay
   - Opacity: 0.08
   - Multiply blend

3. **Test in Viewport**
   - Material Preview mode
   - Check all angles
   - Verify colors

---

## ✅ Quality Check

- [ ] All texture maps created
- [ ] Colors match REFERENCE.md
- [ ] PBR workflow correct
- [ ] Bronx Grit overlay applied
- [ ] Materials look good
- [ ] Ready for rigging

---

**Ready?** Start texturing! 🎨

---

*"Textures bring characters to life."* ⚡🦔
