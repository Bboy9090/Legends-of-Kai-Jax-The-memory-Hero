#!/bin/bash

# Android Release Build Script
# Builds and signs the Android app for Google Play submission
# Usage: ./build-android-release.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WEB_DIR="$PROJECT_ROOT/apps/web"
ANDROID_DIR="$WEB_DIR/android"
BUILD_OUTPUT="$ANDROID_DIR/app/build/outputs"

# Options
SKIP_WEB_BUILD=false
SKIP_SYNC=false
TEST_BUILD=false
DRY_RUN=false

# Functions
print_header() {
  echo -e "\n${GREEN}========================================${NC}"
  echo -e "${GREEN}$1${NC}"
  echo -e "${GREEN}========================================${NC}\n"
}

print_step() {
  echo -e "\n${YELLOW}→ $1${NC}"
}

print_error() {
  echo -e "\n${RED}✗ Error: $1${NC}"
  exit 1
}

print_success() {
  echo -e "\n${GREEN}✓ $1${NC}"
}

show_usage() {
  cat << EOF
Usage: $(basename "$0") [options]

Options:
  -h, --help              Show this help message
  -s, --skip-web-build    Skip web build (use existing dist/)
  --skip-sync             Skip Capacitor sync
  -t, --test              Build debug APK instead of release AAB
  --dry-run               Show what would be built without building
  -v, --version VERSION   Set version code (default: read from build.gradle)

Examples:
  $(basename "$0")                    # Full release build
  $(basename "$0") -t                 # Build debug APK for testing
  $(basename "$0") -s                 # Use existing web build
  $(basename "$0") -v 2              # Set versionCode to 2

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_usage
      exit 0
      ;;
    -s|--skip-web-build)
      SKIP_WEB_BUILD=true
      shift
      ;;
    --skip-sync)
      SKIP_SYNC=true
      shift
      ;;
    -t|--test)
      TEST_BUILD=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -v|--version)
      VERSION_CODE="$2"
      shift 2
      ;;
    *)
      print_error "Unknown option: $1"
      ;;
  esac
done

# Pre-flight checks
print_header "Legends of Kai-Jax Android Build"
print_step "Checking prerequisites..."

# Check for required tools
command -v node >/dev/null 2>&1 || print_error "Node.js not found. Install from https://nodejs.org/"
command -v pnpm >/dev/null 2>&1 || print_error "pnpm not found. Install with: npm install -g pnpm"

if [ "$TEST_BUILD" = false ] && [ "$SKIP_WEB_BUILD" = false ]; then
  # Check for JDK
  command -v java >/dev/null 2>&1 || print_error "Java not found. Required for Gradle build"
fi

# Check directory structure
[ -d "$WEB_DIR" ] || print_error "Web app directory not found: $WEB_DIR"
[ -d "$ANDROID_DIR" ] || print_error "Android directory not found: $ANDROID_DIR"
[ -f "$WEB_DIR/capacitor.config.ts" ] || print_error "Capacitor config not found"

print_success "Prerequisites met"

# Step 1: Build web version
if [ "$SKIP_WEB_BUILD" = true ]; then
  print_step "Skipping web build (using existing dist/)"
  if [ ! -d "$WEB_DIR/dist" ]; then
    print_error "dist/ directory not found. Run 'pnpm build' first"
  fi
else
  print_header "Step 1: Building Web Version"
  print_step "Building web app with pnpm..."

  if [ "$DRY_RUN" = true ]; then
    echo "Would run: cd $WEB_DIR && pnpm build"
  else
    cd "$WEB_DIR"
    pnpm build
    print_success "Web build complete"
  fi
fi

# Step 2: Update version if specified
if [ -n "$VERSION_CODE" ]; then
  print_header "Step 2: Updating Version Code"
  print_step "Setting versionCode to $VERSION_CODE..."

  BUILD_GRADLE="$ANDROID_DIR/app/build.gradle"
  if [ "$DRY_RUN" = true ]; then
    echo "Would update $BUILD_GRADLE with versionCode = $VERSION_CODE"
  else
    # Use sed to update versionCode
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s/versionCode [0-9]\+/versionCode $VERSION_CODE/" "$BUILD_GRADLE"
    else
      # Linux
      sed -i "s/versionCode [0-9]\+/versionCode $VERSION_CODE/" "$BUILD_GRADLE"
    fi
    print_success "Version code updated to $VERSION_CODE"
  fi
fi

# Step 3: Capacitor sync
if [ "$SKIP_SYNC" = true ]; then
  print_step "Skipping Capacitor sync"
else
  print_header "Step 3: Syncing with Capacitor"
  print_step "Syncing Android platform..."

  if [ "$DRY_RUN" = true ]; then
    echo "Would run: cd $WEB_DIR && npx cap sync android"
  else
    cd "$WEB_DIR"
    npx cap sync android
    print_success "Capacitor sync complete"
  fi
fi

# Step 4: Build Android
print_header "Step 4: Building Android Application"

if [ "$TEST_BUILD" = true ]; then
  # Debug APK for testing
  print_step "Building debug APK..."

  if [ "$DRY_RUN" = true ]; then
    echo "Would run: cd $ANDROID_DIR && ./gradlew assembleDebug"
  else
    cd "$ANDROID_DIR"
    ./gradlew assembleDebug
    APK_PATH="$BUILD_OUTPUT/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
      print_success "Debug APK built: $APK_PATH"
      ls -lh "$APK_PATH"
    else
      print_error "APK not found at expected location"
    fi
  fi
else
  # Release AAB for Google Play
  print_step "Building release AAB (requires signing configuration)..."

  # Check for signing.properties or environment variables
  if [ ! -f "$ANDROID_DIR/signing.properties" ]; then
    if [ -z "$RELEASE_KEY_STORE_PATH" ]; then
      print_error "Signing configuration not found. Create signing.properties or set environment variables"
    fi
    print_step "Using environment variables for signing"
  else
    print_step "Using signing.properties for signing"
    # Load signing properties
    export $(cat "$ANDROID_DIR/signing.properties" | grep -v '^#' | xargs)
  fi

  if [ "$DRY_RUN" = true ]; then
    echo "Would run: cd $ANDROID_DIR && ./gradlew bundleRelease"
  else
    cd "$ANDROID_DIR"
    ./gradlew bundleRelease
    AAB_PATH="$BUILD_OUTPUT/bundle/release/app-release.aab"
    if [ -f "$AAB_PATH" ]; then
      print_success "Release AAB built: $AAB_PATH"
      ls -lh "$AAB_PATH"
    else
      print_error "AAB not found at expected location"
    fi
  fi
fi

# Summary
print_header "Build Summary"

if [ "$DRY_RUN" = true ]; then
  echo "Dry run completed. No files were actually built."
  echo ""
  echo "To perform the actual build, run:"
  echo "  $(basename "$0")"
else
  if [ "$TEST_BUILD" = true ]; then
    echo "Debug APK ready for testing on device/emulator"
    echo ""
    echo "To install on device:"
    echo "  adb install '$APK_PATH'"
  else
    echo "Release AAB ready for Google Play submission"
    echo ""
    echo "Next steps:"
    echo "  1. Upload $AAB_PATH to Google Play Console"
    echo "  2. Create release and fill in store listing"
    echo "  3. Submit for review"
  fi
fi

print_success "Build process complete!"
