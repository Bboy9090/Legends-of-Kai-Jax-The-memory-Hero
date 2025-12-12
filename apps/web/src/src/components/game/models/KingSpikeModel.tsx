import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface KingSpikeModelProps {
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

export default function KingSpikeModel({
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
}: KingSpikeModelProps) {
  
  // KING SPIKE - Bowser-style turtle king
  const primaryColor = "#E67E22"; // Orange
  const accentColor = "#8E44AD"; // Purple
  const shellColor = "#2ECC71"; // Green shell
  const skinColor = "#F39C12"; // Yellow-orange
  
  return (
    <group ref={bodyRef} position={[0, 0.5, 0]}>
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* Big head */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.50, 32, 24]} />
          <meshToonMaterial 
            color={skinColor}
            emissive={skinColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* SPIKY HAIR - fire red */}
        {[-0.30, -0.15, 0, 0.15, 0.30].map((xOffset, i) => (
          <mesh 
            key={`spike-${i}`}
            position={[xOffset, 0.35, -0.20]} 
            rotation={[Math.PI / 3, 0, xOffset * 0.3]}
            castShadow
          >
            <coneGeometry args={[0.12, 0.40, 8]} />
            <meshToonMaterial 
              color="#E74C3C"
              emissive="#FF6B6B"
              emissiveIntensity={0.5 + emotionIntensity * 0.4}
            />
          </mesh>
        ))}
        
        {/* HORNS */}
        <mesh position={[-0.35, 0.25, 0.10]} rotation={[0, -Math.PI / 4, -Math.PI / 3]} castShadow>
          <coneGeometry args={[0.10, 0.35, 8]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.35, 0.25, 0.10]} rotation={[0, Math.PI / 4, Math.PI / 3]} castShadow>
          <coneGeometry args={[0.10, 0.35, 8]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        
        {/* ANGRY EYES */}
        <mesh position={[-0.15, 0.08, 0.42]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FF0000" : "#FFFFFF"} />
        </mesh>
        <mesh position={[0.15, 0.08, 0.42]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FF0000" : "#FFFFFF"} />
        </mesh>
        
        {/* Red pupils */}
        <mesh position={[-0.15, 0.08, 0.45]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshBasicMaterial color="#DC143C" />
        </mesh>
        <mesh position={[0.15, 0.08, 0.45]} castShadow>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshBasicMaterial color="#DC143C" />
        </mesh>
        
        {/* Angry eyebrows */}
        <mesh position={[-0.15, 0.20, 0.45]} rotation={[0, 0, -Math.PI / 6]} castShadow>
          <boxGeometry args={[0.18, 0.04, 0.02]} />
          <meshToonMaterial color="#654321" />
        </mesh>
        <mesh position={[0.15, 0.20, 0.45]} rotation={[0, 0, Math.PI / 6]} castShadow>
          <boxGeometry args={[0.18, 0.04, 0.02]} />
          <meshToonMaterial color="#654321" />
        </mesh>
        
        {/* Big snout/mouth */}
        <mesh position={[0, -0.15, 0.40]} castShadow>
          <boxGeometry args={[0.35, 0.20, 0.25]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        {/* FANGS */}
        <mesh position={[-0.12, -0.20, 0.50]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.06, 0.15, 8]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.12, -0.20, 0.50]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.06, 0.15, 8]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Fire breath */}
        {emotionIntensity > 0.6 && (
          <>
            {[0, 1, 2].map((i) => (
              <mesh 
                key={`fire-${i}`}
                position={[
                  Math.sin(animTime * 10 + i) * 0.15,
                  -0.25,
                  0.55 + i * 0.15
                ]}
                scale={[0.15 - i * 0.03, 0.15 - i * 0.03, 0.20]}
              >
                <sphereGeometry args={[1, 8, 6]} />
                <meshBasicMaterial 
                  color={i === 0 ? "#FFFF00" : "#FF6B00"}
                  transparent
                  opacity={0.8 - i * 0.2}
                />
              </mesh>
            ))}
          </>
        )}
      </group>
      
      {/* TURTLE SHELL on back */}
      <mesh position={[0, 0.1, -0.35]} rotation={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.50, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
        <meshToonMaterial 
          color={shellColor}
          emissive={shellColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Shell spikes */}
      {[-0.25, 0, 0.25].map((xOffset, i) => (
        <mesh 
          key={`shell-spike-${i}`}
          position={[xOffset, 0.48, -0.40]} 
          rotation={[0, 0, 0]}
          castShadow
        >
          <coneGeometry args={[0.12, 0.25, 6]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      ))}
      
      {/* Body - orange */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.85, 0.95, 0.65]} />
        <meshToonMaterial 
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Belly scales */}
      <mesh position={[0, -0.05, 0.35]} castShadow>
        <sphereGeometry args={[0.40, 32, 24]} />
        <meshToonMaterial color={skinColor} />
      </mesh>
      
      {/* SPIKED WRISTBANDS */}
      <group ref={leftArmRef} position={[-0.58, 0.15, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.55, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Spiked band */}
        <mesh position={[0, -0.50, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.15, 16]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh 
            key={`spike-${i}`}
            position={[
              Math.cos(i * Math.PI / 2) * 0.18,
              -0.50,
              Math.sin(i * Math.PI / 2) * 0.18
            ]}
            rotation={[0, 0, i * Math.PI / 2]}
            castShadow
          >
            <coneGeometry args={[0.06, 0.15, 6]} />
            <meshToonMaterial color="#CCCCCC" />
          </mesh>
        ))}
        {/* Big claw hand */}
        <mesh position={[0, -0.80, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.58, 0.15, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.55, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Spiked band */}
        <mesh position={[0, -0.50, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.15, 16]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh 
            key={`spike-${i}`}
            position={[
              Math.cos(i * Math.PI / 2) * 0.18,
              -0.50,
              Math.sin(i * Math.PI / 2) * 0.18
            ]}
            rotation={[0, 0, i * Math.PI / 2]}
            castShadow
          >
            <coneGeometry args={[0.06, 0.15, 6]} />
            <meshToonMaterial color="#CCCCCC" />
          </mesh>
        ))}
        {/* Big claw hand */}
        <mesh position={[0, -0.80, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
      </group>
      
      {/* LEGS */}
      <group ref={leftLegRef} position={[-0.28, -0.75, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.48, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Clawed foot */}
        <mesh position={[0, -0.65, 0.12]} castShadow>
          <sphereGeometry args={[0.20, 16, 12]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.28, -0.75, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.48, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Clawed foot */}
        <mesh position={[0, -0.65, 0.12]} castShadow>
          <sphereGeometry args={[0.20, 16, 12]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
      </group>
      
      {/* Power aura */}
      {emotionIntensity > 0.5 && (
        <mesh position={[0, 0, 0]} scale={1.4}>
          <sphereGeometry args={[0.9, 24, 18]} />
          <meshBasicMaterial 
            color="#E74C3C"
            transparent
            opacity={emotionIntensity * 0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.6}>
          <sphereGeometry args={[1.0, 16, 12]} />
          <meshBasicMaterial 
            color="#FFFFFF"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
