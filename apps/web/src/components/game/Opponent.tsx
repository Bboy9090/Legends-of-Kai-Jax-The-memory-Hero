/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import { ATTACK_TYPE_TO_MOVE, MOVES, getMoveFrameTime } from "../../lib/combatSystems";
import GLBCharacterModel from "./models/GLBCharacterModel";

export default function Opponent() {
  const timeRef = useRef(0);

  const {
    opponentFighterId,
    opponentX,
    opponentY,
    opponentFacingRight,
    opponentAttacking,
    opponentAttackType,
    opponentAttackElapsed,
    opponentInvulnerable,
    opponentVelocityX,
    opponentVelocityY,
    opponentGrounded,
  } = useBattle();

  const fighter = getFighterById(opponentFighterId);

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
  });

  if (!fighter) return null;

  return (
    <group
      position={[opponentX, opponentY, 0]}
      scale={[opponentFacingRight ? 1 : -1, 1, 1]}
    >
      <GLBCharacterModel
        fighterId={opponentFighterId}
        animTime={timeRef.current}
        isAttacking={opponentAttacking}
        isMoving={Math.abs(opponentVelocityX) > 0.5}
        attackType={opponentAttackType}
        attackProgress={opponentAttacking && opponentAttackType ? (() => {
          const key = ATTACK_TYPE_TO_MOVE[opponentAttackType];
          const move = key ? MOVES[key] : null;
          return move ? Math.min(1, opponentAttackElapsed / getMoveFrameTime(move).totalTime) : undefined;
        })() : undefined}
        velocityX={opponentVelocityX}
        velocityY={opponentVelocityY}
        isGrounded={opponentGrounded}
        isJumping={opponentVelocityY > 0 && !opponentGrounded}
        emotionIntensity={0.5}
        accentColor={fighter.accentColor}
        isInvulnerable={opponentInvulnerable}
        hitAnim={opponentInvulnerable ? 1 : 0}
      />
    </group>
  );
}
