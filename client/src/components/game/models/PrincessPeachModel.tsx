import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface PrincessPeachModelProps {
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

export default function PrincessPeachModel({
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
}: PrincessPeachModelProps) {
  
  const dressColor = "#FFB6C1";
  const crownColor = "#FFD700";
  const hairColor = "#F4D03F";
  const skinColor = "#FFEFD5";
  const gemColor = "#4169E1";
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      <group ref={headRef} position={[0, 0.75, 0]}>
        <mesh position={[0, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.20, 0.25, 0.18, 16]} />
          <meshToonMaterial 
            color={crownColor}
            emissive={crownColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {[-0.12, 0, 0.12].map((xOffset, i) => (
          <mesh 
            key={`crown-point-${i}`}
            position={[xOffset, 0.45, 0]} 
            castShadow
          >
            <coneGeometry args={[0.06, 0.12, 8]} />
            <meshToonMaterial 
              color={crownColor}
              emissive={crownColor}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
        
        <mesh position={[0, 0.35, 0.22]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshToonMaterial 
            color={gemColor}
            emissive={gemColor}
            emissiveIntensity={0.6}
          />
        </mesh>
        
        <mesh position={[0, 0.05, 0.08]} castShadow>
          <sphereGeometry args={[0.30, 32, 24]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        <mesh position={[0, 0.12, -0.12]} castShadow>
          <sphereGeometry args={[0.32, 32, 24]} />
          <meshToonMaterial color={hairColor} />
        </mesh>
        
        {[-0.32, 0.32].map((xOffset, i) => (
          <mesh 
            key={`hair-curl-${i}`}
            position={[xOffset, -0.05, 0]} 
            castShadow
          >
            <sphereGeometry args={[0.15, 16, 12]} />
            <meshToonMaterial color={hairColor} />
          </mesh>
        ))}
        
        <mesh position={[0, -0.15, -0.08]} castShadow>
          <capsuleGeometry args={[0.18, 0.5, 12, 16]} />
          <meshToonMaterial color={hairColor} />
        </mesh>
        
        <mesh position={[-0.10, 0.08, 0.30]} castShadow>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FF69B4" : "#4169E1"} />
        </mesh>
        <mesh position={[0.10, 0.08, 0.30]} castShadow>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FF69B4" : "#4169E1"} />
        </mesh>
        
        <mesh position={[-0.10, 0.08, 0.33]} castShadow>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.10, 0.08, 0.33]} castShadow>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        <mesh position={[-0.08, 0.11, 0.34]} castShadow>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.12, 0.11, 0.34]} castShadow>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        
        <mesh position={[0, -0.02, 0.28]} castShadow>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshToonMaterial color="#FFB6C1" />
        </mesh>
        
        <mesh position={[0, -0.08, 0.30]} castShadow>
          <sphereGeometry args={[0.04, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#FF69B4" />
        </mesh>
        
        {[-0.22, 0.22].map((xOffset, i) => (
          <mesh 
            key={`blush-${i}`}
            position={[xOffset, 0.0, 0.22]} 
            castShadow
          >
            <sphereGeometry args={[0.06, 12, 10]} />
            <meshToonMaterial 
              color="#FFB6C1"
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}
        
        {[-0.25, 0.25].map((xOffset, i) => (
          <mesh 
            key={`earring-${i}`}
            position={[xOffset, -0.02, 0.15]} 
            castShadow
          >
            <sphereGeometry args={[0.04, 12, 10]} />
            <meshToonMaterial 
              color={gemColor}
              emissive={gemColor}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
      
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.30, 0.28, 0.45, 16]} />
        <meshToonMaterial 
          color={dressColor}
          emissive={dressColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.60, 16]} />
        <meshToonMaterial 
          color={dressColor}
          emissive={dressColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, -0.08, 0]} castShadow>
        <torusGeometry args={[0.32, 0.04, 8, 24]} />
        <meshToonMaterial color="#FFFFFF" />
      </mesh>
      
      <mesh position={[0, 0.18, 0.28]} castShadow>
        <sphereGeometry args={[0.08, 12, 10]} />
        <meshToonMaterial 
          color={gemColor}
          emissive={gemColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      <group ref={leftArmRef} position={[-0.35, 0.25, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.30, 12, 16]} />
          <meshToonMaterial color={dressColor} />
        </mesh>
        <mesh position={[-0.12, -0.08, 0]} castShadow>
          <sphereGeometry args={[0.12, 12, 10]} />
          <meshToonMaterial color={dressColor} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        <mesh position={[0, -0.38, 0]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.35, 0.25, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.30, 12, 16]} />
          <meshToonMaterial color={dressColor} />
        </mesh>
        <mesh position={[0.12, -0.08, 0]} castShadow>
          <sphereGeometry args={[0.12, 12, 10]} />
          <meshToonMaterial color={dressColor} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        <mesh position={[0, -0.38, 0]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      <group ref={leftLegRef} position={[-0.15, -0.65, 0]}>
        <mesh position={[0, -0.08, 0.05]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.18]} />
          <meshToonMaterial color="#FF69B4" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.15, -0.65, 0]}>
        <mesh position={[0, -0.08, 0.05]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.18]} />
          <meshToonMaterial color="#FF69B4" />
        </mesh>
      </group>
      
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.5}>
          <sphereGeometry args={[1.0, 16, 12]} />
          <meshBasicMaterial 
            color="#FF69B4"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {emotionIntensity > 0.3 && (
        <>
          {[0, 1, 2].map((i) => (
            <mesh 
              key={`heart-${i}`}
              position={[
                Math.cos(animTime * 3 + i * Math.PI * 0.67) * 0.6,
                0.9 + Math.sin(animTime * 5 + i) * 0.2,
                Math.sin(animTime * 3 + i * Math.PI * 0.67) * 0.4
              ]}
              scale={0.1 + emotionIntensity * 0.05}
            >
              <sphereGeometry args={[1, 12, 10]} />
              <meshToonMaterial 
                color="#FF69B4"
                emissive="#FF69B4"
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
