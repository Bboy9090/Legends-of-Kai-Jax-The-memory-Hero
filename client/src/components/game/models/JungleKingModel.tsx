import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface JungleKingModelProps {
  bodyRef: React.RefObject<Group>;
  headRef: React.RefObject<Group>;
  leftArmRef: React.RefObject<Group>;
  rightArmRef: React.RefObject<Group>;
  leftLegRef: React.RefObject<Group>;
  rightLegRef: React.RefObject<Group>;
  emotionIntensity: number;
  hitAnim: number;
  animTime: number;
  isAttacking: boolean;
  isInvulnerable: boolean;
}

export default function JungleKingModel({
  bodyRef,
  headRef,
  leftArmRef,
  rightArmRef,
  leftLegRef,
  rightLegRef,
  emotionIntensity,
  hitAnim,
  animTime,
  isAttacking,
  isInvulnerable
}: JungleKingModelProps) {
  
  const furColor = "#8B4513";
  const faceColor = "#DEB887";
  const chestColor = "#D2691E";
  const tieColor = "#DC143C";
  
  return (
    <group ref={bodyRef} position={[0, 0.5, 0]}>
      <group ref={headRef} position={[0, 0.55, 0.1]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.48, 32, 24]} />
          <meshToonMaterial 
            color={furColor}
            emissive={furColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        <mesh position={[0, -0.08, 0.32]} castShadow>
          <sphereGeometry args={[0.30, 32, 24]} />
          <meshToonMaterial color={faceColor} />
        </mesh>
        
        <mesh position={[0, -0.25, 0.45]} castShadow>
          <sphereGeometry args={[0.18, 32, 24]} />
          <meshToonMaterial color={faceColor} />
        </mesh>
        
        <mesh position={[0, -0.32, 0.52]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 0.08, 16]} />
          <meshToonMaterial color={faceColor} />
        </mesh>
        
        {[-0.06, 0.06].map((xOffset, i) => (
          <mesh 
            key={`nostril-${i}`}
            position={[xOffset, -0.30, 0.58]} 
            castShadow
          >
            <sphereGeometry args={[0.03, 12, 10]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
        ))}
        
        <mesh position={[-0.15, 0.08, 0.38]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FF0000" : "#FFFFFF"} />
        </mesh>
        <mesh position={[0.15, 0.08, 0.38]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FF0000" : "#FFFFFF"} />
        </mesh>
        
        <mesh position={[-0.15, 0.08, 0.42]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.15, 0.08, 0.42]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        
        <mesh position={[-0.08, 0.25, 0.08]} rotation={[0, -0.3, -0.3]} castShadow>
          <boxGeometry args={[0.20, 0.30, 0.06]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0.08, 0.25, 0.08]} rotation={[0, 0.3, 0.3]} castShadow>
          <boxGeometry args={[0.20, 0.30, 0.06]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        
        <mesh position={[-0.35, 0.15, 0.15]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial color={faceColor} />
        </mesh>
        <mesh position={[0.35, 0.15, 0.15]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial color={faceColor} />
        </mesh>
        
        <mesh position={[-0.35, 0.15, 0.18]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0.35, 0.15, 0.18]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshToonMaterial color={furColor} />
        </mesh>
      </group>
      
      <mesh position={[0, -0.1, 0]} castShadow>
        <capsuleGeometry args={[0.50, 0.55, 16, 32]} />
        <meshToonMaterial 
          color={furColor}
          emissive={furColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, -0.05, 0.25]} castShadow>
        <sphereGeometry args={[0.40, 32, 24]} />
        <meshToonMaterial color={chestColor} />
      </mesh>
      
      <mesh position={[0, 0.25, 0.35]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.25, 0.35, 0.08]} />
        <meshToonMaterial 
          color={tieColor}
          emissive={tieColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[0, 0.38, 0.38]} castShadow>
        <cylinderGeometry args={[0.08, 0.10, 0.06, 8]} />
        <meshToonMaterial color={tieColor} />
      </mesh>
      
      <mesh position={[0, 0.30, 0.40]} castShadow>
        <boxGeometry args={[0.18, 0.10, 0.05]} />
        <meshToonMaterial color="#FFD700" />
      </mesh>
      
      <group ref={leftArmRef} position={[-0.60, 0.15, 0]}>
        <mesh position={[0, -0.20, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.45, 16, 16]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.35, 16, 16]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.82, 0.05]} castShadow>
          <boxGeometry args={[0.25, 0.15, 0.20]} />
          <meshToonMaterial color={faceColor} />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.60, 0.15, 0]}>
        <mesh position={[0, -0.20, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.45, 16, 16]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.35, 16, 16]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.82, 0.05]} castShadow>
          <boxGeometry args={[0.25, 0.15, 0.20]} />
          <meshToonMaterial color={faceColor} />
        </mesh>
      </group>
      
      <group ref={leftLegRef} position={[-0.28, -0.55, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.30, 16, 16]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.38, 0.08]} castShadow>
          <boxGeometry args={[0.28, 0.12, 0.35]} />
          <meshToonMaterial color={faceColor} />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.28, -0.55, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.30, 16, 16]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.38, 0.08]} castShadow>
          <boxGeometry args={[0.28, 0.12, 0.35]} />
          <meshToonMaterial color={faceColor} />
        </mesh>
      </group>
      
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.8}>
          <sphereGeometry args={[1.0, 16, 12]} />
          <meshBasicMaterial 
            color="#FFD700"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {isAttacking && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <mesh 
              key={`pound-wave-${i}`}
              position={[0, -0.8, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={1 + i * 0.3}
            >
              <ringGeometry args={[0.3, 0.4, 16]} />
              <meshBasicMaterial 
                color="#FFD700"
                transparent
                opacity={0.6 - i * 0.15}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
