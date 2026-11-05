# App Store Build & Submission Guide
## Legends of Kai-Jax: The Memory Hero

**Status:** Ready for store submission  
**Web Build:** ✅ Production-optimized (21 unused models pruned, 302.67 MB removed)  
**Android Build:** ✅ Gradle configured (Android SDK 34, Gradle 8.14.3)  
**iOS Build:** ✅ Xcode configuration ready

---

## 📱 Android Release Build

### Prerequisites
- **macOS, Linux, or Windows** with a terminal
- **Java 17+** (OpenJDK or Oracle JDK)
- **Android SDK** (API level 34+)
- **Gradle** (included in project: `gradlew`)
- **8GB+ RAM** available
- **Good internet** (Gradle downloads ~2GB dependencies first time)

### Build Steps

```bash
# 1. Make build script executable
chmod +x build-android-release.sh

# 2. Run the build script
./build-android-release.sh

# This will:
# - Build web assets (pnpm build)
# - Sync to Capacitor Android
# - Run: ./gradlew assembleRelease
```

**Output:** `apps/web/android/app/build/outputs/apk/release/app-release.apk`

### Keystore Setup (First Time Only)

Before building release APK, create a signing keystore:

```bash
keytool -genkey -v \
  -keystore kai-jax-release-key.keystore \
  -alias kai-jax \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# Follow prompts to set passwords and info
# Save the keystore file securely!
```

Then update `apps/web/android/app/build.gradle`:

```gradle
android {
  signingConfigs {
    release {
      storeFile file('/path/to/kai-jax-release-key.keystore')
      storePassword 'YOUR_KEYSTORE_PASSWORD'
      keyAlias 'kai-jax'
      keyPassword 'YOUR_KEY_PASSWORD'
    }
  }

  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
  }
}
```

### Google Play Store Submission

1. **Create App**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app: "Legends of Kai-Jax: The Memory Hero"
   - Category: Games > Action

2. **Upload APK**
   - Build Release APK (see above)
   - Production Track > Create Release
   - Upload `app-release.apk`

3. **Store Listing**
   - Title: Legends of Kai-Jax: The Memory Hero
   - Short Description: "15-mission 3D action-adventure. Play as Kai-Jax, the Memory King."
   - Screenshots: Upload 4-8 gameplay screenshots
   - Icon: 512x512 PNG
   - Feature Graphic: 1024x500 PNG

4. **Rating**
   - IARC Questionnaire
   - Games > Action/Adventure
   - Content: No violence/blood (rating: 4+)

5. **Submit**
   - Beta track first (optional, faster approval)
   - Then roll to Production

---

## 🍎 iOS Release Build

### Prerequisites
- **macOS 13+** with Xcode 15+ installed
- **Apple Developer Account** ($99/year)
- **iPad or iPhone** for testing
- **Valid signing certificate** in Xcode

### Build Steps

```bash
# 1. Make build script executable
chmod +x build-ios-release.sh

# 2. Run the build script
./build-ios-release.sh

# This will:
# - Build web assets (pnpm build)
# - Sync to Capacitor iOS
# - Prompt for Xcode signing configuration
# - Build and archive for App Store
# - Export IPA
```

**Output:** `build/Exports/Legends of Kai-Jax.ipa`

### Manual Xcode Configuration

When the build script prompts, open Xcode and configure:

```bash
open ios/App/App.xcodeproj
```

In Xcode:
1. Select **App** target
2. **Signing & Capabilities**
3. Select your **Apple Developer Team**
4. **Bundle ID:** `com.yourcompany.kaijaxtthememoryheroe`
5. **Version:** 1.0
6. **Build:** 1
7. Enable **Automatically manage signing**

### App Store Submission

1. **Create App in App Store Connect**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create new app
   - Platform: iOS
   - Name: Legends of Kai-Jax: The Memory Hero
   - Primary Language: English
   - Bundle ID: `com.yourcompany.kaijaxtthememoryheroe`

2. **Upload IPA**
   - Use Xcode Organizer:
     - Xcode > Window > Organizer
     - Select your archive
     - Click "Distribute App"
     - Select "App Store Connect"
   - Or use Apple Transporter app

3. **Store Listing**
   - Title: Legends of Kai-Jax: The Memory Hero
   - Subtitle: "The Memory King Rises"
   - Description: Full game description
   - Screenshots: iPhone 6.7" and iPad 12.9" sizes
   - Preview Video: (optional)

4. **App Information**
   - Privacy Policy URL: (required)
   - Category: Games > Action
   - Age Rating: 4+

5. **Test Flight (Optional)**
   - Submit to TestFlight first for internal testing
   - Invite testers via email
   - Gather feedback before App Store review

6. **Submit for Review**
   - Version Release: Automatic (release after approval)
   - Submit for Review
   - Apple reviews in 1-2 business days typically

---

## 🔍 Pre-Release Checklist

### Before Building
- [ ] Web app production build tested locally
- [ ] All 15 missions verified playable
- [ ] 3D models rendering correctly
- [ ] Combat mechanics tested
- [ ] No console errors

### Before Submission
- [ ] APK/IPA built successfully
- [ ] App tested on real device (emulator acceptable for initial test)
- [ ] Store listings completed with screenshots
- [ ] Privacy policy created and hosted
- [ ] App icon and promotional graphics prepared

### Store-Specific
- **Android:**
  - [ ] Content Rating (IARC) submitted
  - [ ] Privacy Policy linked
  - [ ] Permissions justified
  
- **iOS:**
  - [ ] Privacy Policy URL set
  - [ ] Age Rating completed
  - [ ] IDFA disclosure (if applicable)
  - [ ] TestFlight beta completed (optional)

---

## 📋 Build Troubleshooting

### Android
| Issue | Solution |
|-------|----------|
| `SDK location not found` | Set `ANDROID_HOME` or add `sdk.dir` to `local.properties` |
| Gradle build fails | Run `./gradlew clean` then retry |
| Out of memory | Increase Gradle heap: `export GRADLE_OPTS="-Xmx4g"` |
| APK too large | Minification is enabled in release config |

### iOS
| Issue | Solution |
|-------|----------|
| `No signing certificate` | Add Apple Developer Team in Xcode signing settings |
| Archive fails | Check Xcode build settings, ensure deployment target >= 11.0 |
| IPA export fails | Verify provisioning profile and code signing identity |
| TestFlight upload fails | Check Bundle ID matches App Store Connect setup |

---

## 📞 Support Resources

- **Android:** `.github/workflows/android-build.yml` (CI reference)
- **iOS:** `docs/ios/APP_STORE_BUILD.md` (detailed iOS guide)
- **General:** `BETA_RELEASE_GUIDE.md` (full deployment guide)

---

## 🚀 After Launch

1. **Monitor Analytics**
   - Google Play Console or App Store Connect
   - Track installs, crashes, ratings

2. **Read Reviews**
   - Address common feedback
   - Fix any reported bugs

3. **Plan Updates**
   - Bug fixes prioritized
   - New features based on user feedback
   - Regular updates signal active development

---

**Ready to ship!** 🎮

Build locally using the scripts above, test on real devices, and submit to stores.
