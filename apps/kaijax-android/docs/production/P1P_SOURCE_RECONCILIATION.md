# OPERATION KAI-JAX — P1-P: SOURCE RECONCILIATION REPORT

**Project:** *Legends of Kai-Jax: The Memory Hero* (`com.bobbyblanco.legendsofkaijax`)  
**Upstream GitHub Repository:** `https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero` (`main` HEAD `ceeb155bf30b904f603b28a23697f3b8476`, pushed `2026-11-10T08:06:35Z`)  
**Google AI Studio Source Baseline:** P1-O / P1-P Workspace (`data/checkpoints/p1n-certified/SHA256SUMS.txt` — `54 / 54` verified OK)  
**Reconciliation Date:** `2026-11-15`

---

## 1. Phase 0 Source Inspection & P1-O Handoff State

- **GitHub `main` (`ceeb155`):** Inspected via GitHub REST API (`/git/trees/ceeb155bf30b904f603b28a23697f3b8476?recursive=1`) — `6,567` blobs across a `pnpm@9.15.9` + `turbo` monorepo.
- **Google AI Studio Workspace:** `493` curated source, asset, Android native, script, checkpoint, and production report files (excluding `node_modules/`, `dist/`, `.aistudio/`, `exports/`, and generated Android web assets).
- **P1-O Archive Check:** `exports/legends-of-kai-jax-p1o-macos-handoff.tar.gz.sha256` (`a6868be537fe24689500dbda7a7eaf038c5e10e6ce9bd8aa17940deabd42f8b5`, `306,355,883` bytes, `606` entries recorded in P1-O) remained on disk, while the `293 MiB` `.tar.gz` binary was omitted on workspace container rehydration; `data/checkpoints/p1n-certified/SHA256SUMS.txt` (`54/54`) and `data/checkpoints/p1m-certified/SHA256SUMS.txt` (`31/31`) verified `OK` on disk.

---

## 2. Architectural Comparison (Materially Different Trees)

Per P1-P Phase 2 governance (*"If the existing repository represents a materially different architecture, preserve both implementations and report the required integration strategy instead of blindly combining incompatible systems"*), direct overlay into GitHub `main` is unsafe because the two trees organize their root differently:

| Dimension | GitHub `main` (`ceeb155bf30b904f603b28a23697f3b8476`) | Google AI Studio (`P1-O / P1-P`) |
|---|---|---|
| **Repo Shape** | Multi-app `pnpm` monorepo (`apps/web`, `apps/ios`, `frontend`, `backend`, `packages/*`, `engine/cpp`) | Standalone Capacitor 8 Android/Web root project (`src/`, `public/`, `android/`, `scripts/`) |
| **Web / Runtime Stack** | Vite `6.4.4`, React `18.2.0`, `@react-three/fiber` `8.16`, Three `0.185.1`, Capacitor `5.7.8` | Vite `8.3.8`, React `19.0.1`, direct Three.js `0.187.0` (`GameEngine.ts`), Capacitor `8.6.2` |
| **Android Build Config** | `apps/web/android` (`minSdk 22`, `compileSdk 36`, `targetSdk 36`, Capacitor `5.7.8`) | `android/` (`minSdk 24`, `compileSdk 36`, `targetSdk 36`, AGP `8.13.0`, Gradle `8.14.3`) |
| **3D Character Models** | Un-decimated raw Meshy GLBs (`KAIJAX1.glb` **74.1 MB**, `KAINJAXYN.glb` **32.6 MB**, `KAITEENFOX.glb` **29.4 MB**; `689.48 MB` Android package) | Certified skeletal `5` Master + `5` LOD1 GLBs (`3.42 – 9.16 MB`, `19` clips each, strict 3 tails / 12 tail bones) + `P1-G`/`P1-I`/procedural toggles |
| **Environment Assets** | Procedural/monolith web scene + `Mission 6` Ashblock script (`apps/web/src/game/world/zones/AshblockHeights/`) | `12` modular Ashblock GLBs (`791.9 KB` total, `133` placements, `23` elevated zones, `10` web anchors) + `10` environment Visual Library PNGs |
| **Narrative / Canon** | Older draft lines (`docs/STORY_BIBLE.md` contains `Kaison`, `Jaxon`, `Void Tower Warden`) | Strict canon (`Kai`, `Jax`, `Kai-Jax` 3-tail fusion, `Erasure`, `Bovar`/`Boryn`/`Borax`, enforced by tests) |

---

## 3. File-Level Ownership & Overlap Matrix

Exact path comparison between the `6,567` GitHub `main` blobs and `493` local workspace files found **only `5` exact root path collisions**:

1. `.gitignore` — GitHub excludes monorepo/Turbo/Xcode outputs; AI Studio excludes `android/app/src/main/assets/public/`, `android/.gradle/`, `dist/`, `.aistudio/`. **Strategy:** Keep monorepo ignores at root `.gitignore` and keep Capacitor/Gradle ignores inside the AI Studio target subdirectory (e.g. `apps/android-slice/.gitignore`).
2. `build-android-release.sh` — GitHub's script targets `apps/web/android`; AI Studio's script targets root `./android`. **Strategy:** Keep GitHub's script for legacy `apps/web` compatibility or route via explicit flag / workspace path.
3. `package.json` — GitHub root defines `pnpm` workspace scripts (`pnpm -C apps/web ...`); AI Studio root defines Vite 8 + Three `0.187` + Capacitor `8.6.2`. **Strategy:** Preserve GitHub root `package.json` cleanly and place AI Studio's `package.json` in `apps/kaijax-android/` (or dedicated P1-P branch PR) so `pnpm`/`bun` never collide.
4. `tsconfig.json` — GitHub root monorepo TS settings vs AI Studio standalone TS config. **Strategy:** Keep separate per workspace package.
5. `vite.config.ts` — GitHub root config (`vite:server` Express legacy) vs AI Studio Capacitor PWA Vite 8 config. **Strategy:** Preserve AI Studio `vite.config.ts` alongside its package root.

### Unique Files Preserved on Each Side
- **Only in GitHub `main` (`6,562` paths):** `apps/ios/` (Swift/Xcode target + `.xcodecloud/ci_post_clone.sh`), `.github/workflows/` (`android-build.yml`, `android-signed-frozen.yml`, `ci.yml`, `codeql.yml`, `mobile-store-readiness.yml`, `combat-release-cert.yml`, etc.), `apps/web/`, `backend/`, `frontend/`, `packages/*`, `engine/cpp/`, `tests/`, `tools/`.
- **Only in AI Studio P1-O/P1-P (`488` paths):** Certified `public/models/characters/*.glb`, `public/models/environments/ashblock/*.glb`, `public/assets/aistudio/*.png`, root Capacitor 8 `android/`, `src/game/engine/` (`GameEngine.ts`, `WorldBuilder.ts`, `CharacterBuilder.ts`, `GLBCharacterController.ts`), `src/game/combat/`, `src/game/save/SaveManager.ts`, `scripts/p1n-mac-qualify.sh`, `scripts/validate-character-glbs.mjs`, `scripts/validate-p1p-world-and-saves.mjs`, `.github/workflows/android-p1p-debug.yml`, `data/checkpoints/`, and `docs/production/P1*_*.md`.

---

## 4. Git LFS & Binary Asset Size Audit

- **GitHub `main` LFS Check:** No `.gitattributes` exists in `main`. Largest binary blobs on `main` are `74,149,052` bytes (`74.1 MB`, `KAIJAX1.glb`) — zero files exceed GitHub's `100 MB` hard push limit (`OVER_100MB: []`).
- **AI Studio P1-O/P1-P Assets:** Largest character GLB is `kaijax_master.glb` at `9.16 MB` (`9,160,224` bytes); largest Ashblock GLB is `ashblock_skybridge_truss.glb` at `98,044` bytes (`98 KB`).
- **Decision:** **Do NOT introduce Git LFS dependencies.** Every AI Studio binary is `< 10 MB` (far below GitHub's `50 MB` warning and `100 MB` limit), allowing standard Git CI clones (`git clone` without `git-lfs` filters) to work reliably across macOS, Linux CI, and GitHub Actions.
