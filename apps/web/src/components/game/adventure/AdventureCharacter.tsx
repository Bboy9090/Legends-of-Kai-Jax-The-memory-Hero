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
 * without covering the model (unlike the old full-body placeholder shell).
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
      {/* Fill light so the real character model reads in dim mission arenas */}
      <pointLight position={[0, 2.2, 1.2]} intensity={1.4} distance={7} color="#ffffff" />
      {/* Ground ring at the feet */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.55, 0.72, 40]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Floating downward pointer above the head */}
      <mesh ref={arrowRef} position={[0, 2.7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.16, 0.34, 4]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </group>
  );
}

function PlayerVisibilityShell({ accentColor }: { accentColor: string }) {
  return (
    <group name="phase1a-player-visibility-shell" renderOrder={9999}>
      {/* Always-facing gameplay silhouette. It does not depend on lighting, GLB material, or depth. */}
      <Billboard position={[0, 1.25, 0]} follow lockX={false} lockY={false} lockZ={false}>
        <mesh renderOrder={9999}>
          <planeGeometry args={[1.15, 2.65]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={0.38}
            depthTest={false}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.95, 0.01]} renderOrder={10000}>
          <circleGeometry args={[0.32, 24]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.68}
            depthTest={false}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>

      <mesh position={[0, 1.1, 0]} renderOrder={10001}>
        <capsuleGeometry args={[0.34, 1.05, 8, 16]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.58}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 1.95, 0]} renderOrder={10002}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.82}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 1.22, -0.5]} rotation={[Math.PI / 2, 0, 0]} renderOrder={10003}>
        <coneGeometry args={[0.2, 0.5, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.92} depthTest={false} depthWrite={false} />
      </mesh>

      <Html position={[0, 2.85, 0]} center zIndexRange={[10000, 0]}>
        <div style={{
          background: "rgba(0, 242, 255, 0.92)",
          color: "#020617",
          padding: "4px 8px",
          borderRadius: "999px",
          border: "2px solid white",
          fontFamily: "monospace",
          fontSize: "11px",
          fontWeight: 900,
          letterSpacing: "0.08em",
          textShadow: "none",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          boxShadow: "0 0 18px rgba(0, 242, 255, 0.8)",
        }}>
          PLAYER
        </div>
      </Html>
    </group>
  );
}

function PlayerPresenceMarker({ accentColor }: { accentColor: string }) {
  return (
    <group name="phase1a-player-presence-marker">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} renderOrder={9998}>
        <ringGeometry args={[0.74, 0.9, 48]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.95} depthTest={false} depthWrite={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} renderOrder={9997}>
        <circleGeometry args={[0.22, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} depthTest={false} depthWrite={false} />
      </mesh>

      <pointLight position={[0, 1.8, 0.5]} color={accentColor} intensity={1.2} distance={6} decay={2} />
    </group>
  );
}

/**
 * AdventureCharacter serves as the bridge between the Game State (useAdventure)
 * and the 3D Model (GLBCharacterModel).
 */
export default function AdventureCharacter({ fighterId, accentColor }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const fighter = getFighterById(fighterId);

  // Subscribe to specific primitive player state properties so React updates props when combat states change
  const isAttacking = useAdventure((s) => s.player.isAttacking);
  const isMoving = useAdventure((s) => s.player.isMoving);
  const isRunning = useAdventure((s) => s.player.isRunning);
  const hitStunTimer = useAdventure((s) => s.player.hitStunTimer);
  const invulnTimer = useAdventure((s) => s.player.invulnTimer);
  const posY = useAdventure((s) => s.player.posY);

  // Track vertical offset for grounding (some models have pivot at center instead of feet)
  const yOffset = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    const { player: latestPlayer } = useAdventure.getState();

    // Sync position and rotation directly from store on every render frame
    groupRef.current.position.set(latestPlayer.posX, latestPlayer.posY + yOffset.current, latestPlayer.posZ);
    groupRef.current.rotation.y = latestPlayer.rotY;
    groupRef.current.visible = true;

    // DIAGNOSTIC: check mesh visibility on first frame
    if (!groupRef.current.userData.visibilityLogged) {
      const meshCount = groupRef.current.children.length;
      console.log('[AdventureCharacter] Frame update - meshes:', meshCount, 'visible:', groupRef.current.visible);
      groupRef.current.userData.visibilityLogged = true;
    }
  });

  return (
    <group ref={groupRef} name="adventure-player-root">
      {/* Clean player locator: a ground ring + floating pointer so you can
          always find your character in missions. Unlike the old full-body
          shell, these sit at the feet / overhead and never obscure the model
          that renders below. */}
      <PlayerLocator accentColor={accentColor} />

      {/* Use the battle renderer (OptimizedBeastModel) for the player — it
          renders reliably on-device, unlike GLBCharacterModel which came up
          invisible in the adventure scene (only the locator ring showed). */}
      <Suspense fallback={null}>
        <OptimizedBeastModel
          beast={getFighterById(fighterId) ?? { id: fighterId, color: "#1a1a1a", accentColor }}
          isAttacking={isAttacking}
          isMoving={isMoving || isRunning}
          isInvulnerable={invulnTimer > 0}
          hitAnim={hitStunTimer > 0 ? 1 : 0}
        />
      </Suspense>
      
      {/* Dynamic shadow/blob beneath character */}
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
