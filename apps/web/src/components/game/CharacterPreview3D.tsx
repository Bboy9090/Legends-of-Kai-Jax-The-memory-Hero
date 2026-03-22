import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { Fighter } from "../../lib/characters";
import GLBCharacterModel from "./models/GLBCharacterModel";
import * as THREE from "three";
import CinematicPostFX from "./graphics/CinematicPostFX";
import { LegendaryLightingRig } from "./graphics/LegendaryGraphicsSystem";
import { getQualitySettings } from "../../lib/threejs/PerformanceOptimizer";

interface CharacterPreview3DProps {
  fighter: Fighter;
  preset?: string;
}

export default function CharacterPreview3D({ fighter }: CharacterPreview3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [0, 1.65, 6.4],
          fov: 42
        }}
        shadows
        onCreated={({ gl }) => {
          const q = getQualitySettings();
          gl.setPixelRatio(q.pixelRatio);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = q.shadowMap.type as THREE.ShadowMapType;
        }}
        gl={{ antialias: getQualitySettings().antialias, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#0b0b12"]} />

        <LegendaryLightingRig />
        <Environment preset="sunset" />
        <CinematicPostFX
          grade={fighter.id === "kai-jax" ? "cosmic" : fighter.id === "jaxon" ? "ice" : fighter.id === "kaison" ? "ember" : "neutral"}
          accent={fighter.accentColor || "#00f2ff"}
          punch={fighter.id === "kai-jax" ? 0.35 : 0.18}
          center={[0.5, 0.44]}
        />
        
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            <GLBCharacterModel
              fighterId={fighter.id}
              accentColor={fighter.accentColor}
              emotionIntensity={0.5}
            />
          </group>
          
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
