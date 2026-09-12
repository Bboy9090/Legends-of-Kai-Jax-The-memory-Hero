#!/bin/bash

# iOS Build Quick Start Script
# Guides through the complete iOS build process step by step

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "Legends of Kai-Jax iOS Build Quick Start"
echo "=============================================="
echo ""

# Check prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

# Check macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "Error: This script requires macOS"
  exit 1
fi

# Check Xcode
if ! command -v xcodebuild &> /dev/null; then
  echo "Error: Xcode is not installed"
  echo "Install from: https://apps.apple.com/app/xcode/id497799835"
  exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  echo "Error: pnpm is not installed"
  echo "Install with: npm install -g pnpm"
  exit 1
fi

# Check CocoaPods
if ! command -v pod &> /dev/null; then
  echo "Warning: CocoaPods is not installed"
  echo "Install with: sudo gem install cocoapods"
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "Prerequisites check passed!"
echo ""

# Step 2: Build web app
echo "Step 2: Building web application..."
cd "$PROJECT_ROOT"

if [ ! -d "apps/web" ]; then
  echo "Error: apps/web directory not found"
  exit 1
fi

cd apps/web

echo "Running: pnpm build"
pnpm build

if [ ! -d "dist" ]; then
  echo "Error: Build failed - no dist directory created"
  exit 1
fi

echo "Web build successful!"
echo ""

# Step 3: Sync Capacitor
echo "Step 3: Syncing Capacitor..."
echo "Running: pnpm cap sync ios"
pnpm cap sync ios

if [ ! -d "ios/App/ios" ] && [ ! -d "ios/App/Pods" ]; then
  echo "Note: iOS project may need CocoaPods setup"
  echo "Run: cd ios/App && pod install"
fi

echo "Capacitor sync complete!"
echo ""

# Step 4: Asset preparation
echo "Step 4: Preparing assets..."
echo ""
echo "You need to prepare:"
echo "  1. App Icon (1024x1024 PNG) - no transparency on edges"
echo "  2. Splash Screen (2732x2732 PNG) - optional but recommended"
echo ""
echo "To generate icons from source:"
echo "  chmod +x $SCRIPT_DIR/generate-ios-icons.sh"
echo "  $SCRIPT_DIR/generate-ios-icons.sh /path/to/1024x1024-icon.png"
echo ""
echo "To generate splash from source:"
echo "  chmod +x $SCRIPT_DIR/generate-ios-splash.sh"
echo "  $SCRIPT_DIR/generate-ios-splash.sh /path/to/splash-image.png"
echo ""
read -p "Have you prepared and generated the icons and splashes? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Please prepare the assets and run this script again."
  exit 1
fi

# Step 5: Verify icons
echo ""
echo "Step 5: Verifying assets..."
ICON_DIR="$PROJECT_ROOT/apps/web/ios/App/App/Assets.xcassets/AppIcon.appiconset"
ICON_COUNT=$(find "$ICON_DIR" -name "*.png" 2>/dev/null | wc -l)

if [ $ICON_COUNT -lt 5 ]; then
  echo "Warning: Only $ICON_COUNT icons found (expected 15+)"
  echo "Location: $ICON_DIR"
else
  echo "Found $ICON_COUNT icons - looks good!"
fi

# Step 6: Code signing setup
echo ""
echo "Step 6: Code Signing Setup"
echo ""
echo "You need:"
echo "  1. Apple Developer Account (active)"
echo "  2. Distribution Certificate (Apple Distribution)"
echo "  3. Provisioning Profile (App Store)"
echo "  4. Team ID (from developer.apple.com)"
echo ""

echo "To find your Team ID:"
security find-identity -v -p codesigning | grep "Apple Distribution" || true

echo ""
echo "If you don't have a certificate:"
echo "  1. Go to: https://developer.apple.com/account"
echo "  2. Create App ID: com.bobbyblanco.legendsofkaijax"
echo "  3. Create Distribution Certificate"
echo "  4. Create Provisioning Profile"
echo "  5. Download and install both"
echo ""

read -p "Have you set up certificates and provisioning profiles? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Please set up code signing at: https://developer.apple.com/account"
  exit 1
fi

# Step 7: Open in Xcode
echo ""
echo "Step 7: Configuring Xcode..."
echo ""
echo "Opening Xcode to verify code signing..."
echo "Running: pnpm cap open ios"

cd "$PROJECT_ROOT/apps/web"
pnpm cap open ios

echo ""
echo "In Xcode:"
echo "  1. Select 'App' project in navigator"
echo "  2. Select 'App' target"
echo "  3. Go to 'Signing & Capabilities'"
echo "  4. Verify:"
echo "     - Team ID is set"
echo "     - Bundle ID is: com.bobbyblanco.legendsofkaijax"
echo "     - Code Signing Identity is: Apple Distribution"
echo "     - Provisioning Profile is assigned"
echo ""
echo "  5. Close Xcode when ready"
echo ""

read -p "Have you verified code signing in Xcode? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Please configure code signing in Xcode"
  exit 1
fi

# Step 8: Gather information for build
echo ""
echo "Step 8: Gathering build information..."
echo ""

# Get Team ID
echo "What is your Team ID? (10-character code from developer.apple.com)"
echo "You can find it with: security find-identity -v -p codesigning | grep 'Apple Distribution'"
read TEAM_ID

if [ -z "$TEAM_ID" ] || [ ${#TEAM_ID} -ne 10 ]; then
  echo "Error: Invalid Team ID. Must be 10 characters."
  exit 1
fi

# Get signing certificate
echo ""
echo "Available signing certificates:"
security find-identity -v -p codesigning | grep "Apple Distribution"

echo ""
echo "Enter the full signing certificate name (e.g., 'Apple Distribution: Your Name ($TEAM_ID)')"
read SIGNING_CERT

if [ -z "$SIGNING_CERT" ]; then
  echo "Error: No certificate specified"
  exit 1
fi

# Get build number
BUILD_NUMBER=$(date +%s)
echo ""
echo "Build number: $BUILD_NUMBER (auto-generated from timestamp)"

# Step 9: Build and sign
echo ""
echo "Step 9: Building and signing app..."
echo ""

cd "$PROJECT_ROOT"

echo "Running build script with:"
echo "  Team ID: $TEAM_ID"
echo "  Certificate: $SIGNING_CERT"
echo "  Build Number: $BUILD_NUMBER"
echo ""

chmod +x "$SCRIPT_DIR/build-ios-ipa.sh"
"$SCRIPT_DIR/build-ios-ipa.sh" \
  --team-id "$TEAM_ID" \
  --signing-cert "$SIGNING_CERT" \
  --build-number "$BUILD_NUMBER"

# Step 10: Verify IPA
echo ""
echo "Step 10: Verifying IPA..."

IPA_FILE="$PROJECT_ROOT/apps/web/ios/App/build/output/App.ipa"

if [ -f "$IPA_FILE" ]; then
  echo "IPA file created: $IPA_FILE"
  echo "Size: $(du -h "$IPA_FILE" | cut -f1)"
  echo ""
  echo "Next steps:"
  echo ""
  echo "Option A: Upload to TestFlight"
  echo "  1. Open App Store Connect: https://appstoreconnect.apple.com"
  echo "  2. Go to TestFlight > Builds"
  echo "  3. Upload the IPA or drag/drop into Xcode Organizer"
  echo ""
  echo "Option B: Upload directly to App Store (after TestFlight testing)"
  echo "  1. Go to App Store Connect"
  echo "  2. Select build"
  echo "  3. Add for Review"
  echo "  4. Submit for Review"
  echo ""
  echo "For complete submission checklist, see:"
  echo "  docs/APP_STORE_SUBMISSION_CHECKLIST.md"
  echo ""
else
  echo "Error: IPA file not created"
  exit 1
fi

echo "=============================================="
echo "iOS Build Complete!"
echo "=============================================="
