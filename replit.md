# BEAST-KIN SOVEREIGNTY: GENESIS™
## Legends of Kai-Jax - The Memory Hero

## Overview
BEAST-KIN SOVEREIGNTY: GENESIS™ is an epic platform fighting RPG featuring 100% original Beast-Kin warriors. Players control Genesis heroes like KAI-JAX (The Memory King), Boryx Zenith (Guardian King), and Lunara Solis (Oracle Sentinel) through story-driven missions. Battle across the Aeterna Covenant, unlock Resonance transformations, and face the ultimate darkness: Voidonus Imperion. The game features original IP, cinematic combat, and deep lore spanning Books 1-3 of the Genesis saga.

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

**PHASE 3: Real 3D Character Models (Meshy AI)** - UPDATED
- ✅ 12 high-quality Meshy AI GLB 3D creature models in apps/web/public/models/
- ✅ Old 63 auto-generated robot-looking models REMOVED (user rejected them)
- ✅ Current creature models (user-created via Meshy AI):
  - kai_jax_beast.glb - KAI-JAX (The Memory King)
  - kaison_beast.glb - KAISON (Twin of Law)
  - jaxon_beast.glb - JAXON (Twin of Sacrifice)
  - boryx_zenith_beast.glb - BORYX ZENITH (Guardian King)
  - lunara_solis_beast.glb - LUNARA SOLIS (Oracle Sentinel)
  - phoenix_warrior.glb - PHOENIX WARRIOR (Flame Reborn)
  - frost_wolf.glb - FROST WOLF (Ice Stalker)
  - thunder_lion.glb - THUNDER LION (Storm Sovereign)
  - jade_serpent.glb - JADE SERPENT (Venom Sage)
  - shadow_panther.glb - SHADOW PANTHER (Void Hunter)
  - earth_turtle.glb - EARTH TURTLE (Ancient Guardian)
  - voidonus_beast.glb - VOIDONUS (The Final Darkness)
- ✅ Model path format: /models/{name}.glb (NOT _hero.glb)
- ✅ CREATURE_MODEL_MAP in AdventureArena.tsx maps short IDs to full model names

**PHASE 4: Fluid Combat System (Spider-Man Style)** - COMPLETED (Current Session)
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

**PHASE 5: Mobile & Touch Controls** - COMPLETED
- ✅ useTouchControls.ts Zustand store for touch input state
- ✅ TouchControls.tsx with virtual joystick (left thumb) + action buttons (right thumb)
- ✅ Auto-detects touch devices, shows controls automatically on phones/tablets
- ✅ Desktop toggle button to switch between keyboard hints and touch controls
- ✅ All inputs merge: keyboard OR touch for movement, jump, dash, combat
- ✅ Responsive HUD with Tailwind sm: breakpoints (smaller on mobile)
- ✅ Compact minimap on touch devices
- ✅ Responsive pause/defeat screens

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
- **characterSpecs.ts**: Authentic specifications with legal safeguards (NEW)
- **roster.ts**: 59 characters with copyright-safe modifications integrated
- **missions.ts**: 100 story missions across 9 acts
- **bosses.ts**: Multi-phase boss encounters
- **zones.ts**: 5 distinct open-world zones
- **endgameModes.ts**: 8 diverse endgame modes
- **teamSystem.ts**: 4-hero squads with synergies
- **storyMode.ts**: 9-act narrative structure
- **teamSynergy.ts**: 100+ unique team bonuses

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
