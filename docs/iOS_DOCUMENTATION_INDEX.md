# iOS Build Documentation Index

Navigation guide for all iOS build-related documentation and scripts.

## Quick Navigation

### Start Here
- **New to iOS build?** → `iOS_BUILD_GUIDE.md`
- **Need a checklist?** → `APP_STORE_SUBMISSION_CHECKLIST.md`
- **Want a quick overview?** → `iOS_PHASE5_SUMMARY.md`
- **Looking for commands?** → `iOS_QUICK_REFERENCE.md`

## Documentation Files

### 1. iOS_BUILD_GUIDE.md (14 KB) - COMPREHENSIVE GUIDE
**Best for:** Step-by-step detailed instructions

Topics covered:
- Prerequisites and system setup
- Web application build preparation
- App icons and splash screen generation
- Capacitor configuration and iOS project setup
- Code signing and provisioning profiles
- Building for App Store (automated and manual)
- Testing on iOS simulator (15+ compatibility)
- App Store Connect configuration
- Submission and review process
- Troubleshooting and common issues

**Use this when:** You want detailed, complete instructions for every step

---

### 2. APP_STORE_SUBMISSION_CHECKLIST.md (11 KB) - VERIFICATION CHECKLIST
**Best for:** Checking off requirements and verifying readiness

Topics covered:
- Pre-submission quality checklist
- Project setup verification
- Code quality and testing requirements
- iOS configuration verification
- Asset requirements (icons, splash, screenshots)
- Privacy and security checks
- Code signing verification
- App Store Connect setup steps
- Build quality assurance
- Submission execution steps
- Common rejection reasons and fixes
- Resubmission guidance

**Use this when:** You need to verify everything is ready before submission

---

### 3. iOS_PHASE5_SUMMARY.md (14 KB) - IMPLEMENTATION OVERVIEW
**Best for:** Understanding what's been implemented

Topics covered:
- What's been configured and created
- Updated configuration files
- New build scripts and their features
- Documentation created
- Ready-to-use build pipeline
- File structure overview
- Prerequisites and requirements
- Timeline and next steps
- Success criteria
- Maintenance and updates

**Use this when:** You want to understand the overall implementation

---

### 4. iOS_QUICK_REFERENCE.md (6.3 KB) - QUICK LOOKUP CARD
**Best for:** Quick command reference and troubleshooting

Topics covered:
- Essential build commands
- Key information and values
- Project directory structure
- Apple Developer website links
- Troubleshooting quick fixes
- Common error messages and solutions
- Performance targets
- Important file locations

**Use this when:** You need a quick command or remember a value

---

### 5. iOS_DOCUMENTATION_INDEX.md (This File)
**Best for:** Navigation and finding the right document

---

## Build Scripts

### Location: `/scripts/`

All scripts are executable. Run from project root directory.

### 1. `generate-ios-icons.sh`
**Converts a single 1024x1024 app icon into all required iOS sizes**

```bash
./scripts/generate-ios-icons.sh /path/to/1024x1024-icon.png
```

Generates:
- iPhone icons (20, 29, 40, 60 pt with 2x/3x)
- iPad icons (20, 29, 40, 76, 83.5 pt with variants)
- App Store icon (1024x1024)

Requirements: ImageMagick (`brew install imagemagick`)

---

### 2. `generate-ios-splash.sh`
**Creates splash screens for different iOS device sizes**

```bash
./scripts/generate-ios-splash.sh /path/to/splash-image.png
```

Generates:
- iPhone SE splash (750x1334)
- iPhone 12/13 Pro splash (390x844)
- iPhone 12/13 Pro Max splash (430x932)
- iPad splash (768x1024)
- iPad Pro 11" splash (1024x1366)
- iPad Pro 12.9" splash (1366x1024)
- Universal splash (2732x2732)

Requirements: ImageMagick

---

### 3. `build-ios-ipa.sh`
**Automated build, sign, and export to production .ipa file**

```bash
./scripts/build-ios-ipa.sh \
  --team-id ABC123DEF \
  --signing-cert "Apple Distribution: Your Company (ABC123DEF)" \
  --build-number 1
```

Does:
1. Builds web app (`pnpm build`)
2. Syncs Capacitor (`pnpm cap sync ios`)
3. Cleans Xcode project
4. Creates archive
5. Signs with distribution certificate
6. Exports production .ipa
7. Validates output

Output: `/apps/web/ios/App/build/output/App.ipa`

---

### 4. `ios-build-quick-start.sh`
**Interactive guided setup for entire iOS build process**

```bash
./scripts/ios-build-quick-start.sh
```

Does:
1. Checks prerequisites (Xcode, pnpm, CocoaPods)
2. Builds web app
3. Syncs Capacitor
4. Guides icon/splash preparation
5. Guides code signing setup
6. Opens in Xcode for verification
7. Collects build information
8. Runs complete build process
9. Provides submission next steps

Recommended for: First-time setup

---

## Essential Commands Quick Reference

### Building
```bash
# Web app only
pnpm build

# Web app + iOS sync
pnpm build && pnpm -C apps/web cap sync ios

# Full build and sign
./scripts/build-ios-ipa.sh --team-id ABC123DEF --signing-cert "Apple Distribution: ..."
```

### Asset Generation
```bash
# Generate icons from source
./scripts/generate-ios-icons.sh ~/icons/app-icon-1024.png

# Generate splash screens
./scripts/generate-ios-splash.sh ~/images/splash.png
```

### Development
```bash
# Open in Xcode
pnpm -C apps/web cap open ios

# Run on simulator
pnpm -C apps/web cap run ios
```

### Verification
```bash
# Check certificates
security find-identity -v -p codesigning

# List iOS project schemes
xcodebuild -workspace apps/web/ios/App/App.xcworkspace -list

# Validate IPA
xcrun altool --validate-app -f App.ipa -t ios -u <email> -p <password>
```

---

## File Locations Reference

### Configuration Files
```
apps/web/capacitor.config.ts          - Capacitor configuration
apps/web/ios/App/App/Info.plist       - iOS app configuration
apps/web/ios/App/App/AppDelegate.swift - iOS app delegate
```

### Asset Directories
```
apps/web/ios/App/App/Assets.xcassets/AppIcon.appiconset/     - App icons
apps/web/ios/App/App/Assets.xcassets/Splash.imageset/        - Splash screens
```

### Build Output
```
apps/web/dist/                                    - Web build output
apps/web/ios/App/build/App.xcarchive/            - iOS archive
apps/web/ios/App/build/output/App.ipa            - Final IPA file
```

### Documentation
```
docs/iOS_BUILD_GUIDE.md                         - Complete guide
docs/APP_STORE_SUBMISSION_CHECKLIST.md          - Checklist
docs/iOS_PHASE5_SUMMARY.md                      - Summary
docs/iOS_QUICK_REFERENCE.md                     - Quick reference
docs/iOS_DOCUMENTATION_INDEX.md                 - This file
```

### Scripts
```
scripts/generate-ios-icons.sh                    - Icon generator
scripts/generate-ios-splash.sh                   - Splash generator
scripts/build-ios-ipa.sh                         - Build & sign
scripts/ios-build-quick-start.sh                 - Interactive guide
```

---

## Recommended Reading Order

### For Project Leads / Managers
1. iOS_PHASE5_SUMMARY.md (overview)
2. APP_STORE_SUBMISSION_CHECKLIST.md (verification)

### For Developers
1. iOS_QUICK_REFERENCE.md (quick lookup)
2. iOS_BUILD_GUIDE.md (detailed steps)
3. APP_STORE_SUBMISSION_CHECKLIST.md (verification)

### For QA / Testers
1. iOS_BUILD_GUIDE.md (Testing section)
2. APP_STORE_SUBMISSION_CHECKLIST.md (Testing items)

### For First-Time Build
1. iOS_BUILD_GUIDE.md (complete read-through)
2. iOS_QUICK_REFERENCE.md (as reference while building)
3. Run: `./scripts/ios-build-quick-start.sh` (interactive guide)

---

## Key Information Quick Lookup

### Bundle ID
```
com.bobbyblanco.legendsofkaijax
```

### Minimum iOS Version
```
iOS 15.0
```

### Icon Requirements
- Total: 18 different sizes
- Source: 1024x1024 PNG
- Required for App Store: Yes
- Format: PNG with alpha

### Splash Screen Requirements
- Source: 2732x2732 PNG or device-specific
- Required for App Store: No (but recommended)
- Loading time: < 5 seconds

### Code Signing
- Certificate Type: Apple Distribution
- Profile Type: App Store Distribution
- Valid for: App Store only

---

## Common Workflows

### First-Time Setup (1 week)
1. Read iOS_BUILD_GUIDE.md thoroughly
2. Create Apple Developer Account
3. Create app icon (1024x1024)
4. Run: `./scripts/generate-ios-icons.sh`
5. Create provisioning profile
6. Run: `./scripts/ios-build-quick-start.sh`
7. Test on simulator
8. Use APP_STORE_SUBMISSION_CHECKLIST.md to verify

### Subsequent Builds (2 hours)
1. Use iOS_QUICK_REFERENCE.md for commands
2. Run: `./scripts/build-ios-ipa.sh --team-id ABC123DEF --signing-cert "..."`
3. Upload IPA to App Store Connect
4. Submit for review

### Emergency Rebuild (30 minutes)
```bash
pnpm build
pnpm -C apps/web cap sync ios
./scripts/build-ios-ipa.sh --team-id ABC123DEF --signing-cert "..."
```

---

## Getting Help

### If you don't know which document to read
→ Use the "Quick Navigation" section at top of this page

### If you need a specific command
→ Check iOS_QUICK_REFERENCE.md

### If something is broken
→ Look up error in iOS_BUILD_GUIDE.md Troubleshooting section

### If you're stuck on a step
→ Follow iOS_BUILD_GUIDE.md from beginning

### If you want to verify readiness
→ Use APP_STORE_SUBMISSION_CHECKLIST.md

---

## Document Maintenance

- All documentation last updated: September 12, 2026
- Current app version: 1.0.0
- Current build system: Capacitor 5.7.8
- Documentation scope: iOS 15+ (all current devices)

---

## Quick Links

- **Apple Developer Account**: https://developer.apple.com/account
- **App Store Connect**: https://appstoreconnect.apple.com
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Capacitor iOS Docs**: https://capacitorjs.com/docs/ios
- **Xcode Help**: Xcode > Help > Xcode Help

---

**Navigation Tip**: Bookmark this page for easy access to all iOS build documentation.

Last Updated: September 12, 2026
Status: Complete and Ready to Use
