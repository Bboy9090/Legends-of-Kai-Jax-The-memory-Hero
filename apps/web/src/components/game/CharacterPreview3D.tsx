import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Fighter } from "../../lib/characters";
import JaxonModel from "./models/JaxonModel";
import KaisonModel from "./models/KaisonBeastModel";
import LegendaryKaiJaxModel from "./models/LegendaryKaiJaxModel";
import ProceduralBeastModel from "./models/ProceduralBeastModel";
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

    // Render specific character models
    switch (fighter.id) {
      case 'jaxon':
        return <JaxonModel {...modelProps} />;
      case 'kaison':
        return <KaisonModel {...modelProps} />;
      case 'kai-jax':
        return <LegendaryKaiJaxModel {...modelProps} velocityX={0} velocityY={0} health={100} />;
    }

    // Beastly fallback (no plain box/sphere humanoid)
    return <ProceduralBeastModel fighter={fighter} />;
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
