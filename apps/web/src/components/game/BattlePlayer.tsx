/* eslint-disable react/no-unknown-property */
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useBeastPreset } from "../../lib/stores/useBeastPreset";
import { getFighterById } from "../../lib/characters";
import AnatomicalBeastModel from "./models/AnatomicalBeastModel";
import GLBCharacterModel, { CHARACTER_MODELS } from "./models/GLBCharacterModel";
import type { Group } from "three";

export default function BattlePlayer() {
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const timeRef = useRef(0);

  const {
    playerFighterId,
    playerX,
    playerY,
    playerFacingRight,
    playerAttacking,
    playerAttackType,
    playerInvulnerable,
    playerVelocityX,
    playerVelocityY,
    playerGrounded,
  } = useBattle();
  const { preset } = useBeastPreset();

  const fighter = getFighterById(playerFighterId);

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
  });

  if (!fighter) return null;

  const hasGLB = !!CHARACTER_MODELS[playerFighterId];

  return (
    <group
      position={[playerX, playerY, 0]}
      scale={[playerFacingRight ? 1 : -1, 1, 1]}
    >
      {hasGLB ? (
        <GLBCharacterModel
          fighterId={playerFighterId}
          animTime={timeRef.current}
          isAttacking={playerAttacking}
          isMoving={Math.abs(playerVelocityX) > 0.5}
          attackType={playerAttackType}
          velocityX={playerVelocityX}
          velocityY={playerVelocityY}
          isGrounded={playerGrounded}
          isJumping={playerVelocityY > 0 && !playerGrounded}
          emotionIntensity={0.5}
          accentColor={fighter.accentColor}
          isInvulnerable={playerInvulnerable}
          hitAnim={playerInvulnerable ? 1 : 0}
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
          hitAnim={playerInvulnerable ? 1 : 0}
          animTime={timeRef.current}
          isAttacking={playerAttacking}
          isInvulnerable={playerInvulnerable}
          isMoving={Math.abs(playerVelocityX) > 0.5}
          attackType={playerAttackType}
          velocityX={playerVelocityX}
          velocityY={playerVelocityY}
          isGrounded={playerGrounded}
          isJumping={playerVelocityY > 0 && !playerGrounded}
          presetOverride={preset === "auto" ? null : preset}
        />
      )}
    </group>
  );
}
