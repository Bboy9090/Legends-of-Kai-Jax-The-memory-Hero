#!/bin/bash
# Build iOS Release IPA for Apple App Store
# Run this locally on macOS with Xcode 15+ and valid Apple Developer certificate

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  iOS RELEASE BUILD - Legends of Kai-Jax                   ║"
echo "║  Target: Apple App Store                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Web build
echo "Step 1: Building production web assets..."
cd apps/web
pnpm install --frozen-lockfile
pnpm build
echo "✓ Web build complete"
echo ""

# Step 2: Sync to Capacitor iOS
echo "Step 2: Syncing to Capacitor iOS..."
npx cap sync ios
echo "✓ Capacitor iOS sync complete"
echo ""

# Step 3: Configure signing (manual - requires user input)
echo "Step 3: Configuring Xcode signing..."
echo ""
echo "⚠️  Manual step required:"
echo "1. Open Xcode: open ios/App/App.xcodeproj"
echo "2. Select 'App' target"
echo "3. Go to 'Signing & Capabilities'"
echo "4. Select your Apple Developer Team"
echo "5. Set Bundle ID: com.yourcompany.kaijaxtthememoryheroe"
echo "6. Set Version: 1.0"
echo "7. Set Build: 1"
echo ""
read -p "Press Enter once you've configured signing in Xcode..."
echo ""

# Step 4: Build for archive
echo "Step 4: Building for archive..."
cd ios/App

xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath "../../build/App.xcarchive" \
  archive

echo "✓ Archive created"
echo ""

# Step 5: Export IPA
echo "Step 5: Exporting IPA for App Store..."

xcodebuild -exportArchive \
  -archivePath "../../build/App.xcarchive" \
  -exportPath "../../build/Exports" \
  -exportOptionsPlist ExportOptions.plist

echo ""
echo "✓ Build complete!"
echo ""
echo "📦 Release IPA location:"
echo "   build/Exports/Legends of Kai-Jax.ipa"
echo ""
echo "Next steps:"
echo "1. Upload to App Store Connect using Transporter app"
echo "2. Go to https://appstoreconnect.apple.com"
echo "3. Submit for App Store review"
echo ""
