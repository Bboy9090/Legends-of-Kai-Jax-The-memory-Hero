import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface WisdomPrincessModelProps {
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

export default function WisdomPrincessModel({
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
}: WisdomPrincessModelProps) {
  
  const dressColor = "#9370DB";
  const accentColor = "#FFD700";
  const hairColor = "#8B4513";
  const skinColor = "#FFEFD5";
  const gemColor = "#00CED1";
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      <group ref={headRef} position={[0, 0.72, 0]}>
        <mesh position={[0, 0.28, 0.05]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.12, 16]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        
        <mesh position={[0, 0.35, 0.12]} castShadow>
          <octahedronGeometry args={[0.08, 0]} />
          <meshToonMaterial 
            color={gemColor}
            emissive={gemColor}
            emissiveIntensity={0.6}
          />
        </mesh>
        
        {[-0.12, 0.12].map((xOffset, i) => (
          <mesh 
            key={`crown-gem-${i}`}
            position={[xOffset, 0.32, 0.08]} 
            castShadow
          >
            <octahedronGeometry args={[0.05, 0]} />
            <meshToonMaterial 
              color={gemColor}
              emissive={gemColor}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
        
        <mesh position={[0, 0.05, 0.08]} castShadow>
          <sphereGeometry args={[0.28, 32, 24]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        <mesh position={[0, 0.12, -0.12]} castShadow>
          <sphereGeometry args={[0.30, 32, 24]} />
          <meshToonMaterial color={hairColor} />
        </mesh>
        
        {[-0.32, 0.32].map((xOffset, i) => (
          <mesh 
            key={`hair-side-${i}`}
            position={[xOffset, -0.05, 0]} 
            castShadow
          >
            <capsuleGeometry args={[0.08, 0.35, 12, 16]} />
            <meshToonMaterial color={hairColor} />
          </mesh>
        ))}
        
        <mesh position={[0, -0.25, -0.15]} castShadow>
          <capsuleGeometry args={[0.15, 0.60, 12, 16]} />
          <meshToonMaterial color={hairColor} />
        </mesh>
        
        {[-0.32, 0.32].map((xOffset, i) => (
          <mesh 
            key={`ear-${i}`}
            position={[xOffset, 0.0, 0.02]} 
            rotation={[0.1, i === 0 ? -0.6 : 0.6, 0]}
            castShadow
          >
            <coneGeometry args={[0.05, 0.18, 8]} />
            <meshToonMaterial color={skinColor} />
          </mesh>
        ))}
        
        <mesh position={[-0.10, 0.08, 0.28]} castShadow>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#9370DB" : "#4169E1"} />
        </mesh>
        <mesh position={[0.10, 0.08, 0.28]} castShadow>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#9370DB" : "#4169E1"} />
        </mesh>
        
        <mesh position={[-0.10, 0.08, 0.31]} castShadow>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.10, 0.08, 0.31]} castShadow>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        <mesh position={[-0.18, 0.05, 0.18]} castShadow>
          <boxGeometry args={[0.06, 0.02, 0.02]} />
          <meshToonMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.18, 0.05, 0.18]} castShadow>
          <boxGeometry args={[0.06, 0.02, 0.02]} />
          <meshToonMaterial color={hairColor} />
        </mesh>
        
        <mesh position={[0, -0.05, 0.28]} castShadow>
          <sphereGeometry args={[0.04, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#FF69B4" />
        </mesh>
      </group>
      
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.22, 0.40, 16]} />
        <meshToonMaterial 
          color={dressColor}
          emissive={dressColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, 0.12, 0.18]} castShadow>
        <boxGeometry args={[0.12, 0.25, 0.08]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[0, -0.30, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.55, 0.55, 16]} />
        <meshToonMaterial 
          color={dressColor}
          emissive={dressColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, -0.05, 0]} castShadow>
        <torusGeometry args={[0.28, 0.03, 8, 24]} />
        <meshToonMaterial color={accentColor} />
      </mesh>
      
      <mesh position={[0, 0.25, 0.20]} castShadow>
        <octahedronGeometry args={[0.06, 0]} />
        <meshToonMaterial 
          color={gemColor}
          emissive={gemColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      <group ref={leftArmRef} position={[-0.30, 0.22, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.25, 12, 16]} />
          <meshToonMaterial color={dressColor} />
        </mesh>
        <mesh position={[-0.10, -0.05, 0]} castShadow>
          <sphereGeometry args={[0.10, 12, 10]} />
          <meshToonMaterial color={dressColor} />
        </mesh>
        <mesh position={[0, -0.30, 0]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        {isAttacking && (
          <mesh position={[0, -0.40, 0.15]} castShadow>
            <sphereGeometry args={[0.15, 16, 12]} />
            <meshToonMaterial 
              color={gemColor}
              emissive={gemColor}
              emissiveIntensity={0.8}
              transparent
              opacity={0.8}
            />
          </mesh>
        )}
      </group>
      
      <group ref={rightArmRef} position={[0.30, 0.22, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.25, 12, 16]} />
          <meshToonMaterial color={dressColor} />
        </mesh>
        <mesh position={[0.10, -0.05, 0]} castShadow>
          <sphereGeometry args={[0.10, 12, 10]} />
          <meshToonMaterial color={dressColor} />
        </mesh>
        <mesh position={[0, -0.30, 0]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
      </group>
      
      <group ref={leftLegRef} position={[-0.15, -0.58, 0]}>
        <mesh position={[0, -0.05, 0.05]} castShadow>
          <boxGeometry args={[0.10, 0.06, 0.15]} />
          <meshToonMaterial color="#9370DB" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.15, -0.58, 0]}>
        <mesh position={[0, -0.05, 0.05]} castShadow>
          <boxGeometry args={[0.10, 0.06, 0.15]} />
          <meshToonMaterial color="#9370DB" />
        </mesh>
      </group>
      
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.5}>
          <sphereGeometry args={[1.0, 16, 12]} />
          <meshBasicMaterial 
            color="#9370DB"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {emotionIntensity > 0.4 && (
        <>
          {[0, 1, 2].map((i) => (
            <mesh 
              key={`triforce-${i}`}
              position={[
                Math.cos(animTime * 2 + i * Math.PI * 0.67) * 0.5,
                0.9 + Math.sin(animTime * 3 + i) * 0.15,
                Math.sin(animTime * 2 + i * Math.PI * 0.67) * 0.3
              ]}
              rotation={[0, animTime * 2, 0]}
              scale={0.08}
            >
              <coneGeometry args={[1, 1.5, 3]} />
              <meshToonMaterial 
                color="#FFD700"
                emissive="#FFD700"
                emissiveIntensity={0.8}
              />
            </mesh>
          ))}
        </>
      )}
      
      {isAttacking && (
        <mesh position={[0, 0.3, 0.5]} rotation={[0, 0, animTime * 10]}>
          <torusGeometry args={[0.25, 0.05, 8, 16]} />
          <meshToonMaterial 
            color={gemColor}
            emissive={gemColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
