import { useBattle } from "../../lib/stores/useBattle";
import { useTrainingLab } from "../../lib/stores/useTrainingLab";
import { ATTACK_TYPE_TO_MOVE, MOVES, isInActiveWindow } from "../../lib/combatSystems";
import { getMoveKeyForPlayerAttack } from "../../game/combat/AttackResolver";
import { getBattleAttackRange } from "../../game/combat/battleRange";

/* eslint-disable react/no-unknown-property */
export default function CombatDebugVolumes() {
  const show = useTrainingLab((s) => s.enabled && s.showCollisionVolumes);
  const battle = useBattle();
  if (!show) return null;

  const playerMoveKey = battle.playerAttackType
    ? getMoveKeyForPlayerAttack(battle.playerAttackType, battle.playerComboStep)
    : null;
  const playerMove = playerMoveKey ? MOVES[playerMoveKey] : null;
  const playerActive = !!playerMove && isInActiveWindow(playerMove, battle.playerAttackElapsed);

  const opponentMoveKey = battle.opponentAttackType ? ATTACK_TYPE_TO_MOVE[battle.opponentAttackType] : null;
  const opponentMove = opponentMoveKey ? MOVES[opponentMoveKey] : null;
  const opponentActive = !!opponentMove && isInActiveWindow(opponentMove, battle.opponentAttackElapsed);

  const playerRange = battle.playerAttackType
    ? getBattleAttackRange(battle.playerFighterId, battle.playerAttackType, { transformed: battle.playerTransformed })
    : 0;
  const opponentRange = battle.opponentAttackType
    ? getBattleAttackRange(battle.opponentFighterId, battle.opponentAttackType)
    : 0;

  const playerDir = battle.playerFacingRight ? 1 : -1;
  const opponentDir = battle.opponentFacingRight ? 1 : -1;

  return (
    <group name="training-combat-volumes">
      <DebugBox position={[battle.playerX, battle.playerY + 0.9, 0]} size={[1.05, 1.9, 1.05]} color="#22d3ee" opacity={0.18} />
      <DebugBox position={[battle.opponentX, battle.opponentY + 0.9, 0]} size={[1.05, 1.9, 1.05]} color="#a78bfa" opacity={0.18} />

      {playerActive && playerRange > 0 && (
        <DebugBox
          position={[battle.playerX + playerDir * playerRange * 0.5, battle.playerY + 0.9, 0]}
          size={[playerRange, 1.35, 1.15]}
          color="#f43f5e"
          opacity={0.22}
        />
      )}
      {opponentActive && opponentRange > 0 && (
        <DebugBox
          position={[battle.opponentX + opponentDir * opponentRange * 0.5, battle.opponentY + 0.9, 0]}
          size={[opponentRange, 1.35, 1.15]}
          color="#fb923c"
          opacity={0.22}
        />
      )}
    </group>
  );
}

function DebugBox({
  position,
  size,
  color,
  opacity,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  opacity: number;
}) {
  return (
    <mesh position={position} renderOrder={999}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} wireframe />
    </mesh>
  );
}
