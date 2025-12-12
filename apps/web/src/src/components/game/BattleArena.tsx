import { useMemo } from "react";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { getArenaById } from "../../lib/arenas";

export default function BattleArena() {
  const { selectedArenaId } = useBattle();
  const arena = getArenaById(selectedArenaId);
  
  // Pre-calculate platform positions
  const platforms = useMemo(() => [
    { x: -6, y: 2, z: 0, width: 3, height: 0.3, depth: 3 },
    { x: 6, y: 2, z: 0, width: 3, height: 0.3, depth: 3 },
    { x: 0, y: 4, z: 0, width: 4, height: 0.3, depth: 3 }
  ], []);
  
  if (!arena) return null;
  
  return (
    <group>
      {/* Sky/Background */}
      <color attach="background" args={[arena.skyColor]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={0.8} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 10, 5]} intensity={0.3} color={arena.accentColor} />
      
      {/* Main Ground Platform */}
      <mesh 
        position={[0, 0, 0]} 
        receiveShadow
        castShadow
      >
        <boxGeometry args={[25, 0.5, 10]} />
        <meshStandardMaterial 
          color={arena.groundColor}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Side walls (invisible boundaries) */}
      <mesh position={[-12.5, 2, 0]} visible={false}>
        <boxGeometry args={[0.5, 4, 10]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh position={[12.5, 2, 0]} visible={false}>
        <boxGeometry args={[0.5, 4, 10]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Floating Platforms */}
      {platforms.map((platform, index) => (
        <mesh 
          key={index}
          position={[platform.x, platform.y, platform.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[platform.width, platform.height, platform.depth]} />
          <meshStandardMaterial 
            color={arena.platformColor}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      ))}
      
      {/* Decorative elements based on arena */}
      {arena.id === 'mushroom-plains' && (
        <>
          {/* Mushrooms */}
          {[-8, -4, 4, 8].map(x => (
            <group key={x} position={[x, 0.5, -3]}>
              <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
                <meshStandardMaterial color="#F5DEB3" />
              </mesh>
              <mesh position={[0, 0.8, 0]} castShadow>
                <sphereGeometry args={[0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={arena.accentColor} />
              </mesh>
            </group>
          ))}
        </>
      )}
      
      {arena.id === 'green-valley' && (
        <>
          {/* Rings */}
          {[-6, 0, 6].map(x => (
            <mesh key={x} position={[x, 3, -4]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.5, 0.1, 16, 32]} />
              <meshStandardMaterial 
                color={arena.accentColor}
                emissive={arena.accentColor}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </>
      )}
      
      {/* Arena boundary markers */}
      <mesh position={[0, 0.01, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 1]} />
        <meshBasicMaterial 
          color="#FFFFFF"
          transparent
          opacity={0.3}
        />
      </mesh>
      <mesh position={[0, 0.01, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 1]} />
        <meshBasicMaterial 
          color="#FFFFFF"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
