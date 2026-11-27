# P1 & P1-C APEX PREDATOR COMBAT QA REPORT

**Project:** Legends of Kai-Jax: The Memory Hero  
**Modules Audited:**
- `src/game/combat/comboSystem.ts`
- `src/game/combat/parry.ts`
- `src/game/combat/webInteractionSystem.ts`
- `src/game/combat/duoSynergySystem.ts`
- `src/game/combat/enemyCombatDirector.ts`
- `src/game/combat/combatInputMapper.ts`
- `src/game/engine/GameEngine.ts`

**Automated Test Execution:** `npm test` (`tsx src/game/__tests__/gameSystems.test.ts`) -> **16/16 Suites PASS (Exit Code 0)**

---

## 1. Free-Flow Martial Arts & Momentum Verification

| System | Implementation Detail | Verification Status |
|---|---|---|
| **Contextual Free-Flow Targeting** | `faceContextualFreeFlowTarget()` scores live enemies by distance + directional stick/WASD alignment for seamless enemy-to-enemy chaining | **PASS** |
| **Combo Momentum Tiers** | Configurable thresholds (`5` Flow Transition, `10` Finisher Eligible, `20` Synergy Surge, `30+` Apex Momentum) | **PASS** |
| **Technical Style Scoring** | `registerComboHit(state, hits, moveTag)` rewards move variation (`1.35x+`) and dampens repeated single-move mashing | **PASS** |
| **Committed Whiff Penalty** | `registerCommittedWhiff()` trims `1.4s` off active decay timer when a Heavy strike misses all enemies and crates | **PASS** |
| **Aerial Combos & Juggle Hang-Time** | Airborne Light steps 1–2 sustain hang-time (`vel.y >= 3.0`) and extend juggled enemy hang-time; step 3 / Heavy executes `Air_Slam` | **PASS** |
| **Single-Hit Per Strike Window** | `attackHitApplied` flag + `socket_hitbox_R` world origin guarantees melee strikes apply damage **strictly once** per swing | **PASS** |

---

## 2. Defensive Combat, Parry Counter & Guard Break

| Mechanic | Specification | Verification Status |
|---|---|---|
| **Agile Block** | Holding `[Q]` / `LB` / HUD `Block/Parry` mitigates standard strikes to `35%` chip damage without breaking combo | **PASS** |
| **Perfect-Timing Parry** | `0.10s` Standard (`0.16s` Generous accessibility option); staggers attacker for `1.8s`, strips `45` armor, grants Duo Synergy | **PASS** |
| **Parry Counter Window** | `1.35s` `CounterWindowState` after Perfect Parry unlocks **Spider-Limb Counter** (Kai), **Thunder Counter** (Jax), or **Memory Fang Counter** (Kai-Jax) | **PASS** |
| **Unblockable Enemy Strikes** | Signaled by pulsing `#D946EF` crimson-violet telegraph ring + HUD warning; shatters passive block (`guard_broken`), evadable via Dodge i-frames | **PASS** |
| **Shielded Defender Guard Break** | `applyGuardBreakToShield()` blocks light mash; Heavy Breaker, Web Pull, Parry Counter, or Duo Finisher shatters shield and staggers for `2.0s` | **PASS** |

---

## 3. Spider Web Physics & Storm Mobility (`WebInteractionSystem`)

| Ability | Behavior & Safety Guarantee | Verification Status |
|---|---|---|
| **Web Strike** | Closes `5.2m–14.5m` unobstructed gap directly into melee strike; grants bonus Duo Synergy against airborne/juggled targets | **PASS** |
| **Predator Pull** | Pulls standard enemies safely to `1.7m` in front of Kai (`resolveSafeHorizontalSlide` prevents wall clipping); yanks riot shields; Bruiser `0.45x` mass resistance; Boss yank immunity | **PASS** |
| **Web Throw & Wall Pin** | `computeWebThrowAndWallPin()` pins enemies cleanly **outside** Ashblock street/building colliders for `3.2s` (`wallPinnedTimer`), then auto-releases (`0` stuck enemies) | **PASS** |
| **Validated Web Swing & Zipline** | `validateGrappleAnchor()` rejects out-of-range, low-elevation, or collider-obstructed anchors; `shouldAutoReleaseTether()` releases obstructed/over-range lines | **PASS** |
| **Jax Electric Launcher & Slam** | Grounded Tactical launches enemy (`vel.y = 10.4`) + Jax (`vel.y = 9.2`) for aerial pursuit; airborne Tactical executes radial **Thunderfall Slam** | **PASS** |

---

## 4. Duo Synergy & Cinematic Duo Finishers (`DuoSynergySystem`)

- **Separate Resource**: `duoSynergy.meter` (`0..100`, cost `50`) is completely independent from Kai-Jax Convergence (`fusionCharge`).
- **Synergy Builders**: Partner AI assists (`+12`), Switch Combos (`+18`), Parry Intervention (`+20`), Parry Counter Follow-ups (`+22`), Web-into-Storm (`+24`), Storm-Launch-into-Web (`+24`), Multi-Enemy Takedowns (`+26`).
- **Activation Paths**:
  1. Dedicated HUD **DUO FINISHER** touch button (`min-h-[48px]`).
  2. Keyboard `[G]` shortcut.
  3. Simultaneous **Two-Button Chord** (`Attack + Tactical/Ability` within `0.18s`) on Touch, Keyboard, or Gamepad.
- **6 Canonical Duo Finishers**:
  - *Thunderweb Execution*, *Predator Crossfire*, *Storm Snare* (3+ crowd AoE), *Twin Fang Reversal* (Parry Counter window), *Apex Skyfall* (Airborne/Juggle), and *Memory Storm Convergence* (Fusion unlocked, preserving 3 physical tails).
- **Single-Application Impact Guarantee**: Verified across 30×50ms simulation steps in `gameSystems.test.ts` — each impact frame fires **strictly once** (`totalImpactsTriggered === finisher.impactTimes.length`), and `interruptDuoFinisher()` cleanly halts pending impacts on checkpoint reload.

---

## 5. Enemy Combat Director & All 6 Fang Syndicate Archetypes + Boss

| Archetype | Role & Counterplay | Status |
|---|---|---|
| **Basic Brawler (`brawler`)** | Core melee aggressor regulated by 2-token simultaneous windup cap | **PASS** |
| **Agile Dodger (`dodger`)** | Sidesteps 3+ consecutive repeated light attacks unless snared, wall-pinned, or struck by Heavy/Web | **PASS** |
| **Heavy Bruiser (`bruiser`)** | High armor (`85`), `0.45x` web-pull resistance, alternates parryable and unblockable slams | **PASS** |
| **Ranged Marksman (`marksman`)** | Pressures from `9.8m` perimeter; countered by Web Strike, Lightning Dash, or Predator Pull | **PASS** |
| **Shielded Defender (`shield`)** | Mounts visible translucent energy riot shield; blocks light strikes until broken by Guard Break or Web Pull | **PASS** |
| **Elite Assassin (`assassin`)** | High-speed twin-blade striker; parries 4+ consecutive identical light mash unless player mixes moves | **PASS** |
| **District Boss (`boss` — Fang Enforcer)** | Two-phase arena boss (`780 HP`, `190 Armor`), displacement-immune, triggers story-gated Kai-Jax Convergence at Phase 2 (`<= 55% HP`) | **PASS** |
