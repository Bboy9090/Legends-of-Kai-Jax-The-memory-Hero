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
const battleController = read("apps/web/src/components/game/PlayerController.tsx");
const missionController = read("apps/web/src/components/game/adventure/AdventurePlayerController.tsx");

requireRule(
  !cameraEffects.includes("camera.position") && !cameraEffects.includes("useThree("),
  "CameraEffects must never own camera position; BattleCamera is the only framing authority.",
);
requireRule(
  battleCamera.includes("midX") && battleCamera.includes("opponentX") && battleCamera.includes("playerX"),
  "BattleCamera must frame from both fighters, not a single-player chase target.",
);
requireRule(
  battleGuard.includes("MAX_GAMEPLAY_SHAKE") && battleGuard.includes("MIN_FIGHTER_SEPARATION"),
  "BattleSessionGuard must cap shake and prevent unreadable fighter overlap.",
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
  battleController.includes("firstConnectedGamepad") && battleController.includes("gamepadconnected"),
  "Versus must support standard gamepad input and reconnect edge-state cleanup.",
);
requireRule(
  missionController.includes("firstConnectedGamepad") && missionController.includes("GAMEPAD_DEADZONE"),
  "Mission must support standard gamepad movement/action input.",
);

if (failures.length > 0) {
  console.error("Combat release certification FAILED:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Combat release certification PASS");
console.log("- single-authority Versus camera");
console.log("- midpoint fighter framing");
console.log("- gameplay-safe shake/overlap guard");
console.log("- Mission threat cap and telegraph whiff fairness");
console.log("- Mission post-hit anti-stunlock window");
console.log("- Versus + Mission gamepad coverage");
