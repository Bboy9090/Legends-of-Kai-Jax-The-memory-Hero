# P1 ASHBLOCK HEIGHTS VERTICAL SLICE GAMEPLAY REPORT

**Project:** Legends of Kai-Jax: The Memory Hero  
**District:** Act I — Ashblock Heights (Playable Vertical Slice)  
**Status:** **PASS** (End-to-End Playable Loop Verified)

---

## 1. Continuous Playable Loop Verification

```
Title Showcase ──► Lead Predator Selection (Kai / Jax) ──► Ashblock Heights Entry
      ▲                                                            │
      │                                                            ▼
Return to Title ◄── Atomic Save v2 ◄── Mission Rewards ◄── 5-Stage Combat & Traversal
```

| Slice Stage | World Coordinates & Mechanics | Enemy / Interactive Entities | Status |
|---|---|---|---|
| **0. Title Showcase & Hero Selection** | 3D sanctuary lineup (`Boryn — Kai — Jax — Borax` rigged `.glb`s); explicit **Kai** vs **Jax** Lead Predator selector | Live `AnimationMixer` showcase + offline PWA/Save access | **PASS** |
| **1. Stage 0 — Ember Row Ambush** | Spawn `[0, 0, 8]` facing north down Ashblock avenue; destructible supply crates yield crafting materials + sustain HP | `Fang Brawler`, `Fang Agile Dodger`, `Fang Marksman` | **PASS** |
| **2. Stage 1 — Alley Civilian Rescue** | Unlocks `Web Evade` checkpoint `[0, 0, -14]`; rooftop wall-run & elevated container parkour | `Alley Shield Defender`, `Roof Dodger` + 2 trapped civilians (`[E]` / Touch Rescue) | **PASS** |
| **3. Stage 2 — Disrupted Memory Site** | Memory rift plaza `[12, 0, -35]`; reconstruct via `[E]` or Kai's `Memory Weave` (`[3]`) to earn Memory Fragment + `Memory Step` | `Memory Wraith Assassin`, `Syndicate Marksman` | **PASS** |
| **4. Stage 3 — Alley Gate Breach** | Fortified barrier `[0, 0, -48]`; clear defenders and breach gate to unlock `Web Swing` checkpoint `[0, 0, -52]` | `Gate Heavy Bruiser`, `Gate Shield Warden`, `Gate Marksman` | **PASS** |
| **5. Stage 4 — Fang Enforcer Boss & Convergence** | North Foundry Arena `[0, 0, -74]`; Phase 2 (`<= 55% HP`) triggers canonical **Kai-Jax Three-Tail Convergence** awakening | `Fang Enforcer` (2-Phase Boss) -> Victory Dialogue, XP/Ember/Thread Rewards, Cosmetic Unlocks & Patrol Skirmish Mode | **PASS** |

---

## 2. Traversal & Collision Boundaries

- **Outer Street Bounds**: Player and enemies clamped cleanly to `X ∈ [-21, 21]`, `Z ∈ [-89, 19]` (`moveWithColliders` + `resolveSafeHorizontalSlide`).
- **Walkable Rooftops & Shipping Containers**: `walkableTop` AABB resolution supports multi-tier vertical combat, aerial slams, and overhead Web Swing / Zipline anchors (`8` district web anchors validated via `validateGrappleAnchor`).
- **Wall Running**: Airborne lateral contact at `planarSpeed > 3.0 m/s` against `wallRunnable` facades reduces gravity (`3.5 m/s²`) and plays `Wall_Run` clip cleanly for up to `1.4s`.
- **Sanctuary Mentors**: `Boryn` (`borynMentorPos`) and `Borax` (`boraxMentorPos`) remain physically present and animated in Ashblock Heights without obstructing combat lanes.

---

## 3. Input & Accessibility Coverage

- **Android Touch Controls**: Virtual thumbstick + Sprint lock (bottom-left), swipe-to-orbit camera, multi-touch `onPointerDown` combat cluster (`Attack`, `Heavy`, `Jump / Web Swing`, `Web/Storm Tactical`, holdable `Block/Parry`, `1–3` Skills, `Lock`, `Switch`, `Fuse`, and contextual `Counter Strike` / `Duo Finisher` / `Interact` buttons), all meeting `>= 44×44px` hit targets with configurable HUD Scale (`0.75x–1.25x`), Opacity, and Safe-Area Edge Offset.
- **Keyboard Controls**: `WASD` Move, `Shift` Sprint, `Space` Jump/Web Swing, `J` Light, `K` Heavy, `U` Web/Storm Tactical, `Q` Hold Block / Tap Parry, `L` Dodge/Parry, `G` or `J+U` Duo Finisher, `1–3` Abilities, `Tab` Switch Brother, `F` Fuse, `R` Lock-On, `E` Interact, `Esc` Command Hub.
- **Gamepad Controls**: Edge-triggered `GamepadInputPoller` with conflict-free remapping (`Standard` and `Bumper Fighter` presets in Settings) + simultaneous `Attack + Tactical` chord detection.
