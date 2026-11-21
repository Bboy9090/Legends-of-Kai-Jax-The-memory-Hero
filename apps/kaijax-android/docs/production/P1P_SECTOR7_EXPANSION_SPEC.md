# OPERATION KAI-JAX — PHASE 7 EXPANSION SPECIFICATION: SECTOR-7

**District Order:** 2 of 8 (`Act I — Age of Protection`)  
**Wave Priority:** Wave 2 — Mid-Campaign Industrial & Market Production  
**Status:** Specification & Production Blueprint Ready (**Zero runtime/Ashblock changes in P1-P**)  
**Canon Authority:** `/docs/CANON_BIBLE.md`, `/src/game/data/canonData.ts`, `/src/game/data/districtSpecifications.ts`

---

## 1. Visual Library Authority & Disclosure

- **Visual Authority Mode:** `direct_visual_sheet`
- **Approved Reference Plates on Disk:**
  1. `public/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_26_PM__3__e05fb785.png` — *IRONVEIN WARDS — RAGING CITY INDUSTRIAL DISTRICT*: Steam freight rail viaducts, overhead gantry cranes, coal-smoke stacks, riveted ironwork, and industrial yard scale.
  2. `public/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_56_27_PM__8__0e91caa6.png` — *THE FRACTURE PIT & UNDERCITY (SERVICE TUNNEL SECTOR 7B)*: Sub-grade Sector 7B transit service tunnels, derailed tram cars, masonry tunnel portals, and storm-arc conduits.
- **Explicit Inference Disclosure:** Industrial freight elevators and access ramps bridging the surface freight rail yards (`e05fb785.png`) to sub-surface Service Tunnel Sector 7B (`0e91caa6.png`) are structurally inferred from those two approved sheets. No new off-canon landmarks or characters are fabricated.

---

## 2. Canonical Role, Adversaries & Heritage Mechanics

- **Canonical Threat (`canonData.ts`):** `Architect Scout` (The Architect Vanguard) — high-altitude drone-tethered reconnaissance sniper forcing Web Swing pursuit across viaducts (`Automated Searchlights`, `Moving Freight Platforms`), reconciled with the Sector 7B Substation encounter (`Vane-7`) specified in `districtSpecifications.ts`.
- **Primary Heritage Unlock/Focus:** `Thryxen` Surveillance & Escape (predatory awareness, counter-timing under automated spotlight sweeps, electrified third-rail Kar-Voth conduit grinds).
- **Narrative Handoff from Ashblock:** Picked up verbatim from `MISSION_1_VICTORY_DIALOGUE` (`Bovar`: *"Sector-7 scouts already know the gate fell. Rest at Ashblock and prepare."*).

---

## 3. Spatial Tiers & Combat Arena Blueprints

| Tier / Zone | Elevation (`Y`) | Key Geometry & Role |
|---|---|---|
| **Sub-Tier (Service Tunnel 7B)** | `-12.0 m` | Submerged-border service tracks, derailed tram car cover, storm-arc wall conduits |
| **Grade Switching Yard** | `0.0 m` | Cargo container lanes, turntable pit (`36 m x 36 m`), searchlight patrol sweeps |
| **Elevated Rail Viaduct & Crane Deck** | `+11.0 m` to `+22.0 m` | Steam freight viaduct spans, swinging gantry crane booms, web-anchor rail hooks |

### Primary Combat Arenas
1. **Freight Turntable Pit (`36 m x 36 m`):** Open ground skirmish + overhead rotating gantry crane hook (`Web Pull` & `Environmental Drop` hazard).
2. **Sector 7B Substation (`32 m x 28 m`):** Boss/Sub-commander encounter flanked by destructible high-voltage ceramic transformers and elevated rail catwalks for `Architect Scout` sniper repositioning.

---

## 4. Proposed Modular GLB Kit (P1-L Deduplicated Pattern)

Target `public/models/environments/sector7/` kit (`<= 12` modular GLBs, shared PBR 512x512 atlases):
1. `sector7_freight_viaduct_span.glb` (elevated riveted rail bridge + built-in under-truss web anchors)
2. `sector7_gantry_crane_boom.glb` (overhead crane carrier + chain hook web-zip anchor)
3. `sector7_derailed_tram_car.glb` (Sector 7B cover prop + traversal roof)
4. `sector7_tunnel_portal_7b.glb` (masonry/steel sub-grade transition arch)
5. `sector7_arc_transformer_pylon.glb` (interactive Kar-Voth overload environmental takedown node)
6. `sector7_cargo_container_stack.glb` (stepped industrial platforming blocks)
7. `sector7_searchlight_tower.glb` (Thryxen stealth/evade cone hazard tower)
8. `sector7_freight_elevator_frame.glb` (surface-to-sub-grade `-12m..0m` vertical shaft)

---

## 5. Mobile Performance & Asset Governance Guardrails

- **Max Scene Triangles:** `<= 50,000` (merged instancing per `WorldBuilder.ts` deduplication pipeline)
- **Max Draw Calls:** `<= 100`
- **Max Texture Atlas Budget:** `<= 26 MB` (`512x512` BaseColor+AO, MetallicRoughness, Normal, Emissive)
- **Frame Rate Targets:** `30 FPS` minimum floor on mid-tier Android, `60 FPS` balanced/performance target
- **Strict Boundary:** Do NOT share runtime bundle memory with Ashblock Heights (`disposeDistrict()` unloads Ashblock GLB caches cleanly before mounting Sector-7), and do NOT spawn Bovar 3D meshes (`awaiting_visual_approval`).
