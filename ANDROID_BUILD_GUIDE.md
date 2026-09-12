# Android Build & Google Play Submission Guide
## Legends of Kai-Jax: The Memory Hero

This guide covers the complete process for building, signing, and submitting the Android app to Google Play.

---

## Phase 1: Prerequisites & Environment Setup

### 1.1 Required Tools
- Node.js/pnpm (for web build)
- Android SDK (API 24+, target 34)
- Android NDK (for native modules if needed)
- Gradle 8.0+ (bundled with Android SDK)
- OpenJDK 11+ or Android Studio's included JDK
- ImageMagick or similar for icon generation

### 1.2 SDK Setup
```bash
# Install Android SDK command-line tools
# Download from: https://developer.android.com/studio/command-line-tools

# Set environment variables
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools

# Install required SDK components
sdkmanager "platforms;android-34" "build-tools;34.0.0" "ndk;25.1.8937393" "platform-tools"
```

---

## Phase 2: Web Build

Build the web version first, which will be packaged into the Android app.

```bash
# From project root
pnpm build

# This generates the optimized web app in apps/web/dist/
# Capacitor will package this into the Android APK
```

**Important**: The web build must complete successfully before proceeding to Android build.

---

## Phase 3: Assets Setup

### 3.1 App Icon (512×512)

The 512×512 base icon is automatically scaled to all required densities:
- mdpi: 48×48
- hdpi: 72×72
- xhdpi: 96×96
- xxhdpi: 144×144
- xxxhdpi: 192×192

**Current Status**: Icon files already exist in Android resources at:
```
apps/web/android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/
```

To replace with a new icon:
1. Create a 512×512 PNG icon
2. Use the provided `generate-app-icons.sh` script to generate all densities
3. Place generated files in the mipmap directories

### 3.2 Notification Icons (192×192 and 384×384)

These are used for push notifications and can be placed at:
```
apps/web/android/app/src/main/res/drawable/notification_icon_192.png
apps/web/android/app/src/main/res/drawable/notification_icon_384.png
```

### 3.3 Splash Screens

Adaptive splash screens are configured for:
- Pixel 6 (6.1", 1440×3120)
- Samsung S21 (6.2", 1440×3200)
- Tablet layouts (1600×2560)

**Current Status**: Splash screens exist at:
```
apps/web/android/app/src/main/res/drawable/
  - drawable-land-*/ (landscape variants)
  - drawable-port-*/ (portrait variants)
  - splash.png (default)
```

To update splash screens:
1. Create images for different aspect ratios
2. Place in appropriate drawable-* directories
3. Update `src/main/res/values/styles.xml` if needed

---

## Phase 4: Keystore & Code Signing

### 4.1 Create a Signing Keystore

```bash
# Generate a keystore for release signing
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias kaijax_release

# When prompted, enter:
# - Keystore password: [Create a strong password]
# - Key password: [Create a strong password]
# - Distinguished Name:
#   First/Last: [Your Name]
#   Organization Unit: [Your Company]
#   Organization: [Your Company]
#   City/Locality: [City]
#   State/Province: [State]
#   Country Code: [US, etc.]
```

**IMPORTANT**: 
- Store the keystore file securely (never commit to git)
- Save both passwords in a secure password manager
- Keep the keystore backed up
- The same keystore must be used for all releases (Google Play requires it)

### 4.2 Setup Signing Configuration

Create `apps/web/android/signing.properties`:

```properties
# Signing configuration for release builds
RELEASE_KEY_STORE_PATH=../../../release.keystore
RELEASE_KEY_STORE_PASSWORD=your_keystore_password
RELEASE_KEY_ALIAS=kaijax_release
RELEASE_KEY_PASSWORD=your_key_password
```

**Add to .gitignore**:
```
apps/web/android/signing.properties
release.keystore
```

### 4.3 Update build.gradle for Signing

The signing configuration should be added to `apps/web/android/app/build.gradle`:

```gradle
// Add signingConfigs block
signingConfigs {
    release {
        storeFile file(System.getenv('RELEASE_KEY_STORE_PATH') ?: 'release.keystore')
        storePassword System.getenv('RELEASE_KEY_STORE_PASSWORD')
        keyAlias System.getenv('RELEASE_KEY_ALIAS') ?: 'kaijax_release'
        keyPassword System.getenv('RELEASE_KEY_PASSWORD')
    }
}

// Update buildTypes
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        debuggable false
    }
}
```

---

## Phase 5: Capacitor Sync & Android Build

### 5.1 Sync Capacitor

```bash
cd apps/web
npx cap sync android

# This copies the web build (dist/) to Android's WebView assets
# Updates native code based on capacitor.config.ts
```

### 5.2 Build APK (for testing)

```bash
cd apps/web/android

# Debug APK (for testing on emulator/device)
./gradlew assembleDebug

# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### 5.3 Build AAB (for Play Store)

```bash
cd apps/web/android

# Release AAB (requires signing configuration)
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 5.4 Verify Build

```bash
# List APK/AAB files
find apps/web/android -name "*.aab" -o -name "*.apk" | grep -E "release|debug"

# Check APK signatures
jarsigner -verify -verbose -certs apps/web/android/app/build/outputs/bundle/release/app-release.aab
```

---

## Phase 6: Testing

### 6.1 Install on Device/Emulator

**For Debug APK**:
```bash
adb install apps/web/android/app/build/outputs/apk/debug/app-debug.apk

# Or uninstall first if upgrading
adb uninstall com.bobbyblanco.legendsofkaijax
adb install apps/web/android/app/build/outputs/apk/debug/app-debug.apk
```

**For AAB** (requires Play Console or bundletool):
```bash
# Install from AAB using bundletool
bundletool build-apks --bundle=app-release.aab \
  --output=app.apks \
  --ks=release.keystore \
  --ks-pass=pass:YOUR_PASSWORD \
  --ks-key-alias=kaijax_release \
  --key-pass=pass:YOUR_PASSWORD

bundletool install-apks --apks=app.apks
```

### 6.2 Verification Checklist

- [ ] App launches on Android 7+ device/emulator
- [ ] Three.js rendering works (characters visible, animations smooth)
- [ ] Touch input responsive (tap to select, swipe to move)
- [ ] No console errors (check `adb logcat`)
- [ ] Performance acceptable (< 16ms per frame for 60 FPS)
- [ ] Network requests work (if online features used)
- [ ] Vibration works (if implemented in game)

### 6.3 Debugging

```bash
# View logs
adb logcat | grep -E "Capacitor|Game|Error"

# Get app package stats
adb shell dumpsys package com.bobbyblanco.legendsofkaijax

# Profile performance
adb shell am start -n com.bobbyblanco.legendsofkaijax/.MainActivity
```

---

## Phase 7: Google Play Console Setup

### 7.1 Create App Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
   - Default language: English
   - App name: "Legends of Kai-Jax: The Memory Hero"
   - App category: Games > Action
   - Content Rating: Appropriate for all ages (no violence, mild gameplay)
3. Fill in app store listing:
   - Short description (80 chars): "Master memory and combat in this mythic platform fighter"
   - Full description: [See below]
   - Screenshots: Provide for phone (1080×1920) and tablet (1600×2560)
   - Feature graphic: 1024×500 PNG showing game UI/gameplay
   - Icon: 512×512 (will be auto-uploaded)
   - Promo video: YouTube link (optional)

### 7.2 Content Rating Questionnaire

1. Go to "Content ratings" section
2. Fill out questionnaire:
   - Violence: None
   - Profanity: None
   - Sexual content: None
   - Alcohol/tobacco: None
3. Submit for review

### 7.3 Privacy Policy

Create a privacy policy covering:
- No user data collection (if true)
- No third-party tracking
- No ads
- Local storage only
- No network requests for user data

Example privacy policy location:
```
https://yoursite.com/privacy
```

### 7.4 Testing Tracks

1. Create "Internal Testing" track
2. Add test user emails
3. Upload app-release.aab
4. Distribute to test users
5. Gather feedback on functionality

### 7.5 Rollout to Production

1. Create "Production" release
2. Upload app-release.aab
3. Set rollout percentage (start with 5%, gradually increase)
4. Write release notes
5. Submit for review

**Review Timeline**: Typically 2-24 hours, but can be longer

---

## Phase 8: Version Management

### 8.1 Increment Version

Update `apps/web/android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 1  // Increment by 1 for each release
    versionName "1.0"  // Semantic versioning
}
```

**Important**: 
- versionCode must always increase
- Cannot reuse same versionCode
- All markets must have same versionCode

### 8.2 Version Control

Store version history:
```
v1.0 - Initial release
  versionCode: 1
  versionName: "1.0.0"
  releaseDate: 2026-09-12
  
v1.1 - Bug fixes and optimizations
  versionCode: 2
  versionName: "1.1.0"
  releaseDate: TBD
```

---

## Phase 9: Troubleshooting

### Build Errors

**"minSdkVersion is too old"**
- Update `variables.gradle`: `minSdkVersion = 24`

**"Gradle build timeout"**
- Increase memory: `org.gradle.jvmargs=-Xmx4g` in `gradle.properties`

**"Three.js rendering black screen"**
- Check WebGL support: `adb logcat | grep -i webgl`
- Ensure INTERNET permission in manifest
- Verify dist/ files copied correctly

### Signing Issues

**"keystore not found"**
- Verify keystore path in signing.properties
- Use absolute path if relative doesn't work

**"Invalid keystore"**
- Recreate keystore: `keytool -genkey -v -keystore release.keystore ...`

### Performance Issues

**"App crashes on load"**
- Check memory requirements for Three.js
- Reduce texture resolution if needed
- Profile with Android Profiler

---

## Phase 10: Maintenance & Updates

### 10.1 Monthly Checks

- Monitor crash reports in Play Console
- Update dependencies: `pnpm outdated`
- Check Google Play policy changes
- Review user reviews and feedback

### 10.2 Release Process

For each new version:
1. Update version code/name
2. Run tests: `pnpm test`
3. Build web: `pnpm build`
4. Test APK on device
5. Build AAB: `./gradlew bundleRelease`
6. Upload to internal testing track
7. Get sign-off
8. Upload to production
9. Monitor crash reports for 24 hours

### 10.3 Backup Strategy

- Store keystore in secure location
- Backup passwords in vault
- Keep release notes in git
- Archive old build artifacts

---

## Quick Reference Commands

```bash
# Full build process
pnpm build && \
cd apps/web && \
npx cap sync android && \
cd android && \
./gradlew bundleRelease

# Test build
pnpm build && \
cd apps/web && \
npx cap sync android && \
cd android && \
./gradlew assembleDebug && \
adb install app/build/outputs/apk/debug/app-debug.apk

# Verify signing
jarsigner -verify -verbose apps/web/android/app/build/outputs/bundle/release/app-release.aab

# View logs
adb logcat -c && adb logcat | grep -E "Capacitor|Error|Exception"

# Check app on device
adb shell am start -n com.bobbyblanco.legendsofkaijax/.MainActivity
```

---

## Resources

- [Android Developers Docs](https://developer.android.com/docs)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Google Play Developer Docs](https://developer.android.com/google-play)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Android logs: `adb logcat`
3. Check Gradle output for build errors
4. Consult Google Play Console help for submission issues
