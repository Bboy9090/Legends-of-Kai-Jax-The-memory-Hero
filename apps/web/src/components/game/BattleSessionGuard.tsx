import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useTouchInput } from "../../lib/stores/useTouchInput";
import { MOVEMENT_TUNING } from "../../game/tuning/movementTuning";

const { arenaXMin, arenaXMax, groundY } = MOVEMENT_TUNING.battle;
const MIN_FIGHTER_SEPARATION = 0.85;
const MAX_READABLE_SCREEN_SHAKE = 0.4;

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function clampArenaX(x: number): number {
  return Math.max(arenaXMin, Math.min(arenaXMax, x));
}

function awayDirection(targetX: number, attackerX: number, fallback: 1 | -1): 1 | -1 {
  if (targetX > attackerX) return 1;
  if (targetX < attackerX) return -1;
  return fallback;
}

function knockDistance(damage: number, attackType: string | null | undefined): number {
  const mult = attackType === "ultimate" ? 0.1 : attackType === "special" ? 0.08 : attackType === "kick" ? 0.07 : 0.06;
  return Math.max(0.45, Math.min(1.35, damage * mult));
}

export default function BattleSessionGuard() {
  const battlePhase = useBattle((s) => s.battlePhase);
  const prevRef = useRef({
    playerHealth: 100,
    opponentHealth: 100,
    playerX: -5,
    opponentX: 5,
  });

  useEffect(() => {
    useTouchInput.getState().releaseJoystick();
    useTouchInput.setState({ pendingAttacks: [] });

    if (battlePhase === "preRound" || battlePhase === "fighting" || battlePhase === "results") {
      useBattle.getState().setTimeScale(1);
    }

    const s = useBattle.getState();
    prevRef.current = {
      playerHealth: s.playerHealth,
      opponentHealth: s.opponentHealth,
      playerX: s.playerX,
      opponentX: s.opponentX,
    };
  }, [battlePhase]);

  useEffect(() => {
    const releaseHeldTouch = () => {
      useTouchInput.getState().releaseJoystick();
    };
    const releaseAllTransientInput = () => {
      releaseHeldTouch();
      useTouchInput.setState({ pendingAttacks: [] });
    };
    const onVisibility = () => {
      if (document.visibilityState !== "visible") releaseAllTransientInput();
    };

    window.addEventListener("blur", releaseAllTransientInput);
    window.addEventListener("pointerup", releaseHeldTouch, true);
    window.addEventListener("pointercancel", releaseHeldTouch, true);
    window.addEventListener("touchcancel", releaseHeldTouch, true);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("blur", releaseAllTransientInput);
      window.removeEventListener("pointerup", releaseHeldTouch, true);
      window.removeEventListener("pointercancel", releaseHeldTouch, true);
      window.removeEventListener("touchcancel", releaseHeldTouch, true);
      document.removeEventListener("visibilitychange", onVisibility);
      releaseAllTransientInput();
      useBattle.getState().setTimeScale(1);
    };
  }, []);

  useFrame(() => {
    const s = useBattle.getState();
    if (s.battlePhase !== "fighting" && s.battlePhase !== "transforming") return;

    const prev = prevRef.current;
    let playerX = clampArenaX(finiteOr(s.playerX, -4));
    let opponentX = clampArenaX(finiteOr(s.opponentX, 4));
    const playerY = Math.max(groundY, finiteOr(s.playerY, groundY));
    const opponentY = Math.max(groundY, finiteOr(s.opponentY, groundY));

    if (s.playerHealth < prev.playerHealth) {
      const damage = prev.playerHealth - s.playerHealth;
      const fallback = s.playerFacingRight ? -1 : 1;
      const dir = awayDirection(prev.playerX, prev.opponentX, fallback);
      playerX = clampArenaX(prev.playerX + dir * knockDistance(damage, s.opponentAttackType));
    }

    if (s.opponentHealth < prev.opponentHealth) {
      const damage = prev.opponentHealth - s.opponentHealth;
      const fallback = s.opponentFacingRight ? -1 : 1;
      const dir = awayDirection(prev.opponentX, prev.playerX, fallback);
      opponentX = clampArenaX(prev.opponentX + dir * knockDistance(damage, s.playerAttackType));
    }

    const sep = Math.abs(opponentX - playerX);
    if (sep < MIN_FIGHTER_SEPARATION) {
      const mid = (playerX + opponentX) * 0.5;
      const playerOnLeft = playerX <= opponentX;
      const half = MIN_FIGHTER_SEPARATION * 0.5;
      playerX = clampArenaX(mid + (playerOnLeft ? -half : half));
      opponentX = clampArenaX(mid + (playerOnLeft ? half : -half));
    }

    const patch: Partial<typeof s> = {};
    if (playerX !== s.playerX) patch.playerX = playerX;
    if (opponentX !== s.opponentX) patch.opponentX = opponentX;
    if (playerY !== s.playerY) patch.playerY = playerY;
    if (opponentY !== s.opponentY) patch.opponentY = opponentY;
    if (s.screenShake > MAX_READABLE_SCREEN_SHAKE) patch.screenShake = MAX_READABLE_SCREEN_SHAKE;

    if (Object.keys(patch).length > 0) {
      useBattle.setState({
        ...patch,
        playerFacingRight: opponentX > playerX,
        opponentFacingRight: playerX > opponentX,
      });
    }

    const current = useBattle.getState();
    prevRef.current = {
      playerHealth: current.playerHealth,
      opponentHealth: current.opponentHealth,
      playerX: current.playerX,
      opponentX: current.opponentX,
    };
  });

  return null;
}
