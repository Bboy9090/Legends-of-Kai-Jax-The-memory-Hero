# OPERATION KAI-JAX — P1-N: PERFORMANCE & TOUCH QA REPORT

**Project:** *Legends of Kai-Jax: The Memory Hero* (`com.bobbyblanco.legendsofkaijax`)  
**Status:**  
- **Headless Chromium `844x390` (`isSoftwareGl: true` SwiftShader Reference):** **MEASURED**  
- **Android Emulator Performance & Touch Telemetry:** **NOT EXECUTED (Blocked — No Android SDK/Emulator)**  
- **Physical Android Hardware Telemetry (Adreno / Mali GPU):** **NOT EXECUTED (Blocked — No Physical Device)**

---

## 1. Phase 5 — Physical Device vs. Emulator vs. Headless Chromium Distinction

| Metric | Headless Chromium (`844x390 @ 2x DPR`, SwiftShader CPU GL) | Android Emulator | Physical Android Hardware |
|---|---|---|---|
| **Graphics Driver** | ANGLE SwiftShader (`isSoftwareGl: true`) | *Not executed* | *Not executed* |
| **Scene Draw Calls (`low` / `balanced` / `high`)** | `154` / `163` / `163` | *Not measured* | *Not measured* |
| **Active Triangles (`low` / `balanced` / `high`)** | `63,402` / `66,946` / `66,946` | *Not measured* | *Not measured* |
| **Active Geometries / Textures** | `392` / `46` | *Not measured* | *Not measured* |
| **CPU Sim Avg (`1/60s` step)** | `0.292 ms` (`low`), `0.725 ms` (`balanced`), `0.658 ms` (`high`) | *Not measured* | *Not measured* |
| **Real VSync Frame Time (P50 / P95 / P99 / Janky %)** | *Not applicable (deterministic stepping)* | *Not measured (`dumpsys gfxinfo`)* | *Not measured (`dumpsys gfxinfo`)* |
| **RSS / WebView Memory Usage (`dumpsys meminfo`)** | *Not measured on Android* | *Not measured* | *Not measured* |
| **Thermal Throttling Stability (10-min sustained)** | *Not applicable* | *Not applicable* | *Not measured (`dumpsys thermalservice`)* |
| **Touch Latency & Simultaneous Multi-Touch** | `0.6 ms` jump / `0.5 ms` parry dispatch; simultaneous synthetic `pointerId 101 + 202` joystick + Attack verified (`0` dropped inputs, `0/17` clipped buttons) | *Not tested* | *Not tested (capacitive hardware digitizer)* |

---

## 2. Verified Engine & HUD Optimizations Ready for Native Hardware Profiling

- **Draw-Call & Instancing Budget:** All 12 modular Ashblock GLBs run via `THREE.InstancedMesh` (`133` placements, `11` deduplicated PBR materials), static structural trim/pillars/railings merged by material, and enemy articulated sub-parts batched per material while keeping draw calls (`154–163`) and active triangles (`63K–67K`) within mobile GPU limits.
- **Zero-GC Frame Loop:** Scratch `Vector3`/`Color` buffers eliminate per-frame heap allocations inside enemy updates, environmental hazard scans, and HUD projections.
- **Adaptive Quality & Target FPS Tiers:** `low` (`LOD1`, DPR `1.0`), `balanced` (`LOD1`, DPR `1.35`, `1024` shadow map), and `high` (`Master`/`LOD1`, DPR `1.75`) plus `30 FPS` / `60 FPS` pacing caps and `adaptiveResolution` dynamic DPR scaling remain intact.
- **Multi-Touch Pointer Isolation (`GameHUD.tsx`):** `joyPointerId` tracks the left thumbstick independently from right-thumb combat pointers with `touch-none` enabled across controls and `0` button overlaps on `844x390` landscape.

---

## 3. Native Profiling Commands Required on macOS + Attached Android Device

Once `scripts/p1n-mac-qualify.sh` installs `app-debug.apk` on a physical Android phone:

```bash
# 1. Process Memory & WebView GL Footprint
adb shell dumpsys meminfo com.bobbyblanco.legendsofkaijax

# 2. Real UI/WebView Frame-Time Distribution (P50 / P90 / P95 / P99)
adb shell dumpsys gfxinfo com.bobbyblanco.legendsofkaijax framestats

# 3. Sustained Thermal State (during 10-minute Boss Courtyard / Patrol play)
adb shell dumpsys thermalservice
```
