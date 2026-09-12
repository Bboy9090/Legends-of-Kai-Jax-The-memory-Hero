#!/bin/bash

# iOS App Store Build Script
# Builds and signs the iOS app for App Store submission
# Usage: ./build-ios-ipa.sh --team-id <TEAM_ID> --signing-cert <CERT_NAME> [--build-number <NUMBER>]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WEB_DIR="$PROJECT_ROOT/apps/web"
IOS_PROJECT="$WEB_DIR/ios/App/App.xcodeproj"
IOS_WORKSPACE="$WEB_DIR/ios/App/App.xcworkspace"

# Default values
CONFIGURATION="Release"
SCHEME="App"
DEVICE="generic/platform=iOS"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --team-id)
      TEAM_ID="$2"
      shift 2
      ;;
    --signing-cert)
      SIGNING_CERT="$2"
      shift 2
      ;;
    --build-number)
      BUILD_NUMBER="$2"
      shift 2
      ;;
    --code-sign-identity)
      CODE_SIGN_IDENTITY="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 --team-id <TEAM_ID> --signing-cert <CERT_NAME> [--build-number <NUMBER>] [--code-sign-identity <IDENTITY>]"
      exit 1
      ;;
  esac
done

# Validate required arguments
if [ -z "$TEAM_ID" ] || [ -z "$SIGNING_CERT" ]; then
  echo "Error: Missing required arguments"
  echo ""
  echo "Usage: $0 --team-id <TEAM_ID> --signing-cert <CERT_NAME> [--build-number <NUMBER>]"
  echo ""
  echo "Example: $0 --team-id ABC123DEF --signing-cert 'Apple Distribution: Company (ABC123DEF)'"
  echo ""
  echo "To find your Team ID and Certificate:"
  echo "1. Open Xcode Settings > Accounts"
  echo "2. Select your account and view details"
  echo "3. Find your Team ID"
  echo "4. List installed certificates: security find-identity -v -p codesigning"
  exit 1
fi

# Use provided build number or increment from Info.plist
if [ -z "$BUILD_NUMBER" ]; then
  BUILD_NUMBER=$(date +%s)
  echo "Using timestamp as build number: $BUILD_NUMBER"
fi

# Use provided code sign identity or default
if [ -z "$CODE_SIGN_IDENTITY" ]; then
  CODE_SIGN_IDENTITY="Apple Distribution"
fi

echo "==========================================="
echo "iOS App Store Build Configuration"
echo "==========================================="
echo "Team ID: $TEAM_ID"
echo "Signing Certificate: $SIGNING_CERT"
echo "Build Number: $BUILD_NUMBER"
echo "Code Sign Identity: $CODE_SIGN_IDENTITY"
echo "Configuration: $CONFIGURATION"
echo "Workspace: $IOS_WORKSPACE"
echo "==========================================="
echo ""

# Step 1: Build the web app
echo "Step 1: Building web app..."
cd "$WEB_DIR"
pnpm build
echo "Web app built successfully!"
echo ""

# Step 2: Sync Capacitor
echo "Step 2: Syncing Capacitor..."
pnpm cap sync ios
echo "Capacitor sync complete!"
echo ""

# Step 3: Check if workspace exists
if [ ! -d "$IOS_WORKSPACE" ]; then
  echo "Error: iOS workspace not found at $IOS_WORKSPACE"
  echo "Try running: pnpm cap add ios"
  exit 1
fi

# Step 4: Build for iOS
echo "Step 3: Building iOS archive..."
cd "$WEB_DIR/ios/App"

# Clean build
xcodebuild \
  -workspace "$IOS_WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -derivedDataPath build \
  clean

# Archive
xcodebuild \
  -workspace "$IOS_WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -derivedDataPath build \
  -archivePath "build/$SCHEME.xcarchive" \
  -destination "$DEVICE" \
  archive \
  PROVISIONING_PROFILE_SPECIFIER="Legends of Kai-Jax Distribution" \
  CODE_SIGN_IDENTITY="$CODE_SIGN_IDENTITY" \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CURRENT_PROJECT_VERSION="$BUILD_NUMBER"

echo "Archive created successfully!"
echo ""

# Step 5: Export to IPA
echo "Step 4: Exporting to IPA..."

# Create export options plist
cat > ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>method</key>
  <string>app-store</string>
  <key>teamID</key>
  <string>$TEAM_ID</string>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>thinning</key>
  <string><none></string>
</dict>
</plist>
EOF

# Export archive to IPA
xcodebuild \
  -exportArchive \
  -archivePath "build/$SCHEME.xcarchive" \
  -exportPath "build/output" \
  -exportOptionsPlist "ExportOptions.plist" \
  -allowProvisioningUpdates

IPA_FILE="build/output/$SCHEME.ipa"

if [ -f "$IPA_FILE" ]; then
  echo ""
  echo "==========================================="
  echo "Build Complete!"
  echo "==========================================="
  echo "IPA file: $IPA_FILE"
  echo "Size: $(du -h "$IPA_FILE" | cut -f1)"
  echo ""
  echo "Next steps:"
  echo "1. Verify the IPA with: xcrun altool --validate-app -f $IPA_FILE -t ios -u <APPLE_ID> -p <PASSWORD>"
  echo "2. Upload to TestFlight with: xcrun altool --upload-app -f $IPA_FILE -t ios -u <APPLE_ID> -p <PASSWORD>"
  echo ""
  echo "Or using Xcode:"
  echo "1. Open Xcode"
  echo "2. Window > Organizer"
  echo "3. Select the archive"
  echo "4. Click 'Distribute App' and choose 'App Store Connect'"
  echo "==========================================="
else
  echo "Error: IPA file not created"
  exit 1
fi

# Cleanup
rm -f ExportOptions.plist
