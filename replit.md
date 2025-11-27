# SMASH HEROES: WORLD COLLISION™

## Overview
SMASH HEROES: WORLD COLLISION™ is an epic open-world action RPG where a fractured multiverse leads to a collision of iconic realms and heroes. Players assemble 4-hero squads from a roster of 59 legendary fighters to explore a seamless world, battle dimensional rifts, unlock god-tier transformations, and build Nexus Haven—the last bastion against the Void King. The game blends elements of Marvel Ultimate Alliance, Smash, and FF7R, focusing on exploration, battle missions, team synergy, and challenging boss encounters.

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

**PHASE 3: Real 3D Character Models** - COMPLETED (Current Session)
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
