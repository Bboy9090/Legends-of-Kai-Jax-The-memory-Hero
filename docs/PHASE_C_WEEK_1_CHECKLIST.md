# Phase C Week 1: Kickoff & Fighter Asset Acquisition

**Duration:** Days 1-7 (Sept 1-7, 2026)  
**Focus:** Epic C1.1 & C1.3 (Fighter archetypes, asset acquisition, stats design)  
**Owner:** 3D Artist (primary), Game Designer, Engineer (support)

---

## Monday (Day 1): Phase C Kickoff

### Team Meeting (30 min)
- [ ] Review Phase C overview and 6-week roadmap
- [ ] Confirm team roles and responsibilities
- [ ] Walkthrough Phase C task breakdown
- [ ] Address questions and concerns
- [ ] Distribute all documentation

### Standup (15 min)
- [ ] Engineer: Prepare fighter integration environment
- [ ] 3D Artist: Begin asset search, finalize archetypes
- [ ] Game Designer: Create move set templates
- [ ] QA: Set up regression testing infrastructure

### Engineer Preparation
- [ ] Clone latest Phase B code (fix/model-rendering-clean branch)
- [ ] Verify OptimizedBeastModel component works with test fighter
- [ ] Set up fighter registry JSON structure (template)
- [ ] Create fighter loader pseudocode
- [ ] Prepare development environment for C1.2 work

### 3D Artist Starting C1.1
- [ ] Define 6 fighter archetypes:
  - [ ] **Velocity** — Speed demon (fast attacks, low health)
  - [ ] **Kaison** — Heavy hitter (slow, high damage)
  - [ ] **Voltage Fang** — Electric fighter (shock effects, medium)
  - [ ] **Steelwolf** — Tank (high defense, low damage)
  - [ ] **Ashen Tiger** — Technical master (complex combos)
  - [ ] **Blazing Fox** — Balanced (versatile)
- [ ] Create fighter reference sheet (visual style, silhouettes)
- [ ] Document animation requirements (11 core animations)
- [ ] Identify asset sources:
  - [ ] Meshy AI (if budget available)
  - [ ] Unity Asset Store (existing models)
  - [ ] Contractor artist (if time/budget permits)
  - [ ] Internal artist (if available)

### Game Designer Starting C1.3
- [ ] Define base stats template:
  - [ ] Health (50-200 range)
  - [ ] Speed (0.5-2.0 multiplier)
  - [ ] Strength (0.5-2.0 multiplier)
  - [ ] Defense (0.5-2.0 multiplier)
- [ ] Create per-archetype stat distributions:
  - [ ] Velocity: high speed, low health, medium strength
  - [ ] Kaison: low speed, high health, high strength
  - [ ] Voltage Fang: medium speed, medium health, high strength
  - [ ] Steelwolf: low speed, high health, high defense
  - [ ] Ashen Tiger: high speed, medium health, complex moveset
  - [ ] Blazing Fox: medium all stats (baseline)
- [ ] Document move set framework:
  - [ ] Light attack (fast, low damage, 5 frames)
  - [ ] Medium attack (medium speed/damage, 7 frames)
  - [ ] Heavy attack (slow, high damage, 10 frames)
  - [ ] Special ability (unique per fighter, 50 energy cost)
  - [ ] Dodge (invulnerability frames, low recovery)

---

## Tuesday (Day 2): Asset Research & Sourcing

### 3D Artist: Asset Sourcing
- [ ] Research Meshy AI capabilities and pricing
  - [ ] Create test prompt for one fighter
  - [ ] Evaluate quality vs. manual art
  - [ ] Estimate timeline (2-3 hours per fighter)
- [ ] Browse Unity Asset Store for existing fighter models
  - [ ] Search: "fighting game character", "humanoid fighter"
  - [ ] Filter by animation count (need 11+ clips)
  - [ ] Check licensing (commercial use OK?)
  - [ ] Note potential candidates
- [ ] Reach out to contractor artists (if applicable)
  - [ ] Send brief and examples
  - [ ] Request quotes for 6 fighters
  - [ ] Negotiate timeline (target: 3-4 days)
- [ ] Document findings in "Asset Sourcing Report"
  - [ ] Pros/cons per source
  - [ ] Cost estimates
  - [ ] Timeline estimates
  - [ ] Quality assessment

### Engineer: Fighter Integration Prep
- [ ] Create fighter registry template (JSON)
  ```json
  {
    "id": "fighter-id",
    "name": "Fighter Name",
    "archetype": "speed|heavy|electric|tank|technical|balanced",
    "model": { "gltfPath": "path/to/model.glb" },
    "animations": { "idle": {...}, "walk": {...}, ... },
    "stats": { "health": 100, "speed": 1.0, ... },
    "moves": [...]
  }
  ```
- [ ] Write fighter loader function (pseudocode)
- [ ] Test with Phase B Kai-Jax model
- [ ] Document animation clip naming convention
- [ ] Create validation checklist

### Game Designer: Move Set Details
- [ ] Create move spreadsheet template:
  - [ ] Move ID, name, type, animation, damage, speed, recovery
  - [ ] Per-archetype variations
  - [ ] Balance targets (no move > 100 damage)
- [ ] Draft Velocity move set:
  - [ ] Light: quick jab (10 damage, 0.4s)
  - [ ] Medium: combo punch (20 damage, 0.6s)
  - [ ] Heavy: spinning kick (35 damage, 0.8s)
  - [ ] Special: speed burst (50 damage + speed boost, 5s cooldown)
  - [ ] Dodge: forward evasion (0.3s recovery)
- [ ] Outline other fighter move sets (simplify for now)

---

## Wednesday (Day 3): Asset Acquisition Decision

### 3D Artist: Finalize Asset Plan
- [ ] Complete asset sourcing report
- [ ] Make acquisition decision:
  - Option A: Meshy AI (fast, cheaper, quality TBD)
  - Option B: Asset Store (proven quality, potentially cheaper)
  - Option C: Contractor artist (best quality, slower)
  - Option D: Hybrid (some from AI, some from store)
- [ ] Place orders/start projects immediately
- [ ] Document acquisition timeline and dependencies

### All Team: Status Sync (15 min)
- [ ] 3D Artist: Asset sourcing complete, orders placed
- [ ] Engineer: Fighter loader prepared, ready for integration
- [ ] Game Designer: Move sets drafted, stats template ready
- [ ] QA: Testing infrastructure prepared

### Engineer: Integration Environment Ready
- [ ] Verify fighter schema works with test assets
- [ ] Mock up first fighter JSON file
- [ ] Test loader against mock data
- [ ] Prepare for asset integration (starting C1.2 on Day 4)

---

## Thursday-Friday (Days 4-5): Asset Integration Begins (C1.2)

### 3D Artist: First Assets Arriving
- [ ] Receive first fighter model(s)
- [ ] Validate animation clips (count, naming, quality)
- [ ] Check for missing animations (checklist validation)
- [ ] Optimize model if needed (file size < 2MB)
- [ ] Export to GLTF format if necessary
- [ ] Deliver first fighter to Engineer for integration testing

### Engineer: Integration Testing (C1.2 Starting)
- [ ] Receive first fighter model from 3D Artist
- [ ] Create fighter JSON file from schema template
- [ ] Load model using fighter loader function
- [ ] Test in Training mode:
  - [ ] Fighter visible (no invisible glitch)
  - [ ] Animations play (idle, walk, attack)
  - [ ] No errors in console
  - [ ] Performance ≥57 fps on mobile viewport
- [ ] Debug any issues immediately
- [ ] Document integration process for batch 2

### Game Designer: Balancing Starts
- [ ] Finalize all 6 fighter move sets
- [ ] Create balance spreadsheet (win rates expectations)
- [ ] Define progression unlock levels
- [ ] Document cosmetic variants (colors per fighter)

---

## Friday-Saturday (Days 6-7): Week 1 Wrap-Up

### 3D Artist: Batch 1 Progress
- [ ] Target: 2-3 fighters ready by end of week
- [ ] Asset optimization complete
- [ ] Delivery to Engineer for integration

### Engineer: Integration Progress
- [ ] 2-3 fighters integrated and tested
- [ ] All visible, animating smoothly
- [ ] Performance benchmarked (57+ fps confirmed)
- [ ] Ready for C1.3 (stats/moves) implementation

### Game Designer: Move Set Finalization
- [ ] All 6 fighters move sets complete
- [ ] Balance spreadsheet reviewed
- [ ] Progression curve defined
- [ ] Ready for C1.4 (AI implementation)

### Team Standup (15 min)
- [ ] Review Week 1 progress
- [ ] Confirm Week 2 readiness
- [ ] Address blockers or delays
- [ ] Adjust timeline if needed

---

## Week 1 Success Criteria

✅ **C1.1 (Asset Acquisition):**
- Fighter archetypes finalized (6 characters defined)
- Asset sourcing plan complete (decision made: Meshy AI, Asset Store, contractor, etc.)
- First batch of fighters acquired or in progress
- Animation requirements documented and validated

✅ **C1.3 (Stats & Move Sets):**
- Move set templates created for all 6 fighters
- Damage/speed/recovery values documented
- Balance spreadsheet initialized
- Progression unlock plan documented

✅ **C1.2 (Integration) - Starting:**
- Fighter loader function created (pseudocode/code)
- Fighter JSON schema validated
- First fighter(s) successfully integrated and tested
- Performance baseline 57+ fps confirmed on test fighter

✅ **Infrastructure:**
- Fighter registry template ready
- Development environment set up
- Testing procedures documented
- Team communication channels active

---

## Go/No-Go Gate: End of Week 1

**If Week 1 succeeds:**
- ✅ GO to Week 2 (continue C1 + start C2)
- Proceed with remaining fighters (C1.2 continues)
- Begin combat polish prep (C2 planning)

**If blockers arise:**
- ❌ ASSESS: Is delay recoverable within Week 1?
- ❌ ESCALATE: If assets unavailable or quality issues
- ❌ PIVOT: Use backup asset sources if primary fails

---

## Week 1 Deliverables

**By End of Day 7:**
- Fighter archetypes defined + reference sheet
- Asset sourcing report complete
- First batch fighters acquired or in progress (target: 2-3)
- Fighter JSON schema + loader function ready
- Move set templates for all 6 fighters
- Balance spreadsheet initialized
- At least 1 fighter successfully integrated and tested
- Performance baseline: ≥57 fps confirmed

---

## Blockers & Contingencies

**Blocker: Assets not available**
- Contingency: Use Meshy AI + Unity Asset Store combination
- Timeline impact: +2-3 days if relying on contractor

**Blocker: Animation clip count mismatch**
- Contingency: Reuse animations from existing fighters or retarget
- Timeline impact: +1-2 days per fighter

**Blocker: Performance regression**
- Contingency: Optimize model file size, reduce texture resolution
- Timeline impact: +2-3 days for optimization

**Blocker: Schema validation fails**
- Contingency: Simplify schema, iterate on design
- Timeline impact: +1 day for refinement

---

## Communication Schedule

- **Daily:** 15 min standup (same time each day)
- **Wednesday EOD:** Status sync + asset decision
- **Friday EOD:** Week 1 review + Week 2 prep
- **Slack:** #phase-c-daily for async updates

---

## Next Week Preview (Week 2)

If Week 1 succeeds:
- C1.1 continues: Batch 2 fighters (remaining 3-4)
- C1.2 accelerates: All fighters integrated and tested
- C1.4 begins: AI opponent behavior + Training mode finalization
- C2 planning: Combat polish specs finalized

If Week 1 blocked:
- Resolve blockers immediately
- Adjust Week 2 timeline
- Escalate if recovery unlikely

---

**Week 1 Goal: Foundation for 6+ fighter roster complete. Team ramping to full velocity by Week 2.**
