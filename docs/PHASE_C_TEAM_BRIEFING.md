# Phase C: Team Briefing & Resource Plan

**Phase C Duration:** 4-6 weeks (starting after Phase B deployed to production)  
**Objective:** 6+ fighters playable, combat polished, progression system live, content pipeline operational  
**Status:** Pre-execution, ready to brief team

---

## Executive Summary

Phase B (rendering fix, animation polish, mobile performance) is code-complete and awaiting final hardware validation (Gate 5: live device testing on iOS/Android). Once Phase B deploys to production, Phase C begins immediately with simultaneous parallel epics:

- **C1 (Weeks 1-2):** Fighter roster expansion — acquire and integrate 4-6 new fighters
- **C2 (Weeks 2-3):** Combat polish — hit effects, audio, animation blending
- **C3 (Weeks 3-4):** Progression system — XP, cosmetics, daily challenges, leaderboards
- **C4 (Weeks 4-6):** Live content pipeline — telemetry, feature flags, deployment automation, final QA

**Success means:** 6+ fighters playable, 57+ fps maintained, progression incentivizes replay, content pipeline ready for monthly fighter additions post-launch.

---

## Team Composition & Allocation

### Full-Time (1 FTE each)

**Engineer** (Integration, Optimization, Systems)
- Primary owner for fighter integration (C1.2), animation blending (C2.3), XP system (C3.1)
- Supports C2 (effects library), C3 (cosmetics, save/load), C4 (telemetry, feature flags)
- Continuous availability Weeks 1-6
- Responsible for performance regression testing and mobile optimization
- Manages git, CI/CD, code quality gates

**3D Artist** (Models, Animations)
- Owns fighter asset acquisition (C1.1), model optimization (C1.2)
- Supports cosmetic creation (C3.3), batch 2 fighters (C4.5)
- Weeks 1-10 (includes batch 2), then optional support for Phase D
- Delivers: 4-6 fighter packages with animations + cosmetics

**QA Lead** (Testing, Device Validation)
- Owns regression testing (C4.9), cross-device testing (C4.9)
- Supports C1.4 (AI/training mode testing), C2 (combat polish QA)
- Weeks 3-6 (front-loaded after code stabilizes)
- Delivers: QA report, sign-off on Phase C completion

### Part-Time (0.5 FTE each)

**Game Designer** (Stats, Balance, Progression Design)
- Owns move set design (C1.3), rebalancing (C2.5), progression design (C3.1-C3.6)
- Weeks 1-5 (balance ongoing)
- Delivers: Fighter stats doc, balance spreadsheet, progression design

**QA Tester** (Regression, Mobile Testing)
- Supports C1.4 (AI behavior), C2 (animation edge cases), C3 (progression testing)
- Weeks 1-6 (parallel with QA Lead, lighter load)
- Delivers: Test case coverage, mobile regression reports

### Part-Time (0.25 FTE)

**Audio Designer** (SFX Acquisition, System Setup)
- Owns audio system setup (C2.2), SFX library curation
- Weeks 2-3 (concentrated)
- Delivers: Audio system, 6-8 SFX per fighter, audio balance

---

## Dependency Map

```
Phase B (Stable in Production)
│
├─ C1.1: Fighter Asset Acquisition (Days 1-3)
│  ├─→ C1.2: Integration (Days 4-7)
│  ├─→ C1.3: Stats & Move Sets (Days 3-6)
│  └─→ C1.4: Versus AI (Days 6-9)
│
├─ C2.1: Hit Effects (Days 11-13)
│  ├─→ C2.2: Audio System (Days 12-14)
│  ├─→ C2.3: Animation Blending (Days 11-13)
│  ├─→ C2.4: Effects Library (Days 13-15)
│  └─→ C2.5: Rebalancing (Days 14-15)
│
├─ C3.1: XP System (Days 16-18)
│  ├─→ C3.2: Move Unlocks (Days 17-19)
│  ├─→ C3.3: Cosmetics (Days 18-20)
│  ├─→ C3.4: Save/Load (Days 16-18)
│  ├─→ C3.5: Daily Challenges (Days 19-21)
│  └─→ C3.6: Leaderboards (Days 20-21)
│
└─ C4: Pipeline (Weeks 4-6, parallel execution)
   ├─ C4.1: Fighter Registry Refactor (Days 22-24)
   ├─ C4.2: Feature Flags (Days 22-25)
   ├─ C4.3: Telemetry (Days 23-26)
   ├─ C4.4: Deployment Pipeline (Days 24-27)
   ├─ C4.5: Batch 2 Fighters (Days 25-32, parallel)
   ├─ C4.6: Mobile Optimization (Days 28-32)
   ├─ C4.7: Testing Automation (Days 29-32)
   ├─ C4.8: Balance & Polish (Days 30-35)
   └─ C4.9: QA Sign-Off (Days 33-38)
```

**Critical Path:** C1.1 → C1.2 → C1.4 (Days 1-9) → C2 (Days 11-15) → C3 (Days 16-21) → C4 (Days 22-38)

**Parallel Work:** C1, C2, C3, C4 phases overlap significantly (Weeks 2-4) to meet 6-week timeline.

---

## Weekly Milestones & Go/No-Go Gates

### Week 1-2: Fighter Roster Expansion (C1)

**Deliverables by Day 10:**
- ✅ 4-6 fighter models acquired (Meshy AI, artist, or commissions)
- ✅ All fighter animations integrated (walk, idle, run, attacks, special, dodge, hit, victory, defeat)
- ✅ Fighters playable in Training and Versus modes
- ✅ AI opponent behavior implemented
- ✅ Story intros written for each fighter
- ✅ Performance baseline: ≥57 fps on mobile viewport

**Go/No-Go Gate:**
- ✅ GO if all 4-6 fighters visible, animated, performance ≥57 fps
- ❌ NO-GO if critical rendering regressions or performance < 30 fps
  - Action: Debug OptimizedBeastModel, investigate animation load performance

**Team Sync:** Daily stand-ups (15 min)

---

### Week 2-3: Combat Polish (C2)

**Deliverables by Day 15:**
- ✅ Hit particle effects and screen shake working
- ✅ Audio system integrated, SFX triggered on hit/dodge/victory
- ✅ Animation blending smooth (0.3s crossfade on all transitions)
- ✅ Move sets rebalanced based on playtesting
- ✅ Combat feels responsive and satisfying

**Go/No-Go Gate:**
- ✅ GO if combat feels good, feedback clear, animation smooth
- ❌ NO-GO if major animation glitches or audio system broken
  - Action: Emergency hotfix on animation state machine or audio timing

**Team Sync:** Daily stand-ups

---

### Week 3-4: Progression System (C3)

**Deliverables by Day 21:**
- ✅ XP/leveling system functional (levels track per fighter)
- ✅ Move unlocks working (special moves unlock at higher levels)
- ✅ Cosmetic system functional (1-2 skins per fighter)
- ✅ Save/persistence working (LocalStorage + cloud scaffold)
- ✅ Daily challenges live (3-5 per day, rewarding)
- ✅ Leaderboards displaying (top 10, personal rank)

**Go/No-Go Gate:**
- ✅ GO if progression system complete, cosmetics look good, save/load reliable
- ❌ NO-GO if save/persistence broken or progression felt hollow
  - Action: Troubleshoot LocalStorage integration, redesign progression rewards

**Team Sync:** Daily stand-ups

---

### Week 4-6: Live Content Pipeline & Polish (C4)

**Deliverables by Day 38:**
- ✅ Fighter registry refactored to JSON schema (no code changes to add fighters)
- ✅ Feature flags system working (can enable/disable fighters remotely)
- ✅ Telemetry collecting (win rates, pick rates, move usage)
- ✅ Remaining fighters integrated (batch 2: final 2-3 fighters)
- ✅ Full roster optimized (6+ fighters, 57+ fps)
- ✅ Performance testing automated (e2e tests for regression)
- ✅ Balance pass complete (move sets tuned per telemetry)
- ✅ QA sign-off complete (zero critical bugs)

**Go/No-Go Gate:**
- ✅ GO if all success criteria met, QA sign-off, ready for Phase D
- ❌ NO-GO if critical bugs found, performance regressed, or pipeline broken
  - Action: Major bug fix or architecture adjustment before Phase D

**Team Sync:** 3x per week (scope larger, more coordination needed)

---

## Communication Plan

### Daily (All Team)
- **15 min stand-up:** Status, blockers, help needed
- **Channel:** Slack #phase-c-daily
- **Attendees:** Engineer, 3D Artist, Game Designer, QA Lead
- **Topics:** Yesterday done, today's plan, blockers

### Weekly (Core Team)
- **Monday 10:00 AM:** Week planning + goal review
- **Format:** 30 min call
- **Attendees:** All full-time + part-time leads
- **Topics:** Week priorities, dependency alignment, resource needs

### Bi-Weekly (Leads + Leadership)
- **Wednesday 3:00 PM:** Progress review + business metrics
- **Format:** 45 min call
- **Attendees:** Engineer, 3D Artist, Game Designer, QA Lead, Project Lead, Leadership
- **Topics:** Phase progress, blockers, scope adjustments, budget impact

### Weekly (Balance Focused)
- **Thursday 2:00 PM:** Balance review + telemetry deep-dive (Weeks 4-6 only)
- **Format:** 30 min call
- **Attendees:** Game Designer, Engineer, QA Lead
- **Topics:** Fighter win rates, move usage, balance changes needed

---

## Success Criteria (Phase C Completion)

**Gameplay:**
- ✅ 6+ fighters playable in Training, Versus, and Story modes
- ✅ Combat responsive (57+ fps on mobile, <50ms touch latency)
- ✅ All move sets balanced (win rate 45-55% per fighter)
- ✅ All animations smooth (no jank in state transitions)

**Progression:**
- ✅ XP/leveling system working (levels visible, progression clear)
- ✅ Cosmetics functional (1-2 skins per fighter, purchasable/unlockable)
- ✅ Daily challenges driving engagement (60%+ completion rate)
- ✅ Leaderboards displaying (personal rank, fighter statistics)

**Pipeline:**
- ✅ Fighter registry refactored (JSON schema, no code changes to add fighters)
- ✅ Feature flags system live (can enable/disable fighters remotely)
- ✅ Telemetry collecting (win rates, pick rates, move usage)
- ✅ New fighters can be added monthly post-launch (< 3 days integration time)

**Performance:**
- ✅ 57+ fps on full roster (iPhone SE, iPhone 12, iPad tested)
- ✅ Load time < 6 seconds (all fighters, all assets)
- ✅ No regressions from Phase B
- ✅ Mobile optimization pass complete

**Quality:**
- ✅ Zero critical bugs in QA final pass
- ✅ Regression testing passing (no Phase B issues)
- ✅ Cross-device testing complete (iOS, Android, iPad, desktop)
- ✅ Accessibility baseline (font sizes, touch targets, contrast)

---

## Resource Allocation Chart

```
Week 1-2 (C1 Focus):
Engineer       ████████████ 100%
3D Artist      ████████████ 100%
Game Designer  ████░░░░░░░░  40%
QA Tester      ████░░░░░░░░  40%
QA Lead        ░░░░░░░░░░░░   0%
Audio Designer ░░░░░░░░░░░░   0%

Week 2-3 (C1 + C2 Focus):
Engineer       ████████████ 100%
3D Artist      ████░░░░░░░░  40%  (batch 2 prep)
Game Designer  ████████░░░░  70%  (combat balance)
QA Tester      ████████░░░░  70%  (animation QA)
QA Lead        ░░░░░░░░░░░░   0%
Audio Designer ████░░░░░░░░  40%  (SFX setup)

Week 3-4 (C2 + C3 Focus):
Engineer       ████████████ 100%
3D Artist      ░░░░░░░░░░░░   0%  (waiting for batch 2)
Game Designer  ████████████ 100%  (progression design)
QA Tester      ████████████ 100%  (progression testing)
QA Lead        ░░░░░░░░░░░░   0%
Audio Designer ░░░░░░░░░░░░   0%

Week 4-6 (C4 Focus + Batch 2):
Engineer       ████████████ 100%
3D Artist      ████████░░░░  70%  (batch 2 integration)
Game Designer  ████░░░░░░░░  40%  (balance hotfixes)
QA Tester      ████████░░░░  70%  (regression)
QA Lead        ████████████ 100%  (final validation)
Audio Designer ░░░░░░░░░░░░   0%

Total FTE average: 4.5 FTE
Total FTE peak: 5.5 FTE (Week 3-4)
```

---

## Budget & Costs

### Salaries (6-week full execution)
- Engineer (1 FTE): $25k
- 3D Artist (1 FTE): $18k
- Game Designer (0.5 FTE): $7.5k
- QA Lead (1 FTE, Weeks 3-6): $12k
- QA Tester (0.5 FTE): $7.5k
- Audio Designer (0.25 FTE): $2k
- **Total: ~$72k**

### Third-Party Tools & Services
- Firebase Analytics: $0 (free tier, upgrade to $99/mo if needed)
- Asset acquisition (Meshy AI, artist commissions): $5k-8k
- Sound effects library (if not custom): $1k-2k
- **Total: ~$6k-10k**

### Infrastructure (Weeks 4-6)
- CDN for fighter model distribution: $500/mo
- Testing infrastructure (Playwright, CI/CD): $300/mo
- **Total: ~$2.4k for 6 weeks**

**Phase C Total Budget: ~$80k-82k**

---

## Risk Mitigation

### Risk: Fighter Assets Delayed
**Impact:** C1 blocked, timeline slips 1-2 weeks  
**Mitigation:** Pre-identify 2-3 backup assets before Phase C starts, have artist on standby

### Risk: Animation Clips Mismatch (naming inconsistency)
**Impact:** C1.2-C1.4 blocked, fighters don't animate  
**Mitigation:** Create animation clip checklist (idle, walk, run, attack_light, attack_medium, attack_heavy, special_ability, dodge, hit, victory, defeat), QA validates before integration

### Risk: Performance Regresses with Full Roster
**Impact:** Phase B fix undone, mobile < 30 fps  
**Mitigation:** Aggressive optimization (texture atlasing, animation pooling), continuous mobile benchmarking

### Risk: Balance Breaks with New Fighters
**Impact:** Competitive integrity, players complain  
**Mitigation:** Internal playtest matrix, telemetry-driven balance, hotfix process for broken moves

### Risk: Progression System Feels Hollow
**Impact:** Players don't replay, engagement drops  
**Mitigation:** User testing on progression rewards, iterate based on feedback

### Risk: Telemetry System Fails
**Impact:** Can't track balance data, delayed insights  
**Mitigation:** Test telemetry in staging environment, have backup manual tracking

---

## Pre-Phase-C Checklist

**Before Phase B deploys to production, complete:**
- [ ] Review Phase C task breakdown with team
- [ ] Confirm resource allocation (all roles assigned)
- [ ] Create Phase C Slack channel (#phase-c-daily)
- [ ] Schedule recurring stand-ups and syncs
- [ ] Brief Game Designer on fighter archetypes and balance targets
- [ ] Identify 3D artist backup plan (contingency assets)
- [ ] Create Phase C sprint in project tracking tool
- [ ] Set up Firebase/telemetry backend in staging
- [ ] Document fighter JSON schema and validation rules

---

## Success Timeline

```
Phase B: Deploy to Production (weeks -1 to 0)
│
Phase C: Execution (weeks 1-6)
├─ Week 1-2: Fighters acquired & integrated (C1) ✅
├─ Week 2-3: Combat polished (C2) ✅
├─ Week 3-4: Progression system live (C3) ✅
├─ Week 4-6: Pipeline operational, final QA (C4) ✅
│
Phase C: Complete (Week 6)
├─ 6+ fighters playable
├─ 57+ fps maintained
├─ Progression incentivizes replay
├─ Telemetry collecting balance data
├─ Content pipeline ready for monthly additions
│
Phase D: Begin (Week 7)
├─ Story campaigns for all fighters
├─ Multiplayer backend
├─ Monetization system
└─ Live events & seasonal content
```

---

## Questions & Next Steps

**Before Phase C starts:**
1. Any questions about task breakdown or dependencies?
2. Any resource constraints we need to address?
3. Any scope adjustments based on team feedback?

**First meeting after Phase B production deployment:**
1. Phase C kickoff (15 min overview)
2. Team assignments confirmation
3. Set up communication channels
4. Discuss Week 1 priorities (fighter assets)

---

**Phase C Success = Foundation for Phase D (Story, Multiplayer, Monetization)**

Estimated Phase D launch: 3+ months post-Phase-B deployment (after Phase C stable for 2-4 weeks)
