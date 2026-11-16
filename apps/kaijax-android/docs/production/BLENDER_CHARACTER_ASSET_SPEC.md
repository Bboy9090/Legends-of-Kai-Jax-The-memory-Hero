# Legends of Kai-Jax: The Memory Hero
## Blender 4.x Production Character Asset Specification (P1-G External Sculpt Hand-Off Contract)

**Document Version:** 1.0 (P1-G)  
**Target Engine:** Three.js `r183` (`GLTFLoader` + `SkeletonUtils.clone`) / Capacitor Android WebView  
**Authoritative Visual References:** `/public/assets/aistudio/` (`078f6bfc.png`, `3e003001.png`, `499cf6b7.png`, `16464786.png`)  
**Drop-In Runtime Paths:** `/public/models/characters/<id>_master.glb` and `/public/models/characters/<id>_lod1.glb`  

---

## 1. Purpose & Honest Pipeline Scope

The active P1-G build ships **mastered procedural rigged `.glb` gameplay assets** (`v3.0 P1-G`) for the five visually approved characters (`kai`, `jax`, `kaijax`, `boryn`, `borax`), eliminating the UV-seam, cornea-projection, bug-horn, leg-ring, and blocky-muzzle defects of P1-E.

However, **exact 1:1 organic likeness** to the hand-painted Visual Library concept sheets — specifically individual overlapping fur clumping, asymmetric cloth wrinkle micro-folds, sculpted snarl gum/tongue sub-meshes, and battle-scarred leather wear — cannot be achieved through analytical procedural lofting alone and requires high-poly sculpting in ZBrush / Blender 4.x followed by low-poly retopology and tangent-space normal baking.

Any external character artist can export sculpted `.glb` replacements directly into `/public/models/characters/` with **zero TypeScript or engine changes** by following the exact rig, socket, morph-target, UV, and export specifications below.

---

## 2. Coordinate Space, Scale & Grounding Invariants

| Parameter | Specification |
| :--- | :--- |
| **Up Axis / Forward Axis** | `+Y` Up, `+Z` Forward (Blender export converts `-Y` Forward / `+Z` Up automatically when `+Y Up` is checked) |
| **Scene Unit Scale** | `1.0 unit = 1.0 meter` (`Unit Scale = 1.0`, `Apply Scalings = All Local`) |
| **Root Pivot** | World origin `(0, 0, 0)` strictly between the soles of the feet (`minY = 0.000 ± 0.015 m`) |
| **Unapplied Transforms** | All mesh and armature objects MUST have `Location = (0,0,0)`, `Rotation = (0,0,0)`, `Scale = (1,1,1)` (`Ctrl+A -> All Transforms`) |

### Canonical Standing Heights (`maxY`, including ears/crests)
- **`kai` (Younger Sabertooth — Web/Ember/Memory):** `1.82 m` (lean acrobatic build, 4 dorsal gold-jointed spider limbs, **0 tails**)
- **`jax` (Older Sabertooth — Storm Ronin):** `1.94 m` (broader shoulders, 7 swept cobalt-cyan storm-mane locks, **0 tails**)
- **`kaijax` (Convergence Memory Hero):** `2.08 m` (fused dual haori/jacket, 4 spider limbs + 7 storm-mane locks, **STRICTLY 3 primary physical tails**: `tail_ember`, `tail_storm`, `tail_memory`)
- **`boryn` (Adoptive Tiger-Warrior Father):** `2.10 m` (heavy amber-striped warrior build, furred mantle, **1 physical tail**)
- **`borax` (Adoptive Elder Mentor):** `2.16 m` (commanding heavy scarred build, plated greatcoat, **1 physical tail**)
- **`bovar`:** **DO NOT EXPORT** until an official solo Visual Library sheet for Bovar is approved (`visualAuthorityStatus = 'awaiting_visual_approval'`).

---

## 3. Canonical Armature & Bone Naming Contract

Every exported `.glb` must contain a single Armature with root bone `root` at `(0, 0, 0)` and the following exact bone names (verified automatically by `scripts/validate-character-glbs.mjs` and `scripts/certify-character-glbs.mjs`):

### Core Humanoid Sabertooth Spine & Limbs (Required on All 5 Characters)
```text
root (0.00, 0.00, 0.00)
└── pelvis (0.00, 0.96*H, 0.00)
    ├── spine_01 (0.00, 1.08*H, 0.00)
    │   └── spine_02 (0.00, 1.24*H, 0.00)
    │       └── chest (0.00, 1.40*H, 0.01)
    │           ├── neck (0.00, 1.56*H, 0.02)
    │           │   └── head (0.00, 1.66*H, 0.03)
    │           │       ├── jaw (0.00, 1.61*H, 0.11)
    │           │       ├── ear_L (+0.11, 1.80*H, 0.00)
    │           │       ├── ear_R (-0.11, 1.80*H, 0.00)
    │           │       └── socket_head
    │           ├── clavicle_L -> upperarm_L -> forearm_L -> hand_L -> socket_weapon_L, socket_hitbox_L
    │           ├── clavicle_R -> upperarm_R -> forearm_R -> hand_R -> socket_weapon_R, socket_hitbox_R
    │           ├── socket_relic (0.00, 1.38*H, -0.14)
    │           ├── [Kai & Kai-Jax ONLY] spider_limb_UL_01..03, spider_limb_UR_01..03, spider_limb_LL_01..03, spider_limb_LR_01..03
    │           └── [Jax & Kai-Jax ONLY] mane_crest_01..07 (parented to head)
    ├── thigh_L -> shin_L -> ankle_L -> toe_L
    ├── thigh_R -> shin_R -> ankle_R -> toe_R
    ├── [Boryn & Borax ONLY] tail_01 -> tail_02 -> tail_03 -> tail_04
    └── [Kai-Jax STRICTLY]
        ├── tail_ember_01 -> tail_ember_02 -> tail_ember_03 -> tail_ember_04
        ├── tail_storm_01 -> tail_storm_02 -> tail_storm_03 -> tail_storm_04
        └── tail_memory_01 -> tail_memory_02 -> tail_memory_03 -> tail_memory_04
```

### Skinning & Joint Deformation Rules
- Max **4 bone influences per vertex** (`JOINTS_0` + `WEIGHTS_0`, normalized sum `= 1.000`).
- Minimum **3 parallel edge loops** around `upperarm/forearm` elbows, `thigh/shin` knees, `clavicle/upperarm` deltoids, and `jaw` hinge to prevent volume collapse during wide martial-arts strikes and aerial splits.
- Sabertooth upper canines (`fang_L`, `fang_R`) must weight `1.0` to `head` (never `jaw`) so fangs remain anchored in the maxilla when `jaw` opens during `roar` and `snarl`.

---

## 4. Required Facial Shape Keys (Morph Targets)

The primary character `SkinnedMesh` must export **5 exact Shape Keys** (Basis + 5 targets):

1. `blink` — Upper eyelids sweep down cleanly over the corneas without eyeball poke-through.
2. `snarl` — Upper feline muzzle/whisker pads lift (`+Y`), nose bridge wrinkles, exposing full sabertooth fangs, and brows furrow.
3. `roar` — Lower mandible (`jaw` region) drops wide (`-Y`, `-Z`), lips flare outward, ears pin slightly back.
4. `pain` — Asymmetric wince, inner brows pinch upward, partial lid squint.
5. `focus` — Subtle predator brow lock, slight jaw clench, alert ear pitch.

---

## 5. Required Animation Clips (19 NLA Tracks)

Export all 19 clips as NLA Tracks (or Actions) with exact lowercase snake_case names:

| Category | Required Clip Names | Loop Mode in Engine |
| :--- | :--- | :--- |
| **Idle & Showcase** | `idle`, `breathing`, `victory`, `defeat` | `idle`, `breathing`, `victory` loop; `defeat` clamps |
| **Locomotion & Air** | `walk`, `run`, `sprint`, `jump`, `fall`, `landing` | `walk`, `run`, `sprint`, `fall` loop; `jump`, `landing` clamp |
| **Free-Flow Combat** | `attack_1`, `attack_2`, `attack_3`, `heavy_strike`, `ability_cast` | `LoopOnce` (`clampWhenFinished`) |
| **Defense & Expression** | `dodge`, `parry`, `hit_reaction`, `roar` | `LoopOnce` (`clampWhenFinished`) |

**Stride Calibration (Anti-Foot-Slide):**
- `walk` reference planar speed: `2.45 m/s`
- `run` reference planar speed: `6.95 m/s`
- `sprint` reference planar speed: `10.20 m/s`
- Export locomotion clips **in-place** (no root-motion Z translation on `root`), matching contact-to-pass stride length to the reference speeds above.

---

## 6. Geometry, UV & PBR Texture Budgets

| Tier | File Suffix | Triangle Budget | Texture Resolution | Format & Maps |
| :--- | :--- | :--- | :--- | :--- |
| **Master (High/Balanced)** | `*_master.glb` | `9,000 – 24,000 tris` | `2048 × 2048` | BaseColor (sRGB), Normal (Linear), ORM — Occlusion(R)/Roughness(G)/Metalness(B) (Linear), Emissive (sRGB) |
| **Mobile LOD1 (Low)** | `*_lod1.glb` | `3,500 – 9,500 tris` | `1024 × 1024` | Same 4-map layout downsampled |

### UV Layout Rules
- **Single non-overlapping `[0, 1]` UV sheet** (or mirrored limbs with `+1.0 U` offset prior to bake, moved back into `[0, 1]` after normal baking with proper tangent-space handedness).
- **Never project dorsal/ventral body UVs with raw `atan2(x, z)`** — split bilateral seams cleanly along the inner underarm, inner leg, and under-collar line so dorsal fur coats and jackets have zero seam artifacts.
- Dedicate at least `256 × 256 px` texel density (at 2K) to the **face, muzzle, sabertooth fangs, and irises**.
- Name armor/trim materials containing `'trim'` or `'armor'` if they should accept optional player cosmetic tinting via `GLBCharacterInstance.applyCosmeticTrim()`, or keep unified character material named `<id>_master_pbr`.

---

## 7. Exact Blender 4.x Python Export Script

Run inside Blender 4.x Scripting workspace before running `npm run certify:glbs`:

```python
import bpy

def export_kaijax_character(filepath: str, is_lod1: bool = False):
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=False,
        export_yup=True,
        export_apply=False,            # Keep Shape Keys intact; apply transforms manually prior to export
        export_texcoords=True,
        export_normals=True,
        export_tangents=True,
        export_materials='EXPORT',
        export_image_format='WEBP' if is_lod1 else 'AUTO',
        export_skins=True,
        export_all_influences=False,   # Enforce 4-bone skinning limit for mobile WebGL2
        export_morph=True,
        export_morph_normal=True,
        export_animations=True,
        export_animation_mode='NLA_TRACKS',
        export_force_sampling=True,
        export_frame_step=2 if is_lod1 else 1,
        export_optimize_animation_size=True,
    )
```

After placing `<id>_master.glb` and `<id>_lod1.glb` in `/public/models/characters/`, execute:
```bash
node scripts/validate-character-glbs.mjs
node scripts/certify-character-glbs.mjs
npm test
```
