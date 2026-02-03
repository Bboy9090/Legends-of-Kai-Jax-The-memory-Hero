/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import AnatomicalBeastModel from "./models/AnatomicalBeastModel";
import type { Group } from "three";

export default function Opponent() {
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);

  const {
    opponentFighterId,
    opponentX,
    opponentY,
    opponentFacingRight,
    opponentAttacking,
    opponentInvulnerable,
  } = useBattle();

  const fighter = getFighterById(opponentFighterId);

  if (!fighter) return null;

  return (
    <group
      position={[opponentX, opponentY, 0]}
      scale={[opponentFacingRight ? 1 : -1, 1, 1]}
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
        hitAnim={opponentInvulnerable ? 1 : 0}
        animTime={0}
        isAttacking={opponentAttacking}
        isInvulnerable={opponentInvulnerable}
      />
    </group>
  );
}
