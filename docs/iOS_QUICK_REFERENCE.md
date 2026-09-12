# iOS Build Quick Reference Card

Quick reference for iOS build commands and requirements.

## Essential Commands

### Build Web App
```bash
cd /home/user/Legends-of-Kai-Jax-The-memory-Hero
pnpm build
```

### Sync Capacitor
```bash
cd apps/web
pnpm cap sync ios
```

### Open in Xcode
```bash
cd apps/web
pnpm cap open ios
```

### Generate Icons
```bash
./scripts/generate-ios-icons.sh /path/to/1024x1024-icon.png
```

### Generate Splash Screens
```bash
./scripts/generate-ios-splash.sh /path/to/splash-image.png
```

### Build & Sign for App Store
```bash
./scripts/build-ios-ipa.sh \
  --team-id ABC123DEF \
  --signing-cert "Apple Distribution: Your Name (ABC123DEF)"
```

### Interactive Quick Start
```bash
./scripts/ios-build-quick-start.sh
```

## Key Information

### Bundle ID
```
com.bobbyblanco.legendsofkaijax
```

### Minimum iOS Version
```
iOS 15.0
```

### Required Certificates
- Apple Distribution (for App Store)
- Certificate Signing Request (CSR)

### Required Provisioning Profile
- App Store Distribution Profile

### Icon Locations
```
apps/web/ios/App/App/Assets.xcassets/AppIcon.appiconset/
```

### Splash Locations
```
apps/web/ios/App/App/Assets.xcassets/Splash.imageset/
```

### Info.plist Location
```
apps/web/ios/App/App/Info.plist
```

### IPA Output Location
```
apps/web/ios/App/build/output/App.ipa
```

## Prerequisites Checklist

### System
- [ ] macOS 12+
- [ ] Xcode 14+
- [ ] CocoaPods
- [ ] pnpm

### Developer Account
- [ ] Apple Developer Account active
- [ ] Team ID available
- [ ] App ID created
- [ ] Distribution Certificate created
- [ ] Provisioning Profile created

### Assets
- [ ] 1024x1024 app icon (PNG, no transparency on edges)
- [ ] Splash screen image (2732x2732 or device-specific)

## Apple Developer Websites

| Service | URL |
|---------|-----|
| Developer Account | https://developer.apple.com/account |
| App IDs | https://developer.apple.com/account/resources/identifiers/list |
| Certificates | https://developer.apple.com/account/resources/certificates/list |
| Profiles | https://developer.apple.com/account/resources/profiles/list |
| App Store Connect | https://appstoreconnect.apple.com |
| Guidelines | https://developer.apple.com/app-store/review/guidelines/ |

## Build Process

### Step 1: Prepare Assets
```bash
# Create/prepare 1024x1024 icon and splash images
# Place in: ~/icons/app-icon.png and ~/images/splash.png
```

### Step 2: Generate Assets
```bash
./scripts/generate-ios-icons.sh ~/icons/app-icon.png
./scripts/generate-ios-splash.sh ~/images/splash.png
```

### Step 3: Verify Code Signing
```bash
# Find Team ID
security find-identity -v -p codesigning | grep "Apple Distribution"

# Get certificate name from output
# Example: "Apple Distribution: Your Name (ABC123DEF)"
```

### Step 4: Build
```bash
./scripts/build-ios-ipa.sh \
  --team-id ABC123DEF \
  --signing-cert "Apple Distribution: Your Name (ABC123DEF)"
```

### Step 5: Verify IPA
```bash
ls -lh apps/web/ios/App/build/output/App.ipa
```

## Troubleshooting Quick Fixes

### "Certificate not valid"
```bash
security import certificate.cer -k ~/Library/Keychains/login.keychain
```

### "Provisioning profile not found"
1. Download from developer.apple.com
2. Double-click to install
3. In Xcode: Preferences > Accounts > Download Profiles

### "Pod: command not found"
```bash
sudo gem install cocoapods
```

### "Cannot find workspace"
```bash
# Ensure you're in the right directory
cd /home/user/Legends-of-Kai-Jax-The-memory-Hero/apps/web
pnpm cap sync ios  # Regenerates iOS project
```

### "xcodebuild: command not found"
```bash
xcode-select --install
```

## File Modifications Made

### Info.plist
- Added privacy descriptions
- Set minimum OS version to 15.0
- Configured permissions

### AppIcon/Contents.json
- Added all required icon sizes
- Updated icon manifest

### Scripts Created
- `generate-ios-icons.sh` - Icon generator
- `generate-ios-splash.sh` - Splash generator
- `build-ios-ipa.sh` - Build and sign script
- `ios-build-quick-start.sh` - Interactive guide

### Documentation Created
- `iOS_BUILD_GUIDE.md` - Complete guide
- `APP_STORE_SUBMISSION_CHECKLIST.md` - Checklist
- `iOS_PHASE5_SUMMARY.md` - Summary
- `iOS_QUICK_REFERENCE.md` - This file

## Key Dates & Numbers

| Item | Value |
|------|-------|
| Minimum iOS | 15.0 |
| Team ID | 10 characters |
| Bundle ID | com.bobbyblanco.legendsofkaijax |
| App Icon (max) | 1024x1024 |
| Splash (max) | 2732x2732 |
| IPA Size | 50-150 MB |
| Review Time | 24-48 hours |
| Subscription | $99/year |

## Common Error Messages

| Error | Solution |
|-------|----------|
| "Certificate required" | Create on developer.apple.com |
| "Provisioning profile invalid" | Re-download from developer.apple.com |
| "Pod install failed" | Run: `cd ios/App && pod install` |
| "Workspace not found" | Run: `pnpm cap sync ios` |
| "Team ID mismatch" | Update in Xcode signing & capabilities |

## Performance Targets

- App launch: < 5 seconds
- Frame rate: 60 FPS steady
- Memory usage: < 500 MB
- IPA size: < 200 MB

## Web App Build Command

```bash
cd /home/user/Legends-of-Kai-Jax-The-memory-Hero
pnpm build  # Same as: pnpm -C apps/web build
```

## Key Project Directories

```
/home/user/Legends-of-Kai-Jax-The-memory-Hero/
├── apps/web/                    Web app source
├── apps/web/dist/               Build output
├── apps/web/ios/                Capacitor iOS project
├── scripts/                      Build scripts
├── docs/                         Documentation
└── docs/iOS_*.md                 iOS build guides
```

## Documentation Files

1. **iOS_BUILD_GUIDE.md**
   - Complete step-by-step guide
   - Asset preparation
   - Code signing setup
   - Testing procedures
   - Troubleshooting

2. **APP_STORE_SUBMISSION_CHECKLIST.md**
   - Pre-submission verification
   - App Store Connect setup
   - Quality checks
   - Submission steps

3. **iOS_PHASE5_SUMMARY.md**
   - Implementation summary
   - What's been done
   - Next steps
   - Timeline

4. **iOS_QUICK_REFERENCE.md**
   - This file
   - Quick commands
   - Common solutions

## Last Verified

- Date: September 12, 2026
- Version: 1.0.0
- Build: 1
- Status: Ready for Testing

---

For full details, see:
- `docs/iOS_BUILD_GUIDE.md` (complete guide)
- `docs/APP_STORE_SUBMISSION_CHECKLIST.md` (checklist)
- `docs/iOS_PHASE5_SUMMARY.md` (summary)
