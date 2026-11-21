# Kai-Jax icon and splash — controlled integration

**Status:** owner-authorized branding concept, not final store or console release certification. Draft PR #392.

- Web PWA: 1024px icon master, 192px and 512px manifest icons, default branded `SplashScreen.tsx` background, and apple-touch icon. Confirm the component renders on real game boot.
- Android: two existing Android project variants use branded 432px adaptive foreground/background PNGs; web Android launch theme uses branded landscape WebP. Legacy density variants remain and require coherent update before release.
- iOS Capacitor: 1024px app icon, 2732px launch-image JPEG in universal `Splash.imageset`. Test Xcode icon and launch storyboard loading; no signing or TestFlight submission performed.
- Desktop Electron: the referenced Windows ICO, macOS ICNS and Linux PNG resources are present under `apps/desktop/build/`; packaging, runtime, code signing and notarization must still be tested on the target operating systems. No GDK/PS5 SDK build or console certification is implied.
- **Unchanged:** hero GLBs and villain art, frozen Wave 7 source, story progression, service integrations, authentication and production billing.

**Blocking:** villain mismatch #395, real-device WebView GPU #396, ZIP import portability #397, physical hardware, human full-campaign QA, platform signing and legal/store review. Release **NO GO**.
