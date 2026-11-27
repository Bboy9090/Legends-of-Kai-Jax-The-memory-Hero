# P1 PERFORMANCE & MEMORY PROFILING REPORT

**Project:** Legends of Kai-Jax: The Memory Hero  
**Phase:** Operation Kai-Jax — Project Beast Gods (P1)  
**Target Budget:** Sustained 30 FPS minimum (Low/Balanced) · 60 FPS target (High) · Zero Render-Loop GC Spikes

---

## 1. Character & Scene Geometry Budget (Measured)

From `docs/production/glb-certification-report.json` (`scripts/certify-character-glbs.mjs`):

| Character | Master Triangles | Master Binary Size | Mobile LOD1 Triangles | Mobile LOD1 Binary Size | Reduction |
|---|---|---|---|---|---|
| **Kai** | `8,164` | `1.223 MB` | `3,818` | `0.942 MB` | `-53.2%` tris |
| **Jax** | `7,670` | `1.163 MB` | `3,516` | `0.894 MB` | `-54.2%` tris |
| **Kai-Jax** | `12,312` | `1.655 MB` | `5,240` | `1.197 MB` | `-57.4%` tris |
| **Boryn** | `5,890` | `1.017 MB` | `2,946` | `0.828 MB` | `-50.0%` tris |
| **Borax** | `8,370` | `1.194 MB` | `3,538` | `0.878 MB` | `-57.7%` tris |
| **Total Roster** | **`42,406`** | **`6.252 MB`** | **`19,058`** | **`4.739 MB`** | **`-55.1%` tris** |

- **Simultaneous Active Skinned Triangles in Ashblock Heights**:
  - *High / Balanced Quality* (Kai + Jax + Boryn + Borax Master): `30,094` character triangles (`25,922` when fused into Kai-Jax + Mentors).
  - *Low / Mobile Battery Saver Quality* (LOD1): `13,818` character triangles (`11,724` when fused).
- **Embedded PBR Texture Footprint**: 3 procedural `256×256` PNG textures per GLB (`albedo+roughness`, `tangent normal`, `emissive`), anisotropic filtering capped to `min(maxAnisotropy, 4)` (`1` on `low` quality).

---

## 2. Zero-Allocation Render Loop & GPU Hardening

1. **Zero Per-Frame Heap Allocations in Hot Paths**:
   - Module-scope scratch vectors (`_v1`, `_v2`, `_v3`, `_camFwd`, `_camRight`, `_segDir`, `_pt`) in `GameEngine.ts`, `GLBCharacterController.ts`, and `webInteractionSystem.ts`.
   - Pre-allocated `64`-mesh `OctahedronGeometry` particle pool (`particlePool`) toggled via `.visible` and `.active` flags — zero runtime `new THREE.Mesh()` or `new THREE.Material()` allocations during combat bursts or Duo Finishers.
   - Pre-allocated `Float32Array(120)` ring buffer (`frameTimesRing`) computing live `onePercentLowFps` with zero array allocations.
2. **UI Compositor Discipline**:
   - **Zero `backdrop-filter: blur(...)`** over the live WebGL canvas (`GameHUD.tsx`, `TitleScreen.tsx`, `DialogueOverlay.tsx` use opaque/high-alpha `#0a0b10/90` surfaces), avoiding mobile tile-GPU render-pass stalls on Adreno/Mali GPUs.
   - HUD React state updates throttled to `20 Hz` (`hudEmitTimer >= 0.05s`) rather than re-rendering React DOM trees at `60 Hz`.
3. **Shader Pre-Compilation & Adaptive DPR**:
   - `this.renderer.compile(this.scene, this.camera)` runs at boot prior to first interactive frame to prevent first-attack shader compilation hitches.
   - **Adaptive Resolution Scaling**: If sustained `fpsEstimate < 26` for `>= 2.0s` on `balanced` or `high` presets, `GameEngine` automatically steps `renderer.setPixelRatio(1.0)` (`adaptiveScaleApplied = true`) without interrupting gameplay.
4. **Software WebGL / Headless GPU Fence Pacing**:
   - Automatic SwiftShader / llvmpipe detection disables shadows/MSAA, selects `LOD1` character models, and paces frames via `WebGL2RenderingContext.fenceSync` so CPU/UI threads remain responsive even in software-rendered environments.

---

## 3. Live Telemetry Instrumentation (`getPerformanceMetrics()` & `HudSnapshot`)

Exposed in real time via `GameEngine.getPerformanceMetrics()` and `HudSnapshot`:
- `fpsEstimate` (rolling 0.5s average FPS)
- `onePercentLowFps` (worst frame in rolling 120-frame window)
- `drawCalls` (`renderer.info.render.calls` — ~85–135 draw calls across full Ashblock Heights district + active characters + enemy squad)
- `activeTriangles` (`renderer.info.render.triangles` — ~22k on `low` LOD1, ~48k on `balanced/high` Master)
- **Physical Android Device Profiling Status**: **NOT TESTED ON PHYSICAL HARDWARE IN CONTAINER** (Android SDK / ADB / physical device unavailable in Linux build container; instrumented telemetry ready for on-device capture).
