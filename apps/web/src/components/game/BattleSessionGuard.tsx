import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useTouchInput } from "../../lib/stores/useTouchInput";
import { MOVEMENT_TUNING } from "../../game/tuning/movementTuning";

const { arenaXMin, arenaXMax, groundY } = MOVEMENT_TUNING.battle;
const MIN_FIGHTER_SEPARATION = 0.85;

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

/**
 * Defensive round/session invariants.
 *
 * This component does not own movement or combat. It only repairs impossible
 * state that can otherwise survive a scene transition and ruin the next fight.
 */
export default function BattleSessionGuard() {
  const battlePhase = useBattle((s) => s.battlePhase);

  useEffect(() => {
    // Never carry held movement or queued touch attacks across round boundaries.
    useTouchInput.getState().releaseJoystick();
    useTouchInput.setState({ pendingAttacks: [] });

    // Slow motion must never leak into a fresh round/menu transition.
    if (battlePhase === "preRound" || battlePhase === "fighting" || battlePhase === "results") {
      useBattle.getState().setTimeScale(1);
    }
  }, [battlePhase]);

  useEffect(() => {
    const release = () => {
      useTouchInput.getState().releaseJoystick();
      useTouchInput.setState({ pendingAttacks: [] });
    };
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);
    return () => {
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", release);
      release();
      useBattle.getState().setTimeScale(1);
    };
  }, []);

  useFrame(() => {
    const s = useBattle.getState();
    if (s.battlePhase !== "fighting" && s.battlePhase !== "transforming") return;

    let playerX = Math.max(arenaXMin, Math.min(arenaXMax, finiteOr(s.playerX, -4)));
    let opponentX = Math.max(arenaXMin, Math.min(arenaXMax, finiteOr(s.opponentX, 4)));
    const playerY = Math.max(groundY, finiteOr(s.playerY, groundY));
    const opponentY = Math.max(groundY, finiteOr(s.opponentY, groundY));

    // Prevent exact model overlap. When both centers occupy effectively the same
    // spot, facing and hit readability collapse. Nudge them apart around midpoint.
    const sep = Math.abs(opponentX - playerX);
    if (sep < MIN_FIGHTER_SEPARATION) {
      const mid = (playerX + opponentX) * 0.5;
      const playerOnLeft = s.playerFacingRight || playerX <= opponentX;
      const half = MIN_FIGHTER_SEPARATION * 0.5;
      playerX = Math.max(arenaXMin, Math.min(arenaXMax, mid + (playerOnLeft ? -half : half)));
      opponentX = Math.max(arenaXMin, Math.min(arenaXMax, mid + (playerOnLeft ? half : -half)));
    }

    if (
      playerX !== s.playerX ||
      opponentX !== s.opponentX ||
      playerY !== s.playerY ||
      opponentY !== s.opponentY
    ) {
      useBattle.setState({
        playerX,
        opponentX,
        playerY,
        opponentY,
        playerFacingRight: opponentX > playerX,
        opponentFacingRight: playerX > opponentX,
      });
    }
  });

  return null;
}
