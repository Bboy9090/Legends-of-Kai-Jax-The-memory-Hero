# Legends of Kai-Jax: iOS Build Readiness Guide

Complete guide for preparing and submitting the iOS app to the App Store.

## Prerequisites

### System Requirements
- macOS 12.0 or later
- Xcode 14.0 or later
- CocoaPods
- Apple Developer Account (active subscription)
- iOS 15+ compatible device for testing (optional)

### Installation

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods (if not already installed)
sudo gem install cocoapods

# Install ImageMagick for icon/splash generation (optional)
brew install imagemagick
```

## Phase 1: Web Build Preparation

### 1.1 Build the Web Application

```bash
cd /home/user/Legends-of-Kai-Jax-The-memory-Hero

# Build the web app
pnpm build

# Verify build output
ls -la apps/web/dist/
```

The build output should include:
- `index.html`
- JavaScript bundles
- Asset files (images, models, etc.)
- CSS files

### 1.2 Testing Web Build Locally

```bash
# Preview the production build
pnpm preview

# The web app should be accessible at http://localhost:5000
# Test in Safari: Verify Three.js rendering, controls, and responsive layout
```

## Phase 2: Assets Preparation

### 2.1 App Icons

The app requires multiple icon sizes for different iOS devices:

**Required Icon Sizes:**
- iPhone: 40x40, 60x60, 120x120, 180x180 (pt)
- iPad: 20x20, 40x40, 29x29, 58x58, 76x76, 152x152, 167x167 (pt)
- App Store: 1024x1024

**Generate Icons from Source:**

First, prepare a 1024x1024 PNG image with:
- Square format (1024x1024 pixels)
- Transparent background (RGBA)
- Safe area: 90% of the image (safe content in center)
- No transparency on edges (solid background)

Then run the icon generation script:

```bash
chmod +x scripts/generate-ios-icons.sh
./scripts/generate-ios-icons.sh /path/to/your/1024x1024-icon.png
```

Generated icons will be placed in:
```
apps/web/ios/App/App/Assets.xcassets/AppIcon.appiconset/
```

**Manual Icon Setup:**

If you prefer manual setup:

1. Open Xcode: `pnpm cap open ios`
2. Navigate to: `App > App > Assets.xcassets > AppIcon`
3. Drag and drop icons to each size slot in Xcode's asset editor

### 2.2 Splash Screens

Generate splash screens for different device sizes:

```bash
chmod +x scripts/generate-ios-splash.sh
./scripts/generate-ios-splash.sh /path/to/your/splash-image.png
```

Splash screens should be:
- Dimensions: 2732x2732 or device-specific sizes
- Same branding as app icon
- Load quickly (pre-rendered, no animations)
- Aspect ratio appropriate for each device

Generated splashes will be placed in:
```
apps/web/ios/App/App/Assets.xcassets/Splash.imageset/
```

### 2.3 Verify Assets

```bash
# Check icon assets
ls -lh apps/web/ios/App/App/Assets.xcassets/AppIcon.appiconset/

# Check splash assets
ls -lh apps/web/ios/App/App/Assets.xcassets/Splash.imageset/
```

## Phase 3: Capacitor Synchronization

### 3.1 Add/Update iOS Platform

```bash
cd apps/web

# Add iOS platform (if not already added)
npx cap add ios

# Sync web build with iOS project
pnpm cap sync ios
```

This will:
- Copy the web app build to the iOS project
- Update Capacitor configuration
- Generate necessary native files

### 3.2 Verify Sync

```bash
# Check if iOS files are updated
ls -la ios/App/App/capacitor.config.json
ls -la ios/App/public/

# Open in Xcode to verify
pnpm cap open ios
```

## Phase 4: Code Signing Setup

### 4.1 Apple Developer Account Setup

1. **Create Apple Developer Account**
   - Visit: https://developer.apple.com/account
   - Sign in or create new account
   - Enroll in Apple Developer Program ($99/year)

2. **Create App ID**
   - Go to: https://developer.apple.com/account/resources/identifiers/list
   - Click "+" to register new App ID
   - Bundle ID: `com.bobbyblanco.legendsofkaijax` (or similar)
   - Capabilities: Game Controller (if using gamepads)

3. **Create Certificates**
   - Go to: https://developer.apple.com/account/resources/certificates/list
   - Create "Apple Distribution" certificate (for App Store)
   - Download the certificate (.cer file)

4. **Create Provisioning Profile**
   - Go to: https://developer.apple.com/account/resources/profiles/list
   - Create "App Store" provisioning profile
   - Select the App ID and Distribution certificate
   - Download the profile (.mobileprovision file)

### 4.2 Install Certificates Locally

```bash
# On macOS, double-click the .cer file to install in Keychain
# Or use command line:
security import MyCertificate.cer -k ~/Library/Keychains/login.keychain

# Verify certificate installation
security find-identity -v -p codesigning

# Look for: "Apple Distribution: Your Company Name (ABC123DEF)"
```

### 4.3 Configure Xcode

1. Open Xcode: `pnpm cap open ios`
2. Select the "App" project in the navigator
3. Select the "App" target
4. Go to "Signing & Capabilities"
5. Set:
   - Team ID: Your 10-character team ID
   - Bundle Identifier: `com.bobbyblanco.legendsofkaijax`
   - Signing Certificate: "Apple Distribution"
   - Provisioning Profile: "Legends of Kai-Jax Distribution"

### 4.4 Get Your Team ID

```bash
# List all teams
xcrun xcode-select -p
# Or check in Xcode: Xcode > Preferences > Accounts

# View certificate details
security find-identity -v -p codesigning | grep "Apple Distribution"
```

## Phase 5: Info.plist Configuration

### 5.1 Privacy Descriptions

The Info.plist has been updated with required privacy descriptions:

- **NSCameraUsageDescription**: Camera access for gameplay recording
- **NSMicrophoneUsageDescription**: Microphone for audio and multiplayer
- **NSGameControllerUsageDescription**: Game controller support
- **NSLocalNetworkUsageDescription**: Local network for multiplayer
- **MinimumOSVersion**: iOS 15.0

Verify the settings:

```bash
cat apps/web/ios/App/App/Info.plist | grep -A 2 "NSCamera\|NSMicrophone\|MinimumOSVersion"
```

### 5.2 Update Version Information

In Xcode:
1. Select App target > General
2. Set Version: `1.0.0` (must match iOS App Store requirements)
3. Set Build: `1` (increment for each build)

Or via command line:

```bash
# Set version in Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString 1.0.0" apps/web/ios/App/App/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion 1" apps/web/ios/App/App/Info.plist
```

## Phase 6: Build for App Store

### 6.1 Automated Build Script

Use the provided build script:

```bash
chmod +x scripts/build-ios-ipa.sh

./scripts/build-ios-ipa.sh \
  --team-id ABC123DEF \
  --signing-cert "Apple Distribution: Your Company (ABC123DEF)" \
  --build-number 1
```

### 6.2 Manual Build in Xcode

1. Open project: `pnpm cap open ios`
2. Select "App" scheme
3. Set build target to "Generic iOS Device"
4. Product > Archive
5. Wait for build to complete
6. Organizer window will open with archive
7. Click "Distribute App"
8. Select "App Store Connect"
9. Choose "Upload"

### 6.3 Build without Xcode (CLI)

```bash
cd apps/web/ios/App

# Clean
xcodebuild \
  -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  clean

# Archive
xcodebuild \
  -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath build/App.xcarchive \
  -destination generic/platform=iOS \
  archive

# Export
xcodebuild \
  -exportArchive \
  -archivePath build/App.xcarchive \
  -exportPath build/output \
  -exportOptionsPlist ExportOptions.plist
```

## Phase 7: iOS Simulator Testing

### 7.1 Run on iOS 15+ Simulator

```bash
# Build for simulator
xcodebuild \
  -workspace apps/web/ios/App/App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -destination "generic/platform=iOS Simulator" \
  build

# Or use Xcode
pnpm cap open ios
# Select iOS Simulator in Xcode
# Click Play button to build and run
```

### 7.2 Test Checklist

- [ ] App launches without crash
- [ ] Three.js scene renders correctly
- [ ] Game controls are responsive
- [ ] Touch input works (taps, swipes, gestures)
- [ ] Gamepad input works (if applicable)
- [ ] Audio plays correctly
- [ ] Camera/microphone permissions prompt appears
- [ ] No console errors
- [ ] Frame rate is stable (60 FPS)
- [ ] Memory usage is acceptable (< 500 MB)
- [ ] All game features are functional
- [ ] UI scales correctly on different device sizes

### 7.3 Performance Testing

```bash
# Monitor performance in Xcode
# Debug > Gauges: Select memory, CPU, GPU, energy

# Check for leaks
# Debug > Memory Graph
# Look for red indicators (memory leaks)

# Profile with Instruments
# Xcode > Product > Profile
# Select "Leaks" or "Allocations" templates
```

## Phase 8: App Store Connect Setup

### 8.1 Create App Record

1. Go to: https://appstoreconnect.apple.com
2. Click "Apps"
3. Click "+" to create new app
4. Bundle ID: `com.bobbyblanco.legendsofkaijax`
5. SKU: `legendsofkaijax-1` (internal identifier)
6. Fill in app information

### 8.2 Complete App Information

**Pricing and Availability:**
- Availability Date: When to release
- Price: Free or paid
- Territories: Where app is available

**General App Information:**
- Name: "Legends of Kai-Jax"
- Subtitle: "The Memory Hero - A Mythic Platform Fighter"
- Description: App description (4000 character max)
- Keywords: game, platform fighter, action, mythology
- Support URL: https://your-website.com/support
- Privacy Policy URL: https://your-website.com/privacy

**Version Information:**
- Version Number: 1.0
- Build Number: Match your archive build number
- What's New: "Initial release"

**App Preview and Screenshots:**
- Screenshots for iPhone and iPad (at least 2 each)
- App Preview video (optional but recommended)
- Show gameplay footage
- Highlight key features

### 8.3 Content Ratings

1. Fill out questionnaire:
   - Violence: Describe any violence in the game
   - Gambling: If applicable
   - Age ratings: Let Apple calculate ESRB/PEGI ratings

### 8.4 Review Information

- Demo account (if needed): Email and password
- Notes for Reviewer: Any information needed for testing
- Review Notes: "This is a platform fighter game with Three.js 3D graphics"

## Phase 9: Submit for Review

### 9.1 Upload Build

1. Open Xcode Organizer (Window > Organizer)
2. Select your archive
3. Click "Distribute App"
4. Select "App Store Connect"
5. Choose "Upload"
6. Follow prompts to upload

Or use command line:

```bash
# Validate
xcrun altool --validate-app \
  -f build/output/App.ipa \
  -t ios \
  -u your-apple-id@example.com \
  -p @keyfile

# Upload
xcrun altool --upload-app \
  -f build/output/App.ipa \
  -t ios \
  -u your-apple-id@example.com \
  -p @keyfile
```

### 9.2 Complete App Store Connect Setup

1. Select build
2. Add compliance information
3. Export Compliance: Set crypto usage
4. Add release notes
5. Select version for review

### 9.3 Submit for Review

1. Go to App Store Connect
2. Select your build
3. Click "Add for Review"
4. Review all information
5. Click "Submit for Review"

## Phase 10: After Submission

### 10.1 Monitor Review Status

- Email notifications about review progress
- Check App Store Connect for status updates
- Review typically takes 24-48 hours

### 10.2 If Rejected

1. Read rejection reason carefully
2. Make required changes
3. Increment build number
4. Re-submit new build

### 10.3 If Approved

1. You can schedule release or release immediately
2. App appears in App Store
3. Set up App Store Marketing (optional)

## Troubleshooting

### Build Errors

**Error: "No such file or directory: app-store.ipa"**
```bash
# Make sure workspace is being used, not project
xcodebuild -workspace App.xcworkspace ...
```

**Error: "Certificate is not valid for signing"**
```bash
# Re-install certificate
security import MyCertificate.cer -k ~/Library/Keychains/login.keychain

# Check certificate
security find-identity -v -p codesigning
```

**Error: "Provisioning profile not found"**
1. Download profile from developer.apple.com
2. Double-click to install in Xcode
3. Xcode > Preferences > Accounts > Download Profiles

### Xcode Issues

**"Unable to boot Simulator"**
```bash
# Reset simulator
xcrun simctl erase all
xcrun simctl create "iOS 15" com.apple.CoreSimulator.SimDeviceType.iPhone-13 com.apple.CoreSimulator.SimRuntime.iOS-15-4
```

**"Command line tools not found"**
```bash
xcode-select --install
xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### Code Signing Issues

```bash
# List available certificates
security find-identity -v -p codesigning

# Revoke certificate (if compromised)
# Go to developer.apple.com > Certificates > Revoke

# Create new certificate
# Go to developer.apple.com > Certificates > Request
```

## Useful Commands

```bash
# Build for App Store
pnpm build
pnpm cap sync ios
./scripts/build-ios-ipa.sh --team-id ABC123DEF --signing-cert "Apple Distribution: ..."

# Open in Xcode
pnpm cap open ios

# Check build info
xcodebuild -showBuildSettings -workspace ios/App/App.xcworkspace -scheme App

# List schemes
xcodebuild -workspace ios/App/App.xcworkspace -list

# Clean build
xcodebuild -workspace ios/App/App.xcworkspace -scheme App clean

# View provisioning profiles
security find-identity -v -p codesigning
ls ~/Library/MobileDevice/Provisioning\ Profiles/
```

## Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Xcode Help - Code Signing](https://help.apple.com/xcode/mac/current/#/dev3a05256b8)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Three.js Documentation](https://threejs.org/docs/)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Capacitor iOS docs: https://capacitorjs.com/docs/ios
3. Check Three.js performance guidelines
4. Contact Apple Developer Support

## Next Steps

1. Prepare 1024x1024 app icon and splash screen images
2. Run icon and splash generation scripts
3. Set up Apple Developer Account and certificates
4. Configure Xcode signing
5. Test on iOS simulator
6. Build IPA file
7. Upload to TestFlight for testing
8. Submit to App Store for review

Good luck with your App Store submission!
