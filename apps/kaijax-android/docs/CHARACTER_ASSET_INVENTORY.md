# Character & Arena Asset Inventory — Google Drive Canon Authority

## 1. Purge of Legacy Artwork Artifacts & Old Designs
Per authoritative directive:
- All 13 older artwork & audit image artifacts (`art_brothers_fusion.png`, `art_brothers_training.png`, `art_char_kaijax.png`, `art_hero_kaijax.png`, `art_jax.png`, `art_kai_jax_before_merge.png`, `art_kaijax_shadow.png`, `attached_0029.jpeg`, `attached_0034.jpeg`, `blender_origin_audit.png`, `blender_origin_audit2.png`, `origin_art_1.jpeg`, `origin_art_2.jpeg`) have been **deleted** from the artifacts directory.
- All pre-Google-Drive character `.glb` builds and temporary `/tmp/glb_audit` legacy Meshy exports have been **deleted** so zero elements of older designs carry into rigging.

## 2. Active Visual Authority Pipeline (`Google Drive Canon Vault`)
- **OAuth Integration**: Configured read-only Google Drive access (`https://www.googleapis.com/auth/drive.readonly`) via Firebase Authentication (`src/services/googleDriveAuth.ts`) and Express backend (`server.ts`).
- **Discovery & Sync**:
  - Automatically scans connected Google Drive for canon character sheets (`Kai`, `Jax`, `Kai-Jax`, `Boryn`, `Borax`, `Bovar`, bosses/factions), Raging City arenas & worlds (`Ashblock Heights`, `Sector-7`, `Neon Ward`, `Iron Market`, `Undercrown`, `Zenith Spires`, `Erasure Fields`, `Memory Nexus`), lore sheets, and 3D `.glb` assets, including nested files inside canon folders.
  - Syncs selected files into `public/canon-drive/{characters,arenas,models,lore}/` + `public/canon-drive/manifest.json` and mirrors imported canon sheets into the artifacts directory.

## 3. Roster Rigging Status (Gated on Google Drive Sync)
| Character ID | Role | Visual Authority Status | Rigging Target |
|---|---|---|---|
| `kai` | Playable Hero | `awaiting_visual_approval` (Pending Google Drive Sync) | `kai_master.glb` + `kai_lod1.glb` |
| `jax` | Playable Hero | `awaiting_visual_approval` (Pending Google Drive Sync) | `jax_master.glb` + `jax_lod1.glb` |
| `kaijax` | Fused Hero (3 Primary Tails) | `awaiting_visual_approval` (Pending Google Drive Sync) | `kaijax_master.glb` + `kaijax_lod1.glb` |
| `boryn` | Mentor | `awaiting_visual_approval` (Pending Google Drive Sync) | `boryn_master.glb` + `boryn_lod1.glb` |
| `borax` | Warden of Order | `awaiting_visual_approval` (Pending Google Drive Sync) | `borax_master.glb` + `borax_lod1.glb` |
| `bovar` | Adoptive Father | `awaiting_visual_approval` (Pending Google Drive Sync) | `bovar_master.glb` + `bovar_lod1.glb` |
