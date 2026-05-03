# iOS App Store Build Guide - Legends of Kai-Jax

This document outlines the process for building and preparing the **Legends of Kai-Jax** iOS application for the Apple App Store.

## Prerequisites

- **macOS** with the latest version of **Xcode**.
- **CocoaPods** installed (`sudo gem install cocoapods`).
- **Node.js** and **pnpm** installed.

## Build Pipeline

### 1. Build the Web Application
Navigate to the web application directory and run the production build:

```bash
cd apps/web
npm run build
```

### 2. Sync with Capacitor
Sync the compiled web assets with the iOS native project:

```bash
npx cap sync ios
```

*Note: If this is the first time running sync, it will also attempt to run `pod install` in the `ios/App` directory.*

### 3. Open in Xcode
Open the native iOS project in Xcode to manage signing, assets, and deployment:

```bash
npx cap open ios
```

## App Store Preparation

### Bundle Configuration
- **Bundle ID**: `com.bobbyblanco.legendsofkaijax`
- **Display Name**: `Legends of Kai-Jax`
- **Version**: `1.0.0`
- **Build**: Increment this for every TestFlight/App Store upload.

### Assets & Branding
High-fidelity branding assets have been generated and are available in the project artifacts:
- **App Icon**: `kai_jax_app_icon.png` (1024x1024)
- **Splash Screen**: `kai_jax_splash_screen.png` (1242x2688)

The following assets must be configured in Xcode under `App/App/Assets.xcassets`:
- **AppIcon**: 1024x1024px master icon.
- **Splash Screen**: Configured via `LaunchScreen.storyboard` or Launch Screen images.

### Signing & Capabilities
1. In Xcode, select the **App** project in the sidebar.
2. Go to the **Signing & Capabilities** tab.
3. Select your Development Team.
4. Ensure **Automatically manage signing** is checked.

## App Store Submission

1. **Archive**: In Xcode, select **Product > Archive** (ensure "Any iOS Device" is selected as the destination).
2. **Validate**: Once the archive is complete, click **Validate App** in the Organizer window.
3. **Distribute**: Click **Distribute App** to upload the build to App Store Connect.
4. **TestFlight**: After processing, the build will appear in App Store Connect under the TestFlight tab for internal/external testing.

## Technical Notes

- **Offline Support**: The app is designed to be fully playable offline.
- **Optimization**: Texture sizes and GLB models have been optimized for mobile performance.
- **Controls**: Touch controls are mapped to the core combat runtime automatically.
