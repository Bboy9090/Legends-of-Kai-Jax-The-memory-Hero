# Hyper Sonic Heroes: Kindness Quest

## Overview

A mobile-focused 3D superhero endless runner game built with React and Three.js that combines fast-paced action with social-emotional learning (SEL). Players control twin brothers Jaxon and Kaison, each with unique sonic abilities, as they dash through cityscapes, battle grumpy robots, and make kindness-based choices that affect gameplay. The game features multiple phases including character selection, endless running mechanics, and choice-driven scenarios that teach empathy and social skills to children aged 4-8.

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
- **Endless Runner Mechanics**: Procedural generation of obstacles, enemies, and collectibles
- **Character System**: Two playable characters (Jaxon and Kaison) with unique abilities and visual styles
- **Choice Mode**: Pause-and-choose system for kindness scenarios that reward players with gameplay benefits
- **Collision System**: AABB collision detection for player-object interactions

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