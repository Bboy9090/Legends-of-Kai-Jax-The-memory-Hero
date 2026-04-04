## Phase 3: Combat feel — battle FSM, block, parry, guard break

### What changed

- **Formal battle combat FSM** (`BattleCombatState` in `combatSystems.ts`, mirrored in `useBattle.playerCombatState`): FREE, ATTACKING, DODGING, BLOCKING, PARRY_WINDOW, HITSTUN, GUARD_BROKEN.
- **Stamina** (`playerStamina`, `maxPlayerStamina`): Regenerates after a short delay; attacks and dodge consume stamina from move data (`MOVES`) or dodge cost; attacks fail if stamina is insufficient.
- **Block/parry/guard-break** (duel mode only):
  - Hold **Alt** to block (grounded, not in attack/dodge/hitstun/guard break, not during `playerInvulnerable` i-frames).
  - **Parry**: first `BATTLE_STAMINA.parryWindowSec` after pressing block — if an opponent hit connects, opponent is staggered (`opponentStaggerTimer`), their attack is cancelled, and chip/guard pressure is cleared.
  - **Chip + guard pressure**: blocked hits apply reduced damage and stamina chip; `attackBreaksGuard` adds pressure; at 100 pressure or 0 stamina while blocking, **guard break** applies (`guardBreakTimer`).
- **Hitstun**: `playerHitStunTimer` / `opponentHitStunTimer` for clearer hit reactions; `OpponentAI` pauses while staggered or hitstun.
- **UI**: Stamina bar, optional guard-pressure bar, combat state label, controls hint for **ALT Block**.

### Why it improves player experience

- Defense is **readable** (stamina + guard pressure), **parry** rewards timing, and **guard break** punishes turtling.
- Opponent **stagger** and **hitstun** make trades and combos easier to read.

### Files changed

- `apps/web/src/lib/combatSystems.ts` — `BattleCombatState`, `BATTLE_STAMINA`, `attackBreaksGuard`
- `apps/web/src/lib/stores/useBattle.tsx` — FSM tick, stamina, block resolution, parry/stagger
- `apps/web/src/components/game/PlayerController.tsx` — Alt block, guard/hitstun lockouts
- `apps/web/src/components/game/OpponentAI.tsx` — respect stagger/hitstun
- `apps/web/src/components/game/BattleUI.tsx` — stamina / state HUD
- `memory/PHASE_3_COMBAT.md` (this file)

### Risks

- Balance (chip %, break values, parry window) is **first pass** — tune with playtests.
- `damageNumbers` jitter still uses `Math.random()` (pre-existing); only cosmetic.

### Next recommended step

- **Phase 4**: Split combat vs exploration camera logic; reduce shake/flash stacking during block strings and parries.
