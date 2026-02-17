/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import AnatomicalBeastModel from "./models/AnatomicalBeastModel";
import GLBCharacterModel, { CHARACTER_MODELS } from "./models/GLBCharacterModel";
import type { Group } from "three";

export default function Opponent() {
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const timeRef = useRef(0);

  const {
    opponentFighterId,
    opponentX,
    opponentY,
    opponentFacingRight,
    opponentAttacking,
    opponentAttackType,
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

  const hasGLB = !!CHARACTER_MODELS[opponentFighterId];

  return (
    <group
      position={[opponentX, opponentY, 0]}
      scale={[opponentFacingRight ? 1 : -1, 1, 1]}
    >
      {hasGLB ? (
        <GLBCharacterModel
          fighterId={opponentFighterId}
          animTime={timeRef.current}
          isAttacking={opponentAttacking}
          isMoving={Math.abs(opponentVelocityX) > 0.5}
          attackType={opponentAttackType}
          velocityX={opponentVelocityX}
          velocityY={opponentVelocityY}
          isGrounded={opponentGrounded}
          isJumping={opponentVelocityY > 0 && !opponentGrounded}
          emotionIntensity={0.5}
          accentColor={fighter.accentColor}
          isInvulnerable={opponentInvulnerable}
          hitAnim={opponentInvulnerable ? 1 : 0}
        />
      ) : (
        <AnatomicalBeastModel
          fighter={fighter}
          bodyRef={bodyRef}
          headRef={headRef}
          leftArmRef={leftArmRef}
          rightArmRef={rightArmRef}
          leftLegRef={leftLegRef}
          rightLegRef={rightLegRef}
          emotionIntensity={0.5}
          hitAnim={opponentInvulnerable ? 1 : 0}
          animTime={timeRef.current}
          isAttacking={opponentAttacking}
          isInvulnerable={opponentInvulnerable}
          isMoving={Math.abs(opponentVelocityX) > 0.5}
          attackType={opponentAttackType}
          velocityX={opponentVelocityX}
          velocityY={opponentVelocityY}
          isGrounded={opponentGrounded}
          isJumping={opponentVelocityY > 0 && !opponentGrounded}
        />
      )}
    </group>
  );
}
