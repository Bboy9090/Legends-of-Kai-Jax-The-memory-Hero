import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { BattleCombatState } from "../../lib/combatSystems";
import { detRand11, type BattleCameraMode } from "../../lib/cameraModes";

const BASE_HEIGHT = 4.2;
const BASE_DIST = 9.5;
const CAM_LERP = 6;
const SHAKE_SEED_BASE = 10007;

function resolveBattleCameraMode(s: {
  playerAttacking: boolean;
  opponentAttacking: boolean;
  playerCombatState: BattleCombatState;
}): BattleCameraMode {
  const inTightCombat =
    s.playerAttacking ||
    s.opponentAttacking ||
    s.playerCombatState === BattleCombatState.BLOCKING ||
    s.playerCombatState === BattleCombatState.PARRY_WINDOW ||
    s.playerCombatState === BattleCombatState.HITSTUN ||
    s.playerCombatState === BattleCombatState.GUARD_BROKEN;

  if (inTightCombat) return "combat";
  if (s.playerCombatState === BattleCombatState.DODGING) return "lockOn";
  return "exploration";
}

export default function BattleCamera() {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  const posRef = useRef(new THREE.Vector3(0, BASE_HEIGHT, BASE_DIST));
  const frameRef = useRef(0);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    frameRef.current += 1;
    const b = useBattle.getState();
    const { playerX, playerY, opponentX, opponentY, screenShake, playerAttacking, opponentAttacking, playerCombatState } = b;

    const mode = resolveBattleCameraMode({
      playerAttacking,
      opponentAttacking,
      playerCombatState,
    });

    const midX = (playerX + opponentX) * 0.5;
    const midY = (playerY + opponentY) * 0.5;
    const separation = Math.min(16, Math.abs(playerX - opponentX));

    let distMul = 1;
    let heightMul = 1;
    let targetYOffset = 1.15;
    let sideBias = 0;

    if (mode === "exploration") {
      distMul = 1.08;
      heightMul = 1.06;
      targetYOffset = 1.35;
    } else if (mode === "combat") {
      distMul = 0.92;
      heightMul = 0.96;
      targetYOffset = 1.05;
      sideBias = (playerX - opponentX) * 0.12;
    } else {
      distMul = 0.88;
      heightMul = 0.94;
      targetYOffset = 1.0;
      sideBias = (playerX - opponentX) * 0.18;
    }

    const dynamicDist = (BASE_DIST + separation * 0.35) * distMul;
    const dynamicHeight = (BASE_HEIGHT + separation * 0.12) * heightMul;

    targetRef.current.set(midX + sideBias, midY + targetYOffset, 0);

    const idealPos = new THREE.Vector3(midX + sideBias * 0.5, dynamicHeight, dynamicDist);
    const lerpRate = mode === "combat" ? CAM_LERP * 1.15 : CAM_LERP;
    posRef.current.lerp(idealPos, lerpRate * delta);

    let shakeScale = 1;
    if (mode === "combat") shakeScale = 0.72;
    if (mode === "lockOn") shakeScale = 0.55;

    let shakeX = 0;
    let shakeY = 0;
    if (screenShake > 0.01) {
      const intensity = Math.min(1, screenShake) * shakeScale;
      const t = Math.floor(state.clock.elapsedTime * 60) + frameRef.current;
      shakeX = detRand11(t + SHAKE_SEED_BASE) * intensity * 0.16;
      shakeY = detRand11(t + SHAKE_SEED_BASE + 17) * intensity * 0.11;
    }

    camera.position.set(posRef.current.x + shakeX, posRef.current.y + shakeY, posRef.current.z);
    camera.lookAt(targetRef.current);
  });

  return null;
}
