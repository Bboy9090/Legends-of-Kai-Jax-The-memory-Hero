# KJ-011 Original-IP Registry & Roster Truth Audit Report

- **Branch**: `feat/gold-slice-enemy-combat`
- **HEAD SHA**: `91129139`
- **Execution Date**: 2026-08-03

---

## 1. Release-Slice Playable Roster Lock

The active production roster is locked to the 3 canonical playable fighters:

1. **Kai-Jax** (`kai-jax`) — The Memory Hero
2. **Jaxon** (`jaxon`) — Shadow Velocity Blitzer
3. **Kaison** (`kaison`) — Spider Tactical Blade

---

## 2. Canon & Restricted Alias Map (KJ-011.1)

Only proven historical repository aliases are retained:

```json
{
  "kaijax": "kai-jax",
  "kai_jax": "kai-jax"
}
```

Speculative aliases (`jax -> jaxon`, `kai -> kai-jax`, `kaxon -> kaison`) were audited and purged because they lacked direct repository evidence or threatened to merge distinct fighters.

---

## 3. Roster Classification Breakdown

| Fighter ID | Name | Role / Category | Model Path | Status |
|---|---|---|---|---|
| `kai-jax` | Kai-Jax | The Memory Hero (Protagonist) | `/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb` | **Playable** |
| `jaxon` | Jaxon | Hero / Rival | `/models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb` | **Playable** |
| `kaison` | Kaison | Hero / Rival | `/models/Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb` | **Playable** |
| `zephyr-veyl` | Zephyr Veyl | Future Original IP | Configured / Asset pending | **Coming Soon** |
| `lyra-voss` | Lyra Voss | Future Original IP | Configured / Asset pending | **Coming Soon** |
| `axiom-07` | Axiom-07 | Future Original IP | Configured / Asset pending | **Coming Soon** |

---

## 4. IP Audit & Prohibited Term Removal

- Active gameplay configuration, roster bios, and menu descriptions were audited.
- Crossover keywords (`sonic`, `megaman`, `spin-dash`, `nintendo`, `sega`, `capcom`) were removed from active production text fields.
- Automated tests assert that Kai-Jax is never classified as a fusion entity, and display title remains **The Memory Hero**.

---

## 5. Automated Pipeline Output

```bash
$ npx tsc -p tsconfig.phase0.json --noEmit
# Exit Code: 0 (PASS)

$ npx vitest run
# Test Files: 18 passed (18)
# Tests: 117 passed (117)
# Duration: 4.91s

$ npx vite build
# Built in 31.80s

$ npx cap sync
# Sync finished in 2.04s
```
