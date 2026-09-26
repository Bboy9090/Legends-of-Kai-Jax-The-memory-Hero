# Phase C: Canon Production Plan (Indie MVP)

**Status:** ACTIVE EXECUTION  
**Scope:** Vertical slice proof-of-concept  
**Target Platforms:** Android phone, iPhone, Windows laptop  
**Budget:** $0 (internal assets + Meshy where owned)  
**Phase C Duration:** 4-6 weeks

---

## Part 1: Revised Roster Matrix

### Canon Design Authority

| Tier | Character | Book Status | Phase C Role | Production Scope |
|------|-----------|-------------|--------------|------------------|
| **A** | **Kai** | Protagonist | Fully playable | Full animations, traversal, story |
| **A** | **Jax** | Co-protagonist | Fully playable | Full animations, mobility, story |
| **B** | **Boryn** | Father/Sacrifice | Story scenes only | Limited anims, protect/guard only |
| **B** | **Borax** | Storm Ronin mentor | Confrontation + archive | Sword combat + mentor sequences |
| **C** | **Kai-Jax** | Fusion (3 tails) | Temporary fusion state | Reuse Kai/Jax tech, fusion meter |
| **D** | **Ulgorr** | Book One antagonist | Boss encounter + archive | Boss patterns, not exploration hero |

### Prototype Archive (Preserve Code, Do Not Ship)

- Velocity (speed archetype template)
- Kaison (power archetype template)
- Steelwolf (protection archetype template)
- Ashen Tiger (technical archetype template)
- Blazing Fox (balanced archetype template)
- Voltage Fang (decision pending)

**Status:** Code preserved in separate branch, internal reference only. Do NOT allocate design resources to these until canon characters are complete.

---

## Part 2: Character Movement Identities

### KAI — Memory Spider

**Core Gameplay Feel:**
Clever. Acrobatic. Protective. Dangerous.

**Movement Identity:**
- Four spider limbs visible and mechanically meaningful
- Web traversal (wall crawl, web swing)
- High verticality and repositioning
- Memory-responsive environmental interaction
- Protective positioning relative to others

**Normal Attack Identity:**
- Venom-enhanced strikes
- 4-6 hit combo chains
- web binding as control tool
- quick recovery to allow repositioning

**Traversal Ability:**
- Wall crawl
- web swing between distant points
- environmental web anchor

**Defense:**
- Web shield (temporary)
- dodge/reposition
- memory echo avoidance (can dodge corrupted memories)

**Fusion Interaction (with Jax):**
- Kai provides control, precision, memory-web
- Spider limbs coordinate with Jax's movement
- Web binds enemies during Jax's displacement

**Signature Abilities (MVP):**
1. Web Trace (investigate memory residue)
2. Venom Strike (enhanced damage + slow)
3. Web Bind (crowd control)

**Ancestral Output:**
- Myrr'kai (Memory Eater)
- Web/venom/memory fusion mechanics

---

### JAX — Storm Sovereign

**Core Gameplay Feel:**
Explosive. Instinctive. Aggressive. Increasingly sovereign.

**Movement Identity:**
- Lightning-fast repositioning
- air control and juggling
- pressure displacement
- storm-responsive (weather interactions)
- NOT simply "Kai but faster"

**Normal Attack Identity:**
- Lightning-infused strikes
- high launch potential
- knockback and juggle combos
- pressure buildup mechanic

**Traversal Ability:**
- short lightning dash (air + ground)
- displacement burst
- storm pressure launch
- air recovery (can move while airborne)

**Defense:**
- lightning counter (reflects some projectiles)
- dodge with air momentum
- pressure shield (brief)

**Fusion Interaction (with Kai):**
- Jax provides power, aggression, displacement
- lightning amplifies web traps
- displacement breaks memory corruption

**Signature Abilities (MVP):**
1. Lightning Strike (high damage + launch)
2. Storm Pressure (AOE knockback)
3. Displacement Dash (repositioning + iframes)

**Ancestral Output:**
- Kar-Voth (First Fang)
- Thryxen (Storm Sovereign)
- Lightning/displacement/air-control mechanics

---

### BORYN — Shield Father (Limited Production)

**Core Gameplay Feel:**
Protective. Sacrificial. Heavy. Retaliatory.

**Scope Note:**
Do NOT animate Boryn to full Kai/Jax extent. Build only what story requires.

**Availability:**
- Prologue (playable or controlled)
- Selected flashback sequences
- Memory sequences
- Archive/Arena simulation only (post-story)

**Normal Attack Identity:**
- Heavy retaliations
- guard + counter flow
- protect-oriented positioning
- slow but devastating

**Defense:**
- Guard stance (reduce incoming damage)
- Intercept (block for nearby ally)
- Heavy recovery (punishment for recklessness)

**Limited Signature (Archive Only):**
1. Sacrifice Stance (protect nearby character, take their damage)
2. Heavy Retaliation (counter into powerful strike)

**Ancestral Output:**
- Pyraxis (Bloodward Titan)
- Fire/protection/sacrifice mechanics (limited)

---

### BORAX — Storm Ronin (Limited Production)

**Core Gameplay Feel:**
Technically superior. Disciplined. Precise. Mentor-level reads.

**Scope Note:**
Build for confrontation + archive. Not a story-traversal character.

**Availability:**
- Confrontation/test sequence (story)
- Mentor sequences (story)
- Archive/Arena (post-story)

**Normal Attack Identity:**
- Precision sword combat
- parry-based flow
- stance changes between defense/offense
- slow but accurate

**Defense:**
- Parry (negate + reposition)
- Counter-stance
- precision dodge

**Limited Signature (Story + Archive):**
1. Storm Slash (lightning-infused sword attack)
2. Perfect Counter (parry into guaranteed counter)

**Ancestral Output:**
- Thryxen (Storm Sovereign)
- Storm/law/discipline mechanics (limited)

---

### KAI-JAX — Three-Tail Fusion (MVP)

**Core Gameplay Feel:**
Experimental. Powerful. Unstable (early). Coordinated (late).

**Hard Constraints:**
- Starts at exactly THREE tails
- Temporary fusion initially (not permanent)
- Fusion stability meter (empties over time)
- High power cost
- Story-gated availability

**Movement Identity:**
- Combines Kai's control + Jax's displacement
- Four spider limbs still visible
- lightning-web hybrid traversal
- increased range and AoE

**Fusion Mechanics:**
- Stability meter (100 points max initially)
- Attacks cost stability
- stability recovery between fusion windows
- if meter depletes mid-fusion, forced separation + cooldown

**Normal Attack Identity:**
- web strikes + lightning amplification
- longer combo chains than Kai alone
- displacement + binding combinations
- coordination feel between two characters

**Signature Fusion Ability (MVP):**
1. Memory Storm (combined web + lightning massive AoE)
2. Coordinated Web-Lightning Bind

**Tail Milestone Locked:**
- Tail 1-3: Chapter gating (determined by story)
- Tail 4-8: CANON STORY MILESTONE REQUIRED (not determined yet)
- Tail 9: Endgame culmination (not accessible Phase C)

**Tech Reuse:**
- Kai's animation rig + Jax's rig blended (not separate character)
- Shared effects system
- Stability meter UI (simple)
- Do NOT create Kai-Jax-exclusive animations unless truly necessary

---

### ULGORR — Memory King Boss (Boss MVP)

**Core Gameplay Feel:**
Overwhelming. Reality-breaking. Memory-corrupting. FINAL.

**Scope Note:**
Build as boss encounter, not explorable character.

**Appearance:**
Book-canon Ulgorr design.

**Boss Patterns (MVP):**
1. Memory corruption wave (alters level, confuses player)
2. Direct assault (extremely fast, high damage)
3. Reality break (environment changes, must navigate)
4. Summoning corrupted echoes (weaker enemies)
5. Tail spike (desperation attack when critical health)

**Not Required for Phase C:**
- Full Ulgorr explorable moveset
- Ulgorr as arena-playable character
- Ulgorr's full ancestral power expression

**Boss Mechanics:**
- High health threshold
- pattern recognition gameplay
- memory-corruption attacks require Memory Trace to understand
- no simple "brute force" path

---

## Part 3: First Fang Syndicate Enemy

### Enemy: Fang Operative (Basic)

**Role:** First Fang Syndicate encounter. Common mob.

**Design:**
- Humanoid with partial Beast-Kin features (smaller horns, clawed hands)
- Dressed in Fang black/red armor aesthetic
- Faction marks visible

**Movement Identity:**
- Aggressive pursuit
- moderate speed
- predictable attack patterns
- breakable (can stagger with good pressure)

**Attack Pattern:**
1. Slash combo (3 hits, telegraphed)
2. Grab attempt (blockable, avoidable)
3. Tactical retreat (uses ranged weapon briefly)

**Defeat Behavior:**
- drops faction intel or memory fragment
- leaves behind temporary loot pickup
- no extended death animation

**Spawn Behavior:**
- appears in small groups (2-3)
- respects player position (doesn't instantly swarm)
- can be avoided/bypassed with traversal

**Memory Interaction:**
- Memory Trace shows their origin/orders
- vulnerable to web binds
- no memory-corruption abilities (save for elite variant)

**Production Scope:**
- one base model
- basic attack animations (5-6 clips)
- death/stagger animations
- AI decision tree (simple)

---

### Enemy: Fang Lieutenant (Elite Encounter)

**Role:** First major Fang Syndicate challenge.

**Design:**
- Larger, more armor
- clearer Beast-Kin features
- command presence
- carries larger weapon

**Attack Pattern:**
- faster combos
- combo breaker attack (interrupts player strings)
- ranged pressure (temporary)
- crowd control (stun or push)

**Memory Interaction:**
- Memory Echo reveals their backstory/motivation
- more resistant to web binds
- can corrupt nearby memory traces (enemy alert)

**Production Scope:**
- variant of basic model (not entirely new)
- additional attack animations (3-4 new clips)
- slightly more complex AI

---

## Part 4: Raging City Vertical-Slice Mission

### District: Ironvein Wards (Combat + Traversal Test)

**Mission Objective:**
Kai and Jax must traverse from street level to rooftop, gather intel on Fang activity, and extract before reinforcements arrive.

**Environmental Scope:**
- 3-4 minute traversal mission
- vertical climbing required (Kai's wall crawl)
- horizontal repositioning required (Jax's displacement)
- 1 main firefight zone
- 1 optional memory echo
- 1 civilian encounter (dialog only)
- 1 exit sequence (escape via rooftop)

**Locations:**
1. **Street Level** — Starting position, Fang sentries, basic navigation
2. **Ruined Building Complex** — Kai wall-crawl path, Jax roof-hop path, can converge
3. **Fang Hideout (Interior)** — Main combat encounter (Operatives + 1 Lieutenant)
4. **Rooftop Escape** — High-speed chase, environmental hazards, Jax air-mobility advantage

**Combat Encounters:**
- 2-3 Fang Operatives (in Street Level, optional evasion)
- 4-5 Fang Operatives (Hideout main combat)
- 1 Fang Lieutenant (Hideout, choreographed boss-lite encounter)

**Memory Mechanics:**
- 1 Memory Trace available (corpse or abandoned weapon reveals Fang intel)
- 1 Memory Echo (reconstructs a past interrogation/struggle)

**Traversal Variety:**
- Wall climbing (Kai)
- Roof hopping with displacement (Jax)
- web swing between buildings (Kai)
- lightning dash shortcuts (Jax)
- synchronized rooftop sequence (both characters)

**Civilian Interaction:**
- 1 frightened civilian in hideout perimeter
- dialog only, no combat involvement
- provides optional mission flavor
- can be protected or bypassed

**Exit Condition:**
- reach rooftop
- Fang reinforcements arrive (scripted)
- final jump escape with camera pan
- transition to next mission briefing

**Production Scope:**
- 1 vertical-slice environment asset pack
- 3-4 interior/exterior variations of same buildings
- reusable Fang enemy encounters
- one Memory Trace scripting
- one Memory Echo reconstruction
- one civilian NPC (simple dialog)
- camera system for traversal cinematic moments

**Target Play Time:**
3-5 minutes on first playthrough, 2-3 minutes optimized.

---

## Part 5: Mobile Control Map

### Primary Landscape Orientation

```
Left Side (Movement)        Right Side (Action)
┌──────────────────┐        ┌──────────────────┐
│                  │        │                  │
│   Movement       │        │   Light Attack   │
│   Stick          │        │   (tap)          │
│   (directional)  │        │                  │
│                  │        │   Heavy/Special  │
│                  │        │   (hold)         │
│                  │        │                  │
│   Dodge          │        │   Ability        │
│   (tap)          │        │   (tap)          │
│                  │        │                  │
│   Jump/Climb     │        │   Traverse/Web   │
│   (tap)          │        │   (tap)          │
│                  │        │                  │
└──────────────────┘        └──────────────────┘

Center Top: Fusion Status (if active)
Center Bottom: Mission objectives / prompts
```

### Control Mapping

| Action | Input | Context |
|--------|-------|---------|
| Move | Left stick | Ground or air |
| Attack Light | Right tap | Repeated for combos |
| Attack Heavy | Right hold (1s) | High damage, long recovery |
| Dodge | Left tap (double) | Invuln frames during animation |
| Jump | Right area double-tap | Air mobility |
| Climb/Wall | Automatic when near wall + move toward | Kai only |
| Web Swing | Right hold near web anchor | Kai traversal |
| Displacement Dash | Right swipe direction | Jax only, repositioning |
| Ability (Trace/Bind) | Center or left-side button | Context-sensitive |
| Fusion (if available) | Top button hold | Activates 3-tail Kai-Jax, stability meter begins |

### Accessibility Options

- Button size adjustment (small/medium/large)
- Stick deadzone adjustment
- hold-to-attack vs. tap-to-attack toggle
- colorblind mode (UI elements)
- text size scaling

---

## Part 6: Laptop Control Map

### Keyboard + Mouse (Primary)

| Action | Input |
|--------|-------|
| Move Forward/Back/Left/Right | W/A/S/D or Arrow Keys |
| Attack Light | Left Click or 1 |
| Attack Heavy | Right Click or 2 |
| Dodge | Space or Shift |
| Jump | Space or W (context) |
| Ability (Trace/Bind) | E |
| Fusion Activate | F |
| Pause | Esc |
| Camera Pan | Mouse movement |
| Lock Target (toggle) | Tab |

### Controller Support (Xbox Layout)

| Action | Input |
|--------|-------|
| Move | Left stick |
| Attack Light | X button |
| Attack Heavy | Y button (hold) |
| Dodge | A button |
| Jump | A button or up |
| Ability | LB |
| Fusion | RB |
| Pause | Start |
| Camera | Right stick |

### Camera Behavior

- **Auto-follow:** Default, player center of screen
- **Manual pan:** Right click drag or right stick
- **Zoom:** Scroll wheel or LT/RT
- **Lock target:** Tab toggles, camera centers on current threat

### Display Targets

- **Laptop 1080p:** 60 FPS (target)
- **Laptop 720p fallback:** 57+ FPS
- **Low-end fallback:** 30 FPS performance mode

---

## Part 7: Performance Budget Table

### Reference Hardware

**Mobile (High-End):**
- iPhone 14 Pro / Samsung S23
- 6GB RAM, 120Hz screen
- Target: 60 FPS

**Mobile (Mid-Range):**
- iPhone 12 / Samsung A53
- 4GB RAM, 60Hz screen
- Target: 57+ FPS

**Mobile (Low-End):**
- iPhone SE / Samsung A13
- 3GB RAM, 60Hz screen
- Target: 30 FPS (performance mode) or 45 FPS

**Laptop (Gaming):**
- RTX 3060 / M1 Pro equivalent
- 16GB RAM, 1080p
- Target: 60 FPS

**Laptop (Standard):**
- Intel i5 / Ryzen 5, integrated GPU
- 8GB RAM, 1080p
- Target: 57+ FPS (balanced mode) or 30 FPS (performance mode)

---

### Budget Allocation (per frame, ms)

| Component | High-End | Mid-Range | Low-End | Budget |
|-----------|----------|-----------|---------|--------|
| **Frame Target** | 16.6ms (60fps) | 17.5ms (57fps) | 33ms (30fps) | - |
| Rendering | 8ms | 10ms | 20ms | 50% |
| Physics | 2ms | 2ms | 3ms | 12% |
| AI/Logic | 3ms | 3ms | 5ms | 18% |
| Audio | 1ms | 1ms | 2ms | 6% |
| UI/Input | 1ms | 1ms | 1ms | 6% |
| Overhead | 1.6ms | 0.5ms | 2ms | 8% |

### Asset Optimization Targets

| Asset Class | High-End | Mid-Range | Low-End |
|-------------|----------|-----------|---------|
| **Draw Calls** | < 100 | < 70 | < 50 |
| **Vertices (per frame)** | 2M | 1.2M | 500k |
| **Texture Res** | 2K | 1K | 512px |
| **Particles (max)** | 500 | 300 | 100 |
| **Lights (dynamic)** | 8 | 4 | 2 |
| **Shadow Quality** | Full | Medium | Low/Off |
| **LOD Levels** | 3 | 2 | 1 |

### Quality Profiles

**QUALITY (60 FPS target)**
- High-resolution textures (2K)
- Full shadow maps
- max particle effects
- post-processing enabled
- all lights dynamic
- high LOD distance

**BALANCED (57 FPS target)**
- Medium textures (1K)
- shadow map LOD
- reduced particle count
- selective post-processing
- mixed static/dynamic lights
- medium LOD distance

**PERFORMANCE (30 FPS fallback)**
- Low textures (512px)
- shadows baked only
- minimal particles
- no post-processing
- static lights only
- aggressive LOD culling

### Memory Budget

| Platform | Target | Combat Heap | Asset Streaming | Reserve |
|----------|--------|-------------|-----------------|---------|
| iPhone SE (3GB) | 2GB | 800MB | 900MB | 300MB |
| iPhone 12 (4GB) | 3GB | 1.2GB | 1.3GB | 500MB |
| Android mid-range (6GB) | 4GB | 1.5GB | 1.8GB | 700MB |
| Laptop (8GB) | 6GB | 2.5GB | 2.5GB | 1GB |
| Laptop (16GB) | 10GB | 4GB | 4GB | 2GB |

---

## Part 8: Revised Day 1-10 Schedule

### Day 1-2: Setup + Kai MVP Development

**Engineer:**
- [ ] Create Kai movement controller (walk, run, wall-climb, web-swing)
- [ ] Implement Kai attack state machine (light combo chain)
- [ ] Add Kai dodge with invulnerability frames
- [ ] Integrate Kai spider-limb rendering (visual feedback)
- [ ] Performance profile (target: 60 FPS baseline)

**3D Artist:**
- [ ] Verify Kai model loads without errors
- [ ] Kai animation clips validated (count: 8-10 required)
- [ ] Kai rigging confirmed (spider limbs deform correctly)
- [ ] Create 1-2 Kai cosmetic variants (color/effect variations)

**Game Designer:**
- [ ] Kai stats finalized (health, speed, strength values)
- [ ] Kai move balancing framework
- [ ] Kai progression milestones (no unlock restrictions initially)

**Deliverable:** Kai playable in isolated test environment, walking/climbing/attacking, 60 FPS confirmed.

---

### Day 3-4: Jax MVP Development

**Engineer:**
- [ ] Create Jax movement controller (displacement dash, air mobility)
- [ ] Implement Jax attack state machine (lightning strikes)
- [ ] Add Jax knockback/launch mechanics
- [ ] Integrate lightning visual effects
- [ ] Performance profile (target: 57+ FPS with Jax)

**3D Artist:**
- [ ] Verify Jax model loads
- [ ] Jax animation clips validated (count: 8-10)
- [ ] Jax rigging confirmed (lightning/pressure effects visible)
- [ ] Create 1-2 Jax cosmetic variants

**Game Designer:**
- [ ] Jax stats finalized (distinct from Kai: faster, more knockback)
- [ ] Jax move balancing framework
- [ ] Kai vs Jax comparative balance check

**Deliverable:** Jax playable in isolated environment, displacement/lightning working, 57+ FPS confirmed.

---

### Day 5: Character Differentiation Test

**Engineer:**
- [ ] Create single test arena with both Kai and Jax
- [ ] Verify they control distinctly
- [ ] Confirm simultaneous animation works
- [ ] Test frame rate with both active (target: 57+ FPS)

**Designer:**
- [ ] Confirm Kai feels "clever/protective"
- [ ] Confirm Jax feels "aggressive/explosive"
- [ ] If similar, identify what needs adjustment

**Deliverable:** Both Kai and Jax playable in shared environment, feeling distinct.

---

### Day 6: Fang Operative Enemy

**Engineer:**
- [ ] Create Fang Operative model (or adapt existing)
- [ ] Implement basic AI (patrol, attack, retreat)
- [ ] Add combat animations (3-hit combo, grab, ranged)
- [ ] Integrate into test arena

**3D Artist:**
- [ ] Fang Operative model + animations (5-6 clips)
- [ ] Faction aesthetics (black/red armor, Beast-Kin features)
- [ ] death/stagger animations

**Game Designer:**
- [ ] Fang Operative stats (health, damage, speed)
- [ ] Balance against Kai/Jax (should be defeatable but threatening in groups)

**Deliverable:** One Fang Operative spawning in test arena, attacking players, defeatable.

---

### Day 7: Ironvein Wards (Level Design Start)

**Level Designer / Engineer:**
- [ ] Build basic Ironvein Wards geometry (street level, building interior, rooftop)
- [ ] Establish traversal paths (wall-crawl for Kai, roof-hop for Jax)
- [ ] Place Fang Operative spawn points
- [ ] Add collision and lighting
- [ ] Performance test on mobile (target: 57+ FPS in environment)

**Designer:**
- [ ] Placement of memory trace locations (1-2 spots)
- [ ] Civilian encounter spot planned

**Deliverable:** Ironvein Wards explorable, Kai/Jax can traverse, basic enemy encounters.

---

### Day 8-9: Mission Integration + Memory MVP

**Engineer:**
- [ ] Create mission framework (start → objectives → exit)
- [ ] Implement Memory Trace prototype (scan object, reveal residual memory)
- [ ] Implement Memory Echo prototype (watch past event replay)
- [ ] Connect mission completion trigger
- [ ] Performance validation

**Level Designer:**
- [ ] Place mission objectives in Ironvein Wards
- [ ] Memory Trace target: corrupted Fang equipment
- [ ] Memory Echo target: past Fang interrogation scene
- [ ] Exit sequence trigger (rooftop escape)

**Designer:**
- [ ] Mission briefing text
- [ ] Objective UI messaging
- [ ] Memory description text

**Deliverable:** Ironvein Wards mission playable start-to-finish, Memory Trace/Echo functional.

---

### Day 9-10: Mobile Controls + Performance Gate

**Engineer:**
- [ ] Implement mobile touch controls (left stick movement, right action buttons)
- [ ] Test on iPhone/Android emulators
- [ ] Profile performance: 57+ FPS on iPhone SE, 60 FPS on mid-range
- [ ] Implement performance mode (30 FPS fallback)
- [ ] Save/load system

**Designer:**
- [ ] Create mobile-friendly UI (larger buttons, readable text)
- [ ] Control remapping options
- [ ] Accessibility settings

**QA / Tester:**
- [ ] Play mission on mobile simulation
- [ ] Verify controls responsive
- [ ] Check for crashes or major glitches

**Deliverable:** Ironvein Wards mission playable on mobile, 57+ FPS confirmed, saves working.

---

### Day 10: Go/No-Go Gate

**Verification Checklist:**

✅ Kai fully playable (wall-crawl, web-swing, attack, dodge, ability)  
✅ Jax fully playable (displacement, lightning, air mobility, attack)  
✅ Kai and Jax feel distinctly different  
✅ One Fang Operative archetype functional  
✅ One Fang Lieutenant boss-lite encounter present  
✅ Ironvein Wards vertical-slice complete (3-5 min mission)  
✅ Mobile controls functional and responsive  
✅ Laptop keyboard/controller support working  
✅ Memory Trace prototype working  
✅ Memory Echo prototype working  
✅ Save/load system reliable  
✅ Performance ≥57 FPS on iPhone SE  
✅ Performance 60 FPS on mid-range phones  
✅ Performance 57+ FPS on standard laptops  
✅ No major crashes (< 1 per hour gameplay)  
✅ Mission complete-able from start to finish  
✅ Camera behavior smooth and intuitive  
✅ Audio system responding (placeholder or final)  

**GO Criteria:**
All checkboxes above must be TRUE.

**NO-GO Criteria:**
- Kai or Jax unplayable (fatal logic bug)
- Performance < 40 FPS sustained
- Mission unfinishable (script blocker)
- Mobile controls unresponsive
- Crashes > 2 per hour

**Decision Path:**
- ✅ GO → Proceed to Week 2 (Phase C expansion)
- ❌ NO-GO → Identify blocker, fix by Day 11, retest

---

### Week 2-3 Preview (Post Day-10 Gate)

If Day 10 passes:

**Week 2:**
- Add Boryn flashback sequence (limited animation)
- Implement 3-tail Kai-Jax temporary fusion
- Fusion stability meter mechanic
- Second Fang Syndicate enemy type
- Expand Ironvein Wards to include memory echo deeper story

**Week 3:**
- Borax confrontation sequence
- Ulgorr boss encounter design + first patterns
- Additional Memory Trace / Memory Echo sequences
- Story mission 2 setup (new Raging City district)
- Progression system start (XP, tail growth gating)

---

## Success Definition: Phase C Day 1-10

A **successful Day 10 Gate** means:

The game proof-of-concept is solid.

Kai and Jax are genuinely fun and distinct.

Mobile performance is acceptable.

The production pipeline is validated.

**The game no longer feels like a prototype.**

It feels like **the beginning of Legends of Kai-Jax**.

---

## Existing Code Preserved + Reused

### OptimizedBeastModel.tsx
✅ Reused for Kai, Jax, and future characters  
✅ Adapted for multiple limb systems (spider, storm)  
✅ Animation clip selection logic remains  

### Animation State Machine
✅ Kai/Jax state transitions use same pattern  
✅ Crossfade logic (0.3s) preserved  
✅ Combo chaining architecture reusable  

### Fighter JSON Schema
✅ Adapted to include ancestral powers  
✅ Movement identity + 18-category movesets  
✅ Compatible with canon character definitions  

### Mobile Control System
✅ Built from scratch, but reuses UI framework  
✅ Extensible for additional buttons (fusion, special)  

### Save/Load System
✅ Preserved from Phase C prep  
✅ Extends to track tails, fusion state  

### Performance Profiling
✅ Reused benchmarking methodology  
✅ 57+ FPS gate remains standard  

---

## What Was Discarded

**Generic Prototype Archetypes:**
Velocity, Kaison, Steelwolf, Ashen Tiger, Blazing Fox code preserved in separate branch, not active development.

**Generic Five-Move Moveset Template:**
Replaced with 18-category character identity system.

**"Six Interchangeable Fighters" Assumption:**
Replaced with canonical hero priority (Kai/Jax first, others limited/boss scope).

**Cinematic vs. Arena Identity Confusion:**
Re-centered on cinematic action-adventure as primary, arena as secondary.

---

## Resource Allocation (Days 1-10)

| Role | Allocation | Tasks |
|------|-----------|-------|
| Engineer | 1 FTE | Kai/Jax movement, enemies, Memory MVP, mobile controls, performance |
| 3D Artist | 0.5 FTE | Kai/Jax model validation, cosmetics, Fang enemy |
| Game Designer | 0.5 FTE | Stat balancing, mission design, memory UX |
| Level Designer | 0.5 FTE | Ironvein Wards geometry, traversal paths, encounter placement |
| QA / Tester | 0.25 FTE | Mobile testing, performance profiling, bug reporting |

**Total: 3.25 FTE (Week 1-2)**

---

## Next Immediate Actions

1. ✅ Approve this Day 1-10 schedule
2. ✅ Commit to git
3. ✅ Begin Day 1 work immediately
4. Engineer starts Kai movement controller
5. Artist verifies Kai model
6. Designer creates Kai stats

**Phase C is live. Vertical slice begins now.**
