import { useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { CombatState } from "../../../game/combat/stateEnums";
import GLBCharacterModel from "../models/GLBCharacterModel";
import * as THREE from "three";

interface Props {
  fighterId: string;
  accentColor: string;
}

/**
 * AdventureCharacter serves as the bridge between the Game State (useAdventure)
 * and the 3D Model (GLBCharacterModel).
 */
export default function AdventureCharacter({ fighterId, accentColor }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const { player } = useAdventure();
  
  // Track vertical offset for grounding (some models have pivot at center instead of feet)
  const yOffset = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    
    // Sync position and rotation from store
    groupRef.current.position.set(player.posX, player.posY + yOffset.current, player.posZ);
    groupRef.current.rotation.y = player.rotY;
  });

  // Map CombatState to high-level animation props
  const isJumping = player.posY > 0.1;
  const isGrounded = !isJumping;
  
  // Determine attack type from state
  const attackType = player.attackType ? 
    (player.attackType.includes("kick") ? "kick" : "punch") as "punch" | "kick" 
    : null;

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <GLBCharacterModel
          fighterId={fighterId}
          accentColor={accentColor}
          isMoving={player.isMoving}
          isRunning={player.isRunning}
          isAttacking={player.isAttacking}
          attackType={attackType}
          isGrounded={isGrounded}
          isJumping={isJumping}
          isInvulnerable={player.invulnTimer > 0}
          velocityX={player.velocityX}
          velocityY={player.velocityY}
          hitAnim={player.hitStunTimer > 0 ? 1 : 0}
        />
      </Suspense>
      
      {/* Dynamic shadow/blob beneath character */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -player.posY + 0.02, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={Math.max(0, 0.4 - player.posY * 0.2)} 
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
