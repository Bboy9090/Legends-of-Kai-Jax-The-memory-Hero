# Phase C: Core Gameplay Enhancement & Fighter Roster Expansion

**Status:** Planning (Gates 1-4 of Blocker B complete, Gate 5 pending)  
**Start:** After Phase B deployment (Gate 7)  
**Duration:** 4-6 weeks  
**Objective:** Expand fighter roster, polish combat feel, establish live content pipeline

---

## Phase C Goals

### Primary Objectives
1. **Fighter Roster Expansion** — Add 4-6 new fighters to supplement Kai-Jax
2. **Combat Polish** — Improve hit feedback, combo flow, visual/audio effects
3. **Progression System** — Fighter level-up, move unlocks, cosmetics
4. **Live Content Pipeline** — Enable rapid fighter additions post-launch

### Secondary Objectives
1. **Performance Optimization** — Reduce bundle size, optimize animation memory
2. **Mobile Touch Refinement** — Better combat feel on touch devices
3. **Story Mode Expansion** — Additional story campaigns for roster fighters
4. **User Retention** — Daily challenges, seasonal events, cosmetic rewards

---

## Phase C Epics

### Epic C1: Fighter Roster Expansion (2-3 weeks)

**Goal:** Ship 4-6 new fighters by end of Phase C

**Fighter Candidates:**
- **Velocity (Jaxon variant)** — Speed-based fighter, fast combos
- **Kaison** — Heavy hitter, slower but powerful attacks
- **Voltage Fang** — Electric-themed, shock effects
- **Steelwolf** — Tank archetype, high defense
- **Ashen Tiger** — Technical fighter, complex move sets
- **Blazing Fox** — Balanced, fire effects

**Per-Fighter Deliverables:**
- [ ] 3D model (Meshy AI or equivalent)
- [ ] Base animations (idle, walk, run, attack, dodge, hit, special)
- [ ] Fighter stats (health, speed, strength, defense)
- [ ] Move set (4-6 unique attacks, 2-3 special abilities)
- [ ] Story intro + lore
- [ ] Versus AI opponent behavior
- [ ] Training mode availability
- [ ] Cosmetic variants (1-2 skins per fighter)

**Technical Requirements:**
- Animation clip library updated (new fighter animations)
- Fighter registry extended (stats, moves, cosmetics)
- Model optimization (keep performance ≥57 fps on mobile)
- Story mode branching (fighter-specific campaigns)

**Success Criteria:**
- All 4-6 fighters playable in Training, Versus, Story modes
- Performance maintained (57+ fps on mobile)
- No rendering regressions from Blocker B fix
- Fighter move sets balanced (no dominant strategy)

---

### Epic C2: Combat Polish & Feedback (1-2 weeks)

**Goal:** Enhance hit feedback, combo flow, visual/audio effects

**Improvements:**
- [ ] Hit impact effects (screen shake, particles, knockback)
- [ ] Combo counter visual feedback
- [ ] Audio: punch/kick impact sounds, hit reactions
- [ ] Animation blending: smoother attack-to-attack transitions
- [ ] Move set rebalancing: adjust damage, speed, recovery time
- [ ] Special ability visuals (energy effects, charge-up animations)
- [ ] Health bar animations (smooth depletion, low-HP warning)
- [ ] Victory/defeat animations per fighter

**Technical Requirements:**
- Particle system integration (Three.js)
- Audio system setup (sound effects on hit, combo, victory)
- Animation state machine refinement (better attack chaining)
- Visual effect library (reusable components for attacks)

**Success Criteria:**
- Combat feels responsive and satisfying
- Feedback clear on mobile (no input lag perception)
- Audio balanced (not too loud, responsive to action)
- Animations smooth (no jank in state transitions)

---

### Epic C3: Progression System (1-2 weeks)

**Goal:** Add depth through character progression and cosmetics

**Features:**
- [ ] Fighter leveling (XP system, level caps per fighter)
- [ ] Move unlocks (learn new attacks as level increases)
- [ ] Equipment/cosmetics (skins, color variants, effects)
- [ ] Battle pass or seasonal rewards
- [ ] Daily challenges (earn rewards, track streaks)
- [ ] Leaderboard (track player wins, fighter usage stats)
- [ ] Save/persistence (player progression stored locally + cloud)

**Technical Requirements:**
- Zustand store expansion (progression state)
- LocalStorage + optional cloud sync
- UI components (level display, XP bar, cosmetic selector)
- Analytics (track which fighters are played most)

**Success Criteria:**
- Players incentivized to replay battles
- Progression feels rewarding (visible level increases)
- Cosmetics visibly distinguish fighters
- Save/load works reliably on mobile

---

### Epic C4: Live Content Pipeline (Ongoing)

**Goal:** Enable rapid fighter additions and seasonal content

**Infrastructure:**
- [ ] Fighter template system (standardized format for new fighters)
- [ ] Content deployment pipeline (add fighters without code changes)
- [ ] Remote fighter registry (pull fighter data from backend if available)
- [ ] A/B testing framework (test new fighters before wide release)
- [ ] Telemetry (track usage, balance feedback, crash reports)

**Process:**
1. Designer creates fighter spec (stats, moves, animations)
2. Artist generates 3D model + animations
3. Engineer integrates into fighter registry
4. QA tests on mobile devices
5. Deploy to production with feature flag
6. Monitor telemetry, adjust balance
7. Expand roster based on performance

**Technical Requirements:**
- Fighter registry refactor (JSON-based, easy to extend)
- Feature flags (enable/disable fighters without redeploy)
- Telemetry collection (usage, crashes, balance feedback)
- Analytics dashboard (fighter pick rates, win rates, etc.)

**Success Criteria:**
- New fighters can be added monthly post-launch
- Zero downtime deployment process
- Balance changes can be deployed within 24 hours of feedback

---

## Phase C Timeline

### Week 1-2: Fighter Roster Expansion
- [ ] Model acquisition (Meshy AI, artist, or contractors)
- [ ] Animation production (walk, idle, attacks, special effects)
- [ ] Integration into OptimizedBeastModel component
- [ ] Fighter registry updates
- [ ] Story mode branching for new fighters

**Milestone:** First 2 fighters playable (Velocity, Kaison)

### Week 2-3: Combat Polish
- [ ] Hit effect implementation (particles, screen shake)
- [ ] Audio system setup
- [ ] Animation blending improvements
- [ ] Move set rebalancing

**Milestone:** Combat feels responsive and satisfying

### Week 3-4: Progression System
- [ ] XP/leveling system
- [ ] Cosmetics (skins, variants)
- [ ] Save/load implementation
- [ ] Daily challenges UI

**Milestone:** Players have long-term progression goals

### Week 4-6: Live Content Pipeline & Polish
- [ ] Remaining fighters (4-6 total)
- [ ] Feature flags and telemetry
- [ ] Balance adjustments based on testing
- [ ] Performance optimization
- [ ] Final QA and polish

**Milestone:** 6+ fighters shipped, pipeline ready for post-launch content

---

## Success Criteria

### Launch Readiness
- ✅ 6+ fighters available (all playable modes)
- ✅ Combat feels satisfying (57+ fps, responsive input)
- ✅ Progression incentivizes replay (XP, cosmetics, challenges)
- ✅ Performance maintained (no regressions from Phase B)
- ✅ Mobile optimized (touch controls responsive, no lag)

### Content Pipeline
- ✅ New fighters can be added monthly
- ✅ Balance changes within 24 hours
- ✅ Zero downtime deployment
- ✅ Telemetry tracks usage and health

### Player Experience
- ✅ Roster variety encourages experimentation
- ✅ Move sets feel distinct (no carbon copies)
- ✅ Combat rewarding (clear feedback on hits, combos)
- ✅ Progression visible (levels, cosmetics, achievements)

---

## Dependencies & Blockers

### Must Complete Before Phase C
- ✅ Phase B (Blocker B) — Rendering and animation fixes
- ✅ Gate 5 (Live device testing) — Performance verified on real hardware
- ✅ Gate 6 (Merge) — Fixes deployed to main branch
- ✅ Gate 7 (Production) — Live in production environment

### External Dependencies
- [ ] 3D artist availability (fighter models + animations)
- [ ] Audio designer (sound effects, music)
- [ ] Story writer (fighter bios, story modes)
- [ ] QA testers (mobile device testing)

### Technical Debt to Address
- [ ] OptimizedBeastModel optimization (large file sizes)
- [ ] Animation registry refactor (easier fighter addition)
- [ ] State management cleanup (Zustand store organization)

---

## Phase C vs Phase D

### Phase C (This Roadmap)
- **Focus:** Fighter roster, combat polish, progression
- **Scope:** 6+ fighters, XP system, cosmetics, live pipeline
- **Timeline:** 4-6 weeks post-B deployment
- **Target:** Production-ready fighter game

### Phase D (Future)
- **Focus:** Story expansion, multiplayer, monetization
- **Scope:** Campaign story, PvP modes, cosmetic store
- **Timeline:** 6+ weeks after Phase C
- **Target:** Expanded content and engagement

---

## Risk Mitigation

### Risk: Animation Quality Degrades with More Fighters
**Mitigation:** Standardized animation template, quality checklist per fighter, frame capture audits (like Phase B1)

### Risk: Performance Regresses with Roster Expansion
**Mitigation:** Aggressive optimization, texture atlasing, animation memory pooling, continuous mobile testing

### Risk: Balance Breaks with New Move Sets
**Mitigation:** Internal playtesting, telemetry to track win rates, balance hotfix process

### Risk: Live Content Pipeline Breaks
**Mitigation:** Feature flag testing, staging environment, rollback procedure

---

## Resource Requirements

### Team
- **Engineer:** 1 FTE (integration, pipeline, performance)
- **3D Artist:** 1 FTE (models, animations)
- **Game Designer:** 0.5 FTE (move sets, balance, progression)
- **QA:** 0.5 FTE (device testing, regression)
- **Audio Designer:** 0.25 FTE (sound effects, music)

### Infrastructure
- **Cloud storage:** Fighter models and animations (S3 or equivalent)
- **CDN:** Model asset distribution (faster loading)
- **Analytics:** Telemetry backend (Firebase, Mixpanel, or Supabase)
- **Feature flags:** Infrastructure (LaunchDarkly or custom)

---

## Metrics & Success Tracking

### Engagement Metrics
- Fighter pick distribution (variety encourages healthy ecosystem)
- Average session length (progression should increase play time)
- Daily active users (seasonal events drive retention)
- Cosmetic purchase rate (if monetized)

### Technical Metrics
- Mobile performance (57+ fps maintained)
- Load time (target < 4 seconds with full roster)
- Crash rate (zero crashes on live devices)
- Balance win rates (no fighter > 55% win rate)

### Content Metrics
- Time to new fighter (monthly cadence post-launch)
- Feature flag deployment success rate (100%)
- User feedback sentiment (should improve with cosmetics/progression)

---

## Go/No-Go Decision Points

**Phase C Start:** Only after Phase B deployed and stable (Gate 7 complete)

**Phase C Midpoint (Week 3):** Review fighter progress and combat polish
- ✅ GO if 2+ fighters playable, combat feels good
- ❌ NO-GO if significant regressions or blockers

**Phase C End:** Final QA and performance validation
- ✅ GO if all success criteria met, no critical bugs
- ❌ NO-GO if performance regressed or critical bugs found

---

## Post-Phase-C Roadmap

After Phase C ships (4-6 weeks):
1. **Monitor telemetry** — Track fighter usage, balance, player feedback
2. **Monthly updates** — 1-2 new fighters per month
3. **Balance patches** — Adjust move sets based on win rates
4. **Seasonal events** — Limited-time challenges, cosmetics, story content
5. **Phase D planning** — Story expansion, multiplayer modes, monetization

---

## Success Definition

**Phase C is successful when:**
1. 6+ fighters playable and balanced
2. Combat feels responsive and satisfying
3. Progression incentivizes long-term play
4. Mobile performance maintained (57+ fps)
5. Live content pipeline working (new fighters monthly)
6. Player retention improved (DAU, session length)
7. Cosmetic system functional (optional monetization foundation)

**Then:** Proceed to Phase D (story, multiplayer, monetization) or iterate based on player feedback.
