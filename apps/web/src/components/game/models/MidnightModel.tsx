import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface MidnightModelProps {
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

export default function MidnightModel({
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
}: MidnightModelProps) {
  
  // MIDNIGHT - Shadow The Hedgehog (dark speedster)
  const primaryColor = "#2C3E50"; // Dark blue-gray
  const accentColor = "#E74C3C"; // Red
  const skinColor = "#FDBCB4"; // Peach
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* Dark head */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.5, 32, 24]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.15}
          />
        </mesh>
        
        {/* SHARP ANGULAR QUILLS - Shadow style */}
        {[-0.35, -0.15, 0.05, 0.25, 0.40].map((xOffset, i) => (
          <mesh 
            key={`quill-${i}`}
            position={[xOffset, 0.15, -0.45]} 
            rotation={[Math.PI / 2.9, 0, xOffset * 0.4]}
            castShadow
          >
            <coneGeometry args={[0.14, 0.65, 6]} />
            <meshToonMaterial 
              color={primaryColor}
              emissive={accentColor}
              emissiveIntensity={0.4 + emotionIntensity * 0.5}
            />
          </mesh>
        ))}
        
        {/* Side quills */}
        <mesh position={[-0.50, 0.08, -0.22]} rotation={[0, -Math.PI / 5, -Math.PI / 2.2]} castShadow>
          <coneGeometry args={[0.13, 0.58, 6]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={accentColor}
            emissiveIntensity={0.3 + emotionIntensity * 0.4}
          />
        </mesh>
        <mesh position={[0.50, 0.08, -0.22]} rotation={[0, Math.PI / 5, Math.PI / 2.2]} castShadow>
          <coneGeometry args={[0.13, 0.58, 6]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={accentColor}
            emissiveIntensity={0.3 + emotionIntensity * 0.4}
          />
        </mesh>
        
        {/* Face */}
        <mesh position={[0, -0.1, 0.35]} castShadow>
          <sphereGeometry args={[0.28, 32, 24]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        {/* GLOWING RED EYES */}
        <mesh position={[-0.10, 0.02, 0.48]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FF0000" : "#DC143C"} />
        </mesh>
        <mesh position={[0.10, 0.02, 0.48]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FF0000" : "#DC143C"} />
        </mesh>
        
        {/* Eye glow */}
        {emotionIntensity > 0.3 && (
          <>
            <mesh position={[-0.10, 0.02, 0.50]} scale={1.3 + emotionIntensity * 0.3}>
              <sphereGeometry args={[0.10, 16, 12]} />
              <meshBasicMaterial 
                color={accentColor}
                transparent
                opacity={emotionIntensity * 0.6}
              />
            </mesh>
            <mesh position={[0.10, 0.02, 0.50]} scale={1.3 + emotionIntensity * 0.3}>
              <sphereGeometry args={[0.10, 16, 12]} />
              <meshBasicMaterial 
                color={accentColor}
                transparent
                opacity={emotionIntensity * 0.6}
              />
            </mesh>
          </>
        )}
        
        {/* Serious frown */}
        <mesh position={[0, -0.18, 0.47]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.16, 0.02, 0.02]} />
          <meshToonMaterial color="#000000" />
        </mesh>
        
        {/* Chaos energy aura */}
        {emotionIntensity > 0.5 && (
          <mesh scale={1.2 + Math.sin(animTime * 10) * 0.15}>
            <sphereGeometry args={[0.5, 16, 12]} />
            <meshBasicMaterial 
              color={accentColor}
              transparent
              opacity={emotionIntensity * 0.35}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>
      
      {/* Body */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <sphereGeometry args={[0.42, 32, 24, 0, Math.PI * 2, 0, Math.PI]} />
        <meshToonMaterial color={primaryColor} />
      </mesh>
      <mesh position={[0, -0.05, 0.33]} castShadow>
        <sphereGeometry args={[0.33, 32, 24]} />
        <meshToonMaterial color={skinColor} />
      </mesh>
      
      {/* Arms */}
      <group ref={leftArmRef} position={[-0.38, 0.12, 0]}>
        <mesh position={[0, -0.30, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.42, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* White glove with red cuff */}
        <mesh position={[0, -0.58, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, -0.48, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.10, 0.08, 16]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.38, 0.12, 0]}>
        <mesh position={[0, -0.30, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.42, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* White glove with red cuff */}
        <mesh position={[0, -0.58, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, -0.48, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.10, 0.08, 16]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      
      {/* Legs */}
      <group ref={leftLegRef} position={[-0.17, -0.58, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.38, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Red and black shoes with jet engines */}
        <mesh position={[0, -0.52, 0.10]} castShadow>
          <boxGeometry args={[0.28, 0.32, 0.48]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, -0.52, -0.15]} castShadow>
          <cylinderGeometry args={[0.08, 0.10, 0.15, 16]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, -0.69, 0.12]} castShadow>
          <boxGeometry args={[0.30, 0.05, 0.52]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.17, -0.58, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.38, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Red and black shoes with jet engines */}
        <mesh position={[0, -0.52, 0.10]} castShadow>
          <boxGeometry args={[0.28, 0.32, 0.48]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, -0.52, -0.15]} castShadow>
          <cylinderGeometry args={[0.08, 0.10, 0.15, 16]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, -0.69, 0.12]} castShadow>
          <boxGeometry args={[0.30, 0.05, 0.52]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
      </group>
      
      {/* Dark chaos energy aura */}
      <mesh position={[0, 0, 0]} scale={1.2}>
        <sphereGeometry args={[0.7, 24, 18]} />
        <meshBasicMaterial 
          color={accentColor}
          transparent
          opacity={0.08 + emotionIntensity * 0.12}
          depthWrite={false}
        />
      </mesh>
      
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.4}>
          <sphereGeometry args={[0.9, 16, 12]} />
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
