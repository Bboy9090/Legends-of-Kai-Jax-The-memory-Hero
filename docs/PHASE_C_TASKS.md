# Phase C: Detailed Task Breakdown

**Phase C Duration:** 4-6 weeks (post-Phase-B deployment)  
**Start Condition:** Phase B stable in production (Gate 7 complete)  
**Objective:** 6+ fighters playable, combat polished, progression system live, content pipeline operational

---

## Week 1-2: Fighter Roster Expansion (Epic C1)

### C1.1: Fighter Asset Acquisition
- **Task:** Identify 4-6 fighter candidates (Velocity, Kaison, Voltage Fang, Steelwolf, Ashen Tiger, Blazing Fox)
- **Subtasks:**
  - [ ] Define fighter archetypes (speed, heavy, electric, tank, technical, balanced)
  - [ ] Source 3D models (Meshy AI, artist commissions, asset libraries)
  - [ ] Acquire animation clips (walk, idle, run, attack, dodge, hit, special)
  - [ ] Validate model file sizes (target: < 2MB per fighter to maintain mobile performance)
- **Deliverable:** 4-6 fighter model + animation packages ready for integration
- **Timeline:** Days 1-3
- **Owner:** 3D Artist + Engineer

### C1.2: Fighter Model Optimization & Integration
- **Task:** Integrate models into OptimizedBeastModel component without performance regressions
- **Subtasks:**
  - [ ] Add fighters to fighter registry (JSON config with stats, moves, animations)
  - [ ] Test rendering in Training Mode (verify visibility, no clipping, proper scale)
  - [ ] Benchmark performance per fighter (target: ≥57 fps on mobile viewport)
  - [ ] Create cosmetic variants (1-2 skins per fighter, reuse textures)
  - [ ] Add fallback detection (no missing animation clips)
- **Deliverable:** All 4-6 fighters playable in Training Mode, performance benchmarked
- **Timeline:** Days 4-7
- **Owner:** Engineer (1 FTE)
- **Dependencies:** C1.1 complete

### C1.3: Fighter Stats & Move Sets
- **Task:** Define unique stats and move lists for each fighter
- **Subtasks:**
  - [ ] Baseline stats template (health, speed, strength, defense ranges)
  - [ ] Per-fighter stat distribution (e.g., Velocity high speed/low health, Kaison low speed/high strength)
  - [ ] Move set design (4-6 attacks per fighter: light, medium, heavy, special ability)
  - [ ] Balance spreadsheet (win rate projections, damage calculations)
  - [ ] Animation clip mapping (map moves to clip names in model)
- **Deliverable:** Fighter stats document, move set spreadsheet, animation mapping
- **Timeline:** Days 3-6
- **Owner:** Game Designer (0.5 FTE)
- **Dependencies:** Partial overlap with C1.2

### C1.4: Versus Mode AI & Training Mode
- **Task:** Implement AI opponent behavior and Training Mode availability
- **Subtasks:**
  - [ ] Extend AI decision logic (opponent behavior per fighter archetype)
  - [ ] Balance difficulty settings (normal, hard for future phases)
  - [ ] Add fighters to Training Mode character select
  - [ ] Test AI responsiveness (no obvious exploitable patterns)
  - [ ] Mobile touch testing (UI responsive on small screens)
- **Deliverable:** All fighters playable in Versus (vs AI) and Training modes, AI functional
- **Timeline:** Days 6-9
- **Owner:** Engineer (1 FTE)
- **Dependencies:** C1.2, C1.3

### C1.5: Story Mode Integration (Foundation)
- **Task:** Add story intro sequences for new fighters
- **Subtasks:**
  - [ ] Write fighter bios and lore (100-200 words per fighter)
  - [ ] Create story intro UI (character name, lore display before matches)
  - [ ] Narrative branching setup (foundation for Phase D story campaigns)
  - [ ] Voice line placeholders (if voice-acted in later phases)
- **Deliverable:** Story intro text, UI component, narrative placeholder
- **Timeline:** Days 8-10
- **Owner:** Game Designer (0.5 FTE) + Engineer
- **Dependencies:** C1.1 complete

### C1 Milestone (End of Days 1-10)
- ✅ 4-6 fighters acquired and optimized
- ✅ All fighters playable in Training and Versus modes
- ✅ Performance ≥57 fps maintained on mobile viewport
- ✅ Move sets balanced and functional
- ✅ Story intros in place

---

## Week 2-3: Combat Polish & Feedback (Epic C2)

### C2.1: Hit Impact Effects
- **Task:** Implement visual and audio feedback on combat hits
- **Subtasks:**
  - [ ] Particle system setup (Three.js particles or custom shader)
  - [ ] Hit particle effects (blood, impact clouds per attack type)
  - [ ] Screen shake on impact (knockback distance → shake intensity)
  - [ ] Knockback physics (opponent pushed back on hit, distance varies by attack)
  - [ ] Health bar damage feedback (smooth health depletion animation)
  - [ ] Low HP warning (health bar red, pulse effect when health < 20%)
- **Deliverable:** Particle effects library, screen shake component, knockback physics
- **Timeline:** Days 11-13
- **Owner:** Engineer (1 FTE)

### C2.2: Audio System Implementation
- **Task:** Add sound effects for combat actions
- **Subtasks:**
  - [ ] Sound effect library (punch/kick impacts, dodge whoosh, hit reactions)
  - [ ] Audio manager setup (Web Audio API or Howler.js)
  - [ ] Trigger audio on game events (hit, dodge, victory, defeat)
  - [ ] Volume balancing (not too loud, responsive to action intensity)
  - [ ] Audio ducking (reduce background music when combat sound plays)
  - [ ] Mobile audio permissions (iOS/Android specific handling)
- **Deliverable:** Audio system functional, 6-8 SFX per fighter integrated
- **Timeline:** Days 12-14
- **Owner:** Audio Designer (0.25 FTE) + Engineer
- **Dependencies:** C2.1 (can overlap)

### C2.3: Animation Blending & State Transitions
- **Task:** Improve animation state machine for smoother combat flow
- **Subtasks:**
  - [ ] Refactor animation state logic (cleaner attack chaining)
  - [ ] Extend crossfade transitions (currently 0.3s, verify smooth on all fighters)
  - [ ] Add attack combo detection (chain light→medium→heavy seamlessly)
  - [ ] Recovery animation timing (ensure no stuck states between attacks)
  - [ ] Test all fighter move sequences (verify no animation glitches)
- **Deliverable:** Animation state machine v2, combo chaining working
- **Timeline:** Days 11-13
- **Owner:** Engineer (1 FTE)
- **Dependencies:** C1.3, C1.4

### C2.4: Visual Effects Library
- **Task:** Create reusable visual effect components for attacks
- **Subtasks:**
  - [ ] Effect prefab system (reusable component for different attack types)
  - [ ] Charge-up animations (special ability visual buildup)
  - [ ] Attack trail effects (sword/energy trails for special moves)
  - [ ] Explosion/impact effects (vary by fighter archetype)
  - [ ] Color customization (cosmetic skins affect effect colors)
- **Deliverable:** Effects library with 8-10 unique effects per archetype
- **Timeline:** Days 13-15
- **Owner:** Engineer (1 FTE)
- **Dependencies:** C2.1, C2.3

### C2.5: Move Set Rebalancing
- **Task:** Adjust damage, speed, recovery based on internal playtesting
- **Subtasks:**
  - [ ] Internal playtest matrix (all fighter matchups)
  - [ ] Win rate analysis (identify over/underpowered moves)
  - [ ] Damage adjustment (hotfix values in fighter registry)
  - [ ] Speed tuning (attack animation speed multipliers)
  - [ ] Recovery time balancing (punishment for missing attacks)
  - [ ] Special ability cost tuning (energy/cooldown values)
- **Deliverable:** Updated fighter stats, balance spreadsheet v2
- **Timeline:** Days 14-15 (ongoing, post-public-testing)
- **Owner:** Game Designer (0.5 FTE)
- **Dependencies:** C1.3, C1.4, C2.1-C2.4

### C2 Milestone (End of Days 11-15)
- ✅ Combat feels responsive and satisfying
- ✅ Hit feedback clear (visual + audio)
- ✅ Animation smooth (no jank in state transitions)
- ✅ Move sets rebalanced based on playtesting
- ✅ Audio responsive and not overbearing

---

## Week 3-4: Progression System (Epic C3)

### C3.1: XP & Leveling System
- **Task:** Implement fighter-specific leveling
- **Subtasks:**
  - [ ] XP reward calculation (XP earned per win/loss/time played)
  - [ ] Level cap per fighter (suggested: 20-30 for each fighter)
  - [ ] XP bar UI (progress indicator on fighter select screen)
  - [ ] Level-up milestone rewards (cosmetics, move unlocks)
  - [ ] Zustand store extension (track levels per fighter, persistence)
- **Deliverable:** XP/leveling logic, UI components, persistence layer
- **Timeline:** Days 16-18
- **Owner:** Engineer (1 FTE)

### C3.2: Move Unlocks & Progression Rewards
- **Task:** Gate special moves behind progression
- **Subtasks:**
  - [ ] Move unlock table (which moves unlock at which levels)
  - [ ] Unlock notification UI (visual feedback on level-up)
  - [ ] Cosmetic rewards (skins unlock every 5 levels)
  - [ ] Achievement integration (bonus XP for milestones)
  - [ ] Cosmetic preview (show locked cosmetics in shop)
- **Deliverable:** Move unlock logic, cosmetic reward system
- **Timeline:** Days 17-19
- **Owner:** Engineer (1 FTE)
- **Dependencies:** C3.1

### C3.3: Cosmetic System (Skins & Variants)
- **Task:** Design and implement cosmetic customization
- **Subtasks:**
  - [ ] Cosmetic metadata (color variants, effect overlays)
  - [ ] Cosmetic UI selector (preview before applying)
  - [ ] Texture swapping (load alternate skins per fighter)
  - [ ] Effect customization (colors match cosmetic theme)
  - [ ] Limited cosmetics (timed exclusives for special events)
  - [ ] Cosmetic persistence (save selected cosmetic per fighter)
- **Deliverable:** Cosmetics system, 1-2 cosmetics per fighter
- **Timeline:** Days 18-20
- **Owner:** Engineer (1 FTE)
- **Dependencies:** C1.2 (models/textures)

### C3.4: Save & Cloud Sync (Phase 1)
- **Task:** Implement persistent player progression (local first)
- **Subtasks:**
  - [ ] LocalStorage schema (fighter levels, cosmetics, wins/losses)
  - [ ] Save/load logic (Zustand ↔ LocalStorage)
  - [ ] Data validation (handle corrupted data gracefully)
  - [ ] Cloud sync foundation (prepare API endpoint for Phase D)
  - [ ] Cross-device preparation (structure for backend sync later)
- **Deliverable:** LocalStorage persistence working, cloud API scaffold
- **Timeline:** Days 16-18
- **Owner:** Engineer (1 FTE)

### C3.5: Daily Challenges
- **Task:** Add repeating daily objectives for engagement
- **Subtasks:**
  - [ ] Challenge generation logic (3-5 daily challenges)
  - [ ] Challenge types (win N fights, use specific fighter, perform combo)
  - [ ] Reward calculation (bonus XP, cosmetics, currency)
  - [ ] UI display (challenge list with progress bars)
  - [ ] Streak tracking (consecutive daily completion rewards)
  - [ ] Reset logic (challenges refresh daily at UTC midnight)
- **Deliverable:** Daily challenge system, UI, reward distribution
- **Timeline:** Days 19-21
- **Owner:** Engineer (1 FTE)
- **Dependencies:** C3.1

### C3.6: Leaderboard (Local)
- **Task:** Track and display player statistics
- **Subtasks:**
  - [ ] Statistics tracking (wins, losses, win rate per fighter)
  - [ ] Leaderboard sort options (total wins, win rate, most played)
  - [ ] Leaderboard UI (top 10 display, personal rank)
  - [ ] Statistics per-fighter (pick rate, win rate heatmap)
  - [ ] Analytics export (prepare telemetry data format)
- **Deliverable:** Leaderboard UI, stats aggregation logic
- **Timeline:** Days 20-21
- **Owner:** Engineer (1 FTE)
- **Dependencies:** C3.1, C3.4

### C3 Milestone (End of Days 16-21)
- ✅ XP/leveling system functional
- ✅ Progression visible and rewarding (levels, cosmetics, unlocks)
- ✅ Daily challenges driving engagement
- ✅ Cosmetic system functional
- ✅ Data persists locally
- ✅ Players have long-term progression goals

---

## Week 4-6: Live Content Pipeline & Final Polish (Epic C4)

### C4.1: Fighter Registry Refactor
- **Task:** Create standardized fighter template for rapid future additions
- **Subtasks:**
  - [ ] Fighter JSON schema (standardized format)
  - [ ] Registry loader (parse and validate fighter definitions)
  - [ ] Migration script (convert existing fighters to schema)
  - [ ] Validation rules (enforce required fields, stats ranges)
  - [ ] Versioning (support schema updates without breaking)
  - [ ] Documentation (fighter creation guide for future teams)
- **Deliverable:** Fighter template schema, loader, documentation
- **Timeline:** Days 22-24
- **Owner:** Engineer (1 FTE)

### C4.2: Feature Flags & A/B Testing
- **Task:** Implement feature flag system for safe deployment
- **Subtasks:**
  - [ ] Feature flag library setup (custom or LaunchDarkly-like)
  - [ ] Fighter feature flags (enable/disable per fighter without code change)
  - [ ] Balance experiment flags (A/B test move set variations)
  - [ ] Admin UI (toggle flags in development/staging)
  - [ ] Telemetry conditional logging (track flag state in analytics)
  - [ ] Rollback procedure (disable broken fighters instantly)
- **Deliverable:** Feature flag system, admin UI, documentation
- **Timeline:** Days 22-25
- **Owner:** Engineer (1 FTE)

### C4.3: Telemetry Collection
- **Task:** Instrument game for performance and balance data
- **Subtasks:**
  - [ ] Event telemetry system (log gameplay events)
  - [ ] Analytics events (fighter picks, move usage, wins/losses)
  - [ ] Performance monitoring (FPS drops, crash reporting)
  - [ ] Balance metrics (win rate per fighter, move usage frequency)
  - [ ] Retention tracking (DAU, session length, churn rate)
  - [ ] Dashboard preparation (charts for win rates, pick rates, crashes)
- **Deliverable:** Telemetry collection system, analytics events, Firebase/Supabase integration
- **Timeline:** Days 23-26
- **Owner:** Engineer (1 FTE)

### C4.4: Content Deployment Pipeline
- **Task:** Create process for adding new fighters without code deployments
- **Subtasks:**
  - [ ] CI/CD integration (automated fighter validation)
  - [ ] Staging environment (test new fighters before production)
  - [ ] Deployment automation (trigger fighter rollout from admin UI)
  - [ ] Rollback automation (revert broken fighters in <5 minutes)
  - [ ] Documentation (runbook for adding new fighters monthly)
  - [ ] Training (document for future content creators)
- **Deliverable:** Deployment pipeline, documentation, runbook
- **Timeline:** Days 24-27
- **Owner:** Engineer (1 FTE)
- **Dependencies:** C4.1, C4.2

### C4.5: Remaining Fighters (Batch 2)
- **Task:** Ship final 2-3 fighters (after initial testing phase)
- **Subtasks:**
  - [ ] Acquire remaining fighter assets (if batch 1 complete)
  - [ ] Integrate and test (using C1.2-C1.4 process)
  - [ ] Balance adjustments (based on Batch 1 telemetry)
  - [ ] Cosmetics for Batch 2 (1-2 skins per fighter)
  - [ ] Story intros for Batch 2
- **Deliverable:** Batch 2 fighters playable, all 6+ fighters in roster
- **Timeline:** Days 25-32 (parallel with C4.1-C4.3)
- **Owner:** 3D Artist (1 FTE), Engineer (parallel)
- **Dependencies:** C1.4, C2.4

### C4.6: Mobile Optimization Pass
- **Task:** Ensure full roster maintains 57+ fps on mobile
- **Subtasks:**
  - [ ] Profile full roster on all devices (iPhone SE, iPhone 12, iPad)
  - [ ] Identify bottlenecks (animation count, particle effects)
  - [ ] Texture atlasing (combine fighter textures to reduce draw calls)
  - [ ] Animation memory pooling (reuse animation clips across fighters)
  - [ ] Particle optimization (reduce effect count on low-end devices)
  - [ ] Load time measurement (target: < 6 seconds for full roster)
- **Deliverable:** Performance report, optimized build hitting 57+ fps
- **Timeline:** Days 28-32
- **Owner:** Engineer (1 FTE)
- **Dependencies:** C4.5, C1 complete

### C4.7: Performance Testing Automation
- **Task:** Extend Phase B2/B3 tests to cover full roster
- **Subtasks:**
  - [ ] Extend Playwright e2e tests (all fighters in Training/Versus)
  - [ ] Performance regression detection (fail if fps < 57)
  - [ ] Animation auditing (visual regression testing framework)
  - [ ] Balance telemetry validation (ensure metrics collecting)
  - [ ] CI integration (run on every commit)
- **Deliverable:** Extended e2e test suite, automated performance gates
- **Timeline:** Days 29-32
- **Owner:** Engineer (1 FTE)
- **Dependencies:** C1 complete

### C4.8: Balance & Polish
- **Task:** Final iteration based on playtesting and telemetry
- **Subtasks:**
  - [ ] Analyze telemetry (win rates, pick rates, engagement)
  - [ ] Balance hotfixes (adjust OP/underpowered moves)
  - [ ] Animation polish (fix edge cases in state transitions)
  - [ ] Audio tuning (balance SFX levels across devices)
  - [ ] UI polish (responsive on all mobile sizes)
  - [ ] Documentation (known issues, future improvements)
- **Deliverable:** Balance patch v1, polish pass complete
- **Timeline:** Days 30-35
- **Owner:** Game Designer (0.5 FTE), Engineer (parallel)
- **Dependencies:** C2, C3, C4.1-C4.7

### C4.9: QA & Device Testing
- **Task:** Final validation before Phase D handoff
- **Subtasks:**
  - [ ] Regression testing (no Phase B issues resurface)
  - [ ] Cross-device testing (iOS, Android, iPad, desktop)
  - [ ] Edge case testing (network latency, battery saver mode)
  - [ ] Accessibility testing (font sizes, contrast, touch targets)
  - [ ] Performance ceiling validation (consistent 57+ fps after optimizations)
  - [ ] Final sign-off (no critical bugs)
- **Deliverable:** QA report, final test results
- **Timeline:** Days 33-38
- **Owner:** QA Lead (0.5 FTE)
- **Dependencies:** C4.5, C4.6, C4.8

### C4 Milestone (End of Days 22-38)
- ✅ Live content pipeline operational
- ✅ 6+ fighters shipped and balanced
- ✅ Performance maintained (57+ fps on full roster)
- ✅ Telemetry collecting (balance data ready for Phase D)
- ✅ Deployment process documented
- ✅ Ready to launch Phase D (story, multiplayer, monetization)

---

## Phase C Task Summary by Week

```
WEEK 1-2: FIGHTER ROSTER EXPANSION
├─ C1.1: Asset acquisition (Days 1-3)
├─ C1.2: Integration & optimization (Days 4-7)
├─ C1.3: Stats & move sets (Days 3-6)
├─ C1.4: AI & Training mode (Days 6-9)
└─ C1.5: Story intros (Days 8-10)
   Milestone: 4-6 fighters playable, 57+ fps verified

WEEK 2-3: COMBAT POLISH
├─ C2.1: Hit effects (Days 11-13)
├─ C2.2: Audio system (Days 12-14)
├─ C2.3: Animation blending (Days 11-13)
├─ C2.4: Effects library (Days 13-15)
└─ C2.5: Move rebalancing (Days 14-15)
   Milestone: Combat responsive, feedback clear, audio integrated

WEEK 3-4: PROGRESSION SYSTEM
├─ C3.1: XP & leveling (Days 16-18)
├─ C3.2: Move unlocks (Days 17-19)
├─ C3.3: Cosmetics (Days 18-20)
├─ C3.4: Save/persistence (Days 16-18)
├─ C3.5: Daily challenges (Days 19-21)
└─ C3.6: Leaderboards (Days 20-21)
   Milestone: Progression visible, players incentivized for replay

WEEK 4-6: LIVE CONTENT PIPELINE & POLISH
├─ C4.1: Fighter registry refactor (Days 22-24)
├─ C4.2: Feature flags (Days 22-25)
├─ C4.3: Telemetry (Days 23-26)
├─ C4.4: Deployment pipeline (Days 24-27)
├─ C4.5: Remaining fighters (Days 25-32, parallel)
├─ C4.6: Mobile optimization (Days 28-32)
├─ C4.7: Testing automation (Days 29-32)
├─ C4.8: Balance & polish (Days 30-35)
└─ C4.9: QA sign-off (Days 33-38)
   Milestone: Pipeline operational, 6+ fighters shipped, 57+ fps maintained
```

---

## Resource Allocation

**Full-Time (1 FTE each):**
- Engineer (integration, optimization, systems): Days 1-38 (continuous)
- 3D Artist (models, animations): Days 1-32 (fighter acquisition + batch 2)
- QA Lead (testing, device validation): Days 25-38 (late phase focus)

**Part-Time (0.5 FTE):**
- Game Designer (stats, balance, progression design): Days 3-35
- QA Tester (regression, mobile testing): Days 1-38 (parallel, lighter load than QA lead)

**Part-Time (0.25 FTE):**
- Audio Designer (SFX acquisition, system setup): Days 12-14 (concentrated)

**Total headcount:** ~4.5 FTE average, peaking at ~5.5 FTE Weeks 3-4

---

## Success Criteria (Phase C Completion)

- ✅ 6+ fighters playable across Training, Versus, Story modes
- ✅ Combat responsive (57+ fps on mobile, <50ms touch latency)
- ✅ Progression incentivizes replay (levels, cosmetics, unlocks visible)
- ✅ Daily challenges driving engagement (playable, rewarding)
- ✅ Live content pipeline working (new fighters can be added monthly post-launch)
- ✅ Performance stable (no regressions from Phase B)
- ✅ Telemetry collecting (balance data, usage patterns, retention metrics)
- ✅ Zero critical bugs in final QA pass
- ✅ Deployment process documented and tested

---

## Go/No-Go Decision Points

**End of Week 1-2 (Day 10):**
- ✅ GO if all 4-6 fighters playable, performance ≥57 fps
- ❌ NO-GO if critical rendering or performance regressions

**End of Week 2-3 (Day 15):**
- ✅ GO if combat feels satisfying, audio integrated, animation smooth
- ❌ NO-GO if major animation glitches or balance issues

**End of Week 3-4 (Day 21):**
- ✅ GO if progression system complete, cosmetics functional, daily challenges live
- ❌ NO-GO if save/persistence broken or progression felt hollow

**End of Phase C (Day 38):**
- ✅ GO if all success criteria met, QA sign-off complete
- ❌ NO-GO if critical bugs found, performance regressed, or pipeline broken
- → Proceed to Phase D (story expansion, multiplayer, monetization)

---

## Handoff to Phase D

Upon Phase C completion:
1. **Telemetry dashboard** ready (win rates, pick rates, balance insights)
2. **Fighter template system** documented (process for new fighters monthly)
3. **6+ character roster** stable and balanced (foundation for story campaigns)
4. **Performance baseline** established (57+ fps confirmed on full roster)
5. **Player retention** metrics available (DAU, session length, cosmetic adoption)

**Phase D begins with:** Story campaign writing for all 6+ fighters, backend multiplayer architecture, monetization system design.
