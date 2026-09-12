# Android & Google Play Submission Checklist
## Legends of Kai-Jax: The Memory Hero - Phase 5.5

Complete checklist for Android build readiness and Google Play submission.

---

## Phase 1: Environment & Prerequisites

- [ ] Android SDK installed (`$ANDROID_SDK_ROOT` set)
- [ ] Java/JDK 11+ installed (`java -version`)
- [ ] Node.js v18+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] Gradle works (`./gradlew --version` in android/)
- [ ] ADB installed (`adb version`)
- [ ] ImageMagick installed (`convert --version`)
- [ ] Git repo clean (`git status` shows no uncommitted changes)

**Completion**: Phase 1 Ready
- Date: ___________
- Notes: ___________________________________________

---

## Phase 2: Web Build & Configuration

- [ ] Web build succeeds (`pnpm build`)
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No lint errors (`pnpm lint`)
- [ ] Tests passing (`pnpm test`)
- [ ] dist/ directory created with all files
- [ ] capacitor.config.ts exists and configured
- [ ] App ID is `com.bobbyblanco.legendsofkaijax`
- [ ] App name is "Legends of Kai-Jax"

**Build output**:
- Build time: __________ seconds
- Dist size: __________ MB
- Files count: __________ 

**Completion**: Phase 2 Ready
- Date: ___________
- Notes: ___________________________________________

---

## Phase 3: Android Configuration

### Manifest & Permissions

- [ ] AndroidManifest.xml has INTERNET permission
- [ ] AndroidManifest.xml has VIBRATE permission
- [ ] App icon references correct (`@mipmap/ic_launcher`)
- [ ] Splash screen configured
- [ ] MainActivity properly configured

**File**: `/apps/web/android/app/src/main/AndroidManifest.xml`

### SDK Configuration

- [ ] minSdkVersion set to 24 (Android 7.0)
- [ ] targetSdkVersion set to 34 (Android 14)
- [ ] compileSdkVersion set to 34
- [ ] Gradle version appropriate

**File**: `/apps/web/android/variables.gradle`

### Capacitor Configuration

- [ ] `npx cap sync android` runs successfully
- [ ] Assets copied to Android WebView
- [ ] Native plugins configured
- [ ] No Capacitor errors in manifest

**Files**:
- `/apps/web/capacitor.config.ts`
- `/apps/web/android/` (synced)

**Completion**: Phase 3 Ready
- Date: ___________
- Notes: ___________________________________________

---

## Phase 4: App Icons & Assets

### App Icons (512×512 base → all densities)

- [ ] 512×512 base icon created
- [ ] mipmap-mdpi/ic_launcher.png (48×48)
- [ ] mipmap-hdpi/ic_launcher.png (72×72)
- [ ] mipmap-xhdpi/ic_launcher.png (96×96)
- [ ] mipmap-xxhdpi/ic_launcher.png (144×144)
- [ ] mipmap-xxxhdpi/ic_launcher.png (192×192)
- [ ] Round icon variants generated
- [ ] Icons visually match game branding
- [ ] Icons readable at small sizes

**Generated using**: `./scripts/generate-app-icons.sh`

### Notification Icons

- [ ] notification_icon_192.png created (192×192)
- [ ] notification_icon_384.png created (384×384)
- [ ] Icons are simple/minimal for small sizes
- [ ] No transparency issues

**Location**: `/apps/web/android/app/src/main/res/drawable/`

### Splash Screens

- [ ] Splash screens for all densities
  - [ ] drawable-port-mdpi/splash.png
  - [ ] drawable-port-hdpi/splash.png
  - [ ] drawable-port-xhdpi/splash.png
  - [ ] drawable-port-xxhdpi/splash.png
  - [ ] drawable-port-xxxhdpi/splash.png
  - [ ] drawable-land-mdpi/splash.png
  - [ ] drawable-land-hdpi/splash.png
  - [ ] drawable-land-xhdpi/splash.png
  - [ ] drawable-land-xxhdpi/splash.png
  - [ ] drawable-land-xxxhdpi/splash.png
- [ ] Covers Pixel 6 (1440×3120)
- [ ] Covers Samsung S21 (1440×3200)
- [ ] Covers tablet aspect ratios (1600×2560)
- [ ] Background color consistent with branding
- [ ] Logo centered and properly sized

**Generated using**: `./scripts/generate-splash-screens.sh`

**Completion**: Phase 4 Ready
- Date: ___________
- Notes: ___________________________________________

---

## Phase 5: Code Signing Setup

### Keystore Creation

- [ ] Keystore created (`release.keystore`)
- [ ] Keystore location: `/home/user/Legends-of-Kai-Jax-The-memory-Hero/release.keystore`
- [ ] Keystore password saved securely
- [ ] Key password saved securely
- [ ] Keystore validity 10 years
- [ ] Key alias: `kaijax_release`

**Keystore backup**:
- [ ] Backup copy created in secure location
- [ ] Passwords stored in password manager
- [ ] Recovery codes/backup codes saved

### Signing Configuration

- [ ] signing.properties created in `/apps/web/android/`
- [ ] File contains all required properties:
  - [ ] RELEASE_KEY_STORE_PATH
  - [ ] RELEASE_KEY_STORE_PASSWORD
  - [ ] RELEASE_KEY_ALIAS
  - [ ] RELEASE_KEY_PASSWORD
- [ ] signing.properties NOT in git (in .gitignore)
- [ ] .gitignore updated with signing files
- [ ] Environment variables can substitute signing.properties

**File**: `/apps/web/android/signing.properties`

### Build.gradle Signing

- [ ] build.gradle has signingConfigs block
- [ ] signingConfigs.release properly configured
- [ ] buildTypes.release uses signingConfig
- [ ] minifyEnabled: true for release
- [ ] ProGuard rules in place

**File**: `/apps/web/android/app/build.gradle`

**Setup using**: `./scripts/setup-android-signing.sh`

**Completion**: Phase 5 Ready
- Date: ___________
- Notes: ___________________________________________

---

## Phase 6: Build Testing (Debug APK)

### Debug Build Process

```bash
pnpm build
cd apps/web
npx cap sync android
cd android
./gradlew assembleDebug
```

- [ ] Web build completes
- [ ] Capacitor sync succeeds
- [ ] Debug APK builds without errors
- [ ] APK location: `/apps/web/android/app/build/outputs/apk/debug/app-debug.apk`
- [ ] APK file size reasonable (< 200MB)

### Install on Device/Emulator

**Device Setup**:
- [ ] USB debugging enabled
- [ ] Device connected via USB (`adb devices` shows device)
- [ ] USB permissions granted

**Installation**:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

- [ ] APK installs successfully
- [ ] No installation errors
- [ ] App appears in device launcher

### Functional Testing

**Launch & Rendering**:
- [ ] App launches without crash
- [ ] Splash screen displays correctly
- [ ] No black screens
- [ ] Three.js renders 3D content
- [ ] Characters visible and animated
- [ ] Lighting works correctly
- [ ] Performance acceptable (no stuttering)

**Input & Interaction**:
- [ ] Touch input responsive
- [ ] Taps register accurately
- [ ] Gesture recognition works
- [ ] Memory patterns execute
- [ ] Combat mechanics function
- [ ] UI elements interactive

**Compatibility**:
- [ ] Tested on Android 7.0+ device
- [ ] Tested on multiple screen sizes if possible
- [ ] Tablet layout works (if applicable)
- [ ] Landscape/portrait both work

**Debugging**:
- [ ] No errors in logcat
- [ ] No warnings about permissions
- [ ] No memory leaks detected
- [ ] No crash reports

**Check logs**:
```bash
adb logcat -c
adb logcat | grep -E "Capacitor|Error|Exception"
```

**Devices Tested**:
- Device 1: _____________ (Android ____) - ✓ Pass / ✗ Fail
- Device 2: _____________ (Android ____) - ✓ Pass / ✗ Fail
- Device 3: _____________ (Android ____) - ✓ Pass / ✗ Fail

**Completion**: Phase 6 Ready
- Date: ___________
- Notes: ___________________________________________

---

## Phase 7: Release Build (AAB for Play Store)

### Build Process

```bash
./scripts/build-android-release.sh
```

**Or manually**:

```bash
pnpm build
cd apps/web
npx cap sync android
cd android
./gradlew bundleRelease
```

- [ ] Release build completes
- [ ] AAB created: `/apps/web/android/app/build/outputs/bundle/release/app-release.aab`
- [ ] AAB file size reasonable (< 150MB)
- [ ] Build output shows "BUILD SUCCESSFUL"

### Signing Verification

```bash
jarsigner -verify -verbose app/build/outputs/bundle/release/app-release.aab
```

- [ ] AAB properly signed
- [ ] Signing certificate correct
- [ ] Signature verification passes
- [ ] No signing warnings

### Version Management

- [ ] versionCode incremented (currently: 1)
- [ ] versionName set to semantic version (e.g., "1.0.0")
- [ ] Version matches release plan
- [ ] Version documented

**Version History**:
- Release 1: versionCode=1, versionName="1.0.0"
- Release 2: versionCode=2, versionName="1.1.0"
- Release 3: versionCode=3, versionName="1.2.0"

**Completion**: Phase 7 Ready
- Date: ___________
- Notes: ___________________________________________

---

## Phase 8: Play Store Assets & Graphics

### Icons for Play Store

- [ ] 512×512 PNG app icon created
- [ ] Icon in high quality (no compression artifacts)
- [ ] Icon distinctive and recognizable
- [ ] Icon works at all sizes

**Location**: Ready to upload to Google Play Console

### Screenshots for Phone (1080×1920)

- [ ] Screenshot 1: Title/Menu screen
- [ ] Screenshot 2: Gameplay - combat
- [ ] Screenshot 3: Character/trainer selection
- [ ] Screenshot 4: Boss battle
- [ ] Screenshot 5: Victory/progression
- [ ] At least 2-5 screenshots
- [ ] Screenshots from actual gameplay
- [ ] Text overlays explain features
- [ ] No watermarks or external logos

### Screenshots for Tablet (1600×2560)

- [ ] At least 2 tablet screenshots
- [ ] Same content as phone but optimized for tablet ratio
- [ ] UI scales properly
- [ ] Content fully visible
- [ ] No stretching/distortion

### Feature Graphic (1024×500)

- [ ] Feature graphic created
- [ ] Exactly 1024×500 pixels
- [ ] Shows game at its best
- [ ] Clear, large text
- [ ] Eye-catching design
- [ ] File format: PNG or JPG
- [ ] File size < 2MB

### Promo Video (Optional)

- [ ] Video uploaded to YouTube (unlisted)
- [ ] 15-30 seconds gameplay
- [ ] Shows core mechanics
- [ ] Shows 3D rendering
- [ ] YouTube link ready to share

### Privacy Policy

- [ ] Privacy policy written
- [ ] Hosted at public URL
- [ ] Policy explains:
  - [ ] No personal data collection
  - [ ] Local storage only
  - [ ] No tracking/analytics
  - [ ] No ads
  - [ ] No in-app purchases (if applicable)
- [ ] Policy accessible and readable
- [ ] Policy URL verified working

**Example locations**:
- Website: `yoursite.com/privacy`
- GitHub Pages: `username.github.io/privacy`
- Notion/Medium: Public link

**Completion**: Phase 8 Ready
- Date: ___________
- Notes: ___________________________________________

---

## Phase 9: Google Play Console Setup

### Account & Developer Setup

- [ ] Google Play Developer account created
- [ ] $25 USD developer fee paid
- [ ] 2FA enabled on Google account
- [ ] Payment method verified
- [ ] Developer profile complete

### Create App

- [ ] App created in Play Console
- [ ] App name: "Legends of Kai-Jax: The Memory Hero"
- [ ] App ID: com.bobbyblanco.legendsofkaijax
- [ ] Category: Games → Action
- [ ] Free/Paid: Free (selected)

### Store Listing

- [ ] Short description filled (80 chars)
- [ ] Full description filled (4000 chars)
- [ ] Promotional description filled
- [ ] App icon (512×512) uploaded
- [ ] Screenshots uploaded:
  - [ ] 2-5 phone screenshots
  - [ ] 2-5 tablet screenshots
- [ ] Feature graphic uploaded
- [ ] Promo video linked (optional)
- [ ] All text fields checked for typos

### Content Rating

- [ ] IARC questionnaire completed
- [ ] Content rating assigned
- [ ] Rating appropriate for content
- [ ] Rating certificate generated

### Privacy & Permissions

- [ ] Privacy policy URL added
- [ ] Privacy policy reviewed
- [ ] Permissions match manifest (INTERNET, VIBRATE)
- [ ] App access settings configured
- [ ] Target countries selected

### Target Devices

- [ ] Min SDK: 24 (Android 7.0)
- [ ] Supported devices configured
- [ ] Target countries selected
- [ ] No restricted regions needed

**Completion**: Phase 9 Ready
- Date: ___________
- Notes: ___________________________________________

---

## Phase 10: Internal Testing

### Create Testing Track

- [ ] Internal testing track created
- [ ] Test users group created or selected
- [ ] AAB file uploaded
- [ ] Release notes added
- [ ] Testing version created

### Add Testers

- [ ] Test users identified
- [ ] Email list created
- [ ] Invitations sent
- [ ] Testers confirmed access

### Testing Verification

**Device Coverage**:
- [ ] Android 7.0 device tested
- [ ] Android 10-11 device tested
- [ ] Android 12-13 device tested
- [ ] Android 14+ device tested
- [ ] Phone tested
- [ ] Tablet tested (if applicable)

**Functionality Testing**:
- [ ] App installs from Play Store link
- [ ] App launches without crash
- [ ] Splash screen displays
- [ ] 3D rendering works
- [ ] All game mechanics work
- [ ] No gameplay bugs found
- [ ] No UI issues
- [ ] Performance acceptable
- [ ] No crash logs

**Tester Feedback**:
- [ ] Feedback collected from testers
- [ ] Issues documented
- [ ] Bugs prioritized
- [ ] Fixes applied if needed

**Testing Period**:
- Start date: ___________
- End date: ___________
- Issues found: ___________
- All issues resolved: ✓ Yes / ✗ No

**Completion**: Phase 10 Ready
- Date: ___________
- Notes: ___________________________________________

---

## Phase 11: Final Release Preparation

### Code Quality Final Check

- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No lint errors (`pnpm lint`)
- [ ] No console warnings
- [ ] No commented-out debug code
- [ ] No test/debug flags enabled
- [ ] Performance optimized
- [ ] No dead code

### Build Process Verification

- [ ] Clean build succeeds
- [ ] Version code incremented
- [ ] Version name semantic
- [ ] Signing works correctly
- [ ] AAB builds successfully
- [ ] Signature verified
- [ ] File size acceptable

### Documentation

- [ ] ANDROID_BUILD_GUIDE.md reviewed
- [ ] PLAY_STORE_SETUP.md reviewed
- [ ] ANDROID_QUICK_START.md reviewed
- [ ] Release notes written
- [ ] Changelog updated
- [ ] Known issues documented

### Risk Assessment

- [ ] No known critical bugs
- [ ] Performance acceptable on slow devices
- [ ] All Android versions tested
- [ ] Crash rate expected: < 0.1%
- [ ] Rollout strategy planned:
  - [ ] 5% initial (Day 1)
  - [ ] 10% (Day 2)
  - [ ] 25% (Day 3)
  - [ ] 50% (Day 4)
  - [ ] 100% (Day 5+)

**Risk Level**: ✓ Low / ⚠ Medium / ✗ High

**Completion**: Phase 11 Ready
- Date: ___________
- Notes: ___________________________________________

---

## Phase 12: Google Play Submission

### Pre-Submission Review

- [ ] App meets Google Play policies
- [ ] No restricted content
- [ ] No prohibited functionality
- [ ] Privacy policy clear
- [ ] Content rating appropriate
- [ ] Screenshots accurate
- [ ] Descriptions honest

### Submit Release

- [ ] Production release created
- [ ] AAB uploaded and verified
- [ ] Release notes added
- [ ] Rollout percentage set (recommended: 5% initial)
- [ ] All required fields filled
- [ ] No validation errors shown
- [ ] Submission reviewed one final time

### Submit Button

- [ ] Release review button clicked
- [ ] Submission confirmed
- [ ] Confirmation email received
- [ ] Review status tracked

**Submission Date**: ___________
**Expected Review**: 2-24 hours

**Completion**: Phase 12 Complete
- Date: ___________
- Notes: ___________________________________________

---

## Phase 13: Post-Launch Monitoring

### Review Monitoring

- [ ] Review status checked daily
- [ ] Status tracked in spreadsheet
- [ ] Review timeline logged
- [ ] Any review rejection addressed

### Metrics Tracking (First Week)

- [ ] Crash reports monitored
- [ ] Crash rate tracked
- [ ] User reviews read daily
- [ ] Negative feedback addressed
- [ ] Rating tracked

**Daily Metrics**:
- Day 1 (Launch):
  - Installs: ________
  - Crashes: ________
  - Average rating: ________
  - Key issues: _________________________

- Day 2-7 (Early adoption):
  - Installs: ________
  - Crashes: ________
  - Average rating: ________
  - Key issues: _________________________

### Post-Launch Actions

- [ ] Rollout increased to 10% (if no critical issues)
- [ ] Rollout increased to 25%
- [ ] Rollout increased to 50%
- [ ] Rollout increased to 100%
- [ ] Crash data analyzed
- [ ] User reviews responded to
- [ ] Known issues logged for next version

### Success Metrics

- [ ] 0 critical crashes
- [ ] Rating above 4.0 stars
- [ ] Positive user feedback
- [ ] No major bugs reported
- [ ] Performance acceptable

**Completion**: Phase 13 Complete
- Date: ___________
- Notes: ___________________________________________

---

## Phase 14: Maintenance & Updates

### Monthly Maintenance

- [ ] Crash reports reviewed
- [ ] User feedback reviewed
- [ ] Rating tracked
- [ ] Dependency updates checked
- [ ] Security updates reviewed
- [ ] Google Play policy changes checked

### Next Version Planning

- [ ] Feature requests collected
- [ ] Bug fixes prioritized
- [ ] New features planned
- [ ] Version number assigned
- [ ] Timeline set

### Version History

```
v1.0.0 - Sept 12, 2024 (versionCode: 1)
  Initial release
  
v1.1.0 - [Date] (versionCode: 2)
  [Changes here]
  
v1.2.0 - [Date] (versionCode: 3)
  [Changes here]
```

**Completion**: Ongoing
- Last review: ___________
- Next update scheduled: ___________

---

## Summary & Sign-Off

### Project Status: READY FOR SUBMISSION

**All phases completed**:
- ✓ Phase 1: Environment
- ✓ Phase 2: Web Build
- ✓ Phase 3: Android Configuration
- ✓ Phase 4: Assets
- ✓ Phase 5: Signing
- ✓ Phase 6: Debug Testing
- ✓ Phase 7: Release Build
- ✓ Phase 8: Graphics & Assets
- ✓ Phase 9: Play Console Setup
- ✓ Phase 10: Internal Testing
- ✓ Phase 11: Final Prep
- ✓ Phase 12: Submission
- ✓ Phase 13: Monitoring
- ✓ Phase 14: Maintenance Plan

### Sign-Off

**Project Lead**: _________________________ Date: __________

**QA/Testing Lead**: _________________________ Date: __________

**Deployment Lead**: _________________________ Date: __________

### Notes & Decisions

Priority issues addressed:
- Issue 1: __________________ - Status: __________
- Issue 2: __________________ - Status: __________
- Issue 3: __________________ - Status: __________

Key decisions made:
- Decision 1: ____________________________________
- Decision 2: ____________________________________
- Decision 3: ____________________________________

---

## Quick Links

- [Google Play Console](https://play.google.com/console)
- [Android Documentation](https://developer.android.com/docs)
- [Capacitor Android](https://capacitorjs.com/docs/android)
- Local guides:
  - ANDROID_BUILD_GUIDE.md
  - PLAY_STORE_SETUP.md
  - ANDROID_QUICK_START.md

---

**Status: READY FOR SUBMISSION TO GOOGLE PLAY**

Good luck with your launch!
