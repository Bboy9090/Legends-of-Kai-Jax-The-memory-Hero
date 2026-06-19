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

function PlayerPhase1Fallback({ accentColor }: { accentColor: string }) {
  return (
    <group name="phase1a-player-visible-fallback">
      <mesh position={[0, 1.05, 0]} castShadow>
        <capsuleGeometry args={[0.42, 1.15, 8, 16]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.45}
          transparent
          opacity={0.65}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      <mesh position={[0, 1.95, 0]} castShadow>
        <sphereGeometry args={[0.34, 20, 20]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={accentColor}
          emissiveIntensity={0.25}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh position={[0, 1.28, -0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.22, 0.55, 16]} />
        <meshStandardMaterial color="#ffffff" emissive={accentColor} emissiveIntensity={0.8} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.72, 0.86, 48]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.85} depthWrite={false} />
      </mesh>

      <pointLight position={[0, 2.2, 0.5]} color={accentColor} intensity={1.3} distance={5} decay={2} />
    </group>
  );
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
  const verticalVelocity = (player as typeof player & { velocityY?: number }).velocityY ?? 0;
  
  // Determine attack type from state
  const attackType = player.attackType ? 
    (player.attackType.includes("kick") ? "kick" : "punch") as "punch" | "kick" 
    : null;

  return (
    <group ref={groupRef}>
      {/* Phase 1A: keep a guaranteed visible player marker even when GLB loading/config fails. */}
      <PlayerPhase1Fallback accentColor={accentColor} />

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
          velocityY={verticalVelocity}
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
