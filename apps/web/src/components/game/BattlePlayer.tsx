/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import { ATTACK_TYPE_TO_MOVE, MOVES, getMoveFrameTime } from "../../lib/combatSystems";
import GLBCharacterModel from "./models/GLBCharacterModel";

export default function BattlePlayer() {
  const timeRef = useRef(0);

  const {
    playerFighterId,
    playerX,
    playerY,
    playerFacingRight,
    playerAttacking,
    playerAttackType,
    playerAttackElapsed,
    playerInvulnerable,
    playerVelocityX,
    playerVelocityY,
    playerGrounded,
  } = useBattle();

  const fighter = getFighterById(playerFighterId);

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
  });

  if (!fighter) return null;

  return (
    <group
      position={[playerX, playerY, 0]}
      scale={[playerFacingRight ? 1 : -1, 1, 1]}
    >
      <GLBCharacterModel
        fighterId={playerFighterId}
        animTime={timeRef.current}
        isAttacking={playerAttacking}
        isMoving={Math.abs(playerVelocityX) > 0.5}
        attackType={playerAttackType}
        attackProgress={playerAttacking && playerAttackType ? (() => {
          const key = ATTACK_TYPE_TO_MOVE[playerAttackType];
          const move = key ? MOVES[key] : null;
          return move ? Math.min(1, playerAttackElapsed / getMoveFrameTime(move).totalTime) : undefined;
        })() : undefined}
        velocityX={playerVelocityX}
        velocityY={playerVelocityY}
        isGrounded={playerGrounded}
        isJumping={playerVelocityY > 0 && !playerGrounded}
        emotionIntensity={0.5}
        accentColor={fighter.accentColor}
        isInvulnerable={playerInvulnerable}
        hitAnim={playerInvulnerable ? 1 : 0}
      />
    </group>
  );
}
