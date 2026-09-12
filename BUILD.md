# Build & Deployment Guide

Complete instructions for building, testing, and deploying Legends of Kai-Jax: The Memory Hero across all platforms.

## Table of Contents

1. [Requirements](#requirements)
2. [Fresh Install](#fresh-install)
3. [Development](#development)
4. [Testing](#testing)
5. [Production Build](#production-build)
6. [Verification](#verification)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [Performance Optimization](#performance-optimization)

---

## Requirements

### All Platforms
- **Node.js** — v20.x LTS (must be exactly 20.x)
- **pnpm** — v9.15.9 (enforced via `package.json` `packageManager` field)
- **Git** — for version control

### Platform-Specific

#### Web/Desktop (Windows, macOS, Linux)
- Node.js 20.x
- Git

#### iOS (macOS only)
- macOS with Xcode installed
- iOS deployment target: iOS 14+
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer account (for signing/App Store)

#### Android
- Java 17 (Zulu distribution recommended)
- Android SDK (API level 30+)
- Android NDK (for native compilation if needed)
- Gradle 8.x

---

## Fresh Install

### Step 1: Clone Repository

```bash
git clone https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero.git
cd Legends-of-Kai-Jax-The-memory-Hero
```

### Step 2: Install Node.js

**macOS (Homebrew):**
```bash
brew install node@20
brew link node@20
node --version  # Should be v20.x.x
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should be v20.x.x
```

**Windows:**
- Download from [nodejs.org](https://nodejs.org/en/download/package-manager) (v20 LTS)
- Or use Chocolatey: `choco install nodejs-lts`

### Step 3: Enable Corepack & Install pnpm

```bash
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm --version  # Should be 9.15.9
```

### Step 4: Install Dependencies

```bash
pnpm install --frozen-lockfile
```

The `--frozen-lockfile` flag ensures exact dependency versions are installed. If the lockfile and `package.json` drift, this command fails loudly rather than silently re-resolving.

### Verify Installation

```bash
pnpm -C apps/web build --version  # Should show Vite version
node --version                      # Should be v20.x.x
pnpm --version                      # Should be 9.15.9
```

---

## Development

### Start Dev Server

```bash
pnpm dev
```

This runs Vite dev server on **http://localhost:3000** with the following features:
- Hot Module Replacement (HMR) for instant updates
- Network accessible via `--host` flag (LAN IP printed in console)
- Source maps for debugging
- Live reload on file changes

**With Host Flag (for mobile testing on LAN):**
```bash
pnpm dev
# Output will show:
# ➜  Local:   http://localhost:3000
# ➜  Network: http://192.168.x.x:3000  ← Open on mobile device
```

### Development Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server (http://localhost:3000) |
| `pnpm dev:web` | Dev server for web app only |
| `pnpm typecheck` | Check TypeScript (Phase 0 scope) |
| `pnpm typecheck:full` | Full TypeScript check (may have pre-existing errors) |
| `pnpm lint` | ESLint code quality checks |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |

### Testing During Development

```bash
# Watch mode for unit tests (re-runs on file change)
pnpm -C apps/web test --watch

# Run specific test file
pnpm -C apps/web test -- combat.test.ts

# E2E tests (requires built app)
pnpm -C apps/web test:e2e
```

### Code Quality Gates

Before committing:

```bash
# Run the complete validation suite
pnpm validate:release

# Or run individually:
pnpm test                    # 82 tests
pnpm typecheck              # Type safety
pnpm lint:release           # Code style
pnpm build                  # Production build
```

---

## Testing

### Unit Tests

```bash
pnpm test
```

**Current Status:** 82 tests across 11 test files
- Combat system tests
- Input handling tests
- Game state tests
- Progression system tests

**Test Files Location:** `apps/web/src/**/*.test.ts`

### E2E Tests

```bash
pnpm -C apps/web test:e2e
```

**Current Tests:**
- Ashblock Heights completion (Kai and Jax)
- Mission launch and progression
- Enemy spawn and combat

**Requirements:**
- Built app (`pnpm build` must be run first)
- Playwright browsers (auto-installed via `npm install`)

### Running Specific Tests

```bash
# Run tests matching pattern
pnpm -C apps/web test -- combat

# Run specific file
pnpm -C apps/web test:e2e -- ashblock

# Watch mode (re-runs on file change)
pnpm -C apps/web test -- --watch
```

### Performance Profiling

```bash
# Profile dev build
pnpm dev
# Open DevTools → Performance tab → Record → Play game → Stop

# Profile production build
pnpm preview
# DevTools → Performance tab (same process)

# Memory profiling
pnpm preview
# DevTools → Memory tab → Take heap snapshot
```

---

## Production Build

### Basic Build

```bash
pnpm build
```

**Output:** `apps/web/dist/` (production-optimized bundle)

**Build Process:**
1. Runs TypeScript type check (Phase 0 scope)
2. Runs ESLint code quality checks
3. Bundles with Vite and tree-shakes unused code
4. Optimizes assets and compresses
5. Outputs to `dist/` directory

**Build Time:** ~17 seconds  
**Bundle Size:**
- JavaScript: ~856 KB (gzipped)
- CSS: ~48 KB (gzipped)
- Total: <1 MB gzipped

### Preview Production Build

```bash
pnpm -C apps/web preview --host
```

Serves the production bundle on **http://localhost:4173**. This is what actually gets deployed.

### Optimization Flags

```bash
# Skip type checking (faster, use only if types verified)
pnpm -C apps/web build -- --skip-type-check

# Detailed bundle analysis
pnpm -C apps/web build -- --analyze
```

---

## Verification

Before deploying to production, verify the build passes all gates:

### Pre-Deployment Checklist

```bash
# 1. Install dependencies fresh
pnpm install --frozen-lockfile

# 2. Run type checking
pnpm typecheck

# 3. Run unit tests
pnpm test

# 4. Run E2E tests
pnpm test:e2e

# 5. Build production bundle
pnpm build

# 6. Verify bundle integrity
pnpm validate:release
```

### Manual Verification

```bash
# 1. Build and preview locally
pnpm build
pnpm -C apps/web preview --host

# 2. Open http://localhost:4173
# 3. Test key flows:
#    - Main menu loads
#    - LoreHub displays
#    - Story mode starts
#    - Gameplay runs smoothly
#    - Pause/resume works
#    - Save/load works

# 4. Check performance
#    - Open DevTools (F12)
#    - Monitor → Performance tab
#    - Record 30 seconds of gameplay
#    - Check for frame drops or stutter
#    - Target: 60 FPS sustained
```

### Browser Compatibility

**Tested & Verified:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Browsers:**
- Safari iOS 14+
- Chrome Android 90+
- Samsung Internet 14+

---

## Deployment

### Primary: Vercel (Recommended)

Vercel is the recommended deployment platform. Auto-deploys on push to `main`.

#### One-Time Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel (interactive setup)
cd apps/web
vercel
```

Follow prompts:
1. Link to existing Vercel project or create new
2. Configure settings (should auto-detect):
   - **Framework:** Vite
   - **Root Directory:** `apps/web`
   - **Build Command:** `pnpm install --frozen-lockfile && pnpm build`
   - **Output Directory:** `dist`

#### Automatic Deployment

Once Vercel is linked, every push to `main` auto-deploys:

```bash
git push origin main
# Vercel CI/CD triggers automatically
# ~2 minutes later: live at https://legends-of-kai-jax-the-memory-hero.vercel.app
```

#### Manual Deployment

```bash
cd apps/web
vercel --prod
```

### Alternative: GitHub Pages

For free static hosting via GitHub Pages:

```bash
# Build production bundle
pnpm build

# Deploy to gh-pages branch
pnpm -C apps/web deploy:gh-pages
```

Hosted at: `https://bboy9090.github.io/Legends-of-Kai-Jax-The-memory-Hero/`

### Alternative: Self-Hosted (Node.js Server)

```bash
# Build
pnpm build

# Serve locally
pnpm start
# Opens http://localhost:5000

# Deploy to your server
# 1. Copy apps/web/dist/* to your web server root
# 2. Configure server to redirect all routes to index.html (SPA)
# 3. Enable gzip compression for assets
```

**Nginx Config Example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/apps/web/dist;

    gzip on;
    gzip_types text/plain text/css application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Mobile Deployment

### iOS (Capacitor)

#### Prerequisites
- macOS with Xcode
- iOS deployment target: iOS 14+
- Apple Developer account

#### Build Steps

```bash
# 1. Build web app
pnpm build

# 2. Sync with Capacitor
pnpm -C apps/web cap:sync

# 3. Open Xcode project
pnpm -C apps/web cap:open

# 4. In Xcode:
#    a. Select target device/simulator
#    b. Select Product → Build
#    c. Wait for build to complete
#    d. Run on device (Product → Run)
```

#### App Store Submission

```bash
# See docs/ios/APP_STORE_BUILD.md for detailed instructions
# Overview:
# 1. Set up signing certificate in Xcode
# 2. Configure App ID and provisioning profile
# 3. Build for archive
# 4. Upload to App Store Connect
# 5. Submit for review
```

### Android (Capacitor)

#### Prerequisites
- Java 17 (Zulu)
- Android SDK API 30+
- Android Virtual Device (AVD) or physical device

#### Build Steps

```bash
# 1. Build web app
pnpm build

# 2. Sync with Capacitor
pnpm -C apps/web cap:sync

# 3. Build APK
cd apps/web/android
gradle assembleDebug  # Debug APK
gradle assembleRelease  # Release APK (requires signing)

# 4. Install on device
adb install build/outputs/apk/debug/app-debug.apk
```

#### Release Build (Google Play Store)

```bash
# 1. Create keystore (one-time)
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias release

# 2. Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore release.keystore \
  build/outputs/apk/release/app-release-unsigned.apk release

# 3. Align APK
zipalign -v 4 build/outputs/apk/release/app-release-unsigned.apk \
  build/outputs/apk/release/app-release.apk

# 4. Upload to Google Play Console
# See docs for Google Play Store submission steps
```

### Desktop (Electron)

#### Build Executables

```bash
# Build for current OS
pnpm desktop:build

# Build for specific OS
pnpm -C apps/desktop build:win   # Windows
pnpm -C apps/desktop build:mac   # macOS
pnpm -C apps/desktop build:linux # Linux
```

**Output:** `apps/desktop/dist/` contains platform-specific executables

#### Development Mode

```bash
pnpm desktop:dev
```

Launches Electron app in development with hot reload.

---

## Troubleshooting

### Build Failures

#### "error: Unknown option '--skip-type-check'"
Solution: Remove the flag. TypeScript checking is always run in production builds.

```bash
pnpm build  # Correct
# pnpm build --skip-type-check  # Don't do this
```

#### "error: Module not found"
Solution: Reinstall dependencies with frozen lockfile.

```bash
pnpm install --frozen-lockfile
pnpm build
```

#### "error: Out of memory during build"
Solution: Increase Node.js memory limit.

```bash
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

### Test Failures

#### "Playwright browser not found"
Solution: Install Playwright browsers.

```bash
npx playwright install
pnpm test:e2e
```

#### "Cannot find module '@beast-kin/...'"
Solution: Workspace dependencies not linked.

```bash
pnpm install --frozen-lockfile
pnpm test
```

### Deployment Issues

#### "Build succeeds locally but fails on Vercel"
Solution: Verify Node.js version matches.

```bash
# Local
node --version  # Should be v20.x.x

# Vercel settings: Set Node.js version to 20 in project settings
```

#### "App shows 404 after deployment"
Solution: SPA routing not configured.

```bash
# Vercel: Auto-detected if vercel.json is correct
# Nginx: Configure try_files $uri $uri/ /index.html;
# Other: See documentation for your hosting provider
```

#### "Assets return 404 on live site"
Solution: Public path misconfiguration.

```bash
# Check vite.config.ts
# base: '/'  # For root domain
# base: '/game/'  # For subdirectory
```

---

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze  # Or use build tool's analysis

# Identify large modules
# Common culprits: Three.js, @react-three/fiber, PostProcessing
```

### Reducing Bundle Size

| Change | Impact | Difficulty |
|--------|--------|------------|
| Tree-shake unused Three.js | -50 KB | Easy |
| Lazy-load PostFX | -30 KB | Medium |
| Code split by route | -20 KB | Medium |
| Remove console logs | -10 KB | Easy |

### Runtime Performance

#### Frame Rate Optimization
- Target: 60 FPS on mid-range mobile (2 years old)
- Current: 48+ FPS with 9 enemies (Phase 5.5)
- Monitor: DevTools → Performance → Record

#### Memory Usage
- Target: <150 MB on iOS, <200 MB on Android
- Current: 168 MB average
- Monitor: DevTools → Memory → Take snapshot

#### Load Time
- Target: <3 seconds initial load, <1 second mission start
- Current: 2.8s average (measured in Phase 5.5)
- Optimize: Asset compression, lazy loading

### Device-Specific Optimization

```bash
# Test on multiple devices
pnpm dev --host  # Access from any device on LAN

# DevTools on Android (USB debugging)
chrome://inspect  # Inspect connected Android device

# DevTools on iOS
# Use Safari: Develop → [Device] → [App]
```

---

## CI/CD Pipeline

### GitHub Actions

The repository includes CI workflows that run on every push:

```bash
# .github/workflows/
build.yml          # Build & test
android-build.yml  # Android APK generation
registry-validate.yml  # Asset registry validation
```

**View CI Status:**
```bash
git log --oneline
# Open commit link on GitHub to see CI results
```

**Local CI Simulation:**
```bash
# Run same commands as CI
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm typecheck
```

---

## Summary

### Quick Start (Development)
```bash
pnpm install --frozen-lockfile
pnpm dev
# Open http://localhost:3000
```

### Quick Deploy (Production)
```bash
pnpm validate:release  # Run full validation
git push origin main   # Push to trigger Vercel deploy
# Wait ~2 minutes for live deployment
```

### Complete Release Flow
```bash
pnpm install --frozen-lockfile
pnpm validate:release
pnpm build
pnpm -C apps/web preview --host  # Verify locally
git push origin main              # Deploy to Vercel
# Verify live at https://legends-of-kai-jax-the-memory-hero.vercel.app
```

---

**Last Updated:** Phase 5.5  
**Build System:** Vite + Capacitor + Electron-Builder  
**Status:** ✅ Production Ready
