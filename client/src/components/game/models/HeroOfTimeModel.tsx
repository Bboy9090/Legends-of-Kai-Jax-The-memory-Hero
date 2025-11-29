import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface HeroOfTimeModelProps {
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

export default function HeroOfTimeModel({
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
}: HeroOfTimeModelProps) {
  
  const primaryColor = "#228B22";
  const tunicColor = "#2E8B2E";
  const hairColor = "#F4D03F";
  const skinColor = "#FDBCB4";
  const beltColor = "#8B4513";
  const shieldColor = "#4169E1";
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      <group ref={headRef} position={[0, 0.65, 0]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <coneGeometry args={[0.4, 0.5, 4]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        <mesh position={[0, 0.05, 0.02]} rotation={[0.1, 0, 0]} castShadow>
          <coneGeometry args={[0.35, 0.35, 4]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        
        <mesh position={[0, -0.1, 0.1]} castShadow>
          <sphereGeometry args={[0.32, 32, 24]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        <mesh position={[0, -0.05, -0.15]} castShadow>
          <sphereGeometry args={[0.35, 32, 24]} />
          <meshToonMaterial color={hairColor} />
        </mesh>
        {[-0.28, 0.28].map((xOffset, i) => (
          <mesh 
            key={`hair-side-${i}`}
            position={[xOffset, -0.05, -0.08]} 
            rotation={[0, i === 0 ? -0.3 : 0.3, 0]}
            castShadow
          >
            <sphereGeometry args={[0.15, 16, 12]} />
            <meshToonMaterial color={hairColor} />
          </mesh>
        ))}
        
        {[-0.35, 0.35].map((xOffset, i) => (
          <mesh 
            key={`ear-${i}`}
            position={[xOffset, -0.05, 0.02]} 
            rotation={[0.2, i === 0 ? -0.8 : 0.8, 0]}
            castShadow
          >
            <coneGeometry args={[0.06, 0.22, 8]} />
            <meshToonMaterial color={skinColor} />
          </mesh>
        ))}
        
        <mesh position={[-0.10, 0.0, 0.30]} castShadow>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#00FF00" : "#4169E1"} />
        </mesh>
        <mesh position={[0.10, 0.0, 0.30]} castShadow>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#00FF00" : "#4169E1"} />
        </mesh>
        
        <mesh position={[-0.10, 0.0, 0.33]} castShadow>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.10, 0.0, 0.33]} castShadow>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        <mesh position={[0, -0.18, 0.25]} castShadow>
          <boxGeometry args={[0.08, 0.02, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>
      
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.55, 0.75, 0.40]} />
        <meshToonMaterial 
          color={tunicColor}
          emissive={tunicColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, -0.32, 0]} castShadow>
        <boxGeometry args={[0.60, 0.10, 0.45]} />
        <meshToonMaterial color={beltColor} />
      </mesh>
      
      <mesh position={[0.15, -0.32, 0.22]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.06]} />
        <meshToonMaterial color="#FFD700" />
      </mesh>
      
      <group ref={leftArmRef} position={[-0.38, 0.15, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.35, 12, 16]} />
          <meshToonMaterial color={tunicColor} />
        </mesh>
        <mesh position={[0, -0.38, 0]} castShadow>
          <sphereGeometry args={[0.08, 12, 10]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        {isAttacking && (
          <mesh position={[0, -0.50, 0.15]} rotation={[0, 0, -0.3]} castShadow>
            <boxGeometry args={[0.08, 0.7, 0.03]} />
            <meshToonMaterial 
              color="#C0C0C0"
              emissive="#FFFFFF"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
        
        {isAttacking && (
          <mesh position={[0, -0.88, 0.15]} castShadow>
            <boxGeometry args={[0.15, 0.08, 0.03]} />
            <meshToonMaterial color="#FFD700" />
          </mesh>
        )}
      </group>
      
      <group ref={rightArmRef} position={[0.38, 0.15, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.35, 12, 16]} />
          <meshToonMaterial color={tunicColor} />
        </mesh>
        <mesh position={[0, -0.38, 0]} castShadow>
          <sphereGeometry args={[0.08, 12, 10]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        <mesh position={[0.05, -0.25, 0.12]} rotation={[0, 0, 0.1]} castShadow>
          <boxGeometry args={[0.35, 0.45, 0.06]} />
          <meshToonMaterial 
            color={shieldColor}
            emissive={shieldColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        <mesh position={[0.05, -0.25, 0.16]} castShadow>
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshToonMaterial color="#DC143C" />
        </mesh>
        
        <mesh position={[0.05, -0.15, 0.16]} castShadow>
          <boxGeometry args={[0.08, 0.06, 0.02]} />
          <meshToonMaterial color="#FFD700" />
        </mesh>
      </group>
      
      <group ref={leftLegRef} position={[-0.18, -0.45, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.35, 12, 16]} />
          <meshToonMaterial color="#F5DEB3" />
        </mesh>
        <mesh position={[0, -0.42, 0.05]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.25]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.18, -0.45, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.35, 12, 16]} />
          <meshToonMaterial color="#F5DEB3" />
        </mesh>
        <mesh position={[0, -0.42, 0.05]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.25]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
      </group>
      
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.5}>
          <sphereGeometry args={[1.0, 16, 12]} />
          <meshBasicMaterial 
            color="#00FF00"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {emotionIntensity > 0.5 && (
        <mesh 
          position={[0, 0.95, -0.1]} 
          rotation={[0, animTime * 3, 0]}
          scale={0.15 + emotionIntensity * 0.1}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshToonMaterial 
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
