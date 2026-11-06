# PRODUCTION AUTOMATION FRAMEWORK
## Legends of Kai-Jax: The Memory Hero

**Last Updated:** 2026-11-06  
**Status:** LOCKED & OPERATIONAL  
**Version:** 1.0.0

---

## 📋 SYSTEM OVERVIEW

This framework defines the complete automation pipeline for production builds, native compilation, and CI/CD operations for the Legends of Kai-Jax game ecosystem.

**Key Metrics:**
- Web Bundle Target: <2.5MB gzip
- Character Roster: 15/15 complete
- CI Suite: 13/13 checks
- Build System: Vite + Capacitor + Gradle/Xcode
- Deployment: Vercel (preview) + Native stores (Android/iOS)

---

## 🔐 PART 1: KEYSTORE & SIGNING PROTOCOL

### Setup (One-Time)

1. **Generate Keystore:**
   ```bash
   keytool -genkey -v -keystore legends-kai-jax.keystore \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias legends-kai-jax-prod
   ```

2. **Store Securely:**
   ```bash
   # Move to secure location (NOT in git)
   mv legends-kai-jax.keystore /secure/
   chmod 600 /secure/legends-kai-jax.keystore
   ```

3. **GitHub Secrets Setup:**
   - Go to: Settings → Secrets and variables → Actions
   - Add: `ANDROID_KEYSTORE_PASSWORD`
   - Add: `KEY_PASSWORD`

4. **Environment Configuration:**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with actual paths and passwords
   chmod 600 .env.production
   ```

### Gradle Configuration

**File: `apps/mobile/android/app/build.gradle`**

```gradle
android {
  signingConfigs {
    production {
      storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "dummy.keystore")
      storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
      keyAlias System.getenv("ANDROID_KEY_ALIAS")
      keyPassword System.getenv("ANDROID_KEY_PASSWORD")
    }
  }
  
  buildTypes {
    release {
      signingConfig signingConfigs.production
      minifyEnabled true
      shrinkResources true
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
      
      buildConfigField "String", "BUILD_DATE", "\"${new Date().format('yyyy-MM-dd HH:mm:ss')}\""
      buildConfigField "String", "GIT_COMMIT", "\"${System.getenv('GIT_COMMIT') ?: 'unknown'}\""
    }
  }
}
```

---

## 🍎 PART 2: iOS BUILD CONFIGURATION

**Minimum Requirements:**
- iOS 14.0+
- Swift 5.9
- Xcode 15.0+
- Cocoapods 1.14+

**File: `capacitor.config.ts`**

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legendsofkaijax.game',
  appName: 'Legends of Kai-Jax',
  webDir: 'dist',
  ios: {
    scheme: 'App',
    productName: 'Legends of Kai-Jax',
    deploymentTarget: '14.0',
    buildFlags: [
      'CODE_SIGN_IDENTITY=""',
      'CODE_SIGNING_REQUIRED=NO',
      'CODE_SIGN_ENTITLEMENTS=""'
    ]
  },
  android: {
    buildToolsVersion: '34.0.0',
    compileSdkVersion: 34,
    targetSdkVersion: 34,
    minSdkVersion: 24
  }
};

export default config;
```

**Podfile Configuration:**

```ruby
platform :ios, '14.0'

target 'App' do
  cap_pods
  
  pod 'Firebase/Core'
  pod 'Firebase/Analytics'
  
  post_install do |installer|
    installer.pods_project.targets.each do |target|
      flutter_additional_ios_build_settings(target)
      target.build_configurations.each do |config|
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
          '$(inherited)',
          'PERMISSION_CAMERA=1',
          'PERMISSION_MICROPHONE=1'
        ]
      end
    end
  end
end
```

---

## 🚀 PART 3: EXECUTION COMMANDS

### Development Build

```bash
# Web Development Server
cd apps/web
npm run dev  # Runs on http://localhost:5173

# Capacitor Sync & Preview
npm run cap:sync
npm run cap:open  # Opens iOS simulator (Mac only)
```

### Production Verification

```bash
# Run complete verification suite
npm run verify:prod

# Expected output:
# ✅ TypeScript: PASS
# ✅ Build: PASS
# ✅ Bundle size: <2.5MB gzip
# ✅ Character registry: VERIFIED
# ✅ PRODUCTION READINESS: APPROVED
```

### Web Production Build

```bash
cd apps/web
npm run build
npm run preview  # Test production bundle locally
```

### Android Release Build

```bash
cd apps/mobile

# Set environment variables
export ANDROID_KEYSTORE_PATH=/secure/legends-kai-jax.keystore
export ANDROID_KEYSTORE_PASSWORD=<from-env-or-secrets>
export ANDROID_KEY_ALIAS=legends-kai-jax-prod
export ANDROID_KEY_PASSWORD=<from-env-or-secrets>

# Build signed APK
gradle bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS Release Build

```bash
cd apps/mobile

# Sync web assets
npx cap sync ios

# Build via Xcode (command line)
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -derivedDataPath build \
  -arch arm64 \
  archive

# Build & upload to App Store
xcodebuild -exportArchive \
  -archivePath build/App.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath ios-build
```

---

## ✅ PART 4: VERIFICATION PIPELINE

### Automated Verification Script

Run before any push to main:

```bash
npm run verify:prod
```

**Script performs:**
1. Repository state check (working tree clean)
2. TypeScript compilation (full project)
3. Production build validation
4. Bundle size analysis (<2.5MB gzip)
5. Character registry validation
6. Production artifact verification

### Manual CI Validation

After pushing, verify all 13 GitHub Actions checks pass:

```
✅ Core character release authority
✅ build
✅ runtime-smoke
✅ Build APK
✅ dependency-audit
✅ Release Certification
✅ Web + Capacitor source certification
✅ CodeQL
✅ Analyze (javascript-typescript)
✅ Analyze (python)
✅ Analyze (c-cpp)
✅ Analyze (actions)
✅ Vercel Preview Comments
```

---

## 📊 PART 5: BUILD STATISTICS & TARGETS

| Metric | Target | Current |
|--------|--------|---------|
| Web Bundle (gzip) | <2.5MB | 1.8MB ✅ |
| Character Count | 15/15 | 15/15 ✅ |
| CI Checks Pass | 13/13 | 13/13 ✅ |
| TypeScript Errors | 0 | 0 ✅ |
| Runtime Tests | Pass | Pass ✅ |
| Android Target SDK | 34 | 34 ✅ |
| iOS Deployment | 14.0+ | 14.0+ ✅ |

---

## 🔄 PART 6: STANDARD FEATURE IMPLEMENTATION WORKFLOW

When adding new features, characters, or mechanics:

### Step 1: Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### Step 2: Implement Changes
- Add character data to `apps/web/src/lib/characterStats.ts`
- Add power matrices to `apps/web/src/lib/abilitySystems.ts`
- Add UI components to `apps/web/src/components/game/`
- Update Game Codex if adding new content types

### Step 3: Run Verification
```bash
npm run verify:prod
```

**Must see:**
```
✅ PRODUCTION READINESS: APPROVED
```

### Step 4: Commit & Push
```bash
git add .
git commit -m "feat: [FEATURE_NAME] with complete system rigging"
git push -u origin feature/your-feature-name
```

### Step 5: Create Pull Request
- GitHub will automatically run CI suite (13/13 checks)
- Wait for all checks to pass (GREEN)
- Request code review

### Step 6: Merge to Main
```bash
# After approval and all checks pass
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main
```

### Step 7: Monitor Deployment
- Vercel will automatically deploy main branch
- Check deployment status: https://vercel.com/bboy9090s-projects/legends-of-kai-jax-the-memory-hero-web

---

## 🚫 ABORT CRITERIA

**DO NOT MERGE if any of these are true:**

- ❌ TypeScript compilation errors
- ❌ Any CI check failure (must be 13/13 GREEN)
- ❌ Bundle size >2.5MB gzip
- ❌ Character registry incomplete
- ❌ Unsigned native builds
- ❌ Uncommitted changes in repository
- ❌ Merge conflicts on main branch

---

## 📞 SUPPORT & TROUBLESHOOTING

### Build Failures

**TypeScript Errors:**
```bash
cd apps/web
npm run typecheck:full
# Fix reported errors before proceeding
```

**Bundle Size Bloat:**
```bash
npm run build
# Analyze: ls -lh dist/
# Remove unused assets from src/
# Re-run build verification
```

**CI Check Failures:**
- Check GitHub Actions logs: https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero/actions
- Look for specific error message
- Fix locally, commit, and push again

### Native Build Issues

**Android:**
```bash
cd apps/mobile
gradle clean
gradle bundleRelease --stacktrace
```

**iOS:**
```bash
cd apps/mobile/ios
pod deintegrate
pod install
# Then rebuild in Xcode
```

---

## 📝 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-11-06 | Initial framework release with 15-character roster |

---

**END OF PRODUCTION AUTOMATION FRAMEWORK**
