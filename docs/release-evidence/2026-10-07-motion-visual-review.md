# Kai gameplay visual review — 2026-10-07

Release status: NOT visually qualified. PR #282 remains Draft.

At commit 3f9d8a9db2e36bc67c082aa5888bb73576a4f84b all seven hosted PR workflows passed. The Mac selected separate authored Walk and Run clips. The local unit suite passed 227 tests in 34 files with one worker. The production dependency audit passes its high/critical threshold; 12 lower-severity findings remain.

Captured battles at 1280×800 and 640×400 show an excessively dark scene, a small Kai silhouette relative to opponents, and crowded touch controls. Opponent.tsx uses AnatomicalBeastModel rather than the canonical GLB renderer. These frames do not qualify planted feet, attack contact, or camera framing.

The capture sequence ran too slowly to establish attack timing. Punch/kick samples were idle by the time frames were obtained; they are not attack evidence. Kai's loaded authored clips contain base, Walk, and Run, but no authored Punch or Kick.

The cinematic composer lacked its final tone-mapping/color-space OutputPass. Its priority-one callback suppresses automatic R3F rendering; disabled, absent, or failed effects must explicitly draw the base scene. Temporarily omitting effects showed base geometry but presentation remained unqualified. The diagnostic omission was restored.

Remaining: canonical fighter/opponent models and consistent scale; readable lighting and camera; compatible authored attacks; a polished Enforcer encounter; approved title/menu/Raging City path; desktop and mobile visual certification. Do not treat automated success as visual release approval.
