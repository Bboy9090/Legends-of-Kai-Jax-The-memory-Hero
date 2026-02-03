/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import AnatomicalBeastModel from "./models/AnatomicalBeastModel";
import type { Group } from "three";

export default function BattlePlayer() {
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);

  const {
    playerFighterId,
    playerX,
    playerY,
    playerFacingRight,
    playerAttacking,
    playerInvulnerable,
  } = useBattle();

  const fighter = getFighterById(playerFighterId);

  if (!fighter) return null;

  return (
    <group
      position={[playerX, playerY, 0]}
      scale={[playerFacingRight ? 1 : -1, 1, 1]}
    >
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
        animTime={0}
        isAttacking={playerAttacking}
        isInvulnerable={playerInvulnerable}
      />
    </group>
  );
}
