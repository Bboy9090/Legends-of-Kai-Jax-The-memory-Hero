import { useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useAdventure } from "../../../lib/stores/useAdventure";
import GLBCharacterModel from "../models/GLBCharacterModel";
import * as THREE from "three";

interface Props {
  fighterId: string;
  accentColor: string;
}

function PlayerVisibilityShell({ accentColor }: { accentColor: string }) {
  const material = (
    <meshBasicMaterial
      color={accentColor}
      transparent
      opacity={0.42}
      depthTest={false}
      depthWrite={false}
    />
  );

  return (
    <group name="phase1a-player-visibility-shell" renderOrder={999}>
      <mesh position={[0, 1.1, 0]} renderOrder={999}>
        <capsuleGeometry args={[0.34, 1.05, 8, 16]} />
        {material}
      </mesh>

      <mesh position={[0, 1.95, 0]} renderOrder={999}>
        <sphereGeometry args={[0.28, 16, 16]} />
        {material}
      </mesh>

      <mesh position={[-0.42, 1.18, 0]} rotation={[0, 0, -0.28]} renderOrder={999}>
        <capsuleGeometry args={[0.1, 0.62, 6, 10]} />
        {material}
      </mesh>

      <mesh position={[0.42, 1.18, 0]} rotation={[0, 0, 0.28]} renderOrder={999}>
        <capsuleGeometry args={[0.1, 0.62, 6, 10]} />
        {material}
      </mesh>

      <mesh position={[-0.18, 0.38, 0]} rotation={[0, 0, 0.08]} renderOrder={999}>
        <capsuleGeometry args={[0.11, 0.68, 6, 10]} />
        {material}
      </mesh>

      <mesh position={[0.18, 0.38, 0]} rotation={[0, 0, -0.08]} renderOrder={999}>
        <capsuleGeometry args={[0.11, 0.68, 6, 10]} />
        {material}
      </mesh>

      <mesh position={[0, 1.22, -0.5]} rotation={[Math.PI / 2, 0, 0]} renderOrder={999}>
        <coneGeometry args={[0.18, 0.45, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.78} depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function PlayerPresenceMarker({ accentColor }: { accentColor: string }) {
  return (
    <group name="phase1a-player-presence-marker">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} renderOrder={998}>
        <ringGeometry args={[0.74, 0.9, 48]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.85} depthTest={false} depthWrite={false} />
      </mesh>

      <pointLight position={[0, 1.8, 0.5]} color={accentColor} intensity={0.65} distance={4} decay={2} />
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
      {/* Phase 1A.2: guaranteed gameplay silhouette while GLB materials are being tuned. */}
      <PlayerVisibilityShell accentColor={accentColor} />
      <PlayerPresenceMarker accentColor={accentColor} />

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
