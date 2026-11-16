# OPERATION KAI-JAX — PHASE 7 EXPANSION SPECIFICATION: NEON WARD

**District Order:** 3 of 8 (`Act II — Age of Law`)  
**Wave Priority:** Wave 2 — Mid-Campaign Industrial & Market Production  
**Status:** Specification & Production Blueprint Ready (**Zero runtime/Ashblock changes in P1-P**)  
**Canon Authority:** `/docs/CANON_BIBLE.md`, `/src/game/data/canonData.ts`, `/src/game/data/districtSpecifications.ts`

---

## 1. Visual Library Authority & Mandatory Composite Disclosure

- **Visual Authority Mode:** `composite_sheets_inferred`
- **Transparency Rule Enforced:** There is **NO standalone Visual Library sheet** titled `"Neon Ward"` in `public/assets/aistudio/`. In compliance with the P1-K/P1-P anti-fabrication rule, Neon Ward's architectural proportions and lighting grammar are synthesized exclusively from:
  1. `public/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_25_PM__1__f9d37a6e.png` — *THE RAGING CITY*: Mid-city vertical commercial storefronts, illuminated Beast-Kin awnings, and elevated monorail transit silhouettes.
  2. `public/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_28_PM__9__e5b27b30.png` — *FANG SYNDICATE STRONGHOLD*: Magenta/violet/cyan neon graphic signboards and rain-mirrored dark basalt floor specular contrast.
- **Boundary Rule:** Do not mislabel these derived plates as a dedicated Neon Ward sheet until official Neon Ward key art is supplied.

---

## 2. Canonical Role, Adversaries & Heritage Mechanics

- **Canonical Threat (`canonData.ts`):** `Neon Prince` (Neon Court) — holographic mirage duelist using afterimage decoys and elevated sniper coverage (`Illusion Billboards`, `High-Voltage Conduit Drops`), countered directly by Kai's `Memory Weave` pulse to dispel decoys.
- **Encounter Continuity (`districtSpecifications.ts`):** Mirage Glass Concourse (`34 m x 30 m`) vertical ambush arena -> Broadcast Atrium Roof (`36 m x 36 m`) boss showdown (`Neon Prince` / `Sable-Mirage` lieutenant).
- **Primary Heritage Focus:** `Pyraxis` & Urban Deception — rapid `Web-Zip` transfers between cantilevered sign cages (`+8m..+16m`) and penthouse broadcast trusses (`+24m`).

---

## 3. Spatial Tiers & Traversal Architecture

| Tier / Zone | Elevation (`Y`) | Role & Traversal Rhythm |
|---|---|---|
| **Mirage Boulevard Plaza** | `0.0 m` | Wet basalt specular plaza (`envMapIntensity <= 0.16` to avoid mobile shader blowout), glazed shopfronts, fountain landmark |
| **Cantilevered Sign-Cage Tier** | `+8.0 m` to `+16.0 m` | Neon box frames + glass skywalks serving as mid-air `Web Anchor` zip/swing chains |
| **Penthouse Broadcast Deck** | `+24.0 m` | Open rooftop broadcast atrium framed by antenna trusses for `Neon Prince` decoy arena |

---

## 4. Proposed Modular GLB Kit (Shared Atlas & Instancing)

Target `public/models/environments/neonward/` (`8–10` modular GLBs, strict shared shader/atlas budget):
1. `neonward_commercial_tower_base.glb` (dark anodized mullions + ceramic shopfront base)
2. `neonward_neon_sign_cage.glb` (projecting structural frame + emissive signboard slot + web-zip davit)
3. `neonward_glass_skywalk.glb` (walkable elevated truss bridge with walkable rooftop bounds)
4. `neonward_monorail_viaduct.glb` (matching `f9d37a6e.png` elevated rail spine)
5. `neonward_broadcast_antenna_rig.glb` (`+24m` boss roof perimeter anchor & decoy breaker props)
6. `neonward_overloaded_signboard.glb` (interactive environmental takedown hazard prop)
7. `neonward_concourse_fountain.glb` (central street orientation landmark)
8. `neonward_holo_kiosk.glb` (street-level stealth cover & Mirage Court lore prop)

---

## 5. Mobile Performance Budget & Shader Constraints

- **Max Scene Triangles:** `<= 48,000`
- **Max Draw Calls:** `<= 95` (crucial: pack neon tubes into `1` shared emissive atlas + additive emissive material instance rather than per-sign dynamic point lights, preventing mobile WebGL shader spikes)
- **Max Texture Atlas Budget:** `<= 26 MB`
- **Frame Rate Targets:** `30 FPS` min-spec mobile floor / `60 FPS` balanced target
- **Strict Constraints:** Preserve all Ashblock Heights traversal metrics untouched; enforce strictly `3` physical tails (`12` tail bones) when `Kai-Jax` fuses inside Neon Ward; keep Bovar excluded until solo visual approval.
