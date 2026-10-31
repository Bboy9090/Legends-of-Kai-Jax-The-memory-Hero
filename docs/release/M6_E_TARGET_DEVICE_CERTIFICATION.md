# Mission 6 — M6-E Target-Device Certification Ledger

Mission: Shadows of the Ashblock (story_act2_m6).
Pull request: https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero/pull/309
Scope: mission input, native runtime, frame pacing and reward acceptance. Parry-counter remains isolated. Do not replace playable character GLBs.

## Evidence classifications

- **PASS — GitHub source/CI (69dcf363b18b07088c72a759298250414c2445fa):** all 16 checks completed successfully, including web build, iOS unsigned archive, Android bundle, release certification, CodeQL and production mobile runtime smoke. Recheck each new PR head.
- **PASS — state-driven full mission (prior source e7cf19d):** live React mission progressed from six Void grunts through eight Void scouts, with 14 kills applied using the existing combat damage API, three real E-key rescues, victory outro and results, score 850, completion record and persistent Ashblock Memory. NOT evidence of 14 user-executed attacks.
- **PASS — virtual gamepad (69dcf36):** the actual AdventurePlayerController processed synthetic LB/L1 standard button 4 through navigator.getGamepads and rescued a nearby unlocked node. NOT a physical HID-device pass.
- **PASS — emulated phone portrait (375 x 667), tablet portrait (768 x 1024), phone landscape (844 x 390):** three Playwright M6-E tests passed, exit 0. Actual touch event handlers covered mission entry, onscreen HUD bounds, pause/resume, and touch Rescue, with no page errors.
- **PASS — iOS simulator launch diagnostic:** booted an iOS 26.5 iPhone 17 Pro simulator; a retry of simctl openurl successfully opened the local web preview and a simulator screenshot was captured. The simulator was subsequently shut down. This is NOT native app installation, Mission 6 playthrough, or physical-device certification.
- **BLOCKED — iOS physical installation / gameplay:** devicectl returned only unavailable previously known devices. No authorized connected iPhone/iPad.
- **BLOCKED — Android physical installation / gameplay:** adb devices -l returned no attached authorized Android device.
- **BLOCKED — physical gamepad and touch responsiveness:** Mac HID/USB scan found no connected controller or phone.
- **BLOCKED — local iOS Capacitor simulator app install:** CocoaPods absent; Homebrew proposed broad LLVM/Rust upgrades. Installation was stopped; Mac internal storage approximately 97% used with 12–14 GiB free. No unrelated files or caches were erased.
- **BLOCKED — target-device frame timing and three-second transition:** local software WebGL can delay event-loop progression dramatically; this is telemetry, not an authority for device responsiveness.

**Disposition:** M6-E physical release acceptance is NOT PASSED. Maintain merge/release hold wherever human physical-device acceptance is required.

## Exact registered game models

M6 uses existing playable-model registrations, not placeholders:

- Kai-Jax: /models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb
- Void grunt (rift-drone): /models/drone.glb
- Void scout (hyena-scout): /models/hyenaratvbill.glb

The emulated-touch tests read these mappings from the actual modelRegistry; separate unit tests verify registered GLB files. Do not substitute old menu artwork for a playable mesh.

## Repeatable automated evidence

From the exact PR head, in apps/web with dependencies installed:

    npm run typecheck:phase0
    npm test
    npm run build
    npx playwright test --config=playwright.m6-dev.config.ts e2e/mission6-touch.devtest.ts --workers=1
    npx playwright test --config=playwright.m6-dev.config.ts e2e/mission6-flow.devtest.ts --grep 'virtual standard gamepad' --workers=1
    npx playwright test --config=playwright.m6-dev.config.ts e2e/mission6-flow.devtest.ts --grep 'M6-C real mission UI' --workers=1

The existing Mobile Store Readiness workflow has been extended to run the three emulated touch tests and virtual gamepad regression on each new PR head, always labeled NON-PHYSICAL. These tests may be green while physical certification remains blocked.

## Required target-device procedure (not yet executed)

1. Inventory an authorized iPhone or iPad, authorized Android phone, and actual gamepad. Record model, OS version, controller transport, exact build commit and test owner. Verify with devicectl, adb and HID tools. Do not modify an unauthorized device.
2. Install a testable native build by the official iOS/Android signing and testing path. Confirm launch, GLB assets, no black screen, audio, UI safe areas, portrait/landscape, pause/resume, app background/foreground, and crashes or reloads.
3. Play Mission 6 entirely using **physical** controls. Confirm six real Void grunts, eight real Void scouts, enemy aggro/telegraphs, stamina restrictions, all 14 defeats through gameplay, and no duplicate waves.
4. Capture monotonic timestamps from last Wave 1 defeat to Wave 2 spawn. Validate canonical three-second gameplay delay, including pause and resume. Report raw measurements; do not substitute software-browser wall time.
5. Approach and rescue all three physical in-world memory nodes with touch and/or LB/L1. Confirm lock/range enforcement, no automatic rescue on KO, single action per press, and pause denial.
6. Verify outro and results: 500 XP, 350 currency, unique Ashblock Memory, mission completion, campaign return, profile-scoped persistence after app restart, and repeat-clear deduplication.
7. Use the existing Phase B2 **hardware** gate: sustained >30 FPS and maximum frame time <50 ms for at least two of three sampled windows, with screenshots/logs; classify any software renderer as telemetry only.
8. Attach time-stamped device recordings, native logs, screenshots and explicit owner sign-off; keep all unobserved physical checks BLOCKED.

## Restrictions and handoff

- Keep parry-counter and other combat doctrine changes outside M6-E.
- Do not rename or replace existing Kai/Jax or enemy GLBs to manufacture test success.
- Treat simulator boot, iOS compile/archive, browser emulation and virtual gamepad as distinct from physical device acceptance.
- Stop local builds rather than exhaust disk space. The aborted CocoaPods installation did not prove native app installability.
- Do not merge PR #309 on the strength of emulated tests alone when physical certification remains part of the release policy.
