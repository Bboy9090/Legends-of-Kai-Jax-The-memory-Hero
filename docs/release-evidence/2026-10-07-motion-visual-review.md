# Kai gameplay visual review — updated 2026-10-09

Release status: RUNTIME MOTION CERTIFIED; FINAL VISUAL PRESENTATION NOT YET QUALIFIED. PR #285 remains Draft.

At commit c60f92221dd70078f8fcb1548634549e5165b1c2 all seven hosted PR workflows passed: CI, Security Baseline, Combat Release Certification, Registry Validation, Runtime Smoke Diagnostic, Mobile Store Readiness, and Build Android APK.

The successful Runtime Smoke run used the real Combat Arena training path with Kai mounted in WebGL and a passive training opponent so random AI hitstun could not contaminate motion certification. The live animation probe proved the renderer selected:

- Walk: `Walk:Armature|walking_man|baselayer` — authored
- Run: `Run:Armature|running|baselayer` — authored
- Kick: `Kick:Armature|Lunge_Spin_Kick|baselayer` — authored

The same mounted fighter exposed both authored Kick clips as available:
`Kick:Armature|Lunge_Spin_Kick|baselayer` and
`Kick:Armature|Step_in_High_Kick|baselayer`.

The Spider Kai base, Walk, Run, and the two Kick GLBs use the same 26-node skeleton naming/order. This removes the earlier rig-compatibility concern. Attack selection is now semantic: a Punch cannot silently cross-fallback to a Kick clip. Where an authored attack family is absent, the articulated procedural fallback remains responsible for that attack family.

Keyboard attack edges are buffered across render/hit-stop frames so a real input is not lost merely because the first sampled WebGL frame is temporarily unable to consume it. Runtime certification now waits for deterministic combat state rather than relying on fixed sleeps.

The previous review statement that Kai had no authored Kick is superseded. Authored Kick is now loaded and selected successfully in the hosted runtime path.

The hosted software-WebGL runner could not finish `page.screenshot()` within the 15-second capture window even though the live authored-Kick probe passed. Therefore the screenshot timeout is not treated as failure of the runtime animation proof. It also means final presentation review remains intentionally open.

Remaining visual-release work:

- Obtain rendered desktop and mobile review captures on a hardware-accelerated environment.
- Confirm planted feet, silhouette readability, attack contact framing, lighting, camera distance, and opponent scale in those rendered captures.
- Review the polished Enforcer encounter and approved title/menu/Raging City presentation path.
- Keep PR #285 Draft until those presentation checks are visually approved.

Do not equate green automation with final art-direction approval. Runtime motion selection is certified at c60f922; presentation certification is still a separate gate.
