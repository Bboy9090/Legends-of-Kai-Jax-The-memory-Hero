## Phase 5: Open-world RPG systems (district encounters)

### What changed

- **Reusable encounter data** (`apps/web/src/lib/encounters.ts`):
  - `DISTRICTS`: five campaign-aligned districts (`district-1` … `district-5`) with name, theme, and **3 scripted encounters** each (minion counts + optional boss).
  - `buildEncounterEnemies`: deterministic enemy placement/stats from district + encounter index (no `Math.random` in spawn layout).
- **Adventure store** (`useAdventure.ts`):
  - `roamDistrictId`, `encounterIndex`, `districtCompleted`.
  - `startDistrictRoam(districtId, characterId)` resets state and tags the session as district patrol (`arenaId: roam-<id>`).
- **Wave spawner** (`AdventureArena.tsx`):
  - If `roamDistrictId` is set, **replaces infinite wave loop** with sequential encounters from `DISTRICTS`; legacy infinite waves remain when `roamDistrictId` is null (sandbox Adventure Mode).
  - `initAdventure` skipped when entering from district patrol so `startDistrictRoam` is not overwritten.
- **District select UI** (`DistrictSelectScreen.tsx` + `gameState: district-select`):
  - Pick a district; unlocks follow **existing** `isCampaignNodeUnlocked` (Story campaign progression on the map).
  - **Explicit note in UI**: XP/gold rewards for patrol are **not implemented yet** — district patrol is encounter + HUD progression only.
- **HUD** (`AdventureHUD.tsx`): District name/theme, encounter counter, “Done” when `districtCompleted`.
- **Main menu**: “District patrol” opens district select.

### Why it improves player experience

- Open-world sessions have **structured beats** (3 encounters + boss rounds) instead of an endless wave treadmill.
- Data-driven districts make **new regions** a content add, not a code fork.

### Files changed

- `apps/web/src/lib/encounters.ts`
- `apps/web/src/lib/stores/useAdventure.ts`
- `apps/web/src/lib/stores/useRunner.ts` (`district-select` game state)
- `apps/web/src/components/game/adventure/AdventureArena.tsx`
- `apps/web/src/components/game/adventure/AdventureHUD.tsx`
- `apps/web/src/components/game/DistrictSelectScreen.tsx`
- `apps/web/src/components/game/MainMenu.tsx`
- `apps/web/src/App.tsx`
- `memory/PHASE_5_OPEN_WORLD.md`

### Risks

- **Rewards / checkpoints / NPCs** are not built yet; UI states that patrol rewards follow in a later phase.
- Unlock rules reuse **campaign node** completion; if a player never opens Story map, only `district-1` may be unlocked.

### Next recommended step

- Wire **mission rewards** (`useMissions` or a dedicated roam ledger) on `districtCompleted`, and add a minimal **checkpoint** (heal partial) between encounters if canon allows.
