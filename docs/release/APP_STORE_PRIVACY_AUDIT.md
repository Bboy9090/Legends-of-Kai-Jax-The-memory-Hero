# App Store Privacy / Data-Flow Audit

Status: repository audit for the current Phase C production build. This document is evidence for App Store Connect preparation; it is **not** a substitute for the final App Store Connect questionnaire.

## Current production-active observations

- The app is a React/Three.js + Capacitor game. Direct runtime dependencies include Capacitor core/iOS/Android, React, Three.js, Zustand, UI libraries, and rendering helpers. No advertising SDK, analytics SDK, Firebase, Sentry, PostHog, or comparable tracking package is declared as a direct app dependency.
- Game progress/settings are persisted locally through browser/Capacitor storage mechanisms. This is device-local application state unless another production path explicitly transmits it.
- Character voice playback uses `window.speechSynthesis` / `SpeechSynthesisUtterance`. The current implementation synthesizes game dialogue and does not request microphone input.
- The current `App.tsx` production entry point initializes the game, local stores, service worker, audio, and speech synthesis. It does not import or mount `AIAssistant` in the audited entry point.
- No camera, microphone-capture, geolocation, contacts, advertising-ID, or custom cryptography implementation was identified in the targeted repository searches performed for this audit.

## Dormant / conditional code that must not be misclassified

`src/components/ui/ai-assistant.tsx` contains optional UI code that would POST user-entered text to `/api/chat`, `/api/summarize`, and `/api/sentiment` if that component were wired into a production route. The audited `App.tsx` entry point does not mount it.

**Policy:** if this assistant or any equivalent network-backed user-input feature is enabled in a release build, re-run this privacy audit before submission and update App Store Connect privacy answers to reflect the actual transmitted data and server/provider behavior. Do not inherit a "Data Not Collected" answer from this audit after activating such a feature.

## iOS privacy / admission controls already enforced

The iOS Native Preflight validates:

- valid `Info.plist`;
- bundle ID `com.bobbyblanco.legendsofkaijax`;
- iOS 15 deployment floor in Xcode and Podfile;
- universal 1024×1024 App Icon declaration;
- absence of obsolete `armv7` requirement;
- `ITSAppUsesNonExemptEncryption = false` for the current no-custom-crypto build;
- presence and plist validity of Capacitor's packaged `PrivacyInfo.xcprivacy`;
- web build, Capacitor sync, CocoaPods, and unsigned Release simulator build.

These checks protect repository/native admission metadata. They do not answer Apple's App Store Connect privacy questionnaire on the developer's behalf.

## Candidate App Store Connect privacy position

For the currently audited production entry point, the code evidence is consistent with a **candidate** answer of "Data Not Collected" because observed game state is local and no active tracking/analytics/ad/user-input transmission path was identified in the production entry point.

This remains a candidate until the final shipping build is reviewed end-to-end, including server configuration, production routes, App Store Connect build selection, and any features enabled after this audit.

## Submission-time verification checklist

Before submitting a build:

1. Confirm the exact archive commit matches the audited release head.
2. Re-run repository search for analytics, ads, identifiers, auth/profile collection, location, camera/microphone capture, purchases, crash reporting, and network transmission of user-entered data.
3. Confirm `AIAssistant` or equivalent user-input network feature is still not production-mounted; if it is mounted, update privacy answers.
4. Verify App Store Connect privacy labels against the actual shipping build and backend behavior.
5. Record the final App Store Connect answers and date in release evidence.

## Truth boundary

This audit does **not** certify server-side behavior that is not represented in this repository, Apple's portal configuration, third-party service dashboards, distribution signing, or physical-device behavior.
