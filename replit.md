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
- **Game States**: Menu, Nexus Haven hub, squad selection, character select, battle mode, customization
- **3D Components**: Nexus Haven hub world, dimensional rift portals, player characters, enemies, environment
- **UI Components**: Radix UI primitives with custom styling for accessibility
- **Game Logic**: Squad combat, transformation system, dimensional rifts, world progression

### State Management Pattern (RPG Stores)
- **useGame**: Core game phase management (ready, playing, ended)
- **useRunner**: Game mechanics and game state routing
- **useWorldState**: RPG progression (zones, rifts, Nexus Haven level, recruited heroes, Void King weakness)
- **useSquad**: Squad management (3-hero party, active hero, synergy bonuses, stats)
- **useTransformations**: Power-up system (transformation levels, energy meters, unlocks)
- **useBattle**: Combat mechanics (fighters, health, attacks)
- **useAudio**: Sound effects and music management

### Game Architecture: World Collision RPG

**Core Systems (IMPLEMENTED):**
- ✅ **Nexus Haven Hub**: 3D central hub with dimensional rift portals, squad management, and progression tracking
- ✅ **Squad Selection**: Choose 3 heroes from recruited roster with synergy bonus calculations
- ✅ **Transformation System**: Energy meters and power-up states (Base → Super → Hyper/Ultimate)
- ✅ **Character Bios**: Cinematic backstories, specialties, ultimate attacks, and transformation paths for all heroes
- ✅ **World State Management**: Zone discovery, rift tracking, Nexus level, hero recruitment, Void King weakness
- ✅ **Mythic Opening**: Epic narration introducing the fractured multiverse and Void King threat

**Core Systems (PLANNED):**
- **Open World Zones**: Seamless exploration across Green Hill-Hyrule, Dream Land Skies, Lylat Ruins, etc.
- **Dimensional Rifts**: Reality tears spawning Echo bosses with rare rewards
- **Squad Combat**: Tag combos, assist attacks, synchronized ultimates in battle
- **Story Mode**: Cinematic cutscenes, emotional arcs, world-boss invasions
- **Expanded Roster**: 30+ additional heroes with unique quests and abilities

**Combat Evolution:**
- **Base Combat**: Punch, kick, jump, dodge, special moves (existing battle system)
- **Squad Synergy**: Tag combos, assist attacks (to implement)
- **Transformation System**: Energy meters unlock god-tier forms mid-battle (framework ready)
- **Rift Mechanics**: Enter portals for Echo boss fights (portals visualized, mechanics pending)

### Mobile-First Design
- **Touch Controls**: Gesture-based input system with swipe and tap recognition
- **Responsive UI**: Tailwind CSS with mobile-optimized layouts
- **Performance Optimization**: Efficient 3D rendering with object pooling and LOD systems

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