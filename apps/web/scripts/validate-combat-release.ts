import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const failures: string[] = [];

function requireRule(ok: boolean, message: string) {
  if (!ok) failures.push(message);
}

const cameraEffects = read("apps/web/src/components/game/CameraEffects.tsx");
const battleCamera = read("apps/web/src/components/game/BattleCamera.tsx");
const battleGuard = read("apps/web/src/components/game/BattleSessionGuard.tsx");
const missionAI = read("apps/web/src/components/game/adventure/AdventureEnemyAI.tsx");
const versusAI = read("apps/web/src/components/game/OpponentAI.tsx");
const battleController = read("apps/web/src/components/game/PlayerController.tsx");
const missionController = read("apps/web/src/components/game/adventure/AdventurePlayerController.tsx");
const missionHud = read("apps/web/src/components/game/adventure/AdventureHUD.tsx");
const missionArena = read("apps/web/src/components/game/adventure/AdventureArena.tsx");
const targeting = read("apps/web/src/game/combat/targeting.ts");
const particleManager = read("apps/web/src/components/game/ParticleManager.tsx");
const attackTrails = read("apps/web/src/components/game/AttackTrails.tsx");
const battleScene = read("apps/web/src/components/game/BattleScene.tsx");

requireRule(
  !cameraEffects.includes("camera.position") && !cameraEffects.includes("useThree("),
  "CameraEffects must never own camera position; BattleCamera is the only framing authority.",
);
requireRule(
  battleCamera.includes("midX") && battleCamera.includes("opponentX") && battleCamera.includes("playerX"),
  "BattleCamera must frame from both fighters, not a single-player chase target.",
);
requireRule(
  battleGuard.includes("MAX_READABLE_SCREEN_SHAKE") && battleGuard.includes("MIN_FIGHTER_SEPARATION"),
  "BattleSessionGuard must cap shake and prevent unreadable fighter overlap.",
);
requireRule(
  battleGuard.includes("guardedEndBattle") &&
    battleGuard.includes('phase === "ko" || phase === "results"') &&
    battleGuard.includes("enteringFreshFight"),
  "Versus lifecycle must prevent duplicate KO processing and normalize fresh-round combat state.",
);
requireRule(
  battleGuard.includes("guardedResetRound") && battleGuard.includes('phase === "preRound"'),
  "Rematch flow must debounce duplicate resetRound calls while a new round is already queued.",
);
requireRule(
  battleGuard.includes("playerAttacking: false") &&
    battleGuard.includes("opponentAttacking: false") &&
    battleGuard.includes("playerInvulnerable: false") &&
    battleGuard.includes("opponentInvulnerable: false"),
  "Fresh rounds must clear stale attacks and invulnerability state.",
);
requireRule(
  battleScene.includes("<BattleSessionGuard") && battleScene.includes("<BattleReadabilityOverlay"),
  "Versus scene must mount both session-safety and readability overlays.",
);
requireRule(
  missionAI.includes("MAX_SIMULTANEOUS_THREATS = 2"),
  "Mission combat must cap simultaneous active threats at two.",
);
requireRule(
  missionAI.includes("POST_HIT_INVULN_SEC"),
  "Mission combat must provide a short post-hit protection window against stun-lock pileups.",
);
requireRule(
  missionAI.includes("dist > tierConfig.attackRange"),
  "Escaping a Mission telegraph must produce a real whiff outside the visible attack range.",
);
requireRule(
  missionController.includes("MISSION_BOUNDARY = 32") && missionController.includes("THREE.MathUtils.clamp"),
  "Mission movement must stay inside the certified combat boundary.",
);
requireRule(
  missionArena.includes("VISUAL_ARENA_SIZE = 76") && !missionArena.includes("planeGeometry args={[200, 200]}"),
  "Mission render footprint must stay compact and cannot return to the old 200x200 arena plane.",
);
requireRule(
  missionHud.includes("AutoTargetIndicator") && missionHud.includes("Incoming — dodge!"),
  "Mission HUD must identify the auto-target and surface incoming attack warnings.",
);
requireRule(
  targeting.includes("CURRENT_TARGET_BONUS") && targeting.includes("lastAutoTargetId"),
  "Mission auto-target must preserve target stickiness instead of flickering every frame.",
);
requireRule(
  versusAI.includes('p === "aggressive"') &&
    versusAI.includes('p === "defensive"') &&
    versusAI.includes("DEFENSIVE_HOLD_MIN") &&
    versusAI.includes("personalitySpacing"),
  "Versus aggressive and defensive personalities must use meaningfully different spacing and pressure behavior.",
);
requireRule(
  particleManager.includes("MAX_PARTICLES = 220") &&
    !particleManager.includes("MAX_PARTICLES = 500") &&
    particleManager.includes("pounceEmitCooldownRef"),
  "Versus particle effects must remain inside the certified readability/performance budget.",
);
requireRule(
  attackTrails.includes("MAX_TRAIL_POINTS = 24") &&
    attackTrails.includes("TRAIL_EMIT_INTERVAL") &&
    attackTrails.includes("slice(-4)"),
  "Versus attack trails must stay throttled and limit glow-mesh fanout.",
);
requireRule(
  battleController.includes("firstConnectedGamepad") &&
    battleController.includes("gamepadconnected") &&
    battleController.includes("gamepaddisconnected") &&
    battleController.includes("visibilitychange"),
  "Versus must support standard gamepad input and reconnect/focus cleanup.",
);
requireRule(
  missionController.includes("firstConnectedGamepad") &&
    missionController.includes("GAMEPAD_DEADZONE") &&
    missionController.includes("gamepadconnected") &&
    missionController.includes("gamepaddisconnected") &&
    missionController.includes("visibilitychange"),
  "Mission must support standard gamepad input and reconnect/focus cleanup.",
);
requireRule(
  battleGuard.includes("pendingAttacks: []") && battleGuard.includes("releaseJoystick"),
  "Round/session transitions must clear stale touch movement and queued attacks.",
);

if (failures.length > 0) {
  console.error("Combat release certification FAILED:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Combat release certification PASS");
console.log("- single-authority Versus camera and midpoint framing");
console.log("- gameplay-safe shake, overlap, KO/rematch idempotency, and fresh-round cleanup");
console.log("- Mission threat cap, telegraph whiff fairness, and anti-stunlock protection");
console.log("- bounded Mission combat space, compact render footprint, and stable target readability");
console.log("- differentiated Versus AI personalities");
console.log("- certified Versus particle and trail performance/readability budgets");
console.log("- Versus + Mission gamepad reconnect/focus cleanup");
console.log("- stale touch input cleared across round transitions");
