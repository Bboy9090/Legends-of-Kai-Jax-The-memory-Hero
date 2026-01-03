# AI 3D Generation - Quick Reference Card

## 🎯 FASTEST WORKFLOW (30 Minutes to First Model)

### 1. Generate (5 mins)
- Go to https://www.meshy.ai
- Sign up (free tier: 200 credits/month)
- Click "Text to 3D"
- Paste prompt from [AI_3D_GENERATION_GUIDE.md](../docs/AI_3D_GENERATION_GUIDE.md)
- Click "Generate" → Wait 2-3 minutes

### 2. Download (1 min)
- Click "Download"
- Select **GLB** format (for Three.js)
- Also download **FBX** (for Blender editing)

### 3. Test in Browser (5 mins)
- Go to https://gltf-viewer.donmccurdy.com/
- Drag-and-drop GLB file
- Verify model looks correct
- Check poly count (should be 20k-50k)

### 4. Place in Project (1 min)
```bash
# Copy to project
cp KAI_JAX_AI.glb assets/models/characters/kai-jax/KAI_JAX_LOD1.glb
```

### 5. Load in Three.js (5 mins)
```typescript
import { loadCharacterModel } from '@game/utils/ModelLoader';

const kaiJax = await loadCharacterModel({ 
  id: 'kai-jax', 
  lod: 1 
});
scene.add(kaiJax);
```

---

## 📋 CHARACTER PROMPTS (Copy-Paste Ready)

### Kai-Jax (Simplest)
```
3D character model of a compact star-slime chimera, hedgehog-lupine fusion. 
Spherical body made of obsidian charcoal material with glowing purple and cyan 
nebula swirls visible inside translucent surface. Three distinct liquid tails 
flowing from back, each 1.5x body length. Jagged electric quills on head and 
spine, glowing blue tips. Large neon-gold eyes with slit pupils. Stubby arms 
and legs. Kirby-esque proportions, 3.5 feet tall. Fantasy sci-fi style, 
videogame character, T-pose. PBR materials, game-ready topology.
```

### Lunara Solis
```
3D character model of an elegant nine-tailed kitsune, celestial feline-avian 
hybrid. Slender anthropomorphic fox body, 5.8 feet tall, digitigrade legs. 
Liquid starlight fur that shifts between gold and silver iridescent colors. 
NINE flowing tails (5 gold solar, 4 silver lunar), each 2x body height. 
Wearing aurora borealis silk robes with flowing cloth. Holographic crown of 
stars floating above head. Dual-colored eyes (left gold, right silver). 
Regal elegant posture, ornate armor details. Fantasy oracle aesthetic, 
videogame character, T-pose. PBR materials, game-ready.
```

### Umbra-Flux
```
3D character model of a sleek celestial wolf, star-wolf lynx hybrid. 
Streamlined athletic canine body, 4.2 feet tall, horizontal stance. 
Matte-white metallic fur with rainbow iridescent quill-blades on back. 
FIVE ELEMENTAL TAILS in different colors: blue, red, cyan, violet, gold, 
each 1.8x body length with unique energy effects. Dual-pupil eyes with 
chromatic aberration effect. Crystalline razor-edged spines. Hard-light 
energy skates on feet with glow trails. Sleek aerodynamic design, sci-fi 
speedster aesthetic, videogame character, T-pose. PBR materials, game-ready.
```

### Boryx Zenith
```
3D character model of a massive dragon-bear hybrid, draconic ursine warrior. 
Huge heavyweight build, 7 feet tall, broad shoulders. Mix of brown bear fur 
and bronze metallic dragon scales (50/50 coverage on body). Scales on shoulders, 
forearms, chest. Glowing amber chaos star crystal embedded in chest. Heavy 
brown cape with bronze trim, royal insignia. Boxing stance with wrapped hands 
and brass knuckles. Horned helmet or crown. Muscular thick arms and tree-trunk 
legs. Powerful heavyweight boxer aesthetic, fantasy warrior king, videogame 
character, T-pose. PBR materials, game-ready.
```

### Sentinel Vox
```
3D character model of a buff anthropomorphic fox pilot, Saiyan-kitsune hybrid. 
Muscular athletic build, 5.5 feet tall. Orange fur with white chest, fluffy 
fox features. Wearing tactical blue leather flight jacket with Star-Force 
patches. Mechanical energy tail-blades (2-9 segmented metallic tails, blue 
glow). Orange-tinted pilot visor over eyes with HUD display. Glowing blue 
whisker scars on cheeks (6 per side). Tactical military pilot aesthetic, 
buff upper body, confident stance. Sci-fi space opera, videogame character, 
T-pose. PBR materials, game-ready.
```

### Kiro Kong
```
3D character model of a massive augmented gorilla warrior, ape-kin with 
cybernetic enhancements. Huge muscular build, 6.5 feet tall hunched (8 feet 
standing). Dark brown gorilla fur with weathered stone armor plates on 
shoulders, chest, forearms. Mechanical hydraulic pistons visible at arm joints, 
steam vents. Impact-dampening stone plates with cracks and moss growing. 
Amber glowing eyes. Barrel-chested with massive arms (4 units each, 9 foot 
arm span). Knuckle-walk stance or standing upright. Primal warrior with tech 
augmentation, fantasy sci-fi, videogame character, T-pose. PBR materials, 
game-ready.
```

---

## 🤖 RECOMMENDED AI TOOLS

| Tool | Free Tier | Speed | Quality | Best For |
|------|-----------|-------|---------|----------|
| **Meshy.ai** ⭐ | 200 credits/month | ⚡⚡⚡ Fast (2-3 min) | ⭐⭐⭐⭐ Good | Text prompts |
| **Rodin AI** | 10 generations/month | ⚡⚡ Medium (5-8 min) | ⭐⭐⭐⭐⭐ Excellent | Image-to-3D |
| **Luma AI** | Limited free | ⚡⚡⚡ Fast (1-2 min) | ⭐⭐⭐ Good | Quick prototypes |
| **CSM (Cube)** | No free tier | ⚡ Slow (10-15 min) | ⭐⭐⭐⭐⭐ Best | Rigged characters |

**Start with Meshy.ai** - Best balance of speed, quality, and free credits

---

## ✅ QUALITY CHECKLIST

After AI generation, verify:
- [ ] Model in T-pose (arms extended sideways)
- [ ] Poly count 20k-50k triangles
- [ ] All body parts present (tails, special features)
- [ ] Textures baked correctly (colors look right)
- [ ] No holes or gaps in geometry
- [ ] Scale approximately correct
- [ ] Forward-facing correct direction

---

## 🚀 NEXT STEPS AFTER GENERATION

1. **If model looks good (80%+ accurate):**
   - Download GLB → Place in `assets/models/characters/[character-id]/`
   - Test with ModelLoader.ts
   - Generate remaining 5 characters

2. **If model needs fixes (missing tails, wrong proportions):**
   - Download FBX → Import to Blender
   - Make adjustments in Edit Mode
   - Re-export as GLB
   - Follow full refinement workflow in [AI_3D_GENERATION_GUIDE.md](../docs/AI_3D_GENERATION_GUIDE.md)

3. **If model is unusable (<60% accurate):**
   - Try **Rodin AI** with image reference (draw sketch first)
   - Use more detailed prompt (paste "Advanced Prompt" version)
   - Adjust prompt based on what's wrong

---

## 🎯 PRIORITY ORDER

1. **Kai-Jax** ← START HERE (simplest)
2. **Umbra-Flux**
3. **Sentinel Vox**
4. **Lunara Solis**
5. **Boryx Zenith**
6. **Kiro Kong**

---

**Questions?** See [AI_3D_GENERATION_GUIDE.md](../docs/AI_3D_GENERATION_GUIDE.md) for detailed workflow

**THE SOURCE REMEMBERS UNITY. GENERATE. 🤖**
