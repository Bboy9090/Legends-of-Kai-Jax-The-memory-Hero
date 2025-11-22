# SMASH HEROES: WORLD COLLISION™

## Overview

An epic open-world action RPG where the multiverse has cracked and legendary heroes must unite to save all reality. When the Weave of Reality fractures, corrupted Echo heroes pour into a fused world built from the ruins of countless iconic realms. Players assemble squads of 3 heroes from a roster of 40+ legendary fighters, explore a seamless interconnected world, battle dimensional rifts, unlock god-tier transformations, and build Nexus Haven—the last bastion of resistance against the Void King.

**The Game Vision:**
- **Genre**: Open-world cinematic action RPG with squad-based combat
- **Core Loop**: Explore → Battle Rifts → Unlock Transformations → Upgrade Nexus Haven → Face World Bosses
- **Key Heroes**: Jaxon (Sonic/Chaos Incarnate), Kaison (Mega Man X/Adaptive Arsenal), plus Mario, Link, Samus, Kirby, Pikachu, Fox, DK, Yoshi, and 30+ more
- **Setting**: A fused multiverse where Green Hill overlooks Hyrule, Dream Land clouds drift above Toad Town, and Lylat ruins scatter the sky
- **Endgame**: Defeat the Void King and the Entropy Court to restore reality

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the main application framework
- **Three.js with React Three Fiber** for 3D rendering and game engine
- **Zustand** for state management across multiple game stores
- **Tailwind CSS** with custom design system for UI components
- **Vite** as the build tool with hot module replacement for development

### Component Structure
- **Game States**: Menu, Story Mode Selection, Game Modes, Squad Selection, Character Select, Battle Mode, Customization
- **3D Components**: Nexus Haven hub world, dimensional rift portals, player characters, enemies, environment
- **UI Components**: Radix UI primitives with custom styling for accessibility
- **Game Logic**: Squad combat, transformation system, dimensional rifts, world progression

### State Management Pattern (RPG Stores)
- **useGame**: Core game phase management (ready, playing, ended)
- **useRunner**: Game mechanics and game state routing
- **useWorldState**: RPG progression (zones, rifts, Nexus Haven level, recruited heroes, Void King weakness)
- **useSquad**: Squad management (3-hero party, active hero, synergy bonuses, stats)
- **useTransformations**: Power-up system (transformation levels, energy meters, unlocks)
- **useBattle**: Combat mechanics (fighters, health, attacks, 3D positioning, balance/momentum)
- **useAudio**: Sound effects and music management

### Game Architecture: World Collision RPG

**Core Systems (IMPLEMENTED):**
- ✅ **Nexus Haven Hub**: 3D central hub with dimensional rift portals, squad management, and progression tracking
- ✅ **Squad Selection**: Choose 3 heroes from recruited roster with synergy bonus calculations
- ✅ **Transformation System**: Energy meters and power-up states (Base → Super → Ultimate)
- ✅ **Character Bios & RPG Sheets**: Cinematic backstories, specialties, ultimate attacks, transformation paths, origin stories, and battle quotes for all heroes
- ✅ **World State Management**: Zone discovery, rift tracking, Nexus level, hero recruitment, Void King weakness
- ✅ **Mythic Opening**: Epic narration introducing the fractured multiverse and Void King threat
- ✅ **Dynamic 3D Combat System** (Master Fighting Mechanics): Full 3D positioning with depth axis, rotation-based facing, natural stance system with dynamic weight distribution (WD), center of gravity (CG) tracking, recovery frames, momentum-based power generation from hip rotation, realistic combat physics
- ✅ **Master Fighting Formula**: P ∝ (M_B · V_H) + (A_L · ω) where power comes from hip rotation, momentum, weight distribution, and CG efficiency
- ✅ **Battle Quote System**: Each hero has unique signature quotes displayed before battle
- ✅ **Transformation Sequences**: Visual descriptions of how each transformation occurs
- ✅ **Villain Matchup Charts**: Advantage/disadvantage data showing which heroes counter which villains
- ✅ **Story Mode - 9 Acts**: Complete saga experience with fire moments, boss encounters, and cinematic sequences
- ✅ **Game Modes - 12 Modes**: Legacy Mode, Gauntlet of Gods, Riftbreak Survival, Timeline Paradox, Toddler Mode, Lab Mode, Open Zone Expeditions, Harmonarch Trials, Echo Simulator, Haven Builder, Double Fate, Cinematic Library
- ✅ **Marvel Ultimate Alliance-style Team Synergies**: Dynamic team bonuses, fusion attacks, and squad-based buffs

**Combat Mechanics (PHASE 3 - DYNAMIC FIGHTING):**
- ✅ **Natural Stance System**: Bladed/staggered fighting stance with dynamic weight distribution (60/40 front-to-back or flexible)
- ✅ **Hip Rotation Power Generation**: All strikes originate from ground-up with hip torque (θ_H) for realistic power
- ✅ **Weight Distribution (WD) Variable**: Dynamically shifts between front and rear foot (0.3-0.8 range) based on movement and attacks
- ✅ **Center of Gravity (CG) Tracking**: 0-1 variable tracking CG position for damage efficiency and balance
- ✅ **Recovery Frames**: Vulnerability windows when balance drops below threshold or after high-risk attacks
- ✅ **Momentum & Exit Vectors**: Attacks build momentum and naturally flow into next position for combo potential
- ✅ **3D Depth Movement**: Z-axis weaving, slipping, and evasion for dynamic spatial combat
- ✅ **Reactionary AI**: Opponent previews attack windup, giving player window for early defensive input
- ✅ **Range Management**: Calculates optimal fighting distance (Dopt) based on attack type

**Core Systems (PLANNED):**
- **Open World Zones**: Seamless exploration across Green Hill-Hyrule, Dream Land Skies, Lylat Ruins, etc.
- **Dimensional Rifts**: Reality tears spawning Echo bosses with rare rewards
- **Squad Combat**: Tag combos, assist attacks, synchronized ultimates in battle
- **Story Progression**: Unlock modes through story acts
- **Expanded Roster**: 30+ additional heroes with unique quests and abilities
- **Dynamic Reflection Saga Mode (DRSM)**: Character leveling, gear customization, Empathy resource loop, progression systems

### Mobile-First Design
- **Touch Controls**: Gesture-based input system with swipe and tap recognition
- **Responsive UI**: Tailwind CSS with mobile-optimized layouts
- **Performance Optimization**: Efficient 3D rendering with object pooling and LOD systems

## Story Mode - 9 Acts Structure

The complete saga is now playable as **9 Cinematic Acts**, each with:
- **Act I - Cross Point Tournament**: The multiversal tournament begins (Book 1)
- **Act II - Year of No A-Listers**: Support heroes save the day (Book 2)
- **Act III - Unity's Dawn**: Heroes reunite with ancient powers (Book 3)
- **Act IV - The Great Hunt**: Artifact hunts in corrupted zones (Book 4)
- **Act V - Primordial Gambit**: Fortress invasions and 2nd-tier transformations (Book 5)
- **Act VI - Shadows of the Void**: Cosmic storms and titan battles (Book 6)
- **Act VII - Nexus Legacy**: Multi-generation combat with legacy kids (Book 7)
- **Act VIII - War of the Eternals**: Tournament of titans with environmental rules (Book 8)
- **Act IX - Oblivion's End**: Final battle against the Void King (Book 9)

Each act contains:
- Multiple fire moments with cutscenes
- Boss encounters
- Unique gameplay twists
- Difficulty progression
- Estimated 120-350 minute playtimes

## 12 Additional Game Modes

Beyond the main story:
1. **Legacy Mode** - Play post-saga with legacy kids
2. **The Gauntlet of Gods** - 100-floor endless tower
3. **Riftbreak Survival** - Endless wave survival
4. **Timeline Paradox** - Replay fights with alternate outcomes
5. **Toddler Mode** - Comedy mode with baby heroes
6. **Lab Mode** - Upgrade and customize heroes
7. **Open Zone Expeditions** - Explore iconic worlds
8. **Harmonarch Trials** - Fight cosmic overseers
9. **Echo Simulator** - AI training that learns your playstyle
10. **Haven Builder** - Base-building for Nexus Haven
11. **Double Fate** - Dual storylines (Light/Void paths)
12. **Cinematic Library** - Replay cutscenes and lore

## Team Synergy System (Marvel Ultimate Alliance-style)

### Key Features:
- **10+ Team Synergies**: Speed Demons, Guardian Order, Chaos Rebels, Divine Choir, Bros Bond, Tech Gurus, Stellar Protectors, Legend Crew, Dark Alliance, Smash Family
- **Dynamic Bonuses**: Each team composition grants unique stat bonuses (speed, defense, damage, healing, etc.)
- **Fusion Attacks**: Special combined attacks when team members fight together
- **Team Ultimates**: Powerful group finishing moves (Lightspeed Blitzstorm, Tri-Force Starburst, Oblivion Execution, etc.)

Example synergies:
- **Speed Demons** (Sonic + Fox + Pikachu + Greninja): +20% Dash Speed, Lightspeed Blitzstorm Ultimate
- **Guardian Order** (Mario + Link + Samus + Peach): +15% Defense, Tri-Force Starburst Ultimate
- **Divine Choir** (Zelda + Rosalina + Palutena + Lunara): +25% Spell Power, Infinite Symphony Ultimate

## Character System Features

### Rich Character Data
Each hero includes:
- **Title**: Personality archetype (e.g., "Chaos Incarnate", "Adaptive Arsenal")
- **Short Bio**: Quick description for character select screen
- **Extended Bio**: Cinematic RPG codex entry
- **Origin Story**: Full mythology narrative explaining their background and abilities
- **Specialty**: Combat focus (speed, defense, utility, etc.)
- **Transformations**: 3 power levels with visual sequence descriptions
  - Base Form (1.0x power)
  - Super/Enhanced Form (2.5x power)
  - Ultimate/Omega Form (5.0x power)
- **Ultimate Attack**: Signature finishing move description
- **Battle Quotes**: 5+ unique signature quotes spoken before battle
- **Synergy Partners**: Heroes who work well together
- **Villain Matchups**: Advantage/neutral/disadvantage against major threats

### Villain Matchup System
Detailed matchup data for major antagonists:
- **The Void King**: Ultimate void entity with time-stopping aura
- **Echo Heroes**: Corrupted versions of heroes with twisted abilities
- **Entropy Court Generals**: Five void generals representing different entropy aspects

## External Dependencies

### Database & Backend
- **Drizzle ORM** with PostgreSQL dialect for data persistence
- **Neon Database** (serverless PostgreSQL) for cloud database hosting
- **Express.js** server with TypeScript for API endpoints

### AI Integration
- **Google Generative AI** (Gemini 2.5 Flash) for chat functionality and text analysis
- **AI Assistant Features**: Chat interface, text summarization, sentiment analysis

### 3D Graphics & Animation
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers and abstractions for Three.js
- **@react-three/postprocessing**: Visual effects and post-processing pipeline
- **react-spring**: Physics-based animations for smooth character movements

### UI & Accessibility
- **Radix UI**: Comprehensive set of accessible, unstyled UI components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent visual elements

### Development & Build Tools
- **Vite**: Fast build tool with TypeScript support and hot reload
- **esbuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

### Game-Specific Libraries
- **TanStack Query**: Server state management for API calls
- **Zustand**: Lightweight state management for game logic
- **GLSL shader support**: Custom visual effects for character abilities

## Recent Updates

### November 22, 2025 - Story Mode & Game Modes Complete
- ✅ Implemented 9-Act story mode with fire moments and boss encounters
- ✅ Created 12 game modes with progression-based unlocks
- ✅ Built Marvel Ultimate Alliance-style team synergy system
- ✅ Added 10+ team compositions with unique bonuses
- ✅ Implemented fusion attacks and team ultimates
- ✅ Created StoryModeSelect and GameModesMenu UI components
- ✅ Integrated team synergy bonuses into combat calculations

### November 22, 2025 - Master Fighting Mechanics (Phase 3)
- ✅ Implemented dynamic weight distribution (WD) system with front/back foot shifts
- ✅ Added center of gravity (CG) tracking for balance and damage efficiency
- ✅ Created recovery frame vulnerability windows (scales with attack type)
- ✅ Implemented master fighting formula: P ∝ (M_B · V_H) + (A_L · ω)
- ✅ Enhanced power calculation with hip rotation, momentum, stance bonuses, and CG efficiency
- ✅ Added natural exit vectors so attacks flow into next position
- ✅ Integrated 3D depth-axis movement with weaving and slipping mechanics
- ✅ Simplified opponent AI attack system with recovery frames
- ✅ Added range management framework for optimal fighting distance (Dopt)

### November 22, 2025 - Character System Expansion
- ✅ Added detailed origin stories for all 8 core heroes
- ✅ Implemented transformation sequence visual descriptions
- ✅ Created battle quote system (5+ unique quotes per hero)
- ✅ Built villain matchup chart system
- ✅ Enhanced CharacterSelect UI to display all new data
- ✅ Integrated RPG-style character sheets into selection flow

### Earlier Phases
- ✅ Phase 1: Expanded combat data model with 3D support
- ✅ Phase 2: Balance/momentum physics with visual indicators
- ✅ Audio system with background music and sound effects
- ✅ Squad selection and transformation framework
- ✅ Nexus Haven 3D hub world

## Next Steps (DRSM & Progression)

Foundation for Dynamic Reflection Saga Mode (DRSM) is in place:
- Character leveling framework with stat growth
- Artifact/gear customization slots (Core, Flow, Damage)
- Empathy gauge and purification system for resource economy
- Utility-based progression gating for story advancement
- Squad-based XP distribution across active heroes
