import { useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useAdventure } from "../../../lib/stores/useAdventure";
import OptimizedBeastModel from "../models/OptimizedBeastModel";
import { getFighterById } from "../../../lib/characters";
import * as THREE from "three";

interface Props {
  fighterId: string;
  accentColor: string;
}

/**
 * Non-obscuring player locator: a pulsing ring on the ground plus a small
 * floating pointer above the character. Lets you find your fighter in missions
 * without covering the model.
 */
function PlayerLocator({ accentColor }: { accentColor: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const arrowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 3) * 0.08;
      ringRef.current.scale.set(s, s, s);
    }
    if (arrowRef.current) {
      arrowRef.current.position.y = 2.7 + Math.sin(t * 2.5) * 0.12;
    }
  });

  return (
    <group name="player-locator">
      <pointLight position={[0, 2.2, 1.2]} intensity={1.4} distance={7} color="#ffffff" />
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.55, 0.72, 40]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={arrowRef} position={[0, 2.7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.16, 0.34, 4]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </group>
  );
}

/**
 * AdventureCharacter bridges useAdventure state into the battle-proven model
 * renderer while keeping the player visually locatable in Mission mode.
 */
export default function AdventureCharacter({ fighterId, accentColor }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const isAttacking = useAdventure((s) => s.player.isAttacking);
  const isMoving = useAdventure((s) => s.player.isMoving);
  const isRunning = useAdventure((s) => s.player.isRunning);
  const hitStunTimer = useAdventure((s) => s.player.hitStunTimer);
  const invulnTimer = useAdventure((s) => s.player.invulnTimer);
  const posY = useAdventure((s) => s.player.posY);

  const yOffset = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    const { player: latestPlayer } = useAdventure.getState();

    groupRef.current.position.set(latestPlayer.posX, latestPlayer.posY + yOffset.current, latestPlayer.posZ);
    groupRef.current.rotation.y = latestPlayer.rotY;
    groupRef.current.visible = true;

    if (!groupRef.current.userData.visibilityLogged) {
      console.log(
        "[AdventureCharacter] Frame update - meshes:",
        groupRef.current.children.length,
        "visible:",
        groupRef.current.visible,
      );
      groupRef.current.userData.visibilityLogged = true;
    }
  });

  return (
    <group ref={groupRef} name="adventure-player-root">
      <PlayerLocator accentColor={accentColor} />

      <Suspense fallback={null}>
        <OptimizedBeastModel
          beast={getFighterById(fighterId) ?? { id: fighterId, color: "#1a1a1a", accentColor }}
          isAttacking={isAttacking}
          isMoving={isMoving || isRunning}
          isInvulnerable={invulnTimer > 0}
          hitAnim={hitStunTimer > 0 ? 1 : 0}
        />
      </Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -posY + 0.02, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={Math.max(0, 0.4 - posY * 0.2)}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
