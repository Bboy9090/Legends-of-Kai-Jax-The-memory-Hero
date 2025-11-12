import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Group } from "three";

interface JaxonModelProps {
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

export default function JaxonModel({
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
}: JaxonModelProps) {
  
  // JAXON - Mario + Shadow Fusion
  // Red cap, black spiky quills, dark energy, edgy hero
  const primaryColor = "#DC143C"; // Deep crimson red
  const secondaryColor = "#1a1a1a"; // Dark black
  const glowColor = "#FF4500"; // Fire orange-red
  const accentColor = "#FFD700"; // Gold
  
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
        
        {/* "J" Emblem on cap */}
        <mesh position={[0, 0.25, 0.5]} castShadow>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.25, 0.51]} castShadow>
          <boxGeometry args={[0.08, 0.18, 0.02]} />
          <meshBasicMaterial color={primaryColor} />
        </mesh>
        
        {/* MASSIVE SHADOW-STYLE BLACK SPIKY QUILLS - Angular and edgy! */}
        {/* Back quills - 5 HUGE angular spikes forming Shadow's iconic look */}
        {[-0.40, -0.20, 0, 0.20, 0.40].map((xOffset, i) => (
          <mesh 
            key={`quill-${i}`}
            position={[xOffset, 0.20, -0.48]} 
            rotation={[Math.PI / 2.8, 0, xOffset * 0.4]}
            castShadow
          >
            <coneGeometry args={[0.16, 0.70, 6]} />
            <meshToonMaterial 
              color={secondaryColor}
              emissive="#FF0000"
              emissiveIntensity={0.3 + emotionIntensity * 0.6}
            />
          </mesh>
        ))}
        
        {/* Side quills - Angular and sharp! */}
        <mesh position={[-0.52, 0.10, -0.25]} rotation={[0, -Math.PI / 6, -Math.PI / 2.2]} castShadow>
          <coneGeometry args={[0.14, 0.60, 6]} />
          <meshToonMaterial 
            color={secondaryColor}
            emissive="#FF0000"
            emissiveIntensity={0.25 + emotionIntensity * 0.5}
          />
        </mesh>
        <mesh position={[0.52, 0.10, -0.25]} rotation={[0, Math.PI / 6, Math.PI / 2.2]} castShadow>
          <coneGeometry args={[0.14, 0.60, 6]} />
          <meshToonMaterial 
            color={secondaryColor}
            emissive="#FF0000"
            emissiveIntensity={0.25 + emotionIntensity * 0.5}
          />
        </mesh>
        
        {/* HEDGEHOG EARS - Darker, edgier */}
        <mesh position={[-0.35, 0.28, 0.12]} rotation={[0, -Math.PI / 6, Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshToonMaterial 
            color={secondaryColor}
            emissive="#8B0000"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0.35, 0.28, 0.12]} rotation={[0, Math.PI / 6, -Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshToonMaterial 
            color={secondaryColor}
            emissive="#8B0000"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Inner ear - dark red */}
        <mesh position={[-0.35, 0.28, 0.17]} rotation={[0, -Math.PI / 6, Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.10, 12, 10]} />
          <meshToonMaterial color="#8B0000" />
        </mesh>
        <mesh position={[0.35, 0.28, 0.17]} rotation={[0, Math.PI / 6, -Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.10, 12, 10]} />
          <meshToonMaterial color="#8B0000" />
        </mesh>
        
        {/* Face - tan/peach skin tone */}
        <mesh position={[0, -0.05, 0.25]} castShadow>
          <sphereGeometry args={[0.35, 32, 24, 0, Math.PI * 2, Math.PI / 4, Math.PI / 2]} />
          <meshToonMaterial color="#FDBCB4" />
        </mesh>
        
        {/* INTENSE GLOWING EYES - Shadow's red eyes + determination */}
        <mesh position={[-0.12, 0.05, 0.48]} castShadow>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshBasicMaterial 
            color={hitAnim > 0 ? "#FF0000" : "#8B4513"}
          />
        </mesh>
        <mesh position={[0.12, 0.05, 0.48]} castShadow>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshBasicMaterial 
            color={hitAnim > 0 ? "#FF0000" : "#8B4513"}
          />
        </mesh>
        
        {/* Eye glow when emotional/attacking */}
        {emotionIntensity > 0.3 && (
          <>
            <mesh position={[-0.12, 0.05, 0.5]} scale={1.2 + emotionIntensity * 0.3}>
              <sphereGeometry args={[0.08, 16, 12]} />
              <meshBasicMaterial 
                color={glowColor}
                transparent
                opacity={emotionIntensity * 0.7}
              />
            </mesh>
            <mesh position={[0.12, 0.05, 0.5]} scale={1.2 + emotionIntensity * 0.3}>
              <sphereGeometry args={[0.08, 16, 12]} />
              <meshBasicMaterial 
                color={glowColor}
                transparent
                opacity={emotionIntensity * 0.7}
              />
            </mesh>
          </>
        )}
        
        {/* Mario-style mustache */}
        <mesh position={[0, -0.08, 0.48]} castShadow>
          <boxGeometry args={[0.25, 0.05, 0.08]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        
        {/* DARK ENERGY AURA - Shadow's chaos energy */}
        {emotionIntensity > 0.5 && (
          <mesh scale={1.3 + Math.sin(animTime * 10) * 0.15}>
            <sphereGeometry args={[0.5, 16, 12]} />
            <meshBasicMaterial 
              color={glowColor}
              transparent
              opacity={emotionIntensity * 0.4}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>
      
      {/* BODY - Mario's overalls with Shadow's edgy style */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.5]} />
        <meshToonMaterial 
          color="#0047AB"
          emissive="#000066"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Overalls straps */}
      <mesh position={[-0.15, 0.2, 0.26]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.02]} />
        <meshToonMaterial color="#0047AB" />
      </mesh>
      <mesh position={[0.15, 0.2, 0.26]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.02]} />
        <meshToonMaterial color="#0047AB" />
      </mesh>
      
      {/* Gold buckles on straps */}
      <mesh position={[-0.15, 0.3, 0.27]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.02]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh position={[0.15, 0.3, 0.27]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.02]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.6}
        />
      </mesh>
      
      {/* Red shirt under overalls */}
      <mesh position={[0, 0.15, 0.25]} castShadow>
        <boxGeometry args={[0.55, 0.35, 0.02]} />
        <meshToonMaterial color={primaryColor} />
      </mesh>
      
      {/* Power emblem - fusion symbol */}
      <mesh position={[0, 0, 0.27]} castShadow>
        <sphereGeometry args={[0.15, 16, 12]} />
        <meshBasicMaterial 
          color={glowColor}
        />
      </mesh>
      
      {/* Belt */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[0.75, 0.12, 0.52]} />
        <meshToonMaterial color={secondaryColor} />
      </mesh>
      <mesh position={[0, -0.5, 0.27]} castShadow>
        <boxGeometry args={[0.18, 0.15, 0.02]} />
        <meshToonMaterial 
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* ARMS - WHITE GLOVES (iconic!) */}
      <group ref={leftArmRef} position={[-0.5, 0.1, 0]}>
        {/* Shoulder */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.20, 16, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Upper arm - red shirt */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.35, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.55, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.35, 12, 16]} />
          <meshToonMaterial color="#FDBCB4" />
        </mesh>
        {/* WHITE GLOVE */}
        <mesh position={[0, -0.85, 0]} castShadow>
          <boxGeometry args={[0.22, 0.28, 0.20]} />
          <meshToonMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Glove cuff */}
        <mesh position={[0, -0.72, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.08, 16]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.5, 0.1, 0]}>
        {/* Shoulder */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.20, 16, 12]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Upper arm */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.11, 0.35, 12, 16]} />
          <meshToonMaterial color={primaryColor} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.55, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.35, 12, 16]} />
          <meshToonMaterial color="#FDBCB4" />
        </mesh>
        {/* WHITE GLOVE */}
        <mesh position={[0, -0.85, 0]} castShadow>
          <boxGeometry args={[0.22, 0.28, 0.20]} />
          <meshToonMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Glove cuff */}
        <mesh position={[0, -0.72, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.08, 16]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {/* LEGS - Blue overalls */}
      <group ref={leftLegRef} position={[-0.2, -0.7, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.5, 12, 16]} />
          <meshToonMaterial color="#0047AB" />
        </mesh>
        {/* Knee */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshToonMaterial color="#0047AB" />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.65, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.45, 12, 16]} />
          <meshToonMaterial color="#0047AB" />
        </mesh>
        {/* ICONIC RED BOOT with gold accents */}
        <mesh position={[0, -1.0, 0.12]} castShadow>
          <boxGeometry args={[0.32, 0.38, 0.55]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Boot sole */}
        <mesh position={[0, -1.19, 0.15]} castShadow>
          <boxGeometry args={[0.34, 0.05, 0.60]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* Gold trim */}
        <mesh position={[0, -0.95, 0.12]} castShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.08, 16]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      
      <group ref={rightLegRef} position={[0.2, -0.7, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.5, 12, 16]} />
          <meshToonMaterial color="#0047AB" />
        </mesh>
        {/* Knee */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshToonMaterial color="#0047AB" />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.65, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.45, 12, 16]} />
          <meshToonMaterial color="#0047AB" />
        </mesh>
        {/* ICONIC RED BOOT */}
        <mesh position={[0, -1.0, 0.12]} castShadow>
          <boxGeometry args={[0.32, 0.38, 0.55]} />
          <meshToonMaterial 
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Boot sole */}
        <mesh position={[0, -1.19, 0.15]} castShadow>
          <boxGeometry args={[0.34, 0.05, 0.60]} />
          <meshToonMaterial color={secondaryColor} />
        </mesh>
        {/* Gold trim */}
        <mesh position={[0, -0.95, 0.12]} castShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.08, 16]} />
          <meshToonMaterial 
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      
      {/* FIRE/DARK ENERGY AURA */}
      <mesh position={[0, 0, 0]} scale={1.3}>
        <sphereGeometry args={[0.8, 24, 18]} />
        <meshBasicMaterial 
          color={glowColor}
          transparent
          opacity={0.12 + emotionIntensity * 0.2}
          depthWrite={false}
        />
      </mesh>
      
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
