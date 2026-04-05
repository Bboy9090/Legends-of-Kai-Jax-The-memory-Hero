import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface TwinTailsModelProps {
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

export default function TwinTailsModel({
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
}: TwinTailsModelProps) {
  
  const furColor = "#FF9500";
  const bellyColor = "#FFFACD";
  const tailColor = "#FFB347";
  const shoesColor = "#DC143C";
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      <group ref={headRef} position={[0, 0.55, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.45, 32, 24]} />
          <meshToonMaterial 
            color={furColor}
            emissive={furColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        <mesh position={[0, -0.08, 0.30]} castShadow>
          <sphereGeometry args={[0.28, 32, 24]} />
          <meshToonMaterial color={bellyColor} />
        </mesh>
        
        <mesh position={[0, -0.20, 0.42]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial color={bellyColor} />
        </mesh>
        
        {[-0.06, 0.06].map((xOffset, i) => (
          <mesh 
            key={`nostril-${i}`}
            position={[xOffset, -0.18, 0.52]} 
            castShadow
          >
            <sphereGeometry args={[0.025, 12, 10]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
        ))}
        
        {[-0.30, 0.30].map((xOffset, i) => (
          <group 
            key={`ear-${i}`}
            position={[xOffset, 0.30, 0]} 
            rotation={[0, i === 0 ? -0.3 : 0.3, i === 0 ? -0.3 : 0.3]}
          >
            <mesh castShadow>
              <coneGeometry args={[0.12, 0.28, 8]} />
              <meshToonMaterial color={furColor} />
            </mesh>
            <mesh position={[0, -0.05, 0.05]} castShadow>
              <coneGeometry args={[0.06, 0.15, 8]} />
              <meshToonMaterial color={bellyColor} />
            </mesh>
          </group>
        ))}
        
        <mesh position={[0, 0.08, -0.32]} castShadow>
          <sphereGeometry args={[0.25, 16, 12]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        {[-0.15, 0.15].map((xOffset, i) => (
          <mesh 
            key={`hair-spike-${i}`}
            position={[xOffset, 0.20, -0.28]} 
            rotation={[0.5, 0, i === 0 ? 0.3 : -0.3]}
            castShadow
          >
            <coneGeometry args={[0.08, 0.20, 8]} />
            <meshToonMaterial color={furColor} />
          </mesh>
        ))}
        <mesh position={[0, 0.28, -0.22]} rotation={[0.6, 0, 0]} castShadow>
          <coneGeometry args={[0.10, 0.25, 8]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        
        <mesh position={[-0.12, 0.05, 0.38]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : "#87CEEB"} />
        </mesh>
        <mesh position={[0.12, 0.05, 0.38]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : "#87CEEB"} />
        </mesh>
        
        <mesh position={[-0.12, 0.05, 0.42]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.12, 0.05, 0.42]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        <mesh position={[-0.10, 0.08, 0.44]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.14, 0.08, 0.44]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      <mesh position={[0, -0.05, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.35, 16, 24]} />
        <meshToonMaterial 
          color={furColor}
          emissive={furColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, -0.05, 0.15]} castShadow>
        <sphereGeometry args={[0.25, 32, 24]} />
        <meshToonMaterial color={bellyColor} />
      </mesh>
      
      {[-0.15, 0.15].map((xOffset, i) => (
        <group 
          key={`tail-${i}`}
          position={[xOffset * 0.8, -0.25, -0.35]}
          rotation={[0.5 + Math.sin(animTime * 8 + i * Math.PI) * 0.3, 0, xOffset * 0.5]}
        >
          <mesh castShadow>
            <capsuleGeometry args={[0.10, 0.50, 12, 16]} />
            <meshToonMaterial 
              color={tailColor}
              emissive={tailColor}
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0, -0.35, 0]} castShadow>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshToonMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}
      
      <group ref={leftArmRef} position={[-0.32, 0.05, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.22, 12, 16]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.28, 0]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshToonMaterial color={bellyColor} />
        </mesh>
        <mesh position={[0, -0.30, 0]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.32, 0.05, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.22, 12, 16]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.28, 0]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshToonMaterial color={bellyColor} />
        </mesh>
        <mesh position={[0, -0.30, 0]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      <group ref={leftLegRef} position={[-0.15, -0.38, 0]}>
        <mesh position={[0, -0.10, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.18, 12, 16]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.28, 0.05]} castShadow>
          <boxGeometry args={[0.16, 0.10, 0.22]} />
          <meshToonMaterial 
            color={shoesColor}
            emissive={shoesColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, -0.30, 0.02]} castShadow>
          <boxGeometry args={[0.18, 0.06, 0.24]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.15, -0.38, 0]}>
        <mesh position={[0, -0.10, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.18, 12, 16]} />
          <meshToonMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.28, 0.05]} castShadow>
          <boxGeometry args={[0.16, 0.10, 0.22]} />
          <meshToonMaterial 
            color={shoesColor}
            emissive={shoesColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, -0.30, 0.02]} castShadow>
          <boxGeometry args={[0.18, 0.06, 0.24]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.5}>
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
        <mesh position={[0, -0.5, -0.5]} rotation={[-Math.PI / 4, 0, animTime * 15]}>
          <torusGeometry args={[0.4, 0.08, 8, 16]} />
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
