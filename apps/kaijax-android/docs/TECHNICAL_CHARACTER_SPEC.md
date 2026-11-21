# OPERATION KAI-JAX — PROJECT BEAST GODS
## Technical Character Specification (Blender 4.2 LTS → glTF 2.0 / Three.js / Android WebGL2)

### 1. Coordinate, Scale & Transform Standards
- **Format**: Binary glTF 2.0 (`.glb`) exported from headless **Blender 4.2.3 LTS** (`export_yup=True`).
- **World Orientation**: Three.js standard `Y`-up, `+Z` forward (character faces `+Z` in local space so `root.rotation.y = yaw` aligns directly with `Math.atan2(vx, vz)` in `GameEngine.ts`).
- **Pivot & Grounding**: Armature & mesh origin at `(0, 0, 0)` directly between planted feet (`minY = 0.00m ± 0.01m`). Zero unapplied object scale (`scale = [1, 1, 1]`) or non-zero object translation.
- **Canonical Standing Heights (Top of Cranium / Ears)**:
  - `kai`: `1.82m` (agile runner/acrobat build)
  - `jax`: `1.88m` (broad-shouldered storm brawler build)
  - `kaijax`: `2.04m` (apex fused sovereign build)
  - `boryn`: `2.12m` (heavy muscular Smilodon mentor)
  - `borax`: `2.20m` (towering armored sabertooth lion)

---

### 2. Topology & Mobile LOD Budgets
Every character is modeled from continuous, organic, subdivision-smoothed anatomical surfaces (welded torso-neck-head-muzzle, sculpted muscular limbs, clawed digits, layered armor/garments, tapered fangs, fur/mane tufts — **zero disconnected primitive spheres/boxes/cones**):

| Tier | Target Triangle Budget | Max Draw Calls / Materials | Texture Resolution | Runtime Selection Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Master (`*_master.glb` / LOD0)** | `8,500 – 24,000` tris | `1 – 2` skinned PBR materials | `1024 × 1024` PNG/WebP | `graphicsQuality === 'high'` or `'balanced'` on hardware GPU |
| **Mobile (`*_lod1.glb` / LOD1)** | `3,500 – 9,500` tris | `1 – 2` skinned PBR materials | `512 × 512` PNG/WebP | `graphicsQuality === 'low'`, distant companions/NPCs, or `isSoftwareGl` |

---

### 3. Unified Armature & Bone Hierarchy Specification
All characters share a deterministic core humanoid-beast skeleton (`<= 68` deforming bones, max `4` bone weights per vertex, normalized) plus character-specific supernatural chains and attachment sockets:

#### Core Deforming Skeleton (All 5 Approved Characters)
- `root` (`0,0,0`)
  - `pelvis` (`0, 0.94h, 0`)
    - `spine_01` → `spine_02` → `spine_03` (chest)
      - `neck` → `head`
        - `jaw` (hinged lower jaw & chin fur for snarls, roars, dialogue)
        - `ear_L`, `ear_R` (independent secondary ear twitch/pin-back)
        - `eye_L`, `eye_R`
        - `socket_head`
      - `clavicle_L` → `upperarm_L` → `forearm_L` → `hand_L` → `claw_L` + `socket_weapon_L` + `socket_hitbox_L`
      - `clavicle_R` → `upperarm_R` → `forearm_R` → `hand_R` → `claw_R` + `socket_weapon_R` + `socket_hitbox_R`
      - `socket_relic` (chest/sternum attachment)
    - `thigh_L` → `shin_L` → `foot_L` → `toe_L`
    - `thigh_R` → `shin_R` → `foot_R` → `toe_R`

#### Supernatural & Species Appendage Chains
- **Kai & Kai-Jax — 4 Independent Dorsal Spider Limbs (12 bones)**:
  - `spider_UL_01` → `spider_UL_02` → `spider_UL_03`
  - `spider_UR_01` → `spider_UR_02` → `spider_UR_03`
  - `spider_LL_01` → `spider_LL_02` → `spider_LL_03`
  - `spider_LR_01` → `spider_LR_02` → `spider_LR_03`
- **Jax & Kai-Jax — 7 Articulated Storm-Mane Spikes (7 bones)**:
  - `mane_01` through `mane_07` parented to `head`/`neck` for controlled storm surge & secondary inertia.
- **Kai-Jax — Strictly 3 Primary Physical Tails (12 bones)**:
  - `tail_ember_01` → `tail_ember_02` → `tail_ember_03` → `tail_ember_04` (Left — Pyraxis Ember `#F97316`)
  - `tail_memory_01` → `tail_memory_02` → `tail_memory_03` → `tail_memory_04` (Center — Myrr'Kai Memory `#8B5CF6`)
  - `tail_storm_01` → `tail_storm_02` → `tail_storm_03` → `tail_storm_04` (Right — Kar-Voth Storm `#38BDF8`)
  - *(Unfused `kai` and `jax` export with `0` tail bones and `0` tail meshes).*
- **Boryn & Borax — Feline Tail Chain (4 bones)**:
  - `tail_01` → `tail_02` → `tail_03` → `tail_04`

#### Facial Morph Targets (Shape Keys on Head/Body Mesh)
Exported on every master GLB (`export_morph=True`):
1. `blink` — Upper/lower eyelid closure
2. `snarl` — Upper muzzle lip curl exposing sabertooth canines
3. `roar` — Wide jaw/cheek tension + brow furrow
4. `pain` — Wince/squint on `hit_reaction`
5. `focus` — Narrowed predatory Thryxen/Myrr'Kai gaze

---

### 4. UV Unwrapping & PBR Material Atlas Channels
Each character packs clean, non-overlapping UV islands partitioned by material zone (Fur Pelage, Muzzle/Inner Ear, Ivory Saber Fangs & Claws, Tactical Cloth/Leather, Brushed Metal Armor/Trim, Emissive Heritage Core/Markings) into embedded glTF 2.0 PBR textures:
- **`baseColorTexture` (`SRGBColorSpace`)**: Multi-zone hand-painted/procedural fur direction striations, striped/lupine markings, stitched jacket seams, weathered armor bevels, and ivory fang gradients.
- **`normalTexture` (Linear)**: Directional fur strand normal relief, woven ballistic fabric micro-weave, and hammered metal edge bevels.
- **`metallicRoughnessTexture` (Linear glTF `G=Roughness, B=Metallic`)**: Matte organic fur (`roughness 0.78, metallic 0.04`), satin leather (`roughness 0.52, metallic 0.12`), ivory fangs (`roughness 0.22, metallic 0.10`), and forged titanium/bronze armor (`roughness 0.28, metallic 0.82`).
- **`emissiveTexture` (`SRGBColorSpace`)**: Glowing eyes, heritage runes, spider-limb filament tips, storm-mane arcs, and tri-tail energy veins.

---

### 5. Mandatory Animation Clip Manifest (19 Embedded Clips per Playable Hero)
Every playable character GLB embeds the complete NLA clip library at 30 FPS:
1. `idle` (2.4s loop) — Grounded athletic combat-ready stance with weight shift & appendage sway
2. `breathing` (3.0s loop) — Subtle calm showcase/dialogue idle with chest expansion & ear/tail drift
3. `walk` (1.0s loop) — Crisp contralateral stride with pelvis roll & shoulder counter-swing
4. `run` (0.73s loop) — Forward-leaning urban combat run
5. `sprint` (0.53s loop) — Aggressive apex predator bound/sprint with swept appendages
6. `jump` (0.50s clamp) — Explosive crouch-to-launch upward drive
7. `fall` (0.80s loop) — Airborne stabilization with counter-balanced limbs/tails
8. `landing` (0.40s once) — Knee/hip impact absorption recovery
9. `dodge` (0.45s once) — Low-profile evasive dash roll/snap-step
10. `attack_1` (0.40s once) — Right claw/bracer slash + spider/mane snap
11. `attack_2` (0.42s once) — Left cross-body riposte slash
12. `attack_3` (0.50s once) — Dual-claw spin/lunge combo finisher
13. `heavy_strike` (0.65s once) — Windup overhead armor-breaker slam
14. `parry` (0.45s once) — Cross-guard deflection brace + counter-snap
15. `hit_reaction` (0.40s once) — Torso recoil & `pain` morph expression
16. `roar` (1.10s once) — Chest-open battle roar (`jaw` + `roar` morph + flared appendages)
17. `ability_cast` (0.70s once) — Heritage energy release (`Venom Strike` / `Storm Pressure` / `Pressure Domain`)
18. `victory` (1.60s loop/pose) — Heroic flourish settling into sovereign stance
19. `defeat` (1.10s clamp) — Staggered drop to one knee, head bowed
