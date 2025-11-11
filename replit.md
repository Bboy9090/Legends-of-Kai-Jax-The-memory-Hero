# Super Smash Heroes: Battle Royale

## Overview

A preschool-friendly 3D fighting game built with React and Three.js featuring Jaxon and Kaison alongside spoof versions of beloved gaming characters. Players choose from a roster of 12 unique fighters and battle in colorful arenas with simple, easy-to-learn controls. The game features character selection, unlockable fighters, multiple battle stages, and kid-friendly combat mechanics designed for children aged 4-8.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the main application framework
- **Three.js with React Three Fiber** for 3D rendering and game engine
- **Zustand** for state management across multiple game stores (game phase, runner mechanics, audio, choices)
- **Tailwind CSS** with custom design system for UI components
- **Vite** as the build tool with hot module replacement for development

### Component Structure
- **Game States**: Menu, character selection, playing, paused, choice mode, AI assistant demo
- **3D Components**: Player characters, enemies, collectibles, environment, particle effects
- **UI Components**: Radix UI primitives with custom styling for accessibility
- **Game Logic**: Collision detection, object generation, physics simulation

### State Management Pattern
- **useGame**: Core game phase management (ready, playing, ended)
- **useRunner**: Game mechanics (player movement, scoring, collision detection)
- **useAudio**: Sound effects and music management
- **useChoices**: Social-emotional learning scenario management

### Game Architecture
- **Fighting Game Mechanics**: Arena-based combat with simple punch, kick, jump, and special moves
- **Character Roster**: 12 playable fighters including Jaxon, Kaison, and spoof versions of Mario (Marlo), Sonic (Speedy), Link (Flynn), and more
- **Arena System**: 6 colorful battle stages with varying platforms and visual themes
- **Combat System**: Health-based battles with damage, knockback, and victory/defeat states
- **Unlockables**: Fighters and arenas unlock as players earn points through battles

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