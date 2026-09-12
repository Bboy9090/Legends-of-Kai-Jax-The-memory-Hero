# Phase C — 38-Day Canon Execution Plan

**Primary objective:** Turn the current Kai/Jax gameplay foundation into a story-first, canon-aligned playable roster and release-quality vertical slice without allowing prototype fighter templates, stale lore, or generic progression systems to overwrite the books.  
**Primary game:** cinematic action-adventure.  
**Secondary mode:** Combat Arena / Training / Legends Archive.  
**Schedule authority:** phase-relative Days 1-38. Older calendar mappings are stale until one authoritative Day 1 date is chosen.

---

## Current Repository Baseline

Already implemented and accepted on the active Phase C branch:

- Kai shared input foundation across keyboard/gamepad/touch
- Kai single-position-owner locomotion
- Kai wall climb / Web Zip traversal foundation
- Kai attack / venom lifecycle foundation
- Jax Kar-Voth + Thryxen identity
- Jax camera-relative ground/air movement
- Jax displacement charge lifecycle
- full-path swept displacement collision
- StormAirSystem as single vertical-physics authority
- Jax deterministic attack lifecycle and one-hit protection
- heavy pressure knockback and lightning forward-cone targeting
- Kai-Jax removed from default unlock state
- story hero select restricted to Kai/Jax normal protagonist use
- purchasable Nine-Tail / score-as-lineage progression removed from Character Ability UI
- chronology-safe Combat Arena framing documented
- Phase C Fighter Schema v2 installed

Do not rewrite these systems unless a failing test or verified design defect requires it.

---

# Epic C1 — Canon Roster & Fighter Integration

**Window:** Days 1-10  
**Milestone:** 4-6 canon-safe roster slots, Kai/Jax fully distinct, first 2-3 production-ready assets integrated when legitimately available.

## C1.1 Canon Roster Audit

- [ ] Classify every fighter as `story-canon`, `historical-canon`, `arena-canon`, `prototype-only`, or `canon-decision-required`.
- [ ] Keep Velocity, Kaison, Voltage Fang, Steelwolf, Ashen Tiger, and Blazing Fox internal unless current publication authority promotes them.
- [ ] Lock production priority:
  1. Kai
  2. Jax
  3. Boryn
  4. Borax
  5. Kai-Jax — story-gated
  6. current-authority Book One enemy/boss representative
- [ ] Record unresolved source gaps as **CANON DECISION REQUIRED**.
- [ ] Keep First Sabertooths locked until dedicated gameplay/visual/provenance work exists.

**Deliverable:** canon roster audit + public/internal classification table.

## C1.2 Fighter Definition Migration

- [ ] Migrate active fighter data to Fighter Schema v2 or build an explicit compatibility adapter.
- [ ] Keep public/save IDs separate from legacy combat profile aliases.
- [ ] Validate story availability, Arena framing, traversal identity, ancestry, rig requirements, provenance, and chronology.
- [ ] Reject Kai definitions without four functional spider-limb requirements.
- [ ] Reject Kai-Jax definitions whose base tail count is not exactly 3.
- [ ] Reject XP/score/currency gates for lineage authority or tail progression.

**Deliverable:** schema-valid definitions for active roster.

## C1.3 Gameplay Identity Completion

### Kai

- [ ] Memory-Web traversal and environmental tracing
- [ ] venom-charged melee
- [ ] ember/protection expression
- [ ] four spider limbs mechanically functional
- [ ] wall movement and aerial redirection
- [ ] rescue/protection interaction

### Jax

- [ ] storm pressure combat
- [ ] lightning targeting
- [ ] displacement traversal/combat positioning
- [ ] air control / hover identity
- [ ] knockback / space control
- [ ] clearly different movement rhythm from Kai

### Boryn

- [ ] protection/interception
- [ ] body-block or ally-defense identity
- [ ] endurance
- [ ] heavy retaliation
- [ ] sacrifice theme represented mechanically

### Borax

- [ ] storm-ronin stance system
- [ ] counters/parries
- [ ] deliberate displacement
- [ ] precision punish play
- [ ] mentor-level technical difficulty

### Kai-Jax

- [ ] story-unlocked only
- [ ] 3-tail base fusion
- [ ] four spider limbs
- [ ] all four ancestral lines represented
- [ ] fusion stability system, not ordinary character swap
- [ ] later tail progression left narrative-gated

**Deliverable:** complete gameplay identity sheets and move requirements.

## C1.4 Asset Sourcing & Rig Readiness

- [ ] Assign every asset CANON / HISTORICAL / PROTOTYPE / DECISION REQUIRED status before spending final-art time.
- [ ] Verify approved front/side/back/3-4 visual references.
- [ ] Record asset provider, source, license/terms, commercial-use permission, modifications, and evidence location.
- [ ] Use Meshy only as base mesh or multi-view aid.
- [ ] Use Blender/Maya/Control Rig/custom rigging where spider limbs, tails, cloth, mane, or special appendages require it.
- [ ] Build desktop and mobile LOD strategy from the same character authority.

**Deliverable:** provenance ledger + rig/animation checklist + first production assets.

## C1.5 Raging City Integration Surface

- [ ] Use at least one real gameplay environment in Raging City, not only a menu background.
- [ ] Support vertical traversal.
- [ ] Give Kai and Jax different route/tactic opportunities.
- [ ] Include environmental storytelling and memory interaction hooks.
- [ ] Keep Combat Arena separate from Story Mode chronology.

**Deliverable:** first book-authentic traversal/combat environment.

## C1 Go / No-Go — Day 10

GO only if:

- roster classifications are canon-safe
- Kai/Jax are mechanically distinct
- Kai four-limb requirement is protected
- Kai-Jax is still story-gated and 3-tail base
- Boryn/Borax chronology is preserved
- exact-head CI/runtime gates are green
- first assets have provenance
- measured performance target is 60 fps with current 57 fps Phase C floor

---

# Epic C2 — Combat Polish & Character Readability

**Window:** Days 11-15  
**Milestone:** responsive combat with character-specific feedback, no generic VFX drift.

## C2.1 Hit Readability

- [ ] tune hit stop and impact timing
- [ ] improve knockback readability
- [ ] preserve one-hit-per-target rules
- [ ] low-health readability
- [ ] guard/parry readability
- [ ] reduced-motion compatibility

## C2.2 Character-Specific VFX

VFX begins only after mechanics and canon identity are stable.

- [ ] Kai memory-web / venom / ember effects
- [ ] Jax storm pressure / lightning / displacement effects
- [ ] Boryn protection/intercept effects
- [ ] Borax ronin/storm counter effects
- [ ] Kai-Jax fused four-lineage effects only after story/fusion implementation requires them

Do not use a generic color swap as the final identity system.

## C2.3 Animation State Closure

- [ ] locomotion-to-combat transitions
- [ ] recovery timing
- [ ] aerial transitions
- [ ] traversal-to-combat transitions
- [ ] custom appendage states
- [ ] parry/counter states where applicable
- [ ] fusion entrance/exit handling

## C2.4 Audio

- [ ] impact audio
- [ ] traversal cues
- [ ] character-specific power cues
- [ ] accessibility volume behavior
- [ ] mobile audio behavior
- [ ] provenance for every production audio asset

## C2.5 Balance

- [ ] measure matchup behavior without erasing character identity
- [ ] tune startup/active/recovery windows
- [ ] tune stamina/resource costs
- [ ] preserve technical difficulty differences
- [ ] do not normalize all characters into the same speed/damage curve

**C2 Milestone — Day 15:** combat polish complete enough for progression/story integration.

---

# Epic C3 — Story Progression, Fusion & Memory

**Window:** Days 16-21  
**Milestone:** progression supports the books instead of turning lineage into an XP shop.

## C3.1 Profile Progression

Allowed:

- story mission completion
- district completion
- score/stat tracking
- cosmetics when provenance/visual authority permits
- Arena unlocks
- training records

Not allowed as lineage authority:

- XP buys fusion
- XP buys tails
- score buys bloodline powers
- currency buys the ninth tail
- arbitrary fighter level overrides story chronology

## C3.2 Fusion Stability

Build synchronization through:

- coordinated combat
- trust decisions
- assists
- memory discoveries
- story milestones
- emotional alignment

Early fusion should be less stable and more limited. Later progression may improve control and access only where the narrative supports it.

## C3.3 Tail Progression

- [ ] define TailDefinition as narrative progression data
- [ ] connect each tail to a verified story/emotional milestone
- [ ] preserve 3-tail base fusion
- [ ] keep ninth tail as coronation culmination
- [ ] never silently expose later tails in generic customization

## C3.4 Memory Gameplay

Implement or prototype:

- [ ] Memory Echo
- [ ] Memory Trace
- [ ] Memory Weave
- [ ] Memory Corruption
- [ ] Memory Choice
- [ ] Memory Combat

Memory attacks should be able to affect perception, objectives, map/knowledge, identity, or environment rather than only HP.

## C3.5 Story Unlock vs Arena Unlock

Every major character/form gets two separate rules:

- literal Story Mode availability
- chronology-safe Arena/Training availability

Boryn, historical fighters, First Sabertooths, and other impossible matchups must use Archive/Memory/Training framing where literal chronology would be false.

**C3 Milestone — Day 21:** progression live without canon drift.

---

# Epic C4 — Content Pipeline, Remaining Fighters & Story Missions

**Window:** Days 22-32

## C4.1 Fighter Registry Productionization

- [ ] schema validator
- [ ] loader compatibility layer
- [ ] versioning
- [ ] provenance fields enforced
- [ ] public/prototype separation
- [ ] failure messages for canon violations

## C4.2 Story Mission Pipeline

- [ ] mission chronology metadata
- [ ] required character knowledge state
- [ ] location state
- [ ] wounds/equipment/power state where relevant
- [ ] memory events
- [ ] cutscene/interaction hooks
- [ ] alternate route/traversal support

## C4.3 Enemy Faction Integration

Prioritize established canon factions before generic enemy races:

- Fang Syndicate
- Anti-Sabertooth Covenant
- current-authority ancient/boss threats

Enemy mechanics should express faction identity through pursuit, suppression, traps, bloodline exploitation, memory interference, or specialized counters.

## C4.4 Boss Design

Every boss encounter should include:

- emotional conflict
- reveal or consequence
- mechanical escalation
- environmental transformation where appropriate
- relationship/story payoff

Do not ship health-bar-only bosses as final story encounters.

## C4.5 Remaining Roster Batch

Only add fighters whose:

- canon status is resolved
- visual authority is resolved
- gameplay identity is resolved
- asset provenance is resolved
- chronology rules are resolved

Prototype-only fighters may remain in developer/test registries.

## C4.6 Telemetry

Track useful engineering/balance data without making analytics the design authority:

- FPS / frame-time
- crashes/errors
- move usage
- pick rate
- win rate
- traversal failure points
- fusion activation attempts
- memory mechanic completion/failure

---

# Epic C5 — Final QA, Native Readiness & Release Evidence

**Window:** Days 33-38  
**Milestone:** Phase C complete only when evidence matches claims.

## C5.1 Exact-Head Automated Verification

Required on the same current head:

- [ ] typecheck
- [ ] production build
- [ ] unit tests
- [ ] Combat Release Certification
- [ ] Kai runtime smoke
- [ ] Jax runtime smoke
- [ ] Production Preview Smoke
- [ ] iOS Native Preflight where applicable

## C5.2 Runtime QA

- [ ] Story navigation smoke
- [ ] Story Hero Select smoke
- [ ] Combat Arena smoke
- [ ] Training smoke
- [ ] Kai traversal/combat sequence
- [ ] Jax traversal/combat sequence
- [ ] fusion locked-state behavior
- [ ] fusion unlocked-state behavior on a controlled test profile when the story gate implementation is ready
- [ ] three-tail base visual check when final Kai-Jax asset exists
- [ ] memory UI/gameplay checks

## C5.3 Performance

- [ ] record actual device/profile/viewport
- [ ] target 60 fps
- [ ] document any Phase C 57 fps floor exceptions
- [ ] desktop/laptop flagship profile
- [ ] mobile LOD/touch profile

Browser viewport measurements do not substitute for physical-device validation.

## C5.4 iOS / App Store Preparation

Automated native preflight can prove build/simulator readiness only.

Separate Mac/device gates remain:

- [ ] Xcode archive/signing
- [ ] correct entitlements/capabilities
- [ ] physical iPhone/iPad smoke using an actually available device
- [ ] App Store metadata
- [ ] privacy disclosures
- [ ] age rating
- [ ] screenshots/previews
- [ ] final asset provenance

## C5.5 Release Truth Gate

Do not claim release candidate, tag, deploy, merge, or App Store readiness merely because one CI lane passes.

Phase C closes only when:

- exact-head automated gates are green
- runtime evidence is durable
- canon drift audit is clean
- asset provenance is complete
- performance claims are measured
- native/device evidence matches the stated platform claim
- unresolved items are explicitly listed rather than hidden

---

# Phase C Final Success Criteria — Day 38

- Kai and Jax are the unmistakable mechanical center.
- Story Mode remains primary and follows publication chronology.
- Combat Arena is secondary and chronology-safe.
- Kai has four functional spider limbs and Myrr’Kai + Pyraxis dominance.
- Jax has Kar-Voth + Thryxen storm/displacement identity.
- Boryn and Borax preserve father/mentor continuity.
- Kai-Jax is story-earned, starts with exactly 3 tails, and later tails remain narrative progression.
- Memory is represented as gameplay, not only lore text.
- Raging City functions as a real gameplay location.
- Prototype fighter templates remain quarantined unless current authority promotes them.
- Assets have provenance and commercial-use evidence.
- Performance and native claims are backed by exact evidence.
- No merge/tag/release claim outruns verification.

This plan supersedes the older generic Phase C roadmap built around six placeholder archetypes, XP-gated moves, and arena-first expansion.