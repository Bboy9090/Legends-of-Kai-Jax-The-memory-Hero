# P1 SAVE PERSISTENCE, MIGRATION & CORRUPTION RECOVERY REPORT

**Project:** Legends of Kai-Jax: The Memory Hero  
**Module:** `src/game/save/SaveManager.ts`  
**Schema Version:** `CURRENT_SAVE_VERSION = 2`  
**Certification Status:** **PASS** (Verified deterministically in `src/game/__tests__/gameSystems.test.ts`)

---

## 1. Atomic Checksum Envelope & Shadow Backup Architecture

Every save slot (`autosave`, `slot-1`, `slot-2`, `slot-3`) is stored completely offline in isolated key pairs:

- **Primary Key:** `kaijax_save_v1_<slotId>`
- **Shadow Backup Key:** `kaijax_save_v1_<slotId>_bak`

### Write Protocol (`saveToSlot`)
1. Before overwriting `kaijax_save_v1_<slotId>`, `SaveManager` reads and validates the existing primary entry via `parseSlotEntry(...)`.
2. Only if the existing primary entry passes JSON parsing, FNV-1a 32-bit checksum verification (`computeSaveChecksum`), and structural schema validation (`validateSavePayload`), it is promoted into `kaijax_save_v1_<slotId>_bak`.
3. The new `SaveSlotData` payload is serialized, hashed (`checksum`), wrapped in `SaveEnvelopeV2` (`{ __kaijaxEnvelope: 2, checksum, payload }`), and committed to `kaijax_save_v1_<slotId>`.

### Read & Auto-Healing Protocol (`loadFromSlotWithRecovery`)
1. Reads `kaijax_save_v1_<slotId>`.
2. **Case A — Valid v2 Envelope (`status: 'ok'`)**: Checksum matches and schema validates; returns migrated `SaveSlotData`.
3. **Case B — Legacy v0/v1 Plain JSON (`status: 'migrated_legacy'`)**: Preserves all existing hero levels, XP, unlocked skills, inventory, materials, Memory Fragments, and stage progress, upgrades in-place to v2 envelope + `_bak`, and returns data with zero loss.
4. **Case C — Truncated JSON / Checksum Mismatch (`status: 'recovered_from_backup'`)**: Automatically falls back to `kaijax_save_v1_<slotId>_bak`, verifies backup integrity, heals the corrupted primary key in storage, and returns the recovered save seamlessly without crashing boot.
5. **Case D — Both Primary & Backup Unrecoverable (`status: 'corrupted_unrecoverable'`)**: Safely returns `null` so `App.tsx` falls back cleanly to `createNewSave('autosave')` without throwing unhandled exceptions.

---

## 2. Verified Persistence Fields

| Field Category | Persisted Properties | Verified |
|---|---|---|
| **Identity & Story** | `activeHero` (`'kai' \| 'jax'`), `fusionUnlocked`, `missionStageIndex` (`0..4`), `missionCompleted`, `checkpointPos` | **PASS** |
| **World State** | `rescuedCivilians`, `reconstructedSites`, `memoryFragments`, `traversalTier`, `unlockedDomains` | **PASS** |
| **Hero RPG State** | Independent `kai` & `jax` `level`, `xp`, `xpToNext`, `skillPoints`, `unlockedSkills`, `equipped` (`weapon`, `armor`, `relic`) | **PASS** |
| **Inventory & Cosmetics** | `inventoryIds`, `materials` (`Ash Scrap`, `Pyraxis Ember`, `Storm Capacitor`, `Myrr'Kai Thread`), `activeCosmeticId`, `unlockedCosmeticIds` | **PASS** |
| **P1-C Combat Telemetry** | `duoSynergySaved`, `parryCount`, `evadeCount`, `hitsTaken`, `maxCombo`, `duoFinishersUsed`, `wallPinsCount`, `guardBreaksCount`, `styleScoreBest` | **PASS** |
| **Lifecycle Autosave** | `registerPlatformLifecycle` (`src/platform/androidLifecycle.ts`) triggers silent autosave + audio suspend on `visibilitychange` (`hidden`), `pagehide`, and Capacitor `appStateChange` | **PASS** |

---

## 3. Automated Test Matrix Results

- **Fresh v2 Save Creation & Lead Predator Persistence (`kai` / `jax`)**: **PASS**
- **Legacy v0 & v1 Save Migration Without Data Loss**: **PASS**
- **Simulated Power-Loss Truncated Primary JSON (`{TRUNCATED`) -> Automatic `_bak` Recovery**: **PASS**
- **Multi-Slot Isolation (`autosave`, `slot-1`, `slot-2`, `slot-3` Zero Cross-Slot Contamination)**: **PASS**
- **Clean Slot Deletion (Removes Both Primary & `_bak` Keys)**: **PASS**
