import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface MarloModelProps {
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

export default function MarloModel({
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
}: MarloModelProps) {
  
  // MARLO - Classic Mario-style Plumber
  const primaryColor = "#FF6B6B"; // Lighter red than original Mario
  const secondaryColor = "#4ECDC4"; // Teal instead of blue
  const accentColor = "#FFD700"; // Gold
  const skinColor = "#FDBCB4"; // Peach skin
  
  return (
    <group ref={bodyRef} position={[0, 0.4, 0]}>
      {/* HEAD GROUP */}
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* ICONIC RED CAP */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.55, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Cap brim */}
        <mesh position={[0, 0.15, 0.4]} rotation={[-Math.PI / 12, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.55, 0.08, 32]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* "M" Emblem on cap */}
        <mesh position={[0, 0.25, 0.5]} castShadow>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        {/* M letter - left stroke */}
        <mesh position={[-0.08, 0.25, 0.51]} castShadow>
          <boxGeometry args={[0.04, 0.18, 0.02]} />
          <meshBasicMaterial color={primaryColor} />
        </mesh>
        {/* M letter - diagonal left */}
        <mesh position={[-0.04, 0.28, 0.51]} rotation={[0, 0, -Math.PI / 6]} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.02]} />
          <meshBasicMaterial color={primaryColor} />
        </mesh>
        {/* M letter - diagonal right */}
        <mesh position={[0.04, 0.28, 0.51]} rotation={[0, 0, Math.PI / 6]} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.02]} />
          <meshBasicMaterial color={primaryColor} />
        </mesh>
        {/* M letter - right stroke */}
        <mesh position={[0.08, 0.25, 0.51]} castShadow>
          <boxGeometry args={[0.04, 0.18, 0.02]} />
          <meshBasicMaterial color={primaryColor} />
        </mesh>
        
        {/* Head - round */}
        <mesh position={[0, -0.05, 0.15]} castShadow>
          <sphereGeometry args={[0.40, 32, 24]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        
        {/* Big round nose */}
        <mesh position={[0, -0.08, 0.48]} castShadow>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshToonMaterial color="#FF9999" />
        </mesh>
        
        {/* LARGE EXPRESSIVE EYES */}
        <mesh position={[-0.12, 0.05, 0.45]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : "#2E86DE"} />
        </mesh>
        <mesh position={[0.12, 0.05, 0.45]} castShadow>
          <sphereGeometry args={[0.10, 16, 12]} />
          <meshBasicMaterial color={hitAnim > 0 ? "#FFFF00" : "#2E86DE"} />
        </mesh>
        
        {/* Pupils */}
        <mesh position={[-0.12, 0.05, 0.48]} castShadow>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.12, 0.05, 0.48]} castShadow>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        {/* Eye shine */}
        <mesh position={[-0.10, 0.08, 0.49]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.14, 0.08, 0.49]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        
        {/* ICONIC BLACK MUSTACHE */}
        <mesh position={[-0.18, -0.12, 0.42]} castShadow>
          <sphereGeometry args={[0.12, 16, 12, 0, Math.PI, 0, Math.PI / 2]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.18, -0.12, 0.42]} castShadow>
          <sphereGeometry args={[0.12, 16, 12, 0, Math.PI, 0, Math.PI / 2]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
        
        {/* Sideburns */}
        <mesh position={[-0.38, -0.08, 0.18]} castShadow>
          <sphereGeometry args={[0.08, 12, 10]} />
          <meshToonMaterial color="#654321" />
        </mesh>
        <mesh position={[0.38, -0.08, 0.18]} castShadow>
          <sphereGeometry args={[0.08, 12, 10]} />
          <meshToonMaterial color="#654321" />
        </mesh>
      </group>
      
      {/* BODY - Overalls */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.75, 0.95, 0.52]} />
        <meshToonMaterial 
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Overalls straps */}
      <mesh position={[-0.17, 0.25, 0.27]} castShadow>
        <boxGeometry args={[0.14, 0.55, 0.02]} />
        <meshToonMaterial color={secondaryColor} />
      </mesh>
      <mesh position={[0.17, 0.25, 0.27]} castShadow>
        <boxGeometry args={[0.14, 0.55, 0.02]} />
        <meshToonMaterial color={secondaryColor} />
      </mesh>
      
      {/* Gold buttons on straps */}
      <mesh position={[-0.17, 0.35, 0.28]} castShadow>
        <sphereGeometry args={[0.06, 16, 12]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh position={[0.17, 0.35, 0.28]} castShadow>
        <sphereGeometry args={[0.06, 16, 12]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.7}
        />
      </mesh>
      
      {/* Red shirt under overalls */}
      <mesh position={[0, 0.18, 0.26]} castShadow>
        <boxGeometry args={[0.58, 0.38, 0.02]} />
        <meshToonMaterial color={primaryColor} />
      </mesh>
      
      {/* Belt */}
      <mesh position={[0, -0.52, 0]} castShadow>
        <boxGeometry args={[0.78, 0.14, 0.54]} />
        <meshToonMaterial color="#654321" />
      </mesh>
      <mesh position={[0, -0.52, 0.28]} castShadow>
        <boxGeometry args={[0.20, 0.16, 0.02]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* ARMS - WHITE GLOVES */}
      <group ref={leftArmRef} position={[-0.52, 0.15, 0]}>
        {/* Shoulder */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Upper arm - red shirt */}
        <mesh position={[0, -0.18, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.32, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Forearm - skin */}
        <mesh position={[0, -0.50, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.32, 12, 16]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        {/* WHITE GLOVE */}
        <mesh position={[0, -0.78, 0]} castShadow>
          <boxGeometry args={[0.24, 0.26, 0.22]} />
          <meshToonMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Glove cuff */}
        <mesh position={[0, -0.66, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.12, 0.08, 16]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.52, 0.15, 0]}>
        {/* Shoulder */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Upper arm */}
        <mesh position={[0, -0.18, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.32, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.50, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.32, 12, 16]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        {/* WHITE GLOVE */}
        <mesh position={[0, -0.78, 0]} castShadow>
          <boxGeometry args={[0.24, 0.26, 0.22]} />
          <meshToonMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Glove cuff */}
        <mesh position={[0, -0.66, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.12, 0.08, 16]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {/* LEGS - Overalls */}
      <group ref={leftLegRef} position={[-0.22, -0.72, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.52, 12, 16]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* Knee */}
        <mesh position={[0, -0.38, 0]} castShadow>
          <sphereGeometry args={[0.17, 16, 12]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.68, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.48, 12, 16]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* BIG RED BOOT */}
        <mesh position={[0, -1.02, 0.14]} castShadow>
          <boxGeometry args={[0.34, 0.40, 0.58]} />
          <meshToonMaterial 
            color="#8B4513"
            emissive="#8B4513"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Boot sole */}
        <mesh position={[0, -1.23, 0.16]} castShadow>
          <boxGeometry args={[0.36, 0.06, 0.62]} />
          <meshToonMaterial color="#654321" />
        </mesh>
        {/* Boot trim */}
        <mesh position={[0, -0.92, 0.14]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.08, 16]} />
          <meshToonMaterial color="#654321" />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.22, -0.72, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.52, 12, 16]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* Knee */}
        <mesh position={[0, -0.38, 0]} castShadow>
          <sphereGeometry args={[0.17, 16, 12]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.68, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.48, 12, 16]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* BIG RED BOOT */}
        <mesh position={[0, -1.02, 0.14]} castShadow>
          <boxGeometry args={[0.34, 0.40, 0.58]} />
          <meshToonMaterial 
            color="#8B4513"
            emissive="#8B4513"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Boot sole */}
        <mesh position={[0, -1.23, 0.16]} castShadow>
          <boxGeometry args={[0.36, 0.06, 0.62]} />
          <meshToonMaterial color="#654321" />
        </mesh>
        {/* Boot trim */}
        <mesh position={[0, -0.92, 0.14]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.08, 16]} />
          <meshToonMaterial color="#654321" />
        </mesh>
      </group>
      
      {/* Power-up glow when excited */}
      {emotionIntensity > 0.5 && (
        <mesh position={[0, 0, 0]} scale={1.3}>
          <sphereGeometry args={[0.8, 24, 18]} />
          <meshBasicMaterial 
            color="#FFD700"
            transparent
            opacity={emotionIntensity * 0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      
      {/* Invulnerability flash */}
      {isInvulnerable && (
        <mesh position={[0, 0, 0]} scale={1.5}>
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
