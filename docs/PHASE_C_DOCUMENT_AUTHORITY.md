# Phase C Document Authority

**Status:** ACTIVE  
**Purpose:** Prevent stale Phase C planning files from overriding the current book-canon, gameplay, schedule, and release truth.

This file is the entry point for any human or coding agent resuming Phase C work.

---

## Authority Order

When two project files disagree, use this order:

1. Current publication/manuscript canon and approved visual locks supplied by the project owner.
2. `docs/canon/BLOODWARD_VERSUS_ROSTER_AUDIT.md` for the current roster/source audit.
3. `docs/PHASE_C_FIGHTER_SCHEMA.md` for fighter-data and canon-status rules.
4. `docs/PHASE_C_TASKS.md` for the active 38-day execution plan.
5. `docs/PHASE_C_WEEK_1_CHECKLIST.md` for the active Week 1 gate.
6. Current verified runtime code and exact-head automated evidence.
7. Older Phase C status, kickoff, progress, briefing, or planning documents only as historical implementation notes.

Runtime code never gets to invent story canon merely because a legacy registry or placeholder already exists.

---

## Active Planning Documents

### `PHASE_C_FIGHTER_SCHEMA.md`

**ACTIVE.** Canon-safe Fighter Schema v2.

Use it for:
- canon status
- story vs Arena availability
- traversal identity
- ancestry fields
- fusion/tail rules
- rig requirements
- provenance
- validation rules

It supersedes the generic public `speed/heavy/electric/tank/technical/balanced` fighter template.

### `PHASE_C_TASKS.md`

**ACTIVE.** Phase-relative 38-day execution plan.

Use it for:
- C1 canon roster integration
- C2 combat polish
- C3 story progression/fusion/memory
- C4 content pipeline and missions
- C5 QA/native/release evidence

Older calendar mappings are not authoritative until a single real Phase C Day 1 date is locked.

### `PHASE_C_WEEK_1_CHECKLIST.md`

**ACTIVE.** Current Week 1 gate.

Use it for:
- Kai/Jax functional closure
- canon roster audit
- asset provenance
- first production assets
- Raging City traversal environment
- exact-head verification

### `docs/canon/BLOODWARD_VERSUS_ROSTER_AUDIT.md`

**ACTIVE SOURCE AUDIT.** Use it to distinguish publication-backed roster facts from prototype/legacy assumptions.

If it conflicts with a newer owner-supplied manuscript or approved visual lock, the newer owner-supplied source wins and this audit must be updated.

---

## Historical / Superseded Planning Documents

The following files may preserve useful implementation history, old measurements, commit references, or task provenance, but they are **NOT current design/canon/schedule authority**:

- `PHASE_C_CANON_PRODUCTION_PLAN.md`
- `PHASE_C_CORRECTED_WEEK_1_PLAN.md`
- `PHASE_C_DAY_1_2_STATUS.md`
- `PHASE_C_DAY_2_KICKOFF.md`
- `PHASE_C_EXECUTION_LOG.md` for old plan assertions; retain only as execution history
- `PHASE_C_KICKOFF_COMPLETE.md`
- `PHASE_C_TEAM_BRIEFING.md`
- `PHASE_C_WEEK_1_PROGRESS.md`
- `PHASE_C_FEATURE_FLAGS.md` where it describes obsolete fighter/public-canon assumptions
- older Day 2 / Kai MVP status documents where counts, dates, or readiness claims have been superseded

Do not delete useful historical evidence. Do not copy its stale claims forward either.

---

## Explicitly Quarantined Old Assumptions

These assumptions must not be treated as current public canon merely because older Phase C documents mention them:

- Velocity as a final fighter
- Kaison as a final fighter
- Voltage Fang as a final fighter
- Steelwolf as a final fighter
- Ashen Tiger as a final fighter
- Blazing Fox as a final fighter
- six generic fighter archetypes as the public roster
- XP, score, or currency granting ancestral authority, fusion, or tail progression
- Kai-Jax starting with nine tails
- Kai-Jax being a normal default Story Hub character swap
- an arena-first product structure
- invented Fang Syndicate enemy biology, equipment, backstory, ranks, drops, or exact behaviors without manuscript support
- any Ulgorr chronology/title/encounter claim not supported by the current publication source for that mission
- fixed Sept 1-7 / Sept 8-12 Phase C dates after later project status also called Sept 7 "Day 1"

Useful prototype code may survive behind internal/testing boundaries. Prototype facts do not become lore.

---

## Locked Character Rules

### Kai

- fully nonhuman heroic Beast-Kin
- equal dominant Myrr'Kai + Pyraxis
- four visible, functional spider limbs
- memory/web/venom plus ember/protection expression
- modern Raging City streetwear
- no humanization and no reduction of Myrr'Kai dominance

### Jax

- fully nonhuman heroic Beast-Kin
- dominant Kar-Voth + Thryxen
- storm/lightning/pressure/displacement/sovereignty
- movement identity distinct from Kai
- modern Raging City streetwear

### Boryn

- father/guardian/protector
- protection/interception/endurance/sacrifice identity
- later playability must not undo his canonical sacrifice

### Borax

- Storm Ronin mentor / second-father role
- precision/counters/parries/discipline/judgment identity
- must not erase Boryn's father role

### Kai-Jax

- story-earned fusion
- fully nonhuman
- four spider limbs
- all four ancestral lines
- exactly 3 tails in base fusion
- later tails are story/emotional progression
- ninth tail is a late coronation milestone, not an upgrade-store purchase

---

## Enemy / Boss Rule

Use established factions and source-backed enemies first:

- Fang Syndicate
- Anti-Sabertooth Covenant
- publication-confirmed ancient or story threats

If the exact Book One enemy, rank, appearance, weapon, power, encounter chronology, or boss identity is not supported by the current source, record:

**CANON DECISION REQUIRED**

Do not manufacture a `Fang Operative`, lieutenant rank, horn pattern, loot table, corpse-memory scene, or other lore detail simply to complete a design template.

---

## Schedule Rule

Use **Phase-relative Day 1-38** until the owner selects one authoritative calendar start.

Do not combine:
- "Sept 1 = Day 1"
with
- "Sept 7 = Day 1"

as if both are current.

Historical documents may retain the dates under which work was originally attempted, but current planning must not derive deadlines from those conflicting mappings.

---

## Release Truth Rule

A green automated workflow proves only what that workflow actually executes.

For PR #249, automated exact-head lanes may prove:
- typecheck/build/unit tests
- Combat Release Certification
- Kai runtime smoke
- Jax runtime smoke
- production preview smoke
- iOS simulator/native preflight

They do not automatically prove:
- signed App Store archive
- physical iPhone/iPad behavior
- App Store metadata/privacy/age-rating correctness
- final performance on every target device
- production asset ownership/licensing
- visual fidelity to the approved character sheets
- complete manuscript chronology

Never convert a partial proof into a release claim.

---

## Resume Rule

Before new Phase C work:

1. Read this authority file.
2. Read the active Fighter Schema, Tasks plan, and Week 1 checklist.
3. Check exact current branch head and main divergence.
4. Check exact-head workflows.
5. Preserve accepted Kai/Jax systems unless a verified bug requires a change.
6. Mark source gaps `CANON DECISION REQUIRED`.
7. After every code change, rerun the exact-head automated gates before claiming closure.

This authority file supersedes older Phase C planning files only where they conflict with the current canon, execution plan, calendar truth, or evidence rules.