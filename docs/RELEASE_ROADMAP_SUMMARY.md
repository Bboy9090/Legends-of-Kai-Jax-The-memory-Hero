# Release Roadmap: Phases B, C, D

Complete development roadmap from Blocker B resolution through live service establishment.

---

## Phase B: Rendering & Animation Fix (CURRENT)

**Status:** Gates 1-4 complete ✅, Gate 5 pending ⏳  
**Duration:** ~2 weeks (incl. testing)  
**Objective:** Fix invisible fighters, improve animation quality

### Deliverables
- ✅ Rendering fix (SkeletonUtils.clone + Clone component)
- ✅ Animation improvements (walk cycle, clip selection, blending)
- ✅ Mobile performance baseline (56-58 fps on viewports)
- ⏳ Live device validation (iOS + Android)

### Gate Structure
```
Gate 1: Code Quality ✅ (build, tests, typecheck)
Gate 2: Rendering Fix ✅ (fighters visible)
Gate 3: Animation Audit ✅ (walk cycle GREEN)
Gate 4: Mobile Performance ✅ (56-58 fps simulation)
Gate 5: Live Device Testing ⏳ (real iOS/Android)
Gate 6: Merge (conditional on Gate 5)
Gate 7: Deployment (conditional on Gate 6)
```

### Success Criteria
- ✅ Characters visible in all modes
- ✅ Animation quality verified (frame evidence)
- ✅ Mobile performance baseline established
- ⏳ Real device validation confirms no regressions

### Timeline
- Week 1-2: Rendering fix + animation improvements
- Week 2: Mobile simulation testing (Phase B2)
- Week 3+: Live device testing (Phase B3)
- After Gate 5 passes: Merge and deploy

---

## Phase C: Core Gameplay Enhancement (4-6 weeks post-Phase-B)

**Status:** Planning  
**Duration:** 4-6 weeks after Phase B deployment  
**Objective:** Expand roster, polish combat, establish progression

### Deliverables
- Fighter Roster Expansion: 4-6 new fighters (6+ total roster)
- Combat Polish: Hit effects, audio, animation blending
- Progression System: XP, cosmetics, daily challenges
- Live Content Pipeline: Tooling for monthly fighter additions

### Four Epics
```
C1: Fighter Roster Expansion (2-3 weeks)
    → 6+ fighters playable, unique move sets, story intros
    → Animation optimization (maintain 57+ fps)

C2: Combat Polish (1-2 weeks)
    → Hit impact effects (particles, screen shake, audio)
    → Animation blending (smooth attack chains)
    → Sound design (punch/kick impacts, reactions)

C3: Progression System (1-2 weeks)
    → Fighter leveling (XP, move unlocks)
    → Cosmetics (skins, variants, effects)
    → Daily challenges (rewards, streaks)

C4: Live Content Pipeline (ongoing)
    → Fighter template system (standardized format)
    → Feature flags (deploy without downtime)
    → Telemetry (track balance, engagement)
```

### Success Criteria
- 6+ fighters playable (training, versus, story)
- Combat responsive (57+ fps, <50ms touch latency)
- Progression visible (levels, cosmetics, achievements)
- Pipeline working (new fighters monthly)
- Performance stable (no regressions from Phase B)

### Timeline
- Week 1-2: Fighter assets + story integration
- Week 2-3: Combat polish + hit feedback
- Week 3-4: Progression system + cosmetics
- Week 4-6: Pipeline setup + optimization + QA

### Resources
- 1 Engineer (integration, optimization)
- 1 3D Artist (models, animations)
- 0.5 Game Designer (move sets, balance)
- 0.5 QA (device testing)
- 0.25 Audio Designer (sound effects)

---

## Phase D: Story, Multiplayer & Monetization (6-8 weeks post-Phase-C)

**Status:** Planning  
**Duration:** 6-8 weeks after Phase C completion  
**Objective:** Launch live service with story, multiplayer, monetization

### Deliverables
- Story Mode: 6+ narrative campaigns (40-60 min each)
- Multiplayer: Real-time PvP with ranked ladder
- Monetization: Cosmetic shop, battle pass ($9.99/season)
- Live Events: Weekly challenges, seasonal cosmetics
- Social: Chat, friends, achievements, clans
- Backend: Multiplayer servers, payment processing, analytics

### Six Epics
```
D1: Story Expansion (2-3 weeks)
    → Story arcs for all fighters
    → Branching narrative (choices matter)
    → Boss encounters (unique mechanics)
    → Cinematics (professional quality)

D2: Multiplayer & Ranked (2-3 weeks)
    → Real-time PvP (<100ms latency)
    → Ranked ladder (Elo-based matching)
    → Tournament mode (bracket-style)
    → Replay system (save and playback)

D3: Monetization (1-2 weeks)
    → Cosmetic shop ($0.99-$9.99 items)
    → Battle pass ($9.99/season, 10 weeks)
    → Limited-time cosmetics (seasonal exclusives)
    → Payment processing (Stripe, Apple, Google)

D4: Live Events & Seasonal (1-2 weeks)
    → Weekly challenges (3-5 missions)
    → Seasonal events (4-week themes)
    → Limited-time modes (unique mechanics)
    → Fighter rotations (featured fighter per week)

D5: Social & Community (1-2 weeks)
    → In-game chat (global, team, whisper)
    → Friend system (quick match, profiles)
    → Achievements (milestones, badges)
    → Clan system (create groups, team battles)

D6: Backend Infrastructure (ongoing)
    → Player accounts (registration, login)
    → Cloud saves (cross-device sync)
    → Multiplayer servers (dedicated or P2P)
    → Analytics pipeline (KPIs, retention)
```

### Success Criteria
- 6+ story campaigns (meaningful branching)
- Multiplayer <100ms latency (fair ranked matches)
- Monetization sustainable ($10k-50k/month revenue)
- Engagement +30% from Phase C (story + multiplayer)
- DAU target: 10k-50k (depending on marketing)
- Community healthy (positive sentiment, low toxicity)

### Monetization Model
- **Free-to-play** (all gameplay free, cosmetics only, no pay-to-win)
- **Cosmetics:** $0.99-$9.99 per item
- **Battle Pass:** $9.99/season (10 weeks)
- **Projected ARPU:** $2-5/month per player

### Monetization Projections
- **Month 0 (launch):** $1,500/month (10k DAU, 5% conversion, $3 avg)
- **Month 6:** $12,500/month (25k DAU, 10% conversion, $5 avg)
- **Year 1:** $150,000/month (50k DAU, 15% conversion, $7 avg)

### Timeline
- Week 1-3: Story + multiplayer foundation
- Week 3-4: Ranked + monetization system
- Week 4-5: Events + social features
- Week 5-8: Polish, QA, launch

### Resources
- 1 Backend Engineer (multiplayer, monetization)
- 1 Story Writer (narrative design)
- 0.5 UI/UX Designer (shop, profiles, events)
- 1 QA Lead (multiplayer stress testing)
- 0.5 Community Manager (moderation, support)
- 0.25 DevOps (infrastructure, monitoring)

### Infrastructure Costs
- Backend: $5k-10k/month (managed service)
- Database: $1k-3k/month (PostgreSQL, Redis)
- CDN: $2k-5k/month (CloudFlare, AWS)
- Analytics: $1k-2k/month (BigQuery, Datadog)
- Payment processing: 2-3% of revenue (Stripe)
- **Total:** $10k-30k/month + 2-3% revenue share

---

## Complete Timeline

```
PHASE B (Blocker B)
├─ Week 1-2: Rendering fix + animation improvements
├─ Week 2: Mobile simulation testing (Phase B2)
├─ Week 2-3: Live device testing (Phase B3)
├─ After B3 passes: Merge to production (Gate 6-7)
└─ Complete: ~3 weeks total

PHASE C (Roster & Combat)
├─ Start: After Phase B deployed and stable (~week 4)
├─ Week 1-2: Fighter roster + story
├─ Week 2-3: Combat polish
├─ Week 3-4: Progression system
├─ Week 4-6: Pipeline setup + QA
└─ Complete: ~6 weeks total

PHASE D (Live Service)
├─ Start: After Phase C stable (~week 11)
├─ Week 1-3: Story + multiplayer foundation
├─ Week 3-4: Ranked + monetization
├─ Week 4-5: Events + social
├─ Week 5-8: Polish + launch
└─ Complete: ~8 weeks total

TIMELINE:
Month 0: Phase B (Blocker B fix)
Month 1: Phase B → Phase C transition
Month 2-3: Phase C (roster expansion)
Month 4-5: Phase C → Phase D transition
Month 5-7: Phase D (live service launch)
Month 8+: Live service operations
```

---

## Phase Progression Dependencies

```
Phase B (CURRENT)
  ↓
  Must pass Gates 1-7 (code quality → live device testing → merge → deploy)
  ↓
Phase C
  ↓
  Must complete (6+ fighters, combat polish, progression system)
  ↓
Phase D
  ↓
  Establishes live service (story, multiplayer, monetization)
  ↓
Phase E (Future)
  ↓
  Esports infrastructure, cosmetic expansion, global marketing push
```

---

## Key Metrics Progression

### Phase B Goals
- Rendering: ✅ Visible
- Performance: 57+ fps baseline
- Animation Quality: Walk cycle natural

### Phase C Goals
- Roster: 6+ fighters
- Performance: 57+ fps maintained
- Engagement: Daily active progression

### Phase D Goals
- Narrative: 6+ story campaigns complete
- Multiplayer: <100ms latency ranked
- Monetization: $10k-50k/month
- DAU: 10k-50k players
- Retention: +30% from Phase C

### Phase E+ Goals (Future)
- Esports ecosystem (tournaments, prize pools)
- Multiple platforms (mobile app, console, PC)
- Regional launches (Asia, Europe, etc.)
- ARU: $10-20+/month (cosmetics + esports + premium)

---

## Success Criteria (All Phases)

### Phase B Success
- Characters visible and animated on all devices ✅
- Mobile performance verified (real hardware testing pending) ⏳
- Ready to merge and deploy

### Phase C Success
- 6+ fighters with unique move sets
- Combat feels satisfying (57+ fps, responsive input)
- Progression incentivizes replay
- Live content pipeline working

### Phase D Success
- Story campaigns emotional and engaging
- Multiplayer fair and competitive (ranked system working)
- Monetization sustainable (not pay-to-win, feels fair)
- Community engaged and healthy

### Phase E+ Success
- Esports ecosystem with player investment
- Global player base (multi-region servers)
- Sustainable revenue model (ARU $10-20+/month)
- Competitive multiplayer franchise

---

## Risk Management

### Phase B Risks
- **Live device testing shows regressions** → Rollback and fix
- **Animation still unnatural on real hardware** → Adjust clip selection or blending
- **Thermal throttling on mobile** → Optimize further or accept limitation

### Phase C Risks
- **Performance regresses with more fighters** → Aggressively optimize, texture atlasing
- **Move sets unbalanced** → Telemetry-driven balance hotfixes
- **Story quality inconsistent** → Story lead reviews all narratives
- **Live pipeline breaks** → Feature flags and staging environment

### Phase D Risks
- **Multiplayer networking unstable** → Use managed backend, stress test to 10k players
- **Story quality varies across fighters** → Player testing, iterate on feedback
- **Monetization perceived as greedy** → No pay-to-win, fair pricing, transparency
- **Ranked system broken (balance)** → Hotfix process, weekly balance passes
- **Toxicity in multiplayer** → Moderation, muting, reporting, bans

### Phase E+ Risks
- **Esports sustainability** → Player interest, sponsorships, prize pools
- **Platform expansion complexity** → Staged launches (mobile → console → PC)
- **Competing multiplayer games** → Unique identity, community engagement

---

## Conclusion

This roadmap takes Legends of Kai-Jax from a "fighting game with invisible fighters" (Phase B blocker) to a "competitive multiplayer franchise with live service."

**Phase B** fixes the critical blocker and establishes quality baseline.

**Phase C** builds the foundation: roster variety, combat polish, progression.

**Phase D** launches the live service: story depth, multiplayer competition, sustainable monetization.

**Phase E+** expands globally: esports, multiple platforms, premium cosmetics.

Success depends on execution discipline, quality standards, and responsive live service operations. Each phase gates on the previous, ensuring stability before moving forward.
