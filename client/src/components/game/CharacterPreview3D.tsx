import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Fighter } from "../../lib/characters";
import JaxonModel from "./models/JaxonModel";
import KaisonModel from "./models/KaisonModel";
import { Group } from "three";

interface CharacterPreview3DProps {
  fighter: Fighter;
}

export default function CharacterPreview3D({ fighter }: CharacterPreview3DProps) {
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);

  const renderCharacterModel = () => {
    const modelProps = {
      bodyRef,
      headRef,
      leftArmRef,
      rightArmRef,
      leftLegRef,
      rightLegRef,
      emotionIntensity: 0.5,
      hitAnim: 0,
      animTime: 0,
      isAttacking: false,
      isInvulnerable: false
    };

    if (fighter.id === 'jaxon') {
      return <JaxonModel {...modelProps} />;
    } else if (fighter.id === 'kaison') {
      return <KaisonModel {...modelProps} />;
    }

    // Generic preview for other fighters
    return (
      <group ref={bodyRef} position={[0, 0.4, 0]}>
        <group ref={headRef} position={[0, 0.6, 0]}>
          {/* Head */}
          <mesh castShadow>
            <sphereGeometry args={[0.4, 32, 24]} />
            <meshToonMaterial color={fighter.color} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.12, 0.05, 0.35]} castShadow>
            <sphereGeometry args={[0.08, 16, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.12, 0.05, 0.35]} castShadow>
            <sphereGeometry args={[0.08, 16, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
        
        {/* Body */}
        <mesh position={[0, -0.1, 0]} castShadow>
          <boxGeometry args={[0.7, 0.9, 0.5]} />
          <meshToonMaterial color={fighter.accentColor} />
        </mesh>
        
        {/* Arms */}
        <group ref={leftArmRef} position={[-0.5, 0.1, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.7, 12, 16]} />
            <meshToonMaterial color={fighter.color} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.5, 0.1, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.7, 12, 16]} />
            <meshToonMaterial color={fighter.color} />
          </mesh>
        </group>
        
        {/* Legs */}
        <group ref={leftLegRef} position={[-0.2, -0.7, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.14, 0.8, 12, 16]} />
            <meshToonMaterial color={fighter.color} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.2, -0.7, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.14, 0.8, 12, 16]} />
            <meshToonMaterial color={fighter.color} />
          </mesh>
        </group>
      </group>
    );
  };

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [0, 1.5, 4],
          fov: 50
        }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#1a1a2e"]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color={fighter.accentColor} />
        
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            {renderCharacterModel()}
          </group>
          
          {/* Ground shadow plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.3} />
          </mesh>
          
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
