# LEGENDS OF KAI-JAX
## The Memory Hero of Raging City

## Overview
LEGENDS OF KAI-JAX is an open-world action RPG set in the post-apocalyptic Bronx war zone known as "Raging City." The game follows the Sabertooth Lineage saga across 9 books.

### THE FOUR FIRST SABERTOOTH GODS
*"The First Sabertooths did not rule the world. They taught it how to survive without them."*

1. **Kar-Voth, The First Fang** - Hunger / Initiation / Becoming
   - Symbol: Twin elongated fangs crossing
   - Quote: "If you hesitate, you are already dead."
   - All Sabertooth beings carry Kar-Voth's Hunger

2. **Thryxen, The Storm Sovereign** - Law / Pressure / Authority
   - Symbol: Crown of wind and lightning
   - Quote: "Power that must shout has already lost control."
   - The Sabertooth Lion Aspect (Stormmane, Air Pressure, Sovereignty)
   - Mortal Echo: Boryx Zenith

3. **Pyraxis, The Bloodward Titan** - Sacrifice / Endurance / Shield
   - Symbol: A fang split down the center, glowing ember-orange
   - Quote: "I will break so you do not have to."
   - The Sabertooth Tiger Aspect (Raw Heat, Overwhelming Endurance, Final Stands)
   - Mortal Echo: Boryn

4. **Myrr'Kai, The Memory Eater** - Continuity / Adaptation / Fusion
   - Symbol: Three interwoven tails marked with ink
   - Quote: "What survives is not what is strongest — it is what remembers how to become again."
   - The Fusion God (Hybrids, Chimera, Kai-Jax)

### THE SABERTOOTH LAW
Each descendant carries one dominant echo and one suppressed echo.
Fusion happens when Hunger + Law + Sacrifice + Memory align without conflict.
That alignment is Kai-Jax.

### Core Characters
- **Boryn** - Pyraxis remembered correctly, Sabertooth Tiger warrior, warm father who sacrifices himself (Book 1)
- **Boryx Zenith** - Thryxen's closest living echo, Sabertooth Lion warrior, cold mentor (Book 2)
- **Jaxon** - Hedgehog-Lupine hybrid orphan with electric quills
- **Kaison** - Arachnid-Kitsune-Wolf hybrid orphan with spider-sense
- **Kai-Jax** - Fusion form of Jaxon & Kaison, Star-Slime Chimera Memory King with 3 Memory Strand Tails:
  1. Electric Velocity Strand (⚡) - Jaxon's heritage
  2. Web-Ink Anchor Strand (🕷️) - Kaison's heritage
  3. Ember-Memory Strand (🔥) - Pyraxis's sacrifice through Boryn

All characters are bipedal humanoid Beast-Kin with urban apocalyptic Bronx streetwear aesthetic (hoodies, tactical gear, cosmic galaxy tails, Oversized Fangs as Sabertooth lineage mark).

### GAME RULE (LOCKED)
Everything in the game is governed by four forces:
1. Hunger (Kar-Voth)
2. Law (Thryxen)
3. Sacrifice (Pyraxis)
4. Memory (Myrr'Kai)

Every system—combat, story, bosses, UI—answers to these forces.

### THE RAGING CITY - 8 DISTRICTS

**Act I - The Age of Protection:**
1. Ashblock Heights - Vertical rooftops, Fang Syndicate control, teaches movement
2. Sector-7 Outskirts - Collapsed infrastructure, first fusion ignites here

**Act II - The Age of Law:**
3. Neon Ward - Colorful/deceptive, speed-focused, Versus Mode arenas
4. Iron Market - Black-market, moral choice quests, tests restraint
5. The Undercrown - Ancient ruins, Sabertooth myths revealed

**Act III - The Age of Memory:**
6. The Zenith Spires - Gravity-distorted towers, Lion legacy tested
7. The Erasure Fields - Reality deletion zones, only Kaijax survives
8. The Memory Nexus - All timelines converge, Architect endgame

### BOSS MAP (8 Philosophy-Testing Bosses)
1. Fang Enforcer "The Check" - Tests movement discipline
2. Blood Broker "The Deal" - Tests hunger vs morality
3. Architect Scout "The Probe" - First fusion ignition
4. Neon Prince "The Flash" - Tests speed control
5. Undercrown Sentinel "The Ancient" - Memory as weapon
6. Boryx Zenith "Shadow of Law" - Perfect mastery required
7. Erasure Choir "The Deletion" - HUD disappears mid-fight
8. Hollow Architect "The Overwrite" - Final boss, legacy defeats control

### UI COLOR LANGUAGE
- 🔥 Orange = Sacrifice / Father (Pyraxis)
- ⚡ Cyan = Law / Sabertooth Lion (Thryxen)
- 🕷️ Purple = Memory / Fusion (Myrr'Kai)
- ⚫ Black = Erasure / Architect

### CORE THEME
*"Power fades. Memory survives."*
This is a legacy game. You don't win by being strongest. You win by being unforgettable.

## User Preferences
- Preferred communication style: Simple, everyday language
- Legal approach: Copyright-safe parody with minor name/color modifications while keeping characters recognizable
- Development philosophy: Take time, build systematically, no time limits

## Recent Major Work (Current Session)
**PHASE 1: 100 Legendary Polishes** - COMPLETED
- ✅ Post-processing effects (Bloom, Vignette)
- ✅ Enhanced lighting system
- ✅ Particle effects on attacks
- ✅ Role-based character body types
- ✅ 37+ unique character visual features
- ✅ Floating damage numbers with combo scaling
- ✅ Animated arena elements
- ✅ Victory/defeat screens with animated stats
- ✅ Enhanced character select with gradients and glow
- ✅ Timeout cleanup system with useRef

**PHASE 2: Authentic Character Specifications** - COMPLETED
- ✅ Deep research into 10+ game franchises with sprite specifications
- ✅ Created characterSpecs.ts with authenticated source data
- ✅ Copyright-safe character name/color modifications

**PHASE 3: Real 3D Character Models** - COMPLETED
- ✅ Generated 59 high-quality GLB 3D character models in client/public/models/
- ✅ Created GLBCharacterModel.tsx component with:
  - Error boundary for failed model loads
  - Suspense fallback for loading states
  - Animation integration (hit, attack, idle, emotion)
  - Visual effects (invulnerability shield, hit flash, attack aura)
- ✅ Integrated GLB loader into BattlePlayer.tsx
- ✅ All characters now use real 3D models instead of placeholder boxes
- ✅ Models generated include:
  - Nintendo: Mario, Luigi, Peach, Zelda, Link/Ren, Kirby/Puffy, Yoshi, DK/Kong, Bowser, Fox, Falco, Rosalina, Pit, Marth, Ness, Meta Knight, Dedede, Wario, Waluigi, Ice Climbers, Little Mac, Shulk, Pyra, Banjo, Min Min
  - Sega: Sonic/Velocity, Shadow/Abyss, Tails, Silver
  - Pokemon: Pikachu/Sparky, Mewtwo, Greninja, Lucario, Ash
  - Capcom: Mega Man/Blaze, Ryu, Ken, Chun-Li
  - Third Party: Snake, Bayonetta, Cloud, Sephiroth, Sora, Simon, Joker, Steve, Kazuya, Terry, Hero, Ridley, Inkling, Pac-Man
  - Original: Solaro, Lunara, Impa, Palutena

**PHASE 5: Open World Raging City** - COMPLETED (Current Session)
- ✅ Updated game title to "Legends of Kai-Jax: The Memory Hero of Raging City"
- ✅ Converted arena to open-world exploration:
  - Expanded world bounds from ±10 to ±100 units
  - Third-person camera follows behind player
  - Free movement in all directions (WASD)
- ✅ Created Bronx apocalyptic war zone environment:
  - 50 damaged/collapsed buildings with tilt and damage holes
  - 80 rubble and debris pieces scattered
  - 15 burnt-out wrecked vehicles (some flipped)
  - Smoke columns from distant fires
  - 20 broken street lamps
  - Cracked asphalt streets
  - Orange/red fire lighting with ember particles

**PHASE 4: Fluid Combat System (Spider-Man Style)** - COMPLETED
- ✅ Created useFluidCombat.ts Zustand store with:
  - Free 3D WASD movement with smooth acceleration
  - Light attack chain (light1→light2→light3→light4→light5)
  - Heavy attack finishers (heavy1→heavy2→heavy3)
  - Launcher → aerial combo → slam system
  - Attack canceling during recovery windows
  - Input buffering for smooth combo flow
  - Special and Ultimate meter management
  - Dash/dodge with i-frames
  - Attack range checking (ATTACK_RANGE = 4.0 units)
  - Enemy position tracking
- ✅ Created FluidCombatPlayer.tsx component with:
  - Full keyboard input handling (WASD, JKL, Shift, Ctrl)
  - Smooth running/walking with Ctrl toggle
  - Attack phase animations (windup→active→recovery)
  - Visual effects for dashing, invincibility, combos
  - GLB model integration
- ✅ Created FluidBattleArena.tsx with:
  - KeyboardControls wrapper for full input mapping
  - Camera that follows player movement
  - Combo counter and damage number display
  - Special/Ultimate meter UI
  - Enemy AI attacks on interval
  - Victory/defeat screens with animated stats
  - Real-time enemy position sync to combat store

## System Architecture

### Frontend
- **Frameworks**: React 18 with TypeScript
- **3D Rendering**: Three.js with React Three Fiber
- **State Management**: Zustand for game-specific stores
- **Styling**: Tailwind CSS with a custom design system
- **Build Tool**: Vite

### Game Systems
- **Roster**: 59 unique characters with defined roles
- **Character Specifications**: Authenticated specs from original source materials with legal-safe modifications
- **Squad System**: 4-hero teams with tag switching, entrance strikes, revival mechanics
- **Combat**: Advanced formula with floating damage, combo scaling, particle effects
- **Rendering**: Role-based body types, 37+ visual features, post-processing effects

### Data Layer
- **ragingCityCampaign.ts**: Chapter-based campaign structure (Prologue + 8 Chapters + Finale)
- **characterSpecs.ts**: Authentic specifications with legal safeguards
- **roster.ts**: 59 characters with copyright-safe modifications integrated
- **missions.ts**: 100 story missions across 9 acts
- **bosses.ts**: Multi-phase boss encounters
- **zones.ts**: 5 distinct open-world zones
- **endgameModes.ts**: 8 diverse endgame modes
- **teamSystem.ts**: 4-hero squads with synergies
- **storyMode.ts**: 9-act narrative structure
- **teamSynergy.ts**: 100+ unique team bonuses

### Campaign System (NEW)
- **useCampaign.ts**: Zustand store for campaign state with persistence
- **ChapterSelect.tsx**: Chapter browsing UI with pillar theming
- **ChapterMissionSelect.tsx**: Mission selection within chapters
- **GameHUD.tsx**: In-game HUD with health, dread, and fusion meters
- **4 Pillars**: Hunger (orange), Law (cyan), Sacrifice (red), Memory (purple)
- **Beta Scope**: Prologue + Chapters 1-3 playable, Chapters 4-8 locked

### External Dependencies
- **Database & Backend**: Drizzle ORM (PostgreSQL)
- **API**: Express.js with TypeScript
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash)
- **3D Graphics**: React Three Fiber ecosystem
- **UI Components**: Radix UI with Tailwind CSS

## Legal Framework
- **Strategy**: Transformative parody with minor modifications
- **Name Changes**: Single-letter or synonym modifications (Sonic→Velocity, Link→Ren)
- **Color Changes**: Palette shifts while maintaining recognition
- **Recognition Points**: Each character retains iconic silhouettes, abilities, and design elements
- **Source Documentation**: All changes based on authenticated dev manuals and official specifications

## Next Steps (Future Work)
1. Research remaining 47 characters with authentic specifications
2. Update all remaining characters with legal-safe modifications
3. Implement sprite rendering system with correct aspect ratios
4. Test all 59 characters with authentic designs
5. Create procedural color palette system based on role + source specs
6. Build character stat generator using canonical heights and proportions
