# Character Renderer Spec — Primary

**Canonical rule:** You are not building an engine. You are building a **character renderer that happens to contain a game.**

Kai and Jax are not "models." They are **walking VFX stacks with a silhouette.**

Engine choice matters in one way: **Can it render layered materials, emissives, shells, and post without turning into soup on mobile?**

---

## The Rule You're Designing Around

**Silhouette first. Detail second. Shaders third. Particles last.**

- If the silhouette reads, you win.
- If the silhouette breaks when you scale down, you lose no matter how pretty it is.

Everything below is built around **preserving silhouette at all distances.**

---

## Rendering Strategy (2D Sprites and 3D Meshes)

Characters are not "textures on geometry." They are **stacked render layers.**

| Layer | Purpose | Must survive LOD |
|-------|---------|------------------|
| Base mesh / sprite | Body shape, claws, tail mass | YES |
| Fur / quill shell | Volume and species identity | YES |
| Emissive veins / webs | Mythic energy identity | YES |
| Elemental tail material | Motion identity | YES |
| Aura / state glow | Power state readability | Optional |
| Particles | Flavor | Disposable |

**Rule:** If a layer can't survive being turned off on mobile, it is not part of identity.

---

## Materials (Described, Not Coded)

These are the only materials you need to define. No implementation here — behavior and intent only.

### 1. Fur / Quill Shell Material

- **Technique:** Shell or duplicated offset mesh.
- **Look:** Soft fresnel rim; slight vertex noise for life; dark core, lighter rim.
- **Data:** Color-driven. No textures required.
- **Purpose:** Creates volume without grooming. Works in 3D and can be baked into sprites.

### 2. Vein / Web Emissive Material

- **Technique:** Mask map that defines vein paths.
- **Look:** Emissive color driven by state (ice, venom, fire, shadow); pulsing via time sine; additive blend, never opaque.
- **Purpose:** The myth layer. Must be visible at 50 meters.

### 3. Claw / Teeth / Eye Spec Material

- **Look:** High contrast, sharp specular; slight glow on eyes; hard highlight so the face reads instantly.
- **Purpose:** Makes the head readable when scaled down.

### 4. Elemental Tail Material

- **Technique:** Panner noise; gradient emissive; edge fresnel; slow motion flow.
- **Purpose:** The tail is a flag. It tells you who the character is before the body does.

### 5. Aura State (Optional at Distance)

- **Technique:** Screen-space fresnel; soft halo.
- **LOD:** Disabled on mobile / at mid distance.

---

## LOD Philosophy

Most games reduce polycount. **You reduce layers.**

| Distance | What turns off |
|----------|----------------|
| Close | Everything on |
| Mid | Aura off |
| Far | Fur shell off; keep emissive veins + tail |
| Very far | Only base mesh + emissive mask |

Silhouette and emissive identity remain. That's why the character still looks like Kai/Jax at 200px tall.

---

## 2D Sprite Workflow

- Render the 3D character once with all layers → bake sprite sheets.
- Keep: silhouette, veins, tail energy, eyes, claws.
- Nothing important is lost.

---

## 3D Skeletal Workflow

- Same materials, same philosophy, real-time.
- No redesign later when switching between sprite and 3D.

---

## Why This Beats "Realistic Fur"

Realistic fur:

- Dies on mobile
- Destroys silhouette
- Eats performance
- Looks muddy at distance

**Shell + rim + emissive veins** gives you **readability**, not realism. And readability is what matches concept art.

---

## Camera Distance Recognition Rule

If you squint and can still tell:

- Which one is Kai
- Which one is Jax
- What element they are in
- What state they are in

You succeeded.

If you need details to recognize them, you failed.

---

## Engine Requirement Summary

The engine must support:

- Custom shader materials
- Emissive maps
- Layered meshes or shell technique
- Additive blending
- Post-process bloom
- Easy LOD toggling by **material/layer**, not mesh

Three.js + custom materials does this. UE5 later does this even better. Nothing is wasted.

---

## Takeaway

You are not building characters. You are building **stacked visual identities** that survive:

- Distance
- LOD
- Mobile scaling
- Sprite baking
- Engine changes

That's why they will look exactly like the concept art instead of "a game version of it."

---

*Primary stack: Three.js + Rapier. This spec applies to the current renderer and any future engine (e.g. Unreal) under specs/unreal.*

---

## Implementation (Primary)

- **AnatomicalBeastModel** accepts optional `lodLevel?: CharacterLODLevel` (0=close, 1=mid, 2=far, 3=very far). Layers are gated: aura only when `lodLevel === 0`; fur shell and vein layer when `lodLevel < 3`; base always on.
- **getCharacterLODLevel(cameraPosition, characterPosition)** in `apps/web/src/lib/characterLOD.ts` returns 0–3 from distance thresholds (close &lt; 12, mid &lt; 28, far &lt; 50). Pass `lodLevel` from the scene (e.g. in BattlePlayer/Opponent or wherever the model is rendered) so LOD follows camera distance.
- **Fur shell:** Existing rim shell (chest/hip scale 1.03 + rimGlowMat) and neck mane are gated by `showFurShellLayer` (off at very far).
- **Vein layer:** Aura ribbons (emissive, additive, design webbingColor) are gated by `showVeinLayer` (off at very far).
- **Claw/eye spec:** Claws use higher specular (roughness 0.2, metalness 0.6) and slight emissive so they read at distance.
- **Aura layer:** Wings and ribbons only when `showAuraLayer` (lodLevel === 0).
