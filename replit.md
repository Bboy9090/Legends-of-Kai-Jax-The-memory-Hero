# SMASH HEROES: WORLD COLLISION™

## Overview
SMASH HEROES: WORLD COLLISION™ is an epic open-world action RPG where a fractured multiverse leads to a collision of iconic realms and heroes. Players assemble 4-hero squads from a roster of 59 legendary fighters to explore a seamless world, battle dimensional rifts, unlock god-tier transformations, and build Nexus Haven—the last bastion against the Void King. The game blends elements of Marvel Ultimate Alliance, Smash, and FF7R, focusing on exploration, battle missions, team synergy, and challenging boss encounters.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Frameworks**: React 18 with TypeScript
- **3D Rendering**: Three.js with React Three Fiber
- **State Management**: Zustand for game-specific stores
- **Styling**: Tailwind CSS with a custom design system
- **Build Tool**: Vite

### Core Game Systems
- **Roster**: 59 unique characters with defined roles (Vanguard, Blitzer, Mystic, Support, Wildcard, Tank, Sniper, Controller).
- **Squad System**: 4-hero teams with tag switching, entrance strikes, revival mechanics, and passive buffs.
- **Story Mode**: 100 missions across 9 Acts, featuring multi-phase bosses with adaptive AI and cinematic sequences.
- **Open World**: 5 distinct zones (Green Hill Frontier, Hyrule Plateau, Mushroom Kingdom Plains, Dreamland Skies, Corneria Outlands) with unique challenges and mechanics.
- **Endgame Modes**: 8 diverse modes including Rift Gauntlet, Harmonarch Trials, OmegaBoss Raids, and the ultimate Void King Rematch.
- **Team Synergies**: Over 100 unique team bonuses that dynamically enhance stats and combat effectiveness.
- **Transformation System**: 4-stage transformations (Base → Super → Chaos → Celestial → Hyper) for characters.
- **Combat Formula**: Advanced fighting mechanics incorporating weight distribution, center of gravity tracking, and dynamic power calculations.

### Game Modes
- **Story Mode**: A comprehensive 9-Act saga.
- **Versus Mode**: Fully playable 4v4 battles against AI with character selection and real-time controls.
- **Additional Modes**: 12 diverse modes including Legacy Mode, Gauntlet of Gods, Riftbreak Survival, and Open Zone Expeditions.

### Combat Mechanics
- **Character Selection**: Marvel vs Capcom-style grid with keyboard and mouse navigation.
- **3D Battle Arena**: Colorful, Roblox-style visuals with dynamic lighting.
- **Real-Time Combat**: Team health management, active character switching, combo counter, special meter, and enemy AI.
- **Controls**: Keyboard (J/1 for Attack, L/2 for Special, A/D or Arrows for Tag) and mouse support.

### Data Layer
Game data is organized in dedicated client-side TypeScript files for:
- Roster (`roster.ts`)
- Missions (`missions.ts`)
- Bosses (`bosses.ts`)
- Zones (`zones.ts`)
- Endgame Modes (`endgameModes.ts`)
- Team System (`teamSystem.ts`)
- Story Mode structure (`storyMode.ts`)
- Team Synergies (`teamSynergy.ts`)

## External Dependencies

### Database & Backend
- **ORM**: Drizzle ORM (PostgreSQL dialect)
- **Database**: Neon Database (serverless PostgreSQL)
- **API**: Express.js with TypeScript

### AI Integration
- **Generative AI**: Google Generative AI (Gemini 2.5 Flash) for chat and text analysis.

### 3D Graphics & Animation
- **React Three Fiber Ecosystem**: `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- **Custom Visuals**: GLSL shader support.

### UI & Accessibility
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Game-Specific Libraries
- **Server State**: TanStack Query
- **Client State**: Zustand
```