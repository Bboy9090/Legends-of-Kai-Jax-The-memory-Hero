#!/bin/bash
# Build Android Release APK for Google Play Store
# Run this locally on a machine with Android SDK, Java 17+, and Gradle

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ANDROID RELEASE BUILD - Legends of Kai-Jax               ║"
echo "║  Target: Google Play Store                                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Web build
echo "Step 1: Building production web assets..."
cd apps/web
pnpm install --frozen-lockfile
pnpm build
echo "✓ Web build complete"
echo ""

# Step 2: Sync to Capacitor
echo "Step 2: Syncing to Capacitor Android..."
npx cap sync android
echo "✓ Capacitor sync complete"
echo ""

# Step 3: Build release APK
echo "Step 3: Building release APK..."
cd android

# Check if gradlew exists and is executable
if [ ! -x gradlew ]; then
    chmod +x gradlew
fi

# Build release APK
echo "Running Gradle assembleRelease..."
./gradlew assembleRelease --stacktrace

echo ""
echo "✓ Build complete!"
echo ""
echo "📦 Release APK location:"
echo "   apps/web/android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "Next steps:"
echo "1. Sign APK with your keystore (if not already configured in build.gradle)"
echo "2. Upload to Google Play Console"
echo "3. Create release on Production track"
echo ""
