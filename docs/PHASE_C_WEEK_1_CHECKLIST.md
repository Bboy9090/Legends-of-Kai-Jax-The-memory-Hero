# Phase C Week 1 — Canon Roster & Functional Integration

**Window:** Phase-relative Days 1-7  
**Primary objective:** Make the first canon fighters mechanically real without allowing prototype art, generic archetypes, or stale lore to become publication truth.  
**Primary game:** cinematic action-adventure.  
**Secondary mode:** Combat Arena / Training / Legends Archive.

> **Calendar correction:** Older Phase C files attached Week 1 to Sept 1-7 while a later execution status also called Sept 7 "Day 1." Those cannot both be true. This checklist therefore uses phase-relative days only until one authoritative Phase C Day 1 calendar date is chosen.

---

## Current Verified Foundation

The following work is already present on the active Phase C branch and must not be rewritten casually:

- [x] Kai shared keyboard/gamepad/touch gameplay input foundation
- [x] Kai single-position-owner locomotion architecture
- [x] Kai wall climb / Web Zip traversal foundation
- [x] Kai attack / venom lifecycle foundation
- [x] Jax Kar-Voth + Thryxen canon identity in gameplay code
- [x] Jax camera-relative ground and air movement
- [x] Jax ground/air displacement charge lifecycle
- [x] Jax full-path swept displacement collision
- [x] StormAirSystem as the single Jax vertical-physics authority
- [x] Jax attack lifecycle with deterministic timing and hit protection
- [x] Kai-Jax removed from default-unlocked public roster state
- [x] Story hero selection restricted to Kai/Jax normal protagonist use
- [x] Purchasable Nine-Tail / score-as-lineage progression removed from Character Ability UI
- [x] Combat Arena chronology rule documented
- [x] Phase C Fighter Schema v2 replaces the generic public speed/heavy/electric/tank template

These checks describe repository implementation state only. They do **not** prove final art, physical-device performance, App Store archive readiness, or complete story chronology.

---

## Day 1 — Canon Audit Before Asset Spend

### Game Designer

- [ ] Audit every current fighter candidate against the active publication/manuscript authority.
- [ ] Assign one status to every candidate:
  - `story-canon`
  - `historical-canon`
  - `arena-canon`
  - `prototype-only`
  - `canon-decision-required`
- [ ] Confirm current public priority:
  1. Kai
  2. Jax
  3. Boryn
  4. Borax
  5. Kai-Jax — story-gated
  6. current-authority Book One enemy/boss representative only when the exact source confirms it
- [ ] Keep Velocity, Kaison, Voltage Fang, Steelwolf, Ashen Tiger, and Blazing Fox as internal templates unless promoted by a current canon source.
- [ ] Record every unresolved lore point as **CANON DECISION REQUIRED** instead of filling it by invention.

### Engineer

- [x] Replace generic Phase C fighter schema with canon-safe schema.
- [ ] Wire runtime fighter definitions to schema v2 or create an explicit migration adapter.
- [ ] Keep public/save identity separate from legacy combat-profile aliases.
- [ ] Fail validation when prototype-only fighters are story-selectable.
- [ ] Fail validation when Kai-Jax base tail count is not exactly 3.
- [ ] Fail validation when story-gated lineage/tails are tied to XP, score, or currency.

### 3D / Character Artist

- [ ] Do not generate final meshes until fighter canon status and visual authority are known.
- [ ] Gather clean front/side/back/3-4 reference views where available.
- [ ] Confirm rig requirements before asset acquisition.
- [ ] For Kai, reject any base mesh/rig plan that cannot support four functional spider limbs.
- [ ] For Kai-Jax, reject any base model that starts with nine tails.

---

## Day 2 — Gameplay Identity Lock

Create a complete identity sheet for each fighter under active production.

Required fields:

- [ ] Movement identity
- [ ] Normal attack identity
- [ ] Heavy attack identity
- [ ] Launcher
- [ ] Aerial identity
- [ ] Defense
- [ ] Dodge
- [ ] Traversal ability
- [ ] Signature 1
- [ ] Signature 2
- [ ] Signature 3
- [ ] Ancestral ability
- [ ] Team / assist behavior
- [ ] Environment interaction
- [ ] Fusion interaction
- [ ] Ultimate / story-gated power
- [ ] Weakness
- [ ] Resource model
- [ ] Combat personality
- [ ] Technical difficulty

### Character Locks

#### Kai

- [ ] Memory-Web / Ember / Venom / Spider-limb mobility all represented.
- [ ] Four spider limbs affect locomotion or combat rather than existing as decoration.
- [ ] Wall movement and aerial redirection are part of traversal testing.
- [ ] Modern Raging City visual authority maintained.

#### Jax

- [ ] Storm / Lightning / Pressure / Displacement all represented.
- [ ] Jax movement remains distinct from Kai.
- [ ] Displacement remains traversal plus combat positioning, not a simple dash reskin.
- [ ] Air control remains under StormAirSystem authority.

#### Boryn

- [ ] Protection, interception, endurance, heavy retaliation, and sacrifice reflected mechanically.
- [ ] Do not use a generic slow-tank design as the final identity.

#### Borax

- [ ] Stances, parries/counters, storm discipline, precision displacement, and punish play represented.
- [ ] Do not solve mentor superiority by simply inflating damage and health.

#### Kai-Jax

- [ ] Base fusion = exactly 3 tails.
- [ ] Four spider limbs retained.
- [ ] All four ancestral lines represented.
- [ ] Story unlock remains required.
- [ ] Ninth tail remains late-story coronation only.

---

## Day 3 — Asset Sourcing Decision

### Required classification before acquisition

Every proposed asset must be tagged:

- [ ] CANON HERO
- [ ] CANON ALLY
- [ ] CANON ENEMY
- [ ] CANON HISTORICAL
- [ ] PROTOTYPE ONLY
- [ ] CANON DECISION REQUIRED

### Asset source decision

For each active fighter choose and document one path:

- [ ] project-original model
- [ ] Meshy base mesh / multi-view aid
- [ ] contractor model
- [ ] licensed asset-library base
- [ ] temporary placeholder

### Provenance

Before calling any asset production-ready, record:

- [ ] provider / artist
- [ ] asset origin
- [ ] license / terms
- [ ] commercial-use permission
- [ ] modification history
- [ ] evidence location
- [ ] approved visual-lock comparison

Meshy is a base-mesh aid only. It is not the authority for established character design or custom rig decisions.

---

## Days 4-5 — First Fighter Integration

### Priority integration order

Use the first assets that are actually ready and licensed, but prioritize:

1. Kai
2. Jax
3. Boryn or Borax

Do not delay Kai/Jax closure to polish prototype-only roster entries.

### Engineer checks per fighter

- [ ] Definition validates against Fighter Schema v2.
- [ ] Public ID is stable.
- [ ] Model loads without missing material/texture failures.
- [ ] Required animation clips exist.
- [ ] Character-specific appendage clips exist where required.
- [ ] Collision volume matches the visible body.
- [ ] Traversal ability works in a Raging City gameplay space.
- [ ] Combat state transitions do not create position-authority conflicts.
- [ ] Touch controls reach the same gameplay actions as keyboard/gamepad where intended.
- [ ] Arena use does not silently change story chronology.

### Performance

- [ ] Measure rather than estimate.
- [ ] Target 60 fps.
- [ ] Current Phase C acceptable integration floor: 57 fps.
- [ ] Record viewport/device/profile used for every measurement.
- [ ] Do not treat a desktop browser viewport as physical-phone evidence.

---

## Days 6-7 — Week 1 Closure

### Roster

- [ ] Six canon-aligned fighter definitions or explicit CANON DECISION REQUIRED slots exist.
- [ ] At least Kai and Jax are functionally distinct and playable in the intended test surface.
- [ ] First 2-3 final or near-final fighter assets are integrated **only if provenance and visual locks are complete**.
- [ ] Kai-Jax remains story-gated.
- [ ] Historical/deceased fighters use Archive/Memory/Training framing outside their literal chronology.

### Story-first integration

- [ ] One Raging City gameplay environment supports exploration/traversal testing.
- [ ] Kai and Jax produce meaningfully different traversal routes or tactics.
- [ ] Story Mode remains the primary navigation/product flow.
- [ ] Combat Arena remains a secondary chronology-safe mode.
- [ ] Memory mechanics are represented as gameplay requirements, not only menu lore.

### Engineering verification

- [ ] Typecheck passes on exact current head.
- [ ] Production build passes on exact current head.
- [ ] Unit tests pass on exact current head.
- [ ] Kai runtime smoke passes on exact current head.
- [ ] Jax runtime smoke passes on exact current head.
- [ ] Production preview smoke passes on exact current head.
- [ ] iOS native preflight passes if native files changed or the current gate requires it.
- [ ] No local-only screenshot or local file is counted as durable release evidence.

---

## Week 1 Go / No-Go Gate

### GO only when

- Six roster slots are canon-safe.
- Kai/Jax gameplay identities are clearly distinct.
- Kai four-limb requirements are protected.
- Kai-Jax three-tail base and story unlock are protected.
- Boryn/Borax chronology is protected.
- Prototype names are not public story canon.
- Asset provenance is recorded for anything being treated as production art.
- Exact-head automated verification is green.
- Performance evidence is measured on the stated profile/device.

### NO-GO when

- A prototype is being polished as a final fighter before canon classification.
- A missing source is being filled with invented lore.
- Kai is humanized or loses Myrr’Kai / spider-limb dominance.
- Jax becomes a generic electric speed archetype.
- Kai-Jax is selectable before the story unlock or rendered as default Nine-Tail.
- XP, score, or currency purchases lineage authority or tails.
- Historical/dead characters appear in literal present-story chronology without framing.
- Final assets lack commercial-use evidence.

---

## Week 1 Deliverable Package

By closure, the project should have:

- Canon roster audit
- Fighter Schema v2 definitions
- Kai/Jax/Boryn/Borax/Kai-Jax identity sheets
- Sixth enemy/boss slot sourced or explicitly marked CANON DECISION REQUIRED
- Story unlock rules
- Arena unlock/framing rules
- Tail/fusion progression rules
- Asset provenance ledger
- Animation/rig requirements
- First integrated fighter assets where legitimately ready
- Raging City traversal test surface
- Exact-head CI/runtime evidence
- Updated blocker list

No tag, release, merge, or App Store claim follows automatically from completing this checklist.