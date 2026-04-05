import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface DinoRiderModelProps {
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

export default function DinoRiderModel({
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
}: DinoRiderModelProps) {
  
  const bodyColor = "#7CCD7C";
  const bellyColor = "#FFFACD";
  const saddleColor = "#DC143C";
  const shellColor = "#32CD32";
  const bootsColor = "#FF6B00";
  
  return (
    <group ref={bodyRef} position={[0, 0.35, 0]}>
      <group ref={headRef} position={[0, 0.6, 0.2]}>
        <mesh position={[0, 0, 0.15]} castShadow>
          <sphereGeometry args={[0.42, 32, 24]} />
          <meshToonMaterial 
            color={bodyColor}
            emissive={bodyColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        <mesh position={[0, -0.05, 0.45]} castShadow>
          <sphereGeometry args={[0.28, 32, 24]} />
          <meshToonMaterial color={bodyColor} />
        </mesh>
        
        <mesh position={[0, -0.15, 0.68]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial color={bodyColor} />
        </mesh>
        
        {[-0.08, 0.08].map((xOffset, i) => (
          <mesh 
            key={`nostril-${i}`}
            position={[xOffset, -0.12, 0.78]} 
            castShadow
          >
            <sphereGeometry args={[0.04, 12, 10]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
        ))}
        
        <mesh position={[-0.18, 0.15, 0.45]} castShadow>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FF0000" : "#FFFFFF"} />
        </mesh>
        <mesh position={[0.18, 0.15, 0.45]} castShadow>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FF0000" : "#FFFFFF"} />
        </mesh>
        
        <mesh position={[-0.18, 0.15, 0.50]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.18, 0.15, 0.50]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        
        <mesh position={[-0.16, 0.18, 0.52]} castShadow>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.20, 0.18, 0.52]} castShadow>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        
        {[-0.28, 0.28].map((xOffset, i) => (
          <mesh 
            key={`cheek-${i}`}
            position={[xOffset, 0.0, 0.35]} 
            castShadow
          >
            <sphereGeometry args={[0.10, 12, 10]} />
            <meshToonMaterial 
              color="#FFB6C1"
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}
      </group>
      
      <mesh position={[0, 0.05, 0]} castShadow>
        <sphereGeometry args={[0.50, 32, 24]} />
        <meshToonMaterial 
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, -0.05, 0.25]} castShadow>
        <sphereGeometry args={[0.38, 32, 24]} />
        <meshToonMaterial color={bellyColor} />
      </mesh>
      
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.42, 0.15, 16]} />
        <meshToonMaterial 
          color={saddleColor}
          emissive={saddleColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[0, 0.35, -0.35]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.25, 0.08, 0.30]} />
        <meshToonMaterial color={saddleColor} />
      </mesh>
      
      <mesh position={[0, -0.05, -0.45]} castShadow>
        <sphereGeometry args={[0.45, 32, 24]} />
        <meshToonMaterial 
          color={shellColor}
          emissive={shellColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, 0.15, -0.45]} castShadow>
        <sphereGeometry args={[0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color="#FFFACD" />
      </mesh>
      
      <mesh position={[0, -0.30, -0.75]} rotation={[-0.5, 0, 0]} castShadow>
        <coneGeometry args={[0.12, 0.45, 8]} />
        <meshToonMaterial color={bodyColor} />
      </mesh>
      
      <group ref={leftArmRef} position={[-0.45, 0.15, 0.1]}>
        <mesh position={[0, -0.08, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 12]} />
          <meshToonMaterial color={bodyColor} />
        </mesh>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.18, 12, 16]} />
          <meshToonMaterial color={bodyColor} />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.45, 0.15, 0.1]}>
        <mesh position={[0, -0.08, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 12]} />
          <meshToonMaterial color={bodyColor} />
        </mesh>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.18, 12, 16]} />
          <meshToonMaterial color={bodyColor} />
        </mesh>
      </group>
      
      <group ref={leftLegRef} position={[-0.25, -0.35, 0.1]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshToonMaterial color={bodyColor} />
        </mesh>
        <mesh position={[0, -0.28, 0.05]} castShadow>
          <boxGeometry args={[0.22, 0.12, 0.28]} />
          <meshToonMaterial 
            color={bootsColor}
            emissive={bootsColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, -0.32, 0.02]} castShadow>
          <boxGeometry args={[0.24, 0.06, 0.32]} />
          <meshToonMaterial color={bellyColor} />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.25, -0.35, 0.1]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshToonMaterial color={bodyColor} />
        </mesh>
        <mesh position={[0, -0.28, 0.05]} castShadow>
          <boxGeometry args={[0.22, 0.12, 0.28]} />
          <meshToonMaterial 
            color={bootsColor}
            emissive={bootsColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, -0.32, 0.02]} castShadow>
          <boxGeometry args={[0.24, 0.06, 0.32]} />
          <meshToonMaterial color={bellyColor} />
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
      
      {isAttacking && (
        <mesh position={[0, 0.5, 0.8]} castShadow>
          <sphereGeometry args={[0.3, 16, 12]} />
          <meshToonMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
