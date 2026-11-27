# OPERATION KAI-JAX — P1-P: CANON & ASSET INTEGRITY REPORT

**Project:** *Legends of Kai-Jax: The Memory Hero* (`com.bobbyblanco.legendsofkaijax`)  
**Verification Date:** `2026-11-15`  
**Checkpoints Verified:** `p1m-certified` (`31/31 OK`), `p1n-certified` (`54/54 OK`)

---

## 1. Certified Character GLBs (`node scripts/validate-character-glbs.mjs` — `PASS`)

All `5` Master and `5` LOD1 certified GLBs (`10/10` files) passed glTF 2.0 binary, UV (`TEXCOORD_0`), unified single skin (`JOINTS_0` + `WEIGHTS_0`), `>= 5` facial morph targets, `6` required equipment/hitbox sockets, `19` animation clips, and bone topology checks:

| Character | Master GLB | Master Tris / Joints | LOD1 GLB | LOD1 Tris | Clips | Canon Topology Verified |
|---|---|---|---|---:|---:|---|
| **Kai** | `kai_master.glb` (`6.54 MB`) | `22,087` / `37` | `kai_lod1.glb` (`3.75 MB`) | `9,211` | `19` | `12` spider limb bones (`0` tails) |
| **Jax** | `jax_master.glb` (`6.18 MB`) | `22,087` / `32` | `jax_lod1.glb` (`3.49 MB`) | `9,211` | `19` | `7` storm-mane bones (`0` tails) |
| **Kai-Jax** | `kaijax_master.glb` (`9.16 MB`) | `23,967` / `56` | `kaijax_lod1.glb` (`5.37 MB`) | `10,526` | `19` | Strictly **`3` physical tails (`12` tail bones)**, `12` spider bones, `7` mane bones |
| **Boryn** | `boryn_master.glb` (`6.15 MB`) | `20,675` / `29` | `boryn_lod1.glb` (`3.42 MB`) | `8,648` | `19` | `4` tail bones |
| **Borax** | `borax_master.glb` (`7.03 MB`) | `22,082` / `29` | `borax_lod1.glb` (`3.91 MB`) | `9,212` | `19` | `4` tail bones |

- **Bovar Canon Gate:** Confirmed `public/models/characters/bovar_master.glb` does **not** exist (`bovar` remains withheld pending official solo artwork approval).
- **Model/Fallback Switch Integrity:** Preserved `public/models/characters/p1g/` and `p1i/` directories plus runtime `characterModelVersion` (`p1i_reconstructed` / `p1g_mastered` / `meshy_custom` / `procedural_fallback`) and `environmentMode` (`reconstructed` / `legacy`) switches.

---

## 2. Certified Ashblock Heights World & Save Integrity (`npx tsx scripts/validate-p1p-world-and-saves.mjs` — `PASS`)

- **Modular Kit GLBs:** Verified **`12 / 12`** binary glTF 2.0 Ashblock GLBs (`791,948` bytes total, `3,820` tris per kit set) match `public/models/environments/ashblock/ashblock_kit_manifest.json` SHA-256 digests and sizes `100%`.
- **Ashblock Scene Placement Metrics (`buildAshblockHeights`):**
  - Instanced prop placements: **`133`** (`>= 133` invariant PASS)
  - Elevated walkable/traversal zones: **`23`**
  - Geometry-attached web anchors: **`10`**
  - Interactive Syndicate Arc Relay environmental hazards: **`5`** (matching Mission 1 combat arenas & Courtyard)
- **Visual Library Plates (`public/assets/aistudio/`):** Verified all **`10`** referenced PNG environment artwork plates (`f9d37a6e.png` through `fbb50f2d.png`) and **`8`** character plates (`18` total `.png` files) exist intact on disk.
- **Save Regression (`SaveManager.ts`):** Verified `CURRENT_SAVE_VERSION = 2` checksummed envelope round-trip (`saveToSlot`/`loadFromSlot`), corrupted primary slot automatic fallback to `_bak` shadow backup (`recovered_from_backup`), and legacy v1 save auto-migration (`migrated_legacy`).

---

## 3. Automated Game Systems Suite (`npm test` — `PASS`)

- `tsx src/game/__tests__/gameSystems.test.ts`: **`24 / 24` suites passed**, including strict canon checks rejecting off-canon names (`Void`, `Kaison`, `Silver`, `Volter`) and verifying Ashblock combat, parry, dodge cancel, web pull/pin, duo finishers, 3-tail fusion gating, and save recovery.
