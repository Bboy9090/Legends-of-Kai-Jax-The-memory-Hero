# Android Build Quick Start
## Legends of Kai-Jax: The Memory Hero

Fast-track guide to build and test the Android app locally.

---

## Prerequisites Check

```bash
# Verify Node.js and pnpm
node --version  # Should be v18+
pnpm --version  # Should be v9+

# Verify Java/JDK
java -version   # Should be JDK 11+

# Verify Android SDK (if not using Android Studio)
ls $ANDROID_SDK_ROOT
```

If any are missing, see **ANDROID_BUILD_GUIDE.md** Section 1.

---

## Quick Build Steps

### 1. Build Web Version (5-10 minutes)

```bash
cd /home/user/Legends-of-Kai-Jax-The-memory-Hero
pnpm build
```

**Expected output**:
```
✓ built in 45.32s
apps/web/dist/ (files copied to web build output)
```

### 2. Test Build - Debug APK (10-15 minutes)

For testing on device/emulator:

```bash
cd apps/web

# Sync with Capacitor
npx cap sync android

# Build debug APK
cd android
./gradlew assembleDebug

# Output location
ls app/build/outputs/apk/debug/app-debug.apk
```

### 3. Install on Device

```bash
# Enable USB debugging on Android device
# Settings → Developer Options → USB Debugging

# Connect device via USB
adb devices  # Should show your device

# Install
adb install app/build/outputs/apk/debug/app-debug.apk

# Or reinstall
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 4. Test on Device

- [ ] App launches without crash
- [ ] Splashscreen shows
- [ ] Game loads
- [ ] 3D rendering works (characters visible)
- [ ] Touch input responds
- [ ] No red errors in logcat

View logs:
```bash
adb logcat -c  # Clear logs
adb logcat | grep -E "Capacitor|Error|Exception"
```

---

## Release Build - For Google Play (25-40 minutes)

### Prerequisites: Setup Signing

**One-time setup**:

```bash
# Create keystore and signing configuration
./scripts/setup-android-signing.sh

# Follow prompts to create keystore and passwords
```

**Verify keystore**:
```bash
# Check if signing.properties exists
cat apps/web/android/signing.properties

# Should show:
# RELEASE_KEY_STORE_PATH=...
# RELEASE_KEY_STORE_PASSWORD=...
# RELEASE_KEY_ALIAS=...
# RELEASE_KEY_PASSWORD=...
```

### Build for Release

**Using helper script** (recommended):

```bash
./scripts/build-android-release.sh
```

**Or manually**:

```bash
# Step 1: Build web
pnpm build

# Step 2: Sync with Capacitor
cd apps/web
npx cap sync android

# Step 3: Build release AAB
cd android
./gradlew bundleRelease

# Step 4: Verify location
ls app/build/outputs/bundle/release/app-release.aab
```

---

## Generate App Icons & Splash Screens

### App Icons (from public/icon.svg)

```bash
# Generate icons from SVG (requires ImageMagick)
# First, convert SVG to PNG
convert apps/web/public/icon.svg -resize 512x512 /tmp/icon-512.png

# Generate all icon sizes
./scripts/generate-app-icons.sh /tmp/icon-512.png

# Verify
find apps/web/android -name "ic_launcher.png" | wc -l
# Should show 5 (one for each density)
```

### Splash Screens

```bash
# Generate splash screens for all devices
./scripts/generate-splash-screens.sh /tmp/icon-512.png

# Verify
find apps/web/android -name "splash.png" | wc -l
# Should show 10+ (portrait and landscape variants)
```

---

## Common Commands

### Build variants

```bash
# Debug build (fast, unoptimized, for testing)
./gradlew assembleDebug

# Release build (slow, optimized, for Play Store)
./gradlew bundleRelease

# Debug APK (can be installed on device)
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk

# Release AAB (Google Play only)
./gradlew bundleRelease
```

### Debugging

```bash
# View logs
adb logcat

# Filter by app
adb logcat | grep com.bobbyblanco.legendsofkaijax

# Clear logs
adb logcat -c

# Get specific error
adb logcat | grep -i error

# Profile performance
adb shell dumpsys gfxinfo com.bobbyblanco.legendsofkaijax
```

### Clean up

```bash
# Clean build artifacts
./gradlew clean

# Deep clean (removes cache)
./gradlew clean && rm -rf .gradle

# Full project clean
rm -rf android/.gradle android/app/build android/build
```

---

## Troubleshooting

### "App crashes immediately"

1. Check manifest (INTERNET permission must exist)
2. View logs: `adb logcat | grep Error`
3. Ensure web build (dist/) is up to date
4. Verify Capacitor synced: `npx cap sync android`

### "Three.js is black (no rendering)"

1. Check browser console for WebGL errors
2. Verify graphics support: `adb logcat | grep -i webgl`
3. Try on different device/emulator

### "Build fails - 'cannot find SDK'"

1. Set environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

2. Verify SDK exists:
   ```bash
   ls $ANDROID_HOME/platforms/
   # Should show android-34, android-33, etc.
   ```

### "AAB won't upload to Play Console"

1. Verify signing:
   ```bash
   jarsigner -verify -verbose app/build/outputs/bundle/release/app-release.aab
   ```

2. Check versionCode incremented
3. Ensure AAB file size < 150MB

### "Signing.properties not found"

1. Run setup:
   ```bash
   ./scripts/setup-android-signing.sh
   ```

2. Or set environment variables:
   ```bash
   export RELEASE_KEY_STORE_PATH=/path/to/release.keystore
   export RELEASE_KEY_STORE_PASSWORD=your_password
   export RELEASE_KEY_ALIAS=kaijax_release
   export RELEASE_KEY_PASSWORD=your_password
   ```

---

## Performance Tips

### Fast debug builds

```bash
# Skip tests and lint
pnpm build --skip-tests

# Parallel gradle builds
export ORG_GRADLE_PARALLEL=true

# Increase memory
export GRADLE_OPTS="-Xmx4g"
```

### Reduce build time

1. Use incremental builds (don't clean unnecessarily)
2. Skip Capacitor sync if web code unchanged: `--skip-sync`
3. Use IDE instead of CLI for development

### Device testing tips

1. Use emulator with GPU acceleration if available
2. Connect via WiFi for faster ADB
3. Use `-r` flag with adb install to skip reinstall

---

## Full Workflow Example

Complete build-test-submit cycle:

```bash
# 1. Make code changes
# 2. Build web
pnpm build

# 3. Quick test - debug APK
cd apps/web
npx cap sync android
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 4. Test on device (verify functionality)
# 5. If all good, build release
./gradlew bundleRelease

# 6. Verify signing
jarsigner -verify app/build/outputs/bundle/release/app-release.aab

# 7. Upload to Google Play Console
# 8. Go to https://play.google.com/console
# 9. Create release → Upload AAB → Submit for review

# 10. Monitor for 24-48 hours
# 11. Publish when approved
```

---

## Next Steps

After successful test build:

1. **Review** `ANDROID_BUILD_GUIDE.md` for complete details
2. **Setup signing** via `./scripts/setup-android-signing.sh`
3. **Generate assets** (icons, splash screens)
4. **Build release AAB** via `./scripts/build-android-release.sh`
5. **Upload to Play Console** - see `PLAY_STORE_SETUP.md`

---

## Useful Links

- [Android Developers](https://developer.android.com)
- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Google Play Console](https://play.google.com/console)
- [Android Studio](https://developer.android.com/studio) - Download for emulator

---

## Help

For detailed information:
- **Build questions**: See `ANDROID_BUILD_GUIDE.md`
- **Play Store questions**: See `PLAY_STORE_SETUP.md`
- **Asset generation**: Check `scripts/` directory
- **Specific errors**: Check troubleshooting section above

Good luck with your build!
