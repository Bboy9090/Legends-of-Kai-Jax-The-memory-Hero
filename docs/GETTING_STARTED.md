# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 LTS or higher
- **pnpm**: Version 8 or higher (install with `npm install -g pnpm`)
- **Git**: For version control

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/Bboy9090/Smash-Hereos.git
cd Smash-Hereos
```

2. **Install dependencies**

```bash
pnpm install
```

This will install all dependencies for the monorepo and its packages.

3. **Build the packages**

```bash
pnpm build
```

This compiles all TypeScript packages.

## Development

### Running in Development Mode

```bash
pnpm dev
```

This starts all packages in watch mode. Changes will automatically recompile.

### Building for Production

```bash
pnpm build
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

### Formatting

```bash
# Format all files
pnpm format

# Check formatting
pnpm format:check
```

## Project Structure

- `packages/shared` - Shared types, utilities, and constants
- `packages/engine` - Core game engine (physics, combat, input, etc.)
- `packages/characters` - Fighter system and character implementations
- `packages/ui` - React UI components (TODO)
- `apps/web` - Web game application (TODO)
- `apps/mobile` - Capacitor mobile app (TODO)

## Next Steps

- Read the [Architecture](ARCHITECTURE.md) documentation
- Learn how to [create a character](CHARACTER_GUIDE.md)
- Understand the [combat system](COMBAT_SYSTEM.md)
